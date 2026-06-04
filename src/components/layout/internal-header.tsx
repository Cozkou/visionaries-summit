"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getInternalPageContext,
  INTERNAL_MAIN_NAV,
} from "@/components/layout/internal-nav";
import { cn } from "@/lib/utils";

export function InternalHeader() {
  const pathname = usePathname();
  const context = getInternalPageContext(pathname);

  return (
    <header className="shrink-0 border-b border-neutral-200 bg-white">
      <div className="border-b border-neutral-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <Link href="/internal" className="group shrink-0">
            <span className="block text-[13px] font-semibold tracking-tight text-neutral-900">
              Pretty Fly
            </span>
            <span className="mt-0.5 block font-mono text-[10px] tracking-[0.16em] text-neutral-400 uppercase transition-colors group-hover:text-neutral-600">
              Creative Director
            </span>
          </Link>

          <nav
            aria-label="Internal workspaces"
            className="flex flex-1 flex-wrap items-center justify-center gap-1 sm:gap-1.5"
          >
            {INTERNAL_MAIN_NAV.map(({ href, label, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3.5 py-2 text-[12px] font-medium tracking-wide transition-colors sm:px-4",
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

          <Link
            href="/"
            className="shrink-0 rounded-md border border-neutral-200 px-3 py-2 text-[11px] font-medium tracking-wide text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
          >
            Storefront
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        {context.breadcrumbs && context.breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] tracking-wide text-neutral-400 uppercase">
            {context.breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-neutral-300">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-neutral-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-neutral-600">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-[15px] font-medium text-neutral-900">{context.title}</h1>
          <p className="max-w-2xl text-[13px] leading-snug text-neutral-500">
            {context.description}
          </p>
        </div>
      </div>
    </header>
  );
}
