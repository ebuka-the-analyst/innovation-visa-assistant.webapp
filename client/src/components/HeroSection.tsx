import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, CheckCircle, ClipboardCheck, FileText, FolderCheck } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import SamplePlansModal from "./SamplePlansModal";
import ReadinessScoreWidget from "./ReadinessScoreWidget";
import { useAuth } from "@/hooks/useAuth";

const preparationAreas = [
  { label: "Business Plan", icon: FileText },
  { label: "Evidence", icon: FolderCheck },
  { label: "Financials", icon: Calculator },
  { label: "Review", icon: ClipboardCheck },
];

export default function HeroSection() {
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const hasPaidPlan = isAuthenticated && user?.subscriptionTier && user.subscriptionTier !== "free";
  const generatePlanHref = hasPaidPlan ? "/questionnaire" : "/pricing";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8 md:py-12">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="responsive-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Built for Innovator Founder application preparation</span>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Prepare a Stronger UK Innovator Founder{" "}
              <span className="text-[#005EB8]">Application</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              AI-assisted business planning and preparation tools structured around published Innovator Founder requirements. Review every output before use and verify current requirements on GOV.UK.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-chart-3" />
                <span>AI-Assisted Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-chart-3" />
                <span>Published Criteria Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-chart-3" />
                <span>Editable Preparation Materials</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={generatePlanHref}>
                <Button size="lg" className="group" data-testid="button-generate-plan">
                  Start My Business Plan
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                data-testid="button-view-sample"
                onClick={() => setSampleModalOpen(true)}
              >
                See Sample Plans
              </Button>
            </div>

            <div className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl" aria-label="Preparation areas supported by the platform">
                {preparationAreas.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Software support for evidence-led preparation, not legal advice or a decision-maker.</p>
            </div>
          </div>

          <div className="relative lg:block hidden space-y-4">
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Example Preparation Score Preview</p>
              <p className="text-muted-foreground text-sm max-w-sm">
                Example scores show how the platform can organise evidence across Innovation, Viability and Scalability. They are not visa approval probabilities or endorsement decisions.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-chart-3/20 to-chart-2/20 blur-3xl rounded-full" />
              <div className="relative p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-2xl hover-elevate transition-all duration-500">
                <ReadinessScoreWidget
                  overallScore={88}
                  innovationScore={88}
                  viabilityScore={87}
                  scalabilityScore={89}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SamplePlansModal open={sampleModalOpen} onOpenChange={setSampleModalOpen} />
    </section>
  );
}
