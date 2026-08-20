import OpenAI from "openai";
import { db } from "../db";
import { documentReviews } from "@shared/schema";
import { eq } from "drizzle-orm";
import { BUSINESS_PLAN_MODEL } from "../aiModelConfig";

const MAX_DOCUMENT_CHARS = 600_000;
const CHUNK_TARGET_CHARS = 18_000;
const managedAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const DOCUMENT_REVIEW_PROMPT = `You are reviewing the QUALITY AND PREPARATION of a UK Innovator Founder application document.

Your job is to identify how clearly the document presents innovation, viability, scalability and endorser-facing logic. You are not deciding the visa application, predicting approval, giving regulated immigration advice, or independently verifying external evidence.

IMPORTANT SAFETY RULES:
- A statement inside the document is not proof that the statement is true.
- Do not treat generated prose as verification of customers, contracts, revenue, investment, qualifications, patents, market size or other external evidence.
- Flag unsupported factual claims, vague evidence references, internal inconsistencies and missing substantiation as weaknesses where relevant.
- Scores measure DOCUMENT PREPARATION QUALITY only. They are not success probabilities.
- Be constructive, specific and evidence-aware.

EVALUATION CRITERIA:
1. Innovation Score (0-100): clarity and strength of the documented innovation case, differentiation and defensibility.
2. Viability Score (0-100): coherence of the documented commercial model, execution capability, financial logic and realistic delivery plan.
3. Scalability Score (0-100): clarity of the documented growth model, UK job creation, operational scaling and market expansion logic.
4. Endorser Alignment (0-100): how well the document is structured to evidence innovation, viability and scalability without unsupported claims.

RESPONSE FORMAT (JSON ONLY):
{
  "overallScore": <number 0-100>,
  "innovationScore": <number 0-100>,
  "viabilityScore": <number 0-100>,
  "scalabilityScore": <number 0-100>,
  "endorserAlignment": <number 0-100>,
  "strengths": ["specific strength", ...],
  "weaknesses": ["specific weakness or evidence gap", ...],
  "suggestions": [
    {"priority": "high|medium|low", "suggestion": "specific improvement action"},
    ...
  ],
  "summary": "Brief document-quality assessment"
}`;

const SYNTHESIS_PROMPT = `You are producing the FINAL whole-document quality review for a UK Innovator Founder application document.

You will receive structured analyses from consecutive chunks of the SAME document. Synthesize them into one coherent assessment of the entire document.

Rules:
- Scores are document-preparation scores, NOT visa success probabilities.
- Do not infer that claims are verified merely because they appear in the document.
- Preserve important evidence gaps and contradictions identified in any chunk.
- Remove duplicate findings.
- Prioritize cross-document consistency, evidence traceability, innovation, viability and scalability.
- Return JSON only in the same schema requested below.

RESPONSE FORMAT:
{
  "overallScore": <number 0-100>,
  "innovationScore": <number 0-100>,
  "viabilityScore": <number 0-100>,
  "scalabilityScore": <number 0-100>,
  "endorserAlignment": <number 0-100>,
  "strengths": ["specific strength", ...],
  "weaknesses": ["specific weakness or evidence gap", ...],
  "suggestions": [
    {"priority": "high|medium|low", "suggestion": "specific improvement action"},
    ...
  ],
  "summary": "Brief whole-document quality assessment"
}`;

type NormalizedSuggestion = {
  priority: "high" | "medium" | "low";
  suggestion: string;
};

type NormalizedAnalysis = {
  overallScore: number;
  innovationScore: number;
  viabilityScore: number;
  scalabilityScore: number;
  endorserAlignment: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: NormalizedSuggestion[];
  summary: string;
};

function clampScore(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function cleanText(value: unknown, maxLength = 1_200): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function uniqueStrings(value: unknown, limit = 12): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value) {
    const text = cleanText(item);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(text);
    if (result.length >= limit) break;
  }
  return result;
}

function normalizePriority(value: unknown): "high" | "medium" | "low" {
  const text = String(value ?? "").toLowerCase();
  if (text === "high") return "high";
  if (text === "low") return "low";
  return "medium";
}

function normalizeSuggestions(value: unknown, limit = 12): NormalizedSuggestion[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: NormalizedSuggestion[] = [];
  for (const item of value) {
    const raw = item && typeof item === "object" ? item as Record<string, unknown> : { suggestion: item };
    const suggestion = cleanText(raw.suggestion);
    if (!suggestion) continue;
    const key = suggestion.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ priority: normalizePriority(raw.priority), suggestion });
    if (result.length >= limit) break;
  }
  return result;
}

