/**
 * Shared chart palette. Matches the existing UI usage of emerald/amber/slate/
 * sky/rose elsewhere in the app so the Pulse page reads as part of the brand
 * system rather than a one-off dashboard.
 */
export const PULSE_PALETTE = {
  emerald: "#059669",
  amber: "#f59e0b",
  sky: "#0284c7",
  rose: "#e11d48",
  slate: "#334155",
  neutral: "#64748b",
} as const;

/** Categorical series colours in stable order. */
export const PULSE_SERIES = [
  PULSE_PALETTE.emerald,
  PULSE_PALETTE.amber,
  PULSE_PALETTE.sky,
  PULSE_PALETTE.rose,
  PULSE_PALETTE.slate,
  PULSE_PALETTE.neutral,
];

/** Map of marketing-action label → hex colour. */
export const ACTION_COLORS: Record<string, string> = {
  Scale: PULSE_PALETTE.emerald,
  Hold: PULSE_PALETTE.sky,
  Trim: PULSE_PALETTE.amber,
  Pause: PULSE_PALETTE.rose,
};

/** Compact GBP formatter for axis ticks. */
export function formatAxisGbp(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `£${Math.round(n / 1_000)}k`;
  return `£${Math.round(n)}`;
}

export function formatCompactNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

export const CHART_TICK_STYLE = {
  fill: "#64748b",
  fontSize: 10,
  fontFamily: "var(--font-mono, ui-monospace, monospace)",
};

export const CHART_GRID_STROKE = "#e5e7eb";
