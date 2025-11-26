import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  Rocket, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Building2,
  Target,
  Globe,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Star,
  Shield,
  Zap,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

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

interface EligibilityGateProps {
  onComplete: (result: EligibilityResult) => void;
  onSkip?: () => void;
}

export function EligibilityGate({ onComplete, onSkip }: EligibilityGateProps) {
  const [step, setStep] = useState<'intro' | 'concept' | 'details' | 'assessing' | 'result'>('intro');
  const [formData, setFormData] = useState({
    businessConcept: '',
    industrySlug: '',
    targetMarket: '',
    problemStatement: '',
    proposedSolution: ''
  });
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const { data: industries = [], isLoading: industriesLoading } = useQuery<IndustryProfile[]>({
    queryKey: ['/api/industries']
  });

  const assessMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/eligibility/assess', data);
      return res.json();
    },
    onSuccess: (data: EligibilityResult) => {
      setResult(data);
      setStep('result');
    },
    onError: (error) => {
      console.error('Assessment error:', error);
    }
  });

  const handleSubmit = () => {
    setStep('assessing');
    assessMutation.mutate(formData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 70) return 'bg-green-500/10';
    if (score >= 50) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  const getEligibilityConfig = (band: string) => {
    switch (band) {
      case 'eligible':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          title: 'Strong Visa Potential',
          subtitle: 'Your business concept shows strong alignment with Innovator Founder Visa requirements',
          gradient: 'from-green-500 to-emerald-500'
        };
      case 'needs_improvement':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          title: 'Improvement Needed',
          subtitle: 'Your concept has potential but requires refinement to meet visa criteria',
          gradient: 'from-amber-500 to-orange-500'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          title: 'Significant Gaps Identified',
          subtitle: 'Your current concept may not meet the innovation requirements for this visa',
          gradient: 'from-red-500 to-rose-500'
        };
    }
  };

  const selectedIndustry = industries.find(i => i.slug === formData.industrySlug);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-testid="eligibility-gate">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full"
          >
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
                  <Shield className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl font-bold">
                  UK Innovator Founder Visa
                </CardTitle>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                  Eligibility Pre-Assessment
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Before we proceed, let's ensure your business concept aligns with visa requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Lightbulb className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Innovation Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll evaluate if your concept meets the "genuine innovation" requirement
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Scalability Check</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll assess growth potential and market expansion possibilities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Rocket className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Viability Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll review practical execution and sustainability factors
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    This 2-minute assessment helps identify potential issues early, saving you time and ensuring you're building a strong application from the start.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => setStep('concept')}
                  data-testid="button-start-assessment"
                >
                  Start Pre-Assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {onSkip && (
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground"
                    onClick={onSkip}
                    data-testid="button-skip-assessment"
                  >
                    Skip for now
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 'concept' && (
          <motion.div
            key="concept"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">Step 1 of 2</Badge>
                  <Progress value={50} className="h-2 flex-1" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Tell us about your business
                </CardTitle>
                <CardDescription>
                  Select your industry and describe your business concept
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry Sector *</Label>
                  <Select 
                    value={formData.industrySlug} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, industrySlug: val }))}
                  >
                    <SelectTrigger id="industry" data-testid="select-industry">
                      <SelectValue placeholder="Select your industry..." />
                    </SelectTrigger>
                    <SelectContent>
                      {industriesLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        industries.map((industry) => (
                          <SelectItem key={industry.slug} value={industry.slug}>
                            <div className="flex items-center gap-2">
                              <span>{industry.icon}</span>
                              <span>{industry.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedIndustry && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedIndustry.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concept">Business Concept *</Label>
                  <Textarea
                    id="concept"
                    placeholder="Describe your business idea in 2-3 sentences. What problem does it solve? What makes it unique?"
                    value={formData.businessConcept}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessConcept: e.target.value }))}
                    className="min-h-[120px]"
                    data-testid="textarea-concept"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.businessConcept.length}/500 characters
                  </p>
                </div>

                {selectedIndustry && selectedIndustry.visaCriticalFactors.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Key Visa Factors for {selectedIndustry.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustry.visaCriticalFactors.slice(0, 5).map((factor, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('intro')}
                  data-testid="button-back-intro"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep('details')}
                  disabled={!formData.industrySlug || !formData.businessConcept.trim()}
                  data-testid="button-next-details"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">Step 2 of 2</Badge>
                  <Progress value={100} className="h-2 flex-1" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Additional Details
                </CardTitle>
                <CardDescription>
                  Optional but helps improve assessment accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="problem">Problem Statement</Label>
                  <Textarea
                    id="problem"
                    placeholder="What specific problem are you solving? Who experiences this problem?"
                    value={formData.problemStatement}
                    onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                    className="min-h-[80px]"
                    data-testid="textarea-problem"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">Proposed Solution</Label>
                  <Textarea
                    id="solution"
                    placeholder="How does your solution address this problem? What's innovative about it?"
                    value={formData.proposedSolution}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposedSolution: e.target.value }))}
                    className="min-h-[80px]"
                    data-testid="textarea-solution"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market">Target Market</Label>
                  <Textarea
                    id="market"
                    placeholder="Who are your customers? What is your target market size?"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value }))}
                    className="min-h-[80px]"
                    data-testid="textarea-market"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('concept')}
                  data-testid="button-back-concept"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={assessMutation.isPending}
                  data-testid="button-assess"
                >
                  {assessMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Assessing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Assess Eligibility
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 'assessing' && (
          <motion.div
            key="assessing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full"
          >
            <Card className="border-primary/30">
              <CardContent className="py-12">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-24 h-24">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Your Concept</h3>
                    <p className="text-muted-foreground text-sm">
                      Our AI is evaluating innovation, scalability, and viability...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    >
                      <Progress value={100} className="h-2" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl w-full"
          >
            <Card className={`border-2 ${getEligibilityConfig(result.eligibilityBand).borderColor}`}>
              <CardHeader className="text-center pb-4">
                {(() => {
                  const config = getEligibilityConfig(result.eligibilityBand);
                  const IconComponent = config.icon;
                  return (
                    <>
                      <div className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
                        <IconComponent className={`h-8 w-8 ${config.color}`} />
                      </div>
                      <CardTitle className={`text-2xl ${config.color}`}>
                        {config.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {config.subtitle}
                      </CardDescription>
                    </>
                  );
                })()}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg text-center ${getScoreBackground(result.innovationScore)}`}>
                    <Lightbulb className={`h-6 w-6 mx-auto mb-2 ${getScoreColor(result.innovationScore)}`} />
                    <div className={`text-2xl font-bold ${getScoreColor(result.innovationScore)}`}>
                      {result.innovationScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Innovation</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${getScoreBackground(result.scalabilityScore)}`}>
                    <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${getScoreColor(result.scalabilityScore)}`} />
                    <div className={`text-2xl font-bold ${getScoreColor(result.scalabilityScore)}`}>
                      {result.scalabilityScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Scalability</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${getScoreBackground(result.viabilityScore)}`}>
                    <Rocket className={`h-6 w-6 mx-auto mb-2 ${getScoreColor(result.viabilityScore)}`} />
                    <div className={`text-2xl font-bold ${getScoreColor(result.viabilityScore)}`}>
                      {result.viabilityScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Viability</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${getScoreBackground(result.overallScore)} border ${getEligibilityConfig(result.eligibilityBand).borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className={`h-6 w-6 ${getScoreColor(result.overallScore)}`} />
                      <div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                        <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                          {result.overallScore}/100
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getEligibilityConfig(result.eligibilityBand).bgColor} ${getEligibilityConfig(result.eligibilityBand).color} border-none`}>
                        {result.eligibilityBand === 'eligible' ? 'High Potential' : 
                         result.eligibilityBand === 'needs_improvement' ? 'Needs Work' : 'Review Required'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {result.aiAnalysis && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                      {result.aiAnalysis}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {result.strengthAreas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-500 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {result.strengthAreas.map((strength, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.improvementAreas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-amber-500 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-1">
                        {result.improvementAreas.map((area, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {result.criticalGaps.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-red-500 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Critical Gaps to Address
                    </h4>
                    <ul className="space-y-1">
                      {result.criticalGaps.map((gap, idx) => (
                        <li key={idx} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => onComplete(result)}
                  data-testid="button-continue-application"
                >
                  {result.eligibilityBand === 'eligible' ? (
                    <>
                      Continue to Application
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : result.eligibilityBand === 'needs_improvement' ? (
                    <>
                      Continue with Guidance
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Get Expert Help
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep('concept');
                    setResult(null);
                  }}
                  data-testid="button-retry-assessment"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again with Different Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}