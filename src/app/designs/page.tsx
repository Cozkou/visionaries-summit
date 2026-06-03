import Link from "next/link";

import { DesignsGallery } from "@/components/designs-gallery";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function DesignsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Design Gallery</h1>
            <p className="text-sm text-muted-foreground">
              Up to six concepts — one per bestseller SKU from products.csv and
              line_items.csv (no mock data).
            </p>
          </div>
          <Button variant="outline" render={<Link href="/generate" />}>
            New generation
          </Button>
        </div>
        <DesignsGallery />
      </div>
    </AppShell>
  );
}
