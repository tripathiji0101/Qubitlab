"""WebSocket connection managers for chat and collaboration rooms."""

from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import Optional
from fastapi import WebSocket


@dataclass
class ConnectedUser:
    user_id: str
    user_name: str
    websocket: WebSocket


class ChatManager:
    """Manages personal chat WebSocket connections and presence."""

    def __init__(self):
        # user_id -> WebSocket
        self._connections: dict[str, WebSocket] = {}
        self._user_names: dict[str, str] = {}

    async def connect(self, user_id: str, user_name: str, websocket: WebSocket):
        await websocket.accept()
        self._connections[user_id] = websocket
        self._user_names[user_id] = user_name

    def disconnect(self, user_id: str):
        self._connections.pop(user_id, None)
        self._user_names.pop(user_id, None)

    def is_online(self, user_id: str) -> bool:
        return user_id in self._connections

    def get_online_users(self) -> set[str]:
        return set(self._connections.keys())

    async def send_to_user(self, user_id: str, data: dict) -> bool:
        """Send a message to a specific user. Returns True if delivered."""
        ws = self._connections.get(user_id)
        if ws:
            try:
                await ws.send_json(data)
                return True
            except Exception:
                self.disconnect(user_id)
        return False

    async def broadcast_presence(self, user_id: str, online: bool):
        """Notify all connected users about a presence change."""
        data = {
            "type": "presence",
            "user_id": user_id,
            "user_name": self._user_names.get(user_id, "Unknown"),
            "online": online,
        }
        disconnected = []
        for uid, ws in self._connections.items():
            if uid != user_id:
                try:
                    await ws.send_json(data)
                except Exception:
                    disconnected.append(uid)
        for uid in disconnected:
            self.disconnect(uid)


class RoomManager:
    """Manages collaboration room WebSocket connections."""

    def __init__(self):
        # room_id -> {user_id: ConnectedUser}
        self._rooms: dict[str, dict[str, ConnectedUser]] = {}

    async def connect(self, room_id: str, user_id: str, user_name: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self._rooms:
            self._rooms[room_id] = {}
        self._rooms[room_id][user_id] = ConnectedUser(
            user_id=user_id,
            user_name=user_name,
            websocket=websocket,
        )

    def disconnect(self, room_id: str, user_id: str):
        if room_id in self._rooms:
            self._rooms[room_id].pop(user_id, None)
            if not self._rooms[room_id]:
                del self._rooms[room_id]

    def get_room_members(self, room_id: str) -> list[str]:
        if room_id in self._rooms:
            return list(self._rooms[room_id].keys())
        return []

    async def broadcast_to_room(self, room_id: str, data: dict, exclude_user: Optional[str] = None):
        """Broadcast a message to all users in a room except the sender."""
        if room_id not in self._rooms:
            return

        disconnected = []
        for uid, conn in self._rooms[room_id].items():
            if uid != exclude_user:
                try:
                    await conn.websocket.send_json(data)
                except Exception:
                    disconnected.append(uid)

        for uid in disconnected:
            self.disconnect(room_id, uid)

    async def send_to_user_in_room(self, room_id: str, user_id: str, data: dict) -> bool:
        """Send a message to a specific user in a room."""
        if room_id in self._rooms and user_id in self._rooms[room_id]:
            try:
                await self._rooms[room_id][user_id].websocket.send_json(data)
                return True
            except Exception:
                self.disconnect(room_id, user_id)
        return False


# Singleton instances
chat_manager = ChatManager()
room_manager = RoomManager()
