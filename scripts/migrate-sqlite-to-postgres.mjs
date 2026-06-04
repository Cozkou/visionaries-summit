#!/usr/bin/env node
/**
 * Copy app tables from local SQLite into Supabase Postgres (requires DATABASE_URL).
 */
import Database from "better-sqlite3";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dbPath = join(root, "data", "pretty-fly.db");
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

if (!existsSync(dbPath)) {
  console.error("SQLite database not found:", dbPath);
  process.exit(1);
}

const sqlite = new Database(dbPath, { readonly: true });
const sql = postgres(connectionString, {
  ssl: "require",
  max: 1,
  prepare: connectionString.includes(":6543/"),
});

const tables = [
  "page_views",
  "preorders",
  "wishlist_signups",
  "concept_listings",
  "designs",
];

try {
  console.log("Clearing Supabase app tables…");
  for (const table of tables) {
    await sql.unsafe(`TRUNCATE TABLE ${table} CASCADE`);
  }

  const designs = sqlite.prepare("SELECT * FROM designs").all();
  console.log(`designs: ${designs.length} rows`);
  for (const row of designs) {
    await sql`
      INSERT INTO designs (
        id, name, description, image_url, retail_price, source_product_id,
        product_type, target_audience, business_goal, style_prompt, created_at
      ) VALUES (
        ${row.id},
        ${row.name},
        ${row.description},
        ${row.image_url ?? ""},
        ${row.retail_price},
        ${row.source_product_id ?? null},
        ${row.product_type},
        ${row.target_audience},
        ${row.business_goal},
        ${row.style_prompt ?? null},
        ${row.created_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const listings = sqlite.prepare("SELECT * FROM concept_listings").all();
  console.log(`concept_listings: ${listings.length} rows`);
  for (const row of listings) {
    await sql`
      INSERT INTO concept_listings (
        id, design_id, woo_product_id, slug, status, image_url, storefront_url,
        published_at, published_by, woo_total_sales, last_synced_at, release_at
      ) VALUES (
        ${row.id},
        ${row.design_id},
        ${row.woo_product_id ?? null},
        ${row.slug},
        ${row.status},
        ${row.image_url ?? null},
        ${row.storefront_url ?? null},
        ${row.published_at},
        ${row.published_by ?? null},
        ${row.woo_total_sales ?? 0},
        ${row.last_synced_at ?? null},
        ${row.release_at ?? null}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const wishlists = sqlite.prepare("SELECT * FROM wishlist_signups").all();
  console.log(`wishlist_signups: ${wishlists.length} rows`);
  for (const row of wishlists) {
    await sql`
      INSERT INTO wishlist_signups (id, listing_id, email, created_at)
      VALUES (${row.id}, ${row.listing_id}, ${row.email}, ${row.created_at})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const preorders = sqlite.prepare("SELECT * FROM preorders").all();
  console.log(`preorders: ${preorders.length} rows`);
  for (const row of preorders) {
    await sql`
      INSERT INTO preorders (
        id, listing_id, email, size, quantity, woo_order_id, created_at
      ) VALUES (
        ${row.id},
        ${row.listing_id},
        ${row.email},
        ${row.size ?? null},
        ${row.quantity ?? 1},
        ${row.woo_order_id ?? null},
        ${row.created_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const views = sqlite.prepare("SELECT * FROM page_views").all();
  console.log(`page_views: ${views.length} rows`);
  for (const row of views) {
    await sql`
      INSERT INTO page_views (listing_id, day, count)
      VALUES (${row.listing_id}, ${row.day}, ${row.count ?? 0})
      ON CONFLICT (listing_id, day) DO UPDATE SET count = EXCLUDED.count
    `;
  }

  const counts = await sql`
    SELECT 'designs' AS t, count(*)::int AS c FROM designs
    UNION ALL SELECT 'concept_listings', count(*)::int FROM concept_listings
  `;
  console.log("Supabase counts:", counts);
  console.log("Migration complete.");
} finally {
  sqlite.close();
  await sql.end({ timeout: 5 });
}
