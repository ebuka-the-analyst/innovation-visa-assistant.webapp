import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Zap, FileText, CreditCard, Gift, Infinity, Users, Heart, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createPricingSchema } from "@/lib/seo-schemas";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TIER_CREDITS, ADDON_PRICING, REFERRAL_REWARDS } from "@/hooks/useTierAccess";
import logoLight from "@assets/official_logo.png";
import logoDark from "@assets/logo_dark.png";

interface PromoValidation {
  valid: boolean;
  message?: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  grantsTier?: string;
  tierUpgraded?: boolean;
}

const tiers = [
  {
    id: "free",
    name: "Free Plan",
    price: "Free",
    priceInPence: 0,
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
    priceInPence: 2900,
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
    priceInPence: 4900,
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
    priceInPence: 8900,
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
    priceInPence: 12900,
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
    price: "£12",
    description: "Generate one additional business plan",
    icon: CreditCard,
    highlight: false,
  },
  {
    id: "triple_pack",
    name: "Triple Credit Pack",
    price: "£29",
    savings: "Save £7",
    description: "3 business plan credits - perfect for iterations",
    icon: Gift,
    highlight: true,
  },
  {
    id: "partner_bundle",
    name: "Partner Bundle",
    price: "£19",
    description: "Plans for you and your co-founder",
    icon: Users,
    highlight: false,
  },
  {
    id: "family_pack",
    name: "Family Pack",
    price: "£49",
    savings: "Save £11",
    description: "5 business plans - ideal for multiple ventures",
    icon: Heart,
    highlight: false,
  },
  {
    id: "ultimate_assurance",
    name: "Ultimate Assurance",
    price: "£35/year",
    description: "Unlimited business plan generations for 1 year",
    icon: Infinity,
    highlight: true,
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  
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

  // Promo code validation
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }
    
    setIsValidatingPromo(true);
    try {
      const validateResponse = await fetch(`/api/promos/validate/${encodeURIComponent(promoCode.trim())}`);
      const validateData = await validateResponse.json();
      
      if (!validateData.valid) {
        setPromoValidation({
          valid: false,
          message: validateData.message,
        });
        return;
      }
      
      // If this is a tier-granting promo code, redeem it immediately
      if (validateData.grantsTier && user) {
        try {
          const redeemResponse = await apiRequest('POST', '/api/promos/redeem', {
            code: promoCode.trim(),
          });
          const redeemData = await redeemResponse.json();
          
          if (redeemData.success && redeemData.tierUpgrade) {
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            
            setPromoValidation({
              valid: true,
              message: redeemData.message,
              grantsTier: redeemData.newTier,
              tierUpgraded: true,
            });
            
            toast({
              title: "Tier Upgraded!",
              description: `You now have ${redeemData.newTier.charAt(0).toUpperCase() + redeemData.newTier.slice(1)} tier access!`,
            });
            setPromoCode('');
            
            setTimeout(() => {
              setLocation('/dashboard');
            }, 2000);
            return;
          }
        } catch (redeemError) {
          console.error('Error redeeming tier promo:', redeemError);
        }
      }
      
      // Regular discount code
      setPromoValidation({
        valid: validateData.valid,
        message: validateData.message,
        discount: validateData.discountValue,
        discountType: validateData.discountType,
        grantsTier: validateData.grantsTier,
      });
      
      if (validateData.valid && validateData.discountValue) {
        toast({
          title: "Promo code applied!",
          description: validateData.discountType === 'percentage' 
            ? `${validateData.discountValue}% discount will be applied`
            : `£${(validateData.discountValue / 100).toFixed(2)} discount will be applied`,
        });
      }
    } catch (error) {
      setPromoValidation({ valid: false, message: 'Failed to validate promo code' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const clearPromoCode = () => {
    setPromoCode('');
    setPromoValidation(null);
  };

  // Calculate discounted price for a tier
  const getDiscountedPrice = (priceInPence: number) => {
    if (!promoValidation?.valid || !promoValidation.discount || priceInPence === 0) {
      return priceInPence;
    }
    
    if (promoValidation.discountType === 'percentage') {
      return Math.round(priceInPence * (1 - promoValidation.discount / 100));
    }
    return Math.max(0, priceInPence - promoValidation.discount);
  };

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

  // Direct subscribe mutation with promo code
  const directSubscribeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const payload: { tier: string; promoCode?: string } = { tier: tierId };
      if (promoValidation?.valid && promoCode.trim()) {
        payload.promoCode = promoCode.trim();
      }
      const response = await apiRequest('POST', '/api/payment/direct-subscribe', payload);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      if (error.promoError) {
        setPromoValidation({ valid: false, message: error.message });
        setPromoCode('');
      }
      toast({
        title: "Error",
        description: error.message || "Failed to proceed to payment",
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

  // Direct subscribe - now processes payment directly with promo code
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

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const isDemoMode = !user;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar demoMode={isDemoMode} />
        <SidebarInset className="flex-1 overflow-auto">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Link href="/">
                <div className="logo-container h-8">
                  <img src={logoLight} alt="Logo" className="h-8 w-auto logo-light" loading="lazy" />
                  <img src={logoDark} alt="Logo" className="h-8 w-auto logo-dark" loading="lazy" />
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isDemoMode && (
                <Link href="/login">
                  <Button size="sm" data-testid="button-login">Sign In</Button>
                </Link>
              )}
            </div>
          </header>
          
          <div className="min-h-screen bg-background">
            <SEOHead
              title="Pricing Plans | UK Innovator Founder Visa Assistant - £0 to £39"
              description="Choose from 5 pricing tiers for your UK Innovator Founder Visa application. Free, Basic £9, Premium £19 (most popular), Enterprise £29, Ultimate £39. All plans include 100+ professional-level tools, business plan generation and expert guidance."
              canonical="https://innovatorfoundervisaassistant.co.uk/pricing"
              keywords="UK Innovator Founder Visa cost, visa application pricing, business plan cost, innovator founder visa fees, visa assistance pricing"
              schema={combinedSchema}
            />
            
            <main className="responsive-container py-10 md:py-12">
              <div className="text-center mb-8 md:mb-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Choose Your Plan</h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Select the tier that best matches your business complexity for your Innovator Founder Visa application
                </p>
              </div>

              {/* Promo Code Section */}
              <div className="max-w-md mx-auto mb-8">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Have a promo code?</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          if (promoValidation) setPromoValidation(null);
                        }}
                        className="uppercase"
                        disabled={promoValidation?.valid}
                        data-testid="input-pricing-promo-code"
                      />
                      {promoValidation?.valid && (
                        <button
                          onClick={clearPromoCode}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-testid="button-clear-promo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={validatePromoCode}
                      disabled={isValidatingPromo || !promoCode.trim() || promoValidation?.valid}
                      data-testid="button-apply-promo"
                    >
                      {isValidatingPromo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {promoValidation && (
                    <div className="mt-3">
                      {promoValidation.valid ? (
                        promoValidation.tierUpgraded ? (
                          <Badge className="bg-emerald-600 text-white">
                            <Gift className="w-3 h-3 mr-1" />
                            {promoValidation.grantsTier?.charAt(0).toUpperCase()}{promoValidation.grantsTier?.slice(1)} tier unlocked! Redirecting...
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            {promoValidation.discountType === 'percentage' 
                              ? `${promoValidation.discount}% discount applied`
                              : `£${((promoValidation.discount || 0) / 100).toFixed(2)} off applied`}
                          </Badge>
                        )
                      ) : (
                        <Badge variant="destructive">
                          <X className="w-3 h-3 mr-1" />
                          {promoValidation.message || 'Invalid code'}
                        </Badge>
                      )}
                    </div>
                  )}
                </Card>
              </div>

        {/* Horizontal scrollable container on mobile/tablet, grid on larger screens */}
        <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 lg:overflow-visible lg:mx-0 lg:px-0">
          <div className="flex gap-4 lg:grid lg:grid-cols-3 xl:grid-cols-5 lg:gap-6 min-w-max lg:min-w-0 max-w-7xl mx-auto">
            {tiers.map((tier) => {
              const isCurrentTier = user && tier.id === currentTier;
              return (
                <Card 
                  key={tier.id} 
                  className={`relative hover-elevate flex-shrink-0 w-72 lg:w-auto ${tier.popular ? 'border-primary shadow-lg' : ''} ${isCurrentTier ? 'border-green-500 shadow-md' : ''}`}
                  data-testid={`card-tier-${tier.id}`}
                >
                  {tier.popular && !isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs whitespace-nowrap">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-green-500 text-white px-3 py-0.5 text-xs whitespace-nowrap" data-testid={`badge-current-tier-${tier.id}`}>
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-lg lg:text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-xs lg:text-sm line-clamp-2">{tier.description}</CardDescription>
                    <div className="mt-3">
                      {tier.priceInPence > 0 && promoValidation?.valid && promoValidation.discount ? (
                        <>
                          <span className="text-xl lg:text-2xl text-muted-foreground line-through mr-2">{tier.price}</span>
                          <span className="text-3xl lg:text-4xl font-bold text-green-600">
                            £{(getDiscountedPrice(tier.priceInPence) / 100).toFixed(0)}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl lg:text-4xl font-bold">{tier.price}</span>
                      )}
                      <span className="text-muted-foreground text-xs ml-1">one-time</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tier.pages} business plan
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3 pt-0">
                    <ul className="space-y-2">
                      {tier.features.slice(0, 6).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs lg:text-sm leading-tight">{feature}</span>
                        </li>
                      ))}
                      {tier.features.length > 6 && (
                        <li className="text-xs text-muted-foreground pl-6">
                          +{tier.features.length - 6} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>

                  <CardFooter className="flex-col gap-2 pt-2">
                    {/* Direct Subscribe Button - Primary action for paid tiers */}
                    {tier.id !== 'free' && !isCurrentTier && (
                      <Button
                        className="w-full"
                        variant={tier.popular ? "default" : "outline"}
                        size="default"
                        onClick={() => handleDirectSubscribe(tier.id)}
                        disabled={processingTier === tier.id || directSubscribeMutation.isPending}
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
                            Subscribe
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* Free tier or Current Plan button */}
                    {(tier.id === 'free' || isCurrentTier) && (
                      <Button
                        className="w-full"
                        variant={tier.popular ? "default" : "outline"}
                        size="default"
                        onClick={() => {
                          if (tier.id === 'free') {
                            setLocation('/questionnaire');
                          }
                        }}
                        disabled={isCurrentTier && tier.id !== 'free'}
                        data-testid={`button-select-${tier.id}`}
                      >
                        {isCurrentTier ? "Current Plan" : "Get Started"}
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
                            Continue Plan
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Create Plan First
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Scroll hint for mobile */}
        <p className="text-xs text-muted-foreground text-center mt-2 lg:hidden">
          Swipe to see all plans
        </p>

        {/* Add-ons Section - Only show for authenticated users */}
        {user && (
          <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">Need More Business Plans?</h2>
              <p className="text-sm lg:text-base text-muted-foreground">
                Purchase additional credits or get unlimited generations
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {addons.map((addon) => {
                const Icon = addon.icon;
                return (
                  <Card 
                    key={addon.id} 
                    className={`relative hover-elevate ${addon.highlight ? 'border-primary' : ''}`}
                    data-testid={`card-addon-${addon.id}`}
                  >
                    {addon.savings && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-green-500 text-white px-2 py-0 text-[10px] lg:text-xs whitespace-nowrap">
                          {addon.savings}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-1 pt-4 px-3 lg:px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                        <CardTitle className="text-sm lg:text-base truncate">{addon.name}</CardTitle>
                      </div>
                      <div className="text-xl lg:text-2xl font-bold">{addon.price}</div>
                    </CardHeader>
                    
                    <CardContent className="pb-2 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">{addon.description}</p>
                    </CardContent>
                    
                    <CardFooter className="pt-1 px-3 lg:px-4 pb-3">
                      <Button
                        className="w-full"
                        variant={addon.highlight ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePurchaseAddon(addon.id)}
                        disabled={processingTier === addon.id || addonMutation.isPending}
                        data-testid={`button-purchase-${addon.id}`}
                      >
                        {processingTier === addon.id && addonMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Buy"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {/* Referral Program */}
            <div className="mt-6 lg:mt-8 text-center p-4 lg:p-6 bg-accent/10 rounded-lg border border-accent/20">
              <Gift className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2 lg:mb-3 text-primary" />
              <h3 className="text-lg lg:text-xl font-semibold mb-1 lg:mb-2">Earn Free Credits</h3>
              <p className="text-sm lg:text-base text-muted-foreground">
                Refer a friend and earn {REFERRAL_REWARDS.creditsPerReferral} free credit when they subscribe
              </p>
            </div>
          </div>
        )}

              <div className="mt-8 lg:mt-12 text-center text-xs lg:text-sm text-muted-foreground px-4">
                <p>All plans include AI-powered generation optimized for UK Innovator Founder Visa approval</p>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
