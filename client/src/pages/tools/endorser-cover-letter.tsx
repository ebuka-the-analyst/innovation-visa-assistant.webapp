import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, Copy, RefreshCw, Lightbulb, CheckCircle, AlertTriangle, 
  Sparkles, Download, Eye, Edit3, Wand2, Building2, User, Target
} from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { AiToolGuide, AiTraditionalToggle, ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'endorser-cover-letter',
  toolName: 'Endorser Cover Letter Generator',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you craft a compelling cover letter for your endorsement application. A strong cover letter can make the difference between approval and rejection. Let's create one that clearly demonstrates your Innovation, Viability, and Scalability. Shall we begin?",
  questions: [
    {
      id: 'q1',
      question: "Let's start with the basics. What is your full name as it will appear on your visa application?",
      hint: "Use your legal name exactly as it appears on your passport",
      fieldKey: 'founderName',
      required: true
    },
    {
      id: 'q2', 
      question: "What is the name of your business or startup?",
      hint: "Use the official registered name or trading name",
      fieldKey: 'businessName',
      required: true
    },
    {
      id: 'q3',
      question: "Which endorsing body are you applying to? This helps me tailor your letter appropriately.",
      hint: "e.g., Tech Nation, Founders Forum, Entrepreneur First, etc.",
      fieldKey: 'endorsingBody',
      required: true
    },
    {
      id: 'q4',
      question: "Do you know the name or title of the person/team reviewing applications? If not, I'll use a professional default.",
      hint: "e.g., 'The Endorsement Team' or a specific contact name",
      fieldKey: 'endorsingBodyContact'
    },
    {
      id: 'q5',
      question: "Give me a concise summary of your business. What problem do you solve and for whom? Keep it to 2-3 sentences.",
      hint: "Focus on the core value proposition - what you do and who benefits",
      fieldKey: 'businessSummary',
      minLength: 50,
      required: true
    },
    {
      id: 'q6',
      question: "Now for INNOVATION - the first endorsement criterion. What makes your business genuinely innovative? Think about new technology, novel approaches, or unique solutions.",
      hint: "Describe proprietary technology, unique methodology, first-to-market advantages, or innovative business models",
      fieldKey: 'innovationHighlights',
      minLength: 100,
      required: true
    },
    {
      id: 'q7',
      question: "For VIABILITY - the second criterion. What evidence do you have that your business is or will be commercially viable? Include any revenue, funding, customers, or partnerships.",
      hint: "Mention specific figures: revenue, funding raised, customer numbers, growth rates, LOIs, or pilot programs",
      fieldKey: 'viabilityEvidence',
      minLength: 100,
      required: true
    },
    {
      id: 'q8',
      question: "For SCALABILITY - the third criterion. How will your business grow and scale? What are your expansion plans and job creation projections?",
      hint: "Include market expansion plans, hiring projections, revenue targets, and international growth strategy",
      fieldKey: 'scalabilityPlan',
      minLength: 100,
      required: true
    },
    {
      id: 'q9',
      question: "Tell me about your background and experience. What qualifies you to lead this venture? Include relevant education, work experience, and achievements.",
      hint: "Highlight entrepreneurial experience, technical expertise, industry knowledge, and leadership roles",
      fieldKey: 'founderBackground',
      minLength: 50,
      required: true
    },
    {
      id: 'q10',
      question: "Have you had any previous contact with this endorsing body? Meetings, calls, emails, or events?",
      hint: "Reference any prior relationship - it shows genuine interest and engagement",
      fieldKey: 'previousContact'
    },
    {
      id: 'q11',
      question: "Finally, what documents will you be attaching to your application? List them so I can reference them in the letter.",
      hint: "Common attachments: Business plan, Financial projections, CV, Funding evidence, Market research, References",
      fieldKey: 'attachmentsList'
    }
  ],
  completionMessage: "Excellent! I've gathered all the information needed to create a professional, compelling cover letter that addresses all three endorsement criteria. Your letter is now ready for review and export."
};

const ENDORSING_BODIES = [
  { id: 'envestors', name: 'Envestors', focus: 'Investment-ready businesses' },
  { id: 'ukes', name: 'UK Endorsing Services (UKES)', focus: 'Diverse sector support' },
  { id: 'innovator-international', name: 'Innovator International', focus: 'Global entrepreneurs' },
  { id: 'gep', name: 'Global Entrepreneurs Programme', focus: 'High-growth startups' },
  { id: 'other', name: 'Other Endorsing Body', focus: 'Custom entry' }
];

