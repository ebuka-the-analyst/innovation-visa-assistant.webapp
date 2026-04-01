import OpenAI from "openai";

/**
 * Central Qwen AI client using OpenAI-compatible API.
 * Model mapping:
 *   qwen-plus       → high-quality, general purpose (replaces gpt-4o)
 *   qwen-turbo      → fast, lightweight tasks (replaces gpt-4o-mini)
 *   qwen-vl-plus    → vision / image understanding (replaces gpt-4o vision)
 */

const QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

export const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY || "",
  baseURL: QWEN_BASE_URL,
});

export const QWEN_MODELS = {
  plus: "qwen-plus",       // Most capable — use for complex reasoning, blog generation, scoring
  turbo: "qwen-turbo",     // Fast — use for quick completions, chat replies
  vl: "qwen-vl-plus",      // Vision — use for document/image extraction
} as const;
