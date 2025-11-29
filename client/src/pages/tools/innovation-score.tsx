import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Info, Lightbulb, Shield, Zap, Globe, Save, Sparkles } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema, createArticleSchema } from "@/lib/seo-schemas";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'innovation-score',
  toolName: 'Innovation Score Calculator',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. Let's assess your business innovation together! For UK Innovator Founder Visa endorsement, you need to demonstrate genuine innovation - let me help you articulate what makes your solution truly unique.",
  questions: [
    {
      id: 'is-core-innovation',
      question: "What is the core innovation in your business? Describe what makes your solution genuinely new or significantly improved compared to what already exists.",
      hint: "Focus on specific technical advancements, novel approaches, or unique methodologies - not just improvements to existing solutions.",
      fieldKey: 'core_innovation',
      minLength: 100
    },
    {
      id: 'is-novelty',
      question: "How novel is your approach? Is this something never done before, a significant improvement, or an innovative application of existing technology?",
      hint: "Endorsers look for genuine novelty. A new app doing the same thing isn't innovative - what's the technical or business model breakthrough?",
      fieldKey: 'novelty_assessment',
      minLength: 80
    },
    {
      id: 'is-technical-advancement',
      question: "What technical or scientific advancements does your solution incorporate? Describe any proprietary technology, algorithms, or methodologies.",
      hint: "Include specific technologies, patents pending, research papers, or technical differentiators.",
      fieldKey: 'technical_advancement',
      minLength: 80
    },
    {
      id: 'is-market-disruption',
      question: "How will your innovation disrupt the existing market? What problems does it solve that current solutions cannot?",
      hint: "Quantify the disruption if possible - 10x faster, 50% cheaper, reaching underserved markets, etc.",
      fieldKey: 'market_disruption',
      minLength: 80
    },
    {
      id: 'is-ip-strategy',
      question: "What's your IP protection strategy? Do you have patents, trade secrets, or other forms of intellectual property protection?",
      hint: "UK visa applications benefit from demonstrable IP. Include patent applications, trademarks, or copyright registrations.",
      fieldKey: 'ip_protection',
      minLength: 50
    },
    {
      id: 'is-rd-investment',
      question: "How much have you invested (or plan to invest) in R&D? What percentage of revenue will go to continued innovation?",
      hint: "R&D investment demonstrates commitment to ongoing innovation. Include team time, tools, research partnerships.",
      fieldKey: 'rd_investment',
      minLength: 40
    },
    {
      id: 'is-competitive-edge',
      question: "What makes your innovation defensible? How will you maintain competitive advantage as others try to copy your approach?",
      hint: "Network effects, data moats, switching costs, regulatory advantages, or continuous innovation pipeline.",
      fieldKey: 'competitive_edge',
      minLength: 60
    }
  ],
  completionMessage: "Excellent assessment! You've clearly articulated your innovation. These insights will help endorsers understand your unique value. I'm calculating your innovation score and populating the detailed breakdown."
};

type InnovationFactors = {
  novelty: number;
  technicalAdvancement: number;
  marketDisruption: number;
  ipProtection: number;
  rdInvestment: number;
};

type IndustryBenchmark = {
  sector: string;
  avgScore: number;
};

const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  { sector: "HealthTech", avgScore: 78 },
  { sector: "FinTech", avgScore: 75 },
  { sector: "AI/ML", avgScore: 82 },
  { sector: "CleanTech", avgScore: 76 },
  { sector: "EdTech", avgScore: 68 },
  { sector: "SaaS", avgScore: 65 },
];

