import { chinaMarketFallback } from "@/data/china-market-fallback";
import type {
  ChinaMarketImage,
  ChinaMarketMetric,
  ChinaMarketResponse,
} from "@/types/china-market";

type Cache = {
  expiresAt: number;
  value: ChinaMarketResponse;
};

type ImageAssetConfig = {
  headers?: HeadersInit;
  sourceUrl: string;
};

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const imageAssetMap: Record<string, ImageAssetConfig> = {
  "nbs-retail-chart": {
    sourceUrl:
      "https://www.stats.gov.cn/english/PressRelease/202601/W020260120590334766188_ORIGIN.jpg",
  },
  "alibaba-1111-hero": {
    sourceUrl:
      "https://data.alibabagroup.com/ecms-files/1532295521/582b153f-80b8-40f5-af8d-3a920fbd5feb/2025.11.11.jpg",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  },
  "chinadaily-douyin-graphic": {
    sourceUrl:
      "https://govt.chinadaily.com.cn/images/202511/28/69296de3498e3685b28e92bf.png",
  },
  "bosideng-jacket": {
    sourceUrl:
      "https://static.bosideng.com/uploads/20220221/799d50c30a834988a7c25efcb3eb3aea.jpg",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.bosideng.com/en/news/detail/76.html",
    },
  },
};

type GlobalWithChinaMarketCache = typeof globalThis & {
  __chinaMarketCache?: Cache;
};

function getCacheContainer() {
  return globalThis as GlobalWithChinaMarketCache;
}

function readCache() {
  const cache = getCacheContainer().__chinaMarketCache;
  if (!cache || cache.expiresAt < Date.now()) {
    return null;
  }

  return cache.value;
}

function writeCache(value: ChinaMarketResponse) {
  getCacheContainer().__chinaMarketCache = {
    expiresAt: Date.now() + SIX_HOURS_MS,
    value,
  };
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 21_600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string) {
  return Number(value.replace(/,/g, ""));
}

function updateMetric(
  metrics: ChinaMarketMetric[],
  id: string,
  value: number | string,
  context?: string,
) {
  const metric = metrics.find((item) => item.id === id);
  if (!metric) {
    return;
  }

  metric.value = value;
  if (context) {
    metric.context = context;
  }
}

async function enrichFromNbs(snapshot: ChinaMarketResponse) {
  const html = await fetchText(
    "https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962354.html",
  );
  const text = htmlToText(html);
  const match = text.match(
    /In 2025, China’s online retail sales reached ([\d,.]+) billion yuan, up by ([\d.]+)% year on year\. Specifically, the online retail sales of physical goods were ([\d,.]+) billion yuan, up by ([\d.]+)%, accounting for ([\d.]+)% of the total retail sales of consumer goods; among the online retail sales of physical goods, those of food, clothing, and daily necessities increased by ([\d.]+)%, ([\d.]+)%, and ([\d.]+)%, respectively\./i,
  );

  if (!match) {
    throw new Error("Could not parse NBS retail metrics");
  }

  updateMetric(
    snapshot.metrics,
    "china-online-retail-2025",
    parseNumber(match[1]),
  );
  updateMetric(
    snapshot.metrics,
    "china-physical-goods-online-2025",
    parseNumber(match[3]),
    `Physical-goods online retail sales in 2025, representing ${match[5]}% of total retail sales.`,
  );
  updateMetric(
    snapshot.metrics,
    "china-clothing-online-growth-2025",
    parseNumber(match[7]),
  );
}

async function enrichFromJd(snapshot: ChinaMarketResponse) {
  const html = await fetchText(
    "https://ir.jd.com/news-releases/news-release-details/jdcom-announces-fourth-quarter-and-full-year-2025-results-and",
  );
  const text = htmlToText(html);
  const merchantsMatch = text.match(
    /As of the end of 2025, JD Fashion’s on-demand retail service had onboarded over ([\d,]+) merchants/i,
  );

  if (!merchantsMatch) {
    throw new Error("Could not parse JD Fashion merchant count");
  }

  updateMetric(
    snapshot.metrics,
    "jd-fashion-merchants-2025",
    parseNumber(merchantsMatch[1]),
  );
}

