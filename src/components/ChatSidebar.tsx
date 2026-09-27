/**
 * ChatSidebar — Slide-in chat panel for DMs with friends
 *
 * Can be placed in AppShell or Workspace for global chat access.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { social, type FriendResponse, type MessageResponse } from "@/lib/api";
import { useChatWebSocket, type WSDMMessage, type WSPresenceMessage } from "@/lib/ws";
import { cx } from "@/components/ui";

function I({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { user } = useAuth();
  const { state: wsState, send, onMessage } = useChatWebSocket();
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [activeFriend, setActiveFriend] = useState<FriendResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});

  // Load friends list
  useEffect(() => {
    if (open && user) {
      social.friends().then(setFriends).catch(() => {});
    }
  }, [open, user]);

  // Handle incoming DMs
  useEffect(() => {
    const unsub = onMessage("dm", (data) => {
      const msg = data as unknown as WSDMMessage;
      if (activeFriend && (msg.sender_id === activeFriend.user.id || msg.recipient_id === activeFriend.user.id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            sender_initials: "",
            recipient_id: msg.recipient_id,
            room_id: null,
            content: msg.content,
            read: true,
            created_at: msg.created_at,
          }];
        });
      } else if (msg.sender_id !== user?.id) {
        // Unread badge
        setUnread((prev) => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }));
      }
    });
    return unsub;
  }, [onMessage, activeFriend, user]);

  // Handle presence updates
  useEffect(() => {
    const unsub = onMessage("presence", (data) => {
      const p = data as unknown as WSPresenceMessage;
      setFriends((prev) =>
        prev.map((f) =>
          f.user.id === p.user_id ? { ...f, is_online: p.online } : f,
        ),
      );
    });
    return unsub;
  }, [onMessage]);

  // Load DM history when selecting a friend
  const openChat = useCallback(async (friend: FriendResponse) => {
    setActiveFriend(friend);
    setLoadingMessages(true);
    setUnread((prev) => { const n = { ...prev }; delete n[friend.user.id]; return n; });
    try {
      const msgs = await social.messages(friend.user.id);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!draft.trim() || !activeFriend) return;
    send("dm", { recipient_id: activeFriend.user.id, content: draft.trim() });
    setDraft("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-[340px] flex-col border-l border-line bg-bg-surface shadow-2xl">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-line px-4">
        {activeFriend ? (
          <button onClick={() => setActiveFriend(null)} className="flex items-center gap-2 text-sm font-500 text-txt hover:text-accent-blue">
            <I d="M19 12H5M12 19l-7-7 7-7" />
            Back
          </button>
        ) : (
          <span className="text-sm font-600 text-txt">Chat</span>
        )}
        <div className="flex items-center gap-2">
          <span className={cx("h-2 w-2 rounded-full", wsState === "connected" ? "bg-ok" : wsState === "connecting" ? "bg-warn" : "bg-txt-faint")} />
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg text-txt-dim hover:bg-white/5 hover:text-txt">
            <I d="M18 6 6 18M6 6l12 12" />
          </button>
        </div>
      </div>

      {!activeFriend ? (
        /* Friend list */
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-txt-faint">
              No friends yet. Visit the Social page to connect with others.
            </div>
          ) : (
            friends.map((f) => (
              <button
                key={f.id}
                onClick={() => openChat(f)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
              >
                <div className="relative">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[12px] font-600 text-white">
                    {f.user.avatar_initials}
                  </div>
                  <span className={cx("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-surface", f.is_online ? "bg-ok" : "bg-txt-faint")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[13px] font-500 text-txt">{f.user.name}</span>
                    {unread[f.user.id] ? (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-primary px-1 text-[10px] font-600 text-white">{unread[f.user.id]}</span>
                    ) : null}
                  </div>
                  <span className={cx("text-[11px]", f.is_online ? "text-ok" : "text-txt-faint")}>{f.is_online ? "Online" : "Offline"}</span>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        /* Chat thread */
        <>
          <div className="flex items-center gap-3 border-b border-line-subtle px-4 py-2.5">
            <div className="relative">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[11px] font-600 text-white">
                {activeFriend.user.avatar_initials}
              </div>
              <span className={cx("absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-bg-surface", activeFriend.is_online ? "bg-ok" : "bg-txt-faint")} />
            </div>
            <div>
              <div className="text-[13px] font-500 text-txt">{activeFriend.user.name}</div>
              <span className={cx("text-[11px]", activeFriend.is_online ? "text-ok" : "text-txt-faint")}>{activeFriend.is_online ? "Online" : "Offline"}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-txt-faint">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cx("mb-2 flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cx(
                      "max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                      isMine
                        ? "bg-accent-primary text-white"
                        : "bg-white/[0.06] text-txt",
                    )}>
                      {msg.content}
                      <div className={cx("mt-0.5 text-[10px]", isMine ? "text-white/60" : "text-txt-faint")}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-line p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-line bg-bg-panel px-3 py-2 text-[13px] text-txt placeholder:text-txt-faint focus:border-accent-blue focus:outline-none"
              />
              <button onClick={sendMessage} disabled={!draft.trim()} className="grid h-9 w-9 place-items-center rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-50">
                <I d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
