FROM python:3.11-slim

WORKDIR /app

# Install OS deps
RUN apt-get update && apt-get install -y \
    gcc g++ libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY src/       ./src/
COPY api/       ./api/
COPY app/       ./app/
COPY outputs/   ./outputs/
COPY .streamlit/ ./.streamlit/

# Expose both FastAPI (8000) and Streamlit (8501) ports
EXPOSE 8000 8501

# Default: run FastAPI (override for Streamlit)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]