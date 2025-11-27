import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

type SectionData = {
  companyOverview: string;
  problemStatement: string;
  solution: string;
  marketOpportunity: string;
  businessModel: string;
  traction: string;
  team: string;
  fundingAsk: string;
  vision: string;
};

const SECTION_LABELS = {
  companyOverview: 'Company Overview',
  problemStatement: 'Problem Statement',
  solution: 'Solution',
  marketOpportunity: 'Market Opportunity',
  businessModel: 'Business Model',
  traction: 'Traction',
  team: 'Team',
  fundingAsk: 'Funding Ask',
  vision: 'Vision'
};

const WORD_TARGETS = {
  companyOverview: 80,
  problemStatement: 70,
  solution: 90,
  marketOpportunity: 80,
  businessModel: 70,
  traction: 80,
  team: 70,
  fundingAsk: 60,
  vision: 50
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'exec-summary',
  toolName: 'Executive Summary Builder',
  agent: 'nova',
  greeting: "Hi! I'm Nova, your Innovation Specialist. I'll help you craft a compelling executive summary that will impress endorsing bodies. Let's build your story section by section. Ready to get started?",
  questions: [
    {
      id: 'company-overview',
      question: "Let's start with your company overview. Tell me about your business - what does it do, when was it founded, and what stage is it at?",
      hint: "Include your company name, core offering, founding date, and current stage (pre-revenue, early revenue, scaling)",
      fieldKey: 'companyOverview',
      minLength: 50
    },
    {
      id: 'problem-statement',
      question: "What problem are you solving? Describe the pain point your target customers face and why existing solutions fall short.",
      hint: "Quantify the problem if possible - how many people affected, cost of the problem, etc.",
      fieldKey: 'problemStatement',
      minLength: 50
    },
    {
      id: 'solution',
      question: "How does your product or service solve this problem? What makes your approach unique and innovative?",
      hint: "Focus on your differentiation and why your solution is better than alternatives",
      fieldKey: 'solution',
      minLength: 50
    },
    {
      id: 'market-opportunity',
      question: "Describe your market opportunity. What's the size of your addressable market and what's driving growth?",
      hint: "Include TAM/SAM/SOM figures with sources, market trends, and UK-specific opportunity",
      fieldKey: 'marketOpportunity',
      minLength: 50
    },
    {
      id: 'business-model',
      question: "How do you make money? Explain your revenue model, pricing strategy, and path to profitability.",
      hint: "Include specific pricing, customer acquisition cost, lifetime value if known",
      fieldKey: 'businessModel',
      minLength: 50
    },
    {
      id: 'traction',
      question: "What traction have you achieved so far? Share your key metrics, milestones, and validation.",
      hint: "Include customers, revenue, partnerships, pilots, user growth - specific numbers are powerful",
      fieldKey: 'traction',
      minLength: 50
    },
    {
      id: 'team',
      question: "Tell me about your founding team. What relevant experience and expertise do you bring?",
      hint: "Highlight domain expertise, previous ventures, years of experience, complementary skills",
      fieldKey: 'team',
      minLength: 50
    },
    {
      id: 'funding-ask',
      question: "How much funding are you seeking and how will you use it? What milestones will this enable?",
      hint: "Be specific about allocation: X% product, Y% sales, Z% operations with timeline",
      fieldKey: 'fundingAsk',
      minLength: 40
    }
  ],
  completionMessage: "Excellent work! Your executive summary sections are now complete. I've populated all the fields - review them in the Builder tab and refine as needed. Remember, endorsers spend about 2-3 minutes on this section, so make every word count!"
};

