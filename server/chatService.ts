import OpenAI from "openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VISA_SYSTEM_PROMPT = `You are an expert UK Innovator Founder Visa consultant with deep knowledge of Home Office requirements, endorser routes, and business planning.

RESPONSE STYLE:
- Keep responses CONCISE (2-4 sentences maximum unless user asks for details)
- Be direct and accurate - no fluff or unnecessary context
- Use bullet points for multiple items
- Based on official GOV.UK guidance (November 2025)

SAFETY RULES:
1. State clearly if uncertain - recommend official sources or immigration lawyers
2. Never guarantee visa approval
3. Always suggest users verify with Home Office or endorsers
4. Focus on Innovator Founder Visa only (redirect other visa questions)

WHEN UNCERTAIN: Say "I recommend verifying this with [official source/immigration lawyer]" - don't speculate.`;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function chatWithMultipleLLMs(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ response: string; provider: string }> {
  // Try each LLM in order of preference
  
  // 1. Try OpenAI (GPT-4o via Replit AI Integrations)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: VISA_SYSTEM_PROMPT,
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
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    return {
      response: addDisclaimerIfNeeded(content),
      provider: "GPT-4o",
    };
  } catch (error) {
    console.warn("OpenAI API failed, trying Gemini...", error);
  }

  // 2. Try Gemini via REST API
  try {
    const geminiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const geminiBaseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
    
    const response = await fetch(`${geminiBaseURL}/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: VISA_SYSTEM_PROMPT }],
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
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (content) {
        return {
          response: addDisclaimerIfNeeded(content),
          provider: "Gemini",
        };
      }
    }
  } catch (error) {
    console.warn("Gemini API failed, trying Claude...", error);
  }

  // 3. Fallback: Anthropic Claude (if needed)
  try {
    // Using fetch for Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: VISA_SYSTEM_PROMPT,
        messages: [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const content = data.content?.[0]?.text || "";

    return {
      response: addDisclaimerIfNeeded(content),
      provider: "Claude",
    };
  } catch (error) {
    console.error("All LLM APIs failed:", error);
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
  // Check if response already contains a disclaimer
  if (response.toLowerCase().includes("disclaimer") || response.toLowerCase().includes("consult")) {
    return response;
  }

  // Add disclaimer to responses about applications, policy, or requirements
  const topicsRequiringDisclaimer = [
    "application",
    "approval",
    "requirement",
    "policy",
    "rule",
    "eligible",
    "qualify",
    "refuse",
    "reject",
  ];

  const needsDisclaimer = topicsRequiringDisclaimer.some((topic) =>
    response.toLowerCase().includes(topic)
  );

  if (needsDisclaimer) {
    return (
      response +
      `

---

**Important Disclaimer:** This information is provided for educational purposes only and does not constitute legal or immigration advice. Regulations change frequently, and individual circumstances vary. Always:
- Verify current policy on the official Home Office website
- Consult with a qualified immigration lawyer
- Contact your chosen endorser directly for specific guidance
- Review the latest guidance before submitting your application`
    );
  }

  return response;
}
