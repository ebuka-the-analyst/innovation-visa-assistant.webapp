/**
 * Stripe Managed Payments payment evidence checks for a future isolated route.
 *
 * These pure functions MUST receive fresh Stripe API responses looked up by
 * server-owned identifiers after authenticating a signed webhook. They DO NOT
 * validate a signature, change a customer subscription, write any ledger or
 * grant a paid membership. Nothing in production calls these yet.
 *
 * The old UK-only billing and fulfilment route MUST NOT be weakened to use
 * these predicates. The merchant-of-record mode must be stored per order.
 */
import { EXPECTED_GBP_PENCE, type CandidateSku } from "./memberStripeLiveAcceptance";
import { inspectManagedCheckoutAmount } from "./memberManagedPaymentsCheckout";
import { MANAGED_BUYER_TAX_CODES, type ManagedBuyerKind } from "./memberManagedBuyerVariants";

type TrustedManagedOrder = {
  sku:CandidateSku;
  livemode:boolean;
  buyerKind:ManagedBuyerKind;
  taxCode:string;
  productId:string;
  userId:string;
  customerId:string;
  priceId:string;
  checkoutSessionId:string;
  orderId:string;
  subscriptionId?:string;
};
export type ManagedPaymentEvidence = {
  basePence:number;
  taxPence:number;
  grossPence:number;
  currency:"gbp";
  billingCountry:string;
  paymentIntentId:string;
  providerReference:string;
  invoiceId?:string;
  periodStartEpoch?:number;
  periodEndEpoch?:number;
};

export class ManagedPaymentReviewRequired extends Error {
  constructor(message:string){super(message);this.name="ManagedPaymentReviewRequired";}
}
const review=(message:string):never=>{throw new ManagedPaymentReviewRequired(message);};
const providerId=(o:any):string|null=>
  typeof o==="string"?o:typeof o?.id==="string"?o.id:null;
const validMoney=(n:unknown):n is number=>typeof n==="number" && Number.isSafeInteger(n) && n>=0;
const epoch=(v:unknown):v is number=>validMoney(v)&&v>0;
const same=(a:unknown,b:unknown,message:string)=>{
  if(a!==b)review(message);
};
const allowedCountry=(v:unknown):v is string=>
  typeof v==="string" && /^[A-Z]{2}$/.test(v) &&
  !new Set(["CU","IR","KP","RU","SY","CN","XK"]).has(v);

