const fs = require("fs");

const serverPath = "server/applicationContextPrefill.cjs";
const guardPath = "server/retiredRouteGuard.cjs";
const hookPath = "client/src/hooks/useToolPlatform.ts";
const ivsPath = "client/src/pages/tools/endorsement-ivs-assessment.tsx";

for (const file of [serverPath, guardPath, hookPath, ivsPath]) {
  if (!fs.existsSync(file)) throw new Error(`Application prefill file missing: ${file}`);
}

const server = fs.readFileSync(serverPath, "utf8");
const guard = fs.readFileSync(guardPath, "utf8");
const hook = fs.readFileSync(hookPath, "utf8");
const ivs = fs.readFileSync(ivsPath, "utf8");

function requireMarker(content, marker, message) {
  if (!content.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
}

requireMarker(server, 'const ROUTE = "/api/tool-platform/application-context";', "Application context route is missing");
requireMarker(server, "WHERE user_id = $1", "Application context queries must be scoped to the authenticated user");
requireMarker(server, "AND LOWER(status) = 'completed'", "Application context must prefer a completed business plan");
requireMarker(server, "AND COALESCE(is_demo_data, false) = false", "Demo business plans must not drive production prefill");
requireMarker(server, "AND tool_id = $2", "Previous tool input must be scoped to the requested tool");
requireMarker(server, "LOWER(BTRIM(business_name)) = LOWER(BTRIM($2::text))", "Returning to a tool must prefer the completed plan for the same business");
requireMarker(server, 'strategy: planMatchesPreviousRun ? "previous_tool_business_match" : "latest_completed"', "Application context must report how the business plan was selected");
requireMarker(server, "reference: `document:${row.id}`", "Uploaded documents must expose stable references only");
requireMarker(server, 'res.setHeader("Cache-Control", "no-store")', "Sensitive application context responses must not be cached");

for (const forbidden of ["generated_content", "background_image", "INSERT INTO", "UPDATE business_plans", "DELETE FROM"]) {
  if (server.includes(forbidden)) {
    throw new Error(`Application prefill endpoint must remain read-only and avoid generated/large content: ${forbidden}`);
  }
}

requireMarker(guard, 'require("./applicationContextPrefill.cjs");', "Application context route is not loaded at runtime");
requireMarker(hook, "export function useApplicationContextPrefill", "Reusable application context hook is missing");
requireMarker(hook, '"/api/tool-platform/application-context"', "Application context hook points at the wrong route");

requireMarker(ivs, "buildBusinessPlanPrefill", "IVS page is not wired to structured business-plan prefill");
requireMarker(ivs, "buildPreviousReviewPrefill", "IVS page does not restore a prior validated tool input");
requireMarker(ivs, "previousReviewMatchesPlan", "IVS page must prevent cross-business previous-run restoration");
requireMarker(ivs, "mergeIntoUntouchedForm", "IVS prefill must preserve user edits");
requireMarker(ivs, "They are not automatically counted as evidence", "IVS page must explain why uploaded files are not silently credited as evidence");

const planMapperStart = ivs.indexOf("function buildBusinessPlanPrefill");
const previousMapperStart = ivs.indexOf("function validEvidenceItems", planMapperStart);
if (planMapperStart === -1 || previousMapperStart === -1) {
  throw new Error("Could not isolate IVS business-plan prefill mapper");
}
const planMapper = ivs.slice(planMapperStart, previousMapperStart);
for (const unsupportedField of [
  "targetCustomers:",
  "internalInnovationOwnership:",
  "minimumSetupCostGbp:",
  "monthlyOperatingCostGbp:",
  "forecastMonthlyRevenueGbp:",
  "evidenceItems:",
]) {
  if (planMapper.includes(unsupportedField)) {
    throw new Error(`Business-plan prefill must leave unsupported claim for user confirmation: ${unsupportedField}`);
  }
}

if (ivs.includes("data.documents.map") || ivs.includes("applicationPrefill.data.documents.map")) {
  throw new Error("Uploaded document metadata must not be auto-promoted into IVS evidence items");
}

console.log(JSON.stringify({
  ok: true,
  authenticatedUserScoped: true,
  completedNonDemoPlanOnly: true,
  sameBusinessPlanPreferredForPreviousRun: true,
  previousRunBusinessGuard: true,
  preservesUserEdits: true,
  noGeneratedContentParsing: true,
  noAutomaticEvidenceInflation: true,
  reusableAcrossTools: true,
}, null, 2));