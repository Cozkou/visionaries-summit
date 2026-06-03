import { mockAnalysis } from "@/data/mockAnalysis";
import { mockDesigns } from "@/data/mockDesigns";
import type { AnalysisData, Design, GenerationInputs } from "@/types";

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateDesigns(
  inputs: GenerationInputs
): Promise<Design[]> {
  // TODO: Replace with POST /api/designs/generate using `inputs`
  void inputs;
  await delay(MOCK_DELAY_MS);
  return mockDesigns;
}

export async function getDesignAnalysis(
  designId: string
): Promise<AnalysisData> {
  // TODO: Replace with GET /api/designs/:id/analysis for `designId`
  void designId;
  await delay(MOCK_DELAY_MS);
  return mockAnalysis;
}
