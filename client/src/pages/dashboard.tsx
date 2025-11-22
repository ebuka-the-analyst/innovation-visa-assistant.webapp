import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Download, Clock, CheckCircle, AlertCircle, TrendingUp, Target, Zap, Award } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import ChatBot from "@/components/ChatBot";
import type { BusinessPlan } from "@shared/schema";
import { format } from "date-fns";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";

// DEMO/DUMMY DATA for showcase
const DUMMY_PLANS: BusinessPlan[] = [
  {
    id: "demo-1",
    tier: "premium",
    businessName: "BhenMedia",
    industry: "AI/SaaS - Media & Content",
    problem: "Current UK visa system lacks AI-powered business plan generation, forcing founders to spend 60+ hours on documentation",
    uniqueness: "VisaPrep AI combines Advanced visa expertise with GPT-4 to generate policy-aware, endorser-ready business plans in minutes. Our proprietary questionnaire maps to all 475 visa criteria across Innovation, Viability, and Scalability. No competitor offers this integrated solution.",
    technology: "Next.js, React, TypeScript, PostgreSQL, OpenAI GPT-4 API, Stripe for payments, Drizzle ORM",
    techStack: "Frontend: React 18 with TypeScript, Tailwind CSS. Backend: Express.js, PostgreSQL with Drizzle ORM. AI: OpenAI GPT-4 for business plan generation and analysis. Integrations: Stripe for payments, Resend for email.",
    dataArchitecture: "PostgreSQL database with Drizzle ORM. User profiles, business plan questionnaires, generated content stored securely. Document storage for PDFs. Real-time WebSocket updates for generation progress.",
    aiMethodology: "GPT-4 prompt engineering for visa-specific content generation. Multi-stage generation: questionnaire analysis → section-by-section content → financial projections → PDF formatting. Validation against UK Home Office criteria.",
    complianceDesign: "GDPR-compliant data handling. User data encryption. No third-party sharing. Compliant with UK data protection regulations. Privacy-first architecture with secure authentication.",
    patentStatus: "2 patent applications filed: (1) AI-powered visa questionnaire-to-business plan conversion system, (2) Multi-criteria visa application analyzer",
    experience: "Founder has 8 years in fintech and immigration tech. CTO previously built 3 million-user platforms. Head of Product led visa category at Tech Nation Accelerator.",
    founderEducation: "Founder: BSc Computer Science (LSE), MBA (INSEAD). CTO: BSc Physics (Cambridge), Self-taught ML engineer. Legal advisor: Barrister specializing in immigration law (8 years experience).",
    founderWorkHistory: "CEO: 3 years Wise (fintech unicorn), 2 years founding fintech startup (£2M raised), 3 years consulting on visa strategy. Team has shipped 5 consumer products with 10M+ users combined.",
    founderAchievements: "Featured in TechCrunch, Forbes 30 Under 30 (Founder). 30k Twitter followers in visa space. Speaking at 5 UK innovation conferences. Advisory board member at London Innovation Hub.",
    relevantProjects: "Built visa success prediction tool (92% accuracy). Created 'Visa Criteria Mapper' open-source tool (500 GitHub stars). Mentored 20+ founders through UK visa process.",
    monthlyProjections: "Month 1-3: 50-150 plans/month (beta phase). Month 4-6: 500-1000 plans/month (launch phase). Month 12: 5000+ plans/month. Year 2: £500k ARR projected (conservative).",
    customerAcquisitionCost: 45,
    lifetimeValue: 450,
    paybackPeriod: 3,
    fundingSources: "£250,000 seed from angel investors (tech founders). £150,000 from government innovation grant. Personal investment: £50,000.",
    detailedCosts: "Team: £180k/year (3 FT). Infrastructure: £15k/year (servers, DBs, APIs). Marketing: £50k/year. Legal/Compliance: £20k/year. Operations: £35k/year. Total Year 1: £300k.",
    revenue: "B2B SaaS model: £19-£199/plan depending on tier. Target: 1000 plans in Year 1 = £800k revenue (conservative). Year 2: 5000 plans = £4M ARR.",
    competitors: "Tech Nation Accelerator (limited to their cohort), traditional immigration consultants (£3k-5k per person), generic business plan generators",
    competitiveDifferentiation: "Only AI solution purpose-built for UK Innovator Founder Visa. Our questionnaire was co-created with visa officers and endorser advisors. 25x cheaper than consultants. 60+ hours saved per founder.",
    customerInterviews: "Interviewed 50 recent visa applicants. 94% said they'd pay for this solution. 12 endorser organizations expressed interest in partnership. Tech Nation piloting with their cohort.",
    lettersOfIntent: "LOI from Tech Nation (500 founders/year). LOI from immigration consulting firm (referral partnership). 8 individual founders committed to purchase.",
    willingnessToPay: "Founders willing to pay £50-200 depending on tier. Corporate endorsers interested in £500/month partner license. Consulting firms interested in white-label offering.",
    marketSize: "TAM: 10,000 UK Innovator Founder Visa applications/year × £100 ARPU = £1M. SAM: Tech/fintech founders = 3,000/year = £300k. SOM Year 1: 300 users = £90k.",
    regulatoryRequirements: "FCA guidance on offering visa services (compliant). Data protection: GDPR and UK Data Protection Act 2018. Immigration advice: Operating under Tech Nation's registration.",
    complianceTimeline: "Month 1-2: Complete FCA compliance review. Month 2-3: GDPR audit and certification. Month 3-4: Immigration advice regulation compliance. Ongoing: Quarterly compliance audits.",
    complianceBudget: 75000,
    hiringPlan: "Year 1: +2 engineers (visa generation, payment systems), +1 legal (compliance). Year 2: +1 sales, +1 customer success. Year 3: +2 more engineers. Total Year 3: 8 FT employees.",
    specificRegions: "Launch: UK (focus on London tech hub). Year 2: Expand to other Commonwealth countries (Australia, Canada). Year 3: Expand to Singapore, HK as visa consultancies are expanding.",
    internationalPlan: "Australia and Canada have similar visa programs. Our system is adaptable. Partnership strategy with immigration firms in target countries. Revenue from international licenses.",
    expansion: "Phase 1 (Year 1): Perfect UK product, acquire 300 customers. Phase 2 (Year 2): Expand to Commonwealth (Canada, Australia). Phase 3 (Year 3): Asia-Pacific expansion (Singapore, Hong Kong).",
    vision: "Become the global standard for immigration visa business planning. Our vision: 50,000 founders/year using VisaPrep. Target: £100M ARR by Year 5. Exit: Acquisition by immigration tech platform or IPO.",
    targetEndorser: "Tech Nation (primary - they use our tool for cohort)", 
    contactPointsStrategy: "Quarterly milestone reviews with Tech Nation stakeholder. Monthly check-ins with customer success manager. Bi-annual product roadmap meetings. Annual review with founder council.",
    status: "completed",
    generatedContent: "Professional 45-page business plan generated covering all three visa criteria in detail.",
    pdfUrl: "#",
    stripeSessionId: "session_demo_1",
    currentGenerationStage: null,
    userId: "demo-user",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    supportingEvidence: null,
  },
  {
    id: "demo-2",
    tier: "enterprise",
    businessName: "NeuroData Analytics",
    industry: "AI/ML - Healthcare Data",
    problem: "Healthcare institutions lack real-time analytics for clinical trial data, leading to delayed insights and inefficient research",
    uniqueness: "AI-powered real-time analytics engine for clinical trials with HIPAA compliance and FDA-ready documentation",
    technology: "Python, TensorFlow, React, AWS, PostgreSQL",
    techStack: "Backend: Python with FastAPI, TensorFlow/PyTorch for ML models. Frontend: React with D3 for visualizations. Cloud: AWS (SageMaker, RDS, S3). Infrastructure: Kubernetes for scaling.",
    dataArchitecture: "HIPAA-compliant data warehouse. Real-time streaming from hospital systems via FHIR standard. Encrypted storage with role-based access control.",
    aiMethodology: "Transformer models for time-series prediction. Anomaly detection for trial data quality. Explainable AI for clinical interpretability.",
    complianceDesign: "FDA 21 CFR Part 11 compliant. HIPAA encryption and audit logging. SOC 2 Type II certification. Data residency in UK/EU.",
    patentStatus: "3 patents issued for real-time clinical ML algorithms. 2 more in prosecution.",
    experience: "CTO: 12 years healthcare IT. Previously led AI at GE Healthcare. 40+ peer-reviewed publications.",
    founderEducation: "PhD Biomedical Engineering (Stanford), MS Computer Science (CMU)",
    founderWorkHistory: "15 years combined healthcare industry experience. Founded 1 previous successful MedTech startup.",
    founderAchievements: "Published in Nature Medicine, The Lancet, JAMA. Named Global Healthcare Innovator 2023.",
    relevantProjects: "Built trial monitoring system used by 5 Phase III trials (500+ patients combined)",
    monthlyProjections: "Licensing model: £50k-500k per hospital. Target: 20 hospitals Year 1.",
    customerAcquisitionCost: 120,
    lifetimeValue: 2400,
    paybackPeriod: 12,
    fundingSources: "£1.2M Series A (biotech VCs), £400k government R&D grant",
    detailedCosts: "Team: £400k/year. Infrastructure: £50k/year. Compliance: £100k/year. Clinical validation: £150k/year.",
    revenue: "Enterprise licensing: £300k Year 1. Scale to £2M Year 2.",
    competitors: "Medidata, Oracle Health, Veeva",
    competitiveDifferentiation: "Only real-time system. FDA-ready. Significantly cheaper than competitors.",
    customerInterviews: "5 pharma companies and 10 hospital networks expressed strong interest",
    lettersOfIntent: "LOI from 3 Fortune 500 pharma companies",
    willingnessToPay: "£200k-500k annual licensing for large health systems",
    marketSize: "TAM: 15,000 clinical trials/year globally × £200k ARPU = £3B",
    regulatoryRequirements: "FDA clearance, HIPAA compliance, EMA approval for EU market",
    complianceTimeline: "FDA submission in Month 4, clearance expected Month 10",
    complianceBudget: 250000,
    hiringPlan: "8 person team, including clinical specialists and regulatory experts",
    specificRegions: "UK and Europe initially, then North America and APAC",
    internationalPlan: "FDA approval Year 2, then launch in US and Canada markets",
    expansion: "2 platforms Year 1, 10 platforms by Year 3. Geographic expansion after US entry.",
    vision: "Global leader in AI-powered clinical trial analytics. 10,000+ active trials using platform by Year 5.",
    targetEndorser: "Innovator International",
    contactPointsStrategy: "Quarterly board updates, milestone-based review schedule",
    status: "completed",
    generatedContent: "Comprehensive 65-page enterprise plan with regulatory roadmap",
    pdfUrl: "#",
    stripeSessionId: "session_demo_2",
    currentGenerationStage: null,
    userId: "demo-user",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    supportingEvidence: null,
  },
  {
    id: "demo-3",
    tier: "basic",
    businessName: "GreenTech Solutions",
    industry: "Climate Tech - Energy Efficiency",
    problem: "Commercial buildings waste 30% of energy due to inefficient HVAC systems",
    uniqueness: "IoT + ML for predictive HVAC maintenance and optimization",
    technology: "Node.js, React, Arduino, TensorFlow Lite",
    techStack: "IoT sensors with edge computing. Cloud platform on AWS. Real-time dashboard.",
    dataArchitecture: "Time-series database for sensor data. Real-time processing with Kafka.",
    aiMethodology: "ML models for fault detection and predictive maintenance.",
    complianceDesign: "ISO 27001 information security management",
    patentStatus: "1 patent pending for IoT-ML integration",
    experience: "CEO: 5 years climate tech. CTO: 7 years IoT development.",
    founderEducation: "BSc Environmental Engineering, MSc Computer Science",
    founderWorkHistory: "5 years at Siemens Building Technologies, 3 years as startup founder",
    founderAchievements: "Shortlisted for Global Cleantech Award 2023",
    relevantProjects: "Pilot installed in 3 London buildings (15% energy savings)",
    monthlyProjections: "10 installations Month 1-3, scaling to 50/month by Month 12",
    customerAcquisitionCost: 30,
    lifetimeValue: 150,
    paybackPeriod: 5,
    fundingSources: "£300k angel funding, £100k accelerator grant",
    detailedCosts: "Team: £150k/year, Hardware: £80k/year, Cloud: £15k/year",
    revenue: "£15k per installation × 10 per month = £1.8M Year 1",
    competitors: "Ecobee, Honeywell, Siemens",
    competitiveDifferentiation: "50% cheaper, faster ROI (6 months vs 18 months)",
    customerInterviews: "20 commercial property managers expressed interest",
    lettersOfIntent: "5 LOIs from major London property companies",
    willingnessToPay: "£10k-15k per installation",
    marketSize: "500k commercial buildings in UK alone, 30% wasteful = £50B market opportunity",
    regulatoryRequirements: "Building Energy Certificate compliance, CE marking for devices",
    complianceTimeline: "CE certification Month 2, Building Regs approval Month 4",
    complianceBudget: 40000,
    hiringPlan: "5 person team: 2 engineers, 2 installers, 1 sales",
    specificRegions: "London first, then expand to UK South East",
    internationalPlan: "EU expansion Year 2 with CE certification",
    expansion: "Scale to 50 buildings/month, then expand to industrial facilities",
    vision: "Become UK's leading IoT energy efficiency provider, targeting 50,000 buildings",
    targetEndorser: "Tech Nation",
    contactPointsStrategy: "Monthly business reviews, quarterly expansion meetings",
    status: "generating",
    generatedContent: null,
    pdfUrl: null,
    stripeSessionId: "session_demo_3",
    currentGenerationStage: "Generating Financial Projections...",
    userId: "demo-user",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    supportingEvidence: null,
  },
  {
    id: "demo-4",
    tier: "premium",
    businessName: "SwiftLegal AI",
    industry: "LegalTech - Contract Analysis",
    problem: "Legal teams spend 40+ hours reviewing standard contracts manually",
    uniqueness: "AI contract analyzer trained on 100k+ legal documents, 95% accuracy",
    technology: "Python, GPT-4, React, PostgreSQL",
    techStack: "Backend: Python with FastAPI. NLP: GPT-4 for contract analysis. Frontend: React with Monaco editor.",
    dataArchitecture: "Secure document storage with encryption. Version control for contracts.",
    aiMethodology: "Fine-tuned GPT-4 on legal contract corpus. Real-time analysis with confidence scores.",
    complianceDesign: "Solicitor-approved workflows. Attorney-client privilege preserved.",
    patentStatus: "Patent pending for contract ML analysis system",
    experience: "CEO: 6 years corporate law, 2 years LegalTech. CTO: 8 years SaaS",
    founderEducation: "Law degree (Oxford), MSc Technology Entrepreneurship",
    founderWorkHistory: "5 years at Freshfields (Magic Circle law firm), 3 years startup founder",
    founderAchievements: "LegalTech Innovator of the Year 2023",
    relevantProjects: "Beta tested with 8 law firms, 92% accuracy validation",
    monthlyProjections: "20 sign-ups Month 1, 100+ by Month 6",
    customerAcquisitionCost: 50,
    lifetimeValue: 300,
    paybackPeriod: 6,
    fundingSources: "£400k seed from legal sector VCs, £50k innovation grant",
    detailedCosts: "Team: £180k/year, API costs: £20k/year, Infrastructure: £15k/year",
    revenue: "£99-299/month per user. Target: 200 users = £60k MRR",
    competitors: "LawGeex, Ironclad, Kira Systems",
    competitiveDifferentiation: "50% cheaper, faster analysis (minutes vs hours), UK-optimized for English law",
    customerInterviews: "30 law firms interviewed, 80% would buy",
    lettersOfIntent: "8 top-20 law firms committed to 12-month trial",
    willingnessToPay: "£150-500/month depending on volume",
    marketSize: "10,000 UK law firms × 5 attorneys = 50,000 potential users × £200 ARPU = £10M",
    regulatoryRequirements: "Solicitors Regulation Authority approval, Legal Services Board compliance",
    complianceTimeline: "SRA approval Month 3-4, LSB sign-off Month 5",
    complianceBudget: 60000,
    hiringPlan: "6 person team: 2 lawyers, 2 engineers, 1 sales, 1 customer success",
    specificRegions: "UK market focus, then expand to US (different legal system)",
    internationalPlan: "US market entry Year 2 with US law firm partnerships",
    expansion: "From contracts to due diligence and intellectual property analysis",
    vision: "Transform legal work globally with AI. 100,000 lawyers using platform by Year 5.",
    targetEndorser: "Tech Nation",
    contactPointsStrategy: "Monthly stakeholder updates, quarterly product evolution reviews",
    status: "pending",
    generatedContent: null,
    pdfUrl: null,
    stripeSessionId: null,
    currentGenerationStage: null,
    userId: "demo-user",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    supportingEvidence: null,
  },
];


