import { db } from "../db";
import { achievements, userAchievements, certificates, users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { notifyAchievementEarned } from "./notificationService";

export interface UserProgress {
  toolsCompleted: number;
  categoriesCompleted: string[];
  streakDays: number;
  documentCount: number;
  interviewCount: number;
  readinessScore: number;
  highScores: Record<string, number>;
}

export async function checkAndAwardAchievements(userId: string, progress: Partial<UserProgress>) {
  const allAchievements = await db.select().from(achievements).where(eq(achievements.isActive, true));
  const userAchievementsList = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  
  const earnedIds = new Set(userAchievementsList.filter(ua => ua.isComplete).map(ua => ua.achievementId));
  const newlyEarned: typeof achievements.$inferSelect[] = [];

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    let isEarned = false;
    let currentProgress = 0;

    switch (achievement.requirementType) {
      case 'tool_count':
        currentProgress = progress.toolsCompleted || 0;
        isEarned = currentProgress >= achievement.requirementValue;
        break;
      case 'category_complete':
        currentProgress = (progress.categoriesCompleted || []).length;
        isEarned = currentProgress >= achievement.requirementValue;
        break;
      case 'streak':
        currentProgress = progress.streakDays || 0;
        isEarned = currentProgress >= achievement.requirementValue;
        break;
      case 'document_count':
        currentProgress = progress.documentCount || 0;
        isEarned = currentProgress >= achievement.requirementValue;
        break;
      case 'interview_count':
        currentProgress = progress.interviewCount || 0;
        isEarned = currentProgress >= achievement.requirementValue;
        break;
      case 'readiness_score':
        currentProgress = progress.readinessScore || 0;
        isEarned = currentProgress >= achievement.requirementValue;
        break;
      case 'score':
        const highScores = progress.highScores || {};
        const meta = achievement.requirementMeta as { toolCode?: string } | null;
        if (meta?.toolCode && highScores[meta.toolCode]) {
          currentProgress = highScores[meta.toolCode];
          isEarned = currentProgress >= achievement.requirementValue;
        }
        break;
    }

    const existingProgress = userAchievementsList.find(ua => ua.achievementId === achievement.id);
    
    if (isEarned) {
      if (existingProgress) {
        await db.update(userAchievements)
          .set({ isComplete: true, progress: currentProgress, earnedAt: new Date() })
          .where(eq(userAchievements.id, existingProgress.id));
      } else {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress: currentProgress,
          isComplete: true,
          metadata: { earnedAt: new Date().toISOString() }
        });
      }
      
      newlyEarned.push(achievement);
      await notifyAchievementEarned(userId, achievement.name, achievement.points);
    } else if (currentProgress > 0) {
      if (existingProgress) {
        await db.update(userAchievements)
          .set({ progress: currentProgress })
          .where(eq(userAchievements.id, existingProgress.id));
      } else {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress: currentProgress,
          isComplete: false
        });
      }
    }
  }

  return newlyEarned;
}

export async function getUserAchievements(userId: string) {
  const results = await db.select({
    userAchievement: userAchievements,
    achievement: achievements
  })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));

  return results.map(r => ({
    ...r.achievement,
    progress: r.userAchievement.progress,
    isComplete: r.userAchievement.isComplete,
    earnedAt: r.userAchievement.earnedAt
  }));
}

export async function getAllAchievements() {
  return db.select().from(achievements).where(eq(achievements.isActive, true));
}

export async function getUserPoints(userId: string) {
  const result = await db.select({
    totalPoints: sql<number>`COALESCE(SUM(${achievements.points}), 0)`
  })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.isComplete, true)
    ));

  return result[0]?.totalPoints || 0;
}

export async function issueCertificate(
  userId: string, 
  type: 'visa_ready' | 'tool_mastery' | 'category_complete',
  title: string,
  description?: string
) {
  const certNumber = `UKIFV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Valued Member';

  const [certificate] = await db.insert(certificates).values({
    userId,
    type,
    title,
    description: description || `Awarded to ${userName} for outstanding achievement in their UK Innovator Founder Visa journey.`,
    certificateNumber: certNumber,
    verificationUrl: `https://innovatorfoundervisaassistant.co.uk/verify/${certNumber}`,
    isShareable: true
  }).returning();

  return certificate;
}

export async function getUserCertificates(userId: string) {
  return db.select().from(certificates).where(eq(certificates.userId, userId));
}

export async function verifyCertificate(certificateNumber: string) {
  const [certificate] = await db.select()
    .from(certificates)
    .where(eq(certificates.certificateNumber, certificateNumber));
  
  if (!certificate) return null;

  const [user] = await db.select({
    firstName: users.firstName,
    lastName: users.lastName
  }).from(users).where(eq(users.id, certificate.userId));

  return {
    isValid: true,
    certificate,
    holderName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Certificate Holder'
  };
}
