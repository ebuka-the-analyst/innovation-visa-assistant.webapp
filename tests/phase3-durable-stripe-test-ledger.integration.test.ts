import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Pool } from "pg";
import Stripe from "stripe";
import { getEffectiveTestPaidState, processSignedTestStripeEvent } from "../server/phase3/durableStripeTestLedger";
import { recordUnmatchedSignedTestEvent } from "../server/phase3/memberStripeUnmatchedQa";

const connectionString = process.env.QUOTA_TEST_DATABASE_URL;
if (!connectionString) throw new Error("Disposable QUOTA_TEST_DATABASE_URL required");
const schema = "phase3_stripe_" + randomUUID().replaceAll("-", "");
const admin = new Pool({ connectionString, max: 1 });
const pool = new Pool({ connectionString, max: 6, options: "-c search_path=" + schema + ",public" });
const stripe = new Stripe("sk_test_offline_only", { apiVersion: "2025-08-27.basil" });
const secret = "whsec_dedicated_offline_test_fixture";
const TIME = 1800000000;

function sign(type: string, obj: Record<string,unknown>, id: string, created = TIME, livemode = false) {
  const payload = JSON.stringify({
    id, type, created, livemode, object: "event", data: { object: obj },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return { payload, signature };
}
async function makeOrder(sku: "founder"|"founder_pro"|"founder_pass_90d") {
  const suffix = randomUUID().replaceAll("-", "");
  const customer = "cus_" + suffix;
  const session = "cs_test_" + suffix;
  const subscription = "sub_" + suffix;
  const intent = "pi_" + suffix;
  const price = "price_" + suffix;
  const pence = sku === "founder" ? 6900 : sku === "founder_pro" ? 11900 : 15900;
  const result = await pool.query<{id:string}>(
    `INSERT INTO member_stripe_test_orders
     (user_id,sku,stripe_customer_id,stripe_checkout_session_id,
      stripe_subscription_id,stripe_payment_intent_id,stripe_price_id,expected_pence)
     VALUES ('test-user',$1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [sku,customer,session,sku === "founder_pass_90d" ? null : subscription,intent,price,pence],
  );
  return { id: result.rows[0].id, sku, customer, session, subscription, intent, price, pence };
}
type Order = Awaited<ReturnType<typeof makeOrder>>;
function paidPass(o:Order) {
  return { id:o.session, customer:o.customer, mode:"payment", payment_status:"paid",
    currency:"gbp", amount_total:o.pence, payment_intent:o.intent };
}
function invoice(o:Order) {
  return { id:"in_" + randomUUID(), customer:o.customer, subscription:o.subscription,
    status:"paid", paid_out_of_band:false, currency:"gbp", amount_paid:o.pence,
    collection_method:"charge_automatically",amount_remaining:0,
    lines:{ data:[{price:{id:o.price},period:{start:TIME,end:TIME+30*86400}}] } };
}
async function send(o:Order,type:string,obj:Record<string,unknown>,id:string,created=TIME,livemode=false) {
  const signed=sign(type,obj,id,created,livemode);
  return processSignedTestStripeEvent(pool,o.id,signed.payload,signed.signature,secret);
}

test.before(async()=>{
  await admin.query('CREATE SCHEMA "' + schema + '"');
  await pool.query("CREATE TABLE users (id VARCHAR PRIMARY KEY)");
  await pool.query("INSERT INTO users (id) VALUES ('test-user')");
  await pool.query(readFileSync(new URL("../migrations/qa/20261012_member_stripe_test_ledger.sql", import.meta.url),"utf8"));
});

test("real PostgreSQL transaction makes simultaneous retries grant exactly once", async()=>{
  const o=await makeOrder("founder_pass_90d");
  const id="evt_" + randomUUID();
  const results=await Promise.all(Array.from({length:6},()=>send(o,"checkout.session.completed",paidPass(o),id)));
  assert.equal(results.filter(r=>r.action==="activate").length,1);
  assert.equal(results.filter(r=>r.duplicate).length,5);
  const another=await send(o,"checkout.session.async_payment_succeeded",
    paidPass(o),"evt_"+randomUUID(),TIME+600);
  assert.equal(another.action,"ignore","Second success event must not restart 90-day pass");
  const count=await pool.query("SELECT COUNT(*)::int AS n FROM member_stripe_test_events WHERE order_id=$1",[o.id]);
  assert.equal(count.rows[0].n,2);
  const window=await pool.query("SELECT EXTRACT(EPOCH FROM paid_through)::bigint AS expiry FROM member_stripe_test_orders WHERE id=$1",[o.id]);
  assert.equal(Number(window.rows[0].expiry),TIME+90*86400,"Expiry cannot shift from a follow-on event");
  assert.equal((await getEffectiveTestPaidState(pool,o.id,new Date((TIME+10)*1000))).active,true);
  assert.equal((await getEffectiveTestPaidState(pool,o.id,new Date((TIME+90*86400)*1000))).active,false);
});

test("tampering and live-mode events cannot reach or mutate the ledger",async()=>{
  const o=await makeOrder("founder_pass_90d");
  const signed=sign("checkout.session.completed",paidPass(o),"evt_"+randomUUID());
  await assert.rejects(
    processSignedTestStripeEvent(pool,o.id,signed.payload.replace("15900","1"),signed.signature,secret),
    /signature/i,
  );
  await assert.rejects(
    send(o,"checkout.session.completed",paidPass(o),"evt_"+randomUUID(),TIME,true),
    /Live Stripe events forbidden/i,
  );
  const count=await pool.query("SELECT COUNT(*)::int AS n FROM member_stripe_test_events WHERE order_id=$1",[o.id]);
  assert.equal(count.rows[0].n,0);
});

test("no entitlement on checkout-only subscription; exact paid invoice and failure lifecycle",async()=>{
  const o=await makeOrder("founder");
  assert.equal((await send(o,"checkout.session.completed",{
    id:o.session,customer:o.customer,mode:"subscription",payment_status:"paid",
  },"evt_"+randomUUID())).action,"ignore");
  assert.equal((await getEffectiveTestPaidState(pool,o.id,new Date((TIME+100)*1000))).active,false);
  const paid=await send(o,"invoice.paid",invoice(o),"evt_"+randomUUID(),TIME+10);
  assert.equal(paid.action,"activate");
  const failed=await send(o,"invoice.payment_failed",{
    customer:o.customer,subscription:o.subscription,
  },"evt_"+randomUUID(),TIME+100);
  assert.equal(failed.action,"ignore");
  assert.equal((await getEffectiveTestPaidState(pool,o.id,new Date((TIME+100)*1000))).active,true);
  const later=await send(o,"invoice.payment_failed",{
    customer:o.customer,subscription:o.subscription,
  },"evt_"+randomUUID(),TIME+31*86400);
  assert.equal(later.action,"suspend");
  assert.equal((await getEffectiveTestPaidState(pool,o.id,new Date((TIME+31*86400)*1000))).active,false);
});

test("newer cancellation beats old paid invoices; mismatches go to durable review",async()=>{
  const o=await makeOrder("founder_pro");
  assert.equal((await send(o,"invoice.paid",invoice(o),"evt_"+randomUUID(),TIME+5)).action,"activate");
  assert.equal((await send(o,"customer.subscription.deleted",{
    id:o.subscription,customer:o.customer,
  },"evt_"+randomUUID(),TIME+100)).action,"expire");
  assert.equal((await send(o,"invoice.paid",invoice(o),"evt_"+randomUUID(),TIME+20)).action,"ignore");
  assert.equal((await getEffectiveTestPaidState(pool,o.id,new Date((TIME+101)*1000))).active,false);
  assert.equal((await send(o,"invoice.paid",{
    ...invoice(o),customer:"cus_different",amount_paid:11900,
  },"evt_"+randomUUID(),TIME+200)).action,"review");
  const audits=await pool.query(
    "SELECT decision FROM member_stripe_test_events WHERE order_id=$1 ORDER BY event_created",[o.id],
  );
  assert.deepEqual(audits.rows.map(r=>r.decision),["activate","ignore","expire","review"]);
});

test("unmatched real-format signed Stripe events are durably retried without ever granting access",async()=>{
  const signed=sign("charge.dispute.created",{
    id:"du_unmatched_no_customer",charge:"ch_test_no_order",
    payment_intent:"pi_no_matching_order",
  },"evt_"+randomUUID());
  const id=await recordUnmatchedSignedTestEvent(
    pool,signed.payload,signed.signature,secret,
    "Signed dispute cannot match a trusted order");
  await recordUnmatchedSignedTestEvent(
    pool,signed.payload,signed.signature,secret,
    "Retry still cannot match trusted order");
  const record=await pool.query<{retries:number;status:string;event_type:string}>(`
    SELECT retries,status,event_type FROM member_stripe_test_unmatched_events
    WHERE stripe_event_id=$1`,[id]);
  assert.equal(record.rowCount,1);
  assert.equal(record.rows[0].retries,2);
  assert.equal(record.rows[0].status,"pending");
  assert.equal(record.rows[0].event_type,"charge.dispute.created");
  await assert.rejects(()=>recordUnmatchedSignedTestEvent(pool,
    signed.payload.replace("ch_test_no_order","ch_test_injected"),signed.signature,secret,
    "Untrusted event"),/signature/i);
  const another=sign("charge.dispute.created",{id:"du_live",charge:"ch_live"},"evt_"+randomUUID(),TIME,true);
  await assert.rejects(()=>recordUnmatchedSignedTestEvent(
    pool,another.payload,another.signature,secret,"Never trust LIVE event"),
    /Production Stripe events forbidden/);
  const total=await pool.query(`
    SELECT COUNT(*)::integer AS n FROM member_stripe_test_orders
    WHERE stripe_payment_intent_id='pi_no_matching_order'`);
  assert.equal(total.rows[0].n,0);
});

test.after(async()=>{
  await pool.end();
  await admin.query('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE').catch(()=>{});
  await admin.end();
});
