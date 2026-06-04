import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.INTERNAL_API_KEY?.trim();
  const staffPassword =
    process.env.STAFF_PASSWORD?.trim() || apiKey;

  if (!staffPassword || !apiKey) {
    return NextResponse.json(
      { error: "Auth not configured on server" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.password !== staffPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ token: apiKey });
}
