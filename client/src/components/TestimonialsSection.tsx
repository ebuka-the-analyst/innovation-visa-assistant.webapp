import { Card } from "@/components/ui/card";
import { CheckCircle2, FileSearch, Scale, ShieldCheck } from "lucide-react";

const principles = [
  {
    icon: FileSearch,
    title: "Evidence-Led Preparation",
    content: "Use structured prompts, saved business information and evidence checks to make claims easier to review and support."
  },
  {
    icon: Scale,
    title: "Clear Decision Boundaries",
    content: "The platform does not make endorsement or visa decisions and does not present AI scores as approval probabilities."
  },
  {
    icon: ShieldCheck,
    title: "Human Review Encouraged",
    content: "AI-generated material can contain errors. Important claims, figures and immigration requirements should be checked before use."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-accent/5">
      <div className="responsive-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-xl font-bold mb-6">Built for Responsible Application Preparation</h2>
          <p className="text-lg text-muted-foreground">
            We do not publish invented customer stories or imply that using the platform guarantees endorsement or visa approval.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title} className="p-8 hover-elevate transition-all duration-300" data-testid={`card-trust-principle-${index}`}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{principle.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{principle.content}</p>
                <div className="flex items-center gap-2 mt-5 text-sm text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transparent platform boundary</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
