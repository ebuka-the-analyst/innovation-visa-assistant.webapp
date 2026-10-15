import { Link } from "wouter";
import {
  ArrowRight, BookOpenText, CalendarDays, ChartNoAxesCombined,
  CircleHelp, ClipboardList, FileCheck2, FileSearch, FolderOpen,
  GraduationCap, Landmark, LockKeyhole, Network, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useToolAccess } from "@/hooks/useCommercialCatalog";
import { innovatorFounderPath } from "@/lib/innovator-founder-routes";
import { memberUpgradeDescription } from "@shared/memberToolPlan";
import {
  IFVA_JOURNEY_PHASES, IFVA_JOURNEY_ADDITIONAL,
  type JourneyIcon, type JourneyItem,
} from "@/lib/ifvaJourney";

const ICONS:Record<JourneyIcon,LucideIcon>={
  plan:BookOpenText, compare:ClipboardList, documents:FolderOpen,
  practice:GraduationCap, experts:CalendarDays, refusal:FileSearch,
  settlement:Landmark, metrics:ChartNoAxesCombined,
  evidence:Network, review:FileCheck2,
};

function JourneyCard({
  item,accessLabel,
}:{
  item:JourneyItem;
  accessLabel:string;
}){
  const Icon=ICONS[item.icon];
  return <Link href={innovatorFounderPath(item.route)}
    className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
    data-testid={`card-feature-${item.id}`}>
    <Card className="relative flex h-full flex-col overflow-hidden rounded-xl border p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/[0.02] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true"/>
        </span>
        <Badge variant="outline" className="max-w-[70%] whitespace-normal text-right text-xs font-normal">
          {item.access==="tool" && accessLabel!=="Available on your plan"
            ? <LockKeyhole className="mr-1 inline h-3 w-3" aria-hidden="true"/>
            : null}
          {accessLabel}
        </Badge>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {item.action}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true"/>
      </span>
    </Card>
  </Link>;
}

export default function FeaturesDashboard(){
  const auth=useAuth();
  const access=useToolAccess(auth.isAuthenticated);

  // Only the server-owned access endpoint can confirm whether the currently
  // signed-in user has paid access. Do not infer it from displayed plan labels.
  const labelFor=(item:JourneyItem):string=>{
    if(item.access==="independent_booking")return "Separate booking, if available";
    if(item.access==="plan_credits")return "Paid membership + credits";
    if(item.access==="workflow")return "Open feature";
    if(!auth.isAuthenticated)return "Sign in to check access";
    if(auth.isLoading||access.isLoading)return "Checking membership access";
    if(access.isError)return "Access status unavailable";
    const row=item.toolId?access.getToolAccess(item.toolId):undefined;
    if(!row)return "Access status unavailable";
    if(row.allowed)return "Available on your plan";
    if(row.minimumPlanId==="free")return "Access not available";
    return memberUpgradeDescription(row.minimumPlanId);
  };

  return <div className="min-h-screen bg-background">
    <SEOHead
      title="Your IFVA Preparation Journey | Innovator Founder Visa Assistant"
      description="Explore IFVA tools for business planning, organising evidence, interview preparation, and longer-term business planning."
      canonical="https://innovatorfoundervisaassistant.co.uk/uk/innovatorfoundervisaassistant/features-dashboard"
    />
    <div className="responsive-container py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-2xl border bg-gradient-to-br from-primary/[0.08] via-background to-background p-6 sm:p-9">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true"/> IFVA preparation tools
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Your preparation journey</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Use these suggested steps to organise your UK Innovator Founder Visa business preparation.
            Explore only the tools you need; this guide is not an official visa application process or a guarantee of endorsement.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={innovatorFounderPath("/tools-hub")}><Button size="sm" variant="outline">
              Browse tools <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true"/>
            </Button></Link>
            <Link href="/pricing"><Button size="sm">View memberships</Button></Link>
          </div>
        </header>

        <div className="space-y-10">
          {IFVA_JOURNEY_PHASES.map(phase=><section key={phase.number}
            aria-labelledby={`ifva-journey-phase-${phase.number}`}>
            <div className="mb-4 flex items-start gap-3 sm:mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-sm font-bold text-primary">
                {phase.number}
              </div>
              <div>
                <h2 id={`ifva-journey-phase-${phase.number}`} className="text-lg font-semibold sm:text-xl">{phase.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {phase.items.map(item=><JourneyCard key={item.id} item={item} accessLabel={labelFor(item)}/>)}
            </div>
          </section>)}
        </div>

        <section className="mt-12" aria-labelledby="ifva-additional-heading">
          <div className="mb-5 flex items-center gap-3">
            <CircleHelp className="h-5 w-5 text-primary" aria-hidden="true"/>
            <div>
              <h2 id="ifva-additional-heading" className="text-lg font-semibold sm:text-xl">Additional preparation tools</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use these when you need to examine specific evidence or refusal-related questions.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {IFVA_JOURNEY_ADDITIONAL.map(item=><JourneyCard key={item.id} item={item} accessLabel={labelFor(item)}/>)}
          </div>
        </section>

        <aside className="mt-10 rounded-xl border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground" aria-label="IFVA advice and booking notice">
          <h2 className="mb-2 font-semibold text-foreground">Before you continue</h2>
          IFVA provides software for business and application preparation, not regulated immigration advice.
          Software memberships do not include individual business-plan consultations, visa advice,
          endorsement decisions or expert appointments. Separate professional bookings, if offered,
          have their own terms and charges. Always check current immigration requirements with official sources.
        </aside>
      </div>
    </div>
  </div>;
}
