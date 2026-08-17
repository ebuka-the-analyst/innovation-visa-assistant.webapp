const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/tool-platform/application-context";
const MAX_DOCUMENTS = 100;
const application = express.application;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id);
}

function noStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function normaliseJsonObject(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function normaliseStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string");
}

function normaliseBusinessName(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";
}

function validateToolId(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[a-z0-9][a-z0-9-]{0,119}$/.test(trimmed) ? trimmed : null;
}

function mapBusinessPlan(row) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    completedPlanCount: Number(row.completed_plan_count || 0),
    businessName: row.business_name,
    industry: row.industry,
    problem: row.problem,
    uniqueness: row.uniqueness,
    technology: row.technology,
    experience: row.experience,
    funding: row.funding,
    revenue: row.revenue,
    jobCreation: row.job_creation,
    expansion: row.expansion,
    vision: row.vision,
    innovationStage: row.innovation_stage,
    productStatus: row.product_status,
    existingCustomers: row.existing_customers,
    betaTesters: row.beta_testers,
    tractionEvidence: row.traction_evidence,
    techStack: row.tech_stack,
    dataArchitecture: row.data_architecture,
    aiMethodology: row.ai_methodology,
    complianceDesign: row.compliance_design,
    patentStatus: row.patent_status,
    founderEducation: row.founder_education,
    founderWorkHistory: row.founder_work_history,
    founderAchievements: row.founder_achievements,
    relevantProjects: row.relevant_projects,
    monthlyProjections: row.monthly_projections,
    customerAcquisitionCost: row.cac,
    lifetimeValue: row.ltv,
    paybackPeriod: row.payback_period,
    fundingSources: row.funding_sources,
    detailedCosts: row.detailed_costs,
    competitors: row.competitors,
    competitiveDifferentiation: row.competitive_differentiation,
    customerInterviews: row.customer_interviews,
    lettersOfIntent: row.letters_of_intent,
    willingnessToPay: row.willingness_to_pay,
    marketSize: row.market_size,
    regulatoryRequirements: row.regulatory_requirements,
    complianceTimeline: row.compliance_timeline,
    complianceBudget: row.compliance_budget,
    hiringPlan: row.hiring_plan,
    specificRegions: row.specific_regions,
    internationalPlan: row.international_plan,
    targetEndorser: row.target_endorser,
    contactPointsStrategy: row.contact_points_strategy,
    supportingEvidence: row.supporting_evidence,
  };
}

