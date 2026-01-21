import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Building2, CheckCircle2, ExternalLink, ArrowRight,
  AlertTriangle, Globe, Star, PoundSterling, Calendar,
  Users, Clock, Info
} from "lucide-react";
import { createBreadcrumbSchema, endorsingBodiesListSchema } from "@/lib/seoSchemas";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Endorsing Bodies", url: "/endorsing-bodies" }
]);

const activeEndorsingBodies = [
  { 
    name: "Envestors Limited", 
    type: "Active",
    location: "London", 
    website: "envestors-visa-endorsement.co.uk", 
    featured: true, 
    description: "Official endorsing body for innovative businesses seeking UK Innovator Founder Visa endorsement. Comprehensive assessment and support services.",
    sectors: ["All Sectors"],
    cost: "£1,000"
  },
  { 
    name: "UK Endorsing Services", 
    type: "Active",
    location: "UK-wide", 
    website: "ukendorsingservices.co.uk", 
    featured: true, 
    description: "Active endorsing body providing visa endorsement services for international entrepreneurs with innovative business ideas.",
    sectors: ["All Sectors"],
    cost: "£1,000"
  },
  { 
    name: "Innovator International", 
    type: "Active",
    location: "London", 
    website: "innovatorinternational.com", 
    featured: true, 
    description: "Supporting international entrepreneurs since 2019. Over 700+ entrepreneurs endorsed successfully. Specialist in guiding founders through the endorsement process.",
    sectors: ["All Sectors"],
    cost: "£1,000"
  },
  { 
    name: "Global Entrepreneurs Programme (GEP)", 
    type: "Government",
    location: "National", 
    website: "great.gov.uk/international/invest/contact/", 
    featured: true, 
    description: "Government-run programme by the Department for Business and Trade. Invitation-only for exceptional tech entrepreneurs with high-growth potential businesses.",
    sectors: ["Technology", "High-Growth"],
    cost: "Free (invitation only)",
    invitationOnly: true
  },
];

