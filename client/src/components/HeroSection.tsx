import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  ClipboardCheck,
  FileText,
  FolderCheck,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import SamplePlansModal from "./SamplePlansModal";
import { useAuth } from "@/hooks/useAuth";

const workspaceItems = [
  {
    label: "Business Plan",
    description: "Build and refine your core plan",
    status: "In progress",
    icon: FileText,
  },
  {
    label: "Founder Profile",
    description: "Capture your experience and suitability",
    status: "Complete",
    icon: ClipboardCheck,
  },
  {
    label: "Innovation Evidence",
    description: "Organise supporting evidence and validation",
    status: "Add evidence",
    icon: FolderCheck,
  },
  {
    label: "Financial Forecast",
    description: "Prepare assumptions and projections",
    status: "Ready to review",
    icon: Calculator,
  },
];

export default function HeroSection() {
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const hasPaidPlan = isAuthenticated && user?.subscriptionTier && user.subscriptionTier !== "free";
  const generatePlanHref = hasPaidPlan ? "/questionnaire" : "/pricing";
  const workspaceHref = isAuthenticated ? "/dashboard" : "/features-showcase";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8 md:py-10 lg:py-12">
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="responsive-container relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="space-y-6 lg:space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Built for Innovator Founder application preparation
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl font-serif text-3xl font-bold leading-[1.12] text-foreground md:text-4xl lg:text-[2.7rem]">
                Prepare a Stronger UK Innovator Founder{" "}
                <span className="text-[#005EB8]">Application</span>
              </h1>

              <div className="max-w-2xl space-y-2">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  AI-assisted tools to help you build, review and strengthen your Innovator Founder business plan and supporting evidence.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Structured around published Innovator Founder requirements. Always verify current requirements on GOV.UK.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-chart-3" />
                <span>AI-Assisted Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-chart-3" />
                <span>Published Criteria Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-chart-3" />
                <span>Editable Preparation Materials</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={generatePlanHref}>
                <Button size="lg" className="group" data-testid="button-generate-plan">
                  Start My Business Plan
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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

            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
              Software support for evidence-led preparation. This platform does not provide legal advice, endorsement decisions or visa approval predictions.
            </p>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10 blur-2xl" aria-hidden="true" />

              <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-sm">
                <div className="border-b border-border/70 px-6 py-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Your Preparation Workspace
                  </p>
                  <h2 className="text-xl font-semibold text-foreground">
                    Keep every part of your preparation organised.
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    A clear workspace for the areas you need to build, review and strengthen. Your actual progress appears after you begin.
                  </p>
                </div>

                <div className="divide-y divide-border/60 px-6">
                  {workspaceItems.map(({ label, description, status, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-4 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border/70 bg-muted/20 px-6 py-5">
                  <p className="text-xs text-muted-foreground">Everything remains editable as your case develops.</p>
                  <Link href={workspaceHref}>
                    <Button variant="outline" size="sm" className="group whitespace-nowrap">
                      Explore the Platform
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SamplePlansModal open={sampleModalOpen} onOpenChange={setSampleModalOpen} />
    </section>
  );
}
