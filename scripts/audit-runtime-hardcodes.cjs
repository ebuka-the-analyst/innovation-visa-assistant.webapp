const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = process.cwd();
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((f) => /^(client\/src|server|shared)\//.test(f))
  .filter((f) => /\.(?:ts|tsx|js|jsx|cjs|mjs|json)$/.test(f))
  .filter((f) => !f.includes('/node_modules/') && !f.includes('/assets/'));

const categories = new Map();
const fileCounts = new Map();
let scannedLines = 0;

function record(category, severity, file, lineNo, line, reason, redact = false) {
  const item = {
    severity,
    file,
    line: lineNo,
    reason,
    excerpt: redact ? '[REDACTED]' : line.trim().replace(/\s+/g, ' ').slice(0, 360),
  };
  if (!categories.has(category)) categories.set(category, []);
  categories.get(category).push(item);
  fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
}

const secretShape = /(sk_(?:live|test)_[A-Za-z0-9]{8,}|rk_(?:live|test)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|pk_live_[A-Za-z0-9]{8,}|AIza[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
const nonPlatformEmail = /\b[A-Z0-9._%+-]+@(?!innovatorfoundervisaassistant\.co\.uk\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phone = /(?:\+44\s?\d{4}\s?\d{6}|\+234\s?\d{3}\s?\d{3}\s?\d{4}|\b0\d{10}\b)/;
const money = /(?:£|\$|€)\s?\d[\d,]*(?:\.\d{1,2})?/;
const url = /https?:\/\/[^\s"'`<>)\]}]+/;
const aiModel = /\b(?:gpt-[A-Za-z0-9._-]+|claude-[A-Za-z0-9._-]+|gemini-[A-Za-z0-9._-]+|qwen[A-Za-z0-9._-]*)\b/i;

for (const file of files) {
  const abs = path.join(root, file);
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch { continue; }
  if (text.includes('\u0000')) continue;
  const lines = text.split(/\r?\n/);
  scannedLines += lines.length;
  lines.forEach((line, i) => {
    const n = i + 1;
    const lower = line.toLowerCase();

    if (secretShape.test(line)) record('SECURITY_SECRET_LITERAL', 'critical', file, n, line, 'credential-shaped literal', true);
    if (/sessionSecret\s*\|\|\s*["'`]/.test(line) || /SESSION_SECRET.*fallback/i.test(line)) record('SECURITY_FALLBACK_SECRET', 'critical', file, n, line, 'session/auth secret has source-code fallback', true);
    if (/\b(?:isOwner|isAdmin|adminEmails?|allowedEmails?|whitelist|allowlist|superAdmin)\b/i.test(line) && /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(line)) record('IDENTITY_AUTH_GATE', 'critical', file, n, line, 'email identity embedded in owner/admin/auth logic');

    if (nonPlatformEmail.test(line)) record('PERSONAL_EMAIL', /client\/src|server\//.test(file) ? 'high' : 'medium', file, n, line, 'non-platform email embedded in runtime source');
    if (phone.test(line)) record('PERSONAL_PHONE', 'critical', file, n, line, 'phone number embedded in runtime source');
    if (/passport(?:Number| number)?\s*[:=]\s*["'`][A-Z0-9]{6,12}["'`]/i.test(line)) record('PERSONAL_PASSPORT', 'critical', file, n, line, 'passport identifier embedded in runtime source', true);
    if (/\b(?:currentAddress|registeredAddress|homeAddress|postcode)\b\s*:\s*["'`][^"'`]{5,}["'`]/i.test(line)) record('PERSONAL_ADDRESS', 'critical', file, n, line, 'address/postcode embedded in runtime source');
    if (/dateOfBirth\s*:\s*["'`][^"'`]+["'`]/i.test(line)) record('PERSONAL_DOB', 'critical', file, n, line, 'date of birth embedded in runtime source');

    if (/\b(?:mock|mocked|demo data|isDemoData|placeholder|fake|sample data|example data|seed data)\b/i.test(line)) record('DEMO_MOCK_SAMPLE', 'high', file, n, line, 'demo/mock/sample/placeholder marker in runtime source');

    if (money.test(line)) record('MONEY_VALUE', /visa|endorser|fee|price|plan|tier|credit|subscription|revenue|dispute|investment|salary|settlement/i.test(line) ? 'high' : 'medium', file, n, line, 'money amount embedded in source');
    if (/\bTIER_(?:PRICING|CREDITS)\b|\bFALLBACK_COIN_PACKS\b|\bPLAN_RANK\b|\bfallbackMinimumPlanByTool\b/.test(line)) record('COMMERCIAL_SOURCE_OF_TRUTH', 'high', file, n, line, 'pricing/credit/access configuration is source-coded');
    if (/\b(?:free|basic|premium|enterprise|ultimate)\b/i.test(line) && /\b(?:tier|plan|credit|price|access|subscription|quota|limit)\b/i.test(line)) record('PLAN_TIER_RULE', 'high', file, n, line, 'plan/tier/access rule embedded in source');
    if (/\b(?:credits?|coins?)\b/i.test(line) && /\b\d+\b/.test(line)) record('CREDIT_COIN_VALUE', 'high', file, n, line, 'credit/coin quantity embedded in source');

    if (/\b(?:Innovator Founder|Innovation Visa|Home Office|endorser|endorsement|maintenance funds|settlement|ILR|IAA|OISC|SRA|immigration)\b/i.test(line) && /(?:£|\b\d+(?:\.\d+)?\b|20\d{2})/.test(line)) record('REGULATORY_STATIC_VALUE', 'high', file, n, line, 'visa/regulatory content includes fixed numeric/date/money value');
    if (/POLICY_VERSION|POLICY_EFFECTIVE_DATE|IVS_POLICY_VERSION|CURRENT_BUSINESS_ENDORSERS/.test(line)) record('REGULATORY_VERSIONED_POLICY', 'high', file, n, line, 'versioned regulatory policy/config is source-coded');

    if (aiModel.test(line)) record('AI_MODEL_ID', 'medium', file, n, line, 'AI provider/model ID embedded in source');
    if (/process\.env\.[A-Z0-9_]+\s*\|\|\s*["'`][^"'`]+["'`]/.test(line)) record('ENV_FALLBACK', 'medium', file, n, line, 'environment variable has a literal fallback');
    if (/\b(?:timeout|Timeout|staleTime|gcTime|REFRESH_INTERVAL|PAGE_SIZE|bookingNoticeHours|bookingHorizonDays|slotIntervalMinutes|bufferMinutes|maxTokens|max_tokens|maxLength)\b/.test(line) && /\d/.test(line)) record('OPERATIONAL_DEFAULT', 'medium', file, n, line, 'operational threshold/default embedded in source');
    if (url.test(line)) record('URL_ENDPOINT', /localhost|127\.0\.0\.1/.test(line) ? 'high' : 'low', file, n, line, 'URL/domain embedded in source');

    if (/\bconst\s+[A-Za-z0-9_]*(?:TEMPLATES|QUESTIONS|FAQS|FAQs|STORIES|TESTIMONIALS|ENDORSERS|REQUIREMENTS|TOOLS|PLANS|TIERS|menuGroups|navTabs|navItems)\s*(?::[^=]+)?=\s*(?:\[|\{)/.test(line)) record('STATIC_BUSINESS_CONTENT', 'medium', file, n, line, 'business/content collection embedded in source');
  });
}

const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
const summary = {};
for (const [category, items] of categories) {
  summary[category] = {
    count: items.length,
    critical: items.filter(x => x.severity === 'critical').length,
    high: items.filter(x => x.severity === 'high').length,
    files: new Set(items.map(x => x.file)).size,
  };
}
console.log('RUNTIME_HARDCODE_SUMMARY ' + JSON.stringify({
  scannedFiles: files.length,
  scannedLines,
  totalCandidates: [...categories.values()].reduce((a,b) => a+b.length, 0),
  categories: summary,
  topFiles: [...fileCounts].sort((a,b) => b[1]-a[1]).slice(0, 60),
}));

for (const [category, items] of [...categories].sort((a,b) => (severityRank[b[1][0]?.severity]||0) - (severityRank[a[1][0]?.severity]||0))) {
  console.log(`RUNTIME_HARDCODE_CATEGORY ${category}`);
  const byFile = new Map();
  for (const item of items.sort((a,b) => (severityRank[b.severity]||0)-(severityRank[a.severity]||0))) {
    if (!byFile.has(item.file)) byFile.set(item.file, []);
    byFile.get(item.file).push(item);
  }
  let emitted = 0;
  for (const [file, fileItems] of [...byFile].sort((a,b) => b[1].length-a[1].length)) {
    console.log(JSON.stringify({ file, count: fileItems.length, examples: fileItems.slice(0, 4) }));
    emitted += 1;
    if (emitted >= 20) break;
  }
}
