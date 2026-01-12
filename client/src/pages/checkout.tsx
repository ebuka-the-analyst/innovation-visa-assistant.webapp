import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, Tag, X, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Gift } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import logoLight from "@assets/official_logo.png";
import logoDark from "@assets/logo_dark.png";

const TIER_PRICING: Record<string, { name: string; price: number; priceDisplay: string; description: string }> = {
  basic: { name: "Basic Plan", price: 2900, priceDisplay: "£29", description: "Perfect for straightforward businesses" },
  premium: { name: "Premium Plan", price: 4900, priceDisplay: "£49", description: "Most popular - comprehensive coverage" },
  enterprise: { name: "Enterprise Plan", price: 8900, priceDisplay: "£89", description: "Maximum detail for complex businesses" },
  ultimate: { name: "Ultimate Plan", price: 12900, priceDisplay: "£129", description: "Everything you need for visa success" },
};

interface PromoValidation {
  valid: boolean;
  message?: string;
  discount?: number;
  discountType?: string;
  grantsTier?: string;
  tierUpgraded?: boolean;
}

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const tier = urlParams.get('tier') || 'premium';
  const tierInfo = TIER_PRICING[tier] || TIER_PRICING.premium;

  const { data: user, isLoading: isLoadingUser } = useQuery<{ 
    id: string; 
    email: string; 
    displayName?: string;
    subscriptionTier?: string;
  }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation(`/login?redirect=/checkout?tier=${tier}`);
    }
  }, [user, isLoadingUser, setLocation, tier]);

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
            
            // Redirect to dashboard after tier upgrade
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

  const calculateFinalPrice = () => {
    if (!promoValidation?.valid || !promoValidation.discount) {
      return tierInfo.price;
    }
    
    if (promoValidation.discountType === 'percentage') {
      return Math.round(tierInfo.price * (1 - promoValidation.discount / 100));
    }
    return Math.max(0, tierInfo.price - promoValidation.discount);
  };

  const finalPrice = calculateFinalPrice();
  const discountAmount = tierInfo.price - finalPrice;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload: { tier: string; promoCode?: string } = { tier };
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
      setIsProcessing(false);
    },
  });

  const handleProceedToPayment = () => {
    setIsProcessing(true);
    checkoutMutation.mutate();
  };

  const clearPromoCode = () => {
    setPromoCode('');
    setPromoValidation(null);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-4">
          <Link href="/pricing">
            <Button variant="ghost" size="sm" data-testid="button-back-pricing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Button>
          </Link>
          <Link href="/">
            <div className="logo-container h-8">
              <img src={logoLight} alt="Logo" className="h-8 w-auto logo-light" loading="lazy" />
              <img src={logoDark} alt="Logo" className="h-8 w-auto logo-dark" loading="lazy" />
            </div>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Complete Your Order</h1>
          <p className="text-muted-foreground">Review your order and apply any promo codes</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                <CardDescription>{tierInfo.description}</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {tierInfo.priceDisplay}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Secure payment via Stripe</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Instant access after payment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Have a promo code?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
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
                  data-testid="input-checkout-promo-code"
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
                        : `£${((promoValidation.discount || 0) / 100).toFixed(2)} discount applied`}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{tierInfo.name}</span>
              <span>£{(tierInfo.price / 100).toFixed(2)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Promo discount</span>
                <span>-£{(discountAmount / 100).toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>£{(finalPrice / 100).toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleProceedToPayment}
              disabled={isProcessing || checkoutMutation.isPending}
              data-testid="button-proceed-payment"
            >
              {isProcessing || checkoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          Payments are processed securely by Stripe.
        </p>
      </main>
    </div>
  );
}
