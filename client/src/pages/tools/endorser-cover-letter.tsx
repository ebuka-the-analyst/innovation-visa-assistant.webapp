import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, Copy, RefreshCw } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

export default function EndorserCoverLetter() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [savedDate, setSavedDate] = useState('');

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
    attachmentsList: ''
  });

  const getSerializedState = () => ({
    formData, savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.formData) setFormData(state.formData);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('endorser-cover-letter-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

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
    const fields = Object.values(formData);
    const filledFields = fields.filter(f => f.trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const generateCoverLetter = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return `${formData.endorsingBodyContact || '[Endorsing Body Contact]'}
${formData.endorsingBody || '[Endorsing Body Name]'}

${today}

Dear ${formData.endorsingBodyContact?.split(' ')[0] || 'Sir/Madam'},

RE: Innovator Founder Visa Endorsement Application - ${formData.businessName || '[Business Name]'}

I am writing to formally submit my application for endorsement under the UK Innovator Founder Visa route. I am the founder of ${formData.businessName || '[Business Name]'}, and I am seeking your endorsement to establish and grow my innovative business in the United Kingdom.

BUSINESS OVERVIEW
${formData.businessSummary || '[Please provide a brief summary of your business]'}

INNOVATION
${formData.innovationHighlights || '[Please describe what makes your business innovative]'}

Our business demonstrates genuine innovation through unique technology, novel approaches, and differentiated solutions that address real market needs in ways that existing solutions do not.

VIABILITY
${formData.viabilityEvidence || '[Please provide evidence of business viability]'}

We have conducted extensive market research and validation, demonstrating clear demand for our solution. Our financial projections show a path to sustainability, and we have secured appropriate funding to execute our business plan.

SCALABILITY
${formData.scalabilityPlan || '[Please describe your scalability plans]'}

Our business model is designed for significant growth, with clear plans for UK and international expansion. We project substantial job creation and economic contribution to the UK economy.

FOUNDER BACKGROUND
${formData.founderBackground || '[Please describe your relevant background and experience]'}

${formData.previousContact ? `PREVIOUS CONTACT
${formData.previousContact}` : ''}

I have enclosed the following documents with this application:
${formData.attachmentsList || `- Completed endorsement application form
- Business plan
- Financial projections (3-5 year forecast)
- Evidence of funding
- Market research and validation evidence
- CV/Resume
- Educational qualifications
- Proof of English language proficiency`}

I am committed to establishing a successful, innovative business in the UK that will create jobs, contribute to the economy, and demonstrate the value of international entrepreneurship. I would welcome the opportunity to discuss my application further and address any questions you may have.

Thank you for considering my application. I look forward to your response.

Yours sincerely,

${formData.founderName || '[Your Name]'}
Founder, ${formData.businessName || '[Business Name]'}`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateCoverLetter());
    toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
  };

  const getSmartTips = () => [
    "Keep your cover letter concise - aim for 1-2 pages maximum",
    "Address all three endorsement criteria: Innovation, Viability, and Scalability",
    "Use specific numbers and metrics where possible",
    "Tailor your letter to the specific endorsing body's focus areas",
    "Reference any previous communication or meetings with the endorsing body",
    "Proofread carefully - errors can undermine your professional credibility",
    "Include a clear list of all attached documents"
  ];

  const generateActionPlan = () => [
    { week: "Week 1", action: "Research your chosen endorsing body's specific requirements", priority: "Critical" },
    { week: "Week 1", action: "Draft initial cover letter with all key sections", priority: "High" },
    { week: "Week 2", action: "Refine innovation, viability, and scalability sections", priority: "Critical" },
    { week: "Week 2", action: "Have the letter reviewed by someone familiar with UK visa applications", priority: "High" },
    { week: "Week 3", action: "Final proofreading and formatting", priority: "Medium" },
    { week: "Week 3", action: "Prepare all attachments referenced in the letter", priority: "Critical" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Endorser Cover Letter',
      subtitle: formData.businessName || 'Business Application',
      filename: `endorser-cover-letter-${Date.now()}.docx`,
      sections: [
        { type: 'paragraph', content: generateCoverLetter() }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Endorser Cover Letter Generator
            </CardTitle>
            <CardDescription>
              Create professional IVS-ready cover letters for endorsement applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Completeness</span>
                <span className="text-sm font-bold text-primary">{calculateCompletenessScore()}%</span>
              </div>
              <Progress value={calculateCompletenessScore()} className="h-3" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Details</h3>
                <div>
                  <Label>Your Full Name</Label>
                  <Input
                    value={formData.founderName}
                    onChange={(e) => setFormData({...formData, founderName: e.target.value})}
                    placeholder="Enter your full name"
                    data-testid="input-founder-name"
                  />
                </div>
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Enter your business name"
                    data-testid="input-business-name"
                  />
                </div>
                <div>
                  <Label>Endorsing Body Name</Label>
                  <Input
                    value={formData.endorsingBody}
                    onChange={(e) => setFormData({...formData, endorsingBody: e.target.value})}
                    placeholder="e.g., Tech Nation, Entrepreneurship Panel"
                    data-testid="input-endorsing-body"
                  />
                </div>
                <div>
                  <Label>Endorsing Body Contact Person</Label>
                  <Input
                    value={formData.endorsingBodyContact}
                    onChange={(e) => setFormData({...formData, endorsingBodyContact: e.target.value})}
                    placeholder="e.g., The Endorsement Team"
                    data-testid="input-endorsing-contact"
                  />
                </div>
                <div>
                  <Label>Business Summary</Label>
                  <Textarea
                    value={formData.businessSummary}
                    onChange={(e) => setFormData({...formData, businessSummary: e.target.value})}
                    placeholder="Brief overview of your business and what it does..."
                    className="min-h-[100px]"
                    data-testid="input-business-summary"
                  />
                </div>
                <div>
                  <Label>Innovation Highlights</Label>
                  <Textarea
                    value={formData.innovationHighlights}
                    onChange={(e) => setFormData({...formData, innovationHighlights: e.target.value})}
                    placeholder="What makes your business genuinely innovative..."
                    className="min-h-[100px]"
                    data-testid="input-innovation-highlights"
                  />
                </div>
                <div>
                  <Label>Viability Evidence</Label>
                  <Textarea
                    value={formData.viabilityEvidence}
                    onChange={(e) => setFormData({...formData, viabilityEvidence: e.target.value})}
                    placeholder="Evidence that your business is viable (funding, revenue, customers)..."
                    className="min-h-[100px]"
                    data-testid="input-viability-evidence"
                  />
                </div>
                <div>
                  <Label>Scalability Plan</Label>
                  <Textarea
                    value={formData.scalabilityPlan}
                    onChange={(e) => setFormData({...formData, scalabilityPlan: e.target.value})}
                    placeholder="How will your business scale and grow..."
                    className="min-h-[100px]"
                    data-testid="input-scalability-plan"
                  />
                </div>
                <div>
                  <Label>Founder Background</Label>
                  <Textarea
                    value={formData.founderBackground}
                    onChange={(e) => setFormData({...formData, founderBackground: e.target.value})}
                    placeholder="Your relevant experience and qualifications..."
                    className="min-h-[100px]"
                    data-testid="input-founder-background"
                  />
                </div>
                <div>
                  <Label>Previous Contact (Optional)</Label>
                  <Textarea
                    value={formData.previousContact}
                    onChange={(e) => setFormData({...formData, previousContact: e.target.value})}
                    placeholder="Any previous communication with the endorsing body..."
                    data-testid="input-previous-contact"
                  />
                </div>
                <div>
                  <Label>List of Attachments</Label>
                  <Textarea
                    value={formData.attachmentsList}
                    onChange={(e) => setFormData({...formData, attachmentsList: e.target.value})}
                    placeholder="List documents you're attaching (one per line)..."
                    data-testid="input-attachments"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Generated Cover Letter</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} data-testid="button-copy">
                      <Copy className="h-4 w-4 mr-2" />Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setFormData({
                      founderName: '', businessName: '', endorsingBody: '', endorsingBodyContact: '',
                      businessSummary: '', innovationHighlights: '', viabilityEvidence: '',
                      scalabilityPlan: '', founderBackground: '', previousContact: '', attachmentsList: ''
                    })} data-testid="button-reset">
                      <RefreshCw className="h-4 w-4 mr-2" />Reset
                    </Button>
                  </div>
                </div>
                <Card className="p-4 bg-muted/50">
                  <pre className="whitespace-pre-wrap text-sm font-mono" data-testid="text-cover-letter">
                    {generateCoverLetter()}
                  </pre>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
