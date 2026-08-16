import crypto from "crypto";
import os from "os";
import OpenAI from "openai";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { BUSINESS_PLAN_MODEL } from "../aiModelConfig";
import { getSectionsForTier, getSectionSystemPrompt } from "../aiPrompts";
import { generatePDFUrl, sanitizeBusinessPlanOutputText } from "../pdf";
import {
  assessBusinessPlanQuality,
  formatQualityReportMarkdown,
  sanitizeBusinessPlanClaims,
} from "../businessPlanQuality";
import { generateChartData } from "../chartGenerator";

const REVISION_WORKER_VERSION = "business-plan-revision-v1-2026-08-16";
const LEASE_SECONDS = 120;
const HEARTBEAT_INTERVAL_MS = 20_000;
const IDLE_POLL_MS = 2_500;
const MAX_TRANSIENT_FAILURES = 4;

const REQUEST_TYPES = new Set([
  "factual_correction",
  "updated_information",
  "content_improvement",
  "section_regeneration",
]);

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

type RevisionJob = {
  id: string;
  revision_id: string;
  lease_token: string;
  failure_count: number;
};

type VersionSection = {
  section_index: number;
  section_title: string;
  content: string;
  content_sha256?: string;
};

export class RevisionServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly payload: Record<string, unknown>,
  ) {
    super(typeof payload.error === "string" ? payload.error : "Revision request failed");
    this.name = "RevisionServiceError";
  }
}

class LostRevisionLeaseError extends Error {
  constructor() {
    super("Revision worker lease was lost");
    this.name = "LostRevisionLeaseError";
  }
}

class PermanentRevisionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentRevisionError";
  }
}

function rowsOf<T = any>(result: any): T[] {
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result?.rows)) return result.rows as T[];
  return [];
}

function firstRow<T = any>(result: any): T | undefined {
  return rowsOf<T>(result)[0];
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normaliseError(error: any): string {
  return String(error?.message || error || "Unknown revision error").slice(0, 4000);
}

function isPermanentProviderError(error: any): boolean {
  const status = Number(error?.status || 0);
  const code = String(error?.code || "");
  const type = String(error?.type || "");
  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    code === "unsupported_parameter" ||
    type === "invalid_request_error"
  );
}

async function callRevisionAI(prompt: string, maxTokens = 8000): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new PermanentRevisionError("OPENAI_API_KEY is not configured");
  }

  if (/^gpt-5/i.test(BUSINESS_PLAN_MODEL)) {
    const response = await openaiClient.responses.create({
      model: BUSINESS_PLAN_MODEL as any,
      input: prompt,
      max_output_tokens: maxTokens,
      reasoning: { effort: "medium" },
      text: { verbosity: "high" },
    } as any);
    const responseAny = response as any;
    const outputText = typeof responseAny.output_text === "string" ? responseAny.output_text : "";
    const fallbackText = Array.isArray(responseAny.output)
      ? responseAny.output
          .flatMap((item: any) => item?.content || [])
          .map((item: any) => item?.text || "")
          .join("")
      : "";
    const content = (outputText || fallbackText).trim();
    if (!content) throw new Error("OpenAI returned an empty revision response");
    return content;
  }

  const response = await openaiClient.chat.completions.create({
    model: BUSINESS_PLAN_MODEL as any,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.35,
  } as any);
  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned an empty revision response");
  return content;
}

