import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - supports both Google OAuth and email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: text("password"), // For email/password auth (hashed with bcrypt)
  googleId: varchar("google_id").unique(), // Google OAuth ID (optional)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Email verification fields
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  tokenExpiry: timestamp("token_expiry"),
  
  // Password reset fields
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  
  // Admin flag
  isAdmin: boolean("is_admin").notNull().default(false),
  
  // Onboarding tour tracking - only shows once after plan activation
  hasCompletedOnboarding: boolean("has_completed_onboarding").notNull().default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  
  // Credit System - Expert-level business model
  planCredits: integer("plan_credits").notNull().default(0), // Credits from tier purchase
  bonusCredits: integer("bonus_credits").notNull().default(0), // Credits from referrals, promos, add-ons
  creditsUsed: integer("credits_used").notNull().default(0), // Total credits consumed
  lastCreditRefresh: timestamp("last_credit_refresh"), // For Ultimate annual refresh
  hasUltimateAssurance: boolean("has_ultimate_assurance").notNull().default(false), // £99/year recurring
  
  // Tier upgrade tracking (for differential pricing)
  previousTier: varchar("previous_tier", { length: 20 }),
  tierUpgradedAt: timestamp("tier_upgraded_at"),
  totalSpent: integer("total_spent").notNull().default(0), // Total £ spent in pence
  
  subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default('free'), // free, basic, premium, enterprise, ultimate
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default('inactive'), // active, inactive, cancelled, past_due
  
  // Admin Control Fields
  isBanned: boolean("is_banned").notNull().default(false),
  suspendedUntil: timestamp("suspended_until"),
  suspendedReason: text("suspended_reason"),
  adminNotes: text("admin_notes"),
  lastActivityAt: timestamp("last_activity_at"),
  tierExpiresAt: timestamp("tier_expires_at"),
  tierOverrideBy: varchar("tier_override_by"),
  tierOverrideReason: text("tier_override_reason"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const businessPlans = pgTable("business_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tier: varchar("tier", { length: 20 }).notNull(),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  problem: text("problem").notNull(),
  uniqueness: text("uniqueness").notNull(),
  technology: text("technology").notNull(),
  experience: text("experience").notNull(),
  funding: integer("funding").notNull(),
  revenue: text("revenue").notNull(),
  jobCreation: integer("job_creation").notNull(),
  expansion: text("expansion").notNull(),
  vision: text("vision").notNull(),
  
  innovationStage: varchar("innovation_stage", { length: 50 }).notNull(),
  productStatus: text("product_status").notNull(),
  existingCustomers: text("existing_customers"),
  betaTesters: text("beta_testers"),
  tractionEvidence: text("traction_evidence"),
  
  techStack: text("tech_stack").notNull(),
  dataArchitecture: text("data_architecture").notNull(),
  aiMethodology: text("ai_methodology").notNull(),
  complianceDesign: text("compliance_design").notNull(),
  patentStatus: text("patent_status").notNull(),
  
  founderEducation: text("founder_education").notNull(),
  founderWorkHistory: text("founder_work_history").notNull(),
  founderAchievements: text("founder_achievements").notNull(),
  relevantProjects: text("relevant_projects").notNull(),
  
  monthlyProjections: text("monthly_projections").notNull(),
  customerAcquisitionCost: integer("cac").notNull(),
  lifetimeValue: integer("ltv").notNull(),
  paybackPeriod: integer("payback_period").notNull(),
  fundingSources: text("funding_sources").notNull(),
  detailedCosts: text("detailed_costs").notNull(),
  
  competitors: text("competitors").notNull(),
  competitiveDifferentiation: text("competitive_differentiation").notNull(),
  
  customerInterviews: text("customer_interviews").notNull(),
  lettersOfIntent: text("letters_of_intent"),
  willingnessToPay: text("willingness_to_pay").notNull(),
  marketSize: text("market_size").notNull(),
  
  regulatoryRequirements: text("regulatory_requirements").notNull(),
  complianceTimeline: text("compliance_timeline").notNull(),
  complianceBudget: integer("compliance_budget").notNull(),
  
  hiringPlan: text("hiring_plan").notNull(),
  specificRegions: text("specific_regions").notNull(),
  internationalPlan: text("international_plan"),
  
  targetEndorser: text("target_endorser").notNull(),
  contactPointsStrategy: text("contact_points_strategy").notNull(),
  
  supportingEvidence: text("supporting_evidence"),
  
  // Theme/Template Selection
  themeId: varchar("theme_id", { length: 50 }), // 'white-red-modern', 'white-red-corporate', 'blue-modern', etc.
  themePrimaryColor: varchar("theme_primary_color", { length: 20 }), // Hex color like '#dc2626'
  themeSecondaryColor: varchar("theme_secondary_color", { length: 20 }), // Hex color like '#1e3a5f'
  themeFont: varchar("theme_font", { length: 50 }), // 'Inter', 'Poppins', 'Montserrat', etc.
  themeAppliedAt: timestamp("theme_applied_at"),
  
  // Custom Cover Image (Canva uploads)
  backgroundImage: text("background_image"), // Base64 encoded image data
  useFullCoverImage: boolean("use_full_cover_image").default(false), // Use full custom cover instead of SVG theme
  textElements: text("text_elements"), // JSON string of text elements for custom cover overlay
  
  generatedContent: text("generated_content"),
  chartData: text("chart_data"), // JSON string containing structured chart data for visualizations
  pdfUrl: text("pdf_url"),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  currentGenerationStage: text("current_generation_stage"),
  stripeSessionId: text("stripe_session_id"),
  userId: varchar("user_id"),
  isDemoData: boolean("is_demo_data").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Google OAuth user upsert schema for Railway deployment
export const upsertUserSchema = createInsertSchema(users).pick({
  email: true,
  googleId: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  isEmailVerified: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessPlanSchema = createInsertSchema(businessPlans).omit({
  id: true,
  createdAt: true,
  generatedContent: true,
  pdfUrl: true,
  status: true,
  stripeSessionId: true,
});

export const questionnaireSchema = z.object({
  tier: z.enum(['free', 'basic', 'premium', 'enterprise', 'ultimate']),
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  problem: z.string().min(10, "Please provide more detail about the problem"),
  uniqueness: z.string().min(10, "Please explain what makes your idea unique"),
  technology: z.string().min(10, "Please describe your technology or approach"),
  experience: z.string().min(10, "Please describe your relevant experience"),
  funding: z.number().min(0, "Funding must be positive"),
  revenue: z.string().min(10, "Please explain your revenue model"),
  jobCreation: z.number().min(1, "Must plan to create at least 1 job"),
  expansion: z.string().min(10, "Please describe your expansion strategy"),
  vision: z.string().min(10, "Please describe your long-term vision"),
  
  innovationStage: z.enum(['concept', 'pre-mvp', 'mvp-complete', 'market-validation'], {
    errorMap: () => ({ message: "Please select your innovation stage" })
  }),
  productStatus: z.string().min(20, "Please provide detailed product development status"),
  existingCustomers: z.string().optional(),
  betaTesters: z.string().optional(),
  tractionEvidence: z.string().optional(),
  
  techStack: z.string().min(20, "Please specify your exact technology stack (frameworks, languages, tools)"),
  dataArchitecture: z.string().min(50, "Describe your data architecture and integration approach in detail"),
  aiMethodology: z.string().optional().or(z.literal('')), // Optional for non-AI businesses
  complianceDesign: z.string().min(50, "Explain compliance approach (GDPR, DCB0129, DCB0160, etc.)"),
  patentStatus: z.string().min(10, "Patent status: pending, filed, none, or defensive publication"),
  
  founderEducation: z.string().min(20, "List degrees, certifications, and relevant education"),
  founderWorkHistory: z.string().min(50, "Detailed work history with specific roles and achievements"),
  founderAchievements: z.string().min(50, "Measurable achievements (projects delivered, revenue generated, etc.)"),
  relevantProjects: z.string().min(50, "Specific projects relevant to this business with outcomes"),
  
  monthlyProjections: z.string().min(100, "Provide 36-month monthly cashflow projections"),
  customerAcquisitionCost: z.number().min(1, "Estimated customer acquisition cost required"),
  lifetimeValue: z.number().min(1, "Estimated customer lifetime value required"),
  paybackPeriod: z.number().min(1, "Customer payback period in months"),
  fundingSources: z.string().min(50, "Detail all funding sources (personal, grants, investors) with amounts"),
  detailedCosts: z.string().min(100, "Break down all costs: development, regulatory, operations, marketing, etc."),
  
  competitors: z.string().min(100, "List 5+ specific competitors with their strengths/weaknesses"),
  competitiveDifferentiation: z.string().min(100, "Explain your measurable competitive advantage with specific metrics"),
  
  customerInterviews: z.string().min(100, "Summarize findings from 20-30 customer discovery interviews"),
  lettersOfIntent: z.string().optional(),
  willingnessToPay: z.string().min(50, "Evidence of what customers will pay (survey data, LOIs, pilot pricing)"),
  marketSize: z.string().min(50, "Calculate TAM (Total), SAM (Serviceable), SOM (Obtainable) markets"),
  
  regulatoryRequirements: z.string().min(100, "List all regulatory requirements (certifications, compliance standards) with timeline and costs"),
  complianceTimeline: z.string().min(50, "Timeline for achieving each compliance requirement"),
  complianceBudget: z.number().min(0, "Total budget allocated for regulatory compliance"),
  
  hiringPlan: z.string().min(100, "Specific roles, salaries, and hiring milestones for job creation"),
  specificRegions: z.string().min(20, "Name specific cities/regions you're targeting (e.g., Greater London, Manchester)"),
  internationalPlan: z.string().optional(),
  
  targetEndorser: z.string().min(10, "Which endorsing body are you targeting? (Envestors, UKES, Innovator International, GEP)"),
  contactPointsStrategy: z.string().min(50, "Strategy for 6 required contact points with endorser over 3 years"),
  
  supportingEvidence: z.string().optional(),
  
  // Theme settings (optional)
  themeId: z.string().nullable().optional(),
  themePrimaryColor: z.string().nullable().optional(),
  themeSecondaryColor: z.string().nullable().optional(),
  themeFont: z.string().nullable().optional(),
  themeAppliedAt: z.coerce.date().nullable().optional(),
  
  // Custom cover image (Canva uploads)
  backgroundImage: z.string().nullable().optional(), // Base64 encoded image
  useFullCoverImage: z.boolean().optional().default(false),
  textElements: z.string().nullable().optional(), // JSON string of text overlay elements
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusinessPlan = z.infer<typeof insertBusinessPlanSchema>;
export type BusinessPlan = typeof businessPlans.$inferSelect;
export type QuestionnaireData = z.infer<typeof questionnaireSchema>;

// Session Handoff for QR Mobile Upload
export const sessionHandoffs = pgTable("session_handoffs", {
  token: varchar("token", { length: 36 }).primaryKey(),
  toolId: text("tool_id").notNull(),
  payload: jsonb("payload").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionHandoffSchema = createInsertSchema(sessionHandoffs).omit({
  createdAt: true,
});

export type InsertSessionHandoff = z.infer<typeof insertSessionHandoffSchema>;
export type SessionHandoff = typeof sessionHandoffs.$inferSelect;

// Referral Tracking for Share Buttons
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  toolId: text("tool_id").notNull(),
  channel: varchar("channel", { length: 20 }).notNull(), // whatsapp, email, twitter, linkedin
  sessionToken: varchar("session_token", { length: 36 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// File Storage for Backend Upload Handling
export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  toolId: text("tool_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size").notNull(),
  blobUrl: text("blob_url"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;

// Analytics for Tool Usage & Sharing
export const toolAnalytics = pgTable("tool_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  toolId: text("tool_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // save, export, share, upload, download
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertToolAnalyticsSchema = createInsertSchema(toolAnalytics).omit({
  id: true,
  createdAt: true,
});

export type InsertToolAnalytics = z.infer<typeof insertToolAnalyticsSchema>;
export type ToolAnalytic = typeof toolAnalytics.$inferSelect;

// Premium Cover Template Purchases
export const premiumCoverPurchases = pgTable("premium_cover_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  templateId: varchar("template_id", { length: 50 }).notNull(),
  price: integer("price").notNull(), // Price in pence (500 = £5)
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, completed, failed
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const insertPremiumCoverPurchaseSchema = createInsertSchema(premiumCoverPurchases).omit({
  id: true,
  purchasedAt: true,
});

export type InsertPremiumCoverPurchase = z.infer<typeof insertPremiumCoverPurchaseSchema>;
export type PremiumCoverPurchase = typeof premiumCoverPurchases.$inferSelect;

// ============================================
// CREDIT SYSTEM - PhD-Level Business Model
// ALL TIERS HAVE FINITE CREDIT LIMITS
// ============================================

// Master credit configuration - SINGLE SOURCE OF TRUTH
// Each credit/coin = 1 business plan generation
// 2026 PRICING - Effective January 2026
export const TIER_CREDITS = {
  free: { planCredits: 0, maxBusinesses: 0, maxRevisions: 0, pages: '10-15' },
  basic: { planCredits: 1, maxBusinesses: 1, maxRevisions: 1, pages: '25-35' },
  premium: { planCredits: 3, maxBusinesses: 3, maxRevisions: 3, pages: '40-55' },
  enterprise: { planCredits: 6, maxBusinesses: 6, maxRevisions: 6, pages: '56-80' },
  ultimate: { planCredits: 12, maxBusinesses: 12, maxRevisions: 12, pages: '80+' },
} as const;

// Helper function to get credits for a tier - use this everywhere
export function getTierCredits(tier: string): number {
  const config = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];
  return config?.planCredits ?? 0;
}

// Tier pricing in pence (matching pricing page)
// 2026 PRICING - Effective January 2026
export const TIER_PRICING = {
  free: 0,
  basic: 2900, // £29
  premium: 5900, // £59
  enterprise: 8500, // £85
  ultimate: 11000, // £110
} as const;

// Add-on/Coin pricing in pence
// 2026 PRICING - Effective January 2026
export const ADDON_PRICING = {
  single_coin: 1500, // £15 - 1 coin
  double_coins: 2500, // £25 - 2 coins (save £5)
  triple_coins: 3500, // £35 - 3 coins (save £10)
  five_coins: 5500, // £55 - 5 coins (save £20)
  ten_coins: 9900, // £99 - 10 coins (best value)
} as const;

// Credit Transactions - Ledger of all credit movements
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  
  // Transaction type
  type: varchar("type", { length: 30 }).notNull(), // tier_purchase, addon_purchase, referral_bonus, promo_bonus, plan_generation, refund, admin_adjustment, annual_refresh
  
  // Credit movement (positive = added, negative = consumed)
  creditsChange: integer("credits_change").notNull(),
  creditsType: varchar("credits_type", { length: 20 }).notNull().default('plan'), // plan, bonus
  
  // Balance after transaction
  balanceAfter: integer("balance_after").notNull(),
  
  // Reference data
  referenceId: varchar("reference_id"), // businessPlanId, stripePaymentId, referralCodeId, promoCodeId
  referenceType: varchar("reference_type", { length: 30 }), // business_plan, stripe_payment, referral, promo
  
  // Additional context
  description: text("description"),
  metadata: jsonb("metadata"), // Extra data like tier upgrade details, addon type, etc.
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_credit_transactions_user").on(table.userId),
  index("idx_credit_transactions_type").on(table.type),
  index("idx_credit_transactions_created").on(table.createdAt),
]);

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

// Add-on Purchases - Track all add-on purchases
export const addonPurchases = pgTable("addon_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  
  // Add-on type
  addonType: varchar("addon_type", { length: 30 }).notNull(), // single_credit, triple_pack, partner_bundle, rejection_recovery, rush_delivery, compliance_refresh, ultimate_assurance
  
  // Pricing
  amount: integer("amount").notNull(), // in pence
  currency: varchar("currency", { length: 3 }).notNull().default('GBP'),
  
  // Credits granted (if applicable)
  creditsGranted: integer("credits_granted").notNull().default(0),
  
  // Validity (for recurring add-ons like assurance, refresh)
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  
  // Stripe integration
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('completed'), // pending, completed, refunded, cancelled
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_addon_purchases_user").on(table.userId),
  index("idx_addon_purchases_type").on(table.addonType),
  index("idx_addon_purchases_status").on(table.status),
]);

export const insertAddonPurchaseSchema = createInsertSchema(addonPurchases).omit({
  id: true,
  createdAt: true,
});

export type InsertAddonPurchase = z.infer<typeof insertAddonPurchaseSchema>;
export type AddonPurchase = typeof addonPurchases.$inferSelect;

// ============================================
// REFERRAL & PROMO CODE SYSTEM
// ============================================

// Referral Codes - User-generated codes for referring others
export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Owner of this referral code
  code: varchar("code", { length: 20 }).unique().notNull(), // Unique referral code
  
  // Reward configuration
  rewardType: varchar("reward_type", { length: 20 }).notNull().default('percentage'), // percentage, fixed_amount, credits, tier_upgrade
  rewardValue: integer("reward_value").notNull().default(10), // e.g., 10% or £10
  refereeDiscount: integer("referee_discount").notNull().default(10), // Discount for person signing up with code
  
  // Stripe integration
  stripeCouponId: text("stripe_coupon_id"), // Associated Stripe coupon for discounts
  
  // Status and limits
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, paused, expired, revoked
  maxUses: integer("max_uses"), // null = unlimited
  
  // Aggregated stats (denormalized for performance)
  totalReferrals: integer("total_referrals").notNull().default(0),
  successfulReferrals: integer("successful_referrals").notNull().default(0),
  pendingReferrals: integer("pending_referrals").notNull().default(0),
  totalEarnings: integer("total_earnings").notNull().default(0), // in pence
  paidEarnings: integer("paid_earnings").notNull().default(0), // in pence
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_referral_codes_user").on(table.userId),
  index("idx_referral_codes_code").on(table.code),
  index("idx_referral_codes_status").on(table.status),
]);

// Referral Events - Tracks each referral through its lifecycle
export const referralEvents = pgTable("referral_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCodeId: varchar("referral_code_id").notNull(),
  referrerId: varchar("referrer_id").notNull(), // User who referred
  refereeId: varchar("referee_id"), // User who signed up (null until signup complete)
  refereeEmail: varchar("referee_email"), // Email used to sign up
  
  // Status lifecycle: visited -> signed_up -> qualified -> rewarded
  status: varchar("status", { length: 20 }).notNull().default('visited'),
  
  // Tracking
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
  signedUpAt: timestamp("signed_up_at"),
  qualifiedAt: timestamp("qualified_at"), // When payment or criteria met
  rewardedAt: timestamp("rewarded_at"), // When reward issued
  
  // Attribution
  landingPage: text("landing_page"),
  userAgent: text("user_agent"),
  ipHash: varchar("ip_hash", { length: 64 }), // Hashed for privacy
  
  // Reward details when qualified
  rewardAmount: integer("reward_amount"), // in pence
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_referral_events_code").on(table.referralCodeId),
  index("idx_referral_events_referrer").on(table.referrerId),
  index("idx_referral_events_referee").on(table.refereeId),
  index("idx_referral_events_status").on(table.status),
]);

// Referral Rewards - Ledger of earned rewards
export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  referralEventId: varchar("referral_event_id").notNull(),
  
  // Reward details
  type: varchar("type", { length: 20 }).notNull(), // cash, credits, tier_upgrade
  amount: integer("amount").notNull(), // in pence or credits
  currency: varchar("currency", { length: 3 }).notNull().default('GBP'),
  
  // Status: pending, approved, paid, cancelled
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  notes: text("notes"), // Admin notes (e.g., rejection reason)
  
  // Payout details
  payoutMethod: varchar("payout_method", { length: 20 }), // bank_transfer, stripe, credits
  payoutReference: text("payout_reference"),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_referral_rewards_user").on(table.userId),
  index("idx_referral_rewards_status").on(table.status),
]);

// Promo Codes - Admin-created discount codes for marketing (or partner-owned)
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 30 }).unique().notNull(),
  
  // Partner ownership - if set, this is a partner promo code
  ownerId: varchar("owner_id"), // User ID of the partner who owns this code
  
  // Campaign info
  name: text("name").notNull(), // Internal name for campaign
  description: text("description"),
  
  // Discount configuration
  discountType: varchar("discount_type", { length: 20 }).notNull(), // percentage, fixed
  discountValue: integer("discount_value").notNull(), // e.g., 20 for 20% or £20
  
  // Tier upgrade - if set, this promo code grants a tier upgrade when redeemed
  grantsTier: varchar("grants_tier", { length: 20 }), // basic, premium, enterprise, ultimate
  grantsCredits: integer("grants_credits"), // Optional bonus credits to grant
  
  // Eligibility
  eligibleTiers: text("eligible_tiers").array(), // Which tiers can use this: ['basic', 'premium']
  minPurchaseAmount: integer("min_purchase_amount"), // Minimum purchase in pence
  
  // Usage limits
  maxTotalUses: integer("max_total_uses"), // null = unlimited
  maxUsesPerUser: integer("max_uses_per_user").default(1),
  currentUses: integer("current_uses").notNull().default(0),
  
  // Validity period
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  
  // Stripe integration
  stripeCouponId: text("stripe_coupon_id"),
  stripePromotionCodeId: text("stripe_promotion_code_id"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, paused, expired, deleted
  
  // Admin tracking
  createdBy: varchar("created_by").notNull(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_promo_codes_code").on(table.code),
  index("idx_promo_codes_status").on(table.status),
  index("idx_promo_codes_owner").on(table.ownerId),
]);

// Promo Code Redemptions - Audit trail for promo code usage
export const promoRedemptions = pgTable("promo_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promoCodeId: varchar("promo_code_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Transaction details
  orderId: text("order_id"), // Stripe session ID or internal order
  discountApplied: integer("discount_applied").notNull(), // in pence
  originalAmount: integer("original_amount").notNull(), // in pence
  finalAmount: integer("final_amount").notNull(), // in pence
  
  // Context
  appliedAt: varchar("applied_at", { length: 20 }).notNull(), // checkout, signup, upgrade
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_promo_redemptions_code").on(table.promoCodeId),
  index("idx_promo_redemptions_user").on(table.userId),
]);

// Referral Visits - Anonymous click tracking
export const referralVisits = pgTable("referral_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCodeId: varchar("referral_code_id"),
  promoCodeId: varchar("promo_code_id"),
  
  // Visitor tracking (privacy-compliant)
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(), // Hashed fingerprint
  
  // Attribution
  source: varchar("source", { length: 50 }), // direct, email, social, etc.
  landingPage: text("landing_page"),
  userAgent: text("user_agent"),
  
  // Conversion tracking
  converted: boolean("converted").notNull().default(false),
  convertedUserId: varchar("converted_user_id"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_referral_visits_code").on(table.referralCodeId),
  index("idx_referral_visits_promo").on(table.promoCodeId),
  index("idx_referral_visits_visitor").on(table.visitorHash),
]);

// Schemas and Types for Referral System
export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalReferrals: true,
  successfulReferrals: true,
  pendingReferrals: true,
  totalEarnings: true,
  paidEarnings: true,
});

