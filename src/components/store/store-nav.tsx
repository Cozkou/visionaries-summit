"use client";

import Link from "next/link";
import { useState } from "react";

import { SearchOverlay } from "@/components/store/search-overlay";

type StoreNavProps = {
  variant?: "overlay" | "solid";
  /** Hero-only: strip promo bar and extra chrome for a minimal black viewport. */
  minimal?: boolean;
  searchOpen?: boolean;
  onSearchOpenChange?: (open: boolean) => void;
};

export function StoreNav({
  variant = "overlay",
  minimal = false,
  searchOpen: searchOpenProp,
  onSearchOpenChange,
}: StoreNavProps) {
  const [searchOpenInternal, setSearchOpenInternal] = useState(false);
  const searchOpen = searchOpenProp ?? searchOpenInternal;
  const setSearchOpen = onSearchOpenChange ?? setSearchOpenInternal;
  const onDark = variant === "overlay";

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={`relative z-50 ${
          onDark && minimal
            ? "border-0 text-white"
            : onDark
              ? "text-white"
              : "border-b border-neutral-200 bg-white text-neutral-900"
        }`}
      >
        {minimal ? (
          <div className="relative px-5 py-5 md:px-8 md:py-6">
            <Link
              href="/"
              className="block text-center font-street text-[18px] tracking-[0.08em] uppercase md:text-[20px]"
            >
              Pretty Fly
            </Link>
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
              className="absolute top-5 right-5 transition-opacity hover:opacity-70 md:top-6 md:right-8"
            >
              <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="m14 14 3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 md:px-8 md:py-5">
            <nav className="flex items-center gap-6 md:gap-8">
              <Link
                href="/early-releases"
                className={`text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 ${
                  onDark ? "text-white/90" : "text-neutral-600"
                }`}
              >
                Early Releases
              </Link>
            </nav>

            <Link
              href="/"
              className={`justify-self-center font-street text-[18px] tracking-[0.08em] uppercase md:text-[20px] ${
                onDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Pretty Fly
            </Link>

            <div className="flex items-center justify-end gap-3 md:gap-5">
              <button
                type="button"
                aria-label="Search products"
                onClick={() => setSearchOpen(true)}
                className={`transition-opacity hover:opacity-70 ${onDark ? "text-white" : "text-neutral-700"}`}
              >
                <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="m14 14 3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <Link
                href="/#newsletter"
                className={`hidden text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 md:inline ${
                  onDark ? "text-white/90" : "text-neutral-600"
                }`}
              >
                Newsletter
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
