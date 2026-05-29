import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Global Founder Pricing - Effective May 2026
const tiers = [
  {
    id: "free",
    name: "Free Plan",
    price: "Free",
    description: "Start your Innovator Founder Visa journey",
    pages: "10-15 pages",
    features: [
      "Access to 13 essential tools",
      "Basic business overview",
      "Innovation introduction",
      "Essential compliance checklist",
      "Document organiser",
      "Visa timeline planner",
    ],
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: "£9",
    description: "Perfect for straightforward businesses",
    pages: "25-35 pages",
    features: [
      "Includes 1 business plan coin",
      "Access to 20 tools",
      "Core innovation criteria coverage",
      "Basic viability analysis",
      "Essential scalability points",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "£19",
    description: "Most popular - comprehensive coverage",
    pages: "40-55 pages",
    popular: true,
    features: [
      "Includes 3 business plan coins",
      "Access to 83 tools",
      "Deeper innovation analysis",
      "Viability + financials",
      "Strong scalability strategy",
      "Industry-specific frameworks",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "£35",
    description: "Maximum detail for complex ventures",
    pages: "56-80 pages",
    features: [
      "Includes 6 business plan coins",
      "Access to 109 tools",
      "Full innovation deep-dive",
      "Complete viability assessment",
      "Multi-market scalability strategy",
      "Advanced business modelling",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Plan",
    price: "£49",
    description: "Maximum support for serious founders",
    pages: "80+ pages",
    features: [
      "Includes 12 business plan coins",
      "Access to all 109 tools",
      "Priority support + live chat",
      "Expert-level endorsement preparation",
      "Best for serious iterations",
      "Multiple business angles coverage",
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
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  if (!isOpen) return null;

  const handleSelectTier = (tierId: string) => {
    onClose();
    if (!user) {
      setLocation(`/login?tier=${tierId}`);
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
            <h2 className="text-lg font-bold">Choose Your Plan</h2>
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
                    <span className="text-xl font-bold">{tier.price}</span>
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
