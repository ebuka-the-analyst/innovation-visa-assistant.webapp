import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, AlertTriangle, CheckCircle2, FileText, Copy, Download,
  Lightbulb, Scale, Users, ExternalLink, Book
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceCheck {
  id: string;
  question: string;
  answer: boolean;
  risk: "high" | "medium" | "low";
  explanation: string;
  recommendation: string;
}

export default function OISCCompliance() {
  const { toast } = useToast();
  
  const [checks, setChecks] = useState<ComplianceCheck[]>([
    {
      id: "1",
      question: "Does your service provide specific advice on visa categories or routes?",
      answer: false,
      risk: "high",
      explanation: "Advising on specific visa routes (e.g., 'you should apply for Innovator Founder') constitutes regulated advice.",
      recommendation: "Use general information only. State 'Based on general eligibility criteria, you may wish to explore...' rather than 'You should apply for...'"
    },
    {
      id: "2",
      question: "Does your service tell users whether they are eligible for a visa?",
      answer: false,
      risk: "high",
      explanation: "Making eligibility determinations is regulated immigration advice under the Immigration and Asylum Act 1999.",
      recommendation: "Provide scoring/assessment tools but always state: 'This is for informational purposes only and does not constitute legal advice. Consult an OISC-registered adviser for eligibility assessment.'"
    },
    {
      id: "3",
      question: "Does your service help users complete visa application forms?",
      answer: false,
      risk: "high",
      explanation: "Assisting with form completion is regulated activity unless purely clerical (copying information already provided).",
      recommendation: "Provide templates and checklists but do not offer to complete or review completed forms. Partner with OISC-registered advisers for form review services."
    },
    {
      id: "4",
      question: "Does your service provide interpretation of immigration rules?",
      answer: false,
      risk: "high",
      explanation: "Interpreting immigration rules for individual circumstances is regulated advice.",
      recommendation: "Quote official sources directly and provide links. State: 'According to the Home Office guidance...' without interpreting for specific cases."
    },
    {
      id: "5",
      question: "Do you have partnerships with OISC-registered advisers?",
      answer: false,
      risk: "medium",
      explanation: "Having regulated partners demonstrates compliance awareness and provides escalation path.",
      recommendation: "Establish referral partnerships with 2-3 OISC Level 1+ advisers. Display their registration numbers prominently."
    },
    {
      id: "6",
      question: "Do you display appropriate disclaimers on all pages?",
      answer: false,
      risk: "medium",
      explanation: "Clear disclaimers help demonstrate you are providing information, not regulated advice.",
      recommendation: "Include on every page: 'This tool provides general information only. It does not constitute immigration advice. For legal advice, consult an OISC-registered adviser.'"
    },
    {
      id: "7",
      question: "Is your service limited to business planning rather than immigration advice?",
      answer: false,
      risk: "low",
      explanation: "Business planning tools (business plans, financial projections) are not regulated immigration activities.",
      recommendation: "Position your core service as business planning assistance with immigration information as context only."
    },
    {
      id: "8",
      question: "Do you clearly separate 'information' from 'advice' in your communications?",
      answer: false,
      risk: "medium",
      explanation: "The distinction between information (general facts) and advice (tailored recommendations) is critical.",
      recommendation: "Review all copy. Replace 'you should' with 'applicants typically' or 'the requirements state'. Never use 'we recommend' for immigration matters."
    }
  ]);

  const [legalOpinionData, setLegalOpinionData] = useState({
    companyName: "",
    serviceDescription: "",
    targetUsers: "",
    lawyerName: "",
    lawFirm: ""
  });

  const [generatedOpinionRequest, setGeneratedOpinionRequest] = useState("");

  const calculateComplianceScore = () => {
    const positiveAnswers = checks.filter(c => {
      if (c.id === "5" || c.id === "6" || c.id === "7" || c.id === "8") {
        return c.answer === true;
      }
      return c.answer === false;
    }).length;
    return Math.round((positiveAnswers / checks.length) * 100);
  };

  const toggleCheck = (id: string) => {
    setChecks(checks.map(c => 
      c.id === id ? { ...c, answer: !c.answer } : c
    ));
  };

  const generateLegalOpinionRequest = () => {
    if (!legalOpinionData.companyName || !legalOpinionData.serviceDescription) {
      toast({ title: "Missing Information", description: "Please fill in company and service details", variant: "destructive" });
      return;
    }

    const request = `LEGAL OPINION REQUEST - OISC COMPLIANCE ASSESSMENT

TO: ${legalOpinionData.lawyerName || "[Immigration Lawyer Name]"}
    ${legalOpinionData.lawFirm || "[Law Firm Name]"}

FROM: ${legalOpinionData.companyName}

DATE: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

RE: Request for Legal Opinion on OISC Compliance

Dear ${legalOpinionData.lawyerName || "Counsel"},

We are writing to request a formal legal opinion regarding whether our business activities fall within the scope of regulated immigration advice under the Immigration and Asylum Act 1999 and whether we require registration with the Office of the Immigration Services Commissioner (OISC).

ABOUT OUR SERVICE

${legalOpinionData.companyName} provides the following services:

${legalOpinionData.serviceDescription}

Our target users are: ${legalOpinionData.targetUsers || "entrepreneurs and business owners exploring UK visa options"}

SPECIFIC QUESTIONS FOR OPINION

1. Based on the service description above, do our activities constitute "immigration advice" or "immigration services" as defined under the Immigration and Asylum Act 1999, Section 82?

2. If any of our activities are regulated, which specific aspects require OISC registration or supervision by a qualified person?

3. What modifications, if any, would you recommend to ensure our services remain outside the scope of regulated activities?

4. Do you recommend any specific disclaimers, terms of service, or operational changes?

5. Would you be willing to provide a formal legal opinion letter that we could submit to endorsing bodies (e.g., Tech Nation, Envestors) to demonstrate our compliance awareness?

MATERIALS PROVIDED

We attach the following for your review:
- Full service description and feature list
- Sample outputs from our tools
- Current terms of service and disclaimers
- Target user personas

We understand that this opinion will be based on the information provided and may require updating if our service offering changes.

Please provide a fee estimate for this opinion, and we would appreciate a response within 10 business days if possible.

Thank you for your assistance.

Yours sincerely,

[Founder Name]
${legalOpinionData.companyName}

---
ATTACHMENTS:
1. Service description document
2. Sample tool outputs
3. Terms of service
4. Privacy policy`;

    setGeneratedOpinionRequest(request);
    toast({ title: "Generated", description: "Legal opinion request letter created" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOpinionRequest);
    toast({ title: "Copied", description: "Letter copied to clipboard" });
  };

  const downloadRequest = () => {
    const blob = new Blob([generatedOpinionRequest], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oisc-legal-opinion-request.txt";
    a.click();
    toast({ title: "Downloaded", description: "Letter saved to your device" });
  };

  const complianceScore = calculateComplianceScore();
  const highRiskIssues = checks.filter(c => c.risk === "high" && 
    ((["1", "2", "3", "4"].includes(c.id) && c.answer) || 
     (["5", "6", "7", "8"].includes(c.id) && !c.answer))
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">OISC Compliance Guide</h1>
        <p className="text-muted-foreground">
          Ensure your visa-related business stays within legal boundaries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className={complianceScore >= 80 ? "border-green-500" : complianceScore >= 50 ? "border-yellow-500" : "border-red-500"} data-testid="card-compliance-score">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Compliance Score</span>
              <Badge variant={complianceScore >= 80 ? "default" : complianceScore >= 50 ? "secondary" : "destructive"} data-testid="badge-compliance-status">
                {complianceScore >= 80 ? "Good" : complianceScore >= 50 ? "At Risk" : "Critical"}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-2" data-testid="text-compliance-score">{complianceScore}%</div>
            <Progress value={complianceScore} className="h-2" data-testid="progress-compliance-score" />
          </CardContent>
        </Card>

        <Card data-testid="card-high-risk-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">High Risk Issues</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-high-risk-count">{highRiskIssues.length}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>

        <Card data-testid="card-compliant-count">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Compliant Areas</span>
            </div>
            <div className="text-2xl font-bold" data-testid="text-compliant-count">{checks.length - highRiskIssues.length}</div>
            <p className="text-xs text-muted-foreground">of {checks.length} checks</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Critical: Immigration Advice Regulation</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Under the Immigration and Asylum Act 1999, providing immigration advice without OISC registration is a criminal offence. 
                Endorsers will specifically check whether your visa-related business crosses into regulated activity. 
                A legal opinion letter demonstrating compliance awareness significantly strengthens your application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Self-Assessment
          </CardTitle>
          <CardDescription>
            Answer honestly to identify potential regulatory risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checks.map((check) => (
            <Card key={check.id} className={`p-4 ${
              check.risk === "high" ? "border-l-4 border-l-red-500" :
              check.risk === "medium" ? "border-l-4 border-l-yellow-500" :
              "border-l-4 border-l-green-500"
            }`}>
              <div className="flex items-start gap-4">
                <Checkbox 
                  id={check.id}
                  checked={check.answer}
                  onCheckedChange={() => toggleCheck(check.id)}
                  data-testid={`checkbox-oisc-${check.id}`}
                />
                <div className="flex-1">
                  <label htmlFor={check.id} className="font-medium cursor-pointer">
                    {check.question}
                  </label>
                  <Badge 
                    variant={check.risk === "high" ? "destructive" : check.risk === "medium" ? "secondary" : "outline"}
                    className="ml-2"
                  >
                    {check.risk} risk
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Why it matters:</strong> {check.explanation}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Recommendation:</strong> {check.recommendation}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Opinion Request Generator
          </CardTitle>
          <CardDescription>
            Generate a professional request for a legal opinion on OISC compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Your Company Name *</Label>
              <Input 
                value={legalOpinionData.companyName}
                onChange={(e) => setLegalOpinionData({...legalOpinionData, companyName: e.target.value})}
                placeholder="InnovateTech Ltd"
                data-testid="input-company-name"
              />
            </div>
            <div>
              <Label>Law Firm Name</Label>
              <Input 
                value={legalOpinionData.lawFirm}
                onChange={(e) => setLegalOpinionData({...legalOpinionData, lawFirm: e.target.value})}
                placeholder="Smith & Partners Immigration"
                data-testid="input-law-firm"
              />
            </div>
            <div>
              <Label>Lawyer Name</Label>
              <Input 
                value={legalOpinionData.lawyerName}
                onChange={(e) => setLegalOpinionData({...legalOpinionData, lawyerName: e.target.value})}
                placeholder="Ms. Jane Smith"
                data-testid="input-lawyer-name"
              />
            </div>
            <div>
              <Label>Target Users</Label>
              <Input 
                value={legalOpinionData.targetUsers}
                onChange={(e) => setLegalOpinionData({...legalOpinionData, targetUsers: e.target.value})}
                placeholder="Entrepreneurs, startup founders"
                data-testid="input-target-users"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Service Description *</Label>
              <Textarea 
                value={legalOpinionData.serviceDescription}
                onChange={(e) => setLegalOpinionData({...legalOpinionData, serviceDescription: e.target.value})}
                placeholder="Describe your service in detail. What exactly does your platform do? What tools do you offer? How do users interact with visa-related content?"
                rows={5}
                data-testid="textarea-service-description"
              />
            </div>
          </div>

          <Button onClick={generateLegalOpinionRequest} className="w-full" data-testid="button-generate-opinion">
            <FileText className="h-4 w-4 mr-2" />
            Generate Legal Opinion Request
          </Button>

          {generatedOpinionRequest && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Request Letter</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="button-copy-opinion">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadRequest} data-testid="button-download-opinion">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[400px]" data-testid="text-generated-opinion">
                {generatedOpinionRequest}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Safe Harbour Phrases
          </CardTitle>
          <CardDescription>
            Use these pre-approved phrases to stay within legal boundaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Use These (Safe)</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <li>• "This tool provides general information only and does not constitute immigration advice."</li>
                <li>• "Based on publicly available Home Office guidance..."</li>
                <li>• "Applicants typically need to demonstrate..."</li>
                <li>• "For personalised advice, please consult an OISC-registered adviser."</li>
                <li>• "The eligibility requirements published by the Home Office include..."</li>
                <li>• "This assessment is for informational purposes only."</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Avoid These (Risky)</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <li>• "You should apply for the Innovator Founder visa."</li>
                <li>• "You are eligible for this visa route."</li>
                <li>• "We recommend you submit..."</li>
                <li>• "Your application will be successful if..."</li>
                <li>• "The best route for you is..."</li>
                <li>• "Your chances of approval are X%."</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            OISC-Registered Partners
          </CardTitle>
          <CardDescription>
            Consider partnering with these regulated advisers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Search the OISC register to find regulated immigration advisers in your area:
            </p>
            <a 
              href="https://home.oisc.gov.uk/adviser_finder/finder.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
              data-testid="link-oisc-finder"
            >
              <ExternalLink className="h-4 w-4" />
              OISC Adviser Finder
            </a>
            <p className="text-sm text-muted-foreground mt-4">
              When partnering with an OISC adviser:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Verify their registration level (Level 1, 2, or 3)</li>
              <li>Confirm they cover the visa category relevant to your users</li>
              <li>Establish a formal referral agreement</li>
              <li>Display their OISC registration number on your platform</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
