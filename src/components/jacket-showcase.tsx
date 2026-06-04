"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SkyBackground } from "@/components/atmosphere/sky-background";

/**
 * Sterile annotated jacket showcase.
 *
 * Hero (title right-of-its-column, jacket left-of-its-column -> both hug the
 * centre gutter) flows into a scroll-driven teardown: the jacket stays pinned
 * (sticky) while the left column scrolls through "creative director" notes.
 * An IntersectionObserver marks the active note; a fixed SVG overlay draws a
 * leader line from that note to the matching jacket hotspot.
 */

type Dir = "up" | "down" | "flat";

type Metric = { label: string; value: string; dir: Dir };

type Hotspot = {
  x: number; // % across the jacket image
  y: number; // % down the jacket image
  tag: string;
  part: string;
  category: string;
  note: string;
  metrics: Metric[];
};

const HOTSPOTS: Hotspot[] = [
  {
    x: 52,
    y: 26,
    tag: "01",
    part: "Collar & rib trim",
    category: "Material",
    note: "Swap the melton wool collar for a recycled rib knit — keeps the structured stand, improves stretch recovery, and trims unit cost without touching the silhouette.",
    metrics: [
      { label: "Unit cost", value: "-12%", dir: "down" },
      { label: "Margin", value: "+6 pts", dir: "up" },
      { label: "Trend fit", value: "82", dir: "up" },
    ],
  },
  {
    x: 60,
    y: 41,
    tag: "02",
    part: "Chest monogram",
    category: "Branding",
    note: "The chenille monogram drives strong brand recall. Tighten it with tonal stitching and a felt backing to read more premium at retail and in product photography.",
    metrics: [
      { label: "Brand recall", value: "91", dir: "up" },
      { label: "Appeal", value: "+18%", dir: "up" },
      { label: "Trend fit", value: "88", dir: "up" },
    ],
  },
  {
    x: 14,
    y: 45,
    tag: "03",
    part: "Sleeve script",
    category: "Typography",
    note: "“Chosen” script sits low and slightly wide. Raise it 6mm and tighten kerning so it follows the sleeve drape — cleaner read on-body and in flat-lay.",
    metrics: [
      { label: "Legibility", value: "76 → 90", dir: "up" },
      { label: "Balance", value: "+14%", dir: "up" },
      { label: "Trend fit", value: "79", dir: "flat" },
    ],
  },
  {
    x: 35,
    y: 60,
    tag: "04",
    part: "Welt pockets",
    category: "Construction",
    note: "Add a concealed zip to the welt pockets. Negligible cost, but it aligns with the utility trend buyers are filtering for this season and lifts perceived function.",
    metrics: [
      { label: "Utility score", value: "+22%", dir: "up" },
      { label: "Add cost", value: "+$2", dir: "down" },
      { label: "Trend fit", value: "84", dir: "up" },
    ],
  },
  {
    x: 50,
    y: 73,
    tag: "05",
    part: "Hem stripe",
    category: "Colorway",
    note: "The cream-and-brown varsity hem is on-trend. Offering a navy alternative as a second SKU captures a different buyer segment with minimal tooling change.",
    metrics: [
      { label: "Conversion", value: "+7%", dir: "up" },
      { label: "New SKU", value: "+1", dir: "up" },
      { label: "Trend fit", value: "86", dir: "up" },
    ],
  },
];

/**
 * Repeating field of drifting clouds layered over the sky-blue gradient.
 * The five cloud images cycle down the whole scroll, thinning out near the
 * bottom so the final section opens onto clear blue sky.
 */
type Cloud = {
  img: number; // 1..6
  top: number; // vh from top of page
  left: number; // % across
  w: number; // vw
  opacity: number;
};

