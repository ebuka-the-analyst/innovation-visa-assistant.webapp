const fs = require('fs');

const serverFile = 'server/progressTracker.cjs';
const clientFile = 'client/src/pages/progress.tsx';
let server = fs.readFileSync(serverFile, 'utf8');
let client = fs.readFileSync(clientFile, 'utf8');
const block = (lines) => lines.join('\n');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(before, after);
}

server = replaceOnce(server,
  block([
    'function normaliseStoredRow(row) {',
    '  return {',
    '    stepId: publicStepId(row.tool_id),',
    '    completionPercent: clampPercent(row.completion_percent),',
    '    status: row.status || "in_progress",',
    '    progressData: safeJson(row.progress_data, {}),',
    '    updatedAt: row.updated_at || null,',
    '  };',
    '}',
  ]),
  block([
    'function normaliseStoredRow(row) {',
    '  return {',
    '    stepId: publicStepId(row.tool_id),',
    '    completionPercent: clampPercent(row.completion_percent),',
    '    status: row.status || "in_progress",',
    '    progressData: safeJson(row.progress_data, {}),',
    '    updatedAt: row.updated_at || null,',
    '  };',
    '}',
    '',
    'function meaningfulText(value, minLength = 8) {',
    '  const text = String(value ?? "").trim();',
    '  if (text.length < minLength) return false;',
    '  return !/^(?:none|n\\/a|not applicable|not yet|no|0)$/i.test(text);',
    '}',
    '',
    'function affirmativeEvidenceText(value, minLength = 8) {',
    '  const text = String(value ?? "").trim();',
    '  if (!meaningfulText(text, minLength)) return false;',
    '  return !/(?:no customer interviews?|no interviews?|zero interviews?|not yet interviewed|no willingness to pay)/i.test(text);',
    '}',
    '',
    'function buildPlanEvidence(row) {',
    '  if (!row || String(row.status || "").toLowerCase() !== "completed") return null;',
    '',
    '  const financialChecks = [',
    '    ["monthly projections", meaningfulText(row.monthly_projections, 20)],',
    '    ["customer acquisition cost", Number(row.cac) > 0],',
    '    ["lifetime value", Number(row.ltv) > 0],',
    '    ["payback period", Number(row.payback_period) > 0],',
    '    ["funding sources", meaningfulText(row.funding_sources, 8)],',
    '    ["detailed costs", meaningfulText(row.detailed_costs, 20)],',
    '  ];',
    '  const financialCompleted = financialChecks.filter(([, passed]) => passed).length;',
    '',
    '  const marketChecks = [',
    '    ["competitor analysis", meaningfulText(row.competitors, 15)],',
    '    ["competitive differentiation", meaningfulText(row.competitive_differentiation, 15)],',
    '    ["market size", meaningfulText(row.market_size, 8)],',
    '    ["customer interviews", affirmativeEvidenceText(row.customer_interviews, 8)],',
    '    ["willingness-to-pay evidence", affirmativeEvidenceText(row.willingness_to_pay, 8)],',
    '  ];',
    '  const marketCompleted = marketChecks.filter(([, passed]) => passed).length;',
    '  const hasDemandSignal = Boolean(marketChecks[3][1] || marketChecks[4][1]);',
    '',
    '  return {',
    '    planId: row.id,',
    '    financial: {',
    '      satisfied: financialCompleted === financialChecks.length,',
    '      completedSignals: financialCompleted,',
    '      totalSignals: financialChecks.length,',
    '      missing: financialChecks.filter(([, passed]) => !passed).map(([label]) => label),',
    '    },',
    '    market: {',
    '      satisfied: marketCompleted >= 4 && hasDemandSignal,',
    '      percent: Math.round((marketCompleted / marketChecks.length) * 100),',
    '      completedSignals: marketCompleted,',
    '      totalSignals: marketChecks.length,',
    '      missing: marketChecks.filter(([, passed]) => !passed).map(([label]) => label),',
    '    },',
    '  };',
    '}',
  ]),
  'server evidence helpers');

