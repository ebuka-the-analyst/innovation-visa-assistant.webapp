import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Info, Copy } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'oisc-compliance',
  toolName: 'OISC Compliance Guide',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Understanding OISC regulations is crucial for any platform dealing with immigration-related services. Let me help you assess your compliance status and generate appropriate disclaimers for your business.",
  questions: [
    {
      id: 'business-name',
      question: "What is your business or platform name?",
      hint: "This will be used in your compliance disclaimer",
      fieldKey: 'business_name',
      minLength: 2
    },
    {
      id: 'platform-type',
      question: "What type of service does your platform provide? Describe it briefly.",
      hint: "Examples: business planning tool, document preparation software, educational platform",
      fieldKey: 'platform_type',
      minLength: 10
    },
    {
      id: 'services-offered',
      question: "What specific services do you offer to users? List the main features.",
      hint: "Be specific about what your platform does and doesn't do",
      fieldKey: 'services_offered',
      minLength: 50
    },
    {
      id: 'visa-advice-concern',
      question: "Do you ever provide specific visa advice or recommend visa categories to users?",
      hint: "This is a key compliance question - only OISC-registered advisers can give immigration advice",
      fieldKey: 'visa_advice_concern'
    },
    {
      id: 'form-completion',
      question: "Does your platform complete or help fill in visa application forms for users?",
      hint: "Form completion on behalf of applicants typically requires OISC registration",
      fieldKey: 'form_completion'
    },
    {
      id: 'referral-process',
      question: "Do you have a process to refer users to qualified immigration advisers when needed?",
      hint: "Having clear referral pathways is important for compliance",
      fieldKey: 'referral_process',
      minLength: 20
    }
  ]
};

