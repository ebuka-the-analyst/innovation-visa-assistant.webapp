const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
function write(rel, value) {
  fs.writeFileSync(path.join(root, rel), value);
}
function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`[platform-trust] Could not locate ${label}`);
  return source.replace(from, to);
}
function replaceAllKnown(source, replacements) {
  for (const [from, to] of replacements) source = source.split(from).join(to);
  return source;
}

// 1) Publish a secret-free, live provider-status endpoint from the same gateway
// that actually performs production routing.
{
  const rel = "server/aiProviderGateway.ts";
  let source = read(rel);
  if (!source.includes("PUBLIC_AI_TRANSPARENCY_STATUS")) {
    const marker = "export function registerAIProviderGatewayRoutes(app: Express): void {\n";
    const route = `export function registerAIProviderGatewayRoutes(app: Express): void {\n  // PUBLIC_AI_TRANSPARENCY_STATUS: public, secret-free view of the live managed provider configuration.\n  app.get(\"/api/ai-transparency/providers\", async (_req, res) => {\n    const settings = (await readSettings()).sort((a, b) => a.priority - b.priority);\n    const active = settings.filter((setting) => setting.enabled && configured(setting.provider));\n    const primary = active[0]?.provider || null;\n    res.setHeader(\"Cache-Control\", \"no-store\");\n    res.json({\n      managedRouting: true,\n      providers: settings.map((setting) => ({\n        id: setting.provider,\n        name: setting.provider === \"openai\" ? \"OpenAI\" : \"Anthropic\",\n        family: setting.provider === \"openai\" ? \"GPT\" : \"Claude\",\n        enabled: setting.enabled && configured(setting.provider),\n        primary: setting.enabled && configured(setting.provider) && setting.provider === primary,\n        model: setting.enabled && configured(setting.provider) ? resolveModel(setting) : null,\n      })),\n      fallbackEnabled: active.length > 1,\n      checkedAt: new Date().toISOString(),\n    });\n  });\n\n`;
    source = replaceRequired(source, marker, route, "AI gateway route registration");
    write(rel, source);
  }
}

// 2) Add auditable platform-onboarding verification metadata to the existing
// public expert directory response, without exposing private application notes.
{
  const rel = "server/expertBookingRoutes.ts";
  let source = read(rel);
  if (!source.includes("PLATFORM_EXPERT_VERIFICATION_METADATA")) {
    const from = `      p.booking_horizon_days AS \"bookingHorizonDays\",\n      p.preparation_note AS \"preparationNote\"\n    FROM immigration_lawyers l\n    JOIN expert_consultation_profiles p ON p.expert_id = l.id\n    WHERE l.status = 'active'`;
    const to = `      p.booking_horizon_days AS \"bookingHorizonDays\",\n      p.preparation_note AS \"preparationNote\",\n      v.regulator_type AS \"regulatorType\",\n      v.reviewed_at AS \"lastVerifiedAt\",\n      CASE WHEN v.expert_id IS NOT NULL THEN 'platform_onboarding_approved' ELSE NULL END AS \"verificationStatus\"\n    FROM immigration_lawyers l\n    JOIN expert_consultation_profiles p ON p.expert_id = l.id\n    /* PLATFORM_EXPERT_VERIFICATION_METADATA: latest approved onboarding review only. */\n    LEFT JOIN LATERAL (\n      SELECT a.expert_id, a.regulator_type, a.reviewed_at\n      FROM expert_network_applications a\n      WHERE a.expert_id = l.id AND a.review_status = 'approved'\n      ORDER BY a.reviewed_at DESC NULLS LAST\n      LIMIT 1\n    ) v ON true\n    WHERE l.status = 'active'`;
    source = replaceRequired(source, from, to, "expert verification metadata");
    write(rel, source);
  }
}

// 3) Insert the live provider card on AI Transparency. The surrounding page may
// explain architecture, but this card is authoritative for current enablement/model state.
{
  const rel = "client/src/pages/ai-transparency.tsx";
  let source = read(rel);
  if (!source.includes("AIProviderStatusCard")) {
    source = replaceRequired(
      source,
      `import { OISCDisclaimer } from \"@/components/OISCDisclaimer\";`,
      `import { OISCDisclaimer } from \"@/components/OISCDisclaimer\";\nimport AIProviderStatusCard from \"@/components/AIProviderStatusCard\";`,
      "AI transparency provider import",
    );
    source = replaceRequired(
      source,
      `        <OISCDisclaimer variant=\"full\" className=\"mb-8\" />`,
      `        <OISCDisclaimer variant=\"full\" className=\"mb-8\" />\n\n        <div className=\"mb-8\">\n          <AIProviderStatusCard />\n        </div>`,
      "AI transparency live provider card",
    );
    write(rel, source);
  }
}

