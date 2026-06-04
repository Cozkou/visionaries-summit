export const CATEGORIES = [
  "All",
  "Jackets",
  "Hoodies",
  "Tees",
  "Headwear",
  "Accessories",
] as const;

export type ProductCategory = (typeof CATEGORIES)[number];

export type CatalogProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  productType: string;
  collection: string;
  price: number;
  unitsSold: number;
  revenueGbp: number;
  inventory: number;
  badge?: string;
};
