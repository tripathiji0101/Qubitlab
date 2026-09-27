import { useState, useEffect, useCallback } from "react";
import { Card, Badge, Button, Chip, cx } from "../components/ui";
import { Reveal } from "../components/motion";
import {
  discussions,
  DiscussionPostResponse,
  DiscussionCreateRequest,
} from "../lib/api";
import { useAuth } from "../lib/auth";

/* ───────────────────── Tag config ───────────────────── */

const TAG_META: Record<string, { label: string; icon: string; tone: string }> = {
  discussion: { label: "Discussion", icon: "💬", tone: "blue" },
  question: { label: "Question", icon: "❓", tone: "warn" },
  solution: { label: "Solution", icon: "✅", tone: "ok" },
  approach: { label: "Approach", icon: "🧪", tone: "violet" },
  tip: { label: "Tip", icon: "💡", tone: "cyan" },
  bug: { label: "Bug Report", icon: "🐛", tone: "red" },
};

const SCOPE_META: Record<string, { label: string; icon: string; desc: string }> = {
  friends: {
    label: "Friends",
    icon: "👥",
    desc: "Visible only to your accepted friends",
  },
  university: {
    label: "University",
    icon: "🏫",
    desc: "Shared with your institution & cohort",
  },
  global: {
    label: "Global",
    icon: "🌐",
    desc: "Open discussion with all QubitLab users",
  },
};

type Scope = "friends" | "university" | "global";
type SortMode = "newest" | "oldest" | "top" | "most_replies";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "top", label: "Top Voted" },
  { value: "most_replies", label: "Most Replies" },
  { value: "oldest", label: "Oldest" },
];

/* ───────────────────── Time Formatting ───────────────────── */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/* ───────────────────── Vote Button ───────────────────── */

