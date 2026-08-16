const { z } = require('zod');

const POLICY_VERSION = 'uk-innovator-founder-2026-08-03';
const POLICY_EFFECTIVE_DATE = '2026-08-03';

const OFFICIAL_SOURCES = Object.freeze([
  {
    id: 'appendix-innovator-founder',
    title: 'Immigration Rules Appendix Innovator Founder',
    url: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder',
  },
  {
    id: 'appendix-finance',
    title: 'Immigration Rules Appendix Finance',
    url: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-finance',
  },
  {
    id: 'innovator-founder-eligibility',
    title: 'Innovator Founder visa: Eligibility',
    url: 'https://www.gov.uk/innovator-founder-visa/eligibility',
  },
  {
    id: 'innovator-founder-english',
    title: 'Innovator Founder visa: Knowledge of English',
    url: 'https://www.gov.uk/innovator-founder-visa/knowledge-of-english',
  },
  {
    id: 'innovator-founder-documents',
    title: 'Innovator Founder visa: Documents you will need to apply',
    url: 'https://www.gov.uk/innovator-founder-visa/documents-youll-need-to-apply',
  },
  {
    id: 'innovator-founder-endorsers',
    title: 'Innovator Founder and Scale-up visas endorsing bodies',
    url: 'https://www.gov.uk/government/publications/endorsing-bodies-innovator-founder-and-scale-up-visas/innovator-founder-and-scale-up-visas-endorsing-bodies',
  },
]);

const CURRENT_BUSINESS_ENDORSERS = Object.freeze([
  'UK Endorsing Services',
  'Innovator International',
  'Envestors Limited',
  'The Global Entrepreneurs Programme (GEP)',
]);

const DISALLOWED_SWITCHING_ROUTES = new Set([
  'visitor',
  'short_term_student',
  'parent_of_child_student',
  'seasonal_worker',
  'domestic_worker_private_household',
  'outside_immigration_rules',
]);

const SAME_BUSINESS_PREVIOUS_ROUTES = new Set([
  'innovator_founder',
  'innovator',
  'start_up',
  'tier1_graduate_entrepreneur',
]);

const applicationRouteSchema = z.enum(['entry_clearance', 'permission_to_stay']);
const currentPermissionSchema = z.enum([
  'innovator_founder',
  'innovator',
  'start_up',
  'tier1_graduate_entrepreneur',
  'student',
  'visitor',
  'short_term_student',
  'parent_of_child_student',
  'seasonal_worker',
  'domestic_worker_private_household',
  'outside_immigration_rules',
  'other',
  'none',
]);
const yesNoUnsureSchema = z.enum(['yes', 'no', 'unsure']);

const endorsementSchema = z.object({
  status: z.enum(['no_letter', 'business_endorser', 'legacy_endorser', 'unknown']),
  bodyName: z.string().trim().max(160).optional().default(''),
  issueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).default(''),
  withdrawn: z.boolean().default(false),
  legacyEligibilityConfirmed: z.boolean().optional().default(false),
}).strict();

const newBusinessSchema = z.object({
  criteria: z.literal('new_business'),
  businessPlanExists: z.boolean(),
  generatedOrSignificantlyContributed: z.boolean(),
  dayToDayRole: z.boolean(),
  twoContactPointMeetingsCommitted: z.boolean(),
  soleOrInstrumentalFounder: z.boolean(),
  genuineOriginalPlan: z.boolean(),
  realisticAndAchievable: z.boolean(),
  skillsKnowledgeExperienceMarketAwareness: z.boolean(),
  structuredPlanningJobsNationalInternationalGrowth: z.boolean(),
}).strict();

const sameBusinessSchema = z.object({
  criteria: z.literal('same_business'),
  previousPermissionRoute: currentPermissionSchema,
  businessPreviouslyAssessed: z.boolean(),
  previousContactPointRequirementMet: z.boolean(),
  twoFutureContactPointMeetingsCommitted: z.boolean(),
  activeTradingSustainable: z.boolean(),
  significantProgressAgainstPlan: z.boolean(),
  companiesHouseRegistered: z.boolean(),
  directorOrMember: z.boolean(),
  dayToDayManagement: z.boolean(),
}).strict();

