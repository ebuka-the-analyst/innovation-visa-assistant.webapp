import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, AlertCircle, TrendingUp, Award, ShieldCheck, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, Cell, LineChart, Line } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Business continuity planning demonstrates resilience and sound management
// Scalability Criterion: Leadership pipeline shows capacity to grow organization
// Endorsement Review: Succession planning evidences organizational maturity and risk management

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
  businessImpactScore: number; // 0-100 impact on business viability
  timeToCompetence: number; // months
}

export default function SuccessionPlanning() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<SuccessionRole[]>([
    {
      id: "1",
      criticalRole: "Technical Lead",
      currentHolder: "Founder",
      riskLevel: "critical",
      successors: ["Senior Engineer"],
      readinessLevel: 50,
      urgency: 85,
      developmentPlan: "6-month mentorship, architecture ownership, technical decision-making",
      developmentCost: 12000,
      businessImpactScore: 95,
      timeToCompetence: 8
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
      readinessLevel: 40,
      urgency: 50,
      developmentPlan: "",
      developmentCost: 8000,
      businessImpactScore: 60,
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

  // PhD-Level: Business Continuity Risk Score (aligned with ISO 22301 Business Continuity Management)
  // Formula: Weighted risk assessment based on role criticality, successor readiness, urgency
  // Scoring: 0-100 where 100 = excellent continuity, 0 = critical risk
  const getBusinessContinuityScore = (): { score: number; grade: string; criticalRisks: number } => {
    if (roles.length === 0) return { score: 100, grade: 'A', criticalRisks: 0 };
    
    let totalRiskPoints = 0;
    let criticalRisks = 0;
    
    roles.forEach(role => {
      let roleRisk = 0;
      
      // Factor 1: Successor coverage (30 points max risk)
      const validSuccessors = role.successors.filter(s => s.trim().length > 0);
      if (validSuccessors.length === 0) {
        roleRisk += 30;
      } else if (validSuccessors.length === 1) {
        roleRisk += 15; // Single point of failure
      }
      
      // Factor 2: Readiness gap (25 points max risk)
      const readinessGap = 100 - role.readinessLevel;
      roleRisk += (readinessGap / 100) * 25;
      
      // Factor 3: Urgency-readiness mismatch (25 points max risk)
      if (role.urgency > 70 && role.readinessLevel < 50) {
        roleRisk += 25; // High urgency, low readiness = critical risk
      } else if (role.urgency > 50 && role.readinessLevel < 60) {
        roleRisk += 15;
      }
      
      // Factor 4: Business impact amplifier (20 points max risk)
      if (role.businessImpactScore > 80 && role.readinessLevel < 60) {
        roleRisk += 20; // High-impact role with weak succession = critical
      } else if (role.businessImpactScore > 60 && role.readinessLevel < 50) {
        roleRisk += 10;
      }
      
      // Identify critical risks
      if (roleRisk >= 60) criticalRisks++;
      
      totalRiskPoints += roleRisk;
    });
    
    const maxPossibleRisk = roles.length * 100;
    const riskPercentage = (totalRiskPoints / maxPossibleRisk) * 100;
    const score = Math.max(0, Math.round(100 - riskPercentage));
    
    let grade = 'F - Critical';
    if (score >= 90) grade = 'A - Excellent';
    else if (score >= 80) grade = 'B - Good';
    else if (score >= 70) grade = 'C - Acceptable';
    else if (score >= 60) grade = 'D - Needs Improvement';
    else if (score >= 50) grade = 'E - Poor';
    
    return { score, grade, criticalRisks };
  };

  // PhD-Level: Pipeline Health Metrics
  // Formula: Categorizes successor readiness by timeline (now, 6mo, 12mo+)
  const getPipelineHealth = (): { readyNow: number; ready6Mo: number; ready12Mo: number; atRisk: number } => {
    const readyNow = roles.filter(r => r.readinessLevel >= 80).length;
    const ready6Mo = roles.filter(r => r.readinessLevel >= 60 && r.timeToCompetence <= 6).length;
    const ready12Mo = roles.filter(r => r.readinessLevel >= 40 && r.timeToCompetence <= 12).length;
    const atRisk = roles.filter(r => r.readinessLevel < 40 && r.urgency > 60).length;
    
    return { readyNow, ready6Mo, ready12Mo, atRisk };
  };

  // PhD-Level: Development ROI Calculator
  // Formula: Investment in succession development vs cost of unplanned departures
  // Industry standard: Replacing executive = 2x annual salary, mid-level = 1.5x
  const getDevelopmentROI = (): { totalInvestment: number; avgCostPerRole: number; replacementCostSaved: number; roi: number } => {
    const totalInvestment = roles.reduce((sum, r) => sum + r.developmentCost, 0);
    const avgCostPerRole = roles.length > 0 ? totalInvestment / roles.length : 0;
    
    // Calculate potential replacement costs based on business impact
    let replacementCostSaved = 0;
    roles.forEach(role => {
      // Higher impact roles = higher replacement cost
      const estimatedSalary = role.businessImpactScore >= 80 ? 80000 : 
                              role.businessImpactScore >= 60 ? 60000 : 40000;
      const replacementMultiplier = role.businessImpactScore >= 80 ? 2.0 : 1.5;
      const replacementCost = estimatedSalary * replacementMultiplier;
      
      // Succession planning reduces unplanned departure risk by ~30%
      replacementCostSaved += replacementCost * 0.3;
    });
    
    const roi = totalInvestment > 0 ? ((replacementCostSaved - totalInvestment) / totalInvestment) * 100 : 0;
    
    return { totalInvestment, avgCostPerRole, replacementCostSaved: Math.round(replacementCostSaved), roi: Math.round(roi) };
  };

  // PhD-Level: Readiness-Urgency Matrix (McKinsey 9-Box style analysis)
  // Maps successor readiness against succession urgency to prioritize development
  const getReadinessUrgencyMatrix = (): { critical: number; develop: number; monitor: number; stable: number } => {
    let critical = 0; // High urgency, low readiness (immediate action)
    let develop = 0;  // Medium urgency, medium readiness (development focus)
    let monitor = 0;  // Low urgency, low readiness (monitor)
    let stable = 0;   // High readiness OR low urgency (stable)
    
    roles.forEach(role => {
      if (role.urgency > 70 && role.readinessLevel < 50) critical++;
      else if (role.urgency > 40 && role.readinessLevel >= 40 && role.readinessLevel < 80) develop++;
      else if (role.urgency <= 40 && role.readinessLevel < 60) monitor++;
      else stable++;
    });
    
    return { critical, develop, monitor, stable };
  };

  const exportPlan = () => {
    const { score: continuityScore, grade, criticalRisks } = getBusinessContinuityScore();
    const { readyNow, ready6Mo, ready12Mo, atRisk } = getPipelineHealth();
    const { totalInvestment, replacementCostSaved, roi } = getDevelopmentROI();
    const { critical, develop, monitor, stable } = getReadinessUrgencyMatrix();
    const avgReadiness = roles.length > 0 ? Math.round(roles.reduce((sum, r) => sum + r.readinessLevel, 0) / roles.length) : 0;
    
    const content = `UK INNOVATOR FOUNDER VISA - LEADERSHIP SUCCESSION & BUSINESS CONTINUITY
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Total Critical Roles: ${roles.length}
Business Continuity Score: ${continuityScore}% (Grade: ${grade})
Critical Risks Identified: ${criticalRisks}
Average Successor Readiness: ${avgReadiness}%

PIPELINE HEALTH:
✓ Ready Now (80%+ readiness): ${readyNow} roles
✓ Ready in 6 Months: ${ready6Mo} roles  
✓ Ready in 12 Months: ${ready12Mo} roles
⚠ At Risk (high urgency, low readiness): ${atRisk} roles

DEVELOPMENT ROI:
Annual Investment: £${totalInvestment.toLocaleString()}
Replacement Cost Saved: £${replacementCostSaved.toLocaleString()}
ROI: ${roi > 0 ? '+' : ''}${roi}%

SUCCESSION PRIORITY MATRIX:
🚨 Critical (immediate action): ${critical} roles
🎯 Develop (active development): ${develop} roles
👀 Monitor (watch closely): ${monitor} roles
✅ Stable (on track): ${stable} roles

═══════════════════════════════════════════════════════════
INNOVATOR FOUNDER VISA: BUSINESS VIABILITY EVIDENCE
═══════════════════════════════════════════════════════════
GOV.UK Viability Criterion Assessment:
• Business continuity planning demonstrates risk management capability
• Leadership succession shows organizational resilience
• Development investments evidence commitment to long-term growth
• Structured approach demonstrates professional management

VIABILITY INDICATORS:
✓ Formal succession planning for ${roles.length} critical roles
✓ £${totalInvestment.toLocaleString()} invested in leadership development
✓ ${continuityScore}% business continuity score (${grade})
✓ ${roles.filter(r => r.successors.filter(s => s).length >= 2).length} roles with multiple successors (redundancy)

ENDORSEMENT CREDIBILITY:
${continuityScore >= 70 ? '✅ STRONG: Succession planning evidences organizational maturity and viability' :
  continuityScore >= 50 ? '⚠️ MODERATE: Some succession gaps - may face endorsing body questions' :
  '🚨 WEAK: Significant succession gaps undermine viability assessment'}

${roles.map((role, idx) => {
  const validSuccessors = role.successors.filter(s => s.trim().length > 0);
  const riskLabel = role.riskLevel === 'critical' ? '🚨 CRITICAL' : 
                    role.riskLevel === 'high' ? '⚠️ HIGH' :
                    role.riskLevel === 'medium' ? '📋 MEDIUM' : '✅ LOW';
  
  return `
═══════════════════════════════════════════════════════════
ROLE ${idx + 1}: ${role.criticalRole} (${riskLabel} RISK)
═══════════════════════════════════════════════════════════
Current Holder: ${role.currentHolder || 'Vacant'}
Business Impact: ${role.businessImpactScore}% (${role.businessImpactScore >= 80 ? 'Critical to operations' : role.businessImpactScore >= 60 ? 'High impact' : 'Moderate impact'})

SUCCESSION STATUS:
Identified Successors: ${validSuccessors.length > 0 ? validSuccessors.join(', ') : 'NONE - CRITICAL GAP'}
Readiness Level: ${role.readinessLevel}%
${role.readinessLevel >= 80 ? '✅ Ready for immediate transition' :
  role.readinessLevel >= 60 ? '🎯 Ready within 6 months with support' :
  role.readinessLevel >= 40 ? '📋 Requires 6-12 months development' :
  '🚨 Significant development needed (12+ months)'}

URGENCY ASSESSMENT:
Succession Urgency: ${role.urgency}%
Time to Competence: ${role.timeToCompetence} months
${role.urgency > 70 && role.readinessLevel < 50 ? '🚨 CRITICAL MISMATCH: High urgency with low readiness' : ''}

DEVELOPMENT PLAN:
Strategy: ${role.developmentPlan || 'Not defined'}
Annual Investment: £${role.developmentCost.toLocaleString()}

VIABILITY IMPACT:
${validSuccessors.length === 0 ? '🚨 No succession plan - poses continuity risk to business viability' :
  validSuccessors.length === 1 && role.businessImpactScore > 70 ? '⚠️ Single successor for high-impact role - consider backup' :
  role.readinessLevel >= 60 ? '✅ Succession coverage demonstrates business resilience' :
  '📋 Development in progress - shows planning capability'}
`}).join('\n')}

═══════════════════════════════════════════════════════════
BUSINESS CONTINUITY RECOMMENDATIONS (ISO 22301 Aligned)
═══════════════════════════════════════════════════════════
${getBusinessContinuityRecommendations().join('\n')}

═══════════════════════════════════════════════════════════
SCALABILITY EVIDENCE FOR ENDORSING BODY
═══════════════════════════════════════════════════════════
${getScalabilityEvidence().join('\n')}

Methodology: Risk scoring based on ISO 22301 Business Continuity Management
ROI Calculation: Replacement cost (1.5-2x salary) × 30% retention improvement
Source: GOV.UK Innovator Founder Visa Guidance (November 2025)
Assessment: Innovation, Viability, Scalability criteria
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-succession-planning.txt';
    a.click();
  };

  // Business Continuity Recommendations (GOV.UK Viability Focus)
  const getBusinessContinuityRecommendations = (): string[] => {
    const tips: string[] = [];
    const { score, criticalRisks } = getBusinessContinuityScore();
    const { atRisk } = getPipelineHealth();
    const { critical } = getReadinessUrgencyMatrix();
    
    if (score < 60) {
      tips.push(`🚨 CRITICAL: Business continuity score ${score}% below recommended 60% threshold`);
      tips.push(`   Endorsing bodies assess business resilience during viability review`);
      tips.push(`   Action: Address ${criticalRisks} critical succession gaps immediately`);
    }
    
    if (critical > 0) {
      tips.push(`⚠️ WARNING: ${critical} role(s) in critical zone (high urgency, low readiness)`);
      tips.push(`   These roles pose immediate risk to business operations if current holder departs`);
      tips.push(`   Recommendation: Accelerate development plans or identify interim coverage`);
    }
    
    const rolesWithoutSuccessors = roles.filter(r => r.successors.filter(s => s.trim().length > 0).length === 0);
    if (rolesWithoutSuccessors.length > 0) {
      tips.push(`🚨 ${rolesWithoutSuccessors.length} critical role(s) with NO identified successors`);
      tips.push(`   Affected roles: ${rolesWithoutSuccessors.map(r => r.criticalRole).join(', ')}`);
      tips.push(`   Impact: Demonstrates lack of contingency planning (viability concern)`);
    }
    
    const singleSuccessorHighImpact = roles.filter(r => 
      r.successors.filter(s => s.trim().length > 0).length === 1 && r.businessImpactScore > 75
    );
    if (singleSuccessorHighImpact.length > 0) {
      tips.push(`⚠️ ${singleSuccessorHighImpact.length} high-impact role(s) with only one successor (single point of failure)`);
      tips.push(`   Best practice: 2+ successors for roles with 75%+ business impact`);
    }
    
    if (atRisk > 0) {
      tips.push(`📋 ${atRisk} role(s) at risk due to urgency-readiness mismatch`);
      tips.push(`   Consider interim solutions while developing long-term successors`);
    }
    
    const { roi } = getDevelopmentROI();
    if (roi > 100) {
      tips.push(`✅ EXCELLENT: ${roi}% ROI on succession investment demonstrates cost-effective risk management`);
    }
    
    if (score >= 70 && criticalRisks === 0) {
      tips.push(`✅ Strong business continuity planning evidences organizational maturity`);
      tips.push(`   Endorsing bodies view structured succession planning as viability indicator`);
    }
    
    return tips.length > 0 ? tips : ['✅ Succession planning demonstrates business viability and resilience'];
  };

  // Scalability Evidence
  const getScalabilityEvidence = (): string[] => {
    const evidence: string[] = [];
    const rolesWithMultipleSuccessors = roles.filter(r => r.successors.filter(s => s).length >= 2).length;
    const { totalInvestment } = getDevelopmentROI();
    
    evidence.push(`1. LEADERSHIP PIPELINE (Scalability Indicator):`);
    evidence.push(`   • ${roles.length} critical roles identified for succession planning`);
    evidence.push(`   • ${rolesWithMultipleSuccessors} roles with multiple successor candidates (redundancy)`);
    evidence.push(`   • Average readiness: ${Math.round(roles.reduce((s, r) => s + r.readinessLevel, 0) / (roles.length || 1))}%`);
    evidence.push(`   • Evidence: Organization can grow beyond founder dependency`);
    
    evidence.push(`\n2. DEVELOPMENT INVESTMENT (Commitment to Growth):`);
    evidence.push(`   • £${totalInvestment.toLocaleString()}/year invested in leadership development`);
    evidence.push(`   • Structured development plans for ${roles.filter(r => r.developmentPlan).length} roles`);
    evidence.push(`   • Evidence: Long-term commitment to organizational capability building`);
    
    evidence.push(`\n3. RISK MANAGEMENT (Viability Evidence):`);
    const { score } = getBusinessContinuityScore();
    evidence.push(`   • Business continuity score: ${score}% (${score >= 70 ? 'Strong' : score >= 50 ? 'Moderate' : 'Needs improvement'})`);
    evidence.push(`   • Documented succession plans demonstrate professional management`);
    evidence.push(`   • Evidence: Business can sustain operations through leadership transitions`);
    
    return evidence;
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate });

  // Chart 1: Readiness-Urgency Matrix
  const getReadinessUrgencyScatter = () => {
    return roles.map(role => ({
      x: role.readinessLevel,
      y: role.urgency,
      name: role.criticalRole.substring(0, 12),
      impact: role.businessImpactScore
    }));
  };

  // Chart 2: Pipeline Health Timeline
  const getPipelineTimeline = () => {
    return [
      { category: 'Ready Now', count: roles.filter(r => r.readinessLevel >= 80).length, target: Math.ceil(roles.length * 0.3) },
      { category: '6 Months', count: roles.filter(r => r.readinessLevel >= 60 && r.timeToCompetence <= 6).length, target: Math.ceil(roles.length * 0.5) },
      { category: '12 Months', count: roles.filter(r => r.readinessLevel >= 40 && r.timeToCompetence <= 12).length, target: Math.ceil(roles.length * 0.7) },
      { category: '12+ Months', count: roles.filter(r => r.readinessLevel < 40 || r.timeToCompetence > 12).length, target: Math.ceil(roles.length * 0.2) }
    ];
  };

  // Chart 3: Business Continuity Risk by Role
  const getRiskByRole = () => {
    return roles.map(role => ({
      role: role.criticalRole.substring(0, 12),
      readiness: role.readinessLevel,
      urgency: role.urgency,
      impact: role.businessImpactScore
    }));
  };

  // Chart 4: Development Investment ROI
  const getDevelopmentInvestmentData = () => {
    return roles.map(role => ({
      role: role.criticalRole.substring(0, 12),
      investment: role.developmentCost,
      impact: role.businessImpactScore
    })).sort((a, b) => b.investment - a.investment);
  };

  useEffect(() => {
    const s = localStorage.getItem('successionPlanningData');
    if (s) setRoles(JSON.parse(s).roles || []);
    const f = localStorage.getItem('successionPlanningFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('successionPlanningDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: continuityScore, grade, criticalRisks } = getBusinessContinuityScore();
  const { readyNow, atRisk } = getPipelineHealth();
  const { totalInvestment, roi } = getDevelopmentROI();
  const avgReadiness = roles.length > 0 ? Math.round(roles.reduce((sum, r) => sum + r.readinessLevel, 0) / roles.length) : 0;

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Leadership Succession & Business Continuity</h1>
          <p className="text-muted-foreground mb-6">Build resilient leadership pipeline (Innovator Founder Visa viability criterion)</p>

          <ToolUtilityBar
            toolId="succession-planning"
            toolName="Leadership Succession & Business Continuity"
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
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Continuity Score</span>
              </div>
              <p className="text-3xl font-bold">{continuityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Pipeline Health</span>
              </div>
              <p className="text-3xl font-bold">{readyNow}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready now / {atRisk} at risk</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Development ROI</span>
              </div>
              <p className="text-3xl font-bold">{roi > 0 ? '+' : ''}{roi}%</p>
              <p className="text-xs text-muted-foreground mt-1">£{Math.round(totalInvestment / 1000)}k invested</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Avg Readiness</span>
              </div>
              <p className="text-3xl font-bold">{avgReadiness}%</p>
              <p className="text-xs text-muted-foreground mt-1">{criticalRisks} critical risks</p>
            </Card>
          </div>

          {/* PhD-Level: 4-Chart Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Readiness vs Urgency Matrix</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Readiness" unit="%" label={{ value: 'Successor Readiness %', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="y" name="Urgency" unit="%" label={{ value: 'Succession Urgency %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm">Readiness: {data.x}%</p>
                          <p className="text-sm">Urgency: {data.y}%</p>
                          <p className="text-sm">Impact: {data.impact}%</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Scatter name="Roles" data={getReadinessUrgencyScatter()} fill="#ffa536">
                    {getReadinessUrgencyScatter().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.y > 70 && entry.x < 50 ? '#ef4444' : entry.impact > 80 ? '#ffa536' : '#11b6e9'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pipeline Health Timeline</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getPipelineTimeline()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis label={{ value: 'Number of Roles', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ffa536" name="Current" />
                  <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Business Continuity Risk by Role</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getRiskByRole()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="role" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Readiness" dataKey="readiness" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  <Radar name="Urgency" dataKey="urgency" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Development Investment (ROI)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getDevelopmentInvestmentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" label={{ value: 'Investment £', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Impact %', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="investment" fill="#ffa536" name="Annual Investment" />
                  <Bar yAxisId="right" dataKey="impact" fill="#11b6e9" name="Business Impact" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* GOV.UK-Aligned Recommendations */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Business Continuity Recommendations (ISO 22301)</h3>
            <div className="space-y-3">
              {getBusinessContinuityRecommendations().map((tip, i) => {
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
              <h3 className="font-semibold">Critical Roles & Succession Plans</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {roles.map((role) => (
                <Card key={role.id} className={`p-6 border-l-4 ${
                  role.riskLevel === 'critical' ? 'border-l-red-500' :
                  role.riskLevel === 'high' ? 'border-l-orange-500' :
                  role.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <Input
                      value={role.criticalRole}
                      onChange={(e) => updateRole(role.id, 'criticalRole', e.target.value)}
                      className="font-semibold text-xl w-2/3"
                      placeholder="Critical Role Title"
                      data-testid={`input-role-${role.id}`}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)} data-testid={`button-remove-${role.id}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Current Holder</label>
                      <Input value={role.currentHolder} onChange={(e) => updateRole(role.id, 'currentHolder', e.target.value)} placeholder="Name/Title" data-testid={`input-holder-${role.id}`} />
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
                      <label className="text-xs text-muted-foreground block mb-1">Business Impact (0-100)</label>
                      <Input type="number" min="0" max="100" value={role.businessImpactScore} onChange={(e) => updateRole(role.id, 'businessImpactScore', Number(e.target.value))} data-testid={`input-impact-${role.id}`} />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Time to Competence (months)</label>
                      <Input type="number" min="0" max="36" value={role.timeToCompetence} onChange={(e) => updateRole(role.id, 'timeToCompetence', Number(e.target.value))} data-testid={`input-time-${role.id}`} />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Development Cost (£/year)</label>
                      <Input type="number" value={role.developmentCost} onChange={(e) => updateRole(role.id, 'developmentCost', Number(e.target.value))} data-testid={`input-cost-${role.id}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Succession Urgency: {role.urgency}%</label>
                      <Slider value={[role.urgency]} onValueChange={(v) => updateRole(role.id, 'urgency', v[0])} max={100} step={5} data-testid={`slider-urgency-${role.id}`} />
                      <p className="text-xs text-muted-foreground mt-1">How soon might succession be needed?</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Successor Readiness: {role.readinessLevel}%</label>
                      <Slider value={[role.readinessLevel]} onValueChange={(v) => updateRole(role.id, 'readinessLevel', v[0])} max={100} step={5} data-testid={`slider-readiness-${role.id}`} />
                      <p className="text-xs text-muted-foreground mt-1">How ready is best successor now?</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Identified Successors</label>
                      <Button size="sm" variant="ghost" onClick={() => addSuccessor(role.id)} data-testid={`button-add-successor-${role.id}`}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    {role.successors.map((successor, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          value={successor}
                          onChange={(e) => updateSuccessor(role.id, idx, e.target.value)}
                          placeholder="Successor name/role..."
                          data-testid={`input-successor-${role.id}-${idx}`}
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeSuccessor(role.id, idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Development Plan</label>
                    <Textarea
                      value={role.developmentPlan}
                      onChange={(e) => updateRole(role.id, 'developmentPlan', e.target.value)}
                      placeholder="Training, mentorship, skill development, experience-building..."
                      rows={2}
                      data-testid={`textarea-plan-${role.id}`}
                    />
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
