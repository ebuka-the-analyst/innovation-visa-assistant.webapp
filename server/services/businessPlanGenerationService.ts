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
import { sendPlanCompletionEmail } from "../email";

const GENERATOR_VERSION = "business-plan-v1-2026-08-16";
const LEASE_SECONDS = 120;
const HEARTBEAT_INTERVAL_MS = 20_000;
const IDLE_POLL_MS = 2_000;
const MAX_TRANSIENT_FAILURES = 5;

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export class GenerationStartError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly payload: Record<string, unknown>,
  ) {
    super(typeof payload.error === "string" ? payload.error : "Generation start failed");
    this.name = "GenerationStartError";
  }
}

class PermanentGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentGenerationError";
  }
}

class LostGenerationLeaseError extends Error {
  constructor() {
    super("Generation worker lease was lost");
    this.name = "LostGenerationLeaseError";
  }
}

type JobRow = {
  id: string;
  plan_id: string;
  status: string;
  lease_token: string;
  claim_count: number;
  failure_count: number;
  current_section: number;
  total_sections: number;
  generator_version: string;
};

type CheckpointRow = {
  section_index: number;
  section_title: string;
  content: string;
};

function rowsOf<T = any>(result: any): T[] {
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result?.rows)) return result.rows as T[];
  return [];
}

