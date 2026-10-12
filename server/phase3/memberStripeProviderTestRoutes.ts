/**
 * PHASE 3: isolated, real-Stripe TEST-MODE acceptance gateway.
 *
 * This module must NEVER run against the production Railway project. It
 * uses separate sk_test_/whsec_ credentials and QA-only SQL tables, and
 * projects test-paid state into QA-only users and member entitlements in one
 * database transaction. Never points at live customer tables.
 *
 * Real test-mode Checkout and webhook signatures can be exercised when a
 * dedicated Stripe TEST account configuration is supplied to clean QA.
 */
import type { Express, RequestHandler } from "express";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import {
  processSignedTestStripeEvent, getEffectiveTestPaidState,
} from "./durableStripeTestLedger";
import {
  EXPECTED_GBP_PENCE, type CandidateSku,
} from "./memberStripeAcceptance";
import { applyVerifiedTestMembershipEntitlement } from "./memberEntitlementFulfilmentQa";
import { reserveTestCheckout, recordCreatedTestCheckout, TestCheckoutConflict } from "./memberStripeCheckoutReservationQa";
import {chargeIdForSignedEvent,reconcileSignedChargeToProvider,ProviderChargeMismatch} from "./stripeChargeReconciliationQa";
import {recordUnmatchedSignedTestEvent} from "./memberStripeUnmatchedQa";
import {validatePaidInvoicePayment,PaidInvoiceMismatch,type VerifiedPaidInvoicePayment} from "./stripePaidInvoiceMappingQa";

type Config = {
  stripe: Stripe;
  secret: string;
  publicUrl: string;
  prices: Record<CandidateSku,string>;
};
const memberSkus: CandidateSku[] = ["founder","founder_pro","founder_pass_90d"];
const orderIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isMemberTestGatewayAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  // Require BOTH a separate QA project and staging environment. Never use
  // this in the long-lived live app or the legacy production environment.
  return env.IFVA_MEMBER_STRIPE_QA_ENABLED === "true" &&
    env.RAILWAY_PROJECT_NAME === "IFVA Phase 2 Isolated QA" &&
    env.RAILWAY_ENVIRONMENT_NAME === "staging" &&
    env.NODE_ENV === "production";
}

