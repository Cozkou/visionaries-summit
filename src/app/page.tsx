import { Storefront } from "@/components/store/storefront";
import { getLatestPublicListing } from "@/lib/public-listings";
import { getFeaturedEarlyRelease } from "@/lib/store/catalog";

// We hit the DB on every render to pick up newly-published concepts without
// requiring a redeploy or manual revalidation.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = getFeaturedEarlyRelease();
  const latestPublished = await getLatestPublicListing();
  return <Storefront featured={featured} latestPublished={latestPublished} />;
}
