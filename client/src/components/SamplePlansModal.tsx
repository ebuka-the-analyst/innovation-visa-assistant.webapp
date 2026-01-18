import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, FileText, BarChart3, PieChart, TrendingUp, Users, Briefcase, Award, FileCheck, Sparkles, Target, Rocket, Building2, Zap, Shield, Clock, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
      { icon: Target, text: "Pre-revenue but 12 pilot agreements with Fortune 500 companies" },
      { icon: Users, text: "3 founders with 50+ years combined ML experience" },
      { icon: TrendingUp, text: "£150K seed funding from angel investors" },
      { icon: Briefcase, text: "Committed to hiring 5+ ML engineers in Year 1" },
      { icon: BarChart3, text: "Projected £500K ARR by Year 2, £2M by Year 3" }
    ],
    features: ["Interactive Charts", "Financial Projections", "Market Analysis", "Competitor Matrix", "& more..."],
    gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
    accentColor: "text-violet-600 dark:text-violet-400",
    badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
    pages: "45-55",
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
      { icon: TrendingUp, text: "£80K MRR with 250+ active merchant accounts" },
      { icon: Award, text: "Founder: Ex-PayPal VP of Product" },
      { icon: Building2, text: "£500K Series A funding from UK VCs" },
      { icon: Users, text: "Already hired 8 FTE in 8 months" },
      { icon: Rocket, text: "Targeting £10M ARR by Year 2" }
    ],
    features: ["Executive Summary", "Risk Analysis", "Compliance Framework", "Growth Roadmap", "Investment Deck", "& more..."],
    gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    accentColor: "text-amber-600 dark:text-amber-400",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    pages: "60-75",
    pdfUrl: "#"
  },
  {
    id: "cleantech",
    title: "CleanTech Energy",
    tier: "basic",
    industry: "Sustainable Technology",
    businessName: "GreenFlow Innovations",
    summary: "IoT-enabled smart energy management system for reducing commercial building energy consumption by 25-35%.",
    highlights: [
      { icon: FileCheck, text: "MVP complete with 5 beta customers" },
      { icon: Award, text: "Founder: Expert in Environmental Engineering" },
      { icon: Building2, text: "£50K bootstrapped from personal savings" },
      { icon: Briefcase, text: "Hiring Head of Sales Q2 2025" },
      { icon: Target, text: "£250K revenue target Year 2" }
    ],
    features: ["Business Overview", "Market Analysis", "Financial Summary", "Team Profile", "& more..."],
    gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    pages: "25-35",
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
      { icon: Shield, text: "2 patents filed, 1 pending approval" },
      { icon: Users, text: "Founder team: 2 Research Scientists + NHS consultant" },
      { icon: TrendingUp, text: "£1.2M Series A from Imperial Innovations" },
      { icon: FileCheck, text: "NHS pilot agreement for 50K annual tests" },
      { icon: Briefcase, text: "Hiring 3 lab technicians + 1 regulatory officer" }
    ],
    features: ["IP Strategy", "Regulatory Roadmap", "Clinical Trial Plan", "NHS Partnership", "Scalability Model", "& more..."],
    gradient: "from-rose-500/20 via-pink-500/10 to-red-500/20",
    accentColor: "text-rose-600 dark:text-rose-400",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    pages: "65-80",
    pdfUrl: "#"
  },
  {
    id: "edtech",
    title: "EdTech Platform",
    tier: "premium",
    industry: "Education Technology",
    businessName: "LearnFlow AI",
    summary: "Personalized AI tutoring platform for STEM subjects used by 100+ UK schools with measurable learning outcomes.",
    highlights: [
      { icon: TrendingUp, text: "£120K ARR from 50 school subscriptions" },
      { icon: Award, text: "Founder: Former head of teaching at top private school" },
      { icon: Building2, text: "£200K pre-seed from angel investors" },
      { icon: Users, text: "Planning 2 hires: Sales + Product" },
      { icon: Target, text: "Target: 500 school subscriptions by Year 2" }
    ],
    features: ["Interactive Charts", "Customer Journey", "Unit Economics", "Growth Metrics", "& more..."],
    gradient: "from-blue-500/20 via-indigo-500/10 to-cyan-500/20",
    accentColor: "text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    pages: "40-50",
    pdfUrl: "#"
  },
  {
    id: "logistics",
    title: "Supply Chain Optimization",
    tier: "basic",
    industry: "Logistics Tech",
    businessName: "RouteOptim",
    summary: "Real-time route optimization software reducing delivery times by 30% and costs for logistics companies.",
    highlights: [
      { icon: FileCheck, text: "MVP deployed with 3 logistics companies" },
      { icon: Award, text: "Founder: 8 years at DHL Supply Chain" },
      { icon: Building2, text: "£60K bootstrap + £40K angel funding" },
      { icon: Briefcase, text: "First hire: Senior Developer (Q1 2025)" },
      { icon: BarChart3, text: "£400K revenue projection Year 2" }
    ],
    features: ["Business Overview", "Competitor Analysis", "Revenue Model", "Hiring Plan", "& more..."],
    gradient: "from-sky-500/20 via-blue-500/10 to-indigo-500/20",
    accentColor: "text-sky-600 dark:text-sky-400",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
    pages: "28-38",
    pdfUrl: "#"
  }
];