export const insertReferralEventSchema = createInsertSchema(referralEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentUses: true,
});

export const insertPromoRedemptionSchema = createInsertSchema(promoRedemptions).omit({
  id: true,
  createdAt: true,
});

export const insertReferralVisitSchema = createInsertSchema(referralVisits).omit({
  id: true,
  createdAt: true,
});

export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;

export type InsertReferralEvent = z.infer<typeof insertReferralEventSchema>;
export type ReferralEvent = typeof referralEvents.$inferSelect;

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

export type InsertPromoRedemption = z.infer<typeof insertPromoRedemptionSchema>;
export type PromoRedemption = typeof promoRedemptions.$inferSelect;

export type InsertReferralVisit = z.infer<typeof insertReferralVisitSchema>;
export type ReferralVisit = typeof referralVisits.$inferSelect;

// Payout Requests Table
export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  
  // Amount and currency
  amount: integer("amount").notNull(), // Amount in pence/cents
  currency: varchar("currency", { length: 3 }).notNull().default('GBP'),
  
  // Payment details
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // bank_transfer, paypal, stripe
  paymentDetails: text("payment_details").notNull(), // JSON string with payment info
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, processing, completed, rejected
  
  // Admin handling
  processedBy: varchar("processed_by"),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  
  // Transaction reference
  transactionRef: varchar("transaction_ref", { length: 100 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_payout_user").on(table.userId),
  index("idx_payout_status").on(table.status),
]);

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  processedBy: true,
  processedAt: true,
  transactionRef: true,
});

