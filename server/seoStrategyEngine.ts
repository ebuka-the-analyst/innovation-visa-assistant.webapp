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
import { GoogleGenAI } from "@google/genai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || "",
});

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
  // Extended context
  domainAuthority?: number;
  estimatedBacklinks?: number;
  topPerformingPages?: string[];
  publishingFrequency?: string;
  uniqueSellingProposition?: string;
  businessStage?: string;
  socialMediaChannels?: string[];
  knownTechnicalIssues?: string[];
  targetCountries?: string[];
  conversionGoal?: string;
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
    eeaatSignals: string[];
  };
  gbpStrategy: {
    categoryRecommendations: string[];
    descriptionVersions: string[];
    postingCalendar: {
      week: number;
      topic: string;
      type: string;
      copy: string;
    }[];
    attributesToAdd: string[];
    photoStrategy: string;
  };
  technicalSEO: {
    coreWebVitals: string[];
    structuredDataGaps: string[];
    internalLinkingOpportunities: string[];
    pageSpeedRecommendations: string[];
    technicalAuditChecklist: string[];
    newPagesNeeded: {
      urlSlug: string;
      titleTag: string;
      h1: string;
      metaDescription: string;
      contentOutline: string[];
    }[];
  };
  authorityBuilding: {
    linkBuildingOpportunities: {
      source: string;
      type: string;
      strategy: string;
    }[];
    prOpportunities: string[];
    partnershipOpportunities: string[];
    reviewRequestScript: string;
    reviewResponseTemplates: {
      fiveStar: string;
      fourStar: string;
      threeStar: string;
      oneTwo: string;
    };
  };
  competitorGap: {
    topicGaps: {
      topic: string;
      competitorRanking: string;
      yourAction: string;
    }[];
    contentGaps: string[];
    keywordGaps: string[];
    differentiationAngles: string[];
  };
  featuredSnippets: {
    opportunities: {
      query: string;
      snippetType: string;
      contentFormat: string;
      answer: string;
    }[];
    voiceSearchQuestions: string[];
    peopleAlsoAsk: string[];
  };
  internationalSEO: {
    countryStrategy: {
      country: string;
      language: string;
      priority: string;
      keyActions: string[];
    }[];
    hreflangRecommendations: string[];
    currencyAndLocalisation: string[];
  };
  cro: {
    landingPageRecommendations: {
      page: string;
      issue: string;
      fix: string;
      expectedImpact: string;
    }[];
    ctaOptimisation: string[];
    trustSignals: string[];
    funnelImprovements: string[];
  };
  faqLibrary: { question: string; answer: string }[];
  contentPillars: { pillar: string; supportingTopics: string[] }[];
  homepageCopy: {
    headline: string;
    subheadline: string;
    ctaText: string;
    valueProp: string;
    servicesOverview: string;
    socialProof: string;
  };
  metaTags: { page: string; titleTag: string; metaDescription: string }[];
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
- USP: ${ctx.uniqueSellingProposition || "Not provided"}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Target Locations: ${ctx.targetLocations.join(", ")}
- Target Countries: ${ctx.targetCountries?.join(", ") || "UK"}
- Competitors: ${ctx.competitors.join(", ")}
- Current Traffic: ${ctx.currentMonthlyTraffic || "Unknown"} monthly visits
- Domain Authority: ${ctx.domainAuthority || "Unknown"}/100
- Estimated Backlinks: ${ctx.estimatedBacklinks || "Unknown"}
- Business Stage: ${ctx.businessStage || "Not specified"}
- Current Problem: ${ctx.biggestSEOProblem || "Not specified"}
- Conversion Goal: ${ctx.conversionGoal || "Not specified"}

Analyse and produce a comprehensive LOCAL SEO + GBP + COMPETITOR GAP strategy:

1. GBP CATEGORY AUDIT: Primary + secondary GBP categories (5+).

2. GBP DESCRIPTION: 3 versions (keyword-focused, conversion-focused, trust-focused), each under 750 characters.

3. GBP POSTING CALENDAR: 8-week calendar, 2 posts per week. Full copy (100-150 words) + CTA per post.

4. GBP ATTRIBUTES: All attributes that should be enabled.

