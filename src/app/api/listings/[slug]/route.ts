import { NextResponse } from "next/server";

import { getListingBySlug } from "@/lib/db/listings-repository";
import { toPublicListing } from "@/lib/public-listings";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const listing = await getListingBySlug(slug);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  const publicListing = await toPublicListing(listing);
  if (!publicListing) {
    return NextResponse.json({ error: "Listing unavailable" }, { status: 404 });
  }
  return NextResponse.json(publicListing);
}