server = replaceOnce(server,
  block([
    '        `SELECT id, business_name, status, pdf_url, created_at',
    '           FROM business_plans',
  ]),
  block([
    '        `SELECT id, business_name, status, pdf_url, created_at,',
    '                monthly_projections, cac, ltv, payback_period, funding_sources, detailed_costs,',
    '                competitors, competitive_differentiation, customer_interviews, willingness_to_pay, market_size',
    '           FROM business_plans',
  ]),
  'business plan evidence select');

server = replaceOnce(server,
  block([
    '    const completedPlans = planRows.filter((row) => String(row.status || "").toLowerCase() === "completed");',
    '    const activePlans = planRows.filter((row) => ["pending", "processing", "generating", "in_progress", "in-progress"].includes(String(row.status || "").toLowerCase()));',
    '    const latestPlan = planRows[0] || null;',
  ]),
  block([
    '    const completedPlans = planRows.filter((row) => String(row.status || "").toLowerCase() === "completed");',
    '    const activePlans = planRows.filter((row) => ["pending", "processing", "generating", "in_progress", "in-progress"].includes(String(row.status || "").toLowerCase()));',
    '    const latestPlan = planRows[0] || null;',
    '    const latestCompletedPlan = completedPlans[0] || null;',
    '    const planEvidence = buildPlanEvidence(latestCompletedPlan);',
  ]),
  'plan evidence calculation');

server = replaceOnce(server,
  block([
    '          latest: latestPlan',
    '            ? {',
    '                id: latestPlan.id,',
    '                businessName: latestPlan.business_name || "Unnamed business plan",',
    '                status: latestPlan.status || "unknown",',
    '                pdfUrl: latestPlan.pdf_url || null,',
    '                createdAt: latestPlan.created_at || null,',
    '                updatedAt: latestPlan.updated_at || null,',
    '              }',
    '            : null,',
  ]),
  block([
    '          latest: latestPlan',
    '            ? {',
    '                id: latestPlan.id,',
    '                businessName: latestPlan.business_name || "Unnamed business plan",',
    '                status: latestPlan.status || "unknown",',
    '                pdfUrl: latestPlan.pdf_url || null,',
    '                createdAt: latestPlan.created_at || null,',
    '              }',
    '            : null,',
    '          evidence: planEvidence,',
  ]),
  'plan evidence response');

client = replaceOnce(client,
  'type ProgressSource = "database" | "synced" | "browser" | "manual" | "none";',
  'type ProgressSource = "database" | "plan" | "synced" | "browser" | "manual" | "none";',
  'progress source type');

client = replaceOnce(client,
  block([
    '      latest: null | {',
    '        id: string;',
    '        businessName: string;',
    '        status: string;',
    '        pdfUrl?: string | null;',
    '        createdAt?: string | null;',
    '        updatedAt?: string | null;',
    '      };',
  ]),
  block([
    '      latest: null | {',
    '        id: string;',
    '        businessName: string;',
    '        status: string;',
    '        pdfUrl?: string | null;',
    '        createdAt?: string | null;',
    '      };',
    '      evidence: null | {',
    '        planId: string;',
    '        financial: { satisfied: boolean; completedSignals: number; totalSignals: number; missing: string[] };',
    '        market: { satisfied: boolean; percent: number; completedSignals: number; totalSignals: number; missing: string[] };',
    '      };',
  ]),
  'tracker response evidence type');

client = replaceOnce(client,
  block([
    '  if (stepId === "innovation-score") {',
    '    const data = readJson("innovation-score-state");',
    '    if (!data) return { percent: 0, status: "not-started", source: "none", detail: "No saved innovation assessment found." };',
  ]),
  block([
    '  if (stepId === "innovation-score") {',
    '    const data = readJson("innovation-score-state");',
    '    if (!data) {',
    '      if ((database?.businessPlans.completed || 0) > 0) {',
    '        return {',
    '          percent: 0,',
    '          status: "not-started",',
    '          source: "plan",',
    '          detail: "Innovation evidence exists in the completed business plan, but the separate innovation assessment has not been completed.",',
    '        };',
    '      }',
    '      return { percent: 0, status: "not-started", source: "none", detail: "No saved innovation assessment found." };',
    '    }',
  ]),
  'innovation plan context');

