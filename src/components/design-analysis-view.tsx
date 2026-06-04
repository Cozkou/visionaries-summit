"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { internalPanelClass } from "@/components/layout/internal-tools";
import { getDesignAnalysis, getDesignById } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import type { Design } from "@/types";

interface DesignAnalysisViewProps {
  designId: string;
}

export function DesignAnalysisView({ designId }: DesignAnalysisViewProps) {
  const selectedDesign = useAppStore((s) => s.selectedDesign);
  const analysisData = useAppStore((s) => s.analysisData);
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);
  const setAnalysisData = useAppStore((s) => s.setAnalysisData);

  const [design, setDesign] = useState<Design | null>(
    selectedDesign?.id === designId ? selectedDesign : null
  );
  const [designLoading, setDesignLoading] = useState(!design);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDesign?.id === designId) {
      setDesign(selectedDesign);
      setDesignLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDesign() {
      setDesignLoading(true);
      setError(null);
      try {
        const fetched = await getDesignById(designId);
        if (cancelled) return;
        if (!fetched) {
          setDesign(null);
          setError("Design not found.");
        } else {
          setDesign(fetched);
          setSelectedDesign(fetched);
        }
      } catch {
        if (!cancelled) {
          setDesign(null);
          setError("Failed to load design.");
        }
      } finally {
        if (!cancelled) setDesignLoading(false);
      }
    }

    loadDesign();
    return () => {
      cancelled = true;
    };
  }, [designId, selectedDesign, setSelectedDesign]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setAnalysisLoading(true);
      setAnalysisData(null);
      setError(null);
      try {
        const analysis = await getDesignAnalysis(designId);
        if (!cancelled) setAnalysisData(analysis);
      } catch {
        if (!cancelled) setError("Failed to load analysis.");
      } finally {
        if (!cancelled) setAnalysisLoading(false);
      }
    }

    loadAnalysis();
    return () => {
      cancelled = true;
    };
  }, [designId, setAnalysisData]);

  if (designLoading || analysisLoading) {
    return (
      <p className="text-[13px] text-neutral-500">
        {designLoading ? "Loading design…" : "Loading analysis…"}
      </p>
    );
  }

  if (error || !design) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-neutral-500">{error ?? "Design not found."}</p>
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
    return <p className="text-[13px] text-neutral-500">Analysis unavailable.</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-neutral-900">{design.name}</h2>
        <p className="text-[13px] text-neutral-600">{design.description}</p>
        {design.sourceProductId && (
          <p className="font-mono text-[11px] text-neutral-400">{design.sourceProductId}</p>
        )}
        {design.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={design.imageUrl}
            alt={design.name}
            className="mt-4 max-h-80 w-full max-w-md object-contain"
          />
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">Commercial metrics</h2>
        <ul className={internalPanelClass}>
          {analysisData.metrics.map((metric) => (
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

      {analysisData.similarProducts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-900">Similar products</h2>
          <ul className={internalPanelClass}>
            {analysisData.similarProducts.map((product) => (
              <li key={product.productId} className="px-4 py-3 text-[13px]">
                <p className="font-medium text-neutral-900">{product.title}</p>
                <p className="mt-1 font-mono text-[11px] text-neutral-400">
                  {product.productId} · £{product.revenueGbp.toLocaleString()} revenue ·{" "}
                  {product.refundRatePercent}% refunds
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">Historical insights</h2>
        <ul className="space-y-2">
          {analysisData.historicalInsights.map((insight) => (
            <li
              key={insight.text}
              className="border border-neutral-200 bg-white px-4 py-3 text-[13px] text-neutral-600"
            >
              {insight.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">Recommendation</h2>
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
