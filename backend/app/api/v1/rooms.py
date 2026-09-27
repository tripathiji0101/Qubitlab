import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.social import CollabRoom, RoomMember, Friendship, RoomInvite
from app.schemas.social import (
    RoomCreateRequest,
    RoomInviteRequest,
    RoomResponse,
    RoomListItem,
    RoomMemberResponse,
    UpdateMemberRoleRequest,
    CreateInviteLinkRequest,
    RoomInviteResponse,
    RoomInviteInfo,
)

router = APIRouter(prefix="/rooms", tags=["rooms"])



# ── Helpers ──

async def _build_room_response(room: CollabRoom, db: AsyncSession) -> RoomResponse:
    """Build a full room response with members."""
    # Import here to avoid circular import at module load
    from app.services.connection_manager import chat_manager

    owner_result = await db.execute(select(User).where(User.id == room.owner_id))
    owner = owner_result.scalar_one()

    members_result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room.id)
    )
    members = members_result.scalars().all()

    member_responses = []
    for m in members:
        user_result = await db.execute(select(User).where(User.id == m.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            member_responses.append(RoomMemberResponse(
                id=m.id,
                user_id=user.id,
                name=user.name,
                avatar_initials=user.avatar_initials,
                role=m.role,
                is_online=chat_manager.is_online(user.id),
            ))

    return RoomResponse(
        id=room.id,
        name=room.name,
        owner_id=room.owner_id,
        owner_name=owner.name,
        circuit_revision=room.circuit_revision,
        is_active=room.is_active,
        member_count=len(member_responses),
        members=member_responses,
        created_at=room.created_at.isoformat(),
    )


# ── Create Room ──

@router.post("", response_model=RoomResponse, status_code=201)
async def create_room(
    body: RoomCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new collaboration room."""
    room = CollabRoom(
        name=body.name,
        owner_id=user_id,
    )
    db.add(room)
    await db.flush()

    # Add owner as a member
    member = RoomMember(
        room_id=room.id,
        user_id=user_id,
        role="owner",
    )
    db.add(member)
    await db.flush()

    return await _build_room_response(room, db)


# ── List My Rooms ──

@router.get("", response_model=list[RoomListItem])
async def list_rooms(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List rooms where I am a member."""
    result = await db.execute(
        select(RoomMember.room_id).where(RoomMember.user_id == user_id)
    )
    room_ids = [r[0] for r in result.all()]

    if not room_ids:
        return []

    rooms_result = await db.execute(
        select(CollabRoom)
        .where(CollabRoom.id.in_(room_ids), CollabRoom.is_active == True)
        .order_by(CollabRoom.updated_at.desc())
    )
    rooms = rooms_result.scalars().all()

    items = []
    for room in rooms:
        owner_result = await db.execute(select(User).where(User.id == room.owner_id))
        owner = owner_result.scalar_one()

        member_count = await db.execute(
            select(func.count()).select_from(RoomMember).where(RoomMember.room_id == room.id)
        )

        items.append(RoomListItem(
            id=room.id,
            name=room.name,
            owner_name=owner.name,
            member_count=member_count.scalar() or 0,
            is_active=room.is_active,
            created_at=room.created_at.isoformat(),
        ))

    return items


# ── Invite Links (Defined before /{room_id} to prevent path conflict) ──

@router.get("/invites/{token}", response_model=RoomInviteInfo)
async def get_invite_info(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve info about a shareable room invite."""
    invite_result = await db.execute(
        select(RoomInvite).where(RoomInvite.token == token)
    )
    invite = invite_result.scalar_one_or_none()
    if not invite or not invite.is_active:
        raise HTTPException(status_code=404, detail="Invalid or revoked invite link")

    is_expired = False
    if invite.expires_at:
        now = datetime.now(timezone.utc)
        exp = invite.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            is_expired = True

    if is_expired:
        raise HTTPException(status_code=410, detail="Invite link has expired")

    room_result = await db.execute(select(CollabRoom).where(CollabRoom.id == invite.room_id))
    room = room_result.scalar_one_or_none()
    if not room or not room.is_active:
        raise HTTPException(status_code=404, detail="Room not found or no longer active")

    owner_result = await db.execute(select(User).where(User.id == room.owner_id))
    owner = owner_result.scalar_one()

    inviter_result = await db.execute(select(User).where(User.id == invite.inviter_id))
    inviter = inviter_result.scalar_one()

    return RoomInviteInfo(
        token=invite.token,
        room_id=room.id,
        room_name=room.name,
        owner_name=owner.name,
        inviter_name=inviter.name,
        role=invite.role,
        is_active=room.is_active,
        is_expired=is_expired,
        is_member=False,
    )


@router.post("/invites/{token}/join", response_model=RoomResponse)
async def join_room_by_invite(
    token: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Join a collaboration room using a shareable invite link."""
    invite_result = await db.execute(
        select(RoomInvite).where(RoomInvite.token == token)
    )
    invite = invite_result.scalar_one_or_none()
    if not invite or not invite.is_active:
        raise HTTPException(status_code=404, detail="Invalid or revoked invite link")

    if invite.expires_at:
        now = datetime.now(timezone.utc)
        exp = invite.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            raise HTTPException(status_code=410, detail="Invite link has expired")

    room_result = await db.execute(select(CollabRoom).where(CollabRoom.id == invite.room_id))
    room = room_result.scalar_one_or_none()
    if not room or not room.is_active:
        raise HTTPException(status_code=404, detail="Room not found or no longer active")

    # Check if already a member
    member_result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room.id,
            RoomMember.user_id == user_id,
        )
    )
    existing_member = member_result.scalar_one_or_none()
    if not existing_member:
        new_member = RoomMember(
            room_id=room.id,
            user_id=user_id,
            role=invite.role,
        )
        db.add(new_member)
        await db.commit()

    return await _build_room_response(room, db)


# ── Get Room Details ──

@router.get("/{room_id}", response_model=RoomResponse)

async def get_room(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get room details (must be a member)."""
    # Verify membership
    member = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user_id,
        )
    )
    if not member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this room")

    room_result = await db.execute(select(CollabRoom).where(CollabRoom.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return await _build_room_response(room, db)


# ── Invite Friend to Room ──

@router.post("/{room_id}/invite", response_model=RoomMemberResponse, status_code=201)
async def invite_to_room(
    room_id: str,
    body: RoomInviteRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Invite a friend to join a room."""
    # Verify inviter is a member
    inviter_member = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user_id,
        )
    )
    if not inviter_member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this room")

    # Verify they are friends
    friendship = await db.execute(
        select(Friendship).where(
            Friendship.status == "accepted",
            or_(
                and_(Friendship.requester_id == user_id, Friendship.addressee_id == body.user_id),
                and_(Friendship.requester_id == body.user_id, Friendship.addressee_id == user_id),
            ),
        )
    )
    if not friendship.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You can only invite friends")

    # Check not already a member
    existing = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == body.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="User is already a member of this room")

    # Verify target user exists
    user_result = await db.execute(select(User).where(User.id == body.user_id))
    target_user = user_result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    member = RoomMember(
        room_id=room_id,
        user_id=body.user_id,
        role="editor",
    )
    db.add(member)
    await db.flush()

    from app.services.connection_manager import chat_manager

    return RoomMemberResponse(
        id=member.id,
        user_id=target_user.id,
        name=target_user.name,
        avatar_initials=target_user.avatar_initials,
        role="editor",
        is_online=chat_manager.is_online(target_user.id),
    )