export default function InnovationScore() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('innovation-score-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('innovation-score-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('innovation-score-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const estimateScore = (text: string): number => {
      if (!text) return 50;
      const length = text.length;
      const hasKeywords = ['unique', 'proprietary', 'patent', 'first', 'novel', 'breakthrough', 'disrupt'].some(k => 
        text.toLowerCase().includes(k)
      );
      let score = 40 + Math.min(30, length / 10);
      if (hasKeywords) score += 15;
      return Math.min(95, Math.round(score));
    };
    
    const newFactors = {
      novelty: estimateScore(answers.novelty_assessment || answers.core_innovation || ''),
      technicalAdvancement: estimateScore(answers.technical_advancement || ''),
      marketDisruption: estimateScore(answers.market_disruption || ''),
      ipProtection: estimateScore(answers.ip_protection || ''),
      rdInvestment: estimateScore(answers.rd_investment || '')
    };
    
    setFactors(newFactors);
    
    const state = {
      factors: newFactors,
      activeTab: 'overview',
      selectedSector: selectedSector,
      savedDate: new Date().toLocaleString('en-GB')
    };
    localStorage.setItem('innovation-score-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    setActiveTab('overview');
    
    setMode('traditional');
    toast({
      title: "Innovation Assessment Complete",
      description: "Your innovation scores have been calculated based on your responses. Review and adjust as needed.",
    });
  };
  
  const [factors, setFactors] = useState<InnovationFactors>(() => {
    const saved = localStorage.getItem('innovation-score-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.factors || {
          novelty: 50,
          technicalAdvancement: 50,
          marketDisruption: 50,
          ipProtection: 50,
          rdInvestment: 50
        };
      } catch { }
    }
    return {
      novelty: 50,
      technicalAdvancement: 50,
      marketDisruption: 50,
      ipProtection: 50,
      rdInvestment: 50
    };
  });

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('innovation-score-state');
    if (saved) {
      try { return JSON.parse(saved).activeTab || 'overview'; } catch { }
    }
    return 'overview';
  });
  const [savedDate, setSavedDate] = useState(() => {
    const saved = localStorage.getItem('innovation-score-state');
    if (saved) {
      try { return JSON.parse(saved).savedDate || ''; } catch { }
    }
    return '';
  });
  const [selectedSector, setSelectedSector] = useState(() => {
    const saved = localStorage.getItem('innovation-score-state');
    if (saved) {
      try { return JSON.parse(saved).selectedSector || 'FinTech'; } catch { }
    }
    return 'FinTech';
  });
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newFactors: InnovationFactors, newActiveTab: string, newSelectedSector: string) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      const state = {
        factors: newFactors,
        activeTab: newActiveTab,
        selectedSector: newSelectedSector,
        savedDate: new Date().toLocaleString('en-GB')
      };
      localStorage.setItem('innovation-score-state', JSON.stringify(state));
      setSavedDate(state.savedDate);
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateFactor = (field: keyof InnovationFactors, value: number) => {
    setFactors(prev => {
      const newFactors = { ...prev, [field]: value };
      triggerAutoSave(newFactors, activeTab, selectedSector);
      return newFactors;
    });
  };

  const innovationScore = Math.round(
    (factors.novelty * 0.25) +
    (factors.technicalAdvancement * 0.20) +
    (factors.marketDisruption * 0.20) +
    (factors.ipProtection * 0.20) +
    (factors.rdInvestment * 0.15)
  );

  const passThreshold = 65;
  const strongThreshold = 75;
  const meetsMinimum = innovationScore >= passThreshold;
  const isStrongCandidate = innovationScore >= strongThreshold;

  const radarData = [
    { factor: 'Novelty', value: factors.novelty, fullMark: 100 },
    { factor: 'Tech Advancement', value: factors.technicalAdvancement, fullMark: 100 },
    { factor: 'Market Disruption', value: factors.marketDisruption, fullMark: 100 },
    { factor: 'IP Protection', value: factors.ipProtection, fullMark: 100 },
    { factor: 'R&D Investment', value: factors.rdInvestment, fullMark: 100 },
  ];

  const benchmarkData = INDUSTRY_BENCHMARKS.map(b => ({
    sector: b.sector,
    yourScore: innovationScore,
    industryAvg: b.avgScore,
    gap: innovationScore - b.avgScore
  }));

  const getSerializedState = () => {
    return {
      factors,
      activeTab,
      selectedSector,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('factors' in state) setFactors(state.factors);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('selectedSector' in state) setSelectedSector(state.selectedSector);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'innovation-score_handoff';
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
      const saved = localStorage.getItem('innovation-score-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('innovation-score-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('innovation-score-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (factors.novelty < 60) {
      tips.push("Novelty Gap Identified: Your innovation must be genuinely new to the UK market. Document how your solution differs from existing UK alternatives with competitive analysis and unique value proposition evidence.");
    }
    if (factors.novelty >= 75) {
      tips.push("Strong Novelty Score: Excellent positioning. Prepare third-party validation from UK industry experts, academic researchers, or trade publications confirming your innovation's uniqueness in the UK context.");
    }
    if (factors.technicalAdvancement < 60) {
      tips.push("Technical Advancement Weakness: Demonstrate significant technical innovation through architecture diagrams, algorithm descriptions, or proprietary methodology documentation. GOV.UK requires evidence of genuine technical sophistication.");
    }
    if (factors.technicalAdvancement >= 75) {
      tips.push("Exceptional Technical Innovation: Your technical advancement score is strong. Prepare detailed technical documentation, system architecture diagrams, and if applicable, peer-reviewed publications or conference presentations.");
    }
    if (factors.marketDisruption < 60) {
      tips.push("Market Disruption Concerns: Quantify your market impact potential with TAM/SAM/SOM analysis, customer adoption projections, and evidence of business model innovation that challenges incumbent solutions.");
    }
    if (factors.marketDisruption >= 75) {
      tips.push("High Disruption Potential: Your market disruption capability is compelling. Support with letters of intent from potential customers, market research validating demand gap, and competitive positioning analysis.");
    }
    if (factors.ipProtection < 50) {
      tips.push("IP Protection Critical Weakness: Without strong IP protection (patents, trade secrets, proprietary technology), innovation claims are difficult to substantiate. File provisional patents immediately and document trade secrets comprehensively.");
    }
    if (factors.ipProtection >= 70) {
      tips.push("Robust IP Portfolio: Strong IP protection strengthens your application significantly. Ensure all patent applications, trademark registrations, and trade secret documentation are current and well-organized for submission.");
    }
    if (factors.rdInvestment < 50) {
      tips.push("R&D Investment Insufficient: Document your R&D activities with development timelines, technical milestones achieved, and financial investment in innovation. Include team time allocation to R&D activities and technology development roadmap.");
    }
    if (factors.rdInvestment >= 70) {
      tips.push("Substantial R&D Commitment: Your R&D investment demonstrates serious innovation commitment. Detail your research methodology, development process, iterative improvements, and measurable innovation outcomes.");
    }
    if (innovationScore < passThreshold) {
      tips.push("Overall Innovation Score Below Threshold: Your innovation score needs strengthening before endorsing body submission. Focus on your two weakest factors first - most rejections occur when multiple factors score below 60%.");
    }
    if (innovationScore >= strongThreshold) {
      tips.push("Outstanding Innovation Profile: Your overall innovation score positions you as a strong candidate. Ensure comprehensive evidence documentation across all five factors with verifiable third-party validation where possible.");
    }
    
    const weakestFactor = Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100]);
    if (weakestFactor[1] < 55) {
      tips.push(`Critical Focus Area - ${weakestFactor[0]}: This is your weakest factor at ${weakestFactor[1]}%. Prioritize strengthening this area with concrete evidence, expert validation, and detailed documentation before submission.`);
    }

    if (Math.max(...Object.values(factors)) - Math.min(...Object.values(factors)) > 35) {
      tips.push("Unbalanced Innovation Profile: Large gaps between factor scores may raise concerns. Endorsing bodies prefer well-rounded innovation profiles. Address weaker factors to demonstrate comprehensive innovation capability.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Complete comprehensive innovation audit across all five factors using GOV.UK Innovator Founder innovation criterion guidance",
      priority: "Critical"
    });
    
    if (factors.novelty < 70) {
      actions.push({
        week: "Week 1",
        action: "Conduct detailed competitive analysis documenting how your solution differs from all UK market alternatives - create comparison matrix with feature differentiation",
        priority: "Critical"
      });
    }
    
    if (factors.technicalAdvancement < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Prepare technical documentation package: system architecture diagrams, algorithm descriptions, data flow models, and technology stack justification",
        priority: "Critical"
      });
    }
    
    if (factors.ipProtection < 65) {
      actions.push({
        week: "Week 1-2",
        action: "Engage patent attorney for IP audit, file provisional patent applications for patentable innovations, document trade secrets with legal protocols",
        priority: "Critical"
      });
    }
    
    if (factors.marketDisruption < 70) {
      actions.push({
        week: "Week 2",
        action: "Develop market disruption evidence: TAM/SAM/SOM analysis with data sources, customer problem validation research, competitive positioning strategy document",
        priority: "High"
      });
    }
    
    if (factors.rdInvestment < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Document R&D activities comprehensively: development timeline, technical milestones achieved, team time allocation to innovation, financial investment breakdown",
        priority: "High"
      });
    }
    
    actions.push({
      week: "Week 3",
      action: "Gather third-party validation: industry expert endorsements, academic research collaboration evidence, customer testimonials validating innovation value",
      priority: "High"
    });
    
    actions.push({
      week: "Week 3",
      action: "Create innovation narrative document synthesizing all five factors into coherent story of genuine, viable UK market innovation",
      priority: "High"
    });
    
    actions.push({
      week: "Week 3-4",
      action: "Prepare evidence portfolio organized by factor: novelty proofs, technical specs, market research, IP documentation, R&D records",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Practice innovation criterion interview responses - be prepared to defend each factor score with specific evidence and measurable outcomes",
      priority: "Medium"
    });
    
    actions.push({
      week: "Week 4",
      action: "Review endorsing body-specific innovation emphasis (e.g., Envestors prioritizes commercial viability, UKES emphasizes innovation breadth)",
      priority: "Medium"
    });
    
    actions.push({
      week: "Ongoing",
      action: "Monitor innovation criterion updates in GOV.UK guidance and endorsing body communications - requirements evolve based on policy changes",
      priority: "Medium"
    });
    
    return actions.slice(0, 12);
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - INNOVATION SCORE ASSESSMENT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OVERALL INNOVATION ASSESSMENT
${'-'.repeat(80)}
Innovation Score: ${innovationScore}/100
Status: ${meetsMinimum ? (isStrongCandidate ? 'STRONG INNOVATION PROFILE' : 'MEETS MINIMUM INNOVATION THRESHOLD') : 'BELOW INNOVATION THRESHOLD'}
Pass Threshold: ${passThreshold}/100
Strong Candidate Threshold: ${strongThreshold}/100
Selected Industry Sector: ${selectedSector}

