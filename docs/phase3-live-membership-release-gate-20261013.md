# IFVA live memberships — technical release gate (13 October 2026)

**State: NO-GO.** The live-membership implementation is code-complete enough for guarded provider/DB integration testing, but has not yet passed live charge settlement or legal/consumer release sign-off. Never enable public checkout from a successful sandbox test alone.

## Routes and irreversible safeguards
- Production-only `/api/member-stripe-live/checkout`, `/api/member-stripe-live/webhook`, `/api/member-stripe-live/order/:orderId`, `/api/member-stripe-live/reviews`.
- Mounts only in canonical Railway project `22a033f9-9732-4499-ae97-b509b17354d9`, environment `3a9754e3-575c-4e29-b9a3-8af50a5ef823`, service `a1aa2612-9af3-481a-8e67-4ddb488c56a0`, `RAILWAY_ENVIRONMENT_NAME=production` and `NODE_ENV=production`.
- All launch gates required: `IFVA_MEMBER_LIVE_ENABLED=true`, `IFVA_MEMBER_LIVE_RELEASE_APPROVED=true`, `IFVA_MEMBER_LIVE_TAX_SIGNOFF=approved`, `IFVA_MEMBER_LIVE_CONSUMER_TERMS_SIGNOFF=approved`, and a published `IFVA_MEMBER_LIVE_TERMS_VERSION` (minimum 6 characters).
- Dedicated **live** Stripe variables only: `IFVA_MEMBER_STRIPE_LIVE_SECRET_KEY`, `IFVA_MEMBER_STRIPE_LIVE_WEBHOOK_SECRET`, `IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID`, `IFVA_MEMBER_STRIPE_LIVE_PRO_PRICE_ID`, `IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID`, `IFVA_MEMBER_STRIPE_LIVE_PUBLIC_URL=https://innovatorfoundervisaassistant.co.uk`. Never use sandbox keys in production or copy the existing expert-booking webhook secret.
- Checkout requires explicit customer opt-in, email verification, exact GBP price confirmation, acknowledgement of live purchase, VAT-inclusive price and current published consumer terms (plus explicit monthly renewal acknowledgement for subscriptions).
- Stripe Checkout collects billing address, enables Stripe automatic tax and uses VAT-inclusive Stripe Price objects. Provider, customer, subscription, paid invoice and successful PaymentIntent IDs are freshly verified against server-owned orders before fulfilment. Event IDs and paid invoice receipts are idempotent and stored transactionally.
- Separate `member_stripe_live_*` tables are introduced by `migrations/app/20261013_member_stripe_live_ledger.sql` (empty new tables, no customer records or entitlements changed).
- `server/scripts/check-live-membership-readiness.cjs` is read-only and fails if activation points to missing/inactive products/prices, wrong account, wrong service, missing event destination or schema.

## Stripe live catalogue — prepared INACTIVE (not for sale)
| SKU | Product | Candidate VAT-inclusive Price | Activation state |
| --- | --- | --- | --- |
| Founder £69/month | prod_VQhiQ5keVnwu3A | price_1UQ2qQK9BSTYpDOqaiT0RJjP | Inactive |
| Founder Pro £119/month | prod_VQhiQio69aYcgS | price_1UQ2qVK9BSTYpDOqCkxK8kGa | Inactive |
| 90-Day Pass £159 once | prod_VQugKlk0f1cak7 | price_1UQ2qmK9BSTYpDOq4FCh1HAg | Inactive |

The older live monthly price objects remain unmodified and have `tax_behavior=unspecified`. Never silently adopt them in the new membership adapter. Don't alter any existing customer subscriptions.

## Evidence obtained
1. Actual isolated Stripe TEST-mode charges and signed webhooks for all three SKUs succeeded; the Founder and Founder Pro subscriptions were activated, and the pass had a single one-time payment.
2. Real QA database audit: immediate Founder cancellation revoked access; end-of-term Founder Pro cancellation retained already-paid access; the partially then fully refunded 90-Day Pass was suspended. One partial-refund manual review remains, zero unmatched events.
3. Signed **live-mode fixture** integration tests run only in disposable GitHub Actions PostgreSQL. They do not send real funds to Stripe.
4. Existing QA gateway and production live code are independently guarded; staging must never mount live routes.

## Remaining blockers before live checkout flag can be set
- [ ] Finalise tax/VAT basis, location-dependent tax registrations, Stripe Tax settings, invoice correctness, marketing price transparency and UK consumer/automatic-renewal/cancellation/refund terms. A human authorised to sign off UK tax/compliance must approve this.
- [ ] Enable only the candidate live Price objects/products after legal sign-off; verify server price IDs and exact checkout amount. No existing subscription migration without express consent.
- [ ] Deploy the signed-live webhook handler safely behind disabled release flags, then configure exactly one new live Stripe webhook endpoint for membership; NEVER modify the existing expert-booking event destination.
- [ ] Run provider-authenticated signed renewal, renewal failure, cancellation and dispute acceptance; verify `member_ai_entitlements`, quota reservations, legacy protection and review handling.
- [ ] Implement customer-facing live plan selection/status/receipt and self-service cancellation/portal policy; test email/confirmation and rollback.
- [ ] Independently run production readonly preflight, resolve security advisories, review DB migration/backups and monitor error/charge/reconciliation metrics.
- [ ] Record explicit release go-ahead after all technical, financial and consumer criteria pass. Until then: `IFVA_MEMBER_LIVE_ENABLED` must not equal `true`.

**Rollback:** Unset live enable flag on canonical service (this removes live API routes on restart); never delete customer ledger, captured invoices or valid paid entitlements. Confirm provider-signed events already in flight are durably preserved and reconciled before any emergency webhook shutdown.
