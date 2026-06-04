import {
  formatGbp,
  getCategorySnapshot,
  getSupportedProductTypesForAudience,
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
  achievedPrice: number,
  fallbackNote?: string | null
): string {
  const rate = refundRatePercent(stat.unitsSold, stat.refundCount);
  const style = inputs.stylePrompt?.trim();
  const styleClause = style
    ? ` User brief (not in CSV): ${style}.`
    : "";
  const productCopy = stat.description?.trim()
    ? ` Product copy from products.csv: ${stat.description}`
    : "";
  const merchandising = [
    stat.collection ? `collection=${stat.collection}` : "",
    stat.vendor ? `vendor=${stat.vendor}` : "",
    stat.genderSegment ? `segment=${stat.genderSegment}` : "",
    stat.handle ? `handle=${stat.handle}` : "",
    stat.tags ? `tags=${stat.tags}` : "",
    stat.status ? `status=${stat.status}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const merchandisingClause = merchandising
    ? ` Merchandising fields: ${merchandising}.`
    : "";
  const fallbackClause = fallbackNote ? ` ${fallbackNote}` : "";
  return (
    `Derived from ${stat.title} (${stat.productId}) in products.csv: ` +
    `${formatGbp(stat.revenueGbp)} revenue, ${stat.unitsSold.toLocaleString()} units, ` +
    `${rate}% refund rate (refunds.csv + line_items.csv). ` +
    `Achieved unit price £${achievedPrice.toFixed(2)} (line_items.csv).` +
    fallbackClause +
    productCopy +
    merchandisingClause +
    styleClause
  );
}

function buildDesignName(stat: ProductSalesStat, inputs: GenerationInputs): string {
  const style = inputs.stylePrompt?.trim();
  if (!style) return stat.title;

  const cleaned = style.replace(/\s+/g, " ").trim();
  const label = cleaned.length > 32 ? `${cleaned.slice(0, 29)}...` : cleaned;
  return `${stat.title} — ${label}`;
}

/** One concept at a time, anchored to the strongest matching bestseller SKU. */
export function createDesignConcepts(
  inputs: GenerationInputs,
  snap = getCategorySnapshot(inputs)
): Design[] {
  const pool = snap.topProducts;
  if (pool.length === 0) {
    return [];
  }

  const stat = pool[0];
  const achievedPrice = productAchievedPrice(stat);
  const retailPrice = achievedPrice > 0 ? achievedPrice : snap.avgSellingPriceGbp;

  return [
    {
      id: crypto.randomUUID(),
      name: buildDesignName(stat, inputs),
      description: buildDescription(
        stat,
        inputs,
        retailPrice,
        snap.fallbackNote
      ),
      imageUrl: "",
      retailPrice,
      sourceProductId: stat.productId,
    },
  ];
}

export function buildNoMatchingProductsMessage(
  inputs: GenerationInputs
): string {
  const availableTypes = getSupportedProductTypesForAudience(inputs.targetAudience);
  const availableLabel =
    availableTypes.length > 0 ? availableTypes.join(", ") : "none";

  return (
    `No matching products in the data pack for ${inputs.targetAudience} ` +
    `${inputs.productType}. Available product types for ${inputs.targetAudience}: ` +
    `${availableLabel}.`
  );
}
