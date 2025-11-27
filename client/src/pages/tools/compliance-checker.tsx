import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertTriangle, CheckCircle2, Save, Share2, Lightbulb, Calendar, RefreshCw, Shield } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const ITEMS = [
  {id:"1",name:"Company Structure Audit",cat:"Legal",pen:"Critical"},
  {id:"2",name:"Ownership & Equity Verification",cat:"Legal",pen:"High"},
  {id:"3",name:"Director & Board Compliance",cat:"Legal",pen:"Critical"},
  {id:"4",name:"Shareholder Records",cat:"Legal",pen:"High"},
  {id:"5",name:"Annual Accounts (3 years)",cat:"Financial",pen:"Critical"},
  {id:"6",name:"Tax Returns Filed",cat:"Tax",pen:"Critical"},
  {id:"7",name:"Payroll & PAYE Compliance",cat:"HR",pen:"High"},
  {id:"8",name:"Employee Records Complete",cat:"HR",pen:"High"}
];

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'compliance-checker',
  toolName: 'Compliance Checker',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you conduct a thorough compliance audit for your UK Innovator Founder Visa application. Proper corporate compliance is essential for endorsement approval. Let's work through your compliance status together.",
  questions: [
    {
      id: 'company-structure',
      question: "Is your company properly registered at Companies House with correct structure?",
      hint: "This includes proper Ltd formation, registered office, and company articles",
      fieldKey: 'company_structure'
    },
    {
      id: 'ownership-verification',
      question: "Have you verified and documented all ownership and equity arrangements?",
      hint: "Include shareholder agreements, cap tables, and beneficial ownership records",
      fieldKey: 'ownership_verification'
    },
    {
      id: 'director-compliance',
      question: "Are all directors properly appointed and fulfilling their legal duties?",
      hint: "Directors must file annual returns and maintain statutory records",
      fieldKey: 'director_compliance'
    },
    {
      id: 'financial-records',
      question: "Are your annual accounts filed and up to date for the last 3 years?",
      hint: "Required by Companies House - late filing results in penalties",
      fieldKey: 'financial_records'
    },
    {
      id: 'tax-compliance',
      question: "Are all tax returns filed and is your company tax-compliant with HMRC?",
      hint: "Corporation tax, VAT if applicable, and any PAYE obligations",
      fieldKey: 'tax_compliance'
    },
    {
      id: 'hr-records',
      question: "Do you have complete HR records including contracts and right-to-work checks?",
      hint: "Employment contracts, payroll records, and immigration compliance for employees",
      fieldKey: 'hr_records'
    }
  ]
};

