import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertTriangle, Shield, TrendingDown, Zap, CheckCircle2, XCircle, 
  RefreshCw, Lightbulb, Target, BarChart3, Play, Loader2
} from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'risk-analysis',
  toolName: 'Risk Analysis',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. Let's identify and mitigate risks for your UK visa application.",
  questions: [
    { id: 'business-stage', question: "What stage is your business at, and what primary risks do you face?", fieldKey: 'businessStage', minLength: 30 },
    { id: 'market-risks', question: "What market risks could impact your UK business success?", fieldKey: 'marketRisks', minLength: 30 },
    { id: 'financial-risks', question: "What are your key financial risks and runway considerations?", fieldKey: 'financialRisks', minLength: 30 },
    { id: 'operational-risks', question: "What operational risks could affect your ability to deliver?", fieldKey: 'operationalRisks', minLength: 30 },
    { id: 'mitigation-strategies', question: "What risk mitigation strategies do you have in place?", fieldKey: 'mitigationStrategies', minLength: 30 },
    { id: 'visa-specific-risks', question: "Are there visa-specific risks affecting your endorsement pathway?", fieldKey: 'visaSpecificRisks', minLength: 20 }
  ],
  completionMessage: "Risk landscape captured! Populating your risk matrix with assessments and mitigations."
};

interface Risk {
  id: string;
  name: string;
  category: 'market' | 'financial' | 'operational' | 'regulatory' | 'technical' | 'visa';
  likelihood: number;
  impact: number;
  description: string;
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring';
  autoRemediation?: string[];
}

const INITIAL_RISKS: Risk[] = [
  { id: 'r1', name: 'Market Entry Barriers', category: 'market', likelihood: 3, impact: 4, description: 'High competition in UK target market', mitigation: 'Differentiate through innovation and first-mover advantage', status: 'active' },
  { id: 'r2', name: 'Cash Flow Shortfall', category: 'financial', likelihood: 4, impact: 5, description: 'Potential funding gap in months 6-12', mitigation: 'Secure bridge funding or accelerate revenue', status: 'active' },
  { id: 'r3', name: 'Key Person Dependency', category: 'operational', likelihood: 3, impact: 4, description: 'Business heavily reliant on founder', mitigation: 'Document processes and build advisory board', status: 'monitoring' },
  { id: 'r4', name: 'Regulatory Changes', category: 'regulatory', likelihood: 2, impact: 4, description: 'UK visa or industry regulation changes', mitigation: 'Monitor gov.uk updates and maintain compliance buffer', status: 'monitoring' },
  { id: 'r5', name: 'Technical Debt', category: 'technical', likelihood: 3, impact: 3, description: 'Rapid development may compromise scalability', mitigation: 'Regular code reviews and refactoring sprints', status: 'active' },
  { id: 'r6', name: 'Endorsement Loss', category: 'visa', likelihood: 2, impact: 5, description: 'Risk of losing endorser support mid-visa', mitigation: 'Maintain regular progress reports and compliance', status: 'monitoring' },
];

