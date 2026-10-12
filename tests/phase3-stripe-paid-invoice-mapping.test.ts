import assert from "node:assert/strict";
import test from "node:test";
import { validatePaidInvoicePayment, PaidInvoiceMismatch } from "../server/phase3/stripePaidInvoiceMappingQa";
import type { PendingCheckout } from "../server/phase3/memberStripeAcceptance";

const PERIOD=1800000000;
const order:PendingCheckout={
  userId:"founder_qa",
  sku:"founder",customerId:"cus_qa_111",
  checkoutSessionId:"cs_test_qa_111",subscriptionId:"sub_qa_111",
  priceId:"price_qa_111",expectedPence:6900,currency:"gbp",
};
const paidInvoice=()=>({
  id:"in_qa_111",livemode:false,status:"paid",
  collection_method:"charge_automatically",amount_paid:6900,
  amount_remaining:0,customer:order.customerId,currency:"gbp",
  parent:{subscription_details:{subscription:order.subscriptionId}},
  payments:{data:[{
    id:"inpay_qa_111",object:"invoice_payment",livemode:false,
    invoice:"in_qa_111",amount_paid:6900,currency:"gbp",status:"paid",
    payment:{type:"payment_intent",payment_intent:"pi_qa_111"},
  }],has_more:false,total_count:1},
  lines:{data:[{
    pricing:{price_details:{price:order.priceId}},
    period:{start:PERIOD,end:PERIOD+30*86400},
  }],has_more:false,total_count:1},
});
const paidIntent=()=>({
  id:"pi_qa_111",livemode:false,status:"succeeded",
  amount_received:6900,currency:"gbp",customer:order.customerId,
});
test("Basil InvoicePayment links exactly one settled invoice to its Stripe TEST PaymentIntent",()=>{
  const match=validatePaidInvoicePayment(paidInvoice(),paidIntent(),order);
  assert.deepEqual(match,{
    invoiceId:"in_qa_111",invoicePaymentId:"inpay_qa_111",
    paymentIntentId:"pi_qa_111",amountPence:6900,currency:"gbp",
    periodStartEpoch:PERIOD,periodEndEpoch:PERIOD+30*86400,
  });
});
test("invoice multiple payments, partial payments, truncated pages, out-of-band payments fail closed",()=>{
  const base=paidInvoice(),intent=paidIntent();
  const cases=[
    {...base,payments:{...base.payments,has_more:true}},
    {...base,payments:{...base.payments,total_count:2}},
    {...base,payments:{...base.payments,data:[]}},
    {...base,payments:{...base.payments,data:[base.payments.data[0],base.payments.data[0]]}},
    {...base,payments:{...base.payments,data:[{...base.payments.data[0],status:"open"}]}},
    {...base,payments:{...base.payments,data:[{...base.payments.data[0],amount_paid:100}]}},
    {...base,payments:{...base.payments,data:[{...base.payments.data[0],invoice:"in_different"}]}},
    {...base,payments:{...base.payments,data:[{...base.payments.data[0],payment:{type:"charge",charge:"ch_qa_111"}}]}},
    {...base,status:"open"}, {...base,collection_method:"send_invoice"},
    {...base,amount_paid:100},{...base,amount_remaining:100},
    {...base,livemode:true},{...base,currency:"usd"},
    {...base,paid_out_of_band:true},
  ];
  for(const changed of cases)assert.throws(()=>validatePaidInvoicePayment(changed,intent,order),PaidInvoiceMismatch);
});
test("payment intent independently validates customer, settled amount and actual provider status",()=>{
  for(const changed of [
    {status:"requires_payment_method"},
    {amount_received:100}, {customer:"cus_other"}, {livemode:true},
    {currency:"usd"},{id:"pi_fake"},
  ])assert.throws(()=>validatePaidInvoicePayment(paidInvoice(),{...paidIntent(),...changed},order),PaidInvoiceMismatch);
});
test("conflicting invoice, subscription, period and price cannot create mapping",()=>{
  const base=paidInvoice(),intent=paidIntent();
  for(const changed of [
    {subscription:"sub_fake"},
    {subscription:"sub_fake",parent:base.parent},
    {customer:"cus_another"},
    {lines:{...base.lines,has_more:true}},
    {lines:{...base.lines,total_count:2}},
    {lines:{data:[{...base.lines.data[0],price:{id:"price_other"}}]}},
    {lines:{data:[{...base.lines.data[0],parent:{subscription_item_details:{proration:true}}}]}},
    {lines:{data:[{...base.lines.data[0],period:{start:PERIOD,end:PERIOD+1}}]}},
  ])assert.throws(()=>validatePaidInvoicePayment({...base,...changed},intent,order),PaidInvoiceMismatch);
});
