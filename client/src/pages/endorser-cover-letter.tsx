import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Copy, Download, Lightbulb, CheckCircle2, 
  Building2, User, Briefcase, Target, Zap, TrendingUp,
  Award, Users, Globe, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoverLetterData {
  applicantName: string;
  businessName: string;
  endorsingBody: string;
  endorserContact?: string;
  businessSector: string;
  innovationSummary: string;
  marketOpportunity: string;
  scalabilityPlan: string;
  viabilityEvidence: string;
  founderBackground: string;
  tractionHighlights: string;
  ukBenefit: string;
  advisoryBoard?: string;
  closingStatement: string;
}

export default function EndorserCoverLetter() {
  const { toast } = useToast();
  
  const [data, setData] = useState<CoverLetterData>({
    applicantName: "",
    businessName: "",
    endorsingBody: "Envestors",
    endorserContact: "",
    businessSector: "",
    innovationSummary: "",
    marketOpportunity: "",
    scalabilityPlan: "",
    viabilityEvidence: "",
    founderBackground: "",
    tractionHighlights: "",
    ukBenefit: "",
    advisoryBoard: "",
    closingStatement: "I am fully committed to building this innovative venture in the UK and contributing to the nation's technology ecosystem."
  });

  const [generatedLetter, setGeneratedLetter] = useState("");

  const endorsingBodies = [
    { id: "envestors", name: "Envestors", focus: "Investment-ready startups with scalable models" },
    { id: "ukes", name: "UK Endorsing Services (UKES)", focus: "Multi-sector innovative businesses" },
    { id: "innovator-international", name: "Innovator International", focus: "Global entrepreneurs and tech businesses" },
    { id: "gep", name: "Global Entrepreneurs Programme", focus: "High-potential international founders" },
  ];

  const generateCoverLetter = () => {
    if (!data.applicantName || !data.businessName || !data.innovationSummary) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in required fields (name, business, innovation)", 
        variant: "destructive" 
      });
      return;
    }

    const today = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });

    const letter = `${data.endorserContact || data.endorsingBody}
Innovator Founder Visa Endorsement Team
${today}

Dear ${data.endorserContact ? data.endorserContact : "Endorsement Panel"},

RE: Application for Innovator Founder Visa Endorsement - ${data.businessName}

I am writing to formally apply for endorsement under the UK Innovator Founder Visa route. I am the founder of ${data.businessName}, an innovative ${data.businessSector} venture that I believe meets the criteria for genuine innovation, scalability, and viability.

INNOVATION

${data.innovationSummary}

${data.businessName} represents a significant departure from existing solutions in the market. Our approach is innovative because it ${data.innovationSummary.toLowerCase().includes('first') ? 'introduces an entirely new methodology' : 'fundamentally improves upon existing approaches'} in ways that have not been achieved before.

SCALABILITY

${data.scalabilityPlan}

${data.marketOpportunity ? `MARKET OPPORTUNITY

${data.marketOpportunity}` : ''}

VIABILITY

${data.viabilityEvidence}

${data.tractionHighlights ? `TRACTION & VALIDATION

${data.tractionHighlights}` : ''}

FOUNDER BACKGROUND

${data.founderBackground}

${data.advisoryBoard ? `ADVISORY SUPPORT

${data.advisoryBoard}` : ''}

UK BENEFIT

${data.ukBenefit || `${data.businessName} will create highly skilled jobs in the UK technology sector, contribute to the UK's position as a global innovation hub, and generate tax revenue for the British economy. Our headquarters will be based in the UK, with all key decision-making and intellectual property development occurring here.`}

CONCLUSION

${data.closingStatement}

I have attached supporting documentation including my business plan, financial projections, evidence of traction, and founder credentials. I am available for interview at your earliest convenience and would welcome the opportunity to discuss my application further.

Thank you for considering my application.

Yours ${data.endorserContact ? 'sincerely' : 'faithfully'},

${data.applicantName}
Founder, ${data.businessName}