// 4) Harden names/descriptions that are exposed in the public Tools Hub and
// catalogue. Route IDs remain unchanged for backwards compatibility.
{
  const rel = "shared/tools-data.ts";
  let source = read(rel);
  source = replaceAllKnown(source, [
    ["Approved Advisors/Endorsers Finder", "Adviser & Endorser Information Finder"],
    ["Find and compare approved visa advisors and endorsers", "Find participating professionals and compare published endorsing-body information; verify professional regulatory status independently"],
    ["Ensure compliance with UK visa rules and regulations", "Review preparation against configured Innovator Founder checks; this does not certify legal compliance"],
    ["Ensure data security and GDPR compliance", "Review data-security and privacy preparation topics; this does not certify UK GDPR compliance"],
    ["Create professional IVS-ready cover letters for endorsement applications", "Draft an endorsement cover-letter preparation document for review against current requirements"],
    ["OISC Compliance Guide", "Immigration Advice Boundary Guide"],
    ["Immigration advice boundary checker & legal opinion templates", "Understand software and regulated-advice boundaries and when to seek an IAA- or SRA-regulated professional"],
    ["Verify UK jurisdiction and visa eligibility", "Review entered information against configured jurisdiction and eligibility criteria; not a legal eligibility decision"],
    ["Track visa application status in real-time", "Record and organise application status updates that you receive"],
    ["Legal Compliance Guide", "Legal & Regulatory Preparation Guide"],
    ["Comprehensive UK legal compliance guide", "General UK legal and regulatory preparation information; not legal advice or compliance certification"],
    ["Ready-to-use legal document templates", "General document templates for review and adaptation; not legal advice"],
    ["Success Probability Predictor", "Preparation Strength Review"],
    ["Predict visa success probability", "Review evidence strengths and gaps without predicting endorsement or visa outcomes"],
    ["Win Probability Predictor", "Application Scenario Review"],
    ["Predict application win probability", "Explore preparation scenarios without predicting endorsement or visa outcomes"],
    ["Zero-to-Approved Roadmap", "Application Preparation Roadmap"],
    ["Complete roadmap from zero to visa approved", "Plan preparation steps from evidence gathering through final review without promising an outcome"],
    ["Say 'Build my visa' and let AI orchestrate your entire application", "Coordinate supported preparation tools across a structured workflow; outputs remain drafts for review"],
    ["Master AI coordinating 4 specialist agents for comprehensive visa analysis", "Coordinates specialist AI preparation tools across supported planning and review tasks"],
    ["Real-time UK immigration law monitoring and compliance alerts", "Tracks selected official GOV.UK Innovator Founder updates and preparation alerts"],
    ["Generate technical diagrams and patent claims for your innovation", "Document technical concepts and IP considerations for review; not patent drafting or legal advice"],
    ["Visa Eligibility Validator", "Eligibility Criteria Checker"],
    ["Validate visa eligibility", "Review entered information against configured route criteria; not a legal eligibility decision"],
    ["Tax Planning & Structure Advisor", "Tax Planning & Structure Planner"],
    ["IP & Patent Strategy Advisor", "IP & Patent Strategy Planner"],
    ["Appeal Strategy Builder", "Refusal Information & Next-Steps Guide"],
    ["Build strategy for visa appeals", "Organise refusal information and questions to discuss with a regulated professional; not legal advice"],
    ["Generate strong rebuttal letters", "Draft a response document for review; seek regulated advice where legal representations are required"],
    ["UK Innovation Visa", "UK Innovator Founder"],
  ]);
  write(rel, source);
}

