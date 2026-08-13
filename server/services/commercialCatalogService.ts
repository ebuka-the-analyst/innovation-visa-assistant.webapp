import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { adminAuditLogs, systemSettings } from "@shared/schema";
import {
  COMMERCIAL_CATALOG_SETTING_KEY,
  FALLBACK_COMMERCIAL_CATALOG,
  commercialCatalogSchema,
  toPublicCommercialCatalog,
  type CommercialCatalog,
  type PublicCommercialCatalog,
} from "@shared/commercialCatalog";

export type CommercialCatalogSource = "database" | "fallback";

export interface CommercialCatalogResult {
  catalog: CommercialCatalog;
  source: CommercialCatalogSource;
}

interface SaveCommercialCatalogInput {
  expectedRevision: number;
  reason: unknown;
  catalog: CommercialCatalog;
  actor: { id: string; email: string };
  ipAddress?: string;
  userAgent?: string;
}

export class CommercialCatalogConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommercialCatalogConflictError";
  }
}

export class CommercialCatalogValidationError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "CommercialCatalogValidationError";
    this.details = details;
  }
}

export class CommercialCatalogUnavailableError extends Error {
  constructor(message = "Commercial catalogue is temporarily unavailable") {
    super(message);
    this.name = "CommercialCatalogUnavailableError";
  }
}

function fallbackCatalog(): CommercialCatalog {
  return commercialCatalogSchema.parse(JSON.parse(JSON.stringify(FALLBACK_COMMERCIAL_CATALOG)));
}

function validateReason(value: unknown): string {
  if (typeof value !== "string") {
    throw new CommercialCatalogValidationError("A reason for the price or access change is required");
  }
  const reason = value.trim();
  if (reason.length < 10 || reason.length > 500) {
    throw new CommercialCatalogValidationError("The change reason must be between 10 and 500 characters");
  }
  if (/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(reason)) {
    throw new CommercialCatalogValidationError("The change reason must be plain text");
  }
  return reason;
}

function parseStoredCatalog(value: unknown): CommercialCatalog | undefined {
  const parsed = commercialCatalogSchema.safeParse(value);
  if (!parsed.success) {
    console.error("[CommercialCatalog] Stored catalogue failed validation", parsed.error.flatten());
    return undefined;
  }
  return parsed.data;
}

export async function getCommercialCatalog(): Promise<CommercialCatalogResult> {
  try {
    const rows = await (db as any)
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, COMMERCIAL_CATALOG_SETTING_KEY))
      .limit(1);
    if (!rows[0]) return { catalog: fallbackCatalog(), source: "fallback" };
    const stored = parseStoredCatalog(rows[0].value);
    if (stored) return { catalog: stored, source: "database" };
    throw new CommercialCatalogUnavailableError("Stored commercial catalogue is invalid");
  } catch (error) {
    console.error("[CommercialCatalog] Database read failed", error);
    throw error instanceof CommercialCatalogUnavailableError
      ? error
      : new CommercialCatalogUnavailableError();
  }
}

export async function getPublicCommercialCatalog(): Promise<PublicCommercialCatalog> {
  const { catalog, source } = await getCommercialCatalog();
  return toPublicCommercialCatalog(catalog, source);
}

function getChangeSummary(previous: CommercialCatalog, next: CommercialCatalog) {
  const previousPlans = new Map(previous.plans.map((plan) => [plan.id, plan]));
  const changedPlanIds = next.plans
    .filter((plan) => JSON.stringify(previousPlans.get(plan.id)) !== JSON.stringify(plan))
    .map((plan) => plan.id);

  const toolIds = new Set([
    ...Object.keys(previous.minimumPlanByTool),
    ...Object.keys(next.minimumPlanByTool),
  ]);
  const changedToolIds = Array.from(toolIds).filter(
    (toolId) => previous.minimumPlanByTool[toolId] !== next.minimumPlanByTool[toolId],
  );

  return { changedPlanIds, changedToolIds };
}

export async function saveCommercialCatalog(
  input: SaveCommercialCatalogInput,
): Promise<CommercialCatalogResult> {
  const reason = validateReason(input.reason);
  if (input.catalog.revision !== input.expectedRevision) {
    throw new CommercialCatalogValidationError("The submitted catalogue revision does not match expectedRevision");
  }

  const submitted = commercialCatalogSchema.safeParse(input.catalog);
  if (!submitted.success) {
    throw new CommercialCatalogValidationError(
      "Commercial catalogue validation failed",
      submitted.error.flatten(),
    );
  }

  const database = db as any;
  return database.transaction(async (tx: any) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${COMMERCIAL_CATALOG_SETTING_KEY}))`);

    const rows = await tx
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, COMMERCIAL_CATALOG_SETTING_KEY))
      .limit(1);
    const previous = rows[0] ? parseStoredCatalog(rows[0].value) : fallbackCatalog();
    if (!previous) {
      throw new CommercialCatalogUnavailableError("Stored commercial catalogue is invalid");
    }

    if (previous.revision !== input.expectedRevision) {
      throw new CommercialCatalogConflictError(
        `This catalogue changed after it was loaded (current revision ${previous.revision}). Reload and review before saving.`,
      );
    }

    const nextCandidate: CommercialCatalog = {
      ...submitted.data,
      revision: previous.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: input.actor.email,
    };
    const nextParsed = commercialCatalogSchema.safeParse(nextCandidate);
    if (!nextParsed.success) {
      throw new CommercialCatalogValidationError(
        "Commercial catalogue validation failed",
        nextParsed.error.flatten(),
      );
    }
    const next = nextParsed.data;
    const changeSummary = getChangeSummary(previous, next);

    await tx
      .insert(systemSettings)
      .values({
        key: COMMERCIAL_CATALOG_SETTING_KEY,
        value: next,
        category: "commercial",
        description: "Published pricing, plan copy, and minimum plan required for each runnable tool",
        dataType: "json",
        isPublic: false,
        lastModifiedBy: input.actor.id,
        lastModifiedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: next,
          category: "commercial",
          description: "Published pricing, plan copy, and minimum plan required for each runnable tool",
          dataType: "json",
          isPublic: false,
          lastModifiedBy: input.actor.id,
          lastModifiedAt: new Date(),
        },
      });

    await tx.insert(adminAuditLogs).values({
      adminId: input.actor.id,
      adminEmail: input.actor.email,
      action: "commercial_catalog_updated",
      actionCategory: "pricing_management",
      targetType: "system_setting",
      targetId: COMMERCIAL_CATALOG_SETTING_KEY,
      previousValue: { catalog: previous, changeSummary },
      newValue: { catalog: next, changeSummary },
      reason,
      ipAddress: input.ipAddress?.slice(0, 50),
      userAgent: input.userAgent,
    });

    return { catalog: next, source: "database" as const };
  });
}