INNOVATION FACTORS BREAKDOWN (GOV.UK 2025 Innovation Criterion)
${'-'.repeat(80)}

1. NOVELTY (25% weighting): ${factors.novelty}/100
   Assessment: ${factors.novelty >= 70 ? 'STRONG - Genuine UK market innovation' : factors.novelty >= 60 ? 'ADEQUATE - Some differentiation present' : 'NEEDS IMPROVEMENT - Limited UK market novelty'}
   
   UK Innovation Visa Requirement: Business idea must be genuinely innovative, not 
   available in the UK market. Must demonstrate clear differentiation from existing 
   UK solutions with evidence of unique value proposition.
   
   Evidence Required:
   - Competitive analysis showing UK market gap
   - Unique value proposition documentation
   - Third-party expert validation of innovation claims
   - Market research confirming lack of equivalent UK alternatives

2. TECHNICAL ADVANCEMENT (20% weighting): ${factors.technicalAdvancement}/100
   Assessment: ${factors.technicalAdvancement >= 70 ? 'EXCELLENT - Significant technical sophistication' : factors.technicalAdvancement >= 60 ? 'ADEQUATE - Some technical innovation' : 'NEEDS IMPROVEMENT - Limited technical depth'}
   
   UK Innovation Visa Requirement: Must demonstrate genuine technical advancement
   beyond simple implementation or marginal improvements. Technological innovation
   should represent meaningful progress in the field.
   
   Evidence Required:
   - System architecture diagrams and technical specifications
   - Algorithm descriptions or proprietary methodology documentation
   - Technology stack justification and innovation rationale
   - Peer-reviewed publications or conference presentations (if applicable)

