"use client";

import Link from "next/link";
import { useState } from "react";

import { SearchOverlay } from "@/components/store/search-overlay";

type StoreNavProps = {
  variant?: "overlay" | "solid";
};

export function StoreNav({ variant = "overlay" }: StoreNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const onDark = variant === "overlay";

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={`relative z-50 ${
          onDark ? "text-white" : "border-b border-neutral-200 bg-white text-neutral-900"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-4 px-5 py-3.5 text-[11px] font-medium tracking-[0.14em] uppercase md:px-8 md:py-4 ${
            onDark ? "bg-black/90" : "bg-neutral-50"
          }`}
        >
          <span className="truncate">
            AI-guided drops — only what your metrics love ships first
          </span>
        </div>

        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 md:px-8 md:py-5">
          <nav className="flex items-center gap-6 md:gap-8">
            <Link
              href="/early-releases"
              className={`hidden text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 sm:inline ${
                onDark ? "text-white/90" : "text-neutral-600"
              }`}
            >
              Early Releases
            </Link>
            <Link
              href="/lab"
              className={`text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 ${
                onDark ? "text-white/90" : "text-neutral-600"
              }`}
            >
              The Lab
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
              aria-label="Search"
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
              href="/#waitlist"
              className={`hidden text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 md:inline ${
                onDark ? "text-white/90" : "text-neutral-600"
              }`}
            >
              Waitlist
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
