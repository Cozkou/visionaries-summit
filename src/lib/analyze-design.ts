import {
  buildDataDrivenInsights,
  formatGbp,
  getCategorySnapshot,
  getProductSalesStat,
  getSimilarProducts,
  refundRatePercent,
} from "@/lib/data/sales-analytics";
import { PRETTY_FLY_DATA_SOURCES } from "@/lib/data/data-sources";
import type { StoredDesign } from "@/lib/db/designs-repository";
import type { AnalysisData } from "@/types";

type ProductWithCost = ReturnType<typeof getProductSalesStat> & {
  landedCostGbp?: number;
  leadTimeDays?: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function refundRateForProduct(units: number, refunds: number): number {
  return refundRatePercent(units, refunds);
}

function productRetail(stat: ProductWithCost): number {
  if (!stat || stat.unitsSold <= 0) return 0;
  return round2(stat.revenueGbp / stat.unitsSold);
}

function buildRecommendation(
  stored: StoredDesign,
  snap: ReturnType<typeof getCategorySnapshot>,
  margin: number,
  source: ProductWithCost | undefined
): { text: string; sourceIds: string[] } {
  const { inputs, design } = stored;
  const focus = source ?? snap.topProducts[0];

  if (!focus) {
    return {
      text: `${design.name} targets ${inputs.productType} for ${inputs.targetAudience}. No matching SKUs in the data pack for this segment.`,
      sourceIds: ["products", "line_items"],
    };
  }

  const retail = productRetail(focus);
  const text =
    `${design.name} is based on ${focus.title} (${focus.productId}): ` +
    `${formatGbp(focus.revenueGbp)} revenue, ${focus.unitsSold.toLocaleString()} units, ` +
    `${refundRateForProduct(focus.unitsSold, focus.refundCount)}% refunds (line_items.csv + refunds.csv). ` +
    `Achieved price £${retail}; category avg landed cost £${snap.avgLandedCostGbp} (po_line_items.csv). ` +
    `Margin at achieved price vs category landed cost: ${margin}%. ` +
    (inputs.businessGoal === "Low Refund Risk"
      ? `Category baseline refund rate is ${snap.refundRiskPercent}%.`
      : `Supplier lead time for category: ${snap.avgLeadTimeDays} days (suppliers.csv).`);

  return {
    text,
    sourceIds: [
      "line_items",
      "products",
      "refunds",
      "po_line_items",
      "suppliers",
    ],
  };
}

function computeAnalysis(stored: StoredDesign): AnalysisData {
  const { inputs, design } = stored;
  const snap = getCategorySnapshot(inputs);
  const source = design.sourceProductId
    ? (getProductSalesStat(design.sourceProductId) as ProductWithCost | undefined)
    : undefined;

  const recommendedRetailPrice = source
    ? productRetail(source) || round2(snap.avgSellingPriceGbp)
    : round2(snap.avgSellingPriceGbp);

  const manufacturingCost = source?.landedCostGbp
    ? round2(source.landedCostGbp)
    : round2(snap.avgLandedCostGbp);

  const leadTimeDays =
    source?.leadTimeDays && source.leadTimeDays > 0
      ? source.leadTimeDays
      : snap.avgLeadTimeDays;

  const profitPerUnit = round2(recommendedRetailPrice - manufacturingCost);
  const margin =
    recommendedRetailPrice > 0
      ? round2((profitPerUnit / recommendedRetailPrice) * 100)
      : 0;

  const refundRiskPercent = source
    ? refundRateForProduct(source.unitsSold, source.refundCount)
    : snap.refundRiskPercent;

  const rec = buildRecommendation(stored, snap, margin, source);

  const similarProducts = getSimilarProducts(inputs, 4).map((p) => ({
    productId: p.productId,
    title: p.title,
    revenueGbp: Math.round(p.revenueGbp),
    unitsSold: p.unitsSold,
    refundRatePercent: refundRateForProduct(p.unitsSold, p.refundCount),
    sourceIds: ["line_items", "products", "refunds"],
  }));

  const historicalInsights = buildDataDrivenInsights(inputs);

  const skuLabel = source
    ? `${source.title} (${source.productId})`
    : "category average";

  const metrics = [
    {
      label: source ? "Landed cost (this SKU)" : "Manufacturing Cost (avg landed)",
      value: `£${manufacturingCost.toFixed(2)}`,
      sourceIds: ["po_line_items", "purchase_orders"] as const,
      detail: source
        ? `landed_cost_per_unit_gbp for variants of ${source.productId}`
        : "Weighted avg landed_cost_per_unit_gbp for category SKUs",
    },
    {
      label: source ? "Achieved retail (this SKU)" : "Historical Avg Retail",
      value: `£${recommendedRetailPrice.toFixed(2)}`,
      sourceIds: ["line_items"] as const,
      detail: source
        ? "Line revenue ÷ units for this product_id"
        : "Total line revenue ÷ units sold in category",
    },
    {
      label: "Profit Per Unit",
      value: `£${profitPerUnit.toFixed(2)}`,
      sourceIds: ["line_items", "po_line_items"] as const,
      detail: `Achieved retail minus landed cost (${skuLabel})`,
    },
    {
      label: "Margin",
      value: `${margin}%`,
      sourceIds: ["line_items", "po_line_items"] as const,
      detail: "Derived from CSV figures above",
    },
    {
      label: source ? "SKU Refund Rate" : "Category Refund Rate",
      value: `${refundRiskPercent}%`,
      sourceIds: ["refunds", "line_items"] as const,
      detail: source
        ? "Refund events ÷ units for this product_id"
        : "Refund events ÷ units sold in category",
    },
    {
      label: "Supplier Lead Time",
      value: `${leadTimeDays} Days`,
      sourceIds: ["suppliers", "purchase_orders", "po_line_items"] as const,
      detail: source?.leadTimeDays
        ? "Qty-weighted lead_time_days for this SKU's POs"
        : "Qty-weighted lead_time_days from suppliers.csv",
    },
  ];

  return {
    manufacturingCost,
    recommendedRetailPrice,
    profitPerUnit,
    margin,
    leadTimeDays,
    refundRiskPercent,
    metrics: metrics.map((m) => ({
      ...m,
      sourceIds: [...m.sourceIds],
    })),
    historicalInsights,
    similarProducts,
    dataSources: [...PRETTY_FLY_DATA_SOURCES],
    recommendation: rec.text,
    recommendationSourceIds: rec.sourceIds,
  };
}

export async function analyzeDesign(stored: StoredDesign): Promise<AnalysisData> {
  return computeAnalysis(stored);
}
