/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * QA ONLY: an explicit new purchase must be requested by a signed-in founder.
 * Passive login, migrations, existing subscriptions, or a plan-page visit
 * can never produce a new Stripe Checkout Session.
 *
 * The server decides SKU, exact price and renewal cadence. Consent flags are
 * deliberately strict booleans, not truthy strings; they are required IN
 * ADDITION TO Stripe's hosted checkout confirmation, not instead of it.
 * Consumer terms and VAT treatment must be approved before any live release.
 */
import { EXPECTED_GBP_PENCE, type CandidateSku } from "./memberStripeLiveAcceptance";

const skus: readonly CandidateSku[] = ["founder","founder_pro","founder_pass_90d"];

export function confirmedNewLiveMembershipPurchase(body: unknown): CandidateSku | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const input=body as Record<string,unknown>;
  const sku=input.sku;
  if (typeof sku!=="string" || !skus.includes(sku as CandidateSku)) return null;
  const chosen=sku as CandidateSku;
  if (input.acknowledgeNewPayment!==true ||
      input.confirmedPricePence!==EXPECTED_GBP_PENCE[chosen]) return null;
  // A recurring price can never be selected unless automatic monthly renewal
  // has been separately acknowledged before the hosted checkout opens.
  if (chosen!=="founder_pass_90d" &&
      input.acknowledgeMonthlyRenewal!==true) return null;
  return chosen;
}
