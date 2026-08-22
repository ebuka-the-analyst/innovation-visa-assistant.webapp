import { useLocation } from "wouter";
import { AlertCircle, ExternalLink, Globe, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";

export default function SettlementPlanning() {
  const [, setLocation] = useLocation();
  const contextQuery = useApplicationContextPrefill("settlement-planning");
  const data = contextQuery.data;
  const plan = data?.businessPlan;

  if (contextQuery.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (contextQuery.isError) return <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">Planning data could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">No immigration timeline has been guessed.</p><Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button></Card></div>;

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8"><span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">LONG-TERM PLANNING</span><h1 className="mt-3 text-xl font-bold">Settlement & Long-Term Business Planning</h1><p className="mt-2 text-muted-foreground">A planning workspace for business evidence you may need over time. It does not calculate ILR or citizenship eligibility without your actual immigration history and current official rules.</p></div>

          <Card className="mb-6 border-amber-500/20 bg-amber-500/5 p-5"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="font-semibold">No automatic eligibility date</p><p className="mt-1 text-sm text-muted-foreground">This platform does not currently hold enough verified immigration-history data to tell you when you personally can apply for settlement or citizenship. Check the current GOV.UK rules and your own grant/absence history before relying on any timeline.</p><a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:underline dark:text-red-300">Open official Innovator Founder guidance <ExternalLink className="h-3.5 w-3.5" /></a></div></div></Card>

          <Tabs defaultValue="business" className="space-y-5">
            <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="business">Business Evidence</TabsTrigger><TabsTrigger value="expansion">Expansion</TabsTrigger><TabsTrigger value="tax">Tax & Records</TabsTrigger><TabsTrigger value="immigration">Immigration Checks</TabsTrigger></TabsList>

            <TabsContent value="business"><Card className="p-6"><h2 className="font-semibold">Saved business evidence to keep current</h2>{plan ? <div className="mt-4 grid gap-3 sm:grid-cols-2"><PlanSignal label="Business" value={plan.businessName || "Not recorded"} /><PlanSignal label="Revenue / trading narrative" value={plan.revenue || "Not recorded"} /><PlanSignal label="Hiring plan" value={plan.hiringPlan || "Not recorded"} /><PlanSignal label="Job-creation figure in plan" value={plan.jobCreation ? String(plan.jobCreation) : "Not recorded"} /><PlanSignal label="Traction evidence" value={plan.tractionEvidence || "Not recorded"} /><PlanSignal label="Contact-point strategy" value={plan.contactPointsStrategy || "Not recorded"} /></div> : <div className="mt-4 text-sm text-muted-foreground">No saved plan is available. The workspace will not create business-achievement history for you.</div>}<div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setLocation("/kpi-dashboard")}>Open KPI Dashboard</Button><Button variant="outline" onClick={() => setLocation("/documents")}>Manage Evidence</Button></div></Card></TabsContent>

            <TabsContent value="expansion"><Card className="p-6"><div className="flex items-center gap-2"><Globe className="h-5 w-5 text-red-600" /><h2 className="font-semibold">Expansion currently described in your plan</h2></div>{plan ? <div className="mt-4 space-y-3"><PlanSignal label="Expansion strategy" value={plan.expansion || "Not recorded"} /><PlanSignal label="Specific regions" value={plan.specificRegions || "Not recorded"} /><PlanSignal label="International plan" value={plan.internationalPlan || "Not recorded"} /></div> : <p className="mt-4 text-sm text-muted-foreground">No business-plan expansion data is available.</p>}<p className="mt-4 text-sm text-muted-foreground">Before acting on international expansion, separately check tax, corporate, regulatory and immigration consequences for the countries involved. This tool does not assume that a particular subsidiary structure or timing is appropriate.</p></Card></TabsContent>

            <TabsContent value="tax"><Card className="p-6"><h2 className="font-semibold">Tax and corporate recordkeeping</h2><p className="mt-2 text-sm text-muted-foreground">Keep contemporaneous company accounts, payroll/employment records, contracts and evidence that supports the business claims you make. Tax treatment depends on your actual circumstances, so this page does not recommend dividends, pensions, VAT registration or a company structure.</p><div className="mt-4 flex flex-wrap gap-2"><a href="https://www.gov.uk/browse/tax" target="_blank" rel="noopener noreferrer"><Button variant="outline">GOV.UK tax guidance <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button></a><a href="https://www.gov.uk/government/organisations/companies-house" target="_blank" rel="noopener noreferrer"><Button variant="outline">Companies House guidance <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button></a></div></Card></TabsContent>

            <TabsContent value="immigration"><Card className="p-6"><h2 className="font-semibold">Items that need personal verification</h2><div className="mt-4 space-y-3">{["Your exact immigration route and grant dates", "Absences and residence history", "Current settlement requirements for your route", "Any endorsement/contact-point requirements that apply to you", "English/Life in the UK or other requirements applicable at the date of application", "Citizenship residence and good-character requirements if you later consider naturalisation"].map((item) => <div key={item} className="flex items-start gap-3 rounded-lg border p-3"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span className="text-sm">{item}</span></div>)}</div><p className="mt-4 text-xs text-muted-foreground">These are prompts, not a statement that you meet or fail any requirement.</p></Card></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function PlanSignal({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>;
}
