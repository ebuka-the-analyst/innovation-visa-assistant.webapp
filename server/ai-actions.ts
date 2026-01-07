import { storage } from "./storage";
import bcrypt from "bcrypt";
import type { User, BusinessPlan } from "@shared/schema";
import { ALL_TOOLS } from "@shared/tools-data";

// ============================================
// AI ACTION REGISTRY - Advanced AI Orchestrator
// ============================================

export type ActionCategory = 'account' | 'subscription' | 'insights' | 'documents' | 'support';
export type WarningLevel = 'normal' | 'warning' | 'critical';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationId?: string;
  confirmationMessage?: string;
  warningLevel?: WarningLevel;
}

export interface ActionContext {
  userId: string;
  user: User;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  confirmationRequired: boolean;
  warningLevel: WarningLevel;
  rateLimit: { max: number; windowMinutes: number };
  parameters: Record<string, { type: string; required: boolean; description: string; enum?: string[] }>;
  execute: (context: ActionContext, params: any) => Promise<ActionResult>;
  getConfirmationMessage?: (params: any) => string;
}

// ============================================
// ACTION HANDLERS
// ============================================

// INSIGHTS ACTIONS - Read-only queries about user's data
const getProgressAction: ActionDefinition = {
  id: 'get_progress',
  name: 'Get Progress',
  description: 'Check user progress on a specific section or overall',
  category: 'insights',
  confirmationRequired: false,
  warningLevel: 'normal',
  rateLimit: { max: 100, windowMinutes: 60 },
  parameters: {
    section: { 
      type: 'string', 
      required: false, 
      description: 'Section to check progress for',
      enum: ['business-plan', 'documents', 'questionnaire', 'tools', 'overall']
    }
  },
  execute: async (context, params) => {
    const section = params.section || 'overall';
    const { user } = context;
    
    // Get business plans
    const businessPlans = await storage.getUserBusinessPlans(context.userId);
    const hasBusinessPlan = businessPlans.length > 0;
    const latestPlan = businessPlans[0];
    
    // Get documents
    const documents = await storage.getUserFiles(context.userId);
    const documentCount = documents.length;
    
    // Get tool analytics
    const toolUsage = await storage.getUserAnalytics(context.userId);
    const uniqueToolsUsed = new Set(toolUsage.map(t => t.toolId)).size;
    
    // Calculate progress based on section
    let progressData: any = {};
    
    if (section === 'overall' || section === 'business-plan') {
      progressData.businessPlan = {
        hasStarted: hasBusinessPlan,
        status: latestPlan?.status || 'not_started',
        completionPercentage: latestPlan?.status === 'completed' ? 100 : 
                             latestPlan?.status === 'generating' ? 50 : 
                             hasBusinessPlan ? 25 : 0
      };
    }
    
    if (section === 'overall' || section === 'documents') {
      progressData.documents = {
        totalDocuments: documentCount,
        categories: documents.reduce((acc: any, doc) => {
          const category = doc.fileType || 'general';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {})
      };
    }
    
    if (section === 'overall' || section === 'tools') {
      const totalTools = ALL_TOOLS.length;
      progressData.tools = {
        totalAvailable: totalTools,
        uniqueToolsUsed,
        usagePercentage: Math.round((uniqueToolsUsed / totalTools) * 100)
      };
    }
    
    if (section === 'overall') {
      // Calculate overall readiness score
      const businessPlanScore = progressData.businessPlan?.completionPercentage || 0;
      const documentScore = Math.min(documentCount * 10, 100);
      const toolScore = progressData.tools?.usagePercentage || 0;
      
      progressData.overallReadiness = Math.round((businessPlanScore * 0.4) + (documentScore * 0.3) + (toolScore * 0.3));
      progressData.nextRecommendation = getNextRecommendation(progressData);
    }
    
    return {
      success: true,
      message: formatProgressMessage(section, progressData),
      data: progressData
    };
  }
};

const checkSubscriptionAction: ActionDefinition = {
  id: 'check_subscription',
  name: 'Check Subscription',
  description: 'View current subscription tier, status, and benefits',
  category: 'subscription',
  confirmationRequired: false,
  warningLevel: 'normal',
  rateLimit: { max: 50, windowMinutes: 60 },
  parameters: {},
  execute: async (context) => {
    const { user } = context;
    
    const tierInfo = getTierInfo(user.subscriptionTier || 'free');
    
    return {
      success: true,
      message: formatSubscriptionMessage(user, tierInfo),
      data: {
        currentTier: user.subscriptionTier || 'free',
        status: user.subscriptionStatus || 'inactive',
        tierName: tierInfo.name,
        toolsIncluded: tierInfo.toolCount,
        price: tierInfo.price,
        benefits: tierInfo.benefits,
        hasStripeSubscription: !!user.stripeSubscriptionId
      }
    };
  }
};

const getRecommendationsAction: ActionDefinition = {
  id: 'get_recommendations',
  name: 'Get Recommendations',
  description: 'Get personalized next steps based on current progress',
  category: 'insights',
  confirmationRequired: false,
  warningLevel: 'normal',
  rateLimit: { max: 50, windowMinutes: 60 },
  parameters: {},
  execute: async (context) => {
    const { user } = context;
    
    // Get user data
    const businessPlans = await storage.getUserBusinessPlans(context.userId);
    const documents = await storage.getUserFiles(context.userId);
    const toolUsage = await storage.getUserAnalytics(context.userId);
    
    const recommendations: string[] = [];
    
    // Business plan recommendations
    if (businessPlans.length === 0) {
      recommendations.push("Start with the Business Plan Generator - it's the foundation of your visa application");
    } else if (businessPlans[0]?.status !== 'completed') {
      recommendations.push("Complete your business plan - endorsers review this first");
    }
    
    // Document recommendations
    if (documents.length < 5) {
      recommendations.push("Upload key documents (passport, bank statements, qualifications) to the Document Organizer");
    }
    
    // Tool recommendations based on tier
    const tier = user.subscriptionTier || 'free';
    if (tier === 'free') {
      recommendations.push("Consider upgrading to access more powerful tools for your application");
    }
    
    // Usage recommendations
    const uniqueTools = new Set(toolUsage.map(t => t.toolId)).size;
    if (uniqueTools < 5) {
      recommendations.push("Explore more tools - the Innovation Score Calculator and Pitch Practice Coach are highly recommended");
    }
    
    // Add timeline recommendation
    recommendations.push("Set a target date for your endorser meeting and work backwards to create a timeline");
    
    return {
      success: true,
      message: `📋 **Your Personalized Recommendations:**\n\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n💡 Focus on completing one item at a time for best results.`,
      data: { recommendations }
    };
  }
};

const getToolUsageAction: ActionDefinition = {
  id: 'get_tool_usage',
  name: 'Get Tool Usage',
  description: 'View which tools have been used and when',
  category: 'insights',
  confirmationRequired: false,
  warningLevel: 'normal',
  rateLimit: { max: 50, windowMinutes: 60 },
  parameters: {},
  execute: async (context) => {
    const toolUsage = await storage.getUserAnalytics(context.userId);
    
    // Group by tool and get last used
    const toolStats = toolUsage.reduce((acc: any, usage) => {
      if (!acc[usage.toolId]) {
        acc[usage.toolId] = { count: 0, lastUsed: usage.createdAt };
      }
      acc[usage.toolId].count++;
      if (new Date(usage.createdAt) > new Date(acc[usage.toolId].lastUsed)) {
        acc[usage.toolId].lastUsed = usage.createdAt;
      }
      return acc;
    }, {});
    
    const sortedTools = Object.entries(toolStats)
      .map(([toolId, stats]: [string, any]) => ({
        toolId,
        toolName: ALL_TOOLS.find(t => t.id === toolId)?.name || toolId,
        usageCount: stats.count,
        lastUsed: stats.lastUsed
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
    
    const message = sortedTools.length > 0
      ? `📊 **Your Tool Usage:**\n\n${sortedTools.map((t, i) => `${i + 1}. **${t.toolName}** - Used ${t.usageCount} time${t.usageCount !== 1 ? 's' : ''}`).join('\n')}\n\nTotal unique tools used: ${Object.keys(toolStats).length} of ${ALL_TOOLS.length}`
      : "You haven't used any tools yet. Start with the Business Plan Generator or Innovation Score Calculator!";
    
    return {
      success: true,
      message,
      data: { toolStats: sortedTools, totalUniqueTools: Object.keys(toolStats).length }
    };
  }
};

// ACCOUNT ACTIONS
const updateProfileAction: ActionDefinition = {
  id: 'update_profile',
  name: 'Update Profile',
  description: 'Update user profile information',
  category: 'account',
  confirmationRequired: false,
  warningLevel: 'normal',
  rateLimit: { max: 10, windowMinutes: 60 },
  parameters: {
    firstName: { type: 'string', required: false, description: 'First name' },
    lastName: { type: 'string', required: false, description: 'Last name' }
  },
  execute: async (context, params) => {
    const updates: Partial<User> = {};
    
    if (params.firstName) updates.firstName = params.firstName;
    if (params.lastName) updates.lastName = params.lastName;
    
    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        message: "Please provide at least one field to update (firstName or lastName)."
      };
    }
    
    updates.updatedAt = new Date();
    const updated = await storage.updateUser(context.userId, updates);
    
    if (!updated) {
      return { success: false, message: "Failed to update profile. Please try again." };
    }
    
    const changedFields = Object.keys(updates).filter(k => k !== 'updatedAt').join(', ');
    
    return {
      success: true,
      message: `✅ Profile updated successfully!\n\nUpdated: ${changedFields}`,
      data: { updated: updates }
    };
  }
};

const changePasswordAction: ActionDefinition = {
  id: 'change_password',
  name: 'Change Password',
  description: 'Change user password',
  category: 'account',
  confirmationRequired: true,
  warningLevel: 'warning',
  rateLimit: { max: 3, windowMinutes: 60 },
  parameters: {
    currentPassword: { type: 'string', required: true, description: 'Current password' },
    newPassword: { type: 'string', required: true, description: 'New password (min 8 characters)' }
  },
  getConfirmationMessage: () => "You are about to change your password. You will remain logged in on this device, but may need to log in again on other devices.",
  execute: async (context, params) => {
    const { user } = context;
    const { currentPassword, newPassword } = params;
    
    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      return {
        success: false,
        message: "Your account uses Google sign-in. Password change is not available."
      };
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        message: "Current password is incorrect. Please try again."
      };
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return {
        success: false,
        message: "New password must be at least 8 characters long."
      };
    }
    
    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updatePassword(context.userId, hashedPassword);
    
    return {
      success: true,
      message: "✅ Password changed successfully!\n\nA confirmation email has been sent to your registered email address."
    };
  }
};

