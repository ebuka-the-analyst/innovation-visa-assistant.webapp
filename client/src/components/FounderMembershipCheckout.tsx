import FounderMembershipPaymentReturn from "./FounderMembershipPaymentReturn";
import {useEffect,useState} from "react";
import {Link} from "wouter";
type Sku="founder"|"founder_pro"|"founder_pass_90d";
const products:{sku:Sku;name:string;price:number;interval:string;description:string}[]=[
 {sku:"founder",name:"Founder",price:6900,interval:"month",description:"2 plan generations and 15 revisions per paid month"},
 {sku:"founder_pro",name:"Founder Pro",price:11900,interval:"month",description:"4 plan generations and 30 revisions per paid month"},
 {sku:"founder_pass_90d",name:"90-Day Pass",price:15900,interval:"once",description:"2 generations and 15 revisions per 30 days; 6 plans maximum in 90 days"},
];
export default function FounderMembershipCheckout(){
 const requestedSku=new URLSearchParams(window.location.search).get("membership_sku");
 const displayedProducts=products.filter(p=>!requestedSku||p.sku===requestedSku);
 const [available,setAvailable]=useState(false);
 const [termsVersion,setTermsVersion]=useState<string|null>(null);
 const [busy,setBusy]=useState<Sku|null>(null);
 const [acknowledge,setAcknowledge]=useState(false);
 const [renew,setRenew]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  let mounted=true;
  fetch("/api/member-stripe-live/availability",{credentials:"include",cache:"no-store"})
   .then(r=>r.ok?r.json():null).then(d=>{
     if(mounted){setAvailable(d?.available===true);setTermsVersion(typeof d?.termsVersion==="string"?d.termsVersion:null);}
   }).catch(()=>{if(mounted)setAvailable(false);});
  return ()=>{mounted=false};
 },[]);
 async function buy(sku:Sku,price:number){
  if(!available||!termsVersion||!acknowledge||(sku!=="founder_pass_90d"&&!renew))return;
  setBusy(sku);setMessage("");
  try{
   const response=await fetch("/api/member-stripe-live/checkout",{
    method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sku,confirmedPricePence:price,acknowledgeNewPayment:true,
      acknowledgeMonthlyRenewal:sku!=="founder_pass_90d"?renew:false,
      acknowledgeLivePayment:true,acknowledgeNoVatPrice:true,
      acknowledgeConsumerTerms:true,consumerTermsVersion:termsVersion})
   });
   const body=await response.json();
   if(!response.ok||body.liveMode!==true||typeof body.url!=="string"||
      !body.url.startsWith("https://checkout.stripe.com/"))throw Error(body.error||"Checkout unavailable");
   window.location.assign(body.url);
  }catch(e){setMessage(e instanceof Error?e.message:"Checkout unavailable");setBusy(null);}
 }
 return <><FounderMembershipPaymentReturn /><section aria-label="Founder memberships" className="my-12 space-y-5" id="membership-purchase-options">
  <h2 className="text-2xl font-semibold">Founder memberships</h2>
  <p className="text-sm text-muted-foreground">Separate from existing pay-per-plan packages. Digital AI preparation only, not immigration advice, endorsement or guaranteed visa outcomes.</p>
  <div className="grid gap-4 md:grid-cols-3">{displayedProducts.map(p=><div key={p.sku} className="rounded-lg border p-5 space-y-3">
   <h3 className="font-semibold">{p.name}</h3>
   <p className="text-2xl font-bold">£{(p.price/100).toFixed(0)} <span className="text-sm font-normal">/{p.interval}</span></p>
   <p className="text-sm font-medium">No VAT charged</p>
   <p className="text-sm">{p.description}</p>
   <button type="button" disabled={!available||!termsVersion||!acknowledge||(p.interval==="month"&&!renew)||busy!==null}
    onClick={()=>buy(p.sku,p.price)}
    className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">
    {busy===p.sku?"Opening secure checkout…":available?"Continue to Stripe":"Not yet available"}
   </button>
  </div>)}</div>
  {available&&termsVersion&&<div className="space-y-3 text-sm">
   <label className="flex gap-2"><input type="checkbox" checked={acknowledge} onChange={e=>setAcknowledge(e.target.checked)}/>
    I understand the displayed total price, payment terms and membership consumer terms. I authorise a new payment.</label>
   <label className="flex gap-2"><input type="checkbox" checked={renew} onChange={e=>setRenew(e.target.checked)}/>
    I understand that Founder and Founder Pro renew automatically each month until cancelled. The 90-Day Pass does not renew.</label>
   <p>Please read the <Link href="/terms" className="underline">terms</Link> and <Link href="/support" className="underline">support and refund enquiries</Link> before purchase. Membership cancellation and refund requests can also be made through support.</p>
  </div>}
  {!available&&<p className="text-sm text-muted-foreground">New memberships are not accepting live payments yet. Existing services and purchases remain available.</p>}
  {message&&<p role="alert" className="text-sm text-destructive">{message}</p>}
 </section></>;
}
