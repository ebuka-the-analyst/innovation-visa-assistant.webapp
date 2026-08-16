const GEP_NAME = 'The Global Entrepreneurs Programme (GEP)';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return Array.from(new Set(values));
}

function zeroBusinessPoints(result, reason, reviewItem) {
  for (const criterion of result.points.criteria) {
    if (!criterion.id.startsWith('new-business-') && !criterion.id.startsWith('same-business-')) continue;
    criterion.pointsAwarded = 0;
    criterion.met = false;
    criterion.evidenceState = 'manual_review';
    criterion.explanation = `${criterion.explanation} ${reason}`.trim();
  }
  result.endorsement.validForPoints = false;
  result.blockers.push(reason);
  if (reviewItem) result.reviewItems.push(reviewItem);
}

function zeroSameBusinessRouteCriterion(result, reason, reviewItem) {
  const criterion = result.points.criteria.find((item) => item.id === 'same-business-assessed');
  if (criterion) {
    criterion.pointsAwarded = 0;
    criterion.met = false;
    criterion.evidenceState = 'manual_review';
    criterion.explanation = `${criterion.explanation} ${reason}`.trim();
  }
  result.blockers.push(reason);
  if (reviewItem) result.reviewItems.push(reviewItem);
}

function recompute(result) {
  result.points.awarded = result.points.criteria.reduce(
    (sum, criterion) => sum + Number(criterion.pointsAwarded || 0),
    0,
  );
  result.points.thresholdMet = result.points.awarded === result.points.required;
  result.blockers = unique(result.blockers);
  result.reviewItems = unique(result.reviewItems);

  if (result.points.thresholdMet && result.blockers.length === 0 && result.reviewItems.length === 0) {
    result.status = 'ready_on_declared_evidence';
  } else if (result.points.thresholdMet && result.blockers.length === 0) {
    result.status = 'review_required';
  } else {
    result.status = 'not_ready';
  }
  return result;
}

function applyEligibilityPolicySafety(rawInput, rawResult) {
  const input = rawInput || {};
  const result = clone(rawResult);
  result.policySafety = {
    sourcePrecedence: 'Immigration Rules first; conflicting operational guidance triggers conservative review',
    ambiguityOverrides: [],
  };

  if (
    input.business?.criteria === 'same_business'
    && input.business?.previousPermissionRoute === 'innovator'
  ) {
    const reason =
      'Automatic same-business points are not awarded for a previous legacy Innovator permission because INNF 9.1 and INNF 9.2 omit that route, despite the INNF 5.1 points table mentioning it.';
    zeroSameBusinessRouteCriterion(
      result,
      reason,
      'The current Immigration Rules contain an internal inconsistency for previous Innovator permission. Obtain individual confirmation before relying on same-business eligibility.',
    );
    result.policySafety.ambiguityOverrides.push('same_business_previous_innovator_route');
  }

  if (input.endorsement?.status === 'legacy_endorser') {
    const reason =
      'Business points from a Legacy Endorsing Body are not awarded automatically because the current Immigration Rules and current caseworker guidance describe the restricted legacy conditions differently.';
    zeroBusinessPoints(
      result,
      reason,
      'Legacy endorsement eligibility needs an individual review of the previous permission, previous endorsing body, endorsement history and the exact INNF 7.1/7.2 route conditions before application.',
    );
    result.policySafety.ambiguityOverrides.push('legacy_endorsement_manual_review');
  }

  if (
    input.endorsement?.status === 'business_endorser'
    && input.endorsement?.bodyName === GEP_NAME
  ) {
    const reason =
      'GEP business points are not awarded automatically because GEP only endorses founders already invited to participate in its programme and this assessment does not independently verify that invitation.';
    zeroBusinessPoints(
      result,
      reason,
      'If using GEP, confirm acceptance/invitation onto the Global Entrepreneurs Programme and retain evidence before relying on the endorsement.',
    );
    result.policySafety.ambiguityOverrides.push('gep_invitation_not_independently_verified');
  }

  if (
    input.applicationRoute === 'permission_to_stay'
    && input.immigrationStatus?.currentPermissionRoute === 'student'
    && input.immigrationStatus?.studentCourseCondition === 'unsure'
  ) {
    result.reviewItems.push(
      'For a Student on a PhD, current INNF 1.5A requires at least 24 months of PhD study, while the latest caseworker guidance currently says 12 months. The automated engine follows the Immigration Rules and does not relax the 24-month requirement.',
    );
    result.policySafety.ambiguityOverrides.push('student_phd_rules_guidance_discrepancy');
  }

  return recompute(result);
}

module.exports = {
  applyEligibilityPolicySafety,
};
