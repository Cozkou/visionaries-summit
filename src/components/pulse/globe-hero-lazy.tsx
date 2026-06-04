"use client";

import nextDynamic from "next/dynamic";

import type {
  GeoCityPoint,
  GeoCountryPoint,
  SupplierOriginPoint,
} from "@/lib/data/pulse-analytics";

// Lazy-load three.js + the imperative scene only on the client. This both
// keeps three out of the SSR bundle and lets Next 15 honour ssr:false (which
// is forbidden when called directly from a server component).
const GlobeHero = nextDynamic(
  () => import("@/components/pulse/globe-hero").then((m) => m.GlobeHero),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] w-full items-center justify-center bg-slate-950 font-mono text-[11px] tracking-[0.18em] text-slate-500 uppercase">
        spinning globe…
      </div>
    ),
  }
);

interface Props {
  countries: GeoCountryPoint[];
  cities: GeoCityPoint[];
  suppliers: SupplierOriginPoint[];
  totals: { revenue: number; orders: number; customers: number };
}

export function GlobeHeroLazy(props: Props) {
  return <GlobeHero {...props} />;
}
