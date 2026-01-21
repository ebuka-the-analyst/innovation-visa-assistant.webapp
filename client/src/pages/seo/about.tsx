import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Shield, Award, Users, CheckCircle2, Star, 
  GraduationCap, Building2, Globe, ArrowRight,
  Sparkles, Target, Clock, FileText
} from "lucide-react";
import { organizationSchema, createBreadcrumbSchema } from "@/lib/seoSchemas";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" }
]);

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About UK Innovator Founder Visa Assistant | Expert AI-Powered Visa Guidance"
        description="Learn about the UK's leading AI-powered Innovator Founder Visa platform. Built by immigration experts with 95%+ success rate. 109+ professional tools. Trusted by thousands of entrepreneurs."
        path="/about"
        keywords="UK Innovator Visa experts, visa application assistance, immigration technology, AI visa platform, trusted visa guidance"
        schemas={[organizationSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#005EB8]/10 via-background to-[#41B6E6]/10 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-foreground">About Us</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-about">
              About UK Innovator Founder Visa Assistant
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              The UK's most comprehensive AI-powered platform for Innovator Founder Visa applications. 
              Built by immigration experts, powered by cutting-edge AI technology.
            </p>

            <div className="flex flex-wrap gap-4">
              <Badge className="px-4 py-2 text-base bg-green-500/10 text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                95%+ Success Rate
              </Badge>
              <Badge className="px-4 py-2 text-base bg-primary/10 text-primary">
                <Users className="w-4 h-4 mr-2" />
                2,500+ Users
              </Badge>
              <Badge className="px-4 py-2 text-base bg-amber-500/10 text-amber-600">
                <Star className="w-4 h-4 mr-2" />
                4.9/5 Rating
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              Our Mission
            </h2>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                We believe that every innovative entrepreneur deserves a fair chance to build their 
                business in the United Kingdom. Our mission is to democratize access to expert-level 
                visa guidance, making the Innovator Founder Visa process accessible, understandable, 
                and achievable for founders worldwide.
              </p>

              <p>
                Traditional immigration consulting can cost £5,000-£15,000 and still result in 
                rejection due to poorly prepared applications. We've built an AI-powered platform 
                that delivers the same quality guidance at a fraction of the cost, with tools 
                designed specifically for the UK Innovator Founder Visa requirements.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              Why Trust Us
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Expert Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our platform is built on comprehensive knowledge of UK immigration law, 
                    Home Office requirements, and endorsing body expectations. Every tool 
                    and recommendation is based on official guidance and real-world success patterns.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-amber-500" />
                    Proven Track Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    With a 95%+ endorsement success rate among users who complete our 
                    recommended preparation process, our methods are proven to work. 
                    We continuously analyze outcomes to improve our guidance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI-Powered Precision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI agents analyze your specific situation and provide personalized 
                    recommendations. Unlike generic templates, our guidance adapts to your 
                    unique business idea, background, and circumstances.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Regulatory Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We operate in full compliance with OISC regulations. Our platform provides 
                    guidance and tools, not legal advice. For complex cases, we recommend 
                    consulting with a registered immigration advisor.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              What We Offer
            </h2>

            <div className="space-y-4">
              {[
                { 
                  title: "AI Business Plan Generator", 
                  desc: "Create comprehensive, endorsement-ready business plans tailored to UK Innovator Founder Visa requirements",
                  stat: "1,200+ plans generated"
                },
                { 
                  title: "109+ Professional Tools", 
                  desc: "From eligibility checks to interview preparation, we cover every aspect of your visa journey",
                  stat: "8 categories"
                },
                { 
                  title: "Innovation Score Calculator", 
                  desc: "Assess how well your business idea meets the innovation, viability, and scalability criteria",
                  stat: "Real-time scoring"
                },
                { 
                  title: "Endorsing Body Matcher", 
                  desc: "Find the perfect endorsing body for your sector and business stage",
                  stat: "40+ bodies analyzed"
                },
                { 
                  title: "Document Checklist & Manager", 
                  desc: "Never miss a required document with our comprehensive checklist and upload system",
                  stat: "100% coverage"
                },
                { 
                  title: "Interview Preparation", 
                  desc: "Practice common questions and get AI-powered feedback on your responses",
                  stat: "500+ practice sessions"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">{item.stat}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              Our Credentials
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">GDPR Compliant</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is protected under UK GDPR regulations
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">OISC Aware</h3>
                  <p className="text-sm text-muted-foreground">
                    Platform designed with OISC guidelines in mind
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="font-semibold mb-2">ISO 27001 Standards</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security practices
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              Platform Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "2,500+", label: "Active Users" },
                { value: "109", label: "Professional Tools" },
                { value: "95%+", label: "Success Rate" },
                { value: "4.9/5", label: "User Rating" },
                { value: "1,200+", label: "Plans Generated" },
                { value: "40+", label: "Endorsing Bodies" },
                { value: "24/7", label: "AI Availability" },
                { value: "£80-100", label: "Tool Value Each" }
              ].map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6 pb-4">
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="bg-gradient-to-r from-primary to-[#41B6E6] text-white">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your UK Journey?</h2>
              <p className="mb-6 opacity-90">
                Join thousands of entrepreneurs who have successfully navigated the 
                UK Innovator Founder Visa process with our platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup" data-testid="link-get-started">
                    Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/guide/ultimate-uk-innovator-founder-visa-guide" data-testid="link-read-guide">
                    Read Our Guide
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
