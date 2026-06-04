import Link from "next/link";

import { DesignsGallery } from "@/components/designs-gallery";
import { InternalShell } from "@/components/layout/internal-shell";

export default function DesignsPage() {
  return (
    <InternalShell>
      <div className="mb-6 flex justify-end">
        <Link
          href="/internal/generate"
          className="rounded-md bg-neutral-900 px-4 py-2 text-[11px] font-medium tracking-wide text-white uppercase transition-opacity hover:opacity-85"
        >
          New generation
        </Link>
      </div>
      <DesignsGallery />
    </InternalShell>
  );
}
