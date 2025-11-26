import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Users, FileText, Building2, Plus, Trash2, Download, 
  Lightbulb, CheckCircle2, TrendingUp, AlertTriangle, Scale,
  MessageSquare, Star, X, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Competitor {
  id: string;
  name: string;
  website: string;
  pricing: string;
  targetMarket: string;
  strengths: string[];
  weaknesses: string[];
  differentiator: string;
  marketShare?: string;
  fundingRaised?: string;
}

interface UserInterview {
  id: string;
  intervieweeName: string;
  company?: string;
  role: string;
  date: string;
  painPoints: string[];
  currentSolution: string;
  willingnessToPay: string;
  keyQuotes: string[];
  wouldRecommend: boolean;
  overallSentiment: "positive" | "neutral" | "negative";
}

interface CaseStudy {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonialQuote?: string;
  metrics: string;
  dateCompleted: string;
}

export default function CommercialValidation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("competitors");
  
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [interviews, setInterviews] = useState<UserInterview[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);

  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({ strengths: [], weaknesses: [] });
  const [newInterview, setNewInterview] = useState<Partial<UserInterview>>({ 
    painPoints: [], keyQuotes: [], overallSentiment: "positive", wouldRecommend: true 
  });
  const [newCaseStudy, setNewCaseStudy] = useState<Partial<CaseStudy>>({ results: [] });

  const calculateValidationScore = () => {
    let score = 0;
    
    if (competitors.length >= 5) score += 25;
    else if (competitors.length >= 3) score += 20;
    else if (competitors.length >= 1) score += 10;

    if (interviews.length >= 10) score += 35;
    else if (interviews.length >= 5) score += 25;
    else if (interviews.length >= 3) score += 15;
    else if (interviews.length >= 1) score += 10;

    const positiveInterviews = interviews.filter(i => i.overallSentiment === "positive").length;
    if (positiveInterviews >= 5) score += 15;
    else if (positiveInterviews >= 3) score += 10;

    if (caseStudies.length >= 3) score += 25;
    else if (caseStudies.length >= 2) score += 20;
    else if (caseStudies.length >= 1) score += 15;

    return Math.min(100, score);
  };

  const addCompetitor = () => {
    if (!newCompetitor.name) {
      toast({ title: "Missing Information", description: "Please fill in competitor name", variant: "destructive" });
      return;
    }
    const competitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitor.name!,
      website: newCompetitor.website || "",
      pricing: newCompetitor.pricing || "",
      targetMarket: newCompetitor.targetMarket || "",
      strengths: newCompetitor.strengths || [],
      weaknesses: newCompetitor.weaknesses || [],
      differentiator: newCompetitor.differentiator || "",
      marketShare: newCompetitor.marketShare,
      fundingRaised: newCompetitor.fundingRaised
    };
    setCompetitors([...competitors, competitor]);
    setNewCompetitor({ strengths: [], weaknesses: [] });
    toast({ title: "Added", description: "Competitor added to analysis" });
  };

  const addInterview = () => {
    if (!newInterview.intervieweeName || !newInterview.role) {
      toast({ title: "Missing Information", description: "Please fill in interviewee details", variant: "destructive" });
      return;
    }
    const interview: UserInterview = {
      id: Date.now().toString(),
      intervieweeName: newInterview.intervieweeName!,
      company: newInterview.company,
      role: newInterview.role!,
      date: newInterview.date || new Date().toISOString().split('T')[0],
      painPoints: newInterview.painPoints || [],
      currentSolution: newInterview.currentSolution || "",
      willingnessToPay: newInterview.willingnessToPay || "",
      keyQuotes: newInterview.keyQuotes || [],
      wouldRecommend: newInterview.wouldRecommend ?? true,
      overallSentiment: newInterview.overallSentiment || "positive"
    };
    setInterviews([...interviews, interview]);
    setNewInterview({ painPoints: [], keyQuotes: [], overallSentiment: "positive", wouldRecommend: true });
    toast({ title: "Added", description: "User interview recorded" });
  };

  const addCaseStudy = () => {
    if (!newCaseStudy.title || !newCaseStudy.clientName) {
      toast({ title: "Missing Information", description: "Please fill in case study details", variant: "destructive" });
      return;
    }
    const caseStudy: CaseStudy = {
      id: Date.now().toString(),
      title: newCaseStudy.title!,
      clientName: newCaseStudy.clientName!,
      industry: newCaseStudy.industry || "",
      challenge: newCaseStudy.challenge || "",
      solution: newCaseStudy.solution || "",
      results: newCaseStudy.results || [],
      testimonialQuote: newCaseStudy.testimonialQuote,
      metrics: newCaseStudy.metrics || "",
      dateCompleted: newCaseStudy.dateCompleted || new Date().toISOString().split('T')[0]
    };
    setCaseStudies([...caseStudies, caseStudy]);
    setNewCaseStudy({ results: [] });
    toast({ title: "Added", description: "Case study documented" });
  };

  const exportValidation = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      validationScore: calculateValidationScore(),
      summary: {
        competitorsAnalyzed: competitors.length,
        userInterviewsConducted: interviews.length,
        positiveInterviews: interviews.filter(i => i.overallSentiment === "positive").length,
        caseStudiesDocumented: caseStudies.length,
        averageWillingnessToPay: interviews.filter(i => i.willingnessToPay).length > 0 
          ? "See individual interviews" 
          : "Not yet assessed"
      },
      competitorAnalysis: {
        competitors,
        competitiveAdvantages: competitors.flatMap(c => c.differentiator ? [c.differentiator] : [])
      },
      userInterviews: interviews,
      caseStudies,
      endorserStatement: `Commercial validation demonstrates genuine market demand through analysis of ${competitors.length} competitors, ${interviews.length} user interviews (${interviews.filter(i => i.overallSentiment === "positive").length} positive), and ${caseStudies.length} documented case studies. This evidence confirms that the proposed solution addresses real market needs.`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commercial-validation-report.json";
    a.click();
    
    toast({ title: "Exported", description: "Commercial validation report downloaded" });
  };

  const validationScore = calculateValidationScore();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Commercial Validation Suite</h1>
        <p className="text-muted-foreground">
          Build evidence that your business solves a real problem with real demand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className={validationScore >= 70 ? "border-green-500" : validationScore >= 40 ? "border-yellow-500" : "border-red-500"} data-testid="card-validation-score">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Validation Score</span>
              <Badge variant={validationScore >= 70 ? "default" : validationScore >= 40 ? "secondary" : "destructive"} data-testid="badge-validation-status">
                {validationScore >= 70 ? "Strong" : validationScore >= 40 ? "Moderate" : "Weak"}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-2" data-testid="text-validation-score">{validationScore}/100</div>
            <Progress value={validationScore} className="h-2" data-testid="progress-validation-score" />
          </CardContent>
        </Card>

        <Card data-testid="card-competitors-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Competitors</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-competitors-count">{competitors.length}</div>
            <p className="text-xs text-muted-foreground">analyzed</p>
          </CardContent>
        </Card>

        <Card data-testid="card-interviews-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Interviews</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-interviews-count">{interviews.length}</div>
            <p className="text-xs text-muted-foreground">conducted</p>
          </CardContent>
        </Card>

        <Card data-testid="card-case-studies-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Case Studies</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-case-studies-count">{caseStudies.length}</div>
            <p className="text-xs text-muted-foreground">documented</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Why Commercial Validation Matters</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Endorsers need proof that your business solves a REAL problem, not just a theoretical one. 
                Competitor analysis shows you understand the market. User interviews prove demand. Case studies demonstrate capability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="competitors" className="flex items-center gap-2" data-testid="tab-competitors">
            <Scale className="h-4 w-4" />
            <span>Competitors</span>
          </TabsTrigger>
          <TabsTrigger value="interviews" className="flex items-center gap-2" data-testid="tab-interviews">
            <MessageSquare className="h-4 w-4" />
            <span>User Interviews</span>
          </TabsTrigger>
          <TabsTrigger value="case-studies" className="flex items-center gap-2" data-testid="tab-case-studies">
            <FileText className="h-4 w-4" />
            <span>Case Studies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Competitor Analysis
              </CardTitle>
              <CardDescription>
                Map out your competitive landscape - endorsers want to see you understand your market
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Competitor Name *</Label>
                  <Input 
                    value={newCompetitor.name || ""} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                    placeholder="Competitor Ltd"
                    data-testid="input-competitor-name"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input 
                    value={newCompetitor.website || ""} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, website: e.target.value})}
                    placeholder="https://competitor.com"
                    data-testid="input-competitor-website"
                  />
                </div>
                <div>
                  <Label>Pricing Model</Label>
                  <Input 
                    value={newCompetitor.pricing || ""} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, pricing: e.target.value})}
                    placeholder="£50-200/month, Enterprise pricing"
                    data-testid="input-competitor-pricing"
                  />
                </div>
                <div>
                  <Label>Target Market</Label>
                  <Input 
                    value={newCompetitor.targetMarket || ""} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, targetMarket: e.target.value})}
                    placeholder="SMEs, Enterprise, Startups"
                    data-testid="input-competitor-target-market"
                  />
                </div>
                <div>
                  <Label>Strengths (comma-separated)</Label>
                  <Input 
                    value={(newCompetitor.strengths || []).join(", ")} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, strengths: e.target.value.split(",").map(s => s.trim())})}
                    placeholder="Brand recognition, Feature-rich, Market leader"
                    data-testid="input-competitor-strengths"
                  />
                </div>
                <div>
                  <Label>Weaknesses (comma-separated)</Label>
                  <Input 
                    value={(newCompetitor.weaknesses || []).join(", ")} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, weaknesses: e.target.value.split(",").map(s => s.trim())})}
                    placeholder="Expensive, Complex, Poor UX"
                    data-testid="input-competitor-weaknesses"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Your Differentiator (Why are you better?)</Label>
                  <Textarea 
                    value={newCompetitor.differentiator || ""} 
                    onChange={(e) => setNewCompetitor({...newCompetitor, differentiator: e.target.value})}
                    placeholder="How does your solution address their weaknesses or offer unique value?"
                    rows={2}
                    data-testid="textarea-competitor-differentiator"
                  />
                </div>
              </div>
              
              <Button onClick={addCompetitor} className="w-full" data-testid="button-add-competitor">
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>

              {competitors.length > 0 && (
                <div className="overflow-auto">
                  <table className="w-full border rounded-lg">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Competitor</th>
                        <th className="p-3 text-left text-sm font-medium">Pricing</th>
                        <th className="p-3 text-left text-sm font-medium">Strengths</th>
                        <th className="p-3 text-left text-sm font-medium">Weaknesses</th>
                        <th className="p-3 text-left text-sm font-medium">Your Edge</th>
                        <th className="p-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((comp) => (
                        <tr key={comp.id} className="border-t" data-testid={`row-competitor-${comp.id}`}>
                          <td className="p-3">
                            <div className="font-medium" data-testid={`text-competitor-name-${comp.id}`}>{comp.name}</div>
                            {comp.website && (
                              <a href={comp.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-xs text-blue-600 hover:underline" data-testid={`link-competitor-website-${comp.id}`}>{comp.website}</a>
                            )}
                          </td>
                          <td className="p-3 text-sm" data-testid={`text-competitor-pricing-${comp.id}`}>{comp.pricing || "-"}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {comp.strengths.slice(0, 2).map((s, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {comp.weaknesses.slice(0, 2).map((w, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{w}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-sm max-w-[200px] truncate" data-testid={`text-competitor-differentiator-${comp.id}`}>{comp.differentiator || "-"}</td>
                          <td className="p-3">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setCompetitors(competitors.filter(c => c.id !== comp.id))}
                              data-testid={`button-remove-competitor-${comp.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Interview Tracker
              </CardTitle>
              <CardDescription>
                Document interviews with potential customers to validate demand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Interviewee Name *</Label>
                  <Input 
                    value={newInterview.intervieweeName || ""} 
                    onChange={(e) => setNewInterview({...newInterview, intervieweeName: e.target.value})}
                    placeholder="Jane Smith"
                    data-testid="input-interviewee-name"
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Input 
                    value={newInterview.role || ""} 
                    onChange={(e) => setNewInterview({...newInterview, role: e.target.value})}
                    placeholder="Head of Operations"
                    data-testid="input-interviewee-role"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input 
                    value={newInterview.company || ""} 
                    onChange={(e) => setNewInterview({...newInterview, company: e.target.value})}
                    placeholder="Target Corp"
                    data-testid="input-interviewee-company"
                  />
                </div>
                <div>
                  <Label>Interview Date</Label>
                  <Input 
                    type="date"
                    value={newInterview.date || ""} 
                    onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                    data-testid="input-interview-date"
                  />
                </div>
                <div>
                  <Label>Pain Points (comma-separated)</Label>
                  <Input 
                    value={(newInterview.painPoints || []).join(", ")} 
                    onChange={(e) => setNewInterview({...newInterview, painPoints: e.target.value.split(",").map(s => s.trim())})}
                    placeholder="Manual processes, High costs, Lack of visibility"
                    data-testid="input-interview-pain-points"
                  />
                </div>
                <div>
                  <Label>Willingness to Pay</Label>
                  <Input 
                    value={newInterview.willingnessToPay || ""} 
                    onChange={(e) => setNewInterview({...newInterview, willingnessToPay: e.target.value})}
                    placeholder="£50-100/month, Would pay premium for X"
                    data-testid="input-interview-willingness-to-pay"
                  />
                </div>
                <div>
                  <Label>Overall Sentiment</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newInterview.overallSentiment || "positive"}
                    onChange={(e) => setNewInterview({...newInterview, overallSentiment: e.target.value as any})}
                    data-testid="select-interview-sentiment"
                  >
                    <option value="positive">Positive - Strong Interest</option>
                    <option value="neutral">Neutral - Some Interest</option>
                    <option value="negative">Negative - Not Interested</option>
                  </select>
                </div>
                <div>
                  <Label>Would Recommend?</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newInterview.wouldRecommend ? "yes" : "no"}
                    onChange={(e) => setNewInterview({...newInterview, wouldRecommend: e.target.value === "yes"})}
                    data-testid="select-interview-recommend"
                  >
                    <option value="yes">Yes - Would recommend to others</option>
                    <option value="no">No - Would not recommend</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Key Quotes (one per line)</Label>
                  <Textarea 
                    value={(newInterview.keyQuotes || []).join("\n")} 
                    onChange={(e) => setNewInterview({...newInterview, keyQuotes: e.target.value.split("\n").filter(q => q.trim())})}
                    placeholder='"This would save us hours every week"
"I wish something like this existed"
"We would definitely be early adopters"'
                    rows={3}
                    data-testid="textarea-interview-quotes"
                  />
                </div>
              </div>
              
              <Button onClick={addInterview} className="w-full" data-testid="button-add-interview">
                <Plus className="h-4 w-4 mr-2" />
                Add Interview
              </Button>

              {interviews.length > 0 && (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <Card key={interview.id} className="p-4" data-testid={`card-interview-${interview.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium" data-testid={`text-interview-name-${interview.id}`}>{interview.intervieweeName}</span>
                            <Badge variant="outline" data-testid={`badge-interview-role-${interview.id}`}>{interview.role}</Badge>
                            {interview.company && <Badge variant="secondary" data-testid={`badge-interview-company-${interview.id}`}>{interview.company}</Badge>}
                            <Badge variant={
                              interview.overallSentiment === "positive" ? "default" :
                              interview.overallSentiment === "neutral" ? "secondary" :
                              "destructive"
                            } data-testid={`badge-interview-sentiment-${interview.id}`}>
                              {interview.overallSentiment}
                            </Badge>
                            {interview.wouldRecommend ? (
                              <Check className="h-4 w-4 text-green-500" data-testid={`icon-interview-recommend-${interview.id}`} />
                            ) : (
                              <X className="h-4 w-4 text-red-500" data-testid={`icon-interview-not-recommend-${interview.id}`} />
                            )}
                          </div>
                          {interview.painPoints.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-sm text-muted-foreground">Pain points:</span>
                              {interview.painPoints.map((p, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                              ))}
                            </div>
                          )}
                          {interview.willingnessToPay && (
                            <p className="text-sm mt-1" data-testid={`text-interview-wtp-${interview.id}`}><strong>WTP:</strong> {interview.willingnessToPay}</p>
                          )}
                          {interview.keyQuotes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {interview.keyQuotes.slice(0, 2).map((quote, i) => (
                                <p key={i} className="text-sm italic text-muted-foreground">"{quote}"</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setInterviews(interviews.filter(i => i.id !== interview.id))}
                          data-testid={`button-remove-interview-${interview.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Interview Best Practices</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                        <li>• Aim for 10+ interviews for statistical significance</li>
                        <li>• Include decision-makers who can actually buy</li>
                        <li>• Document exact quotes - endorsers love real voice of customer</li>
                        <li>• Ask "Would you pay for this?" and document the answer</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case-studies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Study Builder
              </CardTitle>
              <CardDescription>
                Document success stories that prove your capability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Case Study Title *</Label>
                  <Input 
                    value={newCaseStudy.title || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, title: e.target.value})}
                    placeholder="How [Client] Achieved [Result]"
                    data-testid="input-case-study-title"
                  />
                </div>
                <div>
                  <Label>Client Name *</Label>
                  <Input 
                    value={newCaseStudy.clientName || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, clientName: e.target.value})}
                    placeholder="Acme Corporation"
                    data-testid="input-case-study-client"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input 
                    value={newCaseStudy.industry || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, industry: e.target.value})}
                    placeholder="Financial Services, Healthcare, etc."
                    data-testid="input-case-study-industry"
                  />
                </div>
                <div>
                  <Label>Key Metrics</Label>
                  <Input 
                    value={newCaseStudy.metrics || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, metrics: e.target.value})}
                    placeholder="50% time saved, £100k cost reduction"
                    data-testid="input-case-study-metrics"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>The Challenge</Label>
                  <Textarea 
                    value={newCaseStudy.challenge || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, challenge: e.target.value})}
                    placeholder="What problem did the client face?"
                    rows={2}
                    data-testid="textarea-case-study-challenge"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Your Solution</Label>
                  <Textarea 
                    value={newCaseStudy.solution || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, solution: e.target.value})}
                    placeholder="How did you solve their problem?"
                    rows={2}
                    data-testid="textarea-case-study-solution"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Results (one per line)</Label>
                  <Textarea 
                    value={(newCaseStudy.results || []).join("\n")} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, results: e.target.value.split("\n").filter(r => r.trim())})}
                    placeholder="Reduced processing time by 50%
Saved £100,000 annually
Improved customer satisfaction by 30%"
                    rows={3}
                    data-testid="textarea-case-study-results"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Client Testimonial Quote</Label>
                  <Textarea 
                    value={newCaseStudy.testimonialQuote || ""} 
                    onChange={(e) => setNewCaseStudy({...newCaseStudy, testimonialQuote: e.target.value})}
                    placeholder='"This solution transformed our operations..." - John Smith, CEO'
                    rows={2}
                    data-testid="textarea-case-study-testimonial"
                  />
                </div>
              </div>
              
              <Button onClick={addCaseStudy} className="w-full" data-testid="button-add-case-study">
                <Plus className="h-4 w-4 mr-2" />
                Add Case Study
              </Button>

              {caseStudies.length > 0 && (
                <div className="space-y-3">
                  {caseStudies.map((cs) => (
                    <Card key={cs.id} className="p-4" data-testid={`card-case-study-${cs.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium" data-testid={`text-case-study-title-${cs.id}`}>{cs.title}</span>
                            <Badge variant="secondary" data-testid={`badge-case-study-client-${cs.id}`}>{cs.clientName}</Badge>
                            {cs.industry && <Badge variant="outline" data-testid={`badge-case-study-industry-${cs.id}`}>{cs.industry}</Badge>}
                          </div>
                          {cs.challenge && (
                            <p className="text-sm mt-2" data-testid={`text-case-study-challenge-${cs.id}`}><strong>Challenge:</strong> {cs.challenge}</p>
                          )}
                          {cs.metrics && (
                            <p className="text-sm" data-testid={`text-case-study-metrics-${cs.id}`}><strong>Impact:</strong> {cs.metrics}</p>
                          )}
                          {cs.results.length > 0 && (
                            <ul className="text-sm mt-2 list-disc list-inside">
                              {cs.results.slice(0, 3).map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                          {cs.testimonialQuote && (
                            <p className="text-sm italic text-muted-foreground mt-2" data-testid={`text-case-study-testimonial-${cs.id}`}>"{cs.testimonialQuote}"</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCaseStudies(caseStudies.filter(c => c.id !== cs.id))}
                          data-testid={`button-remove-case-study-${cs.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Validation Package</h3>
              <p className="text-sm text-muted-foreground">
                Download complete commercial validation evidence for endorsers
              </p>
            </div>
            <Button onClick={exportValidation} data-testid="button-export-validation">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
