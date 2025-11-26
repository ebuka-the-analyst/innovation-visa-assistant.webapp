import OpenAI from "openai";
import { storage } from "./storage";
import { InsertEligibilityAssessment, IndustryProfile } from "@shared/schema";
import crypto from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConceptBrief {
  businessConcept: string;
  industrySlug: string;
  targetMarket?: string;
  problemStatement?: string;
  proposedSolution?: string;
}

interface EligibilityScore {
  innovationScore: number;
  scalabilityScore: number;
  viabilityScore: number;
  overallScore: number;
}

interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  innovationGaps: string[];
  recommendations: string[];
  endorserFit: string[];
  riskFactors: string[];
}

interface EnhancementSuggestion {
  area: string;
  currentState: string;
  suggestion: string;
  impactOnScore: number;
}

interface EligibilityResult {
  scores: EligibilityScore;
  eligibilityBand: 'eligible' | 'needs_improvement' | 'not_eligible';
  aiAnalysis: AIAnalysis;
  disqualifiers: string[];
  enhancementSuggestions: EnhancementSuggestion[];
  canProceed: boolean;
}

const INNOVATION_KEYWORDS = {
  strong: [
    'first', 'novel', 'proprietary', 'patented', 'breakthrough', 'ai', 'machine learning',
    'algorithm', 'platform', 'automated', 'real-time', 'predictive', 'blockchain',
    'deep learning', 'neural', 'api', 'saas', 'marketplace'
  ],
  weak: [
    'traditional', 'standard', 'basic', 'simple', 'existing', 'conventional',
    'regular', 'typical', 'common', 'normal'
  ],
  disqualifying: [
    'buy and sell', 'flip', 'flipping', 'resell', 'reselling', 'trading',
    'import export', 'dropshipping', 'franchise', 'consulting only'
  ]
};

const SCALABILITY_KEYWORDS = {
  strong: [
    'platform', 'saas', 'subscription', 'recurring', 'api', 'marketplace',
    'automated', 'scale', 'global', 'international', 'network effect',
    'multi-market', 'licensing', 'white-label'
  ],
  weak: [
    'local', 'manual', 'personal', 'one-on-one', 'bespoke', 'custom',
    'limited', 'small', 'niche'
  ]
};

function runRuleBasedScoring(brief: ConceptBrief, industryProfile: IndustryProfile | null): { 
  scores: Partial<EligibilityScore>, 
  flags: string[], 
  disqualifiers: string[] 
} {
  const text = `${brief.businessConcept} ${brief.problemStatement || ''} ${brief.proposedSolution || ''}`.toLowerCase();
  const flags: string[] = [];
  const disqualifiers: string[] = [];
  
  let innovationBase = 50;
  let scalabilityBase = 50;
  let viabilityBase = 50;

  INNOVATION_KEYWORDS.strong.forEach(keyword => {
    if (text.includes(keyword)) {
      innovationBase += 5;
      flags.push(`Innovation+: Contains "${keyword}"`);
    }
  });

  INNOVATION_KEYWORDS.weak.forEach(keyword => {
    if (text.includes(keyword)) {
      innovationBase -= 8;
      flags.push(`Innovation-: Contains "${keyword}"`);
    }
  });

  INNOVATION_KEYWORDS.disqualifying.forEach(keyword => {
    if (text.includes(keyword)) {
      innovationBase -= 25;
      disqualifiers.push(`Business model "${keyword}" is typically not considered innovative for visa purposes`);
    }
  });

  SCALABILITY_KEYWORDS.strong.forEach(keyword => {
    if (text.includes(keyword)) {
      scalabilityBase += 5;
      flags.push(`Scalability+: Contains "${keyword}"`);
    }
  });

  SCALABILITY_KEYWORDS.weak.forEach(keyword => {
    if (text.includes(keyword)) {
      scalabilityBase -= 5;
      flags.push(`Scalability-: Contains "${keyword}"`);
    }
  });

  if (text.includes('funding') || text.includes('investment') || text.includes('revenue')) {
    viabilityBase += 10;
  }
  if (text.includes('team') || text.includes('experience') || text.includes('years')) {
    viabilityBase += 5;
  }
  if (text.includes('pilot') || text.includes('customer') || text.includes('beta')) {
    viabilityBase += 10;
  }

  if (industryProfile) {
    const criticalFactors = industryProfile.visaCriticalFactors as any;
    
    if (criticalFactors?.commonPitfalls) {
      criticalFactors.commonPitfalls.forEach((pitfall: string) => {
        const pitfallLower = pitfall.toLowerCase();
        if (text.includes(pitfallLower.substring(0, 20))) {
          flags.push(`Warning: Potential pitfall detected - ${pitfall}`);
          innovationBase -= 5;
        }
      });
    }

    if (industryProfile.category === 'traditional') {
      innovationBase -= 15;
      flags.push('Industry category "traditional" requires stronger innovation positioning');
    }
  }

  return {
    scores: {
      innovationScore: Math.max(0, Math.min(100, innovationBase)),
      scalabilityScore: Math.max(0, Math.min(100, scalabilityBase)),
      viabilityScore: Math.max(0, Math.min(100, viabilityBase))
    },
    flags,
    disqualifiers
  };
}

