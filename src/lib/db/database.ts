import { isPostgresEnabled } from "@/lib/db/sql";

export type AppStorage = "postgres" | "sqlite";

/** Storage backend for app persistence (designs, listings, demand). */
export function getAppStorage(): AppStorage {
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
