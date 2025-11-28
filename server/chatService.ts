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

export async function chatWithMultipleLLMs(
  userMessage: string,
  conversationHistory: Message[],
  newsContext?: NewsArticle[]
): Promise<{ response: string; provider: string }> {
  const systemPrompt = buildSystemPrompt(newsContext);
  // Try each LLM in order of preference (Gemini FIRST to save costs)
  
  // 1. Try Gemini FIRST (PRIMARY - uses your existing subscription)
  try {
    const geminiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const geminiBaseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
    
    console.log("[ChatService] Attempting Gemini call (PRIMARY)");
    
    const response = await fetch(`${geminiBaseURL}/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
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
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (content) {
        console.log("[ChatService] Gemini response received successfully");
        return {
          response: addDisclaimerIfNeeded(content),
          provider: "Gemini",
        };
      }
    } else {
      const errorText = await response.text();
      console.error("[ChatService] Gemini API error:", response.status, errorText);
    }
  } catch (error: any) {
    console.error("[ChatService] Gemini API failed:", error?.message || error);
  }

  // 2. Fallback to OpenAI (BACKUP - only if Gemini fails)
  try {
    console.log("[ChatService] Falling back to OpenAI (BACKUP)");
    
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
    console.log("[ChatService] OpenAI response received successfully (backup)");
    return {
      response: addDisclaimerIfNeeded(content),
      provider: "GPT-4o",
    };
  } catch (error: any) {
    console.error("[ChatService] OpenAI API failed:", error?.message || error);
  }

  // Fallback response
  return {
    response: `I apologize, but I'm unable to process your question at the moment due to technical difficulties. 
    
Please try again shortly, or visit the official UK Home Office website for UK Innovation Visa information: https://www.gov.uk/innovation-visa

**Disclaimer:** This service provides information only and does not constitute legal advice. Always consult with an immigration lawyer for specific guidance on your application.`,
    provider: "Fallback",
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
