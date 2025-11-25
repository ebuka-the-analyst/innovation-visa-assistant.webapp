import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useWordExport } from "@/hooks/useWordExport";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema, createArticleSchema } from "@/lib/seo-schemas";

type BusinessPlanSection = {
  id: string;
  title: string;
  fields: {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    type: 'text' | 'textarea';
    minChars: number;
  }[];
};

type MilestoneData = {
  month: string;
  milestone: string;
  status: 'planned' | 'in-progress' | 'completed';
};

export default function BusinessPlan() {
  const { toast } = useToast();
  const { generatePdf } = usePdfExport();
  const { generateWord } = useWordExport();
  const [showAutoSaveNotification, setShowAutoSaveNotification] = useState(false);
  const lastSaveRef = useRef<string>('');
  
  const [sections, setSections] = useState<BusinessPlanSection[]>([
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      fields: [
        { id: 'business-name', label: 'Business Name', value: '', placeholder: 'Enter your registered business name', type: 'text', minChars: 3 },
        { id: 'business-concept', label: 'Business Concept', value: '', placeholder: 'Describe your business in 2-3 sentences', type: 'textarea', minChars: 100 },
        { id: 'mission-statement', label: 'Mission Statement', value: '', placeholder: 'What is your core purpose and vision?', type: 'textarea', minChars: 50 },
        { id: 'key-objectives', label: 'Key Objectives', value: '', placeholder: 'List 3-5 primary business objectives', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'problem-solution',
      title: 'Problem & Solution',
      fields: [
        { id: 'problem-statement', label: 'Problem Statement', value: '', placeholder: 'What specific problem does your business solve?', type: 'textarea', minChars: 150 },
        { id: 'solution-description', label: 'Solution Description', value: '', placeholder: 'How does your product/service solve this problem?', type: 'textarea', minChars: 150 },
        { id: 'unique-value', label: 'Unique Value Proposition', value: '', placeholder: 'What makes your solution unique and innovative?', type: 'textarea', minChars: 100 },
        { id: 'competitive-advantage', label: 'Competitive Advantage', value: '', placeholder: 'Why will customers choose you over competitors?', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      fields: [
        { id: 'target-market', label: 'Target Market', value: '', placeholder: 'Define your ideal customer segments', type: 'textarea', minChars: 100 },
        { id: 'market-size', label: 'Market Size & Growth', value: '', placeholder: 'Provide market size data and growth projections', type: 'textarea', minChars: 100 },
        { id: 'competitive-landscape', label: 'Competitive Landscape', value: '', placeholder: 'Identify main competitors and their positioning', type: 'textarea', minChars: 150 },
        { id: 'market-trends', label: 'Market Trends', value: '', placeholder: 'Key industry trends supporting your business', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'business-model',
      title: 'Business Model',
      fields: [
        { id: 'revenue-streams', label: 'Revenue Streams', value: '', placeholder: 'How will you generate revenue? (pricing, models)', type: 'textarea', minChars: 100 },
        { id: 'cost-structure', label: 'Cost Structure', value: '', placeholder: 'Key costs and operational expenses', type: 'textarea', minChars: 100 },
        { id: 'customer-acquisition', label: 'Customer Acquisition Strategy', value: '', placeholder: 'How will you acquire and retain customers?', type: 'textarea', minChars: 100 },
        { id: 'scalability', label: 'Scalability Plan', value: '', placeholder: 'How will you scale operations in the UK?', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'team',
      title: 'Team & Management',
      fields: [
        { id: 'founder-background', label: 'Founder Background', value: '', placeholder: 'Your relevant experience and expertise', type: 'textarea', minChars: 150 },
        { id: 'team-structure', label: 'Team Structure', value: '', placeholder: 'Key team members and their roles', type: 'textarea', minChars: 100 },
        { id: 'hiring-plan', label: 'Hiring Plan', value: '', placeholder: 'Future hiring needs and timeline', type: 'textarea', minChars: 100 },
        { id: 'advisors', label: 'Advisors & Partners', value: '', placeholder: 'Key advisors, mentors, or strategic partners', type: 'textarea', minChars: 50 },
      ]
    },
    {
      id: 'financials',
      title: 'Financial Projections',
      fields: [
        { id: 'funding-required', label: 'Funding Required', value: '', placeholder: 'Total investment needed (minimum £50,000)', type: 'text', minChars: 5 },
        { id: 'revenue-forecast', label: 'Revenue Forecast', value: '', placeholder: 'Year 1-3 revenue projections with assumptions', type: 'textarea', minChars: 150 },
        { id: 'profit-margins', label: 'Profit Margins', value: '', placeholder: 'Expected gross and net profit margins', type: 'textarea', minChars: 50 },
        { id: 'break-even', label: 'Break-Even Analysis', value: '', placeholder: 'When do you expect to reach break-even?', type: 'textarea', minChars: 100 },
      ]
    },
    {
      id: 'traction',
      title: 'Traction & Milestones',
      fields: [
        { id: 'current-traction', label: 'Current Traction', value: '', placeholder: 'Existing customers, revenue, partnerships, or validation', type: 'textarea', minChars: 100 },
        { id: 'key-achievements', label: 'Key Achievements', value: '', placeholder: 'Notable accomplishments or proof points', type: 'textarea', minChars: 100 },
        { id: 'milestones-12m', label: '12-Month Milestones', value: '', placeholder: 'Key milestones for the first year in the UK', type: 'textarea', minChars: 150 },
        { id: 'milestones-36m', label: '36-Month Milestones', value: '', placeholder: 'Long-term milestones (2-3 years)', type: 'textarea', minChars: 100 },
      ]
    },
  ]);

  const [milestones, setMilestones] = useState<MilestoneData[]>([
    { month: 'Month 1-3', milestone: 'Company formation and initial setup', status: 'planned' },
    { month: 'Month 4-6', milestone: 'Product development and testing', status: 'planned' },
    { month: 'Month 7-9', milestone: 'Market entry and customer acquisition', status: 'planned' },
    { month: 'Month 10-12', milestone: 'Revenue generation and scaling', status: 'planned' },
    { month: 'Month 13-18', milestone: 'Team expansion and market growth', status: 'planned' },
    { month: 'Month 19-24', milestone: 'Profitability and sustainability', status: 'planned' },
  ]);

  const [activeTab, setActiveTab] = useState('plan');
  const [savedDate, setSavedDate] = useState('');

  const autoSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateField = (sectionId: string, fieldId: string, value: string) => {
    setSections(prevSections => {
      const newSections = prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, value } : field
              )
            }
          : section
      );
      
      if (autoSaveDebounceRef.current) {
        clearTimeout(autoSaveDebounceRef.current);
      }
      autoSaveDebounceRef.current = setTimeout(() => {
        const state = {
          sections: newSections,
          milestones,
          activeTab,
          savedDate: new Date().toLocaleString('en-GB')
        };
        localStorage.setItem('business-plan-state', JSON.stringify(state));
        setSavedDate(state.savedDate);
        setShowAutoSaveNotification(true);
        setTimeout(() => setShowAutoSaveNotification(false), 2000);
      }, 500);
      
      return newSections;
    });
  };

  const calculateSectionCompletion = (section: BusinessPlanSection): number => {
    const completedFields = section.fields.filter(f => f.value.length >= f.minChars).length;
    return Math.round((completedFields / section.fields.length) * 100);
  };

  const calculateOverallCompletion = (): number => {
    const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);
    const completedFields = sections.reduce((sum, s) => 
      sum + s.fields.filter(f => f.value.length >= f.minChars).length, 0
    );
    return Math.round((completedFields / totalFields) * 100);
  };

  const overallCompletion = calculateOverallCompletion();
  const completionBySection = sections.map(section => ({
    name: section.title.replace(' & ', '\n'),
    completion: calculateSectionCompletion(section),
  }));

  const timelineData = milestones.map(m => ({
    name: m.month,
    progress: m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0,
  }));

  const getSerializedState = () => {
    return {
      sections,
      milestones,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('sections' in state) setSections(state.sections);
    if ('milestones' in state) setMilestones(state.milestones);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('business-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
      lastSaveRef.current = saved;
    }
  }, []);

  const handleSave = useCallback(() => {
    const state = getSerializedState();
    const stateString = JSON.stringify(state);
    localStorage.setItem('business-plan-state', stateString);
    setSavedDate(state.savedDate);
    lastSaveRef.current = stateString;
    return true;
  }, [sections, milestones, activeTab]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentState = JSON.stringify(getSerializedState());
      if (currentState !== lastSaveRef.current) {
        handleSave();
        setShowAutoSaveNotification(true);
        setTimeout(() => setShowAutoSaveNotification(false), 3000);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [handleSave]);

  const handleRestore = () => {
    const saved = localStorage.getItem('business-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (overallCompletion < 30) {
      tips.push("Start with the Executive Summary and Problem/Solution sections - these are crucial for visa applications and set the foundation for your entire plan");
    }
    
    if (overallCompletion >= 30 && overallCompletion < 60) {
      tips.push("You're making good progress. Focus on the Market Analysis and Financial Projections next - endorsing bodies scrutinize these sections carefully");
    }
    
    const execSection = sections.find(s => s.id === 'executive-summary');
    if (execSection && calculateSectionCompletion(execSection) < 100) {
      tips.push("Your Executive Summary must be compelling and concise - it's the first thing endorsing bodies read. Ensure all fields meet minimum requirements");
    }
    
    const financialSection = sections.find(s => s.id === 'financials');
    const fundingField = financialSection?.fields.find(f => f.id === 'funding-required');
    if (fundingField && fundingField.value) {
      const funding = parseFloat(fundingField.value.replace(/[^0-9.]/g, ''));
      if (funding < 50000) {
        tips.push("CRITICAL: UK Innovator Founder Visa requires minimum £50,000 investment. Ensure your funding meets this threshold");
      }
    }
    
    const marketSection = sections.find(s => s.id === 'market-analysis');
    if (marketSection && calculateSectionCompletion(marketSection) < 75) {
      tips.push("Strengthen your Market Analysis with specific UK market data, competitor analysis, and clear evidence of market opportunity");
    }
    
    const tractionSection = sections.find(s => s.id === 'traction');
    if (tractionSection && calculateSectionCompletion(tractionSection) > 80) {
      tips.push("Strong traction section! Quantify your achievements with specific metrics (customers, revenue, partnerships) to maximize impact");
    }
    
    const teamSection = sections.find(s => s.id === 'team');
    if (teamSection && calculateSectionCompletion(teamSection) < 70) {
      tips.push("Your Team section should demonstrate relevant expertise and ability to execute. Highlight previous successes and UK market knowledge");
    }
    
    if (overallCompletion >= 80) {
      tips.push("Excellent progress! Review each section for clarity, remove jargon, and ensure all claims are supported by evidence. Consider having a legal expert review before submission");
    }
    
    tips.push("GOV.UK guidance emphasizes innovation and scalability. Ensure your plan clearly articulates what makes your business genuinely innovative and how it will create UK jobs");
    
    tips.push("Be specific about your UK expansion plans - where you'll operate, local partnerships, hiring timeline, and contribution to the UK economy");
    
    if (overallCompletion < 100) {
      const incompleteSections = sections.filter(s => calculateSectionCompletion(s) < 100);
      tips.push(`Complete remaining sections: ${incompleteSections.map(s => s.title).join(', ')}. All sections are important for a comprehensive visa application`);
    }
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const plan = [
      { week: "Week 1", action: "Complete Executive Summary and Problem/Solution sections - establish your core narrative", priority: "Critical" },
      { week: "Week 1-2", action: "Research and document UK market data for Market Analysis section with credible sources", priority: "Critical" },
      { week: "Week 2", action: "Develop detailed financial projections with realistic assumptions and evidence", priority: "Critical" },
      { week: "Week 2-3", action: "Document team credentials, relevant experience, and hiring plans for UK operations", priority: "High" },
      { week: "Week 3", action: "Compile traction evidence: customer testimonials, revenue data, partnerships, awards", priority: "High" },
      { week: "Week 3", action: "Refine Business Model section focusing on scalability and UK market fit", priority: "High" },
      { week: "Week 4", action: "Review entire plan for consistency, clarity, and alignment with GOV.UK visa requirements", priority: "Critical" },
      { week: "Week 4", action: "Have plan reviewed by legal advisor familiar with UK immigration requirements", priority: "Critical" },
      { week: "Week 4", action: "Prepare supporting documentation: financial statements, market research, letters of support", priority: "High" },
      { week: "Ongoing", action: "Ensure all financial commitments (£50k minimum) are documented and accessible", priority: "Critical" },
    ];
    
    return plan;
  };

  const getExportSections = () => {
    const businessName = sections.find(s => s.id === 'executive-summary')?.fields.find(f => f.id === 'business-name')?.value || 'Business Plan';
    
    return {
      title: 'UK Innovator Founder Visa Business Plan',
      subtitle: businessName,
      filename: `business-plan-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'score' as const, score: { value: overallCompletion, max: 100, label: 'Overall Completion' } },
        { type: 'divider' as const },
        
        ...sections.flatMap(section => [
          { type: 'heading' as const, content: section.title, level: 1 as const },
          ...section.fields.map(field => ({
            type: 'paragraph' as const,
            content: `${field.label}: ${field.value || '[Not completed]'}`
          })),
          { type: 'paragraph' as const, content: `Section Completion: ${calculateSectionCompletion(section)}%` },
          { type: 'divider' as const },
        ]),
        
        { type: 'heading' as const, content: 'Milestones & Timeline', level: 1 as const },
        { type: 'list' as const, items: milestones.map(m => `${m.month}: ${m.milestone} [${m.status.toUpperCase()}]`) },
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: 'Smart Recommendations', level: 1 as const },
        { type: 'list' as const, items: getSmartTips() },
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: '4-Week Action Plan', level: 1 as const },
        { type: 'table' as const, tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
        }},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: 'GOV.UK Compliance Checklist', level: 1 as const },
        { type: 'list' as const, items: [
          'Business concept demonstrates genuine innovation',
          'Minimum £50,000 investment secured and documented',
          'Clear scalability plan for UK market',
          'Evidence of market demand and competitive advantage',
          'Credible financial projections (3-year minimum)',
          'Founder has relevant skills and experience',
          'Plan shows job creation potential in the UK',
          'All claims supported by evidence and data',
          'Professional presentation with no errors',
          'Reviewed by immigration legal expert',
        ]},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: 'Next Steps', level: 1 as const },
        { type: 'list' as const, items: [
          'Complete all sections to 100%',
          'Gather supporting documentation',
          'Have plan professionally reviewed',
          'Submit to endorsing body',
          'Prepare for interview/additional questions',
        ]},
        
        { type: 'paragraph' as const, content: 'DISCLAIMER: This business plan template is for guidance only. Consult with qualified legal and immigration advisors before submitting visa applications.' },
      ],
      metadata: {
        subject: 'UK Innovator Founder Visa Business Plan',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['visa', 'business plan', 'UK', 'innovator', 'founder'],
      }
    };
  };

  const handleExportPdf = () => {
    const exportData = getExportSections();
    generatePdf(exportData);
    
    toast({
      title: "PDF Exported Successfully",
      description: "Your business plan has been downloaded as a PDF.",
    });
  };

  const handleExportWord = async () => {
    const exportData = getExportSections();
    await generateWord(exportData);
    
    toast({
      title: "Word Document Exported Successfully",
      description: "Your business plan has been downloaded as a Word document (.docx).",
    });
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" },
    { name: "Business Plan Generator", url: "https://innovatorfoundervisaassistant.co.uk/tools/business-plan" }
  ]);

  const articleSchema = createArticleSchema(
    "Business Plan Generator for UK Innovator Founder Visa",
    "Create a comprehensive, GOV.UK-compliant business plan for your UK Innovator Founder Visa application. Covers Innovation, Viability, and Scalability criteria with expert guidance.",
    "2025-11-24"
  );

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, articleSchema]
  };

  return (
    <ToolAccessGuard requiredTier="basic" toolName="Business Plan Generator">
      <SEOHead
        title="Business Plan Generator | UK Innovator Founder Visa Assistant"
        description="Create a professional, GOV.UK-compliant business plan for your UK Innovator Founder Visa. Covers all Innovation, Viability, and Scalability criteria. Used by 1,000+ successful applicants."
        canonical="https://innovatorfoundervisaassistant.co.uk/tools/business-plan"
        keywords="business plan for UK visa, innovator visa business plan, UK visa business plan template, endorsement business plan, visa application business plan"
        schema={combinedSchema}
      />
      <AuthHeader />
      
      {showAutoSaveNotification && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 duration-300"
          data-testid="notification-autosave"
        >
          <Save className="h-4 w-4" />
          <span className="text-sm font-medium">Your work has been saved</span>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-business-plan">Business Plan Generator</h1>
            <p className="text-lg text-muted-foreground">GOV.UK-aligned comprehensive business plan for UK Innovator Founder Visa</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="business-plan"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setActiveTab('tips')}
            onActionPlan={() => setActiveTab('action')}
            getSerializedState={getSerializedState}
            toolName="Business Plan Generator"
          />

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Completion</h3>
                    <p className="text-sm text-muted-foreground">Complete all sections for a comprehensive visa application</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" data-testid="text-overall-completion">{overallCompletion}%</p>
                  </div>
                </div>
                <Progress value={overallCompletion} className="h-3" data-testid="progress-overall" />
                
                {overallCompletion < 100 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {overallCompletion < 50 
                        ? "Your business plan is in early stages. Focus on completing the Executive Summary and Problem/Solution sections first."
                        : overallCompletion < 80
                        ? "Good progress! Continue completing remaining sections to strengthen your visa application."
                        : "Almost there! Review and refine all sections before finalizing your business plan."
                      }
                    </AlertDescription>
                  </Alert>
                )}
                
                {overallCompletion === 100 && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Excellent! Your business plan is complete. Review the Smart Tips and Action Plan tabs for final refinements before submission.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-business-plan">
              <TabsTrigger value="plan" data-testid="tab-plan">Business Plan</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-6">
              {sections.map((section) => (
                <Card key={section.id} data-testid={`section-${section.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>
                          {calculateSectionCompletion(section) === 100 ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </span>
                          ) : (
                            `${calculateSectionCompletion(section)}% complete`
                          )}
                        </CardDescription>
                      </div>
                      <Progress 
                        value={calculateSectionCompletion(section)} 
                        className="w-24 h-2" 
                        data-testid={`progress-${section.id}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.fields.map((field) => (
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
                            onChange={(e) => updateField(section.id, field.id, e.target.value)}
                            placeholder={field.placeholder}
                            data-testid={`input-${section.id}-${field.id}`}
                          />
                        ) : (
                          <Textarea
                            id={field.id}
                            value={field.value}
                            onChange={(e) => updateField(section.id, field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={6}
                            data-testid={`textarea-${section.id}-${field.id}`}
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
                    <CardTitle>Section Completion Progress</CardTitle>
                    <CardDescription>Track completion across all business plan sections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={completionBySection}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          fontSize={12}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Bar dataKey="completion" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Timeline</CardTitle>
                    <CardDescription>Projected business milestones over 24 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Line 
                          type="monotone" 
                          dataKey="progress" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>GOV.UK Visa Requirements Summary</CardTitle>
                  <CardDescription>Key criteria your business plan must address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Genuine Innovation</p>
                        <p className="text-sm text-muted-foreground">Business must be innovative, viable, and scalable with potential to create jobs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Minimum Investment</p>
                        <p className="text-sm text-muted-foreground">At least £50,000 available to invest in your business</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Endorsement</p>
                        <p className="text-sm text-muted-foreground">Must obtain endorsement from an approved endorsing body</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">UK Operations</p>
                        <p className="text-sm text-muted-foreground">Clear plan to establish and scale business operations in the UK</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Scalability</p>
                        <p className="text-sm text-muted-foreground">Demonstrable potential for growth and job creation</p>
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
                  <CardDescription>Context-aware guidance based on your business plan progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Writing Best Practices</CardTitle>
                  <CardDescription>Tips for creating a compelling business plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm"><strong>Be Specific:</strong> Use concrete data, metrics, and examples rather than vague statements</p>
                    <p className="text-sm"><strong>Show Evidence:</strong> Support all claims with research, data, or credible sources</p>
                    <p className="text-sm"><strong>Focus on Innovation:</strong> Clearly articulate what makes your business genuinely innovative</p>
                    <p className="text-sm"><strong>UK Market Focus:</strong> Demonstrate deep understanding of UK market opportunity and competitive landscape</p>
                    <p className="text-sm"><strong>Be Realistic:</strong> Projections should be ambitious but achievable and well-justified</p>
                    <p className="text-sm"><strong>Professional Tone:</strong> Maintain formal, professional language throughout</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    4-Week Action Plan
                  </CardTitle>
                  <CardDescription>Prioritized timeline to complete your business plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0 w-24">
                          <span className="text-sm font-medium text-muted-foreground">{item.week}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{item.action}</p>
                          <span 
                            className={`text-xs px-2 py-1 rounded ${
                              item.priority === 'Critical' 
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' 
                                : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400'
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

              <Card>
                <CardHeader>
                  <CardTitle>Pre-Submission Checklist</CardTitle>
                  <CardDescription>Final steps before submitting to endorsing body</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "All sections completed to 100%",
                      "Financial projections reviewed by accountant",
                      "Market research supported by credible sources",
                      "UK expansion plans detailed and realistic",
                      "Minimum £50,000 investment documented",
                      "Team credentials and CVs prepared",
                      "Supporting documents organized and ready",
                      "Plan reviewed by immigration legal expert",
                      "Spelling and grammar thoroughly checked",
                      "Plan formatted professionally (if submitting PDF)"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm" data-testid={`checklist-${index}`}>
                        <div className="h-4 w-4 rounded border border-muted-foreground" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
