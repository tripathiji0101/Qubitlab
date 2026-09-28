import { useState } from "react";
import { Card, Badge, Tabs, cx } from "../components/ui";
import { leaderboard } from "../lib/data";
import { useAuth } from "../lib/auth";

const leagues = [
  { name: "Bronze", tone: "warn" as const }, { name: "Silver", tone: "neutral" as const },
  { name: "Gold", tone: "warn" as const }, { name: "Quantum Master", tone: "violet" as const },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState("global");
  const [league, setLeague] = useState("Silver");
  const you = leaderboard.find((l) => l.you)!;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-cyan">Leaderboard</div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight">Where you stand</h1>
        </div>
        <Tabs value={scope} onChange={setScope} tabs={[
          { id: "global", label: "Global" }, { id: "institution", label: "Institution" }, { id: "friends", label: "Friends" },
        ]} />
      </div>

      {/* your position banner */}
      <Card className="mt-6 flex flex-wrap items-center gap-4 border-quantum-blue/30 bg-quantum-blue/[0.06] p-5">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] font-display text-xl font-800 text-white">#{you.rank}</div>
        <div>
          <div className="font-display text-lg font-700">You're #{you.rank} globally</div>
          <div className="text-[13px] text-ok">↑ Your rank improved by 12 positions this week.</div>
        </div>
        <div className="ml-auto flex gap-6 text-center">
          <div><div className="font-display text-xl font-700">{you.xp.toLocaleString()}</div><div className="text-[11px] text-txt-faint">XP</div></div>
          <div><div className="font-display text-xl font-700">{you.eff}%</div><div className="text-[11px] text-txt-faint">Efficiency</div></div>
        </div>
      </Card>

      {/* leagues */}
      <div className="mt-6 flex flex-wrap gap-2">
        {leagues.map((l) => (
          <button key={l.name} onClick={() => setLeague(l.name)}
            className={cx("rounded-full border px-4 py-1.5 text-[13px] font-500 transition-colors",
              league === l.name ? "border-quantum-violet/50 bg-quantum-violet/15 text-txt" : "border-line-strong text-txt-dim hover:text-txt")}>
            {l.name}
          </button>
        ))}
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="hidden grid-cols-[0.5fr_2fr_0.8fr_1fr_1fr_1fr] gap-4 border-b border-line px-5 py-3 text-[11px] font-500 uppercase tracking-wide text-txt-faint md:grid">
          <span>Rank</span><span>Student</span><span>Level</span><span>XP</span><span>Challenges</span><span>Efficiency</span>
        </div>
        {leaderboard.map((l) => (
          <div key={l.rank} className={cx(
            "grid grid-cols-2 items-center gap-4 border-b border-line px-5 py-3.5 text-[14px] last:border-0 md:grid-cols-[0.5fr_2fr_0.8fr_1fr_1fr_1fr]",
            l.you && "bg-quantum-blue/[0.08]"
          )}>
            <span className={cx("font-display font-700", l.rank <= 3 ? "text-quantum-cyan" : "text-txt-dim")}>
              {l.rank <= 3 ? ["🥇", "🥈", "🥉"][l.rank - 1] : `#${l.rank}`}
            </span>
            <span className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[12px] font-600 text-white">
                {l.you
                  ? (user?.avatar_initials || (user?.name ? user.name.split(" ").map((x) => x[0]).slice(0, 2).join("") : "ME"))
                  : l.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
              </span>
              <span className={cx("font-500", l.you && "text-quantum-cyan")}>
                {l.you ? (user?.name ? `${user.name} (You)` : "You") : l.name}
              </span>
            </span>
            <span><Badge tone="violet">Lvl {l.level}</Badge></span>
            <span className="font-mono">{l.xp.toLocaleString()}</span>
            <span className="text-txt-dim">{l.challenges}</span>
            <span className="font-mono text-ok">{l.eff}%</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
