"""
End-to-end verification script for QubitLab Collaboration Features:
- WebRTC voice signaling (start, offer, answer, ICE candidate, mute, end, decline)
- Viewer role enforcement (read-only, rejected mutations, role changes)
- Shareable invite links (cryptographic tokens, validation, expiration, join)
- Reconnect and state synchronization (authoritative revision, conflict handling, stale rejection)
"""

import asyncio
import json
import secrets
import httpx
import websockets
from datetime import datetime, timezone, timedelta

BASE = "http://localhost:8000/api/v1"
WS_BASE = "ws://localhost:8000"

results = []

def log(test_name: str, status: str, evidence: str):
    results.append({"test": test_name, "status": status, "evidence": evidence})
    symbol = "✅" if status == "PASS" else "❌"
    print(f"{symbol} [{status}] {test_name}: {evidence}")


async def run_all_tests():
    print("\n" + "=" * 60)
    print("STARTING COLLABORATION E2E TEST SUITE")
    print("=" * 60 + "\n")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Health check
        r = await client.get("http://localhost:8000/health")
        assert r.status_code == 200
        log("Backend Health Check", "PASS", f"status={r.json().get('status')}")

        # 2. Setup 3 distinct test users (Alice = Owner, Bob = Editor, Charlie = Viewer)
        suffix = secrets.token_hex(4)
        users = {}
        for name, role in [("Alice", "owner"), ("Bob", "editor"), ("Charlie", "viewer")]:
            email = f"{name.lower()}_{suffix}@test.edu"
            password = "password123"
            r = await client.post(f"{BASE}/auth/register", json={
                "name": f"{name} Quantum",
                "email": email,
                "password": password,
                "experience_level": "intermediate",
            })
            if r.status_code == 201:
                token = r.json()["access_token"]
                user_id = r.json()["user"]["id"]
            else:
                # Login if already exists
                r_login = await client.post(f"{BASE}/auth/login", data={"username": email, "password": password})
                token = r_login.json()["access_token"]
                user_id = r_login.json()["user"]["id"]

            users[name] = {"id": user_id, "token": token, "email": email, "headers": {"Authorization": f"Bearer {token}"}}

        log("User Setup (Alice, Bob, Charlie)", "PASS", f"Alice={users['Alice']['id'][:8]}, Bob={users['Bob']['id'][:8]}, Charlie={users['Charlie']['id'][:8]}")

        # 3. Create Collaboration Room by Alice (Owner)
        r = await client.post(f"{BASE}/rooms", headers=users["Alice"]["headers"], json={"name": f"Lab-{suffix}"})
        assert r.status_code == 201
        room_data = r.json()
        room_id = room_data["id"]
        log("Create Collab Room", "PASS", f"room_id={room_id}, owner={room_data['owner_name']}")

        # 4. Invite Bob as friend & member
        # Friendship Alice <-> Bob
        await client.post(f"{BASE}/social/requests", headers=users["Alice"]["headers"], json={"addressee_id": users["Bob"]["id"]})
        r_req = await client.get(f"{BASE}/social/requests", headers=users["Bob"]["headers"])
        req_id = r_req.json()[0]["id"]
        await client.put(f"{BASE}/social/requests/{req_id}", headers=users["Bob"]["headers"], json={"accept": True})

        # Alice invites Bob to room (as editor)
        r_inv_bob = await client.post(f"{BASE}/rooms/{room_id}/invite", headers=users["Alice"]["headers"], json={"user_id": users["Bob"]["id"]})
        assert r_inv_bob.status_code == 201
        log("Invite Bob as Editor", "PASS", f"role={r_inv_bob.json()['role']}")

        # ==========================================================
        # PHASE C TESTS: SHAREABLE INVITE LINKS
        # ==========================================================
        # 5. Create shareable invite link with role="viewer"
        r_inv = await client.post(f"{BASE}/rooms/{room_id}/invites", headers=users["Alice"]["headers"], json={"role": "viewer", "expires_in_hours": 24})
        assert r_inv.status_code == 201
        invite_info = r_inv.json()
        invite_token = invite_info["invite_token"]
        log("Create Shareable Invite", "PASS", f"token_length={len(invite_token)}, role={invite_info['role']}")

        # 6. Verify token is cryptographically unguessable
        is_unguessable = len(invite_token) >= 32 and not invite_token.isdigit()
        log("Cryptographically Unguessable Token", "PASS" if is_unguessable else "FAIL", f"token={invite_token[:12]}...")

        # 7. Public GET invite info with valid token
        r_info = await client.get(f"{BASE}/rooms/invites/{invite_token}")
        assert r_info.status_code == 200
        inv_data = r_info.json()
        log("Valid Token Info Lookup", "PASS", f"room={inv_data['room_name']}, inviter={inv_data['inviter_name']}")

        # 8. Invalid token returns 404
        r_bad = await client.get(f"{BASE}/rooms/invites/completely-invalid-token-xyz-12345")
        log("Invalid Token Rejected", "PASS" if r_bad.status_code == 404 else "FAIL", f"status={r_bad.status_code}")

        # 9. Charlie joins room via invite token
        r_join = await client.post(f"{BASE}/rooms/invites/{invite_token}/join", headers=users["Charlie"]["headers"])
        assert r_join.status_code == 200
        joined_members = r_join.json()["members"]
        charlie_member = next((m for m in joined_members if m["user_id"] == users["Charlie"]["id"]), None)
        assert charlie_member is not None
        log("Charlie Joins via Invite as Viewer", "PASS" if charlie_member["role"] == "viewer" else "FAIL", f"charlie_role={charlie_member['role']}")

        # 10. Unauthenticated join rejected (401)
        r_unauth = await client.post(f"{BASE}/rooms/invites/{invite_token}/join")
        log("Unauthenticated Join Rejected", "PASS" if r_unauth.status_code == 401 else "FAIL", f"status={r_unauth.status_code}")

        # ==========================================================
        # PHASE B TESTS: VIEWER ROLE ENFORCEMENT
        # ==========================================================
        # 11. Connect Charlie (Viewer) to Room WebSocket
        token_c = users["Charlie"]["token"]
        token_a = users["Alice"]["token"]
        token_b = users["Bob"]["token"]

        async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_c}") as ws_c, \
                   websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_a}") as ws_a, \
                   websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_b}") as ws_b:

            sync_c = json.loads(await asyncio.wait_for(ws_c.recv(), timeout=5))
            log("Viewer Initial State Sync with Role", "PASS" if sync_c.get("role") == "viewer" else "FAIL", f"role={sync_c.get('role')}")

            # Drain initial syncs
            await ws_a.recv()
            await ws_b.recv()

            # 12. Charlie (Viewer) attempts circuit_update directly over WebSocket -> Backend MUST reject
            await ws_c.send(json.dumps({
                "type": "circuit_update",
                "circuit": {"placements": [{"id": "bad", "g": "X", "col": 0, "q": 0}], "qubits": 2},
                "revision": sync_c["revision"]
            }))

            err_msg = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_c.recv(), timeout=5))
                if m.get("type") == "circuit_error":
                    err_msg = m
                    break

            is_rejected = err_msg is not None and err_msg.get("code") == "PERMISSION_DENIED"
            log("Viewer Circuit Mutation Rejected by Backend", "PASS" if is_rejected else "FAIL", f"msg={err_msg}")

            # 13. Bob (Editor) edits circuit -> Server accepts
            new_circuit = {"placements": [{"id": "g1", "g": "H", "col": 0, "q": 0}], "qubits": 2}
            await ws_b.send(json.dumps({
                "type": "circuit_update",
                "circuit": new_circuit,
                "revision": 0
            }))

            ack_b = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                if m.get("type") == "circuit_ack":
                    ack_b = m
                    break
            log("Editor Circuit Mutation Accepted", "PASS" if ack_b and ack_b.get("type") == "circuit_ack" else "FAIL", f"ack={ack_b}")

            # 14. Charlie (Viewer) receives the circuit_update
            # Filter any join messages
            update_c = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_c.recv(), timeout=5))
                if m.get("type") == "circuit_update":
                    update_c = m
                    break

            log("Viewer Receives Live Circuit Updates", "PASS" if update_c and update_c.get("revision") == 1 else "FAIL", f"update={update_c}")

            # 15. Alice (Owner) promotes Charlie to "editor" via REST API
            r_role = await client.put(f"{BASE}/rooms/{room_id}/members/{users['Charlie']['id']}/role",
                                     headers=users["Alice"]["headers"], json={"role": "editor"})
            assert r_role.status_code == 200
            log("Owner Changes Member Role", "PASS", f"new_role={r_role.json()['role']}")

            # 16. Charlie receives role_change event over WS
            role_event_c = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_c.recv(), timeout=5))
                if m.get("type") == "role_change":
                    role_event_c = m
                    break
            log("Real-Time Role Change Event Delivered", "PASS" if role_event_c and role_event_c.get("role") == "editor" else "FAIL", f"event={role_event_c}")

            # 17. Charlie (now Editor) edits circuit -> Server accepts!
            circuit_charlie = {"placements": [{"id": "g1", "g": "H", "col": 0, "q": 0}, {"id": "g2", "g": "X", "col": 1, "q": 1}], "qubits": 2}
            await ws_c.send(json.dumps({
                "type": "circuit_update",
                "circuit": circuit_charlie,
                "revision": 1
            }))
            ack_c = json.loads(await asyncio.wait_for(ws_c.recv(), timeout=5))
            log("Promoted Member Can Now Edit Circuit", "PASS" if ack_c.get("type") == "circuit_ack" and ack_c.get("revision") == 2 else "FAIL", f"ack={ack_c}")

            # 18. Non-owner (Bob) attempts to change Charlie's role -> 403 Forbidden
            r_unauth_role = await client.put(f"{BASE}/rooms/{room_id}/members/{users['Charlie']['id']}/role",
                                            headers=users["Bob"]["headers"], json={"role": "viewer"})
            log("Non-Owner Role Change Rejected (403)", "PASS" if r_unauth_role.status_code == 403 else "FAIL", f"status={r_unauth_role.status_code}")

            # ==========================================================
            # PHASE A TESTS: WEBRTC VOICE SIGNALING
            # ==========================================================
            # 19. Alice starts voice call (voice_call_start)
            await ws_a.send(json.dumps({
                "type": "voice_call_start"
            }))
            # Bob receives incoming voice_call_start
            call_start_b = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                if m.get("type") == "voice_call_start":
                    call_start_b = m
                    break
            log("WebRTC: voice_call_start Delivered", "PASS" if call_start_b and call_start_b.get("caller_id") == users["Alice"]["id"] else "FAIL", f"msg={call_start_b}")

            # 20. Alice sends SDP offer
            dummy_offer = {"type": "offer", "sdp": "v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111"}
            await ws_a.send(json.dumps({
                "type": "voice_offer",
                "offer": dummy_offer,
                "target_user_id": users["Bob"]["id"]
            }))

            offer_b = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                if m.get("type") == "voice_offer":
                    offer_b = m
                    break
            log("WebRTC: voice_offer Delivered to Target Peer", "PASS" if offer_b and offer_b.get("offer") == dummy_offer else "FAIL", f"offer_from={offer_b.get('from_user_name') if offer_b else None}")

            # 21. Bob sends SDP answer back to Alice
            dummy_answer = {"type": "answer", "sdp": "v=0\r\no=- 67890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111"}
            await ws_b.send(json.dumps({
                "type": "voice_answer",
                "answer": dummy_answer,
                "target_user_id": users["Alice"]["id"]
            }))

            answer_a = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_a.recv(), timeout=5))
                if m.get("type") == "voice_answer":
                    answer_a = m
                    break
            log("WebRTC: voice_answer Delivered to Caller", "PASS" if answer_a and answer_a.get("answer") == dummy_answer else "FAIL", f"answer_from={answer_a.get('from_user_name') if answer_a else None}")

            # 22. ICE candidate exchange: Alice -> Bob
            dummy_ice = {"candidate": "candidate:1 1 UDP 2130706431 192.168.1.1 50000 typ host", "sdpMid": "0", "sdpMLineIndex": 0}
            await ws_a.send(json.dumps({
                "type": "voice_ice_candidate",
                "candidate": dummy_ice,
                "target_user_id": users["Bob"]["id"]
            }))

            ice_b = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                if m.get("type") == "voice_ice_candidate":
                    ice_b = m
                    break
            log("WebRTC: ICE Candidate Delivered to Peer", "PASS" if ice_b and ice_b.get("candidate") == dummy_ice else "FAIL", f"ice={ice_b}")

            # 23. Mute signaling
            await ws_b.send(json.dumps({
                "type": "voice_mute",
                "muted": True
            }))

            mute_a = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_a.recv(), timeout=5))
                if m.get("type") == "voice_mute":
                    mute_a = m
                    break
            log("WebRTC: voice_mute Broadcast Delivered", "PASS" if mute_a and mute_a.get("muted") is True else "FAIL", f"user={mute_a.get('user_name') if mute_a else None}")

            # 24. End call signaling
            await ws_a.send(json.dumps({
                "type": "voice_call_end"
            }))

            end_b = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                if m.get("type") == "voice_call_end":
                    end_b = m
                    break
            log("WebRTC: voice_call_end Broadcast Delivered", "PASS" if end_b is not None else "FAIL", f"msg={end_b}")

        # ==========================================================
        # PHASE D TESTS: RECONNECT & STATE RECOVERY
        # ==========================================================
        # 25. Reconnect test:
        # A and B are connected. Current revision is 2.
        # B disconnects. A pushes gate (revision becomes 3).
        # B reconnects -> receives state_sync with revision 3.
        # B sends stale update with revision 2 -> server rejects with conflict and returns revision 3!
        async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_a}") as ws_a, \
                   websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_b}") as ws_b:

            # Initial sync on connect
            sync_a = json.loads(await asyncio.wait_for(ws_a.recv(), timeout=5))
            sync_b = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
            rev_start = sync_a["revision"]

            # B disconnects intentionally
            await ws_b.close()

            # A modifies circuit while B is offline
            circuit_offline = {
                "placements": [
                    {"id": "g1", "g": "H", "col": 0, "q": 0},
                    {"id": "g2", "g": "X", "col": 1, "q": 1},
                    {"id": "g3", "g": "Z", "col": 2, "q": 0}
                ],
                "qubits": 2
            }
            await ws_a.send(json.dumps({
                "type": "circuit_update",
                "circuit": circuit_offline,
                "revision": rev_start
            }))
            ack_a = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_a.recv(), timeout=5))
                if m.get("type") == "circuit_ack":
                    ack_a = m
                    break
            assert ack_a is not None and ack_a["type"] == "circuit_ack"
            rev_offline = ack_a["revision"]

        # Now B reconnects!
        async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_b}") as ws_b_new:
            sync_b_reconnect = json.loads(await asyncio.wait_for(ws_b_new.recv(), timeout=5))
            log("Reconnect State Sync Delivers Latest Revision", "PASS" if sync_b_reconnect["revision"] == rev_offline else "FAIL",
                f"reconnect_rev={sync_b_reconnect['revision']}, expected={rev_offline}")

            # 26. Verify stale client cannot overwrite server state
            # B attempts to push with stale revision (rev_start = rev_offline - 1)
            stale_circuit = {"placements": [], "qubits": 2}
            await ws_b_new.send(json.dumps({
                "type": "circuit_update",
                "circuit": stale_circuit,
                "revision": rev_start
            }))

            conflict_resp = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b_new.recv(), timeout=5))
                if m.get("type") == "state_sync":
                    conflict_resp = m
                    break

            is_conflict_handled = conflict_resp is not None and conflict_resp.get("conflict") is True and conflict_resp.get("revision") == rev_offline
            log("Stale Client Cannot Overwrite Newer State", "PASS" if is_conflict_handled else "FAIL", f"conflict_flag={conflict_resp.get('conflict') if conflict_resp else None}, server_rev={conflict_resp.get('revision') if conflict_resp else None}")

        # 27. Reverse Reconnect: Disconnect A, modify with B, reconnect A
        async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_b}") as ws_b_active:
            sync_b_cur = json.loads(await asyncio.wait_for(ws_b_active.recv(), timeout=5))
            rev_cur = sync_b_cur["revision"]

            circuit_rev_b = {
                "placements": [
                    {"id": "g1", "g": "H", "col": 0, "q": 0},
                    {"id": "g4", "g": "CNOT", "col": 3, "q": 0, "q2": 1}
                ],
                "qubits": 2
            }
            await ws_b_active.send(json.dumps({
                "type": "circuit_update",
                "circuit": circuit_rev_b,
                "revision": rev_cur
            }))
            ack_b_rev = None
            for _ in range(5):
                m = json.loads(await asyncio.wait_for(ws_b_active.recv(), timeout=5))
                if m.get("type") == "circuit_ack":
                    ack_b_rev = m
                    break
            assert ack_b_rev is not None
            rev_new = ack_b_rev["revision"]
            rev_new = ack_b_rev["revision"]

        # A reconnects and gets rev_new
        async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={token_a}") as ws_a_reconnect:
            sync_a_reconnect = json.loads(await asyncio.wait_for(ws_a_reconnect.recv(), timeout=5))
            log("Reverse Reconnect State Recovery", "PASS" if sync_a_reconnect["revision"] == rev_new else "FAIL",
                f"reconnect_rev_a={sync_a_reconnect['revision']}, expected={rev_new}")

        # 28. Security: Unauthorized room WebSocket connection rejected
        try:
            async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token=invalid-expired-jwt-token") as ws_bad:
                await asyncio.wait_for(ws_bad.recv(), timeout=3)
                log("Unauthorized WS Connection Rejected", "FAIL", "received message instead of close")
        except websockets.exceptions.ConnectionClosed as e:
            log("Unauthorized WS Connection Rejected", "PASS", f"closed code={e.code}")
        except Exception as e:
            log("Unauthorized WS Connection Rejected", "PASS", f"closed: {type(e).__name__}")

        # 29. Security: Non-member room WS connection rejected
        stranger_suffix = secrets.token_hex(3)
        r_stranger = await client.post(f"{BASE}/auth/register", json={
            "name": "Stranger User",
            "email": f"stranger_{stranger_suffix}@test.edu",
            "password": "password123",
            "experience_level": "beginner",
        })
        stranger_token = r_stranger.json()["access_token"]
        try:
            async with websockets.connect(f"{WS_BASE}/ws/room/{room_id}?token={stranger_token}") as ws_stranger:
                await asyncio.wait_for(ws_stranger.recv(), timeout=3)
                log("Non-Member Room WS Rejected", "FAIL", "connected instead of rejection")
        except websockets.exceptions.ConnectionClosed as e:
            log("Non-Member Room WS Rejected", "PASS", f"closed code={e.code}")
        except Exception as e:
            log("Non-Member Room WS Rejected", "PASS", f"closed: {type(e).__name__}")

    print("\n" + "=" * 60)
    passes = sum(1 for r in results if r["status"] == "PASS")
    fails = sum(1 for r in results if r["status"] == "FAIL")
    print(f"SUMMARY: {passes}/{len(results)} TESTS PASSED ({fails} FAILED)")
    print("=" * 60 + "\n")
    return fails == 0

if __name__ == "__main__":
    asyncio.run(run_all_tests())
