/**
 * Client-safe social proof copy for a listing.
 *
 * Lives in its own module (no fs/node imports) so it can be bundled into the
 * customer-facing client components (e.g. ListingActions) — the richer
 * `buildStorefrontStory` in `storefront-copy.ts` reads sales analytics from
 * disk and stays server-only.
 */

export interface SocialProofLine {
  text: string;
  isCold: boolean;
}

export function buildSocialProof(counts: {
  wishlistCount: number;
  preorderCount: number;
  pageViewsTotal: number;
}): SocialProofLine {
  const { wishlistCount, preorderCount, pageViewsTotal } = counts;

  if (preorderCount > 0 && wishlistCount > 0) {
    return {
      text: `${wishlistCount.toLocaleString()} on the waitlist · ${preorderCount.toLocaleString()} reserved`,
      isCold: false,
    };
  }
  if (preorderCount > 0) {
    return {
      text: `${preorderCount.toLocaleString()} reserved so far`,
      isCold: false,
    };
  }
  if (wishlistCount > 0) {
    return {
      text: `${wishlistCount.toLocaleString()} on the waitlist`,
      isCold: false,
    };
  }
  if (pageViewsTotal > 5) {
    return {
      text: `${pageViewsTotal.toLocaleString()} have viewed this concept`,
      isCold: true,
    };
  }
  return { text: "Be the first to back this drop", isCold: true };
}
