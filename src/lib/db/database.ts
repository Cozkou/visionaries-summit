import { isPostgresEnabled } from "@/lib/db/sql";

export type AppStorage = "postgres" | "sqlite";

function shouldUseLocalSqlite(): boolean {
  return process.env.USE_SQLITE === "true" || process.env.USE_SQLITE === "1";
}

export function isDatabaseConfigured(): boolean {
  return shouldUseLocalSqlite() || isPostgresEnabled();
}

/** Storage backend for app persistence (designs, listings, demand). */
export function getAppStorage(): AppStorage {
  if (shouldUseLocalSqlite()) {
    return "sqlite";
  }
  if (process.env.NODE_ENV === "production" && !isPostgresEnabled()) {
    throw new Error(
      "DATABASE_URL is required in production. Set Supabase Postgres in Vercel env."
    );
  }
  return isPostgresEnabled() ? "postgres" : "sqlite";
}

export function assertDatabaseConfigured(): void {
  getAppStorage();
}
