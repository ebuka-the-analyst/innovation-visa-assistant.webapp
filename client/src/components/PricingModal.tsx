import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

const tiers = [
  {
    id: "free",
    name: "Free Plan",
    price: "Free",
    description: "Start your visa journey",
    pages: "10-15 pages",
    features: [
      "Basic business overview",
      "Innovation introduction",
      "Essential compliance guide",
      "Application requirements checker",
      "Document organizer",
      "Visa timeline planner",
      "10 foundational tools",
      "Email support",
    ],
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: "£19",
    description: "Perfect for simple business concepts",
    pages: "25-35 pages",
    features: [
      "Core Innovation criteria coverage",
      "Basic Viability analysis",
      "Essential Scalability points",
      "Standard business plan format",
      "PDF download",
      "48-hour delivery",
      "30 essential tools",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "£39",
    description: "Most popular for strong applications",
    pages: "40-60 pages",
    popular: true,
    features: [
      "Comprehensive Innovation analysis",
      "Detailed Viability with financials",
      "Advanced Scalability strategy",
      "Industry-specific frameworks",
      "Market research integration",
      "Competitive analysis",
      "PDF download",
      "24-hour delivery",
      "60+ tools suite",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "£79",
    description: "Maximum detail for complex ventures",
    pages: "50-80 pages",
    features: [
      "Deep-dive Innovation coverage",
      "Complete Viability assessment",
      "Multi-market Scalability plan",
      "Expert-level business modeling",
      "Risk analysis & mitigation",
      "Global expansion roadmap",
      "Endorsing body optimization",
      "PDF download",
      "12-hour priority delivery",
      "82+ advanced tools",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Plan",
    price: "£99",
    description: "Everything you need to guarantee approval",
    pages: "80+ pages",
    features: [
      "All Enterprise features",
      "Complete access to all 88 tools",
      "24/7 VIP support",
      "Personal visa strategist",
      "Unlimited revisions",
      "Priority endorsement prep",
      "RFE defense strategy",
      "Appeal strategy planning",
      "1-hour priority delivery",
      "Success guarantee coaching",
    ],
  },
];

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [, setLocation] = useLocation();
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  if (!isOpen) return null;

  const handleSelectTier = (tierId: string) => {
    onClose();
    if (!user) {
      setLocation(`/signup?tier=${tierId}`);
    } else {
      setLocation(`/questionnaire?tier=${tierId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select the tier that best matches your business complexity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            data-testid="button-close-pricing-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative hover-elevate flex flex-col ${
                  tier.popular ? 'border-primary shadow-lg' : ''
                }`}
                data-testid={`card-tier-${tier.id}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="text-xs">{tier.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-xs ml-2">one-time</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{tier.pages}</div>
                </CardHeader>

                <CardContent className="pb-4 flex-1">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSelectTier(tier.id)}
                    data-testid={`button-select-${tier.id}`}
                  >
                    Select
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground bg-secondary/50 rounded-lg p-4">
            <p>All plans include AI-powered generation + comprehensive visa criteria coverage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
