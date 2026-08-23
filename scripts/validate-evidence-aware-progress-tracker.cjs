const fs = require("fs");

const server = fs.readFileSync("server/progressTracker.cjs", "utf8");
const client = fs.readFileSync("client/src/pages/progress.tsx", "utf8");
const planStatus = fs.readFileSync("server/businessPlanStatus.cjs", "utf8");

const checks = [
  ["server selects structured financial evidence", server.includes("monthly_projections, cac, ltv, payback_period, funding_sources, detailed_costs")],
  ["server selects structured market evidence", server.includes("competitors, competitive_differentiation, customer_interviews") && server.includes("willingness_to_pay, market_size")],
  ["server builds plan evidence", server.includes("function buildPlanEvidence(row)") && server.includes("buildPlanEvidence(completedPlan)")],
  ["financial evidence requires complete signal set", server.includes("financialCompleted === financialChecks.length")],
  ["market evidence requires demand signal", server.includes("marketCompleted >= 4 && hasDemandSignal")],
  ["server reads durable completed tool runs with result evidence", server.includes("FROM tool_runs") && server.includes("result_payload") && server.includes("result_sha256") && server.includes("status = 'completed'")],
  ["required readiness has freshness rules", server.includes("TOOL_MAX_AGE_DAYS") && server.includes("freshnessForRun") && server.includes("needsRevalidation")],
  ["eligibility needs positive durable result", server.includes("function eligibilityPayloadPasses") && server.includes("eligibilityPass")],
  ["legacy required completion cannot become authoritative", server.includes("Previous account/browser progress is preserved") && server.includes("95") && server.includes("REQUIRED_STEP_IDS")],
  ["client labels overall metric as preparation", client.includes("Overall preparation") && client.includes("Required application readiness")],
  ["client exposes audit metadata", client.includes("Result fingerprint") && client.includes("Readiness ruleset") && client.includes("Freshness:")],
  ["client exposes revalidation state", client.includes("Needs revalidation") && client.includes("revalidation-warning")],
  ["client does not calculate required completion from localStorage", !client.includes("localStorage") && !client.includes("readJson(")],
  ["business plan status is shared", server.includes("getBusinessPlanStatusForUser") && planStatus.includes("registerBusinessPlanStatusRoutes")],
  ["generated business plan counts as required document", server.includes('satisfiedRequiredNames.add("Business Plan")') && server.includes('generatedRequiredNames.add("Business Plan")')],
  ["required document completion uses satisfied not only uploaded", server.includes("requiredSatisfied: satisfiedRequiredNames.size") && client.includes("requiredSatisfied")],
  ["phase headline remains required-only", client.includes("Required readiness") && client.includes("requiredComplete")],
  ["optional completion is displayed separately", client.includes("optional complete")],
  ["progress tracks use neutral empty background", client.includes("bg-slate-200 dark:bg-slate-800")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) {
  console.error(`Evidence-aware Progress Tracker validation failed: ${failed.map(([label]) => label).join(", ")}`);
  process.exit(1);
}
console.log("Evidence-aware Progress Tracker validation passed");
