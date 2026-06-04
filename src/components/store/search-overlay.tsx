"use client";

import { useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { CATEGORIES, type Product } from "@/components/store/products";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: { products: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchQ =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div
      aria-modal
      role="dialog"
      aria-label="Search"
      className={`fixed inset-0 z-[100] flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        open ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex shrink-0 items-center gap-4 border-b border-neutral-100 px-6 py-5 md:px-10">
        <svg viewBox="0 0 20 20" fill="none" className="size-5 shrink-0 text-neutral-400">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[18px] font-medium text-neutral-900 outline-none placeholder:text-neutral-300"
        />
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
        >
          <svg viewBox="0 0 16 16" fill="none" className="size-4 text-neutral-500">
            <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-neutral-100 px-6 py-3 md:px-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors ${
              activeCategory === cat
                ? "bg-neutral-900 text-white"
                : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {loading ? (
          <p className="mt-10 text-center text-[14px] text-neutral-400">Loading catalogue…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-neutral-400">No products found.</p>
        ) : (
          <>
            <p className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} · products.csv
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <div key={p.id} onClick={onClose}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
