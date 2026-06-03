import { NextRequest, NextResponse } from "next/server";

import { getSupportAutomation } from "@/lib/control-tower";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") ?? undefined;
  const limit = searchParams.get("limit");

  return NextResponse.json(
    getSupportAutomation({
      category,
      limit: limit ? Number(limit) : undefined,
    }),
  );
}
