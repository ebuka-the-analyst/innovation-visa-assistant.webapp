import { Card } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { AuthHeader } from "@/components/AuthHeader"; import { ToolNavigation } from "@/components/ToolNavigation"; import { Download } from "lucide-react";
const TEMPLATES = [
  {id:"1",name:"Articles of Association",category:"Legal",pages:4},
  {id:"2",name:"Founder Agreement",category:"Legal",pages:3},
  {id:"3",name:"Employment Contract",category:"HR",pages:2},
  {id:"4",name:"NDA Template",category:"Legal",pages:2},
  {id:"5",name:"Privacy Policy",category:"Legal",pages:5},
  {id:"6",name:"Terms of Service",category:"Legal",pages:4}
];
export default function LegalTemplates() {
  return <><AuthHeader /><div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6"><ToolNavigation /><h1 className="text-4xl font-bold mb-2">Legal Templates</h1><p className="text-muted-foreground mb-4">Document templates for your business</p><div className="grid md:grid-cols-2 gap-4">{TEMPLATES.map(t=><Card key={t.id} className="p-4"><p className="font-semibold">{t.name}</p><p className="text-sm text-muted-foreground mb-3">{t.category} • {t.pages} pages</p><Button size="sm" className="w-full gap-1"><Download className="w-3 h-3"/>Download</Button></Card>)}</div></div></>;
}
