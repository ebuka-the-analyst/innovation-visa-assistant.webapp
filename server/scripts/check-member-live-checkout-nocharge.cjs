/**
 * Opt-in production Checkout smoke: validates the member restricted API key
 * can create hosted Checkout Sessions. NEVER takes a payment.
 * All created Checkout Sessions are expired and the temporary Customer deleted.
 * Opt in only via IFVA_MEMBER_NOCHARGE_SMOKE_RUN=true; default is NO-OP.
 */
const Stripe=require("stripe");
const env=process.env;
async function main(){
 if(env.IFVA_MEMBER_NOCHARGE_SMOKE_RUN!=="true"){
  console.log("[IFVA NO-CHARGE] SKIPPED: one-time opt-in is not set");
  return;
 }
 if(env.RAILWAY_PROJECT_ID!=="22a033f9-9732-4499-ae97-b509b17354d9" ||
    env.RAILWAY_ENVIRONMENT_NAME!=="production" ||
    env.RAILWAY_SERVICE_ID!=="a1aa2612-9af3-481a-8e67-4ddb488c56a0")
  throw Error("Wrong execution environment");
 const key=env.IFVA_MEMBER_STRIPE_LIVE_SECRET_KEY||"";
 if(!/^(?:sk|rk)_live_/.test(key))throw Error("Live restricted Stripe key missing");
 const stripe=new Stripe(key,{apiVersion:"2025-08-27.basil",maxNetworkRetries:1,timeout:15000});
 const account=await stripe.accounts.retrieve();
 if(account.id!=="acct_1SdAGzK9BSTYpDOq" ||account.country!=="GB" ||
    account.business_type!=="company" ||
    (account.company?.name||"").toUpperCase().trim()!=="STACKRISE LTD")
  throw Error("Legal merchant account mismatch");
 let customerId=null;const sessions=[];
 let smokeError=null;let cleanupError=null;
 try{
  const customer=await stripe.customers.create({
    metadata:{ifvaNoChargeSmoke:"true",purpose:"CHECKOUT_PERMISSIONS_ONLY_NO_PAYMENT"},
  },{idempotencyKey:"ifva-nocharge-customer-"+Date.now()});
  customerId=customer.id;
  for(const [sku,priceVar,mode] of [
    ["founder","IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID","subscription"],
    ["founder_pass_90d","IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID","payment"],
  ]){
    const session=await stripe.checkout.sessions.create({
      mode,customer:customerId,
      line_items:[{price:env[priceVar],quantity:1}],
      billing_address_collection:"required",
      shipping_address_collection:{allowed_countries:["GB"]},
      automatic_tax:{enabled:false},
      customer_update:{address:"auto"},
      success_url:"https://innovatorfoundervisaassistant.co.uk/pricing?smoke=completed",
      cancel_url:"https://innovatorfoundervisaassistant.co.uk/pricing?smoke=cancelled",
      metadata:{ifvaNoChargeSmoke:"true",noPaymentEverAuthorised:"true"},
    },{idempotencyKey:"ifva-nocharge-session-"+sku+"-"+Date.now()});
    sessions.push(session.id);
    if(!session.id?.startsWith("cs_live_")||
       !session.url?.startsWith("https://checkout.stripe.com/")||
       session.payment_status!=="unpaid")
      throw Error("Stripe failed to create unpaid LIVE hosted session for "+sku);
    await stripe.checkout.sessions.expire(session.id);
    sessions.pop();
    console.log("[IFVA NO-CHARGE] PASS: "+sku+" hosted checkout created and expired without payment");
  }
 }catch(err){smokeError=err;}
 finally{
  for(const id of sessions){
   try{await stripe.checkout.sessions.expire(id);}catch(_){cleanupError=true;}
  }
  if(customerId){
   try{await stripe.customers.del(customerId);}catch(_){cleanupError=true;}
  }
 }
 if(cleanupError)throw Error("Temporary Stripe resource cleanup failed; inspect and expire any outstanding no-charge session before enabling customers");
 if(smokeError)throw smokeError;
 console.log("[IFVA NO-CHARGE] PASS: 2 LIVE Checkout modes, 0 payments or customer access granted");
}
if(require.main===module)main().catch(err=>{
 const status=err?.statusCode===403?"Stripe restricted-key permission denied":
  err?.statusCode===401?"Stripe restricted-key authentication denied":
  err?.type==="StripeInvalidRequestError"?"Stripe Checkout request rejected":
  "Production no-charge Checkout verification failed";
 console.error("[IFVA NO-CHARGE] BLOCKED: "+status);
 process.exitCode=1;
});
