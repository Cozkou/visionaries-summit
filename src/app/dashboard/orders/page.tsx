"use client";

import { useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { getInventoryRecommendations } from "@/services/api";
import type { InventoryResponse } from "@/services/api";
import { formatGbp } from "@/lib/format-dashboard";

export default function PastOrdersPage() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInventoryRecommendations({ limit: 15 })
      .then(setData)
      .catch(() => setError("Failed to load inventory rows."));
  }, []);

  return (
    <DashboardSection
      title="Past orders"
      description="Variant-level demand and inventory — sourced from control tower inventory API."
    >
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <ul className={internalPanelClass}>
        {data?.rows.map((o) => (
          <li key={o.sku} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{o.title}</p>
              <p className="font-mono text-[11px] text-neutral-500">{o.sku}</p>
            </div>
            <p className="text-neutral-500">{o.units_60d} units / 60d</p>
            <p className="font-medium text-neutral-800">{formatGbp(o.potential_revenue_gbp)}</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
