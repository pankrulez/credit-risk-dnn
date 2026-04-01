# api/main.py

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
import pickle
import traceback
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

from src.model  import CreditRiskDNN
from src.config import Config
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from huggingface_hub import hf_hub_download

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
MODEL_FILE  = "best_model.pth"
SCALER_FILE = "scaler.pkl"
LOCAL_PATH  = os.path.join("outputs", MODEL_FILE)
SCALER_PATH = os.path.join("outputs", SCALER_FILE)

DEFAULT_CREDIT_FEATURES = [
    "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE",
    "PAY_0",     "PAY_2", "PAY_3",   "PAY_4",   "PAY_5", "PAY_6",
    "BILL_AMT1", "BILL_AMT2", "BILL_AMT3",
    "BILL_AMT4", "BILL_AMT5", "BILL_AMT6",
    "PAY_AMT1",  "PAY_AMT2",  "PAY_AMT3",
    "PAY_AMT4",  "PAY_AMT5",  "PAY_AMT6",
]
N_FEATURES = len(DEFAULT_CREDIT_FEATURES)   # 23

# ── Global model store ─────────────────────────────────────────────────────────
model_store: dict = {}


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("outputs", exist_ok=True)

    # ── Model weights ──────────────────────────────────────────────────
    if not os.path.exists(LOCAL_PATH):
        print(f"📥 Model not found at {LOCAL_PATH}. Downloading from HuggingFace Hub...")
        try:
            from huggingface_hub import hf_hub_download
            hf_hub_download(
                repo_id=os.getenv("HF_MODEL_REPO", ""),
                filename=MODEL_FILE,
                local_dir="outputs",
                token=os.getenv("HF_TOKEN", None)
            )
            print("✅ Model downloaded successfully.")
        except Exception as e:
            raise RuntimeError(
                f"Model weights not found at {LOCAL_PATH} and download failed: {e}\n"
                "Run: python main.py --model dnn --dataset default"
            )

    model = CreditRiskDNN(n_features=N_FEATURES, dropout=0.3)
    model.load_state_dict(torch.load(LOCAL_PATH, map_location="cpu"))
    model.eval()
    torch.set_num_threads(1)
    model_store["dnn"] = model
    print(f"✅ Model loaded from {LOCAL_PATH}")

    # ── Scaler ─────────────────────────────────────────────────────────
    print(f"🔍 Looking for scaler at: {os.path.abspath(SCALER_PATH)}")
    print(f"   outputs/ contents: {os.listdir('outputs')}")

    if os.path.exists(SCALER_PATH):
        with open(SCALER_PATH, "rb") as f:
            model_store["scaler"] = pickle.load(f)
        print(f"✅ Scaler loaded. mean_[0]={model_store['scaler'].mean_[0]:.2f}")
    else:
        model_store["scaler"] = None
        print("❌ scaler.pkl NOT FOUND — predictions will use unscaled features!")

    import gc; gc.collect()
    yield
    model_store.clear()


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Credit Risk Assessment API",
    description=(
        "Deep Neural Network-powered credit default prediction "
        "with attention-based explainability."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ────────────────────────────────────────────────────────────────────
class ApplicantFeatures(BaseModel):
    features:  list[float] = Field(
        ..., min_length=N_FEATURES, max_length=N_FEATURES,
        description=f"Exactly {N_FEATURES} raw (unscaled) feature values"
    )
    threshold: float = Field(default=0.4, ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    risk_probability:       float
    risk_label:             str
    risk_score:             int
    top_attention_features: dict
    threshold_used:         float
    model_version:          str


class BatchRequest(BaseModel):
    applicants: list[ApplicantFeatures]


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "status":  "ok",
        "message": "Credit Risk Assessment API is live 🚀",
        "docs":    "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    scaler = model_store.get("scaler")
    return {
        "status":        "healthy",
        "model_loaded":  "dnn" in model_store,
        "scaler_loaded": scaler is not None,
        "scaler_mean_0": round(float(scaler.mean_[0]), 2) if scaler is not None else None,
        "n_features":    N_FEATURES,
        "dataset":       "Taiwan Credit Card Default (30K rows)"
    }


@app.get("/features", tags=["Metadata"])
def get_features():
    return {
        "features":    DEFAULT_CREDIT_FEATURES,
        "count":       N_FEATURES,
        "description": "Send raw unscaled values — API handles StandardScaler internally"
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict(payload: ApplicantFeatures):
    try:
        model  = model_store.get("dnn")
        scaler = model_store.get("scaler")

        if model is None:
            raise RuntimeError("Model not loaded. Check startup logs.")

        features = list(payload.features)

        # ── Scale server-side ──────────────────────────────────────────
        if scaler is not None:
            import numpy as np
            features = scaler.transform([features])[0].tolist()
            logger.info(f"Scaled (first 5): {[round(f, 3) for f in features[:5]]}")
        else:
            logger.warning("⚠️ Scaler missing — using raw features.")

        logger.info(f"Features count: {len(features)} | Threshold: {payload.threshold}")

        X = torch.tensor([features], dtype=torch.float32)

        with torch.no_grad():
            logit, attn_weights = model(X)
            prob = torch.sigmoid(logit).item()
            attn = attn_weights.squeeze().tolist()

        if not isinstance(attn, list):
            attn = [float(attn)] * N_FEATURES

        logger.info(f"Prediction: {prob:.4f}")

        top5_idx = sorted(range(len(attn)), key=lambda i: attn[i], reverse=True)[:5]
        top_feats = {
            DEFAULT_CREDIT_FEATURES[i]: round(float(attn[i]), 4)
            for i in top5_idx
        }

        return PredictionResponse(
            risk_probability       = round(prob, 4),
            risk_label             = "HIGH RISK" if prob >= payload.threshold else "LOW RISK",
            risk_score             = int(round(prob * 100)),
            top_attention_features = top_feats,
            threshold_used         = payload.threshold,
            model_version          = os.getenv("MODEL_VERSION", "DNN-v1.0")
        )

    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch", tags=["Inference"])
def predict_batch(payload: BatchRequest):
    if len(payload.applicants) > 500:
        raise HTTPException(status_code=400, detail="Batch size exceeds 500.")
    try:
        model  = model_store.get("dnn")
        scaler = model_store.get("scaler")

        if model is None:
            raise RuntimeError("Model not loaded.")

        all_features = [list(a.features) for a in payload.applicants]

        if scaler is not None:
            import numpy as np
            all_features = scaler.transform(all_features).tolist()

        X = torch.tensor(all_features, dtype=torch.float32)
        with torch.no_grad():
            logits, _ = model(X)
            probs = torch.sigmoid(logits).tolist()

        if not isinstance(probs, list):
            probs = [probs]

        return {
            "predictions": [
                {
                    "applicant_index": i,
                    "risk_probability": round(float(p), 4),
                    "risk_label": "HIGH RISK" if p >= payload.applicants[i].threshold else "LOW RISK",
                    "risk_score": int(round(float(p) * 100))
                }
                for i, p in enumerate(probs)
            ],
            "count": len(probs)
        }

    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict/test", tags=["Debug"])
def predict_test():
    try:
        model  = model_store.get("dnn")
        scaler = model_store.get("scaler")

        if model is None:
            return {"status": "error", "detail": "Model not in model_store"}

        dummy = torch.zeros(1, N_FEATURES)
        with torch.no_grad():
            logit, attn = model(dummy)
            prob      = torch.sigmoid(logit).item()
            attn_list = attn.squeeze().tolist()

        return {
            "status":        "ok",
            "test_prob":     round(prob, 4),
            "n_features":    N_FEATURES,
            "model_loaded":  True,
            "scaler_loaded": scaler is not None,
            "attn_length":   len(attn_list) if isinstance(attn_list, list) else 1,
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e),
            "trace":  traceback.format_exc()
        }