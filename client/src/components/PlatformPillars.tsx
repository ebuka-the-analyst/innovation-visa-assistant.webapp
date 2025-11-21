import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Users } from "lucide-react";
import { Link } from "wouter";

export default function PlatformPillars() {
  const pillars = [
    {
      icon: Brain,
      name: "TorlyAI",
      subtitle: "End-to-End Intelligence Platform",
      description: "Vertically integrated decision-support engine that synthesises eligibility diagnostics, financial modelling, and compliance logic. Generates policy-aware business plans, financial projections, and pitch decks—all internally consistent and endorser-ready.",
      features: [
        "Innovation, Viability, Scalability assessment",
        "Multi-sheet financial projections",
        "Narrative business plans",
        "Pitch deck generation",
        "PhD-level automated modelling"
      ],
      links: [
        { label: "Start Business Plan", route: "/questionnaire?tier=enterprise" },
        { label: "View Example", route: "/generation" }
      ],
      color: "from-purple-500 to-primary"
    },
    {
      icon: Zap,
      name: "UKInnovator.online",
      subtitle: "AI-Led Pre-Assessment & Triage",
      description: "AI-driven diagnostic layer that operationalises the Innovator Founder rule set. Tests whether your concept meets innovation, viability, and scalability thresholds before investing time and money—creates structured data for lawyer handoff.",
      features: [
        "Real-time eligibility checking",
        "Sector & tech attribute capture",
        "Structured business briefing",
        "Lawyer-ready data export",
        "Triage & diagnostic logic"
      ],
      links: [
        { label: "Check Eligibility", route: "/questionnaire" },
        { label: "Compare Endorsers", route: "/endorser-comparison" }
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      name: "The Innovator's Launchpad",
      subtitle: "AI-Augmented Mentorship & Venture Formation",
      description: "Hybrid accelerator + training program + AI mentorship studio. Guides Graduate/PSW holders from concept to endorsement-ready business. AI business validator provides continuous feedback on defensibility, positioning, and job creation.",
      features: [
        "Structured curriculum & ideation",
        "AI business-idea validator",
        "Interview prep & coaching",
        "Document organization & checklists",
        "Expert consultant network"
      ],
      links: [
        { label: "Start Interview Prep", route: "/interview-prep" },
        { label: "Book Expert", route: "/expert-booking" }
      ],
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Three AI Platforms. One Mission.
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade AI systems designed from the ground up for UK Innovation Visa success
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <Card
              key={pillar.name}
              className="p-8 hover-elevate overflow-hidden relative group"
              data-testid={`card-pillar-${pillar.name.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pillar.color} p-4 mb-6 text-white`}>
                  <pillar.icon className="w-full h-full" />
                </div>

                <h3 className="text-2xl font-bold mb-1">{pillar.name}</h3>
                <p className="text-sm font-semibold text-primary mb-3">{pillar.subtitle}</p>
                <p className="text-muted-foreground text-sm mb-6">{pillar.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {pillar.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {pillar.links.map((link) => (
                    <Link key={link.label} href={link.route}>
                      <Button
                        variant="outline"
                        className="w-full"
                        data-testid={`button-${pillar.name.replace(/\s+/g, '-').toLowerCase()}-${link.label.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-3">Integrated Workflow</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Start with TorlyAI for end-to-end business planning. Use UKInnovator.online for real-time diagnostics. Access The Launchpad for expert guidance, interview prep, and continuous mentorship through to endorsement.
          </p>
          <p className="text-sm font-semibold text-primary">All three platforms work together. All included in your subscription.</p>
        </div>
      </div>
    </section>
  );
}
