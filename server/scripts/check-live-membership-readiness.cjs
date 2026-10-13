/**
 * Production membership preflight. ZERO Stripe charges, customers or writes.
 * Disabled release prints NO-GO without querying Stripe or modifying users.
 * Once explicitly activated, refuses wrong service, sandbox key, inactive
 * prices, missing webhook, missing signed payment ledger or tax uncertainty.
 */
const {Pool}=require("pg");
const Stripe=require("stripe");
const env=process.env;
function approved(e=env){
 return e.IFVA_MEMBER_LIVE_ENABLED==="true" &&
 e.IFVA_MEMBER_LIVE_RELEASE_APPROVED==="true" &&
 e.IFVA_MEMBER_LIVE_TAX_SIGNOFF==="approved" &&
 e.IFVA_MEMBER_LIVE_CONSUMER_TERMS_SIGNOFF==="approved" &&
 typeof e.IFVA_MEMBER_LIVE_TERMS_VERSION==="string" &&
 e.IFVA_MEMBER_LIVE_TERMS_VERSION.length>=6 &&
 e.RAILWAY_PROJECT_ID==="22a033f9-9732-4499-ae97-b509b17354d9" &&
 e.RAILWAY_ENVIRONMENT_ID==="3a9754e3-575c-4e29-b9a3-8af50a5ef823" &&
 e.RAILWAY_SERVICE_ID==="a1aa2612-9af3-481a-8e67-4ddb488c56a0" &&
 e.RAILWAY_ENVIRONMENT_NAME==="production" &&
 e.NODE_ENV==="production";
}
async function main(){
 if(!approved()){
  console.log("[MEMBER LIVE PREFLIGHT] NO-GO: live membership disabled/not fully approved. No live API calls.");
  return;
 }
 const key=env.IFVA_MEMBER_STRIPE_LIVE_SECRET_KEY||"";
 const signing=env.IFVA_MEMBER_STRIPE_LIVE_WEBHOOK_SECRET||"";
 if(!key.startsWith("sk_live_")||!signing.startsWith("whsec_"))
  throw Error("Dedicated LIVE Stripe API/signature credentials missing");
 if(env.IFVA_MEMBER_STRIPE_LIVE_PUBLIC_URL!=="https://innovatorfoundervisaassistant.co.uk")
  throw Error("Live membership checkout must return only to the canonical domain");
 const dbUrl=new URL(env.DATABASE_URL||"");
 if(!dbUrl.hostname.endsWith(".railway.internal"))
  throw Error("Expected production private PostgreSQL");
 const stripe=new Stripe(key,{apiVersion:"2025-08-27.basil"});
 const acct=await stripe.accounts.retrieve();
 if(acct.id!=="acct_1SdAGzK9BSTYpDOq")throw Error("Wrong live Stripe account");
 const prices=[
  ["founder",env.IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID,6900,true],
  ["founder_pro",env.IFVA_MEMBER_STRIPE_LIVE_PRO_PRICE_ID,11900,true],
  ["founder_pass_90d",env.IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID,15900,false],
 ];
 const seen=new Set();
 for(const [sku,priceId,amount,recurring] of prices){
  if(typeof priceId!=="string"||!/^price_[A-Za-z0-9]+$/.test(priceId)||seen.has(priceId))
   throw Error(sku+" missing/duplicate live Stripe price");
  seen.add(priceId);
  const p=await stripe.prices.retrieve(priceId,{expand:["product"]});
  if(!p.livemode||!p.active||p.tax_behavior!=="inclusive"||
      p.currency!=="gbp"||p.unit_amount!==amount||
      (recurring && !(p.type==="recurring"&&p.recurring?.interval==="month"&&p.recurring?.interval_count===1))||
      (!recurring && p.type!=="one_time")||
      !p.product||typeof p.product==="string"||(p.product).active!==true)
    throw Error(sku+" not an active VAT-inclusive approved live membership price/product");
  console.log("[MEMBER LIVE PREFLIGHT] Verified live price for "+sku);
 }
 const hooks=await stripe.webhookEndpoints.list({limit:100});
 const live=hooks.data.filter(w=>w.status==="enabled" &&
  w.url==="https://innovatorfoundervisaassistant.co.uk/api/member-stripe-live/webhook");
 if(live.length!==1)throw Error("Exactly one dedicated live membership webhook is required");
 const events=["checkout.session.completed","checkout.session.async_payment_succeeded",
  "invoice.paid","invoice.payment_failed","customer.subscription.deleted",
  "charge.refunded","charge.dispute.created"];
 for(const evt of events)if(!live[0].enabled_events.includes(evt))throw Error("Missing signed event "+evt);
 const pool=new Pool({connectionString:env.DATABASE_URL,max:1});
 try{
  const required=["users","member_ai_entitlements","member_ai_quota_reservations",
   "member_stripe_live_orders","member_stripe_live_events",
   "member_stripe_live_reviews","member_stripe_live_unmatched_events",
   "member_stripe_live_invoice_payments"];
  const rows=await pool.query(
   "SELECT name,to_regclass('public.'||name) AS relation FROM unnest($1::text[]) AS t(name)",
   [required]);
  for(const row of rows.rows)if(!row.relation)throw Error("Missing migration "+row.name);
 }finally{await pool.end();}
 console.log("[MEMBER LIVE PREFLIGHT] PASS: live signature, customer-price and ledger readiness; no charges");
}
if(require.main===module)main().catch(err=>{
 console.error("[MEMBER LIVE PREFLIGHT] BLOCKED: "+String(err?.message||"unknown"));
 process.exitCode=1;
});
module.exports={approved};
