import FounderMembershipCheckout from "./FounderMembershipCheckout";
import { useState } from "react";
import MyFounderMembership from "./MyFounderMembership";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Check } from "lucide-react";
import "@/styles/ifvaMembershipPricing.css";

type Sku = "founder" | "founder_pro" | "founder_pass_90d";
type MembershipOffer = {
 id:Sku; name:string; description:string; pricePence:number; currency:"GBP";
 billingKind:"monthly"|"one_time"; billingLabel:string; benefits:string[];
 ctaText:string; sortOrder:number; tag:string; headline:string;
 bestFor:string; buttonNote:string;
};
type OfferCatalogue = {
 revision:number; title:string; introduction:string;
 legacyTitle:string; legacyNotice:string; billingNotice:string;
 unavailableLabel:string; purchasable:boolean; offers:MembershipOffer[];
};
function isCatalogue(value:unknown):value is OfferCatalogue {
 if(!value || typeof value!=="object")return false;
 const x=value as Partial<OfferCatalogue>;
 return typeof x.title==="string" && Array.isArray(x.offers) &&
  x.offers.length===3 && new Set(x.offers.map(o=>o.id)).size===3 &&
  x.offers.every(o=>["founder","founder_pro","founder_pass_90d"].includes(o.id) &&
   typeof o.name==="string" && Number.isSafeInteger(o.pricePence) &&
   o.pricePence>0 && o.currency==="GBP" && Array.isArray(o.benefits) &&
   o.benefits.length>=7 && o.benefits.every(b=>typeof b==="string") &&
   typeof o.tag==="string" && typeof o.headline==="string" &&
   typeof o.bestFor==="string" && typeof o.buttonNote==="string") &&
  typeof x.purchasable==="boolean" && typeof x.legacyNotice==="string";
}
export default function FounderMembershipPlans() {
 const isPricingPage=typeof window!=="undefined" && window.location.pathname==="/pricing";
 const [chosenSku,setChosenSku]=useState<Sku|null>(()=>{
  if(typeof window==="undefined" || window.location.pathname!=="/pricing")return null;
  const value=new URLSearchParams(window.location.search).get("membership_sku");
  return value==="founder" || value==="founder_pro" || value==="founder_pass_90d" ? value : null;
 });
 const {data,error,isPending}=useQuery({
  queryKey:["/api/member-offers"],
  queryFn:async()=>{
   const response=await fetch("/api/member-offers",{cache:"no-store",credentials:"include"});
   if(!response.ok)throw Error("Membership pricing is temporarily unavailable.");
   const body:unknown=await response.json();
   if(!isCatalogue(body))throw Error("Membership pricing is temporarily unavailable.");
   return body;
  },retry:1,staleTime:30_000,
 });
 if(isPending)return <div className="flex justify-center py-20" role="status">
  <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading membership pricing"/>
 </div>;
 if(!data)return <p className="py-14 text-center text-sm text-destructive" role="alert">
  {error instanceof Error?error.message:"Membership pricing is temporarily unavailable."}
 </p>;
 function choose(offer:MembershipOffer){
  if(!data?.purchasable)return;
  if(isPricingPage)setChosenSku(offer.id);
  else window.location.assign(`/pricing?membership_sku=${encodeURIComponent(offer.id)}`);
 }
 return <section className="ifva-memberships" aria-labelledby="membership-pricing-title"
  data-testid="founder-membership-catalogue">
  <header className="ifva-intro">
   <p className="ifva-eyebrow">Simple, transparent memberships</p>
   <h1 id="membership-pricing-title">Build your business case<br className="hidden sm:block"/> with confidence.</h1>
   <p>From your first business idea to advanced preparation, choose the AI-powered tools and support that match your goals.</p>
  </header>
  <div className="ifva-cards">
   {data.offers.map(offer=><article key={offer.id}
     className={`ifva-card ${offer.id==="founder_pro"?"is-pro":""}`}
     data-testid={`membership-card-${offer.id}`}>
    {offer.id==="founder_pro" && <span className="ifva-featured">★ Recommended</span>}
    <span className="ifva-tag">{offer.tag}</span>
    <h2 className="ifva-plan-name">{offer.name}</h2>
    <div className="ifva-price">
     <span className="ifva-amount">{new Intl.NumberFormat("en-GB",{
      style:"currency",currency:offer.currency,maximumFractionDigits:0,
     }).format(offer.pricePence/100)}</span>
     <span className="ifva-period" aria-label={offer.billingLabel}>{offer.billingKind==="monthly"?"/month":"one-time"}</span>
    </div>
    <p className="ifva-promise">{offer.headline}</p>
    <p className="ifva-description">{offer.description}</p>
    <div className="ifva-rule" aria-hidden="true"/>
    <p className="ifva-included">What's included</p>
    <ul className="ifva-benefits">
     {offer.benefits.map(benefit=><li key={benefit}>
      <span className="ifva-check"><Check size={13} strokeWidth={2.5} aria-hidden="true"/></span>
      <span>{benefit}</span>
     </li>)}
    </ul>
    <div className="ifva-grow"/>
    <p className="ifva-best">{offer.bestFor}</p>
    <button type="button" disabled={!data.purchasable}
     onClick={()=>{if(isPricingPage)setChosenSku(offer.id);else choose(offer);}}
     className={`ifva-select ${offer.id==="founder_pro"?"is-primary":""}`}
     data-testid={`membership-action-${offer.id}`}>
     {offer.ctaText} <span aria-hidden="true">→</span>
    </button>
    <p className="ifva-under">{data.purchasable?offer.buttonNote:data.unavailableLabel}</p>
   </article>)}
  </div>
  <p className="ifva-footer">These AI-powered tools support business preparation and do not provide regulated legal or immigration advice. Purchasing a membership does not guarantee endorsement or a visa.</p>
  <p className="ifva-bottom">Your idea has potential. <span>Give it a stronger plan.</span></p>
  {isPricingPage&&<>
   <FounderMembershipCheckout
    offer={data.purchasable?data.offers.find(o=>o.id===chosenSku)||null:null}
    open={data.purchasable&&chosenSku!==null}
    onOpenChange={open=>{
     if(open)return;
     setChosenSku(null);
     const url=new URL(window.location.href);
     url.searchParams.delete("membership_sku");
     window.history.replaceState(null,"",url.pathname+url.search+url.hash);
    }}/>
   <MyFounderMembership/>
  </>}
 </section>;
}