export default function RiskAnalysis() {
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('risk-analysis-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [risks, setRisks] = useState<Risk[]>(INITIAL_RISKS);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [autoRemediationResults, setAutoRemediationResults] = useState<Record<string, string[]>>({});

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('risk-analysis-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('risk-analysis-mode', mode);
  }, [mode]);

  const autoRemediateMutation = useMutation({
    mutationFn: async (risk: Risk) => {
      const response = await apiRequest('POST', '/api/ai/auto-remediate', { risk });
      return response.json();
    },
    onSuccess: (data, risk) => {
      setAutoRemediationResults(prev => ({ ...prev, [risk.id]: data.remediations || [] }));
      toast({ title: "Auto-Remediation Complete", description: `Generated ${data.remediations?.length || 0} remediation strategies` });
    }
  });

  const handleAiComplete = (answers: Record<string, string>) => {
    setMode('traditional');
  };

  const calculateRiskScore = (risk: Risk) => risk.likelihood * risk.impact;
  
  const getRiskLevel = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (score >= 16) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const overallRiskScore = Math.round(risks.reduce((sum, r) => sum + calculateRiskScore(r), 0) / risks.length);
  const criticalRisks = risks.filter(r => getRiskLevel(calculateRiskScore(r)) === 'critical').length;
  const highRisks = risks.filter(r => getRiskLevel(calculateRiskScore(r)) === 'high').length;
  const mitigatedRisks = risks.filter(r => r.status === 'mitigated').length;

  const matrixData = risks.map(r => ({
    x: r.likelihood,
    y: r.impact,
    name: r.name,
    score: calculateRiskScore(r),
    level: getRiskLevel(calculateRiskScore(r))
  }));

  const categoryData = ['market', 'financial', 'operational', 'regulatory', 'technical', 'visa'].map(cat => {
    const catRisks = risks.filter(r => r.category === cat);
    const avgScore = catRisks.length ? catRisks.reduce((s, r) => s + calculateRiskScore(r), 0) / catRisks.length : 0;
    return { category: cat.charAt(0).toUpperCase() + cat.slice(1), score: avgScore * 5, fullMark: 100 };
  });

  const updateRisk = (riskId: string, updates: Partial<Risk>) => {
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, ...updates } : r));
  };

  const getSerializedState = useCallback(() => ({ risks, activeTab }), [risks, activeTab]);
  const restoreState = (state: any) => {
    if (state.risks) setRisks(state.risks);
    if (state.activeTab) setActiveTab(state.activeTab);
  };

  const handleSave = () => {
    localStorage.setItem('risk-analysis-state', JSON.stringify(getSerializedState()));
    toast({ title: "Progress Saved", description: "Your risk analysis has been saved." });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('risk-analysis-state');
    if (saved) restoreState(JSON.parse(saved));
  };

  const handleExport = () => {
    const content = risks.map(r => 
      `${r.name} (${r.category})\nLikelihood: ${r.likelihood}/5, Impact: ${r.impact}/5, Score: ${calculateRiskScore(r)}\nStatus: ${r.status}\nMitigation: ${r.mitigation}\n`
    ).join('\n---\n');
    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold" data-testid="heading-risk-analysis">Risk Analysis & Auto-Remediation</h1>
            <p className="text-lg text-muted-foreground">Real-time risk scoring with AI-powered mitigation strategies</p>
          </div>
          <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
        </div>

        {mode === 'ai' ? (
          <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
        ) : (
          <>
            <ToolUtilityBar toolId="risk-analysis" onSave={handleSave} onRestore={handleRestore} onExport={handleExport} getSerializedState={getSerializedState} toolName="Risk Analysis" />

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className={overallRiskScore <= 8 ? "border-green-500" : overallRiskScore <= 12 ? "border-yellow-500" : "border-red-500"}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Overall Risk Score</p>
                  <p className="text-4xl font-bold" data-testid="text-overall-risk">{overallRiskScore}</p>
                  <Badge className={`mt-2 ${overallRiskScore <= 8 ? 'bg-green-500' : overallRiskScore <= 12 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {overallRiskScore <= 8 ? 'Low' : overallRiskScore <= 12 ? 'Medium' : 'High'}
                  </Badge>
                </CardContent>
              </Card>
              <Card className={criticalRisks === 0 ? "border-green-500" : "border-red-500"}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Critical Risks</p>
                  <p className="text-4xl font-bold text-red-500" data-testid="text-critical-risks">{criticalRisks}</p>
                  {criticalRisks > 0 && <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mt-2" />}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">High Risks</p>
                  <p className="text-4xl font-bold text-orange-500" data-testid="text-high-risks">{highRisks}</p>
                  <TrendingDown className="w-5 h-5 text-orange-500 mx-auto mt-2" />
                </CardContent>
              </Card>
              <Card className="border-green-500">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Mitigated</p>
                  <p className="text-4xl font-bold text-green-500" data-testid="text-mitigated">{mitigatedRisks}</p>
                  <Shield className="w-5 h-5 text-green-500 mx-auto mt-2" />
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="matrix" data-testid="tab-matrix">Risk Matrix</TabsTrigger>
                <TabsTrigger value="remediation" data-testid="tab-remediation">Auto-Remediation</TabsTrigger>
                <TabsTrigger value="details" data-testid="tab-details">Risk Details</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Category Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={categoryData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="category" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="Risk Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Risks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {risks.sort((a, b) => calculateRiskScore(b) - calculateRiskScore(a)).slice(0, 5).map(risk => (
                        <div key={risk.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(getRiskLevel(calculateRiskScore(risk))) }} />
                            <span className="font-medium">{risk.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{calculateRiskScore(risk)}</Badge>
                            <Badge className={`${risk.status === 'mitigated' ? 'bg-green-500' : risk.status === 'monitoring' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                              {risk.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="matrix">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Likelihood vs Impact Matrix</CardTitle>
                    <CardDescription>Visual representation of all risks by probability and severity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="Likelihood" domain={[0, 5]} label={{ value: 'Likelihood', position: 'bottom' }} />
                        <YAxis type="number" dataKey="y" name="Impact" domain={[0, 5]} label={{ value: 'Impact', angle: -90, position: 'left' }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">Score: {data.score}</p>
                                <Badge style={{ backgroundColor: getRiskColor(data.level) }}>{data.level}</Badge>
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Scatter data={matrixData}>
                          {matrixData.map((entry, index) => (
                            <Cell key={index} fill={getRiskColor(entry.level)} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="remediation" className="space-y-6">
                <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-violet-500" />
                      AI Auto-Remediation Engine
                    </CardTitle>
                    <CardDescription>Select a risk to generate AI-powered mitigation strategies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedRisk?.id || ''} onValueChange={(val) => setSelectedRisk(risks.find(r => r.id === val) || null)}>
                      <SelectTrigger data-testid="select-risk">
                        <SelectValue placeholder="Select a risk to remediate" />
                      </SelectTrigger>
                      <SelectContent>
                        {risks.filter(r => r.status !== 'mitigated').map(risk => (
                          <SelectItem key={risk.id} value={risk.id}>
                            {risk.name} (Score: {calculateRiskScore(risk)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedRisk && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-2">{selectedRisk.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">Category: {selectedRisk.category}</Badge>
                            <Badge style={{ backgroundColor: getRiskColor(getRiskLevel(calculateRiskScore(selectedRisk))) }}>
                              Score: {calculateRiskScore(selectedRisk)}
                            </Badge>
                          </div>
                        </div>

                        <Button 
                          onClick={() => autoRemediateMutation.mutate(selectedRisk)}
                          disabled={autoRemediateMutation.isPending}
                          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                          data-testid="button-auto-remediate"
                        >
                          {autoRemediateMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Strategies...</>
                          ) : (
                            <><Lightbulb className="w-4 h-4 mr-2" />Generate Auto-Remediation Plan</>
                          )}
                        </Button>

                        {autoRemediationResults[selectedRisk.id] && (
                          <div className="space-y-2 pt-4 border-t">
                            <h5 className="font-medium flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              AI-Generated Remediation Strategies
                            </h5>
                            {autoRemediationResults[selectedRisk.id].map((strategy, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <Target className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">{strategy}</span>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => updateRisk(selectedRisk.id, { status: 'mitigated' })} className="mt-2">
                              <CheckCircle2 className="w-4 h-4 mr-2" />Mark as Mitigated
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>All Risks</CardTitle>
                    <CardDescription>Detailed view of all identified risks with editable parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {risks.map(risk => (
                        <div key={risk.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{risk.name}</h4>
                              <p className="text-sm text-muted-foreground">{risk.description}</p>
                            </div>
                            <Badge style={{ backgroundColor: getRiskColor(getRiskLevel(calculateRiskScore(risk))) }}>
                              {calculateRiskScore(risk)} pts
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium">Likelihood (1-5)</label>
                              <Select value={String(risk.likelihood)} onValueChange={(v) => updateRisk(risk.id, { likelihood: Number(v) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Impact (1-5)</label>
                              <Select value={String(risk.impact)} onValueChange={(v) => updateRisk(risk.id, { impact: Number(v) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Select value={risk.status} onValueChange={(v: 'active' | 'mitigated' | 'monitoring') => updateRisk(risk.id, { status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="monitoring">Monitoring</SelectItem>
                                  <SelectItem value="mitigated">Mitigated</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
