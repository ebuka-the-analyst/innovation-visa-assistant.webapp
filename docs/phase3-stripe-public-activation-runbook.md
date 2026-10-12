# IFVA memberships — provider-connected test acceptance and public release gate
Date: 12 October 2026
Status: QA CODE AND DATABASE INTEGRATION TESTED; STRIPE TEST-CREDENTIAL PROVIDER ACCEPTANCE STILL NOT RUN. Not a production release approval.

## Current offering (proposed)
| SKU | Advertised price GBP | Period | Allowance |
| --- | ---: | --- | --- |
| founder | £69 | Monthly recurring | 2 generations + 15 revisions per paid period |
| founder_pro | £119 | Monthly recurring | 4 generations + 30 revisions per paid period |
| founder_pass_90d | £159 | One-time, 90 days | 2 generations + 15 revisions per 30-day window; maximum 6 plans |

Do not publish prices or claim tax treatment until the UK consumer/VAT review is completed.

## Work implemented
- Isolated provider-connected Stripe **test-mode only** Checkout/webhook gateway at `server/phase3/memberStripeProviderTestRoutes.ts`.
- All test routes are absent unless ALL of the following match:
  - `IFVA_MEMBER_STRIPE_QA_ENABLED=true`
  - `RAILWAY_PROJECT_NAME=IFVA Phase 2 Isolated QA`
  - `RAILWAY_ENVIRONMENT_NAME=staging`
  - `NODE_ENV=production`
- Gateway reads independent `sk_test_` and `whsec_` secrets. No production Stripe client or Stripe price is ever used.
- `server/phase3/memberEntitlementFulfilmentQa.ts` now applies fully verified, non-duplicate activate/suspend/expire decisions to the **QA** `member_ai_entitlements` and `users` tables. This callback runs inside the signed-event ledger transaction so the event audit, paid window, quota basis and user status either ALL commit or ALL roll back.
- `tests/phase3-qa-entitlement-fulfilment.integration.test.ts` exercises genuine disposable PostgreSQL transactions, concurrent signed retries, founder/founder-pro recurring invoices, pass expiry, cancellation, renewal failure, user status and refusal to overwrite legacy plans. It is not a real Stripe payment test.
- Only `migrations/qa/20261012_member_stripe_test_ledger.sql` supplies event/order tables. This SQL is **not** included in the application's automatic production migration directory.
- `POST /api/member-stripe-test/checkout` (authenticated) selects server-owned price ID, validates GBP, price, type and monthly interval before creating a Stripe-hosted Checkout session. The client cannot submit an amount or a Stripe price ID. A server-created order UUID is embedded in test checkout/subscription metadata.
- A transactional per-founder checkout reservation (`server/phase3/memberStripeCheckoutReservationQa.ts`) locks the account before a payable Stripe session is returned. It rejects legacy paid accounts and concurrent/new recent checkouts for the same customer; the provider session must bind to its existing order once. `tests/phase3-qa-entitlement-fulfilment.integration.test.ts` exercises five simultaneous reservations and legacy checkout refusal.
- Stripe Basil subscription-line prorations and invoice-item prorations are both rejected for automatic access; those cases need price/term reconciliation rather than a silent full-period quota grant.
- `POST /api/member-stripe-test/webhook` verifies the exact raw-byte signature. First subscription invoices can be reconciled against a freshly fetched Stripe subscription with matching server order ID, customer and price. In isolated QA only, accepted events atomically update both the QA order ledger and **QA account entitlements/user state**. This code path is never mounted in the production project.
- `GET /api/member-stripe-test/order/:orderId` requires authentication and strict ownership, and reads effective access bounded by the paid-through timestamp. No account membership changes.
- Duplicate event IDs are blocked with a unique key and row lock, already-paid passes cannot be extended by a second success event, and cancelled memberships cannot be restored using older or same-second events.
- Added durable `member_stripe_test_reviews` and `member_stripe_test_unmatched_events` tables in the QA-only migration. A review-producing business-rule conflict is handled with a PostgreSQL savepoint: simulated access and entitlement changes are rolled back but the signed event is audited, queued for admin review and acknowledged. While a review is unresolved, future paid invoices cannot silently reactivate the order. Unmatched signed events are audited with retry counts and are returned to Stripe for retry.
- Only signed-in QA administrators may read `GET /api/member-stripe-test/reviews`; it includes pending order-linked reviews and unmatched signed provider events. No manual review endpoint can grant paid access.
- `server/phase3/stripeChargeReconciliationQa.ts` requires a freshly fetched Stripe TEST Charge for refund/dispute correlation. Disputes that lack a customer in their event body can be mapped through a verified Charge ID and PaymentIntent; incomplete attribution remains a **manual review**. Full refunds may suspend only matching known paid orders; partial refunds are reviewed, not automatically upgraded or denied.
- **Known coverage gap:** for a recurring subscription, the QA order presently does not track every invoice's PaymentIntent. Refunds/disputes against later monthly invoices can remain unmatched despite valid provider signatures. Full invoice-payment-to-charge reconciliation must be implemented and proved with real Stripe TEST responses before launch.