function config(): Config {
  const key=process.env.IFVA_MEMBER_STRIPE_TEST_SECRET_KEY || "";
  const secret=process.env.IFVA_MEMBER_STRIPE_TEST_WEBHOOK_SECRET || "";
  const publicUrl=process.env.IFVA_MEMBER_STRIPE_TEST_PUBLIC_URL || "";
  const prices: Record<CandidateSku,string>={
    founder:process.env.IFVA_MEMBER_STRIPE_TEST_FOUNDER_PRICE_ID || "",
    founder_pro:process.env.IFVA_MEMBER_STRIPE_TEST_PRO_PRICE_ID || "",
    founder_pass_90d:process.env.IFVA_MEMBER_STRIPE_TEST_PASS_PRICE_ID || "",
  };
  if (!key.startsWith("sk_test_") || !secret.startsWith("whsec_") ||
      !Object.values(prices).every(v=>/^price_[a-zA-Z0-9]+$/.test(v))) {
    throw new Error("Dedicated TEST-ONLY Stripe key, webhook secret and three price IDs are required");
  }
  const url=new URL(publicUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      url.pathname !== "/" || !url.hostname.endsWith(".up.railway.app")) {
    throw new Error("Test-return host must be an isolated HTTPS Railway QA domain");
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
 * Only when explicitly enabled in fresh isolated QA. This does not change
 * the existing application Stripe client and cannot enable live membership.
 */
export function registerMemberStripeTestRoutes(
  app: Express, isAuthenticated: RequestHandler, pool: Pool,
  requireAdmin: RequestHandler,
): void {
  if(!isMemberTestGatewayAllowed())return;

  app.post("/api/member-stripe-test/checkout",isAuthenticated,async(req,res)=>{
    const user=req.user as any;
    const sku=skuOf(req.body?.sku);
    if(!user?.id || !sku) return res.status(400).json({error:"Authenticated account and valid membership required"});
    const email=String(user.email||"").trim();
    if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:"Verified email required"});
    try{
      const cfg=config();
      const price=await cfg.stripe.prices.retrieve(cfg.prices[sku]);
      const expectedRecurring=sku!=="founder_pass_90d";
      if(!price.active || price.currency!=="gbp" ||
          price.unit_amount!==EXPECTED_GBP_PENCE[sku] ||
          (expectedRecurring && (price.type!=="recurring" ||
            price.recurring?.interval!=="month" || price.recurring?.interval_count!==1)) ||
          (!expectedRecurring && price.type!=="one_time")) {
        return res.status(503).json({error:"Stripe test price and advertised membership do not match"});
      }
      const orderId=randomUUID();
      const customer=await cfg.stripe.customers.create({email,metadata:{ifvaMembershipTest:"true"}});
      await reserveTestCheckout(pool,{
        orderId,userId:user.id,sku,customerId:customer.id,
        priceId:cfg.prices[sku],expectedPence:EXPECTED_GBP_PENCE[sku],currency:"gbp",
      });
      const session=await cfg.stripe.checkout.sessions.create({
        mode:expectedRecurring?"subscription":"payment",
        customer:customer.id,
        client_reference_id:user.id,
        line_items:[{price:cfg.prices[sku],quantity:1}],
        billing_address_collection:"required",
        // Never present an unverified final VAT calculation as correct.
        success_url:cfg.publicUrl+"/?membership_test=return&session_id={CHECKOUT_SESSION_ID}",
        cancel_url:cfg.publicUrl+"/?membership_test=cancelled",
        metadata:{ifvaMembershipTest:"true",ifvaTestOrderId:orderId},
        ...(expectedRecurring ? {
          subscription_data:{metadata:{ifvaMembershipTest:"true",ifvaTestOrderId:orderId}},
        } : {}),
      });
      if(!session.id || !session.url)throw new Error("Stripe did not return a hosted checkout URL");
      // A trusted order exists BEFORE returning a chargeable Stripe URL.
      // If a webhook beats the session-ID update, return 503 so Stripe retries.
      await recordCreatedTestCheckout(pool,orderId,session.id);
      res.status(201).json({orderId,sessionId:session.id,url:session.url,
        sandboxOnly:true});
    }catch(e){
      if(e instanceof TestCheckoutConflict) {
        return res.status(409).json({error:e.message});
      }
      console.error("[Membership QA] Checkout creation failed",e instanceof Error?e.message:"unknown");
      return res.status(503).json({error:"Stripe QA Checkout unavailable; no membership activated"});
    }
  });

  app.get("/api/member-stripe-test/order/:orderId",isAuthenticated,async(req,res)=>{
    const user=req.user as any;
    if(!orderIdPattern.test(req.params.orderId||""))return res.status(404).end();
    const result=await pool.query<{id:string}>(`
      SELECT id FROM member_stripe_test_orders WHERE id=$1 AND user_id=$2`,
      [req.params.orderId,user?.id||""]);
    if(!result.rowCount)return res.status(404).end();
    const state=await getEffectiveTestPaidState(pool,req.params.orderId);
    res.setHeader("Cache-Control","no-store");
    res.json({orderId:req.params.orderId,testOnly:true,active:state.active,paidThrough:state.paidThrough});
  });

  app.get("/api/member-stripe-test/reviews",isAuthenticated,requireAdmin,async(_req,res)=>{
    try {
      const pending=await pool.query<{
        stripe_event_id:string;event_type:string;reason:string;created_at:Date;order_id:string;
      }>(`SELECT stripe_event_id,order_id,event_type,reason,created_at
          FROM member_stripe_test_reviews WHERE status='pending'
          ORDER BY created_at ASC LIMIT 100`);
      res.setHeader("Cache-Control","no-store");
      const unmatched=await pool.query<{
        stripe_event_id:string;event_type:string;reason:string;
        first_seen_at:Date;last_seen_at:Date;retries:number;
      }>(`SELECT stripe_event_id,event_type,reason,first_seen_at,last_seen_at,retries
          FROM member_stripe_test_unmatched_events WHERE status='pending'
          ORDER BY first_seen_at ASC LIMIT 100`);
      res.json({testOnly:true,count:pending.rows.length+unmatched.rows.length,
        reviews:pending.rows,unmatched:unmatched.rows});
    } catch {
      res.status(503).json({error:"QA billing review inbox unavailable"});
    }
  });

  app.post("/api/member-stripe-test/webhook",async(req,res)=>{
    const rawBody=(req as any).rawBody;
    const signature=req.header("stripe-signature");
    if(!Buffer.isBuffer(rawBody) || !signature)return res.status(400).send("Missing signed raw event");
    let cfg:Config;let event:Stripe.Event;
    try{
      cfg=config();
      event=cfg.stripe.webhooks.constructEvent(rawBody,signature,cfg.secret);
      if(event.livemode!==false)throw new Error("Not a Stripe test-mode event");
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
          FROM member_stripe_test_orders WHERE stripe_checkout_session_id=$1`,[obj.id]);
        rows=r.rows;
      }else if(event.type==="invoice.paid"||event.type==="invoice.payment_failed"||
          event.type==="customer.subscription.deleted"){
        const sub=event.type==="customer.subscription.deleted"?obj.id:invoiceSub(obj);
        if(sub){
          const r=await pool.query(`
            SELECT id,user_id,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,stripe_price_id,expected_pence,sku
            FROM member_stripe_test_orders WHERE stripe_subscription_id=$1`,[sub]);
          rows=r.rows;
          if(rows.length===0){
            // A first paid invoice may arrive before checkout.session.completed.
            // Re-fetch the provider subscription and validate its server-set
            // order reference, customer, and price BEFORE attaching it.
            const subscription=await cfg.stripe.subscriptions.retrieve(sub);
            const id=subscription.metadata?.ifvaTestOrderId;
            const r2=orderIdPattern.test(id||"") ? await pool.query(`
              SELECT id,user_id,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,stripe_price_id,expected_pence,sku
              FROM member_stripe_test_orders WHERE id=$1`,[id]) : {rows:[]};
            if(r2.rows.length===1){
              const candidate=r2.rows[0];
              const activePrice=subscription.items?.data?.find(
                item=>item.price?.id===candidate.stripe_price_id);
              if(asId(subscription.customer)===candidate.stripe_customer_id &&
                 activePrice && candidate.sku!=="founder_pass_90d"){
                const bound=await pool.query(`
                  UPDATE member_stripe_test_orders SET stripe_subscription_id=$1
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
          FROM member_stripe_test_orders WHERE stripe_payment_intent_id=$1
          OR id IN (SELECT order_id FROM member_stripe_test_invoice_payments
                    WHERE stripe_payment_intent_id=$1)`,
          [confirmed.paymentIntentId]);
        rows=r.rows;
      }else{return res.json({received:true,ignored:true});}
      if(rows.length!==1) {
        await recordUnmatchedSignedTestEvent(pool,rawBody,signature,cfg.secret,
          "No single trusted order for verified provider event");
        return res.status(503).send("Trusted QA order not yet reconciled; retry");
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
            session.metadata?.ifvaTestOrderId!==order.id)
          return res.status(409).send("Provider checkout mismatch");
        const sub=asId(session.subscription);
        const intent=asId(session.payment_intent);
        if(order.sku==="founder_pass_90d" && intent){
          await pool.query(`UPDATE member_stripe_test_orders
            SET stripe_payment_intent_id=$1 WHERE id=$2 AND
            (stripe_payment_intent_id IS NULL OR stripe_payment_intent_id=$1)`,[intent,order.id]);
        }else if(order.sku!=="founder_pass_90d" && sub){
          await pool.query(`UPDATE member_stripe_test_orders
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
      const decision=await processSignedTestStripeEvent(
        pool,order.id,rawBody,signature,cfg.secret,
        applyVerifiedTestMembershipEntitlement,verifiedInvoicePayment,
      );
      // Reviewed decisions are transactionally audited and visible to the
      // authenticated QA admin inbox. Acknowledge to avoid endless retries
      // of identical provider events without changing customer entitlements.
      return res.status(200).json({
        received:true,decision:decision.action,
        manualReviewRequired:decision.action==="review",sandboxOnly:true,
      });
    }catch(e){
      if (e instanceof ProviderChargeMismatch || e instanceof PaidInvoiceMismatch)
        return res.status(409).send("Provider payment requires manual reconciliation");
      console.error("[Membership QA] webhook failed",orderId||"unknown",
        e instanceof Error?e.message:"unknown");
      return res.status(503).send("Transient QA reconciliation failure");
    }
  });
}
