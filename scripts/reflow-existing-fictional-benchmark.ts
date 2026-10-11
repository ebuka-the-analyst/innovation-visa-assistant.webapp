/**
 * No-cost re-render of a fictional benchmark saved as a prior GitHub artifact.
 * Makes NO external API calls and does not require an AI key.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderBusinessPlanPdf } from "../server/businessPlanPdf";
import { inspectRenderedBusinessPlanPdf } from "../server/businessPlanPdfInspection";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";
import { deriveQaFinancials, QA_FOUNDER_CASES } from "../tests/fixtures/fictional-founder-cases";
import { auditPremiumPlanEvidence } from "../server/premiumPlanEvidenceAudit";

async function main() {
  const sourceDir = resolve(process.argv[2] || "");
  const outputDir = resolve(process.argv[3] || "");
  if (!process.argv[2] || !process.argv[3]) {
    throw new Error("Provide source directory and output directory. No API key is used.");
  }
  const report = JSON.parse(await readFile(resolve(sourceDir, "marketplace-founder_pro-report.json"), "utf8"));
  const generatedContent = await readFile(resolve(sourceDir, "marketplace-founder_pro.md"), "utf8");
  const firstLine = generatedContent.split("\n").find(s => s.startsWith("# FICTIONAL BUSINESS PLAN: "));
  const businessName = firstLine?.replace("# FICTIONAL BUSINESS PLAN: ", "").trim();
  if (!businessName || report.setup?.tier !== "founder_pro" ||
      report.setup?.fictionalCase !== "marketplace") {
    throw new Error("Unexpected benchmark fixture identity; refusing to review mismatched input");
  }
  const previousPdfPages = Number(report.benchmark?.actualPdfPages || 0);
  const rendered = await renderBusinessPlanPdf({ businessName, generatedContent, tier: "founder_pro" });
  const inspection = await inspectRenderedBusinessPlanPdf(rendered.buffer);
  const diagnostics = assessBusinessPlanDocument("founder_pro", generatedContent, rendered.pageCount, inspection);
  const finance = deriveQaFinancials(QA_FOUNDER_CASES.marketplace);
  const canonicalValues = finance.flatMap(year => [
    year.revenueGbp, year.variableCostsGbp, year.fixedCostsGbp,
    year.operatingSurplusGbp,
  ]);
  const absentBaselineValues = canonicalValues
    .map(value => (value < 0 ? "-£" : "£") + Math.abs(value).toLocaleString("en-GB"))
    .filter((value, index, array) => array.indexOf(value) === index)
    .filter(value => !generatedContent.includes(value));
  const evidenceAudit = auditPremiumPlanEvidence(generatedContent);
  const result = {
    benchmarkRun: "38178211038",
    benchmarkCaseFinancials: finance,
    absentCanonicalFinancialValues: absentBaselineValues,
    sourceEvidenceAudit: evidenceAudit,
    generationApiCostUsd: 0,
    priorPageCount: previousPdfPages,
    newPageCount: rendered.pageCount,
    oldNearEmptyInteriorPages: [4,7,18,30,39,49,55,58],
    nearEmptyInteriorPages: inspection.nearEmptyInteriorPages,
    substantivePages: inspection.substantivePageCount,
    sourceConvertedHtmlTables: (generatedContent.match(/<table\b/gi) || []).length,
    diagnostics,
    interpretation: "Re-rendered pre-existing fictional text without another AI call; human review remains required.",
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDir, "marketplace-founder_pro-reflow.pdf"), rendered.buffer),
    writeFile(resolve(outputDir, "marketplace-founder_pro-reflow-report.json"), JSON.stringify(result, null, 2)),
  ]);
  console.log(JSON.stringify({
    oldPages: previousPdfPages,
    newPages: rendered.pageCount,
    nearEmptyInteriorPages: inspection.nearEmptyInteriorPages,
    substantivePages: inspection.substantivePageCount,
    qualityGatePassed: diagnostics.releaseGatePassed,
    blockingFindings: diagnostics.formattingWarnings,
    generatedNewAIContent: false,
  }, null, 2));
}
main().catch(error => {
  console.error("Offline reflow could not finish:", String(error?.message || "unknown").slice(0, 220));
  process.exitCode = 1;
});
