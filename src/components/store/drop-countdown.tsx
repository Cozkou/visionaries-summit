"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface DropCountdownProps {
  /** Epoch ms when the drop window closes. */
  releaseAt: number | null;
  /** Visual variant — sizes/tones for the contexts the badge lives in. */
  variant?: "pill" | "hero" | "inline" | "internal";
  /** Override label prefix (default depends on state). */
  prefixOpen?: string;
  prefixClosed?: string;
  className?: string;
}

interface Remaining {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diff(toMs: number, fromMs: number): Remaining {
  const ms = Math.max(0, toMs - fromMs);
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { done: ms <= 0, days, hours, minutes, seconds };
}

function formatRemaining(r: Remaining): string {
  if (r.done) return "Closed";
  if (r.days >= 1) return `${r.days}d ${r.hours}h`;
  if (r.hours >= 1) return `${r.hours}h ${r.minutes.toString().padStart(2, "0")}m`;
  if (r.minutes >= 1)
    return `${r.minutes}m ${r.seconds.toString().padStart(2, "0")}s`;
  return `${r.seconds}s`;
}

export function DropCountdown({
  releaseAt,
  variant = "pill",
  prefixOpen = "Closes in",
  prefixClosed = "Drop closed",
  className,
}: DropCountdownProps) {
  // Initialise from null so server + first client render match; the live value
  // hydrates after mount, avoiding a hydration mismatch on the timer.
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    if (!releaseAt) return;
    setRemaining(diff(releaseAt, Date.now()));
    // Tick every second for the final hour, otherwise every 30s is plenty
    // (the visible string only changes once per minute anyway).
    const tick = () => setRemaining(diff(releaseAt, Date.now()));
    const intervalMs =
      releaseAt - Date.now() < 60 * 60 * 1000 ? 1000 : 30_000;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [releaseAt]);

  if (!releaseAt) return null;

  const text = remaining
    ? remaining.done
      ? prefixClosed
      : `${prefixOpen} ${formatRemaining(remaining)}`
    : `${prefixOpen}…`;
  const closed = remaining?.done ?? false;

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "inline-flex items-baseline gap-2 font-mono text-[11px] tracking-[0.16em] uppercase",
          closed ? "text-slate-400" : "text-emerald-700",
          className
        )}
      >
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            closed ? "bg-slate-300" : "bg-emerald-500"
          )}
        />
        {text}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span
        className={cn(
          "font-mono text-[11px] tabular-nums",
          closed ? "text-slate-400" : "text-emerald-700",
          className
        )}
      >
        {text}
      </span>
    );
  }

  if (variant === "internal") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums",
          closed ? "text-neutral-400" : "text-neutral-700",
          className
        )}
      >
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            closed ? "bg-neutral-300" : "bg-emerald-500"
          )}
        />
        {text}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm",
        closed ? "text-slate-400" : "text-emerald-700",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          closed ? "bg-slate-300" : "bg-emerald-500"
        )}
      />
      {text}
    </span>
  );
}
