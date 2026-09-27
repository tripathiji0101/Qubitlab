"""Submission model for challenge attempts and scoring."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Submission(Base):
    """A student's challenge submission with deterministic scoring."""
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    circuit_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    qubits: Mapped[int] = mapped_column(Integer, default=2)
    framework: Mapped[str] = mapped_column(String(20), default="qiskit")
    # Scoring
    score: Mapped[int] = mapped_column(Integer, default=0)
    correctness: Mapped[float] = mapped_column(Float, default=0.0)
    efficiency: Mapped[float] = mapped_column(Float, default=0.0)
    depth_score: Mapped[float] = mapped_column(Float, default=0.0)
    gate_count_score: Mapped[float] = mapped_column(Float, default=0.0)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    # Metadata
    actual_depth: Mapped[int] = mapped_column(Integer, default=0)
    actual_gate_count: Mapped[int] = mapped_column(Integer, default=0)
    simulation_results: Mapped[dict] = mapped_column(JSON, nullable=True)
    feedback: Mapped[str] = mapped_column(String(1000), default="")
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
