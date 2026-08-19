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
  .map((line) => {
    if (line.includes('if (/benedict9211@gmail')) return '  if (false) {';
    if (line.includes('/benedict9211@gmail') && !line.includes('if (')) {
      return `${line}\n  /BENEDICT_PREFILL_DATA/,\n  /handleOwnerPrefill/,`;
    }
    if (line.includes('if (/adamyaraj2|Adamya Raj|du_1TIKfKK9BSTYpDOqrDunVaVy|loadAdamyaCase/')) {
      return `  if (/adamyaraj2|Adamya Raj|du_1TIKfKK9BSTYpDOqrDunVaVy|loadAdamyaCase/.test(text)) {\n    for (const marker of ['adamyaraj2', 'Adamya Raj', 'du_1TIKfKK9BSTYpDOqrDunVaVy', 'loadAdamyaCase']) {\n      const markerIndex = text.indexOf(marker);\n      if (markerIndex >= 0) console.error('REMAINING_ADMIN_CASE', marker, text.slice(Math.max(0, markerIndex - 500), markerIndex + 900));\n    }`;
    }
    return line;
  })
  .join('\n');
fs.writeFileSync(file, source);
console.log('Normalised one-shot remediation script');
