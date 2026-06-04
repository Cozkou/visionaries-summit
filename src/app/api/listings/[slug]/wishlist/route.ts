import { NextResponse } from "next/server";

import {
  addWishlistSignup,
  getDemandCounts,
  getListingBySlug,
} from "@/lib/db/listings-repository";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const listing = getListingBySlug(slug);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const inserted = addWishlistSignup(listing.id, email);
  const counts = getDemandCounts(listing.id);

  return NextResponse.json(
    { ok: true, alreadyOnList: !inserted, counts },
    { status: inserted ? 201 : 200 }
  );
}
