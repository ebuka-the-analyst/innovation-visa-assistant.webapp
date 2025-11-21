import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthHeader } from "@/components/AuthHeader";
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "£49",
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
    price: "£99",
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
    price: "£199",
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
    price: "£299",
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

export default function Pricing() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const handleSelectTier = (tierId: string) => {
    if (!user) {
      setLocation(`/signup?tier=${tierId}`);
    } else {
      setLocation(`/questionnaire?tier=${tierId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {user ? <AuthHeader /> : <Header />}
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the tier that best matches your business complexity and visa application needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative hover-elevate ${tier.popular ? 'border-primary shadow-lg' : ''}`}
              data-testid={`card-tier-${tier.id}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {tier.pages} comprehensive business plan
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSelectTier(tier.id)}
                  data-testid={`button-select-${tier.id}`}
                >
                  Select {tier.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include AI-powered generation that answers all 475 expert framework questions</p>
          <p className="mt-2">Optimized for UK Innovation Visa endorsing body approval • 99.9% target approval rate</p>
        </div>
      </main>
    </div>
  );
}
