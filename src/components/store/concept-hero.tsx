import { cn } from "@/lib/utils";

interface ConceptHeroProps {
  name: string;
  productType: string;
  imageUrl?: string;
  sourceProductId?: string;
  className?: string;
}

/** Hero for a concept — real image URL only; otherwise CSV-backed label panel (no stock art). */
export function ConceptHero({
  name,
  productType,
  imageUrl,
  sourceProductId,
  className,
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

  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col justify-end border border-slate-200/90 bg-[#f7f6f3] p-6 md:p-8",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {productType}
      </p>
      <h2 className="mt-2 font-street text-[clamp(1.4rem,3.5vw,2.2rem)] uppercase leading-[0.95] tracking-[0.02em] text-slate-900">
        {name}
      </h2>
      {sourceProductId ? (
        <p className="mt-3 font-mono text-[11px] text-slate-500">
          Source SKU: {sourceProductId} (products.csv)
        </p>
      ) : (
        <p className="mt-3 text-[12px] text-slate-500">
          No product photography in the hackathon data pack.
        </p>
      )}
    </div>
  );
}
