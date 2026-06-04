import Link from "next/link";

import { INTERNAL_TOOLS } from "@/components/layout/internal-tools";
import { InternalShell } from "@/components/layout/internal-shell";

export default function InternalHomePage() {
  return (
    <InternalShell>
      <div className="mx-auto max-w-xl">
      <h1 className="text-sm font-medium text-neutral-900">Tools</h1>

      <ul className="mt-3 divide-y divide-neutral-200 border border-neutral-200 bg-white">
        {INTERNAL_TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block px-4 py-3 hover:bg-neutral-50"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium">{tool.title}</span>
                <span className="shrink-0 font-mono text-[11px] text-neutral-400">
                  {tool.href}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-neutral-500">
                {tool.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </InternalShell>
  );
}
