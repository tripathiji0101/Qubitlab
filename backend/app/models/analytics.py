"""Analytics and instructor-related models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class LearningEvent(Base):
    """Tracks learning-related events for analytics."""
    __tablename__ = "learning_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    event_data: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class InstructorAssignment(Base):
    """Assignments created by instructors."""
    __tablename__ = "instructor_assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    instructor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    algorithm: Mapped[str] = mapped_column(String(100), default="")
    difficulty: Mapped[str] = mapped_column(String(20), default="Beginner")
    qubit_count: Mapped[int] = mapped_column(Integer, default=2)
    max_depth: Mapped[int] = mapped_column(Integer, default=8)
    target_result: Mapped[str] = mapped_column(String(255), default="")
    xp_reward: Mapped[int] = mapped_column(Integer, default=300)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    allowed_gates: Mapped[str] = mapped_column(String(255), default="H, X, Z, CNOT, CZ")
    hints: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="Draft")  # Draft/Open/Closed
    total_students: Mapped[int] = mapped_column(Integer, default=30)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class AssignmentSubmission(Base):
    """Student submission for an instructor assignment."""
    __tablename__ = "assignment_submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    assignment_id: Mapped[str] = mapped_column(String(36), ForeignKey("instructor_assignments.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    circuit_json: Mapped[dict] = mapped_column(JSON, default=dict)
    score: Mapped[int] = mapped_column(Integer, default=0)
    correctness: Mapped[float] = mapped_column(Float, default=0.0)
    efficiency: Mapped[float] = mapped_column(Float, default=0.0)
    attempts: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
