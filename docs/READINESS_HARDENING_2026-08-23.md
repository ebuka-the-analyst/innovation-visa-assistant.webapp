# Readiness hardening — 23 August 2026

This release makes application readiness an evidence-backed server decision rather than a browser-derived percentage.

## Required milestone policy

The ten required milestones are evaluated as follows:

1. Questionnaire — completed account-owned generated business plan.
2. Innovation Score — fresh completed durable tool run with saved result payload and fingerprint.
3. Eligibility Validator — fresh durable tool run whose saved result positively confirms eligibility.
4. Business Plan — completed account-owned business plan.
5. Financial Projections — complete structured financial evidence in the completed plan or a fresh durable tool run.
6. Endorser Comparison — explicit account-owner confirmation.
7. Pitch Coach — fresh completed durable tool run with saved result payload and fingerprint.
8. Document Organiser — every required document requirement satisfied by uploaded or accepted generated evidence.
9. Final Document Review — at least one completed document review.
10. Compliance Check — fresh completed durable tool run with saved result payload and fingerprint.

Browser-only and legacy account-synced completion may preserve progress but cannot independently mark a required milestone complete. Stale durable evidence is retained and labelled for revalidation.

## Freshness

Compliance Checker uses a 90-day readiness window. Core diagnostic and preparation tool runs use 180-day windows unless otherwise documented. Optional Cover Letter runs use 365 days. The active readiness ruleset is versioned in API responses and audit details.

## Architecture

Business-plan reconciliation and status are centralised in `server/businessPlanStatus.cjs`. Progress Tracker and questionnaire draft modules expose explicit registration functions and are registered at the existing post-authentication `/api/pricing` boundary. They no longer patch `express.application` themselves.

## Runtime

The package declares Node 22.x for production and CI readiness workflows use Node 22.
