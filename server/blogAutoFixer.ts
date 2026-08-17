import OpenAI from "openai";
import { verifyBlogPost } from "./blogMultiVerifier.js";
import { BUSINESS_PLAN_MODEL } from "./aiModelConfig";

const managedAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const FACT_REFERENCE = `
VERIFIED UK INNOVATOR FOUNDER VISA FACTS (Official - January 2026):
Source: GOV.UK — https://www.gov.uk/innovator-founder-visa

VISA FEES:
- Application fee (outside UK): £1,191
- Application fee (inside UK - switching): £1,191
- Immigration Health Surcharge: £1,035 per year
- Priority service: £500 (where available)
- Endorsement fees: Vary by body — DO NOT cite specific amounts.

FINANCIAL REQUIREMENTS:
- Minimum funds: £1,270 (must be held for at least 28 consecutive days before application)

VISA DURATION:
- Initial grant: 3 years
- Extension: 3 years (if criteria met)
- Settlement eligibility: After 3 years on Innovator Founder Visa

ENGLISH LANGUAGE:
- Minimum level: B2 CEFR

ENDORSING BODIES (ONLY these 4 exist — Home Office approved as of October 2024):
1. Envestors Limited — envestors.co.uk
2. Innovator International Limited — innovatorinternational.com
3. UK Endorsing Services (UKES) — ukesapp.co.uk
4. Global Entrepreneurs Programme (GEP) — invitation only, cannot be applied to directly

ENDORSEMENT CRITERIA:
- Innovation: Genuinely new or significantly different idea/business
- Viability: Applicant has skills, knowledge, and experience to run the business
- Scalability: Business has potential for growth and to create jobs in the UK

SETTLEMENT (ILR):
- Fee: £2,885
- Life in UK test: Required
- English requirement: B1 level
- Time: At least 3 years on Innovator Founder Visa

WHAT YOU MUST NOT CLAIM:
- Specific endorsing body success/acceptance/approval rates (not publicly available)
- That GEP can be applied to directly (invitation only)
- Endorsing body "specialisations" or "ideal applicant" profiles (not publicly verified)
- Any visa fees other than those listed above
- Guarantees of visa approval
`.trim();

export interface AutoFixFlag {
  marker: string;
  claim: string;
  issue: string;
  severity: string;
}

export interface AutoFixResult {
  fixedContent: string;
  flagsAddressed: number;
  verificationResult: Awaited<ReturnType<typeof verifyBlogPost>>;
  autoPublished: boolean;
}

export async function autoFixBlogPost(
  title: string,
  originalContent: string,
  allFlags: AutoFixFlag[],
): Promise<AutoFixResult> {
  const actionableFlags = allFlags.filter(
    (flag) => flag.claim && !flag.claim.startsWith("SYSTEM") && flag.issue,
  );

  console.log(
    `[AutoFixer] Starting auto-fix for: "${title.substring(0, 60)}" — ${actionableFlags.length} actionable flag(s)`,
  );

  let fixedContent = originalContent;

  if (actionableFlags.length > 0) {
    const flagList = actionableFlags
      .map(
        (flag, index) =>
          `${index + 1}. [${flag.severity.toUpperCase()} — raised by ${flag.marker}]\n` +
          `   Flagged text: "${flag.claim}"\n` +
          `   Problem: ${flag.issue}`,
      )
      .join("\n\n");

    const prompt = `You are a senior UK immigration content editor making precision corrections to a blog article that failed a multi-AI fact-checking review.

Your job: fix ONLY the specific issues listed below using the verified facts provided. Do NOT rewrite, restructure, or expand any part of the article that was not flagged.

${FACT_REFERENCE}

---
ARTICLE TITLE: ${title}

ORIGINAL ARTICLE (HTML):
${originalContent}

---
FLAGGED ISSUES TO CORRECT (${actionableFlags.length} total):

${flagList}

---
CORRECTION RULES:
1. Fix each flagged issue using ONLY the verified facts above
2. If a specific claim cannot be verified from the reference, REMOVE that sentence/phrase entirely — do not guess or invent a replacement
3. Preserve ALL HTML structure, headings, internal links, CSS classes, and the legal disclaimer box exactly
4. Do NOT change any content that was not flagged
5. Do NOT add new sections, statistics, case studies, or examples
6. Return the COMPLETE corrected HTML article — not just the changed parts

Return ONLY the corrected HTML (no JSON, no explanation, no markdown fences — just the HTML starting with the first tag).`;

    try {
      const completion: any = await managedAI.chat.completions.create({
        model: BUSINESS_PLAN_MODEL as any,
        messages: [
          {
            role: "system",
            content: "You are a UK immigration content editor. Return ONLY the corrected HTML article. No JSON, no explanation, no markdown. Just the corrected HTML.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 8_000,
      } as any);
      const corrected = String(completion.choices?.[0]?.message?.content || "").trim();
      if (corrected.length > 500) {
        fixedContent = corrected;
        console.log(`[AutoFixer] Managed AI correction complete. Content length: ${fixedContent.length} chars`);
      } else {
        console.warn("[AutoFixer] Managed AI returned insufficient correction content — keeping original content for re-verification");
      }
    } catch (error) {
      console.error("[AutoFixer] Managed AI correction failed:", error);
    }
  } else {
    console.log("[AutoFixer] No actionable flags — proceeding straight to re-verification");
  }

  const verificationResult = await verifyBlogPost(title, fixedContent);

  console.log(
    `[AutoFixer] Re-verification result: ${verificationResult.passed ? "PASSED" : "STILL_FLAGGED"} | Composite: ${verificationResult.compositeScore}`,
  );

  return {
    fixedContent,
    flagsAddressed: actionableFlags.length,
    verificationResult,
    autoPublished: verificationResult.passed,
  };
}
