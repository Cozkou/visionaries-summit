"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CashflowPoint } from "@/lib/data/pulse-analytics";
import {
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  PULSE_PALETTE,
  formatAxisGbp,
} from "@/components/pulse/palette";

interface Props {
  data: CashflowPoint[];
  summary: {
    openingBalance: number;
    closingBalance: number;
    totalInflow: number;
    totalOutflow: number;
  };
}

export function CashflowLine({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
        No bank transactions.
      </div>
    );
  }

  // Show day-label as YYYY-MM-DD condensed; recharts will auto-thin labels.
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="cf-pos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PULSE_PALETTE.emerald} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PULSE_PALETTE.emerald} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="cf-neg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PULSE_PALETTE.rose} stopOpacity={0.05} />
            <stop offset="100%" stopColor={PULSE_PALETTE.rose} stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="date"
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID_STROKE }}
          interval="preserveStartEnd"
          minTickGap={32}
          tickFormatter={(d: string) => d.slice(0, 7)}
        />
        <YAxis
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisGbp}
          width={64}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 4" />
        <Tooltip
          cursor={{ stroke: "#94a3b8", strokeDasharray: "2 4" }}
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#f1f5f9",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 11,
          }}
          formatter={(value) => formatAxisGbp(Number(value))}
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
        <Area
          type="monotone"
          dataKey="balance"
          name="Balance"
          fill="url(#cf-pos)"
          stroke="none"
          baseValue={0}
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Balance"
          stroke={PULSE_PALETTE.slate}
          strokeWidth={1.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
