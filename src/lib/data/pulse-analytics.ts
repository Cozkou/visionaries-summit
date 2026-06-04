import { getControlTowerSnapshot } from "@/lib/control-tower";
import { readDataCsv } from "@/lib/data/sales-analytics";
import {
  getDemandCounts,
  listPublished,
} from "@/lib/db/listings-repository";

/**
 * Pulse aggregators — purpose-built shapes for the `/dashboard/pulse`
 * visualisations. Everything here is derived from the same CSV pack the rest
 * of the dashboard already consumes; the goal is to surface dimensions that
 * the existing list/table views collapse away (time, geography, distribution).
 *
 * The full snapshot is built once per server process and cached on
 * `globalThis` like `control-tower-build.ts`, so the seven charts on one page
 * cost a single CSV pass.
 */

const PULSE_CACHE_VERSION = 1;

export interface MonthlyCategoryRevenuePoint {
  /** YYYY-MM key for the X axis. */
  month: string;
  /** Pretty month label, e.g. "Jun '24". */
  label: string;
  /** Revenue per product_type. Keys are the CSV's product_type values. */
  [productType: string]: number | string;
}

export interface MonthlyRefundRatePoint {
  month: string;
  label: string;
  /** Refund events divided by units sold in the same month, as a percent. */
  refundRate: number;
  refundCount: number;
  unitsSold: number;
}

export interface GeoCityPoint {
  city: string;
  countryCode: string;
  countryName: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface GeoCountryPoint {
  countryCode: string;
  countryName: string;
  revenue: number;
  orders: number;
  customers: number;
  cities: GeoCityPoint[];
}

export interface SupplierOriginPoint {
  supplierId: string;
  name: string;
  countryCode: string;
  countryName: string;
  poCount: number;
  totalCostGbp: number;
  leadTimeDays: number;
}

export interface CashflowPoint {
  /** YYYY-MM-DD. */
  date: string;
  /** End-of-day balance in GBP. */
  balance: number;
  /** Sum of positive transactions that day. */
  inflow: number;
  /** Sum of |negative| transactions that day. */
  outflow: number;
}

export interface ConceptFunnelTotals {
  pageViews: number;
  wishlist: number;
  preorders: number;
  preorderUnits: number;
  commerceSales: number;
  listingCount: number;
}

export interface PulseSnapshot {
  /** ISO timestamp the snapshot was built at. */
  builtAt: string;
  /** Range covered by the order data. */
  range: { from: string; to: string };

  monthlyRevenueByCategory: MonthlyCategoryRevenuePoint[];
  /** Product types in stable order, useful for chart series legends. */
  productTypes: string[];

  monthlyRefundRate: MonthlyRefundRatePoint[];
  averageRefundRate: number;

  geoCountries: GeoCountryPoint[];
  geoCities: GeoCityPoint[];
  geoTotals: { revenue: number; orders: number; customers: number };

  supplierOrigins: SupplierOriginPoint[];

  cashflow: CashflowPoint[];
  cashflowSummary: {
    openingBalance: number;
    closingBalance: number;
    totalInflow: number;
    totalOutflow: number;
  };