async function handleGetApplicationContext(req, res) {
  try {
    if (!isAuthenticated(req)) {
      noStore(res);
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const requestedToolId = req.query?.toolId;
    const toolId = validateToolId(requestedToolId);
    if (requestedToolId !== undefined && requestedToolId !== "" && !toolId) {
      noStore(res);
      return res.status(400).json({
        error: "Invalid tool ID",
        code: "INVALID_TOOL_ID",
      });
    }

    const db = getPool();
    const userId = req.user.id;

    const contextPromise = db.query(
      `SELECT revision, context_data, evidence_refs, created_at, updated_at
         FROM tool_case_contexts
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );

    const previousRunPromise = toolId
      ? db.query(
          `SELECT id, input_snapshot, evidence_refs, completed_at, created_at
             FROM tool_runs
            WHERE user_id = $1
              AND tool_id = $2
              AND status = 'completed'
            ORDER BY completed_at DESC NULLS LAST, created_at DESC
            LIMIT 1`,
          [userId, toolId],
        )
      : Promise.resolve({ rows: [] });

    const documentsPromise = db.query(
      `SELECT id, name, category, status, created_at, updated_at
         FROM user_documents
        WHERE user_id = $1
        ORDER BY updated_at DESC NULLS LAST, created_at DESC
        LIMIT $2`,
      [userId, MAX_DOCUMENTS],
    );

    const [contextResult, previousRunResult, documentsResult] = await Promise.all([
      contextPromise,
      previousRunPromise,
      documentsPromise,
    ]);

    const contextRow = contextResult.rows[0] || null;
    const previousRunRow = previousRunResult.rows[0] || null;
    const previousInputSnapshot = previousRunRow
      ? normaliseJsonObject(previousRunRow.input_snapshot)
      : {};
    const previousBusinessName = typeof previousInputSnapshot.businessName === "string"
      ? previousInputSnapshot.businessName.trim() || null
      : null;

    // When a user returns to an IVS tool after creating another business plan, keep the
    // restored review attached to the business it was originally completed for. If no
    // matching completed plan exists, fall back to the user's latest completed plan and
    // let the client-side cross-business guard suppress the stale previous review.
    const planResult = await db.query(
      `SELECT id, status, created_at,
              business_name, industry, problem, uniqueness, technology, experience,
              funding, revenue, job_creation, expansion, vision,
              innovation_stage, product_status, existing_customers, beta_testers, traction_evidence,
              tech_stack, data_architecture, ai_methodology, compliance_design, patent_status,
              founder_education, founder_work_history, founder_achievements, relevant_projects,
              monthly_projections, cac, ltv, payback_period, funding_sources, detailed_costs,
              competitors, competitive_differentiation,
              customer_interviews, letters_of_intent, willingness_to_pay, market_size,
              regulatory_requirements, compliance_timeline, compliance_budget,
              hiring_plan, specific_regions, international_plan,
              target_endorser, contact_points_strategy, supporting_evidence,
              COUNT(*) OVER() AS completed_plan_count
         FROM business_plans
        WHERE user_id = $1
          AND LOWER(status) = 'completed'
          AND COALESCE(is_demo_data, false) = false
        ORDER BY CASE
                   WHEN $2::text IS NOT NULL
                    AND LOWER(BTRIM(business_name)) = LOWER(BTRIM($2::text)) THEN 0
                   ELSE 1
                 END,
                 created_at DESC
        LIMIT 1`,
      [userId, previousBusinessName],
    );

    const planRow = planResult.rows[0] || null;
    const planMatchesPreviousRun = Boolean(
      previousBusinessName
      && planRow
      && normaliseBusinessName(planRow.business_name) === normaliseBusinessName(previousBusinessName),
    );
    const documents = documentsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reference: `document:${row.id}`,
    }));

    noStore(res);
    return res.json({
      generatedAt: new Date().toISOString(),
      toolId,
      businessPlan: mapBusinessPlan(planRow),
      businessPlanSelection: {
        strategy: planMatchesPreviousRun ? "previous_tool_business_match" : "latest_completed",
        matchedPreviousToolRun: planMatchesPreviousRun,
      },
      caseContext: contextRow
        ? {
            revision: Number(contextRow.revision || 0),
            contextData: normaliseJsonObject(contextRow.context_data),
            evidenceRefs: normaliseStringArray(contextRow.evidence_refs),
            createdAt: contextRow.created_at,
            updatedAt: contextRow.updated_at,
          }
        : {
            revision: 0,
            contextData: {},
            evidenceRefs: [],
            createdAt: null,
            updatedAt: null,
          },
      previousToolRun: previousRunRow
        ? {
            id: previousRunRow.id,
            inputSnapshot: previousInputSnapshot,
            evidenceRefs: normaliseStringArray(previousRunRow.evidence_refs),
            completedAt: previousRunRow.completed_at,
            createdAt: previousRunRow.created_at,
          }
        : null,
      documents,
    });
  } catch (error) {
    console.error("[APPLICATION CONTEXT] Failed to load reusable application data:", error);
    noStore(res);
    return res.status(500).json({
      error: "Application context could not be loaded",
      code: "APPLICATION_CONTEXT_ERROR",
    });
  }
}

function installRoute(app, originalGet) {
  if (app.__applicationContextPrefillRouteInstalled) return;
  Object.defineProperty(app, "__applicationContextPrefillRouteInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  originalGet.call(app, ROUTE, handleGetApplicationContext);
}

if (!application.__applicationContextPrefillHookInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__applicationContextPrefillHookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function applicationContextPrefillGet(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;
    if (isRouteRegistration) installRoute(this, originalGet);
    return originalGet.call(this, path, ...handlers);
  };
}