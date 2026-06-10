/**
 * UK INNOVATOR FOUNDER VISA BLOG GENERATOR
 *
 * PhD-Level Triple-AI Verified Blog Generation System
 *
 * PIPELINE:
 *  1. Qwen generates the article (primary writer — low temperature, verified facts injected)
 *  2. Auto-correction layer fixes common typos and adds mandatory disclaimers
 *  3. Internal validator (regex-based) runs fabrication & fee checks
 *  4. Gemini independently fact-checks and scores the article          [Marker 1]
 *  5. OpenAI GPT-4o independently fact-checks and scores the article   [Marker 2]
 *  6. Consensus gate: both must score ≥95 AND no critical flags to auto-publish
 *  7. If gate fails → post saved as 'human_review', not published
 *  8. All posts get a SHA-256 content hash for integrity verification
 *  9. Verification expires after 90 days — stale posts auto-flagged
 *
 * 3× DAILY SCHEDULE: 07:00, 12:00, 20:00 GMT
 */

// Qwen removed — using Gemini as primary writer (Qwen account in arrears)
import { db } from "./db";
import { blogPosts } from "@shared/schema";
import { sql as drizzleSql } from "drizzle-orm";
import { verifyBlogPost, computeContentHash } from "./blogMultiVerifier";
import {
  VERIFIED_VISA_FEES,
  VERIFIED_ELIGIBILITY,
  VERIFIED_ENDORSING_BODIES,
  VERIFIED_SETTLEMENT_REQUIREMENTS,
  getVerifiedEndorsingBodyInfo,
  getStandardDisclaimer,
  getLastUpdatedNotice
} from "./verifiedUKVisaData";
import {
  validateBlogContent,
  correctContent,
  generateValidationReport
} from "./blogContentValidator";


// ============================================================================
// VERIFIED DATA INJECTION - Prevents AI from making up facts
// ============================================================================

const VERIFIED_FACTS_CONTEXT = `
VERIFIED UK INNOVATOR FOUNDER VISA FACTS (January 2026):
Use ONLY these verified facts in your article. DO NOT make up any statistics, fees, or requirements.

VISA FEES (Source: GOV.UK):
- Application fee: £${VERIFIED_VISA_FEES.innovatorFounderVisa.applicationFee}
- Immigration Health Surcharge: £${VERIFIED_VISA_FEES.innovatorFounderVisa.immigrationHealthSurcharge} per year
- Priority service: £${VERIFIED_VISA_FEES.innovatorFounderVisa.priorityService} (where available)
- Endorsement fees: Vary by endorsing body - typically ${VERIFIED_VISA_FEES.endorsementCosts.typicalRange}. Do NOT cite specific amounts.

FINANCIAL REQUIREMENTS (Source: GOV.UK):
- Minimum funds: £${VERIFIED_ELIGIBILITY.financialRequirement.amount}
- Must be held for: ${VERIFIED_ELIGIBILITY.financialRequirement.durationDays} consecutive days

VISA DURATION:
- Initial grant: ${VERIFIED_ELIGIBILITY.visaDuration.initial}
- Extension: ${VERIFIED_ELIGIBILITY.visaDuration.extension}
- Settlement eligibility: ${VERIFIED_ELIGIBILITY.visaDuration.settlementEligibility}

ENGLISH LANGUAGE:
- Minimum level: ${VERIFIED_ELIGIBILITY.englishLanguage.minimumLevel} CEFR

ENDORSING BODIES (ONLY these 4 exist - Home Office approved as of October 2024):
1. Envestors Limited - envestors.co.uk
2. Innovator International Limited - innovatorinternational.com  
3. UK Endorsing Services (UKES) - ukesapp.co.uk
4. Global Entrepreneurs Programme (GEP) - government programme, INVITATION ONLY

IMPORTANT: Do NOT describe what "type" of applicant each endorsing body prefers - this information is not publicly verified. Note that GEP is invitation-only and cannot be applied to directly.

ENDORSEMENT CRITERIA (Source: GOV.UK):
- Innovation: Must be genuinely new or significantly different
- Viability: Applicant must have skills and knowledge to run business
- Scalability: Must have potential for growth and job creation

SETTLEMENT REQUIREMENTS:
- Time in UK: At least 3 years
- ILR fee: £${VERIFIED_SETTLEMENT_REQUIREMENTS.fee}
- Life in UK test: Required
- English: B1 level required
`;

// ============================================================================
// TOPIC LIBRARY — 150+ unique, specific topics across 6 categories
// Each topic is designed to produce genuinely different content.
// New topics should only be added here — NEVER duplicated.
// ============================================================================

