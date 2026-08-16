const { z } = require('zod');

const IVS_POLICY_VERSION = 'uk-if-ivs-2026-08-03+endorsing-guidance-2023-08-17.v1';

const IVS_OFFICIAL_SOURCES = Object.freeze([
  {
    id: 'appendix-innovator-founder-8-3',
    title: 'Immigration Rules Appendix Innovator Founder - INNF 8.3',
    url: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder',
  },
  {
    id: 'endorsing-body-guidance-ivs',
    title: 'Innovator Founder and Scale-up visas: guidance for endorsing bodies',
    url: 'https://www.gov.uk/government/publications/scale-up-and-innovator-founder-visa-endorsing-bodies-guidance/innovator-founder-and-scale-up-visas-guidance-for-endorsing-bodies-accessible',
  },
  {
    id: 'caseworker-guidance-ivs',
    title: 'Innovator Founder caseworker guidance',
    url: 'https://www.gov.uk/government/publications/innovator-appendix-w-workers/innovator-founder-caseworker-guidance-accessible',
  },
]);

const SUPPORTED_TOOL_IDS = Object.freeze([
  'endorsement-readiness',
  'criteria-scorer',
  'innovation-score',
  'innovation-validation',
  'business-model-validator',
  'viability-checker',
]);

const evidenceTypeSchema = z.enum([
  'competitor_analysis',
  'market_research',
  'customer_interviews',
  'loi_or_contract',
  'waitlist_or_preorders',
  'pilot_or_trial_metrics',
  'revenue_or_customer_metrics',
  'technical_architecture',
  'prototype_or_demo',
  'research_and_development',
  'ip_or_patent_material',
  'founder_cv_or_credentials',
  'team_capability',
  'cost_research_or_quotes',
  'financial_model',
  'funding_evidence',
  'hiring_plan',
  'national_expansion_plan',
  'international_expansion_plan',
  'operational_scaling_plan',
  'partnership_evidence',
  'other',
]);

const evidenceItemSchema = z.object({
  id: z.string().trim().min(1).max(100),
  type: evidenceTypeSchema,
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(2500),
  reference: z.string().trim().max(240).regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/).optional().or(z.literal('')),
}).strict();

const ivsInputSchema = z.object({
  toolId: z.enum(SUPPORTED_TOOL_IDS),
  businessName: z.string().trim().min(2).max(160),
  businessSummary: z.string().trim().min(30).max(5000),
  marketNeed: z.string().trim().min(20).max(4000),
  targetCustomers: z.string().trim().min(10).max(2500),
  uniqueSellingProposition: z.string().trim().min(20).max(3000),
  competitorDifferentiation: z.string().trim().min(20).max(3000),
  replicationBarriers: z.string().trim().min(10).max(3000),
  innovationCoreToBusiness: z.boolean(),
  innovationDeliveryModel: z.enum(['primarily_in_house', 'mixed', 'primarily_outsourced']),
  internalInnovationOwnership: z.string().trim().min(10).max(3000),
  founderCapability: z.string().trim().min(20).max(3500),
  fundingAvailableGbp: z.number().finite().min(0).max(1000000000),
  minimumSetupCostGbp: z.number().finite().min(0).max(1000000000),
  monthlyOperatingCostGbp: z.number().finite().min(0).max(1000000000),
  forecastMonthlyRevenueGbp: z.number().finite().min(0).max(1000000000),
  financialAssumptions: z.string().trim().min(20).max(4000),
  demandEvidenceSummary: z.string().trim().min(10).max(3500),
  growthPlan: z.string().trim().min(20).max(4000),
  skilledJobsPlannedThreeYears: z.number().int().min(0).max(100000),
  nationalGrowthPlan: z.string().trim().min(10).max(3000),
  internationalGrowthPlan: z.string().trim().min(10).max(3000),
  scalingOperations: z.string().trim().min(10).max(3000),
  projectionsResearchBasis: z.string().trim().min(10).max(3500),
  evidenceItems: z.array(evidenceItemSchema).max(100),
  clientRunKey: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/).optional(),
}).strict();

function hasEvidence(types, ...accepted) {
  return accepted.some((type) => types.has(type));
}

function check(id, label, met, critical, explanation, evidenceTypes, ruleRefs) {
  return {
    id,
    label,
    met,
    critical,
    explanation,
    evidenceTypes,
    ruleRefs,
  };
}

