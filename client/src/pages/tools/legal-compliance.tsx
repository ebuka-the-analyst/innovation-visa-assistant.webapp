import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LEGAL_ITEMS = [
  {category:"Company Formation",items:["Incorporated at Companies House","Memorandum & Articles of Association","Company registration certificate"]},
  {category:"Shareholding",items:["Shares properly allotted","Share certificates issued","Shareholder agreements in place"]},
  {category:"Board Governance",items:["Board meetings held regularly","Minutes documented","Decisions properly authorized"]},
  {category:"Regulatory Filings",items:["Annual accounts filed","Confirmation statement filed annually","Tax returns submitted on time"]},
  {category:"Contracts",items:["Customer contracts documented","Supplier agreements in place","Employee contracts executed"]}
];

export default function LegalCompliance() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");

  const totalItems = LEGAL_ITEMS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  const saveProgress = () => {
    localStorage.setItem('legalComplianceProgress', JSON.stringify(checks));
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('legalComplianceProgress');
    if (saved) setChecks(JSON.parse(saved));
  };

  useEffect(() => { loadProgress(); }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Legal Compliance Checker</h1>
          <p className="text-muted-foreground mb-6">UK company law requirements validation</p>

          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={saveProgress} className="gap-2" variant="outline"><Save className="w-4 h-4" /> Save</Button>
            <Button className="gap-2" variant="outline"><Lightbulb className="w-4 h-4" /> Tips</Button>
            <Button className="gap-2" variant="outline"><Calendar className="w-4 h-4" /> Plan</Button>
            <Button className="gap-2" variant="outline"><Download className="w-4 h-4" /> Export</Button>
            <Button onClick={loadProgress} className="gap-2" variant="outline"><RefreshCw className="w-4 h-4" /> Restore</Button>
          </div>

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Status</TabsTrigger>
              <TabsTrigger value="details">Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Legal Compliance</p>
                  <p className="text-4xl font-bold mt-2">{complianceScore}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Items Checked</p>
                  <p className="text-3xl font-bold mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-2xl font-bold ${complianceScore===100?"text-green-600":"text-orange-600"}`}>
                    {complianceScore===100?"✓ Complete":"In Progress"}
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {LEGAL_ITEMS.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox checked={checks[`${cat.category}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item}`]:!checks[`${cat.category}-${item}`]})} />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
