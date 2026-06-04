import { NextRequest, NextResponse } from "next/server";

import { getMarketingTriage } from "@/lib/control-tower";
import type { MarketingAction } from "@/lib/control-tower";

function isMarketingAction(value: string): value is MarketingAction {
  return ["Pause", "Trim", "Hold", "Scale"].includes(value);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const limit = searchParams.get("limit");

  if (action && !isMarketingAction(action)) {
    return NextResponse.json(
      { error: "Invalid action filter" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    getMarketingTriage({
      action: action && isMarketingAction(action) ? action : undefined,
      limit: limit ? Number(limit) : undefined,
    }),
  );
}
