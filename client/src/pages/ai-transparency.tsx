import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
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
              <p className="text-muted-foreground">How our AI system works, what it can do and where its limits are</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              <Cpu className="h-3 w-3 mr-1" /> OpenAI + Anthropic
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              <RefreshCw className="h-3 w-3 mr-1" /> Managed model routing
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
              <ShieldCheck className="h-3 w-3 mr-1" /> General guidance only
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
                A managed multi-provider AI architecture designed for quality, resilience and controlled upgrades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Current AI architecture: OpenAI GPT + Anthropic Claude
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-6">
                  The platform uses a centrally managed AI gateway that can route requests to <strong>OpenAI GPT</strong> and <strong>Anthropic Claude</strong> through their official APIs. 
                  Model selection is controlled centrally so production can move to newer suitable models as they become available and are validated for the platform. 
                  The exact provider or model used for a request can vary based on configuration, availability and fallback rules.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-6 mt-2">
                  <strong>Qwen / Alibaba Cloud is not part of the current AI provider configuration.</strong>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    What We Do
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use managed OpenAI and Anthropic API integrations rather than a single fixed model provider</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Review and update production model configuration when newer suitable models are adopted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use structured prompts and relevant official UK immigration and endorsement information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use fallback routing when an enabled provider is unavailable or returns a recoverable error</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Present AI output as preparation support, not as a Home Office, endorsing body or adviser decision</span>
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <XCircle className="h-4 w-4 text-red-500" />
                    What We Do Not Do
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Train our own foundation model on your application data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Guarantee that any AI response is complete, current or error-free</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Provide regulated immigration advice through the AI system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Make the final decision on visa eligibility, endorsement or a Home Office application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Claim that OpenAI or Anthropic endorses this platform</span>
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
                AI Providers, Sources & User Data
              </CardTitle>
              <CardDescription>
                What the AI uses and how provider processing fits into the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Managed AI Providers</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                        <Cloud className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">OpenAI GPT</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Used through OpenAI's official API. The platform keeps the production model centrally managed so it can be updated without changing every individual AI feature.
                        </p>
                        <a
                          href="https://platform.openai.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                        >
                          OpenAI API documentation <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40">
                        <Cloud className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Anthropic Claude</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supported through Anthropic's official API as a managed provider. Availability and priority depend on the platform's current provider configuration.
                        </p>
                        <a
                          href="https://docs.anthropic.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                        >
                          Anthropic API documentation <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provider names describe the services integrated with the platform. Exact model versions may change as newer models are evaluated and configured.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Knowledge & Guidance Sources</h4>
                <p className="text-sm text-muted-foreground">
                  AI prompts and platform content can draw on authoritative public information and information you provide. Important requirements should still be checked against the latest official source.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">GOV.UK & Home Office</p>
                      <p className="text-xs text-muted-foreground">Immigration Rules, Innovator Founder guidance and relevant caseworker guidance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Immigration Advice Authority (IAA)</p>
                      <p className="text-xs text-muted-foreground">Public information about regulated immigration advice and adviser standards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Endorsing body information</p>
                      <p className="text-xs text-muted-foreground">Published criteria and guidance from relevant endorsing bodies, where available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Information you provide</p>
                      <p className="text-xs text-muted-foreground">Business, market, financial and application context entered into platform tools</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">How AI Requests Use Your Information</h4>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-900 dark:text-amber-200 space-y-2">
                      <p>
                        When you use an AI-powered feature, relevant input may be sent to the configured OpenAI or Anthropic API so that the provider can generate a response. 
                        That means it would be inaccurate to say that no third party ever processes information used by an AI feature.
                      </p>
                      <p>
                        We do not use your application content to train our own foundation model. Provider processing, retention and account-level data controls are governed by the applicable provider terms and the platform's configured API account settings.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Avoid entering information that is not necessary for the task. Where a platform feature stores your information, storage and deletion are governed by that feature, your account controls and the platform's applicable privacy terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-tech-stack">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Platform Architecture
              </CardTitle>
              <CardDescription>
                A high-level view of the technologies used to deliver the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3">Application</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>React + TypeScript</li>
                    <li>Node.js + Express</li>
                    <li>PostgreSQL</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3">AI services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>OpenAI API</li>
                    <li>Anthropic API</li>
                    <li>Central provider routing and fallback</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3">Supporting services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Railway hosting</li>
                    <li>Stripe where payment processing is used</li>
                    <li>Other operational services as configured by the platform</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Security and data-location wording
                </h4>
                <p className="text-sm text-muted-foreground">
                  We avoid making blanket statements such as "all data is in the UK" or naming a specific TLS version unless the current infrastructure configuration has been verified. 
                  Security, data-location and subprocessor details should reflect the platform's actual deployed configuration and applicable privacy documentation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-ai-limitations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                AI Limitations & Your Responsibility
              </CardTitle>
              <CardDescription>
                Important points before relying on AI-generated material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">AI can be wrong</h4>
                  <p className="text-sm text-muted-foreground">
                    Even strong current models can misunderstand context, miss a rule change or generate an incorrect statement. Review important claims before using them.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Rules can change</h4>
                  <p className="text-sm text-muted-foreground">
                    Immigration Rules, Home Office guidance and endorsing body requirements can change. Check current official sources before submission.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Your facts remain your responsibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Check names, dates, financial figures, market claims and evidence. Do not submit AI-generated facts that you cannot support.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Use regulated advice when needed</h4>
                  <p className="text-sm text-muted-foreground">
                    If you need advice specific to your immigration circumstances, use an appropriately regulated adviser or legal professional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
