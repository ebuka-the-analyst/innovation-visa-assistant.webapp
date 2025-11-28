import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Heart, Users, TrendingUp, AlertCircle, Target, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'culture-framework',
  toolName: 'Culture Framework',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Catalyst. I'll help you build a strong culture framework - essential for team retention and scaling. Endorsing bodies want to see you can build and maintain a cohesive team as you grow. Let's define your organizational DNA!",
  questions: [
    {
      id: 'mission',
      question: "What is your company's mission? Why does your organization exist beyond making money?",
      hint: "A clear mission attracts aligned talent and guides decision-making",
      fieldKey: 'mission',
      minLength: 30
    },
    {
      id: 'vision',
      question: "What is your vision? Where do you see the company in 5-10 years?",
      hint: "Be ambitious but realistic - this should inspire your team",
      fieldKey: 'vision',
      minLength: 30
    },
    {
      id: 'core-value-1',
      question: "What is your first core value? Describe it and explain what behaviors demonstrate this value.",
      hint: "Great values are actionable - they guide daily decisions",
      fieldKey: 'value1',
      minLength: 40
    },
    {
      id: 'core-value-2',
      question: "What is your second core value? How does the team live this value?",
      hint: "Think about what makes your team unique",
      fieldKey: 'value2',
      minLength: 40
    },
    {
      id: 'core-value-3',
      question: "What is your third core value? What specific behaviors reinforce it?",
      hint: "Values should be memorable and guide hiring decisions",
      fieldKey: 'value3',
      minLength: 40
    },
    {
      id: 'retention-strategy',
      question: "How will you retain top talent? What makes people want to stay at your company?",
      hint: "Consider: growth opportunities, culture, compensation, flexibility, impact",
      fieldKey: 'retentionStrategy',
      minLength: 50
    }
  ],
  completionMessage: "Excellent work! You've defined a strong culture framework that will help you attract and retain talent as you scale. Strong culture is a key viability indicator for endorsing bodies. I'm now populating your framework with these values."
};

interface CultureValue {
  id: string;
  name: string;
  description: string;
  alignmentScore: number;
  behaviors: string[];
  impactOnRetention: number;
}

