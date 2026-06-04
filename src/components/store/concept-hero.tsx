import { cn } from "@/lib/utils";

interface ConceptHeroProps {
  name: string;
  productType: string;
  imageUrl?: string;
  className?: string;
  /** Used to vary the gradient seed slightly per concept. */
  seed?: string;
}

/**
 * Hero image / branded fallback for a concept listing.
 *
 * Concepts generated from the CSV pack have no real product photography, so the
 * fallback has to do real work — a literal grey box would tank the storefront.
 * This renders the brand wordmark and concept name on a soft Pretty Fly cream
 * card so the customer-facing pages stay editorial even pre-photography.
 */
export function ConceptHero({
  name,
  productType,
  imageUrl,
  className,
  seed,
}: ConceptHeroProps) {
  if (imageUrl?.trim()) {
    return (
      <div
        className={cn(
          "relative aspect-square overflow-hidden bg-[#f0eee8]",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const hueOffset = hashSeed(seed ?? name) % 360;

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden bg-[#f7f6f3]",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 30% 20%, hsla(${hueOffset}, 35%, 92%, 0.9), transparent 55%), radial-gradient(circle at 70% 80%, hsla(${(hueOffset + 70) % 360}, 30%, 90%, 0.7), transparent 60%)`,
      }}
    >
      {/* Vertical PRETTY FLY wordmark */}
      <span
        aria-hidden
        className="absolute left-5 top-5 select-none font-street text-[clamp(0.65rem,1vw,0.85rem)] uppercase tracking-[0.4em] text-slate-900/55"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        Pretty Fly
      </span>

      {/* Concept type eyebrow + name */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-6 md:px-8 md:pb-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          {productType}
        </span>
        <h2 className="font-street text-[clamp(1.6rem,4vw,2.6rem)] uppercase leading-[0.95] tracking-[0.02em] text-slate-900">
          {name}
        </h2>
      </div>

      {/* Brand corner mark */}
      <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-900/15 text-[9px] font-bold tracking-[0.18em] text-slate-700">
        PF
      </div>

      {/* Subtle scan-line / grain to read as a printed lookbook page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 4px)",
        }}
      />
    </div>
  );
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}
