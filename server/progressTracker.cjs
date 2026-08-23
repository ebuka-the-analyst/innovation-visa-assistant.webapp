const { Pool } = require("pg");
const {
  getBusinessPlanStatusForUser,
  isAuthenticated,
} = require("./businessPlanStatus.cjs");

const ROUTE = "/api/progress-tracker";
const STORAGE_PREFIX = "journey:";
const READINESS_RULESET_VERSION = "2026-08-23.1";

const JOURNEY_STEPS = [
  ["questionnaire", true],
  ["innovation-score", true],
  ["eligibility", true],
  ["business-plan", true],
  ["financial-projections", true],
  ["market-research", false],
  ["endorser-comparison", true],
  ["pitch-coach", true],
  ["interview-prep", false],
  ["document-organizer", true],
  ["cover-letter", false],
  ["evidence-prep", false],
  ["final-review", true],
  ["compliance-check", true],
];
const JOURNEY_STEP_IDS = new Set(JOURNEY_STEPS.map(([id]) => id));
const REQUIRED_STEP_IDS = new Set(JOURNEY_STEPS.filter(([, required]) => required).map(([id]) => id));

const TRACKED_TOOL_IDS = [
  "innovation-score",
  "eligibility-validator",
  "financial-projections",
  "market-research",
  "pitch-coach",
  "cover-letter-builder",
  "evidence-collection",
  "compliance-checker",
];

const TOOL_RUN_TO_STEP = {
  "innovation-score": "innovation-score",
  "eligibility-validator": "eligibility",
  "financial-projections": "financial-projections",
  "market-research": "market-research",
  "pitch-coach": "pitch-coach",
  "cover-letter-builder": "cover-letter",
  "evidence-collection": "evidence-prep",
  "compliance-checker": "compliance-check",
};

const TOOL_MAX_AGE_DAYS = {
  "innovation-score": 180,
  "eligibility-validator": 180,
  "financial-projections": 180,
  "market-research": 180,
  "pitch-coach": 180,
  "cover-letter-builder": 365,
  "evidence-collection": 180,
  "compliance-checker": 90,
};

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

const REQUIRED_EVIDENCE_POLICY = {
  questionnaire: "A completed generated business plan proves the submitted questionnaire reached generation.",
  "innovation-score": "A fresh completed Innovation Score run with a durable result payload is required.",
  eligibility: "A fresh durable Eligibility Validator result must positively confirm eligibility, not merely show that the tool was opened.",
  "business-plan": "A completed business plan owned by this account is required.",
  "financial-projections": "Complete structured financial fields in the completed plan or a fresh durable Financial Projections run are required.",
  "endorser-comparison": "The account owner must explicitly confirm the endorser decision in the tracker.",
  "pitch-coach": "A fresh completed Pitch Coach run with a durable result payload is required.",
  "document-organizer": "Every required document must be satisfied by an uploaded document or an accepted generated platform artefact.",
  "final-review": "At least one completed final document review is required.",
  "compliance-check": "A fresh completed Compliance Checker run with a durable result payload is required.",
};

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
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
  try { return JSON.parse(value); } catch { return fallback; }
}

