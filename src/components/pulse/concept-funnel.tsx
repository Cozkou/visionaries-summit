"use client";

import { useMemo } from "react";

import type { ConceptFunnelTotals } from "@/lib/data/pulse-analytics";
import { PULSE_PALETTE } from "@/components/pulse/palette";

interface Props {
  totals: ConceptFunnelTotals;
}

interface FunnelStep {
  label: string;
  value: number;
  detail?: string;
  color: string;
}

/**
 * Custom funnel — Recharts' built-in <FunnelChart> renders awkwardly when
 * step values are wildly different, which is the norm for a real funnel
 * (views >> wishlist >> preorders). This trapezoid-ribbon variant scales
 * each step by absolute width but keeps every bar legible.
 */
export function ConceptFunnel({ totals }: Props) {
  const steps: FunnelStep[] = useMemo(
    () => [
      {
        label: "Page views",
        value: totals.pageViews,
        color: PULSE_PALETTE.slate,
      },
      {
        label: "Wishlist signups",
        value: totals.wishlist,
        color: PULSE_PALETTE.sky,
      },
      {
        label: "Pre-orders",
        value: totals.preorders,
        detail:
          totals.preorderUnits > 0 ? `${totals.preorderUnits} units` : undefined,
        color: PULSE_PALETTE.amber,
      },
      {
        label: "Commerce sales",
        value: totals.commerceSales,
        color: PULSE_PALETTE.emerald,
      },
    ],
    [totals]
  );

  const max = Math.max(1, ...steps.map((s) => s.value));

  if (totals.listingCount === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center font-mono text-[11px] text-neutral-400 uppercase">
        Nothing published yet. Publish a concept to start tracking funnel.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 py-2">
      {steps.map((s, i) => {
        const width = `${Math.max(6, (s.value / max) * 100)}%`;
        const conversion =
          i === 0 || steps[i - 1].value === 0
            ? null
            : (s.value / steps[i - 1].value) * 100;
        return (
          <li key={s.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-medium text-slate-900">
                {s.label}
                {s.detail && (
                  <span className="ml-2 font-mono text-[10px] text-slate-400">
                    {s.detail}
                  </span>
                )}
              </span>
              <span className="font-mono text-[13px] tabular-nums text-slate-900">
                {s.value.toLocaleString()}
                {conversion !== null && (
                  <span className="ml-3 text-[10px] text-slate-400">
                    {conversion.toFixed(1)}% from prev
                  </span>
                )}
              </span>
            </div>
            <div
              className="h-3"
              style={{
                width,
                background: `linear-gradient(90deg, ${s.color} 0%, ${s.color}cc 60%, ${s.color}66 100%)`,
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
