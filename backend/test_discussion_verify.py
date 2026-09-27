"""Rigorous verification of the Discussion feature."""
import httpx
import asyncio
import json
import sys

BASE = "http://localhost:8000/api/v1"

# We'll create test users and authenticate
async def register_and_login(client: httpx.AsyncClient, email: str, name: str, password: str = "TestPass123!") -> dict:
    """Register a user and return tokens."""
    r = await client.post(f"{BASE}/auth/register", json={
        "email": email, "password": password, "name": name, "experience_level": "beginner"
    })
    if r.status_code == 409:
        # Already exists, just login
        pass
    elif r.status_code not in (200, 201):
        print(f"  Register {email}: {r.status_code} {r.text}")
    
    r = await client.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    if r.status_code != 200:
        print(f"  FATAL: Login failed for {email}: {r.status_code} {r.text}")
        return {}
    return r.json()


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def main():
    results = {}
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        print("=" * 60)
        print("DISCUSSION FEATURE VERIFICATION")
        print("=" * 60)
        
        # ── Setup: Create 3 test users ──
        print("\n[SETUP] Creating test users...")
        user_a = await register_and_login(client, "test_disc_a@test.com", "UserA")
        user_b = await register_and_login(client, "test_disc_b@test.com", "UserB")
        user_c = await register_and_login(client, "test_disc_c@test.com", "UserC")
        
        if not all([user_a, user_b, user_c]):
            print("FATAL: Could not create test users")
            sys.exit(1)
        
        token_a = user_a.get("access_token", "")
        token_b = user_b.get("access_token", "")
        token_c = user_c.get("access_token", "")
        uid_a = user_a.get("user", {}).get("id", "")
        uid_b = user_b.get("user", {}).get("id", "")
        uid_c = user_c.get("user", {}).get("id", "")
        
        print(f"  UserA: {uid_a[:8]}...")
        print(f"  UserB: {uid_b[:8]}...")
        print(f"  UserC: {uid_c[:8]}...")

        # ── 1. SECURITY: Unauthenticated access ──
        print("\n[1] SECURITY: Unauthenticated requests")
        r = await client.get(f"{BASE}/discussions")
        print(f"  GET /discussions (no auth): {r.status_code}", "PASS ✅" if r.status_code == 401 else "FAIL ❌")
        results["unauth_list"] = r.status_code == 401
        
        r = await client.post(f"{BASE}/discussions", json={"body": "test", "scope": "global"})
        print(f"  POST /discussions (no auth): {r.status_code}", "PASS ✅" if r.status_code in (401, 403, 422) else "FAIL ❌")
        results["unauth_create"] = r.status_code in (401, 403, 422)
        
        # ── 2. CRUD: Create top-level post ──
        print("\n[2] CRUD: Create top-level post")
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Test Global Post by A",
            "body": "This is a test global discussion post.",
            "scope": "global",
            "tag": "discussion"
        }, headers=auth(token_a))
        print(f"  Create global post: {r.status_code} ", end="")
        if r.status_code in (200, 201):
            post_a_global = r.json()
            post_a_id = post_a_global["id"]
            print(f"PASS ✅ (id={post_a_id[:8]}...)")
            results["create_toplevel"] = True
            # Verify author_id comes from JWT, not request body
            actual_author = post_a_global.get("author", {}).get("id", "")
            print(f"  Author from JWT: {actual_author[:8]}... == UserA {uid_a[:8]}... ", 
                  "PASS ✅" if actual_author == uid_a else "FAIL ❌")
            results["author_from_jwt"] = actual_author == uid_a
        else:
            print(f"FAIL ❌: {r.text}")
            results["create_toplevel"] = False
            results["author_from_jwt"] = False
            post_a_id = None

        # Test: Missing title for top-level
        r = await client.post(f"{BASE}/discussions", json={
            "body": "No title post",
            "scope": "global"
        }, headers=auth(token_a))
        print(f"  Create without title: {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 400 else f"FAIL ❌ (expected 400)")
        results["require_title"] = r.status_code == 400

        # ── 3. CRUD: Create reply ──
        print("\n[3] CRUD: Create reply")
        if post_a_id:
            r = await client.post(f"{BASE}/discussions", json={
                "body": "This is a reply by UserB.",
                "scope": "global",
                "parent_id": post_a_id
            }, headers=auth(token_b))
            print(f"  Create reply: {r.status_code}", end=" ")
            if r.status_code in (200, 201):
                reply_b = r.json()
                reply_b_id = reply_b["id"]
                print(f"PASS ✅ (id={reply_b_id[:8]}...)")
                results["create_reply"] = True
                
                # Nested reply
                r = await client.post(f"{BASE}/discussions", json={
                    "body": "Nested reply by UserA.",
                    "scope": "global",
                    "parent_id": reply_b_id
                }, headers=auth(token_a))
                print(f"  Nested reply: {r.status_code}", "PASS ✅" if r.status_code in (200, 201) else "FAIL ❌")
                results["nested_reply"] = r.status_code in (200, 201)
            else:
                print(f"FAIL ❌: {r.text}")
                results["create_reply"] = False
                results["nested_reply"] = False
                reply_b_id = None
        
        # ── 4. CRUD: Retrieve post ──
        print("\n[4] CRUD: Retrieve post")
        if post_a_id:
            r = await client.get(f"{BASE}/discussions/{post_a_id}", headers=auth(token_a))
            print(f"  GET post: {r.status_code}", "PASS ✅" if r.status_code == 200 else "FAIL ❌")
            results["retrieve_post"] = r.status_code == 200
            if r.status_code == 200:
                detail = r.json()
                has_replies = len(detail.get("replies", [])) > 0
                print(f"  Replies included: {has_replies}", "PASS ✅" if has_replies else "FAIL ❌")
                results["detail_has_replies"] = has_replies

        # ── 5. CRUD: Edit own post ──
        print("\n[5] CRUD: Edit own vs other's post")
        if post_a_id:
            r = await client.put(f"{BASE}/discussions/{post_a_id}", json={
                "body": "EDITED body by UserA."
            }, headers=auth(token_a))
            print(f"  Edit own post (UserA): {r.status_code}", "PASS ✅" if r.status_code == 200 else "FAIL ❌")
            results["edit_own"] = r.status_code == 200
            
            # UserB tries to edit UserA's post
            r = await client.put(f"{BASE}/discussions/{post_a_id}", json={
                "body": "Hacked by B"
            }, headers=auth(token_b))
            print(f"  Edit other's post (UserB->A): {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 403 else "FAIL ❌")
            results["reject_edit_other"] = r.status_code == 403

        # ── 6. CRUD: Delete own vs other's post ──
        print("\n[6] CRUD: Delete authorization")
        # Create a post by UserC to test delete
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Post by C to delete",
            "body": "Will be deleted.",
            "scope": "global"
        }, headers=auth(token_c))
        if r.status_code in (200, 201):
            post_c_id = r.json()["id"]
            
            # UserB tries to delete C's post
            r = await client.delete(f"{BASE}/discussions/{post_c_id}", headers=auth(token_b))
            print(f"  Delete other's post (B->C): {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 403 else "FAIL ❌")
            results["reject_delete_other"] = r.status_code == 403
            
            # UserC deletes own post
            r = await client.delete(f"{BASE}/discussions/{post_c_id}", headers=auth(token_c))
            print(f"  Delete own post (C): {r.status_code}", "PASS ✅" if r.status_code == 204 else "FAIL ❌")
            results["delete_own"] = r.status_code == 204
            
            # ── 7. SOFT DELETE ──
            print("\n[7] SOFT DELETE behavior")
            # Deleted post should not appear in listings
            r = await client.get(f"{BASE}/discussions?scope=global", headers=auth(token_c))
            if r.status_code == 200:
                posts = r.json().get("posts", [])
                found_deleted = any(p["id"] == post_c_id for p in posts)
                print(f"  Deleted post in listings: {found_deleted}", "PASS ✅ (hidden)" if not found_deleted else "FAIL ❌")
                results["soft_delete_hidden"] = not found_deleted
            
            # Cannot edit deleted post
            r = await client.put(f"{BASE}/discussions/{post_c_id}", json={"body": "edited after delete"}, headers=auth(token_c))
            print(f"  Edit deleted post: {r.status_code}", "PASS ✅ (rejected)" if r.status_code in (404, 400, 403) else "FAIL ❌")
            results["edit_deleted_rejected"] = r.status_code in (404, 400, 403)
            
            # Cannot vote on deleted post
            r = await client.post(f"{BASE}/discussions/{post_c_id}/vote", json={"value": 1}, headers=auth(token_a))
            print(f"  Vote deleted post: {r.status_code}", "PASS ✅ (rejected)" if r.status_code in (404, 400, 403) else "FAIL ❌")
            results["vote_deleted_rejected"] = r.status_code in (404, 400, 403)

        # ── 8. VOTING ──
        print("\n[8] VOTING")
        if post_a_id:
            # Upvote
            r = await client.post(f"{BASE}/discussions/{post_a_id}/vote", json={"value": 1}, headers=auth(token_b))
            print(f"  Upvote: {r.status_code}", end=" ")
            if r.status_code == 200:
                upvotes = r.json().get("upvotes", 0)
                user_vote = r.json().get("user_vote", 0)
                print(f"PASS ✅ (upvotes={upvotes}, user_vote={user_vote})")
                results["upvote"] = True
            else:
                print(f"FAIL ❌: {r.text}")
                results["upvote"] = False
            
            # Change to downvote
            r = await client.post(f"{BASE}/discussions/{post_a_id}/vote", json={"value": -1}, headers=auth(token_b))
            print(f"  Change to downvote: {r.status_code}", end=" ")
            if r.status_code == 200:
                data = r.json()
                print(f"PASS ✅ (up={data.get('upvotes')}, down={data.get('downvotes')}, user_vote={data.get('user_vote')})")
                results["change_vote"] = True
            else:
                print(f"FAIL ❌")
                results["change_vote"] = False
            
            # Remove vote
            r = await client.post(f"{BASE}/discussions/{post_a_id}/vote", json={"value": 0}, headers=auth(token_b))
            print(f"  Remove vote: {r.status_code}", "PASS ✅" if r.status_code == 200 else "FAIL ❌")
            results["remove_vote"] = r.status_code == 200
            
            # Duplicate upvote (same value twice)
            await client.post(f"{BASE}/discussions/{post_a_id}/vote", json={"value": 1}, headers=auth(token_c))
            r = await client.post(f"{BASE}/discussions/{post_a_id}/vote", json={"value": 1}, headers=auth(token_c))
            print(f"  Duplicate vote: {r.status_code}", "PASS ✅ (idempotent)" if r.status_code == 200 else "FAIL ❌")
            results["duplicate_vote"] = r.status_code == 200

        # ── 9. FRIENDS SCOPE ──
        print("\n[9] FRIENDS SCOPE authorization")
        # Create friendship A <-> B
        r = await client.post(f"{BASE}/social/requests", json={"addressee_id": uid_b}, headers=auth(token_a))
        print(f"  Friend request A->B: {r.status_code}")
        
        # B accepts
        r = await client.get(f"{BASE}/social/requests", headers=auth(token_b))
        if r.status_code == 200:
            requests_list = r.json()
            for freq in requests_list:
                if freq.get("requester", {}).get("id") == uid_a:
                    fid = freq.get("id", "")
                    r2 = await client.put(f"{BASE}/social/requests/{fid}", json={"accept": True}, headers=auth(token_b))
                    print(f"  B accepts A's request: {r2.status_code}")
                    break
        
        # A creates a Friends-only post
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Friends only post by A",
            "body": "Only friends should see this.",
            "scope": "friends"
        }, headers=auth(token_a))
        if r.status_code in (200, 201):
            friends_post_id = r.json()["id"]
            
            # B (friend) should see it
            r = await client.get(f"{BASE}/discussions?scope=friends", headers=auth(token_b))
            if r.status_code == 200:
                posts = r.json().get("posts", [])
                found = any(p["id"] == friends_post_id for p in posts)
                print(f"  Friend B sees A's friends post: {found}", "PASS ✅" if found else "FAIL ❌")
                results["friend_can_see"] = found
            
            # C (not friend) should NOT see it
            r = await client.get(f"{BASE}/discussions?scope=friends", headers=auth(token_c))
            if r.status_code == 200:
                posts = r.json().get("posts", [])
                found = any(p["id"] == friends_post_id for p in posts)
                print(f"  Non-friend C sees A's friends post: {found}", "PASS ✅ (hidden)" if not found else "FAIL ❌")
                results["nonfriend_hidden"] = not found
            
            # C tries to GET the friends post directly
            r = await client.get(f"{BASE}/discussions/{friends_post_id}", headers=auth(token_c))
            print(f"  C direct access friends post: {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 403 else "FAIL ❌")
            results["friends_direct_bypass"] = r.status_code == 403
        else:
            print(f"  Failed to create friends post: {r.status_code} {r.text}")
            results["friend_can_see"] = False
            results["nonfriend_hidden"] = False
            results["friends_direct_bypass"] = False

        # ── 10. GLOBAL SCOPE ──
        print("\n[10] GLOBAL SCOPE")
        if post_a_id:
            r = await client.get(f"{BASE}/discussions?scope=global", headers=auth(token_c))
            if r.status_code == 200:
                posts = r.json().get("posts", [])
                found = any(p["id"] == post_a_id for p in posts)
                print(f"  Unrelated UserC sees global post: {found}", "PASS ✅" if found else "FAIL ❌")
                results["global_visible"] = found
        
        # ── 11. UNIVERSITY SCOPE ──
        print("\n[11] UNIVERSITY SCOPE")
        r = await client.post(f"{BASE}/discussions", json={
            "title": "University post",
            "body": "University scoped content.",
            "scope": "university"
        }, headers=auth(token_a))
        if r.status_code in (200, 201):
            uni_post_id = r.json()["id"]
            # Check if university filtering actually works
            r = await client.get(f"{BASE}/discussions?scope=university", headers=auth(token_c))
            if r.status_code == 200:
                posts = r.json().get("posts", [])
                found = any(p["id"] == uni_post_id for p in posts)
                print(f"  University filtering: UserC sees post: {found}")
                print(f"  NOTE: User model has NO university/institution field!")
                print(f"  University scope is NOT implemented — all users see all 'university' posts.")
                results["university_scope"] = "NOT_IMPLEMENTED"
        
        # ── 12. FILTERING ──
        print("\n[12] FILTERING")
        # Tag filter
        r = await client.get(f"{BASE}/discussions?scope=global&tag=discussion", headers=auth(token_a))
        print(f"  Tag filter: {r.status_code}", "PASS ✅" if r.status_code == 200 else "FAIL ❌")
        results["filter_tag"] = r.status_code == 200
        
        # Search
        r = await client.get(f"{BASE}/discussions?scope=global&search=test", headers=auth(token_a))
        print(f"  Search filter: {r.status_code}", "PASS ✅" if r.status_code == 200 else "FAIL ❌")
        results["filter_search"] = r.status_code == 200
        
        # Sort
        r = await client.get(f"{BASE}/discussions?scope=global&sort=newest", headers=auth(token_a))
        print(f"  Sort newest: {r.status_code}", "PASS ✅" if r.status_code == 200 else "FAIL ❌")
        results["filter_sort"] = r.status_code == 200
        
        # Pagination
        r = await client.get(f"{BASE}/discussions?scope=global&page=1&page_size=2", headers=auth(token_a))
        if r.status_code == 200:
            data = r.json()
            has_meta = all(k in data for k in ("total", "page", "page_size"))
            print(f"  Pagination metadata: {has_meta}", "PASS ✅" if has_meta else "FAIL ❌")
            results["pagination_meta"] = has_meta
        
        # ── 13. SECURITY: Forged author_id ──
        print("\n[13] SECURITY: Forged author_id")
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Forged author attempt",
            "body": "I'm trying to impersonate",
            "scope": "global",
            "author_id": uid_a  # Try injecting another user's ID
        }, headers=auth(token_c))
        if r.status_code in (200, 201):
            actual = r.json().get("author", {}).get("id", "")
            forged = actual == uid_a and uid_a != uid_c
            print(f"  Forged author_id accepted: {forged}", "PASS ✅ (ignored)" if not forged else "FAIL ❌")
            results["forged_author"] = not forged
        else:
            print(f"  Request rejected: {r.status_code}", "PASS ✅")
            results["forged_author"] = True
        
        # ── 14. API CONTRACT: Validation ──
        print("\n[14] API CONTRACT: Validation")
        # Empty body
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Empty body test",
            "body": "",
            "scope": "global"
        }, headers=auth(token_a))
        print(f"  Empty body: {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 422 else "FAIL ❌")
        results["validate_empty_body"] = r.status_code == 422
        
        # Invalid scope
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Bad scope",
            "body": "test",
            "scope": "invalid_scope"
        }, headers=auth(token_a))
        print(f"  Invalid scope: {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 422 else "FAIL ❌")
        results["validate_scope"] = r.status_code == 422
        
        # Invalid tag
        r = await client.post(f"{BASE}/discussions", json={
            "title": "Bad tag",
            "body": "test",
            "scope": "global",
            "tag": "invalid_tag"
        }, headers=auth(token_a))
        print(f"  Invalid tag: {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 422 else "FAIL ❌")
        results["validate_tag"] = r.status_code == 422
        
        # Invalid vote value
        r = await client.post(f"{BASE}/discussions/{post_a_id}/vote", json={"value": 5}, headers=auth(token_a))
        print(f"  Invalid vote value: {r.status_code}", "PASS ✅ (rejected)" if r.status_code == 422 else "FAIL ❌")
        results["validate_vote"] = r.status_code == 422
        
        # ── SUMMARY ──
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        passes = sum(1 for v in results.values() if v is True)
        fails = sum(1 for v in results.values() if v is False)
        other = sum(1 for v in results.values() if v not in (True, False))
        print(f"  PASS: {passes}")
        print(f"  FAIL: {fails}")
        print(f"  NOT IMPLEMENTED: {other}")
        print()
        for k, v in results.items():
            status = "✅ PASS" if v is True else ("❌ FAIL" if v is False else f"⚠️  {v}")
            print(f"  {k}: {status}")

asyncio.run(main())
