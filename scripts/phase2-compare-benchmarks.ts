/**
 * Compare a completed, fictional Founder Pro benchmark with the already
 * reviewed baseline from the first paid run and its no-cost corrected reflow.
 * This script NEVER sends API requests. It does not equate page count
 * improvements with independent source verification.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface ComparableBenchmark {
  actualPdfPages: number;
  substantivePageCount: number | null;
  nearEmptyInteriorPages: number[] | null;
  wordCount: number;
  completedSections: number;
  estimatedCostUsd: number;
  qualityGatePassed: boolean;
  blockingWarnings: string[];
}

export const BASELINE_ONE: ComparableBenchmark = {
  // Corrected PDF reflow of the exact first paid generation, not the inflated
  // initial 60-page export. This reflow required zero extra model tokens.
  actualPdfPages: 51,
  substantivePageCount: 50,
  nearEmptyInteriorPages: [],
  wordCount: 16571,
  completedSections: 13,
  estimatedCostUsd: 3.62369,
  qualityGatePassed: false,
  blockingWarnings: ["Below the Founder Pro 56-page minimum after corrected layout."],
};

function numeric(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : NaN;
}
export function parseBenchmarkTwo(report: any): ComparableBenchmark {
  if (report?.setup?.fictionalCase !== "marketplace" ||
      report?.setup?.tier !== "founder_pro" ||
      report?.setup?.model !== "gpt-6-astra") {
    throw new Error("Benchmark identity mismatch. Do not compare different cases or tiers.");
  }
  const assessment = report?.benchmark;
  const inspection = assessment?.pdfInspection;
  const estimatedCostUsd = numeric(report?.usedEstimatedUsd);
  const actualPdfPages = numeric(assessment?.actualPdfPages);
  const wordCount = numeric(assessment?.wordCount);
  const completedSections = numeric(assessment?.sections?.located);
  if (![estimatedCostUsd, actualPdfPages, wordCount, completedSections].every(Number.isFinite) ||
      estimatedCostUsd < 0 || actualPdfPages < 1 || completedSections < 0) {
    throw new Error("Missing or invalid current benchmark metrics");
  }
  return {
    actualPdfPages,
    substantivePageCount: inspection ? numeric(inspection.substantivePageCount) : null,
    nearEmptyInteriorPages: Array.isArray(inspection?.nearEmptyInteriorPages)
      ? inspection.nearEmptyInteriorPages : null,
    wordCount,
    completedSections,
    estimatedCostUsd,
    qualityGatePassed: assessment.releaseGatePassed === true,
    blockingWarnings: Array.isArray(assessment.formattingWarnings) ? assessment.formattingWarnings : [],
  };
}

export function compareBenchmarks(second: ComparableBenchmark) {
  const improvement = (next: number, previous: number) => Number((next - previous).toFixed(3));
  const substantiveDelta = second.substantivePageCount === null
    ? null : improvement(second.substantivePageCount, BASELINE_ONE.substantivePageCount!);
  const nearEmpty = second.nearEmptyInteriorPages?.length ?? null;
  const passesLength = second.actualPdfPages >= 56 &&
    second.substantivePageCount !== null && second.substantivePageCount >= 56;
  const zeroGaps = nearEmpty === 0;
  return {
    baselineOne: BASELINE_ONE,
    benchmarkTwo: second,
    delta: {
      physicalPages: improvement(second.actualPdfPages, BASELINE_ONE.actualPdfPages),
      substantivePages: substantiveDelta,
      words: improvement(second.wordCount, BASELINE_ONE.wordCount),
      estimatedCostUsd: improvement(second.estimatedCostUsd, BASELINE_ONE.estimatedCostUsd),
    },
    automatedReleaseGate: passesLength && zeroGaps &&
      second.completedSections === 13 && second.qualityGatePassed,
    humanOriginalSourceVerificationRequired: true,
    humanFinanceAuditRequired: true,
    visualPdfAndWordReviewRequired: true,
    providerInvoiceReconciliationRequired: true,
    note: "An automated structural pass is never proof of endorsement eligibility or factual accuracy.",
  };
}

async function cli() {
  const file = process.argv[2];
  const outputFolder = process.argv[3];
  if (!file || !outputFolder) throw new Error("Pass a Benchmark #2 report path and comparison output folder.");
  const raw = JSON.parse(await readFile(resolve(file), "utf8"));
  const result = compareBenchmarks(parseBenchmarkTwo(raw));
  const output = resolve(outputFolder);
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, "benchmark-one-vs-two.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({
    baselinePages: result.baselineOne.actualPdfPages,
    benchmarkTwoPages: result.benchmarkTwo.actualPdfPages,
    baselineSubstantivePages: result.baselineOne.substantivePageCount,
    benchmarkTwoSubstantivePages: result.benchmarkTwo.substantivePageCount,
    oldEstimatedUsd: result.baselineOne.estimatedCostUsd,
    newEstimatedUsd: result.benchmarkTwo.estimatedCostUsd,
    automatedGate: result.automatedReleaseGate,
    humanReviewRequired: true,
  }, null, 2));
}
if (process.argv[1] && /phase2-compare-benchmarks\.(?:ts|js)$/.test(process.argv[1])) {
  cli().catch(error => {
    console.error("Benchmark comparison unavailable:", String(error?.message || "unknown").slice(0,180));
    process.exitCode = 1;
  });
}
