import Link from "next/link";
import { notFound } from "next/navigation";

import { ConceptHero } from "@/components/store/concept-hero";
import { ListingActions } from "@/components/store/listing-actions";
import { StoreNav } from "@/components/store/store-nav";
import { getListingBySlug } from "@/lib/db/listings-repository";
import { toPublicListing } from "@/lib/public-listings";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EarlyReleaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) notFound();
  const publicListing = toPublicListing(listing);
  if (!publicListing) notFound();

  const statusLabel =
    publicListing.status === "published" ? "Live now" : "Early access";

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "#f7f6f3" }}>
      <StoreNav variant="solid" />

      <div className="mx-auto max-w-6xl px-6 pt-8 md:px-10 md:pt-12">
        <Link
          href="/early-releases"
          className="font-mono text-[11px] tracking-wide text-slate-500 transition-colors hover:text-slate-900"
        >
          ← early releases
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
          {/* Hero / product visual */}
          <div className="flex flex-col gap-4">
            <ConceptHero
              name={publicListing.name}
              productType={publicListing.productType}
              imageUrl={publicListing.imageUrl}
              seed={publicListing.slug}
              className="border border-slate-200/70"
            />
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">
              <span>Concept · {publicListing.productType}</span>
              <span>{publicListing.targetAudience}</span>
            </div>
          </div>

          {/* Info column */}
          <div className="flex flex-col gap-10 md:pt-2">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                <span
                  className={
                    publicListing.status === "published"
                      ? "inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                      : "inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
                  }
                />
                {statusLabel}
              </p>
              <h1 className="mt-4 font-street text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.92] uppercase tracking-[0.02em] text-slate-900">
                {publicListing.name}
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
                {publicListing.description}
              </p>
            </div>

            {publicListing.highlights.length > 0 && (
              <ul className="grid gap-3 border-y border-slate-200 py-6">
                {publicListing.highlights.map((highlight, i) => (
                  <li
                    key={highlight}
                    className="flex gap-4 text-[13px] leading-relaxed text-slate-600"
                  >
                    <span className="font-mono text-[10px] tracking-wide text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            <ListingActions
              slug={publicListing.slug}
              initialCounts={publicListing.counts}
              retailPrice={publicListing.retailPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
