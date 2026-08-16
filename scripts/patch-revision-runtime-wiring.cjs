const fs = require('fs');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(before, after);
}

// Runtime wiring.
{
  const file = 'server/index.ts';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    'import { startBusinessPlanGenerationWorker } from "./services/businessPlanGenerationService";',
    'import { startBusinessPlanGenerationWorker } from "./services/businessPlanGenerationService";\nimport { registerBusinessPlanRevisionRoutes } from "./businessPlanRevisionRoutes";\nimport { startBusinessPlanRevisionWorker } from "./services/businessPlanRevisionService";',
    'index imports',
  );
  source = replaceOnce(
    source,
    '  const server = await registerRoutes(app);\n  startBusinessPlanGenerationWorker();',
    '  const server = await registerRoutes(app);\n  registerBusinessPlanRevisionRoutes(app);\n  startBusinessPlanGenerationWorker();\n  startBusinessPlanRevisionWorker();',
    'index startup',
  );
  fs.writeFileSync(file, source);
}

// Drizzle schema alignment with the explicit SQL migration.
{
  const file = 'shared/schema.ts';
  let source = fs.readFileSync(file, 'utf8');
  const anchor = '// Google OAuth user upsert schema for Railway deployment';
  if (!source.includes('export const businessPlanVersions = pgTable')) {
    if (!source.includes(anchor)) throw new Error('Schema insertion anchor not found');
    const definitions = `// Immutable business-plan versions. A revision is prepared as a candidate version and\n// only becomes the live business plan after an explicit owner acceptance.\nexport const businessPlanVersions = pgTable("business_plan_versions", {\n  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n  planId: varchar("plan_id").notNull().references(() => businessPlans.id, { onDelete: "cascade" }),\n  versionNumber: integer("version_number").notNull(),\n  status: varchar("status", { length: 20 }).notNull().default('candidate'),\n  generatedContent: text("generated_content").notNull(),\n  chartData: text("chart_data"),\n  contentSha256: varchar("content_sha256", { length: 64 }).notNull(),\n  createdByUserId: varchar("created_by_user_id").references(() => users.id, { onDelete: "set null" }),\n  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),\n  acceptedAt: timestamp("accepted_at", { withTimezone: true }),\n}, (table) => [\n  uniqueIndex("ux_business_plan_versions_plan_number").on(table.planId, table.versionNumber),\n  uniqueIndex("ux_business_plan_versions_one_accepted").on(table.planId).where(sql\`\${table.status} = 'accepted'\`),\n  index("idx_business_plan_versions_plan_created").on(table.planId, table.createdAt),\n]);\n\nexport const businessPlanVersionSections = pgTable("business_plan_version_sections", {\n  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n  versionId: varchar("version_id").notNull().references(() => businessPlanVersions.id, { onDelete: "cascade" }),\n  planId: varchar("plan_id").notNull().references(() => businessPlans.id, { onDelete: "cascade" }),\n  sectionIndex: integer("section_index").notNull(),\n  sectionTitle: text("section_title").notNull(),\n  content: text("content").notNull(),\n  contentSha256: varchar("content_sha256", { length: 64 }).notNull(),\n  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),\n}, (table) => [\n  uniqueIndex("ux_business_plan_version_sections_version_index").on(table.versionId, table.sectionIndex),\n  index("idx_business_plan_version_sections_plan").on(table.planId, table.versionId, table.sectionIndex),\n]);\n\nexport const businessPlanRevisions = pgTable("business_plan_revisions", {\n  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n  planId: varchar("plan_id").notNull().references(() => businessPlans.id, { onDelete: "cascade" }),\n  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),\n  revisionNumber: integer("revision_number").notNull(),\n  sourceVersionId: varchar("source_version_id").notNull().references(() => businessPlanVersions.id),\n  targetVersionId: varchar("target_version_id").references(() => businessPlanVersions.id),\n  requestType: varchar("request_type", { length: 40 }).notNull(),\n  instructions: text("instructions").notNull(),\n  selectedSectionIndexes: integer("selected_section_indexes").array().notNull(),\n  status: varchar("status", { length: 30 }).notNull().default('submitted'),\n  consistencyReport: jsonb("consistency_report"),\n  assignedAdminId: varchar("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),\n  idempotencyKey: varchar("idempotency_key", { length: 100 }).notNull(),\n  lastError: text("last_error"),\n  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),\n  startedAt: timestamp("started_at", { withTimezone: true }),\n  completedAt: timestamp("completed_at", { withTimezone: true }),\n  acceptedAt: timestamp("accepted_at", { withTimezone: true }),\n  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),\n  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),\n}, (table) => [\n  uniqueIndex("ux_business_plan_revisions_plan_number").on(table.planId, table.revisionNumber),\n  uniqueIndex("ux_business_plan_revisions_user_idempotency").on(table.userId, table.idempotencyKey),\n  uniqueIndex("ux_business_plan_revisions_one_active").on(table.planId).where(sql\`\${table.status} in ('submitted', 'in_progress', 'ready_for_review')\`),\n  index("idx_business_plan_revisions_user_created").on(table.userId, table.submittedAt),\n  index("idx_business_plan_revisions_status_created").on(table.status, table.submittedAt),\n]);\n\nexport const businessPlanRevisionSections = pgTable("business_plan_revision_sections", {\n  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n  revisionId: varchar("revision_id").notNull().references(() => businessPlanRevisions.id, { onDelete: "cascade" }),\n  sectionIndex: integer("section_index").notNull(),\n  sectionTitle: text("section_title").notNull(),\n  originalContent: text("original_content").notNull(),\n  originalSha256: varchar("original_sha256", { length: 64 }).notNull(),\n  revisedContent: text("revised_content"),\n  revisedSha256: varchar("revised_sha256", { length: 64 }),\n  status: varchar("status", { length: 20 }).notNull().default('pending'),\n  changeSummary: text("change_summary"),\n  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),\n  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),\n}, (table) => [\n  uniqueIndex("ux_business_plan_revision_sections_revision_index").on(table.revisionId, table.sectionIndex),\n  index("idx_business_plan_revision_sections_revision").on(table.revisionId, table.sectionIndex),\n]);\n\nexport const businessPlanRevisionJobs = pgTable("business_plan_revision_jobs", {\n  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n  revisionId: varchar("revision_id").notNull().references(() => businessPlanRevisions.id, { onDelete: "cascade" }),\n  status: varchar("status", { length: 20 }).notNull().default('queued'),\n  claimCount: integer("claim_count").notNull().default(0),\n  failureCount: integer("failure_count").notNull().default(0),\n  leaseOwner: varchar("lease_owner", { length: 255 }),\n  leaseToken: varchar("lease_token", { length: 64 }),\n  leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),\n  heartbeatAt: timestamp("heartbeat_at", { withTimezone: true }),\n  availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),\n  startedAt: timestamp("started_at", { withTimezone: true }),\n  completedAt: timestamp("completed_at", { withTimezone: true }),\n  failedAt: timestamp("failed_at", { withTimezone: true }),\n  lastError: text("last_error"),\n  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),\n  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),\n}, (table) => [\n  uniqueIndex("ux_business_plan_revision_jobs_revision").on(table.revisionId),\n  index("idx_business_plan_revision_jobs_claim").on(table.status, table.availableAt, table.leaseExpiresAt),\n]);\n\nexport const businessPlanRevisionEvents = pgTable("business_plan_revision_events", {\n  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n  revisionId: varchar("revision_id").notNull().references(() => businessPlanRevisions.id, { onDelete: "cascade" }),\n  planId: varchar("plan_id").notNull().references(() => businessPlans.id, { onDelete: "cascade" }),\n  actorUserId: varchar("actor_user_id").references(() => users.id, { onDelete: "set null" }),\n  actorType: varchar("actor_type", { length: 20 }).notNull(),\n  eventType: varchar("event_type", { length: 60 }).notNull(),\n  payload: jsonb("payload"),\n  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),\n}, (table) => [\n  index("idx_business_plan_revision_events_revision").on(table.revisionId, table.createdAt),\n  index("idx_business_plan_revision_events_plan").on(table.planId, table.createdAt),\n]);\n\n`;
    source = source.replace(anchor, definitions + anchor);
  }
  fs.writeFileSync(file, source);
}

