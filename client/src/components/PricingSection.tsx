import FounderMembershipPlans from "@/components/FounderMembershipPlans";

/**
 * Home page uses the same live server catalogue as the pricing route.
 * No separate stale/duplicated pricing copy is permitted.
 */
export default function PricingSection(){
 return <section id="pricing" className="bg-gradient-to-b from-background to-accent/5">
  <div className="responsive-container">
   <FounderMembershipPlans/>
  </div>
 </section>;
}
