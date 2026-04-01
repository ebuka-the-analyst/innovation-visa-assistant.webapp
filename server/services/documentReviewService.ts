import { db } from "../db";
import { documentReviews } from "@shared/schema";
import { eq } from "drizzle-orm";
import { qwen, QWEN_MODELS } from "../qwenClient";

const DOCUMENT_REVIEW_PROMPT = `You are an expert UK Innovator Founder Visa consultant reviewing application documents. Analyze the provided document and provide detailed feedback.

EVALUATION CRITERIA (based on Home Office and endorser requirements):
1. Innovation Score (0-100): Does it demonstrate genuine innovation, new technology, or novel approach?
2. Viability Score (0-100): Is the business model realistic and financially viable?
3. Scalability Score (0-100): Can this business scale and create UK jobs?
4. Endorser Alignment (0-100): How well does this align with what endorsers look for?

RESPONSE FORMAT (JSON):
{
  "overallScore": <number 0-100>,
  "innovationScore": <number 0-100>,
  "viabilityScore": <number 0-100>,
  "scalabilityScore": <number 0-100>,
  "endorserAlignment": <number 0-100>,
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "suggestions": [
    {"priority": "high|medium|low", "suggestion": "specific improvement"},
    ...
  ],
  "summary": "Brief overall assessment"
}

Be constructive but honest. Focus on visa-specific requirements.`;

async function getAIResponse(systemPrompt: string, userPrompt: string): Promise<any> {
  console.log("[DocumentReviewService] Calling Qwen");
  const response = await qwen.chat.completions.create({
    model: QWEN_MODELS.plus,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    temperature: 0.7
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Qwen");
  return JSON.parse(content);
}

export interface DocumentReviewInput {
  userId: string;
  documentName: string;
  documentType: 'business_plan' | 'personal_statement' | 'evidence' | 'financial' | 'other';
  documentContent: string;
  documentId?: string;
}

export async function createDocumentReview(input: DocumentReviewInput) {
  const [review] = await db.insert(documentReviews).values({
    userId: input.userId,
    documentName: input.documentName,
    documentType: input.documentType,
    documentContent: input.documentContent,
    documentId: input.documentId,
    status: 'pending'
  }).returning();

  processDocumentReview(review.id).catch(err => {
    console.error('Document review processing failed:', err);
  });

  return review;
}

export async function processDocumentReview(reviewId: string) {
  await db.update(documentReviews)
    .set({ status: 'processing' })
    .where(eq(documentReviews.id, reviewId));

  try {
    const [review] = await db.select().from(documentReviews).where(eq(documentReviews.id, reviewId));
    if (!review) throw new Error('Review not found');

    const userPrompt = `Document Type: ${review.documentType}\nDocument Name: ${review.documentName}\n\nContent:\n${review.documentContent?.substring(0, 15000) || 'No content provided'}`;
    const analysis = await getAIResponse(DOCUMENT_REVIEW_PROMPT, userPrompt);

    await db.update(documentReviews)
      .set({
        status: 'completed',
        completedAt: new Date(),
        overallScore: analysis.overallScore,
        innovationScore: analysis.innovationScore,
        viabilityScore: analysis.viabilityScore,
        scalabilityScore: analysis.scalabilityScore,
        endorserAlignment: analysis.endorserAlignment,
        strengthsFound: analysis.strengths,
        weaknessesFound: analysis.weaknesses,
        suggestions: analysis.suggestions,
        aiProvider: 'qwen'
      })
      .where(eq(documentReviews.id, reviewId));

    return { success: true, reviewId };
  } catch (error) {
    console.error('Document review failed:', error);
    
    await db.update(documentReviews)
      .set({ status: 'failed' })
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
  const completed = reviews.filter(r => r.status === 'completed');
  
  if (completed.length === 0) {
    return {
      totalReviews: reviews.length,
      completedReviews: 0,
      averageScore: 0,
      averageInnovation: 0,
      averageViability: 0,
      averageScalability: 0
    };
  }

  const avgScore = completed.reduce((sum, r) => sum + (r.overallScore || 0), 0) / completed.length;
  const avgInnovation = completed.reduce((sum, r) => sum + (r.innovationScore || 0), 0) / completed.length;
  const avgViability = completed.reduce((sum, r) => sum + (r.viabilityScore || 0), 0) / completed.length;
  const avgScalability = completed.reduce((sum, r) => sum + (r.scalabilityScore || 0), 0) / completed.length;

  return {
    totalReviews: reviews.length,
    completedReviews: completed.length,
    averageScore: Math.round(avgScore),
    averageInnovation: Math.round(avgInnovation),
    averageViability: Math.round(avgViability),
    averageScalability: Math.round(avgScalability)
  };
}