// 5) Remove stale or unsupported server-rendered SEO claims. Client SEO is not
// enough because crawlers can see these initial HTML tags first.
{
  const rel = "server/index.ts";
  let source = read(rel);
  source = replaceAllKnown(source, [
    ["UK Innovator Founder Visa Assistant — Business Plan, Endorsement & Compliance Tools", "UK Innovator Founder Visa Assistant — Business Planning & Preparation Tools"],
    ["The UK's leading AI platform for Innovator Founder Visa applications. Generate your 80-page business plan, prepare for endorsement, check compliance, and access 109 expert tools — from business model validation to financial projections.", "AI-assisted business planning, evidence organisation and preparation tools for the UK Innovator Founder route. The platform does not provide legal advice or guarantee endorsement or visa outcomes."],
    ["UK Innovator Founder Visa Blog | Expert Guides & News", "UK Innovator Founder Visa Blog | Guides & Official-Source Updates"],
    ["In-depth guides, news, and analysis on the UK Innovator Founder Visa. Every article is quad-AI verified against official GOV.UK sources for 100% accuracy.", "Guides, news and analysis on the UK Innovator Founder route. Important requirements should always be checked against current official GOV.UK sources."],
    ["Expert guides and analysis on the UK Innovator Founder Visa, verified by four independent AI models.", "Guides and analysis on the UK Innovator Founder route with official-source references where available."],
    ["UK Innovator Founder Visa Tools | 100+ Expert AI Tools", "UK Innovator Founder Visa Tools | Application Preparation Workspace"],
    ["Access 100+ professional-grade AI tools for your UK Innovator Founder Visa application. Innovation scoring, compliance checking, business plan generation, endorsement readiness, and more.", "Explore AI-assisted planning, evidence, financial-modelling and preparation tools for the UK Innovator Founder route. Tool outputs are preparation aids, not legal advice or outcome predictions."],
    ["100+ professional AI-powered tools for the UK Innovator Founder Visa application", "AI-assisted preparation tools for the UK Innovator Founder route"],
    ["UK Innovator Founder Visa FAQ 2026 | 25+ Expert Answers", "UK Innovator Founder Visa FAQ | General Information & Official Sources"],
    ["Answers to 25+ frequently asked questions about the UK Innovator Founder Visa. Expert guidance on endorsement, requirements (£1,191 fee, £1,270 savings), timeline, and ILR settlement.", "General information about Innovator Founder endorsement, eligibility, fees, timelines and settlement. Verify current figures and rules on GOV.UK before relying on them."],
    ["The visa fee is £1,191. You must also show £1,270 in personal savings held for 28 consecutive days. There is no minimum business investment requirement. A priority service costs £500 where available.", "Application fees, maintenance-funds requirements and optional service charges can change. Check the current Innovator Founder fees and financial requirements on GOV.UK before applying."],
    ["The visa is initially granted for 3 years. It can be extended for a further 3 years. After 3 years you may apply for Indefinite Leave to Remain (ILR/settlement) at a fee of £2,885.", "The route can lead to settlement after the qualifying period if all applicable requirements are met. Check the current extension and settlement rules and fees on GOV.UK."],
    ["UK Innovator Founder Visa Complete Guide 2026 | Requirements, Process & Timeline", "UK Innovator Founder Visa Guide | Requirements, Process & Official Sources"],
    ["Comprehensive expert guide to the UK Innovator Founder Visa. Covers requirements, all four endorsing bodies, innovation/viability/scalability criteria, financial planning, and the path to ILR settlement.", "General guide to Innovator Founder requirements, endorsing-body information, Innovation, Viability and Scalability criteria, financial planning and settlement preparation. Verify current rules on GOV.UK."],
    ["Comprehensive expert guide covering all aspects of the UK Innovator Founder Visa application process, requirements, and path to settlement.", "General informational guide to the UK Innovator Founder application process, requirements and settlement preparation."],
    ["About UK Innovator Founder Visa Assistant | AI-Powered Visa Guidance", "About UK Innovator Founder Visa Assistant | AI-Assisted Preparation"],
    ["Learn about the UK Innovator Founder Visa Assistant — the UK's leading AI platform for Innovator Founder Visa applicants, with 100+ expert tools and quad-AI verified content.", "Learn about the AI-assisted planning, evidence and preparation tools provided by UK Innovator Founder Visa Assistant and the boundaries of the service."],
    ["Get in touch with the UK Innovator Founder Visa Assistant team. We provide expert support for your visa application journey.", "Get in touch with the UK Innovator Founder Visa Assistant team for platform and account support."],
    ["Create your free account on the UK Innovator Founder Visa Assistant platform. Access innovation scoring, compliance checking, and business plan generation tools instantly.", "Create an account to access Innovator Founder planning, evidence and preparation tools according to the current plan catalogue."],
    ["Sign in to your UK Innovator Founder Visa Assistant account to access your tools, saved progress, and personalised visa guidance.", "Sign in to access your preparation tools, saved progress and application workspace."],
    ["Expert guide on ${post.title} — quad-AI verified UK Innovator Founder Visa advice.", "Guide on ${post.title}. Check important immigration requirements against current official GOV.UK sources."],
  ]);
  source = source.replace(/\n\s*\"reviewedBy\": \[\n\s*\{ \"@type\": \"Organization\", \"name\": \"Gemini AI\" \},\n\s*\{ \"@type\": \"Organization\", \"name\": \"OpenAI GPT-4o\" \},\n\s*\{ \"@type\": \"Organization\", \"name\": \"Claude AI\" \},\n\s*\{ \"@type\": \"Organization\", \"name\": \"Qwen AI\" \}\n\s*\]/, "");
  write(rel, source);
}

console.log("[platform-trust] Public trust hardening preparation complete");
