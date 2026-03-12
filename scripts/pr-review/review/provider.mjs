import { callOpenAIChatCompletions } from "./providers/openai.mjs";

export async function callProvider({ provider, model, baseUrl, apiKey, prompt }) {
  const p = String(provider || "").toLowerCase();
  switch (p) {
    case "openai":
    case "openai-compatible":
      return await callOpenAIChatCompletions({
        model,
        baseUrl,
        apiKey,
        prompt,
      });
    default:
      throw new Error(
        `Unsupported AI_REVIEW_PROVIDER: ${provider}. Supported: openai, openai-compatible`
      );
  }
}

