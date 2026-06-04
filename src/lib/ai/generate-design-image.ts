import { getOpenAiImageClient } from "@/lib/ai/client";
import { getOpenAiImageModel } from "@/lib/env";
import type { Design, GenerationInputs } from "@/types";

type ImageResponseShape =
  | {
      data?: Array<{ b64_json?: string; url?: string }>;
      error?: { message?: string };
    }
  | string;

function buildPrompt(design: Design, inputs: GenerationInputs): string {
  const style = inputs.stylePrompt?.trim();
  const styleClause = style ? `Style direction: ${style}.` : "";

  return [
    `Create a single premium ecommerce hero image for a ${inputs.targetAudience.toLowerCase()} ${inputs.productType.toLowerCase()}.`,
    "Show one original apparel product only, centered, highly detailed, and ready for a modern fashion storefront.",
    "Use clean studio lighting, realistic fabric texture, and a simple background that keeps the product as the main focus.",
    "Do not include text, logos, watermarks, brand names, extra products, hands, mannequins, or model faces.",
    `Commercial goal: ${inputs.businessGoal}.`,
    `Historical anchor: ${design.description}`,
    styleClause,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function generateDesignImage(
  design: Design,
  inputs: GenerationInputs
): Promise<string> {
  const client = getOpenAiImageClient();
  if (!client) {
    throw new Error(
      "Image generation is not configured. Set IMAGEROUTER_API_KEY or OPENAI_API_KEY."
    );
  }

  const prompt = buildPrompt(design, inputs);
  const rawResponse = (await client.images.generate({
    model: getOpenAiImageModel(),
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
    output_format: "png",
    background: "opaque",
  })) as ImageResponseShape;

  const response =
    typeof rawResponse === "string"
      ? (JSON.parse(rawResponse) as Exclude<ImageResponseShape, string>)
      : rawResponse;

  const providerError = response.error?.message?.trim();
  if (providerError) {
    throw new Error(providerError);
  }

  const image = response.data?.[0];
  const b64 = image?.b64_json;
  if (b64) {
    return `data:image/png;base64,${b64}`;
  }

  const imageUrl = image?.url?.trim();
  if (imageUrl) {
    return imageUrl;
  }

  throw new Error("Image generation returned neither base64 data nor a URL.");
}
