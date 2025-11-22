import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, CheckCircle } from "lucide-react";

const DOC_CATEGORIES = [
  {
    category:"Identity Documents",
    priority:"Critical",
    docs:[
      {name:"Valid Passport",requirement:"Must be valid for duration of visa",notes:"Scanned colour copy of all pages"},
      {name:"Birth Certificate",requirement:"Official copy if name has changed",notes:"Unless shown in passport"},
      {name:"Marriage Certificate",requirement:"If married or in civil partnership",notes:"Official certified copy"}
    ]
  },
  {
    category:"Business Documents",
    priority:"Critical",
    docs:[
      {name:"Articles of Association",requirement:"Current version from Companies House",notes:"Shows company structure and governance"},
      {name:"Board Minutes",requirement:"Last 12 months of meetings",notes:"Demonstrates decision-making involvement"},
      {name:"Shareholder Register",requirement:"Current share ownership",notes:"Shows %ownership and investor details"}
    ]
  },
  {
    category:"Financial Documents",
    priority:"Critical",
    docs:[
      {name:"Annual Accounts (3 years)",requirement:"Filed at Companies House",notes:"Audited or with accountants' reference"},
      {name:"Tax Returns (3 years)",requirement:"SA302 forms and tax year overviews",notes:"From HMRC, showing tax paid"},
      {name:"Bank Statements (28 days)",requirement:"Most recent showing £1,270",notes:"Applicant's personal account"}
    ]
  },
  {
    category:"Employment Documents",
    priority:"High",
    docs:[
      {name:"Employment Contracts",requirement:"For all key staff",notes:"Shows salary, hours, terms and conditions"},
      {name:"Payroll Records",requirement:"Last 12 months",notes:"P11D, P60 forms, pension contributions"},
      {name:"Org Chart",requirement:"Current team structure",notes:"Shows reporting lines and roles"}
    ]
  },
  {
    category:"Intellectual Property",
    priority:"High",
    docs:[
      {name:"IP Assignments",requirement:"Written IP transfer agreements",notes:"From employees/founders to company"},
      {name:"Patent Applications",requirement:"If applicable and relevant",notes:"Filing dates and status"},
      {name:"Copyright Assignments",requirement:"For software/creative works",notes:"Documentation of ownership transfer"}
    ]
  },
  {
    category:"Endorsement Documents",
    priority:"Critical",
    docs:[
      {name:"Endorser Letter",requirement:"Completes UKVI endorsement form",notes:"States company meets all criteria"},
      {name:"Supporting Evidence",requirement:"Provided by endorsing body",notes:"Demonstrates innovation/viability score"},
      {name:"Endorsement Validity",requirement:"Covers visa period",notes:"Minimum 3 years"}
    ]
  }
];

export default function DocVerification() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  
  const totalDocs = DOC_CATEGORIES.reduce((sum, c) => sum + c.docs.length, 0);
  const verifiedDocs = Object.values(checks).filter(Boolean).length;
  const verificationScore = Math.round((verifiedDocs / totalDocs) * 100);

  const criticalDocs = DOC_CATEGORIES.filter(c => c.priority === "Critical").reduce((sum, c) => sum + c.docs.length, 0);
  const criticalVerified = DOC_CATEGORIES.filter(c => c.priority === "Critical").reduce((sum, c) => sum + c.docs.filter(d => checks[`${c.category}-${d.name}`]).length, 0);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Document Verification Checklist</h1>
          <p className="text-muted-foreground mb-6">PhD-level document validation - ensure all submission documents verified</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Verification Status</TabsTrigger>
              <TabsTrigger value="checklist">Document Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Verification Score</p>
                  <p className="text-4xl font-bold mt-2">{verificationScore}%</p>
                  <p className="text-xs mt-2">{verifiedDocs}/{totalDocs} documents</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Critical Documents</p>
                  <p className="text-3xl font-bold mt-2">{criticalVerified}/{criticalDocs}</p>
                  <p className={`text-xs mt-2 ${criticalVerified === criticalDocs ? "text-green-600":"text-red-600"}`}>
                    {criticalVerified === criticalDocs ? "✓ All verified":"⚠ Missing"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Submission Ready</p>
                  <p className={`text-2xl font-bold ${verificationScore === 100 ? "text-green-600":"text-orange-600"}`}>
                    {verificationScore === 100 ? "✓ Yes":"In Progress"}
                  </p>
                </Card>
              </div>

              {criticalVerified === criticalDocs && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    All critical documents verified. You can proceed with visa application submission.
                  </AlertDescription>
                </Alert>
              )}

              {criticalVerified < criticalDocs && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {criticalDocs - criticalVerified} critical documents missing. Cannot submit application without these.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              {DOC_CATEGORIES.map((cat, i) => (
                <Card key={i} className={`p-4 border-l-4 ${cat.priority === "Critical" ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{cat.category}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${cat.priority === "Critical" ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                      {cat.priority}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cat.docs.map((doc, j) => (
                      <div key={j} className="border border-gray-200 p-3 rounded hover:bg-gray-50">
                        <div className="flex gap-3 mb-2">
                          <Checkbox 
                            checked={checks[`${cat.category}-${doc.name}`]||false}
                            onCheckedChange={() => setChecks({...checks,[`${cat.category}-${doc.name}`]:!checks[`${cat.category}-${doc.name}`]})}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.requirement}</p>
                            <p className="text-xs text-blue-600 mt-1">💡 {doc.notes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Document Verification Report
          </Button>
        </div>
      </div>
    </>
  );
}
