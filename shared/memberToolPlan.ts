/** One source of truth for new membership -> legacy tool access levels. */
import { PLAN_IDS, type PlanId } from "./commercialCatalog";
export const MEMBER_TOOL_PLAN: Record<"founder" | "founder_pro" | "founder_pass_90d", PlanId> = {
  founder: "premium",
  founder_pro: "ultimate",
  founder_pass_90d: "ultimate",
};
export function effectiveMemberToolPlan(tier: unknown, currentlyPaid: boolean): PlanId {
  if (typeof tier !== "string") return "free";
  if (tier === "free") return "free";
  if (!currentlyPaid) return "free";
  if (Object.prototype.hasOwnProperty.call(MEMBER_TOOL_PLAN, tier))
    return MEMBER_TOOL_PLAN[tier as keyof typeof MEMBER_TOOL_PLAN];
  return PLAN_IDS.includes(tier as PlanId) ? tier as PlanId : "free";
}
