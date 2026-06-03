import fs from "fs";
import path from "path";

import type {
  GenerationInputs,
  ProductType,
  SourcedInsight,
  TargetAudience,
} from "@/types";

const DATA_DIR = path.join(
  process.cwd(),
  "hackathon_assets/pretty_fly_data_pack/data"
);

export interface ProductSalesStat {
  productId: string;
  title: string;
  productType: string;
  genderSegment: string;
  collection: string;
  revenueGbp: number;
  unitsSold: number;
  refundCount: number;
  refundAmountGbp: number;
}

export interface CategorySalesSnapshot {
  productType: ProductType;
  targetAudience: TargetAudience;
  datasetTypes: string[];
  genderFilter: string;
  totalRevenueGbp: number;
  totalUnits: number;
  totalRefunds: number;
  refundRiskPercent: number;
  avgSellingPriceGbp: number;
  avgLandedCostGbp: number;
  avgLeadTimeDays: number;
  topProducts: ProductSalesStat[];
  dataDrivenPriceGbp: number;
}

const SALES_CACHE_VERSION = 5;

type SalesGlobal = typeof globalThis & {
  __prettyFlySalesCache?: {
    version: number;
    products: Map<string, Omit<ProductSalesStat, "revenueGbp" | "unitsSold" | "refundCount" | "refundAmountGbp">>;
    stats: Map<string, ProductSalesStat>;
    variantToProduct: Map<string, string>;
    loadedAt: number;
  };
};

