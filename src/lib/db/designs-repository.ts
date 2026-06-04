import { assertDatabaseConfigured, getAppStorage } from "@/lib/db/database";
import { getDb } from "@/lib/db/client";
import { ensurePostgresSchema } from "@/lib/db/ensure-postgres-schema";
import { getSql } from "@/lib/db/sql";
import type { Design, GenerationInputs } from "@/types";

export interface StoredDesign {
  design: Design;
  inputs: GenerationInputs;
  createdAt: number;
}

interface DesignRow {
  id: string;
  name: string;
  description: string;
  image_url: string;
  retail_price: number;
  source_product_id: string | null;
  product_type: string;
  target_audience: string;
  business_goal: string;
  style_prompt: string | null;
  created_at: number;
}

function rowToStored(row: DesignRow): StoredDesign {
  return {
    design: {
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      retailPrice: Number(row.retail_price),
      sourceProductId: row.source_product_id ?? undefined,
    },
    inputs: {
      productType: row.product_type as GenerationInputs["productType"],
      targetAudience: row.target_audience as GenerationInputs["targetAudience"],
      businessGoal: row.business_goal as GenerationInputs["businessGoal"],
      stylePrompt: row.style_prompt ?? undefined,
    },
    createdAt: Number(row.created_at),
  };
}

const insertStmt = () =>
  getDb().prepare(`
    INSERT INTO designs (
      id, name, description, image_url, retail_price, source_product_id,
      product_type, target_audience, business_goal, style_prompt, created_at
    ) VALUES (
      @id, @name, @description, @image_url, @retail_price, @source_product_id,
      @product_type, @target_audience, @business_goal, @style_prompt, @created_at
    )
  `);

const selectByIdStmt = () =>
  getDb().prepare(`SELECT * FROM designs WHERE id = ?`);

async function saveDesignsPostgres(
  designs: Design[],
  inputs: GenerationInputs
): Promise<void> {
  await ensurePostgresSchema();
  const sql = getSql();
  const createdAt = Date.now();

  await sql.begin(async (tx) => {
    for (const design of designs) {
      await tx`
        INSERT INTO designs (
          id, name, description, image_url, retail_price, source_product_id,
          product_type, target_audience, business_goal, style_prompt, created_at
        ) VALUES (
          ${design.id},
          ${design.name},
          ${design.description},
          ${design.imageUrl ?? ""},
          ${design.retailPrice},
          ${design.sourceProductId ?? null},
          ${inputs.productType},
          ${inputs.targetAudience},
          ${inputs.businessGoal},
          ${inputs.stylePrompt ?? null},
          ${createdAt}
        )
      `;
    }
  });
}

async function getStoredDesignPostgres(
  id: string
): Promise<StoredDesign | undefined> {
  await ensurePostgresSchema();
  const rows = await getSql()`
    SELECT * FROM designs WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as DesignRow | undefined;
  return row ? rowToStored(row) : undefined;
}

export async function saveDesigns(
  designs: Design[],
  inputs: GenerationInputs
): Promise<void> {
  assertDatabaseConfigured();
  if (getAppStorage() === "postgres") {
    await saveDesignsPostgres(designs, inputs);
    return;
  }

  const createdAt = Date.now();
  const insert = insertStmt();
  const insertMany = getDb().transaction((rows: Design[]) => {
    for (const design of rows) {
      insert.run({
        id: design.id,
        name: design.name,
        description: design.description,
        image_url: design.imageUrl ?? "",
        retail_price: design.retailPrice,
        source_product_id: design.sourceProductId ?? null,
        product_type: inputs.productType,
        target_audience: inputs.targetAudience,
        business_goal: inputs.businessGoal,
        style_prompt: inputs.stylePrompt ?? null,
        created_at: createdAt,
      });
    }
  });
  insertMany(designs);
}

export async function getStoredDesign(
  id: string
): Promise<StoredDesign | undefined> {
  assertDatabaseConfigured();
  if (getAppStorage() === "postgres") {
    return getStoredDesignPostgres(id);
  }
  const row = selectByIdStmt().get(id) as DesignRow | undefined;
  return row ? rowToStored(row) : undefined;
}

export async function getDesignById(id: string): Promise<Design | undefined> {
  return (await getStoredDesign(id))?.design;
}

/** Most recent concepts saved from CSV-backed generation (Postgres or SQLite). */
export async function listStoredDesigns(limit = 100): Promise<Design[]> {
  assertDatabaseConfigured();
  if (getAppStorage() === "postgres") {
    await ensurePostgresSchema();
    const rows = await getSql()`
      SELECT * FROM designs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return (rows as unknown as DesignRow[]).map((row) => rowToStored(row).design);
  }

  const rows = getDb()
    .prepare(
      `SELECT * FROM designs ORDER BY created_at DESC LIMIT ?`
    )
    .all(limit) as DesignRow[];
  return rows.map((row) => rowToStored(row).design);
}
