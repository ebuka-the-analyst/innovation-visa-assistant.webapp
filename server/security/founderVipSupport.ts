/**
 * Founder Pro VIP is a priority queue for product usage, access and billing.
 * It does NOT provide human business-plan reviews, endorsement coaching,
 * individual immigration/visa consultations or legal advice.
 *
 * A topic supplied by the browser is a routing hint only: support staff must
 * reclassify requests that actually ask for personalised consultancy.
 */
import { hasCurrentPaidEntitlement, type PaidEntitlementSnapshot } from "./paidEntitlement";

const vipPlatformTopics = new Set(["technical","billing","account"]);

export function qualifiesForFounderProPriority(
  user: PaidEntitlementSnapshot,
  topic: unknown,
  now = new Date(),
): boolean {
  return user.subscriptionTier === "founder_pro"
    && hasCurrentPaidEntitlement(user,now)
    && typeof topic === "string"
    && vipPlatformTopics.has(topic);
}
