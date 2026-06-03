import type { AnalysisData } from "@/types";

export const mockAnalysis: AnalysisData = {
  manufacturingCost: 18.4,
  recommendedRetailPrice: 95,
  profitPerUnit: 76.6,
  margin: 80,
  leadTimeDays: 42,
  historicalInsights: [
    "Similar hoodie launches generated £120k revenue.",
    "Refund rate was 7% lower than average.",
    "Neutral colourways historically outperform bright colours.",
  ],
  recommendation:
    "This concept closely matches Pretty Fly's highest-performing hoodie category. Based on historical sales and refund data, this design has strong commercial potential and healthy margins.",
};