function criterionResult(id, name, checks, sourceRefs) {
  const met = checks.filter((item) => item.met).length;
  const total = checks.length;
  const criticalGaps = checks.filter((item) => item.critical && !item.met);
  const gaps = checks.filter((item) => !item.met);
  const coveragePercent = total === 0 ? 0 : Math.round((met / total) * 100);
  const status = criticalGaps.length > 0
    ? 'critical_gap'
    : gaps.length === 0
      ? 'evidence_ready_for_endorser_review'
      : 'needs_strengthening';

  return {
    id,
    name,
    status,
    coverage: { met, total, percent: coveragePercent },
    criticalGapCount: criticalGaps.length,
    checks,
    sourceRefs,
  };
}

function buildChallengeQuestions(results) {
  const questions = [];
  for (const result of results) {
    for (const item of result.checks) {
      if (item.met) continue;
      const map = {
        'innovation-usp': 'What specifically differentiates the proposition from named competitors, and what evidence supports that difference?',
        'innovation-replication-barriers': 'What prevents a credible competitor from replicating the innovation quickly and cheaply?',
        'innovation-core': 'If the claimed innovation were removed, would the business still be essentially the same proposition?',
        'innovation-internal-delivery': 'Who inside the founding business owns the core research, design, technical implementation and product decisions?',
        'innovation-technical-evidence': 'What prototype, architecture, R&D or IP evidence demonstrates that the innovation is technically real rather than conceptual?',
        'viability-funding': 'How will the minimum setup costs be funded, and what documentary evidence confirms access to those funds?',
        'viability-financial-model': 'What evidence supports each major cost, pricing, revenue and growth assumption in the financial model?',
        'viability-founder-capability': 'Which founder or team achievements demonstrate the ability to deliver the proposed product and operate this business?',
        'viability-demand': 'What customer evidence shows credible demand rather than assumed demand?',
        'viability-market-research': 'Which independent market or competitor sources support the pricing, demand and market assumptions?',
        'scalability-growth-plan': 'What are the sequenced milestones, resources and constraints for moving from the current stage to national and international scale?',
        'scalability-skilled-jobs': 'Which high-quality skilled roles will be created, when will they be hired, and what business milestone funds each hire?',
        'scalability-national': 'Which UK regions or customer segments will be entered after the initial market, and what evidence supports that expansion?',
        'scalability-international': 'Which international markets are targeted first, why those markets, and what route to market has been researched?',
        'scalability-research': 'Which research, comparable businesses or validated demand assumptions support the growth projections?',
        'scalability-operations': 'How will technology, operations, supply, support and management capacity scale as customer volume grows?',
      };
      questions.push({ criterion: result.id, checkId: item.id, question: map[item.id] || `What evidence addresses ${item.label}?` });
    }
  }
  return questions;
}

