import Link from "next/link";

import { ListingCard } from "@/components/store/listing-card";
import { StoreNav } from "@/components/store/store-nav";
import { listPublicListings } from "@/lib/public-listings";

export const dynamic = "force-dynamic";

export default async function EarlyReleasesPage() {
  const listings = await listPublicListings();

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "#f7f6f3" }}>
      <StoreNav variant="solid" />

      <section className="relative flex min-h-[40vh] items-end bg-neutral-900">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-28 md:px-10 md:pb-20">
          <p className="text-[11px] font-medium tracking-[0.28em] text-white/70 uppercase">
            From the lab
          </p>
          <h1 className="mt-3 max-w-2xl font-street text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.92] tracking-[0.02em] text-white">
            Early Releases
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75">
            Concepts published from Creative Director — grounded in Pretty Fly CSV
            sales data. No placeholder catalogue.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        {listings.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-[15px] text-slate-600">
              No published concepts yet. Generate and publish from{" "}
              <Link href="/internal/generate" className="font-medium text-slate-900 underline">
                Creative Director
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-300/60 pb-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                  Live on storefront
                </p>
                <h2 className="mt-2 font-street text-[clamp(1.4rem,3vw,2rem)] uppercase leading-tight tracking-[0.02em] text-slate-900">
                  Published concepts
                </h2>
              </div>
              <Link
                href="/#drop-countdown"
                className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase transition-colors hover:text-slate-900"
              >
                Next drop timer →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-8">
              {listings.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