const productTypeToDataset: Record<ProductType, string[]> = {
  Hoodie: ["Hoodie"],
  "T-Shirt": ["Tee"],
  Jacket: ["Outerwear", "Jacket"],
  Trainers: ["Trainer"],
  Cap: ["Cap"],
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

function readCsv(fileName: string): string[][] {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .trim()
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map(parseCsvLine);
}

function parseRefundVariants(raw: string): string[] {
  if (!raw?.trim() || raw.trim() === "[]") return [];
  try {
    const normalized = raw.trim().replace(/""/g, '"');
    const parsed = JSON.parse(normalized) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function genderForAudience(audience: TargetAudience): string {
  return audience === "Womenswear" ? "womens" : "mens";
}

function matchesAudience(
  genderSegment: string,
  audience: TargetAudience
): boolean {
  if (audience === "Menswear") {
    return genderSegment === "mens" || genderSegment === "unisex";
  }
  return genderSegment === "womens" || genderSegment === "unisex";
}

function loadSalesCache() {
  const g = globalThis as SalesGlobal;
  if (
    g.__prettyFlySalesCache &&
    g.__prettyFlySalesCache.version === SALES_CACHE_VERSION
  ) {
    return g.__prettyFlySalesCache;
  }

  const products = new Map<
    string,
    Omit<
      ProductSalesStat,
      "revenueGbp" | "unitsSold" | "refundCount" | "refundAmountGbp"
    >
  >();
  const stats = new Map<string, ProductSalesStat>();
  const variantToProduct = new Map<string, string>();

  for (const row of readCsv("products.csv")) {
    const [productId, title, , , productType, , collection, genderSegment] = row;
    if (!productId) continue;
    products.set(productId, {
      productId,
      title,
      productType,
      genderSegment,
      collection,
    });
    stats.set(productId, {
      productId,
      title,
      productType,
      genderSegment,
      collection,
      revenueGbp: 0,
      unitsSold: 0,
      refundCount: 0,
      refundAmountGbp: 0,
    });
  }

  for (const row of readCsv("variants.csv")) {
    const [variantId, productId] = row;
    if (variantId && productId) variantToProduct.set(variantId, productId);
  }

  const orderToProducts = new Map<string, string[]>();

  for (const row of readCsv("line_items.csv")) {
    const orderId = row[1];
    const productId = row[3];
    const quantity = Number(row[5]) || 0;
    const price = Number(row[6]) || 0;
    const discount = Number(row[7]) || 0;
    const lineRevenue = price * quantity - discount;

    if (orderId && productId) {
      const list = orderToProducts.get(orderId) ?? [];
      list.push(productId);
      orderToProducts.set(orderId, list);
    }

    const stat = stats.get(productId);
    if (!stat) continue;
    stat.revenueGbp += lineRevenue;
    stat.unitsSold += quantity;
  }

  for (const row of readCsv("refunds.csv")) {
    const orderId = row[1];
    const amount = Number(row[3]) || 0;
    const variantIds = parseRefundVariants(row[5] ?? "");

    const productIds = new Set<string>();
    for (const variantId of variantIds) {
      const productId = variantToProduct.get(variantId);
      if (productId) productIds.add(productId);
    }

    if (productIds.size === 0 && orderId) {
      for (const productId of orderToProducts.get(orderId) ?? []) {
        productIds.add(productId);
      }
    }

    const share =
      productIds.size > 0 ? amount / productIds.size : amount;

    for (const productId of productIds) {
      const stat = stats.get(productId);
      if (!stat) continue;
      stat.refundCount += 1;
      stat.refundAmountGbp += share;
    }
  }

  const poToSupplier = new Map<string, string>();
  for (const row of readCsv("purchase_orders.csv")) {
    if (row[0] && row[1]) poToSupplier.set(row[0], row[1]);
  }

  const supplierLeadDays = new Map<string, number>();
  for (const row of readCsv("suppliers.csv")) {
    if (row[0]) supplierLeadDays.set(row[0], Number(row[4]) || 0);
  }

  const productLanded = new Map<string, { cost: number; qty: number }>();
  const productLead = new Map<string, { days: number; qty: number }>();

  for (const row of readCsv("po_line_items.csv")) {
    const poId = row[1];
    const variantId = row[2];
    const qty = Number(row[4]) || 0;
    const landed = Number(row[6]) || 0;
    const productId = variantToProduct.get(variantId);
    if (!productId || qty <= 0) continue;

    const landedEntry = productLanded.get(productId) ?? { cost: 0, qty: 0 };
    landedEntry.cost += landed * qty;
    landedEntry.qty += qty;
    productLanded.set(productId, landedEntry);

    const supplierId = poToSupplier.get(poId);
    const lead = supplierId ? supplierLeadDays.get(supplierId) : undefined;
    if (lead) {
      const leadEntry = productLead.get(productId) ?? { days: 0, qty: 0 };
      leadEntry.days += lead * qty;
      leadEntry.qty += qty;
      productLead.set(productId, leadEntry);
    }
  }

  for (const [productId, landedEntry] of productLanded) {
    const stat = stats.get(productId);
    if (!stat || landedEntry.qty <= 0) continue;
    (stat as ProductSalesStat & { landedCostGbp?: number }).landedCostGbp =
      landedEntry.cost / landedEntry.qty;
  }

  for (const [productId, leadEntry] of productLead) {
    const stat = stats.get(productId);
    if (!stat || leadEntry.qty <= 0) continue;
    (stat as ProductSalesStat & { leadTimeDays?: number }).leadTimeDays =
      Math.round(leadEntry.days / leadEntry.qty);
  }

  g.__prettyFlySalesCache = {
    version: SALES_CACHE_VERSION,
    products,
    stats,
    variantToProduct,
    loadedAt: Date.now(),
  };

  return g.__prettyFlySalesCache;
}

export function refundRatePercent(units: number, refunds: number): number {
  if (units <= 0) return 0;
  return Math.round((refunds / units) * 1000) / 10;
}

export function getProductSalesStat(
  productId: string
): ProductSalesStat | undefined {
  const { stats } = loadSalesCache();
  const stat = stats.get(productId);
  return stat ? { ...stat } : undefined;
}

export function getCategorySnapshot(
  inputs: GenerationInputs
): CategorySalesSnapshot {
  const { stats } = loadSalesCache();
  const datasetTypes = productTypeToDataset[inputs.productType];
  const genderFilter = genderForAudience(inputs.targetAudience);

  const matching: ProductSalesStat[] = [];
  for (const stat of stats.values()) {
    if (!datasetTypes.includes(stat.productType)) continue;
    if (!matchesAudience(stat.genderSegment, inputs.targetAudience)) continue;
    matching.push({ ...stat });
  }

  matching.sort((a, b) => b.revenueGbp - a.revenueGbp);

  const totalRevenueGbp = matching.reduce((s, p) => s + p.revenueGbp, 0);
  const totalUnits = matching.reduce((s, p) => s + p.unitsSold, 0);
  const totalRefunds = matching.reduce((s, p) => s + p.refundCount, 0);
  const avgSellingPriceGbp =
    totalUnits > 0 ? Math.round(totalRevenueGbp / totalUnits) : 0;

  const top = matching.slice(0, 6);
  const anchor = top[0];
  const dataDrivenPriceGbp =
    anchor && anchor.unitsSold > 0
      ? Math.round(anchor.revenueGbp / anchor.unitsSold)
      : avgSellingPriceGbp;

  let landedSum = 0;
  let landedQty = 0;
  let leadSum = 0;
  let leadQty = 0;
  for (const p of matching) {
    const ext = p as ProductSalesStat & {
      landedCostGbp?: number;
      leadTimeDays?: number;
    };
    if (ext.landedCostGbp && p.unitsSold > 0) {
      landedSum += ext.landedCostGbp * p.unitsSold;
      landedQty += p.unitsSold;
    }
    if (ext.leadTimeDays && p.unitsSold > 0) {
      leadSum += ext.leadTimeDays * p.unitsSold;
      leadQty += p.unitsSold;
    }
  }

  const avgLandedCostGbp =
    landedQty > 0 ? Math.round((landedSum / landedQty) * 100) / 100 : 0;
  const avgLeadTimeDays =
    leadQty > 0 ? Math.round(leadSum / leadQty) : 0;

  return {
    productType: inputs.productType,
    targetAudience: inputs.targetAudience,
    datasetTypes,
    genderFilter,
    totalRevenueGbp: Math.round(totalRevenueGbp),
    totalUnits,
    totalRefunds,
    refundRiskPercent: refundRatePercent(totalUnits, totalRefunds),
    avgSellingPriceGbp,
    avgLandedCostGbp,
    avgLeadTimeDays,
    topProducts: top,
    dataDrivenPriceGbp: dataDrivenPriceGbp || avgSellingPriceGbp,
  };
}

export function formatGbp(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `£${Math.round(value / 1_000)}k`;
  return `£${Math.round(value)}`;
}

export function getSimilarProducts(
  inputs: GenerationInputs,
  limit = 4
): ProductSalesStat[] {
  return getCategorySnapshot(inputs).topProducts.slice(0, limit);
}

export function buildDataDrivenInsights(
  inputs: GenerationInputs
): SourcedInsight[] {
  const snap = getCategorySnapshot(inputs);
  const insights: SourcedInsight[] = [
    {
      text: `${inputs.productType} (${inputs.targetAudience}) generated ${formatGbp(snap.totalRevenueGbp)} across ${snap.totalUnits.toLocaleString()} units over 24 months.`,
      sourceIds: ["line_items", "products"],
    },
    {
      text: `Historical refund rate for this category is ${snap.refundRiskPercent}% (${snap.totalRefunds.toLocaleString()} refund events vs ${snap.totalUnits.toLocaleString()} units sold).`,
      sourceIds: ["refunds", "line_items"],
    },
    {
      text: `Average achieved selling price is ${formatGbp(snap.avgSellingPriceGbp)}; average landed unit cost from purchase orders is £${snap.avgLandedCostGbp}.`,
      sourceIds: ["line_items", "po_line_items"],
    },
  ];

  if (snap.avgLeadTimeDays > 0) {
    insights.push({
      text: `Weighted supplier lead time for this category is ${snap.avgLeadTimeDays} days.`,
      sourceIds: ["suppliers", "purchase_orders", "po_line_items"],
    });
  }

  if (snap.topProducts[0]) {
    const top = snap.topProducts[0];
    insights.push({
      text: `Best seller "${top.title}" (${top.productId}) recorded ${formatGbp(top.revenueGbp)} revenue and ${refundRatePercent(top.unitsSold, top.refundCount)}% refund rate.`,
      sourceIds: ["line_items", "products", "refunds"],
    });
  }

  return insights.slice(0, 5);
}
