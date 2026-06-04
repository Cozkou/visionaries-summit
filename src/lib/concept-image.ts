import fs from "fs";
import path from "path";

import OpenAI from "openai";

import { buildSingleProductPrompt } from "@/lib/ai/design-direction";
import { getStoredDesign, updateDesignImageUrl } from "@/lib/db/designs-repository";
import {
  getListingByDesignId,
  updateListing,
} from "@/lib/db/listings-repository";
import {
  getImageApiBaseUrl,
  getImageApiKey,
  getImageModel,
  isImageGenerationConfigured,
} from "@/lib/env";
import type { GenerationInputs } from "@/types";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

function ensureGeneratedDir() {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildImagePrompt(
  name: string,
  productType: GenerationInputs["productType"],
  inputs: GenerationInputs
): string {
  return buildSingleProductPrompt(name, { ...inputs, productType }, {
    intro:
      `Editorial e-commerce product photo for Pretty Fly streetwear: ${name}, ` +
      `exactly one ${productType === "T-Shirt" ? "T-shirt" : productType === "Trainers" ? "pair of trainers" : productType.toLowerCase()} for ${inputs.targetAudience.toLowerCase()}.`,
  });
}

function writeSvgPlaceholder(
  designId: string,
  name: string,
  productType: string
): string {
  ensureGeneratedDir();
  const fileName = `${designId}.svg`;
  const filePath = path.join(GENERATED_DIR, fileName);
  const safeName = escapeXml(name);
  const safeType = escapeXml(productType.toUpperCase());

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280" viewBox="0 0 1024 1280">
  <rect width="100%" height="100%" fill="#f7f6f3"/>
  <rect x="64" y="64" width="896" height="1152" fill="#f0eee8" stroke="#d4d1c8" stroke-width="2"/>
  <text x="96" y="1180" font-family="system-ui, sans-serif" font-size="28" letter-spacing="0.35em" fill="#94a3b8">PRETTY FLY</text>
  <text x="96" y="200" font-family="system-ui, sans-serif" font-size="22" letter-spacing="0.28em" fill="#64748b">${safeType}</text>
  <text x="96" y="280" font-family="system-ui, sans-serif" font-size="56" font-weight="700" fill="#0f172a">${safeName}</text>
</svg>`;

  fs.writeFileSync(filePath, svg, "utf8");
  return `/generated/${fileName}`;
}

async function writeAiImage(
  designId: string,
  prompt: string
): Promise<string | null> {
  const apiKey = getImageApiKey();
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey, baseURL: getImageApiBaseUrl() });
  const response = await client.images.generate({
    model: getImageModel(),
    prompt,
    size: "1024x1024",
    response_format: "b64_json",
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) return null;

  ensureGeneratedDir();
  const fileName = `${designId}.png`;
  const filePath = path.join(GENERATED_DIR, fileName);
  fs.writeFileSync(filePath, Buffer.from(b64, "base64"));
  return `/generated/${fileName}`;
}

async function syncListingImage(designId: string, imageUrl: string) {
  const listing = await getListingByDesignId(designId);
  if (!listing || listing.status === "archived") return;
  await updateListing(listing.id, { imageUrl });
}

/**
 * Creates or refreshes concept imagery for a design, persists the public URL on the
 * design row, and mirrors it onto any active listing so the storefront latest drop
 * can render it.
 */
export async function ensureConceptImage(designId: string): Promise<string | null> {
  const stored = await getStoredDesign(designId);
  if (!stored) return null;

  const existingImageUrl = stored.design.imageUrl?.trim();
  if (existingImageUrl) {
    await syncListingImage(designId, existingImageUrl);
    return existingImageUrl;
  }

  const { design, inputs } = stored;
  const prompt = buildImagePrompt(design.name, inputs.productType, inputs);

  let publicUrl: string | null = null;

  if (isImageGenerationConfigured()) {
    try {
      publicUrl = await writeAiImage(designId, prompt);
    } catch (error) {
      console.error("[ensureConceptImage] AI image failed", designId, error);
    }
  }

  if (!publicUrl) {
    publicUrl = writeSvgPlaceholder(designId, design.name, inputs.productType);
  }

  await updateDesignImageUrl(designId, publicUrl);
  await syncListingImage(designId, publicUrl);

  return publicUrl;
}

export async function ensureConceptImagesForDesigns(
  designIds: string[]
): Promise<void> {
  for (const id of designIds) {
    try {
      await ensureConceptImage(id);
    } catch (error) {
      console.error("[ensureConceptImagesForDesigns]", id, error);
    }
  }
}
