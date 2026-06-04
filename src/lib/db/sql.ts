import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

/** True when Supabase/Postgres connection string is configured. */
export function isPostgresEnabled(): boolean {
  return Boolean(connectionString?.trim());
}

let sql: ReturnType<typeof postgres> | null = null;

/** Shared Postgres client (server-only). Throws if DATABASE_URL is unset. */
export function getSql() {
  if (!connectionString?.trim()) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = postgres(connectionString, {
      ssl: "require",
      max: 10,
      prepare: !connectionString.includes(":6543/"),
    });
  }
  return sql;
}

export default getSql;
