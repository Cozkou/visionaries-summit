import Link from "next/link";

import { DesignsGallery } from "@/components/designs-gallery";
import { InternalShell } from "@/components/layout/internal-shell";

export default function DesignsPage() {
  return (
    <InternalShell>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium text-neutral-900">Designs</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Generated concepts ready for review.
          </p>
        </div>
        <Link
          href="/generate"
          className="font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          new generation →
        </Link>
      </div>
      <DesignsGallery />
    </InternalShell>
  );
}
