import { useState, useEffect } from "react";
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
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Tag, Check, X, Loader2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAutoSave } from "@/hooks/useAutoSave";

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
      { name: "contactPointsStrategy", label: "6 Contact Points Strategy", type: "textarea", required: true, minLength: 100, help: "Innovator Founder Visa requires 6 contact points over 3 years. How will you achieve this? Quarterly reports, milestone reviews, annual strategy sessions?" },
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

interface PromoCodeValidation {
  valid: boolean;
  discount?: number;
  message?: string;
  creatorId?: string;
}

const defaultFormData: Record<string, string> = {
  tier: 'premium',
  businessName: '',
  industry: '',
  problem: '',
  innovationStage: '',
  productStatus: '',
  existingCustomers: '',
  tractionEvidence: '',
  uniqueness: '',
  techStack: '',
  dataArchitecture: '',
  aiMethodology: '',
  complianceDesign: '',
  patentStatus: '',
  founderEducation: '',
  founderWorkHistory: '',
  founderAchievements: '',
  relevantProjects: '',
  funding: '',
  fundingSources: '',
  monthlyProjections: '',
  customerAcquisitionCost: '',
  lifetimeValue: '',
  paybackPeriod: '',
  detailedCosts: '',
  competitors: '',
  competitiveDifferentiation: '',
  customerInterviews: '',
  lettersOfIntent: '',
  willingnessToPay: '',
  marketSize: '',
  regulatoryRequirements: '',
  complianceTimeline: '',
  complianceBudget: '',
  jobCreation: '',
  hiringPlan: '',
  specificRegions: '',
  expansion: '',
  internationalPlan: '',
  vision: '',
  targetEndorser: '',
  contactPointsStrategy: '',
  experience: '',
  revenue: '',
};

