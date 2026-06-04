import { CountdownSection, WaitlistSection } from "@/components/store/hero-section";
import { SplitHero } from "@/components/store/split-hero";

export function Storefront() {
  return (
    <div className="text-slate-900">
      <SplitHero />
      <CountdownSection />
      <WaitlistSection />
    </div>
  );
}
