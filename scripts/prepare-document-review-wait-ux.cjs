const fs = require('fs');
const path = require('path');

const target = path.resolve(process.cwd(), 'client/src/pages/document-review.tsx');
let source = fs.readFileSync(target, 'utf8');

const importAnchor = 'import { SEOHead } from "@/components/SEOHead";';
const waitImport = 'import { DocumentReviewWaitStatus } from "@/components/DocumentReviewWaitStatus";';
if (!source.includes(waitImport)) {
  if (!source.includes(importAnchor)) throw new Error('Document review SEOHead import anchor not found');
  source = source.replace(importAnchor, `${importAnchor}\n${waitImport}`);
}

const oldActiveBlock = `                  {activePlanReview && (\n                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">\n                      <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">\n                        <Loader2 className="h-4 w-4 animate-spin" />\n                        Reviewing the full business plan\n                      </div>\n                      <p className="mt-2 text-sm text-muted-foreground">This page checks for completion automatically. Do not submit the same plan again.</p>\n                      <Progress value={55} className="mt-3" />\n                    </div>\n                  )}`;

const newActiveBlock = `                  {activePlanReview && (\n                    <DocumentReviewWaitStatus\n                      review={{ status: activePlanReview.status as "pending" | "processing", createdAt: activePlanReview.createdAt }}\n                      documentContent={String(selectedPlan.generatedContent || "")}\n                    />\n                  )}`;

if (source.includes(oldActiveBlock)) {
  source = source.replace(oldActiveBlock, newActiveBlock);
} else if (!source.includes('<DocumentReviewWaitStatus')) {
  throw new Error('Document review active-state block not found');
}

const oldFailedBlock = `                  {latestFailedPlanReview && !activePlanReview && !completedPlanReview && (\n                    <Alert variant="destructive">\n                      <AlertTriangle className="h-4 w-4" />\n                      <AlertTitle>The previous review failed</AlertTitle>\n                      <AlertDescription>You can retry the same saved plan without copying its content manually.</AlertDescription>\n                    </Alert>\n                  )}`;

const newFailedBlock = `                  {latestFailedPlanReview && !activePlanReview && !completedPlanReview && (\n                    <Alert variant="destructive" data-testid="document-review-failed-state">\n                      <AlertTriangle className="h-4 w-4" />\n                      <AlertTitle>The previous review attempt has ended</AlertTitle>\n                      <AlertDescription>\n                        This attempt is not still running. It was submitted {formatDate(latestFailedPlanReview.createdAt)} and ended unsuccessfully. Retry the same saved plan below; you do not need to copy or paste its content again.\n                      </AlertDescription>\n                    </Alert>\n                  )}`;

if (source.includes(oldFailedBlock)) {
  source = source.replace(oldFailedBlock, newFailedBlock);
} else if (!source.includes('data-testid="document-review-failed-state"')) {
  throw new Error('Document review failed-state block not found');
}

fs.writeFileSync(target, source, 'utf8');
console.log('[document-review-ux] waiting-time UX prepared');
