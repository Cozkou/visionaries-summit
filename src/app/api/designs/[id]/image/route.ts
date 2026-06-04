import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { ensureConceptImage } from "@/lib/concept-image";
import { getDesignById } from "@/lib/db/designs-repository";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  if (!getDesignById(id)) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  try {
    const imageUrl = await ensureConceptImage(id);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Could not generate concept image" },
        { status: 500 }
      );
    }
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("[POST /api/designs/:id/image]", error);
    return NextResponse.json(
      { error: "Concept image generation failed" },
      { status: 500 }
    );
  }
}
