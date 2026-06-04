"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV } from "@/components/dashboard/nav";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-neutral-200 bg-white md:w-44 md:border-b-0 md:border-r">
      <nav className="flex gap-0 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-3">
        {DASHBOARD_NAV.map(({ href, label, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 px-3 py-2 text-left font-mono text-[11px] md:w-full ${
                active
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
