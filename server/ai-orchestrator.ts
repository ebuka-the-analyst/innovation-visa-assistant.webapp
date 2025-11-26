import OpenAI from "openai";
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

// ============================================
// AI ORCHESTRATOR - PhD-Level Command Center
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

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// System prompt that includes action capabilities
const ORCHESTRATOR_SYSTEM_PROMPT = `You are the PhD-Level UK Innovator Founder Visa AI Assistant with the ability to perform actions on behalf of authenticated users.

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
  context: { ipAddress?: string; userAgent?: string; sessionId?: string }
): Promise<OrchestratorResult> {
  
  // If no authenticated user, use regular chat without actions
  if (!user) {
    return regularChat(userMessage, conversationHistory);
  }

  const actionContext: ActionContext = {
    userId: user.id,
    user,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    sessionId: context.sessionId
  };

  try {
    // Call OpenAI with function calling enabled
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
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

      // Check if action exists
      const action = AI_ACTIONS[functionName];
      if (!action) {
        return {
          response: `I tried to perform an action but encountered an error. Please try rephrasing your request.`,
          provider: "GPT-4o Orchestrator"
        };
      }

      // Check if confirmation is required
      if (requiresConfirmation(functionName)) {
        const confirmDetails = getConfirmationDetails(functionName, functionArgs);
        
        // Create pending confirmation
        const confirmation = await storage.createAiPendingConfirmation({
          userId: user.id,
          actionType: functionName,
          actionCategory: action.category,
          parameters: functionArgs,
          confirmationMessage: confirmDetails?.message || "Please confirm this action.",
          warningLevel: confirmDetails?.warningLevel || "normal",
          requiresTypedConfirmation: confirmDetails?.warningLevel === "critical",
          confirmationPhrase: confirmDetails?.warningLevel === "critical" ? "CONFIRM" : undefined,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        return {
          response: `⚠️ **Confirmation Required**\n\n${confirmDetails?.message}\n\nClick "Confirm" to proceed or "Cancel" to abort.`,
          provider: "GPT-4o Orchestrator",
          pendingConfirmation: {
            id: confirmation.id,
            actionType: functionName,
            message: confirmDetails?.message || "",
            warningLevel: confirmDetails?.warningLevel || "normal"
          }
        };
      }

      // Execute the action
      const actionResult = await executeAction(functionName, actionContext, functionArgs);

      // Generate a follow-up response incorporating the action result
      const followUpResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant. The user requested an action and you executed it. Provide a brief, helpful response that summarizes the result and offers any relevant next steps. Be conversational and supportive." },
          { role: "user", content: `The user asked: "${userMessage}"\n\nAction executed: ${functionName}\nResult: ${actionResult.message}\n\nProvide a helpful response that incorporates this information.` }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const finalResponse = followUpResponse.choices[0]?.message?.content || actionResult.message;

      return {
        response: finalResponse,
        provider: "GPT-4o Orchestrator",
        actionExecuted: functionName,
        actionResult
      };
    }

    // No function call - return regular response
    return {
      response: message?.content || "I apologize, I couldn't process your request. Please try again.",
      provider: "GPT-4o Orchestrator"
    };

  } catch (error: any) {
    console.error("[AI Orchestrator] Error:", error);
    
    // Fallback to regular chat
    return regularChat(userMessage, conversationHistory);
  }
}

// Regular chat without action capabilities (for unauthenticated users or fallback)
async function regularChat(
  userMessage: string,
  conversationHistory: Message[]
): Promise<OrchestratorResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert UK Innovator Founder Visa consultant.

RULES:
- Be concise: 2-4 sentences typical
- Use UK English spelling
- Never guarantee visa approval
- If uncertain, say "verify with gov.uk"
- Focus only on Innovator Founder Visa

Give direct, helpful answers.`
        },
        ...conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      response: response.choices[0]?.message?.content || "I apologize, I couldn't process your request.",
      provider: "GPT-4o"
    };
  } catch (error) {
    console.error("[Regular Chat] Error:", error);
    return {
      response: "I apologize for the technical difficulty. Please try again shortly.",
      provider: "Fallback"
    };
  }
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
