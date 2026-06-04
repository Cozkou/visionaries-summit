"use client";

import { useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { getInventoryRecommendations } from "@/services/api";
import type { InventoryResponse } from "@/services/api";
import { formatGbp } from "@/lib/format-dashboard";

export default function SuppliersPage() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInventoryRecommendations({ limit: 12 })
      .then(setData)
      .catch(() => setError("Failed to load inventory."));
  }, []);

  return (
    <DashboardSection
      title="Suppliers"
      description="Top inventory products. PO cost and gross profit from the data pack."
    >
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <ul className={internalPanelClass}>
        {data?.topProducts.map((s) => (
          <li key={s.product_id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{s.title}</p>
              <p className="text-neutral-500">{s.collection} · {s.product_type}</p>
            </div>
            <p className="text-neutral-600">Lead PO {s.recommended_po_units}u</p>
            <p className="font-medium text-neutral-800">{formatGbp(s.gross_profit_gbp)} GP</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
