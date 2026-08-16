const fs = require('fs');

const serverFile = 'server/progressTracker.cjs';
const clientFile = 'client/src/pages/progress.tsx';
let server = fs.readFileSync(serverFile, 'utf8');
let client = fs.readFileSync(clientFile, 'utf8');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(before, after);
}

server = replaceOnce(
  server,
  `function normaliseStoredRow(row) {\n  return {\n    stepId: publicStepId(row.tool_id),\n    completionPercent: clampPercent(row.completion_percent),\n    status: row.status || "in_progress",\n    progressData: safeJson(row.progress_data, {}),\n    updatedAt: row.updated_at || null,\n  };\n}\n`,
  `function normaliseStoredRow(row) {\n  return {\n    stepId: publicStepId(row.tool_id),\n    completionPercent: clampPercent(row.completion_percent),\n    status: row.status || "in_progress",\n    progressData: safeJson(row.progress_data, {}),\n    updatedAt: row.updated_at || null,\n  };\n}\n\nfunction meaningfulText(value, minLength = 8) {\n  const text = String(value ?? "").trim();\n  if (text.length < minLength) return false;\n  return !/^(?:none|n\\/a|not applicable|not yet|no|0)$/i.test(text);\n}\n\nfunction affirmativeEvidenceText(value, minLength = 8) {\n  const text = String(value ?? "").trim();\n  if (!meaningfulText(text, minLength)) return false;\n  return !/(?:no customer interviews?|no interviews?|zero interviews?|not yet interviewed|no willingness to pay)/i.test(text);\n}\n\nfunction buildPlanEvidence(row) {\n  if (!row || String(row.status || "").toLowerCase() !== "completed") return null;\n\n  const financialChecks = [\n    ["monthly projections", meaningfulText(row.monthly_projections, 20)],\n    ["customer acquisition cost", Number(row.cac) > 0],\n    ["lifetime value", Number(row.ltv) > 0],\n    ["payback period", Number(row.payback_period) > 0],\n    ["funding sources", meaningfulText(row.funding_sources, 8)],\n    ["detailed costs", meaningfulText(row.detailed_costs, 20)],\n  ];\n  const financialCompleted = financialChecks.filter(([, passed]) => passed).length;\n\n  const marketChecks = [\n    ["competitor analysis", meaningfulText(row.competitors, 15)],\n    ["competitive differentiation", meaningfulText(row.competitive_differentiation, 15)],\n    ["market size", meaningfulText(row.market_size, 8)],\n    ["customer interviews", affirmativeEvidenceText(row.customer_interviews, 8)],\n    ["willingness-to-pay evidence", affirmativeEvidenceText(row.willingness_to_pay, 8)],\n  ];\n  const marketCompleted = marketChecks.filter(([, passed]) => passed).length;\n  const hasDemandSignal = Boolean(marketChecks[3][1] || marketChecks[4][1]);\n\n  return {\n    planId: row.id,\n    financial: {\n      satisfied: financialCompleted === financialChecks.length,\n      completedSignals: financialCompleted,\n      totalSignals: financialChecks.length,\n      missing: financialChecks.filter(([, passed]) => !passed).map(([label]) => label),\n    },\n    market: {\n      satisfied: marketCompleted >= 4 && hasDemandSignal,\n      percent: Math.round((marketCompleted / marketChecks.length) * 100),\n      completedSignals: marketCompleted,\n      totalSignals: marketChecks.length,\n      missing: marketChecks.filter(([, passed]) => !passed).map(([label]) => label),\n    },\n  };\n}\n`,
  'server evidence helpers',
);

server = replaceOnce(
  server,
  '`SELECT id, business_name, status, pdf_url, created_at\n           FROM business_plans',
  '`SELECT id, business_name, status, pdf_url, created_at,\n                monthly_projections, cac, ltv, payback_period, funding_sources, detailed_costs,\n                competitors, competitive_differentiation, customer_interviews, willingness_to_pay, market_size\n           FROM business_plans',
  'business plan evidence select',
);

server = replaceOnce(
  server,
  `    const completedPlans = planRows.filter((row) => String(row.status || "").toLowerCase() === "completed");\n    const activePlans = planRows.filter((row) => ["pending", "processing", "generating", "in_progress", "in-progress"].includes(String(row.status || "").toLowerCase()));\n    const latestPlan = planRows[0] || null;`,
  `    const completedPlans = planRows.filter((row) => String(row.status || "").toLowerCase() === "completed");\n    const activePlans = planRows.filter((row) => ["pending", "processing", "generating", "in_progress", "in-progress"].includes(String(row.status || "").toLowerCase()));\n    const latestPlan = planRows[0] || null;\n    const latestCompletedPlan = completedPlans[0] || null;\n    const planEvidence = buildPlanEvidence(latestCompletedPlan);`,
  'plan evidence calculation',
);

