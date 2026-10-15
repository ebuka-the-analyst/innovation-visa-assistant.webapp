/** Verified Stripe membership to legacy tools catalogue bridge.
 * Grants no access on a plan label alone: status must be active and
 * paid-through must be valid, as independently checked on the server.
 */
import { PLAN_IDS, type PlanId } from "./commercialCatalog";
export const MEMBER_TOOL_PLAN: Record<"founder"|"founder_pro"|"founder_pass_90d",PlanId>={
 founder:"premium",
 founder_pro:"ultimate",
 founder_pass_90d:"ultimate",
};
export function effectiveMemberToolPlan(tier:unknown,currentlyPaid:boolean):PlanId{
 if(typeof tier!=="string"||tier==="free"||!currentlyPaid)return "free";
 if(Object.prototype.hasOwnProperty.call(MEMBER_TOOL_PLAN,tier))
  return MEMBER_TOOL_PLAN[tier as keyof typeof MEMBER_TOOL_PLAN];
 return PLAN_IDS.includes(tier as PlanId)?tier as PlanId:"free";
}
/** Public upgrade copy without advertising old, superseded one-time plan prices. */
export function memberUpgradeDescription(minimum:PlanId):string{
 if(minimum==="free")return "Check your membership access";
 return minimum==="basic"||minimum==="premium"
  ? "Founder, Founder Pro or 90-Day Pass"
  : "Founder Pro or 90-Day Pass";
}
