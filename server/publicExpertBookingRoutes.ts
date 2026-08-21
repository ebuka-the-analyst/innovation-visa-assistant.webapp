import type { Express, NextFunction, Request, Response } from "express";
import { z } from "zod";
import { dbPool } from "./db";
import { getUncachableStripeClient } from "./stripeClient";
import { queueExpertBookingEvent } from "./expertNotificationService";
import {
  createGuestBookingAccessToken,
  verifyGuestBookingAccessToken,
} from "./expertBookingGuestAccess";

const pool = dbPool as any;
const DEFAULT_TIMEZONE = "Europe/London";
const PUBLIC_APP_URL = "https://innovatorfoundervisaassistant.co.uk";

function rows<T = any>(result: any): T[] {
  return Array.isArray(result) ? result : (result?.rows || []);
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

function appBaseUrl(req: Request): string {
  const configured = String(process.env.PUBLIC_APP_URL || process.env.APP_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");
  const host = String(req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();
  if (!host) return PUBLIC_APP_URL;
  const forwardedProto = String(req.get("x-forwarded-proto") || "").split(",")[0].trim();
  return `${forwardedProto === "https" || req.secure ? "https" : "http"}://${host}`;
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
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function localDateIso(date: Date, timeZone: string): string {
  const parts = datePartsInZone(date, timeZone);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function localMinutes(date: Date, timeZone: string): number {
  const parts = datePartsInZone(date, timeZone);
  return parts.hour * 60 + parts.minute;
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

function weekdayForLocalDate(dateIso: string, timeZone: string): number {
  const midday = zonedLocalToUtc(dateIso, "12:00", timeZone);
  const label = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(midday);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[label] ?? 0;
}

function timeStringToMinutes(value: string): number {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function guestOwnsBooking(booking: any, token: string): boolean {
  return Boolean(
    booking
    && !booking.userId
    && booking.customerEmail
    && verifyGuestBookingAccessToken(booking.id, booking.customerEmail, token),
  );
}

const guestBookingSchema = z.object({
  expertId: z.string().min(1).max(100),
  serviceId: z.string().min(1).max(100),
  startsAt: z.string().datetime(),
  customerTimezone: z.string().min(1).max(64).optional(),
  agenda: z.string().trim().max(3000).optional().default(""),
  meetingMode: z.enum(["video", "phone"]).optional().default("video"),
  idempotencyKey: z.string().min(12).max(100),
  customerEmail: z.string().trim().email().max(320),
  customerFirstName: z.string().trim().min(1).max(120),
  customerLastName: z.string().trim().max(120).optional().default(""),
});

async function loadGuestBooking(bookingId: string) {
  return rows<any>(await pool.query(`
    SELECT
      b.id,
      b.user_id AS "userId",
      b.customer_email AS "customerEmail",
      b.customer_first_name AS "customerFirstName",
      b.customer_last_name AS "customerLastName",
      b.starts_at AS "startsAt",
      b.ends_at AS "endsAt",
      CASE WHEN b.status = 'pending_payment' AND b.hold_expires_at <= NOW() THEN 'expired' ELSE b.status END AS status,
      b.payment_status AS "paymentStatus",
      b.amount_pence AS "amountPence",
      b.currency,
      b.customer_timezone AS "customerTimezone",
      b.agenda,
      b.meeting_url AS "meetingUrl",
      b.meeting_mode AS "meetingMode",
      b.stripe_checkout_session_id AS "stripeCheckoutSessionId",
      l.id AS "expertId",
      l.first_name AS "expertFirstName",
      l.last_name AS "expertLastName",
      p.public_title AS "expertTitle",
      p.timezone AS "expertTimezone",
      s.id AS "serviceId",
      s.name AS "serviceName",
      s.duration_minutes AS "durationMinutes"
    FROM expert_consultation_bookings b
    JOIN immigration_lawyers l ON l.id = b.expert_id
    JOIN expert_consultation_profiles p ON p.expert_id = b.expert_id
    JOIN expert_consultation_services s ON s.id = b.service_id
    WHERE b.id = $1
    LIMIT 1
  `, [bookingId]))[0] || null;
}

export function registerPublicExpertBookingRoutes(app: Express): void {
  app.post("/api/expert-booking/guest-bookings", mutationOriginGuard, async (req, res) => {
    const parsed = guestBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Please enter your name, a valid email address and choose a consultation time." });
    }

    const input = parsed.data;
    const email = input.customerEmail.toLowerCase();
    const client = await pool.connect();
    let booking: any = null;

    try {
      await client.query("BEGIN");

      const duplicate = rows<any>(await client.query(`
        SELECT id
        FROM expert_consultation_bookings
        WHERE user_id IS NULL
          AND lower(customer_email) = $1
          AND idempotency_key = $2
        LIMIT 1
      `, [email, input.idempotencyKey]))[0];
      if (duplicate) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "This booking request has already been submitted." });
      }

      await client.query(`SELECT id FROM immigration_lawyers WHERE id = $1 FOR UPDATE`, [input.expertId]);
      const configuration = rows<any>(await client.query(`
        SELECT
          l.first_name AS "expertFirstName", l.last_name AS "expertLastName",
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

      if (!configuration || !configuration.consultationEnabled || !configuration.serviceActive
          || configuration.lawyerStatus !== "active" || !configuration.lawyerAvailable) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "This expert is not currently accepting consultations." });
      }
      if (configuration.profileMeetingMode !== "either" && input.meetingMode !== configuration.profileMeetingMode) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `This expert currently offers ${configuration.profileMeetingMode} consultations only.` });
      }

      const startsAt = new Date(input.startsAt);
      if (!Number.isFinite(startsAt.getTime())) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid consultation start time." });
      }
      const durationMinutes = Number(configuration.durationMinutes);
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
      const now = Date.now();
      if (startsAt.getTime() < now + Number(configuration.bookingNoticeHours || 0) * 3_600_000) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "That time is inside the expert's minimum booking-notice window." });
      }
      if (startsAt.getTime() > now + Number(configuration.bookingHorizonDays || 60) * 86_400_000) {
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

      const bufferMs = Number(configuration.bufferMinutes || 0) * 60_000;
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
        return res.status(409).json({ error: "That slot was just reserved by another customer. Please choose another time." });
      }

      const amountPence = Number(configuration.pricePence);
      const isFree = amountPence === 0;
      const holdExpiresAt = isFree ? null : new Date(Date.now() + 31 * 60_000);
      booking = rows<any>(await client.query(`
        INSERT INTO expert_consultation_bookings (
          user_id, customer_email, customer_first_name, customer_last_name,
          expert_id, service_id, starts_at, ends_at, customer_timezone,
          status, payment_status, amount_pence, currency, hold_expires_at,
          agenda, meeting_mode, idempotency_key, confirmed_at
        ) VALUES (NULL,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING id, starts_at AS "startsAt", ends_at AS "endsAt", status,
          payment_status AS "paymentStatus", amount_pence AS "amountPence", currency
      `, [
        email, input.customerFirstName, input.customerLastName || null,
        input.expertId, input.serviceId, startsAt.toISOString(), endsAt.toISOString(),
        validTimeZone(input.customerTimezone), isFree ? "confirmed" : "pending_payment",
        isFree ? "unpaid" : "pending", amountPence,
        String(configuration.currency || "GBP").toUpperCase(), holdExpiresAt?.toISOString() || null,
        input.agenda || null, input.meetingMode, input.idempotencyKey,
        isFree ? new Date().toISOString() : null,
      ]))[0];

      await client.query("COMMIT");
      const accessToken = createGuestBookingAccessToken(booking.id, email);

      if (isFree) {
        await queueExpertBookingEvent("confirmed", booking.id);
        return res.status(201).json({ booking, requiresPayment: false, guestAccessToken: accessToken });
      }

      try {
        const stripe = await getUncachableStripeClient();
        const baseUrl = appBaseUrl(req);
        const commonParams = new URLSearchParams({ booking: booking.id, access: accessToken });
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: email,
          client_reference_id: booking.id,
          expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
          success_url: `${baseUrl}/expert-booking?${commonParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/expert-booking?${commonParams.toString()}&cancelled=1`,
          metadata: {
            type: "expert_consultation",
            bookingId: booking.id,
            userId: "guest",
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
                description: "Expert consultation booked through Innovator Founder Visa Assistant",
              },
            },
          }],
        });
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET stripe_checkout_session_id = $2, updated_at = NOW()
          WHERE id = $1
        `, [booking.id, session.id]);
        await queueExpertBookingEvent("pending_payment", booking.id);
        return res.status(201).json({
          booking: { ...booking, stripeCheckoutSessionId: session.id },
          requiresPayment: true,
          checkoutUrl: session.url,
          guestAccessToken: accessToken,
        });
      } catch (stripeError) {
        console.error("[Public Expert Booking] Stripe checkout creation failed", stripeError);
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET status = 'expired', payment_status = 'failed', hold_expires_at = NULL, updated_at = NOW()
          WHERE id = $1
        `, [booking.id]);
        return res.status(502).json({ error: "The slot was reserved, but payment checkout could not be started. Please try again." });
      }
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Public Expert Booking] Create booking error", error);
      return res.status(500).json({ error: "Unable to create the consultation booking." });
    } finally {
      client.release();
    }
  });

  app.post("/api/expert-booking/guest-bookings/:bookingId/confirm-payment", mutationOriginGuard, async (req, res) => {
    try {
      const accessToken = String(req.body?.accessToken || "").trim();
      const sessionId = String(req.body?.sessionId || "").trim();
      if (!accessToken || !sessionId) return res.status(400).json({ error: "Payment verification details are required." });

      const booking = await loadGuestBooking(req.params.bookingId);
      if (!guestOwnsBooking(booking, accessToken)) return res.status(403).json({ error: "This booking link is not valid." });
      if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
        return res.json({ success: true, bookingId: booking.id, alreadyConfirmed: true });
      }
      if (booking.stripeCheckoutSessionId !== sessionId) return res.status(403).json({ error: "Payment session does not match this booking." });

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.type !== "expert_consultation"
          || session.metadata?.bookingId !== booking.id
          || session.metadata?.userId !== "guest") {
        return res.status(403).json({ error: "Payment session verification failed." });
      }
      if (session.payment_status !== "paid") return res.status(409).json({ error: "Payment has not been completed yet." });
      if (Number(session.amount_total) !== Number(booking.amountPence)
          || String(session.currency || "").toUpperCase() !== String(booking.currency || "").toUpperCase()) {
        return res.status(409).json({ error: "Payment amount verification failed." });
      }

      const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      const updated = rows<any>(await pool.query(`
        UPDATE expert_consultation_bookings
        SET status = 'confirmed', payment_status = 'paid', stripe_payment_intent_id = $2,
            hold_expires_at = NULL, confirmed_at = COALESCE(confirmed_at, NOW()), updated_at = NOW()
        WHERE id = $1 AND user_id IS NULL
        RETURNING id
      `, [booking.id, paymentIntent || null]))[0];
      if (!updated) return res.status(404).json({ error: "Booking not found." });
      await queueExpertBookingEvent("confirmed", booking.id);
      return res.json({ success: true, bookingId: booking.id });
    } catch (error) {
      console.error("[Public Expert Booking] Payment confirmation error", error);
      return res.status(500).json({ error: "Unable to verify the consultation payment." });
    }
  });

  app.get("/api/expert-booking/guest-bookings/:bookingId", async (req, res) => {
    try {
      const booking = await loadGuestBooking(req.params.bookingId);
      const accessToken = String(req.query.access || "").trim();
      if (!guestOwnsBooking(booking, accessToken)) return res.status(403).json({ error: "This booking link is not valid." });
      const { customerEmail: _email, userId: _userId, stripeCheckoutSessionId: _session, ...safeBooking } = booking;
      return res.json(safeBooking);
    } catch (error) {
      console.error("[Public Expert Booking] Guest booking read error", error);
      return res.status(500).json({ error: "Unable to load the consultation." });
    }
  });

  app.get("/api/expert-booking/guest-bookings/:bookingId/calendar.ics", async (req, res) => {
    try {
      const booking = await loadGuestBooking(req.params.bookingId);
      const accessToken = String(req.query.access || "").trim();
      if (!guestOwnsBooking(booking, accessToken) || !["confirmed", "completed"].includes(booking.status)) {
        return res.status(403).send("This booking link is not valid.");
      }
      const stamp = (value: string | Date) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
      const escapeIcs = (value: unknown) => String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      const expertName = `${booking.expertFirstName} ${booking.expertLastName}`.trim();
      const description = booking.meetingUrl ? `Meeting: ${booking.meetingUrl}` : "Meeting details will be sent by email.";
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Innovator Founder Visa Assistant//Expert Booking//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT", `UID:${booking.id}@innovatorfoundervisaassistant.co.uk`, `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(booking.startsAt)}`, `DTEND:${stamp(booking.endsAt)}`,
        `SUMMARY:${escapeIcs(`${booking.serviceName} with ${expertName}`)}`, `DESCRIPTION:${escapeIcs(description)}`,
        "END:VEVENT", "END:VCALENDAR",
      ].join("\r\n");
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="consultation-${booking.id}.ics"`);
      return res.send(ics);
    } catch (error) {
      console.error("[Public Expert Booking] Guest calendar error", error);
      return res.status(500).send("Unable to create calendar event");
    }
  });
}
