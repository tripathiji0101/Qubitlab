import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { Card, Badge, Progress, Stat, Button, cx } from "../components/ui";
import { badges, skillRadar } from "../lib/data";

export default function Profile() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
      {/* header */}
      <Card className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 grid-field opacity-40" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] font-display text-2xl font-800 text-white">AC</div>
          <div>
            <h1 className="font-display text-2xl font-800">Alex Chen</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="violet">Level 2 · Logic Designer</Badge>
              <span className="text-[13px] text-txt-dim">alex@university.edu</span>
            </div>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div><div className="font-display text-2xl font-800">12,450</div><div className="text-[11px] text-txt-faint">TOTAL XP</div></div>
            <div><div className="font-display text-2xl font-800 text-warn">7 🔥</div><div className="text-[11px] text-txt-faint">STREAK</div></div>
            <div><div className="font-display text-2xl font-800 text-quantum-cyan">#6</div><div className="text-[11px] text-txt-faint">RANK</div></div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* skill radar */}
        <Card className="p-5">
          <h2 className="font-display text-lg font-700">Quantum skill radar</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <RadarChart data={skillRadar} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#9aa3ba", fontSize: 12 }} />
                <Radar dataKey="value" stroke="#35e0d8" fill="#35e0d8" fillOpacity={0.22} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* stats */}
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Projects completed" value="1 / 5" />
          <Stat label="Challenges completed" value="14" />
          <Stat label="Average score" value="87%" delta="+4% this month" />
          <Stat label="Best league" value="Silver" />
          <Card className="col-span-2 p-4">
            <div className="text-[12px] uppercase tracking-wide text-txt-faint">Strongest & weakest concepts</div>
            <div className="mt-3 space-y-2.5">
              {[["Quantum Gates", 92, "cyan"], ["Superposition", 88, "cyan"], ["Optimization", 43, "violet"], ["Quantum ML", 30, "violet"]].map(([k, v, t]) => (
                <div key={k as string}>
                  <div className="mb-1 flex justify-between text-[13px]"><span className="text-txt-dim">{k}</span><span className="text-txt">{v}%</span></div>
                  <Progress value={v as number} tone={t as any} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* badges */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-700">Achievements</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {badges.map((b) => (
            <Card key={b.name} className={cx("flex flex-col items-center p-4 text-center", !b.earned && "opacity-45")}>
              <div className={cx("grid h-14 w-14 place-items-center rounded-2xl border text-2xl",
                b.earned ? "border-quantum-cyan/40 bg-[radial-gradient(circle,rgba(53,224,216,0.2),transparent)]" : "border-line-strong bg-ink-900")}>
                {b.earned ? "◈" : "🔒"}
              </div>
              <div className="mt-3 text-[13px] font-600">{b.name}</div>
              <div className="mt-1 text-[11px] text-txt-faint">{b.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
