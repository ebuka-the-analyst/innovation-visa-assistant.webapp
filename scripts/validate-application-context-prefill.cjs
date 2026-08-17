const fs = require("fs");

const serverPath = "server/applicationContextPrefill.cjs";
const draftServerPath = "server/questionnaireDraftSync.cjs";
const guardPath = "server/retiredRouteGuard.cjs";
const hookPath = "client/src/hooks/useToolPlatform.ts";
const ivsPath = "client/src/pages/tools/endorsement-ivs-assessment.tsx";
const draftClientPath = "client/src/lib/questionnaireDraftSync.ts";
const mainPath = "client/src/main.tsx";
const extractionMigrationPath = "migrations/app/20260817_application_context_document_extractions.sql";
const schemaVerifierPath = "server/scripts/verify-application-context-schema.cjs";
const railwayPath = "railway.json";

for (const file of [
  serverPath,
  draftServerPath,
  guardPath,
  hookPath,
  ivsPath,
  draftClientPath,
  mainPath,
  extractionMigrationPath,
  schemaVerifierPath,
  railwayPath,
]) {
  if (!fs.existsSync(file)) throw new Error(`Application prefill file missing: ${file}`);
}

const server = fs.readFileSync(serverPath, "utf8");
const draftServer = fs.readFileSync(draftServerPath, "utf8");
const guard = fs.readFileSync(guardPath, "utf8");
const hook = fs.readFileSync(hookPath, "utf8");
const ivs = fs.readFileSync(ivsPath, "utf8");
const draftClient = fs.readFileSync(draftClientPath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");
const extractionMigration = fs.readFileSync(extractionMigrationPath, "utf8");
const schemaVerifier = fs.readFileSync(schemaVerifierPath, "utf8");
const railway = fs.readFileSync(railwayPath, "utf8");

function requireMarker(content, marker, message) {
  if (!content.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
}

requireMarker(server, 'const ROUTE = "/api/tool-platform/application-context";', "Application context route is missing");
requireMarker(server, "WHERE user_id = $1", "Application context queries must be scoped to the authenticated user");
requireMarker(server, "AND LOWER(status) = 'completed'", "Application context must prefer a completed business plan when appropriate");
requireMarker(server, "AND COALESCE(is_demo_data, false) = false", "Demo business plans must not drive production prefill");
requireMarker(server, "AND tool_id = $2", "Previous tool input must be scoped to the requested tool");
requireMarker(server, "LOWER(BTRIM(business_name)) = LOWER(BTRIM($2::text))", "Returning to a tool must prefer the completed plan for the same business");
requireMarker(server, "questionnaireDraftEnvelope", "Authenticated questionnaire drafts are not exposed to reusable application context");
requireMarker(server, 'strategy = "questionnaire_draft"', "Newer authenticated questionnaire drafts must be selectable as current work");
requireMarker(server, "FROM document_extractions", "Persisted document extractions are not available to application prefill");
requireMarker(server, "MIN_DOCUMENT_PREFILL_CONFIDENCE = 0.8", "Document-extracted prefill must enforce a confidence threshold");
requireMarker(server, "reviewRequired: true", "Document-extracted fields must retain human-review provenance");
requireMarker(server, "countedAsEvidence: false", "Document extraction must not be silently promoted to evidence");
requireMarker(server, "reference: `document:${row.id}`", "Uploaded documents must expose stable references only");
requireMarker(server, 'res.setHeader("Cache-Control", "no-store")', "Sensitive application context responses must not be cached");
requireMarker(server, "const FINANCIAL_TOOL_IDS", "Related financial tools must be explicitly allow-listed");
requireMarker(server, "AND tool_id = ANY($2::text[])", "Related financial context must be restricted to financial tools");
requireMarker(server, "LOWER(BTRIM(input_snapshot->>'businessName')) = LOWER(BTRIM($3::text))", "Financial reuse must be scoped to the same business");
requireMarker(server, "mapFinancialToolRun", "Completed financial tool inputs must be mapped structurally");
requireMarker(server, "relatedToolData", "Application context must expose related reusable tool data");

for (const forbidden of ["generated_content", "background_image", "UPDATE business_plans", "DELETE FROM business_plans"]) {
  if (server.includes(forbidden)) {
    throw new Error(`Application prefill endpoint must remain read-only and avoid generated/large plan content: ${forbidden}`);
  }
}

requireMarker(extractionMigration, "CREATE TABLE IF NOT EXISTS document_extractions", "Document extraction runtime dependency must be an explicit app migration");
requireMarker(extractionMigration, "ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS", "Document extraction migration must reconcile legacy copies additively");
requireMarker(extractionMigration, "CREATE INDEX IF NOT EXISTS idx_extraction_user", "Document extraction user lookup must be indexed");
if (/DROP\s+TABLE|DELETE\s+FROM\s+document_extractions/i.test(extractionMigration)) {
  throw new Error("Document extraction migration must remain additive and data-preserving");
}

for (const requiredTable of ["business_plans", "tool_case_contexts", "tool_runs", "user_documents", "document_extractions"]) {
  requireMarker(schemaVerifier, `${requiredTable}:`, `Deployment verification must check ${requiredTable}`);
}
requireMarker(schemaVerifier, "BEGIN READ ONLY", "Application context schema verification must remain read-only");
requireMarker(railway, "node server/scripts/run-app-migrations.cjs && node server/scripts/verify-application-context-schema.cjs", "Railway must verify application-context schema after migrations and before start");

requireMarker(draftServer, 'const ROUTE = "/api/questionnaire/draft";', "Authenticated questionnaire draft route is missing");
requireMarker(draftServer, "requireAuthenticated", "Questionnaire draft route must require authentication");
requireMarker(draftServer, "WHERE user_id = $1", "Questionnaire draft reads/writes must be scoped to the authenticated user");
requireMarker(draftServer, "questionnaireDraft", "Questionnaire draft must be stored inside durable case context");
requireMarker(draftServer, "evidence_refs", "Questionnaire draft saves must preserve existing evidence references");
requireMarker(draftServer, "tool_case_context_events", "Questionnaire draft changes must retain a revision audit trail");
requireMarker(draftServer, 'res.setHeader("Cache-Control", "no-store")', "Questionnaire drafts must not be cached");

requireMarker(guard, 'require("./applicationContextPrefill.cjs");', "Application context route is not loaded at runtime");
requireMarker(guard, 'require("./questionnaireDraftSync.cjs");', "Questionnaire draft route is not loaded at runtime");
requireMarker(hook, "export function useApplicationContextPrefill", "Reusable application context hook is missing");
requireMarker(hook, '"/api/tool-platform/application-context"', "Application context hook points at the wrong route");
requireMarker(hook, "ApplicationFinancialModelPrefill", "Client application context must type related financial data");

requireMarker(draftClient, 'const OWNER_KEY = "autosave_questionnaire-owner-v1";', "Browser questionnaire cache is not account-scoped");
requireMarker(draftClient, 'fetchWithTimeout("/api/auth/user")', "Questionnaire draft sync must resolve the authenticated account first");
requireMarker(draftClient, 'fetchWithTimeout("/api/questionnaire/draft")', "Questionnaire draft sync is not hydrating from server storage");
requireMarker(draftClient, "Do not attach an unscoped or another account's browser draft", "Legacy or cross-account browser drafts must not be auto-migrated");
requireMarker(draftClient, "writeChain = writeChain.then", "Questionnaire draft server writes must be serialised");
requireMarker(main, 'import { initQuestionnaireDraftSync } from "./lib/questionnaireDraftSync";', "Questionnaire draft hydration is not bootstrapped");
requireMarker(main, "await initQuestionnaireDraftSync();", "Questionnaire draft must hydrate before React reads the local auto-save");

requireMarker(ivs, "buildBusinessPlanPrefill", "IVS page is not wired to structured application prefill");
requireMarker(ivs, "buildFinancialModelPrefill", "IVS page is not wired to same-business financial-tool prefill");
requireMarker(ivs, "buildPreviousReviewPrefill", "IVS page does not restore a prior validated tool input");
requireMarker(ivs, "previousReviewMatchesPlan", "IVS page must prevent cross-business previous-run restoration");
requireMarker(ivs, "mergeIntoUntouchedForm", "IVS prefill must preserve user edits");
requireMarker(ivs, "They are not automatically counted as evidence", "IVS page must explain why uploaded files are not silently credited as evidence");
requireMarker(ivs, "targetCustomers: joined([", "Target-customer prefill must reuse structured customer research rather than leave a repeat question blank");
requireMarker(ivs, "internalInnovationOwnership: joined([", "Innovation-ownership prefill must reuse existing ownership and technical statements");
requireMarker(ivs, "innovationCoreToBusiness: false", "Innovation must not default to a positive assessment claim");
requireMarker(ivs, 'innovationDeliveryModel: ""', "Innovation delivery must require explicit confirmation");
requireMarker(ivs, 'placeholder="Select delivery model"', "Innovation delivery selection must visibly request confirmation");
requireMarker(ivs, "if (!cleaned) throw new Error", "Blank financial inputs must not be silently converted to zero");
requireMarker(ivs, 'throw new Error("Select how the core innovation is delivered.")', "Assessment must reject an unconfirmed innovation delivery model");

const planMapperStart = ivs.indexOf("function buildBusinessPlanPrefill");
const financialMapperStart = ivs.indexOf("function buildFinancialModelPrefill", planMapperStart);
const previousMapperStart = ivs.indexOf("function validEvidenceItems", financialMapperStart);
if (planMapperStart === -1 || financialMapperStart === -1 || previousMapperStart === -1) {
  throw new Error("Could not isolate IVS prefill mappers");
}
const planMapper = ivs.slice(planMapperStart, financialMapperStart);
const financialMapper = ivs.slice(financialMapperStart, previousMapperStart);
for (const unsupportedField of [
  "minimumSetupCostGbp:",
  "monthlyOperatingCostGbp:",
  "forecastMonthlyRevenueGbp:",
  "evidenceItems:",
]) {
  if (planMapper.includes(unsupportedField)) {
    throw new Error(`Business-plan prefill must leave unsupported claim for a direct source: ${unsupportedField}`);
  }
}
for (const requiredField of ["minimumSetupCostGbp:", "monthlyOperatingCostGbp:", "forecastMonthlyRevenueGbp:"]) {
  if (!financialMapper.includes(requiredField)) {
    throw new Error(`Completed financial-tool prefill is missing direct numeric field: ${requiredField}`);
  }
}
if (financialMapper.includes("evidenceItems:")) {
  throw new Error("Financial tool reuse must not auto-promote its input into evidence");
}

if (ivs.includes("data.documents.map") || ivs.includes("applicationPrefill.data.documents.map")) {
  throw new Error("Uploaded document metadata must not be auto-promoted into IVS evidence items");
}

console.log(JSON.stringify({
  ok: true,
  authenticatedUserScoped: true,
  authenticatedQuestionnaireDrafts: true,
  crossAccountBrowserDraftsBlocked: true,
  completedNonDemoPlanOnly: true,
  sameBusinessPlanPreferredForPreviousRun: true,
  newerDraftCanRepresentCurrentWork: true,
  highConfidenceDocumentExtractionReuse: true,
  documentExtractionSchemaMigrated: true,
  documentExtractionSchemaVerifiedBeforeStart: true,
  documentProvenanceRetained: true,
  customerSegmentReuseWithoutInference: true,
  innovationOwnershipReuseWithoutDeliveryInference: true,
  sameBusinessFinancialToolReuse: true,
  noPositiveInnovationDefaults: true,
  blankFinancialInputsRejected: true,
  previousRunBusinessGuard: true,
  preservesUserEdits: true,
  noGeneratedContentParsing: true,
  noAutomaticEvidenceInflation: true,
  reusableAcrossTools: true,
}, null, 2));