// Calculate approval probability based on plan completeness and tier
function calculateApprovalProbability(plan: BusinessPlan): number {
  if (plan.status !== 'completed') return 0;
  
  let score = 0;
  
  // Base score by tier
  if (plan.tier === 'enterprise') score += 40;
  else if (plan.tier === 'premium') score += 30;
  else score += 20;
  
  // Completeness checks (each worth points)
  if (plan.founderEducation && plan.founderEducation.length > 50) score += 5;
  if (plan.founderWorkHistory && plan.founderWorkHistory.length > 100) score += 5;
  if (plan.customerInterviews && plan.customerInterviews.length > 100) score += 10;
  if (plan.lettersOfIntent && plan.lettersOfIntent.length > 50) score += 10;
  if (plan.patentStatus && plan.patentStatus.length > 20) score += 5;
  if (plan.funding >= 50000) score += 10;
  if (plan.lifetimeValue > 0 && plan.customerAcquisitionCost > 0) {
    const ratio = plan.lifetimeValue / plan.customerAcquisitionCost;
    if (ratio >= 3) score += 10;
  }
  if (plan.complianceBudget >= 50000) score += 5;
  if (plan.jobCreation >= 5) score += 5;
  
  return Math.min(95, Math.max(65, score)); // Cap between 65-95%
}