const englishSchema = z.object({
  evidenceMethod: z.enum([
    'approved_selt',
    'uk_degree',
    'overseas_degree_ecctis',
    'uk_school_qualification',
    'previous_successful_visa',
    'exempt_nationality',
    'none',
    'unsure',
  ]),
  seltLevel: z.enum(['below_b2', 'b2', 'c1', 'c2', 'not_applicable']).default('not_applicable'),
  evidenceAvailable: z.boolean(),
}).strict();

const financeSchema = z.object({
  fundsGbp: z.number().finite().min(0).max(100000000),
  heldFor28ConsecutiveDays: z.boolean(),
  mostRecentEvidenceWithin31Days: z.boolean(),
  immediatelyAccessibleAccount: z.boolean(),
  accountHolderHasControl: z.boolean(),
  excludesBusinessInvestmentFunds: z.boolean(),
  excludesUnlawfulUKEarnings: z.boolean(),
  partnerRequiringMaintenanceFunds: z.boolean().default(false),
  childrenRequiringMaintenanceFunds: z.number().int().min(0).max(20).default(0),
}).strict();

const documentsSchema = z.object({
  validPassportOrTravelDocument: z.boolean(),
  tuberculosisRequirement: z.enum(['required', 'not_required', 'unsure']),
  tuberculosisCertificateAvailable: z.boolean(),
  translationRequirement: z.enum(['required', 'not_required', 'unsure']),
  certifiedTranslationsAvailable: z.boolean(),
}).strict();

const immigrationStatusSchema = z.object({
  currentPermissionRoute: currentPermissionSchema,
  monthsWithUKPermission: z.number().int().min(0).max(600),
  physicallyInUK: z.boolean(),
  studentCourseCondition: z.enum(['not_applicable', 'course_completed', 'phd_24_months_completed', 'condition_not_met', 'unsure']),
  onImmigrationBail: yesNoUnsureSchema,
  inBreachOfImmigrationLaws: yesNoUnsureSchema,
  governmentScholarshipConsentRequired: z.boolean(),
  governmentScholarshipConsentAvailable: z.boolean(),
}).strict();

const eligibilityInputSchema = z.object({
  toolId: z.enum(['points-calculator', 'eligibility-validator', 'app-req-checker', 'jurisdiction-checker']),
  applicationRoute: applicationRouteSchema,
  age: z.number().int().min(0).max(120),
  endorsement: endorsementSchema,
  business: z.discriminatedUnion('criteria', [newBusinessSchema, sameBusinessSchema]),
  english: englishSchema,
  finance: financeSchema,
  documents: documentsSchema,
  immigrationStatus: immigrationStatusSchema,
  clientRunKey: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/).optional(),
}).strict();

function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

function daysInUtcMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function subtractCalendarMonthsClamped(date, months) {
  const sourceYear = date.getUTCFullYear();
  const sourceMonth = date.getUTCMonth();
  const absoluteMonth = sourceYear * 12 + sourceMonth - months;
  const targetYear = Math.floor(absoluteMonth / 12);
  const targetMonth = ((absoluteMonth % 12) + 12) % 12;
  const targetDay = Math.min(date.getUTCDate(), daysInUtcMonth(targetYear, targetMonth));
  return new Date(Date.UTC(targetYear, targetMonth, targetDay));
}

function normalizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-GB');
}

