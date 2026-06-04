import Link from "next/link";

import { LatestDropPanel } from "@/components/store/latest-drop-panel";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import type { PublicListing } from "@/lib/public-listings";

interface Props {
  listing: PublicListing | null;
}

/** Viewport 3 — latest published early-release product only (no countdown). */
export function DropsViewportSection({ listing }: Props) {
  return (
    <section
      id="drops"
      className="flex min-h-[100dvh] flex-col"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="flex min-h-0 flex-1 flex-col justify-end px-6 pb-10 pt-16 md:px-[8vw] md:pb-14 md:pt-24">
        <div className="mx-auto w-full min-h-0 max-w-6xl">
          {listing ? (
            <LatestDropPanel listing={listing} />
          ) : (
            <ScrollReveal variant="up">
              <div className="mx-auto max-w-lg text-center md:text-left">
                <p className="text-[10px] font-medium tracking-[0.22em] text-slate-400 uppercase">
                  Latest drop
                </p>
                <Link
                  href="/early-releases"
                  className="mt-2.5 inline-block border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-800 uppercase transition-colors hover:border-slate-900 hover:text-slate-900"
                >
                  View all early releases
                </Link>
                <h2 className="mt-4 font-street text-[clamp(1.5rem,3.5vw,2.25rem)] uppercase leading-[0.95] tracking-[0.02em] text-slate-900">
                  Nothing live yet
                </h2>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
                  When a concept is published to early releases, it appears here with
                  size, wishlist, and pre-order.
                </p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
