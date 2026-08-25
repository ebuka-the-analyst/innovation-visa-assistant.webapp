import { X, Sparkles, Brain, Shield, Rocket, Clock, CheckCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface Feature {
  id: string;
  title: string;
  shortDesc: string;
  icon: LucideIcon;
  detailedInstructions: string[];
  benefits: string[];
  color: string;
}

const FEATURES: Feature[] = [
  {
    id: "ai-intelligence",
    title: "Managed AI Assistance",
    shortDesc: "Managed AI infrastructure supports OpenAI and Anthropic models to help draft and review business-planning content.",
    icon: Brain,
    color: "from-orange-400 to-orange-600",
    detailedInstructions: [
      "Uses your questionnaire responses and saved business context as inputs",
      "Helps structure content around Innovation, Viability and Scalability",
      "Can support drafting, comparison and review workflows",
      "Keeps provider selection behind the platform's managed AI gateway",
      "Produces material for you to review rather than an endorsement or visa decision"
    ],
    benefits: [
      "Reduces repetitive drafting work",
      "Keeps business-plan sections organised",
      "Supports sector-specific wording where your evidence supports it",
      "Allows iterative review and refinement",
      "Makes AI use transparent and reviewable"
    ]
  },
  {
    id: "endorsing-ready",
    title: "Endorsement-Criteria Structure",
    shortDesc: "Organises preparation around published Innovator Founder requirements and publicly available endorsing-body information.",
    icon: Shield,
    color: "from-blue-400 to-blue-600",
    detailedInstructions: [
      "Structures business-plan evidence around published Innovator Founder criteria",
      "Uses current public information about authorised endorsing bodies where available",
      "Helps identify claims that need stronger evidence or explanation",
      "Keeps supporting evidence and assumptions visible for review",
      "Encourages checking current GOV.UK and endorsing-body requirements before submission"
    ],
    benefits: [
      "Clearer evidence mapping",
      "More consistent preparation materials",
      "Easier handoff for independent professional review",
      "Reduced risk of overlooking obvious preparation gaps",
      "No claim of endorsement, certification or approval"
    ]
  },
  {
    id: "scalability-focus",
    title: "Scalability Focus",
    shortDesc: "Helps document structured growth planning, market expansion and potential job creation where relevant to your business.",
    icon: Rocket,
    color: "from-yellow-400 to-yellow-600",
    detailedInstructions: [
      "Maps realistic growth milestones from your own assumptions",
      "Helps document potential job creation without inventing fixed targets",
      "Explores national and international market expansion where relevant",
      "Connects growth plans to resources, capabilities and financial assumptions",
      "Encourages evidence for why the proposed growth path is achievable"
    ],
    benefits: [
      "More explicit growth assumptions",
      "Clearer link between strategy and resources",
      "Better visibility of evidence gaps",
      "Scenario-based planning instead of guaranteed outcomes",
      "Alignment with published scalability considerations"
    ]
  },
  {
    id: "fifteen-minute",
    title: "AI-Assisted Drafting",
    shortDesc: "Turns structured questionnaire responses into editable planning drafts. Generation time varies with plan depth and system load.",
    icon: Clock,
    color: "from-teal-400 to-teal-600",
    detailedInstructions: [
      "Complete the structured questionnaire with accurate business information",
      "The platform organises your responses into a business-plan workflow",
      "AI-assisted drafting prepares sections for your review",
      "You can revise assumptions, evidence and wording before relying on the output",
      "Generation time varies depending on plan complexity, provider availability and system load"
    ],
    benefits: [
      "Faster first-draft preparation",
      "Consistent plan structure",
      "More time for evidence gathering and review",
      "Supports iterative refinement",
      "Avoids promising a fixed delivery time"
    ]
  },
  {
    id: "compliance",
    title: "Compliance-Focused Checks",
    shortDesc: "Flags potential gaps against configured Innovation, Viability and Scalability checks without guaranteeing legal or visa compliance.",
    icon: CheckCircle,
    color: "from-green-400 to-green-600",
    detailedInstructions: [
      "Checks whether configured preparation criteria have supporting information",
      "Flags missing or weakly supported statements for review",
      "Cross-checks related sections for obvious inconsistencies",
      "Uses published route information as a reference point where configured",
      "Does not replace current GOV.UK rules or regulated immigration advice"
    ],
    benefits: [
      "More visible preparation gaps",
      "Improved internal consistency",
      "Clearer review workflow",
      "No false compliance certification",
      "Encourages independent verification before submission"
    ]
  },
  {
    id: "financial",
    title: "Financial Projections",
    shortDesc: "Builds scenario-based forecasts from your assumptions so you can review and refine the financial case for your venture.",
    icon: TrendingUp,
    color: "from-indigo-400 to-indigo-600",
    detailedInstructions: [
      "Builds projections from the revenue, cost and growth assumptions you provide",
      "Supports base, downside and upside scenario planning",
      "Helps connect staffing, operating costs and funding needs",
      "Makes key assumptions visible for review and challenge",
      "Treats projections as estimates rather than guaranteed future performance"
    ],
    benefits: [
      "Clearer financial assumptions",
      "Scenario-based viability planning",
      "Better consistency between narrative and numbers",
      "Useful material for independent review",
      "No fabricated benchmark or profitability guarantee"
    ]
  }
];

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureId?: string;
}

export default function FeaturesModal({ isOpen, onClose, featureId }: FeaturesModalProps) {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState(featureId || FEATURES[0].id);
  const feature = FEATURES.find(f => f.id === selectedId);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", maxHeight: "90vh", overflowY: "auto" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-chart-3/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-chart-3/5 dark:from-slate-800 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">Feature Details</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors" data-testid="button-close-features-modal">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-0 p-6">
              <div className="lg:col-span-1 space-y-2 mb-6 lg:mb-0 lg:border-r border-border pr-0 lg:pr-4">
                {FEATURES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedId === f.id ? "bg-gradient-to-r from-primary to-chart-3 text-white shadow-lg scale-105" : "hover:bg-muted text-foreground"}`}
                    data-testid={`button-feature-${f.id}`}
                  >
                    <div className="text-xl mb-1"><f.icon className="w-6 h-6" /></div>
                    <div className="text-sm font-semibold">{f.title}</div>
                  </button>
                ))}
              </div>

              {feature && (
                <div className="lg:col-span-3 lg:pl-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                      <feature.icon className="w-10 h-10 text-primary" />
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">{feature.shortDesc}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}><CheckCircle className="w-4 h-4" /></span>
                      How It Works
                    </h4>
                    <ul className="space-y-2">
                      {feature.detailedInstructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3 text-foreground">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{idx + 1}</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}><Sparkles className="w-4 h-4" /></span>
                      What It Helps With
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors">
                          <p className="text-sm text-foreground">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-6 bg-muted/30 dark:bg-slate-800 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Ready to start your preparation workflow?</p>
              <button
                onClick={() => { onClose(); setLocation("/pricing"); }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-chart-3 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
                data-testid="button-start-from-modal"
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
