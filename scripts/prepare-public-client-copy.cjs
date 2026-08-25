const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const replacements = [
  ["Trusted by 500+ Approved Applicants", "Built for Innovator Founder preparation"],
  ["Get Your UK Innovator Founder Visa Approved", "Prepare a Stronger UK Innovator Founder Application"],
  ["The UK's leading AI platform", "An AI-assisted preparation platform"],
  ["quad-AI verified", "reviewed with configured source checks"],
  ["100% accuracy", "source-based accuracy checks"],
  ["Advanced Qwen AI technology", "managed OpenAI and Anthropic AI services"],
  ['"name": "Qwen AI"', '"name": "Managed AI provider"'],
  ["Success Probability Predictor", "Preparation Strength Review"],
  ["Predict visa success probability", "Review evidence strengths and gaps without predicting endorsement or visa outcomes"],
  ["Win Probability Predictor", "Application Scenario Review"],
  ["Predict application win probability", "Explore preparation scenarios without predicting endorsement or visa outcomes"],
  ["Zero-to-Approved Roadmap", "Application Preparation Roadmap"],
  ["Complete roadmap from zero to visa approved", "Plan preparation steps from evidence gathering through final review without promising an outcome"],
  ["Compliance Guaranteed", "Compliance-Focused Checks"],
  ["OISC Compliance Guide", "Immigration Advice Boundary Guide"],
  ["OISC Compliant", "Immigration advice boundary information"],
  ["GDPR Compliant", "Privacy-focused"],
  ["Home Office compliance certified", "Aligned to configured official-source checks"],
  ["visa-ready business plans", "business-plan preparation drafts"],
  ["Money-Back Guarantee", "Refund policy"],
  ["Say 'Build my visa' and let AI orchestrate your entire application", "Coordinate supported preparation tools across a structured workflow; outputs remain drafts for review"],
  ["Real-time UK immigration law monitoring and compliance alerts", "Tracks selected official GOV.UK Innovator Founder updates and preparation alerts"],
  ["Track visa application status in real-time", "Record and organise application status updates that you receive"],
  ["Ensure compliance with UK visa rules and regulations", "Review preparation against configured Innovator Founder checks; this does not certify legal compliance"],
  ["Ensure data security and GDPR compliance", "Review data-security and privacy preparation topics; this does not certify UK GDPR compliance"],
  ["Ready-to-use legal document templates", "General document templates for review and adaptation; not legal advice"],
  ["Expert guidance on endorsement, requirements (£1,191 fee, £1,270 savings)", "General information on endorsement, requirements, fees and financial preparation"],
  ["Every article is quad-AI verified against official GOV.UK sources for 100% accuracy", "Articles use official-source references where available; important requirements should always be checked on GOV.UK"],
  ["100+ professional-grade AI tools", "AI-assisted preparation tools"],
  ["personalised visa guidance", "saved preparation workspace"],
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const normalised = full.replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (normalised.includes("/admin") || normalised.includes("/__tests__")) continue;
      files.push(...walk(full));
      continue;
    }
    if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changedFiles = 0;
for (const file of walk(path.join(root, "client/src"))) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  for (const [from, to] of replacements) {
    after = after.split(from).join(to);
  }
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedFiles += 1;
    console.log(`[public-client-copy] hardened ${path.relative(root, file)}`);
  }
}

console.log(`[public-client-copy] completed; ${changedFiles} public client files changed`);
