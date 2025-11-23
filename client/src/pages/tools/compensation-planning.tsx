import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, TrendingUp, AlertCircle, Briefcase, DollarSign, Award, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

// UK GOV.UK Visa Salary Thresholds (2025)
const UK_VISA_THRESHOLDS = {
  SKILLED_WORKER_MIN: 25600, // Minimum for skilled worker visa
  SPONSORSHIP_LICENSE: 38700, // Recommended minimum for sponsorship license
  GOING_RATE_MEDIAN: 45000, // UK median "going rate" for most roles
  SENIOR_THRESHOLD: 75000, // Senior role threshold for points
  SHORTAGE_OCCUPATION_MIN: 20480 // 80% of minimum for shortage occupations
};

interface CompensationBand {
  id: string;
  role: string;
  level: string;
  minSalary: number;
  maxSalary: number;
  equity: number;
  bonusTarget: number;
  isVisaSponsorable: boolean;
  costPerHire: number;
}

export default function CompensationPlanning() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [bands, setBands] = useState<CompensationBand[]>([
    { id: "1", role: "Software Engineer", level: "Mid-level", minSalary: 70000, maxSalary: 95000, equity: 0.15, bonusTarget: 10, isVisaSponsorable: true, costPerHire: 8500 },
    { id: "2", role: "Product Manager", level: "Senior", minSalary: 95000, maxSalary: 130000, equity: 0.25, bonusTarget: 15, isVisaSponsorable: true, costPerHire: 12000 }
  ]);

  const saveProgress = () => {
    localStorage.setItem('compensationPlanningFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('compensationPlanningData', JSON.stringify({ bands }));
    localStorage.setItem('compensationPlanningDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addBand = () => {
    setBands([...bands, { 
      id: Date.now().toString(), 
      role: "New Role", 
      level: "Mid-level", 
      minSalary: 60000, 
      maxSalary: 80000, 
      equity: 0.1, 
      bonusTarget: 10,
      isVisaSponsorable: false,
      costPerHire: 5000
    }]);
  };

  const removeBand = (id: string) => setBands(bands.filter(b => b.id !== id));

  const updateBand = (id: string, field: string, value: any) => {
    setBands(bands.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // PhD-Level Analytics: Visa Compliance Scoring
  const getVisaComplianceScore = (): number => {
    if (bands.length === 0) return 0;
    
    let score = 0;
    const weights = {
      meetsMinimum: 30,
      aboveGoingRate: 25,
      sponsorshipReady: 25,
      competitiveEquity: 20
    };

    // Check if salaries meet UK minimum thresholds
    const rolesAboveMinimum = bands.filter(b => b.minSalary >= UK_VISA_THRESHOLDS.SKILLED_WORKER_MIN).length;
    score += (rolesAboveMinimum / bands.length) * weights.meetsMinimum;

    // Check if salaries are above "going rate"
    const rolesAboveGoingRate = bands.filter(b => (b.minSalary + b.maxSalary) / 2 >= UK_VISA_THRESHOLDS.GOING_RATE_MEDIAN).length;
    score += (rolesAboveGoingRate / bands.length) * weights.aboveGoingRate;

    // Check sponsorship readiness
    const sponsorableRoles = bands.filter(b => b.isVisaSponsorable && b.minSalary >= UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE).length;
    score += (sponsorableRoles / bands.length) * weights.sponsorshipReady;

    // Check equity competitiveness
    const avgEquity = bands.reduce((sum, b) => sum + b.equity, 0) / bands.length;
    if (avgEquity >= 0.15) score += weights.competitiveEquity;
    else if (avgEquity >= 0.1) score += weights.competitiveEquity * 0.7;
    else if (avgEquity >= 0.05) score += weights.competitiveEquity * 0.4;

    return Math.round(score);
  };

  // PhD-Level Analytics: Total Compensation Calculator
  const getTotalCompensation = (band: CompensationBand): number => {
    const baseSalary = (band.minSalary + band.maxSalary) / 2;
    const bonus = baseSalary * (band.bonusTarget / 100);
    const equityValue = baseSalary * (band.equity / 100) * 4; // 4-year vesting
    return baseSalary + bonus + equityValue;
  };

  // PhD-Level Analytics: Recruitment ROI
  const getRecruitmentROI = (): { totalCost: number; avgCostPerHire: number; rolesAboveThreshold: number } => {
    const totalCost = bands.reduce((sum, b) => sum + b.costPerHire, 0);
    const avgCostPerHire = bands.length > 0 ? totalCost / bands.length : 0;
    const rolesAboveThreshold = bands.filter(b => b.costPerHire > 10000).length;
    
    return { totalCost, avgCostPerHire, rolesAboveThreshold };
  };

  const exportPlan = () => {
    const avgEquity = (bands.reduce((sum, b) => sum + b.equity, 0) / bands.length).toFixed(2);
    const totalBudget = bands.reduce((sum, b) => sum + (b.minSalary + b.maxSalary) / 2, 0);
    const visaCompliance = getVisaComplianceScore();
    const { totalCost, avgCostPerHire } = getRecruitmentROI();
    
    const content = `UK INNOVATOR FOUNDER VISA - COMPENSATION PLANNING REPORT
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════
Total Roles: ${bands.length}
Visa Compliance Score: ${visaCompliance}%
Annual Salary Budget: £${totalBudget.toLocaleString()}
Average Equity: ${avgEquity}%
Total Recruitment Cost: £${totalCost.toLocaleString()}
Average Cost-per-Hire: £${avgCostPerHire.toLocaleString()}

═══════════════════════════════════════════════════════════
UK GOV.UK VISA THRESHOLDS (2025)
═══════════════════════════════════════════════════════════
✓ Skilled Worker Minimum: £${UK_VISA_THRESHOLDS.SKILLED_WORKER_MIN.toLocaleString()}
✓ Sponsorship License Recommended: £${UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE.toLocaleString()}
✓ Going Rate Median: £${UK_VISA_THRESHOLDS.GOING_RATE_MEDIAN.toLocaleString()}
✓ Senior Role Threshold: £${UK_VISA_THRESHOLDS.SENIOR_THRESHOLD.toLocaleString()}

═══════════════════════════════════════════════════════════
COMPENSATION BANDS WITH VISA COMPLIANCE
═══════════════════════════════════════════════════════════
${bands.map(b => {
  const midSalary = (b.minSalary + b.maxSalary) / 2;
  const totalComp = getTotalCompensation(b);
  const visaCompliant = b.minSalary >= UK_VISA_THRESHOLDS.SKILLED_WORKER_MIN;
  const sponsorReady = b.isVisaSponsorable && b.minSalary >= UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE;
  
  return `
${b.role} (${b.level})
─────────────────────────────────────────────────────────
Salary Range: £${b.minSalary.toLocaleString()} - £${b.maxSalary.toLocaleString()}
Mid-point: £${midSalary.toLocaleString()}
Equity: ${b.equity}%
Bonus Target: ${b.bonusTarget}%
Total Compensation: £${totalComp.toLocaleString()}
Cost-per-Hire: £${b.costPerHire.toLocaleString()}

VISA COMPLIANCE:
${visaCompliant ? '✓' : '✗'} Meets Skilled Worker Minimum (£25,600)
${sponsorReady ? '✓' : '✗'} Ready for Sponsorship License (£38,700+)
${midSalary >= UK_VISA_THRESHOLDS.GOING_RATE_MEDIAN ? '✓' : '✗'} Above UK Going Rate (£45,000)
${b.isVisaSponsorable ? '✓' : '✗'} Designated as Visa-Sponsorable Role
`}).join('\n')}

═══════════════════════════════════════════════════════════
GOV.UK COMPLIANCE RECOMMENDATIONS
═══════════════════════════════════════════════════════════
${getGovUKRecommendations().join('\n')}

═══════════════════════════════════════════════════════════
MARKET ANALYSIS
═══════════════════════════════════════════════════════════
${getMarketAnalysis().join('\n')}

═══════════════════════════════════════════════════════════
RECRUITMENT ROI INSIGHTS
═══════════════════════════════════════════════════════════
${getRecruitmentInsights().join('\n')}

Reference: UK Immigration Rules Appendix Skilled Worker
Source: GOV.UK Home Office Guidance (2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uk-visa-compensation-plan.txt';
    a.click();
  };

  // PhD-Level: GOV.UK-Aligned Recommendations
  const getGovUKRecommendations = (): string[] => {
    const tips: string[] = [];
    
    // Visa threshold compliance
    const belowMinimum = bands.filter(b => b.minSalary < UK_VISA_THRESHOLDS.SKILLED_WORKER_MIN);
    if (belowMinimum.length > 0) {
      tips.push(`🚨 CRITICAL: ${belowMinimum.length} role(s) below £25,600 minimum - NOT ELIGIBLE for skilled worker visa sponsorship`);
      tips.push(`   Affected roles: ${belowMinimum.map(b => b.role).join(', ')}`);
      tips.push(`   Action: Increase salaries to £25,600+ or reclassify as non-sponsorable positions`);
    }

    // Sponsorship license readiness
    const belowSponsorshipThreshold = bands.filter(b => b.isVisaSponsorable && b.minSalary < UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE);
    if (belowSponsorshipThreshold.length > 0) {
      tips.push(`⚠️ WARNING: ${belowSponsorshipThreshold.length} visa-sponsorable role(s) below £38,700 recommended threshold`);
      tips.push(`   Roles: ${belowSponsorshipThreshold.map(b => b.role).join(', ')}`);
      tips.push(`   Risk: May face Home Office scrutiny during sponsor license applications`);
    }

    // Going rate compliance
    const belowGoingRate = bands.filter(b => (b.minSalary + b.maxSalary) / 2 < UK_VISA_THRESHOLDS.GOING_RATE_MEDIAN);
    if (belowGoingRate.length > 0) {
      tips.push(`📊 ${belowGoingRate.length} role(s) below £45,000 UK median "going rate" - may impact visa points eligibility`);
    }

    // Equity competitiveness
    const avgEquity = bands.reduce((sum, b) => sum + b.equity, 0) / bands.length;
    if (avgEquity < 0.1) {
      tips.push(`💡 Average equity (${avgEquity.toFixed(2)}%) below UK tech startup benchmark (0.1-0.3%)`);
      tips.push(`   Recommendation: Increase equity to attract skilled international talent`);
    }

    // Cost-per-hire efficiency
    const { avgCostPerHire, rolesAboveThreshold } = getRecruitmentROI();
    if (avgCostPerHire > 10000) {
      tips.push(`💰 Average cost-per-hire (£${avgCostPerHire.toLocaleString()}) exceeds industry benchmark (£5k-8k)`);
      tips.push(`   Consider: Optimizing recruitment channels, leveraging employee referrals`);
    }

    return tips.length > 0 ? tips : ['✅ All roles meet UK visa salary thresholds and sponsorship requirements'];
  };

  const getMarketAnalysis = (): string[] => {
    const analysis: string[] = [];
    
    bands.forEach(b => {
      const midpoint = (b.minSalary + b.maxSalary) / 2;
      const totalComp = getTotalCompensation(b);
      
      if (midpoint >= UK_VISA_THRESHOLDS.SENIOR_THRESHOLD) {
        analysis.push(`✓ ${b.role}: Senior-tier compensation (£${midpoint.toLocaleString()}) - strong for visa points and talent attraction`);
      }
      
      if (b.equity >= 0.2) {
        analysis.push(`✓ ${b.role}: Competitive equity package (${b.equity}%) - aligns with high-growth startup benchmarks`);
      }
      
      if (totalComp >= 150000) {
        analysis.push(`✓ ${b.role}: Total compensation £${totalComp.toLocaleString()} - premium positioning for UK market`);
      }
    });
    
    return analysis.length > 0 ? analysis : ['Market positioning within competitive ranges'];
  };

  // PhD-Level: Recruitment ROI Insights
  const getRecruitmentInsights = (): string[] => {
    const insights: string[] = [];
    const { totalCost, avgCostPerHire, rolesAboveThreshold } = getRecruitmentROI();
    
    insights.push(`Total recruitment investment: £${totalCost.toLocaleString()}`);
    insights.push(`Average cost-per-hire: £${avgCostPerHire.toLocaleString()}`);
    
    if (rolesAboveThreshold > 0) {
      insights.push(`${rolesAboveThreshold} role(s) with premium recruitment cost (>£10k) - likely senior/specialized positions`);
    }
    
    // Calculate potential retention savings
    const avgSalary = bands.reduce((sum, b) => sum + (b.minSalary + b.maxSalary) / 2, 0) / bands.length;
    const replacementCost = avgSalary * 1.5; // Industry standard: 1.5x salary
    insights.push(`\nRetention Impact: Losing one employee costs ~£${replacementCost.toLocaleString()} (1.5x avg salary)`);
    insights.push(`Retention savings potential: £${(replacementCost * bands.length * 0.1).toLocaleString()} if reducing turnover by 10%`);
    
    return insights;
  };

  // Chart Data: Visa Compliance Dashboard
  const getVisaComplianceData = () => {
    return bands.map(b => ({
      role: b.role.substring(0, 15),
      minSalary: b.minSalary,
      visaMinimum: UK_VISA_THRESHOLDS.SKILLED_WORKER_MIN,
      sponsorshipThreshold: UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE,
      goingRate: UK_VISA_THRESHOLDS.GOING_RATE_MEDIAN
    }));
  };

  // Chart Data: Total Compensation Breakdown
  const getTotalCompData = () => {
    return bands.slice(0, 5).map(b => ({
      role: b.role.substring(0, 12),
      baseSalary: (b.minSalary + b.maxSalary) / 2,
      bonus: ((b.minSalary + b.maxSalary) / 2) * (b.bonusTarget / 100),
      equity: ((b.minSalary + b.maxSalary) / 2) * (b.equity / 100) * 4
    }));
  };

  // Chart Data: Cost-per-Hire Analysis
  const getCostPerHireData = () => {
    return bands.map(b => ({
      role: b.role.substring(0, 12),
      cost: b.costPerHire,
      benchmark: 8000
    }));
  };

  // Chart Data: Equity Distribution
  const getEquityDistribution = () => {
    const ranges = [
      { range: '0-0.05%', count: bands.filter(b => b.equity < 0.05).length },
      { range: '0.05-0.15%', count: bands.filter(b => b.equity >= 0.05 && b.equity < 0.15).length },
      { range: '0.15-0.3%', count: bands.filter(b => b.equity >= 0.15 && b.equity < 0.3).length },
      { range: '0.3%+', count: bands.filter(b => b.equity >= 0.3).length }
    ];
    return ranges;
  };

  useEffect(() => {
    const s = localStorage.getItem('compensationPlanningData');
    if (s) setBands(JSON.parse(s).bands);
    const f = localStorage.getItem('compensationPlanningFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('compensationPlanningDate');
    if (d) setSavedDate(d);
  }, []);

  const visaCompliance = getVisaComplianceScore();
  const { totalCost, avgCostPerHire } = getRecruitmentROI();
  const totalBudget = bands.reduce((sum, b) => sum + (b.minSalary + b.maxSalary) / 2, 0);
  const sponsorableRoles = bands.filter(b => b.isVisaSponsorable && b.minSalary >= UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE).length;

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Compensation Planning</h1>
          <p className="text-muted-foreground mb-6">UK visa-compliant salary bands with GOV.UK threshold analysis</p>

          <ToolUtilityBar
            toolId="compensation-planning"
            toolName="Compensation Planning"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={() => ({ uploadedFiles, bands, savedDate })}
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
                <span className="text-sm font-medium">Visa Compliance</span>
              </div>
              <p className="text-3xl font-bold">{visaCompliance}%</p>
              <p className="text-xs text-muted-foreground mt-1">GOV.UK threshold adherence</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Sponsorable Roles</span>
              </div>
              <p className="text-3xl font-bold">{sponsorableRoles}/{bands.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Above £38,700 threshold</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Annual Budget</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(totalBudget / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Total salary allocation</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Avg Cost/Hire</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(avgCostPerHire / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Recruitment investment</p>
            </Card>
          </div>

          {/* PhD-Level: 4-Chart Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Visa Compliance vs UK Thresholds</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getVisaComplianceData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="minSalary" fill="#ffa536" name="Your Min Salary" />
                  <Bar dataKey="visaMinimum" fill="#ef4444" name="Visa Min (£25.6k)" />
                  <Bar dataKey="sponsorshipThreshold" fill="#f97316" name="Sponsor (£38.7k)" />
                  <Bar dataKey="goingRate" fill="#10b981" name="Going Rate (£45k)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Total Compensation Breakdown (Top 5)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getTotalCompData()} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="baseSalary" stackId="a" fill="#11b6e9" name="Base Salary" />
                  <Bar dataKey="bonus" stackId="a" fill="#ffa536" name="Bonus" />
                  <Bar dataKey="equity" stackId="a" fill="#8b5cf6" name="Equity (4yr)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Cost-per-Hire vs Benchmark</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getCostPerHireData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="cost" fill="#ffa536" name="Your Cost" />
                  <Bar dataKey="benchmark" fill="#64748b" name="Industry Benchmark" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Equity Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getEquityDistribution()} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90} label>
                    {getEquityDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
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

          {/* Compensation Bands Editor */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Compensation Bands</h3>
              <Button onClick={addBand} size="sm" data-testid="button-add-band">
                <Plus className="w-4 h-4 mr-1" /> Add Band
              </Button>
            </div>

            <div className="space-y-4">
              {bands.map((band) => {
                const visaCompliant = band.minSalary >= UK_VISA_THRESHOLDS.SKILLED_WORKER_MIN;
                const sponsorReady = band.isVisaSponsorable && band.minSalary >= UK_VISA_THRESHOLDS.SPONSORSHIP_LICENSE;
                const totalComp = getTotalCompensation(band);
                
                return (
                  <Card key={band.id} className={`p-6 border-l-4 ${visaCompliant ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <Input
                        value={band.role}
                        onChange={(e) => updateBand(band.id, 'role', e.target.value)}
                        className="font-semibold text-xl w-1/2"
                        placeholder="Role Title"
                        data-testid={`input-role-${band.id}`}
                      />
                      <div className="flex items-center gap-2">
                        {visaCompliant && <Award className="w-5 h-5 text-green-600" title="Visa Compliant" />}
                        {!visaCompliant && <AlertCircle className="w-5 h-5 text-red-600" title="Below Visa Minimum" />}
                        <Button variant="ghost" size="sm" onClick={() => removeBand(band.id)} data-testid={`button-remove-${band.id}`}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Level</label>
                        <Select value={band.level} onValueChange={(v) => updateBand(band.id, 'level', v)}>
                          <SelectTrigger data-testid={`select-level-${band.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Mid-level">Mid-level</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Min Salary (£)</label>
                        <Input
                          type="number"
                          value={band.minSalary}
                          onChange={(e) => updateBand(band.id, 'minSalary', Number(e.target.value))}
                          data-testid={`input-min-salary-${band.id}`}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Max Salary (£)</label>
                        <Input
                          type="number"
                          value={band.maxSalary}
                          onChange={(e) => updateBand(band.id, 'maxSalary', Number(e.target.value))}
                          data-testid={`input-max-salary-${band.id}`}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Equity (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={band.equity}
                          onChange={(e) => updateBand(band.id, 'equity', Number(e.target.value))}
                          data-testid={`input-equity-${band.id}`}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Bonus Target (%)</label>
                        <Input
                          type="number"
                          value={band.bonusTarget}
                          onChange={(e) => updateBand(band.id, 'bonusTarget', Number(e.target.value))}
                          data-testid={`input-bonus-${band.id}`}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Cost-per-Hire (£)</label>
                        <Input
                          type="number"
                          value={band.costPerHire}
                          onChange={(e) => updateBand(band.id, 'costPerHire', Number(e.target.value))}
                          data-testid={`input-cost-hire-${band.id}`}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground block mb-1">Visa Sponsorable Role</label>
                        <Select value={band.isVisaSponsorable ? "yes" : "no"} onValueChange={(v) => updateBand(band.id, 'isVisaSponsorable', v === "yes")}>
                          <SelectTrigger data-testid={`select-sponsorable-${band.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Live Visa Compliance Feedback */}
                    <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-md space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {visaCompliant ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                        <span>Skilled Worker Minimum (£25,600)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sponsorReady ? <span className="text-green-600">✓</span> : <span className="text-orange-600">⚠</span>}
                        <span>Sponsorship License Ready (£38,700+)</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <span className="font-medium">Total Compensation: £{totalComp.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-2">(Salary + Bonus + 4yr Equity)</span>
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
            <FileUploadButton
              onFileSelected={handleFileUpload}
              config={fileUploadConfigs.companyDocuments}
            />
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
