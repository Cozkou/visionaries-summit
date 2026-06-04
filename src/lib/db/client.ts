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

CREATE TABLE IF NOT EXISTS concept_listings (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL UNIQUE,
  woo_product_id INTEGER,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  image_url TEXT,
  storefront_url TEXT,
  published_at INTEGER NOT NULL,
  published_by TEXT,
  woo_total_sales INTEGER NOT NULL DEFAULT 0,
  last_synced_at INTEGER,
  release_at INTEGER,
  FOREIGN KEY (design_id) REFERENCES designs(id)
);

CREATE INDEX IF NOT EXISTS idx_concept_listings_status ON concept_listings(status);
CREATE INDEX IF NOT EXISTS idx_concept_listings_design ON concept_listings(design_id);

CREATE TABLE IF NOT EXISTS wishlist_signups (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(listing_id, email),
  FOREIGN KEY (listing_id) REFERENCES concept_listings(id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_listing ON wishlist_signups(listing_id);

CREATE TABLE IF NOT EXISTS preorders (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  email TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  woo_order_id INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES concept_listings(id)
);

CREATE INDEX IF NOT EXISTS idx_preorders_listing ON preorders(listing_id);
CREATE INDEX IF NOT EXISTS idx_preorders_created ON preorders(created_at);

CREATE TABLE IF NOT EXISTS page_views (
  listing_id TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (listing_id, day),
  FOREIGN KEY (listing_id) REFERENCES concept_listings(id)
);
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

function migrateConceptListingsTable(db: Database.Database): void {
  const columns = db
    .prepare(`PRAGMA table_info(concept_listings)`)
    .all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));
  if (!names.has("release_at")) {
    // Nullable column so we can backfill safely. Existing rows get
    // a 7-day window starting from their original publish time.
    db.exec(`ALTER TABLE concept_listings ADD COLUMN release_at INTEGER`);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    db.prepare(
      `UPDATE concept_listings
       SET release_at = published_at + ?
       WHERE release_at IS NULL`
    ).run(sevenDaysMs);
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
  migrateConceptListingsTable(db);

  g.__prettyFlyDb = db;
  return db;
}
