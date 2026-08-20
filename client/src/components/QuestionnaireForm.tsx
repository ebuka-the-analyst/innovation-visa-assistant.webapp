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
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Tag, Check, X, Loader2, Save, RotateCcw, Building2, Stethoscope, ShoppingBag, Laptop, Lightbulb, FileText, Upload, Sparkles, ChevronDown, ChevronUp, Palette, Lock } from "lucide-react";
import { FieldEnhancer } from "@/components/FieldEnhancer";
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
    templates: ["LegalTech Venture Outline", "LegalAI - Document Analysis", "ComplianceFlow - Regulatory Automation"],
    locked: true
  },
  fintech: {
    name: "FinTech / Financial Services",
    icon: Building2,
    description: "AI-powered financial tools, payment solutions, lending platforms",
    templates: ["FinFlow AI - Cash Flow Forecasting", "PaymentPro - B2B Payments", "LendSmart - SME Lending"],
    locked: true
  },
  healthtech: {
    name: "HealthTech / MedTech",
    icon: Stethoscope,
    description: "Healthcare AI, digital health platforms, medical devices",
    templates: ["CareAI - Patient Management", "MedAssist - Clinical Decision Support", "HealthFlow - NHS Integration"],
    locked: true
  },
  ecommerce: {
    name: "E-commerce / Retail Tech",
    icon: ShoppingBag,
    description: "Retail platforms, marketplace solutions, inventory management",
    templates: ["ShopSmart - AI Recommendations", "RetailFlow - Inventory Optimization", "MarketPro - Marketplace Platform"],
    locked: true
  },
  saas: {
    name: "SaaS / B2B Software",
    icon: Laptop,
    description: "Business software, productivity tools, enterprise solutions",
    templates: ["TeamFlow - Collaboration Platform", "DataSync - Integration Platform", "AutomateHQ - Workflow Automation"],
    locked: true
  },
  foodbev: {
    name: "Food & Beverage",
    icon: ShoppingBag,
    description: "Innovative food products, sustainable packaging, new production methods",
    templates: ["GreenBite - Plant-Based Foods", "BrewCraft - Artisan Beverages", "FreshPack - Sustainable Packaging"],
    locked: true
  },
  manufacturing: {
    name: "Manufacturing & Products",
    icon: Building2,
    description: "New manufacturing processes, sustainable products, innovative materials",
    templates: ["EcoMake - Sustainable Manufacturing", "SmartBuild - Construction Innovation", "CleanMaterials - Eco Products"],
    locked: true
  },
  creative: {
    name: "Creative & Media",
    icon: Lightbulb,
    description: "Content innovation, new distribution models, creative services",
    templates: ["StoryStream - Content Platform", "ArtConnect - Creative Marketplace", "MediaFlow - Distribution Innovation"],
    locked: true
  },
  services: {
    name: "Professional Services",
    icon: Building2,
    description: "Innovative consulting, new service delivery, business solutions",
    templates: ["ConsultX - Advisory Platform", "TalentBridge - Recruitment Innovation", "ServicePro - B2B Solutions"],
    locked: true
  },
  social: {
    name: "Social Enterprise",
    icon: Lightbulb,
    description: "Impact-driven businesses, community solutions, sustainability",
    templates: ["ImpactFirst - Social Innovation", "CommunityHub - Local Solutions", "GreenFuture - Sustainability Venture"],
    locked: true
  },
  other: {
    name: "Other Innovative Sectors",
    icon: Lightbulb,
    description: "EdTech, PropTech, CleanTech, Fashion, Tourism, or other",
    templates: ["EduAI - Learning Platform", "PropFlow - Property Management", "GreenTech - Sustainability Platform"],
    locked: true
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
      { name: "relevantProjects", label: "Projects Directly Relevant to This Business", type: "textarea", required: true, minLength: 100, help: "Describe only projects you personally delivered and explain how they demonstrate relevant domain expertise." },
    ],
  },
  {
    id: 4,
    title: "Financial Model & Unit Economics",
    description: "Build a realistic, evidence-backed financial model for this venture.",
    fields: [
      { name: "funding", label: "Initial Capital Available (£)", type: "number", required: true },
      { name: "fundingSources", label: "Detailed Funding Sources", type: "textarea", required: true, minLength: 100, help: "List each funding source, amount and supporting evidence. Do not include funding that is not secured or documented." },
      { name: "monthlyProjections", label: "36-Month Monthly Cashflow", type: "textarea", required: true, minLength: 200, help: "Provide month-by-month revenue, costs and cash position for 36 months, using assumptions you can explain and evidence." },
      { name: "customerAcquisitionCost", label: "Customer Acquisition Cost (CAC) in £", type: "number", required: true },
      { name: "lifetimeValue", label: "Customer Lifetime Value (LTV) in £", type: "number", required: true },
      { name: "paybackPeriod", label: "Customer Payback Period (months)", type: "number", required: true, help: "State the expected payback period and explain the assumptions behind it." },
      { name: "detailedCosts", label: "Detailed Cost Breakdown", type: "textarea", required: true, minLength: 150, help: "Break down development, regulatory, staffing, marketing and operating costs that genuinely apply to your business." },
    ],
  },
  {
    id: 5,
    title: "Competitive Analysis",
    description: "Use named, verifiable competitors and evidence-based comparisons.",
    fields: [
      { name: "competitors", label: "Named Competitors", type: "textarea", required: true, minLength: 150, help: "For each relevant competitor, record verifiable strengths, weaknesses, pricing where public, and target market." },
      { name: "competitiveDifferentiation", label: "Your Measurable Competitive Advantage", type: "textarea", required: true, minLength: 150, help: "Use only measurable advantages you can substantiate with your own evidence or cited public sources." },
    ],
  },
  {
    id: 6,
    title: "Market Validation & Customer Evidence",
    description: "Customer validation is important evidence. Record only validation you actually carried out.",
    fields: [
      { name: "customerInterviews", label: "Customer Discovery Evidence", type: "textarea", required: true, minLength: 150, help: "Summarise the customer discovery you actually completed, including participants, method, findings and evidence." },
      { name: "lettersOfIntent", label: "Letters of Intent or Pilot Agreements (if any)", type: "textarea", required: false, help: "Describe genuine letters of intent, pilots or partnership evidence and reference the supporting documents." },
      { name: "willingnessToPay", label: "Willingness to Pay Evidence", type: "textarea", required: true, minLength: 100, help: "Provide genuine willingness-to-pay evidence such as surveys, pilots, signed agreements or paid transactions." },
      { name: "marketSize", label: "Market Size Calculation (TAM/SAM/SOM)", type: "textarea", required: true, minLength: 100, help: "Show how you calculated TAM, SAM and SOM. Cite the source and date for external market data." },
    ],
  },
  {
    id: 7,
    title: "Regulatory & Compliance Planning",
    description: "Identify the regulatory and compliance requirements that actually apply to your business.",
    fields: [
      { name: "regulatoryRequirements", label: "All Regulatory Requirements", type: "textarea", required: true, minLength: 150, help: "List only applicable regulatory requirements and cite the official or authoritative source for each one." },
      { name: "complianceTimeline", label: "Compliance Timeline", type: "textarea", required: true, minLength: 100, help: "Build a realistic compliance timeline based on the requirements that apply to your business and the current guidance from the relevant authority." },
      { name: "complianceBudget", label: "Total Compliance Budget (£)", type: "number", required: true, help: "Estimate your compliance budget from current quotes, fees and documented assumptions." },
    ],
  },
  {
    id: 8,
    title: "Scalability & Growth Strategy",
    description: "Vague expansion plans flagged. Name specific regions.",
    fields: [
      { name: "jobCreation", label: "Job Creation Target (3 years)", type: "number", required: true },
      { name: "hiringPlan", label: "Detailed Hiring Plan", type: "textarea", required: true, minLength: 150, help: "List the roles, timing, salary assumptions and business milestones that support each hire." },
      { name: "specificRegions", label: "Specific Geographic Targets", type: "textarea", required: true, minLength: 50, help: "Name the specific regions you intend to target and explain the evidence for choosing them." },
      { name: "expansion", label: "Market Expansion Strategy", type: "textarea", required: true, minLength: 100 },
      { name: "internationalPlan", label: "International Expansion (optional)", type: "textarea", required: false, help: "Only include if you're market-validated in UK first. Otherwise this suggests poor strategic thinking." },
      { name: "vision", label: "5-Year Vision", type: "textarea", required: true, minLength: 100 },
    ],
  },
  {
    id: 9,
    title: "Endorser Strategy",
    description: "Show that your endorser strategy is based on the current official endorsing-body information.",
    fields: [
      { name: "targetEndorser", label: "Target Endorsing Body", type: "textarea", required: true, minLength: 30, help: "Select from the current official endorsing-body information and explain why the chosen route fits your business." },
      { name: "contactPointsStrategy", label: "Endorser Contact Point Strategy", type: "textarea", required: true, minLength: 100, help: "Describe how you will meet the contact-point and monitoring requirements specified by your endorsing body and current route guidance." },
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
  
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string; firstName?: string; lastName?: string; isAdmin?: boolean; subscriptionTier?: string; subscriptionStatus?: string }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  const isAdminUser = user?.isAdmin === true;
  
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
  
  // Templates unlocked for Ultimate tier users only
  const isTemplatesUnlocked = user?.subscriptionTier === 'ultimate';
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleIndustryClick = (industryKey: string) => {
    if (isTemplatesUnlocked) {
      setSelectedIndustry(industryKey);
    } else {
      setShowUpgradePrompt(true);
    }
  };
  const isOwner = false;
  const handleOwnerPrefill = () => {
    toast({
      title: "Personal prefill is disabled",
      description: "Use your saved profile or document auto-fill so application answers always come from your own evidence.",
    });
  };
  
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
  const isFounderAccount = false;

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
      contactPointsStrategy: 'Endorser Contact Point Strategy',
      
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
      competitors: 'Named Competitors',
      competitiveDifferentiation: 'Your Measurable Competitive Advantage',
      customerInterviews: 'Customer Discovery Evidence',
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
    // Functional update avoids stale closure overwriting sibling fields
    setFormData(prev => ({ ...prev, [name]: value }));
    // Write directly to localStorage immediately — no debounce, so data is
    // NEVER lost even if the user navigates away or closes the tab instantly
    try {
      const raw = localStorage.getItem('autosave_questionnaire-form');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('autosave_questionnaire-form', JSON.stringify({ ...current, [name]: value }));
    } catch { /* silently ignore storage errors */ }
    // Also update the autosave hook state (triggers re-renders across hooks)
    saveField(name, value);
  };
  const handleTestAutoFill = () => {
    toast({
      title: "Demo evidence autofill removed",
      description: "For safety, the questionnaire no longer inserts invented traction, financial, customer, patent or regulatory claims.",
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
        "PROPRIETARY AI ARCHITECTURE - WORLD'S FIRST MULTI-LLM VISA ORCHESTRATOR: Unlike any existing solution, our platform features an 'Expert AI Command Orchestrator' - a novel architecture integrating Qwen AI simultaneously across multiple specialized models. This multi-model approach provides: (a) Redundancy - if one AI provider fails, the other maintains service, (b) Quality validation - responses cross-checked between models, (c) Specialized routing - compliance questions to GPT-4 (stronger reasoning), creative content to Gemini (faster generation). Four specialized AI agents work in concert: SAGE (Compliance Agent) - validates against November 2025 Home Office requirements, NOVA (Innovation Agent) - assesses uniqueness and market differentiation, STERLING (Financial Agent) - analyzes viability and projections, ATLAS (Growth Agent) - evaluates scalability potential. This orchestration methodology is patent-pending.\n\n" +
        "UNIQUE TECHNICAL INNOVATIONS: (1) REAL-TIME COMPLIANCE INTELLIGENCE GRAPH - A dynamic knowledge graph mapping user inputs directly to 47 specific Home Office visa criteria (updated November 2025). Visual dashboard shows compliance score (0-100%) with specific improvement recommendations. No other tool provides this granular mapping. (2) EVIDENCE STRENGTH SCORING SYSTEM - Proprietary algorithm analyzing 8 critical endorser rejection reasons (identified through analysis of 200+ rejection letters). Provides actionable feedback: 'Your traction evidence scores 3/10 - add customer testimonials, revenue proof, or LOIs to improve.' (3) INDUSTRY-ADAPTIVE INTAKE SYSTEM - Questionnaire dynamically adjusts based on 6 industry sectors (Technology, Healthcare, Finance, Retail, Manufacturing, Services), asking sector-specific questions about regulatory requirements, market dynamics, and competitive landscapes. (4) SMART DOCUMENT GENERATION ENGINE - AI-powered templates that generate personalized, endorser-ready documents including: 60-80 page business plans, financial projection spreadsheets, pitch decks, personal statements, supporting evidence portfolios. Documents formatted to exact endorsing body specifications.\n\n" +
        "PRODUCTION-READY FEATURE SET: User Authentication - Dual-method (email/password + Google OAuth 2.0) with Cloudflare Turnstile bot protection, email verification, secure password reset. Payment Processing - Full Stripe integration with checkout, webhooks, subscription management, promo codes, referral system. 5-Tier Access Control - Bulletproof system (Free/Basic/Premium/Enterprise/Ultimate) with real-time access verification, upgrade prompts, and zero-loophole security. Data Persistence - PostgreSQL database (Neon serverless) with Drizzle ORM, auto-save functionality, progress restoration across sessions. Export Capabilities - PDF generation (jspdf), Word documents (docx library), QR code mobile transfer for cross-device access. UI/UX Excellence - Mobile-responsive design, dark mode support, accessibility compliance (WCAG 2.1), professional animations (Framer Motion).\n\n" +
        "TECHNICAL ARCHITECTURE: Frontend: React 18.3, TypeScript 5.0, TailwindCSS 4.0, shadcn/ui component library, Wouter routing, TanStack Query v5 for state management. Backend: Node.js 20 LTS, Express.js 4.21, RESTful API architecture, session-based authentication with PostgreSQL store. Database: PostgreSQL 16 (Neon serverless), Drizzle ORM with type-safe queries, optimized indexes for performance. AI Integration: Qwen API (qwen-plus, qwen-turbo, qwen-vl-plus), custom prompt engineering with immigration-specific context injection. Security: HTTPS encryption, bcrypt password hashing, CSRF protection, rate limiting, input sanitization. DevOps: Automated CI/CD, environment variable management, error tracking, usage analytics.\n\n" +
        "MEASURABLE PLATFORM METRICS (30-day post-launch): 99.8% uptime (exceeds 99.5% SLA target), <200ms average API response time, 47 registered users organically acquired (£0 marketing spend), 156 tool interactions tracked, 23-minute average session duration (indicates high engagement), 68% return user rate, 12 complete business plans generated. Platform handles concurrent users without degradation.\n\n" +
        "COMPETITIVE ADVANTAGE SUMMARY: This is not a template library or generic visa guide - it is a sophisticated AI-powered platform purpose-built for the Innovator Founder Visa route. The combination of multi-LLM orchestration, real-time compliance mapping, evidence strength scoring, and industry-adaptive intelligence represents a genuine technological innovation in the immigration technology space. No comparable solution exists in the UK market.",
      existingCustomers: "Platform launched November 2025. Current users: 47 registered accounts (free tier exploration). 12 users actively using Business Plan Generator tool. 3 beta testers providing detailed feedback (documented). Letters of Interest received from: (1) Lagos Immigration Consultancy (Nigeria) - interested in white-label partnership, (2) Tech Entrepreneur Network Manchester - interested in recommending to members, (3) Leeds Beckett University International Office - exploring student entrepreneur support integration.",
      tractionEvidence: "47 registered users (first 30 days). 12 active business plan generations. 156 tool interactions tracked. 3 Letters of Interest representing potential £24K Year 1 partnership revenue. User feedback: 'Finally, an affordable alternative to expensive lawyers' - Beta User, Nigeria. 'The AI document review saved me hours of work' - Beta User, India. Platform uptime: 99.8%. Average session duration: 23 minutes. Return user rate: 68%. SEO: Ranking top 10 for 'UK Innovator Founder Visa tools' within 4 weeks.",
      uniqueness: "UNIQUE INNOVATIONS: (1) FIRST comprehensive AI-powered Innovator Founder Visa platform - no existing platform provides 109+ tools specifically for this visa route. (2) Multi-model Qwen AI architecture (qwen-plus, qwen-turbo, qwen-vl-plus) for enhanced response quality. (3) Real-time compliance intelligence graph mapping directly to Home Office criteria (November 2025 guidance). (4) Expert AI Orchestrator with 4 specialized agents (Sage Compliance, Nova Innovation, Sterling Financial, Atlas Growth). (5) 90%+ cost reduction: £15-129 vs £3,000-15,000 traditional services. (6) 24/7 instant access vs weeks of lawyer waiting time. (7) Industry-adaptive intake system analyzing 6 major sectors. (8) Evidence Strength Scoring system targeting the 8 critical endorser rejection reasons. (9) Self-service model eliminating geographic constraints - global accessibility. (10) Patent-pending methodology for visa application compliance scoring.",
      techStack: "Frontend: React 18, TypeScript, TailwindCSS, shadcn/ui components, Wouter routing, TanStack Query for state management. Backend: Node.js 20, Express.js, PostgreSQL (Neon serverless). AI Integration: Qwen API (qwen-plus, qwen-turbo, qwen-vl-plus), custom prompt engineering for immigration context. Authentication: Passport.js, bcrypt, express-session with PostgreSQL store, Google OAuth 2.0. Payments: Stripe (checkout, webhooks, subscription management). Email: Resend API for transactional emails. Security: Cloudflare Turnstile bot protection, HTTPS, session encryption. DevOps: Replit deployment, automated builds, environment variable management. Monitoring: Error tracking, usage analytics, compliance logging. Export: PDF generation (jspdf), Word document generation (docx library).",
      dataArchitecture: "PostgreSQL database with Drizzle ORM. Schema: users (authentication, tier access), business_plans (questionnaire responses, generated plans), tool_analytics (usage tracking), document_reviews (AI review history), achievements (gamification), promo_codes, referral_system, immigration_lawyers (OISC-registered advisors). API architecture: RESTful endpoints for CRUD operations, secure session management, role-based access control. Data flow: User input → validation → AI processing → compliance scoring → document generation → export. GDPR compliance: data minimization, user consent tracking, right to deletion implemented. Data retention: 3 years maximum, encrypted at rest.",
      aiMethodology: "Multi-model Qwen AI integration (qwen-plus for reasoning, qwen-turbo for fast tasks, qwen-vl-plus for vision) for reliability and quality. Custom system prompts engineered specifically for UK Innovator Founder Visa context, incorporating November 2025 GOV.UK guidance. AI Orchestrator with 4 specialized agents: (1) Sage Compliance Agent - validates against Home Office requirements, (2) Nova Innovation Agent - assesses innovation criteria, (3) Sterling Financial Agent - analyzes financial viability, (4) Atlas Growth Agent - evaluates scalability potential. Temperature settings optimized for consistency (0.3-0.5). Token management for cost efficiency. Fallback logic between providers. Context injection includes visa-specific terminology, endorser expectations, and rejection reason patterns. Validation metrics: Human expert review of 50 AI outputs showed 94% accuracy in compliance flagging.",
      complianceDesign: "CRITICAL REGULATORY COMPLIANCE: (1) OISC Compliance - Platform provides information and tools ONLY, not regulated immigration advice. Clear disclaimers on every page stating 'This platform provides information tools, not legal advice.' Partnership model with OISC-registered advisors for regulated services. Legal opinion letter obtained from immigration solicitor confirming information tool classification. (2) GDPR Article 25 (data protection by design) - encryption at rest/transit, data minimization, explicit consent flows, right to deletion, privacy policy compliant. (3) ICO Registration completed - Data Controller registration reference [pending]. (4) Stripe PCI DSS Level 1 compliance for payment handling. (5) Cyber Essentials certification planned (Month 6, £3K budget). (6) Professional Indemnity Insurance (£1M coverage, £2K/year). (7) Terms of Service and Privacy Policy drafted by UK solicitor.",
      patentStatus: "INTELLECTUAL PROPERTY STATUS: (1) Trademark application pending for 'UK Innovator Founder Visa Assistant' (UK IPO, filed November 2025, application number pending). (2) Copyright registered for platform content, tool methodologies, and training materials. (3) Defensive publication prepared for AI compliance scoring methodology. (4) Trade secret protection for: (a) AI prompt engineering for visa context, (b) Compliance graph mapping algorithm, (c) Evidence strength scoring system. (5) Patent research conducted - no conflicting prior art identified. (6) Full patent application planned Year 2 (£8-12K budget) for 'AI-powered visa application assistance system with multi-criteria compliance scoring.' (7) Domain ownership: innovatorfoundervisaassistant.co.uk registered.",
      founderEducation: "MSc Data Science (Distinction equivalent) - Leeds Beckett University, Leeds, UK (2023). Dissertation focus: Big Data Analytics, Machine Learning, Business Intelligence. BSc Information Technology and Business Information Systems - Middlesex University, London, UK (2017). Advanced Diploma in Software Engineering - Aptech Computer Institute, Lagos, Nigeria (2016). Additional certifications: AWS Cloud Practitioner (in progress), Google Analytics Certified, HubSpot Inbound Marketing Certified. Continuous learning: Completed courses in AI/ML (Coursera), SaaS Growth (Reforge), Immigration Law Fundamentals (online certification).",
      founderWorkHistory: "BhenMedia (Founder & Lead Developer, 2019-Present, Leeds): Digital agency delivering 50+ client projects including custom platforms, AI chatbots, automation systems, and high-performance websites. Clients span hospitality (Ibis Styles Leeds), healthcare (Eden Health Care), and corporate sectors. Revenue: £45K+ total. Demonstrated entrepreneurial capability, client management, and technical delivery. Ibis Styles Leeds (AI Solutions Developer, 2023-Present): Built independent AI-powered virtual concierge system automating 200+ guest queries daily. Streamlined hotel operations, reduced front desk workload by 40%. Live production system demonstrating AI implementation expertise. Qalhata Technology (Technical Developer, 2021-2022): Developed analytics dashboards and technical web infrastructure. Built AI-driven enterprise systems for data analysis. Experience with large-scale data processing. Deskstones Ltd (Web Developer, 2020-2021): Website rebuild improved performance and SEO visibility by over 40%. Demonstrated measurable business impact and results-oriented delivery. Eden Health Care (Automation Specialist, 2022): Developed automation tools that reduced manual processes by 60%. Proved ability to create efficiency-driving solutions in regulated healthcare environment.",
      founderAchievements: "MEASURABLE ACHIEVEMENTS: (1) 50+ client projects delivered through BhenMedia generating £45K+ revenue. (2) AI Virtual Concierge system automating 200+ daily queries at Ibis Styles Leeds - live production system. (3) 40% website performance improvement for Deskstones Ltd - verified analytics data. (4) 60% process automation efficiency at Eden Health Care - documented time savings. (5) MSc Data Science from Russell Group-affiliated university with distinction-equivalent grades. (6) 7+ years full-stack development experience across React, Node.js, Python, TypeScript. (7) UK Innovator Founder Visa Assistant platform: 109 production-ready tools, 47 registered users in first 30 days. (8) Published portfolio: bhenmedia.com showcasing 30+ client case studies. (9) First-hand immigration experience - personally navigated UK visa system, understanding applicant pain points. (10) Trusted by established businesses: Ibis Hotels (Accor Group), NHS-connected healthcare providers.",
      relevantProjects: "DIRECTLY RELEVANT PROJECTS: (1) UK Innovator Founder Visa Assistant (Current, 2025): Full-stack AI SaaS platform with 109 tools for visa applicants. Technologies: React, TypeScript, Node.js, PostgreSQL, Qwen AI, Stripe. Evidence: Live at innovatorfoundervisaassistant.co.uk, 47 users, documented. (2) BhenMedia AI Chatbot System (2023-2024): Built AI-powered customer service solutions for hospitality sector. Directly applicable: natural language processing, user experience, automated guidance systems. (3) Ibis Styles Virtual Concierge (2023-Present): AI system handling 200+ queries daily. Demonstrates: AI integration, production deployment, user query handling - core skills for visa guidance platform. (4) Eden Health Care Automation (2022): Process automation in regulated environment. Demonstrates: compliance awareness, efficiency optimization, healthcare sector experience. (5) Portfolio Management Dashboard (2023): Data visualization and analytics platform for investment tracking. Demonstrates: financial data handling, user dashboard design - applicable to financial projections tool.",
      funding: "12000",
      fundingSources: "£12,000 Total Available Capital: (1) £12,000 Personal Savings (accumulated 2022-2025 from BhenMedia freelance work and employment). Funds held in Lloyds Bank business account, 28-day statement available. FUNDING STRATEGY: Bootstrap-first approach leveraging minimal initial investment already made (under £1,000 for MVP development using existing skills). Low-burn operation: founder-developed platform, no office costs (remote-first), minimal marketing spend (organic SEO focus). Revenue reinvestment model: all Year 1 revenue reinvested into growth. FUTURE FUNDING (if needed): Innovate UK SMART Grant eligible (£25-50K, Month 6-12 application). Angel investment readiness by Month 12 (targeting £50-100K). Revenue sustainable model - platform profitable from Month 6 with 50+ paying customers.",
      monthlyProjections: "YEAR 1 MONTHLY PROJECTIONS: Month 1: £0 revenue, £800 costs (hosting, domains, insurance). Month 2: £150 (10 Basic subscribers), £1,200 costs. Month 3: £870 (30 subs), £1,500 costs. Month 4: £1,450 (50 subs), £1,800 costs. Month 5: £2,320 (80 subs), £2,200 costs (marketing). Month 6: £3,480 (120 subs), £2,800 costs. Month 7: £4,930 (170 subs + 5 Premium), £3,200 costs. Month 8: £6,670 (200 Basic + 15 Premium + 2 Enterprise), £3,500 costs. Month 9: £8,700 (230 Basic + 25 Premium + 5 Enterprise), £4,000 costs. Month 10: £11,020 (260 Basic + 35 Premium + 8 Enterprise), £4,500 costs. Month 11: £13,630 (290 Basic + 45 Premium + 12 Enterprise), £5,200 costs. Month 12: £16,530 (320 Basic + 55 Premium + 15 Enterprise), £5,800 costs. YEAR 1 TOTALS: £69,890 revenue, £36,500 costs, £33,390 profit. YEAR 2: £247,200 revenue, £98,400 costs, £148,800 profit (1,200 customers). YEAR 3: £612,000 revenue, £195,000 costs, £417,000 profit (2,500 customers). 3-YEAR CUMULATIVE: £929,090 revenue, £329,900 costs, £299,190 profit.",
      customerAcquisitionCost: "25",
      lifetimeValue: "237",
      paybackPeriod: "2",
      detailedCosts: "YEAR 1 DETAILED COSTS (£36,500): Infrastructure (£7,200/year): Hosting/servers £2,400, Domain/SSL £200, Database £1,200, AI API costs £3,000, Email service £400. Operations (£8,500/year): Professional indemnity insurance £2,000, Legal/compliance £2,500, Accounting £1,500, Office/coworking £1,500, Travel/networking £1,000. Marketing (£12,000/year): Content marketing £3,000, SEO tools £1,200, Paid advertising £5,000, Events/conferences £2,000, PR £800. Development (£6,000/year): Contractor support £4,000, Tools/software £1,500, Testing £500. Contingency (£2,800): 10% buffer. YEAR 2 (£98,400): Adds: Part-time developer (£24K), Customer success (£18K), Marketing manager (£18K). YEAR 3 (£195,000): Full team: Founder (£45K), 2 developers (£90K), Marketing (£30K), CS (£30K). REGULATORY COSTS INCLUDED: OISC partnership referral fees (£2K/year), Cyber Essentials (£3K Year 1), Legal reviews (£2.5K/year).",
      competitors: "DIRECT COMPETITORS (5+ Named): (1) RELOGATE.ME: Innovator Founder Visa focus, business plan development, endorser selection. Strengths: Established brand, human consultants. Weaknesses: High cost (£2,000+), limited AI integration, slow turnaround. Our advantage: 90% cheaper, instant access, AI-powered. (2) VISACONNECT.COM: UK visa advice, business plan preparation. Strengths: Wide visa coverage. Weaknesses: Generic templates, not specialized, £1,500+ cost. Our advantage: 109 specialist tools vs 10 generic. (3) JOBBATICAL.COM: Global immigration and relocation. Strengths: Tech-powered, well-funded. Weaknesses: Broad focus, not Innovator Founder specific, enterprise pricing. Our advantage: Laser focus on one visa route. (4) FRAGOMEN/CRANBROOK LEGAL (Law Firms): Professional expertise, established reputation. Weaknesses: £3,000-15,000 cost, geographic constraints, office hours only. Our advantage: 24/7 access, global reach, 99% cost reduction. (5) DIY/FREE RESOURCES (GOV.UK, Forums): Free access. Weaknesses: Fragmented, outdated, no personalization, high rejection rates. Our advantage: Integrated, current (November 2025 guidance), AI-personalized. (6) TORLY.AI (Emerging): AI visa assistant. Strengths: AI-powered. Weaknesses: Limited tools, early stage. Our advantage: 109 tools vs ~20, production-ready.",
      competitiveDifferentiation: "MEASURABLE COMPETITIVE ADVANTAGES: (1) Tool Count: 109 specialized tools vs competitors' 10-20 generic tools (10x more comprehensive). (2) Cost: £15-129 vs £3,000-15,000 traditional services (97% savings). (3) Speed: Instant access vs 2-4 weeks lawyer scheduling. (4) Specialization: 100% Innovator Founder Visa focus vs competitors' broad visa coverage. (5) AI Quality: Multi-model Qwen AI orchestration vs single model or no AI. (6) Accessibility: 24/7 global access vs UK office hours only. (7) Currency: Real-time policy updates (November 2025 guidance) vs outdated templates. (8) Evidence Focus: Addresses all 8 critical rejection reasons vs generic advice. (9) Self-Service: Full capability without human dependency vs consultant bottleneck. (10) First-Mover: Only comprehensive platform in market. VALIDATED BY: 47 users in 30 days with £0 marketing spend, organic SEO traction.",
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
      experience: "FOUNDER SKILLS SUMMARY: TECHNICAL EXPERTISE (7+ years): Full-Stack Development (React, Node.js, TypeScript, Python), AI/ML Integration (Qwen AI, custom prompts), Database Architecture (PostgreSQL, MongoDB), Cloud Deployment (AWS, Replit, Vercel). Demonstrated: 50+ production projects, AI virtual concierge handling 200+ daily queries, current platform with 109 tools. BUSINESS & COMMERCIAL: Client management (50+ projects), Revenue generation (£45K+ freelance), Partnership development (3 LOIs secured), Financial modeling (3-year projections created), Market research (28 customer interviews). LEADERSHIP: Team leadership at Qalhata Technology, Project delivery across multiple sectors, Client presentation and stakeholder management. DOMAIN EXPERTISE: First-hand UK visa experience (navigated process personally), Immigration journey understanding, Extensive research on Innovator Founder Visa requirements (November 2025). GAPS ADDRESSED: (1) Limited marketing → Part-time Marketing Specialist hire Month 7. (2) No immigration law qualification → OISC partnership model, legal opinion obtained. (3) Limited sales experience → SDR hire Year 2, sales training completed. UNIQUE STRENGTHS: Technical + business hybrid, domain expertise, proven execution, resourcefulness (MVP built for under £1,000).",
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
  const handleLoadIndustryTemplate = (industry: string, templateIndex: number) => {
    const definition = INDUSTRY_TEMPLATES[industry as keyof typeof INDUSTRY_TEMPLATES];
    if (!definition) return;

    const selectedName = definition.templates[templateIndex] || definition.name;
    const suggestedBusinessName = selectedName.includes(" - ")
      ? selectedName.split(" - ")[0].trim()
      : "";
    const updated = {
      ...formData,
      industry: definition.name,
      ...(suggestedBusinessName && !formData.businessName ? { businessName: suggestedBusinessName } : {}),
    };

    setFormData(updated);
    saveAllFields(updated);
    setShowTemplateModal(false);
    setSelectedIndustry(null);
    setSelectedTemplate(null);
    toast({
      title: "Industry outline loaded",
      description: "Only neutral structure was applied. Add your own evidence, figures and claims.",
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
                {!isTemplatesUnlocked && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>These templates are available on the <strong>Ultimate</strong> plan. <a href="/pricing" className="underline font-medium">Upgrade to unlock</a>.</span>
                  </div>
                )}
                {Object.entries(INDUSTRY_TEMPLATES).map(([key, industry]) => {
                  const IconComponent = industry.icon;
                  const isLocked = !isTemplatesUnlocked;
                  return (
                    <Card 
                      key={key}
                      className={`p-4 cursor-pointer hover-elevate border-2 transition-all border-transparent hover:border-primary/50`}
                      onClick={() => handleIndustryClick(key)}
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
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-amber-500 mt-1" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-muted-foreground mt-1" />
                        )}
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
                  {INDUSTRY_TEMPLATES[selectedIndustry as keyof typeof INDUSTRY_TEMPLATES]?.templates.map((template, index) => {
                    if (template === "LegalTech Venture Outline" && !isAdminUser) {
                      return null;
                    }

                    return (
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
                    );
                  })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Ultimate Plan Required Dialog */}
        <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Ultimate Plan Required
              </DialogTitle>
              <DialogDescription>
                These professionally-crafted business plan templates are exclusively available to Ultimate plan members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Upgrade to Ultimate to instantly unlock all industry templates, auto-fill your questionnaire with expert data, and get a complete business plan ready for endorsement.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowUpgradePrompt(false)} data-testid="button-cancel-upgrade">
                  Maybe Later
                </Button>
                <Button onClick={() => { setShowUpgradePrompt(false); window.location.href = '/pricing'; }} data-testid="button-go-to-pricing">
                  View Ultimate Plan
                </Button>
              </div>
            </div>
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

        {/* Owner-only prefill button */}
        {isOwner && (
          <div className="mb-4">
            <Button
              onClick={handleOwnerPrefill}
              variant="outline"
              size="sm"
              className="w-full border-violet-500/50 text-violet-700 dark:text-violet-400 hover:bg-violet-500/10"
              data-testid="button-owner-prefill"
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Prefill Empty Fields with My Data
            </Button>
          </div>
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
                  <FieldEnhancer
                    fieldName={field.name}
                    fieldLabel={field.label}
                    value={formData[field.name] || ""}
                    onChange={(val) => handleChange(field.name, val)}
                    context={{
                      founderName: formData.fullLegalName,
                      businessName: formData.businessName,
                      industry: formData.industry,
                      businessStage: formData.innovationStage,
                    }}
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
