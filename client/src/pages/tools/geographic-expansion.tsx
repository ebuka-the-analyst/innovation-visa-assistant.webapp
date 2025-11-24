import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Globe, TrendingUp, Target, MapPin, Calendar } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type TargetMarket = {
  id: string;
  country: string;
  region: string;
  marketSize: string;
  marketAttractivenessScore: number;
  competitiveLandscape: string;
  regulatoryComplexity: 'low' | 'medium' | 'high';
  entryBarriers: string;
  ukRelevance: string;
};

type EntryStrategy = {
  id: string;
  market: string;
  strategyType: 'direct' | 'partnership' | 'acquisition' | 'license' | 'subsidiary';
  timeline: string;
  investmentRequired: number;
  expectedRevenue: number;
  keyPartners: string;
  riskFactors: string;
  ukJobsCreated: number;
};

type Milestone = {
  id: string;
  market: string;
  phase: string;
  quarter: string;
  description: string;
  successMetric: string;
  responsible: string;
  completed: boolean;
};

type InvestmentRequirement = {
  category: string;
  market: string;
  amount: number;
  justification: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

export default function GeographicExpansion() {
  const [activeTab, setActiveTab] = useState('markets');
  const [savedDate, setSavedDate] = useState('');

  const [targetMarkets, setTargetMarkets] = useState<TargetMarket[]>([
    {
      id: '1',
      country: '',
      region: '',
      marketSize: '',
      marketAttractivenessScore: 0,
      competitiveLandscape: '',
      regulatoryComplexity: 'medium',
      entryBarriers: '',
      ukRelevance: ''
    }
  ]);

  const [entryStrategies, setEntryStrategies] = useState<EntryStrategy[]>([
    {
      id: '1',
      market: '',
      strategyType: 'direct',
      timeline: '',
      investmentRequired: 0,
      expectedRevenue: 0,
      keyPartners: '',
      riskFactors: '',
      ukJobsCreated: 0
    }
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      market: '',
      phase: 'Research',
      quarter: 'Q1',
      description: '',
      successMetric: '',
      responsible: '',
      completed: false
    }
  ]);

  const [investmentRequirements, setInvestmentRequirements] = useState<InvestmentRequirement[]>([
    {
      category: 'Market Research',
      market: '',
      amount: 0,
      justification: '',
      priority: 'high'
    }
  ]);

  const [strategicRationale, setStrategicRationale] = useState({
    expansionObjective: '',
    ukMarketSaturation: '',
    internationalScalability: '',
    competitiveAdvantage: '',
    resourceAllocation: ''
  });

  const [ukScalabilityEvidence, setUkScalabilityEvidence] = useState({
    homeMarketSuccess: '',
    productMarketFit: '',
    replicabilityFactors: '',
    localPartnershipStrategy: '',
    culturalAdaptation: '',
    internationalTeamPlan: ''
  });

  const addTargetMarket = () => {
    setTargetMarkets([...targetMarkets, {
      id: Date.now().toString(),
      country: '',
      region: '',
      marketSize: '',
      marketAttractivenessScore: 0,
      competitiveLandscape: '',
      regulatoryComplexity: 'medium',
      entryBarriers: '',
      ukRelevance: ''
    }]);
  };

  const updateTargetMarket = (id: string, field: keyof TargetMarket, value: any) => {
    setTargetMarkets(targetMarkets.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeTargetMarket = (id: string) => {
    setTargetMarkets(targetMarkets.filter(m => m.id !== id));
  };

  const addEntryStrategy = () => {
    setEntryStrategies([...entryStrategies, {
      id: Date.now().toString(),
      market: '',
      strategyType: 'direct',
      timeline: '',
      investmentRequired: 0,
      expectedRevenue: 0,
      keyPartners: '',
      riskFactors: '',
      ukJobsCreated: 0
    }]);
  };

  const updateEntryStrategy = (id: string, field: keyof EntryStrategy, value: any) => {
    setEntryStrategies(entryStrategies.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeEntryStrategy = (id: string) => {
    setEntryStrategies(entryStrategies.filter(s => s.id !== id));
  };

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Date.now().toString(),
      market: '',
      phase: 'Research',
      quarter: 'Q1',
      description: '',
      successMetric: '',
      responsible: '',
      completed: false
    }]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const addInvestmentRequirement = () => {
    setInvestmentRequirements([...investmentRequirements, {
      category: 'Market Research',
      market: '',
      amount: 0,
      justification: '',
      priority: 'high'
    }]);
  };

  const updateInvestmentRequirement = (index: number, field: keyof InvestmentRequirement, value: any) => {
    const updated = [...investmentRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setInvestmentRequirements(updated);
  };

  const removeInvestmentRequirement = (index: number) => {
    setInvestmentRequirements(investmentRequirements.filter((_, i) => i !== index));
  };

  const calculateReadinessScore = (): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Target Markets (35 points)
    const marketFields = targetMarkets.reduce((sum, m) => {
      const filled = [
        m.country.length > 0,
        m.region.length > 0,
        m.marketSize.length > 0,
        m.marketAttractivenessScore > 0,
        m.competitiveLandscape.length > 0,
        m.entryBarriers.length > 0,
        m.ukRelevance.length > 0
      ].filter(Boolean).length;
      totalFields += 7;
      return sum + filled;
    }, 0);
    completedFields += marketFields;

    // Entry Strategies (25 points)
    const strategyFields = entryStrategies.reduce((sum, s) => {
      const filled = [
        s.market.length > 0,
        s.timeline.length > 0,
        s.investmentRequired > 0,
        s.expectedRevenue > 0,
        s.keyPartners.length > 0,
        s.riskFactors.length > 0,
        s.ukJobsCreated > 0
      ].filter(Boolean).length;
      totalFields += 7;
      return sum + filled;
    }, 0);
    completedFields += strategyFields;

    // Milestones (15 points)
    const milestoneFields = milestones.reduce((sum, m) => {
      const filled = [
        m.market.length > 0,
        m.description.length > 0,
        m.successMetric.length > 0,
        m.responsible.length > 0
      ].filter(Boolean).length;
      totalFields += 4;
      return sum + filled;
    }, 0);
    completedFields += milestoneFields;

    // Investment Requirements (10 points)
    const investmentFields = investmentRequirements.reduce((sum, i) => {
      const filled = [
        i.market.length > 0,
        i.amount > 0,
        i.justification.length > 0
      ].filter(Boolean).length;
      totalFields += 3;
      return sum + filled;
    }, 0);
    completedFields += investmentFields;

    // Strategic Rationale (10 points)
    const rationaleFields = Object.values(strategicRationale).filter(v => v.length > 0).length;
    totalFields += 5;
    completedFields += rationaleFields;

    // UK Scalability Evidence (5 points)
    const ukFields = Object.values(ukScalabilityEvidence).filter(v => v.length > 0).length;
    totalFields += 6;
    completedFields += ukFields;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const readinessScore = calculateReadinessScore();

  const getMarketAttractivenessData = () => {
    return targetMarkets
      .filter(m => m.country.length > 0 && m.marketAttractivenessScore > 0)
      .map(m => ({
        name: m.country,
        score: m.marketAttractivenessScore,
        marketSize: parseFloat(m.marketSize.replace(/[^0-9.]/g, '')) || 0
      }));
  };

  const getInvestmentByMarketData = () => {
    const marketInvestments = new Map<string, number>();
    
    investmentRequirements.forEach(req => {
      if (req.market) {
        const current = marketInvestments.get(req.market) || 0;
        marketInvestments.set(req.market, current + req.amount);
      }
    });

    return Array.from(marketInvestments.entries()).map(([market, amount]) => ({
      market,
      investment: amount
    }));
  };

  const getTimelineData = () => {
    const quarterData = new Map<string, { milestones: number; completed: number }>();
    
    milestones.forEach(m => {
      if (!quarterData.has(m.quarter)) {
        quarterData.set(m.quarter, { milestones: 0, completed: 0 });
      }
      const data = quarterData.get(m.quarter)!;
      data.milestones += 1;
      if (m.completed) data.completed += 1;
    });

    return Array.from(quarterData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([quarter, data]) => ({
        quarter,
        total: data.milestones,
        completed: data.completed,
        pending: data.milestones - data.completed
      }));
  };

  const getRevenuePotentialData = () => {
    return entryStrategies
      .filter(s => s.market.length > 0 && s.expectedRevenue > 0)
      .map(s => ({
        market: s.market,
        revenue: s.expectedRevenue,
        investment: s.investmentRequired,
        roi: s.investmentRequired > 0 ? ((s.expectedRevenue - s.investmentRequired) / s.investmentRequired * 100) : 0
      }));
  };

  const getSerializedState = () => {
    return {
      targetMarkets,
      entryStrategies,
      milestones,
      investmentRequirements,
      strategicRationale,
      ukScalabilityEvidence,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('targetMarkets' in state) setTargetMarkets(state.targetMarkets);
    if ('entryStrategies' in state) setEntryStrategies(state.entryStrategies);
    if ('milestones' in state) setMilestones(state.milestones);
    if ('investmentRequirements' in state) setInvestmentRequirements(state.investmentRequirements);
    if ('strategicRationale' in state) setStrategicRationale(state.strategicRationale);
    if ('ukScalabilityEvidence' in state) setUkScalabilityEvidence(state.ukScalabilityEvidence);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('geographic-expansion-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('geographic-expansion-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('geographic-expansion-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (readinessScore < 30) {
      tips.push("Start by identifying at least 2-3 target markets with clear market size data and attractiveness scores - this demonstrates strategic market selection to endorsing bodies");
    }

    if (targetMarkets.filter(m => m.country.length > 0).length < 2) {
      tips.push("Define multiple target markets to show diversification and reduce geographic risk - single-market expansion is seen as high-risk by UK visa assessors");
    }

    const marketsWithLowAttractiveness = targetMarkets.filter(m => m.marketAttractivenessScore > 0 && m.marketAttractivenessScore < 50);
    if (marketsWithLowAttractiveness.length > 0) {
      tips.push("Some target markets have low attractiveness scores - ensure you have strong strategic rationale or reconsider market selection to demonstrate sound business judgment");
    }

    if (ukScalabilityEvidence.homeMarketSuccess.length < 50) {
      tips.push("CRITICAL: Document your UK home market success comprehensively - international expansion must be built on proven UK traction to satisfy visa scalability criteria");
    }

    const totalInvestment = investmentRequirements.reduce((sum, r) => sum + r.amount, 0);
    const totalExpectedRevenue = entryStrategies.reduce((sum, s) => sum + s.expectedRevenue, 0);
    if (totalInvestment > 0 && totalExpectedRevenue > 0) {
      const roi = ((totalExpectedRevenue - totalInvestment) / totalInvestment) * 100;
      if (roi < 50) {
        tips.push("Your expansion investment shows modest returns - ensure financial projections are realistic and demonstrate clear path to profitability to satisfy endorsing bodies");
      }
    }

    const totalUKJobs = entryStrategies.reduce((sum, s) => sum + s.ukJobsCreated, 0);
    if (totalUKJobs < 5) {
      tips.push("CRITICAL: Geographic expansion should create UK jobs (management, coordination, support roles) - clearly articulate how international growth drives UK employment for visa compliance");
    }

    if (ukScalabilityEvidence.localPartnershipStrategy.length > 0) {
      tips.push("Strong focus on local partnerships - this reduces market entry risk and demonstrates culturally-aware international expansion strategy");
    }

    const highRiskMarkets = targetMarkets.filter(m => m.regulatoryComplexity === 'high');
    if (highRiskMarkets.length > targetMarkets.length / 2) {
      tips.push("Over half your target markets have high regulatory complexity - ensure you have dedicated compliance resources and legal expertise to manage this risk");
    }

    if (milestones.filter(m => m.description.length > 0).length < 4) {
      tips.push("Add more detailed milestones across research, pilot, launch, and scale phases - comprehensive timeline demonstrates execution capability to visa assessors");
    }

    const completedMilestones = milestones.filter(m => m.completed).length;
    if (completedMilestones > 0) {
      tips.push("Excellent - tracking milestone completion demonstrates project management discipline and increases credibility of expansion plans");
    }

    if (strategicRationale.expansionObjective.length > 100) {
      tips.push("Well-articulated expansion objectives - ensure this aligns with your overall UK business growth strategy and demonstrates scalability potential");
    }

    if (readinessScore > 70) {
      tips.push("Strong expansion plan - ensure all market data is backed by credible research sources and financial projections are conservative yet ambitious");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive market research for top 3 target markets - market size, competition, regulatory environment", priority: "Critical" },
      { week: "Week 1", action: "Document UK home market success metrics - revenue, customers, growth rate, product-market fit evidence", priority: "Critical" },
      { week: "Week 1-2", action: "Develop market attractiveness framework and score each target market systematically", priority: "High" },
      { week: "Week 2", action: "Identify potential local partners in each target market - distributors, resellers, strategic alliances", priority: "High" },
      { week: "Week 2", action: "Map regulatory requirements and compliance costs for each market", priority: "Critical" },
      { week: "Week 2-3", action: "Develop detailed entry strategy for each market - timeline, investment, resource requirements", priority: "Critical" },
      { week: "Week 3", action: "Create phased rollout plan with quarterly milestones and success metrics", priority: "High" },
      { week: "Week 3", action: "Quantify UK job creation resulting from international expansion - roles, timeline, skills", priority: "Critical" },
      { week: "Week 3-4", action: "Prepare detailed investment breakdown by market and category with ROI projections", priority: "High" },
      { week: "Week 4", action: "Compile market research, competitive analysis, and partnership documentation into evidence package", priority: "High" },
      { week: "Week 4", action: "Review expansion plan against UK Innovation Visa scalability criteria and refine as needed", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - GEOGRAPHIC EXPANSION STRATEGY
Generated: ${new Date().toLocaleString('en-GB')}
Expansion Readiness Score: ${readinessScore}%
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Target Markets: ${targetMarkets.filter(m => m.country.length > 0).length}
Total Investment Required: £${investmentRequirements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
Total Expected Revenue: £${entryStrategies.reduce((sum, s) => sum + s.expectedRevenue, 0).toLocaleString()}
Total UK Jobs Created: ${entryStrategies.reduce((sum, s) => sum + s.ukJobsCreated, 0)}
Total Milestones Defined: ${milestones.filter(m => m.description.length > 0).length}
Milestones Completed: ${milestones.filter(m => m.completed).length}

STRATEGIC RATIONALE
${'-'.repeat(80)}
Expansion Objective:
${strategicRationale.expansionObjective || '[Not Specified]'}

UK Market Saturation Analysis:
${strategicRationale.ukMarketSaturation || '[Not Specified]'}

International Scalability Thesis:
${strategicRationale.internationalScalability || '[Not Specified]'}

Competitive Advantage in International Markets:
${strategicRationale.competitiveAdvantage || '[Not Specified]'}

Resource Allocation Strategy:
${strategicRationale.resourceAllocation || '[Not Specified]'}

TARGET MARKETS ANALYSIS
${'-'.repeat(80)}
${targetMarkets.map((m, i) => `
${i + 1}. ${m.country || '[Unnamed Market]'} (${m.region || 'Region not specified'})
   Market Size: ${m.marketSize || '[Not Specified]'}
   Attractiveness Score: ${m.marketAttractivenessScore}/100
   Regulatory Complexity: ${m.regulatoryComplexity.charAt(0).toUpperCase() + m.regulatoryComplexity.slice(1)}
   
   Competitive Landscape:
   ${m.competitiveLandscape || '[Not Specified]'}
   
   Entry Barriers:
   ${m.entryBarriers || '[Not Specified]'}
   
   UK Business Relevance:
   ${m.ukRelevance || '[Not Specified]'}
`).join('\n')}

MARKET ENTRY STRATEGIES
${'-'.repeat(80)}
${entryStrategies.map((s, i) => `
${i + 1}. ${s.market || '[Unnamed Market]'}
   Strategy Type: ${s.strategyType.charAt(0).toUpperCase() + s.strategyType.slice(1)}
   Timeline: ${s.timeline || '[Not Specified]'}
   Investment Required: £${s.investmentRequired.toLocaleString()}
   Expected Revenue: £${s.expectedRevenue.toLocaleString()}
   ROI: ${s.investmentRequired > 0 ? (((s.expectedRevenue - s.investmentRequired) / s.investmentRequired * 100).toFixed(1)) : 0}%
   UK Jobs Created: ${s.ukJobsCreated}
   
   Key Partners:
   ${s.keyPartners || '[Not Specified]'}
   
   Risk Factors:
   ${s.riskFactors || '[Not Specified]'}
`).join('\n')}

PHASED ROLLOUT TIMELINE
${'-'.repeat(80)}
${milestones.map((m, i) => `
${i + 1}. ${m.market || '[Market]'} - ${m.phase} (${m.quarter})
   ${m.completed ? '[COMPLETED]' : '[PENDING]'}
   Description: ${m.description || '[Not Specified]'}
   Success Metric: ${m.successMetric || '[Not Specified]'}
   Responsible: ${m.responsible || '[Not Specified]'}
`).join('\n')}

INVESTMENT REQUIREMENTS BREAKDOWN
${'-'.repeat(80)}
${investmentRequirements.map((r, i) => `
${i + 1}. ${r.category} - ${r.market || 'All Markets'}
   Amount: £${r.amount.toLocaleString()}
   Priority: ${r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
   Justification: ${r.justification || '[Not Specified]'}
`).join('\n')}

Total Investment: £${investmentRequirements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
Critical Priority: £${investmentRequirements.filter(r => r.priority === 'critical').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
High Priority: £${investmentRequirements.filter(r => r.priority === 'high').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}

UK SCALABILITY EVIDENCE
${'-'.repeat(80)}
Home Market Success Metrics:
${ukScalabilityEvidence.homeMarketSuccess || '[Not Specified]'}

Product-Market Fit Validation:
${ukScalabilityEvidence.productMarketFit || '[Not Specified]'}

Replicability Factors:
${ukScalabilityEvidence.replicabilityFactors || '[Not Specified]'}

Local Partnership Strategy:
${ukScalabilityEvidence.localPartnershipStrategy || '[Not Specified]'}

Cultural Adaptation Plan:
${ukScalabilityEvidence.culturalAdaptation || '[Not Specified]'}

International Team Development:
${ukScalabilityEvidence.internationalTeamPlan || '[Not Specified]'}

FINANCIAL PROJECTIONS SUMMARY
${'-'.repeat(80)}
Total Investment: £${investmentRequirements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
Total Expected Revenue: £${entryStrategies.reduce((sum, s) => sum + s.expectedRevenue, 0).toLocaleString()}
Net Return: £${(entryStrategies.reduce((sum, s) => sum + s.expectedRevenue, 0) - investmentRequirements.reduce((sum, r) => sum + r.amount, 0)).toLocaleString()}
Overall ROI: ${investmentRequirements.reduce((sum, r) => sum + r.amount, 0) > 0 
  ? (((entryStrategies.reduce((sum, s) => sum + s.expectedRevenue, 0) - investmentRequirements.reduce((sum, r) => sum + r.amount, 0)) / investmentRequirements.reduce((sum, r) => sum + r.amount, 0)) * 100).toFixed(1)
  : '0'}%

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

UK INNOVATION VISA - INTERNATIONAL SCALABILITY CHECKLIST
${'-'.repeat(80)}
[ ] Clear strategic rationale for geographic expansion beyond UK market
[ ] Multiple target markets identified with market size and attractiveness data
[ ] Documented UK home market success (revenue, customers, growth metrics)
[ ] Detailed market entry strategies for each target market
[ ] Phased rollout timeline with quarterly milestones
[ ] Comprehensive investment breakdown by market and category
[ ] Financial projections showing ROI for each market
[ ] Evidence of local partnerships and market expertise
[ ] Clear demonstration of how international expansion creates UK jobs
[ ] Risk assessment and mitigation strategies for each market
[ ] Cultural adaptation and localization plans
[ ] Regulatory compliance strategy for each jurisdiction

NEXT STEPS
${'-'.repeat(80)}
1. Validate market size data with credible third-party research sources
2. Conduct customer discovery interviews in target markets
3. Identify and reach out to potential local partners
4. Develop detailed competitive analysis for each target market
5. Create financial model with conservative, base, and optimistic scenarios
6. Document UK organizational structure supporting international expansion
7. Prepare evidence of product-market fit transferability
8. Align expansion strategy with endorsing body scalability requirements
9. Have strategy reviewed by international business advisor
10. Compile all market research and partnership documentation

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This geographic expansion strategy is for planning purposes only. 
Consult with international business advisors and immigration specialists before 
executing expansion plans or submitting visa applications.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geographic-expansion-strategy-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-geographic-expansion">Geographic Expansion Planner</h1>
            <p className="text-lg text-muted-foreground">International market entry strategy and scalability evidence for UK visa compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="geographic-expansion"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            onSmartTips={() => setActiveTab('tips')}
            onActionPlan={() => setActiveTab('action')}
            getSerializedState={getSerializedState}
            toolName="Geographic Expansion Planner"
          />

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Expansion Readiness Score</h3>
                    <p className="text-sm text-muted-foreground">Complete all sections for comprehensive international expansion strategy</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" data-testid="text-readiness-score">{readinessScore}%</p>
                  </div>
                </div>
                <Progress value={readinessScore} className="h-3" data-testid="progress-readiness" />
                
                {readinessScore < 50 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your expansion plan needs more detail. Define target markets, entry strategies, and demonstrate UK scalability.
                    </AlertDescription>
                  </Alert>
                )}
                
                {readinessScore >= 80 && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Excellent expansion strategy! Ensure all market data is backed by credible research and financial projections are realistic.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-geographic-expansion">
              <TabsTrigger value="markets" data-testid="tab-markets">Markets</TabsTrigger>
              <TabsTrigger value="strategy" data-testid="tab-strategy">Strategy</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="markets" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle>Target Markets Analysis</CardTitle>
                  </div>
                  <CardDescription>Identify and assess international markets for expansion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addTargetMarket} size="sm" data-testid="button-add-market">
                    Add Target Market
                  </Button>

                  {targetMarkets.map((market) => (
                    <Card key={market.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`country-${market.id}`}>Country</Label>
                            <Input
                              id={`country-${market.id}`}
                              value={market.country}
                              onChange={(e) => updateTargetMarket(market.id, 'country', e.target.value)}
                              placeholder="e.g., Germany, United States"
                              data-testid={`input-country-${market.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`region-${market.id}`}>Region</Label>
                            <Input
                              id={`region-${market.id}`}
                              value={market.region}
                              onChange={(e) => updateTargetMarket(market.id, 'region', e.target.value)}
                              placeholder="e.g., Western Europe, North America"
                              data-testid={`input-region-${market.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`market-size-${market.id}`}>Market Size</Label>
                            <Input
                              id={`market-size-${market.id}`}
                              value={market.marketSize}
                              onChange={(e) => updateTargetMarket(market.id, 'marketSize', e.target.value)}
                              placeholder="e.g., £50M TAM"
                              data-testid={`input-market-size-${market.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`attractiveness-${market.id}`}>Market Attractiveness Score (0-100)</Label>
                            <Input
                              id={`attractiveness-${market.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={market.marketAttractivenessScore || ''}
                              onChange={(e) => updateTargetMarket(market.id, 'marketAttractivenessScore', parseInt(e.target.value) || 0)}
                              placeholder="70"
                              data-testid={`input-attractiveness-${market.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`regulatory-${market.id}`}>Regulatory Complexity</Label>
                            <select
                              id={`regulatory-${market.id}`}
                              value={market.regulatoryComplexity}
                              onChange={(e) => updateTargetMarket(market.id, 'regulatoryComplexity', e.target.value as 'low' | 'medium' | 'high')}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-regulatory-${market.id}`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`competitive-${market.id}`}>Competitive Landscape</Label>
                          <Textarea
                            id={`competitive-${market.id}`}
                            value={market.competitiveLandscape}
                            onChange={(e) => updateTargetMarket(market.id, 'competitiveLandscape', e.target.value)}
                            placeholder="Describe key competitors, market dynamics, and competitive positioning"
                            rows={2}
                            data-testid={`textarea-competitive-${market.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`barriers-${market.id}`}>Entry Barriers</Label>
                          <Textarea
                            id={`barriers-${market.id}`}
                            value={market.entryBarriers}
                            onChange={(e) => updateTargetMarket(market.id, 'entryBarriers', e.target.value)}
                            placeholder="List regulatory, cultural, competitive, or financial barriers to entry"
                            rows={2}
                            data-testid={`textarea-barriers-${market.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`uk-relevance-${market.id}`}>UK Business Relevance</Label>
                          <Textarea
                            id={`uk-relevance-${market.id}`}
                            value={market.ukRelevance}
                            onChange={(e) => updateTargetMarket(market.id, 'ukRelevance', e.target.value)}
                            placeholder="Explain how this market expansion benefits UK operations, creates UK jobs, or leverages UK advantages"
                            rows={2}
                            data-testid={`textarea-uk-relevance-${market.id}`}
                          />
                        </div>

                        {targetMarkets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTargetMarket(market.id)}
                            data-testid={`button-remove-market-${market.id}`}
                          >
                            Remove Market
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Rationale</CardTitle>
                  <CardDescription>Explain the strategic basis for international expansion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="expansion-objective">Expansion Objective</Label>
                    <Textarea
                      id="expansion-objective"
                      value={strategicRationale.expansionObjective}
                      onChange={(e) => setStrategicRationale({ ...strategicRationale, expansionObjective: e.target.value })}
                      placeholder="What are the primary objectives of geographic expansion? (e.g., revenue growth, market diversification, competitive positioning)"
                      rows={3}
                      data-testid="textarea-expansion-objective"
                    />
                  </div>

                  <div>
                    <Label htmlFor="uk-saturation">UK Market Saturation Analysis</Label>
                    <Textarea
                      id="uk-saturation"
                      value={strategicRationale.ukMarketSaturation}
                      onChange={(e) => setStrategicRationale({ ...strategicRationale, ukMarketSaturation: e.target.value })}
                      placeholder="Explain UK market penetration and why international expansion is necessary for continued growth"
                      rows={3}
                      data-testid="textarea-uk-saturation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="intl-scalability">International Scalability Thesis</Label>
                    <Textarea
                      id="intl-scalability"
                      value={strategicRationale.internationalScalability}
                      onChange={(e) => setStrategicRationale({ ...strategicRationale, internationalScalability: e.target.value })}
                      placeholder="Why is your business model replicable across international markets? What proof do you have?"
                      rows={3}
                      data-testid="textarea-intl-scalability"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitive-advantage">Competitive Advantage</Label>
                    <Textarea
                      id="competitive-advantage"
                      value={strategicRationale.competitiveAdvantage}
                      onChange={(e) => setStrategicRationale({ ...strategicRationale, competitiveAdvantage: e.target.value })}
                      placeholder="What unique advantages does your business have in international markets?"
                      rows={3}
                      data-testid="textarea-competitive-advantage"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resource-allocation">Resource Allocation Strategy</Label>
                    <Textarea
                      id="resource-allocation"
                      value={strategicRationale.resourceAllocation}
                      onChange={(e) => setStrategicRationale({ ...strategicRationale, resourceAllocation: e.target.value })}
                      placeholder="How will resources be allocated between UK and international markets?"
                      rows={3}
                      data-testid="textarea-resource-allocation"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle>Market Entry Strategies</CardTitle>
                  </div>
                  <CardDescription>Define your approach to entering each target market</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addEntryStrategy} size="sm" data-testid="button-add-strategy">
                    Add Entry Strategy
                  </Button>

                  {entryStrategies.map((strategy) => (
                    <Card key={strategy.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`strategy-market-${strategy.id}`}>Target Market</Label>
                            <Input
                              id={`strategy-market-${strategy.id}`}
                              value={strategy.market}
                              onChange={(e) => updateEntryStrategy(strategy.id, 'market', e.target.value)}
                              placeholder="e.g., Germany"
                              data-testid={`input-strategy-market-${strategy.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`strategy-type-${strategy.id}`}>Entry Strategy Type</Label>
                            <select
                              id={`strategy-type-${strategy.id}`}
                              value={strategy.strategyType}
                              onChange={(e) => updateEntryStrategy(strategy.id, 'strategyType', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-strategy-type-${strategy.id}`}
                            >
                              <option value="direct">Direct Sales</option>
                              <option value="partnership">Partnership/Distribution</option>
                              <option value="acquisition">Acquisition</option>
                              <option value="license">Licensing</option>
                              <option value="subsidiary">Local Subsidiary</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`timeline-${strategy.id}`}>Timeline</Label>
                            <Input
                              id={`timeline-${strategy.id}`}
                              value={strategy.timeline}
                              onChange={(e) => updateEntryStrategy(strategy.id, 'timeline', e.target.value)}
                              placeholder="e.g., Q2 2025 - Q4 2025"
                              data-testid={`input-timeline-${strategy.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`investment-${strategy.id}`}>Investment Required (£)</Label>
                            <Input
                              id={`investment-${strategy.id}`}
                              type="number"
                              value={strategy.investmentRequired || ''}
                              onChange={(e) => updateEntryStrategy(strategy.id, 'investmentRequired', parseFloat(e.target.value) || 0)}
                              placeholder="50000"
                              data-testid={`input-investment-${strategy.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`revenue-${strategy.id}`}>Expected Revenue (£)</Label>
                            <Input
                              id={`revenue-${strategy.id}`}
                              type="number"
                              value={strategy.expectedRevenue || ''}
                              onChange={(e) => updateEntryStrategy(strategy.id, 'expectedRevenue', parseFloat(e.target.value) || 0)}
                              placeholder="150000"
                              data-testid={`input-revenue-${strategy.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`uk-jobs-${strategy.id}`}>UK Jobs Created</Label>
                            <Input
                              id={`uk-jobs-${strategy.id}`}
                              type="number"
                              value={strategy.ukJobsCreated || ''}
                              onChange={(e) => updateEntryStrategy(strategy.id, 'ukJobsCreated', parseInt(e.target.value) || 0)}
                              placeholder="3"
                              data-testid={`input-uk-jobs-${strategy.id}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`partners-${strategy.id}`}>Key Partners</Label>
                          <Textarea
                            id={`partners-${strategy.id}`}
                            value={strategy.keyPartners}
                            onChange={(e) => updateEntryStrategy(strategy.id, 'keyPartners', e.target.value)}
                            placeholder="List key partners, distributors, or collaborators for this market"
                            rows={2}
                            data-testid={`textarea-partners-${strategy.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`risks-${strategy.id}`}>Risk Factors and Mitigation</Label>
                          <Textarea
                            id={`risks-${strategy.id}`}
                            value={strategy.riskFactors}
                            onChange={(e) => updateEntryStrategy(strategy.id, 'riskFactors', e.target.value)}
                            placeholder="Identify key risks (regulatory, competitive, financial) and mitigation strategies"
                            rows={2}
                            data-testid={`textarea-risks-${strategy.id}`}
                          />
                        </div>

                        {entryStrategies.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntryStrategy(strategy.id)}
                            data-testid={`button-remove-strategy-${strategy.id}`}
                          >
                            Remove Strategy
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Requirements</CardTitle>
                  <CardDescription>Break down investment needs by category and market</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addInvestmentRequirement} size="sm" data-testid="button-add-investment">
                    Add Investment Requirement
                  </Button>

                  {investmentRequirements.map((req, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`inv-category-${index}`}>Category</Label>
                          <select
                            id={`inv-category-${index}`}
                            value={req.category}
                            onChange={(e) => updateInvestmentRequirement(index, 'category', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-inv-category-${index}`}
                          >
                            <option value="Market Research">Market Research</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales & Distribution">Sales & Distribution</option>
                            <option value="Legal & Compliance">Legal & Compliance</option>
                            <option value="Technology">Technology</option>
                            <option value="Operations">Operations</option>
                            <option value="Personnel">Personnel</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`inv-market-${index}`}>Market</Label>
                          <Input
                            id={`inv-market-${index}`}
                            value={req.market}
                            onChange={(e) => updateInvestmentRequirement(index, 'market', e.target.value)}
                            placeholder="e.g., Germany"
                            data-testid={`input-inv-market-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inv-amount-${index}`}>Amount (£)</Label>
                          <Input
                            id={`inv-amount-${index}`}
                            type="number"
                            value={req.amount || ''}
                            onChange={(e) => updateInvestmentRequirement(index, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="10000"
                            data-testid={`input-inv-amount-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inv-priority-${index}`}>Priority</Label>
                          <select
                            id={`inv-priority-${index}`}
                            value={req.priority}
                            onChange={(e) => updateInvestmentRequirement(index, 'priority', e.target.value as any)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-inv-priority-${index}`}
                          >
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div className="md:col-span-4">
                          <Label htmlFor={`inv-justification-${index}`}>Justification</Label>
                          <Textarea
                            id={`inv-justification-${index}`}
                            value={req.justification}
                            onChange={(e) => updateInvestmentRequirement(index, 'justification', e.target.value)}
                            placeholder="Explain why this investment is necessary"
                            rows={2}
                            data-testid={`textarea-inv-justification-${index}`}
                          />
                        </div>
                      </div>
                      {investmentRequirements.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvestmentRequirement(index)}
                          className="mt-2"
                          data-testid={`button-remove-investment-${index}`}
                        >
                          Remove
                        </Button>
                      )}
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Scalability Evidence</CardTitle>
                  <CardDescription>Critical for visa approval - demonstrate UK-based scalability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="home-market-success">UK Home Market Success Metrics</Label>
                    <Textarea
                      id="home-market-success"
                      value={ukScalabilityEvidence.homeMarketSuccess}
                      onChange={(e) => setUkScalabilityEvidence({ ...ukScalabilityEvidence, homeMarketSuccess: e.target.value })}
                      placeholder="Document UK revenue, customer count, growth rate, market share - concrete evidence of UK traction"
                      rows={3}
                      data-testid="textarea-home-market-success"
                    />
                  </div>

                  <div>
                    <Label htmlFor="product-market-fit">Product-Market Fit Validation</Label>
                    <Textarea
                      id="product-market-fit"
                      value={ukScalabilityEvidence.productMarketFit}
                      onChange={(e) => setUkScalabilityEvidence({ ...ukScalabilityEvidence, productMarketFit: e.target.value })}
                      placeholder="Evidence that your product/service has achieved strong market fit in UK (retention, NPS, testimonials)"
                      rows={3}
                      data-testid="textarea-product-market-fit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="replicability">Replicability Factors</Label>
                    <Textarea
                      id="replicability"
                      value={ukScalabilityEvidence.replicabilityFactors}
                      onChange={(e) => setUkScalabilityEvidence({ ...ukScalabilityEvidence, replicabilityFactors: e.target.value })}
                      placeholder="What aspects of your UK success can be replicated internationally? (technology, processes, brand)"
                      rows={3}
                      data-testid="textarea-replicability"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partnership-strategy">Local Partnership Strategy</Label>
                    <Textarea
                      id="partnership-strategy"
                      value={ukScalabilityEvidence.localPartnershipStrategy}
                      onChange={(e) => setUkScalabilityEvidence({ ...ukScalabilityEvidence, localPartnershipStrategy: e.target.value })}
                      placeholder="How will you leverage local partners to reduce risk and accelerate market entry?"
                      rows={3}
                      data-testid="textarea-partnership-strategy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cultural-adaptation">Cultural Adaptation Plan</Label>
                    <Textarea
                      id="cultural-adaptation"
                      value={ukScalabilityEvidence.culturalAdaptation}
                      onChange={(e) => setUkScalabilityEvidence({ ...ukScalabilityEvidence, culturalAdaptation: e.target.value })}
                      placeholder="How will product, marketing, and operations be adapted for local markets?"
                      rows={3}
                      data-testid="textarea-cultural-adaptation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="team-plan">International Team Development</Label>
                    <Textarea
                      id="team-plan"
                      value={ukScalabilityEvidence.internationalTeamPlan}
                      onChange={(e) => setUkScalabilityEvidence({ ...ukScalabilityEvidence, internationalTeamPlan: e.target.value })}
                      placeholder="How will you build teams to support international operations? Include UK roles created."
                      rows={3}
                      data-testid="textarea-team-plan"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Phased Rollout Timeline</CardTitle>
                  </div>
                  <CardDescription>Define quarterly milestones for market entry execution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addMilestone} size="sm" data-testid="button-add-milestone">
                    Add Milestone
                  </Button>

                  {milestones.map((milestone) => (
                    <Card key={milestone.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`milestone-market-${milestone.id}`}>Market</Label>
                            <Input
                              id={`milestone-market-${milestone.id}`}
                              value={milestone.market}
                              onChange={(e) => updateMilestone(milestone.id, 'market', e.target.value)}
                              placeholder="e.g., Germany"
                              data-testid={`input-milestone-market-${milestone.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phase-${milestone.id}`}>Phase</Label>
                            <select
                              id={`phase-${milestone.id}`}
                              value={milestone.phase}
                              onChange={(e) => updateMilestone(milestone.id, 'phase', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-phase-${milestone.id}`}
                            >
                              <option value="Research">Research</option>
                              <option value="Pilot">Pilot</option>
                              <option value="Launch">Launch</option>
                              <option value="Scale">Scale</option>
                              <option value="Optimize">Optimize</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`quarter-${milestone.id}`}>Quarter</Label>
                            <select
                              id={`quarter-${milestone.id}`}
                              value={milestone.quarter}
                              onChange={(e) => updateMilestone(milestone.id, 'quarter', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-quarter-${milestone.id}`}
                            >
                              <option value="Q1">Q1</option>
                              <option value="Q2">Q2</option>
                              <option value="Q3">Q3</option>
                              <option value="Q4">Q4</option>
                              <option value="Q1 Y2">Q1 Y2</option>
                              <option value="Q2 Y2">Q2 Y2</option>
                              <option value="Q3 Y2">Q3 Y2</option>
                              <option value="Q4 Y2">Q4 Y2</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer h-9">
                              <input
                                type="checkbox"
                                checked={milestone.completed}
                                onChange={(e) => updateMilestone(milestone.id, 'completed', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-completed-${milestone.id}`}
                              />
                              <span className="text-sm">Completed</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${milestone.id}`}>Description</Label>
                          <Textarea
                            id={`description-${milestone.id}`}
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                            placeholder="What will be accomplished in this milestone?"
                            rows={2}
                            data-testid={`textarea-description-${milestone.id}`}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`success-metric-${milestone.id}`}>Success Metric</Label>
                            <Input
                              id={`success-metric-${milestone.id}`}
                              value={milestone.successMetric}
                              onChange={(e) => updateMilestone(milestone.id, 'successMetric', e.target.value)}
                              placeholder="e.g., 10 pilot customers acquired"
                              data-testid={`input-success-metric-${milestone.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`responsible-${milestone.id}`}>Responsible</Label>
                            <Input
                              id={`responsible-${milestone.id}`}
                              value={milestone.responsible}
                              onChange={(e) => updateMilestone(milestone.id, 'responsible', e.target.value)}
                              placeholder="e.g., Head of International"
                              data-testid={`input-responsible-${milestone.id}`}
                            />
                          </div>
                        </div>

                        {milestones.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(milestone.id)}
                            data-testid={`button-remove-milestone-${milestone.id}`}
                          >
                            Remove Milestone
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Attractiveness Scores</CardTitle>
                    <CardDescription>Comparative assessment of target markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getMarketAttractivenessData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getMarketAttractivenessData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="score" fill="#3b82f6" name="Attractiveness Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add target markets with attractiveness scores to see chart</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment by Market</CardTitle>
                    <CardDescription>Capital allocation across markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getInvestmentByMarketData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getInvestmentByMarketData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="market" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Bar dataKey="investment" fill="#10b981" name="Investment (£)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add investment requirements to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline Progress</CardTitle>
                    <CardDescription>Milestone completion by quarter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getTimelineData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getTimelineData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                          <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestones to see timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Potential by Market</CardTitle>
                    <CardDescription>Expected revenue across markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getRevenuePotentialData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getRevenuePotentialData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="market" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Expected Revenue" />
                          <Line type="monotone" dataKey="investment" stroke="#ef4444" name="Investment" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add entry strategies with revenue projections</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Expansion Summary Metrics</CardTitle>
                  <CardDescription>Key performance indicators for international expansion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Markets</p>
                          <p className="text-3xl font-bold" data-testid="text-total-markets">
                            {targetMarkets.filter(m => m.country.length > 0).length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Investment</p>
                          <p className="text-3xl font-bold" data-testid="text-total-investment">
                            £{investmentRequirements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Expected Revenue</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-expected-revenue">
                            £{entryStrategies.reduce((sum, s) => sum + s.expectedRevenue, 0).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">UK Jobs Created</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-uk-jobs-created">
                            {entryStrategies.reduce((sum, s) => sum + s.ukJobsCreated, 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Smart Recommendations</CardTitle>
                  </div>
                  <CardDescription>AI-powered insights for strengthening your geographic expansion strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  {getSmartTips().length > 0 ? (
                    <div className="space-y-4">
                      {getSmartTips().map((tip, index) => (
                        <Alert key={index} data-testid={`alert-tip-${index}`}>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>{tip}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Start filling out your expansion plan to receive personalized recommendations</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>4-Week Action Plan</CardTitle>
                  </div>
                  <CardDescription>Prioritized timeline for executing your geographic expansion strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4" data-testid={`card-action-${index}`}>
                        <div className="flex items-start gap-4">
                          <div className={`px-3 py-1 rounded-md text-sm font-medium ${
                            item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">{item.week}</p>
                            <p className="text-sm text-muted-foreground">{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
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
