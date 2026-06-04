import {
  CommerceAdapter,
  CreateDraftProductInput,
  CreatePreorderInput,
  ListingStatus,
  RemoteOrder,
  RemoteProduct,
} from "@/lib/commerce/types";

/**
 * In-memory adapter for local dev / demos when WooCommerce creds are absent.
 * Lives on `globalThis` so HMR doesn't blow it away between requests.
 */

type Store = {
  products: Map<number, RemoteProduct & { regularPriceGbp: number }>;
  orders: Map<number, RemoteOrder>;
  nextProductId: number;
  nextOrderId: number;
};

const MOCK_KEY = "__prettyFlyMockCommerce";

type StoreGlobal = typeof globalThis & { [MOCK_KEY]?: Store };

function store(): Store {
  const g = globalThis as StoreGlobal;
  if (!g[MOCK_KEY]) {
    g[MOCK_KEY] = {
      products: new Map(),
      orders: new Map(),
      nextProductId: 10_001,
      nextOrderId: 50_001,
    };
  }
  return g[MOCK_KEY]!;
}

function mapStatus(status: ListingStatus): string {
  if (status === "published") return "publish";
  if (status === "coming_soon" || status === "draft") return "draft";
  if (status === "archived") return "private";
  return "draft";
}

export class MockCommerceAdapter implements CommerceAdapter {
  readonly providerId = "mock" as const;

  async createDraftProduct(input: CreateDraftProductInput): Promise<RemoteProduct> {
    const s = store();
    const id = s.nextProductId++;
    const product: RemoteProduct & { regularPriceGbp: number } = {
      id,
      name: input.name,
      status: input.acceptingPreorders ? "publish" : "draft",
      permalink: `https://mock.local/product/${id}`,
      totalSales: 0,
      regularPriceGbp: input.regularPriceGbp,
      meta: {
        pretty_fly_design_id: input.designId,
        ...(input.sizes?.length ? { pretty_fly_sizes: input.sizes.join(",") } : {}),
      },
    };
    s.products.set(id, product);
    return product;
  }

  async updateProductStatus(
    productId: number,
    status: ListingStatus
  ): Promise<RemoteProduct> {
    const s = store();
    const existing = s.products.get(productId);
    if (!existing) {
      throw new Error(`Mock product ${productId} not found`);
    }
    existing.status = mapStatus(status);
    s.products.set(productId, existing);
    return existing;
  }

  async getProduct(productId: number): Promise<RemoteProduct | null> {
    return store().products.get(productId) ?? null;
  }

  async createPreorderDraftOrder(input: CreatePreorderInput): Promise<RemoteOrder> {
    const s = store();
    const id = s.nextOrderId++;
    const order: RemoteOrder = {
      id,
      status: "pending",
      email: input.email,
      total: (input.unitPriceGbp * input.quantity).toFixed(2),
    };
    s.orders.set(id, order);

    const product = s.products.get(input.productId);
    if (product) {
      product.totalSales += input.quantity;
      s.products.set(input.productId, product);
    }

    return order;
  }
}
