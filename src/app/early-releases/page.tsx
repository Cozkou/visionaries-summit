import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { PRODUCTS } from "@/components/store/products";
import { StoreNav } from "@/components/store/store-nav";

export default function EarlyReleasesPage() {
  const drops = PRODUCTS.filter((p) => p.badge === "New" || p.category === "Jackets");

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
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

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Current drop
            </p>
            <h2 className="mt-2 text-lg font-medium text-neutral-900">Varsity capsule</h2>
          </div>
          <Link
            href="/#drop-countdown"
            className="text-[12px] font-medium tracking-[0.12em] text-neutral-500 uppercase transition-colors hover:text-neutral-900"
          >
            Next drop timer →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-8">
          {drops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
