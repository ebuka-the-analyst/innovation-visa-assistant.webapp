import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {
 inspectPriorLiveCheckout,isTrustedOldLiveCheckout,PendingCheckoutNeedsReview,
} from "../server/phase3/memberStripeLiveCheckoutRecovery";
import {reserveLiveCheckout} from "../server/phase3/memberStripeLiveCheckoutReservation";

const userId="founder-customer-test";
const orderId="0ba697ad-ad50-4d5e-a6d0-c6125a72b79e";
const customerId="cus_founder123";
const sessionId="cs_live_founderABC123";
const priceId="price_founder123";
const prior={
 id:orderId,user_id:userId,sku:"founder",stripe_customer_id:customerId,
 stripe_checkout_session_id:sessionId,stripe_subscription_id:null,
 stripe_payment_intent_id:null,stripe_price_id:priceId,
 expected_pence:6900,currency:"gbp",
 currently_active:false,paid_through:null,
};
const stripeSession={
 id:sessionId,livemode:true,mode:"subscription",
 status:"open",payment_status:"unpaid",
 client_reference_id:userId,customer:customerId,
 currency:"gbp",amount_subtotal:6900,amount_total:6900,
 total_details:{amount_discount:0,amount_tax:0},
 automatic_tax:{enabled:false},
 shipping_address_collection:{allowed_countries:["GB"]},
 metadata:{ifvaMembershipLive:"true",ifvaLiveOrderId:orderId},
 url:"https://checkout.stripe.com/c/pay/cs_live_founderABC123#session",
 subscription:null,payment_intent:null,
};
const item={quantity:1,price:{id:priceId},amount_subtotal:6900};
function fixtures(orders:any[]= [prior],session:any=stripeSession,items:any[]= [item],review=false){
 const statements:string[]=[];
 const pool={query:async (query:string,_args:any[])=>{
  statements.push(query);
  if(query.includes("FROM member_stripe_live_orders WHERE user_id=$1"))return{rows:orders,rowCount:orders.length};
  if(query.includes("FROM member_stripe_live_reviews WHERE order_id=$1"))return{rows:review?[{}]:[],rowCount:review?1:0};
  throw Error("Unexpected SQL "+query.slice(0,100));
 }};
 const stripe={checkout:{sessions:{
  retrieve:async(id:string)=>{assert.equal(id,sessionId);return session;},
  listLineItems:async(id:string)=>{assert.equal(id,sessionId);return{data:items,has_more:false};},
 }}};
 return{pool:pool as any,stripe:stripe as any,statements};
}

test("Owner can resume an unpaid LIVE Stripe Founder checkout after closing the Stripe tab",async()=>{
 const {pool,stripe}=fixtures();
 const decision=await inspectPriorLiveCheckout(pool,stripe,userId,"founder");
 assert.deepEqual(decision,{kind:"resume",orderId,sessionId,url:stripeSession.url});
 assert.equal(isTrustedOldLiveCheckout(prior as any,stripeSession as any,item as any),true);
});

test("No previous orders means a first purchase is permitted",async()=>{
 const {pool,stripe}=fixtures([]);
 assert.deepEqual(await inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
  {kind:"new",verifiedExpiredIds:[]});
});

test("A different plan does not open a second paid checkout while prior session is open",async()=>{
 const {pool,stripe}=fixtures();
 await assert.rejects(
  inspectPriorLiveCheckout(pool,stripe,userId,"founder_pro"),
  /unfinished founder checkout/,
 );
});

test("Provider-confirmed expired/unpaid session can be skipped for a new attempt",async()=>{
 const {pool,stripe}=fixtures([prior],{...stripeSession,status:"expired",url:null});
 const decision=await inspectPriorLiveCheckout(pool,stripe,userId,"founder");
 assert.equal(decision.kind,"new");
 if(decision.kind!=="new")throw Error("Expected new");
 assert.deepEqual(decision.verifiedExpiredIds,[orderId]);
});

test("A failed or unfinished provider payment may never be superseded with a new charge",async()=>{
 for(const bad of [
  {status:"complete",payment_status:"unpaid"},
  {status:"complete",payment_status:"paid"},
  {status:"open",payment_status:"paid"},
  {status:"open",payment_intent:"pi_live_known"},
  {status:"open",subscription:"sub_live_known"},
  {status:"expired",payment_intent:"pi_live_known"},
 ]){
  const {pool,stripe}=fixtures([prior],{...stripeSession,...bad});
  await assert.rejects(inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
   PendingCheckoutNeedsReview);
 }
});

