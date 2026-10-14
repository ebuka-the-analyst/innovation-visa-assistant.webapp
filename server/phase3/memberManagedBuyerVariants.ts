/**
 * FUTURE, OFFLINE-ONLY Managed Payments B2C/B2B product catalogue.
 *
 * Stripe explicitly recommends distinct Products (with their own tax codes)
 * when identical SaaS software is sold for personal and business use.
 *
 * One public IFVA pricing card per SKU, but six Stripe product/price variants.
 * The buyer chooses how they are purchasing; the server must choose the
 * provider Product and Price from its OWN trusted catalogue and retrieve both
 * from Stripe before checkout. Never trust buyer-supplied product/price IDs,
 * business status, or tax IDs. No live routes currently call this module.
 */
import { EXPECTED_GBP_PENCE, type CandidateSku } from "./memberStripeLiveAcceptance";

export type ManagedBuyerKind = "individual" | "business";
export const MANAGED_BUYER_TAX_CODES: Readonly<Record<ManagedBuyerKind,string>> = {
  individual: "txcd_10105001", // AIaaS - Cloud Based - Personal Use
  business: "txcd_10105002", // AIaaS - Cloud Based - Business Use
};
export type ManagedVariantIdentifiers = {priceId:string;productId:string};
export type ManagedVariantCatalogue = Readonly<
  Record<CandidateSku, Readonly<Record<ManagedBuyerKind,ManagedVariantIdentifiers>>>
>;

export type VerifiedManagedVariant = {
  sku:CandidateSku;
  buyerKind:ManagedBuyerKind;
  productId:string;
  priceId:string;
  taxCode:string;
  expectedPence:number;
};

export class ManagedVariantConfigurationError extends Error {
 constructor(reason:string){super(reason);this.name="ManagedVariantConfigurationError";}
}
const reject=(message:string):never=>{throw new ManagedVariantConfigurationError(message);};
const skuIds:CandidateSku[]=["founder","founder_pro","founder_pass_90d"];
const buyers:ManagedBuyerKind[]=["individual","business"];
const isId=(s:unknown,prefix:string):s is string=>
 typeof s==="string"&&new RegExp("^"+prefix+"_[A-Za-z0-9]+$").test(s);
const id=(value:any):string|null=>
 typeof value==="string"?value:typeof value?.id==="string"?value.id:null;

/** Do not allow one business-coded Price to silently serve a consumer. */
export function validateManagedVariantCatalogue(
  catalogue:ManagedVariantCatalogue,
):void {
  if(!catalogue||typeof catalogue!=="object")reject("Missing separately configured Stripe buyer catalogue");
  const products=new Set<string>(),prices=new Set<string>();
  if(Object.keys(catalogue).length!==skuIds.length)
    reject("Only the three approved membership SKUs may be configured");
  for(const sku of skuIds){
    const variants=catalogue[sku];
    if(!variants||Object.keys(variants).length!==2)
      reject("Personal and business variants are both required for every SKU");
    for(const buyer of buyers){
      const v=variants[buyer];
      if(!v||!isId(v.priceId,"price")||!isId(v.productId,"prod"))
        reject("Each buyer variant needs a dedicated Stripe Product and Price");
      if(products.has(v.productId)||prices.has(v.priceId))
        reject("Personal and business tax variants must not share a Stripe Product/Price");
      products.add(v.productId);prices.add(v.priceId);
    }
  }
}

/**
 * Retrieve these provider objects directly from Stripe using the configured
 * IDs; the type below is only a minimal view of the verified objects.
 * The returned variant is evidence about the catalogue, NOT about payment.
 */
export function verifyManagedBuyerVariant(
  catalogue:ManagedVariantCatalogue,
  sku:CandidateSku,
  buyerKind:ManagedBuyerKind,
  providerPrice:any,
  providerProduct:any,
):VerifiedManagedVariant {
  validateManagedVariantCatalogue(catalogue);
  if(!skuIds.includes(sku)||!buyers.includes(buyerKind))
    reject("Unrecognised buyer or membership SKU");
  const variant=catalogue[sku][buyerKind];
  if(providerPrice?.id!==variant.priceId ||
     id(providerPrice?.product)!==variant.productId ||
     providerPrice.active!==true ||
     providerPrice.currency!=="gbp" ||
     providerPrice.unit_amount!==EXPECTED_GBP_PENCE[sku])
    reject("Provider price is not the configured GBP membership variant");
  if(providerProduct?.id!==variant.productId ||
     providerProduct?.active!==true ||
     providerProduct?.tax_code!==MANAGED_BUYER_TAX_CODES[buyerKind])
    reject("Provider product is not classified for the declared buyer kind");
  const recurring=sku!=="founder_pass_90d";
  if(recurring){
    if(providerPrice?.type!=="recurring" ||
      providerPrice?.recurring?.interval!=="month" ||
      providerPrice?.recurring?.interval_count!==1)
      reject("Monthly membership must use an exact monthly Stripe Price");
  }else if(providerPrice?.type!=="one_time")
    reject("90-Day Pass must have a one-time Stripe Price");
  return {sku,buyerKind,productId:variant.productId,
    priceId:variant.priceId,taxCode:MANAGED_BUYER_TAX_CODES[buyerKind],
    expectedPence:EXPECTED_GBP_PENCE[sku]};
}
