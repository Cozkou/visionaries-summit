import { CountdownSection, NewsletterSection } from "@/components/store/hero-section";
import { DropsViewportSection } from "@/components/store/drops-viewport-section";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { StoreFooter } from "@/components/store/store-footer";
import { SplitHero } from "@/components/store/split-hero";
import type { PublicListing } from "@/lib/public-listings";
import type { CatalogProduct } from "@/lib/store/catalog-types";

interface StorefrontProps {
  featured: CatalogProduct | null;
  latestPublished: PublicListing | null;
}

export function Storefront({ latestPublished }: StorefrontProps) {
  return (
    <div className="text-slate-900">
      <ScrollReveal variant="scale" threshold={0.08}>
        <SplitHero />
      </ScrollReveal>
      <ScrollReveal variant="up" delay={80}>
        <CountdownSection releaseAt={latestPublished?.releaseAt ?? null} />
      </ScrollReveal>
      <ScrollReveal variant="up" delay={100}>
        <DropsViewportSection latestPublished={latestPublished} />
      </ScrollReveal>
      <ScrollReveal variant="up" delay={120}>
        <NewsletterSection listing={latestPublished} />
      </ScrollReveal>
      <ScrollReveal variant="fade" delay={80}>
        <StoreFooter />
      </ScrollReveal>
    </div>
  );
}
