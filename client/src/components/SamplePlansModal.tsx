import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink } from "lucide-react";

interface SamplePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_PLANS = [
  {
    id: "aiml-saas",
    title: "AI/ML SaaS Platform",
    tier: "premium",
    industry: "Artificial Intelligence",
    businessName: "DataMind Analytics",
    summary: "Enterprise-grade AI analytics platform helping SMEs predict customer behavior using proprietary ML algorithms.",
    highlights: [
      "Pre-revenue but 12 pilot agreements with Fortune 500 companies",
      "3 founders with 50+ years combined ML experience",
      "£150K seed funding from angel investors",
      "Committed to hiring 5+ ML engineers in Year 1",
      "Projected £500K ARR by Year 2, £2M by Year 3"
    ],
    pdfUrl: "#"
  },
  {
    id: "fintech",
    title: "FinTech Payment Solution",
    tier: "enterprise",
    industry: "Financial Technology",
    businessName: "PayVenture",
    summary: "B2B payment infrastructure for cross-border SME transactions with AI-powered fraud detection.",
    highlights: [
      "£80K MRR with 250+ active merchant accounts",
      "Founder: Ex-PayPal VP of Product",
      "£500K Series A funding from UK VCs",
      "Already hired 8 FTE in 8 months",
      "Targeting £10M ARR by Year 2"
    ],
    pdfUrl: "#"
  },
  {
    id: "cleantech",
    title: "CleanTech Energy",
    tier: "basic",
    industry: "Sustainable Technology",
    businessName: "GreenFlow Innovations",
    summary: "IoT-enabled smart energy management system for reducing commercial building energy consumption.",
    highlights: [
      "MVP complete with 5 beta customers saving 25-35% energy costs",
      "Founder: PhD in Environmental Engineering",
      "£50K bootstrapped from personal savings",
      "Hiring Head of Sales Q2 2025",
      "£250K revenue target Year 2"
    ],
    pdfUrl: "#"
  },
  {
    id: "biotech",
    title: "Biotech Diagnostics",
    tier: "enterprise",
    industry: "Biotechnology",
    businessName: "ProDiagnose Labs",
    summary: "Rapid diagnostic platform using proprietary biomarker detection for early cancer screening.",
    highlights: [
      "2 patents filed, 1 pending approval",
      "Founder team: 2 PhDs + NHS consultant",
      "£1.2M Series A from Imperial Innovations",
      "NHS pilot agreement for 50K annual tests",
      "Hiring 3 lab technicians + 1 regulatory officer"
    ],
    pdfUrl: "#"
  },
  {
    id: "edtech",
    title: "EdTech Platform",
    tier: "premium",
    industry: "Education Technology",
    businessName: "LearnFlow AI",
    summary: "Personalized AI tutoring platform for STEM subjects used by 100+ UK schools.",
    highlights: [
      "£120K ARR from 50 school subscriptions",
      "Founder: Former head of teaching at top private school",
      "£200K pre-seed from angel investors",
      "Planning 2 hires: Sales + Product",
      "Target: 500 school subscriptions by Year 2"
    ],
    pdfUrl: "#"
  },
  {
    id: "logistics",
    title: "Supply Chain Optimization",
    tier: "basic",
    industry: "Logistics Tech",
    businessName: "RouteOptim",
    summary: "Real-time route optimization software reducing delivery times and costs for logistics companies.",
    highlights: [
      "MVP deployed with 3 logistics companies",
      "Founder: 8 years at DHL Supply Chain",
      "£60K bootstrap + £40K angel funding",
      "First hire: Senior Developer (Q1 2025)",
      "£400K revenue projection Year 2"
    ],
    pdfUrl: "#"
  }
];

