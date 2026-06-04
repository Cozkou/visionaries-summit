import { getDb } from "@/lib/db/client";
import { getStoredDesign } from "@/lib/db/designs-repository";
import { ensurePostgresSchema } from "@/lib/db/ensure-postgres-schema";
import { getSql, isPostgresEnabled } from "@/lib/db/sql";
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
  /** Epoch ms — when the early-access window closes. */
  releaseAt: number | null;
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
  release_at: number | null;
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
    publishedAt: Number(row.published_at),
    publishedBy: row.published_by,
    wooTotalSales: Number(row.woo_total_sales),
    lastSyncedAt: row.last_synced_at != null ? Number(row.last_synced_at) : null,
    releaseAt: row.release_at != null ? Number(row.release_at) : null,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "concept";
}

const DEFAULT_RELEASE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

async function pgEnsure(): Promise<ReturnType<typeof getSql>> {
  await ensurePostgresSchema();
  return getSql();
}

async function pgSlugExists(slug: string): Promise<boolean> {
  const sql = await pgEnsure();
  const rows = await sql`
    SELECT 1 FROM concept_listings WHERE slug = ${slug} LIMIT 1
  `;
  return rows.length > 0;
}

export async function generateUniqueSlug(seed: string): Promise<string> {
  const base = slugify(seed);
  let candidate = base;
  let i = 1;

  while (true) {
    const exists = isPostgresEnabled()
      ? await pgSlugExists(candidate)
      : Boolean(
          getDb()
            .prepare(`SELECT 1 FROM concept_listings WHERE slug = ? LIMIT 1`)
            .get(candidate)
        );
    if (!exists) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
    if (i > 50) {
      return `${base}-${Date.now().toString(36)}`;
    }
  }
}

export async function getListingByDesignId(
  designId: string
): Promise<ConceptListing | undefined> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const rows = await sql`
      SELECT * FROM concept_listings WHERE design_id = ${designId} LIMIT 1
    `;
    const row = rows[0] as ListingRow | undefined;
    return row ? rowToListing(row) : undefined;
  }
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE design_id = ?`)
    .get(designId) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export async function getListingBySlug(
  slug: string
): Promise<ConceptListing | undefined> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const rows = await sql`
      SELECT * FROM concept_listings WHERE slug = ${slug} LIMIT 1
    `;
    const row = rows[0] as ListingRow | undefined;
    return row ? rowToListing(row) : undefined;
  }
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE slug = ?`)
    .get(slug) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export async function getListingByWooProductId(
  wooProductId: number
): Promise<ConceptListing | undefined> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const rows = await sql`
      SELECT * FROM concept_listings WHERE woo_product_id = ${wooProductId} LIMIT 1
    `;
    const row = rows[0] as ListingRow | undefined;
    return row ? rowToListing(row) : undefined;
  }
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
  /** Defaults to publishedAt + 7 days. */
  releaseAt?: number | null;
}

export async function insertListing(
  input: InsertListingInput
): Promise<ConceptListing> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const releaseAt = input.releaseAt ?? now + DEFAULT_RELEASE_WINDOW_MS;

  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    await sql`
      INSERT INTO concept_listings (
        id, design_id, woo_product_id, slug, status, image_url, storefront_url,
        published_at, published_by, woo_total_sales, last_synced_at, release_at
      ) VALUES (
        ${id},
        ${input.designId},
        ${input.wooProductId},
        ${input.slug},
        ${input.status},
        ${input.imageUrl ?? null},
        ${input.storefrontUrl ?? null},
        ${now},
        ${input.publishedBy ?? null},
        0,
        ${now},
        ${releaseAt}
      )
    `;
  } else {
    getDb()
      .prepare(
        `INSERT INTO concept_listings (
          id, design_id, woo_product_id, slug, status, image_url, storefront_url,
          published_at, published_by, woo_total_sales, last_synced_at, release_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
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
        now,
        releaseAt
      );
  }

  const created = await getListingByDesignId(input.designId);
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
  releaseAt?: number | null;
}

export async function updateListing(
  listingId: string,
  patch: UpdateListingInput
): Promise<ConceptListing | undefined> {
  const syncedAt = Date.now();
  const hasPatch =
    patch.status !== undefined ||
    patch.wooProductId !== undefined ||
    patch.storefrontUrl !== undefined ||
    patch.imageUrl !== undefined ||
    patch.wooTotalSales !== undefined ||
    patch.releaseAt !== undefined;

  if (!hasPatch) {
    return getListingById(listingId);
  }

  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const existing = await getListingById(listingId);
    if (!existing) return undefined;

    await sql`
      UPDATE concept_listings SET
        status = ${patch.status ?? existing.status},
        woo_product_id = ${patch.wooProductId !== undefined ? patch.wooProductId : existing.wooProductId},
        storefront_url = ${patch.storefrontUrl !== undefined ? patch.storefrontUrl : existing.storefrontUrl},
        image_url = ${patch.imageUrl !== undefined ? patch.imageUrl : existing.imageUrl},
        woo_total_sales = ${patch.wooTotalSales !== undefined ? patch.wooTotalSales : existing.wooTotalSales},
        release_at = ${patch.releaseAt !== undefined ? patch.releaseAt : existing.releaseAt},
        last_synced_at = ${syncedAt}
      WHERE id = ${listingId}
    `;
    return getListingById(listingId);
  }

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
  if (patch.releaseAt !== undefined) {
    sets.push("release_at = ?");
    params.push(patch.releaseAt);
  }
  sets.push("last_synced_at = ?");
  params.push(syncedAt);
  params.push(listingId);
  getDb()
    .prepare(`UPDATE concept_listings SET ${sets.join(", ")} WHERE id = ?`)
    .run(...params);
  return getListingById(listingId);
}

export async function getListingById(
  listingId: string
): Promise<ConceptListing | undefined> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const rows = await sql`
      SELECT * FROM concept_listings WHERE id = ${listingId} LIMIT 1
    `;
    const row = rows[0] as ListingRow | undefined;
    return row ? rowToListing(row) : undefined;
  }
  const row = getDb()
    .prepare(`SELECT * FROM concept_listings WHERE id = ?`)
    .get(listingId) as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export async function listPublished(limit = 50): Promise<ConceptListing[]> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const rows = await sql`
      SELECT * FROM concept_listings
      WHERE status IN ('published', 'coming_soon')
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return (rows as unknown as ListingRow[]).map(rowToListing);
  }
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

export async function getLatestPublishedListing(): Promise<
  ConceptListing | undefined
> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const rows = await sql`
      SELECT * FROM concept_listings
      WHERE status IN ('published', 'coming_soon')
      ORDER BY published_at DESC
      LIMIT 1
    `;
    const row = rows[0] as ListingRow | undefined;
    return row ? rowToListing(row) : undefined;
  }
  const row = getDb()
    .prepare(
      `SELECT * FROM concept_listings
       WHERE status IN ('published','coming_soon')
       ORDER BY published_at DESC
       LIMIT 1`
    )
    .get() as ListingRow | undefined;
  return row ? rowToListing(row) : undefined;
}

