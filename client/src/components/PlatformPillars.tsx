import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Users } from "lucide-react";
import { Link } from "wouter";

export default function PlatformPillars() {
  const pillars = [
    {
      icon: Brain,
      name: "Innovator Founder Visa Assistant - Intelligence Engine",
      subtitle: "Structured Business Planning",
      description: "AI-assisted tools help draft and review business-plan material across Innovation, Viability and Scalability, including financial assumptions, competitive positioning and growth planning. Outputs are preparation materials, not endorsement decisions or legal advice.",
      features: [
        "Innovation, Viability and Scalability preparation",
        "Scenario-based financial projections",
        "Structured business-plan sections",
        "Documented refusal-reason analysis tools",
        "Editable AI-assisted drafting"
      ],
      links: [
        { label: "Generate Business Plan", route: "/questionnaire?tier=enterprise" },
        { label: "See Sample Plans", route: "/#samples" }
      ],
      color: "from-purple-500 to-primary"
    },
    {
      icon: Zap,
      name: "Innovator Founder Visa Assistant - Diagnostics",
      subtitle: "Eligibility Preparation & Route Information",
      description: "Diagnostic tools compare saved application information with published route criteria and surface preparation gaps. They can compare public endorsing-body information and business evidence, but they do not predict approval or proprietary endorser decisions.",
      features: [
        "Preparation checks against published criteria",
        "Public endorsing-body information comparison",
        "Published visa-route information",
        "Team capability gap identification",
        "Traction and evidence planning"
      ],
      links: [
        { label: "Check Preparation", route: "/questionnaire" },
        { label: "Compare Endorsers", route: "/endorser-comparison" }
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      name: "Innovator Founder Visa Assistant - Support Hub",
      subtitle: "Interview Prep & Expert Network",
      description: "AI-assisted interview practice, document organisation and access to participating professional advisers can support your preparation. Settlement tools provide general planning information and links to current official requirements rather than personal immigration advice.",
      features: [
        "AI mock interview practice with feedback",
        "Document organisation and gap identification",
        "Participating lawyer and adviser network",
        "Settlement-planning information",
        "Preparation reminders and evidence tracking"
      ],
      links: [
        { label: "Practice Interviews", route: "/interview-prep" },
        { label: "Book Expert Consultation", route: "/expert-booking" }
      ],
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="responsive-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-xl font-bold mb-4">One Platform. Three Preparation Workflows.</h2>
          <p className="text-lg text-muted-foreground">
            Bring business planning, diagnostics and expert-support options together in one workspace for Innovator Founder application preparation.
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

                <h3 className="text-lg font-bold mb-1">{pillar.name}</h3>
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

                <div className="space-y-2 pt-4 border-t">
                  {pillar.links.map((link, idx) => (
                    <Link key={link.label} href={link.route}>
                      <Button
                        variant={idx === 0 ? "default" : "outline"}
                        className={`w-full font-semibold ${idx === 0 ? "bg-gradient-to-r from-primary to-chart-3 hover:from-primary/90 hover:to-chart-3/90" : "border-primary/30 text-foreground hover:bg-primary/10"}`}
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
          <h3 className="font-semibold text-lg mb-3">Integrated Preparation Workflow</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Draft and review your business plan, work through preparation checks, practise interviews and access expert-support options. Tool availability depends on your current plan and account entitlements.
          </p>
          <p className="text-sm font-semibold text-primary">No tool on the platform guarantees endorsement, visa approval or settlement eligibility.</p>
        </div>
      </div>
    </section>
  );
}
