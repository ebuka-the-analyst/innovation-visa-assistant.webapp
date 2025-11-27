import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, PoundSterling, Calculator } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'fee-estimator',
  toolName: 'Fee Estimator',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. Understanding the full cost of your visa application is crucial for planning. I'll help you estimate all fees - government, professional, and relocation costs. Let's build your complete cost picture!",
  questions: [
    {
      id: 'visa-duration',
      question: "How many years of visa are you applying for? The Innovator Founder visa is typically granted for 3 years, with possible extension to 5 years. Which duration are you planning?",
      hint: "IHS surcharge is calculated per year of visa duration",
      fieldKey: 'visa_duration',
      minLength: 10
    },
    {
      id: 'endorsing-body',
      question: "Which endorsing body are you using? Options include Tech Nation, Global Entrepreneurs Programme, Innovator International, or another approved endorser.",
      hint: "Endorsement fees vary significantly between bodies",
      fieldKey: 'endorser_choice',
      minLength: 10
    },
    {
      id: 'legal-support',
      question: "Are you using an immigration lawyer or consultant? If so, what's your estimated budget range for legal fees? Typical range is £3,000-£7,000.",
      hint: "Professional support is highly recommended for first applications",
      fieldKey: 'legal_fees_info',
      minLength: 20
    },
    {
      id: 'dependents-info',
      question: "Are you bringing any dependents (spouse/partner and/or children)? If so, how many? Each dependent has their own application fee and IHS surcharge.",
      hint: "Each dependent adds approximately £4,000+ to total costs",
      fieldKey: 'dependents_info',
      minLength: 10
    },
    {
      id: 'relocation-needs',
      question: "What relocation costs do you anticipate? Consider flights, shipping, initial accommodation (how many months deposit?), and setup costs.",
      hint: "London accommodation deposit is typically 3-6 months rent",
      fieldKey: 'relocation_costs',
      minLength: 30
    },
    {
      id: 'budget-comfort',
      question: "What's your overall budget comfort level for visa-related costs? Are you trying to minimize costs, or prioritize speed and quality of support?",
      hint: "This helps tailor recommendations to your situation",
      fieldKey: 'budget_comfort',
      minLength: 20
    }
  ],
  completionMessage: "Excellent! I've captured your fee estimation parameters. Switch to the traditional view to see the detailed cost breakdown, comparison charts, and money-saving tips for your specific situation."
};

type EndorsingBody = 'techNation' | 'globalEntrepreneurs' | 'other';