// Post-migration verification.
{
  const file = 'server/scripts/verify-app-schema.cjs';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    "      'business_plan_generation_sections',\n      'export_analytics',",
    "      'business_plan_generation_sections',\n      'business_plan_versions',\n      'business_plan_version_sections',\n      'business_plan_revisions',\n      'business_plan_revision_sections',\n      'business_plan_revision_jobs',\n      'business_plan_revision_events',\n      'export_analytics',",
    'verifier tables',
  );
  source = replaceOnce(
    source,
    "      ['business_plan_generation_sections', 'generator_version'],\n      ['tool_case_contexts', 'revision'],",
    "      ['business_plan_generation_sections', 'generator_version'],\n      ['business_plan_versions', 'content_sha256'],\n      ['business_plan_revisions', 'selected_section_indexes'],\n      ['business_plan_revisions', 'source_version_id'],\n      ['business_plan_revision_sections', 'revised_sha256'],\n      ['business_plan_revision_jobs', 'lease_token'],\n      ['business_plan_revision_jobs', 'lease_expires_at'],\n      ['business_plan_revision_events', 'event_type'],\n      ['tool_case_contexts', 'revision'],",
    'verifier columns',
  );
  source = replaceOnce(
    source,
    "      'ux_credit_transactions_generation_plan_once',\n      'ux_tool_case_context_events_user_revision',",
    "      'ux_credit_transactions_generation_plan_once',\n      'ux_business_plan_versions_plan_number',\n      'ux_business_plan_versions_one_accepted',\n      'ux_business_plan_version_sections_version_index',\n      'ux_business_plan_revisions_plan_number',\n      'ux_business_plan_revisions_user_idempotency',\n      'ux_business_plan_revisions_one_active',\n      'ux_business_plan_revision_sections_revision_index',\n      'ux_business_plan_revision_jobs_revision',\n      'idx_business_plan_revision_jobs_claim',\n      'idx_business_plan_revision_events_revision',\n      'ux_tool_case_context_events_user_revision',",
    'verifier indexes',
  );
  source = replaceOnce(
    source,
    "      ['tool_case_contexts', 'user_id'],",
    "      ['business_plan_version_sections', 'version_id'],\n      ['business_plan_version_sections', 'plan_id'],\n      ['business_plan_revisions', 'plan_id'],\n      ['business_plan_revisions', 'user_id'],\n      ['business_plan_revision_sections', 'revision_id'],\n      ['business_plan_revision_jobs', 'revision_id'],\n      ['business_plan_revision_events', 'revision_id'],\n      ['business_plan_revision_events', 'plan_id'],\n      ['tool_case_contexts', 'user_id'],",
    'verifier cascades',
  );
  source = replaceOnce(
    source,
    "    observations.generationJobsByStatus = jobs.rows;\n\n    const toolRuns = await client.query(",
    "    observations.generationJobsByStatus = jobs.rows;\n\n    const revisionJobs = await client.query(\n      `SELECT status, COUNT(*)::int AS count\n       FROM business_plan_revision_jobs\n       GROUP BY status ORDER BY status`,\n    );\n    observations.revisionJobsByStatus = revisionJobs.rows;\n\n    const activeRevisionDuplicates = await client.query(\n      `SELECT plan_id, COUNT(*)::int AS count\n       FROM business_plan_revisions\n       WHERE status IN ('submitted', 'in_progress', 'ready_for_review')\n       GROUP BY plan_id HAVING COUNT(*) > 1`,\n    );\n    if (activeRevisionDuplicates.rowCount > 0) failures.push('More than one active revision exists for a plan');\n\n    const acceptedVersionDuplicates = await client.query(\n      `SELECT plan_id, COUNT(*)::int AS count\n       FROM business_plan_versions\n       WHERE status = 'accepted'\n       GROUP BY plan_id HAVING COUNT(*) > 1`,\n    );\n    if (acceptedVersionDuplicates.rowCount > 0) failures.push('More than one accepted version exists for a plan');\n\n    const toolRuns = await client.query(",
    'verifier observations',
  );
  fs.writeFileSync(file, source);
}

// Permanent CI guard.
{
  const file = '.github/workflows/pr-build.yml';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    "      - name: Smoke test financial model route\n        run: node scripts/smoke-financial-model-route.cjs\n\n      - name: Production build",
    "      - name: Smoke test financial model route\n        run: node scripts/smoke-financial-model-route.cjs\n\n      - name: Validate business plan revision foundation\n        run: node scripts/validate-revision-foundation.cjs\n\n      - name: Production build",
    'PR workflow revision validation',
  );
  fs.writeFileSync(file, source);
}

console.log('Revision runtime wiring patch applied');
