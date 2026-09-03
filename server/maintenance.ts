import type { Request, RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { systemSettings } from "@shared/schema";

export const MAINTENANCE_SETTING_KEY = "maintenance_mode";
export const DEFAULT_MAINTENANCE_MESSAGE =
  "We are performing scheduled maintenance. Please check back soon.";

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  message: DEFAULT_MAINTENANCE_MESSAGE,
  scheduledStart: null,
  scheduledEnd: null,
};

const CACHE_TTL_MS = 2_000;
let cachedConfig: MaintenanceConfig | null = null;
let cacheExpiresAt = 0;

function normaliseIsoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normaliseMaintenanceConfig(value: unknown): MaintenanceConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_CONFIG };
  }

  const candidate = value as Record<string, unknown>;
  const message = typeof candidate.message === "string"
    ? candidate.message.trim().slice(0, 500)
    : "";

  return {
    enabled: candidate.enabled === true,
    message: message || DEFAULT_MAINTENANCE_MESSAGE,
    scheduledStart: normaliseIsoDate(candidate.scheduledStart),
    scheduledEnd: normaliseIsoDate(candidate.scheduledEnd),
  };
}

export function isMaintenanceActive(
  config: MaintenanceConfig,
  now: Date = new Date(),
): boolean {
  if (!config.enabled) return false;

  const nowMs = now.getTime();
  const startMs = config.scheduledStart
    ? new Date(config.scheduledStart).getTime()
    : null;
  const endMs = config.scheduledEnd
    ? new Date(config.scheduledEnd).getTime()
    : null;

  if (startMs !== null && nowMs < startMs) return false;
  if (endMs !== null && nowMs >= endMs) return false;
  return true;
}

export async function getMaintenanceConfig(
  forceRefresh = false,
): Promise<MaintenanceConfig> {
  const now = Date.now();
  if (!forceRefresh && cachedConfig && cacheExpiresAt > now) {
    return cachedConfig;
  }

  const [row] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, MAINTENANCE_SETTING_KEY))
    .limit(1);

  cachedConfig = normaliseMaintenanceConfig(row?.value);
  cacheExpiresAt = now + CACHE_TTL_MS;
  return cachedConfig;
}

export async function saveMaintenanceConfig(
  value: unknown,
  adminUserId: string,
): Promise<MaintenanceConfig> {
  const config = normaliseMaintenanceConfig(value);

  if (config.scheduledStart && config.scheduledEnd) {
    const startMs = new Date(config.scheduledStart).getTime();
    const endMs = new Date(config.scheduledEnd).getTime();
    if (endMs <= startMs) {
      throw new Error("Scheduled end must be after scheduled start");
    }
  }

  const [saved] = await db
    .insert(systemSettings)
    .values({
      key: MAINTENANCE_SETTING_KEY,
      value: config,
      category: "maintenance",
      description: "Platform maintenance access control and schedule",
      dataType: "json",
      isPublic: true,
      lastModifiedBy: adminUserId,
      lastModifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value: config,
        category: "maintenance",
        description: "Platform maintenance access control and schedule",
        dataType: "json",
        isPublic: true,
        lastModifiedBy: adminUserId,
        lastModifiedAt: new Date(),
      },
    })
    .returning({ value: systemSettings.value });

  cachedConfig = normaliseMaintenanceConfig(saved?.value ?? config);
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cachedConfig;
}

export function isTrustedMaintenanceWrite(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return true;

  try {
    const forwardedHost = req.get("x-forwarded-host");
    const requestHost = forwardedHost || req.get("host");
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

const MAINTENANCE_SAFE_AUTH_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/callback/google",
  "/api/auth/logout",
  "/api/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/resend-verification-public",
]);

function isMaintenanceSafeApiPath(path: string): boolean {
  return (
    path === "/api/maintenance/status" ||
    path === "/api/expert-booking/stripe-webhook" ||
    path.startsWith("/api/auth/verify-email/") ||
    path.startsWith("/api/auth/verify-reset-token/") ||
    MAINTENANCE_SAFE_AUTH_PATHS.has(path)
  );
}

export function sendMaintenanceResponse(
  res: Parameters<RequestHandler>[1],
  config: MaintenanceConfig,
) {
  res.locals.preserveErrorResponse = true;
  if (config.scheduledEnd) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(config.scheduledEnd).getTime() - Date.now()) / 1_000),
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
  }

  return res.status(503).json({
    code: "MAINTENANCE_MODE",
    message: config.message,
    maintenance: {
      active: true,
      scheduledStart: config.scheduledStart,
      scheduledEnd: config.scheduledEnd,
    },
  });
}

export const maintenanceApiGate: RequestHandler = async (req, res, next) => {
  if (!req.path.startsWith("/api/") || isMaintenanceSafeApiPath(req.path)) {
    return next();
  }

  try {
    const config = await getMaintenanceConfig();
    if (!isMaintenanceActive(config)) return next();

    const user = req.user as { isAdmin?: boolean } | undefined;
    if (user?.isAdmin) return next();

    return sendMaintenanceResponse(res, config);
  } catch (error) {
    console.error("[Maintenance] Could not read maintenance setting:", error);
    return next();
  }
};
