const assert = require('assert/strict');
const {
  POLICY_VERSION,
  assessEligibility,
  calculateDependentMaintenance,
} = require('../server/eligibilityPolicy.cjs');

const NOW = new Date('2026-08-16T12:00:00.000Z');

function baseNewBusinessInput() {
  return {
    toolId: 'eligibility-validator',
    applicationRoute: 'entry_clearance',
    age: 34,
    endorsement: {
      status: 'business_endorser',
      bodyName: 'UK Endorsing Services',
      issueDate: '2026-07-01',
      withdrawn: false,
      legacyEligibilityConfirmed: false,
    },
    business: {
      criteria: 'new_business',
      businessPlanExists: true,
      generatedOrSignificantlyContributed: true,
      dayToDayRole: true,
      twoContactPointMeetingsCommitted: true,
      soleOrInstrumentalFounder: true,
      genuineOriginalPlan: true,
      realisticAndAchievable: true,
      skillsKnowledgeExperienceMarketAwareness: true,
      structuredPlanningJobsNationalInternationalGrowth: true,
    },
    english: {
      evidenceMethod: 'approved_selt',
      seltLevel: 'b2',
      evidenceAvailable: true,
    },
    finance: {
      fundsGbp: 1270,
      heldFor28ConsecutiveDays: true,
      mostRecentEvidenceWithin31Days: true,
      immediatelyAccessibleAccount: true,
      accountHolderHasControl: true,
      excludesBusinessInvestmentFunds: true,
      excludesUnlawfulUKEarnings: true,
      partnerRequiringMaintenanceFunds: false,
      childrenRequiringMaintenanceFunds: 0,
    },
    documents: {
      validPassportOrTravelDocument: true,
      tuberculosisRequirement: 'not_required',
      tuberculosisCertificateAvailable: false,
      translationRequirement: 'not_required',
      certifiedTranslationsAvailable: false,
    },
    immigrationStatus: {
      currentPermissionRoute: 'none',
      monthsWithUKPermission: 0,
      physicallyInUK: false,
      studentCourseCondition: 'not_applicable',
      onImmigrationBail: 'no',
      inBreachOfImmigrationLaws: 'no',
      governmentScholarshipConsentRequired: false,
      governmentScholarshipConsentAvailable: false,
    },
  };
}

function assess(input) {
  return assessEligibility(input, { now: NOW });
}

{
  const result = assess(baseNewBusinessInput());
  assert.equal(POLICY_VERSION, 'uk-innovator-founder-2026-08-03');
  assert.equal(result.points.awarded, 70);
  assert.equal(result.points.required, 70);
  assert.equal(result.points.thresholdMet, true);
  assert.equal(result.points.businessCriteria, 'new_business');
  assert.equal(result.status, 'ready_on_declared_evidence');
  assert.deepEqual(result.blockers, []);
}

{
  const input = baseNewBusinessInput();
  input.applicationRoute = 'permission_to_stay';
  input.immigrationStatus.currentPermissionRoute = 'other';
  input.immigrationStatus.monthsWithUKPermission = 12;
  input.immigrationStatus.physicallyInUK = true;
  input.finance.fundsGbp = 0;
  input.finance.heldFor28ConsecutiveDays = false;
  input.finance.mostRecentEvidenceWithin31Days = false;
  input.finance.immediatelyAccessibleAccount = false;
  input.finance.accountHolderHasControl = false;
  input.finance.excludesBusinessInvestmentFunds = false;
  input.finance.excludesUnlawfulUKEarnings = false;

  const result = assess(input);
  assert.equal(result.points.awarded, 70, '12+ months UK permission should satisfy main financial requirement automatically');
  assert.equal(result.maintenance.mainApplicantEvidenceRequired, false);
  assert.equal(result.maintenance.mainApplicantRequiredGbp, 0);
}

{
  const input = baseNewBusinessInput();
  input.applicationRoute = 'permission_to_stay';
  input.immigrationStatus.currentPermissionRoute = 'visitor';
  input.immigrationStatus.monthsWithUKPermission = 1;
  input.immigrationStatus.physicallyInUK = true;
  const result = assess(input);
  assert.equal(result.points.awarded, 70);
  assert.equal(result.status, 'not_ready');
  assert.ok(result.blockers.some((item) => item.includes('switch')));
}

{
  const input = baseNewBusinessInput();
  input.endorsement.status = 'no_letter';
  input.endorsement.bodyName = '';
  input.endorsement.issueDate = '';
  const result = assess(input);
  assert.equal(result.points.awarded, 20, 'English and finance points may be evidenced but business points require endorsement');
  assert.equal(result.points.potentialOnDeclaredBusinessReadiness, 70);
  assert.equal(result.endorsement.validForPoints, false);
  assert.ok(result.blockers.some((item) => item.includes('endorsement letter')));
}

{
  const input = baseNewBusinessInput();
  input.endorsement.issueDate = '2026-04-01';
  const result = assess(input);
  assert.equal(result.endorsement.validForPoints, false);
  assert.equal(result.points.awarded, 20);
  assert.ok(result.blockers.some((item) => item.includes('more than 3 months old')));
}

{
  const dependant = calculateDependentMaintenance(true, 2);
  assert.deepEqual(dependant, { partner: 285, children: 515, total: 800 });

  const input = baseNewBusinessInput();
  input.finance.partnerRequiringMaintenanceFunds = true;
  input.finance.childrenRequiringMaintenanceFunds = 2;
  const result = assess(input);
  assert.equal(result.maintenance.mainApplicantRequiredGbp, 1270);
  assert.equal(result.maintenance.dependantRequiredGbp, 800);
  assert.equal(result.maintenance.familyTotalRequiredGbp, 2070);
}

{
  const input = baseNewBusinessInput();
  input.applicationRoute = 'permission_to_stay';
  input.immigrationStatus.currentPermissionRoute = 'student';
  input.immigrationStatus.monthsWithUKPermission = 8;
  input.immigrationStatus.physicallyInUK = true;
  input.immigrationStatus.studentCourseCondition = 'condition_not_met';
  const result = assess(input);
  assert.equal(result.status, 'not_ready');
  assert.ok(result.blockers.some((item) => item.includes('Student switching')));
}

{
  const input = baseNewBusinessInput();
  input.english.seltLevel = 'b1';
  assert.throws(
    () => assess(input),
    /Invalid enum value|Invalid option/,
    'unsupported English level must fail schema validation rather than being silently coerced',
  );
}

{
  const result = assess(baseNewBusinessInput());
  const allText = JSON.stringify(result).toLowerCase();
  assert.equal(allText.includes('£50,000'), false, 'initial eligibility engine must not invent a fixed £50,000 investment requirement');
  assert.equal(allText.includes('50000'), false, 'initial eligibility engine must not encode a fixed 50,000 investment requirement');
}

console.log(JSON.stringify({
  ok: true,
  policyVersion: POLICY_VERSION,
  scenarios: 9,
  covered: [
    '70-point new-business route',
    '12-month main-applicant finance exemption',
    'in-country switching restriction',
    'endorsement required for business points',
    'three-month endorsement freshness',
    'dependent maintenance calculation',
    'student switching condition',
    'strict English evidence schema',
    'no fixed £50,000 initial investment rule',
  ],
}, null, 2));