client = replaceOnce(client,
  block([
    '  if (stepId === "financial-projections") {',
    '    const data = readJson("financialProjectionsProgress");',
    '    if (!data || typeof data !== "object") {',
    '      return { percent: 0, status: "not-started", source: "none", detail: "No saved financial projection model found." };',
    '    }',
  ]),
  block([
    '  if (stepId === "financial-projections") {',
    '    const planFinancial = database?.businessPlans.evidence?.financial;',
    '    if (planFinancial?.satisfied) {',
    '      return {',
    '        percent: 100,',
    '        status: "completed",',
    '        source: "plan",',
    '        detail: "The completed business plan contains all " + planFinancial.totalSignals + " structured financial-model signals required by the tracker.",',
    '        completed: true,',
    '      };',
    '    }',
    '',
    '    const data = readJson("financialProjectionsProgress");',
    '    if (!data || typeof data !== "object") {',
    '      if (planFinancial && planFinancial.completedSignals > 0) {',
    '        const percent = Math.round((planFinancial.completedSignals / planFinancial.totalSignals) * 100);',
    '        return {',
    '          percent,',
    '          status: statusFromPercent(percent),',
    '          source: "plan",',
    '          detail: planFinancial.completedSignals + " of " + planFinancial.totalSignals + " financial-model signals are present in the completed business plan. Missing: " + planFinancial.missing.join(", ") + ".",',
    '        };',
    '      }',
    '      return { percent: 0, status: "not-started", source: "none", detail: "No saved financial projection model found." };',
    '    }',
  ]),
  'financial plan evidence');

client = replaceOnce(client,
  block([
    '  if (stepId === "market-research") {',
    '    const data = readJson("market-research-state");',
    '    if (!data || typeof data !== "object") {',
    '      return { percent: 0, status: "not-started", source: "none", detail: "No saved market research workspace found." };',
    '    }',
  ]),
  block([
    '  if (stepId === "market-research") {',
    '    const planMarket = database?.businessPlans.evidence?.market;',
    '    const data = readJson("market-research-state");',
    '    if (!data || typeof data !== "object") {',
    '      if (planMarket?.satisfied) {',
    '        return {',
    '          percent: 100,',
    '          status: "completed",',
    '          source: "plan",',
    '          detail: "The completed business plan contains " + planMarket.completedSignals + " of " + planMarket.totalSignals + " substantive market-validation signals, including a demand signal.",',
    '          completed: true,',
    '        };',
    '      }',
    '      if (planMarket && planMarket.completedSignals > 0) {',
    '        return {',
    '          percent: planMarket.percent,',
    '          status: statusFromPercent(planMarket.percent),',
    '          source: "plan",',
    '          detail: planMarket.completedSignals + " of " + planMarket.totalSignals + " market-validation signals are present in the completed business plan. Missing: " + planMarket.missing.join(", ") + ".",',
    '        };',
    '      }',
    '      return { percent: 0, status: "not-started", source: "none", detail: "No saved market research workspace found." };',
    '    }',
  ]),
  'market plan evidence');

client = replaceOnce(client,
  block([
    'function sourceLabel(source: ProgressSource): string {',
    '  if (source === "database") return "Verified from production records";',
    '  if (source === "synced") return "Synced to your account";',
  ]),
  block([
    'function sourceLabel(source: ProgressSource): string {',
    '  if (source === "database") return "Verified from production records";',
    '  if (source === "plan") return "Evidence found in completed business plan";',
    '  if (source === "synced") return "Synced to your account";',
  ]),
  'plan source label');

