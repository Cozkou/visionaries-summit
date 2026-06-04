import { getDb } from "@/lib/db/client";
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
      retailPrice: row.retail_price,
      sourceProductId: row.source_product_id ?? undefined,
    },
    inputs: {
      productType: row.product_type as GenerationInputs["productType"],
      targetAudience: row.target_audience as GenerationInputs["targetAudience"],
      businessGoal: row.business_goal as GenerationInputs["businessGoal"],
      stylePrompt: row.style_prompt ?? undefined,
    },
    createdAt: row.created_at,
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

export function saveDesigns(
  designs: Design[],
  inputs: GenerationInputs
): void {
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

export function getStoredDesign(id: string): StoredDesign | undefined {
  const row = selectByIdStmt().get(id) as DesignRow | undefined;
  return row ? rowToStored(row) : undefined;
}

export function getDesignById(id: string): Design | undefined {
  return getStoredDesign(id)?.design;
}
