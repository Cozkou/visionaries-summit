import type { ChinaMarketResponse } from "@/types/china-market";

/** Response skeleton — metric values are filled only from live source fetches. */
export function createChinaMarketSchema(): ChinaMarketResponse {
  return {
    market: "China",
    generatedAt: new Date(0).toISOString(),
    mode: "unavailable",
    currency: "CNY",
    sources: [
      {
        id: "nbs-2025-retail",
        title: "Total Retail Sales of Consumer Goods in December 2025",
        publisher: "National Bureau of Statistics of China",
        url: "https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962354.html",
        publishedAt: "2026-01-20",
      },
      {
        id: "jd-q4-2025",
        title: "JD.com Announces Fourth Quarter and Full Year 2025 Results, and Annual Dividend",
        publisher: "JD.com Investor Relations",
        url: "https://ir.jd.com/news-releases/news-release-details/jdcom-announces-fourth-quarter-and-full-year-2025-results-and",
        publishedAt: "2026-03-05",
      },
      {
        id: "alibaba-1111-2025",
        title: "Taobao and Tmall’s 11.11 Shopping Festival Delivers Solid Growth for Brands",
        publisher: "Alibaba Group",
        url: "https://www.alibabagroup.com/en-US/document-1926184987447525376",
        publishedAt: "2025-11-15",
      },
      {
        id: "chinadaily-douyin-2025",
        title: "E-commerce mkt embraces livestreaming",
        publisher: "China Daily",
        url: "https://govt.chinadaily.com.cn/s/202511/28/WS69296de3498e368550338333/e-commerce-mkt-embraces-livestreaming.html",
        publishedAt: "2025-11-28",
      },
      {
        id: "bosideng-brands",
        title: "Bosideng International Holdings Limited - Overview > Brands",
        publisher: "Bosideng International Holdings Limited",
        url: "https://company.bosideng.com/en/overview/brands.php",
        publishedAt: "2026-06-03",
      },
    ],
    metrics: [
      {
        id: "china-online-retail-2025",
        label: "Online retail sales",
        value: null,
        unit: "billion_rmb",
        context: "China online retail sales in full-year 2025 (NBS press release).",
        sourceId: "nbs-2025-retail",
        live: false,
        fetchedAt: null,
        sourceUrl:
          "https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962354.html",
      },
      {
        id: "china-physical-goods-online-2025",
        label: "Online retail sales of physical goods",
        value: null,
        unit: "billion_rmb",
        context: "Physical-goods online retail sales in 2025 (NBS press release).",
        sourceId: "nbs-2025-retail",
        live: false,
        fetchedAt: null,
        sourceUrl:
          "https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962354.html",
      },
      {
        id: "china-clothing-online-growth-2025",
        label: "Online clothing growth",
        value: null,
        unit: "percent",
        context: "Year-on-year growth for online clothing sales in 2025 (NBS).",
        sourceId: "nbs-2025-retail",
        live: false,
        fetchedAt: null,
        sourceUrl:
          "https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962354.html",
      },
      {
        id: "douyin-womens-apparel-growth-2025",
        label: "Douyin women's clothing GMV growth",
        value: null,
        unit: "percent",
        context: "Reported YoY GMV growth in women's clothing on Douyin (China Daily).",
        sourceId: "chinadaily-douyin-2025",
        live: false,
        fetchedAt: null,
        sourceUrl:
          "https://govt.chinadaily.com.cn/s/202511/28/WS69296de3498e368550338333/e-commerce-mkt-embraces-livestreaming.html",
      },
      {
        id: "jd-fashion-merchants-2025",
        label: "JD Fashion on-demand merchants",
        value: null,
        unit: "count",
        context: "Merchants onboarded to JD Fashion on-demand retail (JD IR release).",
        sourceId: "jd-q4-2025",
        live: false,
        fetchedAt: null,
        sourceUrl:
          "https://ir.jd.com/news-releases/news-release-details/jdcom-announces-fourth-quarter-and-full-year-2025-results-and",
      },
      {
        id: "tmall-100m-brands-1111-2025",
        label: "Tmall brands above RMB100m during 11.11",
        value: null,
        unit: "count",
        context: "Brands surpassing RMB100m during 2025 11.11 (Alibaba Group).",
        sourceId: "alibaba-1111-2025",
        live: false,
        fetchedAt: null,
        sourceUrl:
          "https://www.alibabagroup.com/en-US/document-1926184987447525376",
      },
    ],
    channels: [
      {
        id: "tmall-taobao",
        name: "Tmall / Taobao",
        kind: "channel",
        summary:
          "Marketplace scale channel. Bullets populated from Alibaba Group 11.11 release when live fetch succeeds.",
        bullets: [],
        sourceIds: ["alibaba-1111-2025"],
        imageId: "alibaba-1111-hero",
      },
      {
        id: "jd-fashion",
        name: "JD Fashion",
        kind: "channel",
        summary:
          "Logistics-led fashion channel. Bullets populated from JD.com IR release when live fetch succeeds.",
        bullets: [],
        sourceIds: ["jd-q4-2025"],
      },
      {
        id: "douyin-commerce",
        name: "Douyin Commerce",
        kind: "channel",
        summary:
          "Livestream commerce channel. Bullets populated from China Daily coverage when live fetch succeeds.",
        bullets: [],
        sourceIds: ["chinadaily-douyin-2025"],
        imageId: "chinadaily-douyin-graphic",
      },
    ],
    brands: [
      {
        id: "bosideng",
        name: "Bosideng",
        kind: "brand",
        summary:
          "Outerwear benchmark brand. Bullets populated from Bosideng corporate site when live fetch succeeds.",
        bullets: [],
        sourceIds: ["bosideng-brands"],
        imageId: "bosideng-jacket",
      },
    ],
    trends: [
      {
        id: "value-over-logo",
        title: "Comfort and function over logo flex",
        detail:
          "See China Daily livestream e-commerce coverage for category mix and consumer rotation signals.",
        sourceIds: ["chinadaily-douyin-2025"],
      },
      {
        id: "ai-is-already-in-the-stack",
        title: "Marketplaces operationalizing AI in commerce",
        detail:
          "See Alibaba 11.11 and JD.com IR releases for AI usage disclosures during peak commerce events.",
        sourceIds: ["alibaba-1111-2025", "jd-q4-2025"],
      },
      {
        id: "platform-strategy-is-multi-channel",
        title: "Multi-channel platform strategy",
        detail:
          "Tmall/Taobao (scale), JD (fulfillment/trust), Douyin (content conversion). Each source linked above.",
        sourceIds: ["alibaba-1111-2025", "jd-q4-2025", "chinadaily-douyin-2025"],
      },
    ],
    images: [
      {
        id: "nbs-retail-chart",
        alt: "National Bureau of Statistics of China retail-sales chart for December 2025.",
        proxyPath: "/api/china-market/images/nbs-retail-chart",
        sourceUrl:
          "https://www.stats.gov.cn/english/PressRelease/202601/W020260120590334766188_ORIGIN.jpg",
      },
      {
        id: "alibaba-1111-hero",
        alt: "Alibaba 2025 11.11 visual used on Taobao and Tmall growth announcement.",
        proxyPath: "/api/china-market/images/alibaba-1111-hero",
        sourceUrl:
          "https://data.alibabagroup.com/ecms-files/1532295521/582b153f-80b8-40f5-af8d-3a920fbd5feb/2025.11.11.jpg",
      },
      {
        id: "chinadaily-douyin-graphic",
        alt: "China Daily graphic for its livestreaming e-commerce article.",
        proxyPath: "/api/china-market/images/chinadaily-douyin-graphic",
        sourceUrl:
          "https://govt.chinadaily.com.cn/images/202511/28/69296de3498e3685b28e92bf.png",
      },
      {
        id: "bosideng-jacket",
        alt: "Bosideng outerwear image from the brand's spring multifunctional down jacket story.",
        proxyPath: "/api/china-market/images/bosideng-jacket",
        sourceUrl:
          "https://static.bosideng.com/uploads/20220221/799d50c30a834988a7c25efcb3eb3aea.jpg",
      },
    ],
    failures: [],
  };
}
