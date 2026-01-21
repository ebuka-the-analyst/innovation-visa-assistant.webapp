import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  FileText, CheckCircle2, ArrowRight, Download,
  Lightbulb, Target, TrendingUp, Users, PoundSterling,
  BarChart3, Building2, Shield, Rocket, Star
} from "lucide-react";
import { createHowToSchema, createBreadcrumbSchema, createProductSchema } from "@/lib/seoSchemas";

const howToSchema = createHowToSchema(
  "How to Write a UK Innovator Founder Visa Business Plan",
  "Step-by-step guide to creating a successful business plan for UK Innovator Founder Visa endorsement",
  [
    { name: "Executive Summary", text: "Write a compelling 1-page summary of your business idea, highlighting innovation, market opportunity, and growth potential." },
    { name: "Problem & Solution", text: "Clearly define the problem you're solving and how your solution is genuinely innovative and different from existing alternatives." },
    { name: "Market Analysis", text: "Provide detailed UK market research including size, trends, target customers, and competitive landscape." },
    { name: "Business Model", text: "Explain how your business will make money, including revenue streams, pricing strategy, and unit economics." },
    { name: "Team & Experience", text: "Showcase your skills, experience, and why you're the right person to build this business." },
    { name: "Financial Projections", text: "Include 3-5 year projections showing revenue, costs, and path to profitability with realistic assumptions." },
    { name: "Growth Strategy", text: "Outline your plan for scaling the business, creating UK jobs, and expanding into new markets." },
    { name: "Milestones & Timeline", text: "Define specific, measurable milestones for the first 1-3 years with clear timelines." }
  ]
);

const productSchema = createProductSchema(
  "UK Innovator Founder Visa Business Plan Generator",
  "AI-powered business plan generator specifically designed for UK Innovator Founder Visa applications",
  "29"
);

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Business Plan Template", url: "/business-plan-template" }
]);

const sections = [
  { icon: FileText, title: "Executive Summary", desc: "1-page overview of your entire business proposition", tips: ["Keep it under 500 words", "Write this last", "Highlight unique selling points"] },
  { icon: Lightbulb, title: "Problem & Innovation", desc: "The problem you're solving and your innovative solution", tips: ["Be specific about the pain point", "Explain why existing solutions fail", "Show genuine innovation"] },
  { icon: Target, title: "Market Analysis", desc: "Your target market, size, and competitive landscape", tips: ["Use UK-specific data", "Identify your ideal customer", "Show market growth potential"] },
  { icon: Building2, title: "Business Model", desc: "How you'll make money and your revenue streams", tips: ["Multiple revenue streams preferred", "Show path to profitability", "Include pricing strategy"] },
  { icon: Users, title: "Team & Experience", desc: "Your background and why you'll succeed", tips: ["Highlight relevant experience", "Show sector expertise", "Mention advisors/mentors"] },
  { icon: PoundSterling, title: "Financial Projections", desc: "3-5 year financial forecasts with assumptions", tips: ["Be realistic", "Show awareness of costs", "Include best/worst scenarios"] },
  { icon: TrendingUp, title: "Growth Strategy", desc: "Plans for scaling and creating UK jobs", tips: ["Specific job creation targets", "International expansion plans", "Partnership opportunities"] },
  { icon: BarChart3, title: "Milestones", desc: "Key targets for the first 1-3 years", tips: ["SMART goals", "Quarterly milestones", "Measurable KPIs"] }
];

