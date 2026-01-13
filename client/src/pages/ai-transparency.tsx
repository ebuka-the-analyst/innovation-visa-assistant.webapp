import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Shield, 
  Database, 
  Lock, 
  Code, 
  Server, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  FileText,
  Users,
  Cpu,
  Cloud,
  Eye,
  Trash2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { OISCDisclaimer } from "@/components/OISCDisclaimer";

export default function AITransparencyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="responsive-container py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-page-title">AI Transparency & Data Practices</h1>
              <p className="text-muted-foreground">How our AI system works and how we handle your data</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" /> GDPR Compliant
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              <Shield className="h-3 w-3 mr-1" /> ICO Registered
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
              <FileText className="h-3 w-3 mr-1" /> OISC Compliant
            </Badge>
          </div>
        </div>

        <OISCDisclaimer variant="full" className="mb-8" />

        <div className="space-y-8">
          <Card data-testid="card-ai-overview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                How Our AI System Works
              </CardTitle>
              <CardDescription>
                A clear explanation of our AI architecture and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Key Fact: We Do NOT Train AI Models
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Our platform uses <strong>Google Gemini</strong>, a commercial AI service provided by Google. 
                  We do not train, fine-tune, or modify any AI models. We use Google's pre-trained models 
                  through their official API with carefully designed prompts.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    What We DO
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use Google Gemini API (commercial, pre-trained model)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Design prompts based on official UK visa requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Store your data securely in encrypted databases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Provide tools to help prepare your visa application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Include OISC disclaimers on all outputs</span>
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <XCircle className="h-4 w-4 text-red-500" />
                    What We DO NOT Do
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Train or fine-tune AI models on user data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Share your personal data with third parties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Provide regulated immigration advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Store passport or financial documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Make automated decisions about your visa eligibility</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-data-sources">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Sources & Training
              </CardTitle>
              <CardDescription>
                Where our AI guidance comes from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">AI Model Provider</h4>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-green-500">
                    <Cloud className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Google Gemini API</p>
                    <p className="text-sm text-muted-foreground">
                      Commercial AI service trained by Google on publicly available data. 
                      We access this via their official API.
                    </p>
                    <a 
                      href="https://ai.google.dev/gemini-api/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      View Google Gemini Terms <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Our Prompt Knowledge Sources</h4>
                <p className="text-sm text-muted-foreground">
                  We craft AI prompts using information from these authoritative sources:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">UK Government (gov.uk)</p>
                      <p className="text-xs text-muted-foreground">
                        Official Innovator Founder Visa requirements and guidance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Endorsing Body Criteria</p>
                      <p className="text-xs text-muted-foreground">
                        Published assessment criteria from UKES, Envestors, etc.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Home Office Guidance</p>
                      <p className="text-xs text-muted-foreground">
                        Immigration rules and caseworker guidance documents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">OISC Code of Standards</p>
                      <p className="text-xs text-muted-foreground">
                        Regulatory requirements for immigration advice
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">User-Provided Data</h4>
                <p className="text-sm text-muted-foreground">
                  When you use our tools, you provide information about your business plan. 
                  This data is:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Used only to generate personalized guidance for YOU</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Stored securely in encrypted PostgreSQL database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Never used to train any AI models</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Deletable at any time via your account settings</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-tech-stack">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Technology Stack
              </CardTitle>
              <CardDescription>
                The technologies powering our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Frontend</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      React + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Vite (build tool)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Tailwind CSS + Shadcn UI
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      TanStack Query
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Backend</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Node.js + Express
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      PostgreSQL (Neon)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Drizzle ORM
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Passport.js (Auth)
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Services</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Google Gemini API (AI)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Stripe (Payments)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Cloudflare Turnstile
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Railway (Hosting)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Hosting & Data Location
                </h4>
                <p className="text-sm text-muted-foreground">
                  Our servers and databases are hosted in <strong>EU/UK regions</strong> to ensure 
                  GDPR compliance. All data transfers are encrypted using TLS 1.3.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-your-rights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Data Rights (GDPR)
              </CardTitle>
              <CardDescription>
                You have full control over your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Eye className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Access</p>
                    <p className="text-sm text-muted-foreground">
                      Request a copy of all data we hold about you
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Rectification</p>
                    <p className="text-sm text-muted-foreground">
                      Correct any inaccurate personal data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Trash2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Erasure</p>
                    <p className="text-sm text-muted-foreground">
                      Delete your account and all associated data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Portability</p>
                    <p className="text-sm text-muted-foreground">
                      Export your data in a machine-readable format
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href="/privacy">
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/terms">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Service
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:privacy@ukvisaassistant.com">
                    Contact Data Protection
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-ai-limitations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                AI Limitations & Disclaimers
              </CardTitle>
              <CardDescription>
                Important information about what AI can and cannot do
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  AI-Generated Content Warning
                </h4>
                <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                  <li>AI responses may contain errors or inaccuracies</li>
                  <li>Immigration rules change frequently - always verify with gov.uk</li>
                  <li>AI cannot assess your individual circumstances like a qualified adviser</li>
                  <li>Generated content should be reviewed by an OISC-registered professional</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">The AI in this platform:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-green-600 dark:text-green-400 text-sm">CAN help you:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>Structure your business plan</li>
                      <li>Identify gaps in your application</li>
                      <li>Understand visa requirements</li>
                      <li>Prepare for endorsement interviews</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-red-600 dark:text-red-400 text-sm">CANNOT:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>Provide legal immigration advice</li>
                      <li>Guarantee visa approval</li>
                      <li>Replace professional legal counsel</li>
                      <li>Make decisions on your behalf</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/testing-validation">
                View Testing & Validation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/compliance-dashboard">
                Compliance Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
