import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileCheck, FileText, Info, PieChart, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface SamplePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_PLANS = [
  {
    title: "AI Analytics SaaS",
    industry: "Software",
    summary: "Illustrative example showing how a founder might structure an original proposition, market need, operating model and evidence-backed growth assumptions.",
    themes: ["Innovation narrative", "Market evidence", "Financial assumptions", "Scalability planning"],
  },
  {
    title: "Sustainable Logistics Platform",
    industry: "Logistics Technology",
    summary: "Illustrative example showing how a business plan can connect customer pain points, competitive advantage, available resources and a realistic route to scale.",
    themes: ["Customer problem", "Competitive positioning", "Operational viability", "Growth scenarios"],
  },
  {
    title: "Health Operations Software",
    industry: "Health Technology",
    summary: "Illustrative example showing how a regulated-sector venture can separate business assumptions, supporting evidence, risks and implementation planning.",
    themes: ["Evidence mapping", "Risk analysis", "Commercial model", "Implementation plan"],
  },
];

export default function SamplePlansModal({ open, onOpenChange }: SamplePlanModalProps) {
  const [, setLocation] = useLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Illustrative Business Plan Samples
            </DialogTitle>
          </div>
          <Badge className="mx-auto bg-amber-100 text-amber-900 hover:bg-amber-100 border border-amber-300">FICTIONAL EXAMPLES ONLY</Badge>
          <DialogDescription className="text-base mt-2">
            Fictional preparation examples showing possible structure and evidence themes. They are not real customer applications, endorsements or approved visa cases.
          </DialogDescription>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <Badge variant="outline" className="gap-1 px-3 py-1"><BarChart3 className="w-3 h-3" />Planning Charts</Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1"><PieChart className="w-3 h-3" />Financial Scenarios</Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1"><FileCheck className="w-3 h-3" />Evidence Structure</Badge>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground flex gap-3 mt-4">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p>
            Sample content is illustrative only. Your generated material depends on the information and assumptions you provide and should be checked before use against current GOV.UK requirements and, where appropriate, by a regulated professional.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-6">
          {SAMPLE_PLANS.map((plan) => (
            <Card key={plan.title} className="p-5 hover-elevate relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-lg bg-amber-100 px-2 py-1 text-[10px] font-bold tracking-wide text-amber-900">FICTIONAL EXAMPLE</div>
              <div className="flex items-center gap-2 mb-3 pt-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <Badge variant="secondary">FICTIONAL EXAMPLE</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">{plan.title}</h3>
              <p className="text-xs text-primary mb-3">{plan.industry}</p>
              <p className="text-sm text-muted-foreground mb-4">{plan.summary}</p>
              <ul className="space-y-2">
                {plan.themes.map((theme) => (
                  <li key={theme} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-5">
          <p className="text-sm text-muted-foreground">Want to see the current plan options and tool access?</p>
          <Button onClick={() => { onOpenChange(false); setLocation("/pricing"); }} data-testid="button-sample-plans-pricing">
            View Pricing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
