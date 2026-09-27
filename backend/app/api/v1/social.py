"""Social endpoints — friend system, user search, DM history."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.social import Friendship, Message
from app.schemas.social import (
    UserSearchResult,
    SendFriendRequest,
    FriendRequestResponse,
    RespondFriendRequest,
    FriendResponse,
    MessageResponse,
)

router = APIRouter(prefix="/social", tags=["social"])


# ── Helpers ──

def _user_search_result(u: User, is_friend: bool = False, request_pending: bool = False) -> UserSearchResult:
    return UserSearchResult(
        id=u.id,
        name=u.name,
        avatar_initials=u.avatar_initials,
        current_level=u.current_level,
        xp=u.xp,
        is_friend=is_friend,
        request_pending=request_pending,
    )


# ── Search Users ──

@router.get("/search", response_model=list[UserSearchResult])
async def search_users(
    q: str = Query(..., min_length=1, max_length=100),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Search users by name or email (partial match)."""
    pattern = f"%{q}%"
    result = await db.execute(
        select(User)
        .where(User.id != user_id)
        .where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
        .limit(20)
    )
    users = result.scalars().all()

    # Check friendship status for each result
    friend_ids = set()
    pending_ids = set()
    if users:
        user_ids = [u.id for u in users]
        friendships = await db.execute(
            select(Friendship).where(
                or_(
                    and_(Friendship.requester_id == user_id, Friendship.addressee_id.in_(user_ids)),
                    and_(Friendship.addressee_id == user_id, Friendship.requester_id.in_(user_ids)),
                )
            )
        )
        for f in friendships.scalars().all():
            other_id = f.addressee_id if f.requester_id == user_id else f.requester_id
            if f.status == "accepted":
                friend_ids.add(other_id)
            elif f.status == "pending":
                pending_ids.add(other_id)

    return [
        _user_search_result(u, is_friend=u.id in friend_ids, request_pending=u.id in pending_ids)
        for u in users
    ]


# ── Friends List ──

@router.get("/friends", response_model=list[FriendResponse])
async def list_friends(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all accepted friends."""
    # Import here to avoid circular import at module load
    from app.services.connection_manager import chat_manager

    result = await db.execute(
        select(Friendship).where(
            Friendship.status == "accepted",
            or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id),
        )
    )
    friendships = result.scalars().all()

    friends = []
    for f in friendships:
        other_id = f.addressee_id if f.requester_id == user_id else f.requester_id
        user_result = await db.execute(select(User).where(User.id == other_id))
        other_user = user_result.scalar_one_or_none()
        if other_user:
            friends.append(FriendResponse(
                id=f.id,
                user=_user_search_result(other_user, is_friend=True),
                is_online=chat_manager.is_online(other_id),
                last_active=other_user.last_active_date.isoformat() if other_user.last_active_date else None,
            ))

    return friends


# ── Friend Requests ──

@router.get("/requests", response_model=list[FriendRequestResponse])
async def list_requests(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List pending incoming friend requests."""
    result = await db.execute(
        select(Friendship).where(
            Friendship.addressee_id == user_id,
            Friendship.status == "pending",
        )
    )
    requests = result.scalars().all()

    response = []
    for req in requests:
        requester_result = await db.execute(select(User).where(User.id == req.requester_id))
        addressee_result = await db.execute(select(User).where(User.id == req.addressee_id))
        requester = requester_result.scalar_one_or_none()
        addressee = addressee_result.scalar_one_or_none()
        if requester and addressee:
            response.append(FriendRequestResponse(
                id=req.id,
                requester=_user_search_result(requester),
                addressee=_user_search_result(addressee),
                status=req.status,
                created_at=req.created_at.isoformat(),
            ))

    return response


@router.post("/requests", response_model=FriendRequestResponse, status_code=201)
async def send_friend_request(
    body: SendFriendRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Send a friend request to another user."""
    if body.addressee_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

    # Check target user exists
    target_result = await db.execute(select(User).where(User.id == body.addressee_id))
    target_user = target_result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check no existing friendship/request
    existing = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == user_id, Friendship.addressee_id == body.addressee_id),
                and_(Friendship.requester_id == body.addressee_id, Friendship.addressee_id == user_id),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Friend request already exists or you are already friends")

    friendship = Friendship(
        requester_id=user_id,
        addressee_id=body.addressee_id,
        status="pending",
    )
    db.add(friendship)
    await db.flush()

    requester_result = await db.execute(select(User).where(User.id == user_id))
    requester = requester_result.scalar_one()

    return FriendRequestResponse(
        id=friendship.id,
        requester=_user_search_result(requester),
        addressee=_user_search_result(target_user),
        status="pending",
        created_at=friendship.created_at.isoformat(),
    )


@router.put("/requests/{request_id}", response_model=FriendRequestResponse)
async def respond_to_request(
    request_id: str,
    body: RespondFriendRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Accept or reject a friend request."""
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == request_id,
            Friendship.addressee_id == user_id,
            Friendship.status == "pending",
        )
    )
    friendship = result.scalar_one_or_none()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")

    friendship.status = "accepted" if body.accept else "blocked"
    await db.flush()

    requester_result = await db.execute(select(User).where(User.id == friendship.requester_id))
    addressee_result = await db.execute(select(User).where(User.id == friendship.addressee_id))
    requester = requester_result.scalar_one()
    addressee = addressee_result.scalar_one()

    return FriendRequestResponse(
        id=friendship.id,
        requester=_user_search_result(requester),
        addressee=_user_search_result(addressee),
        status=friendship.status,
        created_at=friendship.created_at.isoformat(),
    )


