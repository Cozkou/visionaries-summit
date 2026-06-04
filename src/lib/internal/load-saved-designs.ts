import { listStoredDesigns } from "@/lib/db/designs-repository";
import type { Design } from "@/types";

export async function loadSavedDesignsForStaff(limit = 100): Promise<{
  designs: Design[];
  error: string | null;
}> {
  try {
    const designs = await listStoredDesigns(limit);
    return { designs, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load saved concepts";
    return { designs: [], error: message };
  }
}
