import { NextResponse } from "next/server";

import { getCommerceAdapter } from "@/lib/commerce";
import { CommerceConfigError, CommerceRequestError } from "@/lib/commerce/types";
import {
  addPreorder,
  getDemandCounts,
  getListingBySlug,
} from "@/lib/db/listings-repository";
import { getStoredDesign } from "@/lib/db/designs-repository";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PreorderBody {
  email?: string;
  size?: string | null;
  quantity?: number;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const listing = await getListingBySlug(slug);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  let body: PreorderBody;
  try {
    body = (await request.json()) as PreorderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const quantity = Math.max(1, Math.min(5, Number(body.quantity) || 1));
  const size = body.size?.trim() || null;

  const stored = await getStoredDesign(listing.designId);
  if (!stored) {
    return NextResponse.json({ error: "Design unavailable" }, { status: 410 });
  }

  let wooOrderId: number | null = null;
  if (listing.wooProductId) {
    try {
      const adapter = getCommerceAdapter();
      const order = await adapter.createPreorderDraftOrder({
        productId: listing.wooProductId,
        email,
        size: size ?? undefined,
        quantity,
        unitPriceGbp: stored.design.retailPrice,
      });
      wooOrderId = order.id;
    } catch (error) {
      if (
        !(error instanceof CommerceConfigError) &&
        !(error instanceof CommerceRequestError)
      ) {
        console.error("[preorder] commerce", error);
      }
    }
  }

  await addPreorder({
    listingId: listing.id,
    email,
    size,
    quantity,
    wooOrderId,
  });

  return NextResponse.json(
    {
      ok: true,
      counts: await getDemandCounts(listing.id),
      wooOrderId,
    },
    { status: 201 }
  );
}
