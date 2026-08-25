const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const requiredFiles = [
  "server/index.ts",
  "server/aiProviderGateway.ts",
  "server/expertBookingRoutes.ts",
  "shared/tools-data.ts",
  "client/src/pages/home.tsx",
  "client/src/pages/tools-hub.tsx",
  "client/src/pages/ai-transparency.tsx",
  "client/src/pages/tools/lawyer-finder.tsx",
  "client/src/components/HeroSection.tsx",
  "client/src/components/ReadinessScoreWidget.tsx",
  "client/src/components/SamplePlansModal.tsx",
  "client/src/components/StatsSection.tsx",
  "client/src/components/TestimonialsSection.tsx",
  "client/src/components/CookieConsent.tsx",
  "client/src/components/AIProviderStatusCard.tsx",
  "client/src/hooks/use-analytics.tsx",
  "client/src/lib/cookiePreferences.ts",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Public trust validator: required file missing: ${file}`);
}

function walk(relativeDir) {
  const dir = path.join(root, relativeDir);
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(relativeDir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (rel.includes("/admin") || rel.includes("/__tests__")) continue;
      results.push(...walk(rel));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      results.push(rel);
    }
  }
  return results;
}

const files = Array.from(new Set([
  ...requiredFiles,
  ...walk("client/src"),
]));
const combinedRaw = files.map((file) => `\n/* ${file} */\n${fs.readFileSync(path.join(root, file), "utf8")}`).join("\n");
const combined = combinedRaw.replace(/\\'/g, "'");

const forbidden = [
  "Trusted by 500+ Approved Applicants",
  "Get Your UK Innovator Founder Visa Approved",
  "The UK's leading AI platform",
  "quad-AI verified",
  "100% accuracy",
  "Advanced Qwen AI technology",
  '"name": "Qwen AI"',
  "Success Probability Predictor",
  "Predict visa success probability",
  "Win Probability Predictor",
  "Predict application win probability",
  "Zero-to-Approved Roadmap",
  "Complete roadmap from zero to visa approved",
  "Compliance Guaranteed",
  "OISC Compliance Guide",
  "OISC Compliant",
  "GDPR Compliant",
  "Home Office compliance certified",
  "visa-ready business plans",
  "Money-Back Guarantee",
  "Say 'Build my visa' and let AI orchestrate your entire application",
  "Real-time UK immigration law monitoring and compliance alerts",
  "Track visa application status in real-time",
  "Ensure compliance with UK visa rules and regulations",
  "Ensure data security and GDPR compliance",
  "Ready-to-use legal document templates",
  "Expert guidance on endorsement, requirements (£1,191 fee, £1,270 savings)",
  "Every article is quad-AI verified against official GOV.UK sources for 100% accuracy",
  "100+ professional-grade AI tools",
  "personalised visa guidance",
];

for (const phrase of forbidden) {
  if (combined.includes(phrase)) throw new Error(`Public trust regression: forbidden public claim remains: ${phrase}`);
}

const required = [
  "PUBLIC_AI_TRANSPARENCY_STATUS",
  "/api/ai-transparency/providers",
  "PLATFORM_EXPERT_VERIFICATION_METADATA",
  "platform_onboarding_approved",
  "Last platform verification",
  "FICTIONAL EXAMPLE",
  "EXAMPLE ONLY",
  "Official GOV.UK source",
  "Reject optional",
  "Accept optional",
  "Manage preferences",
  "hasAnalyticsConsent",
  "COOKIE_PREFERENCES_EVENT",
  "Live AI provider configuration",
  "This panel is populated from the production provider gateway",
  "not a legal eligibility decision",
  "without predicting endorsement or visa outcomes",
];

for (const marker of required) {
  if (!combined.includes(marker)) throw new Error(`Public trust regression: required safeguard missing: ${marker}`);
}

const cookieConsent = fs.readFileSync(path.join(root, "client/src/components/CookieConsent.tsx"), "utf8");
if (/continuing to use (?:this|the) site.{0,80}consent/i.test(cookieConsent)) {
  throw new Error("Public trust regression: passive 'continued use means cookie consent' wording is not allowed");
}

const analyticsHook = fs.readFileSync(path.join(root, "client/src/hooks/use-analytics.tsx"), "utf8");
const initBlock = analyticsHook.slice(analyticsHook.indexOf("export const useInitGA"));
if (!initBlock.includes("hasAnalyticsConsent()")) {
  throw new Error("Public trust regression: Google Analytics initialization is not gated by explicit analytics consent");
}

console.log(JSON.stringify({ ok: true, filesChecked: files.length, forbiddenClaimsChecked: forbidden.length, requiredSafeguardsChecked: required.length }, null, 2));
