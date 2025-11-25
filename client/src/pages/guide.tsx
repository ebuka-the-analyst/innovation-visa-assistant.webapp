import { SEOHead } from "@/components/SEOHead";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BookOpen, CheckCircle2, AlertCircle, TrendingUp, Users, 
  FileText, DollarSign, Calendar, Target, Award, ArrowRight,
  Lightbulb, Shield, Briefcase, GraduationCap
} from "lucide-react";
import { createArticleSchema, createBreadcrumbSchema } from "@/lib/seo-schemas";

const sections = [
  { id: "overview", title: "Visa Overview", icon: BookOpen },
  { id: "requirements", title: "Key Requirements", icon: CheckCircle2 },
  { id: "endorsement", title: "Endorsement Process", icon: Award },
  { id: "innovation", title: "Innovation Criteria", icon: Lightbulb },
  { id: "viability", title: "Viability Assessment", icon: TrendingUp },
  { id: "scalability", title: "Scalability Planning", icon: Users },
  { id: "financial", title: "Financial Requirements", icon: DollarSign },
  { id: "timeline", title: "Application Timeline", icon: Calendar },
  { id: "settlement", title: "Path to Settlement", icon: Shield },
  { id: "tips", title: "Success Tips", icon: Target }
];

export default function Guide() {
  const breadcrumbItems = [
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Complete Guide 2025", url: "https://innovatorfoundervisaassistant.co.uk/guide" }
  ];

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Complete Guide 2025 | Requirements, Process & Timeline"
        description="Comprehensive PhD-level guide to the UK Innovator Founder Visa. Learn requirements, endorsement process, innovation criteria, financial planning, and path to settlement. Updated for 2025."
        path="/guide"
        keywords="UK Innovator Founder Visa 2025, innovator visa guide, UK visa requirements, endorsement process, settlement pathway, visa application timeline"
        ogType="article"
        schemas={[
          createArticleSchema(
            "UK Innovator Founder Visa Complete Guide 2025",
            "Comprehensive guide covering all aspects of the UK Innovator Founder Visa application process, requirements, and success strategies.",
            "2025-01-01"
          ),
          createBreadcrumbSchema(breadcrumbItems)
        ]}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <GraduationCap className="w-20 h-20 mx-auto mb-6 text-primary" />
              <h1 className="text-5xl font-bold mb-6">
                UK Innovator Founder Visa
                <span className="block text-primary mt-2">Complete Guide 2025</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The definitive, PhD-level resource for understanding and successfully navigating the UK Innovator Founder Visa application process. Everything you need to know about requirements, endorsement, innovation assessment, and settlement.
              </p>
              <div className="mt-8 flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" data-testid="button-get-started">
                    Start Your Application
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/tools-hub">
                  <Button size="lg" variant="outline" data-testid="button-view-tools">
                    View 109 Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <a
                      key={idx}
                      href={`#${section.id}`}
                      className="flex items-center gap-3 p-3 rounded-md hover-elevate active-elevate-2 border"
                      data-testid={`link-toc-${section.id}`}
                    >
                      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{section.title}</span>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 pb-16 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section 1: Overview */}
          <section id="overview">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              What is the UK Innovator Founder Visa?
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  The <strong>UK Innovator Founder Visa</strong> is a immigration route designed for experienced entrepreneurs who want to establish an innovative, viable, and scalable business in the United Kingdom. Launched in April 2023 as a replacement for the previous Innovator visa, it offers a streamlined pathway to UK residency and eventual settlement (Indefinite Leave to Remain) for founders with genuinely transformative business ideas.
                </p>
                <p>
                  Unlike employment-based visas, the Innovator Founder route recognizes that entrepreneurship drives economic growth. It attracts global talent by offering successful applicants the ability to build businesses in one of the world's leading economies, with access to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>World-class infrastructure:</strong> Advanced financial services, legal frameworks, and business support systems</li>
                  <li><strong>Access to capital:</strong> Active venture capital ecosystem with £13.5B+ invested in UK startups annually</li>
                  <li><strong>Talent pool:</strong> Highly skilled workforce from top universities including Oxford, Cambridge, and Imperial College London</li>
                  <li><strong>Market access:</strong> Gateway to European markets and established trade relationships with 70+ countries</li>
                  <li><strong>Regulatory environment:</strong> Business-friendly policies with clear intellectual property protection</li>
                </ul>
                <p>
                  The visa is initially granted for <strong>3 years</strong> and can be extended indefinitely in 3-year increments. Most importantly, it provides a clear <strong>path to settlement after just 3 years</strong> if you meet specific business milestones—significantly faster than most other visa categories which typically require 5 years.
                </p>
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Critical Update for 2025
                  </p>
                  <p className="mt-2">
                    As of 2025, the UK Home Office has streamlined the endorsement process with clearer innovation criteria and faster processing times. Success rates for well-prepared applications with strong endorsing body support now exceed 75%, compared to 60% in 2023.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Requirements */}
          <section id="requirements">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              Key Requirements at a Glance
            </h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    1. Endorsement from Approved Body
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Your business idea must be endorsed by a Home Office-approved endorsing body. These organizations assess whether your business meets the three core criteria: <strong>Innovation, Viability, and Scalability</strong>. Endorsing bodies include Tech Nation, Innovator International, The Global Entrepreneurs Programme, and select universities.
                  </p>
                  <p className="font-semibold">What they evaluate:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Genuine innovation and market differentiation</li>
                    <li>Realistic business model with clear path to profitability</li>
                    <li>Potential for significant growth and job creation</li>
                    <li>Your skills, experience, and ability to execute</li>
                    <li>Market demand and competitive landscape analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    2. Business Funding (No Fixed Minimum)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Important Update (April 2023):</strong> The Innovator Founder Visa has <strong>NO fixed minimum investment requirement</strong>. Unlike the previous Innovator visa which required £50,000, you now only need to demonstrate sufficient funds to establish and operate your business as outlined in your business plan.
                  </p>
                  <p><strong>Acceptable funding sources:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Personal savings held for 28+ consecutive days</li>
                    <li>Third-party investment (venture capital, angel investors)</li>
                    <li>UK government grants and innovation funding</li>
                    <li>Peer-to-peer lending platforms</li>
                    <li>Corporate investment or strategic partnerships</li>
                  </ul>
                  <p className="italic bg-accent/20 p-3 rounded">
                    <strong>Practical guidance:</strong> While there's no fixed minimum, most endorsing bodies expect £50,000-£100,000 for credible business development and viability. Funds must be held in a regulated financial institution, be freely transferable to the UK, and you must provide evidence of the source. The endorsing body will assess whether your funding is realistic for your specific business plan.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    3. English Language Proficiency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    You must demonstrate English language ability at <strong>CEFR Level B2</strong> (upper intermediate) or above in reading, writing, speaking, and listening.
                  </p>
                  <p><strong>Ways to prove English proficiency:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Pass an approved English language test (IELTS, PTE Academic, etc.)</li>
                    <li>Hold a degree taught in English from a recognized university</li>
                    <li>Be a national of a majority English-speaking country</li>
                  </ul>
                  <p>
                    If you previously demonstrated English language ability for a UK visa application, you typically don't need to prove it again.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    4. Maintenance Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    You must show you have <strong>£1,270</strong> in personal savings, held for 28 consecutive days before your application. This demonstrates you can support yourself when you arrive in the UK without relying on public funds.
                  </p>
                  <p>
                    This is separate from your business investment funds. If you've been in the UK with valid leave for 12+ months, this requirement is waived.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3: Endorsement Process */}
          <section id="endorsement">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              Understanding the Endorsement Process
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg font-semibold">
                  Securing endorsement is the most critical—and often most challenging—part of the Innovator Founder Visa application. Here's what you need to know:
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Step 1: Choose Your Endorsing Body</h3>
                    <p>Not all endorsing bodies are created equal. Each has specific focus areas, success rates, and support offerings:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li><strong>Tech Nation:</strong> Best for digital technology and software businesses. Offers extensive mentorship network.</li>
                      <li><strong>Innovator International:</strong> Broad sector coverage with strong track record (70%+ success rate).</li>
                      <li><strong>The Global Entrepreneurs Programme:</strong> Focus on high-growth startups with international expansion plans.</li>
                      <li><strong>University-based bodies:</strong> Often require connection to the institution (alumni, research collaboration).</li>
                    </ul>
                    <p className="mt-3 bg-primary/10 p-3 rounded">
                      <strong>Pro tip:</strong> Choose based on sector expertise, not just application fees. A body with experience in your industry provides better feedback and higher approval chances.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Step 2: Prepare Your Application Package</h3>
                    <p>A comprehensive endorsement application typically includes:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li><strong>Executive Summary:</strong> 2-page overview of your business, innovation, and growth potential</li>
                      <li><strong>Detailed Business Plan:</strong> 20-40 pages covering market analysis, business model, financial projections, team, and execution timeline</li>
                      <li><strong>Market Research:</strong> Evidence of customer demand, competitor analysis, and market size data</li>
                      <li><strong>Financial Projections:</strong> 3-5 year forecasts with clear assumptions and scenario planning</li>
                      <li><strong>Innovation Evidence:</strong> Patents, prototypes, pilot results, customer testimonials, or expert validation</li>
                      <li><strong>Founder CV:</strong> Highlighting relevant experience, skills, and track record</li>
                      <li><strong>Funding Evidence:</strong> Bank statements, investment agreements, or grant confirmations</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Step 3: Assessment Interview</h3>
                    <p>
                      Most endorsing bodies conduct a formal interview (30-90 minutes) where you present your business and answer detailed questions about:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Your understanding of the UK market</li>
                      <li>How your innovation solves real customer problems</li>
                      <li>Your go-to-market strategy and customer acquisition plan</li>
                      <li>Financial sustainability and path to profitability</li>
                      <li>Scalability plans and job creation potential</li>
                      <li>Risk mitigation strategies</li>
                    </ul>
                    <p className="mt-3 italic">
                      This is not a formality—assessors are looking for deep knowledge, realistic planning, and your ability to execute. Practice extensively before the interview.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Timeline & Costs</h3>
                    <p><strong>Typical endorsement timeline:</strong></p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Application preparation: 4-8 weeks</li>
                      <li>Submission to interview: 2-4 weeks</li>
                      <li>Interview to decision: 2-4 weeks</li>
                      <li><strong>Total: 8-16 weeks on average</strong></li>
                    </ul>
                    <p className="mt-3"><strong>Costs:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Endorsement application fee: £1,000 - £3,000 (varies by body)</li>
                      <li>Business plan preparation (if hiring consultants): £2,000 - £8,000</li>
                      <li>Legal fees (optional but recommended): £2,000 - £5,000</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sections 4-6: Innovation, Viability, Scalability */}
          <section id="innovation">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-primary" />
              Innovation: What Makes Your Business Innovative?
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  Innovation is NOT about creating something completely new to the world. The Home Office and endorsing bodies define innovation as having a <strong>genuine point of difference</strong> from existing UK market solutions.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Types of Recognized Innovation:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Technological Innovation:</strong> Novel use of technology, new algorithms, or proprietary software</li>
                      <li><strong>Business Model Innovation:</strong> Unique revenue model, distribution approach, or value proposition</li>
                      <li><strong>Process Innovation:</strong> Innovative methodology for delivering products/services more efficiently</li>
                      <li><strong>Market Innovation:</strong> Bringing proven solutions to underserved markets or customer segments</li>
                      <li><strong>Application Innovation:</strong> New application of existing technology to solve different problems</li>
                    </ul>
                  </div>

                  <div className="bg-accent/20 p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">How to Demonstrate Innovation:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Intellectual Property:</strong> Patents (pending or granted), trademarks, copyrights, or trade secrets</li>
                      <li><strong>Competitive Analysis:</strong> Detailed comparison showing your unique differentiators vs. competitors</li>
                      <li><strong>Customer Validation:</strong> Letters of intent, pilot results, or testimonials from target customers</li>
                      <li><strong>Expert Testimonials:</strong> Endorsements from industry experts, academic researchers, or advisors</li>
                      <li><strong>Technical Documentation:</strong> Prototypes, demos, technical specifications, or architecture diagrams</li>
                      <li><strong>Market Research:</strong> Data proving your approach fills a genuine market gap</li>
                      <li><strong>Awards/Recognition:</strong> Startup competitions, grants, or industry accolades</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-primary bg-primary/10 p-4 rounded">
                    <p className="font-bold">Common Innovation Mistakes to Avoid:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Claiming innovation without evidence or clear differentiation</li>
                      <li>Using buzzwords ("AI-powered," "blockchain-based") without substance</li>
                      <li>Ignoring existing competitors or claiming no competition exists</li>
                      <li>Focusing only on features instead of customer value and outcomes</li>
                      <li>Underestimating the challenge of market adoption</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="viability">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Viability: Proving Your Business Can Succeed
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  Viability assessment focuses on whether your business has <strong>realistic potential for success</strong> based on market conditions, your experience, and financial sustainability.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Key Viability Elements:</h3>
                    <div className="grid gap-4">
                      <div>
                        <p className="font-semibold">1. Market Understanding</p>
                        <ul className="list-disc pl-6 space-y-1 mt-1">
                          <li>Clear identification of target customer segments</li>
                          <li>Quantified market size and growth potential (TAM, SAM, SOM)</li>
                          <li>Evidence of customer pain points and willingness to pay</li>
                          <li>Understanding of regulatory requirements and barriers</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-semibold">2. Realistic Financial Projections</p>
                        <ul className="list-disc pl-6 space-y-1 mt-1">
                          <li>Conservative revenue forecasts backed by assumptions</li>
                          <li>Detailed cost breakdown (COGS, OpEx, CapEx)</li>
                          <li>Clear path to profitability within 3-5 years</li>
                          <li>Cash flow analysis showing runway and funding needs</li>
                          <li>Break-even analysis and key financial metrics</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">3. Founder/Team Capability</p>
                        <ul className="list-disc pl-6 space-y-1 mt-1">
                          <li>Relevant industry experience and domain expertise</li>
                          <li>Track record of building or scaling businesses</li>
                          <li>Technical skills needed for product development</li>
                          <li>Network and relationships in target market</li>
                          <li>Complementary co-founders or advisors (if applicable)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">4. Go-to-Market Strategy</p>
                        <ul className="list-disc pl-6 space-y-1 mt-1">
                          <li>Customer acquisition channels with cost estimates</li>
                          <li>Marketing and sales strategy aligned with budget</li>
                          <li>Partnership opportunities and distribution channels</li>
                          <li>Product development and launch timeline</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded">
                    <p className="font-bold mb-2">Red Flags That Hurt Viability:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Overly optimistic revenue projections (hockey stick growth)</li>
                      <li>Underestimated costs or missing expense categories</li>
                      <li>No clear customer acquisition strategy</li>
                      <li>Founder lacks relevant experience for the business</li>
                      <li>Business depends on unproven assumptions</li>
                      <li>No consideration of competition or market risks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="scalability">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Scalability: Demonstrating Growth Potential
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  The UK government wants to attract businesses that will <strong>create jobs and contribute to the economy</strong>. Scalability means showing how your business can grow significantly without proportional cost increases.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">What Endorsing Bodies Look For:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Job Creation Plans:</strong> Realistic hiring timeline with specific roles (minimum 2-5 jobs in year 1, 10+ by year 3)</li>
                      <li><strong>Revenue Growth Trajectory:</strong> Clear path to £1M+ revenue within 3-5 years</li>
                      <li><strong>Market Expansion Strategy:</strong> Plans to serve multiple customer segments or geographic markets</li>
                      <li><strong>Scalable Business Model:</strong> Ability to grow revenue faster than costs (improving unit economics)</li>
                      <li><strong>Technology Leverage:</strong> Use of technology/automation to scale operations efficiently</li>
                    </ul>
                  </div>

                  <div className="bg-accent/20 p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">Examples of Scalable Business Models:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>SaaS (Software as a Service):</strong> Recurring revenue with low marginal cost per customer</li>
                      <li><strong>Marketplace Platforms:</strong> Network effects drive exponential growth</li>
                      <li><strong>Technology-enabled Services:</strong> Automation reduces cost of service delivery</li>
                      <li><strong>Manufacturing with IP:</strong> Proprietary technology creates barriers to competition</li>
                      <li><strong>Franchising/Licensing:</strong> Growth through partnerships without capital intensity</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-2">Settlement Criteria Related to Scalability</h3>
                    <p>
                      When applying for Indefinite Leave to Remain (ILR) after 3 years, you must meet at least 2 of 7 criteria. The most commonly achieved are:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li><strong>Job Creation:</strong> Created 10+ full-time jobs for settled workers, OR 5+ jobs averaging £25,000+ salary</li>
                      <li><strong>Customer Growth:</strong> Customer base has at least doubled in last 3 years (minimum 10 customers)</li>
                      <li><strong>Revenue Milestone:</strong> Generated £1M+ revenue in last year, OR £500k+ with 100k+ exports</li>
                      <li><strong>Investment:</strong> £50,000+ invested and business actively trading with sustainable growth</li>
                    </ul>
                    <p className="mt-3 italic">
                      Plan your growth strategy with these criteria in mind from day one. Track metrics quarterly to ensure you're on track for settlement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Remaining sections 7-10 */}
          <section id="financial">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              Financial Requirements & Planning
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">Complete cost breakdown and financial planning guidance for your Innovator Founder Visa application.</p>
                
                <div className="grid gap-4">
                  <div className="bg-primary/10 p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">Visa & Administrative Costs:</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between"><span>Visa application fee (outside UK):</span><strong>£1,191</strong></li>
                      <li className="flex justify-between"><span>Visa application fee (inside UK):</span><strong>£1,486</strong></li>
                      <li className="flex justify-between"><span>Immigration Health Surcharge (3 years):</span><strong>£3,105</strong></li>
                      <li className="flex justify-between"><span>Endorsement body fee:</span><strong>£1,000 - £3,000</strong></li>
                      <li className="flex justify-between"><span>Business investment funds:</span><strong>No fixed minimum*</strong></li>
                      <li className="flex justify-between"><span>Maintenance funds:</span><strong>£1,270</strong></li>
                      <li className="flex justify-between"><span>Legal/consulting fees (optional):</span><strong>£4,000 - £13,000</strong></li>
                      <li className="border-t-2 border-primary pt-2 mt-2 flex justify-between text-lg">
                        <span className="font-bold">Estimated Admin Total:</span>
                        <strong>£7,000 - £21,000</strong>
                      </li>
                    </ul>
                    <p className="text-sm mt-2 italic">*Business funding assessed by endorsing body based on your specific business plan. Most expect £50,000-£100,000 for credibility.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-2">Ongoing Costs in UK:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Company formation and registration: £12-£100</li>
                      <li>Business bank account setup: £0-£30/month</li>
                      <li>Accounting services: £100-£300/month</li>
                      <li>Office space or coworking: £200-£800/month (outside London)</li>
                      <li>Business insurance: £500-£2,000/year</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="timeline">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Complete Application Timeline
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-bold">Phase 1: Preparation (4-12 weeks)</h4>
                    <p className="text-muted-foreground">Business plan development, market research, financial projections, gather evidence</p>
                  </div>
                  <div className="border-l-4 border-accent pl-4 py-2">
                    <h4 className="font-bold">Phase 2: Endorsement Application (8-16 weeks)</h4>
                    <p className="text-muted-foreground">Submit to endorsing body, interview preparation, endorsement decision</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-bold">Phase 3: Visa Application (3-8 weeks)</h4>
                    <p className="text-muted-foreground">Complete visa application, biometrics, document submission, decision</p>
                  </div>
                  <div className="border-l-4 border-accent pl-4 py-2">
                    <h4 className="font-bold">Phase 4: Arrival & Setup (4-8 weeks)</h4>
                    <p className="text-muted-foreground">Company registration, bank account, hire staff, begin operations</p>
                  </div>
                  <p className="text-lg font-bold text-center mt-6 bg-primary/10 p-4 rounded">
                    Total Timeline: 19-44 weeks (5-11 months)
                  </p>
                  <p className="text-center text-muted-foreground italic">
                    Plan for 6-9 months from start to UK arrival. Use priority services to reduce visa processing time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="settlement">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Path to Settlement (ILR)
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  One of the most attractive features of the Innovator Founder Visa is the fast track to permanent residency (Indefinite Leave to Remain - ILR) in just <strong>3 years</strong>, compared to 5 years for most other visa routes.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">ILR Requirements (Must meet at least 2 of 7 criteria):</h3>
                  <div className="grid gap-3">
                    <div className="border p-3 rounded">
                      <p className="font-semibold">1. Investment & Trading</p>
                      <p className="text-sm">At least £50,000 invested in business and actively trading</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="font-semibold">2. Customer Growth</p>
                      <p className="text-sm">Customers doubled in 3 years and have at least 10 customers</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="font-semibold">3. Research & Development</p>
                      <p className="text-sm">Engaged in significant R&D in the UK</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="font-semibold">4. Revenue Milestone</p>
                      <p className="text-sm">£1M+ annual revenue</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="font-semibold">5. Export Revenue</p>
                      <p className="text-sm">£500k+ revenue with £100k+ from exports</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="font-semibold">6. Job Creation (Option A)</p>
                      <p className="text-sm">Created 10+ full-time UK jobs for settled workers</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="font-semibold">7. Job Creation (Option B)</p>
                      <p className="text-sm">Created 5+ jobs with average £25,000+ salary</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="tips">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              PhD-Level Success Tips
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <div className="grid gap-4">
                  <div className="bg-primary/10 p-4 rounded">
                    <h3 className="font-bold mb-2">✅ Do:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Start preparing 6-12 months before your target application date</li>
                      <li>Choose endorsing body based on sector expertise, not just cost</li>
                      <li>Get professional help with business plan if lacking experience</li>
                      <li>Practice your pitch extensively before endorsement interview</li>
                      <li>Provide conservative, well-researched financial projections</li>
                      <li>Document everything: customer validation, market research, IP</li>
                      <li>Network with other Innovator Founder visa holders for insights</li>
                    </ul>
                  </div>
                  <div className="bg-destructive/10 p-4 rounded">
                    <h3 className="font-bold mb-2">❌ Don't:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Rush the application without thorough preparation</li>
                      <li>Claim innovation without concrete evidence</li>
                      <li>Underestimate competition or market challenges</li>
                      <li>Present unrealistic financial projections</li>
                      <li>Ignore endorsing body feedback or questions</li>
                      <li>Apply with insufficient funding or unclear source of funds</li>
                      <li>Neglect contingency planning and risk mitigation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-accent/20 p-6 rounded mt-6">
                  <h3 className="text-2xl font-bold mb-4 text-center">Ready to Start Your Journey?</h3>
                  <p className="text-center mb-4">
                    Access our 109 PhD-level tools designed specifically for UK Innovator Founder Visa applicants.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/signup">
                      <Button size="lg" data-testid="button-cta-signup">
                        Create Free Account
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" variant="outline" data-testid="button-cta-pricing">
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
