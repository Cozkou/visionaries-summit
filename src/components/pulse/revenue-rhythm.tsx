"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyCategoryRevenuePoint } from "@/lib/data/pulse-analytics";
import {
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  PULSE_SERIES,
  formatAxisGbp,
} from "@/components/pulse/palette";

interface Props {
  data: MonthlyCategoryRevenuePoint[];
  productTypes: string[];
}

export function RevenueRhythm({ data, productTypes }: Props) {
  if (!data.length) {
    return <EmptyState message="No order history in the data pack." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 8 }}>
        <defs>
          {productTypes.map((type, i) => {
            const color = PULSE_SERIES[i % PULSE_SERIES.length];
            return (
              <linearGradient
                key={type}
                id={`rev-grad-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                <stop offset="100%" stopColor={color} stopOpacity={0.08} />
              </linearGradient>
            );
          })}
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
          tickFormatter={formatAxisGbp}
          width={56}
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
        {productTypes.map((type, i) => {
          const color = PULSE_SERIES[i % PULSE_SERIES.length];
          return (
            <Area
              key={type}
              type="monotone"
              dataKey={type}
              stackId="rev"
              stroke={color}
              fill={`url(#rev-grad-${i})`}
              strokeWidth={1.5}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
      {message}
    </div>
  );
}
