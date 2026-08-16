const { z } = require('zod');

const FINANCIAL_MODEL_VERSION = 'financial-model-2026-08-16.v1';
const HORIZON_MONTHS = 36;

const SUPPORTED_TOOL_IDS = Object.freeze([
  'financial-projections',
  'budget-cost-analyzer',
  'breakeven-calculator',
  'financial-modeling',
  'income-calculator',
  'cac-calculator',
  'unit-economics',
  'revenue-forecast',
  'financial-resilience',
]);

const evidenceTypeSchema = z.enum([
  'setup_cost_quote',
  'payroll_benchmark',
  'supplier_quote',
  'pricing_evidence',
  'market_research',
  'customer_interviews',
  'pilot_or_trial_metrics',
  'loi_or_contract',
  'revenue_history',
  'gross_margin_evidence',
  'funding_evidence',
  'bank_statement',
  'marketing_cost_evidence',
  'cac_evidence',
  'ltv_evidence',
  'churn_evidence',
  'other',
]);

const evidenceSchema = z.object({
  id: z.string().trim().min(1).max(100),
  type: evidenceTypeSchema,
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(2500),
  reference: z.string().trim().max(240).regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/).optional().or(z.literal('')),
}).strict();

const financialModelInputSchema = z.object({
  toolId: z.enum(SUPPORTED_TOOL_IDS),
  businessName: z.string().trim().min(2).max(160),
  currency: z.literal('GBP').default('GBP'),
  startingCashGbp: z.number().finite().min(0).max(1000000000),
  committedFundingGbp: z.number().finite().min(0).max(1000000000),
  oneTimeSetupCostGbp: z.number().finite().min(0).max(1000000000),
  startingMonthlyRevenueGbp: z.number().finite().min(0).max(1000000000),
  baseMonthlyRevenueGrowthPct: z.number().finite().gt(-100).max(300),
  downsideMonthlyRevenueGrowthPct: z.number().finite().gt(-100).max(300),
  upsideMonthlyRevenueGrowthPct: z.number().finite().gt(-100).max(300),
  grossMarginPct: z.number().finite().min(0).max(100),
  fixedOperatingCostsMonthlyGbp: z.number().finite().min(0).max(1000000000),
  payrollMonthlyGbp: z.number().finite().min(0).max(1000000000),
  marketingMonthlyGbp: z.number().finite().min(0).max(1000000000),
  otherOperatingCostsMonthlyGbp: z.number().finite().min(0).max(1000000000),
  monthlyExpenseGrowthPct: z.number().finite().gt(-100).max(100),
  averageRevenuePerCustomerGbp: z.number().finite().min(0).max(1000000000),
  customerAcquisitionCostGbp: z.number().finite().min(0).max(1000000000),
  lifetimeValueGbp: z.number().finite().min(0).max(1000000000),
  monthlyChurnPct: z.number().finite().min(0).max(100),
  assumptionsNarrative: z.string().trim().min(20).max(6000),
  contingencyNarrative: z.string().trim().min(20).max(4000),
  evidenceItems: z.array(evidenceSchema).max(100),
  clientRunKey: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/).optional(),
}).strict();

function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function percentageToRate(value) {
  return Number(value) / 100;
}

function scenarioRows(input, monthlyRevenueGrowthPct) {
  const growthRate = percentageToRate(monthlyRevenueGrowthPct);
  const expenseGrowthRate = percentageToRate(input.monthlyExpenseGrowthPct);
  const grossMarginRate = percentageToRate(input.grossMarginPct);
  let cash = input.startingCashGbp + input.committedFundingGbp;
  const rows = [];

  for (let month = 1; month <= HORIZON_MONTHS; month += 1) {
    const revenue = input.startingMonthlyRevenueGbp * Math.pow(1 + growthRate, month - 1);
    const expenseMultiplier = Math.pow(1 + expenseGrowthRate, month - 1);
    const cogs = revenue * (1 - grossMarginRate);
    const fixedOperatingCosts = input.fixedOperatingCostsMonthlyGbp * expenseMultiplier;
    const payroll = input.payrollMonthlyGbp * expenseMultiplier;
    const marketing = input.marketingMonthlyGbp * expenseMultiplier;
    const otherOperatingCosts = input.otherOperatingCostsMonthlyGbp * expenseMultiplier;
    const operatingExpenses = fixedOperatingCosts + payroll + marketing + otherOperatingCosts;
    const operatingContribution = revenue - cogs - operatingExpenses;
    const oneTimeSetup = month === 1 ? input.oneTimeSetupCostGbp : 0;
    const netCashFlow = operatingContribution - oneTimeSetup;
    const openingCash = cash;
    cash += netCashFlow;

    rows.push({
      month,
      revenueGbp: money(revenue),
      cogsGbp: money(cogs),
      grossProfitGbp: money(revenue - cogs),
      operatingExpensesGbp: money(operatingExpenses),
      operatingContributionGbp: money(operatingContribution),
      oneTimeSetupGbp: money(oneTimeSetup),
      netCashFlowGbp: money(netCashFlow),
      openingCashGbp: money(openingCash),
      closingCashGbp: money(cash),
    });
  }

  const operatingBreakEvenRow = rows.find((row) => row.operatingContributionGbp >= 0);
  const firstNegativeCashRow = rows.find((row) => row.closingCashGbp < 0);
  const minimumCash = Math.min(...rows.map((row) => row.closingCashGbp));
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenueGbp, 0);
  const totalOperatingContribution = rows.reduce((sum, row) => sum + row.operatingContributionGbp, 0);

  return {
    monthlyRevenueGrowthPct,
    rows,
    summary: {
      operatingBreakEvenMonth: operatingBreakEvenRow?.month ?? null,
      firstNegativeCashMonth: firstNegativeCashRow?.month ?? null,
      minimumCashGbp: money(minimumCash),
      fundingGapToStayNonNegativeGbp: money(Math.max(0, -minimumCash)),
      closingCashMonth36Gbp: rows.at(-1)?.closingCashGbp ?? money(cash),
      totalRevenue36MonthsGbp: money(totalRevenue),
      totalOperatingContribution36MonthsGbp: money(totalOperatingContribution),
    },
  };
}

