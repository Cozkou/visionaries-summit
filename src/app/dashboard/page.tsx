"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { getControlTowerOverview } from "@/services/api";
import type { ControlTowerOverview } from "@/services/api";
import { formatMetricValue } from "@/lib/format-dashboard";

export default function DashboardOverviewPage() {
  const [data, setData] = useState<ControlTowerOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getControlTowerOverview()
      .then(setData)
      .catch(() => setError("Failed to load overview."));
  }, []);

  const sections = DASHBOARD_NAV.filter((item) => item.href !== "/dashboard");

  return (
    <DashboardSection
      title="Dashboard"
      description={data?.subtitle ?? "Operations hub — pick a section from the sidebar or below."}
    >
      {error && <p className="text-[13px] text-red-600">{error}</p>}

      {data && (
        <>
          <p className="text-[13px] text-neutral-600">{data.hero.body}</p>
          <ul className={internalPanelClass}>
            {data.metrics.map((metric) => (
              <li
                key={metric.label}
                className="px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-neutral-900">{metric.label}</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {formatMetricValue(metric.value, metric.unit)}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-neutral-500">{metric.note}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <ul className={internalPanelClass}>
        {sections.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
            >
              <span className="text-sm font-medium">{label}</span>
              <span className="font-mono text-[11px] text-neutral-400">{href}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