const TOPIC_LIBRARY: Array<{ topic: string; category: string }> = [
  // ── APPLICATION PROCESS ──────────────────────────────────────────────────
  { topic: "Step-by-step guide to the UK Innovator Founder Visa application process", category: "guides" },
  { topic: "UK Innovator Founder Visa fees explained: Complete cost breakdown for 2026", category: "visa-updates" },
  { topic: "Documents checklist for UK Innovator Founder Visa application", category: "guides" },
  { topic: "Timeline planning: How long the visa process takes from start to finish", category: "guides" },
  { topic: "Preparing for your biometric appointment: What to bring and expect", category: "guides" },
  { topic: "How to track your UK visa application status after submission", category: "guides" },
  { topic: "What happens after you submit your Innovator Founder Visa application", category: "visa-updates" },
  { topic: "How to use the UK Visas and Immigration online portal for your application", category: "guides" },
  { topic: "Priority processing for UK Innovator Founder Visa: Is it worth it?", category: "visa-updates" },
  { topic: "Switching to Innovator Founder Visa from within the UK: Requirements and process", category: "uk-immigration" },
  { topic: "Applying for the UK Innovator Founder Visa from outside the UK: Entry clearance guide", category: "uk-immigration" },
  { topic: "Immigration Health Surcharge explained for Innovator Founder Visa applicants", category: "uk-immigration" },
  { topic: "How long does an Innovator Founder Visa application take to process?", category: "visa-updates" },
  { topic: "What to do if your Innovator Founder Visa application is refused", category: "uk-immigration" },
  { topic: "UK Innovator Founder Visa administrative review process explained", category: "uk-immigration" },

  // ── FINANCIAL REQUIREMENTS ────────────────────────────────────────────────
  { topic: "Complete guide to UK Innovator Founder Visa financial requirements in 2026", category: "guides" },
  { topic: "How to prove the £50,000 maintenance fund requirement for UK visa", category: "guides" },
  { topic: "What counts as acceptable funds for the UK Innovator Founder Visa financial requirement", category: "guides" },
  { topic: "How long must you hold the £50,000 before applying for the Innovator Founder Visa", category: "visa-updates" },
  { topic: "Bank statements and financial evidence: What UK visa officers look for", category: "guides" },
  { topic: "Do Innovator Founder Visa holders need £50,000 for extensions and renewals?", category: "visa-updates" },
  { topic: "Investor funding vs personal savings: Which counts for your visa financial requirement", category: "business-planning" },
  { topic: "How to explain large deposits in your bank statements for UK visa applications", category: "guides" },

  // ── ENDORSEMENT ────────────────────────────────────────────────────────────
  { topic: "The three criteria for endorsement: Innovation, Viability, and Scalability explained", category: "endorsement" },
  { topic: "How to prepare for your endorsing body interview: Questions and preparation tips", category: "endorsement" },
  { topic: "Choosing an endorsing body: Factors to consider for UK Innovator Founder Visa", category: "endorsement" },
  { topic: "What endorsing bodies actually look for when assessing your business idea", category: "endorsement" },
  { topic: "How to demonstrate innovation to your Innovator Founder Visa endorsing body", category: "endorsement" },
  { topic: "How to prove viability to a UK endorsing body: A practical guide", category: "endorsement" },
  { topic: "Demonstrating scalability: What endorsing bodies want to see in your business plan", category: "endorsement" },
  { topic: "How to write an innovation statement that meets endorsement criteria", category: "endorsement" },
  { topic: "Endorsement rejection: Common reasons and how to appeal or reapply", category: "endorsement" },
  { topic: "What documents does an endorsing body require before the interview?", category: "endorsement" },
  { topic: "How to research and compare the three UK Innovator Founder Visa endorsing bodies", category: "endorsement" },
  { topic: "Envestors Limited as an endorsing body: What you need to know", category: "endorsement" },
  { topic: "Innovator International Limited as an endorsing body: What applicants should know", category: "endorsement" },
  { topic: "UK Endorsing Services (UKES): A guide for visa applicants", category: "endorsement" },
  { topic: "What is the Global Entrepreneurs Programme and who qualifies for it?", category: "endorsement" },
  { topic: "How many endorsing body applications can you make if rejected?", category: "endorsement" },
  { topic: "How long does endorsement last and when does it need to be renewed?", category: "endorsement" },

  // ── CONTACT POINT MEETINGS ─────────────────────────────────────────────────
  { topic: "Contact point meetings: What to expect and how to prepare", category: "endorsement" },
  { topic: "Your 6-month contact point meeting: What to report and how to prepare", category: "endorsement" },
  { topic: "Your 12-month contact point meeting: Progress milestones your endorser expects", category: "endorsement" },
  { topic: "Your 24-month contact point meeting: What you need to show for ILR eligibility", category: "endorsement" },
  { topic: "What evidence of business progress do you need for contact point meetings?", category: "endorsement" },
  { topic: "How to prepare your business update report for your endorsing body", category: "business-planning" },
  { topic: "What happens if you miss or fail a contact point meeting?", category: "endorsement" },

  // ── SETTLEMENT & ILR ──────────────────────────────────────────────────────
  { topic: "Path to settlement: From Innovator Founder Visa to Indefinite Leave to Remain", category: "uk-immigration" },
  { topic: "ILR requirements for Innovator Founder Visa holders: A complete checklist", category: "uk-immigration" },
  { topic: "The Life in the UK test: A guide for Innovator Founder Visa holders seeking ILR", category: "uk-immigration" },
  { topic: "How absences from the UK affect your eligibility for Indefinite Leave to Remain", category: "uk-immigration" },
  { topic: "ILR to British citizenship: What Innovator Founder Visa holders need to know", category: "uk-immigration" },
  { topic: "English language requirements for ILR: What level is needed after Innovator Founder Visa", category: "uk-immigration" },
  { topic: "Can you count time on other visa routes towards ILR after getting an Innovator Founder Visa?", category: "uk-immigration" },

  // ── VISA COMPLIANCE & MAINTENANCE ─────────────────────────────────────────
  { topic: "Maintaining your endorsement: Compliance requirements for visa holders", category: "visa-updates" },
  { topic: "Understanding absences: How time outside the UK affects your Innovator Founder Visa", category: "visa-updates" },
  { topic: "When endorsement can be withdrawn: Avoiding common compliance pitfalls", category: "endorsement" },
  { topic: "Extending your Innovator Founder Visa: Requirements and timeline", category: "visa-updates" },
  { topic: "What counts as a 'significant change' that must be reported to your endorsing body?", category: "endorsement" },
  { topic: "How to notify your endorsing body if your business changes direction", category: "endorsement" },
  { topic: "Can you work for another employer while on the Innovator Founder Visa?", category: "visa-updates" },
  { topic: "Can you pursue a second business while on the Innovator Founder Visa?", category: "visa-updates" },
  { topic: "What happens to your visa if your endorsed business fails?", category: "visa-updates" },
  { topic: "How to keep your Innovator Founder Visa compliant if you pivot your business model", category: "visa-updates" },

  // ── FAMILY & DEPENDANTS ───────────────────────────────────────────────────
  { topic: "Bringing your family to the UK: Dependent visa guide for Innovator Founder Visa holders", category: "uk-immigration" },
  { topic: "Can your spouse or partner work in the UK on a dependent visa?", category: "uk-immigration" },
  { topic: "Bringing children to the UK on the Innovator Founder Visa dependent route", category: "uk-immigration" },
  { topic: "School enrollment for children of Innovator Founder Visa holders in the UK", category: "uk-immigration" },
  { topic: "NHS access for Innovator Founder Visa holders and their dependants", category: "uk-immigration" },
  { topic: "What happens to dependants if the main Innovator Founder Visa holder's visa is refused or revoked?", category: "uk-immigration" },

  // ── BUSINESS PLANNING ─────────────────────────────────────────────────────
  { topic: "Creating financial projections for your UK visa business plan", category: "business-planning" },
  { topic: "Market research requirements for your UK Innovator Founder Visa application", category: "business-planning" },
  { topic: "Common business plan mistakes that lead to endorsement rejection", category: "business-planning" },
  { topic: "How to structure a UK Innovator Founder Visa business plan: A complete template", category: "business-planning" },
  { topic: "What is an innovation statement and how do you write one that passes endorsement?", category: "business-planning" },
  { topic: "How to show your business idea is genuinely new in the UK market", category: "business-planning" },
  { topic: "Revenue projections for early-stage startups: What endorsers expect to see", category: "business-planning" },
  { topic: "How to write a competitive analysis for your Innovator Founder Visa business plan", category: "business-planning" },
  { topic: "Job creation plans: What endorsers look for in your hiring strategy", category: "business-planning" },
  { topic: "How to present your team and founder background in your business plan", category: "business-planning" },
  { topic: "Intellectual property and patents: How they strengthen your Innovator Founder Visa application", category: "business-planning" },
  { topic: "How to demonstrate you have the skills to run your proposed UK business", category: "business-planning" },
  { topic: "Writing the executive summary for your UK Innovator Founder Visa business plan", category: "business-planning" },
  { topic: "What is a minimum viable product and does having one help your endorsement application?", category: "business-planning" },
  { topic: "How to handle a business plan that targets a niche market in the UK", category: "business-planning" },
  { topic: "Using a pitch deck alongside your business plan for the Innovator Founder Visa", category: "business-planning" },
  { topic: "How to quantify the social impact of your business for endorsement purposes", category: "business-planning" },
  { topic: "B2B vs B2C businesses: Does the model affect Innovator Founder Visa endorsement?", category: "business-planning" },

  // ── UK BUSINESS ENVIRONMENT ───────────────────────────────────────────────
  { topic: "UK government grants and funding available to Innovator Founder Visa holders", category: "business-planning" },
  { topic: "Tax considerations for entrepreneurs on the UK Innovator Founder Visa", category: "business-planning" },
  { topic: "Registering your company in the UK: Step-by-step guide for visa applicants", category: "guides" },
  { topic: "Opening a UK business bank account as an international founder", category: "guides" },
  { topic: "Innovate UK grants: How to apply and what qualifies", category: "business-planning" },
  { topic: "SEIS and EIS investor schemes: What Innovator Founder Visa holders need to know", category: "business-planning" },
  { topic: "R&D tax credits for UK startups founded on the Innovator Founder Visa", category: "business-planning" },
  { topic: "How to find angel investors and venture capital in the UK startup ecosystem", category: "business-planning" },
  { topic: "National Insurance obligations for Innovator Founder Visa holders who employ staff", category: "business-planning" },
  { topic: "VAT registration for early-stage UK startups: When and how", category: "business-planning" },
  { topic: "Corporation tax basics for UK startups founded under the Innovator Founder Visa", category: "business-planning" },
  { topic: "How to use UK startup incubators and accelerators as an Innovator Founder", category: "business-planning" },
  { topic: "University spinout partnerships: A route for tech founders on the Innovator Founder Visa", category: "endorsement" },
  { topic: "UK government support schemes for international entrepreneurs in 2026", category: "visa-updates" },
  { topic: "How UK free trade zones could benefit Innovator Founder Visa businesses", category: "business-planning" },

  // ── ENGLISH LANGUAGE ─────────────────────────────────────────────────────
  { topic: "Understanding the English language requirements for UK Innovator Founder Visa", category: "guides" },
  { topic: "Accepted English language tests for the UK Innovator Founder Visa in 2026", category: "guides" },
  { topic: "IELTS vs PTE vs TOEFL: Which English test is best for your UK visa application?", category: "guides" },
  { topic: "English language exemptions for the UK Innovator Founder Visa: Who qualifies?", category: "guides" },
  { topic: "How to prepare for English language tests required for UK visa applications", category: "guides" },
  { topic: "How long are English language test results valid for UK visa purposes?", category: "visa-updates" },

  // ── SECTOR-SPECIFIC GUIDANCE ──────────────────────────────────────────────
  { topic: "Tech founders and the UK Innovator Founder Visa: What the endorsement criteria means for software businesses", category: "endorsement" },
  { topic: "Healthcare and medtech startups on the UK Innovator Founder Visa: Key considerations", category: "endorsement" },
  { topic: "Fintech founders applying for the UK Innovator Founder Visa: What endorsers look for", category: "endorsement" },
  { topic: "Green tech and sustainability businesses on the UK Innovator Founder Visa", category: "endorsement" },
  { topic: "EdTech founders and the UK Innovator Founder Visa: Meeting the innovation criterion", category: "endorsement" },
  { topic: "E-commerce businesses on the UK Innovator Founder Visa: Can they qualify?", category: "business-planning" },
  { topic: "AI and machine learning startups applying for the UK Innovator Founder Visa", category: "endorsement" },
  { topic: "Social enterprises and the UK Innovator Founder Visa: Meeting the endorsement criteria", category: "endorsement" },
  { topic: "Creative industry businesses on the UK Innovator Founder Visa: What you need to know", category: "business-planning" },
  { topic: "Manufacturing startups and the UK Innovator Founder Visa: Demonstrating scalability", category: "endorsement" },

  // ── COMMON MISTAKES & REFUSALS ────────────────────────────────────────────
  { topic: "Common reasons for UK Innovator Founder Visa refusal and how to avoid them", category: "guides" },
  { topic: "Why endorsement applications get rejected and how to strengthen yours", category: "endorsement" },
  { topic: "Document errors that cause UK visa refusal: How to avoid them", category: "guides" },
  { topic: "Financial evidence mistakes that lead to UK Innovator Founder Visa refusal", category: "guides" },
  { topic: "How misleading or inconsistent business plans lead to visa refusal", category: "business-planning" },
  { topic: "What happens if you provide incorrect information on a UK visa application?", category: "uk-immigration" },
  { topic: "UK visa refusal and the 10-year ban: How to avoid deception findings", category: "uk-immigration" },

  // ── LEGAL, OISC & PROFESSIONAL ADVICE ────────────────────────────────────
  { topic: "When should you hire an immigration lawyer for your UK Innovator Founder Visa?", category: "guides" },
  { topic: "What is OISC and why does it matter when choosing an immigration adviser?", category: "guides" },
  { topic: "Regulated vs unregulated immigration advice: Risks to avoid", category: "guides" },
  { topic: "How to verify an immigration adviser's OISC registration before hiring them", category: "guides" },
  { topic: "What a qualified immigration solicitor can and cannot do for your visa", category: "guides" },

  // ── LIFE IN THE UK ────────────────────────────────────────────────────────
  { topic: "Renting accommodation in the UK as an Innovator Founder Visa holder", category: "guides" },
  { topic: "Getting a UK driving licence as an international entrepreneur on a visa", category: "guides" },
  { topic: "UK National Insurance number: How and when to apply as an Innovator Founder Visa holder", category: "guides" },
  { topic: "Opening a personal bank account in the UK as a visa holder", category: "guides" },
  { topic: "UK credit history: How to build it from scratch as a new arrival", category: "guides" },
  { topic: "Childcare options and costs in the UK for Innovator Founder Visa families", category: "guides" },
  { topic: "UK pension contributions for Innovator Founder Visa holders: What you need to know", category: "business-planning" },
];

