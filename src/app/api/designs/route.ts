import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { listStoredDesigns } from "@/lib/db/designs-repository";
import { isPostgresEnabled } from "@/lib/db/sql";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit")) || 100)
  );

  try {
    const designs = await listStoredDesigns(limit);
    return NextResponse.json({
      designs,
      storage: isPostgresEnabled() ? "postgres" : "sqlite",
    });
  } catch (error) {
    console.error("[GET /api/designs]", error);
    return NextResponse.json(
      { error: "Failed to load saved designs" },
      { status: 500 }
    );
  }
}
