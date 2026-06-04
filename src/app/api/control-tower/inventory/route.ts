import { NextRequest, NextResponse } from "next/server";

import { getInventoryRecommendations } from "@/lib/control-tower";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const collection = searchParams.get("collection") ?? undefined;
  const productType = searchParams.get("productType") ?? undefined;
  const limit = searchParams.get("limit");

  return NextResponse.json(
    getInventoryRecommendations({
      collection,
      productType,
      limit: limit ? Number(limit) : undefined,
    }),
  );
}