function normalizeAnalysis(value: unknown): NormalizedAnalysis {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const innovationScore = clampScore(source.innovationScore);
  const viabilityScore = clampScore(source.viabilityScore);
  const scalabilityScore = clampScore(source.scalabilityScore);
  const endorserAlignment = clampScore(source.endorserAlignment);
  const suppliedOverall = Number(source.overallScore);
  const calculatedOverall = Math.round((innovationScore + viabilityScore + scalabilityScore + endorserAlignment) / 4);

  return {
    overallScore: Number.isFinite(suppliedOverall) ? clampScore(suppliedOverall) : calculatedOverall,
    innovationScore,
    viabilityScore,
    scalabilityScore,
    endorserAlignment,
    strengths: uniqueStrings(source.strengths),
    weaknesses: uniqueStrings(source.weaknesses),
    suggestions: normalizeSuggestions(source.suggestions),
    summary: cleanText(source.summary, 2_000),
  };
}

function parseJsonResponse(value: string): unknown {
  const trimmed = value.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(unfenced);
}

async function getAIResponse(systemPrompt: string, userPrompt: string, maxTokens = 2_000): Promise<unknown> {
  console.log("[DocumentReviewService] Calling managed AI provider");
  const response: any = await managedAI.chat.completions.create({
    model: BUSINESS_PLAN_MODEL as any,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
  } as any);
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Managed AI provider returned no document review content");
  return parseJsonResponse(content);
}

function splitDocumentIntoChunks(content: string, targetChars = CHUNK_TARGET_CHARS): string[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= targetChars) return [normalized];

  const paragraphs = normalized.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > targetChars) {
      flush();
      for (let offset = 0; offset < paragraph.length; offset += targetChars) {
        chunks.push(paragraph.slice(offset, offset + targetChars));
      }
      continue;
    }

    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > targetChars && current) {
      flush();
      current = paragraph;
    } else {
      current = next;
    }
  }
  flush();
  return chunks;
}

function averageScore(analyses: NormalizedAnalysis[], field: keyof Pick<NormalizedAnalysis, "overallScore" | "innovationScore" | "viabilityScore" | "scalabilityScore" | "endorserAlignment">): number {
  if (!analyses.length) return 0;
  return Math.round(analyses.reduce((sum, analysis) => sum + analysis[field], 0) / analyses.length);
}

function fallbackSynthesis(analyses: NormalizedAnalysis[]): NormalizedAnalysis {
  const strengths = uniqueStrings(analyses.flatMap((analysis) => analysis.strengths), 12);
  const weaknesses = uniqueStrings(analyses.flatMap((analysis) => analysis.weaknesses), 12);
  const suggestions = normalizeSuggestions(analyses.flatMap((analysis) => analysis.suggestions), 12);
  return {
    overallScore: averageScore(analyses, "overallScore"),
    innovationScore: averageScore(analyses, "innovationScore"),
    viabilityScore: averageScore(analyses, "viabilityScore"),
    scalabilityScore: averageScore(analyses, "scalabilityScore"),
    endorserAlignment: averageScore(analyses, "endorserAlignment"),
    strengths,
    weaknesses,
    suggestions,
    summary: "Whole-document review synthesized from the section-level analyses. Scores assess document preparation and do not verify external evidence.",
  };
}

async function analyzeWholeDocument(documentType: string, documentName: string, documentContent: string): Promise<NormalizedAnalysis> {
  const content = String(documentContent || "").trim();
  if (content.length < 100) throw new Error("Document content must contain at least 100 characters");
  if (content.length > MAX_DOCUMENT_CHARS) {
    throw new Error(`Document content exceeds the ${MAX_DOCUMENT_CHARS.toLocaleString("en-GB")} character review limit`);
  }

  const chunks = splitDocumentIntoChunks(content);
  if (!chunks.length) throw new Error("Document contains no reviewable text");

  if (chunks.length === 1) {
    const response = await getAIResponse(
      DOCUMENT_REVIEW_PROMPT,
      `Document Type: ${documentType}\nDocument Name: ${documentName}\n\nFULL DOCUMENT CONTENT:\n${chunks[0]}`,
      2_400,
    );
    return normalizeAnalysis(response);
  }

  const chunkAnalyses: NormalizedAnalysis[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const response = await getAIResponse(
      DOCUMENT_REVIEW_PROMPT,
      `You are reviewing chunk ${index + 1} of ${chunks.length} from the same document. Assess only what is present in this chunk, identify evidence gaps and avoid treating claims as independently verified.\n\nDocument Type: ${documentType}\nDocument Name: ${documentName}\nChunk: ${index + 1}/${chunks.length}\n\nCONTENT:\n${chunks[index]}`,
      1_500,
    );
    chunkAnalyses.push(normalizeAnalysis(response));
  }

  try {
    const response = await getAIResponse(
      SYNTHESIS_PROMPT,
      `Document Type: ${documentType}\nDocument Name: ${documentName}\nTotal document chunks reviewed: ${chunks.length}\n\nCHUNK ANALYSES:\n${JSON.stringify(chunkAnalyses)}`,
      2_500,
    );
    return normalizeAnalysis(response);
  } catch (error) {
    console.warn("[DocumentReviewService] Synthesis call failed; using deterministic aggregate", error);
    return fallbackSynthesis(chunkAnalyses);
  }
}

