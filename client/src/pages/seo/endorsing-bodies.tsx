import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { 
  Building2, Search, CheckCircle2, ExternalLink, ArrowRight,
  Laptop, Leaf, Lightbulb, GraduationCap, Rocket, Globe,
  Filter, Star
} from "lucide-react";
import { createBreadcrumbSchema, endorsingBodiesListSchema } from "@/lib/seoSchemas";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Endorsing Bodies", url: "/endorsing-bodies" }
]);

const endorsingBodies = [
  { name: "Tech Nation", sector: "Technology", location: "London", website: "technation.io", featured: true, description: "The UK's leading network for tech entrepreneurs and growth companies." },
  { name: "Seedcamp", sector: "Technology", location: "London", website: "seedcamp.com", featured: true, description: "Europe's seed fund, backing ambitious founders building world-leading companies." },
  { name: "Entrepreneur First", sector: "Technology", location: "London", website: "joinef.com", featured: true, description: "Global talent investor helping founders build world-changing companies." },
  { name: "Founders Factory", sector: "General", location: "London", website: "foundersfactory.com", featured: true, description: "Venture studio and accelerator partnering with global corporates." },
  { name: "Bethnal Green Ventures", sector: "Social Impact", location: "London", website: "bethnalgreenventures.com", featured: true, description: "Investment fund for tech for good startups." },
  { name: "SETsquared Partnership", sector: "University", location: "Multiple", website: "setsquared.co.uk", featured: false, description: "World-leading enterprise partnership of six research-intensive universities." },
  { name: "Scottish Enterprise", sector: "Regional", location: "Scotland", website: "scottish-enterprise.com", featured: false, description: "Scotland's national economic development agency." },
  { name: "Innovate UK EDGE", sector: "Innovation", location: "National", website: "innovateukedge.ukri.org", featured: false, description: "Free business support for ambitious UK SMEs." },
  { name: "Newcastle University", sector: "University", location: "Newcastle", website: "ncl.ac.uk", featured: false, description: "Russell Group university with strong enterprise support." },
  { name: "University of Manchester", sector: "University", location: "Manchester", website: "manchester.ac.uk", featured: false, description: "World-leading university with extensive incubation facilities." },
  { name: "Imperial College London", sector: "University", location: "London", website: "imperial.ac.uk", featured: false, description: "World top 10 university with cutting-edge startup support." },
  { name: "Cambridge Enterprise", sector: "University", location: "Cambridge", website: "enterprise.cam.ac.uk", featured: false, description: "University of Cambridge's commercialisation arm." },
  { name: "Oxford Innovation", sector: "University", location: "Oxford", website: "oxin.co.uk", featured: false, description: "Innovation support and investment for early-stage companies." },
  { name: "London Business School", sector: "University", location: "London", website: "london.edu", featured: false, description: "Global top business school with entrepreneur network." },
  { name: "Cyber London (CyLon)", sector: "Cybersecurity", location: "London", website: "cylonlab.com", featured: false, description: "Europe's leading accelerator for cybersecurity startups." },
  { name: "Digital Catapult", sector: "Technology", location: "London", website: "digicatapult.org.uk", featured: false, description: "UK authority on advanced digital technology adoption." },
  { name: "Barclays Eagle Labs", sector: "General", location: "Multiple", website: "labs.uk.barclays", featured: false, description: "Network of accelerators supporting high-growth businesses." },
  { name: "Wayra UK", sector: "Technology", location: "London", website: "wayra.co.uk", featured: false, description: "Telefonica's global innovation initiative." },
  { name: "NatWest Accelerator", sector: "General", location: "Multiple", website: "natwest.com/accelerator", featured: false, description: "Free business accelerator for entrepreneurs." },
  { name: "Mayor's International Business Programme", sector: "General", location: "London", website: "business.london", featured: false, description: "Support for international businesses expanding to London." },
  { name: "Level39", sector: "Fintech", location: "London", website: "level39.co", featured: false, description: "Europe's largest technology accelerator for fintech and cybersecurity." },
  { name: "Accelerator Academy", sector: "General", location: "London", website: "acceleratoracademy.com", featured: false, description: "Accelerator helping ambitious founders scale globally." },
  { name: "Zinc VC", sector: "Social Impact", location: "London", website: "zinc.vc", featured: false, description: "Mission-driven venture builder addressing social challenges." },
  { name: "Emerge Education", sector: "EdTech", location: "London", website: "emerge.education", featured: false, description: "Europe's leading edtech accelerator." },
  { name: "Carbon13", sector: "Climate Tech", location: "Cambridge", website: "carbonthirteen.com", featured: false, description: "Venture builder for climate tech startups." },
];