function stripDuplicateHeading(sectionTitle: string, sectionContent: string): string {
  const titleCore = sectionTitle.replace(/^\d+\.\s*/, "").toUpperCase().trim();
  const lines = sectionContent.split("\n");
  let start = 0;
  for (let index = 0; index < Math.min(4, lines.length); index++) {
    const line = lines[index].trim();
    if (!line) {
      start = index + 1;
      continue;
    }
    const core = line
      .replace(/^#+\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/\*\*/g, "")
      .toUpperCase()
      .trim();
    if (core === titleCore) start = index + 1;
    else break;
  }
  return lines.slice(start).join("\n").trim();
}

function buildPlanFacts(plan: any): string {
  const safe = (value: unknown) => (value === null || value === undefined ? "" : String(value));
  return `
CANONICAL BUSINESS-PLAN FACTS — do not contradict these unless the customer's revision instructions explicitly update them:
- Business name: ${safe(plan.businessName)}
- Industry: ${safe(plan.industry)}
- Problem: ${safe(plan.problem)}
- Differentiation / innovation: ${safe(plan.uniqueness)}
- Product status: ${safe(plan.productStatus)}
- Innovation stage: ${safe(plan.innovationStage)}
- Technology stack: ${safe(plan.techStack)}
- Data architecture: ${safe(plan.dataArchitecture)}
- AI methodology: ${safe(plan.aiMethodology)}
- Founder education: ${safe(plan.founderEducation)}
- Founder work history: ${safe(plan.founderWorkHistory)}
- Founder achievements: ${safe(plan.founderAchievements)}
- Funding: ${safe(plan.funding)}
- Funding sources: ${safe(plan.fundingSources)}
- Revenue model: ${safe(plan.revenue)}
- Customer acquisition cost: ${safe(plan.customerAcquisitionCost)}
- Lifetime value: ${safe(plan.lifetimeValue)}
- Payback period: ${safe(plan.paybackPeriod)}
- Competitors: ${safe(plan.competitors)}
- Competitive differentiation: ${safe(plan.competitiveDifferentiation)}
- Customer interviews: ${safe(plan.customerInterviews)}
- Letters of intent: ${safe(plan.lettersOfIntent)}
- Market size: ${safe(plan.marketSize)}
- Regulatory requirements: ${safe(plan.regulatoryRequirements)}
- Job creation target: ${safe(plan.jobCreation)}
- Hiring plan: ${safe(plan.hiringPlan)}
- Expansion strategy: ${safe(plan.expansion)}
- Geographic focus: ${safe(plan.specificRegions)}
- Five-year vision: ${safe(plan.vision)}
- Target endorser: ${safe(plan.targetEndorser)}
`;
}

function extractLegacySections(plan: any): VersionSection[] {
  const content = String(plan.generatedContent || "");
  const sections = getSectionsForTier(plan.tier || "basic");
  if (!content || sections.length === 0) return [];

  const extracted: VersionSection[] = [];
  for (let index = 0; index < sections.length; index++) {
    const marker = `## ${sections[index].title}`;
    const start = content.indexOf(marker);
    if (start < 0) return [];
    const bodyStart = start + marker.length;
    const nextMarker = index + 1 < sections.length ? `## ${sections[index + 1].title}` : "";
    let end = nextMarker ? content.indexOf(nextMarker, bodyStart) : content.length;
    if (end < 0) end = content.length;
    let body = content.slice(bodyStart, end);
    const separator = body.lastIndexOf("\n\n---\n\n");
    if (index === sections.length - 1 && separator >= 0) body = body.slice(0, separator);
    body = body.replace(/^\s*---\s*/m, "").trim();
    if (!body) return [];
    extracted.push({
      section_index: index,
      section_title: sections[index].title,
      content: body,
      content_sha256: sha256(body),
    });
  }
  return extracted;
}

async function ensureInitialVersion(tx: any, plan: any, userId: string): Promise<any> {
  const existing = firstRow<any>(await tx.execute(sql`
    SELECT *
    FROM business_plan_versions
    WHERE plan_id = ${plan.id} AND status = 'accepted'
    ORDER BY version_number DESC
    LIMIT 1
    FOR UPDATE
  `));
  if (existing) return existing;

  let sectionRows = rowsOf<VersionSection>(await tx.execute(sql`
    SELECT section_index, section_title, content, content_sha256
    FROM business_plan_generation_sections
    WHERE plan_id = ${plan.id}
    ORDER BY section_index ASC
  `));

  const expectedSections = getSectionsForTier(plan.tier || "basic");
  if (sectionRows.length !== expectedSections.length) {
    sectionRows = extractLegacySections(plan);
  }
  if (sectionRows.length !== expectedSections.length) {
    throw new RevisionServiceError(409, {
      error: "This plan cannot yet be revised automatically because its section checkpoints are incomplete.",
      code: "REVISION_SOURCE_SECTIONS_INCOMPLETE",
    });
  }

  const generatedContent = String(plan.generatedContent || "");
  if (!generatedContent) {
    throw new RevisionServiceError(409, { error: "The business plan has no completed content to revise." });
  }
  const contentHash = sha256(generatedContent);
  const version = firstRow<any>(await tx.execute(sql`
    INSERT INTO business_plan_versions (
      id, plan_id, version_number, status, generated_content, chart_data,
      content_sha256, created_by_user_id, created_at, accepted_at
    ) VALUES (
      gen_random_uuid()::varchar, ${plan.id}, 1, 'accepted', ${generatedContent},
      ${plan.chartData || null}, ${contentHash}, ${userId}, NOW(), NOW()
    )
    RETURNING *
  `));
  if (!version) throw new Error("Failed to create initial business-plan version");

  for (const section of sectionRows) {
    const hash = section.content_sha256 || sha256(section.content);
    await tx.execute(sql`
      INSERT INTO business_plan_version_sections (
        id, version_id, plan_id, section_index, section_title, content, content_sha256, created_at
      ) VALUES (
        gen_random_uuid()::varchar, ${version.id}, ${plan.id}, ${Number(section.section_index)},
        ${section.section_title}, ${section.content}, ${hash}, NOW()
      )
    `);
  }
  return version;
}

async function addEvent(
  executor: any,
  revisionId: string,
  planId: string,
  actorType: "customer" | "admin" | "system" | "worker",
  eventType: string,
  actorUserId?: string | null,
  payload?: Record<string, unknown> | null,
): Promise<void> {
  const payloadJson = payload ? JSON.stringify(payload) : null;
  await executor.execute(sql`
    INSERT INTO business_plan_revision_events (
      id, revision_id, plan_id, actor_user_id, actor_type, event_type, payload, created_at
    ) VALUES (
      gen_random_uuid()::varchar, ${revisionId}, ${planId}, ${actorUserId || null},
      ${actorType}, ${eventType}, ${payloadJson}::jsonb, NOW()
    )
  `);
}

export async function getRevisionContextForUser(planId: string, userId: string) {
  const plan = await storage.getBusinessPlan(planId);
  if (!plan || plan.userId !== userId) throw new RevisionServiceError(404, { error: "Business plan not found" });
  if (plan.status !== "completed") {
    throw new RevisionServiceError(409, { error: "Revisions are available after generation is complete." });
  }

  const transactionalDb = db as any;
  const acceptedVersion = await transactionalDb.transaction(async (tx: any) => {
    const lockedPlan = firstRow<any>(await tx.execute(sql`
      SELECT id FROM business_plans WHERE id = ${planId} AND user_id = ${userId} FOR UPDATE
    `));
    if (!lockedPlan) throw new RevisionServiceError(404, { error: "Business plan not found" });
    return ensureInitialVersion(tx, plan, userId);
  });

  const sections = rowsOf<any>(await db.execute(sql`
    SELECT section_index, section_title
    FROM business_plan_version_sections
    WHERE version_id = ${acceptedVersion.id}
    ORDER BY section_index ASC
  `));
  const revisions = rowsOf<any>(await db.execute(sql`
    SELECT id, revision_number, request_type, instructions, selected_section_indexes,
           status, source_version_id, target_version_id, consistency_report,
           last_error, submitted_at, started_at, completed_at, accepted_at, cancelled_at, updated_at
    FROM business_plan_revisions
    WHERE plan_id = ${planId} AND user_id = ${userId}
    ORDER BY revision_number DESC
  `));
  const versions = rowsOf<any>(await db.execute(sql`
    SELECT id, version_number, status, created_at, accepted_at, content_sha256
    FROM business_plan_versions
    WHERE plan_id = ${planId}
    ORDER BY version_number DESC
  `));

  return {
    plan: { id: plan.id, businessName: plan.businessName, tier: plan.tier },
    acceptedVersion: {
      id: acceptedVersion.id,
      versionNumber: Number(acceptedVersion.version_number),
    },
    sections: sections.map((section) => ({
      index: Number(section.section_index),
      title: section.section_title,
    })),
    revisions: revisions.map((revision) => ({
      id: revision.id,
      revisionNumber: Number(revision.revision_number),
      requestType: revision.request_type,
      instructions: revision.instructions,
      selectedSectionIndexes: revision.selected_section_indexes || [],
      status: revision.status,
      sourceVersionId: revision.source_version_id,
      targetVersionId: revision.target_version_id,
      consistencyReport: revision.consistency_report,
      lastError: revision.last_error,
      submittedAt: revision.submitted_at,
      startedAt: revision.started_at,
      completedAt: revision.completed_at,
      acceptedAt: revision.accepted_at,
      cancelledAt: revision.cancelled_at,
      updatedAt: revision.updated_at,
    })),
    versions: versions.map((version) => ({
      id: version.id,
      versionNumber: Number(version.version_number),
      status: version.status,
      createdAt: version.created_at,
      acceptedAt: version.accepted_at,
      contentSha256: version.content_sha256,
    })),
  };
}

export async function createRevisionForUser(
  planId: string,
  userId: string,
  input: {
    requestType: string;
    instructions: string;
    sectionIndexes: number[];
    idempotencyKey: string;
  },
) {
  const requestType = String(input.requestType || "").trim();
  const instructions = String(input.instructions || "").trim();
  const idempotencyKey = String(input.idempotencyKey || "").trim().slice(0, 100);
  const sectionIndexes = Array.from(
    new Set((Array.isArray(input.sectionIndexes) ? input.sectionIndexes : []).map(Number)),
  ).sort((a, b) => a - b);

  if (!REQUEST_TYPES.has(requestType)) {
    throw new RevisionServiceError(400, { error: "Invalid revision request type." });
  }
  if (instructions.length < 10 || instructions.length > 5000) {
    throw new RevisionServiceError(400, { error: "Revision instructions must be between 10 and 5,000 characters." });
  }
  if (!idempotencyKey || idempotencyKey.length < 8) {
    throw new RevisionServiceError(400, { error: "A valid idempotency key is required." });
  }
  if (sectionIndexes.length === 0 || sectionIndexes.some((index) => !Number.isInteger(index) || index < 0)) {
    throw new RevisionServiceError(400, { error: "Select at least one valid business-plan section." });
  }

  const plan = await storage.getBusinessPlan(planId);
  if (!plan || plan.userId !== userId) throw new RevisionServiceError(404, { error: "Business plan not found" });
  if (plan.status !== "completed") {
    throw new RevisionServiceError(409, { error: "This business plan is not ready for revision." });
  }

  const transactionalDb = db as any;
  return transactionalDb.transaction(async (tx: any) => {
    const planLock = firstRow<any>(await tx.execute(sql`
      SELECT id, user_id, status
      FROM business_plans
      WHERE id = ${planId}
      FOR UPDATE
    `));
    if (!planLock || planLock.user_id !== userId) {
      throw new RevisionServiceError(404, { error: "Business plan not found" });
    }
    if (planLock.status !== "completed") {
      throw new RevisionServiceError(409, { error: "This business plan is not ready for revision." });
    }

    const duplicate = firstRow<any>(await tx.execute(sql`
      SELECT id, revision_number, status
      FROM business_plan_revisions
      WHERE user_id = ${userId} AND idempotency_key = ${idempotencyKey}
      LIMIT 1
    `));
    if (duplicate) {
      return {
        id: duplicate.id,
        revisionNumber: Number(duplicate.revision_number),
        status: duplicate.status,
        duplicate: true,
      };
    }

    const active = firstRow<any>(await tx.execute(sql`
      SELECT id, revision_number, status
      FROM business_plan_revisions
      WHERE plan_id = ${planId}
        AND status IN ('submitted', 'in_progress', 'ready_for_review')
      LIMIT 1
      FOR UPDATE
    `));
    if (active) {
      throw new RevisionServiceError(409, {
        error: "This plan already has an active revision.",
        activeRevisionId: active.id,
        activeRevisionNumber: Number(active.revision_number),
        activeRevisionStatus: active.status,
      });
    }

    const sourceVersion = await ensureInitialVersion(tx, plan, userId);
    const availableSections = rowsOf<any>(await tx.execute(sql`
      SELECT section_index, section_title, content, content_sha256
      FROM business_plan_version_sections
      WHERE version_id = ${sourceVersion.id}
      ORDER BY section_index ASC
    `));
    const byIndex = new Map(availableSections.map((section) => [Number(section.section_index), section]));
    const invalidIndexes = sectionIndexes.filter((index) => !byIndex.has(index));
    if (invalidIndexes.length > 0) {
      throw new RevisionServiceError(400, {
        error: "One or more selected sections do not exist in this plan version.",
        invalidSectionIndexes: invalidIndexes,
      });
    }

    const nextRevisionNumber = Number(firstRow<any>(await tx.execute(sql`
      SELECT COALESCE(MAX(revision_number), 0) + 1 AS next_number
      FROM business_plan_revisions
      WHERE plan_id = ${planId}
    `))?.next_number || 1);

    const revision = firstRow<any>(await tx.execute(sql`
      INSERT INTO business_plan_revisions (
        id, plan_id, user_id, revision_number, source_version_id, request_type,
        instructions, selected_section_indexes, status, idempotency_key,
        submitted_at, updated_at
      ) VALUES (
        gen_random_uuid()::varchar, ${planId}, ${userId}, ${nextRevisionNumber},
        ${sourceVersion.id}, ${requestType}, ${instructions}, ${sectionIndexes},
        'submitted', ${idempotencyKey}, NOW(), NOW()
      )
      RETURNING *
    `));
    if (!revision) throw new Error("Failed to create revision request");

    for (const sectionIndex of sectionIndexes) {
      const section = byIndex.get(sectionIndex)!;
      await tx.execute(sql`
        INSERT INTO business_plan_revision_sections (
          id, revision_id, section_index, section_title, original_content,
          original_sha256, status, created_at, updated_at
        ) VALUES (
          gen_random_uuid()::varchar, ${revision.id}, ${sectionIndex}, ${section.section_title},
          ${section.content}, ${section.content_sha256 || sha256(section.content)}, 'pending', NOW(), NOW()
        )
      `);
    }

    await tx.execute(sql`
      INSERT INTO business_plan_revision_jobs (
        id, revision_id, status, available_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::varchar, ${revision.id}, 'queued', NOW(), NOW(), NOW()
      )
    `);

    await addEvent(tx, revision.id, planId, "customer", "revision_submitted", userId, {
      revisionNumber: nextRevisionNumber,
      requestType,
      sectionIndexes,
      sourceVersionNumber: Number(sourceVersion.version_number),
    });

    return {
      id: revision.id,
      revisionNumber: nextRevisionNumber,
      status: "submitted",
      duplicate: false,
    };
  });
}

export async function getRevisionDetailForUser(planId: string, revisionId: string, userId: string) {
  const revision = firstRow<any>(await db.execute(sql`
    SELECT r.*, sv.version_number AS source_version_number, tv.version_number AS target_version_number
    FROM business_plan_revisions r
    JOIN business_plan_versions sv ON sv.id = r.source_version_id
    LEFT JOIN business_plan_versions tv ON tv.id = r.target_version_id
    WHERE r.id = ${revisionId} AND r.plan_id = ${planId} AND r.user_id = ${userId}
    LIMIT 1
  `));
  if (!revision) throw new RevisionServiceError(404, { error: "Revision not found" });

  const sections = rowsOf<any>(await db.execute(sql`
    SELECT section_index, section_title, original_content, original_sha256,
           revised_content, revised_sha256, status, change_summary, updated_at
    FROM business_plan_revision_sections
    WHERE revision_id = ${revisionId}
    ORDER BY section_index ASC
  `));
  const events = rowsOf<any>(await db.execute(sql`
    SELECT actor_type, event_type, payload, created_at
    FROM business_plan_revision_events
    WHERE revision_id = ${revisionId}
    ORDER BY created_at ASC
  `));

  return {
    id: revision.id,
    revisionNumber: Number(revision.revision_number),
    status: revision.status,
    requestType: revision.request_type,
    instructions: revision.instructions,
    selectedSectionIndexes: revision.selected_section_indexes || [],
    sourceVersionId: revision.source_version_id,
    sourceVersionNumber: Number(revision.source_version_number),
    targetVersionId: revision.target_version_id,
    targetVersionNumber: revision.target_version_number ? Number(revision.target_version_number) : null,
    consistencyReport: revision.consistency_report,
    lastError: revision.last_error,
    submittedAt: revision.submitted_at,
    completedAt: revision.completed_at,
    acceptedAt: revision.accepted_at,
    sections: sections.map((section) => ({
      index: Number(section.section_index),
      title: section.section_title,
      originalContent: section.original_content,
      revisedContent: section.revised_content,
      status: section.status,
      changeSummary: section.change_summary,
      updatedAt: section.updated_at,
    })),
    events: events.map((event) => ({
      actorType: event.actor_type,
      eventType: event.event_type,
      payload: event.payload,
      createdAt: event.created_at,
    })),
  };
}

export async function getRevisionCandidateForUser(planId: string, revisionId: string, userId: string) {
  const revision = firstRow<any>(await db.execute(sql`
    SELECT target_version_id, status
    FROM business_plan_revisions
    WHERE id = ${revisionId} AND plan_id = ${planId} AND user_id = ${userId}
    LIMIT 1
  `));
  if (!revision) throw new RevisionServiceError(404, { error: "Revision not found" });
  if (!revision.target_version_id || !["ready_for_review", "accepted"].includes(revision.status)) {
    throw new RevisionServiceError(409, { error: "The revised version is not ready yet." });
  }
  const version = firstRow<any>(await db.execute(sql`
    SELECT * FROM business_plan_versions WHERE id = ${revision.target_version_id} LIMIT 1
  `));
  if (!version) throw new RevisionServiceError(404, { error: "Revision version not found" });
  return version;
}

export async function acceptRevisionForUser(planId: string, revisionId: string, userId: string) {
  const transactionalDb = db as any;
  return transactionalDb.transaction(async (tx: any) => {
    const plan = firstRow<any>(await tx.execute(sql`
      SELECT id, user_id
      FROM business_plans
      WHERE id = ${planId}
      FOR UPDATE
    `));
    if (!plan || plan.user_id !== userId) throw new RevisionServiceError(404, { error: "Business plan not found" });

    const revision = firstRow<any>(await tx.execute(sql`
      SELECT *
      FROM business_plan_revisions
      WHERE id = ${revisionId} AND plan_id = ${planId} AND user_id = ${userId}
      FOR UPDATE
    `));
    if (!revision) throw new RevisionServiceError(404, { error: "Revision not found" });
    if (revision.status === "accepted") {
      return { success: true, status: "accepted", revisionNumber: Number(revision.revision_number), duplicate: true };
    }
    if (revision.status !== "ready_for_review" || !revision.target_version_id) {
      throw new RevisionServiceError(409, { error: "This revision is not ready to accept." });
    }

    const currentAccepted = firstRow<any>(await tx.execute(sql`
      SELECT id, version_number
      FROM business_plan_versions
      WHERE plan_id = ${planId} AND status = 'accepted'
      FOR UPDATE
    `));
    if (!currentAccepted || currentAccepted.id !== revision.source_version_id) {
      throw new RevisionServiceError(409, {
        error: "The plan has changed since this revision was prepared. A fresh revision is required.",
        code: "REVISION_SOURCE_VERSION_STALE",
      });
    }

    const target = firstRow<any>(await tx.execute(sql`
      SELECT *
      FROM business_plan_versions
      WHERE id = ${revision.target_version_id} AND plan_id = ${planId} AND status = 'candidate'
      FOR UPDATE
    `));
    if (!target) throw new RevisionServiceError(409, { error: "Revision candidate is unavailable." });

    await tx.execute(sql`
      UPDATE business_plan_versions
      SET status = 'superseded'
      WHERE id = ${currentAccepted.id}
    `);
    await tx.execute(sql`
      UPDATE business_plan_versions
      SET status = 'accepted', accepted_at = NOW()
      WHERE id = ${target.id}
    `);
    await tx.execute(sql`
      UPDATE business_plans
      SET generated_content = ${target.generated_content},
          chart_data = ${target.chart_data},
          pdf_url = ${generatePDFUrl(planId)},
          status = 'completed',
          current_generation_stage = ${`Complete - revision ${Number(revision.revision_number)} accepted`}
      WHERE id = ${planId}
    `);
    await tx.execute(sql`
      UPDATE business_plan_revisions
      SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
      WHERE id = ${revisionId}
    `);
    await addEvent(tx, revisionId, planId, "customer", "revision_accepted", userId, {
      revisionNumber: Number(revision.revision_number),
      sourceVersionNumber: Number(currentAccepted.version_number),
      targetVersionNumber: Number(target.version_number),
    });

    return {
      success: true,
      status: "accepted",
      revisionNumber: Number(revision.revision_number),
      versionNumber: Number(target.version_number),
      duplicate: false,
    };
  });
}

export async function cancelQueuedRevisionForUser(planId: string, revisionId: string, userId: string) {
  const transactionalDb = db as any;
  return transactionalDb.transaction(async (tx: any) => {
    const revision = firstRow<any>(await tx.execute(sql`
      SELECT * FROM business_plan_revisions
      WHERE id = ${revisionId} AND plan_id = ${planId} AND user_id = ${userId}
      FOR UPDATE
    `));
    if (!revision) throw new RevisionServiceError(404, { error: "Revision not found" });
    if (revision.status === "cancelled") return { success: true, status: "cancelled", duplicate: true };

    if (revision.status === "submitted") {
      const job = firstRow<any>(await tx.execute(sql`
        SELECT status FROM business_plan_revision_jobs WHERE revision_id = ${revisionId} FOR UPDATE
      `));
      if (job && job.status !== "queued") {
        throw new RevisionServiceError(409, { error: "Revision processing has already started." });
      }
      await tx.execute(sql`
        UPDATE business_plan_revisions
        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
        WHERE id = ${revisionId}
      `);
      await tx.execute(sql`
        UPDATE business_plan_revision_jobs
        SET status = 'cancelled', updated_at = NOW()
        WHERE revision_id = ${revisionId} AND status = 'queued'
      `);
      await addEvent(tx, revisionId, planId, "customer", "revision_cancelled", userId, null);
      return { success: true, status: "cancelled", duplicate: false };
    }

    if (revision.status === "ready_for_review") {
      if (!revision.target_version_id) {
        throw new RevisionServiceError(409, { error: "Revision candidate is unavailable." });
      }
      const target = firstRow<any>(await tx.execute(sql`
        SELECT id, status
        FROM business_plan_versions
        WHERE id = ${revision.target_version_id} AND plan_id = ${planId}
        FOR UPDATE
      `));
      if (!target || target.status !== 'candidate') {
        throw new RevisionServiceError(409, { error: "Revision candidate is no longer discardable." });
      }
      await tx.execute(sql`
        UPDATE business_plan_versions
        SET status = 'superseded'
        WHERE id = ${revision.target_version_id} AND status = 'candidate'
      `);
      await tx.execute(sql`
        UPDATE business_plan_revisions
        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
        WHERE id = ${revisionId}
      `);
      await addEvent(tx, revisionId, planId, "customer", "revision_candidate_discarded", userId, {
        targetVersionId: revision.target_version_id,
      });
      return { success: true, status: "cancelled", duplicate: false };
    }

    throw new RevisionServiceError(409, {
      error: "Only a queued or ready-for-review revision can be discarded.",
    });
  });
}

async function claimNextRevisionJob(workerId: string): Promise<RevisionJob | undefined> {
  const leaseToken = crypto.randomUUID();
  const result = await db.execute(sql`
    WITH candidate AS (
      SELECT job.id
      FROM business_plan_revision_jobs job
      JOIN business_plan_revisions revision ON revision.id = job.revision_id
      WHERE job.available_at <= NOW()
        AND revision.status IN ('submitted', 'in_progress')
        AND (
          job.status = 'queued'
          OR (job.status = 'running' AND (job.lease_expires_at IS NULL OR job.lease_expires_at < NOW()))
        )
      ORDER BY job.created_at ASC
      FOR UPDATE OF job SKIP LOCKED
      LIMIT 1
    )
    UPDATE business_plan_revision_jobs job
    SET status = 'running',
        claim_count = claim_count + 1,
        lease_owner = ${workerId},
        lease_token = ${leaseToken},
        lease_expires_at = NOW() + (${LEASE_SECONDS} * INTERVAL '1 second'),
        heartbeat_at = NOW(),
        started_at = COALESCE(started_at, NOW()),
        updated_at = NOW()
    FROM candidate
    WHERE job.id = candidate.id
    RETURNING job.id, job.revision_id, job.lease_token, job.failure_count
  `);
  return firstRow<RevisionJob>(result);
}

async function heartbeatRevisionJob(job: RevisionJob): Promise<boolean> {
  const result = await db.execute(sql`
    UPDATE business_plan_revision_jobs
    SET heartbeat_at = NOW(),
        lease_expires_at = NOW() + (${LEASE_SECONDS} * INTERVAL '1 second'),
        updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token} AND status = 'running'
    RETURNING id
  `);
  return rowsOf(result).length === 1;
}

async function assertRevisionLease(tx: any, job: RevisionJob): Promise<void> {
  const lease = firstRow<any>(await tx.execute(sql`
    SELECT id FROM business_plan_revision_jobs
    WHERE id = ${job.id}
      AND lease_token = ${job.lease_token}
      AND status = 'running'
      AND lease_expires_at > NOW()
    FOR UPDATE
  `));
  if (!lease) throw new LostRevisionLeaseError();
}

async function generateRevisedSection(
  plan: any,
  sectionDefinition: any,
  sectionNumber: number,
  totalSections: number,
  originalContent: string,
  requestType: string,
  instructions: string,
): Promise<string> {
  const sectionSystemPrompt = getSectionSystemPrompt(
    plan.tier || "basic",
    sectionDefinition,
    sectionNumber,
    totalSections,
  );
  const prompt = `${sectionSystemPrompt}

${buildPlanFacts(plan)}

REVISION MODE:
You are revising an existing completed UK Innovator Founder business-plan section. This is not a new plan generation.

Revision type: ${requestType}
Customer instructions:
${instructions}

ORIGINAL SECTION:
${originalContent}

MANDATORY REVISION RULES:
1. Return the complete replacement narrative for this section only. Do not return an outline or commentary.
2. Preserve accurate facts and numbers from the original and canonical plan facts unless the customer's instructions explicitly update them.
3. Do not invent customers, contracts, revenue, patents, funding, research findings, staff, regulatory approvals or traction.
4. Where evidence is not supplied, use appropriately qualified language rather than fabricating certainty.
5. Keep terminology, dates, units and financial assumptions internally consistent.
6. Do not repeat the section heading; the platform adds it automatically.
7. Maintain an endorsement-ready professional UK English style.
8. Make the requested change materially, not cosmetically, while preserving unaffected information.
`;

  let lastError: any;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await callRevisionAI(prompt, 8000);
      const cleaned = stripDuplicateHeading(sectionDefinition.title, result);
      if (!cleaned) throw new Error("Revision model returned empty content");
      return sanitizeBusinessPlanOutputText(sanitizeBusinessPlanClaims(cleaned));
    } catch (error: any) {
      lastError = error;
      if (isPermanentProviderError(error) || error instanceof PermanentRevisionError || attempt === 2) break;
      await sleep(attempt * 1500);
    }
  }
  throw lastError || new Error("Revision generation failed");
}

