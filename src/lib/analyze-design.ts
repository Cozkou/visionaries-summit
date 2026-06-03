import {
  buildDataDrivenInsights,
  formatGbp,
  getCategorySnapshot,
  getSimilarProducts,
} from "@/lib/data/sales-analytics";
import {
  ILLUSTRATIVE_IMAGE_SOURCE,
  PRETTY_FLY_DATA_SOURCES,
} from "@/lib/data/data-sources";
import type { StoredDesign } from "@/lib/db/designs-repository";
import type { AnalysisData } from "@/types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function refundRateForProduct(units: number, refunds: number): number {
  if (units <= 0) return 0;
  return Math.round((refunds / units) * 1000) / 10;
}

function buildRecommendation(
  stored: StoredDesign,
  snap: ReturnType<typeof getCategorySnapshot>,
  margin: number
): { text: string; sourceIds: string[] } {
  const { inputs, design } = stored;
  const top = snap.topProducts[0];

  const text = top
    ? `${design.name} sits in ${inputs.productType} (${inputs.targetAudience}) where "${top.title}" generated ${formatGbp(top.revenueGbp)} at ${refundRateForProduct(top.unitsSold, top.refundCount)}% refunds. Category margin from real PO costs is ${margin}%. ${inputs.businessGoal === "Low Refund Risk" ? "Prioritise if refund rate stays at or below the " + snap.refundRiskPercent + "% category baseline." : "Proceed to PO only if forecast volume matches top-quartile sellers."}`
    : `${design.name} targets ${inputs.productType} for ${inputs.targetAudience}. Insufficient historical SKUs in the data pack for this segment — treat metrics as directional only.`;

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
  const { inputs } = stored;
  const snap = getCategorySnapshot(inputs);

  const recommendedRetailPrice = round2(snap.avgSellingPriceGbp);
  const manufacturingCost = round2(snap.avgLandedCostGbp);
  const profitPerUnit = round2(recommendedRetailPrice - manufacturingCost);
  const margin =
    recommendedRetailPrice > 0
      ? round2((profitPerUnit / recommendedRetailPrice) * 100)
      : 0;

  const rec = buildRecommendation(stored, snap, margin);

  const similarProducts = getSimilarProducts(inputs, 4).map((p) => ({
    productId: p.productId,
    title: p.title,
    revenueGbp: Math.round(p.revenueGbp),
    unitsSold: p.unitsSold,
    refundRatePercent: refundRateForProduct(p.unitsSold, p.refundCount),
    sourceIds: ["line_items", "products", "refunds"],
  }));

  const historicalInsights = buildDataDrivenInsights(inputs);

  const metrics = [
    {
      label: "Manufacturing Cost (avg landed)",
      value: `£${manufacturingCost.toFixed(2)}`,
      sourceIds: ["po_line_items", "purchase_orders"],
      detail: "Weighted avg landed_cost_per_unit_gbp for category SKUs",
    },
    {
      label: "Historical Avg Retail",
      value: `£${recommendedRetailPrice.toFixed(2)}`,
      sourceIds: ["line_items"],
      detail: "Total line revenue ÷ units sold",
    },
    {
      label: "Profit Per Unit",
      value: `£${profitPerUnit.toFixed(2)}`,
      sourceIds: ["line_items", "po_line_items"],
      detail: "Avg retail minus avg landed cost",
    },
    {
      label: "Margin",
      value: `${margin}%`,
      sourceIds: ["line_items", "po_line_items"],
      detail: "Derived from dataset averages",
    },
    {
      label: "Category Refund Rate",
      value: `${snap.refundRiskPercent}%`,
      sourceIds: ["refunds", "line_items"],
      detail: "Refund events ÷ units sold in category",
    },
    {
      label: "Supplier Lead Time",
      value: `${snap.avgLeadTimeDays} Days`,
      sourceIds: ["suppliers", "purchase_orders", "po_line_items"],
      detail: "Qty-weighted lead_time_days from suppliers.csv",
    },
  ];

  return {
    manufacturingCost,
    recommendedRetailPrice,
    profitPerUnit,
    margin,
    leadTimeDays: snap.avgLeadTimeDays,
    refundRiskPercent: snap.refundRiskPercent,
    metrics,
    historicalInsights,
    similarProducts,
    dataSources: [...PRETTY_FLY_DATA_SOURCES, ILLUSTRATIVE_IMAGE_SOURCE],
    recommendation: rec.text,
    recommendationSourceIds: rec.sourceIds,
  };
}

export async function analyzeDesign(stored: StoredDesign): Promise<AnalysisData> {
  return computeAnalysis(stored);
}
