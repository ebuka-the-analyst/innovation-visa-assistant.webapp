import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const steps = [
  {
    id: 1,
    title: "Business Overview & Innovation Stage",
    description: "Critical: Assessors check your actual development stage",
    fields: [
      { name: "businessName", label: "Business Name", type: "text", required: true },
      { name: "industry", label: "Industry", type: "text", required: true },
      { name: "problem", label: "What problem does your business solve?", type: "textarea", required: true, minLength: 50 },
      { name: "innovationStage", label: "Current Innovation Stage", type: "select", required: true, options: [
        { value: "concept", label: "Concept Stage (idea only)" },
        { value: "pre-mvp", label: "Pre-MVP (building product)" },
        { value: "mvp-complete", label: "MVP Complete (testing with users)" },
        { value: "market-validation", label: "Market Validation (have paying customers)" },
      ]},
      { name: "productStatus", label: "Detailed Product Development Status", type: "textarea", required: true, minLength: 100, help: "Be specific: What have you built? Screenshots? Demo link? Code repository?" },
      { name: "existingCustomers", label: "Existing Customers or Beta Testers (optional)", type: "textarea", required: false, help: "Names, testimonials, or letters of support massively strengthen your application" },
      { name: "tractionEvidence", label: "Traction Evidence (optional)", type: "textarea", required: false, help: "Usage metrics, pilot results, revenue to date, user feedback" },
    ],
  },
  {
    id: 2,
    title: "Innovation & Technical Architecture",
    description: "Endorsers have technical assessors who need specifics, not buzzwords",
    fields: [
      { name: "uniqueness", label: "What makes your solution different? (Be specific with measurable claims)", type: "textarea", required: true, minLength: 100 },
      { name: "techStack", label: "Exact Technology Stack", type: "textarea", required: true, minLength: 50, help: "List specific tools: React, Python, PostgreSQL, AWS Lambda, etc. Vague = red flag" },
      { name: "dataArchitecture", label: "Data Architecture & Integration Approach", type: "textarea", required: true, minLength: 100, help: "How do you integrate systems? HL7/FHIR APIs? Data pipelines? Be technical." },
      { name: "aiMethodology", label: "AI/ML Methodology (if applicable)", type: "textarea", required: true, minLength: 100, help: "Specific algorithms (GPT-4, Random Forest, etc.), training data, validation metrics, baseline improvements. 'AI-assisted' is not enough." },
      { name: "complianceDesign", label: "Compliance by Design", type: "textarea", required: true, minLength: 100, help: "For healthcare: DCB0129, DCB0160, GDPR Article 25. For other sectors: relevant standards" },
      { name: "patentStatus", label: "Intellectual Property Status", type: "textarea", required: true, minLength: 20, help: "Patent filed (GB reference number)? Pending? None? Defensive publication?" },
    ],
  },
  {
    id: 3,
    title: "Founder Credentials & Experience",
    description: "Critical gap in previous applications: prove you can execute",
    fields: [
      { name: "founderEducation", label: "Education & Certifications", type: "textarea", required: true, minLength: 50, help: "MSc Data Science (Leeds Beckett), BSc IT, AWS certifications, etc." },
      { name: "founderWorkHistory", label: "Relevant Work History", type: "textarea", required: true, minLength: 100, help: "Data Analyst at Qalhata Solutions, NHS procurement projects, specific roles and companies" },
      { name: "founderAchievements", label: "Measurable Achievements", type: "textarea", required: true, minLength: 100, help: "Projects delivered, revenue generated, users reached, publications, awards. Be specific." },
      { name: "relevantProjects", label: "Projects Directly Relevant to This Business", type: "textarea", required: true, minLength: 100, help: "NHS Procurement Intelligence, CARE-AI pediatric platform, BhenMedia work. Show domain expertise." },
    ],
  },
  {
    id: 4,
    title: "Financial Model & Unit Economics",
    description: "Your previous £15K for healthcare venture flagged as insufficient",
    fields: [
      { name: "funding", label: "Initial Capital Available (£)", type: "number", required: true },
      { name: "fundingSources", label: "Detailed Funding Sources", type: "textarea", required: true, minLength: 100, help: "£50K personal savings, £30K family loan, £20K Innovate UK grant (ref: XXXXX). Be specific with amounts." },
      { name: "monthlyProjections", label: "36-Month Monthly Cashflow", type: "textarea", required: true, minLength: 200, help: "Month-by-month revenue and costs for 3 years. Year 1 totals not enough. Include: Month 1: £0 revenue, £5K costs. Month 2: £2K revenue, £6K costs..." },
      { name: "customerAcquisitionCost", label: "Customer Acquisition Cost (CAC) in £", type: "number", required: true },
      { name: "lifetimeValue", label: "Customer Lifetime Value (LTV) in £", type: "number", required: true },
      { name: "paybackPeriod", label: "Customer Payback Period (months)", type: "number", required: true, help: "How many months to recover CAC? Must be <12 months ideally" },
      { name: "detailedCosts", label: "Detailed Cost Breakdown", type: "textarea", required: true, minLength: 150, help: "Development: £40K, DCB0129: £20K, DCB0160: £30K, Marketing: £15K, Operations: £10K, etc. Healthcare requires regulatory costs!" },
    ],
  },
  {
    id: 5,
    title: "Competitive Analysis",
    description: "Generic claims rejected. Name 5+ real competitors.",
    fields: [
      { name: "competitors", label: "List 5+ Named Competitors", type: "textarea", required: true, minLength: 150, help: "DrDoctor, Patchs, Lantum, Numan, Babylon Health, etc. For each: their strengths, weaknesses, pricing, target market" },
      { name: "competitiveDifferentiation", label: "Your Measurable Competitive Advantage", type: "textarea", required: true, minLength: 150, help: "'73% faster than Competitor X (validated with n=1,200), 90% less training data required, £5K vs £50K annual cost.' Specific metrics, not buzzwords." },
    ],
  },
  {
    id: 6,
    title: "Market Validation & Customer Evidence",
    description: "80% rejection reason: No customer validation. This is critical.",
    fields: [
      { name: "customerInterviews", label: "Customer Discovery Interviews (20-30 minimum)", type: "textarea", required: true, minLength: 150, help: "Summarize findings: Who did you interview? What did you learn? What pain points validated? What are they willing to pay?" },
      { name: "lettersOfIntent", label: "Letters of Intent or Pilot Agreements (if any)", type: "textarea", required: false, help: "Even non-paying pilots count. '3 NHS Trusts signed LOIs (see Appendix) representing £180K potential Year 1 revenue'" },
      { name: "willingnessToPay", label: "Willingness to Pay Evidence", type: "textarea", required: true, minLength: 100, help: "Survey data, pilot pricing tests, LOI values. Show customers will actually pay." },
      { name: "marketSize", label: "Market Size Calculation (TAM/SAM/SOM)", type: "textarea", required: true, minLength: 100, help: "TAM: All UK healthcare providers. SAM: Small clinics 5-50 staff (~1,500 clinics). SOM: 0.5-2% in Year 1 (8-30 clinics). Be specific." },
    ],
  },
  {
    id: 7,
    title: "Regulatory & Compliance Planning",
    description: "Critical for healthcare: missing this = instant rejection",
    fields: [
      { name: "regulatoryRequirements", label: "All Regulatory Requirements", type: "textarea", required: true, minLength: 150, help: "Healthcare: DCB0129 (£10-30K), DCB0160 (£15-40K), Cyber Essentials Plus (£5K), ISO 27001 (£20-50K). Other sectors: list relevant standards." },
      { name: "complianceTimeline", label: "Compliance Timeline", type: "textarea", required: true, minLength: 100, help: "Month 1-3: DCB0129. Month 4-9: DCB0160. Month 10-12: ISO 27001. Be realistic." },
      { name: "complianceBudget", label: "Total Compliance Budget (£)", type: "number", required: true, help: "For healthcare minimum £50-120K. Don't underestimate." },
    ],
  },
  {
    id: 8,
    title: "Scalability & Growth Strategy",
    description: "Vague expansion plans flagged. Name specific regions.",
    fields: [
      { name: "jobCreation", label: "Job Creation Target (3 years)", type: "number", required: true },
      { name: "hiringPlan", label: "Detailed Hiring Plan", type: "textarea", required: true, minLength: 150, help: "Year 1: CTO (£60K), Clinical Safety Officer (£55K). Year 2: 2x Sales (£40K each), Customer Success (£35K). Year 3: etc. Specific roles, salaries, milestones." },
      { name: "specificRegions", label: "Specific Geographic Targets", type: "textarea", required: true, minLength: 50, help: "'Greater London, Greater Manchester, West Midlands' not 'key UK regions'. Be specific." },
      { name: "expansion", label: "Market Expansion Strategy", type: "textarea", required: true, minLength: 100 },
      { name: "internationalPlan", label: "International Expansion (optional)", type: "textarea", required: false, help: "Only include if you're market-validated in UK first. Otherwise this suggests poor strategic thinking." },
      { name: "vision", label: "5-Year Vision", type: "textarea", required: true, minLength: 100 },
    ],
  },
  {
    id: 9,
    title: "Endorser Strategy",
    description: "You must show you've researched endorsing bodies",
    fields: [
      { name: "targetEndorser", label: "Target Endorsing Body", type: "textarea", required: true, minLength: 30, help: "Tech Nation, Global Entrepreneurs Programme, Innovator International, or specific university. Show you've researched their requirements." },
      { name: "contactPointsStrategy", label: "6 Contact Points Strategy", type: "textarea", required: true, minLength: 100, help: "Innovation Visa requires 6 contact points over 3 years. How will you achieve this? Quarterly reports, milestone reviews, annual strategy sessions?" },
    ],
  },
  {
    id: 10,
    title: "Viability & Revenue Model",
    description: "Final check: can you actually execute and make money?",
    fields: [
      { name: "experience", label: "Your Relevant Skills & Experience Summary", type: "textarea", required: true, minLength: 100 },
      { name: "revenue", label: "Detailed Revenue Model", type: "textarea", required: true, minLength: 150, help: "Monthly subscription per clinic: £X. Tiered pricing: Solo (£200/mo), Small (£500/mo), Multi-site (£1,200/mo). One-off onboarding: £Y. Premium modules: £Z. Be specific with pricing." },
    ],
  },
];

