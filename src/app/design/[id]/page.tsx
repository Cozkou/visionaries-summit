import { DesignAnalysisView } from "@/components/design-analysis-view";
import { InternalShell } from "@/components/layout/internal-shell";

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { id } = await params;

  return (
    <InternalShell>
      <DesignAnalysisView designId={id} />
    </InternalShell>
  );
}
