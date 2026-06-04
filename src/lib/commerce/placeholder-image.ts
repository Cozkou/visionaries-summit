import type { ProductType } from "@/types";

/**
 * Maps a generated concept's product type to a deterministic placeholder image
 * shipped in /public, since the CSV data pack has no real product photography.
 * Used when publishing a design to the storefront / WooCommerce.
 */
const PLACEHOLDERS: Record<ProductType, string> = {
  Hoodie: "/placeholders/design-1.svg",
  "T-Shirt": "/placeholders/design-2.svg",
  Jacket: "/varsity.PNG",
  Trainers: "/placeholders/design-4.svg",
  Cap: "/placeholders/design-5.svg",
};

export function placeholderImageFor(productType: ProductType): string {
  return PLACEHOLDERS[productType] ?? "/placeholders/design-3.svg";
}

export function absoluteImageUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base =
    process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
