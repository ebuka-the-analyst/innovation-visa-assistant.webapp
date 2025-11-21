import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Target, AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

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
            Official guidance from Home Office (Version 9.0, November 11, 2025)
          </p>
        </div>

        {/* Official Source Alert */}
        <Alert className="mb-8 border-green-500/20 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Official Sources:</strong> GOV.UK Innovator Founder visa page + Home Office guidance (Version 9.0, published November 11, 2025)
          </AlertDescription>
        </Alert>

        {/* Key Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Individual: Business Funding</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">No Fixed Minimum</div>
              <p className="text-xs text-muted-foreground mt-1">"Appropriate" for your business</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team: Per Applicant</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">£50,000</div>
              <p className="text-xs text-muted-foreground mt-1">Each co-founder (new business)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">£1,270</div>
              <p className="text-xs text-muted-foreground mt-1">28 consecutive days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visa Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3 Years</div>
              <p className="text-xs text-muted-foreground mt-1">Then apply for settlement</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alert - Team Funding */}
        <Alert className="mb-8 border-orange-500/20 bg-orange-500/5">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Team Applicants:</strong> If co-founders are applying for endorsement as co-directors of the same company under "New Business" criteria, each applicant must independently demonstrate they have £50,000 available to invest (per Home Office guidance). These are NOT linked applications - each person needs separate endorsement.
          </AlertDescription>
        </Alert>

        {/* Business Funding Section - Individual */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Funding Requirements - Individual Applicants</CardTitle>
            <CardDescription>For single founder businesses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">No Fixed Minimum Amount</h4>
                  <p className="text-sm text-muted-foreground">Home Office guidance confirms no set minimum investment for individual applicants</p>
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
                  <p className="text-sm text-muted-foreground">Could be £15k, £50k, £150k+ depending on your business stage, runway, and hiring plans</p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Legitimacy Check</h4>
                  <p className="text-sm text-muted-foreground">Endorsers confirm "no concerns over legitimacy of sources of funds or modes of transfer" and funds are not "beneficiary of illicit or unsatisfactorily explained wealth"</p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Establishment Exception</h4>
                  <p className="text-sm text-muted-foreground">No business funds needed if business already established and endorsed for earlier visa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Funding Section */}
        <Card className="mb-8 border-orange-500/30 bg-orange-500/5">
          <CardHeader>
            <CardTitle>Business Funding Requirements - Team Applicants</CardTitle>
            <CardDescription>For multiple co-founders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border-l-4 border-orange-600">
              <p className="font-semibold text-sm mb-2">£50,000 per Co-Founder (New Business only)</p>
              <p className="text-sm text-muted-foreground">Each co-founder applying under "New Business" criteria must independently demonstrate £50,000 available to invest</p>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong>Key Points:</strong></p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                  <span>Each person needs SEPARATE endorsement from an approved endorsing body</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                  <span>These are NOT linked team applications - each is independently assessed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                  <span>Each co-founder must score 70 points individually (not shared)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                  <span>All other requirements (English B2, personal savings £1,270) apply per person</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Personal Savings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal Savings Requirement: £1,270</CardTitle>
            <CardDescription>Mandatory for ALL applicants - 28 consecutive days</CardDescription>
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
                <span className="text-sm">Exception: Already lived in UK for 1+ year when extending/switching</span>
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

        {/* Endorsement Letter Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Endorsement Letter Requirements</CardTitle>
            <CardDescription>What your endorsing body must confirm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <p><strong>Endorsement Letter Must:</strong></p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Be dated no more than 3 months before application</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Include name, reference number, contact details of endorsing body</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Confirm applicant is "fit and proper person" under Innovator Founder rules</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Confirm "no concerns over legitimacy of sources of funds"</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Confirm no reason to believe applicant benefits from "illicit or unsatisfactorily explained wealth"</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Points Scoring */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Points Scoring Requirement</CardTitle>
            <CardDescription>Total 70 points required (Home Office guidance)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">NEW BUSINESS</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Business plan</span><span className="font-bold">30 pts</span></div>
                  <div className="flex justify-between"><span>Innovative, viable, scalable</span><span className="font-bold">20 pts</span></div>
                  <div className="border-t pt-1 mt-1 flex justify-between font-semibold"><span>Subtotal (50 required)</span><span>50 pts</span></div>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">SAME BUSINESS</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Previous visa in route</span><span className="font-bold">10 pts</span></div>
                  <div className="flex justify-between"><span>Active & sustainable</span><span className="font-bold">20 pts</span></div>
                  <div className="flex justify-between"><span>Day-to-day management</span><span className="font-bold">20 pts</span></div>
                  <div className="border-t pt-1 mt-1 flex justify-between font-semibold"><span>Subtotal (50 required)</span><span>50 pts</span></div>
                </div>
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-semibold mb-2">MANDATORY (All Applicants)</p>
              <div className="space-y-1">
                <div className="flex justify-between"><span>English Language (B2)</span><span className="font-bold">10 pts</span></div>
                <div className="flex justify-between"><span>Financial requirement</span><span className="font-bold">10 pts</span></div>
                <div className="border-t pt-1 mt-1 flex justify-between font-semibold"><span>Total Needed</span><span className="text-lg">70 pts</span></div>
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
                  <span>Work outside business (RQF Level 3+ required)</span>
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
                  <span>Access public funds / most benefits</span>
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
