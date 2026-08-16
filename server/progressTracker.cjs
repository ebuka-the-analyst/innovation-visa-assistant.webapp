const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/progress-tracker";
const STORAGE_PREFIX = "journey:";
const application = express.application;

const JOURNEY_STEP_IDS = new Set([
  "questionnaire",
  "innovation-score",
  "eligibility",
  "business-plan",
  "financial-projections",
  "market-research",
  "endorser-comparison",
  "pitch-coach",
  "interview-prep",
  "document-organizer",
  "cover-letter",
  "evidence-prep",
  "final-review",
  "compliance-check",
]);

const REQUIRED_DOCUMENTS = [
  "Passport Copy",
  "Proof of Identity",
  "Criminal Records Check",
  "Business Registration",
  "Memorandum of Association",
  "Business Plan",
  "Financial Projections",
  "Bank Statements (3 months)",
  "Investment Evidence",
  "CV/Resume",
];

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id);
}

function storageId(stepId) {
  return `${STORAGE_PREFIX}${stepId}`;
}

function publicStepId(toolId) {
  const value = String(toolId || "");
  return value.startsWith(STORAGE_PREFIX) ? value.slice(STORAGE_PREFIX.length) : value;
}

function clampPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function safeQuery(db, text, params = [], fallback = []) {
  try {
    const result = await db.query(text, params);
    return result.rows || fallback;
  } catch (error) {
    console.warn("[PROGRESS TRACKER] Optional query unavailable:", error?.message || error);
    return fallback;
  }
}

function normaliseStoredRow(row) {
  return {
    stepId: publicStepId(row.tool_id),
    completionPercent: clampPercent(row.completion_percent),
    status: row.status || "in_progress",
    progressData: safeJson(row.progress_data, {}),
    updatedAt: row.updated_at || null,
  };
}

