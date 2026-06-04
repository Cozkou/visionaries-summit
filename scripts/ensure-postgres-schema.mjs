import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(
  __dirname,
  "../supabase/migrations/20260604120000_initial_app_schema.sql"
);
const schema = readFileSync(schemaPath, "utf8");

const sql = postgres(connectionString, { ssl: "require", max: 1 });

try {
  await sql.unsafe(schema);
  const [{ ok }] = await sql`select 1 as ok`;
  console.log("Postgres schema ready:", ok);
} catch (err) {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await sql.end();
}
