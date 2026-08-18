const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const page = read('client/src/pages/tools/compliance-checker-v2.tsx');
const entry = read('client/src/pages/tools/compliance-checker.tsx');

for (const snippet of [
  'useApplicationContextPrefill("compliance-checker", true)',
  'useStartToolRun()',
  'useCompleteToolRun()',
  'innovator-founder-compliance-v2',
  'Endorsement letter',
  'Valid passport / identity document',
  'Age requirement',
  'English language requirement',
  'Financial requirement',
  'Tuberculosis test, if applicable',
  'Certified translations, if applicable',
  'Scholarship sponsor consent, if applicable',
  'Complete final checklist',
  'externalEvidenceIndependentlyVerifiedByThisTool: false',
  'policyVersion: POLICY_VERSION',
  'queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] })',
]) {
  if (!page.includes(snippet)) throw new Error(`Final route checklist missing required behaviour: ${snippet}`);
}

for (const retired of [
  'Annual Accounts (3 years)',
  'Payroll & PAYE Compliance',
  'Employee Records Complete',
  'Shareholder Records',
]) {
  if (page.includes(retired)) throw new Error(`Retired blanket corporate check still present: ${retired}`);
}

if (!page.includes('cutoff.setMonth(cutoff.getMonth() - 3)')) {
  throw new Error('Endorsement date must be checked against a three-calendar-month window.');
}

if (!page.includes('state.financeStatus === "uk-12-months" || state.financeStatus === "funds-28-days"')) {
  throw new Error('Financial requirement must support the UK 12-month and funds-held routes.');
}

if (!entry.includes('export { default } from "./compliance-checker-v2"')) {
  throw new Error('Compliance Checker route is not using the V2 checklist.');
}

if (!entry.includes('removeItem("complianceCheckerProgress")')) {
  throw new Error('Legacy corporate checklist state is not retired on entry.');
}

console.log('Account-synced Innovator Founder final route checklist validation passed.');