## Information required from the Stripe test account (never place secrets in GitHub text)
Provision THREE distinct **test-mode** Stripe prices and dedicated TEST-mode API/webhook credentials:
- `IFVA_MEMBER_STRIPE_TEST_SECRET_KEY` (sk_test_...)
- `IFVA_MEMBER_STRIPE_TEST_WEBHOOK_SECRET` (whsec_...)
- `IFVA_MEMBER_STRIPE_TEST_FOUNDER_PRICE_ID` (GBP 6900 pence, recurring monthly)
- `IFVA_MEMBER_STRIPE_TEST_PRO_PRICE_ID` (GBP 11900 pence, recurring monthly)
- `IFVA_MEMBER_STRIPE_TEST_PASS_PRICE_ID` (GBP 15900 pence, one-time)
- `IFVA_MEMBER_STRIPE_TEST_PUBLIC_URL` (https://<isolated-railway-qa-host>.up.railway.app)
- `IFVA_MEMBER_STRIPE_QA_ENABLED=true` only in clean QA.

Provision an isolated PostgreSQL instance, baseline application schema and the QA test-ledger SQL before enabling the test gateway. No access to existing production customers or data. The provider's test webhook URL is:
`https://<isolated-railway-qa-host>.up.railway.app/api/member-stripe-test/webhook`.
Use test cards only. Invalid webhook signatures and events from `livemode:true` must not succeed.

## Mandatory test cases before even considering public activation
1. Real Stripe test Checkout for all three SKUs, with exact matching server-owned price, tax presentation and destination.
2. Provider-signed first paid invoice; no subscription entitlement from checkout alone.
3. Provider-signed recurring paid invoice and separate period advancement.
4. Failed renewal without removing access to a previous fully paid period.
5. Cancellation effective now and at end of term, duplicate and out-of-order events.
6. Full and partial refunds, disputes, upgrades/downgrades, retries and manual reconciliation.
7. One-time pass 90-day expiry with no auto-renewal; six-plan lifetime cap.
8. Atomic changes to the real account/entitlement columns are **implemented only for fictional QA customers**, with a disabled QA-only gateway and database tests. Production lifecycle adapter, replay reconciliation/alerting and independently confirmed provider state must pass before public release.
9. Confirm existing paid customers and their credits remain unchanged.
10. Production-origin signature/price-mode mismatch checks and non-public feature flag, then staged readiness plus rollback review.

## Financial/regulatory sign-off
- Provider's actual invoice and metered inference spend, **including revisions**, converted with documented FX and tax basis. Previous $4.62083 is an estimated one-plan software rate, NOT billed all-in cost or a cap.
- Confirm whether £69/£119/£159 are VAT-inclusive and whether tax logic varies by customer's location. Do not take orders until the final displayed total, invoices and customer documents agree. Relevant HMRC sources: https://www.gov.uk/how-vat-works and https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers
- Clearly disclose automatic renewal, cancellation and refund rights; no endorsement or visa-outcome guarantees. Current government consultation on subscription contracts: https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/outcome/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version
- Substantiate original 13-section business-plan market/legal claims against dated primary sources; original fictional benchmark contains no traceable source URLs.

**Do not merge PR #116 or activate public SKUs based on test success alone.**