3. MARKET DISRUPTION (20% weighting): ${factors.marketDisruption}/100
   Assessment: ${factors.marketDisruption >= 70 ? 'STRONG - Significant market impact potential' : factors.marketDisruption >= 60 ? 'MODERATE - Some market transformation capability' : 'WEAK - Limited disruption potential'}
   
   UK Innovation Visa Requirement: Business must have potential to create structural
   change in target market, challenge incumbents, or enable new market creation
   through innovative business model or technology application.
   
   Evidence Required:
   - TAM/SAM/SOM market sizing with credible data sources
   - Customer problem validation research
   - Business model innovation documentation
   - Letters of intent from potential customers

4. INTELLECTUAL PROPERTY PROTECTION (20% weighting): ${factors.ipProtection}/100
   Assessment: ${factors.ipProtection >= 70 ? 'ROBUST - Strong IP protection strategy' : factors.ipProtection >= 60 ? 'BASIC - Some IP protection measures' : 'WEAK - Insufficient IP protection'}
   
   UK Innovation Visa Requirement: Clear IP strategy demonstrating protectable
   innovation. Patents pending, trade secrets documented, or proprietary technology
   with competitive barriers to replication.
   
   Evidence Required:
   - Patent applications (provisional or full) with filing receipts
   - Trade secret documentation with legal protection protocols
   - Trademark registrations for brand protection
   - IP strategy document outlining protection roadmap

5. R&D INVESTMENT (15% weighting): ${factors.rdInvestment}/100
   Assessment: ${factors.rdInvestment >= 70 ? 'SUBSTANTIAL - Significant innovation commitment' : factors.rdInvestment >= 60 ? 'MODERATE - Some R&D investment' : 'MINIMAL - Limited innovation investment'}
   
   UK Innovation Visa Requirement: Demonstrated commitment to research and development
   through financial investment, team time allocation, and measurable innovation
   outcomes. R&D activities should be systematic and goal-oriented.
   
   Evidence Required:
   - R&D timeline with technical milestones achieved
   - Team time allocation to innovation activities (% of total effort)
   - Financial investment breakdown in R&D vs operations
   - Innovation outcomes: prototypes, MVPs, pilot results

INNOVATION FACTOR ANALYSIS
${'-'.repeat(80)}
Strongest Factor: ${Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[0]} (${Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[1]}%)
Weakest Factor: ${Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[0]} (${Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[1]}%)
Factor Range: ${Math.max(...Object.values(factors)) - Math.min(...Object.values(factors))}% 
${Math.max(...Object.values(factors)) - Math.min(...Object.values(factors)) > 30 ? '[WARNING] Large variation between factors - aim for balanced profile' : '[OK] Reasonably balanced innovation profile'}

INDUSTRY BENCHMARK COMPARISON
${'-'.repeat(80)}
Your Innovation Score: ${innovationScore}%
Selected Sector: ${selectedSector}
${benchmarkData.find(b => b.sector === selectedSector) ? `
${selectedSector} Industry Average: ${benchmarkData.find(b => b.sector === selectedSector)?.industryAvg}%
Performance vs Sector: ${benchmarkData.find(b => b.sector === selectedSector)?.gap}% ${(benchmarkData.find(b => b.sector === selectedSector)?.gap ?? 0) >= 0 ? 'ABOVE' : 'BELOW'} average
Percentile Estimate: ${innovationScore > (benchmarkData.find(b => b.sector === selectedSector)?.industryAvg ?? 0) + 10 ? 'Top 25%' : innovationScore > (benchmarkData.find(b => b.sector === selectedSector)?.industryAvg ?? 0) ? 'Top 50%' : 'Bottom 50%'}
` : ''}
Cross-Sector Comparison:
${benchmarkData.map(b => `  ${b.sector}: Industry Avg ${b.industryAvg}% | Your Score ${b.yourScore}% | Gap: ${b.gap >= 0 ? '+' : ''}${b.gap}%`).join('\n')}

ENDORSING BODY INNOVATION CRITERION ALIGNMENT
${'-'.repeat(80)}
${innovationScore >= 75 ? '[EXCELLENT FIT]' : innovationScore >= 65 ? '[ACCEPTABLE FIT]' : '[BELOW STANDARD]'} UKES (Innovation-focused endorser)
  - Emphasizes technical depth and genuine UK market innovation
  - Typical successful applicants score 75%+ on innovation criterion
  - Your score: ${innovationScore}% ${innovationScore >= 75 ? '- Strong match' : innovationScore >= 65 ? '- Borderline, strengthen evidence' : '- Needs significant improvement'}

${innovationScore >= 70 ? '[EXCELLENT FIT]' : innovationScore >= 60 ? '[ACCEPTABLE FIT]' : '[BELOW STANDARD]'} Innovator International
  - Balanced innovation and viability focus
  - Typical successful applicants score 70%+ overall with 60%+ innovation
  - Your score: ${innovationScore}% ${innovationScore >= 70 ? '- Strong match' : innovationScore >= 60 ? '- Acceptable, prepare comprehensive evidence' : '- Needs improvement'}