Attachments:
- Business Plan
- Financial Projections (3-5 year)
- Evidence of Traction
- Founder CV/Portfolio
- Market Research Documentation
- Letters of Interest/Support`;

    setGeneratedLetter(letter);
    toast({ title: "Letter Generated", description: "Your cover letter is ready for review" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({ title: "Copied", description: "Letter copied to clipboard" });
  };

  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `endorser-cover-letter-${data.businessName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    toast({ title: "Downloaded", description: "Letter saved to your device" });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Endorser Cover Letter Generator</h1>
        <p className="text-muted-foreground">
          Create a professional, endorser-ready cover letter that addresses all I-V-S criteria
        </p>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">What Endorsers Look For</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-600 mt-1" />
                  <div>
                    <span className="font-medium text-amber-800 dark:text-amber-200">Innovation</span>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Novel approach, unique tech, market differentiation</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600 mt-1" />
                  <div>
                    <span className="font-medium text-amber-800 dark:text-amber-200">Scalability</span>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Growth potential, market size, expansion plans</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-amber-600 mt-1" />
                  <div>
                    <span className="font-medium text-amber-800 dark:text-amber-200">Viability</span>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Revenue model, funding, founder capability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant & Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Your Full Name *</Label>
                <Input 
                  value={data.applicantName} 
                  onChange={(e) => setData({...data, applicantName: e.target.value})}
                  placeholder="Dr. Jane Smith"
                  data-testid="input-applicant-name"
                />
              </div>
              <div>
                <Label>Business Name *</Label>
                <Input 
                  value={data.businessName} 
                  onChange={(e) => setData({...data, businessName: e.target.value})}
                  placeholder="InnovateTech Ltd"
                />
              </div>
              <div>
                <Label>Endorsing Body</Label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={data.endorsingBody}
                  onChange={(e) => setData({...data, endorsingBody: e.target.value})}
                  data-testid="select-endorsing-body"
                >
                  {endorsingBodies.map((body) => (
                    <option key={body.id} value={body.name}>{body.name} - {body.focus}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Business Sector</Label>
                <Input 
                  value={data.businessSector} 
                  onChange={(e) => setData({...data, businessSector: e.target.value})}
                  placeholder="AI/SaaS, FinTech, HealthTech..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Innovation (Most Important)
            </CardTitle>
            <CardDescription>
              Explain what makes your business genuinely innovative - not just an improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={data.innovationSummary} 
              onChange={(e) => setData({...data, innovationSummary: e.target.value})}
              placeholder="Our platform is the first to use proprietary AI algorithms to... Unlike existing solutions that rely on... we have developed a novel approach that..."
              rows={5}
              data-testid="textarea-innovation"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Tips:</strong> Use words like "first", "novel", "proprietary", "breakthrough". Explain why no one else has done this.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Scalability & Market
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Scalability Plan</Label>
              <Textarea 
                value={data.scalabilityPlan} 
                onChange={(e) => setData({...data, scalabilityPlan: e.target.value})}
                placeholder="Our SaaS model enables rapid scaling without proportional cost increases. We plan to expand from UK to EU markets in Year 2, with API partnerships enabling..."
                rows={4}
              />
            </div>
            <div>
              <Label>Market Opportunity</Label>
              <Textarea 
                value={data.marketOpportunity} 
                onChange={(e) => setData({...data, marketOpportunity: e.target.value})}
                placeholder="The UK market for [sector] is valued at £X billion (Source: [Report]). Our TAM is £X million with a realistic SAM of £X million over 5 years..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Viability & Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Viability Evidence</Label>
              <Textarea 
                value={data.viabilityEvidence} 
                onChange={(e) => setData({...data, viabilityEvidence: e.target.value})}
                placeholder="We have secured seed funding of £X from [investors]. Our financial projections show break-even by Month X with revenues of £X by Year 3. We have X paying customers and £X in ARR..."
                rows={4}
              />
            </div>
            <div>
              <Label>Traction Highlights</Label>
              <Textarea 
                value={data.tractionHighlights} 
                onChange={(e) => setData({...data, tractionHighlights: e.target.value})}
                placeholder="We have achieved: X waitlist signups, X letters of interest from [companies], pilot agreement with [company], partnership with [partner], survey validation from X respondents..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Founder & Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Founder Background</Label>
              <Textarea 
                value={data.founderBackground} 
                onChange={(e) => setData({...data, founderBackground: e.target.value})}
                placeholder="I bring X years of experience in [industry], having previously [achievement]. I hold a [degree] from [university] and have technical expertise in [skills]. My past projects include [relevant work]..."
                rows={4}
              />
            </div>
            <div>
              <Label>Advisory Board (Optional)</Label>
              <Textarea 
                value={data.advisoryBoard} 
                onChange={(e) => setData({...data, advisoryBoard: e.target.value})}
                placeholder="I have assembled an advisory board including: [Name], [Title] at [Company] (technology advisor); [Name], former [role] (industry advisor); [Name], immigration specialist (compliance advisor)..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              UK Benefit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={data.ukBenefit} 
              onChange={(e) => setData({...data, ukBenefit: e.target.value})}
              placeholder="Leave blank for default, or customize: Our venture will create X high-skilled jobs, generate £X in tax revenue, establish the UK as a leader in [sector], and contribute to the government's digital economy strategy..."
              rows={3}
            />
          </CardContent>
        </Card>

        <Button onClick={generateCoverLetter} className="w-full" size="lg" data-testid="button-generate-letter">
          <FileText className="h-4 w-4 mr-2" />
          Generate Cover Letter
        </Button>

        {generatedLetter && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Your Cover Letter
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadLetter}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                {generatedLetter}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
