const fs = require('fs');

const server = fs.readFileSync('server/progressTracker.cjs', 'utf8');
const client = fs.readFileSync('client/src/pages/progress.tsx', 'utf8');

const checks = [
  ['server selects structured financial evidence', server.includes('monthly_projections, cac, ltv, payback_period, funding_sources, detailed_costs')],
  ['server selects structured market evidence', server.includes('competitors, competitive_differentiation, customer_interviews, willingness_to_pay, market_size')],
  ['server builds plan evidence', server.includes('function buildPlanEvidence(row)') && server.includes('evidence: planEvidence')],
  ['financial evidence requires complete signal set', server.includes('financialCompleted === financialChecks.length')],
  ['market evidence requires demand signal', server.includes('marketCompleted >= 4 && hasDemandSignal')],
  ['client supports plan evidence source', client.includes('"plan" | "synced"') && client.includes('Evidence found in completed business plan')],
  ['innovation is not auto-completed from plan', client.includes('separate innovation assessment has not been completed')],
  ['financial projections can be satisfied by structured plan evidence', client.includes('planFinancial?.satisfied')],
  ['market research can use structured plan evidence', client.includes('planMarket?.satisfied')],
  ['phase headline is required-only', client.includes('const requiredPercent = phaseRequiredReadiness(phase);') && client.includes('Required readiness') && client.includes('{requiredPercent}%')],
  ['optional completion is displayed separately', client.includes('optional complete')],
  ['progress tracks use neutral empty background', client.includes('bg-slate-200 dark:bg-slate-800')],
  ['legacy all-step phase percentage removed', !client.includes('const percent = phaseProgress(phase)')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) {
  console.error(`Evidence-aware Progress Tracker validation failed: ${failed.map(([label]) => label).join(', ')}`);
  process.exit(1);
}
console.log('Evidence-aware Progress Tracker validation passed');
