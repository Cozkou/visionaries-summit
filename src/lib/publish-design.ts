import { getCommerceAdapter } from "@/lib/commerce";
import {
  CommerceConfigError,
  CommerceRequestError,
} from "@/lib/commerce/types";
import { absoluteImageUrl, placeholderImageFor } from "@/lib/commerce/placeholder-image";
import { getStoredDesign } from "@/lib/db/designs-repository";
import {
  ConceptListing,
  generateUniqueSlug,
  getListingByDesignId,
  insertListing,
  updateListing,
} from "@/lib/db/listings-repository";

export type PublishResult =
  | { ok: true; listing: ConceptListing; reused: boolean }
  | { ok: false; status: number; error: string };

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

export async function publishDesign(
  designId: string,
  options: { publishedBy?: string | null; acceptingPreorders?: boolean } = {}
): Promise<PublishResult> {
  const stored = getStoredDesign(designId);
  if (!stored) {
    return { ok: false, status: 404, error: "Design not found" };
  }

  const existing = getListingByDesignId(designId);
  if (existing && existing.status !== "archived") {
    return { ok: true, listing: existing, reused: true };
  }

  const imageUrl = stored.design.imageUrl?.trim()
    ? stored.design.imageUrl
    : placeholderImageFor(stored.inputs.productType);

  const adapter = getCommerceAdapter();

  try {
    const remoteProduct = await adapter.createDraftProduct({
      designId,
      name: stored.design.name,
      description: stored.design.description,
      regularPriceGbp: stored.design.retailPrice,
      imageUrls: [absoluteImageUrl(imageUrl)],
      sizes: DEFAULT_SIZES,
      acceptingPreorders: options.acceptingPreorders ?? true,
    });

    if (existing) {
      const updated = updateListing(existing.id, {
        wooProductId: remoteProduct.id,
        status: "coming_soon",
        storefrontUrl: remoteProduct.permalink ?? null,
        imageUrl,
      });
      return { ok: true, listing: updated ?? existing, reused: false };
    }

    const slug = generateUniqueSlug(stored.design.name);
    const listing = insertListing({
      designId,
      wooProductId: remoteProduct.id,
      slug,
      status: "coming_soon",
      imageUrl,
      storefrontUrl: remoteProduct.permalink ?? null,
      publishedBy: options.publishedBy ?? null,
    });
    return { ok: true, listing, reused: false };
  } catch (error) {
    if (error instanceof CommerceConfigError) {
      return { ok: false, status: 503, error: error.message };
    }
    if (error instanceof CommerceRequestError) {
      return {
        ok: false,
        status: 502,
        error: `Commerce platform error: ${error.message}`,
      };
    }
    console.error("[publishDesign]", error);
    return { ok: false, status: 500, error: "Failed to publish design" };
  }
}

export async function unpublishDesign(
  designId: string
): Promise<PublishResult> {
  const listing = getListingByDesignId(designId);
  if (!listing) {
    return { ok: false, status: 404, error: "Listing not found" };
  }

  if (listing.wooProductId) {
    try {
      const adapter = getCommerceAdapter();
      await adapter.updateProductStatus(listing.wooProductId, "draft");
    } catch (error) {
      console.error("[unpublishDesign]", error);
    }
  }

  const updated = updateListing(listing.id, { status: "archived" });
  return { ok: true, listing: updated ?? listing, reused: false };
}
