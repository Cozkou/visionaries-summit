import { createDesignConcepts } from "@/lib/generate-designs";
import type { Design, GenerationInputs } from "@/types";

/** Concepts are built only from Pretty Fly CSV bestsellers — no LLM. */
export async function generateConceptsWithAi(
  inputs: GenerationInputs
): Promise<Design[]> {
  return createDesignConcepts(inputs);
}
