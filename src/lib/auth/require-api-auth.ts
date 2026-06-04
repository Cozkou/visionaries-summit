import { NextResponse } from "next/server";

function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  const apiKey = request.headers.get("x-api-key");
  return apiKey?.trim() ?? null;
}

export function requireApiAuth(request: Request): NextResponse | null {
  const configuredKey = process.env.INTERNAL_API_KEY?.trim();

  if (!configuredKey) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Server misconfigured: INTERNAL_API_KEY is required" },
        { status: 503 }
      );
    }
    return null;
  }

  const token = extractToken(request);
  if (!token || token !== configuredKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
