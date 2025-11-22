import { Card } from "@/components/ui/card"; import { Checkbox } from "@/components/ui/checkbox"; import { Button } from "@/components/ui/button"; import { AuthHeader } from "@/components/AuthHeader"; import { ToolNavigation } from "@/components/ToolNavigation"; import { useState } from "react"; import { AlertTriangle, Download } from "lucide-react";
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
export default function ComplianceChecker() {
  const [checks, setChecks] = useState<any>({}); const done = Object.values(checks).filter(Boolean).length;
  const score = Math.round((done/8)*100);
  return <><AuthHeader /><div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6"><ToolNavigation /><div className="max-w-5xl mx-auto"><h1 className="text-4xl font-bold mb-2">Compliance Checker</h1><p className="text-muted-foreground mb-6">Full compliance audit</p><div className="grid md:grid-cols-3 gap-4 mb-6"><Card className="p-4"><p className="text-xs">Score</p><p className="text-3xl font-bold mt-2">{score}%</p></Card><Card className="p-4"><p className="text-xs">Items</p><p className="text-3xl font-bold mt-2">{done}/8</p></Card><Card className="p-4"><p className="text-xs">Status</p><p className="text-lg font-bold mt-2">{score>=80?"✓ Compliant":"✗ Review"}</p></Card></div><div className="space-y-2">{ITEMS.map(i=><Card key={i.id} className={`p-3 border-l-4 ${i.pen==="Critical"?"border-l-red-500":"border-l-blue-500"}`}><label className="flex gap-3"><Checkbox checked={checks[i.id]||false} onCheckedChange={()=>setChecks({...checks,[i.id]:!checks[i.id]})}/><div className="flex-1"><p className="font-semibold text-sm">{i.name}</p><p className="text-xs text-muted-foreground">{i.cat} • {i.pen}</p></div></label></Card>)}</div><Button className="w-full mt-4 gap-2 bg-primary"><Download className="w-4 h-4"/>Export Audit</Button></div></>;
}
