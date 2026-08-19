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
source = source.replace(
  '// 2) Remove owner-specific questionnaire prefill and personal identity gate.',
  `// 1b) Retire the completed one-off account-specific credit reconciliation script.\nconst reconciliationResetPath = path.join(root, 'server/creditReconciliationReset.cjs');\nif (fs.existsSync(reconciliationResetPath)) {\n  fs.unlinkSync(reconciliationResetPath);\n  changed.push('server/creditReconciliationReset.cjs (deleted)');\n}\n\n// 2) Remove owner-specific questionnaire prefill and personal identity gate.`,
);
source = source
  .split('\n')
  .map((line) => {
    if (line.includes("text = removeConstFunction(text, 'const handleOwnerPrefill")) {
      return `${line}\n  text = text.replace(/\\n\\s*let filled = 0;[\\s\\S]*?(?=\\n\\s*\\/\\/ Auto-fill from documents states)/, '\\n');`;
    }
    if (line.includes("text = removeSection(text, '  // Get session summary'")) {
      return `  text = text.replace(/\\n\\s*\\/\\/ Get session summary[\\s\\S]*?(?=\\n\\s*\\/\\/ Submit answer and get AI feedback)/, '\\n');`;
    }
    if (line.includes("text = text.replace(/\\s*<Button[\\s\\S]*?setSearchEmail")) return '  // Keep the dashboard JSX structure; sensitive preset values are neutralised below.';
    if (line.includes("text = text.replace(/\\s*<Card[^>]*>[\\s\\S]*?Active Case: Adamya Raj")) return '  // Keep the dashboard JSX structure; sensitive active-case copy is neutralised below.';
    if (line.includes("text = text.replace(/\\s*<Button[\\s\\S]*?loadAdamyaCase")) return '  // Keep the dashboard JSX structure; the removed preset handler is disabled below.';
    if (line.includes("text = text.replace(/\\s*<Button[\\s\\S]*?adamyaraj2%40gmail")) return '  // Keep the dashboard JSX structure; the case-specific link is neutralised below.';
    if (line.includes('if (/benedict9211@gmail')) return '  if (false) {';
    if (line.includes('/benedict9211@gmail') && !line.includes('if (')) {
      return `${line}\n  /BENEDICT_PREFILL_DATA/,\n  /handleOwnerPrefill/,`;
    }
    if (line.includes('if (/adamyaraj2|Adamya Raj|du_1TIKfKK9BSTYpDOqrDunVaVy|loadAdamyaCase/')) {
      return `  text = text.replaceAll(\"onClick={loadAdamyaCase}\", \"disabled\");\n  text = text.replaceAll(\"onClick={() => { setSearchEmail('adamyaraj2@gmail.com'); setQueryEmail('adamyaraj2@gmail.com'); }}\", \"disabled\");\n  text = text.replaceAll(\"adamyaraj2@gmail.com\", \"\");\n  text = text.replaceAll(\"Adamya Raj (£110 dispute)\", \"Case preset removed\");\n  text = text.replaceAll(\"Active Case: Adamya Raj — £110 Chargeback\", \"Dispute response guidance\");\n  text = text.replaceAll(\"Adamya Raj\", \"Customer\");\n  text = text.replaceAll(\"du_1TIKfKK9BSTYpDOqrDunVaVy\", \"\");\n  text = text.replaceAll(\"14 May 2026\", \"the response deadline\");\n  text = text.replaceAll(\"2026-05-14\", \"\");\n  text = text.replace(' → find <code className=\\"bg-muted px-1 rounded\\"></code>', '');\n  if (/adamyaraj2|Adamya Raj|du_1TIKfKK9BSTYpDOqrDunVaVy|loadAdamyaCase/.test(text)) {\n    for (const marker of ['adamyaraj2', 'Adamya Raj', 'du_1TIKfKK9BSTYpDOqrDunVaVy', 'loadAdamyaCase']) {\n      const markerIndex = text.indexOf(marker);\n      if (markerIndex >= 0) console.error('REMAINING_ADMIN_CASE', marker, text.slice(Math.max(0, markerIndex - 500), markerIndex + 900));\n    }`;
    }
    if (line.includes('if (pattern.test(source)) throw new Error')) {
      return `    if (pattern.test(source)) {\n      const found = source.match(pattern);\n      const foundIndex = found?.index ?? -1;\n      console.error('REMAINING_SENSITIVE_CONTEXT', path.relative(root, full), String(pattern), foundIndex >= 0 ? source.slice(Math.max(0, foundIndex - 600), foundIndex + 1200) : 'no context');\n      throw new Error(\`Forbidden hardcoded sensitive value remains in \${path.relative(root, full)}: \${pattern}\`);\n    }`;
    }
    return line;
  })
  .join('\n');
fs.writeFileSync(file, source);
console.log('Normalised one-shot remediation script');
