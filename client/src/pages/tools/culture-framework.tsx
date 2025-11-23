import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
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

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Strong culture enables team execution and retention
// Scalability Criterion: Shared values support rapid team growth without losing cohesion

interface CultureValue {
  id: string;
  name: string;
  description: string;
  alignmentScore: number; // 0-100
  behaviors: string[];
  impactOnRetention: number; // 0-100
}

export default function CultureFramework() {
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

  // PhD-Level: Culture Strength Score
  // Formula: (Avg Alignment × 0.7) + (Behavior Specificity × 0.3)
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

  // PhD-Level: Retention Impact Analysis
  // Formula: Culture impact × 35% baseline improvement (industry research)
  const getRetentionImpact = (): { avgImpact: number; estimatedRetentionBoost: number; costSavings: number } => {
    const avgImpact = values.length > 0 ? values.reduce((sum, v) => sum + v.impactOnRetention, 0) / values.length : 0;
    const estimatedRetentionBoost = Math.round((avgImpact / 100) * 35);
    
    // Cost savings: UK avg replacement = 1.5x salary
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

Source: GOV.UK Innovator Founder Visa Guidance (November 2025)
Research: Culture-retention correlation from Deloitte, Glassdoor, SHRM
Formula: Retention boost = (Avg Impact / 100) × 35%
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
      tips.push(`🚨 CRITICAL: Mission statement missing - clear mission attracts aligned talent`);
    }
    
    if (values.length < 3) {
      tips.push(`📋 Recommend defining 3-5 core values for organizational clarity`);
    }
    
    const weakValues = values.filter(v => v.alignmentScore < 60);
    if (weakValues.length > 0) {
      tips.push(`⚠️ ${weakValues.length} value(s) with weak alignment - reinforce through practices`);
    }
    
    if (score >= 75) {
      tips.push(`✅ EXCELLENT: Strong culture drives retention and organizational viability`);
    }
    
    return tips.length > 0 ? tips : ['✅ Culture framework supports team scalability'];
  };

  const getSerializedState = () => ({ uploadedFiles, mission, vision, values, savedDate });

  // Chart 1: Alignment Scores
  const getAlignmentData = () => values.map(v => ({
    value: v.name.substring(0, 12),
    alignment: v.alignmentScore,
    target: 80
  }));

  // Chart 2: Retention Impact
  const getRetentionData = () => values.map(v => ({
    value: v.name.substring(0, 12),
    impact: v.impactOnRetention
  })).sort((a, b) => b.impact - a.impact);

  // Chart 3: Culture Radar
  const getCultureRadar = () => values.map(v => ({
    value: v.name.substring(0, 10),
    alignment: v.alignmentScore,
    behaviors: Math.min(100, v.behaviors.filter(b => b).length * 25),
    retention: v.impactOnRetention
  }));

  // Chart 4: Implementation Maturity
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
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Culture Framework</h1>
          <p className="text-muted-foreground mb-6">Build strong culture for scaling and retention (Innovator Founder Visa)</p>

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

          {/* KPIs */}
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

          {/* 4 Charts */}
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

          {/* Recommendations */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Culture Recommendations</h3>
            <div className="space-y-3">
              {getCultureRecommendations().map((tip, i) => {
                const isCritical = tip.includes('CRITICAL');
                const isWarning = tip.includes('WARNING');
                return (
                  <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          {/* Mission & Vision */}
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

          {/* Values */}
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

          {/* File Upload */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
