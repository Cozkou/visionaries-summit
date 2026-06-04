"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type {
  BusinessGoal,
  GenerationInputs,
  ProductType,
  TargetAudience,
} from "@/types";

type ChoiceStep = {
  kind: "choice";
  key: "productType" | "targetAudience" | "businessGoal";
  question: string;
  options: { value: string }[];
};

type TextStep = {
  kind: "text";
  key: "stylePrompt";
  question: string;
};

type Step = ChoiceStep | TextStep;

const steps: Step[] = [
  {
    kind: "choice",
    key: "productType",
    question: "Product",
    options: [
      { value: "Hoodie" },
      { value: "T-Shirt" },
      { value: "Jacket" },
      { value: "Trainers" },
      { value: "Cap" },
    ],
  },
  {
    kind: "choice",
    key: "targetAudience",
    question: "Audience",
    options: [{ value: "Menswear" }, { value: "Womenswear" }],
  },
  {
    kind: "choice",
    key: "businessGoal",
    question: "Objective",
    options: [
      { value: "Maximize Revenue" },
      { value: "Maximize Margin" },
      { value: "Low Refund Risk" },
    ],
  },
  {
    kind: "text",
    key: "stylePrompt",
    question: "Style notes",
  },
];

function FormSkeleton() {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[7fr_4fr]"
      aria-busy="true"
      aria-label="Loading form"
    >
      <div className="hidden animate-pulse bg-neutral-50/80 lg:block" />
      <div className="animate-pulse border-t border-neutral-100 px-6 py-8 lg:border-t-0 lg:border-l lg:px-8">
        <div className="h-3 w-16 rounded bg-neutral-100" />
        <div className="mt-10 h-5 w-40 rounded bg-neutral-100" />
        <div className="mt-8 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <aside className="relative hidden min-h-0 flex-col bg-neutral-50/50 lg:flex lg:border-r lg:border-neutral-100">
      <p className="absolute top-5 left-5 z-10 font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase">
        Live preview
      </p>
      <div className="m-4 min-h-0 flex-1 rounded-sm border border-dashed border-neutral-200/90 bg-white/40 md:m-6" />
    </aside>
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

  const [stepIndex, setStepIndex] = useState(0);
  const [productType, setProductType] = useState<ProductType>(stored.productType);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    stored.targetAudience
  );
  const [businessGoal, setBusinessGoal] = useState<BusinessGoal>(stored.businessGoal);
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

  if (!mounted) {
    return <FormSkeleton />;
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[7fr_4fr]">
      <EmptyPreview />

      <div className="flex min-h-0 flex-col overflow-hidden lg:border-l lg:border-neutral-100">
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-5 py-5 sm:px-8 sm:py-6 lg:max-w-lg lg:px-10 lg:py-8">
          <div className="shrink-0">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
              <span>
                {String(stepIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              {step.kind === "text" && <span>Optional</span>}
            </div>
            <div className="mt-3 flex gap-1">
              {steps.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    "h-px flex-1 transition-colors duration-300",
                    i <= stepIndex ? "bg-neutral-900" : "bg-neutral-200"
                  )}
                />
              ))}
            </div>
          </div>

          <div key={step.key} className="mt-6 flex min-h-0 flex-1 flex-col sm:mt-8">
            <h2 className="text-[14px] font-medium tracking-tight text-neutral-900 sm:text-[15px]">
              {step.question}
            </h2>

            <div className="mt-4 min-h-0 flex-1 sm:mt-5">
              {step.kind === "choice" ? (
                <div
                  className={cn(
                    "grid gap-1.5 sm:gap-2",
                    step.options.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
                  )}
                >
                  {step.options.map((option) => {
                    const selected = valueForStep(step.key) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectChoice(step.key, option.value)}
                        aria-pressed={selected}
                        className={cn(
                          "rounded-md border px-3 py-2.5 text-left text-[12px] transition-colors outline-none sm:px-4 sm:py-3 sm:text-[13px]",
                          "focus-visible:ring-1 focus-visible:ring-neutral-400",
                          selected
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                        )}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  autoFocus
                  placeholder="Palette, mood, details…"
                  value={stylePrompt}
                  onChange={(e) => setStylePrompt(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-md border border-neutral-200 bg-white px-4 py-3 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-300 focus:border-neutral-400"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-between border-t border-neutral-100 pt-4 sm:mt-6 sm:pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirst}
              className={cn(
                "font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-0"
              )}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-sm bg-neutral-900 px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-white uppercase transition-opacity hover:opacity-85"
            >
              {isLast ? "Generate" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
