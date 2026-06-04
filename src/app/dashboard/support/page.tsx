import { DashboardSection } from "@/components/dashboard/section-shell";
import { internalPanelClass } from "@/components/layout/internal-tools";

const MOCK_MESSAGES = [
  { from: "Mia Torres", subject: "Hoodie sizing runs small?", time: "2h ago", unread: true },
  { from: "Jordan Lee", subject: "Order #8821 not received", time: "5h ago", unread: true },
  { from: "Sam Wright", subject: "Restock on varsity jacket?", time: "1d ago", unread: false },
];

export default function SupportMessagesPage() {
  return (
    <DashboardSection
      title="Support messages"
      description="Customer inbox — triage and respond to open threads."
    >
      <ul className={internalPanelClass}>
        {MOCK_MESSAGES.map((m) => (
          <li
            key={m.subject}
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm ${
              m.unread ? "bg-neutral-50" : ""
            }`}
          >
            <div>
              <p className="font-medium text-neutral-900">
                {m.unread && (
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-neutral-900" />
                )}
                {m.from}
              </p>
              <p className="text-neutral-600">{m.subject}</p>
            </div>
            <p className="font-mono text-[11px] text-neutral-400">{m.time}</p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
