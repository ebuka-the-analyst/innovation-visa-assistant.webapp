import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const UK_VISA_TOPICS = [
  // Immigration Updates & Breaking News
  "Latest UK Home Office immigration rule changes and their impact on Innovator Founder Visa applicants",
  "New endorsement requirements for UK Innovator Founder Visa in 2026",
  "Changes to UK visa processing times and what applicants should expect",
  "UK Points-Based Immigration System updates for entrepreneurs",
  "Recent UK policy decisions affecting visa applications",
  "Breaking: UK government announces new support for tech entrepreneurs",
  
  // Business Planning Deep Dives
  "How to write a compelling innovation statement for your UK visa business plan",
  "Financial projections that impress UK visa endorsing bodies",
  "Market research strategies for UK Innovator Founder Visa applications",
  "Creating a 3-year growth roadmap for your UK business plan",
  "Technology innovation requirements for UK Innovator Founder Visa",
  "The secret formula for a winning UK visa business plan",
  "Real examples of successful Innovator Founder Visa business plans",
  
  // Endorsement Insider Guides
  "How to prepare for endorsing body interviews in the UK",
  "Common reasons UK Innovator Founder Visa endorsements get rejected",
  "Tips for scheduling and attending contact point meetings with endorsing bodies",
  "What UK endorsing bodies look for in innovation and scalability",
  "Building relationships with your UK endorsing body for visa success",
  "Insider tips from endorsing body reviewers",
  "The 10 questions every endorsing body will ask you",
  
  // Success Stories & Case Studies
  "From rejection to success: How one founder turned their visa around",
  "How a tech startup from India secured UK Innovator Founder Visa endorsement",
  "Success story: Building a fintech company on the Innovator Founder Visa",
  "From visa application to £1M funding: A founder's journey",
  "How three co-founders successfully applied for UK visas together",
  
  // UK Market & Opportunities
  "Understanding the UK startup ecosystem for international founders",
  "Key sectors thriving in the UK market for innovative businesses",
  "UK tax benefits for startup founders and entrepreneurs",
  "Accessing UK government grants and funding as an Innovator Founder",
  "Building partnerships with UK universities and research institutions",
  "The top 10 UK cities for tech startups in 2026",
  "Why London remains Europe's startup capital",
  
  // Compliance & Long-term Planning
  "Maintaining compliance after receiving your UK Innovator Founder Visa",
  "Understanding your rights and responsibilities as a UK visa holder",
  "Switching between UK visa categories: what you need to know",
  "Preparing for your UK Innovator Founder Visa extension",
  "Path to UK Indefinite Leave to Remain for Innovator Founder Visa holders",
  "What happens when your UK Innovator Founder Visa expires?",
  
  // Practical Guides
  "Step-by-step guide to gathering UK visa documentation",
  "How to calculate your financial requirements for UK visa",
  "English language requirements for UK Innovator Founder Visa explained",
  "Bringing your family to the UK: Dependent visa guide",
  "Setting up your UK business before arriving: A practical guide",
];

const CATEGORIES = [
  "visa-updates",
  "business-planning", 
  "endorsement",
  "success-stories",
  "uk-immigration",
  "guides",
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

  const prompt = `You are a world-class UK immigration journalist and visa expert. Write an ENGAGING, COMPELLING blog article that readers will love.

TOPIC: ${topic}
CATEGORY: ${category}
PUBLICATION DATE: ${today}

WRITING STYLE REQUIREMENTS:
1. START with a HOOK - a compelling opening that grabs attention (story, surprising statistic, or provocative question)
2. Use STORYTELLING - include real-world scenarios, mini case studies, or founder journeys
3. Be CONVERSATIONAL yet authoritative - write like you're advising a friend who's an intelligent professional
4. Include ACTIONABLE INSIGHTS - practical tips readers can use TODAY
5. Add PERSONALITY - use occasional humor, rhetorical questions, and engaging transitions
6. Create SCANNABLE content with clear headers, bullet points, and key takeaways
7. End with a STRONG CONCLUSION and clear next steps

CONTENT REQUIREMENTS:
- Length: 1800-2500 words (comprehensive, not fluffy)
- Use current 2026 UK immigration rules and real requirements
- Include specific numbers: visa fees (£1,191), processing times, endorsement costs (£1,000 + £500 per meeting)
- Reference the 4 active endorsing bodies: Envestors, Innovator International, StartUp Visa.Co.UK, Primus (mention which are relevant)
- Include at least one "Pro Tip" callout box
- Add a "Key Takeaways" section at the end
- Use relatable examples and scenarios

FORMAT (HTML tags allowed):
- Use <h2> for main sections (4-6 sections)
- Use <h3> for subsections
- Use <p> for paragraphs
- Use <ul><li> for lists
- Use <strong> for emphasis
- Use <blockquote> for quotes or pro tips
- Use <em> for subtle emphasis

OUTPUT FORMAT (JSON only, no markdown code blocks):
{
  "title": "Engaging, click-worthy title with emotional hook (55-65 chars)",
  "excerpt": "Compelling summary that makes readers want to click (140-160 chars)",
  "content": "Full HTML article with all formatting",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metaTitle": "SEO-optimized title (55-60 chars)",
  "metaDescription": "SEO meta description with CTA (150-155 chars)",
  "metaKeywords": ["primary keyword", "secondary keyword", "long tail keyword"],
  "readingTime": 10
}

AVOID:
- Generic, boring openings ("In this article, we will discuss...")
- Dry, textbook-style writing
- Vague advice without specifics
- Filler content or padding
- Overly formal or robotic tone

REMEMBER: This article should be so good that readers bookmark it, share it, and come back for more. Make it genuinely valuable and enjoyable to read.

Return ONLY valid JSON, no markdown code blocks.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an award-winning immigration journalist who writes engaging, helpful content for entrepreneurs seeking UK visas. Your articles are known for being both informative AND entertaining - they read like stories while packed with actionable advice. You never write boring content. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 5000,
      temperature: 0.8, // Slightly more creative
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");
    
    const parsed = JSON.parse(content);
    
    // Add unique slug with date
    const dateSlug = new Date().toISOString().split('T')[0];
    const baseSlug = slugify(parsed.title);
    const uniqueSlug = `${baseSlug}-${dateSlug}-${Math.random().toString(36).substring(2, 6)}`;
    
    return {
      title: parsed.title,
      slug: uniqueSlug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      category,
      tags: parsed.tags || [],
      metaTitle: parsed.metaTitle || parsed.title,
      metaDescription: parsed.metaDescription || parsed.excerpt,
      metaKeywords: parsed.metaKeywords || parsed.tags || [],
      readingTime: parsed.readingTime || 10,
      author: "UK Visa Expert Team",
      authorBio: "Our team of immigration specialists and successful founders share expert insights on navigating the UK Innovator Founder Visa process. With combined experience of over 500+ successful applications, we're dedicated to helping entrepreneurs achieve their UK business dreams.",
    };
  } catch (error) {
    console.error("Blog generation error:", error);
    throw error;
  }
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
