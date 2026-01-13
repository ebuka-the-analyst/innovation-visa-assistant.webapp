import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "pitch-deck",
  toolName: "Pitch Deck Builder",
  agent: "nova",
  greeting: "Hello! I'm Nova, your innovation strategist. Let's build a compelling investor pitch deck that aligns with UK endorsing body requirements and showcases your innovation effectively.",
  questions: [
    {
      id: "problem",
      question: "What critical problem does your business solve and how big is this problem?",
      hint: "Be specific and quantifiable. Include market pain points and why existing solutions are inadequate",
      fieldKey: "problemStatement",
      minLength: 100
    },
    {
      id: "solution",
      question: "Describe your innovative solution and what makes it genuinely different from competitors.",
      hint: "Focus on what's genuinely innovative - not just incremental improvement",
      fieldKey: "solutionOverview",
      minLength: 150
    },
    {
      id: "market",
      question: "What is your UK market opportunity? Include TAM/SAM/SOM and why the UK is strategic.",
      hint: "Include UK-specific data and explain why the UK market is strategic for your business",
      fieldKey: "marketOpportunity",
      minLength: 120
    },
    {
      id: "businessModel",
      question: "How does your business make money? Explain your revenue streams and unit economics.",
      hint: "Be specific about how you generate revenue and your path to profitability",
      fieldKey: "businessModel",
      minLength: 100
    },
    {
      id: "traction",
      question: "What traction and validation have you achieved so far?",
      hint: "Include specific metrics and evidence that can be verified",
      fieldKey: "tractionEvidence",
      minLength: 100
    },
    {
      id: "team",
      question: "Who is on your founding team and what makes you uniquely qualified to execute this vision?",
      hint: "Highlight achievements and expertise that demonstrate ability to execute",
      fieldKey: "teamCredentials",
      minLength: 80
    },
    {
      id: "ask",
      question: "What investment are you seeking and how will you use the funds?",
      hint: "Be specific about how funding aligns with your milestones",
      fieldKey: "fundingAsk",
      minLength: 80
    }
  ],
  completionMessage: "Excellent! Your pitch deck content has been captured. This will help create a compelling presentation for investors and endorsers."
};

type SlideField = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type: 'text' | 'textarea';
  minChars: number;
  maxChars?: number;
};

type PitchSlide = {
  id: string;
  title: string;
  description: string;
  fields: SlideField[];
  weight: number;
};

