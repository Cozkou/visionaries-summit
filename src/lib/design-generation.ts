import { generateConceptsWithAi } from "@/lib/ai/generate-concepts";
import { saveDesigns } from "@/lib/db/designs-repository";
import { attachRemoteImages } from "@/lib/images/remote-images";
import type { Design, GenerationInputs } from "@/types";

export async function runDesignGeneration(
  inputs: GenerationInputs
): Promise<Design[]> {
  const concepts = await generateConceptsWithAi(inputs);
  const designs = attachRemoteImages(concepts, inputs);
  saveDesigns(designs, inputs);
  return designs;
}
