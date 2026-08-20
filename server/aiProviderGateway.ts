import type { Express, Request } from "express";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { dbPool } from "./db";
import { isAuthenticated, requireAdmin } from "./auth";

export const PLATFORM_LATEST_OPENAI_MODEL = "gpt-5.6";
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

type ProviderId = "openai" | "anthropic";
type ProviderSetting = {
  provider: ProviderId;
  enabled: boolean;
  priority: number;
  model: string;
};

const DEFAULT_SETTINGS: ProviderSetting[] = [
  { provider: "openai", enabled: true, priority: 1, model: "platform-latest" },
  { provider: "anthropic", enabled: false, priority: 2, model: DEFAULT_ANTHROPIC_MODEL },
];

function upstreamOpenAIKey(): string {
  const captured = String(process.env.UPSTREAM_OPENAI_API_KEY || "").trim();
  if (captured) return captured;
  if (process.env.AI_PROVIDER_GATEWAY_ACTIVE === "1") return "";
  return String(process.env.OPENAI_API_KEY || "").trim();
}

function configured(provider: ProviderId): boolean {
  if (provider === "openai") return Boolean(upstreamOpenAIKey());
  return Boolean(String(process.env.ANTHROPIC_API_KEY || "").trim());
}

function resolveModel(setting: ProviderSetting): string {
  if (setting.provider === "openai" && setting.model === "platform-latest") {
    return PLATFORM_LATEST_OPENAI_MODEL;
  }
  return setting.model;
}

async function readSettings(): Promise<ProviderSetting[]> {
  try {
    const result: any = await (dbPool as any).query(
      `SELECT provider, enabled, priority, model
       FROM ai_provider_settings
       WHERE provider IN ('openai', 'anthropic')
       ORDER BY priority ASC, provider ASC`,
    );
    const rows = Array.isArray(result?.rows) ? result.rows : [];
    if (!rows.length) return DEFAULT_SETTINGS;
    const byProvider = new Map(rows.map((row: any) => [String(row.provider), row]));
    return DEFAULT_SETTINGS.map((fallback) => {
      const row: any = byProvider.get(fallback.provider);
      return row
        ? {
            provider: fallback.provider,
            enabled: Boolean(row.enabled),
            priority: Math.max(1, Number(row.priority) || fallback.priority),
            model: String(row.model || fallback.model).trim() || fallback.model,
          }
        : fallback;
    }).sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.warn("[AI Gateway] Provider settings unavailable; using safe OpenAI-first defaults", error);
    return DEFAULT_SETTINGS;
  }
}

function isRecoverableProviderError(error: any): boolean {
  const status = Number(error?.status || error?.statusCode || 0);
  return status === 408 || status === 409 || status === 429 || status >= 500 || !status;
}

function internalGatewayAuthorised(req: Request): boolean {
  const expected = String(process.env.INTERNAL_AI_GATEWAY_TOKEN || "");
  const auth = String(req.get("authorization") || "");
  return Boolean(expected && auth === `Bearer ${expected}`);
}

function normaliseTextContent(content: any): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content == null ? "" : JSON.stringify(content);
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" || part?.type === "input_text") return String(part.text || "");
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function anthropicMessages(messages: any[]): { system?: string; messages: any[] } {
  const systemParts: string[] = [];
  const converted: any[] = [];
  for (const message of messages || []) {
    const role = String(message?.role || "user");
    if (role === "system" || role === "developer") {
      systemParts.push(normaliseTextContent(message?.content));
      continue;
    }
    if (role !== "user" && role !== "assistant") continue;
    converted.push({ role, content: normaliseTextContent(message?.content) });
  }
  if (!converted.length) converted.push({ role: "user", content: "Please respond to the supplied instruction." });
  return { system: systemParts.filter(Boolean).join("\n\n") || undefined, messages: converted };
}

function anthropicTools(tools: any[] | undefined): any[] | undefined {
  if (!Array.isArray(tools) || !tools.length) return undefined;
  const converted = tools
    .filter((tool) => tool?.type === "function" && tool?.function?.name)
    .map((tool) => ({
      name: tool.function.name,
      description: tool.function.description || "",
      input_schema: tool.function.parameters || { type: "object", properties: {} },
    }));
  return converted.length ? converted : undefined;
}

