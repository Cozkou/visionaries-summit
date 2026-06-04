import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";

const MOCK_ORDERS = [
  { id: "ORD-8821", item: "Varsity jacket — brown", qty: 1, total: "£189", date: "Jun 1, 2026" },
  { id: "ORD-8819", item: "Graphic tee — neutral", qty: 2, total: "£58", date: "May 30, 2026" },
  { id: "ORD-8814", item: "Wide-leg jeans", qty: 1, total: "£95", date: "May 28, 2026" },
];

export default function PastOrdersPage() {
  return (
    <DashboardSection
      title="Past orders"
      description="Order history and line items for sales analysis."
    >
      <ul className={internalPanelClass}>
        {MOCK_ORDERS.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{o.id}</p>
              <p className="text-neutral-600">{o.item}</p>
            </div>
            <p className="text-neutral-500">×{o.qty}</p>
            <p className="font-medium tabular-nums text-neutral-800">{o.total}</p>
            <p className="font-mono text-[11px] text-neutral-400">{o.date}</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
