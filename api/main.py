import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
from typing import Optional
import numpy as np
import torch

from src.model import CreditRiskDNN
from src.config import Config

# ── Feature schema for Taiwan Default Credit dataset (30K rows) ───────────────
DEFAULT_CREDIT_FEATURES = [
    "LIMIT_BAL",    # Credit limit amount
    "SEX",          # Gender (1=male, 2=female)
    "EDUCATION",    # Education (1=grad, 2=university, 3=high school, 4=other)
    "MARRIAGE",     # Marital status (1=married, 2=single, 3=other)
    "AGE",          # Age in years
    "PAY_0",        # Repayment status Sep (-1=paid duly, 1=delay 1 month, ...)
    "PAY_2",        # Repayment status Aug
    "PAY_3",        # Repayment status Jul
    "PAY_4",        # Repayment status Jun
    "PAY_5",        # Repayment status May
    "PAY_6",        # Repayment status Apr
    "BILL_AMT1",    # Bill statement Sep
    "BILL_AMT2",    # Bill statement Aug
    "BILL_AMT3",    # Bill statement Jul
    "BILL_AMT4",    # Bill statement Jun
    "BILL_AMT5",    # Bill statement May
    "BILL_AMT6",    # Bill statement Apr
    "PAY_AMT1",     # Amount paid Sep
    "PAY_AMT2",     # Amount paid Aug
    "PAY_AMT3",     # Amount paid Jul
    "PAY_AMT4",     # Amount paid Jun
    "PAY_AMT5",     # Amount paid May
    "PAY_AMT6",     # Amount paid Apr
]

N_FEATURES = len(DEFAULT_CREDIT_FEATURES)   # 23

# ── Global model state ────────────────────────────────────────────────────────
model_store: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model once at startup, clean up on shutdown."""
    model = CreditRiskDNN(n_features=N_FEATURES, dropout=0.3)
    model_path = os.path.join(
        os.path.dirname(__file__), '..', 'outputs', 'best_model.pth'
    )
    if not os.path.exists(model_path):
        raise RuntimeError(
            "Model weights not found at outputs/best_model.pth.\n"
            "Run: python main.py --model dnn --dataset default"
        )
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    model_store['dnn'] = model
    print("✅ Model loaded successfully.")
    yield
    model_store.clear()


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Credit Risk Assessment API",
    description=(
        "Deep Neural Network-powered credit default prediction with "
        "attention-based explainability. Trained on Taiwan Credit Card Default dataset."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        Config.FRONTEND_URL,          # Vercel frontend URL from .env
        "http://localhost:3000",       # Next.js dev server
        "http://localhost:8501",       # Streamlit dev server
        "https://*.vercel.app",        # all Vercel preview deployments
        "https://*.hf.space",          # HuggingFace Spaces
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ────────────────────────────────────────────────────────────────────
class ApplicantFeatures(BaseModel):
    features: list[float] = Field(
        ...,
        min_length=N_FEATURES,
        max_length=N_FEATURES,
        description=f"Exactly {N_FEATURES} pre-scaled feature values"
    )
    threshold: Optional[float] = Field(
        default=0.4,
        ge=0.0, le=1.0,
        description="Decision threshold (default 0.4 — optimized for recall)"
    )


class PredictionResponse(BaseModel):
    risk_probability:  float
    risk_label:        str
    risk_score:        int             # 0-100 scale for UI display
    top_attention_features: dict
    threshold_used:    float
    model_version:     str


class BatchRequest(BaseModel):
    applicants: list[ApplicantFeatures]


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "Credit Risk Assessment API is live 🚀",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status":       "healthy",
        "model_loaded": 'dnn' in model_store,
        "n_features":   N_FEATURES,
        "dataset":      "Taiwan Credit Card Default (30K rows)"
    }


@app.get("/features", tags=["Metadata"])
def get_features():
    """Returns the expected feature names and their order."""
    return {
        "features":    DEFAULT_CREDIT_FEATURES,
        "count":       N_FEATURES,
        "description": "Pre-scale all features using StandardScaler before sending"
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict(payload: ApplicantFeatures):
    """Single applicant credit risk prediction."""
    try:
        model = model_store['dnn']
        X = torch.tensor([payload.features], dtype=torch.float32)

        with torch.no_grad():
            logit, attn_weights = model(X)
            prob = torch.sigmoid(logit).item()

        # Attention-based top features
        attn     = attn_weights.squeeze().numpy()
        top5_idx = attn.argsort()[-5:][::-1]
        top_feats = {
            DEFAULT_CREDIT_FEATURES[i]: round(float(attn[i]), 4)
            for i in top5_idx
        }

        threshold = payload.threshold if payload.threshold is not None else 0.4
        risk_label = "HIGH RISK" if prob >= threshold else "LOW RISK"
        risk_score = int(round(prob * 100))

        return PredictionResponse(
            risk_probability       = round(prob, 4),
            risk_label             = risk_label,
            risk_score             = risk_score,
            top_attention_features = top_feats,
            threshold_used         = threshold,
            model_version          = "DNN-v1.0-DefaultCredit"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch", tags=["Inference"])
def predict_batch(payload: BatchRequest):
    """Batch prediction for multiple applicants."""
    if len(payload.applicants) > 500:
        raise HTTPException(
            status_code=400,
            detail="Batch size exceeds limit of 500. Split into smaller requests."
        )
    try:
        model    = model_store['dnn']
        features = [a.features for a in payload.applicants]
        X        = torch.tensor(features, dtype=torch.float32)

        with torch.no_grad():
            logits, _ = model(X)
            probs = torch.sigmoid(logits).cpu().numpy()

        results = []
        for i, (prob, applicant) in enumerate(zip(probs, payload.applicants)):
            threshold = applicant.threshold if applicant.threshold is not None else 0.4
            results.append({
                "applicant_index": i,
                "risk_probability": round(float(prob), 4),
                "risk_label": "HIGH RISK" if prob >= threshold else "LOW RISK",
                "risk_score": int(round(float(prob) * 100))
            })
        return {"predictions": results, "count": len(results)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))