import { ChinaMarketView } from "@/components/china-market-view";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default function ChinaMarketPage() {
  return (
    <AppShell>
      <ChinaMarketView />
    </AppShell>
  );
}