function substantiveObject(value) {
  const payload = safeJson(value, {});
  return payload && typeof payload === "object" && !Array.isArray(payload) && Object.keys(payload).length > 0;
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

function meaningfulText(value, minLength = 8) {
  const text = String(value ?? "").trim();
  if (text.length < minLength) return false;
  return !/^(?:none|n\/a|not applicable|not yet|no|0)$/i.test(text);
}

function affirmativeEvidenceText(value, minLength = 8) {
  const text = String(value ?? "").trim();
  if (!meaningfulText(text, minLength)) return false;
  return !/(?:no customer interviews?|no interviews?|zero interviews?|not yet interviewed|no willingness to pay)/i.test(text);
}

function buildPlanEvidence(row) {
  if (!row || String(row.status || "").toLowerCase() !== "completed") return null;

  const financialChecks = [
    ["monthly projections", meaningfulText(row.monthly_projections, 20)],
    ["customer acquisition cost", Number(row.cac) > 0],
    ["lifetime value", Number(row.ltv) > 0],
    ["payback period", Number(row.payback_period) > 0],
    ["funding sources", meaningfulText(row.funding_sources, 8)],
    ["detailed costs", meaningfulText(row.detailed_costs, 20)],
  ];
  const financialCompleted = financialChecks.filter(([, passed]) => passed).length;

  const marketChecks = [
    ["competitor analysis", meaningfulText(row.competitors, 15)],
    ["competitive differentiation", meaningfulText(row.competitive_differentiation, 15)],
    ["market size", meaningfulText(row.market_size, 8)],
    ["customer interviews", affirmativeEvidenceText(row.customer_interviews, 8)],
    ["willingness-to-pay evidence", affirmativeEvidenceText(row.willingness_to_pay, 8)],
  ];
  const marketCompleted = marketChecks.filter(([, passed]) => passed).length;
  const hasDemandSignal = Boolean(marketChecks[3][1] || marketChecks[4][1]);

  return {
    planId: row.id,
    financial: {
      satisfied: financialCompleted === financialChecks.length,
      completedSignals: financialCompleted,
      totalSignals: financialChecks.length,
      missing: financialChecks.filter(([, passed]) => !passed).map(([label]) => label),
    },
    market: {
      satisfied: marketCompleted >= 4 && hasDemandSignal,
      percent: Math.round((marketCompleted / marketChecks.length) * 100),
      completedSignals: marketCompleted,
      totalSignals: marketChecks.length,
      missing: marketChecks.filter(([, passed]) => !passed).map(([label]) => label),
    },
  };
}

function ageDays(value) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

function freshnessForRun(row) {
  const maxAgeDays = TOOL_MAX_AGE_DAYS[row.tool_id] || 180;
  const completedAt = row.completed_at || row.updated_at || null;
  const age = ageDays(completedAt);
  if (age === null) return { freshness: "unknown", ageDays: null, maxAgeDays, stale: true };
  return { freshness: age > maxAgeDays ? "stale" : "current", ageDays: age, maxAgeDays, stale: age > maxAgeDays };
}

function eligibilityPayloadPasses(payload) {
  const data = safeJson(payload, {});
  if (!substantiveObject(data)) return false;
  for (const key of ["eligible", "isEligible", "overallEligible", "passed", "allEligible"]) {
    if (data[key] === true) return true;
  }
  const containers = [data.groups, data.criteria, data.checks, data.requirements].filter((value) => value && typeof value === "object");
  for (const container of containers) {
    const values = Array.isArray(container) ? container : Object.values(container);
    const passed = values.filter((entry) => {
      if (entry === true) return true;
      if (!entry || typeof entry !== "object") return false;
      return entry.passed === true || entry.met === true || entry.eligible === true || entry.status === "passed" || entry.status === "complete";
    }).length;
    if (passed >= 5) return true;
  }
  return false;
}

function toolRunAudit(row) {
  if (!row) return null;
  const fresh = freshnessForRun(row);
  const hasResult = Boolean(row.result_sha256) && substantiveObject(row.result_payload);
  const eligibilityPass = row.tool_id === "eligibility-validator" ? eligibilityPayloadPasses(row.result_payload) : true;
  return {
    runId: row.id,
    toolId: row.tool_id,
    completedAt: row.completed_at || null,
    updatedAt: row.updated_at || null,
    registryVersion: row.registry_version || null,
    policyVersion: row.policy_version || null,
    validationState: row.validation_state || null,
    resultSha256: row.result_sha256 || null,
    hasDurableResult: hasResult,
    eligibilityPass,
    rulesetVersion: READINESS_RULESET_VERSION,
    ...fresh,
  };
}

function buildToolRunEvidence(rows) {
  const latestByTool = {};
  for (const row of rows) {
    const toolId = String(row.tool_id || "");
    if (!toolId || latestByTool[toolId]) continue;
    latestByTool[toolId] = { ...toolRunAudit(row), resultPayload: safeJson(row.result_payload, {}) };
  }
  return { latestByTool };
}

function statusFromPercent(percent) {
  if (percent >= 100) return "completed";
  if (percent > 0) return "in_progress";
  return "not_started";
}

function milestone(id, required, percent, source, detail, audit = {}, options = {}) {
  const safePercent = clampPercent(percent);
  return {
    id,
    required,
    completionPercent: safePercent,
    status: options.status || statusFromPercent(safePercent),
    source,
    detail,
    updatedAt: options.updatedAt || audit?.completedAt || audit?.updatedAt || null,
    needsRevalidation: Boolean(options.needsRevalidation),
    evidencePolicy: required ? REQUIRED_EVIDENCE_POLICY[id] || null : null,
    audit: {
      rulesetVersion: READINESS_RULESET_VERSION,
      ...audit,
    },
  };
}

function storedFallback(id, required, stored) {
  if (!stored) return milestone(id, required, 0, "none", "No durable progress evidence is recorded yet.");
  const source = stored.progressData?.source === "manual" ? "manual" : "synced";
  const originalPercent = clampPercent(stored.completionPercent);
  const allowedManual = id === "endorser-comparison" && source === "manual";
  if (allowedManual && String(stored.status) === "completed" && originalPercent >= 100) {
    return milestone(id, required, 100, "manual", stored.progressData?.detail || "You explicitly confirmed this endorser decision.", {
      recordId: storageId(id),
      completedAt: stored.updatedAt,
    });
  }

  if (required && originalPercent >= 100) {
    return milestone(
      id,
      required,
      95,
      source,
      "Previous account/browser progress is preserved, but a current durable evidence record is required before this milestone can count as complete.",
      { recordId: storageId(id), completedAt: stored.updatedAt },
      { status: "in_progress", needsRevalidation: true, updatedAt: stored.updatedAt },
    );
  }

  return milestone(
    id,
    required,
    Math.min(originalPercent, required ? 95 : 100),
    source,
    stored.progressData?.detail || "Saved account progress is available.",
    { recordId: storageId(id), completedAt: stored.updatedAt },
    { updatedAt: stored.updatedAt },
  );
}

function durableToolMilestone(id, required, run, stored, completionDetail) {
  if (!run) return storedFallback(id, required, stored);
  const audit = toolRunAudit(run);
  const payloadValid = audit.hasDurableResult && (run.tool_id !== "eligibility-validator" || audit.eligibilityPass);
  if (!payloadValid) {
    return milestone(
      id,
      required,
      95,
      "tool-run",
      run.tool_id === "eligibility-validator"
        ? "A durable Eligibility Validator run exists, but its saved result does not positively prove all required eligibility groups. Re-run the validator to re-establish readiness."
        : "A completed tool run exists, but it does not contain the durable result payload/hash required by the current readiness rules.",
      audit,
      { status: "in_progress", needsRevalidation: true },
    );
  }
  if (audit.stale) {
    return milestone(
      id,
      required,
      95,
      "tool-run",
      `The durable ${run.tool_id} result is older than the ${audit.maxAgeDays}-day readiness window and needs revalidation.`,
      audit,
      { status: "in_progress", needsRevalidation: true },
    );
  }
  return milestone(id, required, 100, "tool-run", completionDetail, audit);
}

function buildMilestones({ storedRows, planStatus, planEvidence, documents, interviews, reviews, toolRuns }) {
  const storedByStep = new Map(storedRows.map((row) => [row.stepId, row]));
  const latestRun = (toolId) => toolRuns.find((row) => row.tool_id === toolId) || null;
  const completedPlan = planStatus.latestCompleted || null;
  const milestones = [];

  milestones.push(completedPlan
    ? milestone("questionnaire", true, 100, "database", "A completed generated business plan confirms the submitted questionnaire reached generation.", {
        recordId: completedPlan.id,
        recordType: "business_plan",
        completedAt: completedPlan.created_at || null,
      })
    : storedFallback("questionnaire", true, storedByStep.get("questionnaire")));

  milestones.push(durableToolMilestone(
    "innovation-score", true, latestRun("innovation-score"), storedByStep.get("innovation-score"),
    "A fresh completed Innovation Score run with a durable result is recorded for this account.",
  ));

  milestones.push(durableToolMilestone(
    "eligibility", true, latestRun("eligibility-validator"), storedByStep.get("eligibility"),
    "A fresh durable Eligibility Validator result positively confirms the required eligibility groups.",
  ));

  milestones.push(completedPlan
    ? milestone("business-plan", true, 100, "database", "A completed business plan owned by this account is recorded in production.", {
        recordId: completedPlan.id,
        recordType: "business_plan",
        completedAt: completedPlan.created_at || null,
      })
    : storedFallback("business-plan", true, storedByStep.get("business-plan")));

  if (planEvidence?.financial?.satisfied) {
    milestones.push(milestone("financial-projections", true, 100, "plan", `The completed business plan contains all ${planEvidence.financial.totalSignals} structured financial signals required by the readiness rules.`, {
      recordId: planEvidence.planId,
      recordType: "business_plan",
      completedAt: completedPlan?.created_at || null,
    }));
  } else {
    milestones.push(durableToolMilestone(
      "financial-projections", true, latestRun("financial-projections"), storedByStep.get("financial-projections"),
      "A fresh completed Financial Projections run with a durable result is recorded.",
    ));
  }

  if (planEvidence?.market?.satisfied) {
    milestones.push(milestone("market-research", false, 100, "plan", `The completed plan contains ${planEvidence.market.completedSignals} of ${planEvidence.market.totalSignals} substantive market-validation signals, including a demand signal.`, {
      recordId: planEvidence.planId,
      recordType: "business_plan",
      completedAt: completedPlan?.created_at || null,
    }));
  } else {
    milestones.push(durableToolMilestone(
      "market-research", false, latestRun("market-research"), storedByStep.get("market-research"),
      "A completed Market Research run with a durable result is recorded.",
    ));
  }

  milestones.push(storedFallback("endorser-comparison", true, storedByStep.get("endorser-comparison")));

  milestones.push(durableToolMilestone(
    "pitch-coach", true, latestRun("pitch-coach"), storedByStep.get("pitch-coach"),
    "A fresh completed Pitch Coach run with a durable result is recorded.",
  ));

  milestones.push(interviews.completed > 0
    ? milestone("interview-prep", false, 100, "database", `${interviews.completed} completed interview preparation session${interviews.completed === 1 ? "" : "s"} are recorded.`, {
        recordId: interviews.latestCompletedId || null,
        recordType: "interview_session",
        completedAt: interviews.latestCompletedAt || null,
      })
    : storedFallback("interview-prep", false, storedByStep.get("interview-prep")));

  milestones.push(documents.requiredTotal > 0 && documents.requiredSatisfied >= documents.requiredTotal
    ? milestone("document-organizer", true, 100, "database", `All ${documents.requiredTotal} required document requirements are satisfied.`, {
        recordType: "document_register",
        completedAt: documents.latestUpdatedAt || null,
      })
    : milestone(
        "document-organizer", true, Math.round((documents.requiredSatisfied / Math.max(documents.requiredTotal, 1)) * 100), "database",
        `${documents.requiredSatisfied} of ${documents.requiredTotal} required document requirements are satisfied.`,
        { recordType: "document_register", completedAt: documents.latestUpdatedAt || null },
      ));

  milestones.push(durableToolMilestone(
    "cover-letter", false, latestRun("cover-letter-builder"), storedByStep.get("cover-letter"),
    "A completed Cover Letter Builder run with a durable result is recorded.",
  ));
  milestones.push(durableToolMilestone(
    "evidence-prep", false, latestRun("evidence-collection"), storedByStep.get("evidence-prep"),
    "A completed Evidence Collection run with a durable result is recorded.",
  ));

  milestones.push(reviews.completed > 0
    ? milestone("final-review", true, 100, "database", `${reviews.completed} completed final document review${reviews.completed === 1 ? "" : "s"} are recorded.`, {
        recordId: reviews.latest?.id || null,
        recordType: "document_review",
        completedAt: reviews.latest?.completedAt || null,
      })
    : storedFallback("final-review", true, storedByStep.get("final-review")));

  milestones.push(durableToolMilestone(
    "compliance-check", true, latestRun("compliance-checker"), storedByStep.get("compliance-check"),
    "A fresh completed Compliance Checker run with a durable result is recorded.",
  ));

  return milestones;
}

function readinessSummary(milestones) {
  const required = milestones.filter((item) => item.required);
  const optional = milestones.filter((item) => !item.required);
  const requiredCompleted = required.filter((item) => item.status === "completed").length;
  const optionalCompleted = optional.filter((item) => item.status === "completed").length;
  const requiredReadiness = required.length
    ? Math.round(required.reduce((sum, item) => sum + (item.status === "completed" ? 100 : item.completionPercent), 0) / required.length)
    : 0;
  const overallPreparation = milestones.length
    ? Math.round(milestones.reduce((sum, item) => sum + (item.status === "completed" ? 100 : item.completionPercent), 0) / milestones.length)
    : 0;
  return {
    requiredCompleted,
    requiredTotal: required.length,
    requiredRemaining: required.length - requiredCompleted,
    requiredReadiness,
    optionalCompleted,
    optionalTotal: optional.length,
    overallPreparation,
    applicationReady: required.length > 0 && requiredCompleted === required.length,
    revalidationRequired: required.filter((item) => item.needsRevalidation).map((item) => item.id),
  };
}

async function handleGetProgress(req, res) {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "Authentication required" });

    const userId = req.user.id;
    const db = getPool();
    const journeyStorageIds = Array.from(JOURNEY_STEP_IDS, storageId);
    const planStatus = await getBusinessPlanStatusForUser(userId, { db });

    const [storedRaw, documentRows, interviewRows, reviewRows, toolRunRows] = await Promise.all([
      safeQuery(db, `SELECT DISTINCT ON (tool_id) tool_id, progress_data, completion_percent, status, updated_at
                       FROM tool_progress
                      WHERE user_id = $1 AND tool_id = ANY($2::text[])
                      ORDER BY tool_id, updated_at DESC`, [userId, journeyStorageIds]),
      safeQuery(db, `SELECT id, name, category, status, created_at, updated_at
                       FROM user_documents
                      WHERE user_id = $1
                      ORDER BY created_at DESC`, [userId]),
      safeQuery(db, `SELECT id, status, session_type, created_at, completed_at
                       FROM interview_sessions
                      WHERE user_id = $1
                      ORDER BY created_at DESC`, [userId]),
      safeQuery(db, `SELECT id, document_name, document_type, status, overall_score, created_at, completed_at
                       FROM document_reviews
                      WHERE user_id = $1
                      ORDER BY created_at DESC`, [userId]),
      safeQuery(db, `SELECT DISTINCT ON (tool_id)
                            id, tool_id, status, registry_version, policy_version,
                            validation_state, result_payload, result_sha256,
                            completed_at, updated_at
                       FROM tool_runs
                      WHERE user_id = $1
                        AND status = 'completed'
                        AND tool_id = ANY($2::text[])
                      ORDER BY tool_id, completed_at DESC NULLS LAST, updated_at DESC`, [userId, TRACKED_TOOL_IDS]),
    ]);

    const storedRows = storedRaw.map(normaliseStoredRow);
    const completedPlan = planStatus.latestCompleted || null;
    const planEvidence = buildPlanEvidence(completedPlan);
    const toolRunEvidence = buildToolRunEvidence(toolRunRows);

    const uploadedRequiredNames = new Set(
      documentRows.filter((row) => REQUIRED_DOCUMENTS.includes(String(row.name || ""))).map((row) => String(row.name)),
    );
    const satisfiedRequiredNames = new Set(uploadedRequiredNames);
    const generatedRequiredNames = new Set();
    if (completedPlan) {
      satisfiedRequiredNames.add("Business Plan");
      generatedRequiredNames.add("Business Plan");
    }
    const financialRun = toolRunRows.find((row) => row.tool_id === "financial-projections") || null;
    const financialRunAudit = financialRun ? toolRunAudit(financialRun) : null;
    if (planEvidence?.financial?.satisfied || (financialRunAudit?.hasDurableResult && !financialRunAudit.stale)) {
      satisfiedRequiredNames.add("Financial Projections");
      generatedRequiredNames.add("Financial Projections");
    }

    const latestUpdatedAt = documentRows
      .map((row) => row.updated_at || row.created_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
    const documents = {
      totalUploaded: documentRows.length,
      requiredUploaded: uploadedRequiredNames.size,
      requiredSatisfied: satisfiedRequiredNames.size,
      requiredTotal: REQUIRED_DOCUMENTS.length,
      completionPercent: Math.round((satisfiedRequiredNames.size / REQUIRED_DOCUMENTS.length) * 100),
      uploadedRequiredNames: Array.from(uploadedRequiredNames),
      generatedRequiredNames: Array.from(generatedRequiredNames),
      missingRequired: REQUIRED_DOCUMENTS.filter((name) => !satisfiedRequiredNames.has(name)),
      latestUpdatedAt,
    };

    const completedInterviews = interviewRows.filter((row) => ["completed", "reviewed"].includes(String(row.status || "").toLowerCase()));
    const activeInterviews = interviewRows.filter((row) => ["in_progress", "in-progress", "processing"].includes(String(row.status || "").toLowerCase()));
    const interviews = {
      total: interviewRows.length,
      completed: completedInterviews.length,
      active: activeInterviews.length,
      latestStatus: interviewRows[0]?.status || null,
      latestCompletedId: completedInterviews[0]?.id || null,
      latestCompletedAt: completedInterviews[0]?.completed_at || null,
    };

    const completedReviews = reviewRows.filter((row) => String(row.status || "").toLowerCase() === "completed");
    const activeReviews = reviewRows.filter((row) => ["pending", "processing"].includes(String(row.status || "").toLowerCase()));
    const failedReviews = reviewRows.filter((row) => String(row.status || "").toLowerCase() === "failed");
    const reviews = {
      total: reviewRows.length,
      completed: completedReviews.length,
      active: activeReviews.length,
      failed: failedReviews.length,
      latest: completedReviews[0]
        ? {
            id: completedReviews[0].id,
            documentName: completedReviews[0].document_name,
            status: completedReviews[0].status,
            overallScore: completedReviews[0].overall_score,
            completedAt: completedReviews[0].completed_at || null,
          }
        : null,
    };

    const milestones = buildMilestones({
      storedRows,
      planStatus,
      planEvidence,
      documents,
      interviews,
      reviews,
      toolRuns: toolRunRows,
    });
    const summary = readinessSummary(milestones);

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      generatedAt: new Date().toISOString(),
      readinessRulesetVersion: READINESS_RULESET_VERSION,
      requiredEvidencePolicy: REQUIRED_EVIDENCE_POLICY,
      milestones,
      summary,
      storedProgress: storedRows,
      authoritative: {
        businessPlans: {
          total: planStatus.total,
          completed: planStatus.completed,
          active: planStatus.active,
          state: planStatus.state,
          latest: planStatus.latest,
          evidence: planEvidence,
        },
        toolRuns: toolRunEvidence,
        documents,
        interviews,
        documentReviews: reviews,
      },
    });
  } catch (error) {
    console.error("[PROGRESS TRACKER] Failed to load:", error);
    return res.status(500).json({ error: "Failed to load progress tracker" });
  }
}

