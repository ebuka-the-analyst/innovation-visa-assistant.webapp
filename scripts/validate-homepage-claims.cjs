const fs = require("fs");
const path = require("path");

const files = [
  "client/src/pages/home.tsx",
  "client/src/components/Header.tsx",
  "client/src/components/HeroSection.tsx",
  "client/src/components/ReadinessScoreWidget.tsx",
  "client/src/components/FeaturesSection.tsx",
  "client/src/components/FeaturesModal.tsx",
  "client/src/components/SamplePlansModal.tsx",
  "client/src/components/PlatformPillars.tsx",
  "client/src/components/AIAgents.tsx",
  "client/src/components/AI2040Showcase.tsx",
  "client/src/components/CompetitorFeatures.tsx",
  "client/src/components/StatsSection.tsx",
  "client/src/components/PricingSection.tsx",
  "client/src/components/TestimonialsSection.tsx",
  "client/src/components/LawyerCTA.tsx",
  "client/src/components/FAQSection.tsx",
  "client/src/components/Disclaimer.tsx",
  "client/src/components/Footer.tsx",
  "client/src/components/ComplianceBadges.tsx",
  "client/src/lib/seo-schemas.ts",
];

const combined = files.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8")).join("\n");

const forbidden = [
  "Trusted by 500+ Approved Applicants",
  "Get Your UK Innovator Founder Visa Approved",
  "Advanced Qwen AI technology",
  "Endorsing Body Ready",
  "Compliance Guaranteed",
  "success probability",
  "predicting endorser reactions",
  "Speak your business idea, get a complete visa application",
  "maximize your approval chances",
  "Overall approval rate for well-prepared applications",
  "Total Timeline - 6-8 weeks endorsement + 12-16 weeks processing",
  "Investment requirement for team applications",
  "Trusted by Successful Applicants",
  "Join hundreds of entrepreneurs who received their UK Innovator Founder Visa approval",
  "Approved in 4 weeks!",
  "approved visa in 6 weeks",
  "ICO Registered",
  "GDPR Compliant",
  "OISC Compliant",
  "visa-ready business plans",
  "Under 15 Minutes",
  "Reduces rejection risk by 85%",
  "Proven with 500+ successful applications",
  "Home Office compliance certified",
  "minimum 10 jobs over 2 years required",
  "Trained on GOV.UK guidance",
  "Money-Back Guarantee",
  "Most Popular",
  "The UK's leading",
  '"aggregateRating"',
  '"sameAs"',
  '"foundingDate"',
];

for (const phrase of forbidden) {
  if (combined.includes(phrase)) throw new Error(`Homepage claim regression: forbidden phrase remains: ${phrase}`);
}

const required = [
  "Prepare a Stronger UK Innovator Founder",
  "not visa approval probabilities",
  "does not provide regulated immigration advice",
  "What the Innovator Founder Rules Assess",
  "Transparent, Evidence-Led Preparation",
  "Not Legal Advice",
  "not a regulated immigration adviser or decision-maker",
  "FICTIONAL EXAMPLE",
  "Always check GOV.UK for the full and latest rules before applying",
  "Official GOV.UK source",
  "EXAMPLE ONLY",
  "Example preparation score",
  "Featured Plan",
];

for (const phrase of required) {
  if (!combined.includes(phrase)) throw new Error(`Homepage claim regression: required safety wording missing: ${phrase}`);
}

console.log(JSON.stringify({ ok: true, filesChecked: files.length, forbiddenClaimsChecked: forbidden.length, requiredSafetyMarkersChecked: required.length }, null, 2));
