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

      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <header className="border-b border-slate-200/80 pb-12 pt-14 md:pb-16 md:pt-20">
          <p className="text-[10px] font-medium tracking-[0.32em] text-slate-400 uppercase">
            Pretty Fly
          </p>
          <h1 className="mt-4 font-street text-[clamp(2.25rem,6vw,4.25rem)] uppercase leading-[0.92] tracking-[0.02em] text-slate-900">
            Early Releases
          </h1>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-slate-500">
            Lab concepts backed by real sales data. Limited runs only.
          </p>
        </header>

        <section className="py-14 md:py-20">
          {listings.length === 0 ? (
            <p className="text-[13px] text-slate-500">
              Nothing live yet.{" "}
              <Link
                href="/internal/generate"
                className="font-medium text-slate-900 underline-offset-2 hover:underline"
              >
                Publish from Creative Director
              </Link>
            </p>
          ) : (
            <>
              <p className="mb-10 font-mono text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                {listings.length} live {listings.length === 1 ? "concept" : "concepts"}
              </p>
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
                {listings.map((listing) => (
                  <ListingCard key={listing.slug} listing={listing} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