async function handleGetProgress(req, res) {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const db = getPool();
    const journeyStorageIds = Array.from(JOURNEY_STEP_IDS, storageId);

    const [storedRows, planRows, documentRows, interviewRows, reviewRows] = await Promise.all([
      safeQuery(
        db,
        `SELECT DISTINCT ON (tool_id)
                tool_id, progress_data, completion_percent, status, updated_at
           FROM tool_progress
          WHERE user_id = $1
            AND tool_id = ANY($2::text[])
          ORDER BY tool_id, updated_at DESC`,
        [userId, journeyStorageIds],
      ),
      safeQuery(
        db,
        `SELECT id, business_name, status, pdf_url, created_at
           FROM business_plans
          WHERE user_id = $1
          ORDER BY created_at DESC`,
        [userId],
      ),
      safeQuery(
        db,
        `SELECT id, name, category, status, created_at, updated_at
           FROM user_documents
          WHERE user_id = $1
          ORDER BY created_at DESC`,
        [userId],
      ),
      safeQuery(
        db,
        `SELECT id, status, session_type, created_at, completed_at
           FROM interview_sessions
          WHERE user_id = $1
          ORDER BY created_at DESC`,
        [userId],
      ),
      safeQuery(
        db,
        `SELECT id, document_name, document_type, status, overall_score, created_at, completed_at
           FROM document_reviews
          WHERE user_id = $1
          ORDER BY created_at DESC`,
        [userId],
      ),
    ]);

    const completedPlans = planRows.filter((row) => String(row.status || "").toLowerCase() === "completed");
    const activePlans = planRows.filter((row) => ["pending", "processing", "generating", "in_progress", "in-progress"].includes(String(row.status || "").toLowerCase()));
    const latestPlan = planRows[0] || null;

    const uploadedRequiredNames = new Set(
      documentRows
        .filter((row) => REQUIRED_DOCUMENTS.includes(String(row.name || "")))
        .map((row) => String(row.name)),
    );
    const requiredUploaded = uploadedRequiredNames.size;
    const documentCompletionPercent = REQUIRED_DOCUMENTS.length
      ? Math.round((requiredUploaded / REQUIRED_DOCUMENTS.length) * 100)
      : 0;

    const completedInterviews = interviewRows.filter((row) => ["completed", "reviewed"].includes(String(row.status || "").toLowerCase()));
    const activeInterviews = interviewRows.filter((row) => ["in_progress", "in-progress", "processing"].includes(String(row.status || "").toLowerCase()));

    const completedReviews = reviewRows.filter((row) => String(row.status || "").toLowerCase() === "completed");
    const activeReviews = reviewRows.filter((row) => ["pending", "processing"].includes(String(row.status || "").toLowerCase()));
    const failedReviews = reviewRows.filter((row) => String(row.status || "").toLowerCase() === "failed");

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      generatedAt: new Date().toISOString(),
      storedProgress: storedRows.map(normaliseStoredRow),
      authoritative: {
        businessPlans: {
          total: planRows.length,
          completed: completedPlans.length,
          active: activePlans.length,
          latest: latestPlan
            ? {
                id: latestPlan.id,
                businessName: latestPlan.business_name || "Unnamed business plan",
                status: latestPlan.status || "unknown",
                pdfUrl: latestPlan.pdf_url || null,
                createdAt: latestPlan.created_at || null,
                updatedAt: latestPlan.updated_at || null,
              }
            : null,
        },
        documents: {
          totalUploaded: documentRows.length,
          requiredUploaded,
          requiredTotal: REQUIRED_DOCUMENTS.length,
          completionPercent: documentCompletionPercent,
          missingRequired: REQUIRED_DOCUMENTS.filter((name) => !uploadedRequiredNames.has(name)),
        },
        interviews: {
          total: interviewRows.length,
          completed: completedInterviews.length,
          active: activeInterviews.length,
          latestStatus: interviewRows[0]?.status || null,
        },
        documentReviews: {
          total: reviewRows.length,
          completed: completedReviews.length,
          active: activeReviews.length,
          failed: failedReviews.length,
          latest: reviewRows[0]
            ? {
                id: reviewRows[0].id,
                documentName: reviewRows[0].document_name,
                status: reviewRows[0].status,
                overallScore: reviewRows[0].overall_score,
                completedAt: reviewRows[0].completed_at || null,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("[PROGRESS TRACKER] Failed to load:", error);
    return res.status(500).json({ error: "Failed to load progress tracker" });
  }
}

async function handleSaveStep(req, res) {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stepId = String(req.params.stepId || "");
    if (!JOURNEY_STEP_IDS.has(stepId)) {
      return res.status(400).json({ error: "Unknown progress step" });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const completionPercent = clampPercent(body.completionPercent);
    const requestedStatus = String(body.status || "").toLowerCase();
    const progressData = body.progressData && typeof body.progressData === "object"
      ? body.progressData
      : {};
    const progressSource = String(progressData.source || "auto").toLowerCase();

    if (progressSource === "manual" && stepId !== "endorser-comparison") {
      return res.status(400).json({ error: "Manual completion is not available for this step" });
    }

    const status = requestedStatus === "completed" || completionPercent >= 100
      ? "completed"
      : requestedStatus === "not_started" || completionPercent <= 0
        ? "not_started"
        : "in_progress";

    const serialised = JSON.stringify(progressData);
    if (serialised.length > 20000) {
      return res.status(413).json({ error: "Progress metadata is too large" });
    }

    const userId = req.user.id;
    const db = getPool();
    const toolId = storageId(stepId);
    const existing = await db.query(
      `SELECT id, progress_data, completion_percent, status, updated_at
         FROM tool_progress
        WHERE user_id = $1 AND tool_id = $2
        ORDER BY updated_at DESC
        LIMIT 1`,
      [userId, toolId],
    );

    const current = existing.rows[0] || null;
    const currentData = safeJson(current?.progress_data, {});
    if (current && currentData.source === "manual" && progressSource !== "manual") {
      res.setHeader("Cache-Control", "no-store");
      return res.json({
        success: true,
        preservedManualProgress: true,
        progress: normaliseStoredRow({ ...current, tool_id: toolId }),
      });
    }

    if (current) {
      await db.query(
        `UPDATE tool_progress
            SET progress_data = $1::jsonb,
                completion_percent = $2,
                status = $3,
                updated_at = NOW()
          WHERE user_id = $4 AND tool_id = $5`,
        [serialised, completionPercent, status, userId, toolId],
      );
    } else {
      await db.query(
        `INSERT INTO tool_progress (user_id, tool_id, progress_data, completion_percent, status, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, $4, $5, NOW(), NOW())`,
        [userId, toolId, serialised, completionPercent, status],
      );
    }

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      success: true,
      progress: {
        stepId,
        completionPercent,
        status,
        progressData,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[PROGRESS TRACKER] Failed to save step:", error);
    return res.status(500).json({ error: "Failed to save progress" });
  }
}

function installRoutes(app, originalGet, originalPost) {
  if (app.__progressTrackerRoutesInstalled) return;
  Object.defineProperty(app, "__progressTrackerRoutesInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  originalGet.call(app, ROUTE, handleGetProgress);
  originalPost.call(app, `${ROUTE}/steps/:stepId`, handleSaveStep);
}

if (!application.__progressTrackerHookInstalled) {
  const originalGet = application.get;
  const originalPost = application.post;

  Object.defineProperty(application, "__progressTrackerHookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function progressTrackerGet(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;
    if (isRouteRegistration) installRoutes(this, originalGet, originalPost);
    return originalGet.call(this, path, ...handlers);
  };

  application.post = function progressTrackerPost(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;
    if (isRouteRegistration) installRoutes(this, originalGet, originalPost);
    return originalPost.call(this, path, ...handlers);
  };
}
