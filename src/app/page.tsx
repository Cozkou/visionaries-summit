import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Pretty Fly Creative Director
        </h1>
        <p className="text-muted-foreground">
          Generate clothing concepts from Pretty Fly historical sales data (CSV
          data pack) — revenue, costs, refunds, and lead times are all sourced
          from real records.
        </p>
        <div>
          <Button render={<Link href="/generate" />}>Start Designing</Button>
        </div>
      </div>
    </AppShell>
  );
}
