import { Link } from "react-router";
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip as RTip } from "recharts";
import { Card, Badge, Button, Stat, Chip, cx } from "../components/ui";
import { Count } from "../components/motion";
import {
  progressSeries as staticProgressSeries,
  conceptDifficulty as staticConceptDifficulty,
  atRisk as staticAtRisk,
} from "../lib/data";
import { instructor as instructorApi, type InstructorDashboardResponse, getAccessToken } from "../lib/api";

type AtRiskStudent = {
  name: string;
  progress: number;
  failed: number;
  concept: string;
  risk: string;
  action: string;
};

const riskTone: Record<string, "ok" | "warn" | "danger"> = { Low: "ok", Medium: "warn", High: "danger" };

export default function Instructor() {
  const [range, setRange] = useState("6W");
  const [sel, setSel] = useState<AtRiskStudent | null>(null);
  const [loading, setLoading] = useState(true);

  // Live data from backend (or fallback to static)
  const [studentCount, setStudentCount] = useState(30);
  const [avgProgress, setAvgProgress] = useState(58);
  const [avgScore, setAvgScore] = useState(81);
  const [completionRate, setCompletionRate] = useState(72);
  const [atRiskCount, setAtRiskCount] = useState(4);
  const [progressSeries, setProgressSeries] = useState(staticProgressSeries);
  const [conceptDifficulty, setConceptDifficulty] = useState(staticConceptDifficulty);
  const [atRisk, setAtRisk] = useState<AtRiskStudent[]>(staticAtRisk);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    instructorApi
      .dashboard()
      .then((res: InstructorDashboardResponse) => {
        const s = res.stats as Record<string, number>;
        setStudentCount(s.students ?? 30);
        setAvgProgress(s.avg_progress ?? 58);
        setAvgScore(s.avg_score ?? 81);
        setCompletionRate(s.completion_rate ?? 72);
        setAtRiskCount(s.at_risk_count ?? 4);

        if (res.progress_series?.length) {
          setProgressSeries(res.progress_series as typeof staticProgressSeries);
        }
        if (res.concept_difficulty?.length) {
          setConceptDifficulty(res.concept_difficulty as typeof staticConceptDifficulty);
        }
        if (res.at_risk?.length) {
          setAtRisk(res.at_risk as AtRiskStudent[]);
        }
      })
      .catch(() => {
        // Fall back to static data if backend is unreachable or user lacks instructor role
      })
      .finally(() => setLoading(false));
  }, []);

  const ranges: Record<string, number> = { "4W": 4, "6W": 6, "All": progressSeries.length };
  const series = progressSeries.slice(-ranges[range]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-violet">Instructor · CS-4270 Quantum Computing</div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight">Class Overview</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export report</Button>
          <Link to="/instructor/assignments"><Button size="sm">Manage assignments</Button></Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Students" value={<Count to={studentCount} />} />
        <Stat label="Avg progress" value={<Count to={avgProgress} suffix="%" />} delta="+6% this week" />
        <Stat label="Avg score" value={<Count to={avgScore} suffix="%" />} />
        <Stat label="Completion rate" value={<Count to={completionRate} suffix="%" />} />
        <Card className="border-danger/25 bg-danger/[0.06] p-4">
          <div className="text-[12px] uppercase tracking-wide text-txt-faint">At-risk students</div>
          <div className="mt-2 font-display text-2xl font-700 text-danger"><Count to={atRiskCount} /></div>
          <div className="mt-1 text-[12px] text-txt-dim">Needs intervention</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-700">Learning progress over time</h2>
            <div className="flex gap-1.5">{Object.keys(ranges).map((r) => <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r}</Chip>)}</div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <LineChart data={series} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#626b83", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#626b83", fontSize: 12 }} axisLine={false} tickLine={false} />
                <RTip contentStyle={{ background: "#12151f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="classAvg" name="Class avg" stroke="#4d7cfe" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="top" name="Top quartile" stroke="#35e0d8" strokeWidth={2.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-5 text-[12px] text-txt-dim">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-quantum-blue" /> Class average</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-quantum-cyan" /> Top quartile</span>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-700">Concept difficulty</h2>
          <p className="text-[12px] text-txt-faint">% of students failing first attempt</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart data={conceptDifficulty} layout="vertical" margin={{ left: 30, right: 12 }}>
                <XAxis type="number" domain={[0, 60]} tick={{ fill: "#626b83", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="concept" width={90} tick={{ fill: "#9aa3ba", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Bar dataKey="fail" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {conceptDifficulty.map((d, i) => <Cell key={i} fill={d.fail > 45 ? "#f4685f" : d.fail > 30 ? "#f5b13d" : "#35d69a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* at risk */}
      <Card className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-lg font-700">Student risk analysis</h2>
          <Badge tone="danger">{atRisk.length} flagged</Badge>
        </div>
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.2fr_0.8fr_1.6fr] gap-4 border-b border-line px-5 py-3 text-[11px] font-500 uppercase tracking-wide text-txt-faint md:grid">
          <span>Student</span><span>Progress</span><span>Failed attempts</span><span>Weak concept</span><span>Risk</span><span>Recommended intervention</span>
        </div>
        {atRisk.map((s) => (
          <button key={s.name} onClick={() => setSel(s)} className="grid w-full grid-cols-2 gap-4 border-b border-line px-5 py-4 text-left text-[14px] last:border-0 hover:bg-white/[0.02] md:grid-cols-[1.4fr_1fr_1fr_1.2fr_0.8fr_1.6fr] md:items-center">
            <span className="flex items-center gap-2.5 font-500">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-[12px] text-txt-dim">{s.name.split(" ").map((x) => x[0]).join("")}</span>
              {s.name}
            </span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-quantum-blue" style={{ width: `${s.progress}%` }} /></span><span className="text-txt-dim">{s.progress}%</span></span>
            <span className="text-txt-dim">{s.failed}</span>
            <span><Badge tone="blue">{s.concept}</Badge></span>
            <span><Badge tone={riskTone[s.risk] ?? "warn"}>{s.risk}</Badge></span>
            <span className="flex items-center justify-between gap-2 text-txt-dim">{s.action}<span className="text-quantum-cyan">→</span></span>
          </button>
        ))}
      </Card>

      {/* student detail drawer */}
      {sel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSel(null)}>
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-ink-900 p-6 shadow-2xl animate-rise" onClick={(e) => e.stopPropagation()} style={{ animationDuration: ".25s" }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] font-600 text-white">{sel.name.split(" ").map((x) => x[0]).join("")}</span>
                <div>
                  <div className="font-display text-lg font-700">{sel.name}</div>
                  <Badge tone={riskTone[sel.risk] ?? "warn"}>{sel.risk} risk</Badge>
                </div>
              </div>
              <button onClick={() => setSel(null)} className="text-txt-faint hover:text-txt">✕</button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line bg-ink-850 p-3"><div className="text-[11px] text-txt-faint">Progress</div><div className="font-display text-xl font-700">{sel.progress}%</div></div>
              <div className="rounded-lg border border-line bg-ink-850 p-3"><div className="text-[11px] text-txt-faint">Failed attempts</div><div className="font-display text-xl font-700 text-danger">{sel.failed}</div></div>
            </div>
            <div className="mt-4 rounded-lg border border-quantum-blue/25 bg-quantum-blue/[0.06] p-4">
              <div className="text-[11px] uppercase tracking-wide text-txt-faint">Weakest concept</div>
              <div className="mt-1 font-500">{sel.concept}</div>
              <p className="mt-3 text-[13px] text-txt-dim"><span className="text-quantum-cyan">Recommended · </span>{sel.action}</p>
            </div>
            <div className="mt-auto flex gap-2 pt-6">
              <Button className="flex-1">Assign intervention</Button>
              <Button variant="secondary">Message</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
