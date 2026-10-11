/**
 * Metadata-only AI usage event. Never log prompts, generated text, API keys,
 * session cookies, or unvalidated user-controlled request fields.
 */
export type GatewayWorkload = "business_plan_generation" | "business_plan_revision" | "other";

export function gatewayWorkload(value: unknown): GatewayWorkload {
  if (value === "business_plan_generation" || value === "business_plan_revision") return value;
  return "other";
}

function finiteNonNegativeTokenCount(value: unknown): number | null {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : null;
}

export function gatewayUsageEvent(
  response: any,
  operation: "responses" | "chat_completions",
  workload: GatewayWorkload,
  durationMs: number,
) {
  const usage = response?.usage;
  const inputTokens = finiteNonNegativeTokenCount(usage?.input_tokens ?? usage?.prompt_tokens);
  const outputTokens = finiteNonNegativeTokenCount(usage?.output_tokens ?? usage?.completion_tokens);
  const reasoningTokens = finiteNonNegativeTokenCount(
    usage?.output_tokens_details?.reasoning_tokens ??
    usage?.completion_tokens_details?.reasoning_tokens,
  );
  return {
    event: "ai.gateway.usage",
    timestamp: new Date().toISOString(),
    workload,
    operation,
    provider: response?.provider === "anthropic" ? "anthropic" : response?.provider === "openai" ? "openai" : "unknown",
    model: typeof response?.model === "string" ? response.model.slice(0, 160) : null,
    inputTokens,
    outputTokens,
    reasoningTokens,
    durationMs: Math.max(0, Math.floor(durationMs)),
    // Prices are not fabricated: Phase 2 cost ledger will use an audited
    // effective-dated provider pricing table, including cache/read rates.
    costGbp: null,
  };
}
