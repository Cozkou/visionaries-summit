import { getCommerceAdapter } from "@/lib/commerce";
import { CommerceConfigError, CommerceRequestError } from "@/lib/commerce/types";
import {
  ConceptListing,
  DemandCounts,
  getDemandCounts,
  getListingByDesignId,
  updateListing,
} from "@/lib/db/listings-repository";

export interface ListingDemand {
  listing: ConceptListing;
  counts: DemandCounts;
}

/**
 * Fetches aggregated demand for a published design. Reads our own SQLite for
 * wishlist / pre-order / page-view counts, then opportunistically refreshes the
 * cached `woo_total_sales` from the live platform (best-effort — failures here
 * shouldn't break the staff view).
 */
export async function getListingDemandForDesign(
  designId: string,
  options: { skipRemoteSync?: boolean } = {}
): Promise<ListingDemand | null> {
  let listing = getListingByDesignId(designId);
  if (!listing) return null;

  if (!options.skipRemoteSync && listing.wooProductId) {
    try {
      const adapter = getCommerceAdapter();
      const remote = await adapter.getProduct(listing.wooProductId);
      if (remote) {
        const updated = updateListing(listing.id, {
          wooTotalSales: remote.totalSales,
          storefrontUrl: remote.permalink ?? listing.storefrontUrl,
        });
        if (updated) listing = updated;
      }
    } catch (error) {
      if (
        !(error instanceof CommerceConfigError) &&
        !(error instanceof CommerceRequestError)
      ) {
        console.error("[getListingDemandForDesign] remote sync", error);
      }
    }
  }

  return { listing, counts: getDemandCounts(listing.id) };
}
