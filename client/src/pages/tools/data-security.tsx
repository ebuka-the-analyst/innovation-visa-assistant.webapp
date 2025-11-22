import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, Lock } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";

const DATA_SECURITY_REQUIREMENTS = [
  {
    category:"Data Governance",
    critical:true,
    items:[
      {name:"Data Protection Policy",detail:"Written data protection policy published and accessible",regulation:"GDPR Article 24"},
      {name:"Data Processing Register",detail:"Document what data you process, why, and how long kept",regulation:"GDPR Article 5"},
      {name:"Privacy Impact Assessment",detail:"DPIA completed for high-risk processing",regulation:"GDPR Article 35"},
      {name:"Data Retention Schedule",detail:"Define retention periods for each data type",regulation:"GDPR Article 5"}
    ]
  },
  {
    category:"Technical Security",
    critical:true,
    items:[
      {name:"Encryption in Transit",detail:"All data transmitted using TLS 1.2+",regulation:"GDPR Article 32"},
      {name:"Encryption at Rest",detail:"Sensitive data encrypted when stored",regulation:"GDPR Article 32"},
      {name:"Access Controls",detail:"Role-based access control implemented",regulation:"GDPR Article 32"},
      {name:"Audit Logging",detail:"All access to personal data logged and monitored",regulation:"GDPR Article 32"}
    ]
  },
  {
    category:"Organizational Measures",
    critical:true,
    items:[
      {name:"Data Protection Officer",detail:"DPO appointed and contact details public (if required)",regulation:"GDPR Article 37"},
      {name:"Staff Training",detail:"Annual GDPR and data security training for all staff",regulation:"GDPR Article 32"},
      {name:"Vendor Management",detail:"Data Processor Agreements with all third parties",regulation:"GDPR Article 28"},
      {name:"Incident Response Plan",detail:"Procedure for responding to data breaches",regulation:"GDPR Article 33"}
    ]
  },
  {
    category:"User Rights",
    critical:true,
    items:[
      {name:"Consent Mechanism",detail:"Clear, opt-in consent for data processing (not pre-ticked)",regulation:"GDPR Article 7"},
      {name:"Right to Access",detail:"Process for users to request their personal data",regulation:"GDPR Article 15"},
      {name:"Right to Erasure",detail:"Procedure to delete personal data upon request",regulation:"GDPR Article 17"},
      {name:"Data Portability",detail:"Ability to export user data in standard format",regulation:"GDPR Article 20"}
    ]
  },
  {
    category:"Third-Party Compliance",
    critical:true,
    items:[
      {name:"Sub-processor Management",detail:"List of data sub-processors published and updatable",regulation:"GDPR Article 28"},
      {name:"International Transfers",detail:"Compliant mechanism for non-UK data transfers (SCCs)",regulation:"GDPR Chapter 5"},
      {name:"Vendor SLAs",detail:"Security requirements in vendor contracts",regulation:"GDPR Article 32"},
      {name:"Regular Audits",detail:"Annual security assessments of third parties",regulation:"GDPR Article 32"}
    ]
  }
];

const securityScores = [
  {category:"Governance",value:0},
  {category:"Technical",value:0},
  {category:"Organizational",value:0},
  {category:"User Rights",value:0},
  {category:"Third-Party",value:0}
];

export default function DataSecurity() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = DATA_SECURITY_REQUIREMENTS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  // Calculate category scores
  const categoryScores = DATA_SECURITY_REQUIREMENTS.map(cat => ({
    category: cat.category.split(" ")[0],
    value: Math.round((cat.items.filter(i => checks[`${cat.category}-${i.name}`]).length / cat.items.length) * 100)
  }));

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Data Security Compliance</h1>
          <p className="text-muted-foreground mb-6">GDPR and UK data protection requirements assessment - PhD-level security audit</p>

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
                  <p className="text-xs mt-2">{completedItems}/{totalItems} controls implemented</p>
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
                    {complianceScore>=80?"<4% revenue":complianceScore>=60?"4-10% revenue":">20% revenue max fine"}
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
                    <Radar name="Compliance %" dataKey="value" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {complianceScore < 70 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    GDPR non-compliance detected. Implement critical controls immediately to avoid regulatory penalties (up to 20 million EUR or 4% of global revenue).
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              {DATA_SECURITY_REQUIREMENTS.map((cat, i) => (
                <Card key={i} className={`p-4 border-l-4 ${cat.critical ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{cat.category}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${cat.critical ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                      {cat.critical ? "Critical":"Important"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded border border-gray-100">
                        <Checkbox 
                          checked={checks[`${cat.category}-${item.name}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item.name}`]:!checks[`${cat.category}-${item.name}`]})}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                          <p className="text-xs text-blue-600 mt-1">📋 {item.regulation}</p>
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
                  <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                    <p className="font-semibold text-sm">Monitoring & Enforcement</p>
                    <p className="text-xs text-muted-foreground mt-1">ICO actively investigates data breaches. Average investigation: 6-12 months.</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded border-l-4 border-amber-500">
                    <p className="font-semibold text-sm text-amber-700">Penalty Calculation</p>
                    <p className="text-xs text-amber-600 mt-1">Tiered penalties: Up to 4% of annual global turnover for serious violations.</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                    <p className="font-semibold text-sm text-red-700">Breach Notification</p>
                    <p className="text-xs text-red-600 mt-1">Must notify ICO within 72 hours of discovery. Public disclosure required if high risk.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold mb-3">Critical Missing Controls</h3>
                <div className="space-y-1">
                  {!checks["Data Governance-Data Protection Policy"] && <p className="text-sm">• Published data protection policy required</p>}
                  {!checks["Technical Security-Encryption in Transit"] && <p className="text-sm">• TLS 1.2+ encryption for all data in transit</p>}
                  {!checks["Organizational Measures-Data Protection Officer"] && <p className="text-sm">• DPO appointment (if processing >250 people)</p>}
                  {!checks["User Rights-Consent Mechanism"] && <p className="text-sm">• Explicit opt-in consent mechanism</p>}
                  {!checks["Third-Party Compliance-Sub-processor Management"] && <p className="text-sm">• Sub-processor list and management process</p>}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Data Security Audit Report
          </Button>
        </div>
      </div>
    </>
  );
}
