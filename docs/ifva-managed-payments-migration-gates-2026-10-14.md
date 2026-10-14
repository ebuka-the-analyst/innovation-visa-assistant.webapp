# IFVA Managed Payments migration safety gates — 14 October 2026

**Status:** NOT LIVE. Do not merge the draft PR on the assumption that
choosing “Prebuilt checkout” in Stripe Dashboard completes the integration.

## Verified facts

- Account `IFV-Assistant`, registered UK company `STACKRISE LTD`.
- Stripe products Founder, Founder Pro, and 90-Day Founder Pass are now assigned
  `txcd_10105002` (AIaaS, cloud based, business use); the Stripe onboarding page
  labels all three *Eligible* by product tax code.
- The merchant must verify whether buyers are businesses versus individual consumers.
  “Business use” must not be selected merely because customers are planning a business.
- Stripe Managed Payments has an add-on transaction fee and uses Stripe/Link
  as merchant of record for qualifying digital SaaS transactions.
- Founder Pro VIP support is **only prioritised product-help routing** for
  technical issues, account access and billing; the seller explicitly confirms
  that it excludes personal business-plan reviews, visa consultations,
  immigration/legal advice and personalised endorsement coaching.
- Stripe's Managed Payments criteria exclude professional services, including
  standalone paid technical support. **Confirm with Stripe** that this
  incidental priority-help benefit within automated AI SaaS is eligible,
  even though the product tax codes show "Eligible".
- Stripe may add location-based tax above displayed GBP list prices; avoid
  implying those prices are universally tax-inclusive.

## Integration changes required *before* Managed Payments checkout can be opened

1. **Explicit separate release mode** persisted per order. Current production
   `IFVA_MEMBER_UK_ONLY_ENABLED`, tax-basis checks, signed webhook and
   Stripe price/identity verification are UK-only. Do not replace or weaken
   these checks globally, including existing UK-only orders.
2. **Checkout creation:** when the new merchant-of-record mode is separately
   approved, create with `managed_payments: {enabled:true}` and Stripe API
   version >= `2025-03-31.basil`.
   Remove `automatic_tax`, `shipping_address_collection`,
   `customer_update`, and all other managed-payments-incompatible
   parameters. Keep the server-owned price, verified buyer and consent.
3. **Tax-inclusive/converted charge reconciliation:** existing
   `memberStripeLiveAcceptance.ts` and
   `stripeLivePaidInvoiceMapping.ts` require
   `amount_total === expectedPence` and
   `amount_paid === expectedPence`. That will reject real legitimate
   tax-charged Managed Payments orders. Validate the authenticated purchase,
   product, price, base amount, tax, paid total, currency, completed
   PaymentIntent and receipt/InvoicePayment without simply removing
   amount-integrity protections.
4. **Addresses and currency:** remove the UK-only *shipping* requirement for
   *managed* purchases only; record and independently verify allowed billing
   countries/customer country under Stripe's restricted territory rules.
   Test localized Checkout and presentment-vs-integration currency carefully.
5. **Live events:** retain signed webhook ledger idempotency and durable paid
   entitlements; test new subscriptions and 90-day passes, renewals,
   async payments, cancellations, refunds, disputes and tax cases.
   Account-wide events from other products must stay isolated.
6. **Staging acceptance:** test using Stripe test-mode credentials on an
   isolated environment and disposable users/database; simulate GB, EU,
   US and other supported locations, tax/no-tax, failed payment, existing
   non-managed subscriptions and duplicate signed events. Test a full
   purchase-to-entitlement-to-expiry flow.
7. **Public release:** explicit fees and legal/product sign-off, consumer terms,
   tested webhook fulfilment, UI tax disclosure, three approved pricing
   packages, all CI green. Only then merge and deploy.

## Sources
- https://docs.stripe.com/payments/managed-payments/update-checkout
- https://docs.stripe.com/payments/managed-payments/eligibility
- https://docs.stripe.com/payments/managed-payments/set-up

**Fail closed**: A Shopify-style payment link is NOT a substitute for the IFVA
transactionally verified checkout, and a category-level Eligible badge does
not mean human support or all countries have been approved.
