import OpenAI from "openai";

// Primary OpenAI client (prioritised — funded)
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
import { storage } from "./storage";
import { 
  AI_ACTIONS, 
  executeAction, 
  getActionDefinitions, 
  requiresConfirmation, 
  getConfirmationDetails,
  type ActionContext,
  type ActionResult
} from "./ai-actions";
import type { User } from "@shared/schema";
import { PLAN_IDS, formatPrice } from "@shared/commercialCatalog";
import { getCommercialCatalog } from "./services/commercialCatalogService";

// ============================================
// AI ORCHESTRATOR - Advanced Command Center
// ============================================

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OrchestratorResult {
  response: string;
  provider: string;
  actionExecuted?: string;
  actionResult?: ActionResult;
  pendingConfirmation?: {
    id: string;
    actionType: string;
    message: string;
    warningLevel: string;
  };
}

interface ChatPageContext {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  pageContext?: string;
  pagePath?: string;
  pageCountry?: string;
  pageCountryName?: string;
  pageAuthority?: string;
  pageSection?: string;
}

const COUNTRY_CHAT_META: Record<string, { name: string; authority: string }> = {
  uk: { name: "United Kingdom", authority: "GOV.UK / UK Visas and Immigration" },
  us: { name: "United States", authority: "USCIS / U.S. Department of State" },
  ca: { name: "Canada", authority: "Immigration, Refugees and Citizenship Canada" },
  au: { name: "Australia", authority: "Department of Home Affairs" },
  de: { name: "Germany", authority: "Federal Government / Federal Foreign Office" },
  fr: { name: "France", authority: "France-Visas" },
  nl: { name: "Netherlands", authority: "Immigration and Naturalisation Service (IND)" },
  sg: { name: "Singapore", authority: "MOM / Immigration & Checkpoints Authority" },
  ae: { name: "United Arab Emirates", authority: "UAE Government / ICP" },
  nz: { name: "New Zealand", authority: "Immigration New Zealand" },
  jp: { name: "Japan", authority: "Ministry of Foreign Affairs / Immigration Services Agency" },
  ie: { name: "Ireland", authority: "Irish Immigration Service" },
  pt: { name: "Portugal", authority: "AIMA / Portuguese Government" },
  es: { name: "Spain", authority: "Spanish Government / Ministry of Foreign Affairs" },
  se: { name: "Sweden", authority: "Swedish Migration Agency" },
  ch: { name: "Switzerland", authority: "State Secretariat for Migration (SEM)" },
};

function resolveCountryChatMeta(context?: ChatPageContext) {
  const fallback = context?.pageCountry ? COUNTRY_CHAT_META[context.pageCountry] : undefined;
  return {
    code: context?.pageCountry || "",
    name: context?.pageCountryName || fallback?.name || "this country",
    authority: context?.pageAuthority || fallback?.authority || "the relevant official immigration authority",
    section: context?.pageSection || "visa-routes",
  };
}


// System prompt that includes action capabilities
const ORCHESTRATOR_SYSTEM_PROMPT = `You are the UK Innovator Founder Visa AI Assistant - an expert-level advisor with the ability to perform actions on behalf of authenticated users.

CORE CAPABILITIES:
1. Answer visa questions with 100% accuracy based on official guidance
2. Execute user actions: check progress, view subscription, update profile, etc.
3. Provide personalized recommendations based on user data

AVAILABLE ACTIONS (use function calling):
- get_progress: Check user's visa application progress
- check_subscription: View current subscription tier and benefits
- get_recommendations: Get personalized next steps
- get_tool_usage: See which tools the user has used
- update_profile: Update first name or last name
- change_password: Change user's password (requires confirmation)
- cancel_subscription: Cancel subscription (requires confirmation)
- view_payment_history: View payment information

RULES:
- Be concise but thorough (2-4 sentences typical)
- Use UK English spelling
- Never guarantee visa approval
- When executing actions, summarize results clearly
- For sensitive actions (password, subscription), explain consequences
- If uncertain about visa rules, say "verify with gov.uk"

When users ask about their account, progress, subscription, or want to make changes, USE THE APPROPRIATE FUNCTION rather than giving generic advice.`;

