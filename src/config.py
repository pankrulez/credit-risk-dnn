import os
from dotenv import load_dotenv

load_dotenv()   # loads .env in local dev; no-op in HF/Render (uses real env vars)

class Config:
    # ── API ───────────────────────────────────────────────────────
    RENDER_API_URL    = os.getenv("RENDER_API_URL", "").strip()
    LOCAL_API_URL     = "http://localhost:8000"

    @classmethod
    def get_api_url(cls) -> tuple[str, str]:
        """
        Returns (api_url, source) where source is 'render' or 'localhost'.
        Priority: RENDER_API_URL env var → fallback to localhost.
        """
        if cls.RENDER_API_URL:
            return cls.RENDER_API_URL, "render"
        return cls.LOCAL_API_URL, "localhost"

    # ── Model ─────────────────────────────────────────────────────
    MODEL_PATH        = os.getenv("MODEL_PATH", "outputs/best_model.pth")
    MODEL_VERSION     = os.getenv("MODEL_VERSION", "DNN-v1.0")
    DECISION_THRESHOLD = float(os.getenv("DECISION_THRESHOLD", "0.4"))

    # ── App ───────────────────────────────────────────────────────
    APP_ENV           = os.getenv("APP_ENV", "development")
    APP_TITLE         = os.getenv("APP_TITLE", "Credit Risk Assessment DNN")
    DEBUG             = os.getenv("DEBUG", "false").lower() == "true"
    FRONTEND_URL      = os.getenv("FRONTEND_URL", "*")

    @classmethod
    def is_production(cls) -> bool:
        return cls.APP_ENV == "production"