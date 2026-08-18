const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const page = read('client/src/pages/document-review.tsx');
const component = read('client/src/components/DocumentReviewWaitStatus.tsx');
const prepare = read('scripts/prepare-document-review-wait-ux.cjs');
const extra = read('scripts/prepare-managed-ai-routing-extra.cjs');

for (const snippet of [
  'DocumentReviewWaitStatus',
  'documentContent={String(selectedPlan.generatedContent || "")}',
  'The previous review attempt has ended',
  'This attempt is not still running.',
]) {
  if (!page.includes(snippet)) throw new Error(`Prepared Final Document Review page missing: ${snippet}`);
}

if (page.includes('<Progress value={55}')) {
  throw new Error('Final Document Review still contains the misleading hard-coded 55% progress bar.');
}

for (const snippet of [
  'Elapsed',
  'Estimated total time',
  'Estimated time remaining',
  'Estimated progress',
  'time-based estimate, not a live token counter',
  'Taking longer than usual',
  '18_000',
]) {
  if (!component.includes(snippet)) throw new Error(`Document review wait component missing: ${snippet}`);
}

if (!prepare.includes('data-testid="document-review-failed-state"')) {
  throw new Error('Failed review state is not explicitly prepared for users.');
}

if (!extra.includes("require('./prepare-document-review-wait-ux.cjs')")) {
  throw new Error('Document review waiting UX is not included in development/production preparation.');
}

console.log('Transparent Final Document Review waiting UX validation passed.');
