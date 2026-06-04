import { getProductSalesStat, readDataCsv } from "@/lib/data/sales-analytics";
import type { CatalogProduct, ProductCategory } from "@/lib/store/catalog-types";

export type { CatalogProduct, ProductCategory } from "@/lib/store/catalog-types";
export { CATEGORIES } from "@/lib/store/catalog-types";

function catalogCategory(productType: string): ProductCategory {
  const t = productType.toLowerCase();
  if (t.includes("hoodie")) return "Hoodies";
  if (t === "tee") return "Tees";
  if (t === "cap") return "Headwear";
  if (t.includes("trainer")) return "Accessories";
  if (t.includes("outerwear") || t.includes("jacket")) return "Jackets";
  return "Accessories";
}

function aggregateInventory(): Map<string, number> {
  const byProduct = new Map<string, number>();
  for (const row of readDataCsv("variants.csv")) {
    const productId = row[1];
    const qty = Number(String(row[11] ?? "").replace(/\r/g, "")) || 0;
    if (!productId) continue;
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + qty);
  }
  return byProduct;
}

function variantListPrices(): Map<string, number> {
  const prices = new Map<string, number>();
  for (const row of readDataCsv("variants.csv")) {
    const productId = row[1];
    const price = Number(String(row[7] ?? "").replace(/\r/g, "")) || 0;
    if (!productId || price <= 0) continue;
    const current = prices.get(productId) ?? 0;
    if (price > current) prices.set(productId, price);
  }
  return prices;
}

export function getStoreCatalog(limit = 48): CatalogProduct[] {
  const inventory = aggregateInventory();
  const listPrices = variantListPrices();
  const products: CatalogProduct[] = [];

  for (const row of readDataCsv("products.csv")) {
    const [productId, title, , , productType, , collection] = row;
    if (!productId) continue;
    const stat = getProductSalesStat(productId);
    const inv = inventory.get(productId) ?? 0;
    const unitsSold = stat?.unitsSold ?? 0;
    const revenueGbp = stat?.revenueGbp ?? 0;
    const price =
      unitsSold > 0
        ? Math.round(revenueGbp / unitsSold)
        : listPrices.get(productId) ?? 0;

    products.push({
      id: productId,
      name: title,
      category: catalogCategory(productType),
      productType,
      collection,
      price,
      unitsSold,
      revenueGbp,
      inventory: inv,
      badge:
        inv < 0 && unitsSold > 0
          ? "Low stock"
          : unitsSold > 500
            ? "Bestseller"
            : undefined,
    });
  }

  return products
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.revenueGbp - a.revenueGbp)
    .slice(0, limit);
}

export function getFeaturedEarlyRelease(): CatalogProduct | null {
  const catalog = getStoreCatalog(200);
  const negativeSelling = catalog.filter((p) => p.inventory < 0 && p.unitsSold > 0);
  if (negativeSelling.length > 0) {
    return negativeSelling.sort((a, b) => b.revenueGbp - a.revenueGbp)[0];
  }
  return catalog[0] ?? null;
}
