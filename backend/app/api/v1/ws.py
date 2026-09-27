"""WebSocket endpoints for real-time chat and collaboration rooms."""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import async_session_factory
from app.core.config import settings
from app.core.security import decode_token
from app.models.user import User
from app.models.social import Message, CollabRoom, RoomMember
from app.services.connection_manager import chat_manager, room_manager
from app.core.logging import logger

router = APIRouter(tags=["websocket"])


def _auth_from_token(token: str) -> dict:
    """Validate JWT from WebSocket query param and return payload."""
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return {}
        return payload
    except Exception:
        return {}


# ── Personal Chat WebSocket ──

@router.websocket("/ws/chat")
async def ws_chat(websocket: WebSocket, token: str = Query(...)):
    """Personal chat WebSocket — DMs and presence."""
    payload = _auth_from_token(token)
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Authentication required")
        return

    # Get user name
    async with async_session_factory() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return
        user_name = user.name

    await chat_manager.connect(user_id, user_name, websocket)
    await chat_manager.broadcast_presence(user_id, online=True)
    logger.info("Chat WS connected: %s (%s)", user_name, user_id)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "dm":
                recipient_id = data.get("recipient_id")
                content = data.get("content", "").strip()

                if not recipient_id or not content:
                    continue

                # Save to DB
                async with async_session_factory() as db:
                    message = Message(
                        sender_id=user_id,
                        recipient_id=recipient_id,
                        content=content[:2000],
                    )
                    db.add(message)
                    await db.commit()

                    msg_data = {
                        "type": "dm",
                        "id": message.id,
                        "sender_id": user_id,
                        "sender_name": user_name,
                        "recipient_id": recipient_id,
                        "content": content[:2000],
                        "created_at": message.created_at.isoformat(),
                    }

                # Deliver to recipient if online
                await chat_manager.send_to_user(recipient_id, msg_data)
                # Echo back to sender for confirmation
                await chat_manager.send_to_user(user_id, msg_data)

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("Chat WS error for %s: %s", user_id, e)
    finally:
        chat_manager.disconnect(user_id)
        await chat_manager.broadcast_presence(user_id, online=False)
        logger.info("Chat WS disconnected: %s", user_id)


# ── Collaboration Room WebSocket ──

