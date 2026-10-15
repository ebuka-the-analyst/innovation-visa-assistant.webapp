/**
 * Customer-facing IFVA preparation journey.
 *
 * All routes are internal and registered in App.tsx. Tool access is never
 * inferred from these labels; the frontend reads /api/tools/access and each
 * destination retains its own server-side checks.
 */
export type JourneyIcon =
  | "plan" | "compare" | "documents" | "practice" | "experts"
  | "refusal" | "settlement" | "metrics" | "evidence" | "review";
export type JourneyAccess = "tool" | "plan_credits" | "independent_booking" | "workflow";
export type JourneyItem = Readonly<{
  id: string;
  title: string;
  description: string;
  route: string;
  icon: JourneyIcon;
  access: JourneyAccess;
  toolId?: string;
  action: string;
}>;
export type JourneyPhase = Readonly<{
  number: number;
  title: string;
  description: string;
  items: readonly JourneyItem[];
}>;
export const IFVA_JOURNEY_PHASES: readonly JourneyPhase[] = [
  {
    number: 1,
    title: "Develop your business case",
    description: "Build your idea and explore endorsing-body requirements.",
    items: [
      { id:"business-plan", title:"Business Plan Builder",
        description:"Prepare a structured business plan using your founder information. AI-assisted generation requires an eligible paid membership and available generation credits.",
        route:"/questionnaire", icon:"plan", access:"plan_credits", action:"Explore plan preparation" },
      { id:"endorser-comparison", title:"Endorser Comparison",
        description:"Compare information about endorsing bodies and their published requirements. Always verify current criteria and availability with each body.",
        route:"/endorser-comparison", icon:"compare", access:"tool", toolId:"endorser-comparison", action:"Compare endorsers" },
    ],
  },
  {
    number: 2,
    title: "Organise your evidence",
    description: "Prepare supporting documents and identify missing information.",
    items: [
      { id:"document-organizer", title:"Document Organiser",
        description:"Arrange application materials and keep a clear record of your supporting evidence. Review any documents yourself before submission.",
        route:"/document-organizer", icon:"documents", access:"tool", toolId:"doc-organizer", action:"Organise documents" },
    ],
  },
  {
    number: 3,
    title: "Prepare for discussions",
    description: "Practise your presentation and explore optional external professional help.",
    items: [
      { id:"interview-prep", title:"Interview Preparation",
        description:"Practise potential questions and develop clearer explanations of innovation, viability and scalability using IFVA's preparation tools.",
        route:"/interview-prep", icon:"practice", access:"tool", toolId:"interview-prep", action:"Explore interview practice" },
      { id:"expert-booking", title:"Optional Expert Appointments",
        description:"Browse independently booked appointments if available. Professional consultations are separate services, not included in any IFVA software membership.",
        route:"/expert-booking", icon:"experts", access:"independent_booking", action:"View separate booking options" },
    ],
  },
  {
    number: 4,
    title: "Review a refusal, if relevant",
    description: "Understand the issues raised and organise materials for further review.",
    items: [
      { id:"rejection-analysis", title:"Refusal Analysis",
        description:"Organise refusal-related information and identify points that may need more evidence or professional review. This is not immigration advice.",
        route:"/rejection-analysis", icon:"refusal", access:"tool", toolId:"rejection-analysis", action:"Review refusal information" },
    ],
  },
  {
    number: 5,
    title: "Track your longer-term plans",
    description: "Monitor information you've saved; do not confuse preparation metrics with official UKVI decisions.",
    items: [
      { id:"settlement-planning", title:"Settlement Planning",
        description:"Explore longer-term planning topics and keep track of questions to verify against current official UK immigration rules.",
        route:"/settlement-planning", icon:"settlement", access:"tool", toolId:"settlement-planning", action:"Explore settlement planning" },
      { id:"kpi-dashboard", title:"Evidence & Business KPIs",
        description:"Review completeness indicators based on your saved business-plan and evidence information, not an immigration-compliance score.",
        route:"/kpi-dashboard", icon:"metrics", access:"tool", toolId:"kpi-dashboard", action:"Review saved information" },
    ],
  },
];

export const IFVA_JOURNEY_ADDITIONAL: readonly JourneyItem[] = [
  { id:"evidence-graph", title:"Evidence Graph",
    description:"Explore how your saved application claims connect to supporting documents and spot information gaps.",
    route:"/evidence-graph", icon:"evidence", access:"workflow", action:"Explore evidence graph" },
  { id:"rfe-defence-lab", title:"Refusal Evidence Review",
    description:"Review evidence gaps and organise draft response considerations. This does not provide a legal assessment or predict an outcome.",
    route:"/rfe-defence-lab", icon:"review", access:"tool", toolId:"rfe-defense", action:"Explore evidence review" },
];
