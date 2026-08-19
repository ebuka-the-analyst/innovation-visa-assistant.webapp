import type { Express, Request } from "express";
import { dbPool } from "./db";
import { getUncachableStripeClient } from "./stripeClient";
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

function validTimeZone(value: unknown): string {
  const timezone = String(value || "Europe/London").trim();
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return "Europe/London";
  }
}

async function sendConfirmedBookingEmail(bookingId: string): Promise<void> {
  try {
    const detail = rows<any>(await pool.query(`
      SELECT
        b.id,
        b.starts_at AS "startsAt",
        b.amount_pence AS "amountPence",
        b.currency,
        b.meeting_url AS "meetingUrl",
        u.id AS "userId",
        u.email AS "userEmail",
        u.first_name AS "userFirstName",
        l.email AS "expertEmail",
        l.first_name AS "expertFirstName",
        l.last_name AS "expertLastName",
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

    const timezone = validTimeZone(detail.expertTimezone);
    const when = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(detail.startsAt));
    const expertName = `${detail.expertFirstName} ${detail.expertLastName}`.trim();
    const amount = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: String(detail.currency || "GBP").toUpperCase(),
    }).format(Number(detail.amountPence || 0) / 100);
    const meetingLine = detail.meetingUrl
      ? `<p><strong>Meeting link:</strong> <a href="${escapeHtml(detail.meetingUrl)}">Join consultation</a></p>`
      : "<p>Your meeting details will be added to Expert Support before the appointment.</p>";

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
          <p><strong>Date &amp; time:</strong> ${escapeHtml(when)} (${escapeHtml(timezone)})</p>
          <p><strong>Amount:</strong> ${escapeHtml(amount)}</p>
          ${meetingLine}
          <p>You can manage the appointment from Expert Support in your dashboard.</p>
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
          <p>A paid consultation has been confirmed on the Innovator Founder Visa Assistant platform.</p>
          <p><strong>Service:</strong> ${escapeHtml(detail.serviceName)}</p>
          <p><strong>Date &amp; time:</strong> ${escapeHtml(when)} (${escapeHtml(timezone)})</p>
          <p><strong>Client:</strong> ${escapeHtml(detail.userFirstName || "Platform user")}</p>
          <p>Open Expert Support to add or update the meeting link.</p>
        `,
      });
    }
  } catch (error) {
    console.error("[Expert Booking Webhook] Confirmation email error", error);
  }
}

async function confirmPaidSession(session: any): Promise<void> {
  if (session?.metadata?.type !== "expert_consultation") return;
  const bookingId = String(session.metadata?.bookingId || "").trim();
  const userId = String(session.metadata?.userId || "").trim();
  if (!bookingId || !userId || !session.id) return;

  const client = await pool.connect();
  let shouldNotify = false;
  try {
    await client.query("BEGIN");
    const booking = rows<any>(await client.query(`
      SELECT
        id, user_id AS "userId", status,
        payment_status AS "paymentStatus",
        amount_pence AS "amountPence", currency,
        stripe_checkout_session_id AS "stripeCheckoutSessionId"
      FROM expert_consultation_bookings
      WHERE id = $1
      FOR UPDATE
    `, [bookingId]))[0];

    if (!booking
        || booking.userId !== userId
        || booking.stripeCheckoutSessionId !== session.id) {
      await client.query("ROLLBACK");
      console.warn("[Expert Booking Webhook] Checkout session did not match a booking", {
        bookingId,
        sessionId: session.id,
      });
      return;
    }

    const amountTotal = Number(session.amount_total);
    const currency = String(session.currency || "").toUpperCase();
    if (!Number.isInteger(amountTotal)
        || amountTotal !== Number(booking.amountPence)
        || currency !== String(booking.currency || "").toUpperCase()) {
      await client.query("ROLLBACK");
      console.error("[Expert Booking Webhook] Payment amount mismatch", {
        bookingId,
        expectedAmount: booking.amountPence,
        receivedAmount: session.amount_total,
        expectedCurrency: booking.currency,
        receivedCurrency: session.currency,
      });
      return;
    }

    if (session.payment_status !== "paid") {
      await client.query("ROLLBACK");
      return;
    }

    const paymentIntent = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;
    shouldNotify = !(booking.status === "confirmed" && booking.paymentStatus === "paid");

    await client.query(`
      UPDATE expert_consultation_bookings
      SET status = 'confirmed',
          payment_status = 'paid',
          stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
          hold_expires_at = NULL,
          confirmed_at = COALESCE(confirmed_at, NOW()),
          updated_at = NOW()
      WHERE id = $1
    `, [bookingId, paymentIntent]);
    await client.query("COMMIT");
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    throw error;
  } finally {
    client.release();
  }

  if (shouldNotify) void sendConfirmedBookingEmail(bookingId);
}

async function expireCheckoutSession(session: any): Promise<void> {
  if (session?.metadata?.type !== "expert_consultation") return;
  const bookingId = String(session.metadata?.bookingId || "").trim();
  if (!bookingId || !session.id) return;
  await pool.query(`
    UPDATE expert_consultation_bookings
    SET status = 'expired',
        payment_status = CASE WHEN payment_status = 'paid' THEN payment_status ELSE 'failed' END,
        hold_expires_at = NULL,
        updated_at = NOW()
    WHERE id = $1
      AND stripe_checkout_session_id = $2
      AND status = 'pending_payment'
      AND payment_status <> 'paid'
  `, [bookingId, session.id]);
}

export function registerExpertBookingPaymentWebhook(app: Express): void {
  app.post("/api/expert-booking/stripe-webhook", async (req: Request, res) => {
    const secret = String(
      process.env.STRIPE_EXPERT_BOOKING_WEBHOOK_SECRET
      || process.env.STRIPE_WEBHOOK_SECRET
      || "",
    ).trim();
    if (!secret) {
      console.error("[Expert Booking Webhook] Webhook secret is not configured");
      return res.status(503).json({ error: "Webhook is not configured" });
    }

    const signature = String(req.get("stripe-signature") || "").trim();
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!signature || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ error: "Missing Stripe signature or raw request body" });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

      switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded":
          await confirmPaidSession(event.data.object);
          break;
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
          await expireCheckoutSession(event.data.object);
          break;
        default:
          break;
      }

      return res.json({ received: true });
    } catch (error) {
      console.error("[Expert Booking Webhook] Stripe event handling failed", error);
      return res.status(400).json({ error: "Invalid webhook event" });
    }
  });
}
