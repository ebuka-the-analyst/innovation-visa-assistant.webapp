import { Card } from "@/components/ui/card";
import { Check, ShieldCheck } from "lucide-react";

/**
 * Information-only membership preview.
 * No Stripe requests, checkout links, renewals, entitlement mutations or
 * changes to the active one-time plan catalogue.
 *
 * The proposed amounts are subject to final VAT and consumer-terms review.
 * Payment activation is tracked separately from this public preview.
 */
const upcomingMemberships = [
  {
    id: "founder",
    name: "Founder",
    proposedPrice: "£69",
    period: "per month",
    benefits: ["2 AI business-plan generations per paid month", "15 revisions per paid month"],
  },
  {
    id: "founder_pro",
    name: "Founder Pro",
    proposedPrice: "£119",
    period: "per month",
    benefits: ["4 AI business-plan generations per paid month", "30 revisions per paid month"],
  },
  {
    id: "founder_pass_90d",
    name: "90-Day Pass",
    proposedPrice: "£159",
    period: "one-time",
    benefits: ["2 generations and 15 revisions per 30-day window", "6 generations maximum over 90 days"],
  },
] as const;

export default function UpcomingMemberships() {
  return (
    <section aria-labelledby="upcoming-memberships-title" data-testid="upcoming-memberships-preview"
      className="mt-14 rounded-2xl border border-border bg-card/70 p-5 shadow-sm md:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          In development · Not yet available to purchase
        </p>
        <h2 id="upcoming-memberships-title" className="font-serif text-xl font-bold md:text-2xl">
          Upcoming Founder memberships
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Explore our proposed new membership options. The listed amounts are previews,
          subject to final tax, subscription terms and payment testing. These options cannot be purchased yet.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {upcomingMemberships.map(plan => (
          <Card key={plan.id} data-testid={`upcoming-membership-${plan.id}`}
            className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{plan.name}</h3>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Coming soon
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold">{plan.proposedPrice}</span>
              <span className="text-xs text-muted-foreground">{plan.period}</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {plan.benefits.map(benefit => (
                <li key={benefit} className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-6 text-xs text-muted-foreground">
              Preview only. No payment or automatic enrolment.
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-7 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4"
        data-testid="existing-purchase-preservation">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm">
          <strong>Already purchased a plan?</strong> Your existing Basic, Premium,
          Enterprise or Ultimate purchase remains on its original terms, including
          unused plan and add-on credits and any applicable expiry. We will not
          enrol you in a monthly subscription or charge you again as part of introducing
          these new memberships.
        </p>
      </div>
    </section>
  );
}
