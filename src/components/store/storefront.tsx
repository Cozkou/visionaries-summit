import { CurrentEarlyReleaseSection } from "@/components/store/current-early-release";
import { CountdownSection, WaitlistSection } from "@/components/store/hero-section";
import { SplitHero } from "@/components/store/split-hero";
import type { CatalogProduct } from "@/lib/store/catalog-types";

interface StorefrontProps {
  featured: CatalogProduct | null;
}

export function Storefront({ featured }: StorefrontProps) {
  return (
    <div className="text-slate-900">
      <SplitHero />
      <CountdownSection />
      {featured ? <CurrentEarlyReleaseSection featured={featured} /> : null}
      <WaitlistSection />
    </div>
  );
}
