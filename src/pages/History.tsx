import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Card, Badge, Button, Tabs, cx } from "../components/ui";
import { historyItems as defaultHistory } from "../lib/data";
import { history as historyApi, type HistoryItem, getAccessToken } from "../lib/api";

const statusTone: Record<string, "ok" | "warn" | "danger" | "cyan"> = {
  Passed: "ok", "In progress": "cyan", Failed: "danger",
};

export default function History() {
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState<HistoryItem[]>(defaultHistory);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    historyApi
      .list()
      .then((res) => {
        if (res) setItems(res);
      })
      .catch(() => {});
  }, []);

  const list = items.filter((h) =>
    tab === "all" ? true : tab === "completed" ? h.status === "Passed" : tab === "attempts" ? h.status !== "In progress" : true
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-cyan">History</div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight">Your circuit history</h1>
        </div>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: "all", label: "Recent" }, { id: "completed", label: "Completed" }, { id: "attempts", label: "Attempts" },
        ]} />
      </div>

      {list.length === 0 ? (
        <Card className="mt-8 grid place-items-center p-16 text-center">
          <div className="text-4xl">🜁</div>
          <div className="mt-3 font-display text-lg font-700">Your quantum journey starts here.</div>
          <p className="mt-1 text-txt-dim">Build and run a circuit in the Studio to see it appear.</p>
          <Link to="/workspace" className="mt-4"><Button>Open Studio</Button></Link>
        </Card>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_0.8fr_0.6fr_1fr_0.7fr_1fr] gap-4 border-b border-line px-5 py-3 text-[11px] font-500 uppercase tracking-wide text-txt-faint md:grid">
            <span>Project</span><span>Algorithm</span><span>SDK</span><span>Score</span><span>Date</span><span>Depth</span><span>Status</span>
          </div>
          {list.map((h, i) => (
            <div key={i} className="grid grid-cols-2 gap-4 border-b border-line px-5 py-4 text-[14px] last:border-0 hover:bg-white/[0.02] md:grid-cols-[2fr_1fr_0.8fr_0.6fr_1fr_0.7fr_1fr] md:items-center">
              <span className="font-500 text-txt">{h.project}</span>
              <span className="text-txt-dim">{h.algorithm}</span>
              <span className="text-txt-dim"><Badge tone="neutral">{h.sdk}</Badge></span>
              <span className={cx("font-mono font-600", h.score >= 90 ? "text-ok" : h.score >= 70 ? "text-warn" : "text-danger")}>{h.score}</span>
              <span className="text-txt-faint">{h.date}</span>
              <span className="font-mono text-txt-dim">{h.depth}</span>
              <span className="flex items-center gap-2">
                <Badge tone={statusTone[h.status]}>{h.status}</Badge>
                <span className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100">
                  <Link to="/workspace"><Button size="sm" variant="ghost">Open</Button></Link>
                </span>
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
