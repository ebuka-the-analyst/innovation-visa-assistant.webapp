import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password"), // Null for Google OAuth users
  googleId: text("google_id").unique(), // For Google OAuth
  displayName: text("display_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const signupSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Name required"),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusinessPlan = z.infer<typeof insertBusinessPlanSchema>;
export type BusinessPlan = typeof businessPlans.$inferSelect;
export type QuestionnaireData = z.infer<typeof questionnaireSchema>;