# ── Remove Friend ──

@router.delete("/friends/{friendship_id}", status_code=204)
async def remove_friend(
    friendship_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove a friend (delete the friendship)."""
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == friendship_id,
            Friendship.status == "accepted",
            or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id),
        )
    )
    friendship = result.scalar_one_or_none()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")

    await db.delete(friendship)


# ── DM History ──

@router.get("/messages/{friend_id}", response_model=list[MessageResponse])
async def get_dm_history(
    friend_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    """Get DM history with a specific friend."""
    # Verify friendship exists
    friendship = await db.execute(
        select(Friendship).where(
            Friendship.status == "accepted",
            or_(
                and_(Friendship.requester_id == user_id, Friendship.addressee_id == friend_id),
                and_(Friendship.requester_id == friend_id, Friendship.addressee_id == user_id),
            ),
        )
    )
    if not friendship.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not friends with this user")

    result = await db.execute(
        select(Message)
        .where(
            Message.room_id.is_(None),
            or_(
                and_(Message.sender_id == user_id, Message.recipient_id == friend_id),
                and_(Message.sender_id == friend_id, Message.recipient_id == user_id),
            ),
        )
        .order_by(Message.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    messages = result.scalars().all()

    # Get user names
    user_cache = {}
    for msg in messages:
        for uid in [msg.sender_id, msg.recipient_id]:
            if uid and uid not in user_cache:
                u = await db.execute(select(User).where(User.id == uid))
                user_obj = u.scalar_one_or_none()
                if user_obj:
                    user_cache[uid] = (user_obj.name, user_obj.avatar_initials)

    # Mark unread messages as read
    for msg in messages:
        if msg.recipient_id == user_id and not msg.read:
            msg.read = True

    return [
        MessageResponse(
            id=msg.id,
            sender_id=msg.sender_id,
            sender_name=user_cache.get(msg.sender_id, ("Unknown", "?"))[0],
            sender_initials=user_cache.get(msg.sender_id, ("Unknown", "?"))[1],
            recipient_id=msg.recipient_id,
            room_id=msg.room_id,
            content=msg.content,
            read=msg.read,
            created_at=msg.created_at.isoformat(),
        )
        for msg in reversed(messages)  # Return chronological order
    ]
