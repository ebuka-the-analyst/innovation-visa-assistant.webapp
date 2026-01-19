import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { THEME_TEMPLATES } from "@/lib/themeTemplates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Tag, Check, X, Loader2, Save, RotateCcw, Building2, Stethoscope, ShoppingBag, Laptop, Lightbulb, FileText, Upload, Sparkles, ChevronDown, ChevronUp, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Industry template definitions - Tech AND Non-Tech sectors
const INDUSTRY_TEMPLATES = {
  visatech: {
    name: "Legal Tech / Immigration Tech",
    icon: FileText,
    description: "AI-powered legal assistance, visa guidance, compliance automation",
    templates: ["UK Visa Assistant - Benedict Umeh", "LegalAI - Document Analysis", "ComplianceFlow - Regulatory Automation"]
  },
  fintech: {
    name: "FinTech / Financial Services",
    icon: Building2,
    description: "AI-powered financial tools, payment solutions, lending platforms",
    templates: ["FinFlow AI - Cash Flow Forecasting", "PaymentPro - B2B Payments", "LendSmart - SME Lending"]
  },
  healthtech: {
    name: "HealthTech / MedTech",
    icon: Stethoscope,
    description: "Healthcare AI, digital health platforms, medical devices",
    templates: ["CareAI - Patient Management", "MedAssist - Clinical Decision Support", "HealthFlow - NHS Integration"]
  },
  ecommerce: {
    name: "E-commerce / Retail Tech",
    icon: ShoppingBag,
    description: "Retail platforms, marketplace solutions, inventory management",
    templates: ["ShopSmart - AI Recommendations", "RetailFlow - Inventory Optimization", "MarketPro - Marketplace Platform"]
  },
  saas: {
    name: "SaaS / B2B Software",
    icon: Laptop,
    description: "Business software, productivity tools, enterprise solutions",
    templates: ["TeamFlow - Collaboration Platform", "DataSync - Integration Platform", "AutomateHQ - Workflow Automation"]
  },
  foodbev: {
    name: "Food & Beverage",
    icon: ShoppingBag,
    description: "Innovative food products, sustainable packaging, new production methods",
    templates: ["GreenBite - Plant-Based Foods", "BrewCraft - Artisan Beverages", "FreshPack - Sustainable Packaging"]
  },
  manufacturing: {
    name: "Manufacturing & Products",
    icon: Building2,
    description: "New manufacturing processes, sustainable products, innovative materials",
    templates: ["EcoMake - Sustainable Manufacturing", "SmartBuild - Construction Innovation", "CleanMaterials - Eco Products"]
  },
  creative: {
    name: "Creative & Media",
    icon: Lightbulb,
    description: "Content innovation, new distribution models, creative services",
    templates: ["StoryStream - Content Platform", "ArtConnect - Creative Marketplace", "MediaFlow - Distribution Innovation"]
  },
  services: {
    name: "Professional Services",
    icon: Building2,
    description: "Innovative consulting, new service delivery, business solutions",
    templates: ["ConsultX - Advisory Platform", "TalentBridge - Recruitment Innovation", "ServicePro - B2B Solutions"]
  },
  social: {
    name: "Social Enterprise",
    icon: Lightbulb,
    description: "Impact-driven businesses, community solutions, sustainability",
    templates: ["ImpactFirst - Social Innovation", "CommunityHub - Local Solutions", "GreenFuture - Sustainability Venture"]
  },
  other: {
    name: "Other Innovative Sectors",
    icon: Lightbulb,
    description: "EdTech, PropTech, CleanTech, Fashion, Tourism, or other",
    templates: ["EduAI - Learning Platform", "PropFlow - Property Management", "GreenTech - Sustainability Platform"]
  }
};

const steps = [
  {
    id: 0,
    title: "Personal Profile & Credentials",
    description: "Essential founder information for your visa application",
    fields: [
      { name: "fullLegalName", label: "Full Legal Name (as on passport)", type: "text", required: true, help: "Enter your complete legal name exactly as it appears on your passport" },
      { name: "currentVisaStatus", label: "Current UK Visa Status", type: "select", required: true, options: [
        { value: "student-visa", label: "Student Visa (Tier 4 / Student Route)" },
        { value: "graduate-visa", label: "Graduate Visa" },
        { value: "skilled-worker", label: "Skilled Worker Visa" },
        { value: "family-visa", label: "Family Visa" },
        { value: "visitor", label: "Visitor Visa" },
        { value: "outside-uk", label: "Currently Outside UK" },
        { value: "eea-national", label: "EEA National / EU Settled Status" },
        { value: "other", label: "Other (specify in notes)" },
      ]},
      { name: "visaExpiryDate", label: "Visa Expiry Date", type: "text", required: true, help: "Format: DD/MM/YYYY - This determines application timeline urgency" },
      { name: "workAuthorizationDetails", label: "Current Work Authorization Details", type: "textarea", required: true, minLength: 30, help: "Can you work in the UK? Any restrictions? Hours limits? Self-employment allowed?" },
      { name: "educationBackground", label: "Educational Background (All Degrees)", type: "textarea", required: true, minLength: 100, help: "List ALL degrees: Degree Name, Institution, Location, Year, Grade. Example: MSc Data Science, Leeds Beckett University, UK, 2023, Distinction" },
      { name: "professionalCertifications", label: "Professional Certifications & Accreditations", type: "textarea", required: false, help: "AWS, Google Cloud, Microsoft, industry certifications, professional body memberships (BCS, IET, etc.)" },
      { name: "totalProfessionalExperience", label: "Total Years of Professional Experience", type: "number", required: true, help: "Include all relevant work experience since graduation" },
      { name: "industryExperience", label: "Industry-Specific Experience (years and details)", type: "textarea", required: true, minLength: 50, help: "How many years in your target industry? What specific projects/roles?" },
      { name: "technicalSkillsProficiency", label: "Core Skills & Proficiency Levels", type: "textarea", required: true, minLength: 100, help: "Rate 1-10 for each skill. Tech: Python (9/10), JavaScript (7/10). Non-tech: Operations (9/10), Sales (8/10), Product Development (8/10), Supply Chain (7/10), etc." },
      { name: "languagesSpoken", label: "Languages & Proficiency", type: "textarea", required: false, help: "List languages: English (Native/Fluent), other languages with proficiency level" },
      { name: "linkedInProfile", label: "LinkedIn Profile URL", type: "text", required: false, help: "Your LinkedIn profile URL for verification" },
      { name: "portfolioUrl", label: "Portfolio/GitHub/Website URL", type: "text", required: false, help: "Links to your work samples, GitHub, personal website" },
    ],
  },
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
    title: "Innovation & How It Works",
    description: "Endorsers need specifics about your innovation - what makes it genuinely new?",
    fields: [
      { name: "uniqueness", label: "What makes your solution different? (Be specific with measurable claims)", type: "textarea", required: true, minLength: 100, help: "Measurable advantages: 30% faster, 50% cheaper, first in UK, new process, sustainable approach, etc." },
      { name: "techStack", label: "Tools, Technology & Methods Used", type: "textarea", required: true, minLength: 50, help: "Tech: React, Python, AWS. Non-tech: Equipment, processes, suppliers, production methods, key partnerships. Be specific about HOW you do it." },
      { name: "dataArchitecture", label: "How Your Business/Product Works", type: "textarea", required: true, minLength: 100, help: "Tech: APIs, data flow, integrations. Non-tech: Production process, supply chain, service delivery model. Explain the operational mechanics." },
      { name: "aiMethodology", label: "Innovation Methodology (optional for non-tech)", type: "textarea", required: false, minLength: 50, help: "If using AI: specific algorithms. If not: describe your innovative process, method, recipe, or approach that competitors don't have." },
      { name: "complianceDesign", label: "Quality & Compliance Standards", type: "textarea", required: true, minLength: 100, help: "Food: HACCP, BRC. Healthcare: DCB0129. Manufacturing: ISO 9001. Services: professional certifications. GDPR. List all relevant standards." },
      { name: "patentStatus", label: "Intellectual Property Status", type: "textarea", required: true, minLength: 20, help: "Patent filed? Trademark registered? Trade secrets? Recipe/formula protection? Design registration? Brand protection? None yet?" },
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
      { name: "targetEndorser", label: "Target Endorsing Body", type: "textarea", required: true, minLength: 30, help: "Envestors, UKES, Innovator International, or Global Entrepreneurs Programme. Show you've researched their requirements." },
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
  fullLegalName: '',
  currentVisaStatus: '',
  visaExpiryDate: '',
  workAuthorizationDetails: '',
  educationBackground: '',
  professionalCertifications: '',
  totalProfessionalExperience: '',
  industryExperience: '',
  technicalSkillsProficiency: '',
  languagesSpoken: '',
  linkedInProfile: '',
  portfolioUrl: '',
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
  
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string; firstName?: string; lastName?: string; subscriptionTier?: string; subscriptionStatus?: string }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  // Check if user already has an active paid subscription (skip payment for them)
  const userHasActiveSubscription = user?.subscriptionStatus === 'active' && 
    user?.subscriptionTier && 
    ['basic', 'premium', 'enterprise', 'ultimate'].includes(user.subscriptionTier);
  
  // Free tier users can generate their basic plan directly (no payment needed)
  const isFreeTier = user?.subscriptionTier === 'free';
  const canGenerateDirectly = userHasActiveSubscription || isFreeTier;
  
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
  
  // Theme selection - check if theme was applied via URL param or localStorage
  const [themeApplied, setThemeApplied] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const themeFromUrl = urlParams.get('themeApplied') === 'true';
    const savedTheme = localStorage.getItem('selectedTheme');
    return themeFromUrl || !!savedTheme;
  });
  
  const selectedTheme = (() => {
    try {
      const saved = localStorage.getItem('selectedTheme');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  
  // Template selection states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Auto-fill from documents states
  const [showAutoFillDrawer, setShowAutoFillDrawer] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [extractionConfidence, setExtractionConfidence] = useState<Record<string, number>>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [showExtractedFields, setShowExtractedFields] = useState(false);
  const [extractionElapsed, setExtractionElapsed] = useState(0);
  const extractionEstimate = 120; // Estimated 2 minutes for full extraction
  
  // Fetch user's uploaded documents
  const { data: userDocuments = [] } = useQuery<any[]>({
    queryKey: ['/api/documents'],
  });
  
  // Check if current user is Ebuka (founder) - only they get access to their personal data
  const isFounderAccount = user?.email?.toLowerCase() === 'ebuka.umeh40@outlook.com';

  // Sync formData with savedData when it changes (fixes auto-save on tab switch)
  useEffect(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      setFormData(prev => {
        // Merge savedData with current formData, preserving any unsaved changes
        const merged = { ...defaultFormData, ...savedData, tier } as Record<string, any>;
        // Only update if there are actual differences
        const hasChanges = Object.keys(merged).some(key => prev[key] !== merged[key]);
        return hasChanges ? merged : prev;
      });
    }
  }, [savedData, tier]);

  useEffect(() => {
    localStorage.setItem('autosave_questionnaire-step', currentStep.toString());
  }, [currentStep]);

  // Reload data when tab regains focus (fixes data loss on tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload saved data from localStorage when tab becomes visible again
        const storageKey = 'autosave_questionnaire-form';
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(prev => ({ ...prev, ...parsed }));
            console.log('[Auto-save] Restored form data on tab focus');
          }
        } catch (e) {
          console.error('[Auto-save] Error restoring data on focus:', e);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Live extraction timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isExtracting) {
      setExtractionElapsed(0);
      interval = setInterval(() => {
        setExtractionElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setExtractionElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExtracting]);

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

  // Handle document extraction for auto-fill
  const handleExtractFromDocuments = async () => {
    if (selectedDocIds.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to extract data from.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExtracting(true);
    try {
      const response = await fetch('/api/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ documentIds: selectedDocIds }),
      });
      
      const data = await response.json();
      
      // Handle response - even if there's an error, try to use any extractedData provided
      if (data.extractedData && Object.keys(data.extractedData).length > 0) {
        setExtractedData(data.extractedData);
        setExtractionConfidence(data.confidence || {});
        setShowExtractedFields(true);
        
        // Show warning if there was an issue but we still have data
        if (data.warning) {
          toast({
            title: "Partial Data Available",
            description: data.warning,
          });
        } else {
          toast({
            title: "Data Extracted",
            description: `Found ${Object.keys(data.extractedData).length} fields to auto-fill. Review and apply below.`,
          });
        }
      } else if (data.error) {
        // Real error with no fallback data
        toast({
          title: "Extraction Issue",
          description: "Your documents are being processed. Please re-upload them to enable auto-fill extraction.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Data Found",
          description: "Could not extract any relevant information from the selected documents. Try uploading clearer documents.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Extraction Issue",
        description: "Please re-upload your documents to enable auto-fill. Legacy documents need to be refreshed.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply extracted data to form - robust version with immediate save
  const handleApplyExtractedData = () => {
    if (!extractedData) return;
    
    const updatedData = { ...formData };
    let appliedCount = 0;
    const appliedFields: string[] = [];
    
    for (const [field, value] of Object.entries(extractedData)) {
      if (value && typeof value === 'string' && value.trim()) {
        updatedData[field] = value;
        appliedFields.push(field);
        appliedCount++;
      }
    }
    
    // Update form state immediately
    setFormData(updatedData);
    
    // Save all fields to localStorage in one batch (more reliable)
    saveAllFields(updatedData);
    
    // Also save each field individually for redundancy
    for (const field of appliedFields) {
      saveField(field, updatedData[field]);
    }
    
    // Debug log for troubleshooting
    console.log('[Auto-fill] Applied fields:', appliedFields);
    console.log('[Auto-fill] Sample values:', appliedFields.slice(0, 3).map(f => `${f}: ${updatedData[f]?.substring(0, 50)}...`));
    
    setShowAutoFillDrawer(false);
    setExtractedData(null);
    setSelectedDocIds([]);
    setShowExtractedFields(false);
    
    toast({
      title: "Fields Updated",
      description: `Applied ${appliedCount} field${appliedCount !== 1 ? 's' : ''} from your documents. Data saved automatically.`,
    });
  };

  // Toggle document selection
  const handleToggleDocument = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  // Get field label by name - comprehensive mapping for all document types
  const getFieldLabel = (fieldName: string): string => {
    // First check steps
    for (const step of steps) {
      const field = step.fields.find(f => f.name === fieldName);
      if (field) return field.label;
    }
    
    // Comprehensive field labels for all document types
    const fieldLabels: Record<string, string> = {
      // Passport & ID
      fullLegalName: 'Full Legal Name',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      passportNumber: 'Passport Number',
      passportExpiry: 'Passport Expiry Date',
      placeOfBirth: 'Place of Birth',
      
      // Education
      educationBackground: 'Educational Background (All Degrees)',
      degreeClassification: 'Degree Classification',
      educationDates: 'Education Dates',
      thesis: 'Thesis/Dissertation',
      
      // Employment
      founderWorkHistory: 'Relevant Work History',
      totalProfessionalExperience: 'Total Years of Professional Experience',
      industryExperience: 'Industry-Specific Experience (years and details)',
      employerReferences: 'Employer References',
      keyAchievements: 'Key Career Achievements',
      
      // Certifications
      professionalCertifications: 'Professional Certifications & Accreditations',
      technicalSkillsProficiency: 'Core Skills & Proficiency Levels',
      
      // English Test
      englishTestType: 'English Test Type',
      englishTestScore: 'English Test Score (All Components)',
      englishTestDate: 'English Test Date',
      englishTestExpiry: 'English Test Expiry',
      englishTestReferenceNumber: 'Test Reference Number',
      
      // Bank Statements
      bankAccountBalance: 'Bank Account Balance',
      bankAccountHolder: 'Account Holder Name',
      bankName: 'Bank Name',
      fundingEvidence: 'Funding Evidence',
      transactionSummary: 'Transaction Summary',
      
      // Endorsement
      targetEndorser: 'Target Endorsing Body',
      endorsementStatus: 'Endorsement Status',
      endorsementDate: 'Endorsement Date',
      endorsementConditions: 'Endorsement Conditions',
      contactPointsStrategy: '6 Contact Points Strategy',
      
      // Business Overview
      businessName: 'Business Name',
      industry: 'Industry',
      problem: 'What problem does your business solve?',
      uniqueness: 'What makes your solution different? (Be specific with measurable claims)',
      technology: 'Technology',
      marketSize: 'Market Size Calculation (TAM/SAM/SOM)',
      targetCustomers: 'Target Customers',
      
      // Financial
      monthlyProjections: '36-Month Monthly Cashflow',
      fundingSources: 'Detailed Funding Sources',
      detailedCosts: 'Detailed Cost Breakdown',
      revenueModel: 'Revenue Model',
      year1Revenue: 'Year1 Revenue',
      year3Revenue: 'Year3 Revenue',
      breakEvenDate: 'Break-Even Date',
      
      // Market & Competition
      competitors: 'List 5+ Named Competitors',
      competitiveDifferentiation: 'Your Measurable Competitive Advantage',
      customerInterviews: 'Customer Discovery Interviews (20-30 minimum)',
      willingnessToPay: 'Willingness to Pay Evidence',
      
      // Regulatory
      regulatoryRequirements: 'All Regulatory Requirements',
      complianceTimeline: 'Compliance Timeline',
      complianceBudget: 'Total Compliance Budget (£)',
      
      // Growth & Team
      hiringPlan: 'Detailed Hiring Plan',
      ukJobCreation: 'Uk Job Creation',
      specificRegions: 'Specific Geographic Targets',
      internationalPlan: 'International Expansion (optional)',
      
      // Evidence
      evidenceOfProgress: 'Evidence Of Progress',
      lettersOfIntent: 'Letters of Intent',
      partnerships: 'Partnerships',
    };
    
    return fieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
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
        // Free tier users always get 'free' tier plan, paid users get the form's selected tier
        const effectiveTier = isFreeTier ? 'free' : (formData.tier || 'premium');
        const data = {
          tier: effectiveTier,
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
          
          // Theme settings from localStorage
          themeId: selectedTheme?.themeId || null,
          themePrimaryColor: selectedTheme?.primaryColor || null,
          themeSecondaryColor: selectedTheme?.secondaryColor || null,
          themeFont: selectedTheme?.font || null,
          themeAppliedAt: selectedTheme ? new Date() : null,
          
          // Custom cover image (Canva uploads)
          backgroundImage: selectedTheme?.backgroundImage || null,
          useFullCoverImage: selectedTheme?.useFullCoverImage || false,
          textElements: selectedTheme?.textElements ? JSON.stringify(selectedTheme.textElements) : null,
        };

        const response = await fetch('/api/questionnaire/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
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
      patentStatus: "UK Patent Application GB2501234.5 filed (November 2025): 'Method and system for industry-specific financial forecasting using adaptive machine learning models.' Claims cover: (1) Industry-specific feature engineering, (2) Adaptive model selection based on business type, (3) Anomaly detection with probabilistic alerting. Patent search conducted (£2,500 Marks & Clerk LLP). No prior art conflicts identified. PCT (international) filing planned Month 12 (£8,000 budget).",
      founderEducation: "MSc Data Science (Distinction) - University of Leeds (2020-2021). Dissertation: 'Predictive Analytics for SME Cash Flow Management' (87% grade). BSc Computer Science (First Class Honours) - University of Manchester (2016-2019). Final project: Inventory management SaaS (deployed to 5 retail clients). AWS Certified Solutions Architect - Professional (2023). AWS Certified Machine Learning - Specialty (2022). Certified ScrumMaster (CSM) - Scrum Alliance (2021). Part-qualified Financial Risk Manager (FRM Part I - GARP, 2024).",
      founderWorkHistory: "Data Analyst, FinTech Innovations Ltd (2021-2023, Manchester): Analyzed 450K+ business transactions for SME lending risk models. Built cash flow risk scoring achieving 86% default prediction accuracy. Worked directly with 100+ SME clients across retail, professional services, hospitality sectors. Data Scientist, Qalhata Solutions (2019-2021, Remote): Led 4-person team delivering ML models for healthcare, finance, retail. Built 23 production ML models serving 450K+ users. Led NHS Procurement Intelligence project (£8.2M annual value delivered). Freelance Data Science Consultant (2020-2021): 8 client projects, £45K revenue. Experience in customer acquisition, pricing, delivery.",
      founderAchievements: "NHS Transformation Award 2024 for data-driven procurement innovation. Published 2 peer-reviewed papers: IEEE Conference on Healthcare Data Science (2023), Healthcare Data Science Journal (2024). Delivered £8.2M measurable value in NHS procurement project. Built SaaS applications serving 450K+ users. 14 paying customers acquired for FinFlow (£8,400 revenue). 3 signed LOIs worth £182K. 23 production ML models deployed. Guest lecturer: University of Leeds Data Science MSc (2023, 2024).",
      relevantProjects: "SME Lending Risk Models (FinTech Innovations): Analyzed 450K business transactions, built cash flow-based default prediction (86% accuracy). Direct SME experience with 100+ clients. Inventory Management SaaS (Freelance, 2019): Built for 5 retail clients, £180/month MRR, 92% satisfaction. Full product lifecycle: ideation → paying customers → support. NHS Procurement Intelligence (Qalhata Solutions): £450M annual spend analytics, delivered £8.2M value. Experience with large-scale data, stakeholder management, project delivery.",
      funding: "125000",
      fundingSources: "£85,000 Personal Savings (accumulated 2019-2025 from employment). £30,000 Family Loan (signed agreement, 0% interest, 5-year repayment from Month 13). £10,000 Friends & Family Investment (convertible note, 20% discount on Series A). Total: £125,000.",
      monthlyProjections: "YEAR 1 MONTHLY: Month 1: £0 revenue, £8,500 costs. Month 2: £600 revenue (10 customers), £9,200 costs. Month 3: £1,800 (30 customers), £12,500. Month 4: £3,000 (50), £10,800. Month 5: £4,800 (80), £11,200. Month 6: £7,200 (120), £11,500. Month 7: £9,600 (160), £14,800. Month 8: £12,600 (210), £12,200. Month 9: £16,200 (270), £13,500. Month 10: £21,000 (350), £13,200. Month 11: £27,000 (450), £13,800. Month 12: £33,000 (550), £14,200. YEAR 1 TOTAL: £136,800 revenue, £145,400 costs. Year 1 Net: -£8,600 (profitable Month 8). YEAR 2: Grows to £1,067,400 revenue, £855,200 costs, £212,200 profit. YEAR 3: £2,857,000 revenue, £1,728,800 costs, £1,128,200 profit. 3-YEAR CUMULATIVE: £4,061,200 revenue, £2,729,400 costs, £1,331,800 profit.",
      customerAcquisitionCost: "180",
      lifetimeValue: "3524",
      paybackPeriod: "3",
      detailedCosts: "Development & Product (Year 1: £42,000): Founder salary £24K, Contractor developer £12K, AWS hosting £3.6K, Tools/software £2.4K. Regulatory & Compliance (Year 1: £16,000): FCA registration £8K, Cyber Essentials Plus £3K, Legal/incorporation £2K, Insurance £3K. Sales & Marketing (Year 1: £28,500): Content marketing £8K, Paid ads £12K, Events/networking £4.5K, Website £2K, Email tools £2K. Operations (Year 1: £8,900): Accounting £3K, Office/coworking £2.4K, Travel £2K, Misc £1.5K. Team (Year 1: £50,000, months 7-12): Sales & CS Manager £25K (6 months), Part-time Marketing £5K. TOTAL YEAR 1: £145,400. YEAR 2: £855,200 (team grows to 13). YEAR 3: £1,728,800 (team 26).",
      competitors: "1. FLUIDLY (£49/month, 8,000 customers): AI-powered, Xero integration, larger SMEs (£1M-£10M revenue). Strengths: Brand recognition, funding (£12M Series A). Weaknesses: Expensive, slow setup (3-5 days), generic ML models (76% accuracy vs our 94%). 2. FLOAT (£75/month, 12,000 customers): Scenario planning focus, QuickBooks/Xero. Strengths: Established (founded 2011), beautiful UI. Weaknesses: Manual data entry required, 73% forecast accuracy, limited automation. 3. FUTRLI (£60-£120/month): Accountant-focused, reporting heavy. Strengths: Strong accounting partnerships. Weaknesses: Complex UI, 78% accuracy, requires accountant setup. 4. PULSE (£15-£45/month): Budget-focused startups. Strengths: Low price. Weaknesses: Basic forecasting (no ML), manual spreadsheets. 5. DRYRUN (£29/month): US-focused, scenario modeling. Strengths: Collaborative features. Weaknesses: No UK Open Banking, manual sync. 6. CAUSAL (£50-£150/month): Spreadsheet replacement. Strengths: Flexible modeling. Weaknesses: Steep learning curve, not SME-focused. 7. BRIXX (£20-£70/month): UK small businesses. Strengths: Affordable, UK-focused. Weaknesses: No AI, manual forecasts, limited integrations.",
      competitiveDifferentiation: "MEASURABLE ADVANTAGES: (1) Forecast Accuracy: 94% vs Fluidly 76%, Float 73%, Futrli 78% (validated 4-month holdout, n=45 beta users). 29% better than best competitor. (2) Setup Speed: 12 minutes (Open Banking auto-sync) vs 3-7 days manual data entry (Float, Fluidly). Measured with 45 beta users. (3) Early Warning: 18-day advance shortfall alerts vs 7-10 days (competitors). Patent pending. (4) Price: £60/month vs Fluidly £49, Float £75, Futrli £60-£120. 40% cheaper than Fluidly. (5) Partnership Model: White-label for accounting firms (unique). 3 LOIs signed, competitors don't offer. (6) Industry-Specific Models: 23% better retail accuracy, 21% hospitality, 18% professional services. Competitors use generic models.",
      customerInterviews: "32 customer discovery interviews conducted (October-November 2025). 12 independent retailers, 8 professional services (consultants, lawyers), 7 hospitality (restaurants, pubs), 5 construction/trades. KEY FINDINGS: (1) Cash Flow Anxiety: 29/32 check bank balance daily, 24/32 'constantly worried' about unexpected shortfalls. (2) Existing Tools Inadequate: 18/32 use spreadsheets ('time-consuming, error-prone'), 8/32 use accounting software forecasts ('inaccurate'), 6/32 have no forecasting. (3) Willingness to Pay: £40-£80/month acceptable for 27/32. £100+ 'too expensive' for microbusinesses. (4) Critical Features: Advance warning (32/32 want), bank integration (28/32), scenario planning (21/32), mobile app (19/32). (5) Trust Barriers: Want data security guarantees, accounting software integration, proven accuracy before switching.",
      lettersOfIntent: "3 SIGNED LETTERS OF INTENT (Total £182K Year 1 potential): (1) Baker Thompson Accountants (Birmingham, 180 SME clients): LOI to pilot FinFlow with 20 clients (Month 3-6), potential £60,600 (20 clients × £60/month × 12 months × 90% conversion). Signed Nov 2025. (2) Henderson & Associates (Manchester, 120 clients): LOI for white-label partnership, 15-client pilot. Potential £32,400 first year. Signed Nov 2025. (3) Sterling Financial Services (London, 220 clients): LOI for evaluation, 10-client pilot Month 4. Potential £21,600. Signed Nov 2025. Combined 45-client pilots = validation pathway to 520-client total addressable base.",
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
      targetEndorser: "PRIMARY TARGET: ENVESTORS. RATIONALE: (1) Sector alignment - FinTech is core focus (endorsed Revolut, Monzo, TransferWise). (2) Innovation fit - Our AI forecasting (94% accuracy vs 73% industry) meets 'significantly different' requirement. Patent pending, 2.8M transaction training dataset. (3) Market validation - 45 beta users, £8.4K revenue, 3 LOIs (£182K) exceeds typical applicant. (4) Requirements research: Business plan (50-80 pages), 3 letters of support, evidence portfolio. Scoring 0-10 scale: Innovation 9/10, Viability 9/10, Scalability 8/10. Approval rate ~45%. (5) Post-endorsement benefits: 2,000+ founder network, £12B+ investor access, mentorship, quarterly events. APPLICATION TIMELINE: Month 1-2: EOI submission. Month 3-4: Stage 2 business plan (use FinFlow AI to generate). Month 5-6: Technical assessment, endorsement decision. BACKUP: Innovator International (65% approval, 4-6 weeks, £1,500 fee). TERTIARY: GEP - Global Entrepreneur Programme (high-growth focus, strong team credentials emphasis).",
      contactPointsStrategy: "6+ CONTACT POINTS (3-Year Engagement): YEAR 1 (3 contacts): CP1 (Month 3): Initial post-endorsement meeting (60min, in-person Envestors office). Agenda: business walkthrough, mentor matching, Year 1 metrics. CP2 (Month 6): Q2 progress report + video call (45min). Deliverable: 5-page PDF (customers, revenue, team vs targets). CP3 (Month 12): Year 1 annual review (90min, in-person). Deliverable: 15-page annual report (P&L, cashflow, team roster, 4 hires proof, product roadmap, 3-5 case studies). YEAR 2 (2 contacts): CP4 (Month 18): Mid-year check-in + Envestors cohort event participation (30min 1-on-1 + 3hr event). Deliverable: 5-page progress report, event attendance certificate. CP5 (Month 24): Year 2 annual review + strategic planning (120min). Deliverable: 20-page annual report (audited financials, 13 employees proof, 2,215 customers, NPS, churn, market share, Year 3 plan). YEAR 3 (2 contacts): CP6 (Month 30): Progress review + Envestors speaker (45min review + 60min keynote). Topic: 'Scaling FinTech SaaS 0-£2M ARR in 30 months'. CP7 (Month 36, BONUS): Final 3-year review + ILR endorsement support (90min). Deliverable: 25-page final report (3-year journey, all KPIs, 26 employees, £2.86M ARR, audited financials, customer impact stories, media coverage). Request ILR endorsement letter. PROACTIVE ENGAGEMENT: Quarterly email updates (12 total), Envestors event attendance (10+ events), mentorship (2-3 incoming visa holders), Slack community active.",
      experience: "TECHNICAL EXPERTISE: MSc Data Science (Distinction - Leeds), BSc Computer Science (First Class - Manchester). 3+ years production ML (23 models deployed, 450K+ users). 5+ years full-stack development. AWS Certified Solutions Architect + ML Specialty. Built SaaS for 450K+ users. FINANCIAL TECHNOLOGY: 2.5 years FinTech Innovations (analyzed 450K+ business transactions, built cash flow risk models 86% accuracy). Deep SME financial challenges understanding. FCA Financial Services Training (2024). Part-qualified FRM. BUSINESS & COMMERCIAL: Led teams delivering £8.2M value (NHS). Closed 14 customers (£8.4K revenue). 3 LOIs (£182K). 100% retention (45 beta users). Strong communication (80+ industry presentations). Built 36-month financial models. LEADERSHIP: Led 4-person data science team. Trained 12 analysts. Certified ScrumMaster. Hired/managed technical teams. Delivered 30+ projects on time/budget. NHS Transformation Award 2024. ENTREPRENEURIAL: Built inventory SaaS (5 clients, £180/month MRR). Freelance consulting (8 projects, £45K). Full lifecycle experience: ideation → customers → support. Financial prudence: bootstrapped £125K. GAPS ADDRESSED: (1) Limited sales experience → Sales & CS Manager hired Month 7, sales training completed 2024, 3 sales mentors. (2) No prior CEO experience at scale → Advisors with scaling experience, YC Startup School, Envestors mentorship. (3) Limited marketing → Part-time Marketing Specialist Month 9, SaaS marketing courses (Reforge), marketing advisor. UNIQUE STRENGTHS: (1) Technical + commercial hybrid (ML Advanced + business execution). (2) Domain expertise (3+ years exact customer segment). (3) Execution track record (£8.2M delivered, 23 production models). (4) Resourcefulness (£8.4K revenue, £0 marketing spend). (5) Learning agility (FCA training, sales methodology, rapid skill acquisition).",
      revenue: "3-TIER SAAS SUBSCRIPTION: BASIC (£60/month, £600/year annual): 90-day forecast, 1 bank, 1 user, anomaly alerts, basic scenarios, mobile app, standard support (48hr). Target: 70% customers (Year 1-3). PROFESSIONAL (£120/month, £1,200/year annual, Month 13 launch): Everything in Basic PLUS 180-day forecast, 3 banks, 5 users, Xero/QuickBooks/Sage integration, advanced scenarios, industry benchmarks, SMS alerts, priority support (24hr), weekly reports, API (50 calls/day). Target: 25% customers (Year 2-3). ENTERPRISE (£250/month, £2,700/year annual, Month 31 launch): Everything in Professional PLUS 365-day forecast, unlimited banks/users, multi-entity consolidation, dedicated account manager, custom integrations, white-label, SSO/SAML, premium support (4hr, phone), quarterly reviews, unlimited API, 10-year data retention. Target: 5% customers (Year 3). REVENUE MIX: Year 1 (660 customers, all Basic): £19,600 MRR, £475,200 ARR. Year 2 (2,215 customers, 75% Basic, 25% Professional): £166,140 MRR, £1,993,680 ARR, £75/month blended ARPU. Year 3 (4,757 customers, 70% Basic, 25% Professional, 5% Enterprise): £402,100 MRR, £4,825,200 ARR, £84.50/month ARPU. ADD-ONS (Year 2+): Premium Support SLA (£30/month, 10% Professional customers), Extra Users (£20/seat, 15% Professional), API Access for Basic (£50/month, 5% Basic), White-Label Partnership (£100/firm + £5/client/month, 15 firms Year 3). Year 3 Add-On Revenue: £26,350/month (£316,200/year). ONE-TIME: Enterprise Onboarding (£500), Implementation Services (£1,500-£3,000). Year 3: £139,000. 3-YEAR REVENUE: £4,624,200. UNIT ECONOMICS: LTV £3,524 (54 months × £75 ARPU × 87% margin). CAC: £180 (Y1) → £140 (Y3). LTV:CAC: 19.6:1 (Y1) → 25.2:1 (Y3). Payback: 3.5 months (Y1) → 2.2 months (Y3). NRR: 105% (Y2) → 115% (Y3). Churn: 5% (Y1) → 2.5% (Y3).",
    };
    
    setFormData(testData);
    toast({
      title: "Test Data Loaded",
      description: "All fields filled with FinFlow AI example data. You can now test the submission flow.",
    });
  };

  // Pre-fill with comprehensive demo template data - ALL fields filled with realistic examples
  const handleEbukaUltimatePlanAutoFill = () => {
    const userName = user?.displayName || user?.firstName || user?.email?.split('@')[0] || 'James Alexander Thompson';
    const templateNotice = "[TEMPLATE - Replace with your own details] ";
    const demoData: Record<string, string> = {
      tier: 'premium',
      // STEP 1: Personal Profile & Credentials - ALL FIELDS WITH CORRECT NAMES
      fullLegalName: userName,
      currentVisaStatus: "graduate-visa",
      visaExpiryDate: "15/06/2026",
      workAuthorizationDetails: "Graduate Visa holder with full work authorization in the UK. Permitted to work unlimited hours in any sector including self-employment. No restrictions on starting or running a business. Visa valid until June 2026, providing 7+ months runway for Innovator Founder Visa application and transition. Previously held Tier 4 Student Visa (2021-2024) with clean immigration history and no visa refusals.",
      educationBackground: "MSc Data Science, University of Leeds, UK, 2024, Distinction (78% overall). Dissertation: 'Machine Learning Approaches for Financial Time Series Prediction' - developed novel LSTM architecture achieving 94% accuracy on cash flow forecasting. Modules included: Advanced Machine Learning, Big Data Analytics, Statistical Modelling, Business Intelligence. BSc Computer Science, University of Manchester, UK, 2022, First Class Honours (72% average). Final year project: 'Automated Invoice Processing System using Computer Vision' - deployed in 3 SME businesses. A-Levels: Mathematics (A*), Computer Science (A), Physics (A) - Manchester Grammar School, 2019.",
      professionalCertifications: "AWS Certified Solutions Architect - Associate (2023, valid until 2026). AWS Certified Machine Learning - Specialty (2024, valid until 2027). Google Cloud Professional Data Engineer (2023, valid until 2025). Certified ScrumMaster (CSM) - Scrum Alliance (2022, active). FCA Financial Services Training Certificate (2024). Part-qualified Financial Risk Manager (FRM) - GARP (Level 1 passed 2024). Python for Finance Certificate - DataCamp (2022). Member of British Computer Society (BCS) since 2022. Member of Institution of Engineering and Technology (IET) since 2023.",
      totalProfessionalExperience: "6",
      industryExperience: "4 years in FinTech and financial services technology. 2021-2023: Data Analyst at Barclays Bank UK (2 years) - built credit risk models, analyzed 2M+ transactions monthly, reduced fraud detection time by 35%. 2023-2024: Senior Data Scientist at FinTech Innovations Ltd (1.5 years) - led team of 4, deployed 12 ML models to production, processed 450K+ business transactions. 2024-present: Founder/CTO at FinFlow AI (1 year) - building AI-powered cash flow forecasting for UK SMEs. Deep understanding of SME financial challenges, Open Banking APIs, FCA regulatory requirements, and accounting software integrations (Xero, QuickBooks, Sage).",
      technicalSkillsProficiency: "Python (9/10) - 5 years production experience, pandas, scikit-learn, TensorFlow, FastAPI. SQL (9/10) - PostgreSQL, MySQL, complex queries, optimization, 4 years. JavaScript/TypeScript (8/10) - React, Node.js, full-stack development, 3 years. Machine Learning (9/10) - regression, classification, time series, NLP, 4 years research + production. Cloud Platforms - AWS (8/10), GCP (7/10), Azure (6/10). Data Engineering (8/10) - ETL pipelines, Airflow, Spark. DevOps (7/10) - Docker, CI/CD, Kubernetes basics. API Development (8/10) - REST, GraphQL, Open Banking APIs.",
      languagesSpoken: "English (Native/Fluent - IELTS 8.5). French (Intermediate - B2 level, lived in Paris 6 months). Spanish (Basic - A2 level, conversational). Mandarin (Beginner - A1 level, currently learning for China market expansion).",
      linkedInProfile: "https://linkedin.com/in/jamesathompson-fintech",
      portfolioUrl: "https://github.com/jthompson-fintech | https://jamesathompson.dev | https://finflow-ai.co.uk",
      // STEP 2: Business Concept & Innovation
      businessName: "FinFlow AI",
      industry: "FinTech / AI-powered Financial Technology / B2B SaaS",
      problem: "UK SMEs face a critical cash flow crisis: 50,000 businesses fail annually due to poor cash flow management, representing £12.8 billion in lost economic value. Current solutions fail SMEs: (1) Spreadsheets are manual, error-prone, and lack predictive capability - used by 67% of SMEs but only 23% accuracy in forecasting. (2) Accounting software forecasts (Xero, QuickBooks) use simple linear projections with 71-76% accuracy, missing seasonal patterns and anomalies. (3) Enterprise solutions (Fluidly, Float) cost £75-150/month, require 3-7 day setup, and are designed for larger businesses. (4) Bank overdrafts and emergency loans carry 15-25% APR, costing SMEs £2.3B annually in preventable interest. The target market - 186,000 UK SMEs with £200K-£10M revenue - desperately needs affordable, accurate, automated cash flow intelligence with genuine advance warning of shortfalls.",
      innovationStage: "mvp-complete",
      productStatus: "FULLY OPERATIONAL MVP - LIVE IN PRODUCTION (September 2025). Platform URL: finflow-ai.co.uk (live, accepting customers). Demo: Interactive demo available at demo.finflow-ai.co.uk. GitHub: github.com/finflow-ai/platform (private repository, demo access available for endorser review).\n\n" +
        "PROPRIETARY AI ARCHITECTURE - WORLD'S FIRST MULTI-LLM VISA ORCHESTRATOR: Unlike any existing solution, our platform features an 'Expert AI Command Orchestrator' - a novel architecture integrating OpenAI GPT-4 AND Google Gemini simultaneously. This dual-LLM approach provides: (a) Redundancy - if one AI provider fails, the other maintains service, (b) Quality validation - responses cross-checked between models, (c) Specialized routing - compliance questions to GPT-4 (stronger reasoning), creative content to Gemini (faster generation). Four specialized AI agents work in concert: SAGE (Compliance Agent) - validates against November 2025 Home Office requirements, NOVA (Innovation Agent) - assesses uniqueness and market differentiation, STERLING (Financial Agent) - analyzes viability and projections, ATLAS (Growth Agent) - evaluates scalability potential. This orchestration methodology is patent-pending.\n\n" +
        "UNIQUE TECHNICAL INNOVATIONS: (1) REAL-TIME COMPLIANCE INTELLIGENCE GRAPH - A dynamic knowledge graph mapping user inputs directly to 47 specific Home Office visa criteria (updated November 2025). Visual dashboard shows compliance score (0-100%) with specific improvement recommendations. No other tool provides this granular mapping. (2) EVIDENCE STRENGTH SCORING SYSTEM - Proprietary algorithm analyzing 8 critical endorser rejection reasons (identified through analysis of 200+ rejection letters). Provides actionable feedback: 'Your traction evidence scores 3/10 - add customer testimonials, revenue proof, or LOIs to improve.' (3) INDUSTRY-ADAPTIVE INTAKE SYSTEM - Questionnaire dynamically adjusts based on 6 industry sectors (Technology, Healthcare, Finance, Retail, Manufacturing, Services), asking sector-specific questions about regulatory requirements, market dynamics, and competitive landscapes. (4) SMART DOCUMENT GENERATION ENGINE - AI-powered templates that generate personalized, endorser-ready documents including: 60-80 page business plans, financial projection spreadsheets, pitch decks, personal statements, supporting evidence portfolios. Documents formatted to exact endorsing body specifications.\n\n" +
        "PRODUCTION-READY FEATURE SET: User Authentication - Dual-method (email/password + Google OAuth 2.0) with Cloudflare Turnstile bot protection, email verification, secure password reset. Payment Processing - Full Stripe integration with checkout, webhooks, subscription management, promo codes, referral system. 5-Tier Access Control - Bulletproof system (Free/Basic/Premium/Enterprise/Ultimate) with real-time access verification, upgrade prompts, and zero-loophole security. Data Persistence - PostgreSQL database (Neon serverless) with Drizzle ORM, auto-save functionality, progress restoration across sessions. Export Capabilities - PDF generation (jspdf), Word documents (docx library), QR code mobile transfer for cross-device access. UI/UX Excellence - Mobile-responsive design, dark mode support, accessibility compliance (WCAG 2.1), professional animations (Framer Motion).\n\n" +
        "TECHNICAL ARCHITECTURE: Frontend: React 18.3, TypeScript 5.0, TailwindCSS 4.0, shadcn/ui component library, Wouter routing, TanStack Query v5 for state management. Backend: Node.js 20 LTS, Express.js 4.21, RESTful API architecture, session-based authentication with PostgreSQL store. Database: PostgreSQL 16 (Neon serverless), Drizzle ORM with type-safe queries, optimized indexes for performance. AI Integration: OpenAI GPT-4 Turbo API, Google Gemini 1.5 Pro API, custom prompt engineering with immigration-specific context injection. Security: HTTPS encryption, bcrypt password hashing, CSRF protection, rate limiting, input sanitization. DevOps: Automated CI/CD, environment variable management, error tracking, usage analytics.\n\n" +
        "MEASURABLE PLATFORM METRICS (30-day post-launch): 99.8% uptime (exceeds 99.5% SLA target), <200ms average API response time, 47 registered users organically acquired (£0 marketing spend), 156 tool interactions tracked, 23-minute average session duration (indicates high engagement), 68% return user rate, 12 complete business plans generated. Platform handles concurrent users without degradation.\n\n" +
        "COMPETITIVE ADVANTAGE SUMMARY: This is not a template library or generic visa guide - it is a sophisticated AI-powered platform purpose-built for the Innovator Founder Visa route. The combination of multi-LLM orchestration, real-time compliance mapping, evidence strength scoring, and industry-adaptive intelligence represents a genuine technological innovation in the immigration technology space. No comparable solution exists in the UK market.",
      existingCustomers: "Platform launched November 2025. Current users: 47 registered accounts (free tier exploration). 12 users actively using Business Plan Generator tool. 3 beta testers providing detailed feedback (documented). Letters of Interest received from: (1) Lagos Immigration Consultancy (Nigeria) - interested in white-label partnership, (2) Tech Entrepreneur Network Manchester - interested in recommending to members, (3) Leeds Beckett University International Office - exploring student entrepreneur support integration.",
      tractionEvidence: "47 registered users (first 30 days). 12 active business plan generations. 156 tool interactions tracked. 3 Letters of Interest representing potential £24K Year 1 partnership revenue. User feedback: 'Finally, an affordable alternative to expensive lawyers' - Beta User, Nigeria. 'The AI document review saved me hours of work' - Beta User, India. Platform uptime: 99.8%. Average session duration: 23 minutes. Return user rate: 68%. SEO: Ranking top 10 for 'UK Innovator Founder Visa tools' within 4 weeks.",
      uniqueness: "UNIQUE INNOVATIONS: (1) FIRST comprehensive AI-powered Innovator Founder Visa platform - no existing platform provides 109+ tools specifically for this visa route. (2) Multi-LLM architecture (OpenAI GPT-4 + Google Gemini) for enhanced response quality. (3) Real-time compliance intelligence graph mapping directly to Home Office criteria (November 2025 guidance). (4) Expert AI Orchestrator with 4 specialized agents (Sage Compliance, Nova Innovation, Sterling Financial, Atlas Growth). (5) 90%+ cost reduction: £15-129 vs £3,000-15,000 traditional services. (6) 24/7 instant access vs weeks of lawyer waiting time. (7) Industry-adaptive intake system analyzing 6 major sectors. (8) Evidence Strength Scoring system targeting the 8 critical endorser rejection reasons. (9) Self-service model eliminating geographic constraints - global accessibility. (10) Patent-pending methodology for visa application compliance scoring.",
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
      monthlyProjections: "YEAR 1 MONTHLY PROJECTIONS: Month 1: £0 revenue, £800 costs (hosting, domains, insurance). Month 2: £150 (10 Basic subscribers), £1,200 costs. Month 3: £870 (30 subs), £1,500 costs. Month 4: £1,450 (50 subs), £1,800 costs. Month 5: £2,320 (80 subs), £2,200 costs (marketing). Month 6: £3,480 (120 subs), £2,800 costs. Month 7: £4,930 (170 subs + 5 Premium), £3,200 costs. Month 8: £6,670 (200 Basic + 15 Premium + 2 Enterprise), £3,500 costs. Month 9: £8,700 (230 Basic + 25 Premium + 5 Enterprise), £4,000 costs. Month 10: £11,020 (260 Basic + 35 Premium + 8 Enterprise), £4,500 costs. Month 11: £13,630 (290 Basic + 45 Premium + 12 Enterprise), £5,200 costs. Month 12: £16,530 (320 Basic + 55 Premium + 15 Enterprise), £5,800 costs. YEAR 1 TOTALS: £69,890 revenue, £36,500 costs, £33,390 profit. YEAR 2: £247,200 revenue, £98,400 costs, £148,800 profit (1,200 customers). YEAR 3: £612,000 revenue, £195,000 costs, £417,000 profit (2,500 customers). 3-YEAR CUMULATIVE: £929,090 revenue, £329,900 costs, £299,190 profit.",
      customerAcquisitionCost: "25",
      lifetimeValue: "237",
      paybackPeriod: "2",
      detailedCosts: "YEAR 1 DETAILED COSTS (£36,500): Infrastructure (£7,200/year): Hosting/servers £2,400, Domain/SSL £200, Database £1,200, AI API costs £3,000, Email service £400. Operations (£8,500/year): Professional indemnity insurance £2,000, Legal/compliance £2,500, Accounting £1,500, Office/coworking £1,500, Travel/networking £1,000. Marketing (£12,000/year): Content marketing £3,000, SEO tools £1,200, Paid advertising £5,000, Events/conferences £2,000, PR £800. Development (£6,000/year): Contractor support £4,000, Tools/software £1,500, Testing £500. Contingency (£2,800): 10% buffer. YEAR 2 (£98,400): Adds: Part-time developer (£24K), Customer success (£18K), Marketing manager (£18K). YEAR 3 (£195,000): Full team: Founder (£45K), 2 developers (£90K), Marketing (£30K), CS (£30K). REGULATORY COSTS INCLUDED: OISC partnership referral fees (£2K/year), Cyber Essentials (£3K Year 1), Legal reviews (£2.5K/year).",
      competitors: "DIRECT COMPETITORS (5+ Named): (1) RELOGATE.ME: Innovator Founder Visa focus, business plan development, endorser selection. Strengths: Established brand, human consultants. Weaknesses: High cost (£2,000+), limited AI integration, slow turnaround. Our advantage: 90% cheaper, instant access, AI-powered. (2) VISACONNECT.COM: UK visa advice, business plan preparation. Strengths: Wide visa coverage. Weaknesses: Generic templates, not specialized, £1,500+ cost. Our advantage: 109 specialist tools vs 10 generic. (3) JOBBATICAL.COM: Global immigration and relocation. Strengths: Tech-powered, well-funded. Weaknesses: Broad focus, not Innovator Founder specific, enterprise pricing. Our advantage: Laser focus on one visa route. (4) FRAGOMEN/CRANBROOK LEGAL (Law Firms): Professional expertise, established reputation. Weaknesses: £3,000-15,000 cost, geographic constraints, office hours only. Our advantage: 24/7 access, global reach, 99% cost reduction. (5) DIY/FREE RESOURCES (GOV.UK, Forums): Free access. Weaknesses: Fragmented, outdated, no personalization, high rejection rates. Our advantage: Integrated, current (November 2025 guidance), AI-personalized. (6) TORLY.AI (Emerging): AI visa assistant. Strengths: AI-powered. Weaknesses: Limited tools, early stage. Our advantage: 109 tools vs ~20, production-ready.",
      competitiveDifferentiation: "MEASURABLE COMPETITIVE ADVANTAGES: (1) Tool Count: 109 specialized tools vs competitors' 10-20 generic tools (10x more comprehensive). (2) Cost: £15-129 vs £3,000-15,000 traditional services (97% savings). (3) Speed: Instant access vs 2-4 weeks lawyer scheduling. (4) Specialization: 100% Innovator Founder Visa focus vs competitors' broad visa coverage. (5) AI Quality: Multi-LLM (GPT-4 + Gemini) vs single model or no AI. (6) Accessibility: 24/7 global access vs UK office hours only. (7) Currency: Real-time policy updates (November 2025 guidance) vs outdated templates. (8) Evidence Focus: Addresses all 8 critical rejection reasons vs generic advice. (9) Self-Service: Full capability without human dependency vs consultant bottleneck. (10) First-Mover: Only comprehensive platform in market. VALIDATED BY: 47 users in 30 days with £0 marketing spend, organic SEO traction.",
      customerInterviews: "28 CUSTOMER DISCOVERY INTERVIEWS (September-November 2025): Demographics: 15 tech entrepreneurs (India, Nigeria, Pakistan), 8 business consultants, 5 professional services founders. KEY FINDINGS: (1) Cost Barrier Critical: 26/28 cited lawyer fees (£3,000-15,000) as primary obstacle. Average budget: £500-1,000 for visa support. (2) Information Fragmentation: 24/28 frustrated by scattered, contradictory online guidance. Spent 20-40 hours researching before finding lawyer. (3) Rejection Anxiety: 22/28 knew someone rejected, fear of wasting fees without understanding requirements. (4) Business Plan Weakness: 20/28 admitted business plan was their weakest area, unsure what endorsers want. (5) Time Pressure: 18/28 had urgent timelines (3-6 months) incompatible with lawyer waiting lists. (6) Willingness to Pay: £15-49/month acceptable for 24/28, £45-129 one-time for 20/28. (7) Feature Priorities: Business plan generator (28/28), compliance checker (25/28), interview prep (23/28), AI review (21/28). INTERVIEW SOURCES: LinkedIn outreach (12), Reddit r/ukvisa (8), Facebook immigrant entrepreneur groups (5), personal network (3). Documentation available in Appendix.",
      lettersOfIntent: "3 LETTERS OF INTEREST (LOIs): (1) Lagos Immigration Consultancy (Nigeria): LOI for white-label partnership, 50+ annual client referrals, potential £12K/year revenue. Signed November 2025 by Managing Director. (2) Tech Entrepreneur Network Manchester (UK): LOI to recommend platform to 200+ network members, potential marketing partnership. Letter from Network Coordinator. (3) Leeds Beckett University International Office: Exploring student entrepreneur support integration, potential institutional partnership. Correspondence from International Student Advisor. TOTAL POTENTIAL: £24K Year 1 partnership revenue from validated interest. Additional: 47 registered users represent organic demand validation. 12 active tool users demonstrate product-market fit signal. Testimonials collected from 3 beta users (documented).",
      willingnessToPay: "WILLINGNESS TO PAY EVIDENCE: Survey Data (28 interviews): £15/month Basic: 24/28 (86%) 'definitely would pay'. £29/month Premium: 20/28 (71%) 'would consider'. £45-129 one-time Ultimate: 18/28 (64%) 'would pay for comprehensive plan'. Median acceptable price: £29 one-time. Validation: 12 users actively using paid-tier features (conversion intent). 3 LOIs with defined pricing acceptance. Competitor Comparison: Users paying £3,000-15,000 to lawyers = strong willingness to pay for professional solution at 97% discount. Platform Pricing: Free (13 tools) → Basic £15 (20 tools) → Premium £29 (83 tools) → Enterprise £45 (109 tools) → Ultimate £60 (all tools + VIP). Positioned at lower end of willingness range to maximize adoption. ARPU Target: £55 (blended), LTV: £237 (4.3 months avg subscription).",
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
      targetEndorser: "PRIMARY TARGET: INNOVATOR INTERNATIONAL (innovatorinternational.co.uk). RATIONALE: (1) Highest approval rate (65%+) among endorsing bodies. (2) Faster processing (4-6 weeks vs 3-4 months). (3) Cost-effective (£1,500 application fee). (4) Technology/digital sector focus aligns with AI SaaS platform. (5) Experience with first-time founders and immigrant entrepreneurs. (6) Clear requirements and feedback process. APPLICATION RESEARCH: Requirements verified November 2025: Business plan (40-60 pages), Financial projections (3-year), Founder CV, Evidence portfolio, Product demo. Scoring criteria: Innovation (30%), Viability (35%), Scalability (35%). BACKUP OPTIONS: (1) UKES (UK Endorsing Services) - larger pipeline, slower processing. (2) Envestors - investment focus, higher bar. (3) GEP - Global Entrepreneur Programme (high-growth potential, enterprise connections). APPLICATION TIMELINE: January 2026: Application submission. February-March 2026: Assessment period. April 2026: Decision expected.",
      contactPointsStrategy: "6 CONTACT POINTS STRATEGY (3-Year Engagement): YEAR 1 (3 mandatory contacts): CP1 (Month 3, May 2026): Initial post-endorsement meeting (60min, video call). Deliverables: 5-page progress report, user metrics, product demo. Agenda: Business update, milestone review, mentor matching. CP2 (Month 6, August 2026): Q2 progress review (45min). Deliverables: Financial update, customer testimonials, hiring progress. CP3 (Month 12, February 2027): Year 1 annual review (90min, in-person if possible). Deliverables: 15-page annual report, audited financials, 2 employee proof, product roadmap. YEAR 2 (2 mandatory contacts): CP4 (Month 18, August 2027): Mid-year check-in (45min video). Deliverables: 10-page update, 500+ customer milestone, partnership evidence. CP5 (Month 24, February 2028): Year 2 annual review (90min). Deliverables: 20-page report, 5 employees, £150K+ revenue, growth metrics. YEAR 3 (2 contacts): CP6 (Month 30, August 2028): Progress review (45min). Deliverables: Scaling update, 8 employees, market position. CP7 (Month 36, February 2029): Final 3-year review + ILR preparation (120min). Deliverables: Comprehensive 25-page final report, all KPIs achieved, ILR endorsement request. PROACTIVE ENGAGEMENT: Monthly email updates, endorser newsletter sharing, community participation, potential speaking at endorser events.",
      experience: "FOUNDER SKILLS SUMMARY: TECHNICAL EXPERTISE (7+ years): Full-Stack Development (React, Node.js, TypeScript, Python), AI/ML Integration (OpenAI GPT-4, Google Gemini, custom prompts), Database Architecture (PostgreSQL, MongoDB), Cloud Deployment (AWS, Replit, Vercel). Demonstrated: 50+ production projects, AI virtual concierge handling 200+ daily queries, current platform with 109 tools. BUSINESS & COMMERCIAL: Client management (50+ projects), Revenue generation (£45K+ freelance), Partnership development (3 LOIs secured), Financial modeling (3-year projections created), Market research (28 customer interviews). LEADERSHIP: Team leadership at Qalhata Technology, Project delivery across multiple sectors, Client presentation and stakeholder management. DOMAIN EXPERTISE: First-hand UK visa experience (navigated process personally), Immigration journey understanding, Extensive research on Innovator Founder Visa requirements (November 2025). GAPS ADDRESSED: (1) Limited marketing → Part-time Marketing Specialist hire Month 7. (2) No immigration law qualification → OISC partnership model, legal opinion obtained. (3) Limited sales experience → SDR hire Year 2, sales training completed. UNIQUE STRENGTHS: Technical + business hybrid, domain expertise, proven execution, resourcefulness (MVP built for under £1,000).",
      revenue: "EXPERT-LEVEL 5-TIER CREDIT-BASED REVENUE MODEL (Comprehensive Business Architecture):\n\n" +
        "TIER STRUCTURE WITH PLAN CREDITS:\n" +
        "• FREE (£0): 13 essential tools, 0 plan credits, 1 saved draft only. Purpose: Lead generation, product demonstration, conversion funnel entry. Users explore basic compliance checker, eligibility calculator, document checklists. Cannot generate full business plans.\n" +
        "• BASIC (£15 one-time): 20 tools, 1 plan credit, 1 active business, 2 revisions per plan. Target: Straightforward visa applications with clear business models. Includes basic AI guidance, timeline calculator, cost estimator.\n" +
        "• PREMIUM (£29 one-time, MOST POPULAR): 83 tools, 3 plan credits, 2 active businesses, 4 revisions per plan. Full AI-powered business plan generator, financial projections, market analysis, pitch deck builder, interview prep, AI document review. Target: Serious applicants needing comprehensive support.\n" +
        "• ENTERPRISE (£45 one-time): 109 tools, 6 plan credits, 3 active businesses, 6 revisions per plan. All Premium features plus advanced IP/patent strategy, Expert AI Orchestrator (4 specialized agents), deep-dive innovation coverage, priority email support (24hr response). Target: Complex ventures, multiple business ideas.\n" +
        "• ULTIMATE (£60 one-time + optional £49/year Assurance): 109 tools + VIP benefits, 12 plan credits per year with 'fair-use unlimited' (auto top-up in 3-credit blocks if needed), unlimited businesses, unlimited revisions. Includes white-glove concierge support, legal review queue access, 1-hour rush delivery, appeal strategy planning, success guarantee coaching, lifetime access to all future tool updates. Assurance subscribers get annual credit refresh; lapsed Assurance converts to pay-per-credit model (£35/plan).\n\n" +
        "CREDIT SYSTEM EXPLAINED: Each 'plan credit' = one complete AI-generated business plan (60-80 pages). Revisions to existing plans don't consume credits. Credits never expire for one-time purchases. Users can generate plans for different business ideas using available credits.\n\n" +
        "UPGRADE PRICING (Pay Difference Only): Basic→Premium = £20 (not £29), Premium→Enterprise = £40 (not £45), Enterprise→Ultimate = £40 (not £60). Unused credits carry forward. Cross-grade purchases inherit highest tier tools instantly. This fair pricing encourages upgrades and increases customer lifetime value.\n\n" +
        "ADD-ON PURCHASES (Secondary Revenue Streams):\n" +
        "• Single Plan Credit: £19 (for users who exhaust tier credits)\n" +
        "• Triple Credit Pack: £49 (15% savings, for multiple business ideas)\n" +
        "• Partner/Family Bundle: +2 additional user seats for £29 (spouse/co-founder access)\n" +
        "• Rejection Recovery Pack: 2 credits + 30min coach call for £45 (visa rejection support)\n" +
        "• Rush Delivery: £29 (1-hour priority processing vs standard 24hr)\n" +
        "• Annual Compliance Refresh: £29/year (updated plans reflecting new regulations)\n\n" +
        "REFERRAL PROGRAM (3-Sided Network Effect):\n" +
        "• Referrer Reward: 1 free plan credit per successful referral (credits accumulate, never expire)\n" +
        "• Referee Benefit: 15% off first paid tier purchase\n" +
        "• Advisor/Lawyer Referral: Dashboard analytics unlock + priority listing in lawyer directory\n" +
        "• Tracking: Unique referral codes, cookie-based attribution (30-day window), dashboard showing referral status\n\n" +
        "PROMO CODE FRAMEWORK:\n" +
        "• Percentage Discount: 10-50% off tier price (e.g., LAUNCH20 = 20% off)\n" +
        "• Fixed Credit Bonus: +1 or +2 credits with purchase (e.g., BONUS1)\n" +
        "• Free Tier Upgrade: Purchase Basic, get Premium free (limited campaigns)\n" +
        "• Voucher Codes: Fixed value (£10, £20) applicable to any tier\n" +
        "• Stacking Rules: Maximum 1 discount + 1 voucher per transaction\n" +
        "• Expiry: Configurable per code (single-use, multi-use, time-limited)\n" +
        "• Affiliate Tracking: Commission-based codes for partners (10-20% revenue share)\n\n" +
        "52 SCENARIO COVERAGE (Edge Cases Handled):\n" +
        "1-10: New user journeys (Free→Basic→Premium→Enterprise→Ultimate conversions)\n" +
        "11-20: Upgrade paths with credit preservation and differential pricing\n" +
        "21-25: Credit exhaustion and add-on purchase flows\n" +
        "26-30: Multi-business portfolio management (different ideas, same user)\n" +
        "31-35: Visa rejection recovery (retry plans, appeal strategies)\n" +
        "36-40: Family/partner applications (separate plans, shared accounts)\n" +
        "41-45: Business pivot scenarios (endorser feedback requiring revisions)\n" +
        "46-48: Bulk/corporate purchases (universities, accelerators, consultancies)\n" +
        "49-50: Refund scenarios (credit claw-back policy, 14-day cooling off)\n" +
        "51-52: Future pricing changes (grandfathering existing users, Assurance fee updates)\n\n" +
        "REVENUE PROJECTIONS:\n" +
        "Year 1 (500 paying customers): Free 60% (funnel), Basic 25% (£3,625), Premium 40% (£9,800), Enterprise 25% (£11,125), Ultimate 10% (£6,450). Tier revenue: £31,000. Add-ons: £8,500. Referral-driven: £5,200. Total Year 1: £44,700 + organic growth = £69,890.\n" +
        "Year 2 (1,200 customers): Tier revenue £98,400, Add-ons £32,000, Referrals £18,000, Assurance renewals £12,000. Total: £160,400.\n" +
        "Year 3 (2,500 customers): Tier revenue £285,000, Add-ons £95,000, Referrals £45,000, Assurance £48,000, B2B partnerships £140,000. Total: £613,000.\n" +
        "3-Year Cumulative: £843,290 revenue.\n\n" +
        "UNIT ECONOMICS:\n" +
        "• Average Revenue Per User (ARPU): £68 (blended across tiers + add-ons)\n" +
        "• Customer Acquisition Cost (CAC): £25 (organic SEO-first, rising to £45 with paid ads Year 2)\n" +
        "• Lifetime Value (LTV): £285 (initial purchase + 1.8 add-on purchases + 40% upgrade rate)\n" +
        "• LTV:CAC Ratio: 11.4:1 (excellent, target >3:1)\n" +
        "• Payback Period: 1.8 months\n" +
        "• Gross Margin: 87% (low infrastructure costs, AI API ~8% of revenue)\n" +
        "• Net Margin Target: 40% by Year 3\n" +
        "• Monthly Recurring Revenue (Ultimate Assurance): £8,250/month by Year 3 (100 Assurance subscribers × £49/12)\n\n" +
        "SUSTAINABILITY ANALYSIS: Unlike competitors relying on high one-time fees, our model generates recurring revenue through: (1) Add-on credit purchases, (2) Ultimate Assurance annual subscriptions, (3) Referral-driven new customers, (4) B2B partnership licensing. This creates predictable revenue streams while maintaining accessible pricing for individual applicants.",
    };
    
    // Update formData and savedData synchronously to prevent race condition with useEffect
    setFormData(demoData);
    saveAllFields(demoData);
    toast({
      title: "Demo Template Loaded",
      description: "All fields filled with example data showing the detail level endorsers expect. Replace each [EXAMPLE] section with your own information.",
      duration: 5000,
    });
  };

  // Load industry-specific template for non-founder users
  const handleLoadIndustryTemplate = (industry: string, templateIndex: number) => {
    const userName = user?.displayName || user?.firstName || user?.email?.split('@')[0] || 'Your Name';
    
    // COMPREHENSIVE Industry-specific template data - ALL fields filled
    const industryTemplates: Record<string, Record<string, string>[]> = {
      visatech: [
        { // UK Visa Assistant - Benedict Umeh - COMPREHENSIVE
          businessName: "UK Visa Assistant (Stackrise Ltd)",
          industry: "Legal Tech / Immigration Tech / AI SaaS",
          problem: "Applying for the UK Innovator Founder Visa costs £5,000-15,000 in legal fees, takes weeks for feedback, and has a 40%+ rejection rate due to preventable errors. The 100+ page guidance documents are confusing, and generic templates don't reflect individual business innovations. Talented entrepreneurs are excluded by cost barriers and lack of accessible expert guidance.",
          innovationStage: "mvp-complete",
          productStatus: "Fully functional MVP with 109 professional tools, multi-agent AI system (4 specialized agents: Nova for Innovation, Sterling for Finance, Atlas for Growth, Sage for Compliance), AI-Guided Interview system, visual business plan generator with charts, Stripe payment integration, Google OAuth authentication, and document intelligence using GPT-4o Vision. Platform is live and processing real users at ukvisaassistant.com.",
          existingCustomers: "Beta testing with initial users. Platform fully operational with authentication, payments, and all features live. Gathering testimonials and case studies from early adopters going through the visa application process.",
          tractionEvidence: "Working production platform deployed on Railway. Full user authentication system with Google OAuth. Complete payment integration with Stripe (live mode). 109 tools operational across 8 categories. Real-time analytics tracking user behavior. Multi-agent AI chatbot responding to user queries 24/7.",
          uniqueness: "First multi-agent AI system purpose-built for UK Innovator Founder Visa applications. Four specialized AI agents collaborate (Innovation, Finance, Growth, Compliance) unlike single-chatbot competitors. 100x cheaper than traditional legal advice (£35/month vs £5,000-15,000). Instant 24/7 feedback vs weeks waiting. AI-powered document extraction auto-populates business plans using GPT-4o Vision. Real-time compliance scoring against endorsing body criteria. 109 professional-grade tools worth £80-100 each.",
          techStack: "Frontend: React 18, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion\nBackend: Node.js, Express.js, PostgreSQL, Drizzle ORM\nAI: Google Gemini API, OpenAI GPT-4o, Function Calling/Tool Use\nAuth: Google OAuth 2.0, Passport.js, Session Management\nPayments: Stripe (subscriptions, invoicing)\nStorage: AWS S3 (documents), Railway (hosting)\nAnalytics: GA4, Custom Activity Tracking\nCharts: Recharts, jsPDF, html-to-image for visual exports",
          dataArchitecture: "Secure PostgreSQL database with Drizzle ORM for type-safe queries. Document storage on AWS S3 with presigned URLs. Session-based authentication with secure cookies and CSRF protection. Real-time activity tracking with heartbeat monitoring (30-second intervals). AI agents communicate through structured function calling with JSON schemas. Business plan generation uses template-based sections with AI content generation and SVG chart visualization.",
          aiMethodology: "Multi-agent AI architecture with specialized agents: Nova (Innovation & IP validation, NHS Light Blue), Sterling (Financial projections, investor readiness, Gold), Atlas (Market analysis, scaling strategies, Emerald), Sage (Regulatory requirements, document review, NHS Blue). Uses Google Gemini API with function calling for structured outputs. Adaptive interview system adjusts questions based on responses. Document extraction using OpenAI GPT-4o Vision API for CV and certificate parsing. Each agent has distinct personality and expertise area.",
          complianceDesign: "GDPR compliant with data encryption at rest and in transit, user consent mechanisms, right to deletion implemented. OISC compliant - provides information only, not regulated legal advice (clear disclaimers on all outputs). Cookie consent and privacy policy implemented. Cloudflare Turnstile for bot protection. Secure session management with httpOnly cookies. Data retention policies defined.",
          patentStatus: "Trade secrets: Proprietary AI prompts and multi-agent configurations. Trademark pending: 'UK Visa Assistant' brand. Database rights: Curated compliance knowledge base with endorsing body criteria. Copyright: All platform code and content. No patents filed yet - focus on speed to market and trade secret protection.",
          founderEducation: "MSc Data Science - Leeds Beckett University, UK, 2023 - Advanced AI/ML, data analytics, statistical modeling\nBSc Information Technology & Business Information Systems - Middlesex University, UK, 2017 - Systems analysis, IT management\nAdvanced Diploma in Software Engineering - Aptech Computer Institute, 2016 - Full-stack development fundamentals\nProfessional certifications: Google Data Analytics, IBM Data Analyst, Programming Fundamentals, SEO Specialist",
          founderWorkHistory: "CTO/Lead Developer at Stackrise (Jun 2025-Present): Leading technical delivery for UK digital consultancy, building AI-powered portals and client management systems, implementing Stripe payments and automated workflows.\n\nWeb & Performance Analyst at Qalhata Technologies (Nov 2024-Present): GA4 analytics, performance reporting, stakeholder dashboards for corporate clients.\n\nWeb Developer at Deskstones Ltd (Feb 2024-Present): Website rebuild focused on speed, SEO optimization, conversion improvement.\n\nWeb Developer/Analyst at Eden Health Care Private (2023-2024): Healthcare web development, scheduling systems, workflow automation.",
          founderAchievements: "Built and deployed 10+ production web applications with real users. Developed AI-powered platforms including GCA Global Competency Assessment (32 countries), F-RADAR geospatial renewable energy platform, AutoInsight hotel analytics dashboard. Implemented Stripe payment systems processing real transactions. Led technical delivery at Stackrise serving multiple SME clients. MSc thesis in data science with practical AI/ML applications.",
          relevantProjects: "UK Visa Assistant Platform - This exact platform, fully built with 109 tools, multi-agent AI system, Stripe payment integration, visual business plan exports with charts\n\nGCA Global Competency Assessment - AI-powered certification platform for professionals across 32 countries\n\nF-RADAR - Agentic geospatial renewable energy feasibility platform with UK public data integration and interactive mapping\n\nAutoInsight - Hotel analytics platform with 100+ KPI dashboard and AI assistant for insight retrieval\n\nAI Virtual Hotel Concierge - High-volume FAQ chatbot handling guest inquiries\n\nAfro Grocers - Multilingual e-commerce with AI-powered customer support",
          funding: "50000",
          fundingSources: "£20,000 personal investment (development time and infrastructure). £30,000 seed funding target for marketing and scaling. Bootstrap approach with revenue reinvestment. Total: £50,000 for 18-month runway and marketing push.",
          monthlyProjections: "Year 1: Month 1-3: £0 revenue (beta testing), £3K/month costs. Month 4-6: £3K MRR (85 subscribers), £4K costs. Month 7-12: £10K MRR (285 subscribers), £6K costs. Year 1 total: £78K revenue, £54K costs. Year 2: £29K MRR by month 24, £350K annual revenue. Year 3: £71K MRR, £850K annual revenue, strong profitability.",
          customerAcquisitionCost: "25",
          lifetimeValue: "280",
          paybackPeriod: "1",
          detailedCosts: "AI API costs (Gemini, OpenAI): £18K/year. Cloud infrastructure (Railway, AWS S3): £12K/year. Marketing & customer acquisition: £25K/year. Founder salary (Year 2): £50K. Legal & professional: £5K/year. Content creation & SEO: £8K/year. Total Year 1: £85K.",
          competitors: "1. Traditional Law Firms (£5,000-15,000 legal fees, trusted but slow and expensive). 2. ImmigrationHelp.ai (AI-powered but generic, not UK-specific, £99/month). 3. Visa.ai (Document processing focused, limited guidance). 4. DIY Templates (Free/cheap but no personalization). 5. Immigration Consultants (Variable quality, £500-2,000 per application). Our advantage: UK-specific, multi-agent AI, 109 tools, 100x cheaper than traditional options.",
          competitiveDifferentiation: "100x cheaper than traditional legal advice (£35/month vs £5,000-15,000). Instant 24/7 AI responses vs weeks waiting for consultant feedback. Multi-agent AI with specialized expertise (4 agents) vs single generic chatbot. 109 professional tools vs basic templates. UK Innovator Founder Visa specific vs generic immigration tools. Real-time compliance scoring vs manual document review. Visual business plans with charts vs text-only exports.",
          customerInterviews: "30+ conversations with visa applicants, immigration advisors, and endorsing body representatives. Key findings: (1) Legal fees are prohibitive for most founders. (2) DIY attempts fail due to complex requirements. (3) Real-time feedback desperately needed. (4) Business plan quality is make-or-break for endorsement. (5) Founders willing to pay £35-99/month for comprehensive guidance.",
          lettersOfIntent: "Platform launched and processing real users. Early adopter testimonials being collected. Partnership discussions with immigration advisory firms for white-label solutions. University international student office outreach planned.",
          willingnessToPay: "Beta user feedback: 85% willing to pay £35/month for comprehensive guidance. Price point validated as 'less than one hour of legal consultation'. Enterprise tier (£99/month) attractive to immigration consultancies. Annual discount (20%) improves retention.",
          marketSize: "TAM: UK Innovator/Start-up visa market £560 million (80,000+ applications annually × £7,000 average spend). SAM: Tech-savvy applicants who would use software £16.8 million (40,000 × £420/year). SOM Year 3: £840,000 ARR (2,000 subscribers at £35/month average).",
          regulatoryRequirements: "OISC compliance (Office of Immigration Services Commissioner): Platform provides information only, not regulated advice. Clear disclaimers required. GDPR: Full compliance with data protection, ICO registration. Cloudflare Turnstile for bot protection. No FCA requirements (not financial services).",
          complianceTimeline: "Month 1: GDPR audit and documentation complete. Month 2: ICO registration submitted. Month 3: OISC disclaimer review with legal counsel. Month 6: Cyber Essentials certification. Month 12: Annual compliance review. Ongoing: GDPR audit, security updates.",
          complianceBudget: "15000",
          jobCreation: "8",
          hiringPlan: "Year 1: Founder/CTO (Benedict Umeh) - full-stack development, AI integration. Year 2: Marketing Lead (£45K), Content Writer (£30K), Customer Success (£35K). Year 3: Frontend Developer (£55K), AI Engineer (£65K), Sales (£45K). Total: 8 employees by Year 3.",
          specificRegions: "Year 1: UK-wide focus (visa applicants globally applying to UK). Primary markets: London, Manchester, Birmingham, Leeds (tech hubs with high visa applicant concentration). University partnerships: Target international student offices nationwide.",
          expansion: "Products: Year 1: Core platform (109 tools). Year 2: Mobile app, API for immigration firms. Year 3: White-label solution for endorsing bodies. Sectors: Year 1: Tech founders. Year 2: All industries. Year 3: Enterprise immigration consultancies.",
          internationalPlan: "Year 3: Expand to other UK visa categories (Skilled Worker, Global Talent). Year 4: Ireland (similar Common Travel Area). Year 5: EU startup visas (France Tech Visa, Germany). Focus: UK market leadership before international expansion.",
          vision: "5-year vision: UK's #1 AI-powered visa guidance platform. 10,000+ active users, £2.5M ARR, 25 employees. Known for: accuracy, accessibility, affordability. Expanded to all UK visa categories. Exit potential: Acquisition by legal tech company or immigration services provider.",
          targetEndorser: "Primary: Innovator International (technology innovation focus). Alternative: Envestors (SaaS/digital business expertise). Rationale: Platform is AI/technology business, demonstrates clear innovation, addresses real market gap, founder has relevant technical credentials.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Initial pitch, working MVP demonstration, founder credentials. (2) Month 6: User traction metrics, testimonials, revenue growth. (3) Month 12: Annual review, Year 1 achievements, team growth. (4) Month 18: Partnership updates, enterprise customers. (5) Month 24: Series A preparation, international planning. (6) Month 30: Scale-up metrics, exit discussions.",
          experience: "Uniquely qualified: 7+ years full-stack development and AI integration experience. MSc Data Science (Leeds Beckett 2023) - academic foundation in AI/ML. Already built and launched the working platform - demonstrable product, not just an idea. Direct experience with UK visa applications - understand the pain points firsthand. Track record of delivering AI-powered SaaS products (GCA, F-RADAR, AutoInsight). Technical expertise: React, TypeScript, Node.js, PostgreSQL, OpenAI/Gemini APIs.",
          revenue: "Tiered SaaS subscription: Free (£0, basic AI chatbot, 5 tools). Basic (£15/month, 30+ tools). Premium (£35/month, all 109 tools, multi-agent AI, visual exports). Enterprise (£99/month, white-label, API access). Add-ons: Priority support, custom templates. Unit economics: LTV £280, CAC £25, LTV:CAC 11:1, Payback 1 month, Gross margin 85%.",
        },
        { // LegalAI - Document Analysis - COMPREHENSIVE
          businessName: "LegalAI",
          industry: "Legal Tech / Document Intelligence / B2B SaaS",
          problem: "UK law firms spend 60% of associate time on document review at £200-400/hour. Contract review backlogs average 3 weeks. Human error in document analysis costs firms £millions in missed clauses and compliance issues. SMEs can't afford proper legal document review.",
          innovationStage: "mvp-complete",
          productStatus: "MVP launched with AI-powered contract analysis, clause extraction, and risk highlighting. Processing 500+ documents monthly for 15 pilot law firms. Average review time reduced from 4 hours to 15 minutes.",
          existingCustomers: "15 pilot law firms including 3 Magic Circle trainees. 8 paying customers at £299/month. Partnership discussions with 2 legal staffing agencies.",
          tractionEvidence: "500+ documents processed monthly. 15 pilot firms, 8 paying. 95% accuracy on clause extraction. Customer NPS: 68. Average 85% time savings reported.",
          uniqueness: "95% clause extraction accuracy (vs 75% competitors). UK law focus with jurisdiction-specific training. 15-minute review vs 4-hour manual. Integration with legal practice management systems. Transparent AI reasoning - shows why each risk flagged.",
          techStack: "Python 3.11, OpenAI GPT-4, LangChain, FastAPI, PostgreSQL, React 18, TypeScript, AWS (S3, Lambda), Docker, Elasticsearch",
          dataArchitecture: "Document upload → OCR processing → AI analysis pipeline → Clause extraction → Risk scoring → Dashboard display. Elasticsearch for document search. PostgreSQL for metadata. AWS S3 for document storage with encryption.",
          aiMethodology: "Fine-tuned GPT-4 on 50,000 UK legal documents. Retrieval-Augmented Generation (RAG) for precedent matching. Custom clause classification model. Explainable AI with confidence scores and reasoning chains.",
          complianceDesign: "SRA (Solicitors Regulation Authority) compliant for law firm use. GDPR Article 25. Legal professional privilege considerations. Data encrypted at rest and in transit. SOC 2 Type II in progress.",
          patentStatus: "Trade secrets: Proprietary legal training corpus. UK legal NLP model fine-tuning. No patents filed.",
          founderEducation: "LLB Law, University of Cambridge, 2018 (First Class). MSc Computer Science, UCL, 2020 (Distinction). Qualified Solicitor (non-practising).",
          founderWorkHistory: "Associate, Clifford Chance (2018-2021): M&A document review, due diligence. Legal Tech Consultant, Deloitte (2021-2024): AI implementation for legal clients.",
          founderAchievements: "Led £2B M&A due diligence at Clifford Chance. Implemented AI document review saving £500K annually at Deloitte client. Published in Legal Technology Journal.",
          relevantProjects: "Clifford Chance internal document automation. Deloitte legal AI consulting projects. Personal: Open-source legal NLP library.",
          funding: "120000",
          fundingSources: "£60,000 personal savings. £40,000 angel investment. £20,000 Innovate UK grant.",
          monthlyProjections: "Year 1: £30K revenue. Year 2: £180K revenue. Year 3: £600K revenue.",
          customerAcquisitionCost: "350",
          lifetimeValue: "10764",
          paybackPeriod: "2",
          detailedCosts: "AI/Cloud: £36K/year. Marketing: £25K/year. Team: £120K/year. Legal/Compliance: £15K/year.",
          competitors: "1. Kira Systems (£50K+/year, enterprise only). 2. Luminance (AI-powered, expensive). 3. Relativity (US-focused, litigation). 4. Manual review (current status quo). Our advantage: UK-focused, affordable, law firm friendly.",
          competitiveDifferentiation: "10x cheaper than enterprise solutions. UK law specific training. 15-minute review vs 4 hours. SME law firm accessible pricing.",
          customerInterviews: "25 interviews with law firm partners and associates. Key finding: Would pay £300-500/month for proven time savings.",
          lettersOfIntent: "8 LOIs from law firms. Total potential: £30K Year 1.",
          willingnessToPay: "Survey (n=45 lawyers): 80% willing to pay £299-499/month for proven AI document review.",
          marketSize: "TAM: UK legal tech £1.2B. SAM: Document review tools £180M. SOM Year 3: £600K.",
          regulatoryRequirements: "SRA compliance. GDPR. Legal professional privilege handling. No FCA requirements.",
          complianceTimeline: "Month 1-3: SRA guidance review. Month 6: SOC 2 Type II. Month 12: ISO 27001.",
          complianceBudget: "25000",
          jobCreation: "10",
          hiringPlan: "Year 1: Founder + 1 engineer. Year 2: +3 (sales, customer success, engineer). Year 3: +6 (team expansion).",
          specificRegions: "Year 1: London (Magic Circle, mid-tier). Year 2: Manchester, Birmingham, Leeds. Year 3: National.",
          expansion: "Year 2: Add litigation support. Year 3: Compliance monitoring. Year 4: International law.",
          internationalPlan: "Year 4: Ireland. Year 5: EU (GDPR-focused). Focus UK profitability first.",
          vision: "5-year vision: UK's leading legal AI platform. 500 law firm customers. £5M ARR. Acquisition target for legal publishers.",
          targetEndorser: "Primary: Envestors (B2B SaaS expertise). Alternative: Innovator International.",
          contactPointsStrategy: "6 engagement points over 30 months tracking traction, revenue, team growth.",
          experience: "Uniquely qualified: Qualified solicitor + CS Masters. Clifford Chance M&A experience. Deloitte legal tech consulting. Deep understanding of both legal practice and AI implementation.",
          revenue: "SaaS: Solo £99/month, Team £299/month, Enterprise £999/month. LTV: £10,764. CAC: £350.",
        },
        { // ComplianceFlow - Regulatory Automation - BASIC TEMPLATE
          businessName: "ComplianceFlow",
          industry: "RegTech / Compliance Automation / B2B SaaS",
          problem: "UK financial services firms spend £30B annually on compliance. 40% of compliance officer time spent on manual regulatory monitoring. Regulation changes weekly but most firms update quarterly.",
          innovationStage: "pre-mvp",
          productStatus: "Building AI-powered regulatory change monitoring and compliance automation platform. Technical specification complete. FCA sandbox application in preparation.",
          existingCustomers: "15 expressions of interest from financial services firms. Advisory board includes former FCA regulator.",
          tractionEvidence: "Waitlist: 15 firms. Regulatory dataset: 10,000+ FCA rules mapped. Technical prototype: Change detection AI built.",
          uniqueness: "Real-time regulatory monitoring (daily vs quarterly). AI interpretation of rule changes. Automated policy update suggestions. FCA-focused (UK specific).",
          techStack: "Python, GPT-4, PostgreSQL, React, AWS, FCA data feeds",
          dataArchitecture: "FCA rule monitoring → AI interpretation → Change alerts → Policy suggestions → Audit trail",
          aiMethodology: "Fine-tuned LLM on FCA rulebook. Change detection algorithms. Semantic similarity for impact assessment.",
          complianceDesign: "FCA sandbox participant (planned). GDPR compliant. ISO 27001 target.",
          patentStatus: "Trade secrets only.",
          founderEducation: "MSc Financial Regulation, LSE. BSc Economics, Durham.",
          founderWorkHistory: "Compliance Manager, HSBC (2019-2024). Regulatory Analyst, FCA (2017-2019).",
          founderAchievements: "Led HSBC MiFID II implementation. Published FCA guidance on RegTech.",
          relevantProjects: "HSBC compliance automation. FCA RegTech research.",
          funding: "80000",
          fundingSources: "£50,000 savings. £30,000 family investment.",
          monthlyProjections: "Year 1: £40K. Year 2: £200K. Year 3: £600K.",
          customerAcquisitionCost: "500",
          lifetimeValue: "18000",
          paybackPeriod: "4",
          detailedCosts: "Development: £60K. Compliance: £20K. Marketing: £15K.",
          competitors: "Thomson Reuters, Wolters Kluwer (expensive). No AI-first UK solution.",
          competitiveDifferentiation: "AI-first. Real-time. UK-focused. 80% cheaper than incumbents.",
          customerInterviews: "20 compliance officers interviewed.",
          lettersOfIntent: "5 LOIs from mid-tier banks.",
          willingnessToPay: "Would pay £1,500-3,000/month for proven solution.",
          marketSize: "TAM: UK RegTech £2B. SAM: Monitoring tools £400M. SOM: £600K Year 3.",
          regulatoryRequirements: "FCA sandbox. GDPR. ISO 27001.",
          complianceTimeline: "Month 1-6: FCA sandbox application. Month 12: ISO certification.",
          complianceBudget: "35000",
          jobCreation: "8",
          hiringPlan: "Year 1: Founder + CTO. Year 2: +3. Year 3: +4.",
          specificRegions: "London (financial services hub). Year 2: Edinburgh, Manchester.",
          expansion: "Year 2: Insurance. Year 3: Asset management.",
          internationalPlan: "Year 4: EU (MiFID). Year 5: APAC.",
          vision: "UK's leading RegTech platform. £5M ARR. 200 clients.",
          targetEndorser: "Envestors (FinTech/RegTech expertise).",
          contactPointsStrategy: "6 structured engagements over 30 months.",
          experience: "Former FCA + HSBC compliance. Unique regulatory + tech combination.",
          revenue: "SaaS: £1,500-5,000/month by firm size. Enterprise custom pricing.",
        },
      ],
      fintech: [
        { // FinFlow AI - Cash Flow Forecasting - COMPREHENSIVE
          businessName: "FinFlow AI",
          industry: "FinTech / AI-powered Financial Technology / B2B SaaS",
          problem: "UK SMEs face a critical cash flow crisis: 50,000 businesses fail annually due to poor cash flow management. Current solutions (spreadsheets, basic accounting software) have only 71-76% forecast accuracy, missing seasonal patterns and anomalies.",
          innovationStage: "mvp-complete",
          productStatus: "MVP launched October 2025: AI-powered cash flow forecasting platform using machine learning achieving 94% forecast accuracy (vs 73% industry average). Live at finflow-ai.co.uk with 45 beta users.",
          existingCustomers: "45 beta users including: ABC Accounting Ltd (testimonial: 'Saved us from a £30K shortfall'), XYZ Retail (pilot since August), 3 accounting firms referring clients. 12 paying customers at £60/month.",
          tractionEvidence: "Beta metrics: 45 users, £720 MRR, 94% accuracy validated, 18-day average warning time, 4.7/5 user satisfaction, 85% weekly active usage, 3 case studies documented.",
          uniqueness: "Measurable advantages: (1) 94% forecast accuracy vs 73% industry average. (2) 12-minute setup via Open Banking vs 3-7 day manual entry. (3) 18-day advance shortfall warnings. (4) 40% cheaper than Fluidly (£60 vs £49/month).",
          techStack: "Python 3.11, TensorFlow 2.x, FastAPI, PostgreSQL, Redis, React/TypeScript, AWS (Lambda, S3, RDS), Open Banking APIs, Docker, GitHub Actions CI/CD",
          dataArchitecture: "Open Banking API integration (TrueLayer, Plaid) for real-time bank feeds. PostgreSQL for transaction storage. Redis for caching predictions. ML pipeline: data ingestion → feature engineering → model inference → dashboard rendering. REST API architecture with webhook notifications.",
          aiMethodology: "Ensemble model: LSTM neural network + XGBoost + ARIMA. Training data: 2.5M anonymized SME transactions. Validation: 80/20 split, backtesting on 12-month historical data. Accuracy: 94.2% (±3% variance). Features: seasonality, payment patterns, invoice aging, industry benchmarks.",
          complianceDesign: "FCA-registered (pending). Open Banking compliant (PSD2). GDPR Article 25 (privacy by design). SOC 2 Type II preparation. Data encrypted at rest (AES-256) and in transit (TLS 1.3). Annual penetration testing. ICO registered.",
          patentStatus: "UK Patent Application GB2412345.6 filed November 2024: 'Machine learning system for SME cash flow prediction using banking transaction patterns'. Defensive publication for ensemble methodology.",
          founderEducation: "MSc Data Science, University of Leeds, 2023 (Distinction). BSc Computer Science, Lagos State University, 2019 (First Class). AWS Solutions Architect certification. Google Cloud Professional Data Engineer.",
          founderWorkHistory: "Senior Data Analyst, HSBC UK (2021-2024): Built fraud detection models saving £2.3M annually. Data Scientist, Monzo (2020-2021): Developed customer churn prediction. Junior Analyst, Deloitte (2019-2020): Financial services consulting.",
          founderAchievements: "Built fraud detection saving HSBC £2.3M/year. Published paper on ML in banking (Journal of Financial Technology, 2023). Led team of 4 data scientists. Presented at FinTech Week London 2023. Mentored 6 junior analysts.",
          relevantProjects: "HSBC Cash Flow Analyzer (internal tool, 50K users). Monzo spending prediction feature. Personal: Open-source cash flow library (2,500 GitHub stars). Leeds dissertation: 'Predictive Analytics for SME Financial Health'.",
          funding: "85000",
          fundingSources: "£45,000 personal savings (bank statements available). £25,000 family investment (loan agreement signed). £15,000 Innovate UK SMART Grant (reference: 10054789). Total: £85,000 runway for 14 months.",
          monthlyProjections: "Year 1: Month 1-3: £0 revenue, £6K/month costs (MVP). Month 4-6: £1.8K MRR, £7K costs. Month 7-12: £4.8K MRR, £9K costs. Year 1 total: £28K revenue, £92K costs. Year 2: £12K MRR by month 24, £180K revenue. Year 3: £35K MRR, £420K revenue, break-even month 28.",
          customerAcquisitionCost: "180",
          lifetimeValue: "2160",
          paybackPeriod: "3",
          detailedCosts: "Development/Cloud: £24K/year. Marketing (content, PPC): £18K/year. Founder salary (Year 2): £36K. Open Banking API fees: £6K/year. Legal/Compliance: £8K. Office/Admin: £4K. Total Year 1: £96K.",
          competitors: "1. Fluidly (£49/month, 78% accuracy, acquired by Sage). 2. Float (£29/month, manual data entry, no AI). 3. Futrli (£35/month, basic forecasting). 4. Pulse (US-focused, £79/month). 5. Brixx (£15/month, spreadsheet-based). Our advantage: Only AI-powered solution with Open Banking integration at SME price point.",
          competitiveDifferentiation: "94% accuracy vs 73% industry average (validated with 45 businesses). 12-minute setup vs 3-7 days manual. 18-day warning vs 7-day competitors. £60/month vs £49 Fluidly. UK SME-focused vs generic tools. Real-time Open Banking vs CSV uploads.",
          customerInterviews: "28 customer discovery interviews (August-October 2024). Key findings: (1) 89% manually forecast in spreadsheets. (2) Average 4 hours/week on cash flow. (3) 67% experienced surprise shortfalls. (4) Willing to pay £50-80/month for accurate forecasting. (5) Trust barrier with AI requires explainability.",
          lettersOfIntent: "3 LOIs signed: ABC Accounting (5 client referrals, £3,600/year value), Manchester SME Network (partnership for 50 members), TechStartup Incubator (10 portfolio companies). Total potential: £18,000 Year 1 revenue.",
          willingnessToPay: "Survey (n=85 SME owners): 72% willing to pay £50-80/month. Beta conversion: 12 of 45 free users converted to £60/month (27% conversion). Churn: 1 of 12 paying customers (8% monthly churn).",
          marketSize: "TAM: 5.9M UK SMEs, £4.1B potential (all financial software). SAM: 890,000 SMEs actively using accounting software, £534M. SOM: Year 1: 500 customers (£360K). Year 3: 5,000 customers (£3.6M). 0.5% SAM penetration realistic.",
          regulatoryRequirements: "FCA registration (Consumer Credit, if offering credit features): 6-9 months, £5K. Open Banking TPP registration: Completed via Yapily partnership. GDPR compliance: ICO registered. SOC 2 Type II: £15K, 6 months. Cyber Essentials Plus: £3K, 2 months.",
          complianceTimeline: "Month 1-2: Cyber Essentials Plus certification. Month 3-6: SOC 2 Type II audit preparation. Month 6-9: FCA registration submission (if credit features added). Month 12: ISO 27001 assessment. Ongoing: Annual penetration testing, GDPR audits.",
          complianceBudget: "28000",
          jobCreation: "8",
          hiringPlan: "Year 1: Founder only + contractors. Year 2: Full-stack Developer (£55K), Customer Success (£35K). Year 3: Sales Manager (£50K + commission), Data Scientist (£60K), Marketing (£40K), Finance (£45K, part-time). Total: 8 employees by end Year 3.",
          specificRegions: "Year 1: London, Manchester, Birmingham (SME density, accounting firm partnerships). Year 2: Leeds, Bristol, Edinburgh, Glasgow. Year 3: All major UK cities. Focus: Tech hubs with high SME concentration.",
          expansion: "Vertical: Expand from general SME to industry-specific (retail, hospitality, professional services with tailored models). Horizontal: Add invoice financing recommendations, credit score features, multi-currency for exporters.",
          internationalPlan: "Year 4: Ireland (similar Open Banking standards, English-speaking). Year 5: Netherlands, Germany (PSD2 compliant). Focus on UK validation and profitability before international expansion. Partnership model for non-English markets.",
          vision: "5-year vision: UK's #1 AI cash flow platform for SMEs. 25,000 customers, £15M ARR, 45 employees. Expanded to invoice financing and credit products. Partnership with major banks. Exit potential: acquisition by accounting software (Sage, Intuit) at 8-10x revenue.",
          targetEndorser: "Primary: Envestors (FinTech focus, digital business alignment). Alternative: Innovator International (broader business support). Rationale: Envestors has strong FinTech track record, portfolio includes similar B2B SaaS companies, active mentor network in financial services.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Initial pitch and business plan review. (2) Month 6: MVP progress report, customer metrics. (3) Month 12: Annual review, Year 1 achievements. (4) Month 18: Growth update, hiring progress. (5) Month 24: Series A preparation discussion. (6) Month 30: Exit planning, international expansion.",
          experience: "Uniquely qualified: 5 years in UK banking data science (HSBC, Monzo). Built production ML systems serving 50K+ users. Deep understanding of SME financial challenges. Technical expertise: Python, ML, cloud architecture. Domain expertise: UK banking regulations, Open Banking APIs.",
          revenue: "Tiered SaaS: Starter £19/month (basic forecasting), Professional £69/month (AI predictions, alerts), Enterprise £75/month (API access, multi-entity). Add-ons: Custom reports £49/setup, API access £200/month. LTV: £2,160 (36-month retention). CAC: £180. Payback: 3 months. Gross margin: 85%.",
        },
        { // PaymentPro - B2B Payments - COMPREHENSIVE
          businessName: "PaymentPro",
          industry: "FinTech / B2B Payments / Payment Processing",
          problem: "UK SMEs lose £2.5 billion annually to late B2B payments. 62% of businesses experience cash flow issues due to slow payment collection. Average B2B invoice takes 47 days to be paid, with 23% paid over 60 days late. Existing solutions charge 2.9%+ fees, have 3-5 day settlement times, and lack integration with UK accounting software.",
          innovationStage: "mvp-complete",
          productStatus: "MVP launched September 2025 with core features: instant invoice payments via Open Banking, automated reconciliation with Xero/Sage/QuickBooks, and AI-powered payment chasing. Processing £180K monthly transaction volume across 25 pilot customers. Average Days Sales Outstanding reduced from 47 to 18 days for users.",
          existingCustomers: "25 pilot customers including: BuildRight Construction (£45K monthly invoices, testimonial: 'Cash flow transformed'), Thompson Legal Services (£22K monthly, 'Best B2B payment tool we've used'), Creative Agency Network (3 agencies, £60K combined). 8 customers now paying £99/month after free pilot.",
          tractionEvidence: "Pilot metrics: 25 customers, £180K monthly volume, £792 MRR from 8 paying customers. Payment collection time: 18 days vs 47 days pre-PaymentPro. 96% collection rate on invoices under 30 days. Customer NPS: 72. Churn: 0% in 4 months of paid subscriptions.",
          uniqueness: "Measurable advantages: (1) Flat 1.5% transaction fee vs 2.9% Stripe/PayPal. (2) Same-day settlement via Open Banking vs 3-5 days competitors. (3) AI payment chasing: 40% improvement in on-time payments. (4) Native UK accounting integration (Xero, Sage, FreeAgent). (5) 18-day average collection vs 47-day industry.",
          techStack: "Node.js 18, TypeScript 5.0, PostgreSQL 15, Stripe Connect (card fallback), Open Banking (TrueLayer), React 18, AWS (ECS, RDS, S3), Kubernetes, Redis, GitHub Actions CI/CD, Terraform IaC",
          dataArchitecture: "Architecture: React SPA → AWS API Gateway → Node.js microservices (Invoice, Payment, Reconciliation, Notification) → PostgreSQL. Open Banking integration via TrueLayer for instant payments. Stripe Connect for card payments. Webhook system for real-time payment status. Xero/Sage/QuickBooks OAuth integrations for invoice sync and reconciliation.",
          aiMethodology: "Payment chasing AI: Gradient boosting classifier trained on 50,000 B2B invoices. Features: invoice age, customer payment history, amount, industry, day of week. Predicts optimal chase timing (morning vs afternoon, day of week). Result: 40% improvement in on-time payment when AI timing used vs manual chasing. Model retrained monthly.",
          complianceDesign: "FCA registered as Payment Institution (Small PI, application submitted October 2025). PCI DSS Level 1 compliance via Stripe. Open Banking: Registered AISP via TrueLayer. GDPR Article 25 (privacy by design). Data encrypted AES-256 at rest, TLS 1.3 in transit. SOC 2 Type I achieved, Type II in progress.",
          patentStatus: "No patents filed - focus on trade secrets and speed to market. Proprietary elements: AI payment chasing algorithm (documented internally), customer payment behavior scoring model. Trademark: 'PaymentPro' UK application TM-2024-00567 (pending).",
          founderEducation: "MBA, London Business School, 2022 (Distinction, specialization in FinTech). BSc Economics, University of Warwick, 2018 (First Class). CFA Level II passed. FCA-approved CF10/CF11 qualifications.",
          founderWorkHistory: "Product Manager, Wise (TransferWise) (2020-2024): Led B2B payments product, £50M+ annual volume, launched 12 countries. Business Analyst, Barclaycard (2018-2020): B2B card payments, merchant onboarding optimization. Consultant, McKinsey (Summer 2021): Payments practice, due diligence on 3 FinTech acquisitions.",
          founderAchievements: "Wise B2B product: Grew from £12M to £50M annual volume (4x in 2 years). Launched in 12 countries with 99.9% uptime. Reduced merchant onboarding from 5 days to 2 hours. Published: 'Future of B2B Payments' (Finextra, 2023). Speaker: Money20/20 Europe 2023.",
          relevantProjects: "Wise: B2B payment rails, multi-currency invoicing, API payment initiation. Barclaycard: Merchant portal redesign (30% reduction in support tickets). Personal: Open-source invoice parsing library (1,200 GitHub stars). LBS dissertation: 'Open Banking and SME Cash Flow'.",
          funding: "95000",
          fundingSources: "£55,000 personal savings (from Wise salary, bank statements available). £30,000 angel investment (2 angels, SEIS documentation complete). £10,000 LBS Entrepreneurship Fund grant. Total: £95,000 for 16-month runway.",
          monthlyProjections: "Year 1: Month 1-4: Pilot phase, £0 revenue, £6K/month costs. Month 5-8: £2K MRR, £8K costs. Month 9-12: £8K MRR, £12K costs. Year 1 total: £45K revenue, £108K costs. Year 2: £35K MRR by month 24, £420K revenue. Year 3: £85K MRR, £1M revenue, profitable month 30.",
          customerAcquisitionCost: "220",
          lifetimeValue: "3564",
          paybackPeriod: "3",
          detailedCosts: "Cloud infrastructure (AWS): £18K/year. Payment processing costs: Variable 0.3% (pass-through). Open Banking API fees: £12K/year. Stripe fees: Variable. Compliance/legal: £15K/year. Marketing (content, events): £20K/year. Founder salary (Year 2): £48K. Office: £6K/year coworking. Total Year 1: £108K.",
          competitors: "1. GoCardless (£25+/month, Direct Debit focus, 3-5 day settlement). 2. Stripe Invoicing (2.9%+30p, no AI chasing, US-centric). 3. Xero Payments (via Stripe, embedded only). 4. Sage Pay (£25/month, dated UX, card-only). 5. iwoca Pay (credit focus, not pure payments). Our advantage: Only UK-first, Open Banking native, AI-powered, flat-fee B2B solution.",
          competitiveDifferentiation: "1.5% flat fee vs 2.9%+ competitors (42% savings on £10K invoice). Same-day settlement vs 3-5 days (25-day cash improvement). 40% faster payment collection via AI chasing. Native UK accounting integrations (not afterthought). Purpose-built for UK B2B vs adapted B2C/US tools.",
          customerInterviews: "32 customer discovery interviews (June-August 2025). Key findings: (1) Late payment is #1 pain point for 89% of SMEs. (2) Current tools 'too expensive for what they do'. (3) Accounting integration critical - 'must sync with Xero'. (4) Willing to pay £99-199/month for same-day settlement. (5) AI chasing: 'Would use if it works'.",
          lettersOfIntent: "4 LOIs signed: BuildRight Construction (£500K annual volume commitment), Legal Services Network (15-firm network, £1.2M potential volume), Creative Industries Alliance (trade association, 200 member firms), Manchester Chamber of Commerce (referral partnership). Total pipeline: £2.5M annual volume.",
          willingnessToPay: "Survey (n=65 B2B businesses): 78% willing to pay £99-149/month for same-day settlement. 85% willing to pay 1.5% transaction fee (vs 2.9% current). Pilot conversions: 8 of 25 pilots converted to paid (32% conversion at £99/month). Zero churn to date.",
          marketSize: "TAM: UK B2B payments £1.8 trillion annually, B2B payment software £2.4B. SAM: SME B2B payments (1-250 employees) £180B, software market £480M. SOM: Year 1: £45K (launch). Year 3: £1M (0.2% SAM penetration). Achievable given competitor landscape.",
          regulatoryRequirements: "FCA Payment Institution (Small PI): 6-9 months, £15K application + legal fees. PCI DSS Level 1 (via Stripe): Achieved. Open Banking AISP: Via TrueLayer partnership. GDPR: ICO registered. AML compliance: KYC/KYB processes implemented. Total compliance budget: £35K over 18 months.",
          complianceTimeline: "Month 1-3: FCA Small PI application preparation with compliance consultant. Month 4-9: FCA application review period. Month 6: SOC 2 Type II audit. Month 12: Annual AML audit. Month 18: Potential upgrade to full PI if volume exceeds £3M/month. Ongoing: Quarterly compliance reviews.",
          complianceBudget: "35000",
          jobCreation: "12",
          hiringPlan: "Year 1: Founder + 1 contractor (compliance). Year 2: Senior Engineer (£75K), Customer Success (£45K), Sales (£50K + commission). Year 3: 2 Engineers (£140K), Marketing (£50K), Finance (£55K), Support (£35K), Compliance Officer (£60K). Total: 12 FTE by end Year 3.",
          specificRegions: "Year 1: London, Manchester (B2B hub density, accounting firm partnerships). Year 2: Birmingham, Leeds, Bristol, Edinburgh. Year 3: All major UK cities, targeted sector focus (construction, professional services, agencies). Office: London-based with remote team option.",
          expansion: "Vertical: Industry-specific features (construction payment milestones, agency retainers, legal trust accounting). Horizontal: Multi-currency for exporters, supply chain financing partnerships, embedded payments API for platforms. Integration: Expand to FreeAgent, Zoho, Wave.",
          internationalPlan: "Year 4: Ireland (similar Open Banking, English-speaking, EU gateway). Year 5: Netherlands, Germany (SEPA instant payments). Focus: UK profitability and market leadership before expansion. Partnership model for non-English markets with local compliance partners.",
          vision: "5-year vision: UK's leading B2B payment platform for SMEs. 10,000 customers, £8M ARR, 50 employees. Processing £5B+ annual transaction volume. Expanded to lending/factoring partnerships. Exit potential: Acquisition by bank (Barclays, Lloyds) or accounting software (Intuit, Sage) at 6-8x revenue.",
          targetEndorser: "Primary: Envestors (FinTech specialization, strong B2B portfolio). Alternative: UKES (UK Endorsing Service, supports diverse innovators). Rationale: Envestors has deep FinTech expertise, portfolio includes Wise alumni companies, active in payments vertical.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan pitch, FCA pathway discussion. (2) Month 6: Pilot results, volume metrics, compliance progress. (3) Month 12: Annual review, first-year revenue, hiring. (4) Month 18: Growth metrics, geographic expansion. (5) Month 24: Series A preparation, unit economics validation. (6) Month 30: Scale-up strategy, international planning.",
          experience: "Uniquely qualified: 4 years at Wise building B2B payments (£50M volume). Deep understanding of Open Banking, FCA regulations, UK SME needs. Technical: API design, payment rails, accounting integrations. Domain: UK payment regulations, merchant acquiring, B2B invoicing. Network: FinTech founders, payment industry contacts.",
          revenue: "Hybrid model: SaaS + Transaction. SaaS: Starter £49/month (10 invoices), Professional £99/month (unlimited), Enterprise £299/month (API access, white-label). Transaction: 1.5% flat fee on Open Banking payments, 2.4% on card payments. LTV: £3,564 (36-month retention). CAC: £220. Gross margin: 72% (after payment processing costs).",
        },
        { // LendSmart - SME Lending - COMPREHENSIVE
          businessName: "LendSmart",
          industry: "FinTech / Alternative Lending / SME Finance",
          problem: "78% of UK SME loan applications are rejected by traditional banks. The average approval time is 3-6 weeks. UK SMEs have a £22 billion funding gap. Traditional lenders use outdated credit scoring that ignores real-time business performance, Open Banking data, and alternative revenue indicators.",
          innovationStage: "pre-mvp",
          productStatus: "Building AI-powered credit assessment platform using Open Banking data and alternative metrics. Technical architecture complete with credit scoring model achieving 89% accuracy on historical data. FCA Consumer Credit authorization application in preparation (submission planned Q1 2026). Regulatory consultant engaged.",
          existingCustomers: "Pre-launch: 85 expressions of interest from SMEs on waitlist. 12 accountancy firms signed as referral partners (fee agreements in place). 3 invoice finance brokers interested in white-label partnership. Advisory board includes 2 former bank credit officers and 1 FCA compliance expert.",
          tractionEvidence: "Waitlist: 85 SMEs registered interest. Referral partnerships: 12 accountancy firms. Model validation: 89% prediction accuracy on 15,000 historical loan outcomes. Technical: MVP credit engine built, Open Banking integration tested. Regulatory: Compliance consultant engaged, FCA pre-application meeting scheduled.",
          uniqueness: "Measurable innovations: (1) 24-hour decision vs 3-6 week bank average. (2) 85% approval rate target (vs 22% high street banks) using Open Banking + alternative data. (3) Transparent pricing calculator on website before application. (4) Revenue-based flexible repayments (% of daily card sales). (5) No personal guarantees under £50K.",
          techStack: "Python 3.11, scikit-learn, XGBoost, FastAPI, PostgreSQL, Open Banking (Plaid, TrueLayer), React 18, TypeScript, AWS (compliant with FCA cloud guidance), Docker, Terraform, DataDog monitoring",
          dataArchitecture: "Data pipeline: Open Banking API (12 months transactions) → Feature engineering (200+ variables) → Credit scoring model → Underwriting decision engine → Loan management system. PostgreSQL for loan records. Event-driven architecture with AWS SQS for async processing. GDPR-compliant data retention (6-year loan records, anonymization after).",
          aiMethodology: "Ensemble credit model: XGBoost + Logistic Regression + Random Forest. Training data: 15,000 historical SME loan outcomes (anonymized, licensed from credit bureau). Features: Open Banking (cash flow patterns, revenue stability, recurring payments), bureau data (CCJs, defaults), sector risk scores, director history. Accuracy: 89% (AUC-ROC 0.91). Explainable AI: SHAP values for each decision.",
          complianceDesign: "FCA Consumer Credit authorization (full authorization, not interim). GDPR Article 22 (automated decision-making rights, human review option). ICO registered. FCA Senior Managers and Certification Regime (SMCR) compliance. Anti-money laundering (AML) procedures with ID verification (Onfido). Responsible lending policy documented. Vulnerable customer framework.",
          patentStatus: "No patents filed - credit model is trade secret protected with proprietary training data. Focus on regulatory moat (FCA authorization) as primary barrier to entry. Trademark: 'LendSmart' UK application submitted October 2025.",
          founderEducation: "MSc Financial Engineering, Imperial College London, 2021 (Distinction). BSc Mathematics, University of Lagos, 2017 (First Class). FCA CF30 controlled function qualification. CFA Level I passed. Anti-Money Laundering certification.",
          founderWorkHistory: "Credit Risk Analyst, Funding Circle (2021-2024): Built SME credit models, £200M loan portfolio. Credit Analyst, Lloyds Bank Commercial (2019-2021): SME lending decisions, £50M annual approvals. Risk Intern, PwC (Summer 2018): Credit risk model validation for banks.",
          founderAchievements: "Funding Circle: Reduced default rate by 15% through improved credit model. Approved £50M in SME loans at Lloyds with 2.3% default rate (below 3% target). Published: 'Alternative Data in SME Credit Scoring' (Journal of Risk Management, 2023). Speaker: LendIt Fintech Europe 2023.",
          relevantProjects: "Funding Circle: Built SME credit model for £200M portfolio. Lloyds: Commercial lending underwriting for 500+ SMEs. Imperial dissertation: 'Machine Learning for SME Default Prediction Using Alternative Data'. Personal: Open-source credit scoring library (800 GitHub stars).",
          funding: "150000",
          fundingSources: "£60,000 personal savings (bank statements available). £50,000 angel investment (3 angels, SEIS eligible). £40,000 family investment (formal loan agreement). Total: £150,000 for FCA authorization and 18-month runway to first loan.",
          monthlyProjections: "Year 1: Pre-revenue (FCA authorization period). Costs: £8K/month (£96K annual). Year 2 (post-authorization): Month 1-6: £50K loans disbursed, £3K interest income. Month 7-12: £500K loans, £30K income. Year 2 total: £100K revenue. Year 3: £3M loans outstanding, £540K revenue, break-even month 32.",
          customerAcquisitionCost: "350",
          lifetimeValue: "4200",
          paybackPeriod: "6",
          detailedCosts: "FCA authorization: £35K (legal, compliance consultant, application fee). Technology infrastructure: £24K/year. Credit data (bureau access): £18K/year. Compliance officer (part-time Year 1): £30K. Legal: £15K. Marketing (Year 2): £25K. Office/admin: £10K. Loan capital (Year 2): External funding line required. Total Year 1: £96K (pre-revenue).",
          competitors: "1. Funding Circle (established, public company, minimum £10K, 8-12% rates). 2. iwoca (revenue-based, fast but expensive 2-6% monthly). 3. Tide Lending (embedded in banking app, limited loan sizes). 4. MarketFinance (invoice finance focus). 5. NatWest/Lloyds (slow, high rejection, personal guarantees). Our advantage: Speed + approval rate + transparent pricing + no PG under £50K.",
          competitiveDifferentiation: "24 hours vs 3-6 weeks (banks) or 48 hours (Funding Circle). 85% approval vs 22% (banks) using alternative data. No personal guarantee under £50K (unique in market). Revenue-based repayments (% of daily sales, not fixed monthly). Transparent calculator: Know your rate before applying. UK-focused with sector-specific models.",
          customerInterviews: "45 SME owner interviews (July-October 2025). Key findings: (1) 73% rejected by bank in last 2 years. (2) #1 frustration: Not knowing why rejected. (3) Personal guarantee is major barrier (especially female founders). (4) Willing to pay 1-2% premium for speed and transparency. (5) Revenue-based repayments preferred for seasonal businesses.",
          lettersOfIntent: "6 referral partnership LOIs: 3 accountancy firms (combined 2,000 SME clients), 2 business brokers, 1 fintech aggregator. Conditional on FCA authorization. Pipeline: £2M potential loan demand in Year 1 via partnerships. Letter from former Funding Circle colleague confirming advisory support.",
          willingnessToPay: "Survey (n=120 SMEs rejected by banks): 89% willing to pay 10-15% APR for fast, transparent lending. 78% would choose no-personal-guarantee option at 2% premium. Funding Circle benchmarks: Average SME loan £85K at 8-12% APR. Our target: £30K average at 12-18% APR (higher rate for higher approval).",
          marketSize: "TAM: UK SME lending £60B annually. SAM: Alternative SME lending £8B (growing 15%/year). SOM: Year 1: £0 (authorization). Year 2: £1M loans. Year 3: £3M loans (0.04% SAM). Conservative given FCA authorization required before lending.",
          regulatoryRequirements: "FCA Consumer Credit Authorization (full, not interim): 9-12 months, £45K (fees + legal). Senior Managers Regime (SM&CR): Founder as SM. ICO Data Protection registration. AML registration. P2P lending exemption if not using depositor funds. Credit reference agency agreements. Total regulatory budget: £65K.",
          complianceTimeline: "Month 1-3: FCA application preparation (regulatory business plan, financial projections, compliance framework). Month 4: FCA application submission. Month 5-12: FCA review, respond to information requests. Month 12: Authorization expected. Month 13: First loan. Ongoing: Annual compliance audits, quarterly FCA returns.",
          complianceBudget: "65000",
          jobCreation: "18",
          hiringPlan: "Year 1: Founder + Compliance Consultant (contractor). Post-authorization Year 2: Head of Credit (£70K), Operations Manager (£50K), Customer Service (£35K), Developer (£65K). Year 3: Sales (£55K + commission), Marketing (£45K), 2 more Credit Analysts (£100K), Collections (£35K). Total: 18 FTE by end Year 3.",
          specificRegions: "Year 1-2: England and Wales (Scotland separate credit law). Focus: London, Manchester, Birmingham, Leeds (SME density). Year 3: Scotland (with legal review). Sector focus: Professional services, hospitality, e-commerce (lower default rates, understood sectors). Avoid: Construction, retail (higher risk initially).",
          expansion: "Vertical: Sector-specific products (hospitality working capital, e-commerce inventory finance). Horizontal: Invoice finance, asset finance, R&D tax credit advance. Product: Business credit cards (Year 4, separate FCA authorization). Technology: White-label lending platform for banks/fintechs.",
          internationalPlan: "Year 5+: Ireland (similar legal framework, English-speaking). Focus: UK market leadership and profitability before international. Challenge: Each country requires separate lending authorization. Strategy: License technology platform to international partners rather than direct entry.",
          vision: "5-year vision: UK's most trusted SME lender for underserved businesses. £50M loan book, £9M revenue, 25% net margin. 8,000 SMEs funded. Expanded to invoice finance and credit cards. Exit potential: Acquisition by bank (looking to accelerate SME digital lending) or fintech at 3-4x revenue.",
          targetEndorser: "Primary: Envestors (fintech specialization, banking relationships, lending expertise). Alternative: GEP (Global Entrepreneur Programme, strong enterprise connections). Rationale: Envestors has deep connections into fintech and banking, understands FCA authorization journey, portfolio includes lending startups.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, FCA strategy review. (2) Month 6: FCA application progress, technical demo. (3) Month 12: Authorization received, first loans. (4) Month 18: Portfolio performance, default rates. (5) Month 24: Growth metrics, funding round. (6) Month 30: Scale-up strategy, product expansion.",
          experience: "Uniquely qualified: 5 years in SME credit risk (Funding Circle, Lloyds). Built credit models for £200M+ portfolios. Deep understanding of FCA requirements, SME needs, and alternative data. Technical: ML for credit scoring, Open Banking integration. Regulatory: FCA-approved CF30 qualification, AML certified. Network: Lending industry contacts, VC relationships.",
          revenue: "Interest income model: Loans £5K-£100K at 12-24% APR (risk-based pricing). Origination fee: 2% of loan value. Broker commission: 1% for referral partners. Projected: Year 2: £1M loans at 15% average = £150K interest + £20K fees. Year 3: £3M loans = £450K interest + £60K fees. Gross margin: 65% (after funding costs, defaults).",
        },
      ],
      healthtech: [
        { // CareAI - Patient Management - COMPREHENSIVE
          businessName: "CareAI",
          industry: "HealthTech / AI Healthcare / Patient Management",
          problem: "NHS trusts waste £2.3 billion annually on missed appointments (DNA rate: 6.4%, 8.4 million missed appointments). Inefficient scheduling leaves 23% of clinic slots unfilled. Staff spend 40% of administrative time on manual scheduling, reducing patient-facing care hours.",
          innovationStage: "mvp-complete",
          productStatus: "MVP deployed in 3 NHS pilot sites (Guy's and St Thomas', Leeds Teaching Hospitals, Manchester University NHS Foundation Trust). AI scheduling system processing 1,200 appointments weekly. DCB0129 clinical safety case approved October 2025. Reducing DNA rates from 8.4% to 5.5% (35% improvement) in pilot sites.",
          existingCustomers: "3 NHS Trust pilots: Guy's and St Thomas' (outpatient clinics, 400 appointments/week), Leeds Teaching Hospitals (diabetes clinics, 350/week), Manchester University NHS (physiotherapy, 450/week). Testimonial from Clinical Lead: 'CareAI has transformed our clinic efficiency - fewer missed appointments, happier patients and staff.'",
          tractionEvidence: "Pilot metrics: 1,200 appointments/week processed. DNA rate: 5.5% vs 8.4% baseline (35% reduction). Clinic utilization: 89% vs 77% baseline (28% improvement). Admin time saved: 4 hours/clinician/week. Patient satisfaction: 4.3/5. NHS trust letters of support for continued use.",
          uniqueness: "Measured NHS impact: (1) 35% DNA reduction (£156K annual savings per trust). (2) 28% clinic utilization improvement. (3) 4 hours admin time saved per clinician weekly. (4) Real-time patient preference learning. (5) NHS Digital approved (DCB0129). (6) HL7 FHIR compliant for EHR integration.",
          techStack: "Python 3.11, TensorFlow 2.x, FastAPI, PostgreSQL, React 18, TypeScript, AWS (NHS-approved region), HL7 FHIR APIs, NHS Spine integration, Redis, Docker, NHS login integration",
          dataArchitecture: "NHS data flow: NHS Spine → CareAI FHIR Gateway → ML Prediction Engine → Scheduling Optimizer → Trust EPR. Patient data: Encrypted at rest (AES-256), in transit (TLS 1.3). Data residency: UK only (AWS London). HL7 FHIR R4 for interoperability. Audit logging for Information Governance. No patient identifiable data leaves NHS boundary.",
          aiMethodology: "Appointment no-show prediction: Gradient boosting + LSTM hybrid. Training: 2.3M historical NHS appointments (anonymized, data sharing agreement). Features: appointment type, patient history, demographics (age, deprivation index), weather, day/time. Accuracy: 87% AUC-ROC on holdout test. Explainability: SHAP values for each prediction. Model monitored for drift weekly.",
          complianceDesign: "DCB0129 Clinical Risk Management: Approved October 2025 (documentation available). DCB0160 Clinical Safety Officer: Named CSO appointed. NHS DTAC (Digital Technology Assessment Criteria): Self-assessment complete. GDPR Article 35 DPIA: Completed with trust IG teams. Cyber Essentials Plus: Certified. NHS DSP Toolkit: Submitted (Standards Exceeded).",
          patentStatus: "No patents filed - focus on NHS relationship and clinical evidence as competitive moat. Trade secrets: ML model architecture and training methodology (documented internally). Trademark: 'CareAI' UK application TM-2024-00892 (registered).",
          founderEducation: "MBBS Medicine, King's College London, 2018. MSc Health Informatics, UCL, 2022 (Distinction). GMC registered (currently non-practicing). NHS Digital Academy Fellow 2023. Clinical Safety Officer (CSO) certified.",
          founderWorkHistory: "Junior Doctor (F1-F2), NHS (2018-2020): Frontline experience of scheduling inefficiencies. Health Informatics Lead, UCLH (2020-2023): Led EPR implementation, £2M project. Product Manager, Babylon Health (2023-2024): AI triage product, 500K users. Clinical Advisory roles at 3 NHS startups.",
          founderAchievements: "UCLH EPR implementation: £2M project delivered on time, 3,000 staff trained. Babylon: Improved AI triage accuracy from 78% to 86%. Published: 'AI in NHS Scheduling' (BMJ Health & Care Informatics, 2023). NHS Innovation Award finalist 2024. Built clinical safety framework now used by 3 healthtech startups.",
          relevantProjects: "UCLH: Full EPR rollout (Epic Systems), 500-bed hospital. Babylon: AI symptom checker improvements. Personal: NHS appointment prediction research (UCL dissertation). Clinical: 2 years frontline NHS experience understanding patient flow challenges.",
          funding: "180000",
          fundingSources: "£80,000 personal savings (from Babylon salary). £60,000 SBRI Healthcare grant (reference: SBRI-H-2024-0567). £40,000 angel investment (NHS clinical informatics leaders, 2 investors). Total: £180,000 for 18-month runway through NHS procurement.",
          monthlyProjections: "Year 1 (pilot phase): £0 revenue (NHS pilots are unpaid validation). Costs: £8K/month. Year 2 (first contracts): Month 1-6: 2 trusts at £36K/year each = £6K/month. Month 7-12: 5 trusts = £15K/month. Year 2 total: £126K revenue. Year 3: 15 trusts, £540K revenue, break-even month 28.",
          customerAcquisitionCost: "8500",
          lifetimeValue: "108000",
          paybackPeriod: "8",
          detailedCosts: "Cloud infrastructure (AWS NHS-approved): £18K/year. Clinical Safety Officer (contractor): £24K/year. Development (2 engineers): £120K/year. Compliance/certifications: £15K/year. Marketing (NHS conferences, HETT): £12K/year. Legal (NHS contracts): £8K/year. Office: £6K/year. Total Year 1: £96K (pilot phase, pre-revenue).",
          competitors: "1. DrDoctor (£50K+/trust, appointment reminders only, no AI). 2. Livi/Kry (video consultations, not scheduling). 3. AccuRx (messaging focus, SMS reminders). 4. Q-Flow (queue management, not predictive). 5. In-house NHS solutions (spreadsheets, limited functionality). Our advantage: Only AI-powered scheduling optimizer with proven NHS integration and clinical safety certification.",
          competitiveDifferentiation: "35% DNA reduction vs 15-20% for SMS-only reminders. Predictive scheduling (proactive) vs reactive reminders. Full NHS integration (HL7 FHIR, Spine) vs standalone apps. DCB0129 certified (many competitors not clinically certified). £36K/year vs £50K+ competitors. Built by clinician-founder with NHS experience.",
          customerInterviews: "38 interviews with NHS stakeholders (June-September 2025). Roles: Clinical directors (8), Operations managers (12), IT leads (10), Clinicians (8). Key findings: (1) DNA is top operational priority. (2) Existing tools 'not intelligent'. (3) Integration with EPR essential. (4) Budget available via efficiency savings. (5) Clinical safety certification non-negotiable.",
          lettersOfIntent: "3 NHS Trust letters of support for continued deployment post-pilot. 2 additional trusts (Birmingham, Newcastle) requesting pilot access. NHS England regional team interest for potential national framework. Combined pipeline: 8 trusts, £288K potential Year 2 revenue.",
          willingnessToPay: "NHS benchmark: Trusts pay £30-60K/year for patient engagement tools. Our pricing: £36K/year (250-bed trust), £72K/year (500+ beds). 3 pilot trusts confirmed budget allocation for Year 2 contracts. ROI: £156K DNA savings vs £36K cost = 4.3x return (compelling NHS business case).",
          marketSize: "TAM: UK NHS healthcare IT market £6.5B. SAM: Patient scheduling/engagement software £180M (growing 12%/year). SOM: Year 1: £0 (pilots). Year 2: £126K (5 trusts). Year 3: £540K (15 trusts). 8% SAM penetration by Year 5 achievable given NHS procurement cycles.",
          regulatoryRequirements: "DCB0129/DCB0160 Clinical Risk Management: Achieved. NHS DTAC: Completed. GDPR/UK GDPR: DPIA completed with trust IG. Cyber Essentials Plus: Certified. NHS DSP Toolkit: Standards Exceeded. MHRA: Not a medical device (scheduling tool, not diagnostic). Total compliance investment: £35K.",
          complianceTimeline: "Month 1-3: DCB0129 approval (achieved October 2025). Month 4-6: NHS DSP Toolkit submission. Month 6-12: Trust-by-trust IG approvals for each new customer. Ongoing: Annual DSP Toolkit renewal, quarterly security audits. Year 2: ISO 27001 certification for larger trust requirements.",
          complianceBudget: "35000",
          jobCreation: "15",
          hiringPlan: "Year 1: Founder + 1 engineer + CSO contractor. Year 2: 2 engineers (£110K), Customer Success (£45K), Sales (NHS specialist, £55K). Year 3: Head of Product (£75K), 2 more engineers (£110K), Implementation Lead (£50K), Marketing (£45K). Total: 15 FTE by end Year 3.",
          specificRegions: "Year 1-2: England (3 pilot trusts + expansion to 15). Focus: Acute trusts in London, Midlands, North. Year 3: Scotland (NHS Scotland has different procurement). Wales and NI: Year 4+. Strategy: Build English NHS track record before devolved nations.",
          expansion: "Vertical: Speciality-specific scheduling (cancer pathways, mental health, elective care recovery). Horizontal: Outpatient to inpatient scheduling, theatre scheduling, community appointments. Product: Patient self-booking portal, waiting list management, capacity planning.",
          internationalPlan: "Year 5+: Ireland (HSE, similar NHS model). Australia, Canada (public health systems). Focus: UK NHS leadership position before international. Challenge: Each health system requires separate clinical certification. Strategy: Partner with local health IT companies for international.",
          vision: "5-year vision: UK's leading AI-powered NHS scheduling platform. 100 NHS trusts (25% market), £5M ARR, 35 employees. Expanded to waiting list management and capacity planning. Exit potential: Acquisition by NHS IT vendor (EMIS, TPP) or US health IT company entering UK market.",
          targetEndorser: "Primary: Envestors (NHS focus, healthtech specialization). Alternative: Innovator International (digital health expertise). Rationale: Envestors has deep NHS connections, portfolio includes successful NHS startups, understands NHS procurement and clinical safety requirements.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, clinical safety strategy. (2) Month 6: Pilot results, DCB0129 approval. (3) Month 12: First commercial contracts, Year 1 metrics. (4) Month 18: Growth metrics, trust expansion. (5) Month 24: Series A preparation, product roadmap. (6) Month 30: Scale strategy, national framework discussions.",
          experience: "Uniquely qualified: Medical degree + health informatics MSc + NHS clinical experience. Built EPR systems serving 3,000 staff. Babylon: AI healthcare product at scale. Deep understanding of NHS procurement, clinical governance, IG requirements. Network: NHS CCIO community, healthtech investors, NHS England contacts.",
          revenue: "SaaS per trust: Small trust (<250 beds) £36K/year, Medium (250-500) £54K/year, Large (500+) £72K/year. Implementation: £5K one-time setup. Support: Included in SaaS. Expansion: Waiting list module +£18K/year, Theatre scheduling +£24K/year. LTV: £108K (3-year average contract). CAC: £8.5K (NHS sales cycle). Gross margin: 78%.",
        },
        { // MedAssist - Clinical Decision Support - COMPREHENSIVE
          businessName: "MedAssist",
          industry: "HealthTech / Clinical Decision Support / Medical AI",
          problem: "Diagnostic errors affect 10-15% of UK patients, causing 35,000 preventable deaths annually. Junior doctors make critical decisions with limited specialist access (average 4-hour wait for senior review). Current clinical decision support tools are rule-based (1990s technology), not AI-powered, and have low clinician adoption (18%).",
          innovationStage: "mvp-complete",
          productStatus: "AI-powered clinical decision support system trained on 2.5 million anonymized patient records from UK hospitals. Validated with 94% accuracy in diagnostic suggestions across 50 common conditions. MHRA Class IIa certification application submitted September 2025. Piloting with 5 NHS trusts (emergency departments and acute medicine).",
          existingCustomers: "5 NHS Trust pilots: Royal Free London (ED, 200 patients/day), King's College Hospital (acute medicine), Sheffield Teaching (general medicine), Bristol Royal Infirmary (ED), Cambridge University Hospitals (acute assessment). 120 clinicians actively using system. Clinical champion network established.",
          tractionEvidence: "Pilot metrics (3 months): 15,000 clinical decision support queries. 94% diagnostic accuracy (validated against senior clinician review). Time to diagnosis: Reduced by 23 minutes average. Clinician adoption: 72% (vs 18% industry benchmark). Safety: 0 adverse events, 3 near-misses flagged (system working as designed). Qualitative: 'Game-changer for night shifts' - ED Registrar.",
          uniqueness: "Clinical advantages: (1) 94% diagnostic accuracy (validated on UK data). (2) Real-time evidence-based recommendations with NICE guideline integration. (3) Seamless NHS EPR integration (Epic, Cerner, EMIS). (4) Explainable AI (clinicians see reasoning, not black box). (5) MHRA Class IIa certification pathway (most competitors not medical device certified).",
          techStack: "Python 3.11, PyTorch 2.0, BERT-based medical language model (fine-tuned on UK clinical notes), HL7 FHIR R4, PostgreSQL, React 18, TypeScript, Azure UK South (NHS-approved), Kubernetes, MLflow for model management, DCB0129/DCB0160 compliant architecture",
          dataArchitecture: "NHS clinical data flow: Trust EPR (Epic/Cerner) → HL7 FHIR interface → MedAssist inference engine → Recommendation display in EPR. Training data: 2.5M anonymized UK patient records (data sharing agreements with 3 trusts). Model: On-premise deployment option for trusts with data sovereignty requirements. Audit trail: Every recommendation logged with clinician decision for continuous learning.",
          aiMethodology: "Architecture: Fine-tuned BioBERT + clinical reasoning layer + NICE guideline knowledge graph. Training: 2.5M UK patient records, 500K clinical notes, validated against 10,000 expert-reviewed cases. Accuracy: 94% top-3 diagnostic accuracy (senior clinician benchmark: 91%). Explainability: Attention visualization + natural language explanation. Continuous learning: Feedback loop from clinician corrections. Bias testing: Validated across age, sex, ethnicity subgroups.",
          complianceDesign: "MHRA Class IIa medical device: Application submitted September 2025 (decision expected Q2 2026). DCB0129 Clinical Risk Management: Approved. DCB0160 Clinical Safety Officer: Named CSO (NHS consultant). UKCA marking: Planned post-MHRA approval. GDPR: DPIA completed, Article 22 automated decision-making (human override mandatory). ISO 13485: Quality management system implemented. Clinical trials: NHS REC approved study protocol.",
          patentStatus: "UK Patent Application GB2413567.2 filed August 2025: 'Method and system for explainable clinical decision support using hybrid knowledge graph and language model architecture'. Defensive publication for training methodology. Trade secrets: UK-specific clinical language model weights. Trademark: 'MedAssist' registered.",
          founderEducation: "PhD Artificial Intelligence in Medicine, University of Oxford, 2024 (thesis: 'Deep Learning for Clinical Diagnosis Support'). MBBS Medicine, Imperial College London, 2018. GMC registered. NHS Digital Academy Fellow. MHRA medical device regulatory training.",
          founderWorkHistory: "Clinical AI Researcher, Oxford BioMedical AI Lab (2020-2024): PhD research, published 8 papers, £500K grant holder. Junior Doctor (F1-F2), Oxford University Hospitals (2018-2020): Experienced diagnostic uncertainty firsthand. Research Intern, DeepMind Health (Summer 2019): Worked on AlphaFold team. Clinical Advisor, 2 AI healthtech startups.",
          founderAchievements: "Oxford: 8 peer-reviewed publications in Nature Medicine, JAMA, BMJ. £500K MRC grant for clinical AI research (Principal Investigator). Best Paper Award, Machine Learning for Healthcare 2023. Featured in BBC Horizon documentary on AI in medicine. Built diagnostic AI that outperformed junior doctors in blinded study (published BMJ 2024).",
          relevantProjects: "Oxford PhD: Diagnostic AI for 50 common conditions (2.5M patient dataset). DeepMind: Contributed to kidney injury prediction system (deployed in 3 hospitals). Personal: Open-source medical NLP library (3,200 GitHub stars, used by 15 research groups). Clinical: 2 years NHS frontline experience understanding diagnostic challenges.",
          funding: "250000",
          fundingSources: "£100,000 Innovate UK Biomedical Catalyst grant (reference: BMC-2024-0789). £80,000 personal savings + PhD completion bonus. £50,000 angel investment (2 NHS clinical AI experts). £20,000 University of Oxford spinout fund. Total: £250,000 for MHRA certification and 18-month runway.",
          monthlyProjections: "Year 1 (certification + pilots): £0 revenue (NHS pilots unpaid). Costs: £12K/month. Year 2 (post-MHRA): Month 1-6: 3 trusts at £60K/year each = £15K/month. Month 7-12: 8 trusts = £40K/month. Year 2 total: £330K revenue. Year 3: 25 trusts, £1.5M revenue, profitable month 30.",
          customerAcquisitionCost: "15000",
          lifetimeValue: "180000",
          paybackPeriod: "10",
          detailedCosts: "MHRA certification (regulatory consultants, clinical trials): £60K. Cloud infrastructure (Azure NHS): £24K/year. Engineering team (3): £180K/year. Clinical Safety Officer: £30K/year. Research (model improvement): £25K/year. Legal (NHS contracts, IP): £15K/year. Conferences/publications: £10K/year. Total Year 1: £144K.",
          competitors: "1. IBM Watson Health (discontinued UK NHS contracts, complexity issues). 2. Infermedica (symptom checker, not clinical-grade). 3. Isabel Healthcare (rule-based, 1990s technology, low adoption). 4. Babylon/eMed (triage focus, not decision support). 5. DXplain (US-focused, not UK validated). Our advantage: Only UK-validated, MHRA-certified, explainable AI clinical decision support system.",
          competitiveDifferentiation: "94% accuracy vs 70-80% rule-based competitors. Explainable AI (clinicians understand reasoning) vs black-box. UK clinical data trained (not US population). MHRA Class IIa vs no medical device certification. NHS EPR integrated vs standalone app. Clinician-founded (understands workflow) vs tech-first companies.",
          customerInterviews: "52 NHS clinician interviews (January-June 2025). Roles: Consultants (15), Registrars (18), Junior doctors (12), Clinical directors (7). Key findings: (1) 'I need a second opinion at 3am'. (2) Existing tools 'useless, we ignore them'. (3) Must integrate with EPR (no separate login). (4) Explainability essential ('I need to know why'). (5) Budget available for patient safety tools.",
          lettersOfIntent: "5 NHS Trust letters of intent for commercial contracts post-MHRA certification. 3 additional trusts (Newcastle, Southampton, Nottingham) requesting pilot access. NHS England patient safety team interest. Combined pipeline: 11 trusts, £660K potential Year 2 revenue.",
          willingnessToPay: "NHS benchmark: Trusts pay £40-100K/year for clinical decision support (low adoption tools). Our pricing: £60K/year (district general), £120K/year (teaching hospital). ROI: 23 minutes faster diagnosis × 50,000 patients = £450K efficiency savings vs £60K cost. Patient safety value: Priceless (regulatory compliance, CQC rating).",
          marketSize: "TAM: Global clinical decision support $4.5B (growing 15%/year). SAM: UK NHS clinical AI market £280M. SOM: Year 1: £0 (pilots). Year 2: £330K (8 trusts). Year 3: £1.5M (25 trusts). 5% SAM penetration by Year 5 realistic given MHRA certification barrier to entry.",
          regulatoryRequirements: "MHRA Class IIa Medical Device: Application submitted, 9-12 month review (£60K total). DCB0129/DCB0160: Achieved. NHS DTAC: Completed. ISO 13485 Quality Management: Implemented. UKCA Marking: Post-MHRA. Clinical Trial (NHS REC): Approved. GDPR Article 22: Human override mandatory. Total regulatory budget: £85K.",
          complianceTimeline: "Month 1-6: MHRA application submission (completed September 2025). Month 6-12: MHRA review, respond to queries. Month 12-15: Expected MHRA approval. Month 15: UKCA marking, commercial launch. Ongoing: Post-market surveillance, annual MHRA reporting, continuous clinical evidence collection.",
          complianceBudget: "85000",
          jobCreation: "22",
          hiringPlan: "Year 1: Founder + 2 ML engineers + CSO (contractor). Year 2: 3 engineers (£180K), Clinical Lead (£90K), Sales (£60K), Customer Success (£50K), Regulatory (£55K). Year 3: VP Engineering (£100K), 4 more engineers (£240K), Marketing (£50K), Operations (£45K). Total: 22 FTE by end Year 3.",
          specificRegions: "Year 1-2: England (5 pilot trusts → 25). Focus: Teaching hospitals, large acute trusts (complex cases, budget). Year 3: Scotland (NHS Scotland framework). Wales/NI: Year 4. International: Year 5+ (CE marking for EU, FDA for US). Strategy: UK evidence base essential before global.",
          expansion: "Vertical: Specialty-specific modules (cardiology, oncology, neurology, pediatrics). Horizontal: Primary care (GP clinical decision support), mental health, community. Product: Diagnostic imaging AI, lab result interpretation, treatment pathway recommendations. Research: Academic partnerships for continuous model improvement.",
          internationalPlan: "Year 4: EU (CE marking, start with Ireland, Netherlands). Year 5: US (FDA 510(k) pathway, partner with US health system). Australia, Canada: Year 6+. Strategy: UK MHRA certification as gold standard, reference customer base for international. Challenge: Each market requires separate regulatory approval and local clinical validation.",
          vision: "5-year vision: UK's leading clinical AI company, global ambition. 100 UK hospitals, EU and US presence. £20M ARR, 80 employees. Platform: Multiple clinical AI products (diagnosis, treatment, imaging). Research: Continuous collaboration with leading academic centers. Exit potential: Acquisition by major health IT company (Epic, Oracle Health) or pharmaceutical company (AI drug discovery synergy).",
          targetEndorser: "Primary: Envestors (NHS HealthTech expertise). Alternative: Innovator International (life sciences and clinical AI focus). Rationale: Envestors understands clinical AI regulatory pathway, portfolio includes MHRA-certified companies, strong NHS network connections.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, MHRA strategy, clinical evidence plan. (2) Month 6: Pilot results, safety data, MHRA progress. (3) Month 12: MHRA approval, first contracts. (4) Month 18: Growth metrics, clinical outcomes data. (5) Month 24: Series A preparation, EU expansion plan. (6) Month 30: International strategy, platform evolution.",
          experience: "Uniquely qualified: Oxford PhD in clinical AI + medical degree + NHS clinical experience. Published 8 papers in top medical AI journals. £500K grant funding track record. DeepMind Health internship (global leader). Deep understanding of MHRA certification, NHS procurement, clinical workflow. Network: Academic AI community, NHS clinical informatics leaders, healthtech investors.",
          revenue: "SaaS per trust: District General (300 beds) £60K/year, Teaching Hospital (500+ beds) £120K/year, Specialist Trust £80K/year. Implementation: £10K one-time setup + training. Specialty modules: +£20K/year each. Research partnerships: £50K+/year (data access for model improvement). LTV: £180K (3-year average contract). CAC: £15K. Gross margin: 82%.",
        },
        { // HealthFlow - NHS Integration - COMPREHENSIVE
          businessName: "HealthFlow",
          industry: "HealthTech / NHS Integration / Healthcare Interoperability",
          problem: "NHS systems are critically fragmented - data siloed across 200+ IT systems. Clinicians waste 2 hours daily searching patient information across 5+ platforms. 41% of adverse events involve missing information. NHS spends £1.8B annually on failed IT integrations. Integrated Care Systems need unified patient views.",
          innovationStage: "pre-mvp",
          productStatus: "Building unified NHS data integration platform using HL7 FHIR R4 and UK Core profiles. Technical architecture designed and validated with NHS Digital. Partnership discussions with 2 Integrated Care Systems. NHS Digital interoperability program alignment confirmed. Prototype connecting 3 data sources complete.",
          existingCustomers: "Pre-launch: 2 Integrated Care Systems expressing interest (Northeast and North Cumbria ICS, Birmingham and Solihull ICS). Advisory board includes: NHS England interoperability lead, 2 Trust CIOs, NHS Digital architect. 35 expressions of interest from NHS organizations via conference networking.",
          tractionEvidence: "Technical: Prototype connecting GP (EMIS), Hospital (Epic), Community (RiO) systems - successfully demonstrated. Partnership: NHS Digital interoperability program alignment letter. Interest: 2 ICS LOIs, 35 expressions of interest. Team: Co-founder is former NHS Digital architect. Grant: Innovate UK Digital Health application submitted.",
          uniqueness: "Platform advantages: (1) Single patient view across all NHS systems (GP, hospital, community, social care). (2) 90% reduction in clinician data lookup time (based on comparable implementations). (3) Built on NHS-mandated standards (HL7 FHIR UK Core, NHS Number). (4) Real-time vs batch sync (competitors are 24-hour delay). (5) Open API for third-party innovation.",
          techStack: "Java 17, Spring Boot 3.0, HL7 FHIR R4 (HAPI FHIR), Apache Kafka for event streaming, PostgreSQL, Angular 16, Azure UK South (NHS-approved), NHS Spine APIs, NHS Login, NHS Digital Identity, Docker, Kubernetes, Terraform",
          dataArchitecture: "Event-driven integration: Source systems (EMIS, Epic, Cerner, RiO, Paris) → FHIR adapter layer → Kafka event stream → HealthFlow data lake (FHIR resources) → API gateway → Consumer applications. NHS Number as universal patient identifier. Consent management: National Data Opt-Out compliance. Data residency: UK only. No persistent PII storage (pass-through architecture option).",
          aiMethodology: "Not applicable - this is a healthcare integration platform, not an AI/ML product. Our innovation is in interoperability architecture and real-time data synchronization across heterogeneous NHS systems. Future: AI-powered data quality monitoring and entity resolution for patient matching.",
          complianceDesign: "NHS Digital FHIR UK Core compliance: Architected from ground up. DCB0129: Clinical safety case in preparation. NHS DTAC: Self-assessment complete. GDPR/National Data Opt-Out: Consent management integrated. NHS DSP Toolkit: Standards Met target. Cyber Essentials Plus: Certified. IG Toolkit: NHS standard information governance. ISO 27001: Planned Year 2.",
          patentStatus: "No patents - interoperability uses open standards (deliberate strategy for NHS adoption). Competitive advantage through NHS relationships, implementation expertise, and speed of deployment. Trademark: 'HealthFlow' UK application submitted.",
          founderEducation: "MSc Computer Science, University of Cambridge, 2019 (Distinction, thesis on healthcare interoperability). BSc Computer Science, University of Birmingham, 2017 (First Class). HL7 FHIR certification. AWS Solutions Architect. PRINCE2 Practitioner.",
          founderWorkHistory: "Senior Architect, NHS Digital (2019-2024): Led national interoperability program, £15M budget, connected 50+ systems. Tech Lead, Cerner UK (2017-2019): Hospital EPR implementations, 5 NHS trusts. Co-founder has 20 years NHS IT experience, former Trust CIO.",
          founderAchievements: "NHS Digital: Led successful connection of 50+ NHS systems to national infrastructure. Designed FHIR implementation guides used by 200+ NHS organizations. Speaker at NHS Confederation, HETT, Rewired conferences. Published: 'Practical FHIR Implementation in NHS' (Digital Health journal). NHS IT Architect of the Year shortlist 2023.",
          relevantProjects: "NHS Digital: National Events Management Service (connects all NHS trusts). GP Connect program (12M+ API calls/month). NHS App FHIR integration. Cerner: 5 NHS trust EPR implementations. Personal: Open-source NHS FHIR testing toolkit (used by 40+ NHS organizations). Technical advisor to 3 healthtech startups.",
          funding: "200000",
          fundingSources: "£100,000 Innovate UK Digital Health grant (application submitted, decision pending). £60,000 personal savings (founders combined). £40,000 angel investment (2 NHS CIO angels). Total: £200,000 for MVP completion and first ICS pilot (18-month runway).",
          monthlyProjections: "Year 1 (build + first pilot): £0 revenue (ICS pilot unpaid). Costs: £10K/month (£120K annual). Year 2 (commercial): Month 1-6: 1 ICS at £150K/year = £12.5K/month. Month 7-12: 3 ICS = £37.5K/month. Year 2 total: £300K revenue. Year 3: 8 ICS + 10 trusts = £1.8M revenue, profitable month 32.",
          customerAcquisitionCost: "25000",
          lifetimeValue: "450000",
          paybackPeriod: "12",
          detailedCosts: "Cloud infrastructure (Azure NHS): £30K/year. Engineering team (4): £240K/year. NHS Digital/IG consultants: £20K/year. Legal (NHS contracts): £12K/year. Marketing (NHS conferences): £10K/year. Office/admin: £8K/year. Total Year 1: £120K (pre-revenue).",
          competitors: "1. InterSystems HealthShare (expensive, US-centric, £500K+ implementations). 2. Rhapsody (complex, requires consultants). 3. Graphnet (limited real-time capability). 4. In-house NHS trust solutions (siloed, not scalable). 5. Cloud vendors (AWS/Azure) with FHIR (need significant customization). Our advantage: UK NHS-native, founders with NHS Digital pedigree, real-time architecture, 80% lower cost.",
          competitiveDifferentiation: "80% cheaper than InterSystems (£150K vs £500K+ for ICS). Real-time sync vs 24-hour batch (competitors). NHS UK Core native (not adapted US product). Founded by NHS Digital architects (unique credibility). Open API strategy (ecosystem vs lock-in). ICS-focused (Integrated Care System-ready from day one).",
          customerInterviews: "45 interviews with NHS integration stakeholders (March-August 2025). Roles: ICS digital leads (8), Trust CIOs (15), CCIO/CMIOs (12), NHS Digital (5), Suppliers (5). Key findings: (1) 'We've failed 3 integration projects'. (2) Need real-time, not batch. (3) ICS mandate driving urgency. (4) Budget exists (ICS transformation funding). (5) Want UK vendor they can trust.",
          lettersOfIntent: "2 ICS letters of intent: Northeast and North Cumbria ICS (2M population, integration priority), Birmingham and Solihull ICS (1.3M population). 5 NHS trusts interested in joining ICS pilots. Combined pipeline: 2 ICS + 5 trusts, £500K potential Year 2 revenue.",
          willingnessToPay: "NHS benchmark: ICS pay £150-500K for integration platforms. Our pricing: £150K/year per ICS (population-based scaling). Trust add-on: £30K/year each. ROI: 2 hours/clinician/day saved × 10,000 clinicians = £15M value vs £150K cost. ICS transformation funding available 2024-2027.",
          marketSize: "TAM: UK NHS health IT integration £2.5B. SAM: ICS integration platforms £420M (42 ICSs × £10M average IT spend × 10% integration). SOM: Year 1: £0 (pilots). Year 2: £300K (3 ICS). Year 3: £1.8M (8 ICS). 15% SAM penetration by Year 5 achievable with NHS relationships.",
          regulatoryRequirements: "DCB0129 Clinical Risk Management: In preparation (if connecting clinical systems). NHS DTAC: Self-assessment complete. NHS DSP Toolkit: Standards Met. GDPR/National Data Opt-Out: Integrated. Cyber Essentials Plus: Certified. ISO 27001: Planned Year 2 for larger ICS requirements. NHS Digital FHIR conformance: Tested against UK Core profiles. Total compliance budget: £40K.",
          complianceTimeline: "Month 1-3: DCB0129 preparation (if clinical use cases). Month 3-6: NHS Digital FHIR conformance testing. Month 6: First ICS pilot go-live. Month 12: ISO 27001 preparation. Ongoing: Annual DSP Toolkit, quarterly security audits. Year 2: ISO 27001 certification for enterprise ICS contracts.",
          complianceBudget: "40000",
          jobCreation: "20",
          hiringPlan: "Year 1: 2 founders + 2 FHIR engineers. Year 2: 4 engineers (£240K), Implementation Lead (£60K), Sales (NHS specialist, £55K), Customer Success (£45K). Year 3: VP Engineering (£90K), 4 more engineers (£240K), Marketing (£50K), Operations (£45K), DevOps (£60K). Total: 20 FTE by end Year 3.",
          specificRegions: "Year 1-2: England (focus on 3-5 'digital pioneer' ICSs in Northeast, West Midlands). Year 3: Scale to 15 ICSs. Scotland (NHS Scotland): Year 4 (different architecture, separate product work). Wales/NI: Year 5. Strategy: Prove value in ambitious ICSs, then reference sell to others.",
          expansion: "Vertical: Social care integration (council systems), mental health, community pharmacy. Horizontal: Analytics layer on integrated data, population health dashboards. Product: Patient-facing data access app, research data platform (anonymized), supplier marketplace (certified FHIR apps). International: NHS proof points enable export to similar health systems.",
          internationalPlan: "Year 5+: Ireland (HSE), Nordic countries (similar public health systems). Year 6: Australia (state health systems). Strategy: UK NHS success as global reference. Partnership model for international (local implementation partners). Challenge: Each country has different interoperability standards. Focus: Become UK market leader first.",
          vision: "5-year vision: UK's national health data integration layer. 35 of 42 ICSs using HealthFlow. £25M ARR, 65 employees. Platform: Core integration + analytics + marketplace. Position: Preferred NHS integration partner. Exit potential: Acquisition by global health IT vendor (Oracle Health, Microsoft Health) or NHS national procurement framework (stable long-term revenue).",
          targetEndorser: "Primary: Envestors (digital infrastructure expertise). Alternative: Innovator International (healthcare innovation focus). Rationale: Envestors understands platform/infrastructure businesses, has connections to enterprise buyers and investors. Innovator International as secondary for NHS-specific innovation guidance.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, NHS Digital relationship strategy. (2) Month 6: Prototype demo, first ICS pilot confirmed. (3) Month 12: Pilot results, integration metrics. (4) Month 18: Commercial contracts, ICS expansion. (5) Month 24: Series A preparation, platform strategy. (6) Month 30: Scale plan, national framework discussion.",
          experience: "Uniquely qualified: 5 years at NHS Digital leading national interoperability (£15M budget, 50+ systems connected). Deep understanding of NHS architecture, procurement, politics. Co-founder: 20 years NHS IT, former Trust CIO. Technical: HL7 FHIR expert, wrote implementation guides used by 200+ NHS orgs. Network: Every ICS digital lead, NHS England, NHS Digital architects.",
          revenue: "Platform licensing: ICS (population-based) £150-300K/year, Trust add-on £30K/year. Implementation: £25K one-time per organization. Support: Included in license. Add-ons: Analytics dashboard +£40K/year, Patient portal +£50K/year. LTV: £450K (3-year average ICS contract). CAC: £25K (long NHS sales cycle). Gross margin: 75%.",
        },
      ],
      ecommerce: [
        { // ShopSmart - AI Recommendations - COMPREHENSIVE
          businessName: "ShopSmart AI",
          industry: "E-commerce / AI Recommendations / Retail Technology",
          problem: "UK retailers lose £18 billion annually to poor product recommendations and missed cross-sell opportunities. Generic recommendation engines have only 2-3% click-through rates because they use basic 'customers also bought' logic. SME retailers can't afford enterprise solutions like Dynamic Yield (£2K+/month), leaving 95% of UK e-commerce sites with no personalization.",
          innovationStage: "mvp-complete",
          productStatus: "AI recommendation engine live with 15 Shopify/WooCommerce clients across fashion, homeware, and food categories. Achieving 8.5% CTR on recommendations (vs 2.5% industry average). Processing 2.3 million product interactions monthly. Average 23% increase in basket size. 4.8/5 customer satisfaction rating.",
          existingCustomers: "15 paying clients including: Luna Fashion Boutique (Shopify, 50K products, testimonial: 'Sales up 34% since adding ShopSmart'), HomeStyle UK (WooCommerce, £180K monthly GMV), Artisan Coffee Co (specialty foods, 28% AOV increase). Mix: 60% fashion, 25% homeware, 15% food/drink.",
          tractionEvidence: "Metrics: 15 paying customers, £4,200 MRR (average £280/month). CTR: 8.5% vs 2.5% industry. Revenue attribution: £127K additional sales driven (tracked). AOV increase: 23% average across clients. Churn: 1 customer in 6 months (7% quarterly). Integration time: 5.2 minutes average.",
          uniqueness: "Measurable results: (1) 8.5% CTR vs 2.5% industry (3.4x improvement). (2) 23% AOV increase (tracked and attributed). (3) 5-minute Shopify/WooCommerce plugin install. (4) £49-199/month vs £2K+ enterprise. (5) Works with as few as 100 products (competitors need 10K+). (6) No data scientist required.",
          techStack: "Python 3.11, TensorFlow Recommenders 0.7, FastAPI, Redis for real-time inference, PostgreSQL, React 18, TypeScript, Shopify/WooCommerce REST APIs, AWS (Lambda, S3, SageMaker), Docker, GitHub Actions CI/CD",
          dataArchitecture: "Data pipeline: E-commerce platform webhooks (orders, views, carts) → AWS Kinesis → Feature store (Redis) → Real-time inference (SageMaker endpoint) → JSON API response. Batch training: Nightly model retraining on new interaction data. A/B testing: Built-in experimentation framework. GDPR: No PII stored, only anonymized behavioral data.",
          aiMethodology: "Hybrid recommendation system: Collaborative filtering (user-item matrix factorization) + Content-based (product embeddings from descriptions/images) + Sequential (transformer-based next-item prediction). Training: 15M anonymized interactions. Cold-start: Content-based fallback for new products. Accuracy: 8.5% CTR, 0.12 NDCG@10. Model updated nightly.",
          complianceDesign: "GDPR compliant: No PII stored, behavioral data only. Cookie consent: Relies on merchant's existing consent. Data retention: 90 days rolling. Data processing agreement template for merchants. ICO registered as data processor. No cross-merchant data sharing. Privacy policy template provided to merchants.",
          patentStatus: "No patents - focus on speed and execution. Trade secrets: Hybrid model architecture, cold-start solution for small catalogs. Trademark: 'ShopSmart AI' UK application TM-2024-01123 (pending).",
          founderEducation: "MSc Machine Learning, University of Edinburgh, 2022 (Distinction, thesis on e-commerce recommendations). BSc Computer Science, University of Nottingham, 2020 (First Class). AWS Machine Learning Specialty certification. Google TensorFlow certification.",
          founderWorkHistory: "Machine Learning Engineer, ASOS (2022-2024): Built product recommendations for 26M customers, £4B GMV. Data Scientist, Ocado Technology (2020-2022): Demand forecasting and personalization. Intern, Amazon UK (Summer 2019): A9 search ranking team.",
          founderAchievements: "ASOS: Improved recommendation CTR by 18% (£12M incremental revenue). Built real-time personalization system for 26M users. Published: 'Cold-Start Recommendations for Fashion' (RecSys 2023). Mentored 4 junior ML engineers. Speaker: AI in Retail conference 2024.",
          relevantProjects: "ASOS: End-to-end recommendation system for fashion (26M users, 800K products). Ocado: Personalized substitution recommendations. Edinburgh thesis: 'Transfer Learning for Small Catalog Recommendations'. Personal: Open-source recommendation library (1,800 GitHub stars).",
          funding: "75000",
          fundingSources: "£45,000 personal savings (from ASOS salary). £20,000 family investment (loan agreement). £10,000 Edinburgh entrepreneurship fund. Total: £75,000 for 12-month runway.",
          monthlyProjections: "Year 1: Current - £4.2K MRR, growing 15%/month. Month 6-12: £12K MRR target. Year 1 total: £85K revenue, £72K costs. Year 2: £35K MRR by month 24, £420K revenue. Year 3: £80K MRR, £960K revenue, profitable month 20.",
          customerAcquisitionCost: "120",
          lifetimeValue: "2520",
          paybackPeriod: "2",
          detailedCosts: "Cloud (AWS): £12K/year. Marketing (content, Shopify app store ads): £18K/year. Founder salary (Year 2): £42K. Customer support tools: £3K/year. Legal/accounting: £5K/year. Office (coworking): £4K/year. Total Year 1: £72K.",
          competitors: "1. Dynamic Yield (enterprise, £2K+/month, complex). 2. Nosto (mid-market, £500+/month, 18% CTR benchmark). 3. Clerk.io (Danish, £200+/month, EU-focused). 4. Shopify native (basic, free, 2% CTR). 5. Recombee (API-only, developer required). Our advantage: SME-focused, best-in-class CTR at lowest price, 5-minute setup.",
          competitiveDifferentiation: "8.5% CTR vs 2-3% basic tools (3.4x improvement). £49-199/month vs £500-2000+ competitors (75-90% cheaper). Works with 100 products (competitors need 10K+). 5-minute install vs days of developer time. UK-focused support (competitors US/EU). No data scientist needed.",
          customerInterviews: "42 SME e-commerce owner interviews (May-August 2025). Key findings: (1) 'Recommendations feel like a big company thing'. (2) Enterprise tools 'too expensive, too complex'. (3) Shopify native is 'useless'. (4) Willing to pay £100-200/month for proven ROI. (5) 'I don't have a data team'.",
          lettersOfIntent: "5 prospects in pipeline: 2 Shopify Plus merchants (£500K+ GMV each), 1 WooCommerce agency (10 client sites), 2 direct referrals from existing customers. Combined potential: £18K additional ARR. Also: Partnership discussions with 2 Shopify agencies.",
          willingnessToPay: "Survey (n=85 e-commerce owners): 78% willing to pay £100-200/month for proven recommendation engine. Current customers paying £49-199/month. Upgrade path: Basic £49 → Pro £99 → Enterprise £199. 35% of customers on Pro tier, 20% on Enterprise.",
          marketSize: "TAM: Global e-commerce personalization $12B. SAM: UK SME e-commerce (Shopify/WooCommerce, 100-50K products) £180M. SOM: Year 1: £85K (0.05%). Year 3: £960K (0.5%). Achievable: Shopify app store has 2M+ stores, we need 0.01% penetration.",
          regulatoryRequirements: "GDPR compliance: Data processor role, DPA template. Cookie regulations: Merchant responsibility. ICO registration: Completed as data processor. No sector-specific regulations. Low regulatory burden for B2B SaaS. Compliance budget: £5K/year (legal review, privacy updates).",
          complianceTimeline: "Ongoing: Annual GDPR review, DPA updates. ICO fee: Annual renewal. Cookie guidance: Quarterly review of ICO updates. Data retention: 90-day automated deletion. Minimal compliance overhead for this business model.",
          complianceBudget: "5000",
          jobCreation: "10",
          hiringPlan: "Year 1: Founder only. Year 2: ML Engineer (£60K), Customer Success (£40K), Marketing (£38K). Year 3: 2 more engineers (£120K), Sales (£45K + commission), Support (£32K). Total: 10 FTE by end Year 3.",
          specificRegions: "Year 1-2: UK focus (Shopify UK, WooCommerce UK stores). Language/support advantage. Year 3: English-speaking markets (US Shopify stores, Australia). Focus: Fashion, homeware, specialty food (proven verticals).",
          expansion: "Vertical: Category-specific models (fashion sizing, food freshness, luxury). Horizontal: Email personalization, search personalization, homepage customization. Platform: BigCommerce, Magento integrations. Product: Shopify Plus enterprise tier with SLA.",
          internationalPlan: "Year 3: US market (largest Shopify ecosystem). Year 4: Australia, Canada. Strategy: English-speaking first (no localization cost). US: Partner with Shopify agencies. Challenge: Time zone support. Focus: UK profitability before US expansion.",
          vision: "5-year vision: #1 AI recommendation engine for SME e-commerce. 5,000 merchants, £8M ARR, 35 employees. Expanded to email + search personalization. Platform integrations: All major e-commerce platforms. Exit potential: Acquisition by Shopify, Klaviyo, or enterprise personalization company.",
          targetEndorser: "Primary: Envestors (digital business, e-commerce focus). Alternative: Innovator International (retail technology). Rationale: Envestors has strong e-commerce portfolio, understands SaaS metrics, connected to retail tech ecosystem.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, product demo. (2) Month 6: Customer metrics, MRR growth. (3) Month 12: Year 1 results, case studies. (4) Month 18: Expansion plans, agency partnerships. (5) Month 24: Series A preparation. (6) Month 30: International expansion, platform strategy.",
          experience: "Uniquely qualified: 4 years building recommendation systems at ASOS (26M customers, £4B GMV). Deep understanding of e-commerce, ML at scale, and SME needs. Technical: TensorFlow, real-time ML, Shopify APIs. Domain: Fashion, homeware, food e-commerce. Network: E-commerce founders, Shopify agencies, ML community.",
          revenue: "Tiered SaaS: Basic £49/month (1K products, 10K visitors), Pro £99/month (10K products, 50K visitors), Enterprise £199/month (50K products, unlimited). Implementation: Self-service (no fee). Revenue share option: 1% of attributed sales (for merchants who prefer performance pricing). LTV: £2,520 (30-month retention). CAC: £120. Gross margin: 85%.",
        },
        { // RetailFlow - Inventory Optimization - COMPREHENSIVE
          businessName: "RetailFlow",
          industry: "E-commerce / Inventory Management / Supply Chain",
          problem: "UK retailers hold £15.2 billion in excess inventory while simultaneously losing £6.8 billion to stockouts annually. Manual inventory forecasting has only 65% accuracy, causing waste, markdowns, and lost sales. SME retailers can't afford enterprise planning tools (SAP, Oracle) costing £50K+.",
          innovationStage: "mvp-complete",
          productStatus: "AI inventory optimization platform with 22 retail clients across fashion, electronics, and grocery. Reducing stockouts by 42% and excess inventory by 31%. Processing 850K SKUs daily. Integrations with Shopify, WooCommerce, Square, Lightspeed, and Vend POS systems. Average ROI: 340% for customers.",
          existingCustomers: "22 paying clients including: TechHub Electronics (£2.4M inventory, reduced stockouts 45%), Urban Fashion Group (3 stores, cut markdowns 38%), Fresh Grocers (perishables, reduced waste 52%). Testimonial: 'RetailFlow paid for itself in the first month through reduced emergency orders' - Sarah T., retail owner.",
          tractionEvidence: "Metrics: 22 customers, £6,800 MRR. Inventory managed: 850K SKUs. Stockout reduction: 42% average. Overstock reduction: 31% average. Customer ROI: 340% average (£3.40 saved per £1 spent). Retention: 95% (1 churn in 8 months). Integration time: 2 hours average.",
          uniqueness: "Proven ROI: (1) 91% demand forecast accuracy (vs 65% manual/spreadsheet). (2) 42% stockout reduction (tracked sales recovered). (3) 31% inventory cost savings (reduced carrying costs). (4) Auto-generated purchase orders. (5) £99-299/month vs £50K+ enterprise. (6) Works with existing POS, no hardware.",
          techStack: "Python 3.11, Prophet + ARIMA + XGBoost ensemble, FastAPI, PostgreSQL, React 18, TypeScript, Stripe, Shopify/Square/Lightspeed APIs, AWS (Lambda, RDS, S3), Docker, Terraform",
          dataArchitecture: "Data flow: POS/E-commerce webhooks → Data ingestion (AWS Lambda) → Time-series database (TimescaleDB) → ML forecasting engine → Inventory optimizer → Dashboard + Purchase order generator. Historical data: 24-month lookback. External data: Weather API, events calendar, economic indicators. Nightly model updates per customer.",
          aiMethodology: "Ensemble forecasting: Prophet (seasonality) + ARIMA (trends) + XGBoost (features). Training: Per-customer model on their historical sales (minimum 6 months data). Features: day of week, seasonality, promotions, weather, local events, supplier lead times. Accuracy: 91% MAPE on 7-day forecast. Safety stock optimization: Service level targeting (95-99% configurable).",
          complianceDesign: "GDPR: Business data only, no consumer PII. Data processing agreements with merchants. ICO registered. Data retention: Customer controls, minimum 24 months for forecasting. SOC 2 Type I: Achieved. API security: OAuth 2.0, rate limiting, encryption.",
          patentStatus: "No patents - focus on execution and customer relationships. Trade secrets: Ensemble model weighting, perishables-specific algorithms. Trademark: 'RetailFlow' UK application TM-2024-01567 (registered).",
          founderEducation: "MSc Operations Research, London School of Economics, 2021 (Distinction). BSc Industrial Engineering, University of Lagos, 2018 (First Class). APICS Certified Supply Chain Professional (CSCP). AWS Solutions Architect.",
          founderWorkHistory: "Supply Chain Analyst, John Lewis Partnership (2021-2024): Built demand forecasting for £4B retail, 50K SKUs. Operations Consultant, Accenture (2019-2021): Retail supply chain projects, £15M combined savings. Intern, Unilever (Summer 2018): Inventory optimization project.",
          founderAchievements: "John Lewis: Improved forecast accuracy from 72% to 86%, saving £8M annually in markdowns. Built automated replenishment system for 50K SKUs. Accenture: Led 3 retail transformation projects, £15M combined client savings. Published: 'AI in Retail Inventory' (Journal of Operations Management, 2023).",
          relevantProjects: "John Lewis: Demand forecasting for 50K SKUs, £4B retail. Accenture: Tesco fresh produce optimization (£5M savings), Boots pharmacy replenishment. LSE dissertation: 'Machine Learning for Multi-Echelon Inventory Optimization'. Personal: Open-source forecasting library (900 GitHub stars).",
          funding: "90000",
          fundingSources: "£50,000 personal savings (from John Lewis salary). £25,000 family investment (loan agreement). £15,000 LSE entrepreneurship grant. Total: £90,000 for 14-month runway.",
          monthlyProjections: "Year 1: Current - £6.8K MRR, growing 12%/month. Month 6-12: £15K MRR target. Year 1 total: £120K revenue, £95K costs. Year 2: £40K MRR by month 24, £480K revenue. Year 3: £90K MRR, £1.08M revenue, profitable month 18.",
          customerAcquisitionCost: "280",
          lifetimeValue: "4800",
          paybackPeriod: "3",
          detailedCosts: "Cloud (AWS): £18K/year. POS integration maintenance: £8K/year. Marketing (content, trade shows): £22K/year. Founder salary (Year 2): £45K. Customer support: £6K/year. Legal/accounting: £6K/year. Office: £5K/year. Total Year 1: £95K.",
          competitors: "1. TradeGecko/QuickBooks Commerce (basic, £150+/month, no AI). 2. Brightpearl (mid-market, £500+/month, complex). 3. SAP/Oracle (enterprise, £50K+/year, overkill for SME). 4. Lokad (AI-powered, expensive, developer needed). 5. Spreadsheets (free, 65% accuracy, time-consuming). Our advantage: AI accuracy at SME price point, plug-and-play integrations.",
          competitiveDifferentiation: "91% accuracy vs 65% manual (26% improvement). 42% stockout reduction (tracked and measured). £99-299/month vs £500-50K competitors (80%+ savings). 2-hour setup vs weeks implementation. Auto purchase orders (time savings). UK-based support, retail expertise.",
          customerInterviews: "38 retail owner interviews (April-July 2025). Key findings: (1) 'I spend 10 hours/week on inventory'. (2) 'Spreadsheets don't work for seasonal'. (3) 'Can't afford enterprise tools'. (4) 'Stockouts kill me during peak'. (5) Willing to pay £200-400/month for proven ROI.",
          lettersOfIntent: "8 prospects in pipeline: 3 Shopify merchants, 2 Square retailers, 1 multi-location chain (8 stores), 2 referrals. Combined potential: £32K additional ARR. Partnership discussions: 1 inventory finance company (referral arrangement), 1 retail association.",
          willingnessToPay: "Current customers: £99-299/month based on SKU count. Average: £309/month. Survey (n=65 retailers): 85% willing to pay £250-400/month for 40%+ stockout reduction. Upgrade path: Starter £99 → Growth £199 → Scale £299.",
          marketSize: "TAM: Global retail inventory management $8B. SAM: UK SME retail inventory software (100-10K SKUs) £240M. SOM: Year 1: £120K (0.05%). Year 3: £1.08M (0.45%). Achievable: UK has 300K+ retail businesses, we need 0.01% penetration.",
          regulatoryRequirements: "Minimal regulatory burden for B2B inventory SaaS. GDPR: Business data, not consumer PII. ICO registered. PCI compliance: Not handling payments directly (Stripe for billing). SOC 2 Type I: Achieved. Industry: No retail-specific regulations for software.",
          complianceTimeline: "Achieved: ICO registration, SOC 2 Type I. Year 2: SOC 2 Type II for enterprise customers. Ongoing: Annual security audits. Minimal ongoing compliance burden for this business model.",
          complianceBudget: "12000",
          jobCreation: "14",
          hiringPlan: "Year 1: Founder + 1 contractor (POS integrations). Year 2: ML Engineer (£65K), Customer Success (£42K), Sales (£45K + commission). Year 3: 2 more engineers (£120K), Implementation Specialist (£38K), Marketing (£40K), Support (£32K). Total: 14 FTE by end Year 3.",
          specificRegions: "Year 1-2: UK focus (retail density, POS ecosystem knowledge). Sectors: Fashion, electronics, grocery (proven verticals). Year 3: Ireland (similar retail landscape). Multi-location: London, Manchester, Birmingham (25% of UK retail).",
          expansion: "Vertical: Industry-specific models (fashion seasons, grocery perishables, electronics launches). Horizontal: Supplier management, purchase order automation, markdown optimization. Product: Multi-location/warehouse. Integration: Xero/Sage accounting sync for cash flow visibility.",
          internationalPlan: "Year 3: Ireland (similar market, easy expansion). Year 4: Australia, Canada (English-speaking, similar retail). US: Year 5 (competitive market, different POS landscape). Strategy: UK profitability and case studies before international.",
          vision: "5-year vision: UK's leading AI inventory platform for SME retail. 2,000 retailers, £6M ARR, 40 employees. Expanded to supplier management and markdown optimization. Platform: All major POS integrations. Exit potential: Acquisition by Lightspeed, Square, or ERP company entering SME market.",
          targetEndorser: "Primary: Envestors (retail technology, SaaS expertise). Alternative: Retail Week Accelerator (retail industry connections). Rationale: Envestors understands SaaS metrics, has retail tech portfolio, connected to investor community.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, product demo. (2) Month 6: Customer ROI metrics, case studies. (3) Month 12: Year 1 results, retention data. (4) Month 18: Growth metrics, partnership announcements. (5) Month 24: Series A preparation. (6) Month 30: International expansion, product roadmap.",
          experience: "Uniquely qualified: 5 years in retail supply chain (John Lewis, Accenture). Built forecasting for £4B retailer, 50K SKUs. Deep understanding of retail operations, inventory challenges, and SME needs. Technical: ML forecasting, time-series analysis, POS integrations. Domain: Fashion, grocery, electronics retail. Network: Retail executives, POS vendors, industry associations.",
          revenue: "Tiered SaaS by SKU count: Starter £99/month (500 SKUs), Growth £199/month (2K SKUs), Scale £299/month (10K SKUs), Enterprise (custom). Implementation: £500 one-time for complex integrations. Add-ons: Advanced forecasting +£50/month, Multi-location +£100/location. LTV: £4,800 (24-month retention). CAC: £280. Gross margin: 82%.",
        },
        { // MarketPro - Marketplace Platform - COMPREHENSIVE
          businessName: "MarketPro",
          industry: "E-commerce / Marketplace / Multi-vendor Platform",
          problem: "UK SME sellers struggle on Amazon/eBay due to high fees (15-25% commission) and algorithm bias toward large sellers. Amazon suspended 50K UK seller accounts in 2024 alone. There's no UK-focused B2B wholesale marketplace where manufacturers can sell directly to retailers without intermediary fees.",
          innovationStage: "pre-mvp",
          productStatus: "Building UK-first B2B wholesale marketplace connecting UK manufacturers directly with independent retailers. High-fidelity wireframes complete. 50 merchant expressions of interest (28 suppliers, 22 retailers). Payment integration (Stripe Connect) and logistics partnerships (DPD, Hermes B2B) in final negotiation.",
          existingCustomers: "Pre-launch waitlist: 50 verified businesses. Suppliers: 28 UK manufacturers (homeware, textiles, food) with combined £15M wholesale revenue. Retailers: 22 independent shops seeking UK supplier alternatives to China/Amazon. Advisory board: 2 wholesale industry veterans, 1 marketplace expert. Soft commitments: £2M GMV first year.",
          tractionEvidence: "Waitlist: 50 qualified businesses (verified, revenue £100K+). Supplier GMV commitment: £2M Year 1 (soft commitments). Retailer buying intent: £800K annual wholesale purchases represented. Technical: Prototype connects payment + logistics. Partnerships: LOIs with 2 logistics providers (preferential rates). Domain: marketpro.uk acquired.",
          uniqueness: "Market opportunity: (1) 8% flat commission vs 15-25% on Amazon/Faire (62% savings). (2) UK-focused (local logistics, GBP, UK regulations). (3) Built-in trade credit (30-60 day payment terms via partner). (4) Verified UK supplier network (all suppliers audited). (5) No algorithm gaming (fair search ranking).",
          techStack: "Next.js 14, TypeScript, PostgreSQL, Stripe Connect (split payments), Algolia (search), UK carrier APIs (DPD, Hermes B2B), Vercel, Redis, Clerk (auth), AWS S3 (images)",
          dataArchitecture: "Architecture: Next.js frontend → API routes → PostgreSQL (products, orders, users) → Stripe Connect (payments, payouts) → Carrier API (shipping labels, tracking). Search: Algolia for product discovery. Analytics: Mixpanel for marketplace metrics. CDN: Vercel Edge for fast global delivery. Image hosting: AWS S3 + CloudFront.",
          aiMethodology: "Not applicable - this is a marketplace platform, not an AI product. Future AI features planned: Product categorization from descriptions, fraud detection on new suppliers, demand prediction for suppliers. Core innovation is business model (low fees, UK focus, trade credit), not technology.",
          complianceDesign: "E-commerce regulations: Consumer Contracts Regulations (template T&Cs). Payment: PCI compliant via Stripe (no card data stored). GDPR: Data controller for marketplace, processors for payments/logistics. VAT: Digital platform not liable for seller VAT (HMRC guidance followed). Anti-money laundering: KYB on all suppliers (Stripe Identity).",
          patentStatus: "No patents - marketplace is business model innovation, not technology IP. Trademark: 'MarketPro' UK application TM-2024-02234 (pending). Domain: marketpro.uk registered. Trade secrets: Supplier vetting criteria, retailer qualification process.",
          founderEducation: "MBA, University of Cambridge Judge Business School, 2023 (specialization: Digital Platforms). BSc Business & Technology, University of Manchester, 2019 (First Class). Google Product Management certification. Stripe integration certification.",
          founderWorkHistory: "Product Manager, Faire (wholesale marketplace) (2021-2024): Launched UK market, £80M GMV first year. Associate Product Manager, Amazon UK (2019-2021): Third-party seller tools, marketplace operations. Intern, John Lewis Partnership (Summer 2018): Supplier management.",
          founderAchievements: "Faire UK launch: £80M GMV Year 1, 5,000 UK retailers onboarded. Built supplier verification system (reduced fraud 65%). Amazon: Improved seller dashboard (40% reduction in support tickets). Cambridge: Business plan won entrepreneurship competition (£25K prize). Speaker: Retail Week Live 2023.",
          relevantProjects: "Faire: Full UK market launch (£80M GMV). Amazon: Seller tools for 300K UK sellers. John Lewis: Supplier portal redesign. Cambridge MBA: Marketplace business plan (winner). Personal: Side project dropshipping business (£50K revenue, sold).",
          funding: "130000",
          fundingSources: "£60,000 personal savings (from Faire salary). £45,000 Cambridge entrepreneurship prize + grants. £25,000 angel investment (2 marketplace investors). Total: £130,000 for MVP build and first year operations.",
          monthlyProjections: "Year 1: Month 1-6: Build MVP, £0 revenue. Month 7-12: Launch, 100 suppliers, £500K GMV, £40K revenue (8% take rate). Year 1 total: £40K revenue, £110K costs. Year 2: 500 suppliers, £5M GMV, £400K revenue. Year 3: 1,500 suppliers, £20M GMV, £1.6M revenue, break-even month 26.",
          customerAcquisitionCost: "450",
          lifetimeValue: "8500",
          paybackPeriod: "6",
          detailedCosts: "Development (2 contractors): £48K/Year 1. Cloud (Vercel, AWS): £12K/year. Stripe fees (pass-through). Marketing: £25K/year. Legal (marketplace T&Cs, supplier contracts): £12K. Customer support: £8K/year. Founder salary (deferred Year 1): £0. Total Year 1: £110K.",
          competitors: "1. Amazon (15-25% fees, seller suspensions, algorithmic bias). 2. Faire (US-centric, 25% fee to retailers, £1K minimums). 3. Ankorstore (French, 25% fee, EU-focused). 4. Traditional wholesalers (offline, slow, high minimums). 5. Alibaba (China focus, quality concerns). Our advantage: UK-focused, 8% flat fee, trade credit, verified suppliers.",
          competitiveDifferentiation: "8% fee vs 15-25% (62% savings for sellers). UK-only suppliers (quality, faster shipping, sustainability story). Trade credit built-in (Faire makes retailers pay upfront). Verified suppliers (audit before listing). Fair search (no pay-to-play algorithms). Lower minimums (£150 vs £500+ competitors).",
          customerInterviews: "48 interviews (March-August 2025). Suppliers (25): 'Amazon fees eat my margin', 'Need alternative to trade shows'. Retailers (23): 'Want UK products, not China imports', 'Faire is too US-centric', 'Trade credit essential for cash flow'. Key insight: Strong desire for UK wholesale platform, willingness to try new marketplace.",
          lettersOfIntent: "12 supplier LOIs (combined £2M annual wholesale revenue, conditional on launch). 8 retailer commitments (combined £400K annual purchasing). Partnership LOIs: DPD B2B (discounted rates), iwoca (trade credit provider). Total pipeline: £2.4M GMV Year 1.",
          willingnessToPay: "Suppliers: 75% prefer 8% flat fee vs 15-25% variable. Willing to pay for premium listings (£50-200/month for featured placement). Retailers: Expect free buyer accounts (standard). Trade credit: Willing to pay 2-3% for 60-day terms (via partner).",
          marketSize: "TAM: UK wholesale market £120B. SAM: B2B online wholesale (excluding major retailers) £8B (growing 15%/year). SOM: Year 1: £500K GMV (0.006%). Year 3: £20M GMV (0.25%). Conservative given marketplace cold-start challenge.",
          regulatoryRequirements: "Consumer Contracts Regulations: Template T&Cs for marketplace. GDPR: ICO registration, privacy policy, cookie consent. VAT: No platform liability for seller VAT (HMRC Online Marketplace guidance). Payment services: No FCA registration needed (Stripe handles). Product safety: Supplier responsibility (contractual). AML: KYB on sellers via Stripe Identity. Compliance budget: £18K.",
          complianceTimeline: "Month 1-3: Legal framework (T&Cs, supplier agreements). Month 3-6: GDPR documentation, ICO registration. Month 6: Launch with compliant marketplace. Ongoing: Annual legal review, regulatory monitoring. Low ongoing compliance burden for marketplace model.",
          complianceBudget: "18000",
          jobCreation: "16",
          hiringPlan: "Year 1: Founder + 2 contractors (development). Year 2: Full-time CTO (£80K), Supplier Success (£45K), Sales (£50K + commission), Operations (£40K). Year 3: 3 more engineers (£180K), Marketing (£45K), Customer Success (£40K), Finance (£50K). Total: 16 FTE by end Year 3.",
          specificRegions: "Year 1: England focus (supplier density, logistics efficiency). Categories: Homeware, textiles, specialty food (proven wholesale demand). Year 2: Scotland, Wales. Year 3: Northern Ireland, Republic of Ireland. Focus: UK manufacturing regions (Midlands, North, Scotland).",
          expansion: "Vertical: Category expansion (beauty, pet, garden). Horizontal: Trade credit product, supplier financing, inventory analytics. Product: Private label facilitation, dropship integration for retailers. Geographic: Ireland Year 3, then EU post-Brexit trade patterns settled.",
          internationalPlan: "Year 4: Republic of Ireland (natural expansion, similar market). EU: Assess post-Brexit trade situation. Focus: UK market leadership before international. Challenge: Each market needs local suppliers (marketplace cold-start problem). Strategy: Franchise model for other markets vs direct expansion.",
          vision: "5-year vision: UK's #1 B2B wholesale marketplace. £150M GMV, 5,000 suppliers, 25,000 retailers. £12M revenue, 60 employees. Platform: Trade credit, inventory tools, dropship. Exit potential: Acquisition by Shopify (supplier network), Alibaba (UK entry), or major retailer (direct sourcing).",
          targetEndorser: "Primary: Envestors (marketplace/platform expertise). Alternative: UKES (UK Endorsing Service, B2B commerce focus). Rationale: Envestors has marketplace companies in portfolio, understands two-sided platform metrics, connected to investor community.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, marketplace strategy. (2) Month 6: MVP launch, initial suppliers/retailers. (3) Month 12: Year 1 GMV, liquidity metrics. (4) Month 18: Growth, category expansion. (5) Month 24: Series A preparation. (6) Month 30: Scale strategy, trade credit launch.",
          experience: "Uniquely qualified: 3 years at Faire building UK wholesale marketplace (£80M GMV). 2 years at Amazon understanding third-party seller needs. Deep understanding of marketplace dynamics, supplier onboarding, retail buying patterns. Technical: Product management, payment integration, logistics. Network: UK manufacturers, independent retailers, wholesale industry.",
          revenue: "Commission model: 8% flat fee on all transactions (supplier pays). Premium supplier listings: £99-299/month for featured placement. Trade credit (via partner): Revenue share on financing fees. Retailer: Free to buy (standard marketplace model). Target: £1.6M revenue on £20M GMV Year 3 (8% take rate). Gross margin: 65% (after payment processing, logistics subsidies).",
        },
      ],
      saas: [
        { // TeamFlow - Collaboration Platform - COMPREHENSIVE
          businessName: "TeamFlow",
          industry: "SaaS / Team Collaboration / Productivity Software",
          problem: "Remote and hybrid teams use 9+ different tools on average (Slack, Zoom, Notion, Asana, etc.), causing context-switching that costs £12,000 per employee annually in lost productivity. 73% of workers report 'tool fatigue'. Integration complexity leads to information silos - 67% of teams report not finding information they need.",
          innovationStage: "mvp-complete",
          productStatus: "Unified collaboration platform combining chat, docs, tasks, and video in one interface. 180 active teams (850 users) on paid plans. Measuring 40% reduction in tool-switching (tracked via browser extension). AI meeting summaries processing 2,400 meetings/month. 4.7/5 product satisfaction score.",
          existingCustomers: "180 teams including: Bloom Digital Agency (45 users, testimonial: 'Replaced 5 tools, saved £15K/year'), TechStart Ventures (28 users, 'Finally everything in one place'), Northern Law LLP (22 users, legal-specific use case). Mix: 40% agencies, 30% tech startups, 30% professional services.",
          tractionEvidence: "Metrics: 180 teams, 850 users, £9,350 MRR (average £11/user). Tool reduction: Teams average 4.2 tools post-TeamFlow vs 9.3 before. Productivity: 40% less context-switching (measured). Meeting summaries: 2,400/month processed. Retention: 92% monthly. NPS: 62.",
          uniqueness: "Productivity gains: (1) 40% less tool-switching (tracked). (2) All-in-one workspace (chat + docs + tasks + video + whiteboard). (3) £8-15/user/month vs £25-40 for separate tools. (4) AI-powered meeting summaries and action items. (5) Native integrations with 50 existing tools for migration.",
          techStack: "React 18, TypeScript, Node.js 18, PostgreSQL, WebRTC (video), Socket.io (real-time), AWS (ECS, RDS, S3, CloudFront), Kubernetes, Redis, OpenAI GPT-4 (meeting AI), Elasticsearch (search), Stripe",
          dataArchitecture: "Real-time architecture: React SPA → WebSocket (Socket.io) → Node.js event bus → PostgreSQL + Redis. Video: WebRTC with TURN server fallback. Document storage: PostgreSQL (content) + S3 (files). Search: Elasticsearch for full-text across all content types. AI: Async processing queue for meeting transcription and summarization.",
          aiMethodology: "Meeting AI: Whisper (transcription) + GPT-4 (summarization, action item extraction). Training: Fine-tuned on 10K meeting transcripts for business context. Accuracy: 94% action item detection rate. Features: Automatic attendee attribution, topic segmentation, follow-up suggestions. Smart notifications: ML model predicts message urgency. Future: AI task prioritization.",
          complianceDesign: "GDPR compliant: Data residency options (EU, UK), deletion rights, export functionality. SOC 2 Type I: Achieved. ISO 27001: In progress. End-to-end encryption option for Enterprise tier. SSO/SAML for enterprise. Video recordings: Encrypted at rest, configurable retention. ICO registered.",
          patentStatus: "No patents - focus on execution and user experience. Trade secrets: Real-time sync architecture, AI meeting model fine-tuning. Trademark: 'TeamFlow' UK application TM-2024-02456 (pending, name conflict being resolved).",
          founderEducation: "MSc Computer Science, Imperial College London, 2020 (Distinction, thesis on real-time collaboration systems). BSc Computer Science, University of Bristol, 2018 (First Class). AWS Solutions Architect certification. Certified ScrumMaster.",
          founderWorkHistory: "Senior Software Engineer, Notion (2021-2024): Built real-time collaboration features, 30M users. Software Engineer, Slack (2019-2021): Worked on integrations platform, 12M DAU. Intern, Microsoft (Summer 2018): Teams audio/video quality improvements.",
          founderAchievements: "Notion: Built real-time multiplayer editing (now used by 30M users). Shipped 5 major features. Slack: Integration marketplace improvements (25% increase in app installs). Published: 'Conflict-Free Replicated Data Types in Practice' (ACM Symposium, 2023). Speaker at ProductCon 2023.",
          relevantProjects: "Notion: Real-time collaboration engine, API platform. Slack: Integrations marketplace. Personal: Open-source WebSocket framework (4,500 GitHub stars). Imperial thesis: 'Operational Transformation for Real-time Document Collaboration'. Side project: Personal productivity app (12K users).",
          funding: "110000",
          fundingSources: "£70,000 personal savings (from Notion/Slack salary). £25,000 angel investment (2 SaaS angels). £15,000 Imperial entrepreneurship fund. Total: £110,000 for 15-month runway.",
          monthlyProjections: "Year 1: Current - £9.35K MRR, growing 18%/month. Month 6-12: £28K MRR target. Year 1 total: £180K revenue, £135K costs. Year 2: £75K MRR by month 24, £900K revenue. Year 3: £150K MRR, £1.8M revenue, profitable month 22.",
          customerAcquisitionCost: "85",
          lifetimeValue: "1320",
          paybackPeriod: "2",
          detailedCosts: "Cloud (AWS): £24K/year. OpenAI API (meeting AI): £12K/year. Marketing (content, PLG): £18K/year. Founder salary (Year 2): £48K. Customer support (contractor): £15K/year. Legal/accounting: £8K/year. Office: £6K/year. Total Year 1: £135K.",
          competitors: "1. Slack + Notion + Zoom (separate, £30+/user/month combined). 2. Microsoft Teams (enterprise, complex, £10+/user). 3. Twist + Height (niche, limited). 4. ClickUp (feature bloat, complex). 5. Basecamp (dated, no video). Our advantage: Truly unified (not integrations), simple, affordable, AI-native.",
          competitiveDifferentiation: "One platform vs 4-5 tools (60% cost savings). 40% less context-switching (measured). AI meeting summaries (competitors charge extra). £8-15/user vs £25-40 combined tools. Built for SME (not enterprise complexity). 5-minute onboarding (vs days for enterprise tools).",
          customerInterviews: "52 team lead interviews (March-July 2025). Key findings: (1) 'I spend 2 hours/day switching between tools'. (2) 'Teams is too complex, Slack is too expensive'. (3) 'I want one place for everything'. (4) 'AI features should be included, not extra'. (5) Willing to pay £10-15/user for unified solution.",
          lettersOfIntent: "15 teams in trial (350 users). 8 high-intent (verbal commitment to pay post-trial). Pipeline: £8K additional MRR within 60 days. Partner discussions: 2 digital agency networks (200+ member agencies combined).",
          willingnessToPay: "Current pricing: Starter £8/user/month, Pro £12/user/month, Enterprise £15/user/month. Survey (n=120 teams): 78% willing to pay £10-15/user for unified solution. Upgrade rate: 35% Starter → Pro within 3 months. Enterprise: 5 active negotiations.",
          marketSize: "TAM: Global team collaboration $45B. SAM: UK SME collaboration (10-500 employees) £1.8B. SOM: Year 1: £180K (0.01%). Year 3: £1.8M (0.1%). Achievable: PLG motion, viral team invites, agency network partnerships.",
          regulatoryRequirements: "GDPR: Data controller, privacy policy, consent management. ICO registration: Complete. SOC 2 Type I: Achieved. UK data residency: AWS London region. Minimal sector-specific regulation for general business software. Compliance budget: £15K/year.",
          complianceTimeline: "Achieved: GDPR compliance, ICO registration, SOC 2 Type I. Year 2: SOC 2 Type II, ISO 27001 (for enterprise customers). Ongoing: Annual security audits, penetration testing. Low ongoing compliance burden for B2B SaaS.",
          complianceBudget: "15000",
          jobCreation: "18",
          hiringPlan: "Year 1: Founder + 2 engineers. Year 2: 2 more engineers (£120K), Product Designer (£55K), Customer Success (£42K), Marketing (£45K). Year 3: VP Engineering (£85K), 3 more engineers (£180K), Sales (£50K), Support (2 × £35K). Total: 18 FTE by end Year 3.",
          specificRegions: "Year 1-2: UK focus (language, timezone, GDPR compliance). Sectors: Agencies, tech startups, professional services (proven verticals). Year 3: Ireland, Netherlands (English-speaking/proficient). US: Year 4 (competitive market, different pricing).",
          expansion: "Vertical: Industry templates (agency workflows, legal matter management). Horizontal: External collaboration (clients, contractors), mobile app enhancement, offline mode. Product: Workflow automation, project templates, time tracking. AI: Meeting coaching, task prioritization, writing assistance.",
          internationalPlan: "Year 3: Ireland, Netherlands (similar business culture, English proficiency). Year 4: US (large market, establish presence). Strategy: UK success story, then English-speaking expansion. Challenge: Competing with well-funded US incumbents. Focus: SME niche where enterprise tools are overkill.",
          vision: "5-year vision: Europe's leading unified collaboration platform for SMEs. 50,000 teams, £25M ARR, 80 employees. Platform: Collaboration + workflow automation + AI assistant. Exit potential: Acquisition by Atlassian, Microsoft, or Salesforce looking to strengthen SME offering.",
          targetEndorser: "Primary: Envestors (SaaS expertise, collaboration tools in portfolio). Alternative: Notion/Slack alumni network (industry credibility). Rationale: Envestors understands SaaS metrics, has strong PLG company portfolio, connected to European expansion resources.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, product demo. (2) Month 6: MRR growth, user metrics. (3) Month 12: Year 1 results, retention data. (4) Month 18: Enterprise traction, partnership announcements. (5) Month 24: Series A preparation. (6) Month 30: International expansion, platform strategy.",
          experience: "Uniquely qualified: 5 years building collaboration tools at Notion and Slack (combined 42M users). Deep understanding of real-time systems, user experience, and PLG growth. Technical: WebRTC, real-time sync, AI integration. Domain: Team productivity, collaboration workflows. Network: Collaboration product leaders, SaaS investors, agency community.",
          revenue: "Tiered SaaS per user: Starter £8/user/month (5+ users, core features), Pro £12/user/month (AI features, integrations), Enterprise £15/user/month (SSO, admin, SLA). Implementation: Self-service (no fee). Add-ons: Extra storage £3/user, Priority support £2/user. LTV: £1,320 (24-month retention). CAC: £85 (PLG). Gross margin: 78%.",
        },
        { // DataSync - Integration Platform - COMPREHENSIVE
          businessName: "DataSync",
          industry: "SaaS / Integration Platform / iPaaS",
          problem: "UK businesses use 75+ SaaS applications on average. Manual data entry between systems costs £23,000 per employee annually in wasted time and errors. 89% of companies report data inconsistencies across systems. Existing iPaaS solutions (Zapier £500+/month at scale, Workato £10K+/year) are expensive and require technical expertise.",
          innovationStage: "mvp-complete",
          productStatus: "No-code integration platform with 95 paying customers and 200+ pre-built connectors. Processing 4.5 million data syncs monthly with 99.9% uptime. Average customer connects 6 apps. Focus on UK business software (Sage, Xero, UK banks, HMRC). Support team based in Manchester.",
          existingCustomers: "95 paying customers including: Harrison Accountancy (connects Xero + Practice Ignition + GoProposal, testimonial: 'Saved 12 hours/week'), NorthTech Solutions (HubSpot + Sage + Mailchimp), Manchester Recruitment (Bullhorn + LinkedIn + Xero). Mix: 40% accountancy, 30% agencies, 30% general SME.",
          tractionEvidence: "Metrics: 95 customers, £14,200 MRR (average £149/month). Syncs: 4.5M monthly (growing 22%/month). Uptime: 99.9% (SLA met). Connectors: 200+ (adding 8/month). Retention: 94% monthly. Customer time saved: Average 15 hours/month per customer (self-reported).",
          uniqueness: "Value proposition: (1) 80% cheaper than Workato (£99-299 vs £800+/month). (2) No-code visual builder (drag-and-drop). (3) UK-focused connectors (Sage, Xero, FreeAgent, UK banks, HMRC MTD). (4) Real-time sync vs 15-minute polling. (5) UK support team (not offshore). (6) Built for accountants and agencies.",
          techStack: "Node.js 18, TypeScript, PostgreSQL, Redis, RabbitMQ (queue), React 18, Docker, AWS (ECS, RDS, SQS), OAuth 2.0 for 200+ APIs, Temporal (workflow orchestration), Elasticsearch (logs/search), Stripe, Datadog",
          dataArchitecture: "Event-driven integration: Source app webhook/poll → Queue (RabbitMQ) → Transformation engine (TypeScript) → Destination API. Orchestration: Temporal for complex multi-step flows. State: PostgreSQL for sync state, Redis for caching. Retry logic: Exponential backoff with dead-letter queue. Monitoring: Full audit trail, real-time dashboard.",
          aiMethodology: "AI features (planned Year 2): Auto-mapping suggestions (field matching using embeddings), error resolution recommendations, anomaly detection in sync patterns. Current: Rule-based transformations with extensive template library. Focus is on reliability and ease-of-use rather than AI complexity.",
          complianceDesign: "GDPR compliant: Data processor role, DPA with all customers. SOC 2 Type I: Achieved. Data residency: UK only (AWS London). Encryption: AES-256 at rest, TLS 1.3 in transit. No data stored long-term (pass-through architecture). OAuth tokens encrypted. ICO registered. Open Banking: Read-only access via Plaid.",
          patentStatus: "No patents - integration platform is execution-focused. Trade secrets: Connector library, transformation templates, error handling logic. Trademark: 'DataSync' UK application TM-2024-02678 (registered).",
          founderEducation: "MSc Software Engineering, University of Manchester, 2020 (Distinction). BSc Computer Science, Covenant University Nigeria, 2017 (First Class). AWS Solutions Architect Professional. Certified Integration Architect (MuleSoft).",
          founderWorkHistory: "Integration Architect, Sage UK (2021-2024): Built partner integration platform, 500+ integrations. Software Engineer, Deloitte Digital (2019-2021): Enterprise integration projects, £8M combined. Developer, Nigerian fintech startup (2017-2019): Built payment integrations.",
          founderAchievements: "Sage: Built partner integration platform connecting 500+ apps. Reduced integration time from 6 months to 2 weeks. Deloitte: Led 3 enterprise integration projects (£8M combined value). Published: 'API Design for Accounting Software' (Accounting Web, 2023). Speaker at Accountex 2024.",
          relevantProjects: "Sage: Partner integration platform (500+ apps). Deloitte: Xero-Salesforce integration for FTSE 250 client. Personal: Open-source Xero API library (2,100 GitHub stars). Built: Nigerian payment gateway integrations (3 banks).",
          funding: "95000",
          fundingSources: "£55,000 personal savings (from Sage/Deloitte). £25,000 angel investment (2 accountancy tech investors). £15,000 Manchester entrepreneurship fund. Total: £95,000 for 14-month runway.",
          monthlyProjections: "Year 1: Current - £14.2K MRR, growing 12%/month. Month 6-12: £30K MRR target. Year 1 total: £240K revenue, £165K costs. Year 2: £65K MRR by month 24, £780K revenue. Year 3: £120K MRR, £1.44M revenue, profitable month 20.",
          customerAcquisitionCost: "180",
          lifetimeValue: "2680",
          paybackPeriod: "3",
          detailedCosts: "Cloud (AWS): £30K/year. Third-party APIs (Plaid, etc.): £15K/year. Marketing (content, Accountex): £25K/year. Founder salary (Year 2): £50K. Customer support (1 FTE): £35K. Legal/accounting: £8K/year. Office (Manchester coworking): £5K/year. Total Year 1: £165K.",
          competitors: "1. Zapier (£500+/month at scale, US-focused, not real-time). 2. Workato (£10K+/year, enterprise complexity). 3. Make/Integromat (EU-based, limited UK connectors). 4. Tray.io (£800+/month, enterprise). 5. Native integrations (limited, one-to-one). Our advantage: UK-focused, affordable, real-time, no-code, accountancy expertise.",
          competitiveDifferentiation: "80% cheaper than Workato (£149 vs £800+/month). UK connectors (Sage, Xero, HMRC MTD) that competitors lack. Real-time sync (not 15-minute polling). No-code (accountants can use it, not just developers). UK support (Manchester-based, same timezone). Accountancy vertical expertise.",
          customerInterviews: "58 UK business interviews (February-June 2025). Roles: Accountancy practice managers (25), Agency ops (18), SME owners (15). Key findings: (1) 'Zapier is too expensive for what we need'. (2) 'Need Sage and Xero, which Zapier handles poorly'. (3) 'I'm not technical, need easy setup'. (4) 'Real-time is essential for client work'.",
          lettersOfIntent: "12 prospects in active trial (estimated £2.5K additional MRR). Partnership discussions: 2 accountancy software vendors (referral arrangements), 1 practice management platform (embedded integration). Combined pipeline: 25 prospects, £6K additional MRR potential.",
          willingnessToPay: "Current pricing: Starter £49/month (5 syncs), Pro £99/month (25 syncs), Business £149/month (100 syncs), Enterprise £299/month (unlimited). Survey (n=90 UK businesses): 82% willing to pay £100-200/month for reliable UK-focused integration. 45% currently paying more for Zapier.",
          marketSize: "TAM: Global iPaaS $8.5B (growing 25%/year). SAM: UK SME integration (10-500 employees) £420M. SOM: Year 1: £240K (0.06%). Year 3: £1.44M (0.35%). Achievable: Accountancy vertical focus, UK connector differentiation.",
          regulatoryRequirements: "GDPR: Data processor, DPA template. Open Banking (if connecting banks): AISP via Plaid partnership. ICO registration: Complete. SOC 2 Type I: Achieved. HMRC MTD: Integration certified. Financial data: No FCA authorization needed (data sync only, no transactions). Compliance budget: £20K/year.",
          complianceTimeline: "Achieved: GDPR, ICO, SOC 2 Type I, HMRC MTD certification. Year 2: SOC 2 Type II, ISO 27001 (for enterprise). Open Banking: Expanding via Plaid partnership. Ongoing: Annual security audit, API partner certifications.",
          complianceBudget: "20000",
          jobCreation: "16",
          hiringPlan: "Year 1: Founder + 2 engineers + 1 support. Year 2: 2 more engineers (£110K), Customer Success (£42K), Sales (£48K), Marketing (£40K). Year 3: VP Engineering (£80K), 2 more engineers (£110K), Partnership Manager (£50K), Support (£35K). Total: 16 FTE by end Year 3.",
          specificRegions: "Year 1-2: UK focus (connector library, support). Sectors: Accountancy practices, digital agencies, recruitment (high integration needs). Year 3: Ireland (similar software landscape). Manchester office: Northern Powerhouse tech hub.",
          expansion: "Vertical: Industry templates (accountancy workflows, agency reporting, recruitment pipelines). Horizontal: Data warehouse sync, reporting layer, embedded integrations (white-label). Product: API-first tier for developers, marketplace for community connectors.",
          internationalPlan: "Year 3: Ireland (similar business software, English-speaking). Year 4: EU (GDPR advantage, Xero presence). US: Year 5 (competitive, different software ecosystem). Strategy: Become #1 UK integration platform before international. Partner model for other markets.",
          vision: "5-year vision: UK's #1 integration platform for SMEs and accountancy. 3,000 customers, £8M ARR, 45 employees. Platform: Integration + automation + embedded (white-label). Marketplace: Community-built connectors. Exit potential: Acquisition by accountancy software (Sage, Intuit), CRM (Salesforce, HubSpot), or iPaaS consolidator.",
          targetEndorser: "Primary: Envestors (SaaS expertise). Alternative: Sage/Xero partner networks (industry credibility). Rationale: Envestors understands integration/platform businesses, has strong portfolio in B2B SaaS, connected to Manchester tech ecosystem.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, product demo. (2) Month 6: Customer metrics, connector growth. (3) Month 12: Year 1 results, partnership announcements. (4) Month 18: Enterprise traction, embedded product. (5) Month 24: Series A preparation. (6) Month 30: International expansion, marketplace strategy.",
          experience: "Uniquely qualified: 5 years building integration platforms at Sage and Deloitte (500+ integrations). Deep understanding of UK business software ecosystem, accountancy workflows, and SME needs. Technical: API design, event-driven architecture, OAuth. Domain: Accounting software, UK tax, practice management. Network: Accountancy tech community, software vendors, integration partners.",
          revenue: "Tiered SaaS by sync volume: Starter £49/month (5 active syncs), Pro £99/month (25 syncs), Business £149/month (100 syncs), Enterprise £299/month (unlimited, SLA). Implementation: Self-service (templates). Add-ons: Custom connector £500 one-time, Priority support £50/month. LTV: £2,680 (22-month retention). CAC: £180. Gross margin: 80%.",
        },
        { // AutomateHQ - Workflow Automation - COMPREHENSIVE
          businessName: "AutomateHQ",
          industry: "SaaS / Workflow Automation / Business Process",
          problem: "UK SMEs spend 28% of employee time on repetitive tasks (data entry, approvals, reporting) that could be automated. This costs the average 50-person company £380,000 annually in lost productivity. Existing RPA solutions cost £50K+ implementation and require technical expertise - 78% of RPA projects fail in SMEs due to complexity.",
          innovationStage: "pre-mvp",
          productStatus: "Building AI-powered workflow automation for SMEs using natural language. Users describe workflows in plain English, AI creates the automation. Technical prototype complete: Successfully created 45 test workflows from natural language descriptions. 35 pilot applications received from waitlist marketing.",
          existingCustomers: "Pre-launch: 35 businesses on pilot waitlist (verified, 10+ employees). Advisory board: 2 operations directors from mid-size companies, 1 RPA consultant (formerly UiPath). Beta testers: 8 companies agreed to early access testing. Sectors represented: Legal (8), Recruitment (7), Property (6), Other (14).",
          tractionEvidence: "Waitlist: 35 verified businesses (£850K combined annual operations spend). Technical validation: 45 test workflows successfully created from NL descriptions. Advisor commitments: 3 industry experts on advisory board. Press: Featured in TechCrunch UK automation roundup. Domain: automatehq.co.uk acquired.",
          uniqueness: "SME-first approach: (1) Describe workflows in plain English ('When invoice received, extract data, check against PO, route for approval'). (2) £199-499/month vs £50K+ RPA implementation. (3) No-code/low-code interface. (4) AI learns from user corrections. (5) Pre-built templates for common SME workflows. (6) Works with any web app (not just APIs).",
          techStack: "Python 3.11, GPT-4 + Claude (workflow generation), LangChain, FastAPI, PostgreSQL, React 18, TypeScript, AWS Lambda (serverless execution), Selenium/Playwright (browser automation), Stripe, Temporal (orchestration)",
          dataArchitecture: "Workflow engine: Natural language input → GPT-4 parsing → Workflow DAG generation → Temporal orchestration → Execution (API calls + browser automation). State: PostgreSQL for workflow definitions and run history. Execution: AWS Lambda for serverless scalability. Browser automation: Headless Chrome via Playwright. Monitoring: Full execution logs, error alerting.",
          aiMethodology: "Workflow generation: GPT-4 fine-tuned on 5,000 business workflow descriptions. Few-shot prompting with workflow templates. Chain-of-thought reasoning for complex multi-step workflows. Validation: Generated workflows tested against execution engine before deployment. Learning: User corrections fed back for prompt improvement. Accuracy: 89% first-attempt success rate on test set.",
          complianceDesign: "GDPR compliant: Workflow execution can be on-premise option for sensitive data. Data retention: User controls. SOC 2 Type I: Planned pre-launch. Browser automation: Respects robots.txt and ToS (user responsibility). API access: OAuth 2.0 for all integrations. Audit trail: Full logging of all automated actions. ICO registered.",
          patentStatus: "UK Patent Application GB2414567.1 filed September 2025: 'System and method for natural language to business workflow translation using large language models'. Defensive publications for prompt engineering techniques. Trademark: 'AutomateHQ' registered.",
          founderEducation: "PhD Computer Science (NLP focus), University of Edinburgh, 2024 (thesis: 'Natural Language Understanding for Business Process Automation'). MSc Artificial Intelligence, University of Edinburgh, 2020 (Distinction). BSc Computer Science, Obafemi Awolowo University, 2017 (First Class).",
          founderWorkHistory: "NLP Research Scientist, UiPath (2022-2024): Built natural language process mining, 500K users. Machine Learning Engineer, Automation Anywhere (2020-2022): Document understanding AI. Research Assistant, Edinburgh NLP Lab (2018-2020): PhD research on workflow extraction from text.",
          founderAchievements: "UiPath: Built NL process mining used by 500K users. Published 6 papers in top NLP venues (ACL, EMNLP, NAACL). PhD thesis published as book chapter. Edinburgh: Won Best Paper at Business Process Management conference 2023. Open-source: Workflow extraction library (2,800 GitHub stars).",
          relevantProjects: "UiPath: Natural language to automation (500K users). Automation Anywhere: Document AI for invoice processing. PhD: Workflow extraction from procedural text. Open-source: workflow-nlp library (2,800 stars). Personal: Chrome extension for recording user workflows (15K downloads).",
          funding: "140000",
          fundingSources: "£60,000 personal savings (from UiPath salary). £50,000 angel investment (3 automation industry angels). £30,000 Edinburgh entrepreneurship prize + grants. Total: £140,000 for MVP completion and first year operations.",
          monthlyProjections: "Year 1: Month 1-6: Build MVP, £0 revenue. Month 7-12: Launch, 50 customers, £10K MRR. Year 1 total: £60K revenue, £130K costs. Year 2: £45K MRR by month 24, £540K revenue. Year 3: £100K MRR, £1.2M revenue, profitable month 26.",
          customerAcquisitionCost: "350",
          lifetimeValue: "5980",
          paybackPeriod: "4",
          detailedCosts: "Cloud (AWS): £24K/year. OpenAI/Anthropic API: £18K/year. Marketing (content, PLG): £28K/year. Founder salary (Year 2): £55K. Legal (ToS, compliance): £10K. Office: £6K/year. Contractor (design): £12K. Total Year 1: £130K.",
          competitors: "1. UiPath (enterprise, £50K+ implementation, complex). 2. Automation Anywhere (enterprise, similar). 3. Zapier (integrations not workflows, limited). 4. Make (technical, not NL-based). 5. Bardeen (browser only, limited). Our advantage: Natural language input, SME pricing, works with any app, pre-built templates.",
          competitiveDifferentiation: "Natural language: 'Describe in English' vs visual programming. £199-499/month vs £50K+ enterprise RPA. Works with any web app (not just APIs). Pre-built templates (invoice processing, approvals, reporting). Self-service (no consultants needed). AI learns from corrections (improves over time).",
          customerInterviews: "48 SME operations interviews (April-August 2025). Key findings: (1) '28% of my team's time is repetitive tasks'. (2) 'RPA is for enterprises, not us'. (3) 'I want to describe what I need, not program it'. (4) 'Must work with our existing tools'. (5) 'Budget: £200-500/month if it actually works'.",
          lettersOfIntent: "8 pilot LOIs signed: 3 legal firms (invoice processing), 2 recruitment agencies (candidate workflow), 3 property companies (tenant onboarding). Combined pilot commitment: £3K MRR if product meets requirements. 27 additional waitlist members expressed strong intent.",
          willingnessToPay: "Survey (n=85 SME ops managers): 78% willing to pay £200-400/month for proven workflow automation. Current manual cost: Average £380K/year for 50-person company. Target: 10% cost savings = £38K value vs £199-499/month cost. 15x ROI potential.",
          marketSize: "TAM: Global RPA/workflow automation $25B (growing 23%/year). SAM: UK SME workflow automation (50-500 employees) £680M. SOM: Year 1: £60K (0.009%). Year 3: £1.2M (0.18%). Conservative given product-market fit risk. Addressable if NL approach works.",
          regulatoryRequirements: "GDPR: Data processor for workflow data. ICO registration: Complete. Browser automation: User responsibility for ToS compliance (documented). Financial workflows: No FCA needed (automation tool, not transactions). SOC 2 Type I: Planned pre-launch. Compliance budget: £18K.",
          complianceTimeline: "Pre-launch: GDPR documentation, ICO registration, ToS. Month 6: SOC 2 Type I readiness. Year 2: SOC 2 Type II for enterprise customers. Ongoing: Security audits, API partner compliance. Focus: Data security and user responsibility for automation targets.",
          complianceBudget: "18000",
          jobCreation: "20",
          hiringPlan: "Year 1: Founder + 2 engineers. Year 2: 3 more engineers (£180K), Product Manager (£60K), Customer Success (£45K), Sales (£50K). Year 3: VP Engineering (£90K), 3 more engineers (£180K), Marketing (£48K), Support (2 × £35K), DevOps (£65K). Total: 20 FTE by end Year 3.",
          specificRegions: "Year 1-2: UK focus (legal, recruitment, property - process-heavy sectors). Year 3: English-speaking markets (US pilot, Ireland). Vertical focus: Document-heavy industries where NL automation provides most value.",
          expansion: "Vertical: Industry-specific templates (legal workflows, recruitment pipelines, property management). Horizontal: Mobile automation, voice-triggered workflows, integration marketplace. Product: Enterprise tier (on-premise, SSO, compliance), Developer API, White-label for software vendors.",
          internationalPlan: "Year 3: US pilot (large automation market). Year 4: EU expansion (GDPR advantage). Strategy: Prove UK product-market fit before international. Challenge: NL works best in English initially. Long-term: Multilingual support for EU languages.",
          vision: "5-year vision: Leading AI-powered workflow automation for SMEs globally. 5,000 customers, £15M ARR, 60 employees. Platform: NL automation + integrations + templates marketplace. Position: 'The SME alternative to enterprise RPA'. Exit potential: Acquisition by RPA vendor (UiPath, Microsoft), productivity suite (Google, Notion), or enterprise software.",
          targetEndorser: "Primary: Envestors (AI/automation expertise). Alternative: Edinburgh AI cluster (research connections). Rationale: Envestors has automation/AI companies in portfolio, understands enterprise vs SME dynamics, connected to investor community.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan, technical demo. (2) Month 6: MVP launch, first customers. (3) Month 12: Year 1 metrics, product-market fit evidence. (4) Month 18: Growth metrics, vertical expansion. (5) Month 24: Series A preparation. (6) Month 30: International strategy, platform evolution.",
          experience: "Uniquely qualified: PhD in NLP + 4 years building automation at UiPath and Automation Anywhere (combined 500K+ users). Deep understanding of workflow extraction, NL understanding, and SME needs. Technical: GPT-4, LangChain, browser automation. Domain: Business processes, document understanding. Network: Automation industry, NLP research community, enterprise software.",
          revenue: "Tiered SaaS: Starter £199/month (5 workflows, 1K runs), Professional £349/month (25 workflows, 10K runs), Business £499/month (100 workflows, 50K runs). Implementation: Self-service + templates. Add-ons: Custom workflow build £500, Priority support £100/month. LTV: £5,980 (20-month retention). CAC: £350. Gross margin: 72% (API costs significant).",
        },
      ],
      foodbev: [
        { // GreenBite - Plant-Based Foods - COMPREHENSIVE
          businessName: "GreenBite Foods",
          industry: "Food & Beverage / Plant-Based / Sustainable Food",
          problem: "UK consumers want sustainable protein alternatives but current options taste artificial and cost 40% more than meat. 67% of flexitarians abandon plant-based products due to taste.",
          innovationStage: "mvp-complete",
          productStatus: "Launched 3 plant-based products in 45 UK independent retailers. Proprietary fermentation process creates meat-like texture. Customer satisfaction 4.6/5 stars.",
          existingCustomers: "45 independent retailers stocking products (list available). 3 restaurant chains in trial (names confidential). Direct-to-consumer via website: 850 repeat customers. Testimonials: 'Best plant-based chicken I've tried' - Sarah M., London.",
          tractionEvidence: "Sales: 12,000 units/month, £48K revenue. Growth: 25% month-on-month. Repeat purchase rate: 67%. Social media: 8,500 followers. Press coverage: The Guardian, BBC Good Food. Great Taste Award 2024 (1 star).",
          uniqueness: "Innovation: (1) Proprietary fermentation (patent pending). (2) 30% cheaper than Beyond Meat. (3) Tastes 'indistinguishable from chicken' in blind tests (n=200). (4) 100% UK-sourced ingredients.",
          techStack: "Production: Commercial kitchen (HACCP certified), fermentation tanks, packaging line. Suppliers: UK pea protein, natural flavourings. Distribution: 3PL partner. Quality: In-house lab testing.",
          dataArchitecture: "Production process: UK pea protein sourcing → Proprietary fermentation (48-hour process) → Flavour infusion → Forming/shaping → Packaging → Cold chain distribution. Batch tracking: QR codes link to farm origin, production date, nutritional data.",
          aiMethodology: "Not applicable - this is a food manufacturing business. Our innovation is in the proprietary fermentation process that creates a unique texture, not technology/AI. We use standard food production methods with our patented biological process.",
          complianceDesign: "HACCP Level 4 certification (achieved). SALSA (Safe and Local Supplier Approval) - in progress. Allergen management: nut-free facility. Vegan Society trademark application. Organic certification (Soil Association) - planned Year 2. BRCGS Food Safety - planned Year 2.",
          patentStatus: "UK Patent Application GB2412567.8 filed October 2024: 'Fermentation process for plant-based protein texturization'. Trademark: 'GreenBite' registered (UK00003789012). Trade secret: Proprietary flavour formulation (documented, confidential).",
          founderEducation: "MSc Food Science & Technology, University of Reading, 2022 (Distinction). BSc Biochemistry, University of Lagos, 2018 (First Class). HACCP Level 4 certification. Allergen Management certification.",
          founderWorkHistory: "Product Development Manager, Quorn Foods (2022-2024): Led 3 product launches, £2M revenue. Food Scientist, Nestlé R&D (2020-2022): Plant-based research team. Lab Technician, Nigerian Food Research Institute (2018-2020): Protein extraction research.",
          founderAchievements: "Led Quorn product launch generating £2M Year 1 revenue. Published research: 'Fermentation for Plant Protein Improvement' (Food Chemistry Journal, 2023). Won Innovate UK Women in Innovation Award 2023. Developed 12 successful food products in career.",
          relevantProjects: "Quorn: New product line development (£2M revenue). Nestlé: Plant-based chicken alternative R&D. Personal: 18 months developing GreenBite fermentation process. University dissertation: 'Novel Fermentation Methods for Protein Enhancement'.",
          funding: "120000",
          fundingSources: "£50,000 personal savings (bank statements available). £40,000 family investment (formal loan agreement). £30,000 Innovate UK Sustainable Food Grant (reference: SF-2024-0456). Total: £120,000 for equipment and 12-month runway.",
          monthlyProjections: "Year 1: Current - £48K/month revenue, £35K costs. Months 7-12: £75K/month revenue, £50K costs. Year 1 total: £600K revenue, £480K costs. Year 2: £1.2M revenue, 20% net margin. Year 3: £2.5M revenue, 25% margin, break-even Month 8.",
          customerAcquisitionCost: "45",
          lifetimeValue: "280",
          paybackPeriod: "2",
          detailedCosts: "Production facility: £35K/year lease. Ingredients: £15K/month. Packaging: £8K/month. Staff (3 production): £90K/year. Distribution/logistics: £12K/month. Marketing: £3K/month. Compliance/certifications: £15K/year. Total Year 1: £480K.",
          competitors: "1. Beyond Meat (£4.50/pack, US import, limited UK availability). 2. Quorn (£3.50/pack, established brand, egg-based not fully vegan). 3. THIS! (£4.00/pack, VC-funded, broad range). 4. Meatless Farm (£3.80/pack, supermarket focus). 5. Squeaky Bean (£3.50/pack, budget option, basic texture). Our advantage: UK-made, superior taste at competitive price.",
          competitiveDifferentiation: "Blind taste test: 78% preferred GreenBite vs 22% Beyond Meat (n=200). Price: £3.50 vs £4.50 (22% cheaper). 100% UK ingredients (sustainability story). Proprietary texture from fermentation. Great Taste Award validation. Independent retailer relationships.",
          customerInterviews: "32 customer interviews (farmers markets, pop-ups). Key findings: (1) Taste is #1 priority, price #2. (2) 'Made in UK' highly valued for sustainability. (3) Weekly purchase frequency for converted customers. (4) Willing to pay £3-4/pack. (5) Want more variety (currently 3 products).",
          lettersOfIntent: "2 LOIs signed: Whole Foods Market (15 stores, £36K/year potential), Abel & Cole (online delivery partnership, £24K/year potential). 3 restaurant chain trials: Honest Burgers (5 locations), Leon (3 locations), Wagamama (2 locations).",
          willingnessToPay: "Market testing: £3.50/pack optimal price point. 67% repeat purchase rate proves value. Premium positioning vs budget competitors. Subscription box conversion: 23% of website visitors subscribe (£12.99/month, 4 products).",
          marketSize: "TAM: UK plant-based food market £1.1B (2024), growing 18% annually. SAM: Plant-based protein alternatives £340M. SOM: Year 1: £600K (0.18% SAM). Year 3: £2.5M (0.7% SAM). Realistic: UK independent retail + foodservice focus.",
          regulatoryRequirements: "HACCP Level 4: Achieved. SALSA certification: £3K, 3 months. BRCGS Food Safety (required for supermarkets): £8K, 6 months. Organic certification: £2K, 6 months. Vegan trademark: £500, 2 months. Allergen compliance: Ongoing training.",
          complianceTimeline: "Month 1-3: Complete SALSA certification. Month 4-6: Vegan Society trademark approval. Month 6-9: BRCGS Food Safety audit and certification. Month 10-12: Organic certification (Soil Association). Year 2: ISO 22000 food safety management.",
          complianceBudget: "18000",
          jobCreation: "15",
          hiringPlan: "Year 1: 3 production staff (£28K each), 1 sales/marketing (£35K). Year 2: Production Manager (£45K), 4 additional production (£28K), Sales Rep (£32K + commission). Year 3: Operations Director (£55K), Quality Manager (£40K), 3 production. Total: 15 by Year 3.",
          specificRegions: "Year 1: London, South East (health-conscious consumers, premium retailers). Year 2: Manchester, Bristol, Edinburgh (strong vegan scenes). Year 3: National expansion via Ocado, Sainsbury's listing. Production: Current facility Yorkshire, expansion Midlands Year 2.",
          expansion: "Product expansion: Year 1: 3 products. Year 2: 8 products (beef, pork alternatives). Year 3: 15 products (ready meals, sauces). Channel expansion: Independent → Regional supermarkets → National chains → Foodservice (restaurants, universities, hospitals).",
          internationalPlan: "Year 4: Ireland (similar consumer profile, EU access). Year 5: Netherlands, Germany (strong plant-based markets). Strategy: Export initially, local production partnership for scale. Focus: UK profitability and brand strength before international.",
          vision: "5-year vision: UK's leading premium plant-based brand. £15M revenue, 45 employees, national supermarket listings. Known for: UK-made, superior taste, sustainable. Potential exit: acquisition by major food company (Nestlé, Unilever) at 3-4x revenue or private equity growth investment.",
          targetEndorser: "Primary: Innovator International (broad industry coverage, food business expertise). Alternative: UKES (UK Endorsing Service). Rationale: Innovator International has food/FMCG portfolio companies, understands manufacturing businesses, mentor network includes food industry executives.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Business plan and production facility tour. (2) Month 6: Sales progress, retail partnerships update. (3) Month 12: Year 1 review, supermarket listing progress. (4) Month 18: Production expansion plans. (5) Month 24: Team growth, Year 2 financials. (6) Month 30: International expansion strategy.",
          experience: "Uniquely qualified: 6 years food industry R&D (Quorn, Nestlé). Developed 12 commercially successful products. Deep expertise: plant-based protein science, fermentation, food manufacturing. Industry connections: retailer buyers, food service distributors. Proven ability to take products from lab to shelf.",
          revenue: "Product pricing: £3.50-4.50 per pack (250g). Channels: Wholesale to retailers (50% margin), direct-to-consumer website (70% margin), subscription boxes (65% margin). Foodservice: £8-12/kg to restaurants. Target: 60% wholesale, 25% D2C, 15% foodservice. Gross margin: 45%.",
        },
        { // BrewCraft - Artisan Beverages - COMPREHENSIVE
          businessName: "BrewCraft",
          industry: "Food & Beverage / Craft Drinks / Low-Alcohol",
          problem: "UK low/no-alcohol market growing 30% annually but premium options lack taste complexity. 58% of consumers find alcohol-free beers 'watery' or 'artificial'.",
          innovationStage: "mvp-complete",
          productStatus: "Award-winning low-alcohol craft beers sold in 120 UK pubs and 80 retail locations. Great Taste Award 2024. 15,000 units sold monthly.",
          existingCustomers: "120 pubs/bars (list available). 80 retail stockists (independent bottle shops, delis). Online sales: 2,400 direct customers. Key accounts: BrewDog Bars (12 locations), Bermondsey Beer Mile (6 venues). Testimonials on website.",
          tractionEvidence: "15,000 units/month (£52K revenue). 40% month-on-month growth. Great Taste Award 2024 (2 stars). Featured in: The Drinks Business, Morning Advertiser. Social: 12,000 Instagram followers. 68% repeat purchase rate.",
          uniqueness: "Brewing innovation: (1) Cold-extraction process preserves flavour (patent pending). (2) Only 0.5% ABV vs competitors' 0.0% with better taste. (3) 2x more complex flavour profile in blind tests.",
          techStack: "Microbrewery (2,000L capacity), cold-extraction system, canning line, quality testing lab. SALSA certification. UK hop suppliers. Yeast bank for proprietary strains.",
          dataArchitecture: "Brewing process: Water treatment → Mashing → Lautering → Boiling → Cold-extraction (proprietary 72-hour process) → Carbonation → Canning. Quality: pH testing, alcohol verification, microbiological testing each batch. Traceability: Batch codes link to ingredients, dates, test results.",
          aiMethodology: "Not applicable - artisan brewing business. Innovation is in proprietary cold-extraction brewing process, not technology. We use traditional craft brewing methods enhanced by our patented low-alcohol extraction technique.",
          complianceDesign: "SALSA certification (achieved). HMRC alcohol duty exemption (0.5% ABV threshold). Trading Standards compliant labelling. Allergen declaration (barley/wheat). Vegan Society certified. BRCGS planned for Year 2 (supermarket requirement).",
          patentStatus: "UK Patent Application GB2411234.5 filed September 2024: 'Cold-extraction method for low-alcohol beer production preserving aromatic compounds'. Trademark: 'BrewCraft' registered. Trade secrets: Proprietary yeast strains, hop combinations documented.",
          founderEducation: "Diploma in Brewing & Distilling, Heriot-Watt University, 2021. BSc Chemistry, University of Manchester, 2018. Cicerone Certified Beer Server. WSET Level 2 Award in Beer.",
          founderWorkHistory: "Head Brewer, Camden Town Brewery (2021-2024): Led innovation team, developed 8 new beers. Assistant Brewer, Beavertown (2019-2021): Production brewing, quality control. Lab Technician, AB InBev (2018-2019): Quality assurance.",
          founderAchievements: "Developed Camden Hells Light (£1.2M Year 1 sales). Won SIBA Regional Champion Beer 2023. Led team of 4 brewers. Published: 'Low-Alcohol Brewing Techniques' (Brewer's Guardian, 2023). Trained 12 junior brewers.",
          relevantProjects: "Camden: Light beer development (£1.2M revenue). Beavertown: Session IPA range. Personal: 3 years developing cold-extraction process (home brewing, then commercial trials). University dissertation: 'Flavour Retention in Dealcoholized Beer'.",
          funding: "95000",
          fundingSources: "£35,000 personal savings. £30,000 family investment. £20,000 Start Up Loans (reference: SUL-2024-8901). £10,000 brewing competition prize money. Total: £95,000 for equipment upgrade and 10-month runway.",
          monthlyProjections: "Year 1: Current £52K/month revenue, £38K costs. Target end Year 1: £85K/month, £55K costs. Year 1 total: £750K revenue, £500K costs. Year 2: £1.5M revenue, 22% margin. Year 3: £3M revenue, 28% margin. Break-even Month 6.",
          customerAcquisitionCost: "35",
          lifetimeValue: "420",
          paybackPeriod: "1",
          detailedCosts: "Brewery lease: £24K/year. Ingredients (hops, malt, yeast): £18K/month. Cans/packaging: £12K/month. Staff (3 brewers): £105K/year. Distribution: £15K/month. Marketing/events: £5K/month. Total Year 1: £500K.",
          competitors: "1. Lucky Saint (market leader, £3.50/can, VC-backed, mainstream taste). 2. Big Drop (£3.00/can, award-winning, limited range). 3. Heineken 0.0 (£1.50/can, mass market, artificial taste). 4. Athletic Brewing (US import, £4.50/can, expensive). 5. Days Brewing (£3.00/can, new entrant). Our advantage: Craft quality, UK-brewed, 0.5% ABV for better taste.",
          competitiveDifferentiation: "Blind taste test: 71% preferred BrewCraft vs 29% Lucky Saint (n=150 craft beer drinkers). Great Taste Award vs no awards for Lucky Saint. 0.5% ABV allows more flavour than 0.0% competitors. UK craft brewery credentials. Premium positioning: £3.50/can vs £1.50 mass market.",
          customerInterviews: "35 interviews at beer festivals, brewery taproom. Findings: (1) 'Tastes like real beer' is main purchase driver. (2) Health-conscious but don't want to compromise. (3) Pay premium for craft quality. (4) Want variety (IPA, Lager, Stout). (5) Value UK provenance.",
          lettersOfIntent: "Partnership agreements: JD Wetherspoon (trial 50 locations, £45K potential), Majestic Wine (20 stores), Waitrose buyer meeting scheduled. Distributor: Matthew Clark (national pub distribution) in negotiation.",
          willingnessToPay: "Optimal price: £3.50/can retail, £3.00 wholesale. Premium positioning justified by taste/awards. Taproom sales: £5/pint. Subscription: 12-can monthly box £36 (24% margin). 68% repeat purchase validates value.",
          marketSize: "TAM: UK beer market £18B. Low/no-alcohol segment £400M (growing 30%/year). SAM: Premium low-alcohol craft beer £80M. SOM: Year 1: £750K (0.9% SAM). Year 3: £3M (3.75% SAM). Realistic given distribution partnerships.",
          regulatoryRequirements: "SALSA certification: Achieved. HMRC duty exemption (0.5% ABV): Confirmed. Trading Standards labelling: Compliant. BRCGS for supermarkets: £8K, 6 months. Allergen management: Documented. Organic (future): Soil Association £2K.",
          complianceTimeline: "Month 1: SALSA renewal. Month 3-6: BRCGS audit preparation. Month 6: BRCGS certification. Month 9: Organic certification application. Month 12: ISO 22000 assessment. Ongoing: HMRC duty compliance, Trading Standards.",
          complianceBudget: "15000",
          jobCreation: "12",
          hiringPlan: "Year 1: Current 3 brewers + founder. Add: Sales Rep (£35K). Year 2: Head Brewer (£50K), 2 production (£30K each), Marketing (£38K). Year 3: Operations Manager (£48K), 3 production. Total: 12 by Year 3.",
          specificRegions: "Year 1: London (craft beer hub), South East. Year 2: Manchester, Bristol, Edinburgh. Year 3: National via Wetherspoon, supermarket listings. Taproom: Bermondsey Beer Mile location Year 2.",
          expansion: "Product: Current 3 beers → Year 2: 6 (add Stout, Wheat, Seasonal). Year 3: 10 + limited editions. Channel: Pubs → Supermarkets → Restaurants → Export. Brand extensions: Merchandise, brewery tours, beer club.",
          internationalPlan: "Year 4: Ireland (Guinness 0.0 competitor, pub culture). Year 5: Benelux (strong craft beer markets). Strategy: Export to specialty importers, then local partnerships. Focus on UK brand building first.",
          vision: "5-year vision: UK's leading craft low-alcohol brewery. £8M revenue, 25 employees. Known for: Uncompromising taste, craft credentials, innovation. Flagship taproom in London. Potential: Acquisition by major brewer (AB InBev, Molson Coors) or private equity growth.",
          targetEndorser: "Primary: Innovator International (manufacturing/FMCG expertise). Alternative: Envestors (if highlighting e-commerce/D2C technology). Rationale: Innovator International understands product businesses, has food/beverage portfolio, manufacturing mentor network.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Brewery tour, business plan review. (2) Month 6: Sales/distribution progress. (3) Month 12: Year 1 review, supermarket discussions. (4) Month 18: Expansion plans, new product launches. (5) Month 24: Team growth, export strategy. (6) Month 30: Brand valuation, exit options.",
          experience: "Uniquely qualified: 6 years professional brewing (Camden, Beavertown). Developed award-winning beers generating £1M+ revenue. Technical: brewing science, flavour chemistry, quality control. Industry connections: pub chains, distributors, retailers. Passion: Founded home brewing club with 50 members.",
          revenue: "Pricing: £3.50/can retail, £2.40 wholesale, £3.00 D2C. Channels: 50% wholesale to pubs/retailers, 30% D2C website, 20% taproom. Subscription: 12-can box £36/month. Gross margin: 52% wholesale, 68% D2C. Target: £750K Year 1, £3M Year 3.",
        },
        { // FreshPack - Sustainable Packaging - COMPREHENSIVE
          businessName: "FreshPack Solutions",
          industry: "Packaging / Sustainability / Food Service",
          problem: "UK food industry uses 2.4 million tonnes of plastic packaging annually. Biodegradable alternatives cost 3x more and don't maintain food freshness as effectively.",
          innovationStage: "pre-mvp",
          productStatus: "Developed seaweed-based packaging prototype. Lab tests show 45-day shelf life (vs 30 days for plastic). 8 food manufacturers expressed interest. Seeking £150K for production scale-up.",
          existingCustomers: "8 food manufacturers expressed interest (emails available). 3 pilot agreements signed: UK organic food brand (150K units trial), meal prep company (75K units), ready meals manufacturer (200K units). Letters of intent total value: £85K.",
          tractionEvidence: "Prototype validation: 45-day shelf life proven (vs 30 days plastic). 3 signed pilot agreements. Innovate UK grant application (£75K) shortlisted. Featured: Packaging News, The Grocer. 2 VC meetings scheduled.",
          uniqueness: "Material innovation: (1) Seaweed-based, fully compostable in 90 days. (2) Same cost as plastic at scale. (3) Better freshness retention. (4) UK seaweed farming partnerships.",
          techStack: "R&D lab, seaweed processing equipment, film extrusion machinery. Key partners: Scottish seaweed farms, food science consultants. Production: Contract manufacturing partner identified.",
          dataArchitecture: "Production process: Seaweed harvesting (Scottish farms) → Cleaning/processing → Biopolymer extraction → Film formation → Coating application → Converting (bags, wraps, trays). Quality: Shelf-life testing, compostability certification, food contact testing.",
          aiMethodology: "Not applicable - materials science/manufacturing business. Our innovation is in the seaweed-based biopolymer formulation and production process, not technology. We use standard food packaging production methods with our patented bio-material.",
          complianceDesign: "Food contact materials (FCM) compliance: EU 10/2011. Compostability: EN 13432 standard (testing in progress). BRCGS Packaging certification: Planned for production facility. Home compostability: OK Compost Home certification target.",
          patentStatus: "UK Patent Application GB2413456.9 filed November 2024: 'Seaweed-derived biopolymer film for food packaging with extended shelf-life properties'. Trade secret: Proprietary coating formulation. Design registration: Packaging shapes pending.",
          founderEducation: "PhD Materials Science, Imperial College London, 2023 (Bio-based polymers thesis). MEng Chemical Engineering, University of Cambridge, 2019 (First Class). RSC Chartered Chemist status.",
          founderWorkHistory: "R&D Scientist, BASF Packaging (2023-2024): Developed sustainable films. Research Assistant, Imperial College (2019-2023): PhD on seaweed biopolymers. Intern, Unilever R&D (Summer 2018): Sustainable packaging projects.",
          founderAchievements: "PhD research cited 12 times. BASF: Contributed to 2 patent applications. Winner: Royal Society of Chemistry Young Researcher Award 2023. Published 5 peer-reviewed papers. Presented at 3 international conferences.",
          relevantProjects: "Imperial PhD: 4 years developing seaweed polymer technology. BASF: Bio-based film development. Publications: 'Novel Seaweed Biopolymers for Food Packaging' (Green Chemistry, 2023). Pilot: 3 food company packaging trials.",
          funding: "180000",
          fundingSources: "£50,000 personal savings. £40,000 family investment. £75,000 Innovate UK Sustainable Plastics Grant (application shortlisted). £15,000 climate tech competition prize. Total: £180,000 for pilot production.",
          monthlyProjections: "Year 1: Pre-revenue (R&D, pilots). Months 10-12: First sales £15K/month. Year 1: £45K revenue, £170K costs (investment phase). Year 2: £480K revenue (pilots convert to orders). Year 3: £1.5M revenue, break-even Month 30.",
          customerAcquisitionCost: "2500",
          lifetimeValue: "45000",
          paybackPeriod: "2",
          detailedCosts: "R&D/prototyping: £40K. Lab equipment: £25K. Contract manufacturing setup: £35K. Certifications: £20K. Staff (2 scientists): £90K/year. Materials testing: £15K. Marketing/sales: £10K. Total Year 1: £170K.",
          competitors: "1. Novamont/Mater-Bi (Italian, corn-based, 2x price of plastic). 2. TIPA (Israeli, home compostable, premium price). 3. Notpla (UK seaweed, limited to sachets/coatings). 4. BioPak (Australian, sugarcane, import costs). 5. Vegware (UK, plant-based, not food contact films). Our advantage: UK seaweed supply, competitive pricing at scale, extended shelf-life.",
          competitiveDifferentiation: "45-day shelf life vs 30 days plastic (lab validated). UK seaweed sourcing (sustainability story, supply security). Target: Same price as plastic at 10M+ units. Home compostable vs industrial-only competitors. Focus: Food films (underserved by competitors).",
          customerInterviews: "22 interviews with food packaging buyers. Findings: (1) Sustainability is boardroom priority but cost is barrier. (2) Will pay 10-20% premium maximum. (3) Shelf-life critical for fresh foods. (4) 'Made in UK' sustainability story valuable. (5) Need industrial-scale proof.",
          lettersOfIntent: "3 pilot agreements signed: Organic food brand (150K units, £12K), Meal prep company (75K units, £6K), Ready meals manufacturer (200K units, £15K). Conditional orders: £85K upon successful pilots and production scale-up.",
          willingnessToPay: "Target pricing: 15% above plastic initially, parity at scale. Pilot pricing: £0.08/unit vs £0.07/unit plastic. Customer feedback: 8/10 buyers accept 15% premium for genuine sustainability. Volume discounts: 20% at 1M+ units.",
          marketSize: "TAM: UK food packaging £8B. Sustainable packaging £960M (12%, growing 20%/year). SAM: Flexible food films/wraps £240M. SOM: Year 1: £45K (pilots). Year 3: £1.5M (0.6% SAM). Realistic given production ramp-up timeline.",
          regulatoryRequirements: "Food contact materials (FCM): EU 10/2011 testing £15K. EN 13432 compostability: £8K, 6 months testing. OK Compost Home: £5K. BRCGS Packaging: £10K. REACH compliance: Confirmed. Novel food contact material notification.",
          complianceTimeline: "Month 1-6: FCM testing and certification. Month 3-9: EN 13432 composting trials. Month 6-12: OK Compost Home certification. Month 12-18: BRCGS Packaging for production facility. Ongoing: Batch testing for each production run.",
          complianceBudget: "45000",
          jobCreation: "18",
          hiringPlan: "Year 1: Founder + 1 Materials Scientist (£45K). Year 2: Production Manager (£50K), 3 production operators (£28K each), Sales (£40K). Year 3: Quality Manager (£42K), 8 production staff, R&D scientist (£48K). Total: 18 by Year 3.",
          specificRegions: "Year 1: Production pilot in Scotland (near seaweed supply). Year 2: Main facility Midlands (logistics hub). Sales: London, South East (food manufacturer HQs). Year 3: National distribution from central facility.",
          expansion: "Product: Year 1: Films/wraps. Year 2: Trays, punnets. Year 3: Full range including rigid containers. Vertical: Food → Cosmetics → Pharma (higher margins). Technology licensing to international manufacturers.",
          internationalPlan: "Year 4: EU (single market, similar regulations). Year 5: North America (growing sustainable packaging demand). Strategy: Technology licensing model for international (avoid logistics complexity). Focus: UK market leadership first.",
          vision: "5-year vision: UK's leading seaweed packaging company. £12M revenue, 45 employees. Full range: films, trays, rigid packaging. Known for: Genuine sustainability, competitive pricing. Exit: Acquisition by major packaging company (Amcor, Berry) or materials company (BASF, Dow).",
          targetEndorser: "Primary: Envestors (deep-tech, climate focus). Alternative: Innovator International (manufacturing expertise). Rationale: Envestors values science-based innovation, has climate-tech portfolio, provides access to VC network for capital-intensive scaling.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Technology review, patent strategy. (2) Month 6: Pilot results, certification progress. (3) Month 12: Production scale-up, customer conversions. (4) Month 18: Funding round support. (5) Month 24: Market expansion, new products. (6) Month 30: International licensing, exit preparation.",
          experience: "Uniquely qualified: PhD in seaweed biopolymers (4 years research). Industry R&D experience (BASF). Published researcher with 5 papers, 12 citations. Technical: polymer science, food packaging, sustainability certifications. Network: packaging industry contacts, seaweed farming partnerships.",
          revenue: "B2B pricing: £0.08/unit films (vs £0.07 plastic). Volume tiers: 100K units (full price), 500K (10% discount), 1M+ (20% discount). Gross margin: 45% at scale. Revenue model: Product sales + potential technology licensing Year 4+. Target: Break-even at 15M units/year production.",
        },
      ],
      manufacturing: [
        { // EcoMake - Sustainable Manufacturing - COMPREHENSIVE
          businessName: "EcoMake Industries",
          industry: "Manufacturing / Sustainability / Circular Economy",
          problem: "UK manufacturing generates 5.4 million tonnes of plastic waste annually. Recycled plastic products are 40% weaker and 3x more expensive than virgin materials.",
          innovationStage: "mvp-complete",
          productStatus: "Operating recycled plastic manufacturing facility producing outdoor furniture. 35 B2B customers (councils, schools). £180K revenue Year 1. ISO 14001 certified.",
          existingCustomers: "35 B2B customers: 15 local councils (park benches, playground equipment), 12 schools (outdoor seating), 8 commercial properties. Key accounts: Manchester City Council (£28K order), Leeds Schools Partnership (£18K). Testimonials available.",
          tractionEvidence: "£180K revenue Year 1. 35 repeat customers. Average order value: £5,100. 85% customer retention. Featured: The Guardian sustainability section, Construction News. 3 industry awards. ISO 14001 and CE certified.",
          uniqueness: "Process innovation: (1) Proprietary reinforcement makes recycled plastic 95% as strong as virgin. (2) 20% cheaper than competitors. (3) 50-year product warranty. (4) Full circularity - old products recycled.",
          techStack: "Manufacturing: Injection moulding, extrusion lines, recycling shredders. Quality: Tensile testing, UV weathering chamber. Certifications: ISO 14001, CE marking. ERP: Manufacturing software for order tracking.",
          dataArchitecture: "Production: Plastic waste collection → Sorting/cleaning → Shredding → Reinforcement additive mixing → Extrusion/moulding → Quality testing → Finishing → Dispatch. Traceability: Each product tagged with waste source, production batch, test results.",
          aiMethodology: "Not applicable - manufacturing business. Our innovation is in the proprietary reinforcement formula that strengthens recycled plastic, not technology/AI. We use advanced material science with our patented additive blend.",
          complianceDesign: "ISO 14001 Environmental Management (achieved). ISO 9001 Quality Management (achieved). CE marking for playground equipment. EN 1176 playground safety standards. Waste Carrier Licence. Environmental Permit for processing.",
          patentStatus: "UK Patent GB2410234.7: 'Reinforcement additive for recycled polymer enhancement'. Filed March 2024. Trade secrets: Exact additive ratios documented. Trademark: 'EcoMake' registered. Design registrations: 8 product designs protected.",
          founderEducation: "MEng Materials Engineering, University of Sheffield, 2020 (First Class). BSc Mechanical Engineering, University of Ibadan, 2016 (First Class). Six Sigma Green Belt. Health & Safety Management certification.",
          founderWorkHistory: "Production Manager, Berry Plastics UK (2021-2024): Managed 40-person facility, £8M output. Process Engineer, DS Smith (2020-2021): Packaging innovation. Engineer, Dangote Industries (2016-2020): Large-scale manufacturing.",
          founderAchievements: "Reduced Berry Plastics waste by 35% (£400K annual savings). Led facility to ISO 14001 certification. Managed 40-person production team. Published: 'Recycled Polymer Reinforcement' (Plastics Engineering, 2023). Won Sustainability in Manufacturing Award 2023.",
          relevantProjects: "Berry Plastics: Waste reduction initiative (£400K savings). DS Smith: Recycled content packaging development. Personal: 2 years developing reinforcement formula. Sheffield dissertation: 'Mechanical Properties of Recycled Thermoplastics'.",
          funding: "150000",
          fundingSources: "£60,000 personal savings. £50,000 family investment. £40,000 WRAP (Waste & Resources Action Programme) Grant (reference: WRAP-2024-0892). Total: £150,000 for equipment and working capital.",
          monthlyProjections: "Year 1: £15K/month revenue (current), £12K costs. Year 2: £40K/month revenue, £28K costs. Year 3: £80K/month revenue, £55K costs. Year 1 total: £180K revenue, £144K costs. Year 3: £960K revenue, break-even Month 10.",
          customerAcquisitionCost: "850",
          lifetimeValue: "25500",
          paybackPeriod: "1",
          detailedCosts: "Factory lease: £36K/year. Raw materials (plastic waste): £48K/year. Equipment maintenance: £18K/year. Staff (5 production): £145K/year. Utilities: £24K/year. Certifications: £8K/year. Marketing: £12K/year. Total Year 1: £144K.",
          competitors: "1. Kedel (established recycled plastic, premium pricing). 2. British Recycled Plastic (limited product range). 3. Enviropol (strong council relationships). 4. Marmax Products (focus on garden). 5. Plastic Lumber Company (imported products). Our advantage: Superior strength, competitive pricing, 50-year warranty.",
          competitiveDifferentiation: "Material testing: 95% virgin plastic strength (vs 60% competitors). 50-year warranty (vs 25-year industry standard). 20% lower pricing through efficiency. Full circularity (take back old products). UK manufacturing (vs imports). ISO 14001 certified.",
          customerInterviews: "25 interviews with council procurement officers and facilities managers. Findings: (1) Sustainability is council priority. (2) Total cost of ownership matters (long warranty). (3) UK manufacturing preferred for carbon footprint. (4) Price competitive with virgin plastic needed. (5) Testimonials important for public procurement.",
          lettersOfIntent: "3 LOIs signed: Birmingham City Council (£45K, park furniture), London Borough of Camden (£32K, school playground), University of Leeds (£18K, campus seating). Framework agreements in discussion with 5 additional councils.",
          willingnessToPay: "Council procurement: Competitive with virgin plastic alternatives. Premium justified by 50-year warranty, sustainability credentials. Average order: £5,100. Framework pricing: 10% discount for multi-year agreements.",
          marketSize: "TAM: UK outdoor furniture/street furniture £800M. SAM: Public sector sustainable products £180M. SOM: Year 1: £180K (0.1% SAM). Year 3: £960K (0.5% SAM). Realistic given B2B sales cycle and council procurement processes.",
          regulatoryRequirements: "ISO 14001: Achieved. ISO 9001: Achieved. CE marking: Achieved. EN 1176 (playground): Per product testing £2K. Waste Carrier Licence: £154. Environmental Permit: Achieved. CHAS/SafeContractor for council work.",
          complianceTimeline: "Month 1: CHAS accreditation (council contractor requirement). Month 3: SafeContractor. Month 6: ISO 45001 (occupational health). Month 12: Carbon Trust certification. Ongoing: EN 1176 testing for each new playground product.",
          complianceBudget: "22000",
          jobCreation: "18",
          hiringPlan: "Year 1: Current 5 production + founder. Add: Sales Manager (£42K). Year 2: 4 additional production (£28K each), Quality Manager (£38K). Year 3: Operations Director (£55K), 5 production staff, Admin (£28K). Total: 18 by Year 3.",
          specificRegions: "Year 1: North of England (factory base Yorkshire). Year 2: Midlands, Scotland (strong council demand). Year 3: National coverage. Factory expansion: Second facility Midlands Year 3 to serve southern councils.",
          expansion: "Products: Year 1: Benches, tables. Year 2: Playground equipment, planters. Year 3: Full street furniture range. Sectors: Councils → Schools → Commercial property → Retail → Hospitality. Revenue: B2B public sector → B2B private sector.",
          internationalPlan: "Year 4: Ireland (EU access, similar procurement processes). Year 5: Benelux, Nordics (strong sustainability focus). Strategy: Direct sales initially, distributor partnerships for scale. Focus: UK market leadership before international.",
          vision: "5-year vision: UK's leading recycled plastic products company. £5M revenue, 45 employees, national distribution. Known for: Uncompromising quality, true circularity, council trusted. Exit potential: Acquisition by construction materials company or private equity growth.",
          targetEndorser: "Primary: Innovator International (manufacturing expertise, sustainability portfolio). Alternative: GEP (Global Entrepreneur Programme for high-growth manufacturers). Rationale: Innovator International understands manufacturing, has sustainability focus, mentor network includes manufacturing executives.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Factory tour, business plan review. (2) Month 6: Sales progress, new products. (3) Month 12: Year 1 review, expansion plans. (4) Month 18: Second facility planning. (5) Month 24: Team growth, national coverage. (6) Month 30: Export strategy, exit options.",
          experience: "Uniquely qualified: 8 years manufacturing experience (Berry, DS Smith, Dangote). Led 40-person facility. Deep expertise: plastics processing, quality systems, sustainability. Proven: 35% waste reduction delivering £400K savings. Industry connections: procurement networks.",
          revenue: "B2B pricing: £500-15,000 per order. Product margins: 35-45%. Payment: 30-day terms for councils (creditworthy). Framework agreements: Annual committed volumes. Target: 85% public sector, 15% private. Year 1: £180K. Year 3: £960K.",
        },
        { // SmartBuild - Construction Innovation - COMPREHENSIVE
          businessName: "SmartBuild Systems",
          industry: "Construction / Modular Building / Sustainable Construction",
          problem: "UK faces 4.3 million home shortage. Traditional construction takes 6-12 months per home, costs £2,000/sqm, and generates 35% material waste.",
          innovationStage: "mvp-complete",
          productStatus: "Delivered 12 modular homes (2-bed units) for housing association pilot. Build time: 8 weeks vs 6 months. Customer satisfaction: 4.8/5. £420K revenue.",
          existingCustomers: "3 housing associations (12 units delivered). 2 commercial clients (office pods). Key accounts: Midland Housing Association (8 units, £280K), Community Housing Trust (4 units, £140K). 4.8/5 customer satisfaction. References available.",
          tractionEvidence: "12 units delivered, £420K revenue. Average build time: 8 weeks (vs 6 months traditional). Customer satisfaction: 4.8/5. Press: Construction News, Building Magazine. Pipeline: £800K in proposals. NHBC warranty provider approved.",
          uniqueness: "Construction innovation: (1) 70% faster build time. (2) 25% cost reduction. (3) 95% factory-built = near-zero on-site waste. (4) EPC A rating standard. (5) NHBC warranty.",
          techStack: "Factory: CNC cutting, modular assembly line, quality testing. Materials: Timber frame, SIPs panels, triple glazing. Transport: Oversized load logistics. Design: BIM software for customisation.",
          dataArchitecture: "Production: Design (BIM) → CNC cutting → Modular assembly → MEP fit-out → Quality inspection → Transport → On-site installation → Commissioning. Tracking: Project management software links design, production, installation, warranties.",
          aiMethodology: "Not applicable - construction/manufacturing business. Innovation is in factory production methods and modular design system, not technology/AI. We use advanced construction techniques with our proprietary modular system.",
          complianceDesign: "NHBC warranty (achieved - key for housing associations). Building Regulations Part L (EPC A standard). BOPAS certification (pending - mortgage lender acceptability). Structural warranty insurance. CDM Regulations compliant.",
          patentStatus: "UK Design Registration: Modular connection system. Trade secrets: Proprietary panel specifications, assembly sequences documented. Trademark: 'SmartBuild' registered. No patents filed - method relies on know-how and efficiency.",
          founderEducation: "MSc Construction Management, Loughborough University, 2019 (Distinction). BEng Civil Engineering, University of Lagos, 2015 (First Class). CIOB Member. SMSTS Site Management certification.",
          founderWorkHistory: "Project Manager, Laing O'Rourke (2019-2024): Delivered £45M modular hospital project. Site Manager, Berkeley Homes (2017-2019): Residential developments. Graduate Engineer, Julius Berger Nigeria (2015-2017): Infrastructure projects.",
          founderAchievements: "Led £45M modular hospital project (on time, under budget). Managed teams of 80+ workers. Introduced lean construction methods saving 15% on project costs. CIOB Young Achiever Award finalist 2023. Delivered 500+ residential units across career.",
          relevantProjects: "Laing O'Rourke: Modular hospital building (£45M, 18 months). Berkeley: Modular bathroom pods (200 units). Personal: SmartBuild pilot with 12 homes. Loughborough dissertation: 'Off-site Construction Efficiency in UK Housing'.",
          funding: "280000",
          fundingSources: "£80,000 personal savings. £100,000 family investment (equity). £50,000 Start Up Loans. £50,000 Homes England Innovation Grant (reference: HE-2024-3456). Total: £280,000 for factory setup and working capital.",
          monthlyProjections: "Year 1: £35K/month revenue (current), £28K costs. Year 2: £120K/month revenue, £85K costs. Year 3: £250K/month revenue, £170K costs. Year 1 total: £420K revenue, £336K costs. Year 3: £3M revenue, break-even Month 14.",
          customerAcquisitionCost: "8500",
          lifetimeValue: "180000",
          paybackPeriod: "2",
          detailedCosts: "Factory lease: £60K/year. Equipment: £40K depreciation. Materials: £25K/unit. Staff (8 production): £280K/year. Transport: £8K/unit. Certifications: £15K/year. Sales/marketing: £24K/year. Total Year 1: £336K.",
          competitors: "1. Legal & General Modular (large-scale, £200M+ invested). 2. Ilke Homes (VC-backed, volume focused). 3. TopHat (technology-driven, premium). 4. Berkeley Modular (developer-owned). 5. Swan Housing (housing association owned). Our advantage: Nimble, cost-efficient, housing association specialist.",
          competitiveDifferentiation: "Build time: 8 weeks vs 6 months traditional. Cost: £1,500/sqm vs £2,000/sqm (25% cheaper). Waste: 5% vs 35% traditional. EPC A standard (vs EPC C industry average). NHBC warranty for mortgage lender acceptance. Housing association focus (vs developer focus of competitors).",
          customerInterviews: "18 interviews with housing association development directors. Findings: (1) Speed critical for grant funding deadlines. (2) Cost per unit is key metric. (3) Mortgage lender acceptability essential. (4) Quality concerns about modular (need references). (5) Local authority relationships important for planning.",
          lettersOfIntent: "2 LOIs signed: Regional Housing Association (20 units, £700K, subject to planning), Community Land Trust (8 units, £280K). Pipeline discussions: 5 additional housing associations representing £2.4M potential Year 2-3.",
          willingnessToPay: "Housing association pricing: £35K per 2-bed unit (vs £45K traditional equivalent). Development agreements: Milestone payments (30% deposit, 40% production, 30% installation). Price premium justified by speed to meet Homes England grant deadlines.",
          marketSize: "TAM: UK new housing £40B annually. SAM: Affordable housing (housing associations) £6B. SOM: Year 1: £420K (0.007% SAM). Year 3: £3M (0.05% SAM). Conservative given factory capacity constraints.",
          regulatoryRequirements: "NHBC warranty: Achieved. BOPAS certification: £25K, 6 months (critical for mortgage lender acceptance). Building Control type approval: £15K. CDM compliance: Ongoing. Structural warranty insurance: £20K/year.",
          complianceTimeline: "Month 1-6: BOPAS certification (mortgage lender acceptability). Month 6-12: Building Control type approval (streamlines future projects). Month 12-18: ISO 9001 quality management. Year 2: ISO 14001 environmental management.",
          complianceBudget: "65000",
          jobCreation: "25",
          hiringPlan: "Year 1: 8 factory staff + founder. Add: Sales Director (£60K). Year 2: Production Manager (£50K), 6 factory (£30K each), Site Team Lead (£45K). Year 3: Operations Director (£65K), 8 additional factory, Site team (4). Total: 25 by Year 3.",
          specificRegions: "Year 1: Midlands (factory base), North West (housing need). Year 2: Yorkshire, North East. Year 3: National. Strategy: Focus on regions with housing association partnerships and strong affordable housing demand.",
          expansion: "Products: Year 1: 2-bed homes. Year 2: Add 1-bed, 3-bed, apartments. Year 3: Commercial (office pods, retail). Sectors: Housing associations → Local authorities → Private developers → Commercial. Scale: 50 units/year → 150 units/year.",
          internationalPlan: "Year 4: Ireland (housing crisis, similar regulations). Year 5: Export modular systems to Middle East (high demand, premium margins). Strategy: UK housing focus first, international licensing/JV model. Focus on UK profitability before expansion.",
          vision: "5-year vision: UK's leading modular affordable housing provider. 300 homes/year, £15M revenue, 60 employees. Known for: Speed, quality, sustainability, housing association trusted. Exit: Acquisition by major housebuilder or private equity growth investment.",
          targetEndorser: "Primary: Innovator International (construction expertise, manufacturing focus). Alternative: GEP (high-growth potential). Rationale: Innovator International has construction portfolio, understands capital-intensive businesses, mentor network includes property developers.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Factory tour, housing association pipeline review. (2) Month 6: BOPAS progress, first repeat orders. (3) Month 12: Year 1 delivery, expansion plans. (4) Month 18: Factory capacity increase. (5) Month 24: Team growth, new product lines. (6) Month 30: National expansion, exit planning.",
          experience: "Uniquely qualified: 9 years construction experience including £45M modular hospital project. Led teams of 80+. Deep expertise: modular construction, project management, housing regulations. Industry connections: housing associations, Homes England. Proven delivery of 500+ residential units.",
          revenue: "Product pricing: £35K per 2-bed unit (turnkey). Development margin: 25-30%. Payment: Staged (30/40/30). Framework agreements with housing associations for volume discounts. Add-ons: Design customisation, site works. Target: Year 1 £420K, Year 3 £3M.",
        },
        { // CleanMaterials - Eco Products - COMPREHENSIVE
          businessName: "CleanMaterials Co",
          industry: "Manufacturing / Sustainable Materials / B2B Products",
          problem: "UK businesses spend £2.1 billion on cleaning products containing harmful chemicals. 23% of workplace skin conditions (46,000 cases/year) are caused by chemical cleaning products. COSHH compliance costs SMEs £8,000/year in assessments and training. Chemical production generates 2.3M tonnes of hazardous waste annually.",
          innovationStage: "pre-mvp",
          productStatus: "Developed bio-enzyme cleaning concentrate through 18 months R&D. Lab tests (verified by independent lab) show 40% better cleaning performance than chemical alternatives. Product stable for 18 months shelf life. 15 corporate pilot agreements secured (facilities managers at office buildings, hotels, care homes). Production partner identified for scale-up.",
          existingCustomers: "Pre-launch: 15 pilot agreements signed. Sectors: 6 office facilities managers (combined 45 buildings), 4 hotel chains (120 rooms total), 3 care homes, 2 universities. Letters of intent value: £65K annual orders upon successful pilot. Advisory board: 2 facilities management directors, 1 cleaning industry veteran.",
          tractionEvidence: "15 signed pilot agreements. Product performance: 40% better cleaning (independent lab verified). Shelf stability: 18 months tested. Production: Contract manufacturer confirmed. Pricing: 30% cheaper per-use than chemicals (calculated including dilution). Press interest: 2 trade publication interview requests.",
          uniqueness: "Product innovation: (1) Bio-enzyme formula, zero harmful chemicals (no COSHH assessment needed). (2) Concentrate = 90% less packaging and transport emissions. (3) 30% cheaper per-use than chemical products (10x dilution ratio). (4) One product replaces 5 (multi-surface, glass, floor, bathroom, kitchen). (5) UK manufactured.",
          techStack: "Production: Contract manufacturer (BRC certified), mixing and filling equipment. Formulation: Enzyme cultivation from UK supplier, natural surfactants. Quality lab: pH testing, microbiology, performance testing. Packaging: 100% recycled plastic concentrate bottles. Certifications: EU Ecolabel application submitted.",
          dataArchitecture: "Production process: Enzyme sourcing (UK biotech supplier) → Concentrate blending → Quality testing (each batch) → Filling/packaging → Distribution to customers. Traceability: Batch codes link to ingredients, test results, expiry. Customer ordering: B2B e-commerce platform for reordering.",
          aiMethodology: "Not applicable - bio-based cleaning product manufacturing business. Our innovation is in the enzyme formulation that provides superior cleaning without harmful chemicals, not technology/AI. We use established biotechnology methods with our proprietary blend.",
          complianceDesign: "EU Ecolabel: Application submitted (6-month process). UK Ecolabel: Post-EU certification. COSHH: Product eliminates need for customer assessments (major selling point). REACH: Registered ingredients. CLP Regulation: Safety labelling compliant. ISO 14001: Environmental management planned Year 2.",
          patentStatus: "Trade secrets: Enzyme blend ratios and formulation process documented internally (not patentable but protectable). Trademark: 'CleanMaterials' UK application TM-2024-02890 (pending). No patents - formulation relies on know-how rather than novel chemistry.",
          founderEducation: "MSc Biotechnology, University of Manchester, 2021 (Distinction). BSc Microbiology, University of Lagos, 2017 (First Class). NEBOSH Environmental Management certificate. EU Ecolabel criteria training.",
          founderWorkHistory: "Product Development Scientist, Unilever Home Care (2021-2024): Developed 3 cleaning product lines, £5M combined revenue. Lab Technician, Reckitt (2019-2021): Formulation testing, quality control. Research Assistant, Nigerian Institute of Chemical Technology (2017-2019): Bio-based surfactant research.",
          founderAchievements: "Unilever: Developed eco-cleaning range (£5M revenue, Great Taste equivalent for cleaning). Reformulated legacy product to meet EU Ecolabel (first in category). Published: 'Enzyme-Based Cleaning Efficacy' (Journal of Surfactants and Detergents, 2023). Led cross-functional team of 6.",
          relevantProjects: "Unilever: Eco-cleaning product line (EU Ecolabel, £5M). Reckitt: Bio-based formulation testing. Lagos research: Surfactant extraction from agricultural waste. Manchester dissertation: 'Enzyme Stability in Cleaning Formulations'. Side project: 12 months developing CleanMaterials formula.",
          funding: "110000",
          fundingSources: "£45,000 personal savings (from Unilever salary). £35,000 family investment (formal loan agreement). £30,000 Innovate UK Smart Grant (application submitted, decision pending). Total: £110,000 for production scale-up and first year operations.",
          monthlyProjections: "Year 1: Month 1-6: £0 revenue (pilot phase), £8K/month costs. Month 7-12: £25K/month revenue (pilots convert), £15K costs. Year 1 total: £150K revenue, £138K costs. Year 2: £65K/month revenue, £35K/month costs, Year 2 total: £780K revenue, £420K costs. Year 3: £150K/month revenue, £85K/month costs, Year 3 total: £1.8M revenue, £1.02M costs. Break-even Month 22.",
          customerAcquisitionCost: "380",
          lifetimeValue: "12500",
          paybackPeriod: "2",
          detailedCosts: "Contract manufacturing: Variable (£2/litre concentrate). Packaging: £0.80/unit. Distribution: £3/order average. Marketing: £15K/year. Sales rep (Year 2): £40K + commission. Certifications: £12K. Samples/trials: £8K. Office/admin: £6K. Total Year 1: £138K.",
          competitors: "1. Diversey (global, chemical-based, enterprise focus). 2. Ecover (consumer-focused, not B2B concentrate). 3. Bio-D (small, limited range). 4. Delphis Eco (EU Ecolabel, premium pricing). 5. Traditional chemicals (P&G Professional, SC Johnson). Our advantage: B2B concentrate, superior enzyme performance, COSHH elimination.",
          competitiveDifferentiation: "40% better cleaning performance (lab tested vs chemicals). Zero COSHH burden (saves £8K/year customer compliance costs). 30% cheaper per-use (10x concentrate). 90% packaging reduction. One product multi-surface (replaces 5 SKUs). UK manufactured (supply chain security).",
          customerInterviews: "32 facilities manager interviews (March-August 2025). Key findings: (1) COSHH compliance is major pain point. (2) Staff prefer non-chemical products. (3) Concentrate appeals for storage/waste reduction. (4) Price must match chemicals. (5) Performance is non-negotiable. (6) Sustainability is boardroom priority.",
          lettersOfIntent: "15 pilot LOIs signed: 6 office facilities (£28K combined annual), 4 hotels (£22K), 3 care homes (£10K), 2 universities (£5K). Total: £65K annual upon successful pilots. Contract manufacturer LOI: Capacity for 50,000 units/year, scalable to 200,000.",
          willingnessToPay: "Pricing: £8/litre concentrate (makes 80 litres ready-to-use). Per-use cost: £0.10 vs £0.15 chemical products (30% cheaper). Customer ROI: £8K COSHH savings + 30% product savings = compelling value. Pilot feedback: 14/15 customers confirmed purchase intent.",
          marketSize: "TAM: UK commercial cleaning products £2.1B. SAM: B2B eco-cleaning products £320M (growing 18%/year). SOM: Year 1: £150K (0.05% SAM). Year 3: £1.8M (0.5% SAM). Realistic given pilot-to-contract conversion model.",
          regulatoryRequirements: "EU Ecolabel: 6 months, £8K (application submitted). REACH: Ingredients registered. CLP Regulation: Labelling compliant. ISO 14001: £12K, 6 months (Year 2). Organic certification (Soil Association): £3K if sourcing organic enzymes. No sector-specific cleaning regulations.",
          complianceTimeline: "Month 1-6: EU Ecolabel certification. Month 6-9: UK Ecolabel application. Month 12: ISO 14001 preparation. Month 18: ISO 14001 certification. Ongoing: Batch testing, ingredient compliance. Year 2: Carbon Trust certification consideration.",
          complianceBudget: "28000",
          jobCreation: "14",
          hiringPlan: "Year 1: Founder + part-time production coordinator. Year 2: Sales Manager (£45K + commission), Production Lead (£38K), Customer Service (£28K). Year 3: 2 Sales Reps (£70K), Marketing (£35K), Operations (£40K), Quality (£35K), Admin (£25K). Total: 14 by Year 3.",
          specificRegions: "Year 1: North West England (Manchester base, pilot customers). Year 2: London, Birmingham, Leeds. Year 3: National distribution. Focus: Office buildings, hotels, care homes (high volume, sustainability priorities).",
          expansion: "Products: Year 1: Multi-surface concentrate. Year 2: Add floor care, laundry, dishwash. Year 3: Full commercial range (8 products). Channels: Direct → Distributors → Facilities management companies. Vertical: Commercial → Industrial → Healthcare.",
          internationalPlan: "Year 4: Ireland (EU access, similar market). Year 5: Benelux, Nordics (strong sustainability markets). Strategy: Export initially, local production partnerships for scale. EU Ecolabel provides regulatory advantage.",
          vision: "5-year vision: UK's leading eco-cleaning brand for commercial customers. £10M revenue, 35 employees. Known for: Performance + sustainability, COSHH-free workplace. Exit potential: Acquisition by major FMCG (Unilever, Henkel) or private equity growth.",
          targetEndorser: "Primary: Innovator International (manufacturing expertise, sustainability focus). Alternative: Envestors (if emphasizing biotech innovation). Rationale: Innovator International understands manufacturing, has sustainable products portfolio, mentor network includes FMCG executives.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Product demo, pilot agreements. (2) Month 6: EU Ecolabel progress, pilot results. (3) Month 12: Year 1 review, first repeat orders. (4) Month 18: Scale-up plans, new products. (5) Month 24: Team growth, distributor partnerships. (6) Month 30: International expansion planning.",
          experience: "Uniquely qualified: 5 years in cleaning product R&D (Unilever, Reckitt). Developed EU Ecolabel products generating £5M revenue. Deep expertise: enzyme formulation, product development, regulatory compliance. Industry connections: facilities managers, distributors, manufacturers. Proven ability to take products from lab to market.",
          revenue: "B2B concentrate pricing: £8/litre (makes 80L ready-to-use). Margins: 55% gross. Payment: 30-day terms. Volume discounts: 10% at 100+ litres, 20% at 500+. Annual contracts: 5% discount for commitment. Target: Year 1 £150K, Year 3 £1.8M.",
        },
      ],
      creative: [
        { // StoryStream - Content Platform - COMPREHENSIVE
          businessName: "StoryStream Media",
          industry: "Media / Content Creation / Creator Economy",
          problem: "UK content creators lose 30-50% revenue to platforms (YouTube, TikTok). Monetisation tools are fragmented, analytics are basic, and audience ownership is limited.",
          innovationStage: "mvp-complete",
          productStatus: "Creator monetisation platform with 450 active creators. £85K monthly transaction volume. Average creator earns 40% more than on YouTube. 15% platform fee vs 45% YouTube.",
          existingCustomers: "450 active creators across categories: 180 lifestyle, 120 education, 90 gaming, 60 business. Top creators: @FinanceWithSam (45K subscribers, £8K/month), @CookingWithAisha (32K, £5K/month). Creator testimonials available.",
          tractionEvidence: "£85K monthly transaction volume (GMV). 450 creators, 28K paying subscribers across platform. Average creator revenue: £680/month (+40% vs YouTube). Creator retention: 89%. Platform commission: £12.75K/month revenue.",
          uniqueness: "Creator benefits: (1) Keep 85% of revenue (vs 55% YouTube). (2) Own your audience (email, SMS access). (3) Unified analytics across platforms. (4) Direct sponsorship marketplace.",
          techStack: "Platform: React, Node.js, PostgreSQL. Payments: Stripe Connect. Video: Mux streaming. Analytics: Custom dashboard. Email: SendGrid integration. Mobile: React Native app.",
          dataArchitecture: "Creator flow: Content upload → Video processing (Mux) → Paywall configuration → Subscriber management → Payment split (Stripe Connect). Analytics: Views, engagement, revenue, subscriber behaviour. Integrations: YouTube/TikTok analytics import.",
          aiMethodology: "Not applicable - SaaS platform for creators. Our innovation is in the business model (creator-first revenue share) and integrated tools, not AI technology. We use standard web development practices with payment infrastructure focus.",
          complianceDesign: "GDPR compliant (data processing, consent management). PCI DSS via Stripe. UK GDPR representative appointed. Cookies policy. Age-gating for adult content creators. Content moderation policy.",
          patentStatus: "No patents filed - business model innovation rather than technology. Trademark: 'StoryStream' registered (UK00003890123). Trade secrets: Sponsorship matching algorithm documented confidentially.",
          founderEducation: "MA Digital Media, Goldsmiths University, 2021. BA Media Studies, University of Westminster, 2018 (First Class). Google Analytics certified. HubSpot Content Marketing certified.",
          founderWorkHistory: "Creator Partnerships Manager, Patreon UK (2021-2024): Managed 500+ creator accounts, £2M+ revenue portfolio. Content Manager, Vice UK (2019-2021): Audience growth strategy. Freelance Content Creator (2016-2019): 50K YouTube subscribers.",
          founderAchievements: "Grew Patreon UK creator portfolio to £2M+ ARR. Personally built YouTube channel to 50K subscribers. Led Vice UK TikTok launch (1M followers in 6 months). Speaker at VidCon London 2023. Mentored 30+ creators.",
          relevantProjects: "Patreon: UK creator growth strategy (£2M ARR portfolio). Vice: Social media strategy, TikTok launch. Personal: YouTube channel (50K subs, £3K/month peak). Side project: Creator newsletter (8K subscribers).",
          funding: "75000",
          fundingSources: "£35,000 personal savings. £25,000 family investment. £15,000 Creative Industries Fund grant (reference: CIF-2024-1234). Total: £75,000 for platform development and marketing.",
          monthlyProjections: "Year 1: £12.75K/month commission revenue, £9K costs. Year 2: £35K/month revenue (1,200 creators), £25K costs. Year 3: £85K/month revenue (3,000 creators), £55K costs. Break-even Month 6. Year 3: £1M revenue.",
          customerAcquisitionCost: "45",
          lifetimeValue: "1080",
          paybackPeriod: "1",
          detailedCosts: "Platform hosting/infrastructure: £3K/month. Video processing (Mux): £2K/month. Payment processing: 0.5% of GMV. Marketing: £2K/month. Staff (Year 2): £60K/year. Customer support: £1K/month. Total Year 1: £108K.",
          competitors: "1. Patreon (established, 5-12% fees, limited video). 2. Ko-fi (hobbyist focus, 0% fees but limited features). 3. YouTube Memberships (45% platform cut). 4. Gumroad (digital products, not subscription). 5. Memberful (WordPress-focused). Our advantage: Creator-first economics, integrated video, UK focus.",
          competitiveDifferentiation: "Creator economics: 85% revenue share (vs 55% YouTube, 88-95% Patreon). Integrated video streaming (vs Patreon's links-only). UK-focused support and community. Sponsorship marketplace (unique). Analytics dashboard aggregating all platforms.",
          customerInterviews: "45 creator interviews (10K-500K follower range). Findings: (1) Revenue share is pain point. (2) Audience ownership critical. (3) Want one dashboard for all platforms. (4) Sponsorships hard to find as mid-tier creator. (5) Will switch for 10%+ revenue increase.",
          lettersOfIntent: "Creator commitments: 15 creators (combined 800K audience) agreed to migrate upon launch features. Agency partnership: Talent management agency (50 creators) in discussion. Brand partnerships: 3 sponsors interested in marketplace.",
          willingnessToPay: "Creator pricing: 15% platform fee (accepted by 89% in survey). Subscriber pricing: £3-15/month (creator-set). Additional revenue: Sponsorship marketplace 20% fee. Premium analytics: £15/month optional. Conversion: 6% subscriber rate from free audience.",
          marketSize: "TAM: Global creator economy £80B. SAM: UK creator monetisation platforms £400M. SOM: Year 1: £150K (450 creators × £27/month average commission). Year 3: £1M (3,000 creators). 0.25% SAM penetration Year 3.",
          regulatoryRequirements: "GDPR: Data processing agreements, privacy policy. PCI DSS: Via Stripe (Level 1). Digital Services Act: Content moderation. Age verification: For adult content creators. ICO registration: Completed.",
          complianceTimeline: "Month 1: ICO registration complete. Month 3: GDPR audit and documentation. Month 6: Content moderation policy and tools. Month 12: ISO 27001 assessment (enterprise clients). Ongoing: Privacy policy updates.",
          complianceBudget: "12000",
          jobCreation: "12",
          hiringPlan: "Year 1: Founder + part-time support (contractors). Year 2: Full-stack Developer (£55K), Creator Success Manager (£35K), Marketing (£40K). Year 3: CTO (£70K), 2 developers, Sales (£45K), Support (2 × £28K). Total: 12 by Year 3.",
          specificRegions: "Year 1: UK creators (English-speaking, regulatory familiarity). Year 2: Ireland, Australia (similar markets). Year 3: US expansion (largest creator market). Focus: London, Manchester, Bristol (creator hubs).",
          expansion: "Products: Year 1: Subscriptions, tipping. Year 2: Courses, digital products, sponsorship marketplace. Year 3: Live events ticketing, merchandise. Verticals: Lifestyle → Education → Gaming → Business creators.",
          internationalPlan: "Year 3-4: US expansion (biggest creator market, 10x opportunity). Year 5: EU (localized for Germany, France). Strategy: Remote team, local payment methods. Focus: UK profitability and product-market fit before US.",
          vision: "5-year vision: Leading creator monetisation platform for mid-tier creators. 25,000 creators, £15M GMV, £2M revenue, 30 employees. Known for: Creator-first economics, integrated tools, community. Exit: Acquisition by social media platform or creator tools company.",
          targetEndorser: "Primary: Envestors (digital platform, creator economy). Alternative: Innovator International. Rationale: Envestors has strong digital platform portfolio, understands SaaS/marketplace businesses, connections to UK tech ecosystem.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, creator traction metrics. (2) Month 6: Revenue growth, creator testimonials. (3) Month 12: Year 1 review, product roadmap. (4) Month 18: Team growth, Series A preparation. (5) Month 24: US expansion planning. (6) Month 30: Growth metrics, exit options.",
          experience: "Uniquely qualified: 3 years at Patreon managing £2M+ creator portfolio. Personal creator experience (50K YouTube subscribers). Deep understanding of creator pain points. Industry connections: creator agencies, brands, platforms. Proven ability to grow creator businesses.",
          revenue: "Platform commission: 15% of GMV (creator subscriptions/tips). Sponsorship marketplace: 20% of brand deals. Premium analytics: £15/month. Enterprise/agency: Custom pricing. Year 1: £150K revenue. Year 3: £1M. Gross margin: 75%.",
        },
        { // ArtConnect - Creative Marketplace - COMPREHENSIVE
          businessName: "ArtConnect Gallery",
          industry: "Art / Creative Marketplace / E-commerce",
          problem: "Emerging UK artists struggle to reach buyers - galleries take 50% commission (£1.2B annually), rejection rates exceed 95%, and artists need physical presence. Online platforms lack curation (Etsy has 60M listings making discovery impossible). Art shipping is complex and expensive, deterring 40% of potential buyers.",
          innovationStage: "mvp-complete",
          productStatus: "Curated online art marketplace with 280 UK artists, 1,200 artworks listed. £145K GMV in first year. Average order value £380. 25% commission (vs 50% galleries). AR 'view in room' feature launched Q3. Artist satisfaction: 4.8/5. Buyer repeat rate: 28%.",
          existingCustomers: "Artists: 280 active (35% acceptance rate from 800 applications). Categories: 120 painters, 60 photographers, 50 sculptors, 30 printmakers, 20 mixed media. Featured artists: Sarah Chen (contemporary, £18K sales), Marcus Obi (portraiture, £12K sales). Buyer base: 3,400 registered, 380 purchases completed.",
          tractionEvidence: "£145K GMV Year 1. 380 completed sales. Average order: £380. Artist commission saved: £72K vs gallery rates. AR feature: 3x conversion rate improvement. Press coverage: Frieze Magazine, Artnet News. Artist testimonials: 45+ published. Buyer NPS: 72.",
          uniqueness: "Artist benefits: (1) 25% commission saves artists £72K annually vs galleries. (2) Curated quality (35% acceptance, rigorous jury). (3) End-to-end shipping included (no artist hassle). (4) AR 'view in room' increases conversion 3x. (5) Artist analytics dashboard. (6) Collector matching algorithm.",
          techStack: "E-commerce: Shopify Plus, custom React theme. AR: 8thWall WebAR (no app needed). Shipping: Cadogan Tate API, Pack & Send. Payments: Stripe (cards, Apple Pay), PayPal, Klarna (instalments). Analytics: Custom artist dashboard. CDN: Cloudflare for image optimization.",
          dataArchitecture: "Artist flow: Application → Jury review → Profile creation → Artwork upload → Pricing → Live listing. Buyer flow: Browse/search → AR view → Cart → Checkout → Shipping → Delivery confirmation. Data: Artwork metadata, provenance, edition tracking, collector history.",
          aiMethodology: "Not applicable - curated art marketplace. Our innovation is in the curation process (human jury) and AR technology integration, not AI. We use WebAR for visualization and standard e-commerce technology with art-specific features.",
          complianceDesign: "Artist Resale Right (ARR): Automatic calculation and payment. VAT: HMRC registered, artwork-specific rates. Consumer Rights Act: 14-day returns for online purchases. Insurance: Transit insurance included. Authenticity: Certificate of authenticity required for all works.",
          patentStatus: "No patents filed - platform innovation. Trademark: 'ArtConnect Gallery' registered (UK00003898456). Trade secrets: Curation criteria, jury scoring system documented. Design registration: Website interface registered.",
          founderEducation: "MA Curating Contemporary Art, Royal College of Art, 2019. BA Fine Art, Goldsmiths University, 2016 (First Class). Google UX Design certification. Sotheby's Art Business certificate.",
          founderWorkHistory: "Gallery Manager, White Cube (2019-2024): Managed artist relationships, £3M annual sales. Assistant Curator, Saatchi Gallery (2017-2019): Exhibition programming, emerging artist scouting. Artist studio assistant (2015-2017): Gallery representation, sales.",
          founderAchievements: "White Cube: Managed £3M annual artist sales, launched 12 emerging artists. Saatchi: Curated 3 group exhibitions (15K visitors combined). Published: 'Digital Galleries: The Future of Art Sales' (Art Monthly, 2023). Founded artist collective (25 members, 8 exhibitions).",
          relevantProjects: "White Cube: Digital sales platform launch (£400K first year). Saatchi: Online exhibition catalogue (50K views). Artist collective: Monthly exhibitions, group sales. RCA thesis: 'Democratizing Art Access Through Technology'. Side project: Instagram art curation (45K followers).",
          funding: "95000",
          fundingSources: "£50,000 personal savings. £30,000 family investment (equity). £15,000 Arts Council England Developing Your Creative Practice grant (reference: DYCP-2024-0234). Total: £95,000 for platform development and marketing.",
          monthlyProjections: "Year 1: £12K/month GMV, £3K commission revenue, £4K costs. Year 2: £35K/month GMV, £8.75K commission, £6K costs. Year 3: £80K/month GMV, £20K commission, £12K costs. Break-even Month 8. Year 3: £960K GMV, £240K commission revenue.",
          customerAcquisitionCost: "22",
          lifetimeValue: "285",
          paybackPeriod: "1",
          detailedCosts: "Platform (Shopify Plus): £2K/month. AR licensing (8thWall): £400/month. Marketing: £1.5K/month. Shipping subsidies: Variable (absorbed in commission). Staff (Year 2): £65K/year. Events: £6K/year. Total Year 1: £48K.",
          competitors: "1. Saatchi Art (global, high volume, less curated). 2. Artfinder (established, 15-40% commission). 3. Rise Art (rental focus). 4. Artsy (gallery partnerships, premium). 5. Etsy Art (mass market, no curation). Our advantage: Curated quality, AR technology, UK emerging artist focus, lower commission.",
          competitiveDifferentiation: "25% commission (vs 50% galleries, 40% Artfinder). AR 'view in room' (3x conversion - competitors lack this). Rigorous curation (35% acceptance vs open platforms). End-to-end shipping (no artist hassle). UK emerging artist focus (underserved by global platforms).",
          customerInterviews: "55 interviews (30 artists, 25 collectors). Artist findings: (1) Commission rate is critical. (2) Curation validates quality. (3) Shipping/logistics major barrier. (4) Want buyer analytics. Collector findings: (1) Trust concerns with online art. (2) Size/colour uncertainty. (3) AR would increase confidence. (4) Payment flexibility wanted.",
          lettersOfIntent: "Artist commitments: 80 additional artists (£200K potential inventory) pending platform capacity. Gallery partnerships: 3 galleries interested in representing artists through platform. Corporate art: 2 office fit-out companies (£15K annual potential). Press partnerships: Frieze, Artnet News editorial coverage.",
          willingnessToPay: "Artist commission: 25% (survey: 92% acceptance). Buyer pricing: £100-2,500 sweet spot. Payment options: Klarna instalments increase conversion 25%. Premium services: Featured listing £50/month (15% uptake), express curation £75.",
          marketSize: "TAM: UK art market £11.3B. SAM: Emerging artist online sales £850M. SOM: Year 1: £145K (0.017% SAM). Year 3: £960K (0.11% SAM). Conservative given platform capacity and curation quality constraints.",
          regulatoryRequirements: "Artist Resale Right (ARR): EU directive implementation, 4% royalty on resales. VAT: 20% standard, 5% on certain artworks. Consumer Rights Act: Distance selling regulations, returns policy. Anti-Money Laundering: Due diligence on high-value (£10K+) transactions.",
          complianceTimeline: "Month 1: VAT registration (completed). Month 3: AML policy implementation. Month 6: ARR automated tracking system. Month 12: ISO 27001 assessment (enterprise clients). Ongoing: Consumer rights compliance, privacy policy updates.",
          complianceBudget: "15000",
          jobCreation: "10",
          hiringPlan: "Year 1: Founder + part-time curator. Year 2: Full-time Curator (£35K), Marketing Manager (£40K), Developer (£50K). Year 3: Artist Relations (£32K), Customer Service (£28K), Sales (£38K). Total: 10 by Year 3.",
          specificRegions: "Year 1: London (art market centre), Bristol (creative hub). Year 2: Manchester, Edinburgh, Glasgow. Year 3: National UK coverage. Artist recruitment: Art school partnerships (RCA, Goldsmiths, Glasgow School of Art).",
          expansion: "Products: Year 1: Original artworks. Year 2: Limited edition prints, art consulting for offices. Year 3: Private commissions, art rental scheme. Channels: Direct → Gallery partnerships → Corporate art services.",
          internationalPlan: "Year 4: EU expansion (Germany, France - strong art markets). Year 5: US (New York, LA - major collector bases). Strategy: Artist recruitment locally, cross-border shipping partnerships. EU focus first for regulatory familiarity.",
          vision: "5-year vision: UK's leading platform for emerging artists. £5M GMV, £1.25M commission revenue, 2,000 artists, 25,000 registered collectors, 15 employees. Known for: Quality curation, artist-first economics, AR innovation. Exit: Acquisition by Artsy, Sotheby's digital, or tech company.",
          targetEndorser: "Primary: Envestors (digital platform, creative industries). Alternative: Innovator International. Rationale: Envestors has creative tech portfolio, understands marketplace businesses, connections to arts and culture sector.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, artist/buyer metrics. (2) Month 6: GMV growth, AR feature traction. (3) Month 12: Year 1 review, press coverage. (4) Month 18: Team growth, gallery partnerships. (5) Month 24: Corporate art programme. (6) Month 30: International expansion.",
          experience: "Uniquely qualified: 5 years at White Cube/Saatchi (£3M sales managed). Deep understanding of artist needs, collector behaviour, gallery economics. Industry connections: artists, galleries, press. Founded artist collective with 25 members. Technical: UX design certification, e-commerce development.",
          revenue: "Platform commission: 25% of artwork sale price. Premium listings: £50/month featured placement. Corporate services: Art consulting 15% of project value. Shipping markup: 10% (built into price). Year 1: £36K commission. Year 3: £240K commission. Gross margin: 85%.",
        },
        { // MediaFlow - Distribution Innovation - COMPREHENSIVE
          businessName: "MediaFlow Distribution",
          industry: "Media / Content Distribution / Film & TV",
          problem: "Independent UK filmmakers face £50K+ distribution costs and 18-month delays to reach audiences. Major distributors reject 95% of indie content. Digital platforms (Amazon, iTunes) take 30-50% revenue and provide no audience data. 2,500 UK indie films annually struggle to find audiences beyond festival circuit.",
          innovationStage: "pre-mvp",
          productStatus: "Building direct-to-audience distribution platform for indie films. Technical MVP complete: video hosting, payments, filmmaker dashboard. Partnerships with 3 film festivals (London Short Film Festival, Sheffield DocFest, Edinburgh Film Festival) for content pipeline. 45 filmmaker applications received. Advisory board: 2 distributors, 1 film festival director.",
          existingCustomers: "Pre-launch pipeline: 45 filmmaker applications (28 shorts, 17 features). Festival partnerships: 3 major UK festivals (combined 1,200 films/year screened). Letters of intent: 12 filmmakers committed to launch catalogue. Advisory filmmakers: Award-winning directors providing feedback on platform.",
          tractionEvidence: "Platform MVP: Video streaming functional, payment integration complete. 45 filmmaker applications (pipeline £180K potential revenue). Festival partnerships: Access to 1,200 films annually. Advisory board: Distribution executives from Curzon, Altitude. Technical: 4K streaming tested, DRM implemented.",
          uniqueness: "Distribution model: (1) Self-service platform, films live in 48 hours (vs 18 months traditional). (2) 70% revenue share (vs 30% traditional distributors). (3) Built-in marketing tools (email, social). (4) Full audience data ownership. (5) Festival-to-platform pathway. (6) No upfront costs.",
          techStack: "Platform: Next.js, TypeScript, PostgreSQL. Video: Cloudflare Stream (global CDN, adaptive bitrate). Payments: Stripe Connect (split payments). DRM: BuyDRM integration (studio-grade protection). Email: SendGrid. Analytics: Custom dashboard. Mobile: Progressive Web App.",
          dataArchitecture: "Filmmaker flow: Application → Content review → Upload → Metadata → Pricing → Live listing → Earnings dashboard. Viewer flow: Browse → Purchase/rent → Stream → Filmmaker data. Analytics: Views, completion rates, geographic data, revenue, marketing attribution all provided to filmmaker.",
          aiMethodology: "Not applicable - digital distribution platform. Our innovation is in the business model (filmmaker-first economics) and direct-to-audience distribution, not AI. We use standard video streaming technology with focus on filmmaker empowerment.",
          complianceDesign: "GDPR: Viewer data protection, consent management. BBFC: Age ratings integration. Copyright: Chain of title verification required. Licensing: Territory rights management. Accessibility: Subtitles/captions required. VAT: Digital services (MOSS compliance).",
          patentStatus: "No patents filed - business model innovation. Trademark: 'MediaFlow' application pending (UK00003920456). Trade secrets: Festival partnership agreements, filmmaker onboarding process documented. Copyright: Platform code and brand protected.",
          founderEducation: "MA Film Distribution, London Film School, 2020. BA Film Production, University of Bristol, 2017 (First Class). BFI Film Academy graduate. Distribution Masterclass (Venice Film Festival).",
          founderWorkHistory: "Distribution Manager, Dogwoof Films (2020-2024): Managed 25+ documentary releases, £4M theatrical/VOD revenue. Acquisitions Coordinator, BFI Distribution (2018-2020): Festival scouting, rights negotiation. Production Assistant, BBC Films (2017-2018): Feature film production.",
          founderAchievements: "Dogwoof: Managed 25+ film releases generating £4M revenue. Led Oscar-shortlisted documentary distribution. BFI: Identified 3 films that won major festival awards. Built filmmaker network of 150+ contacts. Speaker at Sheffield DocFest Industry Panel 2023.",
          relevantProjects: "Dogwoof: Oscar-shortlisted documentary campaign (£1.2M box office). BFI: Digital distribution strategy development. Personal: Distributed own short film (35 festivals, 15K views online). London Film School thesis: 'Direct Distribution Models for Independent Film'.",
          funding: "120000",
          fundingSources: "£45,000 personal savings. £40,000 family investment (convertible note). £35,000 BFI Film Export Fund (application pending, strong signal from initial meeting). Total: £120,000 for platform completion and launch marketing.",
          monthlyProjections: "Year 1: Month 1-6: £0 revenue (beta). Month 7-12: £8K/month (50 films, 2K transactions). Year 1: £48K revenue, £85K costs. Year 2: £35K/month (200 films). Year 3: £90K/month (500 films). Break-even Month 20. Year 3: £1.08M revenue.",
          customerAcquisitionCost: "180",
          lifetimeValue: "2400",
          paybackPeriod: "2",
          detailedCosts: "Platform hosting/CDN: £3K/month. Video transcoding: £1.5K/month. Development: £20K (contractor, MVP completion). Marketing: £3K/month. Festival presence: £8K/year. Staff (Year 2): £90K/year. Legal (rights templates): £10K. Total Year 1: £85K.",
          competitors: "1. Vimeo On Demand (50% cut, limited marketing). 2. Amazon Prime Video Direct (55% cut, algorithm-driven). 3. MUBI (curated, exclusive deals). 4. Curzon Home Cinema (traditional distributor). 5. BFI Player (heritage focus). Our advantage: Filmmaker economics, data ownership, festival partnerships.",
          competitiveDifferentiation: "70% filmmaker share (vs 30-50% competitors). 48-hour to live (vs 18 months traditional). Full audience data (competitors provide minimal). Festival pathway (unique partnership model). No upfront costs (democratizes access). UK indie focus (underserved by global platforms).",
          customerInterviews: "40 filmmaker interviews (March-September 2025). Findings: (1) Revenue share is critical (70%+ expected). (2) Data ownership highly valued. (3) Speed to market matters for momentum. (4) Marketing support needed. (5) Festival credibility helps trust. (6) Would switch from Amazon/Vimeo for better economics.",
          lettersOfIntent: "12 filmmakers committed: 8 features, 4 documentaries (combined 45 festival selections). Festival partnerships: 3 festivals will promote platform to selected filmmakers. Distribution advisors: Curzon, Altitude executives on advisory board. BFI support letter for fund applications.",
          willingnessToPay: "Platform takes 30% of transactions (filmmaker keeps 70%). Viewer pricing: £3-8 rental, £8-15 purchase (filmmaker-set). Premium services: Featured placement £100/month, marketing campaign support £500. Survey: 85% of filmmakers prefer 70/30 split over traditional 30/70.",
          marketSize: "TAM: UK film distribution £1.8B. SAM: Independent film digital distribution £180M. SOM: Year 1: £48K (0.03% SAM). Year 3: £1.08M (0.6% SAM). Conservative given platform capacity and content curation quality.",
          regulatoryRequirements: "BBFC age ratings: Required for commercial distribution (£75-1,000 per film). Copyright: Chain of title verification. GDPR: Viewer data protection. VAT: Digital services 20%. Accessibility: Subtitles for deaf/hard of hearing. Anti-piracy: DRM implementation.",
          complianceTimeline: "Month 1: GDPR policies finalized. Month 3: BBFC integration for ratings. Month 6: Accessibility standards (subtitles template). Month 12: ISO 27001 assessment. Ongoing: Rights verification for each film.",
          complianceBudget: "18000",
          jobCreation: "12",
          hiringPlan: "Year 1: Founder + part-time developer (contractor). Year 2: Full-stack Developer (£55K), Content Manager (£38K), Marketing (£40K). Year 3: CTO (£65K), Filmmaker Relations (£35K), Support (£28K), Operations (£32K). Total: 12 by Year 3.",
          specificRegions: "Year 1: UK (domestic rights, festival partnerships). Year 2: Ireland, Commonwealth (similar rights structures). Year 3: EU (expanded licensing). Focus: London (industry hub), regional film hubs (Bristol, Sheffield, Glasgow).",
          expansion: "Products: Year 1: Individual film sales/rental. Year 2: Subscription tier (curated library), branded channels. Year 3: TV series, podcasts, filmmaker courses. Channels: D2C → Festival partnerships → Industry sales.",
          internationalPlan: "Year 3: EU (starting Ireland, Benelux). Year 4: North America (largest indie film market). Strategy: Territory-by-territory rights clearance, local festival partnerships. Focus: UK market leadership before expansion.",
          vision: "5-year vision: UK's leading direct distribution platform for independent film. 2,000 films, £5M transactions, £1.5M platform revenue, 50K active viewers, 15 employees. Known for: Filmmaker-first economics, discovery, community. Exit: Acquisition by streaming platform or media company.",
          targetEndorser: "Primary: Envestors (digital platform, creative industries). Alternative: Innovator International (media expertise). Rationale: Envestors has strong creative/media portfolio, understands marketplace models, connections to film industry.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, festival partnerships. (2) Month 6: Beta launch, first transactions. (3) Month 12: Year 1 review, filmmaker testimonials. (4) Month 18: Subscription launch, funding round. (5) Month 24: EU expansion planning. (6) Month 30: Growth metrics, strategic options.",
          experience: "Uniquely qualified: 6 years film distribution (Dogwoof, BFI). Managed £4M in releases. Deep understanding of filmmaker needs, distribution economics, festival ecosystem. Industry connections: distributors, festivals, filmmakers. Proven track record releasing Oscar-shortlisted content.",
          revenue: "Platform commission: 30% of transaction value. Viewer pricing: Rental £3-8, purchase £8-15. Premium: Featured placement £100/month, marketing campaigns £500. B2B: Festival screening partnerships, industry events. Year 1: £48K. Year 3: £1.08M. Gross margin: 80%.",
        },
      ],
      services: [
        { // ConsultX - Advisory Platform - COMPREHENSIVE
          businessName: "ConsultX Advisory",
          industry: "Professional Services / Consulting / Expert Marketplace",
          problem: "UK SMEs need strategic advice but can't afford £500/hour consultants. Freelance consultants struggle to find clients and lack professional infrastructure.",
          innovationStage: "mvp-complete",
          productStatus: "Expert marketplace connecting 120 vetted consultants with 340 SME clients. £420K platform revenue. Average project value £3,200. Client satisfaction 4.7/5.",
          existingCustomers: "340 SME clients across sectors: 85 retail/hospitality, 120 professional services, 80 manufacturing, 55 tech startups. Top clients: RegionalBank Ltd (5 projects, £18K), TechStartup Inc (3 projects, £12K). Testimonials available.",
          tractionEvidence: "£420K GMV in Year 1. 340 clients, 120 consultants. Average project: £3,200. Client satisfaction: 4.7/5. Consultant satisfaction: 4.6/5. Repeat client rate: 68%. Platform fee revenue: £63K (15% commission).",
          uniqueness: "Platform advantages: (1) Vetted experts only (15% acceptance rate). (2) Fixed-price projects (no hourly billing surprises). (3) Escrow payments protect both parties. (4) £150/hour average vs £500 traditional.",
          techStack: "Platform: React, Node.js, PostgreSQL. Payments: Stripe escrow. Video: Zoom API integration. Contracts: DocuSign integration. Matching: Custom algorithm based on skills, industry, availability.",
          dataArchitecture: "Consultant flow: Application → Vetting (portfolio, interview) → Profile creation → Project matching. Client flow: Brief submission → Consultant recommendations → Selection → Escrow payment → Project delivery → Review. Matching: Skills, industry, availability, ratings.",
          aiMethodology: "Not applicable - marketplace/platform business. Our innovation is in the vetting process and fixed-price model, not AI technology. We use standard web development with focus on trust and quality assurance systems.",
          complianceDesign: "GDPR compliant (data processing for consultants and clients). ICO registered. Platform terms of service with liability limitations. Professional indemnity recommendation for consultants. Escrow payment protection. Dispute resolution process.",
          patentStatus: "No patents filed - business model innovation. Trademark: 'ConsultX' registered (UK00003901234). Trade secrets: Vetting criteria and matching algorithm documented confidentially.",
          founderEducation: "MBA, London Business School, 2020. BA Economics, University of Oxford, 2016 (First Class). CMI Level 7 Strategic Management. Project Management Professional (PMP).",
          founderWorkHistory: "Strategy Consultant, McKinsey & Company (2020-2024): Led 15+ projects for FTSE 250 clients, £2M+ in fees. Business Analyst, Deloitte (2016-2018): Financial services consulting. Founded student consultancy at Oxford (£50K revenue).",
          founderAchievements: "Led McKinsey projects generating £2M+ in fees. Promoted to Engagement Manager in 3 years (top 10%). Founded Oxford student consultancy (£50K revenue). Speaker at Management Consulting Association events. Mentored 12 junior consultants.",
          relevantProjects: "McKinsey: Digital transformation for FTSE 250 retailer (£800K project). Deloitte: Bank operational efficiency review. Oxford: Built student consultancy matching 50 students with 30 clients. Personal: Advised 10 SMEs pro-bono during COVID.",
          funding: "65000",
          fundingSources: "£40,000 personal savings. £15,000 family investment. £10,000 London Business School Entrepreneurship Grant (reference: LBS-2024-456). Total: £65,000 for platform development and initial marketing.",
          monthlyProjections: "Year 1: £5.25K/month platform fees, £3.5K costs. Year 2: £15K/month (800 clients, 250 consultants), £10K costs. Year 3: £40K/month (2,000 clients), £25K costs. Break-even Month 4. Year 3: £480K revenue.",
          customerAcquisitionCost: "85",
          lifetimeValue: "960",
          paybackPeriod: "1",
          detailedCosts: "Platform hosting: £1K/month. Stripe/payment fees: 1.5% of GMV. Marketing: £1.5K/month. Legal/contracts: £5K/year. Staff (Year 2): £80K/year. Customer support: Part-time contractor. Total Year 1: £42K.",
          competitors: "1. Consultport (global, enterprise focus). 2. Expert360 (Australian, established). 3. Comatch (German, premium pricing). 4. Catalant (US, large corporations). 5. LinkedIn ProFinder (broad, not curated). Our advantage: UK SME focus, fixed pricing, heavy vetting.",
          competitiveDifferentiation: "UK SME focus (vs enterprise-focused competitors). Fixed-price projects (vs hourly - eliminates budget uncertainty). 15% acceptance rate vetting (vs open platforms). Escrow payments (unique protection). Average £150/hour (vs £500+ traditional consulting).",
          customerInterviews: "40 SME owner interviews. Findings: (1) Need strategic advice but can't afford Big 4. (2) Hourly billing creates budget anxiety. (3) Quality concerns with freelance platforms. (4) Want UK-based consultants who understand local market. (5) Fixed price = easier budgeting.",
          lettersOfIntent: "Corporate partnerships: 2 accelerators (access to 80 startups). Consultant partnerships: 25 ex-McKinsey/BCG consultants committed. Client LOIs: 3 SME associations (1,200 member companies) for promotion.",
          willingnessToPay: "Client pricing: 15% platform fee on project value (vs 20-30% agencies). Consultant: Free listing, 15% of earnings. Premium features: £49/month for priority matching. Average project: £3,200 (range £500-15,000).",
          marketSize: "TAM: UK management consulting £12B. SAM: SME consulting £1.8B. SOM: Year 1: £420K GMV, £63K revenue. Year 3: £3.2M GMV, £480K revenue. 0.03% SAM penetration Year 3 (conservative).",
          regulatoryRequirements: "GDPR: Data processing for consultants/clients. ICO registration: Completed. Platform liability: Terms of service, limitation of liability. No professional licensing required for platform (consultants self-certify qualifications).",
          complianceTimeline: "Month 1: ICO registration (completed). Month 3: Legal review of terms/contracts. Month 6: GDPR audit. Month 12: Insurance review (platform liability). Ongoing: Consultant vetting process documentation.",
          complianceBudget: "8000",
          jobCreation: "10",
          hiringPlan: "Year 1: Founder + part-time contractor (vetting). Year 2: Operations Manager (£40K), Developer (£55K), Sales/Marketing (£38K). Year 3: Customer Success (2 × £32K), Quality Lead (£42K). Total: 10 by Year 3.",
          specificRegions: "Year 1: London (highest SME density, consultant pool). Year 2: Manchester, Birmingham, Bristol. Year 3: National UK coverage. Consultant network: Initially London-based, remote delivery enables national.",
          expansion: "Verticals: Year 1: General business. Year 2: Specialist tracks (finance, operations, digital). Year 3: Industry-specific (hospitality, retail, professional services). Products: Add training, workshops, retainer packages.",
          internationalPlan: "Year 4: Ireland (English-speaking, similar market). Year 5: Western Europe (DE, FR - localized). Strategy: Focus UK profitability before expansion. Remote delivery model enables gradual international growth.",
          vision: "5-year vision: UK's leading SME consulting marketplace. £20M GMV, £3M platform revenue, 5,000 consultants, 15,000 clients, 25 employees. Known for: Quality, accessibility, SME champion. Exit: Acquisition by HR/consulting platform or private equity.",
          targetEndorser: "Primary: Innovator International (services expertise, marketplace understanding). Alternative: Envestors (if highlighting platform technology). Rationale: Innovator International understands professional services, has B2B platform portfolio.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, client/consultant traction. (2) Month 6: Revenue growth, quality metrics. (3) Month 12: Year 1 review, expansion plans. (4) Month 18: New verticals launch. (5) Month 24: Team growth, funding round. (6) Month 30: Exit planning, international.",
          experience: "Uniquely qualified: 4 years McKinsey (£2M+ in project fees). Built student consultancy (£50K revenue). Deep understanding of both consultant and client perspectives. Industry connections: Big 4 alumni network. Proven ability to match consultants with clients.",
          revenue: "Platform commission: 15% of project value (from both sides = 7.5% each). Premium listings: £49/month for priority matching. Enterprise: Custom pricing for large clients. Year 1: £63K revenue (15% of £420K GMV). Year 3: £480K (15% of £3.2M).",
        },
        { // TalentBridge - Recruitment Innovation - COMPREHENSIVE
          businessName: "TalentBridge",
          industry: "Recruitment / HR Tech / Staffing",
          problem: "UK hospitality and retail suffer 30% annual staff turnover (1.2M hires/year). Traditional recruitment agencies charge 15-20% fees (£3,000-5,000 per hire) and take 4-6 weeks to fill roles. Staff shortages cost hospitality £21B annually in lost revenue. 78% of hospitality businesses report hiring difficulties.",
          innovationStage: "mvp-complete",
          productStatus: "Rapid hiring platform for hospitality/retail with 85 employer clients. 2,400 placements in Year 1. Average time-to-hire: 5 days (vs 28 days industry average). Flat £150 fee per hire. Employer satisfaction: 4.6/5. 90-day placement retention: 87%.",
          existingCustomers: "85 employer clients: 35 restaurants/cafes (Dishoom franchise, Honest Burgers), 25 hotels (Ibis group, boutique hotels), 15 retail stores, 10 event venues. Key accounts: Wagamama franchisee (180 hires, £27K), Independent hotel group (95 hires, £14K). Candidate database: 12,000 registered workers.",
          tractionEvidence: "2,400 placements Year 1. Revenue: £360K (£150/hire). Employer retention: 78% use platform again. Candidate satisfaction: 4.4/5. Average placement: 5 days. Press: Caterer magazine, Retail Week. Awards: HR Tech Innovation shortlist. 90-day guarantee claims: 4% (industry 15%).",
          uniqueness: "Recruitment innovation: (1) Flat £150 fee saves 90% vs agencies. (2) 5-day placement vs 4 weeks (video-first process). (3) Built-in video interviews (no scheduling hassle). (4) 90-day free replacement guarantee. (5) Right-to-work verification included. (6) Skills-based matching algorithm.",
          techStack: "Platform: React, Node.js, PostgreSQL. Video: Twilio Video (asynchronous interviews). Matching: Custom algorithm (skills, location, availability). Background checks: Onfido API (right-to-work, ID verification). Communication: Twilio SMS, email automation. Analytics: Custom employer dashboard.",
          dataArchitecture: "Candidate flow: Registration → Skills profile → Video intro → Background check → Available pool. Employer flow: Post role → Matching candidates → Review videos → Interview → Hire → Onboarding docs. Tracking: Time-to-hire, placement success, retention rates.",
          aiMethodology: "Not applicable - recruitment platform with matching algorithm. Our innovation is in the flat-fee model and video-first hiring process, not AI. We use rule-based matching (skills, location, availability) with human review for quality.",
          complianceDesign: "GDPR: Candidate data protection, consent management, deletion rights. Right-to-work: UK Home Office requirements, digital verification. DBS: Disclosure requirements where applicable. Employment agencies: Conduct Regulations compliance. AWR: Agency worker regulations awareness.",
          patentStatus: "No patents filed - process innovation. Trademark: 'TalentBridge' registered (UK00003908567). Trade secrets: Matching algorithm, employer onboarding process documented. Copyright: Platform code protected.",
          founderEducation: "MSc Human Resource Management, LSE, 2020. BA Business Studies, University of Warwick, 2017 (First Class). CIPD Level 7. REC Certificate in Recruitment Practice.",
          founderWorkHistory: "Recruitment Manager, Hays UK (2020-2024): Built hospitality desk to £1.2M revenue, 50 clients. HR Coordinator, Whitbread (2018-2020): Internal recruitment for 200+ roles annually. Recruiter, Robert Half (2017-2018): Finance recruitment.",
          founderAchievements: "Hays: Built hospitality desk from zero to £1.2M (fastest growing in region). Placed 800+ candidates in 3 years. Whitbread: Reduced time-to-hire by 40% through process improvement. REC Award finalist 2023. Built network of 150+ hospitality HR contacts.",
          relevantProjects: "Hays: Hospitality recruitment desk (£1.2M, 50 clients). Whitbread: Recruitment process optimization (-40% time-to-hire). Personal: Hospitality job board side project (5K users, validated demand). LSE dissertation: 'Technology in Hospitality Recruitment'.",
          funding: "85000",
          fundingSources: "£50,000 personal savings (from Hays commission earnings). £25,000 family investment. £10,000 Start Up Loans (reference: SUL-2024-789012). Total: £85,000 for platform development and marketing.",
          monthlyProjections: "Year 1: £30K/month revenue (200 hires), £22K costs. Year 2: £80K/month (530 hires), £50K costs. Year 3: £180K/month (1,200 hires), £100K costs. Year 1: £360K revenue. Break-even Month 6. Year 3: £2.16M revenue, £1.2M costs.",
          customerAcquisitionCost: "180",
          lifetimeValue: "2700",
          paybackPeriod: "1",
          detailedCosts: "Platform hosting: £2K/month. Twilio (video/SMS): £3K/month. Onfido (verification): £5/check. Marketing: £8K/month. Sales team (Year 2): £120K/year. Customer success: £35K/year. Operations: £25K/year. Total Year 1: £264K.",
          competitors: "1. Reed (generalist, 15-20% fees). 2. Indeed (job board only, no matching). 3. Caterer.com (listing only, no vetting). 4. Placed (app-based, limited employer tools). 5. Traditional agencies (expensive, slow). Our advantage: Flat fee, speed, video-first, hospitality specialist.",
          competitiveDifferentiation: "Flat £150 fee (vs £3,000-5,000 agency). 5-day hire (vs 28 days average). Video-first (employer saves interview time). 90-day guarantee (competitors 30-60 days). Right-to-work included (£40 value). Hospitality specialist (not generalist platform).",
          customerInterviews: "45 interviews (30 hospitality managers, 15 retail managers). Findings: (1) Cost is major pain point (agencies too expensive). (2) Speed critical for seasonal/event hiring. (3) Video saves time vs in-person interviews. (4) Replacement guarantee essential. (5) Right-to-work verification valuable add-on.",
          lettersOfIntent: "Pipeline: 25 employers (estimated 1,500 hires/year value). Enterprise discussions: 2 hotel chains (combined 50 properties). Partnership: Hospitality association promotion to 2,000 members. Referral agreement: 3 recruitment agencies for overflow.",
          willingnessToPay: "Flat fee: £150/placement (accepted by 95% in trials). Volume pricing: £125/hire for 20+/month clients. Right-to-work add-on: £15 (40% uptake). Premium matching: £50/urgent hire (24-hour target). Survey: 88% prefer flat fee over percentage.",
          marketSize: "TAM: UK recruitment market £38B. SAM: Hospitality/retail recruitment £4.5B. SOM: Year 1: £360K (0.008% SAM). Year 3: £2.16M (0.05% SAM). Conservative given segment focus and geographic expansion timeline.",
          regulatoryRequirements: "Employment Agencies Conduct Regulations: Compliance required. GDPR: Candidate data protection. Right-to-work: Home Office requirements. DBS: Where applicable (hospitality less common). AWR: Agency worker regulations (for temp placements).",
          complianceTimeline: "Month 1: Employment agency registration (completed). Month 3: GDPR audit. Month 6: Right-to-work process audit. Month 12: ISO 27001 assessment. Ongoing: Regulatory updates monitoring.",
          complianceBudget: "12000",
          jobCreation: "18",
          hiringPlan: "Year 1: Founder + 2 sales/account managers (£70K). Year 2: Sales Manager (£50K), 4 recruiters (£30K each), Customer Success (£35K), Developer (£55K). Year 3: Regional Managers (3 × £45K), Operations (£40K), Marketing (£42K). Total: 18 by Year 3.",
          specificRegions: "Year 1: London (highest hospitality density). Year 2: Manchester, Birmingham, Edinburgh. Year 3: National coverage. Focus: Major cities with hospitality/retail concentrations.",
          expansion: "Verticals: Year 1: Hospitality front-of-house. Year 2: Add kitchen, housekeeping, retail. Year 3: Healthcare support, logistics. Products: Placements → Temp staffing → Payroll services → Training.",
          internationalPlan: "Year 4: Ireland (similar market, hospitality growth). Year 5: EU (starting Netherlands, Spain - tourism economies). Strategy: Local partnerships, regulatory compliance per market. Focus: UK market leadership first.",
          vision: "5-year vision: UK's leading hospitality recruitment platform. 15,000 placements/year, £4.5M revenue, 500 employer clients, 50,000 candidate database, 35 employees. Known for: Speed, value, quality. Exit: Acquisition by staffing group (Hays, Adecco) or HR tech company.",
          targetEndorser: "Primary: Envestors (HR tech, marketplace platform). Alternative: Innovator International (services expertise). Rationale: Envestors has HR tech portfolio, understands marketplace dynamics, connections to staffing industry.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, employer traction. (2) Month 6: Placement volume, retention metrics. (3) Month 12: Year 1 review, enterprise clients. (4) Month 18: New verticals launch. (5) Month 24: Regional expansion, team growth. (6) Month 30: Series A preparation, exit options.",
          experience: "Uniquely qualified: 6 years recruitment (Hays, Whitbread). Built £1.2M hospitality desk. Placed 800+ candidates. Deep understanding of employer and candidate needs. Industry connections: HR managers, hospitality chains. CIPD qualified, REC certified.",
          revenue: "Flat placement fee: £150/hire. Volume discount: £125/hire (20+/month). Add-ons: Right-to-work £15, urgent matching £50, video interview coaching £30. Enterprise: Custom packages. Year 1: £360K. Year 3: £2.16M. Gross margin: 70%.",
        },
        { // ServicePro - B2B Solutions - COMPREHENSIVE
          businessName: "ServicePro Solutions",
          industry: "Business Services / Facilities Management / B2B",
          problem: "UK SMEs manage 5+ service providers (cleaning, security, maintenance) with no central oversight. 68% of SMEs report inconsistent service quality. Contracts scattered across email/paper. Average SME spends 8 hours/month coordinating services. No leverage for price negotiation. Facilities management solutions designed for enterprise, not SME.",
          innovationStage: "pre-mvp",
          productStatus: "Building integrated facilities management platform for SMEs. Platform MVP: Service booking, provider management, dashboard complete. 28 pilot customer agreements signed. 15 vetted service providers onboarded (cleaning, security, maintenance). Beta launch Q1 2026. Advisory board: 2 facilities managers, 1 property company director.",
          existingCustomers: "Pre-launch: 28 pilot agreements (SMEs with 5-100 employees). Sectors: 12 professional services offices, 8 retail units, 5 hospitality venues, 3 light industrial. Combined facility value: £8M. Service providers: 15 vetted providers covering core services. Estimated Year 1 GMV: £420K.",
          tractionEvidence: "28 pilot agreements (£420K estimated GMV). 15 service providers onboarded (vetted, contracted). Platform MVP functional. Pricing validation: 25/28 pilots accept proposed fees. Provider savings: Negotiated 15-20% below standard rates. Advisory board secured. Property company partnership in discussion.",
          uniqueness: "SME benefits: (1) Single platform for all facility services (dashboard, mobile app). (2) Pre-vetted, quality-guaranteed providers (performance tracked). (3) 15-20% cost savings through bulk negotiation. (4) Real-time service tracking (check-in/out, photos). (5) Invoice consolidation. (6) SLA monitoring.",
          techStack: "Platform: React, Node.js, PostgreSQL. Scheduling: Custom booking/calendar system. Payments: GoCardless direct debit. Provider tracking: Mobile app with GPS check-in. Reporting: Custom dashboards. Integrations: Xero/QuickBooks for invoicing.",
          dataArchitecture: "SME flow: Onboarding → Service requirements → Provider matching → Scheduling → Delivery → Quality rating → Invoice. Provider flow: Application → Vetting → Onboarding → Job assignment → Check-in/out → Payment. Tracking: Service delivery, quality scores, response times, costs.",
          aiMethodology: "Not applicable - facilities management platform. Our innovation is in aggregating demand and negotiating better rates for SMEs, not AI. We use operational technology with focus on service delivery tracking and quality assurance.",
          complianceDesign: "GDPR: SME and provider data protection. Health & Safety: Provider compliance verification. Insurance: Public liability verification for all providers. Contracts: Standard terms for SME and provider agreements. SIA: Security providers licensed.",
          patentStatus: "No patents filed - operational innovation. Trademark: 'ServicePro' application pending (UK00003925789). Trade secrets: Provider vetting criteria, pricing negotiation methodology documented. Copyright: Platform code protected.",
          founderEducation: "MBA, Warwick Business School, 2021. BSc Facilities Management, Sheffield Hallam University, 2017 (First Class). IWFM (Institute of Workplace and Facilities Management) qualified. NEBOSH General Certificate.",
          founderWorkHistory: "Facilities Manager, WeWork UK (2021-2024): Managed 15 locations, £8M annual service spend. Operations Manager, Regus (2018-2021): Multi-site facilities coordination. Facilities Coordinator, Lloyds Banking Group (2017-2018): Corporate facilities support.",
          founderAchievements: "WeWork: Reduced service costs 22% (£1.8M savings) through provider consolidation. Managed 15 locations, 200+ service visits weekly. Regus: Implemented service tracking system across 8 sites. Built network of 50+ trusted service providers. IWFM Best Practice Award 2023.",
          relevantProjects: "WeWork: Provider consolidation project (£1.8M savings, 22% reduction). Regus: Service quality tracking implementation. Lloyds: Facilities helpdesk optimization. MBA: 'Facilities Management for SMEs' - identified market gap. Side project: Facilities manager network (150 members).",
          funding: "95000",
          fundingSources: "£55,000 personal savings (from WeWork salary). £30,000 family investment (equity). £10,000 Small Business Charter grant (reference: SBC-2024-567). Total: £95,000 for platform completion and provider network expansion.",
          monthlyProjections: "Year 1: Month 1-6: £0 revenue (beta). Month 7-12: £15K/month GMV, £1.5K platform fee. Year 1: £90K GMV, £9K revenue. Year 2: £80K/month GMV (150 SMEs). Year 3: £200K/month GMV (400 SMEs). Break-even Month 18. Year 3: £2.4M GMV, £240K revenue.",
          customerAcquisitionCost: "320",
          lifetimeValue: "4800",
          paybackPeriod: "2",
          detailedCosts: "Platform hosting: £1K/month. Development (Year 1): £25K. Marketing: £2K/month. Sales: £1.5K/month (contractor). Provider network management: £10K/year. Legal: £8K. Insurance: £3K. Total Year 1: £78K.",
          competitors: "1. Mitie (enterprise, not SME focus). 2. ISS (large contracts only). 3. OCS (enterprise). 4. Local independent providers (fragmented). 5. Task Rabbit (consumer, not B2B). Our advantage: SME focus, aggregated buying power, quality guarantee.",
          competitiveDifferentiation: "SME-sized contracts (competitors focus on £100K+). 15-20% cost savings (bulk negotiation power). Quality guarantee (poor service = free replacement). Single invoice (vs 5+ provider invoices). Real-time tracking (competitors have no visibility). SLA monitoring (accountability).",
          customerInterviews: "35 SME owner/manager interviews (April-October 2025). Findings: (1) Managing multiple providers is time drain. (2) No leverage for pricing negotiation. (3) Quality inconsistency frustrating. (4) Want single point of contact. (5) Would pay 10% markup for reliability.",
          lettersOfIntent: "28 pilot LOIs signed: Combined annual service spend £420K. Property company: Discussion for 50 managed properties (£600K potential). Provider partnerships: 15 providers committed, 10 more in pipeline. Chamber of Commerce: Promotion to 3,000 SME members.",
          willingnessToPay: "Platform fee: 10% of service spend (accepted by 89% in validation). Alternative: Monthly subscription £99 for unlimited bookings. Survey: 85% prefer percentage model for cost alignment. Value proposition: 10% fee vs 15-20% savings = net positive.",
          marketSize: "TAM: UK facilities management £60B. SAM: SME facilities services £8B. SOM: Year 1: £90K GMV (0.001% SAM). Year 3: £2.4M GMV (0.03% SAM). Conservative given SME sales cycle and provider network constraints.",
          regulatoryRequirements: "No specific licensing for platform. Provider compliance: SIA for security, Gas Safe for heating, NICEIC for electrical. Insurance: Require all providers have £5M public liability. Health & Safety: Provider risk assessments required. GDPR: Data protection for all parties.",
          complianceTimeline: "Month 1: Provider vetting criteria finalized. Month 3: GDPR policies complete. Month 6: Provider compliance audits (sample). Month 12: ISO 9001 quality management (enterprise credibility). Ongoing: Provider insurance verification.",
          complianceBudget: "15000",
          jobCreation: "14",
          hiringPlan: "Year 1: Founder + part-time sales. Year 2: Sales Manager (£45K), Provider Relations (£35K), Customer Success (£32K), Developer (£50K). Year 3: Regional Sales (2 × £40K), Operations (£38K), Marketing (£38K). Total: 14 by Year 3.",
          specificRegions: "Year 1: London (highest SME density). Year 2: Manchester, Birmingham, Bristol. Year 3: National coverage. Focus: Business districts with high SME concentrations.",
          expansion: "Services: Year 1: Cleaning, security, maintenance. Year 2: Add IT support, waste management. Year 3: Full facility services (HVAC, pest control, landscaping). Channels: Direct → Property management partnerships → Chamber of Commerce referrals.",
          internationalPlan: "Year 4: Ireland (similar market, SME-friendly regulations). Year 5: EU expansion (starting Netherlands, Germany). Strategy: Local provider networks, UK operational model export. Focus: UK profitability before international.",
          vision: "5-year vision: UK's leading SME facilities management platform. £15M GMV, £1.5M revenue, 2,000 SME clients, 200 vetted providers, 25 employees. Known for: Quality, savings, simplicity. Exit: Acquisition by facilities management company or property tech platform.",
          targetEndorser: "Primary: Innovator International (services expertise, B2B marketplace understanding). Alternative: Envestors (platform model). Rationale: Innovator International understands B2B services, has facilities management contacts, mentor network includes operations executives.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, pilot agreements. (2) Month 6: Beta launch, first transactions. (3) Month 12: Year 1 review, provider network. (4) Month 18: Property company partnerships. (5) Month 24: Regional expansion, team growth. (6) Month 30: Series A preparation, exit options.",
          experience: "Uniquely qualified: 7 years facilities management (WeWork, Regus, Lloyds). Managed £8M annual service spend. Delivered £1.8M savings through provider consolidation. Deep understanding of SME needs and provider economics. Industry connections: facilities managers, service providers. IWFM qualified.",
          revenue: "Platform fee: 10% of service GMV. Alternative: £99/month subscription (small SMEs). Enterprise: Custom pricing for property companies. Year 1: £9K (10% of £90K GMV). Year 3: £240K (10% of £2.4M GMV). Gross margin: 85%.",
        },
      ],
      social: [
        { // ImpactFirst - Social Innovation - COMPREHENSIVE
          businessName: "ImpactFirst Ventures",
          industry: "Social Enterprise / Impact Investment / Community Development",
          problem: "UK social enterprises struggle to access growth capital - too commercial for grants, too 'risky' for banks. £2.3 billion funding gap for impact-driven businesses.",
          innovationStage: "mvp-complete",
          productStatus: "Impact investment platform connecting 45 social enterprises with 180 impact investors. £2.1M raised across 12 deals. Average investment £175K. B Corp certified.",
          existingCustomers: "45 social enterprises (active seekers), 180 registered investors. Completed deals: 12 investments totalling £2.1M. Key enterprises: Community Energy Co-op (£350K raised), Social Housing Trust (£280K raised). Investor testimonials available.",
          tractionEvidence: "£2.1M raised across 12 deals. 45 social enterprises registered, 180 investors. Average deal: £175K. Deal success rate: 35%. Platform commission revenue: £105K (5% of capital raised). B Corp certified.",
          uniqueness: "Platform innovation: (1) Impact measurement framework (standardised metrics). (2) Blended finance structures (grant + investment). (3) Due diligence as a service. (4) Community investor network.",
          techStack: "Platform: React, PostgreSQL. Payments: Stripe Connect. Impact tracking: Custom dashboard. Documents: DocuSign. Due diligence: Integrated document management.",
          dataArchitecture: "Social enterprise flow: Application → Impact assessment → Due diligence → Profile creation → Investor matching → Campaign live → Investment collection → Post-investment reporting. Impact tracking: Standardised metrics (jobs, carbon, community reach) with quarterly reporting.",
          aiMethodology: "Not applicable - impact investment platform. Our innovation is in impact measurement frameworks and blended finance structures, not AI technology. We use social enterprise assessment methodologies with technology-enabled matching.",
          complianceDesign: "FCA registered (if facilitating investments). Crowdfunding regulations (ECSR compliance). Social Enterprise Mark (achieved). B Corp certification (achieved). GDPR compliant. Anti-money laundering (AML) checks on investors.",
          patentStatus: "No patents filed - methodology and framework innovation. Trademark: 'ImpactFirst' registered (UK00003912345). Trade secrets: Impact measurement methodology documented. Social Enterprise Mark holder.",
          founderEducation: "MSc Social Innovation, London School of Economics, 2020. BA Politics & Economics, SOAS University, 2017 (First Class). CFA Level 1 (passed). Social Enterprise Accelerator graduate (UnLtd).",
          founderWorkHistory: "Investment Manager, Big Society Capital (2020-2024): Deployed £15M to social enterprises. Programme Manager, UnLtd (2018-2020): Supported 100+ social entrepreneurs. Volunteer, Oxfam (2015-2017): Community development projects in Nigeria.",
          founderAchievements: "Deployed £15M social investment at Big Society Capital (25 deals). Supported 100+ social entrepreneurs at UnLtd. Founded student social enterprise at SOAS (£20K revenue, 50 beneficiaries). Speaker at Social Enterprise World Forum 2023.",
          relevantProjects: "Big Society Capital: Led 25 social enterprise investments (£15M deployed). UnLtd: Designed social enterprise support programme. Personal: Founded student social enterprise serving 50 beneficiaries. LSE dissertation: 'Blended Finance for Social Impact'.",
          funding: "85000",
          fundingSources: "£30,000 personal savings. £25,000 family investment (social impact loan). £30,000 Access Foundation for Social Investment grant (reference: ACCESS-2024-789). Total: £85,000 for platform development.",
          monthlyProjections: "Year 1: £8.75K/month platform fees, £6K costs. Year 2: £25K/month (£6M capital raised), £18K costs. Year 3: £50K/month (£12M capital raised), £35K costs. Break-even Month 8. Year 3: £600K revenue.",
          customerAcquisitionCost: "450",
          lifetimeValue: "8750",
          paybackPeriod: "1",
          detailedCosts: "Platform hosting: £1.5K/month. Legal/compliance: £15K/year. Due diligence service: £3K/month. Staff (Year 2): £100K/year. Marketing/events: £2K/month. Impact reporting: £1K/month. Total Year 1: £72K.",
          competitors: "1. Ethex (established, retail focus). 2. Lendahand (international development). 3. Abundance Investment (energy focus). 4. Triodos Bank (traditional bank). 5. Big Society Capital (wholesale investor). Our advantage: Blended finance innovation, SME social enterprise focus, impact framework.",
          competitiveDifferentiation: "Blended finance: Combine grants + investment (unique approach). Impact framework: Standardised metrics for comparison. SME focus: £50K-500K deals (underserved market). Community investors: Retail + institutional combined. Due diligence service: Reduces investor risk.",
          customerInterviews: "35 interviews (20 social enterprises, 15 impact investors). Findings: (1) Social enterprises stuck between grants and commercial investment. (2) Investors want standardised impact metrics. (3) Due diligence is barrier for smaller investors. (4) Blended structures attractive to both sides. (5) Network/community valued.",
          lettersOfIntent: "Pipeline: 8 social enterprises seeking £1.4M (combined). Investor commitments: 25 investors with £2.5M indicated capacity. Partnerships: 2 social enterprise networks (access to 500 members). Foundation partner: £100K guarantee fund discussion.",
          willingnessToPay: "Enterprise fee: 5% of capital raised (success-based). Investor fee: None (attracted by deal flow). Premium services: Due diligence £2K, Impact reporting £500/year. Average deal: £175K, £8,750 revenue per successful deal.",
          marketSize: "TAM: UK social investment market £7.9B. SAM: SME social enterprise investment £1.2B. SOM: Year 1: £2.1M capital (£105K revenue). Year 3: £12M capital (£600K revenue). 1% SAM penetration Year 3.",
          regulatoryRequirements: "FCA registration: Required if facilitating investments (6-12 months, £5K). FSCS compliance: If holding client money. AML/KYC: Investor verification. GDPR: Data protection for all parties. Social Enterprise Mark: Achieved.",
          complianceTimeline: "Month 1-6: FCA registration application. Month 3: AML/KYC process implementation. Month 6: Platform terms and investor agreements. Month 12: Compliance audit. Ongoing: FCA reporting, AML monitoring.",
          complianceBudget: "25000",
          jobCreation: "12",
          hiringPlan: "Year 1: Founder + part-time analyst. Year 2: Investment Manager (£50K), Community Manager (£38K), Developer (£55K). Year 3: Due Diligence Lead (£45K), Marketing (£40K), Operations (£35K), Admin (£28K). Total: 12 by Year 3.",
          specificRegions: "Year 1: London (social enterprise density, investor network). Year 2: Manchester, Bristol, Birmingham (strong social enterprise ecosystems). Year 3: National coverage. Focus: Areas with active social enterprise support (Local Enterprise Partnerships).",
          expansion: "Products: Year 1: Equity investment matching. Year 2: Add loans, revenue-based financing. Year 3: Secondary market, impact funds. Sectors: General → Specific tracks (housing, energy, employment, health).",
          internationalPlan: "Year 4: Ireland (EU social enterprise market). Year 5: European Social Fund alignment opportunities. Strategy: UK social investment ecosystem leadership first. International via partnerships with local platforms.",
          vision: "5-year vision: UK's leading social enterprise investment platform. £50M capital raised, £2.5M revenue, 300 social enterprises funded, 500 investors, 20 employees. Known for: Blended finance innovation, impact measurement. Exit: Acquisition by impact investor or financial services company.",
          targetEndorser: "Primary: Innovator International (social enterprise understanding). Alternative: Global Entrepreneur Programme (scaling ambitious businesses). Rationale: Innovator International has social enterprise portfolio, understands impact measurement, connections to social investment ecosystem.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, deal pipeline. (2) Month 6: Capital raised metrics, investor growth. (3) Month 12: Year 1 review, impact report. (4) Month 18: New product launches. (5) Month 24: Team growth, expansion. (6) Month 30: Exit planning, international.",
          experience: "Uniquely qualified: 4 years at Big Society Capital (£15M deployed, 25 deals). Social enterprise support experience (UnLtd, 100+ entrepreneurs). Founded student social enterprise. Deep understanding of social investment ecosystem. Industry connections: impact investors, foundations, social enterprises.",
          revenue: "Platform fee: 5% of capital raised (from social enterprise). Premium services: Due diligence £2K, Impact reporting £500/year. Institutional: White-label platform licensing. Year 1: £105K (5% of £2.1M). Year 3: £600K (5% of £12M). Gross margin: 80%.",
        },
        { // CommunityHub - Local Solutions - COMPREHENSIVE
          businessName: "CommunityHub",
          industry: "Social Enterprise / Community / Local Services",
          problem: "UK high streets have 15% vacancy rates (50,000 empty shops). Local businesses can't compete with online giants - 42% lost significant revenue to Amazon. £17B leaked from local economies annually. Community connections weakened post-pandemic. 67% of residents want to shop local but find it inconvenient.",
          innovationStage: "mvp-complete",
          productStatus: "Hyperlocal marketplace connecting 340 local businesses with 8,500 residents in 3 pilot areas (Hackney, Bristol, Manchester). £95K monthly transaction volume. 85% of revenue stays local. Mobile app launched. Community events feature integrated. Social Enterprise Mark application submitted.",
          existingCustomers: "340 local businesses: 120 independent retailers, 80 food/drink, 65 services (hairdressers, fitness), 45 makers/artisans, 30 professional services. Resident users: 8,500 registered, 2,400 monthly active. Key partners: 3 local councils, 2 BIDs (Business Improvement Districts). Testimonials: 85+ merchants.",
          tractionEvidence: "£95K monthly GMV. 340 businesses, 8,500 residents. Average basket: £28. Repeat purchase rate: 45%. Same-day delivery success: 98%. Press: The Guardian (2 features), BBC News, Local press. Awards: Social Enterprise UK Innovation finalist. Council partnerships: 3 active.",
          uniqueness: "Community impact: (1) 85% of spending stays local (vs 13% Amazon according to research). (2) Same-day local delivery (3-hour window). (3) Community events integration (markets, workshops). (4) Local loyalty points (£1 spent = 1 point = £0.01). (5) Zero platform commission for smallest businesses. (6) Community ownership model planned.",
          techStack: "Platform: React Native (mobile), React (web), Node.js, PostgreSQL. Payments: Stripe Connect (split payments). Delivery: Partner with local courier collective, Pedal Me integration. Messaging: Twilio. Events: Eventbrite API. Analytics: Custom community dashboard.",
          dataArchitecture: "Business flow: Registration → Verification → Catalogue upload → Inventory management → Orders → Delivery coordination → Settlement. Resident flow: Browse local → Purchase → Track delivery → Review → Loyalty points. Community: Events calendar, local news, council notices integration.",
          aiMethodology: "Not applicable - community marketplace platform. Our innovation is in the community-focused business model and local delivery network, not AI. We use standard marketplace technology with focus on community building and local economic impact.",
          complianceDesign: "GDPR: Resident and business data protection. Consumer Rights Act: Returns policy, distance selling. Food safety: Partnered with certified food businesses only. Age verification: For alcohol sales. Social Enterprise Mark: Application submitted.",
          patentStatus: "No patents filed - community model innovation. Trademark: 'CommunityHub' registered (UK00003918901). Social Enterprise: CIC (Community Interest Company) structure. Copyright: Platform code protected. Community Shares: Asset-locked for community benefit.",
          founderEducation: "MSc Social Policy, LSE, 2019. BA Politics, University of Manchester, 2016 (First Class). Community Organising certificate (Citizens UK). Co-operative Governance training.",
          founderWorkHistory: "Community Manager, Nextdoor UK (2019-2024): Grew UK user base from 500K to 3M, managed 25 local partnerships. Policy Advisor, Greater London Authority (2017-2019): High streets strategy, local economy policy. Organiser, Citizens UK (2015-2017): Community campaigns.",
          founderAchievements: "Nextdoor: Grew UK user base 6x (500K to 3M). Established 25 local council partnerships. GLA: Contributed to London High Streets Strategy. Citizens UK: Led campaigns improving 5 local high streets. Founded resident association (800 members). Published: 'Digital Platforms for Local Economies' (local government journal).",
          relevantProjects: "Nextdoor: UK growth strategy (3M users). GLA: High streets resilience programme. Citizens UK: Community organising campaigns. Personal: Resident association (800 members), local market events. LSE dissertation: 'Platform Co-operatives for Local Commerce'.",
          funding: "110000",
          fundingSources: "£30,000 personal savings. £25,000 family investment (community shares). £35,000 Power to Change (community business fund, reference: PTC-2024-890). £20,000 crowdfunding (Crowdfunder, 280 backers). Total: £110,000 for platform development and 3 pilot areas.",
          monthlyProjections: "Year 1: £95K/month GMV, £4.75K platform fee (5%), £6K costs. Year 2: £250K/month GMV (8 areas), £12.5K fee, £10K costs. Year 3: £600K/month GMV (20 areas), £30K fee, £20K costs. Year 1: £57K revenue. Break-even Month 10. Year 3: £360K revenue.",
          customerAcquisitionCost: "8",
          lifetimeValue: "180",
          paybackPeriod: "1",
          detailedCosts: "Platform hosting: £1.5K/month. Delivery coordination: £1K/month. Marketing: £2K/month. Staff (Year 2): £80K/year. Community events: £8K/year. Legal/governance: £5K/year. Total Year 1: £72K.",
          competitors: "1. Amazon (convenience, but leaks money from local). 2. Deliveroo (food only, 30% commission). 3. Not On The High Street (curated, national focus). 4. Local independent e-commerce (fragmented). 5. Facebook Marketplace (no payments, no delivery). Our advantage: Local focus, community ownership, sustainable delivery.",
          competitiveDifferentiation: "85% local retention (vs 13% Amazon). 5% commission (vs 30% Deliveroo). Same-day sustainable delivery. Community ownership model. Events integration. Zero commission for micro-businesses. Council partnerships. Social Enterprise status.",
          customerInterviews: "65 interviews (40 residents, 25 business owners). Resident findings: (1) Want to support local but convenience is barrier. (2) Delivery expectation now standard. (3) Community connection valued post-pandemic. Business findings: (1) Platform fees are killing margins. (2) Can't afford own e-commerce. (3) Want local customer loyalty.",
          lettersOfIntent: "Council partnerships: 5 councils interested in expansion (combined 800 businesses). BIDs: 4 Business Improvement Districts (400 businesses). Community: 280 crowdfunding backers (early adopters). Impact investor: Social Tech Trust (£200K potential Series A).",
          willingnessToPay: "Platform fee: 5% GMV (businesses). Delivery: £2.50-5 (customer paid). Premium listings: £25/month. Loyalty programme: Free (funded by transactions). Resident: No fees. Survey: 92% businesses accept 5% vs 25-30% alternatives.",
          marketSize: "TAM: UK local retail £140B. SAM: Independent local retail £28B. SOM: Year 1: £1.14M GMV (0.004% SAM). Year 3: £7.2M GMV (0.03% SAM). Conservative given area-by-area expansion model.",
          regulatoryRequirements: "CIC registration: Completed. Social Enterprise Mark: Application submitted. GDPR: Data protection. Consumer Rights Act: E-commerce compliance. Food hygiene: Partner verification. ICO registration: Completed.",
          complianceTimeline: "Month 1: CIC registration (completed). Month 3: Social Enterprise Mark. Month 6: GDPR audit. Month 12: B Corp assessment. Ongoing: Partner compliance verification (food safety, insurance).",
          complianceBudget: "10000",
          jobCreation: "15",
          hiringPlan: "Year 1: Founder + part-time community coordinator. Year 2: Community Managers (2 × £32K), Developer (£50K), Marketing (£38K). Year 3: Regional Coordinators (3 × £35K), Operations (£40K), Finance (£42K). Total: 15 by Year 3.",
          specificRegions: "Year 1: Hackney (pilot), Bristol, Manchester (validation). Year 2: 5 additional areas (Birmingham, Leeds, Edinburgh, Brighton, Liverpool). Year 3: 12 additional areas. Focus: Areas with strong independent retail, active BIDs, supportive councils.",
          expansion: "Products: Year 1: Marketplace, delivery. Year 2: Events, local loyalty currency. Year 3: Community investment platform, local tourism. Channels: Council partnerships → BIDs → Community groups. Model: Franchise-style local hubs.",
          internationalPlan: "Year 4: Ireland (similar high street challenges). Year 5: EU cities with localism movements. Strategy: Open-source technology, local community ownership. Focus: UK community model proof before international.",
          vision: "5-year vision: UK's leading community commerce platform. 100 areas, £50M GMV, £2.5M revenue, 50 employees, 5,000 local businesses supported. Known for: Local economy impact, community ownership, sustainable commerce. Exit: Community buyout (employee/community ownership) rather than trade sale.",
          targetEndorser: "Primary: Innovator International (social enterprise understanding). Alternative: Envestors (platform technology). Rationale: Innovator International has social enterprise portfolio, understands community business models, connections to impact investors.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, pilot area results. (2) Month 6: Expansion to 3 areas, community impact metrics. (3) Month 12: Year 1 review, council partnerships. (4) Month 18: Social Enterprise Mark, funding round. (5) Month 24: 8-area expansion, team growth. (6) Month 30: National expansion, community ownership model.",
          experience: "Uniquely qualified: 5 years at Nextdoor (grew UK 6x to 3M users). Community organising experience (Citizens UK). Policy background (GLA high streets). Deep understanding of local economies and digital platforms. Industry connections: councils, BIDs, community organizations. Published research on platform co-operatives.",
          revenue: "Platform fee: 5% of GMV (from business). Delivery fee: £2.50-5 (from customer, covers costs). Premium listings: £25/month. Events ticketing: 10% of ticket sales. B2B: Council/BID partnerships (annual fees). Year 1: £57K. Year 3: £360K. Gross margin: 65%.",
        },
        { // GreenFuture - Sustainability Venture - COMPREHENSIVE
          businessName: "GreenFuture Initiative",
          industry: "Social Enterprise / Sustainability / Education",
          problem: "UK schools lack practical sustainability education. 78% of teachers say they're not equipped to teach climate action. Students report eco-anxiety (68% worry about climate change). National curriculum covers theory but not practical skills. 82% of parents want schools to teach sustainability but only 23% believe they do effectively.",
          innovationStage: "pre-mvp",
          productStatus: "Developing hands-on sustainability curriculum and school garden programme. Pilot agreements with 8 schools (4 primary, 4 secondary). £45K grant funding secured. Teacher training module developed. School garden toolkit prototyped. Advisory board: 2 headteachers, 1 environmental educator, 1 corporate sponsor. CIC registration complete.",
          existingCustomers: "Pre-launch: 8 pilot school agreements (3,200 students reached). Sectors: 4 primary schools (Years 4-6), 4 secondary schools (Years 7-9). Geographies: London (4), Manchester (2), Birmingham (2). Corporate sponsor: Sustainability consultancy (£15K). Advisory schools: Outstanding-rated institutions.",
          tractionEvidence: "8 school pilot agreements (3,200 students). £45K funding: £30K National Lottery Climate Action Fund, £15K corporate sponsorship. Teacher training: 24 teachers trained in pilot cohort. Materials: Curriculum fully developed, garden toolkit prototyped. Press: TES (Times Educational Supplement) interview scheduled.",
          uniqueness: "Educational innovation: (1) Practical learning (grow food, composting, energy audits, carbon measurement). (2) Student-led projects build agency and reduce eco-anxiety. (3) Teacher CPD training included (6 hours accredited). (4) Revenue from corporate sponsorship (CSR programmes). (5) School-to-community impact (students teach families).",
          techStack: "Curriculum: Custom LMS platform (content, assessments, certificates). Impact tracking: Student engagement dashboard, carbon savings calculator. Community: School network forum (Discourse). Operations: Volunteer management (Better Impact). Resources: Google Workspace for schools integration.",
          dataArchitecture: "School flow: Enquiry → Assessment → Onboarding → Teacher training → Curriculum delivery → Student projects → Impact measurement → Certificate. Tracking: Student participation, project outcomes, carbon savings, behaviour change surveys. Reporting: Impact reports for funders and sponsors.",
          aiMethodology: "Not applicable - sustainability education programme. Our innovation is in practical, hands-on learning methodology and corporate sponsorship model, not AI technology. We use educational technology for delivery and impact measurement.",
          complianceDesign: "Safeguarding: DBS checks for all staff, safeguarding policy. GDPR: Student data protection (parental consent). Curriculum: National Curriculum alignment (Science, Geography, PSHE). CPD: Accredited teacher training. CIC: Community Interest Company registered.",
          patentStatus: "No patents - educational methodology. Trademark: 'GreenFuture Initiative' application pending. Copyright: Curriculum materials, teaching resources protected. Creative Commons: Some materials shared for non-commercial use. CIC: Asset-locked for community benefit.",
          founderEducation: "PGCE (Secondary Science), University of Cambridge, 2018. MSc Environmental Policy, Imperial College, 2017. BSc Environmental Science, University of Leeds, 2015 (First Class). Forest School Leader qualification. Climate Reality Leadership Training.",
          founderWorkHistory: "Environmental Education Manager, Eden Project (2020-2024): Developed school programmes reaching 50K students annually. Science Teacher, Harris Academy (2018-2020): Outstanding Ofsted rating, led sustainability club. Research Assistant, Imperial College (2017-2018): Climate education research.",
          founderAchievements: "Eden Project: Developed programmes reaching 50K students/year. Created award-winning 'Climate Champions' curriculum. Harris Academy: Students won national eco-schools award. Founded sustainability club (120 members). Published: 'Practical Climate Education' (Environmental Education Research journal). BAFTA Kids Classroom presenter.",
          relevantProjects: "Eden Project: Climate Champions curriculum (50K students). Harris Academy: Eco-schools Green Flag Award. Imperial research: 'Effective Climate Education Interventions'. Personal: Community garden programme (200 families). Cambridge PGCE: Action research on outdoor learning.",
          funding: "85000",
          fundingSources: "£30,000 National Lottery Climate Action Fund (reference: CAF-2024-1234). £15,000 corporate sponsorship (sustainability consultancy). £25,000 personal savings. £15,000 crowdfunding (JustGiving, 180 backers). Total: £85,000 for pilot programme and materials.",
          monthlyProjections: "Year 1: Month 1-6: £0 revenue (pilot funded by grants). Month 7-12: £8K/month (12 schools). Year 1: £48K revenue, £72K costs (grant-supported). Year 2: £25K/month (40 schools). Year 3: £55K/month (100 schools). Break-even Month 18. Year 3: £660K revenue.",
          customerAcquisitionCost: "350",
          lifetimeValue: "6600",
          paybackPeriod: "2",
          detailedCosts: "Staff (founder + educator): £55K/year. Materials (garden kits, curriculum): £15K. Travel: £8K. Platform/tech: £5K. Marketing: £4K. Training delivery: £8K. Admin: £5K. Total Year 1: £72K (grant-funded).",
          competitors: "1. Eco-Schools (international, focuses on awards not curriculum). 2. Learning Through Landscapes (outdoor learning, not sustainability focus). 3. Eden Project (excellent but expensive, travel required). 4. Teach First Climate Course (training only, no hands-on). 5. Individual teacher efforts (fragmented). Our advantage: Complete programme, teacher training, corporate funding model.",
          competitiveDifferentiation: "Complete package: Curriculum + garden kit + teacher training + impact measurement. Student agency: Projects led by students, not just taught. Corporate sponsorship: Schools pay less, sponsors get CSR outcomes. Accredited CPD: 6 hours teacher training counts towards development. Measurable impact: Carbon savings calculated and reported.",
          customerInterviews: "42 interviews (25 teachers, 10 headteachers, 7 parents). Teacher findings: (1) Want practical resources, not theory. (2) Need training to feel confident. (3) Time is biggest barrier. (4) Student engagement is high for practical work. Headteacher findings: (1) Budget is limited. (2) Need Ofsted/curriculum alignment. (3) Community impact valued.",
          lettersOfIntent: "8 pilot school LOIs signed. Corporate sponsors: 2 additional companies interested (£30K combined potential). Multi-academy trusts: 2 MATs (25 schools combined) in discussion. Government: DfE meeting scheduled (potential endorsement).",
          willingnessToPay: "School pricing: £1,500/year (covers materials, training). Corporate sponsorship: £5K per school sponsored. Parent contribution: Optional £15 activity pack. Free tier: Basic curriculum (lead generation). Survey: 75% schools accept £1,500 if training included.",
          marketSize: "TAM: UK school curriculum resources £2.8B. SAM: Sustainability education £180M. SOM: Year 1: £48K (0.03% SAM). Year 3: £660K (0.4% SAM). Conservative given school budget constraints and sales cycle.",
          regulatoryRequirements: "DBS: Enhanced checks for all school-facing staff. Safeguarding: Policy and training. National Curriculum: Alignment with Science, Geography, PSHE. Ofsted: Inspected as enrichment activity. CIC: Regulatory reporting.",
          complianceTimeline: "Month 1: DBS checks complete. Month 3: Safeguarding policy audit. Month 6: Curriculum alignment review (external educator). Month 12: CIC annual reporting. Ongoing: Staff DBS renewals, policy updates.",
          complianceBudget: "8000",
          jobCreation: "12",
          hiringPlan: "Year 1: Founder + 1 environmental educator (£32K). Year 2: 2 regional educators (£30K each), Programme Manager (£40K), Marketing (£35K). Year 3: 4 additional educators, Operations (£38K). Total: 12 by Year 3.",
          specificRegions: "Year 1: London (4 schools), Manchester (2), Birmingham (2). Year 2: Bristol, Leeds, Edinburgh (10 schools each). Year 3: National expansion (100 schools). Focus: Urban areas with corporate sponsor density.",
          expansion: "Products: Year 1: Primary/secondary curriculum. Year 2: Add GCSE/A-Level resources, family programmes. Year 3: Teacher qualification, international curriculum. Channels: Direct → Multi-academy trusts → Local authority frameworks.",
          internationalPlan: "Year 4: Ireland (English language, similar curriculum). Year 5: EU (Germany, Netherlands - strong sustainability culture). Strategy: License curriculum, train local educators. Focus: UK school network before international.",
          vision: "5-year vision: UK's leading sustainability education provider. 1,000 schools, 400K students reached, £3M revenue, 35 employees. Known for: Practical impact, student agency, measurable outcomes. Exit: Social enterprise growth or acquisition by educational publisher (Pearson, Oxford).",
          targetEndorser: "Primary: Innovator International (social enterprise, education expertise). Alternative: Envestors (EdTech platform elements). Rationale: Innovator International has social enterprise portfolio, education sector connections, understands blended funding models.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Programme overview, pilot results. (2) Month 6: School expansion, impact data. (3) Month 12: Year 1 review, corporate partnerships. (4) Month 18: Multi-academy trust contracts. (5) Month 24: National expansion, team growth. (6) Month 30: International licensing, social impact report.",
          experience: "Uniquely qualified: 4 years at Eden Project (50K students/year). Teacher experience (Outstanding Ofsted rating). Environmental science + education qualifications. Deep understanding of school needs and constraints. Industry connections: headteachers, MATs, corporate CSR teams. Published researcher on climate education.",
          revenue: "School fees: £1,500/year (curriculum + training). Corporate sponsorship: £5K per school sponsored. Family packs: £15. Training-only: £500/teacher. Grant funding: Ongoing applications. Year 1: £48K. Year 3: £660K. Margin: 45% (higher as scale increases).",
        },
      ],
      other: [
        { // EduAI - Learning Platform - COMPREHENSIVE
          businessName: "EduAI",
          industry: "EdTech / AI Learning / Personalized Education",
          problem: "One-size-fits-all education fails 40% of UK students (1.2M children underperforming annually). Teachers spend 12 hours/week on marking and lesson planning, leaving no time for personalization. 68% of teachers say they can't meet diverse learning needs in classes of 30+. Existing EdTech platforms are content libraries, not adaptive learning systems.",
          innovationStage: "mvp-complete",
          productStatus: "AI adaptive learning platform used by 12 UK schools, 4,800 students. Personalizes curriculum paths in real-time based on student performance. 32% improvement in test scores measured in randomized controlled pilot. Teacher time savings: 8 hours/week. Ofsted 'effective practice' recognition.",
          existingCustomers: "12 schools: 8 secondary (Maths, Science focus), 4 primary. 4,800 students across Year 5-9. Multi-academy trusts: 2 MATs (15 schools combined). Key accounts: Harris Federation school (£18K/year), Ark Schools pilot. Teacher users: 145 actively using platform daily.",
          tractionEvidence: "32% test score improvement (randomized controlled trial, 800 students). 12 schools, 4,800 students. ARR: £95K. Teacher NPS: 78. Student engagement: 85% completion rate (vs 45% industry). Press: TES, Schools Week. Awards: Bett Awards finalist, EdTech50 listed.",
          uniqueness: "Educational impact: (1) 32% improvement in test scores (RCT validated). (2) AI identifies learning gaps in real-time (within 3 questions). (3) Reduces teacher admin by 8 hours/week (automated marking, planning). (4) Ofsted-aligned curriculum (cross-referenced to National Curriculum). (5) Parent dashboard (homework visibility). (6) SEND accessibility features.",
          techStack: "AI/ML: Python, TensorFlow (adaptive algorithm). Backend: FastAPI, PostgreSQL. Frontend: React, TypeScript. Infrastructure: AWS (EC2, RDS, S3). LTI integration for LMS compatibility (Google Classroom, Microsoft Teams). Analytics: Custom dashboards. Mobile: React Native companion app.",
          dataArchitecture: "Student flow: Login → Diagnostic assessment → Personalized pathway → Adaptive questions → Real-time feedback → Teacher alerts → Progress reports. Data: Learning objectives mastery, time-on-task, misconception patterns, predicted grades. Privacy: Student data anonymized for model training.",
          aiMethodology: "Adaptive algorithm: Bayesian Knowledge Tracing for mastery estimation. Question selection: Item Response Theory (IRT) for optimal difficulty. Misconception detection: Pattern recognition on common errors. Model training: 500K anonymized student interactions from pilot schools. Accuracy: 89% grade prediction accuracy.",
          complianceDesign: "GDPR: Student data protection, parental consent. DfE: Safeguarding compliance, data sharing agreements. ICO: Registration complete. Accessibility: WCAG 2.1 AA compliant. Data: UK-hosted only (AWS London). AI: Algorithmic transparency reports for schools.",
          patentStatus: "UK Patent application: 'Adaptive Learning Pathway Optimization' (GB2024/012345, pending). Trade secrets: Algorithm parameters, training data methodology documented. Trademark: 'EduAI' registered (UK00003922345). Copyright: Content library protected.",
          founderEducation: "PhD Artificial Intelligence in Education, UCL, 2021. MSc Machine Learning, Imperial College, 2017. BSc Computer Science, University of Lagos, 2014 (First Class). Qualified Teacher Status (QTS). Apple Teacher certified.",
          founderWorkHistory: "Research Scientist, Pearson AI Labs (2021-2024): Developed adaptive learning algorithms, 3 patents filed. EdTech Product Manager, Sparx Maths (2019-2021): Launched adaptive practice feature to 500K students. Data Scientist, DfE (2017-2019): Education data analytics. Secondary Maths Teacher (2014-2017): GCSE results +15% above average.",
          founderAchievements: "Pearson: 3 patents filed (adaptive learning). Sparx: Feature launch to 500K students, +18% engagement. DfE: Predictive model for school performance. Teaching: GCSE results consistently +15% vs national average. Published: 'AI for Personalized Learning' (Journal of Educational Data Mining, 2023). PhD thesis: 12 citations.",
          relevantProjects: "Pearson: Adaptive learning system (deployed to 2M students globally). Sparx Maths: Practice algorithm (500K UK students). DfE: School performance prediction model. UCL PhD: Bayesian Knowledge Tracing improvements. Personal: Open-source adaptive assessment library (500 GitHub stars).",
          funding: "180000",
          fundingSources: "£70,000 personal savings. £50,000 family investment (angel terms). £40,000 Innovate UK Smart Grant (reference: IUK-2024-ED567). £20,000 EdTech accelerator prize (EDUCATE at UCL). Total: £180,000 for platform development and school pilots.",
          monthlyProjections: "Year 1: £8K/month revenue (12 schools), £10K costs. Year 2: £35K/month (50 schools), £28K costs. Year 3: £100K/month (150 schools), £65K costs. Year 1: £95K revenue. Break-even Month 14. Year 3: £1.2M revenue, £780K costs.",
          customerAcquisitionCost: "850",
          lifetimeValue: "24000",
          paybackPeriod: "2",
          detailedCosts: "Cloud infrastructure (AWS): £3K/month. Staff (founder + engineer): £90K/year. Content development: £15K. Sales/marketing: £2K/month. Compliance/legal: £10K. School pilots (subsidized): £8K. Total Year 1: £120K.",
          competitors: "1. Sparx Maths (established, Maths-only). 2. Century Tech (AI claims, limited efficacy data). 3. Hegarty Maths (video-based, not adaptive). 4. Tassomai (quiz-based, limited subjects). 5. Seneca Learning (free, no personalisation). Our advantage: RCT-validated outcomes, true AI adaptation, multi-subject.",
          competitiveDifferentiation: "32% outcome improvement (RCT validated - no competitor has this). True AI adaptation (not just content recommendation). Teacher time savings (8 hours/week measured). Multi-subject (Maths, Science, English planned). Parent dashboard (unique feature). SEND accessibility (inclusive design).",
          customerInterviews: "55 interviews (30 teachers, 15 headteachers, 10 MAT leaders). Teacher findings: (1) Need proven outcomes for Ofsted. (2) Must save time, not add work. (3) Integration with existing systems essential. Headteacher findings: (1) Evidence-based crucial for budget. (2) Want measurable impact for governors. (3) SEND support valued.",
          lettersOfIntent: "Pipeline: 25 schools (8,500 students, £200K ARR). MAT contracts: 2 MATs in negotiation (35 schools combined). DfE: Meeting scheduled (potential national pilot). Publisher partnerships: 2 publishers interested in integration.",
          willingnessToPay: "Per-pupil pricing: £20/student/year (annual license). School license: £6K-15K/year (depending on size). Volume discount: 20% for MATs (5+ schools). Free trial: 1 term with 1 class. Survey: 85% schools accept £20/pupil given outcome evidence.",
          marketSize: "TAM: UK EdTech £3.8B. SAM: K-12 adaptive learning £480M. SOM: Year 1: £95K (0.02% SAM). Year 3: £1.2M (0.25% SAM). Conservative given school procurement cycles and evidence-building timeline.",
          regulatoryRequirements: "GDPR: Student data protection (DPA 2018). DfE Data Standards: Compliance required for state schools. ICO Registration: Completed. Cyber Essentials Plus: Required for some MATs. WCAG 2.1: Accessibility standards. COPPA-like: Parental consent for under-13s.",
          complianceTimeline: "Month 1: ICO registration (completed). Month 3: Cyber Essentials certification. Month 6: WCAG 2.1 AA audit. Month 12: Cyber Essentials Plus. Month 18: ISO 27001 (enterprise MAT requirement). Ongoing: DfE data sharing agreements per school.",
          complianceBudget: "35000",
          jobCreation: "18",
          hiringPlan: "Year 1: Founder + ML Engineer (£60K), Content Developer (£40K). Year 2: CTO (£75K), 2 Engineers (£110K), Customer Success (£38K), Sales (£45K). Year 3: Product Manager (£55K), 3 Engineers, Content team (2). Total: 18 by Year 3.",
          specificRegions: "Year 1: London, South East (pilot schools). Year 2: Midlands, North West. Year 3: National coverage. Focus: Secondary schools initially, expand to primary Year 3. Target: MATs for efficient scaling.",
          expansion: "Subjects: Year 1: Maths. Year 2: Add Science, English. Year 3: Full curriculum. Products: Core platform → Parent app → Teacher CPD → Tutoring marketplace. Channels: Direct → MAT partnerships → DfE framework.",
          internationalPlan: "Year 4: UAE, Singapore (English curriculum, high EdTech spend). Year 5: USA (largest market, Common Core alignment). Strategy: Curriculum localization, local partnerships. Focus: UK evidence base and MAT relationships before international.",
          vision: "5-year vision: UK's leading AI adaptive learning platform. 500 schools, 200K students, £8M ARR, 45 employees. Known for: Evidence-based outcomes, genuine AI, teacher-friendly. Exit: Acquisition by major EdTech (Pearson, McGraw-Hill) or education company.",
          targetEndorser: "Primary: Envestors (AI technology, EdTech sector). Alternative: Innovator International (education expertise). Rationale: Envestors has AI portfolio, EdTech sector experience, connections to education and technology investors.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, RCT results. (2) Month 6: School expansion, new subjects. (3) Month 12: Year 1 review, MAT contracts. (4) Month 18: DfE engagement, Series A. (5) Month 24: National expansion, team growth. (6) Month 30: International preparation, exit options.",
          experience: "Uniquely qualified: PhD in AI for Education. 3 years Pearson AI Labs (3 patents). Deployed adaptive learning to 2M+ students globally. Former teacher (GCSE results +15%). Deep expertise: machine learning, education, product development. Industry connections: EdTech companies, MAT leaders, DfE contacts.",
          revenue: "Per-pupil license: £20/student/year. School license: £6K-15K/year. MAT volume: 20% discount. Premium: Parent app £2/student, teacher CPD £500/teacher. Implementation: £2K one-time. Year 1: £95K ARR. Year 3: £1.2M ARR. Gross margin: 75%.",
        },
        { // PropFlow - Property Management - COMPREHENSIVE
          businessName: "PropFlow",
          industry: "PropTech / Property Management / Real Estate Technology",
          problem: "UK has 2.7M landlords, 60% manage properties themselves. Landlords with 5+ properties spend 15 hours weekly on management tasks (maintenance calls, rent chasing, tenant issues). 35% of landlords consider selling due to admin burden. Rent arrears cost UK landlords £900M annually. Existing software is designed for agencies, not individual landlords.",
          innovationStage: "mvp-complete",
          productStatus: "All-in-one property management platform with 85 landlords managing 420 properties. Features: Automated rent collection (98% on-time rate), maintenance ticketing, tenant portal, expense tracking. iOS and Android apps launched. Average landlord saves 12 hours/week.",
          existingCustomers: "85 landlords: 45 with 5-10 properties, 30 with 11-25 properties, 10 with 26-50 properties. Total: 420 properties under management. Key accounts: Professional landlord (45 properties, £2.4K/year), Property investor group (28 properties). Sectors: 320 residential, 60 HMO, 40 commercial.",
          tractionEvidence: "420 properties, 85 landlords. ARR: £72K. Rent collection: 98% on-time (vs 89% industry). Landlord time saved: 12 hours/week average. Tenant satisfaction: 4.5/5 (portal). Press: Property Week, Landlord Today. Awards: RESI Award shortlist, PropTech50.",
          uniqueness: "Landlord benefits: (1) 12 hours/week time saved (automation). (2) 98% rent collection rate (vs 89% industry average, automated reminders + easy payment). (3) AI maintenance triage (photos → urgency → contractor match). (4) Tenant portal (self-service, reduces calls 60%). (5) Compliance calendar (gas safety, EPC, licensing). (6) Mobile app (manage anywhere).",
          techStack: "Frontend: Next.js, TypeScript, React Native (mobile). Backend: Node.js, PostgreSQL. Payments: Stripe, GoCardless (direct debit). Communication: Twilio (SMS, WhatsApp). Maintenance: Contractor matching algorithm. Hosting: AWS (London region). Analytics: Custom landlord dashboard.",
          dataArchitecture: "Property flow: Onboarding → Tenant linking → Rent schedule → Maintenance history → Expense tracking → Compliance calendar. Tenant flow: Portal access → Rent payment → Maintenance requests → Document access. Landlord: Dashboard → Alerts → Reports → Tax export.",
          aiMethodology: "Maintenance triage: Image classification (TensorFlow) categorizes issues by type and urgency. Contractor matching: Rule-based algorithm matching issue type, location, ratings. Predictive: Rent arrears prediction based on payment history patterns. Not core to value proposition - AI enhances efficiency.",
          complianceDesign: "GDPR: Tenant and landlord data protection. Deposit protection: Integration with TDS, MyDeposits. Gas safety: Reminder system for CP12 certificates. EPC: Expiry tracking and alerts. Selective licensing: Borough-specific compliance tracking. Section 21: Notice validity checking.",
          patentStatus: "No patents filed - operational innovation. Trademark: 'PropFlow' registered (UK00003915678). Trade secrets: Contractor network, matching algorithm documented. Copyright: Platform code, content protected.",
          founderEducation: "MSc Real Estate, University of Reading, 2019. BSc Computer Science, University of Manchester, 2016 (First Class). ARLA Propertymark Level 3. Google Cloud Professional certification.",
          founderWorkHistory: "Product Manager, Goodlord (2019-2024): Led tenant onboarding product, 500K tenancies processed. Software Developer, Zoopla (2016-2019): Property portal features, 50M monthly users. Landlord (2018-present): Personal portfolio of 8 rental properties.",
          founderAchievements: "Goodlord: Product led 500K tenancies processed, reduced onboarding time 40%. Zoopla: Built property valuation feature (10M uses). Personal: Grew rental portfolio to 8 properties (£1.2M value). Published: 'PropTech for Portfolio Landlords' (Property Week guest article). ARLA qualified.",
          relevantProjects: "Goodlord: Tenant onboarding platform (500K tenancies). Zoopla: Property valuation, listing features. Personal: 8-property portfolio management (firsthand landlord experience). Manchester dissertation: 'Software Solutions for Small Landlords'. Side project: Landlord community (2,500 members).",
          funding: "95000",
          fundingSources: "£50,000 personal savings (from rental income). £30,000 family investment (equity). £15,000 Start Up Loans (reference: SUL-2024-456789). Total: £95,000 for platform development and marketing.",
          monthlyProjections: "Year 1: £6K/month revenue (85 landlords), £5K costs. Year 2: £25K/month (350 landlords), £18K costs. Year 3: £70K/month (1,000 landlords), £45K costs. Year 1: £72K revenue. Break-even Month 8. Year 3: £840K revenue, £540K costs.",
          customerAcquisitionCost: "120",
          lifetimeValue: "2160",
          paybackPeriod: "1",
          detailedCosts: "Cloud infrastructure (AWS): £1.5K/month. Payment processing: Variable. Staff (founder + support): £50K/year. Marketing: £2K/month. Contractor network: £5K. Legal/compliance: £8K. Total Year 1: £60K.",
          competitors: "1. Landlord Studio (mobile app, limited features). 2. Arthur Online (agency focus, complex). 3. Hammock (newer, similar space). 4. Letproof (compliance focus). 5. Spreadsheets/manual (most common). Our advantage: All-in-one, AI maintenance, tenant portal, landlord-first design.",
          competitiveDifferentiation: "98% rent collection (vs 89% industry, best-in-class). AI maintenance triage (unique photo-based urgency). Tenant portal (self-service reduces calls 60%). Compliance calendar (automated reminders). Mobile-first (manage from anywhere). Built by landlord (understands pain points).",
          customerInterviews: "50 landlord interviews (March-September 2025). Findings: (1) Rent chasing is biggest time drain. (2) Maintenance coordination stressful. (3) Compliance anxiety (fear of fines). (4) Want mobile access. (5) Current software too complex/agency-focused. (6) Would pay £15-25/property/month.",
          lettersOfIntent: "Pipeline: 150 landlords (800 properties, £168K ARR potential). Letting agent partnerships: 2 agents for referrals. Property investor groups: 3 groups (500 members combined). Integration: Rightmove discussion for listing sync.",
          willingnessToPay: "Per-property pricing: £18/property/month (annual: £216). Volume discount: £15/property for 20+. Free tier: 2 properties (lead generation). Add-ons: Contractor marketplace 10% of job value. Survey: 88% landlords accept £18/property given time savings.",
          marketSize: "TAM: UK property management software £1.2B. SAM: Portfolio landlord software £240M (5+ properties). SOM: Year 1: £72K (0.03% SAM). Year 3: £840K (0.35% SAM). Conservative given B2C sales cycle.",
          regulatoryRequirements: "GDPR: Tenant/landlord data protection. PCI DSS: Via Stripe/GoCardless. ICO Registration: Completed. No property licensing required for software. Optional: ARLA affiliate for credibility.",
          complianceTimeline: "Month 1: ICO registration (completed). Month 3: GDPR audit. Month 6: Cyber Essentials. Month 12: SOC 2 Type 1 (enterprise landlords). Ongoing: Payment provider compliance.",
          complianceBudget: "18000",
          jobCreation: "15",
          hiringPlan: "Year 1: Founder + Customer Support (£28K). Year 2: CTO (£70K), Developer (£55K), Marketing (£42K), Success Manager (£35K). Year 3: 2 Developers, Sales (£45K), Support (2). Total: 15 by Year 3.",
          specificRegions: "Year 1: London, South East (highest landlord density). Year 2: Manchester, Birmingham, Bristol. Year 3: National coverage. Focus: Urban areas with high rental demand and landlord concentrations.",
          expansion: "Products: Year 1: Core platform. Year 2: Contractor marketplace, insurance referrals. Year 3: Mortgage/remortgage, tenant referencing. Channels: Direct → Landlord associations → Letting agent partnerships → Accountant referrals.",
          internationalPlan: "Year 4: Ireland (similar rental regulations). Year 5: EU expansion (Germany, Netherlands - tenant protection laws). Strategy: Localize compliance features per market. Focus: UK market leadership before international.",
          vision: "5-year vision: UK's leading platform for portfolio landlords. 5,000 landlords, 25,000 properties, £5M ARR, 35 employees. Known for: Time savings, rent collection, compliance peace of mind. Exit: Acquisition by PropTech (Goodlord, Rightmove) or property services company.",
          targetEndorser: "Primary: Envestors (PropTech, SaaS platform). Alternative: Innovator International (property expertise). Rationale: Envestors has PropTech portfolio, understands SaaS metrics, connections to property technology investors.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, landlord testimonials. (2) Month 6: Growth metrics, rent collection data. (3) Month 12: Year 1 review, marketplace launch. (4) Month 18: Series A preparation, partnerships. (5) Month 24: Team growth, national expansion. (6) Month 30: Exit options, international.",
          experience: "Uniquely qualified: 5 years PropTech (Goodlord, Zoopla). Managed products serving 500K tenancies. Personal landlord (8 properties) - understands pain points firsthand. Deep expertise: property tech, product development, rental market. Industry connections: PropTech companies, landlord associations, contractors.",
          revenue: "Per-property subscription: £18/month (£216/year). Volume: £15/month for 20+ properties. Free tier: 2 properties. Contractor marketplace: 10% of job value. Insurance referrals: £50 per policy. Year 1: £72K ARR. Year 3: £840K ARR. Gross margin: 80%.",
        },
        { // GreenTech - Sustainability Platform - COMPREHENSIVE
          businessName: "GreenTech Analytics",
          industry: "CleanTech / Sustainability / ESG Technology",
          problem: "UK businesses face mandatory carbon reporting (SECR for companies 250+ employees, expanding to SMEs). 78% struggle to measure emissions accurately - currently relying on £10K+ consultants for annual snapshots. Data collection takes 200+ hours annually per company. 65% of investors now require ESG data, but companies lack real-time visibility.",
          innovationStage: "pre-mvp",
          productStatus: "Building automated carbon accounting platform. Technical MVP: Utility API integrations (electricity, gas), IoT sensor framework, calculation engine. 40 corporate expressions of interest. Partnerships with 2 utility data providers confirmed. Advisory board: 2 sustainability directors, 1 carbon consultant.",
          existingCustomers: "Pre-launch: 40 expressions of interest (companies 50-500 employees). Sectors: 15 manufacturing, 12 professional services, 8 retail, 5 logistics. Letters of intent: 8 companies (combined £65K pilot value). Advisory clients: 2 companies providing product feedback. Utility partnerships: 2 data providers confirmed.",
          tractionEvidence: "40 EOIs (companies with £10K+ current carbon costs). 8 LOIs signed (£65K pilot value). Utility partnerships: 2 major providers (access to 500K business meters). Technical: Calculation engine validated against GHG Protocol. Advisory board: Sustainability directors from FTSE 250 companies.",
          uniqueness: "Sustainability advantages: (1) Real-time carbon tracking (vs annual consultancy reports). (2) 90% cheaper than consultancy (£1K vs £10K annually). (3) Automated data collection (utility APIs, IoT). (4) SECR/TCFD compliance built-in. (5) AI reduction recommendations. (6) Scope 1, 2, and 3 coverage.",
          techStack: "Backend: Python, FastAPI, PostgreSQL. Data: Apache Kafka (streaming), AWS IoT Core. Calculations: GHG Protocol engine, DEFRA emission factors. Frontend: React, TypeScript. Integrations: Utility APIs (Octopus, n3rgy), IoT (MQTT protocol). Analytics: Custom sustainability dashboards.",
          dataArchitecture: "Data flow: Utility meters → API collection → Real-time processing → Emission calculation → Dashboard → Compliance reports. IoT: Sensors → MQTT → AWS IoT → Processing → Alerts. Scope 3: Supplier data collection portal → Aggregation → Reporting.",
          aiMethodology: "Reduction recommendations: ML model trained on energy efficiency interventions and outcomes across industry sectors. Anomaly detection: Identifies unusual consumption patterns for investigation. Prediction: Forecasts annual emissions for budgeting. Not core to platform - AI enhances insights.",
          complianceDesign: "GHG Protocol: Scope 1, 2, 3 methodology. SECR: Streamlined Energy and Carbon Reporting format. TCFD: Task Force on Climate-related Financial Disclosures alignment. SBTi: Science-Based Targets initiative compatible. ISO 14064: Verification-ready reports.",
          patentStatus: "UK Patent application: 'Real-Time Carbon Emission Aggregation System' (GB2024/034567, pending). Trade secrets: Utility API integrations, calculation optimizations documented. Trademark: 'GreenTech Analytics' application pending. Copyright: Platform code protected.",
          founderEducation: "MSc Environmental Engineering, Imperial College, 2019. BSc Mechanical Engineering, University of Ibadan, 2015 (First Class). Chartered Environmentalist (CEnv). AWS Solutions Architect certified. GHG Protocol certified.",
          founderWorkHistory: "Senior Sustainability Analyst, EY Climate Change (2019-2024): Led carbon accounting for 25 FTSE 350 companies. Energy Engineer, Siemens Smart Infrastructure (2017-2019): Building energy management systems. Graduate Engineer, Shell Nigeria (2015-2017): Emissions monitoring.",
          founderAchievements: "EY: Led carbon accounting for 25 FTSE 350 companies (combined £50M consulting fees). Identified £8M energy savings across client portfolio. Siemens: Deployed smart building systems (15% energy reduction). Chartered Environmentalist status. Speaker at COP26 side events. Published: 'Automated Carbon Accounting' (Journal of Cleaner Production).",
          relevantProjects: "EY: FTSE 350 carbon accounting (25 clients, £50M fees). Siemens: Smart building energy management (15% reduction achieved). Shell: Emissions monitoring and reporting systems. Imperial: Dissertation on IoT for environmental monitoring. Personal: Carbon calculator app (10K downloads).",
          funding: "150000",
          fundingSources: "£60,000 personal savings. £50,000 family investment (equity). £40,000 Innovate UK Net Zero Grant (reference: IUK-NZ-2024-789). Total: £150,000 for platform development and pilot customers.",
          monthlyProjections: "Year 1: Month 1-6: £0 revenue (pilot phase). Month 7-12: £12K/month (20 customers). Year 1: £72K revenue, £110K costs. Year 2: £50K/month (85 customers). Year 3: £150K/month (250 customers). Break-even Month 18. Year 3: £1.8M revenue.",
          customerAcquisitionCost: "1200",
          lifetimeValue: "21600",
          paybackPeriod: "2",
          detailedCosts: "Cloud infrastructure (AWS): £3K/month. Utility API fees: £2K/month. Staff (founder + engineer): £80K/year. Sales/marketing: £3K/month. IoT hardware (pilots): £10K. Compliance/verification: £8K. Total Year 1: £110K.",
          competitors: "1. Watershed (US, enterprise focus, expensive). 2. Normative (Swedish, EU focus). 3. Persefoni (US, finance sector). 4. Carbon Trust (consultancy, not software). 5. Sphera (enterprise, £50K+). Our advantage: UK SME focus, automated data collection, 90% cheaper.",
          competitiveDifferentiation: "90% cheaper than consultancy (£1K vs £10K). Real-time tracking (vs annual snapshots). Automated data collection (utility APIs, no manual input). UK regulation focus (SECR, TCFD). SME-sized pricing (not enterprise-only). Scope 3 supplier portal (comprehensive coverage).",
          customerInterviews: "45 interviews (25 sustainability managers, 20 CFOs/FDs). Findings: (1) Current consultancy is expensive and slow. (2) Real-time data would enable action. (3) Automation is key (no resource for manual). (4) Regulatory compliance driving urgency. (5) Would pay £5K-15K for automated solution.",
          lettersOfIntent: "8 LOIs signed: Combined £65K pilot value (£8K average). Sectors: 4 manufacturing, 2 professional services, 2 retail. Enterprise interest: 3 FTSE 350 companies in discussion. Reseller: Carbon consultancy interested in white-label.",
          willingnessToPay: "Platform pricing: £500/month (£6K/year) for 50-250 employees. Enterprise: £1.5K/month for 250-1,000 employees. Add-ons: Scope 3 supplier module £200/month, verification preparation £500. Survey: 78% sustainability managers accept pricing given automation benefit.",
          marketSize: "TAM: UK ESG/sustainability software £1.8B. SAM: Carbon accounting for mid-market £360M. SOM: Year 1: £72K (0.02% SAM). Year 3: £1.8M (0.5% SAM). Conservative given regulatory tailwinds and competition.",
          regulatoryRequirements: "GHG Protocol: Calculation methodology adherence. SECR: Reporting format compliance. TCFD: Disclosure framework alignment. ISO 14064: Verification-ready. GDPR: Business data protection. ICO: Registration completed.",
          complianceTimeline: "Month 1: GHG Protocol methodology audit. Month 3: SECR report template validation. Month 6: TCFD alignment assessment. Month 12: ISO 14064 pre-verification. Month 18: Third-party verification partnership.",
          complianceBudget: "25000",
          jobCreation: "16",
          hiringPlan: "Year 1: Founder + Data Engineer (£55K). Year 2: CTO (£75K), 2 Engineers (£110K), Sales (£50K), Customer Success (£40K). Year 3: Product Manager (£60K), 2 Engineers, Sustainability Advisor (£45K), Marketing (£45K). Total: 16 by Year 3.",
          specificRegions: "Year 1: London, South East (corporate HQ concentration). Year 2: Midlands, North West (manufacturing). Year 3: National, Scotland (strong sustainability focus). Focus: Multi-site companies for maximum utility API value.",
          expansion: "Products: Year 1: Scope 1 & 2. Year 2: Full Scope 3, ESG reporting. Year 3: Net zero planning, offset marketplace. Channels: Direct → Consultancy partnerships → Industry associations → Government frameworks.",
          internationalPlan: "Year 3: Ireland (similar regulations). Year 4: EU (CSRD compliance opportunity). Year 5: US (SEC climate disclosure rules). Strategy: Regulatory localization, utility API partnerships per market. Focus: UK Net Zero leadership before international.",
          vision: "5-year vision: UK's leading automated carbon accounting platform. 1,000 companies, £8M ARR, 45 employees. Known for: Automation, accuracy, affordability. Exit: Acquisition by ERP company (SAP, Oracle) or ESG data provider (MSCI, S&P Global).",
          targetEndorser: "Primary: Envestors (CleanTech, data platform). Alternative: Innovator International (sustainability expertise). Rationale: Envestors has strong CleanTech portfolio, understands data-driven platforms, connections to Net Zero investors.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, pilot customers. (2) Month 6: Customer expansion, data accuracy metrics. (3) Month 12: Year 1 review, enterprise deals. (4) Month 18: Scope 3 launch, partnerships. (5) Month 24: Team growth, Series A. (6) Month 30: International expansion, exit options.",
          experience: "Uniquely qualified: 5 years EY Climate Change (25 FTSE 350 clients). Deep expertise in carbon accounting, GHG Protocol, UK regulations. Engineering background (Siemens, Shell). Technical: Data engineering, IoT, cloud architecture. Industry connections: sustainability directors, regulators, consultancies. Chartered Environmentalist.",
          revenue: "Platform subscription: £500-1,500/month (by company size). Scope 3 add-on: £200/month. Verification prep: £500 one-time. Enterprise: Custom pricing. Implementation: £1K one-time. Year 1: £72K ARR. Year 3: £1.8M ARR. Gross margin: 80%.",
        },
      ],
    };
    
    const templates = industryTemplates[industry];
    if (!templates || !templates[templateIndex]) return;
    
    const selectedTemplateData = templates[templateIndex];
    
    // Base template data (shared across all industries) - realistic example values
    const baseTemplateData: Record<string, string> = {
      tier: 'premium',
      fullLegalName: userName,
      currentVisaStatus: "graduate-visa",
      visaExpiryDate: "15/03/2026",
      workAuthorizationDetails: "Graduate Visa holder. Full-time work permitted in any role. Self-employment and company directorship allowed. No sponsor required. 2 years remaining on current visa.",
      educationBackground: "MSc Data Science, Imperial College London, UK, 2023, Distinction. Dissertation: 'Machine Learning Applications in Financial Forecasting'. BSc Computer Science, University of Lagos, Nigeria, 2020, First Class Honours.",
      professionalCertifications: "AWS Solutions Architect Professional (2023). Google Cloud Professional Data Engineer (2022). Certified Scrum Master (2021). PRINCE2 Practitioner (2020).",
      totalProfessionalExperience: "5",
      industryExperience: "5 years in technology and data science. 2020-2021: Junior Data Analyst at Andela Nigeria (1 year) - built reporting dashboards, analyzed 500K+ user records. 2021-2023: Data Scientist at Barclays UK (2 years) - developed ML models for fraud detection, reduced false positives by 28%. 2023-present: Founder/CTO (2 years) - building AI-powered platform, secured 8 pilot customers.",
      technicalSkillsProficiency: "Python (9/10), JavaScript (8/10), SQL (9/10), AWS (8/10), React (7/10), Machine Learning (8/10), Data Engineering (8/10), Product Management (7/10), Business Development (7/10), Team Leadership (8/10).",
      languagesSpoken: "English (Native), Igbo (Native), French (Conversational - B1 CEFR).",
      linkedInProfile: "https://linkedin.com/in/ebuka-umeh-data-scientist",
      portfolioUrl: "https://github.com/ebukatech | https://ebukatech.dev",
      existingCustomers: "8 pilot customers actively testing platform. 3 paying beta users (£200/month each). 45 waitlist sign-ups. Testimonial: 'This solves a problem we've had for years' - Sarah Chen, Operations Director, TechFlow Ltd.",
      tractionEvidence: "Platform: 1,200 active sessions, 89% completion rate. Pilots: 8 companies, combined £24K committed revenue. User feedback: 4.6/5 satisfaction score from 34 survey responses. Revenue: £7.2K collected to date.",
      dataArchitecture: "AWS-based architecture: Lambda for serverless compute, RDS PostgreSQL for primary data, S3 for document storage. Open Banking integration via TrueLayer API. Accounting software webhooks (Xero, QuickBooks). Real-time data processing with Kafka.",
      aiMethodology: "XGBoost for classification tasks (92% accuracy on test data). Prophet for time-series forecasting (MAPE: 8.3%). Fine-tuned GPT-4 for document extraction (94% field accuracy). Training data: 50K anonymized business records.",
      complianceDesign: "GDPR-compliant data processing with user consent management. FCA regulatory sandbox participant. ISO 27001 security practices. Data encryption at rest (AES-256) and in transit (TLS 1.3). Annual penetration testing.",
      patentStatus: "Patent pending: 'AI-driven document extraction for business applications' (UK Patent Application GB2401234.5, filed January 2024). Provisional protection in place.",
      founderEducation: "MSc Data Science, Imperial College London (2023, Distinction). BSc Computer Science, University of Lagos (2020, First Class). Academic prizes: Dean's List (Imperial), Best Final Year Project (Lagos).",
      founderWorkHistory: "2023-present: Founder/CTO (current venture). 2021-2023: Data Scientist, Barclays UK (fraud detection, ML deployment). 2020-2021: Data Analyst, Andela (reporting, user analytics).",
      founderAchievements: "Barclays: Reduced fraud false positives 28% (£2M annual savings). Built ML pipeline processing 5M transactions/day. Led team of 4 data scientists. Imperial: Distinction grade, dissertation published. Lagos: First Class Honours, Best Project award.",
      relevantProjects: "Barclays fraud detection (ML, £2M impact). Personal fintech app (10K downloads). Open-source data library (2K GitHub stars). Imperial research (financial forecasting). Freelance consulting (12 SME clients).",
      funding: "100000",
      fundingSources: "£40,000 personal savings (from Barclays salary). £30,000 family investment (formal loan agreement at 5% interest). £30,000 Innovate UK Smart Grant (application submitted, decision pending Q2 2026). Total: £100,000 for 18-month runway.",
      monthlyProjections: "Year 1: Month 1-3: £0 revenue (building), £8K/month costs. Month 4-6: £3K/month revenue, £10K costs. Month 7-12: £8K/month revenue, £12K costs. Year 1 total: £66K revenue, £120K costs. Year 2: £25K/month revenue, £18K/month costs, Year 2 total: £300K revenue, £216K costs. Year 3: £60K/month revenue, £35K/month costs, Year 3 total: £720K revenue, £420K costs. Break-even Month 18.",
      customerAcquisitionCost: "150",
      lifetimeValue: "2500",
      paybackPeriod: "4",
      detailedCosts: "Development: £45K (cloud hosting £12K, tools £8K, contractor support £25K). Marketing: £25K (content £10K, events £8K, paid ads £7K). Operations: £15K (legal £8K, accounting £4K, insurance £3K). Team: £35K (founder salary £25K, part-time support £10K). Total Year 1: £120K.",
      competitors: "Competitor 1: Xero (global, £25B market cap) - comprehensive but SME-focused, lacks AI features. Competitor 2: Sage (UK incumbent) - strong brand, dated interface. Competitor 3: FreeAgent (UK, £50M revenue) - simple, limited automation. Competitor 4: Wave (US, free model) - basic features only. Competitor 5: Pennylane (France) - AI-focused, no UK presence. Our advantage: AI-native, UK-specific, mid-market focus.",
      competitiveDifferentiation: "75% faster than manual processes (validated in pilots). 90% cheaper than enterprise solutions (£200/month vs £2,000). AI accuracy 94% (vs 80% industry standard). UK-specific compliance built-in. Customer support within 4 hours (vs 24-48 hours for competitors).",
      customerInterviews: "45 interviews conducted (25 SME owners, 12 accountants, 8 finance directors). Key findings: (1) Manual processes waste 10+ hours/week. (2) Existing tools too complex or too basic. (3) AI features highly desired but trust is crucial. (4) Price sensitivity: £100-300/month acceptable for proven ROI. (5) UK compliance is non-negotiable.",
      lettersOfIntent: "6 LOIs signed: TechFlow Ltd (£12K/year pilot), Northern Manufacturing Co (£8K/year), Bristol Retail Group (£6K/year), Cambridge Innovation Ltd (£4K/year), Leeds Professional Services (£4K/year), Manchester Digital Agency (£2K/year). Total: £36K committed annual value.",
      willingnessToPay: "Survey (n=120): 78% would pay £150-250/month for described solution. 45% would pay premium for AI features. Pilot conversion: 8 of 12 approached companies signed LOIs (67%). Price elasticity: 10% drop in conversion per £50 increase above £200.",
      marketSize: "TAM: UK business software market £8.5B (2024). SAM: SME financial software £1.2B. SOM: Year 1: £66K (50 customers at £110/month average). Year 3: £720K (400 customers). Year 5: £2.4M (1,000 customers at £200/month).",
      regulatoryRequirements: "FCA: Open Banking compliance, registered with ICO. GDPR: Data protection impact assessment completed. HMRC: MTD-compatible. Cyber Essentials Plus certification required. PCI DSS Level 4 for payment handling.",
      complianceTimeline: "Month 1-2: GDPR audit and documentation. Month 3-4: ICO registration, Cyber Essentials. Month 5-6: FCA sandbox application. Month 7-12: PCI DSS preparation. Year 2: Full FCA authorization if required.",
      complianceBudget: "50000",
      jobCreation: "12",
      hiringPlan: "Year 1: CTO/Founder (£25K), Part-time developer (£15K). Year 2: Full-stack developer (£55K), Customer Success (£35K), Sales (£45K + commission). Year 3: Senior Developer (£65K), Marketing Manager (£45K), Operations (£35K), 2 Junior Developers (£70K total). Total: 12 employees by Year 3.",
      specificRegions: "Year 1: London, South East (SME concentration). Year 2: Manchester, Birmingham, Bristol (tech hubs). Year 3: Edinburgh, Leeds, nationwide remote. Focus: Areas with high SME density and tech adoption.",
      expansion: "Products: Year 1: Core platform. Year 2: API for accountants, mobile app. Year 3: AI assistant, integrations marketplace. Sectors: Year 1: Professional services. Year 2: Retail, e-commerce. Year 3: Manufacturing, hospitality.",
      internationalPlan: "Year 4: Ireland (similar regulatory environment, English-speaking). Year 5: EU expansion (Netherlands, Germany - strong SME sectors). Strategy: Establish UK leadership first, then regulatory localization for each market.",
      vision: "5-year vision: UK's leading AI-powered business platform for SMEs. 1,000+ active customers, £2.4M ARR, 25 employees. Known for: automation, accuracy, customer service. Potential exit: acquisition by major accounting software provider or private equity.",
      targetEndorser: "Primary: Envestors (strong track record with FinTech, data companies). Alternative: Innovator International (broader business focus). Rationale: Envestors's network includes key investors, proven support for similar ventures.",
      contactPointsStrategy: "6 structured engagement points: (1) Month 2: Initial application, product demo, pilot customers evidence. (2) Month 6: Progress report - customer traction, revenue metrics. (3) Month 12: Annual review - team growth, product milestones. (4) Month 18: Expansion update - new products, market growth. (5) Month 24: Scale report - funding round, partnerships. (6) Month 30: Exit planning discussion.",
      experience: "Uniquely qualified: 5 years data science experience at Barclays (enterprise ML deployment). MSc from Imperial College (research-grade technical skills). Nigerian market experience (emerging market perspective). Built and launched products used by 10K+ users. Network of 200+ SME contacts from customer discovery.",
      revenue: "SaaS subscription: Basic £99/month, Pro £199/month, Enterprise £499/month. Add-ons: Premium support £50/month, API access £100/month, Custom integrations from £500. Unit economics: LTV £2,500, CAC £150, Payback 4 months. Year 1: £66K ARR. Year 3: £720K ARR.",
    };
    
    // Merge base template with industry-specific data
    const finalTemplateData = { ...baseTemplateData, ...selectedTemplateData };
    
    // Update formData and savedData synchronously to prevent race condition with useEffect
    setFormData(finalTemplateData);
    saveAllFields(finalTemplateData);
    
    const industryName = INDUSTRY_TEMPLATES[industry as keyof typeof INDUSTRY_TEMPLATES]?.name || industry;
    const templateName = INDUSTRY_TEMPLATES[industry as keyof typeof INDUSTRY_TEMPLATES]?.templates[templateIndex] || 'Template';
    
    toast({
      title: `${templateName} Template Loaded`,
      description: `Industry: ${industryName}. All fields prefilled with realistic example data. Replace each section with your own details.`,
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

        {/* Load Demo Template - Auto-fill form with sample data */}
        {currentStep === 0 && (
          <Card className="p-4 mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-sm mb-1 text-primary">Quick Start Template</h3>
                <p className="text-xs text-muted-foreground">
                  {isFounderAccount 
                    ? "Load your saved business plan data to continue where you left off."
                    : "Choose your industry to load a relevant template. Use it as a guide for structuring your own responses."}
                </p>
              </div>
              <Button
                onClick={() => isFounderAccount ? handleEbukaUltimatePlanAutoFill() : setShowTemplateModal(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                data-testid="button-load-demo-template"
              >
                {isFounderAccount ? "Load My Data" : "Choose Template"}
              </Button>
            </div>
          </Card>
        )}
        
        {/* Template Selection Modal - For non-founder users */}
        <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Choose Your Industry Template</DialogTitle>
              <DialogDescription>
                Select the industry closest to your business to get a relevant example template. All templates contain realistic example data to guide your application.
              </DialogDescription>
            </DialogHeader>
            
            {!selectedIndustry ? (
              <div className="grid gap-3 mt-4">
                {Object.entries(INDUSTRY_TEMPLATES).map(([key, industry]) => {
                  const IconComponent = industry.icon;
                  return (
                    <Card 
                      key={key}
                      className="p-4 cursor-pointer hover-elevate border-2 border-transparent hover:border-primary/50 transition-all"
                      onClick={() => setSelectedIndustry(key)}
                      data-testid={`industry-${key}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{industry.name}</h4>
                          <p className="text-sm text-muted-foreground">{industry.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground mt-1" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedIndustry(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Industries
                </Button>
                
                <h4 className="font-semibold mb-3">
                  Top 3 Templates for {INDUSTRY_TEMPLATES[selectedIndustry as keyof typeof INDUSTRY_TEMPLATES]?.name}
                </h4>
                
                <div className="grid gap-3">
                  {INDUSTRY_TEMPLATES[selectedIndustry as keyof typeof INDUSTRY_TEMPLATES]?.templates.map((template, index) => (
                    <Card 
                      key={template}
                      className="p-4 cursor-pointer hover-elevate border-2 border-transparent hover:border-primary/50 transition-all"
                      onClick={() => {
                        handleLoadIndustryTemplate(selectedIndustry, index);
                        setShowTemplateModal(false);
                        setSelectedIndustry(null);
                      }}
                      data-testid={`template-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h5 className="font-medium">{template}</h5>
                          <p className="text-xs text-muted-foreground">
                            Click to load this template with example data
                          </p>
                        </div>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Auto-fill from Documents Sheet */}
        <Sheet open={showAutoFillDrawer} onOpenChange={setShowAutoFillDrawer}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Auto-fill from Documents
              </SheetTitle>
              <SheetDescription>
                Select documents to extract data and auto-fill the form fields.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Document selection */}
              {!showExtractedFields && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Select Documents</h4>
                    {userDocuments.length === 0 ? (
                      <Card className="p-4 text-center">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No documents uploaded yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload documents in the Document Vault first
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {userDocuments.map((doc: any) => (
                          <Card 
                            key={doc.id} 
                            className={`p-3 cursor-pointer transition-all ${selectedDocIds.includes(doc.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                            onClick={() => handleToggleDocument(doc.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={selectedDocIds.includes(doc.id)}
                                onCheckedChange={() => handleToggleDocument(doc.id)}
                              />
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{doc.category?.replace('_', ' ')}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress display during extraction */}
                  {isExtracting && (
                    <Card className="p-4 bg-primary/5 border-primary/20" data-testid="extraction-progress-container">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          {/* Circular progress indicator */}
                          <svg className="w-12 h-12 -rotate-90" data-testid="extraction-progress-circle">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="text-muted/20"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="text-primary"
                              strokeLinecap="round"
                              strokeDasharray={`${Math.min((extractionElapsed / extractionEstimate) * 125, 125)} 125`}
                            />
                          </svg>
                          <Loader2 className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm" data-testid="text-extraction-status">Analyzing Document</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-extraction-stage">
                            {extractionElapsed < 30 && "Reading pages..."}
                            {extractionElapsed >= 30 && extractionElapsed < 60 && "Extracting business data..."}
                            {extractionElapsed >= 60 && extractionElapsed < 90 && "Processing financials..."}
                            {extractionElapsed >= 90 && extractionElapsed < 120 && "Finalizing extraction..."}
                            {extractionElapsed >= 120 && "Almost done, processing large document..."}
                          </p>
                        </div>
                      </div>
                      
                      {/* Timer display */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground" data-testid="text-elapsed-time">
                          Elapsed: {Math.floor(extractionElapsed / 60)}:{(extractionElapsed % 60).toString().padStart(2, '0')}
                        </span>
                        <span className="text-muted-foreground" data-testid="text-remaining-time">
                          {extractionElapsed < extractionEstimate 
                            ? `Est. ~${Math.max(1, Math.ceil((extractionEstimate - extractionElapsed) / 60))}:${Math.max(0, (extractionEstimate - extractionElapsed) % 60).toString().padStart(2, '0')} remaining`
                            : "Finishing up..."
                          }
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden" data-testid="extraction-progress-bar">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((extractionElapsed / extractionEstimate) * 100, 95)}%` }}
                        />
                      </div>
                    </Card>
                  )}

                  {/* Extract button - always visible */}
                  <Button 
                    onClick={handleExtractFromDocuments}
                    disabled={selectedDocIds.length === 0 || isExtracting}
                    className="w-full"
                    data-testid="button-extract-documents"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Extract Data ({selectedDocIds.length} selected)
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Extracted data review */}
              {showExtractedFields && extractedData && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Extracted Fields</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setShowExtractedFields(false);
                          setExtractedData(null);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {Object.entries(extractedData).map(([field, value]) => (
                        <Card key={field} className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                {getFieldLabel(field)}
                              </span>
                              {extractionConfidence[field] && (
                                <Badge 
                                  variant={extractionConfidence[field] >= 80 ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {extractionConfidence[field]}% confident
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm truncate">
                              {String(value).slice(0, 100)}{String(value).length > 100 ? '...' : ''}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowAutoFillDrawer(false);
                        setExtractedData(null);
                        setShowExtractedFields(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleApplyExtractedData}
                      data-testid="button-apply-extracted"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply All
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Auto-fill button */}
        {userDocuments.length > 0 && (
          <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
            <div className="flex gap-4 items-center justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="font-bold text-sm">Auto-fill Available</h3>
                  <p className="text-xs text-muted-foreground">
                    You have {userDocuments.length} document{userDocuments.length !== 1 ? 's' : ''} that can be used to auto-fill this form
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowAutoFillDrawer(true)}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
                data-testid="button-open-autofill"
              >
                <Upload className="h-4 w-4 mr-2" />
                Auto-fill from Documents
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
            <h2 className="font-serif text-xl font-bold mb-2">{currentStepData.title}</h2>
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

          {/* Promo Code Section - Show on final step ONLY if user needs to pay (not free tier, not active subscription) */}
          {currentStep === steps.length - 1 && !canGenerateDirectly && (
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
          
          {/* Show subscription status for paid users or free tier */}
          {currentStep === steps.length - 1 && canGenerateDirectly && (
            <div className="mt-8 pt-6 border-t">
              <Badge className="bg-emerald-500 text-white">
                <Check className="w-3 h-3 mr-1" />
                {isFreeTier ? "Free Plan - Generate your 10-15 page business overview" : `${user?.subscriptionTier?.charAt(0).toUpperCase()}${user?.subscriptionTier?.slice(1)} Member - No payment required`}
              </Badge>
            </div>
          )}
          
          {/* Theme Selection Status - Show on final step */}
          {currentStep === steps.length - 1 && (
            <div className="mt-6 pt-6 border-t">
              {themeApplied && selectedTheme ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  {/* Show custom cover image preview or color swatch */}
                  {selectedTheme.backgroundImage && selectedTheme.useFullCoverImage ? (
                    <div className="w-16 h-20 rounded-lg border-2 border-background shadow overflow-hidden flex-shrink-0">
                      <img 
                        src={selectedTheme.backgroundImage} 
                        alt="Custom cover preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-background shadow flex-shrink-0"
                      style={{ backgroundColor: selectedTheme.primaryColor }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-emerald-700 dark:text-emerald-300">Theme Applied</p>
                    {/* Show theme name */}
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedTheme.themeId === 'custom-cover' || (selectedTheme.backgroundImage && selectedTheme.useFullCoverImage)
                        ? 'Custom Cover Image (Canva)'
                        : THEME_TEMPLATES.find(t => t.id === selectedTheme.themeId)?.name || selectedTheme.themeId || 'Custom Theme'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTheme.font} font • {selectedTheme.primaryColor}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/theme-selection')}
                    data-testid="button-change-theme"
                    className="flex-shrink-0"
                  >
                    Change Theme
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6 text-amber-600" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-700 dark:text-amber-300">Choose Your Business Plan Theme</p>
                      <p className="text-sm text-muted-foreground">
                        Select a professional template before generating your plan
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 gap-2 bg-emerald-500 text-white font-semibold shadow-md"
                    onClick={() => setLocation('/theme-selection')}
                    data-testid="button-choose-template"
                  >
                    <Palette className="w-4 h-4" />
                    Choose Template
                  </Button>
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
            {currentStep === steps.length - 1 && !themeApplied ? (
              <Button 
                className="gap-2 bg-emerald-500 text-white font-semibold shadow-md"
                onClick={() => setLocation('/theme-selection')}
                data-testid="button-next"
              >
                Choose Template First
                <Palette className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                disabled={isSubmitting}
                data-testid="button-next"
              >
                {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? (canGenerateDirectly ? "Generate Plan" : "Proceed to Payment") : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
