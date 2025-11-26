import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type EndorsingBody = 'technation' | 'innovator-international' | 'global-entrepreneurs' | 'endorsement-direct';

type RequirementCategory = {
  name: string;
  score: number;
  maxScore: number;
  requirements: {
    id: string;
    description: string;
    completed: boolean;
    critical: boolean;
  }[];
};

type EndorserRequirements = {
  [key in EndorsingBody]: {
    name: string;
    categories: RequirementCategory[];
  };
};

const ENDORSER_DATA: EndorserRequirements = {
  'technation': {
    name: 'Tech Nation',
    categories: [
      {
        name: 'Documentation Completeness',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'doc-business-plan', description: 'Comprehensive business plan with market analysis', completed: false, critical: true },
          { id: 'doc-financial-statements', description: 'Financial projections for 3 years', completed: false, critical: true },
          { id: 'doc-company-structure', description: 'Company registration and structure documentation', completed: false, critical: true },
          { id: 'doc-ip-evidence', description: 'Intellectual property documentation', completed: false, critical: false },
          { id: 'doc-team-cvs', description: 'CVs and credentials for core team members', completed: false, critical: true },
        ]
      },
      {
        name: 'Business Criteria Alignment',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'biz-scalability', description: 'Clear scalability strategy and evidence', completed: false, critical: true },
          { id: 'biz-innovation', description: 'Demonstrable innovation in product/service', completed: false, critical: true },
          { id: 'biz-market-validation', description: 'Market validation and customer traction', completed: false, critical: true },
          { id: 'biz-uk-benefit', description: 'Evidence of UK economic benefit', completed: false, critical: true },
          { id: 'biz-tech-advantage', description: 'Technical competitive advantage', completed: false, critical: false },
        ]
      },
      {
        name: 'Financial Requirements',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'fin-50k-investment', description: 'Appropriate investment funds for your business plan', completed: false, critical: true },
          { id: 'fin-source-proof', description: 'Source of funds documentation', completed: false, critical: true },
          { id: 'fin-bank-statements', description: 'Bank statements showing fund availability', completed: false, critical: true },
          { id: 'fin-budget-allocation', description: 'Detailed budget and fund allocation plan', completed: false, critical: true },
          { id: 'fin-runway', description: 'Evidence of 12+ months runway', completed: false, critical: false },
        ]
      },
      {
        name: 'Team Composition',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'team-founder-skills', description: 'Founder expertise aligned with business', completed: false, critical: true },
          { id: 'team-technical-capability', description: 'Technical team capability evidence', completed: false, critical: true },
          { id: 'team-advisory-board', description: 'Advisory board or mentors identified', completed: false, critical: false },
          { id: 'team-hiring-plan', description: 'UK hiring plan and talent strategy', completed: false, critical: true },
          { id: 'team-leadership', description: 'Proven leadership and execution track record', completed: false, critical: true },
        ]
      },
    ]
  },
  'innovator-international': {
    name: 'Innovator International',
    categories: [
      {
        name: 'Documentation Completeness',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'doc-business-plan', description: 'Detailed business plan with executive summary', completed: false, critical: true },
          { id: 'doc-pitch-deck', description: 'Professional pitch deck (10-15 slides)', completed: false, critical: true },
          { id: 'doc-financial-model', description: 'Comprehensive financial model with assumptions', completed: false, critical: true },
          { id: 'doc-legal-structure', description: 'UK company registration or incorporation plan', completed: false, critical: true },
          { id: 'doc-compliance', description: 'Regulatory compliance documentation', completed: false, critical: false },
        ]
      },
      {
        name: 'Business Criteria Alignment',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'biz-innovation-level', description: 'High innovation level with clear differentiation', completed: false, critical: true },
          { id: 'biz-market-size', description: 'Significant addressable market opportunity', completed: false, critical: true },
          { id: 'biz-growth-potential', description: 'Demonstrable high growth potential', completed: false, critical: true },
          { id: 'biz-uk-focus', description: 'UK market focus or UK as strategic base', completed: false, critical: true },
          { id: 'biz-competitive-edge', description: 'Clear competitive advantage', completed: false, critical: true },
        ]
      },
      {
        name: 'Financial Requirements',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'fin-investment-proof', description: 'Appropriate investment evidence for your plan', completed: false, critical: true },
          { id: 'fin-verification-letters', description: 'Bank verification letters for all sources', completed: false, critical: true },
          { id: 'fin-use-of-funds', description: 'Detailed use of funds breakdown', completed: false, critical: true },
          { id: 'fin-revenue-evidence', description: 'Revenue traction or pre-revenue validation', completed: false, critical: false },
          { id: 'fin-investor-commitment', description: 'Investor commitment letters if applicable', completed: false, critical: false },
        ]
      },
      {
        name: 'Team Composition',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'team-founder-background', description: 'Strong founder background and experience', completed: false, critical: true },
          { id: 'team-core-skills', description: 'Core team with complementary skills', completed: false, critical: true },
          { id: 'team-uk-connections', description: 'UK market connections or partnerships', completed: false, critical: false },
          { id: 'team-scalability-plan', description: 'Team scaling plan for UK operations', completed: false, critical: true },
          { id: 'team-track-record', description: 'Previous startup or business success', completed: false, critical: false },
        ]
      },
    ]
  },
  'global-entrepreneurs': {
    name: 'Global Entrepreneurs',
    categories: [
      {
        name: 'Documentation Completeness',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'doc-application-form', description: 'Complete endorsement application form', completed: false, critical: true },
          { id: 'doc-business-plan', description: 'Executive business plan (20-30 pages)', completed: false, critical: true },
          { id: 'doc-financials', description: 'Financial forecasts with revenue model', completed: false, critical: true },
          { id: 'doc-evidence-pack', description: 'Supporting evidence pack (traction, awards, IP)', completed: false, critical: false },
          { id: 'doc-references', description: 'Professional references and testimonials', completed: false, critical: false },
        ]
      },
      {
        name: 'Business Criteria Alignment',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'biz-genuineness', description: 'Genuine and credible business concept', completed: false, critical: true },
          { id: 'biz-innovation-proof', description: 'Innovation evidence (patents, unique tech, etc.)', completed: false, critical: true },
          { id: 'biz-scalability-evidence', description: 'Scalability evidence and growth metrics', completed: false, critical: true },
          { id: 'biz-job-creation', description: 'UK job creation potential', completed: false, critical: true },
          { id: 'biz-sustainability', description: 'Long-term business sustainability plan', completed: false, critical: false },
        ]
      },
      {
        name: 'Financial Requirements',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'fin-available-funds', description: 'Appropriate accessible investment funds', completed: false, critical: true },
          { id: 'fin-bank-verification', description: 'Bank verification of fund availability', completed: false, critical: true },
          { id: 'fin-fund-origin', description: 'Clear documentation of fund origins', completed: false, critical: true },
          { id: 'fin-financial-planning', description: 'Comprehensive financial planning', completed: false, critical: true },
          { id: 'fin-contingency', description: 'Contingency and risk mitigation funds', completed: false, critical: false },
        ]
      },
      {
        name: 'Team Composition',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'team-founder-qualifications', description: 'Founder qualifications and expertise', completed: false, critical: true },
          { id: 'team-completeness', description: 'Complete team or realistic hiring plan', completed: false, critical: true },
          { id: 'team-advisors', description: 'Industry advisors and mentors secured', completed: false, critical: false },
          { id: 'team-uk-recruitment', description: 'UK talent recruitment strategy', completed: false, critical: true },
          { id: 'team-diversity', description: 'Team diversity and inclusion approach', completed: false, critical: false },
        ]
      },
    ]
  },
  'endorsement-direct': {
    name: 'Endorsement Direct',
    categories: [
      {
        name: 'Documentation Completeness',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'doc-endorsement-form', description: 'Completed endorsement application', completed: false, critical: true },
          { id: 'doc-business-plan-full', description: 'Full business plan with all sections', completed: false, critical: true },
          { id: 'doc-financial-docs', description: 'Complete financial documentation package', completed: false, critical: true },
          { id: 'doc-supporting-evidence', description: 'Supporting evidence (media, awards, patents)', completed: false, critical: false },
          { id: 'doc-personal-statement', description: 'Personal statement and motivation letter', completed: false, critical: true },
        ]
      },
      {
        name: 'Business Criteria Alignment',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'biz-innovation-quality', description: 'High-quality innovation with evidence', completed: false, critical: true },
          { id: 'biz-viability', description: 'Business viability and market readiness', completed: false, critical: true },
          { id: 'biz-scalability-plan', description: 'Detailed scalability plan and milestones', completed: false, critical: true },
          { id: 'biz-uk-impact', description: 'Significant UK economic impact potential', completed: false, critical: true },
          { id: 'biz-differentiation', description: 'Clear market differentiation', completed: false, critical: true },
        ]
      },
      {
        name: 'Financial Requirements',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'fin-50k-evidence', description: 'Investment funding documented and verified', completed: false, critical: true },
          { id: 'fin-fund-verification', description: 'Third-party verification of funds', completed: false, critical: true },
          { id: 'fin-source-clarity', description: 'Crystal clear fund source documentation', completed: false, critical: true },
          { id: 'fin-allocation-detail', description: 'Granular fund allocation planning', completed: false, critical: true },
          { id: 'fin-additional-funding', description: 'Additional funding secured or planned', completed: false, critical: false },
        ]
      },
      {
        name: 'Team Composition',
        score: 0,
        maxScore: 25,
        requirements: [
          { id: 'team-founder-credentials', description: 'Outstanding founder credentials', completed: false, critical: true },
          { id: 'team-capability', description: 'Team capability matching business needs', completed: false, critical: true },
          { id: 'team-network', description: 'Strong professional network in UK', completed: false, critical: false },
          { id: 'team-growth-strategy', description: 'Team growth and development strategy', completed: false, critical: true },
          { id: 'team-execution', description: 'Proven execution and delivery capability', completed: false, critical: true },
        ]
      },
    ]
  }
};

