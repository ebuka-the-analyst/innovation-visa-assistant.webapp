import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, BookOpen, Zap, Target, Trophy, Lightbulb } from "lucide-react";
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "narrative-builder",
  toolName: "Compelling Narrative Builder",
  agent: "nova",
  greeting: "Hello! I'm Nova, your innovation storyteller. Let's craft a compelling narrative that will resonate with endorsing bodies. A powerful founder story can make the difference between approval and rejection.",
  questions: [
    {
      id: "founder_story",
      question: "Tell me your founder story. What's your background, what led you to this venture, and why are you uniquely positioned to solve this problem?",
      hint: "Include your professional experience, key achievements, and personal connection to the problem",
      fieldKey: "founderStory",
      minLength: 100
    },
    {
      id: "problem_discovery",
      question: "How did you discover the problem you're solving? What customer pain points have you validated?",
      hint: "Include specific customer interactions, research findings, and quantified impact of the problem",
      fieldKey: "problemDiscovery",
      minLength: 80
    },
    {
      id: "solution_journey",
      question: "Describe your solution journey. How has your solution evolved based on feedback and testing?",
      hint: "Show iterations, pivots, customer feedback incorporation, and what makes your approach innovative",
      fieldKey: "solutionJourney",
      minLength: 80
    },
    {
      id: "traction_milestones",
      question: "What traction have you achieved? Include specific metrics, customer wins, partnerships, or revenue.",
      hint: "Use concrete numbers: users, revenue, growth rates, partnerships, pilot results",
      fieldKey: "tractionMilestones",
      minLength: 60
    },
    {
      id: "vision_statement",
      question: "What is your vision for the company? Where do you see the business in 5 years?",
      hint: "Paint a clear picture of market impact at scale and how UK operations fit into global strategy",
      fieldKey: "visionStatement",
      minLength: 60
    },
    {
      id: "market_insight",
      question: "What unique market insights do you have about the UK market opportunity?",
      hint: "Include market size, growth trends, regulatory environment, and why now is the right time",
      fieldKey: "marketInsight",
      minLength: 50
    },
    {
      id: "competitive_advantage",
      question: "What is your competitive advantage? What barriers to entry do you create?",
      hint: "Describe unique differentiators, IP, proprietary technology, or network effects",
      fieldKey: "competitiveAdvantage",
      minLength: 50
    }
  ],
  completionMessage: "Wonderful! I've captured your narrative elements. Let me now analyze the strength of your story and provide recommendations to make it even more compelling for endorsers."
};

type NarrativeData = {
  founderStory: string;
  problemDiscovery: string;
  solutionJourney: string;
  tractionMilestones: string;
  visionStatement: string;
  marketInsight: string;
  competitiveAdvantage: string;
};

const SECTION_LABELS = {
  founderStory: 'Founder Story',
  problemDiscovery: 'Problem Discovery',
  solutionJourney: 'Solution Journey',
  tractionMilestones: 'Traction Milestones',
  visionStatement: 'Vision Statement',
  marketInsight: 'Market Insight',
  competitiveAdvantage: 'Competitive Advantage'
};

const WORD_TARGETS = {
  founderStory: 150,
  problemDiscovery: 120,
  solutionJourney: 140,
  tractionMilestones: 130,
  visionStatement: 100,
  marketInsight: 110,
  competitiveAdvantage: 100
};

const SECTION_ICONS = {
  founderStory: BookOpen,
  problemDiscovery: AlertTriangle,
  solutionJourney: Lightbulb,
  tractionMilestones: TrendingUp,
  visionStatement: Target,
  marketInsight: Zap,
  competitiveAdvantage: Trophy
};

