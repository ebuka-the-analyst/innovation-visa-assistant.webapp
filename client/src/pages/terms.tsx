import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import Header from "@/components/Header";
import { AuthHeader } from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText, Users, CreditCard, Shield, Scale, AlertTriangle, Mail } from "lucide-react";

export default function TermsOfService() {
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return (
    <>
      <SEOHead
        title="Terms of Service | UK Innovator Founder Visa Assistant"
        description="UK Innovator Founder Visa Assistant terms of service. Understand your rights and responsibilities when using our professional-level visa application tools."
        canonical="https://innovatorfoundervisaassistant.co.uk/terms"
      />
      
      {user ? <AuthHeader /> : <Header />}
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="border-b bg-primary/5">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" data-testid="heading-terms">Terms of Service</h1>
                <p className="text-muted-foreground">Last Updated: November 24, 2025</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Please read these terms carefully before using our platform. They govern your use of our services.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
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
                    <li>100+ professional-level business planning and visa preparation tools</li>
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
                  <h2 className="text-xl font-semibold mb-3">4. Subscription and Payments</h2>
                  
                  <h3 className="font-semibold mb-2">4.1 Subscription Tiers</h3>
                  <p className="text-muted-foreground mb-2">We offer five subscription tiers:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-4">
                    <li><strong>Free (£0):</strong> 13 essential tools</li>
                    <li><strong>Basic (£29):</strong> 20 tools total</li>
                    <li><strong>Premium (£49):</strong> 83 tools total (Most Popular)</li>
                    <li><strong>Enterprise (£89):</strong> All tools</li>
                    <li><strong>Ultimate (£129):</strong> All 100+ tools + VIP support</li>
                  </ul>

                  <h3 className="font-semibold mb-2">4.2 Payment Terms</h3>
                  <p className="text-muted-foreground mb-3">
                    Subscriptions are billed monthly in advance. All payments are processed securely through Stripe. By providing payment information, you authorize us to charge the applicable fees.
                  </p>

                  <h3 className="font-semibold mb-2">4.3 Refund Policy</h3>
                  <p className="text-muted-foreground">
                    We offer a 14-day money-back guarantee for first-time subscribers. Ultimate tier subscribers are covered by our Success Guarantee. Refund requests must be submitted to <a href="mailto:billing@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">billing@innovatorfoundervisaassistant.co.uk</a>.
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

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-3">
                All content, tools, algorithms, and materials on the Platform are owned by UK Innovator Founder Visa Assistant and protected by copyright, trademark, and intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You retain ownership of your business plan data and content you create. By using our Platform, you grant us a limited license to process and store your data to provide our services.
              </p>
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
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or fraudulent activity. You may cancel your subscription at any time through your account settings.
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
