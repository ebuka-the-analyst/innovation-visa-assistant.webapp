import type { Express, NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { dbPool } from "./db";
import { isAuthenticated, requireAdmin } from "./auth";
import { queueAdminExpertNetworkAlert, queueExpertBookingEvent } from "./expertNotificationService";

const pool = dbPool as any;

type Provider = "google_meet" | "microsoft_teams";
type Queryable = { query: (sql: string, params?: any[]) => Promise<any> };

type BookingDetail = {
  id: string;
  status: string;
  meetingMode: string;
  meetingUrl?: string | null;
  meetingProvider?: string | null;
  providerEventId?: string | null;
  providerEventUrl?: string | null;
  providerSyncStatus?: string | null;
  startsAt: string | Date;
  endsAt: string | Date;
  userEmail?: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
  expertEmail?: string | null;
  expertFirstName?: string | null;
  expertLastName?: string | null;
  serviceName: string;
};

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
      return res.status(403).json({ error: "Cross-origin meeting mutation blocked." });
    }
    return next();
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
}

function uniqueEmails(...values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean))];
}

function providerLabel(provider: Provider) {
  return provider === "google_meet" ? "Google Meet" : "Microsoft Teams";
}

function googleConfig() {
  return {
    clientId: String(process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "").trim(),
    clientSecret: String(process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "").trim(),
    refreshToken: String(process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || "").trim(),
    calendarId: String(process.env.GOOGLE_CALENDAR_ID || "primary").trim() || "primary",
  };
}

function teamsConfig() {
  return {
    tenantId: String(process.env.MICROSOFT_TEAMS_TENANT_ID || "").trim(),
    clientId: String(process.env.MICROSOFT_TEAMS_CLIENT_ID || "").trim(),
    clientSecret: String(process.env.MICROSOFT_TEAMS_CLIENT_SECRET || "").trim(),
    organizer: String(process.env.MICROSOFT_TEAMS_ORGANIZER || "").trim(),
  };
}

function googleConfigured() {
  const config = googleConfig();
  return Boolean(config.clientId && config.clientSecret && config.refreshToken && config.calendarId);
}