export default function CultureFramework() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('culture-framework-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [mission, setMission] = useState("Build technology that empowers entrepreneurs");
  const [vision, setVision] = useState("Become the leading platform for startup success by 2030");
  const [values, setValues] = useState<CultureValue[]>([
    {
      id: "1",
      name: "Innovation First",
      description: "Continuously experiment and learn from failure",
      alignmentScore: 75,
      behaviors: ["Weekly innovation sprints", "Failure retrospectives", "20% time for exploration"],
      impactOnRetention: 80
    }
  ]);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('culture-framework-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('culture-framework-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.mission) setMission(answers.mission);
    if (answers.vision) setVision(answers.vision);
    
    const newValues: CultureValue[] = [];
    
    if (answers.value1) {
      const parts = answers.value1.split(/[:.]/);
      newValues.push({
        id: 'ai-1-' + Date.now(),
        name: parts[0]?.substring(0, 30) || 'Core Value 1',
        description: answers.value1.substring(0, 150),
        alignmentScore: 75,
        behaviors: ['Define specific behaviors'],
        impactOnRetention: 70
      });
    }
    
    if (answers.value2) {
      const parts = answers.value2.split(/[:.]/);
      newValues.push({
        id: 'ai-2-' + Date.now(),
        name: parts[0]?.substring(0, 30) || 'Core Value 2',
        description: answers.value2.substring(0, 150),
        alignmentScore: 70,
        behaviors: ['Define specific behaviors'],
        impactOnRetention: 70
      });
    }
    
    if (answers.value3) {
      const parts = answers.value3.split(/[:.]/);
      newValues.push({
        id: 'ai-3-' + Date.now(),
        name: parts[0]?.substring(0, 30) || 'Core Value 3',
        description: answers.value3.substring(0, 150),
        alignmentScore: 70,
        behaviors: ['Define specific behaviors'],
        impactOnRetention: 70
      });
    }
    
    if (newValues.length > 0) {
      setValues(newValues);
    }
    
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('cultureFrameworkFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('cultureFrameworkData', JSON.stringify({ mission, vision, values }));
    localStorage.setItem('cultureFrameworkDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addValue = () => {
    setValues([...values, {
      id: Date.now().toString(),
      name: "New Value",
      description: "",
      alignmentScore: 50,
      behaviors: [""],
      impactOnRetention: 50
    }]);
  };

  const removeValue = (id: string) => setValues(values.filter(v => v.id !== id));

  const updateValue = (id: string, field: string, value: any) => {
    setValues(values.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addBehavior = (id: string) => {
    setValues(values.map(v => v.id === id ? { ...v, behaviors: [...v.behaviors, ""] } : v));
  };

  const updateBehavior = (id: string, index: number, value: string) => {
    setValues(values.map(v => {
      if (v.id === id) {
        const newBehaviors = [...v.behaviors];
        newBehaviors[index] = value;
        return { ...v, behaviors: newBehaviors };
      }
      return v;
    }));
  };

  const removeBehavior = (id: string, index: number) => {
    setValues(values.map(v => {
      if (v.id === id) {
        return { ...v, behaviors: v.behaviors.filter((_, i) => i !== index) };
      }
      return v;
    }));
  };

  const getCultureStrength = (): { score: number; grade: string } => {
    if (values.length === 0) return { score: 0, grade: 'F' };
    
    const avgAlignment = values.reduce((sum, v) => sum + v.alignmentScore, 0) / values.length;
    const avgBehaviors = values.reduce((sum, v) => sum + v.behaviors.filter(b => b.trim().length > 0).length, 0) / values.length;
    
    const score = Math.round((avgAlignment * 0.7) + (Math.min(100, avgBehaviors * 10) * 0.3));
    
    let grade = 'F - Weak';
    if (score >= 90) grade = 'A - Excellent';
    else if (score >= 80) grade = 'B - Strong';
    else if (score >= 70) grade = 'C - Developing';
    else if (score >= 60) grade = 'D - Needs Work';
    
    return { score, grade };
  };

  const getRetentionImpact = (): { avgImpact: number; estimatedRetentionBoost: number; costSavings: number } => {
    const avgImpact = values.length > 0 ? values.reduce((sum, v) => sum + v.impactOnRetention, 0) / values.length : 0;
    const estimatedRetentionBoost = Math.round((avgImpact / 100) * 35);
    
    const avgTeamSize = 10;
    const avgSalary = 60000;
    const replacementCost = avgSalary * 1.5;
    const avgTurnover = 0.15;
    const reducedTurnover = avgTurnover * (1 - (estimatedRetentionBoost / 100));
    const costSavings = Math.round((avgTurnover - reducedTurnover) * avgTeamSize * replacementCost);
    
    return { avgImpact: Math.round(avgImpact), estimatedRetentionBoost, costSavings };
  };

  const exportFramework = () => {
    const { score, grade } = getCultureStrength();
    const { avgImpact, estimatedRetentionBoost, costSavings } = getRetentionImpact();
    
    const content = `UK INNOVATOR FOUNDER VISA - CULTURE FRAMEWORK
Generated: ${new Date().toLocaleDateString()}

Culture Strength: ${score}% (${grade})
Values Defined: ${values.length}
Retention Impact: ${avgImpact}% (${estimatedRetentionBoost}% boost)
Cost Savings: £${costSavings.toLocaleString()}/year

MISSION:
${mission || 'Not defined'}

VISION:
${vision || 'Not defined'}

CORE VALUES:
${values.map(v => `
${v.name}: ${v.description}
Alignment: ${v.alignmentScore}%
Behaviors: ${v.behaviors.filter(b => b).join(', ')}
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-culture-framework.txt';
    a.click();
  };

  const getCultureRecommendations = (): string[] => {
    const tips: string[] = [];
    const { score } = getCultureStrength();
    
    if (!mission || mission.length < 20) {
      tips.push("CRITICAL: Mission statement missing - clear mission attracts aligned talent");
    }
    
    if (values.length < 3) {
      tips.push("Recommend defining 3-5 core values for organizational clarity");
    }
    
    const weakValues = values.filter(v => v.alignmentScore < 60);
    if (weakValues.length > 0) {
      tips.push(`${weakValues.length} value(s) with weak alignment - reinforce through practices`);
    }
    
    if (score >= 75) {
      tips.push("EXCELLENT: Strong culture drives retention and organizational viability");
    }
    
    return tips.length > 0 ? tips : ['Culture framework supports team scalability'];
  };

  const getSerializedState = () => ({ uploadedFiles, mission, vision, values, savedDate });

  const getAlignmentData = () => values.map(v => ({
    value: v.name.substring(0, 12),
    alignment: v.alignmentScore,
    target: 80
  }));

  const getRetentionData = () => values.map(v => ({
    value: v.name.substring(0, 12),
    impact: v.impactOnRetention
  })).sort((a, b) => b.impact - a.impact);

  const getCultureRadar = () => values.map(v => ({
    value: v.name.substring(0, 10),
    alignment: v.alignmentScore,
    behaviors: Math.min(100, v.behaviors.filter(b => b).length * 25),
    retention: v.impactOnRetention
  }));

  const getImplementationMaturity = () => [
    { category: 'Mission', score: mission && mission.length > 20 ? 100 : mission.length > 0 ? 50 : 0 },
    { category: 'Vision', score: vision && vision.length > 20 ? 100 : vision.length > 0 ? 50 : 0 },
    { category: 'Values', score: Math.min(100, (values.length / 5) * 100) },
    { category: 'Behaviors', score: Math.min(100, (values.reduce((s, v) => s + v.behaviors.filter(b => b).length, 0) / (values.length * 3)) * 100) },
    { category: 'Alignment', score: values.reduce((s, v) => s + v.alignmentScore, 0) / (values.length || 1) }
  ];

  useEffect(() => {
    const s = localStorage.getItem('cultureFrameworkData');
    if (s) {
      const data = JSON.parse(s);
      setMission(data.mission || "");
      setVision(data.vision || "");
      setValues(data.values || []);
    }
    const f = localStorage.getItem('cultureFrameworkFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('cultureFrameworkDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: cultureScore, grade } = getCultureStrength();
  const { avgImpact, estimatedRetentionBoost, costSavings } = getRetentionImpact();

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Culture Framework</h1>
              <p className="text-muted-foreground">Build strong culture for scaling and retention (Innovator Founder Visa)</p>
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
              userTier={userTier}
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Why Culture Matters for Visa Success</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Endorsing bodies assess your ability to build and scale a team. Strong culture demonstrates:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Viability:</strong> Ability to attract and retain talent</li>
                      <li><strong>Scalability:</strong> Foundation for rapid team growth</li>
                      <li><strong>Leadership:</strong> Clear vision and values</li>
                      <li><strong>Execution:</strong> Aligned team moving in same direction</li>
                    </ul>
                  </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Culture Strength</span>
                    </div>
                    <p className="text-2xl font-bold">{cultureScore}%</p>
                    <p className="text-xs text-muted-foreground">{grade}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Retention Boost</span>
                    </div>
                    <p className="text-2xl font-bold">+{estimatedRetentionBoost}%</p>
                    <p className="text-xs text-muted-foreground">{values.length} values</p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ToolUtilityBar
                toolId="culture-framework"
                toolName="Culture Framework"
                onSave={saveProgress}
                onExport={exportFramework}
                getSerializedState={getSerializedState}
              />

              {savedDate && (
                <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Culture Strength</span>
                  </div>
                  <p className="text-3xl font-bold">{cultureScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{grade}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Core Values</span>
                  </div>
                  <p className="text-3xl font-bold">{values.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Defined</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Retention Boost</span>
                  </div>
                  <p className="text-3xl font-bold">+{estimatedRetentionBoost}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{avgImpact}% avg impact</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Cost Savings</span>
                  </div>
                  <p className="text-3xl font-bold">£{Math.round(costSavings / 1000)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual savings</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Value Alignment Scores</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={getAlignmentData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="value" angle={-15} textAnchor="end" height={60} />
                      <YAxis label={{ value: 'Alignment %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="alignment" fill="#ffa536" name="Current" />
                      <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} name="Target (80%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Retention Impact by Value</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={getRetentionData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" label={{ value: 'Impact %', position: 'insideBottom', offset: -5 }} />
                      <YAxis dataKey="value" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="impact" fill="#11b6e9" name="Retention Impact" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Culture Strength Radar</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={getCultureRadar()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="value" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Alignment" dataKey="alignment" stroke="#ffa536" fill="#ffa536" fillOpacity={0.5} />
                      <Radar name="Behaviors" dataKey="behaviors" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.5} />
                      <Radar name="Retention" dataKey="retention" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Implementation Maturity</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={getImplementationMaturity()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                      <YAxis label={{ value: 'Maturity %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8b5cf6" name="Maturity">
                        {getImplementationMaturity().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 60 ? '#ffa536' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4">Culture Recommendations</h3>
                <div className="space-y-3">
                  {getCultureRecommendations().map((tip, i) => {
                    const isCritical = tip.includes('CRITICAL');
                    const isExcellent = tip.includes('EXCELLENT');
                    return (
                      <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isExcellent ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                        <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isExcellent ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4">Mission & Vision</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Mission (Your purpose)</label>
                    <Textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Build technology that..." rows={2} data-testid="textarea-mission" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Vision (Your future)</label>
                    <Textarea value={vision} onChange={(e) => setVision(e.target.value)} placeholder="Become the leading..." rows={2} data-testid="textarea-vision" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Core Values</h3>
                  <Button onClick={addValue} size="sm" data-testid="button-add-value">
                    <Plus className="w-4 h-4 mr-1" /> Add Value
                  </Button>
                </div>

                <div className="space-y-6">
                  {values.map((val) => (
                    <Card key={val.id} className="p-6 border-l-4 border-l-primary">
                      <div className="flex justify-between items-start mb-4">
                        <Input value={val.name} onChange={(e) => updateValue(val.id, 'name', e.target.value)} className="font-semibold text-xl w-2/3" placeholder="Value Name" data-testid={`input-name-${val.id}`} />
                        <Button variant="ghost" size="sm" onClick={() => removeValue(val.id)} data-testid={`button-remove-${val.id}`}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <Textarea value={val.description} onChange={(e) => updateValue(val.id, 'description', e.target.value)} placeholder="What does this value mean?" rows={2} data-testid={`textarea-desc-${val.id}`} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium block mb-2">Alignment: {val.alignmentScore}%</label>
                          <Slider value={[val.alignmentScore]} onValueChange={(v) => updateValue(val.id, 'alignmentScore', v[0])} max={100} step={5} data-testid={`slider-alignment-${val.id}`} />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Retention Impact: {val.impactOnRetention}%</label>
                          <Slider value={[val.impactOnRetention]} onValueChange={(v) => updateValue(val.id, 'impactOnRetention', v[0])} max={100} step={5} data-testid={`slider-retention-${val.id}`} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Behaviors</label>
                          <Button size="sm" variant="ghost" onClick={() => addBehavior(val.id)} data-testid={`button-add-behavior-${val.id}`}>
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                        {val.behaviors.map((behavior, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input value={behavior} onChange={(e) => updateBehavior(val.id, idx, e.target.value)} placeholder="Behavior..." data-testid={`input-behavior-${val.id}-${idx}`} />
                            <Button size="sm" variant="ghost" onClick={() => removeBehavior(val.id, idx)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
                <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
