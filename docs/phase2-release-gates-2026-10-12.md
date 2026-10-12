# Phase 2 Premium AI — customer download & staging release gate
**Review date:** 12 October 2026. **Status:** NOT RELEASE READY. Draft PR #116, not merged.

## 1. Verified automated checks
- `/api/download/pdf/:planId`, `/api/view/pdf/:planId`, `/api/download/word/:planId` use `isAuthenticated` and the same `guardedBusinessPlanDownload` ownership/completion gate. The PDF endpoints remain owner-only; Word retains its existing, explicit admin-read policy.
- Ephemeral Express/HTTP tests send requests as two different fictional users, a simulated admin and an unauthenticated caller. They verify 401, 404, 400 and 500 conditions, plus actual PDF and DOCX bytes, headers, PDF page counts and six-column Word financial rows. **This tests the exact shared production access guard with a representative renderer, not a whole-application Railway login flow.**
- Existing `Phase 2 Membership Quota Integration` creates a disposable PostgreSQL instance for schema, concurrency, rollback and quota tests. This is **not production data**.
- The 13-section GPT-6 Astra fictional Benchmark #2 was completed once at ~US$4.62 estimated model spend. Its full offline PDF and Word renders have been checked, including four six-column financial tables; prior quality review noted 131 substantial PDF pages, 85 Word pages, and recurring financial baseline figures. Offline preview is NOT the authenticated production Word endpoint.

