import type { Express, NextFunction, Request, Response } from "express";
import crypto from "crypto";
import OpenAI from "openai";
import { z } from "zod";
import { dbPool } from "./db";
import { isAuthenticated, requireAdmin } from "./auth";
import { sendEmail } from "./email";

const pool = dbPool as any;

function rows<T = any>(result: any): T[] {
  return Array.isArray(result) ? result : (result?.rows || []);
}

function currentUserId(req: Request): string | null {
  return String((req.user as any)?.id || "").trim() || null;
}

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function appBaseUrl(req: Request): string {
  const configured = String(
    process.env.BASE_URL || process.env.PUBLIC_APP_URL || process.env.APP_URL || "",
  ).trim();
  if (configured) return configured.replace(/\/$/, "");
  const railwayDomain = String(process.env.RAILWAY_PUBLIC_DOMAIN || "").trim();
  if (railwayDomain) return `https://${railwayDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  const host = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
  const proto = String(req.get("x-forwarded-proto") || "").split(",")[0].trim() || (req.secure ? "https" : "http");
  if (!host) throw new Error("Unable to determine application base URL");
  return `${proto}://${host}`;
}

function sameOriginMutation(req: Request, res: Response, next: NextFunction) {
  const origin = String(req.get("origin") || "").trim();
  if (!origin) return next();
  try {
    const parsed = new URL(origin);
    const host = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
    if (!host || parsed.host !== host) return res.status(403).json({ error: "Untrusted request origin." });
    return next();
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
}

function validTimeZone(value: string): string {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return "Europe/London";
  }
}

function validAvailability(startTime: string, endTime: string): boolean {
  const minutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };
  return minutes(endTime) > minutes(startTime);
}

const inviteSchema = z.object({
  recipientEmail: z.string().email().max(255).optional().or(z.literal("")),
  expiresInDays: z.number().int().min(1).max(90).optional().default(30),
});

const applicationSchema = z.object({
  inviteToken: z.string().min(24).max(200),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().default(""),
  profileImageUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  publicTitle: z.string().trim().min(3).max(180),
  publicBio: z.string().trim().min(40).max(4000),
  firmName: z.string().trim().max(255).optional().default(""),
  regulatorType: z.enum(["sra", "iaa", "both", "other"]),
  sraNumber: z.string().trim().max(50).optional().default(""),
  iaaRegistrationNumber: z.string().trim().max(50).optional().default(""),
  iaaLevel: z.string().trim().max(20).optional().default(""),
  yearsExperience: z.number().int().min(0).max(80),
  specializations: z.array(z.string().trim().min(2).max(100)).min(1).max(20),
  timezone: z.string().trim().min(1).max(64),
  meetingMode: z.enum(["video", "phone", "either"]),
  bookingNoticeHours: z.number().int().min(0).max(720),
  bookingHorizonDays: z.number().int().min(1).max(365),
  slotIntervalMinutes: z.number().int().min(15).max(120),
  bufferMinutes: z.number().int().min(0).max(120),
  serviceName: z.string().trim().min(3).max(160),
  serviceDescription: z.string().trim().min(20).max(2000),
  durationMinutes: z.number().int().min(15).max(360),
  pricePounds: z.number().min(0).max(5000),
  preparationNote: z.string().trim().max(3000).optional().default(""),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  accuracyConfirmed: z.literal(true),
  displayConsent: z.literal(true),
});

const enhanceFields = new Set([
  "publicTitle",
  "publicBio",
  "firmName",
  "serviceName",
  "serviceDescription",
  "preparationNote",
  "specializations",
]);

const enhanceSchema = z.object({
  inviteToken: z.string().min(24).max(200),
  field: z.string().min(2).max(80),
  text: z.string().trim().min(2).max(4000),
});