function chatCompletionFromAnthropic(response: any, providerModel: string): any {
  const text = Array.isArray(response?.content)
    ? response.content.filter((block: any) => block?.type === "text").map((block: any) => block.text || "").join("\n")
    : "";
  const toolCalls = Array.isArray(response?.content)
    ? response.content
        .filter((block: any) => block?.type === "tool_use")
        .map((block: any) => ({
          id: block.id,
          type: "function",
          function: { name: block.name, arguments: JSON.stringify(block.input || {}) },
        }))
    : [];
  return {
    id: response?.id || `anthropic-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: providerModel,
    provider: "anthropic",
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: text || null,
        ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
      },
      finish_reason: toolCalls.length ? "tool_calls" : "stop",
    }],
    usage: {
      prompt_tokens: Number(response?.usage?.input_tokens || 0),
      completion_tokens: Number(response?.usage?.output_tokens || 0),
      total_tokens: Number(response?.usage?.input_tokens || 0) + Number(response?.usage?.output_tokens || 0),
    },
  };
}

function responseFromAnthropic(response: any, providerModel: string): any {
  const outputText = Array.isArray(response?.content)
    ? response.content.filter((block: any) => block?.type === "text").map((block: any) => block.text || "").join("\n")
    : "";
  return {
    id: response?.id || `anthropic-${Date.now()}`,
    object: "response",
    created_at: Math.floor(Date.now() / 1000),
    status: "completed",
    model: providerModel,
    provider: "anthropic",
    output_text: outputText,
    output: [{
      id: `msg-${Date.now()}`,
      type: "message",
      status: "completed",
      role: "assistant",
      content: [{ type: "output_text", text: outputText, annotations: [] }],
    }],
    usage: {
      input_tokens: Number(response?.usage?.input_tokens || 0),
      output_tokens: Number(response?.usage?.output_tokens || 0),
      total_tokens: Number(response?.usage?.input_tokens || 0) + Number(response?.usage?.output_tokens || 0),
    },
  };
}

async function callChatWithProvider(setting: ProviderSetting, body: any): Promise<any> {
  const model = resolveModel(setting);
  if (setting.provider === "openai") {
    const client = new OpenAI({ apiKey: upstreamOpenAIKey(), baseURL: "https://api.openai.com/v1" });
    const payload: any = {
      ...body,
      model,
      stream: false,
    };
    if (payload.max_tokens != null && payload.max_completion_tokens == null) {
      payload.max_completion_tokens = payload.max_tokens;
      delete payload.max_tokens;
    }
    const isGpt5Family = /^gpt-5/i.test(model);
    if (isGpt5Family) {
      delete payload.temperature;
      // GPT-5.6 defaults to medium reasoning. Use low reasoning for ordinary
      // Chat Completions unless the caller deliberately selected another effort.
      if (payload.reasoning_effort == null) payload.reasoning_effort = "low";
    }

    const hasAssistantOutput = (completion: any): boolean => {
      const choice = completion?.choices?.[0];
      const text = normaliseTextContent(choice?.message?.content).trim();
      const toolCalls = Array.isArray(choice?.message?.tool_calls) ? choice.message.tool_calls : [];
      return Boolean(text || toolCalls.length);
    };

    let result: any = await client.chat.completions.create(payload);

    // A reasoning model can return HTTP 200 but consume its whole completion budget
    // on reasoning, leaving message.content empty. Treat that as an incomplete
    // provider result, retry once with reasoning disabled and a safe output floor,
    // then surface a recoverable provider error so configured fallback can run.
    if (!hasAssistantOutput(result)) {
      const finishReason = String(result?.choices?.[0]?.finish_reason || "unknown");
      const reasoningTokens = Number(result?.usage?.completion_tokens_details?.reasoning_tokens || 0);
      console.warn(
        `[AI Gateway] Empty OpenAI chat completion from ${model}; finish_reason=${finishReason}; reasoning_tokens=${reasoningTokens}. Retrying with visible-output safeguards.`,
      );

      if (isGpt5Family) {
        const retryPayload: any = {
          ...payload,
          reasoning_effort: "none",
          max_completion_tokens: Math.max(Number(payload.max_completion_tokens || 0), 4_000),
        };
        result = await client.chat.completions.create(retryPayload);
      }

      if (!hasAssistantOutput(result)) {
        const retryFinishReason = String(result?.choices?.[0]?.finish_reason || finishReason || "unknown");
        const error: any = new Error(
          `AI provider returned an empty completion (finish_reason=${retryFinishReason})`,
        );
        error.status = 503;
        throw error;
      }
    }

    result.provider = "openai";
    return result;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
  const converted = anthropicMessages(body?.messages || []);
  const result = await client.messages.create({
    model,
    max_tokens: Math.max(256, Number(body?.max_completion_tokens || body?.max_tokens || 4096)),
    ...(converted.system ? { system: converted.system } : {}),
    messages: converted.messages,
    ...(anthropicTools(body?.tools) ? { tools: anthropicTools(body?.tools) } : {}),
  } as any);
  return chatCompletionFromAnthropic(result, model);
}

function responseInputToMessages(input: any): any[] {
  if (typeof input === "string") return [{ role: "user", content: input }];
  if (!Array.isArray(input)) return [{ role: "user", content: normaliseTextContent(input) }];
  return input.map((item) => ({
    role: item?.role === "assistant" ? "assistant" : item?.role === "system" || item?.role === "developer" ? item.role : "user",
    content: normaliseTextContent(item?.content ?? item),
  }));
}

async function callResponseWithProvider(setting: ProviderSetting, body: any): Promise<any> {
  const model = resolveModel(setting);
  if (setting.provider === "openai") {
    const client = new OpenAI({ apiKey: upstreamOpenAIKey(), baseURL: "https://api.openai.com/v1" });
    const result: any = await client.responses.create({ ...body, model, stream: false } as any);
    result.provider = "openai";
    return result;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
  const converted = anthropicMessages(responseInputToMessages(body?.input));
  const result = await client.messages.create({
    model,
    max_tokens: Math.max(256, Number(body?.max_output_tokens || 4096)),
    ...(converted.system ? { system: converted.system } : {}),
    messages: converted.messages,
  } as any);
  return responseFromAnthropic(result, model);
}

async function withProviderFallback(operation: (setting: ProviderSetting) => Promise<any>): Promise<any> {
  const settings = (await readSettings())
    .filter((setting) => setting.enabled && configured(setting.provider))
    .sort((a, b) => a.priority - b.priority);
  if (!settings.length) {
    const error: any = new Error("No enabled AI provider has a configured server-side API key");
    error.status = 503;
    throw error;
  }

  let lastError: any = null;
  for (const setting of settings) {
    try {
      return await operation(setting);
    } catch (error: any) {
      lastError = error;
      console.error(`[AI Gateway] ${setting.provider}/${resolveModel(setting)} failed:`, error?.message || error);
      if (!isRecoverableProviderError(error)) break;
    }
  }
  throw lastError || new Error("All enabled AI providers failed");
}

function trustedWriteOrigin(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host === req.get("host");
  } catch {
    return false;
  }
}

export function registerAIProviderGatewayRoutes(app: Express): void {
  app.post("/internal-ai-gateway/v1/chat/completions", async (req, res) => {
    if (!internalGatewayAuthorised(req)) return res.status(401).json({ error: { message: "Unauthorised internal AI gateway request" } });
    try {
      const result = await withProviderFallback((setting) => callChatWithProvider(setting, req.body || {}));
      res.setHeader("x-ai-provider", String(result?.provider || "managed"));
      res.setHeader("x-ai-model", String(result?.model || ""));
      res.json(result);
    } catch (error: any) {
      res.status(Number(error?.status || 503)).json({ error: { message: error?.message || "AI provider unavailable", type: "managed_ai_provider_error" } });
    }
  });

  app.post("/internal-ai-gateway/v1/responses", async (req, res) => {
    if (!internalGatewayAuthorised(req)) return res.status(401).json({ error: { message: "Unauthorised internal AI gateway request" } });
    try {
      const result = await withProviderFallback((setting) => callResponseWithProvider(setting, req.body || {}));
      res.setHeader("x-ai-provider", String(result?.provider || "managed"));
      res.setHeader("x-ai-model", String(result?.model || ""));
      res.json(result);
    } catch (error: any) {
      res.status(Number(error?.status || 503)).json({ error: { message: error?.message || "AI provider unavailable", type: "managed_ai_provider_error" } });
    }
  });
}

export function registerAIProviderAdminRoutes(app: Express): void {
  app.get("/api/admin/ai-providers", isAuthenticated, requireAdmin, async (_req, res) => {
    const settings = await readSettings();
    res.setHeader("Cache-Control", "no-store");
    res.json({
      policy: {
        defaultProvider: "openai",
        platformLatestOpenAIModel: PLATFORM_LATEST_OPENAI_MODEL,
        forbiddenProviders: ["q" + "wen"],
        apiKeysStoredServerSideOnly: true,
      },
      providers: settings.sort((a, b) => a.priority - b.priority).map((setting, index) => ({
        ...setting,
        resolvedModel: resolveModel(setting),
        configured: configured(setting.provider),
        primary: setting.enabled && index === settings.findIndex((candidate) => candidate.enabled),
        keyEnvironmentVariable: setting.provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY",
      })),
    });
  });

  app.put("/api/admin/ai-providers", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      if (!req.is("application/json")) return res.status(415).json({ error: "Content-Type must be application/json" });
      if (!trustedWriteOrigin(req)) return res.status(403).json({ error: "Untrusted request origin" });
      const providers = Array.isArray(req.body?.providers) ? req.body.providers : null;
      if (!providers || providers.length !== 2) return res.status(422).json({ error: "Provide OpenAI and Anthropic settings" });

      const allowed = new Set<ProviderId>(["openai", "anthropic"]);
      const parsed: ProviderSetting[] = providers.map((raw: any) => ({
        provider: String(raw?.provider || "") as ProviderId,
        enabled: raw?.enabled === true,
        priority: Number(raw?.priority),
        model: String(raw?.model || "").trim(),
      }));
      if (parsed.some((item) => !allowed.has(item.provider) || !Number.isInteger(item.priority) || item.priority < 1 || !item.model || item.model.length > 160)) {
        return res.status(422).json({ error: "Invalid AI provider configuration" });
      }
      if (new Set(parsed.map((item) => item.provider)).size !== 2 || new Set(parsed.map((item) => item.priority)).size !== 2) {
        return res.status(422).json({ error: "Providers and priorities must be unique" });
      }
      if (!parsed.some((item) => item.enabled)) return res.status(422).json({ error: "At least one provider must be enabled" });
      const unavailableEnabled = parsed.find((item) => item.enabled && !configured(item.provider));
      if (unavailableEnabled) return res.status(422).json({ error: `${unavailableEnabled.provider} cannot be enabled until its server-side API key is configured` });

      const userId = String((req.user as any)?.id || "admin");
      const client: any = await (dbPool as any).connect();
      try {
        await client.query("BEGIN");
        for (const item of parsed) {
          await client.query(
            `INSERT INTO ai_provider_settings (provider, enabled, priority, model, updated_by, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (provider) DO UPDATE SET enabled = EXCLUDED.enabled, priority = EXCLUDED.priority, model = EXCLUDED.model, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
            [item.provider, item.enabled, item.priority, item.model, userId],
          );
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
      res.json({ success: true, providers: (await readSettings()).sort((a, b) => a.priority - b.priority) });
    } catch (error: any) {
      console.error("[AI Provider Admin] Save failed", error);
      res.status(500).json({ error: "Could not save AI provider configuration" });
    }
  });

  app.post("/api/admin/ai-providers/:provider/test", isAuthenticated, requireAdmin, async (req, res) => {
    const provider = String(req.params.provider || "") as ProviderId;
    if (provider !== "openai" && provider !== "anthropic") return res.status(404).json({ error: "Unknown provider" });
    if (!configured(provider)) return res.status(422).json({ error: "Provider API key is not configured on the server" });
    const setting = (await readSettings()).find((item) => item.provider === provider) || DEFAULT_SETTINGS.find((item) => item.provider === provider)!;
    try {
      const result = await callChatWithProvider(setting, {
        messages: [{ role: "user", content: "Reply with exactly: provider test successful" }],
        max_completion_tokens: 32,
      });
      res.json({ success: true, provider, model: result?.model || resolveModel(setting) });
    } catch (error: any) {
      res.status(502).json({ error: error?.message || "Provider test failed" });
    }
  });
}
