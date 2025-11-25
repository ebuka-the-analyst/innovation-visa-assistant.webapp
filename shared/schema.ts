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
// PhD-Level Professional Document Review System
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
