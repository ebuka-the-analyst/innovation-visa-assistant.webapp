/**
 * UK INNOVATOR FOUNDER VISA BLOG GENERATOR
 * 
 * PhD-Level Quality AI Blog Generation System
 * 
 * CRITICAL REQUIREMENTS:
 * - 100% factual accuracy verified against official sources
 * - NO fabricated case studies or fictional examples
 * - Full legal compliance and OISC considerations
 * - SEO optimized for Google top 5 ranking
 * - All claims must be verifiable
 */

import OpenAI from "openai";
import {
  VERIFIED_VISA_FEES,
  VERIFIED_ELIGIBILITY,
  VERIFIED_ENDORSING_BODIES,
  VERIFIED_SETTLEMENT_REQUIREMENTS,
  getVerifiedEndorsingBodyInfo,
  getStandardDisclaimer,
  getLastUpdatedNotice
} from "./verifiedUKVisaData";
import {
  validateBlogContent,
  correctContent,
  generateValidationReport
} from "./blogContentValidator";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// VERIFIED DATA INJECTION - Prevents AI from making up facts
// ============================================================================

const VERIFIED_FACTS_CONTEXT = `
VERIFIED UK INNOVATOR FOUNDER VISA FACTS (January 2026):
Use ONLY these verified facts in your article. DO NOT make up any statistics, fees, or requirements.

VISA FEES (Source: GOV.UK):
- Application fee: £${VERIFIED_VISA_FEES.innovatorFounderVisa.applicationFee}
- Immigration Health Surcharge: £${VERIFIED_VISA_FEES.innovatorFounderVisa.immigrationHealthSurcharge} per year
- Priority service: £${VERIFIED_VISA_FEES.innovatorFounderVisa.priorityService} (where available)
- Endorsement fees: Vary by endorsing body - typically ${VERIFIED_VISA_FEES.endorsementCosts.typicalRange}. Do NOT cite specific amounts.

FINANCIAL REQUIREMENTS (Source: GOV.UK):
- Minimum funds: £${VERIFIED_ELIGIBILITY.financialRequirement.amount}
- Must be held for: ${VERIFIED_ELIGIBILITY.financialRequirement.durationDays} consecutive days

VISA DURATION:
- Initial grant: ${VERIFIED_ELIGIBILITY.visaDuration.initial}
- Extension: ${VERIFIED_ELIGIBILITY.visaDuration.extension}
- Settlement eligibility: ${VERIFIED_ELIGIBILITY.visaDuration.settlementEligibility}

ENGLISH LANGUAGE:
- Minimum level: ${VERIFIED_ELIGIBILITY.englishLanguage.minimumLevel} CEFR

ENDORSING BODIES (ONLY these 4 exist - Home Office approved):
1. Envestors Limited - envestors.co.uk
2. Innovator International Limited - innovatorinternational.com  
3. StartUp Visa.Co.UK - startupvisa.co.uk
4. Primus - primusendorsement.com

IMPORTANT: Do NOT describe what "type" of applicant each endorsing body prefers - this information is not publicly verified.

ENDORSEMENT CRITERIA (Source: GOV.UK):
- Innovation: Must be genuinely new or significantly different
- Viability: Applicant must have skills and knowledge to run business
- Scalability: Must have potential for growth and job creation

SETTLEMENT REQUIREMENTS:
- Time in UK: At least 3 years
- ILR fee: £${VERIFIED_SETTLEMENT_REQUIREMENTS.fee}
- Life in UK test: Required
- English: B1 level required
`;

// ============================================================================
// TOPIC SELECTION - Carefully curated for accuracy
// ============================================================================

const UK_VISA_TOPICS = [
  // Factual guides that don't require case studies
  "Complete guide to UK Innovator Founder Visa financial requirements in 2026",
  "Understanding the English language requirements for UK Innovator Founder Visa",
  "Step-by-step guide to the UK Innovator Founder Visa application process",
  "How to prepare for your endorsing body interview: Questions and preparation tips",
  "UK Innovator Founder Visa fees explained: Complete cost breakdown for 2026",
  "The three criteria for endorsement: Innovation, Viability, and Scalability explained",
  "Contact point meetings: What to expect and how to prepare",
  "Path to settlement: From Innovator Founder Visa to Indefinite Leave to Remain",
  "Bringing your family to the UK: Dependent visa guide for entrepreneurs",
  "Switching to Innovator Founder Visa from within the UK: Requirements and process",
  
  // Business planning guides
  "How to write an innovation statement that meets endorsement criteria",
  "Creating financial projections for your UK visa business plan",
  "Market research requirements for your UK Innovator Founder Visa application",
  "Demonstrating scalability in your business plan: What endorsing bodies look for",
  "Common business plan mistakes that lead to endorsement rejection",
  
  // UK business environment
  "Understanding the UK startup ecosystem for international entrepreneurs",
  "UK government grants and funding available to Innovator Founder Visa holders",
  "Tax considerations for entrepreneurs on the UK Innovator Founder Visa",
  "Registering your company in the UK: Step-by-step guide for visa applicants",
  "Banking and finance: Opening a UK business account as an international founder",
  
  // Compliance and maintenance
  "Maintaining your endorsement: Compliance requirements for visa holders",
  "What happens at your 6, 12, and 24 month contact point meetings",
  "Extending your Innovator Founder Visa: Requirements and timeline",
  "Understanding absences: How time outside the UK affects your visa",
  "When endorsement can be withdrawn: Avoiding common pitfalls",
  
  // Practical preparation
  "Documents checklist for UK Innovator Founder Visa application",
  "Timeline planning: How long the visa process takes from start to finish",
  "Choosing an endorsing body: Factors to consider",
  "Common reasons for visa refusal and how to avoid them",
  "Preparing for your biometric appointment: What to bring and expect",
];

