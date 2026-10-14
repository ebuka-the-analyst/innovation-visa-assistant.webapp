import test from "node:test";
import assert from "node:assert/strict";
import {
 prepareManagedCheckoutParams,inspectManagedCheckoutAmount,
 IFVA_MANAGED_PAYMENTS_API_MIN,
} from "../server/phase3/memberManagedPaymentsCheckout";
import {
 MANAGED_BUYER_TAX_CODES,verifyManagedBuyerVariant,type ManagedVariantCatalogue,
} from "../server/phase3/memberManagedBuyerVariants";
import {readFileSync} from "node:fs";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const catalogue:ManagedVariantCatalogue={
 founder:{
  individual:{priceId:"price_personalFounder",productId:"prod_personalFounder"},
  business:{priceId:"price_businessFounder",productId:"prod_businessFounder"},
 },
 founder_pro:{
  individual:{priceId:"price_personalPro",productId:"prod_personalPro"},
  business:{priceId:"price_businessPro",productId:"prod_businessPro"},
 },
 founder_pass_90d:{
  individual:{priceId:"price_personalPass",productId:"prod_personalPass"},
  business:{priceId:"price_businessPass",productId:"prod_businessPass"},
 },
};
const verified=(sku:"founder"|"founder_pro"|"founder_pass_90d",buyerKind:"individual"|"business")=>{
 const row=catalogue[sku][buyerKind];
 const isPass=sku==="founder_pass_90d";
 const amount=sku==="founder"?6900:sku==="founder_pro"?11900:15900;
 return verifyManagedBuyerVariant(catalogue,sku,buyerKind,
  {id:row.priceId,product:row.productId,active:true,currency:"gbp",
   unit_amount:amount,type:isPass?"one_time":"recurring",
   recurring:isPass?null:{interval:"month",interval_count:1}},
  {id:row.productId,active:true,tax_code:MANAGED_BUYER_TAX_CODES[buyerKind]});
};
const basic={
 sku:"founder" as const,customerId:"cus_testAbcd123",userId:"test_user_123",
 orderId:"f2dc426c-7fe4-4e23-8d10-091d8333465f",
 buyerKind:"individual" as const,
 verifiedVariant:verified("founder","individual"),
 publicUrl:"https://innovatorfoundervisaassistant.co.uk/",
 consumerTermsVersion:"consumer-2026-10-v1",
};
test("Managed checkout for personal buyer uses personal AIaaS Product and tax category",()=>{
 const req=prepareManagedCheckoutParams(basic) as any;
 assert.equal(req.mode,"subscription");
 assert.deepEqual(req.managed_payments,{enabled:true});
 assert.equal(req.billing_address_collection,"required");
 assert.equal(req.metadata.ifvaMerchantMode,"stripe_managed_payments");
 assert.equal(req.metadata.ifvaBuyerKind,"individual");
 assert.equal(req.metadata.ifvaTaxCode,"txcd_10105001");
 assert.equal(req.subscription_data.metadata.ifvaBuyerKind,"individual");
 assert.deepEqual(req.line_items,[{price:basic.verifiedVariant.priceId,quantity:1}]);
 for(const incompatible of [
  "automatic_tax","shipping_address_collection","shipping_options",
  "customer_update","tax_id_collection","adaptive_pricing",
  "payment_method_types","payment_method_configuration","invoice_creation",
 ]) assert.equal(Object.prototype.hasOwnProperty.call(req,incompatible),false,
    "Managed Payments disallows parameter: "+incompatible);
 assert.equal(IFVA_MANAGED_PAYMENTS_API_MIN,"2025-03-31.basil");
});
test("Business buyer routes to distinct approved business-use Price, same public fee",()=>{
 const item={...basic,buyerKind:"business" as const,
  verifiedVariant:verified("founder","business")};
 const req=prepareManagedCheckoutParams(item) as any;
 assert.equal(req.metadata.ifvaBuyerKind,"business");
 assert.equal(req.metadata.ifvaTaxCode,"txcd_10105002");
 assert.deepEqual(req.line_items,[{price:"price_businessFounder",quantity:1}]);
 assert.notEqual(req.line_items[0].price,basic.verifiedVariant.priceId);
});
test("One-time pass uses payment mode for both buyers and has no subscription data",()=>{
 for(const buyerKind of ["individual","business"] as const) {
  const req=prepareManagedCheckoutParams({
   ...basic,sku:"founder_pass_90d",buyerKind,
   verifiedVariant:verified("founder_pass_90d",buyerKind),
  }) as any;
  assert.equal(req.mode,"payment");
  assert.equal(req.subscription_data,undefined);
  assert.equal(req.metadata.ifvaBuyerKind,buyerKind);
 }
});
test("Fails closed if declared buyer does not match verified Product and Price",()=>{
 for(const params of [
  {...basic,buyerKind:"business"},
  {...basic,buyerKind:"not_a_business" as any,verifiedVariant:{...basic.verifiedVariant,buyerKind:"not_a_business" as any,taxCode:undefined as any}},
  {...basic,verifiedVariant:{...basic.verifiedVariant,taxCode:"txcd_10105002"}},
  {...basic,verifiedVariant:{...basic.verifiedVariant,expectedPence:11900}},
  {...basic,verifiedVariant:{...basic.verifiedVariant,priceId:"sk_live_secret"}},
  {...basic,verifiedVariant:{...basic.verifiedVariant,productId:"prod-invalid"}},
  {...basic,publicUrl:"http://innovatorfoundervisaassistant.co.uk/"},
  {...basic,publicUrl:"https://not-our-domain.example/"},
  {...basic,publicUrl:"https://innovatorfoundervisaassistant.co.uk/evil"},
  {...basic,customerId:"cus_test-evil"},
  {...basic,orderId:"not-an-order"},
  {...basic,sku:"vip_unlimited"},
  {...basic,consumerTermsVersion:""},
 ]) assert.throws(()=>prepareManagedCheckoutParams(params as any));
});
test("Preflight recognises tax-added total but never calls it a paid invoice",()=>{
 const base={currency:"gbp",amount_subtotal:11900,
  amount_total:14280,total_details:{amount_tax:2380,amount_discount:0}};
 assert.deepEqual(inspectManagedCheckoutAmount(base,11900),
  {valid:true,reason:"Base/tax/gross arithmetic consistent (payment unverified)",
   grossPence:14280,taxPence:2380});
 const noTax={...base,amount_total:11900,total_details:{amount_tax:0,amount_discount:0}};
 assert.equal(inspectManagedCheckoutAmount(noTax,11900).valid,true);
 for(const s of [
   {...base,amount_total:14800},
   {...base,amount_subtotal:6900},
   {...base,currency:"eur"},
   {...base,total_details:{amount_tax:2380,amount_discount:10}},
   {...base,total_details:{amount_discount:0}},
   {...base,amount_total:-1},
 ]) assert.equal(inspectManagedCheckoutAmount(s,11900).valid,false);
});
test("Existing UK-only live billing and webhook remain isolated",()=>{
 const live=read("server/phase3/memberStripeLiveRoutes.ts");
 assert.match(live,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
 assert.match(live,/isVerifiedUkMembershipCheckout/);
 assert.doesNotMatch(live,/prepareManagedCheckoutParams\(/);
 assert.match(live,/IFVA_MEMBER_LIVE_TAX_BASIS === "uk_not_vat_registered"/);
});

test("buyer selection is shown only if the future verified Managed Payments gateway enables it",()=>{
 const ui=read("client/src/components/FounderMembershipCheckout.tsx");
 assert.match(ui,/setManagedBuyerChoiceAvailable\(d\?\.managedBuyerChoiceAvailable===true\)/);
 assert.match(ui,/managedBuyerChoiceAvailable&&<fieldset/);
 assert.match(ui,/buyerKind==="individual"/);
 assert.match(ui,/buyerKind==="business"/);
 assert.match(ui,/managedBuyerChoiceAvailable&&!buyerKind/);
 assert.match(ui,/\.\.\.\(managedBuyerChoiceAvailable \? \{buyerKind\} : \{\}\)/);
 const cards=read("client/src/components/FounderMembershipPlans.tsx");
 assert.match(cards,/data\.offers\.map\(/);
 assert.doesNotMatch(cards,/personalFounder|businessFounder/);
});
