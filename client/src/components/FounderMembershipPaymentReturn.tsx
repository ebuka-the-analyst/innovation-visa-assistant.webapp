import {useEffect,useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {innovatorFounderPath} from "@/lib/innovator-founder-routes";
import {Link} from "wouter";

type State = "waiting"|"active"|"cancelled"|"error";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Stripe's browser redirect is never proof of payment.
 * Only the owner-scoped, server-backed, verified membership order can grant access.
 */
export default function FounderMembershipPaymentReturn(){
 const queryClient=useQueryClient();
 const params=new URLSearchParams(window.location.search);
 const orderId=params.get("membership_order")||"";
 const returnType=params.get("payment");
 const valid=UUID.test(orderId);
 const [state,setState]=useState<State>(returnType==="cancelled"?"cancelled":"waiting");
 const [through,setThrough]=useState<string|null>(null);
 const [detail,setDetail]=useState("");
 useEffect(()=>{
   if(!valid||returnType==="cancelled"||returnType!=="return")return;
   let attempts=0;
   let stopped=false;
   let timer:ReturnType<typeof setTimeout>|undefined;
   async function poll(){
     if(stopped)return;
     attempts++;
     try{
       const response=await fetch("/api/member-stripe-live/order/"+encodeURIComponent(orderId),{
         credentials:"include",cache:"no-store"
       });
       if(response.status===404||response.status===401){
         if(!stopped){setDetail("Membership order unavailable for this account. Contact billing support.");setState("error");}
         return;
       }
       if(!response.ok)throw Error("Unable to confirm the paid order");
       const payload=await response.json();
       if(payload?.liveMode===true&&payload?.orderId===orderId&&payload.active===true){
         if(!stopped){
           setThrough(payload.paidThrough||null);
           setState("active");
           // The membership panel and tool locks may have fetched a FREE
           // snapshot before the signed invoice event completed. Refresh all
           // server-owned membership and entitlement caches once confirmed.
           void Promise.all([
             queryClient.invalidateQueries({queryKey:["/api/member-stripe-live/my-membership"]}),
             queryClient.invalidateQueries({queryKey:["/api/tools/access"]}),
             queryClient.invalidateQueries({queryKey:["/api/auth/user"]}),
           ]);
         }
         return;
       }
     }catch(e){
       if(attempts>=24&&!stopped){setDetail(e instanceof Error?e.message:"Verification unavailable");setState("error");return;}
     }
     if(attempts>=24){
       if(!stopped){setState("error");setDetail("Stripe may still be processing. Do not pay again; contact support if access is not active.");}
       return;
     }
     if(!stopped)timer=setTimeout(poll,3500);
   }
   void poll();
   return ()=>{stopped=true;if(timer)clearTimeout(timer)};
 },[valid,orderId,returnType,queryClient]);
 if(!valid||!["cancelled","return"].includes(returnType||""))return null;
 return <section aria-live="polite" className="mb-6 rounded-lg border p-5 space-y-2">
  <h2 className="font-semibold">Founder membership payment</h2>
  {state==="active"&&<p className="text-sm">Verified payment and membership activation received from the server.
   {through?" Access through "+new Date(through).toLocaleDateString("en-GB"):""}</p>}
  {state==="waiting"&&<p className="text-sm">Stripe has returned. Verifying the payment and membership fulfilment with the server. Do not pay again.</p>}
  {state==="cancelled"&&<p className="text-sm">Checkout was cancelled. No new membership has been confirmed.</p>}
  {state==="error"&&<p role="alert" className="text-sm">Unable to confirm membership yet. {detail} Do not pay again until the first attempt has been checked.</p>}
  {state==="active"&&<div className="flex flex-wrap items-center gap-4 text-sm">
   <Link href={innovatorFounderPath("/tools-hub")} className="font-semibold underline">Explore your unlocked tools</Link>
   <Link href={innovatorFounderPath("/dashboard")} className="underline">Go to dashboard</Link>
  </div>}
  <Link href="/pricing" className="text-sm underline">Review your memberships</Link>
 </section>;
}
