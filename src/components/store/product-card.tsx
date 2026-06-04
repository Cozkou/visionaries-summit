import type { Product } from "@/components/store/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-sky-50">
        {product.badge ? (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700 ring-1 ring-sky-100">
            {product.badge}
          </span>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-7 transition-transform duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-slate-900 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Add to bag
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-medium text-slate-900">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-sky-600">
            {product.category}
          </p>
        </div>
        <span className="shrink-0 text-[14px] font-semibold tabular-nums text-slate-900">
          £{product.price}
        </span>
      </div>
    </div>
  );
}
