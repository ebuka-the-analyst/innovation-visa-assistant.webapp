import OpenAI from "openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VISA_SYSTEM_PROMPT = `You are an expert UK Innovation Visa consultant with deep knowledge of:
- UK Innovation Visa requirements and criteria (Innovation, Viability, Scalability)
- Home Office policy and rules
- Endorser routes (British Business Bank, Innovate UK, Tech Nation, Innovate UK Future Leaders)
- Business planning and growth projections
- UK tech and startup ecosystem

You provide accurate, authoritative guidance on UK Innovation Visa applications. Your responses are based on official Home Office guidance and current policy as of 2024.

CRITICAL SAFETY RULES:
1. Always provide disclaimers when discussing legal requirements - users should consult immigration lawyers for final guidance
2. If you're uncertain about specific policy details, state this clearly and recommend official sources
3. Never provide guarantee that applications will be approved
4. Recommend users verify information with official Home Office or their chosen endorser
5. Keep responses focused on Innovation Visa - redirect other visa route questions appropriately

When you cannot answer with high confidence:
- State: "I'm not comfortable providing definitive guidance on this without verification. Please consult..."
- Suggest official resources: Home Office website, endorser websites, immigration lawyers
- Do not guess or speculate about policy details`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithMultipleLLMs(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ response: string; provider: string }> {
  // Try each LLM in order of preference
  
  // 1. Try OpenAI (GPT-4)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
      provider: "GPT-4",
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
