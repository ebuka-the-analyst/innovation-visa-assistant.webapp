import OpenAI from "openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface NewsArticle {
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
}

const BASE_VISA_SYSTEM_PROMPT = `You are an expert UK Innovator Founder Visa consultant.

RULES:
- Be EXTREMELY concise: 1-3 sentences max
- Use UK English spelling
- Use simple dashes for bullet points if needed
- Never guarantee visa approval
- If uncertain, say "verify with gov.uk"
- Focus only on Innovator Founder Visa

Give direct answers. No filler.`;

function buildSystemPrompt(newsContext?: NewsArticle[]): string {
  if (!newsContext || newsContext.length === 0) {
    return BASE_VISA_SYSTEM_PROMPT;
  }
  
  const newsSection = newsContext.slice(0, 5).map(article => 
    `- ${article.title} (${article.source}, ${new Date(article.publishedAt).toLocaleDateString()})`
  ).join('\n');
  
  return `${BASE_VISA_SYSTEM_PROMPT}

RECENT UK IMMIGRATION NEWS (reference if relevant):
${newsSection}

When users ask about recent news or updates, reference this information.`;
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  operationName: string = "operation"
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const delay = initialDelayMs * Math.pow(2, attempt);
      console.log(`[ChatService] ${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      if (attempt < maxRetries - 1) {
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}

async function callGeminiWithRetry(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string
): Promise<{ response: string; provider: string } | null> {
  const geminiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const geminiBaseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  
  if (!geminiKey) {
    console.log("[ChatService] No Gemini API key configured");
    return null;
  }
  
  try {
    return await retryWithBackoff(async () => {
      console.log("[ChatService] Attempting Gemini call (PRIMARY)");
      
      const response = await fetchWithTimeout(
        `${geminiBaseURL}/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              ...conversationHistory.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
              })),
              {
                role: "user",
                parts: [{ text: userMessage }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          }),
        },
        30000
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as any;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!content) {
        throw new Error("Empty response from Gemini");
      }
      
      console.log("[ChatService] Gemini response received successfully");
      return {
        response: addDisclaimerIfNeeded(content),
        provider: "Gemini",
      };
    }, 2, 1000, "Gemini API call");
  } catch (error: any) {
    console.error("[ChatService] Gemini API failed after retries:", error?.message || error);
    return null;
  }
}

async function callOpenAIWithRetry(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string
): Promise<{ response: string; provider: string } | null> {
  try {
    return await retryWithBackoff(async () => {
      console.log("[ChatService] Attempting OpenAI call (BACKUP)");
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      
      console.log("[ChatService] OpenAI response received successfully");
      return {
        response: addDisclaimerIfNeeded(content),
        provider: "GPT-4o",
      };
    }, 2, 1000, "OpenAI API call");
  } catch (error: any) {
    console.error("[ChatService] OpenAI API failed after retries:", error?.message || error);
    return null;
  }
}

export async function chatWithMultipleLLMs(
  userMessage: string,
  conversationHistory: Message[],
  newsContext?: NewsArticle[]
): Promise<{ response: string; provider: string }> {
  const systemPrompt = buildSystemPrompt(newsContext);
  
  // 1. Try Gemini FIRST (PRIMARY - cost effective)
  const geminiResult = await callGeminiWithRetry(systemPrompt, conversationHistory, userMessage);
  if (geminiResult) {
    return geminiResult;
  }

  // 2. Fallback to OpenAI (BACKUP)
  const openaiResult = await callOpenAIWithRetry(systemPrompt, conversationHistory, userMessage);
  if (openaiResult) {
    return openaiResult;
  }

  // 3. Intelligent fallback response based on user query
  console.log("[ChatService] All AI providers failed, using intelligent fallback");
  return getIntelligentFallback(userMessage);
}

function getIntelligentFallback(userMessage: string): { response: string; provider: string } {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("requirement") || lowerMessage.includes("eligible") || lowerMessage.includes("qualify")) {
    return {
      response: `For Innovator Founder Visa requirements, you need:
- An innovative, viable, and scalable business idea
- Endorsement from an approved endorsing body
- At least £50,000 investment funds (if required by endorser)
- English language proficiency (B2 level)
- Maintenance funds (usually £1,270 for 28 days)

Visit gov.uk/innovation-visa for complete requirements.`,
      provider: "Fallback"
    };
  }
  
  if (lowerMessage.includes("endorser") || lowerMessage.includes("endorsing body") || lowerMessage.includes("endorsement")) {
    return {
      response: `You need endorsement from a Home Office approved endorsing body. They assess if your business idea is:
- Innovative (new or significantly different)
- Viable (skills and market potential)
- Scalable (potential for growth)

Search for approved endorsing bodies on gov.uk/government/publications/endorsing-bodies-innovator-founder.`,
      provider: "Fallback"
    };
  }
  
  if (lowerMessage.includes("cost") || lowerMessage.includes("fee") || lowerMessage.includes("how much")) {
    return {
      response: `Innovator Founder Visa costs (approximate):
- Application fee: £1,036 (from outside UK) or £1,292 (switching in UK)
- Healthcare surcharge: £1,035 per year
- Endorsement fees vary by endorsing body

Check gov.uk for current fees as they may change.`,
      provider: "Fallback"
    };
  }
  
  if (lowerMessage.includes("how long") || lowerMessage.includes("processing time") || lowerMessage.includes("decision")) {
    return {
      response: `Processing times for Innovator Founder Visa:
- Standard: 8 weeks from outside UK
- Priority service may be available for faster decisions
- In-UK switching applications can vary

Always check gov.uk for current processing times.`,
      provider: "Fallback"
    };
  }
  
  return {
    response: `I'm experiencing a brief connection issue, but I can help once restored.

In the meantime, visit gov.uk/innovation-visa for official guidance, or ask me again in a moment.

**Common topics I assist with:**
- Visa requirements and eligibility
- Endorsing bodies and endorsement process
- Application fees and timelines
- Business plan requirements`,
    provider: "Fallback"
  };
}

function addDisclaimerIfNeeded(response: string): string {
  if (response.toLowerCase().includes("disclaimer") || 
      response.toLowerCase().includes("gov.uk") ||
      response.toLowerCase().includes("verify")) {
    return response;
  }

  const topicsRequiringDisclaimer = [
    "application",
    "approval",
    "requirement",
    "eligible",
    "qualify",
    "refuse",
    "reject",
  ];

  const needsDisclaimer = topicsRequiringDisclaimer.some((topic) =>
    response.toLowerCase().includes(topic)
  );

  if (needsDisclaimer) {
    return response + "\n\n*Verify at gov.uk before applying.*";
  }

  return response;
}
