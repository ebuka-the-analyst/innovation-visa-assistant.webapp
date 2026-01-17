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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Tag, Check, X, Loader2, Save, RotateCcw, Building2, Stethoscope, ShoppingBag, Laptop, Lightbulb, FileText, Upload, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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
        const merged = { ...defaultFormData, tier, ...savedData };
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
      targetEndorser: "PRIMARY TARGET: TECH NATION. RATIONALE: (1) Sector alignment - FinTech is core focus (endorsed Revolut, Monzo, TransferWise). (2) Innovation fit - Our AI forecasting (94% accuracy vs 73% industry) meets 'significantly different' requirement. Patent pending, 2.8M transaction training dataset. (3) Market validation - 45 beta users, £8.4K revenue, 3 LOIs (£182K) exceeds typical applicant. (4) Requirements research: Business plan (50-80 pages), 3 letters of support, evidence portfolio. Scoring 0-10 scale: Innovation 9/10, Viability 9/10, Scalability 8/10. Approval rate ~45%. (5) Post-endorsement benefits: 2,000+ founder network, £12B+ investor access, mentorship, quarterly events. APPLICATION TIMELINE: Month 1-2: EOI submission. Month 3-4: Stage 2 business plan (use FinFlow AI to generate). Month 5-6: Technical assessment, endorsement decision. BACKUP: Innovator International (65% approval, 4-6 weeks, £1,500 fee). TERTIARY: University of Leeds (MSc graduate 2021, Professor Alan Thompson willing to support, 80% probability).",
      contactPointsStrategy: "6+ CONTACT POINTS (3-Year Engagement): YEAR 1 (3 contacts): CP1 (Month 3): Initial post-endorsement meeting (60min, in-person Tech Nation office). Agenda: business walkthrough, mentor matching, Year 1 metrics. CP2 (Month 6): Q2 progress report + video call (45min). Deliverable: 5-page PDF (customers, revenue, team vs targets). CP3 (Month 12): Year 1 annual review (90min, in-person). Deliverable: 15-page annual report (P&L, cashflow, team roster, 4 hires proof, product roadmap, 3-5 case studies). YEAR 2 (2 contacts): CP4 (Month 18): Mid-year check-in + Tech Nation cohort event participation (30min 1-on-1 + 3hr event). Deliverable: 5-page progress report, event attendance certificate. CP5 (Month 24): Year 2 annual review + strategic planning (120min). Deliverable: 20-page annual report (audited financials, 13 employees proof, 2,215 customers, NPS, churn, market share, Year 3 plan). YEAR 3 (2 contacts): CP6 (Month 30): Progress review + Tech Nation speaker (45min review + 60min keynote). Topic: 'Scaling FinTech SaaS 0-£2M ARR in 30 months'. CP7 (Month 36, BONUS): Final 3-year review + ILR endorsement support (90min). Deliverable: 25-page final report (3-year journey, all KPIs, 26 employees, £2.86M ARR, audited financials, customer impact stories, media coverage). Request ILR endorsement letter. PROACTIVE ENGAGEMENT: Quarterly email updates (12 total), Tech Nation event attendance (10+ events), mentorship (2-3 incoming visa holders), Slack community active.",
      experience: "TECHNICAL EXPERTISE: MSc Data Science (Distinction - Leeds), BSc Computer Science (First Class - Manchester). 3+ years production ML (23 models deployed, 450K+ users). 5+ years full-stack development. AWS Certified Solutions Architect + ML Specialty. Built SaaS for 450K+ users. FINANCIAL TECHNOLOGY: 2.5 years FinTech Innovations (analyzed 450K+ business transactions, built cash flow risk models 86% accuracy). Deep SME financial challenges understanding. FCA Financial Services Training (2024). Part-qualified FRM. BUSINESS & COMMERCIAL: Led teams delivering £8.2M value (NHS). Closed 14 customers (£8.4K revenue). 3 LOIs (£182K). 100% retention (45 beta users). Strong communication (80+ industry presentations). Built 36-month financial models. LEADERSHIP: Led 4-person data science team. Trained 12 analysts. Certified ScrumMaster. Hired/managed technical teams. Delivered 30+ projects on time/budget. NHS Transformation Award 2024. ENTREPRENEURIAL: Built inventory SaaS (5 clients, £180/month MRR). Freelance consulting (8 projects, £45K). Full lifecycle experience: ideation → customers → support. Financial prudence: bootstrapped £125K. GAPS ADDRESSED: (1) Limited sales experience → Sales & CS Manager hired Month 7, sales training completed 2024, 3 sales mentors. (2) No prior CEO experience at scale → Advisors with scaling experience, YC Startup School, Tech Nation mentorship. (3) Limited marketing → Part-time Marketing Specialist Month 9, SaaS marketing courses (Reforge), marketing advisor. UNIQUE STRENGTHS: (1) Technical + commercial hybrid (ML Advanced + business execution). (2) Domain expertise (3+ years exact customer segment). (3) Execution track record (£8.2M delivered, 23 production models). (4) Resourcefulness (£8.4K revenue, £0 marketing spend). (5) Learning agility (FCA training, sales methodology, rapid skill acquisition).",
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
      targetEndorser: "PRIMARY TARGET: INNOVATOR INTERNATIONAL (innovatorinternational.co.uk). RATIONALE: (1) Highest approval rate (65%+) among endorsing bodies. (2) Faster processing (4-6 weeks vs 3-4 months). (3) Cost-effective (£1,500 application fee). (4) Technology/digital sector focus aligns with AI SaaS platform. (5) Experience with first-time founders and immigrant entrepreneurs. (6) Clear requirements and feedback process. APPLICATION RESEARCH: Requirements verified November 2025: Business plan (40-60 pages), Financial projections (3-year), Founder CV, Evidence portfolio, Product demo. Scoring criteria: Innovation (30%), Viability (35%), Scalability (35%). BACKUP OPTIONS: (1) UKES (UK Endorsing Services) - larger pipeline, slower processing. (2) Envestors - investment focus, higher bar. (3) SETsquared (university partnership) - if academic connection leveraged (Leeds Beckett). APPLICATION TIMELINE: January 2026: Application submission. February-March 2026: Assessment period. April 2026: Decision expected.",
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
          targetEndorser: "Primary: Tech Nation (FinTech focus, digital business alignment). Alternative: Innovator International (broader business support). Rationale: Tech Nation has strong FinTech track record, portfolio includes similar B2B SaaS companies, active mentor network in financial services.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Initial pitch and business plan review. (2) Month 6: MVP progress report, customer metrics. (3) Month 12: Annual review, Year 1 achievements. (4) Month 18: Growth update, hiring progress. (5) Month 24: Series A preparation discussion. (6) Month 30: Exit planning, international expansion.",
          experience: "Uniquely qualified: 5 years in UK banking data science (HSBC, Monzo). Built production ML systems serving 50K+ users. Deep understanding of SME financial challenges. Technical expertise: Python, ML, cloud architecture. Domain expertise: UK banking regulations, Open Banking APIs.",
          revenue: "Tiered SaaS: Starter £19/month (basic forecasting), Professional £69/month (AI predictions, alerts), Enterprise £75/month (API access, multi-entity). Add-ons: Custom reports £49/setup, API access £200/month. LTV: £2,160 (36-month retention). CAC: £180. Payback: 3 months. Gross margin: 85%.",
        },
        { // PaymentPro - B2B Payments
          businessName: "PaymentPro",
          industry: "FinTech / B2B Payments / Payment Processing",
          problem: "UK SMEs lose £2.5 billion annually to late B2B payments. 62% of businesses experience cash flow issues due to slow payment collection. Existing solutions are expensive (2.9%+ fees) and complex.",
          innovationStage: "mvp-complete",
          productStatus: "MVP launched with core features: instant invoice payments, automated reconciliation, and cash flow integration. Currently testing with 25 pilot customers.",
          uniqueness: "Key differentiators: (1) Flat 1.5% transaction fee vs 2.9% competitors. (2) Same-day settlements. (3) AI-powered payment chasing. (4) Integrated accounting software sync.",
          techStack: "Node.js, TypeScript, PostgreSQL, Stripe Connect, Open Banking, React, AWS, Kubernetes",
        },
        { // LendSmart - SME Lending
          businessName: "LendSmart",
          industry: "FinTech / Alternative Lending / SME Finance",
          problem: "78% of UK SME loan applications are rejected by traditional banks. The average approval time is 3-6 weeks. SMEs need faster access to working capital with fair, transparent terms.",
          innovationStage: "pre-mvp",
          productStatus: "Building AI-powered credit assessment platform using Open Banking data. Technical architecture complete, regulatory pathway mapped (FCA authorization timeline: 9-12 months).",
          uniqueness: "Innovation: (1) Decision in 24 hours vs 3-6 weeks. (2) 85% approval rate using alternative data (vs 22% bank rate). (3) Transparent pricing calculator. (4) Revenue-based repayments.",
          techStack: "Python, scikit-learn, FastAPI, PostgreSQL, Open Banking APIs, React, AWS, FCA-compliant infrastructure",
        },
      ],
      healthtech: [
        { // CareAI - Patient Management
          businessName: "CareAI",
          industry: "HealthTech / AI Healthcare / Patient Management",
          problem: "NHS trusts waste £2.3 billion annually on missed appointments and inefficient patient scheduling. Staff spend 40% of time on administrative tasks instead of patient care.",
          innovationStage: "mvp-complete",
          productStatus: "MVP deployed in 3 NHS pilot sites. AI scheduling system reducing DNA rates by 35%. DCB0129 compliance achieved. Currently processing 1,200 appointments weekly.",
          uniqueness: "Measured impact: (1) 35% reduction in missed appointments. (2) 28% improvement in clinic utilization. (3) 4-hour admin time saved per clinician per week. (4) NHS Digital approved.",
          techStack: "Python, TensorFlow, HL7 FHIR APIs, PostgreSQL, React, AWS (HIPAA-compliant), NHS Spine integration",
        },
        { // MedAssist - Clinical Decision Support
          businessName: "MedAssist",
          industry: "HealthTech / Clinical Decision Support / Medical AI",
          problem: "Diagnostic errors affect 10-15% of patients. Junior doctors lack immediate access to specialist knowledge. Current clinical decision support tools are outdated and not AI-powered.",
          innovationStage: "mvp-complete",
          productStatus: "AI-powered clinical decision support system trained on 2.5 million anonymized patient records. Validated with 94% accuracy in diagnostic suggestions. Piloting with 5 NHS trusts.",
          uniqueness: "Clinical advantages: (1) 94% diagnostic accuracy. (2) Real-time evidence-based recommendations. (3) Integration with NHS electronic health records. (4) MHRA Class IIa certification pathway.",
          techStack: "Python, PyTorch, BERT/GPT medical models, HL7 FHIR, PostgreSQL, React, Azure (UK South), DCB0129/DCB0160 compliant",
        },
        { // HealthFlow - NHS Integration
          businessName: "HealthFlow",
          industry: "HealthTech / NHS Integration / Healthcare Interoperability",
          problem: "NHS systems are fragmented - data is siloed across 200+ different IT systems. Clinicians waste 2 hours daily searching for patient information across multiple platforms.",
          innovationStage: "pre-mvp",
          productStatus: "Building unified NHS data integration platform. Technical architecture designed, NHS Digital partnership discussions initiated. HL7 FHIR compliant design.",
          uniqueness: "Platform advantages: (1) Single patient view across all NHS systems. (2) 90% reduction in data lookup time. (3) Built on NHS approved standards. (4) Open API for third-party integration.",
          techStack: "Java, Spring Boot, HL7 FHIR, Apache Kafka, PostgreSQL, Angular, NHS Cloud (Azure), NHS Spine APIs",
        },
      ],
      ecommerce: [
        { // ShopSmart - AI Recommendations
          businessName: "ShopSmart AI",
          industry: "E-commerce / AI Recommendations / Retail Technology",
          problem: "UK retailers lose £18 billion annually to poor product recommendations. Generic recommendation engines have only 2-3% click-through rates. SME retailers can't afford enterprise solutions.",
          innovationStage: "mvp-complete",
          productStatus: "AI recommendation engine live with 15 e-commerce clients. Achieving 8.5% CTR (vs 2.5% industry average). Processing 2.3 million product interactions monthly.",
          uniqueness: "Measurable results: (1) 8.5% CTR vs 2.5% industry. (2) 23% increase in average order value. (3) 5-minute integration via Shopify/WooCommerce plugins. (4) £49/month vs £500+ competitors.",
          techStack: "Python, TensorFlow Recommenders, FastAPI, Redis, PostgreSQL, React, Shopify/WooCommerce APIs, AWS",
        },
        { // RetailFlow - Inventory Optimization
          businessName: "RetailFlow",
          industry: "E-commerce / Inventory Management / Supply Chain",
          problem: "UK retailers hold £15.2 billion in excess inventory while simultaneously losing £6.8 billion to stockouts. Manual inventory forecasting has 65% accuracy, causing waste and lost sales.",
          innovationStage: "mvp-complete",
          productStatus: "AI inventory optimization platform with 22 retail clients. Reducing stockouts by 42% and excess inventory by 31%. Integration with major POS and ERP systems.",
          uniqueness: "ROI proven: (1) 91% demand forecast accuracy (vs 65% manual). (2) 42% stockout reduction. (3) 31% inventory cost savings. (4) Automated reorder recommendations.",
          techStack: "Python, Prophet/ARIMA, PostgreSQL, React, Stripe, Shopify/Square POS integration, AWS, Docker",
        },
        { // MarketPro - Marketplace Platform
          businessName: "MarketPro",
          industry: "E-commerce / Marketplace / Multi-vendor Platform",
          problem: "UK SME sellers struggle on Amazon/eBay due to high fees (15-25%) and algorithm bias toward large sellers. There's no UK-focused B2B marketplace for wholesale and trade.",
          innovationStage: "pre-mvp",
          productStatus: "Building UK-first B2B trade marketplace. Wireframes complete, 50 merchant expressions of interest. Payment and logistics partnerships in negotiation.",
          uniqueness: "Market opportunity: (1) 8% flat commission vs 15-25% on Amazon. (2) UK-focused with local logistics. (3) Built-in trade credit. (4) Verified UK supplier network.",
          techStack: "Next.js, TypeScript, PostgreSQL, Stripe Connect, UK carrier APIs, Vercel, Redis",
        },
      ],
      saas: [
        { // TeamFlow - Collaboration Platform
          businessName: "TeamFlow",
          industry: "SaaS / Team Collaboration / Productivity Software",
          problem: "Remote teams use 9+ different tools on average, causing context-switching that costs £12,000 per employee annually. Integration complexity leads to information silos and reduced productivity.",
          innovationStage: "mvp-complete",
          productStatus: "Unified collaboration platform with 180 active teams. Combines chat, docs, tasks, and video in one interface. 40% reduction in tool-switching measured.",
          uniqueness: "Productivity gains: (1) 40% less tool-switching. (2) All-in-one workspace (chat + docs + tasks + video). (3) £8/user/month vs £25+ for separate tools. (4) AI-powered meeting summaries.",
          techStack: "React, TypeScript, Node.js, PostgreSQL, WebRTC, Socket.io, AWS, Kubernetes, Redis",
        },
        { // DataSync - Integration Platform
          businessName: "DataSync",
          industry: "SaaS / Integration Platform / iPaaS",
          problem: "UK businesses use 75+ SaaS applications on average. Manual data entry between systems costs £23,000 per employee annually. Existing iPaaS solutions (Zapier, Workato) are expensive and complex.",
          innovationStage: "mvp-complete",
          productStatus: "No-code integration platform with 95 customers. 200+ pre-built connectors. Processing 4.5 million data syncs monthly with 99.9% uptime.",
          uniqueness: "Value proposition: (1) 80% cheaper than Workato. (2) No-code visual builder. (3) UK-focused connectors (Sage, Xero, UK banks). (4) Real-time sync vs batch processing.",
          techStack: "Node.js, TypeScript, PostgreSQL, Redis, RabbitMQ, React, Docker, AWS, OAuth 2.0 for 200+ APIs",
        },
        { // AutomateHQ - Workflow Automation
          businessName: "AutomateHQ",
          industry: "SaaS / Workflow Automation / Business Process",
          problem: "UK SMEs spend 28% of employee time on repetitive tasks that could be automated. Existing RPA solutions cost £50K+ and require technical expertise to implement.",
          innovationStage: "pre-mvp",
          productStatus: "Building AI-powered workflow automation for SMEs. Natural language workflow creation prototype complete. 35 pilot applications received.",
          uniqueness: "SME-first approach: (1) Describe workflows in plain English. (2) £199/month vs £50K+ RPA. (3) No-code/low-code interface. (4) AI learns from user corrections.",
          techStack: "Python, GPT-4, LangChain, FastAPI, PostgreSQL, React, AWS Lambda, Selenium for web automation",
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
          targetEndorser: "Primary: Innovator International (manufacturing/FMCG expertise). Alternative: Tech Nation (if highlighting e-commerce/D2C technology). Rationale: Innovator International understands product businesses, has food/beverage portfolio, manufacturing mentor network.",
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
          targetEndorser: "Primary: Tech Nation (deep-tech, climate focus). Alternative: Innovator International (manufacturing expertise). Rationale: Tech Nation values science-based innovation, has climate-tech portfolio, provides access to VC network for capital-intensive scaling.",
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
        { // CleanMaterials - Eco Products - Brief version
          businessName: "CleanMaterials Co",
          industry: "Manufacturing / Sustainable Materials / B2B Products",
          problem: "UK businesses spend £2.1 billion on cleaning products containing harmful chemicals. 23% of workplace skin conditions are caused by cleaning chemicals.",
          innovationStage: "pre-mvp",
          productStatus: "Developed bio-enzyme cleaning concentrate. Lab tests show 40% better cleaning performance than chemical alternatives. 15 corporate pilot agreements secured.",
          uniqueness: "Product innovation: (1) Bio-enzyme formula, zero harmful chemicals. (2) Concentrate = 90% less packaging/transport. (3) 30% cheaper per-use than chemicals. (4) COSHH compliant, reduces H&S burden.",
          techStack: "Production: Mixing tanks, filling line, quality lab. Formulation: Enzyme cultivation, stability testing. Certifications: EU Ecolabel pending.",
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
          targetEndorser: "Primary: Tech Nation (digital platform, creator economy). Alternative: Innovator International. Rationale: Tech Nation has strong digital platform portfolio, understands SaaS/marketplace businesses, connections to UK tech ecosystem.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, creator traction metrics. (2) Month 6: Revenue growth, creator testimonials. (3) Month 12: Year 1 review, product roadmap. (4) Month 18: Team growth, Series A preparation. (5) Month 24: US expansion planning. (6) Month 30: Growth metrics, exit options.",
          experience: "Uniquely qualified: 3 years at Patreon managing £2M+ creator portfolio. Personal creator experience (50K YouTube subscribers). Deep understanding of creator pain points. Industry connections: creator agencies, brands, platforms. Proven ability to grow creator businesses.",
          revenue: "Platform commission: 15% of GMV (creator subscriptions/tips). Sponsorship marketplace: 20% of brand deals. Premium analytics: £15/month. Enterprise/agency: Custom pricing. Year 1: £150K revenue. Year 3: £1M. Gross margin: 75%.",
        },
        { // ArtConnect - Creative Marketplace - Brief
          businessName: "ArtConnect Gallery",
          industry: "Art / Creative Marketplace / E-commerce",
          problem: "Emerging UK artists struggle to reach buyers - galleries take 50% commission, online platforms lack curation, and art shipping is complex and expensive.",
          innovationStage: "mvp-complete",
          productStatus: "Curated online art marketplace with 280 UK artists, 1,200 artworks listed. £145K GMV in first year. Average order value £380. 25% commission (vs 50% galleries).",
          uniqueness: "Artist benefits: (1) Only 25% commission. (2) Curated quality (acceptance rate 35%). (3) End-to-end shipping included. (4) AR 'view in room' feature increases conversion 3x.",
          techStack: "E-commerce: Shopify Plus, custom theme. AR: 8thWall integration. Shipping: integrated fine art courier APIs. Payments: Stripe, PayPal.",
        },
        { // MediaFlow - Distribution Innovation - Brief
          businessName: "MediaFlow Distribution",
          industry: "Media / Content Distribution / Film & TV",
          problem: "Independent UK filmmakers face £50K+ distribution costs and 18-month delays to reach audiences. Major distributors reject 95% of indie content.",
          innovationStage: "pre-mvp",
          productStatus: "Building direct-to-audience distribution platform for indie films. Partnerships with 3 film festivals for content pipeline. 45 filmmaker applications received.",
          uniqueness: "Distribution model: (1) Self-service platform, films live in 48 hours. (2) 70% revenue share (vs 30% traditional). (3) Built-in marketing tools. (4) Audience data ownership.",
          techStack: "Platform: Next.js, PostgreSQL. Video: Cloudflare Stream. Payments: Stripe. DRM: BuyDRM integration.",
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
          targetEndorser: "Primary: Innovator International (services expertise, marketplace understanding). Alternative: Tech Nation (if highlighting platform technology). Rationale: Innovator International understands professional services, has B2B platform portfolio.",
          contactPointsStrategy: "6 engagement points: (1) Month 1: Platform demo, client/consultant traction. (2) Month 6: Revenue growth, quality metrics. (3) Month 12: Year 1 review, expansion plans. (4) Month 18: New verticals launch. (5) Month 24: Team growth, funding round. (6) Month 30: Exit planning, international.",
          experience: "Uniquely qualified: 4 years McKinsey (£2M+ in project fees). Built student consultancy (£50K revenue). Deep understanding of both consultant and client perspectives. Industry connections: Big 4 alumni network. Proven ability to match consultants with clients.",
          revenue: "Platform commission: 15% of project value (from both sides = 7.5% each). Premium listings: £49/month for priority matching. Enterprise: Custom pricing for large clients. Year 1: £63K revenue (15% of £420K GMV). Year 3: £480K (15% of £3.2M).",
        },
        { // TalentBridge - Recruitment Innovation - Brief
          businessName: "TalentBridge",
          industry: "Recruitment / HR Tech / Staffing",
          problem: "UK hospitality and retail suffer 30% annual staff turnover. Traditional recruitment agencies charge 15-20% fees and take 4-6 weeks to fill roles.",
          innovationStage: "mvp-complete",
          productStatus: "Rapid hiring platform for hospitality/retail with 85 employer clients. 2,400 placements in Year 1. Average time-to-hire: 5 days. Flat £150 fee per hire.",
          uniqueness: "Recruitment innovation: (1) Flat £150 fee vs 15% of salary. (2) 5-day average placement vs 4 weeks. (3) Video interviews built-in. (4) 90-day replacement guarantee.",
          techStack: "Platform: React, PostgreSQL. Video: Twilio Video. Matching: Custom algorithm. Background checks: Onfido API.",
        },
        { // ServicePro - B2B Solutions - Brief
          businessName: "ServicePro Solutions",
          industry: "Business Services / Facilities Management / B2B",
          problem: "UK SMEs manage 5+ service providers (cleaning, security, maintenance) with no central oversight. Service quality inconsistent, costs uncontrolled, contracts scattered.",
          innovationStage: "pre-mvp",
          productStatus: "Building integrated facilities management platform for SMEs. 28 pilot customer agreements. Partnerships with 15 vetted service providers.",
          uniqueness: "SME benefits: (1) Single platform for all facility services. (2) Pre-vetted, quality-guaranteed providers. (3) 15-20% cost savings through bulk negotiation. (4) Real-time service tracking.",
          techStack: "Platform: React, PostgreSQL. Scheduling: Custom booking system. Payments: GoCardless direct debit. Reporting: Custom dashboards.",
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
        { // CommunityHub - Local Solutions - Brief
          businessName: "CommunityHub",
          industry: "Social Enterprise / Community / Local Services",
          problem: "UK high streets have 15% vacancy rates. Local businesses can't compete with online giants. Community connections weakened post-pandemic.",
          innovationStage: "mvp-complete",
          productStatus: "Hyperlocal marketplace connecting 340 local businesses with 8,500 residents in 3 pilot areas. £95K monthly transaction volume. 85% of revenue stays local.",
          uniqueness: "Community impact: (1) Keep 85% of spending local (vs 13% Amazon). (2) Same-day local delivery. (3) Community events integration. (4) Local currency/loyalty scheme.",
          techStack: "Platform: React, PostgreSQL. Payments: Stripe. Delivery: Partner courier network. Engagement: Push notifications, email.",
        },
        { // GreenFuture - Sustainability Venture - Brief
          businessName: "GreenFuture Initiative",
          industry: "Social Enterprise / Sustainability / Education",
          problem: "UK schools lack practical sustainability education. 78% of teachers say they're not equipped to teach climate action. Students feel helpless about environmental issues.",
          innovationStage: "pre-mvp",
          productStatus: "Developing hands-on sustainability curriculum and school garden programme. Pilot with 8 schools agreed. £45K grant funding secured. Social enterprise model.",
          uniqueness: "Educational innovation: (1) Practical learning (grow food, reduce waste, measure carbon). (2) Student-led projects build agency. (3) Teacher training included. (4) Revenue from corporate sponsorship.",
          techStack: "Curriculum: Custom LMS platform. Impact: Student engagement tracking. Community: School network forum. Operations: Volunteer management system.",
        },
      ],
      other: [
        { // EduAI - Learning Platform
          businessName: "EduAI",
          industry: "EdTech / AI Learning / Personalized Education",
          problem: "One-size-fits-all education fails 40% of students. Teachers lack time to personalize learning for 30+ students. Existing EdTech platforms don't adapt to individual learning styles.",
          innovationStage: "mvp-complete",
          productStatus: "AI adaptive learning platform used by 12 UK schools. Personalizes curriculum paths for each student. 32% improvement in learning outcomes measured in pilot.",
          uniqueness: "Educational impact: (1) 32% improvement in test scores. (2) AI identifies learning gaps in real-time. (3) Reduces teacher admin by 8 hours/week. (4) Ofsted-aligned curriculum.",
          techStack: "Python, TensorFlow, FastAPI, PostgreSQL, React, AWS, LTI integration for LMS compatibility",
        },
        { // PropFlow - Property Management
          businessName: "PropFlow",
          industry: "PropTech / Property Management / Real Estate Technology",
          problem: "UK landlords with 5+ properties spend 15 hours weekly on management tasks. Maintenance coordination, rent collection, and tenant communication are fragmented across multiple systems.",
          innovationStage: "mvp-complete",
          productStatus: "All-in-one property management platform with 85 landlords managing 420 properties. Automated rent collection achieving 98% on-time payment rate.",
          uniqueness: "Landlord benefits: (1) 12 hours/week time saved. (2) 98% rent collection rate (vs 89% industry). (3) AI maintenance triage. (4) Tenant portal with self-service.",
          techStack: "Next.js, TypeScript, PostgreSQL, Stripe, Twilio, GoCardless, React Native (mobile), AWS",
        },
        { // GreenTech - Sustainability Platform
          businessName: "GreenTech Analytics",
          industry: "CleanTech / Sustainability / ESG Technology",
          problem: "UK businesses face mandatory carbon reporting (SECR) but 78% struggle to measure emissions accurately. Existing consultancy-based solutions cost £10K+ and provide only annual snapshots.",
          innovationStage: "pre-mvp",
          productStatus: "Building automated carbon accounting platform. IoT sensor integration designed, utility API partnerships in progress. 40 corporate expressions of interest.",
          uniqueness: "Sustainability advantages: (1) Real-time carbon tracking vs annual reports. (2) 90% cheaper than consultancy. (3) Automated SECR compliance. (4) AI reduction recommendations.",
          techStack: "Python, IoT protocols (MQTT), PostgreSQL, React, AWS IoT, utility APIs, carbon calculation engines",
        },
      ],
    };
    
    const templates = industryTemplates[industry];
    if (!templates || !templates[templateIndex]) return;
    
    const selectedTemplateData = templates[templateIndex];
    
    // Base template data (shared across all industries)
    const baseTemplateData: Record<string, string> = {
      tier: 'premium',
      fullLegalName: userName,
      currentVisaStatus: "graduate-visa",
      visaExpiryDate: "DD/MM/YYYY - Enter your visa expiry date",
      workAuthorizationDetails: "Describe your current work authorization status, any restrictions, and self-employment permissions.",
      educationBackground: "List ALL degrees: Degree Name, Institution, Location, Year, Grade. Include dissertation topics if relevant.",
      professionalCertifications: "List professional certifications: AWS, Google Cloud, Microsoft, industry-specific accreditations.",
      totalProfessionalExperience: "5",
      industryExperience: "Describe your years of experience in your target industry with specific projects and roles.",
      technicalSkillsProficiency: "Rate each skill 1-10: Python (8/10), JavaScript (7/10), SQL (8/10), etc.",
      languagesSpoken: "English (Fluent), other languages with proficiency levels.",
      linkedInProfile: "https://linkedin.com/in/your-profile",
      portfolioUrl: "https://github.com/username | https://your-website.com",
      existingCustomers: "List beta users, pilot customers, or testimonials if any.",
      tractionEvidence: "Usage metrics, pilot results, revenue to date, user feedback.",
      dataArchitecture: "Describe how you integrate data sources, APIs, and system architecture.",
      aiMethodology: "Specific algorithms, models, training data, accuracy metrics (if AI/ML is involved).",
      complianceDesign: "Regulatory standards your product complies with (GDPR, industry-specific).",
      patentStatus: "Patent filed/pending/none. Include reference numbers if applicable.",
      founderEducation: "Your education summary with degree names, institutions, and grades.",
      founderWorkHistory: "Relevant work history with company names, roles, and achievements.",
      founderAchievements: "Measurable achievements: projects delivered, revenue generated, users served.",
      relevantProjects: "Projects directly relevant to this business showing domain expertise.",
      funding: "100000",
      fundingSources: "£X Personal savings, £Y Family loan, £Z Grant applications. Total: £100,000.",
      monthlyProjections: "Month-by-month revenue and costs for 36 months. Year 1: £X revenue, £Y costs.",
      customerAcquisitionCost: "150",
      lifetimeValue: "2500",
      paybackPeriod: "4",
      detailedCosts: "Development: £X, Marketing: £X, Operations: £X, Team: £X. Provide detailed breakdown.",
      competitors: "List 5+ real competitors with their strengths, weaknesses, pricing, and market position.",
      competitiveDifferentiation: "Specific measurable advantages: X% better than Y, Z% faster than W.",
      customerInterviews: "Summary of 20-30 customer discovery interviews with key findings.",
      lettersOfIntent: "LOIs or pilot agreements if any: Company Name, Value, Date signed.",
      willingnessToPay: "Survey data on price sensitivity, conversion rates from trials.",
      marketSize: "TAM: Total market. SAM: Serviceable market. SOM: Obtainable market Year 1-3.",
      regulatoryRequirements: "All applicable regulations, certifications, and compliance requirements.",
      complianceTimeline: "Month-by-month timeline for achieving regulatory compliance.",
      complianceBudget: "50000",
      jobCreation: "12",
      hiringPlan: "Year 1: Role (£Salary). Year 2: Role (£Salary). Year 3: Role (£Salary).",
      specificRegions: "Year 1: Cities/regions. Year 2: Expansion cities. Year 3: National coverage.",
      expansion: "Vertical expansion into new sectors, horizontal into new customer segments.",
      internationalPlan: "Year 4+ international expansion plans (after UK validation).",
      vision: "5-year vision: market position, team size, revenue, customer impact.",
      targetEndorser: "Primary: Tech Nation / other endorsing body. Rationale for selection.",
      contactPointsStrategy: "6+ engagement points with endorser over 3 years.",
      experience: "Why you are uniquely qualified: technical expertise, industry knowledge, execution track record.",
      revenue: "Revenue model: pricing tiers, add-ons, unit economics (LTV, CAC, payback).",
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

          {/* Promo Code Section - Show on final step ONLY if user doesn't have active subscription */}
          {currentStep === steps.length - 1 && !userHasActiveSubscription && (
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
          
          {/* Show subscription status for premium users */}
          {currentStep === steps.length - 1 && userHasActiveSubscription && (
            <div className="mt-8 pt-6 border-t">
              <Badge className="bg-emerald-500 text-white">
                <Check className="w-3 h-3 mr-1" />
                {user?.subscriptionTier?.charAt(0).toUpperCase()}{user?.subscriptionTier?.slice(1)} Member - No payment required
              </Badge>
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
              {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? (userHasActiveSubscription ? "Generate Plan" : "Proceed to Payment") : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
