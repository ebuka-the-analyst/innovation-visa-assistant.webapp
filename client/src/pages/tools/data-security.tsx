import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, AlertTriangle, Lock, Save, Lightbulb, Calendar, RefreshCw, Shield, CheckCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'data-security',
  toolName: 'Data Security Compliance',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Catalyst. I'll help you assess your data security and GDPR compliance posture. For UK businesses, demonstrating strong data protection is essential - it shows you understand regulatory requirements and can operate responsibly. Let's evaluate your security stance!",
  questions: [
    {
      id: 'data-protection-policy',
      question: "Do you have a written data protection policy? Describe what it covers.",
      hint: "GDPR Article 24 requires documented policies for personal data processing",
      fieldKey: 'dataPolicy',
      minLength: 40
    },
    {
      id: 'encryption-practices',
      question: "How do you handle encryption? Describe your approach to data in transit and at rest.",
      hint: "TLS 1.2+ for transit, AES-256 for rest are industry standards",
      fieldKey: 'encryption',
      minLength: 40
    },
    {
      id: 'access-controls',
      question: "What access controls do you have in place? How do you manage who can access personal data?",
      hint: "Role-based access control (RBAC), principle of least privilege",
      fieldKey: 'accessControls',
      minLength: 40
    },
    {
      id: 'incident-response',
      question: "Do you have an incident response plan? How would you handle a data breach?",
      hint: "GDPR requires ICO notification within 72 hours of discovering a breach",
      fieldKey: 'incidentResponse',
      minLength: 50
    },
    {
      id: 'user-rights',
      question: "How do you handle data subject rights? Can users access, correct, and delete their data?",
      hint: "GDPR Articles 15-22 cover access, rectification, erasure, and portability rights",
      fieldKey: 'userRights',
      minLength: 40
    },
    {
      id: 'vendor-management',
      question: "How do you manage third-party data processors? Do you have Data Processing Agreements?",
      hint: "GDPR Article 28 requires written contracts with all data processors",
      fieldKey: 'vendorManagement',
      minLength: 40
    }
  ],
  completionMessage: "Excellent! You've provided a comprehensive overview of your data security practices. Strong data protection demonstrates operational maturity to endorsing bodies. I'm now updating your compliance checklist with these insights."
};

const DATA_SECURITY_REQUIREMENTS = [
  {
    category:"Data Governance",
    critical:true,
    items:[
      {name:"Data Protection Policy",detail:"Written policy published and accessible",regulation:"GDPR Article 24"},
      {name:"Data Processing Register",detail:"Document what data you process",regulation:"GDPR Article 5"},
      {name:"Privacy Impact Assessment",detail:"DPIA for high-risk processing",regulation:"GDPR Article 35"},
      {name:"Data Retention Schedule",detail:"Define retention periods",regulation:"GDPR Article 5"}
    ]
  },
  {
    category:"Technical Security",
    critical:true,
    items:[
      {name:"Encryption in Transit",detail:"All data using TLS 1.2 plus",regulation:"GDPR Article 32"},
      {name:"Encryption at Rest",detail:"Sensitive data encrypted when stored",regulation:"GDPR Article 32"},
      {name:"Access Controls",detail:"Role-based access control",regulation:"GDPR Article 32"},
      {name:"Audit Logging",detail:"Log all access to personal data",regulation:"GDPR Article 32"}
    ]
  },
  {
    category:"Organizational Measures",
    critical:true,
    items:[
      {name:"Data Protection Officer",detail:"DPO appointed when required",regulation:"GDPR Article 37"},
      {name:"Staff Training",detail:"Annual GDPR training",regulation:"GDPR Article 32"},
      {name:"Vendor Management",detail:"Data Processor Agreements",regulation:"GDPR Article 28"},
      {name:"Incident Response Plan",detail:"Breach response procedure",regulation:"GDPR Article 33"}
    ]
  },
  {
    category:"User Rights",
    critical:true,
    items:[
      {name:"Consent Mechanism",detail:"Clear opt-in consent",regulation:"GDPR Article 7"},
      {name:"Right to Access",detail:"Request personal data",regulation:"GDPR Article 15"},
      {name:"Right to Erasure",detail:"Delete personal data",regulation:"GDPR Article 17"},
      {name:"Data Portability",detail:"Export data in standard format",regulation:"GDPR Article 20"}
    ]
  },
  {
    category:"Third-Party Compliance",
    critical:true,
    items:[
      {name:"Sub-processor Management",detail:"List of data sub-processors",regulation:"GDPR Article 28"},
      {name:"International Transfers",detail:"Compliant transfer mechanism",regulation:"GDPR Chapter 5"},
      {name:"Vendor SLAs",detail:"Security in vendor contracts",regulation:"GDPR Article 32"},
      {name:"Regular Audits",detail:"Annual security assessments",regulation:"GDPR Article 32"}
    ]
  }
];

