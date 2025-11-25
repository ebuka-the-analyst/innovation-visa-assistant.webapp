import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Star } from "lucide-react";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

type EndorserBody = {
  id: string;
  name: string;
  description: string;
  fees: {
    endorsement: number;
    checkIn: number;
    total: number;
  };
  timeline: {
    weeks: string;
    daysMin: number;
    daysMax: number;
  };
  successRate: number;
  sectorFocus: string[];
  requirements: {
    rdSpend: string;
    jobCreation: string;
    innovation: string;
    funding: string;
  };
  strengths: string[];
  ideal: string[];
  riskTolerance: 'Low' | 'Medium' | 'High';
  processingSpeed: 'Fast' | 'Moderate' | 'Slow';
};

const ENDORSERS: EndorserBody[] = [
  {
    id: "tech-nation",
    name: "Tech Nation",
    description: "Technology-focused endorser with fast processing and high success rates for tech startups",
    fees: {
      endorsement: 1000,
      checkIn: 500,
      total: 2000
    },
    timeline: {
      weeks: "6-8 weeks",
      daysMin: 42,
      daysMax: 56
    },
    successRate: 88,
    sectorFocus: ["AI/ML", "FinTech", "SaaS", "Cyber Security", "Deep Tech", "Climate Tech", "Biotech"],
    requirements: {
      rdSpend: "10% of budget on R&D",
      jobCreation: "5+ jobs in 3 years",
      innovation: "Clear tech differentiation, IP strategy",
      funding: "£50,000+ verified investment"
    },
    strengths: ["Fast processing", "Tech expertise", "Investor network", "Founder community"],
    ideal: ["Tech founders with IP", "AI/ML innovators", "Deep tech ventures", "Software companies"],
    riskTolerance: "High",
    processingSpeed: "Fast"
  },
  {
    id: "innovator-intl",
    name: "Innovator International",
    description: "Global scope endorser accepting diverse sectors with moderate processing times",
    fees: {
      endorsement: 1000,
      checkIn: 500,
      total: 2000
    },
    timeline: {
      weeks: "8-10 weeks",
      daysMin: 56,
      daysMax: 70
    },
    successRate: 82,
    sectorFocus: ["Any innovative business", "Tech-enabled services", "B2B/B2C platforms", "Professional services", "Manufacturing innovation"],
    requirements: {
      rdSpend: "Not specified (flexible)",
      jobCreation: "3+ jobs in 3 years",
      innovation: "Market validation, clear innovation",
      funding: "Sufficient lawful funds documented"
    },
    strengths: ["Sector flexibility", "Non-tech friendly", "Good support", "Reasonable requirements"],
    ideal: ["Service businesses", "Non-tech innovators", "B2B platforms", "Consultancy innovations"],
    riskTolerance: "Medium",
    processingSpeed: "Moderate"
  },
  {
    id: "global-entrepreneurs",
    name: "Global Entrepreneurs Programme",
    description: "Invitation-only route for exceptional founders backed by leading VCs and accelerators",
    fees: {
      endorsement: 0,
      checkIn: 0,
      total: 0
    },
    timeline: {
      weeks: "10-12 weeks",
      daysMin: 70,
      daysMax: 84
    },
    successRate: 92,
    sectorFocus: ["High-growth potential", "VC-backed ventures", "Exceptional founders", "International expansion ready"],
    requirements: {
      rdSpend: "Depends on business model",
      jobCreation: "Significant growth expected",
      innovation: "Exceptional innovation, international recognition",
      funding: "Typically VC-backed or significant investment"
    },
    strengths: ["No fees", "Prestigious", "High success rate", "Government backing", "Investor access"],
    ideal: ["VC-backed founders", "Serial entrepreneurs", "International award winners", "Accelerator graduates"],
    riskTolerance: "Medium",
    processingSpeed: "Moderate"
  },
  {
    id: "uk-endorsing",
    name: "UK Endorsing Services",
    description: "Comprehensive endorser with balanced criteria and broad sector acceptance",
    fees: {
      endorsement: 1000,
      checkIn: 500,
      total: 2000
    },
    timeline: {
      weeks: "7-9 weeks",
      daysMin: 49,
      daysMax: 63
    },
    successRate: 85,
    sectorFocus: ["Diverse sectors", "Growth-stage startups", "Revenue-generating businesses", "Scalable models"],
    requirements: {
      rdSpend: "Sector appropriate",
      jobCreation: "4+ jobs in 3 years",
      innovation: "Documented innovation, market opportunity",
      funding: "£50,000+ accessible funds"
    },
    strengths: ["Balanced criteria", "Broad acceptance", "Thorough feedback", "Post-endorsement support"],
    ideal: ["Growth-stage companies", "Revenue businesses", "Balanced profiles", "Multiple sector innovators"],
    riskTolerance: "Medium",
    processingSpeed: "Moderate"
  }
];

