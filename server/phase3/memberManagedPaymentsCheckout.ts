/**
 * Preparation-only adapter for Stripe Managed Payments (merchant of record).
 *
 * NEVER invoke from the live membership routes until the independent
 * address, entitlement, refund and invoice reconciliation is released.
 * The UK-only checkout flow remains deliberately unchanged.
 */
import type Stripe from "stripe";
import { EXPECTED_GBP_PENCE, type CandidateSku } from "./memberStripeLiveAcceptance";
import { MANAGED_BUYER_TAX_CODES, type ManagedBuyerKind, type VerifiedManagedVariant } from "./memberManagedBuyerVariants";

export const IFVA_MANAGED_PAYMENTS_API_MIN = "2025-03-31.basil";

type TrustedManagedCheckout = {
  sku: CandidateSku;
  customerId: string;
  userId: string;
  orderId: string;
  // This must be returned by verifyManagedBuyerVariant after fresh Stripe lookups.
  verifiedVariant: VerifiedManagedVariant;
  buyerKind: ManagedBuyerKind;
  publicUrl: string;
  consumerTermsVersion: string;
};

function requireTrustedText(value: string, name: string, pattern: RegExp): void {
  if (typeof value !== "string" || !pattern.test(value))
    throw Error("Invalid trusted Managed Payments " + name);
}

/** Build from authenticated server-side order values only; no buyer-supplied price. */
export function prepareManagedCheckoutParams(
  input: TrustedManagedCheckout,
): Stripe.Checkout.SessionCreateParams {
  if (!(input.sku in EXPECTED_GBP_PENCE))
    throw Error("Unapproved membership SKU");
  requireTrustedText(input.customerId, "customer", /^cus_[a-zA-Z0-9]+$/);
  if (!["individual","business"].includes(input.buyerKind) ||
      !input.verifiedVariant || input.verifiedVariant.sku!==input.sku ||
      input.verifiedVariant.buyerKind!==input.buyerKind ||
      input.verifiedVariant.taxCode!==MANAGED_BUYER_TAX_CODES[input.buyerKind] ||
      input.verifiedVariant.expectedPence!==EXPECTED_GBP_PENCE[input.sku] ||
      !/^prod_[A-Za-z0-9]+$/.test(input.verifiedVariant.productId))
    throw Error("Managed Payments buyer product was not verified for this membership");
  requireTrustedText(input.verifiedVariant.priceId, "price", /^price_[a-zA-Z0-9]+$/);
  requireTrustedText(input.userId, "user", /^[A-Za-z0-9_-]{5,128}$/);
  requireTrustedText(input.orderId, "order", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  requireTrustedText(input.consumerTermsVersion, "terms", /^[a-zA-Z0-9_.-]{6,120}$/);
  const url = new URL(input.publicUrl);
  if (url.protocol !== "https:" || url.hostname !== "innovatorfoundervisaassistant.co.uk" ||
      url.pathname !== "/" || url.username || url.password || url.hash || url.search)
    throw Error("Unauthorised Managed Payments return URL");
  const isSubscription=input.sku!=="founder_pass_90d";
  const metadata={
    ifvaMembershipLive:"true",
    ifvaLiveOrderId:input.orderId,
    consumerTermsVersion:input.consumerTermsVersion,
    ifvaBuyerKind:input.buyerKind,
    ifvaTaxCode:input.verifiedVariant.taxCode,
    ifvaMerchantMode:"stripe_managed_payments",
  };
  // The current Stripe SDK typings may lag the Managed Payments API. The
  // payload is intentionally cast at the boundary; unsupported parameters
  // are expressly omitted for both subscriptions and one-time payments.
  return {
    mode:isSubscription?"subscription":"payment",
    customer:input.customerId,
    client_reference_id:input.userId,
    line_items:[{price:input.verifiedVariant.priceId,quantity:1}],
    billing_address_collection:"required",
    managed_payments:{enabled:true},
    success_url:url.origin+"/pricing?membership_order="+encodeURIComponent(input.orderId)+"&payment=return",
    cancel_url:url.origin+"/pricing?membership_order="+encodeURIComponent(input.orderId)+"&payment=cancelled",
    metadata,
    ...(isSubscription?{
      subscription_data:{metadata:{
        ifvaMembershipLive:"true",ifvaLiveOrderId:input.orderId,
        ifvaBuyerKind:input.buyerKind,
        ifvaMerchantMode:"stripe_managed_payments",
      }},
    }:{}),
  } as unknown as Stripe.Checkout.SessionCreateParams;
}

/**
 * Preliminary amount reconciliation for Stripe-returned GBP Checkout Sessions.
 * This is NOT a payment verification, nor permission to grant an entitlement.
 *
 * Any discount, unexpected fee, missing tax breakdown, changed currency or
 * unverified price must go to manual review, never be treated as proof of
 * purchase. Full signed-webhook, provider and invoice cross-checks are
 * mandatory before deployment.
 */
export function inspectManagedCheckoutAmount(
  session: unknown, expectedPence: number,
): {valid:boolean;reason:string;grossPence?:number;taxPence?:number} {
  if (!session || typeof session!=="object")return {valid:false,reason:"Missing Stripe Checkout object"};
  const s=session as Record<string,any>;
  const amount=s.amount_total;
  const subtotal=s.amount_subtotal;
  const tax=s.total_details?.amount_tax;
  const discount=s.total_details?.amount_discount;
  const isInt=(n:unknown):n is number=>typeof n==="number"&&Number.isSafeInteger(n)&&n>=0;
  if(!isInt(expectedPence)||expectedPence<100)
    return {valid:false,reason:"Invalid catalogue price"};
  if(s.currency!=="gbp" || !isInt(amount)||!isInt(subtotal)||!isInt(tax)||!isInt(discount))
    return {valid:false,reason:"Unsupported currency or absent amount breakdown"};
  if(subtotal!==expectedPence || discount!==0)
    return {valid:false,reason:"Unapproved base amount or discount"};
  if(amount!==subtotal+tax)
    return {valid:false,reason:"Charged amount differs from base plus tax"};
  return {valid:true,reason:"Base/tax/gross arithmetic consistent (payment unverified)",
    grossPence:amount,taxPence:tax};
}
