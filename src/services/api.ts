import type {
  AnalysisData,
  Design,
  DesignDemand,
  DesignListingSummary,
  GenerationInputs,
} from "@/types";
import type {
  DashboardSnapshot,
  InventoryProduct,
  InventoryRow,
  MarketingRow,
  SupportRow,
} from "@/types/dashboard";
import type { ChinaMarketResponse } from "@/types/china-market";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("pf_api_token") ??
        process.env.NEXT_PUBLIC_INTERNAL_API_KEY
      : process.env.INTERNAL_API_KEY ?? process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export async function verifyStaffPassword(password: string): Promise<string> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await parseJson<{ token: string }>(res);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("pf_api_token", data.token);
  }
  return data.token;
}

export async function generateDesigns(
  inputs: GenerationInputs
): Promise<Design[]> {
  const res = await fetch("/api/designs/generate", {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(inputs),
  });
  return parseJson<Design[]>(res);
}

/** Saved concepts from the app database (not a new CSV generation). */
export async function listSavedDesigns(limit = 100): Promise<Design[]> {
  const res = await fetch(`/api/designs?limit=${limit}`, {
    headers: apiHeaders(),
  });
  const data = await parseJson<{ designs: Design[] }>(res);
  return data.designs;
}

export async function getDesignById(designId: string): Promise<Design | null> {
  const res = await fetch(`/api/designs/${designId}`, {
    headers: apiHeaders(),
  });
  if (res.status === 404) return null;
  return parseJson<Design>(res);
}

export async function getDesignAnalysis(
  designId: string
): Promise<AnalysisData> {
  const res = await fetch(`/api/designs/${designId}/analysis`, {
    headers: apiHeaders(),
  });
  return parseJson<AnalysisData>(res);
}

/* ─── Publish to site / live demand ──────────────────────────────────────── */

export interface PublishDesignResponse {
  listing: DesignListingSummary & {
    designId: string;
    wooTotalSales: number;
    lastSyncedAt: number | null;
  };
  reused: boolean;
}

export async function publishDesign(
  designId: string,
  options: { acceptingPreorders?: boolean } = {}
): Promise<PublishDesignResponse> {
  const res = await fetch(`/api/designs/${designId}/publish`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(options),
  });
  return parseJson<PublishDesignResponse>(res);
}

export async function unpublishDesign(
  designId: string
): Promise<PublishDesignResponse> {
  const res = await fetch(`/api/designs/${designId}/publish`, {
    method: "DELETE",
    headers: apiHeaders(),
  });
  return parseJson<PublishDesignResponse>(res);
}

export async function getDesignDemand(
  designId: string
): Promise<DesignDemand | null> {
  const res = await fetch(`/api/designs/${designId}/demand`, {
    headers: apiHeaders(),
    cache: "no-store",
  });
  const data = await parseJson<DesignDemand | { listing: null; counts: null }>(
    res
  );
  if (!data || !("listing" in data) || data.listing === null) return null;
  return data as DesignDemand;
}

/* ─── Control tower (dashboard) ───────────────────────────────────────────── */

export type ControlTowerOverview = Pick<
  DashboardSnapshot,
  "brand" | "snapshotDate" | "subtitle" | "hero" | "metrics" | "insights" | "footer"
>;

export interface ControlTowerActionsResponse {
  actions: DashboardSnapshot["actions"];
  insights: DashboardSnapshot["insights"];
  marketingReallocation: DashboardSnapshot["marketing"]["reallocation"];
}

export interface InventoryResponse {
  summary: DashboardSnapshot["inventory"]["summary"];
  filters: Record<string, unknown>;
  rows: InventoryRow[];
  topProducts: InventoryProduct[];
}

export interface MarketingResponse {
  summary: DashboardSnapshot["marketing"]["summary"];
  reallocation: DashboardSnapshot["marketing"]["reallocation"];
  filters: Record<string, unknown>;
  rows: MarketingRow[];
}

export interface SupportResponse {
  summary: DashboardSnapshot["support"]["summary"];
  filters: Record<string, unknown>;
  rows: SupportRow[];
}

export async function getControlTowerOverview(): Promise<ControlTowerOverview> {
  const res = await fetch("/api/control-tower/overview", {
    headers: apiHeaders(),
  });
  return parseJson<ControlTowerOverview>(res);
}

export async function getControlTowerActions(): Promise<ControlTowerActionsResponse> {
  const res = await fetch("/api/control-tower/actions", {
    headers: apiHeaders(),
  });
  return parseJson<ControlTowerActionsResponse>(res);
}

export async function getInventoryRecommendations(
  params?: { limit?: number }
): Promise<InventoryResponse> {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await fetch(
    `/api/control-tower/inventory${qs ? `?${qs}` : ""}`,
    { headers: apiHeaders() }
  );
  return parseJson<InventoryResponse>(res);
}

export async function getMarketingTriage(
  params?: { limit?: number }
): Promise<MarketingResponse> {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await fetch(
    `/api/control-tower/marketing${qs ? `?${qs}` : ""}`,
    { headers: apiHeaders() }
  );
  return parseJson<MarketingResponse>(res);
}

export async function getSupportAutomation(
  params?: { limit?: number }
): Promise<SupportResponse> {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await fetch(
    `/api/control-tower/support${qs ? `?${qs}` : ""}`,
    { headers: apiHeaders() }
  );
  return parseJson<SupportResponse>(res);
}

export async function getChinaMarket(): Promise<ChinaMarketResponse> {
  const res = await fetch("/api/china-market", {
    headers: apiHeaders(),
    cache: "no-store",
  });
  return parseJson<ChinaMarketResponse>(res);
}