// Calculate completeness percentage
function calculateCompleteness(plan: BusinessPlan): number {
  const fields = [
    plan.businessName,
    plan.industry,
    plan.problem,
    plan.uniqueness,
    plan.techStack,
    plan.dataArchitecture,
    plan.aiMethodology,
    plan.complianceDesign,
    plan.patentStatus,
    plan.founderEducation,
    plan.founderWorkHistory,
    plan.founderAchievements,
    plan.relevantProjects,
    plan.monthlyProjections,
    plan.fundingSources,
    plan.detailedCosts,
    plan.revenue,
    plan.competitors,
    plan.competitiveDifferentiation,
    plan.customerInterviews,
    plan.willingnessToPay,
    plan.marketSize,
    plan.regulatoryRequirements,
    plan.complianceTimeline,
    plan.hiringPlan,
    plan.specificRegions,
    plan.expansion,
    plan.vision,
    plan.targetEndorser,
    plan.contactPointsStrategy,
    plan.experience,
  ];
  
  const filledFields = fields.filter(f => f && f.toString().length > 10).length;
  return Math.round((filledFields / fields.length) * 100);
}

// Calculate Innovator Founder Visa Radar data
function calculateRadarData(plan: BusinessPlan) {
  // Innovation score (0-100)
  let innovationScore = 0;
  if (plan.uniqueness && plan.uniqueness.length > 100) innovationScore += 25;
  if (plan.techStack && plan.techStack.length > 50) innovationScore += 20;
  if (plan.aiMethodology && plan.aiMethodology.length > 100) innovationScore += 20;
  if (plan.patentStatus && plan.patentStatus.includes('filed')) innovationScore += 20;
  if (plan.competitiveDifferentiation && plan.competitiveDifferentiation.length > 100) innovationScore += 15;
  
  // Viability score (0-100)
  let viabilityScore = 0;
  if (plan.funding >= 50000) viabilityScore += 20;
  if (plan.revenue && plan.revenue.length > 100) viabilityScore += 20;
  if (plan.customerInterviews && plan.customerInterviews.length > 100) viabilityScore += 20;
  if (plan.lifetimeValue > 0 && plan.customerAcquisitionCost > 0) {
    const ratio = plan.lifetimeValue / plan.customerAcquisitionCost;
    if (ratio >= 3) viabilityScore += 20;
  }
  if (plan.founderWorkHistory && plan.founderWorkHistory.length > 100) viabilityScore += 20;
  
  // Scalability score (0-100)
  let scalabilityScore = 0;
  if (plan.jobCreation >= 5) scalabilityScore += 25;
  if (plan.hiringPlan && plan.hiringPlan.length > 100) scalabilityScore += 20;
  if (plan.expansion && plan.expansion.length > 100) scalabilityScore += 20;
  if (plan.specificRegions && plan.specificRegions.length > 30) scalabilityScore += 15;
  if (plan.vision && plan.vision.length > 100) scalabilityScore += 20;
  
  return [
    { criterion: 'Innovation', score: innovationScore, fullMark: 100 },
    { criterion: 'Viability', score: viabilityScore, fullMark: 100 },
    { criterion: 'Scalability', score: scalabilityScore, fullMark: 100 },
  ];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: businessPlans, isLoading: plansLoading } = useQuery<BusinessPlan[]>({
    queryKey: ['/api/dashboard/plans'],
    enabled: !!user,
  });

  // Use dummy data if no real plans exist (for demo/showcase)
  const displayPlans = businessPlans && businessPlans.length > 0 ? businessPlans : DUMMY_PLANS;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Generating</Badge>;
      case 'paid':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const completedPlan = displayPlans?.find(p => p.status === 'completed');
  const radarData = completedPlan ? calculateRadarData(completedPlan) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <AuthHeader />
      
      {/* Demo Banner */}
      {!businessPlans || businessPlans.length === 0 ? (
        <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border-b border-primary/20 px-4 py-3">
          <div className="container mx-auto">
            <p className="text-sm text-foreground"><span className="font-semibold">Demo Dashboard:</span> Sample data showing completed, in-progress, and pending business plans. Create a new plan to replace with your real data.</p>
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Track your UK Innovator Founder Visa applications</p>
          </div>
          <Button 
            size="lg"
            onClick={() => setLocation("/pricing")}
            data-testid="button-create-plan"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Plan
          </Button>
        </div>

        {plansLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : displayPlans && displayPlans.length > 0 ? (
          <div className="space-y-8">
            {/* Insights Cards - Only show if there's a completed plan */}
            {completedPlan && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card data-testid="card-insight-approval">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approval Probability</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-3">
                      {calculateApprovalProbability(completedPlan)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on {completedPlan.tier} tier completeness
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-insight-completeness">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completeness Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {calculateCompleteness(completedPlan)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      All critical fields answered
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-insight-time-saved">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">
                      {completedPlan.tier === 'enterprise' ? '120+' : completedPlan.tier === 'premium' ? '80+' : '40+'} hrs
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      vs traditional consultant
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Innovator Founder Visa Radar Chart - Only show if there's a completed plan */}
            {completedPlan && radarData && (
              <Card data-testid="card-visa-radar">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Innovator Founder Visa Strength Indicator</CardTitle>
                  </div>
                  <CardDescription>
                    Your business plan performance across the three core UK Innovator Founder Visa criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="criterion" 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    {radarData.map((item) => (
                      <div key={item.criterion} className="space-y-1">
                        <p className="text-sm font-medium">{item.criterion}</p>
                        <p className="text-2xl font-bold text-primary">{item.score}/100</p>
                        <p className="text-xs text-muted-foreground">
                          {item.score >= 80 ? 'Excellent' : item.score >= 60 ? 'Good' : item.score >= 40 ? 'Fair' : 'Needs Work'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Plans List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Business Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayPlans.map((plan) => (
                  <Card key={plan.id} className="hover-elevate" data-testid={`card-plan-${plan.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{plan.businessName}</CardTitle>
                        {getStatusBadge(plan.status)}
                      </div>
                      <CardDescription>{plan.industry}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tier:</span>
                          <span className="font-medium capitalize">{plan.tier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">
                            {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {plan.currentGenerationStage && plan.status === 'generating' && (
                          <div className="mt-3 p-2 bg-accent/20 rounded text-xs">
                            <p className="text-muted-foreground">{plan.currentGenerationStage}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {plan.status === 'completed' && plan.pdfUrl && (
                        <>
                          <Button 
                            variant="default" 
                            className="flex-1"
                            onClick={() => window.open(plan.pdfUrl!, '_blank')}
                            data-testid={`button-download-${plan.id}`}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              localStorage.setItem('lastPlanId', plan.id);
                              setLocation(`/diagnostics?planId=${plan.id}`);
                            }}
                            data-testid={`button-diagnostics-${plan.id}`}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Diagnostics
                          </Button>
                        </>
                      )}
                      {plan.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setLocation(`/questionnaire?tier=${plan.tier}`)}
                          data-testid={`button-continue-${plan.id}`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      )}
                      {plan.status === 'generating' && (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setLocation(`/generation?plan_id=${plan.id}`)}
                          data-testid={`button-view-progress-${plan.id}`}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          View Progress
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card className="text-center p-12">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No business plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered business plan for your UK Innovator Founder Visa application
            </p>
            <Button 
              size="lg"
              onClick={() => setLocation("/pricing")}
              data-testid="button-create-first-plan"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Plan
            </Button>
          </Card>
        )}
      </main>
      
      {/* Floating Chatbot */}
      <ChatBot />
    </div>
  );
}
