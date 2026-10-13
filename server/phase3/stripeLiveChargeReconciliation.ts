/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * Stripe test-provider charge reconciliation. Signed `charge.refunded`
 * wraps a Charge with a customer; signed `charge.dispute.created` wraps
 * a Dispute which generally has a charge ID but no customer. The latter
 * must be traced back through a fresh Stripe Charge before mapping an
 * order and MUST still enter human review rather than auto-revoking.
 */
export type StripeChargeIdentity = {
  customerId: string;
  paymentIntentId: string;
  chargeId: string;
};
const id = (value:any):string | null =>
  typeof value === "string" ? value : typeof value?.id === "string" ? value.id : null;

export class ProviderChargeMismatch extends Error {
  constructor(reason:string){super(reason);this.name="ProviderChargeMismatch";}
}
export function chargeIdForSignedEvent(
  type:string, signed:any,
): string {
  const chargeId=type==="charge.dispute.created" ? id(signed?.charge)
    : type==="charge.refunded" ? id(signed?.id) : null;
  if (!chargeId || !/^ch_[a-zA-Z0-9_]+$/.test(chargeId)) {
    throw new ProviderChargeMismatch("Missing Stripe Charge reference for refund or dispute");
  }
  return chargeId;
}
export function reconcileSignedChargeToProvider(
  eventType:string, signed:any, provider:any,
):StripeChargeIdentity {
  const expectedId=chargeIdForSignedEvent(eventType,signed);
  const customerId=id(provider?.customer);
  const paymentIntentId=id(provider?.payment_intent);
  if (provider?.id!==expectedId || provider?.livemode!==true ||
      !customerId || !paymentIntentId ||
      provider.currency!=="gbp" || !Number.isSafeInteger(provider.amount) ||
      provider.amount<=0) {
    throw new ProviderChargeMismatch("Fresh test charge is invalid or does not match signed reference");
  }
  if ((id(signed?.customer) && id(signed.customer)!==customerId) ||
      (id(signed?.payment_intent) && id(signed.payment_intent)!==paymentIntentId) ||
      (signed?.currency && signed.currency!==provider.currency) ||
      (signed?.amount && signed.amount!==provider.amount)) {
    throw new ProviderChargeMismatch("Signed provider event and fetched charge disagree");
  }
  if(eventType==="charge.refunded" &&
      (!Number.isSafeInteger(provider.amount_refunded) ||
       provider.amount_refunded<=0 ||
       provider.amount_refunded>provider.amount ||
       (Number.isSafeInteger(signed?.amount_refunded) &&
        provider.amount_refunded<signed.amount_refunded) ||
       (signed?.amount_refunded === signed?.amount && provider.refunded!==true))) {
    throw new ProviderChargeMismatch("Refund not confirmed by fresh test Charge");
  }
  // A partially refunded Charge reports refunded=false. Allow the
  // provider-verified event through so the signed-event policy can queue a
  // manual review; NEVER mistake it for an entirely reversed purchase.
  // Never infer a subscription ID or customer membership from a dispute
  // event alone. The caller must locate ONE trusted Stripe test order.
  return {customerId,paymentIntentId,chargeId:expectedId};
}