function calculateUnitEconomics(input) {
  const ltvCacRatio = input.customerAcquisitionCostGbp > 0
    ? input.lifetimeValueGbp / input.customerAcquisitionCostGbp
    : null;
  const grossProfitPerCustomerMonth = input.averageRevenuePerCustomerGbp * percentageToRate(input.grossMarginPct);
  const cacPaybackMonths = grossProfitPerCustomerMonth > 0 && input.customerAcquisitionCostGbp > 0
    ? input.customerAcquisitionCostGbp / grossProfitPerCustomerMonth
    : null;
  const impliedLifetimeMonthsFromChurn = input.monthlyChurnPct > 0
    ? 1 / percentageToRate(input.monthlyChurnPct)
    : null;
  const impliedLtvFromChurn = impliedLifetimeMonthsFromChurn !== null
    ? grossProfitPerCustomerMonth * impliedLifetimeMonthsFromChurn
    : null;

  return {
    averageRevenuePerCustomerGbp: money(input.averageRevenuePerCustomerGbp),
    customerAcquisitionCostGbp: money(input.customerAcquisitionCostGbp),
    lifetimeValueGbp: money(input.lifetimeValueGbp),
    ltvCacRatio: ltvCacRatio === null ? null : Number(ltvCacRatio.toFixed(2)),
    cacPaybackMonths: cacPaybackMonths === null ? null : Number(cacPaybackMonths.toFixed(1)),
    monthlyChurnPct: input.monthlyChurnPct,
    impliedLifetimeMonthsFromChurn: impliedLifetimeMonthsFromChurn === null ? null : Number(impliedLifetimeMonthsFromChurn.toFixed(1)),
    impliedLtvFromChurnGbp: impliedLtvFromChurn === null ? null : money(impliedLtvFromChurn),
    note: 'These are commercial planning metrics, not Innovator Founder visa thresholds.',
  };
}

function evidenceCoverage(input) {
  const types = new Set(input.evidenceItems.map((item) => item.type));
  const checks = [
    {
      id: 'setup-costs',
      label: 'Setup costs supported by quotes or researched costs',
      met: types.has('setup_cost_quote') || types.has('supplier_quote'),
      expected: ['setup_cost_quote', 'supplier_quote'],
    },
    {
      id: 'payroll-costs',
      label: 'Payroll assumptions supported by salary benchmarks',
      met: types.has('payroll_benchmark'),
      expected: ['payroll_benchmark'],
    },
    {
      id: 'pricing-demand',
      label: 'Revenue/pricing assumptions supported by market or customer evidence',
      met: ['pricing_evidence', 'market_research', 'pilot_or_trial_metrics', 'loi_or_contract', 'revenue_history'].some((type) => types.has(type)),
      expected: ['pricing_evidence', 'market_research', 'pilot_or_trial_metrics', 'loi_or_contract', 'revenue_history'],
    },
    {
      id: 'gross-margin',
      label: 'Gross margin supported by cost or historical evidence',
      met: types.has('gross_margin_evidence') || types.has('supplier_quote') || types.has('revenue_history'),
      expected: ['gross_margin_evidence', 'supplier_quote', 'revenue_history'],
    },
    {
      id: 'funding',
      label: 'Available/committed funding supported by evidence',
      met: types.has('funding_evidence') || types.has('bank_statement'),
      expected: ['funding_evidence', 'bank_statement'],
    },
    {
      id: 'marketing-cac',
      label: 'Marketing or CAC assumptions supported by evidence',
      met: types.has('marketing_cost_evidence') || types.has('cac_evidence') || input.customerAcquisitionCostGbp === 0,
      expected: ['marketing_cost_evidence', 'cac_evidence'],
    },
    {
      id: 'ltv-churn',
      label: 'LTV/churn assumptions supported where used',
      met: (input.lifetimeValueGbp === 0 && input.monthlyChurnPct === 0) || types.has('ltv_evidence') || types.has('churn_evidence') || types.has('revenue_history'),
      expected: ['ltv_evidence', 'churn_evidence', 'revenue_history'],
    },
  ];
  const met = checks.filter((item) => item.met).length;
  const percent = Math.round((met / checks.length) * 100);
  return {
    checks,
    met,
    total: checks.length,
    percent,
    gaps: checks.filter((item) => !item.met),
  };
}

