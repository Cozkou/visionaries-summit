"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/dashboard",
    label: "dashboard",
    active: (pathname: string) =>
      pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
  },
  {
    href: "/generate",
    label: "generate",
    active: (pathname: string) => pathname === "/generate",
  },
  {
    href: "/designs",
    label: "designs",
    active: (pathname: string) =>
      pathname === "/designs" || pathname.startsWith("/design/"),
  },
] as const;

export function InternalHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 py-3">
        <Link
          href="/internal"
          className="shrink-0 font-mono text-[11px] text-neutral-600 hover:text-neutral-900"
        >
          pretty-fly<span className="text-neutral-300">/</span>internal
        </Link>

        <nav className="flex flex-1 justify-center gap-5 font-mono text-[11px]">
          {NAV.map(({ href, label, active }) => {
            const isActive = active(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-400 hover:text-neutral-700"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="shrink-0 font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          storefront →
        </Link>
      </div>
    </header>
  );
}
