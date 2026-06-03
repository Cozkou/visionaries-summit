import type { Design, GenerationInputs, ProductType } from "@/types";

/** Verified HTTP 200 on Unsplash CDN (checked locally). */
function unsplash(photoId: string, width = 800): string {
  return `https://images.unsplash.com/${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

/** Always resolves — used when Unsplash fails in the browser. */
export function picsumUrl(seed: string, size = 800): string {
  const safe = seed.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 48);
  return `https://picsum.photos/seed/${safe}/${size}/${size}`;
}

export function placeholderUrl(index: number): string {
  return `/placeholders/design-${(index % 6) + 1}.svg`;
}

const imagesByProduct: Record<ProductType, string[]> = {
  Hoodie: [
    unsplash("photo-1556821840-3a63f95609a7"),
    unsplash("photo-1617137968427-85924c800a22"),
    unsplash("photo-1515886657613-9f3515b0c78f"),
    unsplash("photo-1434389677669-e08b4cac3105"),
    unsplash("photo-1521572163474-6864f9cf17ab"),
    unsplash("photo-1583743814966-8936f5b7be1a"),
  ],
  "T-Shirt": [
    unsplash("photo-1521572163474-6864f9cf17ab"),
    unsplash("photo-1583743814966-8936f5b7be1a"),
    unsplash("photo-1503341504253-dff4815485f1"),
    unsplash("photo-1515886657613-9f3515b0c78f"),
    unsplash("photo-1617137968427-85924c800a22"),
    unsplash("photo-1556821840-3a63f95609a7"),
  ],
  Jacket: [
    unsplash("photo-1544022613-e87ca75a784a"),
    unsplash("photo-1591047139829-d91aecb6caea"),
    unsplash("photo-1551028719-00167b16eac5"),
    unsplash("photo-1460353581641-37baddab0fa2"),
    unsplash("photo-1560769629-975ec94e6a86"),
    unsplash("photo-1434389677669-e08b4cac3105"),
  ],
  Trainers: [
    unsplash("photo-1542291026-7eec264c27ff"),
    unsplash("photo-1595950653106-6c9ebd614d3a"),
    unsplash("photo-1460353581641-37baddab0fa2"),
    unsplash("photo-1560769629-975ec94e6a86"),
    unsplash("photo-1608231387042-66d1773070a5"),
    unsplash("photo-1515886657613-9f3515b0c78f"),
  ],
  Cap: [
    unsplash("photo-1521369909029-2afed882baee"),
    unsplash("photo-1503341504253-dff4815485f1"),
    unsplash("photo-1583743814966-8936f5b7be1a"),
    unsplash("photo-1556821840-3a63f95609a7"),
    unsplash("photo-1434389677669-e08b4cac3105"),
    unsplash("photo-1521572163474-6864f9cf17ab"),
  ],
};

export function pickImageUrl(
  productType: ProductType,
  designId: string,
  index: number
): string {
  const pool = imagesByProduct[productType];
  return pool[index % pool.length];
}

export function pickFallbackImageUrl(
  productType: ProductType,
  designId: string,
  index: number
): string {
  return picsumUrl(`${productType}-${designId}-${index}`);
}

export function attachRemoteImages(
  designs: Design[],
  inputs: GenerationInputs
): Design[] {
  return designs.map((design, index) => ({
    ...design,
    imageUrl: pickImageUrl(inputs.productType, design.id, index),
  }));
}
