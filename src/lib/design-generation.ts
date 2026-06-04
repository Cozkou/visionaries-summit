import fs from "fs";
import path from "path";

import { generateConceptsWithAi } from "@/lib/ai/generate-concepts";
import { ensureConceptImagesForDesigns } from "@/lib/concept-image";
import { getDesignById, saveDesigns } from "@/lib/db/designs-repository";
import type { Design, GenerationInputs } from "@/types";

const REQUIRED_CSV_FILES = [
  "products.csv",
  "line_items.csv",
  "variants.csv",
  "refunds.csv",
  "po_line_items.csv",
  "purchase_orders.csv",
  "suppliers.csv",
] as const;

function assertDataPackPresent(): void {
  const dataDir = path.join(
    process.cwd(),
    "hackathon_assets/pretty_fly_data_pack/data"
  );
  const missing = REQUIRED_CSV_FILES.filter(
    (file) => !fs.existsSync(path.join(dataDir, file))
  );
  if (missing.length > 0) {
    throw new Error(
      `Pretty Fly data pack incomplete. Missing: ${missing.join(", ")}`
    );
  }
}

export async function runDesignGeneration(
  inputs: GenerationInputs
): Promise<Design[]> {
  assertDataPackPresent();
  const designs = await generateConceptsWithAi(inputs);
  if (designs.length === 0) {
    throw new Error(
      "No matching products in the data pack for this product type and audience."
    );
  }
  await saveDesigns(designs, inputs);
  await ensureConceptImagesForDesigns(designs.map((d) => d.id));

  const refreshed = await Promise.all(designs.map((d) => getDesignById(d.id)));
  return refreshed.map((d, i) => d ?? designs[i]!);
}