export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
export type PayoutRequest = typeof payoutRequests.$inferSelect;

// Support Tickets Table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  email: varchar("email").notNull(),
  topic: varchar("topic", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('open'), // open, in_progress, resolved, closed
  priority: varchar("priority", { length: 20 }).default('normal'), // low, normal, high, urgent
  assignedTo: varchar("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  response: text("response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_support_user").on(table.userId),
  index("idx_support_status").on(table.status),
]);

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  response: true,
  assignedTo: true,
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// User Documents Table (for visa document storage)
export const userDocuments = pgTable("user_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // passport, bank_statement, business_plan, endorsement, etc.
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size").notNull(),
  status: varchar("status", { length: 20 }).default('pending'), // pending, verified, rejected
  notes: text("notes"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_document_user").on(table.userId),
  index("idx_document_category").on(table.category),
]);

export const insertUserDocumentSchema = createInsertSchema(userDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserDocument = z.infer<typeof insertUserDocumentSchema>;
export type UserDocument = typeof userDocuments.$inferSelect;

// Document Extraction Table (for AI-powered auto-fill)
export const documentExtractions = pgTable("document_extractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  documentIds: jsonb("document_ids").notNull(), // Array of document IDs used
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  extractedData: jsonb("extracted_data"), // Extracted field values
  confidence: jsonb("confidence"), // Confidence scores per field
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_extraction_user").on(table.userId),
]);

export const insertDocumentExtractionSchema = createInsertSchema(documentExtractions).omit({
  id: true,
  createdAt: true,
});

export type InsertDocumentExtraction = z.infer<typeof insertDocumentExtractionSchema>;
export type DocumentExtraction = typeof documentExtractions.$inferSelect;

// ============================================
// PREMIUM VALUE FEATURES - 8 New Systems
// ============================================

// 1. Notification Preferences & Scheduled Notifications
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  
  // Email notification settings
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  deadlineReminders: boolean("deadline_reminders").notNull().default(true),
  breakingNewsAlerts: boolean("breaking_news_alerts").notNull().default(true),
  toolCompletionCelebrations: boolean("tool_completion_celebrations").notNull().default(true),
  progressMilestones: boolean("progress_milestones").notNull().default(true),
  
  // Digest frequency: daily, weekly, monthly
  digestFrequency: varchar("digest_frequency", { length: 20 }).notNull().default('weekly'),
  
  // Preferred time for digests (24h format)
  preferredTime: varchar("preferred_time", { length: 5 }).default('09:00'),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_notif_pref_user").on(table.userId),
]);

export const scheduledNotifications = pgTable("scheduled_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // deadline_reminder, weekly_digest, breaking_news, milestone
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, sent, failed, cancelled
  metadata: jsonb("metadata"), // Additional data like tool_id, milestone_id, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_sched_notif_user").on(table.userId),
  index("idx_sched_notif_status").on(table.status),
  index("idx_sched_notif_scheduled").on(table.scheduledFor),
]);

// 2. AI Document Reviews
export const documentReviews = pgTable("document_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  documentId: varchar("document_id"), // Reference to userDocuments if uploaded
  documentName: varchar("document_name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // business_plan, personal_statement, evidence, etc.
  documentContent: text("document_content"), // Extracted text for analysis
  
  // AI Analysis Results
  overallScore: integer("overall_score"), // 0-100
  strengthsFound: jsonb("strengths_found"), // Array of strengths
  weaknessesFound: jsonb("weaknesses_found"), // Array of weaknesses
  suggestions: jsonb("suggestions"), // Array of improvement suggestions
  endorserAlignment: integer("endorser_alignment"), // 0-100 alignment with endorser criteria
  
  // Detailed category scores
  innovationScore: integer("innovation_score"),
  viabilityScore: integer("viability_score"),
  scalabilityScore: integer("scalability_score"),
  
  aiProvider: varchar("ai_provider", { length: 50 }), // openai, gemini, claude
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_doc_review_user").on(table.userId),
  index("idx_doc_review_status").on(table.status),
]);

// 3. Voice Interview Practice Sessions
export const interviewSessions = pgTable("interview_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionType: varchar("session_type", { length: 50 }).notNull(), // endorser_pitch, home_office, investor
  duration: integer("duration"), // Duration in seconds
  
  // Overall assessment
  overallScore: integer("overall_score"), // 0-100
  confidenceScore: integer("confidence_score"),
  clarityScore: integer("clarity_score"),
  contentScore: integer("content_score"),
  
  // Detailed feedback
  feedback: jsonb("feedback"), // Structured feedback object
  strengths: jsonb("strengths"),
  areasForImprovement: jsonb("areas_for_improvement"),
  
  // Recording reference (if voice enabled)
  recordingUrl: text("recording_url"),
  transcript: text("transcript"),
  
  questionsAsked: jsonb("questions_asked"),
  responsesGiven: jsonb("responses_given"),
  
  status: varchar("status", { length: 20 }).notNull().default('in_progress'), // in_progress, completed, reviewed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_interview_user").on(table.userId),
  index("idx_interview_status").on(table.status),
]);

// 4. Success Stories Library
export const successStories = pgTable("success_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Anonymized applicant info
  applicantAlias: varchar("applicant_alias", { length: 100 }).notNull(), // e.g., "Tech Founder from London"
  industry: varchar("industry", { length: 100 }).notNull(),
  endorserBody: varchar("endorser_body", { length: 100 }).notNull(),
  
  // Story details
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  fullStory: text("full_story").notNull(),
  
  // Key metrics
  timeToApproval: integer("time_to_approval"), // Days from application to approval
  investmentAmount: varchar("investment_amount", { length: 50 }),
  jobsCreated: integer("jobs_created"),
  
  // What they did right
  keySuccessFactors: jsonb("key_success_factors"),
  challengesOvercome: jsonb("challenges_overcome"),
  adviceGiven: jsonb("advice_given"),
  
  // Timeline breakdown
  timelineBreakdown: jsonb("timeline_breakdown"),
  
  // Tier access
  requiredTier: varchar("required_tier", { length: 20 }).notNull().default('premium'),
  
  // Publishing
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_success_industry").on(table.industry),
  index("idx_success_endorser").on(table.endorserBody),
  index("idx_success_published").on(table.isPublished),
]);