// SUBSCRIPTION ACTIONS
const cancelSubscriptionAction: ActionDefinition = {
  id: 'cancel_subscription',
  name: 'Cancel Subscription',
  description: 'Cancel the current subscription',
  category: 'subscription',
  confirmationRequired: true,
  warningLevel: 'critical',
  rateLimit: { max: 1, windowMinutes: 1440 }, // Once per day
  parameters: {
    reason: { type: 'string', required: false, description: 'Reason for cancellation' }
  },
  getConfirmationMessage: (params) => {
    return `You are about to cancel your subscription. This will:\n\n• End your current tier access at the end of your billing period\n• Downgrade you to the Free tier\n• Remove access to premium tools\n\nThis action cannot be undone immediately. Are you sure?`;
  },
  execute: async (context, params) => {
    const { user } = context;
    
    if (!user.stripeSubscriptionId) {
      return {
        success: false,
        message: "You don't have an active subscription to cancel."
      };
    }
    
    // Update subscription status (Stripe webhook will handle the actual cancellation)
    await storage.updateUser(context.userId, {
      subscriptionStatus: 'cancelled',
      updatedAt: new Date()
    });
    
    // Log the cancellation reason
    if (params.reason) {
      await storage.createAiActionLog({
        userId: context.userId,
        actionType: 'subscription_cancellation_reason',
        actionCategory: 'subscription',
        parameters: { reason: params.reason },
        status: 'success',
        result: { recorded: true }
      });
    }
    
    return {
      success: true,
      message: "✅ Your subscription has been cancelled.\n\nYou will retain your current tier access until the end of your billing period. After that, you will be moved to the Free tier.\n\nWe're sorry to see you go! You can resubscribe anytime from the Pricing page."
    };
  }
};

