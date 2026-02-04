# Spec Maker - runnable by anyone with Docker
FROM python:3.11-slim

WORKDIR /app

# Copy backend code
COPY backend/requirements.txt backend/
COPY backend/main.py backend/
COPY backend/app/ backend/app/
COPY backend/static/ backend/static/

# Create data directories at repo root (backend expects ../data)
RUN mkdir -p /app/data/gdds /app/data/slides /app/data/edge_cases \
    /app/data/context_uploads /app/data/qa_history /app/data/context_cache

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt

# Use PORT for cloud (Render, etc.) or default 8000
ENV PORT=8000
EXPOSE 8000

# Run from backend dir; data is at /app/data (we need to set DATA_DIR or run from /app)
# main.py uses parent of __file__ so we run from /app and set PYTHONPATH
WORKDIR /app
ENV PYTHONPATH=/app/backend
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT} --app-dir backend
