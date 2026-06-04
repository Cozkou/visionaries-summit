"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DropCountdown } from "@/components/store/drop-countdown";
import { OdometerPair } from "@/components/store/odometer-digit";
import { ScrollReveal } from "@/components/store/scroll-reveal";
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
  /** From a published listing's release_at (database). */
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
          <ScrollReveal variant="left" delay={60}>
            <span
              aria-hidden
              className="hero-viewport-brand shrink-0 select-none font-street leading-none tracking-[0.1em] text-slate-900 uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Pretty Fly
            </span>
          </ScrollReveal>

          <span className="mx-8 h-full max-h-[min(72vh,32rem)] w-px shrink-0 self-center bg-slate-400/30 md:mx-10" />

          <ScrollReveal variant="up" delay={160} className="flex w-fit max-w-full flex-col overflow-visible">
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

            <p className="hero-viewport-copy mt-7 max-w-lg text-slate-400 md:mt-8 lg:max-w-xl">
              Every concept is scored on real sales, returns, and demand. Only the top
              performers become limited early releases.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

interface NewsletterSectionProps {
  listing: PublicListing | null;
}

export function NewsletterSection({ listing }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (!listing) {
      setStatus("done");
      setMessage("Subscribed — check your inbox");
      return;
    }

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
        throw new Error(data.error ?? "Newsletter signup failed");
      }
      setStatus("done");
      setMessage("Subscribed — you're on the list");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe");
    }
  }

  if (!listing) {
    return (
      <section
        id="newsletter"
        className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16"
        style={{ backgroundColor: "#f7f6f3" }}
      >
        <ScrollReveal variant="up">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-[10px] font-medium tracking-[0.24em] text-slate-400 uppercase">
              Email newsletter
            </p>
            <h2 className="mt-4 font-street text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-[1.05] tracking-[0.02em] text-slate-900">
              Drops in your inbox
            </h2>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
              Publish a concept to early releases to start collecting signups in the
              database.
            </p>
            <Link
              href="/early-releases"
              className="mt-6 inline-block text-[11px] font-semibold tracking-[0.18em] text-slate-900 uppercase"
            >
              View early releases →
            </Link>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  return (
    <section
      id="newsletter"
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="mx-auto w-full max-w-lg text-center">
        <ScrollReveal variant="fade" delay={40}>
          <p className="text-[10px] font-medium tracking-[0.24em] text-slate-400 uppercase">
            Email newsletter
          </p>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={120}>
          <h2 className="mt-4 font-street text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-[1.05] tracking-[0.02em] text-slate-900">
            Drops in your inbox
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={200}>
          <p className="mt-4 text-[13px] leading-relaxed text-slate-500 md:text-[14px]">
            Early releases, restocks, and lab picks. One email when something new
            ships. No spam.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={280}>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
          >
            {status === "done" ? (
              <p className="w-full text-[12px] font-medium tracking-[0.18em] text-slate-700 uppercase">
                {message ?? "Subscribed — check your inbox"}
              </p>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "pending"}
                  className="h-11 min-w-0 flex-1 border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none placeholder:text-slate-300 focus:border-slate-900 sm:max-w-xs disabled:opacity-70"
                />
                <button
                  type="submit"
                  disabled={status === "pending"}
                  className="h-11 shrink-0 bg-slate-900 px-6 text-[11px] font-bold tracking-[0.18em] text-white uppercase transition-opacity hover:opacity-85 disabled:opacity-70"
                >
                  {status === "pending" ? "Saving…" : "Subscribe"}
                </button>
              </>
            )}
          </form>
          {status === "error" && message ? (
            <p className="mt-3 text-[12px] text-red-600">{message}</p>
          ) : null}
        </ScrollReveal>
      </div>
    </section>
  );
}

/** @deprecated Use NewsletterSection — kept for imports that still reference WaitlistSection */
export const WaitlistSection = NewsletterSection;
