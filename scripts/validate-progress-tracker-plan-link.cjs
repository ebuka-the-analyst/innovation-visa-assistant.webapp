const fs = require("fs");

function fail(message) {
  console.error(`[progress-tracker-plan-link] ${message}`);
  process.exitCode = 1;
}

const schema = fs.readFileSync("shared/schema.ts", "utf8");
const tracker = fs.readFileSync("server/progressTracker.cjs", "utf8");
const planStatus = fs.readFileSync("server/businessPlanStatus.cjs", "utf8");
const notice = fs.readFileSync("client/src/components/ContextualDocumentNotice.tsx", "utf8");
const client = fs.readFileSync("client/src/pages/progress.tsx", "utf8");

const schemaStartMarker = 'export const businessPlans = pgTable("business_plans", {';
const schemaStart = schema.indexOf(schemaStartMarker);
if (schemaStart === -1) throw new Error("businessPlans schema declaration not found");
const schemaEnd = schema.indexOf("\n});", schemaStart);
if (schemaEnd === -1) throw new Error("businessPlans schema declaration end not found");
const businessPlanSchema = schema.slice(schemaStart, schemaEnd);
const physicalColumns = new Set(
  [...businessPlanSchema.matchAll(/\b[A-Za-z0-9_]+:\s*(?:varchar|text|integer|timestamp|jsonb|boolean|real)\("([^"]+)"/g)].map((match) => match[1]),
);

const fromIndex = planStatus.indexOf("FROM business_plans");
if (fromIndex === -1) throw new Error("Business plan status query not found");
const selectIndex = planStatus.lastIndexOf("SELECT", fromIndex);
if (selectIndex === -1) throw new Error("Business plan status SELECT not found");
const selectedColumns = planStatus
  .slice(selectIndex + "SELECT".length, fromIndex)
  .split(",")
  .map((column) => column.trim().split(/\s+/)[0])
  .filter(Boolean);
for (const column of selectedColumns) {
  if (!physicalColumns.has(column)) fail(`Business plan status service selects business_plans.${column}, but it is not declared in shared/schema.ts`);
}
for (const requiredColumn of ["id", "business_name", "status", "pdf_url", "created_at"]) {
  if (!selectedColumns.includes(requiredColumn)) fail(`Business plan status query must select ${requiredColumn}`);
}

if (!planStatus.includes("reconcileCompletedBusinessPlansForUser")) fail("Shared business-plan reconciliation is missing");
if (!planStatus.includes("business_plan_versions") || !planStatus.includes("business_plan_generation_jobs")) fail("Durable completion evidence sources are missing");
if (!tracker.includes("getBusinessPlanStatusForUser")) fail("Progress Tracker must use the shared business-plan status service");
if (!notice.includes('/api/business-plan/status')) fail("Questionnaire/generation notice must use the shared business-plan status endpoint");
if (notice.includes('/api/dashboard/plans')) fail("Contextual notice must not calculate plan status independently from dashboard plans");

if (!client.includes("tracker?.authoritative.businessPlans.evidence?.planId")) fail("Completed questionnaire review must use the authoritative completed-plan ID");
if (!client.includes('`/api/view/html/${encodeURIComponent(questionnaireReviewPlanId)}`')) fail("Completed questionnaire review must use the authenticated existing-plan HTML view");
if (!client.includes("questionnaireReviewPlanId ?")) fail("Completed questionnaire review must fail back to workflow only when no authoritative plan ID exists");

if (process.exitCode) process.exit(process.exitCode);
console.log(`[progress-tracker-plan-link] OK: shared business-plan status service selects ${selectedColumns.length} valid physical columns and powers tracker + notice`);
