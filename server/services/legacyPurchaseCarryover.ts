/**
 * Non-charging conversion of existing one-time IFVA entitlements.
 *
 * Never maps a legacy purchase to a new Stripe recurring subscription.
 * Never resets purchased coins/credits, alters legacy expiry, requests card
 * details or creates an invoice. Ambiguous accounts are reviewed instead.
 */
export const LEGACY_PAID_TIERS = ["basic","premium","enterprise","ultimate"] as const;
export type LegacyPaidTier = typeof LEGACY_PAID_TIERS[number];

export type LegacyPurchaseAccount = {
 userId: string;
 subscriptionTier: string | null;
 subscriptionStatus: string | null;
 tierExpiresAt: Date | string | null;
 planCredits: number;
 bonusCredits: number;
 creditsUsed: number;
 stripeSubscriptionId: string | null;
 tierOverrideBy: string | null;
};

export type LegacyPaymentProof = {
 id:string; tier:string|null; type:string; status:string;
 currency:string; amount:number; createdAt:Date|string;
};

export type CarryoverAssessment =
 | {action:"grandfather";tier:LegacyPaidTier;paidThrough:string|null;planCredits:number;bonusCredits:number;creditsUsed:number;sourcePaymentId:string}
 | {action:"review";reason:string}
 | {action:"skip";reason:string};

export function assessLegacyPurchaseCarryover(
 account:LegacyPurchaseAccount, proofs:readonly LegacyPaymentProof[], now=new Date(),
):CarryoverAssessment {
 const tier=String(account.subscriptionTier||"free").toLowerCase();
 if(tier==="free")return {action:"skip",reason:"No legacy paid tier"};
 if(!(LEGACY_PAID_TIERS as readonly string[]).includes(tier))
   return {action:"review",reason:"Unknown or already migrated tier"};
 if(String(account.subscriptionStatus||"").toLowerCase()!=="active")
   return {action:"review",reason:"Legacy entitlement not currently active"};
 if(account.stripeSubscriptionId)
   return {action:"review",reason:"Existing Stripe subscription requires live-provider reconciliation"};
 if(account.tierOverrideBy)
   return {action:"review",reason:"Manual admin override requires review"};
 const credits=[account.planCredits,account.bonusCredits,account.creditsUsed];
 if(!credits.every(x=>Number.isSafeInteger(x)&&x>=0))
   return {action:"review",reason:"Invalid or negative credit balance"};
 let paidThrough:string|null=null;
 if(account.tierExpiresAt!=null){
   const end=new Date(account.tierExpiresAt);
   if(!Number.isFinite(end.getTime()))
     return {action:"review",reason:"Invalid legacy expiry"};
   if(end.getTime()<=now.getTime())
     return {action:"review",reason:"Recorded legacy expiry has passed"};
   paidThrough=end.toISOString();
 }
 const settled=proofs.filter(p=>
   p.tier?.toLowerCase()===tier &&
   ["one_time","upgrade"].includes(p.type) &&
   p.status==="succeeded" &&
   p.currency.toUpperCase()==="GBP" &&
   Number.isSafeInteger(p.amount)&&p.amount>0 &&
   typeof p.id==="string"&&p.id.length>0 &&
   Number.isFinite(new Date(p.createdAt).getTime()) &&
   new Date(p.createdAt).getTime()<=now.getTime()
 ).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
 if(settled.length===0)return {action:"review",reason:"No matching settled one-time tier payment proof"};
 return {action:"grandfather",tier:tier as LegacyPaidTier,paidThrough,
   planCredits:account.planCredits,bonusCredits:account.bonusCredits,
   creditsUsed:account.creditsUsed,sourcePaymentId:settled[0].id};
}
