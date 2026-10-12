/**
 * Controlled reconciliation of already-paid legacy IFVA accounts.
 *
 * DEFAULT = DRY RUN. Does NOT call Stripe, create subscriptions, or update
 * users, plan credits, subscription status, expiry or legacy transactions.
 * The --apply mode is restricted to immutable isolated Railway QA identifiers.
 * A separate reviewed production rollout is required after verifying live
 * purchase proofs and customer agreements.
 *
 * Run: node --import tsx scripts/reconcile-legacy-purchases.ts
 * QA-only apply: IFVA_LEGACY_CARRYOVER_QA_ENABLED=true
 *   node --import tsx scripts/reconcile-legacy-purchases.ts --apply
 */
import { Pool } from "pg";
import { assessLegacyPurchaseCarryover, type LegacyPaymentProof, type LegacyPurchaseAccount } from "../server/services/legacyPurchaseCarryover";

const QA_PROJECT_ID="dbec1752-9b2a-4473-8fab-ddae38310c26";
const QA_ENV_ID="5b20a1f5-8784-4463-bfe8-b435fa086a64";

export function canApplyIsolatedCarryover(env:NodeJS.ProcessEnv=process.env):boolean{
 return env.IFVA_LEGACY_CARRYOVER_QA_ENABLED==="true" &&
   env.RAILWAY_PROJECT_ID===QA_PROJECT_ID &&
   env.RAILWAY_ENVIRONMENT_ID===QA_ENV_ID &&
   env.RAILWAY_PROJECT_NAME==="IFVA Phase 2 Isolated QA" &&
   env.RAILWAY_ENVIRONMENT_NAME==="staging";
}
function rowToAccount(row:any):LegacyPurchaseAccount {
 return {
   userId:row.id, subscriptionTier:row.subscription_tier,
   subscriptionStatus:row.subscription_status,
   tierExpiresAt:row.tier_expires_at,
   planCredits:row.plan_credits,bonusCredits:row.bonus_credits,
   creditsUsed:row.credits_used,stripeSubscriptionId:row.stripe_subscription_id,
   tierOverrideBy:row.tier_override_by,
 };
}
async function main(){
 const apply=process.argv.includes("--apply");
 if(process.argv.some(a=>a.startsWith("--")&&a!=="--apply"))throw Error("Unknown option");
 if(apply&&!canApplyIsolatedCarryover())throw Error("Refusing to write outside explicitly enabled isolated QA");
 if(apply){
   let target:URL;
   try{target=new URL(process.env.DATABASE_URL||"");}
   catch{throw Error("QA database URL is required for write");}
   if(!["postgres:","postgresql:"].includes(target.protocol) ||
      !target.hostname.endsWith(".railway.internal")){
     throw Error("Refusing to write to any external or production database");
   }
 }
 if(!process.env.DATABASE_URL)throw Error("DATABASE_URL required");
 const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:12000});
 const counts={evaluated:0,eligible:0,applied:0,alreadyRecorded:0,review:0,skipped:0};
 const client=await pool.connect();
 try{
  await client.query(apply?"BEGIN":"BEGIN READ ONLY");
  await client.query("SET LOCAL statement_timeout = '120s'");
  if(apply)await client.query("SELECT pg_advisory_xact_lock(hashtext('ifva-legacy-carryover-v1'))");
  // This deliberately ignores free accounts and DOES NOT manufacture new
  // memberships from credits, admin grants or mere historical purchases.
  const accounts=await client.query(`
   SELECT id,subscription_tier,subscription_status,tier_expires_at,
      plan_credits,bonus_credits,credits_used,stripe_subscription_id,tier_override_by
   FROM users WHERE subscription_tier IN ('basic','premium','enterprise','ultimate')
   ORDER BY id ${apply ? "FOR UPDATE" : ""}`);
  for(const row of accounts.rows){
   counts.evaluated++;
   const paid=await client.query(`
    SELECT id,tier,type,status,currency,amount,created_at
    FROM payment_transactions
    WHERE user_id=$1 AND tier=$2
    ORDER BY created_at DESC,id DESC`,[row.id,row.subscription_tier]);
   const proofs:LegacyPaymentProof[]=paid.rows.map(p=>({
     id:p.id,tier:p.tier,type:p.type,status:p.status,
     currency:p.currency,amount:p.amount,createdAt:p.created_at,
   }));
   const eligible=assessLegacyPurchaseCarryover(rowToAccount(row),proofs);
   if(eligible.action==="skip"){counts.skipped++;continue;}
   if(eligible.action==="review"){counts.review++;continue;}
   // Any refund against an existing paid tier requires manual reconciliation.
   if(proofs.some(p=>p.status==="refunded"||p.type==="refund")){counts.review++;continue;}
   counts.eligible++;
   if(!apply)continue;
   const result=await client.query(`
     INSERT INTO legacy_purchase_carryovers
       (user_id,source_payment_transaction_id,legacy_tier,
        plan_credits_at_conversion,bonus_credits_at_conversion,
        credits_used_at_conversion,legacy_paid_through)
     VALUES($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (user_id) DO NOTHING`,[
       row.id,eligible.sourcePaymentId,eligible.tier,eligible.planCredits,
       eligible.bonusCredits,eligible.creditsUsed,eligible.paidThrough,
     ]);
   if(result.rowCount===1)counts.applied++;else counts.alreadyRecorded++;
  }
  // No hidden charges or payments: SQL is INSERT to compatibility ledger only.
  if(apply)await client.query("COMMIT");else await client.query("ROLLBACK");
  console.log(JSON.stringify({mode:apply?"qa-ledger-only":"dry-run",...counts},null,2));
 }catch(e){await client.query("ROLLBACK").catch(()=>{});throw e;}
 finally{client.release();await pool.end();}
}
if(process.argv[1]?.endsWith("reconcile-legacy-purchases.ts")){
 main().catch(err=>{console.error("[Legacy carryover]",err instanceof Error?err.message:"Unknown error");process.exitCode=1;});
}