const LETTER_TEMPLATES = [
  { id: 'standard', name: 'Standard Professional', description: 'Formal and comprehensive' },
  { id: 'concise', name: 'Concise Executive', description: 'Brief and to the point' },
  { id: 'tech-focused', name: 'Tech Innovation', description: 'Emphasizes technical innovation' },
  { id: 'impact', name: 'Social Impact', description: 'Highlights social/environmental impact' }
];

export default function EndorserCoverLetter() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [savedDate, setSavedDate] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('endorser-cover-letter-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('endorser-cover-letter-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [formData, setFormData] = useState({
    founderName: '',
    businessName: '',
    endorsingBody: '',
    endorsingBodyContact: '',
    businessSummary: '',
    innovationHighlights: '',
    viabilityEvidence: '',
    scalabilityPlan: '',
    founderBackground: '',
    previousContact: '',
    attachmentsList: '',
    endorsingBodyId: ''
  });

  const [letterQuality, setLetterQuality] = useState({
    innovation: 0,
    viability: 0,
    scalability: 0,
    overall: 0
  });

  useEffect(() => {
    localStorage.setItem('endorser-cover-letter-mode', mode);
  }, [mode]);

  const getSerializedState = () => ({
    formData, selectedTemplate, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.formData) setFormData(state.formData);
    if (state.selectedTemplate) setSelectedTemplate(state.selectedTemplate);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('endorser-cover-letter-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

  useEffect(() => {
    calculateLetterQuality();
  }, [formData]);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('endorser-cover-letter-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your cover letter has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('endorser-cover-letter-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateCompletenessScore = () => {
    const requiredFields = ['founderName', 'businessName', 'endorsingBody', 'businessSummary', 
                           'innovationHighlights', 'viabilityEvidence', 'scalabilityPlan', 'founderBackground'];
    const filledRequired = requiredFields.filter(f => formData[f as keyof typeof formData]?.trim().length > 0).length;
    return Math.round((filledRequired / requiredFields.length) * 100);
  };

  const calculateLetterQuality = () => {
    const innovationScore = formData.innovationHighlights.length > 200 ? 100 : 
                           formData.innovationHighlights.length > 100 ? 70 : 
                           formData.innovationHighlights.length > 50 ? 40 : 0;
    
    const viabilityScore = formData.viabilityEvidence.length > 200 ? 100 :
                          formData.viabilityEvidence.length > 100 ? 70 :
                          formData.viabilityEvidence.length > 50 ? 40 : 0;
    
    const scalabilityScore = formData.scalabilityPlan.length > 200 ? 100 :
                            formData.scalabilityPlan.length > 100 ? 70 :
                            formData.scalabilityPlan.length > 50 ? 40 : 0;
    
    const overall = Math.round((innovationScore + viabilityScore + scalabilityScore) / 3);
    
    setLetterQuality({
      innovation: innovationScore,
      viability: viabilityScore,
      scalability: scalabilityScore,
      overall
    });
  };

  const handleAiComplete = (answers: Record<string, string>) => {
    const newFormData = { ...formData };
    Object.keys(answers).forEach(key => {
      if (key in newFormData) {
        (newFormData as any)[key] = answers[key];
      }
    });
    setFormData(newFormData);
    localStorage.setItem('endorser-cover-letter-state', JSON.stringify({
      formData: newFormData,
      selectedTemplate,
      activeTab: 'preview',
      savedDate: new Date().toLocaleString('en-GB')
    }));
    setActiveTab('preview');
    toast({
      title: "Cover letter generated!",
      description: "Your letter is ready for review in the Preview tab"
    });
  };

  const generateCoverLetter = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const endorsingBodyInfo = ENDORSING_BODIES.find(e => e.id === formData.endorsingBodyId);
    
    if (selectedTemplate === 'concise') {
      return generateConciseLetter(today);
    } else if (selectedTemplate === 'tech-focused') {
      return generateTechFocusedLetter(today);
    } else if (selectedTemplate === 'impact') {
      return generateImpactLetter(today);
    }
    
    return `${formData.endorsingBodyContact || 'The Endorsement Team'}
${formData.endorsingBody || '[Endorsing Body Name]'}

${today}

Dear ${formData.endorsingBodyContact?.split(' ')[0] || 'Sir/Madam'},

RE: Innovator Founder Visa Endorsement Application - ${formData.businessName || '[Business Name]'}

I am writing to formally submit my application for endorsement under the UK Innovator Founder Visa route. I am ${formData.founderName || '[Your Name]'}, founder of ${formData.businessName || '[Business Name]'}, and I am seeking your endorsement to establish and grow my innovative business in the United Kingdom.

BUSINESS OVERVIEW
${formData.businessSummary || '[Please provide a brief summary of your business]'}

INNOVATION (Criterion 1)
${formData.innovationHighlights || '[Please describe what makes your business innovative]'}

Our business demonstrates genuine innovation through unique technology, novel approaches, and differentiated solutions that address real market needs in ways that existing solutions do not. We have developed proprietary methodologies and intellectual property that position us at the forefront of our sector.

VIABILITY (Criterion 2)
${formData.viabilityEvidence || '[Please provide evidence of business viability]'}

We have conducted extensive market research and validation, demonstrating clear demand for our solution. Our financial projections show a sustainable path to profitability, backed by appropriate funding and a realistic go-to-market strategy.

SCALABILITY (Criterion 3)
${formData.scalabilityPlan || '[Please describe your scalability plans]'}

Our business model is designed for significant growth, with clear plans for UK market penetration and international expansion. We project substantial job creation and meaningful economic contribution to the UK economy over the next 3-5 years.

FOUNDER BACKGROUND & CAPABILITY
${formData.founderBackground || '[Please describe your relevant background and experience]'}

My background demonstrates the skills, experience, and determination necessary to successfully execute this business plan and build a thriving company in the UK.

${formData.previousContact ? `PREVIOUS ENGAGEMENT
${formData.previousContact}

` : ''}ENCLOSED DOCUMENTS
I have enclosed the following documents to support this application:
${formData.attachmentsList || `• Completed endorsement application form
• Comprehensive business plan
• Financial projections (3-5 year forecast)
• Evidence of funding and financial resources
• Market research and validation evidence
• Curriculum Vitae / Resume
• Educational and professional qualifications
• Proof of English language proficiency (if applicable)`}

I am fully committed to establishing a successful, innovative business in the UK that will create jobs, contribute to the economy, and demonstrate the value of international entrepreneurship. I would welcome the opportunity to discuss my application in more detail and address any questions you may have.

Thank you for considering my application. I look forward to your response.

Yours ${formData.endorsingBodyContact ? 'sincerely' : 'faithfully'},


${formData.founderName || '[Your Name]'}
Founder & CEO
${formData.businessName || '[Business Name]'}`;
  };

  const generateConciseLetter = (today: string) => {
    return `${formData.endorsingBodyContact || 'The Endorsement Team'}
${formData.endorsingBody || '[Endorsing Body Name]'}

${today}

Dear ${formData.endorsingBodyContact?.split(' ')[0] || 'Sir/Madam'},

RE: Innovator Founder Visa Endorsement - ${formData.businessName}

I am applying for endorsement under the UK Innovator Founder Visa route for ${formData.businessName}.

BUSINESS: ${formData.businessSummary}

INNOVATION: ${formData.innovationHighlights}

VIABILITY: ${formData.viabilityEvidence}

SCALABILITY: ${formData.scalabilityPlan}

BACKGROUND: ${formData.founderBackground}

I have enclosed all required documentation and welcome the opportunity to discuss my application.

Yours ${formData.endorsingBodyContact ? 'sincerely' : 'faithfully'},

${formData.founderName}
Founder, ${formData.businessName}`;
  };

  const generateTechFocusedLetter = (today: string) => {
    return `${formData.endorsingBodyContact || 'The Endorsement Team'}
${formData.endorsingBody || '[Endorsing Body Name]'}

${today}

Dear ${formData.endorsingBodyContact?.split(' ')[0] || 'Sir/Madam'},

RE: Innovator Founder Visa Endorsement Application - ${formData.businessName}

I am ${formData.founderName}, founder of ${formData.businessName}, applying for endorsement under the UK Innovator Founder Visa route.

TECHNICAL INNOVATION
${formData.innovationHighlights}

Our technology represents a significant advancement in the field, leveraging cutting-edge approaches to solve problems that existing solutions cannot adequately address. We have developed proprietary algorithms/systems/platforms that provide measurable improvements in performance, efficiency, and user outcomes.

COMMERCIAL VIABILITY
${formData.viabilityEvidence}

Our technical innovation is backed by solid commercial foundations. We have validated market demand through customer engagement and have secured appropriate resources to execute our development and go-to-market strategy.

SCALABILITY & GROWTH
${formData.scalabilityPlan}

Our technology architecture is designed for scale, enabling rapid growth as we expand our customer base. We plan to build a strong UK-based team while expanding internationally.

THE BUSINESS
${formData.businessSummary}

FOUNDER CREDENTIALS
${formData.founderBackground}

${formData.previousContact ? `Previous Contact: ${formData.previousContact}\n\n` : ''}I have enclosed comprehensive documentation supporting this application. I look forward to discussing how ${formData.businessName} will contribute to the UK's technology ecosystem.

Yours ${formData.endorsingBodyContact ? 'sincerely' : 'faithfully'},

${formData.founderName}
Founder & CEO, ${formData.businessName}`;
  };

  const generateImpactLetter = (today: string) => {
    return `${formData.endorsingBodyContact || 'The Endorsement Team'}
${formData.endorsingBody || '[Endorsing Body Name]'}

${today}

Dear ${formData.endorsingBodyContact?.split(' ')[0] || 'Sir/Madam'},

RE: Innovator Founder Visa Endorsement Application - ${formData.businessName}

I am ${formData.founderName}, founder of ${formData.businessName}. I am applying for endorsement under the UK Innovator Founder Visa route to bring a purpose-driven, innovative business to the United Kingdom.

OUR MISSION & IMPACT
${formData.businessSummary}

At its core, ${formData.businessName} is driven by a commitment to creating positive change while building a sustainable, scalable business.

INNOVATIVE APPROACH
${formData.innovationHighlights}

Our innovation goes beyond technology—it represents a new way of addressing longstanding challenges that creates value for stakeholders while generating measurable social and environmental benefits.

COMMERCIAL SUSTAINABILITY
${formData.viabilityEvidence}

We believe that impact and commercial success are not mutually exclusive. Our business model demonstrates that doing good and doing well can go hand in hand.

GROWTH & SCALE
${formData.scalabilityPlan}

As we scale, our positive impact will multiply. We are committed to building an inclusive team in the UK while expanding our reach to communities globally.

FOUNDER JOURNEY
${formData.founderBackground}

${formData.previousContact ? `Previous Engagement: ${formData.previousContact}\n\n` : ''}I have enclosed all supporting documentation and would welcome the opportunity to discuss how ${formData.businessName} aligns with your mission to support innovative, impactful businesses.

Yours ${formData.endorsingBodyContact ? 'sincerely' : 'faithfully'},

${formData.founderName}
Founder, ${formData.businessName}`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateCoverLetter());
    toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
  };

  const getSmartTips = () => [
    { tip: "Keep your cover letter to 1-2 pages maximum", priority: "High" },
    { tip: "Address all three endorsement criteria explicitly: Innovation, Viability, Scalability", priority: "Critical" },
    { tip: "Use specific numbers, metrics, and evidence where possible", priority: "High" },
    { tip: "Tailor your letter to the specific endorsing body's focus areas and values", priority: "High" },
    { tip: "Reference any previous communication or meetings with the endorsing body", priority: "Medium" },
    { tip: "Proofread carefully - spelling and grammar errors undermine credibility", priority: "High" },
    { tip: "Include a clear, organized list of all attached documents", priority: "Medium" },
    { tip: "Ensure your business name and personal name match your official documents exactly", priority: "Critical" },
    { tip: "Avoid jargon - explain technical concepts in accessible language", priority: "Medium" },
    { tip: "Show enthusiasm but remain professional and factual", priority: "Medium" }
  ];

  const generateActionPlan = () => [
    { week: "Week 1", action: "Research your chosen endorsing body's specific requirements and focus areas", priority: "Critical" },
    { week: "Week 1", action: "Gather all evidence for Innovation, Viability, and Scalability claims", priority: "Critical" },
    { week: "Week 1", action: "Draft initial cover letter using this tool", priority: "High" },
    { week: "Week 2", action: "Refine each section with specific metrics and evidence", priority: "Critical" },
    { week: "Week 2", action: "Have the letter reviewed by someone familiar with UK visa applications", priority: "High" },
    { week: "Week 2", action: "Cross-reference letter claims with your business plan for consistency", priority: "High" },
    { week: "Week 3", action: "Final proofreading and formatting", priority: "Medium" },
    { week: "Week 3", action: "Prepare and organize all attachments referenced in the letter", priority: "Critical" },
    { week: "Week 3", action: "Submit application with confidence!", priority: "Critical" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Endorser Cover Letter',
      subtitle: `${formData.businessName || 'Business Application'} - ${formData.endorsingBody || 'Endorsing Body'}`,
      filename: `endorser-cover-letter-${Date.now()}.docx`,
      sections: [
        { type: 'paragraph', content: generateCoverLetter() }
      ]
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Strong</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Developing</Badge>;
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Needs Work</Badge>;
  };

  const resetForm = () => {
    setFormData({
      founderName: '', businessName: '', endorsingBody: '', endorsingBodyContact: '',
      businessSummary: '', innovationHighlights: '', viabilityEvidence: '',
      scalabilityPlan: '', founderBackground: '', previousContact: '', attachmentsList: '',
      endorsingBodyId: ''
    });
    toast({ title: "Form reset", description: "All fields have been cleared" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="responsive-container max-w-6xl">
        <ToolUtilityBar
          toolId="endorser-cover-letter"
          toolName="Endorser Cover Letter Generator"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Endorser Cover Letter Generator
                </CardTitle>
                <CardDescription>
                  Create professional, criterion-focused cover letters for endorsement applications
                </CardDescription>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                userTier={userTier}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completeness</span>
                      <span className="text-lg font-bold text-primary">{calculateCompletenessScore()}%</span>
                    </div>
                    <Progress value={calculateCompletenessScore()} className="h-2" />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Innovation</span>
                      {getQualityBadge(letterQuality.innovation)}
                    </div>
                    <Progress value={letterQuality.innovation} className="h-2" />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Viability</span>
                      {getQualityBadge(letterQuality.viability)}
                    </div>
                    <Progress value={letterQuality.viability} className="h-2" />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Scalability</span>
                      {getQualityBadge(letterQuality.scalability)}
                    </div>
                    <Progress value={letterQuality.scalability} className="h-2" />
                  </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="compose" data-testid="tab-compose">
                      <Edit3 className="h-4 w-4 mr-2" />Compose
                    </TabsTrigger>
                    <TabsTrigger value="preview" data-testid="tab-preview">
                      <Eye className="h-4 w-4 mr-2" />Preview
                    </TabsTrigger>
                    <TabsTrigger value="tips" data-testid="tab-tips">
                      <Lightbulb className="h-4 w-4 mr-2" />Smart Tips
                    </TabsTrigger>
                    <TabsTrigger value="action-plan" data-testid="tab-action-plan">
                      <Target className="h-4 w-4 mr-2" />Action Plan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="compose" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Letter Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger data-testid="select-template">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {LETTER_TEMPLATES.map(t => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name} - {t.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Endorsing Body</Label>
                        <Select 
                          value={formData.endorsingBodyId} 
                          onValueChange={(v) => {
                            const body = ENDORSING_BODIES.find(e => e.id === v);
                            setFormData({
                              ...formData, 
                              endorsingBodyId: v,
                              endorsingBody: body?.name || ''
                            });
                          }}
                        >
                          <SelectTrigger data-testid="select-endorsing-body">
                            <SelectValue placeholder="Select endorsing body" />
                          </SelectTrigger>
                          <SelectContent>
                            {ENDORSING_BODIES.map(e => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name} - {e.focus}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Accordion type="multiple" defaultValue={['founder', 'business', 'criteria', 'additional']}>
                      <AccordionItem value="founder">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Founder Details
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Your Full Name *</Label>
                              <Input
                                value={formData.founderName}
                                onChange={(e) => setFormData({...formData, founderName: e.target.value})}
                                placeholder="Enter your full legal name"
                                data-testid="input-founder-name"
                              />
                            </div>
                            <div>
                              <Label>Your Background & Experience *</Label>
                              <Textarea
                                value={formData.founderBackground}
                                onChange={(e) => setFormData({...formData, founderBackground: e.target.value})}
                                placeholder="Relevant education, work experience, achievements..."
                                className="min-h-[100px]"
                                data-testid="input-founder-background"
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="business">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Business Information
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Business Name *</Label>
                              <Input
                                value={formData.businessName}
                                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                placeholder="Your company/startup name"
                                data-testid="input-business-name"
                              />
                            </div>
                            <div>
                              <Label>Endorsing Body Contact</Label>
                              <Input
                                value={formData.endorsingBodyContact}
                                onChange={(e) => setFormData({...formData, endorsingBodyContact: e.target.value})}
                                placeholder="e.g., The Endorsement Team"
                                data-testid="input-endorsing-contact"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Business Summary *</Label>
                              <Textarea
                                value={formData.businessSummary}
                                onChange={(e) => setFormData({...formData, businessSummary: e.target.value})}
                                placeholder="Brief overview: What problem do you solve and for whom?"
                                className="min-h-[100px]"
                                data-testid="input-business-summary"
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="criteria">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Endorsement Criteria (Innovation, Viability, Scalability)
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <Label className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                Criterion 1
                              </Badge>
                              Innovation Highlights *
                            </Label>
                            <Textarea
                              value={formData.innovationHighlights}
                              onChange={(e) => setFormData({...formData, innovationHighlights: e.target.value})}
                              placeholder="What makes your business genuinely innovative? New technology, novel approaches, unique solutions..."
                              className="min-h-[120px]"
                              data-testid="input-innovation-highlights"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {formData.innovationHighlights.length}/200 characters (aim for 200+)
                            </p>
                          </div>
                          <div>
                            <Label className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                Criterion 2
                              </Badge>
                              Viability Evidence *
                            </Label>
                            <Textarea
                              value={formData.viabilityEvidence}
                              onChange={(e) => setFormData({...formData, viabilityEvidence: e.target.value})}
                              placeholder="Evidence of commercial viability: revenue, funding, customers, partnerships, market validation..."
                              className="min-h-[120px]"
                              data-testid="input-viability-evidence"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {formData.viabilityEvidence.length}/200 characters (aim for 200+)
                            </p>
                          </div>
                          <div>
                            <Label className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                Criterion 3
                              </Badge>
                              Scalability Plan *
                            </Label>
                            <Textarea
                              value={formData.scalabilityPlan}
                              onChange={(e) => setFormData({...formData, scalabilityPlan: e.target.value})}
                              placeholder="Growth and scaling plans: UK expansion, international markets, job creation, revenue targets..."
                              className="min-h-[120px]"
                              data-testid="input-scalability-plan"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {formData.scalabilityPlan.length}/200 characters (aim for 200+)
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="additional">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Additional Information
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <Label>Previous Contact with Endorsing Body</Label>
                            <Textarea
                              value={formData.previousContact}
                              onChange={(e) => setFormData({...formData, previousContact: e.target.value})}
                              placeholder="Any previous meetings, calls, emails, or event attendance..."
                              data-testid="input-previous-contact"
                            />
                          </div>
                          <div>
                            <Label>List of Attachments</Label>
                            <Textarea
                              value={formData.attachmentsList}
                              onChange={(e) => setFormData({...formData, attachmentsList: e.target.value})}
                              placeholder="• Business plan&#10;• Financial projections&#10;• CV/Resume&#10;• Funding evidence&#10;..."
                              className="min-h-[100px]"
                              data-testid="input-attachments"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Generated Cover Letter</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyToClipboard} data-testid="button-copy">
                          <Copy className="h-4 w-4 mr-2" />Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportWord} data-testid="button-export">
                          <Download className="h-4 w-4 mr-2" />Export Word
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetForm} data-testid="button-reset">
                          <RefreshCw className="h-4 w-4 mr-2" />Reset
                        </Button>
                      </div>
                    </div>
                    <Card className="p-6 bg-white dark:bg-gray-950 border-2">
                      <pre className="whitespace-pre-wrap text-sm font-serif leading-relaxed" data-testid="text-cover-letter">
                        {generateCoverLetter()}
                      </pre>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tips" className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Smart Tips for a Winning Cover Letter
                    </h3>
                    <div className="grid gap-3">
                      {getSmartTips().map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            {item.priority === 'Critical' ? (
                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            ) : item.priority === 'High' ? (
                              <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                            ) : (
                              <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{item.tip}</p>
                              <Badge 
                                variant="outline" 
                                className={`mt-2 ${
                                  item.priority === 'Critical' ? 'border-red-200 text-red-700 dark:text-red-400' :
                                  item.priority === 'High' ? 'border-orange-200 text-orange-700 dark:text-orange-400' :
                                  'border-yellow-200 text-yellow-700 dark:text-yellow-400'
                                }`}
                              >
                                {item.priority} Priority
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="action-plan" className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      3-Week Action Plan
                    </h3>
                    <div className="space-y-4">
                      {['Week 1', 'Week 2', 'Week 3'].map(week => (
                        <Card key={week} className="p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Badge variant="secondary">{week}</Badge>
                          </h4>
                          <div className="space-y-2">
                            {generateActionPlan().filter(a => a.week === week).map((action, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className={`h-4 w-4 mt-0.5 ${
                                  action.priority === 'Critical' ? 'text-red-500' :
                                  action.priority === 'High' ? 'text-orange-500' :
                                  'text-green-500'
                                }`} />
                                <span className="text-sm">{action.action}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