export async function getListingWithDesign(
  listing: ConceptListing
): Promise<ListingWithDesign | undefined> {
  const stored = await getStoredDesign(listing.designId);
  if (!stored) return undefined;
  return { listing, design: stored.design, inputs: stored.inputs };
}

export async function addWishlistSignup(
  listingId: string,
  email: string
): Promise<boolean> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;

  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    try {
      await sql`
        INSERT INTO wishlist_signups (id, listing_id, email, created_at)
        VALUES (${crypto.randomUUID()}, ${listingId}, ${trimmed}, ${Date.now()})
      `;
      return true;
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (code === "23505") return false;
      throw err;
    }
  }

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

export async function addPreorder(input: AddPreorderInput): Promise<string> {
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const email = input.email.trim().toLowerCase();
  const quantity = Math.max(1, input.quantity ?? 1);

  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    await sql`
      INSERT INTO preorders (
        id, listing_id, email, size, quantity, woo_order_id, created_at
      ) VALUES (
        ${id},
        ${input.listingId},
        ${email},
        ${input.size ?? null},
        ${quantity},
        ${input.wooOrderId ?? null},
        ${createdAt}
      )
    `;
    return id;
  }

  getDb()
    .prepare(
      `INSERT INTO preorders (
        id, listing_id, email, size, quantity, woo_order_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.listingId,
      email,
      input.size ?? null,
      quantity,
      input.wooOrderId ?? null,
      createdAt
    );
  return id;
}

function todayIsoDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function incrementPageView(
  listingId: string,
  by = 1
): Promise<void> {
  const day = todayIsoDay();

  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    await sql`
      INSERT INTO page_views (listing_id, day, count)
      VALUES (${listingId}, ${day}, ${by})
      ON CONFLICT (listing_id, day)
      DO UPDATE SET count = page_views.count + ${by}
    `;
    return;
  }

  getDb()
    .prepare(
      `INSERT INTO page_views (listing_id, day, count)
       VALUES (?, ?, ?)
       ON CONFLICT(listing_id, day)
       DO UPDATE SET count = count + excluded.count`
    )
    .run(listingId, day, by);
}

export async function getDemandCounts(
  listingId: string
): Promise<DemandCounts> {
  if (isPostgresEnabled()) {
    const sql = await pgEnsure();
    const [wishlistRows, preorderRows, totalRows, weekRows, listing] =
      await Promise.all([
        sql`
          SELECT COUNT(*)::int AS c FROM wishlist_signups WHERE listing_id = ${listingId}
        `,
        sql`
          SELECT COUNT(*)::int AS c, COALESCE(SUM(quantity), 0)::int AS units
          FROM preorders WHERE listing_id = ${listingId}
        `,
        sql`
          SELECT COALESCE(SUM(count), 0)::int AS c
          FROM page_views WHERE listing_id = ${listingId}
        `,
        sql`
          SELECT COALESCE(SUM(count), 0)::int AS c
          FROM page_views
          WHERE listing_id = ${listingId}
            AND day >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
        `,
        getListingById(listingId),
      ]);

    const wishlist = Number(wishlistRows[0]?.c ?? 0);
    const preorderAgg = preorderRows[0] as { c: number; units: number };
    return {
      wishlistCount: wishlist,
      preorderCount: Number(preorderAgg?.c ?? 0),
      preorderUnits: Number(preorderAgg?.units ?? 0),
      pageViews7d: Number(weekRows[0]?.c ?? 0),
      pageViewsTotal: Number(totalRows[0]?.c ?? 0),
      wooTotalSales: listing?.wooTotalSales ?? 0,
    };
  }

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

  const listing = await getListingById(listingId);

  return {
    wishlistCount: wishlist,
    preorderCount: preorderAgg.c,
    preorderUnits: preorderAgg.units,
    pageViews7d,
    pageViewsTotal,
    wooTotalSales: listing?.wooTotalSales ?? 0,
  };
}
