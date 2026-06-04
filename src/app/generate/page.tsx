import { GenerateForm } from "@/components/generate-form";
import { InternalShell } from "@/components/layout/internal-shell";

export default function GeneratePage() {
  return (
    <InternalShell mainClassName="flex min-h-[calc(100vh-2.75rem)] flex-col">
      <h1 className="mb-6 shrink-0 text-sm font-medium text-neutral-900">Generate</h1>
      <GenerateForm />
    </InternalShell>
  );
}
