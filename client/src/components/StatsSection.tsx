import { Card } from "@/components/ui/card";
import { Lightbulb, BriefcaseBusiness, TrendingUp, BadgeCheck } from "lucide-react";

const routeCriteria = [
  {
    icon: BriefcaseBusiness,
    value: "Business Plan",
    label: "Founder Role",
    subtext: "New-business applicants need a business plan and must have generated or significantly contributed to its ideas, with an active day-to-day role in carrying it out.",
    source: "Immigration Rules Appendix Innovator Founder"
  },
  {
    icon: Lightbulb,
    value: "Innovation",
    label: "Original Proposition",
    subtext: "The business plan should be genuine and original, meet new or existing market needs and/or create a competitive advantage.",
    source: "Immigration Rules Appendix Innovator Founder"
  },
  {
    icon: BadgeCheck,
    value: "Viability",
    label: "Realistic & Achievable",
    subtext: "The venture should be realistic and achievable using the founder's available resources, skills, knowledge, experience and market awareness.",
    source: "Immigration Rules Appendix Innovator Founder"
  },
  {
    icon: TrendingUp,
    value: "Scalability",
    label: "Structured Growth",
    subtext: "The rules look for structured planning and potential for job creation and growth into national and international markets.",
    source: "Immigration Rules Appendix Innovator Founder"
  }
];

export default function StatsSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-background">
      <div className="responsive-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-xl font-bold mb-6">What the Innovator Founder Rules Assess</h2>
          <p className="text-lg text-muted-foreground">
            A plain-language summary of core new-business requirements from the current Immigration Rules. Always check GOV.UK for the full and latest rules before applying.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {routeCriteria.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 text-center hover-elevate border-border shadow-sm">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="font-serif text-lg font-bold text-primary">{stat.value}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{stat.subtext}</p>
                <p className="text-xs font-medium text-primary">{stat.source}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