function assembleCandidate(plan: any, sections: VersionSection[], versionNumber: number) {
  const tableOfContents = sections
    .map((section, index) => {
      const sectionName = section.section_title.replace(/^\d+\.\s*/, "");
      const sectionId = section.section_title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `${index + 1}. [${sectionName}](#${sectionId})`;
    })
    .join("\n");
  const generatedSections = sections.map(
    (section) => `\n\n## ${section.section_title}\n\n${section.content}`,
  );
  let content = `# BUSINESS PLAN: ${plan.businessName}
**Industry:** ${plan.industry}
**Tier:** ${String(plan.tier || "").toUpperCase()}
**Version:** ${versionNumber}
**Updated:** ${new Date().toLocaleDateString("en-GB")}

---

## TABLE OF CONTENTS

${tableOfContents}

---

${generatedSections.join("\n\n---\n\n")}`;

  content = sanitizeBusinessPlanOutputText(sanitizeBusinessPlanClaims(content));
  const chartDataObj = generateChartData(plan, content);
  const qualityReport = assessBusinessPlanQuality(plan, content, chartDataObj);
  content = sanitizeBusinessPlanOutputText(
    `${content}\n\n---\n\n${formatQualityReportMarkdown(qualityReport)}`,
  );

  return {
    content,
    chartData: JSON.stringify(chartDataObj),
    consistencyReport: {
      engine: "businessPlanQuality",
      checkedAt: new Date().toISOString(),
      report: qualityReport,
    },
  };
}

