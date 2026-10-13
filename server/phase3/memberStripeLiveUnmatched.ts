/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * Only records provider-signed Stripe TEST events that cannot be mapped to
 * one trusted QA order. No membership or payment state is ever changed.
 */
import Stripe from "stripe";
import type { Pool } from "pg";

const offlineStripe=new Stripe("sk_live_offline_unmatched_qa",{apiVersion:"2025-08-27.basil"});
export async function recordUnmatchedSignedLiveEvent(
  pool:Pool, raw:Buffer|string, signature:string,
  testSecret:string, reason:string,
):Promise<string> {
  if(!testSecret.startsWith("whsec_"))
    throw Error("A test webhook signing secret is required");
  // Verify the original raw bytes again; callers cannot smuggle a
  // reconstructed JSON object or metadata into an unmatched order queue.
  const event=offlineStripe.webhooks.constructEvent(raw,signature,testSecret);
  if(event.livemode!==true)throw Error("Production Stripe events forbidden in QA inbox");
  if(!event.id || !/^evt_[a-zA-Z0-9_-]+$/.test(event.id))
    throw Error("Invalid provider event ID");
  const safeReason=String(reason).slice(0,400);
  await pool.query(`
    INSERT INTO member_stripe_live_unmatched_events
      (stripe_event_id,event_type,reason)
    VALUES($1,$2,$3)
    ON CONFLICT(stripe_event_id) DO UPDATE SET
      last_seen_at=NOW(),
      retries=member_stripe_live_unmatched_events.retries+1
    WHERE member_stripe_live_unmatched_events.status='pending'`,
    [event.id,event.type,safeReason]);
  return event.id;
}
