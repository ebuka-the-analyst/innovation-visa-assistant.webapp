import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ITEMS = Array.from({length:8}, (_,i)=>({id:String(i+1),name:`Item ${i+1}`,pen:i%3===0?"Critical":"High"}));

export default function DocVerification() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");

  const done = Object.values(checks).filter(Boolean).length;
  const score = Math.round((done/8)*100);

  const saveProgress = () => {
    localStorage.setItem('docVerificationProgress', JSON.stringify(checks));
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('docVerificationProgress');
    if (saved) setChecks(JSON.parse(saved));
  };

  useEffect(() => { loadProgress(); }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Doc Verification</h1>
          <p className="text-muted-foreground mb-6">Document verification checklist</p>

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
              <TabsTrigger value="docs">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="p-4"><p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-3xl font-bold mt-2">{score}%</p></Card>
            </TabsContent>

            <TabsContent value="docs" className="space-y-2">
              {ITEMS.map(i=><Card key={i.id} className="p-3"><label className="flex gap-3">
                <Checkbox checked={checks[i.id]||false} onCheckedChange={()=>setChecks({...checks,[i.id]:!checks[i.id]})}/>
                <span className="text-sm">{i.name}</span></label></Card>)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
