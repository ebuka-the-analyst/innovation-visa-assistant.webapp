import FounderMembershipPaymentReturn from "./FounderMembershipPaymentReturn";
import {useEffect,useState} from "react";
import {Link} from "wouter";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

type Sku="founder"|"founder_pro"|"founder_pass_90d";
export type SelectedFounderOffer={
 id:Sku;
 name:string;
 pricePence:number;
 currency:"GBP";
 billingKind:"monthly"|"one_time";
 billingLabel:string;
};

type Props={offer:SelectedFounderOffer|null;open:boolean;onOpenChange:(open:boolean)=>void};
/**
 * ONE plan selector lives in FounderMembershipPlans. Its card opens this small
 * payment-confirmation dialog, never a second plan/pricing grid.
 * The dialog preserves explicit payment, terms and recurring consent.
 */
export default function FounderMembershipCheckout({offer,open,onOpenChange}:Props){
 const [available,setAvailable]=useState(false);
 const [termsVersion,setTermsVersion]=useState<string|null>(null);
 // Off until an independently approved merchant-of-record gateway advertises support.
 const [managedBuyerChoiceAvailable,setManagedBuyerChoiceAvailable]=useState(false);
 const [buyerKind,setBuyerKind]=useState<"individual"|"business"|null>(null);
 const [busy,setBusy]=useState(false);
 const [acknowledge,setAcknowledge]=useState(false);
 const [renew,setRenew]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  if(!open)return;
  setAcknowledge(false);setRenew(false);setBusy(false);setMessage("");
  setManagedBuyerChoiceAvailable(false);setBuyerKind(null);
  let mounted=true;
  fetch("/api/member-stripe-live/availability",{credentials:"include",cache:"no-store"})
   .then(r=>r.ok?r.json():null).then(d=>{
    if(mounted){setAvailable(d?.available===true);setTermsVersion(typeof d?.termsVersion==="string"?d.termsVersion:null);
     setManagedBuyerChoiceAvailable(d?.managedBuyerChoiceAvailable===true);}
   }).catch(()=>{if(mounted)setAvailable(false);});
  return ()=>{mounted=false};
 },[open,offer?.id]);
 async function buy(){
  if(!offer||!available||!termsVersion||!acknowledge||
    (managedBuyerChoiceAvailable&&!buyerKind)||
    (offer.billingKind==="monthly"&&!renew)||busy)return;
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/member-stripe-live/checkout",{
    method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sku:offer.id,confirmedPricePence:offer.pricePence,acknowledgeNewPayment:true,
      acknowledgeMonthlyRenewal:offer.billingKind==="monthly"?renew:false,
      acknowledgeLivePayment:true,acknowledgeNoVatPrice:true,
      acknowledgeConsumerTerms:true,consumerTermsVersion:termsVersion,
      ...(managedBuyerChoiceAvailable ? {buyerKind} : {})})
   });
   const body=await response.json();
   if(!response.ok||body.liveMode!==true||typeof body.url!=="string"||
      !body.url.startsWith("https://checkout.stripe.com/"))throw Error(body.error||"Checkout unavailable");
   window.location.assign(body.url);
  }catch(e){setMessage(e instanceof Error?e.message:"Checkout unavailable");setBusy(false);}
 }
 return <>
  <FounderMembershipPaymentReturn/>
  <Dialog open={open&&!!offer} onOpenChange={onOpenChange}>
   <DialogContent aria-describedby="member-checkout-summary">
    {offer&&<>
     <DialogHeader>
      <DialogTitle>Confirm {offer.name}</DialogTitle>
      <DialogDescription id="member-checkout-summary">
       Please review your membership before opening secure Stripe Checkout.
      </DialogDescription>
     </DialogHeader>
     <p className="text-2xl font-semibold">
      {new Intl.NumberFormat("en-GB",{style:"currency",currency:offer.currency,maximumFractionDigits:0}).format(offer.pricePence/100)}
      <span className="ml-2 text-sm font-normal text-muted-foreground">{offer.billingLabel}</span>
     </p>
     <p className="text-sm text-muted-foreground">
      AI-assisted business-plan preparation software, not regulated immigration advice, endorsement or a guaranteed visa outcome.
     </p>
     {managedBuyerChoiceAvailable&&<fieldset className="rounded-lg border border-slate-200 p-3 text-sm" aria-required="true">
      <legend className="px-1 font-semibold">Who is purchasing this membership?</legend>
      <p className="mb-3 text-muted-foreground">Choose how this membership is being purchased so the correct Stripe product and tax classification are used.</p>
      <div className="space-y-2">
       <label className="flex items-center gap-2"><input type="radio" name="membership-buyer-kind"
         checked={buyerKind==="individual"} onChange={()=>setBuyerKind("individual")} />
         I'm paying personally (individual)
       </label>
       <label className="flex items-center gap-2"><input type="radio" name="membership-buyer-kind"
         checked={buyerKind==="business"} onChange={()=>setBuyerKind("business")} />
         A business is paying for this membership
       </label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">The final amount, including any applicable taxes, is confirmed by Stripe before you pay. Choosing business does not establish tax exemption.</p>
     </fieldset>}
     <div className="space-y-4 text-sm">
      <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={acknowledge}
        onChange={e=>setAcknowledge(e.target.checked)}/>
       <span>I understand the displayed total price and applicable membership terms, and I authorise a new payment.</span>
      </label>
      {offer.billingKind==="monthly"&&<label className="flex items-start gap-2">
       <input type="checkbox" className="mt-1" checked={renew} onChange={e=>setRenew(e.target.checked)}/>
       <span>I agree that this membership renews automatically every month until cancelled.</span>
      </label>}
      <p>Read our <Link href="/terms" className="underline">terms</Link> and
       {" "}<Link href="/support" className="underline">support and refund information</Link> before paying.</p>
     </div>
     <Button type="button" disabled={!available||!termsVersion||!acknowledge||
       (managedBuyerChoiceAvailable&&!buyerKind)||
       (offer.billingKind==="monthly"&&!renew)||busy} onClick={buy} className="w-full">
      {busy?"Opening secure checkout…":available?"Continue to Stripe":"Not yet available"}
     </Button>
     {message&&<p role="alert" className="text-sm text-destructive">{message}</p>}
    </>}
   </DialogContent>
  </Dialog>
 </>;
}
