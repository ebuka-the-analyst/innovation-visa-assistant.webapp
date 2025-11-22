import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Star } from "lucide-react";
import { Link } from "wouter";

const tiers = [
  {
    name: "Basic",
    price: "£19",
    description: "Perfect for Innovator Founder Visa applications",
    features: [
      { name: "Standard business plan template", included: true },
      { name: "AI-powered content generation", included: true },
      { name: "1 revision included", included: true },
      { name: "PDF download", included: true },
      { name: "Detailed financial projections", included: false },
      { name: "Expert review", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "£39",
    description: "Most comprehensive Innovator Founder plan",
    features: [
      { name: "Enhanced business plan", included: true },
      { name: "AI-powered content generation", included: true },
      { name: "3 revisions included", included: true },
      { name: "PDF download", included: true },
      { name: "Detailed financial projections", included: true },
      { name: "Endorsing body selection", included: true },
      { name: "Priority generation queue", included: true },
    ],
    cta: "Start Premium",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "£79",
    description: "Complete Innovator Founder Visa preparation",
    features: [
      { name: "Full business plan package", included: true },
      { name: "AI-powered content generation", included: true },
      { name: "Unlimited revisions", included: true },
      { name: "PDF download", included: true },
      { name: "Detailed financial projections", included: true },
      { name: "Human expert review", included: true },
      { name: "Cover letter generation", included: true },
      { name: "24-hour delivery", included: true },
    ],
    cta: "Go Enterprise",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-accent/5" id="pricing">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include our AI-powered generation engine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto" style={{ perspective: "1000px" }}>
          {tiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative p-8 transition-all duration-300 hover:-translate-y-2 ${
                tier.popular
                  ? "scale-105 shadow-2xl border-primary bg-gradient-to-br from-card to-primary/5"
                  : "hover:shadow-xl"
              }`}
              style={{
                transform: tier.popular ? "translateY(-12px)" : undefined,
              }}
              data-testid={`card-pricing-${tier.name.toLowerCase()}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-chart-3 text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/plan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature.name} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/pricing">
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  size="lg"
                  data-testid={`button-select-${tier.name.toLowerCase()}`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-8 items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-chart-3" />
              </div>
              <span>Secure Payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-chart-3" />
              </div>
              <span>Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-chart-3" />
              </div>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
