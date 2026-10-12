# IFVA Founder Memberships — Phase 3 payment acceptance and commercial gate

**Review date:** 12 October 2026  
**Status:** TEST-ONLY POLICY AND PERSISTENT ACCEPTANCE HARNESS IMPLEMENTED — CI PENDING; NO CUSTOMER BILLING ACTIVATED.

## 1. Current verified state

- [Staging E2E acceptance run #38189371467](https://github.com/ebuka-the-analyst/innovation-visa-assistant.webapp/actions/runs/38189371467) passed a real, isolated application login, 401/404/400 authorisation checks, signed-in PDF and Word responses. Temporary Railway staging application and database were deleted after testing.
- The 13-section fictional **GPT-6 Astra Founder Pro Benchmark #2** generated 129 original PDF pages (subsequently 131 pages when six-column financial tables were corrected), with **16,748 input tokens**, **89,067 output tokens**, and **$4.62083 estimated standard-rate model costs** (not the paid provider invoice). Its pre-run estimated worst-case token reservation was **$10.832**. No model rerun occurred for this release gate.
- **Source provenance blocker:** the complete generated fictional Markdown contains **zero HTTP source URLs and zero DOI references**. Endorsing-body claims should link to current GOV.UK guidance and each material numerical market claim should have a dated reliable primary source. The long document is not independently substantiated.

## 2. Proposed UK consumer SKUs — not live

| SKU | Advertised price | Billing | Generations | Revisions |
|---|---:|---|---|---|
| Founder | £69 | monthly recurring | 2 per successfully paid month | 15 per paid month |
| Founder Pro | £119 | monthly recurring | 4 per successfully paid month | 30 per paid month |
| 90-Day Pass | £159 | one-time 90 days | 2 each 30-day window, 6 maximum | 15 each 30-day window |

*VAT handling, final checkout total, payment processing costs, refunds and other operating costs have not been finalised.*

**Generation-only cost exposure using a single fictional plan, USD:**

| SKU | Maximum generations | At observed $4.62083 each | At $10.832 reserved max each |
|---|---:|---:|---:|
| Founder (per month) | 2 | $9.24166 | $21.664 |
| Founder Pro (per month) | 4 | $18.48332 | $43.328 |
| 90-Day Pass (full term) | 6 | $27.72498 | $64.992 |

These are *illustrations only*: they do **not** count up to 15–30 paid revisions per month, higher-context usage, currency conversion, caching, token-pricing changes, Stripe fees, support, hosting, marketing, tax or verification labour. Do not infer gross margin or affordability without those figures. Never describe the software-side spend estimate as a hard OpenAI invoice cap.

## 3. Safely testable Stripe event contract (implemented as offline acceptance-only)

Source: `server/phase3/memberStripeAcceptance.ts`, exercised by `tests/phase3-member-stripe-acceptance.test.ts`.

- Real Stripe webhook activation is **not** implemented. The acceptance logic has no database access, no network calls and is **not wired** into production routes. It uses locally constructed, cryptographically signed mock `Stripe.Event` objects.
- Test checkout event is rejected unless it matches a *server-owned purchase order* including user, Stripe customer, checkout session, SKU, price, GBP currency, expected pence and corresponding PaymentIntent.
- A new paid **subscription must not activate from checkout alone**. It requires a paid, non-out-of-band matching subscription invoice and a defensible paid period. A failed invoice must not grant quotas or prematurely erase already-paid access.
- The 90-Day Pass activates only from a matching paid one-time checkout; its 90-day expiry is explicit.
- Duplicate webhook event IDs and older out-of-order paid events cannot double-grant or revive an expired account in the simulated event ledger.
- Full refund or dispute produces a suspension decision only when the payment reference is verified. Partial refunds or proration invoices need manual policy/reconciliation; they are **not** silently converted into access.
- Explicit live-mode events are rejected by the **test-only policy**. It must never be used as the sole validator of production events.
- Production will require Stripe `constructEvent` on the exact raw HTTP bytes, a dedicated test secret during staging, an immutable matching price-ID registry, an atomic event ledger, source subscription/invoice reconciliation, retries, cancellation and refund policy, data privacy and customer communications.

See [Stripe events](https://docs.stripe.com/api/events) and [Stripe's subscription guidance](https://docs.stripe.com/billing/subscriptions/webhooks).

### 3A. Additional isolated PostgreSQL acceptance harness (12 October 2026)

- Added `migrations/app/20261012_member_stripe_test_ledger.sql`, `server/phase3/durableStripeTestLedger.ts` and `tests/phase3-durable-stripe-test-ledger.integration.test.ts`.
- Stores **test-only** Stripe purchase orders and webhook decisions with a unique event-ID audit table. It uses a row lock and a database transaction so concurrent test deliveries cannot grant access twice. Authenticated signature verification is required **before** querying the database, and live-mode events are rejected.
- CI rehearses simultaneous duplicates, tampering, wrong customer, old invoices after cancellation, failed renewal, 90-day expiration, migration replay and rollback.
- Only the **simulated test-order paid flag** is changed. No real customer access is granted, no Stripe API call is made, no checkout route is enabled, and no production migrations have run.
- This is preparatory evidence **not** proof of a real Stripe test-mode checkout, a production entitlement grant, an actual subscription renewal or safe payment settlement.

## 4. Hard blockers before public checkout

1. A live application connector with dedicated **Stripe TEST MODE** checkout product/price IDs, a signed webhook endpoint, test payment methods and canonical Stripe invoice/subscription reconciliation. The current `server/stripeClient.ts` explicitly enforces LIVE keys; do not weaken it globally or copy real payment credentials.
2. Production-grade PostgreSQL event idempotency and atomic **actual customer entitlement fulfilment**. An isolated test-only persistent event audit and replay-order tests now exist, but have never been connected to real payments or customer membership rows.
3. Test card flows for successful initial subscription, recurring renewal, failed payment, account recovery, immediate and end-of-term cancellation, full/partial refund, dispute, webhook retry, duplicate/out-of-order events, downgrade and upgrade.
4. Verify legacy credits and subscribers do not change when introducing new SKUs. Automatic quota reset must be tied to confirmed paid periods. Fixed-duration passes must expire without renewal.
5. Final VAT and UK consumer terms review; receipt/terms/cancellation/refund handling, provider invoice cost reconciliation, FX and all-in economics, including paid revisions.
6. Independent source audit of every material business-plan market and regulation assertion (fictional test output is not evidence of real client suitability).
7. User's explicit approval to merge and deploy application PR #116, and **separate** explicit consent to publish actual Stripe prices and begin charging customers.

## 5. What is confirmed complete

- **Staging real login/PDF/Word access**: PASSED, isolated Railway resources removed.
- **Database quota/migration simulation**: PASSED in disposable PostgreSQL CI.
- **Signed offline webhook decision simulation**: PASSED prior CI.
- **Durable test-only PostgreSQL event ledger**: IMPLEMENTED; new CI integration verification pending.
- **Real Stripe test-mode payment and recurring fulfilment**: **NOT RUN**.
- **Invoice-verified economics and full external source audit**: **NOT DONE**.
- **Production SKU release**: **NOT AUTHORISED**.

**Release posture:** keep PR #116 draft and the three proposed new billing SKUs inactive. Do not copy production data or payment credentials. No new Stripe charge or paid AI request was made for this acceptance plan.
