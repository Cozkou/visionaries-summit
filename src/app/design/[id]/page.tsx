import Link from "next/link";

import { DesignAnalysisView } from "@/components/design-analysis-view";
import { InternalShell } from "@/components/layout/internal-shell";

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { id } = await params;

  return (
    <InternalShell>
      <div className="mb-6">
        <Link
          href="/designs"
          className="font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          ← designs
        </Link>
        <h1 className="mt-3 text-sm font-medium text-neutral-900">
          Analysis · {id}
        </h1>
      </div>
      <DesignAnalysisView designId={id} />
    </InternalShell>
  );
}
