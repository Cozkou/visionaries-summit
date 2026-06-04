import "server-only";

import { getProductSalesStat } from "@/lib/data/sales-analytics";
import type { Design, GenerationInputs, ProductType } from "@/types";

export interface StorefrontStory {
  /** Customer-friendly hero description (1-2 sentences, no SKU/CSV mentions). */
  description: string;
  /** Editorial bullet points shown under the description on the detail page. */
  highlights: string[];
}

const PRODUCT_BLURB: Record<ProductType, string> = {
  Hoodie: "Heavyweight fleece staple, built for the back end of the year.",
  "T-Shirt": "Everyday core layer with a relaxed, lived-in fit.",
  Jacket: "Outerwear statement piece. Limited run, no restock.",
  Trainers: "Footwear silhouette finished in our most-requested colourway.",
  Cap: "Headwear accessory cut from the same family as the main collection.",
};

const AUDIENCE_NOTE: Record<GenerationInputs["targetAudience"], string> = {
  Menswear: "Cut for menswear sizing.",
  Womenswear: "Cut for womenswear sizing.",
};

function formatGbpShort(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `£${Math.round(value / 1_000)}k`;
  return `£${Math.round(value)}`;
}

/**
 * Builds a customer-safe story for the storefront. We deliberately strip
 * SKU IDs and CSV references. The staff description is for the internal
 * tool, not the buying public.
 */
export function buildStorefrontStory(
  design: Design,
  inputs: GenerationInputs
): StorefrontStory {
  const source = design.sourceProductId
    ? getProductSalesStat(design.sourceProductId)
    : undefined;

  const lead =
    PRODUCT_BLURB[inputs.productType] ?? "A new addition to the Pretty Fly line.";

  const audience = AUDIENCE_NOTE[inputs.targetAudience];

  const highlights: string[] = [];

  if (source && source.unitsSold > 0) {
    highlights.push(
      `Built on a silhouette that moved ${source.unitsSold.toLocaleString()} units over the last 24 months. ${formatGbpShort(source.revenueGbp)} in proven demand.`
    );
  } else {
    highlights.push(
      `Scored against two years of Pretty Fly sales, returns and waitlist signals before reaching this page.`
    );
  }

  highlights.push(
    `Released early to the waitlist. Limited quantity, no restock once the public window closes.`
  );

  if (audience) highlights.push(audience);

  const description = source
    ? `${lead} Modelled on our top-performing ${inputs.productType.toLowerCase()} silhouette and only released because the numbers backed it.`
    : `${lead} Released only after clearing our commercial scoring on sales, refunds and waitlist demand.`;

  return { description, highlights: highlights.slice(0, 3) };
}
