import { create } from "zustand";

import type {
  AnalysisData,
  Design,
  GenerationInputs,
  ProductType,
  TargetAudience,
  BusinessGoal,
} from "@/types";

const defaultGenerationInputs: GenerationInputs = {
  productType: "Hoodie",
  targetAudience: "Menswear",
  businessGoal: "Maximize Revenue",
  stylePrompt: "",
};

interface AppState {
  generationInputs: GenerationInputs;
  selectedDesign: Design | null;
  analysisData: AnalysisData | null;
  setGenerationInputs: (inputs: GenerationInputs) => void;
  setSelectedDesign: (design: Design | null) => void;
  setAnalysisData: (data: AnalysisData | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  generationInputs: defaultGenerationInputs,
  selectedDesign: null,
  analysisData: null,
  setGenerationInputs: (inputs) => set({ generationInputs: inputs }),
  setSelectedDesign: (design) => set({ selectedDesign: design }),
  setAnalysisData: (data) => set({ analysisData: data }),
  reset: () =>
    set({
      generationInputs: defaultGenerationInputs,
      selectedDesign: null,
      analysisData: null,
    }),
}));

export const productTypes: ProductType[] = [
  "Hoodie",
  "T-Shirt",
  "Jacket",
  "Trainers",
  "Cap",
];

export const targetAudiences: TargetAudience[] = ["Menswear", "Womenswear"];

export const businessGoals: BusinessGoal[] = [
  "Maximize Revenue",
  "Maximize Margin",
  "Low Refund Risk",
];
