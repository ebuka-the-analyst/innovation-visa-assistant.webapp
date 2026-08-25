import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import SamplePlansModal from "./SamplePlansModal";
import ReadinessScoreWidget from "./ReadinessScoreWidget";
import { useAuth } from "@/hooks/useAuth";

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

            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-3 border-2 border-background flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">Evidence-led preparation</p>
                <p className="text-muted-foreground">Software support, not legal advice or a decision-maker</p>
              </div>
            </div>
          </div>

          <div className="relative lg:block hidden space-y-4">
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Illustrative Readiness Preview</p>
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
