import { Card } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, FileText, Presentation, ShieldCheck, Search } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Instant Eligibility Check",
    description: "Our AI analyzes your business against Home Office criteria and endorsing body requirements in minutes, giving you immediate feedback on your visa prospects."
  },
  {
    icon: FileText,
    title: "Business Plan Generator",
    description: "Generate comprehensive 12-section business plans tailored to your chosen endorsing body's specific requirements and expectations."
  },
  {
    icon: TrendingUp,
    title: "Financial Modeling",
    description: "Build Excel models with endorsing body-specific emphasis on R&D, scenarios, or revenue projections that demonstrate your business viability."
  },
  {
    icon: CheckCircle2,
    title: "Document Organization",
    description: "Comprehensive checklist with endorsing body-specific requirements ensures you have complete submission packages with nothing missing."
  },
  {
    icon: Presentation,
    title: "Pitch Deck Creation",
    description: "Generate PowerPoint presentations optimized for your endorsing body's interview requirements and presentation guidelines."
  },
  {
    icon: ShieldCheck,
    title: "Compliance Validation",
    description: "Validate against Home Office criteria AND endorsing body-specific requirements to maximize your approval chances."
  }
];

export default function CompetitorFeatures() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground">
            Complete toolkit for UK Innovation Visa success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
