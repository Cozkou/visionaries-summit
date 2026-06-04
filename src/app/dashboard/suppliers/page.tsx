import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";

const MOCK_SUPPLIERS = [
  { name: "Northern Textiles Co.", category: "Wool & melton", lead: "12 days", rating: "4.8" },
  { name: "Chenille Works Ltd.", category: "Patches & embroidery", lead: "8 days", rating: "4.6" },
  { name: "Rib Knit Supply", category: "Trim & cuffs", lead: "5 days", rating: "4.9" },
];

export default function SuppliersPage() {
  return (
    <DashboardSection
      title="Suppliers"
      description="Vendor directory, lead times, and material categories."
    >
      <ul className={internalPanelClass}>
        {MOCK_SUPPLIERS.map((s) => (
          <li key={s.name} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{s.name}</p>
              <p className="text-neutral-500">{s.category}</p>
            </div>
            <p className="text-neutral-600">Lead {s.lead}</p>
            <p className="font-medium text-neutral-800">{s.rating} ★</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
