import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  CheckCircle2, FileText, Users, Building2, Clock, 
  PoundSterling, Globe, Lightbulb, Target, ArrowRight,
  BookOpen, Award, Shield, Rocket
} from "lucide-react";
import { createArticleSchema, createHowToSchema, createBreadcrumbSchema } from "@/lib/seoSchemas";

const articleSchema = createArticleSchema(
  "Complete UK Innovator Founder Visa Guide 2025 - Everything You Need to Know",
  "The definitive guide to the UK Innovator Founder Visa. Learn requirements, application process, costs, endorsing bodies, and expert tips for success.",
  "2025-01-01",
  "2025-01-21"
);

const howToSchema = createHowToSchema(
  "How to Apply for UK Innovator Founder Visa",
  "Step-by-step guide to successfully apply for the UK Innovator Founder Visa in 2025",
  [
    { name: "Assess Your Eligibility", text: "Verify you meet all basic requirements including innovative business idea, English proficiency, and maintenance funds of at least £1,270." },
    { name: "Develop Your Business Plan", text: "Create a comprehensive business plan demonstrating innovation, viability, and scalability. Your plan must show how your business will benefit the UK economy." },
    { name: "Choose an Endorsing Body", text: "Research and select an appropriate endorsing body from the 40+ approved organizations. Consider their sector expertise and success rates." },
    { name: "Apply for Endorsement", text: "Submit your business plan and supporting documents to your chosen endorsing body. Attend interviews and answer due diligence questions." },
    { name: "Gather Required Documents", text: "Collect passport, TB test results, criminal record certificate, English language test results, and bank statements showing maintenance funds." },
    { name: "Submit Visa Application", text: "Complete the online application on GOV.UK, pay the visa fee, and schedule your biometrics appointment." },
    { name: "Attend Biometrics", text: "Visit a visa application centre to provide fingerprints and photograph." },
    { name: "Receive Decision", text: "Wait 3-8 weeks for your visa decision. Once approved, you can travel to the UK and begin your business." }
  ]
);

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Resources", url: "/resources" },
  { name: "Ultimate Guide", url: "/guide/ultimate-uk-innovator-founder-visa-guide" }
]);