export default function NarrativeBuilder() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('narrative-builder-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('narrative-builder-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('narrative-builder-mode', mode);
  }, [mode]);

  const [narrative, setNarrative] = useState<NarrativeData>({
    founderStory: '',
    problemDiscovery: '',
    solutionJourney: '',
    tractionMilestones: '',
    visionStatement: '',
    marketInsight: '',
    competitiveAdvantage: ''
  });
  const [activeTab, setActiveTab] = useState('builder');
  const [savedDate, setSavedDate] = useState('');

  const handleAiComplete = (answers: Record<string, string>) => {
    setNarrative({
      founderStory: answers.founderStory || '',
      problemDiscovery: answers.problemDiscovery || '',
      solutionJourney: answers.solutionJourney || '',
      tractionMilestones: answers.tractionMilestones || '',
      visionStatement: answers.visionStatement || '',
      marketInsight: answers.marketInsight || '',
      competitiveAdvantage: answers.competitiveAdvantage || ''
    });
    setMode('traditional');
  };

  const updateSection = (field: keyof NarrativeData, value: string) => {
    setNarrative(prev => ({ ...prev, [field]: value }));
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getTotalWords = (): number => {
    return Object.values(narrative).reduce((total, text) => total + countWords(text), 0);
  };

  const getCompletedSections = (): number => {
    return Object.values(narrative).filter(text => countWords(text) >= 50).length;
  };

  const getSectionCompletion = (field: keyof NarrativeData): number => {
    const words = countWords(narrative[field]);
    const target = WORD_TARGETS[field];
    return Math.min(100, Math.round((words / target) * 100));
  };

  const calculateNarrativeStrength = (): number => {
    const wordScore = Math.min(100, (getTotalWords() / 750) * 40);
    const completionScore = (getCompletedSections() / 7) * 30;
    
    let qualityScore = 0;
    const founderWords = countWords(narrative.founderStory);
    const problemWords = countWords(narrative.problemDiscovery);
    const solutionWords = countWords(narrative.solutionJourney);
    const tractionWords = countWords(narrative.tractionMilestones);
    const visionWords = countWords(narrative.visionStatement);
    
    if (founderWords >= 100) qualityScore += 6;
    if (problemWords >= 80) qualityScore += 6;
    if (solutionWords >= 100) qualityScore += 6;
    if (tractionWords >= 80) qualityScore += 6;
    if (visionWords >= 60) qualityScore += 6;
    
    return Math.round(wordScore + completionScore + qualityScore);
  };

  const getEmotionalImpactData = () => {
    return [
      {
        dimension: 'Founder Authenticity',
        value: Math.min(100, (countWords(narrative.founderStory) / 150) * 100),
        fullMark: 100
      },
      {
        dimension: 'Problem Urgency',
        value: Math.min(100, (countWords(narrative.problemDiscovery) / 120) * 100),
        fullMark: 100
      },
      {
        dimension: 'Solution Clarity',
        value: Math.min(100, (countWords(narrative.solutionJourney) / 140) * 100),
        fullMark: 100
      },
      {
        dimension: 'Traction Evidence',
        value: Math.min(100, (countWords(narrative.tractionMilestones) / 130) * 100),
        fullMark: 100
      },
      {
        dimension: 'Vision Ambition',
        value: Math.min(100, (countWords(narrative.visionStatement) / 100) * 100),
        fullMark: 100
      }
    ];
  };

  const getStoryArcData = () => {
    const sections = ['Founder', 'Problem', 'Solution', 'Traction', 'Vision', 'Market', 'Advantage'];
    const completions = [
      getSectionCompletion('founderStory'),
      getSectionCompletion('problemDiscovery'),
      getSectionCompletion('solutionJourney'),
      getSectionCompletion('tractionMilestones'),
      getSectionCompletion('visionStatement'),
      getSectionCompletion('marketInsight'),
      getSectionCompletion('competitiveAdvantage')
    ];
    
    return sections.map((section, i) => ({
      section,
      completion: completions[i],
      target: 100,
      engagement: Math.min(100, completions[i] * 0.9 + Math.random() * 10)
    }));
  };

  const totalWords = getTotalWords();
  const completedSections = getCompletedSections();
  const narrativeStrength = calculateNarrativeStrength();
  const isComplete = completedSections >= 7 && totalWords >= 600;
  const isOptimal = totalWords >= 700 && totalWords <= 900 && completedSections === 7;

  const getSerializedState = () => {
    return {
      narrative,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('narrative' in state) setNarrative(state.narrative);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('narrative-builder-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('narrative-builder-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('narrative-builder-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (countWords(narrative.founderStory) < 100) {
      tips.push("Founder Story needs depth - endorsing bodies want to see your personal connection to the problem. Include your background, what led you to this venture, and why you are uniquely positioned to solve this problem.");
    }
    
    if (countWords(narrative.problemDiscovery) < 80) {
      tips.push("Problem Discovery is underdeveloped - endorsers need to see evidence of deep customer understanding. Describe specific pain points, quantify the problem's impact, and explain how you discovered this opportunity.");
    }
    
    if (countWords(narrative.solutionJourney) < 100) {
      tips.push("Solution Journey requires more detail - explain the evolution of your solution, key iterations based on feedback, and what makes your approach innovative compared to existing alternatives.");
    }
    
    if (countWords(narrative.tractionMilestones) < 80) {
      tips.push("Traction Milestones must include concrete metrics - endorsers prioritize evidence over promises. Include specific numbers: users acquired, revenue generated, partnerships formed, pilot results, or customer testimonials.");
    }
    
    if (countWords(narrative.visionStatement) < 60) {
      tips.push("Vision Statement needs expansion - endorsers assess long-term potential. Paint a clear picture of market impact at scale, expansion plans, and how UK operations fit into your global strategy.");
    }
    
    if (totalWords < 600) {
      tips.push(`Your narrative is ${600 - totalWords} words below the minimum effective length. Endorsing bodies need comprehensive storytelling - aim for 700-900 words total to demonstrate strategic thinking and market understanding.`);
    }
    
    if (totalWords > 1000) {
      tips.push("Your narrative exceeds optimal length - endorsers have limited time per application. Focus on the most compelling elements and eliminate redundancy to maintain engagement.");
    }
    
    if (countWords(narrative.marketInsight) === 0) {
      tips.push("Market Insight is missing - endorsers need to see you understand the UK market landscape. Include addressable market size, growth trends, regulatory environment, and why now is the right time for your solution.");
    }
    
    if (countWords(narrative.competitiveAdvantage) === 0) {
      tips.push("Competitive Advantage is not defined - endorsers assess defensibility. Explain your unique differentiators, barriers to entry you create, intellectual property, proprietary technology, or network effects.");
    }
    
    if (!narrative.founderStory.toLowerCase().includes('experience') && countWords(narrative.founderStory) > 0) {
      tips.push("Founder Story should emphasize relevant experience and expertise - endorsers assess credibility through domain knowledge, previous ventures, technical skills, or industry relationships that position you for success.");
    }
    
    const hasNumbers = /\d/.test(narrative.tractionMilestones);
    if (!hasNumbers && countWords(narrative.tractionMilestones) > 0) {
      tips.push("Traction Milestones lack quantitative data - endorsers prioritize measurable progress. Include specific metrics: number of customers, revenue figures, growth rates, partnership scale, or user engagement statistics.");
    }
    
    if (narrativeStrength >= 80 && isOptimal) {
      tips.push("Excellent narrative strength - ensure storytelling flows logically from problem to solution to traction. Review for clarity, eliminate jargon, and verify every claim is supportable with evidence in your business plan.");
    }
    
    if (completedSections < 7) {
      const incomplete = Object.entries(narrative)
        .filter(([_, value]) => countWords(value) < 50)
        .map(([key]) => SECTION_LABELS[key as keyof NarrativeData])
        .slice(0, 3);
      tips.push(`Incomplete sections weaken your narrative: ${incomplete.join(', ')}. Each section builds endorser confidence - partial stories raise concerns about preparation and commitment.`);
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Draft founder story emphasizing domain expertise, entrepreneurial background, and personal connection to problem", 
        priority: "Critical" 
      },
      { 
        week: "Week 1", 
        action: "Document problem discovery process - customer interviews, market research, pain point validation methods", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Map solution journey showing iterations, customer feedback incorporation, and innovation evolution", 
        priority: "High" 
      },
      { 
        week: "Week 2", 
        action: "Compile traction evidence: quantitative metrics, customer testimonials, partnership agreements, revenue data", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Research UK market specifics - size, growth rate, regulatory landscape, competitive positioning", 
        priority: "High" 
      },
      { 
        week: "Week 2-3", 
        action: "Articulate vision statement with clear milestones, scalability path, and UK market strategic importance", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Define competitive advantages - unique technology, IP, network effects, team expertise, market timing", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Weave narrative into cohesive story arc - ensure logical flow from founder background to future vision", 
        priority: "Critical" 
      },
      { 
        week: "Week 3-4", 
        action: "Refine narrative for endorser audience - eliminate jargon, strengthen evidence, highlight UK opportunity", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Get narrative reviewed by mentor, advisor, or successful visa recipient for endorser perspective", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Verify all narrative claims are supported by evidence in business plan appendices", 
        priority: "Critical" 
      },
      { 
        week: "Week 4", 
        action: "Practice delivering narrative verbally for endorser interviews - 3-5 minute pitch version", 
        priority: "Medium" 
      },
      { 
        week: "Ongoing", 
        action: "Update traction milestones as business progresses - keep narrative current throughout application", 
        priority: "Medium" 
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPELLING NARRATIVE BUILDER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

NARRATIVE STRENGTH ANALYSIS
${'-'.repeat(70)}
Overall Narrative Strength: ${narrativeStrength}%
Total Word Count: ${totalWords} words
Target Range: 700-900 words
Sections Completed: ${completedSections}/7
Status: ${isComplete ? 'COMPLETE' : 'IN PROGRESS'}
Endorser Readiness: ${isOptimal ? 'OPTIMAL' : narrativeStrength >= 70 ? 'GOOD' : 'NEEDS WORK'}

SECTION BREAKDOWN
${'-'.repeat(70)}
${Object.entries(narrative).map(([key, value]) => {
  const words = countWords(value);
  const target = WORD_TARGETS[key as keyof NarrativeData];
  const completion = getSectionCompletion(key as keyof NarrativeData);
  return `${SECTION_LABELS[key as keyof NarrativeData]}:
  Word Count: ${words}/${target} words
  Completion: ${completion}%
  Status: ${words >= target * 0.8 ? 'STRONG' : words >= target * 0.5 ? 'ADEQUATE' : 'WEAK'}`;
}).join('\n\n')}

YOUR COMPELLING NARRATIVE
${'='.repeat(70)}

${Object.entries(narrative).map(([key, value]) => {
  if (countWords(value) === 0) return '';
  return `${SECTION_LABELS[key as keyof NarrativeData].toUpperCase()}
${'-'.repeat(70)}
${value.trim()}`;
}).filter(Boolean).join('\n\n')}

EMOTIONAL IMPACT ASSESSMENT
${'-'.repeat(70)}
Founder Authenticity: ${Math.round(getEmotionalImpactData()[0].value)}%
Problem Urgency: ${Math.round(getEmotionalImpactData()[1].value)}%
Solution Clarity: ${Math.round(getEmotionalImpactData()[2].value)}%
Traction Evidence: ${Math.round(getEmotionalImpactData()[3].value)}%
Vision Ambition: ${Math.round(getEmotionalImpactData()[4].value)}%

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

ENDORSER EVALUATION FRAMEWORK
${'-'.repeat(70)}
When reviewing your narrative, endorsing bodies assess:

1. FOUNDER CREDIBILITY
   - Does the founder have relevant domain expertise and experience?
   - Is there evidence of entrepreneurial capability or track record?
   - Does the personal story create trust and demonstrate commitment?
   - Are there credentials, achievements, or relationships that validate capability?

2. PROBLEM VALIDATION
   - Is the problem clearly articulated and significant?
   - Is there evidence of customer discovery and market validation?
   - Are pain points quantified with data or customer quotes?
   - Does the problem affect a substantial addressable market?

3. SOLUTION INNOVATION
   - Is the solution genuinely innovative or significantly improved?
   - Is the innovation journey documented with iterations and learnings?
   - Does the solution address root causes, not just symptoms?
   - Is there a defensible competitive advantage or IP position?

4. TRACTION DEMONSTRATION
   - Are there concrete metrics proving market validation?
   - Is customer acquisition, revenue, or engagement quantified?
   - Are partnerships or pilot programs with credible organizations?
   - Does traction trajectory indicate potential for scale?

5. MARKET OPPORTUNITY
   - Is the UK market size substantial and growing?
   - Is market timing favorable with clear catalysts or trends?
   - Is competitive landscape realistically assessed?
   - Are there regulatory tailwinds or favorable conditions?

6. VISION CLARITY
   - Is there a clear path from current state to market leadership?
   - Does the vision demonstrate ambition with achievable milestones?
   - Is UK establishment central to the growth strategy?
   - Are expansion plans and scaling logic articulated?

7. COMPETITIVE POSITIONING
   - Are unique differentiators clearly defined and defensible?
   - Is there evidence of barriers to entry or sustainable advantages?
   - Are network effects, IP, or proprietary assets described?
   - Does the advantage compound over time as the business scales?

NARRATIVE STORYTELLING PRINCIPLES
${'-'.repeat(70)}
Effective visa narratives follow these proven structures:

STORY ARC FRAMEWORK:
1. Hook: Start with your unique founder insight or pivotal moment
2. Context: Establish your background and credibility
3. Problem: Paint the pain point vividly with customer evidence
4. Journey: Show how you discovered and refined the solution
5. Proof: Demonstrate market validation with traction metrics
6. Vision: Inspire with ambitious but achievable future impact
7. Close: Connect back to why UK market is strategic to vision

EMOTIONAL ENGAGEMENT TECHNIQUES:
- Use specific anecdotes over general statements
- Include customer quotes or real interaction stories
- Quantify impact in human terms (time saved, lives improved)
- Show vulnerability in early challenges and how you overcame them
- Demonstrate learning mindset through iteration examples
- Connect personal motivation to broader market opportunity

CREDIBILITY SIGNALS:
- Name recognizable customers, partners, or advisors
- Cite third-party validation (awards, press, accelerators)
- Reference specific research or data sources
- Highlight team member credentials and relevant experience
- Mention intellectual property or proprietary technology
- Include concrete metrics with context (growth rates, retention)

ENDORSER PITCH OPTIMIZATION:
- Lead with strongest evidence (usually traction or innovation)
- Tailor emphasis to endorser's sector focus and priorities
- Address obvious concerns proactively (competition, timing, team)
- Use language that matches endorser's evaluation criteria
- Maintain professional tone while showing passion and commitment
- End sections with forward momentum and next milestones

NARRATIVE INTEGRATION CHECKLIST
${'-'.repeat(70)}
□ Founder story establishes relevant expertise and credibility
□ Problem discovery includes customer validation evidence
□ Solution journey documents innovation evolution and iterations
□ Traction milestones are quantified with specific metrics
□ Vision statement articulates clear path to market leadership
□ Market insight demonstrates UK-specific opportunity understanding
□ Competitive advantage identifies defensible differentiation
□ All claims are supportable with evidence in business plan
□ Narrative flows logically from background to future vision
□ Language is clear, professional, and free of jargon
□ Customer voice is incorporated through quotes or stories
□ Numbers and data points reinforce key assertions
□ UK market positioning is explicitly addressed
□ Innovation uniqueness is articulated with examples
□ Team capability is demonstrated not just stated
□ Timeline and milestones create sense of momentum

PREPARATION TIPS FOR ENDORSER INTERVIEW
${'-'.repeat(70)}
Your written narrative becomes your verbal pitch. Practice:

1. 3-MINUTE VERSION: Cover all sections concisely
   - 30 seconds: Founder background and problem insight
   - 45 seconds: Problem validation and market opportunity
   - 60 seconds: Solution innovation and traction evidence
   - 30 seconds: Vision and why UK is strategic
   - 15 seconds: Competitive advantages and next milestones

2. DEEP-DIVE READINESS: Be prepared to expand any section
   - Have specific customer stories for problem validation
   - Know exact traction metrics and growth trajectory
   - Articulate innovation with technical but accessible detail
   - Explain market size calculations and data sources
   - Describe team capabilities with specific examples

3. ANTICIPATED QUESTIONS:
   - "Why are you uniquely positioned to solve this problem?"
   - "What evidence proves customers will pay for this solution?"
   - "How is this different from existing alternatives?"
   - "What are your key assumptions and biggest risks?"
   - "Why does the UK market matter for your business?"
   - "What are your next 12-month milestones?"

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrative-builder-report-${Date.now()}.txt`;
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
            <h1 className="text-xl font-bold mb-2" data-testid="heading-narrative-builder">
              Compelling Narrative Builder
            </h1>
            <p className="text-lg text-muted-foreground">
              Craft your endorser pitch story - founder journey to market leadership
            </p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="narrative-builder"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Compelling Narrative Builder"
          />

          <div className="flex justify-end mt-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <div className="mt-6">
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            </div>
          ) : (
          <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-narrative-builder">
              <TabsTrigger value="builder" data-testid="tab-builder">Builder</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Narrative Strength Dashboard</CardTitle>
                  <CardDescription>
                    Build a compelling story that resonates with endorsing bodies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={narrativeStrength >= 80 ? "border-green-500" : narrativeStrength >= 60 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Narrative Strength</p>
                          <p className="text-xl font-bold" data-testid="text-narrative-strength">
                            {narrativeStrength}%
                          </p>
                          <Progress value={narrativeStrength} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {narrativeStrength >= 80 ? 'Excellent' : narrativeStrength >= 60 ? 'Good' : 'Needs Work'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={totalWords >= 700 && totalWords <= 900 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Words</p>
                          <p className="text-xl font-bold" data-testid="text-total-words">
                            {totalWords}
                          </p>
                          <Progress value={Math.min(100, (totalWords / 900) * 100)} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">Target: 700-900</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={completedSections === 7 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Sections Complete</p>
                          <p className="text-xl font-bold" data-testid="text-sections-complete">
                            {completedSections}/7
                          </p>
                          <Progress value={(completedSections / 7) * 100} className="mt-2" />
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {completedSections === 7 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!isComplete && totalWords > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {totalWords < 600 
                          ? `Add ${600 - totalWords} more words to meet minimum narrative length.`
                          : completedSections < 7 
                          ? `Complete ${7 - completedSections} more sections for full endorser impact.`
                          : 'Your narrative is progressing well - review Smart Tips for optimization.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isOptimal && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Outstanding narrative structure! Review Analysis tab for emotional impact and story arc flow.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-6">
                    {(Object.keys(narrative) as Array<keyof NarrativeData>).map((field) => {
                      const wordCount = countWords(narrative[field]);
                      const target = WORD_TARGETS[field];
                      const completion = getSectionCompletion(field);
                      const Icon = SECTION_ICONS[field];
                      
                      return (
                        <Card key={field}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-primary" />
                                <div>
                                  <CardTitle className="text-lg">{SECTION_LABELS[field]}</CardTitle>
                                  <CardDescription>
                                    {wordCount} / {target} words - {completion}% complete
                                  </CardDescription>
                                </div>
                              </div>
                              {wordCount >= target * 0.8 && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <Progress value={completion} className="mt-2" />
                          </CardHeader>
                          <CardContent>
                            <Label htmlFor={`narrative-${field}`} className="sr-only">
                              {SECTION_LABELS[field]}
                            </Label>
                            <Textarea
                              id={`narrative-${field}`}
                              value={narrative[field]}
                              onChange={(e) => updateSection(field, e.target.value)}
                              placeholder={getPlaceholder(field)}
                              className="min-h-40"
                              data-testid={`textarea-${field}`}
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Story Arc Timeline</CardTitle>
                    <CardDescription>Narrative flow and engagement progression</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={getStoryArcData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="section" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="completion" 
                          stackId="1"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6}
                          name="Completion %"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="engagement" 
                          stackId="2"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.4}
                          name="Engagement %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emotional Impact Gauge</CardTitle>
                    <CardDescription>Endorser resonance across narrative dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={getEmotionalImpactData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar 
                          name="Impact Score" 
                          dataKey="value" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6} 
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Narrative Assessment Insights</CardTitle>
                  <CardDescription>How endorsers will evaluate your story</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Founder Credibility</p>
                        <p className="text-sm text-muted-foreground">
                          {countWords(narrative.founderStory) >= 100 
                            ? 'Strong foundation - your background establishes trust and domain expertise'
                            : 'Needs expansion - endorsers assess capability through detailed founder journey'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Problem Validation</p>
                        <p className="text-sm text-muted-foreground">
                          {countWords(narrative.problemDiscovery) >= 80
                            ? 'Well-articulated - demonstrates customer understanding and market insight'
                            : 'Add customer evidence - endorsers want proof of deep problem validation'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Innovation Journey</p>
                        <p className="text-sm text-muted-foreground">
                          {countWords(narrative.solutionJourney) >= 100
                            ? 'Comprehensive evolution - shows learning mindset and iterative improvement'
                            : 'Document iterations - endorsers value evidence of solution refinement'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Market Validation</p>
                        <p className="text-sm text-muted-foreground">
                          {countWords(narrative.tractionMilestones) >= 80
                            ? 'Solid traction evidence - quantified metrics build endorser confidence'
                            : 'Quantify achievements - endorsers prioritize measurable market validation'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Strategic Vision</p>
                        <p className="text-sm text-muted-foreground">
                          {countWords(narrative.visionStatement) >= 60
                            ? 'Clear direction - ambitious yet achievable path to market leadership'
                            : 'Expand vision - endorsers assess long-term potential and UK strategic fit'}
                        </p>
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
                  <CardDescription>AI-powered guidance to strengthen your narrative for endorser evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Narrative Best Practices</CardTitle>
                  <CardDescription>Proven strategies from successful visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Lead with Strongest Evidence</p>
                        <p className="text-sm text-muted-foreground">
                          Start sections with your most compelling data or customer story to capture endorser attention immediately
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Quantify Everything Possible</p>
                        <p className="text-sm text-muted-foreground">
                          Numbers build credibility - include metrics for market size, traction, team experience, and milestones
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Show Don't Tell</p>
                        <p className="text-sm text-muted-foreground">
                          Use specific anecdotes and customer quotes instead of generic claims about value proposition
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Emphasize UK Strategic Importance</p>
                        <p className="text-sm text-muted-foreground">
                          Explicitly connect why UK market is central to your vision, not just convenient location
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Narrative Development Plan</CardTitle>
                  <CardDescription>Structured timeline to build endorser-ready compelling story</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border hover-elevate"
                        data-testid={`action-item-${index}`}
                      >
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.priority === 'Critical' 
                            ? 'bg-destructive/10 text-destructive' 
                            : item.priority === 'High'
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {item.priority}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.week}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interview Preparation Strategy</CardTitle>
                  <CardDescription>Convert written narrative into compelling verbal pitch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">3-Minute Pitch Structure</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• 30 seconds: Founder background and problem insight</li>
                        <li>• 45 seconds: Problem validation and market opportunity</li>
                        <li>• 60 seconds: Solution innovation and traction evidence</li>
                        <li>• 30 seconds: Vision and UK strategic importance</li>
                        <li>• 15 seconds: Competitive advantages and next milestones</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">Deep-Dive Readiness</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Prepare 3-5 specific customer stories for problem validation</li>
                        <li>• Memorize exact traction metrics and growth trajectories</li>
                        <li>• Articulate innovation with technical but accessible detail</li>
                        <li>• Know market size calculations and data sources</li>
                        <li>• Describe team capabilities with concrete examples</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
      </div>
    </>
  );
}

function getPlaceholder(field: keyof NarrativeData): string {
  const placeholders = {
    founderStory: "Describe your background, expertise, and what led you to found this venture. Include relevant experience, previous achievements, domain knowledge, and the personal insight or pivotal moment that sparked this entrepreneurial journey. Endorsers assess credibility through your story.",
    
    problemDiscovery: "Explain how you discovered this problem and validated it with customers. Include specific pain points, customer conversations, market research findings, and quantifiable impact of the problem. Show evidence of deep customer understanding and market need.",
    
    solutionJourney: "Describe how your solution evolved from initial concept to current state. Include key iterations, customer feedback that shaped development, technical innovations, and what makes your approach uniquely effective compared to alternatives. Document your learning process.",
    
    tractionMilestones: "Quantify your market validation with specific metrics: users acquired, revenue generated, partnerships formed, customer retention rates, pilot results, testimonials, or awards. Include growth trajectory and evidence that customers value your solution.",
    
    visionStatement: "Paint a clear picture of your company's future at scale. Describe market impact, expansion plans, revenue potential, and how UK operations fit into your global strategy. Show ambition backed by realistic milestones and strategic thinking.",
    
    marketInsight: "Demonstrate UK market understanding: addressable market size, growth rate, regulatory environment, competitive landscape, and why now is the right time for your solution. Include data sources and explain how you'll capture market share.",
    
    competitiveAdvantage: "Articulate what makes your business defensible: unique technology, intellectual property, network effects, team expertise, proprietary data, partnerships, or timing advantages. Explain barriers to entry and why competitors can't easily replicate your success."
  };
  
  return placeholders[field];
}
