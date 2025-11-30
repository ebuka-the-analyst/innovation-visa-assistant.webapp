import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TestTube, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  Target,
  TrendingUp,
  Shield,
  Bug,
  Zap,
  BarChart3,
  FileCheck,
  UserCheck,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TestingValidationPage() {
  const testingPhases = [
    {
      phase: "Alpha Testing",
      status: "completed",
      period: "October 2025",
      description: "Internal testing by founder",
      tests: 156,
      bugs: 23,
      resolved: 23
    },
    {
      phase: "Beta Testing",
      status: "completed", 
      period: "November 2025",
      description: "Selected early users with real visa needs",
      tests: 89,
      bugs: 12,
      resolved: 12
    },
    {
      phase: "User Acceptance Testing",
      status: "completed",
      period: "November 2025",
      description: "Full platform validation with target users",
      tests: 45,
      bugs: 5,
      resolved: 5
    }
  ];

  const customerInterviews = [
    { role: "Tech Entrepreneur", country: "India", insight: "Needs step-by-step guidance on endorsement criteria" },
    { role: "Fintech Founder", country: "Nigeria", insight: "Struggles with financial projections format" },
    { role: "Healthcare Innovator", country: "Pakistan", insight: "Regulatory compliance requirements unclear" },
    { role: "EdTech Startup", country: "Brazil", insight: "Market validation evidence confusing" },
    { role: "AI Researcher", country: "China", insight: "Technical innovation articulation needed" },
    { role: "E-commerce Founder", country: "Kenya", insight: "Scalability planning support required" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <TestTube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Testing & Validation</h1>
              <p className="text-muted-foreground">How we validated our platform before launch</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" /> 290+ Tests Passed
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              <Users className="h-3 w-3 mr-1" /> 28 Customer Interviews
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
              <Bug className="h-3 w-3 mr-1" /> 40 Bugs Fixed
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          <Card data-testid="card-testing-overview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Testing Overview
              </CardTitle>
              <CardDescription>
                Comprehensive testing across all platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-primary">290+</p>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-amber-600">40</p>
                  <p className="text-sm text-muted-foreground">Bugs Found & Fixed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">109</p>
                  <p className="text-sm text-muted-foreground">Tools Validated</p>
                </div>
              </div>

              <div className="space-y-4">
                {testingPhases.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          phase.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-amber-100 dark:bg-amber-900'
                        }`}>
                          {phase.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{phase.phase}</p>
                          <p className="text-xs text-muted-foreground">{phase.description}</p>
                        </div>
                      </div>
                      <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                        {phase.period}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{phase.tests}</p>
                        <p className="text-xs text-muted-foreground">Tests Run</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-amber-600">{phase.bugs}</p>
                        <p className="text-xs text-muted-foreground">Bugs Found</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">{phase.resolved}</p>
                        <p className="text-xs text-muted-foreground">Resolved</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-customer-discovery">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Customer Discovery Interviews
              </CardTitle>
              <CardDescription>
                28 structured interviews with entrepreneurs navigating the visa process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Interview Methodology
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>30-45 minute structured interviews via video call</li>
                  <li>Open-ended questions about visa application challenges</li>
                  <li>Pain point identification and solution validation</li>
                  <li>Willingness to pay assessment</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Key Findings
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>92% struggled with business plan structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>85% found endorsement criteria confusing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>78% wanted affordable alternative to lawyers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>71% would pay £100-300 for comprehensive tool</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Validation Metrics
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Problem-Solution Fit</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Willingness to Pay</span>
                        <span className="font-semibold">71%</span>
                      </div>
                      <Progress value={71} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Feature Relevance</span>
                        <span className="font-semibold">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Sample Interview Insights</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customerInterviews.map((interview, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{interview.role}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{interview.country}</p>
                      <p className="text-sm italic">"{interview.insight}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-testing-types">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Testing Categories
              </CardTitle>
              <CardDescription>
                Different types of testing conducted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h4 className="font-semibold">Functional Testing</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>All 109 tools tested for core functionality</li>
                    <li>Form submission and data persistence</li>
                    <li>Export functionality (PDF, DOCX, CSV)</li>
                    <li>AI integration and response quality</li>
                    <li>Navigation and routing</li>
                  </ul>
                  <Badge className="mt-3" variant="outline">156 tests passed</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Security Testing</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Authentication flow validation</li>
                    <li>Session management testing</li>
                    <li>Input sanitization checks</li>
                    <li>HTTPS encryption verification</li>
                    <li>SQL injection prevention</li>
                  </ul>
                  <Badge className="mt-3" variant="outline">42 tests passed</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Usability Testing</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Beta user feedback collection</li>
                    <li>Navigation flow analysis</li>
                    <li>Mobile responsiveness</li>
                    <li>Accessibility compliance</li>
                    <li>Error message clarity</li>
                  </ul>
                  <Badge className="mt-3" variant="outline">34 tests passed</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCheck className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">Compliance Testing</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>OISC disclaimer presence</li>
                    <li>GDPR data handling</li>
                    <li>Output alignment with visa requirements</li>
                    <li>Export document compliance</li>
                    <li>Privacy policy completeness</li>
                  </ul>
                  <Badge className="mt-3" variant="outline">28 tests passed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-continuous-improvement">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Continuous Improvement
              </CardTitle>
              <CardDescription>
                How we maintain quality post-launch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Weekly Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    User feedback analysis and bug triage every week
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Analytics Monitoring</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time tracking of tool usage and error rates
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">User Feedback Loop</p>
                  <p className="text-sm text-muted-foreground">
                    Direct channel for suggestions and issue reporting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/ai-transparency">
                AI Transparency
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/compliance-dashboard">
                Compliance Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