export default function QuestionnaireForm({ tier = 'premium' }: { tier?: string }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const {
    savedData,
    saveField,
    saveAllFields,
    clearAllFields,
    hasUnsavedData,
  } = useAutoSave('questionnaire-form', { ...defaultFormData, tier });

  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('autosave_questionnaire-step');
    return savedStep ? parseInt(savedStep) : 0;
  });
  const [formData, setFormData] = useState<Record<string, string>>(() => savedData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  useEffect(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      setFormData(prev => ({ ...prev, ...savedData }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('autosave_questionnaire-step', currentStep.toString());
  }, [currentStep]);

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    saveField(name, value);
  };

  const handleClearSavedData = () => {
    clearAllFields();
    setFormData({ ...defaultFormData, tier });
    setCurrentStep(0);
    localStorage.removeItem('autosave_questionnaire-step');
    toast({
      title: "Form Cleared",
      description: "All saved data has been cleared. You can start fresh.",
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }
    
    setIsValidatingPromo(true);
    try {
      const response = await fetch(`/api/promos/validate/${encodeURIComponent(promoCode.trim())}`);
      const data = await response.json();
      setPromoValidation({
        valid: data.valid,
        discount: data.discountValue,
        message: data.message,
        creatorId: data.creatorId,
      });
      
      if (data.valid) {
        toast({
          title: 'Promo code applied!',
          description: `You'll receive ${data.discountValue}% off your purchase.`,
        });
      }
    } catch (error) {
      setPromoValidation({ valid: false, message: 'Failed to validate promo code' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

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
        
        const response = await fetch('/api/questionnaire/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
          console.error('Validation errors:', responseData.details);
          throw new Error(responseData.error || 'Validation failed');
        }

        if (responseData.planId) {
          const checkoutPayload: { planId: string; promoCode?: string } = { planId: responseData.planId };
          if (promoValidation?.valid && promoCode.trim()) {
            checkoutPayload.promoCode = promoCode.trim();
          }
          const checkoutResponse = await apiRequest('POST', '/api/payment/create-checkout', checkoutPayload);
          const checkoutData = await checkoutResponse.json();

          if (!checkoutResponse.ok) {
            // Handle promo code errors specifically
            if (checkoutData.promoError) {
              setPromoValidation({ valid: false, message: checkoutData.error });
              setPromoCode('');
              toast({
                title: "Promo Code Error",
                description: checkoutData.error,
                variant: "destructive",
              });
              setIsSubmitting(false);
              return;
            }
            throw new Error(checkoutData.error || "Checkout failed");
          }

          // Handle free tier - skip checkout and redirect directly
          if (checkoutData.skipCheckout && checkoutData.redirectUrl) {
            clearAllFields();
            localStorage.removeItem('autosave_questionnaire-step');
            window.location.href = checkoutData.redirectUrl;
          } else if (checkoutData.url) {
            clearAllFields();
            localStorage.removeItem('autosave_questionnaire-step');
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
    saveField(name, value);
  };

  const handleTestAutoFill = () => {
    const testData: Record<string, string> = {
      tier: tier,
      businessName: "FinFlow AI",
      industry: "FinTech / SaaS (AI-powered cash flow forecasting for UK SMEs)",
      problem: "Small and medium-sized businesses struggle with cash-potential shortfalls before they become critical.",
      innovationStage: "market-validation",
      productStatus: "MVP COMPLETE - Beta v1.2 deployed on AWS. 45 active beta users (100% retention over 4 months). Users accessing daily forecasts via web app (React/TypeScript frontend, Node.js/PostgreSQL backend). Open Banking integration (Plaid) connects 12 UK banks. AI forecasting engine (TensorFlow) achieves 94% accuracy (validated against 4-month holdout).",
      existingCustomers: "14 paying customers (£8,400 revenue collected). 3 signed Letters of Intent worth £182K potential Year 1 revenue from accounting firms.",
      tractionEvidence: "45 beta users, 100% retention, 94% forecast accuracy, £8,400 revenue.",
      uniqueness: "UNIQUE INNOVATIONS: (1) Industry-Specific ML Models: 23% better accuracy than generic forecasting (94% vs generic 73-78%). (2) 12-Minute Setup: Open Banking auto-sync vs competitors' 3-7 day manual data entry. (3) 18-Day Advance Warning: Patent-pending anomaly detection flags cash shortfalls 18 days earlier than competitors. (4) £60/month Price Point: 40-75% cheaper than Fluidly, Float, Futrli. (5) Partnership Distribution: Accounting firm white-label model (not available from competitors).",
      techStack: "Frontend: React 18, TypeScript, TailwindCSS, shadcn/ui. Backend: Node.js, Express, PostgreSQL (Neon serverless). AI/ML: TensorFlow 2.14, Python 3.11, Scikit-learn, Pandas. Cloud: AWS EC2, S3, RDS, Lambda. Integrations: Plaid (Open Banking), Stripe (payments), Xero/QuickBooks APIs. DevOps: GitHub Actions CI/CD, AWS CloudWatch, Sentry error tracking.",
      dataArchitecture: "Open Banking Integration via Plaid SDK. Multi-bank transaction sync every 24 hours. Data pipeline: Raw transactions → normalization → feature engineering → ML model → forecast output. PostgreSQL schemas: users, transactions, forecasts, alerts. Redis cache for ML predictions.",
      aiMethodology: "Time-series forecasting using TensorFlow LSTM (Long Short-Term Memory) neural networks. Training dataset: 2.8M anonymized SME transactions. Feature engineering: 47 input features (transaction patterns, seasonality, day-of-week effects, etc.). Validation: 80/20 train/test split, 4-month holdout validation achieving 94% accuracy (MAPE <6%). Baseline improvement: 29% better than industry standard (Fluidly 73%, Float 76%, Futrli 78%). Industry-specific models for retail (23% more accurate), professional services (18% more accurate), hospitality (21% more accurate).",
      complianceDesign: "FCA Financial Services Registration (in progress, Month 6). GDPR Article 25 (data protection by design) compliance via encryption-at-rest (AWS RDS), pseudonymization, data minimization. PCI DSS Level 2 (Stripe handles payments). Cyber Essentials Plus certification (Month 9, £3,000 budget). ISO 27001 roadmap (Month 18-24, £22,000 budget). Open Banking Directory registration (Month 3). SOC 2 Type II audit (Month 18, £28,000).",
      patentStatus: "UK Patent Application GB2401234.5 filed (November 2024): 'Method and system for industry-specific financial forecasting using adaptive machine learning models.' Claims cover: (1) Industry-specific feature engineering, (2) Adaptive model selection based on business type, (3) Anomaly detection with probabilistic alerting. Patent search conducted (£2,500 Marks & Clerk LLP). No prior art conflicts identified. PCT (international) filing planned Month 12 (£8,000 budget).",
      founderEducation: "MSc Data Science (Distinction) - University of Leeds (2020-2021). Dissertation: 'Predictive Analytics for SME Cash Flow Management' (87% grade). BSc Computer Science (First Class Honours) - University of Manchester (2016-2019). Final project: Inventory management SaaS (deployed to 5 retail clients). AWS Certified Solutions Architect - Professional (2023). AWS Certified Machine Learning - Specialty (2022). Certified ScrumMaster (CSM) - Scrum Alliance (2021). Part-qualified Financial Risk Manager (FRM Part I - GARP, 2024).",
      founderWorkHistory: "Data Analyst, FinTech Innovations Ltd (2021-2023, Manchester): Analyzed 450K+ business transactions for SME lending risk models. Built cash flow risk scoring achieving 86% default prediction accuracy. Worked directly with 100+ SME clients across retail, professional services, hospitality sectors. Data Scientist, Qalhata Solutions (2019-2021, Remote): Led 4-person team delivering ML models for healthcare, finance, retail. Built 23 production ML models serving 450K+ users. Led NHS Procurement Intelligence project (£8.2M annual value delivered). Freelance Data Science Consultant (2020-2021): 8 client projects, £45K revenue. Experience in customer acquisition, pricing, delivery.",
      founderAchievements: "NHS Transformation Award 2024 for data-driven procurement innovation. Published 2 peer-reviewed papers: IEEE Conference on Healthcare Data Science (2023), Healthcare Data Science Journal (2024). Delivered £8.2M measurable value in NHS procurement project. Built SaaS applications serving 450K+ users. 14 paying customers acquired for FinFlow (£8,400 revenue). 3 signed LOIs worth £182K. 23 production ML models deployed. Guest lecturer: University of Leeds Data Science MSc (2023, 2024).",
      relevantProjects: "SME Lending Risk Models (FinTech Innovations): Analyzed 450K business transactions, built cash flow-based default prediction (86% accuracy). Direct SME experience with 100+ clients. Inventory Management SaaS (Freelance, 2019): Built for 5 retail clients, £180/month MRR, 92% satisfaction. Full product lifecycle: ideation → paying customers → support. NHS Procurement Intelligence (Qalhata Solutions): £450M annual spend analytics, delivered £8.2M value. Experience with large-scale data, stakeholder management, project delivery.",
      funding: "125000",
      fundingSources: "£85,000 Personal Savings (accumulated 2019-2024 from employment). £30,000 Family Loan (signed agreement, 0% interest, 5-year repayment from Month 13). £10,000 Friends & Family Investment (convertible note, 20% discount on Series A). Total: £125,000.",
      monthlyProjections: "YEAR 1 MONTHLY: Month 1: £0 revenue, £8,500 costs. Month 2: £600 revenue (10 customers), £9,200 costs. Month 3: £1,800 (30 customers), £12,500. Month 4: £3,000 (50), £10,800. Month 5: £4,800 (80), £11,200. Month 6: £7,200 (120), £11,500. Month 7: £9,600 (160), £14,800. Month 8: £12,600 (210), £12,200. Month 9: £16,200 (270), £13,500. Month 10: £21,000 (350), £13,200. Month 11: £27,000 (450), £13,800. Month 12: £33,000 (550), £14,200. YEAR 1 TOTAL: £136,800 revenue, £145,400 costs. Year 1 Net: -£8,600 (profitable Month 8). YEAR 2: Grows to £1,067,400 revenue, £855,200 costs, £212,200 profit. YEAR 3: £2,857,000 revenue, £1,728,800 costs, £1,128,200 profit. 3-YEAR CUMULATIVE: £4,061,200 revenue, £2,729,400 costs, £1,331,800 profit.",
      customerAcquisitionCost: "180",
      lifetimeValue: "3524",
      paybackPeriod: "3",
      detailedCosts: "Development & Product (Year 1: £42,000): Founder salary £24K, Contractor developer £12K, AWS hosting £3.6K, Tools/software £2.4K. Regulatory & Compliance (Year 1: £16,000): FCA registration £8K, Cyber Essentials Plus £3K, Legal/incorporation £2K, Insurance £3K. Sales & Marketing (Year 1: £28,500): Content marketing £8K, Paid ads £12K, Events/networking £4.5K, Website £2K, Email tools £2K. Operations (Year 1: £8,900): Accounting £3K, Office/coworking £2.4K, Travel £2K, Misc £1.5K. Team (Year 1: £50,000, months 7-12): Sales & CS Manager £25K (6 months), Part-time Marketing £5K. TOTAL YEAR 1: £145,400. YEAR 2: £855,200 (team grows to 13). YEAR 3: £1,728,800 (team 26).",
      competitors: "1. FLUIDLY (£99/month, 8,000 customers): AI-powered, Xero integration, larger SMEs (£1M-£10M revenue). Strengths: Brand recognition, funding (£12M Series A). Weaknesses: Expensive, slow setup (3-5 days), generic ML models (76% accuracy vs our 94%). 2. FLOAT (£75/month, 12,000 customers): Scenario planning focus, QuickBooks/Xero. Strengths: Established (founded 2011), beautiful UI. Weaknesses: Manual data entry required, 73% forecast accuracy, limited automation. 3. FUTRLI (£60-£120/month): Accountant-focused, reporting heavy. Strengths: Strong accounting partnerships. Weaknesses: Complex UI, 78% accuracy, requires accountant setup. 4. PULSE (£29-£89/month): Budget-focused startups. Strengths: Low price. Weaknesses: Basic forecasting (no ML), manual spreadsheets. 5. DRYRUN (£49/month): US-focused, scenario modeling. Strengths: Collaborative features. Weaknesses: No UK Open Banking, manual sync. 6. CAUSAL (£50-£150/month): Spreadsheet replacement. Strengths: Flexible modeling. Weaknesses: Steep learning curve, not SME-focused. 7. BRIXX (£20-£70/month): UK small businesses. Strengths: Affordable, UK-focused. Weaknesses: No AI, manual forecasts, limited integrations.",
      competitiveDifferentiation: "MEASURABLE ADVANTAGES: (1) Forecast Accuracy: 94% vs Fluidly 76%, Float 73%, Futrli 78% (validated 4-month holdout, n=45 beta users). 29% better than best competitor. (2) Setup Speed: 12 minutes (Open Banking auto-sync) vs 3-7 days manual data entry (Float, Fluidly). Measured with 45 beta users. (3) Early Warning: 18-day advance shortfall alerts vs 7-10 days (competitors). Patent pending. (4) Price: £60/month vs Fluidly £99, Float £75, Futrli £60-£120. 40% cheaper than Fluidly. (5) Partnership Model: White-label for accounting firms (unique). 3 LOIs signed, competitors don't offer. (6) Industry-Specific Models: 23% better retail accuracy, 21% hospitality, 18% professional services. Competitors use generic models.",
      customerInterviews: "32 customer discovery interviews conducted (October-December 2024). 12 independent retailers, 8 professional services (consultants, lawyers), 7 hospitality (restaurants, pubs), 5 construction/trades. KEY FINDINGS: (1) Cash Flow Anxiety: 29/32 check bank balance daily, 24/32 'constantly worried' about unexpected shortfalls. (2) Existing Tools Inadequate: 18/32 use spreadsheets ('time-consuming, error-prone'), 8/32 use accounting software forecasts ('inaccurate'), 6/32 have no forecasting. (3) Willingness to Pay: £40-£80/month acceptable for 27/32. £100+ 'too expensive' for microbusinesses. (4) Critical Features: Advance warning (32/32 want), bank integration (28/32), scenario planning (21/32), mobile app (19/32). (5) Trust Barriers: Want data security guarantees, accounting software integration, proven accuracy before switching.",
      lettersOfIntent: "3 SIGNED LETTERS OF INTENT (Total £182K Year 1 potential): (1) Baker Thompson Accountants (Birmingham, 180 SME clients): LOI to pilot FinFlow with 20 clients (Month 3-6), potential £129,600 (20 clients × £60/month × 12 months × 90% conversion). Signed Nov 2024. (2) Henderson & Associates (Manchester, 120 clients): LOI for white-label partnership, 15-client pilot. Potential £32,400 first year. Signed Dec 2024. (3) Sterling Financial Services (London, 220 clients): LOI for evaluation, 10-client pilot Month 4. Potential £21,600. Signed Dec 2024. Combined 45-client pilots = validation pathway to 520-client total addressable base.",
      willingnessToPay: "Survey data (32 interviews): £40-£60/month: 19/32 (59%) acceptable. £60-£80/month: 8/32 (25%) acceptable. £80-£100/month: 3/32 (9%) acceptable. £100+: 2/32 (6%) acceptable (larger SMEs only). Median willingness: £65/month. FinFlow priced at £60/month = 84% within acceptable range. Validation: 14 beta users converted to paid (£60/month) = actual proof of willingness to pay. Conversion rate: 31% (14 paying / 45 beta). LOI pricing: 3 accounting firms willing to pay £60/month per client for white-label = institutional validation.",
      marketSize: "TAM (Total Addressable Market): 1.39M UK SMEs with £200K-£10M revenue. Annual spend potential: 1.39M × £720 (£60/month annual) = £1.0B. SAM (Serviceable Addressable Market): 186,000 SMEs in target sectors (retail, professional services, hospitality) with £200K-£10M revenue, 2-100 employees, using digital accounting (Xero/QuickBooks). Annual spend: 186K × £720 = £134M. SOM (Serviceable Obtainable Market, 3 years): Year 1: 660 customers (0.35% of SAM) = £475K revenue. Year 2: 2,215 customers (1.19% of SAM) = £1.59M revenue. Year 3: 4,757 customers (2.56% of SAM) = £3.42M revenue. 3-year cumulative: £4.1M (3% of SAM). Assumes: 10% market share of accounting firm partnerships (18,600 potential customers via partners), 1% direct customer acquisition (1,674 customers), blended to achieve 2.56% SOM penetration by Year 3.",
      regulatoryRequirements: "1. FCA REGISTRATION (£8,000, Months 1-6): Payment services regulation compliance. Application fee £1,500, legal support £4,500, compliance consulting £2,000. 2. CYBER ESSENTIALS PLUS (£3,000, Month 9): UK government-backed cybersecurity certification. Independent audit, penetration testing, remediation. 3. GDPR COMPLIANCE (£8,000, Months 1-12): Article 25 (data protection by design), DPO appointment (outsourced £3K/year), DPIA (data protection impact assessment £2K), privacy policy legal review £3K. 4. OPEN BANKING DIRECTORY (£2,000, Month 3): Registration with Open Banking Implementation Entity. Technical standards compliance, API certification. 5. ISO 27001 (£22,000, Months 18-24): Information security management. Gap analysis £4K, implementation £10K, certification audit £8K. 6. SOC 2 TYPE II (£28,000, Months 18-30): US-standard security audit for enterprise customers. Readiness £8K, audit £20K. 7. PCI DSS (£0 - Stripe handles): Payment card data security via Stripe compliance. 8. DATA PROTECTION REGISTRATION (£40/year): ICO registration. 9. PROFESSIONAL INDEMNITY INSURANCE (£3,000/year): £1M coverage for financial advice. 10. CYBER INSURANCE (£2,400/year): £500K coverage for data breaches. TOTAL 3-YEAR COMPLIANCE: £101,000.",
      complianceTimeline: "YEAR 1: Month 1-2: Company incorporation, ICO registration, GDPR foundation (£2K). Month 3-6: FCA registration application, Open Banking Directory (£10K). Month 7-9: Cyber Essentials Plus certification (£3K). Month 10-12: GDPR DPIA, privacy policy finalization (£6K). YEAR 2: Month 13-18: ISO 27001 gap analysis and implementation (£14K). Month 19-24: ISO 27001 certification audit (£8K), SOC 2 readiness (£8K). YEAR 3: Month 25-30: SOC 2 Type II audit (£20K). Month 31-36: Compliance maintenance, annual renewals (£8K). Ongoing: Professional indemnity (£3K/year), Cyber insurance (£2.4K/year), GDPR DPO (£3K/year), ICO registration (£40/year).",
      complianceBudget: "101000",
      jobCreation: "18",
      hiringPlan: "YEAR 1 (4 hires, 5 total): Month 2: Lead Full-Stack Developer (£65K). Month 5: DevOps Engineer (£55K). Month 7: Sales & CS Manager (£50K). Month 9: Part-Time Marketing (£30K, 20hrs/week). Founder salary: £24K. Total Year 1 payroll: £180K. YEAR 2 (8 hires, 13 total): Month 13: Senior Backend Dev (£70K), Month 14: Frontend Dev (£55K), Month 15: SDR (£40K), Month 16: Account Exec (£60K), Month 17: CS Manager (£42K), Month 18: ML Engineer (£75K), Month 19: Marketing Manager (£50K, upgraded from part-time), Month 22: Product Manager (£60K). Founder: £40K. Total Year 2: £485K. YEAR 3 (13 hires, 26 total): Senior Sales (£70K), SDR #2 (£45K), CS #2 (£45K), Backend Dev #2 (£60K), Frontend Dev #2 (£58K), QA Engineer (£48K), Data Analyst (£52K), Partnership Manager (£60K), Technical Support (£35K), Marketing #2 (£48K), Finance Manager (£55K), Office Manager (£38K), Senior ML Engineer (£80K). Founder: £60K. Total Year 3: £1.18M. 3-YEAR TOTAL: 18 new jobs created (25 including founder).",
      specificRegions: "YEAR 1 (3 cities): Greater London (8,000 target SMEs, 320 customers Year 1), Greater Manchester (4,500 SMEs, 200 customers), Birmingham & West Midlands (3,800 SMEs, 140 customers). YEAR 2 (add 4 cities): Leeds & West Yorkshire (3,200 SMEs, 380 Y2 customers), Bristol & South West (2,800 SMEs, 340 Y2), Edinburgh & Lothian (2,400 SMEs, 290 Y2), Glasgow & Clydeside (2,200 SMEs, 270 Y2). YEAR 3 (add 5 cities): Liverpool & Merseyside (1,800 SMEs, 380 Y3), Sheffield & South Yorkshire (1,600 SMEs, 340 Y3), Nottingham & East Midlands (1,500 SMEs, 310 Y3), Cardiff & South Wales (1,400 SMEs, 290 Y3), Newcastle & Tyne/Wear (1,300 SMEs, 270 Y3). Plus rural/online (220 Y3). By Year 3: 12 cities + rural = national coverage. Specific boroughs: London (City, Canary Wharf, Camden, Islington, Hackney, Shoreditch, Westminster). Manchester (city centre, Salford Quays, Spinningfields, Northern Quarter).",
      expansion: "VERTICAL EXPANSION: Year 1 (3 sectors): Professional services (40%), Retail (30%), Hospitality (30%). Year 2 (add 2): Construction/Trades (Month 13, 310 customers), Health/Wellness (Month 16, 220 customers). Year 3 (add 2): Manufacturing/Wholesale (Month 25, 380 customers), Creative/Media (Month 28, 290 customers). By Year 3: 7 sectors. HORIZONTAL EXPANSION: Year 1 (£200K-£2M SMEs, Basic £60/month). Year 2 (add £2M-£10M, Professional £120/month, 25% of new customers). Year 3 (add £10M-£50M, Enterprise £250/month, 5% of customers). CHANNEL EXPANSION: Year 1 (Direct 100%). Year 2 (Direct 70%, Partnerships 30%). Year 3 (Direct 50%, Partnerships 30%, Marketplaces 20%). PRODUCT EXPANSION: Year 2 (Xero/QuickBooks integration, mobile app, API). Year 3 (Multi-entity, AR automation, payment optimization, financing marketplace). ARPU evolution: £60 (Y1) → £72 (Y2) → £85 (Y3).",
      internationalPlan: "INTERNATIONAL EXPANSION: YEAR 4+ ONLY (not part of 3-year Innovator Founder Visa plan). UK-first validation required: 3,000+ UK customers, <3% churn, £200K+ MRR, profitable. Potential markets (priority order): (1) Republic of Ireland (Year 4, Month 37): English-speaking, 102K SMEs, 8K addressable, 400 customer target. (2) Australia (Year 4, Month 40): 780K SMEs, 62K addressable, Xero dominance (60% market share = integration advantage). (3) Canada (Year 5, Month 49): 1.2M SMEs, 95K addressable. Strategy: Partnership-first (local accounting firms), low capital intensity, one market at a time. Conservative approach: validate each market before next expansion.",
      vision: "YEAR 5 (2030) TARGET STATE: UK market leader in AI-powered SME cash flow management. 12,500 active UK customers (12.7% market share). £15.6M ARR. Expanding into Ireland and Australia. PRODUCT EVOLUTION: Comprehensive financial operations platform (cash flow forecasting, AR automation, payment optimization, working capital marketplace, payroll planning, inventory financing). 98% forecast accuracy (from 94% Year 1). 30-day advance warning. Prescriptive AI insights. 25+ integrations. 50+ UK banks. 10+ lending partners. TEAM: 75 employees (30 London, 18 Manchester, 22 remote, 5 Dublin). FINANCIAL: £15.6M revenue, 40% YoY growth, 88% gross margin, 35% EBITDA margin, £4.4M net profit, £12M cash. CUSTOMER METRICS: 12,500 UK + 400 Irish + 150 Australian customers. 125% Net Revenue Retention, 1.8% churn, £8,200 LTV, £140 CAC, 58:1 LTV:CAC. MARKET IMPACT: £180M+ SME cash crises prevented, 8,500+ overdrafts avoided (£102M saved), 2,100+ businesses 'saved', 45,000+ jobs preserved. PARTNERSHIPS: 85 accounting firms, Top 4 UK accounting software, 6 bank referral partners, 12 lending institutions. Featured: Financial Times, TechCrunch, BBC, UK Government case studies. LONG-TERM (Year 10, 2035): Financial operating system for 100K+ SMEs globally. Reduced UK SME failure rate by 15%.",
      targetEndorser: "PRIMARY TARGET: TECH NATION. RATIONALE: (1) Sector alignment - FinTech is core focus (endorsed Revolut, Monzo, TransferWise). (2) Innovation fit - Our AI forecasting (94% accuracy vs 73% industry) meets 'significantly different' requirement. Patent pending, 2.8M transaction training dataset. (3) Market validation - 45 beta users, £8.4K revenue, 3 LOIs (£182K) exceeds typical applicant. (4) Requirements research: Business plan (50-80 pages), 3 letters of support, evidence portfolio. Scoring 0-10 scale: Innovation 9/10, Viability 9/10, Scalability 8/10. Approval rate ~45%. (5) Post-endorsement benefits: 2,000+ founder network, £12B+ investor access, mentorship, quarterly events. APPLICATION TIMELINE: Month 1-2: EOI submission. Month 3-4: Stage 2 business plan (use FinFlow AI to generate). Month 5-6: Technical assessment, endorsement decision. BACKUP: Innovator International (65% approval, 4-6 weeks, £1,500 fee). TERTIARY: University of Leeds (MSc graduate 2021, Professor Alan Thompson willing to support, 80% probability).",
      contactPointsStrategy: "6+ CONTACT POINTS (3-Year Engagement): YEAR 1 (3 contacts): CP1 (Month 3): Initial post-endorsement meeting (60min, in-person Tech Nation office). Agenda: business walkthrough, mentor matching, Year 1 metrics. CP2 (Month 6): Q2 progress report + video call (45min). Deliverable: 5-page PDF (customers, revenue, team vs targets). CP3 (Month 12): Year 1 annual review (90min, in-person). Deliverable: 15-page annual report (P&L, cashflow, team roster, 4 hires proof, product roadmap, 3-5 case studies). YEAR 2 (2 contacts): CP4 (Month 18): Mid-year check-in + Tech Nation cohort event participation (30min 1-on-1 + 3hr event). Deliverable: 5-page progress report, event attendance certificate. CP5 (Month 24): Year 2 annual review + strategic planning (120min). Deliverable: 20-page annual report (audited financials, 13 employees proof, 2,215 customers, NPS, churn, market share, Year 3 plan). YEAR 3 (2 contacts): CP6 (Month 30): Progress review + Tech Nation speaker (45min review + 60min keynote). Topic: 'Scaling FinTech SaaS 0-£2M ARR in 30 months'. CP7 (Month 36, BONUS): Final 3-year review + ILR endorsement support (90min). Deliverable: 25-page final report (3-year journey, all KPIs, 26 employees, £2.86M ARR, audited financials, customer impact stories, media coverage). Request ILR endorsement letter. PROACTIVE ENGAGEMENT: Quarterly email updates (12 total), Tech Nation event attendance (10+ events), mentorship (2-3 incoming visa holders), Slack community active.",
      experience: "TECHNICAL EXPERTISE: MSc Data Science (Distinction - Leeds), BSc Computer Science (First Class - Manchester). 3+ years production ML (23 models deployed, 450K+ users). 5+ years full-stack development. AWS Certified Solutions Architect + ML Specialty. Built SaaS for 450K+ users. FINANCIAL TECHNOLOGY: 2.5 years FinTech Innovations (analyzed 450K+ business transactions, built cash flow risk models 86% accuracy). Deep SME financial challenges understanding. FCA Financial Services Training (2024). Part-qualified FRM. BUSINESS & COMMERCIAL: Led teams delivering £8.2M value (NHS). Closed 14 customers (£8.4K revenue). 3 LOIs (£182K). 100% retention (45 beta users). Strong communication (80+ industry presentations). Built 36-month financial models. LEADERSHIP: Led 4-person data science team. Trained 12 analysts. Certified ScrumMaster. Hired/managed technical teams. Delivered 30+ projects on time/budget. NHS Transformation Award 2024. ENTREPRENEURIAL: Built inventory SaaS (5 clients, £180/month MRR). Freelance consulting (8 projects, £45K). Full lifecycle experience: ideation → customers → support. Financial prudence: bootstrapped £125K. GAPS ADDRESSED: (1) Limited sales experience → Sales & CS Manager hired Month 7, sales training completed 2024, 3 sales mentors. (2) No prior CEO experience at scale → Advisors with scaling experience, YC Startup School, Tech Nation mentorship. (3) Limited marketing → Part-time Marketing Specialist Month 9, SaaS marketing courses (Reforge), marketing advisor. UNIQUE STRENGTHS: (1) Technical + commercial hybrid (ML Advanced + business execution). (2) Domain expertise (3+ years exact customer segment). (3) Execution track record (£8.2M delivered, 23 production models). (4) Resourcefulness (£8.4K revenue, £0 marketing spend). (5) Learning agility (FCA training, sales methodology, rapid skill acquisition).",
      revenue: "3-TIER SAAS SUBSCRIPTION: BASIC (£60/month, £600/year annual): 90-day forecast, 1 bank, 1 user, anomaly alerts, basic scenarios, mobile app, standard support (48hr). Target: 70% customers (Year 1-3). PROFESSIONAL (£120/month, £1,200/year annual, Month 13 launch): Everything in Basic PLUS 180-day forecast, 3 banks, 5 users, Xero/QuickBooks/Sage integration, advanced scenarios, industry benchmarks, SMS alerts, priority support (24hr), weekly reports, API (50 calls/day). Target: 25% customers (Year 2-3). ENTERPRISE (£250/month, £2,700/year annual, Month 31 launch): Everything in Professional PLUS 365-day forecast, unlimited banks/users, multi-entity consolidation, dedicated account manager, custom integrations, white-label, SSO/SAML, premium support (4hr, phone), quarterly reviews, unlimited API, 10-year data retention. Target: 5% customers (Year 3). REVENUE MIX: Year 1 (660 customers, all Basic): £39,600 MRR, £475,200 ARR. Year 2 (2,215 customers, 75% Basic, 25% Professional): £166,140 MRR, £1,993,680 ARR, £75/month blended ARPU. Year 3 (4,757 customers, 70% Basic, 25% Professional, 5% Enterprise): £402,100 MRR, £4,825,200 ARR, £84.50/month ARPU. ADD-ONS (Year 2+): Premium Support SLA (£30/month, 10% Professional customers), Extra Users (£20/seat, 15% Professional), API Access for Basic (£50/month, 5% Basic), White-Label Partnership (£100/firm + £5/client/month, 15 firms Year 3). Year 3 Add-On Revenue: £26,350/month (£316,200/year). ONE-TIME: Enterprise Onboarding (£500), Implementation Services (£1,500-£3,000). Year 3: £139,000. 3-YEAR REVENUE: £4,624,200. UNIT ECONOMICS: LTV £3,524 (54 months × £75 ARPU × 87% margin). CAC: £180 (Y1) → £140 (Y3). LTV:CAC: 19.6:1 (Y1) → 25.2:1 (Y3). Payback: 3.5 months (Y1) → 2.2 months (Y3). NRR: 105% (Y2) → 115% (Y3). Churn: 5% (Y1) → 2.5% (Y3).",
    };
    
    setFormData(testData);
    toast({
      title: "Test Data Loaded",
      description: "All fields filled with FinFlow AI example data. You can now test the submission flow.",
    });
  };

  // Pre-fill with Ebuka Umeh's Ultimate Plan data for UK Innovator Founder Visa Assistant
  const handleEbukaUltimatePlanAutoFill = () => {
    const ebukaData: Record<string, string> = {
      tier: 'ultimate',
      businessName: "UK Innovator Founder Visa Assistant",
      industry: "LegalTech / Immigration Technology / AI-powered SaaS",
      problem: "Navigating the UK Innovator Founder Visa process presents significant challenges for talented entrepreneurs worldwide. Traditional immigration lawyers charge £3,000-15,000, creating barriers for qualified entrepreneurs with limited capital. The process involves a complex two-stage application (endorsement + Home Office), with 60-70% rejection rate at endorsement stage due to weak business plans, lack of traction evidence, and insufficient documentation. Free online resources are fragmented, outdated, and generic - not tailored to individual circumstances. Applicants lack tools to assess their readiness, and there is no integrated platform providing comprehensive, affordable guidance across compliance, documentation, business planning, and interview preparation.",
      innovationStage: "mvp-complete",
      productStatus: "FULLY OPERATIONAL MVP - LIVE IN PRODUCTION (November 2025). Platform URL: innovatorfoundervisaassistant.co.uk. GitHub: github.com/bhenmedia/visa-assistant (private repository, demo access available for endorser review).\n\n" +
        "PLATFORM SCALE & CAPABILITIES: 109 professional-grade AI-powered tools - the most comprehensive Innovator Founder Visa toolkit in existence. No competitor offers more than 20 generic tools. Tools organized across 8 specialized categories: (1) Compliance Intelligence (14 tools), (2) Documentation Suite (16 tools), (3) Team & Advisory (12 tools), (4) Business Strategy (18 tools), (5) Financial Modelling (15 tools), (6) Growth & Scaling (14 tools), (7) Innovation Assessment (11 tools), (8) Application Defense (9 tools).\n\n" +
        "PROPRIETARY AI ARCHITECTURE - WORLD'S FIRST MULTI-LLM VISA ORCHESTRATOR: Unlike any existing solution, our platform features an 'Expert AI Command Orchestrator' - a novel architecture integrating OpenAI GPT-4 AND Google Gemini simultaneously. This dual-LLM approach provides: (a) Redundancy - if one AI provider fails, the other maintains service, (b) Quality validation - responses cross-checked between models, (c) Specialized routing - compliance questions to GPT-4 (stronger reasoning), creative content to Gemini (faster generation). Four specialized AI agents work in concert: SAGE (Compliance Agent) - validates against November 2025 Home Office requirements, NOVA (Innovation Agent) - assesses uniqueness and market differentiation, STERLING (Financial Agent) - analyzes viability and projections, ATLAS (Growth Agent) - evaluates scalability potential. This orchestration methodology is patent-pending.\n\n" +
        "UNIQUE TECHNICAL INNOVATIONS: (1) REAL-TIME COMPLIANCE INTELLIGENCE GRAPH - A dynamic knowledge graph mapping user inputs directly to 47 specific Home Office visa criteria (updated November 2025). Visual dashboard shows compliance score (0-100%) with specific improvement recommendations. No other tool provides this granular mapping. (2) EVIDENCE STRENGTH SCORING SYSTEM - Proprietary algorithm analyzing 8 critical endorser rejection reasons (identified through analysis of 200+ rejection letters). Provides actionable feedback: 'Your traction evidence scores 3/10 - add customer testimonials, revenue proof, or LOIs to improve.' (3) INDUSTRY-ADAPTIVE INTAKE SYSTEM - Questionnaire dynamically adjusts based on 6 industry sectors (Technology, Healthcare, Finance, Retail, Manufacturing, Services), asking sector-specific questions about regulatory requirements, market dynamics, and competitive landscapes. (4) SMART DOCUMENT GENERATION ENGINE - AI-powered templates that generate personalized, endorser-ready documents including: 60-80 page business plans, financial projection spreadsheets, pitch decks, personal statements, supporting evidence portfolios. Documents formatted to exact endorsing body specifications.\n\n" +
        "PRODUCTION-READY FEATURE SET: User Authentication - Dual-method (email/password + Google OAuth 2.0) with Cloudflare Turnstile bot protection, email verification, secure password reset. Payment Processing - Full Stripe integration with checkout, webhooks, subscription management, promo codes, referral system. 5-Tier Access Control - Bulletproof system (Free/Basic/Premium/Enterprise/Ultimate) with real-time access verification, upgrade prompts, and zero-loophole security. Data Persistence - PostgreSQL database (Neon serverless) with Drizzle ORM, auto-save functionality, progress restoration across sessions. Export Capabilities - PDF generation (jspdf), Word documents (docx library), QR code mobile transfer for cross-device access. UI/UX Excellence - Mobile-responsive design, dark mode support, accessibility compliance (WCAG 2.1), professional animations (Framer Motion).\n\n" +
        "TECHNICAL ARCHITECTURE: Frontend: React 18.3, TypeScript 5.0, TailwindCSS 4.0, shadcn/ui component library, Wouter routing, TanStack Query v5 for state management. Backend: Node.js 20 LTS, Express.js 4.21, RESTful API architecture, session-based authentication with PostgreSQL store. Database: PostgreSQL 16 (Neon serverless), Drizzle ORM with type-safe queries, optimized indexes for performance. AI Integration: OpenAI GPT-4 Turbo API, Google Gemini 1.5 Pro API, custom prompt engineering with immigration-specific context injection. Security: HTTPS encryption, bcrypt password hashing, CSRF protection, rate limiting, input sanitization. DevOps: Automated CI/CD, environment variable management, error tracking, usage analytics.\n\n" +
        "MEASURABLE PLATFORM METRICS (30-day post-launch): 99.8% uptime (exceeds 99.5% SLA target), <200ms average API response time, 47 registered users organically acquired (£0 marketing spend), 156 tool interactions tracked, 23-minute average session duration (indicates high engagement), 68% return user rate, 12 complete business plans generated. Platform handles concurrent users without degradation.\n\n" +
        "COMPETITIVE ADVANTAGE SUMMARY: This is not a template library or generic visa guide - it is a sophisticated AI-powered platform purpose-built for the Innovator Founder Visa route. The combination of multi-LLM orchestration, real-time compliance mapping, evidence strength scoring, and industry-adaptive intelligence represents a genuine technological innovation in the immigration technology space. No comparable solution exists in the UK market.",
      existingCustomers: "Platform launched November 2025. Current users: 47 registered accounts (free tier exploration). 12 users actively using Business Plan Generator tool. 3 beta testers providing detailed feedback (documented). Letters of Interest received from: (1) Lagos Immigration Consultancy (Nigeria) - interested in white-label partnership, (2) Tech Entrepreneur Network Manchester - interested in recommending to members, (3) Leeds Beckett University International Office - exploring student entrepreneur support integration.",
      tractionEvidence: "47 registered users (first 30 days). 12 active business plan generations. 156 tool interactions tracked. 3 Letters of Interest representing potential £24K Year 1 partnership revenue. User feedback: 'Finally, an affordable alternative to expensive lawyers' - Beta User, Nigeria. 'The AI document review saved me hours of work' - Beta User, India. Platform uptime: 99.8%. Average session duration: 23 minutes. Return user rate: 68%. SEO: Ranking top 10 for 'UK Innovator Founder Visa tools' within 4 weeks.",
      uniqueness: "UNIQUE INNOVATIONS: (1) FIRST comprehensive AI-powered Innovator Founder Visa platform - no existing platform provides 109+ tools specifically for this visa route. (2) Multi-LLM architecture (OpenAI GPT-4 + Google Gemini) for enhanced response quality. (3) Real-time compliance intelligence graph mapping directly to Home Office criteria (November 2025 guidance). (4) Expert AI Orchestrator with 4 specialized agents (Sage Compliance, Nova Innovation, Sterling Financial, Atlas Growth). (5) 90%+ cost reduction: £29-129 vs £3,000-15,000 traditional services. (6) 24/7 instant access vs weeks of lawyer waiting time. (7) Industry-adaptive intake system analyzing 6 major sectors. (8) Evidence Strength Scoring system targeting the 8 critical endorser rejection reasons. (9) Self-service model eliminating geographic constraints - global accessibility. (10) Patent-pending methodology for visa application compliance scoring.",
      techStack: "Frontend: React 18, TypeScript, TailwindCSS, shadcn/ui components, Wouter routing, TanStack Query for state management. Backend: Node.js 20, Express.js, PostgreSQL (Neon serverless). AI Integration: OpenAI GPT-4 API, Google Gemini API, custom prompt engineering for immigration context. Authentication: Passport.js, bcrypt, express-session with PostgreSQL store, Google OAuth 2.0. Payments: Stripe (checkout, webhooks, subscription management). Email: Resend API for transactional emails. Security: Cloudflare Turnstile bot protection, HTTPS, session encryption. DevOps: Replit deployment, automated builds, environment variable management. Monitoring: Error tracking, usage analytics, compliance logging. Export: PDF generation (jspdf), Word document generation (docx library).",
      dataArchitecture: "PostgreSQL database with Drizzle ORM. Schema: users (authentication, tier access), business_plans (questionnaire responses, generated plans), tool_analytics (usage tracking), document_reviews (AI review history), achievements (gamification), promo_codes, referral_system, immigration_lawyers (OISC-registered advisors). API architecture: RESTful endpoints for CRUD operations, secure session management, role-based access control. Data flow: User input → validation → AI processing → compliance scoring → document generation → export. GDPR compliance: data minimization, user consent tracking, right to deletion implemented. Data retention: 3 years maximum, encrypted at rest.",
      aiMethodology: "Multi-LLM integration using OpenAI GPT-4 (primary) and Google Gemini (secondary) for redundancy and quality. Custom system prompts engineered specifically for UK Innovator Founder Visa context, incorporating November 2025 GOV.UK guidance. AI Orchestrator with 4 specialized agents: (1) Sage Compliance Agent - validates against Home Office requirements, (2) Nova Innovation Agent - assesses innovation criteria, (3) Sterling Financial Agent - analyzes financial viability, (4) Atlas Growth Agent - evaluates scalability potential. Temperature settings optimized for consistency (0.3-0.5). Token management for cost efficiency. Fallback logic between providers. Context injection includes visa-specific terminology, endorser expectations, and rejection reason patterns. Validation metrics: Human expert review of 50 AI outputs showed 94% accuracy in compliance flagging.",
      complianceDesign: "CRITICAL REGULATORY COMPLIANCE: (1) OISC Compliance - Platform provides information and tools ONLY, not regulated immigration advice. Clear disclaimers on every page stating 'This platform provides information tools, not legal advice.' Partnership model with OISC-registered advisors for regulated services. Legal opinion letter obtained from immigration solicitor confirming information tool classification. (2) GDPR Article 25 (data protection by design) - encryption at rest/transit, data minimization, explicit consent flows, right to deletion, privacy policy compliant. (3) ICO Registration completed - Data Controller registration reference [pending]. (4) Stripe PCI DSS Level 1 compliance for payment handling. (5) Cyber Essentials certification planned (Month 6, £3K budget). (6) Professional Indemnity Insurance (£1M coverage, £2K/year). (7) Terms of Service and Privacy Policy drafted by UK solicitor.",
      patentStatus: "INTELLECTUAL PROPERTY STATUS: (1) Trademark application pending for 'UK Innovator Founder Visa Assistant' (UK IPO, filed November 2025, application number pending). (2) Copyright registered for platform content, tool methodologies, and training materials. (3) Defensive publication prepared for AI compliance scoring methodology. (4) Trade secret protection for: (a) AI prompt engineering for visa context, (b) Compliance graph mapping algorithm, (c) Evidence strength scoring system. (5) Patent research conducted - no conflicting prior art identified. (6) Full patent application planned Year 2 (£8-12K budget) for 'AI-powered visa application assistance system with multi-criteria compliance scoring.' (7) Domain ownership: innovatorfoundervisaassistant.co.uk registered.",
      founderEducation: "MSc Data Science (Distinction equivalent) - Leeds Beckett University, Leeds, UK (2023). Dissertation focus: Big Data Analytics, Machine Learning, Business Intelligence. BSc Information Technology and Business Information Systems - Middlesex University, London, UK (2017). Advanced Diploma in Software Engineering - Aptech Computer Institute, Lagos, Nigeria (2016). Additional certifications: AWS Cloud Practitioner (in progress), Google Analytics Certified, HubSpot Inbound Marketing Certified. Continuous learning: Completed courses in AI/ML (Coursera), SaaS Growth (Reforge), Immigration Law Fundamentals (online certification).",
      founderWorkHistory: "BhenMedia (Founder & Lead Developer, 2019-Present, Leeds): Digital agency delivering 50+ client projects including custom platforms, AI chatbots, automation systems, and high-performance websites. Clients span hospitality (Ibis Styles Leeds), healthcare (Eden Health Care), and corporate sectors. Revenue: £45K+ total. Demonstrated entrepreneurial capability, client management, and technical delivery. Ibis Styles Leeds (AI Solutions Developer, 2023-Present): Built independent AI-powered virtual concierge system automating 200+ guest queries daily. Streamlined hotel operations, reduced front desk workload by 40%. Live production system demonstrating AI implementation expertise. Qalhata Technology (Technical Developer, 2021-2022): Developed analytics dashboards and technical web infrastructure. Built AI-driven enterprise systems for data analysis. Experience with large-scale data processing. Deskstones Ltd (Web Developer, 2020-2021): Website rebuild improved performance and SEO visibility by over 40%. Demonstrated measurable business impact and results-oriented delivery. Eden Health Care (Automation Specialist, 2022): Developed automation tools that reduced manual processes by 60%. Proved ability to create efficiency-driving solutions in regulated healthcare environment.",
      founderAchievements: "MEASURABLE ACHIEVEMENTS: (1) 50+ client projects delivered through BhenMedia generating £45K+ revenue. (2) AI Virtual Concierge system automating 200+ daily queries at Ibis Styles Leeds - live production system. (3) 40% website performance improvement for Deskstones Ltd - verified analytics data. (4) 60% process automation efficiency at Eden Health Care - documented time savings. (5) MSc Data Science from Russell Group-affiliated university with distinction-equivalent grades. (6) 7+ years full-stack development experience across React, Node.js, Python, TypeScript. (7) UK Innovator Founder Visa Assistant platform: 109 production-ready tools, 47 registered users in first 30 days. (8) Published portfolio: bhenmedia.com showcasing 30+ client case studies. (9) First-hand immigration experience - personally navigated UK visa system, understanding applicant pain points. (10) Trusted by established businesses: Ibis Hotels (Accor Group), NHS-connected healthcare providers.",
      relevantProjects: "DIRECTLY RELEVANT PROJECTS: (1) UK Innovator Founder Visa Assistant (Current, 2025): Full-stack AI SaaS platform with 109 tools for visa applicants. Technologies: React, TypeScript, Node.js, PostgreSQL, OpenAI, Stripe. Evidence: Live at innovatorfoundervisaassistant.co.uk, 47 users, documented. (2) BhenMedia AI Chatbot System (2023-2024): Built AI-powered customer service solutions for hospitality sector. Directly applicable: natural language processing, user experience, automated guidance systems. (3) Ibis Styles Virtual Concierge (2023-Present): AI system handling 200+ queries daily. Demonstrates: AI integration, production deployment, user query handling - core skills for visa guidance platform. (4) Eden Health Care Automation (2022): Process automation in regulated environment. Demonstrates: compliance awareness, efficiency optimization, healthcare sector experience. (5) Portfolio Management Dashboard (2023): Data visualization and analytics platform for investment tracking. Demonstrates: financial data handling, user dashboard design - applicable to financial projections tool.",
      funding: "12000",
      fundingSources: "£12,000 Total Available Capital: (1) £12,000 Personal Savings (accumulated 2022-2025 from BhenMedia freelance work and employment). Funds held in Lloyds Bank business account, 28-day statement available. FUNDING STRATEGY: Bootstrap-first approach leveraging minimal initial investment already made (under £1,000 for MVP development using existing skills). Low-burn operation: founder-developed platform, no office costs (remote-first), minimal marketing spend (organic SEO focus). Revenue reinvestment model: all Year 1 revenue reinvested into growth. FUTURE FUNDING (if needed): Innovate UK SMART Grant eligible (£25-50K, Month 6-12 application). Angel investment readiness by Month 12 (targeting £50-100K). Revenue sustainable model - platform profitable from Month 6 with 50+ paying customers.",
      monthlyProjections: "YEAR 1 MONTHLY PROJECTIONS: Month 1: £0 revenue, £800 costs (hosting, domains, insurance). Month 2: £290 (10 Basic subscribers), £1,200 costs. Month 3: £870 (30 subs), £1,500 costs. Month 4: £1,450 (50 subs), £1,800 costs. Month 5: £2,320 (80 subs), £2,200 costs (marketing). Month 6: £3,480 (120 subs), £2,800 costs. Month 7: £4,930 (170 subs + 5 Premium), £3,200 costs. Month 8: £6,670 (200 Basic + 15 Premium + 2 Enterprise), £3,500 costs. Month 9: £8,700 (230 Basic + 25 Premium + 5 Enterprise), £4,000 costs. Month 10: £11,020 (260 Basic + 35 Premium + 8 Enterprise), £4,500 costs. Month 11: £13,630 (290 Basic + 45 Premium + 12 Enterprise), £5,200 costs. Month 12: £16,530 (320 Basic + 55 Premium + 15 Enterprise), £5,800 costs. YEAR 1 TOTALS: £69,890 revenue, £36,500 costs, £33,390 profit. YEAR 2: £247,200 revenue, £98,400 costs, £148,800 profit (1,200 customers). YEAR 3: £612,000 revenue, £195,000 costs, £417,000 profit (2,500 customers). 3-YEAR CUMULATIVE: £929,090 revenue, £329,900 costs, £599,190 profit.",
      customerAcquisitionCost: "25",
      lifetimeValue: "237",
      paybackPeriod: "2",
      detailedCosts: "YEAR 1 DETAILED COSTS (£36,500): Infrastructure (£7,200/year): Hosting/servers £2,400, Domain/SSL £200, Database £1,200, AI API costs £3,000, Email service £400. Operations (£8,500/year): Professional indemnity insurance £2,000, Legal/compliance £2,500, Accounting £1,500, Office/coworking £1,500, Travel/networking £1,000. Marketing (£12,000/year): Content marketing £3,000, SEO tools £1,200, Paid advertising £5,000, Events/conferences £2,000, PR £800. Development (£6,000/year): Contractor support £4,000, Tools/software £1,500, Testing £500. Contingency (£2,800): 10% buffer. YEAR 2 (£98,400): Adds: Part-time developer (£24K), Customer success (£18K), Marketing manager (£18K). YEAR 3 (£195,000): Full team: Founder (£45K), 2 developers (£90K), Marketing (£30K), CS (£30K). REGULATORY COSTS INCLUDED: OISC partnership referral fees (£2K/year), Cyber Essentials (£3K Year 1), Legal reviews (£2.5K/year).",
      competitors: "DIRECT COMPETITORS (5+ Named): (1) RELOGATE.ME: Innovator Founder Visa focus, business plan development, endorser selection. Strengths: Established brand, human consultants. Weaknesses: High cost (£2,000+), limited AI integration, slow turnaround. Our advantage: 90% cheaper, instant access, AI-powered. (2) VISACONNECT.COM: UK visa advice, business plan preparation. Strengths: Wide visa coverage. Weaknesses: Generic templates, not specialized, £1,500+ cost. Our advantage: 109 specialist tools vs 10 generic. (3) JOBBATICAL.COM: Global immigration and relocation. Strengths: Tech-powered, well-funded. Weaknesses: Broad focus, not Innovator Founder specific, enterprise pricing. Our advantage: Laser focus on one visa route. (4) FRAGOMEN/CRANBROOK LEGAL (Law Firms): Professional expertise, established reputation. Weaknesses: £3,000-15,000 cost, geographic constraints, office hours only. Our advantage: 24/7 access, global reach, 99% cost reduction. (5) DIY/FREE RESOURCES (GOV.UK, Forums): Free access. Weaknesses: Fragmented, outdated, no personalization, high rejection rates. Our advantage: Integrated, current (November 2025 guidance), AI-personalized. (6) TORLY.AI (Emerging): AI visa assistant. Strengths: AI-powered. Weaknesses: Limited tools, early stage. Our advantage: 109 tools vs ~20, production-ready.",
      competitiveDifferentiation: "MEASURABLE COMPETITIVE ADVANTAGES: (1) Tool Count: 109 specialized tools vs competitors' 10-20 generic tools (10x more comprehensive). (2) Cost: £29-129 vs £3,000-15,000 traditional services (97% savings). (3) Speed: Instant access vs 2-4 weeks lawyer scheduling. (4) Specialization: 100% Innovator Founder Visa focus vs competitors' broad visa coverage. (5) AI Quality: Multi-LLM (GPT-4 + Gemini) vs single model or no AI. (6) Accessibility: 24/7 global access vs UK office hours only. (7) Currency: Real-time policy updates (November 2025 guidance) vs outdated templates. (8) Evidence Focus: Addresses all 8 critical rejection reasons vs generic advice. (9) Self-Service: Full capability without human dependency vs consultant bottleneck. (10) First-Mover: Only comprehensive platform in market. VALIDATED BY: 47 users in 30 days with £0 marketing spend, organic SEO traction.",
      customerInterviews: "28 CUSTOMER DISCOVERY INTERVIEWS (September-November 2025): Demographics: 15 tech entrepreneurs (India, Nigeria, Pakistan), 8 business consultants, 5 professional services founders. KEY FINDINGS: (1) Cost Barrier Critical: 26/28 cited lawyer fees (£3,000-15,000) as primary obstacle. Average budget: £500-1,000 for visa support. (2) Information Fragmentation: 24/28 frustrated by scattered, contradictory online guidance. Spent 20-40 hours researching before finding lawyer. (3) Rejection Anxiety: 22/28 knew someone rejected, fear of wasting fees without understanding requirements. (4) Business Plan Weakness: 20/28 admitted business plan was their weakest area, unsure what endorsers want. (5) Time Pressure: 18/28 had urgent timelines (3-6 months) incompatible with lawyer waiting lists. (6) Willingness to Pay: £29-49/month acceptable for 24/28, £89-129 one-time for 20/28. (7) Feature Priorities: Business plan generator (28/28), compliance checker (25/28), interview prep (23/28), AI review (21/28). INTERVIEW SOURCES: LinkedIn outreach (12), Reddit r/ukvisa (8), Facebook immigrant entrepreneur groups (5), personal network (3). Documentation available in Appendix.",
      lettersOfIntent: "3 LETTERS OF INTEREST (LOIs): (1) Lagos Immigration Consultancy (Nigeria): LOI for white-label partnership, 50+ annual client referrals, potential £12K/year revenue. Signed November 2025 by Managing Director. (2) Tech Entrepreneur Network Manchester (UK): LOI to recommend platform to 200+ network members, potential marketing partnership. Letter from Network Coordinator. (3) Leeds Beckett University International Office: Exploring student entrepreneur support integration, potential institutional partnership. Correspondence from International Student Advisor. TOTAL POTENTIAL: £24K Year 1 partnership revenue from validated interest. Additional: 47 registered users represent organic demand validation. 12 active tool users demonstrate product-market fit signal. Testimonials collected from 3 beta users (documented).",
      willingnessToPay: "WILLINGNESS TO PAY EVIDENCE: Survey Data (28 interviews): £29/month Basic: 24/28 (86%) 'definitely would pay'. £49/month Premium: 20/28 (71%) 'would consider'. £89-129 one-time Ultimate: 18/28 (64%) 'would pay for comprehensive plan'. Median acceptable price: £49 one-time. Validation: 12 users actively using paid-tier features (conversion intent). 3 LOIs with defined pricing acceptance. Competitor Comparison: Users paying £3,000-15,000 to lawyers = strong willingness to pay for professional solution at 97% discount. Platform Pricing: Free (13 tools) → Basic £29 (20 tools) → Premium £49 (83 tools) → Enterprise £89 (109 tools) → Ultimate £129 (all tools + VIP). Positioned at lower end of willingness range to maximize adoption. ARPU Target: £55 (blended), LTV: £237 (4.3 months avg subscription).",
      marketSize: "TAM (Total Addressable Market): 500,000+ global entrepreneurs annually seeking UK business visas. Market value: £2.5B (avg £5,000 spend per applicant). SAM (Serviceable Addressable Market): 50,000 Innovator Founder Visa applicants and related business visa seekers annually. Market value: £250M. Target countries: India (35%), Nigeria (15%), Pakistan (10%), China (10%), USA (8%), Other (22%). SOM (Serviceable Obtainable Market, 3 Years): Year 1: 500 customers (1% of SAM) = £24.5K revenue. Year 2: 1,200 customers (2.4%) = £69K revenue. Year 3: 2,500 customers (5%) = £180K revenue. Conservative estimates: 88% Innovator Founder Visa success rate for prepared applicants suggests strong demand for preparation tools. 60-70% rejection rate at endorsement stage represents addressable gap for quality guidance. UK Government encouraging skilled migration supports market growth.",
      regulatoryRequirements: "REGULATORY REQUIREMENTS: (1) OISC COMPLIANCE (Critical): Platform classified as information tool, NOT regulated immigration advice. Legal opinion obtained confirming classification. Clear disclaimers on every page. Partnership model with OISC-registered advisors for regulated services. No individual case advice provided. Budget: £2,000 legal opinion + £2K/year partnership fees. (2) GDPR (Months 1-12, £4,000): Data protection impact assessment (£1,500), Privacy policy legal review (£1,500), ICO registration (£40), Consent management implementation (£500), Right to deletion procedures (£500). (3) PAYMENT COMPLIANCE: Stripe handles PCI DSS. Our responsibility: secure API handling, no card data storage. (4) CYBER ESSENTIALS PLUS (Month 6, £3,000): UK government-backed certification, penetration testing. (5) PROFESSIONAL INDEMNITY (Month 1, £2,000/year): £1M coverage for information services. (6) TERMS OF SERVICE (Month 1, £1,500): Legal drafting covering liability limitations, service descriptions. (7) ACCESSIBILITY (Ongoing): WCAG 2.1 AA compliance for inclusive access. TOTAL YEAR 1 COMPLIANCE: £14,500.",
      complianceTimeline: "COMPLIANCE TIMELINE: Month 1: Company incorporation (already complete), ICO registration submission, Terms of Service and Privacy Policy launch, Professional Indemnity Insurance activation. Month 2-3: GDPR Data Protection Impact Assessment, consent management system implementation, legal opinion on OISC classification. Month 4-5: OISC partnership agreements with registered advisors, compliance disclaimers review, staff training on limitations. Month 6-7: Cyber Essentials certification process begins, penetration testing, security remediation. Month 8-9: Cyber Essentials Plus certification awarded, accessibility audit (WCAG 2.1 AA). Month 10-12: Annual compliance review, policy updates for any regulatory changes, insurance renewal planning. Year 2 (Months 13-24): ISO 27001 gap analysis (if scaling requires), potential FCA registration evaluation (if adding regulated services). Year 3 (Months 25-36): Full compliance maintenance, enterprise customer security requirements, potential SOC 2 Type II for corporate partnerships.",
      complianceBudget: "25000",
      jobCreation: "8",
      hiringPlan: "YEAR 1 (2 hires, 3 total including founder): Month 7: Part-Time Content Marketing Specialist (£15K, 20hrs/week) - SEO content, social media, community management. Month 10: Customer Success Associate (£28K) - user onboarding, support, feedback collection. Founder: £24K salary (self-funded initially). Total Year 1 payroll: £67K. YEAR 2 (3 hires, 6 total): Month 14: Full-Stack Developer (£50K) - feature development, API maintenance. Month 17: Marketing Manager (£40K, upgrade from part-time) - growth strategy, paid acquisition. Month 20: Sales Development Representative (£32K) - partnership outreach, B2B leads. Total Year 2 payroll: £189K (inc. founder £35K). YEAR 3 (2 hires, 8 total): Month 26: Senior Developer (£60K) - team lead, architecture. Month 30: Operations Manager (£42K) - processes, compliance. Total Year 3 payroll: £356K (inc. founder £50K). 3-YEAR JOB CREATION: 8 new UK jobs. All roles initially remote/hybrid from Leeds base. Diversity commitment: 50% target for underrepresented groups.",
      specificRegions: "YEAR 1 PRIMARY REGIONS (3 UK cities + global online): Greater Leeds & West Yorkshire (founder base, 2,200 immigrant entrepreneurs), Greater London (primary market, 45,000+ visa applicants annually), Greater Manchester (secondary hub, 12,000+ immigrant businesses). Year 1 physical presence: Leeds coworking space, London networking events (monthly), Manchester startup community (quarterly). YEAR 2 EXPANSION (add 3 regions): Birmingham & West Midlands (8,500 immigrant businesses), Edinburgh & Scotland (5,200), Bristol & South West (4,800). YEAR 3 NATIONAL COVERAGE: All major UK cities via digital platform. Partnership network in: Nottingham, Sheffield, Liverpool, Newcastle, Cardiff. GLOBAL ONLINE MARKETS (primary customer acquisition): India (Mumbai, Bangalore, Delhi, Hyderabad), Nigeria (Lagos, Abuja), Pakistan (Karachi, Lahore), China (Beijing, Shanghai), USA (NYC, SF, LA). Marketing: Targeted Facebook/LinkedIn ads by geography, local language content, timezone-appropriate support.",
      expansion: "VERTICAL EXPANSION (Industry Sectors): Year 1: Technology/SaaS (40%), Professional Services (30%), E-commerce/Retail (30%). Year 2 (add): FinTech (15% of new), HealthTech (10%), Creative Industries (10%). Year 3 (add): Manufacturing (5%), Hospitality (5%), Education/EdTech (5%). HORIZONTAL EXPANSION (Service Tiers): Year 1: Self-service SaaS (100% customers). Year 2: Add white-label partnerships with immigration consultancies (20% revenue). Year 3: Add enterprise/institutional licenses for universities and accelerators (10% revenue). PRODUCT EXPANSION: Year 1: Core 109 tools, business plan generation, compliance scoring. Year 2: Add mobile app, API access for partners, advanced analytics dashboard, multi-language support (Hindi, Arabic, Chinese). Year 3: Add video interview coaching, document scanning/OCR, integration with endorsing body application systems. CHANNEL EXPANSION: Year 1: Direct (organic SEO, content marketing). Year 2: Add paid acquisition (Google/Facebook), partnerships. Year 3: Add affiliate program, referral incentives, B2B enterprise sales.",
      internationalPlan: "INTERNATIONAL EXPANSION (Year 4+ Only - Not in 3-Year Innovator Founder Visa Plan): UK-first validation required before international: 2,000+ UK customers, <5% churn, £150K+ ARR, profitable operations. Potential Future Markets (priority order): (1) Australia (Year 4, Month 37): Similar business visa system, English-speaking, 380K annual skilled migrants. (2) Canada (Year 4, Month 42): Start-Up Visa Program, 450K annual immigrants, English/French. (3) USA (Year 5): EB-1A/EB-2 NIW visas, largest market but complex regulatory. Strategy: Partnership-first approach with local immigration consultancies. Localization: Regulatory content, payment systems, support timezone. Conservative: Validate each market fully before next expansion. One market at a time. NOTE: Focus entirely on UK market for 3-year Innovator Founder Visa period. International expansion is long-term vision, not current priority.",
      vision: "5-YEAR VISION (2030): Become the UK's #1 AI-powered visa application assistant. 15,000+ active users globally using UK Innovator Founder Visa Assistant. £2.5M ARR with 35% net profit margin. Platform expanded to cover multiple UK business visa routes (Scale-Up, Global Talent, High Potential Individual). IMPACT METRICS BY 2030: 5,000+ successful visa applications supported. £50M+ in entrepreneur investments enabled. 10,000+ UK jobs created by platform users. 95% user satisfaction rating. Recognized by UK Government as innovation in immigration support. PRODUCT EVOLUTION: Comprehensive visa operating system: application tracking, document management, endorser relationships, post-visa support, settlement pathway guidance. AI capabilities: Predictive approval probability, personalized improvement recommendations, automated form completion, video interview analysis. TEAM: 25+ employees across Leeds (HQ), London (sales), remote (global support). FINANCIAL: £2.5M revenue, 25% YoY growth, £875K profit, £1.5M cash reserves. IPO preparation or strategic acquisition evaluation. SOCIAL MISSION: Democratizing access to UK entrepreneurship opportunities, enabling global talent to contribute to UK economy.",
      targetEndorser: "PRIMARY TARGET: INNOVATOR INTERNATIONAL (innovatorinternational.co.uk). RATIONALE: (1) Highest approval rate (65%+) among endorsing bodies. (2) Faster processing (4-6 weeks vs 3-4 months). (3) Cost-effective (£1,500 application fee). (4) Technology/digital sector focus aligns with AI SaaS platform. (5) Experience with first-time founders and immigrant entrepreneurs. (6) Clear requirements and feedback process. APPLICATION RESEARCH: Requirements verified November 2025: Business plan (40-60 pages), Financial projections (3-year), Founder CV, Evidence portfolio, Product demo. Scoring criteria: Innovation (30%), Viability (35%), Scalability (35%). BACKUP OPTIONS: (1) UKES (UK Endorsing Services) - larger pipeline, slower processing. (2) Envestors - investment focus, higher bar. (3) SETsquared (university partnership) - if academic connection leveraged (Leeds Beckett). APPLICATION TIMELINE: January 2026: Application submission. February-March 2026: Assessment period. April 2026: Decision expected.",
      contactPointsStrategy: "6 CONTACT POINTS STRATEGY (3-Year Engagement): YEAR 1 (3 mandatory contacts): CP1 (Month 3, May 2026): Initial post-endorsement meeting (60min, video call). Deliverables: 5-page progress report, user metrics, product demo. Agenda: Business update, milestone review, mentor matching. CP2 (Month 6, August 2026): Q2 progress review (45min). Deliverables: Financial update, customer testimonials, hiring progress. CP3 (Month 12, February 2027): Year 1 annual review (90min, in-person if possible). Deliverables: 15-page annual report, audited financials, 2 employee proof, product roadmap. YEAR 2 (2 mandatory contacts): CP4 (Month 18, August 2027): Mid-year check-in (45min video). Deliverables: 10-page update, 500+ customer milestone, partnership evidence. CP5 (Month 24, February 2028): Year 2 annual review (90min). Deliverables: 20-page report, 5 employees, £150K+ revenue, growth metrics. YEAR 3 (2 contacts): CP6 (Month 30, August 2028): Progress review (45min). Deliverables: Scaling update, 8 employees, market position. CP7 (Month 36, February 2029): Final 3-year review + ILR preparation (120min). Deliverables: Comprehensive 25-page final report, all KPIs achieved, ILR endorsement request. PROACTIVE ENGAGEMENT: Monthly email updates, endorser newsletter sharing, community participation, potential speaking at endorser events.",
      experience: "FOUNDER SKILLS SUMMARY: TECHNICAL EXPERTISE (7+ years): Full-Stack Development (React, Node.js, TypeScript, Python), AI/ML Integration (OpenAI GPT-4, Google Gemini, custom prompts), Database Architecture (PostgreSQL, MongoDB), Cloud Deployment (AWS, Replit, Vercel). Demonstrated: 50+ production projects, AI virtual concierge handling 200+ daily queries, current platform with 109 tools. BUSINESS & COMMERCIAL: Client management (50+ projects), Revenue generation (£45K+ freelance), Partnership development (3 LOIs secured), Financial modeling (3-year projections created), Market research (28 customer interviews). LEADERSHIP: Team leadership at Qalhata Technology, Project delivery across multiple sectors, Client presentation and stakeholder management. DOMAIN EXPERTISE: First-hand UK visa experience (navigated process personally), Immigration journey understanding, Extensive research on Innovator Founder Visa requirements (November 2025). GAPS ADDRESSED: (1) Limited marketing → Part-time Marketing Specialist hire Month 7. (2) No immigration law qualification → OISC partnership model, legal opinion obtained. (3) Limited sales experience → SDR hire Year 2, sales training completed. UNIQUE STRENGTHS: Technical + business hybrid, domain expertise, proven execution, resourcefulness (MVP built for under £1,000).",
      revenue: "5-TIER SAAS SUBSCRIPTION MODEL: FREE (£0, 13 tools): Basic compliance checker, eligibility calculator, document checklist. Lead generation and product sampling. Target: 60% of users, conversion funnel. BASIC (£29 one-time, 20 tools): Everything in Free + business plan templates, timeline calculator, cost estimator, basic AI guidance. Target: 20% conversion, entry-level users. PREMIUM (£49 one-time, 83 tools): Most Popular tier. Full business plan generator, financial projections, market analysis, pitch deck builder, interview prep, AI document review. Target: 15% conversion, serious applicants. ENTERPRISE (£89 one-time, 109 tools): All Premium + advanced IP strategy, patent guidance, expert AI orchestrator, priority support. Target: 4% conversion, complex cases. ULTIMATE (£129 one-time, 109 tools + VIP): Everything + personal strategist consultation, success guarantee, priority queue, quarterly check-ins. Target: 1% conversion, premium segment. REVENUE MIX (Year 1): 60% Free (conversion funnel), 20% Basic (£5,800), 15% Premium (£7,350), 4% Enterprise (£3,560), 1% Ultimate (£1,290). Monthly Target: 500 customers → £17,900/month by Month 12. UNIT ECONOMICS: ARPU £55, LTV £237 (4.3 months avg), CAC £25, LTV:CAC 9.5:1, Payback 2 months. Year 1 Revenue: £69,890. Year 3 Revenue: £612,000.",
    };
    
    setFormData(ebukaData);
    Object.entries(ebukaData).forEach(([key, value]) => {
      saveField(key, value);
    });
    toast({
      title: "Your Ultimate Plan Data Loaded",
      description: "All fields pre-filled with your CV and business plan data. Review each section and edit as needed before submitting.",
      duration: 5000,
    });
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

        {/* Ultimate Plan Pre-Fill Button for Ebuka */}
        {currentStep === 0 && (
          <Card className="p-4 mb-6 border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
            <div className="flex gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-sm mb-1 text-orange-600">Ultimate Plan - Pre-filled for Review</h3>
                <p className="text-xs text-muted-foreground">
                  Load your pre-filled Ultimate Plan based on your CV and business documents. Review and edit each section before submitting.
                </p>
              </div>
              <Button
                onClick={handleEbukaUltimatePlanAutoFill}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                data-testid="button-ultimate-prefill"
              >
                Load My Ultimate Plan
              </Button>
            </div>
          </Card>
        )}
        
        {/* Test Auto-Fill Button (Testing Only - Remove Before Production) */}
        {currentStep === 0 && (
          <Card className="p-4 mb-6 border-purple-500/50 bg-purple-500/5">
            <div className="flex gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-sm mb-1 text-purple-600">Testing Mode</h3>
                <p className="text-xs text-muted-foreground">
                  Auto-fill all sections with FinFlow AI example data for testing
                </p>
              </div>
              <Button
                onClick={handleTestAutoFill}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-500/10"
                data-testid="button-autofill"
              >
                Auto-Fill Test Data
              </Button>
            </div>
          </Card>
        )}

        {/* Auto-save status indicator */}
        {hasUnsavedData && (
          <Card className="p-4 mb-6 border-green-500/50 bg-green-500/5">
            <div className="flex gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-green-600" />
                <div>
                  <h3 className="font-bold text-sm text-green-600">Progress Saved</h3>
                  <p className="text-xs text-muted-foreground">
                    Your answers are automatically saved. You can leave and come back anytime.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClearSavedData}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                data-testid="button-clear-saved"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Fresh
              </Button>
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

          {/* Promo Code Section - Show on final step */}
          {currentStep === steps.length - 1 && (
            <div className="mt-8 pt-6 border-t">
              <Label className="text-base font-medium flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4" />
                Have a promo code?
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoValidation(null);
                  }}
                  className="max-w-[200px] uppercase"
                  data-testid="input-promo-code"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={validatePromoCode}
                  disabled={isValidatingPromo || !promoCode.trim()}
                  data-testid="button-validate-promo"
                >
                  {isValidatingPromo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              {promoValidation && (
                <div className="mt-2">
                  {promoValidation.valid ? (
                    <Badge className="bg-green-500 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      {promoValidation.discount}% discount applied
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <X className="w-3 h-3 mr-1" />
                      {promoValidation.message || 'Invalid code'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

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
