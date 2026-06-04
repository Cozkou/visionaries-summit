import Image from "next/image";
import Link from "next/link";

import { ListingCard } from "@/components/store/listing-card";
import { ProductCard } from "@/components/store/product-card";
import { PRODUCTS } from "@/components/store/products";
import { StoreNav } from "@/components/store/store-nav";
import { listPublicListings } from "@/lib/public-listings";

export const dynamic = "force-dynamic";

export default function EarlyReleasesPage() {
  const listings = listPublicListings();
  const fallbackDrops = PRODUCTS.filter(
    (p) => p.badge === "New" || p.category === "Jackets"
  );

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "#f7f6f3" }}>
      <StoreNav variant="solid" />

      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-neutral-900">
        <Image
          src="/image.png"
          alt="Early release varsity collection"
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-28 md:px-10 md:pb-20">
          <p className="text-[11px] font-medium tracking-[0.28em] text-white/70 uppercase">
            Members First
          </p>
          <h1 className="mt-3 max-w-2xl font-street text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.92] tracking-[0.02em] text-white">
            Early Releases
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75">
            Limited runs shaped by what sold, what returned, and what your community
            keeps asking for — released to the waitlist before the public shop opens.
          </p>
        </div>
      </section>

      {listings.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-300/60 pb-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                In the lab — early access
              </p>
              <h2 className="mt-2 font-street text-[clamp(1.4rem,3vw,2rem)] uppercase leading-tight tracking-[0.02em] text-slate-900">
                Concepts scored, pushed live
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
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-300/60 pb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              {listings.length > 0 ? "Also live" : "Current drop"}
            </p>
            <h2 className="mt-2 font-street text-[clamp(1.4rem,3vw,2rem)] uppercase leading-tight tracking-[0.02em] text-slate-900">
              Varsity capsule
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
          {fallbackDrops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
