import FounderMembershipPaymentReturn from "./FounderMembershipPaymentReturn";
import {useEffect,useState} from "react";
import {Link} from "wouter";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {membershipLoginHref,membershipSignupHref} from "@/lib/memberPurchaseNavigation";

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
 const [busy,setBusy]=useState(false);
 const [acknowledge,setAcknowledge]=useState(false);
 const [renew,setRenew]=useState(false);
 const [message,setMessage]=useState("");
 const [authState,setAuthState]=useState<"checking"|"signed_out"|"admin"|"verify_email"|"customer"|"error">("checking");
 useEffect(()=>{
  if(!open)return;
  setAcknowledge(false);setRenew(false);setBusy(false);setMessage("");
  setAuthState("checking");
  let mounted=true;
  fetch("/api/auth/user",{credentials:"include",cache:"no-store"})
   .then(async r=>r.status===401?null:r.ok?await r.json():undefined)
   .then(user=>{if(mounted)setAuthState(user===null?"signed_out":!user?"error":
       user.isAdmin===true?"admin":user.isEmailVerified!==true?"verify_email":"customer");})
   .catch(()=>{if(mounted)setAuthState("error");});
  fetch("/api/member-stripe-live/availability",{credentials:"include",cache:"no-store"})
   .then(r=>r.ok?r.json():null).then(d=>{
    if(mounted){setAvailable(d?.available===true);setTermsVersion(typeof d?.termsVersion==="string"?d.termsVersion:null);}
   }).catch(()=>{if(mounted)setAvailable(false);});
  return ()=>{mounted=false};
 },[open,offer?.id]);
 async function buy(){
  if(!offer||authState!=="customer"||!available||!termsVersion||!acknowledge||
    (offer.billingKind==="monthly"&&!renew)||busy)return;
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/member-stripe-live/checkout",{
    method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sku:offer.id,confirmedPricePence:offer.pricePence,acknowledgeNewPayment:true,
      acknowledgeMonthlyRenewal:offer.billingKind==="monthly"?renew:false,
      acknowledgeLivePayment:true,acknowledgeNoVatPrice:true,
      acknowledgeConsumerTerms:true,consumerTermsVersion:termsVersion})
   });
   const body=await response.json();
   if(response.status===401){setAuthState("signed_out");throw Error("Your session has expired. Please sign in to continue.");}
   if(response.status===403&&/administrator/i.test(body.error||""))setAuthState("admin");
   if(response.status===403&&/verify.*email/i.test(body.error||""))setAuthState("verify_email");
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
     {authState==="checking"&&<p role="status" className="text-sm text-muted-foreground">Checking your customer account before checkout…</p>}
     {authState==="signed_out"&&<div role="status" className="space-y-3 rounded-md border p-3 text-sm">
      <p><strong>Sign in to buy this membership.</strong> You must sign in with a verified customer account before Stripe can process the payment.</p>
      <div className="flex flex-wrap gap-2">
       <Button asChild><Link href={membershipLoginHref(offer.id)}>Sign in to continue</Link></Button>
       <Button variant="outline" asChild><Link href={membershipSignupHref(offer.id)}>Create account</Link></Button>
      </div>
      <p className="text-xs text-muted-foreground">We’ll return you to {offer.name} after sign-in. You won't be charged until you complete Stripe Checkout.</p>
     </div>}
     {authState==="admin"&&<p role="alert" className="rounded-md border p-3 text-sm">
      Administrator accounts cannot buy customer memberships. Sign out, then use a separate verified customer account to purchase or test this plan.
     </p>}
     {authState==="verify_email"&&<p role="alert" className="rounded-md border p-3 text-sm">
      Please verify your email address using the message sent when you registered, then return here. Unverified accounts cannot be charged.
     </p>}
     {authState==="error"&&<p role="alert" className="rounded-md border p-3 text-sm">
      We could not verify your account. Refresh the page and sign in before proceeding.
     </p>}
     {authState==="customer"&&<>
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
     <Button type="button" disabled={authState!=="customer"||!available||!termsVersion||!acknowledge||
       (offer.billingKind==="monthly"&&!renew)||busy} onClick={buy} className="w-full">
      {busy?"Opening secure checkout…":available?"Continue to Stripe":"Not yet available"}
     </Button>
     </>}
     {message&&<p role="alert" className="text-sm text-destructive">{message}</p>}
    </>}
   </DialogContent>
  </Dialog>
 </>;
}
