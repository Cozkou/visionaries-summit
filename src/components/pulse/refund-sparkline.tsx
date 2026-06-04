"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyRefundRatePoint } from "@/lib/data/pulse-analytics";
import {
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  PULSE_PALETTE,
} from "@/components/pulse/palette";

interface Props {
  data: MonthlyRefundRatePoint[];
  average: number;
}

export function RefundSparkline({ data, average }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
        No refund data.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="refund-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PULSE_PALETTE.rose} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PULSE_PALETTE.rose} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="label"
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID_STROKE }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={42}
        />
        <Tooltip
          cursor={{ stroke: "#94a3b8", strokeDasharray: "2 4" }}
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#f1f5f9",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 11,
          }}
          formatter={(value, name) => {
            if (name === "Refund rate") return `${Number(value).toFixed(2)}%`;
            return String(value);
          }}
          labelStyle={{
            color: "#94a3b8",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        />
        <ReferenceLine
          y={average}
          stroke={PULSE_PALETTE.amber}
          strokeDasharray="3 3"
          label={{
            value: `avg ${average}%`,
            position: "right",
            fill: PULSE_PALETTE.amber,
            fontSize: 10,
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
        />
        <Area
          type="monotone"
          dataKey="refundRate"
          name="Refund rate"
          stroke={PULSE_PALETTE.rose}
          fill="url(#refund-grad)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="refundRate"
          name="Refund rate"
          stroke={PULSE_PALETTE.rose}
          strokeWidth={2}
          dot={false}
          legendType="none"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
