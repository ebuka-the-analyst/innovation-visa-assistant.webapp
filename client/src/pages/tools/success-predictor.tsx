import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Target, BarChart3, Lightbulb, Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type PredictionFactor = {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  category: "innovation" | "viability" | "scalability" | "applicant" | "documentation";
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'success-predictor',
  toolName: 'Success Probability Predictor',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your growth strategist. I'll help you predict your Innovator Founder Visa application success probability by analyzing key factors that endorsing bodies evaluate.",
  questions: [
    { id: 'innovation', question: "How innovative is your business concept?", hint: "Consider novel technology, unique approach, or market disruption", fieldKey: 'innovationScore', fieldType: 'text' },
    { id: 'market', question: "What evidence do you have for market demand?", hint: "Customer validation, LOIs, pilot programs, waitlists", fieldKey: 'marketEvidence', fieldType: 'text' },
    { id: 'experience', question: "What relevant experience do you bring as a founder?", hint: "Industry expertise, previous startups, technical background", fieldKey: 'founderExperience', fieldType: 'text' },
    { id: 'funding', question: "What is your current funding status?", hint: "Self-funded, angel investment, VC funding, grants", fieldKey: 'fundingStatus', fieldType: 'select', options: ['Self-funded', 'Friends & Family', 'Angel Investment', 'VC Funding', 'Grants', 'No funding yet'] },
    { id: 'jobs', question: "How many UK jobs do you plan to create in 3 years?", hint: "Job creation is weighted heavily in visa decisions", fieldKey: 'jobCreation', fieldType: 'number' },
    { id: 'documents', question: "How complete is your application documentation?", hint: "Business plan, financials, market research, pitch deck", fieldKey: 'documentationQuality', fieldType: 'text' },
  ],
  completionMessage: "I've analyzed your application factors. Let me calculate your success probability and identify areas for improvement."
};

const DEFAULT_FACTORS: PredictionFactor[] = [
  { id: "innovation", name: "Innovation Level", description: "How innovative and novel is your business idea", weight: 0.15, score: 50, category: "innovation" },
  { id: "market-gap", name: "Market Gap Evidence", description: "Strength of evidence for market need", weight: 0.12, score: 50, category: "innovation" },
  { id: "ip-protection", name: "IP Protection", description: "Patents, trademarks, or other IP protections", weight: 0.08, score: 50, category: "innovation" },
  { id: "business-model", name: "Business Model Clarity", description: "Clear and viable revenue model", weight: 0.12, score: 50, category: "viability" },
  { id: "financial-projections", name: "Financial Projections", description: "Realistic and well-researched projections", weight: 0.10, score: 50, category: "viability" },
  { id: "funding-status", name: "Funding Status", description: "Current funding and investment interest", weight: 0.08, score: 50, category: "viability" },
  { id: "growth-potential", name: "Growth Potential", description: "Demonstrated scalability plan", weight: 0.10, score: 50, category: "scalability" },
  { id: "uk-job-creation", name: "UK Job Creation Plan", description: "Clear plan for creating UK jobs", weight: 0.08, score: 50, category: "scalability" },
  { id: "founder-experience", name: "Founder Experience", description: "Relevant industry and business experience", weight: 0.08, score: 50, category: "applicant" },
  { id: "document-quality", name: "Document Quality", description: "Completeness and quality of supporting documents", weight: 0.09, score: 50, category: "documentation" },
];

