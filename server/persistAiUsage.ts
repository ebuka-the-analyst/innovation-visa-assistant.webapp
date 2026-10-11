import { dbPool } from "./db";
import type { gatewayUsageEvent } from "./aiGatewayUsage";

type AiUsageEvent = ReturnType<typeof gatewayUsageEvent>;

/**
 * Records actual provider token usage, not a fabricated monetary estimate.
 * Failing the ledger must not leak prompts or customer content into logs.
 * Set AI_USAGE_LEDGER_REQUIRED=true after migration verification to make
 * missing usage accounting a request-level failure.
 */
export async function persistPremiumAiUsage(event: AiUsageEvent): Promise<void> {
  if (event.workload === "other") return;
  try {
    await (dbPool as any).query(
      `INSERT INTO ai_inference_usage
       (provider, provider_response_id, model, operation, workload, job_id,
        input_tokens, cached_input_tokens, output_tokens, reasoning_tokens,
        latency_ms, cost_usd, cost_pricing_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NULL,NULL)
       ON CONFLICT (provider, provider_response_id)
       WHERE provider_response_id IS NOT NULL DO NOTHING`,
      [
        event.provider,
        event.providerResponseId,
        event.model,
        event.operation,
        event.workload,
        event.jobId,
        event.inputTokens,
        event.cachedInputTokens,
        event.outputTokens,
        event.reasoningTokens,
        event.durationMs,
      ],
    );
  } catch (error: any) {
    console.error("[AI Gateway] Premium usage ledger unavailable", {
      code: String(error?.code || "unknown").slice(0, 30),
    });
    if (process.env.AI_USAGE_LEDGER_REQUIRED === "true") throw error;
  }
}
