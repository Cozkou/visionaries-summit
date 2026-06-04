import type { GenerationInputs } from "@/types";

function productPromptLabel(productType: GenerationInputs["productType"]): string {
  switch (productType) {
    case "T-Shirt":
      return "T-shirt";
    case "Trainers":
      return "pair of trainers";
    default:
      return productType.toLowerCase();
  }
}

function productDetailClause(productType: GenerationInputs["productType"]): string {
  switch (productType) {
    case "Hoodie":
      return "Render a standalone hoodie only, with the hood, body, sleeves, cuffs, and hem clearly readable. No layered shirt underneath and no matching joggers.";
    case "T-Shirt":
      return "Render a standalone short-sleeve crew-neck T-shirt only. No layered overshirt, no jacket, and no folded stack of extra tees.";
    case "Jacket":
      return "Render a standalone jacket only, with the outerwear shape, closure, collar, and sleeve construction clearly visible. No inner outfit styling.";
    case "Trainers":
      return "Render exactly one matched pair of trainers only, shown as one product. No extra footwear, no shoebox, and no alternate pair.";
    case "Cap":
      return "Render exactly one cap only, with the crown, brim, and front panel clearly visible. No second cap and no accompanying accessories.";
  }
}

function audienceDetailClause(
  targetAudience: GenerationInputs["targetAudience"]
): string {
  return targetAudience === "Menswear"
    ? "Fit and proportions should read clearly as menswear: broader block, straighter cut, and masculine styling cues."
    : "Fit and proportions should read clearly as womenswear: refined shaping, slimmer scale, and feminine styling cues.";
}

function businessGoalClause(
  businessGoal: GenerationInputs["businessGoal"]
): string {
  switch (businessGoal) {
    case "Maximize Revenue":
      return "Prioritize broad commercial appeal, trend relevance, premium finish, and strong storefront click-through.";
    case "Maximize Margin":
      return "Prioritize margin-friendly simplicity: cleaner construction, fewer unnecessary embellishments, and an efficient premium look.";
    case "Low Refund Risk":
      return "Prioritize refund-risk reduction: accurate silhouette, obvious construction details, realistic proportions, and zero visual ambiguity.";
  }
}

function streetwearFoundationClause(
  inputs: GenerationInputs
): string {
  const audienceLabel =
    inputs.targetAudience === "Menswear" ? "mens streetwear" : "womens streetwear";

  return [
    `The overall aesthetic must read unmistakably as premium ${audienceLabel}.`,
    "Lean into modern streetwear codes: bold but controlled color stories, graphic confidence, utility-informed detailing, youthful energy, and fashion-forward silhouette decisions.",
    "The product should feel like it belongs in a contemporary streetwear drop, not classic tailoring, generic sportswear, quiet luxury basics, formalwear, or plain catalog blanks.",
  ].join(" ");
}

function defaultDesignDirection(
  inputs: GenerationInputs
): string {
  switch (inputs.productType) {
    case "Hoodie":
      return "Build in visible design interest with a refined two-tone palette, bold chest or sleeve graphics, contrast drawcords or stitch accents, dropped-shoulder energy, and clean geometric panel blocking that feels street-led.";
    case "T-Shirt":
      return "Build in visible design interest with a strong base color, one or two complementary accent colors, a front or back graphic statement, geometric placement, and premium print, applique, or embroidery detailing that feels streetwear-native.";
    case "Jacket":
      return "Build in visible design interest with panel blocking, contrast trim, tonal pocket or seam details, utility cues, and a premium mix of shapes that makes the outerwear feel intentional, urban, and fashion-led.";
    case "Trainers":
      return "Build in visible design interest with layered color blocking, contrast panels, shaped overlays, standout sole detailing, and a premium urban palette that feels like a streetwear sneaker release.";
    case "Cap":
      return "Build in visible design interest with a clear palette, front-panel graphic or embroidery idea, contrast brim or stitch accents, and simple geometric detailing that reads like a streetwear accessory.";
  }
}

function businessGoalDesignBias(
  businessGoal: GenerationInputs["businessGoal"]
): string {
  switch (businessGoal) {
    case "Maximize Revenue":
      return "The final design should feel exciting and premium, with enough color, graphics, or shape language to stand out instantly in a storefront grid.";
    case "Maximize Margin":
      return "Use a restrained but still noticeable design system: fewer elements, but make the palette, placement, and shape details feel deliberate rather than plain.";
    case "Low Refund Risk":
      return "Keep the design attractive but grounded in realistic garment construction so the decorative details look manufacturable and easy to understand.";
  }
}

function styleDirectionClause(stylePrompt?: string): string {
  const style = stylePrompt?.trim();
  return style
    ? `Apply every style note literally where compatible with the selected product: ${style}. Preserve these details in color, mood, fabric, trim, silhouette, graphic placement, and surface design, but keep the outcome firmly within premium streetwear.`
    : "No extra style note was supplied, so invent a tasteful commercially strong premium streetwear direction yourself instead of leaving the product plain.";
}

function designEnrichmentClause(inputs: GenerationInputs): string {
  return [
    streetwearFoundationClause(inputs),
    defaultDesignDirection(inputs),
    businessGoalDesignBias(inputs.businessGoal),
    "The product must look designed, not blank: use color blocking, shapes, graphics, embroidery, prints, contrast stitching, panel lines, trim accents, or material contrast where appropriate.",
    "Keep the design premium and wearable. Avoid chaotic all-over noise, but do not return a plain undecorated basic item.",
    "If there is any ambiguity, resolve it toward streetwear rather than minimal basics.",
  ].join(" ");
}

export function buildSingleProductPrompt(
  designDescription: string,
  inputs: GenerationInputs,
  options?: { intro?: string }
): string {
  const productLabel = productPromptLabel(inputs.productType);
  const intro =
    options?.intro ??
    `Create a premium ecommerce hero image for exactly one ${productLabel} for ${inputs.targetAudience.toLowerCase()}.`;

  return [
    intro,
    `The frame must contain one ${productLabel} only: one item for apparel, or one matched pair for trainers.`,
    productDetailClause(inputs.productType),
    audienceDetailClause(inputs.targetAudience),
    businessGoalClause(inputs.businessGoal),
    designEnrichmentClause(inputs),
    `Center the single ${productLabel}, fill most of the frame with it, and present it as a clean standalone product shot for a modern fashion storefront.`,
    "Use clean studio lighting, realistic fabric texture, crisp edges, and a plain minimal background.",
    "Do not show multiple products, duplicate items, alternate colorways, bundles, outfits, layered garments, props, packaging, or any second product in the background.",
    "Do not include text, logos, watermarks, brand names, hands, mannequins, hangers, model faces, inset thumbnails, or editorial collage layouts.",
    `Historical anchor: ${designDescription}`,
    styleDirectionClause(inputs.stylePrompt),
  ]
    .filter(Boolean)
    .join(" ");
}
