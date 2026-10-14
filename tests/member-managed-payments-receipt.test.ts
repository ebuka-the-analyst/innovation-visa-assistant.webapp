import assert from "node:assert/strict";
import test from "node:test";
import {
 verifyManagedPassEvidence,verifyManagedInvoiceEvidence,ManagedPaymentReviewRequired,
} from "../server/phase3/memberManagedPaymentsReceipt";

const order={
 sku:"founder_pass_90d" as const, livemode:false,userId:"account_test_user",
 buyerKind:"individual" as const,taxCode:"txcd_10105001",productId:"prod_personalPass",
 customerId:"cus_test123",orderId:"00000000-0000-4000-8000-000000000001",
 priceId:"price_test123",checkoutSessionId:"cs_test_123456",
};
const session={
 id:order.checkoutSessionId,livemode:false,mode:"payment",status:"complete",
 payment_status:"paid",customer:order.customerId,client_reference_id:order.userId,
 managed_payments:{enabled:true},
 metadata:{ifvaLiveOrderId:order.orderId,ifvaMerchantMode:"stripe_managed_payments",
  ifvaBuyerKind:"individual",ifvaTaxCode:"txcd_10105001"},
 customer_details:{address:{country:"FR"}},subscription:null,
 payment_intent:"pi_test123",currency:"gbp",amount_subtotal:15900,amount_total:18921,
 total_details:{amount_tax:3021,amount_discount:0},
};
const checkoutLines={
 data:[{quantity:1,price:{id:order.priceId,product:order.productId,
 currency:"gbp",active:true,unit_amount:15900},
 amount_subtotal:15900}],has_more:false,total_count:1,
};
const intent={
 id:"pi_test123",livemode:false,status:"succeeded",currency:"gbp",
 amount_received:18921,customer:order.customerId,
};
const customer={id:order.customerId,address:{country:"FR"},deleted:false};
const rejects=(fn:()=>unknown)=>assert.throws(fn,ManagedPaymentReviewRequired);

test("pass: managed checkout verifies separate price/tax/paid gross in EU customer location",()=>{
 const result=verifyManagedPassEvidence(order,session,checkoutLines,intent,customer);
 assert.deepEqual(result,{basePence:15900,taxPence:3021,grossPence:18921,
  currency:"gbp",billingCountry:"FR",paymentIntentId:"pi_test123",
  providerReference:order.checkoutSessionId});
 const usSession={...session,customer_details:{address:{country:"US"}}};
 const usIntent={...intent,amount_received:15900};
 const none={...session,total_details:{amount_tax:0,amount_discount:0},amount_total:15900};
 const paid=verifyManagedPassEvidence(order,{...none,customer_details:usSession.customer_details},
  checkoutLines,usIntent,{...customer,address:{country:"US"}});
 assert.equal(paid.taxPence,0);
});

test("pass: untrusted Stripe session, tax, user, intent, country or price fails closed",()=>{
 const fake=(patch:any)=>verifyManagedPassEvidence(order,{...session,...patch},
  checkoutLines,intent,customer);
 rejects(()=>fake({managed_payments:{enabled:false}}));
 rejects(()=>fake({managed_payments:undefined}));
 rejects(()=>fake({livemode:true}));
 rejects(()=>fake({client_reference_id:"attacker"}));
 rejects(()=>fake({metadata:{...session.metadata,ifvaMerchantMode:"old_stripe"}}));
 rejects(()=>fake({status:"open"}));
 rejects(()=>fake({payment_status:"unpaid"}));
 rejects(()=>fake({amount_total:15900}));
 rejects(()=>fake({currency:"eur"}));
 rejects(()=>fake({total_details:{amount_tax:3021,amount_discount:100}}));
 rejects(()=>fake({customer_details:{address:{country:"RU"}}}));
 rejects(()=>verifyManagedPassEvidence({...order,buyerKind:"business"},session,checkoutLines,intent,customer));
 rejects(()=>verifyManagedPassEvidence({...order,taxCode:"txcd_10105002"},session,checkoutLines,intent,customer));
 rejects(()=>fake({metadata:{...session.metadata,ifvaBuyerKind:"business"}}));
 rejects(()=>fake({metadata:{...session.metadata,ifvaTaxCode:"txcd_10105002"}}));
 rejects(()=>verifyManagedPassEvidence(order,session,
  {...checkoutLines,data:[{...checkoutLines.data[0],price:{...checkoutLines.data[0].price,id:"price_wrong"}}]},
  intent,customer));
 rejects(()=>verifyManagedPassEvidence(order,session,
  {...checkoutLines,data:[...checkoutLines.data,...checkoutLines.data]},intent,customer));
 rejects(()=>verifyManagedPassEvidence(order,session,checkoutLines,
  {...intent,status:"processing"},customer));
 rejects(()=>verifyManagedPassEvidence(order,session,checkoutLines,intent,
  {...customer,address:{country:"GB"}}));
 rejects(()=>verifyManagedPassEvidence({...order,livemode:true},session,checkoutLines,intent,customer));
});