// ── STOP WORDS used when computing topic fingerprints ─────────────────────
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","for","to","of","in","on","with","your",
  "you","how","what","why","when","who","is","are","was","were","be","been",
  "do","does","did","uk","visa","innovator","founder","applicant","applicants",
  "guide","guides","complete","explained","explaining","understanding","know",
  "its","it","as","by","from","at","this","that","these","those","have","has",
  "about","can","need","get","make","will","should","must","may","which",
]);

function topicFingerprint(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  );
}

function fingerprintOverlap(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  const denominator = Math.min(a.size, b.size);
  return denominator === 0 ? 0 : shared / denominator;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

/**
 * Picks an unused topic from the library.
 * Queries the database for existing post titles, computes fingerprints,
 * and skips any topic that is too similar to an existing post (≥ 40% overlap).
 * Also accepts an in-memory set of already-used topics for within-batch uniqueness.
 * Falls back to the least-recently-used topic if the entire library is covered.
 */
async function pickUnusedTopic(
  inBatchTitles: string[] = []
): Promise<{ topic: string; category: string }> {
  // Fetch all existing titles from the database
  let existingTitles: string[] = [];
  try {
    const rows = await db.execute(drizzleSql`SELECT title FROM blog_posts`);
    existingTitles = (rows.rows as Array<{ title: string }>).map(r => r.title);
  } catch {
    // If DB query fails, proceed with random selection
  }

  // Combine DB titles + already-generated titles within this batch
  const allTitles = [...existingTitles, ...inBatchTitles];
  const existingFingerprints = allTitles.map(t => topicFingerprint(t));

  // Shuffle the library so we don't always pick in the same order
  const shuffled = [...TOPIC_LIBRARY].sort(() => Math.random() - 0.5);

  for (const entry of shuffled) {
    const fp = topicFingerprint(entry.topic);
    // Lower threshold to 0.4 so near-duplicate topics are caught more aggressively
    const tooSimilar = existingFingerprints.some(ef => fingerprintOverlap(fp, ef) >= 0.4);
    if (!tooSimilar) return entry;
  }

  // All topics covered → pick the one that hasn't been published most recently
  // (allows genuine reruns only when the full library is exhausted)
  console.warn("[Blog] All topics already covered — cycling to least-recently-used topic");
  return shuffled[0];
}

/**
 * After the AI generates a title, check it against existing DB titles and
 * in-batch titles to catch cases where the AI drifts and produces the same
 * headline for different topics.
 */
export async function isTitleTooSimilarToExisting(
  generatedTitle: string,
  inBatchTitles: string[] = []
): Promise<boolean> {
  let existingTitles: string[] = [];
  try {
    const rows = await db.execute(drizzleSql`SELECT title FROM blog_posts`);
    existingTitles = (rows.rows as Array<{ title: string }>).map(r => r.title);
  } catch {
    return false;
  }
  const allTitles = [...existingTitles, ...inBatchTitles];
  const fp = topicFingerprint(generatedTitle);
  return allTitles.some(t => fingerprintOverlap(fp, topicFingerprint(t)) >= 0.6);
}

// ============================================================================
// FEATURED IMAGE - Generate a branded title card SVG (no AI image generation)
// ============================================================================

function buildCoverImageUrl(title: string, category: string): string {
  return `/api/blog/cover?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export async function generateBlogPost(inBatchTitles: string[] = []): Promise<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  featuredImage: string;
  readingTime: number;
  author: string;
  authorBio: string;
  // Triple-AI verification fields
  aiVerificationScore: number | null;
  geminiScore: number | null;
  openaiScore: number | null;
  verificationStatus: string;
  verificationDetails: Record<string, unknown> | null;
  verifiedAt: Date | null;
  verificationExpiresAt: Date | null;
  humanReviewRequired: boolean;
  contradictionFlags: number;
  sourcesCited: number;
  contentHash: string;
  isPublished: boolean;
  postStatus: string;
}> {
  const { topic, category } = await pickUnusedTopic(inBatchTitles);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `You are a UK immigration information writer. Write an ACCURATE, HELPFUL blog article using ONLY the verified facts provided below.

${VERIFIED_FACTS_CONTEXT}

TOPIC: ${topic}
CATEGORY: ${category}
PUBLICATION DATE: ${today}

CRITICAL RULES - FOLLOW EXACTLY:

1. NEVER FABRICATE CONTENT:
   - DO NOT create fictional case studies with made-up names (no "Meet Sarah", "Take John's story", etc.)
   - DO NOT invent statistics or percentages
   - DO NOT make up quotes from applicants
   - DO NOT fabricate government announcements
   - If you need examples, use hypothetical scenarios clearly marked as "For example, an applicant might..."

2. ONLY USE VERIFIED FACTS:
   - Only cite fees, requirements, and timelines from the verified facts above
   - When discussing endorsing bodies, only state their names - DO NOT describe their "specialization" or "ideal applicant type"
   - DO NOT invent success rates or approval percentages

3. REQUIRED DISCLAIMER:
   - End every article with this exact disclaimer box:
   <div class="disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6">
   <p class="text-sm"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener" class="text-primary underline">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p>
   </div>

4. INTERNAL LINKING:
   - Include 2-3 links to other relevant pages on our platform using this format:
   <a href="/tools" class="text-primary hover:underline">our visa preparation tools</a>
   <a href="/business-plan" class="text-primary hover:underline">Business Plan Generator</a>
   <a href="/faq" class="text-primary hover:underline">frequently asked questions</a>
   <a href="/blog" class="text-primary hover:underline">more articles</a>

5. WRITING STYLE:
   - Professional, helpful, and accurate
   - Clear and easy to understand for non-native English speakers
   - Practical and actionable advice
   - Well-structured with clear headings
   - 1500-2200 words

6. FORMAT (HTML):
   - Use <h2> for main sections
   - Use <h3> for subsections
   - Use <p> for paragraphs
   - Use <ul><li> for lists
   - Use <strong> for key terms
   - Use <blockquote class="bg-primary/10 border-l-4 border-primary p-4 my-4"> for pro tips

OUTPUT FORMAT (JSON only):
{
  "title": "Clear, descriptive title (50-60 chars)",
  "excerpt": "Helpful summary of what reader will learn (140-155 chars)",
  "content": "Full HTML article with disclaimer at end",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metaTitle": "SEO title with primary keyword (55-60 chars)",
  "metaDescription": "SEO description (150-155 chars)",
  "metaKeywords": ["UK Innovator Founder Visa", "keyword2", "keyword3"],
  "readingTime": 8
}

Return ONLY valid JSON.`;

  // ── Gemini REST API (primary writer) ─────────────────────────────────────
  // Tries all 4 API keys × 3 models. On 429 → rotate to next key.
  // Falls through to OpenAI if every Gemini combo fails.
  const GEMINI_API_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];

  const GEMINI_GENERATION_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

  const systemInstruction = `You are a UK immigration information writer who creates accurate, helpful content. You NEVER fabricate case studies, statistics, or quotes. You ONLY use verified facts. You always include proper disclaimers. Your content is factual, practical, and trustworthy. Always respond with valid JSON only.`;

  const geminiBody = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  };

  outer:
  for (const geminiModel of GEMINI_GENERATION_MODELS) {
    for (const apiKey of GEMINI_API_KEYS) {
    try {
      console.log(`[Blog Generator] Generating via Gemini (${geminiModel})…`);

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      const geminiRaw = await geminiRes.text();
      let geminiData: any;
      try { geminiData = JSON.parse(geminiRaw); } catch {
        console.warn(`[Blog Generator] Gemini ${geminiModel} JSON parse error`);
        continue; // next key
      }

      if (!geminiRes.ok) {
        const errMsg = geminiData?.error?.message || geminiRaw.substring(0, 150);
        const status = geminiRes.status;
        console.warn(`[Blog Generator] Gemini ${geminiModel} HTTP ${status}: ${errMsg.substring(0, 120)}`);
        if (status === 429 || status === 403) continue; // rotate to next key
        if (status === 404) continue outer; // model doesn't exist — try next model
        continue; // other error — try next key
      }

      const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!content) {
        console.warn(`[Blog Generator] Gemini ${geminiModel} returned empty content`);
        continue; // next key
      }
      
      const parsed = JSON.parse(content);
      
      // MANDATORY CONTENT REQUIREMENTS CHECK
      const contentHasDisclaimer = parsed.content.includes('disclaimer-box') || 
                                   parsed.content.includes('Important Notice') ||
                                   parsed.content.includes('does not constitute');
      const contentHasInternalLinks = parsed.content.includes('href="/') || 
                                      parsed.content.includes('href="/tools') ||
                                      parsed.content.includes('href="/business-plan');
      
      // Apply auto-corrections FIRST (fix typos before validation)
      let finalContent = correctContent(parsed.content);
      
      // Check if corrections added required elements
      const contentHasDisclaimerNow = finalContent.includes('disclaimer-box') || 
                                      finalContent.includes('Important Notice') ||
                                      finalContent.includes('does not constitute');
      
      // Auto-fix: Add disclaimer if still missing
      if (!contentHasDisclaimerNow) {
        finalContent += `
<div class="disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6">
<p class="text-sm"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener" class="text-primary underline">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p>
</div>`;
      }
      
      // Auto-fix: Add internal links section if missing
      if (!contentHasInternalLinks) {
        const linksSection = `
<h3>Helpful Resources</h3>
<p>Ready to start your UK visa journey? Explore <a href="/tools" class="text-primary hover:underline">our visa preparation tools</a>, use our <a href="/business-plan" class="text-primary hover:underline">Business Plan Generator</a>, or check our <a href="/faq" class="text-primary hover:underline">frequently asked questions</a>.</p>`;
        // Insert before disclaimer
        const disclaimerIndex = finalContent.indexOf('<div class="disclaimer-box');
        if (disclaimerIndex > 0) {
          finalContent = finalContent.slice(0, disclaimerIndex) + linksSection + finalContent.slice(disclaimerIndex);
        } else {
          finalContent += linksSection;
        }
      }
      
      // Validate the content
      const validationResult = validateBlogContent({
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: finalContent,
        category,
        tags: parsed.tags || [],
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription
      });
      
      // Log validation report
      console.log("[Blog Generator] Validation Report:");
      console.log(generateValidationReport(validationResult));
      
      // Log any remaining issues (auto-correction already applied)
      const criticalCount = validationResult.issues.filter(i => i.type === 'critical').length;
      if (criticalCount > 0) {
        console.warn(`[Blog Generator] ${criticalCount} issues remain after auto-correction. Proceeding with corrected content.`);
      }
      
      // Final content is already corrected above
      const correctedContent = finalContent;
      
      // Add unique slug with date
      const dateSlug = new Date().toISOString().split('T')[0];
      const baseSlug = slugify(parsed.title);
      const uniqueSlug = `${baseSlug}-${dateSlug}-${Math.random().toString(36).substring(2, 6)}`;
      
      // Final check: if still has critical issues on last attempt, log but proceed with corrected content
      if (criticalCount > 0) {
        console.warn(`[Blog Generator] Content published with ${criticalCount} warnings after max retries. Sending to triple-AI verification.`);
      }

      // ──────────────────────────────────────────────────────────────────────
      // TRIPLE-AI VERIFICATION: Gemini + OpenAI independently mark the article
      // ──────────────────────────────────────────────────────────────────────
      let verificationResult = null;
      let verificationStatus = 'pending';
      let isPublished = false;
      let postStatus = 'draft';

      try {
        console.log("[Blog Generator] Running triple-AI verification (Gemini + OpenAI)...");
        verificationResult = await verifyBlogPost(parsed.title, correctedContent);

        if (verificationResult.passed) {
          verificationStatus = 'passed';
          isPublished = true;
          postStatus = 'published';
          console.log(`[Blog Generator] ✓ Verification PASSED — Composite: ${verificationResult.compositeScore}/100. Auto-publishing.`);
        } else {
          verificationStatus = 'human_review';
          isPublished = false;
          postStatus = 'draft';
          console.warn(`[Blog Generator] ✗ Verification FAILED — Composite: ${verificationResult.compositeScore}/100. Sending to human review queue.`);
          console.warn(`[Blog Generator] Reason: ${verificationResult.details.consensusReason}`);
        }
      } catch (verifyError) {
        console.error("[Blog Generator] Triple-AI verification error:", verifyError);
        // If verification itself fails (API error), mark pending for human review
        verificationStatus = 'human_review';
        isPublished = false;
        postStatus = 'draft';
      }

      return {
        title: parsed.title,
        slug: uniqueSlug,
        excerpt: parsed.excerpt,
        content: correctedContent,
        category,
        tags: parsed.tags || [],
        metaTitle: parsed.metaTitle || parsed.title,
        metaDescription: parsed.metaDescription || parsed.excerpt,
        metaKeywords: parsed.metaKeywords || parsed.tags || [],
        featuredImage: buildCoverImageUrl(parsed.title || topic, category),
        readingTime: parsed.readingTime || 8,
        author: "UK Visa Expert Team",
        authorBio: "Our team provides accurate, verified information about the UK Innovator Founder Visa process. All content is multi-AI verified by Gemini and OpenAI for factual accuracy against official GOV.UK sources.",
        // Triple-AI verification
        aiVerificationScore: verificationResult?.compositeScore ?? null,
        geminiScore: verificationResult?.geminiScore ?? null,
        openaiScore: verificationResult?.openaiScore ?? null,
        verificationStatus,
        verificationDetails: verificationResult?.details ?? null,
        verifiedAt: verificationResult?.verifiedAt ?? null,
        verificationExpiresAt: verificationResult?.verificationExpiresAt ?? null,
        humanReviewRequired: verificationResult?.requiresHumanReview ?? true,
        contradictionFlags: verificationResult?.contradictionFlags ?? 0,
        sourcesCited: verificationResult?.sourcesCited ?? 0,
        contentHash: verificationResult?.contentHash ?? computeContentHash(correctedContent),
        isPublished,
        postStatus,
      };
    } catch (error: any) {
      console.error(`[Blog Generator] Gemini ${geminiModel} (key …${apiKey.slice(-6)}) failed:`, error?.message || error);
      // Continue to next key/model
    }
    } // end for apiKey
  } // end for geminiModel

  // ── OpenAI fallback (gpt-4o-mini) ────────────────────────────────────────
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  if (OPENAI_API_KEY) {
    try {
      console.log("[Blog Generator] Falling back to OpenAI gpt-4o-mini…");
      const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          max_tokens: 6000,
          temperature: 0.3,
        }),
      });
      const oaiData = await oaiRes.json() as any;
      if (!oaiRes.ok) throw new Error(oaiData?.error?.message || `OpenAI HTTP ${oaiRes.status}`);
      const oaiContent = oaiData.choices?.[0]?.message?.content;
      if (!oaiContent) throw new Error("OpenAI returned empty content");

      const parsed = JSON.parse(oaiContent);
      let finalContent = correctContent(parsed.content || "");
      if (!finalContent.includes("disclaimer-box") && !finalContent.includes("Important Notice")) {
        finalContent += `\n<div class="disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6"><p class="text-sm"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener" class="text-primary underline">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p></div>`;
      }
      const dateSlug = new Date().toISOString().split("T")[0];
      const uniqueSlug = `${slugify(parsed.title)}-${dateSlug}-${Math.random().toString(36).substring(2, 6)}`;
      let verificationResult = null;
      try { verificationResult = await verifyBlogPost(parsed.title, finalContent); } catch {}
      const isPublished = verificationResult?.passed ?? false;
      return {
        title: parsed.title,
        slug: uniqueSlug,
        excerpt: parsed.excerpt,
        content: finalContent,
        category,
        tags: parsed.tags || [],
        metaTitle: parsed.metaTitle || parsed.title,
        metaDescription: parsed.metaDescription || parsed.excerpt,
        metaKeywords: parsed.metaKeywords || parsed.tags || [],
        featuredImage: buildCoverImageUrl(parsed.title || topic, category),
        readingTime: parsed.readingTime || 8,
        author: "UK Visa Expert Team",
        authorBio: "Our team provides accurate, verified information about the UK Innovator Founder Visa process. All content is multi-AI verified by Gemini and OpenAI for factual accuracy against official GOV.UK sources.",
        aiVerificationScore: verificationResult?.compositeScore ?? null,
        geminiScore: verificationResult?.geminiScore ?? null,
        openaiScore: verificationResult?.openaiScore ?? null,
        verificationStatus: isPublished ? "passed" : "human_review",
        verificationDetails: verificationResult?.details ?? null,
        verifiedAt: verificationResult?.verifiedAt ?? null,
        verificationExpiresAt: verificationResult?.verificationExpiresAt ?? null,
        humanReviewRequired: verificationResult?.requiresHumanReview ?? true,
        contradictionFlags: verificationResult?.contradictionFlags ?? 0,
        sourcesCited: verificationResult?.sourcesCited ?? 0,
        contentHash: verificationResult?.contentHash ?? computeContentHash(finalContent),
        isPublished,
        postStatus: isPublished ? "published" : "human_review",
      };
    } catch (oaiErr: any) {
      console.error("[Blog Generator] OpenAI fallback failed:", oaiErr?.message || oaiErr);
    }
  }

  throw new Error("Failed to generate blog content — all AI writers exhausted (Gemini + OpenAI)");
}

