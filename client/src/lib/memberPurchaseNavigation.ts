/** Membership purchase return paths are deliberately restricted to our 3 SKUs.
 * Never accept an arbitrary /login?next= URL as a redirect destination.
 */
export type MemberPurchaseSku="founder"|"founder_pro"|"founder_pass_90d";
const approved=new Set<MemberPurchaseSku>(["founder","founder_pro","founder_pass_90d"]);
export function membershipPurchaseReturn(sku:MemberPurchaseSku):string{
 if(!approved.has(sku))throw Error("Unknown membership");
 return "/pricing?membership_sku="+encodeURIComponent(sku);
}
export function membershipLoginHref(sku:MemberPurchaseSku):string{
 return "/login?next="+encodeURIComponent(membershipPurchaseReturn(sku));
}
export function membershipSignupHref(sku:MemberPurchaseSku):string{
 return "/signup?next="+encodeURIComponent(membershipPurchaseReturn(sku));
}
/** Only a membership pricing URL can ever override the default login redirect. */
export function safeMembershipReturn(search:string):string|null{
 const value=new URLSearchParams(search).get("next");
 if(!value||!value.startsWith("/pricing?")||value.length>140)return null;
 try{
  const url=new URL(value,"https://innovatorfoundervisaassistant.co.uk");
  const keys=[...url.searchParams.keys()];
  if(url.pathname!=="/pricing"||url.hash||keys.length!==1||keys[0]!=="membership_sku")
   return null;
  const sku=url.searchParams.get("membership_sku") as MemberPurchaseSku;
  return approved.has(sku)?membershipPurchaseReturn(sku):null;
 }catch{return null;}
}