function trusted(order:TrustedManagedOrder):number{
  if(!Object.hasOwn(EXPECTED_GBP_PENCE,order?.sku))review("Unknown IFVA product");
  const expected=EXPECTED_GBP_PENCE[order.sku];
  if(!["individual","business"].includes(order.buyerKind) ||
     order.taxCode!==MANAGED_BUYER_TAX_CODES[order.buyerKind] ||
     !/^prod_[A-Za-z0-9]+$/.test(order.productId))review("Untrusted buyer tax classification");
  if(typeof order.livemode!=="boolean")review("Untrusted Stripe environment");
  if(order.livemode!==order.checkoutSessionId.startsWith("cs_live_"))review("Provider environment mismatch");
  if(!/^price_[A-Za-z0-9]+$/.test(order.priceId) ||
     !/^cus_[A-Za-z0-9]+$/.test(order.customerId) ||
     !/^cs_(live|test)_[A-Za-z0-9_]+$/.test(order.checkoutSessionId) ||
     !/^[a-f0-9-]{36}$/i.test(order.orderId) ||
     typeof order.userId!=="string" || order.userId.length<5)review("Incomplete trusted order");
  return expected;
}
function countryOf(customer:any,checkout:any):string{
  const country=checkout?.customer_details?.address?.country;
  if(!allowedCountry(country)||customer?.deleted===true ||
     customer?.address?.country!==country)review("Incomplete or ineligible Stripe billing location");
  return country;
}
function inspectPriceLine(line:any,order:TrustedManagedOrder,expected:number):void {
  same(line?.quantity,1,"Price line quantity does not match membership");
  same(providerId(line?.price),order.priceId,"Price ID differs from approved membership");
  const p=line?.price;
  same(providerId(p?.product),order.productId,"Checkout price product differs from buyer variant");
  if(!p || p.active!==true || p.currency!=="gbp" ||
     p.unit_amount!==expected)review("Incorrect Stripe catalogue price or currency");
  same(line?.amount_subtotal,expected,"Base price has been discounted or altered");
}
function exactSingleLine(list:any):any {
  if(!Array.isArray(list?.data)||list.data.length!==1||
     list?.has_more===true ||
     (typeof list?.total_count==="number"&&list.total_count!==1)){
    return review("Missing or multiple membership line items");
  }
  return list.data[0];
}
function intentPaid(intent:any,id:string,customerId:string,gross:number,livemode:boolean):void {
  same(intent?.id,id,"Provider payment intent ID mismatch");
  if(intent?.livemode!==livemode || intent?.status!=="succeeded" || intent?.currency!=="gbp" ||
     intent?.amount_received!==gross ||
     providerId(intent?.customer)!==customerId){
    review("Provider did not confirm exact successful collected payment");
  }
}
function originSession(session:any,order:TrustedManagedOrder):void{
  if(session?.livemode!==order.livemode || session?.id!==order.checkoutSessionId ||
     providerId(session?.customer)!==order.customerId ||
     session?.client_reference_id!==order.userId ||
     session?.metadata?.ifvaLiveOrderId!==order.orderId ||
     session?.metadata?.ifvaMerchantMode!=="stripe_managed_payments" ||
     session?.metadata?.ifvaBuyerKind!==order.buyerKind ||
     session?.metadata?.ifvaTaxCode!==order.taxCode ||
     session?.managed_payments?.enabled!==true){
    review("Managed Payments Checkout Session does not match trusted order");
  }
}
/** Review a paid, one-time 90-day pass using a fresh Session and PaymentIntent. */
export function verifyManagedPassEvidence(
 order:TrustedManagedOrder,session:any,checkoutLines:any,intent:any,customer:any,
):ManagedPaymentEvidence {
  const expected=trusted(order);
  if(order.sku!=="founder_pass_90d" || order.subscriptionId)review("Not a one-time managed pass order");
  originSession(session,order);
  if(session.mode!=="payment" || session.payment_status!=="paid" ||
     session.status!=="complete" || providerId(session.subscription)!=null){
    review("One-time pass Checkout is incomplete");
  }
  const line=exactSingleLine(checkoutLines);
  inspectPriceLine(line,order,expected);
  const breakdown=inspectManagedCheckoutAmount(session,expected);
  if(!breakdown.valid || breakdown.grossPence==null || breakdown.taxPence==null)
    review(breakdown.reason);
  const intentId=providerId(session.payment_intent);
  if(!intentId || !/^pi_[A-Za-z0-9_]+$/.test(intentId))
    review("Missing Checkout PaymentIntent");
  intentPaid(intent,intentId,order.customerId,breakdown.grossPence,order.livemode);
  const billingCountry=countryOf(customer,session);
  return {
    basePence:expected,taxPence:breakdown.taxPence,
    grossPence:breakdown.grossPence,currency:"gbp",
    billingCountry,paymentIntentId:intentId,
    providerReference:order.checkoutSessionId,
  };
}

function invoiceSubscriptionId(invoice:any):string|null{
  const legacy=providerId(invoice?.subscription);
  const modern=providerId(invoice?.parent?.subscription_details?.subscription);
  if(legacy&&modern&&legacy!==modern)review("Conflicting invoice subscription references");
  return modern||legacy;
}
function invoicePriceId(line:any):string|null {
  const legacy=providerId(line?.price);
  const modern=providerId(line?.pricing?.price_details?.price);
  if(legacy&&modern&&legacy!==modern)review("Conflicting invoice price references");
  return modern||legacy;
}
function invoiceTaxTotal(invoice:any):number {
  const taxes=invoice?.total_taxes??invoice?.total_tax_amounts;
  if(!Array.isArray(taxes))review("Missing provider invoice tax detail");
  let sum=0;
  for(const item of taxes){
    const amount=item?.amount;
    if(!validMoney(amount))review("Malformed invoice tax entry");
    sum+=amount;
    if(!Number.isSafeInteger(sum))review("Invoice tax sum exceeds supported integer range");
  }
  return sum;
}
/**
 * Validate an automatically collected subscription invoice, including
 * actual tax, real paid InvoicePayment and separately fetched PaymentIntent.
 * Never infer payment from a Checkout redirect, invoice webhook alone, or
 * the customer's browser. Signed-event ordering/idempotency is separate.
 */
