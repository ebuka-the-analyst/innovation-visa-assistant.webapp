/**
 * Production live membership gateway. All routes fail closed unless explicitly approved.
 *
 * Only the canonical production Railway service may use this module, and
 * only after explicit tax, consumer-terms and release flags. Stripe credentials,
 * event ledgers, and order IDs are separate from the tested sandbox gateway.
 * Signed live events are the sole route to live membership fulfilment.
 */
import type { Express, RequestHandler } from "express";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import {
  processSignedLiveStripeEvent, getEffectiveLivePaidState,
} from "./durableStripeLiveLedger";
import {
  EXPECTED_GBP_PENCE, type CandidateSku,
} from "./memberStripeLiveAcceptance";
import { applyVerifiedLiveMembershipEntitlement } from "./memberLiveEntitlementFulfilment";
import { reserveLiveCheckout, recordCreatedLiveCheckout, LiveCheckoutConflict } from "./memberStripeLiveCheckoutReservation";
import {chargeIdForSignedEvent,reconcileSignedChargeToProvider,ProviderChargeMismatch} from "./stripeLiveChargeReconciliation";
import {recordUnmatchedSignedLiveEvent} from "./memberStripeLiveUnmatched";
import {validatePaidInvoicePayment,PaidInvoiceMismatch,type VerifiedPaidInvoicePayment} from "./stripeLivePaidInvoiceMapping";
import { confirmedNewLiveMembershipPurchase } from "./memberStripeLiveCheckoutIntent";

type Config = {
  stripe: Stripe;
  secret: string;
  publicUrl: string;
  prices: Record<CandidateSku,string>;
};
const memberSkus: CandidateSku[] = ["founder","founder_pro","founder_pass_90d"];
const orderIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isMemberLiveGatewayAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  // Requiring exact production Railway IDs blocks staging/preview or a typo in a flag.
  // Tax and published consumer-terms sign-off are additional hard launch gates.
  return env.IFVA_MEMBER_LIVE_ENABLED === "true" &&
    env.IFVA_MEMBER_LIVE_RELEASE_APPROVED === "true" &&
    env.IFVA_MEMBER_LIVE_TAX_SIGNOFF === "approved" &&
    env.IFVA_MEMBER_LIVE_TAX_BASIS === "uk_not_vat_registered" &&
    env.IFVA_MEMBER_LIVE_CONSUMER_TERMS_SIGNOFF === "approved" &&
    typeof env.IFVA_MEMBER_LIVE_TERMS_VERSION === "string" &&
    env.IFVA_MEMBER_LIVE_TERMS_VERSION.length >= 6 &&
    env.RAILWAY_PROJECT_ID === "22a033f9-9732-4499-ae97-b509b17354d9" &&
    env.RAILWAY_ENVIRONMENT_ID === "3a9754e3-575c-4e29-b9a3-8af50a5ef823" &&
    env.RAILWAY_SERVICE_ID === "a1aa2612-9af3-481a-8e67-4ddb488c56a0" &&
    env.RAILWAY_ENVIRONMENT_NAME === "production" &&
    env.NODE_ENV === "production";
}

function config(): Config {
  const key=process.env.IFVA_MEMBER_STRIPE_LIVE_SECRET_KEY || "";
  const secret=process.env.IFVA_MEMBER_STRIPE_LIVE_WEBHOOK_SECRET || "";
  const publicUrl=process.env.IFVA_MEMBER_STRIPE_LIVE_PUBLIC_URL || "";
  const prices: Record<CandidateSku,string>={
    founder:process.env.IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID || "",
    founder_pro:process.env.IFVA_MEMBER_STRIPE_LIVE_PRO_PRICE_ID || "",
    founder_pass_90d:process.env.IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID || "",
  };
  if (!key.startsWith("sk_live_") || !secret.startsWith("whsec_") ||
      !Object.values(prices).every(v=>/^price_[a-zA-Z0-9]+$/.test(v))) {
    throw new Error("Dedicated LIVE Stripe key, webhook secret and three price IDs are required");
  }
  const url=new URL(publicUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      url.pathname !== "/" || url.hostname !== "innovatorfoundervisaassistant.co.uk") {
    throw new Error("Live-return host must match the exact authorised production domain");
  }
  return {stripe:new Stripe(key,{apiVersion:"2025-08-27.basil"}),secret,
    publicUrl:url.origin,prices};
}
function skuOf(value:unknown): CandidateSku | null {
  return typeof value==="string" && memberSkus.includes(value as CandidateSku)
    ? value as CandidateSku : null;
}
function asId(value:any):string | null {
  return typeof value==="string" ? value : typeof value?.id==="string" ? value.id : null;
}
function invoiceSub(invoice:any):string | null {
  const old=asId(invoice?.subscription);
  const modern=asId(invoice?.parent?.subscription_details?.subscription);
  if(old&&modern&&old!==modern)return null;
  return modern || old;
}