export async function generateMultiplePosts(count: number = 5): Promise<Array<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  featuredImage: string;
  readingTime: number;
  author: string;
  authorBio: string;
}>> {
  const posts = [];
  // Track titles generated within this batch so each call to pickUnusedTopic
  // sees them and won't pick the same (or similar) topic again.
  const inBatchTitles: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      console.log(`[Blog Generator] Generating post ${i + 1} of ${count}...`);
      const post = await generateBlogPost(inBatchTitles);

      // Guard: if the AI still produced a title too similar to an existing one,
      // skip this post rather than saving a duplicate.
      const isDuplicate = await isTitleTooSimilarToExisting(post.title, inBatchTitles);
      if (isDuplicate) {
        console.warn(`[Blog Generator] Skipping duplicate title: "${post.title}"`);
      } else {
        inBatchTitles.push(post.title);
        posts.push(post);
      }

      // Small delay between requests to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`[Blog Generator] Failed to generate post ${i + 1}:`, error);
    }
  }
  
  return posts;
}

// Generate backdated posts for initial content seeding
export async function generateBackdatedPosts(
  totalPosts: number = 40,
  postsPerDay: number = 5,
  startDaysAgo: number = 8
): Promise<Array<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  featuredImage: string;
  readingTime: number;
  author: string;
  authorBio: string;
  publishedAt: Date;
  isFeatured: boolean;
}>> {
  const posts = [];
  const inBatchTitles: string[] = [];
  const now = new Date();
  
  for (let dayOffset = startDaysAgo; dayOffset >= 0 && posts.length < totalPosts; dayOffset--) {
    const postsForThisDay = Math.min(postsPerDay, totalPosts - posts.length);
    
    for (let i = 0; i < postsForThisDay; i++) {
      try {
        console.log(`[Blog Generator] Generating backdated post ${posts.length + 1} of ${totalPosts} (Day -${dayOffset})...`);
        const post = await generateBlogPost(inBatchTitles);
        const isDuplicate = await isTitleTooSimilarToExisting(post.title, inBatchTitles);
        if (isDuplicate) {
          console.warn(`[Blog Generator] Skipping duplicate backdated title: "${post.title}"`);
          continue;
        }
        inBatchTitles.push(post.title);
        
        // Calculate backdated timestamp with random hour variation
        const publishedAt = new Date(now);
        publishedAt.setDate(publishedAt.getDate() - dayOffset);
        publishedAt.setHours(6 + Math.floor(Math.random() * 12)); // Random time between 6 AM and 6 PM
        publishedAt.setMinutes(Math.floor(Math.random() * 60));
        
        posts.push({
          ...post,
          publishedAt,
          isFeatured: posts.length < 3, // First 3 posts are featured
        });
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        console.error(`[Blog Generator] Failed to generate backdated post:`, error);
      }
    }
  }
  
  return posts;
}
