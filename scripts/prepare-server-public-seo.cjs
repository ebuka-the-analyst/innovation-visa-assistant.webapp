const fs = require("node:fs");
const path = require("node:path");

const target = path.join(process.cwd(), "server/index.ts");
let source = fs.readFileSync(target, "utf8");
const before = source;

// Server-rendered metadata is public content too. Match both the normal apostrophe
// form and the escaped source-code form so crawler-facing claims cannot survive
// because of string-literal escaping.
source = source.replace(
  /The UK\\?'s leading AI platform for Innovator Founder Visa applications\. Generate your 80-page business plan, prepare for endorsement, check compliance, and access 109 expert tools — from business model validation to financial projections\./g,
  "AI-assisted business planning, evidence organisation and preparation tools for the UK Innovator Founder route. The platform does not provide legal advice or guarantee endorsement or visa outcomes.",
);
source = source.replace(
  /Learn about the UK Innovator Founder Visa Assistant — the UK\\?'s leading AI platform for Innovator Founder Visa applicants, with 100\+ expert tools and quad-AI verified content\./g,
  "Learn about the AI-assisted planning, evidence and preparation tools provided by UK Innovator Founder Visa Assistant and the boundaries of the service.",
);

source = source
  .replace(/The UK\\?'s leading AI platform/g, "An AI-assisted preparation platform")
  .replace(/quad-AI verified/gi, "reviewed with configured source checks")
  .replace(/100% accuracy/gi, "source-based accuracy checks")
  .replace(/100\+ professional-grade AI tools/gi, "AI-assisted preparation tools")
  .replace(/personalised visa guidance/gi, "saved preparation workspace")
  .replace(
    /Expert guidance on endorsement, requirements \(£1,191 fee, £1,270 savings\)/g,
    "General information on endorsement, requirements, fees and financial preparation",
  );

source = source.replace(
  /\n\s*"reviewedBy": \[\n\s*\{ "@type": "Organization", "name": "Gemini AI" \},\n\s*\{ "@type": "Organization", "name": "OpenAI GPT-4o" \},\n\s*\{ "@type": "Organization", "name": "Claude AI" \},\n\s*\{ "@type": "Organization", "name": "Qwen AI" \}\n\s*\]/g,
  "",
);

if (source !== before) {
  fs.writeFileSync(target, source, "utf8");
  console.log("[server-public-seo] hardened server-rendered public metadata");
} else {
  console.log("[server-public-seo] no additional server-rendered metadata changes needed");
}
