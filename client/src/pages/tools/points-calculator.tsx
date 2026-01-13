import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { OISCDisclaimer } from "@/components/OISCDisclaimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Calculator } from "lucide-react";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "points-calculator",
  toolName: "Points Calculator",
  agent: "sage",
  greeting: "Hello! I'm Sage, your Compliance Expert. Let's calculate your UK Innovator Founder Visa points score. The visa requires meeting specific criteria across endorsement, English, funding, innovation, viability, and scalability. I'll help you assess where you stand!",
  questions: [
    {
      id: "english",
      question: "What is your English language proficiency level and how was it assessed?",
      hint: "IELTS 7.0, CEFR B2, native speaker, or degree taught in English",
      fieldKey: "englishLevel",
      minLength: 20
    },
    {
      id: "funding",
      question: "What funding do you have available for your UK business venture?",
      hint: "Include amounts, sources, and evidence of accessibility",
      fieldKey: "fundingAmount",
      minLength: 30
    },
    {
      id: "endorsement",
      question: "Have you secured or are you pursuing endorsement from an approved body?",
      hint: "Name the endorsing body and current status of your application",
      fieldKey: "endorsementStatus",
      minLength: 30
    },
    {
      id: "innovation",
      question: "Describe your innovative business idea and what makes it genuinely new to the UK market.",
      hint: "Focus on what's genuinely innovative, not just a new implementation",
      fieldKey: "innovationDetails",
      minLength: 100
    },
    {
      id: "scalability",
      question: "How will your business create jobs and scale in the UK within 3-5 years?",
      hint: "Include specific job creation targets and growth milestones",
      fieldKey: "scalabilityPlan",
      minLength: 80
    },
    {
      id: "experience",
      question: "What relevant business or entrepreneurial experience do you bring?",
      hint: "Highlight achievements that demonstrate ability to execute your business plan",
      fieldKey: "founderExperience",
      minLength: 50
    }
  ],
  completionMessage: "Excellent! I've gathered your points information. I'll now calculate your eligibility score and show you where you need to focus. Switch to the traditional view to see your complete breakdown."
};

type PointsCategory = {
  id: string;
  name: string;
  points: number;
  maxPoints: number;
  status: 'met' | 'partial' | 'not-met';
  details: string;
};