function VoteControls({
  post,
  onVote,
}: {
  post: DiscussionPostResponse;
  onVote: (id: string, val: -1 | 0 | 1) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <button
        type="button"
        onClick={() => onVote(post.id, post.user_vote === 1 ? 0 : 1)}
        className={cx(
          "grid h-7 w-7 place-items-center rounded-md border text-[14px] transition-all cursor-pointer",
          post.user_vote === 1
            ? "border-quantum-cyan bg-quantum-cyan/20 text-quantum-cyan"
            : "border-line/40 bg-ink-950/40 text-txt-faint hover:border-quantum-cyan/40 hover:text-quantum-cyan"
        )}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={cx(
          "font-mono text-[13px] font-bold min-w-[24px] text-center",
          post.score > 0
            ? "text-quantum-cyan"
            : post.score < 0
            ? "text-red-400"
            : "text-txt-faint"
        )}
      >
        {post.score}
      </span>
      <button
        type="button"
        onClick={() => onVote(post.id, post.user_vote === -1 ? 0 : -1)}
        className={cx(
          "grid h-7 w-7 place-items-center rounded-md border text-[14px] transition-all cursor-pointer",
          post.user_vote === -1
            ? "border-red-400 bg-red-500/20 text-red-400"
            : "border-line/40 bg-ink-950/40 text-txt-faint hover:border-red-400/40 hover:text-red-400"
        )}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}

/* ───────────────────── Reply Component ───────────────────── */

function ReplyCard({
  reply,
  onVote,
}: {
  reply: DiscussionPostResponse;
  onVote: (id: string, val: -1 | 0 | 1) => void;
}) {
  return (
    <div className="flex gap-3 py-3 border-t border-line/30 first:border-t-0">
      <VoteControls post={reply} onVote={onVote} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-quantum-blue/20 text-quantum-blue text-[10px] font-bold">
            {reply.author.avatar_initials}
          </span>
          <span className="font-mono font-600 text-txt">{reply.author.name}</span>
          <span className="text-txt-faint">· {timeAgo(reply.created_at)}</span>
          {reply.is_accepted && (
            <Badge tone="ok" className="text-[10px]">
              ✓ Accepted
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-txt-dim whitespace-pre-wrap">
          {reply.body}
        </p>
      </div>
    </div>
  );
}

/* ───────────────────── Post Detail Modal ───────────────────── */

function PostDetailModal({
  postId,
  onClose,
  onVote,
  currentUserId,
}: {
  postId: string;
  onClose: () => void;
  onVote: (id: string, val: -1 | 0 | 1) => void;
  currentUserId: string;
}) {
  const [post, setPost] = useState<DiscussionPostResponse | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      const data = await discussions.get(postId);
      setPost(data);
    } catch {
      /* ignore */
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleReply = async () => {
    if (!replyBody.trim() || !post) return;
    setSubmitting(true);
    try {
      await discussions.create({
        scope: post.scope as Scope,
        topic: post.topic ?? undefined,
        parent_id: post.id,
        body: replyBody.trim(),
      });
      setReplyBody("");
      await loadPost();
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  if (!post) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div className="text-txt-faint font-mono text-[13px] animate-pulse">
          Loading discussion...
        </div>
      </div>
    );
  }

  const tagMeta = TAG_META[post.tag] ?? TAG_META.discussion;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-2xl border border-line/60 bg-ink-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line/60 p-5 bg-ink-950/60">
          <div className="flex gap-3 flex-1 min-w-0">
            <VoteControls post={post} onVote={onVote} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge tone={tagMeta.tone as "blue"}>
                  {tagMeta.icon} {tagMeta.label}
                </Badge>
                {post.is_pinned && (
                  <Badge tone="cyan" className="text-[10px]">
                    📌 Pinned
                  </Badge>
                )}
              </div>
              <h2 className="font-display text-xl font-700 text-txt leading-tight">
                {post.title}
              </h2>
              <div className="mt-1.5 flex items-center gap-2 text-[12px] text-txt-faint">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-quantum-cyan/20 text-quantum-cyan text-[10px] font-bold">
                  {post.author.avatar_initials}
                </span>
                <span className="font-mono font-600 text-txt-dim">
                  {post.author.name}
                </span>
                <span>·</span>
                <span>Lvl {post.author.current_level}</span>
                <span>·</span>
                <span>{timeAgo(post.created_at)}</span>
                <span>·</span>
                <span>👁 {post.view_count}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line/60 bg-ink-900 text-txt-dim hover:text-white hover:border-line text-sm cursor-pointer transition-colors shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body + Replies (scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Post body */}
          <div className="text-[14px] leading-relaxed text-txt whitespace-pre-wrap">
            {post.body}
          </div>

          {/* Replies section */}
          <div className="border-t border-line/50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-[12px] font-bold uppercase text-txt-faint tracking-wider">
                {post.reply_count} {post.reply_count === 1 ? "Reply" : "Replies"}
              </h3>
            </div>

            {post.replies.length > 0 ? (
              <div className="space-y-0">
                {post.replies.map((r) => (
                  <ReplyCard key={r.id} reply={r} onVote={onVote} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-txt-faint italic py-3">
                No replies yet. Be the first to respond!
              </p>
            )}
          </div>
        </div>

        {/* Reply input */}
        <div className="border-t border-line/60 p-4 bg-ink-950/70">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write a reply..."
            className="w-full rounded-xl border border-line/60 bg-ink-900/60 px-4 py-3 text-[13px] text-txt placeholder:text-txt-faint focus:outline-none focus:border-quantum-cyan/50 resize-none min-h-[80px]"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              className="font-mono text-[12px]"
              onClick={handleReply}
              disabled={!replyBody.trim() || submitting}
            >
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── New Post Form ───────────────────── */

function NewPostForm({
  scope,
  onCreated,
  onCancel,
}: {
  scope: Scope;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("discussion");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await discussions.create({
        scope,
        title: title.trim(),
        body: body.trim(),
        tag,
      } as DiscussionCreateRequest);
      onCreated();
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 space-y-4 border-quantum-cyan/30 bg-quantum-cyan/[0.02] animate-rise">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-700 text-txt flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-quantum-cyan" />
          New Discussion
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] font-mono text-txt-faint hover:text-txt cursor-pointer"
        >
          Cancel ✕
        </button>
      </div>

      {/* Tag selection */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(TAG_META).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTag(key)}
            className={cx(
              "rounded-md border px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer",
              tag === key
                ? "border-quantum-cyan/60 bg-quantum-cyan/20 text-quantum-cyan"
                : "border-line/40 bg-ink-950/40 text-txt-faint hover:border-line hover:text-txt-dim"
            )}
          >
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Discussion title..."
        className="w-full rounded-xl border border-line/60 bg-ink-900/60 px-4 py-3 text-[14px] text-txt placeholder:text-txt-faint focus:outline-none focus:border-quantum-cyan/50 font-display font-600"
        maxLength={300}
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts, questions, or solutions..."
        className="w-full rounded-xl border border-line/60 bg-ink-900/60 px-4 py-3 text-[13px] text-txt placeholder:text-txt-faint focus:outline-none focus:border-quantum-cyan/50 resize-none min-h-[120px]"
        rows={5}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-txt-faint">
          Posting to {SCOPE_META[scope].icon} {SCOPE_META[scope].label}
        </span>
        <Button
          size="sm"
          className="font-mono text-[12px] glow-cyan"
          onClick={handleSubmit}
          disabled={!title.trim() || !body.trim() || submitting}
        >
          {submitting ? "Posting..." : "Publish Discussion 🚀"}
        </Button>
      </div>
    </Card>
  );
}

/* ───────────────────── Post Preview Card ───────────────────── */

function PostCard({
  post,
  onVote,
  onClick,
}: {
  post: DiscussionPostResponse;
  onVote: (id: string, val: -1 | 0 | 1) => void;
  onClick: () => void;
}) {
  const tagMeta = TAG_META[post.tag] ?? TAG_META.discussion;

  return (
    <Card
      className="p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-quantum-cyan/30 hover:shadow-[0_8px_30px_-15px_rgba(53,224,216,0.15)] cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Vote column */}
        <div onClick={(e) => e.stopPropagation()}>
          <VoteControls post={post} onVote={onVote} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge tone={tagMeta.tone as "blue"} className="text-[10px]">
              {tagMeta.icon} {tagMeta.label}
            </Badge>
            {post.is_pinned && (
              <span className="text-[10px] font-mono text-quantum-cyan bg-quantum-cyan/10 border border-quantum-cyan/20 px-1.5 py-0.5 rounded">
                📌 Pinned
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-[15px] font-700 text-txt group-hover:text-quantum-cyan transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Preview body (truncated) */}
          <p className="mt-1 text-[12px] text-txt-dim leading-relaxed line-clamp-2">
            {post.body}
          </p>

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-txt-faint">
            <span className="flex items-center gap-1">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-quantum-blue/15 text-quantum-blue text-[9px] font-bold">
                {post.author.avatar_initials}
              </span>
              <span className="text-txt-dim">{post.author.name}</span>
            </span>
            <span>Lvl {post.author.current_level}</span>
            <span>{timeAgo(post.created_at)}</span>
            <span className="flex items-center gap-1">
              💬 {post.reply_count}
            </span>
            <span className="flex items-center gap-1">
              👁 {post.view_count}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   Main Discussion Page
   ═══════════════════════════════════════════════════ */

export default function Discussion() {
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope>("global");
  const [sort, setSort] = useState<SortMode>("newest");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<DiscussionPostResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const pageSize = 15;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await discussions.list({
        scope,
        tag: tagFilter ?? undefined,
        search: searchQuery || undefined,
        sort,
        page,
        page_size: pageSize,
      });
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      /* graceful fallback */
    } finally {
      setLoading(false);
    }
  }, [scope, tagFilter, searchQuery, sort, page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [scope, tagFilter, searchQuery, sort]);

  const handleVote = async (postId: string, value: -1 | 0 | 1) => {
    try {
      const updated = await discussions.vote(postId, value);
      // Update in list
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updated, replies: p.replies } : p))
      );
    } catch {
      /* ignore */
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-cyan">
            <span className="h-2 w-2 rounded-full bg-quantum-cyan animate-pulse" />
            Community Hub
          </div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight md:text-4xl text-txt">
            Discussions
          </h1>
          <p className="mt-2 text-base text-txt-dim max-w-xl leading-relaxed">
            Share ideas, ask questions, post solutions, and learn together across three visibility tiers.
          </p>
        </div>

        <Button
          className="font-mono text-[13px] glow-cyan"
          onClick={() => setShowNewPost(!showNewPost)}
        >
          {showNewPost ? "Cancel" : "New Discussion ✍️"}
        </Button>
      </Reveal>

      {/* ── 3-Tier Scope Tabs ── */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {(["friends", "university", "global"] as Scope[]).map((s) => {
          const meta = SCOPE_META[s];
          const active = scope === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={cx(
                "relative rounded-xl border p-4 text-left transition-all cursor-pointer group",
                active
                  ? "border-quantum-cyan/60 bg-quantum-cyan/[0.06] shadow-[0_0_25px_rgba(53,224,216,0.12)]"
                  : "border-line/50 bg-ink-900/40 hover:border-line-strong hover:bg-ink-900/60"
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl border-2 border-quantum-cyan/30 animate-pulse pointer-events-none" />
              )}
              <div className="flex items-center gap-2">
                <span className="text-xl">{meta.icon}</span>
                <span
                  className={cx(
                    "font-display text-[15px] font-700",
                    active ? "text-quantum-cyan" : "text-txt"
                  )}
                >
                  {meta.label}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-txt-faint leading-tight">
                {meta.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── New Post Form ── */}
      {showNewPost && (
        <div className="mt-6">
          <NewPostForm
            scope={scope}
            onCreated={() => {
              setShowNewPost(false);
              loadPosts();
            }}
            onCancel={() => setShowNewPost(false)}
          />
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {/* Tag filters */}
        <div className="flex flex-wrap gap-1.5">
          <Chip active={tagFilter === null} onClick={() => setTagFilter(null)}>
            All
          </Chip>
          {Object.entries(TAG_META).map(([key, meta]) => (
            <Chip
              key={key}
              active={tagFilter === key}
              onClick={() => setTagFilter(tagFilter === key ? null : key)}
            >
              {meta.icon} {meta.label}
            </Chip>
          ))}
        </div>

        {/* Sort + Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="rounded-lg border border-line/50 bg-ink-900/60 px-3 py-1.5 text-[12px] text-txt placeholder:text-txt-faint focus:outline-none focus:border-quantum-cyan/40 w-[160px] font-mono"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-line/50 bg-ink-900/60 px-2.5 py-1.5 text-[12px] text-txt font-mono cursor-pointer focus:outline-none focus:border-quantum-cyan/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Posts List ── */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-quantum-cyan border-t-transparent" />
            <p className="mt-3 text-[13px] font-mono text-txt-faint">
              Loading discussions...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="text-4xl mb-3">
              {scope === "friends" ? "👥" : scope === "university" ? "🏫" : "🌐"}
            </div>
            <h3 className="font-display text-lg font-700 text-txt">
              No Discussions Yet
            </h3>
            <p className="mt-1 text-[13px] text-txt-dim max-w-md mx-auto">
              {scope === "friends"
                ? "Start a discussion with your friends! They will be the only ones who can see it."
                : scope === "university"
                ? "Be the first in your university to start a discussion."
                : "Be the first to start a global discussion for the entire QubitLab community!"}
            </p>
            <Button
              className="mt-4 font-mono text-[12px]"
              onClick={() => setShowNewPost(true)}
            >
              Start First Discussion ✍️
            </Button>
          </Card>
        ) : (
          posts.map((post) => (
            <Reveal key={post.id} delay={0}>
              <PostCard
                post={post}
                onVote={handleVote}
                onClick={() => setSelectedPostId(post.id)}
              />
            </Reveal>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="font-mono text-[11px]"
          >
            ← Prev
          </Button>
          <span className="font-mono text-[12px] text-txt-faint px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="font-mono text-[11px]"
          >
            Next →
          </Button>
        </div>
      )}

      {/* ── Post Detail Modal ── */}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onVote={handleVote}
          currentUserId={user?.id ?? ""}
        />
      )}
    </div>
  );
}