interface SamplePlan {
  id: string;
  title: string;
  tier: string;
  industry: string;
  businessName: string;
  summary: string;
  highlights: { icon: any; text: string }[];
  features: string[];
  gradient: string;
  accentColor: string;
  badgeColor: string;
  pages: string;
  pdfUrl: string;
}

export default function SamplePlansModal({ open, onOpenChange }: SamplePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SamplePlan | null>(null);
  const [viewFullOpen, setViewFullOpen] = useState(false);
  const { toast } = useToast();

  const handleViewFull = (plan: SamplePlan) => {
    setSelectedPlan(plan);
    setViewFullOpen(true);
  };

  const handleDownload = (plan: SamplePlan) => {
    toast({
      title: "Sample PDF Preview",
      description: `Full business plan for ${plan.businessName} (${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} tier) is available after you generate your own plan. Complete the questionnaire and select your tier to get started!`,
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "basic": return <Zap className="w-3 h-3" />;
      case "premium": return <Sparkles className="w-3 h-3" />;
      case "enterprise": return <Award className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "basic": return { label: "Basic", color: "bg-emerald-500 text-white" };
      case "premium": return { label: "Premium", color: "bg-violet-500 text-white" };
      case "enterprise": return { label: "Enterprise", color: "bg-amber-500 text-white" };
      default: return { label: tier, color: "bg-gray-500 text-white" };
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Sample Business Plans
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            See what our AI generates - real examples of visa-ready business plans
          </DialogDescription>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <Badge variant="outline" className="gap-1 px-3 py-1" data-testid="badge-feature-charts">
              <BarChart3 className="w-3 h-3" />
              Visual Charts
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1" data-testid="badge-feature-tables">
              <PieChart className="w-3 h-3" />
              Financial Tables
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1" data-testid="badge-feature-toc">
              <FileCheck className="w-3 h-3" />
              Table of Contents
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1" data-testid="badge-feature-time">
              <Clock className="w-3 h-3" />
              Under 15 Minutes
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-5 gap-1 mb-6 h-auto p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2" data-testid="tab-sample-all">All Plans</TabsTrigger>
            <TabsTrigger value="basic" className="text-xs sm:text-sm py-2 gap-1" data-testid="tab-sample-basic">
              <Zap className="w-3 h-3 hidden sm:inline" /> Basic
            </TabsTrigger>
            <TabsTrigger value="premium" className="text-xs sm:text-sm py-2 gap-1" data-testid="tab-sample-premium">
              <Sparkles className="w-3 h-3 hidden sm:inline" /> Premium
            </TabsTrigger>
            <TabsTrigger value="enterprise" className="text-xs sm:text-sm py-2 gap-1" data-testid="tab-sample-enterprise">
              <Award className="w-3 h-3 hidden sm:inline" /> Enterprise
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs sm:text-sm py-2" data-testid="tab-sample-features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {SAMPLE_PLANS.map((plan) => (
              <SamplePlanCard 
                key={plan.id} 
                plan={plan} 
                onViewFull={handleViewFull} 
                onDownload={handleDownload}
                getTierLabel={getTierLabel}
                getTierIcon={getTierIcon}
              />
            ))}
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            {SAMPLE_PLANS.filter(p => p.tier === "basic").length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No Basic tier examples available</p>
            ) : (
              SAMPLE_PLANS.filter(p => p.tier === "basic").map((plan) => (
                <SamplePlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onViewFull={handleViewFull} 
                  onDownload={handleDownload}
                  getTierLabel={getTierLabel}
                  getTierIcon={getTierIcon}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="premium" className="space-y-4">
            {SAMPLE_PLANS.filter(p => p.tier === "premium").map((plan) => (
              <SamplePlanCard 
                key={plan.id} 
                plan={plan} 
                onViewFull={handleViewFull} 
                onDownload={handleDownload}
                getTierLabel={getTierLabel}
                getTierIcon={getTierIcon}
              />
            ))}
          </TabsContent>

          <TabsContent value="enterprise" className="space-y-4">
            {SAMPLE_PLANS.filter(p => p.tier === "enterprise").map((plan) => (
              <SamplePlanCard 
                key={plan.id} 
                plan={plan} 
                onViewFull={handleViewFull} 
                onDownload={handleDownload}
                getTierLabel={getTierLabel}
                getTierIcon={getTierIcon}
              />
            ))}
          </TabsContent>

          <TabsContent value="features">
            <div className="space-y-6">
              {/* What's Included */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl" />
                <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  What Every Plan Includes
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-full bg-emerald-500/20">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold">Visual Charts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">KPI dashboards, market sizing, financial projections - all auto-generated</p>
                  </div>
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-full bg-blue-500/20">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold">Table of Contents</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Clickable navigation with professional formatting and section links</p>
                  </div>
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-full bg-violet-500/20">
                        <TrendingUp className="w-4 h-4 text-violet-600" />
                      </div>
                      <h4 className="font-semibold">Financial Tables</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Year 1, 2, 3 projections in professionally styled HTML tables</p>
                  </div>
                </div>
              </div>

              {/* Tier Comparison */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20 p-6">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-2xl" />
                <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-500" />
                  Tier Comparison
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Basic Tier */}
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-5 border border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl" />
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-bold text-lg">Basic</h4>
                      <Badge className="bg-emerald-500 text-white ml-auto">£9</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 25-35 pages</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 11 core sections</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Visual charts included</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> PDF + Word download</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Table of Contents</li>
                    </ul>
                  </div>
                  
                  {/* Premium Tier */}
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-5 border-2 border-violet-500/50 relative overflow-hidden ring-2 ring-violet-500/20">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/30 to-transparent rounded-full blur-xl" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs px-3 py-0.5 rounded-full font-semibold">
                      MOST POPULAR
                    </div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      <h4 className="font-bold text-lg">Premium</h4>
                      <Badge className="bg-violet-500 text-white ml-auto">£19</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-500" /> 40-55 pages</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-500" /> 13 comprehensive sections</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-500" /> All charts + financial tables</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-500" /> Competitor analysis</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-500" /> Risk mitigation plan</li>
                    </ul>
                  </div>
                  
                  {/* Enterprise Tier */}
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-5 border border-amber-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-xl" />
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-lg">Enterprise</h4>
                      <Badge className="bg-amber-500 text-white ml-auto">£29</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> 55-80 pages</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> 13+ expert sections</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> All Premium features</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> IP & regulatory strategy</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> Investment deck ready</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Success Factors */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 p-6">
                <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  What Makes These Plans Successful?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-full bg-amber-500/20 shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Strong Innovation Narrative</h4>
                      <p className="text-sm text-muted-foreground">Clear IP strategy, differentiation from competitors</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-full bg-amber-500/20 shrink-0">
                      <Target className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Proven Market Validation</h4>
                      <p className="text-sm text-muted-foreground">Customer pilots, LOIs, measurable traction</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-full bg-amber-500/20 shrink-0">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Realistic Financial Projections</h4>
                      <p className="text-sm text-muted-foreground">Benchmarked against comparable ventures</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-full bg-amber-500/20 shrink-0">
                      <Users className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Clear Job Creation Plan</h4>
                      <p className="text-sm text-muted-foreground">Specific roles, UK salaries, hiring timeline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {/* View Full Plan Modal */}
    <Dialog open={viewFullOpen} onOpenChange={setViewFullOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedPlan?.gradient}`}>
              <Briefcase className={`w-5 h-5 ${selectedPlan?.accentColor}`} />
            </div>
            <div>
              <DialogTitle className="text-2xl">{selectedPlan?.businessName}</DialogTitle>
              <DialogDescription>{selectedPlan?.title} | {selectedPlan?.industry}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {selectedPlan && (
          <div className="space-y-6">
            {/* Tier & Pages Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={getTierLabel(selectedPlan.tier).color + " gap-1"}>
                {getTierIcon(selectedPlan.tier)}
                {getTierLabel(selectedPlan.tier).label}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" />
                {selectedPlan.pages} pages
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                Generated in ~15 min
              </Badge>
            </div>

            <div className={`p-4 rounded-lg bg-gradient-to-br ${selectedPlan.gradient} border border-border/50`}>
              <h3 className="font-semibold text-lg mb-2">Business Overview</h3>
              <p className="text-sm">{selectedPlan.summary}</p>
            </div>

            {/* Features Included */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">SECTIONS INCLUDED</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Key Highlights</h3>
              <div className="space-y-2">
                {selectedPlan.highlights.map((highlight, idx) => {
                  const IconComponent = highlight.icon;
                  return (
                    <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg items-start">
                      <div className={`p-1.5 rounded-full bg-gradient-to-br ${selectedPlan.gradient} shrink-0`}>
                        <IconComponent className={`w-4 h-4 ${selectedPlan.accentColor}`} />
                      </div>
                      <p className="text-sm">{highlight.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <p>
                  This is a sample {selectedPlan.tier.charAt(0).toUpperCase() + selectedPlan.tier.slice(1)} tier plan. 
                  Generate your own visa-ready business plan in under 15 minutes!
                </p>
              </div>
              <Button 
                onClick={() => {
                  setViewFullOpen(false);
                  onOpenChange(false);
                }}
                className="w-full gap-2 bg-emerald-500 text-white font-semibold shadow-md"
                data-testid="button-generate-plan-from-sample"
              >
                <Rocket className="w-4 h-4" />
                Generate Your Plan Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

interface SamplePlanCardProps {
  plan: typeof SAMPLE_PLANS[0];
  onViewFull: (plan: SamplePlan) => void;
  onDownload: (plan: SamplePlan) => void;
  getTierLabel: (tier: string) => { label: string; color: string };
  getTierIcon: (tier: string) => JSX.Element | null;
}

function SamplePlanCard({ plan, onViewFull, onDownload, getTierLabel, getTierIcon }: SamplePlanCardProps) {
  return (
    <Card className={`relative overflow-hidden hover-elevate`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50`}>
              <Briefcase className={`w-5 h-5 ${plan.accentColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{plan.businessName}</h3>
              <p className="text-sm text-muted-foreground">{plan.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <FileText className="w-3 h-3" />
              {plan.pages} pages
            </Badge>
            <Badge className={getTierLabel(plan.tier).color + " gap-1 font-semibold"}>
              {getTierIcon(plan.tier)}
              {getTierLabel(plan.tier).label}
            </Badge>
          </div>
        </div>

        <p className="text-sm mb-4">{plan.summary}</p>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.features.slice(0, 4).map((feature, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs bg-background/60">
              {feature}
            </Badge>
          ))}
          {plan.features.length > 4 && (
            <Badge variant="secondary" className="text-xs bg-background/60">
              +{plan.features.length - 4} more
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {plan.highlights.slice(0, 3).map((highlight, idx) => {
            const IconComponent = highlight.icon;
            return (
              <div key={idx} className="flex gap-2 text-sm items-start">
                <IconComponent className={`w-4 h-4 ${plan.accentColor} shrink-0 mt-0.5`} />
                <span>{highlight.text}</span>
              </div>
            );
          })}
          {plan.highlights.length > 3 && (
            <p className="text-xs text-muted-foreground pl-6">+ {plan.highlights.length - 3} more highlights...</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            className="gap-2 bg-emerald-500 text-white font-semibold shadow-md"
            onClick={() => onDownload(plan)}
            data-testid={`button-download-sample-${plan.id}`}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 bg-background/80 backdrop-blur-sm"
            onClick={() => onViewFull(plan)}
            data-testid={`button-view-sample-${plan.id}`}
          >
            <ExternalLink className="w-4 h-4" />
            View Full
          </Button>
        </div>
      </div>
    </Card>
  );
}