export default function PointsCalculator() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('points-calculator-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [savedDate, setSavedDate] = useState('');
  const [englishLevel, setEnglishLevel] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [endorsementStatus, setEndorsementStatus] = useState('');
  const [innovationDetails, setInnovationDetails] = useState('');
  const [scalabilityPlan, setScalabilityPlan] = useState('');
  const [founderExperience, setFounderExperience] = useState('');
  
  const [categories, setCategories] = useState<PointsCategory[]>([
    { id: 'endorsement', name: 'Endorsing Body Approval', points: 0, maxPoints: 20, status: 'not-met', details: '' },
    { id: 'english', name: 'English Language (B2+)', points: 0, maxPoints: 10, status: 'not-met', details: '' },
    { id: 'funding', name: 'Investment Funds', points: 0, maxPoints: 10, status: 'not-met', details: '' },
    { id: 'innovation', name: 'Innovation Criterion', points: 0, maxPoints: 20, status: 'not-met', details: '' },
    { id: 'viability', name: 'Viability Criterion', points: 0, maxPoints: 20, status: 'not-met', details: '' },
    { id: 'scalability', name: 'Scalability Criterion', points: 0, maxPoints: 20, status: 'not-met', details: '' }
  ]);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('points-calculator-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('points-calculator-mode', mode);
  }, [mode]);

  useEffect(() => {
    const saved = localStorage.getItem('points-calculator-state');
    if (saved) {
      const state = JSON.parse(saved);
      if ('englishLevel' in state) setEnglishLevel(state.englishLevel);
      if ('fundingAmount' in state) setFundingAmount(state.fundingAmount);
      if ('endorsementStatus' in state) setEndorsementStatus(state.endorsementStatus);
      if ('innovationDetails' in state) setInnovationDetails(state.innovationDetails);
      if ('scalabilityPlan' in state) setScalabilityPlan(state.scalabilityPlan);
      if ('founderExperience' in state) setFounderExperience(state.founderExperience);
      if ('categories' in state) setCategories(state.categories);
      if ('savedDate' in state) setSavedDate(state.savedDate || '');
    }
  }, []);

  const handleAiComplete = (answers: Record<string, string>) => {
    setEnglishLevel(answers.englishLevel || '');
    setFundingAmount(answers.fundingAmount || '');
    setEndorsementStatus(answers.endorsementStatus || '');
    setInnovationDetails(answers.innovationDetails || '');
    setScalabilityPlan(answers.scalabilityPlan || '');
    setFounderExperience(answers.founderExperience || '');
    
    const newCategories = [...categories];
    if (answers.endorsementStatus?.length > 30) {
      newCategories[0] = { ...newCategories[0], points: 15, status: 'partial', details: answers.endorsementStatus };
    }
    if (answers.englishLevel?.length > 20) {
      newCategories[1] = { ...newCategories[1], points: 10, status: 'met', details: answers.englishLevel };
    }
    if (answers.fundingAmount?.length > 30) {
      newCategories[2] = { ...newCategories[2], points: 10, status: 'met', details: answers.fundingAmount };
    }
    if (answers.innovationDetails?.length > 100) {
      newCategories[3] = { ...newCategories[3], points: 15, status: 'partial', details: answers.innovationDetails };
    }
    if (answers.founderExperience?.length > 50) {
      newCategories[4] = { ...newCategories[4], points: 15, status: 'partial', details: answers.founderExperience };
    }
    if (answers.scalabilityPlan?.length > 80) {
      newCategories[5] = { ...newCategories[5], points: 15, status: 'partial', details: answers.scalabilityPlan };
    }
    setCategories(newCategories);
    setMode('traditional');
  };

  const updateCategory = (id: string, field: keyof PointsCategory, value: any) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const totalPoints = categories.reduce((sum, c) => sum + c.points, 0);
  const maxPoints = categories.reduce((sum, c) => sum + c.maxPoints, 0);
  const eligibilityPercent = Math.round((totalPoints / maxPoints) * 100);
  const isEligible = totalPoints >= 70;

  const getSerializedState = () => ({
    englishLevel, fundingAmount, endorsementStatus, innovationDetails, scalabilityPlan, founderExperience,
    categories, savedDate: new Date().toLocaleString('en-GB')
  });

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('points-calculator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - POINTS CALCULATOR\nGenerated: ${new Date().toLocaleString('en-GB')}\n\nTOTAL POINTS: ${totalPoints}/${maxPoints} (${eligibilityPercent}%)\nELIGIBILITY: ${isEligible ? 'LIKELY ELIGIBLE' : 'NEEDS IMPROVEMENT'}\n\nCATEGORY BREAKDOWN:\n${categories.map(c => `${c.name}: ${c.points}/${c.maxPoints} - ${c.status.toUpperCase()}`).join('\n')}\n\nDETAILS:\nEnglish: ${englishLevel}\nFunding: ${fundingAmount}\nEndorsement: ${endorsementStatus}\nInnovation: ${innovationDetails}\nScalability: ${scalabilityPlan}\nExperience: ${founderExperience}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `points-calculator-${Date.now()}.txt`;
    a.click();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold" data-testid="heading-points-calculator">Points Calculator</h1>
              <p className="text-lg text-muted-foreground">Calculate your UK Innovator Founder visa eligibility score</p>
              {savedDate && <p className="text-sm text-muted-foreground mt-1">Last saved: {savedDate}</p>}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          <ToolUtilityBar
            toolId="points-calculator"
            toolName="Points Calculator"
            onSave={handleSave}
            onExport={handleExport}
            getSerializedState={getSerializedState}
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Total Points</p>
                    <p className="text-xl font-bold" data-testid="text-total-points">{totalPoints}</p>
                    <p className="text-sm text-muted-foreground">of {maxPoints} possible</p>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Eligibility Score</p>
                    <p className="text-xl font-bold">{eligibilityPercent}%</p>
                    <Progress value={eligibilityPercent} className="mt-2" />
                  </div>
                </Card>
                <Card className={`p-6 ${isEligible ? 'bg-green-50 dark:bg-green-950' : 'bg-yellow-50 dark:bg-yellow-950'}`}>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    {isEligible ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <p className="text-xl font-bold text-green-600">Likely Eligible</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        <p className="text-xl font-bold text-yellow-600">Needs Work</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-4 mb-6">
                {categories.map(cat => (
                  <Card key={cat.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-bold">{cat.name}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={cat.points}
                          onChange={(e) => updateCategory(cat.id, 'points', Math.min(cat.maxPoints, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-20"
                          min={0}
                          max={cat.maxPoints}
                          data-testid={`input-points-${cat.id}`}
                        />
                        <span className="text-sm text-muted-foreground">/ {cat.maxPoints}</span>
                      </div>
                    </div>
                    <Textarea
                      value={cat.details}
                      onChange={(e) => updateCategory(cat.id, 'details', e.target.value)}
                      placeholder={`Add details about your ${cat.name.toLowerCase()}...`}
                      rows={2}
                      className="mt-2"
                      data-testid={`textarea-details-${cat.id}`}
                    />
                  </Card>
                ))}
              </div>

              <Card className="p-6 mb-6">
                <h3 className="font-bold mb-4">Additional Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>English Proficiency</Label>
                    <Textarea value={englishLevel} onChange={(e) => setEnglishLevel(e.target.value)} placeholder="Describe your English qualifications..." rows={2} data-testid="textarea-english" />
                  </div>
                  <div>
                    <Label>Funding Details</Label>
                    <Textarea value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} placeholder="Describe your funding sources..." rows={2} data-testid="textarea-funding" />
                  </div>
                  <div>
                    <Label>Endorsement Status</Label>
                    <Textarea value={endorsementStatus} onChange={(e) => setEndorsementStatus(e.target.value)} placeholder="Describe your endorsement progress..." rows={2} data-testid="textarea-endorsement" />
                  </div>
                  <div>
                    <Label>Innovation Details</Label>
                    <Textarea value={innovationDetails} onChange={(e) => setInnovationDetails(e.target.value)} placeholder="Describe what makes your business innovative..." rows={2} data-testid="textarea-innovation" />
                  </div>
                </div>
              </Card>

              {!isEligible && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 mb-6">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    Your current score is below the typical threshold. Focus on securing endorsement approval and strengthening your innovation evidence.
                  </AlertDescription>
                </Alert>
              )}

              <OISCDisclaimer variant="compact" className="mt-6" />
            </>
          )}
        </div>
      </div>
    </>
  );
}
