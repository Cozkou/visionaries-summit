"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

import type { InventoryProduct } from "@/types/dashboard";
import { formatAxisGbp } from "@/components/pulse/palette";

interface Props {
  rows: InventoryProduct[];
}

/**
 * Days-of-cover colour ramp:
 *   < 14d  → rose (urgent)
 *   14–30  → amber
 *   30–60  → sky
 *   > 60d  → emerald
 */
function colorForCover(units60d: number, inventory: number): string {
  // Approx days of cover from 60-day demand and current stock.
  const dailyDemand = units60d / 60;
  const days = dailyDemand > 0 ? Math.max(0, inventory) / dailyDemand : 999;
  if (days < 14) return "#e11d48";
  if (days < 30) return "#f59e0b";
  if (days < 60) return "#0284c7";
  return "#059669";
}

export function InventoryTreemap({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
        No inventory rows.
      </div>
    );
  }

  const data = rows
    .map((r) => ({
      name: r.title,
      // Size = potential revenue at risk (recommend × price would be ideal,
      // but we already have potential_revenue_gbp pre-computed).
      size: Math.max(1, Math.round(r.potential_revenue_gbp)),
      profit: Math.round(r.gross_profit_gbp),
      stock: r.inventory,
      units60d: r.units_60d,
      collection: r.collection,
      productType: r.product_type,
      color: colorForCover(r.units_60d, r.inventory),
    }))
    .sort((a, b) => b.size - a.size);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="#0f172a"
        content={<TreemapCell />}
      >
        <Tooltip
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#f1f5f9",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 11,
          }}
          formatter={(_value, _name, item) => {
            const p = item?.payload as (typeof data)[number] | undefined;
            if (!p) return null;
            return [
              `${formatAxisGbp(p.size)} potential · ${formatAxisGbp(p.profit)} profit · stock ${p.stock.toLocaleString()} · 60d ${p.units60d.toLocaleString()}`,
              p.name,
            ];
          }}
          labelStyle={{
            color: "#94a3b8",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}

interface TreemapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  depth?: number;
  color?: string;
  size?: number;
  value?: number;
  root?: unknown;
}

/**
 * Custom Treemap cell. Recharts v3 passes the TreemapNode's properties
 * directly as props (including our own custom fields like `color`/`size`/etc.
 * via the `[k: string]: unknown` spread), so we destructure those here rather
 * than expecting a `payload` wrapper.
 */
function TreemapCell(props: TreemapCellProps) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = "",
    depth = 1,
    color,
    size,
    value,
  } = props;

  // Recharts renders an outer root cell at depth 0 that covers the whole area;
  // we only want to paint the leaf rectangles.
  if (depth === 0) return null;
  if (width <= 0 || height <= 0) return null;

  const fill = color ?? "#64748b";
  const numericSize = typeof size === "number" ? size : Number(value ?? 0);
  const showLabel = width > 90 && height > 36;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.82}
        stroke="#0f172a"
        strokeWidth={1}
      />
      {showLabel && (
        <>
          <text
            x={x + 8}
            y={y + 16}
            fill="#0f172a"
            fontSize={11}
            fontFamily="var(--font-sans)"
            fontWeight={600}
          >
            {truncate(name, Math.max(8, Math.floor(width / 8)))}
          </text>
          <text
            x={x + 8}
            y={y + 30}
            fill="#0f172a"
            fontSize={10}
            fontFamily="var(--font-mono, ui-monospace, monospace)"
            opacity={0.85}
          >
            {formatAxisGbp(numericSize)}
          </text>
        </>
      )}
    </g>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
