"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SupportRow } from "@/types/dashboard";
import {
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  PULSE_PALETTE,
} from "@/components/pulse/palette";

interface Props {
  rows: SupportRow[];
}

export function SupportBars({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
        No ticket data.
      </div>
    );
  }

  // Sort by total volume so the biggest categories sit at the top.
  const data = rows
    .map((r) => ({
      category: r.category,
      bot: r.botTickets,
      human: r.humanTickets,
      hoursSaved: Math.round(r.hoursSavedAt25Pct),
      humanShare: Math.round(r.humanShare * 100),
    }))
    .sort((a, b) => b.bot + b.human - (a.bot + a.human));

  const totalHoursSaved = data.reduce((acc, r) => acc + r.hoursSaved, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-baseline justify-end gap-2 font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
        <span>Total recoverable</span>
        <span className="text-emerald-600">{totalHoursSaved}h</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 0, left: 24 }}
        >
          <CartesianGrid stroke={CHART_GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            tick={CHART_TICK_STYLE}
            tickLine={false}
            axisLine={{ stroke: CHART_GRID_STROKE }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ ...CHART_TICK_STYLE, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#f1f5f9",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: 11,
            }}
            formatter={(value, name, item) => {
              const v = Number(value);
              const payload = (item?.payload ?? {}) as (typeof data)[number];
              if (name === "bot")
                return [
                  `${v.toLocaleString()} · ${payload.hoursSaved}h recoverable`,
                  "Bot",
                ];
              if (name === "human")
                return [
                  `${v.toLocaleString()} · ${payload.humanShare}% share`,
                  "Human",
                ];
              return [String(value), String(name)];
            }}
            labelStyle={{
              color: "#94a3b8",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#475569",
            }}
            iconType="square"
          />
          <Bar dataKey="bot" stackId="t" fill={PULSE_PALETTE.sky} name="Bot" />
          <Bar
            dataKey="human"
            stackId="t"
            fill={PULSE_PALETTE.slate}
            name="Human"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
