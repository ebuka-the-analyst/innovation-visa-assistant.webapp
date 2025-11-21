import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Target, AlertCircle, CheckCircle } from "lucide-react";

interface EndorserInfo {
  name: string;
  focusAreas: string[];
  notes: string;
  fundingApproach: string;
}

const ENDORSER_ROUTES: EndorserInfo[] = [
  {
    name: "Tech Nation",
    focusAreas: ["AI", "Fintech", "Biotech", "Cyber Security", "Deep Tech"],
    notes: "UK's leading tech growth accelerator. Focuses on UK-based innovation businesses.",
    fundingApproach: "Evaluates appropriateness of funds for your specific business plan and growth strategy",
  },
  {
    name: "Innovator International",
    focusAreas: ["Any innovative business", "Tech", "Life Sciences", "Advanced Manufacturing"],
    notes: "Supports any innovative business meeting their endorsement criteria across all sectors.",
    fundingApproach: "Assesses whether funding is sufficient for your business stage and planned activities",
  },
  {
    name: "University Route",
    focusAreas: ["Research-backed innovation", "Academic spin-outs", "Deep tech"],
    notes: "For innovations developed at UK universities with academic backing and institutional support.",
    fundingApproach: "Evaluates funding in context of research commercialization stage and university support",
  },
];

export default function EndorserInvestmentRequirements() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Innovator Founder Funding Requirements</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            UK Innovator Founder visa route - no fixed minimum, but funding must be "appropriate" for your business
          </p>
        </div>

        {/* Key Update Alert */}
        <Alert className="mb-8 border-orange-500/20 bg-orange-500/5">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>November 2025 Update:</strong> The old Innovator visa (with fixed £50,000 minimum) has been replaced by the Innovator Founder route. <strong>There is NO set minimum investment amount</strong> under the new rules. Instead, endorsing bodies evaluate whether your funding is "appropriate" and "sufficient" for your specific business plan. This could be less than, equal to, or more than £50k.
          </AlertDescription>
        </Alert>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fixed Minimum</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">None</div>
              <p className="text-xs text-muted-foreground mt-1">Flexible by business needs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requirement Type</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Appropriate</div>
              <p className="text-xs text-muted-foreground mt-1">For your business plan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Key Criteria</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Legitimacy</div>
              <p className="text-xs text-muted-foreground mt-1">Funds must be genuine</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Requirements */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold">Endorsed Routes</h2>
          {ENDORSER_ROUTES.map((endorser, idx) => (
            <Card key={idx} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{endorser.name}</CardTitle>
                    <CardDescription className="mt-2">{endorser.notes}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {endorser.focusAreas.map((area, i) => (
                        <Badge key={i} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold text-sm mb-2">Funding Assessment</h4>
                    <p className="text-sm text-muted-foreground">{endorser.fundingApproach}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What Makes Funding "Appropriate"? */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>What Makes Funding "Appropriate"?</CardTitle>
            <CardDescription>Endorsers evaluate funding based on these key factors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Business Stage Alignment</h4>
                  <p className="text-sm text-muted-foreground">Funding level matches your business stage (early-stage vs scale-up needs different amounts)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Planned Use of Funds</h4>
                  <p className="text-sm text-muted-foreground">Amount sufficient for your outlined hiring, R&D, marketing, and operations for 3-5 years</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Legitimacy of Funds</h4>
                  <p className="text-sm text-muted-foreground">Clear evidence funds are genuine (not borrowed just for visa application), come from legitimate sources</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Growth Trajectory</h4>
                  <p className="text-sm text-muted-foreground">Funding supports realistic growth claims and revenue projections in your business plan</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Runway Coverage</h4>
                  <p className="text-sm text-muted-foreground">Sufficient funds to sustain operations until business reaches profitability</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources of Funding */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptable Sources of Funding</CardTitle>
            <CardDescription>What endorsers recognize as legitimate funding sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span><strong>Personal savings/director investment:</strong> Your own funds from employment or previous business</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span><strong>Angel investment/seed funding:</strong> Investment from business angels or early-stage VCs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span><strong>Government grants:</strong> R&D tax credits, innovation grants, Innovate UK funding</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span><strong>Friends & family funding:</strong> Loans or equity from trusted sources with clear documentation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span><strong>Bank loans/credit facilities:</strong> Business loans (if used for business, not just visa requirement)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span><strong>Venture debt/revenue-based financing:</strong> Structured funding specific to startups</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices for Funding Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Maintain clear bank statements showing fund deposits and company account transfers</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Document all funding sources with supporting evidence (bank transfers, investor agreements, grant notifications)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Prepare detailed funding timeline showing when funds were invested and how they've been used</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Include company formation documents and shareholder agreements for director investment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Show detailed spending breakdown matching funds to business activities (hiring, R&D, marketing, operations)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Provide accountant letter or financial statements confirming fund legitimacy</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Link funding amounts to specific business objectives in your plan (hires, market launch, product development)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
