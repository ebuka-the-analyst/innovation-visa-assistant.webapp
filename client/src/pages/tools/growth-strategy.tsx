import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, Target, Users, Zap } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type GrowthGoal = {
  id: string;
  goal: string;
  timeframe: 'short' | 'medium' | 'long';
  metric: string;
  targetValue: string;
  currentValue: string;
};

type TargetMarket = {
  id: string;
  segment: string;
  size: string;
  geography: string;
  demographics: string;
  painPoints: string;
};

type AcquisitionChannel = {
  id: string;
  channel: string;
  budget: number;
  expectedCAC: number;
  expectedConversion: number;
  priority: 'high' | 'medium' | 'low';
};

type RetentionTactic = {
  id: string;
  tactic: string;
  description: string;
  frequency: string;
  expectedImpact: string;
};

type RevenueExpansion = {
  strategy: string;
  description: string;
  expectedRevenueLift: string;
  implementationTime: string;
  ukMarketFit: string;
};

export default function GrowthStrategy() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('strategy');
  const [savedDate, setSavedDate] = useState('');

  const [growthGoals, setGrowthGoals] = useState<GrowthGoal[]>([
    { id: '1', goal: '', timeframe: 'short', metric: '', targetValue: '', currentValue: '' }
  ]);

  const [targetMarkets, setTargetMarkets] = useState<TargetMarket[]>([
    { id: '1', segment: '', size: '', geography: '', demographics: '', painPoints: '' }
  ]);

  const [acquisitionChannels, setAcquisitionChannels] = useState<AcquisitionChannel[]>([
    { id: '1', channel: '', budget: 0, expectedCAC: 0, expectedConversion: 0, priority: 'medium' }
  ]);

  const [retentionTactics, setRetentionTactics] = useState<RetentionTactic[]>([
    { id: '1', tactic: '', description: '', frequency: '', expectedImpact: '' }
  ]);

  const [revenueExpansion, setRevenueExpansion] = useState<RevenueExpansion>({
    strategy: '',
    description: '',
    expectedRevenueLift: '',
    implementationTime: '',
    ukMarketFit: ''
  });

  const [ukScalabilityNotes, setUkScalabilityNotes] = useState({
    jobCreationPlan: '',
    localPartnerships: '',
    marketPenetration: '',
    competitiveAdvantage: ''
  });

  const [growthProjection, setGrowthProjection] = useState({
    month1Revenue: '',
    month3Revenue: '',
    month6Revenue: '',
    month12Revenue: '',
    month18Revenue: '',
    month24Revenue: ''
  });

  const addGrowthGoal = () => {
    setGrowthGoals([...growthGoals, {
      id: Date.now().toString(),
      goal: '',
      timeframe: 'short',
      metric: '',
      targetValue: '',
      currentValue: ''
    }]);
  };

  const updateGrowthGoal = (id: string, field: keyof GrowthGoal, value: any) => {
    setGrowthGoals(growthGoals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeGrowthGoal = (id: string) => {
    setGrowthGoals(growthGoals.filter(g => g.id !== id));
  };

  const addTargetMarket = () => {
    setTargetMarkets([...targetMarkets, {
      id: Date.now().toString(),
      segment: '',
      size: '',
      geography: '',
      demographics: '',
      painPoints: ''
    }]);
  };

  const updateTargetMarket = (id: string, field: keyof TargetMarket, value: string) => {
    setTargetMarkets(targetMarkets.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeTargetMarket = (id: string) => {
    setTargetMarkets(targetMarkets.filter(m => m.id !== id));
  };

  const addAcquisitionChannel = () => {
    setAcquisitionChannels([...acquisitionChannels, {
      id: Date.now().toString(),
      channel: '',
      budget: 0,
      expectedCAC: 0,
      expectedConversion: 0,
      priority: 'medium'
    }]);
  };

  const updateAcquisitionChannel = (id: string, field: keyof AcquisitionChannel, value: any) => {
    setAcquisitionChannels(acquisitionChannels.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeAcquisitionChannel = (id: string) => {
    setAcquisitionChannels(acquisitionChannels.filter(c => c.id !== id));
  };

  const addRetentionTactic = () => {
    setRetentionTactics([...retentionTactics, {
      id: Date.now().toString(),
      tactic: '',
      description: '',
      frequency: '',
      expectedImpact: ''
    }]);
  };

  const updateRetentionTactic = (id: string, field: keyof RetentionTactic, value: string) => {
    setRetentionTactics(retentionTactics.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeRetentionTactic = (id: string) => {
    setRetentionTactics(retentionTactics.filter(t => t.id !== id));
  };

  const calculateCompletenessScore = (): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Growth Goals (40 points)
    const goalFields = growthGoals.reduce((sum, g) => {
      const filled = [g.goal, g.metric, g.targetValue, g.currentValue].filter(v => v.length > 0).length;
      totalFields += 4;
      return sum + filled;
    }, 0);
    completedFields += goalFields;

    // Target Markets (20 points)
    const marketFields = targetMarkets.reduce((sum, m) => {
      const filled = [m.segment, m.size, m.geography, m.demographics, m.painPoints].filter(v => v.length > 0).length;
      totalFields += 5;
      return sum + filled;
    }, 0);
    completedFields += marketFields;

    // Acquisition Channels (15 points)
    const channelFields = acquisitionChannels.reduce((sum, c) => {
      const filled = [c.channel.length > 0, c.budget > 0, c.expectedCAC > 0, c.expectedConversion > 0].filter(Boolean).length;
      totalFields += 4;
      return sum + filled;
    }, 0);
    completedFields += channelFields;

    // Retention Tactics (10 points)
    const retentionFields = retentionTactics.reduce((sum, t) => {
      const filled = [t.tactic, t.description, t.frequency, t.expectedImpact].filter(v => v.length > 0).length;
      totalFields += 4;
      return sum + filled;
    }, 0);
    completedFields += retentionFields;

    // Revenue Expansion (10 points)
    const revenueFields = [
      revenueExpansion.strategy,
      revenueExpansion.description,
      revenueExpansion.expectedRevenueLift,
      revenueExpansion.implementationTime,
      revenueExpansion.ukMarketFit
    ].filter(v => v.length > 0).length;
    totalFields += 5;
    completedFields += revenueFields;

    // UK Scalability (5 points)
    const ukFields = Object.values(ukScalabilityNotes).filter(v => v.length > 0).length;
    totalFields += 4;
    completedFields += ukFields;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const completenessScore = calculateCompletenessScore();

  const getChannelMixData = () => {
    return acquisitionChannels
      .filter(c => c.budget > 0)
      .map((c, index) => ({
        name: c.channel || `Channel ${index + 1}`,
        value: c.budget,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][index % 6]
      }));
  };

  const getGrowthProjectionData = () => {
    return [
      { month: 'M1', revenue: parseFloat(growthProjection.month1Revenue) || 0 },
      { month: 'M3', revenue: parseFloat(growthProjection.month3Revenue) || 0 },
      { month: 'M6', revenue: parseFloat(growthProjection.month6Revenue) || 0 },
      { month: 'M12', revenue: parseFloat(growthProjection.month12Revenue) || 0 },
      { month: 'M18', revenue: parseFloat(growthProjection.month18Revenue) || 0 },
      { month: 'M24', revenue: parseFloat(growthProjection.month24Revenue) || 0 }
    ];
  };

  const getMarketSegmentData = () => {
    return targetMarkets
      .filter(m => m.size.length > 0)
      .map(m => ({
        name: m.segment || 'Unnamed Segment',
        size: parseFloat(m.size.replace(/[^0-9.]/g, '')) || 0
      }));
  };

  const getSerializedState = () => {
    return {
      growthGoals,
      targetMarkets,
      acquisitionChannels,
      retentionTactics,
      revenueExpansion,
      ukScalabilityNotes,
      growthProjection,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('growthGoals' in state) setGrowthGoals(state.growthGoals);
    if ('targetMarkets' in state) setTargetMarkets(state.targetMarkets);
    if ('acquisitionChannels' in state) setAcquisitionChannels(state.acquisitionChannels);
    if ('retentionTactics' in state) setRetentionTactics(state.retentionTactics);
    if ('revenueExpansion' in state) setRevenueExpansion(state.revenueExpansion);
    if ('ukScalabilityNotes' in state) setUkScalabilityNotes(state.ukScalabilityNotes);
    if ('growthProjection' in state) setGrowthProjection(state.growthProjection);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('growth-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('growth-strategy-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('growth-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (completenessScore < 30) {
      tips.push("Start by defining clear growth goals with measurable metrics - this forms the foundation of your growth strategy");
    }

    if (targetMarkets.length < 2) {
      tips.push("Consider segmenting your target market further - UK visa applications favor businesses with clear market understanding and multiple addressable segments");
    }

    if (acquisitionChannels.filter(c => c.channel.length > 0).length < 3) {
      tips.push("Diversify your acquisition channels - relying on a single channel is risky and demonstrates limited market understanding to endorsing bodies");
    }

    const totalChannelBudget = acquisitionChannels.reduce((sum, c) => sum + c.budget, 0);
    if (totalChannelBudget > 0) {
      const highestBudget = Math.max(...acquisitionChannels.map(c => c.budget));
      const concentration = (highestBudget / totalChannelBudget) * 100;
      if (concentration > 70) {
        tips.push("Your acquisition budget is highly concentrated in one channel - consider a more balanced approach to reduce risk");
      }
    }

    if (retentionTactics.filter(t => t.tactic.length > 0).length < 2) {
      tips.push("Develop comprehensive retention tactics - UK scalability criteria emphasize sustainable growth, not just acquisition");
    }

    if (ukScalabilityNotes.jobCreationPlan.length < 50) {
      tips.push("CRITICAL: Clearly articulate your UK job creation plan - this is a key criterion for visa approval and demonstrates genuine UK market commitment");
    }

    if (revenueExpansion.ukMarketFit.length > 0) {
      tips.push("Strong focus on UK market fit - ensure your revenue expansion strategy aligns with local market dynamics and competitive landscape");
    }

    const projectionValues = Object.values(growthProjection).filter(v => v.length > 0);
    if (projectionValues.length >= 4) {
      const revenues = projectionValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (revenues.length >= 2) {
        const growthRate = ((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) * 100;
        if (growthRate < 50) {
          tips.push("Consider more ambitious growth projections - endorsing bodies look for high-growth potential businesses. Ensure projections are realistic but demonstrate scalability");
        } else if (growthRate > 500) {
          tips.push("Your growth projections are very aggressive - ensure you can substantiate these with market data and clear execution plans");
        }
      }
    }

    if (completenessScore > 70) {
      tips.push("Excellent progress on your growth strategy - review each section for clarity and ensure all claims are backed by market research and data");
    }

    if (acquisitionChannels.some(c => c.expectedCAC > 0 && c.expectedConversion > 0)) {
      tips.push("Good work on defining unit economics for acquisition channels - this demonstrates financial sophistication and planning rigor");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive UK market research and validate target market segments with data", priority: "Critical" },
      { week: "Week 1", action: "Define SMART growth goals aligned with UK visa scalability requirements (revenue, jobs, market share)", priority: "Critical" },
      { week: "Week 1-2", action: "Map customer acquisition channels and estimate CAC for UK market specifically", priority: "High" },
      { week: "Week 2", action: "Develop retention strategy framework with KPIs and measurement methodology", priority: "High" },
      { week: "Week 2", action: "Create detailed UK job creation timeline showing hiring plan for first 24 months", priority: "Critical" },
      { week: "Week 2-3", action: "Build financial model showing revenue projections, customer acquisition costs, and path to profitability", priority: "Critical" },
      { week: "Week 3", action: "Identify local UK partnerships, suppliers, and strategic relationships that demonstrate market integration", priority: "High" },
      { week: "Week 3", action: "Document competitive positioning and sustainable competitive advantages in UK market", priority: "High" },
      { week: "Week 4", action: "Compile market research, competitor analysis, and growth assumptions into evidence package", priority: "High" },
      { week: "Week 4", action: "Review growth strategy against UK Innovation Visa criteria and refine sections that need strengthening", priority: "Critical" },
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE GROWTH STRATEGY
Generated: ${new Date().toLocaleString('en-GB')}
Strategy Completeness: ${completenessScore}%
${'='.repeat(80)}

GROWTH GOALS
${'-'.repeat(80)}
${growthGoals.map((g, i) => `
${i + 1}. ${g.goal || '[Not Specified]'}
   Timeframe: ${g.timeframe.charAt(0).toUpperCase() + g.timeframe.slice(1)}-term
   Metric: ${g.metric || '[Not Specified]'}
   Current: ${g.currentValue || '[Not Specified]'}
   Target: ${g.targetValue || '[Not Specified]'}
`).join('')}

TARGET MARKETS
${'-'.repeat(80)}
${targetMarkets.map((m, i) => `
${i + 1}. ${m.segment || '[Unnamed Segment]'}
   Market Size: ${m.size || '[Not Specified]'}
   Geography: ${m.geography || '[Not Specified]'}
   Demographics: ${m.demographics || '[Not Specified]'}
   Key Pain Points: ${m.painPoints || '[Not Specified]'}
`).join('')}

CUSTOMER ACQUISITION CHANNELS
${'-'.repeat(80)}
${acquisitionChannels.map((c, i) => `
${i + 1}. ${c.channel || '[Unnamed Channel]'}
   Priority: ${c.priority.charAt(0).toUpperCase() + c.priority.slice(1)}
   Budget: £${c.budget.toLocaleString()}
   Expected CAC: £${c.expectedCAC.toLocaleString()}
   Expected Conversion: ${c.expectedConversion}%
   Efficiency Score: ${c.budget > 0 && c.expectedCAC > 0 ? Math.round((c.budget / c.expectedCAC)) : 0} customers
`).join('')}

Total Acquisition Budget: £${acquisitionChannels.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
Weighted Average CAC: £${acquisitionChannels.reduce((sum, c) => sum + c.budget, 0) > 0 
  ? Math.round(acquisitionChannels.reduce((sum, c) => sum + (c.budget * c.expectedCAC), 0) / acquisitionChannels.reduce((sum, c) => sum + c.budget, 0))
  : 0}

RETENTION TACTICS
${'-'.repeat(80)}
${retentionTactics.map((t, i) => `
${i + 1}. ${t.tactic || '[Unnamed Tactic]'}
   Description: ${t.description || '[Not Specified]'}
   Frequency: ${t.frequency || '[Not Specified]'}
   Expected Impact: ${t.expectedImpact || '[Not Specified]'}
`).join('')}

REVENUE EXPANSION STRATEGY
${'-'.repeat(80)}
Strategy: ${revenueExpansion.strategy || '[Not Specified]'}
Description: ${revenueExpansion.description || '[Not Specified]'}
Expected Revenue Lift: ${revenueExpansion.expectedRevenueLift || '[Not Specified]'}
Implementation Time: ${revenueExpansion.implementationTime || '[Not Specified]'}
UK Market Fit: ${revenueExpansion.ukMarketFit || '[Not Specified]'}

GROWTH PROJECTIONS
${'-'.repeat(80)}
Month 1: £${parseFloat(growthProjection.month1Revenue || '0').toLocaleString()}
Month 3: £${parseFloat(growthProjection.month3Revenue || '0').toLocaleString()}
Month 6: £${parseFloat(growthProjection.month6Revenue || '0').toLocaleString()}
Month 12: £${parseFloat(growthProjection.month12Revenue || '0').toLocaleString()}
Month 18: £${parseFloat(growthProjection.month18Revenue || '0').toLocaleString()}
Month 24: £${parseFloat(growthProjection.month24Revenue || '0').toLocaleString()}

UK SCALABILITY CRITERIA ALIGNMENT
${'-'.repeat(80)}
Job Creation Plan:
${ukScalabilityNotes.jobCreationPlan || '[Not Specified]'}

Local Partnerships:
${ukScalabilityNotes.localPartnerships || '[Not Specified]'}

Market Penetration Strategy:
${ukScalabilityNotes.marketPenetration || '[Not Specified]'}

Competitive Advantage:
${ukScalabilityNotes.competitiveAdvantage || '[Not Specified]'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

UK INNOVATION VISA - GROWTH CRITERIA CHECKLIST
${'-'.repeat(80)}
[ ] Clear, measurable growth goals aligned with UK market opportunity
[ ] Well-defined target market segments with addressable size data
[ ] Diversified customer acquisition strategy with realistic CAC estimates
[ ] Documented retention tactics demonstrating sustainable growth model
[ ] Revenue expansion plan showing path to profitability
[ ] Explicit UK job creation plan with timeline
[ ] Evidence of local partnerships and market integration
[ ] Competitive positioning backed by market research
[ ] Financial projections showing scalability
[ ] Clear demonstration of innovation in growth approach

NEXT STEPS
${'-'.repeat(80)}
1. Validate all market assumptions with credible UK market research
2. Refine customer acquisition economics with real UK market data
3. Document competitive advantages with evidence
4. Create detailed hiring plan showing UK job creation
5. Prepare supporting materials (market research, competitor analysis)
6. Align strategy with endorsing body requirements
7. Have strategy reviewed by UK market expert or advisor

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This growth strategy template is for guidance only. Consult with 
qualified business advisors and immigration specialists before submitting visa applications.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-strategy-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const wordSections = [];
    
    wordSections.push({ type: 'heading' as const, content: 'Growth Goals', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Goal', 'Timeframe', 'Metric', 'Current', 'Target'],
        rows: growthGoals.map(g => [
          g.goal || 'N/A',
          `${g.timeframe}-term`,
          g.metric || 'N/A',
          g.currentValue || 'N/A',
          g.targetValue || 'N/A'
        ])
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'Target Markets', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Segment', 'Size', 'Geography', 'Demographics', 'Pain Points'],
        rows: targetMarkets.map(m => [
          m.segment || 'N/A',
          m.size || 'N/A',
          m.geography || 'N/A',
          m.demographics || 'N/A',
          m.painPoints || 'N/A'
        ])
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'Customer Acquisition Channels', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Channel', 'Priority', 'Budget', 'Expected CAC', 'Conversion'],
        rows: acquisitionChannels.map(c => [
          c.channel || 'N/A',
          c.priority,
          `£${c.budget.toLocaleString()}`,
          `£${c.expectedCAC.toLocaleString()}`,
          `${c.expectedConversion}%`
        ])
      }
    });
    wordSections.push({ type: 'paragraph' as const, content: `Total Acquisition Budget: £${acquisitionChannels.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}` });
    
    wordSections.push({ type: 'heading' as const, content: 'Retention Tactics', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Tactic', 'Description', 'Frequency', 'Expected Impact'],
        rows: retentionTactics.map(t => [
          t.tactic || 'N/A',
          t.description || 'N/A',
          t.frequency || 'N/A',
          t.expectedImpact || 'N/A'
        ])
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'Revenue Expansion Strategy', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Attribute', 'Value'],
        rows: [
          ['Strategy', revenueExpansion.strategy || 'N/A'],
          ['Description', revenueExpansion.description || 'N/A'],
          ['Expected Revenue Lift', revenueExpansion.expectedRevenueLift || 'N/A'],
          ['Implementation Time', revenueExpansion.implementationTime || 'N/A'],
          ['UK Market Fit', revenueExpansion.ukMarketFit || 'N/A']
        ]
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'Growth Projections', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Month', 'Revenue'],
        rows: [
          ['Month 1', `£${parseFloat(growthProjection.month1Revenue || '0').toLocaleString()}`],
          ['Month 3', `£${parseFloat(growthProjection.month3Revenue || '0').toLocaleString()}`],
          ['Month 6', `£${parseFloat(growthProjection.month6Revenue || '0').toLocaleString()}`],
          ['Month 12', `£${parseFloat(growthProjection.month12Revenue || '0').toLocaleString()}`],
          ['Month 18', `£${parseFloat(growthProjection.month18Revenue || '0').toLocaleString()}`],
          ['Month 24', `£${parseFloat(growthProjection.month24Revenue || '0').toLocaleString()}`]
        ]
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'UK Scalability Criteria', level: 1 as const });
    wordSections.push({ type: 'heading' as const, content: 'Job Creation Plan', level: 2 as const });
    wordSections.push({ type: 'paragraph' as const, content: ukScalabilityNotes.jobCreationPlan || 'Not specified' });
    wordSections.push({ type: 'heading' as const, content: 'Local Partnerships', level: 2 as const });
    wordSections.push({ type: 'paragraph' as const, content: ukScalabilityNotes.localPartnerships || 'Not specified' });
    wordSections.push({ type: 'heading' as const, content: 'Market Penetration Strategy', level: 2 as const });
    wordSections.push({ type: 'paragraph' as const, content: ukScalabilityNotes.marketPenetration || 'Not specified' });
    wordSections.push({ type: 'heading' as const, content: 'Competitive Advantage', level: 2 as const });
    wordSections.push({ type: 'paragraph' as const, content: ukScalabilityNotes.competitiveAdvantage || 'Not specified' });
    
    wordSections.push({ type: 'heading' as const, content: 'Smart Recommendations', level: 1 as const });
    wordSections.push({ type: 'list' as const, items: getSmartTips() });
    
    wordSections.push({ type: 'heading' as const, content: '4-Week Action Plan', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Week', 'Action', 'Priority'],
        rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
      }
    });

    await generateWord({
      title: 'UK Innovator Founder Visa - Growth Strategy',
      subtitle: `Strategy Completeness: ${completenessScore}%`,
      filename: `growth-strategy-${Date.now()}.docx`,
      sections: wordSections,
      metadata: {
        subject: 'Growth Strategy Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['growth strategy', 'Innovator Founder Visa', 'UK visa', 'scalability']
      }
    });

    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-growth-strategy">Growth Strategy Planner</h1>
            <p className="text-lg text-muted-foreground">UK-focused scalability and growth strategy for visa compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="growth-strategy"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setActiveTab('tips')}
            onActionPlan={() => setActiveTab('action')}
            getSerializedState={getSerializedState}
            toolName="Growth Strategy Planner"
          />

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Strategy Completeness</h3>
                    <p className="text-sm text-muted-foreground">Complete all sections for comprehensive growth strategy</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" data-testid="text-completeness-score">{completenessScore}%</p>
                  </div>
                </div>
                <Progress value={completenessScore} className="h-3" data-testid="progress-completeness" />
                
                {completenessScore < 50 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your growth strategy needs more detail. Focus on defining clear goals, target markets, and acquisition channels.
                    </AlertDescription>
                  </Alert>
                )}
                
                {completenessScore >= 80 && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Excellent work! Your growth strategy is comprehensive. Review Smart Tips for final refinements.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-growth-strategy">
              <TabsTrigger value="strategy" data-testid="tab-strategy">Strategy</TabsTrigger>
              <TabsTrigger value="channels" data-testid="tab-channels">Channels</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="strategy" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle>Growth Goals</CardTitle>
                  </div>
                  <CardDescription>Define measurable growth objectives aligned with UK visa scalability requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addGrowthGoal} size="sm" data-testid="button-add-goal">
                    Add Growth Goal
                  </Button>

                  {growthGoals.map((goal) => (
                    <Card key={goal.id} className="p-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor={`goal-${goal.id}`}>Growth Goal</Label>
                          <Input
                            id={`goal-${goal.id}`}
                            value={goal.goal}
                            onChange={(e) => updateGrowthGoal(goal.id, 'goal', e.target.value)}
                            placeholder="e.g., Achieve £500k ARR by end of Year 1"
                            data-testid={`input-goal-${goal.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`timeframe-${goal.id}`}>Timeframe</Label>
                          <select
                            id={`timeframe-${goal.id}`}
                            value={goal.timeframe}
                            onChange={(e) => updateGrowthGoal(goal.id, 'timeframe', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-timeframe-${goal.id}`}
                          >
                            <option value="short">Short-term (0-6 months)</option>
                            <option value="medium">Medium-term (6-18 months)</option>
                            <option value="long">Long-term (18+ months)</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`metric-${goal.id}`}>Metric</Label>
                          <Input
                            id={`metric-${goal.id}`}
                            value={goal.metric}
                            onChange={(e) => updateGrowthGoal(goal.id, 'metric', e.target.value)}
                            placeholder="e.g., Monthly Revenue"
                            data-testid={`input-metric-${goal.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`current-${goal.id}`}>Current Value</Label>
                          <Input
                            id={`current-${goal.id}`}
                            value={goal.currentValue}
                            onChange={(e) => updateGrowthGoal(goal.id, 'currentValue', e.target.value)}
                            placeholder="e.g., £10,000"
                            data-testid={`input-current-${goal.id}`}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`target-${goal.id}`}>Target Value</Label>
                            <Input
                              id={`target-${goal.id}`}
                              value={goal.targetValue}
                              onChange={(e) => updateGrowthGoal(goal.id, 'targetValue', e.target.value)}
                              placeholder="e.g., £50,000"
                              data-testid={`input-target-${goal.id}`}
                            />
                          </div>
                          {growthGoals.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGrowthGoal(goal.id)}
                              data-testid={`button-remove-goal-${goal.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Target Markets</CardTitle>
                  </div>
                  <CardDescription>Define your UK customer segments and addressable markets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addTargetMarket} size="sm" data-testid="button-add-market">
                    Add Target Market
                  </Button>

                  {targetMarkets.map((market) => (
                    <Card key={market.id} className="p-4">
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`segment-${market.id}`}>Market Segment</Label>
                            <Input
                              id={`segment-${market.id}`}
                              value={market.segment}
                              onChange={(e) => updateTargetMarket(market.id, 'segment', e.target.value)}
                              placeholder="e.g., UK SME SaaS Buyers"
                              data-testid={`input-segment-${market.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`size-${market.id}`}>Market Size</Label>
                            <Input
                              id={`size-${market.id}`}
                              value={market.size}
                              onChange={(e) => updateTargetMarket(market.id, 'size', e.target.value)}
                              placeholder="e.g., 50,000 businesses, £2B TAM"
                              data-testid={`input-size-${market.id}`}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`geography-${market.id}`}>Geography</Label>
                            <Input
                              id={`geography-${market.id}`}
                              value={market.geography}
                              onChange={(e) => updateTargetMarket(market.id, 'geography', e.target.value)}
                              placeholder="e.g., London, Manchester, Birmingham"
                              data-testid={`input-geography-${market.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`demographics-${market.id}`}>Demographics</Label>
                            <Input
                              id={`demographics-${market.id}`}
                              value={market.demographics}
                              onChange={(e) => updateTargetMarket(market.id, 'demographics', e.target.value)}
                              placeholder="e.g., 10-50 employees, £1M-£10M revenue"
                              data-testid={`input-demographics-${market.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`painpoints-${market.id}`}>Key Pain Points</Label>
                            <Textarea
                              id={`painpoints-${market.id}`}
                              value={market.painPoints}
                              onChange={(e) => updateTargetMarket(market.id, 'painPoints', e.target.value)}
                              placeholder="What problems do they face that you solve?"
                              rows={2}
                              data-testid={`textarea-painpoints-${market.id}`}
                            />
                          </div>
                          {targetMarkets.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTargetMarket(market.id)}
                              data-testid={`button-remove-market-${market.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Expansion Strategy</CardTitle>
                  <CardDescription>Upsell, cross-sell, and pricing optimization tactics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="revenue-strategy">Expansion Strategy</Label>
                    <Input
                      id="revenue-strategy"
                      value={revenueExpansion.strategy}
                      onChange={(e) => setRevenueExpansion({...revenueExpansion, strategy: e.target.value})}
                      placeholder="e.g., Tiered pricing with premium features"
                      data-testid="input-revenue-strategy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue-description">Strategy Description</Label>
                    <Textarea
                      id="revenue-description"
                      value={revenueExpansion.description}
                      onChange={(e) => setRevenueExpansion({...revenueExpansion, description: e.target.value})}
                      placeholder="Detailed description of how you'll expand revenue from existing customers"
                      rows={3}
                      data-testid="textarea-revenue-description"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="revenue-lift">Expected Revenue Lift</Label>
                      <Input
                        id="revenue-lift"
                        value={revenueExpansion.expectedRevenueLift}
                        onChange={(e) => setRevenueExpansion({...revenueExpansion, expectedRevenueLift: e.target.value})}
                        placeholder="e.g., 30% increase in ARPU"
                        data-testid="input-revenue-lift"
                      />
                    </div>
                    <div>
                      <Label htmlFor="implementation-time">Implementation Time</Label>
                      <Input
                        id="implementation-time"
                        value={revenueExpansion.implementationTime}
                        onChange={(e) => setRevenueExpansion({...revenueExpansion, implementationTime: e.target.value})}
                        placeholder="e.g., 6 months"
                        data-testid="input-implementation-time"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="uk-market-fit">UK Market Fit</Label>
                    <Textarea
                      id="uk-market-fit"
                      value={revenueExpansion.ukMarketFit}
                      onChange={(e) => setRevenueExpansion({...revenueExpansion, ukMarketFit: e.target.value})}
                      placeholder="How does this strategy align with UK market dynamics and customer preferences?"
                      rows={3}
                      data-testid="textarea-uk-market-fit"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Scalability Criteria</CardTitle>
                  <CardDescription>Demonstrate alignment with UK Innovation Visa requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job-creation">Job Creation Plan</Label>
                    <Textarea
                      id="job-creation"
                      value={ukScalabilityNotes.jobCreationPlan}
                      onChange={(e) => setUkScalabilityNotes({...ukScalabilityNotes, jobCreationPlan: e.target.value})}
                      placeholder="Detail your UK hiring plan: roles, timeline, salary ranges, skills required"
                      rows={4}
                      data-testid="textarea-job-creation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="local-partnerships">Local Partnerships</Label>
                    <Textarea
                      id="local-partnerships"
                      value={ukScalabilityNotes.localPartnerships}
                      onChange={(e) => setUkScalabilityNotes({...ukScalabilityNotes, localPartnerships: e.target.value})}
                      placeholder="UK suppliers, strategic partners, distribution channels, advisors"
                      rows={3}
                      data-testid="textarea-local-partnerships"
                    />
                  </div>
                  <div>
                    <Label htmlFor="market-penetration">Market Penetration Strategy</Label>
                    <Textarea
                      id="market-penetration"
                      value={ukScalabilityNotes.marketPenetration}
                      onChange={(e) => setUkScalabilityNotes({...ukScalabilityNotes, marketPenetration: e.target.value})}
                      placeholder="How will you gain market share in the UK? What's your go-to-market approach?"
                      rows={3}
                      data-testid="textarea-market-penetration"
                    />
                  </div>
                  <div>
                    <Label htmlFor="competitive-advantage">Competitive Advantage</Label>
                    <Textarea
                      id="competitive-advantage"
                      value={ukScalabilityNotes.competitiveAdvantage}
                      onChange={(e) => setUkScalabilityNotes({...ukScalabilityNotes, competitiveAdvantage: e.target.value})}
                      placeholder="What sustainable advantages do you have over UK competitors?"
                      rows={3}
                      data-testid="textarea-competitive-advantage"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Projections</CardTitle>
                  <CardDescription>Revenue forecast over 24 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="month1">Month 1 Revenue</Label>
                      <Input
                        id="month1"
                        type="number"
                        value={growthProjection.month1Revenue}
                        onChange={(e) => setGrowthProjection({...growthProjection, month1Revenue: e.target.value})}
                        placeholder="0"
                        data-testid="input-month1-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month3">Month 3 Revenue</Label>
                      <Input
                        id="month3"
                        type="number"
                        value={growthProjection.month3Revenue}
                        onChange={(e) => setGrowthProjection({...growthProjection, month3Revenue: e.target.value})}
                        placeholder="0"
                        data-testid="input-month3-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month6">Month 6 Revenue</Label>
                      <Input
                        id="month6"
                        type="number"
                        value={growthProjection.month6Revenue}
                        onChange={(e) => setGrowthProjection({...growthProjection, month6Revenue: e.target.value})}
                        placeholder="0"
                        data-testid="input-month6-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month12">Month 12 Revenue</Label>
                      <Input
                        id="month12"
                        type="number"
                        value={growthProjection.month12Revenue}
                        onChange={(e) => setGrowthProjection({...growthProjection, month12Revenue: e.target.value})}
                        placeholder="0"
                        data-testid="input-month12-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month18">Month 18 Revenue</Label>
                      <Input
                        id="month18"
                        type="number"
                        value={growthProjection.month18Revenue}
                        onChange={(e) => setGrowthProjection({...growthProjection, month18Revenue: e.target.value})}
                        placeholder="0"
                        data-testid="input-month18-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month24">Month 24 Revenue</Label>
                      <Input
                        id="month24"
                        type="number"
                        value={growthProjection.month24Revenue}
                        onChange={(e) => setGrowthProjection({...growthProjection, month24Revenue: e.target.value})}
                        placeholder="0"
                        data-testid="input-month24-revenue"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle>Customer Acquisition Channels</CardTitle>
                  </div>
                  <CardDescription>Define your go-to-market channels with budget allocation and expected performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addAcquisitionChannel} size="sm" data-testid="button-add-channel">
                    Add Acquisition Channel
                  </Button>

                  {acquisitionChannels.map((channel) => (
                    <Card key={channel.id} className="p-4">
                      <div className="grid md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label htmlFor={`channel-${channel.id}`}>Channel Name</Label>
                          <Input
                            id={`channel-${channel.id}`}
                            value={channel.channel}
                            onChange={(e) => updateAcquisitionChannel(channel.id, 'channel', e.target.value)}
                            placeholder="e.g., Google Ads, Content Marketing, LinkedIn"
                            data-testid={`input-channel-${channel.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`budget-${channel.id}`}>Monthly Budget (£)</Label>
                          <Input
                            id={`budget-${channel.id}`}
                            type="number"
                            value={channel.budget || ''}
                            onChange={(e) => updateAcquisitionChannel(channel.id, 'budget', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-budget-${channel.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`cac-${channel.id}`}>Expected CAC (£)</Label>
                          <Input
                            id={`cac-${channel.id}`}
                            type="number"
                            value={channel.expectedCAC || ''}
                            onChange={(e) => updateAcquisitionChannel(channel.id, 'expectedCAC', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-cac-${channel.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`conversion-${channel.id}`}>Conversion %</Label>
                          <Input
                            id={`conversion-${channel.id}`}
                            type="number"
                            value={channel.expectedConversion || ''}
                            onChange={(e) => updateAcquisitionChannel(channel.id, 'expectedConversion', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-conversion-${channel.id}`}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-5 gap-4 items-end mt-4">
                        <div>
                          <Label htmlFor={`priority-${channel.id}`}>Priority</Label>
                          <select
                            id={`priority-${channel.id}`}
                            value={channel.priority}
                            onChange={(e) => updateAcquisitionChannel(channel.id, 'priority', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-priority-${channel.id}`}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          {channel.budget > 0 && channel.expectedCAC > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Expected customers/month: {Math.round(channel.budget / channel.expectedCAC)}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          {acquisitionChannels.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAcquisitionChannel(channel.id)}
                              data-testid={`button-remove-channel-${channel.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Tactics</CardTitle>
                  <CardDescription>Customer engagement and loyalty strategies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addRetentionTactic} size="sm" data-testid="button-add-retention">
                    Add Retention Tactic
                  </Button>

                  {retentionTactics.map((tactic) => (
                    <Card key={tactic.id} className="p-4">
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`tactic-${tactic.id}`}>Tactic Name</Label>
                            <Input
                              id={`tactic-${tactic.id}`}
                              value={tactic.tactic}
                              onChange={(e) => updateRetentionTactic(tactic.id, 'tactic', e.target.value)}
                              placeholder="e.g., Monthly product webinars"
                              data-testid={`input-tactic-${tactic.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`frequency-${tactic.id}`}>Frequency</Label>
                            <Input
                              id={`frequency-${tactic.id}`}
                              value={tactic.frequency}
                              onChange={(e) => updateRetentionTactic(tactic.id, 'frequency', e.target.value)}
                              placeholder="e.g., Monthly, Weekly"
                              data-testid={`input-frequency-${tactic.id}`}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`tactic-desc-${tactic.id}`}>Description</Label>
                          <Textarea
                            id={`tactic-desc-${tactic.id}`}
                            value={tactic.description}
                            onChange={(e) => updateRetentionTactic(tactic.id, 'description', e.target.value)}
                            placeholder="Detailed description of the retention tactic"
                            rows={2}
                            data-testid={`textarea-tactic-desc-${tactic.id}`}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`impact-${tactic.id}`}>Expected Impact</Label>
                            <Input
                              id={`impact-${tactic.id}`}
                              value={tactic.expectedImpact}
                              onChange={(e) => updateRetentionTactic(tactic.id, 'expectedImpact', e.target.value)}
                              placeholder="e.g., 10% reduction in churn"
                              data-testid={`input-impact-${tactic.id}`}
                            />
                          </div>
                          {retentionTactics.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRetentionTactic(tactic.id)}
                              data-testid={`button-remove-retention-${tactic.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
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
                    <CardTitle>Growth Projection</CardTitle>
                    <CardDescription>Revenue forecast over 24 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getGrowthProjectionData().some(d => d.revenue > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getGrowthProjectionData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            name="Revenue"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Enter growth projections to see chart</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Acquisition Channel Mix</CardTitle>
                    <CardDescription>Budget allocation across channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getChannelMixData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getChannelMixData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {getChannelMixData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add acquisition channels with budgets to see distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Target Market Segments</CardTitle>
                  <CardDescription>Market size by segment</CardDescription>
                </CardHeader>
                <CardContent>
                  {getMarketSegmentData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getMarketSegmentData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="size" fill="#10b981" name="Market Size" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add target markets with size data to see segmentation</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-1">Total Acquisition Budget</p>
                      <p className="text-2xl font-bold" data-testid="text-total-budget">
                        £{acquisitionChannels.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-muted-foreground mb-1">Active Growth Goals</p>
                      <p className="text-2xl font-bold" data-testid="text-active-goals">
                        {growthGoals.filter(g => g.goal.length > 0).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-sm text-muted-foreground mb-1">Target Market Segments</p>
                      <p className="text-2xl font-bold" data-testid="text-market-segments">
                        {targetMarkets.filter(m => m.segment.length > 0).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights to strengthen your growth strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertDescription className="flex gap-3">
                          <span className="font-semibold text-primary flex-shrink-0">{index + 1}.</span>
                          <span>{tip}</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to complete your growth strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.priority === 'Critical' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.week}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
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
