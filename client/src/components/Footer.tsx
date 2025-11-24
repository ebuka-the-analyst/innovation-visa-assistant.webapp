import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <div className="logo-container overflow-hidden mb-3">
              <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-20 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" />
              <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-20 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" />
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered business plans and official GOV.UK guidance for UK Innovator Founder Visa applicants.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sample Plans</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:hello@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors">
                  General Inquiries
                </a>
              </li>
              <li>
                <a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors">
                  Customer Support
                </a>
              </li>
              <li>
                <a href="mailto:billing@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors">
                  Billing & Payments
                </a>
              </li>
              <li>
                <a href="mailto:team@innovatorfoundervisaassistant.co.uk" className="hover:text-primary transition-colors">
                  Partnership Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get visa tips and updates to updates@innovatorfoundervisaassistant.co.uk
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter email" 
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button onClick={() => console.log('Newsletter subscribed')}>
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We'll send updates from updates@innovatorfoundervisaassistant.co.uk
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="logo-container overflow-hidden opacity-70">
              <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-10 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" />
              <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-10 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 UK Innovator Founder Visa Assistant. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
