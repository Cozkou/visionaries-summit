"use client";

import {
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { MarketingRow } from "@/types/dashboard";
import {
  ACTION_COLORS,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  formatAxisGbp,
} from "@/components/pulse/palette";

interface Props {
  rows: MarketingRow[];
}

export function AdScatter({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
        No campaign data.
      </div>
    );
  }

  // Recharts wants each scatter series to be its own dataset for colour.
  const groups: Record<string, MarketingRow[]> = {};
  for (const row of rows) {
    (groups[row.action] ??= []).push(row);
  }
  const actions = ["Scale", "Hold", "Trim", "Pause"] as const;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={CHART_GRID_STROKE} />
        <XAxis
          type="number"
          dataKey="spend"
          name="Spend"
          tickFormatter={formatAxisGbp}
          tick={CHART_TICK_STYLE}
          axisLine={{ stroke: CHART_GRID_STROKE }}
          tickLine={false}
          label={{
            value: "SPEND",
            position: "insideBottom",
            offset: -4,
            fill: "#94a3b8",
            fontSize: 10,
            letterSpacing: "0.16em",
          }}
        />
        <YAxis
          type="number"
          dataKey="roas"
          name="ROAS"
          tickFormatter={(v) => `${v.toFixed(1)}x`}
          tick={CHART_TICK_STYLE}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <ZAxis
          type="number"
          dataKey="orders"
          range={[60, 600]}
          name="Orders"
        />
        <Tooltip
          cursor={{ strokeDasharray: "2 4", stroke: "#94a3b8" }}
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#f1f5f9",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 11,
          }}
          formatter={(value, name) => {
            const n = String(name);
            if (n === "Spend" || n === "spend")
              return formatAxisGbp(Number(value));
            if (n === "ROAS" || n === "roas")
              return `${Number(value).toFixed(2)}x`;
            if (n === "Orders" || n === "orders")
              return Number(value).toLocaleString();
            return String(value);
          }}
          labelFormatter={() => ""}
          itemStyle={{ color: "#e2e8f0" }}
          wrapperStyle={{ outline: "none" }}
        />
        <Legend
          wrapperStyle={{
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#475569",
          }}
          iconType="circle"
        />
        {actions.map((a) => (
          <Scatter
            key={a}
            name={a}
            data={groups[a] ?? []}
            fill={ACTION_COLORS[a]}
            fillOpacity={0.75}
          >
            {(groups[a] ?? []).map((row) => (
              <Cell key={row.campaign} stroke={ACTION_COLORS[a]} />
            ))}
          </Scatter>
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
