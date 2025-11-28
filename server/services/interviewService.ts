import { db } from "../db";
import { interviewSessions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  endorser_pitch: [
    "Tell me about your business idea and what makes it innovative.",
    "How does your solution differ from existing alternatives in the market?",
    "What technology or methodology makes your approach unique?",
    "What is your go-to-market strategy for the UK?",
    "How many jobs do you plan to create in the first 3 years?",
    "What is your funding plan and how will you use the investment?",
    "What relevant experience do you bring to this venture?",
    "How will you protect your intellectual property?",
    "What are the biggest risks to your business and how will you mitigate them?",
    "Why did you choose the UK for your business?"
  ],
  home_office: [
    "Please explain your business in simple terms.",
    "How is your business innovative?",
    "What is your role in the business?",
    "Do you have the right to work in the UK?",
    "How will your business benefit the UK economy?",
    "Where will your business be based?",
    "Do you have sufficient funds to support yourself?",
    "How did you develop your business idea?",
    "What are your plans for the next 2-3 years?",
    "Have you previously applied for a UK visa?"
  ],
  investor: [
    "What problem are you solving and for whom?",
    "What is your total addressable market?",
    "How do you acquire customers and what's your CAC?",
    "What's your revenue model?",
    "Who are your competitors and how do you differentiate?",
    "What are your unit economics?",
    "What milestones have you achieved so far?",
    "Who is on your team?",
    "How much are you raising and what will you use it for?",
    "What's your 5-year vision for the company?"
  ]
};

const FEEDBACK_PROMPT = `You are an expert interview coach evaluating responses for UK Innovator Founder Visa interviews. 
Analyze the candidate's response and provide constructive feedback.

EVALUATION CRITERIA:
1. Confidence (0-100): Voice clarity, conviction, directness
2. Clarity (0-100): Clear, structured, easy to understand
3. Content (0-100): Relevant, accurate, comprehensive

RESPONSE FORMAT (JSON):
{
  "confidenceScore": <number>,
  "clarityScore": <number>,
  "contentScore": <number>,
  "overallScore": <number>,
  "feedback": "Overall assessment in 2-3 sentences",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "suggestedAnswer": "Example of an ideal response (brief)"
}

Be encouraging but honest. Focus on visa-specific requirements.`;

