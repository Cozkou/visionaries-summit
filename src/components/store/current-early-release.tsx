import type { CatalogProduct } from "@/lib/store/catalog-types";

interface Props {
  featured: CatalogProduct;
}

export function CurrentEarlyReleaseSection({ featured }: Props) {
  const description = `${featured.unitsSold.toLocaleString()} units sold · ${featured.collection} · inventory ${featured.inventory.toLocaleString()} (variants.csv) · £${featured.revenueGbp.toLocaleString("en-GB")} revenue (line_items.csv)`;

  return (
    <section
      id="current-release"
      className="-mt-2 px-6 py-5 md:px-[8vw] md:py-6"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
          Top SKU signal · from data pack
        </p>

        <div className="flex flex-col gap-5 border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          <div className="flex h-24 w-20 shrink-0 items-end justify-center rounded-sm border border-slate-200/80 bg-[#f7f6f3] p-3 sm:h-28 sm:w-24">
            <span className="font-street text-[10px] uppercase leading-tight tracking-[0.12em] text-slate-800">
              {featured.productType}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-[13px] font-medium text-slate-900">{featured.name}</h2>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-slate-900">
                £{featured.price}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{description}</p>
            <p className="mt-2 font-mono text-[10px] text-slate-400">{featured.id}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
