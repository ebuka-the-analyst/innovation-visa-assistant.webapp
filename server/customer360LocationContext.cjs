const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/admin/customer-360";
const application = express.application;
let pool;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function loadSessionTimezones(req) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.id) return new Map();

  const email = String(req.query?.email || "").trim();
  if (!email || email.length > 320 || !email.includes("@")) return new Map();

  const db = getPool();
  if (!db) return new Map();

  const result = await db.query(
    `SELECT us.id, us.timezone
       FROM user_sessions us
       JOIN users target_user ON target_user.id = us.user_id
      WHERE LOWER(target_user.email) = LOWER($1)
        AND us.timezone IS NOT NULL
        AND us.timezone <> ''
        AND EXISTS (
          SELECT 1
            FROM users requesting_admin
           WHERE requesting_admin.id = $2
             AND requesting_admin.is_admin = true
        )
      ORDER BY us.session_started_at DESC
      LIMIT 200`,
    [email, req.user.id],
  );

  return new Map(result.rows.map((row) => [String(row.id), String(row.timezone)]));
}

async function customer360LocationContextMiddleware(req, res, next) {
  try {
    const timezoneBySession = await loadSessionTimezones(req);
    if (!timezoneBySession.size) return next();

    const originalJson = res.json.bind(res);
    res.json = function customer360JsonWithLocationContext(body) {
      if (body && Array.isArray(body.sessions)) {
        body.sessions = body.sessions.map((session) => {
          const timezone = timezoneBySession.get(String(session.id));
          if (!timezone) return session;

          const hasGeographicLocation = Boolean(session.city || session.region || session.country);
          const geographicLabel = hasGeographicLocation
            ? session.locationLabel || [session.city, session.region, session.country].filter(Boolean).join(", ")
            : null;

          return {
            ...session,
            timezone,
            locationContextCaptured: true,
            locationLabel: geographicLabel
              ? `${geographicLabel} · Timezone: ${timezone}`
              : `Timezone: ${timezone} · City/country not captured`,
          };
        });
      }

      return originalJson(body);
    };

    return next();
  } catch (error) {
    console.warn("[CUSTOMER 360] Session timezone context unavailable:", error?.message || error);
    return next();
  }
}

if (!application.__customer360LocationContextHookInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__customer360LocationContextHookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function customer360LocationAwareGet(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;

    if (isRouteRegistration && !this.__customer360LocationContextInstalled) {
      Object.defineProperty(this, "__customer360LocationContextInstalled", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
      });

      this.use(ROUTE, customer360LocationContextMiddleware);
    }

    return originalGet.call(this, path, ...handlers);
  };
}
