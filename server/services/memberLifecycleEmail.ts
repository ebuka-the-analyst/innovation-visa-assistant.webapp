import type { Pool } from "pg";
import { dbPool } from "../db";
import { sendEmail } from "../email";
import { emailBrand } from "./emailTemplateService";

type Decision="activate"|"suspend"|"expire";
const pool=dbPool as Pool;
let processing=false;
let timer:NodeJS.Timeout|null=null;

/**
 * Queue after signed Stripe verification and committed entitlement ledger.
 * Dedupe on the signed event ID even when Stripe retries a 503.
 * No customer or order IDs are trusted from the request body.
 */
export async function queueSignedMemberLifecycleEmail(eventId:string, trustedOrderId:string) {
  const result=await pool.query<{decision:string;event_type:string;user_id:string}>(`
    SELECT e.decision,e.event_type,o.user_id
    FROM member_stripe_live_events e
    JOIN member_stripe_live_orders o ON o.id=e.order_id
    WHERE e.stripe_event_id=$1 AND e.order_id=$2`,[eventId,trustedOrderId]);
  if(result.rowCount!==1)return;
  const e=result.rows[0];
  if(!["activate","suspend","expire"].includes(e.decision))return;
  await pool.query(`
    INSERT INTO member_lifecycle_email_outbox(event_id,order_id,user_id,event_type,decision)
    VALUES($1,$2,$3,$4,$5) ON CONFLICT(event_id) DO NOTHING`,
    [eventId,trustedOrderId,e.user_id,e.event_type,e.decision]);
  kickMemberLifecycleEmailWorker();
}

export async function queueScheduledMembershipCancellation(orderId:string,userId:string) {
  await pool.query(`
    INSERT INTO member_lifecycle_email_outbox(event_id,order_id,user_id,event_type,decision)
    VALUES($1,$2,$3,'customer.cancellation_scheduled','expire') ON CONFLICT(event_id) DO NOTHING`,
    ["customer-cancel-scheduled:"+orderId,orderId,userId]);
  kickMemberLifecycleEmailWorker();
}

function lifecycleCopy(row:{
  event_type:string;decision:Decision;sku:string;paid_through:Date|null;
  activated_count:string;
}) {
  const product = row.sku==="founder_pro"?"Founder Pro":row.sku==="founder_pass_90d"?"90-Day Pass":"Founder";
  const through=row.paid_through?new Date(row.paid_through).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}):null;
  const remaining=through ? ` Your recorded paid-through date is ${through}.` : "";
  if(row.event_type==="customer.cancellation_scheduled")
    return {emailType:"member_cancellation_scheduled",subject:"Your membership will not renew",message:`You have scheduled cancellation of your ${product} membership at the end of the current paid period. Your existing access continues until its recorded expiry.${remaining}`};
  if(row.decision==="activate"){
    const renewed=Number(row.activated_count)>1;
    return {emailType:renewed?"member_renewed":"member_activated",
      subject:renewed?"Your membership has renewed":"Your membership is active",
      message:`Your ${product} membership is active following verified payment.${remaining} View your membership and available benefits in your dashboard.`};
  }
  if(row.event_type==="invoice.payment_failed")
    return {emailType:"member_payment_failed",subject:"Your membership payment needs attention",message:`A payment for your ${product} membership was unsuccessful. Check your membership status and payment options in the dashboard. Do not assume access has renewed.`};
  if(row.event_type==="charge.refunded")
    return {emailType:"member_refunded",subject:"Update about your membership refund",message:`A refund event was confirmed for your ${product} membership. Your membership access has been updated. Refer to Stripe's receipt or your payment provider for the refund amount and processing time.`};
  if(row.event_type==="charge.dispute.created")
    return {emailType:"member_disputed",subject:"Your membership requires a payment review",message:`A payment review or dispute has affected your ${product} membership access. Please contact support for assistance. No new membership access is granted by this message.`};
  if(row.decision==="expire")
    return {emailType:"member_cancelled",subject:"Your membership has ended",message:`Your ${product} membership has ended and paid access is no longer active.`};
  return {emailType:"member_payment_failed",subject:"Important membership payment update",message:`Your ${product} membership status changed following a verified payment event. Please review your membership status in your dashboard.`};
}