${innovationScore >= 80 ? '[EXCELLENT FIT]' : innovationScore >= 70 ? '[ACCEPTABLE FIT]' : '[BELOW STANDARD]'} UK University Routes
  - Highest innovation standards, research-focused
  - Typical successful applicants score 80%+ on innovation criterion
  - Your score: ${innovationScore}% ${innovationScore >= 80 ? '- Exceptional match' : innovationScore >= 70 ? '- Possible with very strong evidence' : '- Not recommended'}

INNOVATION CRITERION CRITICAL SUCCESS FACTORS
${'-'.repeat(80)}
${factors.novelty >= 65 ? '[PASS]' : '[FAIL]'} Genuine UK market innovation with clear differentiation from existing solutions
${factors.technicalAdvancement >= 60 ? '[PASS]' : '[FAIL]'} Meaningful technical advancement beyond incremental improvements
${factors.marketDisruption >= 60 ? '[PASS]' : '[FAIL]'} Credible market disruption potential with evidence-based projections
${factors.ipProtection >= 50 ? '[PASS]' : '[FAIL]'} IP protection strategy with patents, trade secrets, or proprietary technology
${factors.rdInvestment >= 50 ? '[PASS]' : '[FAIL]'} Demonstrated R&D commitment through investment and systematic innovation
${innovationScore >= 65 ? '[PASS]' : '[FAIL]'} Overall innovation score meets endorsing body minimum threshold

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK INNOVATION EVIDENCE ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

INNOVATION EVIDENCE CHECKLIST
${'-'.repeat(80)}
Novelty Evidence:
  [ ] Competitive analysis comparing your solution to all UK market alternatives
  [ ] Unique value proposition document with clear differentiation statement
  [ ] Third-party expert validation letters confirming innovation uniqueness
  [ ] Market research reports demonstrating UK market gap
  [ ] Customer problem validation research and needs assessment

Technical Advancement Evidence:
  [ ] System architecture diagrams showing technical sophistication
  [ ] Algorithm descriptions or proprietary methodology documentation
  [ ] Technology stack justification and innovation rationale
  [ ] Code samples or technical specifications (if applicable)
  [ ] Peer-reviewed publications or conference presentations (if applicable)

Market Disruption Evidence:
  [ ] Total Addressable Market (TAM) sizing with credible data sources
  [ ] Serviceable Addressable Market (SAM) and Serviceable Obtainable Market (SOM)
  [ ] Customer letters of intent or signed pilot agreements
  [ ] Business model innovation documentation
  [ ] Competitive positioning analysis and go-to-market strategy

IP Protection Evidence:
  [ ] Patent applications (provisional or full) with filing receipts
  [ ] Trade secret documentation with legal protection protocols
  [ ] Trademark registrations and brand protection strategy
  [ ] IP strategy document outlining protection roadmap
  [ ] Legal opinion on IP strength (if available)

R&D Investment Evidence:
  [ ] R&D timeline with technical milestones and achievements
  [ ] Team time allocation breakdown (% to R&D vs operations)
  [ ] Financial investment in R&D activities and innovation
  [ ] Development process documentation and iteration history
  [ ] Measurable innovation outcomes: prototypes, MVPs, pilot results

NEXT STEPS FOR INNOVATION CRITERION SUCCESS
${'-'.repeat(80)}
1. Address weakest innovation factor first (currently: ${Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[0]} at ${Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[1]}%)
2. Gather comprehensive evidence for each factor following checklist above
3. Obtain third-party validation from UK industry experts or academics
4. Prepare innovation narrative synthesizing all factors into coherent story
5. Review endorsing body-specific innovation emphasis and requirements
6. Practice innovation criterion interview responses with evidence references
7. Organize evidence portfolio by factor for easy endorsing body review

IMPORTANT INNOVATION CRITERION NOTES
${'-'.repeat(80)}
- Innovation is assessed relative to UK market, not global market
- Incremental improvements rarely qualify as genuine innovation
- Technical complexity alone insufficient without market application
- IP protection significantly strengthens innovation claims
- Third-party validation critical for subjective innovation assessments
- Endorsing bodies conduct technical interviews to verify claims
- All innovation evidence must be independently verifiable
- Balance across factors preferred over single exceptional factor

INNOVATION RISK ASSESSMENT
${'-'.repeat(80)}
${innovationScore < 65 ? 'HIGH RISK: Innovation score below typical approval threshold. Significant strengthening required before submission.' : ''}
${innovationScore >= 65 && innovationScore < 75 ? 'MODERATE RISK: Meets minimum but not competitive. Consider strengthening evidence before submission to improve approval odds.' : ''}
${innovationScore >= 75 ? 'LOW RISK: Strong innovation profile. Focus on comprehensive evidence documentation and interview preparation.' : ''}
${factors.ipProtection < 50 ? 'CRITICAL: IP protection weakness may be fatal flaw. Prioritize patent filings or trade secret documentation immediately.' : ''}
${Math.max(...Object.values(factors)) - Math.min(...Object.values(factors)) > 35 ? 'WARNING: Unbalanced factor profile may raise concerns. Address weaker factors to demonstrate well-rounded innovation.' : ''}

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant - Innovation Score Tool
© 2025 innovatorfoundervisaassistant.co.uk
Based on GOV.UK Innovator Founder visa guidance updated November 2025

