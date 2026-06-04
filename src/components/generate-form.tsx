"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DesignPreview } from "@/components/design-preview";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type {
  BusinessGoal,
  GenerationInputs,
  ProductType,
  TargetAudience,
} from "@/types";

type ChoiceOption = {
  value: string;
  hint: string;
};

type ChoiceStep = {
  kind: "choice";
  key: "productType" | "targetAudience" | "businessGoal";
  question: string;
  helper: string;
  options: ChoiceOption[];
};

type TextStep = {
  kind: "text";
  key: "stylePrompt";
  question: string;
  helper: string;
};

type Step = ChoiceStep | TextStep;

const steps: Step[] = [
  {
    kind: "choice",
    key: "productType",
    question: "What are we making?",
    helper: "Select the product format for this concept.",
    options: [
      { value: "Hoodie", hint: "Heavyweight fleece staple" },
      { value: "T-Shirt", hint: "Everyday core layer" },
      { value: "Jacket", hint: "Outerwear statement piece" },
      { value: "Trainers", hint: "Footwear silhouette" },
      { value: "Cap", hint: "Headwear accessory" },
    ],
  },
  {
    kind: "choice",
    key: "targetAudience",
    question: "Who is it for?",
    helper: "Choose the primary audience to design toward.",
    options: [
      { value: "Menswear", hint: "Men's fit and styling" },
      { value: "Womenswear", hint: "Women's fit and styling" },
    ],
  },
  {
    kind: "choice",
    key: "businessGoal",
    question: "What's the priority?",
    helper: "We'll optimize the concept around this objective.",
    options: [
      { value: "Maximize Revenue", hint: "Broad appeal, higher volume" },
      { value: "Maximize Margin", hint: "Premium positioning, higher price" },
      { value: "Low Refund Risk", hint: "Reliable fit and demand" },
    ],
  },
  {
    kind: "text",
    key: "stylePrompt",
    question: "Any style direction?",
    helper: "Optional. Add notes on palette, mood, or details.",
  },
];

export function GenerateForm() {
  const router = useRouter();
  const setGenerationInputs = useAppStore((s) => s.setGenerationInputs);
  const stored = useAppStore((s) => s.generationInputs);

  const [stepIndex, setStepIndex] = useState(0);
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

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const valueForStep = (key: Step["key"]) => {
    switch (key) {
      case "productType":
        return productType;
      case "targetAudience":
        return targetAudience;
      case "businessGoal":
        return businessGoal;
      case "stylePrompt":
        return stylePrompt;
    }
  };

  const selectChoice = (key: ChoiceStep["key"], value: string) => {
    if (key === "productType") setProductType(value as ProductType);
    if (key === "targetAudience") setTargetAudience(value as TargetAudience);
    if (key === "businessGoal") setBusinessGoal(value as BusinessGoal);
  };

  const goNext = () => {
    if (isLast) {
      const inputs: GenerationInputs = {
        productType,
        targetAudience,
        businessGoal,
        stylePrompt: stylePrompt.trim() || undefined,
      };
      setGenerationInputs(inputs);
      router.push("/designs");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Question panel */}
      <div className="order-2 flex min-h-0 w-full flex-col lg:order-1">
        {/* Progress */}
        <div className="mb-8 shrink-0">
        <div className="mb-3 flex items-baseline justify-between font-mono text-xs tracking-widest uppercase">
          <span className="text-neutral-600">
            {String(stepIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground">{step.key === "stylePrompt" ? "Optional" : "Required"}</span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-300",
                i <= stepIndex ? "bg-foreground" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div
        key={step.key}
        className="reveal-on-load min-h-0 flex-1 overflow-y-auto"
      >
        <h2 className="text-lg font-medium text-balance text-neutral-900">
          {step.question}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{step.helper}</p>

        <div className="mt-8">
          {step.kind === "choice" ? (
            <div className="space-y-2">
              {step.options.map((option) => {
                const selected = valueForStep(step.key) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectChoice(step.key, option.value)}
                    aria-pressed={selected}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-lg border px-5 py-4 text-left transition-all outline-none",
                      "focus-visible:ring-2 focus-visible:ring-neutral-400",
                      selected
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {option.value}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border transition-colors",
                        selected
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 text-transparent group-hover:border-neutral-400"
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Textarea
              autoFocus
              placeholder="e.g. vintage wash, neutral palette, minimal branding"
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              rows={5}
              className="resize-none bg-white"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex shrink-0 items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={goBack}
          disabled={isFirst}
          className={cn(isFirst && "invisible")}
        >
          <ArrowLeft />
          Back
        </Button>
        <Button type="button" size="lg" onClick={goNext}>
          {isLast ? "Generate Designs" : "Continue"}
          {!isLast && <ArrowRight />}
        </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="order-1 flex min-h-0 lg:order-2">
        <div className="h-full w-full">
          <DesignPreview
            productType={productType}
            targetAudience={targetAudience}
            businessGoal={businessGoal}
            stylePrompt={stylePrompt}
            activeStepKey={step.key}
            stepIndex={stepIndex}
          />
        </div>
      </div>
    </div>
  );
}