export default function OiscCompliance() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [activeTab, setActiveTab] = useState('checker');
  const [savedDate, setSavedDate] = useState('');

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('oisc-compliance-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('oisc-compliance-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('oisc-compliance-mode', mode);
  }, [mode]);

  const [checklist, setChecklist] = useState({
    notGivingVisaAdvice: false,
    notInterpretingLaw: false,
    notMakingRepresentations: false,
    notCompletingForms: false,
    onlyProvidingBusinessTools: false,
    notChargingForAdvice: false,
    referringToQualified: false,
    clearDisclaimer: false
  });

  const [disclaimer, setDisclaimer] = useState({
    businessName: '',
    platformType: ''
  });

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.business_name) {
      setDisclaimer(prev => ({ ...prev, businessName: answers.business_name }));
    }
    if (answers.platform_type) {
      setDisclaimer(prev => ({ ...prev, platformType: answers.platform_type }));
    }
    const noVisaAdvice = answers.visa_advice_concern?.toLowerCase().includes('no');
    const noFormCompletion = answers.form_completion?.toLowerCase().includes('no');
    const hasReferral = answers.referral_process?.length > 10;
    
    setChecklist(prev => ({
      ...prev,
      notGivingVisaAdvice: noVisaAdvice,
      notCompletingForms: noFormCompletion,
      referringToQualified: hasReferral,
      onlyProvidingBusinessTools: true
    }));
    setMode('traditional');
    toast({
      title: "AI Assessment Complete",
      description: "Your OISC compliance check has been populated based on your answers.",
    });
  };

  const getSerializedState = () => ({
    checklist, disclaimer, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.checklist) setChecklist(state.checklist);
    if (state.disclaimer) setDisclaimer(state.disclaimer);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const handoffKey = 'oisc-compliance_handoff';
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
      const saved = localStorage.getItem('oisc-compliance-state');
      if (saved) restoreSerializedState(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('oisc-compliance-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your compliance check has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('oisc-compliance-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateComplianceScore = () => {
    const values = Object.values(checklist);
    const checked = values.filter(v => v).length;
    return Math.round((checked / values.length) * 100);
  };

  const getComplianceStatus = () => {
    const score = calculateComplianceScore();
    if (score === 100) return { status: 'Compliant', color: 'bg-green-500' };
    if (score >= 75) return { status: 'Mostly Compliant', color: 'bg-yellow-500' };
    if (score >= 50) return { status: 'Needs Attention', color: 'bg-orange-500' };
    return { status: 'At Risk', color: 'bg-red-500' };
  };

  const generateDisclaimer = () => {
    return `IMPORTANT DISCLAIMER

${disclaimer.businessName || '[Your Business Name]'} is a ${disclaimer.platformType || 'business planning and preparation tool'}. This platform is NOT regulated by the Office of the Immigration Services Commissioner (OISC) and does NOT provide immigration advice.

What this platform provides:
• Business planning tools and templates
• General information about business requirements
• Document organization and preparation assistance
• Educational resources about business processes

What this platform does NOT provide:
• Immigration advice or legal guidance
• Interpretation of UK immigration law
• Recommendations on specific visa routes
• Completion of visa application forms
• Representation before UK Visas and Immigration

If you require immigration advice, please consult:
• An OISC-registered immigration adviser
• A solicitor regulated by the Solicitors Regulation Authority
• A barrister regulated by the Bar Standards Board

For more information about regulated immigration advice, visit:
https://www.gov.uk/find-an-immigration-adviser

By using this platform, you acknowledge that any information provided is for general business planning purposes only and does not constitute immigration advice.`;
  };

  const handleCopyDisclaimer = () => {
    navigator.clipboard.writeText(generateDisclaimer());
    toast({ title: "Copied!", description: "Disclaimer copied to clipboard" });
  };

  const checklistItems = [
    { key: 'notGivingVisaAdvice', label: 'Not giving specific visa advice or recommendations', description: 'You do not advise on which visa route to take or eligibility' },
    { key: 'notInterpretingLaw', label: 'Not interpreting immigration law', description: 'You do not explain what immigration rules mean for individual cases' },
    { key: 'notMakingRepresentations', label: 'Not making representations to UKVI', description: 'You do not communicate with UKVI on behalf of applicants' },
    { key: 'notCompletingForms', label: 'Not completing visa application forms', description: 'You do not fill in official visa application forms for users' },
    { key: 'onlyProvidingBusinessTools', label: 'Only providing business planning tools', description: 'Your tools help with business planning, not visa applications' },
    { key: 'notChargingForAdvice', label: 'Not charging for immigration advice', description: 'Any fees are for business tools, not immigration guidance' },
    { key: 'referringToQualified', label: 'Referring users to qualified advisers', description: 'You direct users to OISC-registered advisers for visa advice' },
    { key: 'clearDisclaimer', label: 'Clear disclaimer displayed', description: 'Users see a clear disclaimer about the nature of your service' }
  ];

  const restrictedActivities = [
    { activity: 'Advising on visa eligibility', risk: 'high', description: 'Telling someone if they qualify for a specific visa' },
    { activity: 'Recommending visa routes', risk: 'high', description: 'Suggesting which visa category to apply under' },
    { activity: 'Explaining immigration rules', risk: 'high', description: 'Interpreting how rules apply to specific situations' },
    { activity: 'Completing visa applications', risk: 'high', description: 'Filling in official UKVI application forms' },
    { activity: 'Correspondence with UKVI', risk: 'high', description: 'Writing to UKVI on behalf of an applicant' },
    { activity: 'Providing general information', risk: 'low', description: 'Sharing publicly available information without applying it to cases' },
    { activity: 'Business plan templates', risk: 'low', description: 'Providing templates for business planning purposes' },
    { activity: 'Financial planning tools', risk: 'low', description: 'Tools for financial projections and planning' }
  ];

  const getSmartTips = () => [
    "OISC registration is required to provide immigration advice in the UK",
    "Business planning tools that don't give visa advice are generally exempt",
    "Always include clear disclaimers about the nature of your service",
    "Direct users to qualified advisers for immigration-specific questions",
    "Avoid language that suggests you're advising on visa matters",
    "Keep records showing your service is business-focused, not visa-focused"
  ];

  const generateActionPlan = () => [
    { week: "Immediate", action: "Add clear disclaimer to all platform pages", priority: "Critical" },
    { week: "Week 1", action: "Review all content for immigration advice language", priority: "Critical" },
    { week: "Week 1", action: "Add referral information to OISC-registered advisers", priority: "High" },
    { week: "Week 2", action: "Train team on boundaries of permitted activities", priority: "High" },
    { week: "Week 2", action: "Create FAQ explaining what service does/doesn't include", priority: "Medium" },
    { week: "Ongoing", action: "Regular review of new features for compliance", priority: "Medium" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'OISC Compliance Assessment',
      subtitle: `Status: ${getComplianceStatus().status} (${calculateComplianceScore()}%)`,
      filename: `oisc-compliance-report-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Compliance Checklist', level: 1 },
        ...checklistItems.map(item => ({ type: 'paragraph' as const, content: `${checklist[item.key as keyof typeof checklist] ? '[PASS]' : '[FAIL]'} ${item.label}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Generated Disclaimer', level: 1 },
        { type: 'paragraph', content: generateDisclaimer() },
        { type: 'divider' },
        { type: 'heading', content: 'Restricted Activities (Require OISC)', level: 1 },
        ...restrictedActivities.filter(a => a.risk === 'high').map(a => ({ type: 'paragraph' as const, content: `WARNING: ${a.activity} - ${a.description}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Permitted Activities', level: 1 },
        ...restrictedActivities.filter(a => a.risk === 'low').map(a => ({ type: 'paragraph' as const, content: `OK: ${a.activity} - ${a.description}` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="responsive-container max-w-6xl">
        <ToolUtilityBar
          toolId="oisc-compliance"
          toolName="OISC Compliance Guide"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                OISC Compliance Guide
              </CardTitle>
              <CardDescription>
                Immigration advice boundary checker & legal opinion templates
              </CardDescription>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <Badge className={getComplianceStatus().color}>{getComplianceStatus().status}</Badge>
                  </div>
                  <Progress value={calculateComplianceScore()} className="h-3" />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="checker" data-testid="tab-checker">
                      <CheckCircle className="h-4 w-4 mr-2" />Compliance Checker
                    </TabsTrigger>
                    <TabsTrigger value="boundaries" data-testid="tab-boundaries">
                      <AlertTriangle className="h-4 w-4 mr-2" />Activity Boundaries
                    </TabsTrigger>
                    <TabsTrigger value="disclaimer" data-testid="tab-disclaimer">
                      <Info className="h-4 w-4 mr-2" />Disclaimer Generator
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="checker" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Compliance Checklist</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check each item that applies to your business to assess OISC compliance.
                    </p>
                    <div className="space-y-4">
                      {checklistItems.map((item) => (
                        <Card key={item.key} className="p-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={item.key}
                              checked={checklist[item.key as keyof typeof checklist]}
                              onCheckedChange={(checked) => {
                                setChecklist({...checklist, [item.key]: checked === true});
                              }}
                              data-testid={`checkbox-${item.key}`}
                            />
                            <div className="flex-1">
                              <Label htmlFor={item.key} className="font-medium cursor-pointer">
                                {item.label}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="boundaries" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Activity Boundaries</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Understanding what activities require OISC registration and what is permitted.
                    </p>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Restricted Activities (Require OISC Registration)
                      </h4>
                      {restrictedActivities.filter(a => a.risk === 'high').map((activity, index) => (
                        <Card key={index} className="p-4 border-red-200 bg-red-50/50 dark:bg-red-950/20">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium">{activity.activity}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}

                      <h4 className="font-semibold text-green-600 flex items-center gap-2 mt-6">
                        <CheckCircle className="h-4 w-4" />
                        Permitted Activities (No Registration Required)
                      </h4>
                      {restrictedActivities.filter(a => a.risk === 'low').map((activity, index) => (
                        <Card key={index} className="p-4 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium">{activity.activity}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="disclaimer" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Disclaimer Generator</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a compliant disclaimer for your platform.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input
                          value={disclaimer.businessName}
                          onChange={(e) => setDisclaimer({...disclaimer, businessName: e.target.value})}
                          placeholder="Your business name"
                          data-testid="input-disclaimer-business"
                        />
                      </div>
                      <div>
                        <Label>Platform Type</Label>
                        <Input
                          value={disclaimer.platformType}
                          onChange={(e) => setDisclaimer({...disclaimer, platformType: e.target.value})}
                          placeholder="e.g., business planning tool"
                          data-testid="input-disclaimer-type"
                        />
                      </div>
                    </div>

                    <Card className="p-4 bg-muted/50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Generated Disclaimer</h4>
                        <Button variant="outline" size="sm" onClick={handleCopyDisclaimer} data-testid="button-copy-disclaimer">
                          <Copy className="h-4 w-4 mr-2" />Copy
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm" data-testid="text-disclaimer">
                        {generateDisclaimer()}
                      </pre>
                    </Card>
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
