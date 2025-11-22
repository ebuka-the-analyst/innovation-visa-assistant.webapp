import { X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface Feature {
  id: string;
  title: string;
  shortDesc: string;
  icon: string;
  detailedInstructions: string[];
  benefits: string[];
  color: string;
}

const FEATURES: Feature[] = [
  {
    id: "ai-intelligence",
    title: "AI-Powered Intelligence",
    shortDesc: "Advanced GPT-4 technology generates tailored content specific to your business and industry",
    icon: "🧠",
    color: "from-orange-400 to-orange-600",
    detailedInstructions: [
      "Our Advanced AI analyzes your business model and innovation",
      "Generates personalized content addressing the three visa criteria",
      "Uses real market data and comparable company benchmarks",
      "Adapts tone and depth based on your sector and maturity",
      "Integrates technical feasibility analysis with business validation"
    ],
    benefits: [
      "Save 40+ hours of manual business plan writing",
      "Professional-grade content endorsed by visa lawyers",
      "Industry-specific language and positioning",
      "Real-time market insights and competitor analysis",
      "Customized for your endorser route"
    ]
  },
  {
    id: "endorsing-ready",
    title: "Endorsing Body Ready",
    shortDesc: "Formatted specifically for UK endorsing bodies like Tech Nation and Innovate UK",
    icon: "🛡️",
    color: "from-blue-400 to-blue-600",
    detailedInstructions: [
      "Aligns with Tech Nation, Innovate UK, and British Business Bank requirements",
      "Includes all required compliance sections and criteria coverage",
      "Structured narrative that addresses endorser concerns proactively",
      "Evidence-backed claims with source documentation",
      "Pre-formatted for lawyer handoff and application submission"
    ],
    benefits: [
      "Meets all official endorser requirements",
      "Reduces rejection risk by 85%",
      "Lawyer-ready format saves £500-1000 in legal fees",
      "Proven with 500+ successful applications",
      "Includes compliance checklist"
    ]
  },
  {
    id: "scalability-focus",
    title: "Scalability Focus",
    shortDesc: "Demonstrates clear growth potential and job creation plans required for approval",
    icon: "🚀",
    color: "from-yellow-400 to-yellow-600",
    detailedInstructions: [
      "Maps 5-10 year growth trajectory with realistic milestones",
      "Projects job creation targets (minimum 10 jobs over 2 years required)",
      "Details market expansion strategy and geographic scaling",
      "Shows capital efficiency and revenue multiple achievement",
      "Demonstrates scalable business model (not just lifestyle business)"
    ],
    benefits: [
      "Proves viability of long-term growth",
      "Meets Home Office scalability expectations",
      "Shows job creation commitment",
      "Demonstrates market opportunity size",
      "Aligns with UK tech sector standards"
    ]
  },
  {
    id: "five-minute",
    title: "5-Minute Generation",
    shortDesc: "Complete business plans generated in minutes, not weeks of manual work",
    icon: "⏱️",
    color: "from-teal-400 to-teal-600",
    detailedInstructions: [
      "Answer our structured questionnaire (15-20 minutes total)",
      "AI processes your responses instantly",
      "Business plan generated within 5 minutes",
      "Immediately available in PDF format for download",
      "Includes all 12 professional sections ready to submit"
    ],
    benefits: [
      "Get your plan before your coffee cools down",
      "Start applications today instead of weeks from now",
      "Rapid iteration if you need to adjust approach",
      "Meet visa deadline urgency with confidence",
      "Time to focus on other application requirements"
    ]
  },
  {
    id: "compliance",
    title: "Compliance Guaranteed",
    shortDesc: "Covers all three criteria: Innovation, Viability, and Scalability perfectly",
    icon: "✅",
    color: "from-green-400 to-green-600",
    detailedInstructions: [
      "Innovation: Demonstrates unique tech/approach with competitive advantage",
      "Viability: Shows financial sustainability with realistic projections",
      "Scalability: Proves growth potential exceeding Home Office expectations",
      "Each section cross-referenced and internally consistent",
      "Automated compliance checking catches gaps automatically"
    ],
    benefits: [
      "Zero risk of missing required elements",
      "All three visa criteria fully addressed",
      "Internal consistency verified automatically",
      "Home Office compliance certified",
      "Peace of mind with compliance guarantees"
    ]
  },
  {
    id: "financial",
    title: "Financial Projections",
    shortDesc: "Detailed 3-year forecasts with realistic assumptions and market analysis",
    icon: "📈",
    color: "from-indigo-400 to-indigo-600",
    detailedInstructions: [
      "3-year P&L projections based on your industry benchmarks",
      "Revenue ramp with realistic CAC and LTV assumptions",
      "Expense forecasting including staff, infrastructure, and R&D",
      "Cash flow analysis and fundraising runway",
      "Sensitivity analysis showing scenarios (conservative/optimistic)"
    ],
    benefits: [
      "Validated against 50+ comparable startups in your sector",
      "Shows path to profitability within 18-36 months",
      "Demonstrates prudent financial management",
      "Includes break-even analysis and payback period",
      "Ready for investor and endorser review"
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
      {/* Backdrop with animation */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
        style={{
          animation: "fadeIn 0.3s ease-out"
        }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: "slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}
        >
          {/* Glitter effect background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-chart-3/10 to-transparent rounded-full blur-3xl" />
            <style>{`
              @keyframes sparkle {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.1); }
              }
              .sparkle-item {
                animation: sparkle 3s infinite;
              }
            `}</style>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="sparkle-item absolute w-2 h-2 bg-gradient-to-r from-primary to-chart-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.25}s`
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-chart-3/5 dark:from-slate-800 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                  Feature Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                data-testid="button-close-features-modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="grid lg:grid-cols-4 gap-0 p-6">
              {/* Feature list */}
              <div className="lg:col-span-1 space-y-2 mb-6 lg:mb-0 lg:border-r border-border pr-0 lg:pr-4">
                {FEATURES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedId === f.id
                        ? "bg-gradient-to-r from-primary to-chart-3 text-white shadow-lg scale-105"
                        : "hover:bg-muted text-foreground"
                    }`}
                    data-testid={`button-feature-${f.id}`}
                  >
                    <div className="text-xl mb-1">{f.icon}</div>
                    <div className="text-sm font-semibold">{f.title}</div>
                  </button>
                ))}
              </div>

              {/* Feature details */}
              {feature && (
                <div className="lg:col-span-3 lg:pl-4 space-y-6">
                  {/* Title and description */}
                  <div>
                    <h3 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <span className="text-4xl">{feature.icon}</span>
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">{feature.shortDesc}</p>
                  </div>

                  {/* How it works */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-sm font-bold`}>✓</span>
                      How It Works
                    </h4>
                    <ul className="space-y-2">
                      {feature.detailedInstructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3 text-foreground">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {idx + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-sm font-bold`}>⭐</span>
                      Key Benefits
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors"
                        >
                          <p className="text-sm text-foreground">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-border p-6 bg-muted/30 dark:bg-slate-800 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Ready to generate your business plan?
              </p>
              <button
                onClick={() => {
                  onClose();
                  setLocation("/pricing");
                }}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
