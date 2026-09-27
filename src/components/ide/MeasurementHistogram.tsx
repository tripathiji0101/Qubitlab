import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

interface MeasurementHistogramProps {
  counts: Record<string, number>;
  totalShots?: number;
}

export default function MeasurementHistogram({ counts, totalShots }: MeasurementHistogramProps) {
  const entries = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  const sumShots = totalShots || Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  const data = entries.map(([state, count]) => ({
    state: `|${state}⟩`,
    count,
    percentage: ((count / sumShots) * 100).toFixed(1),
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[140px] items-center justify-center text-[12px] text-txt-faint">
        No measurement shots recorded. Run circuit with measurements to view histogram.
      </div>
    );
  }

  return (
    <div className="h-full min-h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
        <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 4 }}>
          <XAxis
            dataKey="state"
            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "#37383f" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border border-line bg-bg-surface p-2 shadow-lg font-mono text-[11px] text-txt">
                    <div className="font-bold text-accent-blue">{item.state}</div>
                    <div>Shots: <span className="text-white font-semibold">{item.count}</span> / {sumShots}</div>
                    <div>Empirical Frequency: <span className="text-emerald-400 font-semibold">{item.percentage}%</span></div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill="url(#histgrad)" />
            ))}
          </Bar>
          <defs>
            <linearGradient id="histgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
