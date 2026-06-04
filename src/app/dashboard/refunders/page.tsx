"use client";

import { useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { getControlTowerActions } from "@/services/api";
import type { ControlTowerActionsResponse } from "@/services/api";
import { formatGbp } from "@/lib/format-dashboard";

export default function RefundersPage() {
  const [data, setData] = useState<ControlTowerActionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getControlTowerActions()
      .then(setData)
      .catch(() => setError("Failed to load actions."));
  }, []);

  return (
    <DashboardSection
      title="Refunders"
      description="Operator actions from the control tower: reorder, spend, and support priorities."
    >
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <ul className={internalPanelClass}>
        {data?.actions.map((action) => (
          <li key={action.title} className="px-4 py-3">
            <p className="text-sm font-medium text-neutral-900">{action.title}</p>
            <p className="mt-1 text-[13px] text-neutral-600">{action.detail}</p>
          </li>
        ))}
      </ul>
      {data?.marketingReallocation && (
        <p className="text-[13px] text-neutral-500">
          Reallocate {formatGbp(data.marketingReallocation.shiftSpend)} from weak campaigns
          · estimated {formatGbp(data.marketingReallocation.estimatedRevenueLift90d)} lift
          over 90 days.
        </p>
      )}
    </DashboardSection>
  );
}
