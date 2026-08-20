import crypto from "crypto";
import { dbPool } from "./db";
import { sendEmail } from "./email";

const pool = dbPool as any;

type Queryable = { query: (sql: string, params?: any[]) => Promise<any> };
export type ExpertBookingEvent =
  | "pending_payment"
  | "confirmed"
  | "meeting_updated"
  | "cancelled"
  | "completed"
  | "no_show"
  | "payment_failed";

type EventMetadata = {
  cancellationReason?: string | null;
  meetingUrl?: string | null;
  actorUserId?: string | null;
};

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

function formatMoney(pence: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: String(currency || "GBP").toUpperCase(),
  }).format(Number(pence || 0) / 100);
}

function stableFingerprint(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value ?? {})).digest("hex").slice(0, 16);
}

async function loadBookingDetail(bookingId: string, queryable: Queryable = pool) {
  return rows<any>(await queryable.query(`
    SELECT
      b.id,
      b.user_id AS "userId",
      b.starts_at AS "startsAt",
      b.ends_at AS "endsAt",
      b.status,
      b.payment_status AS "paymentStatus",
      b.amount_pence AS "amountPence",
      b.currency,
      b.meeting_url AS "meetingUrl",
      b.meeting_mode AS "meetingMode",
      b.cancellation_reason AS "cancellationReason",
      u.email AS "userEmail",
      u.first_name AS "userFirstName",
      u.last_name AS "userLastName",
      l.id AS "expertId",
      l.email AS "expertEmail",
      l.first_name AS "expertFirstName",
      l.last_name AS "expertLastName",
      p.timezone AS "expertTimezone",
      s.id AS "serviceId",
      s.name AS "serviceName",
      s.duration_minutes AS "durationMinutes"
    FROM expert_consultation_bookings b
    JOIN users u ON u.id = b.user_id
    JOIN immigration_lawyers l ON l.id = b.expert_id
    JOIN expert_consultation_profiles p ON p.expert_id = b.expert_id
    JOIN expert_consultation_services s ON s.id = b.service_id
    WHERE b.id = $1
    LIMIT 1
  `, [bookingId]))[0] || null;
}

async function loadAdmins(queryable: Queryable = pool) {
  return rows<any>(await queryable.query(`
    SELECT id, email, first_name AS "firstName", last_name AS "lastName"
    FROM users
    WHERE is_admin = true AND COALESCE(is_banned, false) = false
  `));
}

async function insertInAppNotification(queryable: Queryable, input: {
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionText?: string | null;
  dedupeKey: string;
}) {
  if (!input.recipientUserId) return;
  await queryable.query(`
    INSERT INTO admin_notifications (
      title, message, type, target_type, target_value, status,
      sent_at, recipient_count, action_url, action_text, source_key, created_at, updated_at
    ) VALUES ($1,$2,$3,'user',$4,'sent',NOW(),1,$5,$6,$7,NOW(),NOW())
    ON CONFLICT (source_key) WHERE source_key IS NOT NULL DO NOTHING
  `, [
    input.title,
    input.message,
    input.type,
    input.recipientUserId,
    input.actionUrl || null,
    input.actionText || null,
    input.dedupeKey,
  ]);
}

async function enqueueEmail(queryable: Queryable, input: {
  bookingId?: string | null;
  eventType: string;
  recipientEmail?: string | null;
  recipientName?: string | null;
  recipientUserId?: string | null;
  subject: string;
  html: string;
  dedupeKey: string;
  emailType?: string;
}) {
  const email = String(input.recipientEmail || "").trim();
  if (!email) return;
  await queryable.query(`
    INSERT INTO expert_email_outbox (
      booking_id, event_type, recipient_email, recipient_name, recipient_user_id,
      subject, html, email_type, dedupe_key
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (dedupe_key) DO NOTHING
  `, [
    input.bookingId || null,
    input.eventType,
    email,
    input.recipientName || null,
    input.recipientUserId || null,
    input.subject,
    input.html,
    input.emailType || "expert_booking",
    input.dedupeKey,
  ]);
}

