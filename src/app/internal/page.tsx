import Link from "next/link";

import { INTERNAL_TOOLS } from "@/components/layout/internal-tools";
import { InternalShell } from "@/components/layout/internal-shell";

export default function InternalHomePage() {
  return (
    <InternalShell>
      <ul className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
        {INTERNAL_TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block px-4 py-4 transition-colors hover:bg-neutral-50 md:px-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-neutral-900">{tool.title}</span>
                <span className="shrink-0 font-mono text-[10px] tracking-wide text-neutral-400 uppercase">
                  Open →
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-neutral-500">
                {tool.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </InternalShell>
  );
}
