"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  businessGoals,
  productTypes,
  targetAudiences,
  useAppStore,
} from "@/store/useAppStore";
import type {
  BusinessGoal,
  GenerationInputs,
  ProductType,
  TargetAudience,
} from "@/types";

function FormSkeleton() {
  return (
    <div
      className="max-w-lg space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading form"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 rounded-md bg-muted" />
          <div className="h-9 w-full rounded-lg bg-muted" />
        </div>
      ))}
      <div className="h-9 w-36 rounded-lg bg-muted" />
    </div>
  );
}

export function GenerateForm() {
  const router = useRouter();
  const setGenerationInputs = useAppStore((s) => s.setGenerationInputs);
  const stored = useAppStore((s) => s.generationInputs);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [productType, setProductType] = useState<ProductType>(
    stored.productType
  );
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    stored.targetAudience
  );
  const [businessGoal, setBusinessGoal] = useState<BusinessGoal>(
    stored.businessGoal
  );
  const [stylePrompt, setStylePrompt] = useState(stored.stylePrompt ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inputs: GenerationInputs = {
      productType,
      targetAudience,
      businessGoal,
      stylePrompt: stylePrompt.trim() || undefined,
    };
    setGenerationInputs(inputs);
    router.push("/designs");
  }

  if (!mounted) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="product-type">Product Type</Label>
        <Select
          value={productType}
          onValueChange={(v) => setProductType(v as ProductType)}
        >
          <SelectTrigger id="product-type" className="w-full">
            <SelectValue placeholder="Select product type" />
          </SelectTrigger>
          <SelectContent>
            {productTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-audience">Target Audience</Label>
        <Select
          value={targetAudience}
          onValueChange={(v) => setTargetAudience(v as TargetAudience)}
        >
          <SelectTrigger id="target-audience" className="w-full">
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            {targetAudiences.map((audience) => (
              <SelectItem key={audience} value={audience}>
                {audience}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-goal">Business Goal</Label>
        <Select
          value={businessGoal}
          onValueChange={(v) => setBusinessGoal(v as BusinessGoal)}
        >
          <SelectTrigger id="business-goal" className="w-full">
            <SelectValue placeholder="Select business goal" />
          </SelectTrigger>
          <SelectContent>
            {businessGoals.map((goal) => (
              <SelectItem key={goal} value={goal}>
                {goal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="style-prompt">Optional Style Prompt</Label>
        <Textarea
          id="style-prompt"
          placeholder="e.g. vintage wash, neutral palette, minimal branding"
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit">Generate Designs</Button>
    </form>
  );
}
