import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  generatedContent: text("generated_content"),
  pdfUrl: text("pdf_url"),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusinessPlan = z.infer<typeof insertBusinessPlanSchema>;
export type BusinessPlan = typeof businessPlans.$inferSelect;
export type QuestionnaireData = z.infer<typeof questionnaireSchema>;
