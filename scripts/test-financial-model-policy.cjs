const assert = require('assert/strict');
const { FINANCIAL_MODEL_VERSION, HORIZON_MONTHS, assessFinancialModel } = require('../server/financialModelPolicy.cjs');

function evidence(type, index = 1) {
  return {
    id: `${type}-${index}`,
    type,
    title: `${type} evidence`,
    summary: `Documented evidence supporting the ${type} assumption used in the financial model.`,
    reference: `evidence/${type}/${index}`,
  };
}

function baseInput() {
  return {
    toolId: 'financial-projections',
    businessName: 'Example Finance Ltd',
    currency: 'GBP',
    startingCashGbp: 10000,
    committedFundingGbp: 0,
    oneTimeSetupCostGbp: 0,
    startingMonthlyRevenueGbp: 10000,
    baseMonthlyRevenueGrowthPct: 0,
    downsideMonthlyRevenueGrowthPct: 0,
    upsideMonthlyRevenueGrowthPct: 0,
    grossMarginPct: 80,
    fixedOperatingCostsMonthlyGbp: 1000,
    payrollMonthlyGbp: 3000,
    marketingMonthlyGbp: 500,
    otherOperatingCostsMonthlyGbp: 500,
    monthlyExpenseGrowthPct: 0,
    averageRevenuePerCustomerGbp: 100,
    customerAcquisitionCostGbp: 400,
    lifetimeValueGbp: 2000,
    monthlyChurnPct: 5,
    assumptionsNarrative: 'Revenue is based on signed customer pricing and operating costs are based on current supplier and salary benchmarks.',
    contingencyNarrative: 'If revenue is below plan, non-essential hiring and discretionary marketing will be delayed while customer conversion is improved.',
    evidenceItems: [
      evidence('setup_cost_quote'),
      evidence('payroll_benchmark'),
      evidence('pricing_evidence'),
      evidence('gross_margin_evidence'),
      evidence('funding_evidence'),
      evidence('cac_evidence'),
      evidence('ltv_evidence'),
    ],
  };
}

{
  const result = assessFinancialModel(baseInput());
  assert.equal(result.modelVersion, FINANCIAL_MODEL_VERSION);
  assert.equal(result.horizonMonths, HORIZON_MONTHS);
  assert.equal(result.scenarios.base.rows.length, 36);
  assert.equal(result.scenarios.base.rows[0].revenueGbp, 10000);
  assert.equal(result.scenarios.base.rows[0].cogsGbp, 2000);
  assert.equal(result.scenarios.base.rows[0].operatingExpensesGbp, 5000);
  assert.equal(result.scenarios.base.rows[0].operatingContributionGbp, 3000);
  assert.equal(result.scenarios.base.rows[0].closingCashGbp, 13000);
  assert.equal(result.scenarios.base.summary.operatingBreakEvenMonth, 1);
  assert.equal(result.scenarios.base.summary.totalRevenue36MonthsGbp, 360000);
  assert.equal(result.scenarios.base.summary.totalOperatingContribution36MonthsGbp, 108000);
  assert.equal(result.scenarios.base.summary.closingCashMonth36Gbp, 118000);
}

{
  const input = baseInput();
  input.startingCashGbp = 0;
  input.startingMonthlyRevenueGbp = 0;
  input.oneTimeSetupCostGbp = 10000;
  input.fixedOperatingCostsMonthlyGbp = 1000;
  input.payrollMonthlyGbp = 0;
  input.marketingMonthlyGbp = 0;
  input.otherOperatingCostsMonthlyGbp = 0;
  const result = assessFinancialModel(input);
  assert.equal(result.status, 'funding_or_model_gap');
  assert.equal(result.scenarios.base.summary.operatingBreakEvenMonth, null);
  assert.equal(result.scenarios.base.summary.firstNegativeCashMonth, 1);
  assert.equal(result.scenarios.base.summary.minimumCashGbp, -46000);
  assert.equal(result.scenarios.base.summary.fundingGapToStayNonNegativeGbp, 46000);
  assert.ok(result.warnings.some((warning) => warning.code === 'BASE_CASE_FUNDING_GAP'));
}

{
  const input = baseInput();
  input.startingMonthlyRevenueGbp = 1000;
  input.downsideMonthlyRevenueGrowthPct = 0;
  input.baseMonthlyRevenueGrowthPct = 5;
  input.upsideMonthlyRevenueGrowthPct = 10;
  input.fixedOperatingCostsMonthlyGbp = 0;
  input.payrollMonthlyGbp = 0;
  input.marketingMonthlyGbp = 0;
  input.otherOperatingCostsMonthlyGbp = 0;
  const result = assessFinancialModel(input);
  assert.ok(result.scenarios.downside.summary.totalRevenue36MonthsGbp < result.scenarios.base.summary.totalRevenue36MonthsGbp);
  assert.ok(result.scenarios.base.summary.totalRevenue36MonthsGbp < result.scenarios.upside.summary.totalRevenue36MonthsGbp);
  assert.ok(result.scenarios.downside.summary.closingCashMonth36Gbp < result.scenarios.base.summary.closingCashMonth36Gbp);
  assert.ok(result.scenarios.base.summary.closingCashMonth36Gbp < result.scenarios.upside.summary.closingCashMonth36Gbp);
}

{
  const result = assessFinancialModel(baseInput());
  assert.equal(result.unitEconomics.ltvCacRatio, 5);
  assert.equal(result.unitEconomics.cacPaybackMonths, 5);
  assert.equal(result.unitEconomics.impliedLifetimeMonthsFromChurn, 20);
  assert.equal(result.unitEconomics.impliedLtvFromChurnGbp, 1600);
}

{
  const input = baseInput();
  input.evidenceItems = [];
  const result = assessFinancialModel(input);
  assert.equal(result.assumptionEvidence.percent < 100, true);
  assert.ok(result.assumptionEvidence.gaps.length > 0);
  assert.equal(result.status, 'model_complete_evidence_incomplete');
}

{
  const input = baseInput();
  input.startingCashGbp = 5000;
  input.committedFundingGbp = 15000;
  input.oneTimeSetupCostGbp = 10000;
  input.startingMonthlyRevenueGbp = 0;
  input.fixedOperatingCostsMonthlyGbp = 0;
  input.payrollMonthlyGbp = 0;
  input.marketingMonthlyGbp = 0;
  input.otherOperatingCostsMonthlyGbp = 0;
  const result = assessFinancialModel(input);
  assert.equal(result.scenarios.base.rows[0].openingCashGbp, 20000, 'committed funding is intentionally modelled as available at the start of Month 1');
  assert.equal(result.scenarios.base.rows[0].closingCashGbp, 10000);
}

{
  const result = assessFinancialModel(baseInput());
  const text = JSON.stringify(result).toLowerCase();
  assert.equal(text.includes('visa success'), false);
  assert.equal(text.includes('required ltv:cac'), false);
  assert.ok(text.includes('no home office minimum revenue, margin, runway or ltv:cac threshold is assumed'));
}

console.log(JSON.stringify({
  ok: true,
  modelVersion: FINANCIAL_MODEL_VERSION,
  scenarios: 7,
  covered: [
    '36-month deterministic cashflow arithmetic',
    'funding-gap and negative-cash detection',
    'downside/base/upside scenario ordering',
    'unit economics formulas',
    'evidence coverage separation',
    'committed funding timing assumption',
    'no fabricated visa financial thresholds',
  ],
}, null, 2));
