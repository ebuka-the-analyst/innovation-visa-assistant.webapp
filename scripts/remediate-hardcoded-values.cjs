const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = process.cwd();
const changed = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, text) {
  const abs = path.join(root, rel);
  const before = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (before !== text) {
    fs.writeFileSync(abs, text);
    changed.push(rel);
  }
}

function scriptKindFor(rel) {
  if (rel.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (rel.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (rel.endsWith('.ts')) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function parse(rel, text) {
  return ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, scriptKindFor(rel));
}

function replaceRange(text, start, end, replacement) {
  return text.slice(0, start) + replacement + text.slice(end);
}

function findVariableStatement(rel, text, variableName) {
  const sf = parse(rel, text);
  let result = null;
  function visit(node) {
    if (result) return;
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) {
          result = { start: node.getFullStart(), end: node.getEnd() };
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return result;
}

function replaceVariable(rel, text, variableName, replacement, required = true) {
  const range = findVariableStatement(rel, text, variableName);
  if (!range) {
    if (required) throw new Error(`${rel}: variable ${variableName} not found`);
    return text;
  }
  return replaceRange(text, range.start, range.end, `\n${replacement}`);
}

function removeVariable(rel, text, variableName, required = true) {
  return replaceVariable(rel, text, variableName, '', required);
}

function replaceRequired(text, search, replacement, label) {
  if (search instanceof RegExp) {
    if (!search.test(text)) throw new Error(`Required pattern not found: ${label}`);
    search.lastIndex = 0;
    return text.replace(search, replacement);
  }
  if (!text.includes(search)) throw new Error(`Required text not found: ${label}`);
  return text.replace(search, replacement);
}

function replaceAllLiteral(text, search, replacement) {
  return text.split(search).join(replacement);
}

function findExpressRouteStatement(rel, text, method, routePath) {
  const sf = parse(rel, text);
  let result = null;
  function visit(node) {
    if (result) return;
    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
      const call = node.expression;
      const expr = call.expression;
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.name.text === method &&
        call.arguments.length > 0 &&
        ts.isStringLiteralLike(call.arguments[0]) &&
        call.arguments[0].text === routePath
      ) {
        result = { start: node.getFullStart(), end: node.getEnd() };
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return result;
}

function replaceExpressRoute(rel, text, method, routePath, replacement, required = true) {
  const range = findExpressRouteStatement(rel, text, method, routePath);
  if (!range) {
    if (required) throw new Error(`${rel}: route ${method.toUpperCase()} ${routePath} not found`);
    return text;
  }
  return replaceRange(text, range.start, range.end, `\n${replacement}`);
}

// 1) Authentication: never run with a predictable fallback session secret.
{
  const rel = 'server/auth.ts';
  let text = read(rel);
  text = replaceRequired(
    text,
    /\s*\/\/ Use SESSION_SECRET from environment, or generate a warning with fallback\s*\n\s*const sessionSecret = process\.env\.SESSION_SECRET;\s*\n\s*if \(!sessionSecret\) \{\s*\n\s*console\.warn\([^\n]+\);\s*\n\s*\}/m,
    `\n  // SESSION_SECRET is security-critical. Refuse to start rather than silently\n  // falling back to a predictable value.\n  const sessionSecret = process.env.SESSION_SECRET;\n  if (!sessionSecret) {\n    throw new Error('[Auth] SESSION_SECRET is required. Refusing to start with an insecure fallback.');\n  }`,
    'SESSION_SECRET fallback block',
  );
  text = replaceRequired(
    text,
    `secret: sessionSecret || 'ukivfa-fallback-session-secret-change-in-production',`,
    `secret: sessionSecret,`,
    'session secret fallback value',
  );
  write(rel, text);
}

// 2) Questionnaire: remove person-specific prefills and fabricated evidence templates.
{
  const rel = 'client/src/components/QuestionnaireForm.tsx';
  let text = read(rel);

  text = removeVariable(rel, text, 'BENEDICT_PREFILL_DATA');
  text = replaceVariable(rel, text, 'isOwner', `  const isOwner = false;`);
  text = replaceVariable(
    rel,
    text,
    'handleOwnerPrefill',
    `  const handleOwnerPrefill = () => {\n    toast({\n      title: "Personal prefill is disabled",\n      description: "Use your saved profile or document auto-fill so application answers always come from your own evidence.",\n    });\n  };`,
  );
  text = replaceVariable(rel, text, 'isFounderAccount', `  const isFounderAccount = false;`);
  text = replaceVariable(
    rel,
    text,
    'handleTestAutoFill',
    `  const handleTestAutoFill = () => {\n    toast({\n      title: "Demo evidence autofill removed",\n      description: "For safety, the questionnaire no longer inserts invented traction, financial, customer, patent or regulatory claims.",\n    });\n  };`,
  );
  text = replaceVariable(
    rel,
    text,
    'handleLoadIndustryTemplate',
    `  const handleLoadIndustryTemplate = (industry: string, templateIndex: number) => {\n    const definition = INDUSTRY_TEMPLATES[industry as keyof typeof INDUSTRY_TEMPLATES];\n    if (!definition) return;\n\n    const selectedName = definition.templates[templateIndex] || definition.name;\n    const suggestedBusinessName = selectedName.includes(" - ")\n      ? selectedName.split(" - ")[0].trim()\n      : "";\n    const updated = {\n      ...formData,\n      industry: definition.name,\n      ...(suggestedBusinessName && !formData.businessName ? { businessName: suggestedBusinessName } : {}),\n    };\n\n    setFormData(updated);\n    saveAllFields(updated);\n    setShowTemplateModal(false);\n    setSelectedIndustry(null);\n    setSelectedTemplate(null);\n    toast({\n      title: "Industry outline loaded",\n      description: "Only neutral structure was applied. Add your own evidence, figures and claims.",\n    });\n  };`,
  );

  text = replaceAllLiteral(text, 'UK Visa Assistant - Benedict Umeh', 'LegalTech Venture Outline');
  text = replaceAllLiteral(text, 'NHS Procurement Intelligence, CARE-AI pediatric platform, BhenMedia work. Show domain expertise.', 'Describe only projects you personally delivered and explain how they demonstrate relevant domain expertise.');
  text = replaceAllLiteral(text, 'Your previous £15K for healthcare venture flagged as insufficient', 'Build a realistic, evidence-backed financial model for this venture.');
  text = replaceAllLiteral(text, '£50K personal savings, £30K family loan, £20K Innovate UK grant (ref: XXXXX). Be specific with amounts.', 'List each funding source, amount and supporting evidence. Do not include funding that is not secured or documented.');
  text = replaceAllLiteral(text, 'Month-by-month revenue and costs for 3 years. Year 1 totals not enough. Include: Month 1: £0 revenue, £5K costs. Month 2: £2K revenue, £6K costs...', 'Provide month-by-month revenue, costs and cash position for 36 months, using assumptions you can explain and evidence.');
  text = replaceAllLiteral(text, 'How many months to recover CAC? Must be <12 months ideally', 'State the expected payback period and explain the assumptions behind it.');
  text = replaceAllLiteral(text, 'Development: £40K, DCB0129: £20K, DCB0160: £30K, Marketing: £15K, Operations: £10K, etc. Healthcare requires regulatory costs!', 'Break down development, regulatory, staffing, marketing and operating costs that genuinely apply to your business.');
  text = replaceAllLiteral(text, 'Generic claims rejected. Name 5+ real competitors.', 'Use named, verifiable competitors and evidence-based comparisons.');
  text = replaceAllLiteral(text, 'List 5+ Named Competitors', 'Named Competitors');
  text = replaceAllLiteral(text, 'DrDoctor, Patchs, Lantum, Numan, Babylon Health, etc. For each: their strengths, weaknesses, pricing, target market', 'For each relevant competitor, record verifiable strengths, weaknesses, pricing where public, and target market.');
  text = replaceAllLiteral(text, "'73% faster than Competitor X (validated with n=1,200), 90% less training data required, £5K vs £50K annual cost.' Specific metrics, not buzzwords.", 'Use only measurable advantages you can substantiate with your own evidence or cited public sources.');
  text = replaceAllLiteral(text, '80% rejection reason: No customer validation. This is critical.', 'Customer validation is important evidence. Record only validation you actually carried out.');
  text = replaceAllLiteral(text, 'Customer Discovery Interviews (20-30 minimum)', 'Customer Discovery Evidence');
  text = replaceAllLiteral(text, 'Summarize findings: Who did you interview? What did you learn? What pain points validated? What are they willing to pay?', 'Summarise the customer discovery you actually completed, including participants, method, findings and evidence.');
  text = replaceAllLiteral(text, "Even non-paying pilots count. '3 NHS Trusts signed LOIs (see Appendix) representing £180K potential Year 1 revenue'", 'Describe genuine letters of intent, pilots or partnership evidence and reference the supporting documents.');
  text = replaceAllLiteral(text, 'Survey data, pilot pricing tests, LOI values. Show customers will actually pay.', 'Provide genuine willingness-to-pay evidence such as surveys, pilots, signed agreements or paid transactions.');
  text = replaceAllLiteral(text, 'TAM: All UK healthcare providers. SAM: Small clinics 5-50 staff (~1,500 clinics). SOM: 0.5-2% in Year 1 (8-30 clinics). Be specific.', 'Show how you calculated TAM, SAM and SOM. Cite the source and date for external market data.');
  text = replaceAllLiteral(text, 'Critical for healthcare: missing this = instant rejection', 'Identify the regulatory and compliance requirements that actually apply to your business.');
  text = replaceAllLiteral(text, 'Healthcare: DCB0129 (£10-30K), DCB0160 (£15-40K), Cyber Essentials Plus (£5K), ISO 27001 (£20-50K). Other sectors: list relevant standards.', 'List only applicable regulatory requirements and cite the official or authoritative source for each one.');
  text = replaceAllLiteral(text, 'Month 1-3: DCB0129. Month 4-9: DCB0160. Month 10-12: ISO 27001. Be realistic.', 'Build a realistic compliance timeline based on the requirements that apply to your business and the current guidance from the relevant authority.');
  text = replaceAllLiteral(text, "For healthcare minimum £50-120K. Don't underestimate.", 'Estimate your compliance budget from current quotes, fees and documented assumptions.');
  text = replaceAllLiteral(text, "Year 1: CTO (£60K), Clinical Safety Officer (£55K). Year 2: 2x Sales (£40K each), Customer Success (£35K). Year 3: etc. Specific roles, salaries, milestones.", 'List the roles, timing, salary assumptions and business milestones that support each hire.');
  text = replaceAllLiteral(text, "'Greater London, Greater Manchester, West Midlands' not 'key UK regions'. Be specific.", 'Name the specific regions you intend to target and explain the evidence for choosing them.');
  text = replaceAllLiteral(text, 'You must show you\'ve researched endorsing bodies', 'Show that your endorser strategy is based on the current official endorsing-body information.');
  text = replaceAllLiteral(text, 'Envestors, UKES, Innovator International, or Global Entrepreneurs Programme. Show you\'ve researched their requirements.', 'Select from the current official endorsing-body information and explain why the chosen route fits your business.');
  text = replaceAllLiteral(text, '6 Contact Points Strategy', 'Endorser Contact Point Strategy');
  text = replaceAllLiteral(text, 'Innovator Founder Visa requires 6 contact points over 3 years. How will you achieve this? Quarterly reports, milestone reviews, annual strategy sessions?', 'Describe how you will meet the contact-point and monitoring requirements specified by your endorsing body and current route guidance.');

  for (const forbidden of [
    'benedict9211@gmail.com',
    'ebuka.umeh40@outlook.com',
    'Benedict Ebuka Umeh',
    'Benedict (Ebuka) Umeh',
  ]) {
    if (text.includes(forbidden)) throw new Error(`${rel}: personal literal remains after remediation: ${forbidden}`);
  }
  write(rel, text);
}

// 3) Admin console: remove the source-controlled customer dispute preset/PII.
{
  const rel = 'client/src/pages/admin-dashboard.tsx';
  let text = read(rel);
  text = replaceVariable(
    rel,
    text,
    'loadAdamyaCase',
    `  const loadAdamyaCase = () => {\n    setDispCustomerEmail('');\n    setDispDisputeId('');\n    setDispAmount('');\n    setDispReason('');\n    setDispStatus('');\n    setDispDeadline('');\n    setDispNotes('');\n    setDispResolution('');\n    toast({\n      title: "Hard-coded dispute preset removed",\n      description: "Search current support records and enter the live Stripe dispute details instead.",\n    });\n  };`,
    false,
  );

  text = replaceAllLiteral(text, "onClick={() => { setSearchEmail('adamyaraj2@gmail.com'); setQueryEmail('adamyaraj2@gmail.com'); }}", "onClick={() => { setSearchEmail(''); setQueryEmail(''); }}");
  text = replaceAllLiteral(text, 'Adamya Raj (£110 dispute)', 'Search current support records');
  text = replaceAllLiteral(text, 'Active Case: Adamya Raj — £110 Chargeback', 'No hard-coded dispute selected');
  text = replaceAllLiteral(text, '<span className="font-mono">du_1TIKfKK9BSTYpDOqrDunVaVy</span> · adamyaraj2@gmail.com · Respond by <strong className="text-orange-600">14 May 2026</strong>', 'Use Support Search to load the current customer record and response deadline.');

  // Redact any residual copies of the retired case from source code rather than shipping customer data in the bundle.
  text = replaceAllLiteral(text, 'adamyaraj2@gmail.com', '');
  text = replaceAllLiteral(text, 'du_1TIKfKK9BSTYpDOqrDunVaVy', '');
  text = replaceAllLiteral(text, 'Adamya Raj', 'Selected customer');
  text = replaceAllLiteral(text, '£110', '');
  text = replaceAllLiteral(text, '2026-05-14', '');
  text = replaceAllLiteral(text, '14 May 2026', '');
  write(rel, text);
}

// 4) Backend: remove residual source-controlled copies of the retired customer case.
{
  const rel = 'server/routes.ts';
  let text = read(rel);
  text = replaceAllLiteral(text, 'adamyaraj2@gmail.com', '');
  text = replaceAllLiteral(text, 'du_1TIKfKK9BSTYpDOqrDunVaVy', '');
  text = replaceAllLiteral(text, 'Adamya Raj', 'Selected customer');

  // A production endpoint must never return a fabricated interview session.
  text = replaceExpressRoute(
    rel,
    text,
    'get',
    '/api/ai-interview/session/:sessionId',
    `  app.get('/api/ai-interview/session/:sessionId', isAuthenticated, async (_req, res) => {\n    return res.status(501).json({\n      error: 'Interview session retrieval is not implemented. No fabricated session data is returned.',\n    });\n  });`,
    false,
  );

  // Remove the random authoritative-looking score fallback. Missing evidence should not produce a plausible score.
  text = text.replace(/Math\.floor\(Math\.random\(\) \* 25\) \+ 65/g, '0');
  write(rel, text);
}

// 5) Success Stories: replace the hard-coded 100% approval claim with a metric derived from returned data.
{
  const rel = 'client/src/pages/success-stories.tsx';
  let text = read(rel);
  text = replaceRequired(
    text,
    '  const accessibleCount = allStories.filter(s => s.isAccessible).length;',
    '  const accessibleCount = allStories.filter(s => s.isAccessible).length;\n  const endorserCount = new Set(allStories.map(s => s.endorserBody).filter(Boolean)).size;',
    'success stories computed metrics',
  );
  text = replaceRequired(
    text,
    '<div className="text-xl font-bold text-purple-500">100%</div>\n              <p className="text-sm text-muted-foreground">Approved</p>',
    '<div className="text-xl font-bold text-purple-500">{endorserCount}</div>\n              <p className="text-sm text-muted-foreground">Endorsing Bodies</p>',
    'hard-coded success rate card',
  );
  write(rel, text);
}

// 6) Email infrastructure: remove production-domain fallback and make deploy-time config explicit.
{
  const rel = 'server/email.ts';
  let text = read(rel);
  text = text.replace(
    /const BASE_URL = process\.env\.BASE_URL \|\| ['"]https:\/\/innovatorfoundervisaassistant\.co\.uk['"];?/,
    `const BASE_URL = process.env.BASE_URL;\nif (!BASE_URL && process.env.NODE_ENV === 'production') {\n  throw new Error('[Email] BASE_URL is required in production.');\n}`,
  );
  text = text.replace(/\$\{BASE_URL\}/g, '${BASE_URL || "http://localhost:5000"}');
  write(rel, text);
}

// 7) Expert booking: keep edit-form defaults in one explicit environment-aware config object.
// These are UI defaults only; persisted expert settings remain authoritative.
{
  const rel = 'client/src/pages/expert-booking.tsx';
  let text = read(rel);
  const config = `const bookingFormDefaults = {\n  timezone: import.meta.env.VITE_DEFAULT_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",\n  bookingNoticeHours: import.meta.env.VITE_DEFAULT_BOOKING_NOTICE_HOURS || "24",\n  bookingHorizonDays: import.meta.env.VITE_DEFAULT_BOOKING_HORIZON_DAYS || "60",\n  slotIntervalMinutes: import.meta.env.VITE_DEFAULT_SLOT_INTERVAL_MINUTES || "30",\n  bufferMinutes: import.meta.env.VITE_DEFAULT_BOOKING_BUFFER_MINUTES || "15",\n  durationMinutes: import.meta.env.VITE_DEFAULT_CONSULTATION_DURATION_MINUTES || "60",\n  weekdays: [1, 2, 3, 4, 5],\n  startTime: import.meta.env.VITE_DEFAULT_BOOKING_START_TIME || "09:00",\n  endTime: import.meta.env.VITE_DEFAULT_BOOKING_END_TIME || "17:00",\n};\n\n`;
  if (!text.includes('const bookingFormDefaults = {')) {
    text = replaceRequired(text, 'const defaultConfig: ConfigFormState = {', config + 'const defaultConfig: ConfigFormState = {', 'expert booking default config');
  }
  text = replaceAllLiteral(text, '  timezone: "Europe/London",', '  timezone: bookingFormDefaults.timezone,');
  text = replaceAllLiteral(text, '  bookingNoticeHours: "24",', '  bookingNoticeHours: bookingFormDefaults.bookingNoticeHours,');
  text = replaceAllLiteral(text, '  bookingHorizonDays: "60",', '  bookingHorizonDays: bookingFormDefaults.bookingHorizonDays,');
  text = replaceAllLiteral(text, '  slotIntervalMinutes: "30",', '  slotIntervalMinutes: bookingFormDefaults.slotIntervalMinutes,');
  text = replaceAllLiteral(text, '  bufferMinutes: "15",', '  bufferMinutes: bookingFormDefaults.bufferMinutes,');
  text = replaceAllLiteral(text, '  durationMinutes: "60",', '  durationMinutes: bookingFormDefaults.durationMinutes,');
  text = replaceAllLiteral(text, '  weekdays: [1, 2, 3, 4, 5],', '  weekdays: bookingFormDefaults.weekdays,');
  text = replaceAllLiteral(text, '  startTime: "09:00",', '  startTime: bookingFormDefaults.startTime,');
  text = replaceAllLiteral(text, '  endTime: "17:00",', '  endTime: bookingFormDefaults.endTime,');
  write(rel, text);
}

// 8) Add a durable guard so critical hard-coded data cannot silently return.
{
  const rel = 'scripts/check-critical-hardcodes.cjs';
  const guard = `const fs = require('fs');\nconst { execFileSync } = require('child_process');\n\nconst files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })\n  .split('\\0')\n  .filter(Boolean)\n  .filter((file) => /^(client\\/src|server|shared)\\//.test(file))\n  .filter((file) => /\\.(?:ts|tsx|js|jsx|cjs|mjs)$/.test(file));\n\nconst forbidden = [\n  { label: 'predictable session fallback', re: /ukivfa-fallback-session-secret-change-in-production/ },\n  { label: 'retired customer email', re: /adamyaraj2@gmail\\.com/i },\n  { label: 'retired Stripe dispute id', re: /du_1TIKfKK9BSTYpDOqrDunVaVy/ },\n  { label: 'owner questionnaire prefill', re: /BENEDICT_PREFILL_DATA|benedict9211@gmail\\.com/i },\n  { label: 'founder-specific questionnaire gate', re: /ebuka\\.umeh40@outlook\\.com/i },\n  { label: 'fabricated random score fallback', re: /Math\\.floor\\(Math\\.random\\(\\) \\* 25\\) \\+ 65/ },\n];\n\nconst failures = [];\nfor (const file of files) {\n  let text;\n  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }\n  for (const rule of forbidden) {\n    if (rule.re.test(text)) failures.push(rule.label + ': ' + file);\n  }\n}\n\nif (failures.length) {\n  console.error('Critical hard-coded data guard failed:');\n  for (const failure of failures) console.error(' - ' + failure);\n  process.exit(1);\n}\nconsole.log('Critical hard-coded data guard passed.');\n`;
  write(rel, guard);
}

console.log(`Remediated ${changed.length} file(s): ${changed.join(', ')}`);
