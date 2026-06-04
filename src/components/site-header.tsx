"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/designs", label: "Designs" },
  { href: "/generate", label: "Generate" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/50 bg-sky-50/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link
          href="/internal"
          className="font-street text-[18px] uppercase tracking-[0.04em] text-sky-700 transition-opacity hover:opacity-70"
        >
          Pretty Fly
        </Link>

        <nav className="flex items-center gap-2">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/designs"
                ? pathname === "/designs" || pathname.startsWith("/design/")
                : pathname === href || pathname.startsWith(`${href}/`);
            const isGenerate = href === "/generate";
            return (
              <Link
                key={href}
                href={href}
                className={
                  isGenerate
                    ? "inline-flex h-9 items-center rounded-full bg-slate-900 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85"
                    : `inline-flex h-9 items-center rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                        active
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
