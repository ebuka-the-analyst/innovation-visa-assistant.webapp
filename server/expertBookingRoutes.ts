import type { Express, NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { dbPool } from "./db";
import { isAuthenticated, requireAdmin } from "./auth";
import { getUncachableStripeClient } from "./stripeClient";
import { sendEmail } from "./email";

const pool = dbPool as any;
const ACTIVE_BOOKING_STATUSES = ["pending_payment", "confirmed"] as const;
const DEFAULT_TIMEZONE = "Europe/London";
const PUBLIC_APP_URL = "https://innovatorfoundervisaassistant.co.uk";

function rows<T = any>(result: any): T[] {
  return Array.isArray(result) ? result : (result?.rows || []);
}

function currentUserId(req: Request): string | null {
  return String((req.user as any)?.id || "").trim() || null;
}

function mutationOriginGuard(req: Request, res: Response, next: NextFunction) {
  const origin = String(req.get("origin") || "").trim();
  if (!origin) return next();
  try {
    const originUrl = new URL(origin);
    const requestHost = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
    if (!requestHost || originUrl.host !== requestHost) {
      return res.status(403).json({ error: "Cross-origin booking mutation blocked." });
    }
    return next();
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
}

function validTimeZone(value: unknown): string {
  const timezone = String(value || DEFAULT_TIMEZONE).trim();
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(pence: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(pence / 100);
}

function appBaseUrl(req: Request): string {
  const configured = String(process.env.PUBLIC_APP_URL || process.env.APP_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");
  const host = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
  if (!host) return PUBLIC_APP_URL;
  const forwardedProto = String(req.get("x-forwarded-proto") || "").split(",")[0].trim();
  const protocol = forwardedProto === "https" || req.secure ? "https" : "http";
  return `${protocol}://${host}`;
}

function datePartsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function zonedLocalToUtc(dateIso: string, time: string, timeZone: string): Date {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desiredWallTime = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let guess = new Date(desiredWallTime);

  for (let i = 0; i < 3; i += 1) {
    const actual = datePartsInZone(guess, timeZone);
    const actualWallTime = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, 0, 0);
    const delta = desiredWallTime - actualWallTime;
    if (delta === 0) break;
    guess = new Date(guess.getTime() + delta);
  }
  return guess;
}

function localDateIso(date: Date, timeZone: string): string {
  const parts = datePartsInZone(date, timeZone);
  return `${parts.year.toString().padStart(4, "0")}-${parts.month.toString().padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
}

function localMinutes(date: Date, timeZone: string): number {
  const parts = datePartsInZone(date, timeZone);
  return parts.hour * 60 + parts.minute;
}

function weekdayForLocalDate(dateIso: string, timeZone: string): number {
  const midday = zonedLocalToUtc(dateIso, "12:00", timeZone);
  const label = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(midday);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[label] ?? 0;
}

function addDays(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return date.toISOString().slice(0, 10);
}

function timeStringToMinutes(value: string): number {
  const [h, m] = value.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

async function loadPublicExperts() {
  const expertRows = rows<any>(await pool.query(`
    SELECT
      l.id,
      l.first_name AS "firstName",
      l.last_name AS "lastName",
      l.profile_image_url AS "profileImageUrl",
      l.oisc_level AS "oiscLevel",
      l.oisc_registration_number AS "oiscRegistrationNumber",
      l.sra_number AS "sraNumber",
      l.firm_name AS "firmName",
      l.specializations,
      l.years_experience AS "yearsExperience",
      l.success_rate AS "successRate",
      l.average_rating AS "averageRating",
      l.total_reviews_completed AS "totalReviewsCompleted",
      p.public_title AS "publicTitle",
      p.public_bio AS "publicBio",
      p.timezone,
      p.featured,
      p.meeting_mode AS "meetingMode",
      p.booking_notice_hours AS "bookingNoticeHours",
      p.booking_horizon_days AS "bookingHorizonDays",
      p.preparation_note AS "preparationNote"
    FROM immigration_lawyers l
    JOIN expert_consultation_profiles p ON p.expert_id = l.id
    WHERE l.status = 'active'
      AND l.is_available = true
      AND p.consultation_enabled = true
      AND EXISTS (
        SELECT 1 FROM expert_consultation_services s
        WHERE s.expert_id = l.id AND s.active = true
      )
    ORDER BY p.featured DESC, p.sort_order ASC, l.first_name ASC, l.last_name ASC
  `));

  if (!expertRows.length) return [];
  const ids = expertRows.map((expert) => expert.id);
  const serviceRows = rows<any>(await pool.query(`
    SELECT id, expert_id AS "expertId", name, description,
           duration_minutes AS "durationMinutes", price_pence AS "pricePence",
           currency, preparation_note AS "preparationNote", sort_order AS "sortOrder"
    FROM expert_consultation_services
    WHERE active = true AND expert_id = ANY($1::varchar[])
    ORDER BY sort_order ASC, duration_minutes ASC, price_pence ASC
  `, [ids]));

  const byExpert = new Map<string, any[]>();
  for (const service of serviceRows) {
    const current = byExpert.get(service.expertId) || [];
    current.push(service);
    byExpert.set(service.expertId, current);
  }

  return expertRows.map((expert) => ({
    ...expert,
    specializations: Array.isArray(expert.specializations) ? expert.specializations : [],
    services: byExpert.get(expert.id) || [],
  }));
}

async function computeAvailability(expertId: string, serviceId: string, fromDate: string, days: number) {
  const configuration = rows<any>(await pool.query(`
    SELECT
      p.expert_id AS "expertId",
      p.timezone,
      p.booking_notice_hours AS "bookingNoticeHours",
      p.booking_horizon_days AS "bookingHorizonDays",
      p.slot_interval_minutes AS "slotIntervalMinutes",
      p.buffer_minutes AS "bufferMinutes",
      s.id AS "serviceId",
      s.duration_minutes AS "durationMinutes"
    FROM expert_consultation_profiles p
    JOIN immigration_lawyers l ON l.id = p.expert_id
    JOIN expert_consultation_services s ON s.expert_id = p.expert_id
    WHERE p.expert_id = $1
      AND s.id = $2
      AND p.consultation_enabled = true
      AND s.active = true
      AND l.status = 'active'
      AND l.is_available = true
    LIMIT 1
  `, [expertId, serviceId]))[0];

  if (!configuration) return null;
  const timeZone = validTimeZone(configuration.timezone);
  const safeDays = Math.min(Math.max(days, 1), 31);
  const endDate = addDays(fromDate, safeDays);
  const rangeStart = zonedLocalToUtc(fromDate, "00:00", timeZone);
  const rangeEnd = zonedLocalToUtc(endDate, "00:00", timeZone);

  const rules = rows<any>(await pool.query(`
    SELECT weekday, start_time::text AS "startTime", end_time::text AS "endTime"
    FROM expert_availability_rules
    WHERE expert_id = $1 AND active = true
    ORDER BY weekday, start_time
  `, [expertId]));

  const blocks = rows<any>(await pool.query(`
    SELECT start_at AS "startAt", end_at AS "endAt"
    FROM expert_availability_blocks
    WHERE expert_id = $1 AND start_at < $3 AND end_at > $2
  `, [expertId, rangeStart.toISOString(), rangeEnd.toISOString()]));

  const bookings = rows<any>(await pool.query(`
    SELECT starts_at AS "startsAt", ends_at AS "endsAt"
    FROM expert_consultation_bookings
    WHERE expert_id = $1
      AND starts_at < $3
      AND ends_at > $2
      AND (
        status = 'confirmed'
        OR (status = 'pending_payment' AND hold_expires_at > NOW())
      )
  `, [expertId, rangeStart.toISOString(), rangeEnd.toISOString()]));

  const now = Date.now();
  const earliestAllowed = now + Number(configuration.bookingNoticeHours || 0) * 60 * 60 * 1000;
  const latestAllowed = now + Number(configuration.bookingHorizonDays || 60) * 24 * 60 * 60 * 1000;
  const duration = Number(configuration.durationMinutes);
  const interval = Number(configuration.slotIntervalMinutes || 30);
  const buffer = Number(configuration.bufferMinutes || 0);
  const result: Array<{ startsAt: string; endsAt: string; localDate: string; localTime: string }> = [];

  for (let offset = 0; offset < safeDays; offset += 1) {
    const dateIso = addDays(fromDate, offset);
    const weekday = weekdayForLocalDate(dateIso, timeZone);
    const dayRules = rules.filter((rule) => Number(rule.weekday) === weekday);

    for (const rule of dayRules) {
      const startMinutes = timeStringToMinutes(String(rule.startTime));
      const endMinutes = timeStringToMinutes(String(rule.endTime));
      for (let minute = startMinutes; minute + duration <= endMinutes; minute += interval) {
        const localTime = minutesToTime(minute);
        const slotStart = zonedLocalToUtc(dateIso, localTime, timeZone);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);
        if (slotStart.getTime() < earliestAllowed || slotStart.getTime() > latestAllowed) continue;

        const candidateStart = new Date(slotStart.getTime() - buffer * 60 * 1000);
        const candidateEnd = new Date(slotEnd.getTime() + buffer * 60 * 1000);
        const blocked = blocks.some((block) => overlaps(
          candidateStart,
          candidateEnd,
          new Date(block.startAt),
          new Date(block.endAt),
        ));
        if (blocked) continue;
        const booked = bookings.some((booking) => overlaps(
          candidateStart,
          candidateEnd,
          new Date(booking.startsAt),
          new Date(booking.endsAt),
        ));
        if (booked) continue;

        result.push({
          startsAt: slotStart.toISOString(),
          endsAt: slotEnd.toISOString(),
          localDate: dateIso,
          localTime,
        });
      }
    }
  }

  return { timeZone, slots: result };
}

async function sendBookingConfirmation(bookingId: string) {
  try {
    const detail = rows<any>(await pool.query(`
      SELECT
        b.id,
        b.starts_at AS "startsAt",
        b.ends_at AS "endsAt",
        b.amount_pence AS "amountPence",
        b.currency,
        b.meeting_url AS "meetingUrl",
        u.id AS "userId",
        u.email AS "userEmail",
        u.first_name AS "userFirstName",
        l.email AS "expertEmail",
        l.first_name AS "expertFirstName",
        l.last_name AS "expertLastName",
        p.public_title AS "publicTitle",
        p.timezone AS "expertTimezone",
        s.name AS "serviceName"
      FROM expert_consultation_bookings b
      JOIN users u ON u.id = b.user_id
      JOIN immigration_lawyers l ON l.id = b.expert_id
      JOIN expert_consultation_profiles p ON p.expert_id = b.expert_id
      JOIN expert_consultation_services s ON s.id = b.service_id
      WHERE b.id = $1
      LIMIT 1
    `, [bookingId]))[0];
    if (!detail) return;

    const timeZone = validTimeZone(detail.expertTimezone);
    const when = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(detail.startsAt));
    const expertName = `${detail.expertFirstName} ${detail.expertLastName}`.trim();
    const amount = formatMoney(Number(detail.amountPence), detail.currency);
    const meetingLine = detail.meetingUrl
      ? `<p><strong>Meeting link:</strong> <a href="${escapeHtml(detail.meetingUrl)}">Join consultation</a></p>`
      : `<p>Your meeting details will be added to your booking before the consultation.</p>`;

    if (detail.userEmail) {
      void sendEmail({
        to: detail.userEmail,
        subject: `Consultation confirmed with ${expertName}`,
        emailType: "expert_booking",
        recipientName: detail.userFirstName || undefined,
        userId: detail.userId,
        html: `
          <h2>Your expert consultation is confirmed</h2>
          <p>Hi ${escapeHtml(detail.userFirstName || "there")},</p>
          <p>Your <strong>${escapeHtml(detail.serviceName)}</strong> with <strong>${escapeHtml(expertName)}</strong> is confirmed.</p>
          <p><strong>Date & time:</strong> ${escapeHtml(when)} (${escapeHtml(timeZone)})</p>
          <p><strong>Amount:</strong> ${escapeHtml(amount)}</p>
          ${meetingLine}
          <p>You can view the booking and add it to your calendar from Expert Support in your dashboard.</p>
        `,
      });
    }

    if (detail.expertEmail) {
      void sendEmail({
        to: detail.expertEmail,
        subject: `New consultation booking: ${detail.serviceName}`,
        emailType: "expert_booking",
        recipientName: detail.expertFirstName || undefined,
        html: `
          <h2>New consultation booking</h2>
          <p>A consultation has been confirmed on the Innovator Founder Visa Assistant platform.</p>
          <p><strong>Service:</strong> ${escapeHtml(detail.serviceName)}</p>
          <p><strong>Date & time:</strong> ${escapeHtml(when)} (${escapeHtml(timeZone)})</p>
          <p><strong>Client:</strong> ${escapeHtml(detail.userFirstName || "Platform user")}</p>
          <p>Open the admin booking view to add or update the meeting link.</p>
        `,
      });
    }
  } catch (error) {
    console.error("[Expert Booking] Confirmation email error", error);
  }
}

const bookingSchema = z.object({
  expertId: z.string().min(1).max(100),
  serviceId: z.string().min(1).max(100),
  startsAt: z.string().datetime(),
  customerTimezone: z.string().min(1).max(64).optional(),
  agenda: z.string().trim().max(3000).optional().default(""),
  meetingMode: z.enum(["video", "phone"]).optional().default("video"),
  idempotencyKey: z.string().min(12).max(100),
});

const expertConfigurationSchema = z.object({
  publicTitle: z.string().trim().min(3).max(180),
  publicBio: z.string().trim().max(4000).optional().default(""),
  timezone: z.string().trim().max(64).default(DEFAULT_TIMEZONE),
  consultationEnabled: z.boolean().default(true),
  featured: z.boolean().default(false),
  meetingMode: z.enum(["video", "phone", "either"]).default("video"),
  bookingNoticeHours: z.number().int().min(0).max(720).default(24),
  bookingHorizonDays: z.number().int().min(1).max(365).default(60),
  slotIntervalMinutes: z.number().int().min(15).max(120).default(30),
  bufferMinutes: z.number().int().min(0).max(120).default(15),
  preparationNote: z.string().trim().max(3000).optional().default(""),
  serviceId: z.string().max(100).optional(),
  serviceName: z.string().trim().min(3).max(160),
  serviceDescription: z.string().trim().max(2000).optional().default(""),
  durationMinutes: z.number().int().min(15).max(360),
  pricePence: z.number().int().min(0).max(500000),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

const createExpertSchema = expertConfigurationSchema.extend({
  email: z.string().email().max(255),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  profileImageUrl: z.string().url().max(2000).optional().or(z.literal("")),
  firmName: z.string().trim().max(255).optional().default(""),
  oiscLevel: z.string().trim().max(10).optional().default(""),
  oiscRegistrationNumber: z.string().trim().max(50).optional().default(""),
  sraNumber: z.string().trim().max(50).optional().default(""),
  yearsExperience: z.number().int().min(0).max(80).optional(),
  successRate: z.number().int().min(0).max(100).optional(),
  specializations: z.array(z.string().trim().min(1).max(100)).max(20).default(["innovator_founder"]),
});

function validateRuleTimes(startTime: string, endTime: string) {
  if (timeStringToMinutes(endTime) <= timeStringToMinutes(startTime)) {
    throw new Error("Availability end time must be after the start time.");
  }
}

async function loadAdminExperts() {
  const lawyers = rows<any>(await pool.query(`
    SELECT
      l.id, l.email,
      l.first_name AS "firstName", l.last_name AS "lastName",
      l.profile_image_url AS "profileImageUrl",
      l.oisc_level AS "oiscLevel", l.oisc_registration_number AS "oiscRegistrationNumber",
      l.sra_number AS "sraNumber", l.firm_name AS "firmName",
      l.specializations, l.years_experience AS "yearsExperience",
      l.success_rate AS "successRate", l.is_available AS "isAvailable",
      l.current_review_count AS "currentReviewCount",
      l.max_concurrent_reviews AS "maxConcurrentReviews",
      l.average_rating AS "averageRating", l.status,
      p.public_title AS "publicTitle", p.public_bio AS "publicBio",
      p.timezone, p.consultation_enabled AS "consultationEnabled",
      p.featured, p.meeting_mode AS "meetingMode",
      p.booking_notice_hours AS "bookingNoticeHours",
      p.booking_horizon_days AS "bookingHorizonDays",
      p.slot_interval_minutes AS "slotIntervalMinutes",
      p.buffer_minutes AS "bufferMinutes",
      p.preparation_note AS "preparationNote"
    FROM immigration_lawyers l
    LEFT JOIN expert_consultation_profiles p ON p.expert_id = l.id
    ORDER BY COALESCE(p.featured, false) DESC, l.first_name, l.last_name
  `));
  if (!lawyers.length) return [];
  const ids = lawyers.map((lawyer) => lawyer.id);
  const services = rows<any>(await pool.query(`
    SELECT id, expert_id AS "expertId", name, description,
      duration_minutes AS "durationMinutes", price_pence AS "pricePence",
      currency, active, sort_order AS "sortOrder", preparation_note AS "preparationNote"
    FROM expert_consultation_services
    WHERE expert_id = ANY($1::varchar[])
    ORDER BY sort_order, duration_minutes
  `, [ids]));
  const rules = rows<any>(await pool.query(`
    SELECT id, expert_id AS "expertId", weekday,
      start_time::text AS "startTime", end_time::text AS "endTime", active
    FROM expert_availability_rules
    WHERE expert_id = ANY($1::varchar[])
    ORDER BY weekday, start_time
  `, [ids]));

  return lawyers.map((lawyer) => ({
    ...lawyer,
    specializations: Array.isArray(lawyer.specializations) ? lawyer.specializations : [],
    consultationEnabled: Boolean(lawyer.consultationEnabled),
    services: services.filter((service) => service.expertId === lawyer.id),
    availabilityRules: rules.filter((rule) => rule.expertId === lawyer.id),
  }));
}

async function saveConfiguration(client: any, expertId: string, input: z.infer<typeof expertConfigurationSchema>) {
  validateRuleTimes(input.startTime, input.endTime);
  const timeZone = validTimeZone(input.timezone);
  await client.query(`
    INSERT INTO expert_consultation_profiles (
      expert_id, public_title, public_bio, timezone, consultation_enabled,
      featured, meeting_mode, booking_notice_hours, booking_horizon_days,
      slot_interval_minutes, buffer_minutes, preparation_note, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
    ON CONFLICT (expert_id) DO UPDATE SET
      public_title = EXCLUDED.public_title,
      public_bio = EXCLUDED.public_bio,
      timezone = EXCLUDED.timezone,
      consultation_enabled = EXCLUDED.consultation_enabled,
      featured = EXCLUDED.featured,
      meeting_mode = EXCLUDED.meeting_mode,
      booking_notice_hours = EXCLUDED.booking_notice_hours,
      booking_horizon_days = EXCLUDED.booking_horizon_days,
      slot_interval_minutes = EXCLUDED.slot_interval_minutes,
      buffer_minutes = EXCLUDED.buffer_minutes,
      preparation_note = EXCLUDED.preparation_note,
      updated_at = NOW()
  `, [
    expertId, input.publicTitle, input.publicBio || null, timeZone,
    input.consultationEnabled, input.featured, input.meetingMode,
    input.bookingNoticeHours, input.bookingHorizonDays, input.slotIntervalMinutes,
    input.bufferMinutes, input.preparationNote || null,
  ]);

  let serviceId = input.serviceId;
  if (serviceId) {
    const updated = rows<any>(await client.query(`
      UPDATE expert_consultation_services
      SET name = $3, description = $4, duration_minutes = $5,
          price_pence = $6, active = true, updated_at = NOW()
      WHERE id = $1 AND expert_id = $2
      RETURNING id
    `, [serviceId, expertId, input.serviceName, input.serviceDescription || null, input.durationMinutes, input.pricePence]));
    if (!updated.length) serviceId = undefined;
  }
  if (!serviceId) {
    serviceId = rows<any>(await client.query(`
      INSERT INTO expert_consultation_services (
        expert_id, name, description, duration_minutes, price_pence, currency, active
      ) VALUES ($1,$2,$3,$4,$5,'GBP',true)
      RETURNING id
    `, [expertId, input.serviceName, input.serviceDescription || null, input.durationMinutes, input.pricePence]))[0]?.id;
  }

  await client.query(`DELETE FROM expert_availability_rules WHERE expert_id = $1`, [expertId]);
  for (const weekday of [...new Set(input.weekdays)].sort()) {
    await client.query(`
      INSERT INTO expert_availability_rules (expert_id, weekday, start_time, end_time, active)
      VALUES ($1,$2,$3::time,$4::time,true)
    `, [expertId, weekday, input.startTime, input.endTime]);
  }
  return serviceId;
}

export function registerExpertBookingRoutes(app: Express): void {
  app.get("/api/expert-booking/experts", async (_req, res) => {
    try {
      res.set("Cache-Control", "no-store");
      return res.json(await loadPublicExperts());
    } catch (error) {
      console.error("[Expert Booking] Expert directory error", error);
      return res.status(500).json({ error: "Unable to load expert availability." });
    }
  });

  app.get("/api/expert-booking/experts/:expertId/availability", async (req, res) => {
    try {
      const serviceId = String(req.query.serviceId || "").trim();
      const from = String(req.query.from || new Date().toISOString().slice(0, 10));
      const days = Number(req.query.days || 14);
      if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
        return res.status(400).json({ error: "A valid service and start date are required." });
      }
      const availability = await computeAvailability(req.params.expertId, serviceId, from, days);
      if (!availability) return res.status(404).json({ error: "Expert or service is not available for booking." });
      res.set("Cache-Control", "no-store");
      return res.json(availability);
    } catch (error) {
      console.error("[Expert Booking] Availability error", error);
      return res.status(500).json({ error: "Unable to calculate availability." });
    }
  });

  app.get("/api/expert-booking/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = currentUserId(req);
      if (!userId) return res.status(401).json({ error: "Authentication required" });
      const bookings = rows<any>(await pool.query(`
        SELECT
          b.id, b.starts_at AS "startsAt", b.ends_at AS "endsAt",
          CASE WHEN b.status = 'pending_payment' AND b.hold_expires_at <= NOW() THEN 'expired' ELSE b.status END AS status,
          b.payment_status AS "paymentStatus", b.amount_pence AS "amountPence", b.currency,
          b.customer_timezone AS "customerTimezone", b.agenda,
          b.meeting_url AS "meetingUrl", b.meeting_mode AS "meetingMode",
          b.stripe_checkout_session_id AS "stripeCheckoutSessionId",
          l.id AS "expertId", l.first_name AS "expertFirstName", l.last_name AS "expertLastName",
          p.public_title AS "expertTitle", p.timezone AS "expertTimezone",
          s.id AS "serviceId", s.name AS "serviceName", s.duration_minutes AS "durationMinutes"
        FROM expert_consultation_bookings b
        JOIN immigration_lawyers l ON l.id = b.expert_id
        JOIN expert_consultation_profiles p ON p.expert_id = b.expert_id
        JOIN expert_consultation_services s ON s.id = b.service_id
        WHERE b.user_id = $1
        ORDER BY b.starts_at DESC
      `, [userId]));
      return res.json(bookings);
    } catch (error) {
      console.error("[Expert Booking] My bookings error", error);
      return res.status(500).json({ error: "Unable to load your consultations." });
    }
  });

  app.post("/api/expert-booking/bookings", isAuthenticated, mutationOriginGuard, async (req, res) => {
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Please check the booking details and try again." });
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const input = parsed.data;
    const client = await pool.connect();
    let booking: any = null;

    try {
      await client.query("BEGIN");
      const duplicate = rows<any>(await client.query(`
        SELECT id, status, stripe_checkout_session_id AS "stripeCheckoutSessionId"
        FROM expert_consultation_bookings
        WHERE user_id = $1 AND idempotency_key = $2
        LIMIT 1
      `, [userId, input.idempotencyKey]))[0];
      if (duplicate) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "This booking request has already been submitted.", bookingId: duplicate.id });
      }

      await client.query(`SELECT id FROM immigration_lawyers WHERE id = $1 FOR UPDATE`, [input.expertId]);
      const configuration = rows<any>(await client.query(`
        SELECT
          l.email AS "expertEmail", l.first_name AS "expertFirstName", l.last_name AS "expertLastName",
          l.status AS "lawyerStatus", l.is_available AS "lawyerAvailable",
          p.timezone, p.consultation_enabled AS "consultationEnabled",
          p.booking_notice_hours AS "bookingNoticeHours", p.booking_horizon_days AS "bookingHorizonDays",
          p.slot_interval_minutes AS "slotIntervalMinutes", p.buffer_minutes AS "bufferMinutes",
          p.meeting_mode AS "profileMeetingMode",
          s.id AS "serviceId", s.name AS "serviceName", s.duration_minutes AS "durationMinutes",
          s.price_pence AS "pricePence", s.currency, s.active AS "serviceActive"
        FROM immigration_lawyers l
        JOIN expert_consultation_profiles p ON p.expert_id = l.id
        JOIN expert_consultation_services s ON s.expert_id = l.id
        WHERE l.id = $1 AND s.id = $2
        LIMIT 1
      `, [input.expertId, input.serviceId]))[0];

      if (!configuration || !configuration.consultationEnabled || !configuration.serviceActive || configuration.lawyerStatus !== "active" || !configuration.lawyerAvailable) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "This expert is not currently accepting consultations." });
      }

      if (configuration.profileMeetingMode !== "either" && input.meetingMode !== configuration.profileMeetingMode) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `This expert currently offers ${configuration.profileMeetingMode} consultations only.` });
      }

      const startsAt = new Date(input.startsAt);
      const durationMinutes = Number(configuration.durationMinutes);
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
      const now = Date.now();
      if (!Number.isFinite(startsAt.getTime())) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid consultation start time." });
      }
      if (startsAt.getTime() < now + Number(configuration.bookingNoticeHours || 0) * 60 * 60 * 1000) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "That time is inside the expert's minimum booking-notice window." });
      }
      if (startsAt.getTime() > now + Number(configuration.bookingHorizonDays || 60) * 24 * 60 * 60 * 1000) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "That date is outside the expert's booking window." });
      }

      const expertTimezone = validTimeZone(configuration.timezone);
      const localDate = localDateIso(startsAt, expertTimezone);
      const weekday = weekdayForLocalDate(localDate, expertTimezone);
      const startMinute = localMinutes(startsAt, expertTimezone);
      const rules = rows<any>(await client.query(`
        SELECT start_time::text AS "startTime", end_time::text AS "endTime"
        FROM expert_availability_rules
        WHERE expert_id = $1 AND weekday = $2 AND active = true
      `, [input.expertId, weekday]));
      const interval = Number(configuration.slotIntervalMinutes || 30);
      const validRule = rules.some((rule) => {
        const ruleStart = timeStringToMinutes(String(rule.startTime));
        const ruleEnd = timeStringToMinutes(String(rule.endTime));
        return startMinute >= ruleStart
          && startMinute + durationMinutes <= ruleEnd
          && (startMinute - ruleStart) % interval === 0;
      });
      if (!validRule) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "That time is no longer inside the expert's availability." });
      }

      const bufferMs = Number(configuration.bufferMinutes || 0) * 60 * 1000;
      const conflictStart = new Date(startsAt.getTime() - bufferMs);
      const conflictEnd = new Date(endsAt.getTime() + bufferMs);
      const blocked = rows<any>(await client.query(`
        SELECT 1 FROM expert_availability_blocks
        WHERE expert_id = $1 AND start_at < $3 AND end_at > $2
        LIMIT 1
      `, [input.expertId, conflictStart.toISOString(), conflictEnd.toISOString()])).length > 0;
      if (blocked) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "That time has just become unavailable. Please choose another slot." });
      }

      const conflict = rows<any>(await client.query(`
        SELECT id FROM expert_consultation_bookings
        WHERE expert_id = $1
          AND starts_at < $3
          AND ends_at > $2
          AND (status = 'confirmed' OR (status = 'pending_payment' AND hold_expires_at > NOW()))
        LIMIT 1
      `, [input.expertId, conflictStart.toISOString(), conflictEnd.toISOString()])).length > 0;
      if (conflict) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "That slot was just reserved by another user. Please choose another time." });
      }

      const amountPence = Number(configuration.pricePence);
      const isFree = amountPence === 0;
      const holdExpiresAt = isFree ? null : new Date(Date.now() + 31 * 60 * 1000);
      booking = rows<any>(await client.query(`
        INSERT INTO expert_consultation_bookings (
          user_id, expert_id, service_id, starts_at, ends_at, customer_timezone,
          status, payment_status, amount_pence, currency, hold_expires_at,
          agenda, meeting_mode, idempotency_key, confirmed_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING id, starts_at AS "startsAt", ends_at AS "endsAt", status,
          payment_status AS "paymentStatus", amount_pence AS "amountPence", currency
      `, [
        userId, input.expertId, input.serviceId, startsAt.toISOString(), endsAt.toISOString(),
        validTimeZone(input.customerTimezone), isFree ? "confirmed" : "pending_payment",
        isFree ? "unpaid" : "pending", amountPence, String(configuration.currency || "GBP").toUpperCase(),
        holdExpiresAt?.toISOString() || null, input.agenda || null, input.meetingMode,
        input.idempotencyKey, isFree ? new Date().toISOString() : null,
      ]))[0];
      await client.query("COMMIT");

      if (isFree) {
        void sendBookingConfirmation(booking.id);
        return res.status(201).json({ booking, requiresPayment: false });
      }

      try {
        const user = rows<any>(await pool.query(`SELECT email, first_name AS "firstName" FROM users WHERE id = $1 LIMIT 1`, [userId]))[0];
        const stripe = await getUncachableStripeClient();
        const baseUrl = appBaseUrl(req);
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: user?.email || undefined,
          client_reference_id: booking.id,
          expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
          success_url: `${baseUrl}/expert-booking?booking=${encodeURIComponent(booking.id)}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/expert-booking?booking=${encodeURIComponent(booking.id)}&cancelled=1`,
          metadata: {
            type: "expert_consultation",
            bookingId: booking.id,
            userId,
            expertId: input.expertId,
            serviceId: input.serviceId,
          },
          line_items: [{
            quantity: 1,
            price_data: {
              currency: String(configuration.currency || "GBP").toLowerCase(),
              unit_amount: amountPence,
              product_data: {
                name: `${configuration.serviceName} with ${configuration.expertFirstName} ${configuration.expertLastName}`,
                description: `Expert consultation booked through Innovator Founder Visa Assistant`,
              },
            },
          }],
        });
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET stripe_checkout_session_id = $2, updated_at = NOW()
          WHERE id = $1
        `, [booking.id, session.id]);
        return res.status(201).json({
          booking: { ...booking, stripeCheckoutSessionId: session.id },
          requiresPayment: true,
          checkoutUrl: session.url,
        });
      } catch (stripeError) {
        console.error("[Expert Booking] Stripe checkout creation failed", stripeError);
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET status = 'expired', payment_status = 'failed', hold_expires_at = NULL, updated_at = NOW()
          WHERE id = $1
        `, [booking.id]);
        return res.status(502).json({ error: "The slot was reserved, but payment checkout could not be started. Please try again." });
      }
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Expert Booking] Create booking error", error);
      return res.status(500).json({ error: "Unable to create the consultation booking." });
    } finally {
      client.release();
    }
  });

  app.post("/api/expert-booking/bookings/:bookingId/confirm-payment", isAuthenticated, mutationOriginGuard, async (req, res) => {
    try {
      const userId = currentUserId(req);
      if (!userId) return res.status(401).json({ error: "Authentication required" });
      const sessionId = String(req.body?.sessionId || "").trim();
      if (!sessionId) return res.status(400).json({ error: "Payment session is required." });

      const booking = rows<any>(await pool.query(`
        SELECT id, status, payment_status AS "paymentStatus", amount_pence AS "amountPence",
          stripe_checkout_session_id AS "stripeCheckoutSessionId"
        FROM expert_consultation_bookings
        WHERE id = $1 AND user_id = $2
        LIMIT 1
      `, [req.params.bookingId, userId]))[0];
      if (!booking) return res.status(404).json({ error: "Booking not found." });
      if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
        return res.json({ success: true, bookingId: booking.id, alreadyConfirmed: true });
      }
      if (booking.stripeCheckoutSessionId !== sessionId) {
        return res.status(403).json({ error: "Payment session does not match this booking." });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.type !== "expert_consultation"
          || session.metadata?.bookingId !== booking.id
          || session.metadata?.userId !== userId) {
        return res.status(403).json({ error: "Payment session verification failed." });
      }
      if (session.payment_status !== "paid") {
        return res.status(409).json({ error: "Payment has not been completed yet." });
      }

      const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      await pool.query(`
        UPDATE expert_consultation_bookings
        SET status = 'confirmed', payment_status = 'paid', stripe_payment_intent_id = $2,
            hold_expires_at = NULL, confirmed_at = COALESCE(confirmed_at, NOW()), updated_at = NOW()
        WHERE id = $1 AND user_id = $3
      `, [booking.id, paymentIntent || null, userId]);
      void sendBookingConfirmation(booking.id);
      return res.json({ success: true, bookingId: booking.id });
    } catch (error) {
      console.error("[Expert Booking] Payment confirmation error", error);
      return res.status(500).json({ error: "Unable to verify the consultation payment." });
    }
  });

  app.get("/api/expert-booking/bookings/:bookingId/calendar.ics", isAuthenticated, async (req, res) => {
    try {
      const userId = currentUserId(req);
      if (!userId) return res.status(401).send("Authentication required");
      const booking = rows<any>(await pool.query(`
        SELECT b.id, b.starts_at AS "startsAt", b.ends_at AS "endsAt", b.meeting_url AS "meetingUrl",
          s.name AS "serviceName", l.first_name AS "expertFirstName", l.last_name AS "expertLastName"
        FROM expert_consultation_bookings b
        JOIN expert_consultation_services s ON s.id = b.service_id
        JOIN immigration_lawyers l ON l.id = b.expert_id
        WHERE b.id = $1 AND b.user_id = $2 AND b.status IN ('confirmed','completed')
        LIMIT 1
      `, [req.params.bookingId, userId]))[0];
      if (!booking) return res.status(404).send("Booking not found");
      const stamp = (value: string | Date) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
      const icsEscape = (value: unknown) => String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      const expertName = `${booking.expertFirstName} ${booking.expertLastName}`.trim();
      const description = booking.meetingUrl ? `Meeting: ${booking.meetingUrl}` : "Meeting details are available in Expert Support.";
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Innovator Founder Visa Assistant//Expert Booking//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${booking.id}@innovatorfoundervisaassistant.co.uk`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(booking.startsAt)}`,
        `DTEND:${stamp(booking.endsAt)}`,
        `SUMMARY:${icsEscape(`${booking.serviceName} with ${expertName}`)}`,
        `DESCRIPTION:${icsEscape(description)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="consultation-${booking.id}.ics"`);
      return res.send(ics);
    } catch (error) {
      console.error("[Expert Booking] Calendar export error", error);
      return res.status(500).send("Unable to create calendar event");
    }
  });

  app.get("/api/admin/expert-booking/experts", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      return res.json(await loadAdminExperts());
    } catch (error) {
      console.error("[Expert Booking] Admin experts error", error);
      return res.status(500).json({ error: "Unable to load expert configuration." });
    }
  });

  app.post("/api/admin/expert-booking/experts", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    const parsed = createExpertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Please complete the expert profile, service and availability fields." });
    const input = parsed.data;
    validateRuleTimes(input.startTime, input.endTime);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const duplicate = rows<any>(await client.query(`SELECT id FROM immigration_lawyers WHERE lower(email) = lower($1) LIMIT 1`, [input.email]))[0];
      if (duplicate) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "An expert with this email already exists. Configure the existing team member instead." });
      }
      const expert = rows<any>(await client.query(`
        INSERT INTO immigration_lawyers (
          email, first_name, last_name, profile_image_url, oisc_level,
          oisc_registration_number, sra_number, firm_name, specializations,
          years_experience, success_rate, is_available, status, bio
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,true,'active',$12)
        RETURNING id, email, first_name AS "firstName", last_name AS "lastName"
      `, [
        input.email.toLowerCase(), input.firstName, input.lastName, input.profileImageUrl || null,
        input.oiscLevel || null, input.oiscRegistrationNumber || null, input.sraNumber || null,
        input.firmName || null, JSON.stringify(input.specializations), input.yearsExperience ?? null,
        input.successRate ?? null, input.publicBio || null,
      ]))[0];
      const serviceId = await saveConfiguration(client, expert.id, input);
      await client.query("COMMIT");
      return res.status(201).json({ expert, serviceId });
    } catch (error: any) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Expert Booking] Create expert error", error);
      return res.status(500).json({ error: "Unable to create the expert profile." });
    } finally {
      client.release();
    }
  });

  app.put("/api/admin/expert-booking/experts/:expertId/configuration", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    const parsed = expertConfigurationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Please check the consultation configuration." });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const expert = rows<any>(await client.query(`SELECT id FROM immigration_lawyers WHERE id = $1 FOR UPDATE`, [req.params.expertId]))[0];
      if (!expert) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Expert not found." });
      }
      const serviceId = await saveConfiguration(client, req.params.expertId, parsed.data);
      await client.query("COMMIT");
      return res.json({ success: true, serviceId });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Expert Booking] Configure expert error", error);
      return res.status(500).json({ error: "Unable to save expert consultation settings." });
    } finally {
      client.release();
    }
  });

  app.patch("/api/admin/expert-booking/experts/:expertId/visibility", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    const schema = z.object({ consultationEnabled: z.boolean().optional(), featured: z.boolean().optional() }).refine(
      (value) => value.consultationEnabled !== undefined || value.featured !== undefined,
      "No changes supplied",
    );
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "No valid visibility change supplied." });
    try {
      const existing = rows<any>(await pool.query(`SELECT expert_id FROM expert_consultation_profiles WHERE expert_id = $1`, [req.params.expertId]))[0];
      if (!existing) return res.status(409).json({ error: "Configure this expert before enabling public consultation booking." });
      await pool.query(`
        UPDATE expert_consultation_profiles
        SET consultation_enabled = COALESCE($2, consultation_enabled),
            featured = COALESCE($3, featured), updated_at = NOW()
        WHERE expert_id = $1
      `, [req.params.expertId, parsed.data.consultationEnabled ?? null, parsed.data.featured ?? null]);
      return res.json({ success: true });
    } catch (error) {
      console.error("[Expert Booking] Visibility update error", error);
      return res.status(500).json({ error: "Unable to update expert visibility." });
    }
  });

  app.post("/api/admin/expert-booking/experts/:expertId/blocks", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    const parsed = z.object({
      startAt: z.string().datetime(),
      endAt: z.string().datetime(),
      reason: z.string().trim().max(1000).optional().default(""),
    }).safeParse(req.body);
    if (!parsed.success || new Date(parsed.data?.endAt || 0) <= new Date(parsed.data?.startAt || 0)) {
      return res.status(400).json({ error: "A valid blocked time range is required." });
    }
    try {
      const block = rows<any>(await pool.query(`
        INSERT INTO expert_availability_blocks (expert_id, start_at, end_at, reason)
        VALUES ($1,$2,$3,$4)
        RETURNING id, start_at AS "startAt", end_at AS "endAt", reason
      `, [req.params.expertId, parsed.data.startAt, parsed.data.endAt, parsed.data.reason || null]))[0];
      return res.status(201).json(block);
    } catch (error) {
      console.error("[Expert Booking] Block creation error", error);
      return res.status(500).json({ error: "Unable to block the selected time." });
    }
  });

  app.delete("/api/admin/expert-booking/blocks/:blockId", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    try {
      await pool.query(`DELETE FROM expert_availability_blocks WHERE id = $1`, [req.params.blockId]);
      return res.json({ success: true });
    } catch (error) {
      console.error("[Expert Booking] Block deletion error", error);
      return res.status(500).json({ error: "Unable to remove the availability block." });
    }
  });

  app.get("/api/admin/expert-booking/bookings", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const status = String(req.query.status || "").trim();
      const params: any[] = [];
      let statusClause = "";
      if (status) {
        params.push(status);
        statusClause = `WHERE (CASE WHEN b.status = 'pending_payment' AND b.hold_expires_at <= NOW() THEN 'expired' ELSE b.status END) = $1`;
      }
      const bookings = rows<any>(await pool.query(`
        SELECT
          b.id, b.starts_at AS "startsAt", b.ends_at AS "endsAt",
          CASE WHEN b.status = 'pending_payment' AND b.hold_expires_at <= NOW() THEN 'expired' ELSE b.status END AS status,
          b.payment_status AS "paymentStatus", b.amount_pence AS "amountPence", b.currency,
          b.agenda, b.meeting_url AS "meetingUrl", b.meeting_mode AS "meetingMode", b.admin_notes AS "adminNotes",
          u.email AS "userEmail", u.first_name AS "userFirstName", u.last_name AS "userLastName",
          l.id AS "expertId", l.first_name AS "expertFirstName", l.last_name AS "expertLastName",
          s.name AS "serviceName", s.duration_minutes AS "durationMinutes"
        FROM expert_consultation_bookings b
        JOIN users u ON u.id = b.user_id
        JOIN immigration_lawyers l ON l.id = b.expert_id
        JOIN expert_consultation_services s ON s.id = b.service_id
        ${statusClause}
        ORDER BY b.starts_at DESC
        LIMIT 500
      `, params));
      return res.json(bookings);
    } catch (error) {
      console.error("[Expert Booking] Admin bookings error", error);
      return res.status(500).json({ error: "Unable to load consultation bookings." });
    }
  });

  app.patch("/api/admin/expert-booking/bookings/:bookingId", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    const parsed = z.object({
      status: z.enum(["confirmed", "completed", "cancelled", "no_show"]).optional(),
      meetingUrl: z.string().url().max(2000).nullable().optional(),
      adminNotes: z.string().max(5000).nullable().optional(),
      cancellationReason: z.string().max(2000).nullable().optional(),
    }).safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data || {}).length === 0) {
      return res.status(400).json({ error: "No valid booking changes supplied." });
    }
    try {
      const booking = rows<any>(await pool.query(`
        SELECT id, amount_pence AS "amountPence", payment_status AS "paymentStatus", status
        FROM expert_consultation_bookings WHERE id = $1 LIMIT 1
      `, [req.params.bookingId]))[0];
      if (!booking) return res.status(404).json({ error: "Booking not found." });
      if (parsed.data.status && ["confirmed", "completed"].includes(parsed.data.status)
          && Number(booking.amountPence) > 0 && booking.paymentStatus !== "paid") {
        return res.status(409).json({ error: "A paid consultation cannot be confirmed or completed until payment is verified." });
      }
      await pool.query(`
        UPDATE expert_consultation_bookings
        SET status = COALESCE($2, status),
            meeting_url = CASE WHEN $3::boolean THEN $4 ELSE meeting_url END,
            admin_notes = CASE WHEN $5::boolean THEN $6 ELSE admin_notes END,
            cancellation_reason = CASE WHEN $7::boolean THEN $8 ELSE cancellation_reason END,
            confirmed_at = CASE WHEN $2 = 'confirmed' THEN COALESCE(confirmed_at, NOW()) ELSE confirmed_at END,
            completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
            cancelled_at = CASE WHEN $2 = 'cancelled' THEN NOW() ELSE cancelled_at END,
            hold_expires_at = CASE WHEN $2 IN ('confirmed','completed','cancelled','no_show') THEN NULL ELSE hold_expires_at END,
            updated_at = NOW()
        WHERE id = $1
      `, [
        req.params.bookingId,
        parsed.data.status ?? null,
        parsed.data.meetingUrl !== undefined, parsed.data.meetingUrl ?? null,
        parsed.data.adminNotes !== undefined, parsed.data.adminNotes ?? null,
        parsed.data.cancellationReason !== undefined, parsed.data.cancellationReason ?? null,
      ]);
      if (parsed.data.status === "confirmed" || parsed.data.meetingUrl) {
        void sendBookingConfirmation(req.params.bookingId);
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("[Expert Booking] Admin booking update error", error);
      return res.status(500).json({ error: "Unable to update the consultation booking." });
    }
  });
}
