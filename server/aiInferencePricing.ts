/**
 * Standard-processing OpenAI API rates, effective-dated snapshot.
 * Official documentation (checked 2026-10-11):
 * https://developers.openai.com/api/docs/models/gpt-6-astra
 *
 * USD estimates, NOT paid provider invoices. Charge differences from
 * data residency, Fast mode, tool calls, third-party gateways, cache
 * creation, taxes and future price changes must be reconciled separately.
 *
 * The published Astra long-context threshold is >272,000 INPUT tokens.
 * The higher rate applies to the entire qualifying request.
 */
export const ASTRA_PRICE_VERSION = "openai-gpt-6-astra-standard-2026-10-11";
export interface InferencePricingInput {
  provider: string;
  model: string | null;
  inputTokens: number | null;
  cachedInputTokens: number | null;
  outputTokens: number | null;
  serviceTier?: string | null;
  apiBaseUrl?: string | null;
}

export function estimateStandardAstraUsd(input: InferencePricingInput): {
  costUsdEstimated: number | null;
  costPricingVersion: string | null;
} {
  const unavailable = { costUsdEstimated: null, costPricingVersion: null };
  if (input.provider !== "openai" || input.model !== "gpt-6-astra") return unavailable;
  if (input.inputTokens == null || input.outputTokens == null) return unavailable;
  if (!Number.isSafeInteger(input.inputTokens) || input.inputTokens < 0 ||
      !Number.isSafeInteger(input.outputTokens) || input.outputTokens < 0) return unavailable;
  const cached = input.cachedInputTokens ?? 0;
  if (!Number.isSafeInteger(cached) || cached < 0 || cached > input.inputTokens) return unavailable;
  // An external integration/proxy may have different commercial billing.
  if (input.apiBaseUrl && new URL(input.apiBaseUrl).host !== "api.openai.com") return unavailable;
  if (input.serviceTier && !["default", "auto", "standard"].includes(input.serviceTier)) return unavailable;

  const largeContext = input.inputTokens > 272_000;
  const inputRate = largeContext ? 20 : 10;
  const cachedRate = largeContext ? 2 : 1;
  const outputRate = largeContext ? 75 : 50;
  const costUsd = ((input.inputTokens - cached) * inputRate +
    cached * cachedRate + input.outputTokens * outputRate) / 1_000_000;
  return {
    costUsdEstimated: Number(costUsd.toFixed(8)),
    costPricingVersion: ASTRA_PRICE_VERSION,
  };
}
