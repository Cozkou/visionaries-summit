import { getStoredDesign } from "@/lib/db/designs-repository";
import {
  ConceptListing,
  DemandCounts,
  getDemandCounts,
  getLatestPublishedListing,
  listPublished,
} from "@/lib/db/listings-repository";
import { buildStorefrontStory } from "@/lib/storefront-copy";
import type { ProductType, TargetAudience } from "@/types";

export interface PublicListing {
  slug: string;
  designId: string;
  name: string;
  /** Customer-friendly description (CSV / SKU mentions stripped). */
  description: string;
  /** Internal staff description, kept available for diagnostics. */
  staffDescription: string;
  highlights: string[];
  productType: ProductType;
  targetAudience: TargetAudience;
  imageUrl: string;
  retailPrice: number;
  storefrontUrl: string | null;
  status: ConceptListing["status"];
  publishedAt: number;
  /** Epoch ms — when the early-access window closes. */
  releaseAt: number | null;
  counts: DemandCounts;
}

export async function toPublicListing(
  listing: ConceptListing
): Promise<PublicListing | null> {
  const stored = await getStoredDesign(listing.designId);
  if (!stored) return null;
  const story = buildStorefrontStory(stored.design, stored.inputs);
  return {
    slug: listing.slug,
    designId: listing.designId,
    name: stored.design.name,
    description: story.description,
    staffDescription: stored.design.description,
    highlights: story.highlights,
    productType: stored.inputs.productType,
    targetAudience: stored.inputs.targetAudience,
    imageUrl: listing.imageUrl ?? stored.design.imageUrl ?? "",
    retailPrice: stored.design.retailPrice,
    storefrontUrl: listing.storefrontUrl,
    status: listing.status,
    publishedAt: listing.publishedAt,
    releaseAt: listing.releaseAt,
    counts: await getDemandCounts(listing.id),
  };
}

export async function listPublicListings(
  limit = 50
): Promise<PublicListing[]> {
  const listings = await listPublished(limit);
  const results = await Promise.all(listings.map(toPublicListing));
  return results.filter((l): l is PublicListing => l !== null);
}

export async function getLatestPublicListing(): Promise<PublicListing | null> {
  const latest = await getLatestPublishedListing();
  if (!latest) return null;
  return toPublicListing(latest);
}
