import { Storefront } from "@/components/store/storefront";
import { getFeaturedEarlyRelease } from "@/lib/store/catalog";

export default function HomePage() {
  const featured = getFeaturedEarlyRelease();
  return <Storefront featured={featured} />;
}
