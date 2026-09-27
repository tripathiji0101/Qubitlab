import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Button, Card, Badge, Progress, Stat, cx } from "../components/ui";
import { Count, Sparkbars } from "../components/motion";
import { levels as staticLevels } from "../lib/data";
import { dashboard as dashboardApi, type DashboardResponse, type LevelResponse, getAccessToken } from "../lib/api";

const days = ["M", "T", "W", "T", "F", "S", "S"];

// XP thresholds per level (mirrors backend)
const xpThresholds = [0, 2000, 5000, 10000, 20000, 50000];

export default function Dashboard() {
  const [recOpen, setRecOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    dashboardApi
      .get()
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        // Fall back to static data if backend is unavailable
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive display values — from API data if available, otherwise from static defaults
  const userName = (data?.user as Record<string, unknown>)?.name as string ?? "Alex";
  const userXp = data?.xp ?? 2450;
  const currentLevel = data?.current_level ?? 2;
  const xpCeiling = xpThresholds[Math.min(currentLevel, xpThresholds.length - 1)] || 3000;
  const xpToNext = data?.xp_to_next_level ?? 550;
  const streak = data?.streak ?? 7;
  const weeklyXp = data?.weekly_xp ?? [320, 180, 540, 410, 260, 620, 480];
  const totalWeeklyXp = weeklyXp.reduce((a, b) => a + b, 0);
  const xpPercent = xpCeiling > 0 ? Math.min(100, Math.round((userXp / xpCeiling) * 100)) : 0;

  // Use API levels if available, otherwise fall back to static
  const displayLevels: Array<{
    n: number; role: string; title: string; algorithm: string;
    status: string; progress: number; slug: string;
  }> = data?.levels ?? staticLevels;

  const activeProject = data?.active_project as Record<string, unknown> | null;
  const activeSlug = (activeProject?.slug as string) ??
    displayLevels.find((l) => l.status === "active")?.slug ?? "deutsch-jozsa";
  const activeTitle = (activeProject?.title as string) ??
    displayLevels.find((l) => l.status === "active")?.title ?? "Instant Database Verification";
  const activeAlgorithm = (activeProject?.algorithm as string) ??
    displayLevels.find((l) => l.status === "active")?.algorithm ?? "Deutsch–Jozsa";
  const activeProgress = (activeProject?.progress as number) ??
    displayLevels.find((l) => l.status === "active")?.progress ?? 62;

  const stats = data?.stats as Record<string, number> | undefined;
  const challengesDone = stats?.challenges_completed ?? 14;
  const projectsDone = stats?.projects_completed ?? 1;
  const totalProjects = stats?.total_projects ?? 12;

  // Level role name for current level
  const currentLevelData = displayLevels.find((l) => l.n === currentLevel);
  const levelRoleName = currentLevelData?.role ?? "Quantum Logic Designer";

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const recommendation = data?.recommendation as {
    concept?: string;
    text?: string;
    action_label?: string;
    link?: string;
    level_slug?: string;
    mastery?: number;
  } | null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <div className="animate-rise">
        <p className="font-mono text-[13px] font-600 text-accent-teal uppercase tracking-widest">{dateStr}</p>
        <h1 className="mt-2 font-display text-4xl font-700 tracking-tight text-txt">Welcome back, {userName}.</h1>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* progress hero */}
        <Card className="relative overflow-hidden p-8">
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge tone="violet">Level {currentLevel}</Badge>
              <h2 className="mt-3 font-display text-3xl font-700 text-txt">{levelRoleName}</h2>
              <p className="mt-1 text-txt-dim font-500">{activeTitle} · {activeAlgorithm}</p>
            </div>
            <div className="text-right">
              <div className="font-display text-4xl font-800 text-txt"><Count to={userXp} /><span className="text-xl text-txt-faint"> / {xpCeiling.toLocaleString()} XP</span></div>
              <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[14px] font-600 text-warn">
                <span>🔥</span> {streak}-day streak
              </div>
            </div>
          </div>
          <div className="relative mt-8">
            <Progress value={xpPercent} tone="violet" />
            <div className="mt-3 flex justify-between text-[13px] font-600 text-txt-dim">
              <span>{xpToNext.toLocaleString()} XP to Level {currentLevel + 1}</span><span>{xpPercent}%</span>
            </div>
          </div>
          <div className="relative mt-8 flex flex-wrap items-center gap-4 rounded-3xl clay-inset p-5">
            <div className="flex-1 min-w-[180px]">
              <div className="text-[12px] font-600 uppercase tracking-widest text-txt-faint">Continue mission</div>
              <div className="mt-1 font-600 text-txt">{activeTitle}</div>
              <Progress value={activeProgress} className="mt-3" />
            </div>
            <Link to={`/learn/${activeSlug}`}><Button size="lg">Continue Mission →</Button></Link>
          </div>
        </Card>

        {/* recommendation + weekly activity */}
        <div className="flex flex-col gap-6">
          {recOpen ? (
            <Card className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-teal/15 text-accent-teal text-lg">✦</span>
                <span className="font-display text-lg font-600 text-txt">Recommended for you</span>
                <Badge tone="cyan" className="ml-auto">AI</Badge>
              </div>
              <p className="mt-4 flex-1 text-[15px] font-500 leading-relaxed text-txt-dim">
                {recommendation?.text ? (
                  recommendation.concept ? (
                    <>
                      Target topic: <span className="text-txt font-600">{recommendation.concept}</span>. {recommendation.text}
                    </>
                  ) : (
                    recommendation.text
                  )
                ) : (
                  <>
                    Continue working on <span className="text-txt font-600">{activeAlgorithm}</span> to progress through your quantum curriculum.
                  </>
                )}
              </p>
              <div className="mt-4 flex gap-3">
                <Link to={recommendation?.link ?? `/learn/${activeSlug}`}>
                  <Button size="sm" variant="secondary">
                    {recommendation?.action_label ?? "Continue project"}
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => setRecOpen(false)}>Dismiss</Button>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-1 items-center justify-between p-6 text-[14px] font-500 text-txt-dim animate-rise">
              <span>Recommendation dismissed.</span>
              <Button size="sm" variant="ghost" onClick={() => setRecOpen(true)}>Undo</Button>
            </Card>
          )}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-600 uppercase tracking-widest text-txt-faint">This week's XP</span>
              <span className="font-display text-2xl font-700 text-txt"><Count to={totalWeeklyXp} /></span>
            </div>
            <div className="mt-4 flex h-20 items-end gap-2">
              <Sparkbars data={weeklyXp} className="h-full flex-1" />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] font-600 text-txt-faint">
              {days.map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
            </div>
          </Card>
        </div>
      </div>

      {/* stat row */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Weekly XP" value={<Count to={totalWeeklyXp} />} delta="+18% vs last week" />
        <Stat label="Learning streak" value={<><Count to={streak} /> days</>} delta="Personal best" />
        <Stat label="Concepts mastered" value={<Count to={projectsDone * 3} />} />
        <Stat label="Challenges done" value={<Count to={challengesDone} />} delta="+3 this week" />
        <Stat label="Current rank" value={<>#<Count to={6} /></>} delta="↑ 12 positions" />
      </div>

      {/* journey */}
      <div className="mt-12 flex items-end justify-between px-2">
        <h2 className="font-display text-2xl font-700 text-txt">Your Quantum Journey</h2>
        <Link to="/learn" className="text-[14px] font-600 text-accent-teal hover:underline">View full path →</Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {displayLevels.slice(0, 5).map((l) => {
          const locked = l.status === "locked";
          return (
            <Card key={l.n} className={cx("relative flex flex-col p-5", locked && "opacity-60")}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-600 text-txt-faint tracking-widest">LEVEL {l.n}</span>
                {l.status === "completed" && <Badge tone="ok">Done</Badge>}
                {l.status === "active" && <Badge tone="cyan">Active</Badge>}
                {locked && <span className="text-txt-faint opacity-50">🔒</span>}
              </div>
              <div className="mt-4 font-display text-lg font-600 text-txt leading-tight">{l.role}</div>
              <div className="mt-1.5 text-[14px] font-500 text-txt-dim">{l.algorithm}</div>
              <div className="mt-auto pt-6">
                {locked ? (
                  <div className="text-[13px] font-500 text-txt-faint">Complete Level {l.n - 1} to unlock</div>
                ) : (
                  <>
                    <Progress value={l.progress} />
                    <Link to={`/learn/${l.slug}`} className="mt-4 inline-block text-[14px] font-600 text-accent-teal hover:underline">
                      {l.status === "completed" ? "Review" : "Continue"} →
                    </Link>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
