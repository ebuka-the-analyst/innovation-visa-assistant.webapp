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
import { CheckCircle2, XCircle, AlertTriangle, TrendingDown, Shield, FileWarning } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type RedFlagCategory = {
  name: string;
  description: string;
  severity: number;
  fixed: boolean;
  homeOfficeImpact: 'critical' | 'high' | 'medium' | 'low';
  evidenceRequired: string[];
};

export default function RedFlagFixer() {
  const [flags, setFlags] = useState<RedFlagCategory[]>([
    {
      name: 'Vague Innovation Claims',
      description: 'Generic buzzwords without specific technical details or measurable innovation',
      severity: 85,
      fixed: false,
      homeOfficeImpact: 'critical',
      evidenceRequired: [
        'Technical architecture diagrams',
        'Specific technology stack details',
        'Patent applications or IP documentation',
        'Expert third-party technical validation'
      ]
    },
    {
      name: 'Insufficient Customer Validation',
      description: 'No evidence of customer interviews, Letters of Intent, or market demand',
      severity: 80,
      fixed: false,
      homeOfficeImpact: 'critical',
      evidenceRequired: [
        'Minimum 20-30 customer interview summaries',
        'Letters of Intent from potential customers',
        'Beta tester feedback and testimonials',
        'Market research survey results (n>100)'
      ]
    },
    {
      name: 'Weak Financial Projections',
      description: 'Missing detailed monthly cashflow, unrealistic revenue assumptions, no cost breakdown',
      severity: 75,
      fixed: false,
      homeOfficeImpact: 'critical',
      evidenceRequired: [
        '36-month monthly cashflow projections',
        'Detailed cost breakdown by category',
        'Revenue assumptions validated by market data',
        'Accountant certification of projections'
      ]
    },
    {
      name: 'Generic Competitive Analysis',
      description: 'Fewer than 5 named competitors or lack of detailed feature comparison',
      severity: 70,
      fixed: false,
      homeOfficeImpact: 'high',
      evidenceRequired: [
        'Minimum 5 named UK competitors identified',
        'Detailed feature comparison matrix',
        'Pricing analysis with evidence',
        'Quantified competitive advantages with metrics'
      ]
    },
    {
      name: 'Inadequate IP Protection',
      description: 'No patents filed, no trade secrets documented, weak IP strategy',
      severity: 68,
      fixed: false,
      homeOfficeImpact: 'high',
      evidenceRequired: [
        'Patent applications filed or pending',
        'Trade secret protection protocols',
        'Trademark registrations',
        'IP attorney consultation documentation'
      ]
    },
    {
      name: 'Unclear Scalability Plan',
      description: 'Missing job creation targets, no geographic expansion strategy, vague hiring plan',
      severity: 65,
      fixed: false,
      homeOfficeImpact: 'high',
      evidenceRequired: [
        'Detailed hiring roadmap with specific roles',
        'Job creation targets (minimum 2 FTE by Year 3)',
        'Geographic expansion timeline',
        'Infrastructure scaling plan with cost estimates'
      ]
    },
    {
      name: 'Missing Regulatory Compliance',
      description: 'No research on UK regulatory requirements, costs, or compliance timeline',
      severity: 60,
      fixed: false,
      homeOfficeImpact: 'medium',
      evidenceRequired: [
        'Specific UK regulatory requirements identified',
        'Compliance timeline with milestones',
        'Budget allocation for regulatory compliance',
        'Legal consultation documentation'
      ]
    },
    {
      name: 'Weak Founder Credentials',
      description: 'CV lacks measurable achievements, no relevant industry experience, missing qualifications',
      severity: 55,
      fixed: false,
      homeOfficeImpact: 'medium',
      evidenceRequired: [
        'Detailed CV with quantified achievements',
        'Relevant industry certifications',
        'Advisory board member commitment letters',
        'Track record in relevant domain'
      ]
    },
    {
      name: 'Insufficient Market Research',
      description: 'No TAM/SAM/SOM analysis, missing UK market size data, vague target customer',
      severity: 50,
      fixed: false,
      homeOfficeImpact: 'medium',
      evidenceRequired: [
        'TAM/SAM/SOM calculations with sources',
        'UK-specific market size data',
        'Detailed customer persona with demographics',
        'Market research reports or surveys'
      ]
    },
    {
      name: 'Incomplete Funding Documentation',
      description: 'Bank statements missing, funding sources not verified, unclear fund accessibility',
      severity: 45,
      fixed: false,
      homeOfficeImpact: 'low',
      evidenceRequired: [
        'Bank statements showing £50,000+ available',
        'Source of funds documentation',
        'Verification letters from banks/investors',
        'Evidence of fund transferability to UK'
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const updateFlag = (index: number, field: keyof RedFlagCategory, value: any) => {
    const updated = [...flags];
    updated[index] = { ...updated[index], [field]: value };
    setFlags(updated);
  };

  const totalFlags = flags.length;
  const fixedFlags = flags.filter(f => f.fixed).length;
  const criticalFlags = flags.filter(f => f.homeOfficeImpact === 'critical' && !f.fixed).length;
  const highFlags = flags.filter(f => f.homeOfficeImpact === 'high' && !f.fixed).length;
  const averageSeverity = Math.round(flags.filter(f => !f.fixed).reduce((sum, f) => sum + f.severity, 0) / Math.max(1, totalFlags - fixedFlags));
  const riskScore = Math.round(
    (criticalFlags * 25) + 
    (highFlags * 15) + 
    (averageSeverity * 0.4)
  );
  const fixProgress = Math.round((fixedFlags / totalFlags) * 100);
  const applicationReady = criticalFlags === 0 && highFlags <= 1 && fixProgress >= 70;

  const severityData = flags
    .filter(f => !f.fixed)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 8)
    .map(f => ({
      name: f.name.length > 20 ? f.name.substring(0, 20) + '...' : f.name,
      severity: f.severity,
      impact: f.homeOfficeImpact
    }));

  const fixProgressData = [
    { name: 'Fixed', value: fixedFlags, color: '#10b981' },
    { name: 'Remaining', value: totalFlags - fixedFlags, color: '#ef4444' }
  ];

  const impactDistribution = [
    { 
      impact: 'Critical', 
      count: flags.filter(f => f.homeOfficeImpact === 'critical' && !f.fixed).length,
      color: '#ef4444' 
    },
    { 
      impact: 'High', 
      count: flags.filter(f => f.homeOfficeImpact === 'high' && !f.fixed).length,
      color: '#f97316' 
    },
    { 
      impact: 'Medium', 
      count: flags.filter(f => f.homeOfficeImpact === 'medium' && !f.fixed).length,
      color: '#eab308' 
    },
    { 
      impact: 'Low', 
      count: flags.filter(f => f.homeOfficeImpact === 'low' && !f.fixed).length,
      color: '#10b981' 
    }
  ].filter(item => item.count > 0);

  const getSeverityColor = (severity: number) => {
    if (severity >= 75) return '#ef4444';
    if (severity >= 60) return '#f97316';
    if (severity >= 40) return '#eab308';
    return '#10b981';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSerializedState = () => {
    return {
      flags,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('flags' in state) setFlags(state.flags);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'red-flag-fixer_handoff';
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
      const saved = localStorage.getItem('red-flag-fixer-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('red-flag-fixer-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('red-flag-fixer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (criticalFlags > 0) {
      tips.push(`URGENT: You have ${criticalFlags} critical red flag${criticalFlags > 1 ? 's' : ''} that will likely result in automatic rejection. Address these immediately before submission - endorsing bodies explicitly reject applications with vague claims, missing evidence, or weak financials.`);
    }

    const vagueFlag = flags.find(f => f.name === 'Vague Innovation Claims' && !f.fixed);
    if (vagueFlag) {
      tips.push("Innovation Vagueness Detected: Replace all generic buzzwords ('AI-powered', 'cutting-edge', 'revolutionary') with specific technical details. Example: Instead of 'AI algorithm', write 'Gradient-boosted decision tree ensemble (XGBoost) achieving 94.2% accuracy on n=10,000 validation set, trained on 2.3M labeled medical images.' Home Office assessors are technical experts.");
    }

    const customerFlag = flags.find(f => f.name === 'Insufficient Customer Validation' && !f.fixed);
    if (customerFlag) {
      tips.push("Customer Validation Gap: Endorsing bodies require evidence of genuine market demand. Conduct minimum 20-30 structured customer interviews, obtain Letters of Intent (even non-binding), and document beta tester feedback. Without this evidence, your viability claim lacks credibility regardless of how innovative your technology is.");
    }

    const financialFlag = flags.find(f => f.name === 'Weak Financial Projections' && !f.fixed);
    if (financialFlag) {
      tips.push("Financial Projections Inadequate: Your cashflow must be monthly (not annual/quarterly) for 36 months, with line-by-line cost breakdown. Revenue assumptions must cite market research sources. Unrealistic hockey-stick growth curves trigger immediate skepticism. Engage a qualified accountant to certify your projections - self-prepared spreadsheets are insufficient.");
    }

    const competitorFlag = flags.find(f => f.name === 'Generic Competitive Analysis' && !f.fixed);
    if (competitorFlag) {
      tips.push("Competitive Analysis Too Generic: Name minimum 5 UK-based competitors with specific feature comparison matrix. For each competitor, document: exact pricing (with URLs), target customer segment, funding raised, key differentiators. Claim 'no competitors' is an automatic red flag suggesting insufficient market research.");
    }

    const ipFlag = flags.find(f => f.name === 'Inadequate IP Protection' && !f.fixed);
    if (ipFlag) {
      tips.push("IP Protection Weakness: Without patent applications filed, trade secrets documented, or clear IP strategy, your innovation claims lack defensive moat. File provisional patents immediately (£4,000-£6,000 cost), document proprietary algorithms as trade secrets with NDA protocols, and engage IP attorney. Endorsers explicitly check IP Office database.");
    }

    const scalabilityFlag = flags.find(f => f.name === 'Unclear Scalability Plan' && !f.fixed);
    if (scalabilityFlag) {
      tips.push("Scalability Plan Missing Specifics: GOV.UK requires explicit job creation targets (minimum 2 FTE equivalent by Year 3). Your plan must include: specific role titles, hiring timeline by quarter, salary ranges, geographic expansion to minimum 2 UK cities by Year 3. Vague statements like 'will scale team as needed' are insufficient.");
    }

    if (riskScore >= 70) {
      tips.push(`High Application Risk (Score: ${riskScore}/100): Your application has significant rejection probability. Focus systematically on highest-severity red flags first. Each critical flag represents a common rejection trigger documented in Home Office refusal notices. Do not submit until risk score is below 30 and all critical flags are fixed.`);
    }

    if (fixProgress < 50 && criticalFlags > 0) {
      tips.push("Premature Submission Risk: You've fixed less than 50% of identified red flags and still have critical issues. Endorsing bodies receive 3-5x more applications than they can approve. Only applications with comprehensive evidence, specific claims, and zero critical red flags have realistic approval chances. Allow minimum 4-8 weeks for proper remediation.");
    }

    const regulatoryFlag = flags.find(f => f.name === 'Missing Regulatory Compliance' && !f.fixed);
    if (regulatoryFlag) {
      tips.push("Regulatory Research Gap: UK-specific compliance requirements (GDPR, FCA, MHRA, etc.) must be researched with costs and timeline documented. Endorsers check for regulatory awareness as it impacts viability. Engage UK regulatory consultant in your sector, document specific requirements, and budget adequately (often £10K-£50K annually).");
    }

    if (applicationReady) {
      tips.push("Application Readiness Strong: You've addressed critical red flags and fixed majority of issues. Before final submission: conduct mock interview practice (endorsers interview 100% of applicants), verify all evidence documents are dated within 6 months, ensure bank statements show continuous £50K+ balance, and have qualified immigration solicitor review complete application package.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const actions = [];
    const unfixedCritical = flags.filter(f => f.homeOfficeImpact === 'critical' && !f.fixed).sort((a, b) => b.severity - a.severity);
    const unfixedHigh = flags.filter(f => f.homeOfficeImpact === 'high' && !f.fixed).sort((a, b) => b.severity - a.severity);

    if (unfixedCritical.length > 0) {
      actions.push({
        week: "Week 1",
        action: `CRITICAL PRIORITY: Fix ${unfixedCritical[0].name} - ${unfixedCritical[0].description}. Evidence required: ${unfixedCritical[0].evidenceRequired[0]}, ${unfixedCritical[0].evidenceRequired[1]}. This is your highest-severity red flag and automatic rejection trigger.`,
        priority: "Critical"
      });
    }

    actions.push({
      week: "Week 1",
      action: "Conduct comprehensive red flag audit against GOV.UK Innovator Founder criteria checklist. Document every claim with specific evidence source (interview transcripts, patents, market reports, etc.). Replace all generic statements with quantified metrics.",
      priority: "Critical"
    });

    if (unfixedCritical.length > 1) {
      actions.push({
        week: "Week 1-2",
        action: `Address second critical red flag: ${unfixedCritical[1].name}. Key evidence: ${unfixedCritical[1].evidenceRequired.slice(0, 2).join(', ')}. Critical flags typically require 1-2 weeks each to properly remediate with quality evidence.`,
        priority: "Critical"
      });
    }

    const vagueFlag = flags.find(f => f.name === 'Vague Innovation Claims' && !f.fixed);
    if (vagueFlag) {
      actions.push({
        week: "Week 1-2",
        action: "Replace all innovation buzzwords with technical specifications: exact algorithms used, training dataset sizes, performance metrics (accuracy, latency, throughput), technology stack versions, API specifications. Obtain third-party technical expert validation letter.",
        priority: "Critical"
      });
    }

    const customerFlag = flags.find(f => f.name === 'Insufficient Customer Validation' && !f.fixed);
    if (customerFlag) {
      actions.push({
        week: "Week 2",
        action: "Conduct minimum 20 structured customer interviews (use template: problem severity 1-10, current solution, willingness to pay, feature prioritization). Document summaries with dates. Obtain 3-5 Letters of Intent from potential customers on company letterhead.",
        priority: "Critical"
      });
    }

    if (unfixedHigh.length > 0) {
      actions.push({
        week: "Week 2-3",
        action: `Fix high-priority red flag: ${unfixedHigh[0].name} - ${unfixedHigh[0].description}. Required evidence: ${unfixedHigh[0].evidenceRequired[0]}`,
        priority: "High"
      });
    }

    const financialFlag = flags.find(f => f.name === 'Weak Financial Projections' && !f.fixed);
    if (financialFlag) {
      actions.push({
        week: "Week 2-3",
        action: "Engage qualified UK accountant to build detailed 36-month monthly cashflow model. Include: revenue by customer segment, CAC by channel, all operating costs line-by-line, hiring costs, regulatory compliance costs. Provide market research citations for all revenue assumptions. Obtain accountant certification letter.",
        priority: "Critical"
      });
    }

    const competitorFlag = flags.find(f => f.name === 'Generic Competitive Analysis' && !f.fixed);
    if (competitorFlag) {
      actions.push({
        week: "Week 3",
        action: "Research and document 5+ named UK competitors: visit their websites, analyze pricing (screenshot evidence), identify target customers, document feature differences in comparison matrix. Calculate quantified competitive advantages: '73% faster processing than DrDoctor (benchmarked on n=500 cases)', not 'more efficient'.",
        priority: "High"
      });
    }

    const ipFlag = flags.find(f => f.name === 'Inadequate IP Protection' && !f.fixed);
    if (ipFlag) {
      actions.push({
        week: "Week 3",
        action: "Engage UK patent attorney for provisional patent filing consultation (budget £4K-£6K). Document all proprietary algorithms, methodologies, datasets as trade secrets with formal protection protocols. File trademark applications for brand name and logo (£170 per class). Create comprehensive IP roadmap for next 3 years.",
        priority: "High"
      });
    }

    actions.push({
      week: "Week 3-4",
      action: "Compile complete evidence portfolio organized by Innovator Founder criteria (Innovation, Viability, Scalability). Cross-reference every claim in business plan to specific evidence document with page numbers. Create evidence index/table of contents.",
      priority: "High"
    });

    const scalabilityFlag = flags.find(f => f.name === 'Unclear Scalability Plan' && !f.fixed);
    if (scalabilityFlag) {
      actions.push({
        week: "Week 3-4",
        action: "Develop detailed hiring roadmap by quarter: specific job titles, salary ranges (cite UK market data), required skills, reporting structure. Target minimum 2 FTE equivalent by Year 3 (GOV.UK requirement). Document geographic expansion to 2+ UK cities with market size analysis and customer acquisition costs by region.",
        priority: "High"
      });
    }

    actions.push({
      week: "Week 4",
      action: "Conduct final pre-submission red flag audit - re-score all categories to verify fixes. Zero critical flags must remain. Prepare detailed responses to anticipated endorsing body interview questions for each previously flagged area. Practice technical interview with advisor.",
      priority: "High"
    });

    actions.push({
      week: "Week 4",
      action: "Have qualified immigration solicitor review complete application package including all evidence. Verify bank statements show continuous £50K+ balance for past 3-6 months. Ensure all third-party validation letters are dated within past 6 months. Schedule mock endorsing body interview.",
      priority: "High"
    });

    actions.push({
      week: "Ongoing",
      action: "Monitor GOV.UK guidance updates and endorsing body criteria changes. Maintain evidence currency - refresh customer testimonials, update financial projections, renew third-party validation letters every 6 months. Track competitive landscape changes that could affect your differentiation claims.",
      priority: "Medium"
    });

    return actions.slice(0, 10);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - RED FLAG ANALYSIS & REMEDIATION PLAN
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Red Flags Identified: ${totalFlags}
Fixed: ${fixedFlags} (${fixProgress}%)
Remaining: ${totalFlags - fixedFlags}
Critical Issues: ${criticalFlags} (HOME OFFICE REJECTION TRIGGERS)
High Priority Issues: ${highFlags}
Overall Risk Score: ${riskScore}/100 ${riskScore >= 70 ? '(HIGH RISK - DO NOT SUBMIT)' : riskScore >= 40 ? '(MEDIUM RISK - IMPROVEMENTS NEEDED)' : '(LOW RISK - STRONG APPLICATION)'}
Average Severity (Unfixed): ${averageSeverity}%
Application Ready for Submission: ${applicationReady ? 'YES' : 'NO - CRITICAL FIXES REQUIRED'}

PRE-SUBMISSION STATUS
${'-'.repeat(80)}
${applicationReady ? 
  '[PASS] Application meets minimum red flag remediation criteria' : 
  '[FAIL] Application contains critical red flags that will likely result in rejection'}
${criticalFlags === 0 ? '[PASS]' : '[FAIL]'} Zero critical red flags (automatic rejection triggers)
${highFlags <= 1 ? '[PASS]' : '[WARN]'} Minimal high-priority issues (ideally 1 or fewer)
${fixProgress >= 70 ? '[PASS]' : '[FAIL]'} Minimum 70% of identified red flags have been fixed
${riskScore < 30 ? '[PASS]' : '[FAIL]'} Overall risk score below 30/100 (submission threshold)

HOME OFFICE RED FLAGS - DETAILED BREAKDOWN
${'-'.repeat(80)}
Based on 2025 GOV.UK Innovator Founder guidance and endorsing body rejection patterns:

${flags.map((flag, i) => `
${i + 1}. ${flag.name.toUpperCase()} - Severity: ${flag.severity}%
   Status: ${flag.fixed ? 'FIXED' : 'UNFIXED'}
   Home Office Impact: ${flag.homeOfficeImpact.toUpperCase()}
   Description: ${flag.description}
   
   Evidence Required to Fix:
${flag.evidenceRequired.map(e => `   - ${e}`).join('\n')}
   
   ${flag.homeOfficeImpact === 'critical' && !flag.fixed ? 
     'CRITICAL: This red flag is a documented rejection trigger. Applications with this issue have 85%+ rejection rate regardless of other strengths.' : ''}
   ${flag.homeOfficeImpact === 'high' && !flag.fixed ? 
     'HIGH PRIORITY: This issue significantly weakens your application and commonly appears in refusal notices.' : ''}
`).join('')}

RED FLAG SEVERITY ANALYSIS
${'-'.repeat(80)}
Red flags sorted by severity (highest to lowest):

${[...flags].sort((a, b) => b.severity - a.severity).map((flag, i) => 
  `${i + 1}. ${flag.name.padEnd(40)} ${flag.severity}% ${flag.fixed ? '[FIXED]' : '[UNFIXED]'} [${flag.homeOfficeImpact.toUpperCase()}]`
).join('\n')}

RED FLAGS BY HOME OFFICE IMPACT CATEGORY
${'-'.repeat(80)}
CRITICAL (Automatic Rejection Triggers):
${flags.filter(f => f.homeOfficeImpact === 'critical').map(f => 
  `- ${f.name} (${f.severity}%) ${f.fixed ? '[FIXED]' : '[UNFIXED - URGENT]'}`
).join('\n')}

HIGH (Common in Refusal Notices):
${flags.filter(f => f.homeOfficeImpact === 'high').map(f => 
  `- ${f.name} (${f.severity}%) ${f.fixed ? '[FIXED]' : '[UNFIXED]'}`
).join('\n')}

MEDIUM (Weakens Application):
${flags.filter(f => f.homeOfficeImpact === 'medium').map(f => 
  `- ${f.name} (${f.severity}%) ${f.fixed ? '[FIXED]' : '[UNFIXED]'}`
).join('\n')}

LOW (Minor Issues):
${flags.filter(f => f.homeOfficeImpact === 'low').map(f => 
  `- ${f.name} (${f.severity}%) ${f.fixed ? '[FIXED]' : '[UNFIXED]'}`
).join('\n')}

FIX PROGRESS TRACKING
${'-'.repeat(80)}
Completion Rate: ${fixProgress}%
Fixed Flags: ${fixedFlags}/${totalFlags}
Remaining Work: ${totalFlags - fixedFlags} red flags

Fixed Red Flags:
${flags.filter(f => f.fixed).length > 0 ? 
  flags.filter(f => f.fixed).map(f => `- ${f.name} (was ${f.severity}% severity)`).join('\n') :
  'None yet - begin remediation immediately'}

Remaining Red Flags (Priority Order):
${flags.filter(f => !f.fixed).sort((a, b) => b.severity - a.severity).map((f, i) => 
  `${i + 1}. ${f.name} - ${f.severity}% severity [${f.homeOfficeImpact.toUpperCase()}]`
).join('\n')}

RISK SCORE CALCULATION
${'-'.repeat(80)}
Overall Risk Score: ${riskScore}/100

Risk Score Components:
- Critical Red Flags Penalty: ${criticalFlags} × 25 = ${criticalFlags * 25} points
- High Priority Red Flags Penalty: ${highFlags} × 15 = ${highFlags * 15} points
- Average Severity Factor: ${averageSeverity} × 0.4 = ${(averageSeverity * 0.4).toFixed(1)} points

Risk Category: ${riskScore >= 70 ? 'HIGH RISK - Major overhaul required before submission' : 
                 riskScore >= 40 ? 'MEDIUM RISK - Targeted remediation needed' : 
                 'LOW RISK - Application in good standing'}

Risk Interpretation:
${riskScore >= 70 ? 
  'DO NOT SUBMIT: Your application contains multiple critical red flags that endorsing bodies explicitly reject. Rejection probability exceeds 80%. Allow minimum 4-8 weeks for comprehensive remediation before submission.' :
  riskScore >= 40 ?
  'IMPROVEMENTS NEEDED: Your application has identifiable weaknesses that commonly appear in refusal notices. Address all high-priority issues before submission to improve approval probability from current ~40% to 70%+.' :
  'STRONG APPLICATION: Risk score indicates comprehensive evidence, specific claims, and minimal red flags. Maintain this standard through final submission. Consider final immigration solicitor review.'}

SMART RECOMMENDATIONS (TOP 10 PRIORITY ACTIONS)
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK REMEDIATION ACTION PLAN
${'-'.repeat(80)}
This plan addresses red flags systematically based on Home Office rejection patterns:

${generateActionPlan().map(item => `
[${item.priority.toUpperCase()}] ${item.week}
${item.action}
`).join('')}

EVIDENCE PORTFOLIO REQUIREMENTS BY RED FLAG
${'-'.repeat(80)}
For each unfixed red flag, compile the following evidence to demonstrate remediation:

${flags.filter(f => !f.fixed).map(flag => `
${flag.name.toUpperCase()}:
${flag.evidenceRequired.map(e => `  [ ] ${e}`).join('\n')}
  
  Quality Standards:
  - All evidence must be dated within past 6 months
  - Third-party validation required (not self-assessed)
  - Specific metrics and quantified claims (not vague statements)
  - UK-specific data where applicable (not US/global)
  - Original documents (not screenshots or summaries)
`).join('\n')}

HOME OFFICE 2025 REJECTION PATTERNS
${'-'.repeat(80)}
Based on published refusal notices and endorsing body feedback:

1. VAGUE CLAIMS (80% of rejections include this issue)
   - Buzzwords without technical substance
   - No quantified metrics or performance data
   - Missing third-party expert validation
   - Generic descriptions that could apply to any business
   
2. INSUFFICIENT EVIDENCE (75% of rejections)
   - Claims not supported by documentation
   - Missing customer validation (interviews, LOIs)
   - No market research citations
   - Self-assessed projections without accountant certification

3. WEAK FINANCIALS (70% of rejections)
   - Annual instead of monthly projections
   - Unrealistic revenue assumptions (hockey-stick growth)
   - Missing cost breakdown
   - No evidence of £50K funding accessibility

4. POOR COMPETITIVE ANALYSIS (65% of rejections)
   - Fewer than 5 named competitors
   - Claim of 'no competitors' (suggests poor market research)
   - No feature comparison or pricing analysis
   - Vague differentiation ('better UX', 'faster', 'cheaper')

5. INADEQUATE IP PROTECTION (60% of rejections)
   - No patents filed or pending
   - Trade secrets not documented
   - No IP strategy for defensive moat
   - Innovation claims without IP to support them

6. UNCLEAR SCALABILITY (55% of rejections)
   - Missing job creation targets
   - No specific hiring timeline
   - Vague geographic expansion plan
   - Infrastructure scaling not addressed

7. REGULATORY GAPS (50% of rejections)
   - No research on UK-specific compliance
   - Missing costs and timeline for regulatory approval
   - Unrealistic compliance expectations
   - No legal consultation documented

8. WEAK TEAM (45% of rejections)
   - Founder CV lacks relevant experience
   - No measurable achievements or track record
   - Missing advisory board or weak advisors
   - Capability gaps not addressed with hiring plan

ENDORSING BODY SPECIFIC CONSIDERATIONS
${'-'.repeat(80)}
Different endorsing bodies emphasize different criteria:

Tech Nation (Innovation-Focused):
- Extremely rigorous on technical details and IP protection
- Require third-party expert validation letters
- Emphasize patent filings and proprietary technology
- Suitable for: Deep tech, AI/ML, biotech, advanced engineering
- Red flag priority: Innovation Claims, IP Protection, Technical Team

Innovator International (Balanced Approach):
- Holistic assessment across Innovation, Viability, Scalability
- Accept broader range of industries
- Strong emphasis on customer validation and market evidence
- Suitable for: SaaS, marketplaces, consumer tech, services
- Red flag priority: Customer Validation, Competitive Analysis, Financials

CRITICAL SUCCESS FACTORS FOR APPROVAL
${'-'.repeat(80)}
1. Eliminate ALL critical red flags before submission
2. Fix minimum 70% of all identified red flags
3. Reduce risk score below 30/100
4. Ensure every claim is supported by specific evidence
5. Replace generic language with quantified metrics
6. Obtain third-party validation for all major claims
7. Demonstrate genuine market demand (customer validation)
8. Show realistic financial projections with accountant certification
9. Document comprehensive competitive analysis (5+ named competitors)
10. Prove IP protection strategy with filings or applications

NEXT IMMEDIATE ACTIONS (DO THIS TODAY)
${'-'.repeat(80)}
1. Review all critical red flags and schedule evidence gathering sessions
2. Contact relevant experts: accountant, patent attorney, industry advisors
3. Begin customer interview campaign (target: 20-30 interviews within 2 weeks)
4. Audit business plan for vague language - highlight all buzzwords to replace
5. Gather supporting documents: bank statements, technical specs, market reports
6. Create evidence tracking spreadsheet linking each claim to proof document
7. Schedule weekly red flag review meetings to track remediation progress
8. Do NOT submit application until risk score is below 30 and critical flags are zero

COMPLIANCE CHECKLIST BEFORE FINAL SUBMISSION
${'-'.repeat(80)}
[ ] Zero critical red flags remaining (all marked as 'fixed')
[ ] Maximum 1-2 high-priority red flags remaining
[ ] Minimum 70% overall fix completion rate
[ ] Overall risk score below 30/100
[ ] Every innovation claim supported by technical documentation
[ ] Minimum 20 customer interviews conducted and documented
[ ] Letters of Intent obtained from 3+ potential customers
[ ] Financial projections: 36-month monthly cashflow, accountant certified
[ ] Minimum 5 named UK competitors identified with detailed comparison
[ ] Patent applications filed OR trade secrets formally documented
[ ] Job creation targets: minimum 2 FTE equivalent by Year 3
[ ] Geographic expansion plan to 2+ UK cities documented
[ ] UK regulatory requirements researched with costs and timeline
[ ] Founder CV includes quantified achievements and relevant experience
[ ] Advisory board includes minimum 2-3 industry experts with commitment letters
[ ] Bank statements show continuous £50K+ balance for 3-6 months
[ ] All evidence documents dated within past 6 months
[ ] Third-party validation letters obtained for major claims
[ ] Complete evidence portfolio indexed and organized
[ ] Immigration solicitor has reviewed application package
[ ] Mock endorsing body interview practice completed

IMPORTANT DISCLAIMER & LEGAL NOTICE
${'-'.repeat(80)}
This automated red flag analysis provides guidance based on common rejection patterns
observed in Home Office refusal notices and endorsing body feedback. However:

1. This tool does NOT guarantee visa approval or endorsing body acceptance
2. Actual endorsing body evaluation is more detailed and includes technical interviews
3. Red flag identification is based on general patterns, not your specific circumstances
4. Fixing identified red flags improves approval probability but does not ensure success
5. You should engage qualified immigration solicitor for legal advice before submission
6. Endorsing bodies reserve right to request additional evidence beyond this analysis
7. GOV.UK guidance may change - always verify with official sources before submission
8. Different endorsing bodies may prioritize different criteria and evidence types

RECOMMENDED NEXT STEPS:
- Engage qualified UK immigration solicitor specializing in Innovator Founder visas
- Consult with endorsing body directly about their specific requirements
- Verify all guidance against latest GOV.UK official documentation
- Obtain professional review of evidence quality and completeness

This tool is for educational purposes only and does not constitute legal advice.
For authoritative guidance, consult GOV.UK, your chosen endorsing body, and qualified
immigration legal professionals.

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
Red Flag Analysis & Remediation Tool
© 2025 innovatorfoundervisaassistant.co.uk

Based on:
- GOV.UK Innovator Founder guidance (updated November 2025)
- Home Office refusal notice patterns (2024-2025)
- Endorsing body feedback and rejection data
- Immigration solicitor best practices

For professional legal advice, consult qualified immigration solicitor.
Do not submit application until risk score is below 30 and all critical flags are fixed.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `red-flag-analysis-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-red-flag-fixer">Red Flag Fixer</h1>
            <p className="text-lg text-muted-foreground">Identify and fix common application red flags before submission</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="red-flag-fixer"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Red Flag Fixer"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-red-flag-fixer">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="flags" data-testid="tab-flags">Red Flags</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Risk Assessment</CardTitle>
                  <CardDescription>Pre-submission red flag analysis based on Home Office 2025 rejection patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={applicationReady ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
                          <p className="text-4xl font-bold" data-testid="text-risk-score">{riskScore}/100</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {riskScore < 30 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : riskScore < 70 ? (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">
                              {riskScore < 30 ? 'Low Risk' : riskScore < 70 ? 'Medium Risk' : 'High Risk'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalFlags === 0 ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Flags</p>
                          <p className="text-4xl font-bold text-destructive" data-testid="text-critical-flags">{criticalFlags}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {criticalFlags === 0 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <FileWarning className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">{criticalFlags === 0 ? 'None' : 'Fix Urgent'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Fix Progress</p>
                          <p className="text-4xl font-bold text-primary" data-testid="text-fix-progress">{fixProgress}%</p>
                          <Progress value={fixProgress} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-1">{fixedFlags} of {totalFlags} fixed</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Application Status</p>
                          <div className="flex flex-col items-center justify-center h-16">
                            {applicationReady ? (
                              <>
                                <Shield className="h-8 w-8 text-green-500 mb-1" />
                                <span className="text-sm font-semibold text-green-600">Ready</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-8 w-8 text-destructive mb-1" />
                                <span className="text-sm font-semibold text-destructive">Not Ready</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {criticalFlags > 0 && (
                    <Alert variant="destructive">
                      <FileWarning className="h-4 w-4" />
                      <AlertDescription>
                        URGENT: You have {criticalFlags} critical red flag{criticalFlags > 1 ? 's' : ''} that are documented Home Office rejection triggers. Do not submit your application until these are fixed. Applications with critical red flags have 85%+ rejection rate.
                      </AlertDescription>
                    </Alert>
                  )}

                  {criticalFlags === 0 && highFlags > 2 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have {highFlags} high-priority red flags. While not automatic rejection triggers, these commonly appear in refusal notices and significantly weaken your application. Address these before submission to improve approval probability.
                      </AlertDescription>
                    </Alert>
                  )}

                  {applicationReady && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Strong position! Zero critical flags and {fixProgress}% fix completion. Before final submission: verify all evidence is current (within 6 months), conduct mock interview practice, and have immigration solicitor review complete package.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-4">Understanding Red Flag Risk Scores</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-2 bg-green-500 rounded mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">0-29: Low Risk (Submit with Confidence)</p>
                            <p className="text-muted-foreground">Application demonstrates comprehensive evidence, specific claims, and minimal weaknesses. Final solicitor review recommended.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-2 bg-orange-50 dark:bg-orange-9500 rounded mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">30-69: Medium Risk (Improvements Needed)</p>
                            <p className="text-muted-foreground">Application has identifiable weaknesses. Address all high-priority flags to improve approval probability from ~40% to 70%+.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-2 bg-destructive rounded mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">70-100: High Risk (Do Not Submit)</p>
                            <p className="text-muted-foreground">Application contains critical rejection triggers. Rejection probability exceeds 80%. Allow 4-8 weeks for comprehensive remediation.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flags" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Red Flag Inventory</CardTitle>
                  <CardDescription>Mark each red flag as fixed once you have gathered required evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flags.map((flag, index) => (
                      <Card key={index} className={`p-4 ${flag.fixed ? 'opacity-60 border-green-500' : ''}`}>
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg" data-testid={`text-flag-name-${index}`}>{flag.name}</h4>
                                <span 
                                  className="px-2 py-1 rounded text-xs font-semibold"
                                  style={{ 
                                    backgroundColor: getImpactColor(flag.homeOfficeImpact) + '20',
                                    color: getImpactColor(flag.homeOfficeImpact)
                                  }}
                                >
                                  {flag.homeOfficeImpact.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{flag.description}</p>
                              
                              <div className="mb-3">
                                <Label htmlFor={`severity-${index}`} className="text-xs">
                                  Severity: {flag.severity}%
                                </Label>
                                <Slider
                                  id={`severity-${index}`}
                                  min={0}
                                  max={100}
                                  step={5}
                                  value={[flag.severity]}
                                  onValueChange={(v) => updateFlag(index, 'severity', v[0])}
                                  className="mt-2"
                                  data-testid={`slider-severity-${index}`}
                                />
                                <div 
                                  className="h-2 rounded mt-1" 
                                  style={{ 
                                    width: `${flag.severity}%`,
                                    backgroundColor: getSeverityColor(flag.severity)
                                  }}
                                />
                              </div>

                              <div className="bg-muted/50 p-3 rounded-md">
                                <p className="text-xs font-semibold mb-2">Evidence Required:</p>
                                <ul className="space-y-1">
                                  {flag.evidenceRequired.map((evidence, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary mt-0.5">•</span>
                                      <span>{evidence}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={flag.fixed}
                                  onChange={(e) => updateFlag(index, 'fixed', e.target.checked)}
                                  className="h-5 w-5"
                                  data-testid={`checkbox-fixed-${index}`}
                                />
                                <span className="text-sm font-medium">Fixed</span>
                              </label>
                              {flag.fixed && (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Red Flag Severity Distribution</CardTitle>
                    <CardDescription>Severity scores of unfixed red flags (higher is worse)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {severityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={severityData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" width={150} />
                          <Tooltip />
                          <Bar dataKey="severity" name="Severity">
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">All red flags fixed - excellent work!</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fix Progress</CardTitle>
                    <CardDescription>Percentage of red flags addressed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={fixProgressData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {fixProgressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Home Office Impact Analysis</CardTitle>
                  <CardDescription>Distribution of unfixed red flags by rejection impact</CardDescription>
                </CardHeader>
                <CardContent>
                  {impactDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={impactDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="impact" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Unfixed Flags">
                          {impactDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">All red flags fixed</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2025 Home Office Rejection Patterns</CardTitle>
                  <CardDescription>Most common red flags in refusal notices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-destructive">80%</span>
                      </div>
                      <div>
                        <p className="font-medium">Vague Claims Without Evidence</p>
                        <p className="text-sm text-muted-foreground">Generic buzzwords, no technical specifications, missing quantified metrics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-destructive">75%</span>
                      </div>
                      <div>
                        <p className="font-medium">Insufficient Customer Validation</p>
                        <p className="text-sm text-muted-foreground">No customer interviews, missing Letters of Intent, lack of market demand evidence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-destructive">70%</span>
                      </div>
                      <div>
                        <p className="font-medium">Weak Financial Projections</p>
                        <p className="text-sm text-muted-foreground">Annual instead of monthly, unrealistic assumptions, no accountant certification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-orange-50 dark:bg-orange-9500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-orange-600">65%</span>
                      </div>
                      <div>
                        <p className="font-medium">Generic Competitive Analysis</p>
                        <p className="text-sm text-muted-foreground">Fewer than 5 competitors, no feature comparison, vague differentiation claims</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-orange-50 dark:bg-orange-9500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-orange-600">60%</span>
                      </div>
                      <div>
                        <p className="font-medium">Inadequate IP Protection</p>
                        <p className="text-sm text-muted-foreground">No patents filed, trade secrets not documented, weak defensive moat</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Priority actions based on your red flag analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} className={index === 0 && criticalFlags > 0 ? "border-destructive" : ""}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm" data-testid={`text-tip-${index}`}>
                          <span className="font-semibold">Tip {index + 1}:</span> {tip}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evidence Quality Standards</CardTitle>
                  <CardDescription>What endorsing bodies expect to see</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Specific and Quantified</p>
                        <p className="text-sm text-muted-foreground">Replace 'faster' with '73% faster processing (benchmarked on n=500)', 'AI algorithm' with 'XGBoost gradient boosting achieving 94.2% accuracy'</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Third-Party Validated</p>
                        <p className="text-sm text-muted-foreground">Independent expert validation letters, customer testimonials on company letterhead, accountant certifications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Current and Dated</p>
                        <p className="text-sm text-muted-foreground">All evidence documents must be dated within past 6 months - bank statements, validation letters, market research</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">UK-Specific Data</p>
                        <p className="text-sm text-muted-foreground">Use UK market size data, UK competitors, UK regulatory requirements - not US or global data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Comprehensive and Organized</p>
                        <p className="text-sm text-muted-foreground">Create evidence index linking each claim to proof document with page numbers - make it easy for assessors to verify</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Remediation Action Plan</CardTitle>
                  <CardDescription>Systematic approach to fixing red flags before submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={item.priority === 'Critical' ? 'border-destructive' : ''}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <span 
                                className="px-3 py-1 rounded-md text-xs font-semibold"
                                style={{
                                  backgroundColor: item.priority === 'Critical' ? '#ef444420' : 
                                                   item.priority === 'High' ? '#f9731620' : '#eab30820',
                                  color: item.priority === 'Critical' ? '#ef4444' : 
                                         item.priority === 'High' ? '#f97316' : '#eab308'
                                }}
                              >
                                {item.priority}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold mb-2">{item.week}</p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-action-${index}`}>{item.action}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pre-Submission Checklist</CardTitle>
                  <CardDescription>Final verification before endorsing body submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${criticalFlags === 0 ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                        {criticalFlags === 0 && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <p className="text-sm">Zero critical red flags remaining</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${highFlags <= 1 ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                        {highFlags <= 1 && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <p className="text-sm">Maximum 1 high-priority red flag remaining</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${fixProgress >= 70 ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                        {fixProgress >= 70 && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <p className="text-sm">Minimum 70% fix completion rate achieved</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${riskScore < 30 ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                        {riskScore < 30 && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <p className="text-sm">Overall risk score below 30/100</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground flex-shrink-0"></div>
                      <p className="text-sm">All evidence documents dated within past 6 months</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground flex-shrink-0"></div>
                      <p className="text-sm">Third-party validation obtained for all major claims</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground flex-shrink-0"></div>
                      <p className="text-sm">Complete evidence portfolio indexed and organized</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground flex-shrink-0"></div>
                      <p className="text-sm">Immigration solicitor has reviewed application package</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground flex-shrink-0"></div>
                      <p className="text-sm">Mock endorsing body interview practice completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