server = replaceOnce(
  server,
  `          latest: latestPlan\n            ? {\n                id: latestPlan.id,\n                businessName: latestPlan.business_name || "Unnamed business plan",\n                status: latestPlan.status || "unknown",\n                pdfUrl: latestPlan.pdf_url || null,\n                createdAt: latestPlan.created_at || null,\n                updatedAt: latestPlan.updated_at || null,\n              }\n            : null,`,
  `          latest: latestPlan\n            ? {\n                id: latestPlan.id,\n                businessName: latestPlan.business_name || "Unnamed business plan",\n                status: latestPlan.status || "unknown",\n                pdfUrl: latestPlan.pdf_url || null,\n                createdAt: latestPlan.created_at || null,\n              }\n            : null,\n          evidence: planEvidence,`,
  'plan evidence response',
);

client = replaceOnce(
  client,
  'type ProgressSource = "database" | "synced" | "browser" | "manual" | "none";',
  'type ProgressSource = "database" | "plan" | "synced" | "browser" | "manual" | "none";',
  'progress source type',
);

client = replaceOnce(
  client,
  `      latest: null | {\n        id: string;\n        businessName: string;\n        status: string;\n        pdfUrl?: string | null;\n        createdAt?: string | null;\n        updatedAt?: string | null;\n      };`,
  `      latest: null | {\n        id: string;\n        businessName: string;\n        status: string;\n        pdfUrl?: string | null;\n        createdAt?: string | null;\n      };\n      evidence: null | {\n        planId: string;\n        financial: { satisfied: boolean; completedSignals: number; totalSignals: number; missing: string[] };\n        market: { satisfied: boolean; percent: number; completedSignals: number; totalSignals: number; missing: string[] };\n      };`,
  'tracker response evidence type',
);

client = replaceOnce(
  client,
  `  if (stepId === "innovation-score") {\n    const data = readJson("innovation-score-state");\n    if (!data) return { percent: 0, status: "not-started", source: "none", detail: "No saved innovation assessment found." };`,
  `  if (stepId === "innovation-score") {\n    const data = readJson("innovation-score-state");\n    if (!data) {\n      if ((database?.businessPlans.completed || 0) > 0) {\n        return {\n          percent: 0,\n          status: "not-started",\n          source: "plan",\n          detail: "Innovation evidence exists in the completed business plan, but the separate innovation assessment has not been completed.",\n        };\n      }\n      return { percent: 0, status: "not-started", source: "none", detail: "No saved innovation assessment found." };\n    }`,
  'innovation plan context',
);

client = replaceOnce(
  client,
  `  if (stepId === "financial-projections") {\n    const data = readJson("financialProjectionsProgress");\n    if (!data || typeof data !== "object") {\n      return { percent: 0, status: "not-started", source: "none", detail: "No saved financial projection model found." };\n    }`,
  `  if (stepId === "financial-projections") {\n    const planFinancial = database?.businessPlans.evidence?.financial;\n    if (planFinancial?.satisfied) {\n      return {\n        percent: 100,\n        status: "completed",\n        source: "plan",\n        detail: `The completed business plan contains all ${planFinancial.totalSignals} structured financial-model signals required by the tracker.`,\n        completed: true,\n      };\n    }\n\n    const data = readJson("financialProjectionsProgress");\n    if (!data || typeof data !== "object") {\n      if (planFinancial && planFinancial.completedSignals > 0) {\n        const percent = Math.round((planFinancial.completedSignals / planFinancial.totalSignals) * 100);\n        return {\n          percent,\n          status: statusFromPercent(percent),\n          source: "plan",\n          detail: `${planFinancial.completedSignals} of ${planFinancial.totalSignals} financial-model signals are present in the completed business plan. Missing: ${planFinancial.missing.join(", ")}.`,\n        };\n      }\n      return { percent: 0, status: "not-started", source: "none", detail: "No saved financial projection model found." };\n    }`,
  'financial plan evidence',
);

client = replaceOnce(
  client,
  `  if (stepId === "market-research") {\n    const data = readJson("market-research-state");\n    if (!data || typeof data !== "object") {\n      return { percent: 0, status: "not-started", source: "none", detail: "No saved market research workspace found." };\n    }`,
  `  if (stepId === "market-research") {\n    const planMarket = database?.businessPlans.evidence?.market;\n    const data = readJson("market-research-state");\n    if (!data || typeof data !== "object") {\n      if (planMarket?.satisfied) {\n        return {\n          percent: 100,\n          status: "completed",\n          source: "plan",\n          detail: `The completed business plan contains ${planMarket.completedSignals} of ${planMarket.totalSignals} substantive market-validation signals, including a demand signal.`,\n          completed: true,\n        };\n      }\n      if (planMarket && planMarket.completedSignals > 0) {\n        return {\n          percent: planMarket.percent,\n          status: statusFromPercent(planMarket.percent),\n          source: "plan",\n          detail: `${planMarket.completedSignals} of ${planMarket.totalSignals} market-validation signals are present in the completed business plan. Missing: ${planMarket.missing.join(", ")}.`,\n        };\n      }\n      return { percent: 0, status: "not-started", source: "none", detail: "No saved market research workspace found." };\n    }`,
  'market plan evidence',
);

