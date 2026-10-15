/**
 * Public-facing membership filter for the IFVA Tools Hub.
 *
 * The internal commercial tool catalogue retains its legacy PlanId
 * minimums for backwards-compatible paid entitlement enforcement.
 * This module translates those requirements for display and filtering;
 * it NEVER grants or changes access. Only /api/tools/access is authoritative
 * for whether the current signed-in customer can use a tool.
 */
import { PLAN_RANK, type PlanId } from "./commercialCatalog";
import { MEMBER_TOOL_PLAN } from "./memberToolPlan";

export const PUBLIC_MEMBER_FILTERS = [
  {id:"free",label:"Free"},
  {id:"founder",label:"Founder"},
  {id:"founder_pro",label:"Founder Pro"},
  {id:"founder_pass_90d",label:"90-Day Pass"},
] as const;

export type PublicMemberFilter = (typeof PUBLIC_MEMBER_FILTERS)[number]["id"];

const PUBLIC_MEMBER_NAMES: Record<PublicMemberFilter,string>={
  free:"Free",
  founder:"Founder",
  founder_pro:"Founder Pro",
  founder_pass_90d:"90-Day Pass",
};

/**
 * Whether a membership would include a tool with the given *server-returned*
 * minimum legacy plan. Inclusive: Founder includes Free and Foundation tools;
 * Founder Pro and 90-Day Pass include all Founder tools as well.
 */
export function membershipIncludesMinimumPlan(
  minimum:PlanId|undefined,
  membership:PublicMemberFilter,
):boolean {
  if(!minimum || !Object.prototype.hasOwnProperty.call(PLAN_RANK,minimum) ||
     !Object.prototype.hasOwnProperty.call(PUBLIC_MEMBER_NAMES,membership))return false;
  const effective=membership==="free"?"free":MEMBER_TOOL_PLAN[membership];
  return PLAN_RANK[effective]>=PLAN_RANK[minimum];
}

/** Ground all displayed membership names in the effective server-owned tier mapping. */
export function toolMembershipAvailability(minimum:PlanId|undefined):string {
  if(!minimum||!Object.prototype.hasOwnProperty.call(PLAN_RANK,minimum))
    return "Check membership access";
  const options=PUBLIC_MEMBER_FILTERS.filter(({id})=>membershipIncludesMinimumPlan(minimum,id));
  return options.length?options.map(({label})=>label).join(" · "):"Access unavailable";
}
