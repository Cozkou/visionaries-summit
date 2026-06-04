const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DIRECT_OPENAI_IMAGE_MODEL = "gpt-image-1.5";
const DIRECT_OPENAI_IMAGE_BASE_URL = "https://api.openai.com/v1";
const IMAGEROUTER_BASE_URL = "https://api.imagerouter.io/v1/openai";
const IMAGEROUTER_IMAGE_MODEL = "openai/gpt-image-1.5";

export function getDeepSeekApiKey(): string | undefined {
  return process.env.DEEPSEEK_API_KEY?.trim() || undefined;
}

export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

export function getImageRouterApiKey(): string | undefined {
  return process.env.IMAGEROUTER_API_KEY?.trim() || undefined;
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

/**
 * Backward-compatible image API accessors used by both the merged frontend code
 * and the newer backend ImageRouter/OpenAI generation path.
 */
export function getImageApiKey(): string | undefined {
  return (
    getImageRouterApiKey() ||
    getOpenAiApiKey() ||
    process.env.IMAGE_API_KEY?.trim() ||
    undefined
  );
}

export function getImageApiBaseUrl(): string {
  return (
    process.env.OPENAI_IMAGE_BASE_URL?.trim() ||
    process.env.IMAGE_GENERATION_BASE_URL?.trim() ||
    process.env.IMAGE_API_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    (getImageRouterApiKey()
      ? IMAGEROUTER_BASE_URL
      : DIRECT_OPENAI_IMAGE_BASE_URL)
  );
}

export function getImageModel(): string {
  return (
    process.env.OPENAI_IMAGE_MODEL?.trim() ||
    process.env.IMAGE_GENERATION_MODEL?.trim() ||
    process.env.IMAGE_MODEL?.trim() ||
    (getImageRouterApiKey()
      ? IMAGEROUTER_IMAGE_MODEL
      : DIRECT_OPENAI_IMAGE_MODEL)
  );
}

export function isImageGenerationConfigured(): boolean {
  return Boolean(getImageApiKey());
}

export function getOpenAiImageModel(): string {
  return getImageModel();
}

export function getOpenAiImageBaseUrl(): string {
  return getImageApiBaseUrl();
}

export function isOpenAiImageConfigured(): boolean {
  return isImageGenerationConfigured();
}