export default function ComplianceChecker() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('compliance-checker-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('compliance-checker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newChecks: any = {};
    if (answers.company_structure?.toLowerCase().includes('yes')) newChecks["1"] = true;
    if (answers.ownership_verification?.toLowerCase().includes('yes')) {
      newChecks["2"] = true;
      newChecks["4"] = true;
    }
    if (answers.director_compliance?.toLowerCase().includes('yes')) newChecks["3"] = true;
    if (answers.financial_records?.toLowerCase().includes('yes')) newChecks["5"] = true;
    if (answers.tax_compliance?.toLowerCase().includes('yes')) newChecks["6"] = true;
    if (answers.hr_records?.toLowerCase().includes('yes')) {
      newChecks["7"] = true;
      newChecks["8"] = true;
    }
    setChecks(newChecks);
    setMode('traditional');
    toast({
      title: "AI Assessment Complete",
      description: "Your compliance checklist has been populated based on your answers.",
    });
  };

  const done = Object.values(checks).filter(Boolean).length;
  const score = Math.round((done/8)*100);

  const saveProgress = () => {
    localStorage.setItem('complianceCheckerProgress', JSON.stringify(checks));
    localStorage.setItem('complianceCheckerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('complianceCheckerProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('complianceCheckerDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["1"]) gaps.push("Verify Companies House registration immediately");
    if (!checks["5"]) gaps.push("File latest 3 years of annual accounts");
    if (!checks["6"]) gaps.push("Ensure all tax returns submitted on time");
    if (done < 5) gaps.push("Complete at least 5 critical items before submission");
    if (score < 80) gaps.push("Target 100% compliance - address all gaps");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Legal audit - verify company registration", priority:"Critical"},
      {week:"Week 2", action:"Financial review - file accounts if missing", priority:"Critical"},
      {week:"Week 3", action:"HR documentation - collect all records", priority:"High"},
      {week:"Week 4", action:"Final verification and review", priority:"Medium"}
    ];
  };

  const handleExportPdf = () => {
    const report = `COMPLIANCE CHECKER REPORT\nDate: ${new Date().toLocaleDateString()}\nCompliance Score: ${score}%\nItems Completed: ${done}/8\n\nSTATUS: ${score>=80?"COMPLIANT":"REVIEW NEEDED"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-audit.txt';
    a.click();
  };

  const handleExportWord = async () => {
    const recommendations = getRecommendations();
    const actionPlan = generateActionPlan();
    const completedItems = ITEMS.filter(item => checks[item.id]);
    const pendingItems = ITEMS.filter(item => !checks[item.id]);

    await generateWord({
      title: 'Compliance Checker Report',
      subtitle: `Compliance Score: ${score}%`,
      filename: `compliance-audit-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Overview', level: 1 },
        { type: 'score', score: { value: score, max: 100, label: 'Compliance Score' } },
        { type: 'paragraph', content: `Items Completed: ${done}/8` },
        { type: 'paragraph', content: `Status: ${score >= 80 ? 'COMPLIANT' : 'REVIEW NEEDED'}` },
        { type: 'divider' },
        { type: 'heading', content: 'Completed Items', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Item', 'Category', 'Priority'],
            rows: completedItems.map(item => [item.name, item.cat, item.pen])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Pending Items', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Item', 'Category', 'Priority'],
            rows: pendingItems.map(item => [item.name, item.cat, item.pen])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Smart Recommendations', level: 1 },
        { type: 'list', items: recommendations },
        { type: 'divider' },
        { type: 'heading', content: 'Action Plan', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Week', 'Action', 'Priority'],
            rows: actionPlan.map(a => [a.week, a.action, a.priority])
          }
        }
      ],
      metadata: {
        subject: 'Compliance Audit Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['compliance', 'audit', 'visa', 'innovator founder']
      }
    });

    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const getSerializedState = () => {
    return {
      checks,
      savedDate,
      tab
    };
  };

  useEffect(() => {
    const handoffKey = 'compliance-checker_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if ('checks' in payload) setChecks(payload.checks);
        if ('savedDate' in payload) setSavedDate(payload.savedDate);
        if ('tab' in payload) setTab(payload.tab);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      loadProgress();
    }
  }, []);

  const chartData = [
    {name:"Compliant",value:done,fill:"#22c55e"},
    {name:"Pending",value:8-done,fill:"#ef4444"}
  ];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <ToolUtilityBar
            toolId="compliance-checker"
            toolName="Compliance Checker"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setShowRecommendations(!showRecommendations)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Compliance Checker
                </CardTitle>
                <CardDescription>Full compliance audit for your visa application</CardDescription>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} />
            </CardHeader>
            <CardContent>
              {mode === 'ai' ? (
                <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
              ) : (
                <>
                  {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

                  {showRecommendations && (
                    <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950/30"><h3 className="font-bold mb-2">Smart Recommendations</h3>
                      <ul className="space-y-1">{getRecommendations().map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul></Card>
                  )}

                  {showActionPlan && (
                    <Card className="p-4 mb-4 bg-green-50 dark:bg-green-950/30"><h3 className="font-bold mb-3">Action Plan</h3>
                      <div className="space-y-2">{generateActionPlan().map((item, i) => (
                        <div key={i} className="flex gap-3"><span className="font-bold text-sm">{item.week}</span>
                          <div><p className="text-sm">{item.action}</p><span className="text-xs text-red-600">{item.priority}</span></div></div>
                      ))}</div></Card>
                  )}

                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className="text-sm font-bold text-primary">{score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${score}%` }} />
                    </div>
                  </div>

                  <Tabs value={tab} onValueChange={setTab} className="mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                      <TabsTrigger value="audit" data-testid="tab-audit">Audit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-3xl font-bold mt-2">{score}%</p>
                        </Card>
                        <Card className="p-4"><p className="text-xs text-muted-foreground">Items</p>
                          <p className="text-3xl font-bold mt-2">{done}/8</p></Card>
                        <Card className="p-4"><p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-lg font-bold mt-2">{score>=80?"Compliant":"Review Needed"}</p></Card>
                      </div>

                      <Card className="p-4">
                        <h3 className="font-bold mb-4">Compliance Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
                              {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Card>
                    </TabsContent>

                    <TabsContent value="audit" className="space-y-2">
                      {ITEMS.map(i => (
                        <Card key={i.id} className={`p-3 border-l-4 ${i.pen==="Critical"?"border-l-red-500":"border-l-blue-500"}`}>
                          <label className="flex gap-3">
                            <Checkbox checked={checks[i.id]||false} onCheckedChange={()=>setChecks({...checks,[i.id]:!checks[i.id]})} data-testid={`checkbox-item-${i.id}`} />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{i.name}</p>
                              <p className="text-xs text-muted-foreground">{i.cat} • {i.pen}</p>
                            </div>
                          </label>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