function buildWarnings(input, scenarios, unitEconomics, coverage) {
  const warnings = [];
  if (scenarios.base.summary.fundingGapToStayNonNegativeGbp > 0) {
    warnings.push({
      severity: 'critical',
      code: 'BASE_CASE_FUNDING_GAP',
      message: `The base case falls below £0 cash and needs at least £${scenarios.base.summary.fundingGapToStayNonNegativeGbp.toLocaleString('en-GB')} of additional funding to remain non-negative over the 36-month model.`,
    });
  }
  if (scenarios.downside.summary.fundingGapToStayNonNegativeGbp > 0) {
    warnings.push({
      severity: 'warning',
      code: 'DOWNSIDE_FUNDING_GAP',
      message: `The downside scenario needs £${scenarios.downside.summary.fundingGapToStayNonNegativeGbp.toLocaleString('en-GB')} of additional cash to remain non-negative.`,
    });
  }
  if (input.oneTimeSetupCostGbp > input.startingCashGbp + input.committedFundingGbp) {
    warnings.push({ severity: 'critical', code: 'SETUP_COST_NOT_FUNDED', message: 'Declared starting cash plus committed funding does not cover the one-time setup cost.' });
  }
  if (coverage.percent < 100) {
    warnings.push({ severity: 'evidence', code: 'ASSUMPTION_EVIDENCE_GAPS', message: `${coverage.total - coverage.met} financial assumption evidence area(s) are not yet covered.` });
  }
  if (unitEconomics.ltvCacRatio !== null && unitEconomics.ltvCacRatio < 1) {
    warnings.push({ severity: 'commercial', code: 'LTV_BELOW_CAC', message: 'Declared lifetime value is below declared customer acquisition cost, so the current customer economics are not self-sustaining before other costs.' });
  }
  return warnings;
}

function assessFinancialModel(rawInput) {
  const input = financialModelInputSchema.parse(rawInput);
  const scenarios = {
    base: scenarioRows(input, input.baseMonthlyRevenueGrowthPct),
    downside: scenarioRows(input, input.downsideMonthlyRevenueGrowthPct),
    upside: scenarioRows(input, input.upsideMonthlyRevenueGrowthPct),
  };
  const unitEconomics = calculateUnitEconomics(input);
  const assumptionEvidence = evidenceCoverage(input);
  const warnings = buildWarnings(input, scenarios, unitEconomics, assumptionEvidence);
  const criticalWarnings = warnings.filter((item) => item.severity === 'critical');
  const status = criticalWarnings.length > 0
    ? 'funding_or_model_gap'
    : assumptionEvidence.gaps.length > 0
      ? 'model_complete_evidence_incomplete'
      : 'model_complete_with_evidence';
  const evidenceRefs = Array.from(new Set(input.evidenceItems.map((item) => item.reference).filter(Boolean)));

  return {
    modelVersion: FINANCIAL_MODEL_VERSION,
    assessedAt: new Date().toISOString(),
    toolId: input.toolId,
    businessName: input.businessName,
    currency: 'GBP',
    horizonMonths: HORIZON_MONTHS,
    status,
    meaning: 'This is a pre-tax management cashflow and unit-economics model based on the assumptions supplied. It is not audited accounts, tax advice, investment advice or an endorsing-body decision.',
    scenarios,
    unitEconomics,
    assumptionEvidence,
    warnings,
    evidenceInventory: {
      itemCount: input.evidenceItems.length,
      evidenceTypes: Array.from(new Set(input.evidenceItems.map((item) => item.type))).sort(),
      evidenceRefs,
    },
    assumptions: {
      startingCashGbp: input.startingCashGbp,
      committedFundingGbp: input.committedFundingGbp,
      oneTimeSetupCostGbp: input.oneTimeSetupCostGbp,
      grossMarginPct: input.grossMarginPct,
      monthlyExpenseGrowthPct: input.monthlyExpenseGrowthPct,
      assumptionsNarrative: input.assumptionsNarrative,
      contingencyNarrative: input.contingencyNarrative,
    },
    limitations: [
      'Corporation tax, VAT, debt interest, depreciation, working-capital timing and financing terms are not modelled unless already reflected in the user-supplied operating assumptions.',
      'No Home Office minimum revenue, margin, runway or LTV:CAC threshold is assumed.',
      'Forecast quality depends on the quality of the evidence supporting the assumptions.',
    ],
  };
}

module.exports = {
  FINANCIAL_MODEL_VERSION,
  HORIZON_MONTHS,
  SUPPORTED_TOOL_IDS,
  financialModelInputSchema,
  assessFinancialModel,
};
