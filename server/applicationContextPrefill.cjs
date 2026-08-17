const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/tool-platform/application-context";
const MAX_DOCUMENTS = 100;
const MAX_EXTRACTIONS = 10;
const MIN_DOCUMENT_PREFILL_CONFIDENCE = 0.8;
const application = express.application;

const FINANCIAL_TOOL_IDS = Object.freeze([
  "financial-projections",
  "budget-cost-analyzer",
  "breakeven-calculator",
  "financial-modeling",
  "income-calculator",
  "cac-calculator",
  "unit-economics",
  "revenue-forecast",
  "financial-resilience",
]);

const DOCUMENT_FIELD_TO_PLAN_FIELD = {
  businessName: "businessName",
  industry: "industry",
  problem: "problem",
  uniqueness: "uniqueness",
  technology: "technology",
  techStack: "techStack",
  dataArchitecture: "dataArchitecture",
  aiMethodology: "aiMethodology",
  complianceDesign: "complianceDesign",
  patentStatus: "patentStatus",
  founderEducation: "founderEducation",
  educationBackground: "founderEducation",
  founderWorkHistory: "founderWorkHistory",
  founderAchievements: "founderAchievements",
  relevantProjects: "relevantProjects",
  monthlyProjections: "monthlyProjections",
  funding: "funding",
  customerAcquisitionCost: "customerAcquisitionCost",
  lifetimeValue: "lifetimeValue",
  paybackPeriod: "paybackPeriod",
  fundingSources: "fundingSources",
  detailedCosts: "detailedCosts",
  competitors: "competitors",
  competitiveDifferentiation: "competitiveDifferentiation",
  customerInterviews: "customerInterviews",
  lettersOfIntent: "lettersOfIntent",
  willingnessToPay: "willingnessToPay",
  marketSize: "marketSize",
  regulatoryRequirements: "regulatoryRequirements",
  complianceTimeline: "complianceTimeline",
  complianceBudget: "complianceBudget",
  hiringPlan: "hiringPlan",
  specificRegions: "specificRegions",
  internationalPlan: "internationalPlan",
  existingCustomers: "existingCustomers",
  tractionEvidence: "tractionEvidence",
  targetEndorser: "targetEndorser",
  contactPointsStrategy: "contactPointsStrategy",
};

const PERSONAL_DOCUMENT_PLAN_FIELDS = new Set([
  "founderEducation",
  "founderWorkHistory",
  "founderAchievements",
  "relevantProjects",
]);

const NUMERIC_PLAN_FIELDS = new Set([
  "funding",
  "jobCreation",
  "customerAcquisitionCost",
  "lifetimeValue",
  "paybackPeriod",
  "complianceBudget",
]);

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

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[£,$,%\s]/g, "");
  if (!cleaned || !/^-?\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function nonNegativeNumber(value) {
  const parsed = parseNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

function normaliseConfidence(value) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric >= 0 && numeric <= 1) return numeric;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  return null;
}