async function runAIAnalysis(
  brief: ConceptBrief, 
  industryProfile: IndustryProfile | null,
  ruleBasedScores: Partial<EligibilityScore>
): Promise<{ aiScores: EligibilityScore, analysis: AIAnalysis, suggestions: EnhancementSuggestion[] }> {
  
  const industryContext = industryProfile ? `
Industry Profile: ${industryProfile.label}
Category: ${industryProfile.category}
Visa-Critical Innovation Indicators: ${JSON.stringify((industryProfile.visaCriticalFactors as any)?.innovationIndicators || [])}
Common Pitfalls: ${JSON.stringify((industryProfile.visaCriticalFactors as any)?.commonPitfalls || [])}
Examples of Innovative Businesses: ${JSON.stringify((industryProfile.innovationExamples as any)?.innovative || [])}
Examples of Non-Innovative Businesses: ${JSON.stringify((industryProfile.innovationExamples as any)?.notInnovative || [])}
` : 'No specific industry profile available.';

  const systemPrompt = `You are an expert UK Innovator Founder Visa assessor with deep knowledge of endorsing body requirements. Your role is to evaluate business concepts against the three visa criteria:

1. INNOVATION (40% weight): Is the business genuinely innovative? Does it offer something new or significantly different?
2. SCALABILITY (30% weight): Can it grow substantially? Is there a technology-enabled or platform-based approach?
3. VIABILITY (30% weight): Is it realistic? Does the founder have relevant credentials? Is there a path to success?

${industryContext}

Rule-based preliminary scores:
- Innovation: ${ruleBasedScores.innovationScore}/100
- Scalability: ${ruleBasedScores.scalabilityScore}/100
- Viability: ${ruleBasedScores.viabilityScore}/100

Your task is to provide nuanced scoring and detailed analysis. Be honest but constructive. If a business is not suitable for this visa, explain why clearly and suggest how it might be repositioned.`;

  const userPrompt = `Evaluate this business concept for UK Innovator Founder Visa eligibility:

Business Concept: ${brief.businessConcept}
Industry: ${brief.industrySlug}
Target Market: ${brief.targetMarket || 'Not specified'}
Problem Statement: ${brief.problemStatement || 'Not specified'}
Proposed Solution: ${brief.proposedSolution || 'Not specified'}

Provide your assessment in the following JSON format:
{
  "scores": {
    "innovation": <0-100>,
    "scalability": <0-100>,
    "viability": <0-100>,
    "reasoning": "<brief explanation of scores>"
  },
  "analysis": {
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "innovationGaps": ["<gap 1>", "<gap 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"],
    "endorserFit": ["<which endorsing bodies might be suitable and why>"],
    "riskFactors": ["<risk 1>", "<risk 2>"]
  },
  "enhancementSuggestions": [
    {
      "area": "<area to improve>",
      "currentState": "<current state>",
      "suggestion": "<specific actionable suggestion>",
      "impactOnScore": <estimated score improvement 1-20>
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    const aiScores: EligibilityScore = {
      innovationScore: Math.round((ruleBasedScores.innovationScore! * 0.3 + parsed.scores.innovation * 0.7)),
      scalabilityScore: Math.round((ruleBasedScores.scalabilityScore! * 0.3 + parsed.scores.scalability * 0.7)),
      viabilityScore: Math.round((ruleBasedScores.viabilityScore! * 0.3 + parsed.scores.viability * 0.7)),
      overallScore: 0
    };

    aiScores.overallScore = Math.round(
      aiScores.innovationScore * 0.4 +
      aiScores.scalabilityScore * 0.3 +
      aiScores.viabilityScore * 0.3
    );

    return {
      aiScores,
      analysis: parsed.analysis,
      suggestions: parsed.enhancementSuggestions || []
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    
    const fallbackScores: EligibilityScore = {
      innovationScore: ruleBasedScores.innovationScore!,
      scalabilityScore: ruleBasedScores.scalabilityScore!,
      viabilityScore: ruleBasedScores.viabilityScore!,
      overallScore: Math.round(
        ruleBasedScores.innovationScore! * 0.4 +
        ruleBasedScores.scalabilityScore! * 0.3 +
        ruleBasedScores.viabilityScore! * 0.3
      )
    };

    return {
      aiScores: fallbackScores,
      analysis: {
        strengths: ["Business concept submitted for review"],
        weaknesses: ["Detailed AI analysis temporarily unavailable"],
        innovationGaps: [],
        recommendations: ["Please refine your concept and try again"],
        endorserFit: [],
        riskFactors: []
      },
      suggestions: []
    };
  }
}

function determineEligibilityBand(scores: EligibilityScore, disqualifiers: string[]): 'eligible' | 'needs_improvement' | 'not_eligible' {
  if (disqualifiers.length > 0) {
    return 'not_eligible';
  }

  if (scores.overallScore >= 65 && scores.innovationScore >= 55) {
    return 'eligible';
  }

  if (scores.overallScore >= 45 && scores.innovationScore >= 35) {
    return 'needs_improvement';
  }

  return 'not_eligible';
}

export async function assessEligibility(
  brief: ConceptBrief,
  userId?: string
): Promise<{ assessment: any, result: EligibilityResult }> {
  
  const industryProfile = await storage.getIndustryProfileBySlug(brief.industrySlug);

  const ruleBasedResult = runRuleBasedScoring(brief, industryProfile);

  const aiResult = await runAIAnalysis(brief, industryProfile, ruleBasedResult.scores);

  const allDisqualifiers = [...ruleBasedResult.disqualifiers];

  const eligibilityBand = determineEligibilityBand(aiResult.aiScores, allDisqualifiers);

  const canProceed = eligibilityBand === 'eligible' || eligibilityBand === 'needs_improvement';

  const accessToken = canProceed ? crypto.randomBytes(32).toString('hex') : undefined;
  const expiresAt = canProceed ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined;

  const assessmentData: InsertEligibilityAssessment = {
    userId: userId || null,
    businessConcept: brief.businessConcept,
    industrySlug: brief.industrySlug,
    targetMarket: brief.targetMarket,
    problemStatement: brief.problemStatement,
    proposedSolution: brief.proposedSolution,
    innovationScore: aiResult.aiScores.innovationScore,
    scalabilityScore: aiResult.aiScores.scalabilityScore,
    viabilityScore: aiResult.aiScores.viabilityScore,
    overallScore: aiResult.aiScores.overallScore,
    aiAnalysis: aiResult.analysis,
    eligibilityBand,
    disqualifiers: allDisqualifiers,
    enhancementSuggestions: aiResult.suggestions,
    status: canProceed ? 'passed' : 'failed',
    canProceed,
    accessToken,
    expiresAt
  };

  const assessment = await storage.createEligibilityAssessment(assessmentData);

  const result: EligibilityResult = {
    scores: aiResult.aiScores,
    eligibilityBand,
    aiAnalysis: aiResult.analysis,
    disqualifiers: allDisqualifiers,
    enhancementSuggestions: aiResult.suggestions,
    canProceed
  };

  return { assessment, result };
}

export async function getEligibilityAssessment(assessmentId: string) {
  return storage.getEligibilityAssessment(assessmentId);
}

export async function getUserEligibilityAssessments(userId: string) {
  return storage.getUserEligibilityAssessments(userId);
}

export async function validateAccessToken(token: string): Promise<boolean> {
  const assessment = await storage.getEligibilityAssessmentByToken(token);
  if (!assessment) return false;
  if (!assessment.canProceed) return false;
  if (assessment.expiresAt && new Date() > assessment.expiresAt) return false;
  return true;
}
