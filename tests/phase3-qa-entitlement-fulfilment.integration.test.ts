import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import Stripe from "stripe";
import { Pool } from "pg";
import { processSignedTestStripeEvent } from "../server/phase3/durableStripeTestLedger";
import { applyVerifiedTestMembershipEntitlement } from "../server/phase3/memberEntitlementFulfilmentQa";
import { reserveTestCheckout, recordCreatedTestCheckout, TestCheckoutConflict } from "../server/phase3/memberStripeCheckoutReservationQa";
import { currentQuotaWindow } from "../server/services/memberAiQuota";

const url=process.env.QUOTA_TEST_DATABASE_URL;
if(!url)throw Error("Only disposable PostgreSQL CI database is permitted");
const schema="phase3_fulfilment_"+randomUUID().replaceAll("-","");
const root=new Pool({connectionString:url,max:1});
const pool=new Pool({connectionString:url,max:8,options:"-c search_path="+schema+",public"});
const stripe=new Stripe("sk_test_offline_qa_only",{apiVersion:"2025-08-27.basil"});
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
    INSERT INTO member_stripe_test_orders
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
function sign(type:string,obj:any,created:number,id=randomUUID(),live=false){
  const payload=JSON.stringify({id:"evt_"+id.replaceAll("-",""),type,created,
    livemode:live,object:"event",data:{object:obj}});
  return {payload,signature:stripe.webhooks.generateTestHeaderString({payload,secret})};
}
async function send(o:Order,type:string,obj:any,created:number,id?:string) {
  const s=sign(type,obj,created,id);
  return processSignedTestStripeEvent(pool,o.id,s.payload,s.signature,secret,
    applyVerifiedTestMembershipEntitlement);
}
async function state(o:Order) {
  const [us,ents,audit]=await Promise.all([
    pool.query<{subscription_tier:string;subscription_status:string;tier_expires_at:Date|null}>(
      "SELECT subscription_tier,subscription_status,tier_expires_at FROM users WHERE id=$1",[o.user]),
    pool.query<any>("SELECT * FROM member_ai_entitlements WHERE user_id=$1",[o.user]),
    pool.query<{decision:string}>(
      "SELECT decision FROM member_stripe_test_events WHERE order_id=$1",[o.id]),
  ]);
  return {user:us.rows[0],ent:ents.rows,audit:audit.rows};
}
test.before(async()=>{
  await root.query('CREATE SCHEMA "'+schema+'"');
  await pool.query(`CREATE TABLE users (
    id VARCHAR PRIMARY KEY, subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    subscription_status VARCHAR(20), tier_expires_at TIMESTAMPTZ)`);
  await pool.query(readFileSync(new URL("../migrations/app/20261011_member_ai_entitlements.sql",import.meta.url),"utf8"));
  await pool.query(readFileSync(new URL("../migrations/qa/20261012_member_stripe_test_ledger.sql",import.meta.url),"utf8"));
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
    processSignedTestStripeEvent(pool,o.id,s.payload,s.signature,secret,
      applyVerifiedTestMembershipEntitlement)));
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
  await assert.rejects(()=>processSignedTestStripeEvent(pool,o.id,s.payload,s.signature,secret,
    applyVerifiedTestMembershipEntitlement),/Existing customer tier needs review/);
  const actual=await state(o);
  assert.equal(actual.ent.length,0);
  assert.equal(actual.audit.length,0);
  assert.equal(actual.user.subscription_tier,"premium");
  assert.equal(actual.user.subscription_status,"active");
});

test("wrong user, amount or provider reference can never grant a membership",async()=>{
  const o=await order("founder");
  assert.equal((await send(o,"invoice.paid",{...invoice(o),amount_paid:50},TIME+1)).action,"review");
  assert.equal((await state(o)).ent.length,0);
  const tamper=sign("invoice.paid",invoice(o),TIME+2);
  await assert.rejects(()=>processSignedTestStripeEvent(pool,o.id,tamper.payload.replace(o.amount.toString(),"9"),
    tamper.signature,secret,applyVerifiedTestMembershipEntitlement),/signature/i);
  assert.equal((await state(o)).ent.length,0);
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
    reserveTestCheckout(pool,{...newOrder,orderId:randomUUID()})));
  assert.equal(result.filter(x=>x.status==="fulfilled").length,1);
  assert.equal(result.filter(x=>x.status==="rejected").length,4);
  for(const rejected of result.filter(x=>x.status==="rejected") as PromiseRejectedResult[]){
    assert.ok(rejected.reason instanceof TestCheckoutConflict);
  }
  const stored=await pool.query<{id:string;stripe_checkout_session_id:string}>(
    "SELECT id,stripe_checkout_session_id FROM member_stripe_test_orders WHERE user_id=$1",[user]);
  assert.equal(stored.rows.length,1);
  assert.equal(stored.rows[0].stripe_checkout_session_id,"cs_pending_"+stored.rows[0].id);
  await recordCreatedTestCheckout(pool,stored.rows[0].id,"cs_test_qa_recorded");
  const bound=await pool.query("SELECT stripe_checkout_session_id FROM member_stripe_test_orders WHERE id=$1",
    [stored.rows[0].id]);
  assert.equal(bound.rows[0].stripe_checkout_session_id,"cs_test_qa_recorded");
  await assert.rejects(()=>recordCreatedTestCheckout(pool,stored.rows[0].id,"cs_test_again"),
    /could not be bound/);
});

test("legacy paid member cannot start Stripe QA checkout",async()=>{
  const user="legacy_"+randomUUID().replaceAll("-","");
  await pool.query("INSERT INTO users(id,subscription_tier,subscription_status) VALUES($1,'premium','active')",[user]);
  await assert.rejects(()=>reserveTestCheckout(pool,{
    orderId:randomUUID(),userId:user,sku:"founder",customerId:"cus_test_legacy",
    priceId:"price_test_legacy",expectedPence:6900,currency:"gbp",
  }),/Existing membership must be reconciled/);
  const found=await pool.query("SELECT id FROM member_stripe_test_orders WHERE user_id=$1",[user]);
  assert.equal(found.rowCount,0);
});
