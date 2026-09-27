"""Discussion models: LeetCode-style threaded forum with 3 scope tiers.

Scope tiers:
  - 'friends'    — visible only to the author's accepted friends
  - 'university' — visible to users sharing the same institution / cohort
  - 'global'     — visible to all authenticated users
"""

import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import (
    String, Integer, Boolean, Text, DateTime, ForeignKey,
    UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class DiscussionPost(Base):
    """A top-level discussion post or a reply to another post."""
    __tablename__ = "discussion_posts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    author_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Scope tier: friends | university | global
    scope: Mapped[str] = mapped_column(
        String(20), nullable=False, default="global", index=True
    )

    # University affiliation for university-scoped posts
    university_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=True, index=True
    )

    # Optional topic link (e.g. a level slug or challenge id for context)
    topic: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    # Thread structure
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("discussion_posts.id", ondelete="CASCADE"), nullable=True, index=True
    )  # NULL = top-level post, non-NULL = reply

    title: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)  # Only for top-level posts
    body: Mapped[str] = mapped_column(Text, nullable=False)

    # Categorization tags (LeetCode-style)
    tag: Mapped[str] = mapped_column(
        String(30), default="discussion", nullable=False
    )  # 'discussion' | 'question' | 'solution' | 'approach' | 'tip' | 'bug'

    # Engagement metrics
    upvotes: Mapped[int] = mapped_column(Integer, default=0)
    downvotes: Mapped[int] = mapped_column(Integer, default=0)
    reply_count: Mapped[int] = mapped_column(Integer, default=0)
    view_count: Mapped[int] = mapped_column(Integer, default=0)

    # Moderation
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_accepted: Mapped[bool] = mapped_column(Boolean, default=False)  # Accepted answer
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    __table_args__ = (
        Index("ix_discussion_posts_scope_deleted_created", "scope", "is_deleted", "created_at"),
    )


class DiscussionVote(Base):
    """Tracks user votes on discussion posts (one vote per user per post)."""
    __tablename__ = "discussion_votes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    post_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("discussion_posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    value: Mapped[int] = mapped_column(Integer, nullable=False)  # +1 or -1
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_discussion_votes_user_post"),
    )
