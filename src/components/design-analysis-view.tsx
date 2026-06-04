"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { internalPanelClass } from "@/components/layout/internal-tools";
import { mockDesigns } from "@/data/mockDesigns";
import { getDesignAnalysis } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import type { Design } from "@/types";

interface DesignAnalysisViewProps {
  designId: string;
}

function formatCurrency(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function DesignAnalysisView({ designId }: DesignAnalysisViewProps) {
  const selectedDesign = useAppStore((s) => s.selectedDesign);
  const analysisData = useAppStore((s) => s.analysisData);
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);
  const setAnalysisData = useAppStore((s) => s.setAnalysisData);

  const design: Design | undefined =
    selectedDesign?.id === designId
      ? selectedDesign
      : mockDesigns.find((d) => d.id === designId);

  useEffect(() => {
    if (design && selectedDesign?.id !== designId) {
      setSelectedDesign(design);
    }
  }, [design, designId, selectedDesign?.id, setSelectedDesign]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const analysis = await getDesignAnalysis(designId);
      if (!cancelled) {
        setAnalysisData(analysis);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [designId, setAnalysisData]);

  if (!design) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-neutral-500">Design not found.</p>
        <Link
          href="/designs"
          className="font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
        >
          ← designs
        </Link>
      </div>
    );
  }

  if (!analysisData) {
    return <p className="text-[13px] text-neutral-500">Loading analysis…</p>;
  }

  const metrics = [
    {
      label: "Manufacturing Cost",
      value: formatCurrency(analysisData.manufacturingCost),
    },
    {
      label: "Recommended Retail Price",
      value: formatCurrency(analysisData.recommendedRetailPrice),
    },
    {
      label: "Profit Per Unit",
      value: formatCurrency(analysisData.profitPerUnit),
    },
    { label: "Margin", value: `${analysisData.margin}%` },
    { label: "Lead Time", value: `${analysisData.leadTimeDays} days` },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-square w-full max-w-md overflow-hidden border border-neutral-200 bg-neutral-100">
          <Image
            src={design.imageUrl}
            alt={design.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-neutral-900">{design.name}</h2>
          <p className="text-[13px] text-neutral-600">{design.description}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">Commercial metrics</h2>
        <ul className={internalPanelClass}>
          {metrics.map((metric) => (
            <li
              key={metric.label}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
            >
              <span className="font-mono text-[11px] text-neutral-500">{metric.label}</span>
              <span className="text-sm font-medium text-neutral-900">{metric.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">Historical insights</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-neutral-600">
          {analysisData.historicalInsights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">AI recommendation</h2>
        <p className="border border-neutral-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-neutral-800">
          {analysisData.recommendation}
        </p>
      </section>

      <Link
        href="/designs"
        className="inline-block font-mono text-[11px] text-neutral-500 hover:text-neutral-900"
      >
        ← designs
      </Link>
    </div>
  );
}
