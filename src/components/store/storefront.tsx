import { FilmGrainOverlay } from "@/components/store/film-grain-overlay";
import { HeroSection, WaitlistSection } from "@/components/store/hero-section";

export function Storefront() {
  return (
    <div className="text-slate-900" style={{ backgroundColor: "#f7f6f3" }}>
      <HeroSection />
      <WaitlistSection />
      <FilmGrainOverlay />
    </div>
  );
}