  conceptFunnel: ConceptFunnelTotals;
}

type PulseGlobal = typeof globalThis & {
  __prettyFlyPulseCache?: {
    version: number;
    snapshot: PulseSnapshot;
    loadedAt: number;
  };
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthKey(iso: string): string {
  // iso looks like "2024-06-01T09:23:19" or "2024-06-01"
  return iso.slice(0, 7);
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function prettyMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${MONTH_LABELS[idx]} '${y.slice(2)}`;
}

function parseFloatSafe(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function parseRefundLineItems(raw: string): number {
  if (!raw || raw.trim() === "[]") return 0;
  try {
    const normalised = raw.trim().replace(/""/g, '"');
    const parsed = JSON.parse(normalised) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom",
  US: "United States",
  ES: "Spain",
  NL: "Netherlands",
  IE: "Ireland",
  FR: "France",
  DE: "Germany",
  IT: "Italy",
  PT: "Portugal",
  TR: "Turkey",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan",
  CN: "China",
  BR: "Brazil",
  MX: "Mexico",
  BE: "Belgium",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  CH: "Switzerland",
  AT: "Austria",
};

function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

async function buildSnapshot(): Promise<PulseSnapshot> {
  const orders = readDataCsv("orders.csv");
  const lineItems = readDataCsv("line_items.csv");
  const products = readDataCsv("products.csv");
  const refunds = readDataCsv("refunds.csv");
  const customers = readDataCsv("customers.csv");
  const addresses = readDataCsv("addresses.csv");
  const bank = readDataCsv("bank_transactions.csv");
  const suppliers = readDataCsv("suppliers.csv");
  const purchaseOrders = readDataCsv("purchase_orders.csv");

  // ---- products lookup: product_id -> product_type
  const productType = new Map<string, string>();
  const productTypeSet = new Set<string>();
  for (const row of products) {
    const id = row[0];
    const type = row[4] ?? "Other";
    productType.set(id, type);
    productTypeSet.add(type);
  }

  // ---- orders lookup: order_id -> { month, status, customer_id }
  interface OrderMeta {
    month: string;
    day: string;
    status: string;
    customerId: string;
    total: number;
  }
  const orderMeta = new Map<string, OrderMeta>();
  let earliestOrder = "9999-99";
  let latestOrder = "0000-00";
  for (const row of orders) {
    const orderId = row[0];
    const customerId = row[2];
    const createdAt = row[3];
    const totalPrice = parseFloatSafe(row[9]);
    const financialStatus = row[10];
    if (!createdAt) continue;
    const m = monthKey(createdAt);
    if (m < earliestOrder) earliestOrder = m;
    if (m > latestOrder) latestOrder = m;
    orderMeta.set(orderId, {
      month: m,
      day: dayKey(createdAt),
      status: financialStatus,
      customerId,
      total: totalPrice,
    });
  }

  // ---- Monthly revenue by category (paid + partially_refunded only)
  // Map<month, Map<productType, revenue>>
  const monthRevenueByType = new Map<string, Map<string, number>>();
  // For refund rate we also need units per month.
  const monthUnits = new Map<string, number>();

  for (const row of lineItems) {
    const orderId = row[1];
    const productId = row[3];
    const quantity = parseIntSafe(row[5]);
    const price = parseFloatSafe(row[6]);
    const discount = parseFloatSafe(row[7]);
    const meta = orderMeta.get(orderId);
    if (!meta) continue;
    monthUnits.set(meta.month, (monthUnits.get(meta.month) ?? 0) + quantity);
    if (meta.status !== "paid" && meta.status !== "partially_refunded") continue;
    const type = productType.get(productId) ?? "Other";
    const lineRev = Math.max(0, price * quantity - discount);
    let bucket = monthRevenueByType.get(meta.month);
    if (!bucket) {
      bucket = new Map<string, number>();
      monthRevenueByType.set(meta.month, bucket);
    }
    bucket.set(type, (bucket.get(type) ?? 0) + lineRev);
  }

  // Sort months and product types for stable series order.
  const months = Array.from(monthRevenueByType.keys()).sort();
  const productTypes = Array.from(productTypeSet).sort();
  const monthlyRevenueByCategory: MonthlyCategoryRevenuePoint[] = months.map(
    (m) => {
      const bucket = monthRevenueByType.get(m) ?? new Map();
      const point: MonthlyCategoryRevenuePoint = {
        month: m,
        label: prettyMonthLabel(m),
      };
      for (const type of productTypes) {
        point[type] = Math.round(bucket.get(type) ?? 0);
      }
      return point;
    }
  );

  // ---- Monthly refund rate
  const monthRefundCount = new Map<string, number>();
  for (const row of refunds) {
    const createdAt = row[2];
    const itemsJson = row[5] ?? "";
    if (!createdAt) continue;
    const m = monthKey(createdAt);
    const units = Math.max(1, parseRefundLineItems(itemsJson));
    monthRefundCount.set(m, (monthRefundCount.get(m) ?? 0) + units);
  }

  const monthlyRefundRate: MonthlyRefundRatePoint[] = months.map((m) => {
    const refundCount = monthRefundCount.get(m) ?? 0;
    const unitsSold = monthUnits.get(m) ?? 0;
    const rate = unitsSold > 0 ? (refundCount / unitsSold) * 100 : 0;
    return {
      month: m,
      label: prettyMonthLabel(m),
      refundCount,
      unitsSold,
      refundRate: Math.round(rate * 100) / 100,
    };
  });

  const averageRefundRate = monthlyRefundRate.length
    ? Math.round(
        (monthlyRefundRate.reduce((acc, p) => acc + p.refundRate, 0) /
          monthlyRefundRate.length) *
          100
      ) / 100
    : 0;

  // ---- Geo: customers + addresses + (use customers.total_spent as lifetime)
  // Build customer_id -> total_spent map (customers.csv col 6).
  const customerSpent = new Map<string, number>();
  const customerOrders = new Map<string, number>();
  for (const row of customers) {
    const id = row[0];
    customerSpent.set(id, parseFloatSafe(row[6]));
    customerOrders.set(id, parseIntSafe(row[7]));
  }

  // For each address, attribute the customer's total_spent + orders_count.
  // Cities collapse to a country in this data pack, so we keep both views.
  const cityKey = (countryCode: string, city: string) =>
    `${countryCode}::${city}`;
  const cityAgg = new Map<
    string,
    {
      city: string;
      countryCode: string;
      revenue: number;
      orders: number;
      customers: number;
    }
  >();
  const countryAgg = new Map<
    string,
    {
      countryCode: string;
      revenue: number;
      orders: number;
      customers: number;
      cityKeys: Set<string>;
    }
  >();

  for (const row of addresses) {
    const customerId = row[0];
    const city = row[5];
    const country = row[8];
    if (!customerId || !country) continue;
    const spent = customerSpent.get(customerId) ?? 0;
    const orders = customerOrders.get(customerId) ?? 0;

    const ck = cityKey(country, city || country);
    const c = cityAgg.get(ck);
    if (c) {
      c.revenue += spent;
      c.orders += orders;
      c.customers += 1;
    } else {
      cityAgg.set(ck, {
        city: city || country,
        countryCode: country,
        revenue: spent,
        orders,
        customers: 1,
      });
    }

    const ctry = countryAgg.get(country);
    if (ctry) {
      ctry.revenue += spent;
      ctry.orders += orders;
      ctry.customers += 1;
      ctry.cityKeys.add(ck);
    } else {
      countryAgg.set(country, {
        countryCode: country,
        revenue: spent,
        orders,
        customers: 1,
        cityKeys: new Set([ck]),
      });
    }
  }

  const geoCities: GeoCityPoint[] = Array.from(cityAgg.values())
    .map((c) => ({
      city: c.city,
      countryCode: c.countryCode,
      countryName: countryName(c.countryCode),
      revenue: Math.round(c.revenue),
      orders: c.orders,
      customers: c.customers,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const geoCountries: GeoCountryPoint[] = Array.from(countryAgg.values())
    .map((c) => ({
      countryCode: c.countryCode,
      countryName: countryName(c.countryCode),
      revenue: Math.round(c.revenue),
      orders: c.orders,
      customers: c.customers,
      cities: Array.from(c.cityKeys)
        .map((k) => cityAgg.get(k))
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
        .map((c2) => ({
          city: c2.city,
          countryCode: c2.countryCode,
          countryName: countryName(c2.countryCode),
          revenue: Math.round(c2.revenue),
          orders: c2.orders,
          customers: c2.customers,
        }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const geoTotals = geoCountries.reduce(
    (acc, c) => {
      acc.revenue += c.revenue;
      acc.orders += c.orders;
      acc.customers += c.customers;
      return acc;
    },
    { revenue: 0, orders: 0, customers: 0 }
  );

  // ---- Supplier origins (suppliers.csv + purchase_orders.csv aggregation)
  // suppliers: supplier_id, name, country, payment_terms, lead_time_days, currency
  // purchase_orders: po_id, supplier_id, created_at, expected_delivery,
  //   actual_delivery, status, total_cost_supplier_ccy, total_cost_gbp, ...
  const supplierMeta = new Map<
    string,
    { name: string; country: string; leadTime: number }
  >();
  for (const row of suppliers) {
    supplierMeta.set(row[0], {
      name: row[1] ?? row[0],
      country: row[2] ?? "",
      leadTime: parseIntSafe(row[4]),
    });
  }
  const supplierAgg = new Map<
    string,
    { poCount: number; totalCostGbp: number }
  >();
  for (const row of purchaseOrders) {
    const supplierId = row[1];
    const totalGbp = parseFloatSafe(row[7]);
    const cur = supplierAgg.get(supplierId);
    if (cur) {
      cur.poCount += 1;
      cur.totalCostGbp += totalGbp;
    } else {
      supplierAgg.set(supplierId, { poCount: 1, totalCostGbp: totalGbp });
    }
  }

  const supplierOrigins: SupplierOriginPoint[] = Array.from(
    supplierMeta.entries()
  ).map(([id, meta]) => {
    const agg = supplierAgg.get(id) ?? { poCount: 0, totalCostGbp: 0 };
    return {
      supplierId: id,
      name: meta.name,
      countryCode: meta.country,
      countryName: countryName(meta.country),
      poCount: agg.poCount,
      totalCostGbp: Math.round(agg.totalCostGbp),
      leadTimeDays: meta.leadTime,
    };
  });

  // ---- Cashflow (bank_transactions.csv)
  // Columns: transaction_id, date, description, amount_gbp, balance_gbp,
  //          counterparty, category, raw_category
  const cashflowByDay = new Map<
    string,
    { inflow: number; outflow: number; lastBalance: number; seq: number }
  >();
  let seq = 0;
  for (const row of bank) {
    const date = row[1];
    const amount = parseFloatSafe(row[3]);
    const balance = parseFloatSafe(row[4]);
    if (!date) continue;
    const day = dayKey(date);
    const cur = cashflowByDay.get(day);
    if (cur) {
      if (amount >= 0) cur.inflow += amount;
      else cur.outflow += -amount;
      cur.lastBalance = balance; // overwrite — bank CSV is ordered
      cur.seq = ++seq;
    } else {
      cashflowByDay.set(day, {
        inflow: amount >= 0 ? amount : 0,
        outflow: amount < 0 ? -amount : 0,
        lastBalance: balance,
        seq: ++seq,
      });
    }
  }
  const cashflow: CashflowPoint[] = Array.from(cashflowByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      balance: Math.round(v.lastBalance),
      inflow: Math.round(v.inflow),
      outflow: Math.round(v.outflow),
    }));

  const cashflowSummary = cashflow.length
    ? {
        openingBalance: cashflow[0].balance,
        closingBalance: cashflow[cashflow.length - 1].balance,
        totalInflow: cashflow.reduce((acc, c) => acc + c.inflow, 0),
        totalOutflow: cashflow.reduce((acc, c) => acc + c.outflow, 0),
      }
    : { openingBalance: 0, closingBalance: 0, totalInflow: 0, totalOutflow: 0 };

  // ---- Concept funnel (SQLite)
  const funnel: ConceptFunnelTotals = {
    pageViews: 0,
    wishlist: 0,
    preorders: 0,
    preorderUnits: 0,
    commerceSales: 0,
    listingCount: 0,
  };
  try {
    const listings = await listPublished(500);
    const countsList = await Promise.all(
      listings.map((l) => getDemandCounts(l.id))
    );
    for (const counts of countsList) {
      funnel.pageViews += counts.pageViewsTotal;
      funnel.wishlist += counts.wishlistCount;
      funnel.preorders += counts.preorderCount;
      funnel.preorderUnits += counts.preorderUnits;
      funnel.commerceSales += counts.wooTotalSales;
      funnel.listingCount += 1;
    }
  } catch (err) {
    // Database reads aren't critical to the page; log and continue with zeros.
    console.warn("[pulse-analytics] funnel read failed", err);
  }

  return {
    builtAt: new Date().toISOString(),
    range: { from: earliestOrder, to: latestOrder },
    monthlyRevenueByCategory,
    productTypes,
    monthlyRefundRate,
    averageRefundRate,
    geoCountries,
    geoCities,
    geoTotals,
    supplierOrigins,
    cashflow,
    cashflowSummary,
    conceptFunnel: funnel,
  };
}

/**
 * Returns the cached pulse snapshot, building it on first access. The cache
 * lives on `globalThis` and survives hot-reloads in dev.
 */
export async function getPulseSnapshot(): Promise<PulseSnapshot> {
  const g = globalThis as PulseGlobal;
  if (g.__prettyFlyPulseCache?.version === PULSE_CACHE_VERSION) {
    return g.__prettyFlyPulseCache.snapshot;
  }
  const snapshot = await buildSnapshot();
  g.__prettyFlyPulseCache = {
    version: PULSE_CACHE_VERSION,
    snapshot,
    loadedAt: Date.now(),
  };
  return snapshot;
}

/** Marketing rows from the control-tower snapshot, full list for the scatter. */
export function getMarketingScatterRows() {
  return getControlTowerSnapshot().marketing.rows;
}

/** Support rows from the control-tower snapshot, full list for the bars. */
export function getSupportStackRows() {
  return getControlTowerSnapshot().support.rows;
}

/** Inventory product rows for the treemap. */
export function getInventoryTreemapRows() {
  return getControlTowerSnapshot().inventory.topProducts;
}
