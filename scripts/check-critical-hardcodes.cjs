const fs = require('fs');
const { execFileSync } = require('child_process');

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => /^(client\/src|server|shared)\//.test(file))
  .filter((file) => /\.(?:ts|tsx|js|jsx|cjs|mjs)$/.test(file));

const forbidden = [
  { label: 'predictable session fallback', re: /ukivfa-fallback-session-secret-change-in-production/ },
  { label: 'retired customer email', re: /adamyaraj2@gmail\.com/i },
  { label: 'retired Stripe dispute id', re: /du_1TIKfKK9BSTYpDOqrDunVaVy/ },
  { label: 'owner questionnaire prefill', re: /BENEDICT_PREFILL_DATA|benedict9211@gmail\.com/i },
  { label: 'founder-specific questionnaire gate', re: /ebuka\.umeh40@outlook\.com/i },
  { label: 'fabricated random score fallback', re: /Math\.floor\(Math\.random\(\) \* 25\) \+ 65/ },
];

const failures = [];
for (const file of files) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const rule of forbidden) {
    if (rule.re.test(text)) failures.push(rule.label + ': ' + file);
  }
}

if (failures.length) {
  console.error('Critical hard-coded data guard failed:');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('Critical hard-coded data guard passed.');
