import test from "node:test";
import assert from "node:assert/strict";
import {MANAGED_BUYER_TAX_CODES,validateManagedVariantCatalogue,verifyManagedBuyerVariant,
 type ManagedVariantCatalogue} from "../server/phase3/memberManagedBuyerVariants";

const variants:ManagedVariantCatalogue={
 founder:{
  individual:{priceId:"price_indFounder",productId:"prod_indFounder"},
  business:{priceId:"price_bizFounder",productId:"prod_bizFounder"},
 },
 founder_pro:{
  individual:{priceId:"price_indPro",productId:"prod_indPro"},
  business:{priceId:"price_bizPro",productId:"prod_bizPro"},
 },
 founder_pass_90d:{
  individual:{priceId:"price_indPass",productId:"prod_indPass"},
  business:{priceId:"price_bizPass",productId:"prod_bizPass"},
 },
};
test("Six independent Stripe Products preserve the same three public membership SKUs",()=>{
 assert.doesNotThrow(()=>validateManagedVariantCatalogue(variants));
 const prices=new Set<string>(),products=new Set<string>();
 for(const sku of Object.keys(variants) as Array<keyof typeof variants>){
  for(const kind of ["individual","business"] as const){
   prices.add(variants[sku][kind].priceId);
   products.add(variants[sku][kind].productId);
  }
 }
 assert.equal(prices.size,6);assert.equal(products.size,6);
});
test("Forbid reusing a business tax code Product for a personal purchase",()=>{
 const broken={
  ...variants,founder:{...variants.founder,
   individual:{...variants.founder.business}},
 };
 assert.throws(()=>validateManagedVariantCatalogue(broken),/must not share/);
 assert.throws(()=>validateManagedVariantCatalogue({
  ...variants,founder:{individual:variants.founder.individual} as any,
 }),/both required/);
});
test("Verify actual Stripe Product tax code and Price interval, independent of browser claim",()=>{
 for(const sku of ["founder","founder_pro","founder_pass_90d"] as const){
  for(const kind of ["individual","business"] as const){
   const ids=variants[sku][kind],pass=sku==="founder_pass_90d";
   const price={id:ids.priceId,product:ids.productId,active:true,currency:"gbp",
    unit_amount:sku==="founder"?6900:sku==="founder_pro"?11900:15900,
    type:pass?"one_time":"recurring",
    recurring:pass?null:{interval:"month",interval_count:1}};
   const product={id:ids.productId,active:true,tax_code:MANAGED_BUYER_TAX_CODES[kind]};
   const approved=verifyManagedBuyerVariant(variants,sku,kind,price,product);
   assert.equal(approved.buyerKind,kind);
   assert.equal(approved.taxCode,MANAGED_BUYER_TAX_CODES[kind]);
   assert.equal(approved.priceId,ids.priceId);
   assert.throws(()=>verifyManagedBuyerVariant(variants,sku,kind,price,
    {...product,tax_code:MANAGED_BUYER_TAX_CODES[kind==="business"?"individual":"business"]}),/not classified/);
   assert.throws(()=>verifyManagedBuyerVariant(variants,sku,kind,
    {...price,unit_amount:1},product),/Provider price/);
   assert.throws(()=>verifyManagedBuyerVariant(variants,sku,kind,
    {...price,product:"prod_wrong"},product),/Provider price/);
   assert.throws(()=>verifyManagedBuyerVariant(variants,sku,kind,
    {...price,type:pass?"recurring":"one_time"},product),/must/);
  }
 }
});
