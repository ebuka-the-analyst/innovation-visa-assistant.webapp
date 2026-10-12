# Founder memberships — production release evidence (12 October 2026)

## Verified Stripe live catalogue (IFV-Assistant)
- Founder: `prod_VQhiQ5keVnwu3A`, `price_1UPqIuK9BSTYpDOqkvIXIREG`, GBP 6900, recurring monthly.
- Founder Pro: `prod_VQhiQio69aYcgS`, `price_1UPqJ3K9BSTYpDOqnxUXHvpS`, GBP 11900, recurring monthly.
- 90-Day Pass: **not created**. The live Stripe creation action was blocked by an automated safety check and was not retried.
- Stripe prices exist but are **not evidence that Checkout, customer entitlements or live webhooks work**. No payment link is advertised.
- Both created prices have `tax_behavior=unspecified`. The inclusive/exclusive VAT position must be approved before enabling checkout.

## Production posture
- Main branch currently deploys a **read-only preview** of proposed new tiers. Existing Basic/Premium/Enterprise/Ultimate purchases and access must not be reset or automatically converted.
- Pricing replacement branch PR #122 is **billing-gated** and is not safe to merge as a chargeable release: `VERIFIED_LIVE_MEMBERSHIP_GATEWAY_IMPLEMENTED=false`.
- Phase 2/3 implementation branch PR #116 has test-only authenticated checkout/webhook and durable QA ledger, but its QA app currently lacks dedicated `IFVA_MEMBER_STRIPE_TEST_SECRET_KEY` and `IFVA_MEMBER_STRIPE_TEST_WEBHOOK_SECRET`. Real provider-paid E2E acceptance has not occurred.
- Existing production `STRIPE_SECRET_KEY` is live-only and must **never** be copied into isolated QA or used as a substitute for `sk_test_` credentials.
- Production webhook signing secret and account-level membership entitlement/reconciliation have not been verified.

## Launch gate
1. Provision dedicated sandbox products/prices and `sk_test_` + `whsec_` in isolated staging only.
2. Complete provider-connected tests for all three offers, renewals, failure, cancellation, refunds/disputes, retries, and paid-to-entitlement transitions.
3. Finalise VAT/price presentation and cancellation/refund/consumer terms.
4. Reconcile pre-existing purchasers using the admin-only aggregate legacy credit audit, resolve exceptions without destructive migration.
5. Complete a separate production live webhook endpoint with signature verification, event idempotency, exact price/customer/order checks, atomic entitlements and queue for unmatched events.
6. Confirm all three live Stripe products and matching price IDs, and verify webhook delivery.
7. Only then merge and deploy the new checkout path, enable the feature flag and run smoke tests with rollback readiness.

**No public billing activation before all gates pass.**
