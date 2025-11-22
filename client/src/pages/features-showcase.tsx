import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { Check, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { AuthHeader } from "@/components/AuthHeader";

type IconName = keyof typeof Icons;

const FEATURE_CATEGORIES = [
  { title: "Business Planning", icon: "FileText", description: "AI-powered business plan generation covering Innovation, Viability, and Scalability" },
  { title: "Financial Tools", icon: "DollarSign", description: "Financial projections, cash flow analysis, and investment planning" },
  { title: "Innovation & IP", icon: "Lightbulb", description: "Validate your innovation and protect your intellectual property" },
  { title: "Team Building", icon: "Users", description: "Hiring strategies and organizational structure planning" },
  { title: "Growth Strategy", icon: "TrendingUp", description: "Scalability planning and market expansion roadmaps" },
  { title: "Compliance", icon: "Shield", description: "UK visa rules, tax planning, and regulatory compliance" },
  { title: "Defense & Appeals", icon: "AlertTriangle", description: "RFE defense, rejection analysis, and appeal strategies" },
  { title: "Documentation", icon: "Folder", description: "Document organization and evidence collection" },
];

const MAIN_FEATURES = [
  { title: "88 AI-Powered Tools", description: "Complete toolkit from application to approval" },
  { title: "5 Pricing Tiers", description: "Free to Ultimate with varying feature access" },
  { title: "Expert Dashboard", description: "Monitor your visa application progress" },
  { title: "Breaking News Ticker", description: "Real-time UK Innovator Founder Visa updates" },
  { title: "Diagnostics Engine", description: "Application readiness scoring (88% benchmark)" },
  { title: "AI Agent Assistants", description: "Nova, Sterling, Atlas, and Sage AI agents" },
  { title: "Endorser Comparison", description: "Compare and select approved endorsers" },
  { title: "Interview Preparation", description: "Prepare for visa officer interviews" },
  { title: "Settlement Planning", description: "Post-approval UK setup guidance" },
];

export default function FeaturesShowcase() {
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-5 h-5" /> : <Icons.Zap className="w-5 h-5" />;
  };

  const toolsByCategory = FEATURE_CATEGORIES.reduce((acc, cat) => {
    const categoryName = cat.title.toLowerCase().replace(/\s+/g, "");
    const categoryTools = ALL_TOOLS.filter(
      (tool) => tool.category.includes(categoryName.slice(0, 3)) || 
        cat.title.toLowerCase().includes(tool.category)
    ).slice(0, 4);
    return { ...acc, [cat.title]: categoryTools };
  }, {} as Record<string, typeof ALL_TOOLS>);

  return (
    <>
      {user ? <AuthHeader /> : <Header />}
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
        {/* Hero */}
        <div className="border-b">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-features">Everything You Need for UK Innovator Founder Visa Success</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A complete platform with 88 tools, AI agents, expert guidance, and everything required to turn your innovation into a visa-approved business
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16">
          {/* Main Features Grid */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MAIN_FEATURES.map((feature, idx) => (
                <Card key={idx} className="p-6 hover-elevate" data-testid={`card-feature-${idx}`}>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Tool Categories */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">88 Tools Across 8 Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {FEATURE_CATEGORIES.map((category, idx) => (
                <Card key={idx} className="p-6 hover-elevate border-l-4 border-l-primary" data-testid={`card-category-${idx}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <GetIconComponent name={category.icon} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {(toolsByCategory[category.title] || []).map((tool) => (
                      <div key={tool.id} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{tool.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/tools-hub">
                    <Button size="sm" variant="outline" className="w-full gap-2" data-testid={`button-view-${idx}`}>
                      View All Tools <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          {/* Pricing Tiers Comparison */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Simple, Transparent Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: "Free", price: "£0", color: "bg-gray-50", tools: "10", pages: "10-15" },
                { name: "Basic", price: "£49", color: "bg-blue-50", tools: "30", pages: "25-35" },
                { name: "Premium", price: "£99", color: "bg-purple-50", tools: "60+", pages: "40-60", popular: true },
                { name: "Enterprise", price: "£199", color: "bg-orange-50", tools: "82+", pages: "50-80" },
                { name: "Ultimate", price: "£299", color: "bg-amber-50", tools: "All 88", pages: "80+", premium: true },
              ].map((tier, idx) => (
                <Card key={idx} className={`p-6 hover-elevate border-2 ${tier.color} ${tier.premium ? "border-amber-300 shadow-lg" : ""}`} data-testid={`card-tier-${idx}`}>
                  {tier.popular && <div className="mb-3 text-xs font-bold text-purple-600">⭐ MOST POPULAR</div>}
                  {tier.premium && <div className="mb-3 text-xs font-bold text-amber-600">👑 EVERYTHING</div>}
                  <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                  <div className="text-2xl font-bold mb-4">{tier.price}</div>
                  <div className="space-y-2 text-sm mb-4">
                    <div><span className="font-semibold">{tier.tools}</span> tools</div>
                    <div><span className="font-semibold">{tier.pages}</span> plan</div>
                  </div>
                  <Link href="/pricing">
                    <Button size="sm" variant={tier.popular ? "default" : "outline"} className="w-full" data-testid={`button-pricing-${idx}`}>
                      Choose Plan
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Explore Our Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/tools-hub">
                <Card className="p-6 hover-elevate cursor-pointer text-center" data-testid="card-link-tools">
                  <div className="text-3xl mb-3">🛠️</div>
                  <h3 className="font-semibold mb-2">All Tools</h3>
                  <p className="text-sm text-muted-foreground">Explore 88 powerful tools</p>
                </Card>
              </Link>

              <Link href="/pricing">
                <Card className="p-6 hover-elevate cursor-pointer text-center" data-testid="card-link-pricing">
                  <div className="text-3xl mb-3">💰</div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <p className="text-sm text-muted-foreground">5 tiers for every need</p>
                </Card>
              </Link>

              <Link href="/diagnostics">
                <Card className="p-6 hover-elevate cursor-pointer text-center" data-testid="card-link-diagnostics">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold mb-2">Diagnostics</h3>
                  <p className="text-sm text-muted-foreground">Check application readiness</p>
                </Card>
              </Link>

              <Link href="/dashboard">
                <Card className="p-6 hover-elevate cursor-pointer text-center" data-testid="card-link-dashboard">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="font-semibold mb-2">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Track your progress</p>
                </Card>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 border-t">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Choose your plan and start building your visa-approved business plan today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" data-testid="button-cta-pricing">
                  View All Plans
                </Button>
              </Link>
              <Link href="/tools-hub">
                <Button size="lg" variant="outline" data-testid="button-cta-tools">
                  Explore Tools
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
