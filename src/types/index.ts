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

export interface AnalysisData {
  manufacturingCost: number;
  recommendedRetailPrice: number;
  profitPerUnit: number;
  margin: number;
  leadTimeDays: number;
  historicalInsights: string[];
  recommendation: string;
}
