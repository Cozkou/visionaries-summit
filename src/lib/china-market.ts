import { createChinaMarketSchema } from "@/data/china-market-schema";
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

const NBS_URL =
  "https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962354.html";
const JD_URL =
  "https://ir.jd.com/news-releases/news-release-details/jdcom-announces-fourth-quarter-and-full-year-2025-results-and";
const ALIBABA_URL =
  "https://www.alibabagroup.com/en-US/document-1926184987447525376";
const CHINADAILY_URL =
  "https://govt.chinadaily.com.cn/s/202511/28/WS69296de3498e368550338333/e-commerce-mkt-embraces-livestreaming.html";
const BOSIDENG_URL = "https://company.bosideng.com/en/overview/brands.php";

const imageAssetMap: Record<string, ImageAssetConfig> = {
  "nbs-retail-chart": {
    sourceUrl:
      "https://www.stats.gov.cn/english/PressRelease/202601/W020260120590334766188_ORIGIN.jpg",
  },
  "alibaba-1111-hero": {
    sourceUrl:
      "https://data.alibabagroup.com/ecms-files/1532295521/582b153f-80b8-40f5-af8d-3a920fbd5feb/2025.11.11.jpg",
    headers: { "User-Agent": "Mozilla/5.0" },
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

function markMetricLive(
  metrics: ChinaMarketMetric[],
  id: string,
  value: number | string,
  context: string,
  sourceUrl: string,
  fetchedAt: string
) {
  const metric = metrics.find((item) => item.id === id);
  if (!metric) return;

  metric.value = value;
  metric.context = context;
  metric.live = true;
  metric.fetchedAt = fetchedAt;
  metric.sourceUrl = sourceUrl;
}

async function enrichFromNbs(snapshot: ChinaMarketResponse, fetchedAt: string) {
  const html = await fetchText(NBS_URL);
  const text = htmlToText(html);
  const match = text.match(
    /In 2025, China’s online retail sales reached ([\d,.]+) billion yuan, up by ([\d.]+)% year on year\. Specifically, the online retail sales of physical goods were ([\d,.]+) billion yuan, up by ([\d.]+)%, accounting for ([\d.]+)% of the total retail sales of consumer goods; among the online retail sales of physical goods, those of food, clothing, and daily necessities increased by ([\d.]+)%, ([\d.]+)%, and ([\d.]+)%, respectively\./i
  );

  if (!match) {
    throw new Error("Could not parse NBS retail metrics");
  }

  markMetricLive(
    snapshot.metrics,
    "china-online-retail-2025",
    parseNumber(match[1]),
    `China online retail sales in full-year 2025: ${match[1]} billion yuan, up ${match[2]}% YoY (NBS).`,
    NBS_URL,
    fetchedAt
  );
  markMetricLive(
    snapshot.metrics,
    "china-physical-goods-online-2025",
    parseNumber(match[3]),
    `Physical-goods online retail sales in 2025: ${match[3]} billion yuan, up ${match[4]}% YoY, ${match[5]}% of total retail (NBS).`,
    NBS_URL,
    fetchedAt
  );
  markMetricLive(
    snapshot.metrics,
    "china-clothing-online-growth-2025",
    parseNumber(match[7]),
    `Online clothing sales growth in 2025: ${match[7]}% YoY (NBS).`,
    NBS_URL,
    fetchedAt
  );
}

async function enrichFromJd(snapshot: ChinaMarketResponse, fetchedAt: string) {
  const html = await fetchText(JD_URL);
  const text = htmlToText(html);
  const merchantsMatch = text.match(
    /As of the end of 2025, JD Fashion’s on-demand retail service had onboarded over ([\d,]+) merchants/i
  );

  if (!merchantsMatch) {
    throw new Error("Could not parse JD Fashion merchant count");
  }

  const count = parseNumber(merchantsMatch[1]);
  markMetricLive(
    snapshot.metrics,
    "jd-fashion-merchants-2025",
    count,
    `JD Fashion on-demand retail onboarded over ${merchantsMatch[1]} merchants by end of 2025 (JD IR).`,
    JD_URL,
    fetchedAt
  );

  const jdCard = snapshot.channels.find((item) => item.id === "jd-fashion");
  if (jdCard) {
    jdCard.bullets = [
      `JD Fashion's on-demand retail service had onboarded over ${merchantsMatch[1]} merchants by the end of 2025 (JD IR release).`,
      "JD said the service covers apparel, footwear, underwear, beauty, and sports & outdoor.",
      "JD named ANTA, Li-Ning, ERKE, Bosideng and XTEP among onboarded brands.",
    ];
  }
}

async function enrichFromAlibaba(
  snapshot: ChinaMarketResponse,
  fetchedAt: string
) {
  const html = await fetchText(ALIBABA_URL);
  const text = htmlToText(html);
  const brandsMatch = text.match(
    /Nearly ([\d,]+) brands surpassed RMB100 million in sales/i
  );
  const ordersMatch = text.match(
    /daily average on-demand orders rise ([\d.]+)% versus September levels/i
  );

  if (!brandsMatch) {
    throw new Error("Could not parse Alibaba 11.11 brand count");
  }

  markMetricLive(
    snapshot.metrics,
    "tmall-100m-brands-1111-2025",
    parseNumber(brandsMatch[1]),
    `Nearly ${brandsMatch[1]} brands surpassed RMB100 million in sales during 2025 11.11 (Alibaba Group).`,
    ALIBABA_URL,
    fetchedAt
  );

  const tmallCard = snapshot.channels.find((card) => card.id === "tmall-taobao");
  if (tmallCard) {
    tmallCard.bullets = [
      "Tmall recorded its strongest 11.11 GMV growth net of refunds in four years (Alibaba Group release).",
      `Nearly ${brandsMatch[1]} brands passed RMB100 million in sales during the 2025 festival.`,
      ordersMatch
        ? `Brands using Taobao Instant Commerce saw daily on-demand orders rise ${ordersMatch[1]}% versus September.`
        : "Taobao Instant Commerce on-demand order growth cited in Alibaba 11.11 release.",
    ];
  }
}

async function enrichFromChinaDaily(
  snapshot: ChinaMarketResponse,
  fetchedAt: string
) {
  const html = await fetchText(CHINADAILY_URL);
  const text = htmlToText(html);
  const womensMatch = text.match(
    /women's clothing is turning fiercer, with GMV surging ([\d.]+) percent year-on-year/i
  );

  if (!womensMatch) {
    throw new Error("Could not parse Douyin women's apparel growth");
  }

  markMetricLive(
    snapshot.metrics,
    "douyin-womens-apparel-growth-2025",
    parseNumber(womensMatch[1]),
    `Douyin women's clothing GMV up ${womensMatch[1]}% YoY during Singles Day period (China Daily).`,
    CHINADAILY_URL,
    fetchedAt
  );

  const douyinCard = snapshot.channels.find(
    (item) => item.id === "douyin-commerce"
  );
  if (douyinCard) {
    douyinCard.bullets = [
      "China Daily reported apparel and underwear ranked No. 1 on Douyin Mall.",
      `Women's clothing GMV up ${womensMatch[1]}% year-on-year during the Singles Day period.`,
      "Outdoor, sportswear, and footwear traffic were also reported as rising alongside GMV.",
    ];
  }
}

async function enrichFromBosideng(
  snapshot: ChinaMarketResponse,
  fetchedAt: string
) {
  const html = await fetchText(BOSIDENG_URL);
  const text = htmlToText(html);
  const yearsMatch = text.match(
    /For ([\d]+) consecutive years \(1995-2024\), Bosideng brand has maintained a significant lead in the industry in terms of sales volume in China/i
  );

  if (!yearsMatch) {
    throw new Error("Could not parse Bosideng tenure metric");
  }

  const bosidengCard = snapshot.brands.find((item) => item.id === "bosideng");
  if (bosidengCard) {
    bosidengCard.bullets = [
      `Bosideng says it has led China in down-apparel sales volume for ${yearsMatch[1]} consecutive years from 1995 to 2024 (corporate site).`,
      "The company says brand recognition and top-of-mind awareness are both leading in China's apparel industry.",
      "Its media footprint explicitly spans WeChat, Weibo, RED, and Douyin.",
    ];
  }

  void fetchedAt;
}

function resolveMode(snapshot: ChinaMarketResponse): ChinaMarketResponse["mode"] {
  const liveCount = snapshot.metrics.filter((m) => m.live).length;
  if (liveCount === 0) return "unavailable";
  if (liveCount === snapshot.metrics.length) return "live";
  return "partial";
}

export async function getChinaMarketResponse(): Promise<ChinaMarketResponse> {
  const cached = readCache();
  if (cached) {
    return cached;
  }

  const snapshot = createChinaMarketSchema();
  const fetchedAt = new Date().toISOString();
  snapshot.generatedAt = fetchedAt;

  const tasks = [
    enrichFromNbs(snapshot, fetchedAt),
    enrichFromJd(snapshot, fetchedAt),
    enrichFromAlibaba(snapshot, fetchedAt),
    enrichFromChinaDaily(snapshot, fetchedAt),
    enrichFromBosideng(snapshot, fetchedAt),
  ];

  const results = await Promise.allSettled(tasks);
  snapshot.failures = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) =>
      result.reason instanceof Error ? result.reason.message : String(result.reason)
    );

  snapshot.mode = resolveMode(snapshot);

  if (snapshot.mode !== "unavailable") {
    writeCache(snapshot);
  }

  return snapshot;
}

export function getChinaMarketImageAsset(id: string): ImageAssetConfig | null {
  return imageAssetMap[id] ?? null;
}

export function listChinaMarketImages(): ChinaMarketImage[] {
  return createChinaMarketSchema().images;
}
