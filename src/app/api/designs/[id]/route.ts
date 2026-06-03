import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { getDesignById } from "@/lib/db/designs-repository";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  const design = getDesignById(id);

  if (!design) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  return NextResponse.json(design);
}