// 5. Calendar Integration & Synced Events
export const calendarConnections = pgTable("calendar_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // google, apple, outlook
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  calendarId: varchar("calendar_id", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_calendar_user").on(table.userId),
]);

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  connectionId: varchar("connection_id"),
  externalEventId: varchar("external_event_id", { length: 255 }), // ID from external calendar
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // deadline, milestone, reminder, appointment
  
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isAllDay: boolean("is_all_day").notNull().default(false),
  
  // Source reference
  sourceType: varchar("source_type", { length: 50 }), // tool, milestone, visa_deadline
  sourceId: varchar("source_id"),
  
  isSynced: boolean("is_synced").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_cal_event_user").on(table.userId),
  index("idx_cal_event_date").on(table.startDate),
]);

// 6. Achievement System
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).notNull().unique(), // unique identifier
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // tools, progress, engagement, mastery
  
  // Badge styling
  icon: varchar("icon", { length: 50 }).notNull(), // lucide icon name
  color: varchar("color", { length: 20 }).notNull(), // tailwind color
  
  // Requirements
  requirementType: varchar("requirement_type", { length: 50 }).notNull(), // tool_count, category_complete, streak, score
  requirementValue: integer("requirement_value").notNull(),
  requirementMeta: jsonb("requirement_meta"), // Additional requirements
  
  // Rewards
  points: integer("points").notNull().default(0),
  
  // Tier restrictions
  requiredTier: varchar("required_tier", { length: 20 }).notNull().default('free'),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  progress: integer("progress").notNull().default(0), // Current progress towards achievement
  isComplete: boolean("is_complete").notNull().default(false),
  metadata: jsonb("metadata"), // Additional data about how it was earned
}, (table) => [
  index("idx_user_achievement_user").on(table.userId),
  index("idx_user_achievement_complete").on(table.isComplete),
]);

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // visa_ready, tool_mastery, category_complete
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Certificate data
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  certificateNumber: varchar("certificate_number", { length: 50 }).notNull().unique(),
  
  // Verification
  verificationUrl: text("verification_url"),
  isShareable: boolean("is_shareable").notNull().default(true),
  
  // LinkedIn integration
  linkedinShareUrl: text("linkedin_share_url"),
  
  metadata: jsonb("metadata"),
}, (table) => [
  index("idx_certificate_user").on(table.userId),
]);

// 7. Priority Support Queue (extends existing supportTickets)
export const supportSLA = pgTable("support_sla", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tier: varchar("tier", { length: 20 }).notNull().unique(), // basic, premium, enterprise, ultimate
  
  // Response time guarantees (in hours)
  firstResponseTime: integer("first_response_time").notNull(), // Hours to first response
  resolutionTime: integer("resolution_time").notNull(), // Hours to resolution
  
  // Features
  priorityLevel: integer("priority_level").notNull(), // 1-5, 5 being highest
  dedicatedAgent: boolean("dedicated_agent").notNull().default(false),
  callbackAvailable: boolean("callback_available").notNull().default(false),
  liveChat: boolean("live_chat").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 8. Document Template Library
export const documentTemplates = pgTable("document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // business_plan, cover_letter, evidence, financial, legal
  description: text("description").notNull(),
  
  // Template content
  content: text("content").notNull(), // Template with placeholders
  placeholders: jsonb("placeholders"), // List of placeholders to fill
  
  // Usage guidance
  usageGuide: text("usage_guide"),
  exampleFilled: text("example_filled"),
  
  // Tier access
  requiredTier: varchar("required_tier", { length: 20 }).notNull().default('premium'),
  
  // Metadata
  downloadCount: integer("download_count").notNull().default(0),
  rating: integer("rating"), // 1-5 stars
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_template_category").on(table.category),
  index("idx_template_tier").on(table.requiredTier),
]);

export const userTemplateDownloads = pgTable("user_template_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  templateId: varchar("template_id").notNull(),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
  customizations: jsonb("customizations"), // User's filled placeholders
}, (table) => [
  index("idx_template_dl_user").on(table.userId),
]);

// Insert schemas for new tables
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduledNotificationSchema = createInsertSchema(scheduledNotifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertDocumentReviewSchema = createInsertSchema(documentReviews).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertSuccessStorySchema = createInsertSchema(successStories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertCalendarConnectionSchema = createInsertSchema(calendarConnections).omit({
  id: true,
  createdAt: true,
  lastSyncAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
});

// Types
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

export type ScheduledNotification = typeof scheduledNotifications.$inferSelect;
export type InsertScheduledNotification = z.infer<typeof insertScheduledNotificationSchema>;

export type DocumentReview = typeof documentReviews.$inferSelect;
export type InsertDocumentReview = z.infer<typeof insertDocumentReviewSchema>;

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;

export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = z.infer<typeof insertSuccessStorySchema>;

export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type InsertCalendarConnection = z.infer<typeof insertCalendarConnectionSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;

export type SupportSLA = typeof supportSLA.$inferSelect;

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;

export type UserTemplateDownload = typeof userTemplateDownloads.$inferSelect;

// ============================================
// IMMIGRATION LAWYER REVIEW CENTER
// Professional Document Review System
// ============================================

// Immigration Lawyers Table - Stores lawyer profiles
export const immigrationLawyers = pgTable("immigration_lawyers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Info
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  
  // Professional Credentials
  oiscLevel: varchar("oisc_level", { length: 10 }), // Level 1, 2, or 3
  oiscRegistrationNumber: varchar("oisc_registration_number", { length: 50 }),
  sraNumber: varchar("sra_number", { length: 50 }), // Solicitors Regulation Authority
  firmName: varchar("firm_name", { length: 255 }),
  
  // Specializations
  specializations: jsonb("specializations"), // Array: ['innovator_founder', 'global_talent', 'skilled_worker']
  yearsExperience: integer("years_experience"),
  successRate: integer("success_rate"), // Percentage 0-100
  
  // Availability & Capacity
  isAvailable: boolean("is_available").notNull().default(true),
  maxConcurrentReviews: integer("max_concurrent_reviews").notNull().default(5),
  currentReviewCount: integer("current_review_count").notNull().default(0),
  
  // Performance Metrics
  totalReviewsCompleted: integer("total_reviews_completed").notNull().default(0),
  averageRating: integer("average_rating"), // 1-5 stars (stored as integer, display as stars)
  averageTurnaroundHours: integer("average_turnaround_hours"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, inactive, suspended
  verifiedAt: timestamp("verified_at"),
  
  // Notes
  bio: text("bio"),
  notes: text("notes"), // Admin notes
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_lawyer_email").on(table.email),
  index("idx_lawyer_status").on(table.status),
  index("idx_lawyer_available").on(table.isAvailable),
]);

// Lawyer Document Reviews - Track each review assignment
export const lawyerDocumentReviews = pgTable("lawyer_document_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Relationships
  businessPlanId: varchar("business_plan_id").notNull(), // Links to businessPlans table
  userId: varchar("user_id").notNull(), // The applicant/user
  lawyerId: varchar("lawyer_id"), // Assigned lawyer (null if unassigned)
  
  // Review Details
  documentType: varchar("document_type", { length: 50 }).notNull().default('business_plan'), // business_plan, financial_projections, evidence_pack
  priority: varchar("priority", { length: 20 }).notNull().default('normal'), // low, normal, high, urgent
  tier: varchar("tier", { length: 20 }).notNull(), // User's subscription tier
  
  // Status Workflow: pending -> assigned -> in_review -> completed/revision_needed/approved/rejected
  status: varchar("status", { length: 30 }).notNull().default('pending'),
  
  // Timestamps
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"), // When lawyer started reviewing
  completedAt: timestamp("completed_at"),
  
  // Due Date & SLA
  dueDate: timestamp("due_date"),
  slaHours: integer("sla_hours"), // Expected turnaround based on tier
  isOverdue: boolean("is_overdue").notNull().default(false),
  
  // Review Results
  overallVerdict: varchar("overall_verdict", { length: 30 }), // approved, needs_revision, conditional_approval, rejected
  confidenceScore: integer("confidence_score"), // Lawyer's confidence 0-100
  complianceScore: integer("compliance_score"), // Home Office compliance 0-100
  readinessScore: integer("readiness_score"), // Visa readiness 0-100
  
  // Review Summary
  executiveSummary: text("executive_summary"), // Brief overview for user
  keyStrengths: jsonb("key_strengths"), // Array of strengths
  criticalIssues: jsonb("critical_issues"), // Array of issues that must be fixed
  recommendations: jsonb("recommendations"), // Array of recommendations
  
  // Lawyer Notes
  internalNotes: text("internal_notes"), // Private notes (admin only)
  
  // Rating (user rates the review)
  userRating: integer("user_rating"), // 1-5 stars
  userFeedback: text("user_feedback"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_ldr_business_plan").on(table.businessPlanId),
  index("idx_ldr_user").on(table.userId),
  index("idx_ldr_lawyer").on(table.lawyerId),
  index("idx_ldr_status").on(table.status),
  index("idx_ldr_priority").on(table.priority),
  index("idx_ldr_due_date").on(table.dueDate),
]);

// Review Comments - Detailed comments on specific parts of documents
export const lawyerReviewComments = pgTable("lawyer_review_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  reviewId: varchar("review_id").notNull(), // Links to lawyerDocumentReviews
  lawyerId: varchar("lawyer_id").notNull(),
  
  // Comment Details
  section: varchar("section", { length: 100 }).notNull(), // Document section: executive_summary, financial_projections, etc.
  pageNumber: integer("page_number"),
  lineReference: varchar("line_reference", { length: 50 }), // e.g., "Lines 45-52"
  
  // Comment Content
  commentType: varchar("comment_type", { length: 30 }).notNull(), // issue, suggestion, praise, question, warning
  severity: varchar("severity", { length: 20 }).notNull().default('medium'), // low, medium, high, critical
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  // Suggested Fix
  suggestedFix: text("suggested_fix"),
  exampleText: text("example_text"), // Example of how to fix
  
  // Resolution Tracking
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"), // User ID who resolved
  resolutionNote: text("resolution_note"),
  
  // Visibility
  isVisibleToUser: boolean("is_visible_to_user").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_lrc_review").on(table.reviewId),
  index("idx_lrc_lawyer").on(table.lawyerId),
  index("idx_lrc_section").on(table.section),
  index("idx_lrc_type").on(table.commentType),
  index("idx_lrc_resolved").on(table.isResolved),
]);

// Review Status History - Audit trail of all status changes
export const lawyerReviewStatusHistory = pgTable("lawyer_review_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  reviewId: varchar("review_id").notNull(),
  
  fromStatus: varchar("from_status", { length: 30 }),
  toStatus: varchar("to_status", { length: 30 }).notNull(),
  
  changedBy: varchar("changed_by").notNull(), // User or admin ID
  changedByRole: varchar("changed_by_role", { length: 20 }).notNull(), // admin, lawyer, system
  
  reason: text("reason"), // Optional reason for status change
  metadata: jsonb("metadata"), // Additional context
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_lrsh_review").on(table.reviewId),
  index("idx_lrsh_created").on(table.createdAt),
]);