async function handleSaveStep(req, res) {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "Authentication required" });

    const stepId = String(req.params.stepId || "");
    if (!JOURNEY_STEP_IDS.has(stepId)) return res.status(400).json({ error: "Unknown progress step" });

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const progressData = body.progressData && typeof body.progressData === "object" ? body.progressData : {};
    const requestedSource = String(progressData.source || "auto").toLowerCase();
    const manualAllowed = requestedSource === "manual" && stepId === "endorser-comparison";
    if (requestedSource === "manual" && !manualAllowed) {
      return res.status(400).json({ error: "Manual completion is not available for this step" });
    }

    let completionPercent = clampPercent(body.completionPercent);
    let requestedStatus = String(body.status || "").toLowerCase();
    if (REQUIRED_STEP_IDS.has(stepId) && !manualAllowed && (completionPercent >= 100 || requestedStatus === "completed")) {
      // Client/browser sync may preserve progress, but required readiness is
      // awarded only by authoritative GET-side evidence evaluation.
      completionPercent = 95;
      requestedStatus = "in_progress";
    }
    const status = requestedStatus === "completed" || completionPercent >= 100
      ? "completed"
      : requestedStatus === "not_started" || completionPercent <= 0
        ? "not_started"
        : "in_progress";

    const safeProgressData = {
      ...progressData,
      source: manualAllowed ? "manual" : "auto",
      rulesetVersion: READINESS_RULESET_VERSION,
      clientReported: !manualAllowed,
    };
    const serialised = JSON.stringify(safeProgressData);
    if (serialised.length > 20_000) return res.status(413).json({ error: "Progress metadata is too large" });

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
    if (current && currentData.source === "manual" && !manualAllowed) {
      return res.json({ success: true, preservedManualProgress: true, progress: normaliseStoredRow({ ...current, tool_id: toolId }) });
    }

    if (current) {
      await db.query(
        `UPDATE tool_progress
            SET progress_data = $1::jsonb, completion_percent = $2, status = $3, updated_at = NOW()
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

    return res.json({
      success: true,
      progress: { stepId, completionPercent, status, progressData: safeProgressData, updatedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error("[PROGRESS TRACKER] Failed to save step:", error);
    return res.status(500).json({ error: "Failed to save progress" });
  }
}

function registerProgressTrackerRoutes(app) {
  if (app.__progressTrackerRoutesInstalled) return;
  Object.defineProperty(app, "__progressTrackerRoutesInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  app.get(ROUTE, handleGetProgress);
  app.post(`${ROUTE}/steps/:stepId`, handleSaveStep);
}

module.exports = {
  ROUTE,
  READINESS_RULESET_VERSION,
  REQUIRED_EVIDENCE_POLICY,
  REQUIRED_STEP_IDS,
  TOOL_MAX_AGE_DAYS,
  buildPlanEvidence,
  freshnessForRun,
  eligibilityPayloadPasses,
  toolRunAudit,
  buildMilestones,
  readinessSummary,
  handleGetProgress,
  handleSaveStep,
  registerProgressTrackerRoutes,
};
