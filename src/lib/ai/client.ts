import OpenAI from "openai";

import {
  getImageRouterApiKey,
  getLlmApiKey,
  getLlmBaseUrl,
  getOpenAiApiKey,
  getOpenAiImageBaseUrl,
} from "@/lib/env";

let llmClient: OpenAI | null = null;
let openAiImageClient: OpenAI | null = null;

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

export function getOpenAiImageClient(): OpenAI | null {
  const apiKey = getImageRouterApiKey() || getOpenAiApiKey();
  if (!apiKey) return null;

  if (!openAiImageClient) {
    openAiImageClient = new OpenAI({
      apiKey,
      baseURL: getOpenAiImageBaseUrl(),
    });
  }

  return openAiImageClient;
}
