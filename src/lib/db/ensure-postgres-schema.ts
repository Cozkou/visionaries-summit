import { POSTGRES_SCHEMA } from "@/lib/db/postgres-schema";
import { getSql, isPostgresEnabled } from "@/lib/db/sql";

let ready: Promise<void> | null = null;

/** Runs CREATE TABLE IF NOT EXISTS once per process when Postgres is enabled. */
export function ensurePostgresSchema(): Promise<void> {
  if (!isPostgresEnabled()) {
    return Promise.resolve();
  }
  if (!ready) {
    ready = getSql().unsafe(POSTGRES_SCHEMA).then(() => undefined);
  }
  return ready;
}
