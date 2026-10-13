/**
 * UK-only live membership payment restrictions.
 * The buyer confirms UK eligibility before Stripe Checkout. Checkout collects a
 * UK-restricted shipping/service address AND a required billing address.
 * Neither browser location, IP address nor a UK shipping address alone proves
 * UK tax residency. Reject paid-entitlement activation if Stripe's verified
 * billing or collection address is not explicitly GB.
 */
type StripeAddress = {country?:string|null}|null|undefined;
type SessionAddress = {
  customer_details?:{address?:StripeAddress}|null;
  shipping_details?:{address?:StripeAddress}|null;
  collected_information?:{shipping_details?:{address?:StripeAddress}|null}|null;
  currency?:string|null;
};

export function isVerifiedUkMembershipCheckout(session:SessionAddress):boolean {
  const billingCountry=session.customer_details?.address?.country;
  const deliveryCountry=session.collected_information?.shipping_details?.address?.country
    ?? session.shipping_details?.address?.country;
  return session.currency==="gbp" && billingCountry==="GB" && deliveryCountry==="GB";
}
