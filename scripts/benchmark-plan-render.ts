/**
 * Offline PDF benchmark using an anonymised JSON fixture:
 *
 * node --import tsx scripts/benchmark-plan-render.ts path/to/anonymised-plan.json
 *
 * No network request, API key or customer database access is needed.
 * This checks the rendered PDF length/structure, NOT citation accuracy.
 */
import { readFileSync } from "node:fs";
import { renderBusinessPlanPdf } from "../server/businessPlanPdf";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";

const filename = process.argv[2];
if (!filename) {
  console.error("Expected a local anonymised JSON fixture path.");
  process.exit(2);
}
try {
  const plan = JSON.parse(readFileSync(filename, "utf8"));
  if (typeof plan?.generatedContent !== "string" ||
      typeof plan?.businessName !== "string" || typeof plan?.tier !== "string") {
    throw new Error("Fixture must contain tier, businessName and generatedContent strings");
  }
  const result = await renderBusinessPlanPdf(plan);
  const diagnostics = assessBusinessPlanDocument(plan.tier, plan.generatedContent, result.pageCount);
  console.log(JSON.stringify({ ...diagnostics, pdfBytes: result.buffer.length }, null, 2));
  if (!diagnostics.releaseGatePassed) process.exitCode = 1;
} catch (error: any) {
  console.error("PDF benchmark unavailable:", String(error?.message || "unknown").slice(0, 180));
  process.exitCode = 1;
}