function teamsConfigured() {
  const config = teamsConfig();
  return Boolean(config.tenantId && config.clientId && config.clientSecret && config.organizer);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function responseJson(response: globalThis.Response) {
  return response.json().catch(() => ({} as any));
}

let googleTokenCache: { token: string; expiresAt: number } | null = null;
let microsoftTokenCache: { token: string; expiresAt: number } | null = null;

async function googleAccessToken() {
  if (googleTokenCache && googleTokenCache.expiresAt > Date.now() + 60_000) return googleTokenCache.token;
  const config = googleConfig();
  if (!googleConfigured()) throw new Error("Google Meet is not configured.");
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload: any = await responseJson(response);
  if (!response.ok || !payload.access_token) {
    throw new Error(`Google Calendar authentication failed (${response.status}).`);
  }
  googleTokenCache = {
    token: String(payload.access_token),
    expiresAt: Date.now() + Math.max(60, Number(payload.expires_in || 3600)) * 1000,
  };
  return googleTokenCache.token;
}

async function microsoftAccessToken() {
  if (microsoftTokenCache && microsoftTokenCache.expiresAt > Date.now() + 60_000) return microsoftTokenCache.token;
  const config = teamsConfig();
  if (!teamsConfigured()) throw new Error("Microsoft Teams is not configured.");
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const response = await fetchWithTimeout(
    `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
  );
  const payload: any = await responseJson(response);
  if (!response.ok || !payload.access_token) {
    throw new Error(`Microsoft Graph authentication failed (${response.status}).`);
  }
  microsoftTokenCache = {
    token: String(payload.access_token),
    expiresAt: Date.now() + Math.max(60, Number(payload.expires_in || 3600)) * 1000,
  };
  return microsoftTokenCache.token;
}

function googleEventId(bookingId: string) {
  const digest = crypto.createHash("sha256").update(`ifva-google-meet:${bookingId}`).digest();
  const alphabet = "0123456789abcdefghijklmnopqrstuv";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of digest) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output.slice(0, 40);
}

function stableUuid(value: string) {
  const hex = crypto.createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  const variant = parseInt(hex[16], 16);
  hex[16] = ((variant & 0x3) | 0x8).toString(16);
  const joined = hex.join("");
  return `${joined.slice(0, 8)}-${joined.slice(8, 12)}-${joined.slice(12, 16)}-${joined.slice(16, 20)}-${joined.slice(20)}`;
}

function googleJoinUrl(event: any): string | null {
  if (event?.hangoutLink) return String(event.hangoutLink);
  const video = Array.isArray(event?.conferenceData?.entryPoints)
    ? event.conferenceData.entryPoints.find((entry: any) => entry?.entryPointType === "video" && entry?.uri)
    : null;
  return video?.uri ? String(video.uri) : null;
}

function teamsJoinUrl(event: any): string | null {
  return event?.onlineMeeting?.joinUrl ? String(event.onlineMeeting.joinUrl) : null;
}

async function loadBooking(bookingId: string, queryable: Queryable = pool): Promise<BookingDetail | null> {
  return rows<BookingDetail>(await queryable.query(`
    SELECT
      b.id, b.status, b.starts_at AS "startsAt", b.ends_at AS "endsAt",
      b.meeting_mode AS "meetingMode", b.meeting_url AS "meetingUrl",
      b.meeting_provider AS "meetingProvider", b.provider_event_id AS "providerEventId",
      b.provider_event_url AS "providerEventUrl", b.provider_sync_status AS "providerSyncStatus",
      u.email AS "userEmail", u.first_name AS "userFirstName", u.last_name AS "userLastName",
      l.email AS "expertEmail", l.first_name AS "expertFirstName", l.last_name AS "expertLastName",
      s.name AS "serviceName"
    FROM expert_consultation_bookings b
    JOIN users u ON u.id = b.user_id
    JOIN immigration_lawyers l ON l.id = b.expert_id
    JOIN expert_consultation_services s ON s.id = b.service_id
    WHERE b.id = $1
    LIMIT 1
  `, [bookingId]))[0] || null;
}

function eventDescription(booking: BookingDetail) {
  const client = `${booking.userFirstName || ""} ${booking.userLastName || ""}`.trim() || booking.userEmail || "Client";
  const expert = `${booking.expertFirstName || ""} ${booking.expertLastName || ""}`.trim() || booking.expertEmail || "Expert";
  return `Expert Support consultation booked through Innovator Founder Visa Assistant.\nClient: ${client}\nExpert: ${expert}\nBooking reference: ${booking.id}`;
}

async function getGoogleEvent(eventId: string) {
  const config = googleConfig();
  const token = await googleAccessToken();
  const response = await fetchWithTimeout(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(eventId)}?conferenceDataVersion=1`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (response.status === 404) return null;
  const payload: any = await responseJson(response);
  if (!response.ok) throw new Error(`Google Calendar event lookup failed (${response.status}).`);
  return payload;
}

async function createGoogleMeeting(booking: BookingDetail) {
  const config = googleConfig();
  const token = await googleAccessToken();
  const eventId = googleEventId(booking.id);
  const attendees = uniqueEmails(booking.userEmail, booking.expertEmail).map((email) => ({ email }));
  const body = {
    id: eventId,
    summary: `Expert Support: ${booking.serviceName}`,
    description: eventDescription(booking),
    start: { dateTime: new Date(booking.startsAt).toISOString() },
    end: { dateTime: new Date(booking.endsAt).toISOString() },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: `ifva-${crypto.createHash("sha256").update(booking.id).digest("hex").slice(0, 24)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    extendedProperties: { private: { ifvaBookingId: booking.id } },
  };
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
  let event: any;
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 409) {
    event = await getGoogleEvent(eventId);
  } else {
    event = await responseJson(response);
    if (!response.ok) throw new Error(`Google Calendar could not create the meeting (${response.status}).`);
  }
  if (!event) throw new Error("Google Calendar event could not be recovered after creation.");
  for (let attempt = 0; attempt < 8 && !googleJoinUrl(event); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    event = await getGoogleEvent(eventId) || event;
  }
  return {
    eventId,
    eventUrl: event?.htmlLink ? String(event.htmlLink) : null,
    joinUrl: googleJoinUrl(event),
    metadata: { calendarId: config.calendarId },
  };
}

async function getTeamsEvent(eventId: string) {
  const config = teamsConfig();
  const token = await microsoftAccessToken();
  const response = await fetchWithTimeout(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.organizer)}/events/${encodeURIComponent(eventId)}?$select=id,webLink,isOnlineMeeting,onlineMeeting`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (response.status === 404) return null;
  const payload: any = await responseJson(response);
  if (!response.ok) throw new Error(`Microsoft Graph event lookup failed (${response.status}).`);
  return payload;
}

async function createTeamsMeeting(booking: BookingDetail) {
  const config = teamsConfig();
  const token = await microsoftAccessToken();
  const attendees = uniqueEmails(booking.userEmail, booking.expertEmail).map((address) => ({
    emailAddress: { address },
    type: "required",
  }));
  const toGraphUtc = (value: string | Date) => new Date(value).toISOString().replace(/Z$/, "");
  const body = {
    subject: `Expert Support: ${booking.serviceName}`,
    body: { contentType: "HTML", content: eventDescription(booking).replace(/\n/g, "<br>") },
    start: { dateTime: toGraphUtc(booking.startsAt), timeZone: "UTC" },
    end: { dateTime: toGraphUtc(booking.endsAt), timeZone: "UTC" },
    attendees,
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
    transactionId: stableUuid(`ifva-teams:${booking.id}`),
  };
  const response = await fetchWithTimeout(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.organizer)}/events`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  let event: any = await responseJson(response);
  if (!response.ok) throw new Error(`Microsoft Graph could not create the Teams meeting (${response.status}).`);
  for (let attempt = 0; attempt < 8 && !teamsJoinUrl(event); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    event = await getTeamsEvent(String(event.id)) || event;
  }
  return {
    eventId: String(event.id),
    eventUrl: event?.webLink ? String(event.webLink) : null,
    joinUrl: teamsJoinUrl(event),
    metadata: { organizer: config.organizer },
  };
}

async function cancelProviderEvent(provider: Provider, eventId: string) {
  if (provider === "google_meet") {
    const config = googleConfig();
    const token = await googleAccessToken();
    const response = await fetchWithTimeout(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (![204, 404, 410].includes(response.status)) throw new Error(`Google Calendar cancellation failed (${response.status}).`);
    return;
  }
  const config = teamsConfig();
  const token = await microsoftAccessToken();
  const response = await fetchWithTimeout(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.organizer)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (![204, 404, 410].includes(response.status)) throw new Error(`Microsoft Teams calendar cancellation failed (${response.status}).`);
}

async function refreshProviderEvent(provider: Provider, eventId: string) {
  const event = provider === "google_meet" ? await getGoogleEvent(eventId) : await getTeamsEvent(eventId);
  if (!event) return { missing: true, joinUrl: null, eventUrl: null };
  return {
    missing: false,
    joinUrl: provider === "google_meet" ? googleJoinUrl(event) : teamsJoinUrl(event),
    eventUrl: provider === "google_meet" ? (event?.htmlLink || null) : (event?.webLink || null),
  };
}

async function setMeetingFailure(bookingId: string, message: string) {
  await pool.query(`
    UPDATE expert_consultation_bookings
    SET provider_sync_status = 'failed', provider_sync_attempts = provider_sync_attempts + 1,
        provider_last_error = $2, provider_next_attempt_at = NOW() + INTERVAL '2 minutes',
        provider_updated_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `, [bookingId, message.slice(0, 2000)]);
}

async function replaceExistingProviderMeeting(booking: BookingDetail) {
  if (!booking.providerEventId || !["google_meet", "microsoft_teams"].includes(String(booking.meetingProvider || ""))) return;
  await cancelProviderEvent(booking.meetingProvider as Provider, booking.providerEventId);
  await pool.query(`
    UPDATE expert_consultation_bookings
    SET provider_sync_status = 'cancelled', provider_updated_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `, [booking.id]);
}

async function createProviderMeeting(bookingId: string, provider: Provider) {
  let booking = await loadBooking(bookingId);
  if (!booking) throw Object.assign(new Error("Booking not found."), { statusCode: 404 });
  if (booking.status !== "confirmed") throw Object.assign(new Error("Automatic meeting links can only be created for confirmed consultations."), { statusCode: 409 });
  if (booking.meetingMode === "phone") throw Object.assign(new Error("This booking is configured as a phone consultation."), { statusCode: 409 });

  if (booking.meetingProvider === provider && booking.providerEventId && booking.meetingUrl && booking.providerSyncStatus === "active") {
    return { provider, meetingUrl: booking.meetingUrl, providerEventUrl: booking.providerEventUrl, pending: false, existing: true };
  }
  if (provider === "google_meet" && !googleConfigured()) throw Object.assign(new Error("Google Meet is not configured for this platform yet."), { statusCode: 409 });
  if (provider === "microsoft_teams" && !teamsConfigured()) throw Object.assign(new Error("Microsoft Teams is not configured for this platform yet."), { statusCode: 409 });

  if (booking.providerEventId && booking.meetingProvider && booking.meetingProvider !== provider) {
    await replaceExistingProviderMeeting(booking);
    booking = (await loadBooking(bookingId)) || booking;
  }

  const claim = rows<any>(await pool.query(`
    UPDATE expert_consultation_bookings
    SET meeting_provider = $2, provider_sync_status = 'creating', provider_last_error = NULL,
        provider_sync_attempts = 0, provider_next_attempt_at = NOW(), provider_updated_at = NOW(), updated_at = NOW()
    WHERE id = $1
      AND status = 'confirmed'
      AND (provider_sync_status IS DISTINCT FROM 'creating' OR provider_updated_at IS NULL OR provider_updated_at < NOW() - INTERVAL '2 minutes')
    RETURNING id
  `, [bookingId, provider]));
  if (!claim.length) {
    const latest = await loadBooking(bookingId);
    if (latest?.meetingProvider === provider && latest.meetingUrl && latest.providerSyncStatus === "active") {
      return { provider, meetingUrl: latest.meetingUrl, providerEventUrl: latest.providerEventUrl, pending: false, existing: true };
    }
    throw Object.assign(new Error("A meeting link is already being created. Refresh in a moment."), { statusCode: 409 });
  }

  try {
    const created = provider === "google_meet" ? await createGoogleMeeting(booking) : await createTeamsMeeting(booking);
    const syncStatus = created.joinUrl ? "active" : "creating";
    await pool.query(`
      UPDATE expert_consultation_bookings
      SET meeting_provider = $2, provider_event_id = $3, provider_event_url = $4,
          meeting_url = COALESCE($5, meeting_url), provider_sync_status = $6,
          provider_metadata = $7::jsonb, provider_last_error = NULL,
          provider_next_attempt_at = CASE WHEN $6 = 'creating' THEN NOW() + INTERVAL '20 seconds' ELSE NOW() END,
          provider_updated_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [bookingId, provider, created.eventId, created.eventUrl, created.joinUrl, syncStatus, JSON.stringify(created.metadata || {})]);
    if (created.joinUrl) {
      await queueExpertBookingEvent("meeting_updated", bookingId, { meetingUrl: created.joinUrl });
    }
    return { provider, meetingUrl: created.joinUrl, providerEventUrl: created.eventUrl, pending: !created.joinUrl, existing: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meeting provider request failed.";
    await setMeetingFailure(bookingId, message);
    throw error;
  }
}

async function setCustomMeeting(bookingId: string, meetingUrl: string) {
  const parsed = new URL(meetingUrl);
  if (parsed.protocol !== "https:") throw Object.assign(new Error("Meeting links must use HTTPS."), { statusCode: 400 });
  const booking = await loadBooking(bookingId);
  if (!booking) throw Object.assign(new Error("Booking not found."), { statusCode: 404 });
  if (booking.status !== "confirmed") throw Object.assign(new Error("Meeting details can only be changed for confirmed consultations."), { statusCode: 409 });
  if (booking.providerEventId && ["google_meet", "microsoft_teams"].includes(String(booking.meetingProvider || ""))) {
    await replaceExistingProviderMeeting(booking);
  }
  await pool.query(`
    UPDATE expert_consultation_bookings
    SET meeting_url = $2, meeting_provider = 'custom', provider_event_id = NULL,
        provider_event_url = NULL, provider_sync_status = 'active', provider_sync_attempts = 0,
        provider_last_error = NULL, provider_metadata = '{}'::jsonb, provider_updated_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `, [bookingId, meetingUrl]);
  await queueExpertBookingEvent("meeting_updated", bookingId, { meetingUrl });
  return { provider: "custom", meetingUrl, pending: false };
}

let providerHealthCache: { expiresAt: number; value: any } | null = null;

async function providerHealth() {
  if (providerHealthCache && providerHealthCache.expiresAt > Date.now()) return providerHealthCache.value;
  const google = { configured: googleConfigured(), available: false, label: "Google Meet", reason: "" };
  const teams = { configured: teamsConfigured(), available: false, label: "Microsoft Teams", reason: "" };

  if (!google.configured) {
    google.reason = "Google Calendar credentials and refresh token are not configured.";
  } else {
    try {
      const config = googleConfig();
      const token = await googleAccessToken();
      const response = await fetchWithTimeout(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const payload: any = await responseJson(response);
      if (!response.ok) throw new Error(`Calendar access check failed (${response.status}).`);
      const allowed = payload?.conferenceProperties?.allowedConferenceSolutionTypes;
      google.available = !Array.isArray(allowed) || allowed.includes("hangoutsMeet");
      google.reason = google.available ? "Ready" : "This calendar does not allow Google Meet conference creation.";
    } catch (error) {
      google.reason = error instanceof Error ? error.message : "Google Calendar could not be verified.";
    }
  }

  if (!teams.configured) {
    teams.reason = "Microsoft Graph credentials and organiser mailbox are not configured.";
  } else {
    try {
      const config = teamsConfig();
      const token = await microsoftAccessToken();
      const response = await fetchWithTimeout(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.organizer)}/calendar?$select=id,name,allowedOnlineMeetingProviders,defaultOnlineMeetingProvider`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const payload: any = await responseJson(response);
      if (!response.ok) throw new Error(`Organiser calendar access check failed (${response.status}).`);
      const allowed = payload?.allowedOnlineMeetingProviders;
      teams.available = !Array.isArray(allowed) || allowed.includes("teamsForBusiness");
      teams.reason = teams.available ? "Ready" : "This mailbox does not allow Microsoft Teams online meetings.";
    } catch (error) {
      teams.reason = error instanceof Error ? error.message : "Microsoft Teams calendar could not be verified.";
    }
  }

  const value = { googleMeet: google, microsoftTeams: teams, customLink: { configured: true, available: true, label: "Custom link", reason: "Ready" } };
  providerHealthCache = { expiresAt: Date.now() + 120_000, value };
  return value;
}

async function syncPendingProviderMeetings() {
  const pending = rows<any>(await pool.query(`
    SELECT id, meeting_provider AS "meetingProvider", provider_event_id AS "providerEventId",
           provider_sync_attempts AS "providerSyncAttempts", status
    FROM expert_consultation_bookings
    WHERE meeting_provider IN ('google_meet','microsoft_teams')
      AND provider_event_id IS NOT NULL
      AND (
        (status = 'confirmed' AND provider_sync_status = 'creating')
        OR (status = 'cancelled' AND provider_sync_status IN ('active','cancel_failed','creating'))
      )
      AND provider_sync_attempts < 10
      AND COALESCE(provider_next_attempt_at, NOW()) <= NOW()
    ORDER BY updated_at ASC
    LIMIT 20
  `));

  for (const item of pending) {
    const provider = item.meetingProvider as Provider;
    if ((provider === "google_meet" && !googleConfigured()) || (provider === "microsoft_teams" && !teamsConfigured())) continue;
    try {
      if (item.status === "cancelled") {
        await pool.query(`UPDATE expert_consultation_bookings SET provider_sync_status = 'cancel_pending', provider_updated_at = NOW() WHERE id = $1`, [item.id]);
        await cancelProviderEvent(provider, item.providerEventId);
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET provider_sync_status = 'cancelled', provider_last_error = NULL,
              provider_updated_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [item.id]);
        continue;
      }

      const refreshed = await refreshProviderEvent(provider, item.providerEventId);
      if (refreshed.missing) throw new Error(`${providerLabel(provider)} event no longer exists.`);
      if (refreshed.joinUrl) {
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET meeting_url = $2, provider_event_url = COALESCE($3, provider_event_url),
              provider_sync_status = 'active', provider_last_error = NULL,
              provider_updated_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [item.id, refreshed.joinUrl, refreshed.eventUrl]);
        await queueExpertBookingEvent("meeting_updated", item.id, { meetingUrl: refreshed.joinUrl });
      } else {
        await pool.query(`
          UPDATE expert_consultation_bookings
          SET provider_sync_attempts = provider_sync_attempts + 1,
              provider_next_attempt_at = NOW() + INTERVAL '30 seconds', provider_updated_at = NOW()
          WHERE id = $1
        `, [item.id]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "External meeting synchronisation failed.";
      const nextAttempts = Number(item.providerSyncAttempts || 0) + 1;
      const cancellation = item.status === "cancelled";
      await pool.query(`
        UPDATE expert_consultation_bookings
        SET provider_sync_status = $2, provider_sync_attempts = provider_sync_attempts + 1,
            provider_last_error = $3,
            provider_next_attempt_at = NOW() + (LEAST(3600, 30 * POWER(2, LEAST(provider_sync_attempts + 1, 7)))::int * INTERVAL '1 second'),
            provider_updated_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [item.id, cancellation ? "cancel_failed" : "creating", message.slice(0, 2000)]);
      if (cancellation || nextAttempts >= 3) {
        await queueAdminExpertNetworkAlert({
          eventType: cancellation ? "expert_meeting_cancel_sync_failed" : "expert_meeting_sync_delayed",
          title: cancellation ? "External meeting cancellation needs attention" : "Meeting link generation is delayed",
          message: `${providerLabel(provider)} could not synchronise booking ${item.id}. The platform will keep retrying automatically.`,
          actionUrl: "/admin/expert-network#consultation-operations",
          dedupeRevision: { bookingId: item.id, provider, category: cancellation ? "cancel" : "create" },
        }).catch(() => {});
      }
    }
  }
}

