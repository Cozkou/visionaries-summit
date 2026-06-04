"use client";

import Link from "next/link";

import type { Design } from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);

  return (
    <article className="border border-neutral-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={design.imageUrl}
        alt={design.name}
        className="aspect-square w-full bg-neutral-100 object-cover"
      />
      <div className="space-y-2 px-4 py-3">
        <h2 className="text-sm font-medium text-neutral-900">{design.name}</h2>
        <p className="text-[13px] leading-snug text-neutral-500">{design.description}</p>
        <p className="text-[13px] text-neutral-600">
          Retail £{design.retailPrice}
        </p>
        <Link
          href={`/design/${design.id}`}
          onClick={() => setSelectedDesign(design)}
          className="inline-block font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          analysis →
        </Link>
      </div>
    </article>
  );
}
