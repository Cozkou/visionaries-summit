import { DesignAnalysisView } from "@/components/design-analysis-view";
import { AppShell } from "@/components/layout/app-shell";

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Design Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Commercial metrics and AI recommendation for concept {id}.
          </p>
        </div>
        <DesignAnalysisView designId={id} />
      </div>
    </AppShell>
  );
}
