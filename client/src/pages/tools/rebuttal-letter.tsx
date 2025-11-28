import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, FileText, Scale, Shield } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "rebuttal-letter",
  toolName: "Rebuttal Letter Builder",
  agent: "sage",
  greeting: "Hello! I'm Sage, your compliance specialist. Let's build a professional rebuttal letter to address Home Office concerns effectively and strengthen your application.",
  questions: [
    {
      id: "applicant",
      question: "What is your full name and visa application reference number?",
      hint: "Provide your legal name as it appears on your visa application",
      fieldKey: "applicantInfo",
      minLength: 20
    },
    {
      id: "concern",
      question: "What specific concern did the Home Office raise in their response?",
      hint: "Quote directly from the Home Office letter where possible",
      fieldKey: "homeOfficeConcern",
      minLength: 100
    },
    {
      id: "response",
      question: "How do you refute or address this concern?",
      hint: "Be factual, professional, and avoid emotional language",
      fieldKey: "rebuttalResponse",
      minLength: 150
    },
    {
      id: "evidence",
      question: "What new or additional evidence will you provide to support your case?",
      hint: "List specific documents and what each one proves",
      fieldKey: "supportingEvidence",
      minLength: 100
    },
    {
      id: "timeline",
      question: "When did you receive the RFE and what is your response deadline?",
      hint: "Tracking deadlines is critical for timely submission",
      fieldKey: "timeline",
      minLength: 30
    },
    {
      id: "closing",
      question: "What is your key closing statement emphasizing why the application should be approved?",
      hint: "End with a strong, professional statement of your case",
      fieldKey: "closingStatement",
      minLength: 80
    }
  ],
  completionMessage: "Your rebuttal letter content has been captured. Review it carefully to ensure all concerns are addressed professionally."
};

type RFEConcern = {
  id: string;
  concernArea: string;
  homeOfficeStatement: string;
  yourResponse: string;
  evidenceProvided: string;
  strengthRating: number;
};

type LetterData = {
  applicantName: string;
  visaType: string;
  applicationReference: string;
  rfeReceivedDate: string;
  rfeDeadlineDate: string;
  concerns: RFEConcern[];
  openingStatement: string;
  closingStatement: string;
};

