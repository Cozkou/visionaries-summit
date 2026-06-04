import type { Product } from "@/components/store/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f6f3]">
        {product.badge ? (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700 ring-1 ring-sky-100">
            {product.badge}
          </span>
        ) : null}
        <div className="flex h-full flex-col justify-end p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {product.productType}
          </p>
          <p className="mt-2 font-street text-[clamp(1rem,2.5vw,1.35rem)] uppercase leading-tight text-slate-900">
            {product.name}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            {product.unitsSold.toLocaleString()} sold · {product.collection}
          </p>
        </div>
        <button
          type="button"
          className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-slate-900 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          View in data pack
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