function eventCopy(event: ExpertBookingEvent, detail: any, metadata: EventMetadata) {
  const expertName = `${detail.expertFirstName || ""} ${detail.expertLastName || ""}`.trim() || "your expert";
  const clientName = `${detail.userFirstName || ""} ${detail.userLastName || ""}`.trim() || "Platform user";
  const timezone = validTimeZone(detail.expertTimezone);
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(detail.startsAt));
  const amount = formatMoney(Number(detail.amountPence || 0), detail.currency);
  const reason = String(metadata.cancellationReason ?? detail.cancellationReason ?? "").trim();
  const meetingUrl = String(metadata.meetingUrl ?? detail.meetingUrl ?? "").trim();
  const common = {
    expertName,
    clientName,
    timezone,
    when,
    amount,
    reason,
    meetingUrl,
    serviceName: String(detail.serviceName || "Expert consultation"),
  };

  switch (event) {
    case "pending_payment":
      return {
        ...common,
        type: "warning",
        userTitle: "Complete payment for your consultation",
        userMessage: `${common.serviceName} with ${expertName} is reserved temporarily. Complete payment to secure ${when}.`,
        userSubject: "Complete payment to secure your expert consultation",
        userHeading: "Your consultation is awaiting payment",
        adminTitle: "Consultation awaiting payment",
        adminMessage: `${clientName} started a ${common.serviceName} booking with ${expertName} for ${when} (${amount}).`,
      };
    case "meeting_updated":
      return {
        ...common,
        type: "info",
        userTitle: meetingUrl ? "Meeting link is ready" : "Meeting details updated",
        userMessage: meetingUrl ? `The meeting link for your ${common.serviceName} on ${when} is now available.` : `The meeting details for your ${common.serviceName} on ${when} were updated.`,
        userSubject: "Meeting details updated for your expert consultation",
        userHeading: "Your consultation meeting details were updated",
        adminTitle: "Meeting details updated",
        adminMessage: `${common.serviceName} for ${clientName} with ${expertName} now has updated meeting details.`,
      };
    case "cancelled":
      return {
        ...common,
        type: "urgent",
        userTitle: "Consultation cancelled",
        userMessage: `Your ${common.serviceName} with ${expertName} scheduled for ${when} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
        userSubject: "Your expert consultation has been cancelled",
        userHeading: "Your consultation has been cancelled",
        adminTitle: "Consultation cancelled",
        adminMessage: `${common.serviceName} for ${clientName} with ${expertName} was cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      };
    case "completed":
      return {
        ...common,
        type: "success",
        userTitle: "Consultation completed",
        userMessage: `Your ${common.serviceName} with ${expertName} has been marked complete. Your booking remains available in Expert Support for your records.`,
        userSubject: "Your expert consultation is complete",
        userHeading: "Your consultation is complete",
        adminTitle: "Consultation completed",
        adminMessage: `${common.serviceName} for ${clientName} with ${expertName} was marked complete.`,
      };
    case "no_show":
      return {
        ...common,
        type: "warning",
        userTitle: "Consultation marked as no-show",
        userMessage: `Your ${common.serviceName} with ${expertName} scheduled for ${when} was marked as a no-show. Contact support if you believe this is incorrect.`,
        userSubject: "Update about your expert consultation",
        userHeading: "Your consultation was marked as a no-show",
        adminTitle: "Consultation marked no-show",
        adminMessage: `${common.serviceName} for ${clientName} with ${expertName} was marked as a no-show.`,
      };
    case "payment_failed":
      return {
        ...common,
        type: "urgent",
        userTitle: "Consultation payment was not completed",
        userMessage: `Payment for ${common.serviceName} with ${expertName} was not completed, so the reserved slot is no longer secured.`,
        userSubject: "Payment was not completed for your expert consultation",
        userHeading: "Your consultation payment was not completed",
        adminTitle: "Consultation payment failed or expired",
        adminMessage: `${clientName}'s payment for ${common.serviceName} with ${expertName} was not completed.`,
      };
    case "confirmed":
    default:
      return {
        ...common,
        type: "success",
        userTitle: "Consultation confirmed",
        userMessage: `Your ${common.serviceName} with ${expertName} is confirmed for ${when}.${meetingUrl ? " Meeting details are available now." : " Meeting details will be added before the appointment."}`,
        userSubject: `Consultation confirmed with ${expertName}`,
        userHeading: "Your expert consultation is confirmed",
        adminTitle: "Consultation confirmed",
        adminMessage: `${clientName} is confirmed for ${common.serviceName} with ${expertName} on ${when} (${amount}).`,
      };
  }
}

