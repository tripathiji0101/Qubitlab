"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import secrets


class Settings(BaseSettings):
    """All settings loaded from env vars / .env file."""

    # ── App ──
    APP_NAME: str = "QubitLab"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://qubitlab:qubitlab@localhost:5432/qubitlab"

    # ── JWT Auth ──
    JWT_SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8443"

    # ── Redis ──
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── AI ──
    AI_PROVIDER: Optional[str] = None  # "openai", "gemini", etc.
    AI_API_KEY: Optional[str] = None
    AI_BASE_URL: Optional[str] = None
    AI_MODEL: str = "gpt-4o-mini"

    # ── Vector DB ──
    VECTOR_DB_URL: Optional[str] = None
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # ── Quantum Resource Limits ──
    MAX_QUBITS: int = 20
    MAX_CIRCUIT_DEPTH: int = 200
    MAX_GATES: int = 500
    MAX_SHOTS: int = 100_000
    SIMULATION_TIMEOUT_SECONDS: int = 30

    # ── Rate Limiting ──
    RATE_LIMIT_SIMULATION: str = "10/minute"
    RATE_LIMIT_TUTOR: str = "20/minute"
    RATE_LIMIT_CHALLENGE: str = "5/minute"

    # ── Logging ──
    LOG_LEVEL: str = "DEBUG"

    # ── Frontend (for CORS in production) ──
    FRONTEND_URL: Optional[str] = None  # e.g. "https://app.qubitlab.com"

    # ── WebRTC TURN (optional — STUN-only works for most NATs) ──
    TURN_URL: Optional[str] = None       # e.g. "turn:turn.example.com:3478"
    TURN_USERNAME: Optional[str] = None
    TURN_CREDENTIAL: Optional[str] = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
