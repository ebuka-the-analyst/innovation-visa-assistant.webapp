/**
 * TRIPLE-AI VERIFICATION SYSTEM
 *
 * PhD-Level Multi-Model Fact Verification for Blog Content
 *
 * Architecture:
 *  1. Qwen generates the article (primary writer)
 *  2. Gemini independently fact-checks and scores it   (Marker 1)
 *  3. OpenAI GPT-4o independently fact-checks and scores it  (Marker 2)
 *  4. Consensus gate: both must score ≥95 to auto-publish
 *  5. Any disagreement or flag → human review queue
 *
 * This mirrors a PhD examiner system: one writer, two independent markers.
 * If the markers disagree by >10 points or either flags an issue → review required.
 */

import crypto from "crypto";
import OpenAI from "openai";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// ============================================================================
// VERIFIED FACTS - Used by both markers as the ground truth reference
// ============================================================================

const FACT_REFERENCE = `
VERIFIED UK INNOVATOR FOUNDER VISA FACTS (Official - January 2026):
Source: GOV.UK — https://www.gov.uk/innovator-founder-visa

VISA FEES:
- Application fee (outside UK): £1,191
- Application fee (inside UK - switching): £1,191
- Immigration Health Surcharge: £1,035 per year
- Priority service: £500 (where available)
- Endorsement fees: Vary by body — DO NOT cite specific amounts as they are not publicly standardised.

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

// ============================================================================
// MARKER PROMPT - Used identically by both Gemini and OpenAI
// ============================================================================

function buildMarkerPrompt(articleTitle: string, articleContent: string): string {
  return `You are a UK immigration law fact-checker and PhD-level academic examiner.

Your job is to independently verify the factual accuracy of the following blog article about the UK Innovator Founder Visa. Use ONLY the verified reference facts provided below. Do not use your general training knowledge to fill gaps — if you cannot verify a claim against the reference, FLAG it.

${FACT_REFERENCE}

---
ARTICLE TITLE: ${articleTitle}

ARTICLE CONTENT (HTML):
${articleContent.substring(0, 8000)}
---

MARKING CRITERIA (score each 0-20, total = 0-100):

1. FACTUAL_ACCURACY (0-20): All numerical claims (fees, dates, requirements) match the verified reference exactly. Penalise any incorrect fee amount, wrong requirement, wrong duration, etc.

2. NO_FABRICATION (0-20): No fictional case studies, no made-up names, no invented statistics or percentages, no fabricated quotes, no false success rates.

3. ENDORSING_BODY_ACCURACY (0-20): Only the 4 official endorsing bodies mentioned. No false claims about their specialisations or ideal applicants. GEP correctly described as invitation-only.

4. LEGAL_COMPLIANCE (0-20): Includes proper disclaimer. Does not constitute legal/immigration advice. Does not guarantee visa approval. Recommends consulting a qualified adviser.

5. CURRENT_TERMINOLOGY (0-20): No outdated terms (e.g., "Tier 1 Entrepreneur"). Financial requirement uses £1,270 not £945. No reference to policies that have been superseded.

FLAG any specific claim that you cannot verify or that appears incorrect. List the exact text and why it is flagged.

Return ONLY valid JSON in this exact format:
{
  "factualAccuracyScore": <0-20>,
  "noFabricationScore": <0-20>,
  "endorsingBodyScore": <0-20>,
  "legalComplianceScore": <0-20>,
  "currentTerminologyScore": <0-20>,
  "totalScore": <0-100>,
  "passed": <true if totalScore >= 95, false otherwise>,
  "flags": [
    { "claim": "<exact text from article>", "issue": "<why flagged>", "severity": "critical|warning" }
  ],
  "summary": "<one sentence overall assessment>",
  "corrections": ["<specific correction needed if any>"]
}`;
}

// ============================================================================
// GEMINI VERIFIER
// ============================================================================

async function runGeminiVerification(title: string, content: string): Promise<{
  score: number;
  passed: boolean;
  flags: Array<{ claim: string; issue: string; severity: string }>;
  details: Record<string, unknown>;
  error?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("[MultiVerifier] GEMINI_API_KEY not set");
    const r: any = { score: -1, passed: false, flags: [], details: { error: "No API key" }, error: "No API key", unavailable: true };
    return r;
  }

  // Direct REST API — bypasses SDK routing entirely, always hits Google AI Studio endpoint
  // gemini-2.0-flash and gemini-1.5-* are unavailable on newer API projects
  // Use the current generation models instead
  const GEMINI_MODELS = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001",
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.5-flash-preview-04-17",
  ];
  const prompt = buildMarkerPrompt(title, content);

  for (const modelName of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        const status = response.status;
        const errMsg = data?.error?.message || JSON.stringify(data);
        console.warn(`[MultiVerifier] Gemini REST ${modelName} HTTP ${status}: ${errMsg}`);

        if (status === 429) {
          const r: any = { score: -1, passed: false, flags: [], details: { error: errMsg }, error: errMsg, unavailable: true };
          return r;
        }
        // 404 / model not found / deprecated → try next model
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let jsonText = text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(jsonText);
      console.log(`[MultiVerifier] Gemini REST success with model=${modelName}`);
      return {
        score: Math.min(100, Math.max(0, parsed.totalScore || 0)),
        passed: parsed.passed === true,
        flags: parsed.flags || [],
        details: parsed,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[MultiVerifier] Gemini REST ${modelName} fetch error: ${errMsg}`);
      continue;
    }
  }

  console.error("[MultiVerifier] All Gemini REST models failed — marking as unavailable");
  const unavailableResult: any = { score: -1, passed: false, flags: [], details: { error: "All Gemini models failed" }, error: "All models failed", unavailable: true };
  return unavailableResult;
}

