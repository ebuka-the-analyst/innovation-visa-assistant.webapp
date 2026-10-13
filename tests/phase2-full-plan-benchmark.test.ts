import assert from "node:assert/strict";
import test from "node:test";
import { QA_FOUNDER_CASES, deriveQaFinancials } from "./fixtures/fictional-founder-cases";
import { benchmarkOutputBudget, reserveBenchmarkRequest, assertBenchmarkSpendLimit } from "../server/benchmark/flagshipBudget";
import { getSectionsForTier } from "../server/aiPrompts";
import { readFileSync } from "node:fs";

test("fictional benchmark cases cover distinct innovations and deliberately loss-making scenarios", () => {
  const cases=Object.values(QA_FOUNDER_CASES);
  assert.equal(cases.length,3);
  assert.equal(new Set(cases.map(x=>x.industry)).size,3);
  for(const c of cases) {
    assert.ok(c.evidenceGaps.length>=3);
    assert.equal(deriveQaFinancials(c).length,3);
    for(const y of deriveQaFinancials(c)) {
      assert.equal(y.operatingSurplusGbp,y.revenueGbp-y.variableCostsGbp-y.fixedCostsGbp);
      assert.ok(y.revenueGbp>=0 && y.variableCostsGbp>=0);
    }
  }
  assert.deepEqual(deriveQaFinancials(QA_FOUNDER_CASES.marketplace).map(y=>y.operatingSurplusGbp),
    [-31950,-34900,-35700]);
  assert.deepEqual(deriveQaFinancials(QA_FOUNDER_CASES.hardware).map(y=>y.revenueGbp),
    [28800,115200,288000]);
  assert.deepEqual(deriveQaFinancials(QA_FOUNDER_CASES.saas).map(y=>y.operatingSurplusGbp),
    [-34720,-8880,39440]);
});

test("section budget represents conservative, enforced estimated reservation", () => {
  assert.equal(benchmarkOutputBudget(1200),14000);
  assert.equal(benchmarkOutputBudget(8000),24000);
  const prompt="Fictional case: ".repeat(600);
  const reservation=reserveBenchmarkRequest(prompt,benchmarkOutputBudget(4000));
  assert.ok(reservation.reserveUsd>0 && reservation.reserveUsd<3);
  assertBenchmarkSpendLimit(1,2,3);
  assert.throws(()=>assertBenchmarkSpendLimit(1,2,2.5),/STOP/);
  assert.throws(()=>assertBenchmarkSpendLimit(1,2,100),/Invalid/);
  assert.throws(()=>reserveBenchmarkRequest(prompt,100000),/Invalid/);
});

test("benchmark uses the real tier-specific prompt set and never runs paid calls without explicit gating", () => {
  for(const tier of ["founder","founder_pro","founder_pass_90d"]) {
    assert.ok(getSectionsForTier(tier).length>=10);
  }
  const source=readFileSync(new URL("../scripts/phase2-full-plan-benchmark.ts",import.meta.url),"utf8");
  assert.match(source,/getSectionSystemPrompt\(/);
  assert.match(source,/IFVA_ENABLE_FULL_PLAN_BENCHMARK/);
  assert.match(source,/IFVA_STAGING_OPENAI_API_KEY/);
  assert.match(source,/maxRetries:\s*0/);
  assert.match(source,/store:\s*false/);
  assert.match(source,/assertBenchmarkSpendLimit\(/);
  assert.match(source,/estimateStandardAstraUsd\(/);
  assert.match(source,/renderBusinessPlanPdf\(/);
  assert.doesNotMatch(source,/responses\.create\([\s\S]*?(?:Math\.random|while\s*\()/);
});
