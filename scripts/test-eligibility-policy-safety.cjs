const assert = require('assert/strict');
const { assessEligibility } = require('../server/eligibilityPolicy.cjs');
const { applyEligibilityPolicySafety } = require('../server/eligibilityPolicySafety.cjs');

const NOW = new Date('2026-08-16T12:00:00.000Z');

function newBusinessInput() {
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

function sameBusinessInput() {
  const input = newBusinessInput();
  input.business = {
    criteria: 'same_business',
    previousPermissionRoute: 'innovator_founder',
    businessPreviouslyAssessed: true,
    previousContactPointRequirementMet: true,
    twoFutureContactPointMeetingsCommitted: true,
    activeTradingSustainable: true,
    significantProgressAgainstPlan: true,
    companiesHouseRegistered: true,
    directorOrMember: true,
    dayToDayManagement: true,
  };
  return input;
}

function assess(input) {
  return applyEligibilityPolicySafety(input, assessEligibility(input, { now: NOW }));
}

{
  const result = assess(newBusinessInput());
  assert.equal(result.points.awarded, 70);
  assert.equal(result.status, 'ready_on_declared_evidence');
  assert.deepEqual(result.policySafety.ambiguityOverrides, []);
}

{
  const input = sameBusinessInput();
  input.business.previousPermissionRoute = 'innovator';
  const result = assess(input);
  assert.equal(result.points.awarded, 60, 'old Innovator permission must not be auto-awarded the disputed 10 same-business points');
  assert.equal(result.status, 'not_ready');
  assert.ok(result.policySafety.ambiguityOverrides.includes('same_business_previous_innovator_route'));
  assert.ok(result.reviewItems.some((item) => item.includes('internal inconsistency')));
}

{
  const input = newBusinessInput();
  input.endorsement.status = 'legacy_endorser';
  input.endorsement.bodyName = 'Legacy body';
  input.endorsement.legacyEligibilityConfirmed = true;
  const result = assess(input);
  assert.equal(result.points.awarded, 20, 'legacy endorsement business points must require individual review');
  assert.equal(result.endorsement.validForPoints, false);
  assert.ok(result.policySafety.ambiguityOverrides.includes('legacy_endorsement_manual_review'));
  assert.ok(result.reviewItems.some((item) => item.includes('Legacy endorsement')));
}

{
  const input = newBusinessInput();
  input.endorsement.bodyName = 'The Global Entrepreneurs Programme (GEP)';
  const result = assess(input);
  assert.equal(result.points.awarded, 20, 'GEP business points must not be auto-awarded without independent invitation verification');
  assert.equal(result.endorsement.validForPoints, false);
  assert.ok(result.policySafety.ambiguityOverrides.includes('gep_invitation_not_independently_verified'));
  assert.ok(result.reviewItems.some((item) => item.includes('Global Entrepreneurs Programme')));
}

{
  const input = newBusinessInput();
  input.applicationRoute = 'permission_to_stay';
  input.immigrationStatus.currentPermissionRoute = 'student';
  input.immigrationStatus.physicallyInUK = true;
  input.immigrationStatus.studentCourseCondition = 'unsure';
  const result = assess(input);
  assert.ok(result.policySafety.ambiguityOverrides.includes('student_phd_rules_guidance_discrepancy'));
  assert.ok(result.reviewItems.some((item) => item.includes('24 months')));
  assert.equal(result.status, 'not_ready');
}

console.log(JSON.stringify({
  ok: true,
  scenarios: 5,
  covered: [
    'ordinary current business endorsement remains unchanged',
    'old Innovator same-business source conflict fails safe',
    'legacy endorsement source conflict fails safe',
    'GEP invitation requirement fails safe',
    'Student PhD Rules/guidance conflict is surfaced',
  ],
}, null, 2));
