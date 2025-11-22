import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, CheckCircle2, AlertTriangle } from "lucide-react";

const VERIFICATION_SECTIONS = [
  {section:"Application Completeness",critical:true,items:["All form sections completed","No blank mandatory fields","Consistent information across forms","References included where required","Signature/declaration signed"]},
  {section:"Financial Verification",critical:true,items:["Bank statements show £1,270+ for 28 days","Funds in personal name","No suspicious large deposits","Transaction history reasonable","Source of funds documented"]},
  {section:"Business Verification",critical:true,items:["Companies House records current","Company in good standing","Annual accounts filed","Director details current","Registered office address verified"]},
  {section:"Identity Verification",critical:true,items:["Passport valid and legible","Passport covers visa duration","Name consistent across documents","Date of birth consistent","Identification documents certified"]},
  {section:"Endorsement Verification",critical:true,items:["Endorsement letter signed","Endorser approved by UKVI","Endorsement period covers visa duration","All supporting evidence attached","Reference numbers match UKVI records"]},
  {section:"Employment Verification",critical:false,items:["Employment contract provided","Salary meets financial requirement","Role description clear","Working location specified","Employment history chronological"]},
  {section:"Education Verification",critical:false,items:["Academic qualifications documented","English language proof provided","Translations certified where needed","Qualifications relevant to business","Education history complete"]},
  {section:"Supporting Evidence",critical:false,items:["All required documents attached","Documents in correct order","No duplicate pages","Quality of scans acceptable","Document file sizes reasonable"]}
];

export default function VerificationChecklist() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = VERIFICATION_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  
  const criticalItems = VERIFICATION_SECTIONS.filter(s => s.critical).reduce((sum, s) => sum + s.items.length, 0);
  const criticalDone = VERIFICATION_SECTIONS.filter(s => s.critical).reduce((sum, s) => sum + s.items.filter(i => checks[`${s.section}-${i}`]).length, 0);
  
  const readinessScore = Math.round((completedItems / totalItems) * 100);
  const readyToSubmit = criticalDone === criticalItems && readinessScore >= 80;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Complete Verification Checklist</h1>
          <p className="text-muted-foreground mb-6">Final verification before submission - ensure nothing missed</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Submission Ready</TabsTrigger>
              <TabsTrigger value="verification">Final Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Verification Complete</p>
                  <p className="text-4xl font-bold mt-2">{readinessScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Critical Items</p>
                  <p className="text-3xl font-bold mt-2">{criticalDone}/{criticalItems}</p>
                  <p className={`text-xs mt-2 ${criticalDone === criticalItems ? "text-green-600":"text-red-600"}`}>
                    {criticalDone === criticalItems ? "✓ All done":"⚠ Missing"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Submission Status</p>
                  <p className={`text-2xl font-bold ${readyToSubmit ? "text-green-600":"text-orange-600"}`}>
                    {readyToSubmit ? "✓ READY" : "PENDING"}
                  </p>
                </Card>
                <Card className={`p-4 ${readyToSubmit ? "bg-green-50":"bg-orange-50"}`}>
                  <p className="text-xs text-muted-foreground">Risk Assessment</p>
                  <p className={`text-lg font-bold ${readyToSubmit ? "text-green-600":"text-orange-600"}`}>
                    {readyToSubmit ? "LOW" : "MODERATE"}
                  </p>
                </Card>
              </div>

              {readyToSubmit ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    ✓ Application complete and ready for submission. All critical items verified.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {criticalDone < criticalItems ? `${criticalItems - criticalDone} critical items incomplete.` : `Increase overall readiness to 80% before submission.`}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              {VERIFICATION_SECTIONS.map((section, i) => (
                <Card key={i} className={`p-4 border-l-4 ${section.critical ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{section.section}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${section.critical ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                      {section.critical ? "Critical":"Supporting"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={checks[`${section.section}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${section.section}-${item}`]:!checks[`${section.section}-${item}`]})}
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
            Export Final Verification Report
          </Button>
        </div>
      </div>
    </>
  );
}
