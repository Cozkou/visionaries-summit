import type { ConceptFunnelTotals } from "@/lib/data/pulse-analytics";

interface Props {
  totalRevenue: number;
  totalOrders: number;
  averageRefundRate: number;
  closingBalance: number;
  conceptFunnel: ConceptFunnelTotals;
}

function gbpCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `£${Math.round(n / 1_000)}k`;
  return `£${Math.round(n)}`;
}

export function PulseStatStrip({
  totalRevenue,
  totalOrders,
  averageRefundRate,
  closingBalance,
  conceptFunnel,
}: Props) {
  const stats: { label: string; value: string; note: string }[] = [
    {
      label: "Lifetime revenue",
      value: gbpCompact(totalRevenue),
      note: `${totalOrders.toLocaleString()} paid orders`,
    },
    {
      label: "Refund rate",
      value: `${averageRefundRate.toFixed(2)}%`,
      note: "24-month moving average",
    },
    {
      label: "Closing balance",
      value: gbpCompact(closingBalance),
      note: "end-of-window bank balance",
    },
    {
      label: "Concept funnel",
      value: conceptFunnel.preorderUnits
        ? `${conceptFunnel.preorderUnits} preorders`
        : `${conceptFunnel.wishlist} wishlist`,
      note: `${conceptFunnel.pageViews.toLocaleString()} views → ${conceptFunnel.commerceSales.toLocaleString()} sales`,
    },
  ];

  return (
    <ul className="grid grid-cols-1 gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <li
          key={s.label}
          className="flex flex-col gap-1 bg-white px-4 py-4 md:px-5"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] text-neutral-400 uppercase">
            {s.label}
          </span>
          <span className="font-street text-[clamp(1.4rem,2.4vw,1.8rem)] tracking-[0.01em] text-neutral-900 uppercase">
            {s.value}
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-neutral-500 uppercase">
            {s.note}
          </span>
        </li>
      ))}
    </ul>
  );
}
