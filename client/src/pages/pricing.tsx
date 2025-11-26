import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";

import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Zap, FileText, CreditCard, Gift, Infinity, Users, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createPricingSchema } from "@/lib/seo-schemas";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TIER_CREDITS, ADDON_PRICING, REFERRAL_REWARDS } from "@/hooks/useTierAccess";

const tiers = [
  {
    id: "free",
    name: "Free Plan",
    price: "Free",
    credits: 0,
    description: "Start your Innovator Founder Visa journey",
    pages: "10-15 pages",
    features: [
      "Essential tools access (13 tools)",
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
    credits: 1,
    description: "Perfect for straightforward businesses",
    pages: "25-35 pages",
    features: [
      "1 business plan credit included",
      "Extended tools access (20 tools)",
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
    credits: 3,
    description: "Most popular - comprehensive coverage",
    pages: "40-60 pages",
    popular: true,
    features: [
      "3 business plan credits included",
      "Comprehensive tools access (83 tools)",
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
    credits: 6,
    description: "Maximum detail for complex ventures",
    pages: "50-80 pages",
    features: [
      "6 business plan credits included",
      "Full tools access (109 tools)",
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
    credits: "unlimited",
    description: "Everything you need for guaranteed approval",
    pages: "80+ pages",
    features: [
      "Unlimited business plan generations",
      "Complete access to 109 professional-level tools",
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

const addons = [
  {
    id: "single_credit",
    name: "Single Credit",
    price: "£39",
    description: "Generate one additional business plan",
    icon: CreditCard,
    highlight: false,
  },
  {
    id: "triple_pack",
    name: "Triple Credit Pack",
    price: "£99",
    savings: "Save £18",
    description: "3 business plan credits - perfect for iterations",
    icon: Gift,
    highlight: true,
  },
  {
    id: "partner_bundle",
    name: "Partner Bundle",
    price: "£59",
    description: "Plans for you and your co-founder",
    icon: Users,
    highlight: false,
  },
  {
    id: "family_pack",
    name: "Family Pack",
    price: "£149",
    savings: "Save £46",
    description: "5 business plans - ideal for multiple ventures",
    icon: Heart,
    highlight: false,
  },
  {
    id: "ultimate_assurance",
    name: "Ultimate Assurance",
    price: "£99/year",
    description: "Unlimited business plan generations for 1 year",
    icon: Infinity,
    highlight: true,
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  
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

  const { data: businessPlans } = useQuery<Array<{
    id: string;
    tier: string;
    status: string;
    createdAt: string;
  }>>({
    queryKey: ['/api/business-plans'],
    enabled: !!user,
  });

  const currentTier = user?.subscriptionTier || 'free';
  
  const latestPlan = businessPlans?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const checkoutMutation = useMutation({
    mutationFn: async ({ planId, newTier }: { planId: string; newTier: string }) => {
      const response = await apiRequest('POST', '/api/payment/create-checkout', { planId });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.skipCheckout) {
        setLocation(data.redirectUrl);
      } else if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
      setProcessingTier(null);
    },
  });

  // Direct subscription mutation - allows immediate payment without questionnaire
  const directSubscribeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const response = await apiRequest('POST', '/api/payment/direct-subscribe', { tier });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription",
        variant: "destructive",
      });
      setProcessingTier(null);
    },
  });

  // Addon purchase mutation
  const addonMutation = useMutation({
    mutationFn: async (addonType: string) => {
      const response = await apiRequest('POST', '/api/credits/purchase-addon', { addonType });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase addon",
        variant: "destructive",
      });
      setProcessingTier(null);
    },
  });

  const handlePurchaseAddon = (addonId: string) => {
    if (!user) {
      setLocation(`/signup?addon=${addonId}`);
      return;
    }
    setProcessingTier(addonId);
    addonMutation.mutate(addonId);
  };

  // Direct subscribe - go straight to payment
  const handleDirectSubscribe = (tierId: string) => {
    if (!user) {
      setLocation(`/signup?tier=${tierId}&direct=true`);
      return;
    }
    setProcessingTier(tierId);
    directSubscribeMutation.mutate(tierId);
  };

  // Full flow with questionnaire
  const handleSelectTier = (tierId: string) => {
    if (!user) {
      setLocation(`/signup?tier=${tierId}`);
      return;
    }

    if (latestPlan && latestPlan.status === 'pending' && latestPlan.tier === tierId) {
      setProcessingTier(tierId);
      checkoutMutation.mutate({ planId: latestPlan.id, newTier: tierId });
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
        keywords="UK Innovator Founder Visa cost, visa application pricing, business plan cost, innovator founder visa fees, visa assistance pricing"
        schema={combinedSchema}
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the tier that best matches your business complexity for your Innovator Founder Visa application
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
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

              <CardFooter className="flex-col gap-2">
                {/* Direct Subscribe Button - Primary action for paid tiers */}
                {tier.id !== 'free' && !isCurrentTier && (
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleDirectSubscribe(tier.id)}
                    disabled={processingTier === tier.id || directSubscribeMutation.isPending || checkoutMutation.isPending}
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    {processingTier === tier.id && directSubscribeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                )}
                
                {/* Free tier or Current Plan button */}
                {(tier.id === 'free' || isCurrentTier) && (
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => tier.id === 'free' ? setLocation('/tools-hub') : undefined}
                    disabled={isCurrentTier && tier.id !== 'free'}
                    data-testid={`button-select-${tier.id}`}
                  >
                    {isCurrentTier ? "Current Plan" : "Access Free Tools"}
                  </Button>
                )}

                {/* Business Plan with Questionnaire - Secondary option */}
                {tier.id !== 'free' && !isCurrentTier && (
                  <Button
                    className="w-full"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectTier(tier.id)}
                    disabled={processingTier === tier.id || checkoutMutation.isPending}
                    data-testid={`button-questionnaire-${tier.id}`}
                  >
                    {processingTier === tier.id && checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : latestPlan && latestPlan.tier === tier.id && latestPlan.status === 'pending' ? (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Continue Pending Plan
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Business Plan First
                      </>
                    )}
                  </Button>
                )}
                
                {tier.id !== 'free' && !isCurrentTier && (
                  <p className="text-xs text-muted-foreground text-center">
                    Subscribe now for instant access, or create a business plan first
                  </p>
                )}
              </CardFooter>
            </Card>
            );
          })}
        </div>

        {/* Add-ons Section - Only show for authenticated users */}
        {user && (
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Need More Business Plans?</h2>
              <p className="text-muted-foreground">
                Purchase additional credits or get unlimited generations with Ultimate Assurance
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {addons.map((addon) => {
                const Icon = addon.icon;
                return (
                  <Card 
                    key={addon.id} 
                    className={`relative hover-elevate ${addon.highlight ? 'border-primary' : ''}`}
                    data-testid={`card-addon-${addon.id}`}
                  >
                    {addon.savings && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-green-500 text-white px-3 py-0.5 text-xs">
                          {addon.savings}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                      </div>
                      <div className="text-2xl font-bold">{addon.price}</div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </CardContent>
                    
                    <CardFooter className="pt-2">
                      <Button
                        className="w-full"
                        variant={addon.highlight ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePurchaseAddon(addon.id)}
                        disabled={processingTier === addon.id || addonMutation.isPending}
                        data-testid={`button-purchase-${addon.id}`}
                      >
                        {processingTier === addon.id && addonMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Purchase"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {/* Referral Program */}
            <div className="mt-8 text-center p-6 bg-accent/10 rounded-lg border border-accent/20">
              <Gift className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Earn Free Credits</h3>
              <p className="text-muted-foreground mb-2">
                Refer a friend and earn {REFERRAL_REWARDS.creditsPerReferral} free business plan credit when they subscribe
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum {REFERRAL_REWARDS.maxCreditsPerMonth} credits per month
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include AI-powered generation that answers comprehensive expert framework questions</p>
          <p className="mt-2">Optimized for UK Innovator Founder Visa endorsing body approval • 99.9% target approval rate</p>
        </div>
      </main>
    </div>
  );
}
