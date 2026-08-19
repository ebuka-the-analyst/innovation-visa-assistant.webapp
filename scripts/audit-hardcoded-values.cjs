const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = process.cwd();
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root })
  .toString('utf8')
  .split('\0')
  .filter(Boolean);

const textExtensions = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json', '.html', '.css', '.scss',
  '.sql', '.md', '.yml', '.yaml', '.toml', '.xml', '.sh', '.txt', '.env', '.example'
]);
const directTextFiles = new Set([
  'Dockerfile', 'Procfile', 'railway.json', 'nixpacks.toml', '.env.example', '.gitignore'
]);
const skipFiles = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']);
const skipPrefixes = ['attached_assets/', 'client/src/assets/', 'public/'];

function isTextCandidate(file) {
  if (skipFiles.has(file) || skipPrefixes.some((prefix) => file.startsWith(prefix))) return false;
  if (directTextFiles.has(path.basename(file))) return true;
  return textExtensions.has(path.extname(file).toLowerCase());
}

function scopeFor(file) {
  if (file.startsWith('client/src/')) return 'client-runtime';
  if (file.startsWith('server/')) return 'server-runtime';
  if (file.startsWith('shared/')) return 'shared-runtime';
  if (file.startsWith('migrations/') || file.startsWith('drizzle/')) return 'database';
  if (file.startsWith('scripts/')) return 'build-script';
  if (file.startsWith('tests/') || file.includes('.test.') || file.includes('.spec.')) return 'test';
  if (file.startsWith('.github/')) return 'ci';
  return 'root-config-doc';
}

