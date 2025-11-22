import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { Check, ChevronRight } from "lucide-react";

type IconName = keyof typeof Icons;

const FEATURE_CATEGORIES = [
  { title: "Business Planning", icon: "FileText", count: 5 },
  { title: "Financial Tools", icon: "DollarSign", count: 4 },
  { title: "Innovation & IP", icon: "Lightbulb", count: 5 },
  { title: "Team Building", icon: "Users", count: 4 },
  { title: "Growth Strategy", icon: "TrendingUp", count: 4 },
  { title: "Compliance", icon: "Shield", count: 8 },
  { title: "Defense & Appeals", icon: "AlertTriangle", count: 4 },
  { title: "Documentation", icon: "Folder", count: 5 },
];

const HIGHLIGHTS = [
  { label: "88 AI Tools", value: "Complete A-Z toolkit" },
  { label: "5 Pricing Tiers", value: "Free to Ultimate access" },
  { label: "Real-time Updates", value: "52 UK visa news items" },
  { label: "AI Agents", value: "Nova, Sterling, Atlas, Sage" },
  { label: "88% Readiness", value: "Diagnostics scoring" },
  { label: "Expert Support", value: "Lawyer network access" },
];

export default function EverythingWeOfferSection() {
  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-6 h-6" /> : <Icons.Zap className="w-6 h-6" />;
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform with 88 powerful AI tools, expert guidance, and everything required to get your UK Innovator Founder Visa approved
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {HIGHLIGHTS.map((highlight, idx) => (
            <Card key={idx} className="p-4 text-center hover-elevate" data-testid={`card-highlight-${idx}`}>
              <div className="font-bold text-primary text-lg">{highlight.label}</div>
              <p className="text-sm text-muted-foreground">{highlight.value}</p>
            </Card>
          ))}
        </div>

        {/* Tool Categories */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">88 Tools Across 8 Categories</h3>
            <Link href="/tools-hub">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-all-tools">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CATEGORIES.map((cat, idx) => (
              <Card key={idx} className="p-6 hover-elevate border-l-4 border-l-primary" data-testid={`card-category-home-${idx}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <GetIconComponent name={cat.icon} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{cat.title}</h4>
                    <p className="text-xs text-muted-foreground">{cat.count} tools</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Features Showcase */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "FileText", title: "Business Plan Generator", desc: "AI-powered plans covering Innovation, Viability, and Scalability" },
              { icon: "DollarSign", title: "Financial Projections", desc: "3-5 year forecasts and cash flow analysis" },
              { icon: "Lightbulb", title: "Innovation Validation", desc: "Score your innovation against endorser criteria" },
              { icon: "Shield", title: "Compliance Checker", desc: "Ensure full UK visa compliance" },
              { icon: "AlertTriangle", title: "RFE Defense Lab", desc: "Prepare defense against visa objections" },
              { icon: "TrendingUp", title: "Growth Planning", desc: "Scalability roadmaps and market expansion" },
              { icon: "Users", title: "Team Scaling", desc: "Hiring plans and organizational structure" },
              { icon: "Award", title: "Endorser Comparison", desc: "Compare and select best endorsement body" },
              { icon: "BarChart3", title: "Application Diagnostics", desc: "Real-time readiness scoring (88% benchmark)" },
            ].map((feature, idx) => (
              <Card key={idx} className="p-5 hover-elevate" data-testid={`card-feature-home-${idx}`}>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <GetIconComponent name={feature.icon} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8">5 Pricing Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { name: "Free", price: "£0", color: "bg-gray-50", tools: "10" },
              { name: "Basic", price: "£49", color: "bg-blue-50", tools: "30" },
              { name: "Premium", price: "£99", color: "bg-purple-50", tools: "60+", popular: true },
              { name: "Enterprise", price: "£199", color: "bg-orange-50", tools: "82+" },
              { name: "Ultimate", price: "£299", color: "bg-amber-50", tools: "All 88", premium: true },
            ].map((tier, idx) => (
              <Card key={idx} className={`p-4 text-center hover-elevate border-2 ${tier.color}`} data-testid={`tier-card-${idx}`}>
                {tier.popular && <div className="text-xs font-bold text-purple-600 mb-2">⭐ Most Popular</div>}
                {tier.premium && <div className="text-xs font-bold text-amber-600 mb-2">👑 Everything</div>}
                <h4 className="font-semibold">{tier.name}</h4>
                <div className="text-lg font-bold text-primary my-1">{tier.price}</div>
                <p className="text-xs text-muted-foreground">{tier.tools} tools</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-16 bg-primary/5 rounded-lg p-8 border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{ALL_TOOLS.length}</div>
              <p className="text-sm text-muted-foreground mt-2">AI-Powered Tools</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{ALL_TOOLS.filter(t => t.stage === 'before').length}</div>
              <p className="text-sm text-muted-foreground mt-2">Pre-Application</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{ALL_TOOLS.filter(t => t.stage === 'during').length}</div>
              <p className="text-sm text-muted-foreground mt-2">During Application</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{ALL_TOOLS.filter(t => t.stage === 'after').length}</div>
              <p className="text-sm text-muted-foreground mt-2">Post-Approval</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Explore Everything</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools-hub">
              <Button size="lg" data-testid="button-explore-tools">
                View All 88 Tools
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" data-testid="button-view-pricing">
                See Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