// Insert Schemas for Lawyer Review System
export const insertImmigrationLawyerSchema = createInsertSchema(immigrationLawyers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalReviewsCompleted: true,
  currentReviewCount: true,
});

export const insertLawyerDocumentReviewSchema = createInsertSchema(lawyerDocumentReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestedAt: true,
  assignedAt: true,
  startedAt: true,
  completedAt: true,
  isOverdue: true,
});

export const insertLawyerReviewCommentSchema = createInsertSchema(lawyerReviewComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isResolved: true,
  resolvedAt: true,
});

export const insertLawyerReviewStatusHistorySchema = createInsertSchema(lawyerReviewStatusHistory).omit({
  id: true,
  createdAt: true,
});

// Types for Lawyer Review System
export type ImmigrationLawyer = typeof immigrationLawyers.$inferSelect;
export type InsertImmigrationLawyer = z.infer<typeof insertImmigrationLawyerSchema>;

export type LawyerDocumentReview = typeof lawyerDocumentReviews.$inferSelect;
export type InsertLawyerDocumentReview = z.infer<typeof insertLawyerDocumentReviewSchema>;

export type LawyerReviewComment = typeof lawyerReviewComments.$inferSelect;
export type InsertLawyerReviewComment = z.infer<typeof insertLawyerReviewCommentSchema>;

export type LawyerReviewStatusHistory = typeof lawyerReviewStatusHistory.$inferSelect;
export type InsertLawyerReviewStatusHistory = z.infer<typeof insertLawyerReviewStatusHistorySchema>;

// ============================================
// NEWS FEED SYSTEM - Live UK Immigration News
// ============================================

// News Articles - Cached articles from external news APIs
export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Source Information
  sourceId: varchar("source_id", { length: 100 }), // e.g., "bbc-news", "the-guardian-uk"
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  sourceUrl: text("source_url"),
  
  // Article Content
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // Full article content if available
  author: varchar("author", { length: 255 }),
  
  // URLs and Media
  url: text("url").notNull().unique(), // Article URL (unique to prevent duplicates)
  imageUrl: text("image_url"),
  
  // Categorization
  category: varchar("category", { length: 50 }).notNull().default('general'), // immigration, visa, policy, business, endorsement
  tags: text("tags").array(), // ['UK', 'visa', 'immigration', 'innovator']
  relevanceScore: integer("relevance_score").default(50), // 0-100 relevance to visa applicants
  
  // Timestamps
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  
  // AI-Generated Summary for chatbot
  aiSummary: text("ai_summary"),
  keyPoints: text("key_points").array(), // Bullet points for quick reading
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_news_published").on(table.publishedAt),
  index("idx_news_category").on(table.category),
  index("idx_news_relevance").on(table.relevanceScore),
  index("idx_news_featured").on(table.isFeatured),
  index("idx_news_active").on(table.isActive),
]);

// News Fetch Log - Track API fetches and rate limits
export const newsFetchLog = pgTable("news_fetch_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  apiSource: varchar("api_source", { length: 50 }).notNull(), // newsapi, newsdata, guardian
  endpoint: text("endpoint"),
  
  articlesFound: integer("articles_found").notNull().default(0),
  articlesAdded: integer("articles_added").notNull().default(0),
  articlesDuplicate: integer("articles_duplicate").notNull().default(0),
  
  status: varchar("status", { length: 20 }).notNull().default('success'), // success, error, rate_limited
  errorMessage: text("error_message"),
  
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
}, (table) => [
  index("idx_fetch_log_source").on(table.apiSource),
  index("idx_fetch_log_time").on(table.fetchedAt),
]);

// Insert Schemas
export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
  fetchedAt: true,
});

export const insertNewsFetchLogSchema = createInsertSchema(newsFetchLog).omit({
  id: true,
  fetchedAt: true,
});

// Types
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;

export type NewsFetchLog = typeof newsFetchLog.$inferSelect;
export type InsertNewsFetchLog = z.infer<typeof insertNewsFetchLogSchema>;

// ============================================
// AI ACTION SYSTEM - Advanced AI Orchestrator
// ============================================

// AI Action Logs - Immutable audit trail for all AI-performed actions
export const aiActionLogs = pgTable("ai_action_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Action details
  actionType: varchar("action_type", { length: 100 }).notNull(), // e.g., 'change_password', 'get_progress', 'cancel_subscription'
  actionCategory: varchar("action_category", { length: 50 }).notNull(), // 'account', 'subscription', 'insights', 'documents'
  parameters: jsonb("parameters"), // Action parameters (sanitized, no passwords)
  
  // Execution details
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'pending', 'cancelled', 'requires_confirmation'
  result: jsonb("result"), // Action result/response data
  errorMessage: text("error_message"),
  
  // Security context
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  
  // Timing
  executionTimeMs: integer("execution_time_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_ai_logs_user").on(table.userId),
  index("idx_ai_logs_action").on(table.actionType),
  index("idx_ai_logs_status").on(table.status),
  index("idx_ai_logs_created").on(table.createdAt),
]);

// AI Pending Confirmations - Actions awaiting user approval
export const aiPendingConfirmations = pgTable("ai_pending_confirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Action details
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actionCategory: varchar("action_category", { length: 50 }).notNull(),
  parameters: jsonb("parameters"), // Sanitized parameters
  
  // Confirmation details
  confirmationMessage: text("confirmation_message").notNull(), // What to show user
  warningLevel: varchar("warning_level", { length: 20 }).notNull().default('normal'), // 'normal', 'warning', 'critical'
  requiresTypedConfirmation: boolean("requires_typed_confirmation").notNull().default(false),
  confirmationPhrase: varchar("confirmation_phrase", { length: 100 }), // e.g., "DELETE MY ACCOUNT"
  
  // Expiration
  expiresAt: timestamp("expires_at").notNull(),
  
  // Status
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at"),
  cancelled: boolean("cancelled").notNull().default(false),
  cancelledAt: timestamp("cancelled_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_ai_confirm_user").on(table.userId),
  index("idx_ai_confirm_expires").on(table.expiresAt),
  index("idx_ai_confirm_status").on(table.confirmed, table.cancelled),
]);

// AI Rate Limits - Track action frequency per user
export const aiRateLimits = pgTable("ai_rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  actionType: varchar("action_type", { length: 100 }).notNull(),
  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),
  actionCount: integer("action_count").notNull().default(1),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_ai_rate_user_action").on(table.userId, table.actionType),
  index("idx_ai_rate_window").on(table.windowEnd),
]);

// Insert Schemas
export const insertAiActionLogSchema = createInsertSchema(aiActionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAiPendingConfirmationSchema = createInsertSchema(aiPendingConfirmations).omit({
  id: true,
  createdAt: true,
  confirmed: true,
  confirmedAt: true,
  cancelled: true,
  cancelledAt: true,
});

export const insertAiRateLimitSchema = createInsertSchema(aiRateLimits).omit({
  id: true,
  createdAt: true,
});

// Types
export type AiActionLog = typeof aiActionLogs.$inferSelect;
export type InsertAiActionLog = z.infer<typeof insertAiActionLogSchema>;

export type AiPendingConfirmation = typeof aiPendingConfirmations.$inferSelect;
export type InsertAiPendingConfirmation = z.infer<typeof insertAiPendingConfirmationSchema>;

export type AiRateLimit = typeof aiRateLimits.$inferSelect;
export type InsertAiRateLimit = z.infer<typeof insertAiRateLimitSchema>;

// ==========================================
// ELIGIBILITY & ADAPTIVE FORMS SYSTEM
// ==========================================

// Industry Profiles - Defines industry-specific form configurations
export const industryProfiles = pgTable("industry_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // e.g., 'fintech', 'healthtech', 'real-estate'
  label: varchar("label", { length: 100 }).notNull(), // e.g., 'FinTech / Financial Services'
  category: varchar("category", { length: 50 }).notNull(), // 'technology', 'traditional', 'hybrid'
  description: text("description"),
  
  // Visa-critical factors for this industry
  visaCriticalFactors: jsonb("visa_critical_factors").notNull().$type<{
    innovationIndicators: string[];
    scalabilityFactors: string[];
    viabilityChecks: string[];
    commonPitfalls: string[];
  }>(),
  
  // Form section configuration
  requiredSections: jsonb("required_sections").notNull().$type<string[]>(), // Section keys that must be shown
  optionalSections: jsonb("optional_sections").$type<string[]>(), // Section keys that are optional
  hiddenSections: jsonb("hidden_sections").$type<string[]>(), // Section keys to hide for this industry
  
  // Industry-specific field replacements
  fieldOverrides: jsonb("field_overrides").$type<Record<string, {
    label: string;
    placeholder: string;
    helpText: string;
    required: boolean;
  }>>(),
  
  // Innovation examples for guidance
  innovationExamples: jsonb("innovation_examples").$type<{
    innovative: Array<{ title: string; description: string; whyInnovative: string }>;
    notInnovative: Array<{ title: string; description: string; whyNot: string }>;
  }>(),
  
  // Endorser recommendations
  recommendedEndorsers: jsonb("recommended_endorsers").$type<string[]>(),
  
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_industry_slug").on(table.slug),
  index("idx_industry_category").on(table.category),
  index("idx_industry_active").on(table.isActive),
]);

