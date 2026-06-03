import { AppShell } from "@/components/layout/app-shell";
import { GenerateForm } from "@/components/generate-form";

export default function GeneratePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Generate Designs</h1>
          <p className="text-sm text-muted-foreground">
            Configure inputs to generate new clothing concepts.
          </p>
        </div>
        <GenerateForm />
      </div>
    </AppShell>
  );
}
