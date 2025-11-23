import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, AlertCircle, TrendingUp, Award, ShieldAlert, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, Cell, FunnelChart, Funnel, LabelList, LineChart, Line } from "recharts";

interface SuccessionRole {
  id: string;
  criticalRole: string;
  currentHolder: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  successors: string[];
  readinessLevel: number; // 0-100
  urgency: number; // 0-100 (how urgent is succession)
  developmentPlan: string;
  developmentCost: number; // £ annual investment
  businessImpactScore: number; // 0-100
  timeToCompetence: number; // months
}

export default function SuccessionPlanning() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<SuccessionRole[]>([
    {
      id: "1",
      criticalRole: "CTO",
      currentHolder: "Jane Smith",
      riskLevel: "high",
      successors: ["Lead Engineer", "VP Engineering"],
      readinessLevel: 65,
      urgency: 80,
      developmentPlan: "Technical leadership training, strategic planning workshops",
      developmentCost: 15000,
      businessImpactScore: 90,
      timeToCompetence: 12
    }
  ]);

  const saveProgress = () => {
    localStorage.setItem('successionPlanningFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('successionPlanningData', JSON.stringify({ roles }));
    localStorage.setItem('successionPlanningDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      criticalRole: "New Role",
      currentHolder: "",
      riskLevel: "medium",
      successors: [""],
      readinessLevel: 50,
      urgency: 50,
      developmentPlan: "",
      developmentCost: 10000,
      businessImpactScore: 50,
      timeToCompetence: 6
    }]);
  };

  const removeRole = (id: string) => setRoles(roles.filter(r => r.id !== id));

  const updateRole = (id: string, field: string, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addSuccessor = (id: string) => {
    setRoles(roles.map(r => r.id === id ? { ...r, successors: [...r.successors, ""] } : r));
  };

  const updateSuccessor = (id: string, index: number, value: string) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        const newSuccessors = [...r.successors];
        newSuccessors[index] = value;
        return { ...r, successors: newSuccessors };
      }
      return r;
    }));
  };

  const removeSuccessor = (id: string, index: number) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        return { ...r, successors: r.successors.filter((_, i) => i !== index) };
      }
      return r;
    }));
  };

  // PhD-Level: Business Continuity Risk Score
  const getBusinessContinuityScore = (): number => {
    if (roles.length === 0) return 100;
    
    let totalRisk = 0;
    roles.forEach(r => {
      // Risk factors: readiness, urgency, business impact, succession coverage
      const riskFactors = {
        lowReadiness: r.readinessLevel < 60 ? 25 : 0,
        highUrgency: r.urgency > 70 ? 20 : 0,
        highImpact: r.businessImpactScore > 80 ? 15 : 0,
        noSuccessors: r.successors.filter(s => s).length === 0 ? 30 : 0,
        singleSuccessor: r.successors.filter(s => s).length === 1 ? 10 : 0
      };
      
      const roleRisk = Object.values(riskFactors).reduce((sum, val) => sum + val, 0);
      totalRisk += roleRisk;
    });
    
    const maxPossibleRisk = roles.length * 100; // Each role could have 100 risk points
    const riskPercentage = (totalRisk / maxPossibleRisk) * 100;
    return Math.max(0, 100 - riskPercentage);
  };

  // PhD-Level: Pipeline Health Metrics
  const getPipelineHealth = (): { readyNow: number; ready6Mo: number; ready12Mo: number; atRisk: number } => {
    const readyNow = roles.filter(r => r.readinessLevel >= 80).length;
    const ready6Mo = roles.filter(r => r.readinessLevel >= 60 && r.timeToCompetence <= 6).length;
    const ready12Mo = roles.filter(r => r.readinessLevel >= 40 && r.timeToCompetence <= 12).length;
    const atRisk = roles.filter(r => r.readinessLevel < 40 && r.urgency > 60).length;
    
    return { readyNow, ready6Mo, ready12Mo, atRisk };
  };

  // PhD-Level: Development ROI Calculator
  const getDevelopmentROI = (): { totalInvestment: number; avgCostPerRole: number; estimatedRetention: number } => {
    const totalInvestment = roles.reduce((sum, r) => sum + r.developmentCost, 0);
    const avgCostPerRole = roles.length > 0 ? totalInvestment / roles.length : 0;
    
    // Estimate: Strong succession planning reduces turnover by 25%, saving 1.5x avg salary
    const avgSalary = 75000; // UK median for leadership roles
    const replacementCost = avgSalary * 1.5;
    const estimatedRetention = roles.length * replacementCost * 0.25;
    
    return { totalInvestment, avgCostPerRole, estimatedRetention };
  };

  const exportPlan = () => {
    const continuityScore = getBusinessContinuityScore();
    const { readyNow, ready6Mo, ready12Mo, atRisk } = getPipelineHealth();
    const { totalInvestment, estimatedRetention } = getDevelopmentROI();
    const avgReadiness = (roles.reduce((sum, r) => sum + r.readinessLevel, 0) / roles.length).toFixed(0);
    
    const content = `UK INNOVATOR FOUNDER VISA - SUCCESSION PLANNING REPORT
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════
Total Critical Roles: ${roles.length}
Business Continuity Score: ${Math.round(continuityScore)}%
Average Readiness Level: ${avgReadiness}%
Total Development Investment: £${totalInvestment.toLocaleString()}
Estimated Retention Savings: £${Math.round(estimatedRetention).toLocaleString()}

PIPELINE HEALTH METRICS:
✓ Ready Now (80%+ readiness): ${readyNow} roles
✓ Ready in 6 Months: ${ready6Mo} roles
✓ Ready in 12 Months: ${ready12Mo} roles
🚨 At Risk (low readiness, high urgency): ${atRisk} roles

═══════════════════════════════════════════════════════════
BUSINESS CONTINUITY FRAMEWORK
═══════════════════════════════════════════════════════════
Score: ${Math.round(continuityScore)}% ${continuityScore >= 80 ? '✓ ROBUST' : continuityScore >= 60 ? '⚠ NEEDS IMPROVEMENT' : '✗ CRITICAL GAPS'}

Key Risk Factors:
• Succession coverage (multiple candidates per role)
• Readiness levels (skills, experience, competencies)
• Development timeline vs business urgency
• Business impact assessment
• Knowledge transfer planning

${roles.map(r => {
  const riskMatrix = `${r.urgency > 60 ? 'HIGH' : 'MEDIUM'} URGENCY x ${r.readinessLevel < 60 ? 'LOW' : 'HIGH'} READINESS`;
  const priorityLevel = r.urgency > 60 && r.readinessLevel < 60 ? 'CRITICAL PRIORITY' : 
                        r.urgency > 60 || r.readinessLevel < 60 ? 'HIGH PRIORITY' : 'MONITOR';
  
  return `
═══════════════════════════════════════════════════════════
ROLE: ${r.criticalRole}
═══════════════════════════════════════════════════════════
Current Holder: ${r.currentHolder}
Risk Level: ${r.riskLevel.toUpperCase()}
Priority: ${priorityLevel}
Risk Matrix: ${riskMatrix}

SUCCESSION READINESS:
Overall Readiness: ${r.readinessLevel}%
Urgency Score: ${r.urgency}%
Business Impact: ${r.businessImpactScore}%
Time to Competence: ${r.timeToCompetence} months
Annual Development Cost: £${r.developmentCost.toLocaleString()}

IDENTIFIED SUCCESSORS:
${r.successors.filter(s => s).length > 0 ? r.successors.filter(s => s).map((s, i) => `${i + 1}. ${s}`).join('\n') : 'NO SUCCESSORS IDENTIFIED - CRITICAL GAP'}

DEVELOPMENT PLAN:
${r.developmentPlan || 'NO DEVELOPMENT PLAN - IMMEDIATE ACTION REQUIRED'}

BUSINESS IMPACT ASSESSMENT:
${r.businessImpactScore >= 80 ? 'CRITICAL ROLE - Significant impact on business operations' : 
  r.businessImpactScore >= 60 ? 'HIGH IMPACT - Important for business continuity' : 
  'MODERATE IMPACT - Manageable succession risk'}
`}).join('\n')}

═══════════════════════════════════════════════════════════
BUSINESS CONTINUITY RECOMMENDATIONS
═══════════════════════════════════════════════════════════
${getBusinessRecommendations().join('\n')}

═══════════════════════════════════════════════════════════
DEVELOPMENT ROI ANALYSIS
═══════════════════════════════════════════════════════════
${getDevelopmentInsights().join('\n')}

Framework: UK Business Continuity Management (ISO 22301)
Relevance: Demonstrates organizational resilience for Innovator Founder Visa applications
Source: GOV.UK Business Continuity Guidance (2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uk-visa-succession-plan.txt';
    a.click();
  };

  // PhD-Level: Business Continuity Recommendations
  const getBusinessRecommendations = (): string[] => {
    const tips: string[] = [];
    const continuityScore = getBusinessContinuityScore();
    const { readyNow, atRisk } = getPipelineHealth();
    
    if (continuityScore < 60) {
      tips.push(`🚨 CRITICAL: Business continuity score (${Math.round(continuityScore)}%) below acceptable threshold`);
      tips.push(`   Risk: Significant disruption if key personnel depart unexpectedly`);
      tips.push(`   Action: Immediate succession planning required for UK visa business viability`);
    }
    
    if (atRisk > 0) {
      tips.push(`⚠️ WARNING: ${atRisk} critical role(s) at high risk (low readiness + high urgency)`);
      tips.push(`   Recommendation: Accelerate development programs with 3-6 month intensive training`);
    }
    
    const noSuccessors = roles.filter(r => r.successors.filter(s => s).length === 0);
    if (noSuccessors.length > 0) {
      tips.push(`📋 ${noSuccessors.length} role(s) lack identified successors - single point of failure risk`);
      tips.push(`   Affected: ${noSuccessors.map(r => r.criticalRole).join(', ')}`);
      tips.push(`   Impact: May affect UK visa application credibility for business sustainability`);
    }
    
    if (readyNow < roles.length * 0.3) {
      tips.push(`💡 Only ${readyNow} of ${roles.length} roles have ready-now successors (target: 30%+)`);
      tips.push(`   Recommendation: Fast-track high-potential candidates through leadership accelerators`);
    }
    
    const highImpactUnderprepared = roles.filter(r => r.businessImpactScore > 80 && r.readinessLevel < 60);
    if (highImpactUnderprepared.length > 0) {
      tips.push(`🎯 ${highImpactUnderprepared.length} high-impact role(s) with insufficient succession readiness`);
      tips.push(`   Priority: ${highImpactUnderprepared.map(r => r.criticalRole).join(', ')}`);
    }
    
    return tips.length > 0 ? tips : ['✅ Robust succession planning - strong business continuity posture'];
  };

  // PhD-Level: Development ROI Insights
  const getDevelopmentInsights = (): string[] => {
    const insights: string[] = [];
    const { totalInvestment, avgCostPerRole, estimatedRetention } = getDevelopmentROI();
    const netROI = estimatedRetention - totalInvestment;
    
    insights.push(`Total development investment: £${totalInvestment.toLocaleString()}`);
    insights.push(`Average cost per critical role: £${Math.round(avgCostPerRole).toLocaleString()}`);
    insights.push(`Estimated retention savings: £${Math.round(estimatedRetention).toLocaleString()}`);
    insights.push(`Net ROI: £${Math.round(netROI).toLocaleString()} (${Math.round((netROI / totalInvestment) * 100)}% return)`);
    
    if (netROI > 0) {
      insights.push(`\n✓ Positive ROI: Succession planning investment justified by retention savings`);
      insights.push(`  Leadership replacement costs average 1.5x salary (£75k-150k per role)`);
      insights.push(`  Strong succession reduces regrettable turnover by 25-40%`);
    }
    
    insights.push(`\nBusiness Continuity Benefits:`);
    insights.push(`• Reduced knowledge loss and operational disruption`);
    insights.push(`• Enhanced organizational resilience (critical for UK visa)`);
    insights.push(`• Improved investor confidence in management depth`);
    insights.push(`• Accelerated strategic execution through leadership bench strength`);
    
    return insights;
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate });

  // Chart Data: Pipeline Funnel
  const getPipelineFunnel = () => {
    const { readyNow, ready6Mo, ready12Mo } = getPipelineHealth();
    return [
      { name: 'Total Roles', value: roles.length, fill: '#ffa536' },
      { name: 'Ready in 12mo', value: ready12Mo, fill: '#11b6e9' },
      { name: 'Ready in 6mo', value: ready6Mo, fill: '#8b5cf6' },
      { name: 'Ready Now', value: readyNow, fill: '#10b981' }
    ];
  };

  // Chart Data: Readiness Heatmap (Urgency vs Readiness)
  const getReadinessMatrix = () => {
    return roles.map(r => ({
      x: r.urgency,
      y: r.readinessLevel,
      name: r.criticalRole.substring(0, 10),
      risk: r.riskLevel
    }));
  };

  // Chart Data: Risk Timeline
  const getRiskTimeline = () => {
    return roles.slice(0, 6).map(r => ({
      role: r.criticalRole.substring(0, 12),
      readiness: r.readinessLevel,
      urgency: r.urgency,
      target: 80
    }));
  };

  // Chart Data: Development Investment
  const getDevelopmentInvestment = () => {
    return roles.map(r => ({
      role: r.criticalRole.substring(0, 12),
      cost: r.developmentCost,
      impact: r.businessImpactScore
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('successionPlanningData');
    if (s) setRoles(JSON.parse(s).roles);
    const f = localStorage.getItem('successionPlanningFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('successionPlanningDate');
    if (d) setSavedDate(d);
  }, []);

  const continuityScore = getBusinessContinuityScore();
  const { readyNow, ready6Mo, atRisk } = getPipelineHealth();
  const { totalInvestment } = getDevelopmentROI();
  const criticalRoles = roles.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length;

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Succession Planning</h1>
          <p className="text-muted-foreground mb-6">Business continuity & leadership pipeline analytics</p>

          <ToolUtilityBar
            toolId="succession-planning"
            toolName="Succession Planning"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={getSerializedState}
          />

          {savedDate && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription>
            </Alert>
          )}

          {/* PhD-Level KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Continuity Score</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(continuityScore)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Business resilience</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Ready Now</span>
              </div>
              <p className="text-3xl font-bold">{readyNow}/{roles.length}</p>
              <p className="text-xs text-muted-foreground mt-1">80%+ readiness</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <p className="text-3xl font-bold">{atRisk}</p>
              <p className="text-xs text-muted-foreground mt-1">Critical gaps</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Investment</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(totalInvestment / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Annual development</p>
            </Card>
          </div>

          {/* PhD-Level: 4-Chart Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Leadership Pipeline Funnel</h3>
              <ResponsiveContainer width="100%" height={280}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={getPipelineFunnel()}>
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Readiness vs Urgency Matrix</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Urgency" unit="%" domain={[0, 100]} />
                  <YAxis dataKey="y" name="Readiness" unit="%" domain={[0, 100]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Roles" data={getReadinessMatrix()} fill="#ffa536">
                    {getReadinessMatrix().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Readiness vs Target (Top 6)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getRiskTimeline()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="readiness" fill="#11b6e9" name="Current Readiness" />
                  <Bar dataKey="target" fill="#10b981" name="Target (80%)" />
                  <Bar dataKey="urgency" fill="#ef4444" name="Urgency" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Development Cost vs Business Impact</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getDevelopmentInvestment()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" label={{ value: 'Cost £', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Impact %', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cost" fill="#ffa536" name="Dev Cost" />
                  <Bar yAxisId="right" dataKey="impact" fill="#8b5cf6" name="Business Impact" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Business Continuity Recommendations */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Business Continuity Recommendations</h3>
            <div className="space-y-3">
              {getBusinessRecommendations().map((tip, i) => {
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

          {/* Succession Roles Editor */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Critical Role Succession Plans</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {roles.map((role) => {
                const priority = role.urgency > 60 && role.readinessLevel < 60 ? 'critical' : 
                                role.urgency > 60 || role.readinessLevel < 60 ? 'high' : 'medium';
                
                return (
                  <Card key={role.id} className={`p-6 border-l-4 ${priority === 'critical' ? 'border-l-red-500' : priority === 'high' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <Input
                        value={role.criticalRole}
                        onChange={(e) => updateRole(role.id, 'criticalRole', e.target.value)}
                        className="font-semibold text-xl w-2/3"
                        placeholder="Critical Role"
                        data-testid={`input-role-${role.id}`}
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)} data-testid={`button-remove-${role.id}`}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Current Holder</label>
                        <Input value={role.currentHolder} onChange={(e) => updateRole(role.id, 'currentHolder', e.target.value)} placeholder="Name" data-testid={`input-holder-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Risk Level</label>
                        <Select value={role.riskLevel} onValueChange={(v) => updateRole(role.id, 'riskLevel', v)}>
                          <SelectTrigger data-testid={`select-risk-${role.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Time to Competence (mo)</label>
                        <Input type="number" value={role.timeToCompetence} onChange={(e) => updateRole(role.id, 'timeToCompetence', Number(e.target.value))} data-testid={`input-time-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Dev Cost (£/year)</label>
                        <Input type="number" value={role.developmentCost} onChange={(e) => updateRole(role.id, 'developmentCost', Number(e.target.value))} data-testid={`input-cost-${role.id}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Readiness Level (%)</label>
                        <Slider value={[role.readinessLevel]} onValueChange={([v]) => updateRole(role.id, 'readinessLevel', v)} max={100} step={5} className="mt-2" data-testid={`slider-readiness-${role.id}`} />
                        <span className="text-sm font-medium">{role.readinessLevel}%</span>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Urgency (%)</label>
                        <Slider value={[role.urgency]} onValueChange={([v]) => updateRole(role.id, 'urgency', v)} max={100} step={5} className="mt-2" data-testid={`slider-urgency-${role.id}`} />
                        <span className="text-sm font-medium">{role.urgency}%</span>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Business Impact (%)</label>
                        <Slider value={[role.businessImpactScore]} onValueChange={([v]) => updateRole(role.id, 'businessImpactScore', v)} max={100} step={5} className="mt-2" data-testid={`slider-impact-${role.id}`} />
                        <span className="text-sm font-medium">{role.businessImpactScore}%</span>
                      </div>
                    </div>

                    {/* Successors */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Identified Successors</label>
                        <Button variant="outline" size="sm" onClick={() => addSuccessor(role.id)} data-testid={`button-add-successor-${role.id}`}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {role.successors.map((succ, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={succ} onChange={(e) => updateSuccessor(role.id, idx, e.target.value)} placeholder="Successor name/role" data-testid={`input-successor-${role.id}-${idx}`} />
                          <Button variant="ghost" size="sm" onClick={() => removeSuccessor(role.id, idx)} data-testid={`button-remove-successor-${role.id}-${idx}`}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Development Plan */}
                    <div>
                      <label className="text-sm font-medium block mb-1">Development Plan</label>
                      <Textarea
                        value={role.developmentPlan}
                        onChange={(e) => updateRole(role.id, 'developmentPlan', e.target.value)}
                        placeholder="Describe training, mentoring, and development activities"
                        rows={3}
                        data-testid={`textarea-plan-${role.id}`}
                      />
                    </div>

                    {/* Live Priority Assessment */}
                    <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-md mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Priority Assessment</span>
                        <span className={`text-lg font-bold ${priority === 'critical' ? 'text-red-600' : priority === 'high' ? 'text-orange-600' : 'text-green-600'}`}>
                          {priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.urgency > 60 && role.readinessLevel < 60 ? 'Critical: High urgency with low readiness - immediate action required' :
                         role.urgency > 60 ? 'High: Urgent timeline - accelerate development' :
                         role.readinessLevel < 60 ? 'High: Low readiness - increase training investment' :
                         'Monitor: On track for succession readiness'}
                      </p>
                    </div>
                  </Card>
                );
              })}
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
