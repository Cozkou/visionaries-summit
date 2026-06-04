import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";

const MOCK_CAMPAIGNS = [
  { name: "SS26 drop — early access", status: "Scheduled", sent: "—", open: "—" },
  { name: "Abandoned cart — 24h", status: "Live", sent: "1,240", open: "38%" },
  { name: "Win-back — lapsed 90d", status: "Draft", sent: "—", open: "—" },
];

export default function EmailCampaignsPage() {
  return (
    <DashboardSection
      title="Email campaigns"
      description="Marketing sends, schedules, and performance snapshots."
    >
      <ul className={internalPanelClass}>
        {MOCK_CAMPAIGNS.map((c) => (
          <li key={c.name} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{c.name}</p>
              <p className="text-neutral-500">{c.status}</p>
            </div>
            <p className="text-neutral-600">Sent {c.sent}</p>
            <p className="font-medium text-neutral-800">Open {c.open}</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
