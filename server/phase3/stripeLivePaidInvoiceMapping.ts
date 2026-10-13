/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * Provider-confirmed Stripe TEST invoice -> InvoicePayment -> PaymentIntent.
 * Pure validation; no client metadata, webhook amount, payment redirect or
 * arbitrary invoice fields can authorise a paid membership.
 *
 * Stripe Basil (2025-03-31+) represents the association in invoice.payments.
 * The QA adapter retrieves the invoice with payments expanded and retrieves
 * the resulting PaymentIntent separately using the isolated sk_live_ key.
 */
import type { PendingCheckout } from "./memberStripeLiveAcceptance";

export type VerifiedPaidInvoicePayment = {
  invoiceId:string;
  invoicePaymentId:string;
  paymentIntentId:string;
  amountPence:number;
  currency:"gbp";
  periodStartEpoch:number;
  periodEndEpoch:number;
};

const id = (x:unknown): string | null =>
  typeof x==="string" ? x :
  x && typeof x==="object" && typeof (x as any).id==="string" ? (x as any).id : null;
const isSeconds = (n:unknown):n is number =>
  typeof n==="number" && Number.isSafeInteger(n) && n > 0;

export class PaidInvoiceMismatch extends Error {
  constructor(message:string){super(message);this.name="PaidInvoiceMismatch";}
}
export function validatePaidInvoicePayment(
  invoice:any, paymentIntent:any, pending:PendingCheckout,
):VerifiedPaidInvoicePayment {
  if (pending.sku==="founder_pass_90d" || !pending.subscriptionId)
    throw new PaidInvoiceMismatch("Only authorised recurring subscriptions can have paid invoices");
  const invoiceSubLegacy=id(invoice?.subscription);
  const invoiceSubModern=id(invoice?.parent?.subscription_details?.subscription);
  const subscription=invoiceSubModern||invoiceSubLegacy;
  if((invoiceSubModern&&invoiceSubLegacy&&invoiceSubModern!==invoiceSubLegacy) ||
      subscription!==pending.subscriptionId)
    throw new PaidInvoiceMismatch("Invoice subscription is not the trusted order subscription");
  if(!/^in_[a-zA-Z0-9_]+$/.test(invoice?.id||"") ||
      invoice?.livemode!==true || invoice?.status!=="paid" ||
      invoice?.collection_method!=="charge_automatically" ||
      invoice?.paid_out_of_band===true || invoice?.currency!=="gbp" ||
      invoice?.amount_paid!==pending.expectedPence || invoice?.amount_remaining!==0 ||
      id(invoice?.customer)!==pending.customerId)
    throw new PaidInvoiceMismatch("Invoice is not exactly the paid GBP subscription");
  const payments=invoice?.payments;
  if (!Array.isArray(payments?.data) || payments?.data.length!==1 ||
      payments?.has_more===true ||
      (typeof payments.total_count==="number" && payments.total_count!==1))
    throw new PaidInvoiceMismatch("Incomplete or multiple invoice payments require manual reconciliation");
  const paid=payments.data[0];
  const paymentIntentId=id(paid?.payment?.payment_intent);
  if(paid?.object!=="invoice_payment" || paid?.livemode!==true ||
      paid?.status!=="paid" || paid?.payment?.type!=="payment_intent" ||
      paid?.currency!=="gbp" || paid?.amount_paid!==pending.expectedPence ||
      id(paid?.invoice)!==invoice.id ||
      !/^inpay_[a-zA-Z0-9_]+$/.test(paid?.id||"") ||
      !paymentIntentId || !/^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId))
    throw new PaidInvoiceMismatch("No single provider-paid invoice PaymentIntent");
  if(paymentIntent?.id!==paymentIntentId || paymentIntent?.livemode!==true ||
      paymentIntent?.status!=="succeeded" || paymentIntent?.currency!=="gbp" ||
      paymentIntent?.amount_received!==pending.expectedPence ||
      id(paymentIntent?.customer)!==pending.customerId)
    throw new PaidInvoiceMismatch("PaymentIntent not independently confirmed as paid");
  const lines=invoice?.lines;
  if(!Array.isArray(lines?.data)||lines.data.length!==1 ||
      lines?.has_more===true ||
      (typeof lines.total_count==="number"&&lines.total_count!==1))
    throw new PaidInvoiceMismatch("Incomplete or prorated invoice line items");
  const line=lines.data[0];
  const priceLegacy=id(line?.price),priceModern=id(line?.pricing?.price_details?.price);
  if((priceLegacy && priceModern && priceLegacy!==priceModern) ||
      (priceModern||priceLegacy)!==pending.priceId ||
      line?.parent?.invoice_item_details?.proration===true ||
      line?.parent?.subscription_item_details?.proration===true)
    throw new PaidInvoiceMismatch("Untrusted or prorated invoice membership price");
  const start=line?.period?.start,end=line?.period?.end;
  if(!isSeconds(start)||!isSeconds(end)||end<=start||
      end-start<25*86400||end-start>35*86400)
    throw new PaidInvoiceMismatch("Invalid paid monthly service period");
  return {
    invoiceId:invoice.id,invoicePaymentId:paid.id,paymentIntentId,
    amountPence:pending.expectedPence,currency:"gbp",
    periodStartEpoch:start,periodEndEpoch:end,
  };
}