# ── Leave Room ──

@router.post("/{room_id}/leave", status_code=204)
async def leave_room(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Leave a room."""
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="You are not a member of this room")

    if member.role == "owner":
        raise HTTPException(status_code=400, detail="Owner cannot leave. Close the room instead.")

    await db.delete(member)


# ── Close Room (Owner) ──

@router.delete("/{room_id}", status_code=204)
async def close_room(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Close a room (owner only). Marks it as inactive."""
    room_result = await db.execute(
        select(CollabRoom).where(
            CollabRoom.id == room_id,
            CollabRoom.owner_id == user_id,
        )
    )
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found or you are not the owner")

    room.is_active = False


# ── Update Member Role (Owner Only) ──

@router.put("/{room_id}/members/{target_user_id}/role", response_model=RoomMemberResponse)
async def update_member_role(
    room_id: str,
    target_user_id: str,
    body: UpdateMemberRoleRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Change a room member's role (owner only: 'editor' or 'viewer')."""
    room_result = await db.execute(select(CollabRoom).where(CollabRoom.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room or not room.is_active:
        raise HTTPException(status_code=404, detail="Room not found or inactive")

    if room.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the room owner can change member roles")

    if target_user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot change owner role")

    member_result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == target_user_id,
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in room")

    member.role = body.role
    await db.commit()

    # Broadcast role change over room WebSocket
    from app.services.connection_manager import room_manager, chat_manager
    await room_manager.broadcast_to_room(room_id, {
        "type": "role_change",
        "user_id": target_user_id,
        "role": body.role,
    })

    user_res = await db.execute(select(User).where(User.id == target_user_id))
    target_user = user_res.scalar_one()

    return RoomMemberResponse(
        id=member.id,
        user_id=target_user.id,
        name=target_user.name,
        avatar_initials=target_user.avatar_initials,
        role=member.role,
        is_online=chat_manager.is_online(target_user.id),
    )


# ── Create Shareable Invite Link ──

@router.post("/{room_id}/invites", response_model=RoomInviteResponse, status_code=201)
async def create_invite_link(
    room_id: str,
    body: CreateInviteLinkRequest = CreateInviteLinkRequest(),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Generate a shareable cryptographic invite link for the room."""
    room_result = await db.execute(select(CollabRoom).where(CollabRoom.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room or not room.is_active:
        raise HTTPException(status_code=404, detail="Room not found or inactive")

    caller_member = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user_id,
        )
    )
    if not caller_member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this room")

    token = secrets.token_urlsafe(32)
    expires_at = None
    if body.expires_in_hours:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=body.expires_in_hours)

    invite = RoomInvite(
        room_id=room_id,
        inviter_id=user_id,
        token=token,
        role=body.role,
        expires_at=expires_at,
    )
    db.add(invite)
    await db.commit()

    return RoomInviteResponse(
        invite_token=token,
        invite_url=f"/collaborate/join/{token}",
        room_id=room.id,
        room_name=room.name,
        role=invite.role,
        expires_at=invite.expires_at.isoformat() if invite.expires_at else None,
    )

