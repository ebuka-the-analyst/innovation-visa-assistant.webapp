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
  
  subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default('free'), // free, basic, premium, enterprise, ultimate
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default('inactive'), // active, inactive, cancelled, past_due
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
  
  generatedContent: text("generated_content"),
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
  tier: z.enum(['basic', 'premium', 'enterprise']),
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
  aiMethodology: z.string().min(50, "Specify AI models, algorithms, training data, and validation metrics"),
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
  
  targetEndorser: z.string().min(10, "Which endorsing body are you targeting? (Tech Nation, university, etc.)"),
  contactPointsStrategy: z.string().min(50, "Strategy for 6 required contact points with endorser over 3 years"),
  
  supportingEvidence: z.string().optional(),
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

// ============================================
// REFERRAL & PROMO CODE SYSTEM (PhD-Level)
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

// Promo Codes - Admin-created discount codes for marketing
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 30 }).unique().notNull(),
  
  // Campaign info
  name: text("name").notNull(), // Internal name for campaign
  description: text("description"),
  
  // Discount configuration
  discountType: varchar("discount_type", { length: 20 }).notNull(), // percentage, fixed_amount
  discountValue: integer("discount_value").notNull(), // e.g., 20 for 20% or £20
  
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
