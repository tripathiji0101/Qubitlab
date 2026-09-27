"""Structured logging with request context."""

import logging
import sys
import uuid
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
import time

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a unique request ID to every request and log timing."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        rid = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        request_id_ctx.set(rid)
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s → %d (%.0fms)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        response.headers["X-Request-ID"] = rid
        return response


def _setup_logger() -> logging.Logger:
    from app.core.config import settings

    log = logging.getLogger("qubitlab")
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.DEBUG)
    log.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    if settings.ENVIRONMENT == "production":
        # Structured format for CloudWatch / log aggregation
        handler.setFormatter(
            logging.Formatter(
                '{"time":"%(asctime)s","level":"%(levelname)s","msg":"%(message)s"}',
                datefmt="%Y-%m-%dT%H:%M:%S",
            )
        )
    else:
        handler.setFormatter(
            logging.Formatter(
                "[%(asctime)s] %(levelname)-5s | %(message)s",
                datefmt="%H:%M:%S",
            )
        )

    log.addHandler(handler)
    return log


logger = _setup_logger()
