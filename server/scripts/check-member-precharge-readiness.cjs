/**
 * PRE-CHARGE PRODUCTION READINESS.
 * Safe while new memberships and Stripe webhook are disabled.
 * Read-only calls to Stripe: accounts.retrieve, prices.retrieve,
 * webhookEndpoints.list. Read-only SQL: to_regclass.
 * NEVER creates a customer, Checkout Session, charge, event, or entitlement.
 * Never prints secrets, DB credentials or Stripe errors containing secrets.
 */
const {Pool}=require("pg");
const Stripe=require("stripe");
const env=process.env;
const REQUIRED_TABLES=[
 "users","member_ai_entitlements","member_ai_quota_reservations",
 "member_stripe_live_orders","member_stripe_live_events",
 "member_stripe_live_reviews","member_stripe_live_unmatched_events",
 "member_stripe_live_invoice_payments",
];
const LIVE_PRICE_CHECKS=[
 ["founder","IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID",6900,"recurring"],
 ["founder_pro","IFVA_MEMBER_STRIPE_LIVE_PRO_PRICE_ID",11900,"recurring"],
 ["founder_pass_90d","IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID",15900,"one_time"],
];
const EVENTS=[
 "checkout.session.completed","checkout.session.async_payment_succeeded",
 "invoice.paid","invoice.payment_failed","customer.subscription.deleted",
 "charge.refunded","charge.dispute.created",
];
function validLegalSeller(account){
 return account.id==="acct_1SdAGzK9BSTYpDOq" &&
  account.country==="GB" && account.business_type==="company" &&
  (account.company?.name||"").trim().replace(/\s+/g," ").toUpperCase()==="STACKRISE LTD";
}
async function main(){
 if(env.RAILWAY_ENVIRONMENT_NAME!=="production" ||
    env.RAILWAY_PROJECT_ID!=="22a033f9-9732-4499-ae97-b509b17354d9" ||
    env.RAILWAY_SERVICE_ID!=="a1aa2612-9af3-481a-8e67-4ddb488c56a0")
  throw Error("Wrong service or environment");
 const key=env.IFVA_MEMBER_STRIPE_LIVE_SECRET_KEY||"";
 if(!/^(?:sk|rk)_live_/.test(key))throw Error("Dedicated Stripe LIVE API key missing or invalid");
 if(!/^whsec_/.test(env.IFVA_MEMBER_STRIPE_LIVE_WEBHOOK_SECRET||""))
  throw Error("Dedicated membership signing secret missing");
 if(env.IFVA_MEMBER_STRIPE_LIVE_PUBLIC_URL!=="https://innovatorfoundervisaassistant.co.uk")
  throw Error("Canonical production URL mismatch");
 const stripe=new Stripe(key,{apiVersion:"2025-08-27.basil",maxNetworkRetries:1,timeout:12000});
 const acct=await stripe.accounts.retrieve();
 if(!validLegalSeller(acct))throw Error("Merchant not verified as UK STACKRISE LTD");
 if(acct.charges_enabled!==true)throw Error("Stripe account charges disabled");
 if(acct.requirements?.currently_due?.length || acct.requirements?.past_due?.length)
  throw Error("Stripe account has outstanding business verification");
 console.log("[IFVA PRECHARGE] Live Stripe key authenticated for verified STACKRISE LTD account");
 for(const [sku,keyName,expectedPence,expectedType] of LIVE_PRICE_CHECKS){
  const priceId=env[keyName]||"";
  if(!/^price_[A-Za-z0-9]+$/.test(priceId))throw Error("Missing price ID: "+sku);
  const price=await stripe.prices.retrieve(priceId,{expand:["product"]});
  if(!price.active||!price.livemode||price.unit_amount!==expectedPence||
     price.currency!=="gbp"||price.type!==expectedType||
     price.tax_behavior!=="unspecified"||
     (expectedType==="recurring" &&
      (price.recurring?.interval!=="month"||price.recurring?.interval_count!==1))||
     !price.product||typeof price.product==="string"||price.product.active!==true)
    throw Error("Stripe price/product does not match published membership: "+sku);
  console.log("[IFVA PRECHARGE] Verified "+sku+" product/price");
 }
 const hooks=await stripe.webhookEndpoints.list({limit:100});
 const targets=hooks.data.filter(x=>
  x.url==="https://innovatorfoundervisaassistant.co.uk/api/member-stripe-live/webhook");
 if(targets.length!==1||!targets[0].livemode)
  throw Error("Missing or duplicate dedicated LIVE membership webhook");
 for(const event of EVENTS)if(!targets[0].enabled_events.includes(event))
  throw Error("Missing webhook subscription: "+event);
 console.log("[IFVA PRECHARGE] Webhook configured; current status="+targets[0].status+
  " (not counted as verified fulfilment)");
 const dbUrl=env.DATABASE_URL||"";
 if(!dbUrl)throw Error("Production database URL missing");
 const db=new Pool({connectionString:dbUrl,max:1,connectionTimeoutMillis:8000});
 try{
  const q=await db.query(
   "SELECT name,to_regclass('public.'||name) AS relation FROM unnest($1::text[]) AS t(name)",
   [REQUIRED_TABLES]);
  const missing=q.rows.filter(x=>!x.relation).map(x=>x.name);
  if(missing.length)throw Error("Missing production membership SQL tables: "+missing.join(","));
 }finally{await db.end();}
 console.log("[IFVA PRECHARGE] PASS: authenticated key, products/prices, webhook configuration and SQL tables. ZERO charges. Live fulfilment still unverified.");
}
if(require.main===module)main().catch(err=>{
 const e=err instanceof Error?err:null;
 const publicMessage=(e?.type==="StripeAuthenticationError"?"Stripe API key authentication failed":
  e?.type==="StripePermissionError"?"Stripe API key permission missing":
  e?.type==="StripeInvalidRequestError"?"Stripe API request rejected or restricted permission missing":
  e?.message?.startsWith("Missing production membership SQL tables:")?e.message:
  e?.message?.startsWith("Stripe ")?e.message:
  e?.message?.startsWith("Merchant ")?e.message:
  e?.message?.startsWith("Missing ")?e.message:"Production read-only preflight failed");
 console.error("[IFVA PRECHARGE] BLOCKED: "+publicMessage);
 process.exitCode=1;
});
module.exports={validLegalSeller,REQUIRED_TABLES,LIVE_PRICE_CHECKS};