export default function EndorsementReadiness() {
  const [selectedEndorser, setSelectedEndorser] = useState<EndorsingBody>('technation');
  const [categories, setCategories] = useState<RequirementCategory[]>(
    JSON.parse(JSON.stringify(ENDORSER_DATA['technation'].categories))
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  useEffect(() => {
    setCategories(JSON.parse(JSON.stringify(ENDORSER_DATA[selectedEndorser].categories)));
  }, [selectedEndorser]);

  const toggleRequirement = (categoryIndex: number, requirementId: string) => {
    const updated = [...categories];
    const requirement = updated[categoryIndex].requirements.find(r => r.id === requirementId);
    if (requirement) {
      requirement.completed = !requirement.completed;
      updateCategoryScore(updated, categoryIndex);
      setCategories(updated);
    }
  };

  const updateCategoryScore = (cats: RequirementCategory[], catIndex: number) => {
    const category = cats[catIndex];
    const totalReqs = category.requirements.length;
    const completedReqs = category.requirements.filter(r => r.completed).length;
    category.score = Math.round((completedReqs / totalReqs) * category.maxScore);
  };

  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const totalMaxScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
  const readinessPercentage = Math.round((totalScore / totalMaxScore) * 100);
  
  const criticalCompleted = categories.every(cat =>
    cat.requirements.filter(r => r.critical).every(r => r.completed)
  );
  
  const totalRequirements = categories.reduce((sum, cat) => sum + cat.requirements.length, 0);
  const completedRequirements = categories.reduce(
    (sum, cat) => sum + cat.requirements.filter(r => r.completed).length,
    0
  );

  const getReadinessLevel = () => {
    if (readinessPercentage >= 90) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' };
    if (readinessPercentage >= 75) return { label: 'Strong', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' };
    if (readinessPercentage >= 60) return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
    if (readinessPercentage >= 40) return { label: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' };
    return { label: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950' };
  };

  const readinessLevel = getReadinessLevel();

  const pieData = categories.map((cat, i) => ({
    name: cat.name,
    value: cat.score,
    fill: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i]
  }));

  const getSerializedState = () => {
    return {
      selectedEndorser,
      categories,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('selectedEndorser' in state) setSelectedEndorser(state.selectedEndorser);
    if ('categories' in state) setCategories(state.categories);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'endorsement-readiness_handoff';
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
      const saved = localStorage.getItem('endorsement-readiness-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('endorsement-readiness-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('endorsement-readiness-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (readinessPercentage < 60) {
      tips.push("Focus on completing all critical requirements first - these are essential for endorsement approval");
    }
    
    if (!criticalCompleted) {
      tips.push("Complete all critical requirements marked in red - endorsers will reject applications missing these");
    }
    
    const docCategory = categories.find(c => c.name === 'Documentation Completeness');
    if (docCategory && docCategory.score < docCategory.maxScore * 0.8) {
      tips.push("Documentation completeness is crucial - ensure all required documents are professionally prepared and up-to-date");
    }
    
    const finCategory = categories.find(c => c.name === 'Financial Requirements');
    if (finCategory && finCategory.score < finCategory.maxScore * 0.9) {
      tips.push("Financial documentation must be flawless - obtain bank verification letters and ensure all £50k is accessible");
    }
    
    const bizCategory = categories.find(c => c.name === 'Business Criteria Alignment');
    if (bizCategory && bizCategory.score < bizCategory.maxScore * 0.7) {
      tips.push("Strengthen your business case - clearly demonstrate innovation, scalability, and UK economic benefit");
    }
    
    const teamCategory = categories.find(c => c.name === 'Team Composition');
    if (teamCategory && teamCategory.score < teamCategory.maxScore * 0.7) {
      tips.push("Build a stronger team narrative - show relevant expertise, track record, and UK hiring commitment");
    }
    
    if (readinessPercentage >= 75) {
      tips.push("Strong foundation established - focus on perfecting your narrative and gathering supporting evidence");
    }
    
    if (selectedEndorser === 'technation') {
      tips.push("Tech Nation prioritizes technical innovation and scalability - emphasize your tech stack and growth metrics");
    } else if (selectedEndorser === 'innovator-international') {
      tips.push("Innovator International values comprehensive preparation - ensure every document is investor-grade quality");
    }
    
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    const plans = [
      { week: "Week 1", action: "Complete all documentation requirements - business plan, financials, company registration", priority: "Critical" },
      { week: "Week 1-2", action: "Gather financial evidence - bank statements, source of funds documentation, verification letters", priority: "Critical" },
      { week: "Week 2", action: "Strengthen business criteria alignment - market research, traction evidence, UK benefit case", priority: "High" },
      { week: "Week 2-3", action: "Build team documentation - CVs, credentials, advisory board commitments, hiring plan", priority: "High" },
      { week: "Week 3", action: "Review and refine all critical requirements with industry advisor or immigration lawyer", priority: "Critical" },
      { week: "Week 3-4", action: "Prepare supporting evidence pack - media coverage, awards, patents, customer testimonials", priority: "Medium" },
      { week: "Week 4", action: "Conduct final compliance check and quality review before submission", priority: "Critical" },
      { week: "Week 4", action: "Submit endorsement application with confidence in complete, high-quality submission", priority: "Critical" },
    ];
    
    return plans;
  };

  const handleExport = () => {
    const endorserName = ENDORSER_DATA[selectedEndorser].name;
    const report = `ENDORSEMENT READINESS ASSESSMENT
Endorsing Body: ${endorserName}
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

OVERALL READINESS
${'-'.repeat(70)}
Readiness Score: ${readinessPercentage}%
Readiness Level: ${readinessLevel.label}
Total Requirements: ${totalRequirements}
Completed: ${completedRequirements}
Remaining: ${totalRequirements - completedRequirements}
Critical Requirements Complete: ${criticalCompleted ? 'YES' : 'NO'}

CATEGORY BREAKDOWN
${'-'.repeat(70)}
${categories.map(cat => `
${cat.name}: ${cat.score}/${cat.maxScore} (${Math.round((cat.score / cat.maxScore) * 100)}%)
${cat.requirements.map(req => 
  `  ${req.completed ? '[✓]' : '[ ]'} ${req.description}${req.critical ? ' (CRITICAL)' : ''}`
).join('\n')}
`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSER-SPECIFIC NOTES: ${endorserName}
${'-'.repeat(70)}
${selectedEndorser === 'technation' ? `- Tech Nation focuses on technical innovation and scalability
- Emphasize your technology stack and competitive advantage
- Demonstrate clear market validation and growth metrics
- Show UK job creation potential in tech sector` : ''}
${selectedEndorser === 'innovator-international' ? `- Innovator International requires comprehensive documentation
- Prepare investor-grade business plan and pitch deck
- Strong emphasis on scalability and market opportunity
- UK market focus or strategic positioning critical` : ''}
${selectedEndorser === 'global-entrepreneurs' ? `- Global Entrepreneurs values genuine innovation
- Job creation and UK economic impact are key
- Long-term sustainability and growth trajectory important
- Professional references strengthen application` : ''}
${selectedEndorser === 'endorsement-direct' ? `- Endorsement Direct requires exceptional quality across all areas
- Outstanding founder credentials and team capability essential
- Clear differentiation and significant UK impact required
- Third-party verification of all claims recommended` : ''}

NEXT STEPS
${'-'.repeat(70)}
1. Address all critical requirements immediately
2. Work through 4-week action plan systematically
3. Gather supporting evidence for all claims
4. Have documents reviewed by immigration specialist
5. Submit when readiness score reaches 90%+

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `endorsement-readiness-${selectedEndorser}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-endorsement-readiness">
              Endorsement Readiness Assessment
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive readiness evaluation for endorsing body application
            </p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">
                Last saved: {savedDate}
              </p>
            )}
          </div>

          <ToolUtilityBar
            toolId="endorsement-readiness"
            toolName="Endorsement Readiness"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            onSmartTips={() => setShowTips(!showTips)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {showTips && (
            <Card className="mb-6 border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-600">Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-smart-tips">
                  {getSmartTips().map((tip, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="font-bold text-blue-600">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {showActionPlan && (
            <Card className="mb-6 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-600">4-Week Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="list-action-plan">
                  {generateActionPlan().map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="font-bold text-sm min-w-24">{item.week}</div>
                      <div className="flex-1">
                        <p className="text-sm">{item.action}</p>
                        <span className={`text-xs font-semibold ${
                          item.priority === 'Critical' ? 'text-red-600' :
                          item.priority === 'High' ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Endorsing Body</CardTitle>
              <CardDescription>Choose your target endorsing organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {(Object.keys(ENDORSER_DATA) as EndorsingBody[]).map((key) => (
                  <Button
                    key={key}
                    variant={selectedEndorser === key ? "default" : "outline"}
                    onClick={() => setSelectedEndorser(key)}
                    className="h-auto py-4"
                    data-testid={`button-endorser-${key}`}
                  >
                    {ENDORSER_DATA[key].name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-endorsement-readiness">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
              <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className={readinessPercentage >= 75 ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Readiness Score</p>
                      <p className="text-4xl font-bold" data-testid="text-readiness-score">
                        {readinessPercentage}%
                      </p>
                      <p className={`text-lg font-semibold mt-2 ${readinessLevel.color}`}>
                        {readinessLevel.label}
                      </p>
                      <Progress value={readinessPercentage} className="mt-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Requirements</p>
                      <p className="text-4xl font-bold" data-testid="text-requirements-progress">
                        {completedRequirements}/{totalRequirements}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {totalRequirements - completedRequirements} remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={criticalCompleted ? "border-green-500" : "border-red-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Critical Status</p>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {criticalCompleted ? (
                          <CheckCircle2 className="h-12 w-12 text-green-500" data-testid="icon-critical-complete" />
                        ) : (
                          <XCircle className="h-12 w-12 text-red-500" data-testid="icon-critical-incomplete" />
                        )}
                      </div>
                      <p className="text-sm font-semibold mt-2">
                        {criticalCompleted ? 'All Critical Complete' : 'Critical Items Pending'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!criticalCompleted && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have incomplete critical requirements. Endorsing bodies will reject applications missing these essential items.
                  </AlertDescription>
                </Alert>
              )}

              {readinessPercentage >= 90 && criticalCompleted && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent readiness level! You are well-prepared for endorsement application submission.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Category Scores</CardTitle>
                  <CardDescription>Performance across all assessment areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-sm font-bold" data-testid={`text-category-score-${i}`}>
                          {cat.score}/{cat.maxScore}
                        </span>
                      </div>
                      <Progress 
                        value={(cat.score / cat.maxScore) * 100} 
                        className="h-2"
                        data-testid={`progress-category-${i}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((cat, catIndex) => (
                  <Card key={catIndex}>
                    <CardHeader>
                      <CardTitle>{cat.name}</CardTitle>
                      <CardDescription>
                        Score: {cat.score}/{cat.maxScore} ({Math.round((cat.score / cat.maxScore) * 100)}%)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={(cat.score / cat.maxScore) * 100} className="mb-4" />
                      <div className="text-sm text-muted-foreground">
                        {cat.requirements.filter(r => r.completed).length} of {cat.requirements.length} complete
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              {categories.map((cat, catIndex) => (
                <Card key={catIndex}>
                  <CardHeader>
                    <CardTitle>{cat.name}</CardTitle>
                    <CardDescription>
                      {cat.requirements.filter(r => r.completed).length}/{cat.requirements.length} requirements completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cat.requirements.map((req) => (
                        <Card 
                          key={req.id} 
                          className={`p-3 cursor-pointer hover-elevate ${
                            req.critical ? 'border-l-4 border-l-red-500' : ''
                          }`}
                          onClick={() => toggleRequirement(catIndex, req.id)}
                          data-testid={`requirement-${req.id}`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={req.completed}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 cursor-pointer"
                              data-testid={`checkbox-${req.id}`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{req.description}</p>
                              {req.critical && (
                                <span className="text-xs font-semibold text-red-600">CRITICAL</span>
                              )}
                            </div>
                          </label>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Readiness Distribution</CardTitle>
                    <CardDescription>Score breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>Comparative analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categories.map(cat => ({
                        name: cat.name.split(' ')[0],
                        score: cat.score,
                        max: cat.maxScore
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 25]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#3b82f6" name="Score" />
                        <Bar dataKey="max" fill="#e5e7eb" name="Maximum" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Endorser-Specific Requirements: {ENDORSER_DATA[selectedEndorser].name}</CardTitle>
                  <CardDescription>Key focus areas for this endorsing body</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEndorser === 'technation' && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Technical Innovation Priority</p>
                            <p className="text-sm text-muted-foreground">Strong emphasis on technology stack, scalability, and competitive advantage</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Market Validation</p>
                            <p className="text-sm text-muted-foreground">Demonstrate customer traction, revenue, or strong market indicators</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">UK Tech Sector Impact</p>
                            <p className="text-sm text-muted-foreground">Show job creation potential in UK technology sector</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedEndorser === 'innovator-international' && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Comprehensive Documentation</p>
                            <p className="text-sm text-muted-foreground">Investor-grade business plan and pitch deck required</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Scalability Evidence</p>
                            <p className="text-sm text-muted-foreground">Clear path to significant growth and market expansion</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">UK Strategic Focus</p>
                            <p className="text-sm text-muted-foreground">UK market as primary focus or strategic operational base</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedEndorser === 'global-entrepreneurs' && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Genuine Innovation</p>
                            <p className="text-sm text-muted-foreground">Demonstrable innovation with patents, unique technology, or novel approach</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Job Creation Potential</p>
                            <p className="text-sm text-muted-foreground">Clear plan for UK employment and economic contribution</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Long-term Sustainability</p>
                            <p className="text-sm text-muted-foreground">Business model demonstrating long-term viability and growth</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedEndorser === 'endorsement-direct' && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Exceptional Quality Standard</p>
                            <p className="text-sm text-muted-foreground">All documentation and evidence must meet highest quality standards</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Outstanding Credentials</p>
                            <p className="text-sm text-muted-foreground">Founder and team must demonstrate exceptional expertise and track record</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Significant UK Impact</p>
                            <p className="text-sm text-muted-foreground">Must demonstrate substantial potential for UK economic benefit</p>
                          </div>
                        </div>
                      </>
                    )}
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
