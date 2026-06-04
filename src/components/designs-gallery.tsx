"use client";

import { useEffect, useState } from "react";

import { DesignCard } from "@/components/design-card";
import { generateDesigns } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import type { Design } from "@/types";

export function DesignsGallery() {
  const generationInputs = useAppStore((s) => s.generationInputs);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await generateDesigns(generationInputs);
        if (!cancelled) setDesigns(results);
      } catch {
        if (!cancelled) {
          setDesigns([]);
          setError("Failed to generate designs. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [generationInputs]);

  if (loading) {
    return <p className="text-[13px] text-neutral-500">Loading concepts…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </div>
  );
}
