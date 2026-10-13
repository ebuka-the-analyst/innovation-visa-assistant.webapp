import { useQuery } from "@tanstack/react-query";
import { Loader2, Check, ShieldCheck } from "lucide-react";
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
 return <section className="py-10 md:py-16" aria-labelledby="membership-pricing-title"
  data-testid="founder-membership-catalogue">
  <header className="mx-auto mb-9 max-w-3xl text-center">
   <h1 id="membership-pricing-title" className="font-serif text-2xl font-bold md:text-3xl">{data.title}</h1>
   <p className="mt-4 text-muted-foreground">{data.introduction}</p>
  </header>
  <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
   {data.offers.map(offer=><Card key={offer.id} className="flex flex-col p-6" data-testid={`membership-card-${offer.id}`}>
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
     <Button disabled={!data.purchasable} className="w-full"
      onClick={()=>{if(data.purchasable)window.location.assign(`/membership/checkout?sku=${encodeURIComponent(offer.id)}`);}}
      data-testid={`membership-action-${offer.id}`}>
       {offer.ctaText}
     </Button>
     {!data.purchasable && <p className="mt-2 text-center text-xs text-muted-foreground">{data.unavailableLabel}</p>}
    </div>
   </Card>)}
  </div>
  <p className="mx-auto mt-5 max-w-5xl text-center text-sm text-muted-foreground">
   <strong>No VAT charged</strong> on the listed UK memberships. Purchases outside the UK may be subject to different tax rules.
  </p>
  <div className="mx-auto mt-9 flex max-w-5xl items-start gap-3 rounded-xl border bg-muted/30 px-5 py-5">
   <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true"/>
   <div>
    <h3 className="font-semibold">{data.legacyTitle}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{data.legacyNotice}</p>
   </div>
  </div>
  <p className="mx-auto mt-6 max-w-4xl text-center text-sm text-muted-foreground">{data.billingNotice}</p>
 </section>;
}
