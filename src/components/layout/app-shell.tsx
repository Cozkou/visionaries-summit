import Link from "next/link";

import { SkyBackground } from "@/components/atmosphere/sky-background";

/** Legacy shell — jacket showcase, control tower, and other non-dashboard routes */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900">
      <SkyBackground variant="subtle" />
      <header className="border-b border-white/50 bg-sky-50/60 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/internal" className="text-sm font-semibold text-sky-700">
              Pretty Fly Creative Director
            </Link>
            <nav className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-0.5 text-sm text-slate-600 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
            <Link
              href="/internal"
              className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
            >
              Internal
            </Link>
            <Link
              href="/dashboard"
              className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/internal/generate"
              className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
            >
              Generate
            </Link>
            <Link
              href="/control-tower"
              className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
            >
              Control Tower
            </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