const enhanceRate = new Map<string, { count: number; resetAt: number }>();
function allowEnhance(key: string): boolean {
  const now = Date.now();
  const current = enhanceRate.get(key);
  if (!current || current.resetAt <= now) {
    enhanceRate.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}

async function validInvite(rawToken: string) {
  return rows<any>(await pool.query(`
    SELECT id, recipient_email AS "recipientEmail", status, expires_at AS "expiresAt"
    FROM expert_network_invites
    WHERE token_hash = $1
    LIMIT 1
  `, [tokenHash(rawToken)]))[0];
}

async function managedEnhancement(field: string, text: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
  const response: any = await client.chat.completions.create({
    model: "platform-latest",
    max_completion_tokens: 500,
    messages: [
      {
        role: "system",
        content: "You improve professional profile wording for regulated UK immigration/legal professionals. Preserve every factual claim exactly. Never invent credentials, regulator status, registration numbers, experience, employers, outcomes, success rates, clients, awards, languages, qualifications or legal expertise that the person did not supply. Improve clarity, grammar, concision and professional tone only. Return only the improved text, with no commentary or quotation marks.",
      },
      {
        role: "user",
        content: `Field: ${field}\nOriginal text:\n${text}`,
      },
    ],
  });
  return String(response?.choices?.[0]?.message?.content || "").trim();
}

export function registerExpertApplicationRoutes(app: Express): void {
  app.post("/api/admin/expert-applications/invites", isAuthenticated, requireAdmin, sameOriginMutation, async (req, res) => {
    const parsed = inviteSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: "Please provide a valid invitation configuration." });
    try {
      const token = crypto.randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000);
      const invite = rows<any>(await pool.query(`
        INSERT INTO expert_network_invites (token_hash, recipient_email, created_by, expires_at)
        VALUES ($1,$2,$3,$4)
        RETURNING id, recipient_email AS "recipientEmail", expires_at AS "expiresAt", status
      `, [tokenHash(token), parsed.data.recipientEmail || null, currentUserId(req), expiresAt.toISOString()]))[0];
      const inviteUrl = `${appBaseUrl(req)}/join-expert-network?invite=${encodeURIComponent(token)}`;
      return res.status(201).json({ ...invite, inviteUrl });
    } catch (error) {
      console.error("[Expert Application] Create invite failed", error);
      return res.status(500).json({ error: "Unable to create the invitation link." });
    }
  });

  app.get("/api/admin/expert-applications", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const applications = rows<any>(await pool.query(`
        SELECT a.id, a.expert_id AS "expertId", a.email,
          a.first_name AS "firstName", a.last_name AS "lastName", a.phone,
          a.regulator_type AS "regulatorType", a.regulator_number AS "regulatorNumber",
          a.review_status AS "reviewStatus", a.created_at AS "createdAt",
          a.reviewed_at AS "reviewedAt", a.review_notes AS "reviewNotes",
          p.public_title AS "publicTitle", p.consultation_enabled AS "consultationEnabled",
          s.name AS "serviceName", s.price_pence AS "pricePence", s.currency,
          s.duration_minutes AS "durationMinutes"
        FROM expert_network_applications a
        LEFT JOIN expert_consultation_profiles p ON p.expert_id = a.expert_id
        LEFT JOIN LATERAL (
          SELECT name, price_pence, currency, duration_minutes
          FROM expert_consultation_services
          WHERE expert_id = a.expert_id
          ORDER BY sort_order, created_at
          LIMIT 1
        ) s ON true
        ORDER BY CASE WHEN a.review_status = 'pending_verification' THEN 0 ELSE 1 END, a.created_at DESC
        LIMIT 200
      `));
      return res.json(applications);
    } catch (error) {
      console.error("[Expert Application] Admin list failed", error);
      return res.status(500).json({ error: "Unable to load professional applications." });
    }
  });

  app.patch("/api/admin/expert-applications/:applicationId/review", isAuthenticated, requireAdmin, sameOriginMutation, async (req, res) => {
    const reviewSchema = z.object({
      decision: z.enum(["approved", "rejected"]),
      notes: z.string().trim().max(2000).optional().default(""),
    });
    const parsed = reviewSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: "Choose approve or reject." });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const application = rows<any>(await client.query(`
        SELECT id, expert_id AS "expertId", email, first_name AS "firstName"
        FROM expert_network_applications
        WHERE id = $1 FOR UPDATE
      `, [req.params.applicationId]))[0];
      if (!application?.expertId) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Application not found." });
      }
      const approved = parsed.data.decision === "approved";
      await client.query(`
        UPDATE expert_network_applications
        SET review_status = $2, review_notes = $3, reviewed_by = $4, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [application.id, parsed.data.decision, parsed.data.notes || null, currentUserId(req)]);
      await client.query(`UPDATE immigration_lawyers SET is_available = $2 WHERE id = $1`, [application.expertId, approved]);
      await client.query(`
        UPDATE expert_consultation_profiles
        SET consultation_enabled = $2, updated_at = NOW()
        WHERE expert_id = $1
      `, [application.expertId, approved]);
      await client.query("COMMIT");

      if (application.email) {
        void sendEmail({
          to: application.email,
          recipientName: application.firstName || undefined,
          emailType: "expert_network_application",
          subject: approved ? "Your Expert Support profile has been approved" : "Update on your Expert Support profile",
          html: approved
            ? `<h2>Your professional profile is approved</h2><p>Your Expert Support profile has been verified by the platform administrator and can now be displayed for consultation bookings.</p>`
            : `<h2>Update on your professional profile</h2><p>Thank you for your submission. Your profile is not being published at this time.</p>${parsed.data.notes ? `<p>${String(parsed.data.notes).replace(/[<>&]/g, "")}</p>` : ""}`,
        });
      }
      return res.json({ success: true, decision: parsed.data.decision });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Expert Application] Review failed", error);
      return res.status(500).json({ error: "Unable to update the application." });
    } finally {
      client.release();
    }
  });

  app.get("/api/expert-applications/invite/:token", async (req, res) => {
    try {
      const invite = await validInvite(String(req.params.token || ""));
      if (!invite) return res.status(404).json({ error: "This invitation link is not valid." });
      if (invite.status !== "active") return res.status(410).json({ error: "This invitation link has already been used or cancelled." });
      if (new Date(invite.expiresAt).getTime() <= Date.now()) {
        await pool.query(`UPDATE expert_network_invites SET status = 'expired', updated_at = NOW() WHERE id = $1`, [invite.id]).catch(() => {});
        return res.status(410).json({ error: "This invitation link has expired." });
      }
      return res.json({ valid: true, recipientEmail: invite.recipientEmail || null, expiresAt: invite.expiresAt });
    } catch (error) {
      console.error("[Expert Application] Invite validation failed", error);
      return res.status(500).json({ error: "Unable to validate this invitation." });
    }
  });

  app.post("/api/expert-applications/enhance", sameOriginMutation, async (req, res) => {
    const parsed = enhanceSchema.safeParse(req.body || {});
    if (!parsed.success || !enhanceFields.has(parsed.data.field)) {
      return res.status(400).json({ error: "This field cannot be enhanced." });
    }
    try {
      const invite = await validInvite(parsed.data.inviteToken);
      if (!invite || invite.status !== "active" || new Date(invite.expiresAt).getTime() <= Date.now()) {
        return res.status(403).json({ error: "A valid invitation is required." });
      }
      const key = `${req.ip || "unknown"}:${invite.id}`;
      if (!allowEnhance(key)) return res.status(429).json({ error: "Please wait a moment before enhancing more fields." });
      const enhanced = await managedEnhancement(parsed.data.field, parsed.data.text);
      if (!enhanced) return res.status(503).json({ error: "AI enhancement is temporarily unavailable." });
      return res.json({ enhanced: enhanced.slice(0, 5000) });
    } catch (error) {
      console.error("[Expert Application] AI enhance failed", error);
      return res.status(503).json({ error: "AI enhancement is temporarily unavailable. You can still submit your original wording." });
    }
  });

  app.post("/api/expert-applications/submit", sameOriginMutation, async (req, res) => {
    const parsed = applicationSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Please complete all required profile, consultation and availability fields." });
    }
    const input = parsed.data;
    if (!validAvailability(input.startTime, input.endTime)) {
      return res.status(400).json({ error: "Availability end time must be after the start time." });
    }
    if ((input.regulatorType === "sra" || input.regulatorType === "both") && !input.sraNumber) {
      return res.status(400).json({ error: "Please provide your SRA number." });
    }
    if ((input.regulatorType === "iaa" || input.regulatorType === "both") && !input.iaaRegistrationNumber) {
      return res.status(400).json({ error: "Please provide your IAA/OISC registration number." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const invite = rows<any>(await client.query(`
        SELECT id, recipient_email AS "recipientEmail", status, expires_at AS "expiresAt"
        FROM expert_network_invites
        WHERE token_hash = $1 FOR UPDATE
      `, [tokenHash(input.inviteToken)]))[0];
      if (!invite || invite.status !== "active" || new Date(invite.expiresAt).getTime() <= Date.now()) {
        await client.query("ROLLBACK");
        return res.status(410).json({ error: "This invitation link is no longer available." });
      }
      if (invite.recipientEmail && invite.recipientEmail.toLowerCase() !== input.email.toLowerCase()) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Please use the email address this invitation was issued to." });
      }
      const duplicate = rows<any>(await client.query(`SELECT id FROM immigration_lawyers WHERE lower(email) = lower($1) LIMIT 1`, [input.email]))[0];
      if (duplicate) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "A professional profile already exists for this email address." });
      }

      const expert = rows<any>(await client.query(`
        INSERT INTO immigration_lawyers (
          email, first_name, last_name, profile_image_url, oisc_level,
          oisc_registration_number, sra_number, firm_name, specializations,
          years_experience, is_available, status, bio
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,true,'active',$11)
        RETURNING id
      `, [
        input.email.toLowerCase(), input.firstName, input.lastName, input.profileImageUrl || null,
        input.iaaLevel || null, input.iaaRegistrationNumber || null, input.sraNumber || null,
        input.firmName || null, JSON.stringify(input.specializations), input.yearsExperience, input.publicBio,
      ]))[0];

      const timezone = validTimeZone(input.timezone);
      await client.query(`
        INSERT INTO expert_consultation_profiles (
          expert_id, public_title, public_bio, timezone, consultation_enabled,
          featured, meeting_mode, booking_notice_hours, booking_horizon_days,
          slot_interval_minutes, buffer_minutes, preparation_note
        ) VALUES ($1,$2,$3,$4,false,false,$5,$6,$7,$8,$9,$10)
      `, [
        expert.id, input.publicTitle, input.publicBio, timezone, input.meetingMode,
        input.bookingNoticeHours, input.bookingHorizonDays, input.slotIntervalMinutes,
        input.bufferMinutes, input.preparationNote || null,
      ]);

      await client.query(`
        INSERT INTO expert_consultation_services (
          expert_id, name, description, duration_minutes, price_pence, currency, active, preparation_note
        ) VALUES ($1,$2,$3,$4,$5,'GBP',true,$6)
      `, [
        expert.id, input.serviceName, input.serviceDescription, input.durationMinutes,
        Math.round(input.pricePounds * 100), input.preparationNote || null,
      ]);

      for (const weekday of [...new Set(input.weekdays)]) {
        await client.query(`
          INSERT INTO expert_availability_rules (expert_id, weekday, start_time, end_time, active)
          VALUES ($1,$2,$3,$4,true)
          ON CONFLICT (expert_id, weekday, start_time, end_time) DO NOTHING
        `, [expert.id, weekday, input.startTime, input.endTime]);
      }

      const regulatorNumber = input.regulatorType === "sra"
        ? input.sraNumber
        : input.regulatorType === "iaa"
          ? input.iaaRegistrationNumber
          : input.regulatorType === "both"
            ? `SRA ${input.sraNumber}; IAA/OISC ${input.iaaRegistrationNumber}`
            : "";

      const snapshot = { ...input };
      delete (snapshot as any).inviteToken;
      const application = rows<any>(await client.query(`
        INSERT INTO expert_network_applications (
          invite_id, expert_id, email, first_name, last_name, phone,
          regulator_type, regulator_number, submitted_payload
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
        RETURNING id, review_status AS "reviewStatus"
      `, [
        invite.id, expert.id, input.email.toLowerCase(), input.firstName, input.lastName,
        input.phone || null, input.regulatorType, regulatorNumber || null, JSON.stringify(snapshot),
      ]))[0];

      await client.query(`
        UPDATE expert_network_invites
        SET status = 'used', used_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [invite.id]);
      await client.query("COMMIT");

      void sendEmail({
        to: input.email,
        recipientName: input.firstName,
        emailType: "expert_network_application",
        subject: "Your Expert Support profile has been received",
        html: `<h2>Thank you for joining the Expert Support network</h2><p>Your professional profile, consultation fee and availability have been saved. The platform administrator will verify your professional details before the profile becomes publicly bookable.</p>`,
      });

      const adminEmail = String(process.env.EXPERT_NETWORK_ADMIN_EMAIL || "").trim();
      if (adminEmail) {
        void sendEmail({
          to: adminEmail,
          emailType: "expert_network_application",
          subject: `New expert application: ${input.firstName} ${input.lastName}`,
          html: `<h2>New Expert Support application</h2><p>${input.firstName} ${input.lastName} has submitted a professional profile for verification.</p><p>Open Admin Console → Lawyer Review Center → Manage Network to review it.</p>`,
        });
      }

      return res.status(201).json({
        success: true,
        applicationId: application.id,
        reviewStatus: application.reviewStatus,
        message: "Your profile has been created and is awaiting professional verification before public booking is enabled.",
      });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Expert Application] Submit failed", error);
      return res.status(500).json({ error: "Unable to submit the professional profile." });
    } finally {
      client.release();
    }
  });
}
