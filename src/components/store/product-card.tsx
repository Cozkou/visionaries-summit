import type { Product } from "@/components/store/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col border border-neutral-200/90 bg-white">
      <div className="flex aspect-[4/5] items-end bg-[#f5f4f1] p-4">
        <h3 className="font-street text-[clamp(0.85rem,2.2vw,1rem)] uppercase leading-tight tracking-[0.04em] text-neutral-900">
          {product.name}
        </h3>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-neutral-200/90 px-4 py-3">
        <span className="text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
          {product.productType}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-neutral-900">£{product.price}</span>
      </div>
    </article>
  );
}
