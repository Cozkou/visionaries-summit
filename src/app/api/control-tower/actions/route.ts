import { NextResponse } from "next/server";

import { getControlTowerActions } from "@/lib/control-tower";

export async function GET() {
  return NextResponse.json(getControlTowerActions());
}
