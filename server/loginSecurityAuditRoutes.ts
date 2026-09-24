import type { Express } from "express";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { requireAdmin } from "./auth";
import { classifyLoginRisk, numberFromDb } from "./loginSecurityAudit";

function clampLimit(value: unknown, fallback = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(250, Math.trunc(parsed)));
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(value as string | Date);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function registerLoginSecurityAuditRoutes(app: Express) {
  app.get("/api/admin/security/login-audit", requireAdmin, async (req, res) => {
    try {
      const rawSearch = typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 120)
        : "";
      const search = rawSearch ? `%${rawSearch}%` : null;
      const limit = clampLimit(req.query.limit);

      const result = await db.execute(sql`
        WITH session_rollup AS (
          SELECT
            user_id,
            COUNT(*) FILTER (
              WHERE session_started_at >= NOW() - INTERVAL '24 hours'
            )::int AS session_count_24h,
            COUNT(*) FILTER (
              WHERE session_started_at >= NOW() - INTERVAL '7 days'
            )::int AS session_count_7d,
            COUNT(DISTINCT NULLIF(concat_ws('|', device_type, browser_name, os_name), '')) FILTER (
              WHERE session_started_at >= NOW() - INTERVAL '7 days'
            )::int AS distinct_devices_7d,
            COUNT(DISTINCT country) FILTER (
              WHERE session_started_at >= NOW() - INTERVAL '7 days'
                AND country IS NOT NULL
                AND country <> ''
            )::int AS distinct_countries_7d
          FROM user_sessions
          GROUP BY user_id
        ),
        last_session AS (
          SELECT DISTINCT ON (user_id)
            user_id,
            session_started_at,
            last_seen_at,
            is_active,
            device_type,
            browser_name,
            os_name,
            country
          FROM user_sessions
          ORDER BY user_id, session_started_at DESC
        ),
        event_rollup AS (
          SELECT
            LOWER(user_email) AS email_key,
            COUNT(*) FILTER (
              WHERE event_type = 'failed_login'
                AND created_at >= NOW() - INTERVAL '24 hours'
            )::int AS failed_logins_24h,
            COUNT(*) FILTER (
              WHERE event_type = 'failed_login'
                AND created_at >= NOW() - INTERVAL '7 days'
            )::int AS failed_logins_7d,
            COUNT(*) FILTER (
              WHERE event_type = 'successful_login'
                AND created_at >= NOW() - INTERVAL '24 hours'
            )::int AS successful_logins_24h,
            MAX(created_at) FILTER (
              WHERE event_type = 'failed_login'
            ) AS last_failed_login
          FROM security_events
          WHERE user_email IS NOT NULL
          GROUP BY LOWER(user_email)
        )
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.is_email_verified,
          u.is_admin,
          u.created_at,
          u.last_activity_at,
          COALESCE(sr.session_count_24h, 0)::int AS session_count_24h,
          COALESCE(sr.session_count_7d, 0)::int AS session_count_7d,
          COALESCE(sr.distinct_devices_7d, 0)::int AS distinct_devices_7d,
          COALESCE(sr.distinct_countries_7d, 0)::int AS distinct_countries_7d,
          COALESCE(er.failed_logins_24h, 0)::int AS failed_logins_24h,
          COALESCE(er.failed_logins_7d, 0)::int AS failed_logins_7d,
          COALESCE(er.successful_logins_24h, 0)::int AS successful_logins_24h,
          er.last_failed_login,
          ls.session_started_at AS last_session_started,
          ls.last_seen_at,
          ls.is_active AS last_session_active,
          ls.device_type AS last_device_type,
          ls.browser_name AS last_browser_name,
          ls.os_name AS last_os_name,
          ls.country AS last_country
        FROM users u
        LEFT JOIN session_rollup sr ON sr.user_id = u.id
        LEFT JOIN last_session ls ON ls.user_id = u.id
        LEFT JOIN event_rollup er ON er.email_key = LOWER(u.email)
        WHERE (
          ${search}::text IS NULL
          OR u.email ILIKE ${search}
          OR concat_ws(' ', u.first_name, u.last_name) ILIKE ${search}
        )
        ORDER BY
          COALESCE(er.failed_logins_24h, 0) DESC,
          ls.session_started_at DESC NULLS LAST,
          u.created_at DESC
        LIMIT ${limit}
      `);

      const users = (result.rows as any[]).map((row) => {
        const signals = {
          failedLogins24h: numberFromDb(row.failed_logins_24h),
          sessionCount24h: numberFromDb(row.session_count_24h),
          sessionCount7d: numberFromDb(row.session_count_7d),
          distinctCountries7d: numberFromDb(row.distinct_countries_7d),
          distinctDevices7d: numberFromDb(row.distinct_devices_7d),
          isEmailVerified: row.is_email_verified === true,
          createdAt: row.created_at,
        };
        const risk = classifyLoginRisk(signals);

        return {
          id: row.id,
          email: row.email,
          name: [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || row.email,
          isEmailVerified: row.is_email_verified === true,
          isAdmin: row.is_admin === true,
          createdAt: toIso(row.created_at),
          lastActivityAt: toIso(row.last_activity_at),
          sessionCount24h: signals.sessionCount24h,
          sessionCount7d: signals.sessionCount7d,
          distinctDevices7d: signals.distinctDevices7d,
          distinctCountries7d: signals.distinctCountries7d,
          failedLogins24h: signals.failedLogins24h,
          failedLogins7d: numberFromDb(row.failed_logins_7d),
          successfulLogins24h: numberFromDb(row.successful_logins_24h),
          lastFailedLogin: toIso(row.last_failed_login),
          lastSession: {
            startedAt: toIso(row.last_session_started),
            lastSeenAt: toIso(row.last_seen_at),
            isActive: row.last_session_active === true,
            deviceType: row.last_device_type || null,
            browserName: row.last_browser_name || null,
            osName: row.last_os_name || null,
            country: row.last_country || null,
          },
          risk,
        };
      });

      const statsResult = await db.execute(sql`
        SELECT
          COUNT(*) FILTER (
            WHERE event_type = 'failed_login'
              AND created_at >= NOW() - INTERVAL '24 hours'
          )::int AS failed_logins_24h,
          COUNT(DISTINCT NULLIF(ip_address, '')) FILTER (
            WHERE event_type = 'failed_login'
              AND created_at >= NOW() - INTERVAL '24 hours'
          )::int AS unique_failed_sources_24h,
          COUNT(DISTINCT LOWER(user_email)) FILTER (
            WHERE event_type = 'failed_login'
              AND created_at >= NOW() - INTERVAL '24 hours'
              AND user_email IS NOT NULL
          )::int AS targeted_accounts_24h,
          COUNT(*) FILTER (
            WHERE event_type = 'successful_login'
              AND created_at >= NOW() - INTERVAL '24 hours'
          )::int AS successful_logins_24h
        FROM security_events
      `);
      const statsRow = (statsResult.rows as any[])[0] || {};

      const failedTargetsResult = await db.execute(sql`
        SELECT
          LOWER(user_email) AS email,
          COUNT(*)::int AS attempts,
          COUNT(DISTINCT NULLIF(ip_address, ''))::int AS unique_sources,
          MIN(created_at) AS first_attempt_at,
          MAX(created_at) AS last_attempt_at
        FROM security_events
        WHERE event_type = 'failed_login'
          AND created_at >= NOW() - INTERVAL '24 hours'
          AND user_email IS NOT NULL
        GROUP BY LOWER(user_email)
        ORDER BY COUNT(*) DESC, MAX(created_at) DESC
        LIMIT 20
      `);

      const stats = {
        failedLogins24h: numberFromDb(statsRow.failed_logins_24h),
        uniqueFailedSources24h: numberFromDb(statsRow.unique_failed_sources_24h),
        targetedAccounts24h: numberFromDb(statsRow.targeted_accounts_24h),
        successfulLogins24h: numberFromDb(statsRow.successful_logins_24h),
        accountsToReview: users.filter((user) => user.risk.level !== "normal").length,
      };

      res.json({
        generatedAt: new Date().toISOString(),
        stats,
        distributedFailurePattern:
          stats.failedLogins24h >= 5 &&
          stats.uniqueFailedSources24h >= 3,
        users,
        failedTargets: (failedTargetsResult.rows as any[]).map((row) => ({
          email: row.email,
          attempts: numberFromDb(row.attempts),
          uniqueSources: numberFromDb(row.unique_sources),
          firstAttemptAt: toIso(row.first_attempt_at),
          lastAttemptAt: toIso(row.last_attempt_at),
        })),
        privacy: {
          rawIpAddressesReturned: false,
          sessionTokensReturned: false,
          userAgentsReturned: false,
          preciseLocationsReturned: false,
        },
      });
    } catch (error) {
      console.error("Login security audit fetch error:", error);
      res.status(500).json({ error: "Failed to fetch login security audit" });
    }
  });

  app.get("/api/admin/security/login-audit/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;

      const userResult = await db.execute(sql`
        SELECT
          id,
          email,
          first_name,
          last_name,
          is_email_verified,
          is_admin,
          created_at,
          last_activity_at
        FROM users
        WHERE id = ${userId}
        LIMIT 1
      `);
      const user = (userResult.rows as any[])[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const sessionsResult = await db.execute(sql`
        SELECT
          session_started_at,
          last_seen_at,
          session_ended_at,
          is_active,
          device_type,
          browser_name,
          os_name,
          country,
          country_code,
          current_page,
          page_view_count,
          total_duration_seconds
        FROM user_sessions
        WHERE user_id = ${userId}
        ORDER BY session_started_at DESC
        LIMIT 30
      `);

      const securityResult = await db.execute(sql`
        SELECT
          event_type,
          severity,
          description,
          is_resolved,
          created_at
        FROM security_events
        WHERE user_id = ${userId}
           OR LOWER(user_email) = LOWER(${user.email})
        ORDER BY created_at DESC
        LIMIT 50
      `);

      const sourceCountResult = await db.execute(sql`
        SELECT
          COUNT(DISTINCT NULLIF(ip_address, '')) FILTER (
            WHERE event_type = 'failed_login'
              AND created_at >= NOW() - INTERVAL '24 hours'
          )::int AS failed_source_count_24h
        FROM security_events
        WHERE user_id = ${userId}
           OR LOWER(user_email) = LOWER(${user.email})
      `);

      const rawSessions = sessionsResult.rows as any[];
      const sessions = rawSessions.map((session, index) => {
        const previous = rawSessions[index + 1];
        const currentDevice = [session.device_type, session.browser_name, session.os_name]
          .filter(Boolean)
          .join("|");
        const previousDevice = previous
          ? [previous.device_type, previous.browser_name, previous.os_name].filter(Boolean).join("|")
          : "";

        return {
          startedAt: toIso(session.session_started_at),
          lastSeenAt: toIso(session.last_seen_at),
          endedAt: toIso(session.session_ended_at),
          isActive: session.is_active === true,
          deviceType: session.device_type || null,
          browserName: session.browser_name || null,
          osName: session.os_name || null,
          country: session.country || null,
          countryCode: session.country_code || null,
          currentPage: session.current_page || null,
          pageViewCount: numberFromDb(session.page_view_count),
          totalDurationSeconds: numberFromDb(session.total_duration_seconds),
          deviceChangedFromPrevious: Boolean(previous && currentDevice && previousDevice && currentDevice !== previousDevice),
          countryChangedFromPrevious: Boolean(
            previous &&
            session.country &&
            previous.country &&
            session.country !== previous.country
          ),
        };
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email,
          isEmailVerified: user.is_email_verified === true,
          isAdmin: user.is_admin === true,
          createdAt: toIso(user.created_at),
          lastActivityAt: toIso(user.last_activity_at),
        },
        failedSourceCount24h: numberFromDb(
          (sourceCountResult.rows as any[])[0]?.failed_source_count_24h,
        ),
        sessions,
        securityEvents: (securityResult.rows as any[]).map((event) => ({
          eventType: event.event_type,
          severity: event.severity,
          description: event.description,
          isResolved: event.is_resolved === true,
          createdAt: toIso(event.created_at),
        })),
        privacy: {
          rawIpAddressesReturned: false,
          sessionTokensReturned: false,
          userAgentsReturned: false,
          preciseLocationsReturned: false,
        },
      });
    } catch (error) {
      console.error("Login security audit detail fetch error:", error);
      res.status(500).json({ error: "Failed to fetch login security audit detail" });
    }
  });
}
