import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";

const TAX_CHECKLIST = [
  {category:"Corporation Tax",items:["CT600 filed within 12 months of year end","Appendices CT600a/600b attached if required","Tax year returns submitted to HMRC","Corporation tax paid on time","Relief claims submitted where applicable"]},
  {category:"VAT (if applicable)",items:["VAT registration threshold checked (£85,000)","Monthly/quarterly VAT returns filed","VAT payments made on time","VAT relief claims processed","Records maintained for 6 years"]},
  {category:"Payroll",items:["PAYE registered with HMRC","Monthly payroll submitted on time","P11D filed for director benefits","Class 1 NICs correctly calculated","Payroll Giving scheme (if offered)"]},
  {category:"Personal Tax",items:["Individual self-assessments filed","Capital gains tax paid if applicable","Dividend tax returns submitted","Savings interest reported","Property income declared"]},
  {category:"Record Keeping",items:["Sales invoices retained for 6 years","Purchase invoices and receipts filed","Bank reconciliations completed monthly","Accounting records digitized and backed up","Ledgers and trial balances prepared"]}
];

export default function TaxCompliance() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = TAX_CHECKLIST.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Tax Compliance Checker</h1>
          <p className="text-muted-foreground mb-6">Corporation tax, VAT, PAYE and personal tax compliance verification</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Compliance Score</TabsTrigger>
              <TabsTrigger value="checklist">Tax Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Tax Compliance</p>
                  <p className="text-4xl font-bold mt-2">{complianceScore}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Items Complete</p>
                  <p className="text-3xl font-bold mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-2xl font-bold ${complianceScore>=80?"text-green-600":"text-yellow-600"}`}>
                    {complianceScore>=80?"✓ Compliant":"Review"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Audit Risk</p>
                  <p className={`text-sm font-bold ${complianceScore>=80?"text-green-600":"text-red-600"}`}>
                    {complianceScore>=80?"Low":"High"}
                  </p>
                </Card>
              </div>

              {complianceScore < 80 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Tax compliance gaps detected. Complete these items before visa submission to avoid questions from HMRC.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              {TAX_CHECKLIST.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={checks[`${cat.category}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item}`]:!checks[`${cat.category}-${item}`]})}
                        />
                        <span className="text-sm flex-1">{item}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Tax Compliance Report
          </Button>
        </div>
      </div>
    </>
  );
}