export default function SuccessPredictor() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('success-predictor-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('success-predictor-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('success-predictor-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    setMode('traditional');
  };

  const [factors, setFactors] = useState<PredictionFactor[]>(() => {
    const saved = localStorage.getItem("success-predictor-state");
    if (saved) {
      try {
        return JSON.parse(saved).factors || DEFAULT_FACTORS;
      } catch { }
    }
    return DEFAULT_FACTORS;
  });

  const [activeTab, setActiveTab] = useState("assessment");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newFactors: PredictionFactor[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("success-predictor-state", JSON.stringify({ factors: newFactors }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateFactorScore = (id: string, score: number) => {
    const newFactors = factors.map(f => 
      f.id === id ? { ...f, score } : f
    );
    setFactors(newFactors);
    triggerAutoSave(newFactors);
  };

  const calculatePrediction = () => {
    return Math.round(factors.reduce((acc, f) => acc + (f.score * f.weight), 0));
  };

  const prediction = calculatePrediction();

  const getPredictionStatus = () => {
    if (prediction >= 75) return { label: "High Success Probability", color: "text-green-500", icon: CheckCircle2 };
    if (prediction >= 50) return { label: "Moderate Success Probability", color: "text-amber-500", icon: AlertTriangle };
    return { label: "Low Success Probability", color: "text-red-500", icon: XCircle };
  };

  const status = getPredictionStatus();
  const StatusIcon = status.icon;

  const getCategoryScore = (category: PredictionFactor["category"]) => {
    const categoryFactors = factors.filter(f => f.category === category);
    const totalWeight = categoryFactors.reduce((acc, f) => acc + f.weight, 0);
    const weightedScore = categoryFactors.reduce((acc, f) => acc + (f.score * f.weight), 0);
    return Math.round(weightedScore / totalWeight);
  };

  const radarData = [
    { category: "Innovation", score: getCategoryScore("innovation") },
    { category: "Viability", score: getCategoryScore("viability") },
    { category: "Scalability", score: getCategoryScore("scalability") },
    { category: "Applicant", score: getCategoryScore("applicant") },
    { category: "Documentation", score: getCategoryScore("documentation") },
  ];

  const barData = factors.map(f => ({
    name: f.name.split(" ").slice(0, 2).join(" "),
    score: f.score,
    weight: Math.round(f.weight * 100),
  }));

  const getWeakAreas = () => factors.filter(f => f.score < 50);
  const getStrongAreas = () => factors.filter(f => f.score >= 70);

  const handleExportWord = () => {
    generateWord({
      title: "Success Probability Prediction Report",
      subtitle: `Overall Prediction: ${prediction}%`,
      filename: "success-prediction",
      sections: [
        { type: "heading", content: "Prediction Summary", level: 1 },
        { type: "paragraph", content: `Overall Success Probability: ${prediction}%` },
        { type: "paragraph", content: `Status: ${status.label}` },
        { type: "divider" },
        { type: "heading", content: "Category Breakdown", level: 2 },
        ...radarData.map(d => ({
          type: "paragraph" as const,
          content: `${d.category}: ${d.score}%`
        })),
        { type: "divider" },
        { type: "heading", content: "Factor Analysis", level: 2 },
        { type: "table", tableData: {
          headers: ["Factor", "Score", "Weight", "Contribution"],
          rows: factors.map(f => [
            f.name,
            `${f.score}%`,
            `${Math.round(f.weight * 100)}%`,
            `${Math.round(f.score * f.weight)}%`
          ])
        }},
        { type: "divider" },
        { type: "heading", content: "Areas for Improvement", level: 2 },
        ...getWeakAreas().map(f => ({
          type: "paragraph" as const,
          content: `${f.name} (${f.score}%): ${f.description}`
        })),
      ],
    });
    toast({ title: "Export Complete", description: "Prediction report exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("success-predictor-state", JSON.stringify({ factors }));
    toast({ title: "Saved", description: "Your assessment has been saved" });
  };

  const getCategoryBadge = (category: PredictionFactor["category"]) => {
    const colors: Record<string, string> = {
      innovation: "bg-purple-500",
      viability: "bg-blue-500",
      scalability: "bg-green-500",
      applicant: "bg-amber-500",
      documentation: "bg-pink-500",
    };
    return <Badge className={colors[category]}>{category}</Badge>;
  };

  return (
    <ToolAccessGuard requiredTier="enterprise" toolName="Success Probability Predictor">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Success Probability Predictor</h1>
            <p className="text-muted-foreground">AI-powered prediction of your visa application success</p>
          </div>

          <ToolUtilityBar
            toolId="success-predictor"
            toolName="Success Probability Predictor"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          <div className="flex justify-end mt-4 mb-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <div className="mt-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="12"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke={prediction >= 75 ? "hsl(142, 76%, 36%)" : prediction >= 50 ? "hsl(43, 96%, 56%)" : "hsl(0, 84%, 60%)"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${prediction * 5.53} 553`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{prediction}%</span>
                      <span className="text-sm text-muted-foreground">Success</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className={`flex items-center gap-2 justify-center md:justify-start mb-2 ${status.color}`}>
                      <StatusIcon className="w-6 h-6" />
                      <span className="text-xl font-semibold">{status.label}</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Based on your current assessment scores, we predict your application has a {prediction}% chance of success.
                    </p>
                    {prediction < 70 && (
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          Focus on improving your weak areas to increase your success probability.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-5 mb-6">
              {radarData.map((d) => (
                <Card key={d.category}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{d.score}%</div>
                    <div className="text-sm text-muted-foreground">{d.category}</div>
                    <Progress value={d.score} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="assessment" data-testid="tab-assessment">Factor Assessment</TabsTrigger>
                <TabsTrigger value="insights" data-testid="tab-insights">Insights</TabsTrigger>
                <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="assessment">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Factors</CardTitle>
                    <CardDescription>Rate each factor based on your current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {factors.map((factor) => (
                        <div key={factor.id} className="space-y-3" data-testid={`factor-${factor.id}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{factor.name}</span>
                              {getCategoryBadge(factor.category)}
                              <Badge variant="outline">{Math.round(factor.weight * 100)}% weight</Badge>
                            </div>
                            <span className="text-2xl font-bold">{factor.score}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                          <Slider
                            value={[factor.score]}
                            onValueChange={([v]) => updateFactorScore(factor.id, v)}
                            max={100}
                            step={1}
                            className="w-full"
                            data-testid={`slider-${factor.id}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                        Strong Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStrongAreas().length > 0 ? (
                        <div className="space-y-4">
                          {getStrongAreas().map(f => (
                            <div key={f.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{f.name}</span>
                                <Badge className="bg-green-500">{f.score}%</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{f.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No strong areas yet (70%+ required)</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getWeakAreas().length > 0 ? (
                        <div className="space-y-4">
                          {getWeakAreas().map(f => (
                            <div key={f.id} className="p-3 border border-red-500/30 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{f.name}</span>
                                <Badge variant="destructive">{f.score}%</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{f.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-green-500">No weak areas - great job!</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {prediction < 50 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Your current prediction suggests significant improvement is needed. Consider consulting with an immigration lawyer.
                            </AlertDescription>
                          </Alert>
                        )}
                        {getWeakAreas().slice(0, 3).map(f => (
                          <div key={f.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium">Improve {f.name}</span>
                              <p className="text-sm text-muted-foreground">
                                Currently at {f.score}%. Aim for at least 70% to strengthen your application.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Radar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Factor Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                            <Tooltip />
                            <Bar dataKey="score" fill="hsl(var(--primary))" name="Score %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