const secretPrefixRe = /(sk_(?:live|test)_[A-Za-z0-9]{8,}|rk_(?:live|test)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|pk_live_[A-Za-z0-9]{8,}|AIza[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig;
const urlRe = /https?:\/\/[^\s"'`<>)\]}]+/ig;
const phoneRe = /(?:\+44\s?\d{4}\s?\d{6}|\+234\s?\d{3}\s?\d{3}\s?\d{4}|\b0\d{10}\b)/g;
const moneyRe = /(?:£|\$|€)\s?\d[\d,]*(?:\.\d{1,2})?/g;
const dateRe = /\b20(?:2\d|3\d)[-\/]\d{1,2}[-\/]\d{1,2}\b/g;
const modelRe = /\b(?:gpt-[A-Za-z0-9._-]+|claude-[A-Za-z0-9._-]+|gemini-[A-Za-z0-9._-]+|qwen[A-Za-z0-9._-]*)\b/ig;
const stripeIdRe = /\b(?:price|prod|plink|cs_(?:live|test)|pi_|sub_|cus_)_[A-Za-z0-9]{8,}\b/g;
const analyticsIdRe = /\bG-[A-Z0-9]{6,}\b|\bUA-\d+-\d+\b/g;
const timezoneRe = /["'`](Europe\/London|UTC|America\/[A-Za-z_]+|Asia\/[A-Za-z_]+|Africa\/[A-Za-z_]+)["'`]/g;
const currencyRe = /["'`](GBP|USD|EUR)["'`]/g;

const findings = [];
const categoryCounts = new Map();
const fileCounts = new Map();
const scannedByScope = new Map();
let scannedFiles = 0;
let scannedLines = 0;

function add(category, file, lineNo, line, detail, severity = 'medium') {
  const trimmed = line.trim();
  if (!trimmed) return;
  const key = `${category}|${file}|${lineNo}|${detail}`;
  if (findings.some((f) => f.key === key)) return;
  let excerpt = trimmed.slice(0, 280);
  if (category === 'secret-literal') excerpt = '[REDACTED: possible secret literal]';
  findings.push({ key, category, severity, scope: scopeFor(file), file, line: lineNo, detail, excerpt });
  categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
}

function allMatches(regex, line) {
  regex.lastIndex = 0;
  return [...line.matchAll(regex)].map((m) => m[0]);
}

for (const file of tracked) {
  if (!isTextCandidate(file)) continue;
  const abs = path.join(root, file);
  let stat;
  try { stat = fs.statSync(abs); } catch { continue; }
  if (!stat.isFile() || stat.size > 3_000_000) continue;
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch { continue; }
  if (text.includes('\u0000')) continue;
  scannedFiles += 1;
  const scope = scopeFor(file);
  scannedByScope.set(scope, (scannedByScope.get(scope) || 0) + 1);
  const lines = text.split(/\r?\n/);
  scannedLines += lines.length;

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const lower = line.toLowerCase();
    const isCommentOnly = /^\s*(?:\/\/|\*|#)/.test(line);

    if (secretPrefixRe.test(line)) {
      add('secret-literal', file, lineNo, line, 'credential/token-shaped literal embedded in tracked source', 'critical');
    }
    const assignment = line.match(/\b(api[_-]?key|secret|password|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*["'`]([^"'`]{8,})["'`]/i);
    if (assignment && !/process\.env|import\.meta\.env|example|placeholder|your[_-]/i.test(line)) {
      add('secret-literal', file, lineNo, line, `literal assigned to sensitive field ${assignment[1]}`, 'critical');
    }

    for (const value of allMatches(emailRe, line)) {
      if (/example\.(com|org|co\.uk)$/i.test(value)) continue;
      const sev = /admin|owner|support|from|recipient|allow|whitelist|lawyer|expert/i.test(line) ? 'high' : 'medium';
      add('email-literal', file, lineNo, line, value, sev);
      if (/admin|isadmin|allowlist|whitelist|superuser|owner/i.test(line)) {
        add('admin-identity-hardcode', file, lineNo, line, 'email literal participates in admin/owner/allow-list logic or config', 'high');
      }
    }

    for (const value of allMatches(urlRe, line)) {
      if (/github\.com|npmjs\.com|schema\.org|w3\.org|typescriptlang\.org/i.test(value) && scopeFor(file) === 'root-config-doc') continue;
      const sev = /localhost|127\.0\.0\.1/.test(value) ? 'high' : /innovatorfoundervisaassistant\.co\.uk|gov\.uk|stripe|resend|railway|googleapis|google\.com/i.test(value) ? 'medium' : 'low';
      add('url-literal', file, lineNo, line, value, sev);
      if (/localhost|127\.0\.0\.1/.test(value)) add('localhost-runtime-reference', file, lineNo, line, value, 'high');
      if (/innovatorfoundervisaassistant\.co\.uk/i.test(value)) add('production-domain-literal', file, lineNo, line, value, 'medium');
    }

    for (const value of allMatches(phoneRe, line)) add('phone-literal', file, lineNo, line, value, 'high');
    for (const value of allMatches(stripeIdRe, line)) add('stripe-resource-id-literal', file, lineNo, line, value, 'high');
    for (const value of allMatches(analyticsIdRe, line)) add('analytics-id-literal', file, lineNo, line, value, 'medium');
    for (const value of allMatches(modelRe, line)) add('ai-model-id-literal', file, lineNo, line, value, 'medium');
    for (const value of allMatches(timezoneRe, line)) add('timezone-literal', file, lineNo, line, value, 'low');
    for (const value of allMatches(currencyRe, line)) add('currency-literal', file, lineNo, line, value, 'low');

    const moneyMatches = allMatches(moneyRe, line);
    if (moneyMatches.length) {
      const sev = /price|fee|cost|subscription|tier|consult|endorse|visa|settlement|revenue|target|investment/i.test(line) ? 'high' : 'medium';
      add('money-literal', file, lineNo, line, [...new Set(moneyMatches)].join(', '), sev);
    }

    const dateMatches = allMatches(dateRe, line);
    if (dateMatches.length) add('date-literal', file, lineNo, line, [...new Set(dateMatches)].join(', '), /visa|policy|deadline|effective|updated|expires/i.test(line) ? 'high' : 'low');

    if (/\b(mock|mocked|demo data|demodata|isdemodata|placeholder|fake|sample data|example data|seed data|hard.?coded|hardcode)\b/i.test(line)) {
      add('demo-mock-placeholder', file, lineNo, line, 'mock/demo/placeholder/sample marker', /client\/src|server\//.test(file) ? 'high' : 'medium');
    }

    if (/\b(?:free|basic|premium|enterprise|ultimate)\b/i.test(line) && /price|credit|tier|limit|quota|subscription|access|plan/i.test(line)) {
      add('plan-tier-static-rule', file, lineNo, line, 'subscription tier/access/price/credit rule expressed in source', 'high');
    }

    if (/\b(?:Innovator Founder|Home Office|endorser|endorsement|settlement|indefinite leave|ILR|IAA|OISC|SRA|immigration)\b/i.test(line) && /(?:£|\b\d+(?:\.\d+)?\b|20\d{2})/.test(line)) {
      add('regulatory-policy-static-value', file, lineNo, line, 'regulatory/visa statement includes a fixed numeric, money or date value', 'high');
    }

    if (/\b(?:credits?|coins?)\b/i.test(line) && /(?:[:=]\s*\d+|\b\d+\s*(?:credits?|coins?)\b|limit|tier)/i.test(line)) {
      add('credit-limit-static-value', file, lineNo, line, 'credit/coin quantity or rule expressed as source constant', 'high');
    }

    if (/\b(?:bookingNoticeHours|bookingHorizonDays|slotIntervalMinutes|bufferMinutes|maxConcurrentReviews|maxLength|staleTime|gcTime|timeout|retry|rateLimit|max_tokens|maxTokens|revenueTarget|dailyActiveTarget|PAGE_SIZE|REFRESH_INTERVAL)\b/.test(line) && /\d/.test(line)) {
      add('operational-numeric-default', file, lineNo, line, 'operational limit/default/target is fixed in source', 'medium');
    }

    if (/\bconst\s+[A-Z][A-Z0-9_]{2,}\s*=\s*(?:\d[\d_.]*|["'`][^"'`]+["'`]|\[[^\]]*)/.test(line) && !isCommentOnly) {
      add('top-level-config-constant', file, lineNo, line, 'uppercase configuration constant defined in source', 'low');
    }

    if (/\bconst\s+[A-Za-z0-9_]*(?:options|plans|tiers|features|questions|templates|stories|testimonials|endorsers|requirements|stages|steps|categories|services|faqs|faq|menuGroups|navItems|navTabs|tools|badges|achievements)\s*=\s*\[/i.test(line)) {
      add('static-data-array', file, lineNo, line, 'business/content collection is embedded as a source array', 'medium');
    }

    if (/\b(?:process\.env\.[A-Z0-9_]+\s*\|\||import\.meta\.env\.[A-Z0-9_]+\s*\|\|)\s*["'`][^"'`]+["'`]/.test(line)) {
      add('env-fallback-literal', file, lineNo, line, 'environment setting has a hardcoded fallback', 'medium');
    }

    if (/\b(?:isAdmin|adminEmail|adminEmails|allowedEmails|superAdmin|super_admin)\b/i.test(line) && /["'`][^"'`]+["'`]/.test(line) && !/type|interface|className/.test(line)) {
      add('admin-auth-static-rule', file, lineNo, line, 'admin/auth rule contains a literal', 'high');
    }

    if (/\b(?:setTimeout|setInterval)\s*\([^,]+,\s*\d[\d_]*\s*\)/.test(line)) {
      add('timer-literal', file, lineNo, line, 'timer duration fixed in source', 'low');
    }
  });
}

const important = findings.filter((f) => ['critical', 'high', 'medium'].includes(f.severity));
const high = findings.filter((f) => ['critical', 'high'].includes(f.severity));

console.log('HARDCODE_AUDIT_SUMMARY ' + JSON.stringify({
  trackedFiles: tracked.length,
  scannedFiles,
  scannedLines,
  scannedByScope: Object.fromEntries([...scannedByScope].sort()),
  findings: findings.length,
  importantFindings: important.length,
  highOrCriticalFindings: high.length,
  byCategory: Object.fromEntries([...categoryCounts].sort((a,b) => b[1] - a[1])),
  topFiles: [...fileCounts].sort((a,b) => b[1] - a[1]).slice(0, 40),
}));

console.log('HARDCODE_AUDIT_FINDINGS_BEGIN');
for (const finding of important) {
  const { key, ...safe } = finding;
  console.log(JSON.stringify(safe));
}
console.log('HARDCODE_AUDIT_FINDINGS_END');

// This is an audit/reporting script. Findings are candidates for manual review, not build failures.
process.exit(0);
