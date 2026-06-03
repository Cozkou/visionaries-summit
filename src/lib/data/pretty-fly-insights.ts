import { buildDataDrivenInsights } from "@/lib/data/sales-analytics";
import type { GenerationInputs, SourcedInsight } from "@/types";

/** @deprecated Use buildDataDrivenInsights from sales-analytics */
export function getHistoricalInsights(
  inputs: GenerationInputs
): SourcedInsight[] {
  return buildDataDrivenInsights(inputs);
}
