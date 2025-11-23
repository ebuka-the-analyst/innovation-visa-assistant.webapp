import { type User, type UpsertUser, type InsertUser, type BusinessPlan, type InsertBusinessPlan, type SessionHandoff, type InsertSessionHandoff, type Referral, type InsertReferral, users, businessPlans, sessionHandoffs, referrals } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User management (supports both Google OAuth and email/password auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserBusinessPlans(userId: string): Promise<BusinessPlan[]>;
  
  // Business plan management
  getBusinessPlan(id: string): Promise<BusinessPlan | undefined>;
  createBusinessPlan(plan: InsertBusinessPlan): Promise<BusinessPlan>;
  updateBusinessPlan(id: string, updates: Partial<BusinessPlan>): Promise<BusinessPlan | undefined>;
  getBusinessPlanByStripeSession(sessionId: string): Promise<BusinessPlan | undefined>;
  
  // Session handoff for QR mobile upload
  createSessionHandoff(handoff: InsertSessionHandoff): Promise<SessionHandoff>;
  getSessionHandoff(token: string): Promise<SessionHandoff | undefined>;
  consumeSessionHandoff(token: string): Promise<void>;
  cleanupExpiredHandoffs(): Promise<void>;
  
  // Referral tracking
  createReferral(referral: InsertReferral): Promise<Referral>;
}

export class DatabaseStorage implements IStorage {
  // User methods (supports both Google OAuth and email/password auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, try to find user by googleId (Railway OAuth)
    if (userData.googleId) {
      const existingByGoogleId = await db
        .select()
        .from(users)
        .where(eq(users.googleId, userData.googleId))
        .limit(1);
      
      if (existingByGoogleId[0]) {
        // Update existing user found by googleId
        const [updated] = await db
          .update(users)
          .set({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingByGoogleId[0].id))
          .returning();
        return updated;
      }
    }

    // If not found by googleId, try to find by email and update googleId
    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email!))
      .limit(1);
    
    if (existingByEmail[0]) {
      // Update existing user with new googleId
      const [updated] = await db
        .update(users)
        .set({
          googleId: userData.googleId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingByEmail[0].id))
        .returning();
      return updated;
    }

    // Create new user (UUID will be auto-generated)
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning();
    return newUser;
  }

  async getUserBusinessPlans(userId: string): Promise<BusinessPlan[]> {
    const result = await db.select().from(businessPlans).where(eq(businessPlans.userId, userId));
    return result;
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


  async createSessionHandoff(insertHandoff: InsertSessionHandoff): Promise<SessionHandoff> {
    const result = await db.insert(sessionHandoffs).values(insertHandoff).returning();
    return result[0]!;
  }

  async getSessionHandoff(token: string): Promise<SessionHandoff | undefined> {
    const result = await db
      .select()
      .from(sessionHandoffs)
      .where(
        and(
          eq(sessionHandoffs.token, token),
          eq(sessionHandoffs.consumed, false),
          gt(sessionHandoffs.expiresAt, new Date())
        )
      )
      .limit(1);
    return result[0];
  }

  async consumeSessionHandoff(token: string): Promise<void> {
    await db
      .update(sessionHandoffs)
      .set({ consumed: true })
      .where(eq(sessionHandoffs.token, token));
  }

  async cleanupExpiredHandoffs(): Promise<void> {
    await db
      .delete(sessionHandoffs)
      .where(lt(sessionHandoffs.expiresAt, new Date()));
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(insertReferral).returning();
    return result[0]!;
  }
}

export const storage = new DatabaseStorage();