export default function RebuttalLetter() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('rebuttal-letter-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('rebuttal-letter-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [letterData, setLetterData] = useState<LetterData>({
    applicantName: '',
    visaType: 'UK Innovator Founder Visa',
    applicationReference: '',
    rfeReceivedDate: '',
    rfeDeadlineDate: '',
    concerns: [
      {
        id: '1',
        concernArea: '',
        homeOfficeStatement: '',
        yourResponse: '',
        evidenceProvided: '',
        strengthRating: 5
      }
    ],
    openingStatement: '',
    closingStatement: ''
  });

  const [activeTab, setActiveTab] = useState('builder');
  const [savedDate, setSavedDate] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');

  const updateField = (field: keyof LetterData, value: any) => {
    setLetterData(prev => ({ ...prev, [field]: value }));
  };

  const updateConcern = (id: string, field: keyof RFEConcern, value: any) => {
    setLetterData(prev => ({
      ...prev,
      concerns: prev.concerns.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const addConcern = () => {
    const newId = (Math.max(...letterData.concerns.map(c => parseInt(c.id))) + 1).toString();
    setLetterData(prev => ({
      ...prev,
      concerns: [...prev.concerns, {
        id: newId,
        concernArea: '',
        homeOfficeStatement: '',
        yourResponse: '',
        evidenceProvided: '',
        strengthRating: 5
      }]
    }));
  };

  const removeConcern = (id: string) => {
    setLetterData(prev => ({
      ...prev,
      concerns: prev.concerns.filter(c => c.id !== id)
    }));
  };

  const calculateLetterStrength = (): number => {
    let score = 0;
    const weights = {
      applicantInfo: 10,
      datesProvided: 10,
      concernsAddressed: 40,
      evidenceQuality: 25,
      professionalTone: 15
    };

    if (letterData.applicantName.length > 0 && letterData.applicationReference.length > 0) {
      score += weights.applicantInfo;
    }

    if (letterData.rfeReceivedDate.length > 0 && letterData.rfeDeadlineDate.length > 0) {
      score += weights.datesProvided;
    }

    const validConcerns = letterData.concerns.filter(c => 
      c.concernArea.length > 10 && 
      c.homeOfficeStatement.length > 20 && 
      c.yourResponse.length > 50
    );
    const concernCompleteness = validConcerns.length / Math.max(1, letterData.concerns.length);
    score += weights.concernsAddressed * concernCompleteness;

    const evidenceProvided = letterData.concerns.filter(c => c.evidenceProvided.length > 10).length;
    const evidenceRatio = evidenceProvided / Math.max(1, letterData.concerns.length);
    score += weights.evidenceQuality * evidenceRatio;

    const avgStrength = letterData.concerns.reduce((sum, c) => sum + c.strengthRating, 0) / Math.max(1, letterData.concerns.length);
    score += weights.professionalTone * (avgStrength / 10);

    return Math.round(score);
  };

  const strengthScore = calculateLetterStrength();
  const isReadyForSubmission = strengthScore >= 75;

  const argumentStrengthData = letterData.concerns
    .filter(c => c.concernArea.length > 0)
    .map((c, i) => ({
      name: c.concernArea.substring(0, 20) || `Concern ${i + 1}`,
      strength: c.strengthRating,
      color: c.strengthRating >= 7 ? '#10b981' : c.strengthRating >= 5 ? '#f59e0b' : '#ef4444'
    }));

  const evidenceCoverageData = [
    {
      name: 'With Evidence',
      value: letterData.concerns.filter(c => c.evidenceProvided.length > 10).length,
      color: '#10b981'
    },
    {
      name: 'No Evidence',
      value: letterData.concerns.filter(c => c.evidenceProvided.length <= 10).length,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0);

  const responseQualityData = [
    {
      name: 'Strong (7-10)',
      value: letterData.concerns.filter(c => c.strengthRating >= 7).length,
      color: '#10b981'
    },
    {
      name: 'Medium (4-6)',
      value: letterData.concerns.filter(c => c.strengthRating >= 4 && c.strengthRating < 7).length,
      color: '#f59e0b'
    },
    {
      name: 'Weak (1-3)',
      value: letterData.concerns.filter(c => c.strengthRating < 4).length,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0);

  const getSerializedState = () => {
    return {
      letterData,
      activeTab,
      generatedLetter,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('letterData' in state) setLetterData(state.letterData);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('generatedLetter' in state) setGeneratedLetter(state.generatedLetter);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('rebuttal-letter-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.applicantInfo) {
      const parts = answers.applicantInfo.split(/[,;]/);
      if (parts.length >= 1) {
        const namePart = parts[0].replace(/Full name:?/i, '').trim();
        setLetterData(prev => ({ ...prev, applicantName: namePart }));
      }
      if (parts.length >= 2) {
        const refPart = parts[1].replace(/Application Reference:?/i, '').trim();
        setLetterData(prev => ({ ...prev, applicationReference: refPart }));
      }
    }
    if (answers.homeOfficeConcern) {
      setLetterData(prev => ({
        ...prev,
        concerns: [{
          ...prev.concerns[0],
          concernArea: 'Primary Concern',
          homeOfficeStatement: answers.homeOfficeConcern
        }]
      }));
    }
    if (answers.rebuttalResponse) {
      setLetterData(prev => ({
        ...prev,
        concerns: [{
          ...prev.concerns[0],
          yourResponse: answers.rebuttalResponse
        }]
      }));
    }
    if (answers.supportingEvidence) {
      setLetterData(prev => ({
        ...prev,
        concerns: [{
          ...prev.concerns[0],
          evidenceProvided: answers.supportingEvidence
        }]
      }));
    }
    if (answers.closingStatement) {
      setLetterData(prev => ({ ...prev, closingStatement: answers.closingStatement }));
    }
    setMode('traditional');
  };

  useEffect(() => {
    const saved = localStorage.getItem('rebuttal-letter-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('rebuttal-letter-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('rebuttal-letter-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const generateDraftLetter = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let letter = `${letterData.applicantName || '[Your Name]'}
[Your Address]
[City, Postcode]
[Email]
[Phone]

${today}

UK Visas and Immigration
Home Office
[UKVI Office Address]

Dear Sir/Madam,

RE: Request for Evidence Response - ${letterData.visaType}
Application Reference: ${letterData.applicationReference || '[Your Reference Number]'}
RFE Received: ${letterData.rfeReceivedDate || '[Date]'}

${letterData.openingStatement || 'I write in response to your Request for Evidence dated ' + (letterData.rfeReceivedDate || '[Date]') + ' regarding my ' + letterData.visaType + ' application. I appreciate the opportunity to provide additional clarification and evidence to support my application. I address each concern raised in your letter systematically below.'}

`;

    letterData.concerns.forEach((concern, index) => {
      if (concern.concernArea.length > 0 || concern.homeOfficeStatement.length > 0) {
        letter += `CONCERN ${index + 1}: ${concern.concernArea || '[Concern Area]'}

Home Office Statement:
"${concern.homeOfficeStatement || '[Quote from RFE letter]'}"

Response:
${concern.yourResponse || '[Your detailed response addressing the concern directly]'}

Supporting Evidence:
${concern.evidenceProvided || '[List of documents/evidence provided: e.g., bank statements, contracts, letters of support, certificates]'}

`;
      }
    });

    letter += `CONCLUSION

${letterData.closingStatement || 'I trust that the additional evidence and clarifications provided above comprehensively address all concerns raised in your Request for Evidence. My business demonstrates genuine innovation, scalability potential, and commitment to creating jobs in the UK. I have met all eligibility criteria for the ' + letterData.visaType + ' and respectfully request that my application be approved.'}

I remain available to provide any further information or clarification that may be required. Thank you for your consideration.

Yours faithfully,

${letterData.applicantName || '[Your Name]'}

---

APPENDIX - EVIDENCE INDEX
${letterData.concerns.map((c, i) => 
  c.evidenceProvided ? `Concern ${i + 1}: ${c.evidenceProvided}` : ''
).filter(Boolean).join('\n')}
`;

    setGeneratedLetter(letter);
    setActiveTab('letter');
  };

  const getSmartTips = () => {
    const tips = [];

    if (letterData.concerns.length < 2) {
      tips.push("Most RFEs raise multiple concerns. Ensure you have identified and addressed every single point mentioned in the Home Office letter - missing even one concern can result in rejection. Review the RFE letter carefully and create a separate concern entry for each distinct issue raised.");
    }

    if (letterData.concerns.some(c => c.yourResponse.length < 100)) {
      tips.push("Underdeveloped responses detected. Each response should be comprehensive (minimum 150-200 words) with specific facts, figures, and references to supporting evidence. Vague or brief responses signal lack of preparation and undermine credibility with case workers.");
    }

    if (letterData.concerns.some(c => c.evidenceProvided.length < 20)) {
      tips.push("CRITICAL: Every concern must be supported by specific documentary evidence. List exact document names, dates, and reference numbers (e.g., 'Bank statement from Barclays dated 15 Jan 2025, account ending 4567'). Assertions without evidence are routinely rejected by Home Office case workers.");
    }

    if (letterData.concerns.some(c => c.strengthRating < 5)) {
      tips.push("Weak argument areas identified. For concerns rated below 5/10, consider: (1) obtaining additional third-party evidence (accountant letters, customer testimonials, expert opinions), (2) quantifying claims with specific metrics, (3) citing UK immigration precedents or guidance, and (4) having an immigration lawyer review that specific section.");
    }

    if (!letterData.rfeDeadlineDate) {
      tips.push("RFE deadline not specified. Home Office typically allows 28 days from RFE issue date for response. Missing this deadline results in automatic application refusal. Calculate your deadline precisely and aim to submit 3-5 days early to account for technical issues or postal delays.");
    }

    if (letterData.openingStatement.length < 50) {
      tips.push("Professional opening statement recommended. Start with: (1) gratitude for opportunity to clarify, (2) confidence in meeting all visa criteria, (3) brief roadmap of how you will address each concern systematically. This sets a positive, organized tone that case workers appreciate.");
    }

    if (strengthScore < 60) {
      tips.push("Overall letter strength below acceptable threshold. Strengthen by: (1) adding quantitative evidence (financial figures, customer numbers, market data), (2) obtaining independent verification letters (accountants, lawyers, business advisors), (3) citing specific immigration rules you comply with, and (4) ensuring every claim is backed by named, dated documents in your evidence bundle.");
    }

    if (letterData.concerns.some(c => c.homeOfficeStatement.length < 30)) {
      tips.push("Quote Home Office concerns verbatim. Copy the exact wording from the RFE letter for each concern - this demonstrates you understand the specific issue raised and are addressing it directly (not tangentially). Case workers check whether your response actually answers their question.");
    }

    const avgStrength = letterData.concerns.reduce((sum, c) => sum + c.strengthRating, 0) / Math.max(1, letterData.concerns.length);
    if (avgStrength >= 7 && strengthScore >= 75) {
      tips.push("Strong rebuttal position. Your responses are well-developed with good evidence coverage. Final steps: (1) have immigration lawyer review letter, (2) organize evidence bundle with numbered tabs matching letter sections, (3) create cover sheet listing all documents, (4) proofread for grammar/spelling errors, and (5) submit well before deadline via tracked mail or online portal.");
    }

    if (!letterData.closingStatement.includes('available') && !letterData.closingStatement.includes('clarification')) {
      tips.push("Closing statement should offer continued cooperation. Include language like 'I remain available to provide any further clarification or attend an interview if required.' This demonstrates confidence and willingness to engage further - a positive signal to case workers who may have follow-up questions.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const daysUntilDeadline = letterData.rfeDeadlineDate 
      ? Math.ceil((new Date(letterData.rfeDeadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 28;

    const isUrgent = daysUntilDeadline <= 14;

    return [
      {
        week: isUrgent ? "Day 1-2" : "Week 1",
        action: "Read RFE letter 3+ times and create detailed list of every concern raised - even minor points. For each concern, identify: (1) what evidence Home Office says is missing, (2) what they claim is unclear, and (3) what standard they say you haven't met.",
        priority: "Critical"
      },
      {
        week: isUrgent ? "Day 2-3" : "Week 1",
        action: "Gather all existing evidence and identify gaps. Create spreadsheet mapping each RFE concern to specific documents you have. Flag any concerns where evidence is weak or missing - these require immediate attention.",
        priority: "Critical"
      },
      {
        week: isUrgent ? "Day 3-5" : "Week 1-2",
        action: "Obtain missing evidence urgently: bank verification letters, accountant certification of financials, customer testimonials with contact details, partnership agreements, IP filing confirmations, market research reports. Request expedited processing where possible.",
        priority: "Critical"
      },
      {
        week: isUrgent ? "Day 5-7" : "Week 2",
        action: "Draft detailed responses to each concern. Use structure: (1) acknowledge concern, (2) explain why misunderstanding occurred, (3) provide factual response with specifics, (4) reference evidence by document name and page number, (5) cite relevant immigration rules if applicable.",
        priority: "Critical"
      },
      {
        week: isUrgent ? "Day 7-9" : "Week 2",
        action: "Have immigration lawyer review your draft responses - especially for technical compliance concerns (funding, job creation, innovation criteria). Lawyer can identify legal arguments and precedents that strengthen your case.",
        priority: "High"
      },
      {
        week: isUrgent ? "Day 9-11" : "Week 2-3",
        action: "Organize evidence bundle with numbered tabs matching letter sections. Create cover sheet index listing every document with: document name, date, page count, and which concern it addresses. Use professional binding and page protectors.",
        priority: "High"
      },
      {
        week: isUrgent ? "Day 11-12" : "Week 3",
        action: "Finalize rebuttal letter with all edits incorporated. Proofread for: (1) grammar and spelling, (2) factual accuracy, (3) consistency with evidence, (4) professional tone throughout, (5) correct dates and reference numbers.",
        priority: "High"
      },
      {
        week: isUrgent ? "Day 12-13" : "Week 3",
        action: "Create digital backup of entire submission: scan all documents to PDF, save letter as PDF, upload to secure cloud storage. Keep copies in multiple locations in case original is lost in post or you need to resend.",
        priority: "Medium"
      },
      {
        week: isUrgent ? "Day 13-14" : "Week 3-4",
        action: "Submit via Home Office online portal if available (preferred method - provides instant confirmation receipt). If postal submission required, use tracked Royal Mail Special Delivery or courier service with signature confirmation.",
        priority: "Critical"
      },
      {
        week: isUrgent ? "Day 14" : "Week 4",
        action: "Confirm receipt of submission within 48 hours. If submitted online, save confirmation email and reference number. If postal, confirm delivery via tracking and request Home Office acknowledge receipt via email or phone.",
        priority: "High"
      },
      {
        week: "Week 4+",
        action: "Monitor application status regularly via online portal or by contacting Home Office. Typical RFE response processing time is 8-12 weeks. Prepare for potential follow-up questions or interview request.",
        priority: "Medium"
      },
      {
        week: "Ongoing",
        action: "Do not make material business changes during RFE response period - maintain funding levels, continue business operations as described in application, preserve evidence in case additional verification required.",
        priority: "Medium"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - RFE REBUTTAL LETTER REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

APPLICATION DETAILS
${'-'.repeat(70)}
Applicant: ${letterData.applicantName || '[Not Provided]'}
Visa Type: ${letterData.visaType}
Application Reference: ${letterData.applicationReference || '[Not Provided]'}
RFE Received Date: ${letterData.rfeReceivedDate || '[Not Provided]'}
RFE Deadline Date: ${letterData.rfeDeadlineDate || '[Not Provided]'}

LETTER STRENGTH ANALYSIS
${'-'.repeat(70)}
Overall Strength Score: ${strengthScore}%
Status: ${isReadyForSubmission ? 'READY FOR SUBMISSION' : 'NEEDS IMPROVEMENT'}
Number of Concerns Addressed: ${letterData.concerns.length}
Concerns with Evidence: ${letterData.concerns.filter(c => c.evidenceProvided.length > 10).length}
Average Argument Strength: ${(letterData.concerns.reduce((sum, c) => sum + c.strengthRating, 0) / Math.max(1, letterData.concerns.length)).toFixed(1)}/10

CONCERNS BREAKDOWN
${'-'.repeat(70)}
${letterData.concerns.map((concern, i) => `
CONCERN ${i + 1}: ${concern.concernArea || '[Not Specified]'}
Strength Rating: ${concern.strengthRating}/10

Home Office Statement:
${concern.homeOfficeStatement || '[Not Provided]'}

Your Response:
${concern.yourResponse || '[Not Provided]'}

Evidence Provided:
${concern.evidenceProvided || '[Not Provided]'}
`).join('\n' + '-'.repeat(70))}

GENERATED REBUTTAL LETTER
${'-'.repeat(70)}
${generatedLetter || '[Generate letter first by clicking "Generate Draft Letter" button]'}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

${letterData.rfeDeadlineDate ? `TIMELINE ACTION PLAN (Deadline: ${letterData.rfeDeadlineDate})` : '4-WEEK ACTION PLAN'}
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

HOME OFFICE RFE RESPONSE BEST PRACTICES
${'-'.repeat(70)}

1. STRUCTURE AND TONE
   - Maintain professional, respectful tone throughout
   - Avoid defensive or emotional language
   - Acknowledge concerns before addressing them
   - Use clear section headings for each concern
   - Number paragraphs for easy reference

2. EVIDENCE STANDARDS
   - Every claim must be supported by documentary evidence
   - Name specific documents with dates and reference numbers
   - Use third-party verification where possible (accountants, lawyers, customers)
   - Include English translations for all foreign documents
   - Organize evidence in numbered appendix matching letter sections

3. RESPONSE STRATEGY
   - Quote Home Office concerns verbatim before responding
   - Address concerns in the order they appear in RFE letter
   - Be specific - avoid vague generalizations
   - Quantify wherever possible (amounts, percentages, dates, customer numbers)
   - Cite specific immigration rules or guidance you comply with

4. COMMON RFE CONCERNS AND HOW TO ADDRESS THEM

   Funding Concerns:
   - Provide certified bank statements showing continuous fund availability
   - Obtain accountant verification letter confirming source and accessibility
   - Document fund transfers with clear paper trail
   - Demonstrate funds are not borrowed or encumbered

   Innovation Concerns:
   - Obtain expert opinion letters from industry professionals
   - Provide IP filing confirmations (patents, trademarks)
   - Show competitive analysis demonstrating novelty
   - Include technical specifications or prototypes

   Scalability Concerns:
   - Present detailed growth projections with market data
   - Show evidence of customer demand (LOIs, pilot agreements, pre-orders)
   - Demonstrate team capability to execute (CVs, track records)
   - Provide technology architecture diagrams showing scale potential

   Job Creation Concerns:
   - Submit detailed hiring plan with timelines
   - Show financial capacity to support planned salaries
   - Provide draft job descriptions and required skills
   - Demonstrate business model supports job creation

   Viability Concerns:
   - Include detailed financial projections with assumptions
   - Show evidence of revenue or customer traction
   - Provide market research supporting business model
   - Include letters from customers, partners, or investors

5. SUBMISSION CHECKLIST
   □ Every RFE concern addressed with specific response
   □ All responses supported by named documentary evidence
   □ Evidence organized in appendix with clear index
   □ Letter proofread for grammar, spelling, factual accuracy
   □ All dates and reference numbers verified
   □ Lawyer reviewed letter for legal compliance
   □ Opening and closing statements professional and appropriate
   □ Evidence bundle professionally bound with tabs
   □ Digital backups created and stored securely
   □ Submission method confirmed (online portal vs postal)
   □ Tracking/confirmation mechanism in place
   □ Submitted well before deadline (3-5 days buffer)

6. POST-SUBMISSION
   - Keep copy of entire submission package
   - Monitor application status regularly
   - Respond promptly to any follow-up queries
   - Maintain business operations as described
   - Keep funding accessible and documented
   - Prepare for potential interview request

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This tool provides guidance only. Always consult with a qualified
immigration lawyer before submitting RFE responses. The Home Office assesses
each case individually based on specific circumstances and evidence provided.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rfe-rebuttal-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-rebuttal-letter">
                RFE Rebuttal Letter Generator
              </h1>
              <p className="text-lg text-muted-foreground">
                Respond to Home Office Requests for Evidence with professional, evidence-backed arguments
              </p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          <ToolUtilityBar
            toolId="rebuttal-letter"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="RFE Rebuttal Letter"
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
            <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-rebuttal-letter">
              <TabsTrigger value="builder" data-testid="tab-builder">Builder</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="letter" data-testid="tab-letter">Letter</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Letter Strength Status</CardTitle>
                  <CardDescription>
                    Build a comprehensive RFE response that addresses all Home Office concerns with evidence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={strengthScore >= 75 ? "border-green-500" : strengthScore >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Letter Strength</p>
                          <p className="text-3xl font-bold" data-testid="text-strength-score">
                            {strengthScore}%
                          </p>
                          <Progress value={strengthScore} className="mt-2" />
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {strengthScore >= 75 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">
                              {strengthScore >= 75 ? 'Ready' : strengthScore >= 50 ? 'Needs Work' : 'Weak'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Concerns Addressed</p>
                          <p className="text-3xl font-bold" data-testid="text-concerns-count">
                            {letterData.concerns.length}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm">Total Issues</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={letterData.concerns.every(c => c.evidenceProvided.length > 10) ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Evidence Coverage</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-evidence-count">
                            {letterData.concerns.filter(c => c.evidenceProvided.length > 10).length}/{letterData.concerns.length}
                          </p>
                          <Progress 
                            value={(letterData.concerns.filter(c => c.evidenceProvided.length > 10).length / Math.max(1, letterData.concerns.length)) * 100} 
                            className="mt-2" 
                          />
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <Shield className="h-5 w-5 text-green-500" />
                            <span className="text-sm">With Evidence</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {strengthScore < 50 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your rebuttal letter is currently weak. Address all concerns comprehensively with specific evidence and detailed responses to improve your chances of approval.
                      </AlertDescription>
                    </Alert>
                  )}

                  {strengthScore >= 50 && strengthScore < 75 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your letter shows promise but needs strengthening. Review Smart Tips for specific improvements and ensure every concern has robust evidence.
                      </AlertDescription>
                    </Alert>
                  )}

                  {strengthScore >= 75 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Strong rebuttal letter! Review the generated letter in the Letter tab and have an immigration lawyer review before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Information</CardTitle>
                      <CardDescription>Basic details for your RFE response</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="applicant-name">Applicant Full Name</Label>
                          <Input
                            id="applicant-name"
                            value={letterData.applicantName}
                            onChange={(e) => updateField('applicantName', e.target.value)}
                            placeholder="Your full legal name"
                            data-testid="input-applicant-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="application-ref">Application Reference</Label>
                          <Input
                            id="application-ref"
                            value={letterData.applicationReference}
                            onChange={(e) => updateField('applicationReference', e.target.value)}
                            placeholder="e.g., GWF1234567890"
                            data-testid="input-application-reference"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rfe-received">RFE Received Date</Label>
                          <Input
                            id="rfe-received"
                            type="date"
                            value={letterData.rfeReceivedDate}
                            onChange={(e) => updateField('rfeReceivedDate', e.target.value)}
                            data-testid="input-rfe-received-date"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rfe-deadline">RFE Response Deadline</Label>
                          <Input
                            id="rfe-deadline"
                            type="date"
                            value={letterData.rfeDeadlineDate}
                            onChange={(e) => updateField('rfeDeadlineDate', e.target.value)}
                            data-testid="input-rfe-deadline-date"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="opening-statement">Opening Statement</Label>
                        <Textarea
                          id="opening-statement"
                          value={letterData.openingStatement}
                          onChange={(e) => updateField('openingStatement', e.target.value)}
                          placeholder="Professional opening acknowledging the RFE and expressing confidence in meeting all criteria"
                          className="min-h-24"
                          data-testid="textarea-opening-statement"
                        />
                      </div>
                      <div>
                        <Label htmlFor="closing-statement">Closing Statement</Label>
                        <Textarea
                          id="closing-statement"
                          value={letterData.closingStatement}
                          onChange={(e) => updateField('closingStatement', e.target.value)}
                          placeholder="Professional closing summarizing your response and offering continued cooperation"
                          className="min-h-24"
                          data-testid="textarea-closing-statement"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">RFE Concerns</h3>
                      <Button onClick={addConcern} size="sm" data-testid="button-add-concern">
                        Add Concern
                      </Button>
                    </div>

                    {letterData.concerns.map((concern, index) => (
                      <Card key={concern.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Concern {index + 1}</h4>
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Argument Strength:</Label>
                              <select
                                value={concern.strengthRating}
                                onChange={(e) => updateConcern(concern.id, 'strengthRating', parseInt(e.target.value))}
                                className="w-20 h-8 rounded-md border border-input bg-background px-2 text-sm"
                                data-testid={`select-strength-${concern.id}`}
                              >
                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                  <option key={n} value={n}>{n}/10</option>
                                ))}
                              </select>
                              {letterData.concerns.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeConcern(concern.id)}
                                  data-testid={`button-remove-concern-${concern.id}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`concern-area-${concern.id}`}>Concern Area</Label>
                            <Input
                              id={`concern-area-${concern.id}`}
                              value={concern.concernArea}
                              onChange={(e) => updateConcern(concern.id, 'concernArea', e.target.value)}
                              placeholder="e.g., Funding Source Verification, Innovation Credibility, Job Creation Plan"
                              data-testid={`input-concern-area-${concern.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`ho-statement-${concern.id}`}>Home Office Statement (Quote Verbatim)</Label>
                            <Textarea
                              id={`ho-statement-${concern.id}`}
                              value={concern.homeOfficeStatement}
                              onChange={(e) => updateConcern(concern.id, 'homeOfficeStatement', e.target.value)}
                              placeholder="Copy the exact wording from the RFE letter for this specific concern"
                              className="min-h-20"
                              data-testid={`textarea-ho-statement-${concern.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`your-response-${concern.id}`}>Your Detailed Response</Label>
                            <Textarea
                              id={`your-response-${concern.id}`}
                              value={concern.yourResponse}
                              onChange={(e) => updateConcern(concern.id, 'yourResponse', e.target.value)}
                              placeholder="Provide a comprehensive response addressing the concern directly with specific facts, figures, and references to evidence"
                              className="min-h-32"
                              data-testid={`textarea-your-response-${concern.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`evidence-${concern.id}`}>Evidence Provided</Label>
                            <Textarea
                              id={`evidence-${concern.id}`}
                              value={concern.evidenceProvided}
                              onChange={(e) => updateConcern(concern.id, 'evidenceProvided', e.target.value)}
                              placeholder="List specific documents with names, dates, and reference numbers (e.g., 'Bank statement from Barclays dated 15 Jan 2025, account ending 4567; Letter from accountant John Smith dated 20 Jan 2025')"
                              className="min-h-20"
                              data-testid={`textarea-evidence-${concern.id}`}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button 
                    onClick={generateDraftLetter} 
                    className="w-full bg-primary"
                    size="lg"
                    data-testid="button-generate-letter"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Draft Letter
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Argument Strength by Concern</CardTitle>
                    <CardDescription>Self-assessed strength rating for each concern (1-10 scale)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {argumentStrengthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={argumentStrengthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Bar dataKey="strength" name="Strength Rating">
                            {argumentStrengthData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add concerns to see strength analysis</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evidence Coverage</CardTitle>
                    <CardDescription>Proportion of concerns with supporting evidence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {evidenceCoverageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={evidenceCoverageData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {evidenceCoverageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add evidence to see coverage breakdown</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Response Quality Distribution</CardTitle>
                    <CardDescription>Distribution of argument strength across all concerns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {responseQualityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={responseQualityData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="value" name="Number of Concerns">
                            {responseQualityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Rate concern strengths to see quality distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Strength Score Breakdown</CardTitle>
                  <CardDescription>How your letter strength score is calculated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Applicant Information (10 points)</p>
                        <p className="text-sm text-muted-foreground">
                          Complete name and application reference provided
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Timeline Information (10 points)</p>
                        <p className="text-sm text-muted-foreground">
                          RFE received date and response deadline specified
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Concerns Addressed (40 points)</p>
                        <p className="text-sm text-muted-foreground">
                          Proportion of concerns with complete information (area, Home Office statement, your response)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Evidence Quality (25 points)</p>
                        <p className="text-sm text-muted-foreground">
                          Proportion of concerns with specific supporting evidence documented
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Professional Tone (15 points)</p>
                        <p className="text-sm text-muted-foreground">
                          Average self-assessed argument strength rating across all concerns
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="letter" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Rebuttal Letter</CardTitle>
                  <CardDescription>
                    Professional formatted letter for Home Office submission - review carefully before use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedLetter ? (
                    <div className="bg-muted p-6 rounded-lg">
                      <pre className="whitespace-pre-wrap font-mono text-sm" data-testid="text-generated-letter">
                        {generatedLetter}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Click "Generate Draft Letter" in the Builder tab to create your rebuttal letter
                      </p>
                      <Button onClick={() => setActiveTab('builder')} data-testid="button-go-to-builder">
                        Go to Builder
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {generatedLetter && (
                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                    <CardDescription>Critical actions before submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Review and Edit</p>
                          <p className="text-sm text-muted-foreground">
                            Copy letter to Word document, personalize, add specific details, and proofread thoroughly
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Legal Review</p>
                          <p className="text-sm text-muted-foreground">
                            Have immigration lawyer review letter for legal compliance and persuasiveness
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Organize Evidence</p>
                          <p className="text-sm text-muted-foreground">
                            Compile all referenced documents in numbered appendix matching letter sections
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Submit Before Deadline</p>
                          <p className="text-sm text-muted-foreground">
                            Allow 3-5 days buffer before deadline for technical issues or postal delays
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tips</CardTitle>
                  <CardDescription>
                    AI-powered recommendations based on your RFE response structure and content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {letterData.rfeDeadlineDate 
                      ? `Action Plan - Deadline: ${new Date(letterData.rfeDeadlineDate).toLocaleDateString('en-GB')}`
                      : '4-Week Action Plan'
                    }
                  </CardTitle>
                  <CardDescription>
                    Prioritized timeline for preparing and submitting your RFE response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={
                        item.priority === 'Critical' ? 'border-destructive' :
                        item.priority === 'High' ? 'border-orange-500' :
                        'border-muted'
                      }>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.priority === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                              item.priority === 'High' ? 'bg-orange-500 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {item.priority}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold mb-2">{item.week}</p>
                              <p className="text-sm text-muted-foreground">{item.action}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
