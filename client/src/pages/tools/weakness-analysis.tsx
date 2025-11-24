import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingDown, Shield } from "lucide-react";
import {
  ScatterChart, Scatter, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type WeaknessCategory = {
  name: string;
  description: string;
  score: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
};

type WeaknessDetail = {
  category: string;
  issue: string;
  severity: number;
  impact: number;
};

export default function WeaknessAnalysis() {
  const [categories, setCategories] = useState<WeaknessCategory[]>([
    { name: 'Innovation Strength', description: 'Novelty and IP protection', score: 60, severity: 'medium' },
    { name: 'Market Viability', description: 'Market validation and revenue model', score: 55, severity: 'high' },
    { name: 'Technical Feasibility', description: 'Technology stack and scalability', score: 70, severity: 'low' },
    { name: 'Scalability Plan', description: 'Growth strategy and job creation', score: 50, severity: 'high' },
    { name: 'Financial Sustainability', description: 'Funding and profitability path', score: 45, severity: 'critical' },
    { name: 'Team Capability', description: 'Founder expertise and advisory board', score: 65, severity: 'medium' },
    { name: 'IP Protection', description: 'Patents, trademarks, and trade secrets', score: 40, severity: 'critical' },
    { name: 'Competitive Advantage', description: 'Differentiation and moat strength', score: 58, severity: 'high' },
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const updateCategory = (index: number, newScore: number) => {
    const updated = [...categories];
    updated[index].score = newScore;
    updated[index].severity = getSeverity(newScore);
    setCategories(updated);
  };

  const getSeverity = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (score < 50) return 'critical';
    if (score < 60) return 'high';
    if (score < 75) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  const criticalCount = categories.filter(c => c.severity === 'critical').length;
  const highCount = categories.filter(c => c.severity === 'high').length;
  const riskScore = Math.max(0, 100 - overallScore + (criticalCount * 10) + (highCount * 5));
  const applicationReadiness = overallScore >= 70 && criticalCount === 0;

  const radarData = categories.map(c => ({
    category: c.name.split(' ')[0],
    score: c.score,
    fullMark: 100
  }));

  const severityMatrix: WeaknessDetail[] = categories.map(c => ({
    category: c.name,
    issue: c.description,
    severity: c.severity === 'critical' ? 4 : c.severity === 'high' ? 3 : c.severity === 'medium' ? 2 : 1,
    impact: Math.round((100 - c.score) / 10)
  }));

  const priorityData = [...categories]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      gap: 100 - c.score,
      severity: c.severity
    }));

  const getSerializedState = () => {
    return {
      categories,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('categories' in state) setCategories(state.categories);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'weakness-analysis_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        restoreSerializedState(payload);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      const saved = localStorage.getItem('weakness-analysis-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('weakness-analysis-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('weakness-analysis-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalCount > 0) {
      tips.push("Critical Weaknesses Detected: You have " + criticalCount + " critical weakness" + (criticalCount > 1 ? "es" : "") + " scoring below 50%. These must be addressed before submission as they typically result in automatic rejection by endorsing bodies.");
    }

    const ipCategory = categories.find(c => c.name === 'IP Protection');
    if (ipCategory && ipCategory.score < 50) {
      tips.push("IP Protection Critical Gap: Without strong intellectual property protection (patents pending, trade secrets documented, proprietary technology), your innovation claims lack credibility. File provisional patents immediately and document all proprietary methodologies.");
    }

    const financialCategory = categories.find(c => c.name === 'Financial Sustainability');
    if (financialCategory && financialCategory.score < 60) {
      tips.push("Financial Model Weakness: Your financial projections and funding strategy need strengthening. Endorsing bodies require detailed 3-year cashflow, verified funding sources (minimum £50,000), and realistic revenue assumptions based on market data. Engage a qualified accountant.");
    }

    const scalabilityCategory = categories.find(c => c.name === 'Scalability Plan');
    if (scalabilityCategory && scalabilityCategory.score < 65) {
      tips.push("Scalability Plan Insufficient: GOV.UK requirements mandate clear job creation targets (minimum 2 FTE equivalent by Year 3), geographic expansion strategy, and infrastructure that scales without proportional cost increases. Develop detailed hiring roadmap.");
    }

    const competitiveCategory = categories.find(c => c.name === 'Competitive Advantage');
    if (competitiveCategory && competitiveCategory.score < 65) {
      tips.push("Weak Competitive Differentiation: Your unique value proposition and competitive moat are not sufficiently strong. Endorsers need to see clear, defensible advantages over existing UK market solutions. Conduct thorough competitive analysis and identify sustainable differentiators.");
    }

    if (overallScore < 70) {
      tips.push("Overall Readiness Below Target: Your overall application strength score of " + overallScore + "% is below the recommended 70% threshold for submission. Focus systematically on your lowest-scoring categories first to improve approval probability.");
    }

    const marketCategory = categories.find(c => c.name === 'Market Viability');
    if (marketCategory && marketCategory.score < 60) {
      tips.push("Market Validation Gap: Insufficient evidence of market demand and customer validation. Obtain letters of intent from potential customers, conduct primary market research, and demonstrate traction through pilot programs or beta testing.");
    }

    const teamCategory = categories.find(c => c.name === 'Team Capability');
    if (teamCategory && teamCategory.score < 70) {
      tips.push("Team Expertise Concerns: Founding team's experience and advisory board strength need enhancement. Recruit advisors with relevant industry experience, document founder credentials thoroughly, and consider strategic hires to fill capability gaps.");
    }

    const techCategory = categories.find(c => c.name === 'Technical Feasibility');
    if (techCategory && techCategory.score < 65) {
      tips.push("Technical Implementation Risk: Your technology stack and development plan raise feasibility concerns. Provide technical architecture diagrams, proof-of-concept demonstrations, and third-party technical validation from industry experts.");
    }

    if (highCount >= 3) {
      tips.push("Multiple High-Risk Areas: With " + highCount + " categories in high-risk territory (50-60%), your application faces significant rejection risk. Prioritize addressing these systematically using the 4-week action plan.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    const criticalItems = categories.filter(c => c.severity === 'critical').sort((a, b) => a.score - b.score);
    const highItems = categories.filter(c => c.severity === 'high').sort((a, b) => a.score - b.score);
    
    if (criticalItems.length > 0) {
      actions.push({
        week: "Week 1",
        action: "CRITICAL: Address " + criticalItems[0].name + " - " + criticalItems[0].description + ". This is your weakest area and requires immediate intervention.",
        priority: "Critical"
      });
    }

    actions.push({
      week: "Week 1",
      action: "Conduct comprehensive gap analysis across all eight assessment categories using GOV.UK Innovator Founder guidance as benchmark",
      priority: "Critical"
    });

    if (criticalItems.length > 1) {
      actions.push({
        week: "Week 1-2",
        action: "Address second critical weakness: " + criticalItems[1].name + ". Develop concrete improvement plan with measurable milestones.",
        priority: "Critical"
      });
    }

    if (highItems.length > 0) {
      actions.push({
        week: "Week 2",
        action: "Strengthen high-risk area: " + highItems[0].name + " - " + highItems[0].description + ". Gather supporting evidence and third-party validation.",
        priority: "High"
      });
    }

    actions.push({
      week: "Week 2-3",
      action: "Compile comprehensive evidence portfolio addressing all identified weaknesses - organize by category with clear documentation trail",
      priority: "High"
    });

    if (categories.find(c => c.name === 'IP Protection' && c.score < 60)) {
      actions.push({
        week: "Week 2-3",
        action: "File provisional patent applications for core innovations, document trade secrets, and develop comprehensive IP protection strategy",
        priority: "Critical"
      });
    }

    if (categories.find(c => c.name === 'Financial Sustainability' && c.score < 60)) {
      actions.push({
        week: "Week 3",
        action: "Engage qualified accountant to review and certify financial projections, verify funding sources (minimum £50k), create detailed 36-month cashflow model",
        priority: "Critical"
      });
    }

    actions.push({
      week: "Week 3",
      action: "Obtain third-party validation for all major claims - industry expert endorsements, customer testimonials, technical audits",
      priority: "High"
    });

    if (highItems.length > 1) {
      actions.push({
        week: "Week 3-4",
        action: "Address remaining high-risk weaknesses: " + highItems.slice(1, 3).map(i => i.name).join(', ') + ". Prioritize by impact on application outcome.",
        priority: "High"
      });
    }

    actions.push({
      week: "Week 4",
      action: "Conduct final pre-submission review - re-score all categories to verify improvements meet endorsing body thresholds (target: 70%+ overall, zero critical items)",
      priority: "High"
    });

    actions.push({
      week: "Week 4",
      action: "Prepare detailed responses to anticipated endorsing body questions for each identified weakness area - practice technical interview scenarios",
      priority: "Medium"
    });

    actions.push({
      week: "Ongoing",
      action: "Monitor competitive landscape and regulatory changes - update evidence portfolio to reflect latest market conditions and GOV.UK guidance",
      priority: "Medium"
    });

    return actions.slice(0, 10);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - APPLICATION WEAKNESS ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Overall Application Strength: ${overallScore}%
Risk Score: ${riskScore}/100
Application Readiness: ${applicationReadiness ? 'READY FOR SUBMISSION' : 'NOT READY - IMPROVEMENTS REQUIRED'}
Critical Weaknesses: ${criticalCount}
High-Risk Areas: ${highCount}

PRE-SUBMISSION STATUS
${'-'.repeat(80)}
${applicationReadiness ? 
  '[PASS] Application meets minimum readiness criteria for endorsing body submission' : 
  '[FAIL] Application contains critical weaknesses that must be addressed before submission'}
${criticalCount === 0 ? '[PASS]' : '[FAIL]'} Zero critical weaknesses (scoring below 50%)
${overallScore >= 70 ? '[PASS]' : '[FAIL]'} Overall strength score meets 70% recommendation threshold
${highCount <= 2 ? '[PASS]' : '[WARN]'} Limited high-risk areas (ideally 2 or fewer)

DETAILED CATEGORY ASSESSMENT
${'-'.repeat(80)}
${categories.map((c, i) => `
${i + 1}. ${c.name.toUpperCase()} - ${c.score}%
   Description: ${c.description}
   Severity Level: ${c.severity.toUpperCase()}
   Gap to Excellence: ${100 - c.score} points
   Status: ${c.score >= 75 ? 'STRONG' : c.score >= 60 ? 'ADEQUATE' : c.score >= 50 ? 'WEAK' : 'CRITICAL'}
   ${c.severity === 'critical' ? 'ACTION REQUIRED: Immediate intervention needed before submission' : ''}
   ${c.severity === 'high' ? 'PRIORITY: Address within 2 weeks' : ''}
`).join('')}

WEAKNESS SEVERITY MATRIX
${'-'.repeat(80)}
Category                          Severity    Impact    Priority
${severityMatrix.sort((a, b) => b.severity - a.severity).map(w => 
  `${w.category.padEnd(30)} ${['Low', 'Medium', 'High', 'Critical'][w.severity - 1].padEnd(10)} ${w.impact}/10      ${w.severity >= 3 ? 'HIGH' : 'MEDIUM'}`
).join('\n')}

TOP 5 PRIORITY IMPROVEMENTS
${'-'.repeat(80)}
${priorityData.map((item, i) => `
${i + 1}. ${item.name}
   Gap Score: ${item.gap} points below excellence
   Severity: ${item.severity.toUpperCase()}
   Recommendation: Focus immediate resources on closing this gap
`).join('')}

RISK ASSESSMENT BREAKDOWN
${'-'.repeat(80)}
Overall Risk Score: ${riskScore}/100
Risk Category: ${riskScore >= 70 ? 'HIGH RISK - Major revision required' : 
                 riskScore >= 40 ? 'MEDIUM RISK - Targeted improvements needed' : 
                 'LOW RISK - Minor enhancements recommended'}

Risk Factors Contributing to Score:
- Base weakness factor: ${100 - overallScore} points (from overall score)
- Critical weakness penalty: ${criticalCount * 10} points (${criticalCount} critical items × 10)
- High-risk weakness penalty: ${highCount * 5} points (${highCount} high-risk items × 5)

ENDORSING BODY COMPATIBILITY ASSESSMENT
${'-'.repeat(80)}
Tech Nation (Innovation-Heavy Focus):
  Compatibility: ${categories.find(c => c.name === 'Innovation Strength')!.score >= 70 && 
                   categories.find(c => c.name === 'IP Protection')!.score >= 65 ? 
                   'HIGH - Strong innovation profile' : 'LOW - Innovation gaps present'}
  
Innovator International (Balanced Criteria):
  Compatibility: ${overallScore >= 70 && criticalCount === 0 ? 
                   'HIGH - Well-rounded application' : 'MEDIUM - Weaknesses in key areas'}

UK University Routes (Research-Focused):
  Compatibility: ${categories.find(c => c.name === 'Technical Feasibility')!.score >= 70 ? 
                   'HIGH - Strong technical foundation' : 'MEDIUM - Technical gaps present'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK REMEDIATION ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `
[${item.priority.toUpperCase()}] ${item.week}
${item.action}
`).join('')}

EVIDENCE REQUIREMENTS BY WEAKNESS CATEGORY
${'-'.repeat(80)}
${categories.filter(c => c.score < 70).map(c => `
${c.name} (Current: ${c.score}%, Target: 75%+):
${c.name === 'Innovation Strength' ? `  - Patent applications or provisional patents filed
  - Technical specifications and architecture diagrams
  - Third-party expert validation of innovation claims
  - Competitive analysis demonstrating genuine novelty` : ''}
${c.name === 'Market Viability' ? `  - Customer letters of intent or signed contracts
  - Market research reports with TAM/SAM/SOM analysis
  - Evidence of product-market fit through pilot programs
  - Revenue projections validated by industry benchmarks` : ''}
${c.name === 'Financial Sustainability' ? `  - Detailed 36-month financial projections certified by accountant
  - Bank statements verifying minimum £50,000 investment funds
  - Clear funding roadmap with identified sources for each growth phase
  - Profitability pathway with realistic timeline` : ''}
${c.name === 'Scalability Plan' ? `  - Detailed hiring plan with specific roles and timelines
  - Job creation targets (minimum 2 FTE equivalent by Year 3)
  - Technology infrastructure scaling roadmap
  - Geographic expansion strategy with target markets` : ''}
${c.name === 'IP Protection' ? `  - Patent filing receipts or provisional patent documentation
  - Trade secret protection protocols documented
  - Trademark registrations or applications
  - IP strategy roadmap for next 3 years` : ''}
${c.name === 'Team Capability' ? `  - Founder CVs highlighting relevant industry experience
  - Advisory board member profiles and commitment letters
  - Evidence of team's track record in relevant domain
  - Organization chart with clearly defined roles` : ''}
${c.name === 'Technical Feasibility' ? `  - Technical architecture diagrams and system design documentation
  - Proof-of-concept or MVP demonstration evidence
  - Third-party technical audit or validation report
  - Development roadmap with realistic milestones` : ''}
${c.name === 'Competitive Advantage' ? `  - Detailed competitive analysis matrix
  - Evidence of sustainable competitive moat
  - Customer testimonials highlighting differentiation
  - Market positioning strategy documentation` : ''}
`).join('')}

CRITICAL SUCCESS FACTORS
${'-'.repeat(80)}
1. Eliminate All Critical Weaknesses: Any category scoring below 50% significantly increases rejection risk
2. Target 75%+ in Core Criteria: Innovation, Viability, and Scalability are weighted most heavily
3. Strong IP Foundation: Without robust IP protection, innovation claims lack credibility
4. Financial Verification: All funding sources must be documented with bank statements and audit trail
5. Third-Party Validation: Independent expert endorsements critical for borderline applications
6. Realistic Projections: Overly optimistic claims trigger detailed scrutiny and skepticism
7. Team Credibility: Founder expertise and advisor quality directly impact endorsing body confidence

NEXT IMMEDIATE ACTIONS
${'-'.repeat(80)}
1. Address all critical weaknesses (scoring below 50%) within next 7-14 days
2. Gather missing evidence documentation for highest-priority gaps
3. Engage relevant experts (accountant, patent attorney, industry advisors) immediately
4. Conduct detailed competitive analysis if not already completed
5. Schedule technical interview preparation sessions with visa advisor
6. Re-assess scores weekly to track improvement progress
7. Do NOT submit application until overall score reaches 70%+ with zero critical items

COMPLIANCE CHECKLIST BEFORE SUBMISSION
${'-'.repeat(80)}
[ ] Overall application strength score 70% or higher
[ ] Zero categories scoring below 50% (critical threshold)
[ ] Maximum 2 categories in 50-60% range (high-risk threshold)
[ ] Innovation strength validated with IP filings or expert endorsements
[ ] Financial projections certified by qualified accountant
[ ] Minimum £50,000 funding verified with bank statements
[ ] Job creation plan demonstrates minimum 2 FTE by Year 3
[ ] All major claims supported by third-party evidence
[ ] Competitive analysis demonstrates clear UK market gap
[ ] Technical feasibility validated through proof-of-concept
[ ] Team capabilities documented with relevant track record
[ ] Advisory board includes industry-recognized experts

IMPORTANT DISCLAIMER
${'-'.repeat(80)}
This automated assessment provides guidance only. Actual endorsing body evaluation
may differ based on detailed document review and technical interviews. Scores are
self-assessed and should be validated by qualified immigration advisors before
final submission. Meeting minimum thresholds does not guarantee approval.

Endorsing bodies conduct rigorous due diligence including:
- In-depth technical interviews with founders
- Independent verification of all claims and evidence
- Market analysis to confirm innovation novelty
- Financial audit of funding sources
- Background checks on team members
- Competitive landscape assessment

Recommended: Engage qualified immigration solicitor specializing in Innovator
Founder visas to review application before endorsing body submission.

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
Based on GOV.UK Innovator Founder guidance updated November 2025

For professional legal advice, consult qualified immigration solicitor.
This tool provides educational guidance only and does not constitute legal advice.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weakness-analysis-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-weakness-analysis">Application Weakness Analysis</h1>
            <p className="text-lg text-muted-foreground">Comprehensive pre-submission gap analysis and risk assessment</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="weakness-analysis"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Weakness Analysis"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-weakness-analysis">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Readiness Status</CardTitle>
                  <CardDescription>Overall strength assessment for UK Innovator Founder Visa submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={applicationReadiness ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Strength</p>
                          <p className="text-4xl font-bold" data-testid="text-overall-score">{overallScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {applicationReadiness ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">{applicationReadiness ? 'Ready' : 'Not Ready'}</span>
                          </div>
                          <Progress value={overallScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={riskScore < 40 ? "border-green-500" : riskScore < 70 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
                          <p className="text-4xl font-bold text-destructive" data-testid="text-risk-score">{riskScore}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <TrendingDown className="h-5 w-5 text-destructive" />
                            <span className="text-sm">{riskScore >= 70 ? 'High Risk' : riskScore >= 40 ? 'Medium' : 'Low Risk'}</span>
                          </div>
                          <Progress value={riskScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalCount === 0 ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Issues</p>
                          <p className="text-4xl font-bold text-destructive" data-testid="text-critical-count">{criticalCount}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {criticalCount === 0 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">{criticalCount === 0 ? 'None' : 'Action Needed'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={highCount <= 2 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">High-Risk Areas</p>
                          <p className="text-4xl font-bold text-orange-600" data-testid="text-high-count">{highCount}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {highCount <= 2 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{highCount <= 2 ? 'Acceptable' : 'Too Many'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!applicationReadiness && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your application is not ready for submission. You have {criticalCount} critical weakness{criticalCount !== 1 ? 'es' : ''} and an overall score of {overallScore}%. Address critical issues before proceeding.
                      </AlertDescription>
                    </Alert>
                  )}

                  {applicationReadiness && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Your application meets minimum readiness criteria for endorsing body submission. Review Smart Tips and Action Plan to further strengthen your case.
                      </AlertDescription>
                    </Alert>
                  )}

                  {criticalCount > 0 && (
                    <Alert variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Critical weaknesses identified: {categories.filter(c => c.severity === 'critical').map(c => c.name).join(', ')}. These areas scoring below 50% typically result in automatic rejection.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weakness Distribution - Radar Chart</CardTitle>
                  <CardDescription>Visual assessment of all eight weakness categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Radar name="Current Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      <Radar name="Target (75%)" dataKey={() => 75} stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Radar name="Minimum (50%)" dataKey={() => 50} stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Category Assessment</CardTitle>
                  <CardDescription>Rate each weakness category from 0-100% (higher is better)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categories.map((category, index) => (
                    <Card key={index} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg" data-testid={`text-category-name-${index}`}>{category.name}</h3>
                              <span 
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${getSeverityColor(category.severity)}20`,
                                  color: getSeverityColor(category.severity),
                                  border: `1px solid ${getSeverityColor(category.severity)}`
                                }}
                                data-testid={`badge-severity-${index}`}
                              >
                                {category.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-3xl font-bold" data-testid={`text-category-score-${index}`}>{category.score}%</p>
                            <p className="text-xs text-muted-foreground">Gap: {100 - category.score} pts</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <Label htmlFor={`slider-${index}`}>Strength Score</Label>
                            <span className="text-muted-foreground">0% (Critical) - 100% (Excellent)</span>
                          </div>
                          <Slider
                            id={`slider-${index}`}
                            min={0}
                            max={100}
                            step={5}
                            value={[category.score]}
                            onValueChange={(value) => updateCategory(index, value[0])}
                            className="py-4"
                            data-testid={`slider-category-${index}`}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        <Progress 
                          value={category.score} 
                          className="h-2"
                          style={{ 
                            '--progress-background': getSeverityColor(category.severity) 
                          } as React.CSSProperties}
                        />

                        {category.score < 50 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              CRITICAL: This category is significantly weak and requires urgent attention before submission.
                            </AlertDescription>
                          </Alert>
                        )}

                        {category.score >= 50 && category.score < 60 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              HIGH RISK: This area needs substantial improvement to meet endorsing body expectations.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weakness Severity Matrix</CardTitle>
                    <CardDescription>Impact vs severity assessment for prioritization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="severity" 
                          name="Severity" 
                          domain={[0, 5]}
                          label={{ value: 'Severity Level', position: 'bottom' }}
                          tick={{ fill: 'hsl(var(--foreground))' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="impact" 
                          name="Impact" 
                          domain={[0, 10]}
                          label={{ value: 'Business Impact', angle: -90, position: 'left' }}
                          tick={{ fill: 'hsl(var(--foreground))' }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card border rounded p-3 shadow-lg">
                                  <p className="font-semibold">{data.category}</p>
                                  <p className="text-sm text-muted-foreground">Severity: {['', 'Low', 'Medium', 'High', 'Critical'][data.severity]}</p>
                                  <p className="text-sm text-muted-foreground">Impact: {data.impact}/10</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Weaknesses" data={severityMatrix} fill="#3b82f6">
                          {severityMatrix.map((entry, index) => (
                            <Cell key={index} fill={getSeverityColor(['low', 'medium', 'high', 'critical'][entry.severity - 1])} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Priority Improvements</CardTitle>
                    <CardDescription>Largest gaps requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={priorityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--foreground))' }} />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="gap" name="Gap to Excellence" fill="#3b82f6">
                          {priorityData.map((entry, index) => (
                            <Cell key={index} fill={getSeverityColor(entry.severity)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Breakdown</CardTitle>
                  <CardDescription>Factors contributing to overall application risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded">
                      <span className="font-medium">Base Weakness Factor</span>
                      <span className="text-2xl font-bold">{100 - overallScore} pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-destructive/10 rounded">
                      <span className="font-medium">Critical Weakness Penalty</span>
                      <span className="text-2xl font-bold text-destructive">+{criticalCount * 10} pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded">
                      <span className="font-medium">High-Risk Weakness Penalty</span>
                      <span className="text-2xl font-bold text-orange-600">+{highCount * 5} pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded border-2 border-primary">
                      <span className="font-bold">Total Risk Score</span>
                      <span className="text-3xl font-bold text-primary">{riskScore}/100</span>
                    </div>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Risk Category: <strong>{riskScore >= 70 ? 'HIGH RISK' : riskScore >= 40 ? 'MEDIUM RISK' : 'LOW RISK'}</strong><br />
                        {riskScore >= 70 && 'Major application revision required before submission. High probability of rejection in current state.'}
                        {riskScore >= 40 && riskScore < 70 && 'Targeted improvements needed in identified weakness areas. Application viable with focused remediation.'}
                        {riskScore < 40 && 'Strong application foundation. Minor enhancements recommended for optimal approval probability.'}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered guidance based on your weakness assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} className="border-l-4" style={{ borderLeftColor: index < 3 ? '#ef4444' : '#f97316' }}>
                        <AlertDescription className="text-sm" data-testid={`tip-${index}`}>
                          <strong>Tip {index + 1}:</strong> {tip}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorsing Body Compatibility</CardTitle>
                  <CardDescription>Which endorsing bodies best match your current profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded">
                      <h3 className="font-semibold mb-2">Tech Nation (Innovation-Heavy Focus)</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={categories.find(c => c.name === 'Innovation Strength')?.score || 0} className="flex-1" />
                        <span className="text-sm font-medium">{categories.find(c => c.name === 'Innovation Strength')?.score}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(categories.find(c => c.name === 'Innovation Strength')?.score || 0) >= 70 ? 
                          'HIGH compatibility - Your innovation strength aligns well with Tech Nation requirements' :
                          'LOW compatibility - Strengthen IP protection and innovation evidence before applying'}
                      </p>
                    </div>

                    <div className="p-4 border rounded">
                      <h3 className="font-semibold mb-2">Innovator International (Balanced Criteria)</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={overallScore} className="flex-1" />
                        <span className="text-sm font-medium">{overallScore}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {overallScore >= 70 && criticalCount === 0 ? 
                          'HIGH compatibility - Well-rounded application meets balanced assessment criteria' :
                          'MEDIUM compatibility - Address critical weaknesses to improve alignment'}
                      </p>
                    </div>

                    <div className="p-4 border rounded">
                      <h3 className="font-semibold mb-2">UK University Routes (Research-Focused)</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={categories.find(c => c.name === 'Technical Feasibility')?.score || 0} className="flex-1" />
                        <span className="text-sm font-medium">{categories.find(c => c.name === 'Technical Feasibility')?.score}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(categories.find(c => c.name === 'Technical Feasibility')?.score || 0) >= 70 ? 
                          'HIGH compatibility - Strong technical foundation suits university-based routes' :
                          'MEDIUM compatibility - Strengthen technical validation and proof-of-concept'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Remediation Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to address identified weaknesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4 border-l-4" style={{ 
                        borderLeftColor: item.priority === 'Critical' ? '#ef4444' : 
                                        item.priority === 'High' ? '#f97316' : '#eab308'
                      }}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <span className="inline-block px-3 py-1 rounded text-xs font-bold text-white" style={{
                              backgroundColor: item.priority === 'Critical' ? '#ef4444' : 
                                              item.priority === 'High' ? '#f97316' : '#eab308'
                            }} data-testid={`badge-priority-${index}`}>
                              {item.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold mb-1" data-testid={`text-action-week-${index}`}>{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-action-detail-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pre-Submission Checklist</CardTitle>
                  <CardDescription>Final verification before endorsing body application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {overallScore >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Overall application strength score 70% or higher</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {criticalCount === 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Zero categories scoring below 50% (critical threshold)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {highCount <= 2 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Maximum 2 categories in 50-60% range (high-risk threshold)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.name === 'Innovation Strength')!.score >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Innovation strength validated with IP filings or expert endorsements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.name === 'Financial Sustainability')!.score >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Financial projections certified by qualified accountant</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.name === 'Scalability Plan')!.score >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Job creation plan demonstrates minimum 2 FTE by Year 3</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.name === 'IP Protection')!.score >= 60 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Strong IP protection or proprietary technology documented</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.name === 'Competitive Advantage')!.score >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm">Competitive analysis demonstrates clear UK market gap</span>
                    </div>
                  </div>

                  {applicationReadiness && (
                    <Alert className="mt-6 border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        <strong>Checklist Complete!</strong> Your application meets pre-submission readiness criteria. Proceed with endorsing body application after final document review.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!applicationReadiness && (
                    <Alert variant="destructive" className="mt-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Not Ready for Submission.</strong> Complete all checklist items above before applying to endorsing body. Current state has high rejection probability.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
