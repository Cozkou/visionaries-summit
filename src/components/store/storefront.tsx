import { CurrentEarlyReleaseSection } from "@/components/store/current-early-release";
import { CountdownSection, WaitlistSection } from "@/components/store/hero-section";
import { LatestPublishedSection } from "@/components/store/latest-published-section";
import { SplitHero } from "@/components/store/split-hero";
import type { PublicListing } from "@/lib/public-listings";
import type { CatalogProduct } from "@/lib/store/catalog-types";

interface StorefrontProps {
  featured: CatalogProduct | null;
  latestPublished: PublicListing | null;
}

export function Storefront({ featured, latestPublished }: StorefrontProps) {
  return (
    <div className="text-slate-900">
      <SplitHero />
      <CountdownSection />
      {latestPublished ? (
        <LatestPublishedSection listing={latestPublished} />
      ) : null}
      {featured ? <CurrentEarlyReleaseSection featured={featured} /> : null}
      <WaitlistSection />
    </div>
  );
}
