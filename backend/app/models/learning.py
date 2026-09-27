"""Learning-related models: levels, projects, lessons, concepts."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class LearningLevel(Base):
    """The five main learning levels of QubitLab."""
    __tablename__ = "learning_levels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    n: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)  # 1-5
    role: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "Security Analyst"
    title: Mapped[str] = mapped_column(String(255), nullable=False)  # e.g. "Quantum Key Distribution"
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "BB84 Protocol"
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)  # Beginner/Intermediate/Advanced
    duration: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g. "45 min"
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    mission: Mapped[str] = mapped_column(Text, nullable=False, default="")
    concepts: Mapped[dict] = mapped_column(JSON, default=list)  # ["Superposition", ...]
    gates: Mapped[dict] = mapped_column(JSON, default=list)  # ["H", "X", ...]


class Project(Base):
    """Detailed project data for each level."""
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    level_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_levels.id"), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    overview: Mapped[str] = mapped_column(Text, default="")
    learning_objectives: Mapped[dict] = mapped_column(JSON, default=list)  # list of strings
    algorithm_overview: Mapped[str] = mapped_column(Text, default="")
    expected_outcome: Mapped[str] = mapped_column(Text, default="")
    hints: Mapped[dict] = mapped_column(JSON, default=list)  # list of hint strings
    success_criteria: Mapped[dict] = mapped_column(JSON, default=list)  # list of criteria strings


class Lesson(Base):
    """Individual lessons within a project."""
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    order: Mapped[int] = mapped_column(Integer, default=0)
    xp_reward: Mapped[int] = mapped_column(Integer, default=50)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=10)


class Concept(Base):
    """Quantum concepts trackable across the platform."""
    __tablename__ = "concepts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="general")
    description: Mapped[str] = mapped_column(Text, default="")


class UserProjectProgress(Base):
    """Tracks a user's progress within a project/level."""
    __tablename__ = "user_project_progress"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    level_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_levels.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="locked")  # locked/active/completed
    progress: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class UserLessonCompletion(Base):
    """Tracks which lessons a user has completed."""
    __tablename__ = "user_lesson_completions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[str] = mapped_column(String(36), ForeignKey("lessons.id"), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