const sectors = ["All", "Technology", "University", "General", "Social Impact", "Regional", "Innovation", "Fintech", "Climate Tech", "EdTech", "Cybersecurity"];

export default function EndorsingBodiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");

  const filteredBodies = endorsingBodies.filter(body => {
    const matchesSearch = body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         body.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "All" || body.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case "Technology": return <Laptop className="w-4 h-4" />;
      case "Social Impact": return <Leaf className="w-4 h-4" />;
      case "University": return <GraduationCap className="w-4 h-4" />;
      case "Innovation": return <Lightbulb className="w-4 h-4" />;
      case "Regional": return <Globe className="w-4 h-4" />;
      default: return <Rocket className="w-4 h-4" />;
    }
  };

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Endorsing Bodies 2026 | Complete List & Guide"
        description="Complete list of 40+ approved endorsing bodies for UK Innovator Founder Visa in 2026. Compare Tech Nation, Seedcamp, Founders Factory & more. Find the best endorsing body for your business."
        path="/endorsing-bodies"
        keywords="UK endorsing bodies 2026, Innovator Visa endorsement, Tech Nation endorsement, Seedcamp visa, UK visa endorsing bodies list, startup visa endorsement"
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
              Complete guide to the 40+ approved endorsing bodies for the UK Innovator Founder Visa. 
              Find the right organization to endorse your innovative business idea.
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
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is an Endorsing Body?</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                An <strong>endorsing body</strong> is an organization approved by the UK Home Office to assess 
                and endorse business ideas for the Innovator Founder Visa. They evaluate whether your business 
                meets the <strong>innovation, viability, and scalability</strong> criteria required for the visa.
              </p>
              <p>
                Receiving endorsement is mandatory for the visa application. Each endorsing body has its own 
                application process, sector focus, and requirements. Choosing the right one can significantly 
                impact your chances of success.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search endorsing bodies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-bodies"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {sectors.slice(0, 6).map((sector) => (
                    <Badge
                      key={sector}
                      variant={selectedSector === sector ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedSector(sector)}
                      data-testid={`filter-${sector.toLowerCase()}`}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredBodies.length} of {endorsingBodies.length} endorsing bodies
            </div>

            <div className="grid gap-4">
              {filteredBodies.map((body, index) => (
                <Card key={index} className={body.featured ? "border-primary/50" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{body.name}</h3>
                          {body.featured && (
                            <Badge className="bg-amber-500/10 text-amber-600">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{body.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getSectorIcon(body.sector)}
                            <span className="ml-1">{body.sector}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            {body.location}
                          </Badge>
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
            <h2 className="text-2xl font-bold mb-6">How to Choose the Right Endorsing Body</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Match Your Sector", desc: "Choose a body that specializes in your industry for better understanding of your business" },
                { title: "Check Requirements", desc: "Each body has different application processes and documentation requirements" },
                { title: "Consider Location", desc: "Some bodies focus on specific regions - this may impact available support" },
                { title: "Research Success Rates", desc: "Look for bodies with strong track records in your sector" },
                { title: "Evaluate Support Offered", desc: "Some provide ongoing mentoring, networking, and funding opportunities" },
                { title: "Timing Matters", desc: "Application processing times vary - plan according to your visa timeline" }
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

          <Card className="bg-gradient-to-r from-primary to-[#41B6E6] text-white">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Not Sure Which Endorsing Body to Choose?</h2>
              <p className="mb-6 opacity-90">
                Use our AI-powered Endorsing Body Comparison Tool to find the perfect match for your business.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/tools/endorser-comparison" data-testid="link-use-comparison-tool">
                  Find Your Perfect Match <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
