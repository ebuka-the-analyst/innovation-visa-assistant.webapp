import { type User, type InsertUser, type BusinessPlan, type InsertBusinessPlan, type SessionHandoff, type InsertSessionHandoff, type Referral, type InsertReferral, users, businessPlans, sessionHandoffs, referrals } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User management
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
  getUserBusinessPlans(userId: string): Promise<BusinessPlan[]>;
  verifyUserEmail(userId: string): Promise<void>;
  incrementVerificationAttempts(userId: string): Promise<void>;
  updateVerificationCode(userId: string, code: string, expiresAt: Date): Promise<void>;
  
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
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0]!;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await db.update(users).set({ googleId }).where(eq(users.id, userId));
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

  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
        verificationAttempts: 0
      })
      .where(eq(users.id, userId));
  }

  async incrementVerificationAttempts(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      await db
        .update(users)
        .set({ verificationAttempts: user.verificationAttempts + 1 })
        .where(eq(users.id, userId));
    }
  }

  async updateVerificationCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        verificationCode: code,
        codeExpiresAt: expiresAt,
        lastCodeSentAt: new Date(),
        verificationAttempts: 0
      })
      .where(eq(users.id, userId));
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
