/**
 * Runs before isolated QA app deployment. Verifies that Railway's redacted
 * Stripe credentials point to the same TEST account and exact three SKUs.
 * Does not create Stripe customers, sessions, charges or live subscriptions.
 */
const {Pool}=require("pg");
const Stripe=require("stripe");
const env=process.env;
async function main(){
  if(env.RAILWAY_PROJECT_ID!=="dbec1752-9b2a-4473-8fab-ddae38310c26"||
    env.RAILWAY_ENVIRONMENT_ID!=="5b20a1f5-8784-4463-bfe8-b435fa086a64"||
    env.RAILWAY_PROJECT_NAME!=="IFVA Phase 2 Isolated QA"||
    env.RAILWAY_ENVIRONMENT_NAME!=="staging"||
    env.NODE_ENV!=="production"||
    env.IFVA_MEMBER_STRIPE_QA_ENABLED!=="true"){
      throw Error("Refusing Stripe validation outside isolated QA");
  }
  const key=env.IFVA_MEMBER_STRIPE_TEST_SECRET_KEY||"";
  const whsec=env.IFVA_MEMBER_STRIPE_TEST_WEBHOOK_SECRET||"";
  if(!key.startsWith("sk_test_")||!whsec.startsWith("whsec_"))throw Error("Missing TEST API key or signature secret");
  if(env.IFVA_MEMBER_STRIPE_TEST_PUBLIC_URL!=="https://ifva-membership-qa-staging.up.railway.app")
    throw Error("QA public URL does not match isolated deployment");
  const u=new URL(env.DATABASE_URL||"");
  if(!u.hostname.endsWith(".railway.internal"))throw Error("DB is not isolated Railway private endpoint");
  const stripe=new Stripe(key,{apiVersion:"2025-08-27.basil"});
  const products=[
   ["Founder",env.IFVA_MEMBER_STRIPE_TEST_FOUNDER_PRICE_ID,6900,true],
   ["Founder Pro",env.IFVA_MEMBER_STRIPE_TEST_PRO_PRICE_ID,11900,true],
   ["90-Day Pass",env.IFVA_MEMBER_STRIPE_TEST_PASS_PRICE_ID,15900,false],
  ];
  const account=await stripe.accounts.retrieve();
  if(account.livemode===true || account.id!=="acct_1SdAH8GYjzPLJJAI")throw Error("Wrong Stripe TEST account");
  for(const [label,priceId,amount,recurring] of products){
    if(typeof priceId!=="string"||!/^price_[A-Za-z0-9]+$/.test(priceId))throw Error(label+" missing test Price ID");
    const p=await stripe.prices.retrieve(priceId);
    const r=p.recurring;
    if(p.livemode||!p.active||p.currency!=="gbp"||p.unit_amount!==amount||
      (recurring && !(p.type==="recurring"&&r?.interval==="month"&&r?.interval_count===1))||
      (!recurring && p.type!=="one_time"))
        throw Error(label+" test Price mismatch");
    console.log("[QA STRIPE READINESS] "+label+" price verified; GBP "+amount+" pence");
  }
  const endpoints=await stripe.webhookEndpoints.list({limit:20});
  const active=endpoints.data.filter(w=>w.status==="enabled"&&
    w.url==="https://ifva-membership-qa-staging.up.railway.app/api/member-stripe-test/webhook");
  if(active.length!==1)throw Error("Expected exactly one enabled sandbox test webhook");
  const needed=["checkout.session.completed","checkout.session.async_payment_succeeded",
   "invoice.paid","invoice.payment_failed","customer.subscription.deleted",
   "charge.refunded","charge.dispute.created"];
  for(const t of needed)if(!active[0].enabled_events.includes(t))throw Error("Test webhook missing "+t);
  console.log("[QA STRIPE READINESS] One provider webhook with seven required events");
  const pool=new Pool({connectionString:env.DATABASE_URL,max:1});
  try{
    const names=["users","sessions","member_ai_entitlements","member_stripe_test_orders",
      "member_stripe_test_events","member_stripe_test_invoice_payments"];
    const results=await pool.query("SELECT unnest($1::text[]) as name,to_regclass('public.' || unnest($1::text[])) as relation",[names]);
    for(const row of results.rows)if(!row.relation)throw Error("Missing QA table: "+row.name);
    console.log("[QA STRIPE READINESS] Isolated payment and membership tables present");
  }finally{await pool.end();}
  console.log("[QA STRIPE READINESS] Provider/ledger configuration PASS (payment-to-access transaction not yet tested)");
}
if(require.main===module)main().catch(e=>{
  console.error("[QA STRIPE READINESS] "+String(e.message||"unknown"));process.exitCode=1;
});
