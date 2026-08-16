# Production financial modelling suite

## Scope

Nine existing financial tools use one deterministic server-side 36-month model:

- Financial Projections Generator
- Budget & Cost Analysis Tool
- Break-Even Analysis Calculator
- Financial Modeling
- Income & Viability Analyzer
- Customer Acquisition Cost Calculator
- Unit Economics Calculator
- Revenue Forecasting Tool
- Financial Resilience Evidence

The tools preserve their existing URLs and commercial entitlements while sharing one versioned calculation engine.

## Forecast model

The model produces monthly base, downside and upside scenarios for 36 months. Each month calculates:

- revenue;
- cost of goods sold from gross margin;
- gross profit;
- recurring operating costs;
- operating contribution;
- one-time setup cost in Month 1;
- net cashflow;
- opening cash;
- closing cash.

Committed funding is deliberately assumed to be available at the start of Month 1. The user interface states this assumption explicitly so users do not model hoped-for or conditional funding as immediately available by accident.

## Scenario outputs

Each scenario records:

- operating break-even month;
- first month with negative cash;
- minimum cash balance;
- additional funding needed to keep cash non-negative;
- Month 36 closing cash;
- total 36-month revenue;
- total 36-month operating contribution.

## Unit economics

The engine calculates:

- LTV:CAC;
- CAC payback using monthly gross profit per customer;
- churn-implied customer lifetime;
- churn-implied LTV.

These are commercial planning metrics only. The platform does not present an LTV:CAC ratio, payback period, margin or runway as a Home Office threshold.

## Assumption evidence

The mathematical model and the evidence supporting its assumptions are deliberately separate. Evidence coverage checks include:

- setup costs;
- payroll;
- pricing/demand;
- gross margin;
- funding;
- marketing/CAC;
- LTV/churn where used.

A mathematically complete model can therefore still be labelled `model_complete_evidence_incomplete` when assumptions are not supported.

## Warnings

The engine explicitly detects:

- base-case funding gaps;
- downside funding gaps;
- setup costs exceeding starting cash plus committed funding;
- missing assumption evidence;
- declared LTV below declared CAC.

Warnings are deterministic consequences of the supplied inputs. They are not AI predictions.

## Boundaries

The model is a pre-tax management cashflow. Unless already reflected in user-supplied assumptions, it does not separately model:

- corporation tax;
- VAT;
- debt interest;
- depreciation;
- detailed working-capital timing;
- financing terms.

It is not audited accounts, tax advice, investment advice or an endorsing-body decision.

## Durable provenance

Every run is persisted with:

- tool ID;
- registry version;
- financial-model version;
- shared case-context revision;
- validated inputs;
- evidence references;
- full structured result;
- SHA-256 result fingerprint;
- immutable lifecycle events.

`validation_state = validated` means that the input schema and deterministic formulas were validated, not that the forecast will occur.
