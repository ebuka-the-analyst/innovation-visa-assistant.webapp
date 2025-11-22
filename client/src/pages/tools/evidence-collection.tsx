import { Card } from "@/components/ui/card"; import { Checkbox } from "@/components/ui/checkbox"; import { Button } from "@/components/ui/button"; import { AuthHeader } from "@/components/AuthHeader"; import { ToolNavigation } from "@/components/ToolNavigation"; import { useState } from "react"; import { Download, Plus, Trash2 } from "lucide-react";
const CATEGORIES = [
  {id:"1",name:"Business Documents",items:["Business Plan","Financial Statements","Articles of Association","Company Accounts"]},
  {id:"2",name:"Founder Documents",items:["CV/Resume","Proof of Identity","Education Certificates","Previous Work Experience"]},
  {id:"3",name:"Financial Evidence",items:["Bank Statements (28 days)","Tax Returns","Funding Documentation","Investment Proof"]},
  {id:"4",name:"Product Evidence",items:["Product Screenshots","User Testimonials","Market Data","Product Demo Link"]},
  {id:"5",name:"Market Documents",items:["Market Research","Competitor Analysis","TAM/SAM/SOM","Customer Interviews"]}
];
export default function EvidenceCollection() {
  const [collected, setCollected] = useState<any>({}); const [newFile, setNewFile] = useState("");
  const total = CATEGORIES.reduce((sum,c)=>sum+c.items.length,0); const done = Object.values(collected).filter(Boolean).length;
  return <><AuthHeader /><div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6"><ToolNavigation /><h1 className="text-4xl font-bold mb-2">Evidence Collection</h1><p className="text-muted-foreground mb-4">Organize all documents for visa submission</p><Card className="p-4 mb-4"><div className="flex justify-between"><span className="font-bold">Collection Progress</span><span>{done}/{total}</span></div><div className="w-full bg-gray-200 h-2 rounded-full mt-2"><div style={{width:`${Math.round(done/total*100)}%`}} className="bg-primary h-2 rounded-full"/></div></Card><div className="space-y-4">{CATEGORIES.map(cat=><Card key={cat.id} className="p-4"><h3 className="font-bold mb-3">{cat.name}</h3><div className="space-y-2">{cat.items.map((item,i)=><div key={i} className="flex gap-2"><Checkbox checked={collected[`${cat.id}-${i}`]||false} onCheckedChange={()=>setCollected({...collected,[`${cat.id}-${i}`]:!collected[`${cat.id}-${i}`]})}/><span className="text-sm">{item}</span></div>)}</div></Card>)}</div><Button className="w-full mt-4 gap-2 bg-primary"><Download className="w-4 h-4"/>Export Evidence Manifest</Button></div></>;
}
