import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/require-api-auth";
import { runDesignGeneration } from "@/lib/design-generation";
import type {
  BusinessGoal,
  GenerationInputs,
  ProductType,
  TargetAudience,
} from "@/types";

export const runtime = "nodejs";

const productTypes: ProductType[] = [
  "Hoodie",
  "T-Shirt",
  "Jacket",
  "Trainers",
  "Cap",
];

const targetAudiences: TargetAudience[] = ["Menswear", "Womenswear"];

const businessGoals: BusinessGoal[] = [
  "Maximize Revenue",
  "Maximize Margin",
  "Low Refund Risk",
];

function isValidInputs(body: unknown): body is GenerationInputs {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    productTypes.includes(o.productType as ProductType) &&
    targetAudiences.includes(o.targetAudience as TargetAudience) &&
    businessGoals.includes(o.businessGoal as BusinessGoal) &&
    (o.stylePrompt === undefined ||
      o.stylePrompt === null ||
      typeof o.stylePrompt === "string")
  );
}

export async function POST(request: Request) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidInputs(body)) {
    return NextResponse.json(
      { error: "Invalid generation inputs" },
      { status: 400 }
    );
  }

  const inputs: GenerationInputs = {
    productType: body.productType,
    targetAudience: body.targetAudience,
    businessGoal: body.businessGoal,
    stylePrompt: body.stylePrompt?.trim() || undefined,
  };

  try {
    const designs = await runDesignGeneration(inputs);
    return NextResponse.json(designs);
  } catch (error) {
    console.error("[POST /api/designs/generate]", error);
    const message =
      error instanceof Error ? error.message : "Design generation failed";
    const status = message.includes("not configured")
      ? 503
      : message.toLowerCase().includes("insufficient credits")
        ? 402
        : message.includes("Free models are only available")
          ? 403
          : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
