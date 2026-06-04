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

export function toPublicListing(listing: ConceptListing): PublicListing | null {
  const stored = getStoredDesign(listing.designId);
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
    counts: getDemandCounts(listing.id),
  };
}

export function listPublicListings(limit = 50): PublicListing[] {
  return listPublished(limit)
    .map(toPublicListing)
    .filter((l): l is PublicListing => l !== null);
}

export function getLatestPublicListing(): PublicListing | null {
  const latest = getLatestPublishedListing();
  if (!latest) return null;
  return toPublicListing(latest);
}
