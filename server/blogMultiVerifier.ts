import crypto from "crypto";
import OpenAI from "openai";
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

type VerificationFlag = {
  claim: string;
  issue: string;
  severity: string;
};

type MarkerResult = {
  score: number;
  passed: boolean;
  flags: VerificationFlag[];
  details: Record<string, unknown>;
  error?: string;
  unavailable?: boolean;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonObject(text: string): string {
  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in managed AI verification response");
  }
  return cleaned.slice(start, end + 1);
}

function buildMarkerPrompt(articleTitle: string, articleContent: string, examinerPerspective: string): string {
  const plainContent = stripHtml(articleContent).substring(0, 4_000);

  return `You are one pass in a two-pass managed verification process for UK Innovator Founder Visa content.

EXAMINER PERSPECTIVE:
${examinerPerspective}

Independently verify the factual accuracy and safety of the article below. Use ONLY the verified reference facts supplied here. If a claim cannot be supported from the reference, flag it rather than filling the gap from general training knowledge.

${FACT_REFERENCE}

---
ARTICLE TITLE: ${articleTitle}

ARTICLE CONTENT (plain text, truncated to 4000 chars):
${plainContent}
---

MARKING CRITERIA (score each 0-20, total 0-100):
1. FACTUAL_ACCURACY: numerical claims, dates and requirements match the reference.
2. NO_FABRICATION: no invented case studies, names, statistics, quotes or success rates.
3. ENDORSING_BODY_ACCURACY: only the listed endorsing bodies and no unsupported specialisations.
4. LEGAL_COMPLIANCE: no guarantee of outcome, no presentation as regulated personalised immigration advice, and an appropriate disclaimer where needed.
5. CURRENT_TERMINOLOGY: no clearly superseded terminology or requirements against the supplied reference.

Return ONLY valid JSON in this exact shape:
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
  "summary": "<one sentence assessment>",
  "corrections": ["<specific correction needed if any>"]
}`;
}

