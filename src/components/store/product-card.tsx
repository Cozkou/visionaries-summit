import type { Product } from "@/components/store/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col border border-neutral-200/90 bg-white">
      {product.imageUrl ? (
        <div className="aspect-[4/5] overflow-hidden bg-[#f5f4f1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/5] items-end bg-[#f5f4f1] p-4">
          <h3 className="font-street text-[clamp(0.85rem,2.2vw,1rem)] uppercase leading-tight tracking-[0.04em] text-neutral-900">
            {product.name}
          </h3>
        </div>
      )}
      <div className="flex flex-col gap-1.5 border-t border-neutral-200/90 px-3 py-2.5 sm:px-4 sm:py-3">
        {product.imageUrl ? (
          <h3 className="line-clamp-2 font-street text-[10px] uppercase leading-tight tracking-[0.04em] text-neutral-900 sm:text-[11px]">
            {product.name}
          </h3>
        ) : null}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
            {product.productType}
          </span>
          <span className="shrink-0 text-[12px] tabular-nums text-neutral-900">
            £{product.price}
          </span>
        </div>
      </div>
    </article>
  );
}