async function enrichFromAlibaba(snapshot: ChinaMarketResponse) {
  const html = await fetchText(
    "https://www.alibabagroup.com/en-US/document-1926184987447525376",
  );
  const text = htmlToText(html);
  const brandsMatch = text.match(
    /Nearly ([\d,]+) brands surpassed RMB100 million in sales/i,
  );
  const ordersMatch = text.match(
    /daily average on-demand orders rise ([\d.]+)% versus September levels/i,
  );

  if (!brandsMatch) {
    throw new Error("Could not parse Alibaba 11.11 brand count");
  }

  updateMetric(
    snapshot.metrics,
    "tmall-100m-brands-1111-2025",
    parseNumber(brandsMatch[1]),
  );

  const tmallCard = snapshot.channels.find((card) => card.id === "tmall-taobao");
  if (tmallCard && ordersMatch) {
    tmallCard.bullets[2] = `Brands using Taobao Instant Commerce saw daily on-demand orders rise ${ordersMatch[1]}% versus September.`;
  }
}

async function enrichFromChinaDaily(snapshot: ChinaMarketResponse) {
  const html = await fetchText(
    "https://govt.chinadaily.com.cn/s/202511/28/WS69296de3498e368550338333/e-commerce-mkt-embraces-livestreaming.html",
  );
  const text = htmlToText(html);
  const womensMatch = text.match(
    /women's clothing is turning fiercer, with GMV surging ([\d.]+) percent year-on-year/i,
  );

  if (!womensMatch) {
    throw new Error("Could not parse Douyin women's apparel growth");
  }

  updateMetric(
    snapshot.metrics,
    "douyin-womens-apparel-growth-2025",
    parseNumber(womensMatch[1]),
  );
}

async function enrichFromBosideng(snapshot: ChinaMarketResponse) {
  const html = await fetchText("https://company.bosideng.com/en/overview/brands.php");
  const text = htmlToText(html);
  const yearsMatch = text.match(
    /For ([\d]+) consecutive years \(1995-2024\), Bosideng brand has maintained a significant lead in the industry in terms of sales volume in China/i,
  );

  if (!yearsMatch) {
    throw new Error("Could not parse Bosideng tenure metric");
  }

  const bosidengCard = snapshot.brands.find((item) => item.id === "bosideng");
  if (bosidengCard) {
    bosidengCard.bullets[0] = `Bosideng says it has led China in down-apparel sales volume for ${yearsMatch[1]} consecutive years from 1995 to 2024.`;
  }
}

export async function getChinaMarketResponse() {
  const cached = readCache();
  if (cached) {
    return cached;
  }

  const snapshot = structuredClone(chinaMarketFallback);
  snapshot.generatedAt = new Date().toISOString();
  snapshot.mode = "live";
  snapshot.failures = [];

  const tasks = [
    enrichFromNbs(snapshot),
    enrichFromJd(snapshot),
    enrichFromAlibaba(snapshot),
    enrichFromChinaDaily(snapshot),
    enrichFromBosideng(snapshot),
  ];

  const results = await Promise.allSettled(tasks);
  const failures = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

  if (failures.length === results.length) {
    return {
      ...chinaMarketFallback,
      generatedAt: new Date().toISOString(),
      failures,
    };
  }

  snapshot.failures = failures;
  writeCache(snapshot);
  return snapshot;
}

export function getChinaMarketImageAsset(id: string): ImageAssetConfig | null {
  return imageAssetMap[id] ?? null;
}

export function listChinaMarketImages(): ChinaMarketImage[] {
  return chinaMarketFallback.images;
}