// Deterministic field so server and client markup match (no hydration drift).
function buildClouds(): Cloud[] {
  let seed = 20260604;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Only the super-clear cumulus variants (drop the soft/wispy 3 & 5).
  const CLEAR = [1, 2, 4, 6];
  const pick = () => CLEAR[Math.floor(rand() * CLEAR.length)];

  const out: Cloud[] = [];

  // A few clouds higher up in the first viewport (incl. the left side) so the
  // hero isn't bare, while keeping the top strip blue.
  out.push(
    { img: pick(), top: 18, left: -14, w: 72, opacity: 0.95 },
    { img: pick(), top: 30, left: 26, w: 66, opacity: 0.92 },
    { img: pick(), top: 22, left: 64, w: 78, opacity: 0.95 },
    { img: pick(), top: 40, left: 4, w: 70, opacity: 0.95 }
  );

  const START_TOP = 52;
  const END_TOP = 565; // keep clouds packed all the way down the scroll
  const ROW_GAP = 22; // vh between cloud rows
  const PER_ROW = 4; // few but huge overlapping clouds per row

  let row = 0;
  for (let base = START_TOP; base <= END_TOP; base += ROW_GAP, row++) {
    for (let k = 0; k < PER_ROW; k++) {
      const img = pick();
      const w = 90 + rand() * 50; // 90–140vw: huge
      // Spread across the row, biased to cover the left edge; stagger rows.
      const stagger = row % 2 === 0 ? 0 : 18;
      const left = -42 + k * 30 + stagger + (rand() * 14 - 7);
      // Row 0 only jitters downward to keep the blue band above it clean.
      const dy = row === 0 ? rand() * 8 : rand() * 16 - 8;
      const top = base + dy;
      const opacity = 0.9 + rand() * 0.1;
      out.push({ img, top, left, w, opacity });
    }
  }
  return out;
}

const CLOUDS: Cloud[] = buildClouds();

function CloudField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${c.top}vh`,
            left: `${c.left}%`,
            width: `${c.w}vw`,
            opacity: c.opacity,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/clouds/cloud-${c.img}.png`}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            className="w-full select-none"
          />
        </div>
      ))}
    </div>
  );
}

