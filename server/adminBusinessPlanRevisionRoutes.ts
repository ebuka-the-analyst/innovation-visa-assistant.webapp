import type { Express, Request, Response, NextFunction } from "express";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { requireAdmin } from "./auth";

function rowsOf<T = any>(result: any): T[] {
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result?.rows)) return result.rows as T[];
  return [];
}

function firstRow<T = any>(result: any): T | undefined {
  return rowsOf<T>(result)[0];
}

function adminUserId(req: Request): string | null {
  return String((req.user as any)?.id || "").trim() || null;
}

function mutationOriginGuard(req: Request, res: Response, next: NextFunction) {
  const origin = String(req.get("origin") || "").trim();
  if (!origin) return next();
  try {
    const originUrl = new URL(origin);
    const forwardedHost = String(req.get("x-forwarded-host") || req.get("host") || "")
      .split(",")[0]
      .trim();
    if (!forwardedHost || originUrl.host !== forwardedHost) {
      return res.status(403).json({ error: "Cross-origin admin mutation blocked." });
    }
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
  return next();
}

function normaliseStatus(value: unknown): string | null {
  const status = String(value || "").trim();
  if (!status || status === "all") return null;
  const allowed = new Set([
    "submitted",
    "in_progress",
    "ready_for_review",
    "accepted",
    "cancelled",
    "failed",
  ]);
  return allowed.has(status) ? status : null;
}

async function appendAdminEvent(
  executor: any,
  revisionId: string,
  planId: string,
  adminId: string,
  eventType: string,
  payload: Record<string, unknown> | null = null,
) {
  const payloadJson = payload ? JSON.stringify(payload) : null;
  await executor.execute(sql`
    INSERT INTO business_plan_revision_events (
      id, revision_id, plan_id, actor_user_id, actor_type, event_type, payload, created_at
    ) VALUES (
      gen_random_uuid()::varchar, ${revisionId}, ${planId}, ${adminId},
      'admin', ${eventType}, ${payloadJson}::jsonb, NOW()
    )
  `);
}

export function registerAdminBusinessPlanRevisionRoutes(app: Express): void {
  app.get(
    "/api/admin/business-plan-revisions",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const status = normaliseStatus(req.query.status);
        const search = String(req.query.search || "").trim().slice(0, 200);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const offset = Math.max(0, Number(req.query.offset) || 0);
        const searchPattern = `%${search}%`;

        const list = rowsOf<any>(await db.execute(sql`
          SELECT
            r.id,
            r.plan_id,
            r.user_id,
            r.revision_number,
            r.request_type,
            r.instructions,
            r.selected_section_indexes,
            r.status,
            r.source_version_id,
            r.target_version_id,
            r.assigned_admin_id,
            r.last_error,
            r.submitted_at,
            r.started_at,
            r.completed_at,
            r.accepted_at,
            r.cancelled_at,
            r.updated_at,
            p.business_name,
            p.tier,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            assigned.email AS assigned_admin_email,
            source.version_number AS source_version_number,
            target.version_number AS target_version_number,
            job.status AS job_status,
            job.claim_count,
            job.failure_count,
            job.heartbeat_at,
            job.lease_expires_at,
            job.last_error AS job_last_error
          FROM business_plan_revisions r
          JOIN business_plans p ON p.id = r.plan_id
          JOIN users u ON u.id = r.user_id
          JOIN business_plan_versions source ON source.id = r.source_version_id
          LEFT JOIN business_plan_versions target ON target.id = r.target_version_id
          LEFT JOIN users assigned ON assigned.id = r.assigned_admin_id
          LEFT JOIN business_plan_revision_jobs job ON job.revision_id = r.id
          WHERE (${status}::text IS NULL OR r.status = ${status})
            AND (
              ${search} = ''
              OR p.business_name ILIKE ${searchPattern}
              OR u.email ILIKE ${searchPattern}
              OR r.id ILIKE ${searchPattern}
              OR r.plan_id ILIKE ${searchPattern}
            )
          ORDER BY
            CASE r.status
              WHEN 'failed' THEN 0
              WHEN 'submitted' THEN 1
              WHEN 'in_progress' THEN 2
              WHEN 'ready_for_review' THEN 3
              ELSE 4
            END,
            r.updated_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `));

        const count = firstRow<any>(await db.execute(sql`
          SELECT COUNT(*)::int AS total
          FROM business_plan_revisions r
          JOIN business_plans p ON p.id = r.plan_id
          JOIN users u ON u.id = r.user_id
          WHERE (${status}::text IS NULL OR r.status = ${status})
            AND (
              ${search} = ''
              OR p.business_name ILIKE ${searchPattern}
              OR u.email ILIKE ${searchPattern}
              OR r.id ILIKE ${searchPattern}
              OR r.plan_id ILIKE ${searchPattern}
            )
        `));

        const counts = rowsOf<any>(await db.execute(sql`
          SELECT status, COUNT(*)::int AS count
          FROM business_plan_revisions
          GROUP BY status
          ORDER BY status
        `));

        return res.json({
          revisions: list.map((row) => ({
            id: row.id,
            planId: row.plan_id,
            userId: row.user_id,
            revisionNumber: Number(row.revision_number),
            requestType: row.request_type,
            instructions: row.instructions,
            selectedSectionIndexes: row.selected_section_indexes || [],
            status: row.status,
            sourceVersionId: row.source_version_id,
            targetVersionId: row.target_version_id,
            sourceVersionNumber: Number(row.source_version_number),
            targetVersionNumber: row.target_version_number ? Number(row.target_version_number) : null,
            assignedAdminId: row.assigned_admin_id,
            assignedAdminEmail: row.assigned_admin_email,
            lastError: row.last_error,
            submittedAt: row.submitted_at,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            acceptedAt: row.accepted_at,
            cancelledAt: row.cancelled_at,
            updatedAt: row.updated_at,
            businessName: row.business_name,
            tier: row.tier,
            userEmail: row.user_email,
            userName: [row.user_first_name, row.user_last_name].filter(Boolean).join(" ") || null,
            job: row.job_status
              ? {
                  status: row.job_status,
                  claimCount: Number(row.claim_count || 0),
                  failureCount: Number(row.failure_count || 0),
                  heartbeatAt: row.heartbeat_at,
                  leaseExpiresAt: row.lease_expires_at,
                  lastError: row.job_last_error,
                }
              : null,
          })),
          total: Number(count?.total || 0),
          limit,
          offset,
          counts: Object.fromEntries(counts.map((row) => [row.status, Number(row.count)])),
        });
      } catch (error) {
        console.error("[Admin Revision Queue] List failed", error);
        return res.status(500).json({ error: "Unable to load revision queue." });
      }
    },
  );

  app.get(
    "/api/admin/business-plan-revisions/:revisionId",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const revision = firstRow<any>(await db.execute(sql`
          SELECT
            r.*,
            p.business_name,
            p.tier,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            assigned.email AS assigned_admin_email,
            source.version_number AS source_version_number,
            target.version_number AS target_version_number,
            job.status AS job_status,
            job.claim_count,
            job.failure_count,
            job.heartbeat_at,
            job.lease_expires_at,
            job.last_error AS job_last_error
          FROM business_plan_revisions r
          JOIN business_plans p ON p.id = r.plan_id
          JOIN users u ON u.id = r.user_id
          JOIN business_plan_versions source ON source.id = r.source_version_id
          LEFT JOIN business_plan_versions target ON target.id = r.target_version_id
          LEFT JOIN users assigned ON assigned.id = r.assigned_admin_id
          LEFT JOIN business_plan_revision_jobs job ON job.revision_id = r.id
          WHERE r.id = ${req.params.revisionId}
          LIMIT 1
        `));
        if (!revision) return res.status(404).json({ error: "Revision not found" });

        const sections = rowsOf<any>(await db.execute(sql`
          SELECT section_index, section_title, original_content, revised_content,
                 status, change_summary, updated_at
          FROM business_plan_revision_sections
          WHERE revision_id = ${req.params.revisionId}
          ORDER BY section_index ASC
        `));
        const events = rowsOf<any>(await db.execute(sql`
          SELECT e.actor_type, e.actor_user_id, e.event_type, e.payload, e.created_at,
                 actor.email AS actor_email
          FROM business_plan_revision_events e
          LEFT JOIN users actor ON actor.id = e.actor_user_id
          WHERE e.revision_id = ${req.params.revisionId}
          ORDER BY e.created_at ASC
        `));

        return res.json({
          id: revision.id,
          planId: revision.plan_id,
          userId: revision.user_id,
          revisionNumber: Number(revision.revision_number),
          requestType: revision.request_type,
          instructions: revision.instructions,
          selectedSectionIndexes: revision.selected_section_indexes || [],
          status: revision.status,
          sourceVersionId: revision.source_version_id,
          targetVersionId: revision.target_version_id,
          sourceVersionNumber: Number(revision.source_version_number),
          targetVersionNumber: revision.target_version_number ? Number(revision.target_version_number) : null,
          consistencyReport: revision.consistency_report,
          assignedAdminId: revision.assigned_admin_id,
          assignedAdminEmail: revision.assigned_admin_email,
          lastError: revision.last_error,
          submittedAt: revision.submitted_at,
          startedAt: revision.started_at,
          completedAt: revision.completed_at,
          acceptedAt: revision.accepted_at,
          cancelledAt: revision.cancelled_at,
          updatedAt: revision.updated_at,
          businessName: revision.business_name,
          tier: revision.tier,
          userEmail: revision.user_email,
          userName: [revision.user_first_name, revision.user_last_name].filter(Boolean).join(" ") || null,
          job: revision.job_status
            ? {
                status: revision.job_status,
                claimCount: Number(revision.claim_count || 0),
                failureCount: Number(revision.failure_count || 0),
                heartbeatAt: revision.heartbeat_at,
                leaseExpiresAt: revision.lease_expires_at,
                lastError: revision.job_last_error,
              }
            : null,
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
            actorUserId: event.actor_user_id,
            actorEmail: event.actor_email,
            eventType: event.event_type,
            payload: event.payload,
            createdAt: event.created_at,
          })),
        });
      } catch (error) {
        console.error("[Admin Revision Queue] Detail failed", error);
        return res.status(500).json({ error: "Unable to load revision details." });
      }
    },
  );

  app.post(
    "/api/admin/business-plan-revisions/:revisionId/assign-to-me",
    requireAdmin,
    mutationOriginGuard,
    async (req: Request, res: Response) => {
      const adminId = adminUserId(req);
      if (!adminId) return res.status(403).json({ error: "Admin access required" });
      const transactionalDb = db as any;
      try {
        const result = await transactionalDb.transaction(async (tx: any) => {
          const revision = firstRow<any>(await tx.execute(sql`
            SELECT id, plan_id, assigned_admin_id
            FROM business_plan_revisions
            WHERE id = ${req.params.revisionId}
            FOR UPDATE
          `));
          if (!revision) return null;
          await tx.execute(sql`
            UPDATE business_plan_revisions
            SET assigned_admin_id = ${adminId}, updated_at = NOW()
            WHERE id = ${req.params.revisionId}
          `);
          await appendAdminEvent(tx, revision.id, revision.plan_id, adminId, "revision_assigned", {
            previousAdminId: revision.assigned_admin_id,
            assignedAdminId: adminId,
          });
          return { success: true, assignedAdminId: adminId };
        });
        if (!result) return res.status(404).json({ error: "Revision not found" });
        return res.json(result);
      } catch (error) {
        console.error("[Admin Revision Queue] Assignment failed", error);
        return res.status(500).json({ error: "Unable to assign revision." });
      }
    },
  );

  app.post(
    "/api/admin/business-plan-revisions/:revisionId/retry",
    requireAdmin,
    mutationOriginGuard,
    async (req: Request, res: Response) => {
      const adminId = adminUserId(req);
      if (!adminId) return res.status(403).json({ error: "Admin access required" });
      const transactionalDb = db as any;
      try {
        const result = await transactionalDb.transaction(async (tx: any) => {
          const revision = firstRow<any>(await tx.execute(sql`
            SELECT *
            FROM business_plan_revisions
            WHERE id = ${req.params.revisionId}
            FOR UPDATE
          `));
          if (!revision) return { statusCode: 404, error: "Revision not found" };
          if (revision.status !== "failed") {
            return { statusCode: 409, error: "Only a failed revision can be retried." };
          }
          if (revision.target_version_id) {
            return {
              statusCode: 409,
              error: "This failed revision already has a candidate version and requires manual investigation.",
            };
          }

          const job = firstRow<any>(await tx.execute(sql`
            SELECT id, status
            FROM business_plan_revision_jobs
            WHERE revision_id = ${revision.id}
            FOR UPDATE
          `));
          if (!job) return { statusCode: 409, error: "Revision job is missing." };

          await tx.execute(sql`
            UPDATE business_plan_revision_sections
            SET status = 'pending', revised_content = NULL, revised_sha256 = NULL,
                change_summary = NULL, updated_at = NOW()
            WHERE revision_id = ${revision.id} AND status IN ('failed', 'generating')
          `);
          await tx.execute(sql`
            UPDATE business_plan_revisions
            SET status = 'submitted', last_error = NULL, updated_at = NOW()
            WHERE id = ${revision.id}
          `);
          await tx.execute(sql`
            UPDATE business_plan_revision_jobs
            SET status = 'queued', failure_count = 0, available_at = NOW(),
                lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                heartbeat_at = NULL, completed_at = NULL, failed_at = NULL,
                last_error = NULL, updated_at = NOW()
            WHERE id = ${job.id}
          `);
          await appendAdminEvent(tx, revision.id, revision.plan_id, adminId, "revision_retry_queued", {
            priorJobStatus: job.status,
          });
          return { statusCode: 200, success: true, status: "submitted" };
        });
        if (result.statusCode !== 200) {
          return res.status(result.statusCode).json({ error: result.error });
        }
        return res.json(result);
      } catch (error) {
        console.error("[Admin Revision Queue] Retry failed", error);
        return res.status(500).json({ error: "Unable to retry revision." });
      }
    },
  );
}
