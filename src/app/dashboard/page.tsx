import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/section-shell";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { internalPanelClass } from "@/components/layout/internal-tools";

export default function DashboardOverviewPage() {
  const sections = DASHBOARD_NAV.filter((item) => item.href !== "/dashboard");

  return (
    <DashboardSection
      title="Dashboard"
      description="Pick a section from the sidebar or below."
    >
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
