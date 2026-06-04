"use client";

import Link from "next/link";

import { ListingActions } from "@/components/store/listing-actions";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import type { PublicListing } from "@/lib/public-listings";

interface Props {
  listing: PublicListing;
}

export function LatestDropPanel({ listing }: Props) {
  const imageUrl = listing.imageUrl?.trim();

  return (
    <div
      id="latest-drop"
      className="grid min-h-0 w-full grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:gap-10 lg:gap-12"
    >
      <ScrollReveal variant="left" delay={100} className="min-w-0">
        <div className="relative mx-auto aspect-[4/5] w-full max-h-[min(44vh,18rem)] max-w-[min(100%,16rem)] overflow-hidden border border-slate-300/80 bg-[#f7f6f3] md:mx-0 md:max-h-[min(56vh,26rem)] md:max-w-none">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={listing.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </ScrollReveal>

      <ScrollReveal variant="right" delay={220} className="min-w-0">
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-slate-400 uppercase">
            Latest drop
          </p>
          <Link
            href="/early-releases"
            className="mt-2.5 inline-block border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-800 uppercase transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            View all early releases
          </Link>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-street text-[clamp(1.5rem,3.5vw,2.25rem)] uppercase leading-[0.95] tracking-[0.02em] text-slate-900">
            {listing.name}
          </h2>
          <span className="font-street text-[clamp(1.25rem,2.5vw,1.75rem)] tabular-nums text-slate-900">
            £{Math.round(listing.retailPrice)}
          </span>
        </div>

        {listing.description ? (
          <p className="text-[13px] leading-relaxed text-slate-500 md:text-[14px]">
            {listing.description}
          </p>
        ) : null}

        <ListingActions
          slug={listing.slug}
          initialCounts={listing.counts}
          retailPrice={listing.retailPrice}
          variant="compact"
        />
        </div>
      </ScrollReveal>
    </div>
  );
}
