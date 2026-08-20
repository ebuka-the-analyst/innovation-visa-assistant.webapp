const fs = require('fs');

function replaceFile(path, replacements) {
  let text = fs.readFileSync(path, 'utf8');
  const before = text;
  for (const [from, to] of replacements) {
    if (from instanceof RegExp) text = text.replace(from, to);
    else text = text.split(from).join(to);
  }
  if (text !== before) fs.writeFileSync(path, text);
}

replaceFile('client/src/components/QuestionnaireForm.tsx', [
  ['MSc Data Science (Leeds Beckett), BSc IT, AWS certifications, etc.', 'List your relevant degrees, professional certifications and awarding institutions.'],
  ['Data Analyst at Qalhata Solutions, NHS procurement projects, specific roles and companies', 'List relevant roles, employers, responsibilities and projects that you can evidence.'],
  ['Critical gap in previous applications: prove you can execute', 'Show how your education, experience and achievements support your ability to execute the business plan.'],
  ['Measurable advantages: 30% faster, 50% cheaper, first in UK, new process, sustainable approach, etc.', 'Describe measurable advantages only where you have evidence or a credible method for calculating them.'],
  ['Tech: React, Python, AWS. Non-tech: Equipment, processes, suppliers, production methods, key partnerships. Be specific about HOW you do it.', 'Describe the actual technologies, equipment, processes, suppliers or partnerships used and explain how the solution works.'],
  ['Food: HACCP, BRC. Healthcare: DCB0129. Manufacturing: ISO 9001. Services: professional certifications. GDPR. List all relevant standards.', 'List only the standards and compliance requirements that genuinely apply, using current authoritative sources.'],
]);

replaceFile('client/src/pages/visa-prefill-dashboard.tsx', [
  ['Minimum requirement: £1,270 (maintenance funds for 28 days)', 'Check the current maintenance-funds requirement in the eligibility assessment and official GOV.UK guidance before relying on a figure.'],
  ['placeholder="e.g., Leeds"', 'placeholder="Enter your city"'],
  ['placeholder="e.g., LS4 2NT"', 'placeholder="Enter your postcode"'],
  ['placeholder="e.g., Post-Study Work (PSW) Visa"', 'placeholder="Enter your current immigration permission"'],
  ['placeholder="e.g., 28 September 2022"', 'placeholder="Enter your UK entry date"'],
]);

replaceFile('shared/tools-data.ts', [
  ['Calculate your 70-point score for UK Innovation Visa eligibility', 'Assess your current Innovator Founder route points criteria using the versioned eligibility policy'],
  ['Verify you have the mandatory £1,270 savings for 28 consecutive days', 'Check your maintenance-funds evidence against the current versioned eligibility policy'],
]);

console.log('Residual static copy remediation applied.');