function currentDateOnly(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function criterion(id, title, pointsAvailable, met, ruleRefs, explanation, evidenceState = 'declared') {
  return {
    id,
    title,
    pointsAvailable,
    pointsAwarded: met ? pointsAvailable : 0,
    met,
    evidenceState,
    explanation,
    ruleRefs,
  };
}

function assessEndorsement(input, assessmentDate) {
  const issues = [];
  const reviewItems = [];
  const endorsement = input.endorsement;

  if (endorsement.status === 'no_letter') {
    issues.push('A current endorsement letter is required before an Innovator Founder application can be valid.');
    return { validForPoints: false, issues, reviewItems, ageInDays: null };
  }
  if (endorsement.status === 'unknown') {
    issues.push('The endorsing body status has not been verified against the Home Office list.');
    return { validForPoints: false, issues, reviewItems, ageInDays: null };
  }
  if (endorsement.withdrawn) {
    issues.push('The declared endorsement has been withdrawn and cannot support the application.');
    return { validForPoints: false, issues, reviewItems, ageInDays: null };
  }

  const issueDate = parseDateOnly(endorsement.issueDate);
  if (!issueDate) {
    issues.push('A valid endorsement issue date is required.');
    return { validForPoints: false, issues, reviewItems, ageInDays: null };
  }
  if (issueDate > assessmentDate) {
    issues.push('The endorsement issue date cannot be after the assessment date.');
    return { validForPoints: false, issues, reviewItems, ageInDays: null };
  }

  const earliestPermitted = subtractCalendarMonthsClamped(assessmentDate, 3);
  if (issueDate < earliestPermitted) {
    issues.push('The endorsement letter is more than 3 months old for an application made now.');
  }

  if (endorsement.status === 'business_endorser') {
    const approved = CURRENT_BUSINESS_ENDORSERS.some((name) => normalizeName(name) === normalizeName(endorsement.bodyName));
    if (!approved) {
      issues.push('The named organisation is not in this policy version’s current Business Endorsing Bodies list.');
    }
  }

  if (endorsement.status === 'legacy_endorser' && !endorsement.legacyEligibilityConfirmed) {
    issues.push('A legacy endorsing body can only support limited existing/previously endorsed cases; the legacy eligibility conditions have not been confirmed.');
  }

  const ageInDays = Math.floor((assessmentDate.getTime() - issueDate.getTime()) / 86400000);
  return { validForPoints: issues.length === 0, issues, reviewItems, ageInDays };
}

function assessEnglish(english) {
  let met = false;
  let explanation = '';

  switch (english.evidenceMethod) {
    case 'approved_selt':
      met = english.evidenceAvailable && ['b2', 'c1', 'c2'].includes(english.seltLevel);
      explanation = met
        ? 'Declared approved SELT evidence is at B2 or higher in the required components.'
        : 'An approved SELT must demonstrate at least B2 and the evidence must be available.';
      break;
    case 'uk_degree':
    case 'overseas_degree_ecctis':
    case 'uk_school_qualification':
    case 'previous_successful_visa':
    case 'exempt_nationality':
      met = english.evidenceAvailable;
      explanation = met
        ? 'A recognised English-language evidence route has been declared with evidence available.'
        : 'The selected English-language route needs supporting evidence.';
      break;
    case 'none':
      explanation = 'No qualifying English-language evidence has been declared.';
      break;
    default:
      explanation = 'The English-language evidence route is uncertain and needs to be checked.';
  }

  return criterion(
    'english-b2',
    'English language at B2',
    10,
    met,
    ['INNF 5.1', 'INNF 11.1', 'INNF 11.2', 'Appendix English Language'],
    explanation,
    met ? 'declared' : 'missing_or_uncertain',
  );
}

function maintenanceRequired(input) {
  return !(input.applicationRoute === 'permission_to_stay' && input.immigrationStatus.monthsWithUKPermission >= 12);
}

function calculateDependentMaintenance(partnerRequired, childrenRequired) {
  const partner = partnerRequired ? 285 : 0;
  const children = childrenRequired <= 0 ? 0 : 315 + Math.max(0, childrenRequired - 1) * 200;
  return { partner, children, total: partner + children };
}

function assessFinance(input) {
  const required = maintenanceRequired(input);
  const dependant = calculateDependentMaintenance(
    input.finance.partnerRequiringMaintenanceFunds,
    input.finance.childrenRequiringMaintenanceFunds,
  );
  const mainApplicantRequired = required ? 1270 : 0;
  const familyTotalRequired = mainApplicantRequired + dependant.total;

  if (!required) {
    return {
      criterion: criterion(
        'financial-requirement',
        'Financial requirement',
        10,
        true,
        ['INNF 5.1', 'INNF 12.1'],
        'The main applicant declares 12 months or more of UK permission and is applying for permission to stay, so the main applicant financial requirement is met without showing maintenance funds.',
        'automatic_rule',
      ),
      maintenance: {
        mainApplicantEvidenceRequired: false,
        mainApplicantRequiredGbp: 0,
        dependantRequiredGbp: dependant.total,
        familyTotalRequiredGbp: dependant.total,
        declaredMainApplicantFundsGbp: input.finance.fundsGbp,
      },
    };
  }

  const met = input.finance.fundsGbp >= 1270
    && input.finance.heldFor28ConsecutiveDays
    && input.finance.mostRecentEvidenceWithin31Days
    && input.finance.immediatelyAccessibleAccount
    && input.finance.accountHolderHasControl
    && input.finance.excludesBusinessInvestmentFunds
    && input.finance.excludesUnlawfulUKEarnings;

  return {
    criterion: criterion(
      'financial-requirement',
      'Financial requirement',
      10,
      met,
      ['INNF 5.1', 'INNF 12.2', 'INNF 12.3', 'FIN 4.1', 'FIN 5.1-5.2', 'FIN 7.1-7.3', 'FIN 8.1-8.2'],
      met
        ? 'The declared main-applicant funds meet the £1,270 amount, 28-day holding period, evidence-date and accessible-account checks in this assessment.'
        : 'The main-applicant maintenance evidence does not currently satisfy every required finance check.',
      met ? 'declared' : 'missing_or_uncertain',
    ),
    maintenance: {
      mainApplicantEvidenceRequired: true,
      mainApplicantRequiredGbp: 1270,
      dependantRequiredGbp: dependant.total,
      familyTotalRequiredGbp: familyTotalRequired,
      declaredMainApplicantFundsGbp: input.finance.fundsGbp,
    },
  };
}

function allTrue(values) {
  return values.every(Boolean);
}

function assessBusiness(input, endorsementValid) {
  if (input.business.criteria === 'new_business') {
    const planReady = allTrue([
      input.business.businessPlanExists,
      input.business.generatedOrSignificantlyContributed,
      input.business.dayToDayRole,
      input.business.twoContactPointMeetingsCommitted,
      input.business.soleOrInstrumentalFounder,
    ]);
    const ivsReady = allTrue([
      input.business.genuineOriginalPlan,
      input.business.realisticAndAchievable,
      input.business.skillsKnowledgeExperienceMarketAwareness,
      input.business.structuredPlanningJobsNationalInternationalGrowth,
    ]);
    const planMet = endorsementValid && planReady;
    const ivsMet = endorsementValid && ivsReady;

    return {
      criteria: 'new_business',
      potentialPoints: (planReady ? 30 : 0) + (ivsReady ? 20 : 0),
      criteriaResults: [
        criterion(
          'new-business-plan',
          'New business: business plan and founder role',
          30,
          planMet,
          ['INNF 5.1', 'INNF 8.1', 'INNF 8.2'],
          planMet
            ? 'The declared endorsement and business-plan/founder-role conditions support the 30-point criterion.'
            : planReady
              ? 'The underlying business-plan conditions are declared ready, but a valid current endorsement is still required for the points to be awarded.'
              : 'One or more business-plan/founder-role conditions are not yet met.',
          planMet ? 'declared_and_endorsed' : 'pending',
        ),
        criterion(
          'new-business-ivs',
          'New business: innovative, viable and scalable',
          20,
          ivsMet,
          ['INNF 5.1', 'INNF 8.1', 'INNF 8.3'],
          ivsMet
            ? 'The declared endorsement and all four Innovation, Viability and Scalability conditions support the 20-point criterion.'
            : ivsReady
              ? 'The underlying Innovation, Viability and Scalability conditions are declared ready, but a valid current endorsement is still required for the points to be awarded.'
              : 'One or more Innovation, Viability or Scalability conditions are not yet met.',
          ivsMet ? 'declared_and_endorsed' : 'pending',
        ),
      ],
    };
  }

  const previousRouteEligible = SAME_BUSINESS_PREVIOUS_ROUTES.has(input.business.previousPermissionRoute);
  const contactCondition = input.business.previousPermissionRoute === 'innovator_founder'
    ? input.business.previousContactPointRequirementMet
    : true;
  const previouslyAssessedReady = allTrue([
    previousRouteEligible,
    input.business.businessPreviouslyAssessed,
    contactCondition,
    input.business.twoFutureContactPointMeetingsCommitted,
  ]);
  const activeReady = allTrue([
    input.business.activeTradingSustainable,
    input.business.significantProgressAgainstPlan,
    input.business.companiesHouseRegistered,
    input.business.directorOrMember,
  ]);
  const managementReady = input.business.dayToDayManagement;

  const previouslyAssessedMet = endorsementValid && previouslyAssessedReady;
  const activeMet = endorsementValid && activeReady;
  const managementMet = endorsementValid && managementReady;

  return {
    criteria: 'same_business',
    potentialPoints: (previouslyAssessedReady ? 10 : 0) + (activeReady ? 20 : 0) + (managementReady ? 20 : 0),
    criteriaResults: [
      criterion(
        'same-business-assessed',
        'Same business: eligible previous route and prior assessment',
        10,
        previouslyAssessedMet,
        ['INNF 5.1', 'INNF 9.1', 'INNF 9.2', 'INNF 9.3'],
        previouslyAssessedMet
          ? 'The declared previous-route, prior-assessment and contact-point conditions support the 10-point criterion.'
          : 'The same-business previous-route/prior-assessment/contact-point conditions are not fully satisfied with a valid current endorsement.',
        previouslyAssessedMet ? 'declared_and_endorsed' : 'pending',
      ),
      criterion(
        'same-business-active',
        'Same business: active, trading, sustainable and progressing',
        20,
        activeMet,
        ['INNF 5.1', 'INNF 9.4', 'INNF 9.5'],
        activeMet
          ? 'The declared trading, sustainability, progress and Companies House conditions support the 20-point criterion.'
          : 'One or more active-business, progress or Companies House conditions are not fully satisfied with a valid current endorsement.',
        activeMet ? 'declared_and_endorsed' : 'pending',
      ),
      criterion(
        'same-business-management',
        'Same business: day-to-day management',
        20,
        managementMet,
        ['INNF 5.1', 'INNF 10.1'],
        managementMet
          ? 'The declared active day-to-day management role supports the 20-point criterion.'
          : 'The day-to-day management requirement is not fully satisfied with a valid current endorsement.',
        managementMet ? 'declared_and_endorsed' : 'pending',
      ),
    ],
  };
}

function assessValidityAndSwitching(input) {
  const blockers = [];
  const reviewItems = [];

  if (input.age < 18) blockers.push('The applicant must be aged 18 or over on the date of application (INNF 1.3).');
  if (!input.documents.validPassportOrTravelDocument) blockers.push('A passport or other travel document establishing identity and nationality is required (INNF 1.2(c)).');

  if (input.applicationRoute === 'permission_to_stay') {
    if (!input.immigrationStatus.physicallyInUK) {
      blockers.push('An applicant applying for permission to stay must be in the UK on the date of application (INNF 1.5).');
    }
    if (DISALLOWED_SWITCHING_ROUTES.has(input.immigrationStatus.currentPermissionRoute)) {
      blockers.push('The declared current/last permission is a category from which an in-country Innovator Founder switch is not permitted (INNF 1.5ZA).');
    }
    if (input.immigrationStatus.currentPermissionRoute === 'student') {
      const studentConditionMet = ['course_completed', 'phd_24_months_completed'].includes(input.immigrationStatus.studentCourseCondition);
      if (!studentConditionMet) {
        blockers.push('A Student switching in-country must satisfy the course-completion or PhD 24-month condition in INNF 1.5A.');
      }
    }
  }

  if (input.immigrationStatus.governmentScholarshipConsentRequired && !input.immigrationStatus.governmentScholarshipConsentAvailable) {
    blockers.push('Written consent is required where the government/international scholarship condition in INNF 1.4 applies.');
  }

  if (input.applicationRoute === 'entry_clearance') {
    if (input.documents.tuberculosisRequirement === 'required' && !input.documents.tuberculosisCertificateAvailable) {
      blockers.push('A valid tuberculosis certificate is required for this declared entry-clearance scenario (INNF 3.2).');
    } else if (input.documents.tuberculosisRequirement === 'unsure') {
      reviewItems.push('Check whether Appendix Tuberculosis applies before submitting an entry-clearance application.');
    }
  }

  if (input.documents.translationRequirement === 'required' && !input.documents.certifiedTranslationsAvailable) {
    blockers.push('Documents not in English or Welsh need certified translations for the application evidence set.');
  } else if (input.documents.translationRequirement === 'unsure') {
    reviewItems.push('Check whether any supporting documents need certified English or Welsh translations.');
  }

  if (input.immigrationStatus.onImmigrationBail !== 'no') {
    reviewItems.push('Immigration bail can affect permission-to-stay validity and may involve exceptions; this needs individual legal review.');
  }
  if (input.immigrationStatus.inBreachOfImmigrationLaws !== 'no') {
    reviewItems.push('A current or previous immigration-law breach may engage Part Suitability or an overstayer exception and needs individual legal review.');
  }

  return { blockers, reviewItems };
}

function assessEligibility(rawInput, options = {}) {
  const input = eligibilityInputSchema.parse(rawInput);
  const assessmentDate = currentDateOnly(options.now || new Date());
  const endorsement = assessEndorsement(input, assessmentDate);
  const business = assessBusiness(input, endorsement.validForPoints);
  const english = assessEnglish(input.english);
  const finance = assessFinance(input);
  const validity = assessValidityAndSwitching(input);

  const criteria = [...business.criteriaResults, english, finance.criterion];
  const totalPoints = criteria.reduce((sum, item) => sum + item.pointsAwarded, 0);
  const potentialPoints = business.potentialPoints + english.pointsAwarded + finance.criterion.pointsAwarded;
  const blockers = [...validity.blockers, ...endorsement.issues];

  for (const item of criteria) {
    if (!item.met) blockers.push(`${item.title}: ${item.explanation}`);
  }

  const uniqueBlockers = Array.from(new Set(blockers));
  const uniqueReviewItems = Array.from(new Set(validity.reviewItems));
  const pointsThresholdMet = totalPoints === 70;
  let status = 'not_ready';
  if (pointsThresholdMet && uniqueBlockers.length === 0 && uniqueReviewItems.length === 0) status = 'ready_on_declared_evidence';
  else if (pointsThresholdMet && uniqueBlockers.length === 0) status = 'review_required';

  return {
    policyVersion: POLICY_VERSION,
    policyEffectiveDate: POLICY_EFFECTIVE_DATE,
    assessedAt: assessmentDate.toISOString(),
    route: 'Innovator Founder',
    assessmentScope: 'entry_clearance_or_permission_to_stay',
    status,
    disclaimer: 'Automated rules assessment based on the information supplied. It is not a Home Office decision, endorsement decision or regulated immigration advice.',
    points: {
      required: 70,
      awarded: totalPoints,
      potentialOnDeclaredBusinessReadiness: potentialPoints,
      thresholdMet: pointsThresholdMet,
      businessCriteria: business.criteria,
      criteria,
    },
    endorsement: {
      validForPoints: endorsement.validForPoints,
      declaredStatus: input.endorsement.status,
      bodyName: input.endorsement.bodyName || null,
      ageInDays: endorsement.ageInDays,
      currentBusinessEndorsers: CURRENT_BUSINESS_ENDORSERS,
    },
    maintenance: finance.maintenance,
    blockers: uniqueBlockers,
    reviewItems: uniqueReviewItems,
    scopeLimitations: [
      'Part Suitability contains grounds that cannot be determined safely from this automated questionnaire alone.',
      'An endorsing body, not this tool, determines whether the business satisfies the endorsement criteria and whether evidence is credible.',
      'Additional documents may be required depending on nationality, immigration history and individual circumstances.',
      'This assessment uses the policy version shown above; re-check the official rules immediately before applying.',
    ],
    sources: OFFICIAL_SOURCES,
  };
}

module.exports = {
  POLICY_VERSION,
  POLICY_EFFECTIVE_DATE,
  OFFICIAL_SOURCES,
  CURRENT_BUSINESS_ENDORSERS,
  eligibilityInputSchema,
  assessEligibility,
  calculateDependentMaintenance,
  maintenanceRequired,
};
