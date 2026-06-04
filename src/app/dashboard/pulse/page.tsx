import { DashboardSection } from "@/components/dashboard/section-shell";
import { AdScatter } from "@/components/pulse/ad-scatter";
import { CashflowLine } from "@/components/pulse/cashflow-line";
import { ConceptFunnel } from "@/components/pulse/concept-funnel";
import { GlobeHeroLazy } from "@/components/pulse/globe-hero-lazy";
import { InventoryTreemap } from "@/components/pulse/inventory-treemap";
import { PulsePanel } from "@/components/pulse/pulse-panel";
import { PulseStatStrip } from "@/components/pulse/pulse-stat-strip";
import { RefundSparkline } from "@/components/pulse/refund-sparkline";
import { RevenueRhythm } from "@/components/pulse/revenue-rhythm";
import { SupportBars } from "@/components/pulse/support-bars";
import {
  getInventoryTreemapRows,
  getMarketingScatterRows,
  getPulseSnapshot,
  getSupportStackRows,
} from "@/lib/data/pulse-analytics";

export const dynamic = "force-dynamic";

export default async function PulsePage() {
  const pulse = await getPulseSnapshot();
  const marketingRows = getMarketingScatterRows();
  const supportRows = getSupportStackRows();
  const inventoryRows = getInventoryTreemapRows();

  return (
    <DashboardSection
      title="Pulse"
      description={`Where the numbers live. ${pulse.range.from} → ${pulse.range.to} · ${pulse.geoTotals.customers.toLocaleString()} customers · ${pulse.cashflow.length.toLocaleString()} bank lines.`}
    >
      <GlobeHeroLazy
        countries={pulse.geoCountries}
        cities={pulse.geoCities}
        suppliers={pulse.supplierOrigins}
        totals={pulse.geoTotals}
      />

      <PulseStatStrip
        totalRevenue={pulse.geoTotals.revenue}
        totalOrders={pulse.geoTotals.orders}
        averageRefundRate={pulse.averageRefundRate}
        closingBalance={pulse.cashflowSummary.closingBalance}
        conceptFunnel={pulse.conceptFunnel}
      />

      <PulsePanel
        title="Revenue rhythm"
        caption="24 months · paid + partially refunded · stacked by product type"
      >
        <RevenueRhythm
          data={pulse.monthlyRevenueByCategory}
          productTypes={pulse.productTypes}
        />
      </PulsePanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PulsePanel
          title="Ad efficiency"
          caption="x: spend · y: ROAS · size: orders · colour: triage action"
        >
          <AdScatter rows={marketingRows} />
        </PulsePanel>

        <PulsePanel
          title="Refund pulse"
          caption={`refunds ÷ units, by month · 24-month avg ${pulse.averageRefundRate}%`}
        >
          <RefundSparkline
            data={pulse.monthlyRefundRate}
            average={pulse.averageRefundRate}
          />
        </PulsePanel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PulsePanel
          title="Support automation"
          caption="bot vs human tickets per category · emerald = hours recoverable"
        >
          <SupportBars rows={supportRows} />
        </PulsePanel>

        <PulsePanel
          title="Inventory risk"
          caption="boxes sized by gross-profit-at-risk · colour = days of cover"
        >
          <InventoryTreemap rows={inventoryRows} />
        </PulsePanel>
      </div>

      <PulsePanel
        title="Cashflow ribbon"
        caption={`bank balance over time · opening £${pulse.cashflowSummary.openingBalance.toLocaleString()} → closing £${pulse.cashflowSummary.closingBalance.toLocaleString()}`}
      >
        <CashflowLine
          data={pulse.cashflow}
          summary={pulse.cashflowSummary}
        />
      </PulsePanel>

      <PulsePanel
        title="Concept demand funnel"
        caption={`aggregate across ${pulse.conceptFunnel.listingCount} published concept${pulse.conceptFunnel.listingCount === 1 ? "" : "s"}`}
      >
        <ConceptFunnel totals={pulse.conceptFunnel} />
      </PulsePanel>
    </DashboardSection>
  );
}
