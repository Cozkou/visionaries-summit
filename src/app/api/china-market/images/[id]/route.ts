import { NextResponse } from "next/server";

import { getChinaMarketImageAsset } from "@/lib/china-market";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const asset = getChinaMarketImageAsset(id);

  if (!asset) {
    return NextResponse.json({ error: "Image asset not found" }, { status: 404 });
  }

  const response = await fetch(asset.sourceUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      ...(asset.headers ?? {}),
    },
    next: { revalidate: 21_600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed to fetch source image (${response.status})` },
      { status: 502 },
    );
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const body = await response.arrayBuffer();

  return new Response(body, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      "Content-Type": contentType,
    },
  });
}
