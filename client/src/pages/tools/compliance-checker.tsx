import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COMPLIANCE_AREAS = [
  {
    area:"Company Governance",
    priority:"Critical",
    items:[
      {name:"Companies House Registration",guide:"Ensure company registered with Companies House. Check status at beta.companieshouse.gov.uk"},
      {name:"Director Identification",guide:"All directors must be named and verified. Cross-check with credit files."},
      {name:"Beneficial Owner Declaration",guide:"PSC (Person with Significant Control) registered if applicable (>25% ownership)"},
      {name:"Articles of Association",guide:"Current articles on file. Must comply with Companies Act 2006"}
    ]
  },
  {
    area:"Financial Compliance",
    priority:"Critical",
    items:[
      {name:"Annual Accounts Filed",guide:"Last 3 years of statutory accounts filed at Companies House"},
      {name:"Tax Returns Submitted",guide:"CT600 forms and corporation tax returns filed on time (9 months after year end)"},
      {name:"VAT Registration (if applicable)",guide:"Registered if turnover >£85,000. VAT returns filed quarterly or monthly"},
      {name:"Payroll Compliance",guide:"PAYE operated correctly. P11D filed for any director benefits"}
    ]
  },
  {
    area:"Employment & HR",
    priority:"High",
    items:[
      {name:"Employment Contracts",guide:"Written contracts for all employees. Include salary, hours, terms."},
      {name:"Minimum Wage Compliance",guide:"All staff paid at least National Minimum Wage (£10.42 for 21+)"},
      {name:"Health & Safety Policy",guide:"Written health & safety policy if 5+ employees. Risk assessment completed."},
      {name:"Employee Records",guide:"Keep records of hours, pay, tax deductions for 3 years minimum"}
    ]
  },
  {
    area:"Intellectual Property",
    priority:"High",
    items:[
      {name:"IP Ownership Verified",guide:"All IP assigned to company in writing. Check employment contracts."},
      {name:"IP Registrations",guide:"Trademarks, patents, designs registered where applicable"},
      {name:"Licensing Agreements",guide:"Any third-party IP properly licensed with documentation"},
      {name:"Confidentiality Agreements",guide:"NDAs signed by employees and partners if handling sensitive data"}
    ]
  },
  {
    area:"Data & Compliance",
    priority:"High",
    items:[
      {name:"Data Protection (GDPR)",guide:"GDPR compliant. Privacy policy published. Data processing agreements in place."},
      {name:"Cyber Security",guide:"Basic security measures: strong passwords, multi-factor authentication, encryption"},
      {name:"Insurance Coverage",guide:"Appropriate business insurance: liability, professional indemnity, cyber"},
      {name:"Regulatory Licenses",guide:"Any industry-specific licenses current and valid (financial services, etc.)"}
    ]
  }
];

export default function ComplianceChecker() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = COMPLIANCE_AREAS.reduce((sum, a) => sum + a.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  const criticalItems = COMPLIANCE_AREAS.filter(a => a.priority === "Critical").reduce((sum, a) => sum + a.items.length, 0);
  const criticalDone = COMPLIANCE_AREAS.filter(a => a.priority === "Critical").reduce((sum, a) => sum + a.items.filter(i => checks[`${a.area}-${i.name}`]).length, 0);

  const chartData = [
    {name:"Compliant",value:completedItems,fill:"#22c55e"},
    {name:"Pending",value:totalItems-completedItems,fill:"#ef4444"}
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Full Compliance Audit</h1>
          <p className="text-muted-foreground mb-6">PhD-level comprehensive compliance assessment based on UK company law and visa requirements</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audit">Audit Checklist</TabsTrigger>
              <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Overall Compliance</p>
                  <p className="text-4xl font-bold mt-2">{complianceScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems} items complete</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Critical Items</p>
                  <p className="text-3xl font-bold mt-2">{criticalDone}/{criticalItems}</p>
                  <p className={`text-xs mt-2 ${criticalDone === criticalItems ? "text-green-600":"text-red-600"}`}>
                    {criticalDone === criticalItems ? "✓ All critical items done":"⚠ Critical gaps"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Compliance Status</p>
                  <p className="text-2xl font-bold mt-2">{complianceScore>=80?"✓ Ready":complianceScore>=60?"⚠ In Progress":"✗ At Risk"}</p>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Compliance Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {criticalDone < criticalItems && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {criticalItems - criticalDone} critical compliance items incomplete. Prioritize these immediately for visa application.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              {COMPLIANCE_AREAS.map((area, i) => (
                <Card key={i} className={`p-4 border-l-4 ${area.priority === "Critical" ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{area.area}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${area.priority === "Critical" ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                      {area.priority}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {area.items.map((item, j) => (
                      <div key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={checks[`${area.area}-${item.name}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${area.area}-${item.name}`]:!checks[`${area.area}-${item.name}`]})}
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground text-blue-600">{item.guide}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-3">Risk Assessment</h3>
                <div className="space-y-2">
                  {complianceScore >= 90 && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <p className="font-semibold text-sm text-green-700">Low Risk</p>
                      <p className="text-xs text-green-600 mt-1">Your company demonstrates strong compliance. Minimal visa application risk.</p>
                    </div>
                  )}
                  {complianceScore >= 70 && complianceScore < 90 && (
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <p className="font-semibold text-sm text-yellow-700">Medium Risk</p>
                      <p className="text-xs text-yellow-600 mt-1">Some compliance gaps exist. Address before visa submission.</p>
                    </div>
                  )}
                  {complianceScore < 70 && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <p className="font-semibold text-sm text-red-700">High Risk</p>
                      <p className="text-xs text-red-600 mt-1">Significant compliance issues. Must resolve before application.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold mb-3">Key Focus Areas</h3>
                <div className="space-y-2">
                  {!checks["Company Governance-Companies House Registration"] && <p className="text-sm">• Verify Companies House registration status immediately</p>}
                  {!checks["Financial Compliance-Annual Accounts Filed"] && <p className="text-sm">• Ensure last 3 years of accounts are filed</p>}
                  {!checks["Employment & HR-Employment Contracts"] && <p className="text-sm">• Formalize all employment arrangements with contracts</p>}
                  {!checks["Data & Compliance-Data Protection (GDPR)"] && <p className="text-sm">• Implement GDPR compliance measures</p>}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Compliance Report
          </Button>
        </div>
      </div>
    </>
  );
}
