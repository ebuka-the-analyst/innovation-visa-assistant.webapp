import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Building2,
  Lightbulb,
  TrendingUp,
  Rocket,
  Target,
  Users,
  DollarSign,
  Shield,
  Sparkles,
  Save,
  ChevronRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { EligibilityGate } from "@/components/eligibility-gate";
import { IndustryConfigurator } from "@/components/industry-configurator";
import { InnovationCoachPanel } from "@/components/innovation-coach-panel";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface IndustryProfile {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  visaCriticalFactors: string[];
  innovationMarkers: string[];
  scalabilityIndicators: string[];
  viabilityMetrics: string[];
  requiredSections: string[];
  optionalSections: string[];
}

interface EligibilityResult {
  assessmentId: string;
  innovationScore: number;
  scalabilityScore: number;
  viabilityScore: number;
  overallScore: number;
  eligibilityBand: 'eligible' | 'needs_improvement' | 'not_eligible';
  recommendations: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  criticalGaps: string[];
  aiAnalysis: string;
  accessToken: string;
}

interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: FormField[];
  required: boolean;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number';
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
  visaCritical?: boolean;
}

const baseSections: FormSection[] = [
  {
    id: 'business_overview',
    title: 'Business Overview',
    description: 'Core information about your business concept',
    icon: Building2,
    required: true,
    fields: [
      { id: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Enter your business name', required: true },
      { id: 'tagline', label: 'One-Line Description', type: 'text', placeholder: 'Describe your business in one sentence', required: true },
      { id: 'founding_date', label: 'Founded / Planned Launch', type: 'text', placeholder: 'e.g., January 2024 or Planned Q2 2025' },
      { id: 'legal_structure', label: 'Legal Structure', type: 'select', options: ['Limited Company (Ltd)', 'Limited Liability Partnership (LLP)', 'Not yet incorporated', 'Other'], required: true }
    ]
  },
  {
    id: 'innovation',
    title: 'Innovation & Novelty',
    description: 'Demonstrate what makes your business genuinely innovative',
    icon: Lightbulb,
    required: true,
    fields: [
      { id: 'innovation_description', label: 'What is innovative about your business?', type: 'textarea', placeholder: 'Describe the novel aspects of your product, service, or business model...', required: true, visaCritical: true, helpText: 'Endorsers look for genuine innovation - not just "new to you" but new to the market' },
      { id: 'market_gap', label: 'What market gap does this address?', type: 'textarea', placeholder: 'Explain the problem or opportunity you\'ve identified...', required: true, visaCritical: true },
      { id: 'competitive_advantage', label: 'How is this different from existing solutions?', type: 'textarea', placeholder: 'Describe your unique selling points and competitive advantages...', required: true, visaCritical: true },
      { id: 'ip_strategy', label: 'Intellectual Property Strategy', type: 'select', options: ['Patent pending/filed', 'Trade secrets', 'Proprietary technology', 'Trademark registered', 'No formal IP yet', 'Not applicable'] }
    ]
  },
  {
    id: 'scalability',
    title: 'Scalability & Growth',
    description: 'Show how your business can grow significantly',
    icon: TrendingUp,
    required: true,
    fields: [
      { id: 'growth_strategy', label: 'Growth Strategy', type: 'textarea', placeholder: 'How do you plan to scale the business?', required: true, visaCritical: true },
      { id: 'target_market_size', label: 'Target Market Size', type: 'textarea', placeholder: 'What is your addressable market? Include numbers if possible...', required: true, visaCritical: true },
      { id: 'expansion_plans', label: 'UK & International Expansion', type: 'textarea', placeholder: 'How will you expand in the UK and potentially internationally?', required: true, visaCritical: true },
      { id: 'job_creation', label: 'Job Creation Projections', type: 'textarea', placeholder: 'How many jobs do you expect to create? Timeline?', visaCritical: true }
    ]
  },
  {
    id: 'viability',
    title: 'Viability & Execution',
    description: 'Demonstrate your ability to execute the plan',
    icon: Rocket,
    required: true,
    fields: [
      { id: 'revenue_model', label: 'Revenue Model', type: 'textarea', placeholder: 'How will your business generate revenue?', required: true, visaCritical: true },
      { id: 'current_traction', label: 'Current Traction', type: 'textarea', placeholder: 'Any existing customers, revenue, partnerships, or validation?', visaCritical: true },
      { id: 'funding_status', label: 'Funding Status', type: 'select', options: ['Self-funded / Bootstrapped', 'Friends & Family', 'Angel Investment', 'Seed Funding', 'Series A+', 'Seeking Investment', 'Grant Funded'] },
      { id: 'funding_requirements', label: 'Investment Required', type: 'textarea', placeholder: 'How much funding do you need and for what?' }
    ]
  },
  {
    id: 'team',
    title: 'Team & Expertise',
    description: 'Your team\'s capability to deliver',
    icon: Users,
    required: true,
    fields: [
      { id: 'founder_background', label: 'Your Background & Expertise', type: 'textarea', placeholder: 'Describe your relevant experience and qualifications...', required: true, visaCritical: true },
      { id: 'team_composition', label: 'Team Composition', type: 'textarea', placeholder: 'Who else is on your team? Their roles and expertise?' },
      { id: 'advisory_board', label: 'Advisors / Mentors', type: 'textarea', placeholder: 'Any advisors or mentors supporting your venture?' },
      { id: 'key_hires', label: 'Key Hires Planned', type: 'textarea', placeholder: 'What critical roles do you need to fill?' }
    ]
  },
  {
    id: 'financials',
    title: 'Financial Projections',
    description: 'Your financial outlook and projections',
    icon: DollarSign,
    required: true,
    fields: [
      { id: 'year1_revenue', label: 'Year 1 Revenue Projection', type: 'text', placeholder: 'e.g., £50,000', required: true },
      { id: 'year3_revenue', label: 'Year 3 Revenue Projection', type: 'text', placeholder: 'e.g., £500,000', required: true },
      { id: 'breakeven_timeline', label: 'Breakeven Timeline', type: 'select', options: ['Already profitable', '6-12 months', '1-2 years', '2-3 years', '3+ years'] },
      { id: 'financial_assumptions', label: 'Key Financial Assumptions', type: 'textarea', placeholder: 'What assumptions underpin your projections?' }
    ]
  }
];

export default function AdaptiveIntakePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [stage, setStage] = useState<'eligibility' | 'industry' | 'questionnaire'>('eligibility');
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryProfile | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showCoachPanel, setShowCoachPanel] = useState(true);
  const [savedProgress, setSavedProgress] = useState(false);

  const { data: user } = useQuery<any>({ queryKey: ['/api/user'] });

  const activeSections = baseSections.filter(section => {
    if (!selectedIndustry) return section.required;
    return selectedIndustry.requiredSections.includes(section.id) || section.required;
  });

  const currentSection = activeSections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / activeSections.length) * 100;

  const saveProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/business-plans', {
        ...data,
        status: 'draft'
      });
      return res.json();
    },
    onSuccess: () => {
      setSavedProgress(true);
      toast({
        title: "Progress Saved",
        description: "Your application progress has been saved.",
      });
    }
  });

  const handleEligibilityComplete = (result: EligibilityResult) => {
    setEligibilityResult(result);
    setFormData(prev => ({
      ...prev,
      eligibilityScore: result.overallScore,
      eligibilityBand: result.eligibilityBand,
      businessConcept: result.accessToken
    }));
    setStage('industry');
  };

  const handleIndustrySelect = (industry: IndustryProfile) => {
    setSelectedIndustry(industry);
    setFormData(prev => ({
      ...prev,
      industrySlug: industry.slug,
      industryName: industry.name
    }));
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setSavedProgress(false);
  };

  const handleNextSection = () => {
    if (currentSectionIndex < activeSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    saveProgressMutation.mutate(formData);
    toast({
      title: "Application Submitted",
      description: "Your application has been submitted for review.",
    });
    setLocation('/dashboard');
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    
    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.visaCritical && (
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Visa Critical
            </Badge>
          )}
        </div>
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {field.helpText}
          </p>
        )}

        {field.type === 'text' && (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            data-testid={`input-${field.id}`}
          />
        )}

        {field.type === 'textarea' && (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="min-h-[100px]"
            data-testid={`textarea-${field.id}`}
          />
        )}

        {field.type === 'select' && field.options && (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            className="grid grid-cols-2 gap-2"
          >
            {field.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {field.type === 'checkbox' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm cursor-pointer">
              {field.placeholder}
            </Label>
          </div>
        )}
      </div>
    );
  };

  if (stage === 'eligibility') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <EligibilityGate 
          onComplete={handleEligibilityComplete}
          onSkip={() => setStage('industry')}
        />
      </div>
    );
  }

  if (stage === 'industry') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4" data-testid="industry-selection-stage">
        <div className="max-w-4xl mx-auto space-y-8">
          {eligibilityResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                "border-2",
                eligibilityResult.eligibilityBand === 'eligible' 
                  ? "border-green-500/30 bg-green-500/5"
                  : eligibilityResult.eligibilityBand === 'needs_improvement'
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-red-500/30 bg-red-500/5"
              )}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        eligibilityResult.eligibilityBand === 'eligible' 
                          ? "bg-green-500/10"
                          : eligibilityResult.eligibilityBand === 'needs_improvement'
                          ? "bg-amber-500/10"
                          : "bg-red-500/10"
                      )}>
                        <Shield className={cn(
                          "h-5 w-5",
                          eligibilityResult.eligibilityBand === 'eligible' 
                            ? "text-green-500"
                            : eligibilityResult.eligibilityBand === 'needs_improvement'
                            ? "text-amber-500"
                            : "text-red-500"
                        )} />
                      </div>
                      <div>
                        <div className="font-semibold">
                          Pre-Assessment Score: {eligibilityResult.overallScore}/100
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {eligibilityResult.eligibilityBand === 'eligible' 
                            ? "Strong potential for visa approval"
                            : eligibilityResult.eligibilityBand === 'needs_improvement'
                            ? "Some areas need strengthening"
                            : "Consider reviewing your concept"}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {eligibilityResult.eligibilityBand.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <IndustryConfigurator
            selectedIndustry={selectedIndustry?.slug}
            onSelect={handleIndustrySelect}
          />

          {selectedIndustry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={() => setStage('questionnaire')}
                className="gap-2"
                data-testid="button-continue-questionnaire"
              >
                Continue to Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" data-testid="questionnaire-stage">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStage('industry')}
                data-testid="button-back-industry"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-sm">Innovator Founder Visa Application</h1>
                <p className="text-xs text-muted-foreground">
                  {selectedIndustry?.name} - Section {currentSectionIndex + 1} of {activeSections.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-32 h-2" />
              <Badge variant="outline">{Math.round(progress)}%</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveProgressMutation.mutate(formData)}
                disabled={saveProgressMutation.isPending}
                data-testid="button-save-progress"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {activeSections.map((section, idx) => {
                const IconComponent = section.icon;
                const isActive = idx === currentSectionIndex;
                const isComplete = idx < currentSectionIndex;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSectionIndex(idx)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : isComplete
                        ? "bg-green-500/10 text-green-700 dark:text-green-300"
                        : "hover:bg-muted"
                    )}
                    data-testid={`nav-section-${section.id}`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {(() => {
                          const IconComponent = currentSection.icon;
                          return <IconComponent className="h-5 w-5 text-primary" />;
                        })()}
                      </div>
                      <div>
                        <CardTitle>{currentSection.title}</CardTitle>
                        <CardDescription>{currentSection.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentSection.fields.map(renderField)}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={handlePrevSection}
                      disabled={currentSectionIndex === 0}
                      data-testid="button-prev-section"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentSectionIndex === activeSections.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        className="gap-2"
                        data-testid="button-submit-application"
                      >
                        <FileText className="h-4 w-4" />
                        Submit Application
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextSection}
                        className="gap-2"
                        data-testid="button-next-section"
                      >
                        Next Section
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden xl:block">
            {eligibilityResult && selectedIndustry && (
              <InnovationCoachPanel
                businessConcept={formData.businessConcept || ''}
                industrySlug={selectedIndustry.slug}
                currentSection={currentSection.id}
                formData={formData}
                onSuggestionApply={(field, value) => {
                  handleFieldChange(field, value);
                }}
                minimized={!showCoachPanel}
                onToggleMinimize={() => setShowCoachPanel(!showCoachPanel)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}