"""QubitLab Backend — FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.logging import RequestIDMiddleware, logger
from app.api.v1.auth import router as auth_router
from app.api.v1.simulations import sim_router, circuit_router
from app.api.v1.routes import (
    learning_router, dashboard_router, challenges_router,
    progress_router, leaderboard_router, history_router,
    tutor_router, instructor_router,
)
from app.api.v1.social import router as social_router
from app.api.v1.rooms import router as room_router
from app.api.v1.ws import router as ws_router
from app.api.v1.discussions import router as discussion_router
from app.api.v1.university import router as university_router

# Import models so Base.metadata picks them up
import app.models.social  # noqa: F401
import app.models.university  # noqa: F401


def _register_engines():
    """Register available quantum simulation engines."""
    try:
        from app.services.quantum.qiskit_engine import QiskitEngine
        from app.services.quantum.base import register_engine
        register_engine(QiskitEngine())
        logger.info("Registered Qiskit engine")
    except Exception as e:
        logger.warning("Qiskit engine unavailable: %s", e)

    try:
        from app.services.quantum.pennylane_engine import PennyLaneEngine
        from app.services.quantum.base import register_engine
        register_engine(PennyLaneEngine())
        logger.info("Registered PennyLane engine")
    except Exception as e:
        logger.warning("PennyLane engine unavailable: %s", e)

    try:
        from app.services.quantum.cirq_engine import CirqEngine
        from app.services.quantum.base import register_engine
        register_engine(CirqEngine())
        logger.info("Registered Cirq engine")
    except Exception as e:
        logger.warning("Cirq engine unavailable: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    logger.info("Starting %s (%s)", settings.APP_NAME, settings.ENVIRONMENT)
    _register_engines()

    # Ensure tables and initial curriculum data exist (safe & idempotent)
    try:
        await init_db()
        logger.info("Database tables verified")

        from app.seed.seed_data import seed_if_empty
        await seed_if_empty()
        logger.info("Database seed check completed")
    except Exception as e:
        logger.warning("Database init/seed warning: %s", e)

    yield
    logger.info("Shutting down %s", settings.APP_NAME)


def create_app() -> FastAPI:
    app = FastAPI(
        title="QubitLab API",
        description="AI-Powered Interactive Quantum Computing Learning Platform",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    # ── Middleware ──
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routes ──
    prefix = settings.API_V1_PREFIX

    app.include_router(auth_router, prefix=prefix)
    app.include_router(sim_router, prefix=prefix)
    app.include_router(circuit_router, prefix=prefix)
    app.include_router(learning_router, prefix=prefix)
    app.include_router(dashboard_router, prefix=prefix)
    app.include_router(challenges_router, prefix=prefix)
    app.include_router(progress_router, prefix=prefix)
    app.include_router(leaderboard_router, prefix=prefix)
    app.include_router(history_router, prefix=prefix)
    app.include_router(tutor_router, prefix=prefix)
    app.include_router(instructor_router, prefix=prefix)
    app.include_router(social_router, prefix=prefix)
    app.include_router(room_router, prefix=prefix)
    app.include_router(discussion_router, prefix=prefix)
    app.include_router(university_router, prefix=prefix)

    # WebSocket routes (no prefix — mounted at /ws/*)
    app.include_router(ws_router)

    # ── Health ──
    @app.get("/health")
    async def health():
        from app.services.quantum.base import list_engines
        health_data = {
            "status": "healthy",
            "service": settings.APP_NAME,
            "environment": settings.ENVIRONMENT,
            "quantum_engines": list_engines(),
        }
        # Check database connectivity in production
        if settings.ENVIRONMENT == "production":
            try:
                from app.core.database import async_session_factory
                from sqlalchemy import text
                async with async_session_factory() as session:
                    await session.execute(text("SELECT 1"))
                health_data["database"] = "connected"
            except Exception:
                health_data["status"] = "degraded"
                health_data["database"] = "unreachable"
        return health_data

    @app.get("/api/v1/engines")
    async def list_available_engines():
        from app.services.quantum.base import list_engines
        return {"engines": list_engines()}

    return app


app = create_app()
