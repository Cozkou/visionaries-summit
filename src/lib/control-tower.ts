import { getBuiltControlTowerSnapshot } from "@/lib/data/control-tower-build";
import type {
  InventoryProduct,
  InventoryRow,
  MarketingRow,
  SupportRow,
} from "@/types/dashboard";

function snapshot() {
  return getBuiltControlTowerSnapshot();
}

export type MarketingAction = MarketingRow["action"];

export interface InventoryQuery {
  collection?: string;
  limit?: number;
  productType?: string;
}

export interface MarketingQuery {
  action?: MarketingAction;
  limit?: number;
}

export interface SupportQuery {
  category?: string;
  limit?: number;
}

function clampLimit(limit: number | undefined, fallback: number, max: number) {
  if (!limit || Number.isNaN(limit) || limit < 1) {
    return fallback;
  }

  return Math.min(limit, max);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function sortInventoryRows(rows: InventoryRow[]) {
  return [...rows].sort((left, right) => {
    if (right.gross_profit_gbp !== left.gross_profit_gbp) {
      return right.gross_profit_gbp - left.gross_profit_gbp;
    }

    return left.sku.localeCompare(right.sku);
  });
}

function sortInventoryProducts(rows: InventoryProduct[]) {
  return [...rows].sort((left, right) => {
    if (right.gross_profit_gbp !== left.gross_profit_gbp) {
      return right.gross_profit_gbp - left.gross_profit_gbp;
    }

    return left.title.localeCompare(right.title);
  });
}

function sortMarketingRows(rows: MarketingRow[]) {
  const actionRank: Record<MarketingAction, number> = {
    Pause: 0,
    Trim: 1,
    Hold: 2,
    Scale: 3,
  };

  return [...rows].sort((left, right) => {
    if (actionRank[left.action] !== actionRank[right.action]) {
      return actionRank[left.action] - actionRank[right.action];
    }

    return right.spend - left.spend;
  });
}

function sortSupportRows(rows: SupportRow[]) {
  return [...rows].sort(
    (left, right) => right.hoursSavedAt25Pct - left.hoursSavedAt25Pct,
  );
}

export function getControlTowerSnapshot() {
  return snapshot();
}

export function getControlTowerOverview() {
  const s = snapshot();
  return {
    brand: s.brand,
    snapshotDate: s.snapshotDate,
    subtitle: s.subtitle,
    hero: s.hero,
    metrics: s.metrics,
    insights: s.insights,
    footer: s.footer,
  };
}

export function getControlTowerActions() {
  const s = snapshot();
  return {
    actions: s.actions,
    insights: s.insights,
    marketingReallocation: s.marketing.reallocation,
  };
}

export function getInventoryRecommendations(query: InventoryQuery = {}) {
  const collection = query.collection ? normalize(query.collection) : undefined;
  const productType = query.productType ? normalize(query.productType) : undefined;
  const limit = clampLimit(query.limit, 12, 50);

  const s = snapshot();
  const filteredRows = sortInventoryRows(s.inventory.rows).filter((row) => {
    const matchesCollection = collection
      ? normalize(row.collection) === collection
      : true;
    const matchesProductType = productType
      ? normalize(row.sku.split("-")[1] ?? "") === productType ||
        normalize(row.title).includes(productType)
      : true;

    return matchesCollection && matchesProductType;
  });

  const filteredProducts = sortInventoryProducts(s.inventory.topProducts).filter(
    (row) => {
      const matchesCollection = collection
        ? normalize(row.collection) === collection
        : true;
      const matchesProductType = productType
        ? normalize(row.product_type) === productType
        : true;

      return matchesCollection && matchesProductType;
    },
  );

  return {
    summary: s.inventory.summary,
    filters: {
      collection: query.collection ?? null,
      productType: query.productType ?? null,
      availableCollections: [...new Set(s.inventory.rows.map((row) => row.collection))],
      availableProductTypes: [
        ...new Set(s.inventory.topProducts.map((row) => row.product_type)),
      ],
      limit,
    },
    rows: filteredRows.slice(0, limit),
    topProducts: filteredProducts.slice(0, Math.min(limit, 12)),
  };
}

export function getMarketingTriage(query: MarketingQuery = {}) {
  const limit = clampLimit(query.limit, 12, 50);
  const action = query.action;

  const s = snapshot();
  const filteredRows = sortMarketingRows(s.marketing.rows).filter((row) =>
    action ? row.action === action : true,
  );

  return {
    summary: s.marketing.summary,
    reallocation: s.marketing.reallocation,
    filters: {
      action: action ?? null,
      availableActions: ["Pause", "Trim", "Hold", "Scale"] as MarketingAction[],
      limit,
    },
    rows: filteredRows.slice(0, limit),
  };
}

export function getSupportAutomation(query: SupportQuery = {}) {
  const limit = clampLimit(query.limit, 6, 25);
  const category = query.category ? normalize(query.category) : undefined;

  const s = snapshot();
  const filteredRows = sortSupportRows(s.support.rows).filter((row) =>
    category ? normalize(row.category) === category : true,
  );

  return {
    summary: s.support.summary,
    filters: {
      category: query.category ?? null,
      availableCategories: s.support.rows.map((row) => row.category),
      limit,
    },
    rows: filteredRows.slice(0, limit),
  };
}