async function getCommercialPromptContext(): Promise<string> {
  const { catalog } = await getCommercialCatalog();
  const publishedPlans = catalog.plans
    .filter((plan) => plan.publicationStatus === "published")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((plan) => `${plan.displayName}: ${formatPrice(plan.pricePence)} one-time; ${plan.features.join("; ")}`)
    .join("\n");
  const toolGroups = PLAN_IDS.map((planId) => {
    const toolIds = Object.entries(catalog.minimumPlanByTool)
      .filter(([, minimumPlanId]) => minimumPlanId === planId)
      .map(([toolId]) => toolId);
    return `${planId} minimum: ${toolIds.join(", ") || "none"}`;
  }).join("\n");

  return `CURRENT COMMERCIAL CATALOGUE (revision ${catalog.revision}):
Prices are one-time plan prices in GBP, never monthly subscriptions. Only quote these values.
${publishedPlans}
Tool access is cumulative: higher plans inherit lower-plan tools.
${toolGroups}`;
}

// Convert action definitions to OpenAI function format
function getOpenAIFunctions(): OpenAI.Chat.ChatCompletionTool[] {
  return getActionDefinitions().map(action => ({
    type: "function" as const,
    function: {
      name: action.name,
      description: action.description,
      parameters: action.parameters
    }
  }));
}

// Main orchestrator function
export async function orchestrateChat(
  userMessage: string,
  conversationHistory: Message[],
  user: User | null,
  context: ChatPageContext
): Promise<OrchestratorResult> {
  const commercialPromptContext = await getCommercialPromptContext();
  
  // Global and country-catalogue pages are discovery surfaces, not the
  // Innovator Founder workspace. Keep their answers country-aware even when
  // the visitor happens to be signed in.
  if (!user || context.pageContext === "global" || context.pageContext === "catalogue") {
    return regularChat(
      userMessage,
      conversationHistory,
      context.pageContext,
      commercialPromptContext,
      context,
    );
  }

  const actionContext: ActionContext = {
    userId: user.id,
    user,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    sessionId: context.sessionId
  };

  // OpenAI only (primary)
  const providers = [
    { name: "OpenAI", client: openaiClient, model: "gpt-4o" },
  ];

  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`[AI Orchestrator] Calling ${provider.name} (function calling)`);
      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: "system", content: `${ORCHESTRATOR_SYSTEM_PROMPT}\n\n${commercialPromptContext}` },
          ...conversationHistory.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          })),
          { role: "user", content: userMessage }
        ],
        tools: getOpenAIFunctions(),
        tool_choice: "auto",
        max_tokens: 800,
        temperature: 0.7
      });

      const message = response.choices[0]?.message;

      // Check if the model wants to call a function
      if (message?.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0] as any;
        const functionName = toolCall.function?.name || toolCall.name;
        const functionArgs = JSON.parse(toolCall.function?.arguments || toolCall.arguments || "{}");

        const action = AI_ACTIONS[functionName];
        if (!action) {
          return {
            response: `I tried to perform an action but encountered an error. Please try rephrasing your request.`,
            provider: `${provider.name} Orchestrator`
          };
        }

        if (requiresConfirmation(functionName)) {
          const confirmDetails = getConfirmationDetails(functionName, functionArgs);
          const confirmation = await storage.createAiPendingConfirmation({
            userId: user.id,
            actionType: functionName,
            actionCategory: action.category,
            parameters: functionArgs,
            confirmationMessage: confirmDetails?.message || "Please confirm this action.",
            warningLevel: confirmDetails?.warningLevel || "normal",
            requiresTypedConfirmation: confirmDetails?.warningLevel === "critical",
            confirmationPhrase: confirmDetails?.warningLevel === "critical" ? "CONFIRM" : undefined,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
          });

          return {
            response: `⚠️ **Confirmation Required**\n\n${confirmDetails?.message}\n\nClick "Confirm" to proceed or "Cancel" to abort.`,
            provider: `${provider.name} Orchestrator`,
            pendingConfirmation: {
              id: confirmation.id,
              actionType: functionName,
              message: confirmDetails?.message || "",
              warningLevel: confirmDetails?.warningLevel || "normal"
            }
          };
        }

        const actionResult = await executeAction(functionName, actionContext, functionArgs);

        // Follow-up response using same provider
        const followUpResponse = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            { role: "system", content: "You are a helpful assistant. The user requested an action and you executed it. Provide a brief, helpful response that summarises the result and offers relevant next steps. Be conversational and supportive. Use UK English." },
            { role: "user", content: `The user asked: "${userMessage}"\n\nAction executed: ${functionName}\nResult: ${actionResult.message}\n\nProvide a helpful response that incorporates this information.` }
          ],
          max_tokens: 300,
          temperature: 0.7
        });

        const finalResponse = followUpResponse.choices[0]?.message?.content || actionResult.message;

        return {
          response: finalResponse,
          provider: `${provider.name} Orchestrator`,
          actionExecuted: functionName,
          actionResult
        };
      }

      // No function call — return regular response
      return {
        response: message?.content || "I apologise, I couldn't process your request. Please try again.",
        provider: `${provider.name} Orchestrator`
      };

    } catch (error: any) {
      const isPaymentError = error?.status === 400 && (
        error?.error?.type === "Arrearage" ||
        error?.message?.includes("Arrearage") ||
        error?.message?.includes("overdue")
      );
      const isQuotaError = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota");

      if (isPaymentError || isQuotaError) {
        console.warn(`[AI Orchestrator] ${provider.name} unavailable (${isPaymentError ? "payment" : "quota"}), trying next provider`);
        lastError = error;
        continue;
      }
      console.error(`[AI Orchestrator] ${provider.name} error:`, error?.message || error);
      lastError = error;
      continue;
    }
  }

  console.error("[AI Orchestrator] All providers failed, falling back to regular chat");
  return regularChat(userMessage, conversationHistory, context.pageContext, commercialPromptContext, context);
}

