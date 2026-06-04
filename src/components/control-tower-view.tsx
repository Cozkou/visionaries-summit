"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSnapshot } from "@/types/dashboard";

function formatGbp(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `£${Math.round(value / 1_000).toLocaleString()}k`;
  return `£${Math.round(value).toLocaleString()}`;
}

function formatMetric(value: number, unit: string): string {
  if (unit === "currency") return formatGbp(value);
  if (unit === "hours") return `${value.toLocaleString()} hrs`;
  return value.toLocaleString();
}

const actionStyles: Record<string, string> = {
  Pause: "bg-red-500/10 text-red-700 dark:text-red-400",
  Trim: "bg-amber-500/10 text-amber-800 dark:text-amber-400",
  Hold: "bg-muted text-muted-foreground",
  Scale: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function ControlTowerView() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/control-tower");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setData((await res.json()) as DashboardSnapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading control tower…</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error ?? "No data"}</p>
        <Button variant="outline" type="button" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  const topMarketing = [...data.marketing.rows]
    .filter((r) => r.action === "Pause" || r.action === "Scale")
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{data.brand}</h1>
          <p className="text-sm text-muted-foreground">{data.subtitle}</p>
          <p className="max-w-2xl text-lg font-medium">{data.hero.headline}</p>
          <p className="max-w-2xl text-sm text-muted-foreground">{data.hero.body}</p>
          <p className="text-xs text-muted-foreground">
            Snapshot: {data.snapshotDate} · figures from hackathon CSV pack
          </p>
        </div>
        <Button variant="outline" type="button" onClick={load}>
          Refresh
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-xl">
                {formatMetric(m.value, m.unit)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{m.note}</p>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">This week&apos;s actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.actions.map((action) => (
            <Card key={action.title} className="border-2">
              <CardHeader>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Paid media triage (May 2026)</h2>
        <p className="text-sm text-muted-foreground">
          MER {data.marketing.summary.mer.toFixed(2)}x · spend{" "}
          {formatGbp(data.marketing.summary.spend)} · reallocation lift est.{" "}
          {formatGbp(data.marketing.summary.estimatedRevenueLift90d)} / 90d
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-2 font-medium">Campaign</th>
                <th className="px-4 py-2 font-medium">ROAS</th>
                <th className="px-4 py-2 font-medium">Spend</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {topMarketing.map((row) => (
                <tr key={row.campaign} className="border-b last:border-0">
                  <td className="px-4 py-2">{row.campaign}</td>
                  <td className="px-4 py-2">{row.roas.toFixed(2)}x</td>
                  <td className="px-4 py-2">{formatGbp(row.spend)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionStyles[row.action]}`}
                    >
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Reorder priority (variant level)</h2>
        <p className="text-sm text-muted-foreground">
          {data.inventory.summary.negativeVariants} variants negative · top-six
          reorder {formatGbp(data.inventory.summary.topSixReorderCost)} →{" "}
          {formatGbp(data.inventory.summary.topSixGrossProfit)} gross profit
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-2 font-medium">SKU</th>
                <th className="px-4 py-2 font-medium">Stock</th>
                <th className="px-4 py-2 font-medium">PO units</th>
                <th className="px-4 py-2 font-medium">Gross profit</th>
              </tr>
            </thead>
            <tbody>
              {data.inventory.rows.slice(0, 6).map((row) => (
                <tr key={row.sku} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium">{row.title}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {row.sku}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-red-600 dark:text-red-400">
                    {row.inventory_quantity}
                  </td>
                  <td className="px-4 py-2">{row.recommended_po_units}</td>
                  <td className="px-4 py-2">{formatGbp(row.gross_profit_gbp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Support automation (Fin-style)</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.insights.map((insight) => (
            <Card key={insight.title}>
              <CardHeader>
                <CardTitle className="text-base">{insight.title}</CardTitle>
                <CardDescription>{insight.detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Human share</th>
                <th className="px-4 py-2 font-medium">Hours saved @ +25% bot</th>
              </tr>
            </thead>
            <tbody>
              {data.support.rows.slice(0, 5).map((row) => (
                <tr key={row.category} className="border-b last:border-0">
                  <td className="px-4 py-2">{row.category.replace(/_/g, " ")}</td>
                  <td className="px-4 py-2">
                    {(row.humanShare * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-2">
                    {row.hoursSavedAt25Pct.toFixed(0)} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        {data.footer.validator} Source:{" "}
        <code className="text-xs">{data.footer.generatedFrom}</code>
      </p>
    </div>
  );
}
