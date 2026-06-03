import { createDesignConcepts } from "@/lib/generate-designs";
import { getLlmClient } from "@/lib/ai/client";
import { getLlmTextModel } from "@/lib/env";
import {
  buildSalesContextForGeneration,
  getCategorySnapshot,
} from "@/lib/data/sales-analytics";
import type { Design, GenerationInputs } from "@/types";

interface LlmConcept {
  name: string;
  description: string;
}

interface LlmResponse {
  concepts: LlmConcept[];
}

export async function generateConceptsWithAi(
  inputs: GenerationInputs
): Promise<Design[]> {
  const llm = getLlmClient();
  const snap = getCategorySnapshot(inputs);
  const salesContext = buildSalesContextForGeneration(inputs);
  const retailPrice = snap.dataDrivenPriceGbp || snap.avgSellingPriceGbp;

  if (!llm) {
    return createDesignConcepts(inputs, snap);
  }

  const styleNote = inputs.stylePrompt?.trim()
    ? `Style direction: ${inputs.stylePrompt.trim()}.`
    : "No extra style prompt.";

  try {
    const completion = await llm.chat.completions.create({
      model: getLlmTextModel(),
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You name Pretty Fly product concepts. Use ONLY provided CSV statistics. Do not invent sales figures. Return JSON only.",
        },
        {
          role: "user",
          content: `Generate exactly 6 concepts as JSON: { "concepts": [{ "name": string, "description": string }] }.

${salesContext}

Product brief: ${inputs.productType} for ${inputs.targetAudience}
Goal: ${inputs.businessGoal}
${styleNote}

Each description must name the historical bestseller it extends. Do NOT include prices in JSON.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty LLM response");

    const parsed = JSON.parse(raw) as LlmResponse;
    if (!Array.isArray(parsed.concepts) || parsed.concepts.length === 0) {
      throw new Error("Invalid concepts array");
    }

    return parsed.concepts.slice(0, 6).map((concept, index) => {
      const topSeller = snap.topProducts[index % snap.topProducts.length];
      const sellerRef = topSeller
        ? ` Based on bestseller "${topSeller.title}" (${topSeller.productId}) — ${topSeller.unitsSold.toLocaleString()} units sold per line_items.csv.`
        : "";

      return {
        id: crypto.randomUUID(),
        name: concept.name.trim(),
        description: `${concept.description.trim()}${sellerRef}`,
        retailPrice,
        imageUrl: "",
      };
    });
  } catch (error) {
    console.error("[generate-concepts] LLM failed, using templates:", error);
    return createDesignConcepts(inputs, snap);
  }
}
