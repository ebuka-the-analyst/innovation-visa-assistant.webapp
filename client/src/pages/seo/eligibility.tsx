import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  CheckCircle2, XCircle, ArrowRight, Target, 
  PoundSterling, Globe, FileText, Users, Clock,
  AlertTriangle, Lightbulb, Building2
} from "lucide-react";
import { createFAQSchema, createBreadcrumbSchema } from "@/lib/seoSchemas";

const faqSchema = createFAQSchema([
  { question: "What are the main requirements for UK Innovator Founder Visa?", answer: "The main requirements are: an innovative, viable, and scalable business idea endorsed by an approved body, English language proficiency at B2 level, and at least £1,270 in maintenance funds held for 28 days." },
  { question: "Do I need investment for the Innovator Founder Visa?", answer: "No, unlike the previous Tier 1 Entrepreneur visa, the Innovator Founder Visa has no minimum investment requirement. However, you must demonstrate how you will fund your business." },
  { question: "Can I apply from inside the UK?", answer: "Yes, you can switch to the Innovator Founder Visa from most other visa categories while in the UK, subject to meeting the eligibility criteria." },
  { question: "How much does the Innovator Founder Visa cost?", answer: "The visa application fee is £1,036, plus the Immigration Health Surcharge of £624 per year. Total cost for a 3-year visa is approximately £3,000-£4,500 including endorsement fees." }
]);

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Eligibility", url: "/eligibility" }
]);

const eligibilityChecklist = [
  { category: "Business Idea", items: [
    { text: "Innovative idea that is new to the UK market", required: true },
    { text: "Viable business model with evidence of demand", required: true },
    { text: "Scalable with potential for growth", required: true },
    { text: "You have the skills to develop the business", required: true }
  ]},
  { category: "Endorsement", items: [
    { text: "Endorsement from an approved endorsing body", required: true },
    { text: "Endorsement letter within last 3 months", required: true }
  ]},
  { category: "English Language", items: [
    { text: "CEFR Level B2 (IELTS 5.5+ in each component)", required: true },
    { text: "OR degree taught in English from approved institution", required: false },
    { text: "OR national of majority English-speaking country", required: false }
  ]},
  { category: "Financial", items: [
    { text: "£1,270 held in bank for 28 consecutive days", required: true },
    { text: "OR endorsing body confirms equivalent funding", required: false }
  ]},
  { category: "Other", items: [
    { text: "Valid passport or travel document", required: true },
    { text: "TB test (if from listed country)", required: true },
    { text: "Criminal record certificate (some countries)", required: true }
  ]}
];

export default function EligibilityPage() {
  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Eligibility Requirements 2026 | Full Checklist"
        description="Complete guide to UK Innovator Founder Visa eligibility requirements. Check if you qualify with our detailed checklist covering endorsement, English language, financial requirements, and more."
        path="/eligibility"
        keywords="UK Innovator Visa eligibility, visa requirements 2026, Innovator Founder Visa checklist, UK visa requirements, endorsement requirements"
        schemas={[faqSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#005EB8]/10 via-background to-[#41B6E6]/10 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-foreground">Eligibility</span>
            </nav>

            <Badge className="mb-4 bg-primary/10 text-primary">Updated January 2026</Badge>

            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-eligibility">
              UK Innovator Founder Visa Eligibility Requirements
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Complete checklist of requirements you must meet to apply for the UK Innovator Founder Visa. 
              Use our free eligibility checker to assess your qualification.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/tools/eligibility-validator" data-testid="link-check-eligibility">
                  Check Your Eligibility Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/guide/ultimate-uk-innovator-founder-visa-guide" data-testid="link-full-guide">
                  Read Full Guide
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              Quick Eligibility Overview
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    You May Qualify If...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>You have a genuinely innovative business idea</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>You can speak English at B2 level or higher</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>You have £1,270+ in savings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Your business can scale and create UK jobs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="w-5 h-5" />
                    You May Not Qualify If...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Your business idea is not innovative</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>You cannot prove English language ability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>You have serious criminal convictions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>You've breached UK immigration rules before</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Detailed Requirements Checklist
            </h2>

            <div className="space-y-6">
              {eligibilityChecklist.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.required ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex-1">
                            <span>{item.text}</span>
                            {item.required && (
                              <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              The Three Innovation Criteria
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-primary/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Your business must offer something genuinely new or significantly different to the UK market.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Viability</h3>
                  <p className="text-sm text-muted-foreground">
                    You must have the skills and resources to successfully run and develop the business.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Scalability</h3>
                  <p className="text-sm text-muted-foreground">
                    Your business must have realistic plans for job creation and significant growth.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-primary" />
              </div>
              Financial Requirements
            </h2>

            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Maintenance Funds</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>At least £1,270 in personal bank account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Held for 28 consecutive days before application</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Bank statement dated within 31 days of application</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Exemptions</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Endorsing body confirms funding of £1,270+</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Already in UK for 12+ months with valid permission</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              English Language Requirements
            </h2>

            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">You must prove English language ability at CEFR Level B2 through one of these methods:</p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Option 1: Approved English Test</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      IELTS for UKVI (or equivalent) with minimum 5.5 in each component (reading, writing, speaking, listening)
                    </p>
                    <Badge variant="outline">Most Common</Badge>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Option 2: Degree in English</h3>
                    <p className="text-sm text-muted-foreground">
                      Bachelor's degree or higher taught in English from an approved institution (UK ENIC verification may be required)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Option 3: Majority English-Speaking Country</h3>
                    <p className="text-sm text-muted-foreground">
                      National of Antigua and Barbuda, Australia, The Bahamas, Barbados, Belize, Canada, Dominica, Grenada, Guyana, Ireland, Jamaica, Malta, New Zealand, St Kitts and Nevis, St Lucia, St Vincent and the Grenadines, Trinidad and Tobago, UK, USA
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="bg-gradient-to-r from-primary to-[#41B6E6] text-white mb-8">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Check Your Eligibility Now</h2>
              <p className="mb-6 opacity-90">
                Use our free AI-powered eligibility assessment tool to see if you qualify for the UK Innovator Founder Visa.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/tools/eligibility-validator" data-testid="link-eligibility-tool">
                  Start Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "What are the main requirements for UK Innovator Founder Visa?", a: "The main requirements are: an innovative, viable, and scalable business idea endorsed by an approved body, English language proficiency at B2 level, and at least £1,270 in maintenance funds held for 28 days." },
                { q: "Do I need investment for the Innovator Founder Visa?", a: "No, unlike the previous Tier 1 Entrepreneur visa, the Innovator Founder Visa has no minimum investment requirement. However, you must demonstrate how you will fund your business." },
                { q: "Can I apply from inside the UK?", a: "Yes, you can switch to the Innovator Founder Visa from most other visa categories while in the UK, subject to meeting the eligibility criteria." },
                { q: "How much does the Innovator Founder Visa cost?", a: "The visa application fee is £1,036, plus the Immigration Health Surcharge of £624 per year. Total cost for a 3-year visa is approximately £3,000-£4,500 including endorsement fees." }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
