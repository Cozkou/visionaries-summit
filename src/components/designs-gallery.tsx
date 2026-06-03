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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const results = await generateDesigns(generationInputs);
      if (!cancelled) {
        setDesigns(results);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [generationInputs]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading concepts…</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </div>
  );
}
