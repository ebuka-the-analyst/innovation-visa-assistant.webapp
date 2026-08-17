const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const page = read('client/src/pages/document-review.tsx');
const service = read('server/services/documentReviewService.ts');

const pageRequirements = [
  'queryKey: ["/api/dashboard/plans"]',
  'plan.status === "completed"',
  '!plan.isDemoData',
  'String(plan.userId || "") === userId',
  'String(plan.generatedContent || "").trim().length >= 100',
  'documentContent: content',
  'documentId: plan.id',
  'review.documentId === selectedPlan.id',
  'activePlanReview',
  'completedPlanReview',
  'queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] })',
  'Review my latest business plan',
  'Continue to Compliance Check',
  'Manual review is a fallback, not the default',
  'AI-generated text, scores and suggestions are not independent proof',
  'Whole-document review',
];

for (const snippet of pageRequirements) {
  if (!page.includes(snippet)) {
    throw new Error(`Final Document Review page missing required behaviour: ${snippet}`);
  }
}

const serviceRequirements = [
  'MAX_DOCUMENT_CHARS',
  'CHUNK_TARGET_CHARS',
  'splitDocumentIntoChunks',
  'analyzeWholeDocument',
  'SYNTHESIS_PROMPT',
  'Scores measure DOCUMENT PREPARATION QUALITY only. They are not success probabilities.',
  'Do not treat generated prose as verification',
  'normalizeAnalysis',
  'fallbackSynthesis',
  'review.documentContent || ""',
];

for (const snippet of serviceRequirements) {
  if (!service.includes(snippet)) {
    throw new Error(`Document review service missing required behaviour: ${snippet}`);
  }
}

if (service.includes('.substring(0, 15000)')) {
  throw new Error('Final document review still truncates the document at 15,000 characters.');
}

if (!page.includes('!plan.isDemoData')) {
  throw new Error('Demo business plans must never be selected for account final review.');
}

if (!page.includes('activePlanReview') || !page.includes('There is no need to submit the same business plan twice.')) {
  throw new Error('Duplicate in-progress reviews must be reused instead of resubmitted.');
}

console.log('Account-synced final document review validation passed.');
