import path from "path";

import { formatGbp, readDataCsv } from "@/lib/data/sales-analytics";
import type {
  DashboardSnapshot,
  InventoryProduct,
  InventoryRow,
  MarketingRow,
  SupportRow,
} from "@/types/dashboard";

type MarketingAction = MarketingRow["action"];

const DATA_DIR = path.join(
  process.cwd(),
  "hackathon_assets/pretty_fly_data_pack/data",
);

const CACHE_VERSION = 1;

type CacheGlobal = typeof globalThis & {
  __controlTowerSnapshot?: { version: number; snapshot: DashboardSnapshot };
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseDateMs(value: string): number {
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
}

function marketingAction(roas: number): MarketingAction {
  if (roas < 1.35) return "Pause";
  if (roas < 2.5) return "Trim";
  if (roas < 3.5) return "Hold";
  return "Scale";
}

function buildMarketing(): DashboardSnapshot["marketing"] {
  const byCampaign = new Map<
    string,
    { spend: number; revenue: number; orders: number }
  >();

  for (const row of readDataCsv("google_ads_daily.csv")) {
    const campaign = row[1];
    if (!campaign) continue;
    const spend = Number(row[6]) || 0;
    const revenue = Number(row[8]) || 0;
    const orders = Number(row[7]) || 0;
      const entry = byCampaign.get(campaign) ?? {
        spend: 0,
        revenue: 0,
        orders: 0,
      };
      entry.spend += spend;
      entry.revenue += revenue;
      entry.orders += orders;
      byCampaign.set(campaign, entry);
  }

  for (const row of readDataCsv("meta_ads_daily.csv")) {
    const campaign = row[1];
    if (!campaign) continue;
    const spend = Number(row[8]) || 0;
    const revenue = Number(row[10]) || 0;
    const orders = Number(row[9]) || 0;
    const entry = byCampaign.get(campaign) ?? {
      spend: 0,
      revenue: 0,
      orders: 0,
    };
    entry.spend += spend;
    entry.revenue += revenue;
    entry.orders += orders;
    byCampaign.set(campaign, entry);
  }

  const rows: MarketingRow[] = [...byCampaign.entries()]
    .map(([campaign, m]) => {
      const roas = m.spend > 0 ? m.revenue / m.spend : 0;
      return {
        campaign,
        spend: round2(m.spend),
        revenue: round2(m.revenue),
        orders: m.orders,
        roas,
        action: marketingAction(roas),
      };
    })
    .sort((a, b) => b.spend - a.spend);

  const monthSpend = new Map<string, number>();
  const monthRevenue = new Map<string, number>();

  for (const row of readDataCsv("google_ads_daily.csv")) {
    const ym = row[0]?.slice(0, 7);
    if (!ym) continue;
    monthSpend.set(ym, (monthSpend.get(ym) ?? 0) + (Number(row[6]) || 0));
    monthRevenue.set(ym, (monthRevenue.get(ym) ?? 0) + (Number(row[8]) || 0));
  }
  for (const row of readDataCsv("meta_ads_daily.csv")) {
    const ym = row[0]?.slice(0, 7);
    if (!ym) continue;
    monthSpend.set(ym, (monthSpend.get(ym) ?? 0) + (Number(row[8]) || 0));
    monthRevenue.set(ym, (monthRevenue.get(ym) ?? 0) + (Number(row[10]) || 0));
  }

  const latestMonth = [...monthSpend.keys()].sort().at(-1) ?? "";
  const spend = monthSpend.get(latestMonth) ?? 0;
  const revenue = monthRevenue.get(latestMonth) ?? 0;
  const mer = spend > 0 ? revenue / spend : 0;

  const pauseOrTrim = rows.filter(
    (r) => r.action === "Pause" || r.action === "Trim",
  );
  const scale = rows.filter((r) => r.action === "Scale");
  const shiftSpend = round2(
    pauseOrTrim.reduce((s, r) => s + r.spend, 0) * 0.2,
  );
  const avgPauseRoas =
    pauseOrTrim.length > 0
      ? pauseOrTrim.reduce((s, r) => s + r.roas, 0) / pauseOrTrim.length
      : 0;
  const avgScaleRoas =
    scale.length > 0
      ? scale.reduce((s, r) => s + r.roas, 0) / scale.length
      : 0;
  const estimatedRevenueLift90d = round2(
    shiftSpend * Math.max(0, avgScaleRoas - avgPauseRoas) * 3,
  );

  return {
    summary: {
      month: latestMonth,
      mer: round2(mer),
      spend: round2(spend),
      revenue: round2(revenue),
      estimatedRevenueLift90d,
    },
    rows,
    reallocation: {
      sourceCampaigns: pauseOrTrim.slice(0, 3).map((r) => r.campaign),
      targetCampaigns: scale.slice(0, 3).map((r) => r.campaign),
      shiftSpend,
      estimatedRevenueLift90d,
    },
  };
}

function buildSupport(): DashboardSnapshot["support"] {
  const byCategory = new Map<
    string,
    {
      humanTickets: number;
      botTickets: number;
      humanMinutes: number;
      botMinutes: number;
    }
  >();

  for (const row of readDataCsv("support_tickets.csv")) {
    const category = row[6] || "other";
    const resolvedBy = (row[14] ?? "").toLowerCase();
    const minutes = Number(row[12]) || 0;
    const entry = byCategory.get(category) ?? {
      humanTickets: 0,
      botTickets: 0,
      humanMinutes: 0,
      botMinutes: 0,
    };
    if (resolvedBy === "bot") {
      entry.botTickets += 1;
      entry.botMinutes += minutes;
    } else {
      entry.humanTickets += 1;
      entry.humanMinutes += minutes;
    }
    byCategory.set(category, entry);
  }

  let botResolved = 0;
  let humanResolved = 0;
  let botMinSum = 0;
  let humanMinSum = 0;

  for (const entry of byCategory.values()) {
    botResolved += entry.botTickets;
    humanResolved += entry.humanTickets;
    botMinSum += entry.botMinutes;
    humanMinSum += entry.humanMinutes;
  }

  const botAvgMinutes =
    botResolved > 0 ? round2(botMinSum / botResolved) : 0;
  const humanAvgMinutes =
    humanResolved > 0 ? round2(humanMinSum / humanResolved) : 0;

  const rows: SupportRow[] = [...byCategory.entries()]
    .map(([category, e]) => {
      const total = e.humanTickets + e.botTickets;
      const humanShare = total > 0 ? e.humanTickets / total : 0;
      const categoryHumanAvg =
        e.humanTickets > 0 ? e.humanMinutes / e.humanTickets : humanAvgMinutes;
      const hoursSavedAt25Pct = round2(
        (e.humanTickets * categoryHumanAvg * 0.25) / 60,
      );
      return {
        category,
        humanTickets: e.humanTickets,
        botTickets: e.botTickets,
        humanMinutes:
          e.humanTickets > 0
            ? round2(e.humanMinutes / e.humanTickets)
            : 0,
        botMinutes:
          e.botTickets > 0 ? round2(e.botMinutes / e.botTickets) : 0,
        humanShare: round2(humanShare),
        hoursSavedAt25Pct,
      };
    })
    .sort((a, b) => b.hoursSavedAt25Pct - a.hoursSavedAt25Pct);

  return {
    summary: {
      botResolved,
      humanResolved,
      botAvgMinutes,
      humanAvgMinutes,
    },
    rows,
  };
}

function buildInventory(): DashboardSnapshot["inventory"] {
  const products = new Map<
    string,
    {
      title: string;
      collection: string;
      gender_segment: string;
      product_type: string;
    }
  >();
  for (const row of readDataCsv("products.csv")) {
    const [productId, title, , , productType, , collection, gender] = row;
    if (!productId) continue;
    products.set(productId, {
      title,
      collection,
      gender_segment: gender,
      product_type: productType,
    });
  }

  const variantToProduct = new Map<string, string>();
  const variantMeta = new Map<
    string,
    {
      sku: string;
      productId: string;
      title: string;
      collection: string;
      inventory: number;
      price: number;
      landedUnit: number;
      landedQty: number;
      landedSum: number;
    }
  >();

  for (const row of readDataCsv("variants.csv")) {
    const [variantId, productId, sku, , , , , price, , , , inventory] = row;
    if (!variantId || !productId) continue;
    variantToProduct.set(variantId, productId);
    const product = products.get(productId);
    variantMeta.set(variantId, {
      sku,
      productId,
      title: product?.title ?? sku,
      collection: product?.collection ?? "",
      inventory: Number(inventory) || 0,
      price: Number(price) || 0,
      landedUnit: 0,
      landedQty: 0,
      landedSum: 0,
    });
  }

  for (const row of readDataCsv("po_line_items.csv")) {
    const variantId = row[2];
    const qty = Number(row[4]) || Number(row[3]) || 0;
    const unit = Number(row[6]) || 0;
    const meta = variantMeta.get(variantId);
    if (!meta || qty <= 0 || unit <= 0) continue;
    meta.landedSum += unit * qty;
    meta.landedQty += qty;
  }

  for (const meta of variantMeta.values()) {
    if (meta.landedQty > 0) {
      meta.landedUnit = meta.landedSum / meta.landedQty;
    }
  }

  const orderDates = new Map<string, number>();
  let maxOrderMs = 0;
  for (const row of readDataCsv("orders.csv")) {
    const orderId = row[0];
    const ms = parseDateMs(row[3] ?? "");
    if (orderId) orderDates.set(orderId, ms);
    if (ms > maxOrderMs) maxOrderMs = ms;
  }

  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const variantUnits60d = new Map<string, number>();

  for (const row of readDataCsv("line_items.csv")) {
    const orderId = row[1];
    const variantId = row[2];
    const qty = Number(row[5]) || 0;
    const orderMs = orderDates.get(orderId) ?? 0;
    if (!variantId || maxOrderMs - orderMs > sixtyDaysMs) continue;
    variantUnits60d.set(
      variantId,
      (variantUnits60d.get(variantId) ?? 0) + qty,
    );
  }

  const rows: InventoryRow[] = [];
  const productAgg = new Map<
    string,
    InventoryProduct & { variantCount: number }
  >();

  let negativeVariants = 0;
  let netUnits = 0;
  let totalNegativeReorderCost = 0;

  for (const [variantId, meta] of variantMeta) {
    netUnits += meta.inventory;
    if (meta.inventory < 0) negativeVariants += 1;

    const units60d = variantUnits60d.get(variantId) ?? 0;
    const daily = units60d / 60;
    const target90 = Math.ceil(daily * 90);
    const recommended = Math.max(0, target90 - meta.inventory);
    const landed = meta.landedUnit || 0;
    const unitPrice = meta.price || 0;
    const poCost = round2(recommended * landed);
    const potential = round2(recommended * unitPrice);
    const gross = round2(potential - poCost);
    const daysCover =
      daily > 0 ? round2(meta.inventory / daily) : meta.inventory < 0 ? -999 : 0;

    if (meta.inventory < 0 && units60d > 0) {
      totalNegativeReorderCost += poCost;
    }

    if (meta.inventory < 0 && units60d > 0) {
      rows.push({
        title: meta.title,
        sku: meta.sku,
        collection: meta.collection,
        inventory_quantity: meta.inventory,
        units_60d: units60d,
        recommended_po_units: recommended,
        po_cost_gbp: poCost,
        potential_revenue_gbp: potential,
        gross_profit_gbp: gross,
        days_cover: daysCover,
      });
    }

    const product = products.get(meta.productId);
    if (!product) continue;
    const existing = productAgg.get(meta.productId);
    if (!existing) {
      productAgg.set(meta.productId, {
        product_id: meta.productId,
        title: product.title,
        collection: product.collection,
        gender_segment: product.gender_segment,
        product_type: product.product_type,
        inventory: meta.inventory,
        units_60d: units60d,
        recommended_po_units: recommended,
        po_cost_gbp: poCost,
        potential_revenue_gbp: potential,
        gross_profit_gbp: gross,
        variantCount: 1,
      });
    } else {
      existing.inventory += meta.inventory;
      existing.units_60d += units60d;
      existing.recommended_po_units += recommended;
      existing.po_cost_gbp = round2(existing.po_cost_gbp + poCost);
      existing.potential_revenue_gbp = round2(
        existing.potential_revenue_gbp + potential,
      );
      existing.gross_profit_gbp = round2(
        existing.gross_profit_gbp + gross,
      );
      existing.variantCount += 1;
    }
  }

  rows.sort((a, b) => b.gross_profit_gbp - a.gross_profit_gbp);

  const topProducts = [...productAgg.values()]
    .sort((a, b) => b.gross_profit_gbp - a.gross_profit_gbp)
    .slice(0, 12)
    .map(({ variantCount, ...p }) => {
      void variantCount;
      return p;
    });

  const topSix = topProducts.slice(0, 6);

  return {
    summary: {
      negativeVariants,
      netUnits,
      reorderCost90d: round2(totalNegativeReorderCost),
      topSixReorderCost: round2(
        topSix.reduce((s, p) => s + p.po_cost_gbp, 0),
      ),
      topSixGrossProfit: round2(
        topSix.reduce((s, p) => s + p.gross_profit_gbp, 0),
      ),
    },
    rows: rows.slice(0, 50),
    topProducts,
  };
}

function buildMetrics(
  inventory: DashboardSnapshot["inventory"],
  support: DashboardSnapshot["support"],
): DashboardSnapshot["metrics"] {
  let paidOrders = 0;
  let revenue = 0;
  for (const row of readDataCsv("orders.csv")) {
    const status = row[10];
    if (status !== "paid" && status !== "partially_refunded") continue;
    paidOrders += 1;
    revenue += Number(row[9]) || 0;
  }

  const recoverableHours = round2(
    support.rows.reduce((s, r) => s + r.hoursSavedAt25Pct, 0),
  );

  return [
    {
      label: "24-month revenue",
      value: round2(revenue),
      unit: "currency",
      note: `${paidOrders.toLocaleString()} paid orders across the full dataset (orders.csv).`,
    },
    {
      label: "Variants below zero stock",
      value: inventory.summary.negativeVariants,
      unit: "count",
      note: `${inventory.summary.negativeVariants} of ${readDataCsv("variants.csv").length} variants are underwater (variants.csv).`,
    },
    {
      label: "Reorder cost for 90-day cover",
      value: inventory.summary.reorderCost90d,
      unit: "currency",
      note: "Restores demand coverage on active, selling variants with negative stock.",
    },
    {
      label: "Recoverable support hours",
      value: recoverableHours,
      unit: "hours",
      note: "If the bot takes 25% more of human-heavy categories (support_tickets.csv).",
    },
  ];
}

function buildInsights(
  inventory: DashboardSnapshot["inventory"],
  marketing: DashboardSnapshot["marketing"],
  support: DashboardSnapshot["support"],
): DashboardSnapshot["insights"] {
  return [
    {
      title: "Inventory is the loudest problem in the pack.",
      detail: `Pretty Fly finishes the dataset at ${inventory.summary.netUnits.toLocaleString()} net units on hand, and the top six products alone need ${formatGbp(inventory.summary.topSixReorderCost)} to recover 90-day cover.`,
    },
    {
      title: "Spend efficiency needs a rebalance.",
      detail: `Latest month (${marketing.summary.month}) MER is ${marketing.summary.mer.toFixed(2)}x with ${formatGbp(marketing.summary.spend)} still going out (google_ads_daily.csv + meta_ads_daily.csv).`,
    },
    {
      title: "The support bot is already proving the playbook.",
      detail: `Bot-resolved tickets average ${support.summary.botAvgMinutes} minutes versus ${support.summary.humanAvgMinutes} minutes for human-handled tickets (support_tickets.csv).`,
    },
  ];
}

function buildActions(
  inventory: DashboardSnapshot["inventory"],
  marketing: DashboardSnapshot["marketing"],
  support: DashboardSnapshot["support"],
): DashboardSnapshot["actions"] {
  const topNames = inventory.topProducts
    .slice(0, 6)
    .map((p) => p.title)
    .join(", ");

  return [
    {
      title: "Fund a core reorder first",
      detail: `${topNames} represent ${formatGbp(inventory.summary.topSixGrossProfit)} of gross profit if Pretty Fly plugs the gap now.`,
    },
    {
      title: "Reallocate 20% of weak paid spend",
      detail: `Move roughly ${formatGbp(marketing.reallocation.shiftSpend)} from ${marketing.reallocation.sourceCampaigns.join(", ")} into ${marketing.reallocation.targetCampaigns.join(", ")} for an estimated ${formatGbp(marketing.reallocation.estimatedRevenueLift90d)} revenue lift over the next 90 days.`,
    },
    {
      title: "Expand bot authority where it already wins",
      detail: `Support categories could save about ${Math.round(support.rows.reduce((s, r) => s + r.hoursSavedAt25Pct, 0)).toLocaleString()} hours if the bot captures another 25% of human volume.`,
    },
  ];
}

export function buildControlTowerSnapshot(): DashboardSnapshot {
  const inventory = buildInventory();
  const marketing = buildMarketing();
  const support = buildSupport();

  const latestOrder = readDataCsv("orders.csv")
    .map((r) => r[3])
    .filter(Boolean)
    .sort()
    .at(-1);
  const snapshotDate = latestOrder
    ? new Date(parseDateMs(latestOrder)).toLocaleDateString("en-GB", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Dataset snapshot";

  return {
    brand: "Pretty Fly Control Tower",
    snapshotDate,
    subtitle:
      "A 24-month operating snapshot computed live from the hackathon data pack.",
    hero: {
      headline: "Make the next 7 days less expensive.",
      body: "This operator copilot focuses on three decisions Pretty Fly can make right now: buy back stock coverage, stop wasting paid spend, and route support into the bot where it already wins.",
    },
    metrics: buildMetrics(inventory, support),
    inventory,
    marketing,
    support,
    insights: buildInsights(inventory, marketing, support),
    actions: buildActions(inventory, marketing, support),
    footer: {
      validator:
        "All figures are computed at request time from hackathon_assets/pretty_fly_data_pack/data CSVs.",
      generatedFrom: DATA_DIR,
    },
  };
}

export function getBuiltControlTowerSnapshot(): DashboardSnapshot {
  const g = globalThis as CacheGlobal;
  if (g.__controlTowerSnapshot?.version === CACHE_VERSION) {
    return g.__controlTowerSnapshot.snapshot;
  }
  const snapshot = buildControlTowerSnapshot();
  g.__controlTowerSnapshot = { version: CACHE_VERSION, snapshot };
  return snapshot;
}