function assessIVS(rawInput) {
  const input = ivsInputSchema.parse(rawInput);
  const evidenceTypes = new Set(input.evidenceItems.map((item) => item.type));
  const evidenceRefs = Array.from(new Set(input.evidenceItems.map((item) => item.reference).filter(Boolean)));

  const innovationChecks = [
    check(
      'innovation-usp',
      'Clear and compelling USP against competitors',
      hasEvidence(evidenceTypes, 'competitor_analysis') && input.uniqueSellingProposition.length >= 20 && input.competitorDifferentiation.length >= 20,
      false,
      'Endorsing-body guidance expects a clear and compelling USP explaining how the proposition differs from competitors.',
      ['competitor_analysis'],
      ['INNF 8.3(a)', 'Endorsing body guidance: Innovative'],
    ),
    check(
      'innovation-replication-barriers',
      'Reasonable barriers to replication / market entry',
      input.replicationBarriers.length >= 10 && hasEvidence(evidenceTypes, 'technical_architecture', 'prototype_or_demo', 'research_and_development', 'ip_or_patent_material', 'competitor_analysis'),
      false,
      'The innovation should not be easily replicable and should demonstrate reasonable barriers to entry.',
      ['technical_architecture', 'prototype_or_demo', 'research_and_development', 'ip_or_patent_material', 'competitor_analysis'],
      ['Endorsing body guidance: Innovative'],
    ),
    check(
      'innovation-core',
      'Innovation is core to the business proposition',
      input.innovationCoreToBusiness,
      true,
      'Incidental innovation is specifically identified as insufficient; the innovation should be core to business success.',
      [],
      ['Endorsing body guidance: Innovative'],
    ),
    check(
      'innovation-internal-delivery',
      'Core innovation primarily delivered within the business',
      input.innovationDeliveryModel !== 'primarily_outsourced',
      true,
      'The guidance identifies largely outsourced innovation research, design or implementation as a negative pattern.',
      ['technical_architecture', 'prototype_or_demo', 'research_and_development'],
      ['Endorsing body guidance: Innovative'],
    ),
    check(
      'innovation-technical-evidence',
      'Technical/R&D evidence supports the claimed innovation',
      hasEvidence(evidenceTypes, 'technical_architecture', 'prototype_or_demo', 'research_and_development', 'ip_or_patent_material'),
      false,
      'Technical evidence strengthens the ability to explain how the innovation is new, deliverable and owned by the founding business.',
      ['technical_architecture', 'prototype_or_demo', 'research_and_development', 'ip_or_patent_material'],
      ['INNF 8.3(a)', 'Endorsing body guidance: Innovative'],
    ),
  ];

  const setupFundingCovered = input.fundingAvailableGbp >= input.minimumSetupCostGbp;
  const remainingAfterSetup = Math.max(0, input.fundingAvailableGbp - input.minimumSetupCostGbp);
  const runwayMonthsAfterSetup = input.monthlyOperatingCostGbp > 0
    ? Number((remainingAfterSetup / input.monthlyOperatingCostGbp).toFixed(1))
    : null;

  const viabilityChecks = [
    check(
      'viability-funding',
      'Available funds cover the stated minimum setup cost',
      setupFundingCovered && hasEvidence(evidenceTypes, 'funding_evidence', 'cost_research_or_quotes'),
      true,
      'Viability assessment considers whether the business has sufficient funds and credible researched setup costs.',
      ['funding_evidence', 'cost_research_or_quotes'],
      ['INNF 8.3(b)', 'Endorsing body guidance: Viability'],
    ),
    check(
      'viability-financial-model',
      'Financial projections are supported and defensible',
      hasEvidence(evidenceTypes, 'financial_model') && hasEvidence(evidenceTypes, 'cost_research_or_quotes', 'market_research', 'revenue_or_customer_metrics', 'pilot_or_trial_metrics', 'loi_or_contract'),
      false,
      'The endorsing-body guidance asks whether financial projections can be credibly defended.',
      ['financial_model', 'cost_research_or_quotes', 'market_research'],
      ['Endorsing body guidance: Viability'],
    ),
    check(
      'viability-founder-capability',
      'Founder/team capability evidence',
      hasEvidence(evidenceTypes, 'founder_cv_or_credentials', 'team_capability'),
      true,
      'The applicant must have, or be actively developing, the necessary skills, knowledge, experience and market awareness.',
      ['founder_cv_or_credentials', 'team_capability'],
      ['INNF 8.3(c)', 'Endorsing body guidance: Viability'],
    ),
    check(
      'viability-demand',
      'Credible customer demand evidence',
      hasEvidence(evidenceTypes, 'customer_interviews', 'loi_or_contract', 'waitlist_or_preorders', 'pilot_or_trial_metrics', 'revenue_or_customer_metrics'),
      false,
      'The endorsing-body guidance asks whether there is credible demand for the proposed product or service.',
      ['customer_interviews', 'loi_or_contract', 'waitlist_or_preorders', 'pilot_or_trial_metrics', 'revenue_or_customer_metrics'],
      ['Endorsing body guidance: Viability'],
    ),
    check(
      'viability-market-research',
      'Market and pricing assumptions have research support',
      hasEvidence(evidenceTypes, 'market_research', 'competitor_analysis'),
      false,
      'Credible research should support market demand, pricing and cost assumptions rather than generic projections.',
      ['market_research', 'competitor_analysis'],
      ['INNF 8.3(c)', 'Endorsing body guidance: Viability'],
    ),
  ];

  const scalabilityChecks = [
    check(
      'scalability-growth-plan',
      'Structured, credible path to growth',
      hasEvidence(evidenceTypes, 'operational_scaling_plan', 'national_expansion_plan', 'international_expansion_plan'),
      true,
      'Scalability assessment requires structured planning demonstrating a credible path to growth.',
      ['operational_scaling_plan', 'national_expansion_plan', 'international_expansion_plan'],
      ['INNF 8.3(d)', 'Endorsing body guidance: Scalability'],
    ),
    check(
      'scalability-skilled-jobs',
      'Potential for ongoing high-quality skilled job creation',
      input.skilledJobsPlannedThreeYears > 0 && hasEvidence(evidenceTypes, 'hiring_plan'),
      false,
      'The endorsing-body guidance explicitly considers potential for ongoing high-quality and skilled job creation.',
      ['hiring_plan'],
      ['INNF 8.3(d)', 'Endorsing body guidance: Scalability'],
    ),
    check(
      'scalability-national',
      'National market growth is planned and evidenced',
      hasEvidence(evidenceTypes, 'national_expansion_plan', 'market_research'),
      false,
      'The route requires potential for growth into national markets.',
      ['national_expansion_plan', 'market_research'],
      ['INNF 8.3(d)', 'Endorsing body guidance: Scalability'],
    ),
    check(
      'scalability-international',
      'International market growth is planned and evidenced',
      hasEvidence(evidenceTypes, 'international_expansion_plan', 'market_research'),
      false,
      'The route requires potential for growth into international markets.',
      ['international_expansion_plan', 'market_research'],
      ['INNF 8.3(d)', 'Endorsing body guidance: Scalability'],
    ),
    check(
      'scalability-research',
      'Growth projections are based on credible research',
      hasEvidence(evidenceTypes, 'market_research') && input.projectionsResearchBasis.length >= 10,
      false,
      'The endorsing-body guidance states that scalability projections should be based on credible research.',
      ['market_research'],
      ['Endorsing body guidance: Scalability'],
    ),
    check(
      'scalability-operations',
      'Operational capacity can scale with growth',
      hasEvidence(evidenceTypes, 'operational_scaling_plan') && input.scalingOperations.length >= 10,
      false,
      'A credible path to growth should explain how operations and delivery expand as demand increases.',
      ['operational_scaling_plan'],
      ['Endorsing body guidance: Scalability'],
    ),
  ];

  const criteria = [
    criterionResult('innovation', 'Innovation', innovationChecks, ['INNF 8.3(a)', 'Endorsing body guidance: Innovative']),
    criterionResult('viability', 'Viability', viabilityChecks, ['INNF 8.3(b)-(c)', 'Endorsing body guidance: Viability']),
    criterionResult('scalability', 'Scalability', scalabilityChecks, ['INNF 8.3(d)', 'Endorsing body guidance: Scalability']),
  ];

  const criticalGaps = criteria.flatMap((criterion) =>
    criterion.checks.filter((item) => item.critical && !item.met).map((item) => ({
      criterion: criterion.id,
      checkId: item.id,
      label: item.label,
      explanation: item.explanation,
    })),
  );

  const evidenceGaps = criteria.flatMap((criterion) =>
    criterion.checks.filter((item) => !item.met).map((item) => ({
      criterion: criterion.id,
      checkId: item.id,
      label: item.label,
      expectedEvidenceTypes: item.evidenceTypes,
    })),
  );

  const allReady = criteria.every((criterion) => criterion.status === 'evidence_ready_for_endorser_review');
  const overallStatus = criticalGaps.length > 0
    ? 'critical_gaps'
    : allReady
      ? 'evidence_ready_for_endorser_review'
      : 'needs_strengthening';

  return {
    policyVersion: IVS_POLICY_VERSION,
    assessedAt: new Date().toISOString(),
    toolId: input.toolId,
    businessName: input.businessName,
    overallStatus,
    assessmentMeaning: 'This is an evidence-readiness assessment against official endorsement criteria. It is not an endorsement decision and does not award visa points.',
    criteria,
    criticalGaps,
    evidenceGaps,
    assessorChallengeQuestions: buildChallengeQuestions(criteria),
    evidenceInventory: {
      itemCount: input.evidenceItems.length,
      evidenceTypes: Array.from(evidenceTypes).sort(),
      referencedEvidenceCount: evidenceRefs.length,
      evidenceRefs,
    },
    financialRealityCheck: {
      fundingAvailableGbp: input.fundingAvailableGbp,
      minimumSetupCostGbp: input.minimumSetupCostGbp,
      setupFundingGapGbp: Math.max(0, input.minimumSetupCostGbp - input.fundingAvailableGbp),
      remainingFundsAfterSetupGbp: remainingAfterSetup,
      monthlyOperatingCostGbp: input.monthlyOperatingCostGbp,
      runwayMonthsAfterSetup,
      forecastMonthlyRevenueGbp: input.forecastMonthlyRevenueGbp,
      note: 'No Home Office minimum runway is assumed. This calculation only shows whether declared available funds cover declared setup costs and the implied runway after setup.',
    },
    redFlags: [
      ...(input.innovationDeliveryModel === 'primarily_outsourced'
        ? ['Core innovation is declared as primarily outsourced, a pattern the endorsing-body guidance identifies as unlikely to satisfy the innovation standard.']
        : []),
      ...(!input.innovationCoreToBusiness
        ? ['Innovation is not declared as core to the business proposition; incidental innovation is specifically identified as insufficient in endorsing-body guidance.']
        : []),
      ...(!setupFundingCovered
        ? [`Declared funding is £${(input.minimumSetupCostGbp - input.fundingAvailableGbp).toLocaleString('en-GB')} below the declared minimum setup cost.`]
        : []),
      ...(input.skilledJobsPlannedThreeYears === 0
        ? ['No skilled job creation is currently planned, weakening evidence for the scalability criterion.']
        : []),
    ],
    sources: IVS_OFFICIAL_SOURCES,
  };
}

module.exports = {
  IVS_POLICY_VERSION,
  IVS_OFFICIAL_SOURCES,
  SUPPORTED_TOOL_IDS,
  ivsInputSchema,
  assessIVS,
};