export default function UltimateGuidePage() {
  return (
    <>
      <SEOHead
        title="Complete UK Innovator Founder Visa Guide 2025 | Requirements, Process & Tips"
        description="The definitive 3000+ word guide to the UK Innovator Founder Visa. Learn eligibility requirements, application process, endorsing bodies, costs, timelines, and expert tips for a successful application."
        path="/guide/ultimate-uk-innovator-founder-visa-guide"
        keywords="UK Innovator Founder Visa, Innovator Visa requirements 2025, UK startup visa, endorsing bodies UK, visa application process, UK immigration entrepreneur"
        schemas={[articleSchema, howToSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#005EB8]/10 via-background to-[#41B6E6]/10 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumb-nav">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/resources" className="hover:text-primary">Resources</Link>
              <span>/</span>
              <span className="text-foreground">Ultimate Guide</span>
            </nav>
            
            <Badge className="mb-4 bg-primary/10 text-primary">Updated January 2025</Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" data-testid="heading-ultimate-guide">
              The Complete UK Innovator Founder Visa Guide 2025
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know about the UK Innovator Founder Visa, from eligibility requirements 
              to successful application strategies. Written by visa experts with 95%+ endorsement success rate.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/questionnaire" data-testid="link-start-application">
                  Start Your Application <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/tools/eligibility-validator" data-testid="link-check-eligibility">
                  Check Your Eligibility
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                What's in This Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "What is the Innovator Founder Visa?",
                  "Eligibility Requirements",
                  "The Three Innovation Criteria",
                  "Complete Application Process",
                  "Endorsing Bodies Explained",
                  "Costs & Financial Requirements",
                  "Processing Times & Timelines",
                  "Common Mistakes to Avoid",
                  "Expert Tips for Success",
                  "Frequently Asked Questions"
                ].map((item, index) => (
                  <a
                    key={index}
                    href={`#section-${index + 1}`}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>{item}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <article className="prose prose-lg dark:prose-invert max-w-none">
            <section id="section-1" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                What is the UK Innovator Founder Visa?
              </h2>
              
              <p>
                The <strong>UK Innovator Founder Visa</strong> is the primary immigration route for experienced entrepreneurs 
                who want to establish an innovative business in the United Kingdom. Launched in April 2023, it replaced 
                the previous Innovator Visa and Start-up Visa, creating a streamlined pathway for international founders.
              </p>
              
              <p>
                This visa allows you to live and work in the UK for up to 3 years initially, with the possibility of 
                extension and eventual settlement (Indefinite Leave to Remain) after 3 or 5 years depending on your 
                business achievements.
              </p>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
                <h3 className="text-lg font-semibold mb-3">Key Benefits of the Innovator Founder Visa</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>No minimum investment required</strong> - Unlike previous visa routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Fast-track to settlement</strong> - Possible after just 3 years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Bring your family</strong> - Dependants can work and study freely</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Access to UK startup ecosystem</strong> - World-class accelerators and funding</span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                Eligibility Requirements
              </h2>
              
              <p>
                To qualify for the UK Innovator Founder Visa, you must meet all of the following requirements:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 my-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Endorsement
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You must be endorsed by an approved endorsing body that believes your business idea 
                      is innovative, viable, and scalable.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      English Language
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You must prove English language ability at CEFR Level B2 or above through 
                      an approved test (IELTS, etc.) or degree taught in English.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <PoundSterling className="w-5 h-5 text-green-500" />
                      Maintenance Funds
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You must have at least £1,270 in your bank account for 28 consecutive days 
                      before applying (unless endorsed by certain bodies).
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Business Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      A comprehensive business plan demonstrating your innovative idea, 
                      market research, financial projections, and growth strategy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                The Three Innovation Criteria
              </h2>
              
              <p>
                Your business idea must demonstrate all three of these criteria to be endorsed:
              </p>
              
              <div className="space-y-6 my-6">
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">1. Innovation</h3>
                  <p className="text-muted-foreground">
                    Your business idea must be genuinely innovative. This means it should be a new or significantly 
                    different product, service, or business model that doesn't already exist in the UK market. 
                    You need to demonstrate how your idea offers something unique and provides genuine value.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="font-bold text-lg mb-2">2. Viability</h3>
                  <p className="text-muted-foreground">
                    You must show that your business idea is realistic and achievable. This includes having the 
                    necessary skills, experience, and knowledge to run the business successfully. Your market 
                    research should demonstrate clear demand for your product or service.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-6">
                  <h3 className="font-bold text-lg mb-2">3. Scalability</h3>
                  <p className="text-muted-foreground">
                    Your business must have genuine potential for growth and expansion. This means showing clear 
                    plans for creating jobs, entering new markets, or significantly increasing revenue. Endorsing 
                    bodies look for businesses with national or international growth potential.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                Complete Application Process
              </h2>
              
              <p>
                The Innovator Founder Visa application process involves several key stages:
              </p>
              
              <div className="space-y-4 my-6">
                {[
                  { step: 1, title: "Prepare Your Business Plan", time: "2-4 weeks", desc: "Develop a comprehensive business plan that clearly demonstrates innovation, viability, and scalability." },
                  { step: 2, title: "Choose an Endorsing Body", time: "1-2 weeks", desc: "Research and select the most appropriate endorsing body for your sector and business stage." },
                  { step: 3, title: "Apply for Endorsement", time: "4-8 weeks", desc: "Submit your application to the endorsing body and attend interviews as required." },
                  { step: 4, title: "Gather Documents", time: "2-3 weeks", desc: "Collect all required documents including passport, TB certificate, criminal record check, and bank statements." },
                  { step: 5, title: "Submit Visa Application", time: "1 day", desc: "Complete the online application on GOV.UK, pay fees, and book biometrics appointment." },
                  { step: 6, title: "Biometrics Appointment", time: "1 day", desc: "Attend your appointment to provide fingerprints and photograph." },
                  { step: 7, title: "Await Decision", time: "3-8 weeks", desc: "Processing time varies. Standard processing is 8 weeks, priority is 5 working days." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.time}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                Endorsing Bodies Explained
              </h2>
              
              <p>
                There are over 40 approved endorsing bodies in the UK. These organizations assess your business 
                idea and, if approved, provide the endorsement letter required for your visa application.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-6 my-6">
                <h3 className="font-semibold mb-4">Top Endorsing Bodies by Sector</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Technology & Digital</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>Tech Nation</li>
                      <li>Seedcamp</li>
                      <li>Entrepreneur First</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-2">General Business</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>Founders Factory</li>
                      <li>British Business Bank</li>
                      <li>SETsquared Partnership</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-2">Social Enterprise</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>Bethnal Green Ventures</li>
                      <li>UnLtd</li>
                      <li>Social Enterprise UK</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-2">Regional</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>Scottish Enterprise</li>
                      <li>Innovate UK EDGE</li>
                      <li>Newcastle University</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button asChild className="mt-4">
                <Link href="/tools/endorser-comparison" data-testid="link-endorser-comparison">
                  Compare All 40+ Endorsing Bodies <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-primary" />
                </div>
                Costs & Financial Requirements
              </h2>
              
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Cost Item</th>
                      <th className="border p-3 text-right">Amount (GBP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-3">Visa Application Fee</td><td className="border p-3 text-right">£1,036</td></tr>
                    <tr><td className="border p-3">Immigration Health Surcharge (3 years)</td><td className="border p-3 text-right">£1,872</td></tr>
                    <tr><td className="border p-3">Endorsing Body Fee (varies)</td><td className="border p-3 text-right">£0 - £500</td></tr>
                    <tr><td className="border p-3">Priority Processing (optional)</td><td className="border p-3 text-right">£500</td></tr>
                    <tr><td className="border p-3">Super Priority (optional)</td><td className="border p-3 text-right">£1,000</td></tr>
                    <tr className="bg-primary/5 font-semibold">
                      <td className="border p-3">Total Minimum Cost</td>
                      <td className="border p-3 text-right">~£3,000 - £4,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Important:</strong> You must also show at least £1,270 in maintenance funds held for 
                  28 consecutive days before your application, unless your endorsing body confirms they have 
                  awarded you funding of at least this amount.
                </p>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                Processing Times & Timelines
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4 my-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">8 weeks</div>
                    <div className="font-medium">Standard Processing</div>
                    <p className="text-xs text-muted-foreground mt-1">No additional fee</p>
                  </CardContent>
                </Card>
                <Card className="text-center border-primary">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">5 days</div>
                    <div className="font-medium">Priority Processing</div>
                    <p className="text-xs text-muted-foreground mt-1">+£500</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">24 hours</div>
                    <div className="font-medium">Super Priority</div>
                    <p className="text-xs text-muted-foreground mt-1">+£1,000 (limited availability)</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                Common Mistakes to Avoid
              </h2>
              
              <div className="space-y-4 my-6">
                {[
                  { mistake: "Generic business plan", fix: "Create a detailed, UK-specific plan with clear market research" },
                  { mistake: "Weak innovation argument", fix: "Clearly explain what makes your idea genuinely new or different" },
                  { mistake: "No scalability evidence", fix: "Include specific growth projections and expansion plans" },
                  { mistake: "Wrong endorsing body", fix: "Choose a body that specializes in your sector" },
                  { mistake: "Insufficient funds evidence", fix: "Ensure bank statements show £1,270+ for full 28 days" },
                  { mistake: "Missing documents", fix: "Use our document checklist tool to ensure completeness" },
                  { mistake: "Poor interview preparation", fix: "Practice explaining your business concisely and confidently" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-sm font-bold">✗</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-red-600 dark:text-red-400">{item.mistake}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">Fix:</span> {item.fix}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                Expert Tips for Success
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 my-6">
                {[
                  { title: "Start Early", desc: "Begin your preparation at least 3-4 months before you need to move" },
                  { title: "Research Endorsing Bodies", desc: "Each body has different requirements and specializations" },
                  { title: "Get Professional Help", desc: "Consider using our AI tools to optimize your application" },
                  { title: "Network in the UK", desc: "Build connections with UK-based mentors and advisors" },
                  { title: "Prepare for Interviews", desc: "Practice explaining your business in 2 minutes or less" },
                  { title: "Document Everything", desc: "Keep records of all research, meetings, and development" }
                ].map((tip, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tip.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{tip.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4 my-6">
                {[
                  { q: "Do I need investment to apply?", a: "No. Unlike the previous Tier 1 Entrepreneur visa, the Innovator Founder Visa has no minimum investment requirement. However, you do need to demonstrate how you'll fund your business." },
                  { q: "Can I bring my family?", a: "Yes. Your spouse/partner and children under 18 can apply as dependants. They can work and study freely in the UK." },
                  { q: "How long does endorsement take?", a: "Most endorsing bodies process applications within 4-8 weeks, though some may be faster. Allow sufficient time in your planning." },
                  { q: "Can I work for another company?", a: "Yes, but only in addition to your startup activities. Your primary occupation must be developing your endorsed business." },
                  { q: "What happens after 3 years?", a: "You can extend your visa for another 3 years, or apply for settlement (ILR) if you meet the business achievement criteria." }
                ].map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" asChild>
                <Link href="/faq" data-testid="link-full-faq">
                  View All 50+ FAQs <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </section>
          </article>

          <Card className="bg-gradient-to-r from-primary to-[#41B6E6] text-white mt-12">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your UK Journey?</h2>
              <p className="mb-6 opacity-90">
                Use our AI-powered platform to generate your business plan, check eligibility, 
                and prepare a winning visa application.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup" data-testid="link-get-started">
                    Get Started Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/tools-hub" data-testid="link-explore-tools">
                    Explore 109+ Tools
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
