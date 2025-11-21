import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Users } from "lucide-react";
import { Link } from "wouter";

export default function PlatformPillars() {
  const pillars = [
    {
      icon: Brain,
      name: "VisaPrep AI - Intelligence Engine",
      subtitle: "End-to-End Business Planning",
      description: "PhD-level AI system that generates comprehensive, endorser-ready business plans. Evaluates your business across Innovation, Viability, and Scalability criteria with financial projections, competitive analysis, and job creation roadmaps—all internally consistent and submission-ready.",
      features: [
        "Innovation, Viability, Scalability assessment",
        "Multi-sheet financial projections",
        "Professional business plans (25-80 pages)",
        "Rejection analysis & reapplication strategy",
        "Real-time generation in 3-5 minutes"
      ],
      links: [
        { label: "Generate Business Plan", route: "/questionnaire?tier=enterprise" },
        { label: "See Sample Plans", route: "/#samples" }
      ],
      color: "from-purple-500 to-primary"
    },
    {
      icon: Zap,
      name: "VisaPrep AI - Diagnostics",
      subtitle: "Eligibility & Route Analysis",
      description: "Real-time AI diagnostic engine that tests your business against all UK Innovation Visa requirements. Compares endorser routes, scores your viability for each endorser, models your team gaps, and forecasts realistic traction benchmarks—so you know your success probability before investing.",
      features: [
        "Real-time eligibility checking against Home Office rules",
        "Endorser fit scoring & comparison",
        "4-route visa strategy analysis",
        "Team skill gap identification",
        "Traction forecasting vs. comparable ventures"
      ],
      links: [
        { label: "Check Eligibility", route: "/questionnaire" },
        { label: "Compare Endorsers", route: "/endorser-comparison" }
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      name: "VisaPrep AI - Mentorship Hub",
      subtitle: "Interview Prep & Expert Network",
      description: "AI-powered coaching studio + expert network. Mock interview scenarios with PhD-level feedback, document organization with submission checklists, expert immigration lawyer consultations, and settlement planning for post-visa growth. Guides you from application through to ILR eligibility.",
      features: [
        "AI mock interview coaching with feedback",
        "Document organization & gap identification",
        "Immigration lawyer & advisor network",
        "Post-visa settlement & ILR roadmap",
        "Continuous mentorship & compliance monitoring"
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
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            One Platform. Three Power Tools.
          </h2>
          <p className="text-lg text-muted-foreground">
            VisaPrep AI combines business planning, eligibility diagnostics, and expert mentorship into one unified platform for UK Innovation Visa success
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
          <h3 className="font-semibold text-lg mb-3">Integrated Workflow</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Generate your business plan with VisaPrep AI Intelligence Engine. Test your eligibility and compare routes with Diagnostics. Practice interviews and access expert consultants with the Mentorship Hub. All three tools work together seamlessly.
          </p>
          <p className="text-sm font-semibold text-primary">Everything included in your VisaPrep AI subscription.</p>
        </div>
      </div>
    </section>
  );
}
