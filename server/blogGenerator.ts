import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const UK_VISA_TOPICS = [
  // Immigration Updates
  "Latest UK Home Office immigration rule changes and their impact on Innovator Founder Visa applicants",
  "New endorsement requirements for UK Innovator Founder Visa in 2026",
  "Changes to UK visa processing times and what applicants should expect",
  "UK Points-Based Immigration System updates for entrepreneurs",
  "Recent UK policy decisions affecting visa applications",
  
  // Business Planning
  "How to write a compelling innovation statement for your UK visa business plan",
  "Financial projections that impress UK visa endorsing bodies",
  "Market research strategies for UK Innovator Founder Visa applications",
  "Creating a 3-year growth roadmap for your UK business plan",
  "Technology innovation requirements for UK Innovator Founder Visa",
  
  // Endorsement
  "How to prepare for endorsing body interviews in the UK",
  "Common reasons UK Innovator Founder Visa endorsements get rejected",
  "Tips for scheduling and attending contact point meetings with endorsing bodies",
  "What UK endorsing bodies look for in innovation and scalability",
  "Building relationships with your UK endorsing body for visa success",
  
  // Success Strategies
  "Time management strategies for busy UK visa applicants",
  "How to balance visa application work with running your startup",
  "Building your UK professional network before arriving",
  "Finding the right advisors for your UK Innovator Founder Visa journey",
  "Managing visa application stress effectively",
  
  // UK Market
  "Understanding the UK startup ecosystem for international founders",
  "Key sectors thriving in the UK market for innovative businesses",
  "UK tax benefits for startup founders and entrepreneurs",
  "Accessing UK government grants and funding as an Innovator Founder",
  "Building partnerships with UK universities and research institutions",
  
  // Compliance
  "Maintaining compliance after receiving your UK Innovator Founder Visa",
  "Understanding your rights and responsibilities as a UK visa holder",
  "Switching between UK visa categories: what you need to know",
  "Preparing for your UK Innovator Founder Visa extension",
  "Path to UK Indefinite Leave to Remain for Innovator Founder Visa holders",
];

const CATEGORIES = [
  "visa-updates",
  "business-planning", 
  "endorsement",
  "success-stories",
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
  const today = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const prompt = `You are an expert UK immigration consultant and content writer specializing in the UK Innovator Founder Visa. Write a comprehensive, SEO-optimized blog article.

TOPIC: ${topic}
CATEGORY: ${category}
CURRENT DATE: ${today}

REQUIREMENTS:
1. Write a unique, high-quality article (1500-2000 words)
2. Use current 2026 UK immigration rules and requirements
3. Include practical, actionable advice
4. Reference official UK government sources where relevant
5. Write in a professional but accessible tone
6. Include statistics and data points where relevant
7. Format with proper HTML headings (h2, h3), paragraphs, bullet points, and emphasis

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Engaging, SEO-optimized title (60 chars max)",
  "excerpt": "Compelling summary for preview cards (150 chars)",
  "content": "Full HTML article content with h2, h3, p, ul, li, strong, em tags",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metaTitle": "SEO meta title (60 chars)",
  "metaDescription": "SEO meta description (155 chars)",
  "metaKeywords": ["keyword1", "keyword2", "keyword3"],
  "readingTime": 8
}

IMPORTANT:
- Content must be 100% factual and up-to-date for 2026
- No placeholder text or generic filler content
- Include specific UK visa requirements, fees, timelines
- Reference real UK government policies and procedures
- Make it genuinely helpful for visa applicants

Return ONLY valid JSON, no markdown code blocks.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a UK immigration expert who writes detailed, accurate blog articles about the UK Innovator Founder Visa. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");
    
    const parsed = JSON.parse(content);
    
    const timestamp = Date.now();
    const baseSlug = slugify(parsed.title);
    const slug = `${baseSlug}-${timestamp.toString(36)}`;

    return {
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      category,
      tags: parsed.tags || [],
      metaTitle: parsed.metaTitle || parsed.title,
      metaDescription: parsed.metaDescription || parsed.excerpt,
      metaKeywords: parsed.metaKeywords || [],
      readingTime: parsed.readingTime || 5,
      author: "UK Visa Expert",
      authorBio: "Immigration specialist with 10+ years experience helping entrepreneurs secure UK Innovator Founder Visas.",
    };
  } catch (error) {
    console.error("Blog generation error:", error);
    throw new Error("Failed to generate blog post");
  }
}

export async function generateMultiplePosts(count: number): Promise<Array<{
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
      // Add delay between generations to avoid rate limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      const post = await generateBlogPost();
      posts.push(post);
      console.log(`Generated blog post ${i + 1}/${count}: ${post.title}`);
    } catch (error) {
      console.error(`Failed to generate post ${i + 1}:`, error);
    }
  }
  
  return posts;
}
