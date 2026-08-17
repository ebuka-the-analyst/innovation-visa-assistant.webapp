const fs = require('fs');

function fail(message) {
  console.error(`[progress-tracker-plan-link] ${message}`);
  process.exitCode = 1;
}

const schema = fs.readFileSync('shared/schema.ts', 'utf8');
const tracker = fs.readFileSync('server/progressTracker.cjs', 'utf8');
const client = fs.readFileSync('client/src/pages/progress.tsx', 'utf8');

const schemaStartMarker = 'export const businessPlans = pgTable("business_plans", {';
const schemaStart = schema.indexOf(schemaStartMarker);
if (schemaStart === -1) {
  throw new Error('businessPlans schema declaration not found');
}
const schemaEnd = schema.indexOf('\n});', schemaStart);
if (schemaEnd === -1) {
  throw new Error('businessPlans schema declaration end not found');
}

const businessPlanSchema = schema.slice(schemaStart, schemaEnd);
const physicalColumns = new Set(
  [...businessPlanSchema.matchAll(/\b[A-Za-z0-9_]+:\s*(?:varchar|text|integer|timestamp|jsonb|boolean|real)\("([^"]+)"/g)]
    .map((match) => match[1]),
);

const fromIndex = tracker.indexOf('FROM business_plans');
if (fromIndex === -1) {
  throw new Error('Progress tracker business_plans query not found');
}
const selectIndex = tracker.lastIndexOf('SELECT', fromIndex);
if (selectIndex === -1) {
  throw new Error('Progress tracker business_plans SELECT not found');
}

const selectedColumns = tracker
  .slice(selectIndex + 'SELECT'.length, fromIndex)
  .split(',')
  .map((column) => column.trim().split(/\s+/)[0])
  .filter(Boolean);

for (const column of selectedColumns) {
  if (!physicalColumns.has(column)) {
    fail(`Progress tracker selects business_plans.${column}, but that physical column is not declared in shared/schema.ts`);
  }
}

for (const requiredColumn of ['id', 'business_name', 'status', 'pdf_url', 'created_at']) {
  if (!selectedColumns.includes(requiredColumn)) {
    fail(`Progress tracker business_plans query must select ${requiredColumn}`);
  }
}

if (!tracker.includes('const completedPlans = planRows.filter')) {
  fail('Completed-plan reconciliation logic is missing');
}
if (!tracker.includes('String(row.status || "").toLowerCase() === "completed"')) {
  fail('Completed-plan reconciliation must recognise the completed status');
}

if (!client.includes('tracker?.authoritative.businessPlans.evidence?.planId')) {
  fail('Completed questionnaire review must use the authoritative completed-plan ID');
}
if (!client.includes('`/api/view/html/${encodeURIComponent(questionnaireReviewPlanId)}`')) {
  fail('Completed questionnaire review must use the authenticated existing-plan HTML view');
}
if (!client.includes('isQuestionnaireReviewUnavailable')) {
  fail('Completed questionnaire review must fail closed when its authoritative plan ID is unavailable');
}
if (client.includes('<Link href={step.href} aria-label={`${actionLabel} ${step.title}`}>')) {
  fail('Progress step actions must not blindly reuse the new-workflow href after a step is complete');
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`[progress-tracker-plan-link] OK: ${selectedColumns.length} selected business_plans columns all exist in shared/schema.ts`);
