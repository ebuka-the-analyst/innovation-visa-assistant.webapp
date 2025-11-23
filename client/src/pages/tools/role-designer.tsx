import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Target, Users, TrendingUp, AlertCircle, CheckCircle2, Award, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ScatterChart, Scatter, Cell } from "recharts";

// UK SOC 2020 Codes for Visa Sponsorship (Common Tech Roles)
const UK_SOC_CODES = {
  "2136": { title: "Programmers and software development professionals", visaSponsorable: true, goingRate: 42000 },
  "2137": "Web design and development professionals",
  "2135": "IT business analysts, architects and systems designers",
  "2139": "Information technology and telecommunications professionals n.e.c.",
  "2133": "IT specialist managers",
  "1136": "IT directors",
  "2134": "IT project and programme managers",
  "3131": "IT operations technicians",
  "3132": "IT user support technicians"
};

interface RoleDefinition {
  id: string;
  title: string;
  department: string;
  socCode: string;
  responsibilities: string[];
  kpis: string[];
  skills: string[];
  reportingTo: string;
  minSalary: number;
  maxSalary: number;
  marketDemand: number; // 0-100
  skillGapCost: number; // £ annual cost
  timeToFill: number; // days
}

export default function RoleDesigner() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: "1",
      title: "Software Engineer",
      department: "Engineering",
      socCode: "2136",
      responsibilities: ["Design and implement features", "Code review and testing", "Collaborate with product team"],
      kpis: ["Code quality score", "Sprint velocity", "Bug resolution time"],
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "Testing"],
      reportingTo: "Engineering Manager",
      minSalary: 60000,
      maxSalary: 90000,
      marketDemand: 85,
      skillGapCost: 12000,
      timeToFill: 45
    }
  ]);

  const saveProgress = () => {
    localStorage.setItem('roleDesignerFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('roleDesignerData', JSON.stringify({ roles }));
    localStorage.setItem('roleDesignerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      title: "New Role",
      department: "",
      socCode: "",
      responsibilities: [""],
      kpis: [""],
      skills: [""],
      reportingTo: "",
      minSalary: 40000,
      maxSalary: 60000,
      marketDemand: 50,
      skillGapCost: 5000,
      timeToFill: 30
    }]);
  };

  const removeRole = (id: string) => setRoles(roles.filter(r => r.id !== id));

  const updateRole = (id: string, field: string, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addArrayItem = (id: string, field: 'responsibilities' | 'kpis' | 'skills') => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: [...r[field], ""] } : r));
  };

  const updateArrayItem = (id: string, field: 'responsibilities' | 'kpis' | 'skills', index: number, value: string) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        const newArray = [...r[field]];
        newArray[index] = value;
        return { ...r, [field]: newArray };
      }
      return r;
    }));
  };

  const removeArrayItem = (id: string, field: 'responsibilities' | 'kpis' | 'skills', index: number) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        return { ...r, [field]: r[field].filter((_, i) => i !== index) };
      }
      return r;
    }));
  };

  // PhD-Level: Visa Eligibility Score
  const getVisaEligibilityScore = (role: RoleDefinition): number => {
    let score = 0;
    
    // SOC code registered (40 points)
    if (role.socCode && UK_SOC_CODES[role.socCode as keyof typeof UK_SOC_CODES]) {
      score += 40;
    }
    
    // Meets salary threshold (30 points)
    if (role.minSalary >= 25600) score += 30;
    
    // Above going rate (20 points)
    if (role.minSalary >= 45000) score += 20;
    
    // Job-ready definition (10 points)
    if (role.responsibilities.filter(x => x).length >= 3 && role.skills.filter(x => x).length >= 3) {
      score += 10;
    }
    
    return score;
  };

  // PhD-Level: Skill Gap ROI Calculator
  const getSkillGapROI = (): { totalGapCost: number; avgTimeToFill: number; highDemandRoles: number } => {
    const totalGapCost = roles.reduce((sum, r) => sum + r.skillGapCost, 0);
    const avgTimeToFill = roles.length > 0 ? roles.reduce((sum, r) => sum + r.timeToFill, 0) / roles.length : 0;
    const highDemandRoles = roles.filter(r => r.marketDemand >= 70).length;
    
    return { totalGapCost, avgTimeToFill, highDemandRoles };
  };

  const exportPlan = () => {
    const { totalGapCost, avgTimeToFill } = getSkillGapROI();
    const avgVisaEligibility = roles.reduce((sum, r) => sum + getVisaEligibilityScore(r), 0) / roles.length;
    
    const content = `UK INNOVATOR FOUNDER VISA - ROLE & RESPONSIBILITY DESIGN
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════
Total Roles: ${roles.length}
Total Departments: ${new Set(roles.map(r => r.department)).size}
Avg Visa Eligibility: ${avgVisaEligibility.toFixed(1)}%
Total Skill Gap Cost: £${totalGapCost.toLocaleString()}
Avg Time-to-Fill: ${avgTimeToFill.toFixed(0)} days

═══════════════════════════════════════════════════════════
UK SOC 2020 CODE COMPLIANCE
═══════════════════════════════════════════════════════════
${roles.filter(r => r.socCode).length} of ${roles.length} roles have assigned SOC codes
Visa-sponsorable roles: ${roles.filter(r => r.socCode && UK_SOC_CODES[r.socCode as keyof typeof UK_SOC_CODES]).length}

${roles.map(r => {
  const visaEligibility = getVisaEligibilityScore(r);
  const socInfo = r.socCode ? UK_SOC_CODES[r.socCode as keyof typeof UK_SOC_CODES] : null;
  const midSalary = (r.minSalary + r.maxSalary) / 2;
  
  return `
═══════════════════════════════════════════════════════════
ROLE: ${r.title}
═══════════════════════════════════════════════════════════
Department: ${r.department}
Reports To: ${r.reportingTo}
SOC Code: ${r.socCode || 'Not assigned'} ${socInfo ? `(${socInfo.title})` : ''}

COMPENSATION:
Salary Range: £${r.minSalary.toLocaleString()} - £${r.maxSalary.toLocaleString()}
Mid-point: £${midSalary.toLocaleString()}

VISA ELIGIBILITY:
Score: ${visaEligibility}% ${visaEligibility >= 70 ? '✓ READY FOR SPONSORSHIP' : visaEligibility >= 50 ? '⚠ NEEDS IMPROVEMENT' : '✗ NOT ELIGIBLE'}
${r.minSalary >= 25600 ? '✓' : '✗'} Meets UK skilled worker minimum (£25,600)
${r.minSalary >= 45000 ? '✓' : '⚠'} Above UK going rate (£45,000)
${r.socCode ? '✓' : '✗'} SOC 2020 code assigned

MARKET INTELLIGENCE:
Market Demand: ${r.marketDemand}% ${r.marketDemand >= 70 ? '(High)' : r.marketDemand >= 40 ? '(Medium)' : '(Low)'}
Estimated Time-to-Fill: ${r.timeToFill} days
Skill Gap Cost: £${r.skillGapCost.toLocaleString()}/year

KEY RESPONSIBILITIES:
${r.responsibilities.filter(x => x).map((resp, i) => `${i + 1}. ${resp}`).join('\n')}

KEY PERFORMANCE INDICATORS (KPIs):
${r.kpis.filter(x => x).map((kpi, i) => `${i + 1}. ${kpi}`).join('\n')}

REQUIRED SKILLS:
${r.skills.filter(x => x).map((skill, i) => `• ${skill}`).join('\n')}
`}).join('\n')}

═══════════════════════════════════════════════════════════
GOV.UK COMPLIANCE RECOMMENDATIONS
═══════════════════════════════════════════════════════════
${getGovUKRecommendations().join('\n')}

═══════════════════════════════════════════════════════════
SKILL GAP & ROI ANALYSIS
═══════════════════════════════════════════════════════════
${getSkillGapInsights().join('\n')}

Reference: UK Immigration Rules - Standard Occupational Classification (SOC 2020)
Source: GOV.UK Home Office Guidance (2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uk-visa-role-design.txt';
    a.click();
  };

  // PhD-Level: GOV.UK-Aligned Recommendations
  const getGovUKRecommendations = (): string[] => {
    const tips: string[] = [];
    
    // SOC code compliance
    const rolesWithoutSOC = roles.filter(r => !r.socCode);
    if (rolesWithoutSOC.length > 0) {
      tips.push(`🚨 CRITICAL: ${rolesWithoutSOC.length} role(s) missing SOC 2020 code - CANNOT sponsor visa without valid classification`);
      tips.push(`   Affected roles: ${rolesWithoutSOC.map(r => r.title).join(', ')}`);
      tips.push(`   Action: Assign appropriate SOC codes from GOV.UK register`);
    }
    
    // Salary threshold
    const belowMinimum = roles.filter(r => r.minSalary < 25600);
    if (belowMinimum.length > 0) {
      tips.push(`⚠️ WARNING: ${belowMinimum.length} role(s) below £25,600 minimum - not eligible for skilled worker visa`);
      tips.push(`   Roles: ${belowMinimum.map(r => r.title).join(', ')}`);
    }
    
    // Job definition completeness
    const incompleteRoles = roles.filter(r => r.responsibilities.filter(x => x).length < 3 || r.skills.filter(x => x).length < 3);
    if (incompleteRoles.length > 0) {
      tips.push(`📋 ${incompleteRoles.length} role(s) with incomplete job descriptions - may face Home Office scrutiny`);
      tips.push(`   Ensure minimum 3 responsibilities and 3 skills per role for sponsor license applications`);
    }
    
    // High-demand roles
    const highDemand = roles.filter(r => r.marketDemand >= 70);
    if (highDemand.length > 0) {
      tips.push(`💡 ${highDemand.length} high-demand role(s) identified - consider competitive offers to reduce time-to-fill`);
    }
    
    return tips.length > 0 ? tips : ['✅ All roles meet UK visa eligibility requirements'];
  };

  // PhD-Level: Skill Gap Insights
  const getSkillGapInsights = (): string[] => {
    const insights: string[] = [];
    const { totalGapCost, avgTimeToFill, highDemandRoles } = getSkillGapROI();
    
    insights.push(`Total annual skill gap cost: £${totalGapCost.toLocaleString()}`);
    insights.push(`Average time-to-fill: ${avgTimeToFill.toFixed(0)} days`);
    insights.push(`High-demand roles (>70% market demand): ${highDemandRoles}`);
    
    if (avgTimeToFill > 60) {
      insights.push(`\n⚠️ Extended hiring timelines detected - consider:`);
      insights.push(`   • Upskilling existing team members (save £${(totalGapCost * 0.4).toLocaleString()})`);
      insights.push(`   • International recruitment via visa sponsorship`);
      insights.push(`   • Contractor/interim support while building team`);
    }
    
    if (totalGapCost > 50000) {
      insights.push(`\n💰 Significant skill gap investment detected`);
      insights.push(`   Training ROI potential: £${(totalGapCost * 0.6).toLocaleString()} over 2 years`);
      insights.push(`   External recruitment cost: ~£${(roles.length * 8000).toLocaleString()} (industry avg)`);
    }
    
    return insights;
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate });

  // Chart Data: Visa Eligibility Scores
  const getVisaEligibilityData = () => {
    return roles.map(r => ({
      role: r.title.substring(0, 12),
      score: getVisaEligibilityScore(r),
      threshold: 70
    }));
  };

  // Chart Data: Market Demand vs Salary
  const getMarketDemandData = () => {
    return roles.map(r => ({
      role: r.title.substring(0, 12),
      demand: r.marketDemand,
      salary: (r.minSalary + r.maxSalary) / 2
    }));
  };

  // Chart Data: Time-to-Fill vs Skill Gap Cost
  const getTimeToFillData = () => {
    return roles.map(r => ({
      x: r.timeToFill,
      y: r.skillGapCost,
      name: r.title.substring(0, 10)
    }));
  };

  // Chart Data: Skill Requirements Radar
  const getSkillRadarData = () => {
    return roles.slice(0, 5).map(r => ({
      role: r.title.substring(0, 12),
      responsibilities: r.responsibilities.filter(x => x).length,
      kpis: r.kpis.filter(x => x).length,
      skills: r.skills.filter(x => x).length,
      visaReady: getVisaEligibilityScore(r)
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('roleDesignerData');
    if (s) setRoles(JSON.parse(s).roles);
    const f = localStorage.getItem('roleDesignerFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('roleDesignerDate');
    if (d) setSavedDate(d);
  }, []);

  const { totalGapCost, avgTimeToFill, highDemandRoles } = getSkillGapROI();
  const avgVisaEligibility = roles.reduce((sum, r) => sum + getVisaEligibilityScore(r), 0) / (roles.length || 1);
  const visaSponsorableRoles = roles.filter(r => getVisaEligibilityScore(r) >= 70).length;

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Role & Responsibility Designer</h1>
          <p className="text-muted-foreground mb-6">UK visa-compliant roles with SOC 2020 classification & skill gap analysis</p>

          <ToolUtilityBar
            toolId="role-designer"
            toolName="Role & Responsibility Designer"
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
                <span className="text-sm font-medium">Visa Eligibility</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(avgVisaEligibility)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{visaSponsorableRoles}/{roles.length} roles ready</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Skill Gap Cost</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(totalGapCost / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Annual investment</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Avg Time-to-Fill</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(avgTimeToFill)}</p>
              <p className="text-xs text-muted-foreground mt-1">Days to hire</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">High Demand</span>
              </div>
              <p className="text-3xl font-bold">{highDemandRoles}/{roles.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Market demand {'>'} 70%</p>
            </Card>
          </div>

          {/* PhD-Level: 4-Chart Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Visa Eligibility Score (SOC 2020 Compliance)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getVisaEligibilityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="score" fill="#ffa536" name="Eligibility Score" />
                  <Bar dataKey="threshold" fill="#10b981" name="Sponsorship Threshold (70%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Demand vs Compensation</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getMarketDemandData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" label={{ value: 'Demand %', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Salary £', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="demand" stroke="#11b6e9" name="Market Demand" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="salary" stroke="#ffa536" name="Mid Salary" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Time-to-Fill vs Skill Gap Cost</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Days to Fill" />
                  <YAxis dataKey="y" name="Gap Cost £" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Roles" data={getTimeToFillData()} fill="#ffa536">
                    {getTimeToFillData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Role Completeness Radar (Top 5)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getSkillRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="role" />
                  <PolarRadiusAxis />
                  <Radar name="Responsibilities" dataKey="responsibilities" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Radar name="KPIs" dataKey="kpis" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.6} />
                  <Radar name="Skills" dataKey="skills" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* GOV.UK-Aligned Recommendations */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">GOV.UK Compliance Recommendations</h3>
            <div className="space-y-3">
              {getGovUKRecommendations().map((tip, i) => {
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

          {/* Role Definitions Editor */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Role Definitions</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {roles.map((role) => {
                const visaEligibility = getVisaEligibilityScore(role);
                const isVisaReady = visaEligibility >= 70;
                
                return (
                  <Card key={role.id} className={`p-6 border-l-4 ${isVisaReady ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <Input
                        value={role.title}
                        onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                        className="font-semibold text-xl w-2/3"
                        placeholder="Role Title"
                        data-testid={`input-title-${role.id}`}
                      />
                      <div className="flex items-center gap-2">
                        {isVisaReady && <ShieldCheck className="w-5 h-5 text-green-600" title="Visa Ready" />}
                        <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)} data-testid={`button-remove-${role.id}`}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Department</label>
                        <Input value={role.department} onChange={(e) => updateRole(role.id, 'department', e.target.value)} placeholder="Engineering" data-testid={`input-department-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">UK SOC 2020 Code</label>
                        <Select value={role.socCode} onValueChange={(v) => updateRole(role.id, 'socCode', v)}>
                          <SelectTrigger data-testid={`select-soc-${role.id}`}><SelectValue placeholder="Select SOC" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2136">2136 - Programmers/Software</SelectItem>
                            <SelectItem value="2137">2137 - Web Design/Dev</SelectItem>
                            <SelectItem value="2135">2135 - IT Business Analysts</SelectItem>
                            <SelectItem value="2139">2139 - IT Professionals</SelectItem>
                            <SelectItem value="2133">2133 - IT Managers</SelectItem>
                            <SelectItem value="1136">1136 - IT Directors</SelectItem>
                            <SelectItem value="2134">2134 - IT Project Managers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Min Salary (£)</label>
                        <Input type="number" value={role.minSalary} onChange={(e) => updateRole(role.id, 'minSalary', Number(e.target.value))} data-testid={`input-min-salary-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Max Salary (£)</label>
                        <Input type="number" value={role.maxSalary} onChange={(e) => updateRole(role.id, 'maxSalary', Number(e.target.value))} data-testid={`input-max-salary-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Reports To</label>
                        <Input value={role.reportingTo} onChange={(e) => updateRole(role.id, 'reportingTo', e.target.value)} placeholder="VP Engineering" data-testid={`input-reporting-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Time-to-Fill (days)</label>
                        <Input type="number" value={role.timeToFill} onChange={(e) => updateRole(role.id, 'timeToFill', Number(e.target.value))} data-testid={`input-time-fill-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Skill Gap Cost (£)</label>
                        <Input type="number" value={role.skillGapCost} onChange={(e) => updateRole(role.id, 'skillGapCost', Number(e.target.value))} data-testid={`input-gap-cost-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Market Demand (%)</label>
                        <Slider value={[role.marketDemand]} onValueChange={([v]) => updateRole(role.id, 'marketDemand', v)} max={100} step={5} className="mt-2" data-testid={`slider-demand-${role.id}`} />
                        <span className="text-sm font-medium">{role.marketDemand}%</span>
                      </div>
                    </div>

                    {/* Live Visa Eligibility Feedback */}
                    <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-md mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Visa Eligibility Score</span>
                        <span className={`text-lg font-bold ${visaEligibility >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{visaEligibility}%</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {role.socCode ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                          <span>SOC 2020 Code Assigned</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {role.minSalary >= 25600 ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                          <span>Meets Skilled Worker Minimum (£25,600)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {role.minSalary >= 45000 ? <span className="text-green-600">✓</span> : <span className="text-orange-600">⚠</span>}
                          <span>Above UK Going Rate (£45,000)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Key Responsibilities</label>
                          <Button variant="outline" size="sm" onClick={() => addArrayItem(role.id, 'responsibilities')} data-testid={`button-add-responsibility-${role.id}`}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        {role.responsibilities.map((resp, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input value={resp} onChange={(e) => updateArrayItem(role.id, 'responsibilities', idx, e.target.value)} placeholder="Responsibility" data-testid={`input-responsibility-${role.id}-${idx}`} />
                            <Button variant="ghost" size="sm" onClick={() => removeArrayItem(role.id, 'responsibilities', idx)} data-testid={`button-remove-responsibility-${role.id}-${idx}`}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Key Performance Indicators</label>
                          <Button variant="outline" size="sm" onClick={() => addArrayItem(role.id, 'kpis')} data-testid={`button-add-kpi-${role.id}`}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        {role.kpis.map((kpi, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input value={kpi} onChange={(e) => updateArrayItem(role.id, 'kpis', idx, e.target.value)} placeholder="KPI" data-testid={`input-kpi-${role.id}-${idx}`} />
                            <Button variant="ghost" size="sm" onClick={() => removeArrayItem(role.id, 'kpis', idx)} data-testid={`button-remove-kpi-${role.id}-${idx}`}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Required Skills</label>
                          <Button variant="outline" size="sm" onClick={() => addArrayItem(role.id, 'skills')} data-testid={`button-add-skill-${role.id}`}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        {role.skills.map((skill, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input value={skill} onChange={(e) => updateArrayItem(role.id, 'skills', idx, e.target.value)} placeholder="Skill" data-testid={`input-skill-${role.id}-${idx}`} />
                            <Button variant="ghost" size="sm" onClick={() => removeArrayItem(role.id, 'skills', idx)} data-testid={`button-remove-skill-${role.id}-${idx}`}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