async function processRevisionJob(job: RevisionJob): Promise<void> {
  const revision = firstRow<any>(await db.execute(sql`
    SELECT * FROM business_plan_revisions WHERE id = ${job.revision_id} LIMIT 1
  `));
  if (!revision) throw new PermanentRevisionError("Revision record not found");
  if (["accepted", "cancelled", "ready_for_review"].includes(revision.status)) {
    await db.execute(sql`
      UPDATE business_plan_revision_jobs
      SET status = 'completed', completed_at = COALESCE(completed_at, NOW()),
          lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
          heartbeat_at = NULL, updated_at = NOW()
      WHERE id = ${job.id} AND lease_token = ${job.lease_token}
    `);
    return;
  }

  const plan = await storage.getBusinessPlan(revision.plan_id);
  if (!plan) throw new PermanentRevisionError("Business plan not found");
  const definitions = getSectionsForTier(plan.tier || "basic");
  const sourceSections = rowsOf<VersionSection>(await db.execute(sql`
    SELECT section_index, section_title, content, content_sha256
    FROM business_plan_version_sections
    WHERE version_id = ${revision.source_version_id}
    ORDER BY section_index ASC
  `));
  if (sourceSections.length !== definitions.length) {
    throw new PermanentRevisionError(
      `Source version section count mismatch: expected ${definitions.length}, found ${sourceSections.length}`,
    );
  }

  await db.execute(sql`
    UPDATE business_plan_revisions
    SET status = 'in_progress', started_at = COALESCE(started_at, NOW()), updated_at = NOW(), last_error = NULL
    WHERE id = ${revision.id} AND status IN ('submitted', 'in_progress')
  `);
  await addEvent(db, revision.id, revision.plan_id, "worker", "revision_processing_started", null, {
    workerVersion: REVISION_WORKER_VERSION,
    claimCount: Number((job as any).claim_count || 0),
  });

  let leaseAlive = true;
  let heartbeatBusy = false;
  const heartbeatTimer = setInterval(() => {
    if (heartbeatBusy || !leaseAlive) return;
    heartbeatBusy = true;
    void heartbeatRevisionJob(job)
      .then((ok) => {
        if (!ok) leaseAlive = false;
      })
      .catch((error) => console.error("[Revision Worker] Heartbeat failed", error))
      .finally(() => {
        heartbeatBusy = false;
      });
  }, HEARTBEAT_INTERVAL_MS);

  try {
    const requestedRows = rowsOf<any>(await db.execute(sql`
      SELECT * FROM business_plan_revision_sections
      WHERE revision_id = ${revision.id}
      ORDER BY section_index ASC
    `));

    for (const row of requestedRows) {
      if (!leaseAlive) throw new LostRevisionLeaseError();
      if (row.status === "completed" && row.revised_content) continue;
      const sectionIndex = Number(row.section_index);
      const definition = definitions[sectionIndex];
      if (!definition || definition.title !== row.section_title) {
        throw new PermanentRevisionError(`Revision section definition mismatch at index ${sectionIndex}`);
      }

      await db.execute(sql`
        UPDATE business_plan_revision_sections
        SET status = 'generating', updated_at = NOW()
        WHERE id = ${row.id} AND status <> 'completed'
      `);

      const revised = await generateRevisedSection(
        plan,
        definition,
        sectionIndex + 1,
        definitions.length,
        row.original_content,
        revision.request_type,
        revision.instructions,
      );
      if (!(await heartbeatRevisionJob(job))) throw new LostRevisionLeaseError();
      const revisedHash = sha256(revised);

      const transactionalDb = db as any;
      await transactionalDb.transaction(async (tx: any) => {
        await assertRevisionLease(tx, job);
        await tx.execute(sql`
          UPDATE business_plan_revision_sections
          SET revised_content = ${revised}, revised_sha256 = ${revisedHash},
              status = 'completed', change_summary = ${`Revised under ${revision.request_type}`}, updated_at = NOW()
          WHERE id = ${row.id}
        `);
      });
    }

    const completedRows = rowsOf<any>(await db.execute(sql`
      SELECT section_index, revised_content
      FROM business_plan_revision_sections
      WHERE revision_id = ${revision.id} AND status = 'completed'
    `));
    if (completedRows.length !== requestedRows.length) {
      throw new PermanentRevisionError("Not all requested sections completed successfully");
    }
    const revisedByIndex = new Map(
      completedRows.map((row) => [Number(row.section_index), String(row.revised_content)]),
    );
    const candidateSections = sourceSections.map((section) => ({
      section_index: Number(section.section_index),
      section_title: section.section_title,
      content: revisedByIndex.get(Number(section.section_index)) || section.content,
    }));

    const transactionalDb = db as any;
    await transactionalDb.transaction(async (tx: any) => {
      await assertRevisionLease(tx, job);
      const lockedRevision = firstRow<any>(await tx.execute(sql`
        SELECT * FROM business_plan_revisions WHERE id = ${revision.id} FOR UPDATE
      `));
      if (!lockedRevision || lockedRevision.status !== "in_progress") {
        throw new LostRevisionLeaseError();
      }

      if (lockedRevision.target_version_id) {
        const existingTarget = firstRow<any>(await tx.execute(sql`
          SELECT id FROM business_plan_versions WHERE id = ${lockedRevision.target_version_id}
        `));
        if (existingTarget) {
          await tx.execute(sql`
            UPDATE business_plan_revision_jobs
            SET status = 'completed', completed_at = COALESCE(completed_at, NOW()),
                lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                heartbeat_at = NULL, updated_at = NOW()
            WHERE id = ${job.id} AND lease_token = ${job.lease_token}
          `);
          return;
        }
      }

      const nextVersionNumber = Number(firstRow<any>(await tx.execute(sql`
        SELECT COALESCE(MAX(version_number), 0) + 1 AS next_number
        FROM business_plan_versions
        WHERE plan_id = ${revision.plan_id}
      `))?.next_number || 2);
      const assembled = assembleCandidate(plan, candidateSections, nextVersionNumber);
      const contentHash = sha256(assembled.content);
      const target = firstRow<any>(await tx.execute(sql`
        INSERT INTO business_plan_versions (
          id, plan_id, version_number, status, generated_content, chart_data,
          content_sha256, created_by_user_id, created_at
        ) VALUES (
          gen_random_uuid()::varchar, ${revision.plan_id}, ${nextVersionNumber}, 'candidate',
          ${assembled.content}, ${assembled.chartData}, ${contentHash}, ${revision.user_id}, NOW()
        )
        RETURNING *
      `));
      if (!target) throw new Error("Failed to create revision candidate version");

      for (const section of candidateSections) {
        await tx.execute(sql`
          INSERT INTO business_plan_version_sections (
            id, version_id, plan_id, section_index, section_title, content, content_sha256, created_at
          ) VALUES (
            gen_random_uuid()::varchar, ${target.id}, ${revision.plan_id}, ${section.section_index},
            ${section.section_title}, ${section.content}, ${sha256(section.content)}, NOW()
          )
        `);
      }

      const reportJson = JSON.stringify(assembled.consistencyReport);
      await tx.execute(sql`
        UPDATE business_plan_revisions
        SET target_version_id = ${target.id}, status = 'ready_for_review',
            consistency_report = ${reportJson}::jsonb, completed_at = NOW(), updated_at = NOW(), last_error = NULL
        WHERE id = ${revision.id}
      `);
      await tx.execute(sql`
        UPDATE business_plan_revision_jobs
        SET status = 'completed', completed_at = NOW(), last_error = NULL,
            lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
            heartbeat_at = NULL, updated_at = NOW()
        WHERE id = ${job.id} AND lease_token = ${job.lease_token}
      `);
      await addEvent(tx, revision.id, revision.plan_id, "worker", "revision_ready_for_review", null, {
        targetVersionNumber: nextVersionNumber,
        revisedSectionIndexes: Array.from(revisedByIndex.keys()),
        consistencyEngine: "businessPlanQuality",
      });
    });
  } finally {
    clearInterval(heartbeatTimer);
  }
}