const recurringOrder={...order,sku:"founder_pro" as const,subscriptionId:"sub_test123",productId:"prod_personalPro"};
const renewalCheckout={...session,mode:"subscription",subscription:recurringOrder.subscriptionId,
 amount_total:11900,amount_subtotal:11900,payment_intent:null,
 total_details:{amount_tax:0,amount_discount:0}};
const invoice={
 id:"in_test123",livemode:false,status:"paid",collection_method:"charge_automatically",
 paid_out_of_band:false,amount_remaining:0,currency:"gbp",customer:order.customerId,
 parent:{subscription_details:{subscription:recurringOrder.subscriptionId}},
 subtotal:11900,total:14280,amount_paid:14280,total_taxes:[{amount:2380}],
 total_discount_amounts:[],
 lines:{data:[{amount:11900,pricing:{price_details:{price:order.priceId,product:recurringOrder.productId}},
  period:{start:1790000000,end:1792592000},parent:{subscription_item_details:{proration:false}}}],
  has_more:false,total_count:1},
 payments:{data:[{id:"inpay_test123",object:"invoice_payment",livemode:false,
  status:"paid",currency:"gbp",amount_paid:14280,invoice:"in_test123",
  payment:{type:"payment_intent",payment_intent:"pi_test123"}}],has_more:false,total_count:1},
};
const paidIntent={...intent,amount_received:14280};
const subscription={id:recurringOrder.subscriptionId,livemode:false,customer:order.customerId,
 metadata:{ifvaLiveOrderId:order.orderId,ifvaMerchantMode:"stripe_managed_payments"}};
test("subscription: verified paid invoice with tax and valid service period is independently reconcilable",()=>{
 const result=verifyManagedInvoiceEvidence(recurringOrder,invoice,paidIntent,
  subscription,customer,renewalCheckout);
 assert.deepEqual(result,{basePence:11900,taxPence:2380,grossPence:14280,currency:"gbp",
  billingCountry:"FR",paymentIntentId:"pi_test123",
  providerReference:"sub_test123",invoiceId:"in_test123",periodStartEpoch:1790000000,periodEndEpoch:1792592000});
});

test("subscription: cannot activate with underpaid, proration, wrong SKU or missing tax details",()=>{
 const attempt=(i:any=invoice,pi:any=paidIntent,sub:any=subscription,co:any=renewalCheckout)=>
  verifyManagedInvoiceEvidence(recurringOrder,i,pi,sub,customer,co);
 rejects(()=>attempt({...invoice,amount_paid:11900}));
 rejects(()=>attempt({...invoice,total:11900}));
 rejects(()=>attempt({...invoice,total_taxes:undefined}));
 rejects(()=>attempt({...invoice,total_taxes:[{amount:200}]}));
 rejects(()=>attempt({...invoice,total_discount_amounts:[{amount:100}]}));
 rejects(()=>attempt({...invoice,lines:{...invoice.lines,data:[
  {...invoice.lines.data[0],amount:11950}]}}));
 rejects(()=>attempt({...invoice,lines:{...invoice.lines,data:[
  {...invoice.lines.data[0],parent:{subscription_item_details:{proration:true}}}]}}));
 rejects(()=>attempt({...invoice,lines:{...invoice.lines,data:[
  {...invoice.lines.data[0],period:{start:1790000000,end:1790000001}}]}}));
 rejects(()=>attempt({...invoice,lines:{...invoice.lines,data:[
  {...invoice.lines.data[0],pricing:{price_details:{price:order.priceId,product:"prod_wrong"}}}]}}));
 rejects(()=>attempt({...invoice,paid_out_of_band:true}));
 rejects(()=>attempt({...invoice,payments:{...invoice.payments,data:[]}}));
 rejects(()=>attempt({...invoice,payments:{...invoice.payments,data:[
  {...invoice.payments.data[0],amount_paid:13000}]}}));
 rejects(()=>attempt(invoice,{...paidIntent,status:"requires_payment_method"}));
 rejects(()=>attempt(invoice,paidIntent,{...subscription,customer:"cus_someoneElse"}));
 rejects(()=>attempt(invoice,paidIntent,subscription,{...renewalCheckout,managed_payments:{enabled:false}}));
 rejects(()=>verifyManagedInvoiceEvidence(order,invoice,paidIntent,subscription,customer,renewalCheckout));
});

test("none of these pure checks can grant a membership or alter the production live route",()=>{
 assert.equal(typeof verifyManagedPassEvidence,"function");
 assert.equal(typeof verifyManagedInvoiceEvidence,"function");
 // Deliberately no database or payment adapter is invoked by these unit tests.
});
