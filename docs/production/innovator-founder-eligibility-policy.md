# Innovator Founder eligibility policy engine

## Policy snapshot

Engine ID: `uk-innovator-founder-2026-08-03`

Primary official sources:

- Immigration Rules Appendix Innovator Founder.
- Immigration Rules Appendix Finance.
- GOV.UK Innovator Founder eligibility guidance.
- GOV.UK Innovator Founder English-language guidance.
- GOV.UK Innovator Founder document guidance.
- GOV.UK authorised Innovator Founder endorsing-body list.

The engine must be reviewed whenever any of those sources changes. A policy change requires a new engine/policy version; an already persisted assessment keeps the version and result hash that were used when it was generated.

## Points model

Appendix Innovator Founder requires 70 points. The business component must be entirely under either the new-business criteria or the same-business criteria.

### New business

- 30 points: business plan / founder-role requirements in INNF 8.2.
- 20 points: Innovation, Viability and Scalability requirements in INNF 8.3.
- 10 points: English language at B2.
- 10 points: financial requirement.

### Same business

- 10 points: eligible previous route, business previously assessed and applicable contact-point requirements.
- 20 points: active/trading/sustainable business, significant progress and Companies House/director-or-member requirements.
- 20 points: day-to-day management and development.
- 10 points: English language at B2.
- 10 points: financial requirement.

Business points are not treated as awarded merely because a user declares that the underlying business is strong. A current qualifying endorsement is required by the engine before the relevant business points are counted.

## Endorsement

For an application made now, the letter must be current under INNF 1.2/6.1, must not be withdrawn and must come from a qualifying endorsing body.

For ordinary current new endorsements, the engine validates the selected organisation against the current Business Endorsing Bodies list included in this policy snapshot. Legacy endorsers are treated separately and require the applicant to confirm that the restricted legacy rules apply to their previously endorsed case.

## Financial requirement

For a main applicant applying for permission to stay who has been in the UK with permission for 12 months or longer, INNF 12.1 treats the financial requirement as met without showing maintenance funds.

Otherwise the main applicant must satisfy the £1,270 amount and 28-day requirement together with the relevant Appendix Finance controls used by the engine, including evidence recency and accessible/control-of-funds checks.

Dependent maintenance is reported separately:

- partner: £285;
- first child: £315;
- each additional child: £200.

The dependant calculation only covers dependants the user declares as needing maintenance evidence.

## No fixed initial £50,000 rule

The engine deliberately contains no fixed £50,000 initial-investment requirement. A new-business applicant must demonstrate to the endorsing body that funding is sufficient for the business and where it comes from. The £50,000 figure in Appendix Innovator Founder is one of several possible business-performance criteria relevant to settlement, not a blanket initial visa investment threshold.

## Switching and validity checks

The engine separately evaluates non-points blockers or review items including:

- minimum age;
- passport/travel-document availability;
- being in the UK for an in-country application;
- prohibited switching categories;
- Student course/PhD switching conditions;
- scholarship consent where applicable;
- TB evidence where applicable;
- certified translations where applicable;
- declared immigration bail or immigration-law breach requiring individual review.

## Safety boundary

The result is an automated rules assessment, not a Home Office decision, an endorsing-body decision or regulated immigration advice.

`validation_state = validated` in the tool-run ledger means only that the server validated the input schema and deterministic calculation against the recorded policy engine version. It must never be presented as a guarantee that UKVI, an endorsing body or a legal adviser would reach the same conclusion.

Part Suitability and the credibility/sufficiency of evidence cannot safely be decided by this questionnaire alone and are explicitly retained as scope limitations or review items.
