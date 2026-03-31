#!/bin/bash
set -e

# Render sets PORT env var (default 10000)
# Falls back to 8000 for local docker-compose
PORT="${PORT:-8000}"

echo "🚀 Starting FastAPI on port $PORT"
exec uvicorn api.main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --workers 1 \
  --log-level info \
  --timeout-keep-alive 65