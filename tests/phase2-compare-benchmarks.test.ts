import assert from "node:assert/strict";
import test from "node:test";
import { BASELINE_ONE, compareBenchmarks, parseBenchmarkTwo } from "../scripts/phase2-compare-benchmarks";

const newReport = (pages: number, substantive: number, cost: number, warnings: string[] = []) => ({
  setup: { fictionalCase: "marketplace", tier: "founder_pro", model: "gpt-6-astra" },
  usedEstimatedUsd: cost,
  benchmark: {
    actualPdfPages: pages, wordCount: 19200,
    sections: { expected: 13, located: 13, missing: [] },
    releaseGatePassed: warnings.length === 0,
    formattingWarnings: warnings,
    pdfInspection: {
      pageCount: pages,
      substantivePageCount: substantive,
      nearEmptyInteriorPages: [],
    },
  },
});

test("baseline is the correctly reflowed 51-page version, not the inflated 60-page version", () => {
  assert.equal(BASELINE_ONE.actualPdfPages, 51);
  assert.equal(BASELINE_ONE.substantivePageCount, 50);
  assert.equal(BASELINE_ONE.estimatedCostUsd, 3.62369);
});

test("benchmark comparison requires meaningful pages, zero sparse interior pages and every section", () => {
  const successful = compareBenchmarks(parseBenchmarkTwo(newReport(58, 56, 4.1)));
  assert.equal(successful.automatedReleaseGate, true);
  assert.equal(successful.delta.physicalPages, 7);
  assert.equal(successful.delta.substantivePages, 6);
  assert.equal(successful.humanOriginalSourceVerificationRequired, true);

  const short = compareBenchmarks(parseBenchmarkTwo(newReport(55, 53, 3.7)));
  assert.equal(short.automatedReleaseGate, false);
  const sparse = newReport(62, 57, 4.8);
  sparse.benchmark.pdfInspection.nearEmptyInteriorPages.push(14);
  assert.equal(compareBenchmarks(parseBenchmarkTwo(sparse)).automatedReleaseGate, false);
  const blocked = compareBenchmarks(parseBenchmarkTwo(newReport(60, 58, 5.3, ["Unrendered SVG"])));
  assert.equal(blocked.automatedReleaseGate, false);
});

test("benchmark comparison rejects misleading or incomplete metrics", () => {
  const mismatch = newReport(58, 56, 4);
  mismatch.setup.fictionalCase = "hardware";
  assert.throws(() => parseBenchmarkTwo(mismatch), /identity mismatch/);
  const corrupt = newReport(58, 56, 4);
  corrupt.benchmark.wordCount = Number.NaN;
  assert.throws(() => parseBenchmarkTwo(corrupt), /invalid current benchmark metrics/);
});