export interface DocumentReviewInput {
  userId: string;
  documentName: string;
  documentType: "business_plan" | "personal_statement" | "evidence" | "financial" | "other";
  documentContent: string;
  documentId?: string;
}

export async function createDocumentReview(input: DocumentReviewInput) {
  const documentName = cleanText(input.documentName, 255);
  const documentContent = String(input.documentContent || "").trim();
  const documentType = input.documentType;

  if (!input.userId) throw new Error("Authenticated user is required");
  if (!documentName) throw new Error("Document name is required");
  if (!["business_plan", "personal_statement", "evidence", "financial", "other"].includes(documentType)) {
    throw new Error("Unsupported document type");
  }
  if (documentContent.length < 100) throw new Error("Document content must contain at least 100 characters");
  if (documentContent.length > MAX_DOCUMENT_CHARS) {
    throw new Error(`Document content exceeds the ${MAX_DOCUMENT_CHARS.toLocaleString("en-GB")} character review limit`);
  }

  const [review] = await db.insert(documentReviews).values({
    userId: input.userId,
    documentName,
    documentType,
    documentContent,
    documentId: input.documentId,
    status: "pending",
  }).returning();

  processDocumentReview(review.id).catch((error) => {
    console.error("Document review processing failed:", error);
  });

  return review;
}

export async function processDocumentReview(reviewId: string) {
  await db.update(documentReviews)
    .set({ status: "processing" })
    .where(eq(documentReviews.id, reviewId));

  try {
    const [review] = await db.select().from(documentReviews).where(eq(documentReviews.id, reviewId));
    if (!review) throw new Error("Review not found");

    const analysis = await analyzeWholeDocument(
      review.documentType,
      review.documentName,
      review.documentContent || "",
    );

    await db.update(documentReviews)
      .set({
        status: "completed",
        completedAt: new Date(),
        overallScore: analysis.overallScore,
        innovationScore: analysis.innovationScore,
        viabilityScore: analysis.viabilityScore,
        scalabilityScore: analysis.scalabilityScore,
        endorserAlignment: analysis.endorserAlignment,
        strengthsFound: analysis.strengths,
        weaknessesFound: analysis.weaknesses,
        suggestions: analysis.suggestions,
        aiProvider: "managed",
      })
      .where(eq(documentReviews.id, reviewId));

    return { success: true, reviewId };
  } catch (error) {
    console.error("Document review failed:", error);
    await db.update(documentReviews)
      .set({ status: "failed" })
      .where(eq(documentReviews.id, reviewId));
    throw error;
  }
}

export async function getDocumentReview(reviewId: string) {
  const [review] = await db.select().from(documentReviews).where(eq(documentReviews.id, reviewId));
  return review;
}

export async function getUserDocumentReviews(userId: string) {
  return db.select()
    .from(documentReviews)
    .where(eq(documentReviews.userId, userId))
    .orderBy(documentReviews.createdAt);
}

export async function getDocumentReviewStats(userId: string) {
  const reviews = await getUserDocumentReviews(userId);
  const completed = reviews.filter((review) => review.status === "completed");

  if (completed.length === 0) {
    return {
      totalReviews: reviews.length,
      completedReviews: 0,
      averageScore: 0,
      averageInnovation: 0,
      averageViability: 0,
      averageScalability: 0,
    };
  }

  const average = (field: "overallScore" | "innovationScore" | "viabilityScore" | "scalabilityScore") =>
    Math.round(completed.reduce((sum, review) => sum + Number(review[field] || 0), 0) / completed.length);

  return {
    totalReviews: reviews.length,
    completedReviews: completed.length,
    averageScore: average("overallScore"),
    averageInnovation: average("innovationScore"),
    averageViability: average("viabilityScore"),
    averageScalability: average("scalabilityScore"),
  };
}