test("Tampered owner, order, price, customer, mode, geography and Stripe environment cannot be resumed",async()=>{
 const invalid=[
  {client_reference_id:"attacker"},
  {customer:"cus_mismatch"},
  {livemode:false},
  {metadata:{...stripeSession.metadata,ifvaLiveOrderId:"other-order"}},
  {amount_total:1},
  {currency:"eur"},
  {shipping_address_collection:{allowed_countries:["US"]}},
  {automatic_tax:{enabled:true}},
  {total_details:{amount_discount:1,amount_tax:0}},
  {url:"https://attacker.example/c/pay/fake"},
  {url:"https://checkout.stripe.com.evil.example/c/pay/x"},
  {url:"http://checkout.stripe.com/c/pay/fake"},
 ];
 for(const patch of invalid){
  const {pool,stripe}=fixtures([prior],{...stripeSession,...patch});
  await assert.rejects(inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
   PendingCheckoutNeedsReview,JSON.stringify(patch));
 }
 for(const bad of [
  {...item,price:{id:"price_wrong"}},
  {...item,quantity:2},
  {...item,amount_subtotal:1},
 ]){
  const {pool,stripe}=fixtures([prior],stripeSession,[bad]);
  await assert.rejects(inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
   PendingCheckoutNeedsReview);
 }
});

test("An order with any payment, paid-through, dispute or unbound placeholder fails closed",async()=>{
 for(const mutation of [
  {currently_active:true},
  {paid_through:new Date("2026-11-01T00:00:00Z")},
  {stripe_subscription_id:"sub_known"},
  {stripe_payment_intent_id:"pi_known"},
  {stripe_checkout_session_id:"cs_pending_"+orderId},
 ]){
  const {pool,stripe}=fixtures([{...prior,...mutation}]);
  await assert.rejects(inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
   PendingCheckoutNeedsReview);
 }
 const {pool,stripe}=fixtures([prior],stripeSession,[item],true);
 await assert.rejects(inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
  PendingCheckoutNeedsReview);
});

test("Account row lock blocks all unfinished orders regardless of age; only provider-verified expired IDs are excluded",async()=>{
 const statements:string[]=[];
 const client={
  query:async(sql:string,args:any[]=[])=>{
   statements.push(sql);
   if(sql==="BEGIN"||sql==="COMMIT")return{};
   if(sql.includes("FROM users WHERE id=$1 FOR UPDATE"))
    return{rowCount:1,rows:[{subscription_tier:"free",subscription_status:"inactive"}]};
   if(sql.includes("SELECT id FROM member_stripe_live_orders")){
    assert.deepEqual(args,[userId,[]]);
    return{rowCount:1,rows:[{id:orderId}]};
   }
   throw Error("Unexpected insert; old session must block");
  },
  release:()=>{},
 };
 const pool={connect:async()=>client};
 await assert.rejects(reserveLiveCheckout(pool as any,{
  orderId:"aa697ad-ad50-4d5e-a6d0-c6125a72b79e",userId,
  sku:"founder",customerId,priceId,expectedPence:6900,currency:"gbp",
 }),/checkout/);
 assert.ok(statements.some(s=>s.includes("id <> ALL($2::uuid[])")));
 assert.ok(statements.every(s=>!s.includes("INTERVAL '1 hour'")));
 assert.ok(statements.includes("ROLLBACK"));
});

test("Existing server checkout always attempts resume before creating any new Stripe customer",()=>{
 const routes=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 assert.match(routes,/inspectPriorLiveCheckout\(pool,cfg\.stripe,user\.id,sku\)/);
 assert.match(routes,/if\(prior\.kind==="resume"\)/);
 assert.match(routes,/resumed:true/);
 assert.ok(routes.indexOf("inspectPriorLiveCheckout(pool,cfg.stripe,user.id,sku)")<
  routes.indexOf("cfg.stripe.customers.create({email,metadata:{ifvaMembershipLive"));
 assert.match(routes,/prior\.verifiedExpiredIds/);
 assert.match(routes,/e instanceof LiveCheckoutConflict \|\| e instanceof PendingCheckoutNeedsReview/);
});

test("An open Stripe Session cannot hide a second earlier paid or active order",async()=>{
 const previous={...prior,id:"bb697ad-ad50-4d5e-a6d0-c6125a72b79e",
  currently_active:true,paid_through:new Date("2026-11-15T00:00:00Z")};
 const {pool,stripe}=fixtures([prior,previous]);
 await assert.rejects(inspectPriorLiveCheckout(pool,stripe,userId,"founder"),
  /membership\/payment requires verification/);
});
