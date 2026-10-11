import assert from "node:assert/strict";
import test from "node:test";
import { getSectionsForTier, getSectionSystemPrompt, getSystemPrompt, getUserPromptInstructions } from "../server/aiPrompts";
import { auditPremiumPlanEvidence } from "../server/premiumPlanEvidenceAudit";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";

test("new memberships use sector-neutral, evidence-first section prompts", () => {
  const sections = getSectionsForTier("founder_pro");
  assert.equal(sections.length, 13);
  const finance = getSectionSystemPrompt("founder_pro", sections[4], 5, sections.length);
  assert.match(finance, /canonical Year 1-3 financial bridge/);
  assert.match(finance, /no invented|do not invent|Never present examples as actual results/i);
  assert.match(finance, /cash flow/);
  assert.match(finance, /Markdown tables/);
  assert.doesNotMatch(finance, /MANDATORY accuracy metrics: Type/i);
  assert.doesNotMatch(finance, /FinTech SaaS rep|Industry standard: Fluidly/i);
  assert.doesNotMatch(finance, /<table class=/i);
  const innovation = getSectionSystemPrompt("founder_pro", sections[2], 3, sections.length);
  assert.match(innovation, /never force MAPE\/RMSE on a non-forecasting marketplace/);
  assert.match(innovation, /data flows/);
  const risk = getSectionSystemPrompt("founder_pro", sections[8], 9, sections.length);
  assert.match(risk, /trigger|contingency/i);
  const endorser = getSectionSystemPrompt("founder_pro", sections[12], 13, sections.length);
  assert.match(endorser, /evidence index|no-submit/i);
  assert.doesNotMatch(endorser, /guaranteed endorsement/i);
});

test("legacy tier prompts are not silently mapped to the new membership policy", () => {
  const legacy = getSectionsForTier("enterprise");
  const text = getSectionSystemPrompt("enterprise",legacy[2],3,legacy.length);
  assert.doesNotMatch(text,/NEW MEMBERSHIP EDITORIAL POLICY/);
  const paid = getSectionSystemPrompt("founder",getSectionsForTier("founder")[4],5,getSectionsForTier("founder").length);
  assert.match(paid,/NEW MEMBERSHIP EDITORIAL POLICY/);
});

test("unrendered diagrams and poorly sourced research trigger independent evidence review", () => {
  const source = [
    "## 1. EXECUTIVE SUMMARY",
    "Market feasibility and milestones need validation. ".repeat(27),
    "## 2. FOUNDER CREDENTIALS & VALIDATION",
    "Founder experience must be independently verified. ".repeat(27),
    "<svg viewBox='0 0 20 20'><title>Product architecture</title></svg>",
    "The review mentions Wobbrock et al. and research findings without any DOI or link.",
  ].join("\n\n");
  const result = auditPremiumPlanEvidence(source);
  assert.equal(result.blockedMediaMarkup.length,1);
  const namespaceOnly = auditPremiumPlanEvidence(
    '<svg xmlns="http://www.w3.org/2000/svg"><title>Architecture</title></svg> ' +
    'The proposal references a study by Gebru et al. but provides no DOI.'
  );
  assert.ok(namespaceOnly.unverifiedSourceMentions.length >= 1);
  assert.ok(result.unverifiedSourceMentions.length >= 1);
  const diag = assessBusinessPlanDocument("founder_pro",source,60);
  assert.equal(diag.releaseGatePassed,false);
  assert.match(diag.formattingWarnings.join(" "),/Inline SVG/);
  assert.equal(diag.manualEvidenceReviewRequired,true);
});

test("extensive repeated prose is reported across different business-plan sections", () => {
  const repeated = "This detailed competitive analysis requires interviews and independent evidence before the scale decision can be made in the United Kingdom.";
  const content = Array.from({length:5},(_,i)=>"## "+(i+1)+". SECTION "+i+"\n\n"+repeated.repeat(5)).join("\n\n");
  const result = auditPremiumPlanEvidence(content);
  assert.ok(result.repeatedCrossSectionPhrases.some(x=>x.sectionCount>=4));
});

test("all premium prompt entry points avoid generic, industry-inappropriate proof claims", () => {
  for (const tier of ["founder", "founder_pro", "founder_pass_90d"]) {
    const full = getSystemPrompt(tier);
    const instructions = getUserPromptInstructions(tier);
    assert.match(full, /NEW-PAID-MEMBERSHIP FULL-PLAN POLICY/);
    assert.match(full, /separating verified claims/i);
    assert.match(full, /Do not force FinTech benchmarks/i);
    assert.ok(instructions.some(line => /industry-appropriate validation measures/i.test(line)));
    assert.ok(instructions.some(line => /never promise endorsement/i.test(line)));
  }
});
