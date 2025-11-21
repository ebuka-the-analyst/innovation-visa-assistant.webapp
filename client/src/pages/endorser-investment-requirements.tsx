import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Target, AlertCircle } from "lucide-react";

interface EndorserRequirement {
  name: string;
  focusAreas: string[];
  minInvestment: number;
  notes: string;
}

const ENDORSER_REQUIREMENTS: EndorserRequirement[] = [
  {
    name: "Tech Nation",
    focusAreas: ["AI", "Fintech", "Biotech", "Cyber Security", "Deep Tech"],
    minInvestment: 50000,
    notes: "UK's leading tech growth accelerator. Focus on UK-based innovation businesses.",
  },
  {
    name: "Innovator International",
    focusAreas: ["Any innovative business", "Tech", "Life Sciences", "Advanced Manufacturing"],
    minInvestment: 50000,
    notes: "Supports any innovative business meeting their endorsement criteria.",
  },
  {
    name: "University Route",
    focusAreas: ["Research-backed innovation", "Academic spin-outs", "Deep tech"],
    minInvestment: 50000,
    notes: "For innovations developed at UK universities with academic backing.",
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
            <h1 className="text-4xl md:text-5xl font-bold">Minimum Investment Requirements</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            UK Innovation Visa endorser minimum investment requirements and focus areas
          </p>
        </div>

        {/* Key Alert */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>Important:</strong> All three endorser routes require a <strong>minimum of £50,000</strong> investment in your UK-based business. This is a key criteria for visa approval under the Innovation Visa category.
          </AlertDescription>
        </Alert>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minimum Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">£50,000</div>
              <p className="text-xs text-muted-foreground mt-1">All endorsed routes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Endorser Routes</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">Approved routes available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Key Requirement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Yes</div>
              <p className="text-xs text-muted-foreground mt-1">Visa mandatory criterion</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Requirements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Endorsed Routes</h2>
          {ENDORSER_REQUIREMENTS.map((endorser, idx) => (
            <Card key={idx} className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-xl">{endorser.name}</CardTitle>
                    <CardDescription className="mt-2">{endorser.notes}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">£{endorser.minInvestment.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Minimum Investment</p>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Calculate Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>How to Meet the Minimum Investment Requirement</CardTitle>
            <CardDescription>Guidance for demonstrating £50,000+ investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="text-2xl font-bold text-primary flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold">Personal Funds</h4>
                  <p className="text-sm text-muted-foreground">Your own savings, director investment, or share capital</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl font-bold text-primary flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold">Investor Funding</h4>
                  <p className="text-sm text-muted-foreground">Angel investment, venture capital, or friends/family rounds</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl font-bold text-primary flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold">Government Grants</h4>
                  <p className="text-sm text-muted-foreground">R&D tax credits, innovation grants, or government funding</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl font-bold text-primary flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold">Bank Loans / Secured Funding</h4>
                  <p className="text-sm text-muted-foreground">Business loans or secured credit facilities (if unlocked for business use)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Best Practices for Investment Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span>Maintain clear bank statements showing fund deposits and transfers to business accounts</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span>Document all funding sources with supporting evidence (bank transfers, investor agreements)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span>Prepare investment timeline showing when funds were invested and how they've been used</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span>Include company formation documents and shareholder agreements for director investment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span>Show how investment is being used for business growth, hiring, and operations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
