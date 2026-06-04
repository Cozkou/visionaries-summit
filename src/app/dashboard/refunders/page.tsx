import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";

const MOCK_REFUNDERS = [
  { id: "RF-1042", customer: "james.m@email.com", amount: "£48.00", reason: "Size exchange", status: "Pending" },
  { id: "RF-1041", customer: "sarah.k@email.com", amount: "£72.00", reason: "Defective zip", status: "Approved" },
  { id: "RF-1040", customer: "alex.p@email.com", amount: "£35.00", reason: "Changed mind", status: "Review" },
];

export default function RefundersPage() {
  return (
    <DashboardSection
      title="Refunders"
      description="Track refund requests and resolution status across channels."
    >
      <ul className={internalPanelClass}>
        {MOCK_REFUNDERS.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{r.id}</p>
              <p className="text-neutral-500">{r.customer}</p>
            </div>
            <p className="font-medium tabular-nums text-neutral-800">{r.amount}</p>
            <p className="text-neutral-600">{r.reason}</p>
            <span className="font-mono text-[11px] text-neutral-500">
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
