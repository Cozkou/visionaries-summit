import Link from "next/link";

import { InternalShell } from "@/components/layout/internal-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";
import { ConceptHero } from "@/components/store/concept-hero";
import { DropCountdown } from "@/components/store/drop-countdown";
import { listPublicListings, type PublicListing } from "@/lib/public-listings";

export const dynamic = "force-dynamic";

function demandScore(l: PublicListing): number {
  // Pre-orders are real intent → weight heaviest. Wishlist is soft. Page
  // views are noisiest, so contribute least per unit.
  return (
    l.counts.preorderCount * 5 +
    l.counts.preorderUnits * 3 +
    l.counts.wishlistCount * 1 +
    l.counts.pageViews7d * 0.1
  );
}

function statusBadge(status: PublicListing["status"]): string {
  switch (status) {
    case "published":
      return "Live";
    case "coming_soon":
      return "Coming soon";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export default async function PublishedOverviewPage() {
  const listings = [...(await listPublicListings(200))].sort(
    (a, b) => demandScore(b) - demandScore(a)
  );

  const totals = listings.reduce(
    (acc, l) => {
      acc.wishlist += l.counts.wishlistCount;
      acc.preorders += l.counts.preorderCount;
      acc.preorderUnits += l.counts.preorderUnits;
      acc.views7d += l.counts.pageViews7d;
      acc.viewsAll += l.counts.pageViewsTotal;
      acc.sales += l.counts.wooTotalSales;
      return acc;
    },
    {
      wishlist: 0,
      preorders: 0,
      preorderUnits: 0,
      views7d: 0,
      viewsAll: 0,
      sales: 0,
    }
  );

  return (
    <InternalShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium text-neutral-900">
            Published concepts
          </h1>
          <p className="mt-1 max-w-prose text-[13px] text-neutral-500">
            Live storefront concepts ranked by customer demand. Pre-orders weigh
            heaviest, wishlist signups next, page views as a soft signal.
          </p>
        </div>
        <Link
          href="/internal/designs"
          className="font-mono text-[11px] tracking-wide text-neutral-500 hover:text-neutral-900"
        >
          ← all designs
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-[13px] text-neutral-600">
            Nothing published yet. Open a design analysis and hit{" "}
            <span className="font-medium">Publish to site</span> to start
            collecting demand signal.
          </p>
          <Link
            href="/internal/designs"
            className="mt-4 inline-block font-mono text-[11px] text-neutral-700 underline-offset-2 hover:underline"
          >
            Browse designs →
          </Link>
        </div>
      ) : (
        <>
          <ul className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryStat label="Concepts live" value={listings.length} />
            <SummaryStat label="Wishlist (total)" value={totals.wishlist} />
            <SummaryStat
              label="Pre-orders"
              value={totals.preorders}
              detail={
                totals.preorderUnits > 0
                  ? `${totals.preorderUnits} units`
                  : undefined
              }
            />
            <SummaryStat label="Views (7d)" value={totals.views7d} />
            <SummaryStat label="Views (all)" value={totals.viewsAll} />
            <SummaryStat label="Commerce sales" value={totals.sales} />
          </ul>

          <div className={`${internalPanelClass} overflow-hidden`}>
            <div className="hidden grid-cols-[minmax(220px,2.2fr)_repeat(5,minmax(0,1fr))_minmax(140px,1.2fr)_minmax(120px,auto)] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 font-mono text-[10px] tracking-wide text-neutral-500 uppercase md:grid">
              <span>Concept</span>
              <span className="text-right">Wishlist</span>
              <span className="text-right">Pre-orders</span>
              <span className="text-right">Views 7d</span>
              <span className="text-right">Views all</span>
              <span className="text-right">Commerce</span>
              <span>Closes</span>
              <span className="text-right">Open</span>
            </div>

            <ul className="divide-y divide-neutral-200">
              {listings.map((l) => (
                <li
                  key={l.slug}
                  className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[minmax(220px,2.2fr)_repeat(5,minmax(0,1fr))_minmax(140px,1.2fr)_minmax(120px,auto)] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden border border-neutral-200">
                      <ConceptHero
                        name={l.name}
                        productType={l.productType}
                        imageUrl={l.imageUrl}
                        seed={l.slug}
                        className="!aspect-auto h-full w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-neutral-900">
                        {l.name}
                      </p>
                      <p className="font-mono text-[10px] tracking-wide text-neutral-500 uppercase">
                        {l.productType} · {l.targetAudience} · £
                        {Math.round(l.retailPrice)} · {statusBadge(l.status)}
                      </p>
                    </div>
                  </div>

                  <MetricCell label="Wishlist" value={l.counts.wishlistCount} />
                  <MetricCell
                    label="Pre-orders"
                    value={l.counts.preorderCount}
                    detail={
                      l.counts.preorderUnits > 0
                        ? `${l.counts.preorderUnits}u`
                        : undefined
                    }
                  />
                  <MetricCell label="Views 7d" value={l.counts.pageViews7d} />
                  <MetricCell label="Views all" value={l.counts.pageViewsTotal} />
                  <MetricCell label="Commerce" value={l.counts.wooTotalSales} />

                  <div className="text-left">
                    <DropCountdown
                      releaseAt={l.releaseAt}
                      variant="internal"
                      prefixOpen="Closes in"
                      prefixClosed="Closed"
                    />
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <Link
                      href={`/internal/design/${l.designId}`}
                      className="font-mono text-[11px] text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                    >
                      analysis
                    </Link>
                    <Link
                      href={`/early-releases/${l.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                    >
                      storefront ↗
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </InternalShell>
  );
}

function SummaryStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <li className="border border-neutral-200 bg-white px-3 py-3">
      <p className="font-mono text-[10px] tracking-wide text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-[18px] font-medium tabular-nums text-neutral-900">
        {value.toLocaleString()}
        {detail && (
          <span className="ml-2 font-mono text-[10px] text-neutral-400">
            {detail}
          </span>
        )}
      </p>
    </li>
  );
}

function MetricCell({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 md:justify-end">
      <span className="font-mono text-[10px] tracking-wide text-neutral-400 uppercase md:hidden">
        {label}
      </span>
      <span className="text-[13px] font-medium tabular-nums text-neutral-900">
        {value.toLocaleString()}
        {detail && (
          <span className="ml-1 font-mono text-[10px] text-neutral-400">
            {detail}
          </span>
        )}
      </span>
    </div>
  );
}
