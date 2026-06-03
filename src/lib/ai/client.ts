import OpenAI from "openai";

import { getLlmApiKey, getLlmBaseUrl } from "@/lib/env";

let llmClient: OpenAI | null = null;

/**
 * DeepSeek chat client (OpenAI-compatible HTTP API).
 * Uses the `openai` npm package as an HTTP client only — not the OpenAI service.
 */
export function getLlmClient(): OpenAI | null {
  const apiKey = getLlmApiKey();
  if (!apiKey) return null;

  if (!llmClient) {
    llmClient = new OpenAI({
      apiKey,
      baseURL: getLlmBaseUrl(),
    });
  }

  return llmClient;
}
