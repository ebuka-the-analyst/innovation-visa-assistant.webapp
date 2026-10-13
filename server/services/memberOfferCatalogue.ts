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
import { isMemberPublicCheckoutAllowed } from "../phase3/memberStripeLiveRoutes";
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
 benefits:z.array(z.string().trim().min(5).max(180)).min(1).max(12),
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
/**
 * Approved customer-facing membership copy. This is NOT an entitlement check:
 * access is granted only from signed, paid Stripe events and the tool gate.
 * Stored offer overrides cannot silently reintroduce obsolete marketing claims.
 */
export const APPROVED_MEMBER_PRESENTATION = {
 founder: {
  tag:"For founders getting started",
  headline:"Turn your business idea into a structured, compelling plan.",
  description:"Get the essential AI-powered tools to develop your idea, explore its commercial potential and strengthen your business-plan preparation.",
  bestFor:"Perfect for first-time founders developing a promising business idea.",
  buttonNote:"Monthly subscription · Cancel future renewals",
  benefits:[
   "Essential business-planning tools",
   "2 AI business-plan generations per month",
   "15 AI plan revisions per month",
   "Innovation, viability and scalability planning",
   "Financial forecasting and market research tools",
   "Business-plan PDF exports",
   "Standard email support",
  ],
  ctaText:"Start Building My Future",
 },
 founder_pro: {
  tag:"For ambitious founders",
  headline:"Your complete AI-powered founder preparation suite.",
  description:"Go beyond writing a business plan. Access advanced analysis, interview preparation and intelligent tools to help develop a stronger business case.",
  bestFor:"Ideal for serious founders who want the most comprehensive toolkit and additional support.",
  buttonNote:"Monthly subscription · Cancel future renewals",
  benefits:[
   "Everything in Founder",
   "Full access to all available premium AI preparation tools",
   "4 AI business-plan generations per month",
   "30 AI plan revisions per month",
   "Advanced competitor, market and financial analysis",
   "AI mock interviews and pitch-deck preparation",
   "Advanced evidence and preparation-gap reviews",
   "AI Command Centre and specialist AI assistants",
   "VIP priority customer support",
  ],
  ctaText:"Unlock My Full Potential",
 },
 founder_pass_90d: {
  tag:"For a complete 90-day journey",
  headline:"Three months to turn your vision into a stronger business case.",
  description:"Work at your own pace with a fixed-price preparation package. No monthly charges, no automatic renewal and no recurring subscription to manage.",
  bestFor:"Perfect for founders who want a defined preparation period with one upfront payment.",
  buttonNote:"Pay once · Access ends after 90 days",
  benefits:[
   "90 days of preparation-platform access",
   "Full self-service AI preparation toolkit",
   "2 AI business-plan generations every 30 days",
   "15 AI plan revisions every 30 days",
   "Up to 6 business plans and 45 revisions over 90 days",
   "Financial, market and innovation analysis",
   "AI interview practice and evidence preparation",
   "Document exports and standard email support",
   "No automatic renewal",
  ],
  ctaText:"Begin My 90-Day Journey",
 },
} as const;

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
// All independently-approved Stripe, tax and legal gates must match before
// a public membership CTA becomes available. Preserve three additional
// operational approvals from the original read-only pricing release.
export function canStartLiveMembershipCheckout(env:NodeJS.ProcessEnv=process.env):boolean{
 return isMemberPublicCheckoutAllowed(env);
}
export async function getPublicMemberOffers(){
 const catalog=await getMemberOfferCatalogue();
 return {...catalog,purchasable:canStartLiveMembershipCheckout(),
  offers:catalog.offers.slice().sort((a,b)=>a.sortOrder-b.sortOrder).map(o=>({
   ...o,...APPROVED_MEMBER_PRESENTATION[o.id],
   benefits:[...APPROVED_MEMBER_PRESENTATION[o.id].benefits],
  }))};
}