DISCLAIMER: This assessment is self-evaluated and for planning purposes only.
Actual endorsing body evaluation may differ. Seek professional immigration advice
for official assessment and application preparation.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `innovation-score-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const strongestFactor = Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0]);
    const weakestFactor = Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100]);
    
    await generateWord({
      title: 'Innovation Score Assessment',
      subtitle: 'UK Innovator Founder Visa Innovation Criterion Evaluation',
      filename: `innovation-score-report-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'heading', content: 'Overall Innovation Assessment', level: 1 },
        { type: 'score', score: { value: innovationScore, max: 100, label: 'Innovation Score' } },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Status', meetsMinimum ? (isStrongCandidate ? 'Strong Innovation Profile' : 'Meets Minimum Threshold') : 'Below Threshold'],
            ['Pass Threshold', `${passThreshold}/100`],
            ['Strong Candidate Threshold', `${strongThreshold}/100`],
            ['Selected Industry Sector', selectedSector],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Innovation Factors Breakdown', level: 1 },
        { type: 'table', tableData: {
          headers: ['Factor', 'Score', 'Weight', 'Assessment'],
          rows: [
            ['Novelty', `${factors.novelty}/100`, '25%', factors.novelty >= 70 ? 'Strong' : factors.novelty >= 60 ? 'Adequate' : 'Needs Improvement'],
            ['Technical Advancement', `${factors.technicalAdvancement}/100`, '20%', factors.technicalAdvancement >= 70 ? 'Excellent' : factors.technicalAdvancement >= 60 ? 'Adequate' : 'Needs Improvement'],
            ['Market Disruption', `${factors.marketDisruption}/100`, '20%', factors.marketDisruption >= 70 ? 'Strong' : factors.marketDisruption >= 60 ? 'Moderate' : 'Weak'],
            ['IP Protection', `${factors.ipProtection}/100`, '20%', factors.ipProtection >= 70 ? 'Robust' : factors.ipProtection >= 60 ? 'Basic' : 'Weak'],
            ['R&D Investment', `${factors.rdInvestment}/100`, '15%', factors.rdInvestment >= 70 ? 'Substantial' : factors.rdInvestment >= 60 ? 'Moderate' : 'Minimal'],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Factor Analysis', level: 1 },
        { type: 'table', tableData: {
          headers: ['Analysis', 'Details'],
          rows: [
            ['Strongest Factor', `${String(strongestFactor[0]).replace(/([A-Z])/g, ' $1').trim()} (${strongestFactor[1]}%)`],
            ['Weakest Factor', `${String(weakestFactor[0]).replace(/([A-Z])/g, ' $1').trim()} (${weakestFactor[1]}%)`],
            ['Factor Range', `${Math.max(...Object.values(factors)) - Math.min(...Object.values(factors))}%`],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Industry Benchmark Comparison', level: 1 },
        { type: 'table', tableData: {
          headers: ['Sector', 'Industry Average', 'Your Score', 'Gap'],
          rows: benchmarkData.map(b => [b.sector, `${b.industryAvg}%`, `${b.yourScore}%`, `${b.gap >= 0 ? '+' : ''}${b.gap}%`])
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Smart Recommendations', level: 1 },
        { type: 'list', items: getSmartTips().slice(0, 8) },
        { type: 'divider' },
        { type: 'heading', content: 'Action Plan', level: 1 },
        { type: 'table', tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().slice(0, 8).map(item => [item.week, item.action, item.priority])
        }},
      ],
      metadata: {
        subject: 'Innovation Score Assessment for UK Innovator Founder Visa',
        keywords: ['innovation', 'score', 'visa', 'assessment'],
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" },
    { name: "Innovation Score Calculator", url: "https://innovatorfoundervisaassistant.co.uk/tools/innovation-score" }
  ]);

  const articleSchema = createArticleSchema(
    "Innovation Score Calculator for UK Innovator Founder Visa",
    "Comprehensive innovation assessment tool measuring novelty, technical advancement, market disruption, IP protection, and R&D investment for your UK Innovator Founder Visa application.",
    "2025-11-24"
  );

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, articleSchema]
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Innovation Score Calculator">
      <SEOHead
        title="Innovation Score Calculator | UK Innovator Founder Visa Assessment"
        description="Calculate your innovation score for UK Innovator Founder Visa applications. Assess novelty, technical advancement, market disruption, IP protection, and R&D investment with industry benchmarks."
        canonical="https://innovatorfoundervisaassistant.co.uk/tools/innovation-score"
        keywords="innovation score calculator, UK visa innovation assessment, Innovator Founder Visa criteria, innovation evaluation tool, visa innovation requirements"
        schema={combinedSchema}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-innovation-score">Innovation Score Assessment</h1>
                <p className="text-lg text-muted-foreground">Comprehensive evaluation of UK Innovator Founder Visa innovation criterion</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle
                mode={mode}
                onModeChange={setMode}
                aiLabel="AI-Guided"
                traditionalLabel="Calculator"
                userTier={userTier}
              />
            </div>
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Nova, our Innovation Specialist, helps you articulate your innovation through guided conversation.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Learn what endorsers look for in innovation</li>
                    <li>Get feedback on your unique value proposition</li>
                    <li>Understand UK-specific innovation criteria</li>
                    <li>Earn XP as you complete each assessment</li>
                  </ul>
                  <p className="pt-2">Your innovation factors will be calculated and populated in the detailed view when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
              <ToolUtilityBar
                toolId="innovation-score"
                onSave={handleSave}
                onRestore={handleRestore}
                onExportPdf={handleExportPdf}
                onExportWord={handleExportWord}
                getSerializedState={getSerializedState}
                toolName="Innovation Score"
              />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5" data-testid="tabs-innovation-score">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="benchmarks" data-testid="tab-benchmarks">Benchmarks</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Innovation Score Summary</CardTitle>
                  <CardDescription>UK Innovator Founder Visa - Innovation Criterion Assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={meetsMinimum ? (isStrongCandidate ? "border-green-500" : "border-blue-500") : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Innovation Score</p>
                          <p className="text-5xl font-bold" data-testid="text-innovation-score">{innovationScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-3">
                            {isStrongCandidate ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : meetsMinimum ? (
                              <CheckCircle2 className="h-6 w-6 text-blue-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-destructive" />
                            )}
                            <span className="text-sm font-medium">
                              {isStrongCandidate ? 'Strong Profile' : meetsMinimum ? 'Meets Minimum' : 'Below Threshold'}
                            </span>
                          </div>
                          <Progress value={innovationScore} className="mt-4" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Strongest Factor</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-strongest-factor">
                            {Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[0].replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-4xl font-bold mt-2">{Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[1]}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Leading Advantage</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Weakest Factor</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-weakest-factor">
                            {Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[0].replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-4xl font-bold mt-2">{Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[1]}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span className="text-sm">Priority Focus</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive" data-testid="alert-below-threshold">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your innovation score of {innovationScore}% is below the minimum threshold of {passThreshold}%. Most endorsing bodies require scores above this level for approval. Focus on strengthening your weakest factors urgently.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !isStrongCandidate && (
                    <Alert data-testid="alert-meets-minimum">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum threshold, but scores above {strongThreshold}% significantly improve approval chances and competitiveness across endorsing bodies. Consider strengthening evidence before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isStrongCandidate && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-strong-candidate">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent innovation profile! Your score of {innovationScore}% positions you as a strong candidate. Focus on comprehensive evidence documentation and third-party validation to support your claims during endorsing body evaluation.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation Factor Radar Analysis</CardTitle>
                  <CardDescription>Visual assessment of your innovation profile across five key factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="factor" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Radar name="Your Scores" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Radar name="Pass Threshold (65%)" dataKey={() => 65} stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Radar name="Strong Threshold (75%)" dataKey={() => 75} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.05} />
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Innovation Factor Breakdown</CardTitle>
                    <CardDescription>Weighted contribution to overall score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Novelty</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{factors.novelty}% (25% weight)</span>
                        </div>
                        <Progress value={factors.novelty} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Technical Advancement</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{factors.technicalAdvancement}% (20% weight)</span>
                        </div>
                        <Progress value={factors.technicalAdvancement} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Market Disruption</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{factors.marketDisruption}% (20% weight)</span>
                        </div>
                        <Progress value={factors.marketDisruption} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">IP Protection</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{factors.ipProtection}% (20% weight)</span>
                        </div>
                        <Progress value={factors.ipProtection} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">R&D Investment</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{factors.rdInvestment}% (15% weight)</span>
                        </div>
                        <Progress value={factors.rdInvestment} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Innovation Criterion Requirements</CardTitle>
                    <CardDescription>GOV.UK Innovator Founder visa innovation standards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Genuine UK Market Innovation</p>
                          <p className="text-sm text-muted-foreground">Must be genuinely innovative and not available in UK market</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Significant Technical Advancement</p>
                          <p className="text-sm text-muted-foreground">Beyond incremental improvements or simple implementations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Market Transformation Potential</p>
                          <p className="text-sm text-muted-foreground">Credible evidence of market disruption capability</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">IP Protection Strategy</p>
                          <p className="text-sm text-muted-foreground">Patents, trade secrets, or proprietary technology protection</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">R&D Commitment Evidence</p>
                          <p className="text-sm text-muted-foreground">Systematic innovation activities with measurable outcomes</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Innovation Factor Assessment</CardTitle>
                  <CardDescription>Evaluate each factor on a scale of 0-100%</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="novelty-slider" className="text-base font-semibold flex items-center gap-2">
                          <Zap className="h-5 w-5 text-blue-500" />
                          Novelty (25% weight)
                        </Label>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-novelty-value">{factors.novelty}%</span>
                      </div>
                      <Slider
                        id="novelty-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[factors.novelty]}
                        onValueChange={([value]) => updateFactor('novelty', value)}
                        className="mb-2"
                        data-testid="slider-novelty"
                      />
                      <p className="text-sm text-muted-foreground">
                        How genuinely new is your solution compared to existing UK market alternatives? Consider uniqueness of approach, absence of equivalent solutions, and differentiation from incumbents.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="technical-slider" className="text-base font-semibold flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Technical Advancement (20% weight)
                        </Label>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-technical-value">{factors.technicalAdvancement}%</span>
                      </div>
                      <Slider
                        id="technical-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[factors.technicalAdvancement]}
                        onValueChange={([value]) => updateFactor('technicalAdvancement', value)}
                        className="mb-2"
                        data-testid="slider-technical"
                      />
                      <p className="text-sm text-muted-foreground">
                        Level of technical sophistication beyond simple implementations. Consider proprietary algorithms, novel architectures, advanced technology application, or research-based innovations.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="disruption-slider" className="text-base font-semibold flex items-center gap-2">
                          <Globe className="h-5 w-5 text-purple-500" />
                          Market Disruption (20% weight)
                        </Label>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-disruption-value">{factors.marketDisruption}%</span>
                      </div>
                      <Slider
                        id="disruption-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[factors.marketDisruption]}
                        onValueChange={([value]) => updateFactor('marketDisruption', value)}
                        className="mb-2"
                        data-testid="slider-disruption"
                      />
                      <p className="text-sm text-muted-foreground">
                        Potential to create structural market change, challenge incumbents, or enable new markets. Consider business model innovation, market transformation capability, and scalability potential.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="ip-slider" className="text-base font-semibold flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          IP Protection (20% weight)
                        </Label>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-ip-value">{factors.ipProtection}%</span>
                      </div>
                      <Slider
                        id="ip-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[factors.ipProtection]}
                        onValueChange={([value]) => updateFactor('ipProtection', value)}
                        className="mb-2"
                        data-testid="slider-ip"
                      />
                      <p className="text-sm text-muted-foreground">
                        Strength of intellectual property protection. Consider patents filed/pending, trade secrets documented with legal protection, proprietary technology, or competitive barriers to replication.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="rd-slider" className="text-base font-semibold flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          R&D Investment (15% weight)
                        </Label>
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-rd-value">{factors.rdInvestment}%</span>
                      </div>
                      <Slider
                        id="rd-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[factors.rdInvestment]}
                        onValueChange={([value]) => updateFactor('rdInvestment', value)}
                        className="mb-2"
                        data-testid="slider-rd"
                      />
                      <p className="text-sm text-muted-foreground">
                        Level of investment in research and development activities. Consider financial investment, team time allocation, systematic innovation processes, and measurable outcomes (prototypes, MVPs, pilots).
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Calculated Innovation Score</h3>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-primary" data-testid="text-calculated-score">{innovationScore}%</p>
                        <p className="text-sm text-muted-foreground">Weighted average</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmark Comparison</CardTitle>
                  <CardDescription>Compare your innovation score against sector averages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="sector-select" className="font-medium">Your Industry Sector:</Label>
                    <select
                      id="sector-select"
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-sector"
                    >
                      {INDUSTRY_BENCHMARKS.map(b => (
                        <option key={b.sector} value={b.sector}>{b.sector}</option>
                      ))}
                    </select>
                  </div>

                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="sector" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="yourScore" fill="#3b82f6" name="Your Innovation Score" />
                      <Bar dataKey="industryAvg" fill="#10b981" name="Industry Average" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid md:grid-cols-2 gap-4">
                    {benchmarkData.map(b => (
                      <Card key={b.sector} className={b.sector === selectedSector ? "border-primary" : ""}>
                        <CardContent className="pt-6">
                          <h4 className="font-semibold mb-3">{b.sector}</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Your Score:</span>
                              <span className="font-bold">{b.yourScore}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Industry Avg:</span>
                              <span className="font-bold">{b.industryAvg}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Gap:</span>
                              <span className={`font-bold ${b.gap >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {b.gap >= 0 ? '+' : ''}{b.gap}%
                              </span>
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
                  <CardTitle>Endorsing Body Innovation Requirements</CardTitle>
                  <CardDescription>Different endorsers emphasize innovation criterion differently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">UKES (UK Endorsing Services)</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${innovationScore >= 75 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : innovationScore >= 65 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                          {innovationScore >= 75 ? 'Strong Fit' : innovationScore >= 65 ? 'Borderline' : 'Below Standard'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Emphasizes deep technical innovation and genuine UK market novelty. Typical successful applicants score 75%+ on innovation criterion.
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (innovationScore / 75) * 100)} className="flex-1" />
                        <span className="text-sm font-medium">{innovationScore}%</span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Innovator International</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${innovationScore >= 70 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : innovationScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                          {innovationScore >= 70 ? 'Strong Fit' : innovationScore >= 60 ? 'Acceptable' : 'Below Standard'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Balanced focus on innovation and viability. Typical successful applicants score 70%+ overall with 60%+ on innovation.
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (innovationScore / 70) * 100)} className="flex-1" />
                        <span className="text-sm font-medium">{innovationScore}%</span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">UK University Routes</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${innovationScore >= 80 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : innovationScore >= 70 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                          {innovationScore >= 80 ? 'Excellent Fit' : innovationScore >= 70 ? 'Possible' : 'Not Recommended'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Highest innovation standards, research-focused. Typical successful applicants score 80%+ on innovation criterion.
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (innovationScore / 80) * 100)} className="flex-1" />
                        <span className="text-sm font-medium">{innovationScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Innovation Tips</CardTitle>
                  <CardDescription>Personalized recommendations based on your innovation profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg" data-testid={`tip-${index}`}>
                        <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Innovation Evidence Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to strengthen your innovation criterion evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg" data-testid={`action-${index}`}>
                        <div className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                          item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                          item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                          'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        }`}>
                          {item.priority}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-1">{item.week}</p>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