function firstRow<T = any>(result: any): T | undefined {
  return rowsOf<T>(result)[0];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normaliseError(error: any): string {
  const message = error?.message || String(error || "Unknown generation error");
  return message.slice(0, 4000);
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

async function callBusinessPlanAI(prompt: string, maxTokens = 8000): Promise<string> {
  const isLatestGptFamily = /^gpt-5/i.test(BUSINESS_PLAN_MODEL);

  if (isLatestGptFamily) {
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
    if (!content) {
      const error: any = new Error("OpenAI returned empty response");
      error.status = responseAny.status;
      error.incompleteDetails = responseAny.incomplete_details;
      throw error;
    }
    return content;
  }

  const response = await openaiClient.chat.completions.create({
    model: BUSINESS_PLAN_MODEL as any,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  } as any);
  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned empty response");
  return content;
}

function stripDuplicateSectionHeading(sectionTitle: string, sectionContent: string): string {
  const titleCore = sectionTitle.replace(/^\d+\.\s*/, "").toUpperCase().trim();
  const lines = sectionContent.split("\n");
  let startIndex = 0;

  for (let j = 0; j < Math.min(3, lines.length); j++) {
    const line = lines[j].trim();
    if (!line) {
      startIndex = j + 1;
      continue;
    }

    const lineCore = line
      .replace(/^#+\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/\*\*/g, "")
      .toUpperCase()
      .trim();

    if (lineCore === titleCore) {
      startIndex = j + 1;
    } else {
      break;
    }
  }

  return lines.slice(startIndex).join("\n").trim();
}

function getStageDescription(sectionNumber: number, total: number, title: string): string {
  const progress = (sectionNumber - 1) / Math.max(total, 1);
  if (sectionNumber <= 1) return `Analyzing - Section ${sectionNumber}/${total}: ${title}`;
  if (progress < 0.3) return `Analyzing - Section ${sectionNumber}/${total}: ${title}`;
  if (progress < 0.7) return `Building business plan - Section ${sectionNumber}/${total}: ${title}`;
  if (progress < 0.9) return `Proofreading - Section ${sectionNumber}/${total}: ${title}`;
  return `Finalizing content - Section ${sectionNumber}/${total}: ${title}`;
}

function buildSharedDataContext(plan: any): string {
  const ltvCacRatio =
    plan.customerAcquisitionCost > 0
      ? (plan.lifetimeValue / plan.customerAcquisitionCost).toFixed(1)
      : "N/A";

  return `
BUSINESS OVERVIEW:
- Name: ${plan.businessName}
- Industry: ${plan.industry}
- Innovation Stage: ${plan.innovationStage}
- Product Status: ${plan.productStatus}
${plan.existingCustomers ? `- Existing Customers: ${plan.existingCustomers}` : ""}
${plan.tractionEvidence ? `- Traction: ${plan.tractionEvidence}` : ""}

PROBLEM & SOLUTION:
${plan.problem}

INNOVATION & TECHNICAL ARCHITECTURE:
- Differentiation: ${plan.uniqueness}
- Technology Stack: ${plan.techStack}
- Data Architecture: ${plan.dataArchitecture}
- AI/ML Methodology: ${plan.aiMethodology}
- Compliance Design: ${plan.complianceDesign}
- IP Status: ${plan.patentStatus}

FOUNDER CREDENTIALS:
- Education: ${plan.founderEducation}
- Work History: ${plan.founderWorkHistory}
- Achievements: ${plan.founderAchievements}
- Relevant Projects: ${plan.relevantProjects}
- Additional Experience: ${plan.experience}

FINANCIAL MODEL:
- Initial Capital: £${plan.funding.toLocaleString()}
- Funding Sources: ${plan.fundingSources}
- Monthly Cashflow: ${plan.monthlyProjections}
- CAC: £${plan.customerAcquisitionCost.toLocaleString()}
- LTV: £${plan.lifetimeValue.toLocaleString()}
- LTV:CAC Ratio: ${ltvCacRatio}:1 ${parseFloat(ltvCacRatio) >= 3 ? "(MEETS >3:1 benchmark ✓)" : "(BELOW 3:1 - address this)"}
- Payback Period: ${plan.paybackPeriod} months
- Cost Breakdown: ${plan.detailedCosts}
- Revenue Model: ${plan.revenue}

COMPETITIVE ANALYSIS:
- Competitors: ${plan.competitors}
- Competitive Advantage: ${plan.competitiveDifferentiation}

MARKET VALIDATION:
- Customer Interviews: ${plan.customerInterviews}
${plan.lettersOfIntent ? `- Letters of Intent: ${plan.lettersOfIntent}` : ""}
- Willingness to Pay: ${plan.willingnessToPay}
- Market Size (TAM/SAM/SOM): ${plan.marketSize}

REGULATORY & COMPLIANCE:
- Requirements: ${plan.regulatoryRequirements}
- Timeline: ${plan.complianceTimeline}
- Budget: £${plan.complianceBudget.toLocaleString()}

SCALABILITY & GROWTH:
- Job Creation Target: ${plan.jobCreation} employees in 3 years
- Hiring Plan: ${plan.hiringPlan}
- Geographic Focus: ${plan.specificRegions}
- Expansion Strategy: ${plan.expansion}
${plan.internationalPlan ? `- International Plans: ${plan.internationalPlan}` : ""}
- 5-Year Vision: ${plan.vision}

ENDORSER STRATEGY:
- Target Endorser: ${plan.targetEndorser}
- Contact Points Plan: ${plan.contactPointsStrategy}`;
}

export async function startBusinessPlanGenerationForUser(
  planId: string,
  userId: string,
): Promise<{ success: true; message: string; status: string; queued: boolean }> {
  if (!planId) {
    throw new GenerationStartError(400, { error: "Plan ID is required" });
  }

  const transactionalDb = db as any;
  return transactionalDb.transaction(async (tx: any) => {
    const planResult = await tx.execute(sql`
      SELECT id, user_id, tier, status
      FROM business_plans
      WHERE id = ${planId}
      FOR UPDATE
    `);
    const plan = firstRow<any>(planResult);

    if (!plan || plan.user_id !== userId) {
      throw new GenerationStartError(404, { error: "Business plan not found" });
    }

    if (plan.status === "completed") {
      return {
        success: true as const,
        message: "Generation already completed",
        status: "completed",
        queued: false,
      };
    }

    if (plan.status === "generating") {
      await tx.execute(sql`
        INSERT INTO business_plan_generation_jobs (
          id, plan_id, status, available_at, generator_version, created_at, updated_at
        )
        VALUES (
          gen_random_uuid()::varchar, ${planId}, 'queued', NOW(), ${GENERATOR_VERSION}, NOW(), NOW()
        )
        ON CONFLICT (plan_id) DO NOTHING
      `);

      return {
        success: true as const,
        message: "Generation already queued or in progress",
        status: "generating",
        queued: true,
      };
    }

    const existingChargeResult = await tx.execute(sql`
      SELECT id
      FROM credit_transactions
      WHERE type = 'generation'
        AND reference_type = 'business_plan'
        AND reference_id = ${planId}
      LIMIT 1
    `);
    const hasExistingGenerationCharge = rowsOf(existingChargeResult).length > 0;

    const existingJobResult = await tx.execute(sql`
      SELECT id, status
      FROM business_plan_generation_jobs
      WHERE plan_id = ${planId}
      LIMIT 1
    `);
    const existingJob = firstRow<any>(existingJobResult);

    const isFreePlanGeneration = plan.tier === "free";
    const isRetryOfPreviouslyStartedGeneration =
      plan.status === "failed" && (hasExistingGenerationCharge || Boolean(existingJob));

    if (plan.status !== "paid" && !isRetryOfPreviouslyStartedGeneration) {
      throw new GenerationStartError(403, {
        error: "Payment verification required before generation",
        currentStatus: plan.status,
      });
    }

    // A legacy process may have deducted a credit before dying. The durable start
    // path treats an existing per-plan generation transaction as proof that this
    // plan has already been charged and never deducts a second credit.
    if (!isFreePlanGeneration && !hasExistingGenerationCharge) {
      const userResult = await tx.execute(sql`
        SELECT id, plan_credits, bonus_credits
        FROM users
        WHERE id = ${userId}
        FOR UPDATE
      `);
      const user = firstRow<any>(userResult);
      if (!user) throw new GenerationStartError(404, { error: "User not found" });

      const planCredits = Number(user.plan_credits || 0);
      const bonusCredits = Number(user.bonus_credits || 0);
      const totalCredits = planCredits + bonusCredits;
      if (totalCredits < 1) {
        throw new GenerationStartError(403, {
          error: "Insufficient credits. Please purchase additional credits or upgrade your plan.",
          creditsRequired: 1,
          creditsAvailable: totalCredits,
        });
      }

      const useBonus = bonusCredits >= 1;
      const newBonusCredits = useBonus ? bonusCredits - 1 : bonusCredits;
      const newPlanCredits = useBonus ? planCredits : planCredits - 1;
      const creditType = useBonus ? "bonus" : "plan";

      await tx.execute(sql`
        UPDATE users
        SET plan_credits = ${newPlanCredits}, bonus_credits = ${newBonusCredits}
        WHERE id = ${userId}
      `);

      await tx.execute(sql`
        INSERT INTO credit_transactions (
          id, user_id, type, credits_change, credits_type, balance_after,
          reference_type, reference_id, description
        ) VALUES (
          gen_random_uuid()::varchar, ${userId}, 'generation', -1, ${creditType},
          ${newPlanCredits + newBonusCredits}, 'business_plan', ${planId},
          'Business plan generation'
        )
      `);
    }

    await tx.execute(sql`
      UPDATE business_plans
      SET status = 'generating',
          current_generation_stage = 'Queued - preparing secure generation worker...'
      WHERE id = ${planId}
    `);

    await tx.execute(sql`
      INSERT INTO business_plan_generation_jobs (
        id, plan_id, status, available_at, generator_version, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::varchar, ${planId}, 'queued', NOW(), ${GENERATOR_VERSION}, NOW(), NOW()
      )
      ON CONFLICT (plan_id) DO UPDATE
      SET status = CASE
            WHEN business_plan_generation_jobs.status = 'completed' THEN business_plan_generation_jobs.status
            ELSE 'queued'
          END,
          available_at = NOW(),
          last_error = NULL,
          failed_at = NULL,
          updated_at = NOW()
    `);

    return {
      success: true as const,
      message: "Generation queued",
      status: "generating",
      queued: true,
    };
  });
}

async function claimNextJob(workerId: string): Promise<JobRow | undefined> {
  const leaseToken = crypto.randomUUID();
  const result = await db.execute(sql`
    WITH candidate AS (
      SELECT id
      FROM business_plan_generation_jobs
      WHERE available_at <= NOW()
        AND (
          status = 'queued'
          OR (
            status = 'running'
            AND (lease_expires_at IS NULL OR lease_expires_at < NOW())
          )
        )
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE business_plan_generation_jobs AS job
    SET status = 'running',
        lease_owner = ${workerId},
        lease_token = ${leaseToken},
        lease_expires_at = NOW() + (${LEASE_SECONDS} * INTERVAL '1 second'),
        heartbeat_at = NOW(),
        started_at = COALESCE(started_at, NOW()),
        claim_count = claim_count + 1,
        updated_at = NOW()
    FROM candidate
    WHERE job.id = candidate.id
    RETURNING job.id, job.plan_id, job.status, job.lease_token, job.claim_count,
              job.failure_count, job.current_section, job.total_sections, job.generator_version
  `);
  return firstRow<JobRow>(result);
}

async function heartbeatJob(job: JobRow): Promise<boolean> {
  const result = await db.execute(sql`
    UPDATE business_plan_generation_jobs
    SET heartbeat_at = NOW(),
        lease_expires_at = NOW() + (${LEASE_SECONDS} * INTERVAL '1 second'),
        updated_at = NOW()
    WHERE id = ${job.id}
      AND lease_token = ${job.lease_token}
      AND status = 'running'
    RETURNING id
  `);
  return rowsOf(result).length === 1;
}

async function updatePlanStage(job: JobRow, stage: string, sectionNumber: number, total: number) {
  const result = await db.execute(sql`
    UPDATE business_plans AS plan
    SET current_generation_stage = ${stage}
    WHERE plan.id = ${job.plan_id}
      AND EXISTS (
        SELECT 1
        FROM business_plan_generation_jobs AS j
        WHERE j.id = ${job.id}
          AND j.lease_token = ${job.lease_token}
          AND j.status = 'running'
          AND j.lease_expires_at > NOW()
      )
    RETURNING plan.id
  `);
  if (rowsOf(result).length !== 1) throw new LostGenerationLeaseError();

  await db.execute(sql`
    UPDATE business_plan_generation_jobs
    SET current_section = ${sectionNumber},
        total_sections = ${total},
        updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token} AND status = 'running'
  `);
}

async function loadCheckpoints(planId: string): Promise<Map<number, CheckpointRow>> {
  const result = await db.execute(sql`
    SELECT section_index, section_title, content
    FROM business_plan_generation_sections
    WHERE plan_id = ${planId}
    ORDER BY section_index ASC
  `);
  return new Map(rowsOf<CheckpointRow>(result).map((row) => [Number(row.section_index), row]));
}

async function persistCheckpoint(
  job: JobRow,
  sectionIndex: number,
  sectionTitle: string,
  content: string,
): Promise<void> {
  const contentHash = crypto.createHash("sha256").update(content).digest("hex");
  const transactionalDb = db as any;

  await transactionalDb.transaction(async (tx: any) => {
    const leaseResult = await tx.execute(sql`
      SELECT id
      FROM business_plan_generation_jobs
      WHERE id = ${job.id}
        AND lease_token = ${job.lease_token}
        AND status = 'running'
        AND lease_expires_at > NOW()
      FOR UPDATE
    `);
    if (rowsOf(leaseResult).length !== 1) throw new LostGenerationLeaseError();

    await tx.execute(sql`
      INSERT INTO business_plan_generation_sections (
        id, plan_id, section_index, section_title, content, content_sha256,
        generator_version, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::varchar, ${job.plan_id}, ${sectionIndex}, ${sectionTitle}, ${content},
        ${contentHash}, ${GENERATOR_VERSION}, NOW(), NOW()
      )
      ON CONFLICT (plan_id, section_index) DO NOTHING
    `);

    const checkpointResult = await tx.execute(sql`
      SELECT section_title, content_sha256, generator_version
      FROM business_plan_generation_sections
      WHERE plan_id = ${job.plan_id} AND section_index = ${sectionIndex}
      FOR UPDATE
    `);
    const checkpoint = firstRow<any>(checkpointResult);
    if (
      !checkpoint ||
      checkpoint.section_title !== sectionTitle ||
      checkpoint.generator_version !== GENERATOR_VERSION ||
      checkpoint.content_sha256 !== contentHash
    ) {
      throw new PermanentGenerationError(
        `Checkpoint conflict for plan ${job.plan_id} section ${sectionIndex + 1}`,
      );
    }

    await tx.execute(sql`
      UPDATE business_plan_generation_jobs
      SET current_section = GREATEST(current_section, ${sectionIndex + 1}),
          updated_at = NOW()
      WHERE id = ${job.id} AND lease_token = ${job.lease_token}
    `);
  });
}

async function generateSectionWithRetries(prompt: string, sectionLabel: string): Promise<string> {
  let lastError: any;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const content = await callBusinessPlanAI(prompt, 8000);
      if (!content.trim()) throw new Error("OpenAI returned empty section content");
      return content;
    } catch (error: any) {
      lastError = error;
      console.error(`[Generation Worker] ${sectionLabel} AI attempt ${attempt} failed`, {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        type: error?.type,
      });
      if (isPermanentProviderError(error) || attempt === 2) break;
      await sleep(attempt * 1500);
    }
  }
  throw lastError || new Error(`${sectionLabel} generation failed`);
}

async function markJobFailed(job: JobRow, error: any, permanent: boolean): Promise<void> {
  const message = normaliseError(error);
  const result = await db.execute(sql`
    UPDATE business_plan_generation_jobs
    SET status = 'failed',
        failure_count = failure_count + 1,
        last_error = ${message},
        failed_at = NOW(),
        lease_owner = NULL,
        lease_token = NULL,
        lease_expires_at = NULL,
        heartbeat_at = NULL,
        updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token} AND status = 'running'
    RETURNING failure_count
  `);
  const updated = firstRow<any>(result);
  if (!updated) return;

  const userFacingStage =
    error instanceof PermanentGenerationError
      ? "Generation paused - an internal consistency check failed; support has been notified"
      : permanent
        ? "Generation failed - AI model configuration needs attention"
        : "Generation failed after automatic retries - support has been notified";

  await db.execute(sql`
    UPDATE business_plans
    SET status = 'failed',
        current_generation_stage = ${userFacingStage}
    WHERE id = ${job.plan_id}
  `);
}

async function requeueTransientFailure(job: JobRow, error: any): Promise<void> {
  const message = normaliseError(error);
  const nextFailureCount = Number(job.failure_count || 0) + 1;
  if (nextFailureCount >= MAX_TRANSIENT_FAILURES) {
    await markJobFailed(job, error, false);
    return;
  }

  const delaySeconds = Math.min(300, 15 * Math.pow(2, Math.max(0, nextFailureCount - 1)));
  const result = await db.execute(sql`
    UPDATE business_plan_generation_jobs
    SET status = 'queued',
        failure_count = failure_count + 1,
        last_error = ${message},
        available_at = NOW() + (${delaySeconds} * INTERVAL '1 second'),
        lease_owner = NULL,
        lease_token = NULL,
        lease_expires_at = NULL,
        heartbeat_at = NULL,
        updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token} AND status = 'running'
    RETURNING id
  `);

  if (rowsOf(result).length === 1) {
    await db.execute(sql`
      UPDATE business_plans
      SET current_generation_stage = 'Generation temporarily paused - retrying automatically...'
      WHERE id = ${job.plan_id}
    `);
  }
}

async function finalisePlan(job: JobRow, plan: any, sections: ReturnType<typeof getSectionsForTier>) {
  const checkpoints = await loadCheckpoints(job.plan_id);
  if (checkpoints.size !== sections.length) {
    throw new PermanentGenerationError(`Cannot finalise plan: expected ${sections.length} checkpoints, found ${checkpoints.size}`);
  }

  const generatedSections = sections.map((section, index) => {
    const checkpoint = checkpoints.get(index);
    if (!checkpoint) throw new PermanentGenerationError(`Missing checkpoint ${index + 1}`);
    return `\n\n## ${section.title}\n\n${checkpoint.content}`;
  });

  await updatePlanStage(job, "Finalizing - generating your PDF document...", sections.length, sections.length);

  const tableOfContents = sections
    .map((section, idx) => {
      const sectionName = section.title.replace(/^\d+\.\s*/, "");
      const sectionId = section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `${idx + 1}. [${sectionName}](#${sectionId})`;
    })
    .join("\n");

  let generatedContent = `# BUSINESS PLAN: ${plan.businessName}
**Industry:** ${plan.industry}
**Tier:** ${plan.tier?.toUpperCase()}
**Generated:** ${new Date().toLocaleDateString("en-GB")}

---

## TABLE OF CONTENTS

${tableOfContents}

---

${generatedSections.join("\n\n---\n\n")}`;

  await updatePlanStage(job, "Reviewing plan against endorser-readiness benchmark...", sections.length, sections.length);

  generatedContent = sanitizeBusinessPlanOutputText(sanitizeBusinessPlanClaims(generatedContent));
  const chartDataObj = generateChartData(plan, generatedContent);
  const chartData = JSON.stringify(chartDataObj);
  const qualityReport = assessBusinessPlanQuality(plan, generatedContent, chartDataObj);
  generatedContent = `${generatedContent}\n\n---\n\n${formatQualityReportMarkdown(qualityReport)}`;
  generatedContent = sanitizeBusinessPlanOutputText(generatedContent);
  const pdfUrl = generatePDFUrl(job.plan_id);

  const transactionalDb = db as any;
  await transactionalDb.transaction(async (tx: any) => {
    const leaseResult = await tx.execute(sql`
      SELECT id
      FROM business_plan_generation_jobs
      WHERE id = ${job.id}
        AND lease_token = ${job.lease_token}
        AND status = 'running'
        AND lease_expires_at > NOW()
      FOR UPDATE
    `);
    if (rowsOf(leaseResult).length !== 1) throw new LostGenerationLeaseError();

    await tx.execute(sql`
      UPDATE business_plans
      SET status = 'completed',
          generated_content = ${generatedContent},
          chart_data = ${chartData},
          pdf_url = ${pdfUrl},
          current_generation_stage = 'Complete - your business plan is ready!'
      WHERE id = ${job.plan_id}
    `);

    await tx.execute(sql`
      UPDATE business_plan_generation_jobs
      SET status = 'completed',
          current_section = ${sections.length},
          total_sections = ${sections.length},
          completed_at = NOW(),
          lease_owner = NULL,
          lease_token = NULL,
          lease_expires_at = NULL,
          heartbeat_at = NULL,
          last_error = NULL,
          updated_at = NOW()
      WHERE id = ${job.id} AND lease_token = ${job.lease_token}
    `);
  });

  try {
    if (plan.userId) {
      const user = await storage.getUser(plan.userId);
      if (user?.email) {
        await sendPlanCompletionEmail(
          user.email,
          user.firstName || "there",
          plan.businessName,
          job.plan_id,
        );
      }
    }
  } catch (emailError) {
    console.error("[Generation Worker] Failed to send completion email", emailError);
  }
}

async function processClaimedJob(job: JobRow): Promise<void> {
  const plan = await storage.getBusinessPlan(job.plan_id);
  if (!plan) {
    await markJobFailed(job, new Error("Business plan not found"), true);
    return;
  }
  if (plan.status === "completed") {
    await db.execute(sql`
      UPDATE business_plan_generation_jobs
      SET status = 'completed', completed_at = COALESCE(completed_at, NOW()),
          lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
          heartbeat_at = NULL, updated_at = NOW()
      WHERE id = ${job.id} AND lease_token = ${job.lease_token}
    `);
    return;
  }

  const sections = getSectionsForTier(plan.tier || "basic");
  const sharedDataContext = buildSharedDataContext(plan);
  const checkpoints = await loadCheckpoints(job.plan_id);

  if (job.generator_version !== GENERATOR_VERSION && checkpoints.size > 0) {
    throw new PermanentGenerationError(
      `Generation version mismatch for resumable plan ${job.plan_id}: job=${job.generator_version}, worker=${GENERATOR_VERSION}`,
    );
  }

  await db.execute(sql`
    UPDATE business_plan_generation_jobs
    SET total_sections = ${sections.length}, updated_at = NOW()
    WHERE id = ${job.id} AND lease_token = ${job.lease_token}
  `);

  let leaseAlive = true;
  let heartbeatBusy = false;
  const heartbeatTimer = setInterval(() => {
    if (heartbeatBusy || !leaseAlive) return;
    heartbeatBusy = true;
    void heartbeatJob(job)
      .then((ok) => {
        if (!ok) leaseAlive = false;
      })
      .catch((error) => {
        console.error("[Generation Worker] Heartbeat failed", error);
      })
      .finally(() => {
        heartbeatBusy = false;
      });
  }, HEARTBEAT_INTERVAL_MS);

  try {
    for (let i = 0; i < sections.length; i++) {
      if (!leaseAlive) throw new LostGenerationLeaseError();

      const existing = checkpoints.get(i);
      if (existing) {
        if (existing.section_title !== sections[i].title) {
          throw new PermanentGenerationError(
            `Checkpoint section mismatch at index ${i}: stored '${existing.section_title}', expected '${sections[i].title}'`,
          );
        }
        continue;
      }

      const section = sections[i];
      const sectionNumber = i + 1;
      await updatePlanStage(
        job,
        getStageDescription(sectionNumber, sections.length, section.title),
        sectionNumber,
        sections.length,
      );

      console.log(`[Generation Worker] Plan ${job.plan_id}: section ${sectionNumber}/${sections.length} ${section.title}`);

      const sectionSystemPrompt = getSectionSystemPrompt(
        plan.tier || "basic",
        section,
        sectionNumber,
        sections.length,
      );
      const sectionUserPrompt = `${sharedDataContext}

Write the complete narrative for: ${section.title}

Remember: Write FULL prose content for this section. No outlines or placeholders. Use ALL relevant data above.`;
      const rawContent = await generateSectionWithRetries(
        `${sectionSystemPrompt}\n\n${sectionUserPrompt}`,
        `section ${sectionNumber}/${sections.length}`,
      );

      const heartbeatOk = await heartbeatJob(job);
      if (!heartbeatOk) throw new LostGenerationLeaseError();

      const cleanContent = stripDuplicateSectionHeading(section.title, rawContent);
      await persistCheckpoint(job, i, section.title, cleanContent);
      checkpoints.set(i, {
        section_index: i,
        section_title: section.title,
        content: cleanContent,
      });
      console.log(`[Generation Worker] Plan ${job.plan_id}: checkpointed section ${sectionNumber}/${sections.length}`);
    }

    await finalisePlan(job, plan, sections);
  } finally {
    clearInterval(heartbeatTimer);
  }
}

async function handleClaimedJob(job: JobRow): Promise<void> {
  try {
    await processClaimedJob(job);
  } catch (error: any) {
    if (error instanceof LostGenerationLeaseError) {
      console.warn(`[Generation Worker] Lease lost for job ${job.id}; another worker may resume it`);
      return;
    }

    console.error(`[Generation Worker] Job ${job.id} failed`, {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
    });

    if (error instanceof PermanentGenerationError || isPermanentProviderError(error)) {
      await markJobFailed(job, error, true);
    } else {
      await requeueTransientFailure(job, error);
    }
  }
}

let workerStarted = false;

export function startBusinessPlanGenerationWorker(): void {
  if (workerStarted || process.env.GENERATION_WORKER_ENABLED === "false") return;
  workerStarted = true;

  const workerId = [
    process.env.RAILWAY_REPLICA_ID,
    process.env.RAILWAY_DEPLOYMENT_ID,
    os.hostname(),
    process.pid,
    crypto.randomUUID().slice(0, 8),
  ]
    .filter(Boolean)
    .join(":")
    .slice(0, 240);

  console.log(`[Generation Worker] ${workerId} started`);

  // Do not install SIGTERM/SIGINT handlers here. The platform should retain its
  // normal process-termination semantics. If the container dies mid-section, the
  // persisted lease expires and another worker resumes from the last checkpoint.
  const loop = async () => {
    while (true) {
      try {
        const job = await claimNextJob(workerId);
        if (!job) {
          await sleep(IDLE_POLL_MS);
          continue;
        }
        await handleClaimedJob(job);
      } catch (error: any) {
        if (error?.code === "42P01") {
          console.error("[Generation Worker] Queue tables are missing; production migration has not been applied");
          await sleep(10_000);
        } else {
          console.error("[Generation Worker] Worker loop error", error);
          await sleep(5_000);
        }
      }
    }
  };

  void loop();
}
