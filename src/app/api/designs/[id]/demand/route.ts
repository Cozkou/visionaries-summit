import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { getListingDemandForDesign } from "@/lib/listing-demand";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  const demand = await getListingDemandForDesign(id);

  if (!demand) {
    return NextResponse.json({ listing: null, counts: null }, { status: 200 });
  }

  return NextResponse.json(demand);
}
