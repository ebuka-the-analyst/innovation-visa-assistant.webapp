/**
 * Independently verify the UK legal seller behind IFVA memberships.
 * Stripe Dashboard display names and brand labels are NOT legal identity.
 * A company-owned membership must not charge through an individual account.
 * Based on the current active Companies House registration 16909181.
 */
export const MEMBER_SELLER_LEGAL_NAME="STACKRISE LTD";
export const MEMBER_SELLER_COMPANIES_HOUSE_NUMBER="16909181";
type SellerAccount={
  id?:string|null;
  business_type?:string|null;
  country?:string|null;
  company?:{name?:string|null}|null;
};
export function isVerifiedMemberLegalSeller(account:SellerAccount):boolean{
  const legalName=(account.company?.name||"").trim().replace(/\s+/g," ").toUpperCase();
  return account.id==="acct_1SdAGzK9BSTYpDOq" &&
    account.country==="GB" &&
    account.business_type==="company" &&
    legalName===MEMBER_SELLER_LEGAL_NAME;
}