export function verifyManagedInvoiceEvidence(
 order:TrustedManagedOrder,invoice:any,paymentIntent:any,
 subscription:any,customer:any,checkout:any,
):ManagedPaymentEvidence {
  const expected=trusted(order);
  if(order.sku==="founder_pass_90d" || !order.subscriptionId)
    review("One-time pass cannot create an automatically renewing invoice");
  originSession(checkout,order);
  same(providerId(checkout.subscription),order.subscriptionId,"Checkout subscription does not match");
  if(checkout.mode!=="subscription" ||
     subscription?.livemode!==order.livemode ||
     subscription?.id!==order.subscriptionId ||
     providerId(subscription?.customer)!==order.customerId ||
     subscription?.metadata?.ifvaLiveOrderId!==order.orderId ||
     subscription?.metadata?.ifvaMerchantMode!=="stripe_managed_payments")
    review("Provider subscription does not match managed membership");
  // For renewals a live subscription may legitimately have an open or past_due
  // state; only the actual paid invoice and its service period are authoritative.
  if(invoice?.livemode!==order.livemode || invoice?.status!=="paid" || invoice?.collection_method!=="charge_automatically" ||
     invoice?.paid_out_of_band===true || invoice?.amount_remaining!==0 ||
     invoice?.currency!=="gbp" || !invoice?.id ||
     providerId(invoice.customer)!==order.customerId ||
     invoiceSubscriptionId(invoice)!==order.subscriptionId)
    review("Provider invoice is not a fully paid recurring membership");
  const line=exactSingleLine(invoice.lines);
  if(providerId(line?.pricing?.price_details?.product)!==order.productId ||
     invoicePriceId(line)!==order.priceId ||
     line?.parent?.invoice_item_details?.proration===true ||
     line?.parent?.subscription_item_details?.proration===true)
    review("Unapproved or prorated invoice line");
  if(!validMoney(invoice.subtotal) || invoice.subtotal!==expected ||
     line.amount!==expected)
    review("Invoice base amount differs from the approved GBP membership price");
  if(invoice.total_discount_amounts?.length)review("Unapproved invoice discount");
  const tax=invoiceTaxTotal(invoice);
  if(!validMoney(invoice.total) || invoice.total!==expected+tax ||
     invoice.amount_paid!==invoice.total)
    review("Provider invoice gross does not reconcile to membership base plus tax");
  const payments=invoice.payments;
  const paid=exactSingleLine(payments);
  const intentId=providerId(paid?.payment?.payment_intent);
  if(paid?.livemode!==order.livemode || paid?.object!=="invoice_payment" ||
     paid?.status!=="paid" ||
     paid?.payment?.type!=="payment_intent" ||
     paid?.currency!=="gbp" ||
     paid?.amount_paid!==invoice.total ||
     providerId(paid?.invoice)!==invoice.id ||
     !/^inpay_[A-Za-z0-9_]+$/.test(paid?.id||"") ||
     !intentId || !/^pi_[A-Za-z0-9_]+$/.test(intentId))
    review("Provider invoice payment is not verified");
  intentPaid(paymentIntent,intentId,order.customerId,invoice.total,order.livemode);
  const from=line?.period?.start,to=line?.period?.end;
  if(!epoch(from)||!epoch(to)||to<=from||
     to-from<25*86400||to-from>35*86400)
    review("Invoice does not cover one valid paid monthly membership period");
  const billingCountry=countryOf(customer,checkout);
  return {
    basePence:expected,taxPence:tax,grossPence:invoice.total,
    currency:"gbp",billingCountry,paymentIntentId:intentId,
    providerReference:order.subscriptionId,invoiceId:invoice.id,
    periodStartEpoch:from,periodEndEpoch:to,
  };
}
