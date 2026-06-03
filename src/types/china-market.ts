export interface ChinaMarketMetric {
  id: string;
  label: string;
  value: number | string;
  unit: "billion_rmb" | "percent" | "count" | "rank" | "text";
  context: string;
  sourceId: string;
}

export interface ChinaMarketSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
}

export interface ChinaMarketImage {
  id: string;
  alt: string;
  proxyPath: string;
  sourceUrl: string;
}

export interface ChinaMarketCard {
  id: string;
  name: string;
  kind: "channel" | "brand" | "signal";
  summary: string;
  bullets: string[];
  sourceIds: string[];
  imageId?: string;
}

export interface ChinaMarketTrend {
  id: string;
  title: string;
  detail: string;
  sourceIds: string[];
}

export interface ChinaMarketResponse {
  market: "China";
  generatedAt: string;
  mode: "live" | "fallback";
  currency: "CNY";
  sources: ChinaMarketSource[];
  metrics: ChinaMarketMetric[];
  channels: ChinaMarketCard[];
  brands: ChinaMarketCard[];
  trends: ChinaMarketTrend[];
  images: ChinaMarketImage[];
  failures: string[];
}
