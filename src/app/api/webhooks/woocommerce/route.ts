import crypto from "crypto";
import { NextResponse } from "next/server";

import {
  getListingByWooProductId,
  updateListing,
} from "@/lib/db/listings-repository";

export const runtime = "nodejs";

/**
 * WooCommerce webhook receiver.
 *
 * Woo signs the raw request body with HMAC-SHA256 using the webhook secret,
 * sending the base64 digest in `X-WC-Webhook-Signature`. We verify the digest
 * (timing-safe) and then react to `product.updated` and `order.created` events
 * to keep our cached counts in sync with the live platform.
 *
 * Set the same secret in WOOCOMMERCE_WEBHOOK_SECRET that you configure on the
 * Woo webhook itself.
 */

interface WooProductWebhook {
  id: number;
  status?: string;
  total_sales?: number;
  permalink?: string;
}

interface WooOrderLineItem {
  product_id: number;
  quantity: number;
}

interface WooOrderWebhook {
  id: number;
  status?: string;
  line_items?: WooOrderLineItem[];
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-wc-webhook-topic") ?? "";

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (topic.startsWith("product.")) {
    const product = payload as WooProductWebhook;
    const listing = getListingByWooProductId(product.id);
    if (listing) {
      updateListing(listing.id, {
        wooTotalSales:
          product.total_sales !== undefined
            ? product.total_sales
            : listing.wooTotalSales,
        storefrontUrl: product.permalink ?? listing.storefrontUrl,
        status:
          product.status === "publish"
            ? "published"
            : product.status === "trash" || product.status === "private"
              ? "archived"
              : listing.status,
      });
    }
  } else if (topic.startsWith("order.")) {
    const order = payload as WooOrderWebhook;
    const productIds = (order.line_items ?? []).map((li) => li.product_id);
    for (const productId of new Set(productIds)) {
      const listing = getListingByWooProductId(productId);
      if (!listing) continue;
      const units = (order.line_items ?? [])
        .filter((li) => li.product_id === productId)
        .reduce((sum, li) => sum + (Number(li.quantity) || 0), 0);
      updateListing(listing.id, {
        wooTotalSales: listing.wooTotalSales + units,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
