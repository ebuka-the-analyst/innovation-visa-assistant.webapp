const fs = require('fs');
const path = require('path');

const root = process.cwd();
const changed = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
function write(file, content) {
  fs.writeFileSync(path.join(root, file), content);
  changed.push(file);
}
function replaceOnce(text, search, replacement, label) {
  if (search instanceof RegExp) {
    const matches = text.match(search);
    if (!matches) throw new Error(`Expected pattern not found: ${label}`);
    const next = text.replace(search, replacement);
    if (next === text) throw new Error(`Pattern produced no change: ${label}`);
    return next;
  }
  const first = text.indexOf(search);
  if (first < 0) throw new Error(`Expected text not found: ${label}`);
  if (text.indexOf(search, first + search.length) >= 0) throw new Error(`Expected one occurrence but found multiple: ${label}`);
  return text.slice(0, first) + replacement + text.slice(first + search.length);
}
function removeSection(text, startMarker, endMarker, label, keepEnd = true) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`Start marker not found: ${label}`);
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`End marker not found: ${label}`);
  return text.slice(0, start) + (keepEnd ? text.slice(end) : text.slice(end + endMarker.length));
}
function findBalancedBraceEnd(text, openIndex) {
  let depth = 0;
  let state = 'code';
  let quote = '';
  let escaped = false;
  for (let i = openIndex; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (state === 'lineComment') {
      if (c === '\n') state = 'code';
      continue;
    }
    if (state === 'blockComment') {
      if (c === '*' && n === '/') { state = 'code'; i++; }
      continue;
    }
    if (state === 'string') {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === quote) { state = 'code'; quote = ''; }
      continue;
    }
    if (state === 'template') {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === '`') { state = 'code'; continue; }
      continue;
    }
    if (c === '/' && n === '/') { state = 'lineComment'; i++; continue; }
    if (c === '/' && n === '*') { state = 'blockComment'; i++; continue; }
    if (c === '"' || c === "'") { state = 'string'; quote = c; continue; }
    if (c === '`') { state = 'template'; continue; }
    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('Unbalanced braces');
}
function removeConstFunction(text, token, label, commentMarker) {
  let start = text.indexOf(token);
  if (start < 0) throw new Error(`Function token not found: ${label}`);
  if (commentMarker) {
    const comment = text.lastIndexOf(commentMarker, start);
    if (comment >= 0 && start - comment < 500) start = comment;
  }
  const fnStart = text.indexOf(token, start);
  const open = text.indexOf('{', fnStart + token.length);
  if (open < 0) throw new Error(`Opening brace not found: ${label}`);
  const close = findBalancedBraceEnd(text, open);
  let end = close + 1;
  while (text[end] === ' ' || text[end] === '\t') end++;
  if (text[end] === ';') end++;
  while (text[end] === '\r' || text[end] === '\n') end++;
  return text.slice(0, start) + text.slice(end);
}

// 1) Remove source-controlled founder PII/profile data completely.
const founderPath = path.join(root, 'shared/founderData.ts');
if (fs.existsSync(founderPath)) {
  fs.unlinkSync(founderPath);
  changed.push('shared/founderData.ts (deleted)');
}

