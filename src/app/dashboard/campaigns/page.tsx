"use client";

import { useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { getMarketingTriage } from "@/services/api";
import type { MarketingResponse } from "@/services/api";
import { formatGbp } from "@/lib/format-dashboard";

export default function EmailCampaignsPage() {
  const [data, setData] = useState<MarketingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMarketingTriage({ limit: 12 })
      .then(setData)
      .catch(() => setError("Failed to load marketing data."));
  }, []);

  return (
    <DashboardSection
      title="Email campaigns"
      description="Paid campaign triage — spend, ROAS, and recommended action."
    >
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <ul className={internalPanelClass}>
        {data?.rows.map((c) => (
          <li key={c.campaign} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{c.campaign}</p>
              <p className="text-neutral-500">{c.action}</p>
            </div>
            <p className="text-neutral-600">Spend {formatGbp(c.spend)}</p>
            <p className="font-medium text-neutral-800">ROAS {c.roas.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