export async function processMemberLifecycleEmailOutbox() {
  // Both websites use the same DB. Only IFVA worker owns IFVA membership emails.
  if(emailBrand()!=="ifva" || processing)return;
  processing=true;
  try {
    await pool.query(`UPDATE member_lifecycle_email_outbox SET status='failed',next_attempt_at=NOW(),updated_at=NOW()
      WHERE status='sending' AND updated_at < NOW() - INTERVAL '5 minutes'`);
    const jobs=await pool.query<{event_id:string;event_type:string;decision:Decision;sku:string;
      paid_through:Date|null;activated_count:string;email:string|null;first_name:string|null;user_id:string}>(`
      UPDATE member_lifecycle_email_outbox SET status='sending',updated_at=NOW()
      WHERE event_id IN (
        SELECT event_id FROM member_lifecycle_email_outbox
        WHERE status IN('pending','failed') AND attempts<10 AND next_attempt_at<=NOW()
        ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 20
      ) RETURNING event_id`);
    for(const job of jobs.rows) {
      const id=job.event_id;
      try {
        const found=await pool.query<{
          event_type:string;decision:Decision;sku:string;paid_through:Date|null;
          activated_count:string;email:string|null;first_name:string|null;user_id:string;
        }>(`
        SELECT o.event_type,o.decision,m.sku,m.paid_through,u.email,u.first_name,
          o.user_id,
          (SELECT COUNT(*)::text FROM member_stripe_live_events e
           WHERE e.order_id=o.order_id AND e.decision='activate') AS activated_count
        FROM member_lifecycle_email_outbox o
        JOIN member_stripe_live_orders m ON m.id=o.order_id
        JOIN users u ON u.id=o.user_id WHERE o.event_id=$1`,[id]);
        const d=found.rows[0];
        if(!d?.email)throw new Error("Member email address unavailable");
        const copy=lifecycleCopy(d);
        const name=d.first_name||"there";
        const html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:28px">
          <h2>${copy.subject}</h2><p>Hi ${name.replace(/[&<>"]/g,"")},</p>
          <p>${copy.message}</p><p><a href="https://innovatorfoundervisaassistant.co.uk/pricing">View your membership</a></p>
          <p>For billing support, contact support@innovatorfoundervisaassistant.co.uk.</p>
          <p style="color:#667;font-size:12px">Innovator Founder Visa Assistant · Powered by Visa Assistant Global</p>
        </div>`;
        const sent=await sendEmail({to:d.email,recipientName:name,userId:d.user_id,
          subject:copy.subject,html,emailType:copy.emailType});
        if(!sent.success)throw new Error(sent.error||"Email provider rejected delivery request");
        await pool.query(`UPDATE member_lifecycle_email_outbox SET status='sent',
          attempts=attempts+1,sent_at=NOW(),last_error=NULL,updated_at=NOW() WHERE event_id=$1`,[id]);
      }catch(e) {
        const delay=30;
        await pool.query(`UPDATE member_lifecycle_email_outbox SET status='failed', attempts=attempts+1,
          next_attempt_at=NOW()+(LEAST(21600,$2::int*POWER(2,LEAST(attempts,9))) * INTERVAL '1 second'),
          last_error=$3,updated_at=NOW() WHERE event_id=$1`,[id,delay,e instanceof Error?e.message.slice(0,1000):"Unknown email error"]);
        console.error("[Membership emails] send failed",id,e instanceof Error?e.message:"unknown");
      }
    }
  }catch(e){
    console.error("[Membership emails] outbox unavailable",e instanceof Error?e.message:"unknown");
  }finally{processing=false;}
}
function kickMemberLifecycleEmailWorker() {
  if(emailBrand()==="ifva")setTimeout(()=>void processMemberLifecycleEmailOutbox(),50);
}
export function startMemberLifecycleEmailWorker() {
  if(emailBrand()!=="ifva" || timer)return;
  kickMemberLifecycleEmailWorker();
  timer=setInterval(()=>void processMemberLifecycleEmailOutbox(),30000);
  timer.unref?.();
}