// 2) Remove owner-specific questionnaire prefill and personal identity gate.
{
  const file = 'client/src/components/QuestionnaireForm.tsx';
  let text = read(file);
  text = replaceOnce(
    text,
    '"UK Visa Assistant - Benedict Umeh"',
    '"VisaFlow - Immigration Guidance"',
    'replace named questionnaire example',
  );
  const prefillStart = '// Owner-only prefill data for benedict9211@gmail.com';
  const prefillIndex = text.indexOf(prefillStart);
  if (prefillIndex < 0) throw new Error('Owner prefill block not found');
  const objectStart = text.indexOf('{', text.indexOf('BENEDICT_PREFILL_DATA', prefillIndex));
  const objectEnd = findBalancedBraceEnd(text, objectStart);
  let prefillEnd = objectEnd + 1;
  while (text[prefillEnd] === ' ' || text[prefillEnd] === '\t') prefillEnd++;
  if (text[prefillEnd] === ';') prefillEnd++;
  while (text[prefillEnd] === '\r' || text[prefillEnd] === '\n') prefillEnd++;
  text = text.slice(0, prefillIndex) + text.slice(prefillEnd);

  text = text.replace(/\n\s*\/\/ Owner-only prefill: fills only empty fields with Benedict's data\s*\n\s*const isOwner = user\?\.email\?\.toLowerCase\(\) === 'benedict9211@gmail\.com';\s*\n/, '\n');
  text = removeConstFunction(text, 'const handleOwnerPrefill = () => {', 'owner prefill handler');
  text = replaceOnce(
    text,
    /\n\s*\{\/\* Owner-only prefill button \*\/\}\s*\n\s*\{isOwner && \([\s\S]*?\n\s*\)\}\s*\n/,
    '\n',
    'owner prefill JSX',
  );
  if (/benedict9211@gmail\.com|BENEDICT_PREFILL_DATA|handleOwnerPrefill|\bisOwner\b/.test(text)) {
    throw new Error('Owner-specific questionnaire hardcode remains');
  }
  write(file, text);
}

// 3) Remove predictable authentication secret fallback.
{
  const file = 'server/auth.ts';
  let text = read(file);
  if (!text.includes('import crypto from "crypto";')) {
    text = replaceOnce(text, 'import session from "express-session";\n', 'import session from "express-session";\nimport crypto from "crypto";\n', 'crypto import');
  }
  text = replaceOnce(
    text,
    /\s*\/\/ Use SESSION_SECRET from environment, or generate a warning with fallback\s*\n\s*const sessionSecret = process\.env\.SESSION_SECRET;\s*\n\s*if \(!sessionSecret\) \{\s*\n\s*console\.warn\("\[Auth\] WARNING: SESSION_SECRET not set\. Using fallback secret\. Set SESSION_SECRET in production!"\);\s*\n\s*\}\s*\n/,
    `\n  const configuredSessionSecret = process.env.SESSION_SECRET?.trim();\n  if (!configuredSessionSecret && process.env.NODE_ENV === "production") {\n    throw new Error("SESSION_SECRET must be configured in production");\n  }\n  const sessionSecret = configuredSessionSecret || crypto.randomBytes(48).toString("hex");\n  if (!configuredSessionSecret) {\n    console.warn("[Auth] SESSION_SECRET is not configured; using an ephemeral development secret. Sessions will reset when the process restarts.");\n  }\n`,
    'session secret setup',
  );
  text = replaceOnce(text, "secret: sessionSecret || 'ukivfa-fallback-session-secret-change-in-production',", 'secret: sessionSecret,', 'session secret use');
  if (text.includes('ukivfa-fallback-session-secret-change-in-production')) throw new Error('Predictable fallback session secret remains');
  write(file, text);
}

// 4) Remove a source-controlled real customer dispute/preset from the Admin UI.
{
  const file = 'client/src/pages/admin-dashboard.tsx';
  let text = read(file);
  text = text.replace("const [dispDeadline, setDispDeadline] = useState('2026-05-14');", "const [dispDeadline, setDispDeadline] = useState('');");
  text = text.replace("const [dispAdminName, setDispAdminName] = useState('support@innovatorfoundervisaassistant.co.uk');", "const [dispAdminName, setDispAdminName] = useState('');");
  if (text.includes('const loadAdamyaCase = () => {')) {
    text = removeConstFunction(text, 'const loadAdamyaCase = () => {', 'hardcoded customer dispute loader');
  }
  text = text.replace(/\s*<Button[\s\S]*?setSearchEmail\('adamyaraj2@gmail\.com'\)[\s\S]*?<\/Button>\s*/g, '\n');
  text = text.replace(/\s*<Card[^>]*>[\s\S]*?Active Case: Adamya Raj[\s\S]*?<\/Card>\s*/g, '\n');
  text = text.replace(/\s*<Button[\s\S]*?loadAdamyaCase[\s\S]*?<\/Button>\s*/g, '\n');
  text = text.replace(/\s*<Button[\s\S]*?adamyaraj2%40gmail\.com[\s\S]*?<\/Button>\s*/g, '\n');
  if (/adamyaraj2|Adamya Raj|du_1TIKfKK9BSTYpDOqrDunVaVy|loadAdamyaCase/.test(text)) {
    throw new Error('Real customer dispute data remains in admin-dashboard.tsx');
  }
  write(file, text);
}

// 5) Replace case-specific dispute response pack with a generic, user-supplied evidence pack.
{
  const file = 'server/routes.ts';
  let text = read(file);
  const genericDisputeRoute = `  // Generate a generic Stripe dispute response pack from administrator-supplied case data.\n  app.get("/api/admin/support/dispute-pack", requireAdmin, async (req, res) => {\n    const input = req.query as Record<string, unknown>;\n    const escapeHtml = (value: unknown) => String(value ?? "")\n      .replace(/&/g, "&amp;")\n      .replace(/</g, "&lt;")\n      .replace(/>/g, "&gt;")\n      .replace(/\"/g, "&quot;")\n      .replace(/'/g, "&#039;");\n    const field = (name: string) => escapeHtml(input[name]);\n    const customerEmail = field("customerEmail");\n    const disputeId = field("disputeId");\n    const amount = field("amount");\n    const reason = field("reason");\n    const status = field("status");\n    const deadline = field("deadline");\n    const notes = field("notes");\n    const resolution = field("resolution");\n    const evidence = field("evidence");\n    const adminName = field("adminName");\n    const preparedAt = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/London" }).format(new Date());\n\n    if (!customerEmail || !disputeId) {\n      return res.status(400).send("customerEmail and disputeId are required");\n    }\n\n    const html = \\`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Dispute Response Pack</title>\n<style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;color:#172033;line-height:1.55}h1,h2{color:#111827}.meta{display:grid;grid-template-columns:180px 1fr;gap:8px 16px;margin:24px 0}.box{border:1px solid #d1d5db;border-radius:8px;padding:16px;margin:16px 0;white-space:pre-wrap}.muted{color:#6b7280}@media print{body{margin:0;max-width:none}}</style></head><body>\n<h1>Merchant Dispute Response Pack</h1>\n<p class="muted">Prepared from administrator-supplied case records. Verify every statement and attach source evidence before submitting to the payment provider.</p>\n<div class="meta"><strong>Customer</strong><span>\\${customerEmail}</span><strong>Dispute ID</strong><span>\\${disputeId}</span><strong>Amount</strong><span>\\${amount || "Not supplied"}</span><strong>Reason</strong><span>\\${reason || "Not supplied"}</span><strong>Status</strong><span>\\${status || "Not supplied"}</span><strong>Response deadline</strong><span>\\${deadline || "Not supplied"}</span><strong>Prepared by</strong><span>\\${adminName || "Administrator"}</span><strong>Prepared at</strong><span>\\${preparedAt}</span></div>\n<h2>Case notes</h2><div class="box">\\${notes || "No case notes supplied."}</div>\n<h2>Resolution / merchant response</h2><div class="box">\\${resolution || "No resolution narrative supplied."}</div>\n<h2>Evidence inventory</h2><div class="box">\\${evidence || "No evidence inventory supplied."}</div>\n<h2>Submission checklist</h2><ul><li>Confirm the transaction and customer details against Stripe.</li><li>Attach the relevant communication thread and account/activity records.</li><li>Attach delivery or service-access evidence where applicable.</li><li>Ensure the response contains only facts supported by records.</li><li>Review the payment provider's current dispute requirements before submission.</li></ul>\n</body></html>\\`;\n    res.setHeader("Content-Type", "text/html; charset=utf-8");\n    res.send(html);\n  });\n\n`;
  text = removeSection(
    text,
    '  // Generate a professional Stripe dispute response pack as print-ready HTML',
    '  // Search user by email + return Stripe payment history + business plans',
    'case-specific dispute pack',
    true,
  );
  text = text.replace('  // Search user by email + return Stripe payment history + business plans', genericDisputeRoute + '  // Search user by email + return Stripe payment history + business plans');

  // Remove the production runtime demo-data seeding endpoint and its embedded demo credential/data generator.
  text = removeSection(
    text,
    '  // ============ COMPREHENSIVE DEMO DATA SEEDING ============',
    "  // Get demo user's data (for sample plans modal)",
    'runtime demo seed endpoint',
    true,
  );

  // The legacy session-summary endpoint returned fabricated progress/scores. Fail explicitly instead of inventing data.
  const sessionReplacement = `  // Session summaries are not persisted by this legacy interview flow.\n  // Do not fabricate progress or approval scores; callers must use the live interview response state.\n  app.get(\n    "/api/ai-interview/session/:sessionId",\n    isAuthenticated,\n    async (req, res) => {\n      return res.status(501).json({\n        error: "Persistent AI interview session summaries are not available for this legacy endpoint",\n        sessionId: req.params.sessionId,\n      });\n    },\n  );\n\n`;
  text = removeSection(text, '  // Get session summary', '  // Submit answer and get AI feedback', 'fabricated interview session endpoint', true);
  text = text.replace('  // Submit answer and get AI feedback', sessionReplacement + '  // Submit answer and get AI feedback');

  // Remove fabricated analytics and AI fallback scores. Zero means unavailable/unknown rather than invented confidence.
  text = text.replace('daily: Math.max(2, Math.floor(Math.random() * 5) + 1),', 'daily: 0,');
  text = text.replace(/: Math\.floor\(Math\.random\(\) \* 25\) \+ 65;/g, ': 0;');
  text = text.replace(/score: Math\.floor\(Math\.random\(\) \* 25\) \+ 65,/g, 'score: 0,');
  text = text.replace(/score: Math\.floor\(Math\.random\(\) \* 10\) \+ 65,/g, 'score: 0,');
  text = text.replace(/compliance: Math\.floor\(Math\.random\(\) \* 20\) \+ 75,/g, 'compliance: 0,');
  text = text.replace(/complianceScore: Math\.floor\(Math\.random\(\) \* 15\) \+ 80,/g, 'complianceScore: 0,');

  if (/adamyaraj2|Adamya Raj|du_1TIKfKK9BSTYpDOqrDunVaVy|Demo2024!Secure/.test(text)) {
    throw new Error('Case-specific customer/demo credentials remain in server/routes.ts');
  }
  write(file, text);
}

// 6) Remove an unsubstantiated static success-rate claim.
{
  const file = 'client/src/pages/success-stories.tsx';
  let text = read(file);
  text = text.replace('grid grid-cols-2 md:grid-cols-4 gap-4 mb-8', 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8');
  text = replaceOnce(
    text,
    /\s*<Card>\s*<CardContent className="p-4 text-center">\s*<div className="text-xl font-bold text-purple-500">100%<\/div>\s*<p className="text-sm text-muted-foreground">Approved<\/p>\s*<\/CardContent>\s*<\/Card>/,
    '',
    'static 100 percent approval claim',
  );
  if (text.includes('>100%</div>')) throw new Error('Static approval claim remains');
  write(file, text);
}

// 7) Basic regression assertions across runtime source for the known sensitive literals.
const runtimeFiles = [];
for (const base of ['client/src', 'server', 'shared']) {
  const stack = [path.join(root, base)];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(?:ts|tsx|js|jsx|cjs|mjs)$/.test(entry.name)) runtimeFiles.push(full);
    }
  }
}
const forbidden = [
  /benedict9211@gmail\.com/i,
  /adamyaraj2@gmail\.com/i,
  /du_1TIKfKK9BSTYpDOqrDunVaVy/,
  /Demo2024!Secure/,
  /ukivfa-fallback-session-secret-change-in-production/,
  /passportNumber:\s*["'][A-Z0-9]{6,12}["']/i,
];
for (const full of runtimeFiles) {
  const source = fs.readFileSync(full, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) throw new Error(`Forbidden hardcoded sensitive value remains in ${path.relative(root, full)}: ${pattern}`);
  }
}

console.log('Unsafe hardcode remediation complete. Changed:', changed);
