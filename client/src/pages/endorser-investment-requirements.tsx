import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Target, AlertCircle, CheckCircle, Clock } from "lucide-react";

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
            <h1 className="text-4xl md:text-5xl font-bold">Innovator Founder Visa - Financial Requirements</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Official GOV.UK funding requirements for Innovator Founder visa (November 2025)
          </p>
        </div>

        {/* Official Source Alert */}
        <Alert className="mb-8 border-green-500/20 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Official Source:</strong> Information based on GOV.UK Innovator Founder visa page (updated November 17, 2025)
          </AlertDescription>
        </Alert>

        {/* Key Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Funding</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">No Fixed Minimum</div>
              <p className="text-xs text-muted-foreground mt-1">Must be "appropriate" for your business</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">£1,270</div>
              <p className="text-xs text-muted-foreground mt-1">Required for 28 consecutive days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Endorsement Fee</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">£1,000</div>
              <p className="text-xs text-muted-foreground mt-1">Plus £500 per meeting (2+ meetings)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Application Fee</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">£1,274-£1,590</div>
              <p className="text-xs text-muted-foreground mt-1">Outside UK vs extending in UK</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Funding Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Funding Requirements</CardTitle>
            <CardDescription>GOV.UK Official Requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">No Fixed Minimum Amount</h4>
                  <p className="text-sm text-muted-foreground">The Innovator Founder visa has NO set minimum investment amount in the Immigration Rules</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">"Appropriate" Funding Standard</h4>
                  <p className="text-sm text-muted-foreground">Endorsing bodies assess whether funding is "appropriate" and "sufficient" for YOUR specific business plan</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Flexible by Business Needs</h4>
                  <p className="text-sm text-muted-foreground">Could be £20k, £50k, £100k+ depending on your business stage, costs, and growth plans</p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Legitimacy Check</h4>
                  <p className="text-sm text-muted-foreground">Endorsers verify funds are genuine and not borrowed solely for visa purposes</p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Establishment Exception</h4>
                  <p className="text-sm text-muted-foreground">No investment funds needed if business already established and endorsed for earlier visa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Savings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal Savings Requirement: £1,270</CardTitle>
            <CardDescription>28 consecutive days before application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/20 p-4 rounded-lg">
              <p className="text-sm"><strong>This £1,270 is SEPARATE from business funding.</strong> It's for supporting yourself personally in the UK.</p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="text-sm">Must have been in YOUR bank account for 28 consecutive days before applying</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="text-sm">Exceptions: Already lived in UK for 1+ year when extending/switching</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="text-sm">Cannot use business investment funds to meet this requirement</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="text-sm">Cannot use money earned illegally in the UK</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dependants */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dependants - Additional Funds Required</CardTitle>
            <CardDescription>Partner and children living costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary mb-1">£285</div>
                  <p className="text-sm font-semibold">Per Partner</p>
                  <p className="text-xs text-muted-foreground">On top of £1,270</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary mb-1">£315</div>
                  <p className="text-sm font-semibold">First Child</p>
                  <p className="text-xs text-muted-foreground">On top of £1,270</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary mb-1">£200</div>
                  <p className="text-sm font-semibold">Each Additional Child</p>
                  <p className="text-xs text-muted-foreground">On top of £1,270</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm"><strong>Example:</strong> Partner + 1 child = £1,270 + £285 + £315 = £1,870 total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visa Fees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Visa Fees (November 2025)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-semibold">Application Fee (Applying outside UK)</span>
                <span className="text-lg font-bold text-primary">£1,274</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-semibold">Extension/Switch Fee (In UK)</span>
                <span className="text-lg font-bold text-primary">£1,590</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-semibold">Endorsement Assessment Fee</span>
                <span className="text-lg font-bold text-primary">£1,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Per Endorsement Meeting (min 2 meetings)</span>
                <span className="text-lg font-bold text-primary">£500 each</span>
              </div>
            </div>
            <div className="bg-accent/20 p-3 rounded text-sm">
              Plus healthcare surcharge and biometric fees apply
            </div>
          </CardContent>
        </Card>

        {/* What You Can/Cannot Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Can Do ✓</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Set up one or multiple businesses</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Work for your business (director/self-employed)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Work outside business (Level 3+ qualification)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Bring dependants (partner/children)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Travel abroad and return to UK</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Apply for settlement after 3 years</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Cannot Do ✗</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Apply for most benefits ("public funds")</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Work as professional sportsperson</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Processing Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Application Processing Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Typical Decision Time: 3 Weeks</p>
                <p className="text-sm text-muted-foreground mt-1">Once you've applied online, proved identity, and provided documents</p>
              </div>
            </div>
            <div className="bg-accent/20 p-4 rounded text-sm space-y-2">
              <p><strong>Decision may take longer if:</strong></p>
              <ul className="space-y-1">
                <li>• Family member needs appointment but you don't</li>
                <li>• Documents need verification</li>
                <li>• You need to attend interview</li>
                <li>• Special circumstances (criminal conviction, etc.)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
