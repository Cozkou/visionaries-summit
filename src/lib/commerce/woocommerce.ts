import {
  CommerceAdapter,
  CommerceConfigError,
  CommerceRequestError,
  CreateDraftProductInput,
  CreatePreorderInput,
  ListingStatus,
  RemoteOrder,
  RemoteProduct,
} from "@/lib/commerce/types";

interface WooConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

interface WooProductImage {
  id?: number;
  src: string;
}

interface WooMetaData {
  id?: number;
  key: string;
  value: string;
}

interface WooProductResponse {
  id: number;
  name: string;
  status: string;
  permalink?: string;
  total_sales?: number;
  meta_data?: WooMetaData[];
}

interface WooOrderResponse {
  id: number;
  status: string;
  total: string;
  billing?: { email?: string };
}

interface WooErrorResponse {
  code?: string;
  message?: string;
  data?: unknown;
}

function readConfig(): WooConfig {
  const baseUrl = process.env.WOOCOMMERCE_URL?.trim();
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

  if (!baseUrl || !consumerKey || !consumerSecret) {
    throw new CommerceConfigError(
      "WooCommerce env not configured: set WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET"
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    consumerKey,
    consumerSecret,
  };
}

function basicAuthHeader(config: WooConfig): string {
  const token = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString("base64");
  return `Basic ${token}`;
}

async function wooFetch<T>(
  config: WooConfig,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${config.baseUrl}/wp-json/wc/v3${path}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", basicAuthHeader(config));
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let body: WooErrorResponse | undefined;
    try {
      body = (await res.json()) as WooErrorResponse;
    } catch {
      /* ignore */
    }
    throw new CommerceRequestError(
      body?.message ?? `WooCommerce request failed (${res.status})`,
      res.status,
      body
    );
  }

  return (await res.json()) as T;
}

const PRETTY_FLY_DESIGN_META = "pretty_fly_design_id";
const PRETTY_FLY_PREORDER_META = "pretty_fly_preorder";

function metaToRecord(meta?: WooMetaData[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of meta ?? []) {
    if (entry?.key) out[entry.key] = String(entry.value ?? "");
  }
  return out;
}

function mapProduct(woo: WooProductResponse): RemoteProduct {
  return {
    id: woo.id,
    name: woo.name,
    status: woo.status,
    permalink: woo.permalink,
    totalSales: woo.total_sales ?? 0,
    meta: metaToRecord(woo.meta_data),
  };
}

function mapOrder(woo: WooOrderResponse): RemoteOrder {
  return {
    id: woo.id,
    status: woo.status,
    email: woo.billing?.email ?? "",
    total: woo.total,
  };
}

function mapStatus(status: ListingStatus): string {
  switch (status) {
    case "published":
      return "publish";
    case "coming_soon":
    case "draft":
      return "draft";
    case "archived":
      return "private";
    default:
      return "draft";
  }
}

export class WooCommerceAdapter implements CommerceAdapter {
  readonly providerId = "woocommerce" as const;

  private get config(): WooConfig {
    return readConfig();
  }

  async createDraftProduct(input: CreateDraftProductInput): Promise<RemoteProduct> {
    const images: WooProductImage[] = (input.imageUrls ?? [])
      .filter(Boolean)
      .map((src) => ({ src }));

    const payload = {
      name: input.name,
      type: "simple",
      status: input.acceptingPreorders ? "publish" : "draft",
      catalog_visibility: input.acceptingPreorders ? "visible" : "hidden",
      regular_price: input.regularPriceGbp.toFixed(2),
      description: input.description,
      short_description: input.description,
      images,
      meta_data: [
        { key: PRETTY_FLY_DESIGN_META, value: input.designId },
        ...(input.sizes?.length
          ? [{ key: "pretty_fly_sizes", value: input.sizes.join(",") }]
          : []),
      ],
    };

    const created = await wooFetch<WooProductResponse>(this.config, "/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return mapProduct(created);
  }

  async updateProductStatus(
    productId: number,
    status: ListingStatus
  ): Promise<RemoteProduct> {
    const updated = await wooFetch<WooProductResponse>(
      this.config,
      `/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status: mapStatus(status) }),
      }
    );
    return mapProduct(updated);
  }

  async getProduct(productId: number): Promise<RemoteProduct | null> {
    try {
      const product = await wooFetch<WooProductResponse>(
        this.config,
        `/products/${productId}`,
        { method: "GET" }
      );
      return mapProduct(product);
    } catch (error) {
      if (error instanceof CommerceRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createPreorderDraftOrder(input: CreatePreorderInput): Promise<RemoteOrder> {
    const payload = {
      status: "pending",
      set_paid: false,
      billing: { email: input.email },
      line_items: [
        {
          product_id: input.productId,
          quantity: input.quantity,
          subtotal: (input.unitPriceGbp * input.quantity).toFixed(2),
          total: (input.unitPriceGbp * input.quantity).toFixed(2),
          meta_data: [
            ...(input.size
              ? [{ key: "pretty_fly_size", value: input.size }]
              : []),
            { key: PRETTY_FLY_PREORDER_META, value: "1" },
          ],
        },
      ],
      meta_data: [{ key: PRETTY_FLY_PREORDER_META, value: "1" }],
    };

    const order = await wooFetch<WooOrderResponse>(this.config, "/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return mapOrder(order);
  }
}

export function isWooConfigured(): boolean {
  try {
    readConfig();
    return true;
  } catch {
    return false;
  }
}
