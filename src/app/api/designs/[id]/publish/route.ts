import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { publishDesign, unpublishDesign } from "@/lib/publish-design";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;

  let body: { acceptingPreorders?: boolean; publishedBy?: string } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await publishDesign(id, {
    publishedBy: body.publishedBy ?? null,
    acceptingPreorders: body.acceptingPreorders ?? true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    { listing: result.listing, reused: result.reused },
    { status: result.reused ? 200 : 201 }
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  const result = await unpublishDesign(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ listing: result.listing });
}
