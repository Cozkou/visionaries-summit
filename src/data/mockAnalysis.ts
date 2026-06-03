import type { AnalysisData } from "@/types";

export const mockAnalysis: AnalysisData = {
  manufacturingCost: 52.25,
  recommendedRetailPrice: 95,
  profitPerUnit: 42.75,
  margin: 45,
  leadTimeDays: 60,
  refundRiskPercent: 13,
  metrics: [],
  historicalInsights: [
    {
      text: "Example insight from line_items.csv and products.csv.",
      sourceIds: ["line_items", "products"],
    },
  ],
  similarProducts: [
    {
      productId: "prod_00010",
      title: "Heavyweight Hoodie",
      revenueGbp: 238277,
      unitsSold: 1699,
      refundRatePercent: 13.1,
      sourceIds: ["line_items", "products", "refunds"],
    },
  ],
  dataSources: [],
  recommendation:
    "Example recommendation grounded in hackathon CSV data.",
  recommendationSourceIds: ["line_items", "po_line_items"],
};
