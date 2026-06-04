import { cn } from "@/lib/utils";

import { InternalHeader } from "./internal-header";

export function InternalShell({
  children,
  sidebar,
  mainClassName,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <InternalHeader />
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col",
          sidebar && "md:min-h-[calc(100vh-2.75rem)] md:flex-row"
        )}
      >
        {sidebar}
        <main className={cn("flex-1 px-4 py-6 md:py-8", mainClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
