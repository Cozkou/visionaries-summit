import { NextResponse } from "next/server";

import { ensurePostgresSchema } from "@/lib/db/ensure-postgres-schema";
import { listStoredDesigns } from "@/lib/db/designs-repository";
import { isPostgresEnabled, getSql } from "@/lib/db/sql";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const storage = isPostgresEnabled() ? "postgres" : "sqlite";

  try {
    if (isPostgresEnabled()) {
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
    return NextResponse.json(
      { ok: false, storage, error: message },
      { status: 503 }
    );
  }
}
