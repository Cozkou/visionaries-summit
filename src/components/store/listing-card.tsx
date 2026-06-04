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
        <span className="absolute top-3 right-3 z-10 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-sm">
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

      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate font-street text-[16px] tracking-[0.02em] uppercase text-slate-900">
            {listing.name}
          </h3>
          <span className="shrink-0 text-[13px] font-semibold tabular-nums text-slate-900">
            £{Math.round(listing.retailPrice)}
          </span>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          {listing.productType} · {listing.targetAudience}
        </p>
        <p
          className={`font-mono text-[11px] tabular-nums ${
            proof.isCold ? "text-slate-400" : "text-emerald-700"
          }`}
        >
          {proof.text}
        </p>
      </div>
    </Link>
  );
}