// Eligibility Assessments - Stores pre-questionnaire eligibility checks
export const eligibilityAssessments = pgTable("eligibility_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Concept brief (what user submitted)
  businessConcept: text("business_concept").notNull(), // Brief description of the business idea
  industrySlug: varchar("industry_slug", { length: 50 }).notNull(),
  targetMarket: text("target_market"),
  problemStatement: text("problem_statement"),
  proposedSolution: text("proposed_solution"),
  
  // Scoring components (0-100 each)
  innovationScore: integer("innovation_score").notNull(),
  scalabilityScore: integer("scalability_score").notNull(),
  viabilityScore: integer("viability_score").notNull(),
  overallScore: integer("overall_score").notNull(), // Weighted average
  
  // AI Analysis
  aiAnalysis: jsonb("ai_analysis").$type<{
    strengths: string[];
    weaknesses: string[];
    innovationGaps: string[];
    recommendations: string[];
    endorserFit: string[];
    riskFactors: string[];
  }>(),
  
  // Eligibility band: 'eligible', 'needs_improvement', 'not_eligible'
  eligibilityBand: varchar("eligibility_band", { length: 30 }).notNull(),
  
  // Specific disqualifying factors (if any)
  disqualifiers: jsonb("disqualifiers").$type<string[]>(),
  
  // Enhancement suggestions
  enhancementSuggestions: jsonb("enhancement_suggestions").$type<Array<{
    area: string;
    currentState: string;
    suggestion: string;
    impactOnScore: number;
  }>>(),
  
  // Status and gating
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'passed', 'failed', 'expired'
  canProceed: boolean("can_proceed").notNull().default(false), // Whether user can proceed to full questionnaire
  
  // Token for gating access to questionnaire
  accessToken: varchar("access_token", { length: 64 }).unique(),
  expiresAt: timestamp("expires_at"),
  
  // Tracking
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_eligibility_user").on(table.userId),
  index("idx_eligibility_industry").on(table.industrySlug),
  index("idx_eligibility_band").on(table.eligibilityBand),
  index("idx_eligibility_token").on(table.accessToken),
  index("idx_eligibility_status").on(table.status),
]);

// Innovation Coaching Sessions - Tracks real-time guidance interactions
export const innovationCoachingSessions = pgTable("innovation_coaching_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  businessPlanId: varchar("business_plan_id"),
  eligibilityAssessmentId: varchar("eligibility_assessment_id"),
  
  // Current section being worked on
  currentSection: varchar("current_section", { length: 50 }),
  
  // Session data
  interactions: jsonb("interactions").$type<Array<{
    timestamp: string;
    userInput: string;
    fieldKey: string;
    aiSuggestion: string;
    innovationScore: number;
    userAccepted: boolean;
  }>>(),
  
  // Aggregate scores during session
  currentInnovationScore: integer("current_innovation_score").default(0),
  previousInnovationScore: integer("previous_innovation_score").default(0),
  scoreHistory: jsonb("score_history").$type<Array<{
    timestamp: string;
    score: number;
    trigger: string;
  }>>(),
  
  // Session state
  isActive: boolean("is_active").notNull().default(true),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_coaching_user").on(table.userId),
  index("idx_coaching_plan").on(table.businessPlanId),
  index("idx_coaching_active").on(table.isActive),
]);

// Insert Schemas for new tables
export const insertIndustryProfileSchema = createInsertSchema(industryProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEligibilityAssessmentSchema = createInsertSchema(eligibilityAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInnovationCoachingSessionSchema = createInsertSchema(innovationCoachingSessions).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type IndustryProfile = typeof industryProfiles.$inferSelect;
export type InsertIndustryProfile = z.infer<typeof insertIndustryProfileSchema>;

export type EligibilityAssessment = typeof eligibilityAssessments.$inferSelect;
export type InsertEligibilityAssessment = z.infer<typeof insertEligibilityAssessmentSchema>;

export type InnovationCoachingSession = typeof innovationCoachingSessions.$inferSelect;
export type InsertInnovationCoachingSession = z.infer<typeof insertInnovationCoachingSessionSchema>;

// ============================================================================
// AI CONVERSATIONAL QUESTIONNAIRE SYSTEM
// Innovative PhD-level UX for collecting 475+ data points through AI interviews
// ============================================================================

// AI Interview Sessions - Tracks conversation sessions with agent personas
export const aiInterviewSessions = pgTable("ai_interview_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessPlanId: varchar("business_plan_id"),
  
  // Session State
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, paused, completed, abandoned
  currentAgent: varchar("current_agent", { length: 20 }).notNull().default('nova'), // nova, sterling, atlas, sage
  currentSection: integer("current_section").notNull().default(1), // 1-14 sections
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  
  // Progress Tracking
  totalQuestionsAnswered: integer("total_questions_answered").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(475),
  sessionDuration: integer("session_duration").notNull().default(0), // seconds
  
  // Real-time Scores (0-100)
  innovationScore: integer("innovation_score").notNull().default(0),
  viabilityScore: integer("viability_score").notNull().default(0),
  scalabilityScore: integer("scalability_score").notNull().default(0),
  overallReadiness: integer("overall_readiness").notNull().default(0),
  approvalProbability: integer("approval_probability").notNull().default(0),
  
  // Gamification
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalXP: integer("total_xp").notNull().default(0),
  
  // Session Metadata
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  
  // Conversation State (for context continuity)
  conversationContext: jsonb("conversation_context").$type<{
    recentTopics: string[];
    userPreferences: Record<string, string>;
    strengthAreas: string[];
    improvementAreas: string[];
    lastAgentMessage: string;
  }>(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_ai_interview_user").on(table.userId),
  index("idx_ai_interview_status").on(table.status),
  index("idx_ai_interview_agent").on(table.currentAgent),
]);

// AI Interview Responses - Stores individual answers with quality scoring
export const aiInterviewResponses = pgTable("ai_interview_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => aiInterviewSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Question Reference
  questionId: varchar("question_id", { length: 20 }).notNull(), // e.g., "1.A.1" = Section 1, Part A, Question 1
  sectionNumber: integer("section_number").notNull(),
  criterion: varchar("criterion", { length: 20 }).notNull(), // innovation, viability, scalability
  agent: varchar("agent", { length: 20 }).notNull(), // which AI agent asked this
  
  // Question Text (for reference)
  questionText: text("question_text").notNull(),
  
  // User's Answer
  answer: text("answer").notNull(),
  answerLength: integer("answer_length").notNull().default(0),
  
  // AI Quality Assessment (0-100)
  qualityScore: integer("quality_score").notNull().default(0),
  completenessScore: integer("completeness_score").notNull().default(0),
  relevanceScore: integer("relevance_score").notNull().default(0),
  
  // AI Feedback
  aiFeedback: text("ai_feedback"),
  improvementSuggestions: jsonb("improvement_suggestions").$type<string[]>(),
  scoreImpact: integer("score_impact").notNull().default(0), // How much this answer affected overall score
  
  // Revision Tracking
  revisionCount: integer("revision_count").notNull().default(0),
  previousAnswers: jsonb("previous_answers").$type<Array<{
    answer: string;
    timestamp: string;
    qualityScore: number;
  }>>(),
  
  // Timing
  timeToAnswer: integer("time_to_answer"), // seconds
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_response_session").on(table.sessionId),
  index("idx_response_user").on(table.userId),
  index("idx_response_question").on(table.questionId),
  index("idx_response_criterion").on(table.criterion),
]);

// Interview Milestones - Gamification tracking for AI interview sessions
export const interviewMilestones = pgTable("interview_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").references(() => aiInterviewSessions.id),
  
  // Milestone Details
  milestoneId: varchar("milestone_id", { length: 50 }).notNull(), // e.g., "innovation_bronze", "section_complete_1"
  milestoneType: varchar("milestone_type", { length: 30 }).notNull(), // milestone, streak, quality, speed, completion
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(), // emoji or icon name
  
  // Milestone Tier
  tier: varchar("tier", { length: 20 }).notNull().default('bronze'), // bronze, silver, gold, platinum
  xpReward: integer("xp_reward").notNull().default(0),
  
  // Timestamps
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
}, (table) => [
  index("idx_milestone_user").on(table.userId),
  index("idx_milestone_type").on(table.milestoneType),
]);

// Score History - Track score changes over time for visualization
export const scoreHistory = pgTable("score_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => aiInterviewSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Scores at this point
  innovationScore: integer("innovation_score").notNull(),
  viabilityScore: integer("viability_score").notNull(),
  scalabilityScore: integer("scalability_score").notNull(),
  overallReadiness: integer("overall_readiness").notNull(),
  
  // What triggered this update
  triggerType: varchar("trigger_type", { length: 30 }).notNull(), // answer, revision, ai_evaluation
  questionId: varchar("question_id", { length: 20 }),
  
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
}, (table) => [
  index("idx_score_history_session").on(table.sessionId),
  index("idx_score_history_user").on(table.userId),
]);

// Insert Schemas for AI Interview System
export const insertAiInterviewSessionSchema = createInsertSchema(aiInterviewSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiInterviewResponseSchema = createInsertSchema(aiInterviewResponses).omit({
  id: true,
});

export const insertInterviewMilestoneSchema = createInsertSchema(interviewMilestones).omit({
  id: true,
});

export const insertScoreHistorySchema = createInsertSchema(scoreHistory).omit({
  id: true,
});

// Types for AI Interview System
export type AiInterviewSession = typeof aiInterviewSessions.$inferSelect;
export type InsertAiInterviewSession = z.infer<typeof insertAiInterviewSessionSchema>;

export type AiInterviewResponse = typeof aiInterviewResponses.$inferSelect;
export type InsertAiInterviewResponse = z.infer<typeof insertAiInterviewResponseSchema>;

export type InterviewMilestone = typeof interviewMilestones.$inferSelect;
export type InsertInterviewMilestone = z.infer<typeof insertInterviewMilestoneSchema>;

export type ScoreHistory = typeof scoreHistory.$inferSelect;
export type InsertScoreHistory = z.infer<typeof insertScoreHistorySchema>;

// Agent Personas Configuration Type
export type AgentPersona = {
  id: 'nova' | 'sterling' | 'atlas' | 'sage';
  name: string;
  title: string;
  avatar: string;
  primaryColor: string;
  criterion: 'innovation' | 'viability' | 'scalability' | 'compliance';
  sections: number[]; // Which sections this agent handles
  personality: string;
  greeting: string;
};

// ==================== ADMIN CONTROL SYSTEM ====================

// Admin Audit Logs - Track all admin actions for accountability
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  adminEmail: varchar("admin_email").notNull(),
  
  // Action Details
  action: varchar("action", { length: 100 }).notNull(), // e.g., "user_verified", "tier_override", "user_banned"
  actionCategory: varchar("action_category", { length: 50 }).notNull(), // user_management, tier_management, credits, system
  
  // Target
  targetType: varchar("target_type", { length: 30 }).notNull(), // user, plan, system, promo
  targetId: varchar("target_id"),
  targetEmail: varchar("target_email"),
  
  // Changes
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  reason: text("reason"),
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_audit_admin").on(table.adminId),
  index("idx_audit_action").on(table.action),
  index("idx_audit_target").on(table.targetType, table.targetId),
  index("idx_audit_date").on(table.createdAt),
]);