async function runManagedVerification(
  title: string,
  content: string,
  marker: "A" | "B",
): Promise<MarkerResult> {
  const perspective = marker === "A"
    ? "Act as a strict factual auditor. Prioritise numerical accuracy, official requirements, unsupported claims and evidence traceability."
    : "Act as an independent editorial-risk examiner. Prioritise legal/compliance wording, fabrication risk, terminology, endorsement-body accuracy and contradictions.";

  try {
    const prompt = buildMarkerPrompt(title, content, perspective);
    const response: any = await managedAI.chat.completions.create({
      model: BUSINESS_PLAN_MODEL as any,
      messages: [
        {
          role: "system",
          content: `You are managed verification marker ${marker}. Return only the requested JSON object. Do not add markdown or commentary.`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2_500,
    } as any);

    const raw = String(response.choices?.[0]?.message?.content || "");
    const parsed: any = JSON.parse(extractJsonObject(raw));
    const score = Math.min(100, Math.max(0, Number(parsed.totalScore || 0)));
    return {
      score,
      passed: parsed.passed === true && score >= 95,
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      details: {
        ...parsed,
        managedMarker: marker,
        routedModel: response.model || null,
        routedProvider: response.provider || null,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[MultiVerifier] Managed marker ${marker} unavailable:`, message.substring(0, 180));
    return {
      score: -1,
      passed: false,
      flags: [],
      details: { unavailable: true, managedMarker: marker, error: message },
      error: message,
      unavailable: true,
    };
  }
}

function detectContradictions(
  markerAFlags: VerificationFlag[],
  markerBFlags: VerificationFlag[],
): number {
  const markerACritical = markerAFlags.filter((flag) => flag.severity === "critical").length;
  const markerBCritical = markerBFlags.filter((flag) => flag.severity === "critical").length;
  return Math.abs(markerACritical - markerBCritical);
}

function countSourcesCited(content: string): number {
  const govUkMatches = (content.match(/gov\.uk/gi) || []).length;
  const officialMatches = (content.match(/href="https?:\/\//gi) || []).length;
  return govUkMatches + officialMatches;
}

export function computeContentHash(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

export interface VerificationResult {
  passed: boolean;
  requiresHumanReview: boolean;
  compositeScore: number;
  geminiScore: number | null;
  openaiScore: number | null;
  qwenScore: number | null;
  claudeScore: number | null;
  contradictionFlags: number;
  sourcesCited: number;
  contentHash: string;
  verifiedAt: Date;
  verificationExpiresAt: Date;
  details: {
    gemini: Record<string, unknown>;
    openai: Record<string, unknown>;
    qwen: Record<string, unknown>;
    claude: Record<string, unknown>;
    consensusReason: string;
    allFlags: Array<{ marker: string; claim: string; issue: string; severity: string }>;
  };
}

/**
 * The legacy score/detail field names above are retained only for database/API
 * compatibility with existing blog records. They no longer identify or invoke
 * those historical providers. New verification uses two independent managed
 * passes through the centrally configured provider gateway.
 */
export async function verifyBlogPost(title: string, content: string): Promise<VerificationResult> {
  console.log("[MultiVerifier] Starting dual-pass managed verification for:", title.substring(0, 60));

  const [markerA, markerB] = await Promise.all([
    runManagedVerification(title, content, "A"),
    runManagedVerification(title, content, "B"),
  ]);

  const isUnavailable = (result: MarkerResult) => result.unavailable === true || result.score === -1;
  const markerAUnavailable = isUnavailable(markerA);
  const markerBUnavailable = isUnavailable(markerB);

  const availableScores = [
    markerAUnavailable ? null : markerA.score,
    markerBUnavailable ? null : markerB.score,
  ].filter((score): score is number => score !== null);

  const compositeScore = availableScores.length
    ? Math.round(availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length)
    : 0;

  const contradictions = detectContradictions(markerA.flags, markerB.flags);
  const sources = countSourcesCited(content);
  const hash = computeContentHash(content);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90);

  const allFlags = [
    ...(markerAUnavailable ? [] : markerA.flags.map((flag) => ({ marker: "managed-a", ...flag }))),
    ...(markerBUnavailable ? [] : markerB.flags.map((flag) => ({ marker: "managed-b", ...flag }))),
  ];

  const hasCriticalFlags = allFlags.some(
    (flag) => flag.severity === "critical" && !String(flag.claim || "").startsWith("SYSTEM"),
  );
  const bothMarkersAvailable = availableScores.length === 2;
  const compositePasses = compositeScore >= 95;
  const noFloorViolation = availableScores.every((score) => score >= 80);

  let passed = false;
  let consensusReason: string;
  if (!bothMarkersAvailable) {
    consensusReason = `Only ${availableScores.length} of 2 managed verification passes completed. Routing to human review for safety.`;
  } else if (!compositePasses) {
    consensusReason = `Managed verification composite ${compositeScore}/100 is below the 95 threshold (A:${markerA.score}, B:${markerB.score}).`;
  } else if (!noFloorViolation) {
    consensusReason = `A managed verification pass fell below the individual 80/100 floor (A:${markerA.score}, B:${markerB.score}).`;
  } else if (hasCriticalFlags) {
    const criticalCount = allFlags.filter((flag) => flag.severity === "critical").length;
    consensusReason = `${criticalCount} critical verification flag(s) require human review.`;
  } else {
    passed = true;
    consensusReason = `Both managed verification passes completed, composite ${compositeScore}/100, each pass ≥80, with no critical flags.`;
  }

  console.log(
    `[MultiVerifier] ${passed ? "PASSED" : "FLAGGED"} | Managed A: ${markerAUnavailable ? "N/A" : markerA.score} | Managed B: ${markerBUnavailable ? "N/A" : markerB.score} | Composite: ${compositeScore}`,
  );

  return {
    passed,
    requiresHumanReview: !passed,
    compositeScore,
    // Legacy compatibility fields. New code should use details.consensusReason/allFlags.
    geminiScore: markerBUnavailable ? null : markerB.score,
    openaiScore: markerAUnavailable ? null : markerA.score,
    qwenScore: null,
    claudeScore: null,
    contradictionFlags: contradictions,
    sourcesCited: sources,
    contentHash: hash,
    verifiedAt: now,
    verificationExpiresAt: expiresAt,
    details: {
      gemini: { ...markerB.details, legacyField: true, managedMarker: "B" },
      openai: { ...markerA.details, legacyField: true, managedMarker: "A" },
      qwen: { retired: true, legacyField: true },
      claude: { managedByCentralGateway: true, legacyField: true },
      consensusReason,
      allFlags,
    },
  };
}

export function isVerificationStale(verificationExpiresAt: Date | null | undefined): boolean {
  if (!verificationExpiresAt) return true;
  return new Date() > new Date(verificationExpiresAt);
}
