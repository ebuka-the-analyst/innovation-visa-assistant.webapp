import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Target, Plus, Trash2, Save, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'scenario-planner',
  toolName: 'Scenario Planner',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Advisor. Scenario planning demonstrates strategic thinking and risk awareness to endorsing bodies. Let's model best, expected, and worst-case scenarios for your venture.",
  questions: [
    {
      id: 'best-case-scenario',
      question: "Describe your best-case scenario for Year 1. What would exceptional success look like?",
      hint: "Include revenue, customer growth, team size, and key milestones achieved.",
      fieldKey: 'bestCase',
      minLength: 50
    },
    {
      id: 'best-case-assumptions',
      question: "What assumptions underpin your best-case scenario?",
      hint: "Consider market conditions, funding, customer adoption, and competitive dynamics.",
      fieldKey: 'bestCaseAssumptions',
      minLength: 40
    },
    {
      id: 'expected-scenario',
      question: "What is your expected (most likely) scenario for Year 1?",
      hint: "Be realistic - this should be your working assumption for planning.",
      fieldKey: 'expectedCase',
      minLength: 50
    },
    {
      id: 'worst-case-scenario',
      question: "Describe your worst-case scenario. What challenges could derail your plans?",
      hint: "Consider funding gaps, market rejection, technical failures, or regulatory issues.",
      fieldKey: 'worstCase',
      minLength: 50
    },
    {
      id: 'mitigation-strategies',
      question: "What contingency plans do you have for the worst-case scenario?",
      hint: "Include pivot options, cost reduction strategies, and runway extension plans.",
      fieldKey: 'mitigationStrategies',
      minLength: 40
    },
    {
      id: 'scenario-probabilities',
      question: "What probability do you assign to each scenario (best/expected/worst)?",
      hint: "Be honest - endorsing bodies appreciate realistic risk assessment.",
      fieldKey: 'scenarioProbabilities',
      minLength: 20
    }
  ],
  completionMessage: "Excellent strategic thinking! I've captured your scenario analysis. I'm now populating your planner with detailed scenarios, probability assessments, and mitigation strategies."
};

type ScenarioType = "best" | "expected" | "worst";

type Scenario = {
  id: string;
  type: ScenarioType;
  title: string;
  description: string;
  assumptions: string[];
  outcomes: {
    revenue: string;
    customers: string;
    team: string;
    timeline: string;
  };
  risks: string[];
  mitigations: string[];
  probability: number;
};

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "1",
    type: "best",
    title: "Best Case Scenario",
    description: "Everything goes according to plan with significant early traction",
    assumptions: [
      "Product-market fit achieved within 3 months",
      "Early adopter customers secured quickly",
      "Funding round closes faster than expected"
    ],
    outcomes: {
      revenue: "£100,000 MRR by end of Year 1",
      customers: "500+ paying customers",
      team: "15+ team members",
      timeline: "Series A ready within 18 months"
    },
    risks: ["Over-optimism leading to poor resource allocation"],
    mitigations: ["Maintain conservative cash runway despite growth"],
    probability: 15
  },
  {
    id: "2",
    type: "expected",
    title: "Expected Case Scenario",
    description: "Realistic growth trajectory with some challenges overcome",
    assumptions: [
      "Product-market fit within 6 months",
      "Gradual customer acquisition",
      "Funding achieved as planned"
    ],
    outcomes: {
      revenue: "£50,000 MRR by end of Year 1",
      customers: "200+ paying customers",
      team: "8-10 team members",
      timeline: "Seed funding secured, preparing for Series A"
    },
    risks: ["Market competition", "Longer sales cycles"],
    mitigations: ["Diversify customer acquisition channels", "Build strong pipeline"],
    probability: 60
  },
  {
    id: "3",
    type: "worst",
    title: "Worst Case Scenario",
    description: "Significant challenges and pivots required",
    assumptions: [
      "Product-market fit takes longer than expected",
      "Funding environment becomes difficult",
      "Key team member departures"
    ],
    outcomes: {
      revenue: "£10,000 MRR by end of Year 1",
      customers: "50+ paying customers",
      team: "3-5 team members",
      timeline: "Focus on survival and validation"
    },
    risks: ["Running out of runway", "Loss of key customers", "Visa complications"],
    mitigations: ["Maintain 18-month runway", "Diversify revenue streams", "Keep endorser informed"],
    probability: 25
  },
];