async function markRevisionJobFailed(job: RevisionJob, error: any, permanent: boolean) {
  const message = normaliseError(error);
  const result = await db.execute(sql`
    UPDATE business_plan_revision_jobs
    SET status = 'failed', failure_count = failure_count + 1, last_error = ${message},
        failed_at = NOW(), lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
        heartbeat_at = NULL, updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token} AND status = 'running'
    RETURNING revision_id
  `);
  if (rowsOf(result).length !== 1) return;
  await db.execute(sql`
    UPDATE business_plan_revisions
    SET status = 'failed', last_error = ${message}, updated_at = NOW()
    WHERE id = ${job.revision_id} AND status = 'in_progress'
  `);
  const revision = firstRow<any>(await db.execute(sql`
    SELECT plan_id FROM business_plan_revisions WHERE id = ${job.revision_id}
  `));
  if (revision) {
    await addEvent(db, job.revision_id, revision.plan_id, "worker", "revision_failed", null, {
      permanent,
      message,
    });
  }
}

async function requeueRevisionJob(job: RevisionJob, error: any) {
  const message = normaliseError(error);
  const failureCount = Number(job.failure_count || 0) + 1;
  if (failureCount >= MAX_TRANSIENT_FAILURES) {
    await markRevisionJobFailed(job, error, false);
    return;
  }
  const delaySeconds = Math.min(180, 15 * Math.pow(2, Math.max(0, failureCount - 1)));
  await db.execute(sql`
    UPDATE business_plan_revision_jobs
    SET status = 'queued', failure_count = failure_count + 1, last_error = ${message},
        available_at = NOW() + (${delaySeconds} * INTERVAL '1 second'),
        lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
        heartbeat_at = NULL, updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token} AND status = 'running'
  `);
  await db.execute(sql`
    UPDATE business_plan_revisions
    SET status = 'submitted', last_error = ${message}, updated_at = NOW()
    WHERE id = ${job.revision_id} AND status = 'in_progress'
  `);
}