export default function FeeEstimator() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('fee-estimator-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const [visaYears, setVisaYears] = useState(3);
  const [endorsingBody, setEndorsingBody] = useState<EndorsingBody>('techNation');
  const [legalFeesLow, setLegalFeesLow] = useState(3000);
  const [legalFeesHigh, setLegalFeesHigh] = useState(7000);
  const [relocationCost, setRelocationCost] = useState(5000);
  const [includeDependents, setIncludeDependents] = useState(false);
  const [numDependents, setNumDependents] = useState(0);
  const [includeAccommodation, setIncludeAccommodation] = useState(false);
  const [accommodationMonths, setAccommodationMonths] = useState(3);
  const [accommodationCostPerMonth, setAccommodationCostPerMonth] = useState(1500);
  const [activeTab, setActiveTab] = useState('estimator');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('fee-estimator-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.visa_duration) {
      const yearsMatch = answers.visa_duration.match(/(\d+)/);
      if (yearsMatch) {
        const years = parseInt(yearsMatch[1]);
        if (years >= 1 && years <= 5) setVisaYears(years);
      }
    }
    
    if (answers.endorser_choice) {
      const lower = answers.endorser_choice.toLowerCase();
      if (lower.includes('tech nation')) setEndorsingBody('techNation');
      else if (lower.includes('global')) setEndorsingBody('globalEntrepreneurs');
      else setEndorsingBody('other');
    }
    
    if (answers.legal_fees_info) {
      const amountMatch = answers.legal_fees_info.match(/£?(\d[\d,]*)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1].replace(/,/g, ''));
        setLegalFeesLow(Math.max(1000, amount - 2000));
        setLegalFeesHigh(amount + 2000);
      }
    }
    
    if (answers.dependents_info) {
      const depMatch = answers.dependents_info.match(/(\d+)/);
      if (depMatch) {
        const deps = parseInt(depMatch[1]);
        if (deps > 0) {
          setIncludeDependents(true);
          setNumDependents(deps);
        }
      } else if (answers.dependents_info.toLowerCase().includes('no')) {
        setIncludeDependents(false);
        setNumDependents(0);
      }
    }
    
    if (answers.relocation_costs) {
      const amountMatch = answers.relocation_costs.match(/£?(\d[\d,]*)/);
      if (amountMatch) {
        setRelocationCost(parseInt(amountMatch[1].replace(/,/g, '')));
      }
    }
    
    const date = new Date().toLocaleString('en-GB');
    setSavedDate(date);
    
    setActiveTab('estimator');
    setMode('traditional');
  };

  const BASE_APPLICATION_FEE = 1191;
  const IHS_SURCHARGE_PER_YEAR = 1035;
  const DEPENDENT_APPLICATION_FEE = 1191;
  const DEPENDENT_IHS_PER_YEAR = 1035;

  const getEndorsementFee = (): number => {
    switch (endorsingBody) {
      case 'techNation': return 1500;
      case 'globalEntrepreneurs': return 2000;
      case 'other': return 2500;
      default: return 1500;
    }
  };

  const applicationFee = BASE_APPLICATION_FEE;
  const ihsSurcharge = IHS_SURCHARGE_PER_YEAR * visaYears;
  const endorsementFee = getEndorsementFee();
  const legalFeesEstimate = (legalFeesLow + legalFeesHigh) / 2;
  const dependentApplicationFees = includeDependents ? numDependents * DEPENDENT_APPLICATION_FEE : 0;
  const dependentIHSFees = includeDependents ? numDependents * DEPENDENT_IHS_PER_YEAR * visaYears : 0;
  const accommodationCosts = includeAccommodation ? accommodationMonths * accommodationCostPerMonth : 0;

  const totalGovFees = applicationFee + ihsSurcharge + endorsementFee + dependentApplicationFees + dependentIHSFees;
  const totalProfessionalFees = legalFeesEstimate;
  const totalRelocationCosts = relocationCost + accommodationCosts;
  const grandTotal = totalGovFees + totalProfessionalFees + totalRelocationCosts;

  const feeBreakdown = [
    { name: 'Application Fee', value: applicationFee, color: '#3b82f6' },
    { name: 'IHS Surcharge', value: ihsSurcharge, color: '#10b981' },
    { name: 'Endorsement Fee', value: endorsementFee, color: '#f59e0b' },
    { name: 'Legal Fees', value: legalFeesEstimate, color: '#8b5cf6' },
    { name: 'Relocation', value: relocationCost, color: '#ec4899' },
  ];

  if (dependentApplicationFees > 0) {
    feeBreakdown.push({ name: 'Dependent Apps', value: dependentApplicationFees, color: '#14b8a6' });
  }
  if (dependentIHSFees > 0) {
    feeBreakdown.push({ name: 'Dependent IHS', value: dependentIHSFees, color: '#f97316' });
  }
  if (accommodationCosts > 0) {
    feeBreakdown.push({ name: 'Accommodation', value: accommodationCosts, color: '#06b6d4' });
  }

  const categoryComparison = [
    { category: 'Gov Fees', amount: totalGovFees, color: '#3b82f6' },
    { category: 'Legal Fees', amount: totalProfessionalFees, color: '#8b5cf6' },
    { category: 'Relocation', amount: totalRelocationCosts, color: '#ec4899' },
  ];

  const getSerializedState = () => {
    return {
      visaYears,
      endorsingBody,
      legalFeesLow,
      legalFeesHigh,
      relocationCost,
      includeDependents,
      numDependents,
      includeAccommodation,
      accommodationMonths,
      accommodationCostPerMonth,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('visaYears' in state) setVisaYears(state.visaYears);
    if ('endorsingBody' in state) setEndorsingBody(state.endorsingBody);
    if ('legalFeesLow' in state) setLegalFeesLow(state.legalFeesLow);
    if ('legalFeesHigh' in state) setLegalFeesHigh(state.legalFeesHigh);
    if ('relocationCost' in state) setRelocationCost(state.relocationCost);
    if ('includeDependents' in state) setIncludeDependents(state.includeDependents);
    if ('numDependents' in state) setNumDependents(state.numDependents);
    if ('includeAccommodation' in state) setIncludeAccommodation(state.includeAccommodation);
    if ('accommodationMonths' in state) setAccommodationMonths(state.accommodationMonths);
    if ('accommodationCostPerMonth' in state) setAccommodationCostPerMonth(state.accommodationCostPerMonth);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('fee-estimator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('fee-estimator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('fee-estimator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (grandTotal > 20000) {
      tips.push("High total cost detected - consider phased payments and building a financial buffer of at least 20% above estimated costs");
    }
    
    if (visaYears >= 3) {
      tips.push("Multi-year IHS surcharge is paid upfront - ensure you have sufficient liquidity for this single payment of £" + ihsSurcharge.toLocaleString());
    }
    
    if (!includeDependents && numDependents === 0) {
      tips.push("If you have family members, remember each dependent adds approximately £" + (DEPENDENT_APPLICATION_FEE + DEPENDENT_IHS_PER_YEAR * 3).toLocaleString() + " for a 3-year visa");
    }
    
    if (legalFeesEstimate < 4000) {
      tips.push("Budget legal fees are low - experienced immigration lawyers typically charge £5,000-£10,000 for comprehensive support with evidence preparation");
    }
    
    if (!includeAccommodation) {
      tips.push("Initial accommodation costs not included - budget £1,200-£2,000/month for temporary housing while you establish yourself");
    }
    
    if (relocationCost < 3000) {
      tips.push("Relocation budget appears modest - consider flights, shipping belongings, initial setup costs (£5,000-£10,000 is typical)");
    }
    
    if (endorsingBody === 'techNation') {
      tips.push("Tech Nation endorsements typically take 8-12 weeks - factor in living costs during this waiting period");
    }
    
    if (grandTotal > 15000) {
      tips.push("Consider staggered fund allocation: endorsement fee first, then application fees, then IHS surcharge at submission");
    }

    tips.push("Currency fluctuations can affect costs - maintain 10-15% buffer above estimated total to account for GBP exchange rate changes");
    
    tips.push("GOV.UK fees are accurate as of November 2025 but subject to annual increases - verify current fees before final budgeting");

    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Research and shortlist immigration lawyers - request quotes and compare services offered", priority: "Critical" },
      { week: "Week 1", action: "Open UK bank account or international money transfer service to minimize currency conversion fees", priority: "High" },
      { week: "Week 1-2", action: "Verify current GOV.UK fee schedule and endorsing body fees for accurate budgeting", priority: "Critical" },
      { week: "Week 2", action: "Set aside endorsement application fee (£" + endorsementFee.toLocaleString() + ") - this is typically paid first", priority: "Critical" },
      { week: "Week 2-3", action: "Arrange for £" + (applicationFee + ihsSurcharge).toLocaleString() + " to cover visa application and IHS surcharge", priority: "Critical" },
      { week: "Week 3", action: "Budget for legal fees (£" + Math.round(legalFeesEstimate).toLocaleString() + ") and agree payment schedule with lawyer", priority: "High" },
      { week: "Week 3-4", action: "Research temporary accommodation options in UK and budget £" + (accommodationCostPerMonth * 3).toLocaleString() + " for first 3 months", priority: "High" },
      { week: "Week 4", action: "Create relocation budget including flights, shipping, insurance (minimum £5,000 recommended)", priority: "Medium" },
      { week: "Week 4", action: "Build 20% contingency buffer (£" + Math.round(grandTotal * 0.2).toLocaleString() + ") for unexpected costs and fee increases", priority: "High" },
      { week: "Ongoing", action: "Track all visa-related expenses in separate account for potential business deductions", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE FEE ESTIMATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

ESTIMATED TOTAL COST: £${grandTotal.toLocaleString()}
${'='.repeat(70)}

GOVERNMENT FEES
${'-'.repeat(70)}
Application Fee (Main Applicant):           £${applicationFee.toLocaleString()}
IHS Surcharge (${visaYears} years @ £${IHS_SURCHARGE_PER_YEAR}/year):    £${ihsSurcharge.toLocaleString()}
Endorsement Fee (${endorsingBody === 'techNation' ? 'Tech Nation' : endorsingBody === 'globalEntrepreneurs' ? 'Global Entrepreneurs' : 'Other'}):              £${endorsementFee.toLocaleString()}
${includeDependents ? `Dependent Application Fees (${numDependents}):      £${dependentApplicationFees.toLocaleString()}` : ''}
${includeDependents ? `Dependent IHS Surcharge (${numDependents} x ${visaYears} years): £${dependentIHSFees.toLocaleString()}` : ''}
                                          _______________
Total Government Fees:                    £${totalGovFees.toLocaleString()}

PROFESSIONAL FEES
${'-'.repeat(70)}
Legal Fees (Estimated Range):            £${legalFeesLow.toLocaleString()} - £${legalFeesHigh.toLocaleString()}
Legal Fees (Average Estimate):           £${Math.round(legalFeesEstimate).toLocaleString()}
                                          _______________
Total Professional Fees:                  £${Math.round(totalProfessionalFees).toLocaleString()}

RELOCATION COSTS
${'-'.repeat(70)}
Relocation & Setup Costs:                 £${relocationCost.toLocaleString()}
${includeAccommodation ? `Temporary Accommodation (${accommodationMonths} months):  £${accommodationCosts.toLocaleString()}` : ''}
                                          _______________
Total Relocation Costs:                   £${totalRelocationCosts.toLocaleString()}

DETAILED BREAKDOWN
${'-'.repeat(70)}
Government Fees:                          £${totalGovFees.toLocaleString()} (${Math.round(totalGovFees/grandTotal*100)}%)
Professional Fees:                        £${Math.round(totalProfessionalFees).toLocaleString()} (${Math.round(totalProfessionalFees/grandTotal*100)}%)
Relocation Costs:                         £${totalRelocationCosts.toLocaleString()} (${Math.round(totalRelocationCosts/grandTotal*100)}%)
                                          _______________
GRAND TOTAL:                              £${grandTotal.toLocaleString()}

Recommended Buffer (20%):                 £${Math.round(grandTotal * 0.2).toLocaleString()}
TOTAL WITH BUFFER:                        £${Math.round(grandTotal * 1.2).toLocaleString()}

PAYMENT TIMELINE GUIDANCE
${'-'.repeat(70)}
1. Endorsement Stage:     £${endorsementFee.toLocaleString()} (paid to endorsing body)
2. Application Stage:     £${applicationFee + dependentApplicationFees}.toLocaleString()} (paid to Home Office)
3. IHS Payment:           £${ihsSurcharge + dependentIHSFees}.toLocaleString()} (paid at application submission)
4. Legal Fees:            £${Math.round(legalFeesEstimate).toLocaleString()} (phased payments to lawyer)
5. Relocation:            £${totalRelocationCosts.toLocaleString()} (post-approval)

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK FINANCIAL PREPARATION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

IMPORTANT NOTES
${'-'.repeat(70)}
- All fees are as of November 2025 and subject to change
- GOV.UK fees typically increase annually in April
- IHS surcharge must be paid in full at application submission
- Currency conversion fees can add 2-5% to total costs
- Legal fees vary significantly based on complexity and lawyer experience
- Endorsement fees are non-refundable even if application is unsuccessful
- Budget for potential appeals or resubmissions (additional £1,000-£3,000)
- Maintain separate emergency fund for UK living costs (min £10,000)
- Keep all receipts for potential business expense deductions
- Check if your home country has tax implications for UK visa costs

OFFICIAL FEE SOURCES
${'-'.repeat(70)}
- GOV.UK Visa Fees: www.gov.uk/visa-fees
- IHS Information: www.gov.uk/healthcare-immigration-application
- Endorsing Bodies: Check individual endorsing body websites for current fees

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This is an estimate only. Actual costs may vary. Always verify
current fees on official government websites before making financial commitments.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visa-fee-estimate-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-fee-estimator">UK Visa Fee Estimator</h1>
            <p className="text-lg text-muted-foreground">Comprehensive cost calculator for Innovator Founder Visa</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="fee-estimator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Fee Estimator"
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-fee-estimator">
              <TabsTrigger value="estimator" data-testid="tab-estimator">Estimator</TabsTrigger>
              <TabsTrigger value="breakdown" data-testid="tab-breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="estimator" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="border-primary">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Estimated Cost</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-grand-total">£{grandTotal.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">+ 20% buffer: £{Math.round(grandTotal * 1.2).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Government Fees</p>
                      <p className="text-3xl font-bold text-blue-600" data-testid="text-gov-fees">£{totalGovFees.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">{Math.round(totalGovFees/grandTotal*100)}% of total</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Professional & Relocation</p>
                      <p className="text-3xl font-bold text-purple-600" data-testid="text-other-fees">£{Math.round(totalProfessionalFees + totalRelocationCosts).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">{Math.round((totalProfessionalFees + totalRelocationCosts)/grandTotal*100)}% of total</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  All fees are based on GOV.UK rates as of November 2025. Always verify current fees before making financial commitments.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Parameters</CardTitle>
                  <CardDescription>Customize your visa application details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="visa-years">Visa Duration (years)</Label>
                      <Input
                        id="visa-years"
                        type="number"
                        min="1"
                        max="5"
                        value={visaYears}
                        onChange={(e) => setVisaYears(parseInt(e.target.value) || 3)}
                        data-testid="input-visa-years"
                      />
                      <p className="text-xs text-muted-foreground">IHS surcharge: £{IHS_SURCHARGE_PER_YEAR}/year × {visaYears} = £{ihsSurcharge.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endorsing-body">Endorsing Body</Label>
                      <select
                        id="endorsing-body"
                        value={endorsingBody}
                        onChange={(e) => setEndorsingBody(e.target.value as EndorsingBody)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-endorsing-body"
                      >
                        <option value="techNation">Tech Nation (£1,500)</option>
                        <option value="globalEntrepreneurs">Global Entrepreneurs (£2,000)</option>
                        <option value="other">Other Body (£2,500)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">Endorsement fee: £{endorsementFee.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include-dependents"
                        checked={includeDependents}
                        onChange={(e) => setIncludeDependents(e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-include-dependents"
                      />
                      <Label htmlFor="include-dependents" className="cursor-pointer font-medium">Include Dependents</Label>
                    </div>

                    {includeDependents && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="num-dependents">Number of Dependents</Label>
                        <Input
                          id="num-dependents"
                          type="number"
                          min="0"
                          max="10"
                          value={numDependents}
                          onChange={(e) => setNumDependents(parseInt(e.target.value) || 0)}
                          data-testid="input-num-dependents"
                        />
                        <p className="text-xs text-muted-foreground">
                          Each dependent: £{DEPENDENT_APPLICATION_FEE.toLocaleString()} application + £{(DEPENDENT_IHS_PER_YEAR * visaYears).toLocaleString()} IHS
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Fees</CardTitle>
                  <CardDescription>Estimated legal and professional service costs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="legal-low">Legal Fees - Low Estimate (£)</Label>
                      <Input
                        id="legal-low"
                        type="number"
                        min="0"
                        step="500"
                        value={legalFeesLow}
                        onChange={(e) => setLegalFeesLow(parseFloat(e.target.value) || 0)}
                        data-testid="input-legal-low"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legal-high">Legal Fees - High Estimate (£)</Label>
                      <Input
                        id="legal-high"
                        type="number"
                        min="0"
                        step="500"
                        value={legalFeesHigh}
                        onChange={(e) => setLegalFeesHigh(parseFloat(e.target.value) || 0)}
                        data-testid="input-legal-high"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average estimate: £{Math.round(legalFeesEstimate).toLocaleString()} 
                    <span className="text-xs ml-2">(Typical range: £3,000-£10,000)</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relocation Costs</CardTitle>
                  <CardDescription>Moving and initial setup expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="relocation-cost">Relocation & Setup Costs (£)</Label>
                    <Input
                      id="relocation-cost"
                      type="number"
                      min="0"
                      step="500"
                      value={relocationCost}
                      onChange={(e) => setRelocationCost(parseFloat(e.target.value) || 0)}
                      data-testid="input-relocation-cost"
                    />
                    <p className="text-xs text-muted-foreground">Flights, shipping, insurance, initial setup</p>
                  </div>

                  <div className="space-y-4 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include-accommodation"
                        checked={includeAccommodation}
                        onChange={(e) => setIncludeAccommodation(e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-include-accommodation"
                      />
                      <Label htmlFor="include-accommodation" className="cursor-pointer font-medium">Include Temporary Accommodation</Label>
                    </div>

                    {includeAccommodation && (
                      <div className="grid md:grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label htmlFor="accommodation-months">Duration (months)</Label>
                          <Input
                            id="accommodation-months"
                            type="number"
                            min="1"
                            max="12"
                            value={accommodationMonths}
                            onChange={(e) => setAccommodationMonths(parseInt(e.target.value) || 1)}
                            data-testid="input-accommodation-months"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accommodation-cost">Cost per Month (£)</Label>
                          <Input
                            id="accommodation-cost"
                            type="number"
                            min="0"
                            step="100"
                            value={accommodationCostPerMonth}
                            onChange={(e) => setAccommodationCostPerMonth(parseFloat(e.target.value) || 0)}
                            data-testid="input-accommodation-cost"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground col-span-2">
                          Total accommodation: £{accommodationCosts.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Breakdown by Category</CardTitle>
                    <CardDescription>Detailed cost distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={feeBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                        >
                          {feeBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Comparison</CardTitle>
                    <CardDescription>Government vs Professional vs Relocation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="amount" fill="#3b82f6">
                          {categoryComparison.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Itemized Cost Breakdown</CardTitle>
                  <CardDescription>Complete fee schedule with GOV.UK rates (November 2025)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <PoundSterling className="h-4 w-4" />
                        Government Fees
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Main Application Fee</span>
                          <span className="font-medium">£{applicationFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IHS Surcharge ({visaYears} years @ £{IHS_SURCHARGE_PER_YEAR}/year)</span>
                          <span className="font-medium">£{ihsSurcharge.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Endorsement Fee ({endorsingBody === 'techNation' ? 'Tech Nation' : endorsingBody === 'globalEntrepreneurs' ? 'Global Entrepreneurs' : 'Other'})</span>
                          <span className="font-medium">£{endorsementFee.toLocaleString()}</span>
                        </div>
                        {includeDependents && numDependents > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span>Dependent Application Fees ({numDependents} × £{DEPENDENT_APPLICATION_FEE.toLocaleString()})</span>
                              <span className="font-medium">£{dependentApplicationFees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dependent IHS ({numDependents} × {visaYears} years × £{DEPENDENT_IHS_PER_YEAR.toLocaleString()})</span>
                              <span className="font-medium">£{dependentIHSFees.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Subtotal Government Fees</span>
                          <span>£{totalGovFees.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-3">Professional Services</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Legal Fees (Range: £{legalFeesLow.toLocaleString()} - £{legalFeesHigh.toLocaleString()})</span>
                          <span className="font-medium">£{Math.round(legalFeesEstimate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Subtotal Professional Fees</span>
                          <span>£{Math.round(totalProfessionalFees).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-3">Relocation Costs</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Relocation & Setup</span>
                          <span className="font-medium">£{relocationCost.toLocaleString()}</span>
                        </div>
                        {includeAccommodation && (
                          <div className="flex justify-between">
                            <span>Temporary Accommodation ({accommodationMonths} months)</span>
                            <span className="font-medium">£{accommodationCosts.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Subtotal Relocation</span>
                          <span>£{totalRelocationCosts.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Grand Total</span>
                        <span className="text-primary">£{grandTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Recommended Buffer (20%)</span>
                        <span>£{Math.round(grandTotal * 0.2).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t">
                        <span>Total with Buffer</span>
                        <span>£{Math.round(grandTotal * 1.2).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Timeline</CardTitle>
                  <CardDescription>When each fee is typically due</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-medium">1</div>
                      <div className="flex-1">
                        <p className="font-medium">Endorsement Stage</p>
                        <p className="text-sm text-muted-foreground">£{endorsementFee.toLocaleString()} - Paid to endorsing body before application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-medium">2</div>
                      <div className="flex-1">
                        <p className="font-medium">Application Submission</p>
                        <p className="text-sm text-muted-foreground">£{(applicationFee + dependentApplicationFees).toLocaleString()} - Application fees to Home Office</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-medium">3</div>
                      <div className="flex-1">
                        <p className="font-medium">IHS Payment</p>
                        <p className="text-sm text-muted-foreground">£{(ihsSurcharge + dependentIHSFees).toLocaleString()} - Paid at same time as application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-medium">4</div>
                      <div className="flex-1">
                        <p className="font-medium">Legal Services</p>
                        <p className="text-sm text-muted-foreground">£{Math.round(legalFeesEstimate).toLocaleString()} - Phased payments throughout process</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-medium">5</div>
                      <div className="flex-1">
                        <p className="font-medium">Post-Approval Relocation</p>
                        <p className="text-sm text-muted-foreground">£{totalRelocationCosts.toLocaleString()} - After visa approval</p>
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
                    Smart Budgeting Recommendations
                  </CardTitle>
                  <CardDescription>Context-aware financial guidance based on your estimates</CardDescription>
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
                  <CardTitle>Cost-Saving Strategies</CardTitle>
                  <CardDescription>Ways to reduce your overall visa expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">DIY Evidence Preparation</p>
                        <p className="text-sm text-muted-foreground">Reduce legal fees by organizing evidence yourself before lawyer review</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Shorter Initial Visa Period</p>
                        <p className="text-sm text-muted-foreground">Apply for 3 years instead of 5 to reduce IHS surcharge upfront (can extend later)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Currency Transfer Services</p>
                        <p className="text-sm text-muted-foreground">Use Wise or similar platforms to save 2-5% on GBP conversion vs banks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Priority vs Standard Processing</p>
                        <p className="text-sm text-muted-foreground">Standard processing is free - priority costs extra £500-£1,000 but may not be necessary</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Shared Legal Consultations</p>
                        <p className="text-sm text-muted-foreground">Some lawyers offer group workshops at reduced rates for standard guidance</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Financial Preparation Plan</CardTitle>
                  <CardDescription>Prioritized action items to ensure you have funds ready</CardDescription>
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
                          <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                            item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
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
                  <CardTitle>Financial Readiness Checklist</CardTitle>
                  <CardDescription>Ensure you have all financial requirements covered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-endorsement-fee" />
                      <span className="text-sm flex-1">Endorsement fee (£{endorsementFee.toLocaleString()}) secured and ready</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-application-fee" />
                      <span className="text-sm flex-1">Application fee (£{(applicationFee + dependentApplicationFees).toLocaleString()}) available in accessible account</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-ihs-fee" />
                      <span className="text-sm flex-1">IHS surcharge (£{(ihsSurcharge + dependentIHSFees).toLocaleString()}) ready for immediate payment</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-legal-fee" />
                      <span className="text-sm flex-1">Legal fee payment plan agreed (£{Math.round(legalFeesEstimate).toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-relocation-fund" />
                      <span className="text-sm flex-1">Relocation fund established (£{totalRelocationCosts.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-buffer" />
                      <span className="text-sm flex-1">20% contingency buffer (£{Math.round(grandTotal * 0.2).toLocaleString()}) set aside</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-currency" />
                      <span className="text-sm flex-1">Currency transfer service set up for GBP conversion</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <input type="checkbox" className="h-4 w-4" data-testid="checkbox-emergency" />
                      <span className="text-sm flex-1">Separate emergency fund (£10,000+) for UK living costs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> Do not pay any fees until you have endorsement confirmation. The endorsement process typically takes 8-12 weeks, and visa application can only begin after endorsement approval.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
