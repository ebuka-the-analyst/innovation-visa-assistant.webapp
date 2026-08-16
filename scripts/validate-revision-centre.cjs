const fs = require('fs');

const dialogPath = 'client/src/components/BusinessPlanRevisionDialog.tsx';
const progressPath = 'client/src/components/GenerationProgress.tsx';
const servicePath = 'server/services/businessPlanRevisionService.ts';

for (const file of [dialogPath, progressPath, servicePath]) {
  if (!fs.existsSync(file)) throw new Error(`Revision Centre file missing: ${file}`);
}

const dialog = fs.readFileSync(dialogPath, 'utf8');
const progress = fs.readFileSync(progressPath, 'utf8');
const service = fs.readFileSync(servicePath, 'utf8');

const dialogMarkers = [
  'Business Plan Revision Centre',
  'factual_correction',
  'updated_information',
  'content_improvement',
  'section_regeneration',
  'X-Idempotency-Key',
  '/preview',
  'Accept revision',
  'Discard revision',
  'Current version',
  'Revised candidate',
  'Your current plan remains untouched',
];
for (const marker of dialogMarkers) {
  if (!dialog.includes(marker)) throw new Error(`Revision Centre UI invariant missing: ${marker}`);
}

if (!progress.includes('BusinessPlanRevisionDialog')) {
  throw new Error('Completed generation page is not wired to BusinessPlanRevisionDialog');
}
if (progress.includes('Our team will review your request within 24 hours.')) {
  throw new Error('Legacy email-only revision workflow is still present');
}
if (progress.includes('Revision Request - Plan ${planId}')) {
  throw new Error('Legacy mailto revision workflow is still present');
}

const discardMarkers = [
  'revision.status === "ready_for_review"',
  "SET status = 'superseded'",
  'revision_candidate_discarded',
  'Only a queued or ready-for-review revision can be discarded.',
];
for (const marker of discardMarkers) {
  if (!service.includes(marker)) throw new Error(`Revision discard invariant missing: ${marker}`);
}

if (service.includes("type = 'generation'") || service.includes('credits_change')) {
  throw new Error('Revision Centre service must not charge generation credits');
}

console.log(JSON.stringify({
  ok: true,
  legacyEmailWorkflowRemoved: true,
  sectionSelection: true,
  candidatePreview: true,
  explicitAcceptance: true,
  candidateDiscard: true,
  noRevisionCreditCharge: true,
}, null, 2));
