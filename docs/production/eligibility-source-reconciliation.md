# Innovator Founder policy source reconciliation

## Precedence

For deterministic automated eligibility, the current Immigration Rules are the primary rule source. Where current Home Office caseworker guidance or a points table conflicts with the operative requirement text, the platform must not resolve the conflict in the applicant's favour silently. It must fail safe and surface the case for individual review.

## Same-business previous Innovator permission

Current INNF 5.1 includes previous `Innovator` permission in the 10-point same-business table. Current INNF 9.1 and INNF 9.2, however, list only Innovator Founder, Start-up and Tier 1 (Graduate Entrepreneur). Current caseworker guidance repeats both positions in different sections.

Production behaviour: previous legacy `Innovator` permission does not automatically receive the disputed 10 points. The assessment records a source-conflict review item.

## Legacy endorsing bodies

Current INNF 7.1 and 7.2 contain tightly restricted legacy endorsement provisions. The current caseworker guidance describes those conditions differently in places.

Production behaviour: a Legacy Endorsing Body is not automatically treated as satisfying the business-points endorsement condition. The assessment preserves the applicant's declared facts but routes the legacy endorsement to individual review. This avoids a false positive while the exact historic permission/endorsement chain is checked.

## Global Entrepreneurs Programme

The current authorised endorsing-body list says GEP only provides visa endorsements to founders already invited to participate in the programme.

Production behaviour: selecting GEP does not automatically award business points because the tool does not independently verify programme invitation. The user is told to confirm and retain evidence of the invitation/acceptance.

## Student PhD switching period

Current INNF 1.5A says a Student on a qualifying PhD must have completed at least 24 months of study to use Condition B. The latest caseworker guidance currently says 12 months in its switching section.

Production behaviour: the rules engine keeps the 24-month Immigration Rules requirement. An uncertain Student/PhD case receives an explicit review note rather than a relaxed automated decision.

## Auditability

Safety overrides are written into the persisted assessment under `policySafety.ambiguityOverrides`, and the tool-run validation summary records the reconciled engine version. Historical assessments therefore remain traceable to the exact source-handling policy that produced them.
