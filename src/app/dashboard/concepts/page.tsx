import Link from "next/link";

import { DesignsGallery } from "@/components/designs-gallery";
import { DashboardSection } from "@/components/dashboard/section-shell";
import { loadSavedDesignsForStaff } from "@/lib/internal/load-saved-designs";

export const dynamic = "force-dynamic";

export default async function DesignConceptsPage() {
  const { designs, error } = await loadSavedDesignsForStaff(100);

  return (
    <DashboardSection
      title="Design concepts"
      description="CSV-grounded concepts ready for review and analysis."
    >
      <div className="flex justify-end">
        <Link
          href="/internal/generate"
          className="font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          new generation →
        </Link>
      </div>
      <DesignsGallery initialDesigns={designs} initialError={error} />
    </DashboardSection>
  );
}
