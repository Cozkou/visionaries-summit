"use client";

import { useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { CATEGORIES, type Product } from "@/components/store/products";
import { cn } from "@/lib/utils";

const SLIDE_MS = 720;

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPresent(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [open]);

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
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), SLIDE_MS);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [visible]);

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

  if (!present) return null;

  return (
    <div
      aria-modal
      role="dialog"
      aria-label="Search"
      aria-hidden={!visible}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && !visible) setPresent(false);
      }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-[#fafaf9] text-neutral-900 will-change-transform",
        "transition-transform duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        visible
          ? "pointer-events-auto translate-y-0"
          : "pointer-events-none -translate-y-[calc(100%+4px)]"
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          visible && "search-panel-content-enter motion-reduce:opacity-100"
        )}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-neutral-200/80 px-5 py-4 md:px-8">
          <input
            ref={inputRef}
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[15px] font-medium tracking-[0.02em] text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="shrink-0 text-neutral-400 transition-opacity hover:text-neutral-900"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-4">
              <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex shrink-0 gap-5 overflow-x-auto border-b border-neutral-200/80 px-5 py-3.5 md:gap-6 md:px-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 text-[10px] font-medium tracking-[0.2em] uppercase transition-colors ${
                activeCategory === cat
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6">
          {loading ? (
            <p className="py-16 text-center text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              Loading
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
              No results
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {filtered.map((p) => (
                <div key={p.id} onClick={onClose}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