export default function ExecutiveSummary() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [sections, setSections] = useState<SectionData>({
    companyOverview: '',
    problemStatement: '',
    solution: '',
    marketOpportunity: '',
    businessModel: '',
    traction: '',
    team: '',
    fundingAsk: '',
    vision: ''
  });
  const [activeTab, setActiveTab] = useState('builder');
  const [savedDate, setSavedDate] = useState('');
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('exec-summary-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('exec-summary-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    setSections(prev => ({
      ...prev,
      companyOverview: answers.companyOverview || prev.companyOverview,
      problemStatement: answers.problemStatement || prev.problemStatement,
      solution: answers.solution || prev.solution,
      marketOpportunity: answers.marketOpportunity || prev.marketOpportunity,
      businessModel: answers.businessModel || prev.businessModel,
      traction: answers.traction || prev.traction,
      team: answers.team || prev.team,
      fundingAsk: answers.fundingAsk || prev.fundingAsk
    }));
    setMode('traditional');
    setActiveTab('builder');
  };

  const updateSection = (field: keyof SectionData, value: string) => {
    setSections(prev => ({ ...prev, [field]: value }));
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getTotalWords = (): number => {
    return Object.values(sections).reduce((total, text) => total + countWords(text), 0);
  };

  const getCompletedSections = (): number => {
    return Object.values(sections).filter(text => countWords(text) > 0).length;
  };

  const getSectionCompletion = (field: keyof SectionData): number => {
    const words = countWords(sections[field]);
    const target = WORD_TARGETS[field];
    return Math.min(100, Math.round((words / target) * 100));
  };

  const totalWords = getTotalWords();
  const completedSections = getCompletedSections();
  const targetWords = 650;
  const wordProgress = Math.min(100, Math.round((totalWords / targetWords) * 100));
  const isComplete = totalWords >= 500 && totalWords <= 800 && completedSections === 9;
  const isOptimal = totalWords >= 550 && totalWords <= 750;

  const sectionCompletionData = Object.entries(sections).map(([key, value]) => ({
    name: SECTION_LABELS[key as keyof SectionData],
    value: countWords(value),
    target: WORD_TARGETS[key as keyof SectionData],
    completion: getSectionCompletion(key as keyof SectionData)
  })).filter(item => item.value > 0);

  const completionPieData = [
    { name: 'Completed', value: completedSections, color: '#10b981' },
    { name: 'Pending', value: 9 - completedSections, color: '#6b7280' }
  ];

  const wordGaugeData = [
    {
      name: 'Words',
      value: totalWords,
      fill: totalWords >= 500 && totalWords <= 800 
        ? '#10b981' 
        : totalWords < 500 
        ? '#f59e0b' 
        : '#ef4444'
    }
  ];

  const getSerializedState = () => {
    return {
      sections,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('sections' in state) setSections(state.sections);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('exec-summary-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('exec-summary-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('exec-summary-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (totalWords < 500) {
      tips.push("Your executive summary is too brief. Endorsing bodies need comprehensive detail - aim for 500-800 words total to demonstrate thorough business understanding.");
    }
    
    if (totalWords > 800) {
      tips.push("Your executive summary exceeds the optimal length. Endorsers typically spend 2-3 minutes on this section - condense to 500-800 words for maximum impact.");
    }
    
    if (completedSections < 9) {
      const missing = Object.entries(sections)
        .filter(([_, value]) => countWords(value) === 0)
        .map(([key, _]) => SECTION_LABELS[key as keyof SectionData])
        .slice(0, 3);
      tips.push(`Missing critical sections: ${missing.join(', ')}. Every section is evaluated by endorsing bodies - incomplete summaries signal lack of preparation.`);
    }
    
    if (countWords(sections.traction) < 50) {
      tips.push("Traction section is underdeveloped. Endorsers prioritize evidence of market validation - include specific metrics, partnerships, revenue, or user growth to strengthen credibility.");
    }
    
    if (countWords(sections.marketOpportunity) < 50) {
      tips.push("Market opportunity needs expansion. Endorsers assess UK market viability - include addressable market size, growth rate, and competitive positioning with data sources.");
    }
    
    if (countWords(sections.fundingAsk) < 40) {
      tips.push("Funding ask requires clarity. Specify exact investment needed, use of funds breakdown, and expected milestones - vague funding requests raise red flags for endorsers.");
    }
    
    const shortSections = Object.entries(sections)
      .filter(([key, value]) => {
        const words = countWords(value);
        return words > 0 && words < WORD_TARGETS[key as keyof SectionData] * 0.5;
      });
    
    if (shortSections.length > 0) {
      tips.push(`These sections need expansion: ${shortSections.map(([key]) => SECTION_LABELS[key as keyof SectionData]).slice(0, 2).join(', ')}. Each should meet target word counts to provide sufficient detail for assessment.`);
    }
    
    if (isOptimal && completedSections === 9) {
      tips.push("Excellent structure and length. Ensure you've quantified claims with specific metrics, named key team members with credentials, and cited market research sources for maximum endorser confidence.");
    }
    
    if (!sections.team.toLowerCase().includes('experience') && countWords(sections.team) > 0) {
      tips.push("Team section should highlight relevant industry experience. Endorsers assess founder credibility - emphasize years of experience, previous ventures, domain expertise, and advisory relationships.");
    }
    
    return tips.slice(0, 7);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Draft all 9 sections focusing on completeness over polish - get all key information down", 
        priority: "Critical" 
      },
      { 
        week: "Week 1", 
        action: "Gather quantitative data: market size figures, traction metrics, financial projections, team credentials", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Research endorser-specific priorities (review their portfolio, stated criteria, industry focus) and tailor messaging", 
        priority: "High" 
      },
      { 
        week: "Week 2", 
        action: "Refine problem-solution fit narrative with specific customer pain points and measurable solution outcomes", 
        priority: "High" 
      },
      { 
        week: "Week 2", 
        action: "Strengthen market opportunity with UK-specific data, regulatory landscape, and competitive differentiation", 
        priority: "Critical" 
      },
      { 
        week: "Week 2-3", 
        action: "Enhance traction section with hard metrics, customer testimonials, partnership agreements, or pilot results", 
        priority: "Critical" 
      },
      { 
        week: "Week 3", 
        action: "Polish team section emphasizing innovation expertise, technical capabilities, and entrepreneurial track record", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Review funding ask for clarity: specific amount, detailed use of funds, milestone timeline, and expected ROI", 
        priority: "High" 
      },
      { 
        week: "Week 3-4", 
        action: "Get executive summary reviewed by advisor, mentor, or successful visa recipient for endorser perspective", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Final edit: eliminate jargon, ensure consistent tone, verify all claims are supportable with evidence", 
        priority: "Medium" 
      },
      { 
        week: "Week 4", 
        action: "Cross-reference executive summary with full business plan to ensure alignment and consistency", 
        priority: "Medium" 
      },
      { 
        week: "Ongoing", 
        action: "Update executive summary if business metrics, funding, team, or market conditions change materially", 
        priority: "Medium" 
      }
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - EXECUTIVE SUMMARY
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

WORD COUNT ANALYSIS
${'-'.repeat(70)}
Total Words: ${totalWords}
Target Range: 500-800 words
Status: ${totalWords >= 500 && totalWords <= 800 ? 'OPTIMAL' : totalWords < 500 ? 'TOO SHORT' : 'TOO LONG'}
Sections Completed: ${completedSections}/9
Progress: ${wordProgress}%

SECTION BREAKDOWN
${'-'.repeat(70)}
${Object.entries(sections).map(([key, value]) => {
  const words = countWords(value);
  const target = WORD_TARGETS[key as keyof SectionData];
  return `${SECTION_LABELS[key as keyof SectionData]}:
  Current: ${words} words | Target: ~${target} words | Completion: ${getSectionCompletion(key as keyof SectionData)}%`;
}).join('\n\n')}

EXECUTIVE SUMMARY CONTENT
${'-'.repeat(70)}

${Object.entries(sections).map(([key, value]) => {
  if (countWords(value) === 0) return '';
  return `${SECTION_LABELS[key as keyof SectionData].toUpperCase()}
${value.trim()}`;
}).filter(Boolean).join('\n\n')}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

ENDORSER EVALUATION CRITERIA
${'-'.repeat(70)}
When reviewing your executive summary, endorsing bodies assess:

1. INNOVATION CLARITY
   - Is the innovation clearly articulated and genuinely novel?
   - Does it demonstrate significant advancement over existing solutions?
   - Is the innovative aspect protectable or defensible?

2. UK MARKET VIABILITY
   - Is there a substantial addressable market in the UK?
   - Are market size claims backed by credible sources?
   - Is the competitive landscape realistically assessed?

3. BUSINESS MODEL SUSTAINABILITY
   - Is the revenue model clearly defined and scalable?
   - Are unit economics favorable or on path to profitability?
   - Is the business model aligned with market realities?

4. TEAM CAPABILITY
   - Does the team have relevant domain expertise?
   - Are there complementary skills across business/technical functions?
   - Is there evidence of entrepreneurial or innovation track record?

5. TRACTION EVIDENCE
   - Are there tangible indicators of market validation?
   - Is customer/user acquisition demonstrable?
   - Are partnerships or pilots with credible organizations?

6. FUNDING PRUDENCE
   - Is the funding ask reasonable for stated milestones?
   - Is the use of funds clearly allocated?
   - Do financial projections align with market realities?

7. STRATEGIC VISION
   - Is there a clear path from current state to scale?
   - Does the vision demonstrate ambition with achievable steps?
   - Is UK establishment central to the growth strategy?

QUALITY CHECKLIST
${'-'.repeat(70)}
□ All 9 sections completed with target word counts
□ Total word count between 500-800
□ Specific metrics and data points included (not vague claims)
□ UK market focus emphasized throughout
□ Team credentials and experience highlighted
□ Traction evidence quantified
□ Funding use clearly allocated
□ Innovation differentiation articulated
□ Competitive advantages stated
□ Growth milestones defined
□ All claims supportable with documentation
□ Reviewed by external advisor or mentor
□ Consistent with full business plan
□ Free of jargon and technical complexity
□ Professional tone maintained throughout

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-summary-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const wordSections = [];
    
    wordSections.push({ type: 'heading' as const, content: 'Word Count Analysis', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Words', totalWords.toString()],
          ['Target Range', '500-800 words'],
          ['Status', totalWords >= 500 && totalWords <= 800 ? 'OPTIMAL' : totalWords < 500 ? 'TOO SHORT' : 'TOO LONG'],
          ['Sections Completed', `${completedSections}/9`],
          ['Progress', `${wordProgress}%`]
        ]
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'Section Breakdown', level: 1 as const });
    wordSections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Section', 'Current', 'Target', 'Completion'],
        rows: Object.entries(sections).map(([key, value]) => [
          SECTION_LABELS[key as keyof SectionData],
          `${countWords(value)} words`,
          `~${WORD_TARGETS[key as keyof SectionData]} words`,
          `${getSectionCompletion(key as keyof SectionData)}%`
        ])
      }
    });
    
    wordSections.push({ type: 'heading' as const, content: 'Executive Summary Content', level: 1 as const });
    Object.entries(sections).forEach(([key, value]) => {
      if (countWords(value) > 0) {
        wordSections.push({ type: 'heading' as const, content: SECTION_LABELS[key as keyof SectionData], level: 2 as const });
        wordSections.push({ type: 'paragraph' as const, content: value.trim() });
      }
    });
    
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
      title: 'UK Innovator Founder Visa - Executive Summary',
      subtitle: `${totalWords} words | ${completedSections}/9 sections complete`,
      filename: `executive-summary-report-${Date.now()}.docx`,
      sections: wordSections,
      metadata: {
        subject: 'Executive Summary Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['executive summary', 'Innovator Founder Visa', 'UK visa', 'business plan']
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-executive-summary">
              Executive Summary Builder
            </h1>
            <p className="text-lg text-muted-foreground">
              Craft a compelling 500-800 word executive summary for endorsing bodies
            </p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="exec-summary"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Executive Summary Builder"
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
            />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-executive-summary">
              <TabsTrigger value="builder" data-testid="tab-builder">Builder</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary Status</CardTitle>
                  <CardDescription>
                    Target: 500-800 words total across all sections for optimal endorser engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={totalWords >= 500 && totalWords <= 800 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Words</p>
                          <p className="text-3xl font-bold" data-testid="text-total-words">
                            {totalWords}
                          </p>
                          <Progress value={wordProgress} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">Target: 500-800</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={completedSections === 9 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Sections Complete</p>
                          <p className="text-3xl font-bold" data-testid="text-sections-complete">
                            {completedSections}/9
                          </p>
                          <Progress value={(completedSections / 9) * 100} className="mt-2" />
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {completedSections === 9 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-xs">
                              {completedSections === 9 ? 'All Complete' : `${9 - completedSections} Remaining`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={isComplete ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Endorser Readiness</p>
                          <p className="text-3xl font-bold" data-testid="text-readiness-status">
                            {isComplete ? (
                              <span className="text-green-500">Ready</span>
                            ) : (
                              <span className="text-orange-500">Draft</span>
                            )}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {isComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-xs">
                              {isComplete ? 'Meets criteria' : 'Needs work'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {totalWords < 500 && completedSections > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your executive summary is currently too brief at {totalWords} words. Add {500 - totalWords} more words to meet the minimum 500-word requirement for endorser review.
                      </AlertDescription>
                    </Alert>
                  )}

                  {totalWords > 800 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your executive summary exceeds the optimal length at {totalWords} words. Consider condensing by {totalWords - 800} words to maintain endorser engagement.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isOptimal && completedSections === 9 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! Your executive summary is well-structured and within optimal length. Review Smart Tips for final polish before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-6">
                    {(Object.keys(sections) as Array<keyof SectionData>).map((field) => {
                      const wordCount = countWords(sections[field]);
                      const target = WORD_TARGETS[field];
                      const completion = getSectionCompletion(field);
                      
                      return (
                        <Card key={field}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{SECTION_LABELS[field]}</CardTitle>
                                <CardDescription>
                                  {wordCount} words (target: ~{target} words) - {completion}% complete
                                </CardDescription>
                              </div>
                              {wordCount >= target * 0.8 && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <Progress value={completion} className="mt-2" />
                          </CardHeader>
                          <CardContent>
                            <Label htmlFor={`section-${field}`} className="sr-only">
                              {SECTION_LABELS[field]}
                            </Label>
                            <Textarea
                              id={`section-${field}`}
                              value={sections[field]}
                              onChange={(e) => updateSection(field, e.target.value)}
                              placeholder={getPlaceholder(field)}
                              className="min-h-32"
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
                    <CardTitle>Word Count Distribution</CardTitle>
                    <CardDescription>Overall progress toward 500-800 word target</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        data={wordGaugeData}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          minAngle={15}
                          background
                          clockWise
                          dataKey="value"
                          cornerRadius={10}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalWords}
                        </text>
                        <text
                          x="50%"
                          y="60%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground text-sm"
                        >
                          words
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        {totalWords < 500 && `${500 - totalWords} words below minimum`}
                        {totalWords >= 500 && totalWords <= 800 && 'Optimal length'}
                        {totalWords > 800 && `${totalWords - 800} words over maximum`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Section Completion</CardTitle>
                    <CardDescription>Progress across all 9 required sections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={completionPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {completionPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {sectionCompletionData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Section Word Counts</CardTitle>
                    <CardDescription>Individual section progress toward targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={sectionCompletionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={120}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Current Words" />
                        <Bar dataKey="target" fill="#10b981" name="Target Words" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Endorser Evaluation Framework</CardTitle>
                  <CardDescription>How endorsing bodies assess executive summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clarity of Innovation</p>
                        <p className="text-sm text-muted-foreground">
                          Is the innovation clearly articulated with demonstrable advancement over existing solutions?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">UK Market Viability</p>
                        <p className="text-sm text-muted-foreground">
                          Does the business demonstrate substantial UK market opportunity with credible sizing?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Business Model Sustainability</p>
                        <p className="text-sm text-muted-foreground">
                          Is the revenue model clearly defined, scalable, and aligned with market realities?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Team Capability</p>
                        <p className="text-sm text-muted-foreground">
                          Does the team possess relevant expertise, complementary skills, and entrepreneurial track record?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Traction Evidence</p>
                        <p className="text-sm text-muted-foreground">
                          Are there tangible indicators of market validation, customer acquisition, or strategic partnerships?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Funding Prudence</p>
                        <p className="text-sm text-muted-foreground">
                          Is the funding ask reasonable with clear allocation and milestone-driven deployment?
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
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>
                    Context-aware guidance based on your executive summary progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg"
                        data-testid={`tip-${index}`}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
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
                  <CardDescription>
                    Prioritized timeline to develop endorser-ready executive summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 pb-4 border-b last:border-0"
                        data-testid={`action-${index}`}
                      >
                        <div className="flex-shrink-0 w-24">
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.week}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{item.action}</p>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded ${
                              item.priority === 'Critical'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : item.priority === 'High'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </>
  );
}

function getPlaceholder(field: keyof SectionData): string {
  const placeholders: Record<keyof SectionData, string> = {
    companyOverview: 'Describe your company mission, core offering, and founding context. Include registration details, location, and stage of development. (~80 words)',
    problemStatement: 'Define the specific problem your innovation addresses. Quantify the pain point with data and explain why current solutions fall short. (~70 words)',
    solution: 'Explain how your innovation solves the problem. Highlight unique technology, methodology, or approach. Emphasize competitive advantages and IP. (~90 words)',
    marketOpportunity: 'Present UK addressable market size with growth projections. Include target customer segments, competitive landscape, and market entry strategy. (~80 words)',
    businessModel: 'Detail revenue streams, pricing strategy, customer acquisition cost, and unit economics. Explain scalability and path to profitability. (~70 words)',
    traction: 'Provide concrete evidence of market validation: revenue figures, user metrics, partnerships, pilots, customer testimonials, or strategic agreements. (~80 words)',
    team: 'Introduce key founders and executives with relevant credentials, industry experience, technical expertise, and previous ventures. Include advisors if notable. (~70 words)',
    fundingAsk: 'Specify exact investment amount needed, breakdown of fund allocation, key milestones to be achieved, and expected timeline to next funding round. (~60 words)',
    vision: 'Articulate long-term vision for company growth, UK market impact, international expansion plans, and strategic positioning in industry landscape. (~50 words)'
  };
  
  return placeholders[field];
}