const legacyEndorsingBodies = [
  { name: "Tech Nation", sector: "Technology", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Seedcamp", sector: "Technology", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Entrepreneur First", sector: "Technology", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Founders Factory", sector: "General", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Bethnal Green Ventures", sector: "Social Impact", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "SETsquared Partnership", sector: "University", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Imperial College London", sector: "University", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Cambridge Enterprise", sector: "University", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "University of Manchester", sector: "University", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
  { name: "Level39", sector: "Fintech", description: "Legacy endorsing body - can only support founders endorsed before April 2023" },
];

export default function EndorsingBodiesPage() {
  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Endorsing Bodies 2026 | Official List"
        description="Complete list of approved endorsing bodies for UK Innovator Founder Visa in 2026. Only 4 active endorsing bodies can issue new endorsements: Envestors, UK Endorsing Services, Innovator International, and GEP."
        path="/endorsing-bodies"
        keywords="UK endorsing bodies 2026, Innovator Visa endorsement, Envestors endorsement, Innovator International, UK visa endorsing bodies list, startup visa endorsement"
        schemas={[endorsingBodiesListSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#005EB8]/10 via-background to-[#41B6E6]/10 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-foreground">Endorsing Bodies</span>
            </nav>

            <Badge className="mb-4 bg-primary/10 text-primary">Updated January 2026</Badge>

            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-endorsing-bodies">
              UK Innovator Founder Visa Endorsing Bodies
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              As of 2026, there are only <strong>4 active endorsing bodies</strong> approved by the UK Home Office 
              to issue new endorsements for the Innovator Founder Visa. Find the right organization for your application.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/tools/endorser-comparison" data-testid="link-compare-tool">
                  Compare Endorsing Bodies <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/questionnaire" data-testid="link-start-plan">
                  Generate Business Plan
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Important: Endorsing Bodies Changed in April 2023</h3>
                  <p className="text-muted-foreground">
                    Since 13 April 2023, most previous endorsing bodies (including Tech Nation, Seedcamp, and university-based bodies) 
                    became <strong>"Legacy Endorsing Bodies"</strong> and can <strong>only</strong> continue supporting founders 
                    they endorsed under the old Innovator or Start-up visa routes. They cannot accept new applications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is an Endorsing Body?</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                An <strong>endorsing body</strong> is an organization approved by the UK Home Office to assess 
                and endorse business ideas for the Innovator Founder Visa. They evaluate whether your business 
                meets the <strong>innovation, viability, and scalability</strong> criteria required for the visa.
              </p>
              <p>
                Receiving endorsement is mandatory for the visa application. You must also attend 
                <strong> two contact point meetings</strong> during your visa period (at 6 and 12 months) 
                to demonstrate progress against your endorsed business plan.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Active Endorsing Bodies (2026)</h2>
              <Badge className="bg-green-500/10 text-green-600">4 Bodies</Badge>
            </div>

            <div className="grid gap-4">
              {activeEndorsingBodies.map((body, index) => (
                <Card key={index} className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{body.name}</h3>
                          <Badge className="bg-green-500/10 text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          {body.invitationOnly && (
                            <Badge variant="outline" className="text-amber-600 border-amber-500">
                              Invitation Only
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4">{body.description}</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            {body.location}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <PoundSterling className="w-4 h-4" />
                            Endorsement: {body.cost}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            {body.sectors.join(", ")}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://${body.website}`} target="_blank" rel="noopener noreferrer">
                          Visit <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PoundSterling className="w-5 h-5 text-primary" />
                  Endorsement Costs
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Initial Endorsement</p>
                      <p className="text-muted-foreground text-sm">£1,000 per person (paid to endorsing body)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Contact Point Meetings</p>
                      <p className="text-muted-foreground text-sm">£500 per meeting (2 mandatory meetings)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Processing Time</p>
                      <p className="text-muted-foreground text-sm">4-8 weeks typically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Endorsement Validity</p>
                      <p className="text-muted-foreground text-sm">3 months from issue date</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How to Choose the Right Endorsing Body</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Compare All Four Bodies", desc: "With only 4 active options, research each one thoroughly before applying" },
                { title: "Check Sector Expertise", desc: "Some bodies have stronger networks in specific industries - this can help post-endorsement" },
                { title: "Review Success Criteria", desc: "Each body may have slightly different assessment approaches and requirements" },
                { title: "Consider GEP (If Eligible)", desc: "The government programme is free but invitation-only for exceptional founders" },
                { title: "Plan for Contact Meetings", desc: "You'll need 2 mandatory meetings - choose a body you can build a relationship with" },
                { title: "Check Processing Times", desc: "Application processing varies - plan according to your visa timeline" }
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Legacy Endorsing Bodies</h2>
              <Badge variant="outline" className="text-muted-foreground">Pre-April 2023 Only</Badge>
            </div>
            
            <Card className="mb-4 bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    These organizations were previously endorsing bodies but can now <strong>only</strong> provide 
                    continued support to founders they endorsed before 13 April 2023. They cannot accept new endorsement applications.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-3">
              {legacyEndorsingBodies.map((body, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-muted">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{body.name}</p>
                    <p className="text-xs text-muted-foreground">{body.sector}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">Legacy</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              ...and many more university and accelerator-based bodies now classified as legacy.
            </p>
          </section>

          <Card className="bg-gradient-to-r from-primary to-[#41B6E6] text-white">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Apply for Endorsement?</h2>
              <p className="mb-6 opacity-90">
                Use our AI-powered tools to prepare a winning business plan that meets endorsing body requirements.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/questionnaire" data-testid="link-create-plan">
                    Create Business Plan <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20" asChild>
                  <Link href="/tools/endorser-comparison" data-testid="link-use-comparison-tool">
                    Compare Bodies
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
