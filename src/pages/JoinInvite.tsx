/**
 * JoinInvite — Accept a shareable collaboration room invite
 *
 * Handles public invite token verification, unauthenticated redirect
 * with destination preservation, and server-side room joining.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/lib/auth";
import { rooms, type RoomInviteInfo } from "@/lib/api";

export default function JoinInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [invite, setInvite] = useState<RoomInviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invite token provided.");
      setLoading(false);
      return;
    }

    rooms
      .getInvite(token)
      .then((data) => {
        setInvite(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const error = err as { detail?: string; message?: string };
        setError(error.detail || error.message || "This invitation link is invalid or has expired.");
        setLoading(false);
      });
  }, [token]);

  const handleJoin = async () => {
    if (!token) return;
    setJoining(true);
    setError(null);
    try {
      const room = await rooms.joinByInvite(token);
      navigate(`/workspace?room=${room.id}`);
    } catch (err: unknown) {
      const error = err as { detail?: string; message?: string };
      setError(error.detail || error.message || "Failed to join room. Please try again.");
      setJoining(false);
    }
  };

  const handleLoginRedirect = () => {
    if (token) {
      sessionStorage.setItem("post_login_redirect", `/collaborate/join/${token}`);
    }
    navigate("/login");
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
          <p className="text-[13px] text-txt-dim">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-danger/30 bg-bg-surface p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-danger/15 text-2xl text-danger">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-white font-display mb-1.5">Invitation Unavailable</h2>
          <p className="text-[13px] text-txt-dim mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/workspace")}
            className="w-full rounded-xl bg-bg-panel border border-line py-2.5 text-[13px] font-semibold text-white hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-line/70 bg-bg-surface p-7 text-center shadow-2xl">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent-blue/15 text-2xl text-accent-blue">
            🔐
          </div>
          <h2 className="text-lg font-bold text-white font-display mb-1.5">Join Quantum Studio</h2>
          <p className="text-[13px] text-txt-dim mb-5">
            <strong className="text-white">{invite?.inviter_name}</strong> invited you to collaborate on{" "}
            <strong className="text-accent-blue font-semibold">{invite?.room_name}</strong>.
          </p>
          <p className="text-[12px] text-txt-faint mb-6">
            Please log in or sign up with your QubitLab account to accept this invitation.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="w-full rounded-xl bg-accent-primary hover:bg-accent-primary/90 py-2.5 text-[13px] font-bold text-white transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Log In to Accept Invitation
            </button>
            <button
              type="button"
              onClick={() => navigate("/workspace")}
              className="w-full rounded-xl bg-transparent py-2 text-[12px] font-medium text-txt-dim hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-line/80 bg-bg-surface p-7 text-center shadow-2xl">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-blue text-2xl text-white shadow-lg">
          ⚛️
        </div>
        <h2 className="text-xl font-bold text-white font-display mb-1.5">Join Quantum Studio</h2>
        <p className="text-[14px] text-txt-dim mb-4">
          <strong className="text-white">{invite?.inviter_name}</strong> invited you to collaborate on circuit{" "}
          <span className="text-accent-blue font-semibold">{invite?.room_name}</span>.
        </p>

        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-300">
          <span>Joining as:</span>
          <span className="capitalize font-bold text-white">{invite?.role || "viewer"}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="flex-1 rounded-xl bg-accent-primary hover:bg-accent-primary/90 py-2.5 text-[13px] font-bold text-white transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/workspace")}
            disabled={joining}
            className="flex-1 rounded-xl bg-bg-panel hover:bg-bg-elevated border border-line py-2.5 text-[13px] font-semibold text-txt-dim hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