/**
 * Mount only on the exact approved production service. No live route is
 * exposed without the complete release/consumer/tax gate.
 */
export function registerMemberStripeLiveRoutes(
  app: Express, isAuthenticated: RequestHandler, pool: Pool,
  requireAdmin: RequestHandler,
): void {
  app.get("/api/member-stripe-live/availability",(_req,res)=>{
    res.setHeader("Cache-Control","no-store");
    return res.json({available:isMemberLiveGatewayAllowed(),
      termsVersion:isMemberLiveGatewayAllowed()?process.env.IFVA_MEMBER_LIVE_TERMS_VERSION:null});
  });
  if(!isMemberLiveGatewayAllowed()){
    // An unmounted POST falls through to the SPA handler, which could return
    // HTTP 200 and permanently acknowledge a paid Stripe event without
    // reconciling it. Always fail CLOSED so Stripe retries if routed here.
    const unavailable=(_req:any,res:any)=>{
      res.setHeader("Cache-Control","no-store");
      return res.status(503).json({
        received:false,error:"Membership live gateway is not approved or deployed",
      });
    };
    app.post("/api/member-stripe-live/webhook",unavailable);
    app.post("/api/member-stripe-live/checkout",unavailable);
    app.post("/api/member-stripe-live/cancel",unavailable);
    app.get("/api/member-stripe-live/order/:orderId",unavailable);
    app.get("/api/member-stripe-live/my-membership",unavailable);
    return;
  }

  app.post("/api/member-stripe-live/checkout",isAuthenticated,async(req,res)=>{
    const user=req.user as any;
    const sku=confirmedNewLiveMembershipPurchase(req.body);
    if(!user?.id || !sku || user.isEmailVerified !== true || user.isAdmin === true ||
       req.body?.acknowledgeLivePayment !== true ||
       req.body?.acknowledgeNoVatPrice !== true ||
       req.body?.acknowledgeConsumerTerms !== true ||
       req.body?.consumerTermsVersion !== process.env.IFVA_MEMBER_LIVE_TERMS_VERSION)
      return res.status(400).json({error:"Verified non-admin customer must acknowledge total price, no VAT charged and current consumer terms"});
    const email=String(user.email||"").trim();
    if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:"Verified email required"});
    try{
      const cfg=config();
      const price=await cfg.stripe.prices.retrieve(cfg.prices[sku]);
      const expectedRecurring=sku!=="founder_pass_90d";
      const account=await cfg.stripe.accounts.retrieve();
      if(account.id!=="acct_1SdAGzK9BSTYpDOq")
        return res.status(503).json({error:"Wrong Stripe LIVE account"});
      // Non-VAT-registered UK supplier: no VAT is collected or represented as included.
      // Reject legacy tax-inclusive candidate prices and never silently reuse them.
      if(price.tax_behavior!=="unspecified")return res.status(503).json({error:"Incorrect tax behaviour for approved non-VAT-registered checkout price"});
      if(!price.active || price.currency!=="gbp" ||
          price.unit_amount!==EXPECTED_GBP_PENCE[sku] ||
          (expectedRecurring && (price.type!=="recurring" ||
            price.recurring?.interval!=="month" || price.recurring?.interval_count!==1)) ||
          (!expectedRecurring && price.type!=="one_time")) {
        return res.status(503).json({error:"Stripe live price and advertised membership do not match"});
      }
      const orderId=randomUUID();
      const customer=await cfg.stripe.customers.create({email,metadata:{ifvaMembershipLive:"true"}});
      await reserveLiveCheckout(pool,{
        orderId,userId:user.id,sku,customerId:customer.id,
        priceId:cfg.prices[sku],expectedPence:EXPECTED_GBP_PENCE[sku],currency:"gbp",
      });
      const session=await cfg.stripe.checkout.sessions.create({
        mode:expectedRecurring?"subscription":"payment",
        customer:customer.id,
        client_reference_id:user.id,
        line_items:[{price:cfg.prices[sku],quantity:1}],
        billing_address_collection:"required",
        automatic_tax:{enabled:false},
        customer_update:{address:"auto"},
        // No VAT is charged in the approved UK non-VAT-registered release mode.
        // Do not open overseas digital-service sales until destination-tax obligations are reviewed.
        success_url:cfg.publicUrl+"/uk/innovatorfoundervisaassistant/dashboard?membership_order="+encodeURIComponent(orderId)+"&payment=return",
        cancel_url:cfg.publicUrl+"/uk/innovatorfoundervisaassistant/dashboard?membership_order="+encodeURIComponent(orderId)+"&payment=cancelled",
        metadata:{ifvaMembershipLive:"true",ifvaLiveOrderId:orderId,consumerTermsVersion:process.env.IFVA_MEMBER_LIVE_TERMS_VERSION||""},
        ...(expectedRecurring ? {
          subscription_data:{metadata:{ifvaMembershipLive:"true",ifvaLiveOrderId:orderId}},
        } : {}),
      });
      if(!session.id || !session.url)throw new Error("Stripe did not return a hosted checkout URL");
      // A trusted order exists BEFORE returning a chargeable Stripe URL.
      // If a webhook beats the session-ID update, return 503 so Stripe retries.
      await recordCreatedLiveCheckout(pool,orderId,session.id);
      res.status(201).json({orderId,sessionId:session.id,url:session.url,
        liveMode:true});
    }catch(e){
      if(e instanceof LiveCheckoutConflict) {
        return res.status(409).json({error:e.message});
      }
      console.error("[Membership LIVE] Checkout creation failed",e instanceof Error?e.message:"unknown");
      return res.status(503).json({error:"Stripe live Checkout unavailable; no membership activated"});
    }
  });

  app.get("/api/member-stripe-live/order/:orderId",isAuthenticated,async(req,res)=>{
    const user=req.user as any;
    if(!orderIdPattern.test(req.params.orderId||""))return res.status(404).end();
    const result=await pool.query<{id:string}>(`
      SELECT id FROM member_stripe_live_orders WHERE id=$1 AND user_id=$2`,
      [req.params.orderId,user?.id||""]);
    if(!result.rowCount)return res.status(404).end();
    const state=await getEffectiveLivePaidState(pool,req.params.orderId);
    res.setHeader("Cache-Control","no-store");
    res.json({orderId:req.params.orderId,liveMode:true,active:state.active,paidThrough:state.paidThrough});
  });

  // Customer-controlled cancellation preserves access until the period already paid for.
  // Only a provider-verified subscription owned by the authenticated account is eligible.
  app.get("/api/member-stripe-live/my-membership",isAuthenticated,async(req,res)=>{
    const user=req.user as any;
    if(!user?.id)return res.status(401).end();
    try{
      const result=await pool.query<{id:string;sku:CandidateSku;stripe_subscription_id:string|null;paid_through:Date|null;currently_active:boolean}>(`
        SELECT id,sku,stripe_subscription_id,paid_through,currently_active
        FROM member_stripe_live_orders WHERE user_id=$1
        ORDER BY currently_active DESC, created_at DESC LIMIT 1`,[user.id]);
      if(!result.rowCount)return res.json({membership:null});
      const order=result.rows[0];
      let cancellationPending=false;
      if(order.currently_active&&order.stripe_subscription_id){
        const cfg=config();
        const sub=await cfg.stripe.subscriptions.retrieve(order.stripe_subscription_id);
        cancellationPending=sub.livemode===true && sub.cancel_at_period_end===true;
      }
      res.setHeader("Cache-Control","no-store");
      return res.json({membership:{
        orderId:order.id,sku:order.sku,active:order.currently_active,
        paidThrough:order.paid_through,cancellationPending,
        canCancel:order.currently_active&&!!order.stripe_subscription_id&&!cancellationPending,
      }});
    }catch{return res.status(503).json({error:"Unable to retrieve verified membership status"});}
  });

  app.post("/api/member-stripe-live/cancel",isAuthenticated,async(req,res)=>{
    const user=req.user as any;
    if(!user?.id)return res.status(401).end();
    const id=typeof req.body?.orderId==="string"?req.body.orderId:"";
    if(!orderIdPattern.test(id))return res.status(400).json({error:"Invalid membership order"});
    try{
      const found=await pool.query<{
        id:string;stripe_subscription_id:string|null;stripe_customer_id:string;sku:CandidateSku;
      }>(`SELECT id,stripe_subscription_id,stripe_customer_id,sku FROM member_stripe_live_orders
           WHERE id=$1 AND user_id=$2 AND currently_active=true`,[id,user.id]);
      if(found.rowCount!==1||!found.rows[0].stripe_subscription_id||
         found.rows[0].sku==="founder_pass_90d")
        return res.status(404).json({error:"No cancellable monthly membership found"});
      const cfg=config();
      const order=found.rows[0];
      const sub=await cfg.stripe.subscriptions.retrieve(order.stripe_subscription_id);
      if(sub.livemode!==true||asId(sub.customer)!==order.stripe_customer_id)
        return res.status(409).json({error:"Provider subscription mismatch"});
      const cancelled=await cfg.stripe.subscriptions.update(sub.id,{
        cancel_at_period_end:true,proration_behavior:"none"
      },{idempotencyKey:"ifva-member-end-of-term-cancel-"+order.id});
      res.setHeader("Cache-Control","no-store");
      return res.json({cancelAtPeriodEnd:cancelled.cancel_at_period_end===true,
        status:cancelled.status,cancelAt:cancelled.cancel_at,
        message:"Renewal cancelled. Paid access continues through the current paid term."});
    }catch(e){
      console.error("[Membership LIVE] cancellation unavailable",e instanceof Error?e.message:"unknown");
      return res.status(503).json({error:"Could not verify cancellation. Contact support; do not assume it is complete."});
    }
  });

  app.get("/api/member-stripe-live/reviews",isAuthenticated,requireAdmin,async(_req,res)=>{
    try {
      const pending=await pool.query<{
        stripe_event_id:string;event_type:string;reason:string;created_at:Date;order_id:string;
      }>(`SELECT stripe_event_id,order_id,event_type,reason,created_at
          FROM member_stripe_live_reviews WHERE status='pending'
          ORDER BY created_at ASC LIMIT 100`);
      res.setHeader("Cache-Control","no-store");
      const unmatched=await pool.query<{
        stripe_event_id:string;event_type:string;reason:string;
        first_seen_at:Date;last_seen_at:Date;retries:number;
      }>(`SELECT stripe_event_id,event_type,reason,first_seen_at,last_seen_at,retries
          FROM member_stripe_live_unmatched_events WHERE status='pending'
          ORDER BY first_seen_at ASC LIMIT 100`);
      res.json({liveMode:true,count:pending.rows.length+unmatched.rows.length,
        reviews:pending.rows,unmatched:unmatched.rows});
    } catch {
      res.status(503).json({error:"live billing review inbox unavailable"});
    }
  });

  app.post("/api/member-stripe-live/webhook",async(req,res)=>{
    const rawBody=(req as any).rawBody;
    const signature=req.header("stripe-signature");
    if(!Buffer.isBuffer(rawBody) || !signature)return res.status(400).send("Missing signed raw event");
    let cfg:Config;let event:Stripe.Event;
    try{
      cfg=config();
      event=cfg.stripe.webhooks.constructEvent(rawBody,signature,cfg.secret);
      if(event.livemode!==true)throw new Error("Not a Stripe live-mode event");
    }catch{return res.status(400).send("Invalid signed test event");}
    const obj=event.data.object as any;
    let orderId:string|null=null;
    try{
      let verifiedChargeCustomer:string|null=null;
      let verifiedInvoicePayment:VerifiedPaidInvoicePayment|undefined;
      let rows:{id:string;user_id:string;stripe_customer_id:string;stripe_subscription_id:string|null;stripe_checkout_session_id:string;stripe_price_id:string;expected_pence:number;sku:CandidateSku;}[]=[];
      if(event.type==="checkout.session.completed" || event.type==="checkout.session.async_payment_succeeded"){
        const r=await pool.query(`
          SELECT id,user_id,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,stripe_price_id,expected_pence,sku
          FROM member_stripe_live_orders WHERE stripe_checkout_session_id=$1`,[obj.id]);
        rows=r.rows;
      }else if(event.type==="invoice.paid"||event.type==="invoice.payment_failed"||
          event.type==="customer.subscription.deleted"){
        const sub=event.type==="customer.subscription.deleted"?obj.id:invoiceSub(obj);
        if(sub){
          const r=await pool.query(`
            SELECT id,user_id,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,stripe_price_id,expected_pence,sku
            FROM member_stripe_live_orders WHERE stripe_subscription_id=$1`,[sub]);
          rows=r.rows;
          if(rows.length===0){
            // A first paid invoice may arrive before checkout.session.completed.
            // Re-fetch the provider subscription and validate its server-set
            // order reference, customer, and price BEFORE attaching it.
            const subscription=await cfg.stripe.subscriptions.retrieve(sub);
            const id=subscription.metadata?.ifvaLiveOrderId;
            const r2=orderIdPattern.test(id||"") ? await pool.query(`
              SELECT id,user_id,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,stripe_price_id,expected_pence,sku
              FROM member_stripe_live_orders WHERE id=$1`,[id]) : {rows:[]};
            if(r2.rows.length===1){
              const candidate=r2.rows[0];
              const activePrice=subscription.items?.data?.find(
                item=>item.price?.id===candidate.stripe_price_id);
              if(asId(subscription.customer)===candidate.stripe_customer_id &&
                 activePrice && candidate.sku!=="founder_pass_90d"){
                const bound=await pool.query(`
                  UPDATE member_stripe_live_orders SET stripe_subscription_id=$1
                  WHERE id=$2 AND stripe_subscription_id IS NULL`,[sub,candidate.id]);
                if(bound.rowCount===1) rows=[{...candidate,stripe_subscription_id:sub}];
              }
            }
          }
        }
      }else if(event.type==="charge.refunded"||event.type==="charge.dispute.created"){
        // Stripe dispute objects do not necessarily include customer. A
        // signed dispute is matched using a freshly fetched TEST Charge,
        // never email, browser metadata or a guessed account ID.
        const chargeId=chargeIdForSignedEvent(event.type,obj);
        const providerCharge=await cfg.stripe.charges.retrieve(chargeId);
        const confirmed=reconcileSignedChargeToProvider(event.type,obj,providerCharge);
        verifiedChargeCustomer=confirmed.customerId;
        const r=await pool.query(`
          SELECT id,user_id,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,stripe_price_id,expected_pence,sku
          FROM member_stripe_live_orders WHERE stripe_payment_intent_id=$1
          OR id IN (SELECT order_id FROM member_stripe_live_invoice_payments
                    WHERE stripe_payment_intent_id=$1)`,
          [confirmed.paymentIntentId]);
        rows=r.rows;
      }else{return res.json({received:true,ignored:true});}
      if(rows.length!==1) {
        await recordUnmatchedSignedLiveEvent(pool,rawBody,signature,cfg.secret,
          "No single trusted order for verified provider event");
        return res.status(503).send("Trusted live order not yet reconciled; retry");
      }
      const order=rows[0];orderId=order.id;
      if((verifiedChargeCustomer ?? asId(obj.customer))!==order.stripe_customer_id)
        return res.status(409).send("Stripe customer mismatch");
      if(event.type==="checkout.session.completed" ||
          event.type==="checkout.session.async_payment_succeeded"){
        // Stripe is authoritative for subscription or PaymentIntent, not
        // event metadata. Fetch to avoid trusting stale test payload fields.
        const session=await cfg.stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
        if(asId(session.customer)!==order.stripe_customer_id ||
            session.id!==obj.id || session.client_reference_id!==order.user_id ||
            session.metadata?.ifvaLiveOrderId!==order.id)
          return res.status(409).send("Provider checkout mismatch");
        const sub=asId(session.subscription);
        const intent=asId(session.payment_intent);
        if(order.sku==="founder_pass_90d" && intent){
          await pool.query(`UPDATE member_stripe_live_orders
            SET stripe_payment_intent_id=$1 WHERE id=$2 AND
            (stripe_payment_intent_id IS NULL OR stripe_payment_intent_id=$1)`,[intent,order.id]);
        }else if(order.sku!=="founder_pass_90d" && sub){
          await pool.query(`UPDATE member_stripe_live_orders
            SET stripe_subscription_id=$1 WHERE id=$2 AND
            (stripe_subscription_id IS NULL OR stripe_subscription_id=$1)`,[sub,order.id]);
        }
      }
      if(event.type==="invoice.paid"){
        // Only accept an invoice re-fetched directly from Stripe, not solely
        // the event envelope. A paid QA entitlement still requires the
        // separate signed-event decision and transactional membership writer.
        const fresh=await cfg.stripe.invoices.retrieve(obj.id,{expand:["payments"]});
        if(invoiceSub(fresh)!==order.stripe_subscription_id ||
            asId(fresh.customer)!==order.stripe_customer_id)
          return res.status(409).send("Provider invoice mismatch");
        // If provider API invoice changed since the event, refuse to confirm.
        const isPaid=fresh.status==="paid" && fresh.amount_remaining===0;
        if(!isPaid)return res.status(409).send("Provider invoice not settled");
        const p=(fresh as any).payments;
        // The 2025 Basil API associates invoices and PaymentIntents through
        // the expanded invoice.payments InvoicePayment objects.
        const paymentId=asId(p?.data?.[0]?.payment?.payment_intent);
        if(!paymentId)return res.status(409).send("Invoice PaymentIntent not verifiable");
        const intent=await cfg.stripe.paymentIntents.retrieve(paymentId);
        verifiedInvoicePayment=validatePaidInvoicePayment(fresh,intent,{
          userId:order.user_id,sku:order.sku,
          customerId:order.stripe_customer_id,
          checkoutSessionId:order.stripe_checkout_session_id,
          subscriptionId:order.stripe_subscription_id||undefined,
          priceId:order.stripe_price_id,expectedPence:order.expected_pence,
          currency:"gbp",
        });
      }
      const decision=await processSignedLiveStripeEvent(
        pool,order.id,rawBody,signature,cfg.secret,
        applyVerifiedLiveMembershipEntitlement,verifiedInvoicePayment,
      );
      // Reviewed decisions are transactionally audited and visible to the
      // authenticated QA admin inbox. Acknowledge to avoid endless retries
      // of identical provider events without changing customer entitlements.
      return res.status(200).json({
        received:true,decision:decision.action,
        manualReviewRequired:decision.action==="review",liveMode:true,
      });
    }catch(e){
      if (e instanceof ProviderChargeMismatch || e instanceof PaidInvoiceMismatch)
        return res.status(409).send("Provider payment requires manual reconciliation");
      console.error("[Membership LIVE] webhook failed",orderId||"unknown",
        e instanceof Error?e.message:"unknown");
      return res.status(503).send("Transient live reconciliation failure");
    }
  });
}
