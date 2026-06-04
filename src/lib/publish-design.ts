import { getCommerceAdapter, isCommerceConfigured } from "@/lib/commerce";
import {
  CommerceConfigError,
  CommerceRequestError,
} from "@/lib/commerce/types";
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
  const stored = await getStoredDesign(designId);
  if (!stored) {
    return { ok: false, status: 404, error: "Design not found" };
  }

  const existing = await getListingByDesignId(designId);
  if (existing && existing.status !== "archived") {
    return { ok: true, listing: existing, reused: true };
  }

  const imageUrl = stored.design.imageUrl?.trim() || "";

  if (!isCommerceConfigured()) {
    const slug = existing?.slug ?? (await generateUniqueSlug(stored.design.name));
    const storefrontUrl = `/early-releases/${slug}`;

    if (existing) {
      const updated = await updateListing(existing.id, {
        status: "coming_soon",
        imageUrl: imageUrl || null,
        storefrontUrl,
      });
      return { ok: true, listing: updated ?? existing, reused: false };
    }

    const listing = await insertListing({
      designId,
      wooProductId: null,
      slug,
      status: "coming_soon",
      imageUrl: imageUrl || null,
      storefrontUrl,
      publishedBy: options.publishedBy ?? null,
    });
    return { ok: true, listing, reused: false };
  }

  const adapter = getCommerceAdapter();

  try {
    const remoteProduct = await adapter.createDraftProduct({
      designId,
      name: stored.design.name,
      description: stored.design.description,
      regularPriceGbp: stored.design.retailPrice,
      imageUrls: imageUrl ? [imageUrl] : [],
      sizes: DEFAULT_SIZES,
      acceptingPreorders: options.acceptingPreorders ?? true,
    });

    if (existing) {
      const updated = await updateListing(existing.id, {
        wooProductId: remoteProduct.id,
        status: "coming_soon",
        storefrontUrl: remoteProduct.permalink ?? null,
        imageUrl: imageUrl || null,
      });
      return { ok: true, listing: updated ?? existing, reused: false };
    }

    const slug = await generateUniqueSlug(stored.design.name);
    const listing = await insertListing({
      designId,
      wooProductId: remoteProduct.id,
      slug,
      status: "coming_soon",
      imageUrl: imageUrl || null,
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
  const listing = await getListingByDesignId(designId);
  if (!listing) {
    return { ok: false, status: 404, error: "Listing not found" };
  }

  if (listing.wooProductId && isCommerceConfigured()) {
    try {
      const adapter = getCommerceAdapter();
      await adapter.updateProductStatus(listing.wooProductId, "draft");
    } catch (error) {
      console.error("[unpublishDesign]", error);
    }
  }

  const updated = await updateListing(listing.id, { status: "archived" });
  return { ok: true, listing: updated ?? listing, reused: false };
}