// System Announcements - For broadcasting messages to users
export const systemAnnouncements = pgTable("system_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Announcement Details
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 30 }).notNull().default('info'), // info, warning, success, urgent, maintenance
  
  // Targeting
  targetTiers: jsonb("target_tiers").$type<string[]>().default(['all']), // ['all'] or ['free', 'basic', etc.]
  targetUserIds: jsonb("target_user_ids").$type<string[]>(), // For individual targeting
  
  // Visibility
  isActive: boolean("is_active").notNull().default(true),
  isPinned: boolean("is_pinned").notNull().default(false),
  showOnDashboard: boolean("show_on_dashboard").notNull().default(true),
  showAsPopup: boolean("show_as_popup").notNull().default(false),
  
  // Scheduling
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  
  // Tracking
  createdBy: varchar("created_by").notNull().references(() => users.id),
  viewCount: integer("view_count").notNull().default(0),
  dismissedBy: jsonb("dismissed_by").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// System Settings - Platform-wide configuration
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Setting Details
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // general, security, features, maintenance
  
  // Metadata
  description: text("description"),
  dataType: varchar("data_type", { length: 30 }).notNull().default('string'), // string, boolean, number, json, array
  isPublic: boolean("is_public").notNull().default(false), // Whether clients can read this setting
  
  // Audit
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at").notNull().defaultNow(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Activity Tracking - For admin insights
export const userActivityLogs = pgTable("user_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Activity Details
  activityType: varchar("activity_type", { length: 50 }).notNull(), // login, tool_use, export, plan_create, etc.
  activityData: jsonb("activity_data"), // Additional context
  
  // Tool tracking
  toolId: varchar("tool_id", { length: 100 }),
  toolCategory: varchar("tool_category", { length: 50 }),
  
  // Session info
  sessionId: varchar("session_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_activity_user").on(table.userId),
  index("idx_activity_type").on(table.activityType),
  index("idx_activity_tool").on(table.toolId),
  index("idx_activity_date").on(table.createdAt),
]);

// Admin Control Insert Schemas
export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAnnouncementSchema = createInsertSchema(systemAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  dismissedBy: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
});

export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({
  id: true,
  createdAt: true,
});

// Admin Control Types
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;

export type SystemAnnouncement = typeof systemAnnouncements.$inferSelect;
export type InsertSystemAnnouncement = z.infer<typeof insertSystemAnnouncementSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;

// Error Logs Table - For admin error monitoring
export const errorLogs = pgTable("error_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Error Details
  errorType: varchar("error_type", { length: 50 }).notNull(), // client, server, api, database, ai, export, auth
  errorCode: varchar("error_code", { length: 50 }),
  message: text("message").notNull(),
  stack: text("stack"),
  
  // Context
  userId: varchar("user_id").references(() => users.id),
  userEmail: varchar("user_email"),
  endpoint: varchar("endpoint", { length: 255 }),
  method: varchar("method", { length: 10 }),
  statusCode: integer("status_code"),
  
  // Tool/Page context
  toolId: varchar("tool_id", { length: 100 }),
  pageUrl: text("page_url"),
  
  // Request info
  requestBody: jsonb("request_body"),
  requestHeaders: jsonb("request_headers"),
  
  // Browser/Device info (for client errors)
  userAgent: text("user_agent"),
  browserInfo: jsonb("browser_info"),
  
  // Severity and status
  severity: varchar("severity", { length: 20 }).notNull().default('error'), // info, warning, error, critical
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolution: text("resolution"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_error_type").on(table.errorType),
  index("idx_error_severity").on(table.severity),
  index("idx_error_user").on(table.userId),
  index("idx_error_date").on(table.createdAt),
  index("idx_error_resolved").on(table.isResolved),
]);

export const insertErrorLogSchema = createInsertSchema(errorLogs).omit({
  id: true,
  createdAt: true,
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;

// Site Feedback - Timed popup after 10 minutes on site
export const siteFeedback = pgTable("site_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"), // Optional improvement suggestion
  pageUrl: text("page_url"), // Page where feedback was submitted
  timeSpentMinutes: integer("time_spent_minutes"), // How long user was on site
  // Enhanced user tracking
  userEmail: varchar("user_email"),
  userName: varchar("user_name"),
  userTier: varchar("user_tier", { length: 20 }),
  browserInfo: text("browser_info"), // Browser/device details
  screenSize: varchar("screen_size", { length: 20 }), // e.g., "1920x1080"
  referrer: text("referrer"), // Where user came from
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSiteFeedbackSchema = createInsertSchema(siteFeedback).omit({
  id: true,
  createdAt: true,
});

export type SiteFeedback = typeof siteFeedback.$inferSelect;
export type InsertSiteFeedback = z.infer<typeof insertSiteFeedbackSchema>;

// Floating Feedback - Always-visible feedback button for bug reports, suggestions, questions
export const floatingFeedback = pgTable("floating_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // bug, suggestion, question, praise, other
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  email: varchar("email").notNull(),
  pageUrl: text("page_url"),
  browserInfo: text("browser_info"),
  screenSize: varchar("screen_size", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default('new'), // new, in_progress, resolved, closed
  priority: varchar("priority", { length: 20 }).default('normal'), // low, normal, high, urgent
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_floating_feedback_type").on(table.type),
  index("idx_floating_feedback_status").on(table.status),
  index("idx_floating_feedback_date").on(table.createdAt),
]);

export const insertFloatingFeedbackSchema = createInsertSchema(floatingFeedback).omit({
  id: true,
  status: true,
  priority: true,
  adminNotes: true,
  resolvedAt: true,
  resolvedBy: true,
  createdAt: true,
});

export type FloatingFeedback = typeof floatingFeedback.$inferSelect;
export type InsertFloatingFeedback = z.infer<typeof insertFloatingFeedbackSchema>;

// Security Events - Track security-related events for admin monitoring
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Event Details
  eventType: varchar("event_type", { length: 50 }).notNull(), // failed_login, suspicious_ip, rate_limit, blocked_request, unusual_activity
  severity: varchar("severity", { length: 20 }).notNull().default('low'), // low, medium, high, critical
  
  // Context
  userId: varchar("user_id").references(() => users.id),
  userEmail: varchar("user_email"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  // Event-specific data
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional context like attempts count, blocked status, etc.
  
  // Resolution
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolution: text("resolution"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_security_type").on(table.eventType),
  index("idx_security_severity").on(table.severity),
  index("idx_security_ip").on(table.ipAddress),
  index("idx_security_date").on(table.createdAt),
  index("idx_security_resolved").on(table.isResolved),
]);

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  createdAt: true,
});

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;

// ============================================
// ADMIN NOTIFICATION & BROADCAST SYSTEM
// ============================================

// Admin Notifications - For in-app broadcast messages
export const adminNotifications = pgTable("admin_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Notification Content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, success, warning, error, announcement
  
  // Targeting
  targetType: varchar("target_type", { length: 50 }).notNull().default('all'), // all, tier, user, segment
  targetValue: text("target_value"), // tier name, user ids, or segment criteria as JSON
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('draft'), // draft, scheduled, sent, cancelled
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  
  // Stats
  recipientCount: integer("recipient_count").default(0),
  readCount: integer("read_count").default(0),
  clickCount: integer("click_count").default(0),
  
  // Metadata
  actionUrl: text("action_url"), // Optional link when clicked
  actionText: varchar("action_text", { length: 100 }), // Button text
  expiresAt: timestamp("expires_at"),
  
  // Admin tracking
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_notification_status").on(table.status),
  index("idx_notification_type").on(table.type),
  index("idx_notification_target").on(table.targetType),
  index("idx_notification_date").on(table.createdAt),
]);

// User Notification Read Status
export const userNotificationReads = pgTable("user_notification_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  notificationId: varchar("notification_id").notNull().references(() => adminNotifications.id),
  readAt: timestamp("read_at").notNull().defaultNow(),
  clickedAt: timestamp("clicked_at"),
}, (table) => [
  index("idx_user_notif_read").on(table.userId, table.notificationId),
]);

export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  recipientCount: true,
  readCount: true,
  clickCount: true,
});

export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;

// ============================================
// MARKETING CAMPAIGNS SYSTEM
// ============================================

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Campaign Details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull().default('promotional'), // promotional, seasonal, tier_upgrade, retention, referral
  
  // Targeting
  targetAudience: varchar("target_audience", { length: 50 }).notNull().default('all'), // all, free, basic, premium, enterprise, churned, inactive
  targetCriteria: jsonb("target_criteria"), // Advanced targeting rules
  
  // Campaign Status
  status: varchar("status", { length: 20 }).notNull().default('draft'), // draft, active, paused, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Associated Promo Codes
  promoCodeIds: text("promo_code_ids").array(), // Array of promo code IDs
  
  // Performance Metrics
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenueGenerated: integer("revenue_generated").default(0), // In pence
  
  // A/B Testing
  isAbTest: boolean("is_ab_test").default(false),
  abVariants: jsonb("ab_variants"), // {variantA: {...}, variantB: {...}}
  winningVariant: varchar("winning_variant", { length: 10 }),
  
  // Admin tracking
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_campaign_status").on(table.status),
  index("idx_campaign_type").on(table.type),
  index("idx_campaign_dates").on(table.startDate, table.endDate),
]);

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  impressions: true,
  clicks: true,
  conversions: true,
  revenueGenerated: true,
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

// ============================================
// ADMIN EXPORT SYSTEM
// ============================================

export const adminExports = pgTable("admin_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Export Details
  exportType: varchar("export_type", { length: 50 }).notNull(), // users, transactions, referrals, promos, analytics, campaigns
  format: varchar("format", { length: 10 }).notNull().default('csv'), // csv, pdf, xlsx
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  
  // File info
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"), // In bytes
  fileUrl: text("file_url"),
  
  // Filters applied
  filters: jsonb("filters"), // {dateRange: {...}, tier: 'premium', ...}
  recordCount: integer("record_count"),
  
  // Error handling
  errorMessage: text("error_message"),
  
  // Admin tracking
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // Auto-delete after X days
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_export_status").on(table.status),
  index("idx_export_type").on(table.exportType),
  index("idx_export_user").on(table.requestedBy),
  index("idx_export_date").on(table.createdAt),
]);

export const insertAdminExportSchema = createInsertSchema(adminExports).omit({
  id: true,
  createdAt: true,
  status: true,
  fileName: true,
  fileSize: true,
  fileUrl: true,
  recordCount: true,
  completedAt: true,
});

