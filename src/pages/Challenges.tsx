import { Link } from "react-router";
import { useState } from "react";
import { Card, Badge, Button, Chip, cx } from "../components/ui";
import { challenges, difficultyTone } from "../lib/data";

const filters = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Challenges() {
  const [f, setF] = useState("All");
  const list = challenges.filter((c) => f === "All" || c.difficulty === f);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-cyan">Challenges</div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight md:text-4xl">Prove your quantum skills</h1>
          <p className="mt-2 text-txt-dim">Timed, scored circuit puzzles. Earn XP for correctness and efficiency.</p>
        </div>
        <div className="flex gap-2">{filters.map((x) => <Chip key={x} active={f === x} onClick={() => setF(x)}>{x}</Chip>)}</div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Card key={c.id} className="flex flex-col p-5 transition-colors hover:border-line-strong">
            <div className="flex items-center justify-between">
              <Badge tone={c.tone}>{c.algorithm}</Badge>
              {c.done ? <Badge tone="ok">Solved</Badge> : <Badge tone="neutral">Open</Badge>}
            </div>
            <h3 className="mt-4 font-display text-lg font-700">{c.title}</h3>
            <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-txt-dim">{c.statement}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-line bg-ink-900/60 p-3 text-center">
              <div><div className="font-mono text-[11px] text-txt-faint">BEST</div><div className="font-600">{c.best || "—"}</div></div>
              <div><div className="font-mono text-[11px] text-txt-faint">TRIES</div><div className="font-600">{c.attempts}</div></div>
              <div><div className="font-mono text-[11px] text-txt-faint">XP</div><div className="font-600 text-quantum-cyan">{c.xp}</div></div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge tone={difficultyTone[c.difficulty]}>{c.difficulty}</Badge>
              <Link to={`/challenges/${c.id}`}><Button size="sm" variant={c.done ? "outline" : "primary"}>{c.done ? "Retry" : "Start"} →</Button></Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