function MetricRow({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="flex justify-end gap-7">
      {metrics.map((m) => {
        const color =
          m.dir === "up"
            ? "text-emerald-600"
            : m.dir === "down"
            ? "text-sky-600"
            : "text-slate-500";
        const arrow = m.dir === "up" ? "↑" : m.dir === "down" ? "↓" : "→";
        return (
          <div key={m.label} className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              {m.label}
            </span>
            <span className={`text-[19px] font-semibold tabular-nums ${color}`}>
              <span className="mr-0.5 text-[13px]">{arrow}</span>
              {m.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function JacketShowcase() {
  const [active, setActive] = useState(-1); // -1 = hero

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const jacketImgRef = useRef<HTMLImageElement>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<SVGCircleElement>(null);

  // active is read inside the rAF loop via a ref to avoid re-subscribing.
  const activeRef = useRef(active);
  activeRef.current = active;
  const drawStartRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.idx));
          }
        });
      },
      { threshold: 0.55 }
    );
    const nodes = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  // Retrigger the draw-open animation whenever the active step changes.
  useEffect(() => {
    drawStartRef.current = performance.now();
  }, [active]);

  // Leader-line: recompute endpoints each frame; animate the draw-on.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const path = pathRef.current;
      const halo = haloRef.current;
      const node = nodeRef.current;
      const img = jacketImgRef.current;
      if (!path || !halo || !node || !img) return;

      const idx = activeRef.current;
      const content = idx >= 0 ? contentRefs.current[idx] : null;
      const pin = idx >= 0 ? pinRefs.current[idx] : null;

      if (idx < 0 || !content || !pin || !mq.matches) {
        path.style.opacity = "0";
        halo.style.opacity = "0";
        node.style.opacity = "0";
        return;
      }

      const pr = pin.getBoundingClientRect();
      const cr = content.getBoundingClientRect();

      // Anchor on the live pin rect so the line tracks the swinging jacket.
      const jx = pr.left + pr.width / 2;
      const jy = pr.top + pr.height / 2;
      const tx = cr.right + 12;
      const ty = cr.top + cr.height / 2;

      // text anchor -> short horizontal lead -> jacket point
      const lead = Math.min(48, Math.max(18, (jx - tx) * 0.18));
      const d = `M ${tx.toFixed(1)} ${ty.toFixed(1)} L ${(tx + lead).toFixed(1)} ${ty.toFixed(1)} L ${jx.toFixed(1)} ${jy.toFixed(1)}`;
      path.setAttribute("d", d);
      halo.setAttribute("d", d);

      const len = path.getTotalLength();
      const progress = reduce
        ? 1
        : Math.min(1, (performance.now() - drawStartRef.current) / 600);
      const eased = 1 - Math.pow(1 - progress, 3);
      const dash = `${len}`;
      const offset = `${len * (1 - eased)}`;
      path.style.strokeDasharray = dash;
      path.style.strokeDashoffset = offset;
      path.style.opacity = "1";
      halo.style.strokeDasharray = dash;
      halo.style.strokeDashoffset = offset;
      halo.style.opacity = "1";

      node.setAttribute("cx", jx.toFixed(1));
      node.setAttribute("cy", jy.toFixed(1));
      node.style.opacity = `${eased}`;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative pt-14 text-slate-900">
      <SkyBackground variant="full" />
      <SiteHeader />
      {/* ── Leader-line overlay (md+) ─────────────────────────────── */}
      <svg className="pointer-events-none fixed inset-0 z-20 hidden h-full w-full md:block">
        {/* White halo behind the line so it reads over busy clouds */}
        <path
          ref={haloRef}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.85"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0, transition: "opacity 0.3s ease" }}
        />
        <path
          ref={pathRef}
          fill="none"
          stroke="#0b2540"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0, transition: "opacity 0.3s ease" }}
        />
        <circle ref={nodeRef} r="5" fill="#0b2540" stroke="#ffffff" strokeWidth="2.5" style={{ opacity: 0 }} />
      </svg>

      {/* Repeating drifting clouds over the sky-blue gradient */}
      <CloudField />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
        {/* ── Left column: scrolling steps (hug centre gutter) ──────── */}
        <div className="relative z-10 order-2 md:order-1">
          {/* Step 0 — hero */}
          <section className="flex min-h-screen flex-col items-end justify-center px-7 py-20 text-right sm:px-12 lg:pr-16 lg:pl-24">
            <div className="reveal-on-load max-w-lg font-hero">
              <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-sky-700">
                SS26
              </p>

              <h1 className="mt-8 leading-[0.9]">
                <span className="block font-street text-[clamp(4rem,9.5vw,7rem)] uppercase leading-[0.82] tracking-[0.005em] text-sky-700 [text-shadow:0_2px_18px_rgba(255,255,255,0.6)]">
                  Pretty Fly
                </span>
                <span className="mt-3 block font-hero text-[clamp(1.35rem,3vw,2rem)] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Creative Director
                </span>
              </h1>

              <p className="mt-8 ml-auto max-w-md text-[clamp(1.125rem,2vw,1.375rem)] font-medium leading-relaxed text-slate-700">
                Generate new clothing from what already sold — past sales, trends,
                and brand fit, turned into concepts you can ship.
              </p>

              <div className="mt-10 flex items-center justify-end gap-8">
                <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Scroll
                </span>
                <Link
                  href="/internal/generate"
                  className="group inline-flex items-center gap-2 border-b-2 border-slate-900 pb-1.5 text-[15px] font-bold uppercase tracking-[0.12em] text-slate-900 transition-colors hover:border-sky-700 hover:text-sky-800"
                >
                  Begin
                  <span className="text-lg transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>

              <div className="mt-16 flex justify-end">
                <span className="jacket-scroll-cue text-[22px] text-slate-400">↓</span>
              </div>
            </div>
          </section>

          {/* Steps 1..N — annotations */}
          {HOTSPOTS.map((h, i) => (
            <div
              key={h.tag}
              data-idx={i}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="flex min-h-screen flex-col items-end justify-center px-7 py-20 text-right sm:px-12 lg:pr-16 lg:pl-24"
            >
              <div
                ref={(el) => {
                  contentRefs.current[i] = el;
                }}
                className={`max-w-md rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-[0_10px_40px_rgba(30,58,90,0.14)] backdrop-blur-md transition-all duration-500 ${
                  active === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-40"
                }`}
              >
                <div className="flex items-center justify-end gap-2.5 text-[11px] font-semibold uppercase tracking-[0.26em]">
                  <span className="tabular-nums text-slate-400">{h.tag}</span>
                  <span className="text-slate-300">—</span>
                  <span className="text-sky-700">{h.category}</span>
                </div>

                <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.1rem)] font-bold leading-[1.02] tracking-tight">
                  {h.part}
                </h2>

                <p className="mt-4 ml-auto max-w-sm text-[17px] leading-relaxed text-slate-700">
                  {h.note}
                </p>

                <div className="mt-7">
                  <MetricRow metrics={h.metrics} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right column: sticky hanging jacket (hugs left of its column) ── */}
        <div className="order-1 md:order-2">
          <div className="sticky top-0 flex h-[60vh] items-center justify-center md:h-screen md:justify-start md:pl-10 lg:pl-16">
            <div className="relative flex flex-col items-center">
              {/* Second (blue) jacket — peeks behind, fades away as you scroll */}
              <div
                aria-hidden
                className={`pointer-events-none absolute top-1/2 left-1/2 w-[26vw] max-w-[320px] -translate-y-[46%] transition-all duration-1000 ease-out ${
                  active < 0
                    ? "-translate-x-[86%] opacity-90"
                    : "-translate-x-[112%] opacity-0"
                }`}
              >
                <div
                  className="jacket-swing"
                  style={{ animationDuration: "7s", animationDelay: "-3s" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/varsity.PNG"
                    alt=""
                    draggable={false}
                    className="w-full select-none object-contain"
                    style={{ filter: "drop-shadow(0 22px 34px rgba(30,58,90,0.24))" }}
                  />
                </div>
              </div>

              {/* Hook (fixed pivot point) */}
              <span className="z-20 h-2.5 w-2.5 rounded-full border border-slate-300 bg-white shadow-sm" />

              {/* Swinging unit: string + jacket */}
              <div className="jacket-swing flex flex-col items-center">
                <span className="block w-px bg-gradient-to-b from-slate-400/70 to-slate-400/30 h-[4vh] md:h-[6vh]" />

                <div className="relative h-[50vh] w-auto md:h-[80vh]">
                  {/* Soft glow to separate the jacket from the clouds */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 h-[118%] w-[165%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,246,255,0.85),rgba(234,246,255,0.4)_45%,transparent_72%)] blur-2xl"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={jacketImgRef}
                    src="/jacket-cutout.png"
                    alt="Varsity jacket"
                    className="relative h-full w-auto select-none object-contain"
                    style={{
                      filter:
                        "drop-shadow(0 6px 14px rgba(30,58,90,0.4)) drop-shadow(0 30px 48px rgba(30,58,90,0.4))",
                    }}
                  />

                  {/* Minimal pin nodes */}
                  {HOTSPOTS.map((h, i) => {
                    const isActive = active === i;
                    return (
                      <button
                        key={h.tag}
                        type="button"
                        ref={(el) => {
                          pinRefs.current[i] = el;
                        }}
                        onClick={() =>
                          stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })
                        }
                        aria-label={`${h.part}: ${h.category}`}
                        className="group absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${h.x}%`, top: `${h.y}%` }}
                      >
                        {isActive && (
                          <span className="jacket-pin-pulse absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-600/50" />
                        )}
                        <span
                          className={`relative block rounded-full transition-all duration-300 ${
                            isActive
                              ? "h-2.5 w-2.5 bg-sky-600 ring-4 ring-white/80"
                              : "h-2 w-2 bg-slate-900/25 ring-2 ring-white/70 group-hover:bg-slate-900/50"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Soft grounding shadow */}
              <div className="jacket-shadow jacket-shadow-breathe pointer-events-none absolute -bottom-3 left-1/2 h-5 w-[55%] -translate-x-1/2 rounded-[50%]" />
            </div>

            {/* Progress ticks */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 md:left-10 md:translate-x-0 lg:left-16">
              {HOTSPOTS.map((h, i) => (
                <span
                  key={h.tag}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: active === i ? 16 : 6,
                    height: 2,
                    background: active === i ? "#0369a1" : "#a8c5e0",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
