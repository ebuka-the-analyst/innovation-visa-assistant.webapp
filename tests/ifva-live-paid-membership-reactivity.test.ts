import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const payment=read("client/src/components/FounderMembershipPaymentReturn.tsx");
const manage=read("client/src/components/MyFounderMembership.tsx");
const access=read("client/src/hooks/useCommercialCatalog.ts");
const auth=read("client/src/hooks/useAuth.ts");

test("Payment success is not invented from Stripe redirect, only the owner-scoped active server order",()=>{
 assert.match(payment,/\/api\/member-stripe-live\/order\//);
 assert.match(payment,/payload\?\.liveMode===true&&payload\?\.orderId===orderId&&payload\.active===true/);
 assert.match(payment,/if\(!valid\|\|returnType==="cancelled"\|\|returnType!=="return"\)return/);
 assert.match(payment,/setState\("active"\)/);
 assert.match(payment,/Do not pay again/);
});

test("Verified paid order invalidates membership status, tool permissions and signed-in user",()=>{
 assert.match(payment,/useQueryClient\(\)/);
 for(const key of ["/api/member-stripe-live/my-membership","/api/tools/access","/api/auth/user"]){
  assert.ok(payment.includes('queryClient.invalidateQueries({queryKey:["'+key+'"]})'),key);
 }
 assert.match(payment,/Promise\.all\(/);
 assert.match(access,/queryKey: \["\/api\/tools\/access"\]/);
 assert.match(auth,/queryKey: \["\/api\/auth\/user"\]/);
});

test("Membership panel subscribes to verified reactive state instead of stale mount-only fetch",()=>{
 assert.match(manage,/useQuery<\{membership:Membership\|null\}>/);
 assert.match(manage,/queryKey:\["\/api\/member-stripe-live\/my-membership"\]/);
 assert.match(manage,/credentials:"include",cache:"no-store"/);
 assert.match(manage,/refetchOnWindowFocus:true/);
 assert.doesNotMatch(manage,/useEffect\(\(\)=>\{void refresh\(\);\},\[\]\)/);
 assert.match(manage,/Awaiting payment verification/);
 assert.match(manage,/membership\.active\?"Active"/);
 assert.match(manage,/membership\.canCancel/);
 assert.match(manage,/window\.confirm/);
});

test("Payment success offers navigation to tools and dashboard, without automatic redirect",()=>{
 assert.match(payment,/state==="active"&&<div/);
 assert.match(payment,/innovatorFounderPath\("\/tools-hub"\)/);
 assert.match(payment,/innovatorFounderPath\("\/dashboard"\)/);
 assert.doesNotMatch(payment,/window\.location\.assign/);
});