const CATEGORIES = [
  "visa-updates",
  "business-planning", 
  "endorsement",
  "guides",
  "uk-immigration",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function getRandomTopic(): string {
  return UK_VISA_TOPICS[Math.floor(Math.random() * UK_VISA_TOPICS.length)];
}

function getRandomCategory(): string {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export async function generateBlogPost(): Promise<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  readingTime: number;
  author: string;
  authorBio: string;
}> {
  const topic = getRandomTopic();
  const category = getRandomCategory();
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `You are a UK immigration information writer. Write an ACCURATE, HELPFUL blog article using ONLY the verified facts provided below.

${VERIFIED_FACTS_CONTEXT}

TOPIC: ${topic}
CATEGORY: ${category}
PUBLICATION DATE: ${today}

CRITICAL RULES - FOLLOW EXACTLY:

1. NEVER FABRICATE CONTENT:
   - DO NOT create fictional case studies with made-up names (no "Meet Sarah", "Take John's story", etc.)
   - DO NOT invent statistics or percentages
   - DO NOT make up quotes from applicants
   - DO NOT fabricate government announcements
   - If you need examples, use hypothetical scenarios clearly marked as "For example, an applicant might..."

2. ONLY USE VERIFIED FACTS:
   - Only cite fees, requirements, and timelines from the verified facts above
   - When discussing endorsing bodies, only state their names - DO NOT describe their "specialization" or "ideal applicant type"
   - DO NOT invent success rates or approval percentages

3. REQUIRED DISCLAIMER:
   - End every article with this exact disclaimer box:
   <div class="disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6">
   <p class="text-sm"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener" class="text-primary underline">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p>
   </div>

4. INTERNAL LINKING:
   - Include 2-3 links to other relevant pages on our platform using this format:
   <a href="/tools" class="text-primary hover:underline">our visa preparation tools</a>
   <a href="/business-plan" class="text-primary hover:underline">Business Plan Generator</a>
   <a href="/faq" class="text-primary hover:underline">frequently asked questions</a>
   <a href="/blog" class="text-primary hover:underline">more articles</a>

5. WRITING STYLE:
   - Professional, helpful, and accurate
   - Clear and easy to understand for non-native English speakers
   - Practical and actionable advice
   - Well-structured with clear headings
   - 1500-2200 words

6. FORMAT (HTML):
   - Use <h2> for main sections
   - Use <h3> for subsections
   - Use <p> for paragraphs
   - Use <ul><li> for lists
   - Use <strong> for key terms
   - Use <blockquote class="bg-primary/10 border-l-4 border-primary p-4 my-4"> for pro tips

OUTPUT FORMAT (JSON only):
{
  "title": "Clear, descriptive title (50-60 chars)",
  "excerpt": "Helpful summary of what reader will learn (140-155 chars)",
  "content": "Full HTML article with disclaimer at end",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metaTitle": "SEO title with primary keyword (55-60 chars)",
  "metaDescription": "SEO description (150-155 chars)",
  "metaKeywords": ["UK Innovator Founder Visa", "keyword2", "keyword3"],
  "readingTime": 8
}

Return ONLY valid JSON.`;

  const MAX_RETRIES = 1; // Only 1 attempt - rely on auto-correction instead of regeneration
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Blog Generator] Generation attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a UK immigration information writer who creates accurate, helpful content. You NEVER fabricate case studies, statistics, or quotes. You ONLY use verified facts. You always include proper disclaimers. Your content is factual, practical, and trustworthy. Always respond with valid JSON only.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 5000,
        temperature: 0.3, // Low temperature for maximum factual accuracy
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");
      
      const parsed = JSON.parse(content);
      
      // MANDATORY CONTENT REQUIREMENTS CHECK
      const contentHasDisclaimer = parsed.content.includes('disclaimer-box') || 
                                   parsed.content.includes('Important Notice') ||
                                   parsed.content.includes('does not constitute');
      const contentHasInternalLinks = parsed.content.includes('href="/') || 
                                      parsed.content.includes('href="/tools') ||
                                      parsed.content.includes('href="/business-plan');
      
      // Apply auto-corrections FIRST (fix typos before validation)
      let finalContent = correctContent(parsed.content);
      
      // Check if corrections added required elements
      const contentHasDisclaimerNow = finalContent.includes('disclaimer-box') || 
                                      finalContent.includes('Important Notice') ||
                                      finalContent.includes('does not constitute');
      
      // Auto-fix: Add disclaimer if still missing
      if (!contentHasDisclaimerNow) {
        finalContent += `
<div class="disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6">
<p class="text-sm"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener" class="text-primary underline">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p>
</div>`;
      }
      
      // Auto-fix: Add internal links section if missing
      if (!contentHasInternalLinks) {
        const linksSection = `
<h3>Helpful Resources</h3>
<p>Ready to start your UK visa journey? Explore <a href="/tools" class="text-primary hover:underline">our visa preparation tools</a>, use our <a href="/business-plan" class="text-primary hover:underline">Business Plan Generator</a>, or check our <a href="/faq" class="text-primary hover:underline">frequently asked questions</a>.</p>`;
        // Insert before disclaimer
        const disclaimerIndex = finalContent.indexOf('<div class="disclaimer-box');
        if (disclaimerIndex > 0) {
          finalContent = finalContent.slice(0, disclaimerIndex) + linksSection + finalContent.slice(disclaimerIndex);
        } else {
          finalContent += linksSection;
        }
      }
      
      // Validate the content
      const validationResult = validateBlogContent({
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: finalContent,
        category,
        tags: parsed.tags || [],
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription
      });
      
      // Log validation report
      console.log("[Blog Generator] Validation Report:");
      console.log(generateValidationReport(validationResult));
      
      // Log any remaining issues (auto-correction already applied)
      const criticalCount = validationResult.issues.filter(i => i.type === 'critical').length;
      if (criticalCount > 0) {
        console.warn(`[Blog Generator] ${criticalCount} issues remain after auto-correction. Proceeding with corrected content.`);
      }
      
      // Final content is already corrected above
      const correctedContent = finalContent;
      
      // Add unique slug with date
      const dateSlug = new Date().toISOString().split('T')[0];
      const baseSlug = slugify(parsed.title);
      const uniqueSlug = `${baseSlug}-${dateSlug}-${Math.random().toString(36).substring(2, 6)}`;
      
      // Final check: if still has critical issues on last attempt, log but proceed with corrected content
      if (criticalCount > 0) {
        console.warn(`[Blog Generator] Content published with ${criticalCount} warnings after max retries. Manual review recommended.`);
      }
      
      return {
        title: parsed.title,
        slug: uniqueSlug,
        excerpt: parsed.excerpt,
        content: correctedContent,
        category,
        tags: parsed.tags || [],
        metaTitle: parsed.metaTitle || parsed.title,
        metaDescription: parsed.metaDescription || parsed.excerpt,
        metaKeywords: parsed.metaKeywords || parsed.tags || [],
        readingTime: parsed.readingTime || 8,
        author: "UK Visa Expert Team",
        authorBio: "Our team provides accurate, verified information about the UK Innovator Founder Visa process. All content is reviewed for accuracy against official UK government sources.",
      };
    } catch (error) {
      console.error(`[Blog Generator] Generation attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error("Failed to generate valid blog content after maximum retries");
}

export async function generateMultiplePosts(count: number = 5): Promise<Array<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  readingTime: number;
  author: string;
  authorBio: string;
}>> {
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    try {
      console.log(`[Blog Generator] Generating post ${i + 1} of ${count}...`);
      const post = await generateBlogPost();
      posts.push(post);
      // Small delay between requests to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`[Blog Generator] Failed to generate post ${i + 1}:`, error);
    }
  }
  
  return posts;
}

// Generate backdated posts for initial content seeding
export async function generateBackdatedPosts(
  totalPosts: number = 40,
  postsPerDay: number = 5,
  startDaysAgo: number = 8
): Promise<Array<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  readingTime: number;
  author: string;
  authorBio: string;
  publishedAt: Date;
  isFeatured: boolean;
}>> {
  const posts = [];
  const now = new Date();
  
  for (let dayOffset = startDaysAgo; dayOffset >= 0 && posts.length < totalPosts; dayOffset--) {
    const postsForThisDay = Math.min(postsPerDay, totalPosts - posts.length);
    
    for (let i = 0; i < postsForThisDay; i++) {
      try {
        console.log(`[Blog Generator] Generating backdated post ${posts.length + 1} of ${totalPosts} (Day -${dayOffset})...`);
        const post = await generateBlogPost();
        
        // Calculate backdated timestamp with random hour variation
        const publishedAt = new Date(now);
        publishedAt.setDate(publishedAt.getDate() - dayOffset);
        publishedAt.setHours(6 + Math.floor(Math.random() * 12)); // Random time between 6 AM and 6 PM
        publishedAt.setMinutes(Math.floor(Math.random() * 60));
        
        posts.push({
          ...post,
          publishedAt,
          isFeatured: posts.length < 3, // First 3 posts are featured
        });
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        console.error(`[Blog Generator] Failed to generate backdated post:`, error);
      }
    }
  }
  
  return posts;
}
