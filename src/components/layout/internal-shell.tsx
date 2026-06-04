import { cn } from "@/lib/utils";

import { InternalHeader } from "./internal-header";
import { InternalStaffSignIn } from "./internal-staff-sign-in";

export function InternalShell({
  children,
  sidebar,
  mainClassName,
  fullViewport,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mainClassName?: string;
  /** Fill viewport below header (e.g. /internal/generate) */
  fullViewport?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col bg-neutral-50 font-sans text-neutral-900",
        fullViewport ? "h-dvh overflow-hidden" : "min-h-dvh"
      )}
    >
      <InternalHeader />
      <InternalStaffSignIn />
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-col",
          fullViewport ? "min-h-0 flex-1" : "flex-1",
          sidebar && "md:min-h-0 md:flex-row"
        )}
      >
        {sidebar}
        <main
          className={cn(
            "flex-1 px-4 py-6 md:px-6 md:py-8",
            fullViewport && "flex min-h-0 flex-col overflow-hidden p-0 md:py-0",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
