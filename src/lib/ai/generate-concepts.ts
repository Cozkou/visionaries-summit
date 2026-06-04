import { generateDesignImage } from "@/lib/ai/generate-design-image";
import { createDesignConcepts } from "@/lib/generate-designs";
import type { Design, GenerationInputs } from "@/types";

/** One concept at a time, anchored to CSV bestsellers and rendered via image API. */
export async function generateConceptsWithAi(
  inputs: GenerationInputs
): Promise<Design[]> {
  const [design] = createDesignConcepts(inputs);
  if (!design) {
    return [];
  }

  const imageUrl = await generateDesignImage(design, inputs);
  return [{ ...design, imageUrl }];
}
