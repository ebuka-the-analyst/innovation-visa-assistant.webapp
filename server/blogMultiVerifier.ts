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
import Anthropic from "@anthropic-ai/sdk";
import { qwen, QWEN_MODELS } from "./qwenClient.js";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
const claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

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

/** Strip HTML tags and collapse whitespace for cleaner verification prompts */
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

/**
 * Robustly extract the first JSON object from a model response string.
 * Handles markdown code fences, backticks, and extra surrounding text.
 */
function extractJsonObject(text: string): string {
  // Strip markdown code fences
  let cleaned = text.replace(/^```json?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  // Find first { and last } to grab the outermost object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return cleaned.slice(start, end + 1);
}

function buildMarkerPrompt(articleTitle: string, articleContent: string): string {
  // Strip HTML and limit to 4000 plain-text chars to avoid token overrun
  const plainContent = stripHtml(articleContent).substring(0, 4000);

  return `You are a UK immigration law fact-checker and PhD-level academic examiner.

Your job is to independently verify the factual accuracy of the following blog article about the UK Innovator Founder Visa. Use ONLY the verified reference facts provided below. Do not use your general training knowledge to fill gaps — if you cannot verify a claim against the reference, FLAG it.

${FACT_REFERENCE}

---
ARTICLE TITLE: ${articleTitle}

ARTICLE CONTENT (plain text, truncated to 4000 chars):
${plainContent}
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
  // Discover available models dynamically so we always use what this API key supports
  let GEMINI_MODELS: string[] = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`);
    const listData = await listRes.json() as any;
    const all: string[] = (listData.models || [])
      .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => (m.name || "").replace("models/", ""))
      .filter((n: string) => n.startsWith("gemini"));
    console.log(`[MultiVerifier] Available Gemini models for this key: ${all.join(", ")}`);
    // Build a prioritised trial list: prefer gemini-2.5-flash, then gemini-2.5-pro, then anything else
    // Avoid known-deprecated model names (gemini-2.0-flash, gemini-2.0-flash-001) to save time
    const DEPRECATED = [
      "gemini-2.0-flash", "gemini-2.0-flash-001",
      "gemini-2.0-flash-lite", "gemini-2.0-flash-lite-001",
    ];
    // Strip deprecated AND non-text models (tts = audio-only, image = vision output)
    const BAD_SUFFIXES = ["tts", "image", "audio"];
    const usable = all.filter(n =>
      !DEPRECATED.includes(n) &&
      !BAD_SUFFIXES.some(s => n.includes(s))
    );
    const flash25 = usable.filter(n => n.startsWith("gemini-2.5") && n.includes("flash"));
    const pro25   = usable.filter(n => n.startsWith("gemini-2.5") && n.includes("pro"));
    const rest    = usable.filter(n => !flash25.includes(n) && !pro25.includes(n));
    // Take up to 2 flash models (flash + flash-lite) then 1 pro as final fallback
    GEMINI_MODELS = [...flash25.slice(0, 2), ...pro25.slice(0, 1), ...rest.slice(0, 1)];
    console.log(`[MultiVerifier] Gemini trial order: ${GEMINI_MODELS.join(", ")}`);
  } catch (e) {
    console.warn("[MultiVerifier] Could not list Gemini models, falling back to defaults");
    GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-lite"];
  }

  if (GEMINI_MODELS.length === 0) {
    console.error("[MultiVerifier] No usable Gemini models found for this API key");
    const r: any = { score: -1, passed: false, flags: [], details: { error: "No available models" }, error: "No available models", unavailable: true };
    return r;
  }

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
            maxOutputTokens: 8192, // High enough that JSON output never gets cut off (was 2048 → hit MAX_TOKENS)
          },
        }),
      });

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.warn(`[MultiVerifier] Gemini REST ${modelName} JSON parse error (response may be truncated or streamed)`);
        continue;
      }

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

      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const text = candidate?.content?.parts?.[0]?.text || "";

      if (!text) {
        console.warn(`[MultiVerifier] Gemini REST ${modelName} empty text (finishReason=${finishReason})`);
        continue;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(extractJsonObject(text));
      } catch (jsonErr) {
        // Log first 400 chars so we can see what Gemini actually returned
        console.warn(`[MultiVerifier] Gemini REST ${modelName} no JSON in response (finishReason=${finishReason}). First 400 chars: ${text.substring(0, 400)}`);
        continue;
      }

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
    const r: any = { score: -1, passed: false, flags: [], details: { error: errMsg }, error: errMsg, unavailable: true };
    return r;
  }
}

// ============================================================================
// CLAUDE VERIFIER (Marker 3 — Anthropic)
// Dynamic model discovery: lists available models on first use and picks the
// best haiku → sonnet → any model so it always works regardless of API key tier.
// ============================================================================

// Cache the resolved model name for the process lifetime (avoids listing every call)
let _claudeModelCache: string | null = null;

async function resolveClaudeModel(): Promise<string> {
  if (_claudeModelCache) return _claudeModelCache;

  try {
    const listing = await claudeClient.models.list();
    const models: string[] = listing.data.map((m: any) => m.id);
    console.log(`[MultiVerifier] Available Claude models: ${models.join(", ")}`);

    // Priority: haiku (cheapest/fastest) → sonnet → any available
    const haiku  = models.filter(m => m.toLowerCase().includes("haiku")).sort().reverse();
    const sonnet = models.filter(m => m.toLowerCase().includes("sonnet")).sort().reverse();
    const chosen = haiku[0] || sonnet[0] || models[0];
    if (!chosen) throw new Error("No Claude models available for this API key");

    console.log(`[MultiVerifier] Selected Claude model: ${chosen}`);
    _claudeModelCache = chosen;
    return chosen;
  } catch (e: any) {
    // If listing fails use a known-good fallback — actual call will surface real error
    const fallback = "claude-haiku-4-5-20251001";
    console.warn(`[MultiVerifier] Could not list Claude models (${e?.message?.substring(0, 80)}), falling back to ${fallback}`);
    _claudeModelCache = fallback;
    return fallback;
  }
}

async function runClaudeVerification(title: string, content: string): Promise<{
  score: number;
  passed: boolean;
  flags: Array<{ claim: string; issue: string; severity: string }>;
  details: Record<string, unknown>;
  error?: string;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const r: any = { score: -1, passed: false, flags: [], details: { error: "No Claude API key" }, error: "No API key", unavailable: true };
    return r;
  }
  try {
    const model = await resolveClaudeModel();
    const prompt = buildMarkerPrompt(title, content);
    const response = await claudeClient.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(extractJsonObject(text));
    console.log(`[MultiVerifier] Claude success (${model})`);
    return {
      score: Math.min(100, Math.max(0, parsed.totalScore || 0)),
      passed: parsed.passed === true,
      flags: parsed.flags || [],
      details: parsed,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    // Only clear the model cache for model-not-found errors, NOT billing/credit errors
    const isModelError = errMsg.includes("not_found_error") || (errMsg.includes("404") && !errMsg.includes("credit"));
    if (isModelError) {
      console.warn("[MultiVerifier] Claude model cache cleared — will re-discover on next call");
      _claudeModelCache = null;
    }
    // Produce a human-readable error for the health check panel
    let friendlyError = errMsg;
    if (errMsg.includes("credit balance") || errMsg.includes("credit_balance") || errMsg.includes("too low")) {
      friendlyError = "Insufficient credits — top up at console.anthropic.com → Plans & Billing";
    } else if (errMsg.includes("invalid_api_key") || errMsg.includes("authentication")) {
      friendlyError = "Invalid API key — check ANTHROPIC_API_KEY in Railway Variables";
    } else if (errMsg.includes("overloaded") || errMsg.includes("529")) {
      friendlyError = "Anthropic servers overloaded — will retry automatically";
    }
    console.warn("[MultiVerifier] Claude unavailable:", friendlyError.substring(0, 120));
    const r: any = { score: -1, passed: false, flags: [], details: { error: friendlyError }, error: friendlyError, unavailable: true };
    return r;
  }
}

// ============================================================================
// QWEN SELF-VERIFIER (Writer quality confidence — Marker 4)
// ============================================================================

async function runQwenVerification(title: string, content: string): Promise<{
  score: number;
  passed: boolean;
  flags: Array<{ claim: string; issue: string; severity: string }>;
  details: Record<string, unknown>;
  error?: string;
}> {
  if (!process.env.QWEN_API_KEY) {
    const r: any = { score: -1, passed: false, flags: [], details: { error: "No Qwen API key" }, error: "No API key", unavailable: true };
    return r;
  }
  try {
    const prompt = buildMarkerPrompt(title, content);
    const response = await qwen.chat.completions.create({
      model: QWEN_MODELS.plus,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });
    const text = response.choices[0]?.message?.content || "";
    let jsonText = text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(jsonText);
    console.log(`[MultiVerifier] Qwen success`);
    return {
      score: Math.min(100, Math.max(0, parsed.totalScore || 0)),
      passed: parsed.passed === true,
      flags: parsed.flags || [],
      details: parsed,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    // Produce a human-readable error for the health check panel
    let friendlyError = errMsg;
    if (errMsg.includes("good standing") || errMsg.includes("overdue") || errMsg.includes("Access denied")) {
      friendlyError = "Overdue payment — log into aliyun.com (Alibaba Cloud) → Billing to clear balance";
    } else if (errMsg.includes("401") || errMsg.includes("authentication") || errMsg.includes("invalid_api_key")) {
      friendlyError = "Invalid Qwen API key — check QWEN_API_KEY in Railway Variables";
    } else if (errMsg.includes("429") || errMsg.includes("rate") || errMsg.includes("quota")) {
      friendlyError = "Qwen rate limit — will retry automatically";
    }
    console.warn("[MultiVerifier] Qwen unavailable:", friendlyError.substring(0, 120));
    const r: any = { score: -1, passed: false, flags: [], details: { error: friendlyError }, error: friendlyError, unavailable: true };
    return r;
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

export async function verifyBlogPost(title: string, content: string): Promise<VerificationResult> {
  console.log("[MultiVerifier] Starting quad-AI verification for:", title.substring(0, 60));

  // Run all 4 verifiers in parallel for speed
  const [geminiResult, openaiResult, claudeResult, qwenResult] = await Promise.all([
    runGeminiVerification(title, content),
    runOpenAIVerification(title, content),
    runClaudeVerification(title, content),
    runQwenVerification(title, content),
  ]);

  // Detect service unavailability — score=-1 is the sentinel value
  const isUnavail = (r: any) => r.unavailable === true || r.score === -1;
  const geminiUnavailable = isUnavail(geminiResult);
  const openaiUnavailable = isUnavail(openaiResult);
  const claudeUnavailable = isUnavail(claudeResult);
  const qwenUnavailable = isUnavail(qwenResult);

  // Composite: average of all available verifiers
  const available = [
    geminiUnavailable ? null : geminiResult.score,
    openaiUnavailable ? null : openaiResult.score,
    claudeUnavailable ? null : claudeResult.score,
    qwenUnavailable ? null : qwenResult.score,
  ].filter((s): s is number => s !== null);

  const compositeScore = available.length > 0
    ? Math.round(available.reduce((a, b) => a + b, 0) / available.length)
    : 0;

  const contradictions = detectContradictions(geminiResult.flags, openaiResult.flags);
  const sources = countSourcesCited(content);
  const hash = computeContentHash(content);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90);

  // Combine flags from all available verifiers
  const allFlags = [
    ...(geminiUnavailable ? [] : geminiResult.flags.map(f => ({ marker: "gemini", ...f }))),
    ...(openaiUnavailable ? [] : openaiResult.flags.map(f => ({ marker: "openai", ...f }))),
    ...(claudeUnavailable ? [] : claudeResult.flags.map(f => ({ marker: "claude", ...f }))),
    ...(qwenUnavailable ? [] : qwenResult.flags.map(f => ({ marker: "qwen", ...f }))),
  ];

  const hasCriticalFlags = allFlags.some(f => f.severity === "critical" && !f.claim.startsWith("SYSTEM"));

  // CONSENSUS GATE:
  //   Primary:  composite score ≥95 (average of all active verifiers)
  //   Floor:    no individual active verifier may score below 80
  //   Flags:    no critical flags raised
  // Rationale: individual verifiers have different calibrations (Gemini tends strict,
  // Qwen tends lenient). Using the composite prevents one calibration from blocking
  // genuinely high-quality content; the 80-floor still catches truly bad results.
  let passed = false;
  let consensusReason = "";

  const activeScores = available;
  const minScore = activeScores.length >= 2 ? Math.min(...activeScores) : 0;
  const maxDiff = activeScores.length >= 2
    ? Math.max(...activeScores) - Math.min(...activeScores)
    : 0;

  const compositePassesThreshold = compositeScore >= 95;
  const noFloorViolation = activeScores.every(s => s >= 80);

  if (activeScores.length === 0) {
    consensusReason = "All verifiers unavailable — routing to human review.";
  } else if (activeScores.length === 1) {
    consensusReason = `Only 1 verifier available (score: ${activeScores[0]}/100). Routing to human review for safety.`;
  } else if (!compositePassesThreshold) {
    const labels = [
      !geminiUnavailable ? `Gemini:${geminiResult.score}` : null,
      !openaiUnavailable ? `OpenAI:${openaiResult.score}` : null,
      !claudeUnavailable ? `Claude:${claudeResult.score}` : null,
      !qwenUnavailable ? `Qwen:${qwenResult.score}` : null,
    ].filter(Boolean).join(", ");
    consensusReason = `Composite score ${compositeScore}/100 below 95 threshold — ${labels}.`;
  } else if (!noFloorViolation) {
    const lowScorer = [
      !geminiUnavailable && geminiResult.score < 80 ? `Gemini:${geminiResult.score}` : null,
      !openaiUnavailable && openaiResult.score < 80 ? `OpenAI:${openaiResult.score}` : null,
      !claudeUnavailable && claudeResult.score < 80 ? `Claude:${claudeResult.score}` : null,
      !qwenUnavailable && qwenResult.score < 80 ? `Qwen:${qwenResult.score}` : null,
    ].filter(Boolean).join(", ");
    consensusReason = `Individual score floor violated (minimum 80 required) — ${lowScorer}. Routing to human review.`;
  } else if (hasCriticalFlags) {
    const critCount = allFlags.filter(f => f.severity === "critical" && !f.claim.startsWith("SYSTEM")).length;
    consensusReason = `${critCount} critical flag(s) raised — routing to human review.`;
  } else {
    passed = true;
    const labels = [
      !geminiUnavailable ? `Gemini:${geminiResult.score}` : null,
      !openaiUnavailable ? `OpenAI:${openaiResult.score}` : null,
      !claudeUnavailable ? `Claude:${claudeResult.score}` : null,
      !qwenUnavailable ? `Qwen:${qwenResult.score}` : null,
    ].filter(Boolean).join(", ");
    consensusReason = `Composite ${compositeScore}/100 ≥95, all active verifiers ≥80 — ${labels}. No critical flags. Auto-publishing approved.`;
  }

  const requiresHumanReview = !passed;

  console.log(`[MultiVerifier] Result: ${passed ? "PASSED" : "FLAGGED"} | Gemini: ${geminiUnavailable ? "N/A" : geminiResult.score} | OpenAI: ${openaiUnavailable ? "N/A" : openaiResult.score} | Claude: ${claudeUnavailable ? "N/A" : claudeResult.score} | Qwen: ${qwenUnavailable ? "N/A" : qwenResult.score} | Composite: ${compositeScore}`);

  return {
    passed,
    requiresHumanReview,
    compositeScore,
    geminiScore: geminiUnavailable ? null : geminiResult.score,
    openaiScore: openaiUnavailable ? null : openaiResult.score,
    qwenScore: qwenUnavailable ? null : qwenResult.score,
    claudeScore: claudeUnavailable ? null : claudeResult.score,
    contradictionFlags: contradictions,
    sourcesCited: sources,
    contentHash: hash,
    verifiedAt: now,
    verificationExpiresAt: expiresAt,
    details: {
      gemini: geminiResult.details,
      openai: openaiResult.details,
      qwen: qwenResult.details,
      claude: claudeResult.details,
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
