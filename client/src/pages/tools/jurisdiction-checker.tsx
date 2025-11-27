import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle, AlertTriangle, MapPin, Globe, FileCheck, Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'jurisdiction-checker',
  toolName: 'UK Jurisdiction & Eligibility Checker',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Advisor. Before applying for the UK Innovator Founder Visa, you need to verify you meet the eligibility requirements. Let me guide you through a comprehensive eligibility assessment!",
  questions: [
    {
      id: 'nationality',
      question: "What is your nationality and current country of residence? Some nationalities have different requirements or exemptions.",
      hint: "EU/EEA citizens have different pathways since Brexit",
      fieldKey: 'nationality'
    },
    {
      id: 'endorsement',
      question: "Have you secured or applied for endorsement from an approved endorsing body? This is a mandatory requirement.",
      hint: "You must have endorsement BEFORE applying for the visa",
      fieldKey: 'hasEndorsement'
    },
    {
      id: 'business-registration',
      question: "Is your business registered in the UK, or do you plan to register before your visa application?",
      hint: "Your business must be registered with Companies House",
      fieldKey: 'businessRegistration'
    },
    {
      id: 'english',
      question: "What's your English language proficiency level? Do you have a qualifying test result (IELTS, PTE, etc.) or exemption?",
      hint: "B1 level minimum required. Some nationalities are exempt.",
      fieldKey: 'englishLevel'
    },
    {
      id: 'funds',
      question: "Do you have the required maintenance funds of £1,270 available for at least 28 consecutive days?",
      hint: "Evidence must be from a regulated financial institution",
      fieldKey: 'hasMaintenanceFunds'
    },
    {
      id: 'investment',
      question: "What level of investment do you have secured for your business? Include both personal funds and external investment.",
      hint: "While no minimum is required, £50k+ strengthens your application",
      fieldKey: 'investmentAmount'
    }
  ],
  completionMessage: "I've assessed your eligibility for the UK Innovator Founder Visa. Based on your answers, I'll populate the eligibility checker with your status and highlight any areas that need attention."
};

type EligibilityCheck = {
  criterion: string;
  status: "pass" | "fail" | "warning" | "unknown";
  message: string;
};

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "France", 
  "India", "China", "Japan", "Brazil", "South Africa", "Nigeria", "Other"
];

