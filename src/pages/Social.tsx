/**
 * Social Hub — Friends, Requests, Search, and Collaboration Rooms
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth";
import {
  social,
  rooms,
  type UserSearchResult,
  type FriendResponse,
  type FriendRequestResponse,
  type RoomListItem,
} from "@/lib/api";
import { cx } from "@/components/ui";

type Tab = "friends" | "requests" | "search" | "rooms";

// ── SVG Icon helper ──
function I({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

export default function Social() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [requests, setRequests] = useState<FriendRequestResponse[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [myRooms, setMyRooms] = useState<RoomListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) nav("/auth/login", { replace: true });
  }, [authLoading, isAuthenticated, nav]);

  // ── Load data on tab change ──
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "friends") setFriends(await social.friends());
      else if (tab === "requests") setRequests(await social.requests());
      else if (tab === "rooms") setMyRooms(await rooms.list());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [loadData, isAuthenticated]);

  // ── Handlers ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setSearchResults(await social.search(searchQuery.trim()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await social.sendRequest(userId);
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, request_pending: true } : u)),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send request");
    }
  };

  const handleRespondRequest = async (requestId: string, accept: boolean) => {
    try {
      await social.respondRequest(requestId, accept);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (accept) loadData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to respond");
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await social.removeFriend(friendshipId);
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to remove friend");
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await rooms.create(newRoomName.trim());
      setNewRoomName("");
      setMyRooms(await rooms.list());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    }
  };

  const handleCloseRoom = async (roomId: string) => {
    try {
      await rooms.close(roomId);
      setMyRooms(await rooms.list());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to close room");
    }
  };

  if (authLoading) return null;

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "friends", label: "Friends", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
    { key: "requests", label: "Requests", icon: "M16 21v-2a4 4 0 0 0-2.13-3.54M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", badge: requests.length },
    { key: "search", label: "Find Users", icon: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" },
    { key: "rooms", label: "Collab Rooms", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 7a4 4 0 1 1 0 8 4 4 0 0 0 0-8z" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-700 tracking-tight text-txt">Social Hub</h1>
        <p className="mt-1 text-sm text-txt-dim">Connect, chat, and collaborate with fellow quantum learners</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cx(
              "relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-500 transition-all",
              tab === t.key
                ? "bg-accent-primary/15 text-accent-blue shadow-sm"
                : "text-txt-dim hover:bg-white/[0.04] hover:text-txt",
            )}
          >
            <I d={t.icon} />
            <span className="hidden sm:inline">{t.label}</span>
            {t.badge && t.badge > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-primary px-1 text-[10px] font-600 text-white">{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-txt-dim">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          <span className="ml-3 text-sm">Loading...</span>
        </div>
      )}

      {/* ── Friends Tab ── */}
      {tab === "friends" && !loading && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <div className="rounded-xl border border-line bg-bg-surface px-6 py-12 text-center">
              <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" className="mx-auto mb-3 h-8 w-8 text-txt-faint" />
              <p className="text-txt-dim">No friends yet</p>
              <p className="mt-1 text-sm text-txt-faint">Search for other QubitLab users to connect</p>
              <button onClick={() => setTab("search")} className="mt-4 rounded-lg bg-accent-primary px-4 py-2 text-sm font-500 text-white hover:bg-accent-primary/90">
                Find Users
              </button>
            </div>
          ) : (
            friends.map((f) => (
              <div key={f.id} className="flex items-center gap-4 rounded-xl border border-line bg-bg-surface px-4 py-3 transition-colors hover:border-line-strong">
                {/* Avatar */}
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[13px] font-600 text-white">
                    {f.user.avatar_initials}
                  </div>
                  <span className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-surface", f.is_online ? "bg-ok" : "bg-txt-faint")} />
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-500 text-txt">{f.user.name}</span>
                    <span className={cx("text-[11px]", f.is_online ? "text-ok" : "text-txt-faint")}>{f.is_online ? "Online" : "Offline"}</span>
                  </div>
                  <p className="text-[12px] text-txt-faint">Level {f.user.current_level} · {f.user.xp} XP</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveFriend(f.id)}
                    className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-txt-dim hover:border-danger/50 hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Requests Tab ── */}
      {tab === "requests" && !loading && (
        <div className="space-y-2">
          {requests.length === 0 ? (
            <div className="rounded-xl border border-line bg-bg-surface px-6 py-12 text-center">
              <p className="text-txt-dim">No pending requests</p>
              <p className="mt-1 text-sm text-txt-faint">Friend requests from other users will appear here</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 rounded-xl border border-line bg-bg-surface px-4 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[13px] font-600 text-white">
                  {req.requester.avatar_initials}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-500 text-txt">{req.requester.name}</span>
                  <p className="text-[12px] text-txt-faint">Level {req.requester.current_level} · {req.requester.xp} XP</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRespondRequest(req.id, true)} className="rounded-lg bg-accent-primary px-3 py-1.5 text-[12px] font-500 text-white hover:bg-accent-primary/90">
                    Accept
                  </button>
                  <button onClick={() => handleRespondRequest(req.id, false)} className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-txt-dim hover:border-danger/50 hover:text-danger">
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Search Tab ── */}
      {tab === "search" && (
        <div>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name or email..."
              className="flex-1 rounded-lg border border-line bg-bg-panel px-4 py-2.5 text-sm text-txt placeholder:text-txt-faint focus:border-accent-blue focus:outline-none"
            />
            <button onClick={handleSearch} disabled={loading || !searchQuery.trim()} className="rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-500 text-white hover:bg-accent-primary/90 disabled:opacity-50">
              Search
            </button>
          </div>
          {!loading && (
            <div className="space-y-2">
              {searchResults.length === 0 && searchQuery ? (
                <p className="py-8 text-center text-sm text-txt-faint">No users found matching &quot;{searchQuery}&quot;</p>
              ) : (
                searchResults.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 rounded-xl border border-line bg-bg-surface px-4 py-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[13px] font-600 text-white">
                      {u.avatar_initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-500 text-txt">{u.name}</span>
                      <p className="text-[12px] text-txt-faint">Level {u.current_level} · {u.xp} XP</p>
                    </div>
                    <div>
                      {u.is_friend ? (
                        <span className="rounded-lg border border-ok/30 px-3 py-1.5 text-[12px] text-ok">Friends</span>
                      ) : u.request_pending ? (
                        <span className="rounded-lg border border-warn/30 px-3 py-1.5 text-[12px] text-warn">Pending</span>
                      ) : (
                        <button onClick={() => handleSendRequest(u.id)} className="rounded-lg bg-accent-primary px-3 py-1.5 text-[12px] font-500 text-white hover:bg-accent-primary/90">
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Rooms Tab ── */}
      {tab === "rooms" && !loading && (
        <div>
          {/* Create room */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              placeholder="New room name..."
              className="flex-1 rounded-lg border border-line bg-bg-panel px-4 py-2.5 text-sm text-txt placeholder:text-txt-faint focus:border-accent-blue focus:outline-none"
            />
            <button onClick={handleCreateRoom} disabled={!newRoomName.trim()} className="rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-500 text-white hover:bg-accent-primary/90 disabled:opacity-50">
              Create Room
            </button>
          </div>

          <div className="space-y-2">
            {myRooms.length === 0 ? (
              <div className="rounded-xl border border-line bg-bg-surface px-6 py-12 text-center">
                <p className="text-txt-dim">No active rooms</p>
                <p className="mt-1 text-sm text-txt-faint">Create a room to start collaborating on quantum circuits</p>
              </div>
            ) : (
              myRooms.map((room) => (
                <div key={room.id} className="flex items-center gap-4 rounded-xl border border-line bg-bg-surface px-4 py-3 transition-colors hover:border-line-strong">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-primary/15 text-accent-blue">
                    <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-500 text-txt">{room.name}</span>
                    <p className="text-[12px] text-txt-faint">
                      {room.member_count} member{room.member_count !== 1 ? "s" : ""} · by {room.owner_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => nav(`/workspace?room=${room.id}`)}
                      className="rounded-lg bg-accent-primary/15 px-3 py-1.5 text-[12px] font-500 text-accent-blue hover:bg-accent-primary/25"
                    >
                      Open Studio
                    </button>
                    <button
                      onClick={() => handleCloseRoom(room.id)}
                      className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-txt-dim hover:border-danger/50 hover:text-danger"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
