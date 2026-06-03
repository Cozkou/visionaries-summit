import { getCategorySnapshot } from "@/lib/data/sales-analytics";
import type { Design, GenerationInputs } from "@/types";

const conceptThemes = [
  { suffix: "Heritage", angle: "archive-inspired detailing and tonal branding" },
  { suffix: "Street", angle: "bold graphics and high-contrast paneling" },
  { suffix: "Essential", angle: "clean lines and minimal branding for daily wear" },
  { suffix: "Premium", angle: "elevated materials and refined finishing" },
  { suffix: "Utility", angle: "functional pockets and durable construction" },
  { suffix: "Vintage", angle: "washed finishes and retro-inspired palette" },
];

function audienceLabel(audience: GenerationInputs["targetAudience"]): string {
  return audience === "Menswear" ? "men's" : "women's";
}

function buildDescription(
  inputs: GenerationInputs,
  theme: (typeof conceptThemes)[number],
  topSeller?: { title: string; productId: string; unitsSold: number }
): string {
  const audience = audienceLabel(inputs.targetAudience);
  const style = inputs.stylePrompt?.trim();
  const styleClause = style ? ` Styled for: ${style}.` : "";
  const sellerClause = topSeller
    ? ` Extends bestseller "${topSeller.title}" (${topSeller.productId}) — ${topSeller.unitsSold.toLocaleString()} units in line_items.csv.`
    : "";
  return `${inputs.productType} concept for ${audience} with ${theme.angle}, aligned to ${inputs.businessGoal.toLowerCase()}.${styleClause}${sellerClause}`;
}

export function createDesignConcepts(
  inputs: GenerationInputs,
  snap = getCategorySnapshot(inputs)
): Design[] {
  const retailPrice = Math.round(
    snap.dataDrivenPriceGbp || snap.avgSellingPriceGbp || 80
  );

  return conceptThemes.map((theme, index) => {
    const topSeller = snap.topProducts[index % Math.max(snap.topProducts.length, 1)];
    return {
      id: crypto.randomUUID(),
      name: `${theme.suffix} ${inputs.productType}`,
      description: buildDescription(inputs, theme, topSeller),
      imageUrl: "",
      retailPrice,
    };
  });
}
