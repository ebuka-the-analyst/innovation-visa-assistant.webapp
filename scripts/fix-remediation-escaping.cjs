const fs = require('fs');
const file = 'scripts/remediate-unsafe-hardcodes.cjs';
let source = fs.readFileSync(file, 'utf8');
const twoBackslashes = '\\'.repeat(2);
const oneBackslash = '\\';
source = source.split(twoBackslashes + '`').join(oneBackslash + '`');
source = source.split(twoBackslashes + '${').join(oneBackslash + '${');
source = source.replace(
  `  text = replaceOnce(\n    text,\n    '\"UK Visa Assistant - Benedict Umeh\"',\n    '\"VisaFlow - Immigration Guidance\"',\n    'replace named questionnaire example',\n  );`,
  `  text = text.replaceAll(\"\\\"UK Visa Assistant - Benedict Umeh\\\"\", \"\\\"VisaFlow - Immigration Guidance\\\"\");`,
);
source = source
  .split('\n')
  .map((line) => line.includes('if (/benedict9211@gmail')
    ? "  if (/benedict9211@gmail\\.com|BENEDICT_PREFILL_DATA/.test(text)) {"
    : line)
  .join('\n');
fs.writeFileSync(file, source);
console.log('Normalised one-shot remediation script');
