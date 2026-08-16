# Production IVS evidence engine

## Scope

This engine supports six existing tools through one policy implementation:

- Endorsement Readiness Checker
- Criteria Assessment Scorer
- Innovation Score Calculator
- Innovation Validation Report
- Business Model Validator
- Viability Checker

It assesses **evidence readiness**, not the probability of obtaining endorsement or a visa.

## Official criteria

The model is based on INNF 8.3 and the Home Office guidance for endorsing bodies.

### Innovation

Coverage checks address:

- clear and compelling USP against actual competitors;
- reasonable barriers to replication/market entry;
- innovation being core to the business proposition;
- core innovation being primarily delivered within the business rather than largely outsourced;
- technical, prototype, R&D or IP evidence supporting the claimed innovation.

### Viability

Coverage checks address:

- access to funds sufficient to cover the applicant's own researched minimum setup cost;
- a financial model supported by researched assumptions;
- founder/team skills, knowledge and experience evidence;
- credible customer demand evidence;
- market and competitor research supporting demand, pricing and cost assumptions.

The engine calculates funding coverage and implied runway from the applicant's own figures. It does not invent a Home Office minimum runway.

### Scalability

Coverage checks address:

- structured planning and a credible path to growth;
- potential for skilled job creation;
- national expansion evidence;
- international expansion evidence;
- research-backed projections;
- operational ability to scale delivery.

## Evidence model

Narrative alone is not treated as complete coverage. The user supplies a structured evidence inventory using evidence types such as competitor analysis, market research, customer interviews, LOIs/contracts, pilot metrics, architecture, prototype, R&D, founder credentials, financial model, funding evidence, hiring plan and expansion plans.

A stable reference can be attached to each evidence item. References are persisted in the shared `tool_runs` provenance model.

## Result model

Each criterion returns:

- transparent check coverage;
- `critical_gap`, `needs_strengthening`, or `evidence_ready_for_endorser_review`;
- critical gaps;
- expected evidence types for gaps;
- assessor-style challenge questions;
- red flags;
- financial reality checks;
- official source links.

`evidence_ready_for_endorser_review` deliberately does not mean that the criterion is met. Only an authorised endorsing body can make that decision.

## Auditability

Every run is saved server-side with:

- tool ID;
- registry version;
- IVS policy version;
- shared case-context revision;
- validated input snapshot;
- evidence references;
- structured result;
- SHA-256 result fingerprint;
- immutable lifecycle events.
