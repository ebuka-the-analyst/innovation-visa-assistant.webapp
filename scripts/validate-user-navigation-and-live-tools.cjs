const fs = require("fs");
const path = require("path");

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sidebar = read("client/src/components/app-sidebar.tsx");
const header = read("client/src/components/Header.tsx");
const app = read("client/src/App.tsx");
const routes = read("server/routes.ts");
const newsService = read("server/newsService.ts");
const newsRelevance = read("server/newsRelevance.ts");
const newsTicker = read("client/src/components/NewsTicker.tsx");
const regulatory = read("client/src/components/RegulatoryCopilot.tsx");
const regulatoryPage = read("client/src/pages/regulatory-copilot.tsx");
const evidence = read("client/src/pages/evidence-graph.tsx");
const rfe = read("client/src/pages/rfe-defence-lab.tsx");
const kpi = read("client/src/pages/kpi-dashboard.tsx");
const rejection = read("client/src/pages/rejection-analysis.tsx");
const interview = read("client/src/pages/interview-prep.tsx");
const settlement = read("client/src/pages/settlement-planning.tsx");
const diagnostics = read("client/src/pages/diagnostics.tsx");
const featuresDashboard = read("client/src/pages/features-dashboard.tsx");

assert(sidebar.includes("#005EB8"), "User sidebar group styling must remain blue");
assert(sidebar.includes('bg-[#005EB8]/20'), "Sidebar group headers must use the blue background");
assert(sidebar.includes("border-l-2 border-primary"), "Active sidebar items must retain the primary/blue indicator");
assert(!sidebar.includes("bg-red-500/10 border border-red-500/20"), "Red sidebar group override must not be active");
assert(header.includes("backgroundColor: '#DC2626'"), "Homepage disclaimer banner must be red");
assert(!header.includes("backgroundColor: '#005EB8'"), "Homepage disclaimer banner must not remain blue");
assert(newsTicker.includes('bg-[#005EB8]'), "News ticker navigation arrows must use platform blue");
assert(!newsTicker.includes("bg-red-600 px-1"), "News ticker navigation arrows must not be red");

const sidebarUrls = [...sidebar.matchAll(/url:\s*"([^\"]+)"/g)].map((match) => match[1]);
const uniqueUrls = [...new Set(sidebarUrls)];
assert(uniqueUrls.length >= 20, "Expected the full user sidebar navigation catalogue");
for (const url of uniqueUrls) {
  assert(app.includes(`<Route path="${url}"`), `Sidebar destination has no matching route: ${url}`);
}

const journeyUrls = [...featuresDashboard.matchAll(/route:\s*"([^\"]+)"/g)].map((match) => match[1]);
for (const url of [...new Set(journeyUrls)]) {
  assert(app.includes(`<Route path="${url}"`), `Features Dashboard destination has no matching route: ${url}`);
}

assert(routes.includes('import { getLatestNews } from "./newsService";'), "Live news service must be wired into routes");
assert(!routes.includes("const news = await getLatestNews();"), "Legacy shadow /api/news handler must be removed");
assert(routes.includes("// NEWS FEED SYSTEM - Live UK Immigration News"), "Live news route marker is missing");
assert(routes.includes("news = await getLatestNews(parseInt(limit as string));"), "Live /api/news must use the filtered news service");
assert(routes.includes('app.post("/api/news/fetch", requireAdmin'), "Admin news refresh route must remain available");

