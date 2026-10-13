import type { CandidateSku } from "./memberStripeLiveAcceptance";

/** Produce an actionable purchase error without weakening the live payment gates. */
export type CheckoutEligibilityError = {status:number;error:string};
export function memberCheckoutEligibilityError(
 user:{id?:string|null;isAdmin?:boolean|null;isEmailVerified?:boolean|null}|null|undefined,
 sku:CandidateSku|null,
 body:Record<string,unknown>|null|undefined,
 currentTermsVersion:string|undefined,
):CheckoutEligibilityError|null {
 if(!user?.id)return {status:401,error:"Please sign in with a customer account to purchase a membership."};
 if(user.isAdmin===true)return {status:403,error:"Administrator accounts cannot purchase memberships. Sign in with a separate verified customer account to test checkout."};
 if(user.isEmailVerified!==true)return {status:403,error:"Please verify your account email address before purchasing a membership."};
 if(!sku || body?.acknowledgeLivePayment!==true || body?.acknowledgeNoVatPrice!==true ||
    body?.acknowledgeConsumerTerms!==true)
   return {status:400,error:"Please select a valid membership and confirm its price, payment and consumer terms before continuing."};
 if(typeof currentTermsVersion!=="string" || body?.consumerTermsVersion!==currentTermsVersion)
   return {status:409,error:"Membership terms have changed. Close this window, reopen your chosen plan and review the latest terms."};
 return null;
}
