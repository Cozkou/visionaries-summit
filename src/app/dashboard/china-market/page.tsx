import { ChinaMarketView } from "@/components/china-market-view";
import { DashboardSection } from "@/components/dashboard/section-shell";

export const dynamic = "force-dynamic";

export default function ChinaMarketDashboardPage() {
  return (
    <DashboardSection
      title="China market"
      description="Live and cached China apparel market signals for expansion planning."
    >
      <ChinaMarketView />
    </DashboardSection>
  );
}
