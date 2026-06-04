"use client";

import Link from "next/link";

import { useAppStore } from "@/store/useAppStore";
import type { Design } from "@/types";

interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);

  return (
    <article className="border border-neutral-200 bg-white">
      {design.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={design.imageUrl}
          alt={design.name}
          className="aspect-square w-full bg-neutral-100 object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-neutral-100 px-4 text-center text-[12px] text-neutral-400">
          <span>No product photo in CSV pack</span>
          {design.sourceProductId ? (
            <span className="font-mono text-[10px] text-neutral-500">
              Source: {design.sourceProductId}
            </span>
          ) : null}
        </div>
      )}
      <div className="space-y-2 px-4 py-3">
        <h2 className="text-sm font-medium text-neutral-900">{design.name}</h2>
        <p className="text-[13px] leading-snug text-neutral-500">{design.description}</p>
        <p className="text-[13px] text-neutral-600">
          Retail £{design.retailPrice.toFixed(2)}
        </p>
        {design.sourceProductId && (
          <p className="font-mono text-[11px] text-neutral-400">{design.sourceProductId}</p>
        )}
        <Link
          href={`/internal/design/${design.id}`}
          onClick={() => setSelectedDesign(design)}
          className="inline-block font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          analysis →
        </Link>
      </div>
    </article>
  );
}
