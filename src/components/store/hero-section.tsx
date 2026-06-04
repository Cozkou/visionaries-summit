"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DropCountdown } from "@/components/store/drop-countdown";
import { OdometerPair } from "@/components/store/odometer-digit";
import type { PublicListing } from "@/lib/public-listings";

function secsUntil(targetMs: number) {
  return Math.max(0, Math.ceil((targetMs - Date.now()) / 1000));
}

function useReleaseCountdown(releaseAt: number | null) {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    if (!releaseAt) {
      setSecs(null);
      return;
    }
    const tick = () => setSecs(secsUntil(releaseAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [releaseAt]);

  if (secs === null) return { minutes: null, seconds: null, active: false };
  return {
    minutes: Math.floor(secs / 60),
    seconds: secs % 60,
    active: secs > 0,
  };
}

interface CountdownSectionProps {
  /** From a published listing’s release_at (database). */
  releaseAt: number | null;
}

export function CountdownSection({ releaseAt }: CountdownSectionProps) {
  const { minutes, seconds, active } = useReleaseCountdown(releaseAt);

  if (!releaseAt) {
    return null;
  }

  return (
    <section
      id="drop-countdown"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="flex min-w-0 overflow-visible pb-4 pl-[6vw] md:pb-6 md:pl-[8vw]">
        <div className="flex min-w-0 items-center">
          <span
            aria-hidden
            className="hero-viewport-brand shrink-0 select-none font-street leading-none tracking-[0.1em] text-slate-900 uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Pretty Fly
          </span>

          <span className="mx-8 h-full max-h-[min(72vh,32rem)] w-px shrink-0 self-center bg-slate-400/30 md:mx-10" />

          <div className="flex w-fit max-w-full flex-col overflow-visible">
            <p className="hero-viewport-label mb-5 font-bold text-slate-500 uppercase md:mb-6">
              {active ? "Early access closes in:" : "Early access closed"}
            </p>

            {active ? (
              <div
                className="countdown-odometer flex shrink-0 items-baseline leading-none"
                aria-live="polite"
                aria-atomic="true"
              >
                <OdometerPair value={minutes} />
                <span className="countdown-colon mx-1.5 text-slate-300 md:mx-2" aria-hidden>
                  :
                </span>
                <OdometerPair value={seconds} />
              </div>
            ) : (
              <DropCountdown releaseAt={releaseAt} variant="hero" />
            )}

            <div className="hero-viewport-units mt-5 flex md:mt-6">
              <span className="hero-viewport-sublabel font-bold text-slate-400 uppercase">
                min
              </span>
              <span className="hero-viewport-sublabel font-bold text-slate-400 uppercase">
                sec
              </span>
            </div>

            <p className="hero-viewport-copy mt-7 max-w-md text-slate-400 md:mt-8">
              Timer driven by the published listing release window in the database —
              not a decorative interval.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface WaitlistSectionProps {
  listing: PublicListing | null;
}

export function WaitlistSection({ listing }: WaitlistSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !listing) return;

    setStatus("pending");
    setMessage(null);
    try {
      const res = await fetch(`/api/listings/${listing.slug}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Wishlist signup failed");
      }
      setStatus("done");
      setMessage(
        `${listing.counts.wishlistCount.toLocaleString()} on the waitlist (live DB count)`
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not join waitlist");
    }
  }

  if (!listing) {
    return (
      <section
        id="waitlist"
        className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-16"
        style={{ backgroundColor: "#f7f6f3" }}
      >
        <p className="max-w-md text-center text-[13px] text-slate-500">
          Publish a concept to early releases to collect real waitlist signups in the
          database.
        </p>
        <Link
          href="/early-releases"
          className="mt-6 text-[11px] font-semibold tracking-[0.14em] text-slate-900 uppercase"
        >
          View early releases →
        </Link>
      </section>
    );
  }

  return (
    <section
      id="waitlist"
      className="flex min-h-[55vh] flex-col items-center justify-center px-6 py-20"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="mx-auto mb-16 w-px bg-slate-300/60" style={{ height: 56 }} />

      <p className="max-w-xl text-center font-street text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.12] tracking-tight text-slate-900">
        {listing.name}
      </p>
      <p className="mt-3 text-center text-[13px] text-slate-500">
        {listing.counts.wishlistCount.toLocaleString()} on waitlist ·{" "}
        {listing.counts.preorderCount.toLocaleString()} pre-orders (database)
      </p>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:max-w-md"
      >
        {status === "done" ? (
          <p className="w-full text-center text-[13px] font-semibold tracking-[0.14em] text-slate-700 uppercase">
            Added to waitlist ↗
          </p>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "pending"}
              className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-5 text-[14px] text-slate-900 outline-none placeholder:text-slate-300 focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={status === "pending"}
              className="h-11 shrink-0 rounded-full bg-slate-900 px-6 text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-opacity hover:opacity-85 disabled:opacity-70"
            >
              {status === "pending" ? "Saving…" : "Join waitlist"}
            </button>
          </>
        )}
      </form>

      {message ? (
        <p className="mt-4 text-center text-[12px] text-slate-500">{message}</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-2 text-center text-[12px] text-red-600">{message}</p>
      ) : null}

      <div className="mx-auto mt-16 w-px bg-slate-300/60" style={{ height: 56 }} />
      <p className="mt-6 text-[11px] tracking-[0.18em] text-slate-300 uppercase">
        © {new Date().getFullYear()} Pretty Fly
      </p>
    </section>
  );
}
