import { db } from "../db";
import { notificationPreferences, scheduledNotifications, users } from "@shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { sendEmail } from "../email";

export interface NotificationData {
  userId: string;
  type: 'deadline_reminder' | 'weekly_digest' | 'breaking_news' | 'milestone' | 'tool_completion' | 'achievement';
  title: string;
  content: string;
  scheduledFor: Date;
  metadata?: Record<string, any>;
}

export async function scheduleNotification(data: NotificationData) {
  const [notification] = await db.insert(scheduledNotifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    content: data.content,
    scheduledFor: data.scheduledFor,
    metadata: data.metadata,
    status: 'pending'
  }).returning();
  
  return notification;
}

export async function getNotificationPreferences(userId: string) {
  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  return prefs;
}

export async function updateNotificationPreferences(userId: string, updates: Partial<typeof notificationPreferences.$inferInsert>) {
  const existing = await getNotificationPreferences(userId);
  
  if (existing) {
    const [updated] = await db.update(notificationPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(notificationPreferences)
      .values({ userId, ...updates })
      .returning();
    return created;
  }
}

export async function processPendingNotifications() {
  const now = new Date();
  
  const pending = await db.select()
    .from(scheduledNotifications)
    .where(
      and(
        eq(scheduledNotifications.status, 'pending'),
        lte(scheduledNotifications.scheduledFor, now)
      )
    )
    .limit(50);

  for (const notification of pending) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, notification.userId));
      if (!user?.email) continue;

      const prefs = await getNotificationPreferences(notification.userId);
      
      let shouldSend = true;
      if (prefs) {
        switch (notification.type) {
          case 'weekly_digest':
            shouldSend = prefs.weeklyDigest;
            break;
          case 'deadline_reminder':
            shouldSend = prefs.deadlineReminders;
            break;
          case 'breaking_news':
            shouldSend = prefs.breakingNewsAlerts;
            break;
          case 'tool_completion':
            shouldSend = prefs.toolCompletionCelebrations;
            break;
          case 'milestone':
          case 'achievement':
            shouldSend = prefs.progressMilestones;
            break;
        }
      }

      if (shouldSend) {
        await sendEmail({
          to: user.email,
          subject: notification.title,
          html: generateEmailHtml(notification.type, notification.title, notification.content),
        });

        await db.update(scheduledNotifications)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(scheduledNotifications.id, notification.id));
      } else {
        await db.update(scheduledNotifications)
          .set({ status: 'cancelled' })
          .where(eq(scheduledNotifications.id, notification.id));
      }
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);
      await db.update(scheduledNotifications)
        .set({ status: 'failed' })
        .where(eq(scheduledNotifications.id, notification.id));
    }
  }

  return pending.length;
}

function generateEmailHtml(type: string, title: string, content: string): string {
  const brandColor = '#ffa536';
  const secondaryColor = '#11b6e9';
  
  const typeEmojis: Record<string, string> = {
    'weekly_digest': '📊',
    'deadline_reminder': '⏰',
    'breaking_news': '📰',
    'milestone': '🎯',
    'tool_completion': '✅',
    'achievement': '🏆'
  };

  const emoji = typeEmojis[type] || '📧';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${emoji} ${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <div style="color: #333; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; text-align: center;">
              <a href="https://innovatorfoundervisaassistant.co.uk" style="display: inline-block; background: linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Continue Your Journey
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              UK Innovator Founder Visa Assistant<br>
              <a href="https://innovatorfoundervisaassistant.co.uk/settings" style="color: #666;">Manage notification preferences</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function scheduleWeeklyDigest(userId: string) {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
  nextMonday.setHours(9, 0, 0, 0);

  return scheduleNotification({
    userId,
    type: 'weekly_digest',
    title: 'Your Weekly Visa Journey Progress',
    content: 'Your personalized weekly digest is ready! Check your progress and upcoming tasks.',
    scheduledFor: nextMonday,
    metadata: { digestType: 'weekly' }
  });
}

export async function scheduleDeadlineReminder(userId: string, deadline: Date, description: string) {
  const reminderDate = new Date(deadline);
  reminderDate.setDate(reminderDate.getDate() - 7);

  if (reminderDate > new Date()) {
    return scheduleNotification({
      userId,
      type: 'deadline_reminder',
      title: `Upcoming Deadline: ${description}`,
      content: `Your deadline "${description}" is coming up in 7 days. Make sure you're prepared!`,
      scheduledFor: reminderDate,
      metadata: { deadline: deadline.toISOString(), description }
    });
  }
  return null;
}

export async function notifyAchievementEarned(userId: string, achievementName: string, points: number) {
  return scheduleNotification({
    userId,
    type: 'achievement',
    title: `Achievement Unlocked: ${achievementName}`,
    content: `Congratulations! You've earned the "${achievementName}" achievement and ${points} points. Keep up the great work on your visa journey!`,
    scheduledFor: new Date(),
    metadata: { achievementName, points }
  });
}

export async function notifyToolCompletion(userId: string, toolName: string) {
  return scheduleNotification({
    userId,
    type: 'tool_completion',
    title: `Tool Completed: ${toolName}`,
    content: `You've successfully completed the ${toolName} tool. Your visa application is getting stronger!`,
    scheduledFor: new Date(),
    metadata: { toolName }
  });
}
