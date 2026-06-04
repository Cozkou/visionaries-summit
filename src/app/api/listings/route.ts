import { NextResponse } from "next/server";

import { listPublicListings } from "@/lib/public-listings";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ listings: await listPublicListings() });
}