function joinText(values) {
  return values.map(text).filter(Boolean).join("\n\n");
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

function mapFinancialToolRun(row) {
  if (!row) return null;
  const snapshot = normaliseJsonObject(row.input_snapshot);
  const businessName = text(snapshot.businessName);
  if (!businessName) return null;

  const oneTimeSetupCostGbp = nonNegativeNumber(snapshot.oneTimeSetupCostGbp);
  const startingMonthlyRevenueGbp = nonNegativeNumber(snapshot.startingMonthlyRevenueGbp);
  const operatingParts = [
    snapshot.fixedOperatingCostsMonthlyGbp,
    snapshot.payrollMonthlyGbp,
    snapshot.marketingMonthlyGbp,
    snapshot.otherOperatingCostsMonthlyGbp,
  ].map(nonNegativeNumber);
  const monthlyOperatingCostGbp = operatingParts.every((value) => value !== null)
    ? operatingParts.reduce((sum, value) => sum + value, 0)
    : null;

  const hasReusableNumber = [oneTimeSetupCostGbp, startingMonthlyRevenueGbp, monthlyOperatingCostGbp]
    .some((value) => value !== null);
  if (!hasReusableNumber) return null;

  return {
    runId: row.id,
    toolId: row.tool_id,
    businessName,
    completedAt: row.completed_at,
    oneTimeSetupCostGbp,
    monthlyOperatingCostGbp,
    startingMonthlyRevenueGbp,
    assumptionsNarrative: text(snapshot.assumptionsNarrative) || null,
    source: "completed_financial_tool_run",
  };
}

function questionnaireDraftEnvelope(contextData) {
  const raw = normaliseJsonObject(contextData).questionnaireDraft;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const fields = normaliseJsonObject(raw.fields);
  if (Object.keys(fields).length === 0) return null;
  return {
    fields,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    source: "traditional_form",
  };
}

function mapQuestionnaireDraftToPlan(draftEnvelope) {
  if (!draftEnvelope) return null;
  const draft = draftEnvelope.fields;
  const businessName = text(draft.businessName);
  const technology = text(draft.technology) || joinText([draft.techStack, draft.dataArchitecture]);
  const founderEducation = text(draft.founderEducation) || text(draft.educationBackground);
  const experience = text(draft.experience) || joinText([draft.industryExperience, draft.founderWorkHistory]);

  const mapped = {
    id: "questionnaire-draft",
    status: "draft",
    createdAt: draftEnvelope.updatedAt,
    completedPlanCount: 0,
    businessName,
    industry: text(draft.industry),
    problem: text(draft.problem),
    uniqueness: text(draft.uniqueness),
    technology,
    experience,
    funding: parseNumber(draft.funding),
    revenue: text(draft.revenue),
    jobCreation: parseNumber(draft.jobCreation),
    expansion: text(draft.expansion),
    vision: text(draft.vision),
    innovationStage: text(draft.innovationStage),
    productStatus: text(draft.productStatus),
    existingCustomers: text(draft.existingCustomers) || null,
    betaTesters: text(draft.betaTesters) || null,
    tractionEvidence: text(draft.tractionEvidence) || null,
    techStack: text(draft.techStack),
    dataArchitecture: text(draft.dataArchitecture),
    aiMethodology: text(draft.aiMethodology),
    complianceDesign: text(draft.complianceDesign),
    patentStatus: text(draft.patentStatus),
    founderEducation,
    founderWorkHistory: text(draft.founderWorkHistory),
    founderAchievements: text(draft.founderAchievements),
    relevantProjects: text(draft.relevantProjects),
    monthlyProjections: text(draft.monthlyProjections),
    customerAcquisitionCost: parseNumber(draft.customerAcquisitionCost),
    lifetimeValue: parseNumber(draft.lifetimeValue),
    paybackPeriod: parseNumber(draft.paybackPeriod),
    fundingSources: text(draft.fundingSources),
    detailedCosts: text(draft.detailedCosts),
    competitors: text(draft.competitors),
    competitiveDifferentiation: text(draft.competitiveDifferentiation),
    customerInterviews: text(draft.customerInterviews),
    lettersOfIntent: text(draft.lettersOfIntent) || null,
    willingnessToPay: text(draft.willingnessToPay),
    marketSize: text(draft.marketSize),
    regulatoryRequirements: text(draft.regulatoryRequirements),
    complianceTimeline: text(draft.complianceTimeline),
    complianceBudget: parseNumber(draft.complianceBudget),
    hiringPlan: text(draft.hiringPlan),
    specificRegions: text(draft.specificRegions),
    internationalPlan: text(draft.internationalPlan) || null,
    targetEndorser: text(draft.targetEndorser),
    contactPointsStrategy: text(draft.contactPointsStrategy),
    supportingEvidence: text(draft.supportingEvidence) || null,
  };

  const hasReusableValue = Object.entries(mapped).some(([key, value]) => {
    if (["id", "status", "createdAt", "completedPlanCount"].includes(key)) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return typeof value === "number" && Number.isFinite(value);
  });
  return hasReusableValue ? mapped : null;
}

function isMeaningfulPlanValue(key, value) {
  if (NUMERIC_PLAN_FIELDS.has(key)) return typeof value === "number" && Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

function mergePlan(primary, fallback) {
  if (!primary) return { plan: fallback, mergedFieldCount: fallback ? 1 : 0 };
  if (!fallback) return { plan: primary, mergedFieldCount: 0 };
  const next = { ...primary };
  let mergedFieldCount = 0;
  for (const [key, value] of Object.entries(fallback)) {
    if (["id", "status", "createdAt", "completedPlanCount"].includes(key)) continue;
    if (!isMeaningfulPlanValue(key, value)) continue;
    if (!isMeaningfulPlanValue(key, next[key])) {
      next[key] = value;
      mergedFieldCount += 1;
    }
  }
  return { plan: next, mergedFieldCount };
}

function extractionPlanFromRows(rows, documents, selectedBusinessName) {
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const candidate = {
    id: "document-extraction",
    status: "extracted",
    createdAt: null,
    completedPlanCount: 0,
  };
  const provenance = [];
  let effectiveBusinessName = normaliseBusinessName(selectedBusinessName);

  for (const row of rows) {
    const extractedData = normaliseJsonObject(row.extracted_data);
    const confidence = normaliseJsonObject(row.confidence);
    const documentIds = normaliseStringArray(row.document_ids).filter((id) => documentById.has(id));
    if (documentIds.length === 0) continue;

    const rowBusinessName = text(extractedData.businessName);
    const rowBusinessNameNormalised = normaliseBusinessName(rowBusinessName);
    const businessMatches = Boolean(
      rowBusinessNameNormalised
      && (!effectiveBusinessName || rowBusinessNameNormalised === effectiveBusinessName),
    );
    if (!effectiveBusinessName && rowBusinessNameNormalised) effectiveBusinessName = rowBusinessNameNormalised;

    for (const [sourceField, planField] of Object.entries(DOCUMENT_FIELD_TO_PLAN_FIELD)) {
      const rawValue = extractedData[sourceField];
      const score = normaliseConfidence(confidence[sourceField]);
      if (score === null || score < MIN_DOCUMENT_PREFILL_CONFIDENCE) continue;

      const isPersonalField = PERSONAL_DOCUMENT_PLAN_FIELDS.has(planField);
      if (!isPersonalField && !businessMatches) continue;
      if (isMeaningfulPlanValue(planField, candidate[planField])) continue;

      const value = NUMERIC_PLAN_FIELDS.has(planField) ? parseNumber(rawValue) : text(rawValue);
      if (!isMeaningfulPlanValue(planField, value)) continue;
      candidate[planField] = value;
      if (!candidate.createdAt && row.created_at) candidate.createdAt = row.created_at;
      provenance.push({
        extractionId: row.id,
        sourceField,
        planField,
        confidence: score,
        documentRefs: documentIds.map((id) => `document:${id}`),
        extractedAt: row.created_at,
        reviewRequired: true,
        countedAsEvidence: false,
      });
    }
  }

  const hasFields = provenance.length > 0;
  return { plan: hasFields ? candidate : null, provenance };
}

function isNewer(left, right) {
  const leftTime = left ? Date.parse(left) : NaN;
  const rightTime = right ? Date.parse(right) : NaN;
  return Number.isFinite(leftTime) && (!Number.isFinite(rightTime) || leftTime > rightTime);
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

    const extractionsPromise = db.query(
      `SELECT id, document_ids, extracted_data, confidence, created_at
         FROM document_extractions
        WHERE user_id = $1
          AND status = 'completed'
          AND extracted_data IS NOT NULL
        ORDER BY created_at DESC
        LIMIT $2`,
      [userId, MAX_EXTRACTIONS],
    );

    const [contextResult, previousRunResult, documentsResult, extractionsResult] = await Promise.all([
      contextPromise,
      previousRunPromise,
      documentsPromise,
      extractionsPromise,
    ]);

    const contextRow = contextResult.rows[0] || null;
    const contextData = normaliseJsonObject(contextRow?.context_data);
    const draftEnvelope = questionnaireDraftEnvelope(contextData);
    const draftPlan = mapQuestionnaireDraftToPlan(draftEnvelope);
    const previousRunRow = previousRunResult.rows[0] || null;
    const previousInputSnapshot = previousRunRow
      ? normaliseJsonObject(previousRunRow.input_snapshot)
      : {};
    const previousBusinessName = typeof previousInputSnapshot.businessName === "string"
      ? previousInputSnapshot.businessName.trim() || null
      : null;

    // When a user returns to an IVS tool after creating another business plan, keep the
    // restored review attached to the business it was originally completed for. If no
    // matching completed plan exists, the latest completed plan remains available as a
    // fallback while a newer authenticated questionnaire draft can represent current work.
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
    const completedPlan = mapBusinessPlan(planRow);
    const planMatchesPreviousRun = Boolean(
      previousBusinessName
      && completedPlan
      && normaliseBusinessName(completedPlan.businessName) === normaliseBusinessName(previousBusinessName),
    );
    const draftMatchesPreviousRun = Boolean(
      previousBusinessName
      && draftPlan
      && normaliseBusinessName(draftPlan.businessName) === normaliseBusinessName(previousBusinessName),
    );
    const draftMatchesCompletedPlan = Boolean(
      completedPlan
      && draftPlan
      && normaliseBusinessName(completedPlan.businessName)
      && normaliseBusinessName(completedPlan.businessName) === normaliseBusinessName(draftPlan.businessName),
    );
    const draftIsNewerThanCompleted = Boolean(
      draftPlan
      && isNewer(draftEnvelope?.updatedAt, completedPlan?.createdAt),
    );

    let reusablePlan = completedPlan;
    let strategy = completedPlan ? (planMatchesPreviousRun ? "previous_tool_business_match" : "latest_completed") : "none";
    let questionnaireDraftFieldCount = 0;

    if (planMatchesPreviousRun) {
      if (draftMatchesCompletedPlan) {
        const merged = mergePlan(completedPlan, draftPlan);
        reusablePlan = merged.plan;
        questionnaireDraftFieldCount = merged.mergedFieldCount;
      }
    } else if (draftPlan && (draftMatchesPreviousRun || !completedPlan || draftIsNewerThanCompleted)) {
      reusablePlan = draftPlan;
      strategy = "questionnaire_draft";
      if (draftMatchesCompletedPlan) {
        const merged = mergePlan(draftPlan, completedPlan);
        reusablePlan = merged.plan;
      }
      questionnaireDraftFieldCount = Object.keys(draftPlan).filter((key) =>
        !["id", "status", "createdAt", "completedPlanCount"].includes(key)
        && isMeaningfulPlanValue(key, draftPlan[key]),
      ).length;
    } else if (completedPlan && draftMatchesCompletedPlan) {
      const merged = mergePlan(completedPlan, draftPlan);
      reusablePlan = merged.plan;
      questionnaireDraftFieldCount = merged.mergedFieldCount;
    }

    const documents = documentsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reference: `document:${row.id}`,
    }));

    const extraction = extractionPlanFromRows(
      extractionsResult.rows,
      documents,
      reusablePlan?.businessName || draftPlan?.businessName || completedPlan?.businessName || null,
    );
    const mergedWithExtraction = mergePlan(reusablePlan, extraction.plan);
    reusablePlan = mergedWithExtraction.plan;
    if (!reusablePlan && extraction.plan) {
      reusablePlan = extraction.plan;
      strategy = "document_extraction";
    } else if (strategy === "none" && extraction.plan) {
      strategy = "document_extraction";
    }

    let relatedFinancialModel = null;
    if (reusablePlan?.businessName) {
      const financialRunResult = await db.query(
        `SELECT id, tool_id, input_snapshot, completed_at, created_at
           FROM tool_runs
          WHERE user_id = $1
            AND status = 'completed'
            AND tool_id = ANY($2::text[])
            AND LOWER(BTRIM(input_snapshot->>'businessName')) = LOWER(BTRIM($3::text))
          ORDER BY completed_at DESC NULLS LAST, created_at DESC
          LIMIT 1`,
        [userId, FINANCIAL_TOOL_IDS, reusablePlan.businessName],
      );
      relatedFinancialModel = mapFinancialToolRun(financialRunResult.rows[0] || null);
    }

    noStore(res);
    return res.json({
      generatedAt: new Date().toISOString(),
      toolId,
      businessPlan: reusablePlan,
      businessPlanSelection: {
        strategy,
        matchedPreviousToolRun: planMatchesPreviousRun || draftMatchesPreviousRun,
        supplementedByQuestionnaireDraft: questionnaireDraftFieldCount > 0 && strategy !== "questionnaire_draft",
        questionnaireDraftFieldCount,
        supplementedByDocumentExtraction: mergedWithExtraction.mergedFieldCount > 0 || strategy === "document_extraction",
        documentExtractedFieldCount: extraction.provenance.length,
      },
      relatedToolData: {
        financialModel: relatedFinancialModel,
      },
      documentPrefillProvenance: extraction.provenance,
      caseContext: contextRow
        ? {
            revision: Number(contextRow.revision || 0),
            contextData,
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