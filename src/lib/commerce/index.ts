import { MockCommerceAdapter } from "@/lib/commerce/mock";
import type { CommerceAdapter } from "@/lib/commerce/types";
import { WooCommerceAdapter, isWooConfigured } from "@/lib/commerce/woocommerce";

let cached: CommerceAdapter | null = null;

/**
 * Pick the commerce adapter based on env:
 * - COMMERCE_PROVIDER=woocommerce → real Woo client (env vars required)
 * - COMMERCE_PROVIDER=mock (or unset and Woo not configured) → in-memory mock
 *
 * The mock adapter keeps the publish-to-site loop fully functional in local dev
 * and demos without needing real WooCommerce credentials.
 */
export function getCommerceAdapter(): CommerceAdapter {
  if (cached) return cached;

  const provider = process.env.COMMERCE_PROVIDER?.trim().toLowerCase();

  if (provider === "woocommerce") {
    cached = new WooCommerceAdapter();
    return cached;
  }

  if (provider === "mock") {
    cached = new MockCommerceAdapter();
    return cached;
  }

  cached = isWooConfigured() ? new WooCommerceAdapter() : new MockCommerceAdapter();
  return cached;
}

export function resetCommerceAdapter(): void {
  cached = null;
}

export type { CommerceAdapter };
