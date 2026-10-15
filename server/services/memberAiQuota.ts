import { sql } from "drizzle-orm";

export const MEMBERSHIP_SKUS = ["founder", "founder_pro", "founder_pass_90d"] as const;
export type MembershipSku = typeof MEMBERSHIP_SKUS[number];
export type AiQuotaOperation = "generation" | "revision";

export const MEMBERSHIP_QUOTAS: Record<MembershipSku, {
  generationsPerPeriod: number;
  revisionsPerPeriod: number;
  lifetimeGenerations: number | null;
}> = {
  founder: { generationsPerPeriod: 2, revisionsPerPeriod: 15, lifetimeGenerations: null },
  founder_pro: { generationsPerPeriod: 4, revisionsPerPeriod: 30, lifetimeGenerations: null },
  founder_pass_90d: { generationsPerPeriod: 2, revisionsPerPeriod: 15, lifetimeGenerations: 6 },
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function isMembershipSku(value: unknown): value is MembershipSku {
  return typeof value === "string" && MEMBERSHIP_SKUS.includes(value as MembershipSku);
}

interface MembershipWindow {
  package_id: string;
  billing_kind: string;
  status: string;
  starts_at: string | Date;
  ends_at: string | Date;
  period_starts_at: string | Date;
  period_ends_at: string | Date;
}

export function currentQuotaWindow(ent: MembershipWindow, now = new Date()) {
  if (!isMembershipSku(ent.package_id) || ent.status !== "active") return null;
  const begin = new Date(ent.starts_at).getTime();
  const end = new Date(ent.ends_at).getTime();
  const time = now.getTime();
  if (![begin, end, time].every(Number.isFinite) || time < begin || time >= end) return null;
  if (ent.package_id === "founder_pass_90d") {
    if (ent.billing_kind !== "pass" || end - begin > THIRTY_DAYS_MS * 3) return null;
    const periodIndex = Math.floor((time - begin) / THIRTY_DAYS_MS);
    if (periodIndex < 0 || periodIndex > 2) return null;
    return {
      periodStartsAt: new Date(begin + periodIndex * THIRTY_DAYS_MS),
      periodEndsAt: new Date(Math.min(end, begin + (periodIndex + 1) * THIRTY_DAYS_MS)),
    };
  }

  if (ent.billing_kind !== "subscription") return null;
  const pStart = new Date(ent.period_starts_at).getTime();
  const pEnd = new Date(ent.period_ends_at).getTime();
  if (![pStart, pEnd].every(Number.isFinite) || pStart < begin || pStart > time ||
      time >= pEnd || pEnd > end) return null;
  return { periodStartsAt: new Date(pStart), periodEndsAt: new Date(pEnd) };
}

export class MembershipQuotaError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "MembershipQuotaError";
  }
}

function rowsOf(result: any): any[] {
  return Array.isArray(result?.rows) ? result.rows : Array.isArray(result) ? result : [];
}

/**
 * Must be called INSIDE the same transaction that creates the generation or
 * revision job. The entitlement row is locked, serialising concurrent quota
 * checks and reservations even across application replicas.
 */
export async function reserveMemberAiQuota(
  tx: any,
  userId: string,
  packageId: MembershipSku,
  operation: AiQuotaOperation,
  sourceId: string,
  now = new Date(),
): Promise<{ duplicate: boolean }> {
  const result = await tx.execute(sql`
    SELECT id, package_id, billing_kind, status, starts_at, ends_at,
           period_starts_at, period_ends_at
    FROM member_ai_entitlements
    WHERE user_id = ${userId} AND package_id = ${packageId}
      AND status = 'active' AND starts_at <= ${now} AND ends_at > ${now}
    ORDER BY CASE WHEN provider='admin' THEN 0 ELSE 1 END, starts_at DESC LIMIT 1 FOR UPDATE
  `);
  const entitlement = rowsOf(result)[0];
  if (!entitlement) throw new MembershipQuotaError("ENTITLEMENT_INACTIVE", "Active verified membership required.");
  const window = currentQuotaWindow(entitlement, now);
  if (!window) throw new MembershipQuotaError("BILLING_PERIOD_INACTIVE", "Membership billing period is not current.");

  const prior = rowsOf(await tx.execute(sql`
    SELECT id, status FROM member_ai_quota_reservations
    WHERE operation = ${operation} AND source_id = ${sourceId} FOR UPDATE
  `))[0];
  if (prior && prior.status !== "released") return { duplicate: true };

  const limit = operation === "generation"
    ? MEMBERSHIP_QUOTAS[packageId].generationsPerPeriod
    : MEMBERSHIP_QUOTAS[packageId].revisionsPerPeriod;
  const usedRows = rowsOf(await tx.execute(sql`
    SELECT COUNT(*)::integer AS used FROM member_ai_quota_reservations
    WHERE entitlement_id = ${entitlement.id} AND operation = ${operation}
      AND period_starts_at = ${window.periodStartsAt} AND status <> 'released'
  `));
  if (Number(usedRows[0]?.used || 0) >= limit) {
    throw new MembershipQuotaError("PERIOD_QUOTA_EXHAUSTED", "Your current period allowance has been used.");
  }
  if (operation === "generation" && MEMBERSHIP_QUOTAS[packageId].lifetimeGenerations != null) {
    const lifetimeRows = rowsOf(await tx.execute(sql`
      SELECT COUNT(*)::integer AS used FROM member_ai_quota_reservations
      WHERE entitlement_id = ${entitlement.id} AND operation = 'generation'
        AND status <> 'released'
    `));
    if (Number(lifetimeRows[0]?.used || 0) >= MEMBERSHIP_QUOTAS[packageId].lifetimeGenerations!) {
      throw new MembershipQuotaError("LIFETIME_QUOTA_EXHAUSTED", "The 90-day pass generation allowance has been used.");
    }
  }

  if (prior) {
    await tx.execute(sql`
      UPDATE member_ai_quota_reservations SET status = 'reserved',
        entitlement_id = ${entitlement.id}, period_starts_at = ${window.periodStartsAt},
        updated_at = NOW() WHERE id = ${prior.id} AND status = 'released'
    `);
  } else {
    await tx.execute(sql`
      INSERT INTO member_ai_quota_reservations
        (entitlement_id, user_id, operation, source_id, period_starts_at, status)
      VALUES (${entitlement.id}, ${userId}, ${operation}, ${sourceId}, ${window.periodStartsAt}, 'reserved')
    `);
  }
  return { duplicate: false };
}