client = replaceOnce(client,
  block([
    '  const phaseProgress = useCallback((phase: JourneyPhase) => {',
    '    const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)).filter(Boolean) as ResolvedStep[];',
    '    if (!phaseSteps.length) return 0;',
    '    return Math.round(phaseSteps.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / phaseSteps.length);',
    '  }, [stepMap]);',
  ]),
  block([
    '  const phaseRequiredReadiness = useCallback((phase: JourneyPhase) => {',
    '    const required = phase.steps',
    '      .filter((step) => step.required)',
    '      .map((step) => stepMap.get(step.id))',
    '      .filter(Boolean) as ResolvedStep[];',
    '    if (!required.length) return 100;',
    '    return Math.round(required.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / required.length);',
    '  }, [stepMap]);',
  ]),
  'required-only phase readiness');

client = replaceOnce(client,
  block([
    '          {PHASES.map((phase) => {',
    '            const percent = phaseProgress(phase);',
    '            const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)!).filter(Boolean);',
    '            const phaseRequired = phaseSteps.filter((step) => step.required);',
    '            const phaseRequiredComplete = phaseRequired.filter((step) => step.status === "completed").length;',
  ]),
  block([
    '          {PHASES.map((phase) => {',
    '            const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)!).filter(Boolean);',
    '            const phaseRequired = phaseSteps.filter((step) => step.required);',
    '            const phaseOptional = phaseSteps.filter((step) => !step.required);',
    '            const requiredPercent = phaseRequiredReadiness(phase);',
    '            const phaseRequiredComplete = phaseRequired.filter((step) => step.status === "completed").length;',
    '            const phaseOptionalComplete = phaseOptional.filter((step) => step.status === "completed").length;',
  ]),
  'phase render calculations');

client = replaceOnce(client,
  block([
    '                      <div className="text-sm font-bold">{percent}% phase progress</div>',
    '                      <Progress value={percent} className="mt-2 h-2" />',
    '                      <div className="mt-1 text-[11px] text-muted-foreground">{phaseRequiredComplete}/{phaseRequired.length} required complete</div>',
  ]),
  block([
    '                      <div className="text-sm font-bold">{requiredPercent}% required readiness</div>',
    '                      <Progress value={requiredPercent} className="mt-2 h-2 bg-slate-200 dark:bg-slate-800" />',
    '                      <div className="mt-1 text-[11px] text-muted-foreground">',
    '                        {phaseRequiredComplete}/{phaseRequired.length} required complete',
    '                        {phaseOptional.length ? " · " + phaseOptionalComplete + "/" + phaseOptional.length + " optional complete" : ""}',
    '                      </div>',
  ]),
  'phase readiness presentation');

client = client.replaceAll('className="mt-3 h-2"', 'className="mt-3 h-2 bg-slate-200 dark:bg-slate-800"');
client = client.replaceAll('className="h-1.5"', 'className="h-1.5 bg-slate-200 dark:bg-slate-800"');

client = replaceOnce(client,
  block([
    '              <p><strong className="text-foreground">Production records</strong> are used for generated business plans, required document uploads, interview sessions and final document reviews.</p>',
    '              <p><strong className="text-foreground">Saved tool data</strong> is interpreted using each tool\'s real data structure rather than a single generic completion flag.</p>',
  ]),
  block([
    '              <p><strong className="text-foreground">Production records</strong> are used for generated business plans, required document uploads, interview sessions and final document reviews.</p>',
    '              <p><strong className="text-foreground">Business-plan evidence</strong> can satisfy a milestone only when the stored structured fields meet that milestone\'s explicit evidence rules. It does not automatically complete separate diagnostics such as Innovation Score.</p>',
    '              <p><strong className="text-foreground">Saved tool data</strong> is interpreted using each tool\'s real data structure rather than a single generic completion flag.</p>',
  ]),
  'measurement explanation');

fs.writeFileSync(serverFile, server);
fs.writeFileSync(clientFile, client);
console.log('Evidence-aware Progress Tracker patch applied');