5. COMPETITOR POSITIONING: Identify 5 specific content/keyword gaps vs each competitor. What topics do they rank for that you don't?

6. LOCAL KEYWORD MAP: Top 20 keywords by buyer intent (ready-to-hire → problem-aware).

7. LOCATION PAGES: Service+location page combinations for target locations/countries.

8. COMPETITOR CONTENT GAP: Specific blog/page topics competitors rank for that this business should create immediately. For each gap: topic, which competitor ranks for it, recommended page title, target keyword.

9. DIFFERENTIATION ANGLES: 5 unique angles this business can own that competitors don't cover.

10. SCORING: Rate: Technical (0-100), Content (0-100), Authority (0-100), Local (0-100).

Return as structured JSON:
{
  "categoryRecommendations": ["Primary: X", "Secondary: Y"],
  "descriptionVersions": ["version1", "version2", "version3"],
  "postingCalendar": [{"week": 1, "post": 1, "type": "update", "topic": "...", "copy": "..."}],
  "attributesToAdd": ["...", "..."],
  "competitorGaps": ["...", "..."],
  "keywordMap": [{"keyword": "...", "intent": "ready-to-hire|solution-aware|problem-aware|research", "action": "optimize-existing|create-new", "page": "..."}],
  "locationPages": [{"location": "...", "service": "...", "urlSlug": "..."}],
  "competitorTopicGaps": [{"topic": "...", "competitorRanking": "...", "yourAction": "...", "suggestedTitle": "...", "targetKeyword": "..."}],
  "differentiationAngles": ["...", "..."],
  "localSEOScore": {"technical": 85, "content": 70, "authority": 60, "local": 75},
  "gbpQuickWins": ["...", "..."],
  "executiveSummaryLocal": "..."
}`;
}

function buildOpenAIPrompt(ctx: SEOBusinessContext): string {
  return `You are a PhD-level technical SEO specialist, keyword strategist, and CRO expert. Your analysis must be surgical, specific, and based on proven SEO principles.

BUSINESS CONTEXT:
- Business: ${ctx.businessName}
- Website: ${ctx.websiteUrl}
- Primary Service: ${ctx.primaryService}
- USP: ${ctx.uniqueSellingProposition || "Not provided"}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Current Rankings: ${ctx.currentRankingKeywords?.join(", ") || "Not provided"}
- Top Performing Pages: ${ctx.topPerformingPages?.join(", ") || "Not provided"}
- Competitors: ${ctx.competitors.join(", ")}
- Domain Authority: ${ctx.domainAuthority || "Unknown"}/100
- Estimated Backlinks: ${ctx.estimatedBacklinks || "Unknown"}
- Known Technical Issues: ${ctx.knownTechnicalIssues?.join(", ") || "Not specified"}
- Publishing Frequency: ${ctx.publishingFrequency || "Not specified"}
- Conversion Goal: ${ctx.conversionGoal || "Not specified"}
- Biggest Problem: ${ctx.biggestSEOProblem || "Not specified"}

Produce a comprehensive TECHNICAL SEO + KEYWORD + FEATURED SNIPPETS + CRO strategy:

1. KEYWORD GAP ANALYSIS: 20 keywords this business should rank for but likely doesn't. Categorise by intent and difficulty.

2. PAGE-2 GOLDMINE: Ranking opportunities (position 11-20) with exact on-page fixes needed.

3. MONEY PAGES NEEDED: URL slug, title tag, H1, meta description, 5-bullet outline for each.

4. CORE WEB VITALS: LCP, FID, CLS improvements for this type of site.

5. INTERNAL LINKING MAP: Key pages and internal linking opportunities.

6. TECHNICAL AUDIT CHECKLIST: 12 most critical technical SEO fixes, prioritised.

7. 30-DAY SPRINT: Week-by-week technical action plan.

8. FEATURED SNIPPET OPPORTUNITIES: Identify 10 specific queries where this business can win position zero. For each: exact query, snippet type (paragraph/list/table), ideal content format, a draft 50-word answer.

9. VOICE SEARCH & AI SEARCH OPTIMISATION: 10 conversational questions people ask voice assistants or AI chatbots about this service. Recommend content format for each.

10. PEOPLE ALSO ASK: 10 PAA questions this business should create dedicated content for.

