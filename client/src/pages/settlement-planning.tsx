import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, TrendingUp, Home, Globe } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";

const settlementSteps = [
  {
    year: "Year 1",
    title: "Visa Grant & Business Launch",
    milestones: [
      "Receive Innovation Visa approval",
      "Establish UK business operations",
      "Meet initial job creation targets",
      "Begin financial projections tracking",
      "Establish tax residency in UK"
    ]
  },
  {
    year: "Year 2",
    title: "Growth & Compliance",
    milestones: [
      "Demonstrate revenue growth",
      "Create additional jobs as planned",
      "Maintain compliance reporting",
      "Build UK tax history",
      "Strengthen corporate structure"
    ]
  },
  {
    year: "Year 3",
    title: "ILR Preparation",
    milestones: [
      "Prepare ILR (Indefinite Leave to Remain) application",
      "Document 3 years of business success",
      "Show job creation achievement",
      "Demonstrate financial viability",
      "Plan for permanent UK settlement"
    ]
  },
  {
    year: "Year 3+",
    title: "Post-Settlement Options",
    milestones: [
      "Apply for British Citizenship (1 year after ILR)",
      "Explore international expansion",
      "Scale business operations",
      "Mentor new visa applicants",
      "Build long-term UK business legacy"
    ]
  }
];

const taxPlanning = [
  {
    area: "Corporate Structure",
    items: [
      "Limited Company vs Sole Proprietor",
      "Tax-efficient dividend strategy",
      "Director loan account management",
      "R&D tax credits (especially for Tech Nation)"
    ]
  },
  {
    area: "Tax Optimization",
    items: [
      "Self-assessment tax planning",
      "VAT registration considerations",
      "Personal vs corporate tax rates",
      "Pension contributions for tax relief"
    ]
  },
  {
    area: "Compliance",
    items: [
      "Annual accounts filing",
      "Tax return deadlines",
      "National Insurance contributions",
      "Employment tax obligations"
    ]
  }
];

const expansionStrategies = [
  {
    strategy: "European Expansion",
    description: "Establish subsidiaries in EU markets",
    timeline: "Year 2-3",
    requirements: ["EU market research", "Regulatory compliance", "Team expansion"]
  },
  {
    strategy: "US Market Entry",
    description: "Enter North American markets",
    timeline: "Year 2+",
    requirements: ["US market validation", "Local partnerships", "Series A funding"]
  },
  {
    strategy: "Asia-Pacific Growth",
    description: "Expand to high-growth Asian markets",
    timeline: "Year 3+",
    requirements: ["Market analysis", "Local team hiring", "Distribution partnerships"]
  }
];

export default function SettlementPlanning() {
  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">POST-VISA ROADMAP</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Settlement Planning & ILR Strategy</h1>
            <p className="text-lg text-muted-foreground">
              Long-term planning from Innovation Visa through ILR (Indefinite Leave to Remain) and British Citizenship. Includes tax optimization, international expansion strategy, and post-settlement pathways.
            </p>
          </div>

          <Tabs defaultValue="roadmap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roadmap">ILR Roadmap</TabsTrigger>
              <TabsTrigger value="tax">Tax Planning</TabsTrigger>
              <TabsTrigger value="expansion">Expansion</TabsTrigger>
              <TabsTrigger value="citizenship">Citizenship</TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="space-y-6">
              <div className="space-y-6">
                {settlementSteps.map((step, idx) => (
                  <Card key={step.year} className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-bold text-primary">{idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{step.year}: {step.title}</h3>
                        <ul className="space-y-2">
                          {step.milestones.map((milestone, midx) => (
                            <li key={midx} className="flex gap-3 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-8 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Path to Citizenship
                </h3>
                <ol className="space-y-3 text-sm">
                  <li><span className="font-semibold">Year 3:</span> Apply for Indefinite Leave to Remain (ILR)</li>
                  <li><span className="font-semibold">Year 4:</span> Eligible to apply for British Citizenship</li>
                  <li><span className="font-semibold">Benefit:</span> Full rights to live, work, and study in the UK</li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="tax" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {taxPlanning.map(category => (
                  <Card key={category.area} className="p-6">
                    <h3 className="font-semibold text-lg mb-4">{category.area}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              <Card className="p-8 bg-amber-50 border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Recommendation:</strong> Consult with a UK tax advisor to optimize your personal and corporate tax structure. This can save significantly over time.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="expansion" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {expansionStrategies.map(strategy => (
                  <Card key={strategy.strategy} className="p-6 hover-elevate">
                    <h3 className="font-semibold text-lg mb-2">{strategy.strategy}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                    <div className="mb-4 p-3 bg-muted rounded">
                      <p className="text-xs font-semibold mb-1">Timeline</p>
                      <p className="text-sm">{strategy.timeline}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Requirements:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {strategy.requirements.map((req, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-primary">•</span> {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-8">
                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Scale Strategically</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your Innovation Visa startup has proven you can innovate and create value. Use this foundation to expand internationally while maintaining your UK presence and fulfilling ILR requirements.
                    </p>
                    <Button gap-2>
                      <TrendingUp className="w-4 h-4" />
                      Download Expansion Checklist
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="citizenship" className="space-y-6">
              <Card className="p-8">
                <h3 className="font-semibold text-2xl mb-6">British Citizenship</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Eligibility Requirements</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        12+ months with Indefinite Leave to Remain (ILR)
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        Passed the Life in the UK test
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        English language requirement met
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        Good character test passed
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Benefits of UK Citizenship</h4>
                    <ul className="text-sm space-y-2 text-green-900">
                      <li>• Full voting and political rights</li>
                      <li>• Passport for unrestricted travel</li>
                      <li>• Right to remain in UK indefinitely</li>
                      <li>• Access to all public services</li>
                      <li>• No visa sponsorship needed for employment</li>
                      <li>• Eligibility for government benefits and pensions</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
