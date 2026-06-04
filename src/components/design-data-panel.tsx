"use client";

import type { Design } from "@/types";

interface DesignDataPanelProps {
  design: Design;
  className?: string;
}

export function DesignDataPanel({ design, className = "" }: DesignDataPanelProps) {
  return (
    <div
      className={`flex aspect-square w-full flex-col justify-center gap-3 rounded-lg border border-dashed bg-muted/40 p-6 ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        No product imagery in data pack
      </p>
      {design.sourceProductId && (
        <p className="font-mono text-xs text-muted-foreground">
          Source SKU: {design.sourceProductId} (products.csv)
        </p>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {design.description}
      </p>
        <p className="text-xs text-muted-foreground">
        Achieved retail £{design.retailPrice.toFixed(2)} — line_items.csv unit
        revenue.
      </p>
    </div>
  );
}
