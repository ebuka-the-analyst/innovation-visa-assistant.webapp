/**
 * Founder membership offer catalogue. All customer-visible product text,
 * GBP amounts, cadence, features and the legacy notice are server-owned.
 * A store record in system_settings overrides the safe server default.
 *
 * Checkout readiness is separate from presentation and fail-closed:
 * merely publishing these offers must not create chargeable subscriptions.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { systemSettings } from "@shared/schema";

export const MEMBER_OFFER_CATALOG_KEY="commercial.founder-offers.v1";
export const MEMBER_OFFER_IDS=["founder","founder_pro","founder_pass_90d"] as const;
export type MemberOfferId=typeof MEMBER_OFFER_IDS[number];

const offerSchema=z.object({
 id:z.enum(MEMBER_OFFER_IDS),
 name:z.string().trim().min(2).max(75),
 description:z.string().trim().min(10).max(380),
 pricePence:z.number().int().positive().max(1_000_000),
 currency:z.literal("GBP"),
 billingKind:z.enum(["monthly","one_time"]),
 billingLabel:z.string().trim().min(3).max(70),
 generationsPerPeriod:z.number().int().min(1).max(100),
 revisionsPerPeriod:z.number().int().min(1).max(300),
 periodDays:z.number().int().min(1).max(90).nullable(),
 maximumGenerations:z.number().int().min(1).max(200).nullable(),
 benefits:z.array(z.string().trim().min(5).max(180)).min(1).max(8),
 ctaText:z.string().trim().min(3).max(60),
 sortOrder:z.number().int().min(0).max(10),
}).strict();
const catalogueSchema=z.object({
 revision:z.number().int().nonnegative(),
 title:z.string().trim().min(3).max(120),
 introduction:z.string().trim().min(15).max(500),
 legacyTitle:z.string().trim().min(3).max(110),
 legacyNotice:z.string().trim().min(20).max(700),
 billingNotice:z.string().trim().min(15).max(500),
 unavailableLabel:z.string().trim().min(3).max(100),
 offers:z.array(offerSchema).length(3),
}).strict().superRefine((catalog,ctx)=>{
 const ids=catalog.offers.map(o=>o.id);
 for(const id of MEMBER_OFFER_IDS)if(ids.filter(x=>x===id).length!==1){
  ctx.addIssue({code:z.ZodIssueCode.custom,path:["offers"],message:"Missing/duplicate offer "+id});
 }
 for(const offer of catalog.offers){
  if(offer.billingKind!==(offer.id==="founder_pass_90d"?"one_time":"monthly"))
   ctx.addIssue({code:z.ZodIssueCode.custom,path:["offers"],message:"Billing kind does not match SKU"});
  if((offer.id==="founder_pass_90d")!==(offer.periodDays===30 && offer.maximumGenerations!==null))
   ctx.addIssue({code:z.ZodIssueCode.custom,path:["offers"],message:"90-day pass requires 30-day windows and lifetime maximum"});
 }
});
export type MemberOfferCatalogue=z.infer<typeof catalogueSchema>;

const defaultCatalogue:MemberOfferCatalogue={
 revision:0,
 title:"Founder membership options",
 introduction:"Choose a membership for AI-assisted business-plan preparation. Full billing terms and tax treatment are shown before any new purchase.",
 legacyTitle:"Your previous purchase stays yours",
 legacyNotice:"Any valid credits and plan access already purchased under Basic, Premium, Enterprise or Ultimate remain subject to their original terms. Previous one-time purchases are not automatically converted into new monthly subscriptions. Used credits are not replenished by the pricing change.",
 billingNotice:"A monthly plan renews automatically until cancelled. The 90-Day Pass is a single purchase with no automatic renewal. No payment is taken without a confirmed Stripe checkout.",
 unavailableLabel:"Online checkout is being verified; no payment can be taken for this membership yet.",
 offers:[
  {id:"founder",name:"Founder",description:"An essential monthly membership for founder preparation.",pricePence:6900,currency:"GBP",billingKind:"monthly",billingLabel:"per month",generationsPerPeriod:2,revisionsPerPeriod:15,periodDays:null,maximumGenerations:null,benefits:["2 AI business-plan generations in each paid month","15 revisions in each paid month"],ctaText:"Choose Founder",sortOrder:0},
  {id:"founder_pro",name:"Founder Pro",description:"A monthly membership with more generation and revision capacity.",pricePence:11900,currency:"GBP",billingKind:"monthly",billingLabel:"per month",generationsPerPeriod:4,revisionsPerPeriod:30,periodDays:null,maximumGenerations:null,benefits:["4 AI business-plan generations in each paid month","30 revisions in each paid month"],ctaText:"Choose Founder Pro",sortOrder:1},
  {id:"founder_pass_90d",name:"90-Day Pass",description:"A fixed-duration membership without automatic renewal.",pricePence:15900,currency:"GBP",billingKind:"one_time",billingLabel:"one-time payment",generationsPerPeriod:2,revisionsPerPeriod:15,periodDays:30,maximumGenerations:6,benefits:["2 generations and 15 revisions per 30-day window","6 generations maximum over 90 days","No automatic renewal"],ctaText:"Choose 90-Day Pass",sortOrder:2},
 ],
};
export function parseMemberOfferCatalogue(value:unknown):MemberOfferCatalogue{
 return catalogueSchema.parse(value);
}
export function safeDefaultMemberOffers():MemberOfferCatalogue{
 return catalogueSchema.parse(structuredClone(defaultCatalogue));
}
export async function getMemberOfferCatalogue():Promise<MemberOfferCatalogue>{
 const records=await db.select({value:systemSettings.value}).from(systemSettings)
  .where(eq(systemSettings.key,MEMBER_OFFER_CATALOG_KEY)).limit(1);
 if(!records.length)return safeDefaultMemberOffers();
 return parseMemberOfferCatalogue(records[0].value);
}
// Deliberate hard gate: no production webhook/fulfilment route exists yet.
// Environment variables alone must NEVER make this UI offer chargeable.
const VERIFIED_LIVE_MEMBERSHIP_GATEWAY_IMPLEMENTED=false;
export function canStartLiveMembershipCheckout(env:NodeJS.ProcessEnv=process.env):boolean{
 return VERIFIED_LIVE_MEMBERSHIP_GATEWAY_IMPLEMENTED &&
   env.NODE_ENV==="production" &&
   env.RAILWAY_ENVIRONMENT_NAME==="production" &&
   env.IFVA_MEMBERSHIP_PAYMENTS_LIVE_ENABLED==="true" &&
   env.IFVA_MEMBERSHIP_LIVE_WEBHOOK_VERIFIED==="true" &&
   env.IFVA_MEMBERSHIP_LIVE_FULFILMENT_VERIFIED==="true";
}
export async function getPublicMemberOffers(){
 const catalog=await getMemberOfferCatalogue();
 return {...catalog,purchasable:canStartLiveMembershipCheckout(),
  offers:catalog.offers.slice().sort((a,b)=>a.sortOrder-b.sortOrder).map(o=>({...o}))};
}
