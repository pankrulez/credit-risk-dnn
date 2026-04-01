import sys
import re
import os
import traceback
import logging
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
from typing import Optional
from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
import numpy as np
import torch

from src.model import CreditRiskDNN
from src.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8501",
    "https://*.vercel.app",          # all Vercel preview + prod deployments
    "https://*.hf.space",            # HuggingFace Spaces
    os.getenv("FRONTEND_URL", ""),   # explicit Vercel URL from .env
]

VERCEL_PATTERN = re.compile(r"https://[\w-]+\.vercel\.app")
HF_PATTERN     = re.compile(r"https://[\w-]+\.hf\.space")

class DynamicCORSMiddleware(BaseHTTPMiddleware):
    """Handles wildcard patterns for Vercel preview URLs."""
    async def dispatch(self, request: Request, call_next):
        origin   = request.headers.get("origin", "")
        allowed  = (
            origin in ALLOWED_ORIGINS
            or bool(VERCEL_PATTERN.match(origin))
            or bool(HF_PATTERN.match(origin))
        )

        if request.method == "OPTIONS":
            # Handle CORS preflight
            headers = {
                "Access-Control-Allow-Origin":  origin if allowed else "",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age":       "86400",
            }
            from starlette.responses import Response
            return Response(status_code=200, headers=headers)

        response = await call_next(request)
        if allowed:
            response.headers["Access-Control-Allow-Origin"]  = origin
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response
    
app.add_middleware(DynamicCORSMiddleware)


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
        "status":         "healthy",
        "model_loaded":   "dnn" in model_store,
        "scaler_loaded":  "scaler" in model_store and model_store["scaler"] is not None,
        "n_features":     N_FEATURES,
        "dataset":        "Taiwan Credit Card Default (30K rows)"
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
    try:
        model  = model_store.get("dnn")
        scaler = model_store.get("scaler")

        if model is None:
            raise RuntimeError("Model not loaded.")

        features = list(payload.features)

        # ── Scale features server-side ────────────────────────────────
        if scaler is not None:
            import numpy as np
            features = scaler.transform([features])[0].tolist()
            logger.info(f"Scaled (first 5): {[round(f, 3) for f in features[:5]]}")
        else:
            logger.warning("⚠️ Scaler not found in model_store — check outputs/scaler.pkl")

        threshold = payload.threshold if payload.threshold is not None else 0.4
        logger.info(f"Features count: {len(features)} | Threshold: {threshold}")

        X = torch.tensor([features], dtype=torch.float32)

        with torch.no_grad():
            logit, attn_weights = model(X)
            prob = torch.sigmoid(logit).item()
            attn = attn_weights.squeeze().tolist()   # Python list — no numpy

        # Guard: squeeze() returns float scalar if batch=1 + single feature edge case
        if not isinstance(attn, list):
            attn = [float(attn)] * N_FEATURES

        logger.info(f"Prediction: {prob:.4f}")

        # ✅ sorted() works on plain Python list — no .argsort() needed
        top5_idx = sorted(range(len(attn)), key=lambda i: attn[i], reverse=True)[:5]
        top_feats = {
            DEFAULT_CREDIT_FEATURES[i]: round(float(attn[i]), 4)
            for i in top5_idx
        }

        return PredictionResponse(
            risk_probability       = round(prob, 4),
            risk_label             = "HIGH RISK" if prob >= threshold else "LOW RISK",
            risk_score             = int(round(prob * 100)),
            top_attention_features = top_feats,
            threshold_used         = threshold,
            model_version          = os.getenv("MODEL_VERSION", "DNN-v1.0")
        )

    except Exception as e:
        logger.error(traceback.format_exc())
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
            probs = torch.sigmoid(logits).cpu().tolist()

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
    
    
@app.get("/predict/test", tags=["Debug"])
def predict_test():
    try:
        model = model_store.get("dnn")
        if model is None:
            return {"status": "error", "detail": "Model not in model_store"}

        dummy = torch.zeros(1, N_FEATURES)
        with torch.no_grad():
            logit, attn = model(dummy)
            prob  = torch.sigmoid(logit).item()
            attn_list = attn.squeeze().tolist()   # ✅ .tolist()

        return {
            "status":       "ok",
            "test_prob":    round(prob, 4),
            "n_features":   N_FEATURES,
            "model_loaded": True,
            "attn_length":  len(attn_list) if isinstance(attn_list, list) else 1,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e), "trace": traceback.format_exc()}