import { CountdownSection, NewsletterSection } from "@/components/store/hero-section";
import { DropsViewportSection } from "@/components/store/drops-viewport-section";
import { StoreFooter } from "@/components/store/store-footer";
import { SplitHero } from "@/components/store/split-hero";
import type { PublicListing } from "@/lib/public-listings";
import type { CatalogProduct } from "@/lib/store/catalog-types";

interface StorefrontProps {
  featured: CatalogProduct | null;
  latestPublished: PublicListing | null;
}

/** Home scroll: 1 hero → 2 release timer → 3 latest drop → 4 newsletter → footer */
export function Storefront({ latestPublished }: StorefrontProps) {
  return (
    <div className="text-slate-900">
      <SplitHero />
      <CountdownSection />
      <DropsViewportSection listing={latestPublished} />
      <NewsletterSection listing={latestPublished} />
      <StoreFooter />
    </div>
  );
}
