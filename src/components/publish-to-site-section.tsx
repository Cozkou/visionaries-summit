"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { internalPanelClass } from "@/components/layout/internal-tools";
import { DropCountdown } from "@/components/store/drop-countdown";
import {
  getDesignDemand,
  publishDesign,
  unpublishDesign,
} from "@/services/api";
import type { DesignDemand } from "@/types";

interface PublishToSiteSectionProps {
  designId: string;
  initialDemand: DesignDemand | null;
}

const POLL_INTERVAL_MS = 30_000;

function statusLabel(status: string): string {
  switch (status) {
    case "coming_soon":
      return "Coming soon";
    case "published":
      return "Published";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export function PublishToSiteSection({
  designId,
  initialDemand,
}: PublishToSiteSectionProps) {
  const [demand, setDemand] = useState<DesignDemand | null>(initialDemand);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    initialDemand ? Date.now() : null
  );

  useEffect(() => {
    setDemand(initialDemand);
    setLastUpdated(initialDemand ? Date.now() : null);
  }, [initialDemand, designId]);

  useEffect(() => {
    if (!demand) return;
    let cancelled = false;

    async function refresh() {
      try {
        const next = await getDesignDemand(designId);
        if (cancelled) return;
        if (next) {
          setDemand(next);
          setLastUpdated(Date.now());
        }
      } catch {
        /* keep stale numbers if a single refresh fails */
      }
    }

    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [demand, designId]);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      await publishDesign(designId);
      const next = await getDesignDemand(designId);
      setDemand(next);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    setPublishing(true);
    setError(null);
    try {
      await unpublishDesign(designId);
      const next = await getDesignDemand(designId);
      setDemand(next);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpublish");
    } finally {
      setPublishing(false);
    }
  }

  if (!demand) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-900">Customer demand</h2>
        <div className="border border-neutral-200 bg-white px-4 py-4">
          <p className="text-[13px] text-neutral-600">
            Push this concept to the storefront to test real customer signal.
            We&apos;ll create a draft listing in the connected ecommerce platform
            with a wishlist + pre-order CTA, and stream wishlist count,
            pre-orders and page views back into this view.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="h-9 bg-neutral-900 px-4 text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish to site"}
            </button>
            {error && (
              <span className="text-[12px] text-red-600">{error}</span>
            )}
          </div>
        </div>
      </section>
    );
  }

  const { listing, counts } = demand;
  const storefrontHref = `/early-releases/${listing.slug}`;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-900">
          Customer demand · live
        </h2>
        <div className="flex items-center gap-3">
          <DropCountdown
            releaseAt={listing.releaseAt}
            variant="internal"
            prefixOpen="Window closes in"
            prefixClosed="Window closed"
          />
          <span className="font-mono text-[11px] text-neutral-400">
            {statusLabel(listing.status)}
            {lastUpdated && (
              <> · synced {new Date(lastUpdated).toLocaleTimeString()}</>
            )}
          </span>
        </div>
      </div>

      <ul className={internalPanelClass}>
        <DemandRow label="Wishlist signups" value={counts.wishlistCount} />
        <DemandRow
          label="Pre-orders"
          value={counts.preorderCount}
          detail={
            counts.preorderUnits > 0
              ? `${counts.preorderUnits} units`
              : undefined
          }
        />
        <DemandRow label="Page views (7d)" value={counts.pageViews7d} />
        <DemandRow label="Page views (all)" value={counts.pageViewsTotal} />
        <DemandRow
          label="Sales on commerce platform"
          value={counts.wooTotalSales}
        />
      </ul>

      <div className="flex flex-wrap items-center gap-4 text-[12px]">
        <Link
          href={storefrontHref}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-neutral-600 underline-offset-2 hover:underline"
        >
          /early-releases/{listing.slug} ↗
        </Link>
        {listing.storefrontUrl && (
          <a
            href={listing.storefrontUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-neutral-500 underline-offset-2 hover:underline"
          >
            commerce listing ↗
          </a>
        )}
        <button
          type="button"
          onClick={handleUnpublish}
          disabled={publishing}
          className="ml-auto font-mono text-[11px] text-neutral-400 hover:text-neutral-700 disabled:opacity-50"
        >
          {publishing ? "…" : "unpublish"}
        </button>
      </div>

      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </section>
  );
}

function DemandRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
      <span className="font-mono text-[11px] text-neutral-500">{label}</span>
      <span className="text-sm font-medium tabular-nums text-neutral-900">
        {value.toLocaleString()}
        {detail && (
          <span className="ml-2 font-mono text-[11px] text-neutral-400">
            {detail}
          </span>
        )}
      </span>
    </li>
  );
}
