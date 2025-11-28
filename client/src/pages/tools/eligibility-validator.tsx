import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'eligibility-validator',
  toolName: 'Eligibility Validator',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Before investing time in your visa application, let's verify you meet all eligibility requirements for the UK Innovator Founder visa. I'll walk you through each criterion systematically!",
  questions: [
    {
      id: 'age-passport',
      question: "Let's start with basic requirements. How old are you, and do you have a valid passport with at least 6 months validity beyond your intended visa period?",
      hint: "You must be at least 18 years old to apply",
      fieldKey: 'age_passport_status',
      minLength: 20
    },
    {
      id: 'english-level',
      question: "What's your English language proficiency? Have you taken an approved test like IELTS or PTE Academic, and what level did you achieve?",
      hint: "Minimum CEFR B2 level required - that's equivalent to IELTS 5.5-6.5",
      fieldKey: 'english_status',
      minLength: 30
    },
    {
      id: 'funding-available',
      question: "Describe your financial situation. How much investment funding do you have access to, and can you prove these funds have been held for at least 90 days?",
      hint: "There's no fixed minimum, but funds must be appropriate for your business plan",
      fieldKey: 'funding_status',
      minLength: 40
    },
    {
      id: 'entrepreneur-evidence',
      question: "What evidence do you have of genuine entrepreneurial intent? Do you have prior business experience, a comprehensive business plan, and evidence of innovation?",
      hint: "Include any previous ventures, industry expertise, or relevant qualifications",
      fieldKey: 'entrepreneur_status',
      minLength: 50
    },
    {
      id: 'immigration-history',
      question: "Regarding your immigration history - have you had any visa refusals, overstays, or violations in any country? Do you have any criminal convictions?",
      hint: "Be completely honest - undisclosed issues cause automatic refusals",
      fieldKey: 'immigration_status',
      minLength: 30
    },
    {
      id: 'dependents-info',
      question: "Will you be bringing any dependents (spouse/partner or children)? If so, how many, and do you have funds for their maintenance (£200 per dependent)?",
      hint: "Main applicant needs £1,270 plus £200 per dependent",
      fieldKey: 'dependents_status',
      minLength: 20
    }
  ],
  completionMessage: "I've assessed your eligibility profile. Based on your responses, I'll populate the validator with your information. Switch to the traditional view to see your complete eligibility score and address any gaps before applying."
};

type EligibilityState = {
  age: number;
  hasEnglishProof: boolean;
  englishLevel: string;
  fundingAmount: number;
  hasFundingProof: boolean;
  isGenuineEntrepreneur: boolean;
  hasBusinessPlan: boolean;
  hasInnovationEvidence: boolean;
  hasNoImmigrationViolations: boolean;
  hasCriminalRecord: boolean;
  hasValidPassport: boolean;
  dependents: number;
};

