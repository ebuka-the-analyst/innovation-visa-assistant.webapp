import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, Building2, Briefcase, CreditCard, FileText, Users, CheckCircle2, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
};

type SettlementCategory = {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'settlement-guide',
  toolName: 'Post-Approval Settlement Guide',
  agent: 'sage',
  greeting: "Welcome! I'm Sage, your compliance expert. Congratulations on your visa approval! Let me guide you through the essential steps for settling in the UK. I'll help you understand what needs to be done and in what order.",
  questions: [
    { id: 'arrival', question: "When are you planning to arrive in the UK?", hint: "You must collect your BRP within 10 days of arrival", fieldKey: 'arrivalDate', fieldType: 'text' },
    { id: 'location', question: "Which UK city or region will you be settling in?", hint: "This affects local council registration and GP options", fieldKey: 'location', fieldType: 'text' },
    { id: 'accommodation', question: "Do you have accommodation arranged for your arrival?", hint: "You'll need a UK address for BRP collection and official registration", fieldKey: 'hasAccommodation', fieldType: 'text' },
    { id: 'banking', question: "Have you researched UK banking options for personal and business accounts?", hint: "Some banks offer startup-friendly accounts with faster verification", fieldKey: 'bankingResearch', fieldType: 'text' },
    { id: 'company', question: "Is your company already registered with Companies House?", hint: "If not, this is a priority task within the first week", fieldKey: 'companyRegistered', fieldType: 'text' },
    { id: 'support', question: "Do you have professional contacts in the UK (accountant, solicitor, mentors)?", hint: "Building your support network early accelerates your settlement", fieldKey: 'hasSupport', fieldType: 'text' },
  ],
  completionMessage: "I've understood your settlement situation. Let me show you a prioritized checklist tailored to your circumstances."
};

const DEFAULT_CATEGORIES: SettlementCategory[] = [
  {
    id: "arrival",
    title: "Arrival Essentials",
    icon: "Home",
    items: [
      { id: "brp", label: "Collect Biometric Residence Permit (BRP)", description: "Collect within 10 days of arrival from designated Post Office", completed: false },
      { id: "address", label: "Register UK Address", description: "Register your UK address for official correspondence", completed: false },
      { id: "nino", label: "Apply for National Insurance Number", description: "Apply through the HMRC helpline or online", completed: false },
      { id: "gp", label: "Register with a GP", description: "Register with a local General Practitioner for healthcare", completed: false },
    ]
  },
  {
    id: "banking",
    title: "Banking & Finance",
    icon: "CreditCard",
    items: [
      { id: "bank-account", label: "Open UK Bank Account", description: "Open a business and personal bank account", completed: false },
      { id: "credit-history", label: "Build Credit History", description: "Start building UK credit history with credit builder cards", completed: false },
      { id: "business-banking", label: "Set Up Business Banking", description: "Open dedicated business account for your company", completed: false },
      { id: "accounting", label: "Set Up Accounting System", description: "Choose accounting software and set up bookkeeping", completed: false },
    ]
  },
  {
    id: "business",
    title: "Business Setup",
    icon: "Building2",
    items: [
      { id: "companies-house", label: "Register with Companies House", description: "Complete company registration if not already done", completed: false },
      { id: "hmrc-register", label: "Register with HMRC", description: "Register for Corporation Tax, VAT if applicable, PAYE", completed: false },
      { id: "business-address", label: "Establish Business Address", description: "Set up registered office and trading address", completed: false },
      { id: "insurance", label: "Get Business Insurance", description: "Obtain necessary business insurance policies", completed: false },
      { id: "contracts", label: "Draft Standard Contracts", description: "Create template contracts for customers and suppliers", completed: false },
    ]
  },
  {
    id: "compliance",
    title: "Compliance & Reporting",
    icon: "FileText",
    items: [
      { id: "endorser-contact", label: "Contact Endorsement Body", description: "Notify your endorser of your arrival and business activities", completed: false },
      { id: "reporting", label: "Set Up Reporting Schedule", description: "Understand and schedule required progress reports", completed: false },
      { id: "gdpr", label: "Implement GDPR Compliance", description: "Ensure data protection compliance for your business", completed: false },
      { id: "employment-law", label: "Understand Employment Law", description: "Review UK employment law requirements if hiring", completed: false },
    ]
  },
  {
    id: "network",
    title: "Network & Support",
    icon: "Users",
    items: [
      { id: "accelerator", label: "Join Startup Accelerator/Network", description: "Connect with startup communities and accelerators", completed: false },
      { id: "mentors", label: "Find Mentors and Advisors", description: "Build relationships with industry mentors", completed: false },
      { id: "events", label: "Attend Industry Events", description: "Participate in relevant networking events", completed: false },
      { id: "professional-services", label: "Engage Professional Services", description: "Find accountant, solicitor, and other professionals", completed: false },
    ]
  },
];

