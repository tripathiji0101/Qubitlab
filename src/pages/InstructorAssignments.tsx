import { Link } from "react-router";
import { useState } from "react";
import { Card, Badge, Button, Input, Field, Tabs, Progress, cx } from "../components/ui";
import { assignments, submissions, difficultyTone } from "../lib/data";

const statusTone: Record<string, "ok" | "warn" | "danger" | "neutral"> = {
  Passed: "ok", "Needs review": "warn", Failed: "danger", Open: "ok", Draft: "neutral",
};

export default function InstructorAssignments() {
  const [tab, setTab] = useState("list");

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 md:px-6">
      <Link to="/instructor" className="text-[13px] text-txt-dim hover:text-txt">← Class Overview</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-violet">Instructor</div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight">Assignment Management</h1>
        </div>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: "list", label: "Assignments" }, { id: "create", label: "Create" }, { id: "submissions", label: "Submissions" },
        ]} />
      </div>

      {tab === "list" && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Card key={a.title} className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone="blue">{a.algorithm}</Badge>
                <Badge tone={statusTone[a.status]}>{a.status}</Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-700">{a.title}</h3>
              <div className="mt-1 text-[13px] text-txt-dim">Due {a.due} · <Badge tone={difficultyTone[a.difficulty]}>{a.difficulty}</Badge></div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[12px] text-txt-faint"><span>Submissions</span><span>{a.submitted}/{a.total}</span></div>
                <Progress value={(a.submitted / a.total) * 100} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setTab("submissions")}>View submissions</Button>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            </Card>
          ))}
          <button onClick={() => setTab("create")} className="grid min-h-[180px] place-items-center rounded-xl border border-dashed border-line-strong text-txt-dim transition-colors hover:border-quantum-blue/50 hover:text-txt">
            + New assignment
          </button>
        </div>
      )}

      {tab === "create" && (
        <Card className="mt-6 max-w-3xl p-6">
          <h2 className="font-display text-lg font-700">Create assignment</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Title"><Input placeholder="Grover Search Project" /></Field></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea rows={3} className="w-full rounded-lg border border-line-strong bg-ink-900 p-3 text-sm outline-none focus:border-quantum-blue/60" placeholder="Describe the mission students must complete…" /></Field></div>
            <Field label="Algorithm"><select className="h-11 w-full rounded-lg border border-line-strong bg-ink-900 px-3 text-sm outline-none"><option>Grover</option><option>Deutsch–Jozsa</option><option>QAOA</option><option>Entanglement</option></select></Field>
            <Field label="Difficulty"><select className="h-11 w-full rounded-lg border border-line-strong bg-ink-900 px-3 text-sm outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
            <Field label="Number of qubits"><Input type="number" defaultValue={3} /></Field>
            <Field label="Max circuit depth"><Input type="number" defaultValue={8} /></Field>
            <Field label="Target result"><Input placeholder="|11⟩ amplified" /></Field>
            <Field label="XP reward"><Input type="number" defaultValue={300} /></Field>
            <Field label="Deadline"><Input type="date" /></Field>
            <Field label="Allowed gates"><Input placeholder="H, X, Z, CNOT, CZ" defaultValue="H, X, Z, CNOT, CZ" /></Field>
            <div className="sm:col-span-2"><Field label="Hints"><textarea rows={2} className="w-full rounded-lg border border-line-strong bg-ink-900 p-3 text-sm outline-none focus:border-quantum-blue/60" placeholder="Optional hints revealed on request…" /></Field></div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => setTab("list")}>Publish assignment</Button>
            <Button variant="secondary">Save draft</Button>
          </div>
        </Card>
      )}

      {tab === "submissions" && (
        <Card className="mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="font-display text-lg font-700">Grover Search Project · Submissions</h2>
            <Badge tone="cyan">{submissions.length} of 30 graded</Badge>
          </div>
          <div className="hidden grid-cols-[1.6fr_0.8fr_1fr_1fr_0.8fr_1fr] gap-4 border-b border-line px-5 py-3 text-[11px] font-500 uppercase tracking-wide text-txt-faint md:grid">
            <span>Student</span><span>Score</span><span>Correctness</span><span>Efficiency</span><span>Attempts</span><span>Status</span>
          </div>
          {submissions.map((s) => (
            <div key={s.name} className="grid grid-cols-2 items-center gap-4 border-b border-line px-5 py-4 text-[14px] last:border-0 hover:bg-white/[0.02] md:grid-cols-[1.6fr_0.8fr_1fr_1fr_0.8fr_1fr]">
              <span className="flex items-center gap-2.5 font-500">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-[12px] text-txt-dim">{s.name.split(" ").map((x) => x[0]).join("")}</span>{s.name}
              </span>
              <span className={cx("font-mono font-700", s.score >= 90 ? "text-ok" : s.score >= 60 ? "text-warn" : "text-danger")}>{s.score}</span>
              <span className="text-txt-dim">{s.correctness}%</span>
              <span className="text-txt-dim">{s.efficiency}%</span>
              <span className="text-txt-dim">{s.attempts}</span>
              <span><Badge tone={statusTone[s.status]}>{s.status}</Badge></span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
