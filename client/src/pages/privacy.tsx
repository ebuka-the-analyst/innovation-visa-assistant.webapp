import { SEOHead } from "@/components/SEOHead";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | UK Innovator Founder Visa Assistant"
        description="Learn how we protect your data and privacy. UK Innovator Founder Visa Assistant privacy policy covering data collection, usage, and your rights under GDPR."
        canonical="https://innovatorfoundervisaassistant.co.uk/privacy"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: November 24, 2025</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                UK Innovator Founder Visa Assistant ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-muted-foreground">
                By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Name and email address (when you create an account)</li>
                <li>Business plan data (company information, financial projections, innovation descriptions)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communication preferences and newsletter subscriptions</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent on our platform</li>
                <li>Cookies and similar tracking technologies (see Cookie Policy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain our UK Innovator Founder Visa assistance services</li>
                <li>Generate personalized business plans and visa application materials</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important updates about your account and visa application progress</li>
                <li>Improve our tools and user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
                <li>Secure password hashing using bcrypt</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure cloud infrastructure (Neon PostgreSQL database)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-2">We do not sell your personal data. We may share your information with:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Service Providers:</strong> Stripe (payment processing), Google Analytics (analytics), Resend (email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights (GDPR)</h2>
              <p className="text-muted-foreground mb-2">Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your data for marketing purposes</li>
                <li><strong>Restriction:</strong> Request limitation of processing under certain conditions</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">privacy@innovatorfoundervisaassistant.co.uk</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Business plan data is retained for 7 years to support potential visa application reviews. You may request deletion at any time, subject to legal requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your data may be transferred to and processed in countries outside the UK/EEA. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our services are not intended for individuals under 18. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our platform. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground mb-2">
                For privacy-related questions or to exercise your rights, contact us at:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li><strong>Email:</strong> <a href="mailto:privacy@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">privacy@innovatorfoundervisaassistant.co.uk</a></li>
                <li><strong>General Support:</strong> <a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">support@innovatorfoundervisaassistant.co.uk</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
