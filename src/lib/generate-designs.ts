import {
  formatGbp,
  getCategorySnapshot,
  refundRatePercent,
  type ProductSalesStat,
} from "@/lib/data/sales-analytics";
import type { Design, GenerationInputs } from "@/types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function productAchievedPrice(stat: {
  revenueGbp: number;
  unitsSold: number;
}): number {
  if (stat.unitsSold <= 0) return 0;
  return round2(stat.revenueGbp / stat.unitsSold);
}

function buildDescription(
  stat: ProductSalesStat,
  inputs: GenerationInputs,
  achievedPrice: number
): string {
  const rate = refundRatePercent(stat.unitsSold, stat.refundCount);
  const style = inputs.stylePrompt?.trim();
  const styleClause = style
    ? ` User brief (not in CSV): ${style}.`
    : "";
  return (
    `Derived from ${stat.title} (${stat.productId}) in products.csv: ` +
    `${formatGbp(stat.revenueGbp)} revenue, ${stat.unitsSold.toLocaleString()} units, ` +
    `${rate}% refund rate (refunds.csv + line_items.csv). ` +
    `Achieved unit price £${achievedPrice.toFixed(2)} (line_items.csv).` +
    styleClause
  );
}

/** Up to six concepts — one per historical bestseller SKU (no duplicates, no LLM). */
export function createDesignConcepts(
  inputs: GenerationInputs,
  snap = getCategorySnapshot(inputs)
): Design[] {
  const pool = snap.topProducts;
  if (pool.length === 0) {
    return [];
  }

  return pool.map((stat) => {
    const achievedPrice = productAchievedPrice(stat);
    const retailPrice = achievedPrice > 0 ? achievedPrice : snap.avgSellingPriceGbp;

    return {
      id: crypto.randomUUID(),
      name: stat.title,
      description: buildDescription(stat, inputs, retailPrice),
      imageUrl: "",
      retailPrice,
      sourceProductId: stat.productId,
    };
  });
}