export default function BusinessPlanTemplatePage() {
  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Business Plan Template 2026 | Free Guide & Generator"
        description="Free business plan template and guide for UK Innovator Founder Visa. Learn what endorsing bodies look for, see examples, and use our AI generator to create your plan."
        path="/business-plan-template"
        keywords="UK Innovator Visa business plan, visa business plan template, endorsement business plan, UK startup visa plan, Innovator Founder business plan example"
        schemas={[howToSchema, productSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#005EB8]/10 via-background to-[#41B6E6]/10 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-foreground">Business Plan Template</span>
            </nav>

            <Badge className="mb-4 bg-primary/10 text-primary">Free Template + AI Generator</Badge>

            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-business-plan">
              UK Innovator Founder Visa Business Plan Template
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              The complete guide to writing a business plan that gets endorsed. Includes template structure, 
              examples, and our AI-powered generator that creates professional plans in minutes.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/questionnaire" data-testid="link-generate-plan">
                  Generate Your Plan with AI <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#template" data-testid="link-view-template">
                  View Template Structure
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Your Business Plan Matters</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Your business plan is the most critical document in your Innovator Founder Visa application. 
                It's how endorsing bodies assess whether your idea meets the <strong>innovation, viability, 
                and scalability</strong> criteria required for endorsement.
              </p>
              <p>
                A weak business plan is the #1 reason for endorsement rejection. Even brilliant ideas fail 
                to get endorsed when poorly presented. That's why we've created this comprehensive template 
                and AI generator to help you present your business in the best possible light.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Endorsement Success Rate</div>
                  <div className="text-xs text-muted-foreground mt-1">with our template</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
                  <div className="text-sm text-muted-foreground">Plans Generated</div>
                  <div className="text-xs text-muted-foreground mt-1">using our AI</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">15 min</div>
                  <div className="text-sm text-muted-foreground">Average Generation Time</div>
                  <div className="text-xs text-muted-foreground mt-1">vs 2-4 weeks manually</div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="template" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Business Plan Template Structure
            </h2>

            <div className="space-y-4">
              {sections.map((section, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <section.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{index + 1}. {section.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-3">{section.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {section.tips.map((tip, tipIndex) => (
                            <Badge key={tipIndex} variant="outline" className="text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {tip}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              What Endorsing Bodies Look For
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Innovation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Genuinely new to UK market</li>
                    <li>• Different from existing solutions</li>
                    <li>• Uses technology innovatively</li>
                    <li>• Addresses real market gap</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-green-500" />
                    Viability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Clear revenue model</li>
                    <li>• Realistic financial projections</li>
                    <li>• Founder has relevant skills</li>
                    <li>• Evidence of market demand</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Scalability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Potential for significant growth</li>
                    <li>• Plan to create UK jobs</li>
                    <li>• International expansion potential</li>
                    <li>• Clear growth milestones</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              Common Business Plan Mistakes
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { mistake: "Generic templates", fix: "Customize for UK Innovator Visa requirements" },
                { mistake: "Unrealistic projections", fix: "Base on market research and comparable businesses" },
                { mistake: "Weak innovation claim", fix: "Clearly articulate what makes you different" },
                { mistake: "No UK market focus", fix: "Show specific UK market research and opportunity" },
                { mistake: "Missing job creation plans", fix: "Include specific hiring timeline and roles" },
                { mistake: "Vague milestones", fix: "Set SMART goals with measurable KPIs" }
              ].map((item, index) => (
                <Card key={index} className="border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-500 text-sm">✗</span>
                      </div>
                      <div>
                        <div className="font-medium text-red-600 dark:text-red-400">{item.mistake}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="text-green-600 dark:text-green-400">Fix:</span> {item.fix}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              AI Business Plan Generator
            </h2>

            <Card className="bg-gradient-to-br from-primary/5 to-[#41B6E6]/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge className="mb-4 bg-amber-500/10 text-amber-600">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                    <h3 className="text-xl font-bold mb-3">Generate Your Business Plan in Minutes</h3>
                    <p className="text-muted-foreground mb-4">
                      Our AI-powered generator creates comprehensive, endorsement-ready business plans 
                      tailored specifically for UK Innovator Founder Visa applications.
                    </p>
                    <ul className="space-y-2 mb-6">
                      {[
                        "Customized for your specific business",
                        "Covers all required sections",
                        "Financial projections included",
                        "Export to PDF or Word",
                        "Edit and refine as needed"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" asChild>
                      <Link href="/questionnaire" data-testid="link-start-generator">
                        Start Generating <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <div className="bg-background rounded-lg border p-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Your Business Plan</span>
                      </div>
                      <div className="space-y-2">
                        {["Executive Summary", "Problem & Solution", "Market Analysis", "Business Model", "Financial Projections"].map((section, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>{section}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="bg-gradient-to-r from-primary to-[#41B6E6] text-white">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Create Your Business Plan?</h2>
              <p className="mb-6 opacity-90">
                Join 1,200+ entrepreneurs who have successfully created their business plans with our platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/questionnaire" data-testid="link-create-plan">
                    Create My Business Plan <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/pricing" data-testid="link-view-pricing">
                    View Pricing
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
