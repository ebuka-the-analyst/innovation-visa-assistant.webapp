import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  ClipboardCheck,
  FileText,
  FolderCheck,
  Rocket,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import SamplePlansModal from "./SamplePlansModal";
import { useAuth } from "@/hooks/useAuth";

const preparationAreas = [
  { label: "Business Plan", icon: FileText },
  { label: "Evidence", icon: FolderCheck },
  { label: "Financials", icon: Calculator },
  { label: "Review", icon: ClipboardCheck },
];

const workspaceItems = [
  {
    title: "Business Plan",
    description: "Build and refine your business plan",
    icon: FileText,
  },
  {
    title: "Founder Profile",
    description: "Capture founder background and experience",
    icon: UserRound,
  },
  {
    title: "Innovation Evidence",
    description: "Organise supporting evidence",
    icon: FolderCheck,
  },
  {
    title: "Financial Forecast",
    description: "Build revenue, costs and projections",
    icon: Calculator,
  },
  {
    title: "Scalability Strategy",
    description: "Structure market and growth planning",
    icon: Rocket,
  },
];

export default function HeroSection() {
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const hasPaidPlan = isAuthenticated && user?.subscriptionTier && user.subscriptionTier !== "free";
  const generatePlanHref = hasPaidPlan ? "/questionnaire" : "/pricing";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5 py-7 md:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="responsive-container relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] xl:gap-12">
          <div className="space-y-6">
            <h1 className="max-w-2xl font-serif text-3xl font-bold leading-[1.08] text-foreground md:text-4xl xl:text-5xl">
              Prepare a Stronger UK Innovator Founder{" "}
              <span className="text-[#005EB8]">Application</span>
            </h1>

            <div className="max-w-xl space-y-3">
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                AI-assisted tools to help you build, review and strengthen your Innovator Founder business plan and supporting evidence.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Structured around published Innovator Founder requirements. Always verify current requirements on GOV.UK.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 shrink-0 text-chart-3" />
                <span>AI-Assisted Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 shrink-0 text-chart-3" />
                <span>Published Criteria Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 shrink-0 text-chart-3" />
                <span>Editable Preparation Materials</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href={generatePlanHref}>
                <Button size="lg" className="group w-full sm:w-auto" data-testid="button-generate-plan">
                  Start My Business Plan
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                data-testid="button-view-sample"
                onClick={() => setSampleModalOpen(true)}
              >
                See Sample Plans
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="pointer-events-none absolute inset-x-10 inset-y-8 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[1.75rem] border border-border/80 bg-card/80 p-5 shadow-xl backdrop-blur-sm xl:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Preparation overview</p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground xl:text-2xl">Your Preparation Workspace</h2>
                </div>
                <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  Workspace preview
                </span>
              </div>

              <div className="space-y-2.5" aria-label="Workspace areas available in the platform">
                {workspaceItems.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground xl:text-sm">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground xl:text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  <span>Everything remains editable as you refine your application.</span>
                </div>
                <Link href="/features">
                  <Button size="sm" variant="outline" className="group shrink-0">
                    Explore the Platform
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="Preparation areas supported by the platform">
          {preparationAreas.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/75 px-3 py-2.5 text-sm shadow-sm backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <SamplePlansModal open={sampleModalOpen} onOpenChange={setSampleModalOpen} />
    </section>
  );
}
