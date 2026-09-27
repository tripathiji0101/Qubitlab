"""Social models: Friendship, Message, CollabRoom, RoomMember."""

import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Friendship(Base):
    """Bidirectional friend relationship with request workflow."""
    __tablename__ = "friendships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    requester_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    addressee_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )  # pending | accepted | blocked
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class Message(Base):
    """Direct message or room chat message."""
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    sender_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recipient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )  # NULL for room messages
    room_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("collab_rooms.id", ondelete="CASCADE"), nullable=True, index=True
    )  # NULL for DMs
    content: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class CollabRoom(Base):
    """Live collaboration room for real-time circuit editing."""
    __tablename__ = "collab_rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    circuit_data: Mapped[str] = mapped_column(
        Text, default='{"placements":[],"qubits":2}'
    )  # JSON string of circuit state
    circuit_revision: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    def get_circuit(self) -> dict:
        """Parse circuit_data JSON."""
        try:
            return json.loads(self.circuit_data) if self.circuit_data else {"placements": [], "qubits": 2}
        except json.JSONDecodeError:
            return {"placements": [], "qubits": 2}

    def set_circuit(self, data: dict) -> None:
        """Serialize circuit state to JSON."""
        self.circuit_data = json.dumps(data)


class RoomMember(Base):
    """Room membership with roles."""
    __tablename__ = "room_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    room_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("collab_rooms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        String(20), default="editor", nullable=False
    )  # owner | editor | viewer
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class RoomInvite(Base):
    """Shareable invitation link for a collaboration room."""
    __tablename__ = "room_invites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    room_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("collab_rooms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inviter_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    role: Mapped[str] = mapped_column(
        String(20), default="viewer", nullable=False
    )  # viewer | editor
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

