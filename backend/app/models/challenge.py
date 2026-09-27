"""Challenge model for quantum circuit puzzles."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Challenge(Base):
    """A challenge puzzle that students solve by building circuits."""
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    tone: Mapped[str] = mapped_column(String(20), default="cyan")  # matches frontend Badge tones
    qubit_count: Mapped[int] = mapped_column(Integer, default=2)
    allowed_gates: Mapped[dict] = mapped_column(JSON, default=list)  # ["H", "X", "CNOT", ...]
    required_gates: Mapped[dict] = mapped_column(JSON, default=list)  # gates that must be present
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)  # extra constraints
    max_depth: Mapped[int] = mapped_column(Integer, default=8)
    max_gate_count: Mapped[int] = mapped_column(Integer, default=6)
    # Target state for correctness evaluation
    target_probabilities: Mapped[dict] = mapped_column(JSON, default=dict)  # {"00": 0.5, "11": 0.5}
    target_statevector: Mapped[dict] = mapped_column(JSON, nullable=True)  # optional exact state
    evaluation_type: Mapped[str] = mapped_column(String(20), default="probability")  # probability/statevector
    # Scoring weights (out of 100)
    weight_correctness: Mapped[int] = mapped_column(Integer, default=60)
    weight_efficiency: Mapped[int] = mapped_column(Integer, default=20)
    weight_depth: Mapped[int] = mapped_column(Integer, default=10)
    weight_gate_count: Mapped[int] = mapped_column(Integer, default=10)
    # Requirements and hints
    requirements: Mapped[dict] = mapped_column(JSON, default=list)
    hints: Mapped[dict] = mapped_column(JSON, default=list)
    expected_output_display: Mapped[str] = mapped_column(String(500), default="")
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_levels.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
