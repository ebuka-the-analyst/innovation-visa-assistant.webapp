import { useState, useEffect, useRef } from "react";
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
import { useMemberAiQuota } from "@/hooks/useMemberAiQuota";
import { useTierAccess } from "@/hooks/useTierAccess";
import { memberUpgradeDescription } from "@shared/memberToolPlan";
import { parseQuestionnaireEvidenceDraft } from "@/lib/questionnaireEvidenceImport";
import { mergeOwnerQuestionnaireDraft } from "@/lib/mergeOwnerQuestionnaire";
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
      { name: "uniqueness", label: "What makes your solution different? (Be specific with measurable claims)", type: "textarea", required: true, minLength: 100, help: "Describe measurable advantages only where you have evidence or a credible method for calculating them." },
      { name: "techStack", label: "Tools, Technology & Methods Used", type: "textarea", required: true, minLength: 50, help: "Describe the actual technologies, equipment, processes, suppliers or partnerships used and explain how the solution works." },
      { name: "dataArchitecture", label: "How Your Business/Product Works", type: "textarea", required: true, minLength: 100, help: "Tech: APIs, data flow, integrations. Non-tech: Production process, supply chain, service delivery model. Explain the operational mechanics." },
      { name: "aiMethodology", label: "Innovation Methodology (optional for non-tech)", type: "textarea", required: false, minLength: 50, help: "If using AI: specific algorithms. If not: describe your innovative process, method, recipe, or approach that competitors don't have." },
      { name: "complianceDesign", label: "Quality & Compliance Standards", type: "textarea", required: true, minLength: 100, help: "List only the standards and compliance requirements that genuinely apply, using current authoritative sources." },
      { name: "patentStatus", label: "Intellectual Property Status", type: "textarea", required: true, minLength: 20, help: "Patent filed? Trademark registered? Trade secrets? Recipe/formula protection? Design registration? Brand protection? None yet?" },
    ],
  },
  {
    id: 3,
    title: "Founder Credentials & Experience",
    description: "Show how your education, experience and achievements support your ability to execute the business plan.",
    fields: [
      { name: "founderEducation", label: "Education & Certifications", type: "textarea", required: true, minLength: 50, help: "List your relevant degrees, professional certifications and awarding institutions." },
      { name: "founderWorkHistory", label: "Relevant Work History", type: "textarea", required: true, minLength: 100, help: "List relevant roles, employers, responsibilities and projects that you can evidence." },
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
  // Authorisation is computed by the server from a private Railway setting.
  // The client never contains a hard-coded founder email or personal answers.
  const { data: ownerDraftEligibility } = useQuery<{ eligible: boolean }>({
    queryKey: ["/api/questionnaire/owner-autopopulate/eligibility", user?.id],
    enabled: Boolean(user?.id),
    retry: false,
    queryFn: async () => {
      const response = await fetch("/api/questionnaire/owner-autopopulate/eligibility", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) return { eligible: false };
      return await response.json() as { eligible: boolean };
    },
  });
  const isAdminUser = user?.isAdmin === true;
  // Maps active, verified Founder Pro / 90-Day Pass to the historical Ultimate
  // tool permission; a literal account tier string cannot authorise templates.
  const { hasAccessToTier } = useTierAccess();
  const { isMembershipUser, quota: memberQuota } = useMemberAiQuota();

  // Check if user already has an active paid subscription (skip payment for them)
  const userHasActiveSubscription = user?.subscriptionStatus === 'active' && 
    user?.subscriptionTier && 
    ['basic', 'premium', 'enterprise', 'ultimate'].includes(user.subscriptionTier);
  
  // Free tier users can generate their basic plan directly (no payment needed)
  const isFreeTier = user?.subscriptionTier === 'free';
  const canGenerateDirectly = userHasActiveSubscription || isFreeTier ||
    (isMembershipUser && memberQuota?.active === true && memberQuota.remainingGenerations > 0);
  
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
  const draftFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportingEvidence, setIsImportingEvidence] = useState(false);
  const [ownerAutopopulateReview, setOwnerAutopopulateReview] = useState<string[]>([]);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
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
  
  // Founder Pro, 90-Day Pass and grandfathered Ultimate with verified active
  // entitlement can use these industry outlines. Never trust tier label alone.
  const isTemplatesUnlocked = hasAccessToTier('ultimate');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleIndustryClick = (industryKey: string) => {
    if (isTemplatesUnlocked) {
      setSelectedIndustry(industryKey);
    } else {
      setShowUpgradePrompt(true);
    }
  };
  // A trusted server endpoint checks the signed-in account against a private
  // owner identity variable before returning its account-specific draft.
  const isOwner = ownerDraftEligibility?.eligible === true;
  const handleOwnerPrefill = async () => {
    if (!isOwner || !user?.id || isAutoPopulating) return;
    setIsAutoPopulating(true);
    try {
      const response = await fetch("/api/questionnaire/owner-autopopulate", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 403
        ? "This personal draft is not available for the signed-in account."
        : "Personal draft could not be loaded. Please try again.");
      const draft = await response.json() as {
        fields: Record<string, unknown>;
        previousFields?: Record<string, unknown>;
        needsEvidence: string[];
      };
      const change = mergeOwnerQuestionnaireDraft(
        formData,
        draft.fields ?? {},
        draft.previousFields ?? {},
        steps.flatMap(step => step.fields.map(field => field.name)),
      );
      setOwnerAutopopulateReview(Array.isArray(draft.needsEvidence) ? draft.needsEvidence : []);
      if (change.added > 0 || change.refreshed > 0) {
        setFormData(change.merged);
        saveAllFields(change.merged);
        setCurrentStep(0);
      }
      toast({
        title: change.added || change.refreshed ? "Questionnaire draft updated" : "Your answers are already up to date",
        description: `Added ${change.added}, refreshed ${change.refreshed} unchanged AutoPopulate answers, preserved ${change.skippedExisting} other answers. Review all assumptions before using a plan credit.`,
      });
    } catch (error) {
      toast({
        title: "AutoPopulate unavailable",
        description: error instanceof Error ? error.message : "Could not load your personal draft.",
        variant: "destructive",
      });
    } finally {
      setIsAutoPopulating(false);
    }
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
  const isFounderAccount = isOwner;

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

  /** File contents remain in the signed-in customer's browser/account draft.
   * They are not committed to GitHub or a public file on the website.
   * Non-empty existing answers are never overwritten.
   */
  const importEvidenceDraft = async (file: File) => {
    if (isImportingEvidence) return;
    setIsImportingEvidence(true);
    try {
      if (file.size > 100_000 || !file.name.toLowerCase().endsWith(".json")) {
        throw new Error("Please select a questionnaire .json file smaller than 100 KB.");
      }
      const draft = parseQuestionnaireEvidenceDraft(
        await file.text(),
        user?.email ?? "",
        steps.flatMap(step => step.fields.map(field => field.name)),
        formData,
      );
      if (draft.added < 1) {
        toast({
          title: "No new answers imported",
          description: draft.skippedExisting
            ? "The matching questions already have answers. Existing answers were preserved."
            : "This file contains no new supported answers for this questionnaire.",
        });
        return;
      }
      setFormData(draft.merged);
      saveAllFields(draft.merged);
      setCurrentStep(0);
      toast({
        title: `Imported ${draft.added} draft answers`,
        description: `Existing answers preserved (${draft.skippedExisting} skipped). Review every section and complete the missing evidence before generating a plan. The draft will sync to your account.`,
      });
    } catch (error) {
      toast({
        title: "Could not import questionnaire",
        description: error instanceof Error ? error.message : "The file could not be read.",
        variant: "destructive",
      });
    } finally {
      setIsImportingEvidence(false);
    }
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
        const effectiveTier = isFreeTier ? 'free' : (isMembershipUser ? tier : (formData.tier || 'premium'));
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

  // Removed outdated fabricated demo profile and expired five-tier product
  // claims. Personal answers must come from the user's evidence import.

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

        {/* Import source-grounded draft answers, without overriding earlier edits. */}
        {currentStep === 0 && (
          <Card className="mb-6 border-primary/40 p-5" data-testid="questionnaire-evidence-import">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <h3 className="font-semibold">Import your prepared questionnaire answers</h3>
                <p className="text-sm text-muted-foreground">
                  Use a personal evidence-based .json draft. Only blank answers are filled;
                  your existing work is preserved and the draft auto-saves to your account.
                </p>
                <p className="text-xs text-muted-foreground">
                  Check identity, immigration details, financial assumptions and claims
                  before generating a business plan. Importing does not use a plan credit.
                </p>
              </div>
              <input
                ref={draftFileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                aria-label="Select prepared questionnaire JSON"
                data-testid="input-evidence-draft"
                onChange={async event => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) await importEvidenceDraft(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-11 whitespace-normal"
                disabled={isImportingEvidence}
                onClick={() => draftFileInputRef.current?.click()}
                data-testid="button-import-evidence-draft">
                {isImportingEvidence ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                {isImportingEvidence ? "Importing answers…" : "Import prepared answers (.json)"}
              </Button>
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
                onClick={() => setShowTemplateModal(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                data-testid="button-load-demo-template"
              >
                Choose Industry Outline
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
                Select an industry outline to help organise your own evidence. Outlines do not supply verified facts, endorsements or financial projections.
              </DialogDescription>
            </DialogHeader>
            
            {!selectedIndustry ? (
              <div className="grid gap-3 mt-4">
                {!isTemplatesUnlocked && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Industry outlines require an active, verified <strong>{memberUpgradeDescription('ultimate')}</strong> membership. <a href="/pricing" className="underline font-medium">Review memberships</a>.</span>
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
                              Use this industry outline (no example claims inserted)
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

        {/* Verified current membership required */}
        <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Membership Access Required
              </DialogTitle>
              <DialogDescription>
                Industry outlines are available with {memberUpgradeDescription('ultimate')} and eligible grandfathered memberships, subject to verified active access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Review the current membership options. These outlines only organise responses. You must supply and verify your own personal details, financial evidence and market claims.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowUpgradePrompt(false)} data-testid="button-cancel-upgrade">
                  Maybe Later
                </Button>
                <Button onClick={() => { setShowUpgradePrompt(false); window.location.href = '/pricing'; }} data-testid="button-go-to-pricing">
                  Review Memberships
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

        {/* Personal founder draft: directly beneath document autofill.
            The button is hidden for every other authenticated account. */}
        {isOwner && (
          <Card className="p-4 mb-6 border-violet-500/40 bg-violet-500/5" data-testid="card-owner-autopopulate">
            <div className="flex gap-4 items-center justify-between flex-wrap">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Visa Assistant Global · Your questionnaire draft</h3>
                <p className="text-xs text-muted-foreground">
                  Populate all 11 sections in your own voice, or refresh wording from
                  an earlier AutoPopulate draft without replacing your manual edits.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Your edits are preserved. Immigration status, expiry, secured funding
                  and other unsupported facts still need your verification.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleOwnerPrefill}
                disabled={isAutoPopulating}
                variant="outline"
                className="border-violet-500 text-violet-700 dark:text-violet-300 hover:bg-violet-500/10"
                data-testid="button-owner-prefill"
              >
                {isAutoPopulating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                AutoPopulate
              </Button>
            </div>
            {ownerAutopopulateReview.length > 0 && (
              <p role="status" className="mt-3 text-xs text-amber-700 dark:text-amber-400" data-testid="owner-autopopulate-review">
                Draft saved. {ownerAutopopulateReview.length} evidence or assumption areas need checking
                before plan generation, including immigration status, verified capital, forecast assumptions
                and external customer validation. Review each answer before using it in an application.
              </p>
            )}
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
