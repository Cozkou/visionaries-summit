"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { OdometerPair } from "@/components/store/odometer-digit";
import { ProductCard } from "@/components/store/product-card";
import { CATEGORIES, PRODUCTS } from "@/components/store/products";

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

/* ─── Search overlay ─────────────────────────────────────────────────────────── */

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchQ =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div
      aria-modal
      role="dialog"
      aria-label="Search"
      className={`fixed inset-0 z-[100] flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        open ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Search bar */}
      <div className="flex shrink-0 items-center gap-4 border-b border-slate-100 px-6 py-5 md:px-10">
        <svg viewBox="0 0 20 20" fill="none" className="size-5 shrink-0 text-slate-400">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[18px] font-medium text-slate-900 outline-none placeholder:text-slate-300"
        />
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
        >
          <svg viewBox="0 0 16 16" fill="none" className="size-4 text-slate-500">
            <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-100 px-6 py-3 md:px-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors ${
              activeCategory === cat
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-slate-400">No products found.</p>
        ) : (
          <>
            <p className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <div key={p.id} onClick={onClose}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Hamburger ──────────────────────────────────────────────────────────────── */

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 flex-col items-center justify-center gap-[5px]"
      >
        <span className={`block h-px w-5 bg-slate-800 transition-all duration-300 origin-center ${open ? "translate-y-[6px] rotate-45" : ""}`} />
        <span className={`block h-px w-5 bg-slate-800 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-px w-5 bg-slate-800 transition-all duration-300 origin-center ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
      </button>

      {open && (
        <nav className="absolute top-12 right-0 flex min-w-[160px] flex-col gap-0.5 rounded-xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-900/8">
          {[
            { href: "#waitlist", label: "Early Access" },
            { href: "#about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 text-[13px] font-medium tracking-wide text-slate-600 transition-colors hover:text-sky-700"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */

export function HeroSection() {
  const { minutes, seconds } = useCountdown();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <section
        className="relative flex h-screen min-h-[580px] flex-col overflow-hidden"
        style={{ backgroundColor: "#f7f6f3" }}
      >
        {/* Top bar — right side only: SHOP+search pill · hamburger */}
        <div className="flex items-center justify-end gap-4 px-8 pt-8 md:px-12 md:pt-10">
          {/* SHOP + search as a single unified button */}
          <button
            type="button"
            aria-label="Shop / search"
            onClick={() => setSearchOpen(true)}
            className="group flex items-center gap-0 overflow-hidden rounded-full border border-slate-200/80 bg-white/60 transition-colors hover:border-slate-300 hover:bg-white"
          >
            <span className="pl-5 pr-4 text-[12px] font-bold tracking-[0.18em] text-slate-600 uppercase transition-colors group-hover:text-slate-900 md:text-[13px]">
              Shop
            </span>
            <span className="h-5 w-px bg-slate-200" />
            <span className="flex size-11 items-center justify-center text-slate-400 transition-colors group-hover:text-slate-700">
              <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </button>

          <HamburgerMenu />
        </div>

        {/* Main — brand + countdown */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center overflow-visible pl-[6vw] md:pl-[8vw]">
          <div className="flex min-w-0 items-center">
            {/* Vertical "PRETTY FLY" */}
            <span
              aria-hidden
              className="hero-viewport-brand shrink-0 select-none font-street leading-none tracking-[0.1em] text-slate-900 uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Pretty Fly
            </span>

            {/* Hairline divider */}
            <span className="mx-8 h-full max-h-[min(72vh,32rem)] w-px shrink-0 self-center bg-slate-400/30 md:mx-10" />

            {/* Countdown */}
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

              <p className="hero-viewport-copy mt-7 max-w-sm text-slate-400 md:mt-8 md:max-w-md">
                Early releases are exclusive drops available to waitlist members
                before going public — limited quantity, no restock.
              </p>
            </div>
          </div>
        </div>

        {/* Static scroll cue */}
        <div className="flex justify-center pb-10 md:pb-12">
          <Link
            href="#waitlist"
            aria-label="Scroll down"
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
    </>
  );
}

/* ─── Waitlist section (revealed on scroll) ──────────────────────────────────── */

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
      {/* Thin top rule */}
      <div className="mx-auto mb-16 w-px bg-slate-300/60" style={{ height: 56 }} />

      {/* Quote */}
      <p className="max-w-xl text-center font-street text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.12] tracking-tight text-slate-900">
        Before the drop.
        <br />
        <span className="text-slate-300">Before the crowd.</span>
      </p>

      {/* Email form */}
      <form
        onSubmit={handleSubmit}
        className="mt-14 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:max-w-md"
      >
        {submitted ? (
          <p className="w-full text-center text-[13px] font-semibold tracking-[0.14em] text-sky-700 uppercase">
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

      {/* Bottom rule */}
      <div className="mx-auto mt-16 w-px bg-slate-300/60" style={{ height: 56 }} />
      <p className="mt-6 text-[11px] tracking-[0.18em] text-slate-300 uppercase">
        © {new Date().getFullYear()} Pretty Fly
      </p>
    </section>
  );
}