async function handleRevisionJob(job: RevisionJob) {
  try {
    await processRevisionJob(job);
  } catch (error: any) {
    if (error instanceof LostRevisionLeaseError) {
      console.warn(`[Revision Worker] Lease lost for ${job.revision_id}; another worker may resume`);
      return;
    }
    console.error(`[Revision Worker] Revision ${job.revision_id} failed`, error);
    if (error instanceof PermanentRevisionError || isPermanentProviderError(error)) {
      await markRevisionJobFailed(job, error, true);
    } else {
      await requeueRevisionJob(job, error);
    }
  }
}

let revisionWorkerStarted = false;

export function startBusinessPlanRevisionWorker(): void {
  if (revisionWorkerStarted || process.env.REVISION_WORKER_ENABLED === "false") return;
  revisionWorkerStarted = true;
  const workerId = [
    "revision",
    process.env.RAILWAY_REPLICA_ID,
    process.env.RAILWAY_DEPLOYMENT_ID,
    os.hostname(),
    process.pid,
    crypto.randomUUID().slice(0, 8),
  ]
    .filter(Boolean)
    .join(":")
    .slice(0, 240);
  console.log(`[Revision Worker] ${workerId} started`);

  const loop = async () => {
    while (true) {
      try {
        const job = await claimNextRevisionJob(workerId);
        if (!job) {
          await sleep(IDLE_POLL_MS);
          continue;
        }
        await handleRevisionJob(job);
      } catch (error: any) {
        if (error?.code === "42P01") {
          console.error("[Revision Worker] Revision tables are missing; production migration has not been applied");
          await sleep(10_000);
        } else {
          console.error("[Revision Worker] Worker loop error", error);
          await sleep(5_000);
        }
      }
    }
  };
  void loop();
}
