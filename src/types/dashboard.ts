export type MetricUnit = "count" | "currency" | "hours";

export interface DashboardMetric {
  label: string;
  value: number;
  unit: MetricUnit;
  note: string;
}

export interface InventoryRow {
  title: string;
  sku: string;
  collection: string;
  inventory_quantity: number;
  units_60d: number;
  recommended_po_units: number;
  po_cost_gbp: number;
  potential_revenue_gbp: number;
  gross_profit_gbp: number;
  days_cover: number;
}

export interface InventoryProduct {
  product_id: string;
  title: string;
  collection: string;
  gender_segment: string;
  product_type: string;
  inventory: number;
  units_60d: number;
  recommended_po_units: number;
  po_cost_gbp: number;
  potential_revenue_gbp: number;
  gross_profit_gbp: number;
}

export interface MarketingRow {
  campaign: string;
  spend: number;
  revenue: number;
  orders: number;
  roas: number;
  action: "Pause" | "Trim" | "Hold" | "Scale";
  utm_campaign?: string;
}

export interface SupportRow {
  category: string;
  humanTickets: number;
  botTickets: number;
  humanMinutes: number;
  botMinutes: number;
  humanShare: number;
  hoursSavedAt25Pct: number;
}

export interface DashboardSnapshot {
  brand: string;
  snapshotDate: string;
  subtitle: string;
  hero: {
    headline: string;
    body: string;
  };
  metrics: DashboardMetric[];
  inventory: {
    summary: {
      negativeVariants: number;
      netUnits: number;
      topSixReorderCost: number;
      topSixGrossProfit: number;
    };
    rows: InventoryRow[];
    topProducts: InventoryProduct[];
  };
  marketing: {
    summary: {
      month: string;
      mer: number;
      spend: number;
      revenue: number;
      estimatedRevenueLift90d: number;
    };
    rows: MarketingRow[];
    reallocation: {
      sourceCampaigns: string[];
      targetCampaigns: string[];
      shiftSpend: number;
      estimatedRevenueLift90d: number;
    };
  };
  support: {
    summary: {
      botResolved: number;
      humanResolved: number;
      botAvgMinutes: number;
      humanAvgMinutes: number;
    };
    rows: SupportRow[];
  };
  insights: {
    title: string;
    detail: string;
  }[];
  actions: {
    title: string;
    detail: string;
  }[];
  footer: {
    validator: string;
    generatedFrom: string;
  };
}
