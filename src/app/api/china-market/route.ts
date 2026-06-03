import { NextResponse } from "next/server";

import { getChinaMarketResponse } from "@/lib/china-market";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getChinaMarketResponse());
}
