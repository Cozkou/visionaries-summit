import { NextResponse } from "next/server";

import { getChinaMarketResponse } from "@/lib/china-market";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getChinaMarketResponse();
  const status = data.mode === "unavailable" ? 503 : 200;
  return NextResponse.json(data, { status });
}
