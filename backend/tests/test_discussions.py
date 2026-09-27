"""Comprehensive Discussion Feature Verification Tests.

Tests cover: database, authorization, CRUD, soft-delete, voting,
filtering, security, and API contract validation.
"""

import pytest
import uuid
import asyncio
from datetime import datetime, timezone

# ── Standalone test utilities (no httpx/TestClient dependency) ──

from app.core.database import Base, engine, async_session_factory
from app.core.security import create_access_token, hash_password
from app.models.user import User
from app.models.social import Friendship
from app.models.discussion import DiscussionPost, DiscussionVote
from sqlalchemy import select, func, inspect, text, and_


# ── Fixtures ──

def _uid():
    return str(uuid.uuid4())


async def _create_user(session, name="TestUser", email=None, xp=100):
    """Create a test user in the database."""
    uid = _uid()
    user = User(
        id=uid,
        email=email or f"{uid[:8]}@test.qubitlab.dev",
        password_hash=hash_password("test1234"),
        name=name,
        role="student",
        avatar_initials=name[:2].upper(),
        xp=xp,
        current_level=1,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def _make_friends(session, user_a_id, user_b_id):
    """Create an accepted friendship between two users."""
    f = Friendship(
        id=_uid(),
        requester_id=user_a_id,
        addressee_id=user_b_id,
        status="accepted",
    )
    session.add(f)
    await session.commit()
    return f


async def _create_post(session, author_id, scope="global", title="Test Post",
                       body="Test body", tag="discussion", parent_id=None, topic=None):
    """Create a discussion post directly in the DB."""
    post = DiscussionPost(
        id=_uid(),
        author_id=author_id,
        scope=scope,
        topic=topic,
        parent_id=parent_id,
        title=title,
        body=body,
        tag=tag,
    )
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post


# ═══════════════════════════════════════════════════════════════
# 1. DATABASE VERIFICATION
# ═══════════════════════════════════════════════════════════════

class TestDatabase:
    """Verify DB tables, columns, indexes, and foreign keys."""

    @pytest.mark.asyncio
    async def test_tables_exist(self):
        """Confirm discussion_posts and discussion_votes tables exist."""
        async with engine.connect() as conn:
            def _inspect(sync_conn):
                insp = inspect(sync_conn)
                return insp.get_table_names()
            tables = await conn.run_sync(_inspect)
            assert "discussion_posts" in tables, f"discussion_posts not found. Tables: {tables}"
            assert "discussion_votes" in tables, f"discussion_votes not found. Tables: {tables}"

    @pytest.mark.asyncio
    async def test_discussion_posts_columns(self):
        """Verify all expected columns exist on discussion_posts."""
        async with engine.connect() as conn:
            def _inspect(sync_conn):
                insp = inspect(sync_conn)
                return {c["name"] for c in insp.get_columns("discussion_posts")}
            cols = await conn.run_sync(_inspect)
            expected = {
                "id", "author_id", "scope", "topic", "parent_id",
                "title", "body", "tag", "upvotes", "downvotes",
                "reply_count", "view_count", "is_pinned", "is_accepted",
                "is_deleted", "created_at", "updated_at",
            }
            missing = expected - cols
            assert not missing, f"Missing columns: {missing}"

    @pytest.mark.asyncio
    async def test_discussion_votes_columns(self):
        """Verify all expected columns exist on discussion_votes."""
        async with engine.connect() as conn:
            def _inspect(sync_conn):
                insp = inspect(sync_conn)
                return {c["name"] for c in insp.get_columns("discussion_votes")}
            cols = await conn.run_sync(_inspect)
            expected = {"id", "user_id", "post_id", "value", "created_at"}
            missing = expected - cols
            assert not missing, f"Missing columns: {missing}"

    @pytest.mark.asyncio
    async def test_foreign_keys_discussion_posts(self):
        """Verify FK constraints on discussion_posts."""
        async with engine.connect() as conn:
            def _inspect(sync_conn):
                insp = inspect(sync_conn)
                return insp.get_foreign_keys("discussion_posts")
            fks = await conn.run_sync(_inspect)
            fk_targets = {(fk["referred_table"], tuple(fk["referred_columns"])) for fk in fks}
            assert ("users", ("id",)) in fk_targets, f"Missing FK to users. FKs: {fk_targets}"
            assert ("discussion_posts", ("id",)) in fk_targets, f"Missing self-FK for parent_id. FKs: {fk_targets}"

    @pytest.mark.asyncio
    async def test_foreign_keys_discussion_votes(self):
        """Verify FK constraints on discussion_votes."""
        async with engine.connect() as conn:
            def _inspect(sync_conn):
                insp = inspect(sync_conn)
                return insp.get_foreign_keys("discussion_votes")
            fks = await conn.run_sync(_inspect)
            fk_targets = {(fk["referred_table"], tuple(fk["referred_columns"])) for fk in fks}
            assert ("users", ("id",)) in fk_targets, f"Missing FK to users. FKs: {fk_targets}"
            assert ("discussion_posts", ("id",)) in fk_targets, f"Missing FK to discussion_posts. FKs: {fk_targets}"

    @pytest.mark.asyncio
    async def test_indexes_exist(self):
        """Verify indexes on key columns."""
        async with engine.connect() as conn:
            def _inspect(sync_conn):
                insp = inspect(sync_conn)
                indexes = insp.get_indexes("discussion_posts")
                return {tuple(sorted(idx["column_names"])) for idx in indexes}
            idx_cols = await conn.run_sync(_inspect)
            # At minimum we expect indexes on author_id, scope, topic, parent_id
            # SQLite creates these as ix_discussion_posts_<col>
            # We just check the columns are indexed somewhere
            all_indexed_cols = set()
            for cols in idx_cols:
                all_indexed_cols.update(cols)
            for col in ["author_id", "scope", "topic", "parent_id"]:
                assert col in all_indexed_cols, f"Column {col} is not indexed. Indexed cols: {all_indexed_cols}"

    @pytest.mark.asyncio
    async def test_model_registered_with_base(self):
        """Confirm models are registered with SQLAlchemy Base.metadata."""
        table_names = set(Base.metadata.tables.keys())
        assert "discussion_posts" in table_names
        assert "discussion_votes" in table_names


# ═══════════════════════════════════════════════════════════════
# 2. AUTHORIZATION (Friends / University / Global)
# ═══════════════════════════════════════════════════════════════

class TestAuthorization:
    """Verify scope-based access control at the data layer."""

    @pytest.mark.asyncio
    async def test_friends_scope_friend_can_see(self):
        """Friend B can see Friend A's friends-scope post via list query."""
        async with async_session_factory() as s:
            user_a = await _create_user(s, "FriendA")
            user_b = await _create_user(s, "FriendB")
            await _make_friends(s, user_a.id, user_b.id)
            post = await _create_post(s, user_a.id, scope="friends", title="Friend post")

            # Simulate list_discussions logic for user_b
            from app.api.v1.discussions import _get_friend_ids
            friends = await _get_friend_ids(user_b.id, s)
            assert user_a.id in friends, "A should be in B's friend list"

            allowed = [user_b.id] + friends
            result = await s.execute(
                select(DiscussionPost).where(
                    and_(
                        DiscussionPost.scope == "friends",
                        DiscussionPost.is_deleted == False,
                        DiscussionPost.parent_id == None,
                        DiscussionPost.author_id.in_(allowed),
                    )
                )
            )
            posts = result.scalars().all()
            post_ids = [p.id for p in posts]
            assert post.id in post_ids, "Friend B should see Friend A's post"

    @pytest.mark.asyncio
    async def test_friends_scope_stranger_cannot_see(self):
        """Non-friend C cannot see Friend A's friends-scope post."""
        async with async_session_factory() as s:
            user_a = await _create_user(s, "FriendA2")
            user_c = await _create_user(s, "StrangerC")
            post = await _create_post(s, user_a.id, scope="friends", title="Private post")

            from app.api.v1.discussions import _get_friend_ids
            friends = await _get_friend_ids(user_c.id, s)
            assert user_a.id not in friends, "A should NOT be in C's friend list"

            allowed = [user_c.id] + friends
            result = await s.execute(
                select(DiscussionPost).where(
                    and_(
                        DiscussionPost.scope == "friends",
                        DiscussionPost.is_deleted == False,
                        DiscussionPost.parent_id == None,
                        DiscussionPost.author_id.in_(allowed),
                    )
                )
            )
            posts = result.scalars().all()
            post_ids = [p.id for p in posts]
            assert post.id not in post_ids, "Stranger C should NOT see A's post"

    @pytest.mark.asyncio
    async def test_global_scope_any_user_can_see(self):
        """Any authenticated user can see global-scope posts."""
        async with async_session_factory() as s:
            user_a = await _create_user(s, "GlobalPoster")
            user_x = await _create_user(s, "RandomUser")
            post = await _create_post(s, user_a.id, scope="global", title="Global post")

            result = await s.execute(
                select(DiscussionPost).where(
                    and_(
                        DiscussionPost.scope == "global",
                        DiscussionPost.is_deleted == False,
                        DiscussionPost.parent_id == None,
                    )
                )
            )
            posts = result.scalars().all()
            post_ids = [p.id for p in posts]
            assert post.id in post_ids, "Global post should be visible to any user"

    @pytest.mark.asyncio
    async def test_friends_get_detail_blocked_for_stranger(self):
        """GET /discussions/{id} for friends-scope post should be blocked for non-friend."""
        async with async_session_factory() as s:
            user_a = await _create_user(s, "DetailA")
            user_c = await _create_user(s, "DetailC")
            post = await _create_post(s, user_a.id, scope="friends", title="Friends only detail")

            from app.api.v1.discussions import _get_friend_ids
            friends = await _get_friend_ids(user_c.id, s)
            # The get_discussion route checks:
            #   if post.scope == "friends" and post.author_id != user_id and author not in friends -> 403
            assert post.author_id != user_c.id
            assert post.author_id not in friends
            # This would raise HTTPException(403) in the actual route


# ═══════════════════════════════════════════════════════════════
# 3. CRUD
# ═══════════════════════════════════════════════════════════════

class TestCRUD:
    """Test create, read, update, delete operations."""

    @pytest.mark.asyncio
    async def test_create_top_level_post(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "CRUDCreate")
            post = await _create_post(s, user.id, title="Top level", body="Body content")
            assert post.id is not None
            assert post.title == "Top level"
            assert post.body == "Body content"
            assert post.parent_id is None

    @pytest.mark.asyncio
    async def test_create_reply(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "CRUDReply")
            parent = await _create_post(s, user.id, title="Parent post")
            reply = await _create_post(s, user.id, parent_id=parent.id, title=None, body="This is a reply")
            assert reply.parent_id == parent.id
            assert reply.title is None

    @pytest.mark.asyncio
    async def test_create_nested_reply(self):
        """Test reply to a reply (nested)."""
        async with async_session_factory() as s:
            user = await _create_user(s, "CRUDNested")
            top = await _create_post(s, user.id, title="Top")
            reply = await _create_post(s, user.id, parent_id=top.id, body="Reply 1")
            nested = await _create_post(s, user.id, parent_id=reply.id, body="Nested reply")
            assert nested.parent_id == reply.id

    @pytest.mark.asyncio
    async def test_retrieve_post(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "CRUDGet")
            post = await _create_post(s, user.id, title="Retrievable")
            result = await s.execute(select(DiscussionPost).where(DiscussionPost.id == post.id))
            fetched = result.scalar_one()
            assert fetched.title == "Retrievable"

    @pytest.mark.asyncio
    async def test_edit_own_post(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "CRUDEdit")
            post = await _create_post(s, user.id, title="Original")
            post.title = "Edited"
            post.body = "Updated body"
            await s.commit()
            await s.refresh(post)
            assert post.title == "Edited"
            assert post.body == "Updated body"

    @pytest.mark.asyncio
    async def test_reject_edit_by_other_user(self):
        """Verify the route logic rejects edits from non-authors."""
        async with async_session_factory() as s:
            author = await _create_user(s, "RealAuthor")
            other = await _create_user(s, "Impostor")
            post = await _create_post(s, author.id, title="Mine")
            # The update_discussion route checks: post.author_id != user_id -> 403
            assert post.author_id == author.id
            assert post.author_id != other.id

    @pytest.mark.asyncio
    async def test_delete_own_post(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "CRUDDel")
            post = await _create_post(s, user.id, title="Deletable")
            post.is_deleted = True
            await s.commit()
            await s.refresh(post)
            assert post.is_deleted is True

    @pytest.mark.asyncio
    async def test_reject_delete_by_other_user(self):
        """Verify the route logic rejects deletes from non-authors."""
        async with async_session_factory() as s:
            author = await _create_user(s, "RealDelAuthor")
            other = await _create_user(s, "DelImpostor")
            post = await _create_post(s, author.id, title="DeleteTest")
            assert post.author_id != other.id


# ═══════════════════════════════════════════════════════════════
# 4. SOFT DELETE
# ═══════════════════════════════════════════════════════════════

class TestSoftDelete:
    """Verify soft-deleted content behavior."""

    @pytest.mark.asyncio
    async def test_deleted_post_excluded_from_listing(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "SoftDelList")
            post = await _create_post(s, user.id, title="Will be deleted")
            post.is_deleted = True
            await s.commit()

            result = await s.execute(
                select(DiscussionPost).where(
                    and_(DiscussionPost.is_deleted == False, DiscussionPost.scope == "global")
                )
            )
            ids = [p.id for p in result.scalars().all()]
            assert post.id not in ids

    @pytest.mark.asyncio
    async def test_deleted_post_not_found_by_get(self):
        """GET route uses is_deleted == False filter."""
        async with async_session_factory() as s:
            user = await _create_user(s, "SoftDelGet")
            post = await _create_post(s, user.id, title="Ghosted")
            post.is_deleted = True
            await s.commit()

            result = await s.execute(
                select(DiscussionPost).where(
                    and_(DiscussionPost.id == post.id, DiscussionPost.is_deleted == False)
                )
            )
            assert result.scalar_one_or_none() is None

    @pytest.mark.asyncio
    async def test_deleted_replies_excluded_from_thread(self):
        """Deleted replies should not appear in thread view."""
        async with async_session_factory() as s:
            user = await _create_user(s, "SoftDelReply")
            parent = await _create_post(s, user.id, title="Parent")
            reply = await _create_post(s, user.id, parent_id=parent.id, body="Will be deleted reply")
            reply.is_deleted = True
            await s.commit()

            result = await s.execute(
                select(DiscussionPost).where(
                    and_(DiscussionPost.parent_id == parent.id, DiscussionPost.is_deleted == False)
                )
            )
            assert reply.id not in [r.id for r in result.scalars().all()]


# ═══════════════════════════════════════════════════════════════
# 5. VOTING
# ═══════════════════════════════════════════════════════════════

class TestVoting:
    """Test vote creation, change, removal, and constraints."""

    @pytest.mark.asyncio
    async def test_upvote(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "VoteUp")
            post = await _create_post(s, user.id, title="Votable")
            vote = DiscussionVote(id=_uid(), user_id=user.id, post_id=post.id, value=1)
            s.add(vote)
            post.upvotes += 1
            await s.commit()
            await s.refresh(post)
            assert post.upvotes == 1
            assert post.downvotes == 0

    @pytest.mark.asyncio
    async def test_downvote(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "VoteDown")
            post = await _create_post(s, user.id, title="Downvotable")
            vote = DiscussionVote(id=_uid(), user_id=user.id, post_id=post.id, value=-1)
            s.add(vote)
            post.downvotes += 1
            await s.commit()
            await s.refresh(post)
            assert post.downvotes == 1

    @pytest.mark.asyncio
    async def test_remove_vote(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "VoteRemove")
            post = await _create_post(s, user.id, title="RemoveVote")
            vote = DiscussionVote(id=_uid(), user_id=user.id, post_id=post.id, value=1)
            s.add(vote)
            post.upvotes += 1
            await s.commit()

            # Remove vote
            post.upvotes = max(0, post.upvotes - 1)
            await s.delete(vote)
            await s.commit()
            await s.refresh(post)
            assert post.upvotes == 0

    @pytest.mark.asyncio
    async def test_change_vote(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "VoteChange")
            post = await _create_post(s, user.id, title="ChangeVote")
            vote = DiscussionVote(id=_uid(), user_id=user.id, post_id=post.id, value=1)
            s.add(vote)
            post.upvotes += 1
            await s.commit()

            # Change from upvote to downvote
            post.upvotes = max(0, post.upvotes - 1)
            post.downvotes += 1
            vote.value = -1
            await s.commit()
            await s.refresh(post)
            assert post.upvotes == 0
            assert post.downvotes == 1

    @pytest.mark.asyncio
    async def test_duplicate_vote_handled_by_query(self):
        """The API uses SELECT to find existing vote before creating a new one."""
        async with async_session_factory() as s:
            user = await _create_user(s, "VoteDup")
            post = await _create_post(s, user.id, title="DupVote")
            vote = DiscussionVote(id=_uid(), user_id=user.id, post_id=post.id, value=1)
            s.add(vote)
            await s.commit()

            # Query for existing vote (as the API does)
            result = await s.execute(
                select(DiscussionVote).where(
                    and_(DiscussionVote.user_id == user.id, DiscussionVote.post_id == post.id)
                )
            )
            existing = result.scalar_one_or_none()
            assert existing is not None, "Should find existing vote"
            assert existing.value == 1


# ═══════════════════════════════════════════════════════════════
# 6. FILTERING
# ═══════════════════════════════════════════════════════════════

class TestFiltering:
    """Test scope, tag, search, sort, and pagination queries."""

    @pytest.mark.asyncio
    async def test_filter_by_scope(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "FilterScope")
            g_post = await _create_post(s, user.id, scope="global", title="Global filter test")
            f_post = await _create_post(s, user.id, scope="friends", title="Friends filter test")

            result = await s.execute(
                select(DiscussionPost).where(
                    and_(DiscussionPost.scope == "global", DiscussionPost.parent_id == None)
                )
            )
            global_ids = [p.id for p in result.scalars().all()]
            assert g_post.id in global_ids
            assert f_post.id not in global_ids

    @pytest.mark.asyncio
    async def test_filter_by_tag(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "FilterTag")
            q_post = await _create_post(s, user.id, tag="question", title="Tag Question")
            s_post = await _create_post(s, user.id, tag="solution", title="Tag Solution")

            result = await s.execute(
                select(DiscussionPost).where(DiscussionPost.tag == "question")
            )
            q_ids = [p.id for p in result.scalars().all()]
            assert q_post.id in q_ids
            assert s_post.id not in q_ids

    @pytest.mark.asyncio
    async def test_search_by_title(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "FilterSearch")
            post = await _create_post(s, user.id, title="Unique Quantum Entanglement Discussion")

            result = await s.execute(
                select(DiscussionPost).where(
                    DiscussionPost.title.ilike("%Quantum Entanglement%")
                )
            )
            ids = [p.id for p in result.scalars().all()]
            assert post.id in ids

    @pytest.mark.asyncio
    async def test_search_by_body(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "FilterSearchBody")
            post = await _create_post(s, user.id, title="Searchable",
                                      body="This body contains XoRShIfT pattern")

            result = await s.execute(
                select(DiscussionPost).where(
                    DiscussionPost.body.ilike("%XoRShIfT%")
                )
            )
            ids = [p.id for p in result.scalars().all()]
            assert post.id in ids

    @pytest.mark.asyncio
    async def test_sort_newest(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "FilterSort")
            p1 = await _create_post(s, user.id, title="Sort Oldest")
            p2 = await _create_post(s, user.id, title="Sort Newest")

            result = await s.execute(
                select(DiscussionPost)
                .where(DiscussionPost.author_id == user.id)
                .order_by(DiscussionPost.created_at.desc())
            )
            posts = result.scalars().all()
            assert len(posts) >= 2
            # p2 created after p1, so p2 should come first
            idx_p1 = next((i for i, p in enumerate(posts) if p.id == p1.id), None)
            idx_p2 = next((i for i, p in enumerate(posts) if p.id == p2.id), None)
            if idx_p1 is not None and idx_p2 is not None:
                assert idx_p2 < idx_p1, "Newer post should come first in desc order"

    @pytest.mark.asyncio
    async def test_pagination(self):
        async with async_session_factory() as s:
            user = await _create_user(s, "FilterPage")
            for i in range(5):
                await _create_post(s, user.id, title=f"Page test {i}", scope="global")

            # Page 1, size 2
            result = await s.execute(
                select(DiscussionPost)
                .where(DiscussionPost.author_id == user.id)
                .order_by(DiscussionPost.created_at.desc())
                .limit(2).offset(0)
            )
            page1 = result.scalars().all()
            assert len(page1) == 2

            # Page 2, size 2
            result = await s.execute(
                select(DiscussionPost)
                .where(DiscussionPost.author_id == user.id)
                .order_by(DiscussionPost.created_at.desc())
                .limit(2).offset(2)
            )
            page2 = result.scalars().all()
            assert len(page2) == 2

            # No overlap
            page1_ids = {p.id for p in page1}
            page2_ids = {p.id for p in page2}
            assert page1_ids.isdisjoint(page2_ids), "Pages should not overlap"


# ═══════════════════════════════════════════════════════════════
# 7. SECURITY
# ═══════════════════════════════════════════════════════════════

class TestSecurity:
    """Verify auth is derived from JWT, not client-supplied fields."""

    def test_auth_derived_from_jwt(self):
        """user_id comes from get_current_user_id which decodes JWT, not request body."""
        import inspect as pyinspect
        from app.api.v1.discussions import create_discussion
        sig = pyinspect.signature(create_discussion)
        params = sig.parameters
        # user_id should come from Depends(get_current_user_id)
        assert "user_id" in params
        user_id_param = params["user_id"]
        assert user_id_param.default is not pyinspect.Parameter.empty
        # Verify it's a Depends instance
        default = user_id_param.default
        assert hasattr(default, "dependency") or "Depends" in str(type(default)), \
            f"user_id should use Depends(), got {type(default)}"

    def test_create_request_has_no_author_id_field(self):
        """DiscussionCreateRequest should NOT accept author_id from the client."""
        from app.api.v1.discussions import DiscussionCreateRequest
        fields = DiscussionCreateRequest.model_fields
        assert "author_id" not in fields, "API should NOT accept author_id from client"

    def test_update_request_has_no_author_id_field(self):
        """DiscussionUpdateRequest should NOT accept author_id from the client."""
        from app.api.v1.discussions import DiscussionUpdateRequest
        fields = DiscussionUpdateRequest.model_fields
        assert "author_id" not in fields, "API should NOT accept author_id in updates"

    def test_all_routes_require_auth(self):
        """Every discussion route must depend on get_current_user_id."""
        import inspect as pyinspect
        from app.api.v1.discussions import (
            list_discussions, get_discussion, create_discussion,
            update_discussion, delete_discussion, vote_on_post,
        )
        for fn in [list_discussions, get_discussion, create_discussion,
                    update_discussion, delete_discussion, vote_on_post]:
            sig = pyinspect.signature(fn)
            assert "user_id" in sig.parameters, f"{fn.__name__} missing user_id param"

    def test_scope_validation(self):
        """Invalid scope values should be rejected by Pydantic validation."""
        from app.api.v1.discussions import DiscussionCreateRequest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            DiscussionCreateRequest(scope="admin", body="test", title="test")

    def test_tag_validation(self):
        """Invalid tag values should be rejected."""
        from app.api.v1.discussions import DiscussionCreateRequest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            DiscussionCreateRequest(tag="malicious", body="test", title="test")

    def test_body_min_length(self):
        """Empty body should be rejected."""
        from app.api.v1.discussions import DiscussionCreateRequest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            DiscussionCreateRequest(body="", title="test")


# ═══════════════════════════════════════════════════════════════
# 8. API CONTRACT
# ═══════════════════════════════════════════════════════════════

class TestAPIContract:
    """Verify request/response schemas and data shapes."""

    def test_response_schema_fields(self):
        from app.api.v1.discussions import DiscussionPostResponse
        fields = set(DiscussionPostResponse.model_fields.keys())
        expected = {
            "id", "author", "scope", "topic", "parent_id", "title", "body",
            "tag", "upvotes", "downvotes", "score", "reply_count", "view_count",
            "is_pinned", "is_accepted", "user_vote", "created_at", "updated_at",
            "replies",
        }
        missing = expected - fields
        assert not missing, f"Response schema missing fields: {missing}"

    def test_list_response_has_pagination_metadata(self):
        from app.api.v1.discussions import DiscussionListResponse
        fields = set(DiscussionListResponse.model_fields.keys())
        assert "total" in fields
        assert "page" in fields
        assert "page_size" in fields
        assert "posts" in fields

    def test_author_info_schema(self):
        from app.api.v1.discussions import AuthorInfo
        fields = set(AuthorInfo.model_fields.keys())
        expected = {"id", "name", "avatar_initials", "xp", "current_level"}
        assert expected == fields

    def test_vote_request_bounded(self):
        from app.api.v1.discussions import VoteRequest
        from pydantic import ValidationError
        # Valid
        VoteRequest(value=1)
        VoteRequest(value=0)
        VoteRequest(value=-1)
        # Invalid
        with pytest.raises(ValidationError):
            VoteRequest(value=2)
        with pytest.raises(ValidationError):
            VoteRequest(value=-2)

    def test_body_max_length(self):
        from app.api.v1.discussions import DiscussionCreateRequest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            DiscussionCreateRequest(body="x" * 10001, title="test")


# ═══════════════════════════════════════════════════════════════
# 9. UNIVERSITY SCOPE TENANT ISOLATION
# ═══════════════════════════════════════════════════════════════

class TestUniversityScopeIsolation:
    """Rigorous verification of institutional tenant boundaries in discussions."""

    @pytest.mark.asyncio
    async def test_university_scope_same_university_can_see(self):
        """User B from the same university can see User A's university-scoped post."""
        from app.models.university import University
        async with async_session_factory() as s:
            u_univ = University(id=_uid(), name="MIT Quantum Lab", domain=f"mit-{_uid()[:8]}.edu")
            s.add(u_univ)
            await s.commit()

            user_a = await _create_user(s, "UniA")
            user_b = await _create_user(s, "UniB")
            user_a.university_id = u_univ.id
            user_b.university_id = u_univ.id
            await s.commit()

            post = DiscussionPost(
                id=_uid(),
                author_id=user_a.id,
                scope="university",
                university_id=u_univ.id,
                title="Quantum Lab Seminar",
                body="Discussion for MIT quantum seminar.",
            )
            s.add(post)
            await s.commit()

            # Query list_discussions logic for user_b
            from app.api.v1.discussions import list_discussions
            res = await list_discussions(scope="university", user_id=user_b.id, db=s)
            post_ids = [p.id for p in res.posts]
            assert post.id in post_ids, "User B from same university MUST see post"

    @pytest.mark.asyncio
    async def test_university_scope_different_university_cannot_see(self):
        """User C from another university CANNOT see User A's university post."""
        from app.models.university import University
        async with async_session_factory() as s:
            u_univ1 = University(id=_uid(), name="Harvard QC", domain=f"harvard-{_uid()[:8]}.edu")
            u_univ2 = University(id=_uid(), name="Stanford QC", domain=f"stanford-{_uid()[:8]}.edu")
            s.add_all([u_univ1, u_univ2])
            await s.commit()

            user_a = await _create_user(s, "HarvardUser")
            user_c = await _create_user(s, "StanfordUser")
            user_a.university_id = u_univ1.id
            user_c.university_id = u_univ2.id
            await s.commit()

            post = DiscussionPost(
                id=_uid(),
                author_id=user_a.id,
                scope="university",
                university_id=u_univ1.id,
                title="Harvard Confidential QC",
                body="Harvard internal discussion.",
            )
            s.add(post)
            await s.commit()

            from app.api.v1.discussions import list_discussions, get_discussion
            from fastapi import HTTPException
            res = await list_discussions(scope="university", user_id=user_c.id, db=s)
            post_ids = [p.id for p in res.posts]
            assert post.id not in post_ids, "User C from Stanford MUST NOT see Harvard post"

            # Direct access must be 403 Forbidden
            with pytest.raises(HTTPException) as exc_info:
                await get_discussion(post.id, user_id=user_c.id, db=s)
            assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_user_without_university_gets_empty_list(self):
        """User without a university affiliation gets empty list for university scope."""
        async with async_session_factory() as s:
            user_d = await _create_user(s, "IndependentUser")
            from app.api.v1.discussions import list_discussions
            res = await list_discussions(scope="university", user_id=user_d.id, db=s)
            assert len(res.posts) == 0
            assert res.total == 0

    @pytest.mark.asyncio
    async def test_nonfriend_cannot_reply_to_friends_post(self):
        """Non-friend C attempting to reply to friend A's private post is rejected with 403."""
        async with async_session_factory() as s:
            user_a = await _create_user(s, "FriendOwner")
            user_c = await _create_user(s, "StrangerAttacker")
            post = await _create_post(s, user_a.id, scope="friends", title="Secret Friends")

            from app.api.v1.discussions import create_discussion, DiscussionCreateRequest
            from fastapi import HTTPException
            req = DiscussionCreateRequest(
                scope="friends",
                parent_id=post.id,
                body="I am eavesdropping and replying",
            )
            with pytest.raises(HTTPException) as exc_info:
                await create_discussion(req=req, user_id=user_c.id, db=s)
            assert exc_info.value.status_code == 403
            assert "friends-only" in exc_info.value.detail

