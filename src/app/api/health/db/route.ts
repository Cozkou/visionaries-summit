import { NextResponse } from "next/server";

import { getAppStorage } from "@/lib/db/database";
import { ensurePostgresSchema } from "@/lib/db/ensure-postgres-schema";
import { listStoredDesigns } from "@/lib/db/designs-repository";
import { getSql } from "@/lib/db/sql";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const storage = getAppStorage();

    if (storage === "postgres") {
      await ensurePostgresSchema();
      const [{ ok }] = await getSql()`select 1 as ok`;
      const designs = await listStoredDesigns(1);
      return NextResponse.json({
        ok: true,
        storage,
        postgres: { connected: true, probe: ok },
        designCountSample: designs.length,
      });
    }

    const row = getDb()
      .prepare(`SELECT COUNT(*) as c FROM designs`)
      .get() as { c: number };
    return NextResponse.json({
      ok: true,
      storage,
      sqlite: { designRows: row.c },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
