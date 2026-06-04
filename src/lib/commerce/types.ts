/**
 * Ecommerce platform adapter contract.
 * Pretty Fly currently ships a WooCommerce implementation; Shopify can drop in
 * later by implementing the same interface.
 */

export type ListingStatus = "draft" | "coming_soon" | "published" | "archived";

export interface CreateDraftProductInput {
  designId: string;
  name: string;
  description: string;
  regularPriceGbp: number;
  imageUrls: string[];
  sizes?: string[];
  /** Whether the listing should be visible to customers (acceptable pre-order state). */
  acceptingPreorders?: boolean;
}

export interface RemoteProduct {
  id: number;
  name: string;
  status: string;
  permalink?: string;
  totalSales: number;
  meta: Record<string, string>;
}

export interface CreatePreorderInput {
  productId: number;
  email: string;
  size?: string;
  quantity: number;
  unitPriceGbp: number;
}

export interface RemoteOrder {
  id: number;
  status: string;
  email: string;
  total: string;
}

export interface CommerceAdapter {
  readonly providerId: "woocommerce" | "shopify" | "mock";
  createDraftProduct(input: CreateDraftProductInput): Promise<RemoteProduct>;
  updateProductStatus(productId: number, status: ListingStatus): Promise<RemoteProduct>;
  getProduct(productId: number): Promise<RemoteProduct | null>;
  createPreorderDraftOrder(input: CreatePreorderInput): Promise<RemoteOrder>;
}

export class CommerceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceConfigError";
  }
}

export class CommerceRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "CommerceRequestError";
  }
}