export async function queueExpertBookingEvent(
  event: ExpertBookingEvent,
  bookingId: string,
  metadata: EventMetadata = {},
  queryable: Queryable = pool,
) {
  const detail = await loadBookingDetail(bookingId, queryable);
  if (!detail) return false;
  const copy = eventCopy(event, detail, metadata);
  const fingerprint = stableFingerprint(
    event === "meeting_updated" ? { meetingUrl: copy.meetingUrl }
      : event === "cancelled" ? { reason: copy.reason }
        : {},
  );
  const eventKey = `${event}:${bookingId}:${fingerprint}`;

  await insertInAppNotification(queryable, {
    recipientUserId: detail.userId,
    type: copy.type,
    title: copy.userTitle,
    message: copy.userMessage,
    actionUrl: "/expert-booking?tab=mine",
    actionText: "View consultation",
    dedupeKey: `expert:${eventKey}:user:${detail.userId}`,
  });

  const meetingLine = copy.meetingUrl
    ? `<p><strong>Meeting link:</strong> <a href="${escapeHtml(copy.meetingUrl)}">Join consultation</a></p>`
    : "";
  const reasonLine = copy.reason ? `<p><strong>Reason:</strong> ${escapeHtml(copy.reason)}</p>` : "";

  await enqueueEmail(queryable, {
    bookingId,
    eventType: event,
    recipientEmail: detail.userEmail,
    recipientName: detail.userFirstName,
    recipientUserId: detail.userId,
    subject: copy.userSubject,
    dedupeKey: `${eventKey}:email:user:${String(detail.userEmail || "").toLowerCase()}`,
    html: `
      <h2>${escapeHtml(copy.userHeading)}</h2>
      <p>Hi ${escapeHtml(detail.userFirstName || "there")},</p>
      <p>${escapeHtml(copy.userMessage)}</p>
      <p><strong>Service:</strong> ${escapeHtml(copy.serviceName)}</p>
      <p><strong>Date &amp; time:</strong> ${escapeHtml(copy.when)} (${escapeHtml(copy.timezone)})</p>
      ${reasonLine}
      ${meetingLine}
      <p>Open Expert Support in your dashboard to view the latest booking details.</p>
    `,
  });

  if (event !== "pending_payment" && detail.expertEmail) {
    const expertSubject = event === "cancelled"
      ? `Consultation cancelled: ${copy.serviceName}`
      : event === "meeting_updated"
        ? `Meeting details updated: ${copy.serviceName}`
        : event === "completed"
          ? `Consultation completed: ${copy.serviceName}`
          : event === "no_show"
            ? `Consultation marked no-show: ${copy.serviceName}`
            : event === "payment_failed"
              ? `Consultation payment not completed: ${copy.serviceName}`
              : `New consultation booking: ${copy.serviceName}`;
    await enqueueEmail(queryable, {
      bookingId,
      eventType: event,
      recipientEmail: detail.expertEmail,
      recipientName: detail.expertFirstName,
      subject: expertSubject,
      dedupeKey: `${eventKey}:email:expert:${String(detail.expertEmail).toLowerCase()}`,
      html: `
        <h2>Expert Support booking update</h2>
        <p><strong>Service:</strong> ${escapeHtml(copy.serviceName)}</p>
        <p><strong>Client:</strong> ${escapeHtml(copy.clientName)}</p>
        <p><strong>Date &amp; time:</strong> ${escapeHtml(copy.when)} (${escapeHtml(copy.timezone)})</p>
        <p><strong>Status:</strong> ${escapeHtml(event.replace(/_/g, " "))}</p>
        ${reasonLine}
        ${meetingLine}
        <p>Open Expert Support to review the booking.</p>
      `,
    });
  }

  const admins = await loadAdmins(queryable);
  for (const admin of admins) {
    await insertInAppNotification(queryable, {
      recipientUserId: admin.id,
      type: copy.type,
      title: copy.adminTitle,
      message: copy.adminMessage,
      actionUrl: "/admin/expert-network#consultation-operations",
      actionText: "Open booking operations",
      dedupeKey: `expert:${eventKey}:admin:${admin.id}`,
    });
    if (admin.email) {
      await enqueueEmail(queryable, {
        bookingId,
        eventType: event,
        recipientEmail: admin.email,
        recipientName: admin.firstName,
        recipientUserId: admin.id,
        subject: `[Expert Support] ${copy.adminTitle}`,
        dedupeKey: `${eventKey}:email:admin:${String(admin.email).toLowerCase()}`,
        html: `
          <h2>${escapeHtml(copy.adminTitle)}</h2>
          <p>${escapeHtml(copy.adminMessage)}</p>
          <p><strong>Booking:</strong> ${escapeHtml(bookingId)}</p>
          <p>Open Admin Console → Lawyer Review Center → Manage Network to review the latest booking state.</p>
        `,
      });
    }
  }

  kickExpertNotificationWorker();
  return true;
}

