/**
 * QubitLab WebSocket Client
 *
 * Custom hooks for real-time chat and collaboration room connections
 * with auto-reconnect and typed message handling.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "./api";

type WSState = "connecting" | "connected" | "disconnected";

interface WSMessage {
  type: string;
  [key: string]: unknown;
}

// ── Base WebSocket Hook ──

function useBaseWebSocket(url: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<WSState>("disconnected");
  const handlersRef = useRef<Map<string, Set<(data: WSMessage) => void>>>(new Map());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);
  const maxReconnect = 5;

  const connect = useCallback(() => {
    if (!url) return;

    const token = getAccessToken();
    if (!token) {
      setState("disconnected");
      return;
    }

    setState("connecting");
    const separator = url.includes("?") ? "&" : "?";
    const ws = new WebSocket(`${url}${separator}token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setState("connected");
      reconnectCountRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        const handlers = handlersRef.current.get(data.type);
        if (handlers) {
          handlers.forEach((h) => h(data));
        }
        // Also fire "*" wildcard handlers
        const wildcardHandlers = handlersRef.current.get("*");
        if (wildcardHandlers) {
          wildcardHandlers.forEach((h) => h(data));
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setState("disconnected");
      wsRef.current = null;

      // Auto-reconnect with exponential backoff
      if (reconnectCountRef.current < maxReconnect) {
        const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 30000);
        reconnectCountRef.current++;
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  const onMessage = useCallback(
    (type: string, handler: (data: WSMessage) => void) => {
      if (!handlersRef.current.has(type)) {
        handlersRef.current.set(type, new Set());
      }
      handlersRef.current.get(type)!.add(handler);
      return () => {
        handlersRef.current.get(type)?.delete(handler);
      };
    },
    [],
  );

  return { state, send, onMessage };
}

// ── Chat WebSocket Hook ──

const WS_BASE = (import.meta.env.VITE_WS_URL || "ws://localhost:8000");

export function useChatWebSocket() {
  const url = `${WS_BASE}/ws/chat`;
  return useBaseWebSocket(url);
}

// ── Room WebSocket Hook ──

export function useRoomWebSocket(roomId: string | null) {
  const url = roomId ? `${WS_BASE}/ws/room/${roomId}` : null;
  return useBaseWebSocket(url);
}

// ── Types for WebSocket Messages ──

export interface WSDMMessage {
  type: "dm";
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

export interface WSPresenceMessage {
  type: "presence";
  user_id: string;
  user_name: string;
  online: boolean;
}

export interface WSCircuitUpdate {
  type: "circuit_update";
  circuit: { placements: unknown[]; qubits: number };
  revision: number;
  user_id: string;
  user_name: string;
}

export interface WSStateSync {
  type: "state_sync";
  circuit: { placements: unknown[]; qubits: number };
  revision: number;
  members: string[];
  role?: string;
  conflict?: boolean;
}

export interface WSCircuitAck {
  type: "circuit_ack";
  revision: number;
}

export interface WSCircuitError {
  type: "circuit_error";
  error: string;
  code: string;
}

export interface WSRoleChange {
  type: "role_change";
  user_id: string;
  role: "editor" | "viewer";
}

export interface WSRoomChat {
  type: "chat";
  id: string;
  sender_id: string;
  sender_name: string;
  sender_initials: string;
  content: string;
  created_at: string;
}

export interface WSMemberJoin {
  type: "member_join";
  user_id: string;
  user_name: string;
  user_initials: string;
  role?: string;
}

export interface WSMemberLeave {
  type: "member_leave";
  user_id: string;
  user_name: string;
}

export interface WSVoiceCallStart {
  type: "voice_call_start";
  caller_id: string;
  caller_name: string;
  caller_initials: string;
}

export interface WSVoiceOffer {
  type: "voice_offer";
  offer: RTCSessionDescriptionInit;
  from_user_id: string;
  from_user_name: string;
  from_user_initials?: string;
  target_user_id?: string;
}

export interface WSVoiceAnswer {
  type: "voice_answer";
  answer: RTCSessionDescriptionInit;
  from_user_id: string;
  from_user_name: string;
  target_user_id?: string;
}

export interface WSVoiceIceCandidate {
  type: "voice_ice_candidate";
  candidate: RTCIceCandidateInit;
  from_user_id: string;
  from_user_name?: string;
  target_user_id?: string;
}

export interface WSVoiceDeclined {
  type: "voice_declined";
  from_user_id: string;
  from_user_name: string;
}

export interface WSVoiceMute {
  type: "voice_mute";
  user_id: string;
  user_name: string;
  muted: boolean;
}

export interface WSVoiceCallEnd {
  type: "voice_call_end";
  user_id: string;
  user_name: string;
}

export type { WSState, WSMessage };