@router.websocket("/ws/room/{room_id}")
async def ws_room(websocket: WebSocket, room_id: str, token: str = Query(...)):
    """Collaboration room WebSocket — circuit sync, room chat, presence."""
    payload = _auth_from_token(token)
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Authentication required")
        return

    # Verify membership and get user info
    async with async_session_factory() as db:
        member_result = await db.execute(
            select(RoomMember).where(
                RoomMember.room_id == room_id,
                RoomMember.user_id == user_id,
            )
        )
        member = member_result.scalar_one_or_none()
        if not member:
            await websocket.close(code=4003, reason="Not a member of this room")
            return

        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one()
        user_name = user.name
        user_initials = user.avatar_initials

        # Get current circuit state
        room_result = await db.execute(select(CollabRoom).where(CollabRoom.id == room_id))
        room = room_result.scalar_one_or_none()
        if not room or not room.is_active:
            await websocket.close(code=4004, reason="Room not found or inactive")
            return

        circuit_data = room.get_circuit()
        circuit_revision = room.circuit_revision

    await room_manager.connect(room_id, user_id, user_name, websocket)
    logger.info("Room WS connected: %s in room %s", user_name, room_id)

    # Send current state to the new joiner
    await websocket.send_json({
        "type": "state_sync",
        "circuit": circuit_data,
        "revision": circuit_revision,
        "members": room_manager.get_room_members(room_id),
        "role": member.role,
    })

    # Broadcast join to others
    await room_manager.broadcast_to_room(room_id, {
        "type": "member_join",
        "user_id": user_id,
        "user_name": user_name,
        "user_initials": user_initials,
        "role": member.role,
    }, exclude_user=user_id)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "circuit_update":
                # Strictly enforce viewer role (read-only)
                async with async_session_factory() as db:
                    mem_check = await db.execute(
                        select(RoomMember).where(
                            RoomMember.room_id == room_id,
                            RoomMember.user_id == user_id,
                        )
                    )
                    curr_member = mem_check.scalar_one_or_none()
                    if not curr_member or curr_member.role == "viewer":
                        await websocket.send_json({
                            "type": "circuit_error",
                            "error": "Viewers cannot modify the circuit",
                            "code": "PERMISSION_DENIED",
                        })
                        continue

                # Server-authoritative revision check
                client_revision = data.get("revision", -1)
                new_circuit = data.get("circuit")

                if not new_circuit:
                    continue

                async with async_session_factory() as db:
                    room_result = await db.execute(
                        select(CollabRoom).where(CollabRoom.id == room_id)
                    )
                    room = room_result.scalar_one()

                    if client_revision == room.circuit_revision:
                        # Accept update
                        room.set_circuit(new_circuit)
                        room.circuit_revision += 1
                        await db.commit()

                        # Broadcast to all others
                        await room_manager.broadcast_to_room(room_id, {
                            "type": "circuit_update",
                            "circuit": new_circuit,
                            "revision": room.circuit_revision,
                            "user_id": user_id,
                            "user_name": user_name,
                        }, exclude_user=user_id)

                        # Confirm to sender
                        await websocket.send_json({
                            "type": "circuit_ack",
                            "revision": room.circuit_revision,
                        })
                    else:
                        # Revision conflict — send full authoritative state
                        await websocket.send_json({
                            "type": "state_sync",
                            "circuit": room.get_circuit(),
                            "revision": room.circuit_revision,
                            "members": room_manager.get_room_members(room_id),
                            "conflict": True,
                        })

            # ── WebRTC Voice Signaling ──
            elif msg_type in ("voice_offer", "voice_answer", "voice_ice_candidate", "voice_declined"):
                target_user_id = data.get("target_user_id")
                fwd_data = {
                    "type": msg_type,
                    "from_user_id": user_id,
                    "from_user_name": user_name,
                    "from_user_initials": user_initials,
                }
                for k in ("offer", "answer", "candidate", "target_user_id"):
                    if k in data:
                        fwd_data[k] = data[k]

                if target_user_id:
                    await room_manager.send_to_user_in_room(room_id, target_user_id, fwd_data)
                else:
                    await room_manager.broadcast_to_room(room_id, fwd_data, exclude_user=user_id)

            elif msg_type == "voice_call_start":
                await room_manager.broadcast_to_room(room_id, {
                    "type": "voice_call_start",
                    "caller_id": user_id,
                    "caller_name": user_name,
                    "caller_initials": user_initials,
                }, exclude_user=user_id)

            elif msg_type == "voice_mute":
                await room_manager.broadcast_to_room(room_id, {
                    "type": "voice_mute",
                    "user_id": user_id,
                    "user_name": user_name,
                    "muted": bool(data.get("muted")),
                }, exclude_user=None)

            elif msg_type == "voice_call_end":
                await room_manager.broadcast_to_room(room_id, {
                    "type": "voice_call_end",
                    "user_id": user_id,
                    "user_name": user_name,
                }, exclude_user=None)

            elif msg_type == "change_role":
                target_user_id = data.get("user_id")
                new_role = data.get("role")
                if target_user_id and new_role in ("editor", "viewer"):
                    async with async_session_factory() as db:
                        r_res = await db.execute(select(CollabRoom).where(CollabRoom.id == room_id))
                        r_obj = r_res.scalar_one_or_none()
                        if r_obj and r_obj.owner_id == user_id and target_user_id != user_id:
                            m_res = await db.execute(
                                select(RoomMember).where(
                                    RoomMember.room_id == room_id,
                                    RoomMember.user_id == target_user_id,
                                )
                            )
                            target_mem = m_res.scalar_one_or_none()
                            if target_mem:
                                target_mem.role = new_role
                                await db.commit()
                                await room_manager.broadcast_to_room(room_id, {
                                    "type": "role_change",
                                    "user_id": target_user_id,
                                    "role": new_role,
                                })

            elif msg_type == "chat":
                content = data.get("content", "").strip()
                if not content:
                    continue

                # Save room message
                async with async_session_factory() as db:
                    message = Message(
                        sender_id=user_id,
                        room_id=room_id,
                        content=content[:2000],
                    )
                    db.add(message)
                    await db.commit()

                # Broadcast to all in room (including sender)
                await room_manager.broadcast_to_room(room_id, {
                    "type": "chat",
                    "id": message.id,
                    "sender_id": user_id,
                    "sender_name": user_name,
                    "sender_initials": user_initials,
                    "content": content[:2000],
                    "created_at": message.created_at.isoformat(),
                }, exclude_user=None)

            elif msg_type == "cursor":
                await room_manager.broadcast_to_room(room_id, {
                    "type": "cursor",
                    "user_id": user_id,
                    "user_name": user_name,
                    "position": data.get("position"),
                }, exclude_user=user_id)

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})


    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("Room WS error for %s in %s: %s", user_id, room_id, e)
    finally:
        room_manager.disconnect(room_id, user_id)
        await room_manager.broadcast_to_room(room_id, {
            "type": "member_leave",
            "user_id": user_id,
            "user_name": user_name,
        })
        logger.info("Room WS disconnected: %s from room %s", user_name, room_id)
