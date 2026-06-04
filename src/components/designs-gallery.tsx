"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DesignCard } from "@/components/design-card";
import { listSavedDesigns } from "@/services/api";
import type { Design } from "@/types";

interface DesignsGalleryProps {
  /** Loaded on the server for internal pages (no browser auth required). */
  initialDesigns?: Design[];
  initialError?: string | null;
}

export function DesignsGallery({
  initialDesigns,
  initialError = null,
}: DesignsGalleryProps) {
  const [designs, setDesigns] = useState<Design[]>(initialDesigns ?? []);
  const [loading, setLoading] = useState(initialDesigns === undefined);
  const [error, setError] = useState<string | null>(initialError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await listSavedDesigns(100);
      setDesigns(results);
    } catch (err) {
      setDesigns([]);
      const message =
        err instanceof Error ? err.message : "Failed to load saved concepts";
      setError(
        message.includes("Unauthorized") || message.includes("401")
          ? "Staff sign-in required — use the banner above and enter your operator password."
          : message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDesigns !== undefined) return;
    load();
  }, [initialDesigns, load]);

  useEffect(() => {
    const onAuth = () => {
      if (initialDesigns !== undefined) void load();
    };
    window.addEventListener("pf-staff-auth", onAuth);
    return () => window.removeEventListener("pf-staff-auth", onAuth);
  }, [initialDesigns, load]);

  if (loading) {
    return <p className="text-[13px] text-neutral-500">Loading saved concepts…</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-[12px] font-medium text-neutral-600 underline hover:text-neutral-900"
        >
          Retry
        </button>
      </div>
    );
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
