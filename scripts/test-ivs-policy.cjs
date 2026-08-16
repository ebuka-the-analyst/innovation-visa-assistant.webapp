const assert = require('assert/strict');
const { IVS_POLICY_VERSION, assessIVS } = require('../server/ivsPolicy.cjs');

function evidence(type, index = 1) {
  return {
    id: `${type}-${index}`,
    type,
    title: `${type} evidence`,
    summary: `Documented evidence supporting ${type} with enough context for assessor review.`,
    reference: `evidence/${type}/${index}`,
  };
}

function strongInput() {
  return {
    toolId: 'endorsement-readiness',
    businessName: 'Example Innovation Ltd',
    businessSummary: 'A technology venture building a proprietary workflow platform for regulated industrial operators.',
    marketNeed: 'Operators currently use disconnected manual workflows that cause measurable delays, compliance risk and avoidable cost.',
    targetCustomers: 'UK regulated industrial operators and their compliance teams.',
    uniqueSellingProposition: 'A proprietary decision engine integrates operational data and compliance logic in one workflow rather than separate point tools.',
    competitorDifferentiation: 'Named competitors focus on record keeping; the proposed product combines decision support, workflow automation and proprietary operational models.',
    replicationBarriers: 'Proprietary domain models, validated operational datasets, integrations and accumulated workflow learning create meaningful replication barriers.',
    innovationCoreToBusiness: true,
    innovationDeliveryModel: 'primarily_in_house',
    internalInnovationOwnership: 'The founding team owns architecture, product decisions, core software implementation, model design and validation.',
    founderCapability: 'The founding team combines senior software engineering, data science and direct industry domain experience with shipped production systems.',
    fundingAvailableGbp: 120000,
    minimumSetupCostGbp: 40000,
    monthlyOperatingCostGbp: 10000,
    forecastMonthlyRevenueGbp: 15000,
    financialAssumptions: 'Costs are based on supplier quotations and salary benchmarks; revenue assumptions are based on signed pilot pricing and observed conversion.',
    demandEvidenceSummary: 'Customer interviews, two signed pilot letters and measured trial usage demonstrate demand for the product.',
    growthPlan: 'Launch with pilot customers, convert to annual contracts, expand through two UK sectors, then enter two researched European markets.',
    skilledJobsPlannedThreeYears: 8,
    nationalGrowthPlan: 'Expand from the initial region into three UK industrial clusters using sector partnerships and direct enterprise sales.',
    internationalGrowthPlan: 'Enter Ireland and the Netherlands after UK product validation using local channel partners and existing customer relationships.',
    scalingOperations: 'Multi-tenant infrastructure, documented support operations, automated onboarding and staged technical hiring support increased customer volume.',
    projectionsResearchBasis: 'Market sizing uses named industry datasets, competitor pricing, pilot conversion metrics and researched staffing costs.',
    evidenceItems: [
      evidence('competitor_analysis'),
      evidence('market_research'),
      evidence('customer_interviews'),
      evidence('loi_or_contract'),
      evidence('pilot_or_trial_metrics'),
      evidence('technical_architecture'),
      evidence('prototype_or_demo'),
      evidence('research_and_development'),
      evidence('founder_cv_or_credentials'),
      evidence('cost_research_or_quotes'),
      evidence('financial_model'),
      evidence('funding_evidence'),
      evidence('hiring_plan'),
      evidence('national_expansion_plan'),
      evidence('international_expansion_plan'),
      evidence('operational_scaling_plan'),
    ],
  };
}

{
  const result = assessIVS(strongInput());
  assert.equal(result.policyVersion, IVS_POLICY_VERSION);
  assert.equal(result.overallStatus, 'evidence_ready_for_endorser_review');
  assert.equal(result.criticalGaps.length, 0);
  assert.equal(result.evidenceGaps.length, 0);
  assert.equal(result.criteria.every((criterion) => criterion.coverage.percent === 100), true);
  assert.equal(result.financialRealityCheck.setupFundingGapGbp, 0);
  assert.equal(result.financialRealityCheck.runwayMonthsAfterSetup, 8);
}

{
  const input = strongInput();
  input.innovationDeliveryModel = 'primarily_outsourced';
  const result = assessIVS(input);
  assert.equal(result.overallStatus, 'critical_gaps');
  assert.ok(result.criticalGaps.some((gap) => gap.checkId === 'innovation-internal-delivery'));
  assert.ok(result.redFlags.some((flag) => flag.includes('primarily outsourced')));
}

{
  const input = strongInput();
  input.fundingAvailableGbp = 20000;
  input.minimumSetupCostGbp = 50000;
  const result = assessIVS(input);
  assert.equal(result.overallStatus, 'critical_gaps');
  assert.equal(result.financialRealityCheck.setupFundingGapGbp, 30000);
  assert.ok(result.criticalGaps.some((gap) => gap.checkId === 'viability-funding'));
}

{
  const input = strongInput();
  input.skilledJobsPlannedThreeYears = 0;
  input.evidenceItems = input.evidenceItems.filter((item) => item.type !== 'hiring_plan');
  const result = assessIVS(input);
  assert.equal(result.overallStatus, 'needs_strengthening');
  assert.ok(result.evidenceGaps.some((gap) => gap.checkId === 'scalability-skilled-jobs'));
  assert.ok(result.assessorChallengeQuestions.some((item) => item.checkId === 'scalability-skilled-jobs'));
}

{
  const input = strongInput();
  input.evidenceItems = [];
  const result = assessIVS(input);
  assert.notEqual(result.overallStatus, 'evidence_ready_for_endorser_review');
  assert.ok(result.evidenceGaps.length > 0, 'narrative alone must not be treated as complete evidence coverage');
}

{
  const text = JSON.stringify(assessIVS(strongInput())).toLowerCase();
  assert.equal(text.includes('success probability'), false);
  assert.equal(text.includes('guaranteed'), false);
  assert.ok(text.includes('no home office minimum runway is assumed'));
}

console.log(JSON.stringify({
  ok: true,
  policyVersion: IVS_POLICY_VERSION,
  scenarios: 6,
  covered: [
    'complete evidence coverage',
    'outsourced core innovation red flag',
    'funding below setup cost critical gap',
    'missing skilled job evidence',
    'narrative cannot substitute for evidence inventory',
    'no fabricated success probability or runway rule',
  ],
}, null, 2));
