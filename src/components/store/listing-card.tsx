import Link from "next/link";

import { ConceptHero } from "@/components/store/concept-hero";
import { DropCountdown } from "@/components/store/drop-countdown";
import { buildSocialProof } from "@/lib/social-proof";
import type { PublicListing } from "@/lib/public-listings";

export function ListingCard({ listing }: { listing: PublicListing }) {
  const proof = buildSocialProof(listing.counts);
  const statusLabel =
    listing.status === "published" ? "Live" : "Coming soon";

  return (
    <Link
      href={`/early-releases/${listing.slug}`}
      className="group flex flex-col gap-4"
    >
      <div className="relative overflow-hidden">
        <ConceptHero
          name={listing.name}
          productType={listing.productType}
          imageUrl={listing.imageUrl}
          sourceProductId={listing.sourceProductId}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />
        <span className="absolute top-3 right-3 z-10 border border-slate-200/80 bg-[#f7f6f3]/95 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-slate-600">
          {statusLabel}
        </span>
        {listing.releaseAt && (
          <DropCountdown
            releaseAt={listing.releaseAt}
            variant="pill"
            className="absolute bottom-3 left-3 z-10"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate font-street text-[15px] tracking-[0.02em] uppercase text-slate-900">
            {listing.name}
          </h3>
          <span className="shrink-0 font-mono text-[12px] tabular-nums text-slate-500">
            £{Math.round(listing.retailPrice)}
          </span>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
          {listing.productType}
        </p>
        {!proof.isCold ? (
          <p className="font-mono text-[10px] tabular-nums text-slate-500">
            {proof.text}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
