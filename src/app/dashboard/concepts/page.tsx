import Link from "next/link";

import { DesignsGallery } from "@/components/designs-gallery";
import { DashboardSection } from "@/components/dashboard/section-shell";

export default function DesignConceptsPage() {
  return (
    <DashboardSection
      title="Design concepts"
      description="CSV-grounded concepts ready for review and analysis."
    >
      <div className="flex justify-end">
        <Link
          href="/generate"
          className="font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          new generation →
        </Link>
      </div>
      <DesignsGallery />
    </DashboardSection>
  );
}