// Helper functions for retry logic
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
  maxRetries: number = 2,
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
      console.log(`[AI Orchestrator] ${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      if (attempt < maxRetries - 1) {
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}

// Regular chat without action capabilities (for unauthenticated users or fallback)
async function regularChat(
  userMessage: string,
  conversationHistory: Message[],
  pageContext?: string,
  commercialPromptContext?: string,
  pageMeta?: ChatPageContext,
): Promise<OrchestratorResult> {
  const isGlobal = pageContext === "global";
  const isCatalogue = pageContext === "catalogue";
  const country = resolveCountryChatMeta(pageMeta);

  const baseSystemPrompt = isGlobal
    ? `You are Visa Assistant Global, an AI guide for exploring immigration and visa-route information across the countries available on this platform.

RULES:
- Be concise: 2-4 sentences is typical unless the user asks for detail.
- Keep the answer tied to the country or route the user asks about.
- Never guarantee visa approval or imply you are a regulated immigration adviser.
- Do not invent current fees, salary thresholds, processing times or eligibility cut-offs.
- For time-sensitive requirements, direct the user to the relevant official immigration authority.
- The UK Innovator Founder preparation assistant is a separate dedicated product; do not steer users into it unless they ask about that UK route.

Help users discover the right country hub and understand the route information shown on Visa Assistant Global.`
    : isCatalogue
      ? `You are the ${country.name} Visa Assistant on Visa Assistant Global.

CURRENT PAGE CONTEXT:
- Country: ${country.name}
- Page section: ${country.section}
- Official authority to verify current requirements: ${country.authority}
- Page path: ${pageMeta?.pagePath || "unknown"}

RULES:
- Answer in the context of ${country.name}. Do NOT answer as the UK Innovator Founder assistant unless the user explicitly asks to compare with that UK route.
- Help explain the visa routes, route categories and preparation concepts shown for ${country.name} on this platform.
- The route catalogue can be browsed even when dedicated preparation tools are not yet live. Never pretend a coming-soon tool is already available.
- Be concise: 2-4 sentences is typical unless the user asks for detail.
- Never guarantee an immigration outcome and never present yourself as a regulated immigration adviser.
- Do not invent current fees, salary thresholds, processing times, quotas or eligibility cut-offs.
- If the user asks for a current legal requirement or a fact that may change, tell them to verify it with ${country.authority}.
- If the user asks about another country, make clear that they should switch to that country's hub for country-specific guidance.

Give direct, useful answers about ${country.name} and the current page.`
      : `You are an AI preparation assistant for the UK Innovator Founder route.

RULES:
- Be concise: 2-4 sentences typical.
- Use UK English spelling.
- Never guarantee visa approval.
- If a requirement may have changed, tell the user to verify it with GOV.UK.
- Focus on Innovator Founder preparation unless the user explicitly asks for a comparison.
- Do not claim to be a regulated immigration adviser.

Give direct, helpful answers.`;

  // Commercial plan details belong to the dedicated Innovator Founder product,
  // not to the global/country discovery assistant.
  const systemPrompt =
    isGlobal || isCatalogue
      ? baseSystemPrompt
      : `${baseSystemPrompt}\n\n${commercialPromptContext ?? await getCommercialPromptContext()}`;

  const chatProviders = [
    { name: "OpenAI", client: openaiClient, model: "gpt-4o" },
  ];

  for (const provider of chatProviders) {
    try {
      console.log(`[AI Orchestrator] Calling ${provider.name} for regular chat`);
      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          })),
          { role: "user", content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      return { response: content, provider: provider.name };
    } catch (error: any) {
      const isPaymentError = error?.status === 400 && (
        error?.error?.type === "Arrearage" || error?.message?.includes("Arrearage")
      );
      const isQuotaError = error?.status === 429 || error?.message?.includes("429");
      if (isPaymentError || isQuotaError) {
        console.warn(`[AI Orchestrator] ${provider.name} unavailable, trying next`);
        continue;
      }
      console.error(`[AI Orchestrator] ${provider.name} error:`, error?.message || error);
      continue;
    }
  }

  console.error("[Regular Chat] All providers failed, using intelligent fallback");
  return getIntelligentFallback(userMessage, pageContext, pageMeta);
}

function getIntelligentFallback(
  userMessage: string,
  pageContext?: string,
  pageMeta?: ChatPageContext,
): OrchestratorResult {
  const lowerMessage = userMessage.toLowerCase();

  if (pageContext === "catalogue") {
    const country = resolveCountryChatMeta(pageMeta);
    return {
      response:
        `You're currently viewing ${country.name}. I can help explain the route catalogue and preparation concepts on this page, but I can't safely confirm a time-sensitive immigration requirement while the live AI service is unavailable. Please verify current rules with ${country.authority}.`,
      provider: "Fallback",
    };
  }

  if (pageContext === "global") {
    return {
      response:
        "I can help you navigate Visa Assistant Global and choose a country hub. The live AI service is temporarily unavailable, so for current immigration requirements please use the official authority for the country you are considering.",
      provider: "Fallback",
    };
  }

  if (lowerMessage.includes("requirement") || lowerMessage.includes("eligible") || lowerMessage.includes("qualify")) {
    return {
      response:
        "For the UK Innovator Founder route, preparation commonly focuses on the published route requirements, endorsement, your business proposition and supporting evidence. Because requirements can change, verify the current eligibility rules directly on GOV.UK before relying on them.",
      provider: "Fallback"
    };
  }

  if (lowerMessage.includes("endorser") || lowerMessage.includes("endorsement")) {
    return {
      response:
        "The Innovator Founder route requires endorsement from an authorised endorsing body. Your preparation should clearly evidence innovation, viability and scalability, and you should verify the current authorised-body list and requirements on GOV.UK.",
      provider: "Fallback"
    };
  }

  if (lowerMessage.includes("cost") || lowerMessage.includes("fee") || lowerMessage.includes("how much")) {
    return {
      response:
        "Application, healthcare and endorsement-related costs can change. Please check the current Innovator Founder fees on GOV.UK and the relevant endorsing body's own published charges before budgeting.",
      provider: "Fallback"
    };
  }

  return {
    response:
      "I'm experiencing a brief connection issue. Please try again in a moment. For time-sensitive Innovator Founder requirements, use the current GOV.UK guidance.",
    provider: "Fallback"
  };
}

// Confirm and execute a pending action
export async function confirmAndExecuteAction(
  confirmationId: string,
  user: User,
  context: { ipAddress?: string; userAgent?: string; sessionId?: string }
): Promise<ActionResult> {
  const startTime = Date.now();
  
  // Get the pending confirmation
  const confirmation = await storage.getAiPendingConfirmation(confirmationId);
  
  if (!confirmation) {
    // Log failed confirmation attempt
    await storage.createAiActionLog({
      userId: user.id,
      actionType: 'confirmation_attempt',
      actionCategory: 'security',
      parameters: { confirmationId },
      status: 'failed',
      errorMessage: 'Confirmation not found or expired',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      executionTimeMs: Date.now() - startTime
    });
    return { success: false, message: "Confirmation not found or expired." };
  }
  
  if (confirmation.userId !== user.id) {
    // Log unauthorized attempt - critical security event
    await storage.createAiActionLog({
      userId: user.id,
      actionType: 'unauthorized_confirmation_attempt',
      actionCategory: 'security',
      parameters: { confirmationId, attemptedAction: confirmation.actionType },
      status: 'failed',
      errorMessage: 'Unauthorized - user mismatch',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      executionTimeMs: Date.now() - startTime
    });
    return { success: false, message: "Unauthorized." };
  }
  
  if (confirmation.confirmed || confirmation.cancelled) {
    return { success: false, message: "This action has already been processed." };
  }
  
  if (new Date() > confirmation.expiresAt) {
    return { success: false, message: "Confirmation has expired. Please start again." };
  }

  // Log the confirmation event
  await storage.createAiActionLog({
    userId: user.id,
    actionType: `${confirmation.actionType}_confirmed`,
    actionCategory: confirmation.actionCategory || 'account',
    parameters: { confirmationId },
    status: 'success',
    result: { confirmed: true },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    sessionId: context.sessionId,
    executionTimeMs: Date.now() - startTime
  });

  // Mark as confirmed
  await storage.confirmAiAction(confirmationId);

  // Execute the action (this will also log the action execution)
  const actionContext: ActionContext = {
    userId: user.id,
    user,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    sessionId: context.sessionId
  };

  const result = await executeAction(
    confirmation.actionType,
    actionContext,
    confirmation.parameters || {}
  );

  return result;
}

// Cancel a pending action
export async function cancelPendingAction(
  confirmationId: string,
  userId: string,
  context?: { ipAddress?: string; userAgent?: string; sessionId?: string }
): Promise<boolean> {
  const confirmation = await storage.getAiPendingConfirmation(confirmationId);
  
  if (!confirmation || confirmation.userId !== userId) {
    return false;
  }
  
  // Log the cancellation
  await storage.createAiActionLog({
    userId,
    actionType: `${confirmation.actionType}_cancelled`,
    actionCategory: confirmation.actionCategory || 'account',
    parameters: { confirmationId },
    status: 'success',
    result: { cancelled: true },
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    sessionId: context?.sessionId,
    executionTimeMs: 0
  });
  
  await storage.cancelAiAction(confirmationId);
  return true;
}

// Get user's pending confirmations
export async function getUserPendingConfirmations(userId: string) {
  return storage.getUserPendingConfirmations(userId);
}

// Get user's action history
export async function getUserActionHistory(userId: string, limit: number = 20) {
  return storage.getUserAiActionLogs(userId, limit);
}
