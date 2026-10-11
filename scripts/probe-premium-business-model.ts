/**
 * Authenticated premium-model availability probe.
 *
 * Runs only when explicitly requested using --live and the enabling variable.
 * No document/prompt text or API credentials are ever printed.
 *
 * Example (isolated staging shell):
 * IFVA_ENABLE_PAID_AI_PROBE=yes UPSTREAM_OPENAI_API_KEY=... \
 *   node --import tsx scripts/probe-premium-business-model.ts --live
 */
import OpenAI from "openai";
import { estimateStandardAstraUsd } from "../server/aiInferencePricing";

const model = "gpt-6-astra";
const enabled = process.argv.includes("--live") && process.env.IFVA_ENABLE_PAID_AI_PROBE === "yes";
if (!enabled) {
  console.error("NOT RUN: Pass --live and set IFVA_ENABLE_PAID_AI_PROBE=yes in an authorised staging environment.");
  process.exit(2);
}
const key = String(process.env.UPSTREAM_OPENAI_API_KEY || "").trim();
if (!key) {
  console.error("NOT RUN: A direct upstream OpenAI API key is required. Do not use the internal gateway token.");
  process.exit(2);
}
const client = new OpenAI({ apiKey: key, baseURL: "https://api.openai.com/v1", maxRetries: 0, timeout: 90_000 });
const started = Date.now();

try {
  const reply: any = await client.responses.create({
    model,
    input: `You are preparing an Innovator Founder business plan. This is a short capability test, not a customer plan.
Using only these fictional sample facts: founder has a proposed UK software product; no customers, patents, contracts or verified revenue.
Return a short evidence-led paragraph identifying one innovation hypothesis, two evidence gaps and a non-guarantee of endorsement. Do not invent supporting evidence.`,
    reasoning: { effort: "high" },
    // High reasoning consumes part of the output budget before visible prose.
    // Maximum spend remains bounded at 4,000 output tokens.
    max_output_tokens: 4000,
    text: { verbosity: "medium" },
    store: false,
  } as any);
  const output = String(reply.output_text || "").trim();
  if (!output || reply.status !== "completed") throw new Error("No completed usable model output");
  if (!/innov|hypothes|evidence|endorse|customer/i.test(output)) throw new Error("Output failed minimal task relevance check");
  if (reply.model !== model) throw new Error("API returned a different model than requested");
  const usage = reply.usage || {};
  const rate = estimateStandardAstraUsd({
    provider: "openai", model: reply.model,
    inputTokens: usage.input_tokens ?? null,
    cachedInputTokens: usage.input_tokens_details?.cached_tokens ?? 0,
    outputTokens: usage.output_tokens ?? null,
    apiBaseUrl: "https://api.openai.com/v1",
    serviceTier: reply.service_tier || "default",
  });
  console.log(JSON.stringify({
    success: true, model: reply.model, status: reply.status, ms: Date.now() - started,
    inputTokens: usage.input_tokens ?? null,
    outputTokens: usage.output_tokens ?? null,
    reasoningTokens: usage.output_tokens_details?.reasoning_tokens ?? null,
    estimatedUsd: rate.costUsdEstimated,
    benchmark: "short-capability-only, no full-plan quality claim",
  }, null, 2));
} catch (error: any) {
  console.error(JSON.stringify({
    success: false,
    status: Number(error?.status || 0) || null,
    errorType: String(error?.type || error?.code || error?.name || "unknown").slice(0, 80),
    message: "Flagship model test failed. Inspect credential permissions, quotas and server-side provider diagnostics.",
  }));
  process.exitCode = 1;
}
