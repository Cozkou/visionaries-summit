import Link from "next/link";

import { SkyBackground } from "@/components/atmosphere/sky-background";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-slate-900">
      <SkyBackground variant="subtle" />
      <header className="border-b border-white/50 bg-sky-50/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/internal" className="text-sm font-semibold text-sky-700">
            Pretty Fly Creative Director
          </Link>
          <nav className="flex gap-5 text-sm text-slate-600">
            <Link href="/dashboard" className="transition-colors hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/generate" className="transition-colors hover:text-slate-900">
              Generate
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