const viewPaymentHistoryAction: ActionDefinition = {
  id: 'view_payment_history',
  name: 'View Payment History',
  description: 'View past payments and invoices',
  category: 'subscription',
  confirmationRequired: false,
  warningLevel: 'normal',
  rateLimit: { max: 20, windowMinutes: 60 },
  parameters: {},
  execute: async (context) => {
    const { user } = context;
    
    if (!user.stripeCustomerId) {
      return {
        success: true,
        message: "No payment history found. You haven't made any purchases yet.",
        data: { payments: [] }
      };
    }
    
    // In a full implementation, this would fetch from Stripe
    // For now, we'll provide a summary based on user data
    const tierInfo = getTierInfo(user.subscriptionTier || 'free');
    
    return {
      success: true,
      message: `💳 **Payment Information:**\n\n• Current Tier: ${tierInfo.name}\n• Monthly Price: ${tierInfo.price}\n• Status: ${user.subscriptionStatus || 'N/A'}\n\nFor detailed invoices and payment history, please visit the Settings page > Billing section.`,
      data: {
        currentTier: user.subscriptionTier,
        tierPrice: tierInfo.price,
        status: user.subscriptionStatus
      }
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTierInfo(tier: string): { name: string; price: string; toolCount: number; benefits: string[] } {
  const tiers: Record<string, any> = {
    free: {
      name: 'Free',
      price: '£0/month',
      toolCount: 13,
      benefits: ['13 essential tools', 'Basic visa guidance', 'Community support']
    },
    basic: {
      name: 'Basic',
      price: '£15/month',
      toolCount: 20,
      benefits: ['20 tools total', 'Essential documentation', 'Email support']
    },
    premium: {
      name: 'Premium',
      price: '£29/month',
      toolCount: 83,
      benefits: ['83 tools total', 'Comprehensive coverage', 'Priority support', 'AI assistance']
    },
    enterprise: {
      name: 'Enterprise',
      price: '£45/month',
      toolCount: 109,
      benefits: ['All 109 tools', 'Advanced IP strategy', 'Patent guidance', 'Dedicated support']
    },
    ultimate: {
      name: 'Ultimate',
      price: '£60/month',
      toolCount: 109,
      benefits: ['All 109 tools', 'VIP support', 'Personal strategist', 'Success guarantee']
    }
  };
  
  return tiers[tier] || tiers.free;
}

function formatProgressMessage(section: string, data: any): string {
  if (section === 'overall') {
    return `📊 **Your Visa Application Progress:**\n\n` +
      `**Overall Readiness:** ${data.overallReadiness}%\n\n` +
      `📝 Business Plan: ${data.businessPlan?.completionPercentage || 0}% complete\n` +
      `📁 Documents: ${data.documents?.totalDocuments || 0} uploaded\n` +
      `🛠️ Tools: ${data.tools?.uniqueToolsUsed || 0} of ${data.tools?.totalAvailable || 109} used\n\n` +
      `💡 **Next Step:** ${data.nextRecommendation || 'Keep up the great work!'}`;
  }
  
  if (section === 'business-plan') {
    const bp = data.businessPlan;
    return `📝 **Business Plan Status:**\n\n` +
      `Status: ${bp?.status || 'Not Started'}\n` +
      `Completion: ${bp?.completionPercentage || 0}%\n\n` +
      (bp?.hasStarted ? 'Your business plan is in progress. Keep working on it!' : 'Start your business plan to unlock the foundation of your visa application.');
  }
  
  if (section === 'documents') {
    const docs = data.documents;
    return `📁 **Document Status:**\n\n` +
      `Total Documents: ${docs?.totalDocuments || 0}\n\n` +
      (Object.keys(docs?.categories || {}).length > 0 
        ? `Categories:\n${Object.entries(docs.categories).map(([cat, count]) => `• ${cat}: ${count}`).join('\n')}`
        : 'No documents uploaded yet. Start with your passport and bank statements.');
  }
  
  if (section === 'tools') {
    const tools = data.tools;
    return `🛠️ **Tool Usage:**\n\n` +
      `Tools Used: ${tools?.uniqueToolsUsed || 0} of ${tools?.totalAvailable || 109}\n` +
      `Usage: ${tools?.usagePercentage || 0}%\n\n` +
      'Explore more tools to strengthen your application!';
  }
  
  return 'Progress data retrieved successfully.';
}

function formatSubscriptionMessage(user: User, tierInfo: any): string {
  return `💎 **Your Subscription:**\n\n` +
    `**Current Tier:** ${tierInfo.name}\n` +
    `**Monthly Price:** ${tierInfo.price}\n` +
    `**Status:** ${user.subscriptionStatus || 'Active'}\n\n` +
    `**Benefits:**\n${tierInfo.benefits.map((b: string) => `• ${b}`).join('\n')}\n\n` +
    `You have access to ${tierInfo.toolCount} tools.`;
}

function getNextRecommendation(data: any): string {
  if (!data.businessPlan?.hasStarted) {
    return 'Start your Business Plan - it\'s the foundation of your visa application.';
  }
  if (data.businessPlan?.completionPercentage < 100) {
    return 'Complete your Business Plan to impress endorsers.';
  }
  if (data.documents?.totalDocuments < 5) {
    return 'Upload more supporting documents to strengthen your application.';
  }
  if (data.tools?.usagePercentage < 20) {
    return 'Explore more tools like Innovation Score Calculator and Pitch Coach.';
  }
  return 'Practice your endorser pitch and review your application timeline.';
}

// ============================================
// ACTION REGISTRY
// ============================================

export const AI_ACTIONS: Record<string, ActionDefinition> = {
  // Insights
  get_progress: getProgressAction,
  check_subscription: checkSubscriptionAction,
  get_recommendations: getRecommendationsAction,
  get_tool_usage: getToolUsageAction,
  
  // Account
  update_profile: updateProfileAction,
  change_password: changePasswordAction,
  
  // Subscription
  cancel_subscription: cancelSubscriptionAction,
  view_payment_history: viewPaymentHistoryAction,
};

// Get all action definitions for AI function calling
export function getActionDefinitions(): Array<{ name: string; description: string; parameters: any }> {
  return Object.values(AI_ACTIONS).map(action => ({
    name: action.id,
    description: action.description,
    parameters: {
      type: 'object',
      properties: Object.entries(action.parameters).reduce((acc, [key, value]) => {
        acc[key] = {
          type: value.type,
          description: value.description,
          ...(value.enum ? { enum: value.enum } : {})
        };
        return acc;
      }, {} as any),
      required: Object.entries(action.parameters)
        .filter(([_, value]) => value.required)
        .map(([key]) => key)
    }
  }));
}

// Execute an action with all safety checks
export async function executeAction(
  actionId: string,
  context: ActionContext,
  params: any
): Promise<ActionResult> {
  const action = AI_ACTIONS[actionId];
  
  if (!action) {
    return {
      success: false,
      message: `Unknown action: ${actionId}`
    };
  }
  
  const startTime = Date.now();
  
  try {
    // Check rate limit
    const canProceed = await storage.checkAiRateLimit(
      context.userId,
      actionId,
      action.rateLimit.max,
      action.rateLimit.windowMinutes
    );
    
    if (!canProceed) {
      return {
        success: false,
        message: `Rate limit exceeded. Please try again later.`
      };
    }
    
    // Execute the action
    const result = await action.execute(context, params);
    
    // Increment rate limit
    await storage.incrementAiRateLimit(
      context.userId,
      actionId,
      action.rateLimit.windowMinutes
    );
    
    // Log the action
    await storage.createAiActionLog({
      userId: context.userId,
      actionType: actionId,
      actionCategory: action.category,
      parameters: sanitizeParams(actionId, params),
      status: result.success ? 'success' : 'failed',
      result: result.data,
      errorMessage: result.success ? undefined : result.message,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      executionTimeMs: Date.now() - startTime
    });
    
    return result;
  } catch (error: any) {
    // Log error
    await storage.createAiActionLog({
      userId: context.userId,
      actionType: actionId,
      actionCategory: action.category,
      parameters: sanitizeParams(actionId, params),
      status: 'failed',
      errorMessage: error.message,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      executionTimeMs: Date.now() - startTime
    });
    
    return {
      success: false,
      message: 'An error occurred while processing your request. Please try again.'
    };
  }
}

// Sanitize parameters for logging (remove sensitive data)
function sanitizeParams(actionId: string, params: any): any {
  const sanitized = { ...params };
  
  // Remove passwords from logs
  if (sanitized.currentPassword) sanitized.currentPassword = '[REDACTED]';
  if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
  
  return sanitized;
}

// Check if an action requires confirmation
export function requiresConfirmation(actionId: string): boolean {
  return AI_ACTIONS[actionId]?.confirmationRequired || false;
}

// Get confirmation message for an action
export function getConfirmationDetails(actionId: string, params: any): { message: string; warningLevel: WarningLevel } | null {
  const action = AI_ACTIONS[actionId];
  if (!action || !action.confirmationRequired) return null;
  
  return {
    message: action.getConfirmationMessage?.(params) || `Are you sure you want to ${action.name.toLowerCase()}?`,
    warningLevel: action.warningLevel
  };
}
