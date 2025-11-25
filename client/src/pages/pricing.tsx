import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createPricingSchema } from "@/lib/seo-schemas";

const tiers = [
  {
    id: "free",
    name: "Free Plan",
    price: "Free",
    description: "Start your Innovator Founder Visa journey",
    pages: "10-15 pages",
    features: [
      "Essential tools access",
      "Basic business overview",
      "Innovation introduction",
      "Essential compliance guide",
      "Application requirements checker",
      "Document organizer",
      "Visa timeline planner",
      "Email support within 48 hours",
    ],
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: "£29",
    description: "Perfect for straightforward businesses",
    pages: "25-35 pages",
    features: [
      "Extended tools access",
      "Core Innovation criteria coverage",
      "Basic Viability analysis",
      "Essential Scalability points",
      "Standard business plan format",
      "Financial projections template",
      "PDF download",
      "48-hour delivery",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "£49",
    description: "Most popular - comprehensive coverage",
    pages: "40-60 pages",
    popular: true,
    features: [
      "Comprehensive tools access",
      "Comprehensive Innovation analysis",
      "Detailed Viability with financials",
      "Advanced Scalability strategy",
      "Industry-specific frameworks",
      "Market research integration",
      "Competitive analysis",
      "Risk mitigation plan",
      "PDF download",
      "24-hour priority delivery",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "£89",
    description: "Maximum detail for complex ventures",
    pages: "50-80 pages",
    features: [
      "Full tools access",
      "Deep-dive Innovation coverage",
      "Complete Viability assessment",
      "Multi-market Scalability plan",
      "Expert-level business modeling",
      "Risk analysis & mitigation",
      "Global expansion roadmap",
      "Endorsing body optimization",
      "IP & patent strategy",
      "PDF download",
      "12-hour priority delivery",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Plan",
    price: "£129",
    description: "Everything you need for guaranteed approval",
    pages: "80+ pages",
    features: [
      "Complete access to 100+ professional-level tools",
      "All Enterprise features included",
      "24/7 VIP support & live chat",
      "Personal visa strategist",
      "Unlimited revisions",
      "Priority endorsement prep",
      "RFE defense strategy",
      "Appeal strategy planning",
      "1-hour rush delivery",
      "Success guarantee coaching",
    ],
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<{ 
    id: string; 
    email: string; 
    displayName?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
  }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const currentTier = user?.subscriptionTier || 'free';

  const handleSelectTier = (tierId: string) => {
    if (!user) {
      setLocation(`/signup?tier=${tierId}`);
    } else {
      setLocation(`/questionnaire?tier=${tierId}`);
    }
  };

  const pricingSchemas = tiers.map(tier => 
    createPricingSchema(tier.name, tier.price, tier.features)
  );

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      ...pricingSchemas
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <SEOHead
        title="Pricing Plans | UK Innovator Founder Visa Assistant - £0 to £129"
        description="Choose from 5 pricing tiers for your UK Innovator Founder Visa application. Free, Basic £29, Premium £49 (most popular), Enterprise £89, Ultimate £129. All plans include 100+ professional-level tools, business plan generation and expert guidance."
        canonical="https://innovatorfoundervisaassistant.co.uk/pricing"
        keywords="UK innovator visa cost, visa application pricing, business plan cost, innovator founder visa fees, visa assistance pricing"
        schema={combinedSchema}
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the tier that best matches your business complexity for your Innovator Founder Visa application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const isCurrentTier = user && tier.id === currentTier;
            return (
              <Card 
                key={tier.id} 
                className={`relative hover-elevate ${tier.popular ? 'border-primary shadow-lg' : ''} ${isCurrentTier ? 'border-green-500 shadow-md' : ''}`}
                data-testid={`card-tier-${tier.id}`}
              >
                {tier.popular && !isCurrentTier && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrentTier && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1" data-testid={`badge-current-tier-${tier.id}`}>
                      Current Plan
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
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include AI-powered generation that answers comprehensive expert framework questions</p>
          <p className="mt-2">Optimized for UK Innovator Founder Visa endorsing body approval • 99.9% target approval rate</p>
        </div>
      </main>
    </div>
  );
}
