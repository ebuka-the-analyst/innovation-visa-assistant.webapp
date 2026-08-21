import crypto from "crypto";
import type { Request } from "express";
import { dbPool } from "./db";
import { sendEmail } from "./email";

const pool = dbPool as any;

function rows<T = any>(result: any): T[] {
  return Array.isArray(result) ? result : (result?.rows || []);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appBaseUrl(req?: Request): string {
  const configured = String(process.env.PUBLIC_APP_URL || process.env.APP_URL || process.env.BASE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");
  if (req) {
    const host = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
    if (host) {
      const proto = String(req.get("x-forwarded-proto") || "").split(",")[0].trim();
      return `${proto === "https" || req.secure ? "https" : "http"}://${host}`;
    }
  }
  return "https://innovatorfoundervisaassistant.co.uk";
}

function newSetupToken(): { token: string; expiry: Date } {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

async function findAccount(client: any, email: string) {
  return rows<any>(await client.query(`
    SELECT
      u.id,
      u.email,
      u.password,
      u.google_id AS "googleId",
      u.is_email_verified AS "isEmailVerified",
      EXISTS (
        SELECT 1
        FROM expert_consultation_bookings b
        WHERE b.provisioned_user_id = u.id
          AND b.user_id IS NULL
          AND b.payment_status <> 'paid'
      ) AS "isBookingPlaceholder"
    FROM users u
    WHERE lower(u.email) = $1
    LIMIT 1
  `, [email]))[0] || null;
}

export async function getOrCreateProvisionedExpertBookingAccount(
  client: any,
  input: { email: string; firstName: string; lastName?: string | null },
): Promise<{ userId?: string; requiresSignIn: boolean }> {
  const email = input.email.toLowerCase().trim();
  let existing = await findAccount(client, email);

  if (existing) {
    const reusablePlaceholder = Boolean(
      existing.isBookingPlaceholder
      && !existing.isEmailVerified
      && !existing.password
      && !existing.googleId,
    );
    if (!reusablePlaceholder) return { requiresSignIn: true };

    const setup = newSetupToken();
    await client.query(`
      UPDATE users
      SET first_name = COALESCE(NULLIF($2, ''), first_name),
          last_name = COALESCE(NULLIF($3, ''), last_name),
          reset_token = $4,
          reset_token_expiry = $5,
          updated_at = NOW()
      WHERE id = $1
    `, [existing.id, input.firstName.trim(), (input.lastName || "").trim(), setup.token, setup.expiry]);
    return { userId: existing.id, requiresSignIn: false };
  }

  const setup = newSetupToken();
  const inserted = rows<any>(await client.query(`
    INSERT INTO users (
      email, first_name, last_name, is_email_verified,
      reset_token, reset_token_expiry, subscription_tier, subscription_status
    ) VALUES ($1,$2,$3,false,$4,$5,'free','inactive')
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `, [email, input.firstName.trim(), (input.lastName || "").trim() || null, setup.token, setup.expiry]))[0];

  if (inserted?.id) return { userId: inserted.id, requiresSignIn: false };

  existing = await findAccount(client, email);
  const reusableAfterRace = Boolean(
    existing?.isBookingPlaceholder
    && !existing?.isEmailVerified
    && !existing?.password
    && !existing?.googleId,
  );
  return reusableAfterRace
    ? { userId: existing.id, requiresSignIn: false }
    : { requiresSignIn: true };
}

async function loginUser(req: Request, userId: string): Promise<void> {
  const request = req as any;
  if (typeof request.login !== "function") return;
  await new Promise<void>((resolve, reject) => {
    request.login({ id: userId }, (loginError: any) => {
      if (loginError) return reject(loginError);
      if (!request.session || typeof request.session.save !== "function") return resolve();
      request.session.save((saveError: any) => saveError ? reject(saveError) : resolve());
    });
  });
}

async function sendSetupEmail(account: any, req?: Request): Promise<void> {
  if (!account?.email || !account?.resetToken) return;
  const setupUrl = `${appBaseUrl(req)}/reset-password?token=${encodeURIComponent(account.resetToken)}`;
  await sendEmail({
    to: account.email,
    subject: "Your Expert Booking account is ready",
    emailType: "expert_booking_account_setup",
    recipientName: account.firstName || undefined,
    userId: account.userId,
    html: `
      <h2>Your account is ready</h2>
      <p>Hi ${escapeHtml(account.firstName || "there")},</p>
      <p>We created your Innovator Founder Visa Assistant account automatically when your expert consultation was confirmed.</p>
      <p>You are signed in on the device you used to book. To access your account later, set a password using the secure link below.</p>
      <p><a href="${escapeHtml(setupUrl)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0f5bd8;color:#fff;text-decoration:none;font-weight:600;">Set your password</a></p>
      <p>This setup link expires in 24 hours. If it expires, use the Forgot password option with this email address.</p>
    `,
  });
}

export async function activateProvisionedExpertBookingAccount(
  bookingId: string,
  req?: Request,
): Promise<{ userId: string; accountCreated: true } | null> {
  const client = await pool.connect();
  let account: any = null;
  let shouldSendSetup = false;

  try {
    await client.query("BEGIN");
    account = rows<any>(await client.query(`
      SELECT
        b.id,
        b.provisioned_user_id AS "userId",
        u.email,
        u.first_name AS "firstName",
        u.reset_token AS "resetToken"
      FROM expert_consultation_bookings b
      JOIN users u ON u.id = b.provisioned_user_id
      WHERE b.id = $1
      FOR UPDATE OF b
    `, [bookingId]))[0] || null;

    if (!account?.userId) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(`
      UPDATE users
      SET is_email_verified = true,
          updated_at = NOW()
      WHERE id = $1
    `, [account.userId]);

    await client.query(`
      UPDATE expert_consultation_bookings
      SET user_id = COALESCE(user_id, provisioned_user_id),
          updated_at = NOW()
      WHERE id = $1
    `, [bookingId]);

    const marked = rows<any>(await client.query(`
      UPDATE expert_consultation_bookings
      SET account_setup_sent_at = NOW()
      WHERE id = $1 AND account_setup_sent_at IS NULL
      RETURNING id
    `, [bookingId]))[0];
    shouldSendSetup = Boolean(marked);

    await client.query("COMMIT");
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    throw error;
  } finally {
    client.release();
  }

  if (req) await loginUser(req, account.userId);
  if (shouldSendSetup) {
    void sendSetupEmail(account, req).catch((error) => {
      console.error("[Expert Booking Account] Setup email failed", error);
    });
  }

  return { userId: account.userId, accountCreated: true };
}
