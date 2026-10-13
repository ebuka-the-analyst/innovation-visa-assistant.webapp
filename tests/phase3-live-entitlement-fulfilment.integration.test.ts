/** OFFLINE signed livemode:true Stripe EVENT FIXTURES: disposable PostgreSQL only, no live Stripe calls or real payments. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import Stripe from "stripe";
import { Pool } from "pg";
import { processSignedLiveStripeEvent } from "../server/phase3/durableStripeLiveLedger";
import { applyVerifiedLiveMembershipEntitlement } from "../server/phase3/memberLiveEntitlementFulfilment";
import { reserveLiveCheckout, recordCreatedLiveCheckout, LiveCheckoutConflict } from "../server/phase3/memberStripeLiveCheckoutReservation";
import { currentQuotaWindow } from "../server/services/memberAiQuota";

const url=process.env.QUOTA_TEST_DATABASE_URL;
if(!url)throw Error("Only disposable PostgreSQL CI database is permitted");
const schema="phase3_fulfilment_"+randomUUID().replaceAll("-","");
const root=new Pool({connectionString:url,max:1});
const pool=new Pool({connectionString:url,max:8,options:"-c search_path="+schema+",public"});
const stripe=new Stripe("sk_live_offline_fixture_only",{apiVersion:"2025-08-27.basil"});
const secret="whsec_qa_offline_fixture";
const DAY=86400, TIME=1800000000;

type Sku="founder"|"founder_pro"|"founder_pass_90d";
type Order={id:string;user:string;sku:Sku;customer:string;subscription:string;intent:string;session:string;price:string;amount:number};
async function order(sku:Sku,initialTier="free"):Promise<Order>{
  const key=randomUUID().replaceAll("-","");
  const o:Order={id:randomUUID(),user:"test_user_"+key,sku,
    customer:"cus_"+key,subscription:"sub_"+key,intent:"pi_"+key,
    session:"cs_test_"+key,price:"price_"+key,
    amount:sku==="founder"?6900:sku==="founder_pro"?11900:15900};
  await pool.query(`INSERT INTO users(id,subscription_tier,subscription_status)
    VALUES($1,$2,$3)`,[o.user,initialTier,initialTier==="free"?"inactive":"active"]);
  await pool.query(`
    INSERT INTO member_stripe_live_orders
      (id,user_id,sku,stripe_customer_id,stripe_checkout_session_id,
       stripe_subscription_id,stripe_payment_intent_id,stripe_price_id,expected_pence)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [o.id,o.user,o.sku,o.customer,o.session,
      sku==="founder_pass_90d"?null:o.subscription,
      o.intent,o.price,o.amount]);
  return o;
}
function invoice(o:Order,start=TIME) {
  return {id:"in_"+randomUUID().replaceAll("-",""),customer:o.customer,
    status:"paid",paid_out_of_band:false,collection_method:"charge_automatically",
    amount_remaining:0,amount_paid:o.amount,currency:"gbp",
    parent:{subscription_details:{subscription:o.subscription}},
    lines:{data:[{pricing:{price_details:{price:o.price}},
      period:{start,end:start+30*DAY}}],has_more:false,total_count:1},
  };
}
function pass(o:Order){
  return {id:o.session,customer:o.customer,mode:"payment",currency:"gbp",
    amount_total:o.amount,payment_status:"paid",payment_intent:o.intent};
}
function sign(type:string,obj:any,created:number,id=randomUUID(),live=true){
  const payload=JSON.stringify({id:"evt_"+id.replaceAll("-",""),type,created,
    livemode:live,object:"event",data:{object:obj}});
  return {payload,signature:stripe.webhooks.generateTestHeaderString({payload,secret})};
}
async function send(o:Order,type:string,obj:any,created:number,id?:string) {
  const s=sign(type,obj,created,id);
  return processSignedLiveStripeEvent(pool,o.id,s.payload,s.signature,secret,
    applyVerifiedLiveMembershipEntitlement);
}
async function state(o:Order) {
  const [us,ents,audit]=await Promise.all([
    pool.query<{subscription_tier:string;subscription_status:string;tier_expires_at:Date|null}>(
      "SELECT subscription_tier,subscription_status,tier_expires_at FROM users WHERE id=$1",[o.user]),
    pool.query<any>("SELECT * FROM member_ai_entitlements WHERE user_id=$1",[o.user]),
    pool.query<{decision:string}>(
      "SELECT decision FROM member_stripe_live_events WHERE order_id=$1",[o.id]),
  ]);
  return {user:us.rows[0],ent:ents.rows,audit:audit.rows};
}
test.before(async()=>{
  await root.query('CREATE SCHEMA "'+schema+'"');
  await pool.query(`CREATE TABLE users (
    id VARCHAR PRIMARY KEY, subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    subscription_status VARCHAR(20), tier_expires_at TIMESTAMPTZ)`);
  await pool.query(readFileSync(new URL("../migrations/app/20261011_member_ai_entitlements.sql",import.meta.url),"utf8"));
  await pool.query(readFileSync(new URL("../migrations/app/20261013_member_stripe_live_ledger.sql",import.meta.url),"utf8"));
});
test.after(async()=>{
  await pool.end();
  await root.query('DROP SCHEMA IF EXISTS "'+schema+'" CASCADE').catch(()=>{});
  await root.end();
});

test("six concurrent signed pass retries create ONE real QA entitlement and exact 90-day expiry",async()=>{
  const o=await order("founder_pass_90d");
  const s=sign("checkout.session.completed",pass(o),TIME);
  const results=await Promise.all(Array.from({length:6},()=>
    processSignedLiveStripeEvent(pool,o.id,s.payload,s.signature,secret,
      applyVerifiedLiveMembershipEntitlement)));
  assert.equal(results.filter(r=>r.action==="activate").length,1);
  assert.equal(results.filter(r=>r.duplicate).length,5);
  const a=await state(o);
  assert.equal(a.ent.length,1);
  assert.equal(a.ent[0].status,"active");
  assert.equal(a.ent[0].provider_reference,o.session);
  assert.equal(a.user.subscription_tier,o.sku);
  assert.equal(a.user.subscription_status,"active");
  assert.equal(a.ent[0].ends_at.getTime(),(TIME+90*DAY)*1000);
  assert.equal(a.user.tier_expires_at?.getTime(),(TIME+90*DAY)*1000);
  assert.ok(currentQuotaWindow(a.ent[0],new Date((TIME+89*DAY)*1000)));
  assert.equal(currentQuotaWindow(a.ent[0],new Date((TIME+90*DAY)*1000)),null);

  const secondary=await send(o,"checkout.session.async_payment_succeeded",pass(o),TIME+100);
  assert.equal(secondary.action,"ignore");
  const after=await state(o);
  assert.equal(after.ent.length,1);
  assert.equal(after.ent[0].ends_at.getTime(),(TIME+90*DAY)*1000);
});

test("subscription Checkout alone grants nothing, but paid invoices set monthly windows and renew exactly once",async()=>{
  const o=await order("founder_pro");
  assert.equal((await send(o,"checkout.session.completed",
    {id:o.session,customer:o.customer,mode:"subscription",payment_status:"paid"},TIME)).action,"ignore");
  assert.equal((await state(o)).ent.length,0);
  assert.equal((await send(o,"invoice.paid",invoice(o),TIME+1)).action,"activate");
  let s=await state(o);
  assert.equal(s.ent.length,1);
  assert.equal(s.ent[0].ends_at.getTime(),(TIME+30*DAY)*1000);
  assert.equal(s.user.subscription_tier,o.sku);
  const renew=await send(o,"invoice.paid",invoice(o,TIME+30*DAY),TIME+30*DAY+1);
  assert.equal(renew.action,"activate");
  s=await state(o);
  assert.equal(s.ent.length,1);
  assert.equal(s.ent[0].ends_at.getTime(),(TIME+60*DAY)*1000);
  assert.equal(s.ent[0].period_starts_at.getTime(),(TIME+30*DAY)*1000);
  assert.equal(s.user.tier_expires_at?.getTime(),(TIME+60*DAY)*1000);
  assert.ok(currentQuotaWindow(s.ent[0],new Date((TIME+45*DAY)*1000)));
  assert.equal(currentQuotaWindow(s.ent[0],new Date((TIME+31*DAY)*1000))?.periodStartsAt.getTime(),
    (TIME+30*DAY)*1000);
});

test("provider-confirmed invoice payments map every renewal to a distinct PaymentIntent in the same transaction",async()=>{
  const o=await order("founder_pro");
  const first=invoice(o);
  const event1=sign("invoice.paid",first,TIME+1);
  const p1={
    invoiceId:first.id,invoicePaymentId:"inpay_"+randomUUID().replaceAll("-",""),
    paymentIntentId:"pi_"+randomUUID().replaceAll("-",""),
    amountPence:o.amount,currency:"gbp" as const,
    periodStartEpoch:TIME,periodEndEpoch:TIME+30*DAY,
  };
  const result1=await processSignedLiveStripeEvent(
    pool,o.id,event1.payload,event1.signature,secret,
    applyVerifiedLiveMembershipEntitlement,p1);
  assert.equal(result1.action,"activate");
  const second=invoice(o,TIME+30*DAY);
  const event2=sign("invoice.paid",second,TIME+30*DAY+1);
  const p2={
    ...p1,invoiceId:second.id,
    invoicePaymentId:"inpay_"+randomUUID().replaceAll("-",""),
    paymentIntentId:"pi_"+randomUUID().replaceAll("-",""),
    periodStartEpoch:TIME+30*DAY,periodEndEpoch:TIME+60*DAY,
  };
  const result2=await processSignedLiveStripeEvent(
    pool,o.id,event2.payload,event2.signature,secret,
    applyVerifiedLiveMembershipEntitlement,p2);
  assert.equal(result2.action,"activate");
  const paid=await pool.query<{stripe_invoice_id:string;stripe_payment_intent_id:string}>(
    `SELECT stripe_invoice_id,stripe_payment_intent_id
       FROM member_stripe_live_invoice_payments WHERE order_id=$1
       ORDER BY period_start ASC`,[o.id]);
  assert.equal(paid.rows.length,2);
  assert.deepEqual(paid.rows.map(x=>x.stripe_payment_intent_id),
    [p1.paymentIntentId,p2.paymentIntentId]);
  const exact=await pool.query(
    `SELECT o.id FROM member_stripe_live_orders o
       WHERE o.stripe_payment_intent_id=$1 OR
         o.id IN (SELECT p.order_id FROM member_stripe_live_invoice_payments p
                  WHERE p.stripe_payment_intent_id=$1)`,[p1.paymentIntentId]);
  assert.equal(exact.rows[0].id,o.id);
  assert.equal(exact.rowCount,1);
  assert.equal((await state(o)).ent[0].ends_at.getTime(),(TIME+60*DAY)*1000);
});

test("duplicate renewal PaymentIntent cannot extend access or corrupt paid invoice map",async()=>{
  const o=await order("founder");
  const first=invoice(o);
  const p1={
    invoiceId:first.id,invoicePaymentId:"inpay_"+randomUUID().replaceAll("-",""),
    paymentIntentId:"pi_"+randomUUID().replaceAll("-",""),
    amountPence:o.amount,currency:"gbp" as const,
    periodStartEpoch:TIME,periodEndEpoch:TIME+30*DAY,
  };
  const ev=sign("invoice.paid",first,TIME+1);
  assert.equal((await processSignedLiveStripeEvent(pool,o.id,ev.payload,ev.signature,secret,
    applyVerifiedLiveMembershipEntitlement,p1)).action,"activate");
  const second=invoice(o,TIME+30*DAY);
  const secondEv=sign("invoice.paid",second,TIME+30*DAY+1);
  const duplicate={...p1,invoiceId:second.id,
    invoicePaymentId:"inpay_"+randomUUID().replaceAll("-",""),
    periodStartEpoch:TIME+30*DAY,periodEndEpoch:TIME+60*DAY};
  const denied=await processSignedLiveStripeEvent(
    pool,o.id,secondEv.payload,secondEv.signature,secret,
    applyVerifiedLiveMembershipEntitlement,duplicate);
  assert.equal(denied.action,"review");
  assert.match(denied.reason,/already allocated/);
  assert.equal((await state(o)).ent[0].ends_at.getTime(),(TIME+30*DAY)*1000);
  const mappings=await pool.query(
    "SELECT stripe_invoice_id FROM member_stripe_live_invoice_payments WHERE order_id=$1",[o.id]);
  assert.equal(mappings.rows.length,1);
  const reviews=await pool.query(
    "SELECT id FROM member_stripe_live_orders WHERE id=$1 AND currently_active=TRUE",[o.id]);
  assert.equal(reviews.rowCount,1,"Already-paid access is preserved, not extended");
  const reviewQueue=await pool.query(
    "SELECT status FROM member_stripe_live_reviews WHERE stripe_event_id=$1",[denied.eventId]);
  assert.equal(reviewQueue.rows[0].status,"pending");
});

test("mismatching invoice amount or period does not write provider payment mapping",async()=>{
  const o=await order("founder");
  const data=invoice(o),evt=sign("invoice.paid",data,TIME+1);
  const invalid={
    invoiceId:data.id,invoicePaymentId:"inpay_"+randomUUID().replaceAll("-",""),
    paymentIntentId:"pi_"+randomUUID().replaceAll("-",""),
    amountPence:o.amount,currency:"gbp" as const,
    periodStartEpoch:TIME,periodEndEpoch:TIME+31*DAY,
  };
  const result=await processSignedLiveStripeEvent(
    pool,o.id,evt.payload,evt.signature,secret,
    applyVerifiedLiveMembershipEntitlement,invalid);
  assert.equal(result.action,"review");
  assert.equal((await state(o)).ent.length,0);
  const mappings=await pool.query(
    "SELECT stripe_invoice_id FROM member_stripe_live_invoice_payments WHERE order_id=$1",[o.id]);
  assert.equal(mappings.rowCount,0);
});

test("failed renewal respects already-paid period, then atomically suspends access on expiration",async()=>{
  const o=await order("founder");
  await send(o,"invoice.paid",invoice(o),TIME+1);
  const failure={customer:o.customer,
    parent:{subscription_details:{subscription:o.subscription}}};
  assert.equal((await send(o,"invoice.payment_failed",failure,TIME+100)).action,"ignore");
  assert.equal((await state(o)).user.subscription_status,"active");
  assert.equal((await send(o,"invoice.payment_failed",failure,TIME+31*DAY)).action,"suspend");
  const result=await state(o);
  assert.equal(result.ent[0].status,"past_due");
  assert.equal(result.user.subscription_status,"past_due");
  assert.equal(result.user.tier_expires_at?.getTime(),(TIME+30*DAY)*1000);
  assert.equal((await send(o,"invoice.paid",invoice(o),TIME+29*DAY)).action,"ignore");
  assert.equal((await state(o)).user.subscription_status,"past_due");
});

test("subscription cancellation disables only its matching paid entitlement and rejects stale restoration",async()=>{
  const o=await order("founder");
  await send(o,"invoice.paid",invoice(o),TIME+1);
  const deletion={id:o.subscription,customer:o.customer};
  assert.equal((await send(o,"customer.subscription.deleted",deletion,TIME+32*DAY)).action,"expire");
  const s=await state(o);
  assert.equal(s.user.subscription_status,"cancelled");
  assert.equal(s.ent[0].status,"expired");
  assert.equal((await send(o,"invoice.paid",invoice(o,TIME+30*DAY),TIME+30*DAY)).action,"ignore");
});

test("legacy paid accounts fail closed; event audit and account changes roll back together",async()=>{
  const o=await order("founder","premium");
  const s=sign("invoice.paid",invoice(o),TIME+1);
  const decision=await processSignedLiveStripeEvent(pool,o.id,s.payload,s.signature,secret,
    applyVerifiedLiveMembershipEntitlement);
  assert.equal(decision.action,"review");
  assert.match(decision.reason,/Existing customer tier needs review/);
  const actual=await state(o);
  assert.equal(actual.ent.length,0);
  assert.equal(actual.audit.length,1);
  assert.equal(actual.audit[0].decision,"review");
  const queued=await pool.query(
    "SELECT status,reason FROM member_stripe_live_reviews WHERE stripe_event_id=$1",
    [decision.eventId]);
  assert.equal(queued.rows[0].status,"pending");
  assert.match(queued.rows[0].reason,/Existing customer tier needs review/);
  assert.equal(actual.user.subscription_tier,"premium");
  assert.equal(actual.user.subscription_status,"active");
});

test("wrong user, amount or provider reference can never grant a membership",async()=>{
  const o=await order("founder");
  assert.equal((await send(o,"invoice.paid",{...invoice(o),amount_paid:50},TIME+1)).action,"review");
  assert.equal((await state(o)).ent.length,0);
  const tamper=sign("invoice.paid",invoice(o),TIME+2);
  await assert.rejects(()=>processSignedLiveStripeEvent(pool,o.id,tamper.payload.replace(o.amount.toString(),"9"),
    tamper.signature,secret,applyVerifiedLiveMembershipEntitlement),/signature/i);
  assert.equal((await state(o)).ent.length,0);
});


test("unreconciled partial refund freezes later paid-invoice grants and produces durable admin review",async()=>{
  const o=await order("founder");
  const paid=await send(o,"invoice.paid",invoice(o),TIME+1);
  assert.equal(paid.action,"activate");
  const dispute=await send(o,"charge.refunded",{
    customer:o.customer,payment_intent:o.intent,
    amount:o.amount,amount_refunded:100,currency:"gbp",
  },TIME+100);
  assert.equal(dispute.action,"review");
  const queued=await pool.query("SELECT status,reason FROM member_stripe_live_reviews WHERE stripe_event_id=$1",
    [dispute.eventId]);
  assert.equal(queued.rowCount,1);
  assert.equal(queued.rows[0].status,"pending");
  assert.match(queued.rows[0].reason,/Partial refund/);
  const next=await send(o,"invoice.paid",invoice(o,TIME+30*DAY),TIME+30*DAY+1);
  assert.equal(next.action,"review");
  assert.match(next.reason,/Unresolved billing dispute/);
  const after=await state(o);
  assert.equal(after.ent.length,1);
  assert.equal(after.ent[0].ends_at.getTime(),(TIME+30*DAY)*1000);
  assert.equal(after.user.tier_expires_at?.getTime(),(TIME+30*DAY)*1000);
  const retry=await send(o,"invoice.paid",invoice(o,TIME+30*DAY),TIME+30*DAY+10);
  assert.equal(retry.action,"review");
});

test("full pass refund atomically suspends membership, while dispute without verified customer is held for review",async()=>{
  const o=await order("founder_pass_90d");
  await send(o,"checkout.session.completed",pass(o),TIME);
  const chargeback=await send(o,"charge.dispute.created",{
    id:"du_test_without_customer",payment_intent:o.intent,
    amount:o.amount,currency:"gbp",
  },TIME+10);
  assert.equal(chargeback.action,"review");
  assert.equal((await state(o)).user.subscription_status,"active",
    "An unattributed dispute must not be used for automatic access changes");
  const o2=await order("founder_pass_90d");
  await send(o2,"checkout.session.completed",pass(o2),TIME);
  const refunded=await send(o2,"charge.refunded",{
    id:"ch_test_refunded",customer:o2.customer,payment_intent:o2.intent,
    amount:o2.amount,amount_refunded:o2.amount,currency:"gbp",
  },TIME+100);
  assert.equal(refunded.action,"suspend");
  const state2=await state(o2);
  assert.equal(state2.ent.length,1);
  assert.equal(state2.ent[0].status,"past_due");
  assert.equal(state2.user.subscription_status,"past_due");
  assert.equal(state2.user.tier_expires_at.getTime(),(TIME+90*DAY)*1000);
});

test("parallel Checkout requests reserve only one chargeable session per founder",async()=>{
  const user="founder_"+randomUUID().replaceAll("-","");
  await pool.query("INSERT INTO users(id) VALUES($1)",[user]);
  const newOrder={
    orderId:randomUUID(),userId:user,sku:"founder" as const,
    customerId:"cus_"+randomUUID().replaceAll("-"),
    priceId:"price_"+randomUUID().replaceAll("-"),
    expectedPence:6900,currency:"gbp" as const,
  };
  const result=await Promise.allSettled(Array.from({length:5},(_,i)=>
    reserveLiveCheckout(pool,{...newOrder,orderId:randomUUID()})));
  assert.equal(result.filter(x=>x.status==="fulfilled").length,1);
  assert.equal(result.filter(x=>x.status==="rejected").length,4);
  for(const rejected of result.filter(x=>x.status==="rejected") as PromiseRejectedResult[]){
    assert.ok(rejected.reason instanceof LiveCheckoutConflict);
  }
  const stored=await pool.query<{id:string;stripe_checkout_session_id:string}>(
    "SELECT id,stripe_checkout_session_id FROM member_stripe_live_orders WHERE user_id=$1",[user]);
  assert.equal(stored.rows.length,1);
  assert.equal(stored.rows[0].stripe_checkout_session_id,"cs_pending_"+stored.rows[0].id);
  await recordCreatedLiveCheckout(pool,stored.rows[0].id,"cs_live_qa_recorded");
  const bound=await pool.query("SELECT stripe_checkout_session_id FROM member_stripe_live_orders WHERE id=$1",
    [stored.rows[0].id]);
  assert.equal(bound.rows[0].stripe_checkout_session_id,"cs_live_qa_recorded");
  await assert.rejects(()=>recordCreatedLiveCheckout(pool,stored.rows[0].id,"cs_live_again"),
    /could not be bound/);
});

test("legacy paid member cannot start Stripe live checkout",async()=>{
  const user="legacy_"+randomUUID().replaceAll("-","");
  await pool.query("INSERT INTO users(id,subscription_tier,subscription_status) VALUES($1,'premium','active')",[user]);
  await assert.rejects(()=>reserveLiveCheckout(pool,{
    orderId:randomUUID(),userId:user,sku:"founder",customerId:"cus_test_legacy",
    priceId:"price_test_legacy",expectedPence:6900,currency:"gbp",
  }),/Existing membership must be reconciled/);
  const found=await pool.query("SELECT id FROM member_stripe_live_orders WHERE user_id=$1",[user]);
  assert.equal(found.rowCount,0);
});