export async function transitionMemberAiReservation(
  tx: any, operation: AiQuotaOperation, sourceId: string,
  to: "committed" | "released",
) {
  await tx.execute(sql`
    UPDATE member_ai_quota_reservations
    SET status = ${to}, updated_at = NOW()
    WHERE operation = ${operation} AND source_id = ${sourceId}
      AND status = 'reserved'
  `);
}

/**
 * Read-only, server-authoritative balance for customer membership UI.
 * Uses the same entitlement period and non-released reservation counts as
 * reserveMemberAiQuota. A missing/revoked entitlement never becomes credits.
 */
export async function getMemberAiQuotaSnapshot(userId: string, packageId: MembershipSku) {
  const { db } = await import("../db");
  const now = new Date();
  const inactive = {
    packageId, active: false as const, generationLimit: 0,
    generationsUsed: 0, remainingGenerations: 0, revisionLimit: 0,
    revisionsUsed: 0, remainingRevisions: 0, periodEndsAt: null as string | null,
    paidThrough: null as string | null,
  };
  const entitlement = rowsOf(await db.execute(sql`
    SELECT id, package_id, billing_kind, status, starts_at, ends_at,
           period_starts_at, period_ends_at
    FROM member_ai_entitlements
    WHERE user_id = ${userId} AND package_id = ${packageId}
      AND status = 'active' AND starts_at <= ${now} AND ends_at > ${now}
    ORDER BY CASE WHEN provider='admin' THEN 0 ELSE 1 END, starts_at DESC LIMIT 1
  `))[0];
  if (!entitlement) return inactive;
  const window = currentQuotaWindow(entitlement, now);
  if (!window) return inactive;
  const rows = rowsOf(await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE operation = 'generation'
        AND period_starts_at = ${window.periodStartsAt})::integer AS generations_used,
      COUNT(*) FILTER (WHERE operation = 'revision'
        AND period_starts_at = ${window.periodStartsAt})::integer AS revisions_used,
      COUNT(*) FILTER (WHERE operation = 'generation')::integer AS lifetime_generations_used
    FROM member_ai_quota_reservations
    WHERE entitlement_id = ${entitlement.id} AND status <> 'released'
  `));
  const used = Number(rows[0]?.generations_used || 0);
  const revised = Number(rows[0]?.revisions_used || 0);
  const quota = MEMBERSHIP_QUOTAS[packageId];
  const periodRemaining = Math.max(0, quota.generationsPerPeriod - used);
  const lifetimeRemaining = quota.lifetimeGenerations === null ? periodRemaining :
    Math.max(0, quota.lifetimeGenerations - Number(rows[0]?.lifetime_generations_used || 0));
  return {
    packageId, active: true as const,
    generationLimit: quota.generationsPerPeriod,
    generationsUsed: used,
    remainingGenerations: Math.min(periodRemaining, lifetimeRemaining),
    revisionLimit: quota.revisionsPerPeriod,
    revisionsUsed: revised,
    remainingRevisions: Math.max(0, quota.revisionsPerPeriod - revised),
    periodEndsAt: window.periodEndsAt.toISOString(),
    paidThrough: new Date(entitlement.ends_at).toISOString(),
  };
}
