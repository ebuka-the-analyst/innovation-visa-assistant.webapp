import { SEOHead } from "@/components/SEOHead";
import Footer from "@/components/Footer";

export default function CookiePolicy() {
  return (
    <>
      <SEOHead
        title="Cookie Policy | UK Innovator Founder Visa Assistant"
        description="Learn how we use cookies and tracking technologies. UK Innovator Founder Visa Assistant cookie policy explaining our use of essential, analytics, and marketing cookies."
        canonical="https://innovatorfoundervisaassistant.co.uk/cookies"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: November 24, 2025</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files placed on your device by websites you visit. They help websites remember your preferences, analyze traffic, and provide personalized experiences. UK Innovator Founder Visa Assistant uses cookies to enhance your user experience and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Essential Cookies</h3>
              <p className="text-muted-foreground mb-2">
                These cookies are necessary for the Platform to function properly. They enable core functionality such as:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Session Management:</strong> Keep you logged in as you navigate the Platform</li>
                <li><strong>Security:</strong> Protect against cross-site request forgery (CSRF) attacks</li>
                <li><strong>Load Balancing:</strong> Distribute traffic efficiently across our servers</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <em>These cookies cannot be disabled as they are essential for the Platform to work.</em>
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Analytics Cookies</h3>
              <p className="text-muted-foreground mb-2">
                We use Google Analytics to understand how users interact with our Platform:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Pages visited and time spent on each page</li>
                <li>User journey through the Platform</li>
                <li>Device type, browser, and operating system</li>
                <li>Traffic sources (how users found our Platform)</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                These cookies help us improve user experience and tool performance. You can opt out via browser settings or Google Analytics Opt-out Browser Add-on.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Functional Cookies</h3>
              <p className="text-muted-foreground mb-2">
                These cookies remember your preferences and settings:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Dark mode / light mode preference</li>
                <li>Language and region settings</li>
                <li>Tool customization preferences</li>
                <li>Saved business plan drafts (localStorage)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Marketing Cookies (Future Use)</h3>
              <p className="text-muted-foreground">
                We may use marketing cookies in the future to deliver targeted advertisements. If implemented, we will request your explicit consent and provide opt-out options.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-2">
                Our Platform uses third-party services that set their own cookies:
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">Google Analytics</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Cookie names: _ga, _gid, _gat</li>
                <li>Purpose: Traffic analysis and user behavior tracking</li>
                <li>Duration: Up to 2 years</li>
                <li>Privacy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Stripe</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Cookie names: __stripe_mid, __stripe_sid</li>
                <li>Purpose: Fraud prevention and payment processing</li>
                <li>Duration: 1 year (mid), 30 minutes (sid)</li>
                <li>Privacy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a></li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Cloudflare Turnstile</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Purpose: Bot protection and security on signup/login forms</li>
                <li>Privacy: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudflare Privacy Policy</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. How to Manage Cookies</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Browser Settings</h3>
              <p className="text-muted-foreground mb-2">
                Most browsers allow you to control cookies through settings:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Opt-Out Tools</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
                <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digital Advertising Alliance Opt-Out</a></li>
                <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Your Online Choices (EU)</a></li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Impact of Disabling Cookies</h3>
              <p className="text-muted-foreground">
                Disabling cookies may impact your experience on our Platform. You may not be able to stay logged in, save preferences, or access certain features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Local Storage</h2>
              <p className="text-muted-foreground mb-4">
                In addition to cookies, we use browser local storage to save your business plan progress and tool data. This data remains on your device until you clear your browser cache or delete it manually.
              </p>
              <p className="text-muted-foreground">
                Local storage data is not transmitted to our servers unless you explicitly save your progress to your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookie Consent</h2>
              <p className="text-muted-foreground mb-4">
                By using our Platform, you consent to our use of essential cookies. For analytics and functional cookies, we rely on your implied consent by continuing to use the Platform after being informed via this Cookie Policy.
              </p>
              <p className="text-muted-foreground">
                You can withdraw consent at any time by adjusting your browser settings or contacting us at <a href="mailto:privacy@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">privacy@innovatorfoundervisaassistant.co.uk</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy to reflect changes in technology, legal requirements, or our services. We will notify you of significant changes via email or prominent notice on the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground mb-2">
                For questions about our use of cookies, contact us at:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li><strong>Email:</strong> <a href="mailto:privacy@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">privacy@innovatorfoundervisaassistant.co.uk</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">support@innovatorfoundervisaassistant.co.uk</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
