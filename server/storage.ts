import { type User, type InsertUser, type BusinessPlan, type InsertBusinessPlan, users, businessPlans } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBusinessPlan(id: string): Promise<BusinessPlan | undefined>;
  createBusinessPlan(plan: InsertBusinessPlan): Promise<BusinessPlan>;
  updateBusinessPlan(id: string, updates: Partial<BusinessPlan>): Promise<BusinessPlan | undefined>;
  getBusinessPlanByStripeSession(sessionId: string): Promise<BusinessPlan | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0]!;
  }

  async getBusinessPlan(id: string): Promise<BusinessPlan | undefined> {
    const result = await db.select().from(businessPlans).where(eq(businessPlans.id, id)).limit(1);
    return result[0];
  }

  async createBusinessPlan(insertPlan: InsertBusinessPlan): Promise<BusinessPlan> {
    const result = await db.insert(businessPlans).values(insertPlan).returning();
    return result[0]!;
  }

  async updateBusinessPlan(id: string, updates: Partial<BusinessPlan>): Promise<BusinessPlan | undefined> {
    const result = await db
      .update(businessPlans)
      .set(updates)
      .where(eq(businessPlans.id, id))
      .returning();
    return result[0];
  }

  async getBusinessPlanByStripeSession(sessionId: string): Promise<BusinessPlan | undefined> {
    const result = await db
      .select()
      .from(businessPlans)
      .where(eq(businessPlans.stripeSessionId, sessionId))
      .limit(1);
    return result[0];
  }
}

export const storage = new DatabaseStorage();