let workerTimer: NodeJS.Timeout | null = null;
function startMeetingProviderWorker() {
  if (workerTimer) return;
  setTimeout(() => void syncPendingProviderMeetings().catch((error) => console.error("[Expert Meetings] Initial sync failed", error)), 5000);
  workerTimer = setInterval(() => void syncPendingProviderMeetings().catch((error) => console.error("[Expert Meetings] Sync failed", error)), 30_000);
  workerTimer.unref?.();
}

export function registerExpertMeetingProviderRoutes(app: Express) {
  startMeetingProviderWorker();

  app.get("/api/admin/expert-booking/meeting-providers", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      return res.json(await providerHealth());
    } catch (error) {
      console.error("[Expert Meetings] Provider status error", error);
      return res.status(500).json({ error: "Unable to check meeting provider availability." });
    }
  });

  app.post(
    "/api/admin/expert-booking/bookings/:bookingId/meeting",
    isAuthenticated,
    requireAdmin,
    mutationOriginGuard,
    async (req, res) => {
      const parsed = z.object({
        provider: z.enum(["google_meet", "microsoft_teams", "custom"]),
        meetingUrl: z.string().trim().url().max(2000).optional(),
      }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Choose a valid meeting provider." });
      try {
        const result = parsed.data.provider === "custom"
          ? await setCustomMeeting(req.params.bookingId, String(parsed.data.meetingUrl || ""))
          : await createProviderMeeting(req.params.bookingId, parsed.data.provider);
        return res.status(result.pending ? 202 : 200).json(result);
      } catch (error: any) {
        const status = Number(error?.statusCode || 0) || 502;
        console.error("[Expert Meetings] Meeting update failed", { bookingId: req.params.bookingId, provider: parsed.data.provider, status, message: error?.message });
        return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to update meeting details." });
      }
    },
  );
}
