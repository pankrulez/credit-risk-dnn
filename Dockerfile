FROM python:3.11-slim

WORKDIR /app

# Install OS deps
RUN apt-get update && apt-get install -y \
    gcc g++ libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ── CPU-only PyTorch (saves ~1.4GB vs full torch) ─────────────────────────
# Full torch = ~1.8GB, CPU-only = ~200MB — critical for Render 512MB free tier
RUN pip install --no-cache-dir \
    torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu

# ── All other dependencies ─────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy source ────────────────────────────────────────────────────────────
COPY src/       ./src/
COPY api/       ./api/
COPY app/       ./app/
COPY outputs/   ./outputs/
COPY .streamlit/ ./.streamlit/

# ── Entrypoint script — properly passes $PORT to uvicorn ──────────────────
# MUST use exec form [] — shell form `CMD uvicorn ...` silently swallows
# SIGTERM from Render and causes immediate shutdown [web:110]
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Expose both FastAPI (8000) and Streamlit (8501) ports
EXPOSE 10000

ENTRYPOINT ["./docker-entrypoint.sh"]