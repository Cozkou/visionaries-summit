import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  retail_price REAL NOT NULL,
  product_type TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  business_goal TEXT NOT NULL,
  style_prompt TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at);
`;

function migrateDesignsTable(db: Database.Database): void {
  const columns = db
    .prepare(`PRAGMA table_info(designs)`)
    .all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));
  if (!names.has("source_product_id")) {
    db.exec(`ALTER TABLE designs ADD COLUMN source_product_id TEXT`);
  }
}

type DbGlobal = typeof globalThis & {
  __prettyFlyDb?: Database.Database;
};

function resolveDbPath(): string {
  const configured = process.env.DATABASE_PATH?.trim();
  if (configured) return configured;

  if (process.env.VERCEL) {
    return path.join("/tmp", "pretty-fly.db");
  }

  return path.join(process.cwd(), "data", "pretty-fly.db");
}

export function getDb(): Database.Database {
  const g = globalThis as DbGlobal;
  if (g.__prettyFlyDb) return g.__prettyFlyDb;

  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  migrateDesignsTable(db);

  g.__prettyFlyDb = db;
  return db;
}