client = replaceOnce(
  client,
  `function sourceLabel(source: ProgressSource): string {\n  if (source === "database") return "Verified from production records";\n  if (source === "synced") return "Synced to your account";`,
  `function sourceLabel(source: ProgressSource): string {\n  if (source === "database") return "Verified from production records";\n  if (source === "plan") return "Evidence found in completed business plan";\n  if (source === "synced") return "Synced to your account";`,
  'plan source label',
);

client = replaceOnce(
  client,
  `  const phaseProgress = useCallback((phase: JourneyPhase) => {\n    const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)).filter(Boolean) as ResolvedStep[];\n    if (!phaseSteps.length) return 0;\n    return Math.round(phaseSteps.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / phaseSteps.length);\n  }, [stepMap]);`,
  `  const phaseRequiredReadiness = useCallback((phase: JourneyPhase) => {\n    const required = phase.steps\n      .filter((step) => step.required)\n      .map((step) => stepMap.get(step.id))\n      .filter(Boolean) as ResolvedStep[];\n    if (!required.length) return 100;\n    return Math.round(required.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / required.length);\n  }, [stepMap]);`,
  'required-only phase readiness',
);

client = replaceOnce(
  client,
  `          {PHASES.map((phase) => {\n            const percent = phaseProgress(phase);\n            const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)!).filter(Boolean);\n            const phaseRequired = phaseSteps.filter((step) => step.required);\n            const phaseRequiredComplete = phaseRequired.filter((step) => step.status === "completed").length;`,
  `          {PHASES.map((phase) => {\n            const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)!).filter(Boolean);\n            const phaseRequired = phaseSteps.filter((step) => step.required);\n            const phaseOptional = phaseSteps.filter((step) => !step.required);\n            const requiredPercent = phaseRequiredReadiness(phase);\n            const phaseRequiredComplete = phaseRequired.filter((step) => step.status === "completed").length;\n            const phaseOptionalComplete = phaseOptional.filter((step) => step.status === "completed").length;`,
  'phase render calculations',
);

client = replaceOnce(
  client,
  `                      <div className="text-sm font-bold">{percent}% phase progress</div>\n                      <Progress value={percent} className="mt-2 h-2" />\n                      <div className="mt-1 text-[11px] text-muted-foreground">{phaseRequiredComplete}/{phaseRequired.length} required complete</div>`,
  `                      <div className="text-sm font-bold">{requiredPercent}% required readiness</div>\n                      <Progress value={requiredPercent} className="mt-2 h-2 bg-slate-200 dark:bg-slate-800" />\n                      <div className="mt-1 text-[11px] text-muted-foreground">\n                        {phaseRequiredComplete}/{phaseRequired.length} required complete\n                        {phaseOptional.length ? ` · ${phaseOptionalComplete}/${phaseOptional.length} optional complete` : ""}\n                      </div>`,
  'phase readiness presentation',
);

client = client.replaceAll('className="mt-3 h-2"', 'className="mt-3 h-2 bg-slate-200 dark:bg-slate-800"');
client = client.replaceAll('className="h-1.5"', 'className="h-1.5 bg-slate-200 dark:bg-slate-800"');

client = replaceOnce(
  client,
  `<p><strong className="text-foreground">Production records</strong> are used for generated business plans, required document uploads, interview sessions and final document reviews.</p>\n              <p><strong className="text-foreground">Saved tool data</strong> is interpreted using each tool's real data structure rather than a single generic completion flag.</p>`,
  `<p><strong className="text-foreground">Production records</strong> are used for generated business plans, required document uploads, interview sessions and final document reviews.</p>\n              <p><strong className="text-foreground">Business-plan evidence</strong> can satisfy a milestone only when the stored structured fields meet that milestone's explicit evidence rules. It does not automatically complete separate diagnostics such as Innovation Score.</p>\n              <p><strong className="text-foreground">Saved tool data</strong> is interpreted using each tool's real data structure rather than a single generic completion flag.</p>`,
  'measurement explanation',
);

fs.writeFileSync(serverFile, server);
fs.writeFileSync(clientFile, client);
console.log('Evidence-aware Progress Tracker patch applied');
