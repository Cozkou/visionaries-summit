import { getDb } from "@/lib/db/client";
import { getStoredDesign } from "@/lib/db/designs-repository";
import type { ListingStatus } from "@/lib/commerce/types";
import type { Design, GenerationInputs } from "@/types";

export interface ConceptListing {
  id: string;
  designId: string;
  wooProductId: number | null;
  slug: string;
  status: ListingStatus;
  imageUrl: string | null;
  storefrontUrl: string | null;
  publishedAt: number;
  publishedBy: string | null;
  wooTotalSales: number;
  lastSyncedAt: number | null;
}

export interface DemandCounts {
  wishlistCount: number;
  preorderCount: number;
  preorderUnits: number;
  pageViews7d: number;
  pageViewsTotal: number;
  wooTotalSales: number;
}

export interface ListingWithDesign {
  listing: ConceptListing;
  design: Design;
  inputs: GenerationInputs;
}

interface ListingRow {
  id: string;
  design_id: string;
  woo_product_id: number | null;
  slug: string;
  status: string;
  image_url: string | null;
  storefront_url: string | null;
  published_at: number;
  published_by: string | null;
  woo_total_sales: number;
  last_synced_at: number | null;
}

function rowToListing(row: ListingRow): ConceptListing {
  return {
    id: row.id,
    designId: row.design_id,
    wooProductId: row.woo_product_id,
    slug: row.slug,
    status: row.status as ListingStatus,
    imageUrl: row.image_url,
    storefrontUrl: row.storefront_url,
    publishedAt: row.published_at,
    publishedBy: row.published_by,
    wooTotalSales: row.woo_total_sales,
    lastSyncedAt: row.last_synced_at,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "concept";
}

export function generateUniqueSlug(seed: string): string {
  const base = slugify(seed);
  const db = getDb();
  const existsStmt = db.prepare(
    `SELECT 1 FROM concept_listings WHERE slug = ? LIMIT 1`
  );
  let candidate = base;
  let i = 1;
  while (existsStmt.get(candidate)) {
    i += 1;
    candidate = `${base}-${i}`;
    if (i > 50) {
      candidate = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }
  return candidate;
}

export function getListingByDesignId(designId: string): ConceptListing | undefined {
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE design_id = ?`)
    .get(designId) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export function getListingBySlug(slug: string): ConceptListing | undefined {
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE slug = ?`)
    .get(slug) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export function getListingByWooProductId(wooProductId: number): ConceptListing | undefined {
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE woo_product_id = ?`)
    .get(wooProductId) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export interface InsertListingInput {
  designId: string;
  wooProductId: number | null;
  slug: string;
  status: ListingStatus;
  imageUrl?: string | null;
  storefrontUrl?: string | null;
  publishedBy?: string | null;
}

export function insertListing(input: InsertListingInput): ConceptListing {
  const id = crypto.randomUUID();
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO concept_listings (
        id, design_id, woo_product_id, slug, status, image_url, storefront_url,
        published_at, published_by, woo_total_sales, last_synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
    )
    .run(
      id,
      input.designId,
      input.wooProductId,
      input.slug,
      input.status,
      input.imageUrl ?? null,
      input.storefrontUrl ?? null,
      now,
      input.publishedBy ?? null,
      now
    );

  const created = getListingByDesignId(input.designId);
  if (!created) {
    throw new Error("Failed to insert concept_listings row");
  }
  return created;
}

export interface UpdateListingInput {
  status?: ListingStatus;
  wooProductId?: number | null;
  storefrontUrl?: string | null;
  imageUrl?: string | null;
  wooTotalSales?: number;
}

export function updateListing(
  listingId: string,
  patch: UpdateListingInput
): ConceptListing | undefined {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.status !== undefined) {
    sets.push("status = ?");
    params.push(patch.status);
  }
  if (patch.wooProductId !== undefined) {
    sets.push("woo_product_id = ?");
    params.push(patch.wooProductId);
  }
  if (patch.storefrontUrl !== undefined) {
    sets.push("storefront_url = ?");
    params.push(patch.storefrontUrl);
  }
  if (patch.imageUrl !== undefined) {
    sets.push("image_url = ?");
    params.push(patch.imageUrl);
  }
  if (patch.wooTotalSales !== undefined) {
    sets.push("woo_total_sales = ?");
    params.push(patch.wooTotalSales);
  }
  sets.push("last_synced_at = ?");
  params.push(Date.now());

  if (sets.length === 0) return getListingById(listingId);

  params.push(listingId);
  getDb()
    .prepare(`UPDATE concept_listings SET ${sets.join(", ")} WHERE id = ?`)
    .run(...params);
  return getListingById(listingId);
}

export function getListingById(listingId: string): ConceptListing | undefined {
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE id = ?`)
    .get(listingId) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export function listPublished(limit = 50): ConceptListing[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM concept_listings
       WHERE status IN ('published','coming_soon')
       ORDER BY published_at DESC
       LIMIT ?`
    )
    .all(limit) as ListingRow[];
  return rows.map(rowToListing);
}

export function getListingWithDesign(
  listing: ConceptListing
): ListingWithDesign | undefined {
  const stored = getStoredDesign(listing.designId);
  if (!stored) return undefined;
  return { listing, design: stored.design, inputs: stored.inputs };
}

export function addWishlistSignup(listingId: string, email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;
  try {
    getDb()
      .prepare(
        `INSERT INTO wishlist_signups (id, listing_id, email, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .run(crypto.randomUUID(), listingId, trimmed, Date.now());
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE")) return false;
    throw err;
  }
}

export interface AddPreorderInput {
  listingId: string;
  email: string;
  size?: string | null;
  quantity?: number;
  wooOrderId?: number | null;
}

export function addPreorder(input: AddPreorderInput): string {
  const id = crypto.randomUUID();
  getDb()
    .prepare(
      `INSERT INTO preorders (
        id, listing_id, email, size, quantity, woo_order_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.listingId,
      input.email.trim().toLowerCase(),
      input.size ?? null,
      Math.max(1, input.quantity ?? 1),
      input.wooOrderId ?? null,
      Date.now()
    );
  return id;
}

function todayIsoDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export function incrementPageView(listingId: string, by = 1): void {
  const day = todayIsoDay();
  getDb()
    .prepare(
      `INSERT INTO page_views (listing_id, day, count)
       VALUES (?, ?, ?)
       ON CONFLICT(listing_id, day)
       DO UPDATE SET count = count + excluded.count`
    )
    .run(listingId, day, by);
}

export function getDemandCounts(listingId: string): DemandCounts {
  const db = getDb();

  const wishlist = (db
    .prepare(`SELECT COUNT(*) as c FROM wishlist_signups WHERE listing_id = ?`)
    .get(listingId) as { c: number }).c;

  const preorderAgg = db
    .prepare(
      `SELECT COUNT(*) as c, COALESCE(SUM(quantity),0) as units
       FROM preorders WHERE listing_id = ?`
    )
    .get(listingId) as { c: number; units: number };

  const pageViewsTotal = (db
    .prepare(`SELECT COALESCE(SUM(count),0) as c FROM page_views WHERE listing_id = ?`)
    .get(listingId) as { c: number }).c;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const pageViews7d = (db
    .prepare(
      `SELECT COALESCE(SUM(count),0) as c
       FROM page_views WHERE listing_id = ? AND day >= ?`
    )
    .get(listingId, sevenDaysAgo) as { c: number }).c;

  const listing = getListingById(listingId);

  return {
    wishlistCount: wishlist,
    preorderCount: preorderAgg.c,
    preorderUnits: preorderAgg.units,
    pageViews7d,
    pageViewsTotal,
    wooTotalSales: listing?.wooTotalSales ?? 0,
  };
}