11. CRO RECOMMENDATIONS: For the top 5 landing pages, identify: main conversion barrier, specific fix, expected impact on conversion rate.

12. CTA OPTIMISATION: 5 specific CTA improvements backed by conversion psychology.

13. TRUST SIGNALS: 8 specific trust signals this website should add to improve conversion.

Return as structured JSON:
{
  "keywordGaps": [{"keyword": "...", "intent": "...", "difficulty": "low|medium|high", "action": "optimize-existing|create-new", "pageRecommendation": "..."}],
  "page2Goldmine": [{"keyword": "...", "estimatedPosition": 15, "fixes": ["...", "..."]}],
  "newPagesNeeded": [{"urlSlug": "...", "titleTag": "...", "h1": "...", "metaDescription": "...", "contentOutline": ["...", "..."]}],
  "coreWebVitals": ["...", "..."],
  "internalLinking": [{"from": "...", "to": "...", "anchorText": "..."}],
  "technicalFixes": ["...", "..."],
  "thirtyDaySprint": [{"week": 1, "actions": ["...", "..."]}],
  "featuredSnippetOpportunities": [{"query": "...", "snippetType": "paragraph|list|table", "contentFormat": "...", "answer": "..."}],
  "voiceSearchQuestions": ["...", "..."],
  "peopleAlsoAsk": ["...", "..."],
  "croRecommendations": [{"page": "...", "issue": "...", "fix": "...", "expectedImpact": "..."}],
  "ctaOptimisation": ["...", "..."],
  "trustSignals": ["...", "..."],
  "funnelImprovements": ["...", "..."],
  "technicalScore": 75,
  "executiveSummaryTechnical": "..."
}`;
}

function buildClaudePrompt(ctx: SEOBusinessContext): string {
  return `You are a PhD-level SEO strategist specialising in content strategy, entity optimisation, authority building, and international SEO. You combine E-E-A-T principles with advanced schema markup, knowledge graph optimisation, and global content localisation.

BUSINESS CONTEXT:
- Business: ${ctx.businessName}
- Website: ${ctx.websiteUrl}
- Primary Service: ${ctx.primaryService}
- USP: ${ctx.uniqueSellingProposition || "Not provided"}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Social Media: ${ctx.socialMediaChannels?.join(", ") || "Not specified"}
- Competitors: ${ctx.competitors.join(", ")}
- Locations: ${ctx.targetLocations.join(", ")}
- Target Countries: ${ctx.targetCountries?.join(", ") || "UK"}
- Business Stage: ${ctx.businessStage || "Not specified"}
- Biggest Problem: ${ctx.biggestSEOProblem || "Not specified"}
- Conversion Goal: ${ctx.conversionGoal || "Not specified"}

Produce a comprehensive CONTENT STRATEGY + ENTITY OPTIMISATION + AUTHORITY BUILDING + INTERNATIONAL SEO report:

1. ENTITY OPTIMISATION:
   - Critical schema markup types for this business
   - Knowledge panel acquisition strategy
   - Entity signals: Wikidata, Crunchbase, LinkedIn, industry directories
   - NAP consistency checklist

2. E-E-A-T SIGNALS: 10 specific ways to demonstrate Experience, Expertise, Authoritativeness, Trustworthiness for this niche. Include author bio recommendations, credentials to display, and trust page structure.

3. CONTENT PILLARS + TOPIC CLUSTERS: 5 content pillars each with 6-8 supporting topics. Include internal linking map.

4. EDITORIAL CALENDAR (12 weeks): One content piece per week with full brief (title, type, keyword, word count, outline).

5. AUTHORITY BUILDING:
   - 12 specific backlink opportunities (not generic — name actual publications, directories, or sites)
   - 5 PR story angles journalists would cover
   - Partnership opportunities

6. REVIEW STRATEGY:
   - Review request email/SMS script (keyword-optimised)
   - Response templates for all star ratings
   - Review velocity strategy

7. FAQ LIBRARY (25 questions): Production-ready Q&As with schema-ready answers. Cover all common questions about this service.

8. INTERNATIONAL SEO STRATEGY:
   - For each target country: language, key cultural adaptations, top 3 local competitors, hreflang setup
   - Country-specific keyword variations
   - Localisation recommendations (currency, date format, trust signals)
   - Recommended subdirectory structure (e.g., /in/ for India, /ng/ for Nigeria)

