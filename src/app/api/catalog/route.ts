import { NextResponse } from "next/server";

import { getStoreCatalog } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = getStoreCatalog(80);
  return NextResponse.json({
    products,
    source: "hackathon_assets/pretty_fly_data_pack/data/products.csv",
  });
}
