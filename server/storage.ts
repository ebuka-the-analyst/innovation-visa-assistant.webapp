import { 
  type User, type UpsertUser, type InsertUser, 
  type BusinessPlan, type InsertBusinessPlan, 
  type SessionHandoff, type InsertSessionHandoff, 
  type Referral, type InsertReferral, 
  type UploadedFile, type InsertUploadedFile, 
  type ToolAnalytic, type InsertToolAnalytics,
  type ReferralCode, type InsertReferralCode,
  type ReferralEvent, type InsertReferralEvent,
  type ReferralReward, type InsertReferralReward,
  type PromoCode, type InsertPromoCode,
  type PromoRedemption, type InsertPromoRedemption,
  type ReferralVisit, type InsertReferralVisit,
  type PayoutRequest, type InsertPayoutRequest,
  type SupportTicket, type InsertSupportTicket,
  type UserDocument, type InsertUserDocument,
  users, businessPlans, sessionHandoffs, referrals, uploadedFiles, toolAnalytics,
  referralCodes, referralEvents, referralRewards, promoCodes, promoRedemptions, referralVisits, payoutRequests,
  supportTickets, userDocuments
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User management (supports both Google OAuth and email/password auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserGoogleId(userId: string, googleId: string, profileData: { firstName?: string | null, lastName?: string | null, profileImageUrl?: string | null }): Promise<User>;
  verifyUserEmail(userId: string): Promise<void>;
  updateVerificationToken(userId: string, token: string, expiry: Date): Promise<void>;
  updateResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  clearResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  getUserBusinessPlans(userId: string): Promise<BusinessPlan[]>;
  getDemoBusinessPlans(): Promise<BusinessPlan[]>;
  
  // Admin user management
  getAllUsers(): Promise<User[]>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Business plan management
  getBusinessPlan(id: string): Promise<BusinessPlan | undefined>;
  createBusinessPlan(plan: InsertBusinessPlan): Promise<BusinessPlan>;
  updateBusinessPlan(id: string, updates: Partial<BusinessPlan>): Promise<BusinessPlan | undefined>;
  getBusinessPlanByStripeSession(sessionId: string): Promise<BusinessPlan | undefined>;
  
  // Admin business plan management
  getAllBusinessPlans(): Promise<BusinessPlan[]>;
  deleteBusinessPlan(id: string): Promise<void>;
  
  // Session handoff for QR mobile upload
  createSessionHandoff(handoff: InsertSessionHandoff): Promise<SessionHandoff>;
  getSessionHandoff(token: string): Promise<SessionHandoff | undefined>;
  consumeSessionHandoff(token: string): Promise<void>;
  cleanupExpiredHandoffs(): Promise<void>;
  
  // Referral tracking
  createReferral(referral: InsertReferral): Promise<Referral>;
  
  // File storage
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFile(id: string): Promise<UploadedFile | undefined>;
  getUserFiles(userId: string): Promise<UploadedFile[]>;
  getToolFiles(toolId: string, userId: string): Promise<UploadedFile[]>;
  deleteUploadedFile(id: string): Promise<void>;
  
  // Analytics and monitoring
  createToolAnalytic(analytic: InsertToolAnalytics): Promise<ToolAnalytic>;
  getToolUsageStats(limit?: number): Promise<Array<{ toolId: string; action: string; count: number; timestamp?: Date }>>;
  getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<ToolAnalytic[]>;
  checkDatabaseHealth(): Promise<boolean>;
  
  // ============================================
  // REFERRAL CODE SYSTEM
  // ============================================
  
  // Referral Codes
  createReferralCode(code: InsertReferralCode): Promise<ReferralCode>;
  getReferralCode(id: string): Promise<ReferralCode | undefined>;
  getReferralCodeByCode(code: string): Promise<ReferralCode | undefined>;
  getUserReferralCodes(userId: string): Promise<ReferralCode[]>;
  updateReferralCode(id: string, updates: Partial<ReferralCode>): Promise<ReferralCode | undefined>;
  getAllReferralCodes(): Promise<ReferralCode[]>;
  incrementReferralStats(codeId: string, field: 'totalReferrals' | 'successfulReferrals' | 'pendingReferrals', amount?: number): Promise<void>;
  
  // Referral Events
  createReferralEvent(event: InsertReferralEvent): Promise<ReferralEvent>;
  getReferralEvent(id: string): Promise<ReferralEvent | undefined>;
  getReferralEventByReferee(refereeId: string): Promise<ReferralEvent | undefined>;
  getReferralEventsByCode(codeId: string): Promise<ReferralEvent[]>;
  getReferralEventsByReferrer(referrerId: string): Promise<ReferralEvent[]>;
  updateReferralEvent(id: string, updates: Partial<ReferralEvent>): Promise<ReferralEvent | undefined>;
  getAllReferralEvents(): Promise<ReferralEvent[]>;
  
  // Referral Rewards
  createReferralReward(reward: InsertReferralReward): Promise<ReferralReward>;
  getReferralReward(id: string): Promise<ReferralReward | undefined>;
  getUserReferralRewards(userId: string): Promise<ReferralReward[]>;
  updateReferralReward(id: string, updates: Partial<ReferralReward>): Promise<ReferralReward | undefined>;
  getAllReferralRewards(): Promise<ReferralReward[]>;
  getPendingRewards(): Promise<ReferralReward[]>;
  
  // ============================================
  // PROMO CODE SYSTEM
  // ============================================
  
  // Promo Codes
  createPromoCode(code: InsertPromoCode): Promise<PromoCode>;
  getPromoCode(id: string): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  getAllPromoCodes(): Promise<PromoCode[]>;
  getActivePromoCodes(): Promise<PromoCode[]>;
  updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: string): Promise<void>;
  incrementPromoCodeUsage(id: string): Promise<void>;
  
  // Promo Redemptions
  createPromoRedemption(redemption: InsertPromoRedemption): Promise<PromoRedemption>;
  getPromoRedemptionsByUser(userId: string): Promise<PromoRedemption[]>;
  getPromoRedemptionsByCode(codeId: string): Promise<PromoRedemption[]>;
  getUserPromoRedemptionCount(userId: string, promoCodeId: string): Promise<number>;
  getAllPromoRedemptions(): Promise<PromoRedemption[]>;
  
  // Referral Visits (Anonymous Tracking)
  createReferralVisit(visit: InsertReferralVisit): Promise<ReferralVisit>;
  getReferralVisitsByCode(codeId: string): Promise<ReferralVisit[]>;
  updateReferralVisitConversion(visitorHash: string, userId: string): Promise<void>;
  
  // Analytics Aggregations
  getReferralAnalytics(): Promise<{
    totalReferralCodes: number;
    totalReferrals: number;
    successfulReferrals: number;
    totalEarnings: number;
    pendingPayouts: number;
  }>;
  getPromoAnalytics(): Promise<{
    totalPromoCodes: number;
    activePromoCodes: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
  }>;
  
  // ============================================
  // PAYOUT REQUESTS
  // ============================================
  createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest>;
  getPayoutRequest(id: string): Promise<PayoutRequest | undefined>;
  getUserPayoutRequests(userId: string): Promise<PayoutRequest[]>;
  getAllPayoutRequests(): Promise<PayoutRequest[]>;
  getPendingPayoutRequests(): Promise<PayoutRequest[]>;
  updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<PayoutRequest | undefined>;
  
  // Leaderboard
  getReferralLeaderboard(limit?: number): Promise<Array<{
    userId: string;
    userName: string;
    referralCode: string;
    totalReferrals: number;
    successfulReferrals: number;
    totalEarnings: number;
  }>>;

  // ============================================
  // SUPPORT TICKETS
  // ============================================
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: string): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;

  // ============================================
  // USER DOCUMENTS
  // ============================================
  createUserDocument(doc: InsertUserDocument): Promise<UserDocument>;
  getUserDocument(id: string): Promise<UserDocument | undefined>;
  getUserDocuments(userId: string): Promise<UserDocument[]>;
  getUserDocumentsByCategory(userId: string, category: string): Promise<UserDocument[]>;
  updateUserDocument(id: string, updates: Partial<UserDocument>): Promise<UserDocument | undefined>;
  deleteUserDocument(id: string): Promise<void>;
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

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    return result[0];
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
    return result[0];
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateVerificationToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({
        verificationToken: token,
        tokenExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async clearResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUserGoogleId(userId: string, googleId: string, profileData: { firstName?: string | null, lastName?: string | null, profileImageUrl?: string | null }): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        googleId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profileImageUrl: profileData.profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
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
            isEmailVerified: userData.isEmailVerified ?? existingByGoogleId[0].isEmailVerified,
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
          isEmailVerified: userData.isEmailVerified ?? existingByEmail[0].isEmailVerified,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingByEmail[0].id))
        .returning();
      return updated;
    }

    // Create new user (UUID will be auto-generated)
    // Google OAuth users should always be verified
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        isEmailVerified: userData.isEmailVerified ?? false,
      })
      .returning();
    return newUser;
  }

  async getUserBusinessPlans(userId: string): Promise<BusinessPlan[]> {
    const result = await db.select().from(businessPlans).where(eq(businessPlans.userId, userId));
    return result;
  }

  async getDemoBusinessPlans(): Promise<BusinessPlan[]> {
    const result = await db.select().from(businessPlans).where(eq(businessPlans.isDemoData, true));
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

  // File storage methods
  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const result = await db.insert(uploadedFiles).values(file).returning();
    return result[0]!;
  }

  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id)).limit(1);
    return result[0];
  }

  async getUserFiles(userId: string): Promise<UploadedFile[]> {
    const result = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId));
    return result;
  }

  async getToolFiles(toolId: string, userId: string): Promise<UploadedFile[]> {
    const result = await db
      .select()
      .from(uploadedFiles)
      .where(and(eq(uploadedFiles.toolId, toolId), eq(uploadedFiles.userId, userId)));
    return result;
  }

  async deleteUploadedFile(id: string): Promise<void> {
    await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
  }

  // Analytics methods
  async createToolAnalytic(analytic: InsertToolAnalytics): Promise<ToolAnalytic> {
    const result = await db.insert(toolAnalytics).values(analytic).returning();
    return result[0]!;
  }

  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<ToolAnalytic[]> {
    if (startDate && endDate) {
      return db.select().from(toolAnalytics)
        .where(and(
          eq(toolAnalytics.userId, userId),
          gt(toolAnalytics.createdAt, startDate),
          lt(toolAnalytics.createdAt, endDate)
        ));
    }
    return db.select().from(toolAnalytics).where(eq(toolAnalytics.userId, userId));
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getAllBusinessPlans(): Promise<BusinessPlan[]> {
    const result = await db.select().from(businessPlans);
    return result;
  }

  async deleteBusinessPlan(id: string): Promise<void> {
    await db.delete(businessPlans).where(eq(businessPlans.id, id));
  }

  async getToolUsageStats(limit?: number): Promise<Array<{ toolId: string; action: string; count: number; timestamp?: Date }>> {
    // Use real tool analytics data from the toolAnalytics table
    const result = await db
      .select()
      .from(toolAnalytics)
      .orderBy(desc(toolAnalytics.createdAt))
      .limit(limit ? limit * 10 : 1000); // Get more for aggregation
    
    // Aggregate by toolId
    const stats: { [key: string]: { toolId: string; action: string; count: number; timestamp?: Date } } = {};
    
    result.forEach(analytic => {
      const key = analytic.toolId;
      if (!stats[key]) {
        stats[key] = {
          toolId: analytic.toolId,
          action: analytic.action,
          count: 0,
          timestamp: analytic.createdAt,
        };
      }
      stats[key].count++;
    });
    
    return Object.values(stats)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit || 100);
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Simple health check - try to query the database
      await db.select().from(users).limit(1);
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  // ============================================
  // REFERRAL CODE SYSTEM IMPLEMENTATION
  // ============================================

  async createReferralCode(code: InsertReferralCode): Promise<ReferralCode> {
    const [result] = await db.insert(referralCodes).values(code).returning();
    return result;
  }

  async getReferralCode(id: string): Promise<ReferralCode | undefined> {
    const [result] = await db.select().from(referralCodes).where(eq(referralCodes.id, id)).limit(1);
    return result;
  }

  async getReferralCodeByCode(code: string): Promise<ReferralCode | undefined> {
    const [result] = await db.select().from(referralCodes).where(eq(referralCodes.code, code)).limit(1);
    return result;
  }

  async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    return db.select().from(referralCodes).where(eq(referralCodes.userId, userId)).orderBy(desc(referralCodes.createdAt));
  }

  async updateReferralCode(id: string, updates: Partial<ReferralCode>): Promise<ReferralCode | undefined> {
    const [result] = await db.update(referralCodes).set({ ...updates, updatedAt: new Date() }).where(eq(referralCodes.id, id)).returning();
    return result;
  }

  async getAllReferralCodes(): Promise<ReferralCode[]> {
    return db.select().from(referralCodes).orderBy(desc(referralCodes.createdAt));
  }

  async incrementReferralStats(codeId: string, field: 'totalReferrals' | 'successfulReferrals' | 'pendingReferrals', amount: number = 1): Promise<void> {
    await db.update(referralCodes)
      .set({ 
        [field]: sql`${referralCodes[field]} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(referralCodes.id, codeId));
  }

  // Referral Events
  async createReferralEvent(event: InsertReferralEvent): Promise<ReferralEvent> {
    const [result] = await db.insert(referralEvents).values(event).returning();
    return result;
  }

  async getReferralEvent(id: string): Promise<ReferralEvent | undefined> {
    const [result] = await db.select().from(referralEvents).where(eq(referralEvents.id, id)).limit(1);
    return result;
  }

  async getReferralEventByReferee(refereeId: string): Promise<ReferralEvent | undefined> {
    const [result] = await db.select().from(referralEvents).where(eq(referralEvents.refereeId, refereeId)).limit(1);
    return result;
  }

  async getReferralEventsByCode(codeId: string): Promise<ReferralEvent[]> {
    return db.select().from(referralEvents).where(eq(referralEvents.referralCodeId, codeId)).orderBy(desc(referralEvents.createdAt));
  }

  async getReferralEventsByReferrer(referrerId: string): Promise<ReferralEvent[]> {
    return db.select().from(referralEvents).where(eq(referralEvents.referrerId, referrerId)).orderBy(desc(referralEvents.createdAt));
  }

  async updateReferralEvent(id: string, updates: Partial<ReferralEvent>): Promise<ReferralEvent | undefined> {
    const [result] = await db.update(referralEvents).set({ ...updates, updatedAt: new Date() }).where(eq(referralEvents.id, id)).returning();
    return result;
  }

  async getAllReferralEvents(): Promise<ReferralEvent[]> {
    return db.select().from(referralEvents).orderBy(desc(referralEvents.createdAt));
  }

  // Referral Rewards
  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const [result] = await db.insert(referralRewards).values(reward).returning();
    return result;
  }

  async getReferralReward(id: string): Promise<ReferralReward | undefined> {
    const [result] = await db.select().from(referralRewards).where(eq(referralRewards.id, id)).limit(1);
    return result;
  }

  async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    return db.select().from(referralRewards).where(eq(referralRewards.userId, userId)).orderBy(desc(referralRewards.createdAt));
  }

  async updateReferralReward(id: string, updates: Partial<ReferralReward>): Promise<ReferralReward | undefined> {
    const [result] = await db.update(referralRewards).set({ ...updates, updatedAt: new Date() }).where(eq(referralRewards.id, id)).returning();
    return result;
  }

  async getAllReferralRewards(): Promise<ReferralReward[]> {
    return db.select().from(referralRewards).orderBy(desc(referralRewards.createdAt));
  }

  async getPendingRewards(): Promise<ReferralReward[]> {
    return db.select().from(referralRewards).where(eq(referralRewards.status, 'pending')).orderBy(desc(referralRewards.createdAt));
  }

  // ============================================
  // PROMO CODE SYSTEM IMPLEMENTATION
  // ============================================

  async createPromoCode(code: InsertPromoCode): Promise<PromoCode> {
    const [result] = await db.insert(promoCodes).values(code).returning();
    return result;
  }

  async getPromoCode(id: string): Promise<PromoCode | undefined> {
    const [result] = await db.select().from(promoCodes).where(eq(promoCodes.id, id)).limit(1);
    return result;
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [result] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
    return result;
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getActivePromoCodes(): Promise<PromoCode[]> {
    const now = new Date();
    return db.select().from(promoCodes)
      .where(and(
        eq(promoCodes.status, 'active'),
        lt(promoCodes.validFrom, now)
      ))
      .orderBy(desc(promoCodes.createdAt));
  }

  async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined> {
    const [result] = await db.update(promoCodes).set({ ...updates, updatedAt: new Date() }).where(eq(promoCodes.id, id)).returning();
    return result;
  }

  async deletePromoCode(id: string): Promise<void> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  async incrementPromoCodeUsage(id: string): Promise<void> {
    await db.update(promoCodes)
      .set({ 
        currentUses: sql`${promoCodes.currentUses} + 1`,
        updatedAt: new Date()
      })
      .where(eq(promoCodes.id, id));
  }

  // Promo Redemptions
  async createPromoRedemption(redemption: InsertPromoRedemption): Promise<PromoRedemption> {
    const [result] = await db.insert(promoRedemptions).values(redemption).returning();
    return result;
  }

  async getPromoRedemptionsByUser(userId: string): Promise<PromoRedemption[]> {
    return db.select().from(promoRedemptions).where(eq(promoRedemptions.userId, userId)).orderBy(desc(promoRedemptions.createdAt));
  }

  async getPromoRedemptionsByCode(codeId: string): Promise<PromoRedemption[]> {
    return db.select().from(promoRedemptions).where(eq(promoRedemptions.promoCodeId, codeId)).orderBy(desc(promoRedemptions.createdAt));
  }

  async getUserPromoRedemptionCount(userId: string, promoCodeId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(promoRedemptions)
      .where(and(
        eq(promoRedemptions.userId, userId),
        eq(promoRedemptions.promoCodeId, promoCodeId)
      ));
    return result?.count || 0;
  }

  async getAllPromoRedemptions(): Promise<PromoRedemption[]> {
    return db.select().from(promoRedemptions).orderBy(desc(promoRedemptions.createdAt));
  }

  // Referral Visits
  async createReferralVisit(visit: InsertReferralVisit): Promise<ReferralVisit> {
    const [result] = await db.insert(referralVisits).values(visit).returning();
    return result;
  }

  async getReferralVisitsByCode(codeId: string): Promise<ReferralVisit[]> {
    return db.select().from(referralVisits).where(eq(referralVisits.referralCodeId, codeId)).orderBy(desc(referralVisits.createdAt));
  }

  async updateReferralVisitConversion(visitorHash: string, userId: string): Promise<void> {
    await db.update(referralVisits)
      .set({ converted: true, convertedUserId: userId })
      .where(eq(referralVisits.visitorHash, visitorHash));
  }

  // Analytics Aggregations
  async getReferralAnalytics(): Promise<{
    totalReferralCodes: number;
    totalReferrals: number;
    successfulReferrals: number;
    totalEarnings: number;
    pendingPayouts: number;
  }> {
    const codes = await db.select().from(referralCodes);
    const rewards = await db.select().from(referralRewards).where(eq(referralRewards.status, 'pending'));
    
    return {
      totalReferralCodes: codes.length,
      totalReferrals: codes.reduce((sum, c) => sum + c.totalReferrals, 0),
      successfulReferrals: codes.reduce((sum, c) => sum + c.successfulReferrals, 0),
      totalEarnings: codes.reduce((sum, c) => sum + c.totalEarnings, 0),
      pendingPayouts: rewards.reduce((sum, r) => sum + r.amount, 0),
    };
  }

  async getPromoAnalytics(): Promise<{
    totalPromoCodes: number;
    activePromoCodes: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
  }> {
    const allCodes = await db.select().from(promoCodes);
    const activeCodes = allCodes.filter(c => c.status === 'active');
    const redemptions = await db.select().from(promoRedemptions);
    
    return {
      totalPromoCodes: allCodes.length,
      activePromoCodes: activeCodes.length,
      totalRedemptions: redemptions.length,
      totalDiscountGiven: redemptions.reduce((sum, r) => sum + r.discountApplied, 0),
    };
  }

  // ============================================
  // PAYOUT REQUESTS
  // ============================================
  async createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest> {
    const [result] = await db.insert(payoutRequests).values(request).returning();
    return result;
  }

  async getPayoutRequest(id: string): Promise<PayoutRequest | undefined> {
    const [result] = await db.select().from(payoutRequests).where(eq(payoutRequests.id, id)).limit(1);
    return result;
  }

  async getUserPayoutRequests(userId: string): Promise<PayoutRequest[]> {
    return db.select().from(payoutRequests).where(eq(payoutRequests.userId, userId)).orderBy(desc(payoutRequests.createdAt));
  }

  async getAllPayoutRequests(): Promise<PayoutRequest[]> {
    return db.select().from(payoutRequests).orderBy(desc(payoutRequests.createdAt));
  }

  async getPendingPayoutRequests(): Promise<PayoutRequest[]> {
    return db.select().from(payoutRequests).where(eq(payoutRequests.status, 'pending')).orderBy(desc(payoutRequests.createdAt));
  }

  async updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<PayoutRequest | undefined> {
    const [result] = await db.update(payoutRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payoutRequests.id, id))
      .returning();
    return result;
  }

  // Leaderboard
  async getReferralLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    userName: string;
    referralCode: string;
    totalReferrals: number;
    successfulReferrals: number;
    totalEarnings: number;
  }>> {
    const codes = await db.select().from(referralCodes)
      .where(eq(referralCodes.status, 'active'))
      .orderBy(desc(referralCodes.successfulReferrals))
      .limit(limit);
    
    const result: Array<{
      userId: string;
      userName: string;
      referralCode: string;
      totalReferrals: number;
      successfulReferrals: number;
      totalEarnings: number;
    }> = [];

    for (const code of codes) {
      const user = await this.getUser(code.userId);
      if (user) {
        result.push({
          userId: code.userId,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Anonymous',
          referralCode: code.code,
          totalReferrals: code.totalReferrals,
          successfulReferrals: code.successfulReferrals,
          totalEarnings: code.totalEarnings,
        });
      }
    }

    return result;
  }

  // ============================================
  // SUPPORT TICKETS
  // ============================================
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [result] = await db.insert(supportTickets).values(ticket).returning();
    return result;
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [result] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    return result;
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [result] = await db.update(supportTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return result;
  }

  // ============================================
  // USER DOCUMENTS
  // ============================================
  async createUserDocument(doc: InsertUserDocument): Promise<UserDocument> {
    const [result] = await db.insert(userDocuments).values(doc).returning();
    return result;
  }

  async getUserDocument(id: string): Promise<UserDocument | undefined> {
    const [result] = await db.select().from(userDocuments).where(eq(userDocuments.id, id)).limit(1);
    return result;
  }

  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    return db.select().from(userDocuments).where(eq(userDocuments.userId, userId)).orderBy(desc(userDocuments.createdAt));
  }

  async getUserDocumentsByCategory(userId: string, category: string): Promise<UserDocument[]> {
    return db.select().from(userDocuments)
      .where(and(eq(userDocuments.userId, userId), eq(userDocuments.category, category)))
      .orderBy(desc(userDocuments.createdAt));
  }

  async updateUserDocument(id: string, updates: Partial<UserDocument>): Promise<UserDocument | undefined> {
    const [result] = await db.update(userDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userDocuments.id, id))
      .returning();
    return result;
  }

  async deleteUserDocument(id: string): Promise<void> {
    await db.delete(userDocuments).where(eq(userDocuments.id, id));
  }
}

export const storage = new DatabaseStorage();