9. SOCIAL MEDIA SEO INTEGRATION: How to use each social channel to support SEO. LinkedIn, X, YouTube strategies.

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
  "partnershipOpportunities": ["...", "..."],
  "reviewRequestScript": "...",
  "reviewResponseTemplates": {"fiveStar": "...", "fourStar": "...", "threeStar": "...", "oneTwo": "..."},
  "faqPairs": [{"question": "...", "answer": "..."}],
  "internationalStrategy": [{"country": "...", "language": "...", "priority": "high|medium|low", "localCompetitors": ["..."], "keyActions": ["...", "..."], "hreflang": "...", "localisation": ["..."]}],
  "hreflangRecommendations": ["...", "..."],
  "socialMediaSEO": [{"platform": "...", "strategy": "...", "seoImpact": "..."}],
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
- USP: ${ctx.uniqueSellingProposition || "Not provided"}
- Target Keywords: ${ctx.targetKeywords.join(", ")}
- Target Audience: ${ctx.targetAudience}
- Target Locations: ${ctx.targetLocations.join(", ")}
- Target Countries: ${ctx.targetCountries?.join(", ") || "UK"}
- Competitors: ${ctx.competitors.join(", ")}
- Publishing Frequency: ${ctx.publishingFrequency || "Not specified"}
- Social Channels: ${ctx.socialMediaChannels?.join(", ") || "Not specified"}
- Conversion Goal: ${ctx.conversionGoal || "Not specified"}

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
  const response = await fetch(
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          {
            role: "system",
            content:
              "You are a PhD-level SEO strategist and content specialist. Always respond with valid JSON only — no markdown, no explanations, just the JSON object.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Qwen API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content || "{}";
}

function safeParseJSON(raw: string): Record<string, unknown> {
  try {
    // Extract JSON if wrapped in markdown code blocks
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
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

export async function generateSEOStrategy(
  ctx: SEOBusinessContext,
): Promise<SEOStrategyResult> {
  const startTime = Date.now();
  console.log(
    `[SEO Engine] Starting quad-model SEO analysis for: ${ctx.businessName}`,
  );

  // Run all 4 models in parallel
  const [geminiResult, openaiResult, claudeResult, qwenResult] =
    await Promise.allSettled([
      // Gemini: Local SEO + GBP
      (async () => {
        const result = await gemini.models.generateContent({
          model: "gemini-2.5-flash",
          contents: buildGeminiPrompt(ctx),
          config: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        });
        return safeParseJSON(result.text ?? "{}");
      })(),

      // OpenAI: Technical SEO + Keywords
      (async () => {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a PhD-level technical SEO and keyword strategist. Respond with valid JSON only — no markdown, no explanations.",
            },
            { role: "user", content: buildOpenAIPrompt(ctx) },
          ],
          max_tokens: 8000,
          temperature: 0.3,
          response_format: { type: "json_object" },
        });
        return safeParseJSON(response.choices[0].message.content || "{}");
      })(),

      // Claude: Content + Entity + Authority
      (async () => {
        const response = await anthropic.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 16000,
          temperature: 0.3 as number,
          system:
            "You are a PhD-level SEO content strategist and entity optimisation specialist. Respond with valid JSON only — no markdown, no explanations outside the JSON structure.",
          messages: [{ role: "user", content: buildClaudePrompt(ctx) }],
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

  const geminiData =
    geminiResult.status === "fulfilled" ? geminiResult.value : {};
  const openaiData =
    openaiResult.status === "fulfilled" ? openaiResult.value : {};
  const claudeData =
    claudeResult.status === "fulfilled" ? claudeResult.value : {};
  const qwenData = qwenResult.status === "fulfilled" ? qwenResult.value : {};

  if (geminiResult.status === "rejected")
    console.error("[SEO Engine] Gemini failed:", geminiResult.reason);
  if (openaiResult.status === "rejected")
    console.error("[SEO Engine] OpenAI failed:", openaiResult.reason);
  if (claudeResult.status === "rejected")
    console.error("[SEO Engine] Claude failed:", claudeResult.reason);
  if (qwenResult.status === "rejected")
    console.error("[SEO Engine] Qwen failed:", qwenResult.reason);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[SEO Engine] All models completed in ${elapsed}s`);

  // Score aggregation
  const scores = {
    technical:
      Number((openaiData as Record<string, unknown>)?.technicalScore) || 65,
    content: Number((qwenData as Record<string, unknown>)?.contentScore) || 60,
    authority:
      Number((claudeData as Record<string, unknown>)?.authorityScore) || 55,
    local:
      (
        (geminiData as Record<string, unknown>)?.localSEOScore as Record<
          string,
          number
        >
      )?.local || 70,
    overall: 0,
  };
  scores.overall = Math.round(
    (scores.technical + scores.content + scores.authority + scores.local) / 4,
  );

  // Build critical actions from all models
  const criticalActions: SEOAction[] = [
    ...(
      ((geminiData as Record<string, unknown>)?.gbpQuickWins as string[]) || []
    )
      .slice(0, 3)
      .map((a: string) => ({
        priority: "critical" as const,
        category: "Local SEO / GBP",
        action: a,
        impact: "High visibility improvement in Google Maps pack",
        effort: "quick-win" as const,
        metric: "GBP impressions + map pack ranking",
      })),
    ...(
      ((openaiData as Record<string, unknown>)?.technicalFixes as string[]) ||
      []
    )
      .slice(0, 3)
      .map((a: string) => ({
        priority: "high" as const,
        category: "Technical SEO",
        action: a,
        impact: "Improved crawlability and indexing",
        effort: "week" as const,
        metric: "Core Web Vitals scores + indexing coverage",
      })),
  ];

  // Quick wins
  const quickWins: SEOAction[] = [
    ...(
      ((openaiData as Record<string, unknown>)?.page2Goldmine as Array<{
        keyword: string;
        estimatedPosition: number;
        fixes: string[];
      }>) || []
    )
      .slice(0, 5)
      .map((item) => ({
        priority: "high" as const,
        category: "Page-2 Keywords",
        action: `Optimise for "${item.keyword}" (currently ~pos ${item.estimatedPosition}): ${item.fixes?.slice(0, 2).join("; ")}`,
        impact: "Move from page 2 to page 1 — 5-10x click increase",
        effort: "week" as const,
        metric: `Ranking position for "${item.keyword}"`,
      })),
  ];

  // 30-day plan from OpenAI sprint
  const thirtyDayPlan: SEOAction[] = (
    ((openaiData as Record<string, unknown>)?.thirtyDaySprint as Array<{
      week: number;
      actions: string[];
    }>) || []
  ).flatMap((week) =>
    (week.actions || []).map((action: string) => ({
      priority: "medium" as const,
      category: `Week ${week.week} Technical`,
      action,
      impact: "Compounding SEO improvement",
      effort: "week" as const,
      metric: "Organic rankings + traffic",
    })),
  );

  // 90-day plan from Claude's editorial calendar (weeks 7-12) + entity building steps + link building
  const claudeEditorial =
    ((claudeData as Record<string, unknown>)?.twelveWeekEditorial as Array<{
      week: number;
      title: string;
      type: string;
      targetKeyword: string;
    }>) || [];
  const claudeEntitySteps =
    ((claudeData as Record<string, unknown>)
      ?.entityBuildingSteps as string[]) || [];
  const claudeLinkBuilding =
    ((claudeData as Record<string, unknown>)
      ?.linkBuildingOpportunities as Array<{
      source: string;
      type: string;
      strategy: string;
    }>) || [];
  const claudePR =
    ((claudeData as Record<string, unknown>)?.prOpportunities as string[]) ||
    [];

  const ninetyDayPlan: SEOAction[] = [
    // Weeks 7-12 from editorial calendar
    ...claudeEditorial
      .filter((i) => i.week >= 7)
      .slice(0, 4)
      .map((item) => ({
        priority: "medium" as const,
        category: `Week ${item.week} Content`,
        action: `Publish: "${item.title}" (${item.type}) — targeting "${item.targetKeyword}"`,
        impact: "Topical authority and organic traffic compound growth",
        effort: "month" as const,
        metric: `Ranking + organic traffic for "${item.targetKeyword}"`,
      })),
    // Entity building steps
    ...claudeEntitySteps.slice(0, 4).map((step: string) => ({
      priority: "medium" as const,
      category: "Entity & Authority",
      action: step,
      impact: "Knowledge panel acquisition and branded search growth",
      effort: "quarter" as const,
      metric: "Domain authority + branded searches",
    })),
    // Link building
    ...claudeLinkBuilding.slice(0, 4).map((l) => ({
      priority: "medium" as const,
      category: "Link Building",
      action: `${l.type}: ${l.source} — ${l.strategy}`,
      impact: "Domain authority improvement",
      effort: "month" as const,
      metric: "Referring domains + DA score",
    })),
    // PR opportunities
    ...claudePR.slice(0, 3).map((pr: string) => ({
      priority: "low" as const,
      category: "PR & Media",
      action: pr,
      impact: "High-authority backlinks + brand awareness",
      effort: "quarter" as const,
      metric: "Press mentions + editorial links",
    })),
  ];

  // Content calendar from Qwen (blog) + Claude (12-week editorial)
  const contentCalendar: ContentPiece[] = [
    ...(
      ((qwenData as Record<string, unknown>)?.blogCalendar as Array<{
        weekNumber: number;
        title: string;
        targetKeyword: string;
        outline: string[];
        wordCount: number;
      }>) || []
    )
      .slice(0, 8)
      .map((item) => ({
        title: item.title,
        type: "blog" as const,
        targetKeyword: item.targetKeyword,
        outline: item.outline || [],
        wordCount: item.wordCount || 1500,
        weekNumber: item.weekNumber,
      })),
    ...(
      ((claudeData as Record<string, unknown>)?.twelveWeekEditorial as Array<{
        week: number;
        title: string;
        type: string;
        targetKeyword: string;
        outline: string[];
        wordCount: number;
      }>) || []
    )
      .slice(0, 4)
      .map((item) => ({
        title: item.title,
        type: (item.type as ContentPiece["type"]) || "blog",
        targetKeyword: item.targetKeyword,
        outline: item.outline || [],
        wordCount: item.wordCount || 1500,
        weekNumber: item.week,
      })),
    ...(
      ((qwenData as Record<string, unknown>)?.servicePages as Array<{
        pageName: string;
        urlSlug: string;
        h1: string;
      }>) || []
    )
      .slice(0, 3)
      .map((sp) => ({
        title: sp.pageName,
        type: "service-page" as const,
        targetKeyword: sp.h1,
        outline: [],
        wordCount: 800,
      })),
  ];

  // Keyword opportunities from both Gemini and OpenAI
  const keywordOpportunities: KeywordOpportunity[] = [
    ...(
      ((geminiData as Record<string, unknown>)?.keywordMap as Array<{
        keyword: string;
        intent: string;
        action: string;
        page: string;
      }>) || []
    )
      .slice(0, 10)
      .map((k) => ({
        keyword: k.keyword,
        intent: (k.intent as KeywordOpportunity["intent"]) || "solution-aware",
        difficulty: "medium" as const,
        action:
          (k.action as KeywordOpportunity["action"]) || "optimize-existing",
        pageRecommendation: k.page || "",
      })),
    ...(
      ((openaiData as Record<string, unknown>)?.keywordGaps as Array<{
        keyword: string;
        intent: string;
        difficulty: string;
        action: string;
        pageRecommendation: string;
      }>) || []
    )
      .slice(0, 10)
      .map((k) => ({
        keyword: k.keyword,
        intent: (k.intent as KeywordOpportunity["intent"]) || "problem-aware",
        difficulty:
          (k.difficulty as KeywordOpportunity["difficulty"]) || "medium",
        action: (k.action as KeywordOpportunity["action"]) || "create-new",
        pageRecommendation: k.pageRecommendation || "",
      })),
  ];

  // Build executive summary
  const summaries = [
    (geminiData as Record<string, unknown>)?.executiveSummaryLocal as string,
    (openaiData as Record<string, unknown>)
      ?.executiveSummaryTechnical as string,
    (claudeData as Record<string, unknown>)
      ?.executiveSummaryAuthority as string,
    (qwenData as Record<string, unknown>)?.executiveSummaryContent as string,
  ].filter(Boolean);

  const executiveSummary =
    summaries.length > 0
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
      schemaRecommendations:
        ((claudeData as Record<string, unknown>)
          ?.schemaRecommendations as string[]) || [],
      entityBuildingSteps:
        ((claudeData as Record<string, unknown>)
          ?.entityBuildingSteps as string[]) || [],
      knowledgePanelStrategy:
        ((claudeData as Record<string, unknown>)
          ?.knowledgePanelStrategy as string) || "",
      citationAuditFindings:
        ((claudeData as Record<string, unknown>)
          ?.citationAuditFindings as string[]) || [],
      eeaatSignals:
        ((claudeData as Record<string, unknown>)?.eeaatSignals as string[]) ||
        [],
    },
    gbpStrategy: {
      categoryRecommendations:
        ((geminiData as Record<string, unknown>)
          ?.categoryRecommendations as string[]) || [],
      descriptionVersions:
        ((geminiData as Record<string, unknown>)
          ?.descriptionVersions as string[]) || [],
      postingCalendar: (() => {
        const geminiPosts =
          ((geminiData as Record<string, unknown>)?.postingCalendar as Array<
            Record<string, unknown>
          >) || [];
        const qwenPosts =
          ((qwenData as Record<string, unknown>)?.gbpPosts as Array<
            Record<string, unknown>
          >) || [];
        const source = geminiPosts.length > 0 ? geminiPosts : qwenPosts;
        return source.map((p) => ({
          week: Number(p.week) || 1,
          topic: (p.topic as string) || (p.type as string) || "GBP Update",
          type: (p.type as string) || "update",
          copy: (p.copy as string) || "",
        }));
      })(),
      attributesToAdd:
        ((geminiData as Record<string, unknown>)
          ?.attributesToAdd as string[]) || [],
      photoStrategy:
        "Upload 3-5 geotagged photos per week: week 1-2 (team/office), week 3-4 (before/after work), week 5-6 (location/neighbourhood), week 7-8 (client projects/results). Name files: [service]-[location]-[month]-[year].jpg",
    },
    technicalSEO: {
      coreWebVitals:
        ((openaiData as Record<string, unknown>)?.coreWebVitals as string[]) ||
        [],
      structuredDataGaps:
        ((openaiData as Record<string, unknown>)?.technicalFixes as string[]) ||
        [],
      internalLinkingOpportunities: (
        ((openaiData as Record<string, unknown>)?.internalLinking as Array<{
          from: string;
          to: string;
          anchorText: string;
        }>) || []
      ).map((l) => `${l.from} → ${l.to} (anchor: "${l.anchorText}")`),
      pageSpeedRecommendations:
        ((openaiData as Record<string, unknown>)?.coreWebVitals as string[]) ||
        [],
      technicalAuditChecklist:
        ((openaiData as Record<string, unknown>)?.technicalFixes as string[]) ||
        [],
      newPagesNeeded:
        ((openaiData as Record<string, unknown>)?.newPagesNeeded as {
          urlSlug: string;
          titleTag: string;
          h1: string;
          metaDescription: string;
          contentOutline: string[];
        }[]) || [],
    },
    authorityBuilding: {
      linkBuildingOpportunities: (
        ((claudeData as Record<string, unknown>)
          ?.linkBuildingOpportunities as Array<{
          source: string;
          type: string;
          strategy: string;
        }>) || []
      ).map((l) => ({
        source: l.source || "",
        type: l.type || "",
        strategy: l.strategy || "",
      })),
      prOpportunities:
        ((claudeData as Record<string, unknown>)
          ?.prOpportunities as string[]) || [],
      partnershipOpportunities:
        ((claudeData as Record<string, unknown>)
          ?.partnershipOpportunities as string[]) || [],
      reviewRequestScript:
        ((claudeData as Record<string, unknown>)
          ?.reviewRequestScript as string) || "",
      reviewResponseTemplates: ((claudeData as Record<string, unknown>)
        ?.reviewResponseTemplates as {
        fiveStar: string;
        fourStar: string;
        threeStar: string;
        oneTwo: string;
      }) || { fiveStar: "", fourStar: "", threeStar: "", oneTwo: "" },
    },
    competitorGap: {
      topicGaps: (
        ((geminiData as Record<string, unknown>)?.competitorTopicGaps as Array<{
          topic: string;
          competitorRanking: string;
          yourAction: string;
        }>) || []
      ).map((g) => ({
        topic: g.topic || "",
        competitorRanking: g.competitorRanking || "",
        yourAction: g.yourAction || "",
      })),
      contentGaps:
        ((geminiData as Record<string, unknown>)?.competitorGaps as string[]) ||
        [],
      keywordGaps: (
        ((openaiData as Record<string, unknown>)?.keywordGaps as Array<{
          keyword: string;
        }>) || []
      )
        .slice(0, 10)
        .map((k) => k.keyword),
      differentiationAngles:
        ((geminiData as Record<string, unknown>)
          ?.differentiationAngles as string[]) || [],
    },
    featuredSnippets: {
      opportunities:
        ((openaiData as Record<string, unknown>)
          ?.featuredSnippetOpportunities as {
          query: string;
          snippetType: string;
          contentFormat: string;
          answer: string;
        }[]) || [],
      voiceSearchQuestions:
        ((openaiData as Record<string, unknown>)
          ?.voiceSearchQuestions as string[]) || [],
      peopleAlsoAsk:
        ((openaiData as Record<string, unknown>)?.peopleAlsoAsk as string[]) ||
        [],
    },
    internationalSEO: {
      countryStrategy: (
        ((claudeData as Record<string, unknown>)
          ?.internationalStrategy as Array<{
          country: string;
          language: string;
          priority: string;
          keyActions: string[];
        }>) || []
      ).map((c) => ({
        country: c.country || "",
        language: c.language || "",
        priority: c.priority || "medium",
        keyActions: c.keyActions || [],
      })),
      hreflangRecommendations:
        ((claudeData as Record<string, unknown>)
          ?.hreflangRecommendations as string[]) || [],
      currencyAndLocalisation: [],
    },
    cro: {
      landingPageRecommendations:
        ((openaiData as Record<string, unknown>)?.croRecommendations as {
          page: string;
          issue: string;
          fix: string;
          expectedImpact: string;
        }[]) || [],
      ctaOptimisation:
        ((openaiData as Record<string, unknown>)
          ?.ctaOptimisation as string[]) || [],
      trustSignals:
        ((openaiData as Record<string, unknown>)?.trustSignals as string[]) ||
        [],
      funnelImprovements:
        ((openaiData as Record<string, unknown>)
          ?.funnelImprovements as string[]) || [],
    },
    faqLibrary:
      ((claudeData as Record<string, unknown>)?.faqPairs as {
        question: string;
        answer: string;
      }[]) || [],
    contentPillars:
      ((claudeData as Record<string, unknown>)?.contentPillars as {
        pillar: string;
        supportingTopics: string[];
      }[]) || [],
    homepageCopy: ((qwenData as Record<string, unknown>)?.homepageCopy as {
      headline: string;
      subheadline: string;
      ctaText: string;
      valueProp: string;
      servicesOverview: string;
      socialProof: string;
    }) || {
      headline: "",
      subheadline: "",
      ctaText: "",
      valueProp: "",
      servicesOverview: "",
      socialProof: "",
    },
    metaTags:
      ((qwenData as Record<string, unknown>)?.metaTags as {
        page: string;
        titleTag: string;
        metaDescription: string;
      }[]) || [],
    verificationNotes: `Analysis generated using quad-AI consensus: Gemini (local/GBP + competitor gap), GPT-4o (technical + featured snippets + CRO), Claude (content + entity + international SEO), Qwen (content production + homepage copy). Generated in ${elapsed}s. All recommendations are based on your business context — verify specifics against current Google guidelines before implementation.`,
    modelContributions: {
      gemini:
        "Local SEO, GBP optimisation, competitor gap analysis, differentiation angles, location keyword mapping",
      openai:
        "Technical SEO, keyword gaps, featured snippets, voice search, CRO recommendations, trust signals",
      claude:
        "Entity optimisation, E-E-A-T signals, content pillars, authority building, international SEO, FAQ library, review templates",
      qwen: "Blog calendar, service page templates, GBP posts, meta tags, homepage copy",
    },
  };
}