export default function DataSecurity() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('data-security-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('data-security-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('data-security-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newChecks: any = { ...checks };
    
    if (answers.dataPolicy && answers.dataPolicy.length > 30) {
      newChecks["Data Governance-Data Protection Policy"] = true;
      newChecks["Data Governance-Data Processing Register"] = true;
    }
    
    if (answers.encryption && answers.encryption.length > 30) {
      if (answers.encryption.toLowerCase().includes('tls') || answers.encryption.toLowerCase().includes('transit')) {
        newChecks["Technical Security-Encryption in Transit"] = true;
      }
      if (answers.encryption.toLowerCase().includes('rest') || answers.encryption.toLowerCase().includes('aes')) {
        newChecks["Technical Security-Encryption at Rest"] = true;
      }
    }
    
    if (answers.accessControls && answers.accessControls.length > 30) {
      newChecks["Technical Security-Access Controls"] = true;
    }
    
    if (answers.incidentResponse && answers.incidentResponse.length > 40) {
      newChecks["Organizational Measures-Incident Response Plan"] = true;
    }
    
    if (answers.userRights && answers.userRights.length > 30) {
      newChecks["User Rights-Right to Access"] = true;
      newChecks["User Rights-Right to Erasure"] = true;
    }
    
    if (answers.vendorManagement && answers.vendorManagement.length > 30) {
      newChecks["Organizational Measures-Vendor Management"] = true;
      newChecks["Third-Party Compliance-Sub-processor Management"] = true;
    }
    
    setChecks(newChecks);
    setMode('traditional');
  };

  const totalItems = DATA_SECURITY_REQUIREMENTS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  const categoryScores = DATA_SECURITY_REQUIREMENTS.map(cat => ({
    category: cat.category.split(" ")[0],
    value: Math.round((cat.items.filter(i => checks[`${cat.category}-${i.name}`]).length / cat.items.length) * 100)
  }));

  const saveProgress = () => {
    localStorage.setItem('dataSecurityProgress', JSON.stringify(checks));
    localStorage.setItem('dataSecurityDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('dataSecurityProgress');
    if (saved) setChecks(JSON.parse(saved));
    const d = localStorage.getItem('dataSecurityDate');
    if (d) setSavedDate(d);
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["Data Governance-Data Protection Policy"]) gaps.push("Publish a data protection policy immediately");
    if (!checks["Technical Security-Encryption in Transit"]) gaps.push("Enable TLS 1.2 plus encryption for all data");
    if (!checks["Organizational Measures-Incident Response Plan"]) gaps.push("Create a breach response procedure");
    if (complianceScore < 80) gaps.push("Address compliance gaps to avoid GDPR penalties");
    if (completedItems < 15) gaps.push("Focus on critical organizational measures first");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Complete Data Governance requirements", priority:"Critical"},
      {week:"Week 2", action:"Implement Technical Security controls", priority:"Critical"},
      {week:"Week 3", action:"Establish Organizational Measures", priority:"High"},
      {week:"Week 4", action:"Verify Third-Party Compliance", priority:"High"}
    ];
  };

  const exportReport = () => {
    const report = `DATA SECURITY COMPLIANCE REPORT
Date: ${new Date().toLocaleDateString()}
Compliance Score: ${complianceScore}%
Controls Implemented: ${completedItems}/${totalItems}

CATEGORY SCORES:
${categoryScores.map(c => `${c.category}: ${c.value}%`).join('\n')}

STATUS: ${complianceScore >= 80 ? 'GDPR Ready' : complianceScore >= 60 ? 'At Risk' : 'Non-Compliant'}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-security-audit.txt';
    a.click();
  };

  const getSerializedState = () => {
    return {
      checks,
      savedDate,
      tab
    };
  };

  useEffect(() => {
    const handoffKey = 'data-security_handoff';
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

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Data Security Compliance</h1>
              <p className="text-muted-foreground">GDPR and UK data protection assessment</p>
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
              userTier={userTier}
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Why Data Security Matters</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>For UK Innovator Founder visa applicants, demonstrating data security awareness shows:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Viability:</strong> Understanding of regulatory requirements</li>
                      <li><strong>Professionalism:</strong> Mature operational practices</li>
                      <li><strong>Risk Management:</strong> Ability to protect customer data</li>
                      <li><strong>Compliance:</strong> Ready to operate in UK market</li>
                    </ul>
                    <p className="mt-3 font-medium">GDPR violations can result in fines up to 4% of global turnover.</p>
                  </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Compliance Score</span>
                    </div>
                    <p className="text-2xl font-bold">{complianceScore}%</p>
                    <p className="text-xs text-muted-foreground">{completedItems}/{totalItems} controls</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className={`w-5 h-5 ${complianceScore >= 80 ? 'text-green-600' : 'text-orange-600'}`} />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className="text-lg font-bold">{complianceScore >= 80 ? 'GDPR Ready' : 'At Risk'}</p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ToolUtilityBar
                toolId="data-security"
                toolName="Data Security Compliance"
                onSave={saveProgress}
                onRestore={loadProgress}
                onExport={exportReport}
                onSmartTips={() => setShowRecommendations(!showRecommendations)}
                onActionPlan={() => setShowActionPlan(!showActionPlan)}
                getSerializedState={getSerializedState}
              />

              {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

              {showRecommendations && (
                <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold mb-2">Smart Recommendations</h3>
                  <ul className="space-y-1">{getRecommendations().map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul>
                </Card>
              )}

              {showActionPlan && (
                <Card className="p-4 mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <h3 className="font-bold mb-3">Action Plan</h3>
                  <div className="space-y-2">{generateActionPlan().map((item, i) => (
                    <div key={i} className="flex gap-3"><span className="font-bold text-sm">{item.week}</span>
                      <div><p className="text-sm">{item.action}</p><span className="text-xs text-red-600">{item.priority}</span></div></div>
                  ))}</div>
                </Card>
              )}

              <Tabs value={tab} onValueChange={setTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Security Score</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                      <p className="text-xs text-muted-foreground">Data Security Score</p>
                      <p className="text-4xl font-bold mt-2">{complianceScore}%</p>
                      <p className="text-xs mt-2">{completedItems}/{totalItems} controls</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground">Compliance Status</p>
                      <p className={`text-2xl font-bold mt-2 ${complianceScore>=80?"text-green-600":complianceScore>=60?"text-yellow-600":"text-red-600"}`}>
                        {complianceScore>=80?"GDPR Ready":complianceScore>=60?"At Risk":"Non-Compliant"}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground">Penalty Risk</p>
                      <p className={`text-sm font-bold mt-2 ${complianceScore>=80?"text-green-600":complianceScore>=60?"text-yellow-600":"text-red-600"}`}>
                        {complianceScore>=80?"Less than 4%":complianceScore>=60?"4-10%":"Over 20% max"}
                      </p>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h3 className="font-bold mb-4">Security Posture by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={categoryScores}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis />
                        <Radar name="Compliance Percent" dataKey="value" stroke="#005EB8" fill="#005EB8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Card>

                  {complianceScore < 70 && (
                    <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        GDPR non-compliance detected. Implement critical controls to avoid penalties.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4">
                  {DATA_SECURITY_REQUIREMENTS.map((cat, i) => (
                    <Card key={i} className={`p-4 border-l-4 ${cat.critical ? "border-l-red-500":"border-l-blue-500"}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">{cat.category}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${cat.critical ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300":"bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"}`}>
                          {cat.critical ? "Critical":"Important"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {cat.items.map((item, j) => (
                          <div key={j} className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                            <Checkbox 
                              checked={checks[`${cat.category}-${item.name}`]||false}
                              onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item.name}`]:!checks[`${cat.category}-${item.name}`]})}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.detail}</p>
                              <p className="text-xs text-blue-600 mt-1">Reg: {item.regulation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="risks" className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-3">Regulatory Risk Assessment</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-gray-400">
                        <p className="font-semibold text-sm">Monitoring and Enforcement</p>
                        <p className="text-xs text-muted-foreground mt-1">ICO actively investigates breaches</p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded border-l-4 border-amber-500">
                        <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Penalty Calculation</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Up to 4% of global turnover for violations</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded border-l-4 border-red-500">
                        <p className="font-semibold text-sm text-red-700 dark:text-red-300">Breach Notification</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Notify ICO within 72 hours of discovery</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-3">Critical Missing Controls</h3>
                    <div className="space-y-1">
                      {!checks["Data Governance-Data Protection Policy"] && <p className="text-sm">• Published data protection policy required</p>}
                      {!checks["Technical Security-Encryption in Transit"] && <p className="text-sm">• TLS 1.2 plus encryption for data in transit</p>}
                      {!checks["Organizational Measures-Data Protection Officer"] && <p className="text-sm">• DPO appointment if processing 250 plus people</p>}
                      {!checks["User Rights-Consent Mechanism"] && <p className="text-sm">• Explicit opt-in consent mechanism</p>}
                      {!checks["Third-Party Compliance-Sub-processor Management"] && <p className="text-sm">• Sub-processor list and management</p>}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              <Button className="w-full mt-4 gap-2 bg-primary" onClick={exportReport} data-testid="button-export">
                <Download className="w-4 h-4" />
                Export Data Security Audit Report
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