export default function PitchDeck() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('pitch-deck-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('pitch-deck-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [slides, setSlides] = useState<PitchSlide[]>([
    {
      id: 'problem',
      title: 'Problem',
      description: 'Define the problem you are solving',
      weight: 15,
      fields: [
        { id: 'problem-statement', label: 'Problem Statement', value: '', placeholder: 'What critical problem does your business solve? Be specific and quantifiable.', type: 'textarea', minChars: 150 },
        { id: 'problem-magnitude', label: 'Problem Magnitude', value: '', placeholder: 'How big is this problem? Who is affected and to what extent?', type: 'textarea', minChars: 100 },
        { id: 'current-solutions', label: 'Current Solutions', value: '', placeholder: 'What are existing solutions and why are they inadequate?', type: 'textarea', minChars: 100 },
        { id: 'market-pain', label: 'Market Pain Points', value: '', placeholder: 'What specific pain points do customers experience?', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'solution',
      title: 'Solution',
      description: 'Present your innovative solution',
      weight: 20,
      fields: [
        { id: 'solution-overview', label: 'Solution Overview', value: '', placeholder: 'Describe your product/service and how it solves the problem', type: 'textarea', minChars: 150 },
        { id: 'key-features', label: 'Key Features', value: '', placeholder: 'List the 3-5 most important features or capabilities', type: 'textarea', minChars: 120 },
        { id: 'innovation', label: 'Innovation Factor', value: '', placeholder: 'What makes your solution genuinely innovative? What is your technological or business model innovation?', type: 'textarea', minChars: 150 },
        { id: 'competitive-advantage', label: 'Competitive Advantage', value: '', placeholder: 'Why is your solution better than alternatives? What is your unfair advantage?', type: 'textarea', minChars: 120 },
      ]
    },
    {
      id: 'market',
      title: 'Market Opportunity',
      description: 'Demonstrate market size and opportunity',
      weight: 15,
      fields: [
        { id: 'target-market', label: 'Target Market', value: '', placeholder: 'Define your ideal customer profile and target segments', type: 'textarea', minChars: 100 },
        { id: 'market-size', label: 'Market Size (TAM/SAM/SOM)', value: '', placeholder: 'Total Addressable Market, Serviceable Available Market, Serviceable Obtainable Market with sources', type: 'textarea', minChars: 120 },
        { id: 'uk-market', label: 'UK Market Opportunity', value: '', placeholder: 'Specific UK market data, size, growth rate, and why the UK is strategic', type: 'textarea', minChars: 150 },
        { id: 'market-trends', label: 'Market Trends', value: '', placeholder: 'Key trends supporting your business (regulatory, technological, behavioral)', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'business-model',
      title: 'Business Model',
      description: 'Explain how you make money',
      weight: 15,
      fields: [
        { id: 'revenue-streams', label: 'Revenue Streams', value: '', placeholder: 'How do you generate revenue? Pricing model, tiers, transaction fees, etc.', type: 'textarea', minChars: 120 },
        { id: 'pricing-strategy', label: 'Pricing Strategy', value: '', placeholder: 'Pricing details and rationale. What are customers willing to pay?', type: 'textarea', minChars: 100 },
        { id: 'unit-economics', label: 'Unit Economics', value: '', placeholder: 'Customer Acquisition Cost (CAC), Lifetime Value (LTV), LTV:CAC ratio, margins', type: 'textarea', minChars: 100 },
        { id: 'scalability', label: 'Scalability', value: '', placeholder: 'How does your model scale? Path to profitability and efficiency gains', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'traction',
      title: 'Traction & Validation',
      description: 'Prove market validation and momentum',
      weight: 20,
      fields: [
        { id: 'current-traction', label: 'Current Traction', value: '', placeholder: 'Key metrics: customers, revenue, users, growth rate, partnerships', type: 'textarea', minChars: 120 },
        { id: 'milestones', label: 'Key Milestones', value: '', placeholder: 'Major achievements to date (product launches, pilot programs, awards, press)', type: 'textarea', minChars: 100 },
        { id: 'customer-validation', label: 'Customer Validation', value: '', placeholder: 'Customer testimonials, case studies, letters of intent, pilot results', type: 'textarea', minChars: 100 },
        { id: 'future-roadmap', label: 'Future Roadmap', value: '', placeholder: '12-month milestones and growth targets', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'team',
      title: 'Team',
      description: 'Showcase your team and expertise',
      weight: 10,
      fields: [
        { id: 'founders', label: 'Founder Team', value: '', placeholder: 'Founders with relevant experience, expertise, and past successes', type: 'textarea', minChars: 150 },
        { id: 'key-hires', label: 'Key Team Members', value: '', placeholder: 'Critical hires and their contributions to the business', type: 'textarea', minChars: 80 },
        { id: 'advisors', label: 'Advisors & Board', value: '', placeholder: 'Advisory board members, their credentials, and how they support the business', type: 'textarea', minChars: 80 },
        { id: 'hiring-plan', label: 'Hiring Plan', value: '', placeholder: 'Key roles to be filled in the UK, timeline, and impact on growth', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'ask',
      title: 'The Ask',
      description: 'Investment ask and use of funds',
      weight: 5,
      fields: [
        { id: 'funding-amount', label: 'Funding Amount', value: '', placeholder: 'Total investment required for your business plan', type: 'text', minChars: 5 },
        { id: 'use-of-funds', label: 'Use of Funds', value: '', placeholder: 'Detailed breakdown: product development, marketing, hiring, operations, runway', type: 'textarea', minChars: 150 },
        { id: 'milestones-investment', label: 'Investment Milestones', value: '', placeholder: 'Key milestones this funding will achieve and timeline', type: 'textarea', minChars: 100 },
        { id: 'exit-strategy', label: 'Vision & Exit', value: '', placeholder: 'Long-term vision and potential exit opportunities (acquisition, IPO, etc.)', type: 'textarea', minChars: 80 },
      ]
    },
  ]);

  const [activeTab, setActiveTab] = useState('builder');
  const [savedDate, setSavedDate] = useState('');

  const updateField = (slideId: string, fieldId: string, value: string) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            fields: slide.fields.map(field =>
              field.id === fieldId ? { ...field, value } : field
            )
          }
        : slide
    ));
  };

  const calculateSlideCompletion = (slide: PitchSlide): number => {
    const completedFields = slide.fields.filter(f => f.value.length >= f.minChars).length;
    return Math.round((completedFields / slide.fields.length) * 100);
  };

  const calculateOverallCompletion = (): number => {
    const totalFields = slides.reduce((sum, s) => sum + s.fields.length, 0);
    const completedFields = slides.reduce((sum, s) => 
      sum + s.fields.filter(f => f.value.length >= f.minChars).length, 0
    );
    return Math.round((completedFields / totalFields) * 100);
  };

  const calculateDeckStrength = (): number => {
    let totalScore = 0;
    let maxScore = 0;

    slides.forEach(slide => {
      const slideCompletion = calculateSlideCompletion(slide);
      const weightedScore = (slideCompletion / 100) * slide.weight;
      totalScore += weightedScore;
      maxScore += slide.weight;
    });

    return Math.round((totalScore / maxScore) * 100);
  };

  const overallCompletion = calculateOverallCompletion();
  const deckStrength = calculateDeckStrength();

  const slideCompletionData = slides.map(slide => ({
    name: slide.title,
    completion: calculateSlideCompletion(slide),
    weight: slide.weight,
  }));

  const strengthRadarData = [
    { category: 'Problem Definition', score: calculateSlideCompletion(slides[0]), fullMark: 100 },
    { category: 'Solution Innovation', score: calculateSlideCompletion(slides[1]), fullMark: 100 },
    { category: 'Market Opportunity', score: calculateSlideCompletion(slides[2]), fullMark: 100 },
    { category: 'Business Model', score: calculateSlideCompletion(slides[3]), fullMark: 100 },
    { category: 'Traction', score: calculateSlideCompletion(slides[4]), fullMark: 100 },
    { category: 'Team', score: calculateSlideCompletion(slides[5]), fullMark: 100 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const getSerializedState = () => {
    return {
      slides,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('slides' in state) setSlides(state.slides);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('pitch-deck-mode', mode);
  }, [mode]);

  useEffect(() => {
    const saved = localStorage.getItem('pitch-deck-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newSlides = [...slides];
    if (answers.problemStatement) {
      const problemSlide = newSlides.find(s => s.id === 'problem');
      if (problemSlide) {
        problemSlide.fields[0].value = answers.problemStatement;
      }
    }
    if (answers.solutionOverview) {
      const solutionSlide = newSlides.find(s => s.id === 'solution');
      if (solutionSlide) {
        solutionSlide.fields[0].value = answers.solutionOverview;
      }
    }
    if (answers.marketOpportunity) {
      const marketSlide = newSlides.find(s => s.id === 'market');
      if (marketSlide) {
        marketSlide.fields[2].value = answers.marketOpportunity;
      }
    }
    if (answers.businessModel) {
      const businessSlide = newSlides.find(s => s.id === 'business-model');
      if (businessSlide) {
        businessSlide.fields[0].value = answers.businessModel;
      }
    }
    if (answers.tractionEvidence) {
      const tractionSlide = newSlides.find(s => s.id === 'traction');
      if (tractionSlide) {
        tractionSlide.fields[0].value = answers.tractionEvidence;
      }
    }
    if (answers.teamCredentials) {
      const teamSlide = newSlides.find(s => s.id === 'team');
      if (teamSlide) {
        teamSlide.fields[0].value = answers.teamCredentials;
      }
    }
    if (answers.fundingAsk) {
      const askSlide = newSlides.find(s => s.id === 'ask');
      if (askSlide) {
        askSlide.fields[1].value = answers.fundingAsk;
      }
    }
    setSlides(newSlides);
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('pitch-deck-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('pitch-deck-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (deckStrength < 40) {
      tips.push("Your pitch deck needs significant development. Focus on completing the Problem, Solution, and Traction slides first - these are critical for endorsing bodies");
    }
    
    if (deckStrength >= 40 && deckStrength < 70) {
      tips.push("Good foundation. Now strengthen your deck by adding specific metrics, evidence, and data to support all claims");
    }
    
    const problemSlide = slides.find(s => s.id === 'problem');
    if (problemSlide && calculateSlideCompletion(problemSlide) < 100) {
      tips.push("Strong problem definition is essential. Quantify the problem with market data and explain why it matters now");
    }
    
    const solutionSlide = slides.find(s => s.id === 'solution');
    if (solutionSlide && calculateSlideCompletion(solutionSlide) < 100) {
      tips.push("Innovation is key for UK visa approval. Clearly articulate what makes your solution genuinely innovative - not just incremental improvement");
    }
    
    const tractionSlide = slides.find(s => s.id === 'traction');
    const tractionCompletion = tractionSlide ? calculateSlideCompletion(tractionSlide) : 0;
    if (tractionCompletion < 70) {
      tips.push("Traction is weighted heavily (20%). Include specific metrics: customer count, revenue, growth rate, partnerships, or pilot results");
    } else if (tractionCompletion >= 90) {
      tips.push("Excellent traction data! Ensure all metrics are verifiable and include evidence (screenshots, letters, contracts)");
    }
    
    const marketSlide = slides.find(s => s.id === 'market');
    if (marketSlide && calculateSlideCompletion(marketSlide) < 100) {
      tips.push("UK market opportunity must be clearly demonstrated. Include UK-specific data, growth rates, and explain why the UK is strategic for your business");
    }
    
    const askSlide = slides.find(s => s.id === 'ask');
    const fundingField = askSlide?.fields.find(f => f.id === 'funding-amount');
    if (fundingField && fundingField.value) {
      tips.push("Ensure your Use of Funds breakdown is detailed and aligns with your milestones. Endorsers will assess if funding is appropriate for your plan.");
    }
    
    const teamSlide = slides.find(s => s.id === 'team');
    if (teamSlide && calculateSlideCompletion(teamSlide) < 80) {
      tips.push("Team credibility is crucial. Highlight relevant expertise, past successes, and why this team can execute the vision");
    }
    
    if (deckStrength >= 80) {
      tips.push("Strong pitch deck! Final polish: remove jargon, ensure visual consistency, practice your 5-minute pitch, and prepare for deep-dive questions");
    }
    
    tips.push("Endorsing bodies evaluate: Innovation (Is it genuinely new?), Scalability (Can it grow in UK?), and Viability (Will it work?). Address all three explicitly");
    
    tips.push("One slide, one message. Each slide should have a clear takeaway. Avoid cramming too much information");
    
    tips.push("Visual hierarchy matters. Use charts for metrics, icons for features, and testimonials/logos for credibility");
    
    if (overallCompletion < 100) {
      const incompleteSlides = slides.filter(s => calculateSlideCompletion(s) < 100);
      tips.push(`Complete remaining slides: ${incompleteSlides.map(s => s.title).join(', ')}. All slides contribute to a comprehensive narrative`);
    }
    
    return tips.slice(0, 12);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete Problem and Solution slides with quantified data and evidence. Define your innovation clearly.", priority: "Critical" },
      { week: "Week 1", action: "Research and document UK market opportunity with credible sources (industry reports, government data)", priority: "Critical" },
      { week: "Week 1-2", action: "Gather all traction evidence: customer testimonials, revenue screenshots, growth charts, partnership letters", priority: "Critical" },
      { week: "Week 2", action: "Complete Business Model slide with unit economics data. Calculate CAC, LTV, and path to profitability", priority: "High" },
      { week: "Week 2", action: "Document team credentials with LinkedIn profiles, past successes, and relevant expertise", priority: "High" },
      { week: "Week 2-3", action: "Develop detailed Use of Funds breakdown aligned with milestones and hiring plan", priority: "Critical" },
      { week: "Week 3", action: "Create compelling visuals: charts for metrics, mockups for product, icons for features", priority: "High" },
      { week: "Week 3", action: "Practice your pitch. Aim for 5 minutes for entire deck, 1 minute per slide maximum", priority: "High" },
      { week: "Week 3-4", action: "Prepare appendix slides: detailed financials, competitive analysis, risk mitigation, FAQ", priority: "Medium" },
      { week: "Week 4", action: "Get feedback from advisors, mentors, or other founders. Iterate based on questions and concerns", priority: "Critical" },
      { week: "Week 4", action: "Ensure all claims are backed by evidence. Add footnotes with sources for all data points", priority: "High" },
      { week: "Week 4", action: "Final review: check for typos, ensure brand consistency, test on different screens, export as PDF", priority: "Critical" },
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - PITCH DECK BUILDER
Generated: ${new Date().toLocaleString('en-GB')}
Completion: ${overallCompletion}%
Deck Strength Score: ${deckStrength}%
${'='.repeat(80)}

${slides.map(slide => `
${slide.title.toUpperCase()} SLIDE (Weight: ${slide.weight}%, Completion: ${calculateSlideCompletion(slide)}%)
${'-'.repeat(80)}
${slide.fields.map(field => `
${field.label}:
${field.value || '[NOT COMPLETED]'}
`).join('\n')}
`).join('\n')}

DECK STRENGTH ANALYSIS
${'-'.repeat(80)}
Overall Completion: ${overallCompletion}%
Weighted Deck Strength: ${deckStrength}%

Slide-by-Slide Breakdown:
${slides.map(s => `- ${s.title}: ${calculateSlideCompletion(s)}% (Weight: ${s.weight}%)`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

ENDORSING BODY PITCH DECK REQUIREMENTS
${'-'.repeat(80)}
Critical Elements for Approval:

INNOVATION CRITERIA:
[ ] Demonstrates genuine innovation (not incremental improvement)
[ ] Clear technological or business model differentiation
[ ] Intellectual property or defensible competitive advantage
[ ] Novel approach to solving market problem

UK MARKET RELEVANCE:
[ ] Specific UK market data and opportunity size
[ ] Explanation of why UK is strategic market
[ ] UK job creation plan and timeline
[ ] Contribution to UK economy clearly articulated

SCALABILITY & VIABILITY:
[ ] Proven business model with clear revenue streams
[ ] Evidence of market demand (traction, LOIs, pilots)
[ ] Realistic financial projections (3-year minimum)
[ ] Path to profitability and growth strategy

TEAM CAPABILITY:
[ ] Relevant expertise and track record
[ ] Ability to execute on vision demonstrated
[ ] Key hires planned for UK operations
[ ] Advisory support from credible industry experts

FUNDING & COMMITMENT:
[ ] Investment amount clearly stated and appropriate for plan
[ ] Use of funds aligned with milestones
[ ] Funding sources documented and verified
[ ] Long-term commitment to UK market

PRESENTATION QUALITY:
[ ] Professional design and visual hierarchy
[ ] Clear narrative flow (problem-solution-market-traction)
[ ] All data backed by credible sources
[ ] No typos, consistent branding
[ ] Pitch can be delivered in 5 minutes

NEXT STEPS
${'-'.repeat(80)}
1. Complete all slides to 100%
2. Create visual deck in PowerPoint/Keynote/Pitch
3. Practice pitch delivery (5 minutes target)
4. Gather evidence appendix (financials, references, data sources)
5. Get feedback from advisors and iterate
6. Prepare for Q&A (15+ questions)
7. Submit to endorsing body with supporting documents

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This pitch deck content is for guidance only. Consult with 
qualified legal and immigration advisors before submitting visa applications.
Ensure all claims are accurate and can be verified.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch-deck-builder-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const sections = [];
    
    sections.push({ type: 'heading' as const, content: 'Pitch Deck Summary', level: 1 as const });
    sections.push({ type: 'paragraph' as const, content: `Overall Completion: ${overallCompletion}% | Deck Strength: ${deckStrength}%` });
    
    slides.forEach(slide => {
      sections.push({ type: 'heading' as const, content: `${slide.title} (${calculateSlideCompletion(slide)}% Complete)`, level: 2 as const });
      slide.fields.forEach(field => {
        sections.push({ type: 'heading' as const, content: field.label, level: 3 as const });
        sections.push({ type: 'paragraph' as const, content: field.value || '[Not completed]' });
      });
    });
    
    sections.push({ type: 'heading' as const, content: 'Deck Strength Analysis', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Slide', 'Completion', 'Weight'],
        rows: slides.map(s => [s.title, `${calculateSlideCompletion(s)}%`, `${s.weight}%`])
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Smart Recommendations', level: 1 as const });
    sections.push({ type: 'list' as const, items: getSmartTips() });
    
    sections.push({ type: 'heading' as const, content: '4-Week Action Plan', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Week', 'Action', 'Priority'],
        rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
      }
    });

    await generateWord({
      title: 'UK Innovator Founder Visa - Pitch Deck Builder',
      subtitle: `Completion: ${overallCompletion}% | Deck Strength: ${deckStrength}%`,
      filename: `pitch-deck-builder-${Date.now()}.docx`,
      sections,
      metadata: {
        subject: 'Pitch Deck Builder Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['pitch deck', 'Innovator Founder Visa', 'UK visa', 'business plan']
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
          
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold mb-2" data-testid="heading-pitch-deck">Pitch Deck Builder</h1>
              <p className="text-lg text-muted-foreground">Create a compelling investor pitch deck aligned with endorsing body requirements</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          <ToolUtilityBar
            toolId="pitch-deck"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setActiveTab('tips')}
            onActionPlan={() => setActiveTab('action')}
            getSerializedState={getSerializedState}
            toolName="Pitch Deck Builder"
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
            <>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Overall Completion</p>
                  <p className="text-xl font-bold" data-testid="text-overall-completion">{overallCompletion}%</p>
                  <Progress value={overallCompletion} className="mt-2" data-testid="progress-overall" />
                </div>
              </CardContent>
            </Card>

            <Card className={deckStrength >= 80 ? "border-green-500" : deckStrength >= 60 ? "border-orange-500" : "border-destructive"}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Deck Strength</p>
                  <p className="text-xl font-bold" data-testid="text-deck-strength">{deckStrength}%</p>
                  <Progress value={deckStrength} className="mt-2" data-testid="progress-strength" />
                  <p className="text-xs text-muted-foreground mt-2">Weighted by slide importance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Slides Complete</p>
                  <p className="text-xl font-bold" data-testid="text-slides-complete">
                    {slides.filter(s => calculateSlideCompletion(s) === 100).length}/{slides.length}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {slides.filter(s => calculateSlideCompletion(s) === 100).length === slides.length ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {deckStrength < 60 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your deck strength is below endorsing body standards. Focus on completing high-weight slides: Solution (20%), Traction (20%), and Problem (15%).
              </AlertDescription>
            </Alert>
          )}

          {deckStrength >= 60 && deckStrength < 80 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Good progress! Strengthen your deck further by adding specific metrics, evidence, and refining your narrative.
              </AlertDescription>
            </Alert>
          )}

          {deckStrength >= 80 && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950 mb-6">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Strong pitch deck! Review Smart Tips for final refinements and practice your delivery.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-pitch-deck">
              <TabsTrigger value="builder" data-testid="tab-builder">Deck Builder</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              {slides.map((slide) => (
                <Card key={slide.id} data-testid={`slide-${slide.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {slide.title}
                          <span className="text-sm font-normal text-muted-foreground">(Weight: {slide.weight}%)</span>
                        </CardTitle>
                        <CardDescription>
                          {calculateSlideCompletion(slide) === 100 ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </span>
                          ) : (
                            <>
                              {slide.description} - {calculateSlideCompletion(slide)}% complete
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <Progress 
                        value={calculateSlideCompletion(slide)} 
                        className="w-24 h-2" 
                        data-testid={`progress-slide-${slide.id}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {slide.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="flex items-center gap-2">
                          {field.label}
                          {field.value.length >= field.minChars && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {field.value.length} / {field.minChars} characters minimum
                          </span>
                        </Label>
                        {field.type === 'text' ? (
                          <Input
                            id={field.id}
                            value={field.value}
                            onChange={(e) => updateField(slide.id, field.id, e.target.value)}
                            placeholder={field.placeholder}
                            data-testid={`input-${slide.id}-${field.id}`}
                          />
                        ) : (
                          <Textarea
                            id={field.id}
                            value={field.value}
                            onChange={(e) => updateField(slide.id, field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={6}
                            data-testid={`textarea-${slide.id}-${field.id}`}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Slide Completion Progress</CardTitle>
                    <CardDescription>Track completion across all pitch deck slides</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={slideCompletionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          fontSize={12}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${value}%`,
                            `Completion (Weight: ${props.payload.weight}%)`
                          ]}
                        />
                        <Bar dataKey="completion" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deck Strength Radar</CardTitle>
                    <CardDescription>Comprehensive view of deck quality across dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={strengthRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" fontSize={11} />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar 
                          name="Strength" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6} 
                        />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Slide Weight Distribution</CardTitle>
                    <CardDescription>Relative importance of each slide for endorsing bodies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={slides.map(s => ({ name: s.title, value: s.weight }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                        >
                          {slides.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics Dashboard</CardTitle>
                    <CardDescription>Critical metrics for your pitch</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Slides</p>
                        <p className="text-lg font-bold">{slides.length}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Complete Slides</p>
                        <p className="text-lg font-bold text-green-600">
                          {slides.filter(s => calculateSlideCompletion(s) === 100).length}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">High Priority</p>
                        <p className="text-lg font-bold text-orange-500">
                          {slides.filter(s => s.weight >= 15).length}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Fields</p>
                        <p className="text-lg font-bold">
                          {slides.reduce((sum, s) => sum + s.fields.length, 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Completion Status</h4>
                      <div className="space-y-2">
                        {slides.map(slide => (
                          <div key={slide.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {calculateSlideCompletion(slide) === 100 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                              )}
                              {slide.title}
                            </span>
                            <span className={calculateSlideCompletion(slide) === 100 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {calculateSlideCompletion(slide)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Smart Tips & Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered guidance based on your pitch deck progress and endorsing body requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`tip-${index}`}>
                        <FileText className="h-4 w-4" />
                        <AlertDescription className="ml-2">
                          <span className="font-semibold">Tip {index + 1}:</span> {tip}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorsing Body Evaluation Criteria</CardTitle>
                  <CardDescription>What endorsing bodies look for in pitch decks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Innovation (40% weight)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>- Genuine innovation, not incremental improvement</li>
                        <li>- Clear technological or business model differentiation</li>
                        <li>- Defensible competitive advantage</li>
                        <li>- Evidence of innovation validation</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Viability (30% weight)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>- Proven business model with clear revenue streams</li>
                        <li>- Realistic financial projections</li>
                        <li>- Evidence of market demand</li>
                        <li>- Path to profitability</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Scalability (30% weight)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>- Significant UK market opportunity</li>
                        <li>- Clear UK job creation plan</li>
                        <li>- Growth strategy and milestones</li>
                        <li>- International expansion potential</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    4-Week Action Plan
                  </CardTitle>
                  <CardDescription>
                    Structured timeline to complete and perfect your pitch deck
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div 
                        key={index} 
                        className="flex gap-4 p-4 bg-muted rounded-lg"
                        data-testid={`action-${index}`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`px-3 py-1 rounded text-xs font-semibold ${
                            item.priority === 'Critical' 
                              ? 'bg-destructive text-destructive-foreground' 
                              : item.priority === 'High'
                              ? 'bg-orange-500 text-white'
                              : 'bg-primary text-primary-foreground'
                          }`}>
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{item.week}</p>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pre-Submission Checklist</CardTitle>
                  <CardDescription>Ensure all requirements are met before presenting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'All 7 slides completed with minimum character requirements met',
                      'Deck strength score above 80%',
                      'All claims backed by evidence and credible sources',
                      'Funding clearly stated and appropriate for your business plan',
                      'UK market opportunity specifically addressed',
                      'Innovation clearly articulated and differentiated',
                      'Traction metrics included with evidence',
                      'Team credentials documented with relevant expertise',
                      'Financial projections realistic and detailed',
                      'Visual design professional and consistent',
                      'No typos or grammatical errors',
                      'Pitch practiced and timed (5 minutes target)',
                      'Q&A preparation completed',
                      'Supporting appendix prepared',
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{item}</p>
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
    </>
  );
}