// Call Gemini API for JSON response
async function callGeminiForJSON(systemPrompt: string, userPrompt: string): Promise<any> {
  const geminiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const geminiBaseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  
  const response = await fetch(`${geminiBaseURL}/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{
        role: "user",
        parts: [{ text: userPrompt }],
      }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json() as any;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No response from Gemini");
  
  return JSON.parse(content);
}

// Fallback to OpenAI
async function callOpenAIForJSON(systemPrompt: string, userPrompt: string): Promise<any> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");
  
  return JSON.parse(content);
}

// Try Gemini first, fallback to OpenAI
async function getAIResponse(systemPrompt: string, userPrompt: string): Promise<any> {
  try {
    console.log("[InterviewService] Attempting Gemini (PRIMARY)");
    return await callGeminiForJSON(systemPrompt, userPrompt);
  } catch (error: any) {
    console.error("[InterviewService] Gemini failed, falling back to OpenAI:", error.message);
    return await callOpenAIForJSON(systemPrompt, userPrompt);
  }
}

export interface CreateSessionInput {
  userId: string;
  sessionType: 'endorser_pitch' | 'home_office' | 'investor';
}

export async function createInterviewSession(input: CreateSessionInput) {
  const questions = INTERVIEW_QUESTIONS[input.sessionType] || INTERVIEW_QUESTIONS.endorser_pitch;
  
  const selectedQuestions = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const [session] = await db.insert(interviewSessions).values({
    userId: input.userId,
    sessionType: input.sessionType,
    status: 'in_progress',
    questionsAsked: selectedQuestions,
    responsesGiven: []
  }).returning();

  return session;
}

export async function submitResponse(sessionId: string, questionIndex: number, response: string) {
  const [session] = await db.select().from(interviewSessions).where(eq(interviewSessions.id, sessionId));
  if (!session) throw new Error('Session not found');

  const questions = session.questionsAsked as string[];
  const responses = (session.responsesGiven as any[] || []);
  
  responses[questionIndex] = {
    question: questions[questionIndex],
    response,
    submittedAt: new Date().toISOString()
  };

  await db.update(interviewSessions)
    .set({ responsesGiven: responses })
    .where(eq(interviewSessions.id, sessionId));

  return { success: true, questionIndex };
}

export async function completeInterviewSession(sessionId: string) {
  const [session] = await db.select().from(interviewSessions).where(eq(interviewSessions.id, sessionId));
  if (!session) throw new Error('Session not found');

  const questions = session.questionsAsked as string[];
  const responses = session.responsesGiven as any[];
  
  let totalConfidence = 0;
  let totalClarity = 0;
  let totalContent = 0;
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  const detailedFeedback: any[] = [];

  for (let i = 0; i < responses.length; i++) {
    if (!responses[i]?.response) continue;

    try {
      const userPrompt = `Interview Type: ${session.sessionType}\nQuestion: ${questions[i]}\n\nCandidate's Response:\n${responses[i].response}`;
      const feedback = await getAIResponse(FEEDBACK_PROMPT, userPrompt);
      
      totalConfidence += feedback.confidenceScore || 0;
      totalClarity += feedback.clarityScore || 0;
      totalContent += feedback.contentScore || 0;
      
      if (feedback.strengths) allStrengths.push(...feedback.strengths);
      if (feedback.improvements) allImprovements.push(...feedback.improvements);
      
      detailedFeedback.push({
        questionIndex: i,
        question: questions[i],
        response: responses[i].response,
        ...feedback
      });
    } catch (error) {
      console.error(`Failed to analyze response ${i}:`, error);
    }
  }

  const answeredCount = responses.filter(r => r?.response).length || 1;
  
  const avgConfidence = Math.round(totalConfidence / answeredCount);
  const avgClarity = Math.round(totalClarity / answeredCount);
  const avgContent = Math.round(totalContent / answeredCount);
  const overallScore = Math.round((avgConfidence + avgClarity + avgContent) / 3);

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 5);
  const uniqueImprovements = Array.from(new Set(allImprovements)).slice(0, 5);

  const [updated] = await db.update(interviewSessions)
    .set({
      status: 'completed',
      completedAt: new Date(),
      overallScore,
      confidenceScore: avgConfidence,
      clarityScore: avgClarity,
      contentScore: avgContent,
      feedback: detailedFeedback,
      strengths: uniqueStrengths,
      areasForImprovement: uniqueImprovements,
      duration: Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000)
    })
    .where(eq(interviewSessions.id, sessionId))
    .returning();

  return updated;
}

export async function getInterviewSession(sessionId: string) {
  const [session] = await db.select().from(interviewSessions).where(eq(interviewSessions.id, sessionId));
  return session;
}

export async function getUserInterviewSessions(userId: string) {
  return db.select()
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt));
}

export async function getInterviewStats(userId: string) {
  const sessions = await getUserInterviewSessions(userId);
  const completed = sessions.filter(s => s.status === 'completed');

  if (completed.length === 0) {
    return {
      totalSessions: sessions.length,
      completedSessions: 0,
      averageScore: 0,
      bestScore: 0,
      totalPracticeTime: 0
    };
  }

  const avgScore = completed.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completed.length;
  const bestScore = Math.max(...completed.map(s => s.overallScore || 0));
  const totalTime = completed.reduce((sum, s) => sum + (s.duration || 0), 0);

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    averageScore: Math.round(avgScore),
    bestScore,
    totalPracticeTime: totalTime
  };
}
