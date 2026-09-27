"""Circuit model with versioning for save/load history."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Circuit(Base):
    """A user's saved quantum circuit."""
    __tablename__ = "circuits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), default="Untitled Circuit")
    qubits: Mapped[int] = mapped_column(Integer, default=2)
    classical_bits: Mapped[int] = mapped_column(Integer, default=2)
    # Stored as the frontend Placement[] format for compatibility
    placements_json: Mapped[dict] = mapped_column(JSON, default=list)
    sdk: Mapped[str] = mapped_column(String(20), default="Qiskit")
    project_slug: Mapped[str] = mapped_column(String(100), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class CircuitVersion(Base):
    """Versioned snapshot of a circuit for undo/restore."""
    __tablename__ = "circuit_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    circuit_id: Mapped[str] = mapped_column(String(36), ForeignKey("circuits.id", ondelete="CASCADE"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    qubits: Mapped[int] = mapped_column(Integer, default=2)
    placements_json: Mapped[dict] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
