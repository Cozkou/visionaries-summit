import { NextResponse } from "next/server";

import { getControlTowerOverview } from "@/lib/control-tower";

export async function GET() {
  return NextResponse.json(getControlTowerOverview());
}