export default function SettlementGuide() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('settlement-guide-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('settlement-guide-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('settlement-guide-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    setMode('traditional');
  };

  const [categories, setCategories] = useState<SettlementCategory[]>(() => {
    const saved = localStorage.getItem("settlement-guide-state");
    if (saved) {
      try {
        return JSON.parse(saved).categories || DEFAULT_CATEGORIES;
      } catch { }
    }
    return DEFAULT_CATEGORIES;
  });

  const [activeTab, setActiveTab] = useState("checklist");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newCategories: SettlementCategory[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("settlement-guide-state", JSON.stringify({ categories: newCategories }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const toggleItem = (categoryId: string, itemId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return cat;
    });
    setCategories(newCategories);
    triggerAutoSave(newCategories);
  };

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = categories.reduce((acc, cat) => acc + cat.items.filter(i => i.completed).length, 0);
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case "Home": return <Home className="w-5 h-5" />;
      case "CreditCard": return <CreditCard className="w-5 h-5" />;
      case "Building2": return <Building2 className="w-5 h-5" />;
      case "FileText": return <FileText className="w-5 h-5" />;
      case "Users": return <Users className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const getCategoryProgress = (category: SettlementCategory) => {
    const completed = category.items.filter(i => i.completed).length;
    return Math.round((completed / category.items.length) * 100);
  };

  const handleExportWord = () => {
    generateWord({
      title: "Post-Approval Settlement Guide",
      subtitle: "UK Innovator Founder Visa Settlement Checklist",
      filename: "settlement-guide",
      sections: [
        { type: "heading", content: "Settlement Progress", level: 1 },
        { type: "paragraph", content: `Overall Progress: ${progressPercent}% complete (${completedItems}/${totalItems} tasks)` },
        { type: "divider" },
        ...categories.flatMap(cat => [
          { type: "heading" as const, content: cat.title, level: 2 },
          ...cat.items.map(item => ({
            type: "paragraph" as const,
            content: `${item.completed ? "[X]" : "[ ]"} ${item.label} - ${item.description}`
          })),
        ]),
      ],
    });
    toast({ title: "Export Complete", description: "Settlement guide exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("settlement-guide-state", JSON.stringify({ categories }));
    toast({ title: "Saved", description: "Your progress has been saved" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Post-Approval Settlement Guide">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2">Post-Approval Settlement Guide</h1>
            <p className="text-muted-foreground">Complete checklist for settling in the UK after visa approval</p>
          </div>

          <ToolUtilityBar
            toolId="settlement-guide"
            toolName="Post-Approval Settlement Guide"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          <div className="flex justify-end mt-4 mb-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <div className="mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Settlement Progress
                </CardTitle>
                <CardDescription>Track your post-approval settlement tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {completedItems} of {totalItems} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist</TabsTrigger>
                <TabsTrigger value="timeline" data-testid="tab-timeline">Recommended Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist">
                <Accordion type="single" collapsible defaultValue="arrival">
                  {categories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getCategoryIcon(category.icon)}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{category.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.items.filter(i => i.completed).length}/{category.items.length} completed
                            </div>
                          </div>
                          <Progress value={getCategoryProgress(category)} className="w-24 h-2 ml-4" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {category.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer"
                              onClick={() => toggleItem(category.id, item.id)}
                              data-testid={`checklist-item-${item.id}`}
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => toggleItem(category.id, item.id)}
                                data-testid={`checkbox-${item.id}`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {item.label}
                                  </span>
                                  {item.completed && (
                                    <Badge variant="default" className="bg-green-500">Done</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Recommended Settlement Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-8">
                        <div className="relative pl-14">
                          <div className="absolute left-4 -translate-x-1/2 bg-background p-1">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <Card>
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Week 1: Arrival Essentials</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Collect BRP from Post Office</li>
                                <li>Register UK address</li>
                                <li>Apply for National Insurance Number</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="relative pl-14">
                          <div className="absolute left-4 -translate-x-1/2 bg-background p-1">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <Card>
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Week 2-3: Banking & Finance</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Open personal and business bank accounts</li>
                                <li>Set up accounting system</li>
                                <li>Register with GP</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="relative pl-14">
                          <div className="absolute left-4 -translate-x-1/2 bg-background p-1">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <Card>
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Week 4-6: Business Setup</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Complete Companies House registration</li>
                                <li>Register with HMRC</li>
                                <li>Obtain business insurance</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="relative pl-14">
                          <div className="absolute left-4 -translate-x-1/2 bg-background p-1">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <Card>
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Month 2-3: Network & Growth</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Contact endorsement body</li>
                                <li>Join startup networks</li>
                                <li>Engage professional services</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
