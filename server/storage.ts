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
  type ImmigrationLawyer, type InsertImmigrationLawyer,
  type LawyerDocumentReview, type InsertLawyerDocumentReview,
  type LawyerReviewComment, type InsertLawyerReviewComment,
  type LawyerReviewStatusHistory, type InsertLawyerReviewStatusHistory,
  type NewsArticle, type InsertNewsArticle,
  type NewsFetchLog, type InsertNewsFetchLog,
  type AiActionLog, type InsertAiActionLog,
  type AiPendingConfirmation, type InsertAiPendingConfirmation,
  type AiRateLimit, type InsertAiRateLimit,
  type IndustryProfile, type InsertIndustryProfile,
  type EligibilityAssessment, type InsertEligibilityAssessment,
  type InnovationCoachingSession, type InsertInnovationCoachingSession,
  type PerformanceMetric, type InsertPerformanceMetric,
  type CoverDesign, type InsertCoverDesign,
  type PremiumCoverPurchase, type InsertPremiumCoverPurchase,
  users, businessPlans, sessionHandoffs, referrals, uploadedFiles, toolAnalytics,
  referralCodes, referralEvents, referralRewards, promoCodes, promoRedemptions, referralVisits, payoutRequests,
  supportTickets, userDocuments, immigrationLawyers, lawyerDocumentReviews, lawyerReviewComments, lawyerReviewStatusHistory,
  newsArticles, newsFetchLog, aiActionLogs, aiPendingConfirmations, aiRateLimits,
  industryProfiles, eligibilityAssessments, innovationCoachingSessions, performanceMetrics, coverDesigns,
  premiumCoverPurchases
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
  getPromoCodesByOwner(ownerId: string): Promise<PromoCode[]>;
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
  
  // Partner-specific analytics
  getPartnerAnalytics(ownerId: string): Promise<{
    promoCodes: PromoCode[];
    totalRedemptions: number;
    totalDiscountGiven: number;
    totalVisits: number;
    conversions: number;
    conversionRate: number;
    usersByPromoCode: Array<{
      promoCode: PromoCode;
      users: Array<{ userId: string; redeemedAt: Date; discountApplied: number }>;
    }>;
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
  
  // ============================================
  // ONBOARDING TOUR
  // ============================================
  markOnboardingComplete(userId: string): Promise<void>;
  resetOnboarding(userId: string): Promise<void>;

  // ============================================
  // IMMIGRATION LAWYERS
  // ============================================
  createImmigrationLawyer(lawyer: InsertImmigrationLawyer): Promise<ImmigrationLawyer>;
  getImmigrationLawyer(id: string): Promise<ImmigrationLawyer | undefined>;
  getImmigrationLawyerByEmail(email: string): Promise<ImmigrationLawyer | undefined>;
  getAllImmigrationLawyers(): Promise<ImmigrationLawyer[]>;
  getAvailableLawyers(): Promise<ImmigrationLawyer[]>;
  updateImmigrationLawyer(id: string, updates: Partial<ImmigrationLawyer>): Promise<ImmigrationLawyer | undefined>;
  deleteImmigrationLawyer(id: string): Promise<void>;

  // ============================================
  // LAWYER DOCUMENT REVIEWS
  // ============================================
  createLawyerDocumentReview(review: InsertLawyerDocumentReview): Promise<LawyerDocumentReview>;
  getLawyerDocumentReview(id: string): Promise<LawyerDocumentReview | undefined>;
  getLawyerDocumentReviewsByUser(userId: string): Promise<LawyerDocumentReview[]>;
  getLawyerDocumentReviewsByLawyer(lawyerId: string): Promise<LawyerDocumentReview[]>;
  getLawyerDocumentReviewsByStatus(status: string): Promise<LawyerDocumentReview[]>;
  getAllLawyerDocumentReviews(): Promise<LawyerDocumentReview[]>;
  getPendingLawyerDocumentReviews(): Promise<LawyerDocumentReview[]>;
  updateLawyerDocumentReview(id: string, updates: Partial<LawyerDocumentReview>): Promise<LawyerDocumentReview | undefined>;
  assignLawyerToReview(reviewId: string, lawyerId: string): Promise<LawyerDocumentReview | undefined>;
  completeLawyerDocumentReview(reviewId: string, verdict: string, scores: { confidence?: number; compliance?: number; readiness?: number }): Promise<LawyerDocumentReview | undefined>;

  // ============================================
  // LAWYER REVIEW COMMENTS
  // ============================================
  createLawyerReviewComment(comment: InsertLawyerReviewComment): Promise<LawyerReviewComment>;
  getLawyerReviewComment(id: string): Promise<LawyerReviewComment | undefined>;
  getLawyerReviewCommentsByReview(reviewId: string): Promise<LawyerReviewComment[]>;
  getLawyerReviewCommentsBySection(reviewId: string, section: string): Promise<LawyerReviewComment[]>;
  updateLawyerReviewComment(id: string, updates: Partial<LawyerReviewComment>): Promise<LawyerReviewComment | undefined>;
  resolveLawyerReviewComment(id: string, resolvedBy: string, note?: string): Promise<LawyerReviewComment | undefined>;
  deleteLawyerReviewComment(id: string): Promise<void>;

  // ============================================
  // LAWYER REVIEW STATUS HISTORY
  // ============================================
  createLawyerReviewStatusHistory(history: InsertLawyerReviewStatusHistory): Promise<LawyerReviewStatusHistory>;
  getLawyerReviewStatusHistory(reviewId: string): Promise<LawyerReviewStatusHistory[]>;

  // ============================================
  // LAWYER REVIEW ANALYTICS
  // ============================================
  getLawyerReviewAnalytics(): Promise<{
    totalReviews: number;
    pendingReviews: number;
    inProgressReviews: number;
    completedReviews: number;
    approvedReviews: number;
    needsRevisionReviews: number;
    averageTurnaroundHours: number;
    overdueReviews: number;
  }>;
  getLawyerPerformance(lawyerId: string): Promise<{
    totalReviews: number;
    completedReviews: number;
    averageRating: number;
    averageTurnaroundHours: number;
  }>;

  // ============================================
  // NEWS FEED SYSTEM
  // ============================================
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  getNewsArticleByUrl(url: string): Promise<NewsArticle | undefined>;
  getLatestNews(limit?: number): Promise<NewsArticle[]>;
  getNewsByCategory(category: string, limit?: number): Promise<NewsArticle[]>;
  getFeaturedNews(limit?: number): Promise<NewsArticle[]>;
  searchNews(query: string, limit?: number): Promise<NewsArticle[]>;
  updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: string): Promise<void>;
  createNewsFetchLog(log: InsertNewsFetchLog): Promise<NewsFetchLog>;
  getLatestFetchLog(apiSource: string): Promise<NewsFetchLog | undefined>;
  
  // ============================================
  // AI ACTION SYSTEM
  // ============================================
  
  // Action Logs
  createAiActionLog(log: InsertAiActionLog): Promise<AiActionLog>;
  getAiActionLog(id: string): Promise<AiActionLog | undefined>;
  getUserAiActionLogs(userId: string, limit?: number): Promise<AiActionLog[]>;
  getAiActionLogsByType(userId: string, actionType: string): Promise<AiActionLog[]>;
  
  // Pending Confirmations
  createAiPendingConfirmation(confirmation: InsertAiPendingConfirmation): Promise<AiPendingConfirmation>;
  getAiPendingConfirmation(id: string): Promise<AiPendingConfirmation | undefined>;
  getUserPendingConfirmations(userId: string): Promise<AiPendingConfirmation[]>;
  confirmAiAction(id: string): Promise<AiPendingConfirmation | undefined>;
  cancelAiAction(id: string): Promise<AiPendingConfirmation | undefined>;
  cleanupExpiredConfirmations(): Promise<void>;
  
  // Rate Limiting
  checkAiRateLimit(userId: string, actionType: string, maxActions: number, windowMinutes: number): Promise<boolean>;
  incrementAiRateLimit(userId: string, actionType: string, windowMinutes: number): Promise<void>;
  
  // ============================================
  // INDUSTRY PROFILES & ELIGIBILITY SYSTEM
  // ============================================
  
  // Industry Profiles
  getIndustryProfiles(): Promise<IndustryProfile[]>;
  getIndustryProfileBySlug(slug: string): Promise<IndustryProfile | null>;
  getActiveIndustryProfiles(): Promise<IndustryProfile[]>;
  
  // Eligibility Assessments
  createEligibilityAssessment(assessment: InsertEligibilityAssessment): Promise<EligibilityAssessment>;
  getEligibilityAssessment(id: string): Promise<EligibilityAssessment | undefined>;
  getUserEligibilityAssessments(userId: string): Promise<EligibilityAssessment[]>;
  getEligibilityAssessmentByToken(token: string): Promise<EligibilityAssessment | undefined>;
  updateEligibilityAssessment(id: string, updates: Partial<EligibilityAssessment>): Promise<EligibilityAssessment | undefined>;
  
  // Innovation Coaching Sessions
  createInnovationCoachingSession(session: InsertInnovationCoachingSession): Promise<InnovationCoachingSession>;
  getInnovationCoachingSession(id: string): Promise<InnovationCoachingSession | undefined>;
  getUserActiveCoachingSession(userId: string): Promise<InnovationCoachingSession | undefined>;
  updateInnovationCoachingSession(id: string, updates: Partial<InnovationCoachingSession>): Promise<InnovationCoachingSession | undefined>;
  
  // ============================================
  // COVER DESIGNS
  // ============================================
  
  saveCoverDesign(design: InsertCoverDesign): Promise<CoverDesign>;
  getUserCoverDesigns(userId: string): Promise<CoverDesign[]>;
  getLatestCoverDesign(userId: string): Promise<CoverDesign | undefined>;
  getCoverDesign(id: string): Promise<CoverDesign | undefined>;
  updateCoverDesign(id: string, updates: Partial<CoverDesign>): Promise<CoverDesign | undefined>;
  deleteCoverDesign(id: string): Promise<void>;
  
  // ============================================
  // PREMIUM COVER TEMPLATE PURCHASES
  // ============================================
  createPremiumCoverPurchase(purchase: InsertPremiumCoverPurchase): Promise<PremiumCoverPurchase>;
  getPremiumCoverPurchase(id: string): Promise<PremiumCoverPurchase | undefined>;
  getUserPremiumCoverPurchases(userId: string): Promise<PremiumCoverPurchase[]>;
  getUserPurchasedTemplateIds(userId: string): Promise<string[]>;
  hasUserPurchasedTemplate(userId: string, templateId: string): Promise<boolean>;
  updatePremiumCoverPurchase(id: string, updates: Partial<PremiumCoverPurchase>): Promise<PremiumCoverPurchase | undefined>;
  getPremiumCoverPurchaseByStripeSession(sessionId: string): Promise<PremiumCoverPurchase | undefined>;
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
    const result = await db.select().from(businessPlans).orderBy(desc(businessPlans.createdAt));
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

  async getPromoCodesByOwner(ownerId: string): Promise<PromoCode[]> {
    return db.select().from(promoCodes)
      .where(eq(promoCodes.ownerId, ownerId))
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

  async getPartnerAnalytics(ownerId: string): Promise<{
    promoCodes: PromoCode[];
    totalRedemptions: number;
    totalDiscountGiven: number;
    totalVisits: number;
    conversions: number;
    conversionRate: number;
    usersByPromoCode: Array<{
      promoCode: PromoCode;
      users: Array<{ userId: string; redeemedAt: Date; discountApplied: number }>;
    }>;
  }> {
    // Get partner's promo codes
    const partnerCodes = await this.getPromoCodesByOwner(ownerId);
    const codeIds = partnerCodes.map(c => c.id);
    
    if (codeIds.length === 0) {
      return {
        promoCodes: [],
        totalRedemptions: 0,
        totalDiscountGiven: 0,
        totalVisits: 0,
        conversions: 0,
        conversionRate: 0,
        usersByPromoCode: [],
      };
    }
    
    // Get all redemptions for partner's codes
    const allRedemptions = await db.select().from(promoRedemptions);
    const partnerRedemptions = allRedemptions.filter(r => codeIds.includes(r.promoCodeId));
    
    // Get visits for partner's codes
    const allVisits = await db.select().from(referralVisits);
    const partnerVisits = allVisits.filter(v => v.promoCodeId && codeIds.includes(v.promoCodeId));
    const conversions = partnerVisits.filter(v => v.converted).length;
    
    // Group users by promo code
    const usersByPromoCode = partnerCodes.map(code => {
      const codeRedemptions = partnerRedemptions.filter(r => r.promoCodeId === code.id);
      return {
        promoCode: code,
        users: codeRedemptions.map(r => ({
          userId: r.userId,
          redeemedAt: r.createdAt,
          discountApplied: r.discountApplied,
        })),
      };
    });
    
    return {
      promoCodes: partnerCodes,
      totalRedemptions: partnerRedemptions.length,
      totalDiscountGiven: partnerRedemptions.reduce((sum, r) => sum + r.discountApplied, 0),
      totalVisits: partnerVisits.length,
      conversions,
      conversionRate: partnerVisits.length > 0 ? (conversions / partnerVisits.length) * 100 : 0,
      usersByPromoCode,
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

  // ============================================
  // ONBOARDING TOUR
  // ============================================
  async markOnboardingComplete(userId: string): Promise<void> {
    await db.update(users)
      .set({
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async resetOnboarding(userId: string): Promise<void> {
    await db.update(users)
      .set({
        hasCompletedOnboarding: false,
        onboardingCompletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // ============================================
  // IMMIGRATION LAWYERS
  // ============================================
  async createImmigrationLawyer(lawyer: InsertImmigrationLawyer): Promise<ImmigrationLawyer> {
    const [result] = await db.insert(immigrationLawyers).values(lawyer).returning();
    return result;
  }

  async getImmigrationLawyer(id: string): Promise<ImmigrationLawyer | undefined> {
    const [result] = await db.select().from(immigrationLawyers).where(eq(immigrationLawyers.id, id)).limit(1);
    return result;
  }

  async getImmigrationLawyerByEmail(email: string): Promise<ImmigrationLawyer | undefined> {
    const [result] = await db.select().from(immigrationLawyers).where(eq(immigrationLawyers.email, email)).limit(1);
    return result;
  }

  async getAllImmigrationLawyers(): Promise<ImmigrationLawyer[]> {
    return db.select().from(immigrationLawyers).orderBy(desc(immigrationLawyers.createdAt));
  }

  async getAvailableLawyers(): Promise<ImmigrationLawyer[]> {
    return db.select().from(immigrationLawyers)
      .where(and(
        eq(immigrationLawyers.isAvailable, true),
        eq(immigrationLawyers.status, 'active')
      ))
      .orderBy(immigrationLawyers.currentReviewCount);
  }

  async updateImmigrationLawyer(id: string, updates: Partial<ImmigrationLawyer>): Promise<ImmigrationLawyer | undefined> {
    const [result] = await db.update(immigrationLawyers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(immigrationLawyers.id, id))
      .returning();
    return result;
  }

  async deleteImmigrationLawyer(id: string): Promise<void> {
    await db.delete(immigrationLawyers).where(eq(immigrationLawyers.id, id));
  }

  // ============================================
  // LAWYER DOCUMENT REVIEWS
  // ============================================
  async createLawyerDocumentReview(review: InsertLawyerDocumentReview): Promise<LawyerDocumentReview> {
    const [result] = await db.insert(lawyerDocumentReviews).values(review).returning();
    return result;
  }

  async getLawyerDocumentReview(id: string): Promise<LawyerDocumentReview | undefined> {
    const [result] = await db.select().from(lawyerDocumentReviews).where(eq(lawyerDocumentReviews.id, id)).limit(1);
    return result;
  }

  async getLawyerDocumentReviewsByUser(userId: string): Promise<LawyerDocumentReview[]> {
    return db.select().from(lawyerDocumentReviews)
      .where(eq(lawyerDocumentReviews.userId, userId))
      .orderBy(desc(lawyerDocumentReviews.createdAt));
  }

  async getLawyerDocumentReviewsByLawyer(lawyerId: string): Promise<LawyerDocumentReview[]> {
    return db.select().from(lawyerDocumentReviews)
      .where(eq(lawyerDocumentReviews.lawyerId, lawyerId))
      .orderBy(desc(lawyerDocumentReviews.createdAt));
  }

  async getLawyerDocumentReviewsByStatus(status: string): Promise<LawyerDocumentReview[]> {
    return db.select().from(lawyerDocumentReviews)
      .where(eq(lawyerDocumentReviews.status, status))
      .orderBy(desc(lawyerDocumentReviews.createdAt));
  }

  async getAllLawyerDocumentReviews(): Promise<LawyerDocumentReview[]> {
    return db.select().from(lawyerDocumentReviews).orderBy(desc(lawyerDocumentReviews.createdAt));
  }

  async getPendingLawyerDocumentReviews(): Promise<LawyerDocumentReview[]> {
    return db.select().from(lawyerDocumentReviews)
      .where(eq(lawyerDocumentReviews.status, 'pending'))
      .orderBy(lawyerDocumentReviews.requestedAt);
  }

  async updateLawyerDocumentReview(id: string, updates: Partial<LawyerDocumentReview>): Promise<LawyerDocumentReview | undefined> {
    const [result] = await db.update(lawyerDocumentReviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lawyerDocumentReviews.id, id))
      .returning();
    return result;
  }

  async assignLawyerToReview(reviewId: string, lawyerId: string): Promise<LawyerDocumentReview | undefined> {
    const [result] = await db.update(lawyerDocumentReviews)
      .set({
        lawyerId,
        status: 'assigned',
        assignedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(lawyerDocumentReviews.id, reviewId))
      .returning();
    
    // Increment lawyer's current review count
    await db.update(immigrationLawyers)
      .set({
        currentReviewCount: sql`${immigrationLawyers.currentReviewCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(immigrationLawyers.id, lawyerId));
    
    return result;
  }

  async completeLawyerDocumentReview(
    reviewId: string, 
    verdict: string, 
    scores: { confidence?: number; compliance?: number; readiness?: number }
  ): Promise<LawyerDocumentReview | undefined> {
    const review = await this.getLawyerDocumentReview(reviewId);
    if (!review) return undefined;

    const [result] = await db.update(lawyerDocumentReviews)
      .set({
        status: 'completed',
        overallVerdict: verdict,
        confidenceScore: scores.confidence,
        complianceScore: scores.compliance,
        readinessScore: scores.readiness,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(lawyerDocumentReviews.id, reviewId))
      .returning();

    // Update lawyer stats
    if (review.lawyerId) {
      await db.update(immigrationLawyers)
        .set({
          currentReviewCount: sql`GREATEST(0, ${immigrationLawyers.currentReviewCount} - 1)`,
          totalReviewsCompleted: sql`${immigrationLawyers.totalReviewsCompleted} + 1`,
          updatedAt: new Date()
        })
        .where(eq(immigrationLawyers.id, review.lawyerId));
    }

    return result;
  }

  // ============================================
  // LAWYER REVIEW COMMENTS
  // ============================================
  async createLawyerReviewComment(comment: InsertLawyerReviewComment): Promise<LawyerReviewComment> {
    const [result] = await db.insert(lawyerReviewComments).values(comment).returning();
    return result;
  }

  async getLawyerReviewComment(id: string): Promise<LawyerReviewComment | undefined> {
    const [result] = await db.select().from(lawyerReviewComments).where(eq(lawyerReviewComments.id, id)).limit(1);
    return result;
  }

  async getLawyerReviewCommentsByReview(reviewId: string): Promise<LawyerReviewComment[]> {
    return db.select().from(lawyerReviewComments)
      .where(eq(lawyerReviewComments.reviewId, reviewId))
      .orderBy(lawyerReviewComments.createdAt);
  }

  async getLawyerReviewCommentsBySection(reviewId: string, section: string): Promise<LawyerReviewComment[]> {
    return db.select().from(lawyerReviewComments)
      .where(and(
        eq(lawyerReviewComments.reviewId, reviewId),
        eq(lawyerReviewComments.section, section)
      ))
      .orderBy(lawyerReviewComments.createdAt);
  }

  async updateLawyerReviewComment(id: string, updates: Partial<LawyerReviewComment>): Promise<LawyerReviewComment | undefined> {
    const [result] = await db.update(lawyerReviewComments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lawyerReviewComments.id, id))
      .returning();
    return result;
  }

  async resolveLawyerReviewComment(id: string, resolvedBy: string, note?: string): Promise<LawyerReviewComment | undefined> {
    const [result] = await db.update(lawyerReviewComments)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNote: note,
        updatedAt: new Date()
      })
      .where(eq(lawyerReviewComments.id, id))
      .returning();
    return result;
  }

  async deleteLawyerReviewComment(id: string): Promise<void> {
    await db.delete(lawyerReviewComments).where(eq(lawyerReviewComments.id, id));
  }

  // ============================================
  // LAWYER REVIEW STATUS HISTORY
  // ============================================
  async createLawyerReviewStatusHistory(history: InsertLawyerReviewStatusHistory): Promise<LawyerReviewStatusHistory> {
    const [result] = await db.insert(lawyerReviewStatusHistory).values(history).returning();
    return result;
  }

  async getLawyerReviewStatusHistory(reviewId: string): Promise<LawyerReviewStatusHistory[]> {
    return db.select().from(lawyerReviewStatusHistory)
      .where(eq(lawyerReviewStatusHistory.reviewId, reviewId))
      .orderBy(desc(lawyerReviewStatusHistory.createdAt));
  }

  // ============================================
  // LAWYER REVIEW ANALYTICS
  // ============================================
  async getLawyerReviewAnalytics(): Promise<{
    totalReviews: number;
    pendingReviews: number;
    inProgressReviews: number;
    completedReviews: number;
    approvedReviews: number;
    needsRevisionReviews: number;
    averageTurnaroundHours: number;
    overdueReviews: number;
  }> {
    const allReviews = await db.select().from(lawyerDocumentReviews);
    
    const pendingReviews = allReviews.filter(r => r.status === 'pending').length;
    const inProgressReviews = allReviews.filter(r => ['assigned', 'in_review'].includes(r.status)).length;
    const completedReviews = allReviews.filter(r => r.status === 'completed').length;
    const approvedReviews = allReviews.filter(r => r.overallVerdict === 'approved').length;
    const needsRevisionReviews = allReviews.filter(r => r.overallVerdict === 'needs_revision').length;
    const overdueReviews = allReviews.filter(r => r.isOverdue).length;

    // Calculate average turnaround for completed reviews
    const completedWithTimes = allReviews.filter(r => r.completedAt && r.requestedAt);
    let avgTurnaround = 0;
    if (completedWithTimes.length > 0) {
      const totalHours = completedWithTimes.reduce((sum, r) => {
        const diff = new Date(r.completedAt!).getTime() - new Date(r.requestedAt).getTime();
        return sum + (diff / (1000 * 60 * 60));
      }, 0);
      avgTurnaround = Math.round(totalHours / completedWithTimes.length);
    }

    return {
      totalReviews: allReviews.length,
      pendingReviews,
      inProgressReviews,
      completedReviews,
      approvedReviews,
      needsRevisionReviews,
      averageTurnaroundHours: avgTurnaround,
      overdueReviews
    };
  }

  async getLawyerPerformance(lawyerId: string): Promise<{
    totalReviews: number;
    completedReviews: number;
    averageRating: number;
    averageTurnaroundHours: number;
  }> {
    const reviews = await db.select().from(lawyerDocumentReviews)
      .where(eq(lawyerDocumentReviews.lawyerId, lawyerId));
    
    const completedReviews = reviews.filter(r => r.status === 'completed');
    const ratings = completedReviews.filter(r => r.userRating !== null).map(r => r.userRating!);
    const avgRating = ratings.length > 0 
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 
      : 0;

    const completedWithTimes = completedReviews.filter(r => r.completedAt && r.requestedAt);
    let avgTurnaround = 0;
    if (completedWithTimes.length > 0) {
      const totalHours = completedWithTimes.reduce((sum, r) => {
        const diff = new Date(r.completedAt!).getTime() - new Date(r.requestedAt).getTime();
        return sum + (diff / (1000 * 60 * 60));
      }, 0);
      avgTurnaround = Math.round(totalHours / completedWithTimes.length);
    }

    return {
      totalReviews: reviews.length,
      completedReviews: completedReviews.length,
      averageRating: avgRating,
      averageTurnaroundHours: avgTurnaround
    };
  }

  // ============================================
  // NEWS FEED SYSTEM
  // ============================================
  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [result] = await db.insert(newsArticles).values(article).returning();
    return result;
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const result = await db.select().from(newsArticles).where(eq(newsArticles.id, id)).limit(1);
    return result[0];
  }

  async getNewsArticleByUrl(url: string): Promise<NewsArticle | undefined> {
    const result = await db.select().from(newsArticles).where(eq(newsArticles.url, url)).limit(1);
    return result[0];
  }

  async getLatestNews(limit: number = 20): Promise<NewsArticle[]> {
    return db.select().from(newsArticles)
      .where(eq(newsArticles.isActive, true))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getNewsByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    return db.select().from(newsArticles)
      .where(and(
        eq(newsArticles.isActive, true),
        eq(newsArticles.category, category)
      ))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getFeaturedNews(limit: number = 5): Promise<NewsArticle[]> {
    return db.select().from(newsArticles)
      .where(and(
        eq(newsArticles.isActive, true),
        eq(newsArticles.isFeatured, true)
      ))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async searchNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(newsArticles)
      .where(and(
        eq(newsArticles.isActive, true),
        sql`LOWER(${newsArticles.title}) LIKE ${searchTerm} OR LOWER(${newsArticles.description}) LIKE ${searchTerm}`
      ))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const [result] = await db.update(newsArticles)
      .set(updates)
      .where(eq(newsArticles.id, id))
      .returning();
    return result;
  }

  async deleteNewsArticle(id: string): Promise<void> {
    await db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  async createNewsFetchLog(log: InsertNewsFetchLog): Promise<NewsFetchLog> {
    const [result] = await db.insert(newsFetchLog).values(log).returning();
    return result;
  }

  async getLatestFetchLog(apiSource: string): Promise<NewsFetchLog | undefined> {
    const result = await db.select().from(newsFetchLog)
      .where(eq(newsFetchLog.apiSource, apiSource))
      .orderBy(desc(newsFetchLog.fetchedAt))
      .limit(1);
    return result[0];
  }

  // ============================================
  // AI ACTION SYSTEM
  // ============================================

  async createAiActionLog(log: InsertAiActionLog): Promise<AiActionLog> {
    const [result] = await db.insert(aiActionLogs).values(log).returning();
    return result;
  }

  async getAiActionLog(id: string): Promise<AiActionLog | undefined> {
    const result = await db.select().from(aiActionLogs).where(eq(aiActionLogs.id, id)).limit(1);
    return result[0];
  }

  async getUserAiActionLogs(userId: string, limit: number = 50): Promise<AiActionLog[]> {
    return db.select().from(aiActionLogs)
      .where(eq(aiActionLogs.userId, userId))
      .orderBy(desc(aiActionLogs.createdAt))
      .limit(limit);
  }

  async getAiActionLogsByType(userId: string, actionType: string): Promise<AiActionLog[]> {
    return db.select().from(aiActionLogs)
      .where(and(
        eq(aiActionLogs.userId, userId),
        eq(aiActionLogs.actionType, actionType)
      ))
      .orderBy(desc(aiActionLogs.createdAt));
  }

  async createAiPendingConfirmation(confirmation: InsertAiPendingConfirmation): Promise<AiPendingConfirmation> {
    const [result] = await db.insert(aiPendingConfirmations).values(confirmation).returning();
    return result;
  }

  async getAiPendingConfirmation(id: string): Promise<AiPendingConfirmation | undefined> {
    const result = await db.select().from(aiPendingConfirmations)
      .where(eq(aiPendingConfirmations.id, id))
      .limit(1);
    return result[0];
  }

  async getUserPendingConfirmations(userId: string): Promise<AiPendingConfirmation[]> {
    const now = new Date();
    return db.select().from(aiPendingConfirmations)
      .where(and(
        eq(aiPendingConfirmations.userId, userId),
        eq(aiPendingConfirmations.confirmed, false),
        eq(aiPendingConfirmations.cancelled, false),
        gt(aiPendingConfirmations.expiresAt, now)
      ))
      .orderBy(desc(aiPendingConfirmations.createdAt));
  }

  async confirmAiAction(id: string): Promise<AiPendingConfirmation | undefined> {
    const [result] = await db.update(aiPendingConfirmations)
      .set({ confirmed: true, confirmedAt: new Date() })
      .where(eq(aiPendingConfirmations.id, id))
      .returning();
    return result;
  }

  async cancelAiAction(id: string): Promise<AiPendingConfirmation | undefined> {
    const [result] = await db.update(aiPendingConfirmations)
      .set({ cancelled: true, cancelledAt: new Date() })
      .where(eq(aiPendingConfirmations.id, id))
      .returning();
    return result;
  }

  async cleanupExpiredConfirmations(): Promise<void> {
    const now = new Date();
    await db.delete(aiPendingConfirmations)
      .where(and(
        lt(aiPendingConfirmations.expiresAt, now),
        eq(aiPendingConfirmations.confirmed, false),
        eq(aiPendingConfirmations.cancelled, false)
      ));
  }

  async checkAiRateLimit(userId: string, actionType: string, maxActions: number, windowMinutes: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    
    const result = await db.select({ count: count() })
      .from(aiRateLimits)
      .where(and(
        eq(aiRateLimits.userId, userId),
        eq(aiRateLimits.actionType, actionType),
        gt(aiRateLimits.windowEnd, now)
      ));
    
    const currentCount = result[0]?.count || 0;
    return currentCount < maxActions;
  }

  async incrementAiRateLimit(userId: string, actionType: string, windowMinutes: number): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);
    
    await db.insert(aiRateLimits).values({
      userId,
      actionType,
      windowStart: now,
      windowEnd,
      actionCount: 1
    });
  }

  // ============================================
  // INDUSTRY PROFILES & ELIGIBILITY SYSTEM
  // ============================================

  async getIndustryProfiles(): Promise<IndustryProfile[]> {
    return db.select().from(industryProfiles).orderBy(industryProfiles.sortOrder);
  }

  async getIndustryProfileBySlug(slug: string): Promise<IndustryProfile | null> {
    const result = await db.select().from(industryProfiles).where(eq(industryProfiles.slug, slug)).limit(1);
    return result[0] || null;
  }

  async getActiveIndustryProfiles(): Promise<IndustryProfile[]> {
    return db.select()
      .from(industryProfiles)
      .where(eq(industryProfiles.isActive, true))
      .orderBy(industryProfiles.sortOrder);
  }

  async createEligibilityAssessment(assessment: InsertEligibilityAssessment): Promise<EligibilityAssessment> {
    const [result] = await db.insert(eligibilityAssessments).values(assessment).returning();
    return result;
  }

  async getEligibilityAssessment(id: string): Promise<EligibilityAssessment | undefined> {
    const result = await db.select().from(eligibilityAssessments).where(eq(eligibilityAssessments.id, id)).limit(1);
    return result[0];
  }

  async getUserEligibilityAssessments(userId: string): Promise<EligibilityAssessment[]> {
    return db.select()
      .from(eligibilityAssessments)
      .where(eq(eligibilityAssessments.userId, userId))
      .orderBy(desc(eligibilityAssessments.createdAt));
  }

  async getEligibilityAssessmentByToken(token: string): Promise<EligibilityAssessment | undefined> {
    const result = await db.select()
      .from(eligibilityAssessments)
      .where(eq(eligibilityAssessments.accessToken, token))
      .limit(1);
    return result[0];
  }

  async updateEligibilityAssessment(id: string, updates: Partial<EligibilityAssessment>): Promise<EligibilityAssessment | undefined> {
    const [result] = await db.update(eligibilityAssessments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(eligibilityAssessments.id, id))
      .returning();
    return result;
  }

  async createInnovationCoachingSession(session: InsertInnovationCoachingSession): Promise<InnovationCoachingSession> {
    const [result] = await db.insert(innovationCoachingSessions).values(session).returning();
    return result;
  }

  async getInnovationCoachingSession(id: string): Promise<InnovationCoachingSession | undefined> {
    const result = await db.select().from(innovationCoachingSessions).where(eq(innovationCoachingSessions.id, id)).limit(1);
    return result[0];
  }

  async getUserActiveCoachingSession(userId: string): Promise<InnovationCoachingSession | undefined> {
    const result = await db.select()
      .from(innovationCoachingSessions)
      .where(and(
        eq(innovationCoachingSessions.userId, userId),
        eq(innovationCoachingSessions.isActive, true)
      ))
      .orderBy(desc(innovationCoachingSessions.createdAt))
      .limit(1);
    return result[0];
  }

  async updateInnovationCoachingSession(id: string, updates: Partial<InnovationCoachingSession>): Promise<InnovationCoachingSession | undefined> {
    const [result] = await db.update(innovationCoachingSessions)
      .set({ ...updates, lastActivityAt: new Date() })
      .where(eq(innovationCoachingSessions.id, id))
      .returning();
    return result;
  }

  // ============================================
  // PERFORMANCE METRICS
  // ============================================

  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const [result] = await db.insert(performanceMetrics).values(metric).returning();
    return result;
  }

  async getPerformanceMetrics(options: {
    startDate?: Date;
    endDate?: Date;
    pagePath?: string;
    deviceType?: string;
    limit?: number;
  } = {}): Promise<PerformanceMetric[]> {
    const { startDate, endDate, pagePath, deviceType, limit = 1000 } = options;
    
    let query = db.select().from(performanceMetrics);
    
    const conditions = [];
    if (startDate) {
      conditions.push(gt(performanceMetrics.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lt(performanceMetrics.createdAt, endDate));
    }
    if (pagePath) {
      conditions.push(eq(performanceMetrics.pagePath, pagePath));
    }
    if (deviceType) {
      conditions.push(eq(performanceMetrics.deviceType, deviceType));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return query.orderBy(desc(performanceMetrics.createdAt)).limit(limit);
  }

  async getPerformanceStats(startDate?: Date, endDate?: Date): Promise<{
    totalSamples: number;
    avgLcp: number;
    avgFid: number;
    avgCls: number;
    avgFcp: number;
    avgTtfb: number;
    avgInp: number;
    p75Lcp: number;
    p75Fid: number;
    p75Cls: number;
    deviceBreakdown: Array<{ deviceType: string; count: number }>;
    pageBreakdown: Array<{ pagePath: string; avgLcp: number; count: number }>;
  }> {
    const metrics = await this.getPerformanceMetrics({ startDate, endDate, limit: 5000 });
    
    const validLcp = metrics.filter(m => m.lcp != null).map(m => m.lcp!);
    const validFid = metrics.filter(m => m.fid != null).map(m => m.fid!);
    const validCls = metrics.filter(m => m.cls != null).map(m => m.cls!);
    const validFcp = metrics.filter(m => m.fcp != null).map(m => m.fcp!);
    const validTtfb = metrics.filter(m => m.ttfb != null).map(m => m.ttfb!);
    const validInp = metrics.filter(m => m.inp != null).map(m => m.inp!);

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const p75 = (arr: number[]) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * 0.75);
      return sorted[idx];
    };

    const deviceMap = new Map<string, number>();
    metrics.forEach(m => {
      const device = m.deviceType || 'unknown';
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });

    const pageMap = new Map<string, { lcpSum: number; count: number }>();
    metrics.forEach(m => {
      const path = m.pagePath;
      const existing = pageMap.get(path) || { lcpSum: 0, count: 0 };
      existing.lcpSum += m.lcp || 0;
      existing.count += 1;
      pageMap.set(path, existing);
    });

    return {
      totalSamples: metrics.length,
      avgLcp: Math.round(avg(validLcp)),
      avgFid: Math.round(avg(validFid)),
      avgCls: Math.round(avg(validCls)),
      avgFcp: Math.round(avg(validFcp)),
      avgTtfb: Math.round(avg(validTtfb)),
      avgInp: Math.round(avg(validInp)),
      p75Lcp: Math.round(p75(validLcp)),
      p75Fid: Math.round(p75(validFid)),
      p75Cls: Math.round(p75(validCls)),
      deviceBreakdown: Array.from(deviceMap.entries()).map(([deviceType, count]) => ({ deviceType, count })),
      pageBreakdown: Array.from(pageMap.entries())
        .map(([pagePath, data]) => ({ 
          pagePath, 
          avgLcp: Math.round(data.lcpSum / data.count), 
          count: data.count 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  async cleanupOldPerformanceMetrics(olderThan: Date): Promise<number> {
    const result = await db.delete(performanceMetrics)
      .where(lt(performanceMetrics.createdAt, olderThan));
    return (result as any).rowCount || 0;
  }

  // ============================================
  // COVER DESIGNS IMPLEMENTATION
  // ============================================

  async saveCoverDesign(design: InsertCoverDesign): Promise<CoverDesign> {
    const result = await db.insert(coverDesigns).values(design).returning();
    return result[0];
  }

  async getUserCoverDesigns(userId: string): Promise<CoverDesign[]> {
    return await db.select().from(coverDesigns)
      .where(eq(coverDesigns.userId, userId))
      .orderBy(desc(coverDesigns.updatedAt));
  }

  async getLatestCoverDesign(userId: string): Promise<CoverDesign | undefined> {
    const result = await db.select().from(coverDesigns)
      .where(eq(coverDesigns.userId, userId))
      .orderBy(desc(coverDesigns.updatedAt))
      .limit(1);
    return result[0];
  }

  async getCoverDesign(id: string): Promise<CoverDesign | undefined> {
    const result = await db.select().from(coverDesigns)
      .where(eq(coverDesigns.id, id))
      .limit(1);
    return result[0];
  }

  async updateCoverDesign(id: string, updates: Partial<CoverDesign>): Promise<CoverDesign | undefined> {
    const result = await db.update(coverDesigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(coverDesigns.id, id))
      .returning();
    return result[0];
  }

  async deleteCoverDesign(id: string): Promise<void> {
    await db.delete(coverDesigns).where(eq(coverDesigns.id, id));
  }

  // ============================================
  // PREMIUM COVER TEMPLATE PURCHASES
  // ============================================

  async createPremiumCoverPurchase(purchase: InsertPremiumCoverPurchase): Promise<PremiumCoverPurchase> {
    const result = await db.insert(premiumCoverPurchases).values(purchase).returning();
    return result[0];
  }

  async getPremiumCoverPurchase(id: string): Promise<PremiumCoverPurchase | undefined> {
    const result = await db.select().from(premiumCoverPurchases)
      .where(eq(premiumCoverPurchases.id, id))
      .limit(1);
    return result[0];
  }

  async getUserPremiumCoverPurchases(userId: string): Promise<PremiumCoverPurchase[]> {
    return await db.select().from(premiumCoverPurchases)
      .where(and(
        eq(premiumCoverPurchases.userId, userId),
        eq(premiumCoverPurchases.status, 'completed')
      ))
      .orderBy(desc(premiumCoverPurchases.purchasedAt));
  }

  async getUserPurchasedTemplateIds(userId: string): Promise<string[]> {
    const purchases = await db.select({ templateId: premiumCoverPurchases.templateId })
      .from(premiumCoverPurchases)
      .where(and(
        eq(premiumCoverPurchases.userId, userId),
        eq(premiumCoverPurchases.status, 'completed')
      ));
    return purchases.map(p => p.templateId);
  }

  async hasUserPurchasedTemplate(userId: string, templateId: string): Promise<boolean> {
    const result = await db.select({ id: premiumCoverPurchases.id })
      .from(premiumCoverPurchases)
      .where(and(
        eq(premiumCoverPurchases.userId, userId),
        eq(premiumCoverPurchases.templateId, templateId),
        eq(premiumCoverPurchases.status, 'completed')
      ))
      .limit(1);
    return result.length > 0;
  }

  async updatePremiumCoverPurchase(id: string, updates: Partial<PremiumCoverPurchase>): Promise<PremiumCoverPurchase | undefined> {
    const result = await db.update(premiumCoverPurchases)
      .set(updates)
      .where(eq(premiumCoverPurchases.id, id))
      .returning();
    return result[0];
  }

  async getPremiumCoverPurchaseByStripeSession(sessionId: string): Promise<PremiumCoverPurchase | undefined> {
    const result = await db.select().from(premiumCoverPurchases)
      .where(eq(premiumCoverPurchases.stripeSessionId, sessionId))
      .limit(1);
    return result[0];
  }
}

export const storage = new DatabaseStorage();
