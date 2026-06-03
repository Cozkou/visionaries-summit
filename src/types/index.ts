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
  imageUrl: string;
  retailPrice: number;
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
}
