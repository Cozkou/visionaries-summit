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
              Six AI-generated concepts ready for review.
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