// ============================================================================
// OPENAI VERIFIER
// ============================================================================

async function runOpenAIVerification(title: string, content: string): Promise<{
  score: number;
  passed: boolean;
  flags: Array<{ claim: string; issue: string; severity: string }>;
  details: Record<string, unknown>;
  error?: string;
}> {
  try {
    const prompt = buildMarkerPrompt(title, content);
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a UK immigration law fact-checker. Return ONLY valid JSON matching the requested format exactly. No markdown, no explanation, pure JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content || "";
    const parsed = JSON.parse(raw);
    return {
      score: Math.min(100, Math.max(0, parsed.totalScore || 0)),
      passed: parsed.passed === true,
      flags: parsed.flags || [],
      details: parsed,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    // Detect quota / rate-limit errors — these are service outages, not content failures
    const isQuotaError = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate_limit") || errMsg.includes("exceeded");
    if (isQuotaError) {
      console.warn("[MultiVerifier] OpenAI quota/rate-limit — marking as unavailable (not score 0):", errMsg);
      return {
        score: -1, // sentinel: service unavailable, not a content score
        passed: false,
        flags: [],
        details: { unavailable: true, reason: "quota_exceeded", error: errMsg },
        error: errMsg,
        unavailable: true,
      } as any;
    }
    console.error("[MultiVerifier] OpenAI verification error:", errMsg);
    return {
      score: 0,
      passed: false,
      flags: [{ claim: "SYSTEM", issue: "OpenAI verification failed: " + errMsg, severity: "critical" }],
      details: { error: errMsg },
      error: errMsg,
    };
  }
}

// ============================================================================
// CONTRADICTION DETECTOR
// ============================================================================

function detectContradictions(
  geminiFlags: Array<{ claim: string; issue: string; severity: string }>,
  openaiFlags: Array<{ claim: string; issue: string; severity: string }>
): number {
  // A contradiction occurs when both AIs flag the same area but for different reasons,
  // OR when one flags something critical the other doesn't
  const geminiCritical = geminiFlags.filter(f => f.severity === "critical").length;
  const openaiCritical = openaiFlags.filter(f => f.severity === "critical").length;
  
  // Score divergence in critical flags
  return Math.abs(geminiCritical - openaiCritical);
}

function countSourcesCited(content: string): number {
  const govUkMatches = (content.match(/gov\.uk/gi) || []).length;
  const officialMatches = (content.match(/href="https?:\/\//gi) || []).length;
  return govUkMatches + officialMatches;
}

// ============================================================================
// CONTENT HASH
// ============================================================================

export function computeContentHash(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

// ============================================================================
// MAIN VERIFICATION FUNCTION
// ============================================================================

export interface VerificationResult {
  passed: boolean;
  requiresHumanReview: boolean;
  compositeScore: number;
  geminiScore: number;
  openaiScore: number;
  contradictionFlags: number;
  sourcesCited: number;
  contentHash: string;
  verifiedAt: Date;
  verificationExpiresAt: Date;
  details: {
    gemini: Record<string, unknown>;
    openai: Record<string, unknown>;
    consensusReason: string;
    allFlags: Array<{ marker: string; claim: string; issue: string; severity: string }>;
  };
}

export async function verifyBlogPost(title: string, content: string): Promise<VerificationResult> {
  console.log("[MultiVerifier] Starting triple-AI verification for:", title.substring(0, 60));

  // Run both verifiers in parallel for speed
  const [geminiResult, openaiResult] = await Promise.all([
    runGeminiVerification(title, content),
    runOpenAIVerification(title, content),
  ]);

  // Detect service unavailability — score=-1 is the sentinel value
  const openaiUnavailable = (openaiResult as any).unavailable === true || openaiResult.score === -1;
  const geminiUnavailable = (geminiResult as any).unavailable === true || geminiResult.score === -1;
  const bothUnavailable = openaiUnavailable && geminiUnavailable;

  // Composite: if one is unavailable use the other alone; if both unavailable score=0
  let compositeScore: number;
  if (bothUnavailable) {
    compositeScore = 0;
  } else if (geminiUnavailable) {
    compositeScore = openaiResult.score;
  } else if (openaiUnavailable) {
    compositeScore = geminiResult.score;
  } else {
    compositeScore = Math.round((geminiResult.score + openaiResult.score) / 2);
  }

  const contradictions = detectContradictions(geminiResult.flags, openaiResult.flags);
  const sources = countSourcesCited(content);
  const hash = computeContentHash(content);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90); // 90-day freshness window

  // Combine flags (skip system flags from unavailable services)
  const allFlags = [
    ...(geminiUnavailable ? [] : geminiResult.flags.map(f => ({ marker: "gemini", ...f }))),
    ...(openaiUnavailable ? [] : openaiResult.flags.map(f => ({ marker: "openai", ...f }))),
  ];

  // CONSENSUS GATE LOGIC:
  // Full pass: BOTH AIs ≥95 AND diff ≤10 AND no critical flags
  // Single verifier: always route to human review (safety policy)
  // Both unavailable: always route to human review
  const hasCriticalFlags = allFlags.some(f => f.severity === "critical" && !f.claim.startsWith("SYSTEM"));

  let passed = false;
  let consensusReason = "";

  if (bothUnavailable) {
    consensusReason = "Both Gemini and OpenAI unavailable — routing to human review.";
  } else if (geminiUnavailable) {
    consensusReason = `Gemini unavailable (model deprecated/quota) — OpenAI only: ${openaiResult.score}/100. Routing to human review for single-verifier result.`;
  } else if (openaiUnavailable) {
    consensusReason = `OpenAI unavailable (quota exceeded) — Gemini only: ${geminiResult.score}/100. Routing to human review for single-verifier result.`;
  } else {
    const scoreDifference = Math.abs(geminiResult.score - openaiResult.score);
    const bothAboveThreshold = geminiResult.score >= 95 && openaiResult.score >= 95;
    const scoresAgree = scoreDifference <= 10;
    passed = bothAboveThreshold && scoresAgree && !hasCriticalFlags;

    if (passed) {
      consensusReason = `Both AIs agree: Gemini ${geminiResult.score}/100, OpenAI ${openaiResult.score}/100. No critical flags. Auto-publishing approved.`;
    } else {
      const reasons: string[] = [];
      if (!bothAboveThreshold) reasons.push(`Score threshold not met (Gemini: ${geminiResult.score}, OpenAI: ${openaiResult.score}, both need ≥95)`);
      if (!scoresAgree) reasons.push(`Score divergence too large: ${scoreDifference} points`);
      if (hasCriticalFlags) reasons.push(`${allFlags.filter(f => f.severity === "critical" && !f.claim.startsWith("SYSTEM")).length} critical flag(s) raised`);
      consensusReason = "Human review required: " + reasons.join("; ");
    }
  }

  const requiresHumanReview = !passed;

  const geminiDisplayScore = geminiUnavailable ? 0 : geminiResult.score;
  const openaiDisplayScore = openaiUnavailable ? 0 : openaiResult.score;
  console.log(`[MultiVerifier] Result: ${passed ? "PASSED" : "FLAGGED"} | Gemini: ${geminiUnavailable ? "unavailable" : geminiResult.score} | OpenAI: ${openaiUnavailable ? "unavailable" : openaiResult.score} | Composite: ${compositeScore}`);

  return {
    passed,
    requiresHumanReview,
    compositeScore,
    geminiScore: geminiDisplayScore,
    openaiScore: openaiDisplayScore,
    contradictionFlags: contradictions,
    sourcesCited: sources,
    contentHash: hash,
    verifiedAt: now,
    verificationExpiresAt: expiresAt,
    details: {
      gemini: geminiResult.details,
      openai: openaiResult.details,
      consensusReason,
      allFlags,
    },
  };
}

// ============================================================================
// STALENESS CHECKER - Call this to see if a post needs re-verification
// ============================================================================

export function isVerificationStale(verificationExpiresAt: Date | null | undefined): boolean {
  if (!verificationExpiresAt) return true;
  return new Date() > new Date(verificationExpiresAt);
}