export default function SamplePlansModal({ open, onOpenChange }: SamplePlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sample Business Plans</DialogTitle>
          <DialogDescription>
            Real-world examples of approved Innovation Visa business plans across different industries
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-2 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {SAMPLE_PLANS.map((plan) => (
              <Card key={plan.id} className="p-6 hover-elevate">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{plan.businessName}</h3>
                    <p className="text-sm text-muted-foreground">{plan.title}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    plan.tier === "basic" ? "bg-blue-100 text-blue-900" :
                    plan.tier === "premium" ? "bg-purple-100 text-purple-900" :
                    "bg-amber-100 text-amber-900"
                  }`}>
                    {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
                  </span>
                </div>

                <p className="text-sm mb-4 text-muted-foreground">{plan.summary}</p>

                <div className="space-y-2 mb-4">
                  {plan.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">✓</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            {SAMPLE_PLANS.filter(p => p.tier === "basic").map((plan) => (
              <SamplePlanCard key={plan.id} plan={plan} />
            ))}
          </TabsContent>

          <TabsContent value="premium" className="space-y-4">
            {SAMPLE_PLANS.filter(p => p.tier === "premium").map((plan) => (
              <SamplePlanCard key={plan.id} plan={plan} />
            ))}
          </TabsContent>

          <TabsContent value="enterprise" className="space-y-4">
            {SAMPLE_PLANS.filter(p => p.tier === "enterprise").map((plan) => (
              <SamplePlanCard key={plan.id} plan={plan} />
            ))}
          </TabsContent>

          <TabsContent value="features">
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-lg">What Makes These Plans Successful?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">✓ Strong Innovation Narrative</h4>
                    <p className="text-sm text-muted-foreground">Clear IP strategy, patent status, differentiation from competitors</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">✓ Proven Market Validation</h4>
                    <p className="text-sm text-muted-foreground">Customer pilots, LOIs, beta tester feedback with measurable traction</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">✓ Realistic Financial Projections</h4>
                    <p className="text-sm text-muted-foreground">Benchmarked against comparable ventures, achievable milestones</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">✓ Credible Founder Credentials</h4>
                    <p className="text-sm text-muted-foreground">Relevant domain expertise, track record of execution, team depth</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">✓ Clear Job Creation Plan</h4>
                    <p className="text-sm text-muted-foreground">Specific roles, UK salaries, hiring timeline aligned with growth</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">✓ Scalability Roadmap</h4>
                    <p className="text-sm text-muted-foreground">Geographic expansion, market sizing, path to profitability</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-lg">Tier Comparison</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-bold mb-3">Basic (£49)</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>✓ 25-35 pages</li>
                      <li>✓ Core sections</li>
                      <li>✓ 1 revision</li>
                      <li>✓ PDF download</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Premium (£99)</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>✓ 40-60 pages</li>
                      <li>✓ All sections</li>
                      <li>✓ 3 revisions</li>
                      <li>✓ Financial tables</li>
                      <li>✓ Chat support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Enterprise (£199)</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>✓ 50-80 pages</li>
                      <li>✓ All sections +</li>
                      <li>✓ Unlimited revisions</li>
                      <li>✓ Expert review</li>
                      <li>✓ Lawyer consultation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SamplePlanCard({ plan }: { plan: typeof SAMPLE_PLANS[0] }) {
  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{plan.businessName}</h3>
          <p className="text-sm text-muted-foreground">{plan.title}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          plan.tier === "basic" ? "bg-blue-100 text-blue-900" :
          plan.tier === "premium" ? "bg-purple-100 text-purple-900" :
          "bg-amber-100 text-amber-900"
        }`}>
          {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
        </span>
      </div>

      <p className="text-sm mb-4 text-muted-foreground">{plan.summary}</p>

      <div className="space-y-2 mb-4">
        {plan.highlights.map((highlight, idx) => (
          <div key={idx} className="flex gap-2 text-sm">
            <span className="text-primary font-bold">✓</span>
            <span>{highlight}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          View Full
        </Button>
      </div>
    </Card>
  );
}
