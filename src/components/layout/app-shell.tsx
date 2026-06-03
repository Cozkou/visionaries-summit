import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-medium">
            Pretty Fly Creative Director
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/generate">Generate</Link>
            <Link href="/designs">Designs</Link>
            <Link href="/china-market">China Market</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