export async function queueExpertProfileEmail(input: {
  expertEmail?: string | null;
  expertName?: string | null;
  expertId: string;
  eventType: string;
  subject: string;
  message: string;
  dedupeRevision?: unknown;
}, queryable: Queryable = pool) {
  if (!input.expertEmail) return;
  const eventKey = `${input.eventType}:${input.expertId}:${stableFingerprint(input.dedupeRevision ?? input.message)}`;
  await enqueueEmail(queryable, {
    eventType: input.eventType,
    recipientEmail: input.expertEmail,
    recipientName: input.expertName,
    subject: input.subject,
    dedupeKey: `${eventKey}:email:expert:${input.expertEmail.toLowerCase()}`,
    emailType: "expert_network",
    html: `<h2>${escapeHtml(input.subject)}</h2><p>${escapeHtml(input.message)}</p><p>Contact the platform team if you need help with your Expert Support profile.</p>`,
  });
  kickExpertNotificationWorker();
}

export async function queueAdminExpertNetworkAlert(input: {
  eventType: string;
  title: string;
  message: string;
  actionUrl?: string;
  dedupeRevision?: unknown;
}, queryable: Queryable = pool) {
  const admins = await loadAdmins(queryable);
  const eventKey = `${input.eventType}:${stableFingerprint(input.dedupeRevision ?? input.message)}`;
  for (const admin of admins) {
    await insertInAppNotification(queryable, {
      recipientUserId: admin.id,
      type: "info",
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl || "/admin/expert-network",
      actionText: "Open Expert Network",
      dedupeKey: `expert:${eventKey}:admin:${admin.id}`,
    });
    if (admin.email) {
      await enqueueEmail(queryable, {
        eventType: input.eventType,
        recipientEmail: admin.email,
        recipientName: admin.firstName,
        recipientUserId: admin.id,
        subject: `[Expert Network] ${input.title}`,
        dedupeKey: `${eventKey}:email:admin:${String(admin.email).toLowerCase()}`,
        emailType: "expert_network",
        html: `<h2>${escapeHtml(input.title)}</h2><p>${escapeHtml(input.message)}</p><p>Open Admin Console → Lawyer Review Center → Manage Network to review it.</p>`,
      });
    }
  }
  kickExpertNotificationWorker();
}

let processing = false;
let workerTimer: NodeJS.Timeout | null = null;

function retryDelaySeconds(attempts: number) {
  return Math.min(6 * 60 * 60, Math.max(30, 30 * Math.pow(2, Math.min(attempts, 9))));
}

export async function processExpertNotificationOutbox() {
  if (processing) return;
  processing = true;
  try {
    await pool.query(`
      UPDATE expert_email_outbox
      SET status = 'pending', updated_at = NOW()
      WHERE status = 'sending' AND updated_at < NOW() - INTERVAL '5 minutes'
    `);

    const jobs = rows<any>(await pool.query(`
      UPDATE expert_email_outbox
      SET status = 'sending', updated_at = NOW()
      WHERE id IN (
        SELECT id
        FROM expert_email_outbox
        WHERE status IN ('pending','failed')
          AND attempts < 10
          AND next_attempt_at <= NOW()
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 20
      )
      RETURNING id, recipient_email AS "recipientEmail", recipient_name AS "recipientName",
        recipient_user_id AS "recipientUserId", subject, html, email_type AS "emailType", attempts
    `));

    for (const job of jobs) {
      try {
        const result: any = await sendEmail({
          to: job.recipientEmail,
          recipientName: job.recipientName || undefined,
          userId: job.recipientUserId || undefined,
          subject: job.subject,
          html: job.html,
          emailType: job.emailType || "expert_booking",
        });
        if (!result?.success) throw new Error(result?.error || "Email provider reported a failure");
        await pool.query(`
          UPDATE expert_email_outbox
          SET status = 'sent', attempts = attempts + 1, sent_at = NOW(), last_error = NULL, updated_at = NOW()
          WHERE id = $1
        `, [job.id]);
      } catch (error) {
        const nextAttempt = Number(job.attempts || 0) + 1;
        const delay = retryDelaySeconds(nextAttempt);
        await pool.query(`
          UPDATE expert_email_outbox
          SET status = 'failed', attempts = attempts + 1,
              next_attempt_at = NOW() + ($2::int * INTERVAL '1 second'),
              last_error = $3, updated_at = NOW()
          WHERE id = $1
        `, [job.id, delay, error instanceof Error ? error.message.slice(0, 2000) : "Unknown email delivery error"]);
      }
    }
  } catch (error) {
    console.error("[Expert Notifications] Outbox processing failed", error);
  } finally {
    processing = false;
  }
}

export function kickExpertNotificationWorker() {
  setTimeout(() => void processExpertNotificationOutbox(), 25);
}

export function startExpertNotificationWorker() {
  if (workerTimer) return;
  kickExpertNotificationWorker();
  workerTimer = setInterval(() => void processExpertNotificationOutbox(), 30_000);
  workerTimer.unref?.();
}
