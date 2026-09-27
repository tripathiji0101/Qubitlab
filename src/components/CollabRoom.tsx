/**
 * CollabRoom — Real-time Collaboration Room Overlay
 *
 * Features:
 * 1. WebRTC voice calling with microphone controls (start, join, decline, mute, end)
 * 2. Role management (owner, editor, viewer) with server enforcement
 * 3. Shareable cryptographic invite links
 * 4. Circuit synchronization via WebSocket
 * 5. Room chat
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { rooms, type RoomResponse, type RoomMemberResponse } from "@/lib/api";
import {
  useRoomWebSocket,
  type WSRoomChat,
  type WSMemberJoin,
  type WSMemberLeave,
  type WSStateSync,
  type WSCircuitUpdate,
  type WSCircuitAck,
  type WSRoleChange,
  type WSCircuitError,
  type WSVoiceCallStart,
  type WSVoiceOffer,
  type WSVoiceAnswer,
  type WSVoiceIceCandidate,
  type WSVoiceMute,
} from "@/lib/ws";
import { cx } from "@/components/ui";

function I({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

interface CollabRoomProps {
  roomId: string;
  onCircuitSync: (circuit: { placements: unknown[]; qubits: number }, revision: number) => void;
  getCircuit: () => { placements: unknown[]; qubits: number };
  circuitRevisionRef: React.MutableRefObject<number>;
  onRoleChange?: (role: "owner" | "editor" | "viewer") => void;
}

interface ChatMsg {
  id: string;
  sender_name: string;
  sender_initials: string;
  content: string;
  created_at: string;
}

type CallStatus = "idle" | "calling" | "incoming" | "connected";

function getIceServers(): RTCIceServer[] {
  const envIce = import.meta.env.VITE_ICE_SERVERS;
  if (envIce) {
    try {
      const parsed = JSON.parse(envIce);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      console.warn("Invalid VITE_ICE_SERVERS JSON, falling back to default STUN servers");
    }
  }
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: getIceServers(),
};


export default function CollabRoom({
  roomId,
  onCircuitSync,
  getCircuit,
  circuitRevisionRef,
  onRoleChange,
}: CollabRoomProps) {
  const { user } = useAuth();
  const { state: wsState, send, onMessage } = useRoomWebSocket(roomId);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const [myRole, setMyRole] = useState<"owner" | "editor" | "viewer">("editor");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [circuitError, setCircuitError] = useState<string | null>(null);

  // ── WebRTC State ──
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callerInfo, setCallerInfo] = useState<{ id: string; name: string; initials: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [remoteMuted, setRemoteMuted] = useState<Record<string, boolean>>({});

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load room details
  useEffect(() => {
    rooms.get(roomId).then((res) => {
      setRoom(res);
      const myMembership = res.members.find((m) => m.user_id === user?.id);
      if (myMembership) {
        const role = myMembership.role as "owner" | "editor" | "viewer";
        setMyRole(role);
        onRoleChange?.(role);
      }
    }).catch(() => {});
  }, [roomId, user?.id, onRoleChange]);

  // Handle state_sync (initial + conflict resolution)
  useEffect(() => {
    const unsub = onMessage("state_sync", (data) => {
      const sync = data as unknown as WSStateSync;
      onCircuitSync(sync.circuit, sync.revision);
      circuitRevisionRef.current = sync.revision;
      setActiveMembers(sync.members);
      if (sync.role) {
        const role = sync.role as "owner" | "editor" | "viewer";
        setMyRole(role);
        onRoleChange?.(role);
      }
    });
    return unsub;
  }, [onMessage, onCircuitSync, circuitRevisionRef, onRoleChange]);

  // Handle circuit updates from others
  useEffect(() => {
    const unsub = onMessage("circuit_update", (data) => {
      const update = data as unknown as WSCircuitUpdate;
      onCircuitSync(update.circuit, update.revision);
      circuitRevisionRef.current = update.revision;
    });
    return unsub;
  }, [onMessage, onCircuitSync, circuitRevisionRef]);

  // Handle circuit ack
  useEffect(() => {
    const unsub = onMessage("circuit_ack", (data) => {
      const ack = data as unknown as WSCircuitAck;
      circuitRevisionRef.current = ack.revision;
    });
    return unsub;
  }, [onMessage, circuitRevisionRef]);

  // Handle circuit errors (e.g. viewer blocked from mutating circuit)
  useEffect(() => {
    const unsub = onMessage("circuit_error", (data) => {
      const err = data as unknown as WSCircuitError;
      setCircuitError(err.error || "Circuit edit rejected by server");
      setTimeout(() => setCircuitError(null), 4000);
    });
    return unsub;
  }, [onMessage]);

  // Handle role change events
  useEffect(() => {
    const unsub = onMessage("role_change", (data) => {
      const change = data as unknown as WSRoleChange;
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.user_id === change.user_id ? { ...m, role: change.role } : m
          ),
        };
      });
      if (change.user_id === user?.id) {
        setMyRole(change.role);
        onRoleChange?.(change.role);
      }
    });
    return unsub;
  }, [onMessage, user?.id, onRoleChange]);

  // Handle member join/leave
  useEffect(() => {
    const unsubJoin = onMessage("member_join", (data) => {
      const join = data as unknown as WSMemberJoin;
      setActiveMembers((prev) => [...new Set([...prev, join.user_id])]);
      setRoom((prev) => {
        if (!prev) return prev;
        if (prev.members.some((m) => m.user_id === join.user_id)) return prev;
        const newMember: RoomMemberResponse = {
          id: join.user_id,
          user_id: join.user_id,
          name: join.user_name,
          avatar_initials: join.user_initials,
          role: (join.role as string) || "editor",
          is_online: true,
        };
        return { ...prev, members: [...prev.members, newMember] };
      });
    });
    const unsubLeave = onMessage("member_leave", (data) => {
      const leave = data as unknown as WSMemberLeave;
      setActiveMembers((prev) => prev.filter((id) => id !== leave.user_id));
    });
    return () => { unsubJoin(); unsubLeave(); };
  }, [onMessage]);

  // Handle room chat
  useEffect(() => {
    const unsub = onMessage("chat", (data) => {
      const msg = data as unknown as WSRoomChat;
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, {
          id: msg.id,
          sender_name: msg.sender_name,
          sender_initials: msg.sender_initials,
          content: msg.content,
          created_at: msg.created_at,
        }];
      });
    });
    return unsub;
  }, [onMessage]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const cleanupVoiceCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
    setCallStatus("idle");
    setCallerInfo(null);
    setIsMuted(false);
  }, []);

  // ── WebRTC Signaling Event Handlers ──
  useEffect(() => {
    const unsubStart = onMessage("voice_call_start", (data) => {
      const start = data as unknown as WSVoiceCallStart;
      if (callStatus === "idle") {
        setCallerInfo({
          id: start.caller_id,
          name: start.caller_name,
          initials: start.caller_initials || "U",
        });
        setCallStatus("incoming");
      }
    });

    const unsubOffer = onMessage("voice_offer", (data) => {
      const offerData = data as unknown as WSVoiceOffer;
      pendingOfferRef.current = offerData.offer;
      if (callStatus === "idle") {
        setCallerInfo({
          id: offerData.from_user_id,
          name: offerData.from_user_name,
          initials: offerData.from_user_initials || "U",
        });
        setCallStatus("incoming");
      }
    });

    const unsubAnswer = onMessage("voice_answer", async (data) => {
      const answerData = data as unknown as WSVoiceAnswer;
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answerData.answer));
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift()!;
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          setCallStatus("connected");
        } catch (e) {
          console.error("Error setting remote description from answer:", e);
        }
      }
    });

    const unsubIce = onMessage("voice_ice_candidate", async (data) => {
      const iceData = data as unknown as WSVoiceIceCandidate;
      if (iceData.candidate) {
        if (pcRef.current && pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(iceData.candidate)).catch(() => {});
        } else {
          pendingCandidatesRef.current.push(iceData.candidate);
        }
      }
    });

    const unsubDeclined = onMessage("voice_declined", () => {
      if (callStatus === "calling") {
        cleanupVoiceCall();
        setMicError("Call declined by participant");
        setTimeout(() => setMicError(null), 4000);
      }
    });

    const unsubMute = onMessage("voice_mute", (data) => {
      const muteData = data as unknown as WSVoiceMute;
      setRemoteMuted((prev) => ({ ...prev, [muteData.user_id]: muteData.muted }));
    });

    const unsubEnd = onMessage("voice_call_end", () => {
      cleanupVoiceCall();
    });

    return () => {
      unsubStart();
      unsubOffer();
      unsubAnswer();
      unsubIce();
      unsubDeclined();
      unsubMute();
      unsubEnd();
    };
  }, [onMessage, callStatus, cleanupVoiceCall]);

  // Clean up WebRTC audio tracks on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  // ── WebRTC Actions ──

  const startVoiceCall = async () => {
    setMicError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone access is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsMuted(false);

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          send("voice_ice_candidate", { candidate: event.candidate.toJSON() });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallStatus("connected");
        } else if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          cleanupVoiceCall();
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      send("voice_offer", { offer: { type: offer.type, sdp: offer.sdp } });
      send("voice_call_start", {});
      setCallStatus("calling");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Mic error:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicError("Microphone permission denied");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setMicError("Microphone not found on this device");
      } else {
        setMicError(error.message || "Could not access microphone");
      }
    }
  };

  const joinVoiceCall = async () => {
    setMicError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone access is not supported in this browser");
      declineVoiceCall();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsMuted(false);

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          send("voice_ice_candidate", {
            candidate: event.candidate.toJSON(),
            target_user_id: callerInfo?.id,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallStatus("connected");
        } else if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          cleanupVoiceCall();
        }
      };

      if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift()!;
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      send("voice_answer", {
        answer: { type: answer.type, sdp: answer.sdp },
        target_user_id: callerInfo?.id,
      });

      setCallStatus("connected");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Mic error on join:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicError("Microphone permission denied");
      } else {
        setMicError(error.message || "Could not access microphone");
      }
      declineVoiceCall();
    }
  };

  const declineVoiceCall = () => {
    send("voice_declined", { target_user_id: callerInfo?.id });
    cleanupVoiceCall();
  };

  const endVoiceCall = () => {
    send("voice_call_end", {});
    cleanupVoiceCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMuted = !isMuted;
      audioTracks.forEach((t) => {
        t.enabled = !newMuted;
      });
      setIsMuted(newMuted);
      send("voice_mute", { muted: newMuted });
    }
  };

  // ── Circuit update trigger ──
  const sendCircuitUpdate = useCallback(() => {
    if (myRole === "viewer") {
      setCircuitError("Viewers have read-only access and cannot edit the circuit");
      setTimeout(() => setCircuitError(null), 3000);
      return;
    }
    const circuit = getCircuit();
    send("circuit_update", {
      circuit,
      revision: circuitRevisionRef.current,
    });
  }, [send, getCircuit, circuitRevisionRef, myRole]);

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    send("chat", { content: chatDraft.trim() });
    setChatDraft("");
  };

  // ── Shareable Invite Link ──
  const handleGenerateShareInvite = async () => {
    setIsGeneratingInvite(true);
    setInviteFeedback(null);
    try {
      const invite = await rooms.createInvite(roomId, "viewer");
      const fullUrl = `${window.location.origin}/collaborate/join/${invite.invite_token}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
        setInviteFeedback("✓ Invite link copied to clipboard! (Viewers can join)");
      } else {
        setInviteFeedback(`Link: ${fullUrl}`);
      }
      setTimeout(() => setInviteFeedback(null), 6000);
    } catch {
      setInviteFeedback("Failed to create invite link");
      setTimeout(() => setInviteFeedback(null), 3000);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  // ── Change Role (Owner only) ──
  const handleChangeRole = async (targetUserId: string, newRole: "editor" | "viewer") => {
    try {
      await rooms.updateRole(roomId, targetUserId, newRole);
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.user_id === targetUserId ? { ...m, role: newRole } : m
          ),
        };
      });
    } catch (e: unknown) {
      console.error("Failed to update role:", e);
    }
  };

  const isOwner = myRole === "owner";
  const isViewer = myRole === "viewer";

  return (
    <div className="flex flex-col border-b border-line bg-bg-surface/90 text-txt">
      {/* Hidden audio element for receiving WebRTC audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Main Collab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-accent-primary/10 via-bg-surface/60 to-accent-blue/5">
        <div className="flex items-center gap-2">
          {/* Connection status indicator */}
          <div
            className={cx("h-2.5 w-2.5 rounded-full shadow-xs", wsState === "connected" ? "bg-ok shadow-ok/50" : "bg-warn shadow-warn/50")}
            title={wsState === "connected" ? "Real-time sync connected" : "Connecting to room..."}
          />

          <span className="text-[13px] font-bold text-white flex items-center gap-1.5">
            <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={15} />
            {room?.name || "Quantum Studio Room"}
          </span>

          {/* Current User Role Pill */}
          <span
            className={cx(
              "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border select-none",
              isOwner && "bg-amber-500/15 text-amber-300 border-amber-500/30",
              myRole === "editor" && "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
              isViewer && "bg-purple-500/15 text-purple-300 border-purple-500/30"
            )}
          >
            {isOwner ? "👑 Owner" : myRole === "editor" ? "✏️ Editor" : "👁️ Viewer (Read-only)"}
          </span>

          {/* Members Avatar Stack */}
          <button
            type="button"
            onClick={() => setShowParticipants((p) => !p)}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-white/5 transition-colors cursor-pointer"
            title="View participants and manage roles"
          >
            <div className="flex -space-x-1.5">
              {activeMembers.slice(0, 4).map((id) => {
                const member = room?.members.find((m) => m.user_id === id);
                return (
                  <div
                    key={id}
                    className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-tr from-accent-primary to-accent-blue text-[8px] font-bold text-white ring-1 ring-bg-surface"
                    title={member ? `${member.name} (${member.role})` : id}
                  >
                    {member?.avatar_initials || "?"}
                  </div>
                );
              })}
            </div>
            <span className="text-[11px] text-txt-dim font-medium">
              {activeMembers.length} online
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Share Room Button */}
          <button
            type="button"
            onClick={handleGenerateShareInvite}
            disabled={isGeneratingInvite}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/25 transition-all cursor-pointer disabled:opacity-50"
            title="Generate secure shareable invite link"
          >
            <I d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" size={13} />
            <span>{isGeneratingInvite ? "Generating..." : "Share Room"}</span>
          </button>

          {/* Voice Call Controls */}
          {callStatus === "idle" && (
            <button
              type="button"
              onClick={startVoiceCall}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-ok/10 hover:bg-ok/20 text-ok border border-ok/30 transition-all cursor-pointer"
              title="Start real-time voice call with room participants"
            >
              <I d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" size={13} />
              <span>Voice Call</span>
            </button>
          )}

          {callStatus === "calling" && (
            <div className="flex items-center gap-1.5 bg-warn/10 border border-warn/30 px-2 py-0.5 rounded-md">
              <span className="h-2 w-2 rounded-full bg-warn animate-pulse" />
              <span className="text-[11px] font-medium text-warn">Calling...</span>
              <button
                type="button"
                onClick={endVoiceCall}
                className="ml-1 text-[11px] text-txt-dim hover:text-white underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {callStatus === "connected" && (
            <div className="flex items-center gap-1.5 bg-ok/15 border border-ok/30 px-2.5 py-1 rounded-md shadow-xs">
              <span className="h-2 w-2 rounded-full bg-ok animate-ping" />
              <span className="text-[11px] font-bold text-ok flex items-center gap-1">
                <I d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" size={12} />
                Connected
              </span>
              <button
                type="button"
                onClick={toggleMute}
                className={cx(
                  "px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer",
                  isMuted ? "bg-warn/20 text-warn hover:bg-warn/30" : "bg-white/10 text-white hover:bg-white/20"
                )}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? "🔇 Unmute" : "🎙️ Mute"}
              </button>
              <button
                type="button"
                onClick={endVoiceCall}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/20 text-danger hover:bg-danger/30 transition-colors cursor-pointer"
                title="End voice call"
              >
                End
              </button>
            </div>
          )}

          {/* Toggle Chat */}
          <button
            type="button"
            onClick={() => setShowChat((o) => !o)}
            className={cx(
              "grid h-7 w-7 place-items-center rounded-md border transition-colors cursor-pointer",
              showChat
                ? "bg-accent-blue/20 border-accent-blue/40 text-accent-blue"
                : "bg-bg-panel border-line text-txt-dim hover:text-white hover:bg-bg-elevated"
            )}
            title="Toggle room chat"
          >
            <I d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={14} />
          </button>

          {/* Push Circuit Update Button */}
          <button
            type="button"
            onClick={sendCircuitUpdate}
            disabled={isViewer}
            className={cx(
              "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all select-none",
              isViewer
                ? "opacity-40 cursor-not-allowed bg-bg-panel border-line text-txt-faint"
                : "bg-ok/10 hover:bg-ok/25 text-ok border-ok/30 cursor-pointer shadow-xs"
            )}
            title={isViewer ? "Viewers cannot push circuit changes" : "Push your circuit update to all collaborators"}
          >
            <I d="M12 19V5M5 12l7-7 7 7" size={13} />
            <span>Sync Circuit</span>
          </button>
        </div>
      </div>

      {/* Incoming Call Toast Banner */}
      {callStatus === "incoming" && callerInfo && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-ok/20 via-accent-primary/20 to-bg-surface border-y border-ok/40 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ok text-[11px] font-bold text-black">
              {callerInfo.initials}
            </span>
            <div>
              <div className="text-[12px] font-bold text-white">
                Incoming Voice Call
              </div>
              <div className="text-[11px] text-txt-dim">
                <strong className="text-ok">{callerInfo.name}</strong> wants to voice chat in this room.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={joinVoiceCall}
              className="px-3 py-1 rounded-md bg-ok hover:bg-ok/90 text-black text-[11px] font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              Join Call
            </button>
            <button
              type="button"
              onClick={declineVoiceCall}
              className="px-3 py-1 rounded-md bg-bg-panel hover:bg-white/10 text-txt-dim hover:text-white border border-line text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Mic / WebRTC Error Banner */}
      {micError && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-warn/15 border-b border-warn/30 text-[11px] text-warn">
          <span className="flex items-center gap-1.5">
            <I d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={13} />
            {micError}
          </span>
          <button type="button" onClick={() => setMicError(null)} className="text-txt-faint hover:text-white">✕</button>
        </div>
      )}

      {/* Circuit Permission Error Banner */}
      {circuitError && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-danger/15 border-b border-danger/30 text-[11px] text-danger">
          <span className="flex items-center gap-1.5">
            <I d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={13} />
            {circuitError}
          </span>
          <button type="button" onClick={() => setCircuitError(null)} className="text-txt-faint hover:text-white">✕</button>
        </div>
      )}

      {/* Invite link feedback toast */}
      {inviteFeedback && (
        <div className="px-3 py-1.5 bg-accent-blue/15 border-b border-accent-blue/30 text-[11px] text-accent-blue flex items-center justify-between">
          <span>{inviteFeedback}</span>
          <button type="button" onClick={() => setInviteFeedback(null)} className="text-txt-faint hover:text-white">✕</button>
        </div>
      )}

      {/* Participants & Roles Dropdown Panel */}
      {showParticipants && (
        <div className="border-b border-line bg-bg-panel/95 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-txt-dim">
              Room Participants ({room?.members.length || 0})
            </span>
            <button
              type="button"
              onClick={() => setShowParticipants(false)}
              className="text-[11px] text-txt-dim hover:text-white cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {room?.members.map((member) => {
              const isMemberOnline = activeMembers.includes(member.user_id);
              const isCurrentMemberOwner = member.role === "owner";
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-bg-surface/80 border border-line/60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-accent-primary/20 text-[10px] font-bold text-accent-blue">
                        {member.avatar_initials}
                      </div>
                      <span
                        className={cx(
                          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-bg-surface",
                          isMemberOnline ? "bg-ok" : "bg-txt-faint"
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-white truncate">
                        {member.name} {member.user_id === user?.id && <span className="text-txt-dim">(You)</span>}
                      </div>
                      <div className="text-[10px] text-txt-dim capitalize flex items-center gap-1">
                        <span>{member.role}</span>
                        {remoteMuted[member.user_id] && <span className="text-warn">🔇</span>}
                      </div>
                    </div>
                  </div>

                  {/* Role Change actions for Room Owner */}
                  {isOwner && !isCurrentMemberOwner && member.user_id !== user?.id && (
                    <div className="flex items-center gap-1">
                      {member.role === "viewer" ? (
                        <button
                          type="button"
                          onClick={() => handleChangeRole(member.user_id, "editor")}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-blue/15 hover:bg-accent-blue/30 text-accent-blue border border-accent-blue/30 cursor-pointer"
                        >
                          Make Editor
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleChangeRole(member.user_id, "viewer")}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 cursor-pointer"
                        >
                          Make Viewer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room Chat Panel */}
      {showChat && (
        <div className="flex max-h-56 flex-col border-b border-line bg-bg-inset">
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {chatMessages.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-txt-faint">
                No chat messages yet in this room. Collaborate and chat below!
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="text-[12px] leading-relaxed">
                  <span className="font-semibold text-accent-blue mr-1.5">{msg.sender_name}:</span>
                  <span className="text-txt">{msg.content}</span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-1.5 border-t border-line/60 p-2 bg-bg-surface/50">
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Send a message to room collaborators..."
              className="flex-1 rounded-md border border-line bg-bg-panel px-2.5 py-1 text-[12px] text-white placeholder:text-txt-faint focus:border-accent-blue focus:outline-none"
            />
            <button
              type="button"
              onClick={sendChat}
              disabled={!chatDraft.trim()}
              className="rounded-md bg-accent-primary px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40 cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export type { CollabRoomProps };
