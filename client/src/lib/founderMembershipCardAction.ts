/**
 * Presentation-only membership CTA policy. Membership status must come from
 * the authenticated /api/member-stripe-live/my-membership endpoint, never
 * Stripe return parameters, URL hints, browser storage or submitted plan text.
 *
 * Server payment eligibility remains the authoritative protection.
 */
export type FounderSku="founder"|"founder_pro"|"founder_pass_90d";
export type MembershipCheckState="checking"|"guest"|"ready"|"error";
export type VerifiedMembershipSnapshot={
 sku:string;
 active:boolean;
 paidThrough:string|null;
 source?:"stripe"|"admin_grant";
 accessThrough?:string|null;
};
export type FounderCardAction={
 text:string;
 disabled:boolean;
 current:boolean;
 canStartCheckout:boolean;
 help:"current"|"change"|"checking"|"error"|"unavailable"|null;
};

export const FOUNDER_SKU_NAMES:Readonly<Record<FounderSku,string>>={
 founder:"Founder",
 founder_pro:"Founder Pro",
 founder_pass_90d:"90-Day Pass",
};

export function founderMembershipCardAction(args:{
 offerSku:FounderSku;
 offerCta:string;
 cataloguePurchasable:boolean;
 accountState:MembershipCheckState;
 membership?:VerifiedMembershipSnapshot|null;
}):FounderCardAction{
 const {offerSku,offerCta,cataloguePurchasable,accountState,membership}=args;
 // An owner-scoped active membership takes precedence over every published
 // sales CTA. Do not sell other packages with a second checkout either.
 if(membership?.active===true){
  const current=membership.sku===offerSku;
  return {
   text:current?"Current Plan":"Plan change requires support",
   disabled:true,current,canStartCheckout:false,
   help:current?"current":"change",
  };
 }
 // Never offer a checkout while a signed-in customer's payment entitlement
 // is unresolved. Anonymous visitors may view offers and sign up as before.
 if(accountState==="checking"){
  return {text:"Checking membership…",disabled:true,current:false,
   canStartCheckout:false,help:"checking"};
 }
 if(accountState==="error"){
  return {text:"Membership status unavailable",disabled:true,current:false,
   canStartCheckout:false,help:"error"};
 }
 if(!cataloguePurchasable){
  return {text:offerCta,disabled:true,current:false,
   canStartCheckout:false,help:"unavailable"};
 }
 return {text:offerCta,disabled:false,current:false,
  canStartCheckout:true,help:null};
}
