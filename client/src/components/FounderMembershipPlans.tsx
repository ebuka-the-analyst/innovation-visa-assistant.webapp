import FounderMembershipCheckout from "./FounderMembershipCheckout";
import {useState} from "react";
import MyFounderMembership from "./MyFounderMembership";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Check, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { founderMembershipCardAction, FOUNDER_SKU_NAMES, type VerifiedMembershipSnapshot, type MembershipCheckState } from "@/lib/founderMembershipCardAction";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MembershipOffer={
 id:"founder"|"founder_pro"|"founder_pass_90d";
 name:string;description:string;pricePence:number;currency:"GBP";
 billingKind:"monthly"|"one_time";billingLabel:string;
 benefits:string[];ctaText:string;sortOrder:number;
};
type OfferCatalogue={
 revision:number;title:string;introduction:string;
 legacyTitle:string;legacyNotice:string;billingNotice:string;
 unavailableLabel:string;purchasable:boolean;offers:MembershipOffer[];
};
function isCatalogue(value:unknown):value is OfferCatalogue {
 if(!value||typeof value!=="object")return false;
 const x=value as Partial<OfferCatalogue>;
 return typeof x.title==="string" && typeof x.introduction==="string" &&
  Array.isArray(x.offers) && x.offers.length===3 &&
  x.offers.every(o=>typeof o.name==="string"&&Number.isSafeInteger(o.pricePence)&&
    o.pricePence>0&&o.currency==="GBP"&&Array.isArray(o.benefits)) &&
  typeof x.purchasable==="boolean" && typeof x.legacyNotice==="string";
}
export default function FounderMembershipPlans(){
 const isPricingPage=typeof window!=="undefined"&&window.location.pathname==="/pricing";
 const auth=useAuth();
 // One server-owned, authenticated membership snapshot drives both this
 // catalogue and MyFounderMembership. QueryClient shares the same cache key.
 const membershipQuery=useQuery<{membership:VerifiedMembershipSnapshot|null}>({
  queryKey:["/api/member-stripe-live/my-membership"],
  queryFn:async()=>{
   const response=await fetch("/api/member-stripe-live/my-membership",{
    credentials:"include",cache:"no-store",
   });
   if(!response.ok)throw Error("Could not verify your current membership.");
   const payload:unknown=await response.json();
   if(!payload||typeof payload!=="object"||!("membership" in payload))
    throw Error("Invalid membership status.");
   return payload as {membership:VerifiedMembershipSnapshot|null};
  },
  enabled:auth.isAuthenticated,
  retry:false,
  staleTime:0,
  refetchOnMount:"always",
  refetchOnWindowFocus:true,
 });
 const accountState:MembershipCheckState=auth.isLoading?"checking":
  !auth.isAuthenticated?"guest":
  membershipQuery.isPending||membershipQuery.isFetching?"checking":
  membershipQuery.isError?"error":"ready";
 const activeMembership=accountState==="ready"&&membershipQuery.data?.membership?.active===true
  ?membershipQuery.data.membership:null;
 const [chosenSku,setChosenSku]=useState<MembershipOffer["id"]|null>(()=>{
  if(typeof window==="undefined"||window.location.pathname!=="/pricing")return null;
  const value=new URLSearchParams(window.location.search).get("membership_sku");
  return value==="founder"||value==="founder_pro"||value==="founder_pass_90d"?value:null;
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
 const canPurchase=(sku:MembershipOffer["id"])=>founderMembershipCardAction({
  offerSku:sku,offerCta:"Choose "+FOUNDER_SKU_NAMES[sku],
  cataloguePurchasable:data?.purchasable===true,accountState,
  membership:activeMembership,
 }).canStartCheckout;
 if(isPending)return <div className="flex justify-center py-20" role="status">
  <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading membership pricing"/>
 </div>;
 if(!data)return <p className="py-14 text-center text-sm text-destructive" role="alert">
  {error instanceof Error?error.message:"Membership pricing is temporarily unavailable."}
 </p>;
 return <section className="py-10 md:py-16" aria-labelledby="membership-pricing-title"
  data-testid="founder-membership-catalogue">
  <header className="mx-auto mb-9 max-w-3xl text-center">
   <h1 id="membership-pricing-title" className="font-serif text-2xl font-bold md:text-3xl">{data.title}</h1>
   <p className="mt-4 text-muted-foreground">{data.introduction}</p>
   {activeMembership&&<div role="status" className="mt-5 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
    <p className="inline-flex items-center gap-2 font-semibold text-foreground">
     <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true"/>
     Your {FOUNDER_SKU_NAMES[activeMembership.sku as MembershipOffer["id"]]||"Founder"} membership is active.
    </p>
    <p className="mt-1 text-muted-foreground">
     {activeMembership.source==="admin_grant"
      ? `Administrator-granted access, no charge or automatic renewal${activeMembership.accessThrough ? ` until ${new Date(activeMembership.accessThrough).toLocaleDateString("en-GB")}` : ""}. `
      : activeMembership.paidThrough
        ? `Access through ${new Date(activeMembership.paidThrough).toLocaleDateString("en-GB")}. `
        : ""}
     You do not need to purchase again. To change packages, contact support rather than opening a second checkout.
    </p>
    <a href="#your-founder-membership" className="mt-2 inline-block font-medium underline">Manage your membership</a>
   </div>}
  </header>
  <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
   {data.offers.map(offer=>{
    const action=founderMembershipCardAction({
     offerSku:offer.id,offerCta:offer.ctaText,
     cataloguePurchasable:data.purchasable,accountState,
     membership:activeMembership,
    });
    return <Card key={offer.id} className={`flex flex-col p-6 ${action.current?"border-primary/50 bg-primary/[0.02]":""}`}
     data-testid={`membership-card-${offer.id}`}>
    <h2 className="text-xl font-semibold">{offer.name}</h2>
    <p className="mt-2 min-h-12 text-sm text-muted-foreground">{offer.description}</p>
    <div className="mt-4">
     <span className="text-3xl font-bold">{new Intl.NumberFormat("en-GB",{style:"currency",currency:offer.currency,maximumFractionDigits:0}).format(offer.pricePence/100)}</span>
     <span className="ml-2 text-sm text-muted-foreground">{offer.billingLabel}</span>
    </div>
    <ul className="mt-6 space-y-3">
     {offer.benefits.map((benefit)=><li key={benefit} className="flex items-start gap-2 text-sm">
       <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true"/>
       <span>{benefit}</span>
     </li>)}
    </ul>
    <div className="mt-auto pt-8">
     <Button disabled={action.disabled} variant={action.current?"outline":"default"} className="w-full"
      onClick={()=>{if(!action.canStartCheckout)return;
        if(isPricingPage)setChosenSku(offer.id);
        else window.location.assign(`/pricing?membership_sku=${encodeURIComponent(offer.id)}`);}}
      data-testid={`membership-action-${offer.id}`}>
       {action.current&&<CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true"/>}
       {action.text}
     </Button>
     {action.help==="current"&&<p className="mt-2 text-center text-xs text-muted-foreground">
      {activeMembership?.source==="admin_grant"
        ?"Your administrator-granted access is active. It does not renew automatically."
        :"Your paid membership is already active."}
     </p>}
     {action.help==="change"&&<p className="mt-2 text-center text-xs text-muted-foreground">
      Already subscribed. <Link href="/support" className="underline">Contact support</Link> to discuss changing packages.
     </p>}
     {(action.help==="checking"||action.help==="error")&&<p className="mt-2 text-center text-xs text-muted-foreground" role="status">
      {action.help==="error"?"Refresh to verify your membership before checkout.":"Verifying any existing paid membership…"}
     </p>}
     {action.help==="unavailable"&&<p className="mt-2 text-center text-xs text-muted-foreground">{data.unavailableLabel}</p>}
    </div>
   </Card>})}
  </div>
  {isPricingPage&&<>
   <FounderMembershipCheckout
    offer={chosenSku&&canPurchase(chosenSku)?data.offers.find(o=>o.id===chosenSku)||null:null}
    open={chosenSku!==null&&canPurchase(chosenSku)}
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
