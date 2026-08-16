const fs = require('fs');

const requiredFiles = [
  'migrations/app/20260816_business_plan_revision_management.sql',
  'server/services/businessPlanRevisionService.ts',
  'server/businessPlanRevisionRoutes.ts',
  'server/index.ts',
  'server/scripts/verify-app-schema.cjs',
  'shared/schema.ts',
];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Revision foundation file missing: ${file}`);
}

const migration = fs.readFileSync(requiredFiles[0], 'utf8');
const service = fs.readFileSync(requiredFiles[1], 'utf8');
const routes = fs.readFileSync(requiredFiles[2], 'utf8');
const index = fs.readFileSync(requiredFiles[3], 'utf8');
const verifier = fs.readFileSync(requiredFiles[4], 'utf8');
const schema = fs.readFileSync(requiredFiles[5], 'utf8');

const requiredTables = [
  'business_plan_versions',
  'business_plan_version_sections',
  'business_plan_revisions',
  'business_plan_revision_sections',
  'business_plan_revision_jobs',
  'business_plan_revision_events',
];
for (const table of requiredTables) {
  if (!migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) throw new Error(`Migration missing ${table}`);
  if (!verifier.includes(`'${table}'`)) throw new Error(`Post-migration verifier missing ${table}`);
}

const migrationInvariants = [
  'ux_business_plan_versions_one_accepted',
  'ux_business_plan_revisions_one_active',
  'ux_business_plan_revisions_user_idempotency',
  'idx_business_plan_revision_jobs_claim',
  "status IN ('submitted', 'in_progress', 'ready_for_review')",
];
for (const marker of migrationInvariants) {
  if (!migration.includes(marker)) throw new Error(`Revision migration invariant missing: ${marker}`);
}

const serviceInvariants = [
  'FOR UPDATE OF job SKIP LOCKED',
  'lease_expires_at',
  'ensureInitialVersion',
  'target_version_id',
  "status = 'ready_for_review'",
  "status = 'accepted'",
  'REVISION_SOURCE_VERSION_STALE',
  'business_plan_version_sections',
];
for (const marker of serviceInvariants) {
  if (!service.includes(marker)) throw new Error(`Revision service invariant missing: ${marker}`);
}
if (service.includes("type = 'generation'") || service.includes('credits_change')) {
  throw new Error('Revision service must not charge or mutate generation credits');
}

for (const marker of ['isAuthenticated', 'mutationOriginGuard', '/accept', '/cancel', '/preview']) {
  if (!routes.includes(marker)) throw new Error(`Revision API protection/route missing: ${marker}`);
}
for (const marker of ['registerBusinessPlanRevisionRoutes(app)', 'startBusinessPlanRevisionWorker()']) {
  if (!index.includes(marker)) throw new Error(`Revision runtime wiring missing: ${marker}`);
}
for (const marker of [
  'businessPlanVersions',
  'businessPlanVersionSections',
  'businessPlanRevisions',
  'businessPlanRevisionSections',
  'businessPlanRevisionJobs',
  'businessPlanRevisionEvents',
]) {
  if (!schema.includes(`export const ${marker}`)) throw new Error(`Drizzle schema missing ${marker}`);
}

console.log(JSON.stringify({ ok: true, requiredTables, durableWorker: true, immutableVersions: true, noRevisionCreditCharge: true }, null, 2));
