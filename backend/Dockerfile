# Multi-stage build for QubitLab backend
FROM python:3.11-slim AS builder

WORKDIR /app

# System build dependencies for quantum libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runtime image
FROM python:3.11-slim

WORKDIR /app

# Minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r qubitlab && useradd -r -g qubitlab -d /home/qubitlab -m qubitlab

# Copy installed python packages from builder
COPY --from=builder /root/.local /home/qubitlab/.local
ENV PATH=/home/qubitlab/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy application code with ownership
COPY --chown=qubitlab:qubitlab . /app

USER qubitlab

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
