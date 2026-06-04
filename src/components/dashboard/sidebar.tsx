"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-neutral-200 bg-white md:w-48 md:border-b-0 md:border-r">
      <p className="hidden px-4 pt-4 font-mono text-[10px] tracking-[0.16em] text-neutral-400 uppercase md:block">
        Sections
      </p>
      <nav className="flex gap-0 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-3 md:pt-2">
        {DASHBOARD_NAV.map(({ href, label, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-left text-[12px] font-medium transition-colors md:w-full",
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
