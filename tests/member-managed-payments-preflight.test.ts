import test from "node:test";
import assert from "node:assert/strict";
import {
 prepareManagedCheckoutParams,inspectManagedCheckoutAmount,
 IFVA_MANAGED_PAYMENTS_API_MIN,IFVA_MANAGED_PAYMENTS_TAX_CODE,
} from "../server/phase3/memberManagedPaymentsCheckout";
import {readFileSync} from "node:fs";
const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const basic={
 sku:"founder" as const,customerId:"cus_testAbcd123",userId:"test_user_123",
 orderId:"f2dc426c-7fe4-4e23-8d10-091d8333465f",
 priceId:"price_testAbcd123",
 publicUrl:"https://innovatorfoundervisaassistant.co.uk/",
 consumerTermsVersion:"consumer-2026-10-v1",
};
test("managed checkout request is digital-only with separate merchant marker",()=>{
 const req=prepareManagedCheckoutParams(basic) as any;
 assert.equal(req.mode,"subscription");
 assert.deepEqual(req.managed_payments,{enabled:true});
 assert.equal(req.billing_address_collection,"required");
 assert.equal(req.metadata.ifvaMerchantMode,"stripe_managed_payments");
 assert.equal(req.subscription_data.metadata.ifvaMerchantMode,"stripe_managed_payments");
 assert.deepEqual(req.line_items,[{price:basic.priceId,quantity:1}]);
 for(const incompatible of [
  "automatic_tax","shipping_address_collection","shipping_options",
  "customer_update","tax_id_collection","adaptive_pricing",
  "payment_method_types","payment_method_configuration","invoice_creation",
 ]) assert.equal(Object.prototype.hasOwnProperty.call(req,incompatible),false,
    "Managed Payments disallows parameter: "+incompatible);
 assert.equal(IFVA_MANAGED_PAYMENTS_API_MIN,"2025-03-31.basil");
 assert.equal(IFVA_MANAGED_PAYMENTS_TAX_CODE,"txcd_10105002");
});
test("one-time pass uses payment mode and has no subscription data",()=>{
 const req=prepareManagedCheckoutParams({...basic,sku:"founder_pass_90d"}) as any;
 assert.equal(req.mode,"payment");
 assert.equal(req.subscription_data,undefined);
 assert.equal(req.metadata.ifvaMerchantMode,"stripe_managed_payments");
});
test("merchant adapter rejects browser-controlled or untrusted checkout values",()=>{
 for(const params of [
  {...basic,priceId:"sk_live_secret"},
  {...basic,publicUrl:"http://innovatorfoundervisaassistant.co.uk/"},
  {...basic,publicUrl:"https://not-our-domain.example/"},
  {...basic,publicUrl:"https://innovatorfoundervisaassistant.co.uk/evil"},
  {...basic,customerId:"cus_test-evil"},
  {...basic,orderId:"not-an-order"},
  {...basic,sku:"vip_unlimited"},
  {...basic,consumerTermsVersion:""},
 ]) assert.throws(()=>prepareManagedCheckoutParams(params as any));
});
test("preflight recognises valid tax-added Managed Payments amount but never implies paid",()=>{
 const base={currency:"gbp",amount_subtotal:11900,
  amount_total:14280,total_details:{amount_tax:2380,amount_discount:0}};
 assert.deepEqual(inspectManagedCheckoutAmount(base,11900),
  {valid:true,reason:"Base/tax/gross arithmetic consistent (payment unverified)",
   grossPence:14280,taxPence:2380});
 const noTax={...base,amount_total:11900,total_details:{amount_tax:0,amount_discount:0}};
 assert.equal(inspectManagedCheckoutAmount(noTax,11900).valid,true);
 for(const s of [
   {...base,amount_total:14800}, // invented charge
   {...base,amount_subtotal:6900}, // mismatched plan
   {...base,currency:"eur"}, // must reconcile original price separately
   {...base,total_details:{amount_tax:2380,amount_discount:10}},
   {...base,total_details:{amount_discount:0}}, // cannot infer tax
   {...base,amount_total:-1},
 ]) assert.equal(inspectManagedCheckoutAmount(s,11900).valid,false);
});
test("existing live checkout remains UK-only and never switches merchant of record",()=>{
 const live=read("server/phase3/memberStripeLiveRoutes.ts");
 assert.match(live,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
 assert.match(live,/isVerifiedUkMembershipCheckout/);
 assert.doesNotMatch(live,/prepareManagedCheckoutParams\(/);
 assert.match(live,/IFVA_MEMBER_LIVE_TAX_BASIS === "uk_not_vat_registered"/);
});
