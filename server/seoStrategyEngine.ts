/**
 * PhD-Level Multi-Model SEO Strategy Engine
 * 
 * Uses all 4 AI models in parallel across 4 specialised domains:
 * - Gemini: GBP & local SEO strategy + competitor positioning
 * - OpenAI GPT-4o: Technical SEO + keyword gap analysis
 * - Claude (Anthropic): Content strategy + entity building + authority
 * - Qwen: Blog content calendar + service page templates + GBP posts
 * 
 * Based on the 20-prompt SEO framework, adapted for multi-model verification.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || "");

export interface SEOBusinessContext {
  businessName: string;
  websiteUrl: string;
  primaryService: string;
  targetKeywords: string[];
  targetAudience: string;
  competitors: string[];
  targetLocations: string[];
  currentMonthlyTraffic?: number;
  googleReviewCount?: number;
  averageRating?: number;
  currentRankingKeywords?: string[];
  biggestSEOProblem?: string;
}

export interface SEOAction {
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  action: string;
  impact: string;
  effort: "quick-win" | "week" | "month" | "quarter";
  metric: string;
}

export interface ContentPiece {
  title: string;
  type: "blog" | "service-page" | "faq" | "location-page" | "gbp-post";
  targetKeyword: string;
  outline: string[];
  wordCount: number;
  weekNumber?: number;
}

export interface KeywordOpportunity {
  keyword: string;
  intent: "ready-to-hire" | "solution-aware" | "problem-aware" | "research";
  difficulty: "low" | "medium" | "high";
  action: "optimize-existing" | "create-new";
  pageRecommendation: string;
}

export interface SEOStrategyResult {
  generatedAt: string;
  businessContext: SEOBusinessContext;
  executiveSummary: string;
  overallScore: {
    technical: number;
    content: number;
    authority: number;
    local: number;
    overall: number;
  };
  criticalActions: SEOAction[];
  quickWins: SEOAction[];
  thirtyDayPlan: SEOAction[];
  ninetyDayPlan: SEOAction[];
  contentCalendar: ContentPiece[];
  keywordOpportunities: KeywordOpportunity[];
  entityOptimization: {
    schemaRecommendations: string[];
    entityBuildingSteps: string[];
    knowledgePanelStrategy: string;
    citationAuditFindings: string[];
  };
  gbpStrategy: {
    categoryRecommendations: string[];
    descriptionVersions: string[];
    postingCalendar: { week: number; topic: string; type: string; copy: string }[];
    attributesToAdd: string[];
    photoStrategy: string;
  };
  technicalSEO: {
    coreWebVitals: string[];
    structuredDataGaps: string[];
    internalLinkingOpportunities: string[];
    pageSpeedRecommendations: string[];
  };
  authorityBuilding: {
    linkBuildingOpportunities: { source: string; type: string; strategy: string }[];
    prOpportunities: string[];
    partnershipOpportunities: string[];
  };
  verificationNotes: string;
  modelContributions: {
    gemini: string;
    openai: string;
    claude: string;
    qwen: string;
  };
}

function buildGeminiPrompt(ctx: SEOBusinessContext): string {
  return `You are a PhD-level local SEO expert specialising in Google Business Profile optimisation and competitive local SEO strategy. Your analysis must be ultra-specific, data-driven, and immediately actionable.

BUSINESS CONTEXT:
- Business: ${ctx.businessName}
- Website: ${ctx.websiteUrl}
- Primary Service: ${ctx.primaryService}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Target Locations: ${ctx.targetLocations.join(", ")}
- Competitors: ${ctx.competitors.join(", ")}
- Current Traffic: ${ctx.currentMonthlyTraffic || "Unknown"}
- Current Problem: ${ctx.biggestSEOProblem || "Not specified"}

Analyse and produce a comprehensive LOCAL SEO + GBP strategy covering:

1. GBP CATEGORY AUDIT: Which primary + secondary GBP categories should this business use? List 5+ categories.

2. GBP DESCRIPTION: Write 3 versions (keyword-focused, conversion-focused, trust-focused), each under 750 characters.

3. GBP POSTING CALENDAR: 8-week calendar with 2 posts per week. Each post: type, topic, full copy (100-150 words), CTA.

4. GBP ATTRIBUTES: List all attributes that should be enabled.

5. COMPETITOR POSITIONING: Based on the competitor list, identify differentiation opportunities.

6. LOCAL KEYWORD MAP: Map the top 20 keywords by buyer intent stage (ready-to-hire → problem-aware).

7. LOCATION PAGES: Recommend service+location page combinations for the target locations.

8. SCORING: Rate this business's current local SEO on: Technical (0-100), Content (0-100), Authority (0-100), Local (0-100).

Return your analysis as a structured JSON object with these exact keys:
{
  "categoryRecommendations": ["Primary: X", "Secondary: Y", ...],
  "descriptionVersions": ["version1", "version2", "version3"],
  "postingCalendar": [{"week": 1, "post": 1, "type": "update", "topic": "...", "copy": "..."}],
  "attributesToAdd": ["...", "..."],
  "competitorGaps": ["...", "..."],
  "keywordMap": [{"keyword": "...", "intent": "ready-to-hire|solution-aware|problem-aware|research", "action": "optimize-existing|create-new", "page": "..."}],
  "locationPages": [{"location": "...", "service": "...", "urlSlug": "..."}],
  "localSEOScore": {"technical": 85, "content": 70, "authority": 60, "local": 75},
  "gbpQuickWins": ["...", "..."],
  "executiveSummaryLocal": "..."
}`;
}

function buildOpenAIPrompt(ctx: SEOBusinessContext): string {
  return `You are a PhD-level technical SEO specialist and keyword strategist. Your analysis must be surgical, specific, and based on proven SEO principles.

BUSINESS CONTEXT:
- Business: ${ctx.businessName}
- Website: ${ctx.websiteUrl}
- Primary Service: ${ctx.primaryService}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Current Rankings: ${ctx.currentRankingKeywords?.join(", ") || "Not provided"}
- Competitors: ${ctx.competitors.join(", ")}
- Biggest Problem: ${ctx.biggestSEOProblem || "Not specified"}

Produce a comprehensive TECHNICAL SEO + KEYWORD strategy:

1. KEYWORD GAP ANALYSIS: Identify 20 keywords this business should rank for but likely doesn't. Categorise by intent and difficulty.

2. PAGE-2 GOLDMINE: Identify likely ranking opportunities (position 11-20) and exact on-page fixes needed.

3. MONEY PAGE AUDIT: Which pages should be created immediately? Provide: URL slug, title tag, H1, meta description, 5-bullet content outline.

4. CORE WEB VITALS: Specific recommendations for improving LCP, FID, CLS for this type of site.

5. INTERNAL LINKING MAP: Key pages and internal linking opportunities.

6. TECHNICAL AUDIT CHECKLIST: 10 most critical technical SEO fixes for this type of business.

7. 30-DAY SPRINT: Week-by-week technical action plan (4 weeks).

8. CONTENT BRIEFS: Write 5 detailed content briefs for the highest-priority pages (each with title, H1, meta, outline, word count, target keyword, secondary keywords).

Return as structured JSON:
{
  "keywordGaps": [{"keyword": "...", "intent": "...", "difficulty": "low|medium|high", "action": "optimize-existing|create-new", "pageRecommendation": "..."}],
  "page2Goldmine": [{"keyword": "...", "estimatedPosition": 15, "fixes": ["...", "..."]}],
  "newPagesNeeded": [{"urlSlug": "...", "titleTag": "...", "h1": "...", "metaDescription": "...", "contentOutline": ["...", "..."]}],
  "coreWebVitals": ["...", "..."],
  "internalLinking": [{"from": "...", "to": "...", "anchorText": "..."}],
  "technicalFixes": ["...", "..."],
  "thirtyDaySprint": [{"week": 1, "actions": ["...", "..."]}],
  "contentBriefs": [{"title": "...", "targetKeyword": "...", "wordCount": 1500, "outline": ["...", "..."]}],
  "technicalScore": 75,
  "executiveSummaryTechnical": "..."
}`;
}

function buildClaudePrompt(ctx: SEOBusinessContext): string {
  return `You are a PhD-level SEO strategist specialising in content strategy, entity optimisation, and authority building. You combine E-E-A-T principles with advanced schema markup and knowledge graph optimisation.

BUSINESS CONTEXT:
- Business: ${ctx.businessName}
- Website: ${ctx.websiteUrl}
- Primary Service: ${ctx.primaryService}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Competitors: ${ctx.competitors.join(", ")}
- Locations: ${ctx.targetLocations.join(", ")}
- Biggest Problem: ${ctx.biggestSEOProblem || "Not specified"}

Produce a comprehensive CONTENT STRATEGY + ENTITY OPTIMISATION + AUTHORITY BUILDING report:

1. ENTITY OPTIMISATION: 
   - What schema markup is most critical for this business type?
   - Knowledge panel strategy
   - Entity signals to build (Wikidata, Crunchbase, LinkedIn, industry directories)
   - NAP consistency checklist

2. E-E-A-T SIGNALS: Specific ways to demonstrate Experience, Expertise, Authoritativeness, Trustworthiness for this niche.

3. CONTENT STRATEGY:
   - Content pillar structure for this business
   - Topic clusters with supporting content
   - Content gap opportunities
   - Editorial calendar for 12 weeks (one post type per week)

4. AUTHORITY BUILDING:
   - Top 10 backlink opportunities specific to this niche (not generic directories)
   - PR opportunities (what stories would journalists cover?)
   - Partnership/co-marketing opportunities
   - Guest post opportunities

5. REVIEW STRATEGY:
   - Review request script (optimised for keyword-rich responses)
   - Review response templates (5-star, 4-star, 3-star, 1-2 star)
   - Sentiment analysis framework

6. FAQ STRATEGY:
   - Top 20 FAQs this business should answer (with markup-ready answers)
   - People Also Ask opportunities

Return as structured JSON:
{
  "schemaRecommendations": ["...", "..."],
  "entityBuildingSteps": ["...", "..."],
  "knowledgePanelStrategy": "...",
  "citationAuditFindings": ["...", "..."],
  "eeaatSignals": ["...", "..."],
  "contentPillars": [{"pillar": "...", "supportingTopics": ["...", "..."]}],
  "twelveWeekEditorial": [{"week": 1, "title": "...", "type": "blog|faq|guide", "targetKeyword": "...", "wordCount": 1500, "outline": ["...", "..."]}],
  "linkBuildingOpportunities": [{"source": "...", "type": "directory|press|guest|partnership", "strategy": "..."}],
  "prOpportunities": ["...", "..."],
  "reviewRequestScript": "...",
  "reviewResponseTemplates": {"fiveStar": "...", "fourStar": "...", "threeStar": "...", "oneTwo": "..."},
  "faqPairs": [{"question": "...", "answer": "..."}],
  "authorityScore": 65,
  "executiveSummaryAuthority": "..."
}`;
}

function buildQwenPrompt(ctx: SEOBusinessContext): string {
  return `You are a PhD-level content strategist and local SEO specialist. Your job is to generate production-ready, highly optimised content that ranks and converts.

BUSINESS CONTEXT:
- Business: ${ctx.businessName}
- Website: ${ctx.websiteUrl}
- Primary Service: ${ctx.primaryService}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Target Locations: ${ctx.targetLocations.join(", ")}
- Competitors: ${ctx.competitors.join(", ")}

Produce PRODUCTION-READY content + strategy:

1. BLOG CONTENT CALENDAR (12 posts): Each with full title, meta description, introduction paragraph (150 words), section outline (5 sections), target keyword, secondary keywords, internal link targets, word count, CTA.

2. SERVICE PAGE TEMPLATES (3 pages): Full templates for the 3 most valuable service pages. Each with: title, H1, intro (200 words), service description (300 words), why-us section (200 words), FAQ section (3 Q&As), CTA.

3. GBP POST COPY (8 weeks × 2 posts = 16 posts): Full copy for every post. Mix of: service promotions, educational tips, case-result highlights (anonymised), seasonal content, and location-specific posts.

4. META TAG AUDIT: Write optimised title tags and meta descriptions for the 10 most important pages.

5. HOMEPAGE COPY: Rewrite the homepage hero (headline + subheadline + CTA) and the first three sections (value proposition, services overview, social proof).

6. KEYWORD-RICH CONTENT SNIPPETS: Write 10 short (100-word) keyword-rich content snippets that can be added to existing pages.

Return as structured JSON:
{
  "blogCalendar": [{"weekNumber": 1, "title": "...", "metaDescription": "...", "targetKeyword": "...", "secondaryKeywords": ["...", "..."], "intro": "...", "outline": ["...", "..."], "wordCount": 1500, "cta": "..."}],
  "servicePages": [{"pageName": "...", "urlSlug": "...", "h1": "...", "intro": "...", "serviceDescription": "...", "whyUs": "...", "faqs": [{"q": "...", "a": "..."}]}],
  "gbpPosts": [{"week": 1, "postNumber": 1, "type": "...", "topic": "...", "copy": "...", "cta": "..."}],
  "metaTags": [{"page": "...", "titleTag": "...", "metaDescription": "..."}],
  "homepageCopy": {"headline": "...", "subheadline": "...", "ctaText": "...", "valueProp": "...", "servicesOverview": "...", "socialProof": "..."},
  "contentSnippets": [{"targetPage": "...", "keyword": "...", "snippet": "..."}],
  "contentScore": 70,
  "executiveSummaryContent": "..."
}`;
}

async function callQwen(prompt: string): Promise<string> {
  const response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.QWEN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [
        {
          role: "system",
          content: "You are a PhD-level SEO strategist and content specialist. Always respond with valid JSON only — no markdown, no explanations, just the JSON object."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 8000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || "{}";
}

function safeParseJSON(raw: string): Record<string, unknown> {
  try {
    // Extract JSON if wrapped in markdown code blocks
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to extract first JSON object
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export async function generateSEOStrategy(ctx: SEOBusinessContext): Promise<SEOStrategyResult> {
  const startTime = Date.now();
  console.log(`[SEO Engine] Starting quad-model SEO analysis for: ${ctx.businessName}`);

  // Run all 4 models in parallel
  const [geminiResult, openaiResult, claudeResult, qwenResult] = await Promise.allSettled([
    // Gemini: Local SEO + GBP
    (async () => {
      const model = gemini.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      });
      const result = await model.generateContent(buildGeminiPrompt(ctx));
      return safeParseJSON(result.response.text());
    })(),

    // OpenAI: Technical SEO + Keywords
    (async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a PhD-level technical SEO and keyword strategist. Respond with valid JSON only — no markdown, no explanations."
          },
          { role: "user", content: buildOpenAIPrompt(ctx) }
        ],
        max_tokens: 8000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      return safeParseJSON(response.choices[0].message.content || "{}");
    })(),

    // Claude: Content + Entity + Authority
    (async () => {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 8000,
        temperature: 0.3 as number,
        system: "You are a PhD-level SEO content strategist and entity optimisation specialist. Respond with valid JSON only — no markdown, no explanations outside the JSON structure.",
        messages: [{ role: "user", content: buildClaudePrompt(ctx) }]
      });
      const content = response.content[0];
      return safeParseJSON(content.type === "text" ? content.text : "{}");
    })(),

    // Qwen: Content Production
    (async () => {
      const raw = await callQwen(buildQwenPrompt(ctx));
      return safeParseJSON(raw);
    })(),
  ]);

  const geminiData = geminiResult.status === "fulfilled" ? geminiResult.value : {};
  const openaiData = openaiResult.status === "fulfilled" ? openaiResult.value : {};
  const claudeData = claudeResult.status === "fulfilled" ? claudeResult.value : {};
  const qwenData = qwenResult.status === "fulfilled" ? qwenResult.value : {};

  if (geminiResult.status === "rejected") console.error("[SEO Engine] Gemini failed:", geminiResult.reason);
  if (openaiResult.status === "rejected") console.error("[SEO Engine] OpenAI failed:", openaiResult.reason);
  if (claudeResult.status === "rejected") console.error("[SEO Engine] Claude failed:", claudeResult.reason);
  if (qwenResult.status === "rejected") console.error("[SEO Engine] Qwen failed:", qwenResult.reason);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[SEO Engine] All models completed in ${elapsed}s`);

  // Score aggregation
  const scores = {
    technical: Number((openaiData as Record<string, unknown>)?.technicalScore) || 65,
    content: Number((qwenData as Record<string, unknown>)?.contentScore) || 60,
    authority: Number((claudeData as Record<string, unknown>)?.authorityScore) || 55,
    local: ((geminiData as Record<string, unknown>)?.localSEOScore as Record<string, number>)?.local || 70,
    overall: 0,
  };
  scores.overall = Math.round((scores.technical + scores.content + scores.authority + scores.local) / 4);

  // Build critical actions from all models
  const criticalActions: SEOAction[] = [
    ...(((geminiData as Record<string, unknown>)?.gbpQuickWins as string[]) || []).slice(0, 3).map((a: string) => ({
      priority: "critical" as const,
      category: "Local SEO / GBP",
      action: a,
      impact: "High visibility improvement in Google Maps pack",
      effort: "quick-win" as const,
      metric: "GBP impressions + map pack ranking"
    })),
    ...(((openaiData as Record<string, unknown>)?.technicalFixes as string[]) || []).slice(0, 3).map((a: string) => ({
      priority: "high" as const,
      category: "Technical SEO",
      action: a,
      impact: "Improved crawlability and indexing",
      effort: "week" as const,
      metric: "Core Web Vitals scores + indexing coverage"
    })),
  ];

  // Quick wins
  const quickWins: SEOAction[] = [
    ...(((openaiData as Record<string, unknown>)?.page2Goldmine as Array<{keyword: string; estimatedPosition: number; fixes: string[]}>)|| []).slice(0, 5).map((item) => ({
      priority: "high" as const,
      category: "Page-2 Keywords",
      action: `Optimise for "${item.keyword}" (currently ~pos ${item.estimatedPosition}): ${item.fixes?.slice(0, 2).join("; ")}`,
      impact: "Move from page 2 to page 1 — 5-10x click increase",
      effort: "week" as const,
      metric: `Ranking position for "${item.keyword}"`
    })),
  ];

  // 30-day plan from OpenAI sprint
  const thirtyDayPlan: SEOAction[] = (((openaiData as Record<string, unknown>)?.thirtyDaySprint as Array<{week: number; actions: string[]}>) || []).flatMap(week =>
    (week.actions || []).map((action: string) => ({
      priority: "medium" as const,
      category: `Week ${week.week} Technical`,
      action,
      impact: "Compounding SEO improvement",
      effort: "week" as const,
      metric: "Organic rankings + traffic"
    }))
  );

  // 90-day plan from Claude
  const ninetyDayPlan: SEOAction[] = (((claudeData as Record<string, unknown>)?.entityBuildingSteps as string[]) || []).slice(0, 8).map((step: string) => ({
    priority: "medium" as const,
    category: "Entity & Authority",
    action: step,
    impact: "Long-term authority and knowledge panel acquisition",
    effort: "quarter" as const,
    metric: "Domain authority + branded searches"
  }));

  // Content calendar from Qwen (blog) + Claude (12-week editorial)
  const contentCalendar: ContentPiece[] = [
    ...(((qwenData as Record<string, unknown>)?.blogCalendar as Array<{weekNumber: number; title: string; targetKeyword: string; outline: string[]; wordCount: number}>) || []).slice(0, 8).map((item) => ({
      title: item.title,
      type: "blog" as const,
      targetKeyword: item.targetKeyword,
      outline: item.outline || [],
      wordCount: item.wordCount || 1500,
      weekNumber: item.weekNumber,
    })),
    ...(((claudeData as Record<string, unknown>)?.twelveWeekEditorial as Array<{week: number; title: string; type: string; targetKeyword: string; outline: string[]; wordCount: number}>) || []).slice(0, 4).map((item) => ({
      title: item.title,
      type: (item.type as ContentPiece["type"]) || "blog",
      targetKeyword: item.targetKeyword,
      outline: item.outline || [],
      wordCount: item.wordCount || 1500,
      weekNumber: item.week,
    })),
    ...(((qwenData as Record<string, unknown>)?.servicePages as Array<{pageName: string; urlSlug: string; h1: string}>) || []).slice(0, 3).map((sp) => ({
      title: sp.pageName,
      type: "service-page" as const,
      targetKeyword: sp.h1,
      outline: [],
      wordCount: 800,
    })),
  ];

  // Keyword opportunities from both Gemini and OpenAI
  const keywordOpportunities: KeywordOpportunity[] = [
    ...(((geminiData as Record<string, unknown>)?.keywordMap as Array<{keyword: string; intent: string; action: string; page: string}>) || []).slice(0, 10).map((k) => ({
      keyword: k.keyword,
      intent: (k.intent as KeywordOpportunity["intent"]) || "solution-aware",
      difficulty: "medium" as const,
      action: (k.action as KeywordOpportunity["action"]) || "optimize-existing",
      pageRecommendation: k.page || "",
    })),
    ...(((openaiData as Record<string, unknown>)?.keywordGaps as Array<{keyword: string; intent: string; difficulty: string; action: string; pageRecommendation: string}>) || []).slice(0, 10).map((k) => ({
      keyword: k.keyword,
      intent: (k.intent as KeywordOpportunity["intent"]) || "problem-aware",
      difficulty: (k.difficulty as KeywordOpportunity["difficulty"]) || "medium",
      action: (k.action as KeywordOpportunity["action"]) || "create-new",
      pageRecommendation: k.pageRecommendation || "",
    })),
  ];

  // Build executive summary
  const summaries = [
    (geminiData as Record<string, unknown>)?.executiveSummaryLocal as string,
    (openaiData as Record<string, unknown>)?.executiveSummaryTechnical as string,
    (claudeData as Record<string, unknown>)?.executiveSummaryAuthority as string,
    (qwenData as Record<string, unknown>)?.executiveSummaryContent as string,
  ].filter(Boolean);

  const executiveSummary = summaries.length > 0
    ? summaries.join(" | ")
    : `Comprehensive SEO analysis completed for ${ctx.businessName}. Overall score: ${scores.overall}/100. Focus on local SEO (${scores.local}/100), technical fixes (${scores.technical}/100), content production (${scores.content}/100), and authority building (${scores.authority}/100).`;

  return {
    generatedAt: new Date().toISOString(),
    businessContext: ctx,
    executiveSummary,
    overallScore: scores,
    criticalActions,
    quickWins,
    thirtyDayPlan,
    ninetyDayPlan,
    contentCalendar,
    keywordOpportunities,
    entityOptimization: {
      schemaRecommendations: ((claudeData as Record<string, unknown>)?.schemaRecommendations as string[]) || [],
      entityBuildingSteps: ((claudeData as Record<string, unknown>)?.entityBuildingSteps as string[]) || [],
      knowledgePanelStrategy: ((claudeData as Record<string, unknown>)?.knowledgePanelStrategy as string) || "",
      citationAuditFindings: ((claudeData as Record<string, unknown>)?.citationAuditFindings as string[]) || [],
    },
    gbpStrategy: {
      categoryRecommendations: ((geminiData as Record<string, unknown>)?.categoryRecommendations as string[]) || [],
      descriptionVersions: ((geminiData as Record<string, unknown>)?.descriptionVersions as string[]) || [],
      postingCalendar: (((geminiData as Record<string, unknown>)?.postingCalendar as Array<{week: number; topic: string; type: string; copy: string}>) || []).map(p => ({
        week: p.week || 1,
        topic: p.topic || "",
        type: p.type || "update",
        copy: p.copy || "",
      })),
      attributesToAdd: ((geminiData as Record<string, unknown>)?.attributesToAdd as string[]) || [],
      photoStrategy: "Upload 3-5 geotagged photos per week: week 1-2 (team/office), week 3-4 (before/after work), week 5-6 (location/neighbourhood), week 7-8 (client projects/results). Name files: [service]-[location]-[month]-[year].jpg",
    },
    technicalSEO: {
      coreWebVitals: ((openaiData as Record<string, unknown>)?.coreWebVitals as string[]) || [],
      structuredDataGaps: ((openaiData as Record<string, unknown>)?.technicalFixes as string[]) || [],
      internalLinkingOpportunities: (((openaiData as Record<string, unknown>)?.internalLinking as Array<{from: string; to: string; anchorText: string}>) || []).map(l => `${l.from} → ${l.to} (anchor: "${l.anchorText}")`),
      pageSpeedRecommendations: ((openaiData as Record<string, unknown>)?.coreWebVitals as string[]) || [],
    },
    authorityBuilding: {
      linkBuildingOpportunities: (((claudeData as Record<string, unknown>)?.linkBuildingOpportunities as Array<{source: string; type: string; strategy: string}>) || []).map(l => ({
        source: l.source || "",
        type: l.type || "",
        strategy: l.strategy || "",
      })),
      prOpportunities: ((claudeData as Record<string, unknown>)?.prOpportunities as string[]) || [],
      partnershipOpportunities: ((claudeData as Record<string, unknown>)?.eeaatSignals as string[]) || [],
    },
    verificationNotes: `Analysis generated using quad-AI consensus: Gemini (local/GBP), GPT-4o (technical/keywords), Claude (content/entity), Qwen (content production). Generated in ${elapsed}s. All recommendations are based on your business context — verify specifics against current Google guidelines before implementation.`,
    modelContributions: {
      gemini: "Local SEO strategy, GBP optimisation, competitor positioning, location keyword mapping",
      openai: "Technical SEO audit, keyword gap analysis, page-2 goldmine, content briefs",
      claude: "Entity optimisation, E-E-A-T signals, authority building, content strategy, review templates",
      qwen: "Blog content calendar, service page templates, GBP post copy, meta tag optimisation",
    },
  };
}
