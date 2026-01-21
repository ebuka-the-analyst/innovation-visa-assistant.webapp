import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import logoLightImg from "@assets/official_logo.webp";
import logoDarkImg from "@assets/logo_dark.webp";
import { ComplianceBadges } from "@/components/ComplianceBadges";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubscribe = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    window.location.href = `mailto:updates@innovatorfoundervisaassistant.co.uk?subject=Newsletter Subscription&body=Please add ${encodeURIComponent(email)} to your newsletter list.`;
    
    toast({
      title: "Opening email client",
      description: "Send the email to complete your subscription",
    });
  };

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-accent/5">
      <div className="responsive-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <div className="isolate z-[9999] mix-blend-normal bg-transparent">
              <div className="logo-container overflow-hidden mb-3">
                <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" width="286" height="80" className="h-20 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
                <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" width="286" height="80" className="h-20 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered business plans and official GOV.UK guidance for UK Innovator Founder Visa applicants.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/features" className="hover:text-primary transition-colors" data-testid="link-features">Features</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors" data-testid="link-pricing">Pricing</a></li>
              <li><a href="/tools-hub" className="hover:text-primary transition-colors" data-testid="link-templates">Templates</a></li>
              <li><a href="/generation" className="hover:text-primary transition-colors" data-testid="link-sample-plans">Sample Plans</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/guide" className="hover:text-primary transition-colors" data-testid="link-documentation">Documentation</a></li>
              <li><a href="/faq" className="hover:text-primary transition-colors" data-testid="link-faq">FAQ</a></li>
              <li><a href="/ai-transparency" className="hover:text-primary transition-colors" data-testid="link-ai-transparency">AI Transparency</a></li>
              <li><a href="/support" className="hover:text-primary transition-colors" data-testid="link-support">Support</a></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h3 className="font-semibold mb-4">Legal & Compliance</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/ai-transparency" className="hover:text-primary transition-colors" data-testid="link-ai-how-it-works">How Our AI Works</a></li>
              <li><a href="/testing-validation" className="hover:text-primary transition-colors" data-testid="link-testing">Testing & Validation</a></li>
              <li><a href="/compliance-dashboard" className="hover:text-primary transition-colors" data-testid="link-compliance">Compliance Status</a></li>
              <li><a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" data-testid="link-ico">ICO Registration</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:hello@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors" data-testid="link-general-inquiries">
                  General Inquiries
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-primary transition-colors" data-testid="link-customer-support">
                  Customer Support
                </a>
              </li>
              <li>
                <a href="mailto:billing@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors" data-testid="link-billing">
                  Billing & Payments
                </a>
              </li>
              <li>
                <a href="mailto:team@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors" data-testid="link-partnership">
                  Partnership Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get UK Innovator Founder Visa tips and updates to updates@innovatorfoundervisaassistant.co.uk
            </p>
            <div className="flex gap-2 max-w-md">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 min-w-[200px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-newsletter"
              />
              <Button onClick={handleNewsletterSubscribe} className="whitespace-nowrap" data-testid="button-newsletter-subscribe">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We'll send UK Innovator Founder Visa updates from updates@innovatorfoundervisaassistant.co.uk
            </p>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="pt-8 border-t border-border mb-6">
          <ComplianceBadges variant="footer" />
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="isolate z-[9999] mix-blend-normal bg-transparent opacity-70">
              <div className="logo-container overflow-hidden">
                <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" width="143" height="40" className="h-10 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
                <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" width="143" height="40" className="h-10 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>© 2024-2026 UK Innovator Founder Visa Assistant. All rights reserved.</p>
              <p className="text-xs mt-1">Protected by UK Copyright, Designs and Patents Act 1988. Unauthorized reproduction prohibited.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
