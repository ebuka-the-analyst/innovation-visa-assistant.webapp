/**
 * The budget is a SOFTWARE-SIDE estimate using a dated rate snapshot.
 * It is not an OpenAI billing hard cap. We reserve every request's worst
 * output-token allowance BEFORE making the request and do not retry.
 */
export interface BenchmarkCallReservation {
  estimatedInputTokenCeiling: number;
  maxOutputTokens: number;
  reserveUsd: number;
}
export function benchmarkOutputBudget(sectionRequestedTokens: number): number {
  if (!Number.isFinite(sectionRequestedTokens) || sectionRequestedTokens <= 0)
    throw new Error("Invalid section token target");
  return Math.max(14000, Math.min(24000, Math.ceil(sectionRequestedTokens) * 4));
}
export function reserveBenchmarkRequest(prompt: string, maxOutputTokens: number): BenchmarkCallReservation {
  if (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens <= 0 || maxOutputTokens > 24000)
    throw new Error("Invalid benchmark output limit");
  // Extremely conservative byte ceiling, not a tokenizer-derived count.
  const ceiling = Buffer.byteLength(prompt, "utf8") + 4096;
  const long = ceiling > 272000;
  const reserveUsd = (ceiling * (long ? 20 : 10) +
    maxOutputTokens * (long ? 75 : 50)) / 1000000;
  return {
    estimatedInputTokenCeiling: ceiling,
    maxOutputTokens,
    reserveUsd: Number(reserveUsd.toFixed(6))
  };
}
export function assertBenchmarkSpendLimit(
  spentUsd: number, outstandingRequestReserveUsd: number, authorisedBudgetUsd: number,
): void {
  if (![spentUsd, outstandingRequestReserveUsd, authorisedBudgetUsd].every(Number.isFinite) ||
      spentUsd < 0 || outstandingRequestReserveUsd < 0 ||
      authorisedBudgetUsd <= 0 || authorisedBudgetUsd > 60) {
    throw new Error("Invalid benchmark budget or expenditure");
  }
  if (spentUsd + outstandingRequestReserveUsd > authorisedBudgetUsd + 1e-8) {
    throw new Error("STOP: the next paid request would exceed the authorised estimated USD budget");
  }
}
