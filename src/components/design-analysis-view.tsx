"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Design not found.</p>
        <Button variant="outline" render={<Link href="/designs" />}>
          Back to gallery
        </Button>
      </div>
    );
  }

  if (!analysisData) {
    return <p className="text-sm text-muted-foreground">Loading analysis…</p>;
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
    { label: "Lead Time", value: `${analysisData.leadTimeDays} Days` },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-square w-full max-w-md bg-muted">
          <Image
            src={design.imageUrl}
            alt={design.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{design.name}</h1>
          <p className="text-muted-foreground">{design.description}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Commercial Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-xl">{metric.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Historical Insights</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {analysisData.historicalInsights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">AI Recommendation</h2>
        <Card className="border-2">
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed">
              {analysisData.recommendation}
            </p>
          </CardContent>
        </Card>
      </section>

      <Button variant="outline" render={<Link href="/designs" />}>
        Back to gallery
      </Button>
    </div>
  );
}
