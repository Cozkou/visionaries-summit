import { NextResponse } from "next/server";

import { getControlTowerSnapshot } from "@/lib/control-tower";

export async function GET() {
  return NextResponse.json(getControlTowerSnapshot());
}
