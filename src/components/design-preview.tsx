"use client";

import { cn } from "@/lib/utils";
import type {
  BusinessGoal,
  ProductType,
  TargetAudience,
} from "@/types";

type ActiveStepKey =
  | "productType"
  | "targetAudience"
  | "businessGoal"
  | "stylePrompt";

interface DesignPreviewProps {
  productType: ProductType;
  targetAudience: TargetAudience;
  businessGoal: BusinessGoal;
  stylePrompt: string;
  activeStepKey: ActiveStepKey;
  stepIndex: number;
}

const svgProps = {
  viewBox: "0 0 200 200",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Hoodie() {
  return (
    <svg {...svgProps} className="h-full w-full">
      <path d="M70 40 L60 50 Q50 60 40 66 L30 90 L48 100 L52 86 L52 160 L148 160 L148 86 L152 100 L170 90 L160 66 Q150 60 140 50 L130 40" />
      <path d="M70 40 Q80 64 100 64 Q120 64 130 40" />
      <path d="M70 40 Q100 30 130 40" />
      <path d="M82 110 L82 160 M118 110 L118 160" />
      <path d="M86 64 L86 92 L114 92 L114 64" />
    </svg>
  );
}

function TShirt() {
  return (
    <svg {...svgProps} className="h-full w-full">
      <path d="M72 42 L56 50 Q44 56 34 64 L24 92 L44 102 L52 88 L52 162 L148 162 L148 88 L156 102 L176 92 L166 64 Q156 56 144 50 L128 42" />
      <path d="M72 42 Q82 60 100 60 Q118 60 128 42" />
      <path d="M72 42 Q100 34 128 42" />
    </svg>
  );
}

function Jacket() {
  return (
    <svg {...svgProps} className="h-full w-full">
      <path d="M74 38 L58 48 Q46 56 36 64 L26 94 L44 104 L52 90 L52 164 L100 164 L148 164 L148 90 L156 104 L174 94 L164 64 Q154 56 142 48 L126 38" />
      <path d="M74 38 L100 60 L126 38" />
      <path d="M100 60 L100 164" />
      <path d="M88 84 L88 92 M88 108 L88 116 M88 132 L88 140" />
      <path d="M62 110 L78 110 L78 138 L62 138 Z" />
      <path d="M138 110 L122 110 L122 138 L138 138 Z" />
    </svg>
  );
}

function Trainers() {
  return (
    <svg {...svgProps} className="h-full w-full">
      <path d="M28 132 L28 108 Q28 96 42 92 L78 80 Q90 76 98 86 L116 108 Q124 116 138 118 L162 122 Q174 124 174 136 L174 144 Q174 150 168 150 L36 150 Q28 150 28 142 Z" />
      <path d="M28 138 L174 138" />
      <path d="M70 86 L80 104 M86 82 L98 100 M102 90 L114 106" />
      <path d="M40 150 L40 158 M160 150 L160 158" />
    </svg>
  );
}

function Cap() {
  return (
    <svg {...svgProps} className="h-full w-full">
      <path d="M40 116 Q40 70 100 70 Q160 70 160 116 L100 116 Z" />
      <path d="M100 116 L172 132 Q180 134 180 126 Q180 116 168 114 L100 116" />
      <path d="M68 110 Q70 84 100 82 M100 82 Q130 84 132 110" />
      <path d="M100 70 L100 78" />
    </svg>
  );
}

const silhouettes: Record<ProductType, () => React.ReactElement> = {
  Hoodie,
  "T-Shirt": TShirt,
  Jacket,
  Trainers,
  Cap,
};

export function DesignPreview({
  productType,
  targetAudience,
  businessGoal,
  stylePrompt,
  activeStepKey,
  stepIndex,
}: DesignPreviewProps) {
  const Silhouette = silhouettes[productType];

  const rows: {
    key: ActiveStepKey;
    label: string;
    value: string;
    revealed: boolean;
  }[] = [
    {
      key: "productType",
      label: "Product",
      value: productType,
      revealed: true,
    },
    {
      key: "targetAudience",
      label: "Fit",
      value: targetAudience,
      revealed: stepIndex >= 1,
    },
    {
      key: "businessGoal",
      label: "Objective",
      value: businessGoal,
      revealed: stepIndex >= 2,
    },
    {
      key: "stylePrompt",
      label: "Style notes",
      value: stylePrompt.trim() || "None",
      revealed: stepIndex >= 3,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-3 shrink-0 font-mono text-[11px] text-neutral-500">
        preview
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 w-full flex-1 overflow-hidden border border-neutral-200 bg-neutral-100">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div
            key={productType}
            className="reveal-on-load h-full w-full text-foreground/80"
          >
            <Silhouette />
          </div>
        </div>
        <div className="absolute top-3 left-4 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
          Concept Draft
        </div>
      </div>

      {/* Spec sheet */}
      <dl className="mt-4 shrink-0 divide-y divide-border border-t border-b">
        {rows.map((row) => {
          const isActive = row.key === activeStepKey;
          return (
            <div
              key={row.key}
              className={cn(
                "flex items-center justify-between gap-4 py-3 pl-2 pr-1 transition-all",
                isActive
                  ? "border-l-2 border-neutral-900 bg-neutral-50"
                  : "border-l-2 border-transparent"
              )}
            >
              <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                {row.label}
              </dt>
              <dd
                className={cn(
                  "truncate text-right text-sm",
                  row.revealed
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                {row.revealed ? row.value : "—"}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
