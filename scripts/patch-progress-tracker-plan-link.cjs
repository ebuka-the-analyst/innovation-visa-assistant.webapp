const fs = require('fs');

const file = 'server/progressTracker.cjs';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  source = source.replace(before, after);
}

replaceOnce(
  'SELECT id, business_name, status, pdf_url, created_at, updated_at\n           FROM business_plans',
  'SELECT id, business_name, status, pdf_url, created_at\n           FROM business_plans',
  'business_plans tracker SELECT',
);

replaceOnce(
  '                createdAt: latestPlan.created_at || null,\n                updatedAt: latestPlan.updated_at || null,',
  '                createdAt: latestPlan.created_at || null,',
  'business plan latest response timestamp',
);

fs.writeFileSync(file, source);
console.log('Progress tracker business-plan query patched');
