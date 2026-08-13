import { SEOHead } from "@/components/SEOHead";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText, Users, CreditCard, Shield, Scale, AlertTriangle, Mail } from "lucide-react";
import { useCommercialCatalog } from "@/hooks/useCommercialCatalog";

export default function TermsOfService() {
  const { plans, toolCounts, formatPrice } = useCommercialCatalog();
  const maximumToolCount = Math.max(0, ...Object.values(toolCounts));

  return (
    <>
      <SEOHead
        title="Terms of Service | UK Innovator Founder Visa Assistant"
        description="UK Innovator Founder Visa Assistant terms of service. Understand your rights and responsibilities when using our professional-level visa application tools."
        canonical="https://innovatorfoundervisaassistant.co.uk/terms"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="border-b bg-primary/5">
          <div className="responsive-container py-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold" data-testid="heading-terms">Terms of Service</h1>
                <p className="text-muted-foreground">Last Updated: August 12, 2026</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Please read these terms carefully before using our platform. They govern your use of our services.
            </p>
          </div>
        </div>

        <div className="responsive-container py-12 max-w-4xl">
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing or using UK Innovator Founder Visa Assistant ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Platform.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">2. Description of Services</h2>
                  <p className="text-muted-foreground mb-3">
                    UK Innovator Founder Visa Assistant provides AI-powered tools and resources to help applicants prepare for the UK Innovator Founder Visa application process. Our services include:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>{maximumToolCount} professional-level business planning and visa preparation tools</li>
                    <li>Business plan generation and innovation assessment</li>
                    <li>Financial modeling and compliance checking</li>
                    <li>Pitch coaching and endorsement preparation</li>
                    <li>Document templates and guidance materials</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                  
                  <h3 className="font-semibold mb-2">3.1 Account Creation</h3>
                  <p className="text-muted-foreground mb-3">
                    You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials.
                  </p>

                  <h3 className="font-semibold mb-2">3.2 Account Security</h3>
                  <p className="text-muted-foreground">
                    You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized access or security breaches.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">4. Plans and Payments</h2>
                  
                  <h3 className="font-semibold mb-2">4.1 Plan Tiers</h3>
                  <p className="text-muted-foreground mb-2">We offer {plans.length} published plans with access to our professional-level tools:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-4">
                    {plans.map((plan) => (
                      <li key={plan.id}>
                        <strong>{plan.displayName} ({formatPrice(plan.pricePence)}{plan.pricePence > 0 ? " one-time" : ""}):</strong>{" "}
                        {plan.description}
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-semibold mb-2">4.2 Payment Terms</h3>
                  <p className="text-muted-foreground mb-3">
                    Paid plans are charged once at the price shown at checkout. All payments are processed securely through Stripe. By providing payment information, you authorize us to charge the applicable one-time fee.
                  </p>

                  <h3 className="font-semibold mb-2">4.3 Refund Policy</h3>
                  <p className="text-muted-foreground">
                    We offer a 14-day money-back guarantee for first-time paid-plan purchases. Where a plan expressly includes a Success Guarantee, its stated conditions also apply. Refund requests must be submitted to <a href="mailto:billing@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">billing@innovatorfoundervisaassistant.co.uk</a>.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
                  <p className="text-muted-foreground mb-2">You agree not to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Use the Platform for any illegal or unauthorized purpose</li>
                    <li>Share your account credentials with others</li>
                    <li>Attempt to reverse engineer, decompile, or hack the Platform</li>
                    <li>Scrape, copy, or redistribute our proprietary tools and content</li>
                    <li>Upload malicious code, viruses, or harmful content</li>
                    <li>Impersonate another person or entity</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-primary/30 bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">6. Intellectual Property Rights</h2>
                  
                  <h3 className="font-semibold mb-2">6.1 Our Intellectual Property</h3>
                  <p className="text-muted-foreground mb-3">
                    All content, software, tools, algorithms, user interface designs, workflows, methodologies, and materials on this Platform are the exclusive property of UK Innovator Founder Visa Assistant and are protected under the UK Copyright, Designs and Patents Act 1988, international copyright treaties, and applicable intellectual property laws.
                  </p>
                  
                  <h3 className="font-semibold mb-2">6.2 Protected Elements</h3>
                  <p className="text-muted-foreground mb-2">The following are specifically protected:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-4">
                    <li>All {maximumToolCount} visa application tools and their unique implementations</li>
                    <li>AI agent designs (Nova, Sterling, Atlas, Sage) and their interaction patterns</li>
                    <li>Business plan generation algorithms and templates</li>
                    <li>User interface designs, layouts, and visual elements</li>
                    <li>Compliance scoring methodologies and calculations</li>
                    <li>Document templates and export formats</li>
                    <li>All original written content, guides, and educational materials</li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2">6.3 Prohibited Activities</h3>
                  <p className="text-muted-foreground mb-2">You expressly agree NOT to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-4">
                    <li>Copy, reproduce, or duplicate any part of our Platform or its features</li>
                    <li>Reverse engineer, decompile, or attempt to extract source code</li>
                    <li>Create derivative works or "inspired by" versions of our tools</li>
                    <li>Scrape, crawl, or systematically collect our content</li>
                    <li>Use automated tools to access or interact with our Platform</li>
                    <li>Redistribute, resell, or sublicense any Platform content</li>
                    <li>Remove or alter any copyright notices or proprietary markings</li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2">6.4 Your Content</h3>
                  <p className="text-muted-foreground mb-3">
                    You retain ownership of your business plan data and personal content you create. By using our Platform, you grant us a limited, non-exclusive license to process and store your data solely to provide our services.
                  </p>
                  
                  <h3 className="font-semibold mb-2">6.5 Enforcement</h3>
                  <p className="text-muted-foreground">
                    We actively monitor for intellectual property violations and will pursue legal action, including injunctions and damages, against any party infringing our rights. Violations may be reported to relevant authorities and professional bodies.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-orange-500/30 bg-orange-500/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
                  <p className="text-muted-foreground mb-3">
                    <strong>IMPORTANT:</strong> UK Innovator Founder Visa Assistant is a guidance and planning tool. We do not guarantee visa approval.
                  </p>
                  <p className="text-muted-foreground mb-2">
                    The Platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied. We do not guarantee that:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Your visa application will be approved</li>
                    <li>Our tools will meet all your specific requirements</li>
                    <li>The Platform will be error-free or uninterrupted</li>
                    <li>All information provided is legally binding or constitutes legal advice</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, UK Innovator Founder Visa Assistant shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or visa application fees, arising from your use of the Platform.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">9. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless UK Innovator Founder Visa Assistant from any claims, damages, losses, or expenses arising from your violation of these Terms or misuse of the Platform.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
              <p className="text-muted-foreground mb-3">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or fraudulent activity. Current plan purchases are one-time payments rather than recurring subscriptions.
              </p>
              <p className="text-muted-foreground">
                Upon termination, your access to paid features will cease, but your data will be retained according to our Privacy Policy.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England and Wales.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or prominent notice on the Platform. Your continued use after changes constitutes acceptance of the updated Terms.
              </p>
            </Card>

            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
                  <p className="text-muted-foreground mb-3">
                    For questions about these Terms, contact us at:
                  </p>
                  <ul className="list-none text-muted-foreground space-y-2">
                    <li><strong>General Inquiries:</strong> <a href="mailto:hello@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">hello@innovatorfoundervisaassistant.co.uk</a></li>
                    <li><strong>Legal:</strong> <a href="mailto:legal@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">legal@innovatorfoundervisaassistant.co.uk</a></li>
                    <li><strong>Support:</strong> <a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">support@innovatorfoundervisaassistant.co.uk</a></li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
