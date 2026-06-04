import Link from "next/link";
import { notFound } from "next/navigation";

import { ConceptHero } from "@/components/store/concept-hero";
import { DropCountdown } from "@/components/store/drop-countdown";
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
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();
  const publicListing = await toPublicListing(listing);
  if (!publicListing) notFound();

  const statusLabel =
    publicListing.status === "published" ? "Live" : "Early access";

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "#f7f6f3" }}>
      <StoreNav variant="solid" />

      <main className="mx-auto max-w-6xl px-6 pb-20 md:px-10 md:pb-28">
        <div className="border-b border-slate-200/80 py-8 md:py-10">
          <Link
            href="/early-releases"
            className="text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase transition-colors hover:text-slate-900"
          >
            All early releases
          </Link>
        </div>

        <div className="grid gap-12 pt-10 md:grid-cols-[1fr_1fr] md:gap-16 md:pt-14 lg:gap-20">
          <div className="flex flex-col gap-3">
            <ConceptHero
              name={publicListing.name}
              productType={publicListing.productType}
              imageUrl={publicListing.imageUrl}
              sourceProductId={publicListing.sourceProductId}
              className="border border-slate-200/60"
            />
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
              {publicListing.productType}
              <span className="mx-2 text-slate-300">/</span>
              {publicListing.targetAudience}
            </p>
          </div>

          <div className="flex flex-col gap-8 md:pt-2 lg:gap-10">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  <span
                    className={
                      publicListing.status === "published"
                        ? "inline-block h-1.5 w-1.5 rounded-full bg-slate-900"
                        : "inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                    }
                  />
                  {statusLabel}
                </p>
                <DropCountdown
                  releaseAt={publicListing.releaseAt}
                  variant="inline"
                />
              </div>
              <h1 className="mt-5 font-street text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.92] tracking-[0.02em] text-slate-900">
                {publicListing.name}
              </h1>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-slate-500">
                {publicListing.description}
              </p>
            </div>

            {publicListing.highlights.length > 0 && (
              <ul className="flex flex-col gap-3 border-t border-slate-200/80 pt-8">
                {publicListing.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="text-[13px] leading-relaxed text-slate-500"
                  >
                    {highlight}
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
      </main>
    </div>
  );
}
