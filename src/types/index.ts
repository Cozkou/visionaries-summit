export type ProductType =
  | "Hoodie"
  | "T-Shirt"
  | "Jacket"
  | "Trainers"
  | "Cap";

export type TargetAudience = "Menswear" | "Womenswear";

export type BusinessGoal =
  | "Maximize Revenue"
  | "Maximize Margin"
  | "Low Refund Risk";

export interface GenerationInputs {
  productType: ProductType;
  targetAudience: TargetAudience;
  businessGoal: BusinessGoal;
  stylePrompt?: string;
}

export interface Design {
  id: string;
  name: string;
  description: string;
  /** Empty — the hackathon data pack has no product imagery. */
  imageUrl: string;
  retailPrice: number;
  /** Historical SKU this concept is derived from (products.csv). */
  sourceProductId?: string;
}

export interface SimilarProduct {
  productId: string;
  title: string;
  revenueGbp: number;
  unitsSold: number;
  refundRatePercent: number;
  sourceIds: string[];
}

export interface SourcedInsight {
  text: string;
  sourceIds: string[];
}

export interface SourcedMetric {
  label: string;
  value: string;
  sourceIds: string[];
  detail?: string;
}

export interface DataSourceRef {
  id: string;
  label: string;
  file: string;
  description: string;
  githubUrl: string;
}

export type ListingStatus = "draft" | "coming_soon" | "published" | "archived";

export interface DesignListingSummary {
  id: string;
  slug: string;
  status: ListingStatus;
  storefrontUrl: string | null;
  imageUrl: string | null;
  publishedAt: number;
  wooProductId: number | null;
}

export interface DesignDemandCounts {
  wishlistCount: number;
  preorderCount: number;
  preorderUnits: number;
  pageViews7d: number;
  pageViewsTotal: number;
  wooTotalSales: number;
}

export interface DesignDemand {
  listing: DesignListingSummary;
  counts: DesignDemandCounts;
}

export interface AnalysisData {
  manufacturingCost: number;
  recommendedRetailPrice: number;
  profitPerUnit: number;
  margin: number;
  leadTimeDays: number;
  refundRiskPercent: number;
  metrics: SourcedMetric[];
  historicalInsights: SourcedInsight[];
  similarProducts: SimilarProduct[];
  dataSources: DataSourceRef[];
  recommendation: string;
  recommendationSourceIds: string[];
  /** Present once the concept has been published to the storefront. */
  demand: DesignDemand | null;
}
