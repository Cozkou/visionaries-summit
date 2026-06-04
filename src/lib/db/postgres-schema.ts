/** Idempotent schema for Supabase Postgres (mirrors SQLite in client.ts). */
export const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  retail_price DOUBLE PRECISION NOT NULL,
  source_product_id TEXT,
  product_type TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  business_goal TEXT NOT NULL,
  style_prompt TEXT,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at);

CREATE TABLE IF NOT EXISTS concept_listings (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL UNIQUE REFERENCES designs(id),
  woo_product_id INTEGER,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  image_url TEXT,
  storefront_url TEXT,
  published_at BIGINT NOT NULL,
  published_by TEXT,
  woo_total_sales INTEGER NOT NULL DEFAULT 0,
  last_synced_at BIGINT,
  release_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_concept_listings_status ON concept_listings(status);
CREATE INDEX IF NOT EXISTS idx_concept_listings_design ON concept_listings(design_id);

CREATE TABLE IF NOT EXISTS wishlist_signups (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES concept_listings(id),
  email TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  UNIQUE(listing_id, email)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_listing ON wishlist_signups(listing_id);

CREATE TABLE IF NOT EXISTS preorders (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES concept_listings(id),
  email TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  woo_order_id INTEGER,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_preorders_listing ON preorders(listing_id);
CREATE INDEX IF NOT EXISTS idx_preorders_created ON preorders(created_at);

CREATE TABLE IF NOT EXISTS page_views (
  listing_id TEXT NOT NULL REFERENCES concept_listings(id),
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (listing_id, day)
);
`;