export default function JurisdictionChecker() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('jurisdiction-checker-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("jurisdiction-checker-state");
    if (saved) {
      try {
        return JSON.parse(saved).formData || {
          currentCountry: "",
          nationality: "",
          hasUKBusiness: "",
          businessRegistration: "",
          hasEndorsement: "",
          investmentAmount: "",
          englishLevel: "",
          hasMaintenanceFunds: "",
        };
      } catch { }
    }
    return {
      currentCountry: "",
      nationality: "",
      hasUKBusiness: "",
      businessRegistration: "",
      hasEndorsement: "",
      investmentAmount: "",
      englishLevel: "",
      hasMaintenanceFunds: "",
    };
  });

  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("checker");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('jurisdiction-checker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const updates: Partial<typeof formData> = {};
    if (answers.countryOfOrigin) {
      updates.countryOfOrigin = answers.countryOfOrigin;
    }
    if (answers.businessActivities) {
      updates.businessActivities = answers.businessActivities;
    }
    if (answers.internationalOperations) {
      updates.internationalOperations = answers.internationalOperations;
    }
    if (answers.regulatedSectors) {
      updates.regulatedSectors = answers.regulatedSectors;
    }
    if (answers.taxConsiderations) {
      updates.taxConsiderations = answers.taxConsiderations;
    }
    setFormData(prev => ({ ...prev, ...updates }));
    setMode('traditional');
  };

  const triggerAutoSave = useCallback((data: typeof formData) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("jurisdiction-checker-state", JSON.stringify({ formData: data }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateField = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    triggerAutoSave(newData);
  };

  const getEligibilityChecks = (): EligibilityCheck[] => {
    const checks: EligibilityCheck[] = [];

    if (formData.hasEndorsement === "yes") {
      checks.push({ criterion: "Endorsement", status: "pass", message: "You have endorsement from an approved body" });
    } else if (formData.hasEndorsement === "pending") {
      checks.push({ criterion: "Endorsement", status: "warning", message: "Endorsement application pending" });
    } else if (formData.hasEndorsement === "no") {
      checks.push({ criterion: "Endorsement", status: "fail", message: "Endorsement required from approved body" });
    } else {
      checks.push({ criterion: "Endorsement", status: "unknown", message: "Please specify endorsement status" });
    }

    if (formData.businessRegistration === "uk") {
      checks.push({ criterion: "Business Registration", status: "pass", message: "Business registered in the UK" });
    } else if (formData.businessRegistration === "planning") {
      checks.push({ criterion: "Business Registration", status: "warning", message: "Plan to register in UK - ensure this is done before visa submission" });
    } else if (formData.businessRegistration === "other") {
      checks.push({ criterion: "Business Registration", status: "fail", message: "Business must be registered in the UK" });
    } else {
      checks.push({ criterion: "Business Registration", status: "unknown", message: "Please specify business registration location" });
    }

    if (formData.englishLevel === "native" || formData.englishLevel === "c1c2") {
      checks.push({ criterion: "English Language", status: "pass", message: "English requirement met" });
    } else if (formData.englishLevel === "b1b2") {
      checks.push({ criterion: "English Language", status: "pass", message: "B1/B2 level - acceptable for visa application" });
    } else if (formData.englishLevel === "below") {
      checks.push({ criterion: "English Language", status: "fail", message: "Minimum B1 level required" });
    } else {
      checks.push({ criterion: "English Language", status: "unknown", message: "Please specify English proficiency level" });
    }

    if (formData.hasMaintenanceFunds === "yes") {
      checks.push({ criterion: "Maintenance Funds", status: "pass", message: "Required £1,270 maintenance funds available" });
    } else if (formData.hasMaintenanceFunds === "no") {
      checks.push({ criterion: "Maintenance Funds", status: "fail", message: "Minimum £1,270 required for 28 consecutive days" });
    } else {
      checks.push({ criterion: "Maintenance Funds", status: "unknown", message: "Please confirm maintenance funds availability" });
    }

    if (formData.investmentAmount === "50k+") {
      checks.push({ criterion: "Investment Amount", status: "pass", message: "Investment exceeds £50,000 - typically strong for endorsement" });
    } else if (formData.investmentAmount === "under50k") {
      checks.push({ criterion: "Investment Amount", status: "pass", message: "Under £50,000 - acceptable if business plan justifies this level" });
    } else if (formData.investmentAmount === "none") {
      checks.push({ criterion: "Investment Amount", status: "warning", message: "Self-funding - ensure evidence of personal investment" });
    } else {
      checks.push({ criterion: "Investment Amount", status: "unknown", message: "Please specify investment amount" });
    }

    return checks;
  };

  const eligibilityChecks = getEligibilityChecks();
  const passCount = eligibilityChecks.filter(c => c.status === "pass").length;
  const failCount = eligibilityChecks.filter(c => c.status === "fail").length;
  const warningCount = eligibilityChecks.filter(c => c.status === "warning").length;

  const getStatusIcon = (status: EligibilityCheck["status"]) => {
    switch (status) {
      case "pass": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "fail": return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleExportWord = () => {
    generateWord({
      title: "UK Jurisdiction & Eligibility Check",
      subtitle: "Innovator Founder Visa Eligibility Assessment",
      filename: "jurisdiction-check",
      sections: [
        { type: "heading", content: "Eligibility Summary", level: 1 },
        { type: "paragraph", content: `Passed: ${passCount} | Warnings: ${warningCount} | Failed: ${failCount}` },
        { type: "divider" },
        { type: "heading", content: "Detailed Results", level: 2 },
        ...eligibilityChecks.map(check => ({
          type: "paragraph" as const,
          content: `${check.criterion}: ${check.status.toUpperCase()} - ${check.message}`
        })),
        { type: "divider" },
        { type: "heading", content: "Applicant Information", level: 2 },
        { type: "paragraph", content: `Current Country: ${formData.currentCountry || "Not specified"}` },
        { type: "paragraph", content: `Nationality: ${formData.nationality || "Not specified"}` },
      ],
    });
    toast({ title: "Export Complete", description: "Eligibility check exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("jurisdiction-checker-state", JSON.stringify({ formData }));
    toast({ title: "Saved", description: "Your eligibility check has been saved" });
  };

  const handleCheckEligibility = () => {
    setShowResults(true);
    setActiveTab("results");
  };

  return (
    <ToolAccessGuard requiredTier="free" toolName="UK Jurisdiction & Eligibility Checker">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">UK Jurisdiction & Eligibility Checker</h1>
                <p className="text-muted-foreground">Verify your eligibility for the UK Innovator Founder Visa</p>
              </div>
              <AiTraditionalToggle
                mode={mode}
                onModeChange={setMode}
                aiLabel="AI-Guided"
                traditionalLabel="Traditional Form"
              />
            </div>
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
              />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Sage, our Compliance Expert, helps you verify UK visa eligibility.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Check your country of origin and nationality</li>
                    <li>Understand business activity requirements</li>
                    <li>Identify regulated sectors considerations</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the checker when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="jurisdiction-checker"
            toolName="UK Jurisdiction & Eligibility Checker"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="checker" data-testid="tab-checker">Eligibility Check</TabsTrigger>
                <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
                <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
              </TabsList>

              <TabsContent value="checker">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Eligibility Assessment
                    </CardTitle>
                    <CardDescription>Answer the questions below to check your eligibility</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="currentCountry">Current Country of Residence</Label>
                        <Select value={formData.currentCountry} onValueChange={(v) => updateField("currentCountry", v)}>
                          <SelectTrigger data-testid="select-current-country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Select value={formData.nationality} onValueChange={(v) => updateField("nationality", v)}>
                          <SelectTrigger data-testid="select-nationality">
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Do you have endorsement from an approved body?</Label>
                      <RadioGroup value={formData.hasEndorsement} onValueChange={(v) => updateField("hasEndorsement", v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="endorsement-yes" />
                          <Label htmlFor="endorsement-yes">Yes, I have endorsement</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pending" id="endorsement-pending" />
                          <Label htmlFor="endorsement-pending">Application pending</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="endorsement-no" />
                          <Label htmlFor="endorsement-no">No endorsement yet</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>Where is your business registered?</Label>
                      <RadioGroup value={formData.businessRegistration} onValueChange={(v) => updateField("businessRegistration", v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="uk" id="reg-uk" />
                          <Label htmlFor="reg-uk">Registered in the UK</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="planning" id="reg-planning" />
                          <Label htmlFor="reg-planning">Planning to register in UK</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="reg-other" />
                          <Label htmlFor="reg-other">Registered elsewhere</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>English Language Proficiency</Label>
                      <RadioGroup value={formData.englishLevel} onValueChange={(v) => updateField("englishLevel", v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="native" id="eng-native" />
                          <Label htmlFor="eng-native">Native English speaker</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="c1c2" id="eng-c1c2" />
                          <Label htmlFor="eng-c1c2">C1/C2 Level (Advanced)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="b1b2" id="eng-b1b2" />
                          <Label htmlFor="eng-b1b2">B1/B2 Level (Intermediate)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="below" id="eng-below" />
                          <Label htmlFor="eng-below">Below B1 Level</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>Do you have £1,270 maintenance funds for 28 consecutive days?</Label>
                      <RadioGroup value={formData.hasMaintenanceFunds} onValueChange={(v) => updateField("hasMaintenanceFunds", v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="funds-yes" />
                          <Label htmlFor="funds-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="funds-no" />
                          <Label htmlFor="funds-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>Investment Amount</Label>
                      <RadioGroup value={formData.investmentAmount} onValueChange={(v) => updateField("investmentAmount", v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="50k+" id="inv-50k" />
                          <Label htmlFor="inv-50k">£50,000 or more</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="under50k" id="inv-under50k" />
                          <Label htmlFor="inv-under50k">Under £50,000</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="inv-none" />
                          <Label htmlFor="inv-none">Self-funding only</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button onClick={handleCheckEligibility} className="w-full" size="lg" data-testid="button-check-eligibility">
                      <FileCheck className="w-4 h-4 mr-2" />
                      Check My Eligibility
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-primary" />
                      Eligibility Results
                    </CardTitle>
                    <CardDescription>Based on your responses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="pt-4 text-center">
                          <div className="text-3xl font-bold text-green-500">{passCount}</div>
                          <div className="text-sm text-muted-foreground">Passed</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-amber-500/10 border-amber-500/30">
                        <CardContent className="pt-4 text-center">
                          <div className="text-3xl font-bold text-amber-500">{warningCount}</div>
                          <div className="text-sm text-muted-foreground">Warnings</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="pt-4 text-center">
                          <div className="text-3xl font-bold text-red-500">{failCount}</div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </CardContent>
                      </Card>
                    </div>

                    {failCount > 0 && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          You have {failCount} failing criteria that must be addressed before applying.
                        </AlertDescription>
                      </Alert>
                    )}

                    {failCount === 0 && warningCount > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You appear eligible but have {warningCount} areas requiring attention.
                        </AlertDescription>
                      </Alert>
                    )}

                    {failCount === 0 && warningCount === 0 && passCount > 0 && (
                      <Alert className="border-green-500 bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          Congratulations! You appear to meet all basic eligibility requirements.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      {eligibilityChecks.map((check, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg" data-testid={`check-result-${index}`}>
                          {getStatusIcon(check.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{check.criterion}</span>
                              <Badge variant={check.status === "pass" ? "default" : check.status === "fail" ? "destructive" : "secondary"}>
                                {check.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      UK Innovator Founder Visa Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Endorsement</h4>
                        <p className="text-sm text-muted-foreground">You must be endorsed by an approved body that has assessed your business idea as innovative, viable, and scalable.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Business in the UK</h4>
                        <p className="text-sm text-muted-foreground">Your business must be registered in the UK or you must be planning to register it here.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">English Language</h4>
                        <p className="text-sm text-muted-foreground">You must prove your English language ability at B1 level or higher.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Maintenance Funds</h4>
                        <p className="text-sm text-muted-foreground">You must have at least £1,270 in your bank account for 28 consecutive days.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Investment</h4>
                        <p className="text-sm text-muted-foreground">While there is no minimum investment requirement, having adequate funding strengthens your application.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
            </>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
