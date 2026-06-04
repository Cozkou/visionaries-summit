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
import type {
  ChinaMarketMetric,
  ChinaMarketResponse,
  ChinaMarketSource,
} from "@/types/china-market";

function formatMetricValue(metric: ChinaMarketMetric): string {
  if (metric.value === null) return "Unavailable";
  switch (metric.unit) {
    case "billion_rmb":
      return `${Number(metric.value).toLocaleString()} billion RMB`;
    case "percent":
      return `${metric.value}%`;
    case "count":
      return Number(metric.value).toLocaleString();
    default:
      return String(metric.value);
  }
}

function modeLabel(mode: ChinaMarketResponse["mode"]): string {
  switch (mode) {
    case "live":
      return "Live — all metrics fetched";
    case "partial":
      return "Partial — some sources failed";
    case "unavailable":
      return "Unavailable — no live data";
  }
}

function ModeBadge({ mode }: { mode: ChinaMarketResponse["mode"] }) {
  const styles = {
    live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    partial: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-400",
    unavailable: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[mode]}`}
    >
      {modeLabel(mode)}
    </span>
  );
}

function LiveBadge({ live }: { live: boolean }) {
  if (live) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-muted-foreground/30 bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Not fetched
    </span>
  );
}


function findSource(
  sources: ChinaMarketSource[],
  id: string
): ChinaMarketSource | undefined {
  return sources.find((s) => s.id === id);
}

export function ChinaMarketView() {
  const [data, setData] = useState<ChinaMarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/china-market", { cache: "no-store" });
      const json = (await res.json()) as ChinaMarketResponse;
      if (!res.ok && res.status !== 503) {
        throw new Error(`Request failed (${res.status})`);
      }
      setData(json);
      if (json.mode === "unavailable") {
        setError("All live source fetches failed. See failures below.");
      }
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to load China market data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Fetching live China market data…</p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error ?? "No data."}</p>
        <Button variant="outline" type="button" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  const imageById = Object.fromEntries(data.images.map((img) => [img.id, img]));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">China Market Intelligence</h1>
            <ModeBadge mode={data.mode} />
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Metrics are parsed live from official press releases and corporate
            pages (NBS, JD.com IR, Alibaba Group, China Daily, Bosideng). No
            static fallback numbers — values stay empty until a source fetch
            succeeds.
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" type="button" onClick={load}>
          Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {error}
        </p>
      )}

      {data.failures.length > 0 && (
        <section className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h2 className="text-sm font-medium">Fetch failures</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {data.failures.map((failure) => (
              <li key={failure}>{failure}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Live metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.metrics.map((metric) => {
            const source = findSource(data.sources, metric.sourceId);
            return (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardDescription>{metric.label}</CardDescription>
                    <LiveBadge live={metric.live} />
                  </div>
                  <CardTitle className="text-xl">
                    {formatMetricValue(metric)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{metric.context}</p>
                  {metric.fetchedAt && (
                    <p className="text-xs text-muted-foreground">
                      Fetched {new Date(metric.fetchedAt).toLocaleString()}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {metric.sourceUrl && (
                      <a
                        href={metric.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Live source
                      </a>
                    )}
                    {source && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground underline-offset-4 hover:underline"
                      >
                        {source.title}
                      </a>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Channels</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.channels.map((channel) => {
            const image = channel.imageId
              ? imageById[channel.imageId]
              : undefined;
            return (
              <Card key={channel.id}>
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.proxyPath}
                    alt={image.alt}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle>{channel.name}</CardTitle>
                  <CardDescription>{channel.summary}</CardDescription>
                </CardHeader>
                {channel.bullets.length > 0 && (
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {channel.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </CardContent>
                )}
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Sources:{" "}
                    {channel.sourceIds
                      .map((id) => findSource(data.sources, id)?.publisher)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Brands</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.brands.map((brand) => {
            const image = brand.imageId ? imageById[brand.imageId] : undefined;
            return (
              <Card key={brand.id}>
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.proxyPath}
                    alt={image.alt}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle>{brand.name}</CardTitle>
                  <CardDescription>{brand.summary}</CardDescription>
                </CardHeader>
                {brand.bullets.length > 0 && (
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {brand.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Trend signals</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.trends.map((trend) => (
            <Card key={trend.id}>
              <CardHeader>
                <CardTitle className="text-base">{trend.title}</CardTitle>
                <CardDescription>{trend.detail}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {trend.sourceIds
                    .map((id) => findSource(data.sources, id)?.publisher)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <h2 className="text-sm font-medium">Official sources</h2>
        <p className="text-xs text-muted-foreground">
          All metrics link to these live pages. Images are proxied from the same
          publishers.
        </p>
        <ul className="space-y-3 text-sm">
          {data.sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {source.title}
              </a>
              <p className="text-xs text-muted-foreground">
                {source.publisher} · published {source.publishedAt} · id:{" "}
                <code>{source.id}</code>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
