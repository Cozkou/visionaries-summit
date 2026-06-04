"use client";

import { useEffect, useState } from "react";

import type { CatalogProduct } from "@/lib/store/catalog-types";
import { cn } from "@/lib/utils";

const SIZES = ["S", "M", "L", "XL"] as const;
const STORAGE_KEYS = {
  upvoted: "pf-early-release-upvoted",
  preordered: "pf-early-release-preordered",
  size: "pf-early-release-size",
} as const;

function formatCount(n: number) {
  return n.toLocaleString("en-GB");
}

interface Props {
  featured: CatalogProduct;
}

export function CurrentEarlyReleaseSection({ featured }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [preordered, setPreordered] = useState(false);
  const [size, setSize] = useState<string>(SIZES[1]);
  const [preorderPending, setPreorderPending] = useState(false);

  useEffect(() => {
    setUpvoted(localStorage.getItem(STORAGE_KEYS.upvoted) === "1");
    setPreordered(localStorage.getItem(STORAGE_KEYS.preordered) === "1");
    const savedSize = localStorage.getItem(STORAGE_KEYS.size);
    if (savedSize && (SIZES as readonly string[]).includes(savedSize)) {
      setSize(savedSize);
    }
    setHydrated(true);
  }, []);

  const localUpvotes = upvoted ? 1 : 0;
  const localPreorders = preordered ? 1 : 0;

  function toggleUpvote() {
    const next = !upvoted;
    setUpvoted(next);
    if (next) localStorage.setItem(STORAGE_KEYS.upvoted, "1");
    else localStorage.removeItem(STORAGE_KEYS.upvoted);
  }

  function handlePreorder() {
    if (preordered) return;
    setPreorderPending(true);
    window.setTimeout(() => {
      setPreordered(true);
      setPreorderPending(false);
      localStorage.setItem(STORAGE_KEYS.preordered, "1");
      localStorage.setItem(STORAGE_KEYS.size, size);
    }, 500);
  }

  const description = `${featured.unitsSold.toLocaleString()} units sold in the pack · ${featured.collection} · inventory ${featured.inventory.toLocaleString()} (variants.csv)`;

  return (
    <section
      id="current-release"
      className="-mt-2 px-6 py-5 md:px-[8vw] md:py-6"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
          Current early release · from data pack
        </p>

        <div className="flex flex-col gap-5 border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          <div className="flex h-24 w-20 shrink-0 items-end justify-center rounded-sm bg-[#f7f6f3] p-3 sm:h-28 sm:w-24">
            <span className="font-street text-[10px] uppercase leading-tight tracking-[0.12em] text-slate-800">
              {featured.productType}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-[13px] font-medium text-slate-900">{featured.name}</h2>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-slate-900">
                £{featured.price}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{description}</p>

            <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500">
              {hydrated ? (
                <>
                  {formatCount(localUpvotes)} session upvote
                  {localUpvotes !== 1 ? "s" : ""}
                  <span className="mx-2 text-slate-300">·</span>
                  {formatCount(localPreorders)} session preorder
                  {localPreorders !== 1 ? "s" : ""}
                </>
              ) : (
                "—"
              )}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={preordered}
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-7 min-w-[2rem] rounded-sm border px-2 text-[11px] font-medium transition-colors",
                    size === s
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400",
                    preordered && "pointer-events-none opacity-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 gap-2 sm:flex-col sm:gap-1.5">
            <button
              type="button"
              onClick={toggleUpvote}
              disabled={!hydrated}
              aria-pressed={upvoted}
              className={cn(
                "h-9 flex-1 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors sm:flex-none sm:min-w-[5.5rem]",
                upvoted
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-700 hover:border-slate-900"
              )}
            >
              {upvoted ? "Upvoted" : "Upvote"}
            </button>
            <button
              type="button"
              onClick={handlePreorder}
              disabled={!hydrated || preordered || preorderPending}
              className={cn(
                "h-9 flex-1 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase transition-opacity sm:flex-none sm:min-w-[5.5rem]",
                preordered
                  ? "bg-slate-100 text-slate-500"
                  : "bg-slate-900 text-white hover:opacity-90 disabled:opacity-70"
              )}
            >
              {preorderPending ? "…" : preordered ? "Done" : "Preorder"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
