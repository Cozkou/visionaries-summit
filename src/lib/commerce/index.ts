import type { CommerceAdapter } from "@/lib/commerce/types";
import { CommerceConfigError } from "@/lib/commerce/types";
import { WooCommerceAdapter, isWooConfigured } from "@/lib/commerce/woocommerce";

let cached: CommerceAdapter | null = null;

/**
 * Returns the WooCommerce adapter when configured.
 * No in-memory mock — publish falls back to SQLite-only listings when unset.
 */
export function getCommerceAdapter(): CommerceAdapter {
  if (cached) return cached;

  const provider = process.env.COMMERCE_PROVIDER?.trim().toLowerCase();
  if (provider === "woocommerce" || isWooConfigured()) {
    cached = new WooCommerceAdapter();
    return cached;
  }

  throw new CommerceConfigError(
    "WooCommerce not configured. Publish still creates a local early-release listing; set WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET to sync to a store.",
  );
}

export function isCommerceConfigured(): boolean {
  try {
    getCommerceAdapter();
    return true;
  } catch {
    return false;
  }
}

export function resetCommerceAdapter(): void {
  cached = null;
}

export type { CommerceAdapter };