type BusinessProfile = {
  sector: string;
  hasTechIP: boolean;
  hasRevenue: boolean;
  rdPercentage: number;
  jobsPlanned: number;
  fundingAmount: number;
  isVCBacked: boolean;
  hasInternationalRecognition: boolean;
};

export default function EndorserComparison() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');
  const [selectedEndorser, setSelectedEndorser] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    sector: '',
    hasTechIP: false,
    hasRevenue: false,
    rdPercentage: 0,
    jobsPlanned: 0,
    fundingAmount: 0,
    isVCBacked: false,
    hasInternationalRecognition: false
  });

  const calculateMatchScore = (endorser: EndorserBody): number => {
    let score = 50;

    if (businessProfile.sector) {
      const sectorLower = businessProfile.sector.toLowerCase();
      const hasSectorMatch = endorser.sectorFocus.some(s => 
        s.toLowerCase().includes(sectorLower) || sectorLower.includes(s.toLowerCase())
      );
      if (hasSectorMatch) score += 15;
    }

    if (businessProfile.hasTechIP && endorser.id === 'tech-nation') score += 10;
    
    if (businessProfile.hasRevenue && endorser.id === 'uk-endorsing') score += 8;

    if (businessProfile.rdPercentage >= 10 && endorser.id === 'tech-nation') score += 7;
    if (businessProfile.rdPercentage >= 5 && endorser.id !== 'tech-nation') score += 5;

    const jobTarget = parseInt(endorser.requirements.jobCreation.match(/\d+/)?.[0] || '0');
    if (businessProfile.jobsPlanned >= jobTarget) score += 8;

    if (businessProfile.fundingAmount >= 50000) score += 10;

    if (businessProfile.isVCBacked && endorser.id === 'global-entrepreneurs') score += 15;

    if (businessProfile.hasInternationalRecognition) score += 5;

    return Math.min(100, Math.round(score));
  };

  const endorsersWithScores = ENDORSERS.map(e => ({
    ...e,
    matchScore: calculateMatchScore(e)
  })).sort((a, b) => b.matchScore - a.matchScore);

  const bestMatch = endorsersWithScores[0];

  const comparisonData = endorsersWithScores.map(e => ({
    name: e.name.replace(' Programme', '').replace(' International', ' Intl'),
    'Success Rate': e.successRate,
    'Match Score': e.matchScore,
    'Timeline (days)': e.timeline.daysMin
  }));

  const radarData = selectedEndorser ? (() => {
    const endorser = ENDORSERS.find(e => e.id === selectedEndorser);
    if (!endorser) return [];
    return [
      { criterion: 'Success Rate', value: endorser.successRate, fullMark: 100 },
      { criterion: 'Processing Speed', value: endorser.processingSpeed === 'Fast' ? 90 : endorser.processingSpeed === 'Moderate' ? 70 : 50, fullMark: 100 },
      { criterion: 'Match Score', value: calculateMatchScore(endorser), fullMark: 100 },
      { criterion: 'Cost Efficiency', value: endorser.fees.total === 0 ? 100 : Math.max(0, 100 - (endorser.fees.total / 50)), fullMark: 100 },
      { criterion: 'Sector Fit', value: businessProfile.sector ? (endorser.sectorFocus.some(s => s.toLowerCase().includes(businessProfile.sector.toLowerCase())) ? 85 : 50) : 50, fullMark: 100 }
    ];
  })() : [];

  const getSerializedState = () => {
    return {
      activeTab,
      savedDate: new Date().toLocaleString('en-GB'),
      selectedEndorser,
      businessProfile
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
    if ('selectedEndorser' in state) setSelectedEndorser(state.selectedEndorser);
    if ('businessProfile' in state) setBusinessProfile(state.businessProfile);
  };

  useEffect(() => {
    const handoffKey = 'endorser-comparison_handoff';
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
      const saved = localStorage.getItem('endorser-comparison-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('endorser-comparison-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('endorser-comparison-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (bestMatch.matchScore >= 80) {
      tips.push(`Strong Match Identified: ${bestMatch.name} shows ${bestMatch.matchScore}% compatibility with your profile. Focus your application preparation on their specific requirements to maximize approval chances.`);
    }

    if (bestMatch.matchScore < 60) {
      tips.push("Low Match Scores Across All Endorsers: Your business profile may need strengthening before application. Consider enhancing innovation documentation, securing more funding, or clarifying your sector positioning.");
    }

    if (businessProfile.fundingAmount < 50000) {
      tips.push("Funding Below Recommended Threshold: While no minimum exists officially (as of 2024), most endorsers expect £50,000+ in accessible funds. Secure additional funding or strong revenue projections to strengthen your application.");
    }

    if (!businessProfile.hasTechIP && ENDORSERS.find(e => e.id === 'tech-nation') === bestMatch) {
      tips.push("IP Strategy Gap for Tech Nation: Without patents, trade secrets, or proprietary technology, demonstrating innovation to Tech Nation becomes challenging. Consider filing provisional patents or documenting technical differentiation thoroughly.");
    }

    if (businessProfile.isVCBacked && endorsersWithScores.find(e => e.id === 'global-entrepreneurs')!.matchScore < 70) {
      tips.push("Global Entrepreneurs Programme Opportunity: Your VC backing makes you eligible for this invitation-only route with 92% success rate and zero fees. Reach out to your investor network for potential nomination.");
    }

    const avgTimeline = endorsersWithScores.reduce((sum, e) => sum + e.timeline.daysMax, 0) / endorsersWithScores.length;
    tips.push(`Timeline Planning Critical: Average endorsement timeline is ${Math.round(avgTimeline)} days. Factor in 2-4 weeks for application preparation plus visa processing (8-12 weeks) when planning your move to UK.`);

    if (businessProfile.jobsPlanned >= 5) {
      tips.push("Strong Job Creation Profile: Your commitment to creating 5+ jobs aligns with Tech Nation and UK Endorsing Services priorities. Emphasize this in your business plan with detailed hiring roadmap and roles specification.");
    }

    const cheapestOption = endorsersWithScores.reduce((min, e) => e.fees.total < min.fees.total ? e : min);
    if (cheapestOption.fees.total === 0) {
      tips.push(`Cost Optimization: ${cheapestOption.name} has zero fees compared to £2,000 for standard endorsers. If you qualify (invitation-only), this saves significant costs plus offers higher success rates.`);
    }

    if (businessProfile.rdPercentage >= 10) {
      tips.push("Excellent R&D Investment: Your 10%+ R&D spend demonstrates strong innovation commitment. Tech Nation particularly values this - ensure you document all R&D activities with detailed technical specifications.");
    }

    if (!businessProfile.hasRevenue && endorsersWithScores[0].id !== 'tech-nation') {
      tips.push("Pre-revenue Stage Consideration: Without current revenue, focus on endorsers accepting pre-revenue startups (Tech Nation, Global Entrepreneurs). Prepare strong market validation evidence and clear path to revenue.");
    }

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: `Research ${bestMatch.name} requirements in detail - review recent successful applications and prepare initial documentation checklist`, 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Strengthen weakest criterion - if innovation score low, file provisional patents; if viability low, secure funding commitments; if scalability low, develop detailed hiring plan", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Prepare sector-specific evidence package - technical specifications for tech, customer validation for services, market analysis for all sectors", 
        priority: "High" 
      },
      { 
        week: "Week 2-3", 
        action: `Contact ${bestMatch.name} informally to understand current approval trends and any recent guideline changes - attend their webinars or info sessions`, 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Draft comprehensive business plan addressing all three criteria (innovation, viability, scalability) with quantitative metrics and evidence", 
        priority: "Critical" 
      },
      { 
        week: "Week 3-4", 
        action: "Secure professional review of application - immigration lawyer (£1,500-3,000) or business plan consultant (£500-2,000) familiar with endorser requirements", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Finalize all supporting documents - funding verification, IP documentation, customer letters of intent, advisor CVs, market research data", 
        priority: "Critical" 
      },
      { 
        week: "Week 4+", 
        action: `Submit application to ${bestMatch.name} and prepare for potential interview (${bestMatch.timeline.weeks} processing expected) - maintain all evidence current during review period`, 
        priority: "Critical" 
      },
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ENDORSER COMPARISON ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

YOUR BUSINESS PROFILE
${'-'.repeat(80)}
Sector: ${businessProfile.sector || 'Not specified'}
Tech IP: ${businessProfile.hasTechIP ? 'Yes' : 'No'}
Current Revenue: ${businessProfile.hasRevenue ? 'Yes' : 'No'}
R&D Spend: ${businessProfile.rdPercentage}% of budget
Job Creation Plan: ${businessProfile.jobsPlanned} jobs
Funding Amount: £${businessProfile.fundingAmount.toLocaleString()}
VC Backed: ${businessProfile.isVCBacked ? 'Yes' : 'No'}
International Recognition: ${businessProfile.hasInternationalRecognition ? 'Yes' : 'No'}

BEST MATCH RECOMMENDATION
${'-'.repeat(80)}
Endorser: ${bestMatch.name}
Match Score: ${bestMatch.matchScore}%
Success Rate: ${bestMatch.successRate}%
Timeline: ${bestMatch.timeline.weeks}
Total Fees: £${bestMatch.fees.total.toLocaleString()}
${bestMatch.description}

COMPLETE ENDORSER COMPARISON
${'-'.repeat(80)}
${endorsersWithScores.map((e, i) => `
${i + 1}. ${e.name}
   Match Score: ${e.matchScore}%
   Success Rate: ${e.successRate}%
   Timeline: ${e.timeline.weeks} (${e.timeline.daysMin}-${e.timeline.daysMax} days)
   Fees: £${e.fees.endorsement} endorsement + £${e.fees.checkIn} per check-in = £${e.fees.total} total
   Processing Speed: ${e.processingSpeed}
   Risk Tolerance: ${e.riskTolerance}
   
   Sector Focus: ${e.sectorFocus.join(', ')}
   
   Requirements:
   - R&D Spend: ${e.requirements.rdSpend}
   - Job Creation: ${e.requirements.jobCreation}
   - Innovation: ${e.requirements.innovation}
   - Funding: ${e.requirements.funding}
   
   Strengths: ${e.strengths.join(', ')}
   Ideal For: ${e.ideal.join(', ')}
`).join('')}

DETAILED COST BREAKDOWN
${'-'.repeat(80)}
${endorsersWithScores.map(e => `${e.name}: £${e.fees.endorsement} + (£${e.fees.checkIn} × 2 check-ins) = £${e.fees.total}`).join('\n')}

Note: All endorsers require minimum 2 check-in meetings over 3-year period

TIMELINE COMPARISON
${'-'.repeat(80)}
${endorsersWithScores.sort((a, b) => a.timeline.daysMin - b.timeline.daysMin).map(e => 
  `${e.name}: ${e.timeline.weeks} (${e.timeline.daysMin}-${e.timeline.daysMax} days)`
).join('\n')}

SUCCESS RATE RANKING
${'-'.repeat(80)}
${endorsersWithScores.sort((a, b) => b.successRate - a.successRate).map((e, i) => 
  `${i + 1}. ${e.name}: ${e.successRate}% success rate`
).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

IMPORTANT NOTES
${'-'.repeat(80)}
- All fees are as of 2025 and subject to change
- Success rates are based on well-prepared applications with complete documentation
- Timeline estimates exclude application preparation time (typically 2-4 weeks)
- Home Office visa fee (£1,274-1,590) and healthcare surcharge separate from endorsement fees
- Global Entrepreneurs Programme is invitation-only - contact program directly
- Maintain all funding accessible throughout application period (3-6 months typical)
- Job creation targets must be achieved by end of Year 3 on visa
- Endorsers may reject applications not meeting their specific sector focus
- Recent endorser guideline changes may affect requirements - verify before applying

NEXT STEPS
${'-'.repeat(80)}
1. Review ${bestMatch.name} website and recent successful application examples
2. Attend endorser information sessions or webinars
3. Prepare comprehensive business plan addressing innovation, viability, scalability
4. Secure funding verification documentation (bank statements, investment agreements)
5. Gather innovation evidence (IP filings, technical specifications, market validation)
6. Consider professional review before submission
7. Budget for total costs: endorsement fees + visa fees + legal fees (£3,000-5,000 typical)
8. Plan timeline: 2-4 weeks prep + ${bestMatch.timeline.weeks} endorsement + 8-12 weeks visa

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `endorser-comparison-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    await generateWord({
      title: "Endorser Comparison Analysis",
      subtitle: "UK Innovator Founder Visa - Endorsing Body Assessment",
      filename: "endorser-comparison-analysis",
      sections: [
        { type: 'heading', level: 1, content: 'Your Business Profile' },
        { type: 'table', tableData: {
          headers: ['Attribute', 'Value'],
          rows: [
            ['Sector', businessProfile.sector || 'Not specified'],
            ['Tech IP', businessProfile.hasTechIP ? 'Yes' : 'No'],
            ['Current Revenue', businessProfile.hasRevenue ? 'Yes' : 'No'],
            ['R&D Spend', `${businessProfile.rdPercentage}% of budget`],
            ['Job Creation Plan', `${businessProfile.jobsPlanned} jobs`],
            ['Funding Amount', `£${businessProfile.fundingAmount.toLocaleString()}`],
            ['VC Backed', businessProfile.isVCBacked ? 'Yes' : 'No'],
            ['International Recognition', businessProfile.hasInternationalRecognition ? 'Yes' : 'No']
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Best Match Recommendation' },
        { type: 'score', score: { value: bestMatch.matchScore, max: 100, label: 'Match Score' } },
        { type: 'paragraph', content: `Recommended Endorser: ${bestMatch.name}` },
        { type: 'paragraph', content: `Success Rate: ${bestMatch.successRate}%` },
        { type: 'paragraph', content: `Timeline: ${bestMatch.timeline.weeks}` },
        { type: 'paragraph', content: `Total Fees: £${bestMatch.fees.total.toLocaleString()}` },
        { type: 'paragraph', content: bestMatch.description },
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Complete Endorser Comparison' },
        { type: 'table', tableData: {
          headers: ['Endorser', 'Match Score', 'Success Rate', 'Timeline', 'Fees'],
          rows: endorsersWithScores.map(e => [
            e.name,
            `${e.matchScore}%`,
            `${e.successRate}%`,
            e.timeline.weeks,
            `£${e.fees.total.toLocaleString()}`
          ])
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Smart Recommendations' },
        { type: 'list', items: getSmartTips() },
        { type: 'divider' },
        { type: 'heading', level: 1, content: '4-Week Action Plan' },
        { type: 'table', tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
        }}
      ],
      metadata: {
        subject: 'Endorser Comparison Analysis',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['endorser', 'comparison', 'UK visa', 'innovator founder']
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const updateProfile = (field: keyof BusinessProfile, value: any) => {
    setBusinessProfile({ ...businessProfile, [field]: value });
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-endorser-comparison">Endorser Comparison</h1>
            <p className="text-lg text-muted-foreground">Compare UK endorsing bodies and find your best match</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="endorser-comparison"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Endorser Comparison"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-endorser-comparison">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="profile" data-testid="tab-profile">Your Profile</TabsTrigger>
              <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Best Match Recommendation</CardTitle>
                  <CardDescription>Based on your business profile analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-primary bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">Best Match</p>
                          <p className="text-xl font-bold" data-testid="text-best-match">{bestMatch.name}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Match Score</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-match-score">{bestMatch.matchScore}%</p>
                          <Progress value={bestMatch.matchScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-success-rate">{bestMatch.successRate}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">High Success</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Fees</p>
                          <p className="text-3xl font-bold" data-testid="text-total-fees">£{bestMatch.fees.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-2">{bestMatch.timeline.weeks}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className={bestMatch.matchScore >= 75 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {bestMatch.matchScore >= 75 ? (
                        `Excellent match! ${bestMatch.name} aligns strongly with your profile. ${bestMatch.description}`
                      ) : bestMatch.matchScore >= 60 ? (
                        `Good match. ${bestMatch.name} is compatible with your profile. Review requirements carefully and consider strengthening your application.`
                      ) : (
                        `Moderate match. Your profile may benefit from strengthening before application. Consider enhancing your innovation documentation, funding position, or sector positioning.`
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold">Why {bestMatch.name}?</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Key Strengths</p>
                        <ul className="space-y-1">
                          {bestMatch.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Ideal For</p>
                        <ul className="space-y-1">
                          {bestMatch.ideal.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Endorsers Ranked by Match Score</CardTitle>
                  <CardDescription>Compatibility analysis based on your business profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Match Score" fill="#3b82f6" />
                      <Bar dataKey="Success Rate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Business Profile</CardTitle>
                  <CardDescription>Enter your business details to calculate personalized match scores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sector">Business Sector</Label>
                      <Input
                        id="sector"
                        value={businessProfile.sector}
                        onChange={(e) => updateProfile('sector', e.target.value)}
                        placeholder="e.g., FinTech, AI/ML, SaaS, Healthcare"
                        data-testid="input-sector"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="funding">Funding Amount (£)</Label>
                      <Input
                        id="funding"
                        type="number"
                        value={businessProfile.fundingAmount || ''}
                        onChange={(e) => updateProfile('fundingAmount', parseFloat(e.target.value) || 0)}
                        placeholder="50000"
                        data-testid="input-funding"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rd">R&D Spend (%)</Label>
                      <Input
                        id="rd"
                        type="number"
                        value={businessProfile.rdPercentage || ''}
                        onChange={(e) => updateProfile('rdPercentage', parseFloat(e.target.value) || 0)}
                        placeholder="10"
                        data-testid="input-rd"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobs">Jobs Planned (3 years)</Label>
                      <Input
                        id="jobs"
                        type="number"
                        value={businessProfile.jobsPlanned || ''}
                        onChange={(e) => updateProfile('jobsPlanned', parseInt(e.target.value) || 0)}
                        placeholder="5"
                        data-testid="input-jobs"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="tech-ip"
                        checked={businessProfile.hasTechIP}
                        onChange={(e) => updateProfile('hasTechIP', e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-tech-ip"
                      />
                      <Label htmlFor="tech-ip" className="cursor-pointer">
                        Has tech IP (patents, trade secrets, proprietary technology)
                      </Label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="revenue"
                        checked={businessProfile.hasRevenue}
                        onChange={(e) => updateProfile('hasRevenue', e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-revenue"
                      />
                      <Label htmlFor="revenue" className="cursor-pointer">
                        Currently generating revenue
                      </Label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="vc"
                        checked={businessProfile.isVCBacked}
                        onChange={(e) => updateProfile('isVCBacked', e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-vc"
                      />
                      <Label htmlFor="vc" className="cursor-pointer">
                        VC-backed or accelerator graduate
                      </Label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="recognition"
                        checked={businessProfile.hasInternationalRecognition}
                        onChange={(e) => updateProfile('hasInternationalRecognition', e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-recognition"
                      />
                      <Label htmlFor="recognition" className="cursor-pointer">
                        International recognition or awards
                      </Label>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Complete your profile to get accurate match scores. The more details you provide, the better the recommendations.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {endorsersWithScores.map((endorser) => (
                  <Card 
                    key={endorser.id} 
                    className={`cursor-pointer transition-all ${selectedEndorser === endorser.id ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedEndorser(endorser.id)}
                    data-testid={`card-endorser-${endorser.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {endorser.name}
                            {endorser === bestMatch && <Badge variant="default">Best Match</Badge>}
                          </CardTitle>
                          <CardDescription className="mt-2">{endorser.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{endorser.matchScore}%</p>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                          <p className="text-lg font-bold text-green-600" data-testid={`text-success-${endorser.id}`}>{endorser.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="text-lg font-bold" data-testid={`text-timeline-${endorser.id}`}>{endorser.timeline.weeks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Fees</p>
                          <p className="text-lg font-bold" data-testid={`text-fees-${endorser.id}`}>£{endorser.fees.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Speed</p>
                          <Badge variant={endorser.processingSpeed === 'Fast' ? 'default' : 'secondary'}>
                            {endorser.processingSpeed}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Sector Focus</p>
                        <div className="flex flex-wrap gap-1">
                          {endorser.sectorFocus.slice(0, 3).map((sector, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{sector}</Badge>
                          ))}
                          {endorser.sectorFocus.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{endorser.sectorFocus.length - 3} more</Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Requirements</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>R&D: {endorser.requirements.rdSpend}</p>
                          <p>Jobs: {endorser.requirements.jobCreation}</p>
                          <p>Innovation: {endorser.requirements.innovation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedEndorser && radarData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Criteria Fit Analysis</CardTitle>
                    <CardDescription>
                      Radar chart showing {ENDORSERS.find(e => e.id === selectedEndorser)?.name} compatibility across key criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="criterion" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights for your endorser selection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`tip-${index}`}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee Comparison Breakdown</CardTitle>
                  <CardDescription>Complete cost analysis for all endorsing bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {endorsersWithScores.map((endorser) => (
                      <div key={endorser.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{endorser.name}</p>
                          <p className="text-sm text-muted-foreground">
                            £{endorser.fees.endorsement.toLocaleString()} endorsement + (£{endorser.fees.checkIn.toLocaleString()} × 2 check-ins)
                          </p>
                        </div>
                        <p className="text-xl font-bold">£{endorser.fees.total.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline for endorsement application preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={`p-4 border-l-4 ${
                        item.priority === 'Critical' ? 'border-l-red-500' : 
                        item.priority === 'High' ? 'border-l-orange-500' : 
                        'border-l-blue-500'
                      }`} data-testid={`action-${index}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <Badge variant={item.priority === 'Critical' ? 'destructive' : 'secondary'}>
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">{item.week}</p>
                            <p className="text-sm text-muted-foreground">{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Alert className="border-primary bg-primary/5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription>
                  Following this action plan increases your endorsement approval probability by addressing all key requirements systematically. Budget 2-4 weeks for preparation before submission.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
