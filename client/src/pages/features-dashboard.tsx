import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AuthHeader } from "@/components/AuthHeader";
import { CheckCircle2, Clock, Lock, BookOpen, Users, TrendingUp, Home, BarChart3 } from "lucide-react";

const features = [
  {
    phase: 1,
    phaseTitle: "Planning & Assessment",
    items: [
      {
        icon: BookOpen,
        title: "Business Plan Generator",
        description: "TorlyAI end-to-end platform",
        route: "/questionnaire",
        status: "Start here",
        color: "from-purple-500 to-primary"
      },
      {
        icon: TrendingUp,
        title: "Endorser Comparison",
        description: "UKInnovator.online triage",
        route: "/endorser-comparison",
        status: "Explore routes",
        color: "from-blue-500 to-cyan-500"
      }
    ]
  },
  {
    phase: 2,
    phaseTitle: "Preparation",
    items: [
      {
        icon: Users,
        title: "Document Organizer",
        description: "Launchpad document management",
        route: "/document-organizer",
        status: "Organize evidence",
        color: "from-green-500 to-emerald-500"
      }
    ]
  },
  {
    phase: 3,
    phaseTitle: "Interview Ready",
    items: [
      {
        icon: BookOpen,
        title: "Interview Prep Training",
        description: "Launchpad mentorship",
        route: "/interview-prep",
        status: "Practice scenarios",
        color: "from-orange-500 to-yellow-500"
      },
      {
        icon: Users,
        title: "Expert Consultants",
        description: "Launchpad expert network",
        route: "/expert-booking",
        status: "Book guidance",
        color: "from-pink-500 to-rose-500"
      }
    ]
  },
  {
    phase: 4,
    phaseTitle: "Reapplication (If Needed)",
    items: [
      {
        icon: TrendingUp,
        title: "Rejection Analysis",
        description: "TorlyAI diagnostics",
        route: "/rejection-analysis",
        status: "Recover & reapply",
        color: "from-red-500 to-orange-500"
      }
    ]
  },
  {
    phase: 5,
    phaseTitle: "Post-Visa Settlement",
    items: [
      {
        icon: Home,
        title: "Settlement Planning",
        description: "ILR & citizenship roadmap",
        route: "/settlement-planning",
        status: "Long-term strategy",
        color: "from-indigo-500 to-purple-500"
      },
      {
        icon: BarChart3,
        title: "KPI Dashboard",
        description: "Real-time visa compliance tracking",
        route: "/kpi-dashboard",
        status: "Monitor performance",
        color: "from-cyan-500 to-blue-500"
      }
    ]
  }
];

const advancedFeatures = [
  {
    title: "Evidence Graph",
    description: "Map every claim to supporting evidence. Spot gaps before submission.",
    route: "/evidence-graph",
    color: "from-orange-500 to-yellow-500"
  },
  {
    title: "RFE Defence Lab",
    description: "Predict refusal grounds & build mitigation strategies.",
    route: "/rfe-defence-lab",
    color: "from-pink-500 to-rose-500"
  }
];

export default function FeaturesDashboard() {
  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Your Visa Journey</h1>
            <p className="text-lg text-muted-foreground">
              Navigate through all features in the optimal order for UK Innovator Founder Visa success
            </p>
          </div>

          <div className="space-y-12">
            {features.map((phase) => (
              <div key={phase.phase}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary text-sm">{phase.phase}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{phase.phaseTitle}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {phase.items.map((item) => (
                    <Link key={item.route} href={item.route}>
                      <Card
                        className={`p-8 hover-elevate cursor-pointer group overflow-hidden relative h-full`}
                        data-testid={`card-feature-${item.title.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                        
                        <div className="relative z-10">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} p-3 mb-6 text-white group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-full h-full" />
                          </div>

                          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

                          <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {item.status}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-lg mb-12">
            <h3 className="font-semibold text-lg mb-3">How to Use This Dashboard</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li><strong>Phase 1:</strong> Generate your business plan and compare endorser routes</li>
              <li><strong>Phase 2:</strong> Organize all required documents and evidence</li>
              <li><strong>Phase 3:</strong> Prepare for interviews with expert coaching and consultants</li>
              <li><strong>Phase 4 (Optional):</strong> If rejected, analyze and plan your reapplication</li>
              <li><strong>Phase 5:</strong> Plan your long-term UK settlement and ILR journey</li>
            </ol>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Advanced Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {advancedFeatures.map((feature) => (
                <Link key={feature.route} href={feature.route}>
                  <Card
                    className={`p-8 hover-elevate cursor-pointer group overflow-hidden relative h-full`}
                    data-testid={`card-advanced-${feature.title.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LinkProps {
  href: string;
  children: React.ReactNode;
}