export default function QuestionnaireForm({ tier = 'premium' }: { tier?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({ tier });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const validateCurrentStep = (): boolean => {
    const requiredFields = currentStepData.fields.filter(f => f.required);
    
    for (const field of requiredFields) {
      const value = formData[field.name];
      
      if (!value || value.trim() === '') {
        toast({
          title: "Required Field Missing",
          description: `Please fill in: ${field.label}`,
          variant: "destructive",
        });
        return false;
      }
      
      const minLength = field.minLength || (field.type === 'textarea' ? 10 : 1);
      if ((field.type === 'textarea' || field.type === 'text') && value.trim().length < minLength) {
        toast({
          title: "More Detail Needed",
          description: `${field.label} needs at least ${minLength} characters (currently ${value.trim().length}). Endorsers reject vague responses.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (field.type === 'number') {
        const num = parseInt(value);
        if (isNaN(num) || num < 0) {
          toast({
            title: "Invalid Number",
            description: `${field.label} must be a valid number`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    return true;
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      if (!validateCurrentStep()) return;
      
      setIsSubmitting(true);
      try {
        const data = {
          tier: formData.tier || 'premium',
          businessName: formData.businessName,
          industry: formData.industry,
          problem: formData.problem,
          uniqueness: formData.uniqueness,
          technology: formData.techStack + "\n\n" + formData.dataArchitecture,
          experience: formData.experience,
          funding: parseInt(formData.funding) || 0,
          revenue: formData.revenue,
          jobCreation: parseInt(formData.jobCreation) || 1,
          expansion: formData.expansion,
          vision: formData.vision,
          
          innovationStage: formData.innovationStage,
          productStatus: formData.productStatus,
          existingCustomers: formData.existingCustomers || '',
          betaTesters: formData.betaTesters || '',
          tractionEvidence: formData.tractionEvidence || '',
          
          techStack: formData.techStack,
          dataArchitecture: formData.dataArchitecture,
          aiMethodology: formData.aiMethodology,
          complianceDesign: formData.complianceDesign,
          patentStatus: formData.patentStatus,
          
          founderEducation: formData.founderEducation,
          founderWorkHistory: formData.founderWorkHistory,
          founderAchievements: formData.founderAchievements,
          relevantProjects: formData.relevantProjects,
          
          monthlyProjections: formData.monthlyProjections,
          customerAcquisitionCost: parseInt(formData.customerAcquisitionCost) || 0,
          lifetimeValue: parseInt(formData.lifetimeValue) || 0,
          paybackPeriod: parseInt(formData.paybackPeriod) || 1,
          fundingSources: formData.fundingSources,
          detailedCosts: formData.detailedCosts,
          
          competitors: formData.competitors,
          competitiveDifferentiation: formData.competitiveDifferentiation,
          
          customerInterviews: formData.customerInterviews,
          lettersOfIntent: formData.lettersOfIntent || '',
          willingnessToPay: formData.willingnessToPay,
          marketSize: formData.marketSize,
          
          regulatoryRequirements: formData.regulatoryRequirements,
          complianceTimeline: formData.complianceTimeline,
          complianceBudget: parseInt(formData.complianceBudget) || 0,
          
          hiringPlan: formData.hiringPlan,
          specificRegions: formData.specificRegions,
          internationalPlan: formData.internationalPlan || '',
          
          targetEndorser: formData.targetEndorser,
          contactPointsStrategy: formData.contactPointsStrategy,
          
          supportingEvidence: formData.supportingEvidence || '',
        };

        console.log('Submitting enhanced questionnaire:', data);
        const response = await apiRequest('POST', '/api/questionnaire/submit', data);
        const responseData = await response.json();

        if (responseData.planId) {
          const checkoutResponse = await apiRequest('POST', '/api/payment/create-checkout', { planId: responseData.planId });
          const checkoutData = await checkoutResponse.json();

          if (checkoutData.url) {
            window.location.href = checkoutData.url;
          } else {
            throw new Error("Checkout URL not received");
          }
        } else {
          throw new Error("Plan ID not received");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Submission Error",
          description: error instanceof Error ? error.message : "Failed to submit. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Evidence Checklist Alert */}
        {currentStep === 0 && (
          <Card className="p-6 mb-8 border-amber-500/50 bg-amber-500/5">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Before You Begin: Gather Evidence</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Expert assessors reject 95% of template applications. You need real evidence:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Customer interview summaries (20-30 conversations minimum)</li>
                  <li>✓ Technical specifications (specific tools, not buzzwords)</li>
                  <li>✓ Founder CV with measurable achievements</li>
                  <li>✓ 36-month monthly cashflow projections</li>
                  <li>✓ Named competitors with feature comparison</li>
                  <li>✓ Regulatory requirements research (costs & timeline)</li>
                  <li>✓ Letters of Intent from potential customers (if any)</li>
                </ul>
                <p className="text-sm font-semibold mt-3 text-amber-600">
                  This questionnaire takes 45-60 minutes. Save your answers in a document first.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Progress header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-sm text-muted-foreground text-right">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Form card */}
        <Card className="p-8 md:p-12">
          <div className="mb-6">
            <div className="text-sm font-semibold text-primary mb-2">Section {currentStep + 1} of {steps.length}</div>
            <h2 className="font-serif text-3xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-sm text-amber-600 font-medium">
              {currentStepData.description}
            </p>
          </div>

          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-base">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.help && (
                  <p className="text-xs text-muted-foreground italic">{field.help}</p>
                )}
                {field.type === "select" ? (
                  <Select value={formData[field.name] || ""} onValueChange={(value) => handleChange(field.name, value)}>
                    <SelectTrigger data-testid={`select-${field.name}`}>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={`Enter detailed response...`}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="min-h-[150px]"
                    data-testid={`input-${field.name}`}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    data-testid={`input-${field.name}`}
                  />
                )}
                {formData[field.name] && (field.type === "textarea" || field.type === "text") && (
                  <p className="text-xs text-muted-foreground">
                    {formData[field.name].length} characters
                    {field.minLength && formData[field.name].length < field.minLength && (
                      <span className="text-amber-600 ml-2">
                        (need {field.minLength - formData[field.name].length} more for minimum)
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting}
              data-testid="button-next"
            >
              {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? "Proceed to Payment" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
