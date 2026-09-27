"""Progress, achievements, and XP transaction models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class XPTransaction(Base):
    """Idempotent XP award record — prevents duplicate awards."""
    __tablename__ = "xp_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)  # lesson/challenge/project
    source_id: Mapped[str] = mapped_column(String(36), nullable=False)  # the ID of what earned the XP
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Achievement(Base):
    """Platform achievements / badges."""
    __tablename__ = "achievements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(500), default="")
    tone: Mapped[str] = mapped_column(String(20), default="cyan")
    criteria_type: Mapped[str] = mapped_column(String(50), default="manual")
    criteria_value: Mapped[dict] = mapped_column(JSON, default=dict)
    icon: Mapped[str] = mapped_column(String(10), default="◈")
    order: Mapped[int] = mapped_column(Integer, default=0)


class UserAchievement(Base):
    """Links users to earned achievements."""
    __tablename__ = "user_achievements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    achievement_id: Mapped[str] = mapped_column(String(36), ForeignKey("achievements.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class UserConceptMastery(Base):
    """Tracks mastery level for each quantum concept per user."""
    __tablename__ = "user_concept_mastery"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    concept_name: Mapped[str] = mapped_column(String(100), nullable=False)
    mastery: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    successes: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
