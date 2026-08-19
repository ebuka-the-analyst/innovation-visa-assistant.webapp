const { execFileSync } = require('child_process');

const output = execFileSync(process.execPath, ['scripts/audit-hardcoded-values.cjs'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

const lines = output.split(/\r?\n/);
const rawSummary = lines.find((line) => line.startsWith('HARDCODE_AUDIT_SUMMARY '));
const begin = lines.indexOf('HARDCODE_AUDIT_FINDINGS_BEGIN');
const end = lines.indexOf('HARDCODE_AUDIT_FINDINGS_END');
const findings = begin >= 0 && end > begin
  ? lines.slice(begin + 1, end).filter(Boolean).map((line) => JSON.parse(line))
  : [];

const runtimeScopes = new Set(['client-runtime', 'server-runtime', 'shared-runtime']);
const runtime = findings.filter((item) => runtimeScopes.has(item.scope));
const high = runtime.filter((item) => ['critical', 'high'].includes(item.severity));
const categoryCounts = {};
const fileCounts = {};
for (const item of runtime) {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  fileCounts[item.file] = (fileCounts[item.file] || 0) + 1;
}

console.log(rawSummary || 'HARDCODE_AUDIT_SUMMARY unavailable');
console.log('HARDCODE_RUNTIME_SUMMARY ' + JSON.stringify({
  runtimeFindings: runtime.length,
  runtimeHighOrCritical: high.length,
  byCategory: Object.fromEntries(Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])),
  topFiles: Object.entries(fileCounts).sort((a,b) => b[1] - a[1]).slice(0, 80),
}));

const priorityCategories = [
  'secret-literal',
  'admin-identity-hardcode',
  'admin-auth-static-rule',
  'phone-literal',
  'email-literal',
  'stripe-resource-id-literal',
  'localhost-runtime-reference',
  'env-fallback-literal',
  'plan-tier-static-rule',
  'credit-limit-static-value',
  'regulatory-policy-static-value',
  'money-literal',
  'demo-mock-placeholder',
  'ai-model-id-literal',
  'operational-numeric-default',
  'static-data-array',
  'production-domain-literal',
  'analytics-id-literal',
];

for (const category of priorityCategories) {
  const matches = runtime.filter((item) => item.category === category);
  if (!matches.length) continue;
  console.log(`HARDCODE_RUNTIME_CATEGORY ${category} count=${matches.length}`);
  const seen = new Set();
  let printed = 0;
  for (const item of matches) {
    const key = `${item.file}|${item.line}|${item.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(JSON.stringify(item));
    printed += 1;
    if (printed >= 80) break;
  }
}