assert(!newsService.includes("official-1"), "News service must not contain a hardcoded regulatory catalogue");
assert(!newsService.includes("2025-11-25"), "News service must not contain stale embedded policy dates");
assert(!newsService.includes("storage.getLatestNews"), "Homepage news must not mix persisted or AI-summarised items into the strict official feed");
assert(newsService.includes("https://www.gov.uk/api/search.json"), "News service must use the live GOV.UK Search API");
assert(newsService.includes('params.append("filter_organisations", "home-office")'), "GOV.UK discovery must be restricted to Home Office content");
assert(newsService.includes('params.append("filter_organisations", "uk-visas-and-immigration")'), "GOV.UK discovery must include UKVI content");
assert(newsService.includes('"Innovator Founder"'), "News service must use route-specific Innovator Founder discovery");
assert(newsService.includes("isStrictInnovatorFounderNews"), "News service must enforce strict Innovator Founder relevance");
assert(!newsService.includes("immigrationRelevanceTier"), "Broad immigration relevance tiers must not return to the homepage feed");
assert(!newsService.includes('"immigration rules business visa"'), "Broad business-visa filler query must remain removed");
assert(!newsService.includes('"UK visa immigration rules"'), "Broad UK-visa filler query must remain removed");
assert(newsRelevance.includes("titleDirectlyReferencesInnovatorFounder"), "Strict news policy must require Innovator Founder in the headline");
assert(newsRelevance.includes("isOfficialGovUkUrl"), "Strict news policy must require a GOV.UK URL");
assert(newsRelevance.includes("STRICT_NEWS_MAX_AGE_MS"), "Strict news policy must enforce a freshness window");
assert(newsRelevance.includes("if (!timestamp) return false"), "Strict news policy must reject undated items");
assert(!newsTicker.includes("INITIAL_NEWS_ITEMS"), "News ticker must not ship fixed regulatory headlines");
assert(newsTicker.includes('fetch("/api/news?limit=20")'), "News ticker must use the strict live news endpoint");
assert(newsTicker.includes("isStrictTickerArticle"), "News ticker must independently fail closed on irrelevant API items");
assert(newsTicker.includes("STRICT_TICKER_MAX_AGE_MS"), "News ticker must mirror the server freshness gate");
assert(newsTicker.includes("No new official Innovator Founder updates are available right now."), "Ticker must prefer an empty official state over unrelated filler");
assert(newsTicker.includes("setNewsItems([])"), "News ticker must fail closed instead of keeping stale fallback claims");

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
assert(rfe.includes('useApplicationContextPrefill("rfe-defense")'), "RFE Defence must derive gaps from saved application data");
assert(rfe.includes("These are not predictions that a refusal will occur"), "RFE Defence must clearly distinguish preparation gaps from refusal predictions");
assert(rfe.includes("useUpdateToolCaseContext"), "RFE mitigation plan must persist to shared application context");

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
assert(interview.includes('value={activeTab} onValueChange={setActiveTab}'), "Interview Prep tabs must be explicitly controlled");
assert(!interview.includes("document.querySelector<HTMLButtonElement>"), "Interview Prep must not use DOM-query tab navigation");

for (const forbidden of ["const settlementSteps =", "const taxPlanning =", "const expansionStrategies =", "Year 4:", "Eligible to apply for British Citizenship"]) {
  assert(!settlement.includes(forbidden), `Settlement Planning still contains fixed eligibility/planning marker: ${forbidden}`);
}
assert(settlement.includes('useApplicationContextPrefill("settlement-planning")'), "Settlement Planning must use saved business context");
assert(settlement.includes("No automatic eligibility date"), "Settlement Planning must not infer personal eligibility without verified history");
assert(settlement.includes("https://www.gov.uk/innovator-founder-visa"), "Settlement Planning must link to official route guidance");

for (const endpoint of [
  "/api/endorser/simulate/",
  "/api/routes/analyze/",
  "/api/team/model/",
  "/api/traction/forecast/",
  "/api/rules/check/",
]) {
  assert(diagnostics.includes(endpoint), `Diagnostics is missing required live endpoint: ${endpoint}`);
}
assert(diagnostics.includes("Promise.allSettled"), "Diagnostics retry must refetch all diagnostic data sources");
assert(diagnostics.includes("errors.length > 0"), "Diagnostics must expose API failure states instead of fake results");

console.log(JSON.stringify({
  ok: true,
  sidebarColor: "blue",
  disclaimerColor: "red",
  newsArrowsColor: "blue",
  newsScope: "Official GOV.UK Innovator Founder headlines only",
  sidebarDestinationsChecked: uniqueUrls.length,
  journeyDestinationsChecked: [...new Set(journeyUrls)].length,
  liveDataToolsChecked: [
    "regulatory-copilot",
    "evidence-graph",
    "rfe-defense",
    "kpi-dashboard",
    "rejection-analysis",
    "interview-prep",
    "settlement-planning",
    "diagnostics",
    "news-ticker",
  ],
  liveNewsFeedVerified: true,
}, null, 2));
