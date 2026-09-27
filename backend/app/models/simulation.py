"""Simulation result model for persisting execution history."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SimulationResult(Base):
    """Persisted simulation execution result."""
    __tablename__ = "simulation_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    circuit_id: Mapped[str] = mapped_column(String(36), ForeignKey("circuits.id"), nullable=True)
    framework: Mapped[str] = mapped_column(String(20), nullable=False)  # qiskit/pennylane/cirq
    backend_name: Mapped[str] = mapped_column(String(50), default="aer")
    shots: Mapped[int] = mapped_column(Integer, default=1024)
    qubits: Mapped[int] = mapped_column(Integer, default=2)
    gate_count: Mapped[int] = mapped_column(Integer, default=0)
    depth: Mapped[int] = mapped_column(Integer, default=0)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    results_json: Mapped[dict] = mapped_column(JSON, default=dict)  # normalized result
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
