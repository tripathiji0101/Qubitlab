"""Discussion API — LeetCode-style threaded discussions with 3-tier scoping.

Tiers:
  - friends:    Only visible to users who are accepted friends of the author
  - university: Visible to users sharing the same institution (strictly tenant-isolated)
  - global:     Visible to every authenticated user
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, and_, or_
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.social import Friendship
from app.models.discussion import DiscussionPost, DiscussionVote

router = APIRouter(prefix="/discussions", tags=["discussions"])


# ── Pydantic Schemas ──

class DiscussionCreateRequest(BaseModel):
    scope: str = Field(default="global", pattern="^(friends|university|global)$")
    topic: Optional[str] = None
    parent_id: Optional[str] = None  # NULL = top-level, set = reply
    title: Optional[str] = None  # Only for top-level posts
    body: str = Field(..., min_length=1, max_length=10000)
    tag: str = Field(default="discussion", pattern="^(discussion|question|solution|approach|tip|bug)$")


class DiscussionUpdateRequest(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = Field(None, min_length=1, max_length=10000)
    tag: Optional[str] = Field(None, pattern="^(discussion|question|solution|approach|tip|bug)$")


class VoteRequest(BaseModel):
    value: int = Field(..., ge=-1, le=1)  # -1, 0 (remove vote), or +1


class AuthorInfo(BaseModel):
    id: str
    name: str
    avatar_initials: str
    xp: int
    current_level: int


class DiscussionPostResponse(BaseModel):
    id: str
    author: AuthorInfo
    scope: str
    topic: Optional[str]
    parent_id: Optional[str]
    title: Optional[str]
    body: str
    tag: str
    upvotes: int
    downvotes: int
    score: int  # upvotes - downvotes
    reply_count: int
    view_count: int
    is_pinned: bool
    is_accepted: bool
    user_vote: int  # Current user's vote: -1, 0, or 1
    created_at: datetime
    updated_at: datetime
    replies: list["DiscussionPostResponse"] = []


class DiscussionListResponse(BaseModel):
    posts: list[DiscussionPostResponse]
    total: int
    page: int
    page_size: int


# ── Helpers ──

async def _get_friend_ids(user_id: str, db: AsyncSession) -> list[str]:
    """Get all accepted friend user IDs for the given user."""
    result = await db.execute(
        select(Friendship).where(
            and_(
                Friendship.status == "accepted",
                or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id),
            )
        )
    )
    friend_ids: list[str] = []
    for f in result.scalars().all():
        friend_ids.append(f.addressee_id if f.requester_id == user_id else f.requester_id)
    return friend_ids


async def _batch_build_posts_response(
    posts: list[DiscussionPost],
    db: AsyncSession,
    user_id: str,
) -> list[DiscussionPostResponse]:
    """Batch loads authors and votes in exactly 2 queries instead of 2*N (Fixes N+1 problem)."""
    if not posts:
        return []

    author_ids = list({p.author_id for p in posts})
    post_ids = [p.id for p in posts]

    # Bulk query 1: Authors
    authors_q = await db.execute(select(User).where(User.id.in_(author_ids)))
    authors_map = {u.id: u for u in authors_q.scalars().all()}

    # Bulk query 2: User votes
    votes_q = await db.execute(
        select(DiscussionVote).where(
            and_(DiscussionVote.post_id.in_(post_ids), DiscussionVote.user_id == user_id)
        )
    )
    votes_map = {v.post_id: v.value for v in votes_q.scalars().all()}

    responses = []
    for post in posts:
        author = authors_map.get(post.author_id)
        author_info = AuthorInfo(
            id=author.id if author else post.author_id,
            name=author.name if author else "Unknown",
            avatar_initials=author.avatar_initials if author else "??",
            xp=author.xp if author else 0,
            current_level=author.current_level if author else 0,
        )
        user_vote = votes_map.get(post.id, 0)

        responses.append(
            DiscussionPostResponse(
                id=post.id,
                author=author_info,
                scope=post.scope,
                topic=post.topic,
                parent_id=post.parent_id,
                title=post.title,
                body=post.body,
                tag=post.tag,
                upvotes=post.upvotes,
                downvotes=post.downvotes,
                score=post.upvotes - post.downvotes,
                reply_count=post.reply_count,
                view_count=post.view_count,
                is_pinned=post.is_pinned,
                is_accepted=post.is_accepted,
                user_vote=user_vote,
                created_at=post.created_at,
                updated_at=post.updated_at,
                replies=[],
            )
        )

    return responses


async def _build_single_post_response(
    post: DiscussionPost,
    db: AsyncSession,
    user_id: str,
    include_replies: bool = False,
) -> DiscussionPostResponse:
    """Build a typed response for a discussion post, with full nested replies if requested."""
    # Author info
    author_result = await db.execute(select(User).where(User.id == post.author_id))
    author = author_result.scalar_one_or_none()
    author_info = AuthorInfo(
        id=author.id if author else post.author_id,
        name=author.name if author else "Unknown",
        avatar_initials=author.avatar_initials if author else "??",
        xp=author.xp if author else 0,
        current_level=author.current_level if author else 0,
    )

    # Vote
    vote_result = await db.execute(
        select(DiscussionVote).where(
            and_(DiscussionVote.post_id == post.id, DiscussionVote.user_id == user_id)
        )
    )
    vote = vote_result.scalar_one_or_none()
    user_vote = vote.value if vote else 0

    replies: list[DiscussionPostResponse] = []
    if include_replies:
        # Load all replies in thread hierarchy
        replies_result = await db.execute(
            select(DiscussionPost)
            .where(and_(DiscussionPost.parent_id == post.id, DiscussionPost.is_deleted == False))
            .order_by(
                desc(DiscussionPost.is_accepted),
                desc(DiscussionPost.upvotes - DiscussionPost.downvotes),
                asc(DiscussionPost.created_at),
            )
        )
        direct_replies = replies_result.scalars().all()
        # Batch load direct replies
        batch_replies = await _batch_build_posts_response(direct_replies, db, user_id)

        # Check for nested replies to each direct reply
        for reply_resp in batch_replies:
            nested_q = await db.execute(
                select(DiscussionPost)
                .where(and_(DiscussionPost.parent_id == reply_resp.id, DiscussionPost.is_deleted == False))
                .order_by(asc(DiscussionPost.created_at))
            )
            nested_posts = nested_q.scalars().all()
            if nested_posts:
                reply_resp.replies = await _batch_build_posts_response(nested_posts, db, user_id)
            replies.append(reply_resp)

    return DiscussionPostResponse(
        id=post.id,
        author=author_info,
        scope=post.scope,
        topic=post.topic,
        parent_id=post.parent_id,
        title=post.title,
        body=post.body,
        tag=post.tag,
        upvotes=post.upvotes,
        downvotes=post.downvotes,
        score=post.upvotes - post.downvotes,
        reply_count=post.reply_count,
        view_count=post.view_count,
        is_pinned=post.is_pinned,
        is_accepted=post.is_accepted,
        user_vote=user_vote,
        created_at=post.created_at,
        updated_at=post.updated_at,
        replies=replies,
    )


# ── Routes ──

@router.get("", response_model=DiscussionListResponse)
async def list_discussions(
    scope: str = Query("global", pattern="^(friends|university|global)$"),
    topic: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: str = Query("newest", pattern="^(newest|oldest|top|most_replies)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List top-level discussion posts filtered by scope tier with tenant isolation."""
    # Normalize parameters in case called directly in unit tests without FastAPI DI
    if hasattr(page, "default"):
        page = page.default
    page = int(page)
    if hasattr(page_size, "default"):
        page_size = page_size.default
    page_size = int(page_size)
    if hasattr(sort, "default"):
        sort = sort.default
    sort = str(sort)
    if hasattr(scope, "default"):
        scope = scope.default
    scope = str(scope)
    if hasattr(topic, "default"):
        topic = topic.default
    if hasattr(tag, "default"):
        tag = tag.default
    if hasattr(search, "default"):
        search = search.default

    conditions = [
        DiscussionPost.parent_id == None,
        DiscussionPost.is_deleted == False,
        DiscussionPost.scope == scope,
    ]

    # Fetch current user for tenancy checks
    user_q = await db.execute(select(User).where(User.id == user_id))
    current_user = user_q.scalar_one_or_none()

    # Scope-based access control
    if scope == "friends":
        # Only posts by the user or their accepted friends
        friend_ids = await _get_friend_ids(user_id, db)
        allowed_authors = [user_id] + friend_ids
        conditions.append(DiscussionPost.author_id.in_(allowed_authors))
    elif scope == "university":
        # Strict tenant isolation by university
        if not current_user or not current_user.university_id:
            # User does not belong to any university; return empty list
            return DiscussionListResponse(posts=[], total=0, page=page, page_size=page_size)
        conditions.append(DiscussionPost.university_id == current_user.university_id)
    # 'global' shows all authenticated users' posts

    if topic:
        conditions.append(DiscussionPost.topic == topic)
    if tag:
        conditions.append(DiscussionPost.tag == tag)
    if search:
        search_pattern = f"%{search}%"
        conditions.append(
            or_(
                DiscussionPost.title.ilike(search_pattern),
                DiscussionPost.body.ilike(search_pattern),
            )
        )

    # Sort order
    if sort == "newest":
        order = desc(DiscussionPost.created_at)
    elif sort == "oldest":
        order = asc(DiscussionPost.created_at)
    elif sort == "top":
        order = desc(DiscussionPost.upvotes - DiscussionPost.downvotes)
    else:  # most_replies
        order = desc(DiscussionPost.reply_count)

    # Total count
    count_q = await db.execute(
        select(func.count(DiscussionPost.id)).where(and_(*conditions))
    )
    total = count_q.scalar() or 0

    # Paginated query — pinned posts first
    result = await db.execute(
        select(DiscussionPost)
        .where(and_(*conditions))
        .order_by(desc(DiscussionPost.is_pinned), order)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    posts_list = result.scalars().all()
    # Batch-load to completely prevent N+1 queries
    posts = await _batch_build_posts_response(posts_list, db, user_id)

    return DiscussionListResponse(posts=posts, total=total, page=page, page_size=page_size)


@router.get("/{post_id}", response_model=DiscussionPostResponse)
async def get_discussion(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single discussion post with its replies, enforcing authorization."""
    result = await db.execute(
        select(DiscussionPost).where(
            and_(DiscussionPost.id == post_id, DiscussionPost.is_deleted == False)
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Access check for friends tier
    if post.scope == "friends":
        if post.author_id != user_id:
            friend_ids = await _get_friend_ids(user_id, db)
            if post.author_id not in friend_ids:
                raise HTTPException(status_code=403, detail="This post is only visible to friends")

    # Access check for university tier
    if post.scope == "university":
        user_q = await db.execute(select(User).where(User.id == user_id))
        current_user = user_q.scalar_one_or_none()
        if not current_user or not current_user.university_id or post.university_id != current_user.university_id:
            raise HTTPException(status_code=403, detail="This post is only visible to members of the same university")

    # Increment view count
    post.view_count += 1
    await db.commit()

    return await _build_single_post_response(post, db, user_id, include_replies=True)


@router.post("", response_model=DiscussionPostResponse, status_code=201)
async def create_discussion(
    req: DiscussionCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new discussion post or reply with scope validation."""
    user_q = await db.execute(select(User).where(User.id == user_id))
    current_user = user_q.scalar_one_or_none()

    # If it is a reply, validate parent exists and enforce reply permissions
    parent = None
    if req.parent_id:
        parent_result = await db.execute(
            select(DiscussionPost).where(DiscussionPost.id == req.parent_id)
        )
        parent = parent_result.scalar_one_or_none()
        if not parent or parent.is_deleted:
            raise HTTPException(status_code=404, detail="Parent post not found")

        # Scope permission: non-friend cannot reply to friends-only post
        if parent.scope == "friends" and parent.author_id != user_id:
            friend_ids = await _get_friend_ids(user_id, db)
            if parent.author_id not in friend_ids:
                raise HTTPException(status_code=403, detail="Cannot reply to a friends-only post")

        # Scope permission: non-university member cannot reply to university post
        if parent.scope == "university":
            if not current_user or not current_user.university_id or parent.university_id != current_user.university_id:
                raise HTTPException(status_code=403, detail="Cannot reply to a post from another university")

        # Inherit scope from parent
        actual_scope = parent.scope
        actual_university_id = parent.university_id
        parent.reply_count += 1
    else:
        # Top-level post requires a title
        if not req.title or not req.title.strip():
            raise HTTPException(status_code=400, detail="Title is required for top-level posts")

        actual_scope = req.scope
        actual_university_id = None
        if req.scope == "university":
            if not current_user or not current_user.university_id:
                raise HTTPException(status_code=400, detail="User must belong to a university to post in university scope")
            actual_university_id = current_user.university_id

    post = DiscussionPost(
        author_id=user_id,
        scope=actual_scope,
        university_id=actual_university_id,
        topic=req.topic,
        parent_id=req.parent_id,
        title=req.title.strip() if req.title else None,
        body=req.body.strip(),
        tag=req.tag,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return await _build_single_post_response(post, db, user_id)


@router.put("/{post_id}", response_model=DiscussionPostResponse)
async def update_discussion(
    post_id: str,
    req: DiscussionUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Edit a discussion post (only by author)."""
    result = await db.execute(
        select(DiscussionPost).where(
            and_(DiscussionPost.id == post_id, DiscussionPost.is_deleted == False)
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user_id:
        raise HTTPException(status_code=403, detail="Only the author can edit this post")

    if req.title is not None:
        post.title = req.title.strip()
    if req.body is not None:
        post.body = req.body.strip()
    if req.tag is not None:
        post.tag = req.tag

    await db.commit()
    await db.refresh(post)
    return await _build_single_post_response(post, db, user_id)


@router.delete("/{post_id}", status_code=204)
async def delete_discussion(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a discussion post and decrement parent reply_count if it was a reply."""
    result = await db.execute(
        select(DiscussionPost).where(DiscussionPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user_id:
        raise HTTPException(status_code=403, detail="Only the author can delete this post")

    if not post.is_deleted:
        post.is_deleted = True
        # Decrement parent's reply_count if this was a reply
        if post.parent_id:
            parent_result = await db.execute(
                select(DiscussionPost).where(DiscussionPost.id == post.parent_id)
            )
            parent = parent_result.scalar_one_or_none()
            if parent:
                parent.reply_count = max(0, parent.reply_count - 1)

    await db.commit()


@router.post("/{post_id}/vote", response_model=DiscussionPostResponse)
async def vote_on_post(
    post_id: str,
    req: VoteRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Upvote (+1), downvote (-1), or remove vote (0) on a discussion post."""
    result = await db.execute(
        select(DiscussionPost).where(
            and_(DiscussionPost.id == post_id, DiscussionPost.is_deleted == False)
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check existing vote
    vote_result = await db.execute(
        select(DiscussionVote).where(
            and_(DiscussionVote.post_id == post_id, DiscussionVote.user_id == user_id)
        )
    )
    existing_vote = vote_result.scalar_one_or_none()

    if existing_vote:
        old_value = existing_vote.value
        if req.value == 0:
            # Remove vote
            if old_value == 1:
                post.upvotes = max(0, post.upvotes - 1)
            elif old_value == -1:
                post.downvotes = max(0, post.downvotes - 1)
            await db.delete(existing_vote)
        else:
            # Change vote
            if old_value != req.value:
                if old_value == 1:
                    post.upvotes = max(0, post.upvotes - 1)
                elif old_value == -1:
                    post.downvotes = max(0, post.downvotes - 1)
                if req.value == 1:
                    post.upvotes += 1
                elif req.value == -1:
                    post.downvotes += 1
                existing_vote.value = req.value
    else:
        if req.value != 0:
            new_vote = DiscussionVote(user_id=user_id, post_id=post_id, value=req.value)
            db.add(new_vote)
            if req.value == 1:
                post.upvotes += 1
            elif req.value == -1:
                post.downvotes += 1

    await db.commit()
    await db.refresh(post)
    return await _build_single_post_response(post, db, user_id)
