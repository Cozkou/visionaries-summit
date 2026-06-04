const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export function getDeepSeekApiKey(): string | undefined {
  return process.env.DEEPSEEK_API_KEY?.trim() || undefined;
}

export function getLlmApiKey(): string | undefined {
  return getDeepSeekApiKey();
}

export function getLlmBaseUrl(): string {
  return process.env.DEEPSEEK_BASE_URL?.trim() || DEEPSEEK_BASE_URL;
}

export function getLlmTextModel(): string {
  return (
    process.env.LLM_TEXT_MODEL?.trim() ||
    process.env.DEEPSEEK_TEXT_MODEL?.trim() ||
    "deepseek-chat"
  );
}

export function isLlmConfigured(): boolean {
  return Boolean(getDeepSeekApiKey());
}

/** OpenAI (or compatible) key used for concept product imagery. */
export function getImageApiKey(): string | undefined {
  return (
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.IMAGE_API_KEY?.trim() ||
    undefined
  );
}

export function getImageApiBaseUrl(): string {
  return (
    process.env.IMAGE_API_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    "https://api.openai.com/v1"
  );
}

export function getImageModel(): string {
  return process.env.IMAGE_MODEL?.trim() || "dall-e-3";
}

export function isImageGenerationConfigured(): boolean {
  return Boolean(getImageApiKey());
}
