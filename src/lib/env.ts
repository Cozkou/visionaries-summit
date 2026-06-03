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