export default function EligibilityValidator() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('eligibility-validator-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [state, setState] = useState<EligibilityState>({
    age: 0,
    hasEnglishProof: false,
    englishLevel: 'none',
    fundingAmount: 0,
    hasFundingProof: false,
    isGenuineEntrepreneur: false,
    hasBusinessPlan: false,
    hasInnovationEvidence: false,
    hasNoImmigrationViolations: true,
    hasCriminalRecord: false,
    hasValidPassport: false,
    dependents: 0,
  });
  
  const [activeTab, setActiveTab] = useState('checker');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('eligibility-validator-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('eligibility-validator-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newState = { ...state };
    
    if (answers.age_passport_status) {
      const ageMatch = answers.age_passport_status.match(/(\d+)/);
      if (ageMatch) {
        newState.age = parseInt(ageMatch[1]);
      }
      if (answers.age_passport_status.toLowerCase().includes('valid') || 
          answers.age_passport_status.toLowerCase().includes('yes')) {
        newState.hasValidPassport = true;
      }
    }
    
    if (answers.english_status) {
      const lower = answers.english_status.toLowerCase();
      if (lower.includes('b2') || lower.includes('c1') || lower.includes('c2') ||
          lower.includes('ielts') || lower.includes('pte')) {
        newState.hasEnglishProof = true;
        if (lower.includes('c2')) newState.englishLevel = 'C2';
        else if (lower.includes('c1')) newState.englishLevel = 'C1';
        else newState.englishLevel = 'B2';
      }
    }
    
    if (answers.funding_status) {
      const amountMatch = answers.funding_status.match(/£?(\d[\d,]*)/);
      if (amountMatch) {
        newState.fundingAmount = parseInt(amountMatch[1].replace(/,/g, ''));
        newState.hasFundingProof = true;
      }
    }
    
    if (answers.entrepreneur_status) {
      const lower = answers.entrepreneur_status.toLowerCase();
      if (lower.includes('business') || lower.includes('experience') || lower.includes('founded')) {
        newState.isGenuineEntrepreneur = true;
      }
      if (lower.includes('plan')) {
        newState.hasBusinessPlan = true;
      }
      if (lower.includes('innovat') || lower.includes('patent') || lower.includes('unique')) {
        newState.hasInnovationEvidence = true;
      }
    }
    
    if (answers.immigration_status) {
      const lower = answers.immigration_status.toLowerCase();
      if (lower.includes('no') || lower.includes('clean') || lower.includes('none')) {
        newState.hasNoImmigrationViolations = true;
        newState.hasCriminalRecord = false;
      } else if (lower.includes('yes') || lower.includes('violation') || lower.includes('criminal')) {
        newState.hasNoImmigrationViolations = false;
        newState.hasCriminalRecord = true;
      }
    }
    
    if (answers.dependents_status) {
      const depMatch = answers.dependents_status.match(/(\d+)/);
      if (depMatch) {
        newState.dependents = parseInt(depMatch[1]);
      }
    }
    
    setState(newState);
    
    const date = new Date().toLocaleString('en-GB');
    localStorage.setItem('eligibility-validator-state', JSON.stringify({
      state: newState,
      activeTab: 'checker',
      savedDate: date
    }));
    setSavedDate(date);
    
    setActiveTab('checker');
    setMode('traditional');
  };

  // Eligibility calculations
  const meetsAge = state.age >= 18;
  const meetsEnglish = state.hasEnglishProof && (state.englishLevel === 'B2' || state.englishLevel === 'C1' || state.englishLevel === 'C2');
  const meetsFunding = state.fundingAmount > 0 && state.hasFundingProof;
  const meetsEntrepreneur = state.isGenuineEntrepreneur && state.hasBusinessPlan && state.hasInnovationEvidence;
  const meetsImmigration = state.hasNoImmigrationViolations && !state.hasCriminalRecord && state.hasValidPassport;

  // Checklist items for pie chart
  const checklistItems = [
    { name: 'Age 18+', met: meetsAge },
    { name: 'English B2+', met: meetsEnglish },
    { name: 'Funding Documented', met: meetsFunding },
    { name: 'Entrepreneur Status', met: meetsEntrepreneur },
    { name: 'Immigration Clean', met: meetsImmigration },
  ];

  const completedItems = checklistItems.filter(item => item.met).length;
  const eligibilityScore = Math.round((completedItems / checklistItems.length) * 100);
  const isEligible = completedItems === checklistItems.length;

  // Financial requirements (personal maintenance only - no fixed business investment minimum)
  const mainApplicantFunds = 1270;
  const dependentFunds = state.dependents * 200;
  const totalPersonalFunds = mainApplicantFunds + dependentFunds;
  const totalRequiredFunds = totalPersonalFunds;

  // Category scores for bar chart
  const categoryData = [
    { category: 'Personal', score: meetsAge && state.hasValidPassport ? 100 : 50, max: 100 },
    { category: 'English', score: meetsEnglish ? 100 : (state.hasEnglishProof ? 50 : 0), max: 100 },
    { category: 'Financial', score: meetsFunding ? 100 : (state.hasFundingProof ? 50 : 0), max: 100 },
    { category: 'Business', score: meetsEntrepreneur ? 100 : ((state.hasBusinessPlan ? 33 : 0) + (state.hasInnovationEvidence ? 33 : 0) + (state.isGenuineEntrepreneur ? 34 : 0)), max: 100 },
    { category: 'Immigration', score: meetsImmigration ? 100 : ((state.hasNoImmigrationViolations ? 50 : 0) + (!state.hasCriminalRecord ? 50 : 0)), max: 100 },
  ];

  const pieData = [
    { name: 'Complete', value: completedItems, color: '#10b981' },
    { name: 'Incomplete', value: checklistItems.length - completedItems, color: '#ef4444' },
  ];

  const getSerializedState = () => {
    return {
      state,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (data: any) => {
    if ('state' in data) setState(data.state);
    if ('activeTab' in data) setActiveTab(data.activeTab);
    if ('savedDate' in data) setSavedDate(data.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'eligibility-validator_handoff';
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
      const saved = localStorage.getItem('eligibility-validator-state');
      if (saved) {
        const data = JSON.parse(saved);
        restoreSerializedState(data);
      }
    }
  }, []);

  const handleSave = () => {
    const data = getSerializedState();
    localStorage.setItem('eligibility-validator-state', JSON.stringify(data));
    setSavedDate(data.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('eligibility-validator-state');
    if (saved) {
      const data = JSON.parse(saved);
      restoreSerializedState(data);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (!meetsAge) {
      tips.push("You must be at least 18 years old to apply for the UK Innovator Founder visa");
    }
    
    if (!state.hasEnglishProof) {
      tips.push("Obtain an approved English language test certificate (IELTS, PTE Academic, etc.) at minimum CEFR B2 level");
    } else if (!meetsEnglish) {
      tips.push("Your English level must be at least CEFR B2 - consider retaking the test if below this threshold");
    }
    
    if (!state.hasFundingProof) {
      tips.push("Gather bank statements, investment letters, and proof of fund availability for the past 90 days minimum");
    }
    
    if (!state.hasBusinessPlan) {
      tips.push("A comprehensive business plan is mandatory - it must demonstrate innovation, viability, and scalability");
    }
    
    if (!state.hasInnovationEvidence) {
      tips.push("Document your innovation credentials: patents, unique technology, novel business model, or significant competitive advantage");
    }
    
    if (!state.isGenuineEntrepreneur) {
      tips.push("Build evidence of genuine entrepreneurial intent: prior business experience, industry expertise, or relevant qualifications");
    }
    
    if (state.hasCriminalRecord) {
      tips.push("Seek legal advice regarding criminal record disclosure - some offences may lead to automatic refusal");
    }
    
    if (!state.hasNoImmigrationViolations) {
      tips.push("Address any past immigration violations immediately - these significantly impact visa approval chances");
    }
    
    if (!state.hasValidPassport) {
      tips.push("Ensure your passport is valid for at least 6 months beyond your intended travel date");
    }
    
    if (state.dependents > 0) {
      tips.push(`With ${state.dependents} dependent(s), ensure you have £${totalPersonalFunds.toLocaleString()} for maintenance funds (separate from business investment)`);
    }
    
    if (isEligible) {
      tips.push("Excellent! You meet all core eligibility criteria - focus on gathering comprehensive documentation for each requirement");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Complete English language test (IELTS/PTE) and gather passport documentation", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Secure appropriate investment funds for your business and obtain 90-day bank statements and verification letters", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Draft comprehensive business plan demonstrating innovation, viability, and scalability", 
        priority: "Critical" 
      },
      { 
        week: "Week 2-3", 
        action: "Compile innovation evidence: patents, IP documentation, market research, competitive analysis", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Build genuine entrepreneur portfolio: CV, prior business ventures, industry certifications", 
        priority: "High" 
      },
      { 
        week: "Week 3-4", 
        action: "Gather maintenance funds evidence (£1,270 + £200 per dependent) held for 28 consecutive days", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Obtain police certificates and verify no immigration violations in your history", 
        priority: "Medium" 
      },
      { 
        week: "Week 4", 
        action: "Review all documentation for consistency, accuracy, and completeness before endorsement application", 
        priority: "Critical" 
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ELIGIBILITY VALIDATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

OVERALL ELIGIBILITY ASSESSMENT
${'-'.repeat(70)}
Eligibility Score: ${eligibilityScore}%
Status: ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
Criteria Met: ${completedItems}/${checklistItems.length}

DETAILED CRITERIA BREAKDOWN
${'-'.repeat(70)}

1. AGE REQUIREMENT
   Current Age: ${state.age || 'Not provided'}
   Requirement: Minimum 18 years
   Status: ${meetsAge ? 'PASS' : 'FAIL'}

2. ENGLISH LANGUAGE REQUIREMENT
   Has Proof: ${state.hasEnglishProof ? 'Yes' : 'No'}
   Level: ${state.englishLevel === 'none' ? 'Not provided' : state.englishLevel}
   Requirement: Minimum CEFR B2
   Status: ${meetsEnglish ? 'PASS' : 'FAIL'}

3. FINANCIAL REQUIREMENT
   Available Funds: £${state.fundingAmount.toLocaleString()}
   Has Proof: ${state.hasFundingProof ? 'Yes' : 'No'}
   Business Investment Required: Appropriate for your plan (no fixed minimum)
   Personal Maintenance Required: £${totalPersonalFunds.toLocaleString()}
   Total Required: £${totalRequiredFunds.toLocaleString()}
   Status: ${meetsFunding ? 'PASS' : 'FAIL'}

4. GENUINE ENTREPRENEUR STATUS
   Genuine Entrepreneur: ${state.isGenuineEntrepreneur ? 'Yes' : 'No'}
   Has Business Plan: ${state.hasBusinessPlan ? 'Yes' : 'No'}
   Has Innovation Evidence: ${state.hasInnovationEvidence ? 'Yes' : 'No'}
   Status: ${meetsEntrepreneur ? 'PASS' : 'FAIL'}

5. IMMIGRATION & CHARACTER REQUIREMENT
   No Immigration Violations: ${state.hasNoImmigrationViolations ? 'Yes' : 'No'}
   No Criminal Record: ${!state.hasCriminalRecord ? 'Yes' : 'No'}
   Valid Passport: ${state.hasValidPassport ? 'Yes' : 'No'}
   Status: ${meetsImmigration ? 'PASS' : 'FAIL'}

DEPENDENTS INFORMATION
${'-'.repeat(70)}
Number of Dependents: ${state.dependents}
Maintenance Funds per Dependent: £200
Total Maintenance Required: £${totalPersonalFunds.toLocaleString()}

CATEGORY SCORES
${'-'.repeat(70)}
${categoryData.map(cat => `${cat.category}: ${Math.round(cat.score)}/${cat.max}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

GOV.UK 2025 ELIGIBILITY CRITERIA REFERENCE
${'-'.repeat(70)}
The UK Innovator Founder visa requires applicants to:
- Be at least 18 years old
- Meet English language requirement at CEFR B2 or above
- Have access to appropriate investment funds for your business (no fixed minimum)
- Hold funds in regulated financial institution
- Demonstrate genuine entrepreneurial credentials
- Present innovative, viable, and scalable business idea
- Have no criminal record or immigration violations
- Provide valid passport and supporting documentation
- Meet maintenance funds requirement for self and dependents

For official guidance, visit: gov.uk/innovator-founder-visa

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eligibility-validator-report-${Date.now()}.txt`;
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
            <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
              <h1 className="text-4xl font-bold" data-testid="heading-eligibility-validator">Eligibility Validator</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
            <p className="text-lg text-muted-foreground">UK Innovator Founder Visa eligibility assessment</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="eligibility-validator"
            toolName="Eligibility Validator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-eligibility-validator">
              <TabsTrigger value="checker" data-testid="tab-checker">Checker</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="checker" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Status</CardTitle>
                  <CardDescription>Check if you meet all UK Innovator Founder visa requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={isEligible ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Status</p>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {isEligible ? (
                              <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-8 w-8 text-orange-500" />
                            )}
                          </div>
                          <p className="text-lg font-bold" data-testid="text-eligibility-status">
                            {isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Eligibility Score</p>
                          <p className="text-3xl font-bold text-primary mb-2" data-testid="text-eligibility-score">{eligibilityScore}%</p>
                          <Progress value={eligibilityScore} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Criteria Met</p>
                          <p className="text-3xl font-bold" data-testid="text-criteria-met">{completedItems}/{checklistItems.length}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Funds Required</p>
                          <p className="text-2xl font-bold" data-testid="text-total-funds">£{totalRequiredFunds.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">(Business + Personal)</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!isEligible && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You do not currently meet all eligibility requirements. Review each criterion below and address gaps before applying.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isEligible && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Congratulations! You meet all core eligibility requirements. Ensure all documentation is complete and accurate.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">1. Personal Requirements</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              min="0"
                              max="100"
                              value={state.age || ''}
                              onChange={(e) => setState({ ...state, age: parseInt(e.target.value) || 0 })}
                              placeholder="Enter your age"
                              className="max-w-xs"
                              data-testid="input-age"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              {meetsAge ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-sm text-muted-foreground">Minimum 18 years required</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="valid-passport"
                              checked={state.hasValidPassport}
                              onCheckedChange={(checked) => setState({ ...state, hasValidPassport: checked as boolean })}
                              data-testid="checkbox-valid-passport"
                            />
                            <Label htmlFor="valid-passport" className="cursor-pointer">
                              I have a valid passport (6+ months validity)
                            </Label>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">2. English Language Requirement</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="english-proof"
                              checked={state.hasEnglishProof}
                              onCheckedChange={(checked) => setState({ ...state, hasEnglishProof: checked as boolean })}
                              data-testid="checkbox-english-proof"
                            />
                            <Label htmlFor="english-proof" className="cursor-pointer">
                              I have an approved English language test certificate
                            </Label>
                          </div>

                          {state.hasEnglishProof && (
                            <div>
                              <Label htmlFor="english-level">English Level (CEFR)</Label>
                              <select
                                id="english-level"
                                value={state.englishLevel}
                                onChange={(e) => setState({ ...state, englishLevel: e.target.value })}
                                className="w-full max-w-xs h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid="select-english-level"
                              >
                                <option value="none">Select level</option>
                                <option value="A1">A1 (Beginner)</option>
                                <option value="A2">A2 (Elementary)</option>
                                <option value="B1">B1 (Intermediate)</option>
                                <option value="B2">B2 (Upper Intermediate) - Required</option>
                                <option value="C1">C1 (Advanced)</option>
                                <option value="C2">C2 (Proficient)</option>
                              </select>
                              <div className="flex items-center gap-2 mt-2">
                                {meetsEnglish ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                                <span className="text-sm text-muted-foreground">Minimum B2 level required</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">3. Financial Requirements</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="funding-amount">Investment Funds Available (£)</Label>
                            <Input
                              id="funding-amount"
                              type="number"
                              min="0"
                              value={state.fundingAmount || ''}
                              onChange={(e) => setState({ ...state, fundingAmount: parseFloat(e.target.value) || 0 })}
                              placeholder="50000"
                              className="max-w-xs"
                              data-testid="input-funding-amount"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              {state.fundingAmount > 0 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-sm text-muted-foreground">Funding must be appropriate for your business plan - no fixed minimum</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="funding-proof"
                              checked={state.hasFundingProof}
                              onCheckedChange={(checked) => setState({ ...state, hasFundingProof: checked as boolean })}
                              data-testid="checkbox-funding-proof"
                            />
                            <Label htmlFor="funding-proof" className="cursor-pointer">
                              I have proof of funds (90-day bank statements, verification letters)
                            </Label>
                          </div>

                          <div>
                            <Label htmlFor="dependents">Number of Dependents</Label>
                            <Input
                              id="dependents"
                              type="number"
                              min="0"
                              max="10"
                              value={state.dependents || ''}
                              onChange={(e) => setState({ ...state, dependents: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                              className="max-w-xs"
                              data-testid="input-dependents"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Personal maintenance required: £{totalPersonalFunds.toLocaleString()} (£1,270 + £{dependentFunds.toLocaleString()} for dependents)
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">4. Genuine Entrepreneur Status</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="genuine-entrepreneur"
                              checked={state.isGenuineEntrepreneur}
                              onCheckedChange={(checked) => setState({ ...state, isGenuineEntrepreneur: checked as boolean })}
                              data-testid="checkbox-genuine-entrepreneur"
                            />
                            <Label htmlFor="genuine-entrepreneur" className="cursor-pointer">
                              I have genuine entrepreneurial credentials (business experience, qualifications)
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="business-plan"
                              checked={state.hasBusinessPlan}
                              onCheckedChange={(checked) => setState({ ...state, hasBusinessPlan: checked as boolean })}
                              data-testid="checkbox-business-plan"
                            />
                            <Label htmlFor="business-plan" className="cursor-pointer">
                              I have a comprehensive business plan demonstrating viability and scalability
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="innovation-evidence"
                              checked={state.hasInnovationEvidence}
                              onCheckedChange={(checked) => setState({ ...state, hasInnovationEvidence: checked as boolean })}
                              data-testid="checkbox-innovation-evidence"
                            />
                            <Label htmlFor="innovation-evidence" className="cursor-pointer">
                              I have evidence of innovation (patents, unique technology, novel business model)
                            </Label>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">5. Immigration & Character Requirements</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="no-violations"
                              checked={state.hasNoImmigrationViolations}
                              onCheckedChange={(checked) => setState({ ...state, hasNoImmigrationViolations: checked as boolean })}
                              data-testid="checkbox-no-violations"
                            />
                            <Label htmlFor="no-violations" className="cursor-pointer">
                              I have no previous immigration violations
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="criminal-record"
                              checked={state.hasCriminalRecord}
                              onCheckedChange={(checked) => setState({ ...state, hasCriminalRecord: checked as boolean })}
                              data-testid="checkbox-criminal-record"
                            />
                            <Label htmlFor="criminal-record" className="cursor-pointer">
                              I have a criminal record (check if yes)
                            </Label>
                          </div>

                          {state.hasCriminalRecord && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Criminal records may impact your application. Seek legal advice and be fully transparent in your disclosure.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Status</CardTitle>
                    <CardDescription>Requirements checklist progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Complete the checker to see your progress</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Scores</CardTitle>
                    <CardDescription>Performance by requirement category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
                        <Bar dataKey="score" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements Checklist</CardTitle>
                  <CardDescription>Detailed breakdown of each eligibility criterion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        {item.met ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.met ? 'Requirement met' : 'Requirement not met - review details above'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Personalized tips based on your current eligibility profile</CardDescription>
                </CardHeader>
                <CardContent>
                  {getSmartTips().length > 0 ? (
                    <div className="space-y-3">
                      {getSmartTips().map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-900 dark:text-blue-100">{tip}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Complete the eligibility checker to receive personalized recommendations</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GOV.UK 2025 Reference</CardTitle>
                  <CardDescription>Official eligibility criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Core Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Age: Minimum 18 years old</li>
                        <li>English: CEFR B2 level or equivalent (IELTS 5.5 overall)</li>
                        <li>Investment: Appropriate funds for your business (no fixed minimum)</li>
                        <li>Maintenance: £1,270 (plus £200 per dependent) held for 28 days</li>
                        <li>Business: Innovative, viable, and scalable business idea</li>
                        <li>Character: No serious criminal record or immigration breaches</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Documentation Required:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Valid passport with 6+ months validity</li>
                        <li>English language test certificate (approved provider)</li>
                        <li>Bank statements (90 days minimum) and verification letters</li>
                        <li>Comprehensive business plan with financial projections</li>
                        <li>Innovation evidence (patents, IP, competitive analysis)</li>
                        <li>Police certificates from all countries lived in 12+ months</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to address eligibility requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white ${
                            item.priority === 'Critical' ? 'bg-red-500' : 
                            item.priority === 'High' ? 'bg-orange-500' : 
                            'bg-blue-500'
                          }`}>
                            W{item.week.split(' ')[1].split('-')[0]}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-lg">{item.week}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : 
                              item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' : 
                              'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>What to do after completing eligibility requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                      <div>
                        <p className="font-medium">Research Endorsing Bodies</p>
                        <p className="text-sm text-muted-foreground">Identify approved endorsing bodies relevant to your industry and innovation type</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                      <div>
                        <p className="font-medium">Prepare Endorsement Application</p>
                        <p className="text-sm text-muted-foreground">Complete endorsement application with business plan and all supporting evidence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                      <div>
                        <p className="font-medium">Submit Visa Application</p>
                        <p className="text-sm text-muted-foreground">After receiving endorsement, submit your visa application with all required documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                      <div>
                        <p className="font-medium">Attend Biometrics & Interview</p>
                        <p className="text-sm text-muted-foreground">Complete biometrics appointment and attend credibility interview if requested</p>
                      </div>
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
