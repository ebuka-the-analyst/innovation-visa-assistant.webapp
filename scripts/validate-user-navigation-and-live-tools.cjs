const fs = require("fs");
const path = require("path");

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sidebar = read("client/src/components/app-sidebar.tsx");
const app = read("client/src/App.tsx");
const regulatory = read("client/src/components/RegulatoryCopilot.tsx");
const regulatoryPage = read("client/src/pages/regulatory-copilot.tsx");
const evidence = read("client/src/pages/evidence-graph.tsx");
const rfe = read("client/src/pages/rfe-defence-lab.tsx");
const kpi = read("client/src/pages/kpi-dashboard.tsx");
const rejection = read("client/src/pages/rejection-analysis.tsx");
const interview = read("client/src/pages/interview-prep.tsx");
const settlement = read("client/src/pages/settlement-planning.tsx");

assert(!sidebar.includes("#005EB8"), "Legacy blue sidebar group styling must be removed");
assert(sidebar.includes("bg-red-500/10 border border-red-500/20"), "Sidebar group headers must use red styling");
assert(sidebar.includes("border-l-2 border-red-500"), "Active sidebar items must use a red indicator");

const sidebarUrls = [...sidebar.matchAll(/url:\s*"([^\"]+)"/g)].map((match) => match[1]);
const uniqueUrls = [...new Set(sidebarUrls)];
assert(uniqueUrls.length >= 20, "Expected the full user sidebar navigation catalogue");
for (const url of uniqueUrls) {
  assert(app.includes(`<Route path="${url}"`), `Sidebar destination has no matching route: ${url}`);
}

for (const forbidden of [
  "MOCK_UPDATES",
  "COMPLIANCE_ITEMS",
  "/api/regulations/updates",
  "Minimum Investment Threshold Unchanged",
  "2025-11-15",
]) {
  assert(!regulatory.includes(forbidden), `Regulatory Copilot still contains mock/stale marker: ${forbidden}`);
}
assert(regulatory.includes('fetch("/api/news?limit=60")'), "Regulatory Copilot must use the live platform news feed");
assert(regulatory.includes('useApplicationContextPrefill("regulatory-copilot")'), "Regulatory Copilot must use saved application context");
assert(regulatory.includes("No cached regulatory claims are being substituted"), "Regulatory failure state must not silently substitute fake data");
assert(regulatoryPage.includes('canonical="/regulatory-copilot"'), "Regulatory Copilot canonical URL must match the live route");

assert(!evidence.includes("const claims = ["), "Evidence Graph must not use fixed example claims");
assert(evidence.includes('useApplicationContextPrefill("evidence-graph")'), "Evidence Graph must use saved application data");
assert(evidence.includes("useUpdateToolCaseContext"), "Evidence Graph action plan must persist to shared application context");

assert(!rfe.includes("const risks = ["), "RFE Defence must not use fixed example risks");
assert(!rfe.includes("High-Risk Issues</p>\n              <p className=\"text-xl font-bold text-red-600\">2"), "RFE counts must not be hardcoded");
assert(rfe.includes('useApplicationContextPrefill("rfe-defense")'), "RFE Defence must derive gaps from saved application data");
assert(rfe.includes("These are not predictions that a refusal will occur"), "RFE Defence must clearly distinguish preparation gaps from refusal predictions");

for (const forbidden of ["visaHealthScore = 87", "£180K", "Q4 2025", "December 15, 2025", "87 days"]) {
  assert(!kpi.includes(forbidden), `KPI Dashboard still contains fabricated marker: ${forbidden}`);
}
assert(kpi.includes('useApplicationContextPrefill("kpi-dashboard")'), "KPI Dashboard must use saved application context");
assert(kpi.includes("No revenue, users, hires, deadlines or compliance outcomes are fabricated"), "KPI Dashboard must state its real-data boundary");

assert(!rejection.includes("Probability of success"), "Rejection Analysis must not request success-probability predictions");
assert(rejection.includes('useApplicationContextPrefill("rejection-analysis")'), "Rejection Analysis must ground analysis in saved plan context");
assert(rejection.includes('setLocation("/expert-booking")'), "Book Expert Review must be wired to Expert Booking");
assert(rejection.includes("if (!response.ok)"), "Rejection Analysis must handle failed AI requests");

assert(!interview.includes("Meet minimum (3-5 jobs in 3 years)"), "Interview Prep must not claim a generic job minimum");
assert(!interview.includes("const endorserTips ="), "Interview Prep must not use stale fixed endorser tips");
assert(interview.includes('useApplicationContextPrefill("interview-prep")'), "Interview Prep must personalise scenarios from saved plan context");
assert(interview.includes("Record for Playback"), "Interview recording must remain usable without fake transcription success");
assert(interview.includes("if (!response.ok)"), "Interview coaching must handle failed AI requests");

for (const forbidden of ["const settlementSteps =", "const taxPlanning =", "const expansionStrategies =", "Year 4:", "Eligible to apply for British Citizenship"]) {
  assert(!settlement.includes(forbidden), `Settlement Planning still contains fixed eligibility/planning marker: ${forbidden}`);
}
assert(settlement.includes('useApplicationContextPrefill("settlement-planning")'), "Settlement Planning must use saved business context");
assert(settlement.includes("No automatic eligibility date"), "Settlement Planning must not infer personal eligibility without verified history");
assert(settlement.includes("https://www.gov.uk/innovator-founder-visa"), "Settlement Planning must link to official route guidance");

console.log(JSON.stringify({
  ok: true,
  sidebarDestinationsChecked: uniqueUrls.length,
  liveDataToolsChecked: [
    "regulatory-copilot",
    "evidence-graph",
    "rfe-defense",
    "kpi-dashboard",
    "rejection-analysis",
    "interview-prep",
    "settlement-planning",
  ],
}, null, 2));
