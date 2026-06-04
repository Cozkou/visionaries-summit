import { NextResponse } from "next/server";

import { analyzeDesign } from "@/lib/analyze-design";
import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { getStoredDesign } from "@/lib/db/designs-repository";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  const stored = getStoredDesign(id);

  if (!stored) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  try {
    return NextResponse.json(await analyzeDesign(stored));
  } catch (error) {
    console.error("[GET /api/designs/:id/analysis]", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