export type AdminExport = typeof adminExports.$inferSelect;
export type InsertAdminExport = z.infer<typeof insertAdminExportSchema>;

// ============================================
// TOOL PROGRESS PERSISTENCE
// ============================================

export const toolProgress = pgTable("tool_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  toolId: varchar("tool_id", { length: 100 }).notNull(), // e.g., 'traction-evidence', 'commercial-validation'
  
  // Progress Data
  progressData: jsonb("progress_data").notNull(), // Tool-specific structured data
  completionPercent: integer("completion_percent").default(0),
  status: varchar("status", { length: 20 }).notNull().default('in_progress'), // in_progress, completed, exported
  
  // Export tracking
  lastExportedAt: timestamp("last_exported_at"),
  exportCount: integer("export_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_tool_progress_user").on(table.userId),
  index("idx_tool_progress_tool").on(table.toolId),
  index("idx_tool_progress_status").on(table.status),
]);

export const insertToolProgressSchema = createInsertSchema(toolProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  exportCount: true,
});

export type ToolProgress = typeof toolProgress.$inferSelect;
export type InsertToolProgress = z.infer<typeof insertToolProgressSchema>;

// ============================================
// PAYMENT TRANSACTIONS (Real data for admin)
// ============================================

export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Transaction Details
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  
  type: varchar("type", { length: 50 }).notNull(), // subscription, one_time, upgrade, addon, refund
  tier: varchar("tier", { length: 20 }), // For tier purchases
  
  // Amounts in pence
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('GBP'),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, succeeded, failed, refunded
  
  // Promo/Referral tracking
  promoCodeId: varchar("promo_code_id").references(() => promoCodes.id),
  referralCodeId: varchar("referral_code_id").references(() => referralCodes.id),
  discountAmount: integer("discount_amount").default(0),
  
  // Metadata
  metadata: jsonb("metadata"),
  failureReason: text("failure_reason"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_payment_user").on(table.userId),
  index("idx_payment_status").on(table.status),
  index("idx_payment_type").on(table.type),
  index("idx_payment_date").on(table.createdAt),
  index("idx_payment_stripe").on(table.stripePaymentId),
]);

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

export type UserNotificationRead = typeof userNotificationReads.$inferSelect;

// ============================================
// PERFORMANCE METRICS (Core Web Vitals Monitoring)
// ============================================

export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Core Web Vitals
  lcp: integer("lcp"), // Largest Contentful Paint (ms)
  fid: integer("fid"), // First Input Delay (ms)
  cls: integer("cls"), // Cumulative Layout Shift (x1000 for precision)
  fcp: integer("fcp"), // First Contentful Paint (ms)
  ttfb: integer("ttfb"), // Time to First Byte (ms)
  inp: integer("inp"), // Interaction to Next Paint (ms)
  
  // Page Info
  pageUrl: text("page_url").notNull(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  
  // Device/Browser Info
  deviceType: varchar("device_type", { length: 20 }), // mobile, tablet, desktop
  browserName: varchar("browser_name", { length: 50 }),
  browserVersion: varchar("browser_version", { length: 20 }),
  connectionType: varchar("connection_type", { length: 20 }), // 4g, 3g, wifi, etc
  
  // User Context (optional)
  userId: varchar("user_id"),
  sessionId: varchar("session_id", { length: 100 }),
  
  // Navigation Type
  navigationType: varchar("navigation_type", { length: 20 }), // navigate, reload, back_forward
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_perf_page_path").on(table.pagePath),
  index("idx_perf_created_at").on(table.createdAt),
  index("idx_perf_device").on(table.deviceType),
]);

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;

// ============================================
// REAL-TIME ANALYTICS SYSTEM (PhD-Level Activity Tracking)
// ============================================

// Active User Sessions - Track currently active users in real-time
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Session Identification
  sessionToken: varchar("session_token", { length: 100 }).notNull(),
  
  // Timing
  sessionStartedAt: timestamp("session_started_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  sessionEndedAt: timestamp("session_ended_at"),
  
  // Session Status
  isActive: boolean("is_active").notNull().default(true),
  
  // Device Information
  userAgent: text("user_agent"),
  deviceType: varchar("device_type", { length: 20 }), // mobile, tablet, desktop
  browserName: varchar("browser_name", { length: 50 }),
  browserVersion: varchar("browser_version", { length: 30 }),
  osName: varchar("os_name", { length: 50 }),
  osVersion: varchar("os_version", { length: 30 }),
  screenResolution: varchar("screen_resolution", { length: 20 }), // e.g., "1920x1080"
  
  // Location Information (from IP)
  ipAddress: varchar("ip_address", { length: 50 }),
  country: varchar("country", { length: 100 }),
  countryCode: varchar("country_code", { length: 5 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }),
  
  // Connection Info
  connectionType: varchar("connection_type", { length: 20 }), // 4g, 3g, wifi, ethernet
  
  // Session Metrics
  pageViewCount: integer("page_view_count").notNull().default(0),
  eventCount: integer("event_count").notNull().default(0),
  totalDurationSeconds: integer("total_duration_seconds").notNull().default(0),
  
  // Entry/Exit
  entryPage: varchar("entry_page", { length: 255 }),
  currentPage: varchar("current_page", { length: 255 }),
  exitPage: varchar("exit_page", { length: 255 }),
  
  // Referrer
  referrerUrl: text("referrer_url"),
  referrerSource: varchar("referrer_source", { length: 50 }), // google, facebook, direct, etc.
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_session_user").on(table.userId),
  index("idx_session_active").on(table.isActive),
  index("idx_session_started").on(table.sessionStartedAt),
  index("idx_session_last_seen").on(table.lastSeenAt),
  index("idx_session_country").on(table.countryCode),
  index("idx_session_device").on(table.deviceType),
]);

// Page Views - Track every page navigation
export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => userSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Page Information
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  pageTitle: varchar("page_title", { length: 255 }),
  pageUrl: text("page_url"),
  
  // Navigation
  referrerPath: varchar("referrer_path", { length: 255 }),
  navigationType: varchar("navigation_type", { length: 20 }), // navigate, reload, back_forward, prerender
  
  // Timing
  viewStartedAt: timestamp("view_started_at").notNull().defaultNow(),
  viewEndedAt: timestamp("view_ended_at"),
  timeOnPageSeconds: integer("time_on_page_seconds"),
  
  // Engagement
  scrollDepthPercent: integer("scroll_depth_percent").default(0),
  clickCount: integer("click_count").default(0),
  
  // Performance
  pageLoadTimeMs: integer("page_load_time_ms"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_pageview_session").on(table.sessionId),
  index("idx_pageview_user").on(table.userId),
  index("idx_pageview_path").on(table.pagePath),
  index("idx_pageview_started").on(table.viewStartedAt),
]);

// Activity Events - Detailed event tracking for user actions
export const activityEvents = pgTable("activity_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => userSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Event Details
  eventType: varchar("event_type", { length: 50 }).notNull(), // click, form_submit, tool_use, export, plan_create, etc.
  eventCategory: varchar("event_category", { length: 50 }).notNull(), // navigation, engagement, conversion, tool, system
  eventAction: varchar("event_action", { length: 100 }).notNull(), // specific action
  eventLabel: varchar("event_label", { length: 255 }), // optional label
  eventValue: integer("event_value"), // optional numeric value
  
  // Context
  pagePath: varchar("page_path", { length: 255 }),
  
  // Tool-specific tracking
  toolId: varchar("tool_id", { length: 100 }),
  toolCategory: varchar("tool_category", { length: 50 }),
  
  // Additional Data
  payload: jsonb("payload").$type<Record<string, any>>(),
  
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
}, (table) => [
  index("idx_event_session").on(table.sessionId),
  index("idx_event_user").on(table.userId),
  index("idx_event_type").on(table.eventType),
  index("idx_event_category").on(table.eventCategory),
  index("idx_event_occurred").on(table.occurredAt),
  index("idx_event_tool").on(table.toolId),
]);

// Real-Time Analytics Insert Schemas
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export const insertActivityEventSchema = createInsertSchema(activityEvents).omit({
  id: true,
});

// Real-Time Analytics Types
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;

export type ActivityEvent = typeof activityEvents.$inferSelect;
export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;

// ============================================
// EMAIL LOGS - REAL EMAIL TRACKING SYSTEM
// ============================================

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Email Details
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  
  // Email Type Classification
  emailType: varchar("email_type", { length: 50 }).notNull(), // verification, welcome, password_reset, payment_receipt, plan_notification, marketing, system
  
  // Status Tracking
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, sent, delivered, failed, bounced
  
  // Provider Info
  provider: varchar("provider", { length: 50 }), // aws_ses, hostinger
  messageId: varchar("message_id", { length: 255 }),
  
  // Error Tracking
  errorMessage: text("error_message"),
  
  // User Association (optional)
  userId: varchar("user_id").references(() => users.id),
  
  // Timestamps
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  
}, (table) => [
  index("idx_email_recipient").on(table.recipientEmail),
  index("idx_email_type").on(table.emailType),
  index("idx_email_status").on(table.status),
  index("idx_email_sent_at").on(table.sentAt),
  index("idx_email_user").on(table.userId),
]);

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;

// ============================================
// COVER DESIGNS - PERSISTENT THEME/COVER STORAGE
// ============================================

export const coverDesigns = pgTable("cover_designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  themeId: varchar("theme_id", { length: 50 }),
  primaryColor: varchar("primary_color", { length: 20 }),
  secondaryColor: varchar("secondary_color", { length: 20 }),
  font: varchar("font", { length: 50 }),
  
  backgroundImage: text("background_image"),
  useFullCoverImage: boolean("use_full_cover_image").notNull().default(false),
  
  textElements: jsonb("text_elements").$type<Array<{
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
    fontWeight: string;
    fontStyle?: string;
    fontFamily: string;
    color: string;
    textAlign?: string;
  }>>(),
  
  paletteId: varchar("palette_id", { length: 50 }),
  paletteColors: jsonb("palette_colors").$type<string[]>(),
  
  isDefault: boolean("is_default").notNull().default(false),
  name: varchar("name", { length: 100 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_cover_user").on(table.userId),
  index("idx_cover_default").on(table.userId, table.isDefault),
]);

export const insertCoverDesignSchema = createInsertSchema(coverDesigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CoverDesign = typeof coverDesigns.$inferSelect;
export type InsertCoverDesign = z.infer<typeof insertCoverDesignSchema>;
