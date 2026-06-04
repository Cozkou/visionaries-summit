"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DesignCard } from "@/components/design-card";
import { listSavedDesigns } from "@/services/api";
import type { Design } from "@/types";

export function DesignsGallery() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await listSavedDesigns(100);
      setDesigns(results);
    } catch {
      setDesigns([]);
      setError("Failed to load saved concepts. Check you are signed in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-[13px] text-neutral-500">Loading saved concepts…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (designs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-200 bg-white px-6 py-10 text-center">
        <p className="text-[13px] text-neutral-600">
          No concepts saved yet. Generate from Pretty Fly CSV bestsellers, then
          they appear here with traceable metrics.
        </p>
        <Link
          href="/internal/generate"
          className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-[11px] font-medium tracking-wide text-white uppercase"
        >
          Generate concepts
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </div>
  );
}