## 2. Official UK route facts independently reviewed
Official sources, checked on 12 October 2026:
- [Appendix Innovator Founder](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder), last updated 3 August 2026. This establishes the founder's real management role, new-business plan contribution, innovation/viability/scalability, and **at least two contact point meetings**; a business plan alone is not an endorsement or visa.
- [GOV.UK approved endorsing bodies](https://www.gov.uk/government/publications/endorsing-bodies-innovator-founder-and-scale-up-visas/innovator-founder-and-scale-up-visas-endorsing-bodies), updated 7 August 2026. Listed business endorsers include UK Endorsing Services, Innovator International and Envestors; GEP requires an invitation. Legacy endorsers are generally restricted to earlier applications and cannot simply issue new initial endorsements.
- [Innovator Founder eligibility](https://www.gov.uk/innovator-founder-visa/eligibility) and [required documents](https://www.gov.uk/innovator-founder-visa/documents-youll-need-to-apply): endorsement and personal requirements need independent assessment; funds/English/document rules vary with the applicant's situation.
- [Endorsing-body guidance](https://www.gov.uk/government/publications/scale-up-and-innovator-founder-visa-endorsing-bodies-guidance/innovator-founder-and-scale-up-visas-guidance-for-endorsing-bodies-accessible) explains assessment considerations for evidence of innovation and a feasible, scalable business.
The fictional plan mentions Envestors and Innovator International without giving URLs. New editorial diagnostics warn when UK immigration, endorsement or legal claims lack an official-source link. **A URL appearing in a plan is not independent verification that its claim is true.** The founder still needs to verify each claim and document against the current source.

## 3. Unresolved editorial/financial issues
- Original market statistics, academic references, sector comparisons, legal/regulatory positions, customer interviews, IP and supplier assertions are not independently verified. Supporting evidence must be dated, attributable, reproducible and permissioned.
- The fictional company records **three consecutive annual operating losses** (Year 1 -£31,950; Year 2 -£34,900; Year 3 -£35,700), total -£102,550. Reconciled arithmetic does not establish viability or sufficient available funding. Require opening cash, funding commitments, monthly working-capital/cash-flow timing and runway.
- Repetition across 129+ pages requires editorial judgement; page quantity and automated headings/formatting checks do not certify endorsement readiness.

## 4. Infrastructure boundary
Railway project `22a033f9-9732-4499-ae97-b509b17354d9` contains production environment `3a9754e3-575c-4e29-b9a3-8af50a5ef823` and **older** environment `2654138f-e437-4df6-9982-678f35fc3dbe`.
- The older environment has **two unapplied staged changes**. It has not been deployed, reset, cloned or used for migrations.
- There is no independently deployed clean staging application+database at present. The connected Railway actions cannot create a separate environment in the existing project. Do **not** copy the production database or environment variables into it.
- Before a future user-authorised billable staging deployment, provision a **new isolated database and staging deployment**, unique hostname and secrets. Validate database identity and zero real customer records before applying migrations. Never point staging `DATABASE_URL` to production. Test role/session cookies, tenant isolation, unfinished plans, PDF/Word responses, API billing disabled and absence of live Stripe keys. Keep a teardown/rollback plan.
- **No Railway staging service or database resources created in this work. No production service changed.**

## 5. Subscriptions and Stripe — Phase 3 blocker
The **proposed, not live** SKUs are Founder £69/month, Founder Pro £119/month and 90-Day Pass £159 one-time. Application quotas and expiry groundwork does NOT equal completed subscription fulfilment.
Stripe's [subscription event reference](https://docs.stripe.com/api/events) documents checkout completion, paid and failed invoices, subscription changes/termination and refunds.
Before activating new paid SKUs:
1. Test signed webhook delivery using **test-mode** keys and an isolated endpoint; validate signatures, event IDs, event ordering, duplicates, replay and safe retries.
2. Grant/renew quotas only from verified paid periods; handle delayed and failed payments, past-due/recovery, cancellations, partial/full refunds, chargebacks and expiration correctly.
3. Check existing customer balances and legacy subscriptions remain unchanged; prove 90-Day Pass generation caps and 30-day rolling window with separate tests.
4. Confirm UK tax/VAT treatment and prices with an accountant; reconcile provider invoices, FX, model retry costs and margins; no optimistic margin guarantees.
5. Perform an actual signed-in end-to-end application test on **isolated staging** before any merge of application PR #116.

## Release verdict
**Engineering isolation checks: PASS when latest PR CI is green.**
**Official UK framework spot-check: DONE; claim-by-claim source verification: NOT DONE.**
**Independent full-app staging route/Stripe test: NOT DONE.**
**PR #116: remains DRAFT.** Requires separate explicit approval to merge and later enable new billing.

No live plan charges, API benchmark reruns, Railway deploys or production schema migrations are authorised by this document.


## 6. Completed live staging acceptance (12 October 2026)
**Update superseding earlier staging-not-tested statements in Sections 4–5:** A separate, private Railway project `IFVA Phase 2 Isolated QA` was created with a dedicated staging PostgreSQL database and a service pinned to reviewed draft PR #116 commit `8b3b4a9c839fb303f9d2126546a81fc5bda428ea`. It did not reference any production database or reuse production session, AI or Stripe keys. Initial deployment exposed a build-only missing-Vite dependency due to `NODE_ENV=production`; corrected by installing dev build dependencies explicitly. The database baseline was bootstrapped **only inside this new project**; schema verification passed.

A short-lived Railway function created two synthetic verified login accounts, one completed fictional Founder Pro business plan and one unfinished plan. The full application was tested remotely from GitHub Actions using authentic Express/Passport sessions and the actual PDF/Word download routes. The ephemeral CI job [38189371467](https://github.com/ebuka-the-analyst/innovation-visa-assistant.webapp/actions/runs/38189371467) **PASSED**:
- `GET /health` → HTTP 200.
- Unauthenticated PDF and Word attempts → HTTP 401.
- Other customer's plan download (PDF/Word) → HTTP 404.
- Owner's unfinished plan → HTTP 400; missing plan → HTTP 404.
- Verified login and signed-in `/api/auth/user` → HTTP 200.
- Owner's real PDF download → HTTP 200, 6,234 valid PDF bytes and 4 physical pages.
- Owner's real PDF browser preview → HTTP 200 and inline PDF header.
- Owner's real DOCX download → HTTP 200, 8,993 valid DOCX bytes.
- **Zero paid AI, Stripe, or production requests during this test.** The larger 129+ page artificial PDF and Word were already reviewed through separate offline generation/CI, **not** these short remote document downloads.

The temporary QA-seeding function was removed. The staging application and PostgreSQL services were deleted after successful verification and the dedicated synthetic database volume was removed. The empty QA project may remain as an organisational shell; no active Railway QA services or database volume were intentionally left running. The short-lived CI workflow and fixture credentials were removed from the branch after their results were preserved in GitHub's workflow history.

**Result:** authenticated customer downloads and isolated database migration have been tested and passed on the full staging application. This supersedes the earlier note that no full-application staging test existed. It does **not** prove payment fulfilment, factual market evidence, or that every customer-generated 129-page DOCX is flawless.

## 7. Outstanding release blockers after successful live staging
1. Claim-by-claim external source verification and legal review of generated immigration/endorsement/business evidence; the fictional model output does not provide sufficient source traceability for customer release.
2. Stripe Phase 3 implementation and **test-mode** verification of actual payment-to-entitlement state transitions. The existing `server/stripeClient.ts` enforces live keys only; never use real Stripe cards, keys or charged payments as a substitute for a separate test harness.
3. Provider-billed OpenAI invoice reconciliation, FX, VAT assessment and package margin review, including repeat generations and revisions.
4. Explicit authorisation and deployment review before moving draft application PR #116 to production. Preserve legacy customer balances and existing paid subscriptions throughout.
