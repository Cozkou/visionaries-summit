"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { OdometerPair } from "@/components/store/odometer-digit";

/* ─── Countdown ─────────────────────────────────────────────────────────────── */

function secsToNextFiveMin() {
  const now = Date.now();
  const interval = 5 * 60 * 1000;
  return Math.ceil((interval - (now % interval)) / 1000);
}

function useCountdown() {
  const [secs, setSecs] = useState<number | null>(null);
  useEffect(() => {
    setSecs(secsToNextFiveMin());
    const id = setInterval(() => setSecs(secsToNextFiveMin()), 1000);
    return () => clearInterval(id);
  }, []);
  if (secs === null) return { minutes: null, seconds: null };
  return {
    minutes: Math.floor(secs / 60),
    seconds: secs % 60,
  };
}

/* ─── Countdown viewport (second screen) ─────────────────────────────────────── */

export function CountdownSection() {
  const { minutes, seconds } = useCountdown();

  return (
    <section
      id="drop-countdown"
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 items-center overflow-visible pl-[6vw] md:pl-[8vw]">
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
              Next Early Release Drop In:
            </p>

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

            <div className="hero-viewport-units mt-5 flex md:mt-6">
              <span className="hero-viewport-sublabel font-bold text-slate-400 uppercase">min</span>
              <span className="hero-viewport-sublabel font-bold text-slate-400 uppercase">sec</span>
            </div>

            <p className="hero-viewport-copy mt-7 max-w-md text-slate-400 md:mt-8">
              Concepts are scored against real sales, returns, and demand signals from
              our data pack — the highest performers graduate to limited early releases.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-10 md:pb-12">
        <Link
          href="#waitlist"
          aria-label="Scroll to waitlist"
          className="text-slate-300 transition-colors hover:text-slate-500"
        >
          <svg viewBox="0 0 10 18" fill="none" className="h-7 w-auto md:h-8">
            <path
              d="M5 1v12M1 9l4 6 4-6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

/* ─── Waitlist section ───────────────────────────────────────────────────────── */

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section
      id="waitlist"
      className="flex min-h-[55vh] flex-col items-center justify-center px-6 py-20"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="mx-auto mb-16 w-px bg-slate-300/60" style={{ height: 56 }} />

      <p className="max-w-xl text-center font-street text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.12] tracking-tight text-slate-900">
        Before the drop.
        <br />
        <span className="text-slate-300">Before the crowd.</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-14 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:max-w-md"
      >
        {submitted ? (
          <p className="w-full text-center text-[13px] font-semibold tracking-[0.14em] text-slate-700 uppercase">
            You&apos;re on the list ↗
          </p>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-5 text-[14px] text-slate-900 outline-none placeholder:text-slate-300 focus:border-slate-400"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-full bg-slate-900 px-6 text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-opacity hover:opacity-85"
            >
              Join waitlist
            </button>
          </>
        )}
      </form>

      <div className="mx-auto mt-16 w-px bg-slate-300/60" style={{ height: 56 }} />
      <p className="mt-6 text-[11px] tracking-[0.18em] text-slate-300 uppercase">
        © {new Date().getFullYear()} Pretty Fly
      </p>
    </section>
  );
}
