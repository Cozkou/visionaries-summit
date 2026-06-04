import { CurrentEarlyReleaseSection } from "@/components/store/current-early-release";
import { CountdownSection, WaitlistSection } from "@/components/store/hero-section";
import { SplitHero } from "@/components/store/split-hero";

export function Storefront() {
  return (
    <div className="text-slate-900">
      <SplitHero />
      <CountdownSection />
      <CurrentEarlyReleaseSection />
      <WaitlistSection />
    </div>
  );
}
