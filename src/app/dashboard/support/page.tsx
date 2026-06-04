"use client";

import { useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { getSupportAutomation } from "@/services/api";
import type { SupportResponse } from "@/services/api";

export default function SupportMessagesPage() {
  const [data, setData] = useState<SupportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupportAutomation({ limit: 12 })
      .then(setData)
      .catch(() => setError("Failed to load support data."));
  }, []);

  return (
    <DashboardSection
      title="Support messages"
      description="Support automation by category — human vs bot volume from the data pack."
    >
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <ul className={internalPanelClass}>
        {data?.rows.map((m) => (
          <li key={m.category} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{m.category}</p>
              <p className="text-neutral-600">
                {m.humanTickets} human · {m.botTickets} bot tickets
              </p>
            </div>
            <p className="font-mono text-[11px] text-neutral-400">
              {m.hoursSavedAt25Pct.toFixed(0)}h recoverable
            </p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
