import { NextResponse } from "next/server";

import {
  getListingBySlug,
  incrementPageView,
} from "@/lib/db/listings-repository";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const listing = getListingBySlug(slug);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  incrementPageView(listing.id);
  return NextResponse.json({ ok: true });
}
