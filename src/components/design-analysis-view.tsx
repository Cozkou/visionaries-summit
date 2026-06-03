"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DataSourcesPanel } from "@/components/data-sources-panel";
import { DesignDataPanel } from "@/components/design-data-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDesignAnalysis, getDesignById } from "@/services/api";
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
      <p className="text-sm text-muted-foreground">
        {designLoading ? "Loading design…" : "Loading analysis…"}
      </p>
    );
  }

  if (error || !design) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {error ?? "Design not found."}
        </p>
        <Button variant="outline" render={<Link href="/designs" />}>
          Back to gallery
        </Button>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <p className="text-sm text-muted-foreground">Analysis unavailable.</p>
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-2">
        <DesignDataPanel design={design} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{design.name}</h1>
          <p className="text-muted-foreground">{design.description}</p>
          <p className="text-xs text-muted-foreground">
            Metrics use this concept&apos;s source SKU when available; category
            tables and insights are from the same CSV data pack.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Commercial Metrics (from data)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analysisData.metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-xl">{metric.value}</CardTitle>
                {metric.detail && (
                  <p className="text-xs text-muted-foreground">
                    {metric.detail}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Sources: {metric.sourceIds.join(", ")}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          Similar Products (24 months, line_items.csv)
        </h2>
        {analysisData.similarProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No historical matches in products.csv for this segment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 font-medium">Product ID</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Revenue</th>
                  <th className="px-4 py-2 font-medium">Units</th>
                  <th className="px-4 py-2 font-medium">Refund rate</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.similarProducts.map((product) => (
                  <tr key={product.productId} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">
                      {product.productId}
                    </td>
                    <td className="px-4 py-2">{product.title}</td>
                    <td className="px-4 py-2">
                      {formatCurrency(product.revenueGbp)}
                    </td>
                    <td className="px-4 py-2">
                      {product.unitsSold.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{product.refundRatePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Historical Insights</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {analysisData.historicalInsights.map((insight) => (
            <li key={insight.text} className="rounded-md border p-3">
              <p>{insight.text}</p>
              <p className="mt-1 text-xs">
                Sources: {insight.sourceIds.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Recommendation</h2>
        <Card className="border-2">
          <CardContent className="space-y-2 pt-6">
            <p className="text-base leading-relaxed">
              {analysisData.recommendation}
            </p>
            <p className="text-xs text-muted-foreground">
              Sources: {analysisData.recommendationSourceIds.join(", ")}
            </p>
          </CardContent>
        </Card>
      </section>

      <DataSourcesPanel
        sources={analysisData.dataSources}
        insights={analysisData.historicalInsights}
      />

      <Button variant="outline" render={<Link href="/designs" />}>
        Back to gallery
      </Button>
    </div>
  );
}
