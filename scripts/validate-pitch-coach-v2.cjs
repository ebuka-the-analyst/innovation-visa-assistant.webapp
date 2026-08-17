const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const page = read('client/src/pages/tools/pitch-coach-v2.tsx');
const routes = read('client/src/lib/toolRoutes.ts');

const requiredSnippets = [
  'useApplicationContextPrefill("pitch-coach", true)',
  'useStartToolRun()',
  'useCompleteToolRun()',
  'Create any pitch duration',
  'value="seconds"',
  'value="minutes"',
  'Add custom pitch',
  'buildPitch(plan, seconds)',
  'buildQa(sourcePlan)',
  'Preparation can be completed for you; practice cannot be invented.',
  'externalEvidenceVerifiedByThisTool: false',
  'setPracticeSessions([])',
  'actualSeconds: 0',
  'confidence: 0',
  'preparationCompleteness',
  'practiceReadiness',
  'queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] })',
  'pitchCoachV2: state',
];

for (const snippet of requiredSnippets) {
  if (!page.includes(snippet)) {
    throw new Error(`Pitch Coach V2 missing required behaviour: ${snippet}`);
  }
}

if (!routes.includes("'pitch-coach': lazy(() => import('@/pages/tools/pitch-coach-v2'))")) {
  throw new Error('Pitch Coach route is not mapped to the account-synced V2 experience.');
}

if (page.includes('actualSeconds: targetSeconds') || page.includes('confidence: 10')) {
  throw new Error('Pitch Coach must not fabricate practice timing or confidence.');
}

if (!page.includes('seconds < 10 || seconds > 3600')) {
  throw new Error('Custom pitch duration must have a bounded range.');
}

if (!page.includes('preparationCompleteness < 100')) {
  throw new Error('Automatic durable completion must wait until the preparation pack is complete.');
}

console.log('Pitch Coach V2 validation passed.');
