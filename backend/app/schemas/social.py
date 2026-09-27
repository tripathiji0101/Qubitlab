"""Social feature request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── User Search ──

class UserSearchResult(BaseModel):
    id: str
    name: str
    avatar_initials: str
    current_level: int
    xp: int
    is_friend: bool = False
    request_pending: bool = False

    model_config = {"from_attributes": True}


# ── Friend Requests ──

class SendFriendRequest(BaseModel):
    addressee_id: str


class FriendRequestResponse(BaseModel):
    id: str
    requester: UserSearchResult
    addressee: UserSearchResult
    status: str
    created_at: str

    model_config = {"from_attributes": True}


class RespondFriendRequest(BaseModel):
    accept: bool


# ── Friends ──

class FriendResponse(BaseModel):
    id: str  # friendship ID
    user: UserSearchResult  # the other person
    is_online: bool = False
    last_active: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Messages ──

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    recipient_id: Optional[str] = None  # For DMs
    room_id: Optional[str] = None  # For room chat


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    sender_initials: str
    recipient_id: Optional[str] = None
    room_id: Optional[str] = None
    content: str
    read: bool
    created_at: str

    model_config = {"from_attributes": True}


# ── Collaboration Rooms ──

class RoomCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class RoomInviteRequest(BaseModel):
    user_id: str


class RoomMemberResponse(BaseModel):
    id: str
    user_id: str
    name: str
    avatar_initials: str
    role: str
    is_online: bool = False

    model_config = {"from_attributes": True}


class RoomResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    owner_name: str
    circuit_revision: int
    is_active: bool
    member_count: int
    members: list[RoomMemberResponse] = []
    created_at: str

    model_config = {"from_attributes": True}


class RoomListItem(BaseModel):
    id: str
    name: str
    owner_name: str
    member_count: int
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


# ── Roles and Invites ──

class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(editor|viewer)$")


class CreateInviteLinkRequest(BaseModel):
    role: str = Field(default="viewer", pattern="^(editor|viewer)$")
    expires_in_hours: Optional[int] = Field(default=168, ge=1, le=720)


class RoomInviteResponse(BaseModel):
    invite_token: str
    invite_url: str
    room_id: str
    room_name: str
    role: str
    expires_at: Optional[str] = None

    model_config = {"from_attributes": True}


class RoomInviteInfo(BaseModel):
    token: str
    room_id: str
    room_name: str
    owner_name: str
    inviter_name: str
    role: str
    is_active: bool
    is_expired: bool
    is_member: bool = False