export default function ScenarioPlanner() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('scenario-planner-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem("scenario-planner-state");
    if (saved) {
      try {
        return JSON.parse(saved).scenarios || DEFAULT_SCENARIOS;
      } catch { }
    }
    return DEFAULT_SCENARIOS;
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('scenario-planner-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('scenario-planner-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    const updatedScenarios = [...scenarios];
    if (answers.bestCase) {
      const bestIdx = updatedScenarios.findIndex(s => s.type === 'best');
      if (bestIdx >= 0) {
        updatedScenarios[bestIdx] = {
          ...updatedScenarios[bestIdx],
          description: answers.bestCase,
          assumptions: answers.bestCaseAssumptions ? [answers.bestCaseAssumptions] : updatedScenarios[bestIdx].assumptions
        };
      }
    }
    if (answers.expectedCase) {
      const expectedIdx = updatedScenarios.findIndex(s => s.type === 'expected');
      if (expectedIdx >= 0) {
        updatedScenarios[expectedIdx] = {
          ...updatedScenarios[expectedIdx],
          description: answers.expectedCase
        };
      }
    }
    if (answers.worstCase) {
      const worstIdx = updatedScenarios.findIndex(s => s.type === 'worst');
      if (worstIdx >= 0) {
        updatedScenarios[worstIdx] = {
          ...updatedScenarios[worstIdx],
          description: answers.worstCase,
          mitigations: answers.mitigationStrategies ? [answers.mitigationStrategies] : updatedScenarios[worstIdx].mitigations
        };
      }
    }
    setScenarios(updatedScenarios);
    setMode('traditional');
  };

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newScenarios: Scenario[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("scenario-planner-state", JSON.stringify({ scenarios: newScenarios }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    const newScenarios = scenarios.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setScenarios(newScenarios);
    triggerAutoSave(newScenarios);
  };

  const updateScenarioOutcome = (id: string, field: keyof Scenario["outcomes"], value: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      updateScenario(id, { outcomes: { ...scenario.outcomes, [field]: value } });
    }
  };

  const addAssumption = (id: string, assumption: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario && assumption.trim()) {
      updateScenario(id, { assumptions: [...scenario.assumptions, assumption.trim()] });
    }
  };

  const removeAssumption = (id: string, index: number) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      updateScenario(id, { assumptions: scenario.assumptions.filter((_, i) => i !== index) });
    }
  };

  const addRisk = (id: string, risk: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario && risk.trim()) {
      updateScenario(id, { risks: [...scenario.risks, risk.trim()] });
    }
  };

  const removeRisk = (id: string, index: number) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      updateScenario(id, { risks: scenario.risks.filter((_, i) => i !== index) });
    }
  };

  const addMitigation = (id: string, mitigation: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario && mitigation.trim()) {
      updateScenario(id, { mitigations: [...scenario.mitigations, mitigation.trim()] });
    }
  };

  const removeMitigation = (id: string, index: number) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      updateScenario(id, { mitigations: scenario.mitigations.filter((_, i) => i !== index) });
    }
  };

  const getScenarioIcon = (type: ScenarioType) => {
    switch (type) {
      case "best": return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "expected": return <Target className="w-5 h-5 text-amber-500" />;
      case "worst": return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
  };

  const getScenarioBadge = (type: ScenarioType) => {
    switch (type) {
      case "best": return <Badge className="bg-green-500">Best Case</Badge>;
      case "expected": return <Badge className="bg-amber-500">Expected</Badge>;
      case "worst": return <Badge variant="destructive">Worst Case</Badge>;
    }
  };

  const handleExportWord = () => {
    generateWord({
      title: "Scenario Planning Report",
      subtitle: "Best, Expected, and Worst Case Analysis",
      filename: "scenario-planner",
      sections: [
        { type: "heading", content: "Scenario Overview", level: 1 },
        ...scenarios.flatMap(s => [
          { type: "heading" as const, content: s.title, level: 2 },
          { type: "paragraph" as const, content: s.description },
          { type: "paragraph" as const, content: `Probability: ${s.probability}%` },
          { type: "heading" as const, content: "Assumptions", level: 3 },
          { type: "list" as const, items: s.assumptions },
          { type: "heading" as const, content: "Projected Outcomes", level: 3 },
          { type: "paragraph" as const, content: `Revenue: ${s.outcomes.revenue}` },
          { type: "paragraph" as const, content: `Customers: ${s.outcomes.customers}` },
          { type: "paragraph" as const, content: `Team: ${s.outcomes.team}` },
          { type: "paragraph" as const, content: `Timeline: ${s.outcomes.timeline}` },
          { type: "heading" as const, content: "Risks", level: 3 },
          { type: "list" as const, items: s.risks },
          { type: "heading" as const, content: "Mitigations", level: 3 },
          { type: "list" as const, items: s.mitigations },
          { type: "divider" as const },
        ]),
      ],
    });
    toast({ title: "Export Complete", description: "Scenario plan exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("scenario-planner-state", JSON.stringify({ scenarios }));
    toast({ title: "Saved", description: "Your scenarios have been saved" });
  };

  const [newAssumption, setNewAssumption] = useState<Record<string, string>>({});
  const [newRisk, setNewRisk] = useState<Record<string, string>>({});
  const [newMitigation, setNewMitigation] = useState<Record<string, string>>({});

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Scenario Planner">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Scenario Planner</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
            <p className="text-muted-foreground">Plan for best, expected, and worst case scenarios</p>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="scenario-planner"
            toolName="Scenario Planner"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          <div className="mt-6">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer hover-elevate ${
                    scenario.type === "best" ? "border-green-500/50" :
                    scenario.type === "expected" ? "border-amber-500/50" :
                    "border-red-500/50"
                  }`}
                  data-testid={`scenario-card-${scenario.type}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getScenarioIcon(scenario.type)}
                      <span className="font-medium">{scenario.title}</span>
                    </div>
                    <div className="text-3xl font-bold mb-2">{scenario.probability}%</div>
                    <p className="text-sm text-muted-foreground">Probability</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="detailed" data-testid="tab-detailed">Detailed Planning</TabsTrigger>
                <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {scenarios.map((scenario) => (
                    <Card key={scenario.id} data-testid={`scenario-overview-${scenario.type}`}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          {getScenarioIcon(scenario.type)}
                          <CardTitle>{scenario.title}</CardTitle>
                          {getScenarioBadge(scenario.type)}
                          <Badge variant="outline">{scenario.probability}% probability</Badge>
                        </div>
                        <CardDescription>{scenario.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-3">Key Assumptions</h4>
                            <ul className="space-y-2">
                              {scenario.assumptions.map((assumption, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span>{assumption}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Projected Outcomes</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Revenue:</span>
                                <span className="font-medium">{scenario.outcomes.revenue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Customers:</span>
                                <span className="font-medium">{scenario.outcomes.customers}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Team:</span>
                                <span className="font-medium">{scenario.outcomes.team}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Timeline:</span>
                                <span className="font-medium">{scenario.outcomes.timeline}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="detailed">
                <Accordion type="single" collapsible defaultValue="expected">
                  {scenarios.map((scenario) => (
                    <AccordionItem key={scenario.id} value={scenario.type}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          {getScenarioIcon(scenario.type)}
                          <span className="font-medium">{scenario.title}</span>
                          {getScenarioBadge(scenario.type)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 pt-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={scenario.description}
                                onChange={(e) => updateScenario(scenario.id, { description: e.target.value })}
                                placeholder="Describe this scenario..."
                                data-testid={`textarea-description-${scenario.type}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Probability (%)</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={scenario.probability}
                                onChange={(e) => updateScenario(scenario.id, { probability: parseInt(e.target.value) || 0 })}
                                data-testid={`input-probability-${scenario.type}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2 block">Assumptions</Label>
                            <div className="space-y-2">
                              {scenario.assumptions.map((assumption, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Input value={assumption} disabled className="flex-1" />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAssumption(scenario.id, idx)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Input
                                  value={newAssumption[scenario.id] || ""}
                                  onChange={(e) => setNewAssumption({ ...newAssumption, [scenario.id]: e.target.value })}
                                  placeholder="Add assumption..."
                                  data-testid={`input-new-assumption-${scenario.type}`}
                                />
                                <Button
                                  onClick={() => {
                                    addAssumption(scenario.id, newAssumption[scenario.id] || "");
                                    setNewAssumption({ ...newAssumption, [scenario.id]: "" });
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Revenue Outcome</Label>
                              <Input
                                value={scenario.outcomes.revenue}
                                onChange={(e) => updateScenarioOutcome(scenario.id, "revenue", e.target.value)}
                                data-testid={`input-revenue-${scenario.type}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Customers Outcome</Label>
                              <Input
                                value={scenario.outcomes.customers}
                                onChange={(e) => updateScenarioOutcome(scenario.id, "customers", e.target.value)}
                                data-testid={`input-customers-${scenario.type}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Team Outcome</Label>
                              <Input
                                value={scenario.outcomes.team}
                                onChange={(e) => updateScenarioOutcome(scenario.id, "team", e.target.value)}
                                data-testid={`input-team-${scenario.type}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Timeline Outcome</Label>
                              <Input
                                value={scenario.outcomes.timeline}
                                onChange={(e) => updateScenarioOutcome(scenario.id, "timeline", e.target.value)}
                                data-testid={`input-timeline-${scenario.type}`}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label className="mb-2 block">Risks</Label>
                              <div className="space-y-2">
                                {scenario.risks.map((risk, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Input value={risk} disabled className="flex-1" />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeRisk(scenario.id, idx)}
                                      className="text-red-500"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex gap-2">
                                  <Input
                                    value={newRisk[scenario.id] || ""}
                                    onChange={(e) => setNewRisk({ ...newRisk, [scenario.id]: e.target.value })}
                                    placeholder="Add risk..."
                                  />
                                  <Button
                                    onClick={() => {
                                      addRisk(scenario.id, newRisk[scenario.id] || "");
                                      setNewRisk({ ...newRisk, [scenario.id]: "" });
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="mb-2 block">Mitigations</Label>
                              <div className="space-y-2">
                                {scenario.mitigations.map((mitigation, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Input value={mitigation} disabled className="flex-1" />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeMitigation(scenario.id, idx)}
                                      className="text-red-500"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex gap-2">
                                  <Input
                                    value={newMitigation[scenario.id] || ""}
                                    onChange={(e) => setNewMitigation({ ...newMitigation, [scenario.id]: e.target.value })}
                                    placeholder="Add mitigation..."
                                  />
                                  <Button
                                    onClick={() => {
                                      addMitigation(scenario.id, newMitigation[scenario.id] || "");
                                      setNewMitigation({ ...newMitigation, [scenario.id]: "" });
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Scenario Comparison</CardTitle>
                    <CardDescription>Side-by-side comparison of all scenarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Metric</th>
                            {scenarios.map(s => (
                              <th key={s.id} className="text-left p-3">
                                <div className="flex items-center gap-2">
                                  {getScenarioIcon(s.type)}
                                  {s.title}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Probability</td>
                            {scenarios.map(s => (
                              <td key={s.id} className="p-3">{s.probability}%</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Revenue</td>
                            {scenarios.map(s => (
                              <td key={s.id} className="p-3">{s.outcomes.revenue}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Customers</td>
                            {scenarios.map(s => (
                              <td key={s.id} className="p-3">{s.outcomes.customers}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Team Size</td>
                            {scenarios.map(s => (
                              <td key={s.id} className="p-3">{s.outcomes.team}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Timeline</td>
                            {scenarios.map(s => (
                              <td key={s.id} className="p-3">{s.outcomes.timeline}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Key Risks</td>
                            {scenarios.map(s => (
                              <td key={s.id} className="p-3">{s.risks.length} identified</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          </>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
