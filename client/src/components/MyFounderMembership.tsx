import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
type Membership={orderId:string;sku:string;active:boolean;paidThrough:string|null;cancellationPending:boolean;canCancel:boolean};
export default function MyFounderMembership(){
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 // Share the same QueryClient as Stripe's verified payment-return poller.
 // When the server confirms activation, that poller invalidates this key
 // and the UI updates automatically, instead of staying "Inactive".
 const {data,refetch}=useQuery<{membership:Membership|null}>({
  queryKey:["/api/member-stripe-live/my-membership"],
  queryFn:async()=>{
   const response=await fetch("/api/member-stripe-live/my-membership",{
    credentials:"include",cache:"no-store",
   });
   if(!response.ok)throw Error("Membership status temporarily unavailable");
   return response.json();
  },
  retry:false,
  staleTime:0,
  refetchOnWindowFocus:true,
 });
 const membership=data?.membership??null;
 const isPaymentReturn=typeof window!=="undefined" &&
   new URLSearchParams(window.location.search).get("payment")==="return";
 async function refresh(){await refetch();}
 async function cancel(){
  if(!membership?.canCancel||!window.confirm("Cancel automatic monthly renewal? Your paid membership remains active until its paid-through date."))return;
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/member-stripe-live/cancel",{
    method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({orderId:membership.orderId})
   });
   const data=await response.json();
   if(!response.ok||data.cancelAtPeriodEnd!==true)throw Error(data.error||"Cancellation not confirmed");
   setMessage("Automatic renewal cancelled. You retain paid access until the current paid-through date.");
   await refresh();
  }catch(e){setMessage(e instanceof Error?e.message:"Could not cancel renewal. Please contact support.");}
  finally{setBusy(false)}
 }
 if(!data||!membership)return null;
 return <section id="your-founder-membership" className="my-8 rounded-lg border p-5 space-y-3" aria-label="Manage Founder membership">
  <h2 className="text-lg font-semibold">Your Founder membership</h2>
  <p className="text-sm">Package: {membership.sku.replaceAll("_"," ")} · {membership.active?"Active":isPaymentReturn?"Awaiting payment verification":"Inactive"}</p>
  {membership.paidThrough&&<p className="text-sm">Paid through: {new Date(membership.paidThrough).toLocaleDateString("en-GB")}</p>}
  {membership.cancellationPending&&<p className="text-sm">Automatic renewal cancellation confirmed. Paid access remains until the end of your term.</p>}
  {membership.canCancel&&<button type="button" disabled={busy} onClick={cancel}
    className="rounded border px-4 py-2 disabled:opacity-50">
     {busy?"Cancelling renewal…":"Cancel monthly renewal"}
  </button>}
  {message&&<p role="status" className="text-sm">{message}</p>}
  <p className="text-xs text-muted-foreground">For refunds or billing corrections, contact support. Cancellation does not automatically refund a paid period.</p>
 </section>;
}
