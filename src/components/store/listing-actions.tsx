"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { buildSocialProof } from "@/lib/social-proof";

interface ListingActionsProps {
  slug: string;
  initialCounts: {
    wishlistCount: number;
    preorderCount: number;
    preorderUnits: number;
    pageViews7d: number;
    pageViewsTotal: number;
    wooTotalSales: number;
  };
  retailPrice: number;
  sizes?: readonly string[];
}

const DEFAULT_SIZES = ["S", "M", "L", "XL"] as const;
const STORAGE_PREFIX = "pf-listing";

function readEmail(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(`${STORAGE_PREFIX}-email`) ?? "";
}

function writeEmail(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_PREFIX}-email`, email);
}

export function ListingActions({
  slug,
  initialCounts,
  retailPrice,
  sizes = DEFAULT_SIZES,
}: ListingActionsProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [email, setEmail] = useState("");
  const [size, setSize] = useState<string>(sizes[1] ?? sizes[0]);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [preorderPending, setPreorderPending] = useState(false);
  const [wishlistDone, setWishlistDone] = useState(false);
  const [preorderDone, setPreorderDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(readEmail());
    const wishlistKey = `${STORAGE_PREFIX}-${slug}-wishlist`;
    const preorderKey = `${STORAGE_PREFIX}-${slug}-preorder`;
    if (window.localStorage.getItem(wishlistKey)) setWishlistDone(true);
    if (window.localStorage.getItem(preorderKey)) setPreorderDone(true);

    fetch(`/api/listings/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  async function handleWishlist(e: React.FormEvent) {
    e.preventDefault();
    if (wishlistPending || wishlistDone) return;
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter your email first");
      return;
    }

    setWishlistPending(true);
    try {
      const res = await fetch(`/api/listings/${slug}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        counts?: typeof counts;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not add to wishlist");
      }
      if (data.counts) setCounts(data.counts);
      writeEmail(trimmed);
      window.localStorage.setItem(`${STORAGE_PREFIX}-${slug}-wishlist`, "1");
      setWishlistDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWishlistPending(false);
    }
  }

  async function handlePreorder(e: React.FormEvent) {
    e.preventDefault();
    if (preorderPending || preorderDone) return;
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter your email first");
      return;
    }

    setPreorderPending(true);
    try {
      const res = await fetch(`/api/listings/${slug}/preorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, size, quantity: 1 }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        counts?: typeof counts;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Pre-order failed");
      }
      if (data.counts) setCounts(data.counts);
      writeEmail(trimmed);
      window.localStorage.setItem(`${STORAGE_PREFIX}-${slug}-preorder`, "1");
      setPreorderDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPreorderPending(false);
    }
  }

  const proof = buildSocialProof(counts);

  return (
    <div className="flex flex-col gap-7">
      {/* Social proof */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            proof.isCold ? "bg-slate-300" : "bg-emerald-500"
          )}
        />
        <p
          className={cn(
            "font-mono text-[12px] tabular-nums",
            proof.isCold ? "text-slate-400" : "text-slate-700"
          )}
        >
          {proof.text}
        </p>
      </div>

      {/* Price + size */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-slate-200 pt-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Pre-order price
          </p>
          <p className="mt-1 font-street text-[32px] tracking-[0.02em] text-slate-900 tabular-nums">
            £{retailPrice.toFixed(0)}
            <span className="ml-3 text-[13px] font-normal tracking-normal text-slate-400">
              ships when the drop closes
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-baseline justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Size
          <span className="font-mono text-[10px] text-slate-300">{size}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              disabled={preorderDone}
              className={cn(
                "h-10 min-w-[2.75rem] border px-3 text-[12px] font-semibold tracking-[0.06em] transition-colors",
                size === s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-500",
                preorderDone && "pointer-events-none opacity-40"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Email
        </label>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form onSubmit={handleWishlist}>
          <button
            type="submit"
            disabled={wishlistPending || wishlistDone}
            className={cn(
              "h-12 w-full border text-[11px] font-bold tracking-[0.18em] uppercase transition-colors",
              wishlistDone
                ? "border-slate-200 bg-slate-50 text-slate-400"
                : "border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
            )}
          >
            {wishlistPending
              ? "Adding…"
              : wishlistDone
                ? "Wishlisted ✓"
                : "Add to wishlist"}
          </button>
        </form>
        <form onSubmit={handlePreorder}>
          <button
            type="submit"
            disabled={preorderPending || preorderDone}
            className={cn(
              "h-12 w-full text-[11px] font-bold tracking-[0.18em] uppercase transition-opacity",
              preorderDone
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:opacity-90 disabled:opacity-70"
            )}
          >
            {preorderPending
              ? "Reserving…"
              : preorderDone
                ? `Reserved · size ${size}`
                : `Pre-order — £${retailPrice.toFixed(0)}`}
          </button>
        </form>
      </div>

      {error && (
        <p className="text-[12px] text-red-600">{error}</p>
      )}

      {preorderDone && (
        <p className="font-mono text-[11px] tracking-wide text-slate-500">
          Reserved in size {size}. We&apos;ll email when this drop closes.
        </p>
      )}
    </div>
  );
}
